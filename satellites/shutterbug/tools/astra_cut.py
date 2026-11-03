#!/usr/bin/env python3
"""Shutterbug's Astra cutter (the brief's section 9, "What the cut script does"): Astra's zip in, checked, cut into
the pixel strings of the page's SPRITES block. Standard library only; nothing inside a zip is ever run.

  python3 -I tools/astra_cut.py intake <zip> [--dest DIR]
      extract into a new empty folder (default /tmp/claude-1000/shutterbug-astra/<zip stem>), refusing absolute paths,
      '..', backslashes, links and anything over the size caps, before a byte is written
  python3 -I tools/astra_cut.py check <dir> [--sprites OUT.json] [--page index.html]
      verify every manifest entry and cut it: the sha256, an 8 bit RGBA PNG of frames times w by h, alpha 0 or 255
      only, every opaque pixel one of the page's 16 hexes, the PNG equal to its source grid, the hero's feet row holding
      Ink, Sun only in the hero, its poses, the beacon and its fx_beacon_light, a known key's size and frame names. Prints the report (refusals, then
      warnings, then what was cut); exits 1 on any refusal. --sprites writes the cut frames as JSON
      {key: {w, h, frames: {name: string}, files: [...]}}
  python3 -I tools/astra_cut.py splice <sprites.json> <page> [--out PAGE2]
      write the cut frames into the page's SPRITES block: a key the page has keeps its comment and its frames' order
      (the hero's new names after; any other key's entry replaces its frames whole, Astra's per key merge), a new key
      is appended; refused when
      the page would reach MAX_SPRITES names; without --out it prints what would change
"""
import sys, os, re, json, zlib, struct, hashlib, zipfile

GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEXCH = '0123456789abcdef'
CAP_FILE, CAP_TOTAL = 50 * 1024 * 1024, 400 * 1024 * 1024
# sizes and frame names for the keys the page does not hold yet (the brief's checklist, section 9)
NEW_KEYS = {
    'moth_elite': (24, 24, None), 'icicle_elite': (24, 24, None), 'jelly_elite': (24, 24, None),
    'crawler_elite': (24, 24, None), 'spark_elite': (24, 24, None), 'hud_heart': (9, 8, ['full', 'empty']),
    # ART2 (Astra's delivery of 31 Oct): the hero's extra poses (each the hero, so each may carry Sun and stands on an
    # Ink feet row) and the slot HUD's weapon icons
    'hero_dash': (12, 16, ['dash']), 'hero_hurt': (12, 16, ['recoil']), 'hero_squash': (14, 14, ['squash']),
    'hero_stretch': (10, 18, ['stretch']), 'hero_dropin': (12, 16, ['descending', 'contact', 'settled']),
    'icon_weapons': (24, 24, None),
}
# ART2: an effect strip, fx_<name>, is named frames: square, 32 or 48 a side, each frame <clip>_<n> with every clip's n
# running 0, 1, 2 ... in order (Astra's manifest clips); Sun is the hero's and never an effect's
FX_RE = re.compile(r'^fx_[a-z]+(_[a-z]+)*$')
FX_FRAME_RE = re.compile(r'^([a-z]+(?:_[a-z]+)*)_([0-9])$')
# ART3: Astra's round 3 brings a 16 px chip (fx_boss_chip) and a 64 px fall (fx_boss_down), so 16 and 64 join
FX_SIDES = (16, 32, 48, 64)
# ART3: the beacon's own lighting (fx_beacon_light, round 3) starts on the dark lamp and ends on the lit beacon pixel for
# pixel, so it carries the beacon's Sun; every other effect stays without it
# round 5: an fx the brief itself named with plain frames (a, b, c) and a non square size
FX_PLAIN = ('fx_beacon_refuse', 'fx_trophy_new')   # round 6: the brief named the trophy shine's frames a to d
SUN_KEYS = ('beacon', 'fx_beacon_light', 'beacon_locked', 'trophy_medals', 'story_cards', 'story_bug_wave',
            'trophy_medals_r7', 'frame_styles_r7', 'daily_badge', 'daily_card')   # round 7: the same menu only allowance   # round 6: menu only art the brief allowed Sun in (the story cards and the wave are the hero itself); never drawn over a room   # round 5: the locked beacon's charge windows are the beacon's own Sun (the brief allowed it)
