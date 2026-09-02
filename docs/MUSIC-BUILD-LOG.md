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

## P6 — The 105 satellite includes
watch-it-fail: `music_include.mjs --check` → `0 included, 12 vendored untouched, 105 wrong, of 117` (exit 1)
dry run: `105 to insert, 0 already, 12 vendored (skipped), 0 skipped for </head> count`
seven batches of 15, each: apply (asserted: one </head>, include absent, +1 line exactly) → inject on 4 of the 15 from clean
profiles with the SW bypassed (zero NEW console errors, body gained only the toast, family/game shelf track 1 in the ledger
where the fixture has one, ledger empty + no toast where it does not) → no_shrink (every inline <script> of every touched
page parses; 12 vendored sha256 unchanged) → one commit.
```
batch 1  aura-off,blackout,bramblewick,burr-blast                inject 20/20  no_shrink 110/110  b6912c14
batch 2  burrow-bowl,create-a-critter,dragon-philosophy,flock-the-world   24/24        125/125  1edaa25c
batch 3  fox-basket,garden-td,hues,loop-warden                     22/22        140/140  92dfe236
batch 4  mahjong,mini-crossword,nectar-drop,petal-alchemy          22/22        155/155  a2eb712b
batch 5  petal-plunge,pitbike-rally,power-scalers,root-groups      20/20        170/170  f6714439
batch 6  root-weave,seed-flutter,silt,snakes-ladders               22/22        185/185  d737bf9d
batch 7  spore-drift,stop-motion,tinker-loft,wireworm              20/20        200/200  9325c009
final:   check: 105 included, 12 vendored untouched, 0 wrong, of 117 · vendored sha256: 12/12 unchanged
```
28 satellites booted twice each across the batches; not one produced a console error the baseline did not.

## P7 — UI, and LOOKING
gate first run: `35 ok, 1 failed` — my game list had tarot-run, which is VENDORED and has no include by design. Swapped for
greenhouse-pinball. Then `42 ok, 0 failed`. Then I opened the images.
three things wrong, before Stephen says them:
1. The pill lands on every game's title: across "THE SURFACE" and part of the ≡ on Deepwell, over the "HOW TO PLAY"
   eyebrow on Chess and Sudoku, over "SKY WOLF STUDIO PRESENTS" on Flock. Inert, three seconds, but crude.
2. It fired at t=0, on a screen the player had not read yet. The reward fought the first impression instead of landing on it.
3. Low separation on the near-black greens; legible only because of the gold border.
what changed: the song is still GRANTED on open (ledger written, shelf in the player immediately) but the toast now waits
for the player's first tap or key (pointerdown/touchstart/keydown, capture, passive, removed after one use). Opacity
0.92→0.96, border 0.6→0.7, a drop shadow. Gates updated to fire a synthetic pointerdown before measuring, plus assertions
that there is NO toast before it, that a key also opens the gate, and that the listeners are gone after one use.
```
unlocks gate: 55 ok, 0 failed      mutants: 12 killed, 0 survived, 0 invalid, of 12
ui gate: 47 ok, 0 failed           inject (deepwell, blackout, chess, klondike): 29 ok, 0 failed
no_shrink gate: 201 ok, 0 failed
```
residual, honestly: the screenshots still show the pill over the title, because the test taps on the title screen. On games
whose title is also the hub (Deepwell) it will sit across the title for three seconds in real play too. Named follow-up if
Stephen dislikes it on a phone: arcade-exit.js already searches for an empty corner with elementFromPoint; the toast could
borrow that. Not done in Tier 0 on purpose: it is more DOM inspection inside 172 pages we do not control.
shots: /tmp/music-shots/{deepwell,greenhouse-pinball,flock-the-world,chess,klondike,sudoku}.png (sudoku = no shelf, no toast)

