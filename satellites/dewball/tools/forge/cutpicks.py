#!/usr/bin/env python3
"""Dewball forge CUTPICKS: cut every kind of a world from its Astra pictures exactly as its picks file says,
so the pictures Meshy is given can be made again from the repo.

    python3 satellites/dewball/tools/forge/cutpicks.py tools/forge/w5-picks.json --pictures <dir of picture-NN.png>
        [--out tools/forge/meshy-in] [--only crabS,gull]

The picks file's "cut" holds, for each kind, {"picture": n, "quarter": "whole" | "top left" | "top right" |
"bottom left" | "bottom right", "tol": 18, "holes": 8, and any of "shadow", "shadowChroma", "ramp", "specks"}
(sheetcut.py's flags; looked at on magenta, 1 Nov 2026). Kinds that share a picture and the same flags are cut in
one sheetcut run; a kind cut with other flags from the same picture gets a run of its own, the other quarters
named "-". Writes <out>/<kind>.png and <out>/_contact-<world>-pNN-<n>.png.
"""
import argparse, json, os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
QUARTERS = ['top left', 'top right', 'bottom left', 'bottom right']
FLAGS = [('tol', '--tol'), ('holes', '--holes'), ('shadow', '--shadow'), ('shadowChroma', '--shadow-chroma'),
         ('ramp', '--ramp'), ('specks', '--specks')]


def main():
    p = argparse.ArgumentParser()
    p.add_argument('picks')
    p.add_argument('--pictures', required=True)
    p.add_argument('--out', default=os.path.join(HERE, 'meshy-in'))
    p.add_argument('--only', default='')
    a = p.parse_args()
    picks = json.load(open(a.picks))
    world, cut = picks['world'], picks['cut']
    only = set(filter(None, a.only.split(',')))
    runs = {}
    for kind, c in sorted(cut.items()):
        if only and kind not in only:
            continue
        flags = tuple((f, c[f]) for f, _ in FLAGS if f in c)
        runs.setdefault((c['picture'], c['quarter'] == 'whole', flags), []).append((kind, c['quarter']))
    os.makedirs(a.out, exist_ok=True)
    bad = 0
    for n, ((pic, whole, flags), kinds) in enumerate(sorted(runs.items())):
        src = os.path.join(a.pictures, 'picture-%02d.png' % pic)
        if whole:
            grid, names = '1x1', [kinds[0][0]]
        else:
            grid, names = '2x2', ['-'] * 4
            for kind, q in kinds:
                names[QUARTERS.index(q)] = kind
        tmp = tempfile.mkdtemp(prefix='cutpicks-')
        cmd = [sys.executable, os.path.join(HERE, 'sheetcut.py'), src, '--grid', grid, '--kinds=' + ','.join(names), '--out', tmp]  # = form: a list starting "-" is not an option
        for f, opt in FLAGS:
            v = dict(flags).get(f)
            if v is not None:
                cmd += [opt, str(v)]
        r = subprocess.run(cmd, capture_output=True, text=True)
        print('%s picture %d %s: %s' % (world, pic, ' '.join(cmd[cmd.index('--out') + 2:]), names))
        print('  ' + (r.stdout + r.stderr).strip().replace('\n', '\n  '))
        for kind, _ in kinds:
            f = os.path.join(tmp, kind + '.png')
            if not os.path.exists(f):
                print('  MISSING %s' % kind); bad += 1; continue
            shutil.copy(f, os.path.join(a.out, kind + '.png'))
        for f in os.listdir(tmp):
            if f.startswith('_contact-'):
                shutil.copy(os.path.join(tmp, f), os.path.join(a.out, '_contact-%s-p%02d-%d.png' % (world, pic, n)))
        shutil.rmtree(tmp)
    print('CUTPICKS %s %d kind(s), %d missing' % (world, sum(len(v) for v in runs.values()), bad))
    sys.exit(1 if bad else 0)


main()