HERO_NAMES = ['idle0', 'idle1', 'run0', 'run1', 'run2', 'run3', 'jump', 'fall', 'cling', 'dive', 'land', 'dead']
NAME_RE = re.compile(r'^[A-Za-z_][A-Za-z0-9_]*$')
# the names the page may hold after a splice (the lint and H-spr-1 hold the page to the same number). ART2 counted the
# page and the cut together at the check (44). ART3 moves the cap to the splice, where the page grows: Astra's rounds 2
# and 3 are checked whole (38 keys, most of them parked for systems not built yet, kept in docs/astra/cut-art3.json),
# and only what this step draws is spliced, 11 new keys on the page's 31 (stick_pad, stick_knob, stick_hint,
# pause_glyph, fx_skyhook, dust_mote, frost_mote, bubble, spore, ember_mote, icon_biomes): 42 names, so 43 is the
# least cap that takes it (PROGRESS ART3). W2 (weapons step 2) splices three more of round 1's effects, fx_bursts,
# fx_impacts and fx_frozen_stunned (their step 2 clips only): 45 names, so 46 (PROGRESS W2, QUESTIONS Q122). ART4
# (Astra's round 4, Q164) adds her eight weapon effect keys (dart, ring, ember, flash_ring, snap_frame, kick_spray,
# fire_cell, frost_burst) and retires the round 1 fx_bursts and fx_impacts they replace: 51 names, so 52
# least cap that takes it (PROGRESS ART3). HOUSE-B splices the house's 13 (round 1's boss_fallback, boss_moth_shed,
# frame_styles and hero_colours; round 3's run_pips, icon_house, card_house_clear, fx_unlock, the boss effects,
# fx_beacon_light and hero_colours_r3): 55 names, so 56
# sb-m1-5 merges both: 64 names, so 65
MAX_SPRITES = 120   # round 5 (2 Nov): the fixes, the keys, the dive and charm art, the bosses; room for the monsters and the terrain


class Refuse(Exception):
    pass


def read_page(page):
    text = open(page, encoding='utf-8').read()
    m = re.search(r"var HEX = \[([^\]]*)\]", text)
    if not m:
        raise Refuse('the page has no core-palette HEX array')
    hexes = re.findall(r"'([0-9a-f]{6})'", m.group(1))
    if len(hexes) != 16:
        raise Refuse('the page palette holds %d hexes, not 16' % len(hexes))
    return text, hexes


def page_sprites(text):
    """{key: {'w', 'h', 'names': [...]}} from the SPRITES block, by its regular shape (never evaluated here)."""
    m = re.search(r'/\* SPRITES BEGIN \*/\n(.*?)/\* SPRITES END \*/', text, re.S)
    if not m:
        raise Refuse('the page has no SPRITES fence')
    out = {}
    for e in re.finditer(r"\n    ([A-Za-z_][A-Za-z0-9_]*): \{ w: (\d+), h: (\d+), frames: \{\n(.*?)\n    \} \}", m.group(1), re.S):
        out[e.group(1)] = {'w': int(e.group(2)), 'h': int(e.group(3)), 'names': re.findall(r"^      ([A-Za-z_][A-Za-z0-9_]*): '", e.group(4), re.M)}
    return out


def safe_join(root, rel):
    if not isinstance(rel, str) or rel.startswith('/') or '\\' in rel or ':' in rel or any(p in ('..', '') for p in rel.split('/')):
        raise Refuse('an unsafe path in the manifest: %r' % (rel,))
    p = os.path.realpath(os.path.join(root, rel))
    if not p.startswith(os.path.realpath(root) + os.sep):
        raise Refuse('a path outside the folder: %r' % (rel,))
    return p


