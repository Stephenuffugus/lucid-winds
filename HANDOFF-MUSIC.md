# HANDOFF-MUSIC — the soundtrack unlock system
### For Claude Opus 5. Written 2026-09-02. Fable reviews, then deploys.

---

## ⛔ READ THIS BOX BEFORE ANYTHING ELSE

1. **You are on a branch. You never push to `main`.** Deploy is
   `git push origin add-sproing-jumper:main` and only Stephen or a reviewing
   Fable session runs it. If you type `:main` you have failed the handoff.
2. **Every phase below has a gate. Before you build a phase, you RUN its gate and
   WATCH IT FAIL.** A gate you have not seen red is decoration. This project has
   burned whole days on green gates that tested nothing — twelve of them passed on
   a build whose floor was see-through, and `test/mutants.js` later proved that
   twenty gates in Conduit asserted nothing at all.
3. **Every factual claim in this document carries a `file:line`. Verify each one
   with your own `grep` before you rely on it.** A design doc for Tangent claimed a
   camera feature that had never been built and it cost a round. If a line number
   here is wrong, the file moved — re-grep, then fix this document.
4. **Fill in the evidence boxes as you go.** An empty box means the phase is not
   done, no matter what you believe about it. Paste real command output, not a
   summary of it.
5. **If something is not specified here, it is an OPEN QUESTION (§10). Do not
   invent an answer.** Ask Stephen. Guessing is how the wrong thing gets built
   thoroughly.
6. **Do not touch game logic.** This whole build is additive. See the file fence
   in §3.

---

## 1. WHAT YOU ARE BUILDING, IN ONE PARAGRAPH

Stephen has made roughly 200 songs, organised as one folder per game. Today the
arcade has 185 carded games and **exactly one** of them (Jumping Jimothy) ever
gives a player a song. You are building the system that lets every game reward
the player with music, that lands every earned song in the shared studio player,
and that does it **without editing 185 games**. The unlocks must feel constant and
generous — Stephen's words: *"i want people to feel rewarded a lot with cool stuff
like the music so theyre excited and feel rewarded constantly."* Nothing is hard
to unlock. Nothing is behind mastery.

---

## 2. GROUND TRUTH — verify each line before you start

Run this block first. Every number below came from it. If a number disagrees,
**this document is stale and you fix it before building.**

```bash
node scripts/catalog.mjs                      # the ONE counter. Never regex the catalog.
node scripts/fleet_inventory.mjs | tail -20   # fleet-wide static signals
ls -d satellites/*/ | wc -l
grep -rl 'src="/sunbeam-sdk.js' --include=index.html satellites/ | wc -l
grep -rl 'src="/arcade-exit.js'  --include=index.html satellites/ | wc -l
```

| Fact | Where | Value at time of writing |
|---|---|---|
| Carded games | `scripts/catalog.mjs` | 185 (119 satellite cards + 67 native, minus overlap) |
| Satellite directories | `satellites/` | 117 |
| Satellites loading `sunbeam-sdk.js` | grep above | **76** ← the free injection point |
| Satellites loading `arcade-exit.js` | grep above | 3 |
| Satellites **without** `sunbeam-sdk.js` | grep above | **41** ← these need one include line |
| ...of those, born since 2026-08-01 | see §5.5 | **29** ← every game built since Aug 7 |
| Games with music of their own | `fleet_inventory.mjs` | 3 |
| Games exporting a music unlock | `fleet_inventory.mjs` | **1** (Jimothy) |
| Games that are completely silent | `fleet_inventory.mjs` | 72 |

### The seams that already exist — do not rebuild any of these

