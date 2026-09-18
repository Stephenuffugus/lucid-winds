#!/usr/bin/env python3
"""ART PATCH step 3 (plans/jimothy/ART-PATCH-PLAN.md). Read-only. After scripts/recut_all.sh:

    python3 scripts/recut_match.py            ->  /tmp/jim-all/match.json + a printed summary

For every character it matches each recut cell to the live frame it IS, by LOOKS and only WITHIN that character
(⛔ a global best match confuses one purple dome with another; ⛔ never trust sheet position: Orca's 25a/25b are
swapped and Trash King's cells are in another order). Then it measures, pixel against pixel, what the recut
restores (paint the old cutter deleted: water, coins, flowers, domes) and what it would lose.

Categories:  RESTORE  recut has clearly more paint          -> candidate, after a LOOK
             LIVE+    the live frame has more paint          -> leave alone (a later hand fix or a better cut)
             REMADE   no recut cell looks like it (sim<.85)  -> leave alone (it was repainted after the sheets)
             SAME     no material difference
"""
import os, sys, glob, json, collections, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from depink import hsv
LIVE = os.path.join(HERE, '..', 'assets'); CUT = '/tmp/jim-all/cut'
ids = 'deckhand market hardhat scout firstfrost garage pigeon crow seagull opossum soggy summer nordic barista fishmonger grad labcoat skunk slug otter heron coyote seal salmon orca ghost richuncle sasquatch shark'.split()
TAG = {'s%d' % (i + 1): k for i, k in enumerate(ids)}
TAG.update({'m-trashking': 'trashking', 'm-pirate': 'pirate', 'm-mothman': 'mothman', 'm-astronaut': 'astronaut', 'm-Shinothy': 'shinothy', 'm-hazmat': 'hazmat', 'm-disco': 'disco',
            'm-alien': 'alien', 'm-frogger': 'froggery', 'm-Dinosaur': 'dino', 'm-wizard': 'wizard', 'm-robot': 'robot', 'm-cardboardknight': 'knight', 'x-barnacle': 'barnacle'})
CRITTERS = set('pigeon crow seagull opossum skunk slug otter heron coyote seal salmon orca sasquatch'.split())

def load(p):
    a = np.array(Image.open(p).convert('RGBA')); m = a[..., 3] > 40; ys, xs = np.where(m); return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
def sig(a, n=40):
    v = np.array(Image.fromarray(a).resize((n, n), Image.BILINEAR)).astype(np.float32); al = v[..., 3:4] / 255
    v = np.concatenate([v[..., :3] * al / 255, al], -1).ravel(); return v / (np.linalg.norm(v) + 1e-6)
def pink(a):
    H, S, V = hsv(a); return (a[..., 3] > 40) & (H >= 288) & (H <= 348) & (S >= 0.5) & (V >= 0.5)

rows = []
for tag, k in sorted(TAG.items()):
    folder = ('chars/' if k in CRITTERS else 'skins/') + k
    cells = [(p, load(p)) for p in sorted(glob.glob('%s/%s/*.png' % (CUT, tag))) if not p.endswith('run-l.png')]
    if not cells: continue
    S = np.stack([sig(c[1]) for c in cells])
    for lp in sorted(glob.glob('%s/%s/*.png' % (LIVE, folder))):
        frame = os.path.basename(lp)[:-4]
        if frame == 'run-l': continue                      # run-l is mirror(run-r) except Market and Scoutmaster: handle by hand
        L = load(lp); sims = S @ sig(L); j = int(sims.argmax()); sim = float(sims[j]); row = dict(live='%s/%s' % (folder, frame), cut=cells[j][0], sim=round(sim, 3))
        if sim >= 0.85:
            R = np.array(Image.fromarray(cells[j][1]).resize((L.shape[1], L.shape[0]), Image.BILINEAR)); mL, mR = L[..., 3] > 40, R[..., 3] > 40
            gain, loss = mR & ~mL, mL & ~mR; A = int(mL.sum()); gp = int((gain & ~pink(R)).sum()); lp_ = int((loss & ~pink(L)).sum())
            row.update(area=A, gain_paint=gp, loss_paint=lp_, gain_pink=int((gain & pink(R)).sum()), pinkR=int(pink(R).sum()), pinkL=int(pink(L).sum()))
            net = gp - lp_
            row['cat'] = 'RESTORE' if (net >= max(400, 0.012 * A) and gp >= 2 * max(lp_, 1)) else 'LIVE+' if (-net >= max(400, 0.012 * A) and lp_ >= 2 * max(gp, 1)) else 'SAME'
        else: row['cat'] = 'REMADE'
        rows.append(row)
json.dump(rows, open('/tmp/jim-all/match.json', 'w'), indent=0)
c = collections.Counter(r['cat'] for r in rows); print('frames compared:', len(rows), dict(c))
by = collections.Counter(r['live'].split('/')[2] for r in rows if r['cat'] == 'RESTORE'); print('RESTORE by pose:', dict(by.most_common()))
bych = collections.Counter(r['live'].split('/')[1] for r in rows if r['cat'] == 'RESTORE'); print('RESTORE by character:', dict(bych.most_common()))
print('RESTORE frames whose recut also brings back more than 300 px of hot pink (depink them, never a shield):', sum(1 for r in rows if r['cat'] == 'RESTORE' and r.get('gain_pink', 0) > 300))
