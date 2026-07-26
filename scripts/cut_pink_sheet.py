#!/usr/bin/env python3
"""Cutter for sheets whose ART is close in colour to the BACKGROUND.

    python3 scripts/cut_pink_sheet.py sheets/pinks.png --rowwise 2 \
        --qa --dry --contact /tmp/pinks.png

WHY THIS EXISTS
  Stephen, 2026-07-26: "we should make a tool for cutting assets out that are
  pink and purple, then we'll group those assets onto their own sheets."

  The normal cutter decides what is background by COLOUR DISTANCE: anything close
  to the measured background colour becomes transparent. That is fine when the
  art is green leaves on magenta. It is dangerous when the art is a hot pink
  petal on hot magenta, because the petal is genuinely close to the background
  and the only thing separating them is a thin darker outline.

THE DIFFERENT IDEA
  Background is not defined by its colour. It is defined by being CONNECTED TO
  THE EDGE OF THE SHEET. A petal in the middle of a frame is not connected to
  the border, no matter how pink it is.

  So: seed a flood fill from the sheet border and let it spread only through
  pixels that are close to the background colour. Whatever the flood cannot
  reach is art — including art painted the exact same pink as the background.

  A colour-distance key deletes by hue. A flood fill deletes by reachability.
  For pink-on-magenta, reachability is the honest question.

  Tolerance is deliberately TIGHT for the flood (it only has to walk through
  真 background) and the soft edge is recovered afterwards in a narrow band, so
  antialiasing survives without the fill leaking into the art.

ALSO WORTH DOING
  If you are grouping pink and purple assets onto their own sheets anyway,
  generate those sheets on a GREEN or DARK background instead of magenta. Pink
  art on a green field is trivially separable and needs none of this. This tool
  exists for the sheets that already exist, and as a safety net.
"""
import argparse, os, sys

RIG = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   '..', 'satellites', 'stream-hop', 'scripts')
sys.path.insert(0, os.path.abspath(RIG))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cut_sheet as rig
import cut_art_sheet as gen          # reuse safe_key, qa_frames, print_qa
import numpy as np
from PIL import Image
from scipy import ndimage


def flood_alpha(rgb, key, tight=26, loose=72, verbose=True):
    """Alpha from REACHABILITY, not from hue.

    tight  how close to the background a pixel must be for the flood to walk
           through it. Small on purpose: the fill only needs to cross real
           background.
    loose  how close a pixel must be before we will even consider softening it
           at the art's edge. Between tight and loose we ramp, so antialiased
           edges stay smooth instead of being cut to a hard line.
    """
    a = rgb.astype(np.int16)
    dist = np.abs(a - key).max(axis=2)

    walkable = dist <= tight
    # Seed from a 1px frame around the whole sheet.
    seed = np.zeros_like(walkable)
    seed[0, :] = seed[-1, :] = True
    seed[:, 0] = seed[:, -1] = True
    seed &= walkable

    labels, _ = ndimage.label(walkable)
    touching = set(np.unique(labels[seed]))
    touching.discard(0)
    background = np.isin(labels, list(touching)) if touching else np.zeros_like(walkable)

    # Close pinholes: single stray pixels inside a petal that happen to match the
    # background should NOT punch a hole through the art.
    background = ndimage.binary_closing(background, np.ones((3, 3)))
    background = ndimage.binary_opening(background, np.ones((2, 2)))

    alpha = (~background).astype(np.float32)

    # Soften only the boundary: pixels adjacent to background whose colour is
    # still near the key are part of the antialiased edge.
    edge = ndimage.binary_dilation(background, np.ones((3, 3))) & ~background
    ramp = np.clip((dist - tight) / float(max(1, loose - tight)), 0, 1)
    alpha[edge] = np.minimum(alpha[edge], ramp[edge])

    if verbose:
        removed = float(background.mean())
        print('    flood removed %.0f%% of the sheet as background '
              '(tight=%d, loose=%d)' % (removed * 100, tight, loose))
        if removed < 0.15:
            print('    ⚠ that is very little. If sprites look boxed in, the art may be')
            print('      touching the border, or the background is not uniform.')
        if removed > 0.93:
            print('    ⚠ that is nearly everything. Check the contact sheet: the flood may')
            print('      have leaked through a gap into the art. Try a smaller --tight.')
    return alpha, background


