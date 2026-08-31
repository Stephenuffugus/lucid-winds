#!/usr/bin/env python3
"""artsupport - cuts the support-art sheets: decals, emblems, arena floors.

    python3 tools/artsupport.py /path/to/dir-of-sheets

Three destinations, three rules:

- DECALS -> assets/decals/<id>.webp, 256px. Only ids the game's decal
  catalogue knows. The game tints these with the finish colour at draw
  time (multiply), so they stay in their natural carved-stone grey here.
- EMBLEMS -> assets/emblems/<name>.webp, 320px. A BANK, wired to
  nothing: ~30 carved motifs that arrived instead of the UI glyph
  sheets. Beautiful, one style, and a future decal expansion or league
  emblem system can shop here. Cutting them now costs nothing later.
- ARENAS -> assets/arenas/<mode>.webp, 1024px full frame webp q82.
  No cutting: these are full-frame floors the game draws under its own
  information marks (rail, ridge, pockets, targets).

Mappings are by the ChatGPT export's opaque basename, verified by eye
against the sheet queue in the restart handoff. A sheet that yields a
different count than its mapping is a hard error, same law as artsheet.
"""
import os, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import artsheet   # key_and_defringe + find_parts, the proven magenta cutter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DECALS_D = os.path.join(ROOT, 'assets', 'decals')
EMBLEMS_D = os.path.join(ROOT, 'assets', 'emblems')
ARENAS_D = os.path.join(ROOT, 'assets', 'arenas')

# basename prefix -> (kind, names row-major | mode name)
SHEETS = {
    # the four gameplay floors
    'file_00000000131081f5': ('arena', 'pangkah'),
    'file_0000000045b081f5': ('arena', 'uri'),
    # taya remapped Aug 31: the old take (e33c) painted three pockets the
    # sim does not have; the corrected pocket-free dish rides the same
    # dirt-and-rail family. rim recalibrated 0.450 -> 0.455 in play-shell.
    'file_00000000ca7c81f5': ('arena', 'taya'),
    # range REMOVED from the auto-cut Aug 31: the old take (9e3c) painted
    # four rail gates and no bands. assets/arenas/range.webp is now HAND
    # DERIVED (tools/detext_range.py polar-clones the baked ruler text out
    # of the corrected five-band take, then keys its magenta ground to
    # alpha) — re-adding a mapping here would silently regress it.
    # decal sheet B, exactly as specified
    'file_00000000a46c81f5': ('cut', [('decal','moth'),('decal','flame'),('decal','crane'),
                                      ('decal','chalk'),('decal','knot')]),
    # the emblem drift - sun and wave are legitimate decals, the rest bank
    'file_000000009fcc81f5': ('cut', [('decal','sunburst'),('emblem','moon'),('emblem','raven'),
                                      ('decal','wave'),('emblem','branch')]),
    'file_0000000016f081f5': ('cut', [('emblem','dragon'),('emblem','key'),('emblem','anchor'),
                                      ('emblem','star'),('emblem','laurel')]),
    'file_0000000028a881f5': ('cut', [('emblem','oakleaf'),('emblem','anchor2'),('emblem','owl'),
                                      ('emblem','star2'),('emblem','ammonite')]),
    'file_000000005e2481f5': ('cut', [('emblem','swallow'),('emblem','amphora'),('emblem','harp'),
                                      ('emblem','lotus'),('emblem','raven2')]),
    'file_00000000ac0081f5': ('cut', [('emblem','horseshoe'),('emblem','scallop'),('emblem','column'),
                                      ('emblem','feather'),('emblem','window')]),
    'file_00000000ca4c81f5': ('cut', [('emblem','griffin'),('emblem','compassrose'),('emblem','bellarch'),
                                      ('emblem','capital'),('emblem','laurel2')]),
    'file_00000000cb7c81f5': ('cut', [('emblem','lion'),('emblem','crown'),('emblem','snake'),
                                      ('emblem','tower'),('emblem','owl2'),('emblem','sunface')]),
    'file_00000000cd9c81f5': ('cut', [('emblem','moth2'),('emblem','flame2'),('emblem','crane2'),
                                      ('emblem','chalkstick'),('emblem','knot2')]),
    # The real UI sheets from the Aug 31 drop, ALL on clean magenta with no
    # text: Sheet 11 slot glyphs (mechanical, gunmetal), Sheet 12 trigger
    # glyphs (carved stone + gold, one per trigger name, row-major per the
    # recovery handoff), Sheet 14 physics FX ingredients. Banked as singles
    # ready to wire; nothing consumes them yet.
    'file_00000000234081fd': ('grid', [(3,2),[('glyph','slot-core'),('glyph','slot-blade'),('glyph','slot-assist'),
                                              ('glyph','slot-ratchet'),('glyph','slot-bit'),('glyph','slot-weight')]]),
    'file_00000000d1c881f5': ('grid', [(3,3),[('glyph','trig-charged'),('glyph','trig-lowspin'),('glyph','trig-thirdhit'),
                                              ('glyph','trig-onridge'),('glyph','trig-behind'),('glyph','trig-firstblood'),
                                              ('glyph','trig-cornered'),('glyph','trig-mirror'),('glyph','trig-late')]]),
    'file_000000002cec81f5': ('grid', [(4,2),[('fx','spinring'),('fx','wobble'),('fx','spark-low'),('fx','spark-med'),
                                              ('fx','spark-high'),('fx','railstreak'),('fx','burst'),('fx','dust')]]),
    # Decal Sheet A's missing four ("stripe, koi, tiger, and circuit were
    # later generated together on magenta" per the recovery handoff; the claw
    # scratch IS stripe, a tiger-stripe rake). 'quad' not 'cut': the claw is
    # FOUR disconnected rake marks, so the component finder shatters it
    # (7 parts found for 4 assets); a 2x2 grid cuts honestly by quadrant.
    'file_00000000fd5081f5': ('quad', [('decal','stripe'),('decal','koi'),
                                       ('decal','tiger'),('decal','circuit')]),
}
GLYPHS_D = os.path.join(ROOT, 'assets', 'glyphs')
FX_D = os.path.join(ROOT, 'assets', 'fx')
SIZES = {'decal': 256, 'emblem': 320, 'glyph': 256, 'fx': 320}
DEST = {'decal': DECALS_D, 'emblem': EMBLEMS_D, 'glyph': GLYPHS_D, 'fx': FX_D}

