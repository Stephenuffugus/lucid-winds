#!/usr/bin/env python3
"""Generic art-sheet cutter. Any grid, any names, any game.

    # look first, write nothing
    python3 scripts/cut_art_sheet.py sheets/pieces.png --cols 4 --rows 2 \
        --contact /tmp/pieces.png --dry

    # then write, with real names
    python3 scripts/cut_art_sheet.py sheets/pieces.png --cols 4 --rows 2 \
        --names base-1,base-2,base-3,base-4,base-5,base-6,base-7,base-8 \
        --out assets/games/petalmatch --contact /tmp/pieces.png

    # don't know the layout? let it find the gutters
    python3 scripts/cut_art_sheet.py sheets/whatever.png --auto --contact /tmp/x.png --dry

WHY THIS EXISTS
  Stephen is making 23 sheets for Petal Match. The proven cutter at
  satellites/stream-hop/scripts/cut_sheet.py is hard-wired to Jimothy: a 3x3
  grid and 18 fixed pose names. This is the same engine with the grid and the
  names made arguments.

⛔ IT IMPORTS THE JIMOTHY RIG RATHER THAN COPYING IT. Every rule in that file
  was learned by shipping the mistake once. Duplicating the logic here means the
  next fix lands in one file and not the other, and the wrong one gets used.

THE RULES IT INHERITS, all of which still apply:
  1. NEVER cut on an even grid. Frames are painted by hand and never land on
     exact thirds. It finds the real gutters (columns that are entirely
     background) and splits at their midpoints, so a detached spark or petal
     stays with the frame it belongs to.
  2. NEVER key on "looks like magenta". It MEASURES the sheet's own background
     colour and keys on distance to it, with a soft ramp so edges stay smooth
     instead of eroded. A hard key ate 27,669 painted pixels from one sheet.
  3. LOOK AT EVERY SPRITE. --contact writes a montage on a checkerboard. Open
     it. Sheets that cut "fine" have still shipped a clipped hat.
  4. Sheets get swapped and mislabelled. Check the contact sheet against your
     names BEFORE writing anything. --dry exists for exactly this.
"""
import argparse, os, sys

RIG = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   '..', 'satellites', 'stream-hop', 'scripts')
sys.path.insert(0, os.path.abspath(RIG))

try:
    import cut_sheet as rig            # the proven engine
except Exception as e:                 # pragma: no cover
    sys.exit('cannot import the Jimothy cutting rig at %s\n  %s' % (RIG, e))

import numpy as np
from PIL import Image
from scipy import ndimage


