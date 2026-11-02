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
    p.add_argument('--shadow', type=float, default=0.0, help='also clear a soft cast shadow touching the background, down to this far below the sheet\'s brightness (0 = off; 50 suits Astra\'s pictures)')
    p.add_argument('--shadow-chroma', type=float, default=14.0, help='how colourless a shadow pixel is (max minus min of r, g, b); a glowing thing tints its shadow (the star fragment: 30)')
    p.add_argument('--shadow-low', type=float, default=0.7, help='a shadow piece is cleared only when its centre sits this far down its object or lower')
    p.add_argument('--ramp', type=float, default=0.0, help='also clear a smooth glow halo: grow the background into neighbours closer than this (0 = off; 6 suits Astra\'s Dream Meadow)')
    p.add_argument('--ramp-max', type=float, default=100.0, help='the glow halo never reaches further than this from the sheet\'s colour')
    p.add_argument('--specks', type=int, default=0, help='also clear object pieces smaller than this many pixels (0 = off)')
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
    if a.ramp:
        # a GLOW halo (Dream Meadow's lit orb and moon spill light into the sheet): a smooth ramp from the sheet's
        # grey up to a colour as far from it as the thing's own (the reed's halo ends 87 from the grey, its blue
        # stem sits at 77), so no tolerance can split them. The ramp is SMOOTH and the thing's edge is a STEP: the
        # background grows into each neighbour whose colour differs from it by less than a.ramp, and never past
        # a.ramp_max from the sheet's colour (1 Nov 2026).
        f = arr.astype(np.float64)
        far = np.sqrt(((f - bg) ** 2).sum(-1)) <= a.ramp_max
        def step(p, q):
            return np.sqrt(((p - q) ** 2).sum(-1)) < a.ramp
        dn, rt = step(f[1:], f[:-1]), step(f[:, 1:], f[:, :-1])
        while True:
            g = back.copy()
            g[1:] |= back[:-1] & dn
            g[:-1] |= back[1:] & dn
            g[:, 1:] |= back[:, :-1] & rt
            g[:, :-1] |= back[:, 1:] & rt
            g &= far
            g |= back
            if (g == back).all():
                break
            back = g
    if a.shadow:
        # a soft cast shadow under the object (Astra's w5 to w7 pictures keep some: crab, bottle, shell, driftwood):
        # darker than the sheet, as colourless as the sheet, and TOUCHING the background. The edge flood stops at its
        # dark core, so it stays and Meshy builds it as a base plate. Cleared: neutral pixels from a.shadow below the
        # sheet's brightness to just above it, in pieces that touch the background AND sit in the LOW part of their
        # object (a.shadow_low of its height and down: the gull's dark grey wing tips, half way up, ate away without
        # that). A grey or iron THING is just as colourless, so this is opt in per picture and every cut is looked at
        # (1 Nov 2026).
        f = arr.astype(np.float64)
        chroma = f.max(-1) - f.min(-1)
        lum = f.mean(-1)
        bgl = float(np.mean(bg))
        like = (chroma <= a.shadow_chroma) & (lum >= bgl - a.shadow) & (lum <= bgl + 4) & ~back
        lab, n = ndimage.label(like)
        if n:
            touch = np.unique(lab[ndimage.binary_dilation(back) & like])
            touch = touch[touch > 0]
            fg0 = ~back
            olab, _ = ndimage.label(ndimage.binary_dilation(fg0, iterations=max(2, int(min(W, H) * 0.012))))
            olab = np.where(fg0, olab, 0)
            oboxes = ndimage.find_objects(olab)
            sl = ndimage.find_objects(lab)
            drop = []
            for i in touch:
                s = sl[i - 1]
                m = lab[s] == i
                os_ = olab[s][m]
                os_ = os_[os_ > 0]
                if not len(os_):
                    continue
                ob = oboxes[int(np.bincount(os_).argmax()) - 1]
                y0, y1 = ob[0].start, ob[0].stop
                cy = s[0].start + np.nonzero(m)[0].mean()
                if cy >= y0 + a.shadow_low * (y1 - y0):
                    drop.append(i)
            back |= np.isin(lab, drop)
    if a.specks:
        # specks of sheet texture left inside a cleared hole (the stall's open window at --holes 12): any piece of
        # object smaller than a.specks pixels, which the joining below would otherwise glue onto the object
        lab, n = ndimage.label(~back)
        if n:
            area = ndimage.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
            back |= np.isin(lab, np.nonzero(area < a.specks)[0] + 1)
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
