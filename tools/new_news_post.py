#!/usr/bin/env python3
"""
Create a new dated news post template in _posts.
Usage:
  ./tools/new_news_post.py "Your news title"
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "_posts"


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "news-update"


def detect_author() -> str:
    try:
        result = subprocess.run(
            ["git", "config", "user.name"],
            check=False,
            capture_output=True,
            text=True,
            cwd=ROOT,
        )
        author = result.stdout.strip()
        return author or "Tobias Rose"
    except Exception:
        return "Tobias Rose"


def build_content(title: str, author: str, tags: list[str]) -> str:
    tag_lines = "\n".join([f"  - {tag}" for tag in tags])
    return f"""---
title: {title}
author: {author}
tags:
{tag_lines}
---

Short update summary here.
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a new news post template.")
    parser.add_argument("title", help="Post title")
    parser.add_argument("--slug", help="Optional custom slug")
    parser.add_argument("--date", help="Date in YYYY-MM-DD (default: today)")
    parser.add_argument(
        "--tags",
        default="news",
        help="Comma-separated tags (default: news)",
    )
    parser.add_argument(
        "--author",
        default=None,
        help="Author name (default: git user.name or Tobias Rose)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite file if it already exists",
    )
    args = parser.parse_args()

    date = dt.date.today()
    if args.date:
        date = dt.date.fromisoformat(args.date)

    slug = slugify(args.slug or args.title)
    author = args.author or detect_author()
    tags = [tag.strip() for tag in args.tags.split(",") if tag.strip()]
    if not tags:
        tags = ["news"]

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    out_file = POSTS_DIR / f"{date.isoformat()}-{slug}.md"

    if out_file.exists() and not args.force:
        raise SystemExit(f"File already exists: {out_file}")

    out_file.write_text(build_content(args.title, author, tags), encoding="utf-8")
    print(out_file.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
