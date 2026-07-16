"""tier7 idle+pop share one connected blob on the master (pop's sparkle ring
touches idle's petals). Split at the min-density valley between the two
flower cores, then clean each side."""
import os, numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC="satellites/seed-pot/art-drop/sheet1.png"; OUT="satellites/seed-pot/assets"
im=Image.open(SRC).convert("RGB"); a=np.asarray(im).astype(np.int32)
d=np.sqrt((a[:,:,0]-255)**2+(a[:,:,1])**2+(a[:,:,2]-255)**2)
alpha=np.clip((d-40)/80.0,0,1)
# row-4 band, cols 3-4, with headroom for overflowing petals
Y0,Y1,X0,X1=870,1254,600,1254
sub=alpha[Y0:Y1,X0:X1].copy()
lab,n=ndi.label(sub>0.35)
idx=np.arange(1,n+1)
sizes=ndi.sum(np.ones_like(lab),lab,idx)
big=[i+1 for i,s in enumerate(sizes) if s>=40]
mask=np.isin(lab,big)
dens=mask.sum(axis=0).astype(float)
# find the valley between the two cores: cores are the two densest windows
w=40; smooth=np.convolve(dens,np.ones(w)/w,mode='same')
mid_lo,mid_hi=int((941-X0)*0.55),int((1254-X0)-170)  # search between the flowers
# locate left core peak and right core peak, then min between
left_peak=int(np.argmax(smooth[:mid_lo+120]))
right_peak=int(mid_lo+120+np.argmax(smooth[mid_lo+120:]))
valley=int(left_peak+np.argmin(smooth[left_peak:right_peak]))
print("peaks",left_peak,right_peak,"valley",valley,"(abs x",valley+X0,")")

def save(mask_side, out, edge, keep_all, feather_right=False):
    l2,n2=ndi.label(mask_side)
    if not n2: raise SystemExit("empty "+out)
    id2=np.arange(1,n2+1); s2=ndi.sum(np.ones_like(l2),l2,id2)
    if keep_all: keep=[i+1 for i,s in enumerate(s2) if s>=60]
    else: keep=[int(id2[np.argmax(s2)])]
    m=np.isin(l2,keep)
    a2=np.where(m,sub,0.0)
    ys,xs=np.where(a2>0.02); pad=8
    by0,by1=max(0,ys.min()-pad),min(a2.shape[0],ys.max()+pad+1)
    bx0,bx1=max(0,xs.min()-pad),min(a2.shape[1],xs.max()+pad+1)
    rgb=a[Y0:Y1,X0:X1][by0:by1,bx0:bx1].astype(np.uint8)
    al=(a2[by0:by1,bx0:bx1]*255).astype(np.uint8)
    F=6
    if by1==a2.shape[0]: al[-F:,:]= (al[-F:,:].astype(float)*(np.arange(F)[::-1]/F)[:,None]).astype(np.uint8)
    if feather_right and bx1==a2.shape[1]: al[:,-F:]=(al[:,-F:].astype(float)*(np.arange(F)[::-1]/F)[None,:]).astype(np.uint8)
    out_im=Image.fromarray(np.dstack([rgb,al]),"RGBA")
    w0,h0=out_im.size; sc=edge/float(max(w0,h0))
    if sc<1: out_im=out_im.resize((int(w0*sc),int(h0*sc)),Image.LANCZOS)
    p=os.path.join(OUT,out); out_im.save(p,optimize=True)
    print(out,out_im.size,round(os.path.getsize(p)/1024,1),"KB")

left=mask.copy();  left[:,valley:]=False
right=mask.copy(); right[:,:valley]=False
save(left,"tiers/tier7_idle.png",256,False)
save(right,"tiers/tier7_pop.png",280,True,feather_right=True)
