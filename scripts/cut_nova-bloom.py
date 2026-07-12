#!/usr/bin/env python3
"""Cut the Nova Bloom "Vector Nova" art pack into named game assets.

Reuses the Dew Snip / Nectar Drop magenta-KEY-distance pipeline verbatim
(sample flat #FF00FF key from a corner, mask by colour DISTANCE not hue so the
neon glows survive, despill, connected-component keep, alpha trim). Three modes:
  - "cut"      : magenta knockout grid cell -> alpha-trimmed transparent PNG.
  - "cellfull" : knockout to transparent but KEEP the full cell bounds (radial
                 FX / square frames that must stay centred).
  - "bgfile"   : an individual full-bleed portrait PNG (NOT a grid) -> resized
                 to <=1600 long edge (Hostinger resizer floor) opaque JPG <150KB.

Sheet -> role mapping was verified by EYE against art-asset-lists/nova-bloom/*.md
(aspect + content), NOT by filename:
  sheet1 = 01 ships+trails (2x4)        sheet2 = 02 enemies (2x4)
  sheet3 = 03 fx (3x4)                  sheet8 = 05 ui chrome (3x4)
  sheet4 = 04 backdrop MIDNIGHT MEADOW  sheet5 = 04 backdrop DEEP VIOLET
  sheet6 = 04 backdrop DAWN CHORUS      sheet7 = 04 backdrop TITLE

Outputs STAGE into satellites/nova-bloom/assets/{sprites,fx,ui,bg}/ so the
drop-in backdrop wiring can address bg/bg_<pal>.jpg directly.

Usage:
  python3 scripts/cut_nova-bloom.py [SRC_DIR] [OUT_DIR] [only]
    SRC_DIR  dir holding sheet1.png..sheet8.png (default = art pack in scratchpad)
    OUT_DIR  staging output (default satellites/nova-bloom/assets)
    only     one of: ships enemies fx ui bg  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/dcdc7df0-dfcf-4605-8196-38934935c607/scratchpad/artpacks/Nova Bloom"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/nova-bloom/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

# ---- knockout grid sheets: (src_file, cols, rows, cells[]) --------------------
def c(path, edge, mode="cut"): return (path, edge, mode)

SHEETS = {
 # Sheet 01 — Seedcraft ships (row1) + petal-fire trail swatches (row2). 2x4, 256 cells.
 "ships": ("sheet1.png", 4, 2, [
    c("sprites/ship_dandelion",256), c("sprites/ship_maple",256),   c("sprites/ship_firefly",256), c("sprites/ship_comet",256),
    c("sprites/trail_ember",256),    c("sprites/trail_petal",256),  c("sprites/trail_aurora",256), c("sprites/trail_cream",256),
 ]),
 # Sheet 02 — Enemy constellation. 2x4. moth/wasp/dart/mine ; serpent head/segment ; bulb/overfed.
 "enemies": ("sheet2.png", 4, 2, [
    c("sprites/enemy_moth",256),         c("sprites/enemy_wasp",256),            c("sprites/enemy_dart",256), c("sprites/enemy_mine",256),
    c("sprites/enemy_serpent_head",256), c("sprites/enemy_serpent_segment",256), c("sprites/enemy_bulb",256), c("sprites/enemy_bulb_overfed",256),
 ]),
 # Sheet 03 — FX: flower stages / pollen / bomb / death / gates / spark. 3x4, 220 cells.
 "fx": ("sheet3.png", 4, 3, [
    c("fx/flower_sprout",220),  c("fx/flower_bud",220),      c("fx/flower_mature",220),        c("fx/flower_burst",240),
    c("fx/pollen_mote",180),    c("fx/pollen_cluster",220),  c("fx/bloom_bomb",360,"full"),    c("fx/death_burst",320),
    c("fx/gate",300),           c("fx/gate_detonate",340,"full"), c("fx/serpent_chain",320),   c("fx/impact_spark",200),
 ]),
 # Sheet 05 — UI chrome plates. 3x4, 300x160 cells.
 "ui": ("sheet8.png", 4, 3, [
    c("ui/hud_chip_sage",300),        c("ui/hud_chip_gold",300),        c("ui/icon_btn",200),      c("ui/icon_btn_active",200),
    c("ui/bomb_btn",300),             c("ui/bomb_btn_charged",300),     c("ui/mode_btn",300),      c("ui/mode_btn_pressed",300),
    c("ui/keepsake_frame_sage",220,"full"), c("ui/keepsake_frame_gold",220,"full"), c("ui/toast_plate",300), c("ui/pause_panel",280),
 ]),
}

# ---- individual full-bleed backdrops: (relpath, src_file, maxedge) ------------
BGFILES = [
 ("bg/bg_meadow", "sheet4.png", 1600),   # MIDNIGHT MEADOW  -> PROG.pal "meadow"
 ("bg/bg_violet", "sheet5.png", 1600),   # DEEP VIOLET      -> PROG.pal "violet"
 ("bg/bg_dawn",   "sheet6.png", 1600),   # DAWN CHORUS      -> PROG.pal "dawn"
 ("bg/bg_title",  "sheet7.png", 1600),   # TITLE hero shot  -> #s-title CSS bg
]

# ---- magenta key machinery (ported verbatim from cut_dewsnip.py) --------------
def sample_key(a):
    H,W = a.shape[:2]; s=10
    cands=[a[0:s,0:s], a[0:s,W-s:W], a[H-s:H,0:s], a[H-s:H,W-s:W]]
    best=None
    for cc in cands:
        m = cc.reshape(-1,3).astype(float).mean(0)
        if m[0]>150 and m[2]>150 and m[1]<90:
            if best is None or m[1] < best[1]: best=m
    return best

def magenta_mask(a, key=None):
    R,G,B = a[:,:,0].astype(np.float32), a[:,:,1].astype(np.float32), a[:,:,2].astype(np.float32)
    if key is not None:
        d = np.sqrt((R-key[0])**2 + (G-key[1])**2 + (B-key[2])**2)
        return d < 100.0
    hue = (R > G+24) & (B > G+24)
    return hue & (np.minimum(R,B) > 150) & (G < 85)

def despill(a):
    Rf,Gf,Bf = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = ((Rf+Bf)//2 - Gf) > 30
    Rf2 = np.where(lean, np.minimum(Rf, Gf+40), Rf)
    Bf2 = np.where(lean, np.minimum(Bf, Gf+40), Bf)
    return np.dstack([Rf2, Gf, Bf2]).astype(np.uint8)

def fit(im, maxedge):
    w,h = im.size; m = max(w,h)
    if m > maxedge:
        r = maxedge/m; im = im.resize((max(1,int(w*r)), max(1,int(h*r))), Image.LANCZOS)
    return im

def save_png(im, path, maxedge):
    p = P(path+".png"); e = maxedge
    for _ in range(6):
        fit(im, e).save(p, optimize=True)
        if os.path.getsize(p) <= 150*1024 or e < 90: break
        e = int(e*0.82)
    return p

def save_jpg(im, path, maxedge):
    base = im.convert("RGB"); p = P(path+".jpg"); e = maxedge
    for _ in range(7):
        cur = fit(base, e); q = 86; cur.save(p, quality=q)
        while os.path.getsize(p) > 150*1024 and q > 46:
            q -= 6; cur.save(p, quality=q)
        if os.path.getsize(p) <= 150*1024 or e < 700: break
        e = int(e*0.85)
    return p, q

def cut_cell(cell, path, maxedge, key, keep_full=False):
    ch,cw = cell.shape[:2]
    fg = ~magenta_mask(cell, key)
    fg = ndi.binary_opening(fg, iterations=1)
    fg = ndi.binary_erosion(fg, iterations=1)
    fg = ndi.binary_closing(fg, iterations=2)
    lbl,n = ndi.label(fg)
    if n==0: print("   EMPTY",path); return None
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1,n+1))
    biggest = sizes.max()
    keep = np.zeros_like(fg)
    for i in range(1,n+1):
        if sizes[i-1] >= max(40, biggest*0.02): keep |= (lbl==i)
    if not keep.any(): print("   NOISE",path); return None
    m = ndi.binary_dilation(keep, iterations=1)
    if keep_full:
        y0,y1,x0,x1 = 0,ch,0,cw
    else:
        ys,xs = np.where(m)
        y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
        pad=4
        y0,x0 = max(0,y0-pad),max(0,x0-pad); y1,x1=min(ch,y1+pad),min(cw,x1+pad)
    rgb = despill(cell)[y0:y1,x0:x1]
    alpha = ndi.gaussian_filter((m[y0:y1,x0:x1].astype(np.uint8))*255, 0.6)
    out = np.dstack([rgb,alpha]).astype(np.uint8)
    save_png(Image.fromarray(out,"RGBA"), path, maxedge)
    return (x1-x0, y1-y0)

def process_sheet(key_name):
    src_file, cols, rows, cells = SHEETS[key_name]
    fp = os.path.join(SRC, src_file)
    if not os.path.exists(fp):
        print("!! MISSING", fp, "-- skip"); return
    im = Image.open(fp).convert("RGB")
    a = np.asarray(im); H,W = a.shape[:2]
    key = sample_key(a)
    cw,chh = W/cols, H/rows
    ok=0
    for idx,spec in enumerate(cells):
        if spec is None: continue
        path,maxedge,mode = (spec[0], spec[1], (spec[2] if len(spec)>2 else "cut"))
        rr,cc = idx//cols, idx%cols
        y0,y1 = int(round(rr*chh)), int(round((rr+1)*chh))
        x0,x1 = int(round(cc*cw)),  int(round((cc+1)*cw))
        cell = a[y0:y1, x0:x1]
        r = cut_cell(cell, path, maxedge, key, keep_full=(mode=="full"))
        if r: print("  %-34s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s (%s): %d/%d assets"%(key_name, src_file, ok, len([x for x in cells if x])))

def process_bg():
    ok=0
    for relpath, src_file, maxedge in BGFILES:
        fp = os.path.join(SRC, src_file)
        if not os.path.exists(fp): print("!! MISSING", fp, "-- skip"); continue
        im = Image.open(fp).convert("RGB")
        _,q = save_jpg(im, relpath, maxedge)
        print("  %-30s bg src %dx%d q%d"%(relpath, im.size[0], im.size[1], q)); ok+=1
    print("bg: %d/%d files"%(ok, len(BGFILES)))

todo = ["ships","enemies","fx","ui","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bg()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown target", s)
print("DONE ->", OUT)
