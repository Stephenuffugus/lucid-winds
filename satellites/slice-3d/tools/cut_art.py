#!/usr/bin/env python3
"""Super Slice 3D art pipeline (2026-10-23, plans/super-slice-3d/BUILD-PLAN-OCT23.md section 4).

Cuts Astra's Super Slice handoff (Super_Slice_Dev_Handoff.zip, vaulted as vault-20261023-super-slice-astra) into the
small WebP files the game loads, plus art/art.json describing them. Run with python3 -I (the zip is outside data):

    python3 -I satellites/slice-3d/tools/cut_art.py --src /tmp/claude-1000/ss/drop --out satellites/slice-3d/art
    python3 -I satellites/slice-3d/tools/cut_art.py --journey /tmp/claude-1000/journey-kit --out satellites/slice-3d/art   (Part H)

--src is the EXTRACTED zip (unzip once to the big /tmp disk; it is wiped at every codespace stop, re-extract from the
zip in assets/ or from the vault release). The script never edits the originals and fails over budget.

What it does to every cutout: trims to the alpha bounding box (plus a small pad), and recolours every edge and
transparent pixel from the nearest solid interior colour ("bleed"), so a matte fringe from the generator never shows
as a dark or coloured halo and mipmaps never pull transparent black into the edge.
"""
import argparse, json, os, sys, hashlib
from PIL import Image, ImageFilter, ImageChops, ImageMath

WORLDS = ['mossy_canyon', 'frost_chasm', 'ember_kiln', 'glowcave', 'orchard_loft', 'lantern_night', 'deep_tide', 'clockwork_well']
FRUIT = ['apple', 'orange', 'plum', 'banana', 'pineapple', 'watermelon', 'lime', 'kiwi', 'dragonfruit', 'starfruit',
         'pomegranate', 'coconut', 'pumpkin', 'turnip', 'pepper', 'honeydew']   # the game's FRUIT order
# Astra's knife ids -> the game's SKINS keys (the 22 that exist); the ten new ones keep Astra's id
KNIFE_KEY = {'classic_chef': 'classic', 'iron_cleaver': 'cleaver', 'rainbow_brush': 'paintbrush', 'bamboo_splitter': 'bamboo',
             'garden_trowel': 'trowel', 'feather_quill': 'quill', 'midnight_katana': 'katana', 'crystal_shard': 'crystal',
             'obsidian_flake': 'obsidian', 'icicle': 'icicle', 'tuning_fork': 'tuningfork', 'golden_fortune': 'gold',
             'ember_fang': 'emberfang', 'prism_edge': 'prism', 'moonlit_scythe': 'scythe', 'cosmic_edge': 'cosmicedge',
             'wallbreaker_pick': 'wallbreaker', 'depth_diver': 'depthdiver', 'combo_conductor': 'conductor',
             'groundskeeper': 'groundskeeper', 'starforge_blade': 'starforge', 'wolf_fang': 'wolffang',
             'socktopus': 'socktopus', 'butter_buddy': 'butterbuddy', 'sir_spatulot': 'spatulot', 'pencil_pusher': 'pencil',
             'disco_pickle': 'discopickle', 'cloud_croissant': 'croissant', 'rubber_duke': 'rubberduke',
             'banana_boomerang': 'boomerang', 'tea_rex': 'tearex', 'cosmic_custodian': 'custodian'}
VFX = ['juice_splat', 'slab_dust', 'sparks_stick', 'confetti', 'rope_cut', 'lantern_burst', 'pinata_burst', 'chime_ring',
       'bubble_pop', 'ice_crack']
BUDGET_WORLD = 2.5 * 1024 * 1024
BUDGET_SHARED = 4.0 * 1024 * 1024

def bbox(im, thr=24):
    a = im.split()[3].point(lambda v: 255 if v > thr else 0)
    return a.getbbox()

