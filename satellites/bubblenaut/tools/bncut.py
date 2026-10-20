#!/usr/bin/env python3
"""BUBBLENAUT art cutter: Astra's 79 source masters -> the game's runtime atlases.

    python3 -P -E satellites/bubblenaut/tools/bncut.py --src <unzipped masters> --out satellites/bubblenaut/art/r1 \
        [--only hero,moss_moon,...] [--review <dir>] [--register]

The masters live in the private vault (lucid-winds-vault release vault-20261020-bubblenaut-astra). They are
never edited; everything here is a new file cut from them.

What it does, and why each step exists (measured 20 Oct 2026 on the real masters):
- KEY. The masters are RGB on an approximate key (magenta ~(237,13,240), green ~(15,242,15)), never exact,
  with small noise. A pixel is sure background when its key chroma (min(R,B)-G for magenta, G-max(R,B) for
  green) is high, sure foreground when low. In between is the anti-aliased edge: its alpha is solved by
  projecting it onto the line between the LOCAL key colour and the colour of the nearest sure foreground
  pixel, and its colour is un-mixed from the key, so no magenta or green fringe survives. Pixels far from
  any key keep alpha 1, which protects interior pinks and purples (the hero's backpack, the jelly).
- SCALE. Astra drew every strip at its own size: Pip's die strip at about half his idle, Bolt Bucket's
  turn at 1.4 times its slide, Comet Chomp's leap at half its walk. Measured two independent ways on the
  hero (the orange head's area, and SIFT feature matching with RANSAC) and they agree within a few
  percent. Each strip gets ONE scale (the inlier weighted median of its frames' SIFT scales), so squash
  and stretch inside a strip stays as drawn and nothing inflates frame by frame.
- ANCHOR. Every frame gets the point that sits on the actor's position. 'g' frames stand on the strip's
  ground line (so a run's bob and a respawn's drop stay as drawn); 'b' frames are registered by the body
  (jump, hop, leap and fall: physics owns the arc, so the art's baked lift is removed instead of doubled);
  'c' frames are centred (floaters, bubble states, effects). Horizontal placement comes from the SIFT
  registration of the rigid parts, so legs swing under a body that stays put.
- PACK. Frames are trimmed and shelf packed into one atlas per character, every side under 1600 px
  (the host's image optimizer shrinks anything bigger and would break every rectangle), stored at 2x the
  game's CSS pixels to match the canvas (DPR capped at 2), WebP lossless: the pixels are exactly the cut.
"""
import argparse, json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
REG_PATH = os.path.join(HERE, 'registration.json')
STORE = 2.0                     # stored px per CSS px
C_HI, C_LO = 150.0, 60.0        # key chroma: >= sure background, <= sure foreground

# ------------------------------------------------------------------ the cast
# Target size = the CSS height of the reference frame's foreground (idle frame 1 / the move loop's frame 1).
# Strip rows: name, frame count, fps, loop, anchor modes ('g' ground, 'b' body, 'c' centre; one letter for
# all frames or a string per frame), ground rule ('med' median bottom, 'first', 'last', or frame list),
# event frame (1-based, or 0), note.
HERO = dict(kind='char', id='hero', dir='hero', key='green', ref=('hero_idle', 1), css_h=42.0, strips=[
    ('idle', 4, 5, True, 'g', 'med', 0),
    ('run', 6, 12, True, 'g', 'med', 0),
    ('jump', 4, 14, False, 'gbbb', 'first', 2),
    ('fall', 3, 8, True, 'b', 'med', 0),
    ('land', 3, 14, False, 'g', 'med', 1),
    ('blow', 4, 16, False, 'g', 'med', 2),
    ('turn', 3, 18, False, 'g', 'med', 0),
    ('hurt', 4, 12, False, 'g', 'med', 0),
    ('die', 6, 8, False, 'g', [4, 5, 6], 0),
    ('respawn', 4, 10, False, 'g', [3, 4], 3),
    ('cheer', 6, 6, True, 'g', 'med', 0),
    ('wave', 4, 5, True, 'g', 'med', 0),
])
def enemy(world, key, move, css_h, special):
    rows = [(move, 4, special['move_fps'], True, 'c' if move == 'fly' else 'g', 'med', 0)]
    rows += special['rows']
    rows += [(('angry_' + move), 4, special['angry_fps'], True, 'c' if move == 'fly' else 'g', 'med', 0)]
    if move != 'fly':
        rows += [('fall', 2, 8, True, 'b', 'med', 0), ('turn', 3, 16, False, 'g', 'med', 0)]
    rows += [('trapped', 4, 5, True, 'c', 'med', 0), ('struggle', 4, 12, True, 'c', 'med', 0),
             ('escape', 4, 12, False, 'b', 'med', 0), ('popped', 5, 14, False, 'c', 'med', 4)]
    return dict(kind='char', id=world, dir='enemies', key=key, ref=('enemy_%s_%s' % (world, move), 1),
                css_h=css_h, strips=rows, prefix='enemy_%s_' % world)
