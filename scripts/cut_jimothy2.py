#!/usr/bin/env python3
"""cut_jimothy2.py — cut the SECOND Jimothy art drop (Seattle expansion, sheets 10-30).

Reuses the border-flood knockout from cut_jimothy.py (interior detail preserved,
no stray edge halo). Reads  satellites/stream-hop/art-drop2/Jimothy2/
Writes                      satellites/stream-hop/assets/

Groups:
  chars    18a/b/c  -> assets/chars/<id>/{idle,crouch,leap,land}.png   (12 critters)
  costumes 17a-i    -> assets/skins/<id>/{idle,crouch,leap,land}.png   (9 Jimothy costumes)
  bg       16a-f    -> assets/zonecard/<zone>.jpg (banner strips) + assets/bg/nb-<zone>.jpg
  pads     14       -> assets/sprites/pad-*.png                        (8 pads)
  veh      10       -> assets/sprites/veh-*.png                        (8 vehicles)
  rail     13       -> assets/sprites/rail-*.png                       (2)
  animals  11       -> assets/sprites/haz-*.png                        (6)
  hazards  12       -> assets/sprites/prop-*.png                       (6)
  powers   15       -> assets/powers/{power_,hud_}*.png                (6 pairs)
  props    19       -> assets/sprites/egg-*.png                        (8)
  icon     30       -> assets/icons/*.png + portal thumb
  keyart   23c      -> assets/og-jimothy.jpg (landscape share card)

Usage: python3 scripts/cut_jimothy2.py [group ...]   (default: all)
"""
import os, sys, importlib.util
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'satellites/stream-hop/art-drop2/Jimothy2')
OUT  = os.path.join(ROOT, 'satellites/stream-hop/assets')

# reuse the proven knockout / crop helpers
spec = importlib.util.spec_from_file_location('cj', os.path.join(ROOT, 'scripts/cut_jimothy.py'))
cj = importlib.util.module_from_spec(spec)
cj.__dict__['__name__'] = 'cj'          # keep its __main__ block from running
spec.loader.exec_module(cj)

POSES = ['idle', 'crouch', 'leap', 'land']


def sheet(name):
    return Image.open(os.path.join(SRC, name + '.png')).convert('RGB')


def cells(img, rows, cols):
    """Even division into rows x cols boxes (these sheets are laid out regularly)."""
    W, H = img.size
    return [[(round(c*W/cols), round(r*H/rows), round((c+1)*W/cols), round((r+1)*H/rows))
             for c in range(cols)] for r in range(rows)]


def cut_strip(img, box, out_dir, longside=260, shadow=True, maxkb=110, inset=12):
    """box holds a 4-frame hop strip; write idle/crouch/leap/land.

    Two things matter here:
    1. inset trims the thin white divider lines the artist drew between blocks.
       Left in, they read as opaque art and defeat the tight crop entirely.
    2. all four frames are cropped to the UNION bounding box, not to their own.
       Cropping each frame tight would re-centre and re-scale it independently,
       so the cycle would jitter and the wide leap frame would render huge."""
    import numpy as np
    x0, y0, x1, y1 = box
    block = img.crop((x0+inset, y0+inset, x1-inset, y1-inset))
    bw = block.width
    frames = []
    for i in range(4):
        fx0 = round(i*bw/4); fx1 = round((i+1)*bw/4)
        frames.append(cj.knockout_region(block.crop((fx0, 0, fx1, block.height)), drop_shadow=shadow))
    bb = None
    for f in frames:
        a = np.asarray(f)[..., 3]
        ys, xs = np.where(a > 14)
        if len(xs) == 0:
            continue
        b = (int(xs.min()), int(ys.min()), int(xs.max())+1, int(ys.max())+1)
        bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    if bb is None:
        return out_dir
    pad = 4
    bb = (max(0, bb[0]-pad), max(0, bb[1]-pad),
          min(frames[0].width, bb[2]+pad), min(frames[0].height, bb[3]+pad))
    for i, pose in enumerate(POSES):
        f = cj.fit(frames[i].crop(bb), longside)
        cj.save_png(f, os.path.join(out_dir, pose + '.png'), maxkb=maxkb)
    return out_dir


def cut_one(img, box, rel, longside=260, shadow=True, maxkb=130, inset=10):
    x0, y0, x1, y1 = box
    rgba = cj.knockout_region(img.crop((x0+inset, y0+inset, x1-inset, y1-inset)), drop_shadow=shadow)
    rgba = cj.tight(rgba, pad=4)
    rgba = cj.fit(rgba, longside)
    cj.save_png(rgba, rel, maxkb=maxkb)


