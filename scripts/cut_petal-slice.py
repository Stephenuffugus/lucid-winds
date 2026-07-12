#!/usr/bin/env python3
"""Cut the Petal Slice "Lantern Glass" art pack into named game assets.

Reuses the Dew Snip / Nova Bloom magenta-KEY-distance pipeline verbatim (sample
flat #FF00FF key, mask by colour DISTANCE not hue so soft glows survive, despill,
connected-component keep, alpha trim). Modes:
  - "cut"      : magenta knockout grid cell -> alpha-trimmed transparent PNG.
  - "full"     : knockout to transparent but KEEP full cell bounds (rings / radial
                 FX / frames that must stay centred).
  - backdrops  : sheet3 is a 2x2 full-bleed season set with a magenta gutter cross
                 (NO magenta inside cells) -> slice on the detected gutter, save
                 opaque JPG <=1600px <150KB. One cell per Lucid Winds season.

Sheet -> role mapping verified by EYE + exact-division + the art-asset-lists specs:
  sheet1 = 01 objects   (6x4, 256px)   sheet2 = 02 fx        (6x5, 229px)
  sheet3 = 03 backdrops (2x2 full-bleed season set, magenta gutter)
  sheet4 = 04 ui        (6x4, 256px)   sheet5 = 05 cosmetics (6x4, 256px)

Outputs STAGE into satellites/petal-slice/assets/{objects,fx,ui,cosmetics,bg}/
so the drop-in season backdrop wiring can address bg/bg_<season>.jpg directly.

Usage:
  python3 scripts/cut_petal-slice.py [SRC_DIR] [OUT_DIR] [only]
    only one of: objects fx ui cosmetics bg  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/5af457db-87c8-4d48-b9c3-ac3b8eca6656/scratchpad/artsrc/Petal Slice"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/petal-slice/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p
def c(path, edge, mode="cut"): return (path, edge, mode)

# ---- knockout grid sheets: (src_file, cols, rows, cells[]) --------------------
SHEETS = {
 "objects": ("sheet1.png", 6, 4, [
    c("objects/berry_red",256), c("objects/berry_violet",256), c("objects/berry_blue",256),
    c("objects/pod_green",256), c("objects/blossom_pink",256), c("objects/blossom_gold",256),
    c("objects/half_red_L",256), c("objects/half_violet_L",256), c("objects/half_blue_L",256),
    c("objects/half_pod_L",256), c("objects/half_blossom_pink_L",256), c("objects/half_blossom_gold_L",256),
    c("objects/half_red_R",256), c("objects/half_violet_R",256), c("objects/half_blue_R",256),
    c("objects/half_pod_R",256), c("objects/half_blossom_pink_R",256), c("objects/half_blossom_gold_R",256),
    c("objects/burr",256), c("objects/burr_burst",280,"full"), c("objects/bonus_pod",256),
    c("objects/graft_pod",256), c("objects/seed_cluster",200), c("objects/nectar_droplet",200),
 ]),
 "fx": ("sheet2.png", 6, 5, [
    c("fx/trail_vine",240), c("fx/trail_nectar",240), c("fx/trail_rose",240),
    c("fx/trail_frost",240), c("fx/trail_aurora",240), c("fx/trail_white",240),
    c("fx/leaf_sage",160), c("fx/leaf_copper",160), c("fx/leaf_frost",160),
    c("fx/petal_fleck",140), c("fx/tendril",180), c("fx/blade_tip_bud",180),
    c("fx/graft_line",220), c("fx/graft_curve",220), c("fx/graft_node_idle",220,"full"),
    c("fx/graft_node_lit",240,"full"), c("fx/graft_complete_swirl",300,"full"), c("fx/bloom_finish",340,"full"),
    c("fx/splat_gold",240), c("fx/splat_pink",240), c("fx/splat_red",240),
    c("fx/splat_copper",240), c("fx/splat_frost",240), c("fx/splat_violet",240),
    c("fx/seed_burst",220), c("fx/combo_star",160), c("fx/petal_vignette",240),
    c("fx/time_ripple",260,"full"), c("fx/burr_warning",240,"full"), c("fx/sunbeam_mote",160),
 ]),
 "ui": ("sheet4.png", 6, 4, [
    c("ui/life_petal_full",200), c("ui/life_petal_wilt",200), c("ui/nectar_drop",200),
    c("ui/sunbeam_token",200), c("ui/graft_trophy",200), c("ui/streak_flame",200),
    c("ui/mode_grove",220), c("ui/mode_zen",220), c("ui/mode_daily",220),
    c("ui/mode_rush",220), c("ui/mode_blades",220), c("ui/mode_settings",220),
    c("ui/combo_badge",220,"full"), c("ui/timer_ring",220,"full"), c("ui/best_rosette",200),
    c("ui/graft_burst_frame",240,"full"), c("ui/pause_icon",180), c("ui/share_icon",180),
    c("ui/btn_primary",256), c("ui/btn_secondary",256), c("ui/toggle_knob",160),
    c("ui/back_chevron",160), c("ui/lock_icon",180), c("ui/check_icon",180),
 ]),
 "cosmetics": ("sheet5.png", 6, 4, [
    c("cosmetics/blade_vine",256), c("cosmetics/blade_nectar",256), c("cosmetics/blade_rose",256),
    c("cosmetics/blade_frostvine",256), c("cosmetics/blade_aurora",256), c("cosmetics/blade_ember",256),
    c("cosmetics/blade_moonsilver",256), c("cosmetics/blade_honeydrip",256), c("cosmetics/blade_koi",256),
    c("cosmetics/blade_starwisp",256), c("cosmetics/cbg_moss",256), c("cosmetics/cbg_glass",256),
    c("cosmetics/cbg_market",256), c("cosmetics/cbg_mushroom",256), c("cosmetics/podset_classic",256),
    c("cosmetics/podset_candy",256), c("cosmetics/podset_crystal",256), c("cosmetics/podset_origami",256),
    c("cosmetics/podset_glowfungus",256), c("cosmetics/csplat_golden",256), c("cosmetics/csplat_cherry",256),
    c("cosmetics/csplat_deepberry",256), c("cosmetics/csplat_sapgreen",256), c("cosmetics/companion_firefly",256),
 ]),
}

# sheet3 backdrops: 2x2 season set. reading order TL,TR,BL,BR -> LW seasons.
BACKDROP = ("sheet3.png", ["bg/bg_spring", "bg/bg_summer", "bg/bg_autumn", "bg/bg_winter"])

# ---- magenta key machinery (ported from cut_nova-bloom.py) --------------------
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
    for _ in range(8):
        cur = fit(base, e); q = 88; cur.save(p, quality=q)
        while os.path.getsize(p) > 150*1024 and q > 44:
            q -= 6; cur.save(p, quality=q)
        if os.path.getsize(p) <= 150*1024 or e < 600: break
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
    if not os.path.exists(fp): print("!! MISSING", fp); return
    a = np.asarray(Image.open(fp).convert("RGB")); H,W = a.shape[:2]
    key = sample_key(a); cw,chh = W/cols, H/rows; ok=0
    for idx,spec in enumerate(cells):
        if spec is None: continue
        path,maxedge,mode = spec[0], spec[1], (spec[2] if len(spec)>2 else "cut")
        rr,cc = idx//cols, idx%cols
        y0,y1 = int(round(rr*chh)), int(round((rr+1)*chh))
        x0,x1 = int(round(cc*cw)),  int(round((cc+1)*cw))
        r = cut_cell(a[y0:y1, x0:x1], path, maxedge, key, keep_full=(mode=="full"))
        if r: print("  %-38s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s (%s): %d/%d"%(key_name, src_file, ok, len(cells)))

# ---- gutter detector for full-bleed backdrop grids ----------------------------
def mag_frac(a):
    R,G,B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    return (R>150)&(B>150)&(G<110)

def gutter_center(frac, lo, hi, thr=0.45):
    """Return the center index of the magenta band found within [lo,hi], else midpoint."""
    seg = frac[lo:hi]
    idx = np.where(seg>thr)[0]
    if len(idx): return lo + int((idx.min()+idx.max())//2)
    return (lo+hi)//2

def trim_magenta_border(cell):
    m = mag_frac(cell)
    rows = np.where(m.mean(1) < 0.6)[0]; cols = np.where(m.mean(0) < 0.6)[0]
    if len(rows) and len(cols):
        return cell[rows.min():rows.max()+1, cols.min():cols.max()+1]
    return cell

def process_backdrops():
    src_file, names = BACKDROP
    fp = os.path.join(SRC, src_file)
    if not os.path.exists(fp): print("!! MISSING", fp); return
    a = np.asarray(Image.open(fp).convert("RGB")); H,W = a.shape[:2]
    m = mag_frac(a); colf = m.mean(0); rowf = m.mean(1)
    xg = gutter_center(colf, int(W*0.35), int(W*0.65))
    yg = gutter_center(rowf, int(H*0.35), int(H*0.65))
    print("  backdrop gutter: x~%d y~%d  (%dx%d)"%(xg,yg,W,H))
    quads = [ (0,yg,0,xg), (0,yg,xg,W), (yg,H,0,xg), (yg,H,xg,W) ]  # TL TR BL BR
    ok=0
    for (y0,y1,x0,x1), name in zip(quads, names):
        cell = trim_magenta_border(a[y0:y1, x0:x1])
        _,q = save_jpg(Image.fromarray(cell), name, 1600)
        print("  %-20s %dx%d q%d"%(name, cell.shape[1], cell.shape[0], q)); ok+=1
    print("bg (%s): %d/%d"%(src_file, ok, len(names)))

todo = ["objects","fx","ui","cosmetics","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_backdrops()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown", s)
print("DONE ->", OUT)
