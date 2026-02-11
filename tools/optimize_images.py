#!/usr/bin/env python3
"""
Generate optimized JPG and WebP variants for selected site images.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "images"
OUTPUT_ROOT = IMAGE_ROOT / "optimized"
# Optimize every image actively rendered by site components/pages.
SOURCE_PATTERNS = (
    "images/banner/*.jpg",
    "images/logo.jpg",
    "images/mini2p.jpg",
    "images/members/*_portrait.jpg",
    "images/members/*_landscape.jpg",
    "images/members/DSC_0137.jpg",
    "images/members/DSC_0149.jpg",
    "images/members/DSC_0177.jpg",
    "images/members/DSC_0185.jpg",
    "images/members/DSC_0189.jpg",
    "images/collaborators/*",
)
TARGET_WIDTHS = (480, 960, 1280, 1500, 1600, 2200)


def iter_sources(patterns: Iterable[str]) -> list[Path]:
    sources: list[Path] = []
    for pattern in patterns:
        sources.extend(ROOT.glob(pattern))
    return sorted({path.resolve() for path in sources if path.is_file()})


def target_widths(source_width: int) -> list[int]:
    widths = sorted({w for w in TARGET_WIDTHS if w <= source_width})
    if not widths:
        widths = [source_width]
    return widths


def output_stem(source: Path) -> Path:
    relative = source.relative_to(IMAGE_ROOT)
    return (OUTPUT_ROOT / relative).with_suffix("")


def is_up_to_date(source: Path, target: Path) -> bool:
    return target.exists() and target.stat().st_mtime >= source.stat().st_mtime


def optimize_image(source: Path, force: bool) -> tuple[int, int, int]:
    generated = 0
    skipped = 0
    removed = 0

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        src_w, src_h = image.size
        stem = output_stem(source)
        stem.parent.mkdir(parents=True, exist_ok=True)
        widths = target_widths(src_w)
        expected_outputs: set[Path] = set()

        for width in widths:
            height = round((width / src_w) * src_h)
            resized = image if width == src_w else image.resize((width, height), Image.Resampling.LANCZOS)

            jpg_target = stem.with_name(f"{stem.name}-{width}.jpg")
            webp_target = stem.with_name(f"{stem.name}-{width}.webp")
            expected_outputs.add(jpg_target)
            expected_outputs.add(webp_target)

            if not force and is_up_to_date(source, jpg_target) and is_up_to_date(source, webp_target):
                skipped += 2
                continue

            resized.save(
                jpg_target,
                format="JPEG",
                quality=82,
                optimize=True,
                progressive=True,
            )
            resized.save(
                webp_target,
                format="WEBP",
                quality=80,
                method=6,
            )
            generated += 2

    for candidate in stem.parent.glob(f"{stem.name}-*.jpg"):
        if candidate not in expected_outputs:
            candidate.unlink()
            removed += 1
    for candidate in stem.parent.glob(f"{stem.name}-*.webp"):
        if candidate not in expected_outputs:
            candidate.unlink()
            removed += 1

    return generated, skipped, removed


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate optimized site image variants.")
    parser.add_argument("--force", action="store_true", help="Regenerate all optimized files.")
    args = parser.parse_args()

    sources = iter_sources(SOURCE_PATTERNS)
    if not sources:
        print("No source images found.")
        return 0

    total_generated = 0
    total_skipped = 0
    total_removed = 0

    for source in sources:
        generated, skipped, removed = optimize_image(source, args.force)
        total_generated += generated
        total_skipped += skipped
        total_removed += removed
        print(f"{source.relative_to(ROOT)}: generated={generated} skipped={skipped} removed={removed}")

    print(f"Done. generated={total_generated} skipped={total_skipped} removed={total_removed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
