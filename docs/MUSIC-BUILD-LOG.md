# MUSIC BUILD LOG — evidence per phase, append only
Builder: Fable (Stephen handed the build to the reviewer, 2026-09-02, ~00:30 Eastern).
Handoff: HANDOFF-MUSIC.md v2. Rule: a box is filled with pasted output or the phase is not done.

## P0 — Ground truth
base commit: `13b7d1e397982f191ef184f4048b2643b56ec7b1`
server: `ss -ltn | grep :8777` → listening, pid 63109 · `curl` music-tracks.js 200 · satellites/deepwell/ 200 · play/chess.html 200

numbers reconciled:
```
TOTAL CARDED         186        (handoff said 185; 119+67=186. CORRECTED in doc)
  dev gated or soon  25
A VISITOR CAN OPEN   161
satellite dirs:     117
vendored:           12
</head> anchors:    117
arcade-exit refs:   32
puppeteer:          25.4.0
```
lines corrected in HANDOFF-MUSIC.md at P0: 7
1. carded count 185 → 186 (two places).
2. server start line used `pgrep -f "http.server"`, which matches the shell command itself and reported "already running" against a dead port. Replaced with an `ss` port check + curl verify. ⛔ recorded as a rule.
3. LAW 16 said `vendor_satellites.mjs --check` must be CLEAN ×12 before and after. It is EDITED ×12 BEFORE this build: `git log` shows commit `f6de49a4` (SEO pass, 106 pages tagged) edited every vendored index.html after vendoring at `1dfbd1fc`. Pre-existing house drift, not corruption. Gate rewritten as byte-identical: sha256 of the 12 files recorded to `test/music/vendored_baseline.txt`, asserted unchanged by every later phase.
4-7. §3.C, P6 gate, P6 box, P9 box aligned to the sha256 gate.

files read in full, as required: satellites/stream-hop/index.html:5232-5300 · arcade-exit.js header · music-tracks.js:100-152 · play/shell.js:780-905 · sw.js:250-300 · scripts/music_intake.mjs · scripts/catalog.mjs

a note for Stephen from P0: the 12 vendored games carry an SEO edit that the vendor manifest does not know about. Harmless, but the next re-vendor of any of them will silently drop those meta tags. Separate follow-up.

## P1 — Fixture + families
watch-it-fail: `node test/music/catalog.mjs` → `Cannot find module` (red, as required)
```
fixture: 8 folders, 19 tracks (19 written), junk dirs skipped: yes
   2  Abduct a Chameleon 3D      shared dir
   2  Board Games                family: board
   3  Card Games                 family: card
   4  Deepwell                   exact display; "Deep Water" twice = id collision; "The Long Climb" at 195k
   1  Jimothy                    stream-hop, must be SKIPPED
   2  Moonlight Sonatas          UNMAPPED on purpose
   3  Siege                      FUZZY single hit on "Siege of One"; "Warden's March" has an apostrophe
   2  greenhouse-pinball         exact SLUG (display is Blobworks); "Clay Bumper.wav" pcm_s16le 1412k
```
six game folders not five: the handoff's list plus the stream-hop skip case, which needs its own folder.
files: music-families.json (10 families = the catalog cat set) · scripts/music_fixture.mjs · output /tmp/music-fixture/{Music For Games,intake.json}