## P8 — Docs and the standard
- `docs/MUSIC-SYSTEM.md`: the one page. Pieces, the five-step path from a zip to a player, the ladder, the Tier 1 hook,
  the five things that must not drift (propagation stamps, the two SW guards, the 12 vendored, the in-app follow-up, the
  never-shrunk ledger, no dashes).
- `NEW_SATELLITE_BRIEF.md`: a "Soundtrack unlocks (mandatory, one line)" section appended, with the exact include line
  and `music_include.mjs --check` as the acceptance.
- `_music-drop/README.md`: the two folder rules appended (01/02 prefixes pick the free song and the order; family folder
  names make shared shelves; unmapped folders are reported, never guessed).
`no_shrink gate: 201 ok, 0 failed` (both pre-existing docs grew only)

## P9 — Hand back
Stephen's zip landed at 04:55 UTC during P5, so the real-data path ran too.
```
run.mjs: all 10 steps green in 96s
  catalog 41 · unlocks 55 · mutants 12/12 killed · sw 15 · no_shrink 203 · include --check 105/105, 12 vendored untouched · inject 48 · ui 47
vendored sha256 vs P0 baseline: 12/12 unchanged
fenced files (index.html, sunbeam-sdk.js, music-player.js, music-tracks.js, assets/music): git diff empty
```
### The real data
intake: `Tracks-20260902T045511Z-1-001.zip`, 357 MB, moved to /tmp before unzipping (/workspaces free space went UP, 2.5→2.8 GB)
→ 53 folders, 149 tracks, 255 min, avg 1.7 min, every file 176–240k mp3. Suno shipped two takes of most songs ("(1)", "(2)");
every take is its own unlock, titled exactly as the file.
generator → `music-catalog.js` **live:false**, 42 shelves, 123 tracks, version 271a86160620. Six family shelves carry
STEPHEN'S OWN names from his folders (Card Table, Board Classics, Dice Porch, Word Garden, Logic Den, Maker Bench); the
handoff had given him naming rights and the folders were the answer. `music-folder-aliases.json` added for explicit,
human-confirmed overrides (checked first, gated 4 ways), empty until he confirms the first.
web tier → /tmp/music-web/music/v1: 123 files, 191.1 MB, all transcoded to 128k, 5m22s; a stale fixture run had left 25 dummy
files beside them, so the web tier now PRUNES to the catalog every run (43 entries = 42 shelves + SHA256SUMS). `music_verify`
against a local server: 123/123 ok. Real catalog smoke, live flipped in memory only: pong, burr-blast, dewball, klondike, chess
→ 40/40.
### 11 folders held, never guessed (docs/music-unmapped.md), with my read of each
| Folder | Tracks | Read |
|---|---|---|
| Conduit | 2 | satellite exists but is UNCARDED, so not in the catalog; maps itself the day it gets a card |
| Cosmi-cadets | 2 | one letter off Cosmic Cadets (seed-flutter); an alias on his yes |
| Quick-fire | 4 | Neon Rush, Pixel Dash: a reflex family; action (45 games)? his call |
| Family-Boards | 2 | Boardgame Afternoon: more Board Classics, or a second board shelf? |
| Solitair-parlor | 6 | Cozy Game Loop ×4, Rainy Card Room ×2: merge into Card Table (10) or a Solitaire Parlor sub-shelf (needs an explicit games list; small extension) |
| Zen-Studio | 2 | Japanese Garden Stillness: the Music Studio game, or Maker Bench? |
| Tracks | 2 | Weightless Drift, loose at the zip root: where? |
| Lucid Winds | 2 | Midnight Greenhouse: the app's own theme, belongs in music-tracks.js Originals / the index.html follow-up |
| Whackbox | 2 | Carnival Loop: the party game lives outside satellites/, no card dir; follow-up like Lucid Winds |
| Menu and shop song | 1 | Dust and Gasoline: Jimothy? Jimothy keeps its own bridge |
| Use this song for rainbow poo boost | 1 | Full Sprint Happiness: Jimothy's boost; same |
### What happens next (not this build)
H2, in order: Stephen puts a 1 KB `music/v1/PROBE.txt` in the host's web root → Fable pushes any commit to main → `curl -sI
https://lucidwinds.com/music/v1/PROBE.txt` is 200 → Stephen uploads /tmp/music-web/music as one zip and extracts →
`music_verify.mjs --base https://lucidwinds.com --local /tmp/music-web` green → `music_manifest.mjs --live` → commit →
deploy. Until then every game carries the include and the module idles on live:false.
deployed: **NO** · pushed to main: **NO** · branch: add-sproing-jumper

