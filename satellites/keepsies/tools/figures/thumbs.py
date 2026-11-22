#!/usr/bin/env python3
# KEEPSIES m5: the tray's figure tiles, 96 px PNGs from Astra's reference pictures that Meshy sculpted from
# (the raw folder's <id>.png): the black studio ground keyed out by a flood from the edges, cropped to the figure.
#   python3 tools/figures/thumbs.py RAW_DIR OUT_DIR id [id ...]
import sys, os
from PIL import Image, ImageDraw, ImageFilter

raw, out, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
for fid in ids:
    im = Image.open(os.path.join(raw, fid + '.png')).convert('RGB')
    w, h = im.size
    # mask: 255 where the ground is (dark and reachable from an edge)
    dark = im.convert('L').point(lambda v: 255 if v < 22 else 0)
    flood = Image.new('L', (w + 2, h + 2), 255)
    flood.paste(dark, (1, 1))
    ImageDraw.floodfill(flood, (0, 0), 128)
    bg = flood.crop((1, 1, w + 1, h + 1)).point(lambda v: 255 if v == 128 else 0)
    alpha = bg.point(lambda v: 255 - v).filter(ImageFilter.GaussianBlur(1.2))
    rgba = im.copy(); rgba.putalpha(alpha)
    box = alpha.point(lambda v: 255 if v > 40 else 0).getbbox() or (0, 0, w, h)
    rgba = rgba.crop(box)
    s = 96 / max(rgba.size)
    rgba = rgba.resize((max(1, round(rgba.size[0] * s)), max(1, round(rgba.size[1] * s))), Image.LANCZOS)
    tile = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
    tile.paste(rgba, ((96 - rgba.size[0]) // 2, 96 - rgba.size[1]), rgba)
    tile.save(os.path.join(out, fid + '.tile.png'), optimize=True)
    print('thumb', fid, os.path.getsize(os.path.join(out, fid + '.tile.png')))