| Seam | File:line | What it does |
|---|---|---|
| Track manifest | `music-tracks.js` | `window.LW_TRACKS`, one array of `{id,title,artist,src,cat}` |
| Shelf order | `music-tracks.js:122` | `window.LW_TRACK_CATS` |
| **Unlock fold** | `music-tracks.js:128` | `foldGameUnlocks()` reads `localStorage.sws_game_unlocks` and folds it into the library |
| Re-runnable fold hook | `music-tracks.js:143` | `window.LW_FOLD_GAME_UNLOCKS` — hosts may call it directly |
| Fold re-triggers | `music-tracks.js:147-149` | `pageshow`, `focus`, `storage` |
| Shared player | `music-player.js` | `SWSPlayer.init({button})` → `window.SWS_MUSIC` |
| Portal player init | `portal/index.html:2457` | the `#music-fab` button |
| App player | `index.html:8247` | `#kb-music` → `LW_MUSIC.openDrawer()` |
| Manifest load (app) | `index.html:104153` | version-stamped `music-tracks.js?v=` |
| **Cloud sync of unlocks** | `index.html:50575` | merges `musicUnlocks` from Firestore into local |
| Service worker rule | `sw.js:259` | stale-while-revalidate for `music-tracks.js` + `music-player.js` |
| **The reference implementation** | `satellites/stream-hop/index.html:5272` | Jimothy's `syncMusicLibrary()` — read this in full |
| Backfill-on-boot precedent | `satellites/stream-hop/index.html:5281-5289` | why it exists; see LAW 2 |
| Native shell loads the player | `play/shell.js:836` | `withPlayer()` lazy-loads `/music-player.js` |
| Native games declare identity | `play/chess.html:32` | `window.LW_PLAY = {id, name}` |
| SDK knows the game id | `sunbeam-sdk.js:364-367` | `Sunbeam.init({gameId})` |
| **Safe-injector precedent** | `arcade-exit.js` | read the whole header before writing yours |

---

## 3. FILE FENCE

You may create or edit **only** these paths. Anything else is a stop, and you ask.

**Create**
```
music-unlocks.js              the shared module (the whole build)
music-catalog.js              generated: which tracks belong to which game/family
scripts/music_manifest.mjs    generator: intake JSON -> music-catalog.js
scripts/music_fixture.mjs     builds a fake music tree so P1-P4 can run today
test/music/*.mjs              the gates
docs/MUSIC-SYSTEM.md          the short doc that outlives this handoff
```

**Edit — additively only, and each edit is a single named line**
```
music-tracks.js               register the new shelves in LW_TRACK_CATS
sw.js                         one rule: NEVER precache /music/ (see LAW 5)
.gitignore                    if the fixture needs it
satellites/<slug>/index.html  ONE <script> include line, for the 26 that have no SDK
```

**Never touch**
```
index.html                    the 100k-line app. Not in this build. Ask first.
any game's logic              you are adding a script tag, not editing a game
music-player.js               it is already correct. If you think it is not, ask.
assets/music/*                the nine committed originals stay exactly as they are
```

---

## 4. THE LAWS — each one is a scar, not a preference

**LAW 1 — Two tabs clobber `localStorage`. Read, modify, write. Never write wholesale.**
`sws_game_unlocks` is written by games and read site-wide. If a player has the
arcade open in one tab and a game in another, a wholesale write loses the other
tab's unlocks. Every write does: read current → merge by `id` → write. Add
counters, never assign them. Take `Math.max` for bests.
*Scar: `feedback_localstorage_two_tabs_clobber`.*

**LAW 2 — Backfill on boot, always. This is the bug Stephen actually hit.**
> *"i unlocked all the songs in jimothy but only the first song that comes with the game is accessible in the arcade."*

Every other unlock call lives on an *event*. A song earned before the bridge
existed was never exported, and a reinstall never re-derived it. The fix, at
`satellites/stream-hop/index.html:5288`, is to re-derive the **entire** shelf from
saved progress on every boot. Your module does this for every game, unconditionally,
and it must be safe to run a thousand times. *If your module is not idempotent, it
is wrong.*

**LAW 3 — A red gate names a suspect, not a culprit.**
When a gate goes red, there are three possible owners: the code, the test, or **the
machine**. This box has 2 cores. Absolute-millisecond assertions flake here. Never
gate on wall-clock milliseconds; gate on a ratio against a reference measured in the
same process. *Scar: Conduit C6, red three times, three different owners.*