ENEMIES = [
    enemy('moss_moon', 'magenta', 'walk', 36.0, dict(move_fps=8, angry_fps=12, rows=[
        ('hop', 6, 12, False, 'gbbbbg', 'first', 2)])),
    enemy('crystal_caverns', 'magenta', 'run', 27.0, dict(move_fps=12, angry_fps=16, rows=[
        ('drop', 4, 12, False, 'ggbb', 'first', 2)])),
    enemy('rust_belt', 'green', 'fly', 33.0, dict(move_fps=8, angry_fps=12, rows=[
        ('bounce', 4, 14, False, 'c', 'med', 1)])),
    enemy('frost_ring', 'magenta', 'slide', 26.0, dict(move_fps=10, angry_fps=14, rows=[
        ('dash', 4, 16, True, 'g', 'med', 0)])),
    enemy('magma_core', 'magenta', 'walk', 31.0, dict(move_fps=9, angry_fps=14, rows=[
        ('leap', 6, 12, False, 'gbbbbg', 'first', 2)])),
]
# Comet Chomp asleep in the bubble matches nothing (eyes shut, flames down to embers: 3 to 5 SIFT inliers against
# the walk AND against its own struggle). Judged by eye against the struggle strip on 20 Oct: the ball reads about
# 5% larger at 1.0, so 0.95.
ENEMIES[-1]['scale_override'] = {'trapped': 0.95}
CHARS = {c['id']: c for c in [HERO] + ENEMIES}
CHAIN = {'trapped': 'struggle', 'struggle': 'trapped'}

# ------------------------------------------------------------------ keying
def key_chroma(a, green):
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    return (G - np.maximum(R, B)) if green else (np.minimum(R, B) - G)

def key_image(rgb, green):
    """-> (colour float32 HxWx3 un-mixed, alpha float32 HxW)"""
    a = rgb.astype(np.float32)
    c = key_chroma(a, green)
    sure_bg = c >= C_HI
    sure_fg = c <= C_LO
    # local key colour from sure background (normalised convolution handles any slow gradient)
    w = sure_bg.astype(np.float32)
    wb = ndimage.gaussian_filter(w, 10) + 1e-6
    K = np.stack([ndimage.gaussian_filter(a[..., i] * w, 10) / wb for i in range(3)], -1)
    glob = np.median(a[sure_bg], axis=0) if sure_bg.any() else np.array([237, 13, 240], np.float32)
    lowconf = (wb < 0.05)[..., None]
    K = np.where(lowconf, glob, K)
    alpha = np.where(sure_bg, 0.0, 1.0).astype(np.float32)
    edge = ~sure_bg & ~sure_fg
    if edge.any() and sure_fg.any():
        dist, idx = ndimage.distance_transform_edt(~sure_fg, return_indices=True)
        F = a[idx[0], idx[1]]
        d = F - K
        num = ((a - K) * d).sum(-1)
        den = (d * d).sum(-1) + 1e-3
        proj = np.clip(num / den, 0.0, 1.0)
        lin = np.clip((C_HI - c) / (C_HI - C_LO), 0.0, 1.0)
        al_edge = np.where(dist <= 3.0, proj, lin)
        alpha = np.where(edge, al_edge, alpha)
    # interior protection: far from any sure background, keep it solid
    dbg = ndimage.distance_transform_edt(~sure_bg)
    alpha = np.where(dbg > 4.0, 1.0, alpha).astype(np.float32)
    al = alpha[..., None]
    col = np.where(al > 0.004, (a - (1.0 - al) * K) / np.maximum(al, 0.004), 0.0)
    col = np.clip(col, 0, 255).astype(np.float32)
    col = despill(col, alpha, green)
    return col, alpha

def despill(col, alpha, green):
    """remove key spill from partially transparent pixels: no art here contains the key hue, but an
    un-mixed low-alpha edge pixel amplifies key noise (measured: 159 green-tinted visible pixels on the hero)"""
    m = alpha < 0.98
    R, G, B = col[..., 0], col[..., 1], col[..., 2]
    if green:
        col[..., 1] = np.where(m, np.minimum(G, np.maximum(R, B)), G)
    else:
        sp = np.maximum(0.0, np.minimum(R, B) - G - 25.0)
        col[..., 0] = np.where(m, R - sp, R); col[..., 2] = np.where(m, B - sp, B)
    return col

def to_rgba_u8(col, alpha):
    return np.dstack([np.clip(col, 0, 255), np.clip(alpha * 255.0, 0, 255)]).round().astype(np.uint8)

