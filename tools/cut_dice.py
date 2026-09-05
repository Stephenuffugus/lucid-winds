#!/usr/bin/env python3
"""tools/cut_dice.py — cut a dice face set: matte to alpha, crop to the die, ship at 512px.

    python3 tools/cut_dice.py assets/dice/dark            # every d1..d6.png in the folder
    python3 tools/cut_dice.py <dir> --size 512 --keep 40   # keep = matte tolerance from white

Why. The Dark Garden set shipped five faces as 1254px opaque masters with a hundred pixel near
white matte around the die and one face (d3) as a proper 1024px cut with alpha. In the game the
die box is object-fit:cover with a dark ground, so the five read as dice inside a big white grid
(Stephen, Sep 05 2026). A set is not cut until every face has alpha 0 at its corners.

The matte is removed by flood filling near white from the four corners (so a white pip inside the
die survives), the face is cropped to the die's box with a 2% margin, resized to `size`, and the
master is kept beside it as dN-master.png. Faces that already have transparent corners are only
resized. Corners are checked after and printed.
"""
import os, sys, glob
from collections import deque

try:
    from PIL import Image
except ImportError:
    sys.exit('needs Pillow:  pip install pillow')


def matte_to_alpha(im, keep):
    im = im.convert('RGBA'); W, H = im.size; px = im.load()
    def light(p): return p[3] > 0 and min(p[0], p[1], p[2]) >= 255 - keep
    seen = bytearray(W * H); q = deque()
    for (x, y) in ((0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1)):
        if light(px[x, y]): q.append((x, y)); seen[y * W + x] = 1
    while q:
        x, y = q.popleft(); px[x, y] = (px[x, y][0], px[x, y][1], px[x, y][2], 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < W and 0 <= ny < H and not seen[ny * W + nx]:
                seen[ny * W + nx] = 1
                if light(px[nx, ny]): q.append((nx, ny))
    return im


def main():
    argv = sys.argv[1:]
    if not argv or argv[0].startswith('--'): sys.exit(__doc__)
    root = argv[0]
    size = int(argv[argv.index('--size') + 1]) if '--size' in argv else 512
    keep = int(argv[argv.index('--keep') + 1]) if '--keep' in argv else 40
    for f in sorted(glob.glob(os.path.join(root, 'd[1-6].png'))):
        master = f[:-4] + '-master.png'
        if not os.path.exists(master): os.replace(f, master)
        im = Image.open(master).convert('RGBA'); W, H = im.size
        corners = [im.getpixel(p)[3] for p in ((0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1))]
        if max(corners) > 8:
            im = matte_to_alpha(im, keep)
        bbox = im.getchannel('A').getbbox()
        if bbox:
            m = int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.02)
            bbox = (max(0, bbox[0] - m), max(0, bbox[1] - m), min(W, bbox[2] + m), min(H, bbox[3] + m))
            im = im.crop(bbox)
        # square it on transparent so object-fit:cover never stretches a die
        w, h = im.size; side = max(w, h); sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); sq.paste(im, ((side - w) // 2, (side - h) // 2)); im = sq
        im = im.resize((size, size), Image.LANCZOS); im.save(f, optimize=True)
        out = Image.open(f); c2 = [out.getpixel(p)[3] for p in ((0, 0), (size - 1, 0), (0, size - 1), (size - 1, size - 1))]
        print('%-8s master %dx%d corners alpha %s -> ship %dx%d corners alpha %s %dKB' % (os.path.basename(f), W, H, corners, size, size, c2, os.path.getsize(f) // 1024))
    print('⛔ a set is not cut until every ship face reads alpha 0 in all four corners')


main()
