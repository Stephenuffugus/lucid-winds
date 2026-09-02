# HANDOFF-MUSIC — the Tier 0 soundtrack unlock system
### For Claude Opus 5, in a fresh session. Written by Fable, 2026-09-02, after reviewing and discarding a first draft. Fable reviews the result, then deploys.

---

## 0. THE BOX. Read every line. It is short because each line has already cost a day.

1. **You are on branch `add-sproing-jumper`. You never push to `main`.** Deploy is `git push origin add-sproing-jumper:main` and only Stephen or a reviewing Fable session runs it. If you type `:main`, stop, you have failed the handoff.
2. **You never rewrite an existing file.** Every change to a file that already exists is an INSERT made by a script that asserts its anchor matched exactly once. A gate (`no_shrink`) fails the build if any pre-existing file lost a single line. Truncation is the failure Stephen fears most, so it is the one this document is built around.
3. **Run every gate and watch it fail BEFORE you build the thing it gates.** A gate you have not seen red is decoration. Twelve green gates once passed on a build with a see-through floor, and `test/mutants.js` in Conduit later proved twenty gates asserted nothing.
4. **Every `file:line` in this document is a claim. Verify each with your own grep before relying on it.** If a line moved, fix this document in the same commit. A design doc once claimed a camera feature that was never built; it cost a round.
5. **Fill the evidence boxes with pasted command output, not summaries.** An empty box means the phase is not done regardless of what you believe.
6. **If it is not specified here, it is an OPEN QUESTION (§12). Do not invent it.** Not a track, not a title, not a shelf name, not a game mapping, not a hosting path.
7. **You never touch game logic, `index.html`, `sunbeam-sdk.js`, `music-player.js`, or any vendored satellite.** The fence in §4 is the complete list of what you may touch.
8. **You never play audio.** This build grants songs and shows a 3 second toast. Playback belongs to the shared player the player already has.

---

## 1. WHAT YOU ARE BUILDING

Stephen has made roughly 200 songs, one folder per game. The arcade has 186 carded games and exactly **one** of them, Jumping Jimothy, ever gives a player a song. You are building **Tier 0**: a single shared module that, inside any game, knows which game it is in, quietly tracks how long the player has been there and how many days they have come back, and hands them songs from that game's shelf on a short generous ladder. Every song lands in the shared studio player under a shelf named after the game. No game's logic changes. No game plays the audio. The reward is the toast and the shelf.

Stephen's brief, verbatim: *"i want people to feel rewarded a lot with cool stuff like the music so theyre excited and feel rewarded constantly."* And: *"i dont want any of them to be very hard to unlock."* Take both literally.

### What you are NOT building (each is a separate, later handoff)
- **Tier 1** — a game calling `SWSMusic.unlock()` on a real milestone, or adopting its shelf as in-game background music the way Jimothy does. One line per flagship. Not now.
- **The 12 vendored satellites** (§3, table C). Their include goes in the upstream repo, then re-vendor. Not here.
- **In-app plays inside `index.html`** (natives played inside the Lucid Winds app rather than the `/play/` shell). Needs one line in a 100k-line file. Proposed in §13, done by Fable after review.
- **The sunbeam gap.** 41 satellites do not load the SDK. It is a real problem and it is not this problem.
- **Uploading audio to the host.** You cannot. §7 marks the human gate.

---

## 2. GROUND TRUTH. Run this first. Every number below came from it.

```bash
node scripts/catalog.mjs                                   # the ONE counter. Never regex the catalog.
node scripts/fleet_inventory.mjs | tail -20
ls -d satellites/*/ | wc -l                                # 117
node scripts/vendor_satellites.mjs --list | wc -l          # 12 vendored
grep -lic "</head>" satellites/*/index.html | wc -l        # 117, the insertion anchor
grep -rl "arcade-exit" satellites/*/index.html | wc -l     # 32, and it is an INCLUDE, not an injector
node -e "console.log(require('puppeteer/package.json').version)"   # 25.4.0
```

| Fact | Value | Why it matters |
|---|---|---|
| Carded games | 186 | 119 satellite cards + 67 native, per `catalog.mjs` (`fleet_inventory.mjs` shows 185 rows because it skips the 3 cards with no directory and adds 2 uncarded dirs) |
| Satellite directories | 117 | every one has `index.html` and exactly one `</head>` |
| Vendored satellites | **12** | cannot be edited here; `vendor_satellites.mjs --check` reports EDITED |
| In-scope satellite includes | **105** | 117 minus 12 |
| Native games | 67 | all boot through `play/shell.js`; ONE edit covers all |
| Games exporting a music unlock today | 1 | Jimothy, and it keeps its own bridge (§6.8) |
| Games with music of their own | 3 | |
| Catalog categories | action, board, card, creative, dice, math, party, pattern, puzzle, word | **these ARE the family shelves**, nothing to invent |
| Disk | `/workspaces` 91% full, 2.8GB free; `/tmp` 38GB free | audio never rests on the first one |
| Puppeteer | 25.4.0, Chrome cached | the boot gates use it |

---

## 3. THE SEAMS. Verified 2026-09-02. Re-verify before use.

