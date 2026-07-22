#!/usr/bin/env python3
"""Jimothy frame audit — which of the 18 canonical animation frames each character actually has.

Read-only. Run from satellites/stream-hop:  python3 scripts/frame_audit.py [--csv]

The canonical list and the reason each frame exists are in ART-BIBLE-ANIMATION.md. This script is
the ground truth for roster status so we never guess at what is painted and what is not.
"""
import os, re, sys, hashlib

FRAMES = ['idle', 'sit', 'eat', 'crouch', 'leap', 'land', 'run-r', 'dash-run', 'coffee',
          'magnet', 'umbrella', 'shield', 'scared', 'flee', 'cheer', 'ko', 'dizzy', 'splash']
OPTIONAL = ['run-l']
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def roster():
    """Pull id/name/rarity/sheet straight out of index.html so this can never drift from the game."""
    src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    blk = src[src.index('var CHARS=['):src.index('function charById')]
    out = []
    for e in re.split(r"\n\s*\{id:'", blk)[1:]:
        e = "{id:'" + e

        def f(k):
            m = (re.search(k + r":'((?:[^'\\]|\\.)*)'", e)
                 or re.search(k + r':"((?:[^"\\]|\\.)*)"', e))
            return m.group(1) if m else ''
        out.append(dict(id=f('id'), name=f('name'), rar=f('rar'), sheet=f('sheet'),
                        secret='secret:1' in e))
    return out


def digest(path):
    with open(path, 'rb') as fh:
        return hashlib.md5(fh.read()).hexdigest()


def main():
    as_csv = '--csv' in sys.argv
    rows = []
    for c in roster():
        d = os.path.join(ROOT, 'assets', c['sheet'])
        have, missing, seen = [], [], {}
        for fr in FRAMES:
            p = os.path.join(d, fr + '.png')
            if os.path.exists(p):
                have.append(fr)
                seen.setdefault(digest(p), []).append(fr)
            else:
                missing.append(fr)
        # frames that are byte-identical are placeholders pointing at the same painting
        dupes = sorted([g for g in seen.values() if len(g) > 1], key=len, reverse=True)
        distinct = len(seen)
        rows.append((c, have, missing, distinct, dupes))

    if as_csv:
        print('id,name,rarity,have,distinct,missing')
        for c, have, missing, distinct, _ in rows:
            print('%s,%s,%s,%d,%d,%s' % (c['id'], c['name'], c['rar'], len(have), distinct,
                                         ' '.join(missing)))
        return

    print('JIMOTHY FRAME AUDIT — %d canonical frames per character\n' % len(FRAMES))
    print('%-12s %-24s %-8s %5s %9s  %s' % ('id', 'name', 'rarity', 'files', 'distinct', 'status'))
    print('-' * 108)
    done = 0
    for c, have, missing, distinct, dupes in sorted(rows, key=lambda r: (-r[3], r[0]['id'])):
        if distinct >= len(FRAMES):
            status, done = 'COMPLETE', done + 1
        elif distinct <= 1:
            status = 'ONE PAINTING ONLY — %d files all identical' % len(have)
        else:
            status = 'missing %d: %s' % (len(missing), ' '.join(missing[:6])
                                         + ('…' if len(missing) > 6 else ''))
        print('%-12s %-24s %-8s %5d %9d  %s' % (c['id'], c['name'], c['rar'],
                                                len(have), distinct, status))
    print('-' * 108)
    print('%d of %d characters complete.' % (done, len(rows)))
    total_missing = sum(len(FRAMES) - r[3] for r in rows)
    print('%d paintings outstanding across the roster.' % total_missing)


if __name__ == '__main__':
    main()
