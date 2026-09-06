# HANDOFF, OPUS TAKES OVER FROM FABLE, Sep 06 2026 evening

**Written by:** Fable, at 15:00 UTC on Sep 06, with the session's context nearly spent and a
codespace reset an hour away.
**For:** the next Opus session (or Fable after the reset), to continue building the twelve
games without losing a step.
**Branch:** `add-sproing-jumper`. Everything below is committed AND pushed, and `main` is
level with the branch (Hostinger deploys main). Nothing is only in a working tree.

---

## 0. THE FIRST FIVE MINUTES ON A FRESH BOX

1. `cd /workspaces/lucid-winds && git status --short | grep -v '^??' | grep -v docs/shots`
   must be empty apart from `.claude/scheduled_tasks.lock` and the Conduit shots. If a builder
   left uncommitted work in `satellites/gerplunk` or `satellites/updraft`, read the diff before
   touching it; it was mid step when the lead's session ended.
2. `df -h /` at least 2 GB free. `ls ~/.cache/puppeteer/chrome` lists a version.
3. `(python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 &)` from the repo root.
4. Memory backup: `~/.claude/projects/-workspaces-lucid-winds/memory` is a git clone of the
   private repo `Stephenuffugus/sws-memory`; pull it first on a new box, push after every session.
5. Read, in this order: this file; `HANDOFF-FABLE-REVIEW-SEP06.md` (the two review notes at the
   top); `docs/DIRECTOR-CALLS-SEP06.md` (the one list for Stephen); `HANDOFF-OPUS-NIGHT-SEP05.md`
   section 5 (the twelve row table, annotated) and section 6 (the review ritual).

## 1. WHERE THE TWELVE STAND (all twelve LIVE on the arcade, beta, In Development tab)

The arcade door: Browse all, then the In Development tab, or the Test Lab door on the front
page. Beta rows never appear on public shelves (`portal/index.html` ~1790). Stephen opens them
with `localStorage.sws_dev_ok=1` on his phone.

