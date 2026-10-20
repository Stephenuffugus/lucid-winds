#!/usr/bin/env python3
"""Inline art/<rev>/manifest.json into index.html between /*BN_ART*/ and /*/BN_ART*/.

    python3 -P -E satellites/bubblenaut/tools/bninline.py [--rev r1]

The page carries its own manifest so the rectangles it draws with can never come from a different cut than the
atlases its ART_DIR names (index.html is always fetched fresh; a separate manifest file would be one more URL that
a cache could hold back). Only what the runtime reads is kept: rectangles, fps, loops, events, sizes, ledge caps,
bubble fit. The plates (backgrounds, title) are flattened to top level ids."""
import argparse, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
p = argparse.ArgumentParser(); p.add_argument('--rev', default='r1'); a = p.parse_args()
man = json.load(open(os.path.join(GAME, 'art', a.rev, 'manifest.json')))
out = {}
for k, v in man.items():
    if k == 'plates':
        for pk, pv in v.items(): out[pk] = dict(img=pv['img'], w=pv['w'], h=pv['h'])
        continue
    keep = dict(img=v['img'], w=v['w'], h=v['h'], store=v['store'], strips={})
    for sn, s in v['strips'].items():
        keep['strips'][sn] = dict(fps=s['fps'], loop=s['loop'], ev=s['ev'], f=s['f'])
    if 'bubbleFit' in v: keep['bubbleFit'] = v['bubbleFit']
    if 'ledge' in v: keep['ledge'] = v['ledge']
    out[k] = keep
js = json.dumps(out, separators=(',', ':'))
path = os.path.join(GAME, 'index.html')
html = open(path, encoding='utf-8').read()
pat = re.compile(r'/\*BN_ART\*/.*?/\*/BN_ART\*/', re.S)
if len(pat.findall(html)) != 1: sys.exit('expected exactly one /*BN_ART*/ marker pair in index.html')
html = pat.sub(lambda m: '/*BN_ART*/' + js + '/*/BN_ART*/', html)
html2 = re.sub(r"var ART_DIR='art/[^/']+/';", "var ART_DIR='art/%s/';" % a.rev, html)
open(path, 'w', encoding='utf-8').write(html2)
print('inlined %d atlases and plates, %d bytes, ART_DIR art/%s/' % (len(out), len(js), a.rev))