# ---------------------------------------------------------------- chars (18)
# Each sheet is a grid of BLOCKS; every block is one critter's 4-frame strip.
CHAR_MAP = {
    '18a': (3, 2, [['crow', 'seagull'], ['otter', 'seal'], ['salmon', 'slug']]),
    '18b': (2, 2, [['otter_dup', 'seal_dup'], ['opossum', 'skunk']]),
    '18c': (2, 2, [['coyote', 'heron'], ['pigeon', 'orca']]),
}

def do_chars():
    for name, (rows, cols, grid) in CHAR_MAP.items():
        img = sheet(name)
        boxes = cells(img, rows, cols)
        for r in range(rows):
            for c in range(cols):
                cid = grid[r][c]
                if cid.endswith('_dup'):
                    continue
                cut_strip(img, boxes[r][c], 'chars/' + cid, longside=250)
                print('  chars/%s' % cid)


# ------------------------------------------------------------- costumes (17)
COSTUME_FILES = {
    '17b': 'soggy', '17c': 'nordic', '17d': 'barista', '17e': 'fishmonger',
    '17f': 'richuncle', '17g': 'grad', '17h': 'labcoat', '17i': 'ghost',
}

def do_costumes():
    for f, cid in COSTUME_FILES.items():
        img = sheet(f)
        cut_strip(img, (0, 0, img.width, img.height), 'skins/' + cid, longside=250)
        print('  skins/%s' % cid)
    # "Hot Jimothy Summer" only exists on the overview sheet: row 1, first 4 frames
    img = sheet('17a')
    W, H = img.size
    cut_strip(img, (0, 0, round(W/2), round(H/4)), 'skins/summer', longside=250)
    print('  skins/summer')


# ------------------------------------------------------------------- bg (16)
BG_MAP = {'16a': 'waterfront', '16b': 'market', '16c': 'bridge',
          '16d': 'capitol', '16e': 'interbay', '16f': 'locks'}

