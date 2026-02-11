# troselab-webpage

Draft replacement for the legacy WordPress-based Troselab website.

This repository is scaffolded from [greenelab/lab-website-template](https://github.com/greenelab/lab-website-template) and adapted with current content from:
- [www.troselab.de](https://www.troselab.de)
- [rose-group.ieecr-bonn.de/current_research/current-research](http://rose-group.ieecr-bonn.de/current_research/current-research/)
- [rose-group.ieecr-bonn.de/member](http://rose-group.ieecr-bonn.de/member/)
- [rose-group.ieecr-bonn.de/publication](http://rose-group.ieecr-bonn.de/publication/)

## Why this stack

- Purpose-built for research labs
- Markdown-first content editing
- Git-based review + versioning
- Easy static deployment (GitHub Pages, Netlify, self-hosted Nginx)
- Good publication/content primitives

See:
- `TEMPLATE_COMPARISON.md`
- `MIGRATION_FROM_WORDPRESS.md`

## Quick start

Prerequisite:
- Ruby `>= 3.0` (Gemfile.lock currently expects Bundler `2.5.6`)

```bash
bundle install
bundle exec jekyll serve --livereload
```

Open:
- http://localhost:4000

## Current structure

- `index.md` homepage
- `research/` research themes
- `publications/` selected publications
- `team/` members and alumni
- `projects/` resources
- `blog/` news
- `contact/` contact details
- `_members/` member profiles
- `_data/projects.yaml` resource cards

## Deployment options

- GitHub Pages (simplest managed hosting)
- Netlify (preview builds and easy domain wiring)
- Self-hosted static (Nginx/Caddy + rsync/CI deploy)

Recommended production flow:
1. Keep editing here in Git.
2. Build static output with CI.
3. Serve built files from your own server.
4. Point `www.troselab.de` DNS to the new target after validation.
