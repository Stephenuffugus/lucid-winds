# HANDOFF TO OPUS: TUMBLE BUILD 2, "POCKET CHANGE" (written by Fable, 21 Sep 2026)

Stephen's words: "youre going to want to meticulously plan this build for opus if it can do the work and then you
check its work when its done". You are building, not designing. **The spec is `/plans/tumble/exp1/DESIGN-T2.md`.**
Fable reviews your work before it is published to Play.

## 1. Read, in this order, before you touch anything

1. `/plans/tumble/exp1/DESIGN-T2.md`, all of it. Section 0 lists five things the outside answers got wrong about this
   code; they are why the spec looks the way it does.
2. `satellites/tumble/DESIGN.md` §5, §7 to §9 and §13.6 (the generator, heroes, the economy, the save).
3. `satellites/tumble/HANDOFF.md` and `DECISIONS.md` (what was built and why), then `src/economy.js`, `src/save.js`,
   `src/session.js`, `engine/sockgen.js`, `src/room.js`.
4. You do NOT need the four reports in `/plans/tumble/exp1/reports/` (770 KB). When the spec says "take GPT 1's list
   F5", query `/plans/tumble/exp1/all-ideas.json` (one object per idea: `src lane kind title data why`) with a short
   node script instead of reading prose. `src` is `GPT-5.6-Sol` (GPT 1), `GPT-5.6-Sol-2`, `Grok`, `Grok-2`.

## 2. The order, the stop lines, the deploy lines

**Phase 0 → 1 → DEPLOY → 2 → DEPLOY → 3 → DEPLOY → 4 → DEPLOY → 5 → 6 → 7 → 8 → DEPLOY.** One `[ ]` at a time; tick
it in the design file in the same commit, with one line under it if what you built differs from what was written.
You may stop, green and pushed, after any ticked line. Never stop mid line (a `wip/` branch if you must).
**Phase 1 ships ALONE first.** It is small and it is the whole answer to "we dont seem to get quarters".
**One phase per session is a good session.** Do not run this build as a many agent workflow: Stephen's usage for the
week is limited and this is careful single file work. The one exception is authoring the sixty hero recipes (phase
4.1), which went well last time as a few parallel authors each LOOKING at their own sheet, in a scratch COPY of the
game folder on `/tmp` (⛔ never a git worktree: the repo does not fit twice on this disk).

## 3. The laws (each one has already cost a day on this game)

1. **Every deploy bumps the version in THREE places** (`sw.js`, `src/config.js`, `index.html`: a test enforces they
   match) **and the portal card's `?v=`** in `/portal/index.html`.
2. **Every module the game imports is in the worker's PRECACHE** (`tests/sw.test.mjs` walks the imports and fails if
   one is missing: a missing file is a dead offline launch for a Play reviewer). New data files go in too.
3. **A gate you have not watched FAIL is decoration.** Red first, then green. Every fixture gets a mutation.
4. **Never a fixed wait in a browser gate.** The software renderer here runs near 1 fps and slower when the machine is
   busy. Assert the state change at once, then wait for the SETTLED value (`dev/gate-pick.mjs` is the pattern).
   A check that can skip itself is not a check.
5. **One browser at a time, and only on a quiet machine** (`uptime`: load under 2). On 21 Sep gate step 3 failed six
   checks on unchanged code at load 6. `pgrep -f` matches your own shell: write `[n]ode ...`.
6. **Looking is part of the job.** Every visual line ends with shots at 412x915 and 360x740, opened, three faults named.
7. **The permanent seed.** `tests/golden-seeds` (phase 0.2) passes unchanged at the end of every phase.
8. **One save version for the whole build** (v3, phase 1.4). `save-check`, the migration test and
   `tests/unlockall.test.mjs` stay green.
9. **The law of a comfort** (in the design). If a find or a peg would point at the twin, touch a clock or a payout, or
   work in Rush or the Daily: it does not ship, whatever the design says.
10. **No brand, team, band, character or near miss** in any name, flavor line or emblem. Run the check on every one.
11. Copy: sentence case, no dashes, no exclamation points, nine words or fewer in a flavor line. ⛔ Audio never in git.
12. `git add` by path, never `-A`. Commit AND push after every ticked line: the BRANCH
    (`git push origin add-sproing-jumper`) and then main (`git push origin add-sproing-jumper:main`), after
    `git fetch && git log HEAD..origin/main` shows nothing. Deploy = that push; then grep the LIVE html for the stamp
    and run `node dev/probe-live.mjs`. The system clock is UTC; Stephen is US Eastern.
13. Tester access for Stephen is Settings > Tester > Open everything (`src/unlockall.js`). When the save grows new
    fields, `grantEverything` grows with it (all finds, a full jar), and its test says so.

## 4. When the design and the code disagree

The design was written against the code at `20260921c`, read, not run. Expect some lines to need a small change.
1. Keep the SENTENCE the design is after and say it with what the code has.
2. If it cannot be done, the line becomes `[-]` with the reason. **Do not add a currency, a save version, a slot, a
   trigger of rewards or anything sold that the design does not contain.**
3. Things Fable did NOT verify, which you must before building on them: how a Session reports a flip and the dryer
   door opening (the coin moments hang on them) · whether the hero emblem painter can paint onto a small plain tile
   for finds · where `rugTexture` and `windowView` live and what they take · how a seed string is encoded, and the
   smallest version mark old seeds cannot collide with · whether the wallet pill can show a coin landing without a
   layout shift at 360 wide · what `?low` really turns off today.

## 5. When you finish a session

`satellites/tumble/HANDOFF.md` gains a section in the shape of the existing ones: what she will find, what you SAW in
the pictures (three faults each), what was wrong that nobody had reported, every `[-]` and why, the economy numbers
from the test, and what is next. Then `/START-HERE.md` gets one line. Fable reviews before the Play listing.

---

## THE START PROMPT (Stephen pastes this into a fresh Opus session opened in `/workspaces/lucid-winds`)

Read satellites/tumble/HANDOFF-OPUS-T2.md from top to bottom, then every file its section 1 lists, in that order,
before you change anything. Then build TUMBLE Build 2 exactly as plans/tumble/exp1/DESIGN-T2.md says: phase 0 first
(tests green, a quiet machine, the golden seeds test recorded before sockgen is touched), then phase 1 alone, and
deploy it. One line at a time: its test watched red then green, npm test, the golden seeds unchanged, the box ticked
in the design file, commit, push the branch and main. Browser gates one at a time, only with the machine's load under
2, never a fixed wait. Look at every picture and name three faults. Do not add anything the design does not contain;
where the code cannot say a line, follow section 4. No agent workflow except for authoring the hero recipes in phase
4. Stop only at a stop line, green and pushed, with HANDOFF.md updated.
