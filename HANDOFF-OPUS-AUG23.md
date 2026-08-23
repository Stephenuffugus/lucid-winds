# HANDOFF FOR OPUS, 2026-08-23 (next twelve hours)

Written by Fable for Opus. Fable is nearly out of budget and will read ONLY
`git log --oneline`, gate outputs, and the STATUS block at the bottom of this
file when it reviews. Opus does every keystroke in between.

## How to run this file

- ONE task per fresh session. Finish it, update STATUS, stop. Do not start
  the next task in the same session.
- Tasks run in order. Serially. Never more than one agent or one headless
  browser at a time (two-core box; agents starve each other and gates lie
  under contention).
- Each task has a DONE command. When it passes, commit, push, write one
  line in STATUS, and STOP. Passing the DONE command is the whole job.
- Anything you notice outside the task goes in STATUS as a one-liner,
  prefixed `FOUND:`. You do not fix it. Not even if it is a one-line fix.
- If a task cannot be completed as written, write `BLOCKED: <why>` in
  STATUS and stop. Do not improvise an alternative.
- All rules in `HANDOFF-SIMPLE-FIXES.md` section "The rules that are not
  optional" apply here unchanged (deploy = `git push origin
  add-sproing-jumper:main`, caching law, look at screenshots, run the game's
  own gates, no dashes in player copy, Sky Wolf Studio singular, never remove
  a game, read DONE-LEDGER.md before any sweep, never hand-edit vendored
  games, never touch Steam / payments / the Lucid Winds economy /
  index.html game systems / Firebase functions).
- Additionally for today: do not touch art or audio (no sprite, eye, SVG
  art, sound design, or palette edits). Do not touch anything under
  `satellites/chameleon*`. Do not delete a codespace. Do not delete
  any file larger than 1 MB.

---

## Task 1: push the four handoff commits to main

Local `add-sproing-jumper` is at `9edbd2db`, origin/main is at `08354ff0`.
The four commits between them are codespace-handoff docs and are not live.

```
git push origin add-sproing-jumper:main
```

DONE when the SERVER agrees (the clone is shallow; never trust local
ahead/behind counts, see `feedback_shallow_clone_fakes_unpushed_commits`):

```
gh api repos/Stephenuffugus/lucid-winds/compare/08354ff0...main --jq '.ahead_by, .status'
```
must print `4` (or more, never less) and `ahead`.

---

## Task 2: park the 96 MB of untracked files

`git status` shows three untracked items: `steamart/` (50 MB, already
submitted to Valve), `dist/whim-jimothy/` (46 MB, a build output), and
`store/jimothy-steam/capsules/out/app_icon_184.jpg`.

Stephen decides where the two big folders live. Until he says, they do NOT
go into this repo (size). Your job is only to stop them showing as noise and
to make sure nothing can delete them by accident:

1. Append `steamart/` and `dist/whim-jimothy/` to `.gitignore` with a
   comment `# parked 2026-08-23, backup location pending Stephen`.
2. `git add store/jimothy-steam/capsules/out/app_icon_184.jpg` (small,
   belongs with the other capsules) and commit it with the .gitignore change.
3. Write the exact byte counts of both folders
   (`du -sb steamart dist/whim-jimothy`) into STATUS so a later session can
   verify nothing was lost.
4. Push.

DONE when `git status --short` prints nothing and the compare command from
Task 1 shows the new commit on main.

---

## Task 3: the simple-fixes queue

Open `HANDOFF-SIMPLE-FIXES.md` and work its queue exactly as written, top
to bottom, one commit per batch, push each. Skip any item its own text says
is already done. Check `DONE-LEDGER.md` first so you do not redo finished
items.

