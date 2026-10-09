#!/usr/bin/env python3
"""Dewball forge ATLAS: one texture per world, so a world's models cost one 2048 square
on the GPU instead of one map each (15 own maps measured about 26 MB against the plan's
24 MB fence; a 2048x1536 atlas with mips is 16.8 MB however many kinds share it).

    python3 satellites/dewball/tools/forge/atlas.py --world w1 \
        --in w1:t2=satellites/dewball/tools/forge/fitted/t2 [--in more dirs] \
        --kinds crumb,cookie,... --out satellites/dewball/tools/forge/atlased/w1 [--size 2048]

For each kind it reads the FITTED glb (Blender's export: uncompressed, one mesh, one
material, the base colour as an embedded JPEG), gives it a square in the atlas by tier
by how big the thing is in the world, not by its role: a square side by the primitive's
largest extent (60 cm and up 512, 25 cm and up 256, smaller 128; landmarks 512; tier C
and D 64), because a 95 cm cereal box fills the screen beside a 4 cm ball while a 4 cm
butterfly never does. If the set does not fit, the smallest kinds of the biggest class
step down one size until it does, and every step down is printed. Buddy allocation, so
the squares tile the atlas exactly. The picture comes from the RAW Meshy file (2048 px)
when it is there (--raw), not the fitted one (dewfit capped it at the tier budget, 256 px
for a B kind): the fit keeps the UVs, so the raw image maps the fitted mesh exactly, pastes its texture scaled into the square minus a gutter
and smears the edge pixels out into the gutter (mip levels average neighbours; without
the smear a slot's border bleeds into the next kind's colours), rewrites TEXCOORD_0 into
the square, and drops every texture reference from the file so gltfpack's pack (-kv keeps
the UVs) leaves the image out. Writes <out>/<kind>.glb, <out>/atlas.jpg, <out>/atlas.json.

⛔ UVs outside 0..1 cannot live in an atlas (they wrap): such a kind is REFUSED with its
   numbers, never silently squashed. ⛔ glTF UV (0,0) is the image's TOP left, as PIL's.
"""
import argparse, io, json, os, struct, sys
from PIL import Image
try:
    import numpy as np            # the clean layout bake (pip install --user numpy)
except ImportError:
    np = None

HERE = os.path.dirname(os.path.abspath(__file__))
MAN = {k['id']: k for k in json.load(open(os.path.join(HERE, 'manifest.json')))['kinds']}


def read_glb(path):
    b = open(path, 'rb').read()
    magic, ver, length = struct.unpack_from('<III', b, 0)
    if magic != 0x46546C67:
        raise ValueError('not a GLB: ' + path)
    jlen, jtype = struct.unpack_from('<II', b, 12)
    js = json.loads(b[20:20 + jlen].decode('utf-8'))
    off = 20 + jlen
    blen, btype = struct.unpack_from('<II', b, off)
    bin_ = bytearray(b[off + 8: off + 8 + blen])
    return js, bin_


def write_glb(path, js, bin_):
    bb = bytes(bin_) + b'\0' * ((4 - len(bin_) % 4) % 4)
    js['buffers'][0]['byteLength'] = len(bin_)
    j = json.dumps(js, separators=(',', ':')).encode('utf-8')
    j += b' ' * ((4 - len(j) % 4) % 4)
    total = 12 + 8 + len(j) + 8 + len(bb)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(j), 0x4E4F534A)); f.write(j)
        f.write(struct.pack('<II', len(bb), 0x004E4942)); f.write(bb)


def view_bytes(js, bin_, vi):
    v = js['bufferViews'][vi]
    o = v.get('byteOffset', 0)
    return o, v['byteLength'], v.get('byteStride')


CLASSES = [(60, 512), (25, 256), (0, 128)]       # (largest extent in cm at least, square side)