| game | stamp live | built today on top of DONE P3 | next action (the plan's SESSION STATE names it exactly) |
|---|---|---|---|
| Fathom | 20260906e | OCCLUSION (design 11): a ping lights what the sound reaches; caught screen keeps cyan | world scale halving is a Director call; nothing half built |
| Asterism | 20260906e | almanac rows fixed; myth sheet capped at 64 percent; poster preview 360 px | the six anchor myths are Stephen's |
| Swell | 20260906d | first line off the chip; mood picker says PLAYING | his ear on the wav |
| Wardian | 20260906d | caption clear of the jar on short phones; a once only line when the pouch can plant | the quiet fortnight is a Director call |
| Doohickey | 20260906d | TEN levels (four on the upper board), tile is The Zigzag | nothing half built; more levels are cheap, see the scratch tracer method in the review note |
| Airworthy | 20260906d | THROW AGAIN fits at 320; the Canyon and the Stadium, courses 3 and 4, four challenges with measured medals | play the canyon on a phone; shorten the first ridge if the 10.9 s hang is dull |
| Windup | 20260906d | two clock lookahead scheduler for auto play; three printed papers; ribbon caption nudged (gates queued at 15:00, see 3) | Stephen presses PLAY and listens; print a strip |
| Inkswing | 20260906d | THE DOUBLE LINK: RK integrator at 240 Hz, 99 sim assertions, opens at twelve drawings | his call on `DOUBLE_LINK2` (whether link 2 should be wilder); just intonation is the big call |
| Gerplunk | 20260906d or e | P2: pebble bed by career, records on the bank, three faces of the lake with land drawn, beached click, DAILY (five throws, the card, share by link, `test/daily.mjs`) | plan section 5 P3; SESSION STATE has the exact step; a builder was mid edit at 14:57, check `git status` |
| Whistlestop | 20260906e | puzzles 3 to 5, bump names both trains, rug fills a tall phone, whistle on the tray corner, red line bends down | one more straight after the red curve, then centre the portrait fit on the railway (SESSION STATE) |
| Updraft | 20260906d or e | P2: mood screen, journal, five kites with feat unlocks, haptics, landing flourish, Mabel's mark; P3: Real Wind behind a toggle that defaults OFF | the Daily Wind and the tally, then settings; a builder was mid edit at 14:57, check `git status` |
| Strata | 20260906e | MAKE A PLATE (1080x1350 museum card shared as a file); framed plates on the hall wall on tall phones | the fifty bone crate is a Director call; the journal and rename are unbuilt |

Every claim above was gated: each game's `node tools/check.js` printed ALL GATES PASSED at the
stamp shown, run by Fable or by the builder that made it, and the builders' claims for
Airworthy, Windup, Gerplunk, Whistlestop, Strata, Wardian and Fathom were re run by Fable.

## 2. THE LAWS THAT HELD TODAY (keep them)

- **One stamp per game in three places:** `var STAMP`, every `?v=` in the head, and sw.js
  `SHELL_VERSION`. Each game's lint checks it. Any edit to a versioned asset, and any edit to
  `music-unlocks.js`, means the next letter in every game that includes it.
- **Deploy** = `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is
  empty, then `curl -s "https://lucidwinds.com/<path>?probe=$RANDOM" | grep -c <marker only the
  new build has>`. The portal thumb stamp `?v=` must change when a thumb changes.
- **Two cores:** every Chrome run under `flock -w 1800 /tmp/sws-gate.lock node <cmd>`; wrap the
  whole flock in a `timeout` LONGER than the queue (a `timeout 120` around a flock that waits
  three minutes dies silently with no output; use 900).
- **Builders in one tree:** `git add` fenced paths only, never pull/rebase/push/stash inside a
  builder; the lead pushes. A builder that "stops with time to spare" gets a message naming the
  next step. Nudging works; two builders finished twenty minutes early twice today.
- **Look before gate:** every layout change is shot at 412x915 and 375x667 and OPENED before
  its gate runs. The Whistlestop builder that gated first reverted its own work; the one that
  shot first landed it.
- **Counts hardcoded in gates:** six levels, two puzzles, three rigs. Widen them when adding
  content, or the suite goes red on the new content.
- **Copy:** no dashes, no exclamation points, Sky Wolf Studio singular, no economy claims, 0.7 rem
  minimum text, 48 px targets by elementFromPoint, bottom left 120x120 for the music chip.

## 3. LOOSE ENDS AT 15:00 UTC (small, none blocking)

- Windup: the ribbon caption nudge (`clamp(ex, 70, V.W - 96)`) is committed only if
  `satellites/windup/index.html` is clean in `git status`; its gift and layout gates were queued
  at 14:55 into `scratchpad/gates-windup.txt`. If uncommitted: run `node tools/lint.mjs`, then
  the two gates, then commit with stamp 20260906e in all three places.
- Gerplunk: the last builder commit `f727ddc8` (DAILY, the card, share by link, hidden buttons that rendered because `.btn{display:block}` beat `hidden`) was committed WITHOUT rerunning the seven browser gates, the lock was busy. First thing: `cd satellites/gerplunk && flock -w 1800 /tmp/sws-gate.lock node tools/check.js`, fix what is red, then P3 step 1.
- Windup's caption nudge landed: gift and layout gates green, stamp 20260906e.
- Gerplunk and Updraft builders were told to stop and commit at 14:56. If their fences show
  uncommitted edits, read the diff, run `sim.js --test` and lint, and commit only what is green.
- Fathom's arcade tile was shot before occlusion; it still reads. Reshoot with
  `node tools/thumb.mjs` under the lock if the shelf wants the occluded look.
- The fly gate in Updraft flakes on the "kite at rest" assertion under the swiftshader tap is a
  hold race; two passes alone is a pass. A real fix is to read the rest flag before the tap
  lands, not after.

## 4. WHAT TO BUILD NEXT, IN ORDER (value on Stephen's phone)

1. Gerplunk P3 and Updraft's Daily Wind: both plans, section 5, from SESSION STATE.
2. Strata: the journal and rename (plan section 5 P3), and the crate grouped by kind if
   Stephen picks that in the one list.
3. Whistlestop: the last two fit steps in SESSION STATE, then puzzle 6 (Swap needs a passing
   loop, not a dead end siding; DECISIONS says why).
4. Doohickey: more upper board levels with the scratch tracer method (a marble traced every
   quarter second against the real sim, then `--solve`).
5. Fathom: only if Stephen chooses it, the world scale halving (12 unit tiles, 60 by 100).
6. Any Director call in `docs/DIRECTOR-CALLS-SEP06.md` he answers.

## 5. THE PROMPT TO PASTE INTO OPUS

```
You are Claude Opus, continuing the twelve game build for Sky Wolf Studio in the lucid-winds
repo at /workspaces/lucid-winds on branch add-sproing-jumper. Read
HANDOFF-OPUS-TAKEOVER-SEP06.md whole, then do its section 0, then take section 4 in order, one
game at a time, each to its plan's gates (plans/<game>/HANDOFF-<GAME>.md, SESSION STATE first).
The laws in section 2 are absolute. You may run one or two fenced builder agents for
independent games while you work on another; give each a hard stop, fenced git add, no
pull/push, flock around Chrome, shoot before gate. Commit after every green subsystem, push
add-sproing-jumper AND add-sproing-jumper:main after every commit, verify live by curl for a
marker only the new build has, and update each plan's SESSION STATE and the spine's row before
you stop. Stephen tests on a 412x915 Pixel from the arcade's In Development tab.
```

## 6. WHERE THE EVIDENCE LIVES

- Each game: `satellites/<game>/docs/shots/` (opened, under 200 KB), `docs/DECISIONS.md`,
  `plans/<game>/HANDOFF-<GAME>.md` sections 13 and 15.
- The review: `HANDOFF-FABLE-REVIEW-SEP06.md` (two notes at the top).
- The one list for Stephen: `docs/DIRECTOR-CALLS-SEP06.md`.
- Memory: `project_twelve_review_sep06.md` in the memory repo, and the index line under HOT.