def resample(col, alpha, s):
    """premultiplied Lanczos resample by factor s -> (col, alpha) float"""
    H, W = alpha.shape
    nw, nh = max(1, int(round(W * s))), max(1, int(round(H * s)))
    pm = col * alpha[..., None]
    chans = []
    for i in range(3):
        chans.append(np.asarray(Image.fromarray(pm[..., i].astype(np.float32)).resize((nw, nh), Image.LANCZOS)))
    aa = np.asarray(Image.fromarray(alpha.astype(np.float32)).resize((nw, nh), Image.LANCZOS))
    aa = np.clip(aa, 0, 1)
    pmr = np.clip(np.stack(chans, -1), 0, 255)
    colr = np.where(aa[..., None] > 1e-3, pmr / np.maximum(aa[..., None], 1e-3), 0)
    return np.clip(colr, 0, 255), aa

# ------------------------------------------------------------------ registration (SIFT, cached)
def register_char(ch, src, meas):
    import cv2
    sift = cv2.SIFT_create(nfeatures=3000)
    bf = cv2.BFMatcher(cv2.NORM_L2)
    green = ch['key'] == 'green'
    def prep(rgb, box):
        l, t, r, b = box
        a = rgb[t:b, l:r].astype(np.float32)
        al = np.clip((C_HI - key_chroma(a, green)) / (C_HI - C_LO), 0, 1)[..., None]
        comp = (a * al + 128 * (1 - al)).astype(np.uint8)
        return cv2.cvtColor(comp, cv2.COLOR_RGB2GRAY), ((al[..., 0] > 0.5) * 255).astype(np.uint8)
    def match(ref, g, m):
        best = None
        for mir in (False, True):
            gg = cv2.flip(g, 1) if mir else g
            mm = cv2.flip(m, 1) if mir else m
            kp, des = sift.detectAndCompute(gg, mm)
            if des is None or len(kp) < 8: continue
            ms = bf.knnMatch(des, ref[1], k=2)
            good = [x[0] for x in ms if len(x) == 2 and x[0].distance < 0.75 * x[1].distance]
            if len(good) < 8: continue
            s_pts = np.float32([kp[x.queryIdx].pt for x in good])
            d_pts = np.float32([ref[0][x.trainIdx] for x in good])
            A, inl = cv2.estimateAffinePartial2D(s_pts, d_pts, method=cv2.RANSAC, ransacReprojThreshold=6.0,
                                                 maxIters=5000, confidence=0.995)
            if A is None: continue
            n = int(inl.sum())
            if best is None or n > best['n']:
                best = dict(n=n, A=A.tolist(), mirror=mir, w=int(g.shape[1]))
        return best
    rname, rf = ch['ref']
    rrgb = np.asarray(Image.open(os.path.join(src, ch['dir'], rname + '.png')).convert('RGB'))
    g, m = prep(rrgb, meas[rname][rf - 1]['slice'])
    kp, des = sift.detectAndCompute(g, m)
    ref = ([k.pt for k in kp], des)
    out = {}
    for row in ch['strips']:
        name = strip_file(ch, row[0])
        rgb = np.asarray(Image.open(os.path.join(src, ch['dir'], name + '.png')).convert('RGB'))
        out[name] = [match(ref, *prep(rgb, fr['slice'])) for fr in meas[name]]
        print('  registered', name, ' '.join('%d' % (x['n'] if x else 0) for x in out[name]), flush=True)
    # a strip whose frames match the reference nowhere (Comet Chomp asleep in the bubble: 5,4,4,4 inliers)
    # is matched to a strip of the SAME pose family instead, and its scale composed through that strip
    for row in ch['strips']:
        name = strip_file(ch, row[0]); chain = CHAIN.get(row[0])
        if not chain: continue
        if any(x and x['n'] >= 15 for x in out[name]): continue
        cname = strip_file(ch, chain)
        crgb = np.asarray(Image.open(os.path.join(src, ch['dir'], cname + '.png')).convert('RGB'))
        g, m = prep(crgb, meas[cname][0]['slice'])
        kp, des = sift.detectAndCompute(g, m)
        cref = ([k.pt for k in kp], des)
        rgb = np.asarray(Image.open(os.path.join(src, ch['dir'], name + '.png')).convert('RGB'))
        out['chain:' + name] = dict(base=cname, regs=[match(cref, *prep(rgb, fr['slice'])) for fr in meas[name]])
        print('  chained', name, 'via', cname, ' '.join('%d' % (x['n'] if x else 0) for x in out['chain:' + name]['regs']), flush=True)
    return out

def strip_file(ch, name):
    return (ch.get('prefix', 'hero_') + name)

# ------------------------------------------------------------------ measurements
def load_meas(src):
    M = os.path.join(src, 'BUBBLENAUT-Main-Assets')
    R = os.path.join(src, 'BUBBLENAUT-Remaining-19-Assets')
    meas = {}
    for s in json.load(open(os.path.join(M, 'notes', 'source-frame-measurements.json'))):
        meas[s['file'][:-4]] = [dict(slice=f['source_slice'], fg=f['foreground_bounds']) for f in s['frames']]
    for s in json.load(open(os.path.join(M, 'notes', 'main-frame-measurements.json'))):
        meas[s['id']] = [dict(slice=r['source_slice'], fg=r['foreground_bounds']) for r in s['regions']]
    for s in json.load(open(os.path.join(R, 'notes', 'source-measurements.json'))):
        if s.get('regions'):
            meas[s['id']] = [dict(slice=r['source_slice'], fg=r['foreground_bounds']) for r in s['regions']]
    return meas, M, R

