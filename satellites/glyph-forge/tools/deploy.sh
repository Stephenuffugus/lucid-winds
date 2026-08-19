#!/usr/bin/env bash
# One-command redeploy. Run this after dropping new art into art-slots/
# (or any change). GitHub Pages rebuilds automatically in ~30–60s.
set -e
cd "$(dirname "$0")/.."
git add -A
if git diff --cached --quiet; then
  echo "Nothing to deploy (no changes)."
  exit 0
fi
git commit -m "${1:-Update content / art}"
git push origin main
echo "Pushed. Live in ~30–60s at: https://stephenuffugus.github.io/glyph_forge/"
