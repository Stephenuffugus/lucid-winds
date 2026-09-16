# RESUME PROMPT, 2026-09-16 (paste the block below into a fresh session after the codespace refresh)

## ⭐ CURRENT STATE, 2026-09-15 23:40 UTC (supersedes the queue lists further down; read this first)

Stephen, 2026-09-15 evening: "keep working all night and dont stop to ask me ... fix all that shit and get back to work where you
left off. make sure to save and record memory of whats done so when the space closes on its own nothing is lost."
The codespace was NOT refreshed; the run continued in the same session. Memory notes: `project_cdn_429_lockout_sep15`,
`project_lane_c_math_progress_sep16` (both current; the lane C note is the short version of this section).

- **Outage: found and fixed in code, LIVE** (`4512344c`, probed). Cause: Hostinger's CDN edge 429 lockout per IP. Stephen owns the
  hPanel CDN security setting. Details and the still open items (Jimothy's 143 request first load, `portalPing` CORS) are in the
  OUTAGE FINDINGS section below.
- **LIVE, every gate counted:** CREASE, **BRIM** (`ddc00823`, 22:31 UTC), **GLIMPSE** (`7dbfb8ce`, 23:01 UTC). Deployed alone each.
- **Deploy pattern (the whole branch holds unfinished games, never push the branch to main):** a worktree on origin/main,
  `git checkout add-sproing-jumper -- satellites/<game>`, commit, check `HEAD~1 == origin/main`, `git push origin HEAD:main`, then
  `git merge origin/main` into `add-sproing-jumper`, push, and probe one served file at a time with a random query.
- **NOTCH:** every browser gate green; TURN counts (plants k1 k2 red), CONFIG counts (plant c1 red). Eight more plants queued
  (`plans/lane-c-plants/game-plants.cjs notch notch-plants.json --pair`). Owed: an art plant, shots, deploy alone.
- **TINT: every gate green** (compare, fill, scales, pour, audio pending its own plant, config, offline, layout, art). POUR was red
  twice on the gate own faults and is now POUR OK; LAYOUT was red twice on the page and is now LAYOUT OK. Seven plants queued
  (`game-plants.cjs tint tint-plants.json --pair`, plus a1 and r1 by prefix). Owed: plants red, shots opened, deploy alone.
- **HUSH:** first full check ran: ten gates green, four red and all four read. AUDIO was the page (snap and breath used Math.random
  while CORE hands a seeded rand: the rms halved, the peak did not), fixed. LAYOUT was the gate (it failed its own seeding reload),
  fixed. SPECIMENS and PACE now set the motion setting and report what they saw. Recheck queued on `5fbaba53`. Twelve plants queued.
  Owed: recheck green, plants red, shots opened, deploy alone.
- **GAUGE: every gate has passed** (lint, decimal, engine, compare, code, zoom, same, audio, config, offline, layout, pace, art,
  specimens). SAME's red had been the gate's own fault, the P3 instrument case over its second session; fixed in `6607fa22` and the
  rerun came back SAME OK. Eleven plants queued (`plans/lane-c-plants/gauge-p1p3-plants.cjs`). BRIM is live, so GAUGE deploys alone
  once its plants go red.
- **Not deployed:** HUSH, NOTCH, TINT, GAUGE, and the link builder's stamp `20260916f` (`schemas.js` now lists hush and gauge too;
  deploy the builder, `satellites/math/config`, alone once the games it lists are live).
- **Every plant runner is in `plans/lane-c-plants/`** (the scratchpad dies with the codespace). Frozen copies are made with
- ⛔ **A plant runner built every plant in one folder per game.** Two runs of the same game (the full list and a by prefix run)
  overwrote each other: the second created its folder before waiting on the lock and deleted the first's tree under a running
  gate, which reported `ENOENT: process.cwd failed` and printed NOTHING, which reads like a plant that planted nothing. Fixed:
  every invocation and plant gets its own folder (process id and plant key). **Invalidated and to be rerun with the fix: NOTCH r1
  and w1, TINT t1, HUSH m1** (and any other line showing ENOENT). One run of a game at a time.
  `git archive <commit> satellites/math satellites/<game> tools | tar -x -C <dir>`; set `PLANT_ROOT` to that dir.
