#!/usr/bin/env python3
"""Hub R2, the image diet. Idempotent.

For every image index.html references that is over 150 KB (and every file behind a path the code builds at
run time, e.g. 'assets/items/' + key + '.png', when any file there is over 150 KB) write a .webp beside it,
sized to about three times its largest drawn size, quality 82, alpha kept. Originals are never touched.
Then point index.html at the .webp files. Run from the repo root:  python3 scripts/hub_image_diet.py
"""
import glob, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'index.html')
MIN = 150 * 1024
EXT = ('.png', '.jpg', '.jpeg')
# Paths the code builds at run time: the literal prefix before the variable.
DYNAMIC = ['symbols/symbol-', 'mutations/mutation-', 'fx/', 'boosters/', 'nursery-pots/', 'seeds/seed-', 'dice/d',
           'games/sokoban/', 'games/category-banners/', 'character-sheet/classes/', 'character-sheet/tools/',
           'foraging/el-', 'companions/', 'weather/weather-', 'icons/', 'seasons/', 'items/', 'trophies/', 'bos/scroll-']
LARGE = re.compile(r'(category-banners|backgrounds/|bg-|backdrop|biome|screens/|splash|book|cover|/grid\.|frame|header|banner|hermitportrait)', re.I)
SMALL = re.compile(r'(btn-|-btn|fab|arrow|icons/|fx/|dice/|nav-|seals/|minesweeper/|sokoban/|memory/)', re.I)

def cap_for(rel):
    if LARGE.search(rel): return 1080
    if SMALL.search(rel): return 384
    return 768

def webp_of(rel):
    return re.sub(r'\.(png|jpe?g)$', '.webp', rel, flags=re.I)

def convert(rel):
    src = os.path.join(ROOT, rel); dst = os.path.join(ROOT, webp_of(rel))
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src): return False
    im = Image.open(src); im.load()
    alpha = im.mode in ('RGBA', 'LA', 'PA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if alpha else 'RGB')
    cap = cap_for(rel); w, h = im.size; s = min(1.0, float(cap) / max(w, h))
    if s < 1.0: im = im.resize((max(1, int(round(w * s))), max(1, int(round(h * s)))), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=82, method=6)
    return True

def main():
    os.chdir(ROOT)
    text = open(HTML, encoding='utf-8').read()
    lit = sorted(set(m.group(0) for m in re.finditer(r'(?:portal-)?assets/[A-Za-z0-9_./-]+\.(?:png|jpe?g)(?![A-Za-z0-9_])', text)))
    todo = set(r for r in lit if os.path.isfile(r) and os.path.getsize(r) > MIN)
    dyn_ok = []
    for pre in DYNAMIC:
        fs = [f for f in glob.glob('assets/' + pre + '*') if os.path.isfile(f) and f.lower().endswith(EXT) and '/' not in f[len('assets/' + pre):]]
        if any(os.path.getsize(f) > MIN for f in fs):
            todo.update(fs); dyn_ok.append(pre)
    made = 0
    for rel in sorted(todo):
        if convert(rel): made += 1
    # 1. literal paths
    def lit_sub(m):
        r = m.group(0)
        return webp_of(r) if r in todo else r
    new = re.sub(r'(?:portal-)?assets/[A-Za-z0-9_./-]+\.(?:png|jpe?g)(?![A-Za-z0-9_])', lit_sub, text)
    # 2. built paths: the first image suffix after each prefix occurrence, within the same expression
    n_dyn = 0
    for pre in dyn_ok:
        pat = re.compile(r'(assets/' + re.escape(pre) + r"['\"]\s*\+[^;\n]{0,80}?)\.(png|jpe?g)(?![A-Za-z0-9_])")
        new, k = pat.subn(lambda m: m.group(1) + '.webp', new); n_dyn += k
    old_b = sum(os.path.getsize(r) for r in todo); new_b = sum(os.path.getsize(webp_of(r)) for r in todo)
    if new != text: open(HTML, 'w', encoding='utf-8').write(new)
    print('files %d (new webp %d)  %.1f MB -> %.1f MB  built-path swaps %d  index.html %s' % (len(todo), made, old_b / 1e6, new_b / 1e6, n_dyn, 'changed' if new != text else 'unchanged'))

if __name__ == '__main__':
    main()
