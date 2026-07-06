#!/usr/bin/env python3
"""Cut Burr Blast sprite sheets into named game assets.

Two modes:
  magenta  -> chroma-key #FF00FF bg, despill fringe, connected-component sprite
              extraction, map each blob to its grid cell, crop -> transparent PNG.
  contact  -> full-bleed background/comic contact sheet (dark gutters, no key):
              even grid crop each cell, trim gutters -> JPG.

One sheet per invocation (box is 8GB/no-swap; never load them all at once).
Outputs to a STAGING dir; nothing touches the game until verified.
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-1000/-workspaces-lucid-winds/04c06853-cf9d-4759-8631-a9ccdad3d604/scratchpad/burrblast/Burr Blast"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/tmp/claude-1000/-workspaces-lucid-winds/04c06853-cf9d-4759-8631-a9ccdad3d604/scratchpad/cutouts"
which = sys.argv[3] if len(sys.argv) > 3 else "all"
os.makedirs(OUT, exist_ok=True)

# (cols, rows, [names row-major; None = empty cell])
GRID = {
 "sheet1": (4, 2, ["bramble","weevil-king","aphid","pest-nettle",
                   "pest-pebblejaw","pest-glazier","pest-fuse",None]),
 "sheet2": (4, 3, ["seed-burr","seed-split","seed-acorn","seed-puffball",
                   "seed-thornpod","seed-boomerang","seed-gourd","seed-firethorn",
                   "seed-dandelion","nutrient-n","nutrient-p","nutrient-k"]),
 "sheet3": (4, 3, ["relic-secondwind","relic-fatseeds","relic-splitter","relic-longfuse",
                   "relic-featherfall","relic-brittle","relic-prospector","relic-glasscannon",
                   "fertilizer","sap","vigor","star"]),
 "sheet4": (5, 2, ["companion-bee","companion-mammoth","companion-worm","companion-koi","companion-pangolin",
                   "companion-firefly","companion-spider","companion-raccoon","companion-scarab","companion-beholder"]),
}
# contact sheets: (cols, rows, [names], gutter_trim_px)
CONTACT = {
 "sheet6a": (3, 2, ["bg-world1","bg-world2","bg-world3","bg-world4","menu-bg",None], 10),
 "sheet7":  (4, 2, ["comic-1","comic-2","comic-3","comic-4","comic-5","comic-6","comic-end",None], 8),
}

def magenta_mask(a):
    R,G,B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    return (R > 200) & (B > 180) & (G < 95)

def cut_magenta(name, cols, rows, names):
    im = Image.open(os.path.join(SRC, name + ".png")).convert("RGB")
    a = np.asarray(im)
    H, W = a.shape[:2]
    bg = magenta_mask(a)
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=1)   # drop 1px speckle
    fg = ndi.binary_erosion(fg, iterations=2)   # eat the magenta fringe ring
    fg = ndi.binary_closing(fg, iterations=1)   # re-close small gaps inside the sprite
    lbl, n = ndi.label(fg)
    if n == 0:
        print(f"{name}: NO sprites found"); return
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n+1))
    cents = ndi.center_of_mass(fg, lbl, range(1, n+1))   # (cy,cx) per label
    cellW, cellH = W/cols, H/rows
    # assign each non-tiny blob to a grid cell
    cell_blobs = {}   # (r,c) -> [label ids]
    for i in range(1, n+1):
        if sizes[i-1] < 400: continue                    # noise
        cy, cx = cents[i-1]
        r = min(rows-1, int(cy // cellH)); c = min(cols-1, int(cx // cellW))
        cell_blobs.setdefault((r,c), []).append(i)
    # despill: pull R,B toward G on magenta-leaning pixels (kills pink halo)
    Rf,Gf,Bf = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    mag = ((Rf + Bf)//2 - Gf)
    lean = mag > 25
    Rf2 = np.where(lean, np.minimum(Rf, Gf + 35), Rf)
    Bf2 = np.where(lean, np.minimum(Bf, Gf + 35), Bf)
    rgb = np.dstack([Rf2, Gf, Bf2]).astype(np.uint8)
    saved = 0
    for idx, nm in enumerate(names):
        if not nm: continue
        r, c = idx // cols, idx % cols
        ids = cell_blobs.get((r,c), [])
        if not ids:
            print(f"  {nm}: (no sprite in cell r{r}c{c})"); continue
        m = np.isin(lbl, ids)
        m = ndi.binary_dilation(m, iterations=2)          # restore the 2px we eroded
        ys, xs = np.where(m)
        y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
        pad = 6
        y0,x0 = max(0,y0-pad), max(0,x0-pad); y1,x1 = min(H,y1+pad), min(W,x1+pad)
        sub_rgb = rgb[y0:y1, x0:x1]
        alpha = (m[y0:y1, x0:x1].astype(np.uint8) * 255)
        alpha = ndi.gaussian_filter(alpha, 0.6)           # feather 0.5px for a soft edge
        out = np.dstack([sub_rgb, alpha]).astype(np.uint8)
        Image.fromarray(out, "RGBA").save(os.path.join(OUT, nm + ".png"))
        print(f"  {nm}.png  {x1-x0}x{y1-y0}")
        saved += 1
    print(f"{name}: {saved} cutouts")

def cut_sheet5():
    """special: wide logo band across the top, then 5 nodes + (4 slings + empty)."""
    name="sheet5"
    im = Image.open(os.path.join(SRC, name + ".png")).convert("RGB")
    a = np.asarray(im); H, W = a.shape[:2]
    bg = magenta_mask(a); fg = ~bg
    fg = ndi.binary_opening(fg, iterations=1)
    fg = ndi.binary_erosion(fg, iterations=2)
    fg = ndi.binary_closing(fg, iterations=1)
    lbl, n = ndi.label(fg)
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n+1))
    cents = ndi.center_of_mass(fg, lbl, range(1, n+1))
    Rf,Gf,Bf = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = ((Rf+Bf)//2 - Gf) > 25
    rgb = np.dstack([np.where(lean, np.minimum(Rf,Gf+35), Rf), Gf,
                     np.where(lean, np.minimum(Bf,Gf+35), Bf)]).astype(np.uint8)
    SPLIT = int(0.42*H)
    def save_from(ids, nm):
        m = np.isin(lbl, ids); m = ndi.binary_dilation(m, iterations=2)
        ys, xs = np.where(m)
        if len(ys)==0: print(f"  {nm}: empty"); return
        y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
        pad=6; y0,x0=max(0,y0-pad),max(0,x0-pad); y1,x1=min(H,y1+pad),min(W,x1+pad)
        alpha = ndi.gaussian_filter(m[y0:y1,x0:x1].astype(np.uint8)*255, 0.6)
        out = np.dstack([rgb[y0:y1,x0:x1], alpha]).astype(np.uint8)
        Image.fromarray(out,"RGBA").save(os.path.join(OUT, nm+".png"))
        print(f"  {nm}.png  {x1-x0}x{y1-y0}")
    logo_ids, grid = [], {}
    gcols=5; regH=(H-SPLIT)/2; cellW=W/gcols
    for i in range(1, n+1):
        if sizes[i-1] < 400: continue
        cy, cx = cents[i-1]
        if cy < SPLIT: logo_ids.append(i)
        else:
            r = min(1, int((cy-SPLIT)//regH)); c = min(gcols-1, int(cx//cellW))
            grid.setdefault((r,c), []).append(i)
    save_from(logo_ids, "logo")
    gnames = ["node-fort","node-elite","node-cache","node-shed","node-boss",
              "sling-oak","sling-willow","sling-iron","sling-gold",None]
    for idx, nm in enumerate(gnames):
        if not nm: continue
        ids = grid.get((idx//gcols, idx%gcols), [])
        if ids: save_from(ids, nm)
        else: print(f"  {nm}: (no sprite)")

def cut_contact(name, cols, rows, names, trim):
    im = Image.open(os.path.join(SRC, name + ".png")).convert("RGB")
    W, H = im.size
    cellW, cellH = W/cols, H/rows
    saved = 0
    for idx, nm in enumerate(names):
        if not nm: continue
        r, c = idx // cols, idx % cols
        x0 = int(round(c*cellW)) + trim; y0 = int(round(r*cellH)) + trim
        x1 = int(round((c+1)*cellW)) - trim; y1 = int(round((r+1)*cellH)) - trim
        crop = im.crop((x0, y0, x1, y1))
        crop.save(os.path.join(OUT, nm + ".jpg"), quality=90)
        print(f"  {nm}.jpg  {x1-x0}x{y1-y0}")
        saved += 1
    print(f"{name}: {saved} crops")

todo = list(GRID.keys()) + ["sheet5"] + list(CONTACT.keys()) if which == "all" else [which]
for name in todo:
    if name == "sheet5":  cut_sheet5()
    elif name in GRID:    cut_magenta(name, *GRID[name])
    elif name in CONTACT: cut_contact(name, *CONTACT[name])
    else: print("unknown sheet:", name)
