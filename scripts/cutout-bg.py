#!/usr/bin/env python3
"""
cutout-bg.py — knock out cream/white backgrounds from Midjourney sprites
without shrinking or destroying the artwork.

Usage:
    python3 scripts/cutout-bg.py SOURCE.png DEST.png

How it works:
1. Flood fill from the 4 corners — only pixels CONNECTED to the corners
   that match the cream-background heuristic get cleared. Anything inside
   the artwork is safe even if it shares a color with the background.
2. After the flood, soften any pixel adjacent to the cleared region that's
   still bright — kills the cream rim that remove.bg always leaves behind.
3. Trim transparent borders so the sprite is tightly cropped, but the
   resolution is otherwise preserved 1:1.

Background detection: brightness >= 225 AND chroma <= 22 (warm/cool greys
and creams both qualify; saturated colors stay).
"""

from PIL import Image
from collections import deque
import sys


def is_bg(p):
    r, g, b, a = p
    if a == 0:
        return True
    brightness = (r + g + b) / 3
    chroma = max(r, g, b) - min(r, g, b)
    # Tightened: catch warm cream rims as well as pure white
    return brightness >= 215 and chroma <= 30


def cutout(src_path, dst_path):
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

    # Two-pass halo cleanup: any pixel adjacent to the cleared region that's
    # still bright AND low-chroma gets faded out. Repeated once to catch the
    # second-ring rim that single-pass softening leaves behind.
    for _pass in range(2):
        halo = 0
        for y in range(h):
            for x in range(w):
                if visited[y][x]:
                    continue
                r, g, b, a = op[x, y]
                brightness = (r + g + b) / 3
                chroma = max(r, g, b) - min(r, g, b)
                if brightness < 200 or chroma > 35:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1),
                               (1, 1), (-1, -1), (1, -1), (-1, 1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and visited[ny][nx]:
                        # Drop alpha aggressively and mark this pixel as bg too
                        # so the next pass treats it as cleared territory
                        op[x, y] = (r, g, b, a // 4)
                        if a // 4 < 8:
                            visited[y][x] = True
                            op[x, y] = (0, 0, 0, 0)
                        halo += 1
                        break
        print(f"Halo pass {_pass+1} softened: {halo}")

    bbox = out.getbbox()
    trimmed = out.crop(bbox) if bbox else out
    print(f"Final: {trimmed.size}")
    trimmed.save(dst_path, "PNG", optimize=True)
    print(f"Saved: {dst_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 scripts/cutout-bg.py SOURCE.png DEST.png")
        sys.exit(1)
    cutout(sys.argv[1], sys.argv[2])
