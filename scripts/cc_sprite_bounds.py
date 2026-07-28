#!/usr/bin/env python3
"""Measure the opaque content box of every Cosmic Cadets character/buddy sprite.

Why this exists
---------------
Cosmic Cadets (slug `seed-flutter`) drew the cadet with `_blit(im, x, y, 42)` —
scale to a fixed FILE height, aspect preserved. The art is framed inconsistently:
file sizes run from 98x182 to 267x196 and the transparent padding varies, so a
fixed file height produced characters between 24px and 90px wide on screen. The
same skin's own poses swung just as hard (metallic gold: idle 75 wide, flap 34,
settle 90), which is what "some sprites are smaller than others and don't flow
the same as the starting sprite" describes.

The fix is to normalise on the CONTENT diagonal and anchor on the CONTENT centre,
which needs the alpha bounding box of each file. This script measures them and
prints the `_CB` table that `satellites/seed-flutter/index.html` embeds.

    python3 scripts/cc_sprite_bounds.py            # print the table
    python3 scripts/cc_sprite_bounds.py --report   # human-readable audit

Re-run it whenever cadet or buddy art is added or recut, and paste the table back.
Requires pillow (`pip install pillow`).
"""
import glob
import math
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..",
                    "satellites", "seed-flutter", "assets")
ALPHA_FLOOR = 16          # ignore near-transparent glow when finding the box


def sprite_files():
    return (sorted(glob.glob(os.path.join(ROOT, "sprites", "comet_cadet*.png")))
            + sorted(glob.glob(os.path.join(ROOT, "cosmetics", "comet_*.png")))
            + sorted(glob.glob(os.path.join(ROOT, "cosmetics", "buddy_*.png"))))


def content_box(path):
    im = Image.open(path).convert("RGBA")
    mask = im.getchannel("A").point(lambda v: 255 if v > ALPHA_FLOOR else 0)
    return im.size, mask.getbbox()


def key_for(path):
    rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
    return rel[:-4]


def main():
    report = "--report" in sys.argv
    rows = []
    for p in sprite_files():
        size, bb = content_box(p)
        if not bb:
            print("EMPTY (all transparent): " + p, file=sys.stderr)
            continue
        rows.append((key_for(p), size, (bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1])))

    if report:
        base = next((r for r in rows if r[0] == "sprites/comet_cadet"), None)
        bd = math.hypot(base[2][2], base[2][3]) if base else 0
        print("%-44s %-9s %-9s %6s %7s" % ("sprite", "file", "content", "aspect", "diag"))
        for key, (w, h), (_, _, cw, ch) in rows:
            d = math.hypot(cw, ch)
            flag = ""
            if bd and (d < bd * 0.72 or d > bd * 1.38):
                flag = "  << far from the default cadet"
            print("%-44s %4dx%-4d %4dx%-4d %6.2f %7.1f%s"
                  % (key, w, h, cw, ch, cw / ch, d, flag))
        return

    parts = ["'%s':[%d,%d,%d,%d]" % (k, b[0], b[1], b[2], b[3]) for k, _, b in rows]
    lines, line = [], ""
    for part in parts:
        if len(line) + len(part) + 1 > 96:
            lines.append(line)
            line = ""
        line += ("," if line else "") + part
    if line:
        lines.append(line)
    print("var _CB={")
    for i, l in enumerate(lines):
        print(" " + l + ("," if i < len(lines) - 1 else ""))
    print("};")


if __name__ == "__main__":
    main()