### A. What exists and must be reused, never rebuilt
| Seam | `file:line` | What it does |
|---|---|---|
| Track manifest | `music-tracks.js` | `window.LW_TRACKS`, entries `{id,title,artist,src,cat}` |
| Shelf order | `music-tracks.js:122` | `window.LW_TRACK_CATS` |
| **The fold** | `music-tracks.js:128-141` | reads `localStorage.sws_game_unlocks`, pushes unknown ids into `LW_TRACKS`, and **registers a new shelf at the top of the order on first sight**. So you never edit `LW_TRACK_CATS`. |
| Fold uses ledger entries AS IS | `music-tracks.js:137-139` | it does not refresh `src`; **your module must** (§6.6) |
| Re-runnable fold hook | `music-tracks.js:143` | `window.LW_FOLD_GAME_UNLOCKS` |
| Fold re-triggers | `music-tracks.js:147-149` | `pageshow`, `focus`, `storage` |
| Shared player | `music-player.js` | `SWSPlayer.init({button})`; a dead `src` skips to the next track after 600ms (`:161`) |
| Player init, portal | `portal/index.html:2457` | |
| Manifest load, portal | `portal/index.html:42-43` | `music-tracks.js?v=2026.07.25.01`, then bare `music-player.js` |
| Manifest load, app | `index.html:104153` | version stamped by `LW_VERSION` (`index.html:904`) |
| **Cloud sync of the ledger** | `index.html:50244` write, `index.html:50575-50585` read | the WHOLE `sws_game_unlocks` array syncs to `vaults/{uid}`; read side merges by id, never overwrites |
| Service worker, s-w-r rule | `sw.js:259` | `music-tracks.js` and `music-player.js` are stale-while-revalidate. **Your two files join this rule.** |
| Service worker, static rule | `sw.js:298` | `css jpg jpeg png webp svg gif ico woff2 woff ttf otf eot`. **mp3 is not in it.** |
| Service worker, default | `sw.js:338` | "Everything else: network only". So `/music/` is uncached today. You add a test that proves it stays that way, and a 3 line guard. |
| Native shell boot | `play/shell.js:900-901` | `initMusic()` then `initInstall()` inside `init()` on `DOMContentLoaded` (`:946`) |
| Native shell music | `play/shell.js:830-841` | loads `music-tracks.js` then `music-player.js`, **returns early when embedded** (`:831`, `musEmbedded` at `:785`). Your call goes AFTER `:901`, outside that early return. |
| Native identity | `play/chess.html:32` | `window.LW_PLAY = {id, name}` on every shell page |
| The one existing bridge | `satellites/stream-hop/index.html:5272-5289` | Jimothy's `syncMusicLibrary()`; backfills on boot. Read it in full. |
| Existing include shape | 3 of the 32 | `<script src="/arcade-exit.js" defer>` |
| Headless pattern | `scripts/_shot_sat.mjs:3-12` | puppeteer `headless:"new"`, `--no-sandbox`, `http://127.0.0.1:8777/satellites/<slug>/` |
| Intake | `scripts/music_intake.mjs` | built and tested; moves the zip to `/tmp` BEFORE unzipping; writes `docs/music-intake.json` |
| Vendoring | `scripts/vendor_satellites.mjs`, `VENDORING.md` | upstream is source of truth; hand edits are drift |

### B. What does NOT exist, so do not look for it
- A runtime injector that reaches satellites without an include line. None. `arcade-exit.js` is an include.
- A loader in `sunbeam-sdk.js` for anything but Firebase (`sunbeam-sdk.js:221-229`).
- A root `test/` directory. You create `test/music/`.
- A stamp tool for the include line. You do not need one: the module and catalog load BARE and ride the `sw.js:259` rule, exactly like `music-player.js`.

### C. The 12 vendored satellites. You do not touch these files.
`tomato-man abduct-a-chameleon glyph-forge litter-bug sweet-spot tarot-run sixfold letter-launch skitterlings wild-wardens tally hunch`
Verify with `node scripts/vendor_satellites.mjs --list`. Your include script must read that list and skip them, and their 12 `index.html` sha256s must match `test/music/vendored_baseline.txt` when you are done (LAW 16 explains why "CLEAN" is not the gate).

### D. Display name is not slug. Never assume.
Acorn Drop is `tonic-drop`. OriVex is `petalvex`. Sunforge is `ring-stacker`. Blobworks is `greenhouse-pinball`. Jumping Jimothy is `stream-hop`. Super Slice is `slice-master`. Two cards, Abduct a Chameleon and Abduct a Chameleon 3D, share one dir. `scripts/catalog.mjs` returns both `name` and `dir`/`id`; the generator matches against ALL of them (§6.4).

---

## 4. FILE FENCE. The complete list. Anything else is a stop, and you ask.

**Create**
```
music-unlocks.js                 the module, ES5, one IIFE, idempotent
music-families.json              family shelf names + folder aliases (§6.5). You create it with the defaults given there.
scripts/music_fixture.mjs        fake tree of tiny real mp3s in /tmp/music-fixture/, same shape as the real drop
scripts/music_manifest.mjs       intake JSON  ->  music-catalog.js  (+ docs/music-unmapped.md)
scripts/music_web_tier.mjs       /tmp/music-intake  ->  /tmp/music-web/music/v1/<shelf>/<file>.mp3 + SHA256SUMS.txt
scripts/music_include.mjs        the asserted inserter for the 105 satellite includes; --dry-run default, --apply, --check
scripts/music_verify.mjs         HEAD/GET every catalog URL against a base; exit 1 on any miss
test/music/run.mjs               runs every gate below in order, stops at first red
test/music/catalog.mjs           gate P2
test/music/unlocks.mjs           gate P3 (node vm, fake localStorage/document, no browser)
test/music/mutants.mjs           gate P3b, ten named mutations, each must turn unlocks.mjs red
test/music/sw.mjs                gate P5a
test/music/inject.mjs            gate P5b/P6, puppeteer, request interception serves the fixture catalog
test/music/no_shrink.mjs         gate every phase: no pre-existing file lost a line; node --check on all touched JS
test/music/ui.mjs                gate P7
docs/MUSIC-SYSTEM.md             the one page that outlives this handoff
docs/MUSIC-BUILD-LOG.md          your evidence log, appended per phase (§10, §11)
docs/music-unmapped.md           generated by the manifest script when real intake data exists
```