def wmedian(vals, wts):
    o = np.argsort(vals); v = np.asarray(vals)[o]; w = np.asarray(wts, np.float64)[o]
    c = np.cumsum(w); return float(v[np.searchsorted(c, c[-1] / 2.0)])

def chain_strip_scale(reg, fname, n):
    """scale of a strip registered to another strip's frame 1, composed with that frame's own scale"""
    cr = reg.get('chain:' + fname)
    if not cr: return None
    base = reg.get(cr['base'])
    if not base or not base[0] or base[0]['n'] < 15: return None
    csc = [math.hypot(x['A'][0][0], x['A'][1][0]) if x else 0 for x in cr['regs']]
    cwt = [x['n'] if x else 0 for x in cr['regs']]
    cg = [i for i in range(n) if cwt[i] >= 15 and 0.25 < csc[i] < 4]
    if not cg: return None
    return wmedian([csc[i] for i in cg], [cwt[i] for i in cg]) * math.hypot(base[0]['A'][0][0], base[0]['A'][1][0])

def frame_point(reg, x_ref, y_ref):
    """the point in the frame (slice coords) that the registration maps onto (x_ref, y_ref)"""
    A = np.array(reg['A'], np.float64)
    M2 = A[:, :2]; t = A[:, 2]
    p = np.linalg.solve(M2, np.array([x_ref, y_ref]) - t)
    if reg['mirror']: p[0] = reg['w'] - 1 - p[0]
    return float(p[0]), float(p[1])

# ------------------------------------------------------------------ the character cut
def cut_char(ch, src, meas, reg, review):
    M = os.path.join(src, 'BUBBLENAUT-Main-Assets')
    green = ch['key'] == 'green'
    rname, rf = ch['ref']
    rfg = meas[rname][rf - 1]['fg']; rsl = meas[rname][rf - 1]['slice']
    ref_h = rfg[3] - rfg[1]
    k = ch['css_h'] * STORE / ref_h        # stored px per source px at strip scale 1
    # reference anchor in reference-slice coords: feet centre (bottom band of the reference foreground)
    rrgb = np.asarray(Image.open(os.path.join(M, ch['dir'], rname + '.png')).convert('RGB'))
    l, t, r, b = rsl
    _, ral = key_image(rrgb[t:b, l:r], green)
    ys, xs = np.nonzero(ral > 0.5)
    y_bot = ys.max(); band = ys >= y_bot - 0.08 * (ys.max() - ys.min())
    feet_x = float(xs[band].mean()); feet_y = float(y_bot + 1)
    cy = float(ys.mean()); cx = float(xs.mean())
    center_mode = any(row[0] in ('fly',) for row in ch['strips'])
    ref_anchor = (cx, cy) if center_mode else (feet_x, feet_y)
    ref_center = (cx, cy)
    strips = {}; frames_out = []; info = {}
    for (name, n, fps, loop, modes, ground, event) in ch['strips']:
        fname = strip_file(ch, name)
        fr = meas[fname]
        assert len(fr) == n, (fname, len(fr), n)
        modes = modes * n if len(modes) == 1 else modes
        regs = reg.get(fname) or [None] * n
        sc = [math.hypot(x['A'][0][0], x['A'][1][0]) if x else 0 for x in regs]
        wt = [x['n'] if x else 0 for x in regs]
        good = [i for i in range(n) if wt[i] >= 15 and 0.25 < sc[i] < 4]
        chained = chain_strip_scale(reg, fname, n) if not good else None
        if not good: good = [i for i in range(n) if wt[i] >= 6 and 0.25 < sc[i] < 4]
        s_strip = wmedian([sc[i] for i in good], [wt[i] for i in good]) if good else 1.0
        if chained is not None:
            print('  %-14s no direct match; chained scale %.3f' % (name, chained), flush=True)
            s_strip = chained
        sc_override = ch.get('scale_override', {}).get(name)
        if sc_override: s_strip = sc_override
        rgb = np.asarray(Image.open(os.path.join(M, ch['dir'], fname + '.png')).convert('RGB'))
        keyed = []
        for i in range(n):
            l, t, r, b = fr[i]['slice']
            col, al = key_image(rgb[t:b, l:r], green)
            keyed.append((col, al))
        # ground line in each frame's slice coords: Astra's slices share the sheet's rows (t=0), so one value
        bots = []
        for i in range(n):
            ys, xs = np.nonzero(keyed[i][1] > 0.5)
            bots.append(float(ys.max() + 1) if ys.size else 0.0)
        if ground == 'med': gl = float(np.median(bots))
        elif ground == 'first': gl = bots[0]
        elif ground == 'last': gl = bots[-1]
        else: gl = float(np.median([bots[j - 1] for j in ground]))
        sfac = k * s_strip
        flist = []
        for i in range(n):
            col, al = keyed[i]
            ys, xs = np.nonzero(al > 0.5)
            bbox_cx = float((xs.min() + xs.max() + 1) / 2) if xs.size else al.shape[1] / 2
            bbox_cy = float((ys.min() + ys.max() + 1) / 2) if ys.size else al.shape[0] / 2
            rg = regs[i] if (regs[i] and wt[i] >= 10 and 0.25 < sc[i] < 4) else None
            m = modes[i]
            if m == 'c':
                if rg: ax, ay = frame_point(rg, *ref_center)
                else: ax, ay = bbox_cx, bbox_cy
            elif m == 'b':
                if rg: ax, ay = frame_point(rg, *ref_anchor)
                else: ax, ay = bbox_cx, gl
            else:
                ax = frame_point(rg, *ref_anchor)[0] if rg else bbox_cx
                ay = gl
            if name in ('die',): ax = bbox_cx
            cr, ar = resample(col, al, sfac)
            cr = despill(cr, ar, green)
            # trim
            ys, xs = np.nonzero(ar > 0.02)
            if ys.size == 0:
                cr = np.zeros((2, 2, 3), np.float32); ar = np.zeros((2, 2), np.float32); x0 = y0 = 0
            else:
                x0, x1 = max(0, xs.min() - 2), min(ar.shape[1], xs.max() + 3)
                y0, y1 = max(0, ys.min() - 2), min(ar.shape[0], ys.max() + 3)
                cr = cr[y0:y1, x0:x1]; ar = ar[y0:y1, x0:x1]
            flist.append(dict(img=to_rgba_u8(cr, ar), ax=ax * sfac - x0, ay=ay * sfac - y0))
        strips[name] = dict(fps=fps, loop=loop, event=event, frames=flist, mode=modes)
        info[name] = dict(scale=round(s_strip, 3), good=len(good), ground=round(gl, 1), sfac=round(sfac, 4))
        print('  %-14s strip scale %.3f (from %d frames)  stored/src %.4f' % (name, s_strip, len(good), sfac), flush=True)
    return strips, info