**LAW 4 — Assert by name, never by count.**
`rows.length === 3` went red only because someone added a fourth row, and "fixing"
the number shipped a phone that could not exit the menu. Assert that the shelf
*named* `Deepwell` exists and contains the track *named* `shaft-song`. Never assert
that there are seven shelves.

**LAW 5 — The service worker must NOT precache `/music/`.**
Six hundred megabytes of audio into a browser cache quota evicts the app itself and
bricks it offline. Audio is `preload="none"`, streamed on demand, one file at a
time, via HTTP range. `sw.js` gets one explicit bypass rule for `/music/` and a test
that proves it. *Scar: `feedback_service_worker_black_screen_fleet`.*

**LAW 6 — Version everything; a 200 is not evidence.**
Hostinger and the edge cache lie to you. After any deploy, grep the **live HTML** for
a NEW marker string you added in that change. And never probe a bare asset URL
before it is deployed: the edge negative-caches the 404 and the file stays "missing"
long after it exists. *Scars: `feedback_htaccess_does_not_deploy`,
`feedback_verify_the_versioned_url`.*

**LAW 7 — `fetch().catch()` is not error handling.**
`fetch` does not reject on 404 or 500. Check `res.ok`. A missing track must degrade
to "this song is not available yet", never to a silent dead button.

**LAW 8 — Never regex a parseable structure.**
The catalog is read through `scripts/catalog.mjs` and nothing else. Four scripts each
wrote their own regex for it and all four were wrong, differently, on the same day.

**LAW 9 — 48px minimum touch targets, measured as RENDERED pixels at 375×667.**
A `72px` CSS value measured 44.6 real pixels once. Measure, do not compute.

**LAW 10 — No dashes in player-facing copy. Commas and semicolons only.**
No em dash, no en dash, no hyphen, in any string a player reads: toasts, shelf
names, reveal cards, button copy. Stephen's rule, 2026-04-22: *"do not use '-'
dashes in anything. commas and semicolons only."* It does NOT apply to code
identifiers, CSS class names, file paths, URLs, or track ids. Only to text the
player reads. *Scar: `feedback_no_dashes_in_copy`.*

---

## 5. THE DESIGN

### 5.1 The insight that makes this cheap

**Do not edit 185 games.** Two facts make that unnecessary:

- 76 satellites already load `/sunbeam-sdk.js` and call `Sunbeam.init({gameId})`.
- All 67 native games load `play/shell.js`, which already declares
  `window.LW_PLAY = {id, name}` and already lazy-loads the player at line 836.

So the module can learn which game it is in **without the game telling it**, exactly
the way `arcade-exit.js` already injects a working exit into games that never asked
for one. That gives you two tiers of wiring:

| Tier | Cost per game | Coverage | What it unlocks |
|---|---|---|---|
| **Tier 0** | zero lines | every game | the theme, and the return-visit track |
| **Tier 1** | one line | flagships only | milestone tracks |

Tier 0 alone means **every one of the 185 games starts rewarding the player with
music without a single line of game logic being touched.** Build Tier 0 first and
completely. Tier 1 is a later, optional deepening.

### 5.5 ⭐ The sunbeam gap is the same gap

Stephen, 2026-09-01: *"a lot of the newer games are missing sunbeam and its okay for
now but they should be getting it."* He is right, and it is worse than "a lot":

**41 of 117 satellites do not load `/sunbeam-sdk.js`, and 29 of those were born since
2026-08-01.** Every satellite built since Aug 7 is missing it: moon-claw, skyshot,
stop-the-light, twin-lanterns, aura-farm, create-a-critter, flock-the-world,
bandits-box, blackout, deepwell, parallel, siege, wireworm, abduct-a-chameleon,
glyph-forge, hunch, letter-launch, litter-bug, sixfold, sweet-spot, tally, tarot-run,
tomato-man, wild-wardens, puppy-dash, aura-off, ripcord, conduit, tangent.

