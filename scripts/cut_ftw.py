#!/usr/bin/env python3
"""Cut a Flock the World magenta-knockout art sheet into named PNGs.

  python3 scripts/cut_ftw.py <sheet.png> <out_dir> <id1,id2,...> [longside]

⛔ NEVER cuts on an even grid. These sheets are laid out by a generator and the
objects drift; an even split slices the wide ones in half. Objects are found by
connected components after a horizontally biased dilation, the same method as
scripts/cut_jimothy2.py auto_objects, because an object's own glow sits BESIDE
it while the next ROW sits below it, and dilating equally fuses the two.

⛔ Matching the expected COUNT is not proof the decomposition is right. A sheet
can yield exactly 12 pieces while merging two icons and splitting another. Always
open the contact sheet.
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage

src, out_dir, names_csv = sys.argv[1], sys.argv[2], sys.argv[3]
longside = int(sys.argv[4]) if len(sys.argv) > 4 else 160
names = [n.strip() for n in names_csv.split(',') if n.strip()]
os.makedirs(out_dir, exist_ok=True)

img = Image.open(src).convert('RGBA')
a = np.asarray(img).astype(np.int16)
R, G, B = a[..., 0], a[..., 1], a[..., 2]

# magenta background: red and blue high, green low. Generous, because the
# generator's magenta is not exactly FF00FF at the edges.
bg = (R > 170) & (B > 170) & (G < np.minimum(R, B) * 0.55)
solid = ~bg

# ⛔ Do NOT fill holes. The magenta you can see THROUGH a gate, an archway or a
# shopping cart is background, and binary_fill_holes cheerfully paints it back
# in as artwork. First attempt shipped a turnstile with a solid magenta arch.
# Eroding is fine and wanted: it takes the anti-aliased pink rim off the outside
# AND off every hole edge.
solid = ndimage.binary_erosion(solid, np.ones((3, 3), bool), iterations=2)

H, W = solid.shape
ROWS_E, COLS_E = int(os.environ.get('FTW_ROWS', '0')), int(os.environ.get('FTW_COLS', '0'))
# ⛔ Dilation exists ONLY to rejoin the parts of one object. When a grid is given
# the cell buckets below already do that, so dilate barely at all: on sheets of
# packed objects (enamel badges that touch, card panels, portrait tiles) a
# generous dilation bridges NEIGHBOURING cells into one blob and the sheet
# collapses. Sheet 5 came out as 3 objects instead of 16 that way.
DX = int(os.environ.get('FTW_DIL_X', '2' if (ROWS_E and COLS_E) else '16'))
DY = int(os.environ.get('FTW_DIL_Y', '1' if (ROWS_E and COLS_E) else '10'))
merged = solid
if DX: merged = ndimage.binary_dilation(merged, np.ones((1, 3), bool), iterations=DX)
if DY: merged = ndimage.binary_dilation(merged, np.ones((3, 1), bool), iterations=DY)
lbl, n = ndimage.label(merged)
blobs = []
for k, sl in enumerate(ndimage.find_objects(lbl), start=1):
    if sl is None:
        continue
    piece = solid[sl] & (lbl[sl] == k)
    area = int(piece.sum())
    if area < 0.00015 * H * W:      # specks only
        continue
    ys, xs = np.where(piece)
    blobs.append([sl[1].start + int(xs.min()), sl[0].start + int(ys.min()),
                  sl[1].start + int(xs.max()) + 1, sl[0].start + int(ys.max()) + 1, area])

# ⛔ The grid is used ONLY to decide which blobs belong to the same icon, never
# to cut. Every crop box below is still the union of real pixel bounds, so an
# object can never be sliced by a cell edge. Without this a fragmenting icon
# shifts the name of every icon after it, which is exactly what happened to
# sheet 1 on the first run: the mesh broke into three and the last four icons
# all got the wrong id.
ROWS, COLS = ROWS_E, COLS_E
if ROWS and COLS:
    cellw, cellh = W / float(COLS), H / float(ROWS)
    buckets = {}
    for b in blobs:
        cx, cy = (b[0] + b[2]) / 2.0, (b[1] + b[3]) / 2.0
        c = min(COLS - 1, max(0, int(cx // cellw)))
        r = min(ROWS - 1, max(0, int(cy // cellh)))
        buckets.setdefault((r, c), []).append(b)
    ordered = []
    for r in range(ROWS):
        for c in range(COLS):
            bs = buckets.get((r, c))
            if not bs:
                continue
            ordered.append((min(x[0] for x in bs), min(x[1] for x in bs),
                            max(x[2] for x in bs), max(x[3] for x in bs),
                            sum(x[4] for x in bs), len(bs)))
    print('%s: %d cells filled of %dx%d (expected %d), from %d raw blobs'
          % (os.path.basename(src), len(ordered), ROWS, COLS, len(names), len(blobs)))
    multi = [i for i, o in enumerate(ordered) if o[5] > 1]
    if multi:
        print('   cells rejoined from fragments: ' + ', '.join(
            (names[i] if i < len(names) else '#%d' % i) + '(%d)' % ordered[i][5] for i in multi))
else:
    blobs.sort(key=lambda b: ((b[1] + b[3]) / 2, b[0]))
    ordered = [tuple(b) + (1,) for b in blobs]
    print('%s: %d objects (expected %d)' % (os.path.basename(src), len(ordered), len(names)))
if len(ordered) != len(names):
    print('   !! COUNT MISMATCH: cut %d, named %d. Look at the contact sheet before trusting any of it.'
          % (len(ordered), len(names)))

rgba = np.asarray(img).copy().astype(np.int16)
rgba[..., 3] = np.where(solid, 255, 0)
# De-fringe. Erosion cannot clear the pink rim on genuinely thin geometry (a
# drone's rotor arms, the wire of a shopping cart) without eating the geometry
# itself. So instead of removing those pixels, remove the MAGENTA from them:
# anywhere red and blue both sit well above green and are close to each other,
# that cast is bleed from the knockout, not art. The palette here is amber and
# teal, so nothing legitimate is magenta and this cannot eat real colour.
r, g, b = rgba[..., 0], rgba[..., 1], rgba[..., 2]
cast = (rgba[..., 3] > 0) & (r > g + 34) & (b > g + 34) & (np.abs(r - b) < 70)
if cast.any():
    tgt = g + 18
    rgba[..., 0] = np.where(cast, np.minimum(r, tgt), r)
    rgba[..., 2] = np.where(cast, np.minimum(b, tgt), b)
    print('   de-fringed %d magenta-cast pixels' % int(cast.sum()))
knocked = Image.fromarray(rgba.astype(np.uint8), 'RGBA')

for i, (x0, y0, x1, y1, area, nblob) in enumerate(ordered):
    nm = names[i] if i < len(names) else ('UNNAMED_%02d' % (i + 1))
    piece = knocked.crop((x0, y0, x1, y1))
    piece = piece.crop(piece.getbbox() or (0, 0, piece.width, piece.height))
    w, h = piece.size
    sc = longside / float(max(w, h))
    piece = piece.resize((max(1, int(round(w*sc))), max(1, int(round(h*sc)))), Image.LANCZOS)
    # square canvas so every icon drops into the same box in the UI
    canvas = Image.new('RGBA', (longside, longside), (0, 0, 0, 0))
    canvas.paste(piece, ((longside - piece.width)//2, (longside - piece.height)//2), piece)
    path = os.path.join(out_dir, nm + '.png')
    canvas.save(path, optimize=True)
    print('   %-14s %4dx%-4d -> %s (%d bytes)' % (nm, x1-x0, y1-y0, path, os.path.getsize(path)))