**Edit, by asserted insert only**
```
play/shell.js                    ONE new function + ONE call after line 901
sw.js                            ONE new s-w-r block inserted above the line-255 music-tracks block (a copy of it, the file's own idiom) + ONE guard line above the line-293 static rule. Pure inserts.
play/sw.js                       the same guard, if its rules could ever touch /music/ (P5 reads it)
play/*.html                      the `shell.js?v=N` stamp bumped, 66 files, stamp-only modifications (LAW 10)
portal/index.html                the `/sw.js?v=N` registration stamp bumped, one line, stamp-only
satellites/<slug>/index.html     ONE line before the only </head>, 105 files, via scripts/music_include.mjs only
NEW_SATELLITE_BRIEF.md           the include line added to the standard, additive
_music-drop/README.md            two rules added for Stephen (§7.1), additive
music-catalog.js                 GENERATED by scripts/music_manifest.mjs, never hand written, committed with live:false
```

**Never**
```
index.html          sunbeam-sdk.js          music-player.js          music-tracks.js
assets/music/*      any file in the 12 vendored satellites          any game's logic
```

---

## 5. THE LAWS. Each one is a scar. The source is named so you can read the scar.

**LAW 1. Read, modify, write. Never write `localStorage` wholesale.** Two tabs clobber each other. Every write to `sws_game_unlocks` and `sws_music_progress` reads the current value first, merges by id, then writes. Counters add, bests take `Math.max`. *`feedback_localstorage_two_tabs_clobber`.*

**LAW 2. Rebuild on boot, unconditionally, idempotently.** Stephen: *"i unlocked all the songs in jimothy but only the first song that comes with the game is accessible in the arcade."* Every other call lives on an event, so a song earned before the bridge existed was never exported and a reinstall never re-derived it. `satellites/stream-hop/index.html:5281-5289` fixed it by re-deriving the whole shelf on every boot. Yours does the same, for every game, and is safe to run a thousand times. Gate: run it 100 times, the ledger is byte-identical after run 1.

**LAW 3. A red gate names a suspect, not a culprit.** Three owners: the code, the test, the machine. This box has two cores; absolute-millisecond assertions flake. Never gate on wall-clock. If a gate goes red, look at all three before touching the code. *Conduit C6, red three times, three owners.*

**LAW 4. Assert by name, never by count.** `rows.length === 3` went red because a fourth row was added, and "fixing" the number shipped a phone that could not leave the menu. Assert the shelf named `Deepwell` exists with the track id `m-deepwell-shaft-song`. Never assert there are seven shelves.

**LAW 5. The service worker never caches `/music/`.** Six hundred megabytes into the cache quota evicts the app itself. Audio streams on demand, one file at a time, `preload="none"` (the shared player already does this). `sw.js` gets a 3 line guard and a test that proves a `/music/` URL is never put in any cache. *`feedback_service_worker_black_screen_fleet`.*

**LAW 6. Version everything; a 200 is not evidence.** The host overrides `Cache-Control` on static assets to 4 hours regardless of `.htaccess`. After any deploy, grep the live HTML for a NEW marker you added. Never probe a bare asset URL before it is deployed; the edge negative-caches the 404. Audio paths carry `/v1/` so a re-encode can move to `/v2/` without fighting the cache. *`feedback_htaccess_does_not_deploy`, `feedback_verify_the_versioned_url`.*

**LAW 7. `fetch().catch()` is not error handling.** `fetch` does not reject on 404. Check `res.ok`. The verify script checks status AND `content-type` starts with `audio/` AND `content-length` matches the local file.

**LAW 8. Never regex a parseable structure.** The catalog is read through `scripts/catalog.mjs`. Four scripts each wrote their own regex for it and all four were wrong differently on the same day. Your generator imports `catalog()`.

**LAW 9. Never rewrite a file. Insert with an asserted anchor.** Every edit to an existing file: find the anchor, assert it occurs exactly once, assert the insert is not already present, insert, then assert `wc -l` grew by exactly the inserted line count. `str.replace` that silently matched nothing has reported success before. *`project_ripcord_aug30`.*

**LAW 10. No pre-existing file may shrink, and no line may change except a version stamp.** `test/music/no_shrink.mjs` diffs against the P0 commit and fails if any pre-existing file has a removed line, UNLESS every removed line is matched by an added line identical once `?v=N` / `lw-assets-vN` stamps are normalised. That exception exists because a change to `play/shell.js` or `sw.js` reaches nobody until its stamp is bumped (P5 explains), and a stamp bump is a one-token change to a line. Anything else that rewrites a pre-existing line fails by file and line. If you believe a real deletion is required, stop and ask.

**LAW 11. Baseline every gate against the untouched page.** The module honors `?nomusic=1` and does nothing. The inject gate boots each sampled game twice, with and without that flag, and compares console error sets. Only NEW errors count. This project has chased its own pre-existing noise before.

**LAW 12. 48px minimum touch targets, measured as rendered pixels at 375×667.** A `72px` CSS value once measured 44.6 real pixels. Measure with `getBoundingClientRect`, do not compute. The toast is not a touch target (it is `pointer-events:none`) but nothing you add may cover one for longer than the toast lives.

