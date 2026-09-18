# Remove leftover key colour (hot pink / magenta) from NAMED frames. Never touches a pixel that is not pink-hued.
# Written 2026-09-18 for the pre-release art pass (Stephen's frame review). Usage, from satellites/stream-hop:
#   printf 'skins/garage magnet\nchars/pigeon flee\n' > /tmp/jobs.txt && python3 scripts/depink.py /tmp/jobs.txt
#   results land in /tmp/jim-fix/after/ (mkdir -p /tmp/jim-fix/before /tmp/jim-fix/after first). LOOK at them on
#   a dark checker before copying into assets/, then bump ARTV.
# ⛔ Never run it on a SHIELD frame: the dome is violet with magenta sparks by design and it will punch holes.
# ⛔ Painted pink FX exist (speed lines, sparks). Only run it on frames a human has flagged.
# If a frame is missing PAINT (a face, a bandana, a dome), that is not residue: recut it from the source sheet
# with scripts/cut_sheet.py. Sources: lucid-winds-vault release backup-2026-07-29, vault-assets-20260729.tar,
# "Jimothy skins-20260723...zip" (sheets NNa/NNb per skin doc number; ⛔ Orca's 25a/25b are swapped) and
# vault-misc-20260729.tar art-drop5/0moreskins zip (the 13 later skins).
# Steps: 1) kill saturated pink/magenta pixels  2) grow only into pink-TINTED fringe next to what was killed
#        3) drop tiny islands that the removal orphaned (they were only ever attached through the pink)
import sys, os, colorsys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
def hsv(a):
    r, g, b = [a[..., i].astype(float) / 255 for i in range(3)]
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b); d = mx - mn
    h = np.zeros_like(mx); nz = d > 1e-6
    i = nz & (mx == r); h[i] = ((g - b)[i] / d[i]) % 6
    i = nz & (mx == g) & ~(mx == r); h[i] = (b - r)[i] / d[i] + 2
    i = nz & (mx == b) & ~(mx == r) & ~(mx == g); h[i] = (r - g)[i] / d[i] + 4
    return h * 60, np.where(mx > 0, d / np.maximum(mx, 1e-6), 0), mx
def depink(path, out, hue=(288, 348), s_min=0.5, v_min=0.5, fringe=2, orphan=90, extra=None):
    im = Image.open(path).convert('RGBA'); a = np.array(im); al = a[..., 3] > 0
    H, S, V = hsv(a)
    core = al & (H >= hue[0]) & (H <= hue[1]) & (S >= s_min) & (V >= v_min)
    if extra is not None: core |= al & extra(H, S, V, a)
    kill = core.copy()
    tint = al & (H >= hue[0] - 14) & (H <= hue[1] + 8) & (S >= 0.28) & (V >= 0.35)
    for _ in range(fringe): kill |= ndi.binary_dilation(kill) & tint
    before_lab, kb = ndi.label(al, structure=np.ones((3, 3)))
    keep = al & ~kill
    lab, k = ndi.label(keep, structure=np.ones((3, 3)))
    removed_orphans = 0
    if k > 1:
        sizes = ndi.sum(keep, lab, range(1, k + 1)); main = sizes.argmax() + 1
        near_kill = ndi.binary_dilation(kill, iterations=2)
        for i in range(1, k + 1):
            if i == main or sizes[i - 1] > orphan: continue
            comp = lab == i
            if (comp & near_kill).any():   # it touched the pink: it was residue's passenger, not a painted star
                keep &= ~comp; removed_orphans += int(sizes[i - 1])
    a[..., 3] = np.where(keep, a[..., 3], 0)
    Image.fromarray(a).save(out, optimize=True)
    return int(core.sum()), int(kill.sum()), removed_orphans
if __name__ == '__main__':
    jobs = [l.split() for l in open(sys.argv[1]) if l.strip() and not l.startswith('#')]
    for folder, f in jobs:
        src = f'assets/{folder}/{f}.png'; tag = folder.replace('/', '_') + '_' + f
        if not os.path.exists(f'/tmp/jim-fix/before/{tag}.png'): Image.open(src).save(f'/tmp/jim-fix/before/{tag}.png')
        print(tag, depink(f'/tmp/jim-fix/before/{tag}.png', f'/tmp/jim-fix/after/{tag}.png'))
