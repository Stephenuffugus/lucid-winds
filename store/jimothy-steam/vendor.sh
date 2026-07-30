#!/usr/bin/env bash
# Re-vendor the Steam bundle from the canonical game.
# ⚠️ FORK WARNING: app/ is a COPY. Run this before every SteamPipe upload or
# Steam players get a stale Jimothy. See VENDORED.md.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/../../satellites/stream-hop"
APP="$HERE/app"

rm -rf "$APP"; mkdir -p "$APP"

# Runtime only. The art-drop*/art-sheets/music-drop folders are SOURCE sheets
# and never load at runtime; shipping them would quadruple the depot.
cp "$SRC/index.html" "$APP/index.html"
cp -r "$SRC/assets" "$APP/assets"

# The one root-absolute reference in the whole file. Vendor it and make it
# relative, so the game boots with no network at all (Steam review machines
# may be offline, and a Steam build must never depend on our host).
cp "$HERE/../../sunbeam-sdk.js" "$APP/sunbeam-sdk.js"

# Fonts and Firebase are the only two things this game reaches out for, and a
# desktop build must not. The fonts are vendored (same woff2 files Google
# serves) so the game LOOKS right offline; Firebase is skipped entirely, since
# a Steam build has no accounts and no cloud save.
mkdir -p "$APP/fonts"
cp "$HERE/fonts/"*.woff2 "$HERE/fonts/fonts.css" "$APP/fonts/"
python3 - "$APP/index.html" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

# 1) the absolute SDK reference -> relative
s = s.replace('src="/sunbeam-sdk.js', 'src="sunbeam-sdk.js')

# 2) no service worker in a desktop build: it caches nothing useful here and
#    the splash-hang class of bug is not worth inheriting.
s = re.sub(r'navigator\.serviceWorker\.register\([^)]*\)', 'Promise.resolve({scope:"desktop"})', s)

# 3) Steam owns commerce. The supporter pack and every tip route are stripped
#    from the desktop build rather than left pointing at a web checkout.
s = s.replace('<!--STEAM_STRIP_START-->', '').replace('<!--STEAM_STRIP_END-->', '')

# 3b) the web manifest is a PWA install thing. A desktop app has no install
#     flow and the tag only produces a missing-file error, so it goes.
s = re.sub(r'<link rel="manifest"[^>]*>\s*', '', s)

# 4) fonts: drop the three Google Fonts tags for one local stylesheet
s = re.sub(r'<link rel="preconnect" href="https://fonts\.[^>]*>\s*', '', s)
s = re.sub(r'<link href="https://fonts\.googleapis\.com[^>]*>',
           '<link href="fonts/fonts.css" rel="stylesheet">', s)

# 5) Firebase lives in the sunbeam SDK, not here. It is neutered separately
#    below, in the vendored copy of the SDK itself.
s = s.replace('window.STEAM_BUILD=false', 'window.STEAM_BUILD=true')
if 'window.STEAM_BUILD' not in s:
    s = s.replace('<script>', '<script>window.STEAM_BUILD=true;</script>\n<script>', 1)

open(p, 'w', encoding='utf-8').write(s)
print('  rewrote index.html for the desktop build')
PY

# The sunbeam SDK lazy loads Firebase from gstatic to sync earnings to a cloud
# account. A Steam build has no account and may be run with no network at all,
# so the loader is short circuited in the vendored copy. Earning still works;
# it just stays on the machine, which is what a desktop player expects.
python3 - "$APP/sunbeam-sdk.js" <<'PY2'
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
# Short circuit the loader itself rather than mangling the URL: a bad URL still
# gets appended as a script tag and still logs a console error, which a Steam
# reviewer would see in the devtools they sometimes open.
s = s.replace("  function _ensureFirebaseCompat(){",
              "  function _ensureFirebaseCompat(){\n"
              "    /* desktop build: there is no cloud account here, so never fetch the\n"
              "       compat SDK. Callers already handle a rejection as offline. */\n"
              "    return Promise.reject(new Error('cloud sync is off in the desktop build'));")
open(p, 'w', encoding='utf-8').write(s)
print('  neutered the cloud loader in the vendored SDK')
PY2

echo "vendored $(du -sh "$APP" | cut -f1) into app/"
echo "⚠️  app/ is a copy of satellites/stream-hop. Re-run before every upload."