# ------------------------------------------------------------------ packing
def pack(strips, maxw=1024, pad=2):
    items = []
    for name, s in strips.items():
        for i, f in enumerate(s['frames']):
            items.append((f['img'].shape[0], f['img'].shape[1], name, i))
    items.sort(key=lambda x: (-x[0], -x[1]))
    x = y = shelf_h = 0; place = {}
    for h, w, name, i in items:
        if x + w + pad > maxw: x = 0; y += shelf_h + pad; shelf_h = 0
        place[(name, i)] = (x, y); x += w + pad; shelf_h = max(shelf_h, h)
    H = y + shelf_h
    W = maxw
    atlas = np.zeros((H, W, 4), np.uint8)
    for (name, i), (px, py) in place.items():
        im = strips[name]['frames'][i]['img']
        atlas[py:py + im.shape[0], px:px + im.shape[1]] = im
    return atlas, place

def write_atlas(cid, strips, out, place, atlas):
    used_w = int(max(px + strips[n]['frames'][i]['img'].shape[1] for (n, i), (px, py) in place.items()))
    atlas = atlas[:, :used_w]
    H, W = atlas.shape[:2]
    assert W <= 1600 and H <= 1600, (cid, W, H)
    fn = cid + '.webp'
    Image.fromarray(atlas).save(os.path.join(out, fn), 'WEBP', lossless=True, quality=100, method=6, exact=True)
    man = dict(img=fn, w=W, h=H, store=STORE, strips={})
    for name, s in strips.items():
        fr = []
        for i, f in enumerate(s['frames']):
            px, py = place[(name, i)]
            fr.append([int(px), int(py), int(f['img'].shape[1]), int(f['img'].shape[0]), round(f['ax'], 1), round(f['ay'], 1)])
        man['strips'][name] = dict(fps=s['fps'], loop=bool(s['loop']), ev=s['event'], f=fr)
    return man, os.path.getsize(os.path.join(out, fn))

