#!/usr/bin/env python3
"""Cut a Jimothy 3x3 costume sheet into named pose PNGs.

    python3 scripts/cut_sheet.py art-drop5/wizard1.png --dry
    python3 scripts/cut_sheet.py art-drop5/wizard1.png art-drop5/wizard2.png \
        --out assets/skins/wizard --contact /tmp/wizard.png

⛔ THE RULES THIS RIG EXISTS TO ENFORCE (learned the hard way, twice):
  1. NEVER cut on an even grid. The frames are painted by hand and never land on
     thirds. We find the real gutters (columns/rows that are entirely background)
     and split at their MIDPOINTS, so detached bits of a frame — a flying coin, a
     star, a thrown salmon, an eye stalk — stay with the frame they belong to.
  2. LOOK AT EVERY SPRITE. --contact writes a montage on a dark checkerboard.
     Open it. A sheet that cut "fine" has still shipped a clipped hat before.
  3. The background key is flat magenta, but sheets vary: some use white divider
     lines instead of gaps, some characters ARE pink, some domes are violet. Pick
     the mask with --mask and check the result rather than trusting the default.

Masks
  default  min(r,b)-g > 38 and |r-b| < 50      kills magenta, spares blue-violet domes
  nopink   default, plus warm pink (r>b and b>135)   for jelly/brown-grey animals
           whose edges keep pink residue (slug, coyote, crow, barista, skunk)
  conn     background = whatever is connected to the border   for art that is the
           SAME hot pink as the background. ⛔ keeps enclosed background pockets,
           so chunky characters only — thin legs (heron, otter) get a magenta bar.

Frame order (ART-BIBLE-ANIMATION.md section 3), sheet A then sheet B:
  idle sit eat crouch leap land run-r dash-run coffee
  magnet umbrella shield scared flee cheer ko dizzy splash
`run-l` is the optional nineteenth and is not on the sheets: it is copied from
`leap` as a stand-in unless a real left sprint was painted (--runl FILE).
"""
import argparse, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

POSES_A = ['idle', 'sit', 'eat', 'crouch', 'leap', 'land', 'run-r', 'dash-run', 'coffee']
POSES_B = ['magnet', 'umbrella', 'shield', 'scared', 'flee', 'cheer', 'ko', 'dizzy', 'splash']


def fg_mask(rgb, kind='default'):
    """True where the picture is, False where the sheet background is."""
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    if kind == 'conn':
        # background is whatever the border is connected to, whatever colour that is
        bg_seed = np.zeros(r.shape, bool)
        bg_seed[0, :] = bg_seed[-1, :] = bg_seed[:, 0] = bg_seed[:, -1] = True
        key = np.stack([rgb[0, 0], rgb[0, -1], rgb[-1, 0], rgb[-1, -1]]).mean(0)
        near = (np.abs(r - key[0]) < 42) & (np.abs(g - key[1]) < 42) & (np.abs(b - key[2]) < 42)
        lab, _ = ndimage.label(near)
        border_labels = set(lab[bg_seed].ravel()) - {0}
        bg = np.isin(lab, list(border_labels))
        return ~bg
    m = ((np.minimum(r, b) - g) > 38) & (np.abs(r - b) < 50)      # magenta family
    if kind == 'nopink':
        m |= (r > b) & (b > 135) & (r - g > 30)                    # warm pink residue
    keep = ~m
    # some sheets separate frames with full-span WHITE rules rather than gaps
    white = (r > 238) & (g > 238) & (b > 238)
    rows_all_white = white.mean(axis=1) > 0.92
    cols_all_white = white.mean(axis=0) > 0.92
    keep[rows_all_white, :] = False
    keep[:, cols_all_white] = False
    return keep