The build pattern drifted: the newer a game is, the less likely it is to be wired to
anything shared. **These are the same 41 files P5 has to open.** Adding the SDK line
while you are already in there is one extra line in a file you already have open, and
it closes a gap where the player currently earns nothing at all.

⚠️ **But it is a separate concern, so it is a separate commit.** Do not mix a music
include and a sunbeam include in one commit; if one has to be reverted, the other
must survive. And ⚠ adding the SDK changes what a game PAYS OUT, which is economy,
which is Stephen's call. Ask before wiring earn events. Adding the script tag so the
game is *capable* of earning is safe; deciding what it pays is not.

### 5.2 The unlock ladder

Stephen's brief: *"i dont want any of them to be very hard to unlock."* Take that
literally. The ladder is short, and every rung is a different **kind** of thing so it
reads as discovery rather than a grind.

| Rung | Trigger | Tier | Feels like |
|---|---|---|---|
| 1 | Open the game for the first time | 0 | a gift |
| 2 | Finish one round, win or lose, or play two minutes | 0 | "oh, I get another one" |
| 3 | Come back on a second day | 0 | being remembered |
| 4 | One modest game-specific milestone | 1 | earning it |
| 5 | Five sessions | 0 | the deep cut |

Rung 1 fires on the title screen, before the player has done anything. That is
deliberate. The first thing a new game does is hand you a song.

⚖ **Rungs 4 and 5 are proposals, not decisions.** See §10.

### 5.3 Shelves, including Stephen's card-and-board note

> *"theres some songs that are simple and probably dont require 4 songs, these extras
> can be used in game collections for cards and board games too."*

So a shelf is **not** always one game. `music-catalog.js` maps tracks to a shelf, and a
shelf is either a game or a family. A family shelf is shared by many games: any game
in the family can unlock any track on it, so six songs can serve thirty games.

Families to create (the native `/play/` classics are the obvious ones — get the exact
membership from `scripts/catalog.mjs`, never by hand):

```
Card Room      cribbage, spider, tripeaks, solitaire family, ...
Table Games    chess, checkers, backgammon, reversi, mancala, go, ...
Word Room      word search, word sprout, vine words, word trellis, ...
Puzzle Room    sudoku, kakuro, nonogram, hanoi, 15 puzzle, sokoban, ...
```

A game folder in the drop with only one or two songs should map to a family shelf
rather than getting a lonely shelf of its own. **The threshold for that is an open
question (§10).**

### 5.4 The moment

The reward has to be felt. Jimothy already does this well — read `revealSong()` at
`satellites/stream-hop/index.html:4792`. Reuse the shape, do not reinvent it:

- A toast during play, so nothing interrupts the round.
- A reveal card between rounds, showing the song title and where it came from.
- The song becomes playable immediately, in the game and in the studio player.
- Never a modal mid-round. Never a sound that fights the game's own audio.

---

## 6. HOSTING AND THE MANIFEST

**Decided, do not re-litigate:** the audio lives on Hostinger, same origin, at
`/music/<shelf>/<track-id>.mp3`. Stephen's plan is Business (200GB); the whole
library is well under one gigabyte. Same origin means no CORS, no third party, no
new account.

**Audio never enters git.** The repo is public and already 3.7GB, and `/workspaces`
runs at 91% full with 2.8GB free. This is the constraint that kills the codespace if
you ignore it. `assets/music/*.mp3` are tracked today (nine files, 46MB) — that was
the old way and it does not scale. Leave those nine alone; new music does not follow
them into git.

**Intake is already built and tested.** Stephen drops a zip in `_music-drop/` and runs
`node scripts/music_intake.mjs`. It moves the zip to `/tmp` **before** unzipping,
probes every file, and writes `docs/music-intake.json` with names, durations,
bitrates and sizes. No audio is copied into the repo. Read that script before you
write the manifest generator.

