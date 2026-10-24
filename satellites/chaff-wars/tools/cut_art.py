#!/usr/bin/env python3
"""Pop N Lock art pipeline (24 Oct 2026, plans/pop-n-lock/BUILD-PLAN-OCT24.md Part 1).

Cuts Astra's return (assets/pop-n-lock-assets.zip, vaulted as vault-20261024-pop-n-lock-astra) into the WebP files the
game loads, plus art/pnl2/art.json describing them. Run with python3 -I (the zip is data, never code; extras/ is read for
integration.json only and nothing in it is ever run):

    python3 -I satellites/chaff-wars/tools/cut_art.py --src /tmp/claude-1000/pnl/zip --out satellites/chaff-wars/art/pnl2

--src is the EXTRACTED zip (the /tmp disk is wiped at every codespace stop: re-extract from the zip or the vault).
Dance and reaction frames keep their full 512 x 512 canvas so every frame of a character shares ONE render box and the
base anchor (256, 470) from integration.json. Pods, joins and frames keep their sizes (the integration geometry is in
their pixels). Powers art is not cut: Powers are undecided (his call, 24 Oct). Fails over budget.
"""
import argparse, json, os, sys
from PIL import Image

BUDGET = 9.0 * 1024 * 1024   # every shipped file together (the dance and react frames are most of it)
COLORS = ['crimson', 'sprout', 'dewdrop', 'sunbean', 'nightshade']   # pod values 1..5, as integration.json pod_map

def webp(src, dst, q=85, lossless=False):
    im = Image.open(src).convert('RGBA')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'WEBP', quality=q, method=6, lossless=lossless, exact=True)
    return im.size, os.path.getsize(dst)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--src', required=True); ap.add_argument('--out', required=True)
    a = ap.parse_args(); S, O = a.src, a.out
    integ = json.load(open(os.path.join(S, 'extras', 'integration.json')))
    ref = {c['slug']: c['ref'] for c in integ['character_map']}
    J = {'v': 'pnl2', 'pods': {}, 'board': {}, 'hud': {}, 'dance': {}, 'react': {}, 'files': {}}
    total = 0
    def put(rel_src, rel_dst, **kw):
        nonlocal total
        size, n = webp(os.path.join(S, rel_src), os.path.join(O, rel_dst), **kw)
        J['files'][rel_dst] = {'w': size[0], 'h': size[1], 'bytes': n}; total += n
        return rel_dst
    # pods: the five bodies, the chaff, and each colour's two joins (drawn behind equal coloured orthogonal neighbours)
    for i, c in enumerate(COLORS):
        J['pods'][str(i + 1)] = {'body': put('pods/pod_%s.png' % c, 'pods/%s.webp' % c),
                                 'h': put('pods/%s/pod_link_h.png' % c, 'pods/%s_h.webp' % c),
                                 'v': put('pods/%s/pod_link_v.png' % c, 'pods/%s_v.webp' % c)}
    J['pods']['chaff'] = put('pods/chaff.png', 'pods/chaff.webp')
    # the board frames (nine sliced around the play rects) and the next window, with their geometry
    for key, f, meta in (('frame', 'board_frame', 'board_frame'), ('rival', 'board_frame_rival', 'board_frame_rival'), ('next', 'next_window', 'next_window')):
        J['board'][key] = dict(integ[meta], file=put('board/%s.png' % f, 'board/%s.webp' % key))
    J['hud']['hype'] = dict(integ['hype_frame'], file=put('hud/hype_frame.png', 'hud/hype.webp'))
    # characters: dance (six frames, their own timings) and reactions (hit, danger), one 512 canvas each
    D = integ['dance']
    for f in sorted(os.listdir(os.path.join(S, 'dance'))):
        slug, n = f[:-4].rsplit('_dance_', 1); r = ref[slug]
        d = J['dance'].setdefault(r, {'frames': [], 'ms': D['frame_duration_ms'], 'anchor': D['base_anchor'], 'canvas': D['canvas']})
        d['frames'].append(put('dance/' + f, 'dance/%s/%s.webp' % (r, n)))
    for r, d in J['dance'].items():
        if len(d['frames']) != 6: sys.exit('dance set %s has %d frames' % (r, len(d['frames'])))
    for f in sorted(os.listdir(os.path.join(S, 'react'))):
        slug, kind = f[:-4].rsplit('_', 1)
        J['react'].setdefault(ref[slug], {})[kind] = put('react/' + f, 'react/%s/%s.webp' % (ref[slug], kind))
    # ONE render box per character: the union of every dance and reaction frame's painted area in the 512 canvas, so the
    # rail draws a character as large as its card allows and every frame at the same scale (the jumps are the moves)
    for r in set(list(J['dance'].keys()) + list(J['react'].keys())):
        box = None
        for rel in (J['dance'].get(r, {}).get('frames', []) + list(J['react'].get(r, {}).values())):
            bb = Image.open(os.path.join(O, rel)).convert('RGBA').split()[3].point(lambda v: 255 if v > 24 else 0).getbbox()
            if bb: box = list(bb) if box is None else [min(box[0], bb[0]), min(box[1], bb[1]), max(box[2], bb[2]), max(box[3], bb[3])]
        J.setdefault('box', {})[r] = box
    J['bytes'] = total
    json.dump(J, open(os.path.join(O, 'art.json'), 'w'), indent=1)
    print('%d files, %.2f MB (budget %.1f MB): %d dance sets, %d reaction sets' % (len(J['files']), total / 1048576, BUDGET / 1048576, len(J['dance']), len(J['react'])))
    if total > BUDGET: sys.exit('OVER BUDGET')

if __name__ == '__main__':
    main()
