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

# 3) the web manifest is a PWA install thing. A desktop app has no install
#     flow and the tag only produces a missing-file error, so it goes.
s = re.sub(r'<link rel="manifest"[^>]*>\s*', '', s)

# 3b) SEO metadata is dead weight in a desktop app - no crawler will ever read it -
#     and it drags two other companies' trademarks (Frogger, Crossy Road) plus the
#     retired name into a binary that goes to Valve for review. Strip the lot: they
#     exist for the web page, not for Steam.
s = re.sub(r'<meta name="keywords"[^>]*>\s*', '', s)
s = re.sub(r'<meta name="description"[^>]*>\s*', '', s)
s = re.sub(r'<meta (?:property|name)="(?:og|twitter):[^"]*"[^>]*>\s*', '', s)
s = re.sub(r'<link rel="canonical"[^>]*>\s*', '', s)
s = re.sub(r'<script type="application/ld\+json">[\s\S]*?</script>\s*', '', s)
assert 'application/ld+json' not in s, 'structured data survived the strip'
# ⛔ word boundary, not substring: "Froggery" is OUR costume and legitimately
# contains the other name. A naive `'Frogger' in s` flags our own art forever.
assert not re.search(r'\bFrogger\b', s), 'a third-party trademark is still in the Steam build'
assert not re.search(r'\bCrossy Road\b', s), 'a third-party trademark is still in the Steam build'
assert 'Jimothy the Jumping Nugget' not in s, 'the retired name is still in the Steam build'
print('  stripped web-only SEO metadata from the desktop build')

# 4) fonts: drop the three Google Fonts tags for one local stylesheet
s = re.sub(r'<link rel="preconnect" href="https://fonts\.[^>]*>\s*', '', s)
s = re.sub(r'<link href="https://fonts\.googleapis\.com[^>]*>',
           '<link href="fonts/fonts.css" rel="stylesheet">', s)

# 5) Steam owns commerce. Valve does not allow a game to take money on a rail
#    that is not theirs, so every buy, donate and upsell has to be dark. The
#    game reads window.__STEAM_BUILD and hides all of them (STORE_BUILD, the
#    same lever the itch build uses) AND grants the Supporter Pack outright,
#    since a Steam player already paid and hiding it would lock the pack
#    costumes away behind a button the build never draws.
#    ⛔ This flag MUST be set before the game's own scripts run. An earlier
#    version of this script wrote a differently-named flag that nothing read,
#    which looked like a working strip and was not. Hence the assertions.
FLAG = '<script>window.__STEAM_BUILD=true;/* Steam build: no payment surfaces */</script>'
assert '__STEAM_BUILD' in s, 'canonical game no longer reads __STEAM_BUILD — the strip would silently do nothing'
if '<head>' in s:
    s = s.replace('<head>', '<head>\n' + FLAG, 1)
else:
    s = s.replace('<script', FLAG + '\n<script', 1)
assert s.index('window.__STEAM_BUILD=true') < s.index('var STORE_BUILD'), 'flag must be set before the game reads it'

# 6) Firebase lives in the sunbeam SDK, not here. It is neutered separately
#    below, in the vendored copy of the SDK itself.

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
