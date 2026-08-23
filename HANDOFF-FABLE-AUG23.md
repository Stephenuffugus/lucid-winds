# HANDOFF TO FABLE — 2026-08-23, mid Task 3

Written by Opus. Stephen asked for this hand-off mid-task, so Task 3 is
**stopped in a known state, not finished**. Server is at `main` = 10 ahead of
`08354ff0`. Everything committed is pushed and live.

## Where the board stands

| Task | State |
|---|---|
| 1. push handoff commits | ✅ done and server-confirmed |
| 2. park the 96 MB | ✅ done and pushed |
| 3. simple-fixes leftovers | 🟡 1 of 3 done, 1 blocked on a decision, 1 untouched |
| 4. LISTDLE proofs | ⬜ not started |
| 5. memory backup | ⬜ not started |

Queue items 1 to 4 inside `HANDOFF-SIMPLE-FIXES.md` were all already finished
on Aug 21, including the feedback-fab sweep, whose answer was "no mounts
changed, and that is the answer." So Task 3 really is only the three leftovers.

---

## 3a. smoke_shells jsdom — ✅ DONE, pushed

Installed jsdom, suite runs, **66 pass 0 fail, real exit 0**.

Running it surfaced one failure: `juniper` threw `_cdBackCss is not defined`.
**That was a harness bug, not a game bug.** Garden Rummy became a card game in
the Aug 21 card-kit pass but its harness entry was still a bare string with no
deps. `play/juniper.html:35` has loaded `/games/_cards.js?v=4` all along, so no
player ever hit it. I cross-checked all 12 `_cd*` users: every shell page loads
`_cards.js` and every other entry declares the dep. juniper was the only gap.

⛔ Two traps I walked into and you should expect to walk into:
- `node smoke_shells.js | tail` printed `EXIT=0` while the suite was RED. That
  is tail's exit code. It is listed in DONE-LEDGER and it still caught me.
  Redirect to a file, read `$?`, then grep the file.
- I watched this suite go red and then green, so it is not decoration.

**⚖ FOR STEPHEN:** `package.json` and `package-lock.json` are gitignored **on
purpose** (.gitignore lines 3 to 9: no build system, dev tools installed per
codespace). So no dependency declaration can travel. A fresh codespace has
neither jsdom nor puppeteer, and **67 scripts in `scripts/` require puppeteer**.
`workspace.sh` does not install anything. I recorded the prerequisite in
`smoke_shells.js`'s header rather than change that deliberate decision. If
codespaces keep getting rebuilt, a `npm i` line in `workspace.sh` is the fix,
but it is his call, not mine.

---

## 3b. _dice_lib drift — 🛑 STOPPED. The watchdog is broken, do not "resync" it.

This one matters. **The alarm is not about the dice lib at all.**

`scripts/extract_inline_games.js:196` hashes a **hardcoded line window**:

```js
diceBlock = allLines.slice(65910, 66010);   // "lines 65911-66010"
```

index.html has grown since that number was written. Every real game span moved
about 207 lines (farkle 67914 → 68121). The window did not move with them.

- The **real** dice lib (`window.LW_DICE={` … `window._LW_tumble=`) now lives at
  **index.html:68019** onward.
- **Lines 65911-66010 today contain unrelated code**: a puzzle-grid rotation
  function and a chess `cloneBoard`. I read them.
- So `_dice_lib DRIFTED baseline=3382 vs live=6718` means "the window slid onto
  denser unrelated code", not "the dice lib changed".

⛔⛔ **The watchdog's own printed fix makes it worse.** It tells you to run
`node scripts/extract_inline_games.js`. I did. It rewrote the baseline to the
hash of the WRONG 100 lines, which would turn the watchdog green forever while
it guards code nobody cares about. A probe that cannot fail. **I reverted that
file** (`git checkout games/_inline/.source_hashes.json`).

Also worth knowing: the extractor **never writes** `games/_inline/_dice_lib.js`.
It only hashes. That copy is hand-maintained and has never been regenerated.
Live block at 68019 is ~5633 bytes; the copy is 7100 bytes. They are not the
same and I did not get far enough to say which is newer or whether the
standalone dice games are missing anything.

**The fix is to make the dice block found by MARKER like the other ten**, not by
line number, then compare and unify. That is a real change to a verification
tool, so I stopped rather than improvise it.

### ⚠ Working tree is dirty, deliberately

Ten files modified, uncommitted:
`games/_inline/{backgammon,bloomwheel,checkers,doubleshutter,farkle,mastermind,picross,reversi,sokoban,yahtzee}.js`

Each is **a one-line header comment** updating the recorded line span
(`lines 67914-68276` → `68121-68483`). Harmless and correct, but they came from
the same extractor run as the bad baseline, so I left them uncommitted rather
than split a poisoned run. Either commit them alone or
`git checkout games/_inline/` to clear the decks. Nothing else depends on them.

---

## 3c. power-scalers — ⬜ NOT STARTED, and it is not an orphan

Memory calls `play/power-scalers.html` a stale orphan. **It is not orphaned, it
is linked**, which makes it worse than described:

- `play/index.html:40` → `href="/play/power-scalers.html?v=20260705h"` (the
  **stale** copy: 186738 bytes, 41 dashes, a month behind)
- `portal/index.html:1147` and `index.html:63536` → `/satellites/power-scalers/`
  (the **current** copy: 200594 bytes, already dash-clean)

So a player who arrives through /play/ gets a different, older game than one who
arrives through the portal. It is **not** counted by `scripts/catalog.mjs` (that
reads `var GAMES =` in portal/index.html; the /play/ card is a hand-written
anchor), so fixing it should not move the advertised count, but re-run
`advertised_count_check.mjs` to be sure.

Cleanest fix, unstarted: point `play/index.html` at `/satellites/power-scalers/`
and turn `play/power-scalers.html` into a redirect, so the URL keeps working
(never remove a game) and drift becomes impossible.

---

## FOUND, outside every task

- **DONE-LEDGER.md's headline count is stale.** It says `186 carded / 162
  openable`, last updated Aug 17. `node scripts/catalog.mjs` today says
  **182 carded / 161 openable** (115 satellite + 67 native, 21 gated). Live copy
  says "160+" so nothing player-facing is wrong, but the ledger is the file
  everyone is told to trust instead of re-counting.
- **Ignoring the 96 MB made it more deletable, not less** (Task 2). `git clean
  -fdx` targets ignored paths. `steamart/` (51839266 bytes) and
  `dist/whim-jimothy/` (44668389 bytes) have no backup and no git protection.
  ⚖ Still waiting on where they should live.

---

## What I would do next, in order

1. Decide the `_dice_lib` watchdog fix (marker-based lookup), then unify the
   copy and run `smoke_shells` + the dice games' gates.
2. power-scalers redirect. Small, self-contained, real player-facing win.
3. Re-run `portal_ux_check.mjs` + `advertised_count_check.mjs` to close Task 3.
4. Then Task 4 (LISTDLE) and Task 5 (memory), which are untouched.
