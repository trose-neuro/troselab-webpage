#!/usr/bin/env python3
from __future__ import annotations

import argparse
import io
import re
from pathlib import Path
from typing import Dict, Iterable, List, Optional
from urllib.parse import quote, unquote, urljoin, urlparse

import pypdfium2 as pdfium
import requests
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CITATIONS_FILE = ROOT / "_data" / "citations.yaml"
OUTPUT_DIR = ROOT / "images" / "citations"
MAPPING_FILE = ROOT / "_data" / "citation-images.yaml"
TIMEOUT = 25
MAX_BYTES = 80 * 1024 * 1024
UNPAYWALL_EMAIL = "contact@troselab.de"


def dedupe(items: Iterable[str]) -> List[str]:
    out: List[str] = []
    seen = set()
    for item in items:
        if not item or item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "paper"


def parse_doi(citation: dict) -> Optional[str]:
    cid = str(citation.get("id", "")).strip()
    if cid.lower().startswith("doi:"):
        return cid.split(":", 1)[1].strip()
    link = str(citation.get("link", "")).strip()
    if "doi.org/" in link:
        return unquote(link.split("doi.org/", 1)[1].split("?", 1)[0]).strip()
    return None


def extract_attr(tag: str, attr: str) -> Optional[str]:
    match = re.search(rf'{attr}\s*=\s*["\']([^"\']+)["\']', tag, flags=re.I)
    return match.group(1).strip() if match else None


def extract_pdf_links_from_html(html: str, base_url: str) -> List[str]:
    links: List[str] = []

    for meta_tag in re.findall(r"<meta[^>]+>", html, flags=re.I):
        name = (extract_attr(meta_tag, "name") or extract_attr(meta_tag, "property") or "").lower()
        content = extract_attr(meta_tag, "content")
        if not content:
            continue
        if "citation_pdf_url" in name:
            links.append(urljoin(base_url, content))

    href_pdf = re.findall(r'href=["\']([^"\']+?\.pdf(?:\?[^"\']*)?)["\']', html, flags=re.I)
    src_pdf = re.findall(r'src=["\']([^"\']+?\.pdf(?:\?[^"\']*)?)["\']', html, flags=re.I)
    links.extend(urljoin(base_url, item) for item in href_pdf + src_pdf)
    return dedupe(links)


def heuristic_pdf_links(landing_url: str) -> List[str]:
    parsed = urlparse(landing_url)
    base = landing_url.split("#", 1)[0].split("?", 1)[0]
    candidates: List[str] = []

    if "biorxiv.org" in parsed.netloc or "medrxiv.org" in parsed.netloc:
        if not base.endswith(".full.pdf"):
            candidates.append(f"{base}.full.pdf")

    if "/doi/full/" in base:
        candidates.append(base.replace("/doi/full/", "/doi/pdf/", 1))
    elif "/doi/" in base and "/doi/pdf/" not in base:
        candidates.append(base.replace("/doi/", "/doi/pdf/", 1))

    if base.endswith("/abstract"):
        candidates.append(base[:-9] + "/pdf")

    return dedupe(candidates)


def is_pdf_bytes(data: bytes) -> bool:
    head = data[:1024]
    return b"%PDF" in head


def fetch_bytes(session: requests.Session, url: str, *, accept_pdf: bool = True) -> Optional[bytes]:
    headers = {"User-Agent": session.headers.get("User-Agent", "Mozilla/5.0")}
    if accept_pdf:
        headers["Accept"] = "application/pdf,application/octet-stream;q=0.9,*/*;q=0.8"

    try:
        response = requests.get(url, timeout=TIMEOUT, allow_redirects=True, stream=True, headers=headers)
    except requests.RequestException:
        return None

    chunks: List[bytes] = []
    size = 0
    try:
        for chunk in response.iter_content(chunk_size=65536):
            if not chunk:
                continue
            size += len(chunk)
            if size > MAX_BYTES:
                return None
            chunks.append(chunk)
    finally:
        response.close()

    data = b"".join(chunks)
    if not data:
        return None

    content_type = response.headers.get("content-type", "").lower()
    if "pdf" in content_type or is_pdf_bytes(data):
        index = data.find(b"%PDF")
        return data[index:] if index > 0 else data
    return None


def crossref_pdf_candidates(session: requests.Session, doi: str) -> List[str]:
    api_url = f"https://api.crossref.org/works/{quote(doi, safe='')}"
    try:
        response = session.get(api_url, timeout=TIMEOUT)
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError):
        return []

    links = payload.get("message", {}).get("link", []) or []
    out: List[str] = []
    for link in links:
        url = str(link.get("URL", "")).strip()
        ctype = str(link.get("content-type", "")).lower()
        if not url:
            continue
        if "pdf" in ctype or ".pdf" in url.lower():
            out.append(url)
    return dedupe(out)


def unpaywall_candidates(session: requests.Session, doi: str) -> List[str]:
    api_url = f"https://api.unpaywall.org/v2/{quote(doi, safe='')}?email={quote(UNPAYWALL_EMAIL, safe='')}"
    try:
        response = session.get(api_url, timeout=TIMEOUT)
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError):
        return []

    candidates: List[str] = []
    locations = []
    best = payload.get("best_oa_location")
    if best:
        locations.append(best)
    locations.extend(payload.get("oa_locations") or [])

    for location in locations:
        pdf_url = str(location.get("url_for_pdf", "")).strip()
        page_url = str(location.get("url", "")).strip()
        if pdf_url:
            candidates.append(pdf_url)
        if page_url:
            candidates.append(page_url)
    return dedupe(candidates)