## P9b — The Director's answers, applied (2026-09-02, after the hand-back)
Stephen: yes Cosmic Cadets (a typo) · yes Quick-fire is the action games · all card games share songs, "the more card games
you try, the more you unlock", easy to unlock most to start · Weightless Drift is Spore Drift · "we have to find the unlock
balance" · he did not add Jimothy songs.
what changed, each gated:
- **The ladder is now multi-path and tunable.** Track i opens when ANY holds: secs ≥ secsPer·i (120) · days ≥ 1+daysPer·i ·
  sessions ≥ sessionsBase+i (2) · on a FAMILY shelf, distinct family games opened ≥ 1+breadthPer·i. Numbers live in
  `music-ladder.json`, emitted as `catalog.ladder`, sanitized on every path (a caller's `daysPer:-3` is ignored, gated).
  Breadth is read from progress that already existed (every opened game has a `first`). Family shelves only; a game shelf
  ignores other games (gated). Two new mutants: drop breadth; ignore catalog.ladder. 14/14 die.
- **Content-hash dedupe.** The loose "Weightless Drift" pair at the drop root was byte-identical to Spore-drift's own (Drive
  duplicates loose files), and `galqntgourde1.mp3` == `galantgourde.mp3`. The generator now hashes files when they are on
  disk and skips a duplicate within a shelf (logged DUP); a held loose file that duplicates a shelved one is reported as
  such in docs/music-unmapped.md. The `Tracks → spore-drift` alias I had written was a misreading and came out.