**LAW 13. No dashes in anything a player reads.** Stephen, 2026-04-22: *"do not use '-' dashes in anything. commas and semicolons only."* No em dash, en dash, or hyphen in toast text, shelf names, or titles you generate. Does not apply to ids, file names, URLs, code. *`feedback_no_dashes_in_copy`.*

**LAW 14. Never remove a reward.** A ledger entry, once written, is never deleted by the module. A track removed from the catalog leaves the player's entry alone. *`feedback_never_remove_games`, the same instinct.*

**LAW 15. Never claim the music is hand made.** Stephen made it with Suno on a paid tier. `artist` is `Stephen`. Nothing you write says otherwise.

**LAW 16. Vendored means untouchable here.** ⚠️ `vendor_satellites.mjs --check` already reports EDITED for all 12 (index.html, one file each) before this build begins; that drift predates it and is reported, not fixed. So the gate is **byte-identical**: P0 records `sha256sum satellites/<12>/index.html` to `test/music/vendored_baseline.txt`, and every later phase asserts those 12 hashes are unchanged. *`project_vendoring_off_origin_aug18`.*

---

## 6. THE DESIGN. Decided. Build this, not a variant of it.

### 6.1 How the module knows which game it is in
1. `boot(opts)` with `opts.id` wins. `play/shell.js` calls `SWSMusic.boot({id: LW_PLAY.id, name: LW_PLAY.name})`.
2. Else the URL: `/^\/satellites\/([a-z0-9-]+)\//.exec(location.pathname)` gives the slug.
3. Else nothing. The module does nothing and logs nothing above `console.debug`.
Never a hard-coded slug table. The catalog carries the games each shelf belongs to.

### 6.2 Two stores, one direction
- **`sws_music_progress`** is the source of truth. `{ [slug]: { first: ts, days: ['YYYY-MM-DD', ...], sessions: n, secs: n } }`. Local date from `getFullYear/getMonth/getDate`, the player's own day. `secs` accrues only while `!document.hidden`, on a 5 second `setInterval` cleared on `visibilitychange` hidden (never `requestAnimationFrame`; *`feedback_liveness_probes_must_not_use_raf`*). `sessions` increments once per page load, the first time `secs` for that load reaches 60. Read-modify-write (LAW 1).
- **`sws_game_unlocks`** is a projection: progress + catalog → ledger. `rebuild()` derives it and merges by id (LAW 1, LAW 2, LAW 14). Entry shape is exactly what the fold expects: `{ id, title, artist:'Stephen', src, game }` where `game` is the shelf's display name.
- The cloud syncs the ledger, not progress (`index.html:50244`). On a new device the ledger arrives, the fold shows the shelf, and progress starts fresh. That is acceptable and documented.

### 6.3 The ladder. Short, generous, all passive, tunable. (Revised by the Director during the build.)
Stephen, 2026-09-02: *"it should be easy to unlock most of these to start"* and, for family shelves, *"the more card
games you try, the more you unlock."* So the ladder is multi-path (ANY condition opens a rung) and its numbers live in
`music-ladder.json`, emitted into the catalog as `ladder`, read by the module with defaults. Tracks on a shelf are
ordered by file name (§7.1). Track index `i` unlocks when ANY holds:

| Path | Condition | Default | Track 1 needs | Track 5 needs |
|---|---|---|---|---|
| open | `i === 0` | free | | |
| time | visible seconds `>= secsPer * i` | 120 | 2 min | 10 min |
| days | calendar days played `>= 1 + daysPer * i` | 1 | a 2nd day | a 6th day |
| sessions | 60s+ page loads `>= sessionsBase + i` | 2 | 3 sessions | 7 sessions |
| breadth, FAMILY shelves only | distinct games of the family opened `>= 1 + breadthPer * i` | 1 | a 2nd card game | a 6th card game |

Rung 0 is granted on boot; its toast waits for the first tap (§6.7). Tuning is one JSON edit and a regenerate; the
module never needs to change. ⚠ The first draft of this section had a fixed ladder (open / 120s / day 2 / 5 sessions /
+3); it was replaced at P9 on the Director's instruction and every gate was re-asserted under the new one.

### 6.4 Shelves: a game, or a family
`music-catalog.js` (generated) is:
```js
window.LW_MUSIC_CATALOG = {
  version: '2026.09.02.01',        // generator stamps it from content, changes when tracks change
  base: '/music/v1/',              // ONE constant; §7 explains why /v1/
  live: false,                     // Fable flips to true only after music_verify.mjs passes against the live host
  shelves: [
    { slug:'deepwell', name:'Deepwell', kind:'game', games:['deepwell'],
      tracks:[ { id:'m-deepwell-shaft-song', title:'Shaft Song', file:'shaft-song.mp3', seconds:184 } ] },
    { slug:'card-room', name:'Card Room', kind:'family', games:['cribbage','spider', /* every catalog game with cat:'card' */],
      tracks:[ /* ... */ ] }
  ]
};
```
- `shelvesFor(slug)` = the `kind:'game'` shelf whose `games` contains the slug, plus every `kind:'family'` shelf whose `games` contains it. A game can have both. The ladder is evaluated per shelf against the SAME progress, so two minutes in any card game unlocks Card Room track 1 AND that game's own track 1. Generous on purpose.
- `src` for a track = `base + shelf.slug + '/' + track.file`.
- **The module does nothing if `!LW_MUSIC_CATALOG.live`.** This is the interlock that stops a deployed catalog from granting songs whose audio is not on the host yet (a dead `src` would toast, then skip silently: a lie).

