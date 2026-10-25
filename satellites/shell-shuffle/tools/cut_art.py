#!/usr/bin/env python3
"""Cut Astra's Shell Shuffle return into the WebP set the page loads (Part 1, plans/shell-shuffle/BUILD-PLAN-OCT25.md).
Run:  python3 -I satellites/shell-shuffle/tools/cut_art.py <extracted zip dir> [out dir]   (out defaults to ../art/s1)

Her originals are never touched. Cut outs get the Part A bleed (satellites/slice-3d/tools/cut_art.py: transparent and
edge pixels take the nearest solid colour, so no matte fringe and no dark mip halo). Painted pieces carry margins, so
every cup's visible box and painted FOOT (the bottom of its visible box as a fraction of the height) is measured on the
saved file and written to art.json: the page stands the cups on their feet, never on the canvas edge.
Fails if the boot set (the plate, the mat, the glow, one cup, the marble, the logo) is over 700 KB."""
import importlib.util, json, os, sys
from PIL import Image

SRC = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, '..', 'art', 's1')
spec = importlib.util.spec_from_file_location('slicecut', os.path.join(HERE, '..', '..', 'slice-3d', 'tools', 'cut_art.py'))
slicecut = importlib.util.module_from_spec(spec); spec.loader.exec_module(slicecut)
bleed, bbox = slicecut.bleed, slicecut.bbox
BOOT_BUDGET = 700 * 1024
sizes, art = {}, {'version': 's1', 'cups': {}, 'scenes': {}, 'files': {}}

def save(im, rel, q=82, alpha=True):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if alpha and im.mode == 'RGBA':
        im.save(p, 'WEBP', quality=q, method=6, alpha_quality=90)
    else:
        im.convert('RGB').save(p, 'WEBP', quality=q, method=6)
    sizes[rel] = os.path.getsize(p); art['files'][rel] = sizes[rel]
    return rel

def src(*p): return os.path.join(SRC, *p)

# the four scenes (only table_main loads at boot) and a 540 x 960 twin for phones under 2x
for n in ('table_main', 'table_02', 'table_03', 'table_04'):
    im = Image.open(src('scene', n + '.jpg')).convert('RGB')
    art['scenes'][n] = {'big': save(im.resize((900, 1600), Image.LANCZOS), 'scene/%s.webp' % n, q=80, alpha=False),
                        'small': save(im.resize((540, 960), Image.LANCZOS), 'scene/%s_540.webp' % n, q=80, alpha=False)}
# the mat and the lamp glow (the glow keeps its whole canvas: it is a soft falloff, cropped it would draw a square)
save(bleed(Image.open(src('scene', 'mat.png'))).resize((420, 120), Image.LANCZOS), 'scene/mat.webp', q=85)
save(Image.open(src('scene', 'lamp_glow.png')).convert('RGBA').resize((450, 450), Image.LANCZOS), 'scene/lamp_glow.webp', q=85)
# the cups: the four of the game (house is new, the default for a fresh save) and her three extra (not wired: his call)
cups = [('house', 'cups/cup_house.png'), ('sunset', 'cups/cup_sunset.png'), ('moonlit', 'cups/cup_moonlit.png'), ('forest', 'cups/cup_forest.png'),
        ('starlight', 'extras/cups/cup_starlight.png'), ('honey', 'extras/cups/cup_honey.png'), ('cat', 'extras/cups/cup_cat.png')]
for cid, f in cups:
    rel = save(bleed(Image.open(src(*f.split('/')))).resize((260, 300), Image.LANCZOS), 'cups/%s.webp' % cid, q=85)
    b = bbox(Image.open(os.path.join(OUT, rel)).convert('RGBA'))
    art['cups'][cid] = {'file': rel, 'w': 260, 'h': 300, 'box': list(b), 'foot': round(b[3] / 300, 4), 'aspect': round(300 / 260, 4)}
save(bleed(Image.open(src('cups', 'cup_inner.png'))).resize((260, 150), Image.LANCZOS), 'cups/inner.webp', q=85)
# the house marble and its glints
save(bleed(Image.open(src('balls', 'ball_house.png'))).resize((96, 96), Image.LANCZOS), 'balls/house.webp', q=85)
for i in range(1, 5):
    save(Image.open(src('balls', 'ball_glint_%02d.png' % i)).convert('RGBA').resize((96, 96), Image.LANCZOS), 'balls/glint_%02d.webp' % i, q=85)
# the logo, and the title plate only as the share card (og/, a centred 1200 x 630 band)
save(bleed(Image.open(src('ui', 'logo.png'))).resize((600, 250), Image.LANCZOS), 'ui/logo.webp', q=85)
tp = Image.open(src('ui', 'title_plate.jpg')).convert('RGB'); w = tp.width; h = round(w * 630 / 1200); top = (tp.height - h) // 3
og = os.path.join(OUT, '..', '..', 'og', 'card-s1.jpg'); os.makedirs(os.path.dirname(og), exist_ok=True)
tp.crop((0, top, w, top + h)).resize((1200, 630), Image.LANCZOS).save(og, 'JPEG', quality=84, optimize=True, progressive=True)

with open(os.path.join(OUT, 'art.json'), 'w') as fh:
    json.dump(art, fh, indent=1, sort_keys=True)
boot = ['scene/table_main.webp', 'scene/mat.webp', 'scene/lamp_glow.webp', 'cups/house.webp', 'balls/house.webp', 'ui/logo.webp']
bt = sum(sizes[k] for k in boot)
for k in sorted(sizes): print('%7.1f KB  %s' % (sizes[k] / 1024, k))
for cid, c in art['cups'].items(): print('%-9s foot %.4f box %s' % (cid, c['foot'], c['box']))
print('boot set %.1f KB (budget %.0f KB), all %.1f KB, og %s' % (bt / 1024, BOOT_BUDGET / 1024, sum(sizes.values()) / 1024, os.path.relpath(og)))
if bt > BOOT_BUDGET:
    print('FAIL: boot set over budget'); sys.exit(1)
print('PASS')
