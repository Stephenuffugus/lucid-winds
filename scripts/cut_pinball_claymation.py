#!/usr/bin/env python3
"""Cut Blobworks (pinball claymation) magenta-knockout sprite sheets into
trimmed transparent PNGs via connected-component detection (robust to the
imprecise generator grid). Produces a labeled preview per sheet so the cut
can be eyeballed before keys are assigned.

Usage: python3 scripts/cut_pinball_claymation.py <sheetN.png> [min_area_frac]
   or: python3 scripts/cut_pinball_claymation.py all
Outputs: art-drop/cut/<sheetNN>/NN.png  +  art-drop/cut/preview_NN.png
"""
import sys, os, re, glob
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

DROP = os.path.join(os.path.dirname(__file__), '..', 'satellites', 'greenhouse-pinball', 'art-drop', 'Pinball claymation')
OUT  = os.path.join(DROP, 'cut')

def is_bg(arr):
    # magenta ~ (249,2,250): high R, low G, high B. Also catch the bright-pink AA
    # halo (r,b very high + moderate g) WITHOUT eating the purple bumper body
    # (purple has moderate r < ~180). Boundary fringe is finished off by erosion.
    r, g, b = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int)
    mag = (r > 150) & (g < 110) & (b > 150)
    pink = (r > 200) & (b > 180) & (g >= 110) & (g < 150)
    return mag | pink

def cut_sheet(path, min_area_frac=0.0012, pad=6):
    n = int(re.search(r'sheet(\d+)', path).group(1))
    im = Image.open(path).convert('RGB')
    arr = np.array(im)
    H, W = arr.shape[:2]
    fg = ~is_bg(arr)
    # clean: fill small holes, drop thin AA specks
    fg = ndimage.binary_opening(fg, iterations=2)
    fg = ndimage.binary_closing(fg, iterations=3)
    lbl, ncomp = ndimage.label(fg, structure=np.ones((3, 3)))
    min_area = int(min_area_frac * W * H)
    boxes = []
    for i in range(1, ncomp + 1):
        ys, xs = np.where(lbl == i)
        if len(xs) < min_area:
            continue
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        boxes.append([x0, y0, x1, y1, len(xs)])
    # reading order: cluster into rows by y-center, then sort by x within a row
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows, cur, last_yc = [], [], None
    row_gap = H * 0.045
    for b in boxes:
        yc = (b[1] + b[3]) / 2
        if last_yc is None or yc - last_yc < row_gap:
            cur.append(b)
        else:
            rows.append(cur); cur = [b]
        last_yc = yc
    if cur:
        rows.append(cur)
    ordered = []
    for row in rows:
        row.sort(key=lambda b: b[0])
        ordered.extend(row)
    # export each + build preview
    sdir = os.path.join(OUT, 'sheet%02d' % n)
    os.makedirs(sdir, exist_ok=True)
    rgba = im.convert('RGBA')
    a = np.array(rgba)
    # DE-FRINGE: erode the strict-magenta foreground by 2px so the anti-aliased
    # magenta halo ring is cut away. Color-agnostic (safe for the purple bumper).
    fg_e = ndimage.binary_erosion(~is_bg(arr), iterations=3)
    a[..., 3] = np.where(fg_e, 255, 0).astype(np.uint8)
    rgba = Image.fromarray(a)
    crops = []
    for idx, (x0, y0, x1, y1, area) in enumerate(ordered):
        cx0, cy0 = max(0, x0 - pad), max(0, y0 - pad)
        cx1, cy1 = min(W, x1 + pad), min(H, y1 + pad)
        crop = rgba.crop((cx0, cy0, cx1, cy1))
        crop.save(os.path.join(sdir, '%02d.png' % idx))
        crops.append((idx, crop, (x1 - x0, y1 - y0)))
    # preview contact sheet
    cell = 150
    cols = min(6, max(1, len(crops)))
    prows = (len(crops) + cols - 1) // cols
    prev = Image.new('RGB', (cols * cell, prows * (cell + 16) + 4), (30, 30, 36))
    pd = ImageDraw.Draw(prev)
    for i, (idx, crop, sz) in enumerate(crops):
        t = crop.copy(); t.thumbnail((cell - 8, cell - 8))
        px = (i % cols) * cell; py = (i // cols) * (cell + 16)
        bg = Image.new('RGB', (cell, cell), (52, 52, 60))
        prev.paste(bg, (px, py + 16))
        prev.paste(t, (px + (cell - t.size[0]) // 2, py + 16 + (cell - t.size[1]) // 2), t)
        pd.text((px + 2, py + 2), '#%d %dx%d' % (idx, sz[0], sz[1]), fill=(255, 230, 120))
    prev.save(os.path.join(OUT, 'preview_%02d.png' % n))
    print('sheet%02d: %d sprites -> %s (min_area=%d px)' % (n, len(crops), sdir, min_area))
    return len(crops)

if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else 'all'
    # element + prop sheets on magenta (skip 1-4,18-21 opaque backdrops)
    ELEMENT = [5, 6, 7, 8, 9, 10, 11, 12, 22]
    os.makedirs(OUT, exist_ok=True)
    if arg == 'all':
        for n in ELEMENT:
            mf = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0012
            cut_sheet(os.path.join(DROP, 'sheet%d.png' % n), mf)
    else:
        mf = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0012
        cut_sheet(arg, mf)
