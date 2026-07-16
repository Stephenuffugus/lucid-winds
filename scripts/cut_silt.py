#!/usr/bin/env python3
"""Cut the Silt "Terrarium Nocturne" art pack into named game assets.

Magenta-KEY-distance pipeline (from cut_seed-flutter.py). Sheet map (verified by eye
+ art-asset-lists/silt specs):
  sheet1 = backdrops (3x2 FULL-BLEED portrait, NO magenta) -> JPG surrounds/screens
  sheet2 = ui        (4x4 magenta knockout)
  sheet3 = cosmetics (4x3 magenta) -- frames use "full" (border w/ transparent centre)
  sheet4 = keepsakes (4x3 magenta) -- 10 pressed-bloom species + wreath + press burst
  sheet5 = title-fx  (4x3 magenta)

Out -> satellites/silt/assets/{backdrops,ui,cosmetics,keepsakes,fx}/  (PNG<=150KB, JPG<=150KB)
Usage: python3 scripts/cut_silt.py [SRC_DIR] [OUT_DIR] [only]
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/e69970ff-1c13-41f3-b352-1ff539332ebd/scratchpad/packs/Silt"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/silt/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p
def c(path, edge, mode="cut"): return (path, edge, mode)

SHEETS = {
 "ui": ("sheet2.png", 4, 4, [
    c("ui/btn_plate",300),      c("ui/btn_plate_primary",300), c("ui/chip_plate",240),  c("ui/goal_pill",300),
    c("ui/icon_silt",200),      c("ui/icon_water",200),        c("ui/icon_soil",200),   c("ui/icon_seed",200),
    c("ui/icon_stone",200),     c("ui/icon_oil",200),          c("ui/icon_fire",200),   c("ui/icon_erase",200),
    c("ui/icon_brush",200),     c("ui/icon_reset",200),        c("ui/icon_home",220),   c("ui/pulse_meter",320),
 ]),
 "cosmetics": ("sheet3.png", 4, 3, [
    c("cosmetics/frame_slate",340,"full"), c("cosmetics/frame_cedar",340,"full"), c("cosmetics/frame_gilded",340,"full"), c("cosmetics/brush_ring",200),
    c("cosmetics/brush_trowel",200),       c("cosmetics/brush_dragonfly",200),    c("cosmetics/token_earthen",200),      c("cosmetics/token_nocturne",200),
    c("cosmetics/token_ember",200),        c("cosmetics/token_prisma",200),       c("cosmetics/grove_mat",320,"full"),   c("cosmetics/lock_charm",180),
 ]),
 "keepsakes": ("sheet4.png", 4, 3, [
    c("keepsakes/bloom_rose_round",240),   c("keepsakes/bloom_rose_star",240),    c("keepsakes/bloom_gold_cup",240),     c("keepsakes/bloom_gold_spray",240),
    c("keepsakes/bloom_dew_bell",240),     c("keepsakes/bloom_dew_lotus",240),    c("keepsakes/bloom_violet_iris",240),  c("keepsakes/bloom_violet_thistle",240),
    c("keepsakes/bloom_amber_sun",240),    c("keepsakes/bloom_amber_trumpet",240),c("keepsakes/garden_wreath",260),      c("keepsakes/press_burst",320,"full"),
 ]),
 "fx": ("sheet5.png", 4, 3, [
    c("fx/emblem",300),         c("fx/toast_plate",300),   c("fx/confirm_plate",320), c("fx/lvlcard_frame",260),
    c("fx/trial_done",160),     c("fx/toggle_set",240),    c("fx/mote_drift",300,"full"), c("fx/mist_wisp",320,"full"),
    c("fx/ember_spark",200),    c("fx/dew_sparkle",180),   c("fx/pulse_heart",180),   c("fx/win_laurel",300),
 ]),
}

# sheet1: 3x2 FULL-BLEED backdrops (no magenta) -> slice on grid, save JPG
BACKDROPS = ("sheet1.png", 3, 2, [
   "backdrops/title_shelf", "backdrops/surround_earthen", "backdrops/surround_nocturne",
   "backdrops/surround_ember", "backdrops/surround_prisma", "backdrops/panel_wash",
])

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
        d = np.sqrt((R-key[0])**2 + (G-key[1])**2 + (B-key[2])**2); return d < 100.0
    hue = (R > G+24) & (B > G+24); return hue & (np.minimum(R,B) > 150) & (G < 85)
def despill(a):
    Rf,Gf,Bf = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = ((Rf+Bf)//2 - Gf) > 30
    Rf2 = np.where(lean, np.minimum(Rf, Gf+40), Rf); Bf2 = np.where(lean, np.minimum(Bf, Gf+40), Bf)
    return np.dstack([Rf2, Gf, Bf2]).astype(np.uint8)
def fit(im, maxedge):
    w,h = im.size; m = max(w,h)
    if m > maxedge: r = maxedge/m; im = im.resize((max(1,int(w*r)), max(1,int(h*r))), Image.LANCZOS)
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
        while os.path.getsize(p) > 150*1024 and q > 40: q -= 6; cur.save(p, quality=q)
        if os.path.getsize(p) <= 150*1024 or e < 500: break
        e = int(e*0.85)
    return p, q
def cut_cell(cell, path, maxedge, key, keep_full=False):
    ch,cw = cell.shape[:2]
    fg = ~magenta_mask(cell, key)
    fg = ndi.binary_opening(fg, iterations=1); fg = ndi.binary_erosion(fg, iterations=1); fg = ndi.binary_closing(fg, iterations=2)
    lbl,n = ndi.label(fg)
    if n==0: print("   EMPTY",path); return None
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1,n+1)); biggest = sizes.max()
    keep = np.zeros_like(fg)
    for i in range(1,n+1):
        if sizes[i-1] >= max(40, biggest*0.02): keep |= (lbl==i)
    if not keep.any(): print("   NOISE",path); return None
    m = ndi.binary_dilation(keep, iterations=1)
    if keep_full: y0,y1,x0,x1 = 0,ch,0,cw
    else:
        ys,xs = np.where(m); y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
        pad=4; y0,x0 = max(0,y0-pad),max(0,x0-pad); y1,x1=min(ch,y1+pad),min(cw,x1+pad)
    rgb = despill(cell)[y0:y1,x0:x1]
    alpha = ndi.gaussian_filter((m[y0:y1,x0:x1].astype(np.uint8))*255, 0.6)
    out = np.dstack([rgb,alpha]).astype(np.uint8)
    save_png(Image.fromarray(out,"RGBA"), path, maxedge); return (x1-x0, y1-y0)
def process_sheet(key_name):
    src_file, cols, rows, cells = SHEETS[key_name]
    fp = os.path.join(SRC, src_file)
    if not os.path.exists(fp): print("!! MISSING", fp); return
    a = np.asarray(Image.open(fp).convert("RGB")); H,W = a.shape[:2]
    key = sample_key(a); cw,chh = W/cols, H/rows; ok=0
    print("%s (%s) key=%s grid=%dx%d cell~%dx%d"%(key_name,src_file,None if key is None else [int(x) for x in key],cols,rows,cw,chh))
    for idx,spec in enumerate(cells):
        if spec is None: continue
        path,maxedge,mode = spec[0], spec[1], (spec[2] if len(spec)>2 else "cut")
        rr,cc = idx//cols, idx%cols
        y0,y1 = int(round(rr*chh)), int(round((rr+1)*chh)); x0,x1 = int(round(cc*cw)),  int(round((cc+1)*cw))
        r = cut_cell(a[y0:y1, x0:x1], path, maxedge, key, keep_full=(mode=="full"))
        if r: print("  %-32s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s: %d/%d"%(key_name, ok, len(cells)))
def process_backdrops():
    src_file, cols, rows, names = BACKDROPS
    fp = os.path.join(SRC, src_file)
    if not os.path.exists(fp): print("!! MISSING", fp); return
    a = np.asarray(Image.open(fp).convert("RGB")); H,W = a.shape[:2]
    cw,chh = W/cols, H/rows; ok=0
    for idx,name in enumerate(names):
        rr,cc = idx//cols, idx%cols
        y0,y1 = int(round(rr*chh)), int(round((rr+1)*chh)); x0,x1 = int(round(cc*cw)),  int(round((cc+1)*cw))
        _,q = save_jpg(Image.fromarray(a[y0:y1,x0:x1]), name, 1000)
        sz=os.path.getsize(P(name+".jpg"))//1024; print("  %-32s %dx%d q%d %dKB"%(name,x1-x0,y1-y0,q,sz)); ok+=1
    print("backdrops: %d/%d"%(ok,len(names)))

todo = ["backdrops","ui","cosmetics","keepsakes","fx"] if only=="all" else [only]
for s in todo:
    if s=="backdrops": process_backdrops()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown", s)
print("DONE ->", OUT)
