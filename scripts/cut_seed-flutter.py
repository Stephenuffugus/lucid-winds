#!/usr/bin/env python3
"""Cut the Seed Flutter "Comet Cadets" art pack into named game assets.

Reuses the Petal Slice / Dew Snip / Nova Bloom magenta-KEY-distance pipeline
verbatim (sample flat #FF00FF key, mask by colour DISTANCE not hue so soft glows
survive, despill, connected-component keep, alpha trim).

Sheet -> role mapping (verified BY EYE against art-asset-lists/seed-flutter specs):
  sheet1  = 01 sprites   (4x4, 16 cells)  sheet2  = 02 cosmetics (4x5, 20 cells)
  sheet10 = 04 ui        (4x4, 16 cells)  sheet11 = 05 fx        (4x4, 16 cells)
  sheet3..9 = 03 backgrounds (7 SEPARATE full-bleed 9:16 portraits, NO grid)

Delivered masters differ from the prompt's stated 2048px (they are 1254 sq /
941x1672 portrait), so cells are sliced on the proportional grid, not fixed px.

Outputs STAGE into satellites/seed-flutter/assets/{sprites,cosmetics,ui,fx,
backgrounds}/ .  Every cut cell PNG <=150KB; every background JPG <=150KB, <=1400px
(under the Hostinger >1600 resize rule).

Usage:
  python3 scripts/cut_seed-flutter.py [SRC_DIR] [OUT_DIR] [only]
    only one of: sprites cosmetics ui fx bg  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else "scratch-seedflutter/Seed Flutter"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/seed-flutter/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p
def c(path, edge, mode="cut"): return (path, edge, mode)

# ---- knockout grid sheets: (src_file, cols, rows, cells[]) --------------------
SHEETS = {
 "sprites": ("sheet1.png", 4, 4, [
    c("sprites/comet_cadet",300),      c("sprites/comet_cadet_flap",300),  c("sprites/comet_cadet_settle",300), c("sprites/spire_segment",320),
    c("sprites/spire_cap_gap",300),    c("sprites/spire_base",300),        c("sprites/boss_spire_segment",320), c("sprites/boss_spire_cap",300),
    c("sprites/thread_star",260),      c("sprites/thread_star_boss",260),  c("sprites/star_bloom",300),         c("sprites/moon",300),
    c("sprites/ridge_far",360),        c("sprites/ridge_near",360),        c("sprites/horizon_floor",360),      c("sprites/twinkle_star",180),
 ]),
 "cosmetics": ("sheet2.png", 4, 5, [
    c("cosmetics/star_dawnling",256),  c("cosmetics/star_goldeye",256),    c("cosmetics/star_moonbell",256),    c("cosmetics/star_ember",256),
    c("cosmetics/star_violetnova",256),c("cosmetics/star_frostcrystal",256),c("cosmetics/star_twinsprite",256), c("cosmetics/star_cometwisp",256),
    c("cosmetics/star_prismnova",256), c("cosmetics/comet_sparkler",256),  c("cosmetics/comet_amber",256),      c("cosmetics/comet_rosenova",256),
    c("cosmetics/comet_frost",256),    c("cosmetics/tail_stardust",256),   c("cosmetics/tail_rosefall",256),    c("cosmetics/tail_emberspark",256),
    c("cosmetics/tail_prism",256),     c("cosmetics/buddy_moonmoth",256),  c("cosmetics/buddy_sparklet",256),   c("cosmetics/buddy_starpup",256),
 ]),
 "ui": ("sheet10.png", 4, 4, [
    c("ui/btn_plate",300),             c("ui/btn_plate_primary",300),      c("ui/icon_drift",240),              c("ui/icon_daily",240),
    c("ui/icon_gauntlet",240),         c("ui/icon_zen",240),               c("ui/icon_skymap",240),             c("ui/icon_wardrobe",240),
    c("ui/icon_gear",240),             c("ui/icon_share",240),             c("ui/icon_menu",220),               c("ui/icon_retry",220),
    c("ui/star_full",200),             c("ui/star_empty",200),             c("ui/toggle_knob",180),             c("ui/card_frame",300,"full"),
 ]),
 "fx": ("sheet11.png", 4, 4, [
    c("fx/flap_puff",240),             c("fx/star_burst_perfect",300),     c("fx/tail_mote",160),               c("fx/bloom_flash",340,"full"),
    c("fx/slowmo_glow",340,"full"),    c("fx/snow_glint",160),             c("fx/meteor_dust",240),             c("fx/soft_land_puff",260),
    c("fx/recovery_puff",260),         c("fx/twinkle_small",160),          c("fx/glow_soft",320,"full"),        c("fx/aurora_ribbon",360,"full"),
    c("fx/star_shower",360,"full"),    c("fx/streak_star_pop",240),        c("fx/comet_wisp",280),              c("fx/vignette_edge",360,"full"),
 ]),
}

# sheet3..9 -> full-bleed backgrounds (each sheet is ONE image, not a grid)
BACKGROUNDS = [
    ("sheet3.png", "backgrounds/bg_play"),
    ("sheet4.png", "backgrounds/bg_title"),
    ("sheet5.png", "backgrounds/bg_results"),
    ("sheet6.png", "backgrounds/bg_phase_rosedawn"),
    ("sheet7.png", "backgrounds/bg_phase_goldveil"),
    ("sheet8.png", "backgrounds/bg_phase_meteor"),
    ("sheet9.png", "backgrounds/bg_phase_frostnight"),
]

# ---- magenta key machinery (ported from cut_petal-slice.py) -------------------
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
        while os.path.getsize(p) > 150*1024 and q > 40:
            q -= 6; cur.save(p, quality=q)
        if os.path.getsize(p) <= 150*1024 or e < 500: break
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
    print("%s (%s) key=%s grid=%dx%d cell~%dx%d"%(key_name,src_file,
          None if key is None else [int(x) for x in key], cols, rows, cw, chh))
    for idx,spec in enumerate(cells):
        if spec is None: continue
        path,maxedge,mode = spec[0], spec[1], (spec[2] if len(spec)>2 else "cut")
        rr,cc = idx//cols, idx%cols
        y0,y1 = int(round(rr*chh)), int(round((rr+1)*chh))
        x0,x1 = int(round(cc*cw)),  int(round((cc+1)*cw))
        r = cut_cell(a[y0:y1, x0:x1], path, maxedge, key, keep_full=(mode=="full"))
        if r: print("  %-34s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s: %d/%d"%(key_name, ok, len(cells)))

def process_backgrounds():
    ok=0
    for src_file, name in BACKGROUNDS:
        fp = os.path.join(SRC, src_file)
        if not os.path.exists(fp): print("!! MISSING", fp); continue
        im = Image.open(fp).convert("RGB")
        _,q = save_jpg(im, name, 1400)
        sz = os.path.getsize(P(name+".jpg"))//1024
        print("  %-34s %dx%d q%d %dKB"%(name, im.size[0], im.size[1], q, sz)); ok+=1
    print("bg: %d/%d"%(ok, len(BACKGROUNDS)))

todo = ["sprites","cosmetics","ui","fx","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_backgrounds()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown", s)
print("DONE ->", OUT)
