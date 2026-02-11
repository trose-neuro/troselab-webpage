Visit **[trose-neuro.github.io/troselab-webpage](https://trose-neuro.github.io/troselab-webpage)** 🚀

# troselab-webpage

Draft replacement for the legacy WordPress-based Troselab website.

Live site:
- [https://trose-neuro.github.io/troselab-webpage/](https://trose-neuro.github.io/troselab-webpage/)

This repository is scaffolded from [greenelab/lab-website-template](https://github.com/greenelab/lab-website-template) and adapted with current content from:
- [www.troselab.de](https://www.troselab.de)
- [rose-group.ieecr-bonn.de/current_research/current-research](http://rose-group.ieecr-bonn.de/current_research/current-research/)
- [rose-group.ieecr-bonn.de/member](http://rose-group.ieecr-bonn.de/member/)
- [rose-group.ieecr-bonn.de/publication](http://rose-group.ieecr-bonn.de/publication/)

## Upstream lineage

- Template upstream: [greenelab/lab-website-template](https://github.com/greenelab/lab-website-template)
- This repo tracks that source as git remote `template-upstream`.
- Main publish target for this project: [trose-neuro/troselab-webpage](https://github.com/trose-neuro/troselab-webpage)

## Quick start

Prerequisite:
- Ruby `3.3.6` (see `.ruby-version`)
- Bundler `2.5.6` (from `Gemfile.lock`)

```bash
rbenv local 3.3.6
gem install bundler -v 2.5.6
bundle _2.5.6_ install
bundle exec jekyll serve --livereload
```

Open:
- http://localhost:4000

## Automatic Google Scholar Sync

This repository includes automatic citation sync from your Google Scholar profile.

Setup:
1. Keep your Google Scholar user id in `_data/google-scholar.yaml`:
   - `gsid: 7qngqfIAAAAJ`
2. Add a repository secret named `GOOGLE_SCHOLAR_API_KEY` (SerpAPI key).

How it works:
- `.github/workflows/on-schedule.yaml` runs daily.
- `.github/workflows/update-citations.yaml` regenerates `_data/citations.yaml` and commits changes automatically.
- The publications page reads from that generated citations file.
- Rendering hides duplicate preprint/final pairs when both share the same normalized title, keeping the best final journal entry.

## Image Optimization Pipeline

Large banner and project images are optimized into responsive JPG/WebP variants.

Run locally:
```bash
python3 -m pip install --upgrade --requirement tools/requirements.txt
python3 tools/optimize_images.py
```

Generated outputs:
- `images/optimized/banner/*`
- `images/optimized/miini2prose-*`

Automation:
- `.github/workflows/optimize-images.yaml` runs on pushes that change source images or optimization tooling and commits updated optimized files.

## One-Command News Posts

Create a dated news post template with one command:

```bash
./tools/new_news_post.py "Your news title"
```

This creates `_posts/YYYY-MM-DD-your-news-title.md` with front matter and starter content.

Optional flags:
- `--tags "news,publication"`
- `--author "Your Name"`
- `--date YYYY-MM-DD`
- `--slug custom-slug`

## PR Quality Gates

Pull requests now run automated quality checks:
- link check on generated `_site` HTML
- accessibility/contrast checks (Axe, including color-contrast)
- dark/light screenshot diff with artifact upload

Workflow files:
- `.github/workflows/quality-gates.yaml`
- `.github/workflows/on-pull-request.yaml`

## Featured News On Homepage

Homepage now includes an optional Featured News block showing latest posts.

Toggle in `_config.yaml`:
```yaml
featured_news:
  enabled: true
  limit: 3
```
