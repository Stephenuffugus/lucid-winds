#!/usr/bin/env python3
"""Slice an FX sprite sheet (black bg) into individual transparent PNGs.

Usage:
  python3 scripts/slice-fx-sheet.py SHEET.png OUTDIR ROWS COLS [PREFIX]

For each grid cell:
  1. Crop the cell.
  2. Threshold pixels: brightness > BG_THRESH → keep, else → transparent.
  3. Trim to the tight bbox of kept pixels.
  4. Save as <prefix><idx>.png at the trimmed resolution.

Cells whose content area is below MIN_AREA (likely sheet whitespace) are
skipped silently. Padding of 4px is preserved around the trimmed bbox so
glow doesn't get clipped.
"""
import os, sys
from PIL import Image

BG_THRESH = 28      # corner-black threshold; anything brighter is "content"
SOFT_THRESH = 16    # below this we kill alpha entirely (cleans rim)
MIN_AREA = 200      # px count threshold for "non-empty cell"
PAD = 4

if len(sys.argv) < 5:
    print("usage: slice-fx-sheet.py SHEET.png OUTDIR ROWS COLS [PREFIX]", file=sys.stderr)
    sys.exit(1)

src, outdir, rows, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
prefix = sys.argv[5] if len(sys.argv) > 5 else 'fx_'
os.makedirs(outdir, exist_ok=True)

im = Image.open(src).convert('RGB')
W, H = im.size
cw, ch = W // cols, H // rows
print(f'{src}  {W}x{H}  cell={cw}x{ch}  rows={rows} cols={cols}')

idx = 0
saved = 0
for r in range(rows):
    for c in range(cols):
        cell = im.crop((c*cw, r*ch, c*cw+cw, r*ch+ch))
        # Build alpha mask from brightness
        out = Image.new('RGBA', cell.size, (0,0,0,0))
        op = out.load()
        cp = cell.load()
        kept_xs, kept_ys = [], []
        for y in range(cell.size[1]):
            for x in range(cell.size[0]):
                r0, g0, b0 = cp[x, y]
                br = max(r0, g0, b0)
                if br <= SOFT_THRESH:
                    continue
                if br <= BG_THRESH:
                    # soft halo — fade alpha proportionally
                    a = int((br - SOFT_THRESH) / (BG_THRESH - SOFT_THRESH) * 255)
                    op[x, y] = (r0, g0, b0, a)
                    kept_xs.append(x); kept_ys.append(y)
                else:
                    op[x, y] = (r0, g0, b0, 255)
                    kept_xs.append(x); kept_ys.append(y)
        if len(kept_xs) < MIN_AREA:
            idx += 1
            continue
        x0, x1 = max(0, min(kept_xs) - PAD), min(cell.size[0], max(kept_xs) + PAD + 1)
        y0, y1 = max(0, min(kept_ys) - PAD), min(cell.size[1], max(kept_ys) + PAD + 1)
        trimmed = out.crop((x0, y0, x1, y1))
        path = os.path.join(outdir, f'{prefix}{idx:02d}.png')
        trimmed.save(path, 'PNG', optimize=True)
        saved += 1
        idx += 1
print(f'saved {saved} sprites')
