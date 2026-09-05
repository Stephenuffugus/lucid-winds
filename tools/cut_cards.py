#!/usr/bin/env python3
"""tools/cut_cards.py — ship-size cuts of painted card masters, beside the masters.

    python3 tools/cut_cards.py assets/games/masterpollinator            # every *.png under it
    python3 tools/cut_cards.py <dir> --size 512 --quality 82 --suffix -card

Why. Queen Bee (games/pollen.js) loaded its card art straight out of
assets/games/masterpollinator/: 81 PNGs at 1024x1024, 1.2 to 2.0 MB each, 135 MB in all, for
cards drawn at 96x120 on the board and 220x300 in the inspect view. A board showing a dozen
cards pulled 20 MB+ on a phone (fleet audit, Sep 04 2026, JOB 6). The memory game already
shows the right pattern: masters kept beside 240px "-card" cuts, and the game references
only the cuts.

The masters here are opaque RGB, so the cut is a JPEG: 448 px covers the inspect card at
2x and the board card at 3x, at about 50 KB. Masters are never referenced by a game.
Re-run after any master changes; a cut newer than its master is skipped.
"""
import os, sys, glob

try:
    from PIL import Image
except ImportError:
    sys.exit('needs Pillow:  pip install pillow')


def main():
    argv = sys.argv[1:]
    if not argv or argv[0].startswith('--'):
        sys.exit(__doc__)
    root = argv[0]
    size = int(argv[argv.index('--size') + 1]) if '--size' in argv else 512
    quality = int(argv[argv.index('--quality') + 1]) if '--quality' in argv else 82
    suffix = argv[argv.index('--suffix') + 1] if '--suffix' in argv else '-card'
    masters = sorted(f for f in glob.glob(os.path.join(root, '**', '*.png'), recursive=True)
                     if not os.path.basename(f)[:-4].endswith(suffix))
    if not masters:
        sys.exit('no masters under %s' % root)
    mb = sb = 0; made = skipped = 0
    for f in masters:
        dst = f[:-4] + suffix + '.jpg'
        mb += os.path.getsize(f)
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(f):
            sb += os.path.getsize(dst); skipped += 1; continue
        im = Image.open(f)
        if im.mode in ('RGBA', 'LA', 'P'):
            # a painted card with real transparency would need PNG; these are opaque, but say so
            a = im.convert('RGBA').getchannel('A')
            if a.getextrema()[0] < 250:
                print('  %s has transparency, kept as PNG cut' % os.path.relpath(f, root))
                dst = f[:-4] + suffix + '.png'
                im.convert('RGBA').resize((size, size), Image.LANCZOS).save(dst, optimize=True)
                sb += os.path.getsize(dst); made += 1; continue
        im.convert('RGB').resize((size, size), Image.LANCZOS).save(dst, quality=quality, optimize=True, progressive=True)
        sb += os.path.getsize(dst); made += 1
    print('%d masters  %5.1f MB  ->  %d cuts (%d new, %d up to date)  %5.1f MB  at %dpx q%d'
          % (len(masters), mb / 1048576, made + skipped, made, skipped, sb / 1048576, size, quality))
    print('⛔ Games reference the %s cuts ONLY. The masters are not for shipping.' % suffix)


main()
