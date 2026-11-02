#!/usr/bin/env python3
"""The astra gate's fixture: an Astra shaped checkpoint zip made from the page's own sprites (the brief's section 9
layout, manifest, source grids and 8 bit RGBA strips), so the cutter's round trip can be proven exact, plus broken
variants each of which the cutter must refuse for its own reason.

  python3 -I test/astra_fixture.py <sprites.json> <out.zip> [--break KIND] [--tweak] [--elite]
      sprites.json: {key: {w, h, frames: {name: string}}} with the page's palette under "_palette" (16 hexes)
      --break offpalette | alpha | size | sun | feet | source | sha | slip | depth16 | sunfx | fxname
      --pad N  adds N one pixel keys pad_00.. (the key cap)
      --tweak  one pixel of hero.idle0 changed to another palette colour (a legal change)
      --elite  adds enemies/enemy_moth_elite.png, 24x24, the moth centred (a new key)
      --round3 Astra's round 3 shapes (ART3): the manifest names its game 'SHUTTERBUG', and fx_boss_chip (16 a side),
               fx_boss_down (64 a side) and fx_beacon_light (the beacon's frame a with its Sun) come as effects;
               with --break sunchip the chip carries Sun too, with --break fx24 the chip is 24 a side
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
    # ART1's keys (Astra's delivery of 31 Oct, Q160): the five elites and the HUD heart
    'enemies/enemy_moth_elite.png': ('moth_elite', None), 'enemies/enemy_icicle_elite.png': ('icicle_elite', None),
    'enemies/enemy_jelly_elite.png': ('jelly_elite', None), 'enemies/enemy_crawler_elite.png': ('crawler_elite', None),
    'enemies/enemy_spark_elite.png': ('spark_elite', None), 'ui/hud_heart.png': ('hud_heart', None),
    # ART2's keys (Astra's delivery of 31 Oct, Q161): the hero's poses, the weapon icons and the step 1 effects
    'hero/hero_dash.png': ('hero_dash', None), 'hero/hero_hurt.png': ('hero_hurt', None), 'hero/hero_squash.png': ('hero_squash', None),
    'hero/hero_stretch.png': ('hero_stretch', None), 'hero/hero_dropin.png': ('hero_dropin', None), 'ui/icon_weapons.png': ('icon_weapons', None),
    'fx/fx_projectiles.png': ('fx_projectiles', None), 'fx/fx_shockwave.png': ('fx_shockwave', None), 'fx/fx_enemy_hit.png': ('fx_enemy_hit', None),
    # ART3's keys (Astra's rounds 2 and 3, Q98, and round 1's dust): the stick, the pause glyph, the Skyhook's effect,
    # the biome's air and badges
    'ui/stick_pad.png': ('stick_pad', None), 'ui/stick_knob.png': ('stick_knob', None), 'ui/stick_hint.png': ('stick_hint', None),
    'ui/pause_glyph.png': ('pause_glyph', None), 'fx/fx_skyhook.png': ('fx_skyhook', None), 'world/dust_mote.png': ('dust_mote', None),
    'world/frost_mote.png': ('frost_mote', None), 'world/bubble.png': ('bubble', None), 'world/spore.png': ('spore', None),
    'world/ember_mote.png': ('ember_mote', None), 'ui/icon_biomes.png': ('icon_biomes', None),
    # W2's keys (weapons step 2, Q163): round 1's held looks (its bursts and impacts retired at ART4)
    'fx/fx_frozen_stunned.png': ('fx_frozen_stunned', None),
    # ART4's keys (Astra's round 4, Q164): her eight weapon effects under her own file names
    'fx/dart.png': ('dart', None), 'fx/ring.png': ('ring', None), 'fx/ember.png': ('ember', None), 'fx/flash_ring.png': ('flash_ring', None),
    'fx/snap_frame.png': ('snap_frame', None), 'fx/kick_spray.png': ('kick_spray', None), 'fx/fire_cell.png': ('fire_cell', None),
    'fx/frost_burst.png': ('frost_burst', None),
    # HOUSE-B's keys (the house: round 1's clay boss, its shed, the frame styles and skins; round 3's pips, house icon,
    # clear card, unlock, the boss effects, the beacon's lighting and the second skins)
    'boss/boss_fallback.png': ('boss_fallback', None), 'boss/boss_moth_shed.png': ('boss_moth_shed', None), 'ui/frame_styles.png': ('frame_styles', None),
    'hero/hero_colours.png': ('hero_colours', None), 'ui/run_pips.png': ('run_pips', None), 'ui/icon_house.png': ('icon_house', None),
    'ui/card_house_clear.png': ('card_house_clear', None), 'fx/fx_unlock.png': ('fx_unlock', None), 'fx/fx_boss_wake.png': ('fx_boss_wake', None),
    'fx/fx_boss_chip.png': ('fx_boss_chip', None), 'fx/fx_boss_down.png': ('fx_boss_down', None), 'fx/fx_beacon_light.png': ('fx_beacon_light', None),
    'hero/hero_colours_r3.png': ('hero_colours_r3', None),
    # round 5's keys in the page (2 Nov): the joined crusher, the locked exit's art, the dive slot's pictures
    'world/shaft_joined.png': ('shaft_joined', None), 'loot/key.png': ('key', None), 'fx/key_get.png': ('key_get', None),
    'ui/hud_key.png': ('hud_key', None), 'world/beacon_locked.png': ('beacon_locked', None), 'fx/fx_beacon_refuse.png': ('fx_beacon_refuse', None),
    'fx/tremor_burst.png': ('tremor_burst', None), 'fx/tremor_chip.png': ('tremor_chip', None), 'fx/pogo_bounce.png': ('pogo_bounce', None),
    'fx/pile_strike.png': ('pile_strike', None),
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
    for k in range(int(argv[argv.index('--pad') + 1]) if '--pad' in argv else 0):
        S['pad_%02d' % k] = {'w': 1, 'h': 1, 'frames': {'a': '0'}}
        plan.append(('extras/pad_%02d.png' % k, 'pad_%02d' % k, ['a']))
    if '--elite' in argv:   # the gate hands a sprites.json without moth_elite (the page holds Astra's since ART1)
        m = S['moth']
        S['moth_elite'] = {'w': 24, 'h': 24, 'frames': {n: '/'.join(['.' * 24] * 4 + ['....' + r + '....' for r in s.split('/')] + ['.' * 24] * 4) for n, s in m['frames'].items()}}
        plan.append(('enemies/enemy_moth_elite.png', 'moth_elite', list(m['frames'])))
    if '--round3' in argv:
        sq = lambda n, k: '/'.join(('.' * ((n - k) // 2) + '0' * k + '.' * (n - k - (n - k) // 2)) if (n - k) // 2 <= y < (n - k) // 2 + k else '.' * n for y in range(n))
        side = 24 if brk == 'fx24' else 16
        chip = sq(side, 4)
        if brk == 'sunchip':
            chip = chip.replace('0', 'e', 1)
        S['fx_boss_chip'] = {'w': side, 'h': side, 'frames': {'chip_0': chip}}
        S['fx_boss_down'] = {'w': 64, 'h': 64, 'frames': {'down_0': sq(64, 8)}}
        S['fx_beacon_light'] = {'w': 16, 'h': 16, 'frames': {'light_0': S['beacon']['frames']['a']}}
        for k in ('fx_boss_chip', 'fx_boss_down', 'fx_beacon_light'):
            plan = [e for e in plan if e[1] != k]   # HOUSE-B: the page holds them now; round 3's shapes replace the page's
            plan.append(('fx/%s.png' % k, k, list(S[k]['frames'])))
    entries, members = [], {}
    for f, key, names in plan:
        sp = S[key]
        frames = [sp['frames'][n] for n in names]
        if brk == 'sun' and key == 'moth':
            frames[0] = frames[0].replace('4', 'e', 1)
        if brk == 'sunfx' and key == 'fx_projectiles':
            frames[0] = frames[0].replace('0', 'e', 1)
        if brk == 'fxname' and key == 'fx_enemy_hit':
            names = ['hit'] + names[1:]
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
    man = {'game': 'SHUTTERBUG' if '--round3' in argv else 'shutterbug', 'brief': 'Shutterbug: every asset, and the brief for Astra (30 Oct 2026)',
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