def acc_read(js, bin_, ai, comps):
    """an accessor as a list of tuples (float VEC2/VEC3, or SCALAR indices of any unsigned width)"""
    acc = js['accessors'][ai]
    v = js['bufferViews'][acc['bufferView']]
    base = v.get('byteOffset', 0) + acc.get('byteOffset', 0)
    fmt = {5126: 'f', 5125: 'I', 5123: 'H', 5121: 'B'}[acc['componentType']]
    size = struct.calcsize('<' + fmt)
    step = v.get('byteStride') or size * comps
    return [struct.unpack_from('<' + fmt * comps, bin_, base + i * step) for i in range(acc['count'])], base, step


def pushpull(col, has):
    """fill every empty texel with the average of the nearest painted ones, scale by scale"""
    levels = []
    c = col * has[..., None]
    w = has.astype(np.float64)
    while c.shape[0] > 1 or c.shape[1] > 1:
        levels.append((c, w))
        H, W = c.shape[:2]
        H2, W2 = (H + 1) // 2, (W + 1) // 2
        c = np.pad(c, ((0, H2 * 2 - H), (0, W2 * 2 - W), (0, 0))).reshape(H2, 2, W2, 2, 3).sum((1, 3))
        w = np.pad(w, ((0, H2 * 2 - H), (0, W2 * 2 - W))).reshape(H2, 2, W2, 2).sum((1, 3))
    filled = c / np.maximum(w, 1e-9)[..., None]
    for c_l, w_l in reversed(levels):
        H, W = c_l.shape[:2]
        up = np.repeat(np.repeat(filled, 2, 0), 2, 1)[:H, :W]
        filled = np.where(w_l[..., None] > 0, c_l / np.maximum(w_l, 1e-9)[..., None], up)
    return filled


def clean_bake(img, uv0, uv1, tris, S, ss=4):
    """paint each triangle from Meshy's picture (sampled through its OLD uvs) into the CLEAN layout,
       ss x ss samples per texel, never reading across a triangle's own edge; then fill the margins"""
    src = np.asarray(img, dtype=np.float64)
    H0, W0 = src.shape[:2]
    acc = np.zeros((S * S, 3)); cnt = np.zeros(S * S)
    P = np.asarray(uv1, dtype=np.float64) * S
    Q = np.asarray(uv0, dtype=np.float64) * np.array([W0, H0])

    def sample(x, y):                                   # bilinear, texel centres at +0.5
        x = np.clip(x - 0.5, 0, W0 - 1); y = np.clip(y - 0.5, 0, H0 - 1)
        x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
        x1 = np.minimum(x0 + 1, W0 - 1); y1 = np.minimum(y0 + 1, H0 - 1)
        fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
        return (src[y0, x0] * (1 - fx) * (1 - fy) + src[y0, x1] * fx * (1 - fy)
                + src[y1, x0] * (1 - fx) * fy + src[y1, x1] * fx * fy)

    for i, j, k in tris:
        a, b, c = P[i], P[j], P[k]
        x0 = max(int(np.floor(min(a[0], b[0], c[0]))), 0); x1 = min(int(np.ceil(max(a[0], b[0], c[0]))), S)
        y0 = max(int(np.floor(min(a[1], b[1], c[1]))), 0); y1 = min(int(np.ceil(max(a[1], b[1], c[1]))), S)
        v0 = b - a; v1 = c - a
        d = v0[0] * v1[1] - v1[0] * v0[1]
        if x1 <= x0 or y1 <= y0 or abs(d) < 1e-12:
            continue
        xs = (np.arange(x0 * ss, x1 * ss) + 0.5) / ss
        ys = (np.arange(y0 * ss, y1 * ss) + 0.5) / ss
        X, Y = np.meshgrid(xs, ys)
        px = X - a[0]; py = Y - a[1]
        lb = (px * v1[1] - v1[0] * py) / d
        lc = (v0[0] * py - px * v0[1]) / d
        la = 1 - lb - lc
        inside = (la >= -1e-6) & (lb >= -1e-6) & (lc >= -1e-6)
        if not inside.any():                              # smaller than a sample: its centroid
            la = lb = lc = np.array([1 / 3.0])
            X = np.array([(a[0] + b[0] + c[0]) / 3]); Y = np.array([(a[1] + b[1] + c[1]) / 3])
            inside = np.array([True])
        else:
            la, lb, lc, X, Y = la[inside], lb[inside], lc[inside], X[inside], Y[inside]
        ox = la * Q[i, 0] + lb * Q[j, 0] + lc * Q[k, 0]
        oy = la * Q[i, 1] + lb * Q[j, 1] + lc * Q[k, 1]
        tx = np.clip(np.floor(X).astype(int), 0, S - 1); ty = np.clip(np.floor(Y).astype(int), 0, S - 1)
        lin = ty * S + tx
        np.add.at(acc, lin, sample(ox, oy)); np.add.at(cnt, lin, 1)
    has = (cnt > 0).reshape(S, S)
    col = (acc / np.maximum(cnt, 1e-9)[:, None]).reshape(S, S, 3)
    out = pushpull(col, has)
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype('uint8'), 'RGB'), float(has.mean())