### 6.5 Families are the catalog categories. Nothing to invent.
`scripts/catalog.mjs` returns `cat` for every game: `action board card creative dice math party pattern puzzle word`. Family membership IS that field. You create `music-families.json` with exactly these defaults; Stephen may rename any `name` later:
```json
{ "card":    { "name": "Card Room",    "aliases": ["card games","cards","card room"] },
  "board":   { "name": "Table Games",  "aliases": ["board games","board","table games"] },
  "dice":    { "name": "Dice Table",   "aliases": ["dice","dice games"] },
  "word":    { "name": "Word Room",    "aliases": ["word games","words","word room"] },
  "puzzle":  { "name": "Puzzle Room",  "aliases": ["puzzle games","puzzles","puzzle room"] },
  "pattern": { "name": "Pattern Room", "aliases": ["pattern games","pattern","patterns"] },
  "math":    { "name": "Math Room",    "aliases": ["math games","math"] },
  "action":  { "name": "Action Room",  "aliases": ["action games","action","arcade"] },
  "creative":{ "name": "Makers Room",  "aliases": ["creative","makers","make"] },
  "party":   { "name": "Party Room",   "aliases": ["party games","party"] } }
```
A family shelf exists in the catalog only if a folder in the drop maps to it. No folder, no shelf.

### 6.6 Folder name → shelf. Deterministic, and it refuses rather than guesses.
The generator, for each game folder in `docs/music-intake.json`:
1. `norm(s)` = lowercase, keep only `a-z0-9`.
2. Exact: `norm(folder)` equals `norm(name)`, `norm(dir)`, or `norm(id)` of any card → that game.
3. Family: `norm(folder)` equals `norm(alias)` for any family → that family.
4. Contains: exactly ONE card whose `norm(name)` contains `norm(folder)` and `norm(folder).length >= 5` → that game, logged as FUZZY. (Jimothy → Jumping Jimothy.) More than one hit → unmapped.
5. Else **UNMAPPED**: written to `docs/music-unmapped.md` with the folder name and its track count. No shelf is emitted. Stephen resolves it by renaming the folder. **You never guess.**
6. A folder that maps to `stream-hop` is SKIPPED with a log line: Jimothy keeps its own bridge (`satellites/stream-hop/index.html:5272`), and a second shelf of the same songs would be a duplicate.
7. Two cards sharing one dir (the Chameleons) share one shelf.

**Ids are stable forever.** `id = 'm-' + shelf.slug + '-' + slugify(title)`; on collision within a shelf, `-2`, `-3` in file-name order. The generator reads the existing `music-catalog.js` first and **keeps every id it already has for the same `(shelf, file)`**. A renamed title does not change an id. Gate: rename a title in the fixture, regenerate, assert the id held (LAW 4).

**On every boot, for every ledger entry whose id exists in the catalog, the module overwrites that entry's `title`, `src`, and `game` from the catalog.** The fold uses entries as is (`music-tracks.js:137`); this is how a moved host or a fixed title reaches players who unlocked the song a month ago. Entries whose id is NOT in the catalog are left exactly as they are (LAW 14).

### 6.7 The moment. (Revised at P11, after Stephen played Rabbit Ronin.)
Stephen, 2026-09-02: *"i unlocked a song but there didnt seem to be any way to even play the damn thing"* and *"i like a
uniform music button across everything"*. Tier 0's toast-only moment dead-ended in the 95 satellites that never carried
the shared player. So:

- **The card, at boot only.** When a song is fresh at boot, or was earned mid round in any game last time, a bottom sheet:
  "Congratulations, you unlocked a song" (and N more), the title, "<shelf> · Stephen", the track's art if the catalog has
  an `art` file for it and a ♫ tile if not (never fabricated), and two 48px buttons: **Listen now** / **Later**. Listen now
  loads `music-tracks.js` then `music-player.js` on demand (once), inits the shared player with the chip as its button,
  and plays that track by its index in `LW_TRACKS`. Either button marks the song revealed (`sws_music_revealed`, so a
  cloud restore never re-congratulates) and clears it from `sws_music_pending_reveal`.
- **Mid round: toast + pending.** A rung crossed during play, or a Tier 1 `unlock()`, shows the inert toast and is added
  to `sws_music_pending_reveal` (read-modify-write). Its card comes at the next boot of ANY game, the only moment the
  module can be certain nobody is mid play without a game hook.
- **The chip, everywhere.** One "♫ Music" button, 48px tall, 96px+ wide, house palette, placed by the same free-corner
  search `arcade-exit.js` uses (copied; it is not exported), never bottom right, skipped only where the native shell
  already has `#shell-music-btn` or a player is already present. Tap → loads the player on demand → opens the drawer,
  which closes back to the game. `SWSMusic.openPlayer()` does the same for a game that wants its own control.
- One `<style id="sws-music-style">` in head; body gains only the toast, the chip, the card (and the player's own drawer
  and audio element once opened).

