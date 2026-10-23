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
