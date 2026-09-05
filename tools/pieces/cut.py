#!/usr/bin/env python3
"""tools/pieces/cut.py — turn rig masters into sprites a game should actually load.

    python3 tools/pieces/cut.py                 # every set
    python3 tools/pieces/cut.py --set dice      # one set
    python3 tools/pieces/cut.py --size 96       # different ship size

Why this exists
---------------
`rig.py` renders 512px masters, and the five-die set alone is 1.9MB. Shipping that is
the exact bug the Sep 04 audit found in Queen Bee: `games/pollen.js` loads 101 PNGs at
1024x1024, 1.5-2MB each, straight off disk, so a board showing a dozen cards pulls 20MB+
on a phone. The memory game shows the right pattern instead — it keeps its 1968px masters
beside 240px `-card.png` cuts and references ONLY the cuts.

So: masters stay in out/<set>/ and are never referenced by a game. Cuts go to
out/<set>/ship/ at the size a board actually draws them, and that is what gets wired.

A piece renders at ~48-96 CSS px on a 375px board, so 128px covers 2x displays with
room to spare. Quantized to a 256-colour palette with alpha, which suits flat-lit
studio renders and typically lands each sprite under 20KB.
"""
import os, sys, glob

try:
    from PIL import Image
except ImportError:
    sys.exit('needs Pillow:  pip install pillow')

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')


def edge_fade(a, margin):
    """Fade the alpha to zero over the outer `margin` pixels on every side.

    The rig's soft key throws a contact shadow that does not end inside the frame: the
    first disc cuts had alpha 40 in the bottom left CORNER (dice 55 to 66), so a sprite
    set down on a board showed a straight line where its shadow stopped at the tile
    edge. The piece itself sits well inside; only the shadow's tail is touched."""
    w, h = a.size
    px = a.load()
    m = max(1, margin)
    for y in range(h):
        fy = min(1.0, min(y, h - 1 - y) / m)
        for x in range(w):
            fx = min(1.0, min(x, w - 1 - x) / m)
            f = min(fx, fy)
            if f < 1.0:
                f = f * f * (3 - 2 * f)          # smoothstep, no visible ring
                # the fade is for the SHADOW, not the piece: a die fills its tile and its top
                # vertex sits inside the band, and the first fade made it translucent (alpha
                # 217 at the top). Weight the fade by how transparent the pixel already is:
                # opaque piece pixels keep their alpha, the shadow's tail goes to zero, and
                # the silhouette lands in between with no seam.
                v = px[x, y]
                # shadow never exceeds half alpha, the piece never drops under it, so
                # everything below 128 is fully faded and 128 to 255 eases in: a linear
                # weight let a border shadow pixel of alpha 80 keep a third of itself
                k = max(0.0, (v - 128) / 127.0)
                keep = k * k * (3 - 2 * k)
                px[x, y] = int(v * (keep + (1.0 - keep) * f))
    return a


def cut(src, dst, size):
    im = Image.open(src).convert('RGBA')
    im = im.resize((size, size), Image.LANCZOS)
    # quantize the colour while KEEPING alpha: split, quantize RGB, reattach.
    a = edge_fade(im.getchannel('A'), size // 5)
    rgb = im.convert('RGB').quantize(colors=255, method=Image.MEDIANCUT).convert('RGB')
    out = rgb.convert('RGBA')
    out.putalpha(a)
    out.save(dst, optimize=True)
    return os.path.getsize(dst)


def main():
    argv = sys.argv[1:]
    size = 128
    if '--size' in argv:
        size = int(argv[argv.index('--size') + 1])
    only = argv[argv.index('--set') + 1] if '--set' in argv else None

    sets = sorted(d for d in os.listdir(OUT) if os.path.isdir(os.path.join(OUT, d))) \
        if os.path.isdir(OUT) else []
    if only:
        sets = [s for s in sets if s == only] or sys.exit('no rendered set %r in %s' % (only, OUT))
    if not sets:
        sys.exit('nothing rendered yet. Run rig.py first.')

    grand_m = grand_s = 0
    for s in sets:
        srcs = sorted(glob.glob(os.path.join(OUT, s, '*.png')))
        if not srcs:
            continue
        ship = os.path.join(OUT, s, 'ship')
        os.makedirs(ship, exist_ok=True)
        mb = sb = 0
        for f in srcs:
            n = os.path.basename(f)
            mb += os.path.getsize(f)
            sb += cut(f, os.path.join(ship, n), size)
        grand_m += mb; grand_s += sb
        print('%-8s %2d pieces   masters %5dKB -> ship %4dKB  (%.0f%% smaller, %dpx)'
              % (s, len(srcs), mb // 1024, sb // 1024, 100 * (1 - sb / mb), size))
    if grand_m:
        print('\nTOTAL     masters %5dKB -> ship %4dKB  (%.0f%% smaller)'
              % (grand_m // 1024, grand_s // 1024, 100 * (1 - grand_s / grand_m)))
        print('⛔ Wire games to out/<set>/ship/ ONLY. The masters are not for shipping.')


main()