def slot_size(kind):
    k = MAN[kind]
    if k['role'] == 'landmark':
        return 512
    if k['tier'] in ('C', 'D'):
        return 64
    big = max(k['bbox'])
    return next(side for cm, side in CLASSES if big >= cm)


def fit_slots(kinds, W, H, grow=True):
    """slot sides by size class, stepped down smallest first until the buddy pack fits;
       then (grow) the room left over is handed out: the kind with the FEWEST texture pixels
       per centimetre of its own size doubles, again and again, while the pack still fits
       and no square passes 512. The atlas costs the same 16 MB full or empty."""
    sizes = {k: slot_size(k) for k in kinds}
    steps = []
    while True:
        try:
            packed = buddy_pack(sizes, W, H)
            break
        except RuntimeError:
            top = max(v for k, v in sizes.items() if MAN[k]['role'] != 'landmark' and v > 64)
            k = min((k for k, v in sizes.items() if v == top and MAN[k]['role'] != 'landmark'), key=lambda k: max(MAN[k]['bbox']))
            sizes[k] //= 2
            steps.append('%s %d -> %d' % (k, top, sizes[k]))
    if grow and not steps:
        maxed = set(k for k, v in sizes.items() if v >= 512 or MAN[k]['tier'] in ('C', 'D'))
        while True:
            cand = [k for k in sizes if k not in maxed]
            if not cand:
                break
            k = min(cand, key=lambda k: (sizes[k] / max(MAN[k]['bbox']), k))
            trial = dict(sizes); trial[k] *= 2
            try:
                packed = buddy_pack(trial, W, H)
                steps.append('%s %d -> %d (room left over)' % (k, sizes[k], trial[k]))
                sizes = trial
                if sizes[k] >= 512:
                    maxed.add(k)
            except RuntimeError:
                maxed.add(k)
        packed = buddy_pack(sizes, W, H)
    return packed, sizes, steps