# ------------------------------------------------------------------ review sheet
def review_sheet(cid, strips, path, ground_px=None):
    # every strip in a row, frames placed by anchor on a shared ground line, checkerboard behind
    rows = []
    for name, s in strips.items():
        fr = s['frames']
        up = max(f['ay'] for f in fr); down = max(f['img'].shape[0] - f['ay'] for f in fr)
        left = max(f['ax'] for f in fr); right = max(f['img'].shape[1] - f['ax'] for f in fr)
        cw = int(left + right + 12); rh = int(up + down + 26)
        canvas = Image.new('RGBA', (cw * len(fr) + 120, rh), (0, 0, 0, 0))
        rows.append((name, s, canvas, cw, up, left))
    W = max(r[2].width for r in rows); H = sum(r[2].height for r in rows)
    sheet = Image.new('RGB', (W, H), (40, 44, 52))
    # checkerboard
    ck = np.indices((H, W)).sum(0) // 8 % 2
    base = np.where(ck[..., None] == 0, np.array([58, 62, 74], np.uint8), np.array([30, 33, 40], np.uint8))
    sheet = Image.fromarray(base.astype(np.uint8))
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet); y = 0
    for name, s, canvas, cw, up, left in rows:
        d.text((4, y + 4), name, fill=(255, 230, 120))
        gy = int(y + 16 + up)
        d.line([(110, gy), (W, gy)], fill=(255, 80, 80), width=1)
        for i, f in enumerate(s['frames']):
            ox = int(120 + i * cw + left - f['ax']); oy = int(y + 16 + up - f['ay'])
            im = Image.fromarray(f['img'])
            sheet.paste(im, (ox, oy), im)
            axp = int(120 + i * cw + left)
            d.line([(axp, gy - 6), (axp, gy + 6)], fill=(80, 255, 120), width=1)
        y += canvas.height
    sheet.save(path)
    return sheet.size


# ------------------------------------------------------------------ effects, items, tiles, plates
# effects: (name, frames, fps, loop, size frame, CSS size of that frame's longest side)
FX_ROWS = [('pop', 5, 16, False, 1, 42.0), ('escape', 5, 16, False, 2, 52.0),
           ('dust', 4, 14, False, 2, 40.0), ('glint', 4, 8, True, 3, 22.0)]
# items: (sheet, object 1-4 in reading order, name, CSS size of the longest side)
ITEM_ROWS = [('pieces_treasures_a', 1, 'sunfruit', 28.0), ('pieces_treasures_a', 2, 'geode', 28.0),
             ('pieces_treasures_a', 3, 'starcog', 28.0), ('pieces_treasures_a', 4, 'pearl', 28.0),
             ('pieces_treasures_b', 1, 'opal', 28.0), ('pieces_treasures_b', 2, 'crescent', 40.0),
             ('pieces_treasures_b', 3, 'piphead', 24.0), ('pieces_treasures_b', 4, 'jar', 54.0)]
# tiles: per world the drawn ledge height in CSS px (the art's hanging crystals and icicles make some taller)
TILE_ROWS = {'moss_moon': 18.0, 'crystal_caverns': 22.0, 'rust_belt': 13.0, 'frost_ring': 21.0, 'magma_core': 16.0}
TILE = 36.0

def keyed_crop(path, box, green=False):
    rgb = np.asarray(Image.open(path).convert('RGB'))
    l, t, r, b = box
    return key_image(rgb[t:b, l:r], green)

def fg_bounds(al, th=0.5):
    ys, xs = np.nonzero(al > th)
    return int(xs.min()), int(ys.min()), int(xs.max() + 1), int(ys.max() + 1)

def finish(col, al, s, ax, ay, green=False, exact=None):
    """scale (uniform s, or exact (w,h) for the fg box), trim, return frame dict with anchor in output px"""
    if exact:
        x0, y0, x1, y1 = fg_bounds(al)
        col = col[y0:y1, x0:x1]; al = al[y0:y1, x0:x1]
        H, W = al.shape
        pm = col * al[..., None]
        chans = [np.asarray(Image.fromarray(pm[..., i].astype(np.float32)).resize(exact, Image.LANCZOS)) for i in range(3)]
        aa = np.clip(np.asarray(Image.fromarray(al.astype(np.float32)).resize(exact, Image.LANCZOS)), 0, 1)
        cr = np.where(aa[..., None] > 1e-3, np.clip(np.stack(chans, -1), 0, 255) / np.maximum(aa[..., None], 1e-3), 0)
        cr = despill(np.clip(cr, 0, 255), aa, green)
        return dict(img=to_rgba_u8(cr, aa), ax=exact[0] / 2.0, ay=exact[1] / 2.0)
    cr, ar = resample(col, al, s)
    cr = despill(cr, ar, green)
    ys, xs = np.nonzero(ar > 0.02)
    x0, x1 = max(0, xs.min() - 2), min(ar.shape[1], xs.max() + 3)
    y0, y1 = max(0, ys.min() - 2), min(ar.shape[0], ys.max() + 3)
    return dict(img=to_rgba_u8(cr[y0:y1, x0:x1], ar[y0:y1, x0:x1]), ax=ax * s - x0, ay=ay * s - y0)

