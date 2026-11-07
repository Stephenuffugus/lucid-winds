#!/usr/bin/env python3
"""Astra's Tomato Man THE RUN pack (7 Nov 2026, TOMATO_MAN_RUN_BUILD_PLAN.md chapter 8) into the clone's art folder. Re runnable;
overwrites what it made.

    python3 tools/tomato-man-tests/astra_run_in.py [pack_dir]      default the session's intake folder

Her units (NOTES.md): 2 source px per world or CSS px; WebP sheets of discrete cells; each frame's cell local anchor in
anchors.json; the page draws a cell at half size with its anchor on the world point (cellAt, the gameplay pack's rule).
The sheets go to art/run/<id>.webp; the SVG marks (tm-mote, tm-gull, tm-crab, the five tm-mile-* and tm-mile) into a
TM RUN ICONS block beside the gameplay one; the plate and ornament SVGs into art/ui/; the fits (cells, anchors, durations)
into the page between TM RUN FITS markers as RP, merged into GP so cellAt draws them. The markers are made the first time."""
import os, re, json, shutil, sys
PACK = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-1000/-workspaces-lucid-winds/45e1b9ca-45df-472b-bd2e-02db33d7308c/scratchpad/tm-run'
GAME = '/workspaces/Tomato_Man'
A = os.path.join(PACK, 'assets')
SHEETS = {
  'mote': 'a_critters/mote.webp', 'gull_fly': 'a_critters/gull_fly.webp', 'gull_swoop': 'a_critters/gull_swoop.webp', 'gull_hit': 'a_critters/gull_hit.webp',
  'gull_knocked': 'a_critters/gull_knocked.webp', 'gull_carry': 'a_critters/gull_carry.webp', 'crab_walk': 'a_critters/crab_walk.webp', 'crab_pinned': 'a_critters/crab_pinned.webp',
  'crab_flipped': 'a_critters/crab_flipped.webp', 'burn_line': 'b_sand/burn_line.webp', 'seed_pod': 'b_sand/seed_pod.webp',
  'run_badge_0': 'c_face/run_badge_0.webp', 'run_badge_1': 'c_face/run_badge_1.webp', 'run_badge_2': 'c_face/run_badge_2.webp', 'run_badge_3': 'c_face/run_badge_3.webp', 'run_badge_4': 'c_face/run_badge_4.webp',
  'run_card_ornament': 'c_face/run_card_ornament.webp',
}
UI_SVG = ['c_face/run_plate_ready.svg', 'c_face/run_plate_pressed.svg', 'c_face/run_plate_disabled.svg', 'c_face/run_card_ornament.svg']
total = 0
os.makedirs(os.path.join(GAME, 'art', 'run'), exist_ok=True)
for k, rel in SHEETS.items():
    dst = os.path.join(GAME, 'art', 'run', k + '.webp'); shutil.copyfile(os.path.join(A, rel), dst); total += os.path.getsize(dst)
for rel in UI_SVG:
    dst = os.path.join(GAME, 'art', 'ui', os.path.basename(rel)); shutil.copyfile(os.path.join(A, rel), dst); total += os.path.getsize(dst)
man = {f['file']: f for f in json.load(open(os.path.join(PACK, 'manifest.json')))['files']}
anc = {f['file']: f for f in json.load(open(os.path.join(PACK, 'anchors.json')))['files']}
RP = {}
for k, rel in SHEETS.items():
    m = man['assets/' + rel]; a = anc['assets/' + rel]
    g = m.get('grid') or {'columns': 1, 'rows': 1, 'cell_width': m['size'][0], 'cell_height': m['size'][1]}
    fr0 = a['frames'][0]
    RP[k] = {'c': g['columns'], 'w': g['cell_width'], 'h': g['cell_height'], 'ax': fr0['anchor'][0], 'ay': fr0['anchor'][1], 'ms': m.get('durations', [0])}
    for extra in ('sprout_root', 'beak_anchor'):
        if extra in a: RP[k][extra.split('_')[0]] = a[extra]
page = os.path.join(GAME, 'index.html'); h = open(page).read()
a1, b1 = '/* TM RUN FITS (lucid-winds tools/tomato-man-tests/astra_run_in.py writes this line) */', '/* /TM RUN FITS */'
if a1 not in h:
    g1 = '/* /TM GAMEPLAY FITS */'
    assert g1 in h, 'no gameplay fits block to sit beside'
    h = h.replace(g1, g1 + '\n' + a1 + '\n' + b1, 1)
i, j = h.index(a1) + len(a1), h.index(b1)
h = h[:i] + '\nconst RP=' + json.dumps(RP, separators=(',', ':')) + '; Object.assign(GP,RP);\n' + h[j:]
# the marks: her three critter cues, the five mile marks and the generic one (the bundle's own symbols)
syms = []
for n in ('mote', 'gull', 'crab'):
    svg = open(os.path.join(A, 'a_critters', 'tm-%s.svg' % n)).read()
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
    inner = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', svg, flags=re.S).strip()
    inner = re.sub(r'<symbol[^>]*>|</symbol>', '', inner)
    syms.append('<symbol id="tm-%s" viewBox="%s">%s</symbol>' % (n, vb, inner))
mile = open(os.path.join(A, 'c_face', 'tm-mile.svg')).read()
for sm in re.findall(r'<symbol id="tm-mile[^"]*"[^>]*>.*?</symbol>', mile, flags=re.S): syms.append(sm)
a2, b2 = '<!-- TM RUN ICONS (astra_run_in.py writes this line) -->', '<!-- /TM RUN ICONS -->'
if a2 not in h:
    g2 = '<!-- /TM GAMEPLAY ICONS -->'
    assert g2 in h
    h = h.replace(g2, g2 + '\n' + a2 + '\n' + b2, 1)
i, j = h.index(a2) + len(a2), h.index(b2)
h = h[:i] + '\n<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' + ''.join(syms) + '</svg>\n' + h[j:]
open(page, 'w').write(h)
print('run art: %d sheets, %d ui svgs, %d KB; fits for %d sheets; %d marks (%s)' % (len(SHEETS), len(UI_SVG), total // 1024, len(RP), len(syms), ', '.join(re.search(r'id="([^"]+)"', s).group(1) for s in syms)))
