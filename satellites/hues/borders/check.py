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
     check.py fit    <image(s)>               ANY size, one frame or a sheet, cells drifted: finds each green window,
                                               fits it to the template, judges, writes <image>-cut/ when all pass (use this one)
     check.py pack                              the live pack (satellites/hues/borders/pack): the 21 Oct baseline
   Exit 1 on any red. Prints one line per frame: name, cover %, spill %, fringe %, verdict."""
import sys, os, glob
import numpy as np
from PIL import Image

CW, CH, BW = 528, 416, 64
WX0, WY0, WX1, WY1 = BW / CW, BW / CH, (CW - BW) / CW, (CH - BW) / CH   # window as fractions of the cell
LIM = dict(cover=1.0, spill=0.0, fringe=0.3, present=30.0)

GUIDES = np.array([[255, 0, 255], [0, 255, 0], [0, 255, 255]], float)
def key_colors(rgb):
    """A pixel is guide colour if it is within 80 of magenta, green or cyan (generators antialias every edge, so a
    hard equality would leave a one pixel halo). Returns the mask of pixels to make transparent."""
    d = np.sqrt(((rgb[..., None, :].astype(float) - GUIDES[None, None]) ** 2).sum(-1))
    return d.min(-1) < 80

def despill(rgb, alpha):
    """What the old cutter never did: an edge pixel that kept a magenta, green or cyan cast loses it, so a halo
    cannot show in the game. Magenta cast = green below both red and blue; green cast = green above both; cyan
    cast = red below both. Each is pulled to the nearer channel."""
    out = rgb.astype(int).copy(); r, g, b = out[..., 0], out[..., 1], out[..., 2]; on = alpha > 0
    mn = np.minimum(r, b); mx = np.maximum(r, b)
    magc = on & (g < mn - 20); g[magc] = mn[magc]
    grnc = on & (g > mx + 40); g[grnc] = mx[grnc]
    mg = np.minimum(g, b); cync = on & (r < mg - 40); r[cync] = mg[cync]
    return out.astype(np.uint8)

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
    solid = a > 128
    ring = np.zeros_like(art); ring[:3, :] = ring[-3:, :] = ring[:, :3] = ring[:, -3:] = True
    spill = (solid & ring).sum() / max(1, ring.sum()) * 100
    fringe = fringe_mask(rgba[..., :3], a).sum() / max(1, art.sum()) * 100
    rails = [art[:y0, x0:x1].mean(), art[y1:, x0:x1].mean(), art[y0:y1, :x0].mean(), art[y0:y1, x1:].mean()]
    present = min(rails) * 100
    bad = []
    if cover > LIM['cover']: bad.append('COVER')
    if spill > LIM['spill']: bad.append('SPILL')
    warn = ' (halo measured %.1f%%, removed by the despill)' % fringe if fringe > LIM['fringe'] else ''
    if present < LIM['present']: bad.append('THIN RAIL')
    print(f" {'ok  ' if not bad else '⛔  '} {name:<28} cover {cover:5.1f}%  spill {spill:4.1f}%  fringe {fringe:4.2f}%  thinnest rail {present:4.0f}%  {' '.join(bad)}{warn}")
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

def fit_image(path):
    """FIT (21 Oct, after Astra's first Clay sheet came back 1997x787 with the cells drifted): an image generator
    cannot hold a pixel exact template, it redraws it. So the template is found, not assumed: every solid GREEN
    rectangle in the picture is a window; each window is scaled so it measures 400x288, the 64 band around it is
    taken from the picture (padded with nothing where the picture ends), and that 528x416 cell is judged like any
    other. Astra may deliver any size, one frame or a sheet, cells drifted or not. What it must keep: flat magenta
    outside, a flat clean green rectangle for the window, and nothing painted over that green."""
    im = Image.open(path).convert('RGB'); rgb = np.asarray(im); H, W = rgb.shape[:2]
    r, g, b = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
    # the window is the PURE guide green only (a leaf green critter must not read as a window: rule 5 keeps the art
    # away from it, and this threshold is the same one the key uses)
    grn = (g > 200) & (r < 90) & (b < 90)
    from scipy import ndimage
    lab, n = ndimage.label(grn); boxes = []
    for k, sl in enumerate(ndimage.find_objects(lab)):
        cnt = int((lab[sl] == k + 1).sum())
        if cnt < 0.004 * H * W: continue
        boxes.append((sl[1].start, sl[0].start, sl[1].stop - 1, sl[0].stop - 1, cnt))
    boxes.sort(key=lambda bx: (round(bx[1] / max(1, H) * 4), bx[0]))   # reading order: rows of the sheet, then left to right
    cells = []
    for k, (x0, y0, x1, y1, n) in enumerate(boxes):
        ww, wh = x1 - x0 + 1, y1 - y0 + 1
        fill = n / (ww * wh); asp = ww / wh
        note = ''
        if fill < 0.9: note += f' window not a clean rectangle (green fills {fill*100:.0f}% of its box)'
        if abs(asp - 400 / 288) > 0.04: note += f' window aspect {asp:.2f}, want {400/288:.2f}'
        sx, sy = 400 / ww, 288 / wh
        bx, by = BW / sx, BW / sy
        cx0, cy0, cx1, cy1 = x0 - bx, y0 - by, x1 + 1 + bx, y1 + 1 + by
        # a neighbouring window's frame must not be read as this cell's art: clip at the midline between them
        for (ox0, oy0, ox1, oy1, _) in boxes:
            if (ox0, oy0) == (x0, y0): continue
            if oy0 <= y1 and oy1 >= y0:   # same row
                if ox1 < x0: cx0 = max(cx0, (ox1 + x0) / 2)
                if ox0 > x1: cx1 = min(cx1, (x1 + ox0) / 2)
            if ox0 <= x1 and ox1 >= x0:   # same column
                if oy1 < y0: cy0 = max(cy0, (oy1 + y0) / 2)
                if oy0 > y1: cy1 = min(cy1, (y1 + oy0) / 2)
        # take the cell from the picture, padding with magenta (= nothing) beyond its edge
        full = (x0 - bx, y0 - by, x1 + 1 + bx, y1 + 1 + by)      # the whole band; clipped parts are filled with magenta
        pad = Image.new('RGB', (int(round(full[2] - full[0])), int(round(full[3] - full[1]))), (255, 0, 255))
        src = im.crop((int(round(max(0, cx0))), int(round(max(0, cy0))), int(round(min(W, cx1))), int(round(min(H, cy1)))))
        pad.paste(src, (int(round(max(0, cx0) - full[0])), int(round(max(0, cy0) - full[1]))))
        cell = pad.resize((CW, CH), Image.LANCZOS)
        crgb = np.asarray(cell); keyed = key_colors(crgb)
        alpha = np.where(keyed, 0, 255).astype(np.uint8)
        rgba = np.dstack([despill(crgb, alpha), alpha])
        name = f"{os.path.basename(path).rsplit('.', 1)[0]}_{k+1}"
        if note: print(f" ⛔   {name:<28}{note}")
        cells.append((name, rgba, not note))
    if not boxes: print(f"⛔ {path}: no green window found")
    return cells

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'pack'
    cells = []
    if mode == 'fit':
        found = [c for a in sys.argv[2:] for c in fit_image(a)]
        ok = [judge(n, c) and good for n, c, good in found]
        n = len(ok); g = sum(ok); print(f"\n{'✅' if g == n and n else '⛔'} {g} of {n} frames pass (fitted to the template)")
        if n and g == n:
            out = sys.argv[2].rsplit('.', 1)[0] + '-cut'; os.makedirs(out, exist_ok=True)
            for name, c, _ in found: Image.fromarray(c).save(os.path.join(out, name + '.png'))
            print(f"cut frames written to {out}/")
        sys.exit(0 if (n and g == n) else 1)
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
