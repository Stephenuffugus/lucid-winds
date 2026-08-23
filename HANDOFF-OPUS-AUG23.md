# HANDOFF FOR OPUS, 2026-08-23, REVISION 2 (Fable, after reading Opus's handoff)

Fable rewrote this after Opus stopped mid Task 3. Decisions that were waiting
on Fable are now MADE and written in. Opus executes; Opus does not decide.
Fable will read ONLY `git log --oneline`, gate outputs, and STATUS at the end.

Stephen's complaint, verbatim: "opus keeps getting stuck and having a good
time." So, added to the rules below: a STEP BOX per task. When the box is
spent, you write BLOCKED and stop. Being stuck is allowed. Exploring is not.

## How to run this file

- ONE task per fresh session. Finish it, append to STATUS, stop.
- Tasks run in order. Serially. One agent, one headless browser, never more.
- Each task names the ONLY files you may edit. Touching any other file is a
  rule break, even to fix something obvious. Write `FOUND:` in STATUS instead.
- Each task has a DONE command. Passing it is the whole job.
- STEP BOX: each task says how many edit-and-retest cycles you get. If the
  DONE command still fails when the box is spent, write `BLOCKED: <exact
  failing output>` and stop. Do not widen the search.
- A tool's PRINTED REMEDY is a suggestion, not an order. Before running one,
  say in one sentence what it will write. If you cannot, do not run it.
- `node x.js | tail` returns tail's exit code. Redirect to a file, read `$?`.
- All rules in `HANDOFF-SIMPLE-FIXES.md` "The rules that are not optional"
  still apply (deploy = `git push origin add-sproing-jumper:main`, caching
  law, look at screenshots, run the game's own gates, no dashes in player
  copy, Sky Wolf Studio singular, never remove a game, vendored games are
  fixed upstream, never touch Steam / payments / LW economy / index.html
  game systems / Firebase functions).
- Today: no art, no audio, no palette edits, nothing under
  `satellites/chameleon*`, no codespace deletes, no deleting files > 1 MB,
  and NO `git clean` of any kind (the parked 96 MB is ignored, `-x` eats it).

---

## Task 1: push handoff commits    ✅ DONE (Fable + Opus confirmed)
## Task 2: park the 96 MB           ✅ DONE (Opus)
## Task 3a: smoke_shells + jsdom    ✅ DONE (Opus, 66 pass 0 fail)

---

## Task 3b: fix the dice watchdog (DECIDED: marker lookup, hash only)

Background, so you do not re-derive it: `scripts/extract_inline_games.js:196`
hashes a hardcoded window `allLines.slice(65910, 66010)`. index.html grew, so
that window now covers unrelated code, and the real block starts at the line
containing `window.LW_DICE={` (68019 today; do not hardcode that either).

FILES YOU MAY EDIT: `scripts/extract_inline_games.js`,
`games/_inline/.source_hashes.json` (only via running the script),
`games/_inline/*.js` (only via running the script, plus the _dice_lib header
comment). Nothing else. STEP BOX: 4 cycles.

1. First, commit the ten already-modified `games/_inline/*.js` files ALONE
   (they are one-line header span updates, already verified harmless):
   `git add games/_inline/*.js && git commit -m "Inline-game copies: header spans follow index.html growth"`.
   Do not include `.source_hashes.json` in that commit.
2. In `extract_inline_games.js`, replace the hardcoded slice with a marker
   lookup using the file's OWN `findFunctionEnd`:
   - start = index of the line that contains exactly `window.LW_DICE={`
     (assert exactly ONE such line; if not one, BLOCKED).
   - end = the closing brace of `window._LW_diceSelect=function` found with
     `findFunctionEnd` (assert exactly one `window._LW_diceSelect=` line).
   - `span` in the JSON becomes the real start-end line numbers.
   - Keep the behaviour "hash only, never write `_dice_lib.js`". Do NOT make
     the extractor overwrite `games/_inline/_dice_lib.js`; that copy has its
     own header and this task does not decide whether to generate it.
3. Before running it, PRINT the first and last line of the block it will hash
   and read them: first must start `window.LW_DICE={`, last must be the `};`
   (or `}`) that closes `_LW_diceSelect`. If either is wrong, fix the lookup,
   do not run.
