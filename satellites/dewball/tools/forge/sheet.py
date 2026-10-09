#!/usr/bin/env python3
"""Dewball forge SHEETS: today's primitive beside each Meshy arm, one image per kind per
screen size, for a person to judge on a phone.

    python3 satellites/dewball/tools/forge/sheet.py --world w1 --kinds cakestand,teapot \
        --sizes 412x915,360x740 --arm std=<shot dir> --arm t2=<shot dir> --out <dir>

Each panel is a REAL player camera frame from shot.mjs (the same frame drawn as the model
and as the primitive), never a render made for the sheet. The primitive panel comes from
the first arm's run. Captions say which is which; nothing is called hand painted.
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont

LABEL = {'prim': 'today: primitives', 'std': 'Meshy standard 7.1, fitted', 't2': 'Meshy smart topology, fitted'}


def font(px):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, px)
    return ImageFont.load_default()


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--world', default='w1')
    p.add_argument('--kinds', required=True)
    p.add_argument('--sizes', default='412x915,360x740')
    p.add_argument('--arm', action='append', default=[], help='name=dir (first one also supplies the primitive)')
    p.add_argument('--out', required=True)
    p.add_argument('--names', default='', help='kind=Display Name,...')
    a = p.parse_args()
    arms = [x.split('=', 1) for x in a.arm]
    names = dict(x.split('=', 1) for x in a.names.split(',') if '=' in x)
    os.makedirs(a.out, exist_ok=True)
    f_cap, f_title = font(22), font(28)
    made = []
    for kind in a.kinds.split(','):
        for size in a.sizes.split(','):
            stem = '%s-%s-%s' % (a.world, kind, size)
            panels = [('prim', os.path.join(arms[0][1], stem + '-prim.png'))]
            panels += [(n, os.path.join(d, stem + '-model.png')) for n, d in arms]
            panels = [(n, f) for n, f in panels if os.path.exists(f)]
            if len(panels) < 2:
                print('skip %s (missing shots)' % stem)
                continue
            ims = [Image.open(f).convert('RGB') for _, f in panels]
            w, h = ims[0].size
            pad, top, cap = 10, 52, 36
            sheet = Image.new('RGB', (len(ims) * w + (len(ims) + 1) * pad, h + top + cap + pad), (13, 16, 12))
            d = ImageDraw.Draw(sheet)
            d.text((pad, 12), '%s  (%s, %s)' % (names.get(kind, kind), a.world, size), fill=(200, 168, 75), font=f_title)
            for i, ((n, _), im) in enumerate(zip(panels, ims)):
                x = pad + i * (w + pad)
                sheet.paste(im, (x, top))
                d.text((x + 6, top + h + 6), LABEL.get(n, n), fill=(232, 220, 200), font=f_cap)
            dst = os.path.join(a.out, stem + '.jpg')
            sheet.save(dst, quality=86)
            made.append(dst)
            print('sheet', os.path.relpath(dst), sheet.size)
    print('SHEETS %d' % len(made))


main()