### 6.8 Guarantees the module makes, and the gates that hold it to them
| Guarantee | Gate |
|---|---|
| Idempotent on double load (`if (window.SWSMusic) return;`) | unlocks.mjs loads it twice, one instance |
| Does nothing without a catalog, without `live:true`, without an identity, or with `?nomusic=1` | four separate assertions |
| Never throws: everything in `try/catch`, `localStorage` may be absent | unlocks.mjs runs it with a throwing `localStorage` |
| Never plays audio, never creates `<audio>`, never calls `AudioContext` | source grep in unlocks.mjs |
| Never touches game DOM except its own toast element by id | inject.mjs diffs `document.body.children` ids before/after |
| Rebuild 100× → ledger byte-identical after run 1 | unlocks.mjs |
| A write between read and write from "another tab" loses nothing | unlocks.mjs simulates it |
| Wipe the ledger, keep progress, boot → ledger restored | unlocks.mjs |
| Stale `src` in a ledger entry is refreshed from the catalog on boot | unlocks.mjs |
| An entry not in the catalog is untouched | unlocks.mjs |
| Ten named mutations each turn unlocks.mjs red | mutants.mjs |

---

## 7. HOSTING, INTAKE, WEB TIER, VERIFY. And the two human gates.

**Audio never enters git.** The repo is public and 3.7GB. `/workspaces` has 2.8GB free. The nine mp3s tracked in `assets/music/` are the old way; leave them, do not follow them.

**Decided path:** same origin, `https://lucidwinds.com/music/v1/<shelf>/<file>.mp3`. Same origin means no CORS, no third party, no new account, and the service worker's default of "network only" already applies. `/v1/` exists so a re-encode can move to `/v2/` past the host's 4 hour edge cache (LAW 6).

**Unknown, and therefore probed, not assumed:** whether Hostinger's git auto-deploy preserves files that are not in git. Human gate H2 settles it with a 1KB file before anyone uploads 600MB.

### 7.1 Intake (built, tested). Stephen's step, any time.
Stephen drags the zip into `_music-drop/` and runs `node scripts/music_intake.mjs`. It moves the zip to `/tmp/music-intake` BEFORE unzipping, probes every file, writes `docs/music-intake.json`. You add two rules to `_music-drop/README.md`, additively:
> The first song in a folder, by file name, is the free one the player gets on opening the game. To choose the order, start file names with `01 `, `02 `, and so on.
> A folder named `Card Games`, `Board Games`, `Word Games`, `Dice`, `Puzzle Games`, `Party Games`, `Math Games`, `Action Games`, `Pattern Games` or `Creative` becomes a shared shelf that every game of that kind can unlock.

`/tmp` is a separate disk and must be treated as disposable. The masters' durable home is the vault (`reference_lucid_winds_vault`); that archive is Fable's job because cross-repo pushes need Stephen's auth. Not yours.

### 7.2 Fixture. Yours, P1.
`scripts/music_fixture.mjs` writes `/tmp/music-fixture/` in the exact shape the intake expects: 5 game folders whose names exercise §6.6 (one exact display name, one exact slug, one FUZZY like `Jimothy`, one that shares a dir, one deliberately UNMAPPED) plus 2 family folders (`Card Games`, `Board Games`), 2 to 5 tracks each, real playable mp3s of about one second (`ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 -c:a libmp3lame -b:a 64k`), with spaces and an apostrophe in some names, plus a `__MACOSX` dir and a `.DS_Store`. Then it runs the intake's probe logic on that tree to produce `/tmp/music-fixture/intake.json`, and the generator run on it produces `/tmp/music-fixture/music-catalog.js` with `live:true`. **The fixture catalog is never written to the repo root.**

### 7.3 Web tier. Yours, P4. Runs on the fixture; runs on the real data if `docs/music-intake.json` exists.
`scripts/music_web_tier.mjs --from <intake.json> --to /tmp/music-web`: for each catalogued track, if source bitrate > 160k transcode to `libmp3lame -b:a 128k` joint stereo, else copy; output file name = the catalog `file` (slug form, no spaces); write `SHA256SUMS.txt`; idempotent (skip when the output exists and is newer than the source). Print total size. Never writes under `/workspaces`.

### 7.4 Verify. Yours, P4.
`scripts/music_verify.mjs --catalog <path> --base <url>`: for every track, HEAD the URL; require status 200, `content-type` starting `audio/`, and `content-length` equal to the local file's size when `--local <dir>` is given. Exit 1 on any miss, printing every miss. Gate it against `http://127.0.0.1:8777` serving `/tmp/music-web` (a second `http.server` on another port is fine).

