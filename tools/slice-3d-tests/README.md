# Super Slice 3D test tools (saved from /tmp on 2026-10-23, before a codespace stop)

These lived in `/tmp`, which is wiped at every codespace stop. They are not part of the game and are never deployed
(the files-only deploy names `satellites/slice-3d` and `portal/index.html` only). The suite itself is
`satellites/slice-3d/audit-check.mjs` (run against the repo root served on 8777).

## Restore after a stop

```
mkdir -p /tmp/claude-1000/ssb && cp -r tools/slice-3d-tests/ssb/* /tmp/claude-1000/ssb/
cd /workspaces/lucid-winds && (python3 -m http.server 8777 >/dev/null 2>&1 &)   # serve the REPO ROOT
```
The `ssb` tools use absolute `/tmp/claude-1000/ssb` paths for their outputs, so put them back there. The `fix` and `rev`
harnesses run from anywhere (`node tools/slice-3d-tests/fix/ice_fix.js`).

**Old-worker profiles are NOT saved** (13 MB each). Before the next deploy, prime fresh ones on the version that is live
NOW, so the check after the deploy proves a phone holding the old worker gets the new build:
```
node /tmp/claude-1000/ssb/oldworker.mjs https://lucidwinds.com prime
node /tmp/claude-1000/ssb/oldworker.mjs https://www.lucidwinds.com prime
# deploy, wait for both origins, then:  ... check   (rerun once if the worker is still the old one: handover in flight)
```

Astra's notes (BUILD_NOTES.md etc.) re-extract from the vault release `vault-20261023-super-slice-astra` in
`Stephenuffugus/lucid-winds-vault` (`env -u GITHUB_TOKEN -u GH_TOKEN gh release download ...`, sha256 check, `python3 -I`
zipfile, docs only) to `/tmp/claude-1000/ssdocs/x`.

## What is here

`ssb/` (one browser at a time, the box has 2 cores):
- `look.mjs <outdir> <case...>`: phone shots (412x915 DPR 2). Cases: title set how forge journey climb endless hud hudff
  ff:<lvl> ffmid:<lvl>:<frac> deep:<m> thorn:<lvl> verb:<lvl> banner ring:<lvl>. Env VW VH DPR NOART PAGE.
- `fw/vfilm.mjs <outdir> ice|lantern|loaf`: a Part D verb filmed at full speed, a frame per event. `fix/sheet.py` makes a
  contact sheet: `python3 -I fix/sheet.py <dir> '<glob>' <out.png> 5`.
- `oldworker.mjs <origin> prime|check`: deploy proof from a persistent profile (see above).
- `smokeB.mjs`: every mode once, page errors, menu layout. `layoutcmp.mjs` + `lay61.json`: numbered layouts against v6.1.
- `fw/fw*.mjs`: older fail-watch rows (MUT env of find/replace pairs over a served copy). `perf*.mjs`, `reach.mjs`,
  `knifecheck.mjs`, `chunkcost.mjs`: frame time, knife reach, Endless chunk cost.

`fix/` (Part D review work; node only, CPU):
- `harness2.js`: the REAL contact functions pulled out of index.html into a vm plus a line for line copy of stepWorld's
  freefall branch, checked against the source so it cannot drift silently. `harness3.js`: the same, `SRCF=<old html>`.
- `ice_fix*.js`, `ice_var*.js`, `ice_stuck.js`: the ice through the real code (no input and one hold sweeps).
- `loaf_real.js`, `loaf_var*.js`, `loaf_fix.js`, `loaf_cmp.js`, `loaf_pass.js`: the loaf against the stack it replaced
  (41,040 no input falls).
- `bandrule.js`, `branchmiss.js`, `findsalt.js`: Endless verb placement by replaying endlessChunk's draw order.
- `fwrun.js` + `mkslices.js`: fail-watch for a PAGE. mkslices cuts row [17] and the late art.json block out of the suite;
  fwrun writes each mutated copy as `satellites/slice-3d/index-fw.html`, runs the slice against it, deletes it.
