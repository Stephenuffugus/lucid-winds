#!/usr/bin/env python3
"""Dewball forge ATLAS: one texture per world, so a world's models cost one 2048 square
on the GPU instead of one map each (15 own maps measured about 26 MB against the plan's
24 MB fence; a 2048x1536 atlas with mips is 16.8 MB however many kinds share it).

    python3 satellites/dewball/tools/forge/atlas.py --world w1 \
        --in w1:t2=satellites/dewball/tools/forge/fitted/t2 [--in more dirs] \
        --kinds crumb,cookie,... --out satellites/dewball/tools/forge/atlased/w1 [--size 2048]

For each kind it reads the FITTED glb (Blender's export: uncompressed, one mesh, one
material, the base colour as an embedded JPEG), gives it a square in the atlas by tier
(landmark 512, tier A 256, tier B 128, tier C 64: the manifest's per kind budgets halved,
because the world's whole set must fit the plan's 24 MB with the game's own textures;
buddy allocation, so the squares tile the atlas exactly), pastes its texture scaled into the square minus a gutter
and smears the edge pixels out into the gutter (mip levels average neighbours; without
the smear a slot's border bleeds into the next kind's colours), rewrites TEXCOORD_0 into
the square, and drops every texture reference from the file so gltfpack's pack (-kv keeps
the UVs) leaves the image out. Writes <out>/<kind>.glb, <out>/atlas.jpg, <out>/atlas.json.

⛔ UVs outside 0..1 cannot live in an atlas (they wrap): such a kind is REFUSED with its
   numbers, never silently squashed. ⛔ glTF UV (0,0) is the image's TOP left, as PIL's.
"""
import argparse, io, json, os, struct, sys
from PIL import Image

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


SLOTS = {'landmark': 512, 'A': 256, 'B': 128, 'C': 64, 'D': 64}


def slot_size(kind):
    k = MAN[kind]
    return SLOTS['landmark'] if k['role'] == 'landmark' else SLOTS[k['tier']]


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
    p.add_argument('--kinds', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--size', default='2048x1536', help='WxH; 2048x1536 with mips is 16.8 MB on the GPU')
    p.add_argument('--slots', default='', help='override slot sides, e.g. A=256,B=128')
    p.add_argument('--pad', type=int, default=4)
    p.add_argument('--quality', type=int, default=88)
    a = p.parse_args()
    dirs = [x.split('=', 1)[1] for x in a.ins]
    kinds = [k for k in a.kinds.split(',') if k]
    os.makedirs(a.out, exist_ok=True)
    W, H = (int(v) for v in a.size.lower().split('x'))
    pad = a.pad
    for kv in filter(None, a.slots.split(',')):
        k, v = kv.split('='); SLOTS[k] = int(v)
    src = {}
    for k in kinds:
        f = next((os.path.join(d, k + '.glb') for d in dirs if os.path.exists(os.path.join(d, k + '.glb'))), None)
        if not f:
            sys.exit('no fitted glb for %s in %s' % (k, dirs))
        src[k] = f
    slots = buddy_pack({k: slot_size(k) for k in kinds}, W, H)
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
        acc = js['accessors'][pr['attributes']['TEXCOORD_0']]
        if acc['componentType'] != 5126 or acc['type'] != 'VEC2':
            refused.append('%s: TEXCOORD_0 is not float VEC2' % k); continue
        vo, vn, stride = view_bytes(js, bin_, acc['bufferView'])
        base = vo + acc.get('byteOffset', 0)
        step = stride or 8
        uv = [struct.unpack_from('<ff', bin_, base + i * step) for i in range(acc['count'])]
        us = [u for u, v in uv]; vs = [v for u, v in uv]
        lo, hi = min(min(us), min(vs)), max(max(us), max(vs))
        if lo < -0.002 or hi > 1.002:
            refused.append('%s: UVs run %.3f..%.3f, outside 0..1 (they wrap)' % (k, lo, hi)); continue
        x, y, s = slots[k]
        inner = s - 2 * pad
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
        for i, (u, v) in enumerate(uv):
            struct.pack_into('<ff', bin_, base + i * step, (x + pad + u * inner) / W, (y + pad + v * inner) / H)
        # the file no longer carries a picture: the world's atlas is its only texture
        pbr = mat.setdefault('pbrMetallicRoughness', {})
        pbr.pop('baseColorTexture', None)
        pbr['baseColorFactor'] = [1, 1, 1, 1]
        for key in ('normalTexture', 'occlusionTexture', 'emissiveTexture'):
            mat.pop(key, None)
        for key in ('textures', 'images', 'samplers'):
            js.pop(key, None)
        write_glb(os.path.join(a.out, k + '.glb'), js, bin_)
        report[k] = {'slot': [x, y, s], 'uv': [round(lo, 4), round(hi, 4)], 'from': os.path.relpath(src[k], HERE)}
    atlas.save(os.path.join(a.out, 'atlas.jpg'), quality=a.quality, optimize=True)
    used = sum(r['slot'][2] ** 2 for r in report.values())
    meta = {'world': a.world, 'size': [W, H], 'pad': pad, 'slots': SLOTS, 'kinds': report, 'refused': refused,
            'fill': round(used / (W * H), 3), 'gpuMB': round(W * H * 4 * 4 / 3 / 1048576, 1),
            'jpegKB': os.path.getsize(os.path.join(a.out, 'atlas.jpg')) // 1024}
    json.dump(meta, open(os.path.join(a.out, 'atlas.json'), 'w'), indent=1)
    print('atlas %s: %d kinds in %dx%d (%.0f%% filled), %d KB jpeg, about %.1f MB on the GPU with mips'
          % (a.world, len(report), W, H, meta['fill'] * 100, meta['jpegKB'], meta['gpuMB']))
    for r in refused:
        print('  REFUSED ' + r)
    if refused:
        sys.exit(1)


main()
