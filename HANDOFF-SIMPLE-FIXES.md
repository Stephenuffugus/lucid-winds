# HANDOFF: simple game fixes (written 2026-08-21, late night)

You are a Claude session picking up light maintenance for Stephen's arcade
while he sleeps. This file is your whole brief. Work the queue below top to
bottom, verify every change, push after every commit. If the queue is done,
stop; do not invent large projects.

## The rules that are not optional

1. **Deploy** = commit on `add-sproing-jumper`, then
   `git push origin add-sproing-jumper:main`. Hostinger serves main.
   Nothing is live until that push, and a 200 is not proof: probe the LIVE
   url for a NEW marker string you just added, with `?probe=$RANDOM`.
2. **Caching law**: bump every `?v=` you touch (portal card url, sw.js
   registration AND its SHELL_VERSION/cache constant together). A player
   who keeps the old cache is a player you did not fix.
3. **LOOKING is part of the job**: any visual change gets a screenshot at
   412x915 (deviceScaleFactor 2, touch on) that you OPEN AND READ. Name
   what is wrong in it before assuming you are done. Puppeteer probes live
   in `scripts/` (repo node_modules resolve there; the scratchpad cannot).
   A local server usually runs at `127.0.0.1:8777` (repo root,
   `python3 -m http.server 8777`); use `domcontentloaded`, never
   networkidle.
4. **Run the game's own gates** after editing it and before committing:
   many satellites carry `sim.js --test`, `check.js`, `audit-check.mjs`,
   or `pagecheck.js` in their folder. `scripts/portal_ux_check.mjs` (26
   asserts) and `scripts/advertised_count_check.mjs` guard the portal —
   run both after ANY portal edit.
5. **Copy rules**: no dashes of any kind in player-facing text (spell it
   out or use commas), display names never slugs, the studio is
   **Sky Wolf Studio** (SINGULAR) in any NEW copy.
6. **Never remove a game.** Gating (`beta:true`) exists; removal does not.
7. **Read before believing**: `DONE-LEDGER.md` before any sweep or count;
   a game's `AUDIT-NOTES.md` before calling anything broken;
   `VENDORING.md` before touching `satellites/<slug>/` for a vendored
   game (fix upstream, never hand-edit those).
8. **Do not touch**: Steam anything, payment code (functions/, LW_WebPay),
   the Lucid Winds economy, vendored games, `index.html`'s game systems.
   Do not deploy Firebase functions. Do not start rebuilds.
9. Commit messages explain WHY, quoting Stephen when the fix answers his
   feedback.

## The queue (in order)

### 1. Brand sweep: "Sky Wolf Studios" -> "Sky Wolf Studio"
Stephen owns skywolfstudio.com (singular); the plural .com belongs to
someone else. Shipped games still say the plural everywhere.
- `grep -rn "Sky Wolf Studios" --include="*.html" satellites/ play/ portal/`
  plus games/*.js. Change PLAYER-VISIBLE copy (title screens, footers, og
  meta, share strings) to "Sky Wolf Studio".
- Do NOT rename code identifiers, file paths, or localStorage keys.
- This trips dash-free/copy checks in some games' suites; run each game's
  gate after editing it. Batch by folder, commit per batch, push each.
- Skip vendored games (VENDORING.md list) — note them in the commit body
  as "needs upstream fix" instead.

### 2. Feedback-fab collision sweep (canvas games, bottom-right controls)
The floating feedback chip parks bottom-right and CANNOT see painted
controls; it ate Rabbit Ronin's JUMP button (see
`feedback_fab_on_painted_controls` in memory). feedback.js v7 supports
`home:'top-right'`.
- For each satellite that mounts the fab (`grep -l "mountFab" satellites/*/index.html`),
  open the game headless, screenshot the PLAY state, and LOOK: does any
  painted control sit in the bottom-right quarter?
- If yes: change its mount to `/feedback.js?v=7` +
  `home:'top-right'` (copy the pattern from
  satellites/rabbit-samurai/index.html line ~807), re-screenshot, confirm
  the fab sits in dead space top-right.
- One commit per fixed game, screenshot-verified. Already done:
  rabbit-samurai, slice-3d.

### 3. Dash characters in /play/ shell copy
`play/shell.js` builds a directions sheet; some game entries and shells
carry em-dashes in player-facing text (Master Pollinator's rules sheet
does). Sweep `play/*.html`, `play/shell.js`, `games/*.js` for em/en
dashes in STRINGS THE PLAYER READS and rewrite them dash-free without
changing meaning. Leave code comments alone. Run
`node scripts/portal_ux_check.mjs` and each touched game's gate.

### 4. Thumb freshness check
`portal-assets/thumbs/rabbit-samurai.jpg` was regenerated tonight (says
Rabbit Ronin). Spot-check other thumbs whose games were renamed or
overhauled recently (Stop the Light, Super Slice hub): open the thumb,
open the live game title screen, compare. If a thumb shows a dead name,
regenerate: screenshot the title screen at 540x960, crop 480x480 around
the title, save jpg quality 82 (must stay under 150KB), and bump the
thumb reference in portal/index.html with `?v=<something new>`.
`scripts/rr_thumb.mjs` is the pattern.

## Design notes left by Stephen tonight (DO NOT BUILD, just preserve)
- Rabbit Ronin: a dedicated dash/attack button on the right side above
  JUMP is under consideration. He explicitly said not to build it yet.
- Deepwell wants a content expansion (more landmarks, deals, ore below
  400m). Rebuild-scale; not for this session.

## When the queue is empty
Update the memory repo (`~/.claude/projects/-workspaces-lucid-winds/memory`,
push with `env -u GITHUB_TOKEN -u GH_TOKEN git push origin main`) with a
short note of what shipped, then stop cleanly. Do not pick new work.