def intake(zpath, dest):
    if os.path.exists(dest) and os.listdir(dest):
        raise Refuse(dest + ' is not empty: every zip gets a new empty folder')
    with zipfile.ZipFile(zpath) as z:
        total, names = 0, []
        for info in z.infolist():
            n = info.filename
            if n.startswith('/') or '\\' in n or ':' in n or any(p == '..' for p in n.split('/')):
                raise Refuse('an unsafe path in the zip: %r' % n)
            if (info.external_attr >> 16) & 0o170000 == 0o120000:
                raise Refuse('a link in the zip: %r' % n)
            total += info.file_size
            if info.file_size > CAP_FILE or total > CAP_TOTAL:
                raise Refuse('over the size caps at %r' % n)
            names.append(n)
        bad = z.testzip()
        if bad:
            raise Refuse('a damaged member: %r' % bad)
        os.makedirs(dest, exist_ok=True)
        z.extractall(dest)
    return names


def read_png(data):
    """(w, h, rgba bytes) for an 8 bit RGBA, non interlaced PNG; any other kind is refused by name."""
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise Refuse('not a PNG')
    pos, ihdr, idat = 8, None, []
    while pos + 8 <= len(data):
        n = struct.unpack('>I', data[pos:pos + 4])[0]
        typ, body = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + n]
        if len(body) != n or pos + 12 + n > len(data):
            raise Refuse('a cut short chunk')
        if zlib.crc32(typ + body) & 0xffffffff != struct.unpack('>I', data[pos + 8 + n:pos + 12 + n])[0]:
            raise Refuse('a damaged %s chunk' % typ.decode('latin1'))
        if typ == b'IHDR':
            ihdr = struct.unpack('>IIBBBBB', body)
        elif typ == b'IDAT':
            idat.append(body)
        elif typ == b'IEND':
            break
        pos += 12 + n
    if not ihdr:
        raise Refuse('no IHDR')
    w, h, depth, ctype, _, _, inter = ihdr
    if depth != 8 or ctype != 6 or inter != 0:
        raise Refuse('not an 8 bit RGBA PNG without interlace (bit depth %d, colour type %d, interlace %d): save as RGBA' % (depth, ctype, inter))
    raw = zlib.decompress(b''.join(idat))
    stride = w * 4
    if len(raw) != h * (stride + 1):
        raise Refuse('the image data is %d bytes, not %d' % (len(raw), h * (stride + 1)))
    out, prev, i = bytearray(), bytearray(stride), 0
    for _ in range(h):
        f = raw[i]
        line = bytearray(raw[i + 1:i + 1 + stride])
        i += 1 + stride
        if f > 4:
            raise Refuse('an unknown row filter %d' % f)
        for x in range(stride):
            a = line[x - 4] if x >= 4 else 0
            b = prev[x]
            c = prev[x - 4] if x >= 4 else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + ((a + b) >> 1)) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        out += line
        prev = line
    return w, h, bytes(out)


def read_source(path):
    """source/<stem>.txt: one line a frame, the frame name, one space, the pixel string."""
    out = {}
    for line in open(path, encoding='utf-8').read().splitlines():
        if not line.strip():
            continue
        name, _, s = line.partition(' ')
        out[name] = s.strip()
    return out


