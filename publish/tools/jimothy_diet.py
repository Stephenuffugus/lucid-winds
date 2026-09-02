#!/usr/bin/env python3
"""Jimothy on a diet: turn the 404 MB `satellites/stream-hop` into a publisher ZIP.

  python3 publish/tools/jimothy_diet.py [--budget-mb 55]

The source is 404 MB and every network's upload limit is far below that, so this
cuts by rules a person can check, and prints the bytes each rule took:

  1. folders no shipped file names           art-drop, art-drop2..6, art-sheets,
                                             music-drop, store-listing        ~176 MB
  2. every music file                        replaced by a silent stub, NOT deleted,
                                             so the jukebox still lists and plays them
                                             and nothing 404s                  ~19 MB
  3. alternate skins beyond the default set  the 32 Jimothy costumes and the rarer
                                             critters, removed from the art AND from
                                             the CHARS roster so the shop never asks
                                             for a file that is not there     ~140 MB

⛔ The roster is filtered as well as the folders. Deleting `assets/skins/nordic/` and
leaving Nordic Jimothy in CHARS gives you a shop full of broken images and a console
full of 404s, which is exactly what a publisher QA pass looks for.

The dieted copy is written to publish/build/stream-hop-diet and then handed to
scripts/pub_build.py, so it gets the same SDK, the same strip and the same round-end
hook as every other title, and it is proved by the same publish/tools/pub_verify.mjs.
"""
import argparse, os, re, shutil, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO, 'scripts'))
from pub_build import prune_unreferenced, build            # noqa: E402

SRC = os.path.join(REPO, 'satellites', 'stream-hop')
DIET = os.path.join(REPO, 'publish', 'build', 'stream-hop-diet')

# ⭐ The music is SILENCED, not deleted. Jimothy's menu has a jukebox that lists seven
# tracks and unlocks them as you play; delete the files and every one of those rows is a
# 404 waiting for the first curious reviewer. A real one second silent MP3, written over
# each track, keeps the jukebox honest, plays nothing, and costs 4 KB a track instead of
# 2.7 MB. Built with ffmpeg rather than hand assembled, so it is a file a decoder will
# actually accept.
def silent_mp3():
    out = os.path.join(REPO, 'publish', 'build', '_silence.mp3')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'lavfi',
                    '-i', 'anullsrc=r=22050:cl=mono', '-t', '1.0', '-b:a', '32k', '-y', out],
                   check=True)
    return open(out, 'rb').read()


def mb(n):
    return f'{n / 1048576:.1f} MB'


def dir_bytes(p):
    return sum(os.path.getsize(os.path.join(b, f)) for b, _, fs in os.walk(p) for f in fs)


def chars_in(html):
    """Every {id:'x' ...} entry of `var CHARS=[...]`, brace matched, never regexed as a
    whole: the entries carry nested braces, comments and apostrophes in the bios."""
    i = html.index('var CHARS=[')
    start = html.index('[', i)
    depth, k, instr = 0, start, None
    while k < len(html):
        c, nxt = html[k], html[k + 1] if k + 1 < len(html) else ''
        if instr:
            if c == '\\':
                k += 2
                continue
            if c == instr:
                instr = None
        elif c == '/' and nxt == '*':
            k = html.index('*/', k + 2) + 1
        elif c == '/' and nxt == '/':
            k = html.index('\n', k + 2)
        elif c in '"\'`':
            instr = c
        elif c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                k += 1
                break
        k += 1
    return start, k