def square(im, side):
    im = im.copy()
    im.thumbnail((int(side*0.94), int(side*0.94)), Image.LANCZOS)
    c = Image.new('RGBA', (side, side), (0,0,0,0))
    c.paste(im, ((side-im.width)//2, (side-im.height)//2), im)
    return c

def main(indir):
    for d in (DECALS_D, EMBLEMS_D, ARENAS_D, GLYPHS_D, FX_D):
        os.makedirs(d, exist_ok=True)
    files = {f: os.path.join(indir, f) for f in os.listdir(indir) if f.endswith('.png')}
    done, failed = 0, False
    for prefix, (kind, spec) in SHEETS.items():
        src = next((p for f, p in files.items() if f.startswith(prefix)), None)
        if not src:
            print('MISSING sheet', prefix); failed = True; continue
        if kind == 'arena':
            im = Image.open(src).convert('RGB')
            im.thumbnail((1024, 1024), Image.LANCZOS)
            im.save(os.path.join(ARENAS_D, spec + '.webp'), 'WEBP', quality=82, method=6)
            print('arena %-8s <- %s' % (spec, os.path.basename(src)[:28]))
            done += 1
            continue
        keyed, _ = artsheet.key_and_defringe(Image.open(src))
        import numpy as np
        if kind == 'quad' or kind == 'grid':
            # Grid cut: each cell's own alpha bbox, no component finding — for
            # sheets whose assets are made of DISCONNECTED pieces (a claw's
            # rake marks, a broken chain, scattered debris) that shatter the
            # component finder. 'quad' is the 2x2 case; 'grid' carries its own
            # (cols, rows) ahead of the names.
            if kind == 'grid':
                cols, rows = spec[0]; spec = spec[1]
            else:
                cols, rows = 2, 2
            a = np.asarray(keyed)[:, :, 3]
            CH, CW = a.shape[0] // rows, a.shape[1] // cols
            boxes = []
            for qy in range(rows):
                for qx in range(cols):
                    cell = a[qy*CH:(qy+1)*CH, qx*CW:(qx+1)*CW]
                    ys, xs = np.nonzero(cell > 8)
                    if not len(ys):
                        print('ERROR %s: empty cell %d,%d' % (prefix, qx, qy))
                        failed = True; boxes = None; break
                    boxes.append((qx*CW+xs.min(), qy*CH+ys.min(),
                                  qx*CW+xs.max()+1, qy*CH+ys.max()+1, 0, 0))
                if boxes is None: break
            if boxes is None: continue
        else:
            boxes = artsheet.find_parts(np.asarray(keyed)[:, :, 3])
        if len(boxes) != len(spec):
            print('ERROR %s: %d parts found, %d named - nothing written'
                  % (prefix, len(boxes), len(spec)))
            failed = True; continue
        for (dkind, name), (x0, y0, x1, y1, _, _) in zip(spec, boxes):
            crop = keyed.crop((max(0,x0-6), max(0,y0-6),
                               min(keyed.width,x1+6), min(keyed.height,y1+6)))
            out = square(crop, SIZES[dkind])
            out.save(os.path.join(DEST[dkind], name + '.webp'), 'WEBP', quality=82, method=6)
            done += 1
        print('cut %-22s -> %s' % (os.path.basename(src)[:22],
              ' '.join(n for _, n in spec)))
    print('%d assets written%s' % (done, ', WITH ERRORS' if failed else ''))
    if failed: sys.exit(1)

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
