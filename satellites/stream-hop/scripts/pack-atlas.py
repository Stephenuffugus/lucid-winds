#!/usr/bin/env python3
"""
JIMOTHY ART ATLAS PACKER (Lane D, 2026-09-16).

WHY: a first visit to Jimothy asked for 141 files, 122 of them small PNGs, and the host's CDN
punished the visitor's address for the burst (Sep 15 and 16). This packs every PNG in six art
folders into a few sheets so a first visit asks for a handful of files instead.

WHAT IT WRITES (re running it on unchanged input writes identical bytes):
  assets/atlas/<group>-<n>.png     the sheets
  assets/atlas/map.js              window.JIMOTHY_ATLAS, read synchronously by IMG() at boot
  scripts/atlas-manifest.json      sha1 of every source file and every sheet; test/jimothy-check.js
                                   goes red when a source changes and nobody re packed

TWO TIERS, so a first visit downloads no more art than it did before:
  BOOT  every frame the page asks for at boot, derived from index.html itself: the WARM list,
        the menu glyph wiring (the ic-* table) and every data-g attribute. Split in two groups:
        'menu' (ui + how, the image tags on the first screens, small so they appear early) and
        'play' (hero, powers, fx, sprites).
  LATER everything else, one group per folder, fetched only when one of its frames is asked for.

RULES THE LOADER DEPENDS ON:
  * no trimming: a frame's w and h equal its file's, so naturalWidth means what it always meant
  * integer placement, 2 px gutter; frames are copied 1:1, never scaled, so nothing bleeds
  * sheets at most 2048 x 1024 (8 MB decoded each; a full 2048 x 2048 play sheet measured 7 MB on disk, one
    long download and one long decode, so the play art is split across several medium sheets)
  * RGBA 8 bit only; the sources were checked Sep 16: 196 files, all RGBA 8 bit, no colour chunks

Usage (from satellites/stream-hop):  python3 scripts/pack-atlas.py
Prints the <script> tag for index.html; its ?a= must equal ARTV (the static gate checks it).
"""
import hashlib, json, os, re, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIRS = ['ui', 'how', 'hero', 'powers', 'fx', 'sprites']
MENU = ('ui', 'how')
MAXW, MAXH = 2048, 1024     # half height: a 7 MB sheet measured Sep 16 is one long all or nothing download on a weak signal
PAD = 2
OUT = os.path.join(ROOT, 'assets', 'atlas')


