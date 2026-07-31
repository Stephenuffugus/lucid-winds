#!/usr/bin/env bash
# Build the itch.io HTML5 zip for Jimothy.
#
#   ./build.sh          -> dist/jimothy-itch.zip, ready to upload
#
# itch serves an uploaded zip straight into an iframe, so index.html must sit at
# the ROOT of the zip and every path inside it must be relative. That is the one
# hard requirement and the one that breaks builds.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/../../satellites/stream-hop"
OUT="$HERE/dist"
STAGE="$OUT/stage"

rm -rf "$STAGE" && mkdir -p "$STAGE"

# Runtime only. art-drop*/art-sheets/music-drop are SOURCE sheets that never load
# at runtime; shipping them would quadruple the upload for no player benefit.
cp "$SRC/index.html" "$STAGE/index.html"
cp -r "$SRC/assets" "$STAGE/assets"
cp "$HERE/../../sunbeam-sdk.js" "$STAGE/sunbeam-sdk.js"

python3 - "$STAGE/index.html" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

# 1) ⛔ THE ITCH RULE: everything must be relative. The one root-absolute
#    reference in the whole game is the sunbeam SDK, and an absolute path inside
#    an itch iframe resolves against itch.io and 404s.
s = s.replace('src="/sunbeam-sdk.js', 'src="sunbeam-sdk.js')

# 2) itch owns the payment rail, so every buy, donate and upsell goes dark. The
#    game already has this lever; we only have to set it before its scripts run.
FLAG = '<script>window.__ITCH_BUILD=true;/* itch build: itch owns commerce */</script>'
assert '__ITCH_BUILD' in s, 'canonical game no longer reads __ITCH_BUILD'
s = s.replace('<head>', '<head>\n' + FLAG, 1)
assert s.index('window.__ITCH_BUILD=true') < s.index('var STORE_BUILD'), 'flag must precede the read'

# 3) No service worker inside somebody else's iframe. A SW scoped to an itch
#    asset host is a support ticket waiting to happen, and the splash-hang bug
#    class is not worth inheriting for a page that is already online.
s = re.sub(r'navigator\.serviceWorker\.register\([^)]*\)', 'Promise.resolve({scope:"itch"})', s)

# 4) The PWA manifest is meaningless in an iframe and only produces a 404.
s = re.sub(r'<link rel="manifest"[^>]*>\s*', '', s)

open(p, 'w', encoding='utf-8').write(s)
print('  rewrote index.html for itch')
PY

mkdir -p "$OUT"
( cd "$STAGE" && zip -qr "$OUT/jimothy-itch.zip" . )
echo "built $OUT/jimothy-itch.zip  ($(du -h "$OUT/jimothy-itch.zip" | cut -f1))"
echo "⚠️  re-run this before every upload: STAGE is a COPY of satellites/stream-hop"