`scripts/music_manifest.mjs` turns `docs/music-intake.json` into `music-catalog.js`:
shelf, track id, title, duration, source path. **The catalog is generated, never hand
written.** Track ids are slugified from filenames and must be stable — a title change
must not orphan a player's unlock.

⚠️ **The music is not in yet.** Stephen is still downloading from Suno. So P1 through
P4 are built and gated against a **fixture**: `scripts/music_fixture.mjs` writes a fake
tree of silent, tiny mp3s in the same shape. Everything must pass on the fixture
before real audio exists. Nothing about your build may assume the real files.

---

## 7. PHASES

Each phase: run the gate and watch it FAIL, build, run it green, fill the evidence box.

### P0 — Prove the ground truth
Run every command in §2. Reconcile every number in the table. Read
`satellites/stream-hop/index.html:5232-5300` in full, and `arcade-exit.js` in full.
**Gate:** you have corrected any stale line number in this document, or confirmed in
the evidence box that all of them held.

> **EVIDENCE P0**
> ```
> (paste catalog.mjs + fleet_inventory.mjs output, and the grep counts)
> ```
> Lines corrected in this doc: ________

---

### P1 — The fixture
`scripts/music_fixture.mjs` builds `/tmp/music-fixture/` with 6 shelves, 3 to 5 tracks
each, real playable mp3s of about one second (`ffmpeg -f lavfi -i anullsrc`), with
spaces and apostrophes in the names because the real folders will have them.
**Watch it fail:** run the P2 gate before this exists; it must fail for want of a fixture.

> **EVIDENCE P1** — shelves built: ____ tracks: ____ output: `______`

---

### P2 — `music-catalog.js` and its generator
`scripts/music_manifest.mjs` reads intake JSON, emits `music-catalog.js`.
**Gate `test/music/catalog.mjs`:** every track has a stable id; no duplicate ids across
shelves; every shelf resolves to at least one real game slug **taken from
`scripts/catalog.mjs`**; renaming a title does not change its id (LAW 4, LAW 8).

> **EVIDENCE P2** — gate red first: `______` then green: `______`

---

### P3 — `music-unlocks.js`, the module
The whole build. It must:
1. Identify its game from `Sunbeam` gameId, else `window.LW_PLAY.id`, else the URL
   path. Never a hardcoded slug table.
2. Expose `SWSMusic.unlock(shelf, trackId)` and `SWSMusic.rebuild()`.
3. **Backfill on boot, unconditionally, idempotently (LAW 2).**
4. Read-modify-write `sws_game_unlocks` every time (LAW 1).
5. Do nothing at all, and throw nothing, when it cannot identify a game.
6. Never autoplay. Never touch the game's own audio.

**Gate `test/music/unlocks.mjs`:** run the module 100 times and assert the shelf is
byte-identical after run 1; simulate a second tab writing between your read and write
and assert nothing is lost; wipe local storage and assert boot alone restores the full
shelf from saved progress; assert a shelf is found **by name** (LAW 4).
⭐ **Write a `test/music/mutants.js` that breaks the module in ten specific ways and
asserts your gate goes red for each.** In Conduit this exact technique proved ten
inherited gates and ten freshly written ones were asserting nothing.

> **EVIDENCE P3** — gate red first: `______` green: `______` mutants killed: __/10

---

### P4 — Tier 0 injection, no game edited
Serve the module the way `arcade-exit.js` is served. 76 satellites get it through the
SDK path and 67 native games through `play/shell.js:836`. **Zero game files change in
this phase.**
**Gate `test/music/inject.mjs`:** boot a sample of at least 12 games headless across
both surfaces; assert each grants its rung-1 track, assert `sws_game_unlocks` contains
it, assert **zero new console errors** against a baseline captured from `HEAD` first.
⛔ Baseline every gate against HEAD before you judge a failure — this project has
chased its own pre-existing noise before.

> **EVIDENCE P4** — games booted: ____ granted: ____ new console errors: ____

---