def cut_fx(src, meas):
    R = os.path.join(src, 'BUBBLENAUT-Remaining-19-Assets', 'effects')
    strips = {}
    for name, n, fps, loop, sizef, css in FX_ROWS:
        fr = meas['fx_' + name]; assert len(fr) == n
        path = os.path.join(R, 'fx_%s.png' % name)
        W = Image.open(path).width; H = Image.open(path).height
        x0, y0, x1, y1 = fr[sizef - 1]['fg']
        s = css * STORE / max(x1 - x0, y1 - y0)
        frames = []
        for i in range(n):
            l, t, r, b = fr[i]['slice']
            col, al = keyed_crop(path, fr[i]['slice'])
            # Astra centred every effect frame in an equal nominal cell: the shared centre is that cell's middle
            cx = (i + 0.5) * W / n - l; cy = H / 2.0 - t
            frames.append(finish(col, al, s, cx, cy))
        strips[name] = dict(fps=fps, loop=loop, event=0, frames=frames)
        print('  fx %-8s scale %.4f' % (name, s), flush=True)
    return strips

def cut_items(src, meas):
    R = os.path.join(src, 'BUBBLENAUT-Remaining-19-Assets', 'pieces')
    strips = {}
    for sheet, obj, name, css in ITEM_ROWS:
        reg = meas[sheet][obj - 1]
        col, al = keyed_crop(os.path.join(R, sheet + '.png'), reg['slice'])
        x0, y0, x1, y1 = fg_bounds(al)
        s = css * STORE / max(x1 - x0, y1 - y0)
        strips[name] = dict(fps=1, loop=False, event=0, frames=[finish(col, al, s, (x0 + x1) / 2.0, (y0 + y1) / 2.0)])
    return strips

