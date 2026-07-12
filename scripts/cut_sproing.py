#!/usr/bin/env python3
"""Cut the Sproing "Sunlit Vector Garden" art pack into named game assets.

Reuses the Nova Bloom / Dew Snip magenta-KEY-distance pipeline verbatim (sample
flat #FF00FF key from a corner, mask by colour DISTANCE not hue, despill,
connected-component keep, alpha trim). Modes:
  - "cut"      : magenta knockout grid cell -> alpha-trimmed transparent PNG.
  - grid-bg    : crop a full-bleed (NO magenta) portrait background grid cell ->
                 opaque JPG <=1600 long edge, <150KB.

Sheet -> role mapping verified by EYE against art-asset-lists/sproing/*.md
(aspect + content), NOT by filename:
  sheet1 (768x2048)  = 01 BACKGROUNDS  full-bleed 2col x 3row (NO magenta)
  sheet2 (1448x1086) = 02 PLATFORMS    magenta 4col x 3row (11 + 1 empty)
  sheet3 (1254x1254) = 03 CRITTERS     magenta 3col x 3row (critters+coins+hazards)
  sheet4 (1983x793)  = 04 POWERUPS     magenta 5col x 2row (10 pods)

Outputs stage into satellites/sproing/assets/{bg,platforms,critters,pickups,powerups}/.

Usage:
  python3 scripts/cut_sproing.py [SRC_DIR] [OUT_DIR] [only]
    only = one of: bg platforms critters powerups  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/c1cd2839-a799-47c5-954b-ca2fed064633/scratchpad/sproing-raw/Sproing"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/sproing/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

def c(path, edge, mode="cut"): return (path, edge, mode)

# ---- magenta-knockout grid sheets: (src_file, cols, rows, cells[]) -----------
SHEETS = {
 # Sheet 02 — Leaf platforms. 4x3, 11 filled + 1 empty (magenta).
 "platforms": ("sheet2.png", 4, 3, [
    c("platforms/platform_broad",420),      c("platforms/platform_drifting",420),   c("platforms/platform_crumble",420),  c("platforms/platform_dewy",420),
    c("platforms/platform_dandelion",420),  c("platforms/platform_mushroom",420),   c("platforms/platform_fiddlehead",420), c("platforms/platform_thornleaf",420),
    c("platforms/platform_thornleaf_armed",420), c("platforms/platform_flytrap",420), c("platforms/platform_flytrap_open",420), None,
 ]),
 # Sheet 03 — Critters (row1-2 left), coins + hazards. 3x3.
 "critters": ("sheet3.png", 3, 3, [
    c("critters/aphid",380),        c("critters/wasp",380),     c("critters/snail",380),
    c("critters/beetle",380),       c("critters/spider",380),   c("pickups/coin_nectar",340),
    c("pickups/coin_gold",340),     c("pickups/hazard_seed",340), c("pickups/hazard_bramble",340),
 ]),
 # Sheet 04 — Powerup pods, one family. 5x2, ids in POW_IDS order.
 "powerups": ("sheet4.png", 5, 2, [
    c("powerups/powerup_dandelion_parachute",320), c("powerups/powerup_nectar_magnet",320), c("powerups/powerup_bubble_shield",320), c("powerups/powerup_propeller_seed",320), c("powerups/powerup_spring_roots",320),
    c("powerups/powerup_giant_leaf",320),          c("powerups/powerup_shrink_bud",320),    c("powerups/powerup_pollen_jetpack",320), c("powerups/powerup_slow_time_honey",320), c("powerups/powerup_ghost_spores",320),
 ]),
}

# ---- full-bleed background grid: (src_file, cols, rows, names[], maxedge) -----
# sheet1: 2col x 3row, read left-to-right top-first. NO magenta -> crop only.
BG_GRID = ("sheet1.png", 2, 3, [
    "bg/bg_garden_bed", "bg/bg_hedgerow",
    "bg/bg_canopy",     "bg/bg_clouds",
    "bg/bg_upper_air",  "bg/bg_starfield",
], 1600)

# ---- magenta key machinery (ported verbatim from cut_nova-bloom.py) ----------
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
        while os.path.getsize(p) > 150*1024 and q > 40:
            q -= 6; cur.save(p, quality=q)
        if os.path.getsize(p) <= 150*1024 or e < 640: break
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
        if r: print("  %-38s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s (%s): %d/%d assets"%(key_name, src_file, ok, len([x for x in cells if x])))

def process_bg():
    src_file, cols, rows, names, maxedge = BG_GRID
    fp = os.path.join(SRC, src_file)
    if not os.path.exists(fp): print("!! MISSING", fp, "-- skip"); return
    im = Image.open(fp).convert("RGB"); W,H = im.size
    cw,chh = W/cols, H/rows
    ok=0
    for idx,name in enumerate(names):
        rr,cc = idx//cols, idx%cols
        box = (int(round(cc*cw)), int(round(rr*chh)), int(round((cc+1)*cw)), int(round((rr+1)*chh)))
        crop = im.crop(box)
        _,q = save_jpg(crop, name, maxedge)
        print("  %-24s %dx%d q%d"%(name, crop.size[0], crop.size[1], q)); ok+=1
    print("bg (%s): %d/%d files"%(src_file, ok, len(names)))

todo = ["bg","platforms","critters","powerups"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bg()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown target", s)
print("DONE ->", OUT)