- `salt3.mjs`, `loafdbg.mjs`: one-off probes (row [3]'s seeds, a knife over the loaf).

`rev/`: the Part D reviewers' harnesses (`seg.js` replays ffSegments; useful for Part E's Clean Slice route proof).

## Part E1 (2026-10-24) and the E2 work in progress

`fix/` (node only):
- `stackwall.js`: no input falls past one 10 slab stack through harness2's real contact code, the slab branch swapped for
  models (v64, slab, stack, stackAny, clamp). `outcheck.js`: falls with a LIVE step past the wall's reach (v6.4 2,550 of
  80,028, shipped 0). `stackwall_live.js`: the shipped step (harness2, drift checked) equals the `clamp` model.
- `gatecheck.js [still|spin] [u]`: gate falls, shipped vs v6.4 vs the review's first cut, watched [u] below the gate. Watch
  40, not 6: a knife drifting at a wall blade first sticks a moment later on every rule (the review's "64 new sticks" were a
  6 u window). What the first cut really did: carried knives inside gate slabs (2,588 falls; v6.4 and shipped 0).
- `fwrun_e1.js [group]`: 22 mutation groups over row [18] and row [1], each must go RED on its check. Run `mkslices.js`
  first (it writes the row1/row17/late/row18 slices; they are generated, not committed).

`ssb/`: `fw/lanefilm.mjs <outdir> [side]` films a knife falling into the stack-wall lane (a frame per wood and cut);
`gateprobe.mjs` traces the suite's gate fall on PAGE.

`e2/` (Clean Slice, not shipped yet; node only, CPU heavy, one at a time):
- `world.js`: the REAL buildFreefall (with ffSegments, every piece builder, the verbs) and the REAL stepWorld pulled out of
  index.html into a vm, every drawing/sound/DOM call stubbed. It reproduces the suite's fact that a no input level 1 dive
  lands clean on exactly 11 of 40 seeds.
- `carvecal.js`: which arrival states carve a whole column (within 1 u, blade within ~25 degrees of down: 36 of 36).
- `feas*.js` + `ctl.js`: the reach tables (room vs lateral move) a two hold program achieves, from a finished carve and from
  the flat start. `cleanline.es5.js`: the Clean Slice rule drafted as game ES5.
- `ctl3.js` + `prove3.js <lvlFrom> <lvlTo> <seeds>`: the near human controller (decides every ~0.1 s, commits to a plan,
  hold edges blurred 2 steps, sees bumpers, crystals, thorns, gourds and each wasp in time) driving real dives down the line.


## Part G (2026-10-24, v7.3)

`fix/fwrun_g.js [group]`: nine broken copies over rows [22] and [16] (the G1 lowering taken out, capped short, halved, applied
in the air, applied on Freefall, not clamped at the surface; the v7.2 shelf, two neighbours swapped, a trophy among the
priced knives). Run `mkslices.js` first. All nine went red.

`g3/` (Endless survival, node only, seconds per dive):
- `sight.mjs [depths]` (browser): how much shaft the phone shows BELOW a falling knife (the canvas's bottom edge on the knife's
  plane, bisected on the real camera at 412 x 915): 30.2 u at 20 u/s, 33.4 at 30, 40.3 at 47, 45.4 at 60.
- `ctlE.js`: e2/ctl3.js (the near human controller) with the fall's gravity and terminal speed as parameters (`PH`).
- `survive.js [seeds] [maxDepth]`: the controller in calm mode (blade down, off the walls, out of the hazards) drives the REAL
  Endless build and step (buildEndless + the chunk ring + stepWorld in the e4 vm). It sees only what is on screen and reacts
  0.25 s after a hazard comes into view (env SIGHTK, RT; `SIGHTK=99 RT=0` sees everything). SRCF=<copy> measures another build
  (a sed of END_TERM_SLOPE2 into a scratch copy is how the slope table was made).
