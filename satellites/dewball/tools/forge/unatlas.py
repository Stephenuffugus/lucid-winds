#!/usr/bin/env python3
"""Dewball forge UNATLAS: a kind another world already SHIPS, turned back into a fitted file
that atlas.py can put into a new world's atlas (a world draws models only from its own atlas).

    python3 satellites/dewball/tools/forge/unatlas.py --kind barrel --from w4 [--from w1 ...] \
        --out <fitted dir>          (writes <out>/<kind>.glb, an uncompressed GLB with its own texture)

Why: the fitted and clean files of w1 to w4 lived in the forge's git ignored folders on the
October box, and the raw Meshy files in the private vault; the 1 Nov box has neither. The
SERVED file is exact: dewfit's fitted mesh (gltfpack -noq keeps float positions, -kv the UVs),
its UVs pointing into that world's atlas, already in the clean layout. So: decode it with
gltfpack (no -cc), find its square in the atlas from its UVs (atlas.py packs buddy squares
aligned to their own side, a 4 px gutter inside), cut the square's inner part out of the
world's atlas.jpg, map the UVs back to 0..1 of that cut and embed the cut as the base colour.
Of several --from worlds the one that gave the kind the BIGGEST square wins (most pixels).
⛔ The picture is the old atlas's JPEG (one JPEG generation more than a fresh paint): say so
   in the picks file, and look at it in the game camera like any other kind.
"""
import argparse, io, json, os, struct, subprocess, sys, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(os.path.dirname(HERE))


# the GLB readers, as atlas.py's (atlas.py runs on import, so they are copied, not imported)
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


def acc_read(js, bin_, ai, comps):
    """an accessor as a list of tuples (float VEC2/VEC3, or SCALAR indices of any unsigned width)"""
    acc = js['accessors'][ai]
    v = js['bufferViews'][acc['bufferView']]
    base = v.get('byteOffset', 0) + acc.get('byteOffset', 0)
    fmt = {5126: 'f', 5125: 'I', 5123: 'H', 5121: 'B'}[acc['componentType']]
    size = struct.calcsize('<' + fmt)
    step = v.get('byteStride') or size * comps
    return [struct.unpack_from('<' + fmt * comps, bin_, base + i * step) for i in range(acc['count'])], base, step


def square_of(uv, W, H, pad):
    us = [u * W for u, v in uv]; vs = [v * H for u, v in uv]
    x0, x1, y0, y1 = min(us), max(us), min(vs), max(vs)
    s = 64
    while s <= 1024:
        sx, sy = int((x0 - pad) // s) * s, int((y0 - pad) // s) * s
        if x1 <= sx + s and y1 <= sy + s and x0 >= sx and y0 >= sy:
            return sx, sy, s
        s *= 2
    raise ValueError('no buddy square holds UVs %.1f..%.1f x %.1f..%.1f' % (x0, x1, y0, y1))


def one(kind, world, tmp, pad):
    served = os.path.join(GAME, 'assets', '3d', world, kind + '.glb')
    if not os.path.exists(served):
        return None
    dec = os.path.join(tmp, '%s.%s.glb' % (kind, world))
    subprocess.run(['gltfpack', '-kn', '-km', '-kv', '-noq', '-i', served, '-o', dec], check=True, capture_output=True)
    js, bin_ = read_glb(dec)
    prims = [pr for m in js['meshes'] for pr in m['primitives']]
    if len(prims) != 1:
        raise ValueError('%s %s: %d primitives' % (world, kind, len(prims)))
    atlas = Image.open(os.path.join(GAME, 'assets', '3d', world, 'atlas.jpg')).convert('RGB')
    W, H = atlas.size
    uv, base, step = acc_read(js, bin_, prims[0]['attributes']['TEXCOORD_0'], 2)
    x, y, s = square_of(uv, W, H, pad)
    return dict(js=js, bin=bin_, uv=uv, base=base, step=step, atlas=atlas, W=W, H=H, slot=(x, y, s), world=world)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--kind', required=True)
    p.add_argument('--from', dest='worlds', action='append', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--pad', type=int, default=4)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        got = [g for g in (one(a.kind, w, tmp, a.pad) for w in a.worlds) if g]
        if not got:
            sys.exit('%s: shipped by none of %s' % (a.kind, a.worlds))
        for g in got:
            print('  %s %s: square %d px at %d,%d' % (a.kind, g['world'], g['slot'][2], g['slot'][0], g['slot'][1]))
        g = max(got, key=lambda g: (g['slot'][2], -a.worlds.index(g['world'])))
        js, bin_ = g['js'], g['bin']
        x, y, s = g['slot']
        inner = s - 2 * a.pad
        cut = g['atlas'].crop((x + a.pad, y + a.pad, x + a.pad + inner, y + a.pad + inner))
        for i, (u, v) in enumerate(g['uv']):
            nu = min(max((u * g['W'] - x - a.pad) / inner, 0.0), 1.0)
            nv = min(max((v * g['H'] - y - a.pad) / inner, 0.0), 1.0)
            struct.pack_into('<ff', bin_, g['base'] + i * g['step'], nu, nv)
        buf = io.BytesIO(); cut.save(buf, 'JPEG', quality=95); jpg = buf.getvalue()
        off = len(bin_) + ((4 - len(bin_) % 4) % 4)
        bin_ += b'\0' * (off - len(bin_)) + jpg
        js.setdefault('bufferViews', []).append({'buffer': 0, 'byteOffset': off, 'byteLength': len(jpg)})
        js['images'] = [{'bufferView': len(js['bufferViews']) - 1, 'mimeType': 'image/jpeg'}]
        js['samplers'] = [{}]
        js['textures'] = [{'source': 0, 'sampler': 0}]
        pr = [pr for m in js['meshes'] for pr in m['primitives']][0]
        if 'material' not in pr:
            js.setdefault('materials', []).append({'name': 'dw_' + a.kind})
            pr['material'] = len(js['materials']) - 1
        mat = js['materials'][pr['material']]
        mat.setdefault('pbrMetallicRoughness', {})['baseColorTexture'] = {'index': 0}
        js.pop('extensionsUsed', None); js.pop('extensionsRequired', None)
        out = os.path.join(a.out, a.kind + '.glb')
        write_glb(out, js, bin_)
        print('unatlas %s from %s (%d px square, %d px picture) -> %s' % (a.kind, g['world'], s, inner, os.path.relpath(out, GAME)))


main()