def resolve_landing(session: requests.Session, doi: str) -> tuple[Optional[str], Optional[str]]:
    doi_url = f"https://doi.org/{quote(doi, safe='')}"
    try:
        response = session.get(
            doi_url,
            timeout=TIMEOUT,
            allow_redirects=True,
            headers={"Accept": "text/html,application/xhtml+xml,*/*;q=0.8"},
        )
    except requests.RequestException:
        return None, None

    landing_url = response.url
    content_type = response.headers.get("content-type", "").lower()
    if "html" in content_type:
        return landing_url, response.text
    return landing_url, None


def doi_accept_pdf_candidate(session: requests.Session, doi: str) -> Optional[str]:
    doi_url = f"https://doi.org/{quote(doi, safe='')}"
    try:
        response = session.get(
            doi_url,
            timeout=TIMEOUT,
            allow_redirects=True,
            headers={"Accept": "application/pdf"},
        )
    except requests.RequestException:
        return None
    if "pdf" in response.headers.get("content-type", "").lower() or response.content[:1024].find(b"%PDF") >= 0:
        return response.url
    return None


def render_thumbnail(pdf_data: bytes, out_path: Path) -> bool:
    try:
        document = pdfium.PdfDocument(pdf_data)
        if len(document) == 0:
            return False
        page = document[0]
        bitmap = page.render(scale=2.0)
        image = bitmap.to_pil()
    except Exception:
        return False

    image = image.convert("RGB")
    crop_height = max(1, image.height // 3)
    image = image.crop((0, 0, image.width, crop_height))

    target_width = 260
    if image.width > target_width:
        target_height = max(1, int(image.height * (target_width / image.width)))
        image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(out_path, format="JPEG", quality=82, optimize=True, progressive=True)
    return True


def build_candidates(
    session: requests.Session, doi: Optional[str], citation_link: Optional[str]
) -> List[str]:
    candidates: List[str] = []

    if citation_link and ".pdf" in citation_link.lower():
        candidates.append(citation_link)

    if doi:
        if doi.startswith("10.1101/"):
            for host in ("www.biorxiv.org", "www.medrxiv.org"):
                candidates.append(f"https://{host}/content/{doi}.full.pdf")
                for version in range(1, 9):
                    candidates.append(f"https://{host}/content/{doi}v{version}.full.pdf")

        candidates.extend(unpaywall_candidates(session, doi))
        candidates.extend(crossref_pdf_candidates(session, doi))
        doi_pdf = doi_accept_pdf_candidate(session, doi)
        if doi_pdf:
            candidates.append(doi_pdf)
        landing_url, landing_html = resolve_landing(session, doi)
        if landing_html and landing_url:
            candidates.extend(extract_pdf_links_from_html(landing_html, landing_url))
        if landing_url:
            candidates.extend(heuristic_pdf_links(landing_url))

    return dedupe(candidates)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate publication thumbnails from PDF first pages.")
    parser.add_argument("--limit", type=int, default=0, help="Optional maximum number of citations to process.")
    parser.add_argument("--refresh", action="store_true", help="Regenerate thumbnails even if they already exist.")
    args = parser.parse_args()

    citations = yaml.safe_load(CITATIONS_FILE.read_text(encoding="utf-8")) or []
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0",
        }
    )

    mapping: Dict[str, dict] = {}
    processed = 0
    generated = 0

    for citation in citations:
        cid = str(citation.get("id", "")).strip()
        title = str(citation.get("title", "")).strip()
        if not cid:
            continue

        processed += 1
        if args.limit and processed > args.limit:
            break

        doi = parse_doi(citation)
        citation_link = str(citation.get("link", "")).strip() or None
        slug_source = doi or cid or title
        out_name = f"{slugify(slug_source)}.jpg"
        out_rel = Path("images") / "citations" / out_name
        out_path = ROOT / out_rel

        if out_path.exists() and not args.refresh:
            mapping[cid] = {"image": out_rel.as_posix()}
            print(f"[skip] {cid} (already exists)")
            continue

        candidates = build_candidates(session, doi, citation_link)
        if not candidates:
            print(f"[miss] {cid} (no pdf candidates)")
            continue

        pdf_bytes = None
        used_pdf_url = None
        for candidate in candidates:
            pdf_bytes = fetch_bytes(session, candidate)
            if pdf_bytes:
                used_pdf_url = candidate
                break

        if not pdf_bytes:
            print(f"[miss] {cid} (no reachable pdf)")
            continue

        if not render_thumbnail(pdf_bytes, out_path):
            print(f"[miss] {cid} (render failed)")
            continue

        generated += 1
        mapping[cid] = {"image": out_rel.as_posix(), "pdf": used_pdf_url}
        print(f"[ok]   {cid}")

    with MAPPING_FILE.open("w", encoding="utf-8") as handle:
        handle.write("# GENERATED FILE: publication thumbnail mappings\n")
        yaml.safe_dump(mapping, handle, sort_keys=True, allow_unicode=True)

    print(f"\nProcessed: {processed}")
    print(f"Generated/available thumbnails: {len(mapping)}")
    print(f"Newly generated in this run: {generated}")
    print(f"Wrote mapping: {MAPPING_FILE}")


if __name__ == "__main__":
    main()
