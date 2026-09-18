# Cut-fault detector for Jimothy character frames. Read-only. Run from satellites/stream-hop; mkdir -p /tmp/jim-audit first.
# 2026-09-18: it found 21 sliced frames, incl. ELEVEN skins whose shield dome is cut flat on the right (alien, astronaut,
# barnacle, chicken, disco, froggery, hazmat, mothman, robot...). Not fixed before release; recut after launch. Flags what a bad CUT looks like:
#  flat   = a long straight opaque run along the top/left/right image edge (a limb or hat sliced by the cell edge)
#  stray  = a small separate blob hugging an image edge with a flat side (a neighbour's leftover)
#  key    = leftover background: near-magenta pixels that are opaque, or a frame with no transparency at all
#  size   = a frame whose height is far off its own character's median (a mis-scaled or half cut)
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = 'assets'
groups = [('hero', 'hero')] + [('chars/' + d, d) for d in sorted(os.listdir(ROOT + '/chars')) if os.path.isdir(ROOT + '/chars/' + d)] + [('skins/' + d, d) for d in sorted(os.listdir(ROOT + '/skins')) if os.path.isdir(ROOT + '/skins/' + d)]
rows = []
for folder, cid in groups:
    files = sorted(f for f in os.listdir(os.path.join(ROOT, folder)) if f.endswith('.png'))
    hs = {}
    info = {}
    for f in files:
        im = Image.open(os.path.join(ROOT, folder, f)).convert('RGBA'); a = np.array(im); al = a[..., 3]
        m = al > 40; H, W = m.shape
        if not m.any(): rows.append((folder, f, 'empty', 99, '')); continue
        ys, xs = np.where(m); bh = ys.max() - ys.min() + 1; bw = xs.max() - xs.min() + 1
        hs[f] = bh
        flags = []; score = 0
        def longest(v):
            best = cur = 0
            for t in v:
                cur = cur + 1 if t else 0; best = max(best, cur)
            return best
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        for name, edge, n in (('top', m[y0, x0:x1 + 1], bw), ('left', m[y0:y1 + 1, x0], bh), ('right', m[y0:y1 + 1, x1], bh), ('bottom', m[y1, x0:x1 + 1], bw)):
            run = longest(edge)
            # a sliced limb is a long, perfectly straight run on the sprite's own outline; hard alpha right at the line
            lim = 0.13 if name != 'bottom' else 0.5
            if run >= max(12, lim * n):
                flags.append(f'flat-{name}:{run}px/{n}'); score += 3 if name != 'bottom' else 1
        lab, k = ndi.label(ndi.binary_dilation(m, iterations=3))
        if k > 1:
            sizes = ndi.sum(m, lab, range(1, k + 1)); main = sizes.argmax() + 1
            for i in range(1, k + 1):
                if i == main or sizes[i - 1] < 30: continue
                yy, xx = np.where((lab == i) & m)
                touch = [n for n, c in (('top', yy.min() == 0), ('left', xx.min() == 0), ('right', xx.max() == W - 1), ('bottom', yy.max() == H - 1)) if c]
                if touch:
                    side = touch[0]
                    edge = {'top': m[0, :] & (lab[0, :] == i), 'bottom': m[-1, :] & (lab[-1, :] == i), 'left': m[:, 0] & (lab[:, 0] == i), 'right': m[:, -1] & (lab[:, -1] == i)}[side]
                    if longest(edge) >= 6 and sizes[i - 1] < 0.12 * sizes[main - 1]: flags.append(f'stray-{side}:{int(sizes[i-1])}px'); score += 3
        r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
        mag = m & (r > 200) & (b > 200) & (g < 90)
        if mag.sum() > 60:
            # residue sits on the silhouette edge; painted pink FX sits anywhere. Count only edge pixels.
            edgeband = m & ~ndi.binary_erosion(m, iterations=2)
            e = int((mag & edgeband).sum())
            if e > 60: flags.append(f'key-magenta-edge:{e}px'); score += 2
        if (al == 255).all(): flags.append('key-no-transparency'); score += 5
        info[f] = (flags, score, (W, H))
    if hs:
        med = float(np.median(list(hs.values())))
        for f, bh in hs.items():
            if f in ('ko.png', 'sit.png', 'crouch.png', 'splash.png', 'dizzy.png', 'land.png'): continue
            if bh < 0.62 * med or bh > 1.5 * med: info[f][0].append(f'size:{bh}px vs median {int(med)}'); info[f] = (info[f][0], info[f][1] + 2, info[f][2])
    for f, (flags, score, wh) in info.items():
        if flags: rows.append((folder, f, ' '.join(flags), score, f'{wh[0]}x{wh[1]}'))
rows.sort(key=lambda r: -r[3])
json.dump(rows, open('/tmp/jim-audit/rows.json', 'w'))
print(len(rows), 'flagged frames of', sum(len([f for f in os.listdir(os.path.join(ROOT, g[0])) if f.endswith('.png')]) for g in groups))
for r in rows[:60]: print(f'{r[3]:>2}  {r[0]}/{r[1]:<14} {r[4]:<9} {r[2]}')