- Each game's ledger (`plans/<game>/HANDOFF-<GAME>.md` section 13) holds every red, every fix and its cause, with commands.

## OUTAGE FINDINGS SO FAR (2026-09-15 22:10 UTC, before the refresh; read these before re-probing)

Stephen: "jimothy is just not working on the arcade also half the time the arcade wont load and my app studio wont load."

- **The host is refusing requests with HTTP 429 Too Many Requests**, empty body, headers `platform: hostinger`, `server: cloudflare`,
  `x-hcdn-request-id: ...-bos-edge6` (Hostinger's CDN edge). It returns 429 even for `cf-cache-status: HIT` files, so it is the edge's
  rate limit or DDoS protection, not the origin and not the repo.
- One fresh headless load of `/portal/` from this codespace: the page came up, then its banner, thumbnails, manifest,
  `music-player.js`, `music-tracks.js`, `feedback.js` all got 429. The empty 429 body has no MIME type, so the browser refuses the
  scripts ("Refused to execute script ... MIME type ('')"), which is exactly "assets not loading". Every page after that from the
  same IP (`/portal/apps.html`, `/jimothy/`, `/satellites/stream-hop/`, `/portal/` again) failed with `net::ERR_INVALID_RESPONSE`.
  Still 429 at 22:09 to 22:10 UTC on four probes 20 s apart; lifted by 22:14 UTC (200 on the portal and stream-hop), so the
  lockout lasts minutes and is per visitor. From outside (WebFetch) the portal returned 403 (bot protection).
- **JIMOTHY TRIPS THE LIMIT ON ITS OWN** (22:15 UTC, an IP that had just been let back in): one fresh load of
  `/satellites/stream-hop/` made 143 requests; the edge served 33 and answered **109 with 429** (sprites, powers, fx, the menu
  glyphs). The title screen shows TAP TO START with its glyph images broken. So any first visit to Jimothy locks the visitor out,
  and the arcade and apps page then fail for minutes. This is why Jimothy "is just not working" and why the arcade fails after it.
- The arcade's thumbnails already load lazily (`portal/index.html:1496`); the page is not the obvious burst. The home page HTML is
  7.1 MB, heavy but not the cause of a 429 on its own.
- Most likely: a phone or wifi that opens many games quickly (a tester session) crosses the CDN's per-IP limit and is then locked
  out for a while; "half the time" is the lockout window. This codespace's probes tripped it too.
- **The fix Stephen owns:** hPanel, lucidwinds.com, Performance, CDN: relax or turn off the CDN's security (rate limiting, DDoS or
  "under attack" protection, bot protection), or turn the CDN off to test. Ask him for a screenshot of that page if unclear.
- **DONE IN CODE, COMMITTED, NOT DEPLOYED (22:30 UTC):** the root `sw.js` navigation handler cached every response (so one 429
  overwrote the good arcade page) and handed a 429 to the browser. It now caches only ok pages, answers a 429 or 5xx from a good
  saved copy, and never serves a saved copy that is itself a 429 (poisoned before the fix). `play/sw.js` answers a 429 or 5xx on a
  script, style or page from its cache when a copy exists. Neither cache name was bumped on purpose: a bump deletes the saved
  copies the fallback needs, and a worker whose bytes changed installs anyway. Gate `node test/sw-lockout.mjs`: 14 ok, both plants
  (the old handlers rebuilt in memory) red; `node test/music/sw.mjs` still 15 ok. It helps players who have visited before; a first
  visit during a lockout still fails until the CDN setting is fixed. Deploy it with the next deploy (it rides the whole branch).
- **JIMOTHY, DONE IN CODE, NOT DEPLOYED:** `satellites/stream-hop/sw.js` answers a 429 or 5xx from a cached copy (cache and
  `SWV` moved together to 82, as `test/jimothy-check.js` requires), and `IMG()` in its index.html retries a failed image six
  times (2 to 60 s, each at its own URL) so the art arrives once the edge lets the visitor back in. `test/sw-lockout.mjs` now
  covers all three workers and the retry: 25 ok, every plant red. The burst itself (143 requests on a first visit) still trips
  the edge; only the CDN setting, or packing the sprites into sheets, stops that.
