#!/usr/bin/env python3
"""
cutout-black-bg.py — knock out near-black backgrounds from sprites whose
artwork sits on a flat black plate. Used for gilded-frame icons.

Usage:
    python3 scripts/cutout-black-bg.py SOURCE.png DEST.png
    python3 scripts/cutout-black-bg.py SOURCE.png DEST_PREFIX --split
        (--split: extract every connected non-bg island as DEST_PREFIX_1.png ...)

Predicate: pixel is "background" when brightness < 32 AND chroma < 28.
That keeps the gold frame, the gem, and any colored interior intact and
only eats the truly-black surround.
"""

from PIL import Image
from collections import deque
import sys
import os


BRIGHT_MAX = 32
CHROMA_MAX = 28


def is_bg(r, g, b, a):
    if a == 0:
        return True
    brightness = (r + g + b) / 3
    chroma = max(r, g, b) - min(r, g, b)
    return brightness < BRIGHT_MAX and chroma < CHROMA_MAX


def flood_visited(img):
    w, h = img.size
    px = img.load()
    visited = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            r, g, b, a = px[x, y]
            if is_bg(r, g, b, a):
                q.append((x, y)); visited[y][x] = True
    for y in range(h):
        for x in (0, w - 1):
            r, g, b, a = px[x, y]
            if not visited[y][x] and is_bg(r, g, b, a):
                q.append((x, y)); visited[y][x] = True
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                r, g, b, a = px[nx, ny]
                if is_bg(r, g, b, a):
                    visited[ny][nx] = True
                    q.append((nx, ny))
    return visited


def apply_alpha(img, visited):
    w, h = img.size
    src = img.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            if not visited[y][x]:
                op[x, y] = src[x, y]
    return out


def find_islands(out_img):
    w, h = out_img.size
    px = out_img.load()
    seen = [[False] * w for _ in range(h)]
    islands = []
    for sy in range(h):
        for sx in range(w):
            if seen[sy][sx] or px[sx, sy][3] == 0:
                continue
            q = deque([(sx, sy)])
            seen[sy][sx] = True
            min_x = max_x = sx
            min_y = max_y = sy
            count = 0
            while q:
                x, y = q.popleft()
                count += 1
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx]:
                        if px[nx, ny][3] > 0:
                            seen[ny][nx] = True
                            q.append((nx, ny))
            if count > 5000:
                islands.append((min_x, min_y, max_x + 1, max_y + 1, count))
    islands.sort(key=lambda b: b[0])
    return islands


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    if len(args) != 2:
        print("Usage: cutout-black-bg.py SOURCE.png DEST.png [--split]")
        sys.exit(1)
    src_path, dst_path = args
    split = "--split" in flags

    img = Image.open(src_path).convert("RGBA")
    print(f"Source: {img.size}")
    visited = flood_visited(img)
    out = apply_alpha(img, visited)

    if split:
        islands = find_islands(out)
        print(f"Islands: {len(islands)}")
        base, ext = os.path.splitext(dst_path)
        if not ext:
            ext = ".png"
        for i, (x0, y0, x1, y1, count) in enumerate(islands, start=1):
            crop = out.crop((x0, y0, x1, y1))
            outp = f"{base}_{i}{ext}"
            crop.save(outp, "PNG", optimize=True)
            print(f"  {outp}: {crop.size} ({count}px)")
    else:
        bbox = out.getbbox()
        trimmed = out.crop(bbox) if bbox else out
        print(f"Final: {trimmed.size}")
        trimmed.save(dst_path, "PNG", optimize=True)
        print(f"Saved: {dst_path}")


if __name__ == "__main__":
    main()