def cut(path, rows=None, cols=None, sheet_rows=None, pad=3, tight=26, loose=72, verbose=True):
    im = Image.open(path).convert('RGB')
    rgb = np.array(im)
    key = gen.safe_key(rgb, verbose=verbose)
    alpha, background = flood_alpha(rgb, key, tight, loose, verbose)

    solid = ndimage.binary_opening(alpha > 0.5, np.ones((3, 3)))
    rgba = np.dstack([rig.despill(rgb, alpha), (alpha * 255).astype(np.uint8)])

    ycuts, (y0, y1), _ = rig.gutters(solid.sum(axis=1), (sheet_rows or 1) - 1)
    ys = [y0] + list(ycuts) + [y1]

    frames, layout = [], []
    for ri in range(len(ys) - 1):
        band = solid[ys[ri]:ys[ri + 1]]
        prof = band.sum(axis=0)
        on = prof > 0
        runs, prev = 0, False
        for v in on:
            if v and not prev:
                runs += 1
            prev = v
        runs = max(1, runs)
        try:
            xcuts, (x0, x1), _ = rig.gutters(prof, runs - 1)
        except Exception:
            idx = np.where(on)[0]
            xcuts, x0, x1 = [], int(idx[0]), int(idx[-1])
        xs = [x0] + list(xcuts) + [x1]
        layout.append(len(xs) - 1)
        for ci in range(len(xs) - 1):
            sub = rgba[ys[ri]:ys[ri + 1], xs[ci]:xs[ci + 1]]
            m = sub[:, :, 3] > 8
            if not m.any():
                continue
            rr = np.where(m.any(axis=1))[0]
            cc = np.where(m.any(axis=0))[0]
            t, b = max(0, rr[0] - pad), min(sub.shape[0], rr[-1] + 1 + pad)
            l, r = max(0, cc[0] - pad), min(sub.shape[1], cc[-1] + 1 + pad)
            frames.append(Image.fromarray(sub[t:b, l:r], 'RGBA'))
    if verbose:
        print('    row layout: %s  (%d frames)' % (' + '.join(map(str, layout)), len(frames)))
    return frames


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheets', nargs='+')
    ap.add_argument('--rowwise', type=int, default=1, metavar='ROWS')
    ap.add_argument('--names')
    ap.add_argument('--prefix', default='frame')
    ap.add_argument('--out')
    ap.add_argument('--contact')
    ap.add_argument('--tight', type=int, default=26)
    ap.add_argument('--loose', type=int, default=72)
    ap.add_argument('--qa', action='store_true')
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()

    names_in = [n.strip() for n in a.names.split(',')] if a.names else None
    all_frames, all_names, redo_all = [], [], []

    for sheet in a.sheets:
        print(os.path.basename(sheet))
        frames = cut(sheet, sheet_rows=a.rowwise, tight=a.tight, loose=a.loose)
        these = []
        for i, f in enumerate(frames):
            idx = len(all_frames) + i
            n = names_in[idx] if names_in and idx < len(names_in) else '%s-%02d' % (a.prefix, idx + 1)
            these.append(n)
            print('    %-18s %4dx%-4d' % (n, f.width, f.height))
        all_names += these
        if a.qa:
            rows, redo = gen.qa_frames(frames, these, os.path.basename(sheet))
            gen.print_qa(rows, redo, os.path.basename(sheet))
            redo_all += redo
        all_frames += frames

    if a.qa and redo_all:
        print('\nREDO LIST — %d frame(s)' % len(redo_all))
        for sheet, n, flags in redo_all:
            print('  %-20s %-18s %s' % (sheet, n, ', '.join(flags)))

    if a.contact:
        print('  contact →', rig.contact(all_frames, all_names, a.contact))
    if a.dry or not a.out:
        print('  (dry run, nothing written)')
        return
    os.makedirs(a.out, exist_ok=True)
    for f, n in zip(all_frames, all_names):
        f.save(os.path.join(a.out, n + '.png'))
    print('  wrote %d files → %s' % (len(all_frames), a.out))


if __name__ == '__main__':
    main()