def sha1(path):
    with open(path, 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()


def boot_keys(page):
    """The frames a first visit asks for, read from the page, never from a measurement."""
    m = re.search(r"var WARM=\[(.*?)\];", page, re.S)
    if not m:
        sys.exit('pack-atlas: WARM list not found in index.html')
    warm = re.findall(r"'([^']+)'", m.group(1))
    m = re.search(r"\[\['ic-endless'.*?\]\]\.forEach", page, re.S)
    if not m:
        sys.exit('pack-atlas: the ic-* glyph table was not found in index.html')
    glyphs = ['ui/' + g for g in re.findall(r",'([^']+)'\]", m.group(0))]
    tags = re.findall(r'data-g="([^"]+)"', page)
    if len(warm) < 50 or len(glyphs) < 10 or len(tags) < 10:
        sys.exit('pack-atlas: boot lists look truncated (warm %d, glyphs %d, data-g %d)'
                 % (len(warm), len(glyphs), len(tags)))
    return set(warm) | set(glyphs) | set(tags)


def shelf_pack(frames, name):
    """frames: list of (key, w, h). Returns [(sheet_name, W, H, [(key, x, y, w, h)])]."""
    order = sorted(frames, key=lambda f: (-f[2], -f[1], f[0]))
    sheets, cur = [], []
    x = y = PAD
    row_h = 0
    used_w = 0
    for key, w, h in order:
        if w + 2 * PAD > MAXW or h + 2 * PAD > MAXH:
            sys.exit('pack-atlas: %s is %dx%d, larger than a sheet' % (key, w, h))
        if x + w + PAD > MAXW:          # next shelf
            y += row_h + PAD
            x, row_h = PAD, 0
        if y + h + PAD > MAXH:          # next sheet
            sheets.append((cur, used_w, y + row_h + PAD if row_h else y))
            cur, x, y, row_h, used_w = [], PAD, PAD, 0, 0
        cur.append((key, x, y, w, h))
        x += w + PAD
        row_h = max(row_h, h)
        used_w = max(used_w, x)
    if cur:
        sheets.append((cur, used_w, y + row_h + PAD))
    return [('%s-%d' % (name, i), W, H, placed) for i, (placed, W, H) in enumerate(sheets)]


def main():
    page = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    boot = boot_keys(page)
    groups = {}
    sources = {}
    for d in DIRS:
        for fn in sorted(os.listdir(os.path.join(ROOT, 'assets', d))):
            if not fn.endswith('.png'):
                continue
            key = d + '/' + fn[:-4]
            path = os.path.join(ROOT, 'assets', d, fn)
            im = Image.open(path)
            if im.mode != 'RGBA':
                sys.exit('pack-atlas: %s is %s, not RGBA; convert it or teach the packer' % (key, im.mode))
            sources[key] = (path, im.size)
            if key in boot:
                g = 'menu' if d in MENU else 'play'
            else:
                g = d + '-later'
            groups.setdefault(g, []).append((key, im.size[0], im.size[1]))

    os.makedirs(OUT, exist_ok=True)
    for old in os.listdir(OUT):                      # a group that shrank leaves no stale sheet behind
        if old.endswith('.png'):
            os.remove(os.path.join(OUT, old))

    frames, sheets, manifest = {}, {}, {'sources': {}, 'sheets': {}}
    order = ['menu', 'play'] + [d + '-later' for d in DIRS]
    for g in order:
        if g not in groups:
            continue
        for sname, W, H, placed in shelf_pack(groups[g], g):
            sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            for key, x, y, w, h in placed:
                src = Image.open(sources[key][0])
                sheet.paste(src, (x, y))              # paste, not alpha_composite: the bytes are copied as they are
                frames[key] = [sname, x, y, w, h]
            out = os.path.join(OUT, sname + '.png')
            sheet.save(out, optimize=True)
            sheets[sname] = {'w': W, 'h': H, 'boot': g in ('menu', 'play'), 'n': len(placed)}
            manifest['sheets'][sname] = sha1(out)

    missing = sorted(set(boot) & set(sources) - set(frames))
    if missing:
        sys.exit('pack-atlas: boot frames left out: %s' % missing)
    for key in sorted(sources):
        manifest['sources'][key] = sha1(sources[key][0])

    m = re.search(r"var ARTV='(\d+)'", page)
    artv = m.group(1) if m else '?'
    body = json.dumps({'sheets': {k: sheets[k] for k in sorted(sheets)},
                       'frames': {k: frames[k] for k in sorted(frames)}},
                      separators=(',', ':'), sort_keys=True)
    with open(os.path.join(OUT, 'map.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* generated by scripts/pack-atlas.py, never edit by hand. frames: key -> [sheet, x, y, w, h] */\n')
        f.write('window.JIMOTHY_ATLAS=' + body + ';\n')
    with open(os.path.join(ROOT, 'scripts', 'atlas-manifest.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(manifest, f, indent=1, sort_keys=True)
        f.write('\n')

    loose = sum(os.path.getsize(p) for p, _ in sources.values())
    boot_loose = sum(os.path.getsize(sources[k][0]) for k in sources if k in boot)
    packed = {s: os.path.getsize(os.path.join(OUT, s + '.png')) for s in sheets}
    boot_packed = sum(packed[s] for s in sheets if sheets[s]['boot'])
    print('frames %d (boot %d), sheets %d (boot %d)' % (len(frames), len([k for k in frames if k in boot]),
          len(sheets), len([s for s in sheets if sheets[s]['boot']])))
    for s in sorted(sheets):
        print('  %-18s %4dx%-4d %3d frames %9d bytes %s' % (s, sheets[s]['w'], sheets[s]['h'], sheets[s]['n'],
              packed[s], 'BOOT' if sheets[s]['boot'] else ''))
    print('bytes: all loose %d -> all sheets %d; boot loose %d -> boot sheets %d'
          % (loose, sum(packed.values()), boot_loose, boot_packed))
    print('index.html tag: <script src="assets/atlas/map.js?a=%s"></script>' % artv)


if __name__ == '__main__':
    main()
