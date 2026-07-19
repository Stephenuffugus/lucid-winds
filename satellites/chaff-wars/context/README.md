# Chaff Wars — Context / Handoff Folder

For continuing this build (especially when switching to another model for more
intricate work). Read in this order:

1. **`ARCHITECTURE.md`** — how the game is built: engine, the AI + tuning, the
   `CW_DEV` sweep harness, controls, shell, conventions. Start here.
2. **`STATE.md`** — what's done + deployed, what's in progress, the prioritized
   TODO, multiplayer notes, and a tuning cheatsheet.
3. **`DESIGN-80s-theme.md`** — "Buff the Block" 80s graffiti / b-boy reskin. The
   procedural parts (neon pods, taunts, crew colors, chain pops, neon UI) are
   DONE + deployed; the character-portrait / tag-sticker art is specced for later.
4. **`DESIGN-powers-mode.md`** — the second mode (superpowers twist on Classic).
   NOT yet built. Full spec: power resource model, 14 opponent powers + player
   power(s), balance, and a phased build plan. This is the main "program it in"
   next step (Classic stays the focus/default).
5. **`ASSET-LIST.md`** — the art + audio manifest (Classic MVP 44 / +Powers 41 /
   +Polish 160 = 245 total). A copy is dropped in Stephen's 012Assets Drive folder.

## Quick facts
- One self-contained ES5 file: `satellites/chaff-wars/index.html`. Dev hook `?cwdev=1`.
- Deploy: `git push origin add-sproing-jumper:main`.
- Verify before ANY commit: extract inline `<script>` blocks + `new vm.Script()`
  (parse), and `CW_DEV.proofCheck()` all-pass (engine correctness).
- Re-tune difficulty: `node scripts/satellite_probe.js chaff-wars CW_DEV cwdev "sweep([1,2,3,4,5,6,7,8,9,10],{cadence:430,pBlunder:0.15,maxMs:80000})"`.
- Screenshot: `scripts/satellite_probe.js ... "demo(STAGE,SEED,N)" --shot out.png`.

## What Stephen asked for (this session) — status
- Nudge secret to ~15%, smooth mid pests — DONE.
- Large ergonomic controls, fullscreen, install, music, "everything the studio
  has" — DONE (music = in-file 80s electro beat; studio drawer also present).
- 80s graffiti b-boy theme — procedural reskin DONE; art assets = ASSET-LIST.
- Powers mode — DESIGNED (this folder); scaffolding is the next build step.
- Asset list in 012Assets Drive — DONE (see ASSET-LIST.md).
- This context folder — DONE.
- Multiplayer — AFTER Stephen's test + model upgrade (see STATE.md notes).