def split_entries(body):
    """The top-level {...} entries of the array text, with the text between them."""
    out, depth, instr, cur, k = [], 0, None, '', 0
    while k < len(body):
        c, nxt = body[k], body[k + 1] if k + 1 < len(body) else ''
        cur += c
        if instr:
            if c == '\\':
                cur += nxt
                k += 2
                continue
            if c == instr:
                instr = None
        elif c == '/' and nxt == '*':
            e = body.index('*/', k + 2) + 2
            cur += body[k + 1:e]
            k = e
            continue
        elif c == '/' and nxt == '/':
            e = body.index('\n', k + 2)
            cur += body[k + 1:e]
            k = e
            continue
        elif c in '"\'`':
            instr = c
        elif c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                out.append(cur)
                cur = ''
        k += 1
    if cur.strip():
        out.append(cur)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--budget-mb', type=float, default=55.0,
                    help='target size of the dieted folder before zipping')
    ap.add_argument('--game-id', default='REPLACE_WITH_GAME_ID')
    a = ap.parse_args()
    budget = a.budget_mb * 1048576

    if os.path.exists(DIET):
        shutil.rmtree(DIET)
    print(f'source {mb(dir_bytes(SRC))}')
    shutil.copytree(SRC, DIET, ignore=shutil.ignore_patterns('sw.js', 'manifest.webmanifest', '*.md', 'design'))
    dropped = {}

    # 1. folders nothing names
    dropped['unreferenced folders'] = sum(int(m * 1048576) for _, m in prune_unreferenced(DIET))

    # 2. music, silenced rather than deleted
    mus = os.path.join(DIET, 'assets', 'music')
    took = 0
    if os.path.isdir(mus):
        quiet = silent_mp3()
        for f in sorted(os.listdir(mus)):
            p = os.path.join(mus, f)
            if f.lower().endswith(('.mp3', '.ogg', '.m4a', '.wav')):
                took += os.path.getsize(p) - len(quiet)
                open(p, 'wb').write(quiet)
    dropped['music, replaced by silence'] = took

    # 3. the roster, by rarity and then by size until the budget is met
    idx = os.path.join(DIET, 'index.html')
    html = open(idx, encoding='utf-8').read()
    lo, hi = chars_in(html)
    entries = split_entries(html[lo + 1:hi - 1])

    def art_dir(cid):
        for sub in ('skins', 'chars'):
            p = os.path.join(DIET, 'assets', sub, cid)
            if os.path.isdir(p):
                return p
        return None

    roster = []
    for e in entries:
        m = re.search(r"id:\s*'([a-z0-9_-]+)'", e)
        if not m:
            roster.append((None, e, None, 0))
            continue
        cid = m.group(1)
        rar = (re.search(r"rar:\s*'([a-z]+)'", e) or [None, ''])[1]
        d = art_dir(cid)
        roster.append((cid, e, rar, dir_bytes(d) if d else 0))

    fixed = sum(os.path.getsize(os.path.join(b, f)) for b, _, fs in os.walk(DIET) for f in fs) \
        - sum(sz for _, _, _, sz in roster)
    keep, spent = set(), fixed
    order = {'starter': 0, 'common': 1, 'rare': 2, 'epic': 3}
    for cid, e, rar, sz in sorted([r for r in roster if r[0]],
                                  key=lambda r: (order.get(r[2], 9), r[3])):
        if rar == 'starter' or spent + sz <= budget:
            keep.add(cid)
            spent += sz
    print(f'fixed weight (everything that is not a character) {mb(fixed)}')
    print(f'roster kept: {len(keep)} of {len([r for r in roster if r[0]])} '
          f'-> {", ".join(sorted(keep))}')

    took = 0
    for cid, e, rar, sz in roster:
        if cid and cid not in keep:
            d = art_dir(cid)
            if d:
                took += sz
                shutil.rmtree(d)
    dropped['alternate skins and rarer critters'] = took

    kept_entries = [e for cid, e, _, _ in roster if cid is None or cid in keep]
    html = html[:lo + 1] + ''.join(kept_entries) + html[hi - 1:]
    open(idx, 'w', encoding='utf-8').write(html)

    for k, v in dropped.items():
        print(f'  dropped {mb(v):>10}  {k}')
    print(f'dieted folder {mb(dir_bytes(DIET))}')

    for target in ('gd', 'gm'):
        print(f'\n--- {target} ---')
        build(DIET, target, a.game_id)


if __name__ == '__main__':
    main()
