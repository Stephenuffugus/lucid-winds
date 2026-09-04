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


def cut(src, dst, size):
    im = Image.open(src).convert('RGBA')
    im = im.resize((size, size), Image.LANCZOS)
    # quantize the colour while KEEPING alpha: split, quantize RGB, reattach.
    a = im.getchannel('A')
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