def check(root, page):
    text, hexes = read_page(page)
    index = {'#' + h: i for i, h in enumerate(hexes)}
    have = page_sprites(text)
    refusals, warnings, sprites = [], [], {}
    try:
        man = json.load(open(safe_join(root, 'manifest.json'), encoding='utf-8'))
    except (OSError, ValueError, Refuse) as e:
        return [('manifest.json', 'unreadable: %s' % e)], [], {}, {}
    # ART3: rounds 2 and 3 name the game 'SHUTTERBUG'; the name is the game's in any case
    if str(man.get('game', '')).lower() != 'shutterbug':
        refusals.append(('manifest.json', 'game is %r, not "shutterbug"' % man.get('game')))
    pal = [str(p).lower() for p in man.get('palette', [])]
    if pal and pal != ['#' + h for h in hexes]:
        if any(str(r).lower().startswith('palette:') and 'keep' not in str(r).lower() for r in man.get('rulings', [])):
            warnings.append(('manifest.json', 'a palette ruling changed the hexes: the page palette must change with it before a cut'))
        refusals.append(('manifest.json', 'its palette is not the page\'s 16 hexes'))
    for e in man.get('files', []):
        f = e.get('file', '?')
        try:
            key, fw, fh, n, names = e['sprite'], int(e['w']), int(e['h']), int(e['frames']), list(e['names'])
            if not NAME_RE.match(str(key)):
                raise Refuse('the sprite key %r is not a plain name' % key)
            if len(names) != n or len(set(names)) != n or not all(NAME_RE.match(str(x)) for x in names):
                raise Refuse('names %r do not give %d plain, distinct frame names' % (names, n))
            data = open(safe_join(root, f), 'rb').read()
            sha = hashlib.sha256(data).hexdigest()
            if sha != str(e.get('sha256', '')).lower():
                raise Refuse('sha256 %s is not the manifest\'s %s' % (sha[:16], str(e.get('sha256', ''))[:16]))
            w, h, px = read_png(data)
            if w != fw * n or h != fh:
                raise Refuse('%dx%d, not %d frames of %dx%d (%dx%d)' % (w, h, n, fw, fh, fw * n, fh))
            frames, used = {}, set()
            for k, name in enumerate(names):
                rows = []
                for y in range(fh):
                    row = []
                    for x in range(fw):
                        o = (y * w + k * fw + x) * 4
                        r, g, b, a = px[o:o + 4]
                        if a == 0:
                            row.append('.')
                        elif a != 255:
                            raise Refuse('frame %s pixel (%d, %d) has alpha %d (only 0 or 255)' % (name, x, y, a))
                        else:
                            hx = '#%02x%02x%02x' % (r, g, b)
                            if hx not in index:
                                raise Refuse('frame %s pixel (%d, %d) is %s, off the 16 colours' % (name, x, y, hx))
                            used.add(index[hx])
                            row.append(HEXCH[index[hx]])
                    rows.append(''.join(row))
                frames[name] = '/'.join(rows)
            src = read_source(safe_join(root, e.get('source', '')))
            for name in names:
                if src.get(name) != frames[name]:
                    raise Refuse('frame %s differs from its source grid %s' % (name, e.get('source')))
            if key == 'hero':
                if (fw, fh) != (12, 16):
                    raise Refuse('the hero is %dx%d, not 12x16 (the hitbox)' % (fw, fh))
                for name in names:
                    if name not in HERO_NAMES:
                        raise Refuse('%r is not one of the hero\'s twelve frame names' % name)
                    if '0' not in frames[name].split('/')[-1]:
                        raise Refuse('hero.%s has no Ink in its feet row' % name)
            elif key.startswith('hero_'):
                # ART2: every hero_* pose is the hero, so it may carry Sun, and it stands on an Ink feet row too
                for name in names:
                    if '0' not in frames[name].split('/')[-1]:
                        raise Refuse('%s.%s has no Ink in its feet row' % (key, name))
            elif key not in SUN_KEYS and any('e' in s for s in frames.values()):
                raise Refuse('Sun in %s (Sun belongs to the hero, its hero_* poses and the beacon with its fx_beacon_light)' % key)
            if FX_RE.match(key) and key not in FX_PLAIN:
                if fw != fh or fw not in FX_SIDES:
                    raise Refuse('%s is %dx%d: an effect is square, %s a side' % (key, fw, fh, ' or '.join(map(str, FX_SIDES))))
                seen = {}
                for name in names:
                    fm = FX_FRAME_RE.match(name)
                    if not fm:
                        raise Refuse('%s frame %s is not <clip>_<n>' % (key, name))
                    if int(fm.group(2)) != seen.get(fm.group(1), 0):
                        raise Refuse('%s frame %s is out of its clip\'s order (%s_%d expected)' % (key, name, fm.group(1), seen.get(fm.group(1), 0)))
                    seen[fm.group(1)] = int(fm.group(2)) + 1
            if key in have:
                want = have[key]
                if (fw, fh) != (want['w'], want['h']):
                    raise Refuse('%s is %dx%d in the page, %dx%d here (a size change is a render change, not a cut)' % (key, want['w'], want['h'], fw, fh))
                gone = [x for x in want['names'] if x not in names and not (sprites.get(key) and x in sprites[key]['frames'])]
                if key != 'hero' and gone:
                    warnings.append((f, '%s drops the page\'s frame%s %s: Astra\'s entry replaces the key whole' % (key, 's' if len(gone) > 1 else '', ', '.join(gone))))
                extra = [x for x in names if x not in want['names']]
                if extra:
                    warnings.append((f, '%s gains frame%s %s: R.draw must learn %s before they show' % (key, 's' if len(extra) > 1 else '', ', '.join(extra), 'them' if len(extra) > 1 else 'it')))
            elif key in NEW_KEYS:
                nw, nh, nn = NEW_KEYS[key]
                if (fw, fh) != (nw, nh):
                    raise Refuse('%s is %dx%d, the brief asks %dx%d' % (key, fw, fh, nw, nh))
                if nn and names != nn:
                    raise Refuse('%s frames are %r, the brief asks %r' % (key, names, nn))
                warnings.append((f, 'a new key %s: R.draw must learn to draw it' % key))
            elif FX_RE.match(key) and key not in FX_PLAIN:
                warnings.append((f, 'an effect %s (%s): R.draw must learn the clips it binds' % (key, ', '.join(sorted({FX_FRAME_RE.match(x).group(1) for x in names})))))
            else:
                warnings.append((f, 'an unknown key %s: added to SPRITES, drawn by nothing yet' % key))
            if sorted(used) != sorted(int(c) for c in e.get('colours', [])):
                warnings.append((f, 'colours lists %s, the frames use %s' % (sorted(int(c) for c in e.get('colours', [])), sorted(used))))
            sp = sprites.setdefault(key, {'w': fw, 'h': fh, 'frames': {}, 'files': []})
            if (sp['w'], sp['h']) != (fw, fh):
                raise Refuse('%s comes at two sizes in this zip' % key)
            for name in names:
                if name in sp['frames']:
                    raise Refuse('%s.%s comes twice in this zip' % (key, name))
                sp['frames'][name] = frames[name]
            sp['files'].append(f)
        except (Refuse, KeyError, ValueError, TypeError, OSError, zlib.error) as err:
            refusals.append((f, str(err) if isinstance(err, Refuse) else '%s: %s' % (type(err).__name__, err)))
    if 'hero' in sprites:
        lack = [x for x in HERO_NAMES if x not in sprites['hero']['frames']]
        if lack:
            warnings.append(('hero', 'the hero lacks %s in this zip (the page keeps its own for those)' % ', '.join(lack)))
    if len(set(have) | set(sprites)) >= MAX_SPRITES:
        warnings.append(('SPRITES', 'a whole splice would leave %d names; the splice refuses %d or more (splice a subset)' % (len(set(have) | set(sprites)), MAX_SPRITES)))
    return refusals, warnings, sprites, man