### ⛔ H2. HUMAN GATE. Stephen, then Fable. Not you.
1. Stephen uploads `/music/v1/PROBE.txt` (one line) to `public_html` via Hostinger File Manager.
2. Fable pushes any commit to `main` so a deploy runs.
3. `curl -sI https://lucidwinds.com/music/v1/PROBE.txt` → 200 means untracked files survive a deploy. Proceed. Anything else → plan B (a dedicated music site on one of Stephen's other two Hostinger URLs, or a GitHub Pages repo; `base` changes, nothing else does).
4. Stephen uploads the web tier as ONE zip and extracts it in File Manager.
5. Fable runs `music_verify.mjs --base https://lucidwinds.com` → green → flips `live:true` → deploys.
**Your build ends at P9 with `live:false` committed. You do not do any of this.**

---

## 8. PHASES. For each: run the gate, watch it fail, build, run it green, paste the evidence.

Before P0: `git rev-parse HEAD` → write it in the P0 box. `no_shrink` diffs against it forever after.
Start the static server once: `ss -ltn | grep -q ':8777' || (nohup python3 -m http.server 8777 --bind 127.0.0.1 >/tmp/http8777.log 2>&1 &)`; verify with `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8777/music-tracks.js` → 200.
⛔ Never `pgrep -f "http.server"` to test it: pgrep matches the shell command that contains those words, and reported "already running" against a dead port on 2026-09-02.

### P0. Ground truth
Run §2. Reconcile every number. Read `satellites/stream-hop/index.html:5232-5300`, `arcade-exit.js` (whole header), `music-tracks.js:100-152`, `play/shell.js:780-905`, `sw.js:250-300`, `scripts/music_intake.mjs`, `scripts/catalog.mjs`. Correct any moved line in this document. Create `docs/MUSIC-BUILD-LOG.md` with the P0 box.
> **P0** base commit: ______ · numbers reconciled: ______ · lines corrected in this doc: ______

### P1. Fixture + families
`music-families.json` (§6.5 verbatim). `scripts/music_fixture.mjs` (§7.2).
**Watch it fail:** run `test/music/catalog.mjs` first; it must fail for want of a fixture.
> **P1** folders: __ tracks: __ unmapped by design: __ · output: ______

### P2. Generator → catalog
`scripts/music_manifest.mjs` (§6.4, §6.6). Gate `test/music/catalog.mjs`: exact/slug/fuzzy/shared-dir/unmapped/family/stream-hop-skip each asserted BY NAME; ids stable across a title rename; `live:false` by default and `--live` only via flag; every `games[]` slug exists in `catalog()`; output parses with `vm`.
If `docs/music-intake.json` exists, ALSO run the generator on it and commit `music-catalog.js` + `docs/music-unmapped.md`. Report the unmapped list verbatim.
> **P2** gate red: ______ green: ______ · real data present? __ · real shelves: __ · unmapped: ______

### P3. The module
`music-unlocks.js` (§6). Gate `test/music/unlocks.mjs` (§6.8, every row). Then `test/music/mutants.mjs`: ten named mutations (drop the double-load guard; write ledger wholesale; skip src refresh; `>=`→`>` on rung 1; delete an entry not in catalog; use `Date.now()` for days; run the tick on rAF; throw on missing localStorage; create an `<audio>`; toast with `pointer-events:auto`), each must turn unlocks.mjs red.
> **P3** unlocks red: ______ green: ______ · mutants killed: __/10 · `node --check`: ______

### P4. Web tier + verify
§7.3, §7.4. Gate: `music_verify.mjs` green against the fixture over a local server; then deliberately delete one output file and watch it go red.
> **P4** fixture size: __ MB · verify red: ______ green: ______ · real web tier built? __ size: __ MB

### P5. The two shared edits
a. `sw.js`: insert, ABOVE the `:255` music-tracks block, a copy of that block whose condition is `url.pathname === '/music-unlocks.js' || url.pathname === '/music-catalog.js'` (sw.js already duplicates this block for word-banks.js; that is its idiom, and a pure insert keeps LAW 10 literal). Insert, ABOVE the `:293` static-assets comment: `if (url.pathname.indexOf('/music/') === 0) return;   // HANDOFF-MUSIC LAW 5: audio streams, never cached`.
⛔ PROPAGATION, or the edit reaches no one: the root worker is registered as `/sw.js?v=27` at `portal/index.html:2878` and as `sw.js?v=LW_VERSION` at `index.html:883` (fenced; Fable bumps `LW_VERSION` at deploy). Bump the portal stamp. The `/play/` pages register a DIFFERENT worker, `/play/sw.js?v=3` (`play/shell.js:857`); read it and give it the same guard if any rule of its could ever match `/music/`. Gate `test/music/sw.mjs`: load `sw.js` in `vm` with a fake `caches`/`fetch`, dispatch a fetch for `/music/v1/x/y.mp3`, assert no `cache.put`; dispatch `/music-unlocks.js`, assert it took the s-w-r path.
b. `play/shell.js`: add `function initMusicUnlocks(){ musLoadScript('/music-unlocks.js', function(){ try{ if(global.SWSMusic) global.SWSMusic.boot({ id: (global.LW_PLAY||{}).id, name: (global.LW_PLAY||{}).name }); }catch(e){} }); }` next to `initMusic`, and `try { initMusicUnlocks(); } catch (e) {}` immediately after line 901. NOT inside `initMusic` (it returns early when embedded).
⛔ PROPAGATION: `play/shell.js` is loaded as `shell.js?v=26` by 65 pages and `?v=30` by one (pre-existing drift), and `sw.js:228` caches it first-hit by that URL. Bump every `play/*.html` to the next stamp above the highest (`?v=31`) with an asserted, counted replace; `no_shrink` accepts stamp-only modifications. If you also edit `play/sw.js`, bump its `?v=3` at `play/shell.js:857` the same way.
Gate `test/music/inject.mjs` on 6 natives (`chess`, `sudoku`, `memory`, `cribbage`, `spider`, `hanoi`), each booted twice (LAW 11), with request interception serving the fixture catalog: rung 0 entry present in the ledger by id, toast element present then gone, zero new console errors, `body.children` ids unchanged except the toast. `no_shrink` green.
> **P5** sw red: ______ green: ______ · inject natives: __/6 · new console errors: __ · no_shrink: ______

### P6. The 105 satellite includes
`scripts/music_include.mjs`: reads `vendor_satellites.mjs --list`, skips those 12, and for each remaining `satellites/*/index.html` asserts exactly one `</head>` (case-insensitive), asserts the include is absent, inserts `<script src="/music-unlocks.js" defer></script>` on its own line immediately before it, asserts line count grew by exactly 1. `--dry-run` prints the plan; `--apply --batch <n>` does 15 at a time; `--check` verifies every non-vendored satellite has exactly one include and every vendored one has none.
Batches of 15. After EACH batch: `inject.mjs` on 4 satellites from that batch, `no_shrink`, the 12 vendored sha256s unchanged against `test/music/vendored_baseline.txt`, and extract every inline `<script>` of each touched file and `vm.createScript` it (a syntax error in one block kills the page; *CLAUDE.md pitfall 2*). One commit per batch.
> **P6** batches: __ · files: __/105 · vendored sha256 unchanged: 12/12 · inject sampled: __ · no_shrink: ______

### P7. UI, and LOOK
Gate `test/music/ui.mjs` at 375×667 on 3 satellites + 3 natives: toast computed `pointer-events` is `none`, height ≤ 44px, gone within 3.5s, text has no `-`/`–`/`—`, `prefers-reduced-motion` yields no transform animation. Then **screenshot each with the toast showing, open the images, and write three things wrong with them before Stephen does.** A green test is not a look. *CLAUDE.md, "Looking is part of the job."*
> **P7** ui red: ______ green: ______ · screenshots: ______ · three things wrong: 1) __ 2) __ 3) __

