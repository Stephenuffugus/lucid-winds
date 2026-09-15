# RESUME PROMPT, 2026-09-16 (paste the block below into a fresh session after the codespace refresh)

## OUTAGE FINDINGS SO FAR (2026-09-15 22:10 UTC, before the refresh; read these before re-probing)

Stephen: "jimothy is just not working on the arcade also half the time the arcade wont load and my app studio wont load."

- **The host is refusing requests with HTTP 429 Too Many Requests**, empty body, headers `platform: hostinger`, `server: cloudflare`,
  `x-hcdn-request-id: ...-bos-edge6` (Hostinger's CDN edge). It returns 429 even for `cf-cache-status: HIT` files, so it is the edge's
  rate limit or DDoS protection, not the origin and not the repo.
- One fresh headless load of `/portal/` from this codespace: the page came up, then its banner, thumbnails, manifest,
  `music-player.js`, `music-tracks.js`, `feedback.js` all got 429. The empty 429 body has no MIME type, so the browser refuses the
  scripts ("Refused to execute script ... MIME type ('')"), which is exactly "assets not loading". Every page after that from the
  same IP (`/portal/apps.html`, `/jimothy/`, `/satellites/stream-hop/`, `/portal/` again) failed with `net::ERR_INVALID_RESPONSE`.
  Still 429 at 22:09 to 22:10 UTC on four probes 20 s apart. From outside (WebFetch) the portal returned 403 (bot protection).
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
