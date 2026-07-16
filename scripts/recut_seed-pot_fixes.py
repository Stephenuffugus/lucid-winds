"""Targeted Seed Pot re-cuts (Stephen 3AM notes 2026-07-16):
tier7 golden flower was grid-cut — the sprite OVERFLOWS its cell, so the top
clipped and a neighbor fragment rode along; icon_gear caught pill-button bleed.
This cut is COMPONENT-based: key magenta on the whole sheet, label connected
components, keep only the component(s) whose centroid falls in the target
cell, mask everything else, crop to the kept union. Grid lines stop mattering.
Masters: satellites/seed-pot/art-drop/ (re-downloaded from Drive Done/Seed Pot).
"""
import os, numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = "satellites/seed-pot/art-drop"
OUT = "satellites/seed-pot/assets"
CELL = 1254 / 4.0

def load(sheet):
    im = Image.open(os.path.join(SRC, sheet)).convert("RGB")
    a = np.asarray(im).astype(np.int32)
    d = np.sqrt((a[:,:,0]-255)**2 + (a[:,:,1])**2 + (a[:,:,2]-255)**2)
    alpha = np.clip((d - 40) / 80.0, 0, 1)          # soft key edge
    return a.astype(np.uint8), alpha

def cell_rect(col, row, grow=18):
    x0, y0 = (col-1)*CELL, (row-1)*CELL
    return (x0-grow, y0-grow, x0+CELL+grow, y0+CELL+grow)

def cut(sheet, col, row, out, edge, keep_all_in_cell, minpix=60):
    rgb, alpha = load(sheet)
    lab, n = ndi.label(alpha > 0.35)
    if not n: raise SystemExit("no components on "+sheet)
    idx = np.arange(1, n+1)
    cys, cxs = zip(*ndi.center_of_mass(alpha > 0.35, lab, idx))
    sizes = ndi.sum(np.ones_like(lab), lab, idx)
    x0, y0, x1, y1 = cell_rect(col, row)
    keep = []
    ccx, ccy = (col-0.5)*CELL, (row-0.5)*CELL
    if keep_all_in_cell:
        for i, (cx, cy, s) in enumerate(zip(cxs, cys, sizes)):
            if x0 <= cx <= x1 and y0 <= cy <= y1 and s >= minpix: keep.append(i+1)
    else:
        best, bd = None, 1e18
        for i, (cx, cy, s) in enumerate(zip(cxs, cys, sizes)):
            if s < 2000: continue
            d = (cx-ccx)**2 + (cy-ccy)**2
            if d < bd: bd, best = d, i+1
        keep = [best]
    m = np.isin(lab, keep)
    a2 = np.where(m, alpha, 0.0)
    ys, xs = np.where(a2 > 0.02)
    pad = 8
    by0, by1 = max(0, ys.min()-pad), min(a2.shape[0], ys.max()+pad+1)
    bx0, bx1 = max(0, xs.min()-pad), min(a2.shape[1], xs.max()+pad+1)
    rgba = np.dstack([rgb, (a2*255).astype(np.uint8)])[by0:by1, bx0:bx1]
    # feather any side that sits on the sheet edge (glow ran off the master)
    F = 6
    if by0 == 0:            rgba[:F,:,3]  = (rgba[:F,:,3].astype(float)  * (np.arange(F)/F)[:,None]).astype(np.uint8)
    if by1 == a2.shape[0]:  rgba[-F:,:,3] = (rgba[-F:,:,3].astype(float) * (np.arange(F)[::-1]/F)[:,None]).astype(np.uint8)
    if bx0 == 0:            rgba[:,:F,3]  = (rgba[:,:F,3].astype(float)  * (np.arange(F)/F)[None,:]).astype(np.uint8)
    if bx1 == a2.shape[1]:  rgba[:,-F:,3] = (rgba[:,-F:,3].astype(float) * (np.arange(F)[::-1]/F)[None,:]).astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    w, h = im.size
    sc = edge / float(max(w, h))
    if sc < 1: im = im.resize((int(w*sc), int(h*sc)), Image.LANCZOS)
    p = os.path.join(OUT, out)
    im.save(p, optimize=True)
    print(out, im.size, round(os.path.getsize(p)/1024, 1), "KB")

cut("sheet1.png", 3, 4, "tiers/tier7_idle.png", 256, False)
cut("sheet1.png", 4, 4, "tiers/tier7_pop.png", 280, True)
cut("sheet6.png", 2, 3, "ui/icon_gear.png", 220, False)
