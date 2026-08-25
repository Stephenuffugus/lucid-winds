#!/usr/bin/env bash
# Re-vendor the Steam bundle from the canonical game.
# ⚠️ FORK WARNING: app/ is a COPY. Run this before every SteamPipe upload or
# Steam players get a stale build.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/../../satellites/flock-the-world"
APP="$HERE/app"

rm -rf "$APP"; mkdir -p "$APP"

# Runtime only: the game file, its art, its sound. art-drop/ is SOURCE sheets
# and never loads at runtime; the docs stay out of a paid depot.
cp "$SRC/index.html" "$APP/index.html"
cp -r "$SRC/art" "$APP/art"
cp -r "$SRC/sfx" "$APP/sfx"

python3 - "$APP/index.html" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

# 1) the beta dev gate is a web thing; a paying player never sees a gate
s = re.sub(r'<script src="/dev-gate\.js[^"]*"></script>\s*', '', s)
assert 'dev-gate' not in s, 'dev gate survived the strip'

# 2) no service worker in a desktop build (splash-hang class of bug, no point)
s = re.sub(r"navigator\.serviceWorker\.register\([^)]*\)", "Promise.resolve({scope:'desktop'})", s)

# 3) PWA manifest + icons are web install plumbing; the tags only 404 here
s = re.sub(r'<link rel="manifest"[^>]*>\s*', '', s)

# 4) the desktop flag: hides the Back-to-Sky-Wolf portal button (the game
#    checks window.__DESKTOP_BUILD). Must land before the game's scripts.
FLAG = '<script>window.__DESKTOP_BUILD=true;/* Steam build: no portal surfaces */</script>'
assert '__DESKTOP_BUILD' in s, 'canonical game no longer reads __DESKTOP_BUILD - the strip would silently do nothing'
s = s.replace('<head>', '<head>\n' + FLAG, 1)
assert s.index('window.__DESKTOP_BUILD=true') < s.index('SWS_EXIT'), 'flag must be set before the embed block reads it'

open(p, 'w', encoding='utf-8').write(s)
print('  rewrote index.html for the desktop build')
PY

echo "vendored $(du -sh "$APP" | cut -f1) into app/"
echo "⚠️  app/ is a copy of satellites/flock-the-world. Re-run before every upload."
