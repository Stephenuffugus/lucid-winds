#!/usr/bin/env python3
"""cut_popnlock.py — cut the Pop N Lock "Neon Boombox" art pack into game sprites.

Reads the raw sheets from  satellites/chaff-wars/art-drop/
Writes cut sprites to       satellites/chaff-wars/assets/

The crew/hero/UI/FX/logo sheets are magenta (#FF00FF) knockout. We do NOT use a
global magenta key (the ART contains hot-magenta #FF2FB9 rim lights and pink
detail) — instead a BORDER-FLOOD: only magenta connected to a cell's edge is
cleared, so interior magenta enclosed by the thick black outlines survives.

Grid cells are found by CONTENT-BAND detection (the magenta gutters between
characters are near-100% background), which survives Midjourney grid drift; it
falls back to even division with a warning if the band count is wrong.

Backgrounds (6a/6b) are opaque: just resized + JPEG, no knockout.

Usage:  python3 scripts/cut_popnlock.py [sheetKey ...]   (default: all)
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'satellites/chaff-wars/art-drop')
OUT  = os.path.join(ROOT, 'satellites/chaff-wars/assets')

# ---- magenta background detection ------------------------------------------
# pure   = the flat knockout itself, ~(250,2,220). G<=16 is the discriminator:
#          art magenta (#FF2FB9 G47, hot-pink cores G22, deer rose G97) never
#          drops that low, so a `pure` test never touches the artwork.
# strong = looser knockout, for grid gutter/band detection.
# weak   = knockout OR its anti-aliased halo (used to grow the clear region).
def masks(arr):
    r, g, b = arr[..., 0].astype(np.int16), arr[..., 1].astype(np.int16), arr[..., 2].astype(np.int16)
    pure   = (r >= 235) & (g <= 16) & (b >= 195)
    strong = (r >= 205) & (g <= 75) & (b >= 190)
    weak   = (r >= 150) & (g <= 130) & (b >= 120) & ((r - g) >= 80) & ((b - g) >= 60)
    return pure, strong, weak

def knockout_region(cell_rgb):
    """Return RGBA with the magenta knockout transparent — the outer frame AND
    any enclosed knockout hole (e.g. the middle of a ring), while every interior
    art magenta is preserved. Rule: a weak-magenta blob is background iff it
    contains a `pure` knockout pixel (art blobs never do)."""
    arr = np.asarray(cell_rgb.convert('RGB'))
    h, w = arr.shape[:2]
    pure, strong, weak = masks(arr)
    lbl, n = ndimage.label(weak)
    bgmask = np.zeros((h, w), bool)
    if n:
        flat = lbl.ravel()
        areas = np.bincount(flat, minlength=n + 1).astype(np.float64)
        pcount = np.bincount(flat, weights=pure.ravel().astype(np.float64), minlength=n + 1)
        frac = pcount / np.maximum(areas, 1)
        border = set(lbl[0, :]).union(lbl[-1, :]).union(lbl[:, 0]).union(lbl[:, -1])
        border.discard(0)
        # background = the outer knockout frame (touches border) OR an enclosed
        # hole that is almost entirely pure knockout (a ring/star's open middle).
        # An art blob (magenta pill, pink core) is only a few % pure -> kept.
        bg_labels = [lab for lab in range(1, n + 1) if lab in border or frac[lab] >= 0.45]
        if bg_labels:
            bgmask = np.isin(lbl, bg_labels)
    bgmask |= pure                        # belt & suspenders: clear stray pure px
    # build alpha
    alpha = np.where(bgmask, 0, 255).astype(np.uint8)
    # halo cleanup: fade any surviving weak-magenta pixel that borders cleared
    cleared = bgmask
    dil = ndimage.binary_dilation(cleared, iterations=2)
    halo = dil & (~cleared) & weak
    alpha[halo] = (alpha[halo] * 0.25).astype(np.uint8)
    # a second pass: pixels now fully transparent extend the cleared set edge
    out = np.dstack([arr, alpha])
    return Image.fromarray(out, 'RGBA')

# ---- content-band grid detection -------------------------------------------
def content_bands(strong_full, count, axis):
    """Find `count` content bands (cell extents) along `axis`.
    A line is 'gutter' if >=94% background. Content bands are runs of non-gutter."""
    frac = strong_full.mean(axis=1 - axis)   # fraction magenta per line along axis
    content = frac < 0.90
    # collapse runs
    bands, i, L = [], 0, len(content)
    while i < L:
        if content[i]:
            j = i
            while j < L and content[j]:
                j += 1
            if (j - i) >= L * 0.02:          # ignore tiny specks
                bands.append((i, j))
            i = j
        else:
            i += 1
    return bands

def grid_cells(img, rows, cols):
    """Return cells[r][c] = (x0,y0,x1,y1). Content-band primary, even fallback."""
    arr = np.asarray(img.convert('RGB'))
    _, strong, _ = masks(arr)
    H, W = strong.shape
    xb = content_bands(strong, cols, axis=1)
    yb = content_bands(strong, rows, axis=0)
    ok = (len(xb) == cols and len(yb) == rows)
    if not ok:
        print(f"   ! band detect got {len(xb)}x{len(yb)} (want {cols}x{rows}) -> even division")
        xb = [(round(c*W/cols), round((c+1)*W/cols)) for c in range(cols)]
        yb = [(round(r*H/rows), round((r+1)*H/rows)) for r in range(rows)]
    cells = [[(xb[c][0], yb[r][0], xb[c][1], yb[r][1]) for c in range(cols)] for r in range(rows)]
    return cells, ok

def tight(rgba, pad=6):
    a = np.asarray(rgba)[..., 3]
    ys, xs = np.where(a > 12)
    if len(xs) == 0:
        return rgba
    x0, x1, y0, y1 = xs.min(), xs.max()+1, ys.min(), ys.max()+1
    x0 = max(0, x0-pad); y0 = max(0, y0-pad)
    x1 = min(rgba.width, x1+pad); y1 = min(rgba.height, y1+pad)
    return rgba.crop((x0, y0, x1, y1))

def save_png(img, rel):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    img.save(p)
    print(f"   -> {rel}  {img.size}")

# ---- sheet configs ----------------------------------------------------------
CREW = {
    'sheet1-crew-a.png': ['aphid-swarm', 'gnat-king-cole', 'cabbage-moth'],
    'sheet2-crew-b.png': ['slug-slugmore', 'cutworm', 'june-beetle'],
    'sheet3-crew-c.png': ['garden-snail', 'crow-cawlin', 'gopher-gustavo'],
    'sheet4-crew-d.png': ['deer-duchess', 'bindweed-lady', 'powdery-mildew'],
    'sheet5-heroes.png': ['baron-greymould', 'ronin-hare', 'keeper'],
}
POSES = ['idle', 'win', 'lose']

# sheet8 UI chrome: row-major names + crop mode ('tight' | 'fixed'); None=skip
UI_MAP = [
    ['vs-frame',   'banner-win', 'banner-lose', 'banner-allclear'],
    ['mode-a',     'mode-b',     'next-window', 'power-lit'],
    ['burst-1',    'burst-2',    'burst-3',     'burst-go'],
    ['room-card',  'power-unlit', None,          None],
]
UI_FIXED = {'power-lit', 'power-unlit', 'burst-1', 'burst-2', 'burst-3', 'burst-go'}

FX_MAP = [
    ['pop-splat-1', 'pop-splat-2', 'pop-splat-3', 'pop-splat-4'],
    ['chaff-splat-1', 'chaff-splat-2', 'chaff-splat-3', 'chaff-splat-4'],
    ['buff-wipe-1', 'buff-wipe-2', 'buff-wipe-3', 'buff-wipe-4'],
    ['cast-aura-1', 'cast-aura-2', 'cast-aura-3', 'cast-aura-4'],
]

def do_crew(fname, ids):
    print(f"[crew] {fname}")
    img = Image.open(os.path.join(SRC, fname))
    cells, ok = grid_cells(img, 3, 3)
    for r in range(3):
        for c in range(3):
            box = cells[r][c]
            k = knockout_region(img.crop(box))
            save_png(tight(k), f"char/{ids[c]}-{POSES[r]}.png")

def _uniform_fixed(img, cells, rows, cols):
    """max cell size across grid, for aligned fixed-cell output."""
    mw = max(cells[r][c][2]-cells[r][c][0] for r in range(rows) for c in range(cols))
    mh = max(cells[r][c][3]-cells[r][c][1] for r in range(rows) for c in range(cols))
    return mw, mh

def do_grid_named(fname, mapping, fixed_set, outdir):
    print(f"[grid] {fname}")
    img = Image.open(os.path.join(SRC, fname))
    rows, cols = len(mapping), len(mapping[0])
    cells, ok = grid_cells(img, rows, cols)
    mw, mh = _uniform_fixed(img, cells, rows, cols)
    for r in range(rows):
        for c in range(cols):
            name = mapping[r][c]
            if not name:
                continue
            k = knockout_region(img.crop(cells[r][c]))
            if name in fixed_set:
                canvas = Image.new('RGBA', (mw, mh), (0, 0, 0, 0))
                canvas.paste(k, ((mw-k.width)//2, (mh-k.height)//2), k)
                save_png(canvas, f"{outdir}/{name}.png")
            else:
                save_png(tight(k), f"{outdir}/{name}.png")

def do_logo(fname, out):
    print(f"[logo] {fname}")
    img = Image.open(os.path.join(SRC, fname))
    k = knockout_region(img)
    save_png(tight(k, pad=10), out)

def do_bg(fname, out, longside=1920):
    print(f"[bg] {fname}")
    img = Image.open(os.path.join(SRC, fname)).convert('RGB')
    w, h = img.size
    scale = longside / max(w, h)
    if scale < 1:
        img = img.resize((round(w*scale), round(h*scale)), Image.LANCZOS)
    p = os.path.join(OUT, out)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    for q in (82, 78, 72, 66, 60):
        img.save(p, 'JPEG', quality=q, optimize=True, progressive=True)
        kb = os.path.getsize(p) / 1024
        if kb <= 300:
            break
    print(f"   -> {out}  {img.size}  q{q}  {kb:.0f}KB")

def main():
    which = sys.argv[1:] or ['crew', 'ui', 'fx', 'logo', 'bg']
    os.makedirs(OUT, exist_ok=True)
    if 'crew' in which:
        for f, ids in CREW.items():
            do_crew(f, ids)
    if 'ui' in which:
        do_grid_named('sheet8-ui-chrome.png', UI_MAP, UI_FIXED, 'ui')
    if 'fx' in which:
        allfx = {n for row in FX_MAP for n in row}
        do_grid_named('sheet9-fx.png', FX_MAP, allfx, 'fx')
    if 'logo' in which:
        do_logo('sheet7a-logo-stacked.png', 'logo/stacked.png')
        do_logo('sheet7b-logo-wide.png', 'logo/wide.png')
    if 'bg' in which:
        do_bg('sheet6a-menu-wall.png', 'bg/menu-wall.jpg')
        do_bg('sheet6b-battle-alley.png', 'bg/battle-alley.jpg')
    print("done.")

if __name__ == '__main__':
    main()
