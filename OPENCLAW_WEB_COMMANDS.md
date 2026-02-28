# OpenClaw Website Ops Guide (troselab-webpage)

This file is the execution map for fast website edits via chat commands.

## Deployment model
- Push to `main` triggers `.github/workflows/on-push.yaml`
- Pipeline runs citation update + site build
- Build commits `_site` to `gh-pages` via `build-site.yaml`
- Site goes live automatically (GitHub Pages)

## Where to edit what

### Global site settings
- `_config.yaml`
  - title/subtitle/description
  - social links
  - featured news toggles

### Homepage
- `index.md`

### News posts
- `_posts/YYYY-MM-DD-title.md`
- Helper: `tools/new_news_post.py "Title"`

### Team members
- `_members/*.md`

### Static pages
- `research/index.md`
- `publications/index.md`
- `projects/index.html`
- `contact/index.md`
- `recruitment/index.md`

### Visual/layout
- `_layouts/*.html`
- `_includes/*.html`
- `_styles/*.scss`
- `_scripts/*.js`

### Images/assets
- source assets: `images/`
- optimized assets pipeline: `tools/optimize_images.py`

## Safe change workflow (for OpenClaw)
1. Make minimal targeted file edits.
2. Run local preflight checks:
   - `bundle exec jekyll build`
3. If images changed:
   - `python3 tools/optimize_images.py`
4. Commit with clear message.
5. Push to `main`.
6. Verify workflow success in GitHub Actions.

## Command patterns you can give me
- "Add a news post: <title>"
- "Update team page: add/remove/edit member <name>"
- "Change homepage hero text to ..."
- "Update contact info/social links"
- "Add publication/news card"
- "Adjust spacing/font/color in header/footer/cards"
- "Fix mobile layout issue on <page>"

## Guardrails
- Avoid broad refactors unless requested.
- Keep URL slugs stable where possible.
- Validate build before push.
- For content edits, preserve existing front matter keys.
