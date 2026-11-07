#!/usr/bin/env python3
"""Astra's Tomato Man GAMEPLAY pack (the seed toss and the sun critters; 7 Nov 2026, TOMATO_MAN_RUN_BUILD_PLAN.md A2 and A3)
into the clone's art folder. Re runnable; overwrites what it made.

    python3 tools/tomato-man-tests/astra_gameplay_in.py [pack_dir]      default /workspaces/tomato-man-astra-gameplay/pack

Her units: 2 source px per world px, anchors in SOURCE px from each file's top left (anchors.json); the page draws a cell at
half its pixel size with the cell's anchor on the world point. The WebP sheets are copied as they are (all under 1600 px a
side) into art/gameplay/, the three SEED button SVGs into art/ui/, her three one colour marks (tm-seed, tm-scorpion,
tm-mirage) are appended inside the TM ICONS sprite (astra_in.py's writer leaves the block it writes; this adds a second
block GAMEPLAY ICONS beside it so either tool can run again). The frame grids and anchors go into the page between the
TM GAMEPLAY FITS markers as one constant, GP."""
import os, re, json, shutil, sys
PACK = sys.argv[1] if len(sys.argv) > 1 else '/workspaces/tomato-man-astra-gameplay/pack'
GAME = '/workspaces/Tomato_Man'
A = os.path.join(PACK, 'assets')
SHEETS = {  # key: (file, cols, rows)
  'seed_spin': 'a_seed/seed_spin.webp', 'seed_shadow': 'a_seed/seed_shadow.webp', 'sapling_sprout': 'a_seed/sapling_sprout.webp',
  'sapling_alive': 'a_seed/sapling_alive.webp', 'sapling_wilt': 'a_seed/sapling_wilt.webp', 'sapling_shade': 'a_seed/sapling_shade.webp',
  'seed_burst': 'a_seed/seed_burst.webp', 'landing_mark': 'a_seed/landing_mark.webp',
  'scorpion_run': 'b_critters/scorpion_run.webp', 'scorpion_pin': 'b_critters/scorpion_pin.webp', 'scorpion_charge': 'b_critters/scorpion_charge.webp',
  'scorpion_sink': 'b_critters/scorpion_sink.webp', 'scorpion_rise': 'b_critters/scorpion_rise.webp',
  'mirage_shimmer': 'b_critters/mirage_shimmer.webp', 'mirage_dissolve': 'b_critters/mirage_dissolve.webp', 'mirage_pin': 'b_critters/mirage_pin.webp',
  'sting': 'b_critters/sting.webp',
}
total = 0
os.makedirs(os.path.join(GAME, 'art', 'gameplay'), exist_ok=True)
for k, rel in SHEETS.items():
    dst = os.path.join(GAME, 'art', 'gameplay', k + '.webp'); shutil.copyfile(os.path.join(A, rel), dst); total += os.path.getsize(dst)
for st in ('ready', 'pressed', 'disabled'):
    dst = os.path.join(GAME, 'art', 'ui', 'button_seed_%s.svg' % st); shutil.copyfile(os.path.join(A, 'a_seed', 'button_seed_%s.svg' % st), dst); total += os.path.getsize(dst)
# the fits: per sheet the cell size, the anchor and the frame durations, from her manifest and anchors (source px)
man = {f['file']: f for f in json.load(open(os.path.join(PACK, 'manifest.json')))['files']}
anc = {f['file']: f for f in json.load(open(os.path.join(PACK, 'anchors.json')))['files']}
GP = {}
for k, rel in SHEETS.items():
    m = man['assets/' + rel]; a = anc['assets/' + rel]
    g = m.get('grid') or {'columns': 1, 'rows': 1, 'cell_width': m['size'][0], 'cell_height': m['size'][1]}
    GP[k] = {'c': g['columns'], 'w': g['cell_width'], 'h': g['cell_height'], 'ax': a['anchor'][0], 'ay': a['anchor'][1], 'ms': m.get('duration_ms', [0])}
    if 'sprout_root' in m: GP[k]['root'] = m['sprout_root']
page = os.path.join(GAME, 'index.html'); h = open(page).read()
a1, b1 = '/* TM GAMEPLAY FITS (lucid-winds tools/tomato-man-tests/astra_gameplay_in.py writes this line) */', '/* /TM GAMEPLAY FITS */'
if a1 in h:
    i, j = h.index(a1) + len(a1), h.index(b1)
    h = h[:i] + '\nconst GP=' + json.dumps(GP, separators=(',', ':')) + ';\n' + h[j:]
else: print('no TM GAMEPLAY FITS markers yet: fits not written')
# her three marks inside the page's sprite, in their own block
syms = []
for n in ('seed', 'scorpion', 'mirage'):
    svg = open(os.path.join(A, 'b_critters', 'tm-%s.svg' % n)).read()
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
    inner = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', svg, flags=re.S).strip()
    inner = re.sub(r'<symbol[^>]*>|</symbol>', '', inner)   # a standalone file may wrap its own symbol
    syms.append('<symbol id="tm-%s" viewBox="%s">%s</symbol>' % (n, vb, inner))
a2, b2 = '<!-- TM GAMEPLAY ICONS (astra_gameplay_in.py writes this line) -->', '<!-- /TM GAMEPLAY ICONS -->'
if a2 in h:
    i, j = h.index(a2) + len(a2), h.index(b2)
    h = h[:i] + '\n<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' + ''.join(syms) + '</svg>\n' + h[j:]
else: print('no TM GAMEPLAY ICONS markers yet: marks not written')
open(page, 'w').write(h)
print('gameplay art: %d sheets, 3 buttons, %d KB; fits for %d sheets; %d marks' % (len(SHEETS), total // 1024, len(GP), len(syms)))
