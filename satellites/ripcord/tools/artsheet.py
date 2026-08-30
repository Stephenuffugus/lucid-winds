#!/usr/bin/env python3
"""artsheet - cuts a multi-part sheet into single raw part images.

The generator hands back SHEETS of five or six parts on a flat magenta
ground, not singles. This cuts a sheet apart and writes one RGBA png per
part into assets/parts/_raw/ named by part id, where artcut.py takes over
(artcut sees real alpha and trusts it, so it only squares, sizes and
compresses).

Three things artcut's keyer must not be trusted with here, and why:

1. ENCLOSED HOLES. artcut keys the region CONNECTED TO THE FRAME EDGE,
   which is right for a single dark object on black - an interior shadow
   survives. But a blade is a ring, and the ground shows through its
   middle: flood fill from the edge leaves a solid magenta disc in every
   one. (The first cleaver cut shipped with exactly this bug in black.)
   On these sheets no part is anywhere near the ground colour, so here
   EVERY pixel near the ground colour is ground, enclosed or not.

2. FRINGE. The soft alpha edge is a blend of part and ground. On black
   that fringe read as shadow; on magenta it reads as a purple halo. So
   the cut edge is defringed: the ground's contribution is subtracted
   out of every partially transparent pixel.

3. IDENTITY. A sheet has no names in it. The mapping below is the sheet's
   basename to its part ids in ROW-MAJOR order (left to right, top to
   bottom), verified by eye against docs/ASSETS.md tooth families, radii
   and move tells. A sheet that yields a different number of parts than
   its mapping is a HARD ERROR, never a guess - a miscounted sheet would
   silently shift every name one part over.

    python3 tools/artsheet.py                 # every sheet in _sheets/
    python3 tools/artsheet.py sheet-core-1    # just one

Each run also writes _sheets/preview-<name>.png, the cut parts side by
side with their assigned ids printed under them. LOOK AT IT before running
artcut: the mapping is the one step no gate can check.
"""
import os, sys
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEETS_D= os.path.join(ROOT, 'assets', 'parts', '_sheets')
RAW     = os.path.join(ROOT, 'assets', 'parts', '_raw')
HARD    = 45      # a pixel this close to the ground colour is ground, full stop
SOFT_TOP= 160     # in the edge band, opacity ramps up to here
BAND_PX = 3       # how far from hard ground the soft edge is allowed to reach
MIN_AREA= 0.002   # a blob under 0.2% of the frame is a speck, not a part
PAD     = 6       # px kept around each part's tight box

# sheet basename -> part ids, row-major. Ids, not display names: the
# catalogue says millst is Cairn and ballast is Trim, and artcut refuses
# anything the catalogue does not know, so a wrong word here fails loudly.
SHEETS = {
    'sheet-core-1':  ['ember', 'frost', 'gale', 'iron', 'hollow', 'moth'],
    'sheet-core-2':  ['burr', 'lash', 'lodest', 'quench', 'ballast', 'granite'],
    'sheet-core-3':  ['windlas', 'vise', 'kite', 'reel', 'tinder'],
    'sheet-core-4':  ['wren', 'bell', 'magpie', 'flint', 'millst'],
    'sheet-blade-1': ['cleaver', 'sabre', 'orbit', 'bulwark', 'talon', 'wheel'],
    'sheet-blade-2': ['shard', 'anvil', 'halo', 'crest', 'broadaxe', 'chisel'],
    'sheet-blade-3': ['millstone', 'ploughshare', 'cartwheel', 'roundel', 'rasp'],
    'sheet-blade-4': ['hailstone', 'shrike', 'sledge', 'ingot', 'hookbill'],
}

def border_colour(a):
    ring = np.concatenate([a[0, :, :], a[-1, :, :], a[:, 0, :], a[:, -1, :]])
    return np.median(ring, axis=0)

def key_and_defringe(im):
    """RGBA with the ground removed everywhere it appears, and the ground's
       colour subtracted back out of the soft edge."""
    rgb = np.asarray(im.convert('RGB')).astype(np.float32)
    bgc = border_colour(rgb)
    d = np.sqrt(((rgb - bgc) ** 2).sum(axis=2))
    # HARD is a colour decision with no connectivity condition, which is
    # what keys the enclosed holes. It is safe because nothing on these
    # parts comes near pure magenta: the closest thing measured (the
    # violet crystal on Hollow) sits at distance ~127.
    hard = d < HARD
    # A tight ramp was tried first and left a bright magenta OUTLINE: a
    # pixel that is 70% ground blend sits at distance ~63 from the ground
    # colour, past any tight threshold, so it stayed fully opaque in its
    # blended colour. The ramp has to reach much further out - but only in
    # a narrow band TOUCHING the ground, or interior violets would go
    # transparent too.
    band = ndimage.binary_dilation(hard, iterations=BAND_PX) & ~hard
    alpha = np.where(hard, 0.0, 255.0)
    ramp = np.clip((d - HARD) * (255.0 / (SOFT_TOP - HARD)), 0, 255)
    alpha[band] = ramp[band]
    a = alpha / 255.0
    # defringe the band: pixel = a*part + (1-a)*ground, so recover
    # part = (pixel - (1-a)*ground) / a, clamped against amplification
    safe = np.maximum(a, 0.15)[..., None]
    clean = np.where(band[..., None],
                     np.clip((rgb - (1.0 - a)[..., None] * bgc) / safe, 0, 255),
                     rgb)
    out = np.dstack([clean, alpha]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), bgc

