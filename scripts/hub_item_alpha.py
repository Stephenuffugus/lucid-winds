#!/usr/bin/env python3
"""Hub R6: the item paintings (assets/items/*.png) are opaque with a black square round the parchment, which
reads as a black box on the shop's green cards. Re-write each item's .webp (made by hub_image_diet.py) with
that black surround made transparent: near-black pixels reachable from the edge only, so dark paint inside the
parchment is never touched. Originals are not touched. Idempotent.  python3 scripts/hub_item_alpha.py"""
import glob, os
from PIL import Image, ImageDraw, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
n = 0
for src in sorted(glob.glob(os.path.join(ROOT, 'assets/items/*.png'))):
    im = Image.open(src).convert('RGB')
    if im.mode == 'RGBA': continue
    w, h = im.size
    # a mask: 255 where the pixel is near black
    dark = im.convert('L').point(lambda v: 255 if v <= 26 else 0)
    if dark.getpixel((0, 0)) != 255: continue          # no black surround: leave it
    reach = dark.copy()
    for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if reach.getpixel(seed) == 255: ImageDraw.floodfill(reach, seed, 128)
    alpha = reach.point(lambda v: 0 if v == 128 else 255).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert('RGBA'); out.putalpha(alpha)
    out.save(os.path.splitext(src)[0] + '.webp', 'WEBP', quality=82, method=6)
    n += 1
print('items keyed', n)
