#!/usr/bin/env python3
"""Cut a Jimothy 3x3 costume sheet into named pose PNGs.

    python3 scripts/cut_sheet.py art-drop5/wizard1.png --dry --contact /tmp/wizard.png
    python3 scripts/cut_sheet.py art-drop5/wizard1.png art-drop5/wizard2.png \
        --out assets/skins/wizard --contact /tmp/wizard.png

⛔ THE RULES THIS RIG EXISTS TO ENFORCE (each one learned by shipping the mistake):

  1. NEVER cut on an even grid. Frames are painted by hand and never land on thirds.
     We find the real gutters (lines that are entirely background) and split at their
     MIDPOINTS, so a detached bit of a frame — a flying coin, a spark, a thrown
     salmon, a star over a knocked-out head — stays with the frame it belongs to.

  2. NEVER key on "looks magenta". The 2026-07-23 sheets paint hot pink FX: speed
     lines, sparks, star bursts, fire. Measured, the old min(r,b)-g>38 rule would
     have deleted 27,669 painted pixels from one Shinothy sheet and 37,512 from the
     other, punching holes through the art nobody would notice until it shipped.
     Instead we MEASURE the sheet's own background colour and key on distance to it,
     with a soft ramp so edges stay smooth rather than eroded.

  3. LOOK AT EVERY SPRITE. --contact writes a montage on a dark checkerboard, which
     is the only honest background (the game is a night street). Open it. Sheets that
     cut "fine" have still shipped a clipped hat.

  4. Sheets vary and are sometimes swapped. Some separate frames with white rules
     instead of gaps (Dinosaur sheet 1). Check the contact sheet against the pose
     names before writing anything.

Frame order (ART-BIBLE-ANIMATION.md section 3), sheet A then sheet B:
  idle sit eat crouch leap land run-r dash-run coffee
  magnet umbrella shield scared flee cheer ko dizzy splash
`run-l` is the optional nineteenth and is not on the sheets: it is MIRRORED from
`run-r` (what every shipped pack does) unless a real left sprint was painted (--runl).
"""
import argparse, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

POSES_A = ['idle', 'sit', 'eat', 'crouch', 'leap', 'land', 'run-r', 'dash-run', 'coffee']
POSES_B = ['magnet', 'umbrella', 'shield', 'scared', 'flee', 'cheer', 'ko', 'dizzy', 'splash']