def gutters(profile, want, min_run=6):
    """profile: per-line count of foreground px. Return `want` cut positions taken
    from the MIDDLE of the widest empty runs that sit inside the picture."""
    empty = profile == 0
    runs, start = [], None
    for i, e in enumerate(empty):
        if e and start is None:
            start = i
        elif not e and start is not None:
            runs.append((start, i - 1)); start = None
    if start is not None:
        runs.append((start, len(empty) - 1))
    lo = int(np.argmax(profile > 0))
    hi = len(profile) - 1 - int(np.argmax(profile[::-1] > 0))
    inner = [r for r in runs if r[0] > lo and r[1] < hi and (r[1] - r[0] + 1) >= min_run]
    inner.sort(key=lambda r: (r[1] - r[0]), reverse=True)
    cuts = sorted((r[0] + r[1]) // 2 for r in inner[:want])
    return cuts, (lo, hi), len(inner)


def despeckle(mask, min_px=90, max_dist=16):
    """Drop tiny stray components that sit well away from the body, keep the small
    ones that are part of the picture (coins, stars, a thin antenna)."""
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    if n <= 1:
        return mask
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1
    body = lab == main
    far = ndimage.distance_transform_edt(~body) > max_dist
    out = body.copy()
    for i in range(1, n + 1):
        if i == main:
            continue
        comp = lab == i
        if sizes[i - 1] >= min_px or not far[comp].all():
            out |= comp
    return out


def despill(rgb, mask, band=2):
    """Take the magenta out of the antialiased edge without touching pink the artist
    actually painted: only pixels within `band` px of the alpha edge are corrected."""
    out = rgb.astype(np.int16)
    edge = mask & ~ndimage.binary_erosion(mask, np.ones((3, 3)), iterations=band)
    r, g, b = out[:, :, 0], out[:, :, 1], out[:, :, 2]
    spill = np.minimum(r, b) - g
    hit = edge & (spill > 12)
    r[hit] -= (spill[hit] * 0.85).astype(np.int16)
    b[hit] -= (spill[hit] * 0.85).astype(np.int16)
    return np.clip(out, 0, 255).astype(np.uint8)


def cut(path, mask_kind='default', erode=1, pad=2, verbose=True):
    im = Image.open(path).convert('RGB')
    rgb = np.array(im)
    keep = fg_mask(rgb, mask_kind)
    keep = ndimage.binary_opening(keep, np.ones((3, 3)))            # kill lone specks first
    colp = keep.sum(axis=0)
    rowp = keep.sum(axis=1)
    xcuts, (x0, x1), nx = gutters(colp, 2)
    ycuts, (y0, y1), ny = gutters(rowp, 2)
    if verbose:
        print('  %-22s %dx%d  mask=%s  col gutters found %d, row gutters found %d'
              % (os.path.basename(path), im.width, im.height, mask_kind, nx, ny))
    if len(xcuts) != 2 or len(ycuts) != 2:
        raise SystemExit('  ⛔ grid sanity FAILED: need 2 column and 2 row gutters, got %d/%d.\n'
                         '     Try --mask nopink or --mask conn, or the sheet is not a 3x3.'
                         % (len(xcuts), len(ycuts)))
    xb = [x0] + xcuts + [x1 + 1]
    yb = [y0] + ycuts + [y1 + 1]
    frames = []
    for gy in range(3):
        for gx in range(3):
            sx, ex = xb[gx], xb[gx + 1]
            sy, ey = yb[gy], yb[gy + 1]
            cell = keep[sy:ey, sx:ex]
            if cell.sum() < 400:
                raise SystemExit('  ⛔ cell %d,%d is nearly empty (%d px) — check the sheet'
                                 % (gy, gx, int(cell.sum())))
            cell = despeckle(cell)
            if erode:
                cell = ndimage.binary_erosion(cell, np.ones((3, 3)), iterations=erode)
            ys, xs = np.where(cell)
            ty0, ty1, tx0, tx1 = ys.min(), ys.max(), xs.min(), xs.max()
            sub_rgb = rgb[sy:ey, sx:ex][ty0:ty1 + 1, tx0:tx1 + 1]
            sub_a = cell[ty0:ty1 + 1, tx0:tx1 + 1]
            sub_rgb = despill(sub_rgb, sub_a)
            h, w = sub_a.shape
            out = np.zeros((h + pad * 2, w + pad * 2, 4), np.uint8)
            out[pad:pad + h, pad:pad + w, :3] = sub_rgb
            out[pad:pad + h, pad:pad + w, 3] = np.where(sub_a, 255, 0)
            frames.append(Image.fromarray(out, 'RGBA'))
    return frames


def contact(frames, names, path, cell=190):
    """Montage on a dark checkerboard — the sprites ship on a night street, so this is
    the only honest way to look at them."""
    cols = 5
    rows = (len(frames) + cols - 1) // cols
    W, H = cols * cell, rows * (cell + 16)
    chk = np.indices((H, W)).sum(0) // 12 % 2
    base = np.where(chk[:, :, None], np.array([26, 31, 22]), np.array([18, 22, 15])).astype(np.uint8)
    sheet = Image.fromarray(base, 'RGB')
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for i, fr in enumerate(frames):
        gx, gy = i % cols, i // cols
        s = fr.copy()
        s.thumbnail((cell - 12, cell - 12))
        ox = gx * cell + (cell - s.width) // 2
        oy = gy * (cell + 16) + (cell - s.height) // 2
        sheet.paste(s, (ox, oy), s)
        d.text((gx * cell + 6, gy * (cell + 16) + cell - 2), names[i] if i < len(names) else '?',
               fill=(200, 168, 75))
    sheet.save(path)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheets', nargs='+')
    ap.add_argument('--out')
    ap.add_argument('--mask', default='default', choices=['default', 'nopink', 'conn'])
    ap.add_argument('--contact')
    ap.add_argument('--runl', help='a real left-sprint painting, if one exists')
    ap.add_argument('--erode', type=int, default=1)
    ap.add_argument('--dry', action='store_true', help='detect and report, write nothing')
    a = ap.parse_args()

    names, frames = [], []
    for i, s in enumerate(a.sheets):
        fr = cut(s, a.mask, a.erode)
        pose = POSES_A if i == 0 else POSES_B
        frames += fr
        names += pose[:len(fr)]
    for f, n in zip(frames, names):
        print('    %-10s %dx%d' % (n, f.width, f.height))
    if a.contact:
        print('  contact sheet →', contact(frames, names, a.contact))
    if a.dry or not a.out:
        return
    os.makedirs(a.out, exist_ok=True)
    for f, n in zip(frames, names):
        f.save(os.path.join(a.out, n + '.png'))
    # the nineteenth: a real painting if we have one, otherwise the forward-facing leap
    if a.runl:
        Image.open(a.runl).convert('RGBA').save(os.path.join(a.out, 'run-l.png'))
    elif 'leap' in names:
        frames[names.index('leap')].save(os.path.join(a.out, 'run-l.png'))
    print('  wrote %d poses → %s' % (len(frames) + 1, a.out))


if __name__ == '__main__':
    main()