Also in scope, from the open list in memory (verify each is still real
before touching it; if it is not, say so in STATUS):
- `power-scalers.html` orphan (not linked from any portal card or shell).
- `_dice_lib` drift between copies (diff them; unify to the newest, run the
  affected games' gates).
- `smoke_shells` needs jsdom to run (make it run, or write `BLOCKED`).

DONE when `node scripts/portal_ux_check.mjs` and
`node scripts/advertised_count_check.mjs` both pass, every touched game's
own gate passes, and each fix is on main.

---

## Task 4: LISTDLE daily proofs, eight games

`LISTDLE-DAILY-EVIDENCE.md` says only meadow-weave is PROVEN; eight are
UNPROVEN. Read that file and `scripts/listdle_daily_evidence.mjs` and
`scripts/daily_determinism_generic.mjs` first.

The approach already decided: a per-game `*_DEV` hook that exposes the
day's puzzle deterministically so the proof compares PUZZLE DATA, never a
canvas (canvas hashing compares animation phase and was the false proof
last time).

For each of the eight games, one at a time:
1. Add the `_DEV` hook (read-only exposure of the daily seed / puzzle).
2. Run the evidence script for that game twice with the same forced date
   and once with a different date.
3. Same date twice must match; different date must differ. Otherwise the
   game stays UNPROVEN and you write why.
4. Update `LISTDLE-DAILY-EVIDENCE.md` with the command that proves it.
5. Commit, push, bump the game's `?v=` if you edited it.

A probe that cannot fail is not evidence: before trusting a PROVEN, break
the seed on purpose once (local, uncommitted) and confirm the script fails.

DONE when every one of the nine games is either PROVEN with a runnable
command in the evidence file, or UNPROVEN with a one-line reason. Do not
leave any in between.

---

## Task 5: memory backup

```
cd /home/codespace/.claude/projects/-workspaces-lucid-winds/memory
git status -sb
```
If anything is uncommitted or ahead, commit and push (cross-repo push needs
`env -u GITHUB_TOKEN -u GH_TOKEN`, see `reference_cross_repo_push`).

DONE when `git status -sb` first line is `## main...origin/main` with no
`[ahead` marker.

---

## Explicitly NOT for Opus today (Fable or Stephen only)

- Siege playfield size and "why would I come back" (design, not CSS).
- Spinner patterns, chocolate, rainstick plink (art and audio judgment).
- Jimothy art pass, anything about the eyes.
- The six codespace rescues (`HANDOFF-CODESPACES.md`); the token is
  read-only from inside a codespace anyway.
- Any new game, any rebuild, any rethink.

---

## STATUS (Opus appends, one line per entry, newest at the bottom)

- 2026-08-23 Fable: Task 1 DONE by the push that landed this file (server compare 08354ff0...main = 5 ahead). Opus: run the DONE command to confirm, then go to Task 2.
- 2026-08-23 Fable: Task 3 note. The brand sweep, dash sweep, and thumb re-shots in HANDOFF-SIMPLE-FIXES.md are ALREADY DONE AND LIVE (Aug 21, see DONE-LEDGER.md). Do not redo them. Task 3 is only: any queue item DONE-LEDGER does not list, plus power-scalers orphan, _dice_lib drift, smoke_shells jsdom.
- 2026-08-23 Opus: Task 1 CONFIRMED. `gh api ...compare/08354ff0...main` printed `7` / `ahead` before I touched anything.
- 2026-08-23 Opus: Task 2 DONE. `.gitignore` now parks `steamart/` and `dist/whim-jimothy/`; `store/jimothy-steam/capsules/out/app_icon_184.jpg` committed (its 49 siblings in that dir were already tracked, so it belonged). `git status --short` is empty, server compare = 8 ahead. Byte counts recorded for later verification: **steamart = 51839266 bytes, dist/whim-jimothy = 44668389 bytes**, both still on disk after the commit.
- 2026-08-23 Opus: FOUND: ignoring those two folders makes them MORE deletable, not less. `git clean -fdx` skips untracked-but-visible files only when they are not ignored; ignored paths are exactly what `-x` removes. The 96 MB now has no backup and no git protection. Noted in the .gitignore comment block too. Stephen's call on where they go; until then nobody should run `git clean -fdx` in this repo.
- 2026-08-23 Opus: NEXT SESSION = Task 3 (simple-fixes leftovers only: power-scalers orphan, _dice_lib drift, smoke_shells jsdom; brand/dash/thumb sweeps are already live per Fable's note above).
