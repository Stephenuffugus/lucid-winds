#!/usr/bin/env python3
"""detext_range - derives assets/arenas/range.webp from the corrected
Long Range floor sheet (file_00000000396081f5..., the Aug 31 drop).

That take is the right geometry (five flush bands, no gates) but bakes
"10m..50m" ruler text down the vertical axis, which the spec forbids.
The bands are rotationally uniform stone, so every text/tick pixel is
replaced by the pixel at the SAME RADIUS at a rotated angle, feathered.

    python3 tools/detext_range.py /path/to/file_00000000396081f5....png

Lessons carved into the pass list, learned by LOOKING between passes:
- the two "10m" labels sit OFF the vertical axis (diagonal from the
  boss), so an axis strip alone leaves them;
- a donor angle must land on stone that is ALREADY CLEAN: the first
  patch pass sampled +40 deg, which was the protected near-boss tick,
  and cloned the contamination it was meant to remove.
"""
import os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import artsheet

OUT = os.path.join(os.path.dirname(HERE), 'assets', 'arenas', 'range.webp')

# (mask builder args) -> polar-clone passes, in order. Each pass: strips
# near the vertical axis and/or discs, donor at +-rot from the target's
# angle, mirrored across the horizontal so both halves sample outward.
PASSES = [
    dict(strips=[(105, 115, 505, 18)], discs=[], rot=0.6981),
    dict(strips=[(105, 490, 560, 18)], discs=[(722, 532, 52), (718, 728, 52)], rot=0.6981),
    dict(strips=[(40, 76, 180, 10)], discs=[(697, 545, 42), (692, 704, 36)], rot=0.6981),
    dict(strips=[(46, 76, 195, 10)], discs=[(696, 551, 50), (690, 696, 50)], rot=1.2217),
]

def clone_pass(a, cx, cy, strips, discs, rot):
    H, W = a.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    dx, dy = xx - cx, yy - cy
    r = np.hypot(dx, dy); ang = np.arctan2(dy, dx)
    w = np.zeros((H, W), np.float32)
    for half, r0, r1, feather in strips:
        m = (np.abs(dx) < half) & (r >= r0) & (r < r1)
        w = np.maximum(w, np.where(m, np.clip((half - np.abs(dx)) / feather, 0, 1), 0))
    for px, py, rad in discs:
        d = np.hypot(xx - px, yy - py)
        w = np.maximum(w, np.clip((rad - d) / 12.0, 0, 1))
    ang2 = ang + np.where(dy > 0, rot, -rot) if rot < 1.0 else \
           ang + np.where(dy > 0, -rot, rot)
    sx = np.clip(cx + r * np.cos(ang2), 0, W - 1).astype(np.int32)
    sy = np.clip(cy + r * np.sin(ang2), 0, H - 1).astype(np.int32)
    return a * (1 - w[..., None]) + a[sy, sx] * w[..., None]

def main(src):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    cx, cy = a.shape[1] / 2, a.shape[0] / 2
    for p in PASSES:
        a = clone_pass(a, cx, cy, p['strips'], p['discs'], p['rot'])
    cleaned = Image.fromarray(a.astype(np.uint8))
    keyed, _ = artsheet.key_and_defringe(cleaned)
    keyed.thumbnail((1024, 1024), Image.LANCZOS)
    keyed.save(OUT, 'WEBP', quality=82, method=6)
    print('wrote', OUT, keyed.size, keyed.mode)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(__doc__); sys.exit(1)
    main(sys.argv[1])