def safe_key(rgb, verbose=True):
    """Background colour, chosen by BORDER CONTACT rather than by hue.

    ⛔ WHY THIS OVERRIDES THE RIG'S find_key FOR THESE SHEETS.
    Stephen, 2026-07-26: "sheets 7, 8, 9 and some others seem to have purples and
    pinks in them so we need to be really careful."

    The Jimothy rig's find_key looks for the "magenta family" (r>150, b>150,
    g<90) and, if it finds 1000+ such pixels, assumes THOSE are the background.
    That is correct for Jimothy, whose sheets are painted on magenta. It is
    DANGEROUS for a sheet whose background is something else and whose ART is
    pink or purple: the painted pink satisfies the same test, the rig keys on the
    art, and the art is what gets deleted.

    Background has one property art does not: it touches the edge of the sheet
    and keeps going. So we take the modal colour of a border band, then check it
    actually covers a plausible share of the sheet. If the two methods disagree,
    we say so loudly rather than silently picking one.
    """
    a = rgb.astype(np.int16)
    h, w = a.shape[:2]
    band = max(2, min(h, w) // 100)
    edge = np.concatenate([
        a[:band].reshape(-1, 3), a[-band:].reshape(-1, 3),
        a[:, :band].reshape(-1, 3), a[:, -band:].reshape(-1, 3)])
    q = (edge // 8 * 8)
    vals, counts = np.unique(q, axis=0, return_counts=True)
    mode = vals[counts.argmax()]
    near = (np.abs(a - mode).max(axis=2) < 24)
    key = a[near].reshape(-1, 3).mean(axis=0)
    cover = float(near.mean())

    if verbose:
        print('    background key measured from the border: rgb(%d,%d,%d), %.0f%% of the sheet'
              % (key[0], key[1], key[2], cover * 100))
        r_, g_, b_ = key
        if not (r_ > 150 and b_ > 150 and g_ < 90):
            print('    ⚠ THE MEASURED BACKGROUND IS NOT MAGENTA. Every Petal Match sheet is')
            print('      painted on magenta, so this is probably FULL-BLEED ART with no')
            print('      background to remove. Keying it will delete whatever part of the')
            print('      painting sits near this colour. Check before writing.')
        if cover < 0.20:
            print('    ⚠ that colour covers less than 20%% of the sheet. Either the sheet is very'
                  ' densely painted, or the border is not background. CHECK THE CONTACT SHEET.')
        # Would the hue-based method have disagreed? That is the pink-art trap.
        try:
            hue_key = rig.find_key(rgb)
            if np.abs(np.array(hue_key) - key).max() > 40:
                print('    ⚠ THE HUE-BASED KEY DISAGREES: rgb(%d,%d,%d) vs border rgb(%d,%d,%d).'
                      % (hue_key[0], hue_key[1], hue_key[2], key[0], key[1], key[2]))
                print('      That is the pink/purple-art trap. Using the BORDER key, which is'
                      ' the safe one. Look hard at the contact sheet before writing.')
        except Exception:
            pass
    return key


def cut_rowwise(path, rows, pad=3, t0=30, t1=62, verbose=True):
    """Split into ROWS first, then find each row's columns INDEPENDENTLY.

    ⛔ WHY THIS EXISTS. A whole-sheet grid computes column gutters across every
    row at once, so a gap in row 2 forces a cut straight through a wide element
    in row 1. That is exactly what happened on Petal Match sheet 13: the wide HUD
    bar spans two columns, and the shared gutter sliced it in half, then every
    name after it shifted by one.

    Real sheets are not grids. They are rows of things, and each row has its own
    spacing. This measures each row on its own terms, so a row holding one wide
    banner and three round badges cuts correctly without being told anything.
    """
    im = Image.open(path).convert('RGB')
    rgb = np.array(im)
    key = safe_key(rgb, verbose=verbose)
    alpha, wr, wc = rig.background(rgb, key, t0, t1)
    solid = ndimage.binary_opening(alpha > 0.5, np.ones((3, 3)))

    ycuts, (y0, y1), ybridge = rig.gutters(solid.sum(axis=1), rows - 1)
    if ybridge and verbose:
        print('  ⚠ %d row gutter(s) bridged by paint' % len(ybridge))
    ys = [y0] + list(ycuts) + [y1]

    rgba = np.dstack([rig.despill(rgb, alpha), (alpha * 255).astype(np.uint8)])
    frames, layout = [], []
    for ri in range(len(ys) - 1):
        band = solid[ys[ri]:ys[ri + 1]]
        prof = band.sum(axis=0)
        # how many things are in THIS row? count runs of content in its own profile
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
            xcuts, x0, x1 = [], int(np.argmax(on)), int(len(on) - np.argmax(on[::-1]))
        xs = [x0] + list(xcuts) + [x1]
        layout.append(len(xs) - 1)
        for ci in range(len(xs) - 1):
            sub = rgba[ys[ri]:ys[ri + 1], xs[ci]:xs[ci + 1]]
            a = sub[:, :, 3] > 8
            if not a.any():
                continue
            rr = np.where(a.any(axis=1))[0]
            cc = np.where(a.any(axis=0))[0]
            t, b = max(0, rr[0] - pad), min(sub.shape[0], rr[-1] + 1 + pad)
            l, r = max(0, cc[0] - pad), min(sub.shape[1], cc[-1] + 1 + pad)
            frames.append(Image.fromarray(sub[t:b, l:r], 'RGBA'))
    if verbose:
        print('    row layout: %s  (%d frames)' % (' + '.join(str(n) for n in layout), len(frames)))
    return frames, [0] * len(frames)


def cut_grid(path, cols, rows, pad=3, t0=30, t1=62, auto=False):
    """Same pipeline as the rig's cut(), with the grid made a parameter."""
    im = Image.open(path).convert('RGB')
    rgb = np.array(im)
    key = safe_key(rgb)
    alpha, wr, wc = rig.background(rgb, key, t0, t1)
    solid = alpha > 0.5
    solid_open = ndimage.binary_opening(solid, np.ones((3, 3)))

    xprof, yprof = solid_open.sum(axis=0), solid_open.sum(axis=1)
    if auto:
        # Try plausible layouts and keep the one whose gutters are cleanest.
        best = None
        for c in range(1, 9):
            for r in range(1, 9):
                if c * r < 2:
                    continue
                try:
                    xc, _, xb = rig.gutters(xprof, c - 1)
                    yc, _, yb = rig.gutters(yprof, r - 1)
                except Exception:
                    continue
                score = (len(xb) if xb else 0) + (len(yb) if yb else 0)
                if len(xc) == c - 1 and len(yc) == r - 1:
                    if best is None or score < best[0]:
                        best = (score, c, r)
        if best:
            cols, rows = best[1], best[2]
            print('  auto-detected layout: %d cols x %d rows' % (cols, rows))
        else:
            print('  ⚠ auto-detect failed, falling back to %dx%d' % (cols, rows))

    xcuts, (x0, x1), xbridge = rig.gutters(xprof, cols - 1)
    ycuts, (y0, y1), ybridge = rig.gutters(yprof, rows - 1)
    if xbridge:
        print('  ⚠ %d column gutter(s) bridged by paint — check the contact sheet' % len(xbridge))
    if ybridge:
        print('  ⚠ %d row gutter(s) bridged by paint — check the contact sheet' % len(ybridge))

    xs = [x0] + list(xcuts) + [x1]
    ys = [y0] + list(ycuts) + [y1]

    rgba = np.dstack([rig.despill(rgb, alpha), (alpha * 255).astype(np.uint8)])
    frames, dropped = [], []
    for ri in range(len(ys) - 1):
        for ci in range(len(xs) - 1):
            sub = rgba[ys[ri]:ys[ri + 1], xs[ci]:xs[ci + 1]]
            a = sub[:, :, 3] > 8
            if not a.any():
                frames.append(Image.new('RGBA', (8, 8), (0, 0, 0, 0)))
                dropped.append(0)
                continue
            rr = np.where(a.any(axis=1))[0]
            cc = np.where(a.any(axis=0))[0]
            t, b = max(0, rr[0] - pad), min(sub.shape[0], rr[-1] + 1 + pad)
            l, r = max(0, cc[0] - pad), min(sub.shape[1], cc[-1] + 1 + pad)
            frames.append(Image.fromarray(sub[t:b, l:r], 'RGBA'))
            dropped.append(0)
    return frames, dropped



def qa_frames(frames, names, sheet_label):
    """Per-frame quality check. Produces the REDO LIST.

    Stephen 2026-07-26: "if a sprite or two need redone when we're done with it
    all that's fine, I'll have you make a list and I'll whip up the assets."

    So this is that list, generated rather than eyeballed. 23 sheets is far too
    many to catch a clipped ear by looking, and a clipped ear is exactly the kind
    of thing that ships and is noticed three weeks later.

    Each check exists because it catches a REAL failure mode of this pipeline:
      CLIPPED  opaque pixels run right up to the frame edge, which means the
               gutter split cut through the art rather than between it. The most
               important check by far.
      SPARSE   almost nothing in the frame. Usually a stray speck that got kept
               as its own sprite because a gutter was found in the wrong place.
      TINY     far smaller than its siblings on the same sheet. Same cause.
      HALO     a large share of barely-transparent pixels around the edge, which
               means the key was slightly off and left a coloured fringe.
      EMPTY    nothing at all.
    """
    import numpy as _np
    rows, redo = [], []
    areas = [f.width * f.height for f in frames if f.width > 8]
    med = sorted(areas)[len(areas) // 2] if areas else 0

    for f, n in zip(frames, names):
        a = _np.array(f)[:, :, 3]
        opaque = a > 200
        total = int(opaque.sum())
        flags = []

        if total < 50:
            flags.append('EMPTY')
        else:
            if total < 900:
                flags.append('SPARSE(%d px)' % total)
            if med and f.width * f.height < med * 0.18:
                flags.append('TINY(%d%% of median)' % round(100.0 * f.width * f.height / med))
            # CLIPPING. Measured per edge as a SHARE of that edge, not as a raw
            # count. A clean sprite whose bounding box happens to sit against the
            # sheet's own outer boundary still shows some opaque pixels on one
            # side; a genuinely cut-through sprite shows a long continuous run.
            # Tested on a trap sheet: a clean bloom reads 21% of one edge, a
            # deliberately clipped one reads 72%. 35% separates them with room to
            # spare, and crying wolf across 23 sheets would make the whole report
            # ignorable.
            # ⚠ CLIPPED IS ADVISORY, NOT A VERDICT. It means "put your eyes on
            # this frame", not "remake this sprite". Tiles, panels and frames are
            # rectangular by design and legitimately carry paint on an edge, and
            # the 3px pad makes the exact reading jitter. The contact sheet is
            # the arbiter; this just says where to look first.
            h_, w_ = opaque.shape
            e = [opaque[0].sum() / float(w_), opaque[-1].sum() / float(w_),
                 opaque[:, 0].sum() / float(h_), opaque[:, -1].sum() / float(h_)]
            share = max(e)
            # ⛔ A SQUARE SPRITE IS NOT A CLIPPED SPRITE. Board tiles, panels and
            # frames are rectangular BY DESIGN, so paint runs along every edge.
            # Flagging those buried the real clips in noise on the panel sheets.
            # A genuine clip cuts through ONE side (occasionally two, at a
            # corner); a deliberate rectangle is heavy on three or four.
            rectangular = sum(1 for x in e if x > 0.70) >= 3
            if share > 0.35 and not rectangular:
                flags.append('look: %d%% of one edge is paint' % round(share * 100))
            faint = int(((a > 8) & (a < 90)).sum())
            if total and faint > total * 0.45:
                flags.append('HALO(%d faint px)' % faint)

        rows.append((n, f.width, f.height, total, flags))
        if flags:
            redo.append((sheet_label, n, flags))
    return rows, redo


def print_qa(rows, redo, sheet_label):
    print('    QA')
    for n, w, h, px, flags in rows:
        mark = '  ⛔ ' + ', '.join(flags) if flags else '  ok'
        print('      %-16s %4dx%-4d %7d px%s' % (n, w, h, px, mark))
    if redo:
        print('    ⛔ %d frame(s) on this sheet want a look or a redo' % len(redo))
    else:
        print('    ✓ all frames clean')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheets', nargs='+')
    ap.add_argument('--cols', type=int, default=3)
    ap.add_argument('--rows', type=int, default=3)
    ap.add_argument('--auto', action='store_true', help='detect the grid from the gutters')
    ap.add_argument('--rowwise', type=int, metavar='ROWS',
                    help='split into ROWS, then find each row\'s columns independently')
    ap.add_argument('--names', help='comma separated, in reading order')
    ap.add_argument('--prefix', default='frame', help='used when --names is not given')
    ap.add_argument('--out')
    ap.add_argument('--contact')
    ap.add_argument('--t0', type=int, default=30)
    ap.add_argument('--t1', type=int, default=62)
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--qa', action='store_true', help='per-frame quality check + redo list')
    a = ap.parse_args()

    names_in = [n.strip() for n in a.names.split(',')] if a.names else None
    all_frames, all_names = [], []

    redo_all = []
    for sheet in a.sheets:
        print(os.path.basename(sheet))
        if a.rowwise:
            frames, _ = cut_rowwise(sheet, a.rowwise, t0=a.t0, t1=a.t1)
        else:
            frames, _ = cut_grid(sheet, a.cols, a.rows, t0=a.t0, t1=a.t1, auto=a.auto)
        for i, f in enumerate(frames):
            idx = len(all_frames) + i
            n = names_in[idx] if names_in and idx < len(names_in) else '%s-%02d' % (a.prefix, idx + 1)
            print('    %-16s %4dx%-4d' % (n, f.width, f.height))
            all_names.append(n)
        if a.qa:
            these = all_names[len(all_frames):]
            rows, redo = qa_frames(frames, these, os.path.basename(sheet))
            print_qa(rows, redo, os.path.basename(sheet))
            redo_all += redo
        all_frames += frames

    if names_in and len(names_in) != len(all_frames):
        print('  ⚠ %d names given but %d frames cut. Check the contact sheet before writing.'
              % (len(names_in), len(all_frames)))

    if a.qa and redo_all:
        print('\n' + '=' * 62)
        print('REDO LIST — %d frame(s) across %d sheet(s)' % (len(redo_all), len(a.sheets)))
        print('=' * 62)
        for sheet, n, flags in redo_all:
            print('  %-22s %-16s %s' % (sheet, n, ', '.join(flags)))
        print('\n"look:" is ADVISORY — squares and frames trip it legitimately. Check the')
        print('contact sheet. EMPTY/SPARSE/TINY/HALO are the ones that usually need a redo.')

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
