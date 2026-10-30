# BUILD ORDER, 29 Oct 2026 (Fable, for Opus). Trigger: "build plans/BUILD-ORDER-OCT29.md"

> **STATE 30 Oct 06:41 UTC (Opus, building).** His word tonight: NO budget, NO usage checks, NO 8 hour clock; run the
> night one order, the night two order, then Lap 2, in one session; T0.18 deploys as sb-m0-1 after T0.8a, sb-m0-2 after
> T0.8b, sb-m0-3 when M0 is complete. **LIVE: sb-m0-2** (deploy `945b541b5`, both origins proven by curl 04:53:54 UTC):
> the thumbs climb on a phone. **Last shipped: T0.12a (sim part two: the wall slide, the wall jump with its lock, the corner rule, sticky vines; H-sim-9..12, 15, H-lab-5, H-lab-6; CORNER_PX_6, STICKY_PUSHOFF, LOCK_ZERO, STICKY_ARMS_RISING RED; the cling pose redrawn after the shot read it as the letter i).** Gates: check --fast green (lint, harness 4119 assertions in 78 groups, redwatch, boot, play, make, input, layout). Red: nothing. Next: T0.12b (dive and dash), then the third independent review, then T0.13a (the bot). Autosave running.

You are Opus, the Lead Developer, in a fresh session. Stephen is the Director. Tonight is ONE game from zero:
Shutterbug, a photo of a room becomes a pixel platformer level (`satellites/shutterbug/DESIGN.md`). Fable wrote the
design plan today after the didactic tribble codespace died mid session; you write every line of the code, task by
task, each task its own commit, pushed. Two deploys are named below; never ask whether to deploy, and never deploy
anything else. Stephen plays the result at `https://lucidwinds.com/satellites/shutterbug/` in the morning (no portal
card: the page is reachable by its address only until he lists it). HANDOFF section 4 has him approve the plan before
M0 and play M0 before M1; his ruling tonight stands in for the first gate (the plan is his to redline in the morning),
and the SAFE and WAITS marks in the plan honour the second.

**Budget.** He did not name a number tonight. Check usage after every task; the budget is the only thing that ends
the night early. The order below puts the hook first (a playable climb of the sample room) so that wherever the budget
stops there is a live page and a true morning report, never a half built game. When you judge the budget nearly gone,
stop building, write the State block and the morning report (section "Done means"), and push.

## Before anything (the setup, about fifteen minutes)

1. `cd /workspaces/lucid-winds && git status -sb && git fetch -q origin main && git rev-list --count HEAD..origin/main`
   must print `0` on branch `add-sproing-jumper`; if not, merge main in first. `node --version` is 24.
2. Serve the repo root once for the night, if it is not already up: `curl -sI http://localhost:8777/ | head -1`;
   if nothing answers, `(cd /workspaces/lucid-winds && python3 -m http.server 8777 >/dev/null 2>&1 &)`.
3. Prove Chrome in your own turn: `node tools/shutterbug-tests/shoot.mjs http://localhost:8777/docs/briefs/opus-kickoff-oct29/
   /tmp/claude-1000/shutterbug-shots/setup` prints two files and `(no page errors)`. Open one. If it cannot find
   Chrome, the header of `shoot.mjs` says how to restore it (`/workspaces/sws-tools`, puppeteer, the apt libraries).
4. Read, in this order, once: `satellites/shutterbug/HANDOFF.md`, `DESIGN.md` in full, `BUILD-PLAN.md`,
   `QUESTIONS.md`, then the top of `START-HERE.md` (the top entry only, Fable, 30 Oct 00:50 UTC; the file is 560 KB,
   never read it whole). The plan is built
   on the recommendation under every question: build to the recommendation, never wait for a ruling.
5. `ls ~/.config/gh/hosts.yml`. If it is missing, `scripts/memory-sync.sh` cannot reach the private memory repo from
   this box (the ambient token is scoped to this repo); write memory files locally anyway and say so in the report.
6. Never run a `gh codespace` command of any kind, never touch the box named didactic tribble: it is Stephen's to
   open and rescue, and the standing rule is that no model deletes a codespace.
7. Start the autosave, once, and leave it running all night: `mkdir -p /tmp/claude-1000/shutterbug-lead && nohup
   tools/shutterbug-tests/autosave.sh >/tmp/claude-1000/shutterbug-lead/autosave.log 2>&1 &`. Every ten minutes it
   commits whatever changed under the Shutterbug paths as a WIP commit and pushes the branch, so the box closing
   itself (it stops after about twelve hours) can never strand work. Your own task commits and deploys are unchanged.

