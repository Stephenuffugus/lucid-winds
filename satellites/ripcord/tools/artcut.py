#!/usr/bin/env python3
"""artcut - turns raw generator output into game ready part art.

Stephen makes the pictures in an image generator, which will not give clean
transparency. So the prompts in docs/ART-PROMPTS.md ask for a FLAT PURE BLACK
background, and this keys it out. Drop anything into assets/parts/_raw/ named
after the part and run this; it writes assets/parts/<slot>/<id>.png and the game
picks it up on the next load.

    python3 tools/artcut.py              # process every new raw file
    python3 tools/artcut.py --force      # redo ones already done
    python3 tools/artcut.py cleaver      # just one
    python3 tools/artcut.py --png        # emit PNG instead, if a host mangles webp

WHY WEBP. Measured on this pipeline, one 320px part: PNG 44 to 86KB, PNG cut to
64 colours 5 to 8KB but with visible banding across a metal gradient (the radial
streaks posterise into hard wedges, which was checked by looking at it, not by
reading the file size), lossless webp 28 to 66KB, lossy webp at 82 about 5KB and
indistinguishable from the PNG. All 112 parts come to well under a megabyte,
which matters because the workshop shows five rails of them at once. If a webp
ever fails to load the game draws that part in code exactly as it does today, so
the fallback costs nothing.

WHY A FLOOD FILL AND NOT A LUMINANCE KEY. Keying on brightness removes the dark
parts of the OBJECT too, and half of these parts are dark steel. The background
is the region CONNECTED TO THE FRAME EDGE, so that is what gets removed. A dark
shadow inside the object survives, because it is not connected to the edge.

AND WHY IT DOES NOT ASSUME BLACK. The prompts ask for black, but generators do
what they like: they hand back white, grey, a gradient, or a colour. So the
background colour is READ FROM THE BORDER of each image rather than assumed, and
anything close to it that is connected to the edge is what gets removed. A run
that assumed black and got a white background would silently produce 112 opaque
squares, and nobody would notice until they were all made.
"""
import os, sys, json
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW    = os.path.join(ROOT, 'assets', 'parts', '_raw')
PARTS  = os.path.join(ROOT, 'assets', 'parts')
OUT_PX = 320          # serves a 150px card at 2x, and the 34px chip with room
QUALITY = 82          # webp; see WHY WEBP below
FILL   = 0.92         # how much of the frame the object ends up occupying
NEAR   = 26           # a pixel this close to the border colour counts as background
SOFT   = 62           # and it ramps to fully opaque by here
MAX_BG = 0.985        # if this much of the frame keys out, something went wrong

def slot_of(part_id, catalogue):
    return catalogue.get(part_id)

def load_catalogue():
    """Ask the real sim for which slot each id belongs to, so a renamed part
       cannot silently land in the wrong folder."""
    import subprocess
    js = ("var S=require('./src/sim2.js');var o={};"
          "[['core',S.CORES],['blade',S.BLADES],['assist',S.ASSISTS],"
          "['ratchet',S.RATCHETS],['bit',S.BITS]].forEach(function(p){"
          "p[1].forEach(function(x){o[x.id]=p[0];});});"
          "S.WEIGHTS.forEach(function(w){if(w.id!=='none')o[w.id]='weight';});"
          "console.log(JSON.stringify(o));")
    out = subprocess.check_output(['node', '-e', js], cwd=ROOT)
    return json.loads(out)

def border_colour(a):
    """The background colour, read from the frame rather than assumed. Median of
       the outermost ring, which survives a vignette or a bit of noise."""
    ring = np.concatenate([a[0, :, :], a[-1, :, :], a[:, 0, :], a[:, -1, :]])
    return np.median(ring, axis=0)

def key_background(im):
    """Remove the region connected to the border whose colour matches the border.
       Returns an RGBA image and the fraction of the frame that was removed."""
    im  = im.convert('RGB')
    rgb = np.asarray(im).astype(np.float32)
    bgc = border_colour(rgb)
    # distance from the background colour, per pixel
    d = np.sqrt(((rgb - bgc) ** 2).sum(axis=2))
    close = d <= SOFT
    # only the part of that CONNECTED TO THE EDGE is background; a dark shadow
    # or a bright highlight inside the object is not
    lab, n = ndimage.label(close)
    if n == 0:
        return im.convert('RGBA'), 0.0
    edge_labels = set(np.unique(np.concatenate([lab[0, :], lab[-1, :],
                                                lab[:, 0], lab[:, -1]])))
    edge_labels.discard(0)
    if not edge_labels:
        return im.convert('RGBA'), 0.0
    bg = np.isin(lab, list(edge_labels))
    # soft edge: alpha ramps with distance from the background colour instead of
    # snapping, so the cut does not look done with scissors
    ramp = np.clip((d - NEAR) * (255.0 / max(1.0, SOFT - NEAR)), 0, 255)
    alpha = np.where(bg, ramp, 255).astype(np.uint8)
    out = Image.fromarray(np.dstack([np.asarray(im), alpha]).astype(np.uint8), 'RGBA')
    return out, float(bg.mean())

