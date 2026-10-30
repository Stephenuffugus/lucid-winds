#!/usr/bin/env python3
"""The astra gate's fixture: an Astra shaped checkpoint zip made from the page's own sprites (the brief's section 9
layout, manifest, source grids and 8 bit RGBA strips), so the cutter's round trip can be proven exact, plus broken
variants each of which the cutter must refuse for its own reason.

  python3 -I test/astra_fixture.py <sprites.json> <out.zip> [--break KIND] [--tweak] [--elite]
      sprites.json: {key: {w, h, frames: {name: string}}} with the page's palette under "_palette" (16 hexes)
      --break offpalette | alpha | size | sun | feet | source | sha | slip | depth16
      --tweak  one pixel of hero.idle0 changed to another palette colour (a legal change)
      --elite  adds enemies/enemy_moth_elite.png, 24x24, the moth centred (a new key)
The PNG rows cycle the five filter types, so the cutter's decoder meets each of them."""
import sys, json, zlib, struct, hashlib, zipfile, io

FILES = {   # the brief's checklist: file, sprite key, frame names (None: the key's own names in the page's order)
    'hero/hero_idle.png': ('hero', ['idle0', 'idle1']), 'hero/hero_run.png': ('hero', ['run0', 'run1', 'run2', 'run3']),
    'hero/hero_jump.png': ('hero', ['jump']), 'hero/hero_fall.png': ('hero', ['fall']), 'hero/hero_cling.png': ('hero', ['cling']),
    'hero/hero_dive.png': ('hero', ['dive']), 'hero/hero_land.png': ('hero', ['land']), 'hero/hero_dead.png': ('hero', ['dead']),
    'enemies/enemy_moth.png': ('moth', None), 'enemies/enemy_icicle.png': ('icicle', None), 'enemies/enemy_jelly.png': ('jelly', None),
    'enemies/enemy_crawler.png': ('crawler', None), 'enemies/enemy_spark.png': ('spark', None),
    'world/film_tab.png': ('tab', None), 'world/beacon.png': ('beacon', None), 'world/trap_spike.png': ('spike', None),
    'world/trap_crusher.png': ('crusher', None), 'loot/loot_speck.png': ('speck', None), 'loot/loot_scroll.png': ('scroll', None),
    'loot/loot_blueprint.png': ('blueprint', None), 'loot/loot_chest.png': ('chest', None),
    'world/vine.png': ('vine', None), 'world/pipe.png': ('pipe', None),   # T1.5's sticky walls (the brief's held rows)
}


def chunk(t, d):
    return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)


def png(w, h, rgba, depth16=False):
    if depth16:
        raw = b''.join(b'\x00' + b''.join(bytes([v, v]) for v in rgba[y * w * 4:(y + 1) * w * 4]) for y in range(h))
        return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 16, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')
    stride, out, prev = w * 4, bytearray(), bytes(w * 4)
    for y in range(h):
        line, f = rgba[y * stride:(y + 1) * stride], y % 5
        enc = bytearray(stride)
        for x in range(stride):
            a = line[x - 4] if x >= 4 else 0
            b, c = prev[x], (prev[x - 4] if x >= 4 else 0)
            if f == 0:
                pr = 0
            elif f == 1:
                pr = a
            elif f == 2:
                pr = b
            elif f == 3:
                pr = (a + b) >> 1
            else:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if pa <= pb and pa <= pc else b if pb <= pc else c
            enc[x] = (line[x] - pr) & 255
        out += bytes([f]) + enc
        prev = line
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(out), 9)) + chunk(b'IEND', b'')


def strip(frames, w, h, pal, alpha_at=None):
    n = len(frames)
    rgba = bytearray(w * n * h * 4)
    for k, s in enumerate(frames):
        rows = s.split('/')
        for y in range(h):
            for x in range(w):
                ch = rows[y][x]
                o = (y * w * n + k * w + x) * 4
                if ch != '.':
                    hx = pal[int(ch, 16)]
                    rgba[o:o + 4] = bytes([int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16), 255])
    if alpha_at is not None:
        rgba[alpha_at * 4 + 3] = 128
    return bytes(rgba)


