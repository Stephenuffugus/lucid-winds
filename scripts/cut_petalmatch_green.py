#!/usr/bin/env python3
"""Cut the Petal Match GREEN remake sheets (2026-07-26).

These five sheets are the pink/purple items regenerated on flat green per the
012Assets doc "PETAL MATCH - Pink + Purple Remakes on GREEN". Green is maximally
far from pink/purple, so a colour key is finally honest here - the whole reason
the sheets were remade. See assets/games/petalmatch/MANIFEST.md.

Method: NOT an even grid (house law). Rows and columns are found by PROJECTING
the not-green mask - a row/column of pure green is a gutter. Works because the
generator left generous clean gutters (verified by eye on all five sheets first).

Special cases, each earned:
  - board-shadow is a soft dark smudge ON the green: after keying, its RGB is
    forced to a flat near-black. A shadow must be neutral - the generator
    painted it greenish-black, and leaving that tint would sit a green ghost
    under the board frame.
  - despill: semi-transparent edge pixels blend toward green. g is clamped to
    max(r,b) wherever alpha < 1 so glows keep their pink and never fringe green.

Usage:
  python3 scripts/cut_petalmatch_green.py --dry      # contact sheet only, LOOK first
  python3 scripts/cut_petalmatch_green.py            # write masters + runtime
"""
import os, sys
import numpy as np
from PIL import Image

SRC = 'assets/petalmatch-green/Petal match green backdrops'
MASTERS = 'assets/games/petalmatch'
RUNTIME = os.path.join(MASTERS, 'runtime')
CONTACT = '/tmp/claude-1000/-workspaces-lucid-winds/83cf72b0-ce3d-4d27-8e18-21af14ee585f/scratchpad/pm_green_contact.png'

# Per-sheet name maps, rows top to bottom, items left to right.
# Read off the sheets by eye BEFORE writing this - do not reorder casually.
SHEETS = {
  '1.png': [
    ['board-shadow', 'base-1-camellia', 'base-8-thistle', 'cover-full'],
    ['cover-half', 'cover-crack', 'ice-shatter', 'drop-token-glow'],
  ],
  '2.png': [
    ['spec-box', 'box-residue', 'combo-cross', 'spec-quake', 'spec-serpent'],
    ['serpent-trail', 'spec-wild', 'spec-strip', 'combo-mega', 'combo-storm'],
    ['combo-hydra', 'ring-plain', 'ring-ornate', 'ring-corners'],
  ],
  '3.png': [
    ['emblem-lotus', 'emblem-cross', 'emblem-beam', 'emblem-dewshield', 'emblem-cradle'],
    ['emblem-rocket', 'emblem-serpent', 'emblem-cascade', 'emblem-orb', 'emblem-gate'],
    ['tool-swap-ready', 'tool-hammer-ready', 'tool-shuffle-ready', 'tool-bomb-ready', 'tool-magnet-ready'],
    ['tool-hourglass-ready', 'tool-undo-ready', 'tool-empty-ready', 'tool-undo', 'tool-swap'],
  ],
  '4.png': [
    ['fx-shard-1', 'fx-shard-2', 'fx-shard-3', 'fx-burst', 'fx-flash', 'fx-ring'],
    ['fx-sparkle', 'fx-trail', 'fx-plume', 'fx-beam-h', 'fx-beam-v', 'fx-coin-pop'],
    ['confetti-petals', 'confetti-ribbons', 'confetti-gems', 'pop-nice', 'pop-great', 'pop-amazing'],
    ['pop-incredible', 'pop-lastmove', 'pop-combo-frame'],
  ],
  '5.png': [
    ['star-empty', 'star-1', 'star-2', 'star-3', 'star-lit'],
    ['star-gold', 'laurel-burst', 'streak-flame', 'achv-tower', 'achv-compass'],
    ['achv-collection', 'skin-purple-bg', 'skin-purple-frame', 'skin-purple-grid'],
  ],
}

# master name -> runtime key the game actually loads. Only these get runtime
# copies; everything else is a master awaiting its mechanic.
RUNTIME_MAP = {
  'base-1-camellia': 'base-0',          # base-0 measured pink (219,73,122)
  'cover-full': 'cover-2', 'cover-half': 'cover-1', 'cover-crack': 'cover-crack',
  'ice-shatter': 'ice-shatter',
  'spec-wild': 'spec-wild',
  'combo-cross': 'combo-cross', 'combo-mega': 'combo-mega',
  'combo-storm': 'combo-storm', 'combo-hydra': 'combo-hydra',
  'ring-plain': 'ring-plain', 'ring-ornate': 'ring-ornate', 'ring-corners': 'ring-corners',
  'emblem-lotus': 'emblem-lotus', 'emblem-cross': 'emblem-cross',
  'emblem-beam': 'emblem-beam', 'emblem-dewshield': 'emblem-dewshield',
  'fx-burst': 'fx-burst', 'fx-flash': 'fx-flash', 'fx-ring': 'fx-ring',
  'fx-sparkle': 'fx-sparkle', 'fx-plume': 'fx-plume',
  'fx-shard-1': 'fx-shard-1', 'fx-shard-2': 'fx-shard-2', 'fx-shard-3': 'fx-shard-3',
  'fx-beam-h': 'fx-beam-h', 'fx-beam-v': 'fx-beam-v',
  'pop-nice': 'pop-nice', 'pop-great': 'pop-great', 'pop-amazing': 'pop-amazing',
  'pop-incredible': 'pop-incredible', 'pop-lastmove': 'pop-lastmove',
  'star-empty': 'star-empty', 'star-lit': 'star-lit',
  'laurel-burst': 'laurel-burst',
  'board-shadow': 'board-shadow',       # NEW key - wired under the board frame
}

