#!/usr/bin/env python3
"""forge3d/floors.py - the raster support assets: stadium floors + trail ramps.

    python3 tools/forge3d/floors.py

Floors: albedo + roughness, 1024, one pair per stadium, chalk on tamped
dirt in the game's own palette. HONEST PLACEHOLDERS: painted floor
textures are on the ChatGPT support-art list, and a painted file dropped
over these at the same path simply wins - nothing else references them.
The marks are the MODE's truth though, drawn from the sim's numbers:
the ridge sits at K.ridgeAt of the radius, Taya's pin circle is where
resolveTaya pins the loser, Long Range has its five bands.

Trail ramps: 6 gradient ramps at 64x4 exactly as the asset list orders,
colours from the game's own TRAIL_HEX.
"""
import os, math, json
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT_F = os.path.join(ROOT, 'assets', '3d', 'stadium', 'floors')
OUT_T = os.path.join(ROOT, 'assets', 'fx', 'trails')
N = 1024
RIDGE_AT = 0.72          # sim2 K.ridgeAt: where the dish flattens into the ridge
DIRT = (58, 48, 38)
CHALK = (232, 220, 200)

TRAILS = {               # play-shell TRAIL_HEX, minus 'none'
    'ember': '#C4442B', 'frost': '#9FC7D6', 'rope': '#C9A227',
    'ink': '#8C86A8', 'jade': '#7FA650', 'violet': '#9A6FB0',
}

def dirt_base(seed):
    rng = np.random.default_rng(seed)
    base = np.zeros((N, N, 3), np.float32) + DIRT
    # two octaves of blotch so it reads as tamped earth, not a flat fill
    for scale, amt in ((16, 14), (64, 7)):
        small = rng.normal(0, 1, (scale, scale))
        big = np.asarray(Image.fromarray(
            ((small - small.min()) / (np.ptp(small) + 1e-6) * 255).astype(np.uint8)
        ).resize((N, N), Image.BILINEAR), np.float32) / 255.0 - 0.5
        base += big[..., None] * amt
    grain = rng.normal(0, 2.2, (N, N, 1))
    return np.clip(base + grain, 0, 255)

def chalk_ring(dr, r_frac, width, blur_seed=0):
    """A hand-drawn chalk circle: slightly wobbly, broken in places."""
    cx = cy = N // 2
    r = r_frac * (N // 2)
    rng = np.random.default_rng(137 + blur_seed)
    steps = 720
    pts = []
    for i in range(steps + 1):
        a = 2 * math.pi * i / steps
        wob = 1 + rng.normal(0, 0.004)
        pts.append((cx + math.cos(a) * r * wob, cy + math.sin(a) * r * wob))
    for i in range(steps):
        if rng.random() < 0.06:      # chalk skips
            continue
        dr.line([pts[i], pts[i + 1]], fill=CHALK, width=width)

def save_pair(name, albedo, marks):
    img = Image.fromarray(albedo.astype(np.uint8))
    dr = ImageDraw.Draw(img)
    marks(dr)
    img.save(os.path.join(OUT_F, name + '_albedo.png'))
    # roughness: dirt is rough, chalk marks a touch rougher and brighter -
    # derive from how far a pixel drifted toward chalk
    a = np.asarray(img, np.float32)
    chalkness = np.clip((a.mean(axis=2) - 90) / 120, 0, 1)
    rough = (205 + chalkness * 35).astype(np.uint8)
    Image.fromarray(rough, 'L').save(os.path.join(OUT_F, name + '_rough.png'))

def floors():
    os.makedirs(OUT_F, exist_ok=True)
    def ridge(dr):
        chalk_ring(dr, RIDGE_AT, 3, 1)
    # marks must sit INSIDE the dish floor: the texture covers the full
    # radius but everything past ridgeAt is rail material and never
    # samples it - a ring at 0.94 simply vanished
    save_pair('chalk_ring', dirt_base(1), lambda dr: (
        ridge(dr), chalk_ring(dr, 0.58, 5, 2)))
    save_pair('posts', dirt_base(2), lambda dr: ridge(dr))
    def taya(dr):
        ridge(dr)
        cx = cy = N // 2
        chalk_ring(dr, 0.20, 5, 3)                      # the pin circle
        dr.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=CHALK)
    save_pair('taya_circle', dirt_base(3), taya)
    def rangebands(dr):
        for i, rf in enumerate((0.14, 0.28, 0.42, 0.56, 0.68)):
            chalk_ring(dr, rf, 4 if i != 3 else 3, 10 + i)
    save_pair('long_range', dirt_base(4), rangebands)
    print('floors: 4 albedo + 4 roughness in', os.path.relpath(OUT_F, ROOT))

def ramps():
    os.makedirs(OUT_T, exist_ok=True)
    for tid, hexc in TRAILS.items():
        c = tuple(int(hexc[i:i + 2], 16) for i in (1, 3, 5))
        im = Image.new('RGBA', (64, 4))
        px = im.load()
        for x in range(64):
            t = x / 63.0                     # 0 = tail, 1 = head
            boost = 1.0 + 0.35 * (t ** 3)    # the head runs a little hot
            col = tuple(min(255, int(v * boost)) for v in c)
            for y in range(4):
                px[x, y] = (*col, int(255 * (t ** 1.4)))
        im.save(os.path.join(OUT_T, tid + '.png'))
    print('trail ramps: %d at 64x4 in %s' % (len(TRAILS), os.path.relpath(OUT_T, ROOT)))

if __name__ == '__main__':
    floors()
    ramps()
