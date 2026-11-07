#!/usr/bin/env python3
"""Astra's Tomato Man HERO pack (7 Nov 2026, TOMATO_MAN_RUN_BUILD_PLAN.md chapter 10) into the clone's art folder. Re runnable.

    python3 tools/tomato-man-tests/astra_hero_in.py [pack_dir]

Her sixty five bearing sheets (1024 by 512, 256 px cells, four by two: idle, four walk frames, the dash crouch, the dash
stretch, the hop; the face baked in) go to art/hero/<stem>_<bearing>.webp; her thirteen builder heads to art/builder/ (the
page's own file names, bell_pepper_head.webp among them); the planet's ten frames, its shadow and its cue mark to art/planet/.
The page's lazy asset table gains hero_<body>_<bearing> for the thirteen bodies (the body id bellpepper reads the stem
bell_pepper) and the planet's keys between TM HERO ASSETS markers (made the first time). The hat seats are the tomato's
HAT_ANCHOR table for every body (her anchors.json repeats it), so nothing else is written."""
import os, json, shutil, sys
PACK = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-1000/-workspaces-lucid-winds/45e1b9ca-45df-472b-bd2e-02db33d7308c/scratchpad/tm-hero'
GAME = '/workspaces/Tomato_Man'
A = os.path.join(PACK, 'assets')
BODIES = ['strawberry', 'orange', 'lemon', 'lime', 'peach', 'cherry', 'bellpepper', 'eggplant', 'avocado', 'heirloom', 'pickle', 'golden', 'sunburn']
STEM = {'bellpepper': 'bell_pepper'}
BEAR = ['s', 'se', 'e', 'ne', 'n']
total = 0; entries = []
for b in BODIES:
    st = STEM.get(b, b)
    for d in BEAR:
        src = os.path.join(A, 'a_bodies', 'hero', '%s_%s.webp' % (st, d)); dst = os.path.join(GAME, 'art', 'hero', '%s_%s.webp' % (st, d))
        shutil.copyfile(src, dst); total += os.path.getsize(dst)
        entries.append("hero_%s_%s:'art/hero/%s_%s.webp'" % (b, d, st, d))
for b in BODIES:
    st = STEM.get(b, b)
    src = os.path.join(A, 'c_builder', 'builder', '%s_head.webp' % st); dst = os.path.join(GAME, 'art', 'builder', '%s_head.webp' % st)
    shutil.copyfile(src, dst); total += os.path.getsize(dst)
os.makedirs(os.path.join(GAME, 'art', 'planet'), exist_ok=True)
for n in sorted(os.listdir(os.path.join(A, 'b_planet'))):
    shutil.copyfile(os.path.join(A, 'b_planet', n), os.path.join(GAME, 'art', 'planet', n)); total += os.path.getsize(os.path.join(GAME, 'art', 'planet', n))
    entries.append("%s:'art/planet/%s'" % (n[:-5].replace('-', '_'), n))
page = os.path.join(GAME, 'index.html'); h = open(page).read()
a1, b1 = '  /* TM HERO ASSETS (lucid-winds tools/tomato-man-tests/astra_hero_in.py writes this block) */', '  /* /TM HERO ASSETS */'
if a1 not in h:
    anchor = 'const ASSET_LAZY={\n'
    assert anchor in h
    h = h.replace(anchor, anchor + a1 + '\n' + b1 + '\n', 1)
i, j = h.index(a1) + len(a1), h.index(b1)
lines = []
for k in range(0, len(entries), 5): lines.append('  ' + ', '.join(entries[k:k + 5]) + ',')
h = h[:i] + '\n' + '\n'.join(lines) + '\n' + h[j:]
open(page, 'w').write(h)
print('hero art: %d sheets, 13 heads, %d planet files, %d KB; %d lazy keys' % (len(BODIES) * len(BEAR), len(os.listdir(os.path.join(A, 'b_planet'))), total // 1024, len(entries)))
