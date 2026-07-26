#!/usr/bin/env python3
"""Measure a painted frame's border thickness so border-image slices are DATA.

Stephen's UI art is ornate frames with a dark interior. A CSS border-image needs
to know how thick the painted rim is, in percent, on each side. Eyeballing that
is how the Petal Match buttons ended up with a 33% left slice and no middle left
to stretch.

This walks in from each edge along the frame's centre line until it reaches the
large dark interior region, and reports the slice percentages plus a ready-made
border-image rule.

  python3 scripts/measure_9slice.py assets/games/petalmatch/hud-bar.png

⛔ Asymmetric art (a medallion on one end only, like pill-button) will show a
huge slice on that side. That is the tool telling you the truth: such art is not
9-sliceable, pick a symmetric frame or place the medallion as its own element.
"""
import sys
from PIL import Image


def lum(p):
    return (p[0] * 0.299 + p[1] * 0.587 + p[2] * 0.114) if p[3] > 60 else -1.0


def runs_dark(vals, thresh=78, minlen=12):
    """Longest contiguous run of dark-and-opaque samples."""
    best = None
    start = None
    for i, v in enumerate(vals):
        dark = 0 <= v < thresh
        if dark and start is None:
            start = i
        if (not dark) and start is not None:
            if i - start >= minlen and (best is None or i - start > best[1] - best[0]):
                best = (start, i - 1)
            start = None
    if start is not None and len(vals) - start >= minlen:
        if best is None or len(vals) - start > best[1] - best[0]:
            best = (start, len(vals) - 1)
    return best


def hollow(im):
    """Frames with a TRANSPARENT hole (board surrounds) instead of a dark panel.

    board-frame.png is one of these — it is a surround the board shows through,
    so there is no dark interior to find. Walk in from the alpha bounding box
    (not the raw edge: these files carry a 3px transparent margin) until the
    paint stops.
    """
    a = im.split()[3]
    bb = a.getbbox()
    if not bb:
        return None
    x0, y0, x1, y1 = bb
    ap = a.load()
    midy = (y0 + y1) // 2
    midx = (x0 + x1) // 2
    L = 0
    while x0 + L < x1 and ap[x0 + L, midy] > 60:
        L += 1
    R = 0
    while x1 - 1 - R > x0 and ap[x1 - 1 - R, midy] > 60:
        R += 1
    T = 0
    while y0 + T < y1 and ap[midx, y0 + T] > 60:
        T += 1
    B = 0
    while y1 - 1 - B > y0 and ap[midx, y1 - 1 - B] > 60:
        B += 1
    # a real hollow frame has paint on all four sides and a gap in the middle
    if min(L, R, T, B) < 3:
        return None
    return L, R, T, B


def measure(path):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()

    row = [lum(px[x, h // 2]) for x in range(w)]
    col = [lum(px[w // 2, y]) for y in range(h)]
    hr = runs_dark(row)
    vr = runs_dark(col)
    if not hr or not vr:
        ho = hollow(im)
        if ho:
            L, R, T, B = ho
            lp, rp = 100 * L / w, 100 * R / w
            tp, bp = 100 * T / h, 100 * B / h
            print(f'{path}   [HOLLOW frame — transparent interior]')
            print(f'  size {w}x{h}   frame px  left {L}  right {R}  top {T}  bottom {B}')
            print(f'  slice  %  left {lp:.1f}  right {rp:.1f}  top {tp:.1f}  bottom {bp:.1f}')
            v = round((tp + bp) / 2, 1)
            hp = round((lp + rp) / 2, 1)
            print(f"  border-image: url('{path.split('/')[-1]}') {v}% {hp}% fill round;")
            print(f'  ⛔ set border-width near {int(round((L + R + T + B) / 4))}px or the ornament is squashed')
            print()
            return
        print(f'{path}: could not find an interior — is this a frame?')
        return

    left, right = hr[0], w - 1 - hr[1]
    top, bottom = vr[0], h - 1 - vr[1]
    lp, rp = 100 * left / w, 100 * right / w
    tp, bp = 100 * top / h, 100 * bottom / h

    print(f'{path}')
    print(f'  size {w}x{h}   interior x {hr[0]}..{hr[1]}   y {vr[0]}..{vr[1]}')
    print(f'  frame px  left {left}  right {right}  top {top}  bottom {bottom}')
    print(f'  slice  %  left {lp:.1f}  right {rp:.1f}  top {tp:.1f}  bottom {bp:.1f}')
    if abs(lp - rp) > 6:
        print('  ⚠ ASYMMETRIC left/right — probably not 9-sliceable, see the docstring')
    v = round((tp + bp) / 2, 1)
    hpct = round((lp + rp) / 2, 1)
    print(f"  border-image: url('{path.split('/')[-1]}') {v}% {hpct}% fill round;")
    print()


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    for p in sys.argv[1:]:
        measure(p)