- **Nesting from the real path.** The "instruction" folders were SUBFOLDERS inside game folders
  (`Pit bike rally/Menu and shop song/Dust and Gasoline`, `Puppy-dash/Use this song for rainbow poo boost/Full Sprint
  Happiness`); the intake had taken the innermost folder as the game. The generator now derives the game from the on-disk
  path (first folder under the export's wrapper) and keeps the subfolder as a `note` on the track. Both songs are on their
  games. The intake script itself keeps the bug (pre-existing file, LAW 10); follow-up.
- Aliases confirmed in his words: Cosmi-cadets → seed-flutter, Quick-fire → action, Solitair-parlor → card (Card Table is
  10 tracks). `music-folder-aliases.json` quotes him per entry.
- Fixture: every file now a distinct tone (all-silent fixtures were byte-identical and the dedupe rightly collapsed them),
  plus a nested subfolder, an in-shelf copy, and a loose root copy. Gate reds on the way, all the test's: `dw2()` used
  before its `const`; loose files now file under `(loose)`, not the wrapper; the nested file sorted into the middle of a
  shelf and shifted every index (renamed to sort last); seeding `days` with an old date made every sessions test a
  second-day test too (seeded with today); one mutant's anchor was the removed fixed-ladder line (re-aimed).
real data now: **44 shelves, 136 tracks, 6 held** ((loose)×2 = byte-dups of Spore Drift; Conduit uncarded; Family-Boards;
Lucid Winds; Whackbox; Zen-Studio). Web tier 136 files 206 MB, verify 136/136 locally. Real catalog byte-stable across the
sanitize change. Upload zip: /tmp/music-upload/music-v1-20260902.zip (205 MB, PROBE.txt inside).
vault: `vault-music-20260902` holds the 357 MB master zip + SHA256SUMS, round trip verified (`Tracks-…-001.zip: OK`).
```
run.mjs: all 10 steps green in 101s
  catalog 49 · unlocks 64 · mutants 14/14 · sw 15 · no_shrink 203 · include 105/105 · inject 48 · ui 47
```

## P9c — Last mappings, the Originals route, Conduit carded (2026-09-02)
Stephen: "they can be shared" (Family-Boards → Board Classics, Zen-Studio → Maker Bench until he makes more), "lucid winds
theme goes in the apps originals yes", "conduit should be behind the wolfden test password so i can test it".
- `originals` is a new alias target: an app shelf (kind app, EMPTY games[]) that ships under /music/v1/originals/ and is
  listed in music-tracks.js Originals at go-live, never unlocked (gated: the module never grants an app shelf even after
  rebuild). Web tier's folder lookup learned the new kind after crashing on it once.
- Conduit: FEATURED card next to Tangent, `beta:true` (the In Development tab behind the tester passcode), embed protocol
  block copied verbatim from Tangent (+27 lines, 2 inline scripts parse), thumb via the house tool. catalog.mjs: 187 carded,
  26 gated, **161 openable unchanged**; `advertised_count_check.mjs`: all 7 counts still true.
- Real catalog: **46 shelves, 144 tracks, 2 held** ((loose) = byte-dups of Spore Drift; Whackbox, outside satellites/).
  Web tier 144 files 225 MB, verify 144/144. Vault zip refreshed (224 MB, 144 mp3s, PROBE.txt inside).
- Thumb, LOOKED AT: the title screen is a rules sheet (the tool's own warning), the level list behind it is more text.
  See below for what shipped and why.
- `docs/MUSIC-GO-LIVE.md`: the exact steps, who does each.
gates: `run.mjs: all 10 steps green in 96s` (catalog 51 · unlocks 65 · mutants 14/14 · sw 15 · no_shrink 203 · include 105/105 · inject 48 · ui 47)
thumb shipped: a shot from inside play (two clicks in: "Enter the site", then a level's "Enter"): the blob with its
iridescent rim, a lit socket, the room. Three things wrong with it, said before Stephen does: the subject is small at card
size; it is dark on a dark portal; no wordmark. Still the right choice over a wall of rules text. Beta card, Test Lab only.

## P10 — LIVE (2026-09-02, main 8f6dc931)
route: Stephen added the private repo `Stephenuffugus/lucid-winds-music` as a second Hostinger git deployment (dir `music`).
"git repository exists" on his second tap meant the first had already created and deployed it. His Hostinger server key is
an ACCOUNT-level GitHub SSH key (scanned all 42 repos: a deploy key nowhere), so nothing needed attaching.
```
music_verify.mjs --base https://lucidwinds.com --local /tmp/music-web  →  144/144 ok
push branch → main: REJECTED non-fast-forward (main had the Sep 1 session's squash b5abc47c). Merged; one conflict,
  portal/index.html (my Conduit line beside the Tangent line); resolved; portal parses, 187/26/161, counts true.
main 99b559b5: deploy landed in ~10s; PROBE.txt and tracks still 200 AFTER the site deploy → the music checkout survives.
main 8f6dc931: live:true + Originals ×2 + stamps (music-tracks ?v=2026.09.02.01 in portal and shell; shell.js?v=32 ×66).
live after ~10s; portal and chess pages load the new stamps; manifest carries midnight-greenhouse ×2; file 200 audio/mpeg.
THE LOOK, real site, clean profile, no hooks: deepwell → Action Room: Neon Rush (1) · pong → Action Room track 2 by
  BREADTH (2nd action game) + Pong Arena: Neon Rally (1) · chess → Board Classics: Boardgame Afternoon (1). Zero console
  errors on all three. No toast before the tap, toast after. Portal player: Action Room > Pong Arena > Board Classics >
  Originals (11) > …
```
two process misses, recorded so they stop: I pushed to main without `git log HEAD..origin/main` first; and twice a chained
command ran past a failure (a wait loop after a rejected push; a resolver whose assertion failed and then `git add && commit`
committed conflict markers, caught before any push and amended). Gate each step on the previous exit code.
three things wrong with the live look: the toast still crosses a wordmark on title-as-hub games (known, named fix); two
toasts queue on a game that earns from two shelves at once (fine, but the player sees two pills back to back); a family
track reads "unlocked in Action Room" when it was unlocked in Pong (the fold's wording uses the shelf name; cosmetic).
index.html loads the manifest by LW_VERSION (fenced): the app shows the two new Originals after its next version bump.

## P11 — The moment (2026-09-02, after Stephen played Rabbit Ronin)
Stephen: "i unlocked a song but there didnt seem to be any way to even play the damn thing" · "i like a uniform music button
across everything" · "congratulations you unlocked … would you like to listen to it now?" · "if it came with an image it may
have art already, if not no worry at all we wont fabricate anything".
built, module only (the 105 includes already load it; no game edited):
- THE CARD at boot: Congratulations, title, shelf · Stephen, art only if the catalog track has `art` else a ♫ tile, Listen
  now / Later (48px). Listen now loads music-tracks.js then music-player.js on demand, inits the shared player with the chip
  (or the native shell's button) and plays that track by its LW_TRACKS index. Both buttons mark it revealed
  (`sws_music_revealed`; a cloud restore never re-congratulates) and clear `sws_music_pending_reveal`.
- MID ROUND: toast + pending; the card comes at the next boot of ANY game.
- THE CHIP: "♫ Music", 48px, in every game with a live catalog (the native shells keep their header button). Placed ~900ms
  after load, by a GRID search along the top and bottom edges then the side mid-edges, scoring a 3x3 footprint, worst point
  wins; controls (button, a, role, onclick, cursor:pointer) score 3, text scores only where it is RENDERED (text-node rects),
  paint 1, empty 0; never the bottom right (the feedback fab's); the search looks through our own card.
gates (watched red first): unlocks 65→95 (fake manifest + player in the harness, clickable elements) · mutants 14→19, one
  survivor exposed the cloud-restore case and got its assertion · inject 54 (card at boot, chip present, Later closes,
  zero new console errors on 6 games) · ui 82 (card inside the viewport, buttons ≥48 measured, chip ≥48x96, chip overlaps
  no control, backdrops excluded) · run.mjs all 10 green in 113s.
the look, three rounds: (1) chip on Deepwell's ✕: the corner search saw it but every corner was busy and the centre-point
  test missed the ☰ at the chip's far end → footprint scoring, controls by cursor/onclick, text-at-point; (2) chip clipping
  the top of "SURFACE" → 3x3 footprint; (3) chip in the empty end of the LAMP row, clear of everything. Blobworks: clean.
  The card was faintly translucent (PLAY bled through behind Later) → opaque.
three things wrong, still: on a fully busy hub the chip reads as part of whichever row it lands in; two cards would be
  needed if two shelves grant at once (it shows the newest and says "and 1 more"); the toast on a mid round grant still
  crosses a wordmark on title-as-hub games.
live (main 420c9a33, ~5s to land): Rabbit Ronin from a clean profile → card at boot ("…and 1 more", Cherry Blossom Clash (1),
Rabbit Ronin · Stephen) · Listen now → shared player loaded, audio PLAYING (/music/v1/rabbit-samurai/cherry-blossom-clash-1.mp3,
t=2.2s), card gone · chip tap → the SOUNDTRACK drawer open with ▶ PLAYING, shelves Action Room / Rabbit Ronin / Originals ·
zero console errors. Pong identical. The gap Stephen hit is closed.
three things wrong: the "(1)" take suffix wraps a headline onto two lines; the chip is a large pill on a clean title screen;
the drawer's glyphs are tofu in the headless font (test browser only).
