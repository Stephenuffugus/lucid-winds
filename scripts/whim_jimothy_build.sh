#!/bin/bash
# Build the Whim marketplace editions of Jumping Jimothy (2026-08-21).
# Produces dist/jimothy-whim.zip (paid, $3) and dist/jimothy-whim-demo.zip
# (free demo: first five Adventure levels, attach to the paid listing).
# Whim caps browser apps at 50MB, so the asset tree goes through pngquant
# and a webp-under-.png-names pass (browsers decode by magic bytes) and the
# music re-encodes at 96k. satellites/stream-hop on disk is never touched.
set -e
cd "$(dirname "$0")/.."
SRC=satellites/stream-hop
OUT=dist/whim-jimothy
rm -rf "$OUT" dist/jimothy-whim.zip dist/jimothy-whim-demo.zip
mkdir -p "$OUT"
cp "$SRC/index.html" "$OUT/"
cp -r "$SRC/assets" "$OUT/assets"

python3 - <<'PY'
import re
p='dist/whim-jimothy/index.html'
s=open(p).read()
flag=('<script>window.__ITCH_BUILD=true;/* Whim build: bought outright */</script>\n'
      '<style>#b-acct{display:none!important}</style>')
i=s.index('<script')
s=s[:i]+flag+'\n'+s[i:]
assert s.index('window.__ITCH_BUILD=true')<s.index('var STORE_BUILD')
s=s.replace("navigator.serviceWorker.register","(function(){return {then:function(){}};}).bind(null)||navigator.serviceWorker.register")
s=re.sub(r'<script[^>]*sunbeam-sdk[^>]*>\s*</script>\s*','',s)
s=re.sub(r'<link[^>]*rel="manifest"[^>]*>\s*','',s)
open(p,'w').write(s)
PY

# art diet: quant, then webp bytes under the png names where smaller
find "$OUT/assets" -name "*.png" -print0 | xargs -0 -P 4 -n 20 pngquant --quality=65-90 --skip-if-larger --force --ext .png 2>/dev/null || true
find "$OUT/assets/skins" "$OUT/assets/chars" -name "*.png" -print0 | xargs -0 -P 4 -n 20 pngquant --quality=45-75 --speed 1 --skip-if-larger --force --ext .png 2>/dev/null || true
python3 - <<'PY'
import subprocess,os,shutil
roots=['skins','chars','bg','intro','sprites','fx','ui','powers','ach','hero']
base='dist/whim-jimothy/assets/'; tmp=base+'_w.webp'; n=0
for r in roots:
    d=base+r
    if not os.path.isdir(d): continue
    for dp,_,fs in os.walk(d):
        for fn in fs:
            if not fn.endswith('.png'): continue
            p=os.path.join(dp,fn); sz=os.path.getsize(p)
            if subprocess.run(['ffmpeg','-loglevel','error','-y','-i',p,'-c:v','libwebp','-quality','82',tmp]).returncode==0 and os.path.getsize(tmp)<sz*0.92:
                shutil.move(tmp,p); n+=1
if os.path.exists(tmp): os.remove(tmp)
print('webp-swapped',n)
PY
for f in "$OUT"/assets/music/*.mp3; do ffmpeg -loglevel error -y -i "$f" -codec:a libmp3lame -b:a 96k "$OUT/assets/music/_t.mp3" && mv "$OUT/assets/music/_t.mp3" "$f"; done

( cd "$OUT" && zip -qr ../jimothy-whim.zip index.html assets )
# demo edition: same tree, one extra flag
python3 - <<'PY'
p='dist/whim-jimothy/index.html'
s=open(p).read()
s=s.replace('window.__ITCH_BUILD=true;','window.__ITCH_BUILD=true;window.__WHIM_DEMO=true;',1)
open(p,'w').write(s)
PY
( cd "$OUT" && zip -qr ../jimothy-whim-demo.zip index.html assets )
du -sh dist/jimothy-whim.zip dist/jimothy-whim-demo.zip
