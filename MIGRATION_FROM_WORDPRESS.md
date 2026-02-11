# Replacing WordPress with a Self-Hosted Static Site

This is the practical cutover plan from the current WordPress site to a static, non-WordPress setup.

## Target architecture

- Source of truth: GitHub repository (`troselab-webpage`)
- Build system: Jekyll CI build
- Hosting: static files on your own server (Nginx or Caddy)
- DNS: `www.troselab.de` points to static host

## Phase 1: Content freeze and export

1. Freeze changes on the WordPress site (editorial pause window).
2. Export content from WordPress:
   - Pages
   - Posts/news
   - Media library
3. Capture URL inventory from old site (for redirects).

## Phase 2: Content mapping

Map old routes to new routes:
- `/current_research/current-research/` -> `/research/`
- `/publication/` -> `/publications/`
- `/member/` -> `/team/`
- `/cv/prof-dr-tobias-rose/` -> `/contact/` (and/or `/team/tobias-rose/`)

## Phase 3: Build and validate

1. Local preview:
   ```bash
   bundle install
   bundle exec jekyll serve --livereload
   ```
2. Validate:
   - navigation links
   - mobile layout
   - publication links
   - team profile pages
   - contact details

## Phase 4: Self-host static deployment

Option A: Nginx on your server

1. Build site:
   ```bash
   bundle exec jekyll build
   ```
2. Sync `_site/` to server web root (e.g. `/var/www/troselab`).
3. Nginx server block serves static files from that directory.

Option B: Netlify/Cloudflare Pages + custom domain

- Connect repo
- Build command: `bundle exec jekyll build`
- Publish dir: `_site`
- Configure custom domain `www.troselab.de`

## Phase 5: Redirects and cutover

1. Add 301 redirects for legacy WordPress URLs.
2. Lower DNS TTL before cutover.
3. Point DNS to new host.
4. Monitor for 404s and patch routes.

## Minimal Nginx example

```nginx
server {
    listen 80;
    server_name www.troselab.de troselab.de;
    root /var/www/troselab;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## Recommended governance after launch

- Use PR-based review for all content updates.
- Keep one maintainer checklist for each release:
  - link checks
  - spelling pass
  - contact correctness
  - publication updates
- Keep credentials and deployment keys outside the repo.
