#!/usr/bin/env python3
"""Cut ONE remade frame (a single character on flat magenta, as the Frame Triage prompt asks ChatGPT for) into a game PNG.

    python3 scripts/cut_single.py remake.png --like assets/skins/soggy/ko.png --out /tmp/soggy-ko.png --contact /tmp/soggy-ko-look.png

Same keying as scripts/cut_sheet.py (measured key colour, border-connected background, soft edge, despill), so a remake
comes out exactly like its neighbours. Then: trim, 3 px pad, and scale so the HEIGHT matches the frame it replaces
(the game draws every frame at a fixed height, so height is the unit that keeps file sizes and sharpness consistent).
--contact writes old and new side by side on a dark and a light ground. OPEN IT. Count the limbs. Check the wardrobe.
It refuses an image whose border is not one flat key colour, and one where the figure touches the edge.
The remake prompt forbids pink in the art, so --depink (default on, never for a shield frame) removes key residue.
"""
import argparse, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cut_sheet as cs
from depink import depink


def cut_one(path, pad=3, t0=30, t1=62):
    rgb = np.array(Image.open(path).convert('RGB'))
    key = cs.find_key(rgb)
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]).astype(int)
    far = (np.abs(border - np.array(key)).sum(axis=1) > 90).mean()
    if far > 0.04:
        raise SystemExit('⛔ %s: %.0f%% of the border is not the key colour %s. Not a flat background, or the figure touches the edge.' % (path, far * 100, tuple(key)))
    alpha, _, _ = cs.background(rgb, key, t0, t1)
    keep, dropped = cs.despeckle(alpha > 0.5)
    keep, nd = cs.drop_key_residue(keep, rgb)
    if keep.sum() < 2000:
        raise SystemExit('⛔ %s: almost nothing left after keying. Is the character there?' % path)
    grown = ndimage.binary_dilation(keep, np.ones((3, 3)), iterations=2)
    alpha[~grown] = 0
    ys, xs = np.where(alpha > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    sub_a = alpha[y0:y1 + 1, x0:x1 + 1]
    sub_rgb = cs.despill(rgb[y0:y1 + 1, x0:x1 + 1], sub_a)
    h, w = sub_a.shape
    out = np.zeros((h + pad * 2, w + pad * 2, 4), np.uint8)
    out[pad:pad + h, pad:pad + w, :3] = sub_rgb
    out[pad:pad + h, pad:pad + w, 3] = (sub_a * 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), key, dropped + nd


def scale_to_height(im, H):
    if im.height == H: return im
    w = max(1, round(im.width * H / im.height))
    a = np.array(im).astype(np.float32); al = a[..., 3:4] / 255; a[..., :3] *= al           # premultiplied: no fringe
    s = np.stack([np.array(Image.fromarray(a[..., c]).resize((w, H), Image.LANCZOS)) for c in range(4)], -1)
    al2 = np.clip(s[..., 3:4], 0, 255); rgb = np.where(al2 > 0.5, s[..., :3] / np.maximum(al2 / 255, 1e-3), 0)
    return Image.fromarray(np.concatenate([np.clip(rgb, 0, 255), al2], -1).astype(np.uint8), 'RGBA')


def contact(old, new, path, cell=420):
    sheet = Image.new('RGB', (cell * 4, cell), (0, 0, 0))
    for i, (im, ground) in enumerate([(old, (24, 26, 32)), (new, (24, 26, 32)), (old, (170, 190, 205)), (new, (170, 190, 205))]):
        tile = Image.new('RGB', (cell, cell), ground); t = im.copy(); t.thumbnail((cell - 16, cell - 16), Image.LANCZOS)
        tile.paste(t, ((cell - t.width) // 2, (cell - t.height) // 2), t); sheet.paste(tile, (i * cell, 0))
    sheet.save(path); return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('--like', required=True, help='the live frame this replaces')
    ap.add_argument('--out', required=True); ap.add_argument('--contact')
    ap.add_argument('--no-depink', action='store_true', help='required for a shield frame')
    a = ap.parse_args()
    fr, key, dropped = cut_one(a.src)
    old = Image.open(a.like).convert('RGBA')
    fr = scale_to_height(fr, old.height)
    fr.save(a.out, optimize=True)
    if not a.no_depink:
        if os.path.basename(a.like) == 'shield.png': raise SystemExit('⛔ a shield frame: rerun with --no-depink')
        print('  depink (core, killed, orphans):', depink(a.out, a.out))
    new = Image.open(a.out)
    print('  key=%s  %dx%d -> %dx%d (old %dx%d)  aspect %.2f vs old %.2f%s' % (tuple(key), fr.width, fr.height, new.width, new.height, old.width, old.height,
          new.width / new.height, old.width / old.height, '  (%d specks dropped)' % dropped if dropped else ''))
    if new.width / new.height > 1.35 * old.width / old.height or new.width / new.height < 0.74 * old.width / old.height:
        print('  ⚠ the new frame has a very different shape from the old one: it will draw at a different size in the game. LOOK.')
    if a.contact: print('  contact ->', contact(old, new, a.contact), ' OPEN IT: old | new on dark, old | new on light')


if __name__ == '__main__':
    main()
