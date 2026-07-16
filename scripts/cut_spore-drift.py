#!/usr/bin/env python3
"""Cut the Spore Drift "Inkwater Bioluminance" art pack.

Delivered subset (7 of 10 prompt sheets, verified BY EYE):
  sheet1 = spore    (4x3 magenta) -> hero orb + 4 membranes + puff/absorb/blossom states
  sheet2 = motes    (4x3 magenta) -> prey/threat orbs + elder crown + flower mote + absorb
  sheet3 = fx       (4x4 magenta) -> current filaments + particle streaks + bursts + rings
  sheet4 = bg_abyss (full-bleed portrait)   sheet5 = bg_kelp
  sheet6 = bg_moonpool                      sheet7 = bg_starfield
  (NO ui/trails sheets delivered — buttons stay CSS, trails stay procedural)

Cut positionally (r{row}c{col}) so wiring can reference exact cells after a visual pass.
Magenta-KEY-distance pipeline (from cut_silt.py). Out -> satellites/spore-drift/assets/.
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/e69970ff-1c13-41f3-b352-1ff539332ebd/scratchpad/packs/Spore Drift"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/spore-drift/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

def grid_cells(prefix, cols, rows, edge, mode="cut"):
    out=[]
    for r in range(rows):
        for cc in range(cols):
            out.append(("%s/r%dc%d"%(prefix,r+1,cc+1), edge, mode))
    return out

SHEETS = {
 "spore": ("sheet1.png", 4, 3, grid_cells("spore",4,3,300)),
 "motes": ("sheet2.png", 4, 3, grid_cells("motes",4,3,300)),
 "fx":    ("sheet3.png", 4, 4, grid_cells("fx",4,4,280)),
}
BACKGROUNDS = [
 ("sheet4.png","backgrounds/abyss"), ("sheet5.png","backgrounds/kelp"),
 ("sheet6.png","backgrounds/moonpool"), ("sheet7.png","backgrounds/starfield"),
]

def sample_key(a):
    Hh,Ww = a.shape[:2]; s=10
    for cc in [a[0:s,0:s], a[0:s,Ww-s:Ww], a[Hh-s:Hh,0:s], a[Hh-s:Hh,Ww-s:Ww]]:
        m=cc.reshape(-1,3).astype(float).mean(0)
        if m[0]>150 and m[2]>150 and m[1]<90: return m
    return None
def magenta_mask(a, key):
    R,G,B=a[:,:,0].astype(np.float32),a[:,:,1].astype(np.float32),a[:,:,2].astype(np.float32)
    if key is not None:
        return np.sqrt((R-key[0])**2+(G-key[1])**2+(B-key[2])**2)<100.0
    return (R>G+24)&(B>G+24)&(np.minimum(R,B)>150)&(G<85)
def despill(a):
    Rf,Gf,Bf=a[:,:,0].astype(np.int16),a[:,:,1].astype(np.int16),a[:,:,2].astype(np.int16)
    lean=((Rf+Bf)//2-Gf)>30
    return np.dstack([np.where(lean,np.minimum(Rf,Gf+40),Rf),Gf,np.where(lean,np.minimum(Bf,Gf+40),Bf)]).astype(np.uint8)
def fit(im,e):
    w,h=im.size; m=max(w,h)
    return im.resize((max(1,int(w*e/m)),max(1,int(h*e/m))),Image.LANCZOS) if m>e else im
def save_png(im,path,e):
    p=P(path+".png")
    for _ in range(6):
        fit(im,e).save(p,optimize=True)
        if os.path.getsize(p)<=150*1024 or e<90: break
        e=int(e*0.82)
def save_jpg(im,path,e):
    base=im.convert("RGB"); p=P(path+".jpg")
    for _ in range(8):
        cur=fit(base,e); q=88; cur.save(p,quality=q)
        while os.path.getsize(p)>150*1024 and q>40: q-=6; cur.save(p,quality=q)
        if os.path.getsize(p)<=150*1024 or e<500: break
        e=int(e*0.85)
    return q
def cut_cell(cell,path,edge,key,keep_full=False):
    ch,cw=cell.shape[:2]
    fg=~magenta_mask(cell,key)
    fg=ndi.binary_opening(fg,iterations=1); fg=ndi.binary_erosion(fg,iterations=1); fg=ndi.binary_closing(fg,iterations=2)
    lbl,n=ndi.label(fg)
    if n==0: return None
    sizes=ndi.sum(np.ones_like(lbl),lbl,range(1,n+1)); big=sizes.max()
    keep=np.zeros_like(fg)
    for i in range(1,n+1):
        if sizes[i-1]>=max(40,big*0.02): keep|=(lbl==i)
    if not keep.any(): return None
    m=ndi.binary_dilation(keep,iterations=1)
    if keep_full: y0,y1,x0,x1=0,ch,0,cw
    else:
        ys,xs=np.where(m); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        y0,x0=max(0,y0-4),max(0,x0-4); y1,x1=min(ch,y1+4),min(cw,x1+4)
    rgb=despill(cell)[y0:y1,x0:x1]
    alpha=ndi.gaussian_filter((m[y0:y1,x0:x1].astype(np.uint8))*255,0.6)
    save_png(Image.fromarray(np.dstack([rgb,alpha]).astype(np.uint8),"RGBA"),path,edge)
    return (x1-x0,y1-y0)
def process_sheet(key_name):
    src,cols,rows,cells=SHEETS[key_name]
    fp=os.path.join(SRC,src)
    if not os.path.exists(fp): print("!! MISSING",fp); return
    a=np.asarray(Image.open(fp).convert("RGB")); Hh,Ww=a.shape[:2]
    key=sample_key(a); cw,chh=Ww/cols,Hh/rows; ok=0
    print("%s (%s) key=%s grid=%dx%d"%(key_name,src,None if key is None else [int(x) for x in key],cols,rows))
    for idx,(path,edge,mode) in enumerate(cells):
        r,c=idx//cols,idx%cols
        y0,y1=int(round(r*chh)),int(round((r+1)*chh)); x0,x1=int(round(c*cw)),int(round((c+1)*cw))
        res=cut_cell(a[y0:y1,x0:x1],path,edge,key,keep_full=(mode=="full"))
        if res: ok+=1
    print("  %s: %d/%d"%(key_name,ok,len(cells)))
def process_bg():
    ok=0
    for src,name in BACKGROUNDS:
        fp=os.path.join(SRC,src)
        if not os.path.exists(fp): print("!! MISSING",fp); continue
        im=Image.open(fp).convert("RGB"); q=save_jpg(im,name,1000)
        sz=os.path.getsize(P(name+".jpg"))//1024; print("  %-26s %dx%d q%d %dKB"%(name,im.size[0],im.size[1],q,sz)); ok+=1
    print("  backgrounds: %d/%d"%(ok,len(BACKGROUNDS)))

todo=["spore","motes","fx","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bg()
    elif s in SHEETS: process_sheet(s)
print("DONE ->",OUT)
