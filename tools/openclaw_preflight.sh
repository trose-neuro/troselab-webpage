#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[1/2] Jekyll build"
bundle exec jekyll build >/tmp/troselab-jekyll-build.log 2>&1 || {
  echo "Build failed. See /tmp/troselab-jekyll-build.log"
  exit 1
}

echo "[2/2] Quick sanity checks"
test -d _site || { echo "_site missing"; exit 1; }

echo "Preflight OK"