### P8. Docs and the standard
`docs/MUSIC-SYSTEM.md`, one page: how to add a song, how to add a shelf, how a game will claim a Tier 1 milestone later, the H2 procedure, the `live` interlock. `NEW_SATELLITE_BRIEF.md`: the include line added to the embed protocol section (additive). `_music-drop/README.md`: the two rules from §7.1 (additive).
> **P8** files: ______ · no_shrink: ______

### P9. Hand back. Then stop.
`test/music/run.mjs` all green in one run, pasted. The 12 vendored sha256s re-checked against the P0 baseline, pasted. `git log --oneline <P0>..HEAD` pasted. `music-catalog.js` committed with `live:false`. Report the branch, the last commit, the unmapped folders, and every open question you hit. **Do not deploy. Do not push to main.**
> **P9** run.mjs: ______ · vendored sha256: __/12 · commits: __ · live: false · deployed: **NO**

---

## 9. WHAT YOU MUST NOT DO
- Push to `main`. Edit `index.html`, `sunbeam-sdk.js`, `music-player.js`, `music-tracks.js`, or a vendored satellite. Rewrite any file. Delete any line of a pre-existing file.
- Play audio, create `<audio>`, touch `AudioContext`, or change what any game already plays.
- Hand-write `music-catalog.js`. Invent a track, title, shelf, mapping, or hosting path. Set `live:true`.
- Gate on wall-clock milliseconds. Use `requestAnimationFrame` for the tick. Write `[x]` before the work exists.
- Bundle, preload, or precache audio. Add `mp3` to the `sw.js` static rule.
- Wire sunbeam, earn events, or anything that changes what a game pays. That is economy, and it is Stephen's.
- Spawn agents to "figure it out." Read the files.

---

## 10. EVIDENCE LOG
Lives in `docs/MUSIC-BUILD-LOG.md`. One section per phase, the box from §8 filled with pasted output, then the commit hash that closed the phase. Append only.

## 11. RESUME PROTOCOL
If your context resets or you are asked to continue: read `docs/MUSIC-BUILD-LOG.md`. The first phase whose box is not filled with green output is where you are. Re-run that phase's gate before doing anything; if it is already green, the work exists and only the box was missing.

## 12. OPEN QUESTIONS. Ask Stephen. Never invent.
1. Family shelf names in §6.5 are placeholders he may rename. (Build with them.)
2. Which of his three Hostinger URLs hosts `/music/` if H2's probe fails. (Not blocking; `base` is one constant.)
3. Whether a game that has both its own shelf and a family shelf should unlock both at once. (Built as yes, generous; he may want it slower.)
4. Whether the toast should also fire in the portal jukebox iframe or only in top-level games. (Built as everywhere.)

## 13. FOLLOW-UPS, NOT IN THIS HANDOFF, FOR FABLE
- `index.html`: one line after `:104153` to load `/music-unlocks.js` and boot it with the app's own native ids, so in-app plays count. Needs the 100k-line file; one edit, reviewed.
- The 12 vendored satellites: include line upstream, re-vendor, `--check` CLEAN.
- Tier 1 for flagships: `SWSMusic.unlock(shelf, id)` on a milestone; Jimothy-style in-game rotation as an opt-in.
- The sunbeam gap: 41 satellites, 29 born since Aug 1. Separate handoff, separate economy call.
- Vault archive of the masters.

## 14. THE KICKOFF PROMPT
> Read HANDOFF-MUSIC.md in this repo, in full, before you touch anything. Then execute it from P0 through P9 in order, without stopping between phases, except: stop at any ⛔ marker, stop if a gate you cannot make green after three honest attempts names the test or the machine rather than your code, and stop if this document is wrong about something you cannot resolve from the files themselves. Run every gate and watch it fail before you build what it gates. Append every evidence box to docs/MUSIC-BUILD-LOG.md as you close each phase, with pasted output, not summaries. You are on branch add-sproing-jumper and you never push to main. You never rewrite an existing file; every edit is an asserted insert, and no pre-existing file may lose a line. You never touch index.html, sunbeam-sdk.js, music-player.js, music-tracks.js, or the 12 vendored satellites. You never play audio. You never invent a track, title, shelf, or mapping; anything unspecified is an open question for Stephen, not a guess. Do not spawn agents. When P9 is green, report the branch, the last commit, the full gate output, the unmapped folders, and every open question, then stop. If you are resuming, read docs/MUSIC-BUILD-LOG.md first: the first phase without a green box is where you are.
