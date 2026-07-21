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


def divider_blocks(img, thr=0.5):
    """The character sheets DO have a real grid: the artist drew white divider lines.
    Find those lines and use them. Even division was wrong because the rows are not
    equal height (18a is 326 / 264 / 290), which is what sliced frames in the first
    place. Returns block boxes in reading order."""
    import numpy as np
    a = np.asarray(img.convert('RGB')).astype(int)
    white = (a[..., 0] > 195) & (a[..., 1] > 195) & (a[..., 2] > 195)

    def gaps(prof, span):
        runs, i = [], 0
        while i < len(prof):
            if prof[i] > thr:
                j = i
                while j < len(prof) and prof[j] > thr:
                    j += 1
                runs.append((i, j)); i = j
            else:
                i += 1
        if not runs or runs[0][0] > 2:
            runs.insert(0, (0, 0))
        if runs[-1][1] < span - 2:
            runs.append((span, span))
        return [(runs[k][1], runs[k + 1][0]) for k in range(len(runs) - 1)
                if runs[k + 1][0] - runs[k][1] > span * 0.06]

    cols = gaps(white.mean(axis=0), img.width)
    rows = gaps(white.mean(axis=1), img.height)
    return [[(c0, r0, c1, r1) for (c0, c1) in cols] for (r0, r1) in rows]