## Lap 1 (the night): M0, the vertical slice, in plan order

`BUILD-PLAN.md` section 4.0 is the procedure for every task (read it before T0.0: the gate budget, the overrun rule, the
wall clock, the stop line) and section 4 M0 is the list; 4.0's paragraph "Night one target, and the execution order"
is the order, restated here (revised 2026-10-30 after four reviews of the plan: the list is in id order in the plan and
runs in THIS order, which puts the climb first). Each task its own commit, pushed:

T0.0 branch and push proof, the plan files added if still untracked, PROGRESS.md appended · T0.1 prove the browser
pipe · T0.2 the skeleton (seventeen blocks, the fleet protocol, the title, the lint, the boot gate) · T0.3 harness.js
v0 (the loader, ns, rng, the record codec, redwatch v0) · T0.4a the palette (the sixteen, L S H, nearest, the bands) ·
T0.5 the sample room and the first six synthetic fixtures · T0.6 pipeline A (luminance, solidity, Negative, platforms,
landmarks, spawn, exit candidates) · T0.7a sim part one (run, gravity, variable jump, coyote, buffer, collisions, one
ways, the state and its hash) · **T0.8a the first playable climb** (render v0, the loop, keyboard) · **T0.18 as
`sb-m0-1`** · T0.8b the touch strip and the 360 wide alternative · T0.18 as `sb-m0-2` at the cut. Then, as the clock
allows, night two's order: T0.7b sim part one proven (determinism, coverage, the stepped tables, the jump labs) · T0.2b
journey C and the remaining lint rules · T0.5b the capture block and fixtures/make.html · T0.4b the contrast gate and the
swatch sheet · T0.5c the rest of the synthetic corpus · T0.9 the input gate and the layout gate at four sizes · T0.10a
the reach tables and corridors · T0.10b the reach graph, distances, the lab rooms · T0.11a exit by distance, repair,
needsCrop, the default spread · T0.11b the main ascent, route score v0, the onboarding assertion · T0.12a sim part two
(wall slide, wall jump, the corner rule, sticky walls) · T0.12b dive and dash · T0.13a the bot, the generosity
assertion, the route walk · T0.13b the goldens, the bit flip, BOT-EXPLORE · T0.14 the develop reveal and the first
sounds · T0.15 capture (photo input, camera roll, the crop with the live overlay, the focal tap) · T0.16 moths, hearts,
death and restart, the beacon, hint glyphs · T0.17 sprites, terrain dressing, the frame, the on palette gate, the perf
guard · T0.18 the deploy and the morning report (runs whenever the budget ends, on the last green commit).

The plan's own night one target is T0.0 to T0.8b with the two T0.18 deploys (the keyboard climb at about 6 h 50 m at
the estimates, the thumbs climb at about 8 h 30 m); T0.7b is night two's first task unless the clock allows. Tasks
marked FEEL build the numbers DESIGN states and leave them in `TUNING`; they are his to tune in the morning.

**The first deploy** comes the moment T0.8a is green and shot: the sample room climb playable end to end at both
phone sizes (title, the Sample room link, the climb to the exit on the keyboard; the touch strip follows in T0.8b and
rides the cut deploy), the harness green and watched red, the shots opened and three things named. `BUILD=sb-m0-1 tools/shutterbug-tests/deploy.sh`
(M0 has no `sw.js`, so `CACHE` and `SWV` are not needed yet), then the host proof in the header of `deploy.sh`, one
probe at a time, both origins; write the line into the State block and go on. T0.18 is the plan's stop line deploy:
whenever the budget ends it deploys the last green commit as the next stamp (`sb-m0-2`, and so on) and writes the
morning report. Two deploys at least, then; never a deploy of a red tree.

## Lap 2 (only if Lap 1 is live and budget remains): M1, the tasks the plan marks SAFE, in plan order