def find_key(rgb):
    """The sheet's own background colour, measured rather than assumed.

    Corners are not safe (Dinosaur sheet 1 has a white frame), so take the modal
    colour among the magenta family across the whole sheet, then average the exact
    pixels near that mode for a sub-integer-accurate key."""
    a = rgb.astype(np.int16)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    fam = (r > 150) & (b > 150) & (g < 90)
    if fam.sum() < 1000:                                   # not a magenta sheet after all
        flat = a.reshape(-1, 3)[::7]
        q = (flat // 8 * 8)
        vals, counts = np.unique(q, axis=0, return_counts=True)
        mode = vals[counts.argmax()]
    else:
        q = (a[fam] // 8 * 8)
        vals, counts = np.unique(q, axis=0, return_counts=True)
        mode = vals[counts.argmax()]
    near = (np.abs(a - mode).max(axis=2) < 24)
    return a[near].reshape(-1, 3).mean(axis=0)


def alpha_from_key(rgb, key, t0=30, t1=62):
    """0 where the pixel is the background colour, 255 where it is clearly paint, a
    ramp between so the antialiased edge survives instead of being eroded away."""
    d = np.abs(rgb.astype(np.int16) - key).max(axis=2).astype(np.float32)
    a = (d - t0) / float(t1 - t0)
    return np.clip(a, 0, 1)


def shadow_over_key(rgb, key):
    """The artist's drop shadow falls ON the background, and a soft black over magenta
    is still magenta — just darker. Disco's boots shipped a pink-purple smear under
    them for exactly this reason.

    A shadowed background pixel is (roughly) the key colour scaled toward black, so its
    red and blue fall by the SAME fraction while its green stays as tiny as the key's.
    Painted purple is not like that: Trash King's spark trails read 149,31,130 — green
    far above anything a shadowed background could produce. Measured on both before
    choosing this test, because a green-channel threshold alone deletes his sparks."""
    a = rgb.astype(np.float32)
    kr, kg, kb = max(key[0], 1.0), key[1], max(key[2], 1.0)
    sr, sb = a[:, :, 0] / kr, a[:, :, 2] / kb
    # ⛔ 0.30, not 0.13. A shadow cast by something COLOURED (the cardboard knight's red
    # cape) tints the background it falls on — his smudge measures 168,0,128, warm enough
    # to fail a tight ratio and survive as a bright pink streak under his feet. The green
    # rule below is what keeps this safe: painted purple runs about 25 green and painted
    # pink about 90, while a shadow on this key cannot rise above single figures.
    return (np.abs(sr - sb) < 0.30) & (sr < 1.06) & (sb < 1.06) & \
           (a[:, :, 1] < 8 + 0.06 * a[:, :, 0])


def background(rgb, key, t0=30, t1=62):
    """alpha, with the shadow smear removed — but ONLY where it is genuinely outside.

    ⛔ The topology is the whole safety net. A dark purple pixel deep inside the shield
    dome or the cape passes the shadow test too; it is kept because you cannot reach it
    from the edge of the sheet without crossing paint. Enclosed gaps between limbs stay
    transparent because they match the key directly."""
    alpha = alpha_from_key(rgb, key, t0, t1)
    band, wr, wc = rule_bands(rgb)
    near = (alpha <= 0.02) | band
    smear = shadow_over_key(rgb, key)
    both = near | smear
    lab, n = ndimage.label(both)
    if n:
        border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
        border.discard(0)
        outside = np.isin(lab, list(border))
        alpha[outside] = 0
    alpha[band] = 0
    alpha = edge_alpha(rgb, key, alpha)
    return alpha, wr, wc


def edge_alpha(rgb, key, alpha, band_px=3):
    """Proper partial coverage on the outline, which a distance threshold cannot give.

    Where DARK art meets the key, the antialiased pixel between them is a mid magenta
    (dark armour at 50% over the key reads about 153,31,153). That is far enough from
    the key to be called paint, so the cardboard knight shipped a magenta rim along his
    cape and a magenta streak under his feet. Estimate coverage instead: how much of
    the key's own magenta-over-green signature is still in the pixel.

    ⛔ ONLY within a few pixels of real background. The same colour test applied across
    the whole frame would eat Shinothy's pink sparks and the Trash King's purple ones,
    which are paint, not coverage. Three pixels is the width of an antialiased edge;
    anything deeper into the sprite keeps the alpha it had."""
    a = rgb.astype(np.float32)
    bg = alpha <= 0.02
    if not bg.any():
        return alpha
    near = ndimage.binary_dilation(bg, np.ones((3, 3)), iterations=band_px) & ~bg
    spill = np.minimum(a[:, :, 0], a[:, :, 2]) - a[:, :, 1]
    key_spill = max(min(key[0], key[2]) - key[1], 1.0)
    est = np.clip(1.0 - spill / key_spill, 0, 1)
    alpha[near] = np.minimum(alpha[near], est[near])       # only ever reduce
    return alpha


def rule_bands(rgb):
    """Some sheets rule the grid in thick WHITE bands instead of leaving a gap
    (Dinosaur sheet 1 rules 21 pixels wide, cardboard knight and robot too).

    Two things have to happen or the sheet cuts badly, and both were seen:
      · the band's antialiased shoulder is neither white nor background, so clearing
        only the pure-white rows leaves a pale L in the corner of every frame;
      · worse, the band WALLS THE CELL OFF, so the shadow-smear test cannot reach the
        sheet edge and the pink shadow under the character survives inside the box.
    So find the bands, grow them a little to swallow their shoulders (light pixels
    only, so a cream belly two pixels away is never touched), and hand them back to be
    counted as background BEFORE the connectivity runs."""
    light = rgb.min(axis=2) > 190
    rows = light.mean(axis=1) > 0.55     # a frame is a third of the width, so only a rule
    cols = light.mean(axis=0) > 0.55     # can light up more than half a line
    band = np.zeros(light.shape, bool)
    if not rows.any() and not cols.any():
        return band, 0, 0
    band[rows, :] = True
    band[:, cols] = True
    # ⛔ Clear the WHOLE shoulder, not just the pale part of it. Where a white rule meets
    # the magenta there is an antialiased blend — around 250,128,245 — which is neither
    # white nor background and survived two attempts at this, printing a lilac L in the
    # corner of half the Dinosaur and cardboard-knight frames. A row that is 85% light
    # across the FULL width of the sheet cannot contain art (a frame is a third of it),
    # so everything within four pixels of one is gutter and can go.
    band = ndimage.binary_dilation(band, np.ones((9, 9)))
    return band, int(rows.sum()), int(cols.sum())


def gutters(profile, want=2):
    """Where to split a 3x3 sheet, one cut per window rather than "the widest gaps".

    Two failure modes this shape avoids, both seen on the 2026-07-23 drop:
      · a sheet with FOUR candidate gaps (wizard) where the two widest both sat in
        the same region, which would have split one column twice and merged another;
      · a sheet where two frames TOUCH (disco, hazmat, trashking) across a sliver of
        FX 3 to 13 pixels wide, where no empty line exists at all.
    So: look for each cut inside its own window around where it has to be, prefer the
    middle of the widest empty run there, and if the frames genuinely touch, cut at the
    narrowest point and REPORT the bridge so a human decides whether it matters."""
    lo = int(np.argmax(profile > 0))
    hi = len(profile) - 1 - int(np.argmax(profile[::-1] > 0))
    span = hi - lo + 1
    cuts, bridges = [], []
    for i in range(want):
        target = lo + span * (i + 1) / float(want + 1)
        w = max(8, int(span * 0.13))
        a0, a1 = max(lo + 1, int(target - w)), min(hi - 1, int(target + w))
        seg = profile[a0:a1 + 1]
        runs, start = [], None
        for j, e in enumerate(seg == 0):
            if e and start is None:
                start = j
            elif not e and start is not None:
                runs.append((start, j - 1)); start = None
        if start is not None:
            runs.append((start, len(seg) - 1))
        if runs:
            runs.sort(key=lambda r: (r[1] - r[0]), reverse=True)
            r = runs[0]
            cuts.append(a0 + (r[0] + r[1]) // 2); bridges.append(0)
        else:
            cuts.append(a0 + int(seg.argmin())); bridges.append(int(seg.min()))
    return sorted(cuts), (lo, hi), bridges


def despeckle(solid, min_px=4, max_dist=48):
    """Drop stray dust well away from the body; keep the small deliberate things —
    a coin, a spark, a star, an antenna — that belong to the picture.

    ⛔ The thresholds are deliberately TIMID. These sheets are clean digital PNGs, not
    scans: there is no dust to remove, and measured on Shinothy sheet 2 the old
    90px/18px setting was throwing away fourteen painted sparkles off the magnet pose
    and twelve off the cheer. The only thing worth dropping is a mote small enough to
    be an artefact AND far enough out to inflate the frame's box, because the engine
    scales each pose by its box — a stray dot shrinks the character."""
    lab, n = ndimage.label(solid, structure=np.ones((3, 3)))
    if n <= 1:
        return solid, 0
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1
    body = lab == main
    far = ndimage.distance_transform_edt(~body) > max_dist
    out = body.copy()
    dropped = 0
    for i in range(1, n + 1):
        if i == main:
            continue
        comp = lab == i
        if sizes[i - 1] >= min_px or not far[comp].all():
            out |= comp
        else:
            dropped += 1
    return out, dropped


def despill(rgb, alpha):
    """Take the background's colour out of the semi-transparent edge WITHOUT touching
    pink the artist painted: only pixels that are partly transparent are corrected."""
    out = rgb.astype(np.int16)
    edge = (alpha > 0.02) & (alpha < 0.96)
    r, g, b = out[:, :, 0], out[:, :, 1], out[:, :, 2]
    spill = np.minimum(r, b) - g
    hit = edge & (spill > 10)
    r[hit] -= (spill[hit] * 0.8).astype(np.int16)
    b[hit] -= (spill[hit] * 0.8).astype(np.int16)
    return np.clip(out, 0, 255).astype(np.uint8)


def drop_key_residue(solid, rgb):
    """Remove loose scraps of BACKGROUND that the colour tests could not classify.

    The cardboard knight's sheet has a dark warm-magenta smudge under him — roughly
    168,0,128 — which is the red cape's shadow lying on the key. It is not the key
    colour and not a shadow of the key either (too warm), so it survived as paint.
    But it gives itself away: green flat at zero is the key's signature, and nothing
    Stephen paints sits at zero green while still being bright — the pink sparks run
    around 90, the purple FX around 25. So a loose piece (never the body) whose green
    is essentially absent is background, whatever its hue."""
    lab, n = ndimage.label(solid, structure=np.ones((3, 3)))
    if n <= 1:
        return solid, 0
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1
    out, dropped = (lab == main), 0
    a = rgb.astype(np.int16)
    for i in range(1, n + 1):
        if i == main:
            continue
        comp = lab == i
        g = a[:, :, 1][comp].mean()
        rb = np.minimum(a[:, :, 0], a[:, :, 2])[comp].mean()
        if g < 10 and rb > 60:
            dropped += 1
        else:
            out |= comp
    return out, dropped


def crop_bleed(solid, edges, max_frac=0.02, min_gap=10):
    """Remove pieces of the NEIGHBOURING frame that a cut through paint dragged in.

    Three things have to be true at once, so a real detached spark is never mistaken
    for one: the piece is tiny next to this frame's body, it sits clear of the body,
    and it is flush against a side that was cut (never against the sheet's own edge,
    where nothing can have come from)."""
    lab, n = ndimage.label(solid, structure=np.ones((3, 3)))
    if n <= 1:
        return None
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1
    body = lab == main
    dist = ndimage.distance_transform_edt(~body)
    h, w = solid.shape
    out, dropped = body.copy(), 0
    for i in range(1, n + 1):
        if i == main:
            continue
        comp = lab == i
        ys, xs = np.where(comp)
        flush = ((edges[0] and xs.min() <= 1) or (edges[1] and xs.max() >= w - 2) or
                 (edges[2] and ys.min() <= 1) or (edges[3] and ys.max() >= h - 2))
        if flush and sizes[i - 1] < max_frac * sizes[main - 1] and dist[comp].min() > min_gap:
            dropped += 1
        else:
            out |= comp
    return (out, dropped) if dropped else None


def cut(path, pad=3, t0=30, t1=62, verbose=True):
    im = Image.open(path).convert('RGB')
    rgb = np.array(im)
    key = find_key(rgb)
    alpha, wr, wc = background(rgb, key, t0, t1)
    solid = alpha > 0.5
    solid_open = ndimage.binary_opening(solid, np.ones((3, 3)))
    xcuts, (x0, x1), xbridge = gutters(solid_open.sum(axis=0), 2)
    ycuts, (y0, y1), ybridge = gutters(solid_open.sum(axis=1), 2)
    if verbose:
        br = [b for b in xbridge + ybridge if b]
        print('  %-22s %dx%d key=(%d,%d,%d)%s%s'
              % (os.path.basename(path), im.width, im.height, key[0], key[1], key[2],
                 ('  white rules %dr/%dc' % (wr, wc)) if (wr or wc) else '',
                 ('  ⚠ frames TOUCH, cut through %s px of FX' % br) if br else '  clean gutters'))
    xb = [x0, xcuts[0], xcuts[1], x1 + 1]
    yb = [y0, ycuts[0], ycuts[1], y1 + 1]
    frames, notes = [], []
    for gy in range(3):
        for gx in range(3):
            sy, ey, sx, ex = yb[gy], yb[gy + 1], xb[gx], xb[gx + 1]
            cell_a = alpha[sy:ey, sx:ex].copy()
            cell_rgb = rgb[sy:ey, sx:ex]
            keep, dropped = despeckle(cell_a > 0.5)
            # ⛔ BLEED-THROUGH. When two frames touch, the cut runs through paint and a
            # sliver of the NEIGHBOUR lands in this cell — Trash King's umbrella came out
            # with two crumbs of his magnet pose floating beside him. A sliver is small,
            # nowhere near this frame's body, and cut off flat against the boundary the
            # cut was made on, so all three together identify it and nothing else.
            edges = [gx > 0, gx < 2, gy > 0, gy < 2]          # which sides were cut, not sheet edge
            bled = crop_bleed(keep, edges)
            if bled is not None:
                keep = bled[0]; dropped += bled[1]
            keep, ndrop = drop_key_residue(keep, cell_rgb)
            dropped += ndrop
            if keep.sum() < 400:
                raise SystemExit('  ⛔ cell %d,%d is nearly empty — check the sheet' % (gy, gx))
            grown = ndimage.binary_dilation(keep, np.ones((3, 3)), iterations=2)
            cell_a[~grown] = 0                              # dust out, soft edges intact
            ys, xs = np.where(cell_a > 0.02)
            ty0, ty1, tx0, tx1 = ys.min(), ys.max(), xs.min(), xs.max()
            sub_a = cell_a[ty0:ty1 + 1, tx0:tx1 + 1]
            sub_rgb = despill(cell_rgb[ty0:ty1 + 1, tx0:tx1 + 1], sub_a)
            h, w = sub_a.shape
            out = np.zeros((h + pad * 2, w + pad * 2, 4), np.uint8)
            out[pad:pad + h, pad:pad + w, :3] = sub_rgb
            out[pad:pad + h, pad:pad + w, 3] = (sub_a * 255).astype(np.uint8)
            frames.append(Image.fromarray(out, 'RGBA'))
            notes.append(dropped)
    return frames, notes


def contact(frames, names, path, cell=200):
    cols = 5
    rows = (len(frames) + cols - 1) // cols
    W, H = cols * cell, rows * (cell + 18)
    chk = np.indices((H, W)).sum(0) // 12 % 2
    base = np.where(chk[:, :, None], np.array([28, 33, 24]), np.array([16, 20, 14])).astype(np.uint8)
    sheet = Image.fromarray(base, 'RGB')
    d = ImageDraw.Draw(sheet)
    for i, fr in enumerate(frames):
        gx, gy = i % cols, i // cols
        s = fr.copy(); s.thumbnail((cell - 14, cell - 14))
        sheet.paste(s, (gx * cell + (cell - s.width) // 2,
                        gy * (cell + 18) + (cell - s.height) // 2), s)
        d.text((gx * cell + 6, gy * (cell + 18) + cell + 2),
               names[i] if i < len(names) else '?', fill=(200, 168, 75))
    sheet.save(path)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheets', nargs='+')
    ap.add_argument('--out')
    ap.add_argument('--contact')
    ap.add_argument('--runl', help='a real left-sprint painting, if one exists')
    ap.add_argument('--t0', type=int, default=30, help='distance to key that is fully background')
    ap.add_argument('--t1', type=int, default=62, help='distance to key that is fully paint')
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()

    names, frames = [], []
    for i, s in enumerate(a.sheets):
        fr, dropped = cut(s, t0=a.t0, t1=a.t1)
        pose = POSES_A if i == 0 else POSES_B
        for j, f in enumerate(fr):
            print('    %-10s %4dx%-4d%s' % (pose[j], f.width, f.height,
                                            '  (%d specks dropped)' % dropped[j] if dropped[j] else ''))
        frames += fr; names += pose[:len(fr)]
    if a.contact:
        print('  contact →', contact(frames, names, a.contact))
    if a.dry or not a.out:
        return
    os.makedirs(a.out, exist_ok=True)
    for f, n in zip(frames, names):
        f.save(os.path.join(a.out, n + '.png'))
    # THE NINETEENTH POSE. Every shipped pack uses run-l = mirror(run-r) (verified
    # against deckhand and crow); only Market has its own left sprint. Mirroring
    # flips asymmetric props to the wrong side, which is why a real painting always wins,
    # but at hop speed it reads far better than reusing a forward-facing leap.
    if a.runl:
        Image.open(a.runl).convert('RGBA').save(os.path.join(a.out, 'run-l.png'))
    elif 'run-r' in names:
        from PIL import ImageOps
        ImageOps.mirror(frames[names.index('run-r')]).save(os.path.join(a.out, 'run-l.png'))
    print('  wrote %d poses → %s' % (len(frames) + 1, a.out))


if __name__ == '__main__':
    main()