def cut_strip_auto(img, boxes4, out_dir, longside=250, shadow=True, maxkb=110, pad=22):
    """Cut one critter's four hop frames from DETECTED pose boxes.

    Every frame is cropped to the SAME size window (the largest pose plus padding)
    centred on its own pose. Same size means the cycle renders at one consistent
    scale instead of the wide leap frame blowing up; detected boxes mean no frame
    can be clipped by a cell edge, which is what the grid version was doing."""
    W, H = img.size
    bw = max(b[2] - b[0] for b in boxes4) + pad * 2
    bh = max(b[3] - b[1] for b in boxes4) + pad * 2
    for i, pose in enumerate(POSES):
        x0, y0, x1, y1 = boxes4[i]
        cx = (x0 + x1) // 2
        cy = (y0 + y1) // 2
        lx = max(0, min(W - bw, cx - bw // 2))
        ly = max(0, min(H - bh, cy - bh // 2))
        rgba = cj.knockout_region(img.crop((lx, ly, lx + bw, ly + bh)), drop_shadow=shadow)
        rgba = piece_overlapping(rgba, (x0 - lx, y0 - ly, x1 - lx, y1 - ly))
        cj.save_png(cj.fit(rgba, longside), os.path.join(out_dir, pose + '.png'), maxkb=maxkb)


def auto_objects(img, shadow=True, merge_px=16, min_frac=0.0012, vert_ratio=0.5):
    """Find every object on a knockout sheet by CONNECTED COMPONENTS, not by a grid.

    These sheets are hand laid out, so objects drift off any even division and a
    wide one (a sedan, a barge) gets sliced clean in half by the cell boundary.
    Knock the whole sheet out once, dilate so a vehicle's speed lines and shadow
    join its body, label, then take the bounding box of each blob. Nothing can be
    cut in half because nothing is cut by position at all.

    Returns boxes sorted top-to-bottom then left-to-right.
    """
    import numpy as np
    from scipy import ndimage
    rgba = cj.knockout_region(img, drop_shadow=shadow)
    a = np.asarray(rgba)
    solid = a[..., 3] > 40
    H, W = solid.shape
    # bias the dilation horizontally: an object's own speed lines and shadow sit
    # beside it, while the next ROW of objects sits below it. Growing equally in
    # both directions fuses a medal with the character underneath it.
    vy = max(1, int(round(merge_px * vert_ratio)))
    merged = ndimage.binary_dilation(solid, structure=np.ones((1, 3), bool), iterations=merge_px)
    if vy:
        merged = ndimage.binary_dilation(merged, structure=np.ones((3, 1), bool), iterations=vy)
    lbl, n = ndimage.label(merged)
    boxes = []
    if n:
        objs = ndimage.find_objects(lbl)
        for k in range(1, n + 1):
            sl = objs[k - 1]
            if sl is None:
                continue
            piece = solid[sl] & (lbl[sl] == k)
            area = int(piece.sum())
            if area < min_frac * H * W:
                continue
            ys, xs = np.where(piece)
            y0 = sl[0].start + int(ys.min()); y1 = sl[0].start + int(ys.max()) + 1
            x0 = sl[1].start + int(xs.min()); x1 = sl[1].start + int(xs.max()) + 1
            boxes.append([x0, y0, x1, y1, area])
    if not boxes:
        return []
    # group into rows: anything whose vertical centre is close counts as the same row
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows, cur = [], [boxes[0]]
    for b in boxes[1:]:
        cy = (b[1] + b[3]) / 2
        prev = cur[-1]
        pcy = (prev[1] + prev[3]) / 2
        if abs(cy - pcy) <= max(40, (prev[3] - prev[1]) * 0.55):
            cur.append(b)
        else:
            rows.append(cur); cur = [b]
    rows.append(cur)
    out = []
    for r in rows:
        r.sort(key=lambda b: b[0])
        out.extend([(b[0], b[1], b[2], b[3]) for b in r])
    return out


def auto_objects_n(img, expected, shadow=True, vert_ratio=0.5):
    """Pick the merge distance that actually finds `expected` objects.

    Too small and a vehicle's speed lines become their own sprite; too large and
    two neighbouring vehicles fuse into one. Sweep it, keep every value that hits
    the expected count, and use the middle of that run so we are not sitting on
    the edge of a transition."""
    ok = []
    for mp in [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24]:
        if len(auto_objects(img, shadow=shadow, merge_px=mp, vert_ratio=vert_ratio)) == expected:
            ok.append(mp)
    if not ok:
        return None, None
    mp = ok[len(ok) // 2]
    return auto_objects(img, shadow=shadow, merge_px=mp, vert_ratio=vert_ratio), mp


def cut_auto(img, names, out_fmt, longside=300, shadow=True, maxkb=130, pad=26):
    """Cut a sheet by object detection and name the results in reading order."""
    flat = [n for row in names for n in row] if names and isinstance(names[0], list) else list(names)
    boxes, mp = auto_objects_n(img, len(flat), shadow=shadow)
    if boxes is None:
        print('   ! could not isolate %d objects at any merge distance -> NOT CUT' % len(flat))
        return False
    print('   (merge %d)' % mp)
    W, H = img.size
    for i, nm in enumerate(flat):
        bx0, by0, bx1, by1 = boxes[i]
        x0 = max(0, bx0 - pad); y0 = max(0, by0 - pad)
        x1 = min(W, bx1 + pad); y1 = min(H, by1 + pad)
        rgba = cj.knockout_region(img.crop((x0, y0, x1, y1)), drop_shadow=shadow)
        rgba = piece_overlapping(rgba, (bx0 - x0, by0 - y0, bx1 - x0, by1 - y0))
        rgba = cj.fit(cj.tight(rgba, pad=3), longside)
        cj.save_png(rgba, out_fmt % nm, maxkb=maxkb)
    return True


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
        blocks = divider_blocks(img)
        if len(blocks) != rows or any(len(r) != cols for r in blocks):
            print('   ! %s: dividers gave %s, expected %dx%d -> NOT CUT'
                  % (name, [len(r) for r in blocks], rows, cols)); continue
        print('  %s blocks %s' % (name, [[(b[2]-b[0], b[3]-b[1]) for b in r] for r in blocks]))
        for r in range(rows):
            for c in range(cols):
                cid = grid[r][c]
                if cid.endswith('_dup'):
                    continue
                cut_strip(img, blocks[r][c], 'chars/' + cid, longside=250, inset=4)
                print('    chars/%s' % cid)


# ------------------------------------------------------------- costumes (17)
COSTUME_FILES = {
    '17b': 'soggy', '17c': 'nordic', '17d': 'barista', '17e': 'fishmonger',
    '17f': 'richuncle', '17g': 'grad', '17h': 'labcoat', '17i': 'ghost',
}

def do_costumes():
    for f, cid in COSTUME_FILES.items():
        img = sheet(f)
        blocks = divider_blocks(img)
        box = blocks[0][0] if (len(blocks) == 1 and len(blocks[0]) == 1) else (0, 0, img.width, img.height)
        cut_strip(img, box, 'skins/' + cid, longside=250, inset=4)
        print('  skins/%s' % cid)
    # "Hot Jimothy Summer" only exists on 17a, the OVERVIEW sheet: 8 costumes across,
    # 4 rows deep, and no divider lines at all. Its four poses are the top-left
    # eighth-by-quarter, so this one is explicit on purpose.
    img = sheet('17a')
    W, H = img.size
    cut_strip(img, (0, 0, round(W / 2), round(H / 4)), 'skins/summer', longside=250, inset=4)
    print('  skins/summer (explicit block, 17a has no dividers)')


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
    print('  pads (14)')
    cut_auto(sheet('14'), PADS, 'sprites/pad2-%s.png', longside=320)


# ------------------------------------------------------------- vehicles (10)
VEH = [['trolleybus', 'van', 'taxi', 'foodtruck'],
       ['scooter', 'cyclist', 'skater', 'sedan']]

def do_veh():
    print('  vehicles (10)')
    cut_auto(sheet('10'), VEH, 'sprites/veh-%s.png', longside=340)


def do_rail():
    print('  rail (13)')
    cut_auto(sheet('13'), ['lightrail', 'monorail'], 'sprites/rail-%s.png', longside=360)


# -------------------------------------------------------------- animals (11)
ANIM = [['crowdive', 'dog', 'raccoon'], ['otterswim', 'pigeons', 'heronwade']]

def do_animals():
    print('  animals (11)')
    cut_auto(sheet('11'), ANIM, 'sprites/haz-%s.png', longside=310)


# -------------------------------------------------------------- hazards (12)
HAZ = [['wave', 'steam', 'coffeecart'], ['recyclebin', 'roadworks', 'produce']]

def do_hazards():
    print('  hazards (12)')
    cut_auto(sheet('12'), HAZ, 'sprites/prop-%s.png', longside=290)


# --------------------------------------------------------------- powers (15)
POW = ['salmon', 'boots', 'espresso', 'vest', 'crosswalk', 'lamp']

def do_powers():
    # 12 objects: six pickups on top, six HUD glyphs underneath, in reading order
    print('  powers (15)')
    names = ['power_%s' % n for n in POW] + ['hud_%s' % n for n in POW]
    cut_auto(sheet('15'), names, 'powers/%s.png', longside=200, maxkb=90)


# ---------------------------------------------------------------- props (19)
EGG = [['rachelpig', 'fremontdog', 'lenin', 'gumwall'],
       ['needle', 'ferrytoken', 'tallboy', 'orcacharm']]

def do_props():
    print('  landmarks (19)')
    cut_auto(sheet('19'), EGG, 'sprites/egg-%s.png', longside=210, maxkb=80)


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


# ----------------------------------------------------------- lane strips (20)
# 3 cols x 6 rows. col1 = the pavement you stand on, col2 = the road surface,
# col3 = water / rail / extra. One row per neighbourhood.
LANE_ROWS = ['waterfront', 'market', 'bridge', 'capitol', 'interbay', 'locks']

def do_lanes():
    img = sheet('20')
    boxes = cells(img, 6, 3)
    out = os.path.join(OUT, 'lanes')
    os.makedirs(out, exist_ok=True)
    def strip(box, rel, inset=6):
        x0, y0, x1, y1 = box
        im = img.crop((x0+inset, y0+inset, x1-inset, y1-inset)).resize((1080, 150), Image.LANCZOS)
        p = os.path.join(out, rel)
        im.save(p, 'JPEG', quality=78, optimize=True, progressive=True)
        return os.path.getsize(p)//1024
    for r, zid in enumerate(LANE_ROWS):
        a = strip(boxes[r][0], 'safe-%s.jpg' % zid)
        b = strip(boxes[r][1], 'road-%s.jpg' % zid)
        print('  lanes/safe-%s %dKB  road-%s %dKB' % (zid, a, zid, b))
    # water variants live in column 3 (rows 1, 3, 6) and the rail bed is row 5
    for r, nm in [(0, 'water-deep'), (2, 'water-teal'), (5, 'water-chop')]:
        print('  lanes/%s %dKB' % (nm, strip(boxes[r][2], nm + '.jpg')))
    print('  lanes/rail2 %dKB' % strip(boxes[4][2], 'rail2.jpg'))


# ------------------------------------------------------------- weather fx (28)
# 4x3 grid of full-screen atmosphere. We only need four of them.
# tint is applied because these are painted ON magenta: every semi-transparent
# pixel keeps a magenta cast that reads as purple confetti over the board. Weather
# is light, not paint, so we flatten each layer to its luminance and re-tint it.
WX = {(0, 2): ('wx-rain',  (198, 218, 245)),
      (0, 1): ('wx-fog',   (168, 182, 196)),
      (2, 0): ('wx-rays',  (250, 226, 168)),
      (1, 0): ('wx-leaves',(214, 148,  72))}

def do_weather():
    import numpy as np
    img = sheet('28')
    boxes = cells(img, 3, 4)
    for (r, c), (nm, tint) in WX.items():
        rgba = cj.knockout_region(img.crop(boxes[r][c]), drop_shadow=False)
        rgba = cj.tight(rgba, pad=0)
        rgba = cj.fit(rgba, 300)
        a = np.asarray(rgba).astype(np.float32)
        luma = (a[..., 0]*0.299 + a[..., 1]*0.587 + a[..., 2]*0.114) / 255.0
        for i in range(3):
            a[..., i] = np.clip(luma * tint[i], 0, 255)
        # weight alpha by brightness too, so the dark painted background falls away
        a[..., 3] = np.clip(a[..., 3] * (0.25 + 0.75*luma), 0, 255)
        out = Image.fromarray(a.astype('uint8'), 'RGBA')
        cj.save_png(out, 'fx/%s.png' % nm, maxkb=70)
        print('  fx/%s' % nm)


# ------------------------------------------------------------- badges (21,26)
def piece_overlapping(rgba, box):
    """Keep the blob that actually IS the object we detected.

    'Largest blob' is wrong here: with generous padding the crop can catch the
    sheet's white divider lines, which form one big connected rectangle and win on
    pixel count, so the animal gets deleted and the frame comes out blank. Instead
    keep whichever component covers the most of the detected bounding box."""
    import numpy as np
    from scipy import ndimage
    a = np.asarray(rgba).copy()
    solid = a[..., 3] > 40
    lbl, n = ndimage.label(solid)
    if n <= 1:
        return rgba
    x0, y0, x1, y1 = box
    inside = lbl[max(0, y0):y1, max(0, x0):x1]
    counts = np.bincount(inside.ravel(), minlength=n + 1)
    counts[0] = 0
    keep = int(counts.argmax())
    if counts[keep] == 0:
        return rgba
    a[..., 3][lbl != keep] = 0
    return Image.fromarray(a, 'RGBA')


def largest_piece(rgba):
    """These sheets are not on an even grid, so a cell often catches a sliver of its
    neighbour. A badge is one solid object, so keep only the biggest blob."""
    import numpy as np
    from scipy import ndimage
    a = np.asarray(rgba).copy()
    solid = a[..., 3] > 40
    lbl, n = ndimage.label(solid)
    if n <= 1:
        return rgba
    sizes = np.bincount(lbl.ravel())
    sizes[0] = 0
    keep = sizes.argmax()
    a[..., 3][lbl != keep] = 0
    return Image.fromarray(a, 'RGBA')


# Sheet 29 is the one sheet detection cannot fully solve: the spring medal and the
# rainbow shield physically TOUCH the raccoon drawn below them, so they come back as
# one blob at every merge distance. These are the five badges the game uses, with the
# two merged pairs split at the near-empty row measured between them.
SEASON_BOXES = {
    'b29-11': (29, 62, 288, 371),     # pumpkin shield
    'b29-21': (31, 411, 286, 687),    # winter lantern medal
    'b29-31': (27, 727, 313, 976),    # cherry blossom medal  (split off the raccoon below)
    'b29-34': (893, 718, 1223, 973),  # rainbow paw shield    (split off the raccoon below)
    'b29-43': (626, 1001, 853, 1241), # summer boat shield
}

def do_season_badges():
    img = sheet('29')
    for nm, (x0, y0, x1, y1) in SEASON_BOXES.items():
        p = 14
        rgba = cj.knockout_region(img.crop((max(0, x0-p), max(0, y0-p),
                                            min(img.width, x1+p), min(img.height, y1+p))), drop_shadow=False)
        rgba = largest_piece(rgba)
        cj.save_png(cj.fit(cj.tight(rgba, pad=3), 190), 'ach/%s.png' % nm, maxkb=70)
        print('  ach/%s' % nm)


def do_badges():
    do_season_badges()
    # detected objects, then named by their row/column POSITION so the ids the game
    # already references (b26-11 and friends) keep pointing at the same medal
    for name, rows, cols in [('26', 4, 4), ('21', 3, 4)]:
        img = sheet(name)
        boxes, mp = auto_objects_n(img, rows*cols, shadow=False)
        if boxes is None:
            print('   ! sheet %s: could not isolate %d badges -> NOT CUT' % (name, rows*cols)); continue
        for i, b in enumerate(boxes):
            r, c = i // cols, i % cols
            x0, y0, x1, y1 = b
            rgba = cj.knockout_region(img.crop((max(0,x0-20), max(0,y0-20),
                                                min(img.width,x1+20), min(img.height,y1+20))), drop_shadow=False)
            rgba = largest_piece(rgba)
            cj.save_png(cj.fit(cj.tight(rgba, pad=3), 190), 'ach/b%s-%d%d.png' % (name, r+1, c+1), maxkb=70)
        print('  ach/ sheet %s (merge %d)' % (name, mp))


GROUPS = {'lanes': do_lanes, 'weather': do_weather, 'badges': do_badges, 'chars': do_chars, 'costumes': do_costumes, 'bg': do_bg, 'pads': do_pads,
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
