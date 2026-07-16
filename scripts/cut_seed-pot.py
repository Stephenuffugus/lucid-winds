#!/usr/bin/env python3
"""Cut the Seed Pot "Midnight Greenhouse" art pack into named game assets.

Reuses the Seed Flutter / Petal Slice magenta-KEY-distance pipeline (sample flat
#FF00FF key, mask by colour DISTANCE not hue so soft glows survive, despill,
connected-component keep, alpha-trim). Midnight-Greenhouse art uses rose #e58fa0
for pinks (NOT magenta) so the key-distance mask is safe.

Sheet -> role mapping (verified BY EYE against art-asset-lists/seed-pot specs):
  sheet1  = tiers      (4x4, 16 = 8 tiers x [idle,pop])
  sheet2  = bg seasons (2x2 magenta-GUTTER full-bleed -> spring/summer/autumn/winter JPG)
  sheet3  = pot seasons(2x2 magenta-KNOCKOUT cutout   -> spring/summer/autumn/winter PNG)
  sheet4  = vine       (1x4 magenta-KNOCKOUT cutout   -> calm/stirring/warning/overflow)
  sheet5  = fx atlas   (4x4)
  sheet6  = ui/hud     (4x4)
  sheet7  = cosmetics  (5x4, staged for a future wardrobe; not wired in v1)

Outputs into satellites/seed-pot/assets/{tiers,bg,pot,vine,fx,ui,cosmetics}/ .
Every cut PNG <=150KB; every backdrop JPG <=150KB, <=1400px.

Usage: python3 scripts/cut_seed-pot.py [SRC_DIR] [OUT_DIR] [only]
  only one of: tiers pot vine fx ui cosmetics bg  (default all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-1000/-workspaces-lucid-winds/e69970ff-1c13-41f3-b352-1ff539332ebd/scratchpad/packs/Seed Pot"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/seed-pot/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p
def c(path, edge, mode="cut"): return (path, edge, mode)

SHEETS = {
 "tiers": ("sheet1.png", 4, 4, [
    c("tiers/tier0_idle",256), c("tiers/tier0_pop",280,"full"), c("tiers/tier1_idle",256), c("tiers/tier1_pop",280,"full"),
    c("tiers/tier2_idle",256), c("tiers/tier2_pop",280,"full"), c("tiers/tier3_idle",256), c("tiers/tier3_pop",280,"full"),
    c("tiers/tier4_idle",256), c("tiers/tier4_pop",280,"full"), c("tiers/tier5_idle",256), c("tiers/tier5_pop",280,"full"),
    c("tiers/tier6_idle",256), c("tiers/tier6_pop",280,"full"), c("tiers/tier7_idle",256), c("tiers/tier7_pop",280,"full"),
 ]),
 "pot": ("sheet3.png", 2, 2, [
    c("pot/pot_spring",420), c("pot/pot_summer",420), c("pot/pot_autumn",420), c("pot/pot_winter",420),
 ]),
 "vine": ("sheet4.png", 1, 4, [
    c("vine/vine_calm",560), c("vine/vine_stirring",560), c("vine/vine_warning",560), c("vine/vine_overflow",560),
 ]),
 "fx": ("sheet5.png", 4, 4, [
    c("fx/pollen_spring",200), c("fx/pollen_summer",200), c("fx/pollen_autumn",200), c("fx/pollen_winter",200),
    c("fx/ring_thin",300,"full"), c("fx/ring_thick",300,"full"), c("fx/sparkle",220,"full"), c("fx/glow",300,"full"),
    c("fx/beam",300), c("fx/halo_flat",300,"full"), c("fx/laurel",280), c("fx/composted",240,"full"),
    c("fx/comp_burst",320,"full"), c("fx/comp_petalring",320,"full"), c("fx/comp_sweep",300), c("fx/comp_halo",320,"full"),
 ]),
 "ui": ("sheet6.png", 4, 4, [
    c("ui/plaque_score",300), c("ui/plaque_blank",300), c("ui/next_wells",300), c("ui/badge_classic",240),
    c("ui/badge_daily",240), c("ui/badge_zen",240), c("ui/btn_primary",300), c("ui/btn_secondary",300),
    c("ui/bar_dark",300), c("ui/icon_gear",220), c("ui/toggle",240), c("ui/icon_sun",220),
    c("ui/badge_flame",240), c("ui/badge_best",240), c("ui/icon_share",220), c("ui/icon_back",220),
 ]),
 "cosmetics": ("sheet7.png", 5, 4, [
    c("cosmetics/potskin_01",256), c("cosmetics/potskin_02",256), c("cosmetics/potskin_03",256), c("cosmetics/potskin_04",256), c("cosmetics/potskin_05",256),
    c("cosmetics/potskin_06",256), c("cosmetics/potskin_07",256), c("cosmetics/potskin_08",256), c("cosmetics/chip_01",256), c("cosmetics/chip_02",256),
    c("cosmetics/chip_03",256), c("cosmetics/chip_04",256), c("cosmetics/emblem_01",256), c("cosmetics/emblem_02",256), c("cosmetics/emblem_03",256),
    c("cosmetics/cameo_01",256), c("cosmetics/cameo_02",256), c("cosmetics/cameo_03",256), c("cosmetics/cameo_04",256), c("cosmetics/cameo_05",256),
 ]),
}

# sheet2 backdrops: 2x2 season set with a magenta gutter cross. TL,TR,BL,BR
BACKDROP = ("sheet2.png", ["bg/bg_spring", "bg/bg_summer", "bg/bg_autumn", "bg/bg_winter"])

# ---- magenta key machinery (ported from cut_seed-flutter.py) ------------------
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
        if r: print("  %-30s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s: %d/%d"%(key_name, ok, len(cells)))

# ---- gutter detector for the 2x2 full-bleed backdrop set ----------------------
def mag_frac(a):
    R,G,B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    return (R>150)&(B>150)&(G<110)

def gutter_center(frac, lo, hi, thr=0.45):
    seg = frac[lo:hi]; idx = np.where(seg>thr)[0]
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
        _,q = save_jpg(Image.fromarray(cell), name, 1400)
        print("  %-20s %dx%d q%d"%(name, cell.shape[1], cell.shape[0], q)); ok+=1
    print("bg (%s): %d/%d"%(src_file, ok, len(names)))

todo = ["tiers","pot","vine","fx","ui","cosmetics","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_backdrops()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown", s)
print("DONE ->", OUT)
