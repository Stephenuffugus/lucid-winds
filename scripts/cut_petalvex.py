#!/usr/bin/env python3
"""Cut the Petalvex "Enamel Botanica" art pack into named game assets.

Reuses the Nova Bloom / Petal Slice magenta-KEY-distance pipeline. Modes:
  - grid "cut"  : magenta knockout grid cell -> alpha-trimmed transparent PNG.
  - grid "full" : knockout but KEEP full cell bounds (wedge triangles that the
                  engine rotates 0/90/180/270 about the cell centre, + tile_frame).
  - stacked bg  : sheet1 is TWO full-bleed backgrounds stacked with NO magenta
                  seam -> split at the darkest central row, save opaque JPG.

Sheet -> role mapping verified by EYE + exact-division + the art-direction doc:
  sheet1 = backgrounds  (2 stacked full-bleed: bg_bed top, bg_menu bottom)
  sheet2 = tile wedges  (4x3, 362px, FULL-cell: value 0..9, plain, frame)
  sheet3 = mode badges + win FX (4x2, 443px: 5 modes + 3 fx motes)
  sheet4 = logo + win hero (2x1: logo_petalvex, win_bloom)

Outputs STAGE into satellites/petalvex/assets/{bg,tiles,ui,fx}/ per the wire notes.

Usage: python3 scripts/cut_petalvex.py [SRC_DIR] [OUT_DIR] [only]
  only one of: bg tiles badges logo  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/5af457db-87c8-4d48-b9c3-ac3b8eca6656/scratchpad/artsrc/Petalvex"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/petalvex/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p
def c(path, edge, mode="cut"): return (path, edge, mode)

# value 0..9 (code palette order), then plain fill, then gold frame
SHEETS = {
 "tiles": ("sheet2.png", 4, 3, [
    c("tiles/wedge_0",362,"full"), c("tiles/wedge_1",362,"full"), c("tiles/wedge_2",362,"full"), c("tiles/wedge_3",362,"full"),
    c("tiles/wedge_4",362,"full"), c("tiles/wedge_5",362,"full"), c("tiles/wedge_6",362,"full"), c("tiles/wedge_7",362,"full"),
    c("tiles/wedge_8",362,"full"), c("tiles/wedge_9",362,"full"), c("tiles/wedge_plain",362,"full"), c("tiles/tile_frame",362,"full"),
 ]),
 "badges": ("sheet3.png", 4, 2, [
    c("ui/mode_sprout",300), c("ui/mode_bud",300),   c("ui/mode_bloom",300),  c("ui/mode_thicket",300),
    c("ui/mode_daily",300),  c("fx/fx_petal_a",240), c("fx/fx_petal_b",240),  c("fx/fx_pollen",240,"full"),
 ]),
 "logo": ("sheet4.png", 2, 1, [
    c("ui/logo_petalvex",900), c("ui/win_bloom",640),
 ]),
}
# sheet1: two stacked full-bleed backgrounds -> JPG
BGSTACK = ("sheet1.png", ["bg/bg_bed", "bg/bg_menu"])

# ---- magenta key machinery (ported from cut_petal-slice.py) --------------------
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
        if r: print("  %-30s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s (%s): %d/%d"%(key_name, src_file, ok, len(cells)))

def process_bgstack():
    src_file, names = BGSTACK
    fp = os.path.join(SRC, src_file)
    if not os.path.exists(fp): print("!! MISSING", fp); return
    a = np.asarray(Image.open(fp).convert("RGB")); H,W = a.shape[:2]
    # no magenta seam: split at the darkest ~uniform row in the central band
    lo,hi = int(H*0.42), int(H*0.58)
    bright = a[lo:hi].reshape(hi-lo,-1).astype(np.float32).mean(1)
    seam = lo + int(np.argmin(bright))
    print("  bgstack seam y=%d (%dx%d)"%(seam,W,H))
    halves = [ (0,seam), (seam,H) ]
    ok=0
    for (y0,y1), name in zip(halves, names):
        _,q = save_jpg(Image.fromarray(a[y0:y1]), name, 1600)
        print("  %-16s %dx%d q%d"%(name, W, y1-y0, q)); ok+=1
    print("bg (%s): %d/%d"%(src_file, ok, len(names)))

todo = ["bg","tiles","badges","logo"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bgstack()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown", s)
print("DONE ->", OUT)