The SAFE sequence of section 4 M1, in the plan's order, each its own commit: T1.1 biome detection and the Frost rule ·
T1.2a feature detection, part one (the claim order, ladder, pocket, door, beacon, the chest) · T1.2b feature detection,
part two (specks, scrolls, enemy clusters, the trap field, envelopes) · T1.3 route score with enemies, traps and
envelopes · T1.4 enemy sim (icicle, jelly, thorn crawler, spark, elites) · T1.4b trap sim and sprites · T1.6 loot
(specks, the chest, scroll pick one of two, hearts growth, DP) · T1.7 the SFX set · T1.8 share (the link, the code, the
preview sheet, opening from the hash) · T1.10 the save v1, recent rooms, settings (the mirror layout toggle is SAFE) ·
T1.11 the PWA (manifest, icons, service worker, the embed skip, offline and network gates) · T1.13 the free play loop
end to end · T1.9a the QR encoder and its known answers · T1.9b the QR drawer (last; if the QR slips, ship M1 without it
and say so). Then stop, and write the WAITS list into the morning report.

The tasks the plan marks WAITS never start tonight: they wait on Stephen's M0 play (HANDOFF section 3, "Stephen plays
it before M1 starts"). The M1 deploy is the first with a worker: `BUILD=sb-m1-1 CACHE=shutterbug-v1 SWV=1`, and every
later deploy bumps all three in the same commit (new files under an old stamp split players).

## Every task, the plan's way

Section 4.0 of the plan binds: `node tools/check.js --fast --gate <the previous task's gate>` green at the start (or the known state in PROGRESS.md);
build the scope inside the module boundary the task names; add its assertions and watch each go RED through
`tools/redwatch.js` before green counts; run only the ONE browser gate the task names (the full `check.js` at a
milestone end and before every deploy); for a shell task shoot 412 x 915 and 360 x 780 with
`tools/shutterbug-tests/shoot.mjs`, OPEN both and name three things wrong in PROGRESS.md; leave `index.html` loading
with the title reachable; commit with explicit paths and push; rewrite the State block (section 0) and append the
PROGRESS.md entry in the template of section 5.11. The overrun rule of 4.0 replaces every "try again" instinct: a
gate still red at twice the estimate, or one assertion red for 45 minutes, is committed green with the red assertion
marked `xfail` by name, a QUESTIONS.md entry, a `BLOCKED` row, and the next task that does not depend on it.

**Independent review, three times, not per task:** before the T0.8a deploy, before the cut deploy, and after T0.12b
(the hero complete, night two). This is the one exception to "no agent fan out": one workflow, three agents, one round, no loops:
a fidelity lens (the code against DESIGN section by section), a harness lens (can each assertion fail; what is
asserted that is not computed), a phone lens (360 wide layout, 48 px targets, the strip under the thumb). Fix what
they find before the deploy. No agent opens a browser; every agent writes in its own folder under your scratchpad.

## When the budget ends

At 8 hours elapsed no new task starts (4.0, the wall clock). Stop at a task boundary, never mid task. Run T0.18 on
the last green commit, write the morning report at the top of `START-HERE.md` (section 5.11 of the plan: what is
live with the proof, the State block, what you saw wrong in your own shots, the xfails and BLOCKED rows with the
failing lines, what you left unshipped and why, his calls in one ranked list with the palette first and the WAITS
list), push everything, one plain line to him.

## Do NOT start

- M2 or M3 (runs, gear, weapons, boss, Darkroom, unlocks, music, export, store copy): his play comes first.
- Any M1 task marked WAITS. The portal card line, the arcade list, any mention of Shutterbug on the portal.
- Anything under "his calls" in the plan or HANDOFF section 10: the palette is the plan's proposal until he rules
  (ship it, say so), the 36x64 fallback grid, Sunbeams and cosmetics, music per biome, unlock prices, the store rooms.
- Any other game or file. You may write only: `satellites/shutterbug/**`, `tools/shutterbug-tests/**`, the one
  `TWELVE` line in `scripts/fleet/ci-twelve.mjs` (see the laws), the top of `START-HERE.md`, this file's State block,
  memory files. Nothing in the Lucid Winds app, nothing in another satellite, nothing in `incoming/` or `portal/`.

## The laws (the plan repeats them; they bind)

- The core (`rng`, `palette`, `pipeline`, `reach`, `features`, `sim`) is pure: no DOM, no timers, no `Math.random`,
  no `Date`, no network. It is one tagged block shared verbatim by `index.html` and `harness.js` the way the plan
  says, with no build step (the mechanism is proven on this box: `tools/shutterbug-tests/core-loader-proof/`, regex
  extraction into a poisoned `vm` context; copy it, the plan names the exact tag and order). Every tunable number
  lives in `TUNING`. Fixed 60 Hz step with an accumulator; input
  sampled once per step. Determinism is a replay test, not a belief. Photos never persist: the only stored image is
  the 16 colour grid. The page makes no network call at runtime; the worker (M1) caches only what the plan's
  `pwa` section lists.
