#!/usr/bin/env bash
# Rebuild the Hostinger / static-host deploy package from the current source.
# Run this after any change you want the user to be able to upload & test-play.
# Output: dist/ (uploadable folder) + glyph-forge-hostinger.zip (uploadable zip)
set -e
cd "$(dirname "$0")/.."
rm -rf dist glyph-forge-hostinger.zip
mkdir -p dist/art-slots
cp index.html manifest.json sw.js dist/
cp art-slots/.gitkeep dist/art-slots/ 2>/dev/null || touch dist/art-slots/.gitkeep
cp tools/HOSTINGER-UPLOAD.md dist/ 2>/dev/null || true
( cd dist && zip -qr ../glyph-forge-hostinger.zip . )
echo "Packed dist/ + glyph-forge-hostinger.zip ($(du -h glyph-forge-hostinger.zip | cut -f1))"