def bleed(im, strong=230):
    """Recolour every pixel below `strong` alpha from the average colour of the solid pixels around it. Alpha is kept."""
    im = im.convert('RGBA')
    r, g, b, a = im.split()
    m = a.point(lambda v: 255 if v >= strong else 0)
    if m.getbbox() is None:
        return im
    # premultiply the solid pixels' colour by the solid mask
    pr = ImageChops.multiply(r, m); pg = ImageChops.multiply(g, m); pb = ImageChops.multiply(b, m)
    fill_r, fill_g, fill_b = r.copy(), g.copy(), b.copy()
    done = m.copy()   # 255 where a colour is settled
    for rad in (1, 2, 4, 8, 16, 32, 64, 128):
        bm = m.filter(ImageFilter.BoxBlur(rad))
        if bm.getbbox() is None:
            continue
        br, bg, bb = (c.filter(ImageFilter.BoxBlur(rad)) for c in (pr, pg, pb))
        # colour = blurred premultiplied / blurred mask, per channel in float: the average solid colour nearby
        fm = bm.convert('F')
        cols = [ImageMath.lambda_eval(lambda A: A['convert'](A['min'](A['a'] * 255 / A['max'](A['m'], 1), 255), 'L'),
                                      a=c.convert('F'), m=fm) for c in (br, bg, bb)]   # Pillow 12: lambda_eval, no string eval
        newly = ImageChops.subtract(bm.point(lambda v: 255 if v > 0 else 0), done)   # covered now, not before
        if newly.getbbox() is None:
            continue
        fill_r.paste(cols[0], (0, 0), newly); fill_g.paste(cols[1], (0, 0), newly); fill_b.paste(cols[2], (0, 0), newly)
        done = ImageChops.lighter(done, newly)
        if ImageChops.invert(done).getbbox() is None:
            break
    # solid pixels keep their own colour
    fill_r.paste(r, (0, 0), m); fill_g.paste(g, (0, 0), m); fill_b.paste(b, (0, 0), m)
    return Image.merge('RGBA', (fill_r, fill_g, fill_b, a))

def trim(im, pad=4, thr=24):
    bb = bbox(im, thr)
    if not bb:
        return im, (0, 0, im.width, im.height)
    x0, y0, x1, y1 = max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad)
    return im.crop((x0, y0, x1, y1)), (x0, y0, x1, y1)

def flatten_columns(im):
    """Remove a baked left to right lighting ramp: every column is scaled to the tile's mean brightness."""
    im = im.convert('RGB'); L = im.convert('L')
    col = L.resize((im.width, 1), Image.BOX).resize((128, 1), Image.BOX).resize((im.width, 1), Image.BILINEAR)   # 4 px columns: the specular bands go too
    mean = sum(L.resize((1, 1), Image.BOX).getdata()) or 1
    gain = col.point(lambda v: max(1, v)).convert('F')
    out = []
    for ch in im.split():
        g = ImageMath.lambda_eval(lambda A: A['convert'](A['min'](A['c'] * mean / A['g'], 255), 'L'), c=ch.convert('F'), g=gain.resize(im.size))
        out.append(g)
    return Image.merge('RGB', out)