def main(argv):
    src, out = argv[0], argv[1]
    brk = argv[argv.index('--break') + 1] if '--break' in argv else None
    S = json.load(open(src, encoding='utf-8'))
    pal = S.pop('_palette')
    if '--tweak' in argv:
        r = S['hero']['frames']['idle0'].split('/')
        i = r[5].index('e')
        r[5] = r[5][:i] + '7' + r[5][i + 1:]
        S['hero']['frames']['idle0'] = '/'.join(r)
    plan = []
    for f, (key, names) in FILES.items():
        if key in S:
            plan.append((f, key, names or list(S[key]['frames'])))
    if '--elite' in argv:
        m = S['moth']
        S['moth_elite'] = {'w': 24, 'h': 24, 'frames': {n: '/'.join(['.' * 24] * 4 + ['....' + r + '....' for r in s.split('/')] + ['.' * 24] * 4) for n, s in m['frames'].items()}}
        plan.append(('enemies/enemy_moth_elite.png', 'moth_elite', list(m['frames'])))
    entries, members = [], {}
    for f, key, names in plan:
        sp = S[key]
        frames = [sp['frames'][n] for n in names]
        if brk == 'sun' and key == 'moth':
            frames[0] = frames[0].replace('4', 'e', 1)
        if brk == 'feet' and f == 'hero/hero_idle.png':
            r = frames[0].split('/')
            r[-1] = r[-1].replace('0', '.')
            frames[0] = '/'.join(r)
        w, h = sp['w'], sp['h']
        moth = key == 'moth'
        rgba = strip(frames, w, h, pal, alpha_at=(w * 2 + 5 if brk == 'alpha' and moth else None))
        if brk == 'offpalette' and moth:   # the first opaque pixel of frame a, at its place in the strip
            first = next(i for i, ch in enumerate(frames[0].replace('/', '')) if ch != '.')
            y, x = divmod(first, w)
            o = (y * w * len(frames) + x) * 4
            rgba = rgba[:o] + bytes([0x12, 0x34, 0x56]) + rgba[o + 3:]
        if brk == 'size' and moth:
            data = png(w * len(frames) - 1, h, b''.join(rgba[y * w * len(frames) * 4:(y * w * len(frames) + w * len(frames) - 1) * 4] for y in range(h)))
        else:
            data = png(w * len(frames), h, rgba, depth16=(brk == 'depth16' and moth))
        stem = f.split('/')[-1][:-4]
        src_lines = ['%s %s' % (n, s) for n, s in zip(names, frames)]
        if brk == 'source' and key == 'beacon':
            src_lines[0] = src_lines[0][:-1] + ('0' if src_lines[0][-1] != '0' else '.')
        members[f] = data
        members['source/%s.txt' % stem] = ('\n'.join(src_lines) + '\n').encode()
        used = sorted({int(ch, 16) for s in frames for ch in s if ch not in './'})
        entries.append({'file': f, 'kind': 'tileset' if key == 'tab' else ('strip' if len(names) > 1 else 'image'), 'sprite': key,
                        'w': w, 'h': h, 'frames': len(names), 'names': names, 'fps': 0, 'loop': False,
                        'anchor': 'cell', 'facing': 'right' if key in ('hero', 'crawler') else 'none', 'colours': used,
                        'batch': 0, 'version': 1, 'tool': 'python grid', 'source': 'source/%s.txt' % stem,
                        'sha256': hashlib.sha256(data).hexdigest() if not (brk == 'sha' and key == 'scroll') else '0' * 64})
    man = {'game': 'shutterbug', 'brief': 'Shutterbug: every asset, and the brief for Astra (30 Oct 2026)',
           'palette': ['#' + h for h in pal], 'rulings': ['palette: KEEP', 'grid: 24x48'], 'files': entries,
           'missing': [{'stem': 'loot_dp_drop', 'why': 'HOLD: no size ruled'}], 'extras': []}
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('manifest.json', json.dumps(man, indent=1))
        z.writestr('progress.md', '# progress\nGate: waiting (batch 0)\n')
        for name, data in members.items():
            z.writestr(name, data)
        if brk == 'slip':
            z.writestr('../evil.txt', 'outside')
    print('fixture %s: %d files%s' % (out, len(entries), ' (broken: %s)' % brk if brk else ''))


if __name__ == '__main__':
    main(sys.argv[1:])
