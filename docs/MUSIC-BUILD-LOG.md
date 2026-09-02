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

## P2 — Generator → catalog
gate red first: `node test/music/catalog.mjs` → `FAIL generator importable <- Cannot find module scripts/music_manifest.mjs` (1 ok, 1 failed)
first green run: 31 ok, 2 failed. Both reds were the TEST's fault (LAW 3, owner = the fixture): "Siege" is the literal
directory slug so it is an exact match, not fuzzy (swapped to "Flock" → Flock the World, and added "Chameleon" to prove
fuzzy hits on two cards sharing one dir count as one); and I wanted `wardens-march` not `warden-s-march`, so slugify now
strips quote characters first.
final: `catalog gate: 35 ok, 0 failed`
fixture catalog: `shelves: 7  tracks: 19  unmapped: 1  version: (content hash)  live: true` at /tmp/music-fixture/music-catalog.js (never in the repo)
```
MAP       Abduct a Chameleon 3D  -> abduct-a-chameleon  (exact)      FAMILY  Board Games -> table-games (17 games)
MAP       Chameleon  -> abduct-a-chameleon  (FUZZY)                  FAMILY  Card Games  -> card-room   (17 games)
MAP       Deepwell  -> deepwell  (exact)                             MAP     Tarot Run   -> tarot-run   (exact)
MAP       Flock  -> flock-the-world  (FUZZY)                         MAP     greenhouse-pinball -> greenhouse-pinball (slug)
SKIP      Jimothy  -> stream-hop: Jimothy keeps its own bridge       UNMAPPED  Moonlight Sonatas  (2 tracks)
```
real data present? no (`_music-drop/` holds only the README). The real run happens the moment docs/music-intake.json exists.

## P3 — The module, and the mutants that prove its gate
watch-it-fail: `node test/music/unlocks.mjs` → `FAIL module file exists: music-unlocks.js` (1 ok, 1 failed)
first green attempt: 47 ok, 3 failed. All three were the TEST's (LAW 3): I assumed "The Long Climb" was Deepwell's 4th track,
but file-name order puts "Echo Chamber" there; the rung-4 test had passed for the WRONG reason and is now asserted by the
right id. The ES5 scanner tripped on my own header comment ("No const, no let"); it now strips comments and strings first
(the catalog.mjs lesson).
`unlocks gate: 52 ok, 0 failed`
mutants, first run: 10 killed, 2 SURVIVED. Both survivors were decoration in the gate, not bugs in the module:
- "throw when localStorage is missing": every public entry point is wrapped by law, so removing the inner guard is an
  EQUIVALENT mutant. Replaced with a documented DOUBLE mutation (inner guard + public rebuild() guard) and the test now
  calls rebuild/unlock/boot explicitly on dead storage.
- "keep ticking while hidden": the test fired visibilitychange, which clears the interval, so tick()'s own hidden guard
  never ran. Added the scenario it exists for: hidden set with NO event delivered.
`mutants: 12 killed, 0 survived, 0 invalid, of 12`
`node --check music-unlocks.js` → ok. Source never references Audio, AudioContext, <audio, .play(, requestAnimationFrame.

## P4 — Web tier + verify
watch-it-fail: `node scripts/music_verify.mjs …` → `Cannot find module` (red)
```
web tier at /tmp/music-web/music/v1: 20 files, 0.2 MB   (transcoded 2, copied 18, skipped 0)     the 195k mp3 → 130k; the wav → mp3
second run:                            20 files            (transcoded 0, copied 0, skipped 20)     idempotent
verify http://127.0.0.1:8778: 20/20 ok                                                              green, with --local length check
rm deepwell/deep-water-2.mp3 → MISS deepwell/deep-water-2.mp3 status 404 → 19/20 ok, 1 MISSING     red, exit 1
web tier again → copied 1, skipped 19 → verify 20/20 ok                                             restored
track pointed at a directory URL → MISS abduct-a-chameleon/ content-type "text/html; charset=utf-8" red, exit 1
```
a test I threw away: writing text into a file named .mp3 did NOT trip verify, because the server assigns content-type by
extension and --local compared against the same fake. Not a hole in verify; a bad test. The directory-URL case is the real one.
scripts/music_manifest.mjs gained two exports (resolve, shelfSlugFor) so the web tier maps a track to its source folder the
same way the generator did; catalog gate still 35/35.

## P5 — The two shared edits (which turned out to be four files plus 66 stamps)
watch-it-fail: sw gate `5 ok, 4 failed` (no s-w-r rule, no guard) · inject gate `24 ok, 18 failed` (window.SWSMusic absent on all 6 natives)
what P0 did not know, found here:
- `/play/` pages register THEIR OWN worker, `/play/sw.js?v=3` (`play/shell.js:857`), and the more specific scope wins, so the
  root worker's guard never protects a native. `/play/sw.js` is network-first and `c.put()`s every 200 it fetches: the unedited
  worker DID cache `/music/v1/….mp3` in the harness. It now carries the same guard; `CACHE` bumped v3→v4 per its own header;
  registration bumped `?v=3`→`?v=4`.
- `play/shell.js` is loaded as `shell.js?v=26` by 65 pages and `?v=30` by one (pre-existing drift). Bumped all 66 to `?v=31`.
- LAW 10 as first written forbade any modification of a pre-existing line, which forbids stamp bumps, which forbids shipping
  the edit. Made precise: stamp-only modifications are allowed and `no_shrink` verifies the diff is stamp-only.
- sw.js: the `||` clause I planned would modify a line; a NEW s-w-r block (the file's own idiom, word-banks.js already copies
  the music-tracks block verbatim) is a pure insert. +25 lines. Guard line above the static rule. `node --check` ok.
- play/shell.js: +14 lines (initMusicUnlocks + its call after initInstall, outside initMusic's embedded early-return).
gates:
```
sw gate: 15 ok, 0 failed        (root + play workers; the "add mp3 to the static regex" mutation still cannot cache /music/)
no_shrink gate: 95 ok, 0 failed (66 html + shell.js + play/sw.js diffs all stamp-only; 12 vendored sha256 unchanged)
inject gate: 42 ok, 0 failed    (chess c4 battleship klondike spider freecell × 2 boots; zero NEW console errors)
```
a red that named the harness (LAW 3): after the shell edit, chess passed and five natives failed with a 404 and an empty
ledger. Trace: NO request for /music-catalog.js ever reached the page. /play/sw.js calls clients.claim() on activate and takes
over the page mid-load; fetches made by the worker are invisible to puppeteer's request interception, so the fixture catalog
was never served and the real server 404ed. Chess only won the race. Fix in the TEST: setBypassServiceWorker(true). The worker
itself is gated in sw.mjs. In production the file exists and the worker fetching it is correct.