def splice(sprites, text):
    m = re.search(r'(/\* SPRITES BEGIN \*/\n  var SPRITES = \{\n)(.*?)(\n  \};\n  /\* SPRITES END \*/)', text, re.S)
    if not m:
        raise Refuse('the page has no SPRITES block of the known shape')
    body = m.group(2)
    for key in sprites:
        sp = sprites[key]
        if not NAME_RE.match(key) or not all(NAME_RE.match(x) for x in sp['frames']):
            raise Refuse('%s holds a name that is not plain' % key)
        er = re.compile(r"(\n|^)(    %s: \{ w: )(\d+)(, h: )(\d+)(, frames: \{\n)(.*?)(\n    \} \})" % re.escape(key), re.S)
        em = er.search(body)
        if em:
            old = re.findall(r"^      ([A-Za-z_][A-Za-z0-9_]*): '([^']*)'", em.group(7), re.M)
            # ART3: Astra merges by sprite key (round 2's NOTES): her entry replaces the page's frames whole, in her
            # order (round 2's icon_weapons, J1 to charm, retires the 27 old names); only the hero merges by frame,
            # since a cut may bring some of its twelve and the page keeps its own for the rest
            if key != 'hero':
                old = []
            merged = dict(old)
            merged.update(sp['frames'])
            order = [n for n, _ in old] + [n for n in sp['frames'] if n not in dict(old)]
            inner = ',\n'.join("      %s: '%s'" % (n, merged[n]) for n in order)
            body = body[:em.start()] + em.group(1) + em.group(2) + str(sp['w']) + em.group(4) + str(sp['h']) + em.group(6) + inner + em.group(8) + body[em.end():]
        else:
            inner = ',\n'.join("      %s: '%s'" % (n, s) for n, s in sp['frames'].items())
            body += ',\n    /* %s: from Astra (%s) */\n    %s: { w: %d, h: %d, frames: {\n%s\n    } }' % (key, ', '.join(sp.get('files', [])), key, sp['w'], sp['h'], inner)
    n = len(re.findall(r"\n    [A-Za-z_][A-Za-z0-9_]*: \{ w: \d+, h: \d+, frames: \{", '\n' + body))
    if n >= MAX_SPRITES:
        raise Refuse('%d names after this splice; the page stays under %d' % (n, MAX_SPRITES))
    return text[:m.start()] + m.group(1) + body + m.group(3) + text[m.end():]


