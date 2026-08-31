#!/usr/bin/env python3
"""forge3d/topdown_post.py - turns the raw straight-down hero renders into
the dish's sprite set: assets/topdown/<slot>/<id>.webp, 320px, alpha kept,
content scaled to artcut's FILL=0.92 so topSprite's radius math (blade
radius = 0.46 of frame) holds for renders exactly as it does for paint.

    python3 tools/forge3d/topdown_post.py
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IN = os.path.join(HERE, 'renders', 'topdown')
FILL = 0.92
SIZE = 320

def main():
    n = 0
    for f in sorted(os.listdir(IN)):
        if not f.endswith('.png'):
            continue
        slot, pid = f[:-4].split('-', 1)
        im = Image.open(os.path.join(IN, f)).convert('RGBA')
        a = np.asarray(im)[:, :, 3]
        ys, xs = np.nonzero(a > 8)
        if not len(ys):
            print('EMPTY render', f); continue
        crop = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
        side = int(SIZE * FILL)
        crop.thumbnail((side, side), Image.LANCZOS)
        out = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
        out.paste(crop, ((SIZE - crop.width) // 2, (SIZE - crop.height) // 2), crop)
        d = os.path.join(ROOT, 'assets', 'topdown', slot)
        os.makedirs(d, exist_ok=True)
        out.save(os.path.join(d, pid + '.webp'), 'WEBP', quality=88, method=6)
        n += 1
    print(n, 'topdown sprites written')

if __name__ == '__main__':
    main()
