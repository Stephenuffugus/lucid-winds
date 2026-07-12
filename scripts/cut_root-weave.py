#!/usr/bin/env python3
"""Cut the Root Weave "Inkwood Atlas" art pack into named game assets.

Reuses the Nova Bloom / Dew Snip magenta-KEY-distance pipeline verbatim
(sample flat #FF00FF key from a corner, mask by colour DISTANCE not hue so the
gold glows survive, despill, connected-component keep, alpha trim). Modes:
  - "cut"  : magenta knockout grid cell -> alpha-trimmed transparent PNG.
  - "full" : knockout to transparent but KEEP full cell bounds (centred rings/FX).
  - bgfile : an individual full-bleed portrait PNG -> <=1600 long edge JPG <150KB.

Sheet -> role mapping verified by EYE against art-asset-lists/root-weave/*.md
(content, NOT filename order):
  sheet1 = 01 bulbs   (4x4, 512)   sheet2 = 02 vines  (4x3, 512x256)
  sheet3 = 03 blooms  (4x3, 512)   sheet9 = 06 fx     (4x3, 512)
  sheet4 = bg MIDNIGHT  sheet5 = bg LOAM  sheet6 = bg TERRACE  sheet7 = bg DAWN
  sheet8 = 05 ui       (irregular NON-grid free layout -> NOT cut here; UI is
           CSS-plated and lowest priority; would slice the tall level cards)

Outputs into satellites/root-weave/assets/{bulbs,vines,blooms,backgrounds,fx}/.

Usage:
  python3 scripts/cut_root-weave.py [SRC_DIR] [OUT_DIR] [only]
    only in: bulbs vines blooms fx bg  (default all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/c1cd2839-a799-47c5-954b-ca2fed064633/scratchpad/rootweave-raw/Root Weave"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/root-weave/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

def c(path, edge, mode="cut"): return (path, edge, mode)

# ---- knockout grid sheets: (src_file, cols, rows, cells[]) --------------------
SHEETS = {
 # Sheet 01 — bulb medallions. 4x4, 512 cells.
 "bulbs": ("sheet1.png", 4, 4, [
    c("bulbs/bulb_pearl",256),       c("bulbs/bulb_pearl_grab",256), c("bulbs/bulb_acorn",256),      c("bulbs/bulb_dewdrop",256),
    c("bulbs/bulb_firefly",256),     c("bulbs/bulb_star",256),       c("bulbs/taproot_bulb",300),    c("bulbs/taproot_roots",256),
    c("bulbs/bulb_pearl_small",200), c("bulbs/crossing_x",200),      c("bulbs/hold_ring",256,"full"),c("bulbs/nudge_ghost",256,"full"),
    c("bulbs/bulb_ring_select",256,"full"), c("bulbs/knot_burr",200), c("bulbs/mini_mandala",200),    c("bulbs/moon_fleck",180),
 ]),
 # Sheet 02 — root strokes (horizontal tiles). 4x3, 512x256 cells.
 "vines": ("sheet2.png", 4, 3, [
    c("vines/vine_classic",512),     c("vines/vine_classic_glow",512), c("vines/vine_braided",512),  c("vines/vine_blossom",512),
    c("vines/vine_aurora",512),      c("vines/gnarl_segment",512),     c("vines/gnarl_segment_alt",512), c("vines/gnarl_end_fray",512),
    c("vines/vine_end_leaf",512),    c("vines/root_shadow",512),       c("vines/crossing_x_big",256), c("vines/dash_guide",512),
 ]),
 # Sheet 03 — win blooms + mandala keepsakes. 4x3, 512.
 "blooms": ("sheet3.png", 4, 3, [
    c("blooms/bloom_petal_rose",256), c("blooms/bloom_petal_gold",256), c("blooms/bloom_center",256), c("blooms/bloom_full",360,"full"),
    c("blooms/mandala_ring_sage",320,"full"), c("blooms/mandala_ring_gold",320,"full"), c("blooms/mandala_ring_dew",320,"full"), c("blooms/mandala_heart",200),
    c("blooms/keepsake_frame",320,"full"), c("blooms/streak_ember",240),  c("blooms/par_laurel",256),  c("blooms/clean_drop",220),
 ]),
 # Sheet 06 — FX. 4x3, 512.
 "fx": ("sheet9.png", 4, 3, [
    c("fx/snap_sparkle",256),  c("fx/gnarl_puff",240),   c("fx/hold_ring_glow",320,"full"), c("fx/bloom_burst",360,"full"),
    c("fx/mandala_press",320,"full"), c("fx/candle_flame",240), c("fx/drag_trail",256),       c("fx/taproot_shake",240),
    c("fx/streak_ribbon",256), c("fx/dew_fleck_drift",256), c("fx/win_wash",360,"full"),      c("fx/zen_moth",256),
 ]),
}

# ---- individual full-bleed backdrops: (relpath, src_file, maxedge) ------------
BGFILES = [
 ("backgrounds/bg_midnight", "sheet4.png", 1600),
 ("backgrounds/bg_loam",     "sheet5.png", 1600),
 ("backgrounds/bg_terrace",  "sheet6.png", 1600),
 ("backgrounds/bg_dawn",     "sheet7.png", 1600),
]

# ---- magenta key machinery (ported verbatim from cut_nova-bloom.py) -----------
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

def cut_cell(cell, path, maxedge, key, keep_full=False, nodespill=False):
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
    rgb = (cell if nodespill else despill(cell))[y0:y1,x0:x1]
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
        # warning-red ✗ reads as magenta-leaning; skip despill so it stays vivid red
        nds = ("crossing_x" in path)
        r = cut_cell(cell, path, maxedge, key, keep_full=(mode=="full"), nodespill=nds)
        if r: print("  %-30s %dx%d"%(path, r[0], r[1])); ok+=1
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

todo = ["bulbs","vines","blooms","fx","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bg()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown target", s)
print("DONE ->", OUT)