### P5 — The 41 stragglers, and the sunbeam gap they share
The 41 satellites that do not load `sunbeam-sdk.js` get **one** `<script>` line each.
⭐ **Read §5.5 first.** These are the same 41 games that earn the player nothing, so
this phase is one pass, not two. Additive, nothing else on the line, nothing else in the file. Batch them ten at
a time and run P4's gate between batches.
⛔ `str.replace`-style patches MUST assert the match happened. A silent no-match that
reports success has cost this project a round before.

> **EVIDENCE P5** — batch 1 `___/10` batch 2 `___/10` batch 3 `___/6` gate after each: `______`

---

### P6 — The moment, and the shelf in the player
Toast, reveal card, family shelves registered in `LW_TRACK_CATS`
(`music-tracks.js:122`). `sw.js` gets its `/music/` bypass (LAW 5).
**Gate `test/music/ui.mjs`:** toast never covers a control; every tappable thing is
48px measured at 375×667 (LAW 9); no dashes in any string you added (LAW 10); the SW
rule proves it does not cache a `/music/` URL.
⛔ **Then LOOK AT IT.** Screenshot the toast and the reveal from where the player
stands, on a 375×667 viewport, and name three things wrong in the image before Stephen
does. A green test is not a look.

> **EVIDENCE P6** — screenshots: `______` three things wrong: 1) __ 2) __ 3) __

---

### P7 — Hand back
`docs/MUSIC-SYSTEM.md`: how to add a song, how to add a shelf, how a game claims a
milestone track. One page. Then **stop**. Do not deploy. Report the branch, the commit,
the gate output, and the open questions.

> **EVIDENCE P7** — branch: ____ commit: ____ gates: ____ deployed: **NO**

---

## 8. WHAT YOU MUST NOT DO

- Do not push to `main`.
- Do not edit `index.html`. Ask first.
- Do not edit any game's logic. You add a script tag. That is all.
- Do not bundle, preload, or precache audio (LAW 5).
- Do not remove or replace any game function. *Scar: `feedback_never_remove_games` — a
  bulk restore once wiped weeks of hand-tuned art and Stephen found it himself.*
- Do not hand-write `music-catalog.js`.
- Do not invent a track, a title, a shelf, or a game name. If the intake JSON does not
  have it, it does not exist.
- Do not gate on wall-clock milliseconds (LAW 3).
- Do not write `[x]` anywhere before the work is actually done.
- Do not claim any art or music is hand made. It is generated, and Stephen made it
  with Suno on a paid tier.

---

## 9. EVIDENCE LOG

| Phase | Gate red first? | Gate green? | Files touched | Notes |
|---|---|---|---|---|
| P0 | n/a | | | |
| P1 | | | | |
| P2 | | | | |
| P3 | | | | |
| P4 | | | | |
| P5 | | | | |
| P6 | | | | |
| P7 | | | | |

---

## 10. OPEN QUESTIONS — ask Stephen, never invent

1. **Rung 4 and 5.** Are "one modest milestone" and "five sessions" right, or is even
   that too much? The brief says nothing should be hard.
2. **Family threshold.** A game folder with how few songs gets folded into a family
   shelf instead of its own? Two? Three?
3. **Family membership.** The four families in §5.3 are a proposal. Which games belong
   in each is Stephen's call.
4. **The theme track.** When a game folder has several songs, which one is the free
   rung-1 theme? Filename order is a guess, not an answer.
5. **Games with no folder.** Many of the 185 will have no music of their own. Do they
   get a family shelf, the general library, or nothing?
6. **Re-locking.** If a track is removed from the catalog, does a player who unlocked
   it keep it? (Strong recommendation: yes, always. Never take a reward back.)

---

## 11. THE PROMPT TO START WITH

> Read `HANDOFF-MUSIC.md` in full before you touch anything. Then execute P0 and stop.
> Report the ground-truth numbers, every line number in §2 you had to correct, and
> anything in the document you believe is wrong. Do not begin P1 until that report is
> accepted. You are on branch `add-sproing-jumper` and you never push to `main`.

