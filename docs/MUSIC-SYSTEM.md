# The soundtrack unlock system, in one page

Built 2026-09-02 (HANDOFF-MUSIC.md, `docs/MUSIC-BUILD-LOG.md`). Every game hands the player songs from its shelf;
every song lands in the studio player under a shelf named after the game. No game's logic changed. No game plays the audio.

## The pieces
| File | What it is |
|---|---|
| `music-unlocks.js` | the shared module, one ES5 IIFE, included by every game. Knows its game, counts visible seconds / days / sessions, grants tracks, shows one inert 3s toast after the player's first tap. Never plays audio. |
| `music-catalog.js` | GENERATED. Shelves and tracks. `live:false` until the audio is verified on the host. Never hand edit. |
| `music-families.json` | family shelf names (Card Room, Table Games, …) keyed by the catalog's `cat`; folder aliases. Rename `name`s freely. |
| `scripts/music_intake.mjs` | Stephen's zip in `_music-drop/` → moved to /tmp, probed → `docs/music-intake.json` |
| `scripts/music_manifest.mjs` | intake → `music-catalog.js` + `docs/music-unmapped.md`. Folder names resolve or REFUSE. Ids never change. |
| `scripts/music_web_tier.mjs` | catalog + intake → `/tmp/music-web/music/v1/<shelf>/<file>.mp3` (128k where needed) + SHA256SUMS |
| `scripts/music_verify.mjs` | every catalog URL answers 200 + `audio/` + right length, or exit 1 |
| `scripts/music_include.mjs` | the include line in every non-vendored satellite, by assertion; `--check` |
| `test/music/run.mjs` | every gate in order: catalog, unlocks, mutants, sw, no_shrink, inject, ui |

## How a song gets to a player
1. Stephen drops a zip in `_music-drop/` (one folder per game; `01 `, `02 ` prefixes set the order; a folder named `Card Games` etc. becomes a family shelf). `node scripts/music_intake.mjs`.
2. `node scripts/music_manifest.mjs` → `music-catalog.js` (live:false) + `docs/music-unmapped.md`. Rename any unmapped folder to the game's exact arcade name and re-run. Ids for existing tracks are preserved.
3. `node scripts/music_web_tier.mjs` → `/tmp/music-web/`. Stephen uploads `music/` into the host's web root as one zip + extract (**H2 in the handoff: probe with a 1KB file first**).
4. `node scripts/music_verify.mjs --catalog music-catalog.js --base https://lucidwinds.com --local /tmp/music-web` → green.
5. `node scripts/music_manifest.mjs --live` → `live:true`. Commit. Deploy (`git push origin add-sproing-jumper:main`, Fable/Stephen only).

## The ladder (Tier 0, all passive, tunable in `music-ladder.json`)
Track `i` opens when ANY holds: visible seconds ≥ `secsPer·i` (120) · calendar days ≥ `1 + daysPer·i` · sessions ≥ `sessionsBase + i` (2) · on a FAMILY shelf, distinct games of that family opened ≥ `1 + breadthPer·i` ("the more card games you try, the more you unlock"). Track 0 is free on opening. Edit the JSON, run `scripts/music_manifest.mjs`, done; the module reads the numbers from the catalog.
A game in a family (card, board, …) unlocks the family shelf on top of its own shelf if it has one.

## What the generator does with a messy drop
Folder names resolve exactly, by slug, by family alias, by a unique contains hit either way, or by an entry in `music-folder-aliases.json`; else UNMAPPED and reported. A subfolder inside a game folder maps to the game and becomes a `note` on the track (`Pit bike rally/Menu and shop song/…`). Byte-identical files on one shelf are skipped (Drive duplicates, double exports); a loose root file that duplicates a shelved one is reported as such. `01 `, `02 ` prefixes order tracks and are stripped from titles.

## Tier 1, for a game that wants a real milestone (not built into any game yet)
`SWSMusic.unlock('<shelf slug>', '<track id>')` grants that track and toasts. Ids are in `music-catalog.js`. One line, on the event.

## Things that must not drift
- **Propagation.** `play/shell.js` is loaded as `shell.js?v=N` by 66 pages; `/play/sw.js` is registered `?v=N` from shell.js and has a `CACHE` name; the root worker is `/sw.js?v=N` in the portal and `?v=LW_VERSION` in the app. Change any of those files, bump its stamp, or nobody gets it.
- **The service workers never cache `/music/`.** Both have a guard; `test/music/sw.mjs` proves it, including against a regex edit.
- **The 12 vendored satellites have no include.** Their line goes upstream, then re-vendor. Until then they earn nothing.
- **In-app plays inside `index.html` do not count yet.** One line after `index.html:104153` (fenced; Fable's follow-up).
- **The ledger `sws_game_unlocks` is never shrunk.** Read-modify-write, merge by id. A removed catalog track leaves the player's entry alone.
- **No dashes in anything a player reads.** Shelf names, titles, toast text.