def heal_x(im, band=16):
    """Hide a hairline at the left/right wrap: move the seam to the middle, soften a narrow band across it, move it back."""
    im = im.convert('RGB'); w = im.width
    r = ImageChops.offset(im, w // 2, 0)
    strip = r.crop((w // 2 - band, 0, w // 2 + band, im.height)).filter(ImageFilter.BoxBlur(3))
    r.paste(strip, (w // 2 - band, 0))
    return ImageChops.offset(r, -(w // 2), 0)

def dull(im, bright, sat):
    from PIL import ImageEnhance
    return ImageEnhance.Brightness(ImageEnhance.Color(im.convert('RGB')).enhance(sat)).enhance(bright)

TILE_FIX = {'lantern_night/ledge': 'flatten', 'clockwork_well/ledge': 'crop489', 'deep_tide/ledge': 'heal'}
SLAB_FIX = {'frost_chasm': (12, 0.8, 1.0), 'lantern_night': (18, 1.0, 1.0), 'mossy_canyon': (0, 0.72, 0.7), 'deep_tide': (0, 0.7, 0.65)}

def fit(im, max_side):
    if max(im.size) <= max_side:
        return im
    s = max_side / max(im.size)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)

class Out:
    def __init__(self, root):
        self.root = root; self.sizes = {}
    def save(self, im, rel, q=82, alpha=True):
        p = os.path.join(self.root, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
        if alpha and im.mode == 'RGBA':
            im.save(p, 'WEBP', quality=q, method=6, alpha_quality=90)
        else:
            im.convert('RGB').save(p, 'WEBP', quality=q, method=6)
        self.sizes[rel] = os.path.getsize(p)
        return rel

# ---------------------------------------------------------------- Part H: the Journey kit (Astra, 25 Oct 2026)
# tiles: key -> (source, size, wrapped axes 'x'/'y'); cut outs: key -> (source, size)
J_TILES = {'j_grass': ('ground/grass_top.png', (512, 512), 'xy'), 'j_soil': ('ground/soil_face.png', (512, 128), 'x'),
           'j_bark': ('pieces/stump_bark.png', (256, 128), 'x'),   # up the trunk it MIRRORS (its rows do not wrap: 36 vs 5) 'j_stump_top': ('pieces/stump_top.png', (128, 128), ''),
           'j_shelf': ('pieces/shelf_cracked.png', (256, 64), ''), 'j_vine': ('pieces/vine.png', (32, 256), 'y'),
           'j_hills': ('backdrop/hills_far.png', (1024, 256), 'x')}
J_PROPS = {'j_tree_apple': ('trees/tree_apple.png', (384, 512)), 'j_tree_pear': ('trees/tree_pear.png', (384, 512)),
           'j_tree_plum': ('trees/tree_plum.png', (384, 512)), 'j_tree_poplar': ('trees/tree_poplar.png', (256, 512)),
           'j_tree_far': ('trees/tree_far.png', (384, 512)), 'j_bush_a': ('plants/bush_a.png', (256, 160)),
           'j_bush_b': ('plants/bush_b.png', (256, 160)), 'j_tuft_a': ('plants/tuft_a.png', (64, 64)),
           'j_tuft_b': ('plants/tuft_b.png', (64, 64)), 'j_flower_a': ('plants/flower_a.png', (64, 64)),
           'j_flower_b': ('plants/flower_b.png', (64, 64)), 'j_mushroom': ('pieces/mushroom.png', (256, 256)),
           'j_branch': ('pieces/branch.png', (512, 128)), 'j_flag': ('pieces/flag.png', (256, 160))}

def seam(im, axis):
    """The wrap check: the step from the last line back to the first, against the mean step between neighbours."""
    a = im.convert('L'); w, h = a.size; px = a.load()
    line = (lambda i: [px[i, y] for y in range(h)]) if axis == 'x' else (lambda i: [px[x, i] for x in range(w)])
    n = w if axis == 'x' else h
    d = lambda u, v: sum(abs(p - q) for p, q in zip(u, v)) / len(u)
    steps = [d(line(i), line(i + 1)) for i in range(0, n - 1, max(1, (n - 1) // 64))]
    return d(line(n - 1), line(0)), sum(steps) / len(steps)

def journey(kit, O, J):
    W = J['worlds'].setdefault('orchard_loft', {}); P = W.setdefault('props', {}); d = 'w/orchard_loft/'; bad = []
    for k, (f, size, wrap) in J_TILES.items():
        im = Image.open(os.path.join(kit, f)); alpha = im.mode == 'RGBA'; im = im.convert('RGBA' if alpha else 'RGB')
        # the intake measured each wrapped edge's first and last lines identical: one line off, so the repeat has no double line
        im = im.crop((0, 0, im.width - (1 if 'x' in wrap else 0), im.height - (1 if 'y' in wrap else 0)))
        if k == 'j_soil':    # its top 16 to 18 rows are the pale background behind the painted overhang: a grey line at the grass edge
            im = im.crop((0, 18, im.width, im.height))
        if k == 'j_grass':   # a saturated yellow green (mean 153,182,43) that out shouts the painted orchard: a step duller
            im = dull(im, 0.9, 0.72)
        im = im.resize(size, Image.LANCZOS)
        for ax in wrap:
            e, m = seam(im, ax); print('%-12s wrap %s: last to first %.1f, neighbours %.1f' % (k, ax, e, m))
            if e > 4 * max(m, 1): bad.append('%s %s seam %.1f vs %.1f' % (k, ax, e, m))
        W[k] = O.save(im, d + k + '.webp', q=85, alpha=alpha)
    for k, (f, size) in J_PROPS.items():
        im = bleed(Image.open(os.path.join(kit, f))).resize(size, Image.LANCZOS)
        rel = O.save(im, d + k + '.webp', q=85)
        b = bbox(Image.open(os.path.join(O.root, rel)).convert('RGBA'))   # measured on the file as saved (lossy alpha can move a row)
        P[k] = {'file': rel, 'w': im.width, 'h': im.height, 'box': list(b), 'foot': round(b[3] / im.height, 4)}
    return bad

def journey_only(kit, out):
    """Part H on its own: add the kit to the art.json already cut (the original handoff need not be re-extracted)."""
    with open(os.path.join(out, 'art.json')) as fh:
        J = json.load(fh)
    O = Out(out); bad = journey(kit, O, J)
    tot = 0
    for root, _, files in os.walk(os.path.join(out, 'w', 'orchard_loft')):
        tot += sum(os.path.getsize(os.path.join(root, f)) for f in files)
    J['worlds']['orchard_loft']['bytes'] = tot
    J['totalBytes'] = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(out) for f in fs if f.endswith('.webp'))
    J['journeyKit'] = 'super-slice-journey-kit.zip (Astra, 25 Oct 2026)'
    with open(os.path.join(out, 'art.json'), 'w') as fh:
        json.dump(J, fh, separators=(',', ':'), sort_keys=True)
    for k, v in sorted(O.sizes.items()): print('%7.1f KB  %s' % (v / 1024, k))
    print('orchard_loft %.1f KB (budget %.0f KB)' % (tot / 1024, BUDGET_WORLD / 1024))
    if tot > BUDGET_WORLD: bad.append('orchard_loft %.2f MB over budget' % (tot / 1048576))
    if bad:
        print('FAIL: ' + '; '.join(bad)); sys.exit(1)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src'); ap.add_argument('--out', required=True); ap.add_argument('--journey')
    args = ap.parse_args()
    if args.journey and not args.src:
        return journey_only(args.journey, args.out)
    if not args.src:
        ap.error('--src is required (or --journey alone to add the Journey kit)')
    S = args.src; O = Out(args.out)
    J = {'version': 1, 'source': 'Super_Slice_Dev_Handoff.zip (Astra, 23 Oct 2026)', 'worlds': {}, 'fruit': {}, 'knives': {}, 'fx': {}, 'ui': {}}
    src = lambda *p: os.path.join(S, *p)

    # ---------------------------------------------------------------- worlds
    for w in WORLDS:
        d = 'w/%s/' % w; e = {}
        e['sky'] = O.save(fit(Image.open(src('worlds', w, 'sky.jpg')).convert('RGB'), 1024), d + 'sky.webp', alpha=False)
        e['strata'] = O.save(fit(Image.open(src('worlds', w, 'strata.jpg')).convert('RGB'), 1024), d + 'strata.webp', alpha=False)
        e['wall'] = O.save(Image.open(src('worlds', w, 'wall_rock.jpg')).convert('RGB').resize((256, 256), Image.LANCZOS), d + 'wall.webp', alpha=False)
        lg = Image.open(src('worlds', w, 'ledge.jpg')).convert('RGB'); fx = TILE_FIX.get(w + '/ledge')
        if fx == 'flatten': lg = flatten_columns(lg)
        elif fx == 'crop489': lg = lg.crop((0, 0, lg.width, 489))     # one brass rail across the wrap, not two
        elif fx == 'heal': lg = heal_x(lg)
        e['ledge'] = O.save(lg.resize((256, 256), Image.LANCZOS), d + 'ledge.webp', alpha=False)
        # slab faces are boxes' faces: no alpha wanted; flatten any border onto the face's own mean colour
        for k, n in (('slab', 'slab_face.png'), ('inside', 'slab_inside.png')):
            im = bleed(Image.open(src('worlds', w, n)))
            if k == 'slab' and w in SLAB_FIX:
                inset, br, sa = SLAB_FIX[w]
                if inset: im = im.crop((inset, inset, im.width - inset, im.height - inset))   # a painted navy border would seam every box
                if br != 1.0 or sa != 1.0:   # the shell must be duller than the reveal inside it
                    a = im.split()[3]; im = dull(im, br, sa).convert('RGBA'); im.putalpha(a)
            flat = Image.new('RGB', im.size, tuple(int(c) for c in im.convert('RGB').resize((1, 1), Image.BOX).getpixel((0, 0))))
            flat.paste(im.convert('RGB'), (0, 0), im.split()[3])
            e[k] = O.save(flat.resize((256, 256), Image.LANCZOS), d + k + '.webp', alpha=False)
        props = {}
        for i in range(1, 5):
            im, bb = trim(bleed(Image.open(src('worlds', w, 'decor_%02d.png' % i))))
            im = fit(im, 256); props['decor%d' % i] = {'file': O.save(im, d + 'decor%d.webp' % i), 'w': im.width, 'h': im.height}
        hs = bleed(Image.open(src('worlds', w, 'hazard_strip.png'))); hw = hs.width // 4
        hcells = [hs.crop((i * hw, 0, (i + 1) * hw, hs.height)) for i in range(4)]
        im, bb = trim(hcells[0]); im = fit(im, 256)
        props['hazard'] = {'file': O.save(im, d + 'hazard.webp'), 'w': im.width, 'h': im.height}
        side = 0
        for c in hcells:
            b = bbox(c)
            if b: side = max(side, b[2] - b[0], b[3] - b[1])
        side = min(256, side + 12); strip = Image.new('RGBA', (side * 4, side), (0, 0, 0, 0))
        for i, c in enumerate(hcells):   # every frame centred on its own box, so the pivot never jumps
            b = bbox(c) or (0, 0, c.width, c.height); cc = c.crop(b)
            if max(cc.size) > side: cc = fit(cc, side)
            strip.paste(cc, (i * side + (side - cc.width) // 2, (side - cc.height) // 2))
        props['hazard_strip'] = {'file': O.save(strip, d + 'hazard_strip.webp'), 'cells': 4, 'cw': side, 'ch': side}
        # boss stages: three equal cells, kept on ONE common crop so the pivot never jumps between stages
        st = bleed(Image.open(src('worlds', w, 'boss_stages.png')))
        cw = st.width // 3; cells = [st.crop((i * cw, 0, (i + 1) * cw, st.height)) for i in range(3)]
        un = None
        for c in cells:
            b = bbox(c)
            if b: un = b if un is None else (min(un[0], b[0]), min(un[1], b[1]), max(un[2], b[2]), max(un[3], b[3]))
        un = un or (0, 0, cw, st.height)
        cells = [fit(c.crop((max(0, un[0] - 4), max(0, un[1] - 4), min(cw, un[2] + 4), min(st.height, un[3] + 4))), 256) for c in cells]
        strip = Image.new('RGBA', (cells[0].width * 3, cells[0].height), (0, 0, 0, 0))
        for i, c in enumerate(cells): strip.paste(c, (i * cells[0].width, 0))
        props['stages'] = {'file': O.save(strip, d + 'stages.webp'), 'cells': 3, 'cw': cells[0].width, 'ch': cells[0].height}
        # the delivered boss.png is a different character from its own stages in six worlds: the boss IS stage cell 1
        bim, bb = trim(cells[0]); props['boss'] = {'file': O.save(bim, d + 'boss.webp'), 'w': bim.width, 'h': bim.height}
        e['props'] = props
        J['worlds'][w] = e

    # ---------------------------------------------------------------- fruit: two atlases + the measured fruit inside each cell
    cards = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)); halves = Image.new('RGBA', (1024, 512), (0, 0, 0, 0))
    for i, f in enumerate(FRUIT):
        c = bleed(Image.open(src('fruit', 'card_%s.png' % f))).resize((256, 256), Image.LANCZOS)
        cx, cy = (i % 4) * 256, (i // 4) * 256; cards.paste(c, (cx, cy))
        b = bbox(c) or (0, 0, 256, 256)
        h = Image.open(src('fruit', 'halves_%s.png' % f)).convert('RGBA')
        a = h.split()[3]; a.paste(0, (h.width // 2, 0, h.width // 2 + 1, h.height)); h.putalpha(a)   # banana, dragonfruit leak 1 px across
        h = bleed(h)
        hl, hr = h.crop((0, 0, h.width // 2, h.height)).resize((128, 128), Image.LANCZOS), h.crop((h.width // 2, 0, h.width, h.height)).resize((128, 128), Image.LANCZOS)
        hx, hy = (i % 4) * 256, (i // 4) * 128
        halves.paste(hl, (hx, hy)); halves.paste(hr, (hx + 128, hy))
        bl, br = bbox(hl) or (0, 0, 128, 128), bbox(hr) or (0, 0, 128, 128)
        J['fruit'][f] = {'card': [cx, cy, 256, 256], 'cardBox': list(b), 'halfL': [hx, hy, 128, 128], 'halfLBox': list(bl),
                         'halfR': [hx + 128, hy, 128, 128], 'halfRBox': list(br)}
    J['fruitAtlas'] = {'cards': O.save(cards, 'fruit/cards.webp', q=84), 'halves': O.save(halves, 'fruit/halves.webp', q=82),
                       'cardsSize': [1024, 1024], 'halvesSize': [1024, 512]}

    # ---------------------------------------------------------------- knives: the sheet's alpha box, icon, trail
    for aid, key in KNIFE_KEY.items():
        sh = bleed(Image.open(src('knives', '%s_sheet.png' % aid)))
        im, bb = trim(sh, pad=2)
        im = fit(im, 768)
        ic = fit(trim(bleed(Image.open(src('knives', '%s_icon.png' % aid))), pad=6)[0], 192)
        tr = bleed(Image.open(src('knives', 'trail_%s.png' % aid)))
        J['knives'][key] = {'astra': aid, 'file': O.save(im, 'knife/%s.webp' % key, q=86), 'w': im.width, 'h': im.height,
                            'icon': O.save(ic, 'knife/%s_icon.webp' % key), 'trail': O.save(tr, 'knife/%s_trail.webp' % key)}

    # ---------------------------------------------------------------- effects: strips as delivered, one cell size each
    for n in VFX:
        im = bleed(Image.open(src('vfx', '%s_strip.png' % n)))
        cells = {'juice_splat': 8, 'slab_dust': 6, 'sparks_stick': 6, 'confetti': 8, 'rope_cut': 4, 'lantern_burst': 6,
                 'pinata_burst': 8, 'chime_ring': 4, 'bubble_pop': 4, 'ice_crack': 3}[n]
        J['fx'][n] = {'file': O.save(im, 'fx/%s.webp' % n), 'cells': cells, 'cw': im.width // cells, 'ch': im.height}
    for n in ('score_band', 'bullseye'):
        im = bleed(Image.open(src('vfx', '%s.png' % n)))
        J['fx'][n] = {'file': O.save(im, 'fx/%s.webp' % n), 'w': im.width, 'h': im.height}

    # ---------------------------------------------------------------- interface
    J['ui']['title'] = O.save(Image.open(src('ui', 'title_plate.jpg')).convert('RGB'), 'ui/title.webp', q=80, alpha=False)
    for m in ('journey', 'freefall', 'endless', 'climb'):
        J['ui']['mode_' + m] = O.save(fit(Image.open(src('ui', 'mode_%s.jpg' % m)).convert('RGB'), 720), 'ui/mode_%s.webp' % m, q=80, alpha=False)
    ff = bleed(Image.open(src('ui', 'forge_frame.png'))); fa = ff.split()[3].point(lambda v: 0 if v < 8 else v); ff.putalpha(fa)
    J['ui']['forge_frame'] = O.save(ff, 'ui/forge_frame.webp', q=88)
    for n, mx in (('hud_plate', 512), ('plinth', 512), ('sliver', 128), ('btn_flip', 192),
                  ('badge_clean_slice', 256), ('badge_pit_conquered', 256), ('badge_daily', 256), ('badge_supporter', 256)):
        J['ui'][n] = O.save(fit(bleed(Image.open(src('ui', n + '.png'))), mx), 'ui/%s.webp' % n, q=86)
    sp = bleed(Image.open(src('ui', 'sliver_spin_strip.png')))
    J['ui']['sliver_spin'] = {'file': O.save(sp, 'ui/sliver_spin.webp'), 'cells': 6, 'cw': sp.width // 6, 'ch': sp.height}

    if args.journey:
        jb = journey(args.journey, O, J)
        if jb: print('FAIL: ' + '; '.join(jb)); sys.exit(1)
    # ---------------------------------------------------------------- budget + manifest
    over = []
    for w in WORLDS:
        tot = sum(v for k, v in O.sizes.items() if k.startswith('w/%s/' % w))
        J['worlds'][w]['bytes'] = tot
        if tot > BUDGET_WORLD: over.append('%s %.2f MB' % (w, tot / 1048576))
    shared = sum(v for k, v in O.sizes.items() if not k.startswith('w/'))
    J['sharedBytes'] = shared
    if shared > BUDGET_SHARED: over.append('shared %.2f MB' % (shared / 1048576))
    J['totalBytes'] = sum(O.sizes.values())
    with open(os.path.join(args.out, 'art.json'), 'w') as fh:
        json.dump(J, fh, separators=(',', ':'), sort_keys=True)
    for w in WORLDS: print('%-15s %7.1f KB' % (w, J['worlds'][w]['bytes'] / 1024))
    print('%-15s %7.1f KB' % ('shared', shared / 1024)); print('%-15s %7.1f KB in %d files' % ('TOTAL', J['totalBytes'] / 1024, len(O.sizes)))
    if over:
        print('OVER BUDGET: ' + ', '.join(over)); sys.exit(1)

if __name__ == '__main__':
    main()
