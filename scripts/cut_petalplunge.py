#!/usr/bin/env python3
"""Cut Petal Plunge sprite sheets -> named game assets (magenta chroma-key + CC extraction;
full-bleed contact crop for biomes; mixed sheet5). One sheet per call (8GB no-swap box)."""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1]; OUT = sys.argv[2]; which = sys.argv[3] if len(sys.argv) > 3 else "all"
os.makedirs(OUT, exist_ok=True)

GRID = {  # (cols, rows, [names row-major; None=empty]) on flat magenta
 "sheet1": (4, 4, ["rider_sprout","rider_acorn","rider_ladybug","rider_bee",
                   "rider_snail","rider_frog","rider_mouse","rider_robin",
                   "rider_foxkit","rider_firefly","rider_mantis","rider_lumin",
                   "rider_gnomeling",None,None,None]),
 "sheet2": (3, 4, ["sled_leaf","sled_petal","sled_bark",
                   "sled_lily","sled_cap","sled_birch",
                   "sled_husk","sled_shell","sled_aurora",
                   "gnome","gnome_angry",None]),
 "sheet3": (4, 4, ["obs_bush","obs_tree","obs_glowtree","obs_shroom",
                   "obs_bigshroom","obs_thorn","obs_log","obs_stump",
                   "obs_boulder","obs_stone","obs_glowstone","obs_daisyclump",
                   "obs_ramp",None,None,None]),
}
CONTACT = {  # full-bleed backgrounds -> jpg
 "sheet4": (2, 3, ["bg_meadow","bg_bramble","bg_mushroom","bg_thorn","bg_night",None], 8),
}

def magenta_mask(a):
    R,G,B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    return (R > 200) & (B > 180) & (G < 95)

def despill(a):
    R,G,B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = ((R+B)//2 - G) > 25
    return np.dstack([np.where(lean, np.minimum(R,G+35), R), G,
                      np.where(lean, np.minimum(B,G+35), B)]).astype(np.uint8)

def cut_magenta(name, cols, rows, names):
    a = np.asarray(Image.open(os.path.join(SRC, name+".png")).convert("RGB"))
    H, W = a.shape[:2]
    fg = ~magenta_mask(a)
    fg = ndi.binary_opening(fg, iterations=1); fg = ndi.binary_erosion(fg, iterations=2); fg = ndi.binary_closing(fg, iterations=1)
    lbl, n = ndi.label(fg)
    if n == 0: print(name, "no sprites"); return
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n+1)); cents = ndi.center_of_mass(fg, lbl, range(1, n+1))
    rgb = despill(a); cellW, cellH = W/cols, H/rows; cellb = {}
    for i in range(1, n+1):
        if sizes[i-1] < 400: continue
        cy, cx = cents[i-1]; r = min(rows-1, int(cy//cellH)); c = min(cols-1, int(cx//cellW))
        cellb.setdefault((r,c), []).append(i)
    saved = 0
    for idx, nm in enumerate(names):
        if not nm: continue
        ids = cellb.get((idx//cols, idx%cols), [])
        if not ids: print(f"  {nm}: (empty cell)"); continue
        m = ndi.binary_dilation(np.isin(lbl, ids), iterations=2); ys, xs = np.where(m)
        y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
        p=8; y0,x0=max(0,y0-p),max(0,x0-p); y1,x1=min(H,y1+p),min(W,x1+p)
        alpha = ndi.gaussian_filter(m[y0:y1,x0:x1].astype(np.uint8)*255, 0.6)
        Image.fromarray(np.dstack([rgb[y0:y1,x0:x1], alpha]).astype(np.uint8), "RGBA").save(os.path.join(OUT, nm+".png"))
        print(f"  {nm}.png {x1-x0}x{y1-y0}"); saved += 1
    print(f"{name}: {saved}")

def cut_contact(name, cols, rows, names, trim):
    im = Image.open(os.path.join(SRC, name+".png")).convert("RGB"); W, H = im.size
    cellW, cellH = W/cols, H/rows
    for idx, nm in enumerate(names):
        if not nm: continue
        r,c = idx//cols, idx%cols
        crop = im.crop((int(round(c*cellW))+trim, int(round(r*cellH))+trim, int(round((c+1)*cellW))-trim, int(round((r+1)*cellH))-trim))
        crop.save(os.path.join(OUT, nm+".jpg"), quality=90); print(f"  {nm}.jpg {crop.size[0]}x{crop.size[1]}")

def cut_sheet5():
    """3x3: (0,0)=thumbnail painted, (0,1)=icon painted, rest=magenta trails."""
    im = Image.open(os.path.join(SRC, "sheet5.png")).convert("RGB"); W, H = im.size
    cw, ch = W/3, H/3
    def cell(r,c,t=6): return im.crop((int(c*cw)+t, int(r*ch)+t, int((c+1)*cw)-t, int((r+1)*ch)-t))
    # painted thumbnail + icon (crop as-is, no key)
    thumb = cell(0,0); thumb.save(os.path.join(OUT, "petal-plunge.jpg"), quality=90); print(f"  petal-plunge.jpg {thumb.size[0]}x{thumb.size[1]}")
    icon = cell(0,1); icon.save(os.path.join(OUT, "icon-master.png")); print(f"  icon-master.png {icon.size[0]}x{icon.size[1]}")
    # trails on magenta (7)
    trails = {(0,2):"trail_dew",(1,0):"trail_pollen",(1,1):"trail_petals",(1,2):"trail_frost",(2,0):"trail_rainbow",(2,1):"trail_ember",(2,2):"trail_star"}
    for (r,c), nm in trails.items():
        a = np.asarray(cell(r,c,2).convert("RGB")); m = ~magenta_mask(a)
        m = ndi.binary_opening(m, iterations=1); m = ndi.binary_erosion(m, iterations=1)
        if m.sum() < 300: print(f"  {nm}: faint");
        m2 = ndi.binary_dilation(m, iterations=1); ys, xs = np.where(m2)
        if len(ys)==0: print(f"  {nm}: empty"); continue
        y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
        rgb = despill(a); alpha = ndi.gaussian_filter(m2[y0:y1,x0:x1].astype(np.uint8)*255, 0.6)
        Image.fromarray(np.dstack([rgb[y0:y1,x0:x1], alpha]).astype(np.uint8), "RGBA").save(os.path.join(OUT, nm+".png"))
        print(f"  {nm}.png {x1-x0}x{y1-y0}")

todo = list(GRID.keys()) + list(CONTACT.keys()) + ["sheet5"] if which == "all" else [which]
for name in todo:
    if name == "sheet5": cut_sheet5()
    elif name in GRID: cut_magenta(name, *GRID[name])
    elif name in CONTACT: cut_contact(name, *CONTACT[name])