- A second, separate bug seen on the same load: `portalPing` on Cloud Functions has no CORS header (`blocked by CORS policy`).
- NOT deployed anything for this: a deploy pushes the whole branch (70 untested commits after CREASE) and could not be probed
  through the 429.

## Gate results that landed after the notes below were written

- NOTCH NUMERALS, PACE, FIND, AUDIO green on first runs (e76df4df).
- TINT fill and scales green (e8824c8e). HUSH SIMON and the ear gate (AUDIO OK) green. NOTCH turn rerun and plants k1, k2 printed no result line (the grep
  missed the output or the gate crashed): rerun `test/turn.mjs` on db60ac9a and read its whole output.
- TINT pour STILL RED after the gate clock fix (`late ["#cdbca3/#a6a19e"]`), and its frozen copy had no icons (404 on
  icon-192.png, icons are drawn into a copy, not committed): the late streak is now likely the page's own; investigate
  `drawPour` and `runPour` before blaming the gate again. Plant w1 does not count while the green run is red.

```
You are Opus, picking up lane C of HANDOFF-OPUS-SEP15.md after a codespace refresh. Read this file
(RESUME-OPUS-SEP16.md) top to bottom first, then HANDOFF-OPUS-SEP15.md section 10 (the report) and the
SESSION STATE of each plans/<game>/HANDOFF-<GAME>.md named below. Do not wait on a human; finish everything.

PRIORITY 0, BEFORE ANY MATH GAME WORK (Stephen, 2026-09-16): "im also having some serious problems with some
games and my jimothy games assets not loading or other games just not opening at all. it was embarrassing when
i tried to have a tester play a bunch of games today." Treat it as a production outage:
  1. Reproduce on the LIVE site, from where a player stands: headless Chrome on the real lucidwinds.com URLs
     (the arcade, the Jimothy games, and every game door on the portal), a fresh profile, AND a profile with an
     old service worker installed. Log every console error, every 4xx/5xx and every request that never settles.
  2. Suspects to check with evidence, not guesses: a service worker serving a stale or hung shell (the black
     screen scar); an unversioned or un-bumped ?v= pin (the host caches); .mjs served as text/plain; a path
     that 404s after a rename; Cloudflare rewriting; the last deploys to main (git log origin/main; the last
     push was 2026-09-15 19:47 UTC, cc444597, which carried CREASE plus HUSH P0 files).
  3. Fix, deploy with the deploy law, probe the served files with a random query, and shoot the pages that were
     broken. Write what was seen and fixed at the top of HANDOFF-OPUS-SEP15.md section 10. If nothing
     reproduces, write exactly what was probed and ask Stephen which games and which device, in one line.

BINDING RULES (unchanged from the earlier sessions):
- Commit and push when green; git add fenced paths only, never -A; package.json needs git add -f.
- Deploy = git push origin add-sproing-jumper:main, only after git log HEAD..origin/main is empty; then probe
  one served file at a time with ?probe=<random>.
- Browser gates run one at a time: flock -w 43200 /tmp/sws-gate.lock timeout <N> node test/<gate>.mjs (the
  timeout INSIDE the flock), on frozen copies made with git archive <commit> into the scratchpad.
- Every gate is watched red on a plant before it counts; a plant that plants nothing is rewritten, not counted.
- Every screenshot is opened with Read and its faults named. Player copy: no dash, no exclamation point;
  "Sky Wolf Studio" singular. Touch 48 px (56 young). Text 0.7rem or more. Engines stay pure.
- A count in a gate is a law proved on 20 seeds; a gate never sets the state it asserts.
- Red after three honest attempts = BLOCKED in SESSION STATE with its last thirty lines; never weaken a gate.
- Never edit scripts/, music-unlocks.js, CLAUDE.md, proto/. Never pkill -f a pattern; kill by PID.
- No portal rows (Fable's). GAUGE is not deployed before BRIM is live.
- Stamps: CORE 20260915e; link builder 20260916f (moved, NOT YET DEPLOYED); CREASE a (live), BRIM b,
  GLIMPSE c, HUSH d, NOTCH e, TINT g, GAUGE h.

THE QUEUE WAS KILLED BY THE REFRESH. Rerun these (each on a frozen copy of the commit named, under the lock):
- Every plant runner is saved in plans/lane-c-plants/ (read its README: the paths inside point at the old
  scratchpad and must be repointed).
- GLIMPSE plants (plans/lane-c-plants/glimpse-browser-plants.cjs): fl1 and fl7 were RED and count
  (on bb10637f); mo1, sp1, sp4, sp5 and pa1 still owed.
- GLIMPSE layout on e7cd7904 (the FRAME fold fix): LAYOUT OK, done. Next a full tools/check.js, the shots
  reopened at 320 and 375 for FRAME, deploy, probe.
- HUSH: STEP, TIMING, SETTLE, FORK green on first runs (not counted until plants go red); SIMON and the ear
  gate (audio) still to run; then plants for every P1 to P3 gate, P3 gates, shots, icons, deploy.
- NOTCH: turn gate rerun on db60ac9a (the Enter let go fix, plans/notch docs/DECISIONS.md) plus plants k1 (no
  Enter let go) and k2 (Enter seats at any angle); REVEAL green; numerals, pace, find, audio (e76df4df), icons,
  config, offline, layout (d7cf3239), specimens and art (3e237753) all still to run; then plants, shots, deploy.
- TINT: COMPARE green; POUR was red because the GATE timed from the tap and read the frame before the page drew
  it (fixed in a4979232); rerun it plus plant w1 (render.js RESOLVE_MS 400 -> 600, must go red). fill and scales
  (e8824c8e), icons, config, offline, layout (c3bedc41) still to run; audio and art gates registered, never
  queued. Then plants, shots, deploy.
- GAUGE: COMPARE and CODE green (c3ced4e3), ZOOM and SAME green (deb4695e). P3 is HALF
  BUILT in the commit after this file: config.js, schemas.js entry, sw.js, manifest, case.js + sprites.js (the
  instrument case), tools/icons.mjs, main.js wiring (parseConfig, named mode doors, worker, case earned at a
  run's end, GAUGE.audio.pitchOf). STILL TO WRITE: test/audio.mjs (the ear gate: muted first load; detent0 to
  detent3 rising, measured by pitchOf; renderLoud master, clip, silence, alarm; a device whose audio throws),
  test/config.mjs, test/offline.mjs, test/layout.mjs, test/pace.mjs (node count equal before and after every
  zoom move, 4x throttle), test/art.mjs, test/specimens.mjs (the case: shut before the run's last round, one
  instrument after, reload earns nothing, twenty four distinct), tools/shots.mjs; register them in
  tools/check.js; draw the icons under the lock and open them; plants; shots; deploy only after BRIM is live.
  Templates: satellites/tint/test/{config,offline,layout,audio,art}.mjs, satellites/brim/test/specimens.mjs.
- BRIM: tools/check.js ALL GATES PASSED on f69d917a (third full check). P2/P3 plants
  (plans/lane-c-plants/brim-p2p3-plants.cjs, recorded in plans/brim/HANDOFF-BRIM.md section 13):
  h1 (main.js streak never reset) RED on HALF and counts; still owed:
  b1 band 1.1 tall (brim), v1 truth etched first (level), a1 no pour sound (audio), c1 builder grade default 3
  (config, edits ../math/config/schemas.js), s1 every bottle 'bottle-1' (specimens, shelf.js), r1 right water
  #2a7478 (art), p1 30 ms busy wait in fillTo (pace), y1 #caption 0.6rem (layout), o1 sw deletes every cache
  (offline). Then deploy BRIM (after the builder stamp commit), probe, then GAUGE may deploy.

WHEN EVERYTHING IS DONE: update HANDOFF-OPUS-SEP15.md section 10 with one entry per game (what is live, what
is red or BLOCKED, the probes), update every SESSION STATE, and update the memory directory for everything
(Stephen asked for this explicitly: a project memory for lane C's nine games and one for the Sep 16 outage and
its cause, pointers in MEMORY.md, compact to stay under the index limit), then push the memory backup repo as
MEMORY.md's first line says. Fable will check the work from those notes.
```

