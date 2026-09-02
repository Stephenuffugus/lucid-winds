#!/usr/bin/env python3
"""Pick the fullest looking frame from a directory of round screenshots.

  python3 publish/tools/pick_frame.py <dir>   ->  <path>\t<why>

"Fullest" is the grey level standard deviation of the frame, downsampled: a dark
empty table and a white blank both score near zero, a table with bricks, a ball and
a HUD scores high. It is a blunt measure and it is the right one here, because the
only thing being asked is "does this picture have the game in it".
"""
import os, sys
from PIL import Image, ImageStat

d = sys.argv[1]
best, best_sd, best_f = None, -1.0, None
for f in sorted(os.listdir(d)):
    if not f.endswith('.png'):
        continue
    p = os.path.join(d, f)
    im = Image.open(p).convert('L').resize((120, 213))
    st = ImageStat.Stat(im)
    sd, mean = st.stddev[0], st.mean[0]
    if mean < 4 or mean > 251:          # all black or all white is not a frame
        continue
    if sd > best_sd:
        best, best_sd, best_f = p, sd, f
if best is None:
    files = sorted(x for x in os.listdir(d) if x.endswith('.png'))
    print(os.path.join(d, files[len(files) // 2]) + '\tevery frame was flat, took the middle one')
else:
    print(f'{best}\tsd {best_sd:.0f}, frame {best_f}')