def buddy_pack(sizes, W, H):
    """sizes: {kind: s} with s a power of two; returns {kind: (x, y, s)} or raises. The
       atlas starts as a grid of root squares (2048x1536 = twelve 512 squares)."""
    r = W
    while W % r or H % r:
        r //= 2
    free = [(x, y, r) for y in range(0, H, r) for x in range(0, W, r)]
    out = {}
    for kind, s in sorted(sizes.items(), key=lambda kv: (-kv[1], kv[0])):
        free.sort(key=lambda f: (f[2], f[1], f[0]))
        cand = [f for f in free if f[2] >= s]
        if not cand:
            raise RuntimeError('atlas full: no %d square left for %s' % (s, kind))
        f = cand[0]
        free.remove(f)
        x, y, fs = f
        while fs > s:                       # split into four, keep the top left, free the rest
            h = fs // 2
            free += [(x + h, y, h), (x, y + h, h), (x + h, y + h, h)]
            fs = h
        out[kind] = (x, y, s)
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--world', required=True)
    p.add_argument('--in', dest='ins', action='append', required=True, help='label=dir of fitted glbs; first match wins')
    p.add_argument('--kinds', default='')
    p.add_argument('--picks', default='', help='a picks json {"world": "w1", "use": {kind: arm}}: the kinds AND the arm each one ships')
    p.add_argument('--out', required=True)
    p.add_argument('--size', default='2048x1536', help='WxH; 2048x1536 with mips is 16.8 MB on the GPU')
    p.add_argument('--raw', default=os.path.join(HERE, 'meshy-out'), help='raw Meshy files <kind>.<arm>.glb; their 2048 px picture is used when present')
    p.add_argument('--pad', type=int, default=4)
    p.add_argument('--quality', type=int, default=88)
    a = p.parse_args()
    arms = [x.split('=', 1) for x in a.ins]
    dirs = [d for _, d in arms]
    kinds = [k for k in a.kinds.split(',') if k]
    picks = json.load(open(a.picks))['use'] if a.picks else {}
    if picks and kinds:
        sys.exit('give --kinds or --picks, not both')
    kinds = kinds or sorted(picks)
    os.makedirs(a.out, exist_ok=True)
    W, H = (int(v) for v in a.size.lower().split('x'))
    pad = a.pad
    src, arm_of = {}, {}
    for k in kinds:
        hit = next(((arm, os.path.join(d, k + '.glb')) for arm, d in arms
                    if (not picks or picks[k] == arm) and os.path.exists(os.path.join(d, k + '.glb'))), None)
        if not hit:
            sys.exit('no fitted glb for %s in %s' % (k, dirs))
        arm_of[k], src[k] = hit
    slots, sizes, steps = fit_slots(kinds, W, H)
    for st in steps:
        print('  ' + ('grown: ' if 'room left' in st else 'stepped down to fit: ') + st)
    atlas = Image.new('RGB', (W, H), (128, 128, 128))
    report, refused = {}, []
    for k in kinds:
        js, bin_ = read_glb(src[k])
        prims = [pr for m in js['meshes'] for pr in m['primitives']]
        if len(prims) != 1:
            refused.append('%s: %d primitives (dewfit joins to one)' % (k, len(prims))); continue
        pr = prims[0]
        mat = js['materials'][pr['material']] if 'material' in pr else None
        tex = (((mat or {}).get('pbrMetallicRoughness') or {}).get('baseColorTexture') or {}).get('index')
        if tex is None:
            refused.append('%s: no base colour texture' % k); continue
        img_i = js['textures'][tex]['source']
        o, n, _ = view_bytes(js, bin_, js['images'][img_i]['bufferView'])
        img = Image.open(io.BytesIO(bytes(bin_[o:o + n]))).convert('RGB')
        picture = 'fitted %dpx' % img.size[0]
        raw = os.path.join(a.raw, '%s.%s.glb' % (k, arm_of[k]))
        if os.path.exists(raw):
            rjs, rbin = read_glb(raw)
            rm = rjs['materials'][0].get('pbrMetallicRoughness', {}).get('baseColorTexture')
            if rm is not None:
                ro, rn, _ = view_bytes(rjs, rbin, rjs['images'][rjs['textures'][rm['index']]['source']]['bufferView'])
                rimg = Image.open(io.BytesIO(bytes(rbin[ro:ro + rn]))).convert('RGB')
                if rimg.size[0] > img.size[0]:
                    img, picture = rimg, 'raw %dpx' % rimg.size[0]
        acc = js['accessors'][pr['attributes']['TEXCOORD_0']]
        if acc['componentType'] != 5126 or acc['type'] != 'VEC2':
            refused.append('%s: TEXCOORD_0 is not float VEC2' % k); continue
        uv, base, step = acc_read(js, bin_, pr['attributes']['TEXCOORD_0'], 2)
        clean = 'TEXCOORD_1' in pr['attributes'] and np is not None
        if clean:
            uv1, _, _ = acc_read(js, bin_, pr['attributes']['TEXCOORD_1'], 2)
            if 'indices' in pr:
                ix = [t[0] for t in acc_read(js, bin_, pr['indices'], 1)[0]]
            else:
                ix = list(range(len(uv)))
            tris = [(ix[q], ix[q + 1], ix[q + 2]) for q in range(0, len(ix) - 2, 3)]
        lay = uv1 if clean else uv
        us = [u for u, v in lay]; vs = [v for u, v in lay]
        lo, hi = min(min(us), min(vs)), max(max(us), max(vs))
        if lo < -0.002 or hi > 1.002:
            refused.append('%s: UVs run %.3f..%.3f, outside 0..1 (they wrap)' % (k, lo, hi)); continue
        x, y, s = slots[k]
        inner = s - 2 * pad
        if clean:
            tile, painted = clean_bake(img, uv, uv1, tris, inner)
            picture += ', painted into a clean layout (%d%% of the square)' % round(painted * 100)
        else:
            tile = img.resize((inner, inner), Image.LANCZOS)
        atlas.paste(tile, (x + pad, y + pad))
        # smear the slot's own edge pixels out across its gutter (top, bottom, left, right, corners)
        top = tile.crop((0, 0, inner, 1)).resize((inner, pad)); atlas.paste(top, (x + pad, y))
        bot = tile.crop((0, inner - 1, inner, inner)).resize((inner, pad)); atlas.paste(bot, (x + pad, y + pad + inner))
        lef = tile.crop((0, 0, 1, inner)).resize((pad, inner)); atlas.paste(lef, (x, y + pad))
        rig = tile.crop((inner - 1, 0, inner, inner)).resize((pad, inner)); atlas.paste(rig, (x + pad + inner, y + pad))
        for cx, cy, px in ((x, y, (0, 0)), (x + pad + inner, y, (inner - 1, 0)), (x, y + pad + inner, (0, inner - 1)),
                           (x + pad + inner, y + pad + inner, (inner - 1, inner - 1))):
            atlas.paste(Image.new('RGB', (pad, pad), tile.getpixel(px)), (cx, cy))
        for i, (u, v) in enumerate(lay):
            struct.pack_into('<ff', bin_, base + i * step, (x + pad + u * inner) / W, (y + pad + v * inner) / H)
        if clean:
            del pr['attributes']['TEXCOORD_1']           # TEXCOORD_0 now holds the clean layout, in the atlas
        # the file no longer carries a picture: the world's atlas is its only texture
        pbr = mat.setdefault('pbrMetallicRoughness', {})
        pbr.pop('baseColorTexture', None)
        pbr['baseColorFactor'] = [1, 1, 1, 1]
        for key in ('normalTexture', 'occlusionTexture', 'emissiveTexture'):
            mat.pop(key, None)
        for key in ('textures', 'images', 'samplers'):
            js.pop(key, None)
        write_glb(os.path.join(a.out, k + '.glb'), js, bin_)
        report[k] = {'slot': [x, y, s], 'uv': [round(lo, 4), round(hi, 4)], 'from': os.path.relpath(src[k], HERE), 'picture': picture}
    atlas.save(os.path.join(a.out, 'atlas.jpg'), quality=a.quality, optimize=True)
    used = sum(r['slot'][2] ** 2 for r in report.values())
    meta = {'world': a.world, 'size': [W, H], 'pad': pad, 'classes': CLASSES, 'steppedDown': steps, 'kinds': report, 'refused': refused,
            'fill': round(used / (W * H), 3), 'gpuMB': round(W * H * 4 * 4 / 3 / 1048576, 1),
            'jpegKB': os.path.getsize(os.path.join(a.out, 'atlas.jpg')) // 1024}
    json.dump(meta, open(os.path.join(a.out, 'atlas.json'), 'w'), indent=1)
    print('atlas %s: %d kinds in %dx%d (%.0f%% filled), %d KB jpeg, about %.1f MB on the GPU with mips'
          % (a.world, len(report), W, H, meta['fill'] * 100, meta['jpegKB'], meta['gpuMB']))
    by = {}
    for k, r in report.items():
        by.setdefault(r['slot'][2], []).append(k)
    for side in sorted(by, reverse=True):
        print('  %4d px: %s' % (side, ', '.join(sorted(by[side]))))
    for r in refused:
        print('  REFUSED ' + r)
    if refused:
        sys.exit(1)


main()
