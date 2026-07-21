#!/usr/bin/env python3
"""cut_jimothy.py — cut the Jimothy (Stream Hop / Seattle raccoon) art pack.

Reads raw sheets from  satellites/stream-hop/art-drop/
Writes cut assets to    satellites/stream-hop/assets/

Sprite sheets (1,2,5,6,7,8) are magenta (#FF00FF-ish, ~235/25/235) knockout.
We use a BORDER-FLOOD (from cut_popnlock.py), NOT a global magenta key: only the
magenta connected to a cell edge (or a near-pure enclosed hole) is cleared, so
any interior detail survives and there is NO stray edge halo. This is the exact
fix for the two bugs seen on the Hues cut (interior eaten / color popping outside).

Backgrounds (3 lanes, 4a-4f scenes, 9 scenes, splash) are opaque: resize + JPEG.

Usage:  python3 scripts/cut_jimothy.py [group ...]
        groups: hero sprites powers ui fx skins bg  (default: all)
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'satellites/stream-hop/art-drop')
OUT  = os.path.join(ROOT, 'satellites/stream-hop/assets')

# ---- magenta background detection (tuned to this pack: bg ~ 235,25,235) -----
def masks(arr):
    r, g, b = arr[..., 0].astype(np.int16), arr[..., 1].astype(np.int16), arr[..., 2].astype(np.int16)
    pure   = (r >= 210) & (g <= 55)  & (b >= 195)                                  # the flat knockout
    strong = (r >= 190) & (g <= 95)  & (b >= 175)                                  # gutter detection
    weak   = (r >= 135) & (g <= 140) & (b >= 120) & ((r - g) >= 55) & ((b - g) >= 40)  # knockout + halo
    return pure, strong, weak

def knockout_region(cell_rgb, drop_shadow=True):
    """RGBA with the magenta knockout transparent — outer frame AND near-pure
    enclosed holes cleared; every interior art pixel preserved; halo faded.

    drop_shadow: also absorb the soft purple/magenta contact-shadow the artist
    baked under each object. That shadow is magenta blended toward black, so it
    misses the magenta masks and survives as a purple smear. We flood it away
    only where it is CONNECTED to the border background (interior purple, e.g. a
    magic ripple, is not border-connected, so it is preserved). Raccoon fur is
    grey/brown (green never the strict min by a wide margin), so this is safe."""
    arr = np.asarray(cell_rgb.convert('RGB'))
    h, w = arr.shape[:2]
    r, g, b = arr[..., 0].astype(np.int16), arr[..., 1].astype(np.int16), arr[..., 2].astype(np.int16)
    pure, strong, weak = masks(arr)
    bgish = weak.copy()
    if drop_shadow:
        shadow = ((r - g) >= 16) & ((b - g) >= 10) & (np.maximum(r, b) <= 215) & (g <= 125)
        bgish = weak | shadow
    lbl, n = ndimage.label(bgish)
    bgmask = np.zeros((h, w), bool)
    if n:
        flat = lbl.ravel()
        areas = np.bincount(flat, minlength=n + 1).astype(np.float64)
        pcount = np.bincount(flat, weights=pure.ravel().astype(np.float64), minlength=n + 1)
        frac = pcount / np.maximum(areas, 1)
        border = set(lbl[0, :]).union(lbl[-1, :]).union(lbl[:, 0]).union(lbl[:, -1])
        border.discard(0)
        bg_labels = [lab for lab in range(1, n + 1) if lab in border or frac[lab] >= 0.55]
        if bg_labels:
            bgmask = np.isin(lbl, bg_labels)
    bgmask |= pure
    alpha = np.where(bgmask, 0, 255).astype(np.uint8)
    # halo cleanup: fade weak-magenta / shadow pixels adjacent to cleared region
    dil = ndimage.binary_dilation(bgmask, iterations=2)
    halo = dil & (~bgmask) & bgish
    alpha[halo] = (alpha[halo] * 0.22).astype(np.uint8)
    out = np.dstack([arr, alpha])
    return Image.fromarray(out, 'RGBA')

# ---- content-band grid detection (survives MJ grid drift) -------------------
def content_bands(strong_full, axis):
    frac = strong_full.mean(axis=1 - axis)
    content = frac < 0.86
    bands, i, L = [], 0, len(content)
    while i < L:
        if content[i]:
            j = i
            while j < L and content[j]:
                j += 1
            if (j - i) >= L * 0.02:
                bands.append((i, j))
            i = j
        else:
            i += 1
    return bands

def grid_cells(img, rows, cols):
    arr = np.asarray(img.convert('RGB'))
    _, strong, _ = masks(arr)
    H, W = strong.shape
    xb = content_bands(strong, axis=1)
    yb = content_bands(strong, axis=0)
    if len(xb) != cols or len(yb) != rows:
        print(f"   ! band detect {len(xb)}x{len(yb)} (want {cols}x{rows}) -> even division")
        xb = [(round(c*W/cols), round((c+1)*W/cols)) for c in range(cols)]
        yb = [(round(r*H/rows), round((r+1)*H/rows)) for r in range(rows)]
    return [[(xb[c][0], yb[r][0], xb[c][1], yb[r][1]) for c in range(cols)] for r in range(rows)]

def tight(rgba, pad=6):
    a = np.asarray(rgba)[..., 3]
    ys, xs = np.where(a > 14)
    if len(xs) == 0:
        return rgba
    x0, x1, y0, y1 = xs.min(), xs.max()+1, ys.min(), ys.max()+1
    x0 = max(0, x0-pad); y0 = max(0, y0-pad)
    x1 = min(rgba.width, x1+pad); y1 = min(rgba.height, y1+pad)
    return rgba.crop((int(x0), int(y0), int(x1), int(y1)))

def fit(img, longside):
    w, h = img.size
    s = longside / max(w, h)
    if s < 1:
        img = img.resize((max(1, round(w*s)), max(1, round(h*s))), Image.LANCZOS)
    return img

def save_png(img, rel, maxkb=150):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    img.save(p, optimize=True)
    kb = os.path.getsize(p)/1024
    if kb > maxkb:  # quantize RGBA to shrink
        q = img.convert('RGBA')
        alpha = q.split()[3]
        q = q.convert('RGB').quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE)
        q = q.convert('RGBA'); q.putalpha(alpha)
        q.save(p, optimize=True)
        kb = os.path.getsize(p)/1024
    print(f"   -> {rel}  {img.size}  {kb:.0f}KB")

def save_jpg(img, rel, longside, maxkb=280):
    img = fit(img.convert('RGB'), longside)
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    for qv in (86, 80, 74, 68, 62, 56):
        img.save(p, 'JPEG', quality=qv, optimize=True, progressive=True)
        kb = os.path.getsize(p)/1024
        if kb <= maxkb:
            break
    print(f"   -> {rel}  {img.size}  q{qv}  {kb:.0f}KB")

# ---- grid maps --------------------------------------------------------------
HERO_MAP = [
    ['idle','crouch','leap','land'],
    ['run-l','run-r','run-r2','dash-run'],
    ['scared','dizzy','splash','shield'],
    ['coffee','umbrella','magnet','flee'],
    ['sit','eat','cheer','ko'],
]
SPR_MAP = [
    ['pad-dumpster','pad-pallet','pad-boxraft','pad-log'],
    ['obs-can','pickup-fries','obs-rat','obs-goose'],
    ['deco-salmon','haz-wave','coin-cap','obs-trashbags'],
    ['pickup-treasure','obs-cone','fx-ripple','deco-manhole'],
]
POW_MAP = [
    ['power_coffee','power_umbrella','power_snacks'],
    ['hud_coffee','hud_umbrella','hud_snacks'],
]

# cells whose art is legitimately purple/magenta — skip shadow absorption there
NO_SHADOW = {'fx-ripple'}

def cut_named(sheet, mapping, outdir, longside):
    print(f"[cut] {sheet} -> {outdir}/")
    img = Image.open(os.path.join(SRC, sheet))
    rows, cols = len(mapping), len(mapping[0])
    cells = grid_cells(img, rows, cols)
    for r in range(rows):
        for c in range(cols):
            name = mapping[r][c]
            if not name:
                continue
            k = tight(knockout_region(img.crop(cells[r][c]), drop_shadow=name not in NO_SHADOW))
            save_png(fit(k, longside), f"{outdir}/{name}.png")

def cut_generic(sheet, rows, cols, outdir, longside):
    print(f"[cut] {sheet} -> {outdir}/ (generic {rows}x{cols})")
    img = Image.open(os.path.join(SRC, sheet))
    cells = grid_cells(img, rows, cols)
    for r in range(rows):
        for c in range(cols):
            k = tight(knockout_region(img.crop(cells[r][c])))
            save_png(fit(k, longside), f"{outdir}/cell-{r+1}-{c+1}.png")

def main():
    which = sys.argv[1:] or ['hero','sprites','powers','ui','fx','skins','bg']
    if 'hero' in which:    cut_named('1.png', HERO_MAP, 'hero', 400)
    if 'sprites' in which: cut_named('2.png', SPR_MAP, 'sprites', 300)
    if 'powers' in which:  cut_named('8.png', POW_MAP, 'powers', 320)
    if 'ui' in which:      cut_generic('5.png', 6, 4, 'ui', 260)
    if 'fx' in which:      cut_generic('6.png', 4, 4, 'fx', 300)
    if 'skins' in which:   cut_generic('7.png', 4, 4, 'skins', 300)
    if 'bg' in which:
        print('[bg] scenes 4a-4f + 9 + splash')
        for f, out in [('4a.png','bg/zone-street.jpg'),('4b.png','bg/zone-dumpster.jpg'),
                       ('4c.png','bg/zone-waterfront.jpg'),('4d.png','bg/zone-market.jpg'),
                       ('4e.png','bg/zone-bridge.jpg'),('4f.png','bg/zone-skyline.jpg'),
                       ('Splashstartscreen.png','bg/splash.jpg')]:
            save_jpg(Image.open(os.path.join(SRC, f)), out, 1400, 300)
    print('done.')

if __name__ == '__main__':
    main()
