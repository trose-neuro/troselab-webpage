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
