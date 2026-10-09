#!/usr/bin/env python3
"""Dewball forge MOSAIC: many kinds on one page, each cropped to the thing being judged,
today's primitive beside the model, so a whole world's batch can be looked at in a few
pictures instead of a hundred.

    python3 satellites/dewball/tools/forge/mosaic.py --shots <shot.mjs out dir> --world w1 \
        --size 412x915 --kinds a,b,c --out <dir> [--per 8] [--tile 300]

Each tile is a crop of a REAL player camera frame from shot.mjs (the -prim.png and
-model.png pair and the box shot.mjs wrote beside them), a square around the subject's
box with room to see what stands beside it. Nothing is rendered for the mosaic. A kind
with no shot is listed, never skipped quietly. Writes <out>/<world>-<size>-NN.jpg.
"""
import argparse, json, os, sys
from PIL import Image, ImageDraw, ImageFont


def font(px):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, px)
    return ImageFont.load_default()


def crop(png, box, tile):
    im = Image.open(png).convert('RGB')
    W, H = im.size
    if not box or not box.get('w'):
        side = min(W, H)
        cx, cy = W / 2, H / 2
    else:
        cx = (box['cx'] + 1) / 2 * W
        cy = (1 - box['cy']) / 2 * H
        side = max(box['w'] * W, box['h'] * H) * 1.6       # half sizes in NDC: w * W is the full width
        side = max(side, 120)
    side = min(side, W, H)
    x0 = min(max(0, cx - side / 2), W - side)
    y0 = min(max(0, cy - side / 2), H - side)
    return im.crop((int(x0), int(y0), int(x0 + side), int(y0 + side))).resize((tile, tile), Image.LANCZOS)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--shots', required=True)
    p.add_argument('--world', default='w1')
    p.add_argument('--size', default='412x915')
    p.add_argument('--kinds', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--per', type=int, default=8)
    p.add_argument('--tile', type=int, default=300)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    kinds = [k for k in a.kinds.split(',') if k]
    T, cap = a.tile, 30
    f1, f2 = font(18), font(14)
    missing, pages = [], []
    have = []
    for k in kinds:
        stem = os.path.join(a.shots, '%s-%s-%s' % (a.world, k, a.size))
        if os.path.exists(stem + '-model.png') and os.path.exists(stem + '-prim.png'):
            have.append((k, stem))
        else:
            missing.append(k)
    for pi in range(0, len(have), a.per):
        chunk = have[pi:pi + a.per]
        cols = 2
        rows = (len(chunk) + cols - 1) // cols
        page = Image.new('RGB', (cols * (2 * T + 16) + 16, rows * (T + cap + 14) + 10), (24, 26, 22))
        d = ImageDraw.Draw(page)
        for i, (k, stem) in enumerate(chunk):
            r, c = divmod(i, cols)
            x = 16 + c * (2 * T + 16)
            y = 10 + r * (T + cap + 14)
            meta = {}
            try:
                meta = json.load(open(stem + '-model.json'))
            except Exception:
                pass
            box = meta.get('box')
            page.paste(crop(stem + '-prim.png', box, T), (x, y + cap))
            page.paste(crop(stem + '-model.png', box, T), (x + T, y + cap))
            d.text((x + 4, y + 4), k, fill=(232, 220, 200), font=f1)
            d.text((x + T - 70, y + 8), 'today', fill=(170, 175, 150), font=f2)
            d.text((x + 2 * T - 64, y + 8), 'model', fill=(200, 168, 75), font=f2)
        name = os.path.join(a.out, '%s-%s-%02d.jpg' % (a.world, a.size, pi // a.per + 1))
        page.save(name, quality=88)
        pages.append(name)
    for n in pages:
        print(n)
    if missing:
        print('NO SHOT for: ' + ','.join(missing))
    print('MOSAIC %d kinds on %d page(s)' % (len(have), len(pages)))


main()
