#!/usr/bin/env python3
"""Re-cut base Jimothy off the ORIGINAL sheet (art-drop/1.png), 4 cols x 5 rows.

The shipped assets/hero/ frames are guillotined — idle, run-l, sit, crouch, leap and
cheer all have a flat horizontal slice through the skull. The source has no such
clipping, so this is a bad cut, not bad art.

⛔ Same house rules as cut_sheet.py, whose helpers this reuses:
   · key MEASURED off the sheet, never "looks magenta"
   · shadow-on-background removed by TOPOLOGY (reachable from the border), so a dark
     pixel inside the umbrella or the shield bubble survives
   · gutters found from the art and split at their MIDPOINTS — never an even grid
   · real partial-coverage edge alpha, then despill
   · names resolved by MATCHING each new cell against the shipped frame it replaces,
     so the 20 poses cannot be mislabelled by eye

    python3 scripts/cut_hero_sheet.py --dry              # measure + contact, write nothing
    python3 scripts/cut_hero_sheet.py --out assets/hero  # re-cut in place
"""
import argparse, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import cut_sheet as CS

SHEET = os.path.join(ROOT, 'art-drop/1.png')
OLD = os.path.join(ROOT, 'assets/hero')
COLS, ROWS = 4, 5


def sig(rgba, n=48):
    """Small grey+alpha signature for matching a new cell to the frame it replaces."""
    im = Image.fromarray(rgba, 'RGBA')
    a = np.array(im.split()[3].resize((n, n), Image.LANCZOS), np.float32) / 255.0
    g = np.array(im.convert('L').resize((n, n), Image.LANCZOS), np.float32) / 255.0
    v = np.concatenate([a.ravel(), (g * a).ravel()])
    return v / (np.linalg.norm(v) + 1e-6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out')
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--contact', default='/tmp/hero-recut.png')
    ap.add_argument('--pad', type=int, default=3)
    a = ap.parse_args()

    rgb = np.array(Image.open(SHEET).convert('RGB'))
    H, W = rgb.shape[:2]
    key = CS.find_key(rgb)
    print('sheet %dx%d   measured key %.1f,%.1f,%.1f' % (W, H, key[0], key[1], key[2]))

    alpha, wr, wc = CS.background(rgb, key)

    # ⛔ LIFT THE 3px FENCE — but only on a sheet like this one.
    # cut_sheet.edge_alpha deliberately estimates coverage only within 3px of real
    # background, because on the costume sheets a global test would eat painted pink
    # sparks. This sheet is different: the shield dome, the dash flame and the magnet
    # swirl are painted SEMI-TRANSPARENT over the key, so the key shows through in the
    # MIDDLE of them. Topology (correctly) refuses to remove enclosed background, so
    # with the fence on, the bubble cuts out PURPLE and the gold swirl cuts out MAGENTA.
    # Measured: the raccoon himself is grey/brown/red, where min(r,b)-g is ~0, so this
    # only ever touches pixels carrying the key's own magenta-over-green signature.
    a32 = rgb.astype(np.float32)
    spill = np.minimum(a32[:, :, 0], a32[:, :, 2]) - a32[:, :, 1]
    key_spill = max(min(key[0], key[2]) - key[1], 1.0)
    est = np.clip(1.0 - spill / key_spill, 0, 1)
    before = float(alpha.sum())
    touched = int(((est < alpha - 0.02) & (alpha > 0.02)).sum())
    alpha = np.minimum(alpha, est)
    print('coverage unfenced: %d px had key bleeding through them, %.2f%% of total alpha removed'
          % (touched, 100 * (before - alpha.sum()) / before))

    solid = alpha > 0.5
    print('paint %.2f%% of sheet' % (100 * solid.mean()))

    colp = solid.sum(axis=0)
    rowp = solid.sum(axis=1)
    xcuts, (x0, x1), xb = CS.gutters(colp, want=COLS - 1)
    ycuts, (y0, y1), yb = CS.gutters(rowp, want=ROWS - 1)
    print('col cuts %s  (art spans x %d-%d)  bridges %s' % (xcuts, x0, x1, xb))
    print('row cuts %s  (art spans y %d-%d)  bridges %s' % (ycuts, y0, y1, yb))
    if any(xb) or any(yb):
        print('  ⚠️ a cut had to be made through touching art — check the contact sheet')
    xe = [x0] + xcuts + [x1]
    ye = [y0] + ycuts + [y1]
    # even-grid comparison, purely to show how far off a naive cut would be
    print('  vs even grid rows: %s' % [int(y0 + (y1 - y0) * i / ROWS) for i in range(1, ROWS)])

    # every shipped frame, for name matching
    olds = {}
    for f in sorted(os.listdir(OLD)):
        if f.endswith('.png'):
            olds[f[:-4]] = sig(np.array(Image.open(os.path.join(OLD, f)).convert('RGBA')))

    cells, names, notes = [], [], []
    for gy in range(ROWS):
        for gx in range(COLS):
            cy0, cy1 = ye[gy], ye[gy + 1]
            cx0, cx1 = xe[gx], xe[gx + 1]
            ca = alpha[cy0:cy1 + 1, cx0:cx1 + 1].copy()
            crgb = rgb[cy0:cy1 + 1, cx0:cx1 + 1]
            keep, nspeck = CS.despeckle(ca > 0.5)
            # ⛔ Two column cuts had to be made through touching art (3px and 14px
            # bridges), and the cut at x=814 dragged three chips of the neighbouring
            # LEAP pose into the LAND cell. despeckle keeps them on purpose (they are
            # 44-73px, far above its timid 4px floor). crop_bleed is the rule that
            # catches them: tiny next to the body, clear of it, AND flush against a
            # side that was cut. Left in, they inflate land's box 236x184 -> 278x254,
            # and the engine sizes each pose BY ITS BOX, so he would render small.
            edges = [gx > 0, gx < COLS - 1, gy > 0, gy < ROWS - 1]
            bled = CS.crop_bleed(keep, edges)
            nbleed = 0
            if bled is not None:
                keep, nbleed = bled
            keep, ndrop = CS.drop_key_residue(keep, crgb)
            ndrop += nspeck + nbleed
            if keep.sum() < 400:
                raise SystemExit('cell %d,%d is nearly empty' % (gy, gx))
            grown = ndimage.binary_dilation(keep, np.ones((3, 3)), iterations=2)
            ca[~grown] = 0
            ys, xs = np.where(ca > 0.02)
            t0, t1, s0, s1 = ys.min(), ys.max(), xs.min(), xs.max()
            sub_a = ca[t0:t1 + 1, s0:s1 + 1]
            sub_rgb = CS.despill(crgb[t0:t1 + 1, s0:s1 + 1], sub_a)
            h, w = sub_a.shape
            out = np.zeros((h + a.pad * 2, w + a.pad * 2, 4), np.uint8)
            out[a.pad:a.pad + h, a.pad:a.pad + w, :3] = sub_rgb
            out[a.pad:a.pad + h, a.pad:a.pad + w, 3] = (sub_a * 255).astype(np.uint8)

            # did this cell touch the cut line? that is the clipping we are fixing
            gap_top = int(t0)
            gap_bot = int(ca.shape[0] - 1 - t1)
            cells.append(out)
            notes.append((gap_top, gap_bot, ndrop))

            names.append(sig(out))

    # ⛔ NOT greedy. Per-cell best-match double-claimed 'leap' and 'scared' and left
    # 'land' and 'shield' homeless, because the frames it is matching against are the
    # CLIPPED ones. Optimal assignment over the whole 20x20 score matrix instead, which
    # is forced one-to-one and lets a weak pair be decided by everything around it.
    from scipy.optimize import linear_sum_assignment
    onames = sorted(olds)
    M = np.array([[float(v @ olds[o]) for o in onames] for v in names])
    ri, ci = linear_sum_assignment(-M)
    assign = {int(r): (onames[int(c)], float(M[r, c])) for r, c in zip(ri, ci)}
    names = [assign[i] for i in range(len(names))]
    got = [n for n, _ in names]
    dupes = sorted({n for n in got if got.count(n) > 1})
    missing = sorted(set(olds) - set(got))
    print('\n%-4s %-10s %-6s %-12s %s' % ('cell', 'matched', 'score', 'size', 'clear above/below in cell'))
    for i, ((n, sc), c, (gt, gb, nd)) in enumerate(zip(names, cells, notes)):
        print('%-4s %-10s %-6.3f %-12s top %3d  bottom %3d%s'
              % ('%d,%d' % (i // COLS, i % COLS), n, sc, '%dx%d' % (c.shape[1], c.shape[0]),
                 gt, gb, '   ⚠️FLUSH' if gt <= 1 or gb <= 1 else ''))
    if dupes or missing:
        print('\n⛔ name mapping is not one-to-one — dupes %s  missing %s' % (dupes, missing))
    else:
        print('\n✓ all 20 shipped names matched exactly once')

    # contact sheet on a dark checkerboard: new cut over the old, so clipping is obvious
    cell = 230
    img = Image.new('RGBA', (COLS * cell, ROWS * (cell + 20)), (18, 22, 17, 255))
    d = ImageDraw.Draw(img)
    for gy in range(img.height // 20 + 1):
        for gx in range(img.width // 20 + 1):
            if (gx + gy) % 2 == 0:
                d.rectangle([gx * 20, gy * 20, gx * 20 + 19, gy * 20 + 19], fill=(30, 36, 28, 255))
    for i, (c, (n, sc)) in enumerate(zip(cells, names)):
        ox = (i % COLS) * cell
        oy = (i // COLS) * (cell + 20)
        half = cell // 2
        for j, src in enumerate([Image.open(os.path.join(OLD, n + '.png')).convert('RGBA'),
                                 Image.fromarray(c, 'RGBA')]):
            sc2 = min((half - 8) / src.width, (cell - 14) / src.height)
            im = src.resize((max(1, int(src.width * sc2)), max(1, int(src.height * sc2))), Image.LANCZOS)
            img.alpha_composite(im, (ox + j * half + (half - im.width) // 2,
                                     oy + (cell - im.height) // 2))
        d.line([ox + half, oy + 4, ox + half, oy + cell - 4], fill=(200, 168, 75, 120))
        d.text((ox + 6, oy + cell + 3), n + '   old | new', fill=(230, 220, 200, 255))
    img.save(a.contact)
    print('contact: %s' % a.contact)

    if a.dry or not a.out:
        print('\n(dry run — nothing written)')
        return
    if dupes or missing:
        raise SystemExit('⛔ refusing to write with a broken name mapping')
    os.makedirs(a.out, exist_ok=True)
    for c, (n, sc) in zip(cells, names):
        Image.fromarray(c, 'RGBA').save(os.path.join(a.out, n + '.png'), optimize=True)
    print('wrote %d frames to %s' % (len(cells), a.out))


main()