- Vanilla ES2020 in one `index.html`, no framework, no bundler, no runtime dependency (CLAUDE.md's ES5 rule is for the
  Lucid Winds app, not for a satellite). `harness.js` uses Node built ins only. `tools/check.js` is the fleet shape
  (copy `satellites/gerplunk/tools/check.js`: a GATES array, `SWS_NO_BROWSER=1` honoured and SAID, browser gates
  skipped with the reason and never failed for a missing dependency, puppeteer resolved from
  `/workspaces/sws-tools/node_modules` first and `/workspaces/lucid-winds/node_modules` second, a failure printing the
  failing lines). Add `'shutterbug'` to the `TWELVE` list in `scripts/fleet/ci-twelve.mjs` in the SAME commit as a
  `check.js` that is green with `SWS_NO_BROWSER=1` locally, never before (CI runs on every push of this branch).
- The fleet shell, from the first skeleton (`NEW_SATELLITE_BRIEF.md` and `incoming/PORTAL-CONTRACT.md` rule; the
  canonical block is in the contract, section "The embed protocol"): `framed` detection, `window.SWS_EXIT` (posts
  `{sws:'close'}` when framed, else history back from the portal or `location.replace` to the portal),
  `{sws:'ready'}` posted at parse time AND on the `load` event, `window.SWS_EMBED` set true when `?embed=1` is in the
  query or the page is framed, the worker registration skipped when `window.SWS_EMBED` is true, never
  `history.back()` or a navigation while embedded (every in game back is an internal screen switch whose handler
  hides every overlay it can sit over), one "All Sky Wolf games" button on the title wired to `SWS_EXIT()`, no
  fullscreen request when embedded, relative paths only, `viewport-fit=cover` with the safe area insets, 48 px
  rendered targets, text 0.7 rem or more. One mandatory include before `</head>`:
  `<script src="/music-unlocks.js" defer></script>` (the fleet's soundtrack ladder; inert, never cached by the
  worker, the one script outside the file); `node scripts/music_include.mjs --check` must list shutterbug as
  included. `deploy.sh` refuses a page without the `SWS_EMBED` guard and the `window.SWS_EXIT` assignment.
- Deploys are files only commits on main, built by `tools/shutterbug-tests/deploy.sh` in a private index from main's
  tree plus the served set (`index.html`, `manifest.json`, `sw.js`, `icons/`). Never push the branch to main. The
  script merges main back after the push. The docs, `harness.js`, `fixtures/`, `tools/` never leave the branch.
  Bump every stamp in the deploy commit: the page's `BUILD`, the worker's cache name, the `?v=` on the registration.
- Host proof after every deploy with curl, never a headless browser against the host (its bot check answers them
  with a 403 and can block the box's address): `-A "Mozilla/5.0"`, a random query, `lucidwinds.com` then
  `www.lucidwinds.com`, byte compared against `git show <C>:satellites/shutterbug/index.html`, one probe at a time.
- A visual change is not done until a 412 x 915 shot and a 360 wide shot are opened and three things wrong are named.
  A DOM popup lives in real time: `--tap` it open and shoot it. Never prove a control with `el.click()`: real
  touch events (`page.touchscreen.tap`), and the control strip is proven under a thumb, not a mouse.
- Efficiency: he pays by the hour; two cores are one physical core: one browser at a time, no agent fan out beyond
  the three reviews. Push after every commit. The State block, `START-HERE.md` and `PROGRESS.md` updated in the turn
  something changes.
- Player copy: no dashes, no exclamation marks, "Sky Wolf Studio" singular, plain sentences a stranger reads once.
- Audio never enters git: sound is synthesised in the page (the plan's `audio` block); `.gitignore` ignores every
  `music/` directory, so Stephen's tracks are an M3 question, not a folder. Nothing binary but the icons.

## Done means

Each shipped task: its assertions green and watched red, the shots looked at, PROGRESS.md appended, the State block
rewritten, pushed. Each deploy: live on both origins from curl, the stamp in the State block and at the top of
`START-HERE.md`. At the end, whichever point the budget reaches: a MORNING REPORT at the top of `START-HERE.md`
(what is live with the proof, what you saw wrong in your own shots, what you left unshipped and why, his calls in
one ranked list with the palette first), memory written (pushed if the token allows, said if not), everything pushed,
and one plain line to him.