4. Run `node scripts/extract_inline_games.js`, then
   `node scripts/test_inline_drift.js` -> must print `11 in-sync, 0 drifted`.
5. Prove the probe can fail: add a space inside the live `window.LW_DICE={`
   block in index.html (LOCAL, UNCOMMITTED), run `test_inline_drift.js`, it
   must say `_dice_lib DRIFTED`. Then `git checkout index.html`. Paste both
   outputs into STATUS.
6. Update the header comment of `games/_inline/_dice_lib.js` to drop the
   stale "lines 65911-66010" and say "found by the `window.LW_DICE={` marker".
7. Diff the copy against the live block:
   `diff <(sed -n "<start>,<end>p" index.html) <(sed -n "10,\$p" games/_inline/_dice_lib.js)`
   (adjust the 10 to skip the copy's header). Do NOT reconcile. Write the
   diff size and a one-line summary of what differs into STATUS as
   `FOUND: dice copy vs live:`. Fable decides what to do with it.
8. Commit, push.

DONE when `node scripts/test_inline_drift.js > f; echo $?` is `0` and prints
`11 in-sync, 0 drifted`, the deliberate-break run in step 5 went red, and
`node scripts/smoke_shells.js > f; echo $?` is still `0`.

---

## Task 3c: power-scalers, one door not two (DECIDED: redirect)

Background: `play/index.html:40` links `/play/power-scalers.html?v=20260705h`
(stale copy, 41 dashes, a month behind). Portal and catalog link
`/satellites/power-scalers/` (current). Two doors, two different games.

FILES YOU MAY EDIT: `play/index.html`, `play/power-scalers.html`. Nothing
else. STEP BOX: 3 cycles.

1. In `play/index.html`, change that card's href to
   `/satellites/power-scalers/`. Keep the card text as is except: it must not
   contain a dash. (It currently does not; do not rewrite it.)
2. Replace the ENTIRE contents of `play/power-scalers.html` with a redirect
   page: `<!doctype html>`, `<meta charset="utf-8">`, `<title>Power Scalers</title>`,
   `<meta http-equiv="refresh" content="0;url=/satellites/power-scalers/">`,
   `<link rel="canonical" href="https://lucidwinds.com/satellites/power-scalers/">`,
   a `<script>location.replace('/satellites/power-scalers/')</script>`, and a
   one-line body `<a href="/satellites/power-scalers/">Power Scalers moved here.</a>`
   plus an HTML comment `<!-- redirect marker ps-redirect-20260823 -->`.
   The URL keeps working (never remove a game); the stale copy is gone.
3. Run `node scripts/portal_ux_check.mjs > f; echo $?` and
   `node scripts/advertised_count_check.mjs > f; echo $?`. Both 0. Run
   `node scripts/catalog.mjs` and confirm the numbers did NOT move
   (182 carded / 161 openable today). If they moved, BLOCKED.
4. Commit, push. Then probe LIVE:
   `curl -s "https://lucidwinds.com/play/power-scalers.html?probe=$RANDOM" | grep -c ps-redirect-20260823`
   must print `1`. Hostinger caching: if it prints 0, wait 60 s and retry
   twice; after that write BLOCKED with the output.

DONE when the live grep prints `1` and both gates exit 0.

---

## Task 4: LISTDLE daily proofs, eight games

Unchanged from revision 1, with one addition: STEP BOX is 3 cycles PER GAME.
A game that will not prove in 3 cycles is written UNPROVEN with the reason
and you move to the next. FILES: the game's own folder, the evidence script
it uses, `LISTDLE-DAILY-EVIDENCE.md`. Nothing else.

`LISTDLE-DAILY-EVIDENCE.md` says only meadow-weave is PROVEN; eight are
UNPROVEN. Read that file and `scripts/listdle_daily_evidence.mjs` and
`scripts/daily_determinism_generic.mjs` first.

The approach already decided: a per-game `*_DEV` hook that exposes the day's
puzzle deterministically so the proof compares PUZZLE DATA, never a canvas.

For each of the eight games, one at a time:
1. Add the `_DEV` hook (read-only exposure of the daily seed / puzzle).
2. Run the evidence script for that game twice with the same forced date and
   once with a different date.
3. Same date twice must match; different date must differ. Otherwise the
   game stays UNPROVEN and you write why.
4. Break the seed on purpose once (local, uncommitted) and confirm the script
   goes red. A probe that cannot fail is not evidence.
5. Update `LISTDLE-DAILY-EVIDENCE.md` with the command that proves it.
6. Commit, push, bump the game's `?v=` if you edited it.

DONE when every one of the nine games is PROVEN with a runnable command or
UNPROVEN with a one-line reason. None in between.

---

## Task 5: DONE-LEDGER count, explain before you edit

`DONE-LEDGER.md` says 186 carded / 162 openable (Aug 17). `catalog.mjs` says
182 / 161 today. Four cards fewer. "Never remove a game" is a rule, so the
delta needs an explanation, not a silent edit.

FILES YOU MAY EDIT: `DONE-LEDGER.md`. STEP BOX: 2 cycles.

1. `git log -p --since=2026-08-17 -- portal/index.html | grep -E "^[-+].*\{nm:"`
   and list every GAMES row added or removed. The Aug 21 Super Slice hub
   collapse is the expected cause of most of it. Paste the list into STATUS.
2. If every removed row is accounted for by a hub merge or a dev-gate, update
   the two numbers in DONE-LEDGER section 1 and the "Last updated" date.
   If any removed row is NOT accounted for, do not edit; write `FOUND:` with
   the row and stop.

DONE when `node scripts/catalog.mjs` and DONE-LEDGER section 1 print the same
two numbers, and STATUS carries the row-by-row explanation.

---

## Task 6: memory backup

```
cd /home/codespace/.claude/projects/-workspaces-lucid-winds/memory
git status -sb
```
If anything is uncommitted or ahead, commit and push (cross-repo push needs
`env -u GITHUB_TOKEN -u GH_TOKEN`). DONE when the first line is
`## main...origin/main` with no `[ahead`.

---

## Task 7: dice games, LOOK FIRST, build nothing (Stephen's new ask)

Stephen: the three dice games (Farkle, Yahtzee, Double Shutter) "could add a
lot more css and make these great." Nobody gets to decide what great means
from inside a terminal. So this task produces EYES, not code.

⛔ The dice FACES are locked art (`assets/dice/`, two sets, see memory
`feedback_dice_locked`). Anything around them (table, tray, cup, scoring
sheet, typography, motion) is the candidate surface.

FILES YOU MAY EDIT: none in the repo. Output goes to
`portal-assets/review/dice-aug23/` (new folder). STEP BOX: 3 cycles.

1. Start a server from the repo root on :8777. For each of
   `play/farkle.html`, `play/yahtzee.html`, `play/doubleshutter.html`, shoot
   412x915 dsf2 touch screenshots with `scripts/shot.mjs` (or the pattern in
   `scripts/refresh_thumb.mjs`, which hides the feedback chip first) at THREE
   moments: title, mid-game with dice on the table, and the score/end screen.
   Nine shots. Hide `.lwfb-fab` before shooting.
2. Tile them with `scripts/contact_sheet.mjs` into one labelled sheet.
3. OPEN THE SHEET AND READ IT. In STATUS, for each game, name the three
   weakest things you see in plain words (for example "dice float on a flat
   black void, no table", "score rows are 11px grey", "no motion when a die
   lands"). Describe, do not prescribe. No CSS proposals.
4. Commit the sheet + nine shots, push. Write the sheet's path in STATUS.

DONE when the sheet exists on main and STATUS has nine observations, three
per game. Stephen looks at the sheet and names the bar. Only then does a
build task get written, by Fable, one game per session, with before/after
shots as its DONE condition.

---

## Explicitly NOT for Opus today

- Siege playfield size and "why would I come back" (design).
- Spinner patterns, chocolate, rainstick (art and audio judgment).
- Jimothy art pass, the eyes. The six codespace rescues.
- Reconciling the dice copy with live (Task 3b step 7 only REPORTS it).
- Any dice CSS before Stephen has looked at the Task 7 sheet.
- Any new game, any rebuild, any rethink.

---

## STATUS (Opus appends, one line per entry, newest at the bottom)

- 2026-08-23 Fable: Task 1 DONE by the push that landed this file (server compare 08354ff0...main = 5 ahead). Opus: run the DONE command to confirm, then go to Task 2.
- 2026-08-23 Fable: Task 3 note. The brand sweep, dash sweep, and thumb re-shots in HANDOFF-SIMPLE-FIXES.md are ALREADY DONE AND LIVE (Aug 21, see DONE-LEDGER.md). Do not redo them. Task 3 is only: any queue item DONE-LEDGER does not list, plus power-scalers orphan, _dice_lib drift, smoke_shells jsdom.
- 2026-08-23 Opus: Task 1 CONFIRMED. `gh api ...compare/08354ff0...main` printed `7` / `ahead` before I touched anything.
- 2026-08-23 Opus: Task 2 DONE. `.gitignore` now parks `steamart/` and `dist/whim-jimothy/`; `store/jimothy-steam/capsules/out/app_icon_184.jpg` committed (its 49 siblings in that dir were already tracked, so it belonged). `git status --short` is empty, server compare = 8 ahead. Byte counts recorded for later verification: **steamart = 51839266 bytes, dist/whim-jimothy = 44668389 bytes**, both still on disk after the commit.
- 2026-08-23 Opus: FOUND: ignoring those two folders makes them MORE deletable, not less. `git clean -fdx` skips untracked-but-visible files only when they are not ignored; ignored paths are exactly what `-x` removes. The 96 MB now has no backup and no git protection. Noted in the .gitignore comment block too. Stephen's call on where they go; until then nobody should run `git clean -fdx` in this repo.
- 2026-08-23 Opus: NEXT SESSION = Task 3 (simple-fixes leftovers only: power-scalers orphan, _dice_lib drift, smoke_shells jsdom; brand/dash/thumb sweeps are already live per Fable's note above).
- 2026-08-23 Opus: Task 3 PARTIAL, stopped at Stephen's request for a handoff. **Full detail in `HANDOFF-FABLE-AUG23.md`.** (3a) smoke_shells jsdom DONE and pushed: 66 pass 0 fail, real exit 0; the one failure it surfaced (juniper `_cdBackCss`) was a stale harness dep list, not a game bug, and production was never affected. (3b) _dice_lib STOPPED, see below. (3c) power-scalers untouched.
- 2026-08-23 Opus: BLOCKED (needs a decision): the `_dice_lib` drift alarm is bogus. `scripts/extract_inline_games.js:196` hashes a HARDCODED window `allLines.slice(65910,66010)`; index.html grew ~207 lines so that window now covers unrelated puzzle-grid and cloneBoard code, while the real LW_DICE block sits at index.html:68019. The watchdog's own printed fix rewrites the baseline to the WRONG window and would go green forever. I ran it, saw that, and reverted `.source_hashes.json`. Fix = find the dice block by marker like the other ten. Not improvised.
- 2026-08-23 Opus: WORKING TREE LEFT DIRTY ON PURPOSE: ten `games/_inline/*.js` files carry a one-line header comment span update from that same extractor run. Correct but from a poisoned run, so uncommitted. Commit alone or `git checkout games/_inline/`.
- 2026-08-23 Opus: FOUND: `play/power-scalers.html` is NOT an orphan, it is LINKED from `play/index.html:40`, so /play/ serves a month-old 41-dash copy while the portal serves the current satellite. Worse than memory described. Not counted by catalog.mjs, so a fix should not move the advertised number.
- 2026-08-23 Opus: FOUND: DONE-LEDGER.md headline count is stale. It says 186 carded / 162 openable (Aug 17); `node scripts/catalog.mjs` says 182 / 161 today. Player copy says "160+" so nothing advertised is wrong, but the ledger is the file everyone is told to trust instead of recounting.
- 2026-08-23 Opus: FOUND: package.json + package-lock.json are gitignored BY DESIGN, so no dev-dep declaration travels; a fresh codespace has neither jsdom nor puppeteer and 67 scripts need puppeteer. workspace.sh installs nothing. Prerequisite recorded in smoke_shells.js header; whether workspace.sh should npm-install is ⚖ Stephen's.