DRY = '--dry' in sys.argv

def key_colour(a):
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    vals, counts = np.unique(edge.reshape(-1, 3), axis=0, return_counts=True)
    return vals[counts.argmax()].astype(float)

def cut_sheet(path, rows_map):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(float)
    key = key_colour(a)
    dist = np.sqrt(((a - key) ** 2).sum(-1))
    mask = dist > 28                     # low threshold so faint glows count as art

    H, W = mask.shape
    # row bands: gutter = a run of rows with (almost) no art
    rowhas = mask.sum(1) > (W * 0.002)
    bands, start = [], None
    for y in range(H):
        if rowhas[y] and start is None: start = y
        if not rowhas[y] and start is not None:
            if y - start > 24: bands.append((start, y))
            start = None
    if start is not None: bands.append((start, H))
    assert len(bands) == len(rows_map), f'{path}: found {len(bands)} row bands, map has {len(rows_map)}'

    out = []
    for (y0, y1), names in zip(bands, rows_map):
        band = mask[y0:y1]
        colhas = band.sum(0) > ((y1 - y0) * 0.002)
        cols, s = [], None
        for x in range(W):
            if colhas[x] and s is None: s = x
            if not colhas[x] and s is not None:
                if x - s > 24: cols.append((s, x))
                s = None
        if s is not None: cols.append((s, W))
        assert len(cols) == len(names), f'{path} band {y0}-{y1}: {len(cols)} cols, map has {len(names)} ({names})'
        for (x0, x1), name in zip(cols, names):
            pad = 6
            cy0, cy1 = max(0, y0 - pad), min(H, y1 + pad)
            cx0, cx1 = max(0, x0 - pad), min(W, x1 + pad)
            sub = a[cy0:cy1, cx0:cx1]
            d = dist[cy0:cy1, cx0:cx1]
            """ ALPHA + UNMIX, the honest chroma-key math.
            The first pass ramped alpha off key-distance and stopped, which left
            every soft glow with a heavy GREEN FRINGE (seen on the contact sheet:
            tool auras, sparkles, beams, pops all haloed green). A 30%-opaque pink
            pixel photographed over green IS mostly green - alpha alone cannot fix
            that; the key's contribution must be divided back out:
                true = (observed - (1-a)*key) / a
            Threshold 180: solidly-inked art (even dark purple frames, measured
            dist ~242) stays fully opaque; only the glow band gets unmixed. """
            alpha = np.clip(d / 180.0, 0, 1)
            asafe = np.maximum(alpha, 0.05)[..., None]
            rgb = (sub - (1 - alpha)[..., None] * key) / asafe
            rgb = np.clip(rgb, 0, 255)
            # residual despill on the still-soft band: green never dominates there
            soft = alpha < 0.98
            gcap = np.maximum(rgb[..., 0], rgb[..., 2])
            rgb[..., 1] = np.where(soft, np.minimum(rgb[..., 1], gcap), rgb[..., 1])
            if name == 'board-shadow':
                # a shadow is neutral black; alpha carries all the softness
                alpha = alpha * 0.85
                rgb[..., 0] = 10; rgb[..., 1] = 13; rgb[..., 2] = 9
            frame = np.dstack([rgb, alpha * 255]).astype(np.uint8)
            # trim to alpha bbox
            ys, xs = np.where(frame[..., 3] > 8)
            frame = frame[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            out.append((name, Image.fromarray(frame, 'RGBA')))
    return out

def main():
    frames = []
    for sheet, rows_map in SHEETS.items():
        frames += cut_sheet(os.path.join(SRC, sheet), rows_map)
    names = [n for n, _ in frames]
    assert len(names) == len(set(names)), 'duplicate names in the maps'
    print(f'cut {len(frames)} frames from {len(SHEETS)} sheets')

    # contact sheet on dark checkerboard - LOOK before trusting anything
    cols, cell = 10, 150
    rows = (len(frames) + cols - 1) // cols
    board = Image.new('RGB', (cols * cell, rows * (cell + 16)), (24, 28, 22))
    from PIL import ImageDraw
    dr = ImageDraw.Draw(board)
    for i, (name, im) in enumerate(frames):
        x, y = (i % cols) * cell, (i // cols) * (cell + 16)
        for cy in range(0, cell, 12):
            for cx in range(0, cell, 12):
                if (cx // 12 + cy // 12) % 2: dr.rectangle([x + cx, y + cy, x + cx + 11, y + cy + 11], fill=(32, 37, 30))
        t = im.copy(); t.thumbnail((cell - 8, cell - 8))
        board.paste(t, (x + (cell - t.width) // 2, y + (cell - t.height) // 2), t)
        dr.text((x + 3, y + cell + 2), name[:22], fill=(220, 214, 190))
    board.save(CONTACT)
    print('contact ->', CONTACT)
    if DRY:
        print('DRY RUN: nothing written'); return

    wrote_m = wrote_r = 0
    for name, im in frames:
        im.save(os.path.join(MASTERS, name + '.png')); wrote_m += 1
        rk = RUNTIME_MAP.get(name)
        if not rk: continue
        old = os.path.join(RUNTIME, rk + '.png')
        target = 512 if rk == 'board-shadow' else None
        if os.path.exists(old):
            with Image.open(old) as o: target = max(o.size)
        if target is None: target = 160
        r = im.copy(); r.thumbnail((target, target), Image.LANCZOS)
        q = r.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.Dither.NONE)
        q.save(old, optimize=True); wrote_r += 1
    print(f'wrote {wrote_m} masters, {wrote_r} runtime copies')

if __name__ == '__main__':
    main()
