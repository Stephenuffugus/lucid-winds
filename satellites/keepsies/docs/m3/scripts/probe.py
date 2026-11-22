import sys, os, io, math
sys.path.append("/home/codespace/.local/lib/python3.14/site-packages")
from PIL import Image
P = sys.argv[1]
OUT = sys.argv[2]
def L(p): return Image.open(os.path.join(P, p))
def webp_bytes(im, q=80, size=None):
    if size: im = im.resize(size, Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return len(b.getvalue())
# 1 horizon strip
h = L('assets/b_fixes/horizon_strip.png').convert('RGBA')
W, H = h.size
px = h.load()
# seam: compare col 0 and col W-1 where alpha>0
d=0; n=0
for y in range(H):
    a=px[0,y]; b=px[W-1,y]
    d += sum(abs(a[i]-b[i]) for i in range(4)); n+=1
print('horizon seam mean abs diff (RGBA sum) col0 vs colW-1:', round(d/n,1))
# compare to adjacent columns difference as baseline
d2=0
for y in range(H):
    a=px[100,y]; b=px[101,y]; d2 += sum(abs(a[i]-b[i]) for i in range(4))
print('horizon adjacent-column baseline:', round(d2/H,1))
# alpha profile by row (mean alpha) at a few rows
rows = [0,50,100,150,200,250,300,340,360,380,400,440,480,511]
prof=[]
for y in rows:
    s=sum(px[x,y][3] for x in range(0,W,4))/(W/4); prof.append((y, round(s)))
print('horizon mean alpha by row:', prof)
# brightest (lamp) location: max luminance among opaque pixels, coarse grid
best=(0,0,0)
for y in range(0,H,2):
    for x in range(0,W,2):
        r,g,b,a=px[x,y]
        if a>200:
            l=0.2126*r+0.7152*g+0.0722*b
            if l>best[0]: best=(l,x,y)
print('horizon brightest opaque px: lum %.0f at (%d,%d), x/W=%.3f' % (best[0],best[1],best[2],best[1]/W))
print('horizon webp q80 full 4096x512 bytes:', webp_bytes(h))
print('horizon webp q80 2048x256 bytes:', webp_bytes(h, size=(2048,256)))
print('horizon webp q80 1600x200 bytes:', webp_bytes(h, size=(1600,200)))
# 2 chalk stroke
c = L('assets/b_fixes/chalk_stroke.png').convert('RGBA'); cp=c.load(); cw,ch=c.size
rowa=[round(sum(cp[x,y][3] for x in range(cw))/cw) for y in range(ch)]
print('chalk mean alpha per row y0..63:', rowa)
seam=sum(abs(cp[0,y][3]-cp[cw-1,y][3]) for y in range(ch))/ch
print('chalk seam alpha diff col0 vs col2047:', round(seam,1))
# breaks: columns where alpha along y=32 is low
col_cov=[sum(1 for y in range(12,52) if cp[x,y][3]>60) for x in range(cw)]
gaps=[]; inside=False
for x,v in enumerate(col_cov):
    if v<6 and not inside: inside=True; s=x
    if v>=6 and inside: inside=False; gaps.append((s,x-s))
print('chalk breaks (start,width) where <6 of the 40 line px are inked:', gaps[:20], 'count', len(gaps))
# rgb of chalk
ys=[cp[x,32] for x in range(0,cw,7) if cp[x,32][3]>150]
if ys: print('chalk ink mean rgb:', tuple(round(sum(p[i] for p in ys)/len(ys)) for i in range(3)))
# 3 pouches
for k in ['standard','collector','grail']:
    im=L('assets/b_fixes/pouch_%s_open.png'%k).convert('RGBA'); q=im.load()
    import json
    print('pouch',k,'webp q82 640:',webp_bytes(im,82),'webp q82 320:',webp_bytes(im,82,(320,320)))
anch = __import__('json').load(open(os.path.join(P,'anchors.json')))
for k in ['standard','collector','grail']:
    a=anch['assets/b_fixes/pouch_%s_open.png'%k]
    im=L('assets/b_fixes/pouch_%s_open.png'%k).convert('RGBA'); q=im.load()
    cx,cy=a['live_render_center']; r=a['live_render_radius']
    lum=[];al=[]
    for y in range(cy-r,cy+r,3):
        for x in range(cx-r,cx+r,3):
            if (x-cx)**2+(y-cy)**2<=r*r:
                R,G,B,A=q[x,y]; lum.append(0.2126*R+0.7152*G+0.0722*B); al.append(A)
    lum.sort()
    print('pouch',k,'inside live circle: alpha min',min(al),'lum median',round(lum[len(lum)//2]),'p95',round(lum[int(len(lum)*.95)]))
    ex,ey,rx,ry=a['mouth_ellipse']
    print('   circle r',r,'vs mouth ellipse rx,ry',rx,ry,'fits' if r<=min(rx,ry) else 'DOES NOT FIT (r>ry)')
# 4 calibration target ring radii
t=L('assets/c_screens/calibration_target.png').convert('RGBA'); tp=t.load()
prof=[(rr, tp[256+rr,256][3]) for rr in range(0,256,6)]
print('calib target alpha along +x from centre (r,alpha):', [p for p in prof if p[1]>0])
# 5 footprint ring radius
f=L('assets/a_statues/footprint_column_allowed.png').convert('RGBA'); fp=f.load()
print('footprint alpha along +x (r,a>0):', [(rr,fp[128+rr,128][3]) for rr in range(0,128) if fp[128+rr,128][3]>0][:12])
m=L('assets/a_statues/move_reach.png').convert('RGBA'); mp=m.load()
print('move_reach alpha along +y (r,a>0):', [(rr,mp[512,512+rr][3]) for rr in range(400,512) if mp[512,512+rr][3]>0][:12])
# 6 title hero window quietness
tl=L('assets/c_screens/title_lot.webp').convert('RGB'); tq=tl.load()
def region_stats(img, box):
    x,y,w,hh=box; pix=img.load(); v=[]
    for yy in range(y,y+hh,4):
        for xx in range(x,x+w,4):
            R,G,B=pix[xx,yy][:3]; v.append(0.2126*R+0.7152*G+0.0722*B)
    mu=sum(v)/len(v); sd=math.sqrt(sum((a-mu)**2 for a in v)/len(v)); return round(mu),round(sd)
ta=anch['assets/c_screens/title_lot.webp']
for k in ['hero_window','wordmark_band','play_band','collection_band','currency_band','arcade_band']:
    print('title',k,ta[k],'lum mean,sd',region_stats(tl,ta[k]))
print('title_lot webp bytes', os.path.getsize(os.path.join(P,'assets/c_screens/title_lot.webp')))
# 7 heirloom cloth at 375
hc=anch['assets/b_fixes/heirloom_cloth.svg']
print('heirloom: plate 900 wide at 375 css -> scale',375/900,'render window 240 ->',round(240*375/900,1),'css; brief asked radius>=90 at 900 -> she gives',[r['radius'] for r in hc['resting_places']])
# 8 share match card windows