def cut_tiles(src, meas, world):
    R = os.path.join(src, 'BUBBLENAUT-Remaining-19-Assets', 'pieces')
    path = os.path.join(R, 'pieces_%s.png' % world)
    sh = meas['pieces_' + world]
    strips = {}; extra = {}
    # ledge: one picture, drawn by the game as left cap + mirrored repeats of the middle + right cap
    col, al = keyed_crop(path, sh[0]['slice'])
    x0, y0, x1, y1 = fg_bounds(al)
    s = TILE_ROWS[world] * STORE / (y1 - y0)
    f = finish(col, al, s, x0, y0)
    a = f['img'][..., 3] > 128
    cov = a.sum(1) / float(a.shape[1])
    sy = int(np.argmax(cov > 0.6))           # first row the slab covers: the walking surface
    w = f['img'].shape[1]
    extra['ledge'] = dict(sy=sy, capL=int(round(w * 0.22)), capR=int(round(w * 0.22)))
    strips['ledge'] = dict(fps=1, loop=False, event=0, frames=[f])
    # wall block: exactly one cell
    col, al = keyed_crop(path, sh[1]['slice'])
    strips['block'] = dict(fps=1, loop=False, event=0, frames=[finish(col, al, 1, 0, 0, exact=(int(TILE * STORE), int(TILE * STORE)))])
    # capped block: the block part (bottom rows) is one cell wide; the cap rises above and may overhang
    col, al = keyed_crop(path, sh[2]['slice'])
    x0, y0, x1, y1 = fg_bounds(al)
    rows = al[y1 - max(4, (y1 - y0) // 4):y1] > 0.5
    widths = [np.nonzero(r_)[0] for r_ in rows]
    lefts = np.median([w_.min() for w_ in widths if w_.size]); rights = np.median([w_.max() + 1 for w_ in widths if w_.size])
    s = TILE * STORE / (rights - lefts)
    strips['capped'] = dict(fps=1, loop=False, event=0, frames=[finish(col, al, s, (lefts + rights) / 2.0, y1)])
    # decoration: fits a 34 px box, stands on its base
    col, al = keyed_crop(path, sh[3]['slice'])
    x0, y0, x1, y1 = fg_bounds(al)
    s = 34.0 * STORE / max(x1 - x0, y1 - y0)
    strips['deco'] = dict(fps=1, loop=False, event=0, frames=[finish(col, al, s, (x0 + x1) / 2.0, y1)])
    return strips, extra

def cut_plates(src, out, game_dir):
    R = os.path.join(src, 'BUBBLENAUT-Remaining-19-Assets')
    plates = {}
    def crop916(im):
        W, H = im.size; w = int(round(H * 9 / 16.0))
        if w > W: w = W
        x = (W - w) // 2
        return im.crop((x, 0, x + w, H))
    for world in TILE_ROWS:
        im = crop916(Image.open(os.path.join(R, 'backgrounds', 'bg_%s.png' % world)).convert('RGB'))
        fn = 'bg_%s.webp' % world
        im.save(os.path.join(out, fn), 'WEBP', lossless=True, quality=100, method=6)
        plates['bg_' + world] = dict(img=fn, w=im.width, h=im.height)
    im = crop916(Image.open(os.path.join(R, 'promo', 'title_art.png')).convert('RGB'))
    im.save(os.path.join(out, 'title.webp'), 'WEBP', lossless=True, quality=100, method=6)
    plates['title'] = dict(img='title.webp', w=im.width, h=im.height)
    # home screen icons (the manifest names them), share card, and the Play kit parked for the listing
    icon = Image.open(os.path.join(R, 'promo', 'app_icon.png')).convert('RGB')
    for n in (192, 512):
        icon.resize((n, n), Image.LANCZOS).save(os.path.join(game_dir, 'icon-%d-v2.png' % n), optimize=True)
    ban = Image.open(os.path.join(R, 'promo', 'store_banner.png')).convert('RGB')
    W, H = ban.size
    ch = int(round(W * 630 / 1200.0)); y = (H - ch) // 2
    ban.crop((0, y, W, y + ch)).resize((1200, 630), Image.LANCZOS).save(os.path.join(game_dir, 'og', 'card-v2.png'), optimize=True)
    store = os.path.join(os.path.dirname(os.path.dirname(game_dir)), 'store', 'bubblenaut-play')
    os.makedirs(store, exist_ok=True)
    ch = int(round(W * 500 / 1024.0)); y = (H - ch) // 2
    ban.crop((0, y, W, y + ch)).resize((1024, 500), Image.LANCZOS).save(os.path.join(store, 'feature-graphic-1024x500.png'), optimize=True)
    icon.resize((512, 512), Image.LANCZOS).save(os.path.join(store, 'play-icon-512.png'), optimize=True)
    Image.open(os.path.join(R, 'promo', 'title_art.png')).convert('RGB').save(os.path.join(store, 'key-art-1024x1536.png'), optimize=True)
    for k, v in plates.items():
        print('  plate %-22s %dx%d %d KB' % (v['img'], v['w'], v['h'], os.path.getsize(os.path.join(out, v['img'])) // 1024), flush=True)
    return plates

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--src', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--only', default='')
    p.add_argument('--review', default='')
    p.add_argument('--register', action='store_true', help='recompute SIFT registration (needs OpenCV)')
    p.add_argument('--game-dir', default='', help='where the icons and og card go (default: the folder above art/)')
    a = p.parse_args()
    meas, M, R = load_meas(a.src)
    os.makedirs(a.out, exist_ok=True)
    if a.review: os.makedirs(a.review, exist_ok=True)
    reg = json.load(open(REG_PATH)) if os.path.exists(REG_PATH) else {}
    only = [x for x in a.only.split(',') if x]
    manifest = {}
    man_path = os.path.join(a.out, 'manifest.json')
    if os.path.exists(man_path): manifest = json.load(open(man_path))
    for cid, ch in CHARS.items():
        if only and cid not in only: continue
        print('==', cid, flush=True)
        need_chain = any(r[0] in CHAIN and not any(x and x['n'] >= 15 for x in reg.get(strip_file(ch, r[0]), [None]))
                         and ('chain:' + strip_file(ch, r[0])) not in reg for r in ch['strips'])
        if a.register or need_chain or any(strip_file(ch, r[0]) not in reg for r in ch['strips']):
            reg.update(register_char(ch, os.path.join(a.src, 'BUBBLENAUT-Main-Assets'), meas))
            json.dump(reg, open(REG_PATH, 'w'), indent=0)
        strips, info = cut_char(ch, a.src, meas, reg, a.review)
        atlas, place = pack(strips)
        man, size = write_atlas(cid, strips, a.out, place, atlas)
        man['info'] = info
        if 'trapped' in strips:
            md = max(max(f['img'].shape[0], f['img'].shape[1]) for f in strips['trapped']['frames']) / STORE
            man['bubbleFit'] = round(min(1.0, 34.0 / md), 3)
            print('  bubble fit %.3f (trapped longest side %.1f css)' % (man['bubbleFit'], md), flush=True)
        manifest[cid] = man
        print('  atlas %s %dx%d %d KB' % (man['img'], man['w'], man['h'], size // 1024), flush=True)
        if a.review:
            print('  review', review_sheet(cid, strips, os.path.join(a.review, cid + '.png')), flush=True)
    game_dir = os.path.dirname(os.path.dirname(os.path.abspath(a.out))) if os.path.basename(os.path.dirname(os.path.abspath(a.out))) == 'art' else None
    groups = [('fx', lambda: (cut_fx(a.src, meas), {}))] + [('items', lambda: (cut_items(a.src, meas), {}))] +              [('tiles_' + w, (lambda w=w: cut_tiles(a.src, meas, w))) for w in TILE_ROWS]
    for gid, fn in groups:
        if only and gid not in only and not ('tiles' in only and gid.startswith('tiles_')): continue
        print('==', gid, flush=True)
        strips, extra = fn()
        atlas, place = pack(strips)
        man, size = write_atlas(gid, strips, a.out, place, atlas)
        man.update(extra); manifest[gid] = man
        print('  atlas %s %dx%d %d KB' % (man['img'], man['w'], man['h'], size // 1024), flush=True)
        if a.review: review_sheet(gid, strips, os.path.join(a.review, gid + '.png'))
    if (not only or 'plates' in only):
        print('== plates', flush=True)
        gd = a.game_dir or game_dir
        manifest['plates'] = cut_plates(a.src, a.out, gd)
    json.dump(manifest, open(man_path, 'w'), indent=1)

if __name__ == '__main__':
    main()
