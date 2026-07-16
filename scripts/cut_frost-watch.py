#!/usr/bin/env python3
"""Cut the Frost Watch "Midnight Vigil" art pack into named game assets.

Reuses the seed-flutter / petal-slice magenta-KEY-distance pipeline for the
chroma sheets; adds an OPAQUE-slice path for the seamless meadow tiles (no
chroma key) and an opaque-resize path for the full-bleed sky.

Sheet -> role (verified BY EYE against the prompt doc + art-asset-lists):
  sheet1  shards        3x2  (straight/splitter/seeker/glacier/glacier_cracked/shatter)
  sheet2  warmth-fx     5x2  (bolt, rings, sparkle / dash-ring, steam, boom, burst, melt)
  sheet3  town+braziers 4x2  (4 houses / 4 braziers)
  sheet4  sky           full-bleed portrait (opaque)
  sheet5  meadow-tiles  4x1  OPAQUE seamless tiles (frozen/thaw/bloom/lip)
  sheet6  emblem        1    (crossed shard+flame title badge)
  sheet7  plaques       2x1  (gold + blue wide button bars)
  sheet8  hud-chips     3x2  (6 chip plates)
  sheet9  wardrobe      3x2  (6 cosmetic icon badges)
  sheet10 medallions    3x1  (3 round ring/ember medallions)

Delivered masters differ from the prompt px -> sliced on the PROPORTIONAL grid.
Output -> satellites/frost-watch/assets/{bg,shards,fx,town,meadow,ui}/ .
Every cut PNG <=150KB; sky/meadow JPG <=150KB.
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/e69970ff-1c13-41f3-b352-1ff539332ebd/scratchpad/packs/Frost Watch"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/frost-watch/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p
def c(path, edge, mode="cut"): return (path, edge, mode)

SHEETS = {
 "shards": ("sheet1.png", 3, 2, [
    c("shards/straight",300), c("shards/splitter",300), c("shards/seeker",300),
    c("shards/glacier",320),  c("shards/glacier_cracked",320), c("shards/shatter",320,"full"),
 ]),
 "fx": ("sheet2.png", 5, 2, [
    c("fx/bolt",220),      c("fx/ring_warm",320,"full"), c("fx/ring_sun",320,"full"), c("fx/ring_frost",320,"full"), c("fx/sparkle",220,"full"),
    c("fx/ring_dash",320,"full"), c("fx/steam",240,"full"), c("fx/boom",320,"full"),    c("fx/burst",320,"full"),      c("fx/melt",240,"full"),
 ]),
 "town": ("sheet3.png", 4, 2, [
    c("town/house_timber",300), c("town/house_lantern",300), c("town/house_starlight",300), c("town/house_ruined",300),
    c("town/brazier_hearth",320), c("town/brazier_sapphire",320), c("town/brazier_solar",320), c("town/brazier_doused",320),
 ]),
 "emblem": ("sheet6.png", 1, 1, [ c("ui/emblem",420) ]),
 "plaques": ("sheet7.png", 2, 1, [ c("ui/plaque_gold",520,"full"), c("ui/plaque_blue",520,"full") ]),
 "hud": ("sheet8.png", 3, 2, [
    c("ui/chip_plain",300,"full"), c("ui/chip_gold",300,"full"), c("ui/chip_blue",300,"full"),
    c("ui/chip_plainb",300,"full"), c("ui/chip_greenb",300,"full"), c("ui/chip_smallb",300,"full"),
 ]),
 "ward": ("sheet9.png", 3, 2, [
    c("ui/ic_flame_hearth",220), c("ui/ic_flame_sapphire",220), c("ui/ic_flame_solar",220),
    c("ui/ic_town",220),         c("ui/ic_lantern",220),        c("ui/ic_ring",220),
 ]),
 "medallions": ("sheet10.png", 3, 1, [
    c("ui/med_gold",300), c("ui/med_slate",300), c("ui/med_solar",300),
 ]),
}

# full-bleed opaque sky
SKY = ("sheet4.png", "bg/sky", 1080)
# opaque seamless meadow tiles, 4 equal columns, no chroma key
MEADOW = ("sheet5.png", ["meadow/frozen", "meadow/thaw", "meadow/bloom", "meadow/lip"])

# ---- magenta key machinery ----------------------------------------------------
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
        if os.path.getsize(p) <= 150*1024 or e < 400: break
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
    print("%s (%s) key=%s grid=%dx%d"%(key_name,src_file,None if key is None else [int(x) for x in key],cols,rows))
    for idx,spec in enumerate(cells):
        path,maxedge,mode = spec[0], spec[1], (spec[2] if len(spec)>2 else "cut")
        rr,cc = idx//cols, idx%cols
        y0,y1 = int(round(rr*chh)), int(round((rr+1)*chh))
        x0,x1 = int(round(cc*cw)),  int(round((cc+1)*cw))
        r = cut_cell(a[y0:y1, x0:x1], path, maxedge, key, keep_full=(mode=="full"))
        if r: print("  %-30s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s: %d/%d"%(key_name, ok, len(cells)))

def process_sky():
    fp = os.path.join(SRC, SKY[0])
    if not os.path.exists(fp): print("!! MISSING", fp); return
    im = Image.open(fp).convert("RGB")
    _,q = save_jpg(im, SKY[1], SKY[2])
    print("  %-30s %dx%d q%d %dKB"%(SKY[1], im.size[0], im.size[1], q, os.path.getsize(P(SKY[1]+'.jpg'))//1024))

def process_meadow():
    fp = os.path.join(SRC, MEADOW[0]); names=MEADOW[1]
    if not os.path.exists(fp): print("!! MISSING", fp); return
    im = Image.open(fp).convert("RGB"); W,H = im.size; n=len(names); cw=W/n
    for i,name in enumerate(names):
        cell = im.crop((int(round(i*cw)), 0, int(round((i+1)*cw)), H))
        _,q = save_jpg(cell, name, 320)
        print("  %-30s %dx%d q%d %dKB"%(name, cell.size[0], cell.size[1], q, os.path.getsize(P(name+'.jpg'))//1024))

todo = list(SHEETS.keys())+["sky","meadow"] if only=="all" else [only]
for s in todo:
    if s=="sky": process_sky()
    elif s=="meadow": process_meadow()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown", s)
print("DONE ->", OUT)
