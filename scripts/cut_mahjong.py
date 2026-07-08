#!/usr/bin/env python3
# Cut the Jade Garden Mahjong art sheets into named PNGs.
# 6 sheets: 3 suit sheets (motifs on CREAM, magenta gutters), honors/wilds (magenta),
# ui-chrome (magenta), backgrounds (full-bleed, magenta gutters only).
import sys, os
import numpy as np
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-1000/-workspaces-lucid-winds/ee99f0fe-30d7-473b-9a36-669aa85bf677/scratchpad/mj_art/Majong'
OUT_TILES = sys.argv[2] if len(sys.argv) > 2 else '/workspaces/lucid-winds/satellites/mahjong/assets/tiles'
os.makedirs(OUT_TILES, exist_ok=True)

SHEETS = [
  ('sheet1.png', 3, 3, 'cream', ['bloom-1','bloom-2','bloom-3','bloom-4','bloom-5','bloom-6','bloom-7','bloom-8','bloom-9']),
  ('sheet2.png', 3, 3, 'cream', ['leaf-1','leaf-2','leaf-3','leaf-4','leaf-5','leaf-6','leaf-7','leaf-8','leaf-9']),
  ('sheet3.png', 3, 3, 'cream', ['seed-1','seed-2','seed-3','seed-4','seed-5','seed-6','seed-7','seed-8','seed-9']),
  ('sheet4.png', 3, 5, 'key', ['companion-butterfly','companion-honeybee','companion-ladybird','companion-dragonfly','root-taproot',
                               'root-bulb','root-rhizome','season-spring','season-summer','season-autumn',
                               'season-winter','element-rain','element-sun','element-soil','element-wind']),
  ('sheet5.png', 4, 4, 'key', ['tile-back','tile-plate','tile-lip','wordmark',
                               'badge-easy','badge-medium','badge-hard','badge-expert',
                               'trophy-bronze','trophy-silver','trophy-gold','garland',
                               'particle-petal','particle-spore','emblem-extra','sparkle-extra']),
  ('sheet6.png', 4, 2, 'bg', ['bg-table','bg-menu','bg-table-moss','bg-table-oak',
                              'bg-table-glass','bg-table-nightbloom','thumb','win-bg']),
]

def magenta_mask(a):
    r = a[:,:,0].astype(np.int32); g = a[:,:,1].astype(np.int32); b = a[:,:,2].astype(np.int32)
    mx = np.maximum(r,b)
    # magenta-ish: red & blue high, green clearly lower than max(r,b)
    return (r>140) & (b>100) & (g < 0.72*mx)

def despill(a, mask_soft):
    # reduce magenta fringe on edges: clamp green up toward min(r,b) where pinkish
    r=a[:,:,0].astype(np.int32); g=a[:,:,1].astype(np.int32); b=a[:,:,2].astype(np.int32)
    pink = (r>120)&(b>90)&(g < np.minimum(r,b))
    newg = np.where(pink, np.minimum(r,b), g)
    a[:,:,1] = newg.astype(np.uint8)
    return a

def opaque_bbox(alpha, thr=200):
    ys, xs = np.where(alpha > thr)
    if len(xs)==0: return None
    return xs.min(), ys.min(), xs.max()+1, ys.max()+1

def process_cell(cell, mode):
    a = np.array(cell.convert('RGBA'))
    H,W = a.shape[:2]
    if mode == 'bg':
        # full-bleed art; just trim magenta gutter borders
        m = magenta_mask(a)
        col_ok = np.where(m.mean(axis=0) < 0.6)[0]
        row_ok = np.where(m.mean(axis=1) < 0.6)[0]
        if len(col_ok) and len(row_ok):
            a = a[row_ok.min():row_ok.max()+1, col_ok.min():col_ok.max()+1]
        img = Image.fromarray(a).convert('RGB')
        return img
    # cream / key: build alpha from magenta mask
    m = magenta_mask(a)
    a = despill(a, m)
    alpha = np.where(m, 0, 255).astype(np.uint8)
    # feather 1px: soften alpha at mask boundary (cheap erosion of magenta)
    a[:,:,3] = alpha
    if mode == 'cream':
        # keep the cream cell (opaque region), crop to it, then trim a small margin to kill fringe
        bb = opaque_bbox(a[:,:,3], thr=128)
        if bb:
            x0,y0,x1,y1 = bb
            mgx = max(2,int((x1-x0)*0.02)); mgy = max(2,int((y1-y0)*0.02))
            x0=min(x1-1,x0+mgx); y0=min(y1-1,y0+mgy); x1=max(x0+1,x1-mgx); y1=max(y0+1,y1-mgy)
            a = a[y0:y1, x0:x1]
        out = Image.fromarray(a)
        # flatten onto its own cream (make fully opaque — no transparency for a cream face)
        flat = Image.new('RGBA', out.size, (0,0,0,0)); flat.paste(out,(0,0))
        rgb = np.array(flat); rgb[:,:,3]=255
        return Image.fromarray(rgb)
    else:  # key -> transparent motif, tight crop
        bb = opaque_bbox(a[:,:,3], thr=128)
        if bb:
            x0,y0,x1,y1 = bb
            pad = 6
            x0=max(0,x0-pad); y0=max(0,y0-pad); x1=min(a.shape[1],x1+pad); y1=min(a.shape[0],y1+pad)
            a = a[y0:y1, x0:x1]
        return Image.fromarray(a)

CHROME_OUT = os.path.join(os.path.dirname(OUT_TILES), 'chrome')
os.makedirs(CHROME_OUT, exist_ok=True)
FACE = set(['bloom','leaf','seed','companion','root','season','element'])

def dest_for(name, mode):
    prefix = name.split('-')[0]
    if prefix in FACE and mode in ('cream','key'):
        return os.path.join(OUT_TILES, name+'.png')
    # chrome/bg/ui -> assets root chrome folder
    ext = '.jpg' if name=='thumb' else '.png'
    return os.path.join(CHROME_OUT, name+ext)

for fn, rows, cols, mode, names in SHEETS:
    p = os.path.join(SRC, fn)
    im = Image.open(p).convert('RGBA')
    W,H = im.size
    cw, ch = W/cols, H/rows
    idx=0
    for r in range(rows):
        for c in range(cols):
            if idx>=len(names): break
            cell = im.crop((int(c*cw), int(r*ch), int((c+1)*cw), int((r+1)*ch)))
            out = process_cell(cell, mode)
            name = names[idx]; idx+=1
            dst = dest_for(name, mode)
            if name=='thumb':
                out = out.convert('RGB')
                # portal thumb: crop to <=480, keep <=150KB
                out.thumbnail((480,480))
                out.save(dst, quality=82)
            elif mode=='bg':
                # board bg 540x960 (center-crop to 9:16 then resize)
                target=(540,960); tw,th=target; ow,oh=out.size
                s=max(tw/ow, th/oh); nw,nh=int(ow*s),int(oh*s)
                out=out.resize((nw,nh)); l=(nw-tw)//2; t=(nh-th)//2
                out=out.crop((l,t,l+tw,t+th)); out.save(dst, quality=88)
            else:
                out.save(dst)
            print('  %-22s -> %s  %s' % (name, os.path.relpath(dst,'/workspaces/lucid-winds'), out.size))

print('DONE')
