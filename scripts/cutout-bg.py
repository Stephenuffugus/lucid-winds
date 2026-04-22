#!/usr/bin/env python3
"""
cutout-bg.py — knock out backgrounds from sprites that were drawn with a
DARK outline around the artwork. The dark outline is the keep-line.

Usage:
    python3 scripts/cutout-bg.py SOURCE.png DEST.png [--keep-size]

    --keep-size  Skip the final tight-crop. Canvas stays at source size.

How it works:
1. Flood fill from the 4 corners. The flood keeps going through ANY pixel
   that is not obviously dark artwork. Threshold: pixel is "not dark" when
   brightness >= 140 AND chroma <= 55. This eats the whole halo of pale
   cream / grey / near-white pixels right up to the dark border line.
2. After the flood, a tidy-pass fades any still-bright low-chroma pixel
   that's adjacent to cleared space, so the result has a hard alpha edge
   instead of a feathered bright rim.
3. Trim transparent borders. Artwork is preserved at source resolution.

Tune TRIM_BRIGHT/TRIM_CHROMA if the halo gets too aggressive — if the
sprite has deliberately pale pastel interior that should stay, raise
TRIM_BRIGHT. For most items we want it to eat until it hits the dark rim.
"""

from PIL import Image
from collections import deque
import sys


# The flood-fill "erase" predicate. Anything brighter than TRIM_BRIGHT
# with low chroma is considered background-halo territory and gets
# cleared. Stops at dark pixels (the artwork outline) and colorful
# pixels (the artwork interior).
TRIM_BRIGHT = 140
TRIM_CHROMA = 55


def is_bg(p):
    r, g, b, a = p
    if a == 0:
        return True
    brightness = (r + g + b) / 3
    chroma = max(r, g, b) - min(r, g, b)
    return brightness >= TRIM_BRIGHT and chroma <= TRIM_CHROMA


def cutout(src_path, dst_path, keep_size=False):
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    print(f"Source: {w}x{h}")
    px = img.load()

    visited = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        if is_bg(px[x, 0]):
            q.append((x, 0)); visited[0][x] = True
        if is_bg(px[x, h - 1]):
            q.append((x, h - 1)); visited[h - 1][x] = True
    for y in range(h):
        if is_bg(px[0, y]):
            q.append((0, y)); visited[y][0] = True
        if is_bg(px[w - 1, y]):
            q.append((w - 1, y)); visited[y][w - 1] = True

    cleared = 0
    while q:
        x, y = q.popleft()
        cleared += 1
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                if is_bg(px[nx, ny]):
                    visited[ny][nx] = True
                    q.append((nx, ny))
    print(f"Connected bg cleared: {cleared} ({cleared / (w * h) * 100:.1f}%)")

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            op[x, y] = (0, 0, 0, 0) if visited[y][x] else px[x, y]

    # Tidy-pass: any pixel next to cleared region that's still bright AND
    # low-chroma gets faded out. Repeated so second-ring rim also dies.
    for _pass in range(3):
        halo = 0
        for y in range(h):
            for x in range(w):
                if visited[y][x]:
                    continue
                r, g, b, a = op[x, y]
                brightness = (r + g + b) / 3
                chroma = max(r, g, b) - min(r, g, b)
                # Loosened vs v1 — fades grey rim all the way to the dark outline
                if brightness < 165 or chroma > 50:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1),
                               (1, 1), (-1, -1), (1, -1), (-1, 1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and visited[ny][nx]:
                        new_a = a // 6
                        op[x, y] = (r, g, b, new_a)
                        if new_a < 12:
                            visited[y][x] = True
                            op[x, y] = (0, 0, 0, 0)
                        halo += 1
                        break
        print(f"Halo pass {_pass+1} softened: {halo}")

    if keep_size:
        trimmed = out
    else:
        bbox = out.getbbox()
        trimmed = out.crop(bbox) if bbox else out
    print(f"Final: {trimmed.size}")
    trimmed.save(dst_path, "PNG", optimize=True)
    print(f"Saved: {dst_path}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    if len(args) != 2:
        print("Usage: python3 scripts/cutout-bg.py SOURCE.png DEST.png [--keep-size]")
        sys.exit(1)
    cutout(args[0], args[1], keep_size=("--keep-size" in flags))