def square_and_size(im):
    """Trim to the object, centre it in a square, and scale so it fills FILL."""
    bbox = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bbox:
        return None
    im = im.crop(bbox)
    side = max(im.size)
    target = int(OUT_PX * FILL)
    scale = target / side
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))),
                   Image.LANCZOS)
    canvas = Image.new('RGBA', (OUT_PX, OUT_PX), (0, 0, 0, 0))
    canvas.paste(im, ((OUT_PX - im.width) // 2, (OUT_PX - im.height) // 2), im)
    return canvas

def process(path, part_id, slot, force, ext):
    dst = os.path.join(PARTS, slot, part_id + ext)
    if os.path.exists(dst) and not force:
        return None
    im = Image.open(path)
    if im.mode == 'RGBA' and np.asarray(im)[:, :, 3].min() < 250:
        keyed, eaten = im.convert('RGBA'), 0.0   # already transparent, trust it
        how = 'kept its own alpha'
    else:
        keyed, eaten = key_background(im)
        how = 'keyed %d%% away' % round(eaten * 100)
    if eaten > MAX_BG:
        return (part_id, slot, 0,
                'the whole frame keyed out. The background is probably the same '
                'colour as the object, or there is no object in it.')
    if 0 < eaten < 0.04:
        how += ', barely anything removed, check the background is flat'
    out = square_and_size(keyed)
    if out is None:
        return (part_id, slot, 0, 'EMPTY after keying, nothing survived')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if ext == '.webp':
        out.save(dst, 'WEBP', quality=QUALITY, method=6)
    else:
        out.save(dst, optimize=True)
    kb = max(1, os.path.getsize(dst) // 1024)
    return (part_id, slot, kb, how)

def main():
    args  = [a for a in sys.argv[1:] if not a.startswith('-')]
    force = '--force' in sys.argv
    ext   = '.png' if '--png' in sys.argv else '.webp' 
    cat   = load_catalogue()
    os.makedirs(RAW, exist_ok=True)
    files = [f for f in sorted(os.listdir(RAW))
             if os.path.splitext(f)[1].lower() in ('.png', '.jpg', '.jpeg', '.webp')]
    if args:
        files = [f for f in files if os.path.splitext(f)[0] in args]
    if not files:
        print('nothing in assets/parts/_raw/ to cut.')
        print('save a picture there named after the part, like cleaver.png, then run this again.')
        return
    done, skipped, bad = [], 0, []
    for f in files:
        pid = os.path.splitext(f)[0]
        slot = cat.get(pid)
        if not slot:
            bad.append((f, 'no part called "' + pid + '" in the catalogue'))
            continue
        r = process(os.path.join(RAW, f), pid, slot, force, ext)
        if r is None:
            skipped += 1
        elif r[2] == 0:
            bad.append((f, r[3]))
        else:
            done.append(r)
    for pid, slot, kb, how in done:
        flag = '  ⚠ heavy, is the background really flat?' if kb > 30 else ''
        print('  %-12s -> assets/parts/%s/%s%s  %sKB  (%s)%s'
              % (pid, slot, pid, ext, kb, how, flag))
    if skipped:
        print('  %d already done, left alone. --force to redo them.' % skipped)
    for f, why in bad:
        print('  SKIPPED %-16s %s' % (f, why))
    if done:
        print('\n%d cut. Reload the game; they are in.' % len(done))

def write_manifest():
    """What the game reads to know which parts are painted, so the workshop can
       lay out correctly the first time instead of firing 110 requests and
       reflowing as each one fails."""
    import glob, hashlib
    cat = load_catalogue()
    parts = {}
    for f in sorted(glob.glob(os.path.join(PARTS, '*', '*'))):
        slot = os.path.basename(os.path.dirname(f))
        pid, ext = os.path.splitext(os.path.basename(f))
        if ext.lower() not in ('.webp', '.png') or slot == '_raw':
            continue
        if cat.get(pid) != slot:
            continue                      # a stray file is not an asset
        # ⛔ A CONTENT HASH PER FILE, AND IT IS NOT DECORATION. The service
        # worker is cache-first WITH runtime caching (sw.js:87-96): once a
        # picture has been fetched it is served from the cache and never
        # revalidated. Re-cutting cleaver.webp at the same URL would show the old
        # one forever on any phone that had already seen it. The hash goes in the
        # URL, so re-cutting one part changes that part's URL and nothing else's.
        with open(f, 'rb') as fh:
            h = hashlib.sha1(fh.read()).hexdigest()[:8]
        parts.setdefault(slot, {})[pid] = {'v': h, 'x': ext[1:]}
    dst = os.path.join(PARTS, 'manifest.json')
    with open(dst, 'w') as fh:
        json.dump({'parts': parts}, fh, separators=(',', ':'), sort_keys=True)
    n = sum(len(v) for v in parts.values())
    print('  manifest.json  %d painted' % n)
    return n

if __name__ == '__main__':
    main()
    write_manifest()