def main(argv):
    if len(argv) < 2 or argv[0] not in ('intake', 'check', 'splice'):
        print(__doc__)
        return 2
    opt = lambda k, d=None: argv[argv.index(k) + 1] if k in argv else d
    try:
        if argv[0] == 'intake':
            z = argv[1]
            dest = opt('--dest', os.path.join('/tmp/claude-1000/shutterbug-astra', os.path.splitext(os.path.basename(z))[0]))
            names = intake(z, dest)
            print('INTAKE OK: %d members into %s' % (len(names), dest))
            return 0
        if argv[0] == 'check':
            refusals, warnings, sprites, man = check(argv[1], opt('--page', os.path.join(GAME, 'index.html')))
            for f, why in refusals:
                print('REFUSE  %s: %s' % (f, why))
            for f, why in warnings:
                print('warn    %s: %s' % (f, why))
            for key, sp in sprites.items():
                print('cut     %s %dx%d: %s' % (key, sp['w'], sp['h'], ' '.join(sp['frames'])))
            for miss in (man or {}).get('missing', []):
                print('missing %s: %s' % (miss.get('stem'), miss.get('why')))
            if opt('--sprites') and not refusals:
                json.dump(sprites, open(opt('--sprites'), 'w', encoding='utf-8'), indent=1, sort_keys=False)
            print(('CHECK FAILED: %d refused' % len(refusals)) if refusals else ('CHECK OK: %d sprites, %d frames' % (len(sprites), sum(len(s['frames']) for s in sprites.values()))))
            return 1 if refusals else 0
        if argv[0] == 'splice':
            sprites = json.load(open(argv[1], encoding='utf-8'))
            text = open(argv[2], encoding='utf-8').read()
            new = splice(sprites, text)
            if opt('--out'):
                open(opt('--out'), 'w', encoding='utf-8').write(new)
                print('SPLICE OK: %s (%s)' % (opt('--out'), 'unchanged' if new == text else 'changed'))
            else:
                print('SPLICE DRY RUN: the page would %s' % ('stay the same' if new == text else 'change'))
            return 0
    except (Refuse, zipfile.BadZipFile, OSError) as e:
        print('REFUSE  %s' % e)
        print('FAILED')
        return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
