# DONE — DO NOT REDO

**Read this before starting any sweep, audit, count, or "let me just check…".**
Everything here is finished and verified. Re-running it is wasted time.
Last updated 2026-08-17. Companion to `WHAT-TO-TEST.md` (what to test) and
`incoming/FLEET-AUDIT-COVERAGE.md` (what has never been audited).

Every number below has the command that re-derives it. **Run the command, do not
re-invent the measurement.** Re-inventing the measurement is exactly how the
catalog got counted five different ways in one day.

---

## 1. THE CATALOG — settled, do not count it again

```
186 carded   =  119 satellite cards + 67 native /play/ games
162 openable =  186 minus 22 dev gated minus 2 marked "soon"
```

`node scripts/catalog.mjs`

⛔ **`scripts/catalog.mjs` is the ONLY thing that counts.** `advertised_count_check`,
`quest_triage` and `tag_catalog` import it. **Never write another catalog regex.**
Four scripts each had their own and each was wrong differently (64/66/67 native,
183/187 total) because `GAMES` rows carry **4, 5 or 7 fields** and every regex
hardcoded 4. A regex that misses rows does not error; it returns a smaller number
that looks correct.

Player-facing copy advertises **what a visitor can open (162)**, never the carded
total. Guarded by `node scripts/advertised_count_check.mjs`, which fails on a claim
that is stale *or* inflated. Live copy says 160+ in 7 places and is correct.

---

## 2. FIXED AND LIVE — do not re-investigate

### Twenty games crashed on boot from a corrupt save
```
bramble-court · bridgevine · create-a-critter · fence-off · frost-watch · lamplighter
loop-warden · mini-crossword · mosaic-draft · nova-bloom · orb-orchard · pollinator-paths
root-weave · silt · sled-vine · spore-drift · tempo-grove · tinker-loft · tonic-drop · vinewinder
```
`try/catch` around `JSON.parse` is not validation: `null` and `5` are valid JSON,
parse fine, then the next line throws. Loader runs at module scope, so the whole
script block dies. Verified fixed **on production**.
Re-check: `LW_URL=https://lucidwinds.com node scripts/corrupt_save_probe.mjs <slug>`

⛔ **FOUR FALSE ALARMS — screenshotted, healthy, do not chase again:**
`stream-hop` (boots to 0 buttons / 28 chars *normally*), `flipbook`, `petalvex`,
`vine-runner` (a corrupt save also wipes the "how-to-play seen" flag, so they
correctly re-show instructions).

### Petal Plunge — `.hidden` never hid anything
Rule was only `.scr.hidden`, which needs both classes; `#hud`/`#hint` carry
`hidden` alone. HUD sat over every menu since the game shipped. One bare CSS rule.

### Blobworks — rails painted across the whole table
Idle ramp now draws only its mouth; a rail lights end to end only when a bead is
riding it. Also removed a rim-light tracing *physics* walls over *painted* ones.
audit 14/14.

### Hexa Hive — two dashes in How To Play
Player copy is dash-free across all satellites.

### The arcade was advertising 140+ games in five places
Tab title, meta description, both social cards, PWA manifest. All say 160+ now.

---

## 3. SWEPT CLEAN FLEET-WIDE — do not re-sweep

`node scripts/defect_sweep.mjs` (self-testing)

```
0/100  exit-gated-on-frame     no game gates its exit on being framed
0/100  img-without-onerror
0/100  fetch-without-ok-check  nothing treats a 404 as success
0/100  dashes-in-copy
0/100  EARN-PROMISE-BROKEN     every game promising Sunbeams can pay them
```

⛔ Two classes are **house style, not defects**: `empty-catch` 99/100 and
`parse-without-validation` 46/100. They are printed as rates and labelled. The
sweep exits on what is *actionable*, never the raw total.

### Quest / VR compatibility — done, M1 complete
`node scripts/quest_triage.mjs` → `QUEST-COMPAT.md`
**186 triaged: 162 clean, 7 caution, 0 blocked, 17 external repos.**
Nothing in the catalog is blocked from running in a Quest browser.

### Catalog tagging — done, results known
`node scripts/tag_catalog.mjs --report`
`reading` and `brain` are usable; `length`, `hands`, `company`, `restart` need a
human. **Do not re-run hoping for a better answer — the machine cannot read how
long a game takes.**

---

## 4. STANDING TRAPS — the tooling lies in these specific ways

Seven checker false-positives in one day. Every one caught by opening the hit
instead of acting on it. **A hit is a candidate, never a verdict.**

