#!/usr/bin/env python3
"""Cut Sprout Dice art sheets. Per-cell chroma-key (3-way hue: bright magenta field + dark
purple contact-shadow, keeps translucent bits) — same approach as cut_bramblewick.py.
One sheet per invocation; verify on a checkerboard before staging."""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1]; OUT = sys.argv[2]; which = sys.argv[3] if len(sys.argv)>3 else "all"
os.makedirs(OUT, exist_ok=True)

# (file, cols, rows, [names row-major; None=empty], erosion)
GRID = {
 "sheet1": ("sheet1.png", 4, 2, ["face_thorn","face_spread","face_heal","face_bark","face_root","face_wild","face_blank",None], 1),
 "sheet2": ("sheet2.png", 3, 2, ["pest_aphid","pest_locust","pest_beetle","pest_slug","pest_wasp","pest_weevil"], 2),
 "sheet3": ("sheet3.png", 3, 2, ["pest_thrip","pest_mantis","pest_stinkbug","pest_borer","pest_cutworm","pest_hornet"], 2),
 "sheet4": ("sheet4.png", 2, 2, ["boss_blight","boss_rootrot","boss_swarmqueen","boss_thornwyrm"], 2),
}
for rare, fn in [("common","sheet5.png"),("uncommon","sheet6.png"),("rare","sheet7.png"),("legendary","sheet8.png")]:
    GRID["s_"+rare] = (fn, 4, 2, ["die_%s_thorn"%rare,"die_%s_spread"%rare,"die_%s_heal"%rare,"die_%s_bark"%rare,
                                  "die_%s_root"%rare,"die_%s_wild"%rare,"die_%s_blank"%rare,None], 1)

def bg_mask(a):
    R,G,B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    hue = (R > G+24) & (B > G+24)
    return (hue & (np.minimum(R,B) > 170)) | (hue & (np.maximum(np.maximum(R,G),B) < 150))
def despill(a):
    R,G,B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = ((R+B)//2 - G) > 25
    return np.dstack([np.where(lean,np.minimum(R,G+35),R), G, np.where(lean,np.minimum(B,G+35),B)]).astype(np.uint8)

def cut(fn, cols, rows, names, erode):
    im = Image.open(os.path.join(SRC, fn)).convert("RGB"); a = np.asarray(im); H,W = a.shape[:2]
    cw, ch = W/cols, H/rows; saved=0
    for idx, nm in enumerate(names):
        if not nm: continue
        r,c = idx//cols, idx%cols
        cy0,cy1 = int(round(r*ch)), int(round((r+1)*ch)); cx0,cx1 = int(round(c*cw)), int(round((c+1)*cw))
        cell = a[cy0:cy1, cx0:cx1]; H2,W2 = cell.shape[:2]
        fg = ~bg_mask(cell)
        fg = ndi.binary_opening(fg, iterations=1)
        if erode: fg = ndi.binary_erosion(fg, iterations=erode)
        fg = ndi.binary_closing(fg, iterations=1)
        lbl,n = ndi.label(fg)
        if n==0: print("  %s EMPTY"%nm); continue
        sizes = ndi.sum(np.ones_like(lbl), lbl, range(1,n+1))
        keep = np.zeros_like(fg)
        for i in range(1,n+1):
            if sizes[i-1] >= 40: keep |= (lbl==i)
        if not keep.any(): print("  %s noise"%nm); continue
        m = ndi.binary_dilation(keep, iterations=erode) if erode else keep
        ys,xs = np.where(m); y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
        pad=6; y0,x0=max(0,y0-pad),max(0,x0-pad); y1,x1=min(H2,y1+pad),min(W2,x1+pad)
        rgb = despill(cell)[y0:y1,x0:x1]; alpha = ndi.gaussian_filter(m[y0:y1,x0:x1].astype(np.uint8)*255, 0.6)
        Image.fromarray(np.dstack([rgb,alpha]).astype(np.uint8),"RGBA").save(os.path.join(OUT, nm+".png"))
        print("  %s  %dx%d"%(nm, x1-x0, y1-y0)); saved+=1
    print("%s: %d cutouts"%(fn, saved))

todo = list(GRID.keys()) if which=="all" else [which]
for k in todo:
    if k in GRID: cut(*GRID[k])
    else: print("unknown:", k)
