#!/usr/bin/env python3
"""Tight-crop a gold-ringed circular FAB and make outside-circle pixels transparent.

Usage:
  python3 scripts/circle-crop.py SOURCE.png DEST.png

Strategy
  1. Threshold non-black pixels (brightness > 35) to find the artwork.
  2. Compute bbox of that mask (this catches the gold ring + soft halo).
  3. Re-fit a tighter bbox by stripping rows/cols whose only "content" is
     soft halo (brightness < 70) — that strips the outer glow but keeps
     the bright gold ring.
  4. Crop to a square bbox centered on that content.
  5. Apply a circular alpha mask sized just slightly larger than the
     gold ring so we keep a 1-2px feather but kill the black corners.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

if len(sys.argv) != 3:
    print("usage: circle-crop.py SOURCE.png DEST.png", file=sys.stderr)
    sys.exit(1)

src_path, dst_path = sys.argv[1], sys.argv[2]
im = Image.open(src_path).convert("RGBA")
w, h = im.size
px = im.load()

# Step 1: bright-pixel mask (gold ring + interior content)
def bright(p):
    r, g, b, _ = p
    return max(r, g, b)

# Step 2/3: find bbox of pixels brighter than the outer halo.
# Use a higher threshold (90) so we lock onto the gold ring itself,
# not the soft glow that bleeds out from it.
THRESH = 90
xs, ys = [], []
for y in range(h):
    for x in range(w):
        if bright(px[x, y]) >= THRESH:
            xs.append(x); ys.append(y)
if not xs:
    print("no bright pixels found", file=sys.stderr); sys.exit(2)

x0, x1 = min(xs), max(xs)
y0, y1 = min(ys), max(ys)
bw, bh = x1 - x0 + 1, y1 - y0 + 1
print(f"content bbox: ({x0},{y0}) -> ({x1},{y1})  size {bw}x{bh}")

# Square crop centered on bbox, side = max(bw, bh)
side = max(bw, bh)
cx = (x0 + x1) // 2
cy = (y0 + y1) // 2
# Add 1-pixel breathing room so the gold ring isn't shaved
pad = 2
side += pad * 2
left = cx - side // 2
top = cy - side // 2
# Clamp to image bounds
left = max(0, left); top = max(0, top)
right = min(w, left + side); bottom = min(h, top + side)
cropped = im.crop((left, top, right, bottom))
cw, ch = cropped.size
print(f"cropped to {cw}x{ch}")

# Apply circular alpha mask. Radius = half the smaller dim so we
# stay inside the crop. Use 4x supersampling on the mask edge for
# a clean anti-aliased rim.
SS = 4
big = (cw * SS, ch * SS)
mask = Image.new("L", big, 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((0, 0, big[0] - 1, big[1] - 1), fill=255)
mask = mask.resize((cw, ch), Image.LANCZOS)

# Combine with existing alpha — only AND, never OR (so already-transparent
# pixels stay transparent).
existing_alpha = cropped.split()[3]
combined = Image.new("L", (cw, ch))
ep = existing_alpha.load(); mp = mask.load(); cp = combined.load()
for y in range(ch):
    for x in range(cw):
        cp[x, y] = min(ep[x, y], mp[x, y])

cropped.putalpha(combined)
cropped.save(dst_path, "PNG", optimize=True)
print(f"wrote {dst_path}")