| Trap | What happened |
|---|---|
| **Regexing a parseable structure** | 4 scripts, 4 different catalog counts. Parse it. |
| **Comments and strings** | `Math.random` in a comment saying it is banned; the word "window" inside a clue about a house. Strip comments and string bodies first. |
| **Pinch SUPPRESSION read as a requirement** | 19 games "blocked"; 15 matched `gesturestart`+`preventDefault`, which *prevents* pinch. Acting would have made them worse. |
| **Screenshots without touch emulation** | A `(pointer:coarse)` branch made me report a keyboard hint that does not exist. Always set `isMobile`+`hasTouch`+mobile UA. |
| **A probe reading state that is not there yet** | Corrupt-save probe read save keys off a *clean boot*, where only the SDK's anon id exists. Passed vacuously 3×. |
| **Measuring the wrong symptom** | Same probe called a crash "survives" because buttons rendered *before* the throw. **An uncaught error is the finding.** |
| **Flagging absolutely, not vs baseline** | `buttons===0` fired on stream-hop, which boots to 0 buttons normally. |
| **`node x.js \| tail`** | Returns *tail's* exit code. Twice made a red suite look clean. |
| **Three green signals on a dead page** | Wild Wardens returned 200, threw nothing and rendered an exit button, on a screen reading "Unmatched Route, page could not be found". A boot probe must read the RENDERED TEXT. |
| **A checker's fixture colliding with real data** | The service worker scope check seeded fake neighbours named `padlab-v10` and `hush-v3`, which are those apps' REAL cache names, so three workers correctly cleaning their own stale caches read as wiping neighbours. Three false positives out of three hits. |
| **A directory skipped for the right reason, once** | The exit audit skipped any dir called `assets`, correct while every satellite was hand-written HTML. Tally is Vite-built and its whole bundle is `assets/index-<hash>.js`, so the audit read its `index.html`, saw the exit defined, never saw the bundle that CALLS it, and said STRANDED. |
| **`index.html` is not the whole game** | The defect sweep only read each satellite's `index.html`. Chameleon 3D is carded separately at `abduct-3d.html` and had never been swept at all. Fixing it by sweeping every sibling `.html` was wrong the other way and dragged in six dev labs. **Ask the catalog which pages are carded.** |
| **Half a base path** | Rewriting Expo's `/BarBrawl/` fixed every asset and still left every route unmatched, because the bundle also carries `baseUrl":"/BarBrawl"` with no trailing slash and THAT is what the router reads. |
| **Catastrophic regex backtracking** | `.{0,55}`-style context patterns in grep hang for minutes. Use fixed patterns. |
| **CPU contention** | `fleet_verify` reports "1 red" when browsers run alongside it. **Run it alone.** Clean serialized runs: 32 green, 0 red, 2209 assertions. |

⭐ **When the same question gives different answers on different runs, stop
answering it and fix the instrument.**

---

## 5. KNOWN AND DELIBERATELY NOT FIXED

- ~~**13 games live on another origin**~~ ✅ **DONE 2026-08-18. All 13 vendored.**
  See `VENDORING.md`. `node scripts/vendor_satellites.mjs --check` must read CLEAN.
  ⛔ Never hand-edit `satellites/<slug>/` for a vendored game; fix upstream and
  re-vendor. HUNCH's three serverless functions stay on Vercel and it calls them
  across origins, which is fine for a TWA because only the XHR leaves the origin.
  ⚠ HUNCH's leaderboard returns a 500 on production and did before this work.
- **Petalvex's "How to play" heading** is dark green on light beige and hard to read.
  Colour call on Stephen's art. ⚖ his.
- **~40 satellites have had a machine sweep but no real audit.** A sweep cannot tell
  whether a game is good. Tracker: `incoming/FLEET-AUDIT-COVERAGE.md`.
- **11 Director decisions** in `WHAT-TO-TEST.md` Part 3. ⚖ his.
- Whack Box cloud transport, iOS wake-lock stage 2, LOAF's synthesized voice: need
  real devices.

---

## 6. VR — where it actually stands

Plan: `incoming/VR-PLAN.md`. Candidates: `incoming/VR-CANDIDATES.md`.

- ⭐ **Meta accepts plain 2D PWAs on the Horizon Store.** The whole arcade can be a
  store app with **zero VR work**. The manifest already qualifies.
- **Two titles, not five.** "VR friendly" is the trap: a flat panel in a headset
  costs nearly what native VR costs and scores worse than an honest 2D window.
- ⭐ **Create A Critter is the pick.** Its camera already orbits a fixed origin, so it
  is comfort-safe with no redesign, and it already has skinned bones, walk/dance/
  idle/blink/wag/hop, feed and cuddle, and a drawing that inflates into a body.
- ⛔ **Stephen chose 3D air-drawing over the flat slate.** Build toward drawing in
  the air. He is picking title #2 himself by playing; **do not pre-pick it.**
- ⛔ The original handoff's candidates are dead: **MARBLEBEAT is now a PadLab tab**,
  **Cairn does not exist**. Super Slice is four games and the *fall/climb* variants
  are comfort hazards; only the base forest game is a fit.
- **Blocked on Stephen:** free Meta developer account at developers.meta.com/horizon.

---

## 7. HOW TO VERIFY ALL OF IT, FAST

```bash
node scripts/catalog.mjs                    # 186 carded / 162 openable
node scripts/advertised_count_check.mjs     # every advertised number is true
node scripts/defect_sweep.mjs               # 0 actionable
node scripts/quest_triage.mjs --report      # 186 triaged, 0 blocked
node scripts/fleet_verify.mjs               # 32 green, 0 red — RUN THIS ALONE
                                           #   ⛔ ALSO needs a server on :8777 served
                                           #   from the REPO ROOT, or 2 suites die on
                                           #   ERR_CONNECTION_REFUSED and read as red
node scripts/sw_cache_scope_check.mjs --fleet  # no worker wipes a neighbour's cache
node scripts/vendor_satellites.mjs --check     # vendored: CLEAN, not BEHIND or EDITED
node scripts/vendored_boot_probe.mjs           # they boot, and not to a dead screen
```
Every script above takes `--selftest` and proves its own detectors can fire *and*
stay quiet. **Run the selftest before believing a report.**