def do_bg():
    from PIL import ImageEnhance
    for f, zid in BG_MAP.items():
        img = sheet(f)
        sw, sh = img.size
        # banner strip: 1080x380 band from the middle of the scene
        BW, BH = 1080, 380
        bh = int(sw / (BW / BH))
        y0 = max(0, min(int(sh*0.42) - bh//2, sh - bh))
        band = img.crop((0, y0, sw, y0+bh)).resize((BW, BH), Image.LANCZOS)
        band = ImageEnhance.Brightness(band).enhance(0.94)
        p = os.path.join(OUT, 'zonecard', zid + '.jpg')
        os.makedirs(os.path.dirname(p), exist_ok=True)
        band.save(p, 'JPEG', quality=82, optimize=True, progressive=True)
        # full portrait scene for menus / level intros
        full = img.copy(); full.thumbnail((760, 1350), Image.LANCZOS)
        p2 = os.path.join(OUT, 'bg', 'nb-' + zid + '.jpg')
        full.save(p2, 'JPEG', quality=80, optimize=True, progressive=True)
        print('  zonecard/%s.jpg %dKB  bg/nb-%s.jpg %dKB' % (
            zid, os.path.getsize(p)//1024, zid, os.path.getsize(p2)//1024))


# ----------------------------------------------------------------- pads (14)
PADS = [['kayak', 'paddleboard', 'ring', 'barge'],
        ['duckboat', 'dock', 'salmonback', 'otterback']]

def do_pads():
    img = sheet('14'); boxes = cells(img, 2, 4)
    for r in range(2):
        for c in range(4):
            cut_one(img, boxes[r][c], 'sprites/pad2-%s.png' % PADS[r][c], longside=300)
            print('  sprites/pad2-%s' % PADS[r][c])


# ------------------------------------------------------------- vehicles (10)
VEH = [['trolleybus', 'van', 'taxi', 'foodtruck'],
       ['scooter', 'cyclist', 'skater', 'sedan']]

def do_veh():
    img = sheet('10'); boxes = cells(img, 2, 4)
    for r in range(2):
        for c in range(4):
            cut_one(img, boxes[r][c], 'sprites/veh-%s.png' % VEH[r][c], longside=320)
            print('  sprites/veh-%s' % VEH[r][c])


def do_rail():
    img = sheet('13'); boxes = cells(img, 1, 2)
    for c, nm in enumerate(['lightrail', 'monorail']):
        cut_one(img, boxes[0][c], 'sprites/rail-%s.png' % nm, longside=340)
        print('  sprites/rail-%s' % nm)


# -------------------------------------------------------------- animals (11)
ANIM = [['crowdive', 'dog', 'raccoon'], ['otterswim', 'pigeons', 'heronwade']]

def do_animals():
    img = sheet('11'); boxes = cells(img, 2, 3)
    for r in range(2):
        for c in range(3):
            cut_one(img, boxes[r][c], 'sprites/haz-%s.png' % ANIM[r][c], longside=300)
            print('  sprites/haz-%s' % ANIM[r][c])


# -------------------------------------------------------------- hazards (12)
HAZ = [['wave', 'steam', 'coffeecart'], ['recyclebin', 'roadworks', 'produce']]

def do_hazards():
    img = sheet('12'); boxes = cells(img, 2, 3)
    for r in range(2):
        for c in range(3):
            cut_one(img, boxes[r][c], 'sprites/prop-%s.png' % HAZ[r][c], longside=280)
            print('  sprites/prop-%s' % HAZ[r][c])


# --------------------------------------------------------------- powers (15)
POW = ['salmon', 'boots', 'espresso', 'vest', 'crosswalk', 'lamp']

def do_powers():
    img = sheet('15'); boxes = cells(img, 2, 6)
    for c, nm in enumerate(POW):
        cut_one(img, boxes[0][c], 'powers/power_%s.png' % nm, longside=190, maxkb=90)
        cut_one(img, boxes[1][c], 'powers/hud_%s.png' % nm, longside=120, maxkb=60)
        print('  powers/%s' % nm)


# ---------------------------------------------------------------- props (19)
EGG = [['rachelpig', 'fremontdog', 'lenin', 'gumwall'],
       ['needle', 'ferrytoken', 'tallboy', 'orcacharm']]

def do_props():
    img = sheet('19'); boxes = cells(img, 2, 4)
    for r in range(2):
        for c in range(4):
            cut_one(img, boxes[r][c], 'sprites/egg-%s.png' % EGG[r][c], longside=200, maxkb=80)
            print('  sprites/egg-%s' % EGG[r][c])


# ----------------------------------------------------------------- icon (30)
def do_icon():
    img = sheet('30thethunbnail')
    for size, nm in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
        im = img.resize((size, size), Image.LANCZOS)
        p = os.path.join(OUT, 'icons', nm)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        im.save(p, optimize=True)
        print('  icons/%s %dKB' % (nm, os.path.getsize(p)//1024))
    thumb = img.resize((480, 480), Image.LANCZOS)
    tp = os.path.join(ROOT, 'portal-assets/thumbs/stream-hop.jpg')
    thumb.convert('RGB').save(tp, 'JPEG', quality=86, optimize=True)
    print('  portal thumb %dKB' % (os.path.getsize(tp)//1024))


# --------------------------------------------------------------- keyart (23)
def do_keyart():
    img = sheet('23c')                     # landscape hero art
    W, H = 1200, 630
    sw, sh = img.size
    s = max(W/sw, H/sh)
    im = img.resize((round(sw*s), round(sh*s)), Image.LANCZOS)
    im = im.crop(((im.width-W)//2, (im.height-H)//2, (im.width-W)//2+W, (im.height-H)//2+H))
    p = os.path.join(OUT, 'og-jimothy.jpg')
    im.save(p, 'JPEG', quality=88, optimize=True, progressive=True)
    print('  og-jimothy.jpg %dKB' % (os.path.getsize(p)//1024))
    # portrait splash from 23a
    sp = sheet('23a'); sp.thumbnail((760, 1350), Image.LANCZOS)
    p2 = os.path.join(OUT, 'bg', 'keyart-portrait.jpg')
    sp.save(p2, 'JPEG', quality=82, optimize=True, progressive=True)
    print('  bg/keyart-portrait.jpg %dKB' % (os.path.getsize(p2)//1024))


GROUPS = {'chars': do_chars, 'costumes': do_costumes, 'bg': do_bg, 'pads': do_pads,
          'veh': do_veh, 'rail': do_rail, 'animals': do_animals, 'hazards': do_hazards,
          'powers': do_powers, 'props': do_props, 'icon': do_icon, 'keyart': do_keyart}

if __name__ == '__main__':
    want = sys.argv[1:] or list(GROUPS)
    for g in want:
        if g not in GROUPS:
            print('unknown group', g); continue
        print('==', g)
        GROUPS[g]()
    print('done')
