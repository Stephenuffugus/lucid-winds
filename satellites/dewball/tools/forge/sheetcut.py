#!/usr/bin/env python3
"""Dewball forge SHEETCUT: Stephen's ChatGPT asset sheets, cut into one picture per kind for
Meshy's image to 3D.

    python3 satellites/dewball/tools/forge/sheetcut.py <sheet.png> --grid 2x2 --kinds hedgehog,toadG,snailG,firefly
    python3 satellites/dewball/tools/forge/sheetcut.py <one.png>   --grid 1x1 --kinds lmDovecote

Kinds are named in READING ORDER (left to right, top to bottom); "-" skips a cell. Writes
tools/forge/meshy-in/<kind>.png (the object alone on transparency, square, at most 1024 px) and
meshy-in/_contact-<sheet>.png, which a person opens before a credit is spent.

How, and why this way:
- The background colour is READ FROM THE BORDER, never assumed: generators hand back white, grey or a
  gradient whatever the prompt said (the lesson in satellites/ripcord/tools/artcut.py).
- The object is what is NOT connected to the frame edge through background coloured pixels (a flood
  fill from the border), so a white object on a white sheet keeps its white inside, and a dark eye
  inside a pale body survives.
- Each object is found as connected pieces, slightly dilated so a firefly's wings join its body, and
  given to the grid cell its centre falls in. A piece that crosses into a neighbour's cell is
  REPORTED (a sheet whose objects touch cannot be cut cleanly; ask for more space).
"""
import argparse, json, os, sys
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'meshy-in')


def border_colour(a):
    b = np.concatenate([a[0, :], a[-1, :], a[:, 0], a[:, -1]]).astype(np.float64)
    return np.median(b, axis=0)


def background_mask(a, bg, tol):
    """background = within tol of the border colour AND connected to the image edge"""
    near = np.sqrt(((a.astype(np.float64) - bg) ** 2).sum(-1)) < tol
    lab, n = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]]))) - {0}
    return np.isin(lab, list(edge))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('sheet')
    p.add_argument('--grid', default='2x2')
    p.add_argument('--kinds', required=True)
    p.add_argument('--tol', type=float, default=34.0)
    p.add_argument('--holes', type=float, default=0.0, help='also clear enclosed background within this tol (0 = off; 8 suits a flat grey sheet)')
    p.add_argument('--max', type=int, default=1024)
    p.add_argument('--out', default=OUT)
    a = p.parse_args()
    cols, rows = (int(v) for v in a.grid.lower().split('x'))
    kinds = a.kinds.split(',')
    if len(kinds) != cols * rows:
        sys.exit('%d kinds for a %s grid: name every cell in reading order, "-" for an empty one' % (len(kinds), a.grid))
    os.makedirs(a.out, exist_ok=True)
    im = Image.open(a.sheet).convert('RGB')
    arr = np.asarray(im)
    H, W = arr.shape[:2]
    bg = border_colour(arr)
    back = background_mask(arr, bg, a.tol)
    if a.holes:
        # background seen THROUGH the object (a key's ring, a handle, the gaps between columns): enclosed, so the
        # edge flood never reaches it, and Meshy would build it as a grey film. Cleared only when it is the
        # background colour within a TIGHT tol and not a speck, so grey stone keeps its shadows (looked at 10 Oct).
        near = np.sqrt(((arr.astype(np.float64) - bg) ** 2).sum(-1)) < a.holes
        lab, n = ndimage.label(near & ~back)
        if n:
            area = ndimage.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
            big = np.nonzero(area >= W * H * 0.0003)[0] + 1
            back |= np.isin(lab, big)
    fg = ~back
    # join near pieces of one object (wings, a handle) before counting objects
    grow = max(2, int(min(W, H) * 0.012))
    lab, n = ndimage.label(ndimage.binary_dilation(fg, iterations=grow))
    report, cells = [], {}
    cw, ch = W / cols, H / rows
    for i in range(1, n + 1):
        ys, xs = np.nonzero((lab == i) & fg)
        if len(xs) < (W * H) * 0.0008:            # specks
            continue
        cx, cy = xs.mean(), ys.mean()
        c = min(cols - 1, int(cx // cw)) + cols * min(rows - 1, int(cy // ch))
        cells.setdefault(c, []).append((xs.min(), ys.min(), xs.max(), ys.max(), len(xs), i))
    contact = Image.new('RGB', (cols * 260, rows * 290), (40, 40, 44))
    d = ImageDraw.Draw(contact)
    for c, kind in enumerate(kinds):
        r, k = divmod(c, cols)
        if kind == '-':
            continue
        pieces = cells.get(c, [])
        if not pieces:
            report.append({'kind': kind, 'ok': False, 'why': 'nothing found in its cell'}); continue
        x0 = min(q[0] for q in pieces); y0 = min(q[1] for q in pieces)
        x1 = max(q[2] for q in pieces); y1 = max(q[3] for q in pieces)
        cx0, cy0, cx1, cy1 = (c % cols) * cw, (c // cols) * ch, (c % cols + 1) * cw, (c // cols + 1) * ch
        crosses = x0 < cx0 - 2 or y0 < cy0 - 2 or x1 > cx1 + 2 or y1 > cy1 + 2
        m = int(max(x1 - x0, y1 - y0) * 0.06) + 4
        bx0, by0, bx1, by1 = max(0, x0 - m), max(0, y0 - m), min(W, x1 + m + 1), min(H, y1 + m + 1)
        crop = arr[by0:by1, bx0:bx1]
        own = np.zeros((H, W), bool)
        for q in pieces:
            own |= (lab == q[5])
        alpha = (fg & own)[by0:by1, bx0:bx1].astype(np.uint8) * 255
        A = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8))
        obj = Image.fromarray(crop).convert('RGBA'); obj.putalpha(A)
        side = max(obj.size)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(obj, ((side - obj.size[0]) // 2, (side - obj.size[1]) // 2), obj)
        if side > a.max:
            sq = sq.resize((a.max, a.max), Image.LANCZOS)
        dst = os.path.join(a.out, kind + '.png')
        sq.save(dst)
        report.append({'kind': kind, 'ok': not crosses, 'why': 'crosses into a neighbouring cell' if crosses else '',
                       'px': sq.size[0], 'pieces': len(pieces), 'cover': round(float(alpha.mean() / 255), 3)})
        thumb = Image.new('RGB', (240, 240), (200, 200, 205))
        t = sq.copy(); t.thumbnail((240, 240))
        thumb.paste(t, ((240 - t.size[0]) // 2, (240 - t.size[1]) // 2), t)
        contact.paste(thumb, (k * 260 + 10, r * 290 + 40))
        d.text((k * 260 + 10, r * 290 + 12), '%s %dpx%s' % (kind, sq.size[0], '  CROSSES' if crosses else ''), fill=(240, 230, 210))
    cpath = os.path.join(a.out, '_contact-%s.png' % os.path.splitext(os.path.basename(a.sheet))[0])
    contact.save(cpath)
    for r in report:
        print('%-14s %s %s' % (r['kind'], 'ok ' if r['ok'] else 'NO ', r.get('why') or ('%dpx, %d piece(s)' % (r['px'], r['pieces']))))
    print('background %s, %d object(s) found; contact sheet %s' % ([int(v) for v in bg], sum(len(v) for v in cells.values()), os.path.relpath(cpath, os.getcwd())))
    if any(not r['ok'] for r in report):
        sys.exit(1)


main()