## Where things stood at the refresh (2026-09-16, the builder's own notes)

- Branch `add-sproing-jumper` is 68 commits ahead of `origin/main`; main is not ahead. Nothing after CREASE is deployed.
- Live: CREASE (`20260916a`) and everything before it. Not live: BRIM, GLIMPSE, HUSH, NOTCH, TINT, GAUGE, the builder stamp move.
- The scratchpad (plant runners, frozen copies, gate logs) does not survive a refresh; every result that counted is already in the
  game ledgers (section 13 of each handoff).

## STATE AT SEP 16 ~11:00 UTC (this supersedes every earlier state section in this file)

**LIVE:** CREASE, BRIM, GLIMPSE, **TINT (eeb9c9ce, stamp 20260916g, page and worker both probed)**, plus the CDN 429 fallbacks.
⛔ **The fleet serves at `/satellites/<game>/`** — probing `/tint/` or `/math/tint/` gives 404 and looks like a failed deploy.

**HUSH** — every gate green EXCEPT pace, which is FLAKY: in one pass its green run failed at 0 ms while the run with a plant applied passed at 2643 ms, the same code both times, on a box under load. Ten plants counted (t1, e1, k1, g1, o1, c1, a1, s1, m1, y1). Owed: a pace that answers the same way twice, the specimens plant v1, then deploy.
**NOTCH** — nine plants counted, BLOCKED on the reveal gate. It times out waiting for a reveal because the piece never turns: the angle reads -120 in every single run, which is the dealt angle, so the gate’s key presses have never reached the page. Three fixes tried (wait for the turn to settle, focus the board, learn the key direction) and all three assumed the presses were landing. A probe is measuring what actually holds focus and whether the handler fires when a keydown is dispatched straight at the board.
**GAUGE** — every gate green, five plants counted, and a gutter law added that catches a real fault: at 320 the SAME VALUE cards run flush to both screen edges (#same-pair 0->320). Fix the page, re-run, then deploy (BRIM is live, so the ordering rule is satisfied).

**Shots:** about 110 opened with three faults named in each, all written into `plans/<game>/HANDOFF-<GAME>.md`. Fleet-wide repeats worth one decision each: the first earned thing sits in the top left corner of an empty board (NOTCH, GAUGE, GLIMPSE, BRIM, CREASE); reveals mark the child’s choice and the true answer with ONE mark (only NOTCH’s find reveal and GAUGE’s compare reveal do it properly); four of seven games have wordless doors; NOTCH shows the browser’s blue focus ring on five screens; CORE’s settings gear sits 8 px from the right edge in every game (a fleet call for Stephen).

## STATE AT SEP 16 ~13:00 UTC (supersedes the 11:00 section above)

**LIVE and probed:** CREASE, BRIM, GLIMPSE, **TINT** (eeb9c9ce, stamp 20260916g — page and worker both answered 200).
**GAUGE: PUSHED to main (9cc9d918, parent verified as origin/main) but NOT CONFIRMED SERVING** — the first probe returned 522 text/plain from the edge, which is the host, not a verdict. A re-probe is running with TINT and BRIM beside it, because a bare failure on a new URL cannot tell deploy lag from an edge erroring for everything. Do not call GAUGE live until its page AND worker answer 200 carrying the stamp.

**HUSH** — eleven plants red, every gate green EXCEPT pace, which is FLAKY and is the only thing left: in one pass its green run failed at 0 ms while the run with a plant applied passed at 2643 ms, same code. A rerun on a quiet box is in flight. If it comes back green, the law still needs to survive a busy machine: measure the hold with waitForFunction timestamps around the two phase changes rather than a sampler that can miss one.
**NOTCH** — nine plants red, blocked on the reveal gate through SEVEN theories. What is measured and certain: focus works, keys work, at angle 0 the piece seats itself, the aside handler's only guard is `if (phase === 'turn') finish(true)`, phase IS turn at the failure, and the button is visible and enabled. So the press is not arriving. `tap` presses whatever `elementFromPoint` returns at the control's centre, so the gate's failing line now reports that element; a run is in flight. Owed after: plants r1, n1, and find f1 (which plants nothing — the find law never claims which element carries the outline).

**Shots: the sweep is COMPLETE** — every P3 state of all seven games at 320, 375, 412 and 1366, plus CREASE's P1 states, three faults named for each, all in `plans/<game>/HANDOFF-<GAME>.md`.

## 🚨 PRIORITY 0 AT SEP 16 ~13:30 UTC: THE SITE IS RETURNING 522

🚨 THE WHOLE SITE IS DOWN AT THE HOST, not just a new deploy. Probed twice, seven minutes apart, with a long back off between: https://lucidwinds.com/satellites/tint/index.html, /satellites/gauge/index.html and /satellites/brim/index.html ALL return 522 text/plain, 16 bytes — TINT and BRIM were confirmed serving 200 earlier today. A 522 is the edge failing to reach the origin, so this is Hostinger side and the same family as the 429 lockout at the start of the night (empty bodies, wrong content type, per IP). WHAT THIS MEANS FOR A CHILD: a repeat visitor is covered by the service worker fallbacks deployed earlier tonight (they answer 429 and 5xx from a good cached copy), but a FIRST TIME VISITOR GETS NOTHING. ⛔ THE FIX IS STEPHEN’S, in hPanel (CDN / security settings), exactly as with the 429s; nothing in this repo can serve a page the edge will not fetch. Probing is stopped rather than hammering a failing edge.

GAUGE was pushed to main (9cc9d918, parent verified) and CANNOT be confirmed serving while the edge is down. Do not re-push or re-deploy anything on the strength of a 522 — probe a known live page first, every time.

## CORRECTION AT SEP 16 ~14:00 UTC: THE EDGE HAS CLEARED, GAUGE ALONE IS STILL 522

TINT answers 200 again with its stamp. GAUGE still answers 522. So the earlier site wide reading was true when written and is NOT true now: the live pages are back and the NEW directory is the one missing, which looks like deploy propagation rather than an outage. Probe a known live page first every time, leave a gap between requests, and do not re-push anything on the strength of a 522.

## THE EDGE IS FLAPPING (Sep 16 ~14:30 UTC) — supersedes both earlier readings

Sequence, in order: TINT/BRIM/GAUGE all 522 → TINT 200 with its stamp while GAUGE stayed 522 → BRIM and GAUGE both 522 again. The host edge is INTERMITTENT. Neither "the site is down" nor "GAUGE alone is missing" is supportable from one pass. GAUGE remains PUSHED (9cc9d918, parent verified) with its serving state UNKNOWN. Probe only in a quiet window, known-live page first, and never re-push on the strength of a 522.

## NOTCH IS DEPLOYED (Sep 16 ~15:00 UTC)

Pushed to main as `d0708d9e`, parent verified as exactly origin/main (9cc9d918, the GAUGE deploy), then origin/main merged back into the branch.

- **All fourteen gates green** in one fresh sweep from HEAD: art, audio, config, engine, find, layout, numerals, offline, pace, project, reveal, shapes, specimens, turn.
- **Twelve plants red**: k1, k2, c1, p1, a1, o1, y1, v1, w1, f1, r1, n1.
- ⛔ Two of those gates were hung all night by ONE full-screen overlay (`#shelf`) the gates never closed. It swallowed taps and keypresses alike. Eight theories died before two lines of instrumentation ended it: `elementFromPoint` at the control's centre, `document.activeElement` at press time.

**Serving is NOT confirmed** for NOTCH or GAUGE: the host edge has been flapping (522s interleaved with 200s across the whole site). Probe only in a quiet window, known-live page first, and never re-push on the strength of a 522.

**Left to do:** HUSH (full sweep running; twelve plants red, every gate green individually, pace stable over three runs) then its deploy; the link builder stamp `20260916f` once its games are live; and the fleet-wide decisions gathered from the shot sweep.
