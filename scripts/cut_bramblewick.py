#!/usr/bin/env python3
"""Cut Bramblewick sprite sheets into named game assets.

Per-cell chroma-key (NOT centroid connected-components) for the magenta grid
sheets, so detached bits survive — mite clusters, dandelion fluff, snowflakes,
motion lines. Each cell is cropped from the grid, its magenta keyed + despilled,
then trimmed to content. Special handling for the logo (painted grey checkerboard,
keyed by border-flood so interior highlights stay opaque), the arena bg, and the
hero/thumbnail.

One sheet per invocation (box is 8GB/no-swap; never load them all at once).
Outputs to a STAGING dir; nothing touches the game until verified.
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-1000/-workspaces-lucid-winds/04c06853-cf9d-4759-8631-a9ccdad3d604/scratchpad/bw_art/Bramblewick"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/tmp/claude-1000/-workspaces-lucid-winds/04c06853-cf9d-4759-8631-a9ccdad3d604/scratchpad/bw_cut"
which = sys.argv[3] if len(sys.argv) > 3 else "all"
os.makedirs(OUT, exist_ok=True)

# (cols, rows, [names row-major; None = empty cell], erosion_px)
GRID = {
 "sheet1": (4, 4, ["player","boss_grubfather","boss_stormwing","pest_aphid",
                   "pest_beetle","pest_locust","pest_slug","pest_wasp",
                   "pest_mite","pest_weevil","pest_scale","pest_mealybug",
                   "pest_cutworm","pest_thrip","pest_vineborer",None], 2),
 "sheet2": (4, 3, ["companion_ladybug","companion_firefly","companion_bee","companion_butterfly",
                   "companion_hummingbird","companion_spider","companion_mantis","companion_seahorse",
                   "companion_toad","companion_mammoth","companion_scorpion","companion_pangolin"], 2),
 "sheet3": (4, 3, ["companion_hedgehog","companion_snail","companion_worm","companion_koi",
                   "companion_jellyfish","companion_koala","companion_sprite","companion_fawn",
                   "companion_raccoon","companion_owl","companion_cicada","companion_beholder"], 2),
 # 10 weapons then 12 passives, row-major, matches WEAPONS/PASSIVES key order in index.html
 "sheet5": (6, 4, ["icon_dandelion","icon_nettle","icon_puffball","icon_sundew","icon_foxglove","icon_sunflower",
                   "icon_frostfern","icon_thornvine","icon_bloodroot","icon_witchhazel","icon_goldenhour","icon_phyllotaxis",
                   "icon_windspores","icon_taproot","icon_guttation","icon_heliotropism","icon_chillreservoir","icon_nectarguide",
                   "icon_thigmonasty","icon_mycorrhizae","icon_etiolation","icon_vernalization",None,None], 1),
}

def magenta_mask(a):
    """Background = magenta-HUED pixels that are either the flat bright key OR the
    dark purple contact-shadow the AI painted under each sprite. Mid-brightness
    magenta-hue (translucent gold wings over magenta) is KEPT."""
    R,G,B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    hue = (R > G+24) & (B > G+24)                       # magenta/purple hue (R&B above green)
    bright_bg = hue & (np.minimum(R,B) > 170)           # the flat magenta field
    dark_shadow = hue & (np.maximum(np.maximum(R,G),B) < 150)  # purple drop-shadow puddle
    return bright_bg | dark_shadow

def despill(a):
    Rf,Gf,Bf = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = ((Rf + Bf)//2 - Gf) > 25          # magenta-leaning edge pixels
    Rf2 = np.where(lean, np.minimum(Rf, Gf + 35), Rf)
    Bf2 = np.where(lean, np.minimum(Bf, Gf + 35), Bf)
    return np.dstack([Rf2, Gf, Bf2]).astype(np.uint8)

def cut_grid(name, cols, rows, names, erode):
    im = Image.open(os.path.join(SRC, name + ".png")).convert("RGB")
    a = np.asarray(im); H, W = a.shape[:2]
    cellW, cellH = W/cols, H/rows
    saved = 0
    for idx, nm in enumerate(names):
        if not nm: continue
        r, c = idx // cols, idx % cols
        cy0, cy1 = int(round(r*cellH)), int(round((r+1)*cellH))
        cx0, cx1 = int(round(c*cellW)), int(round((c+1)*cellW))
        cell = a[cy0:cy1, cx0:cx1]
        ch, cw = cell.shape[:2]
        fg = ~magenta_mask(cell)
        fg = ndi.binary_opening(fg, iterations=1)          # drop speckle
        if erode: fg = ndi.binary_erosion(fg, iterations=erode)  # eat magenta fringe
        fg = ndi.binary_closing(fg, iterations=1)          # re-close interior gaps
        # keep every real blob in the cell (union) but drop tiny stragglers
        lbl, n = ndi.label(fg)
        if n == 0: print(f"  {nm}: EMPTY cell"); continue
        sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n+1))
        keep = np.zeros_like(fg)
        for i in range(1, n+1):
            if sizes[i-1] >= 30: keep |= (lbl == i)
        if not keep.any(): print(f"  {nm}: all-noise"); continue
        m = ndi.binary_dilation(keep, iterations=erode) if erode else keep
        ys, xs = np.where(m)
        y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
        pad = 6
        y0,x0 = max(0,y0-pad), max(0,x0-pad); y1,x1 = min(ch,y1+pad), min(cw,x1+pad)
        rgb = despill(cell)[y0:y1, x0:x1]
        alpha = ndi.gaussian_filter(m[y0:y1, x0:x1].astype(np.uint8)*255, 0.6)
        out = np.dstack([rgb, alpha]).astype(np.uint8)
        Image.fromarray(out, "RGBA").save(os.path.join(OUT, nm + ".png"))
        print(f"  {nm}.png  {x1-x0}x{y1-y0}")
        saved += 1
    print(f"{name}: {saved} cutouts")

def cut_logo():
    """sheet4b: gold+vine wordmark on a painted neutral-grey checkerboard.
    Key pixels that are near-neutral AND bright AND connected to the border."""
    im = Image.open(os.path.join(SRC, "sheet4b.png")).convert("RGB")
    a = np.asarray(im); H, W = a.shape[:2]
    R,Gc,B = a[:,:,0].astype(int), a[:,:,1].astype(int), a[:,:,2].astype(int)
    neutral = (abs(R-Gc) < 14) & (abs(Gc-B) < 14) & (abs(R-B) < 14) & (np.minimum(np.minimum(R,Gc),B) > 150)
    # neutral checker = background if border-connected (outer field) OR a large
    # enclosed region (letter counters like the holes in B/A/R). Small neutral
    # blobs (cream highlight specks inside the gold) are kept.
    lbl, n = ndi.label(neutral)
    border_ids = set(lbl[0,:]) | set(lbl[-1,:]) | set(lbl[:,0]) | set(lbl[:,-1])
    border_ids.discard(0)
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n+1))
    bg_ids = set(int(i) for i in range(1, n+1) if (i in border_ids) or sizes[i-1] > 120)
    bg = np.isin(lbl, list(bg_ids))
    fg = ~bg
    fg = ndi.binary_closing(fg, iterations=2)   # seal any pinholes inside the letters
    fg = ndi.binary_opening(fg, iterations=1)   # drop stray checker speckle kept as fg
    ys, xs = np.where(fg)
    y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
    pad = 8
    y0,x0 = max(0,y0-pad), max(0,x0-pad); y1,x1 = min(H,y1+pad), min(W,x1+pad)
    alpha = ndi.gaussian_filter(fg[y0:y1,x0:x1].astype(np.uint8)*255, 0.6)
    out = np.dstack([a[y0:y1,x0:x1], alpha]).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(os.path.join(OUT, "logo.png"))
    print(f"logo.png  {x1-x0}x{y1-y0}")

def cut_bg():
    """sheet4c: arena floor, full-bleed. Keep portrait, save as jpg."""
    im = Image.open(os.path.join(SRC, "sheet4c.png")).convert("RGB")
    im.save(os.path.join(OUT, "bg.jpg"), quality=88)
    print(f"bg.jpg  {im.size[0]}x{im.size[1]}")

def cut_thumb():
    """sheet4a: hero shot. -> portal thumbnail (480, <=150KB) + a menu splash (900)."""
    im = Image.open(os.path.join(SRC, "sheet4a.png")).convert("RGB")
    # portal thumbnail
    t = im.resize((480,480), Image.LANCZOS)
    p = os.path.join(OUT, "bramblewick_thumb.jpg")
    q = 88
    t.save(p, quality=q)
    while os.path.getsize(p) > 150*1024 and q > 60:
        q -= 6; t.save(p, quality=q)
    print(f"bramblewick_thumb.jpg  480x480  {os.path.getsize(p)//1024}KB q{q}")
    # menu splash (downscaled, quality)
    m = im.resize((900,900), Image.LANCZOS)
    m.save(os.path.join(OUT, "menu.jpg"), quality=86)
    print(f"menu.jpg  900x900  {os.path.getsize(os.path.join(OUT,'menu.jpg'))//1024}KB")

todo = (list(GRID.keys()) + ["logo","bg","thumb"]) if which == "all" else [which]
for name in todo:
    if name in GRID:       cut_grid(name, *GRID[name])
    elif name == "logo":   cut_logo()
    elif name == "bg":     cut_bg()
    elif name == "thumb":  cut_thumb()
    else: print("unknown:", name)
