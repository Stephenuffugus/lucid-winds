#!/usr/bin/env python3
"""HUES BORDER GATE (21 Oct 2026). Measures border art against the template the game is built around:
   cell 528x416, window 400x288 at (64,64), band 64 all round (docs/briefs/hues/template/). Scale is free:
   a cell is judged by proportions, so a 1056x832 master and a 300-wide web cut are the same test.

   Three things the first pack got wrong, each now a red line:
     COVER   art inside the window (the color). The game maps the window onto the swatch, so any opaque
             pixel there sits ON the color the player is matching. Allowed: 1% of the window, for antialiasing.
     SPILL   art that leaves its cell. A sheet cell is the whole frame; what crosses the cyan edge is cut off,
             and on the play screen it lands on the neighbouring swatch. Allowed: nothing.
     FRINGE  knockout colour left in the art (magenta, green or cyan haloes after the key). Allowed: 0.3%.
   Plus PRESENT: all four rails carry art (a frame that is only corners is a sticker, not a frame).

   Usage:
     check.py sheet  <sheet.png> [cols rows]   a delivered sheet on the template (default 4x2): keys the
                                               three guide colours, cuts by the GRID (never by bounding box),
                                               judges every cell, writes cells to <sheet>-cut/ when all pass
     check.py frames <dir-or-files...>          already cut frames (RGBA), judged by proportion
     check.py pack                              the live pack (satellites/hues/borders/pack): the 21 Oct baseline
   Exit 1 on any red. Prints one line per frame: name, cover %, spill %, fringe %, verdict."""
import sys, os, glob
import numpy as np
from PIL import Image

CW, CH, BW = 528, 416, 64
WX0, WY0, WX1, WY1 = BW / CW, BW / CH, (CW - BW) / CW, (CH - BW) / CH   # window as fractions of the cell
LIM = dict(cover=1.0, spill=0.0, fringe=0.3, present=30.0)

def key_colors(rgb):
    r, g, b = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
    mag = (r > 200) & (b > 200) & (g < 90)
    grn = (g > 200) & (r < 90) & (b < 90)
    cyn = (g > 200) & (b > 200) & (r < 90)
    return mag | grn | cyn

def fringe_mask(rgb, alpha):
    r, g, b = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
    on = alpha > 20
    mag = (r > 150) & (b > 150) & (g < 110)
    grn = (g > 170) & (r < 110) & (b < 110) & (g - np.maximum(r, b) > 90)
    cyn = (g > 170) & (b > 170) & (r < 90)
    return on & (mag | grn | cyn)

def judge(name, rgba):
    a = rgba[..., 3]; h, w = a.shape; art = a > 40
    x0, y0, x1, y1 = round(w * WX0), round(h * WY0), round(w * WX1), round(h * WY1)
    cover = art[y0:y1, x0:x1].mean() * 100
    # spill: art on the outermost 2px ring of the cell (anything that reached the edge was cut off there)
    ring = np.zeros_like(art); ring[:2, :] = ring[-2:, :] = ring[:, :2] = ring[:, -2:] = True
    spill = (art & ring).sum() / max(1, ring.sum()) * 100
    fringe = fringe_mask(rgba[..., :3], a).sum() / max(1, art.sum()) * 100
    rails = [art[:y0, x0:x1].mean(), art[y1:, x0:x1].mean(), art[y0:y1, :x0].mean(), art[y0:y1, x1:].mean()]
    present = min(rails) * 100
    bad = []
    if cover > LIM['cover']: bad.append('COVER')
    if spill > LIM['spill']: bad.append('SPILL')
    if fringe > LIM['fringe']: bad.append('FRINGE')
    if present < LIM['present']: bad.append('THIN RAIL')
    print(f" {'ok  ' if not bad else '⛔  '} {name:<28} cover {cover:5.1f}%  spill {spill:4.1f}%  fringe {fringe:4.2f}%  thinnest rail {present:4.0f}%  {' '.join(bad)}")
    return not bad

def cut_sheet(path, cols=4, rows=2):
    im = Image.open(path).convert('RGB'); W, H = im.size
    if abs((W / cols) / (H / rows) - CW / CH) > 0.01:
        print(f"⛔ {path}: {W}x{H} is not {cols}x{rows} cells of 528x416 proportion (got {(W/cols)/(H/rows):.3f}, want {CW/CH:.3f})"); return []
    rgb = np.asarray(im); keyed = key_colors(rgb)
    alpha = np.where(keyed, 0, 255).astype(np.uint8)
    rgba = np.dstack([rgb, alpha])
    cw, ch = W // cols, H // rows
    cells = []
    for r in range(rows):
        for c in range(cols):
            cells.append((f"{os.path.basename(path)[:-4]}_{r*cols+c+1}", rgba[r*ch:(r+1)*ch, c*cw:(c+1)*cw]))
    return cells

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'pack'
    cells = []
    if mode == 'sheet':
        cols, rows = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (4, 2)
        cells = cut_sheet(sys.argv[2], cols, rows)
    else:
        files = sorted(glob.glob('satellites/hues/borders/pack/*.png')) if mode == 'pack' else \
                [f for a in sys.argv[2:] for f in (sorted(glob.glob(os.path.join(a, '*.png'))) if os.path.isdir(a) else [a])]
        for f in files: cells.append((os.path.basename(f)[:-4], np.asarray(Image.open(f).convert('RGBA'))))
    ok = [judge(n, c) for n, c in cells]
    n = len(ok); good = sum(ok)
    print(f"\n{'✅' if good == n and n else '⛔'} {good} of {n} frames pass")
    if mode == 'sheet' and n and good == n:
        out = sys.argv[2][:-4] + '-cut'; os.makedirs(out, exist_ok=True)
        for name, c in cells: Image.fromarray(c).save(os.path.join(out, name + '.png'))
        print(f"cut frames written to {out}/")
    sys.exit(0 if (n and good == n) else 1)

if __name__ == '__main__': main()