def find_parts(alpha):
    """Bounding boxes of the parts, row-major. Pieces of one part that the
       cut separated (an antialiased 1px bridge) are merged by dilation;
       parts sit far apart on these sheets, so the merge cannot span two."""
    mask = alpha > 128
    grown = ndimage.binary_dilation(mask, iterations=10)
    lab, n = ndimage.label(grown)
    boxes = []
    total = mask.size
    for i in range(1, n + 1):
        m = mask & (lab == i)
        area = int(m.sum())
        if area < total * MIN_AREA:
            continue
        ys, xs = np.nonzero(m)
        boxes.append((xs.min(), ys.min(), xs.max(), ys.max(),
                      float(xs.mean()), float(ys.mean())))
    if not boxes:
        return []
    # row-major: cluster by centroid Y, then sort rows by Y and cells by X
    med_h = float(np.median([b[3] - b[1] for b in boxes]))
    boxes.sort(key=lambda b: b[5])
    rows, cur = [], [boxes[0]]
    for b in boxes[1:]:
        if b[5] - np.mean([c[5] for c in cur]) > med_h * 0.6:
            rows.append(cur); cur = [b]
        else:
            cur.append(b)
    rows.append(cur)
    ordered = []
    for row in rows:
        ordered.extend(sorted(row, key=lambda b: b[4]))
    return ordered

def preview(name, crops):
    """The cut parts in a strip with their ids printed under them - the
       proof the mapping put the right name on the right picture."""
    cell = 220
    im = Image.new('RGB', (cell * len(crops), cell + 30), (24, 22, 20))
    dr = ImageDraw.Draw(im)
    for i, (pid, c) in enumerate(crops):
        t = c.copy(); t.thumbnail((cell - 12, cell - 12), Image.LANCZOS)
        im.paste(t, (i * cell + (cell - t.width) // 2,
                     (cell - t.height) // 2), t)
        dr.text((i * cell + cell // 2 - 4 * len(pid), cell + 8), pid,
                fill=(230, 222, 205))
    p = os.path.join(SHEETS_D, 'preview-%s.png' % name)
    im.save(p)
    return p

def main():
    only = [a for a in sys.argv[1:] if not a.startswith('-')]
    os.makedirs(RAW, exist_ok=True)
    todo = sorted(SHEETS) if not only else only
    failed = False
    for name in todo:
        ids = SHEETS.get(name)
        if not ids:
            print('SKIPPED %s: not in the mapping at the top of this file' % name)
            failed = True
            continue
        src = None
        for ext in ('.png', '.jpg', '.webp'):
            p = os.path.join(SHEETS_D, name + ext)
            if os.path.exists(p):
                src = p; break
        if not src:
            print('SKIPPED %s: no such sheet in assets/parts/_sheets/' % name)
            failed = True
            continue
        keyed, bgc = key_and_defringe(Image.open(src))
        boxes = find_parts(np.asarray(keyed)[:, :, 3])
        if len(boxes) != len(ids):
            print('ERROR %s: found %d parts, mapping names %d. NOTHING '
                  'written for this sheet - a miscount would shift every '
                  'name one part over.' % (name, len(boxes), len(ids)))
            failed = True
            continue
        crops = []
        for pid, (x0, y0, x1, y1, _, _) in zip(ids, boxes):
            c = keyed.crop((max(0, x0 - PAD), max(0, y0 - PAD),
                            min(keyed.width, x1 + PAD),
                            min(keyed.height, y1 + PAD)))
            c.save(os.path.join(RAW, pid + '.png'))
            crops.append((pid, c))
        pv = preview(name, crops)
        print('%s -> %d parts (%s), preview %s'
              % (name, len(ids), ' '.join(ids), os.path.relpath(pv, ROOT)))
    if failed:
        sys.exit(1)
    print('\nnow: python3 tools/artcut.py --force ' +
          '(then LOOK at the previews before believing the ids)')

if __name__ == '__main__':
    main()
