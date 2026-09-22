# HANDOFF TO OPUS: TUMBLE BUILD 2, THE MORNING AFTER (written by Fable, 22 Sep 2026)

Stephen woke up to a stopped codespace and no visible change in the game. This file says exactly where the
last hand stopped, why he saw nothing, and what today is. Read it first, then `HANDOFF-OPUS-T2.md` (unchanged,
still the law), then `HANDOFF.md` section 6, then `plans/tumble/exp1/DESIGN-T2.md`.

## 1. Where it stands, checked against git this morning

- Repo `/workspaces/lucid-winds`, branch `add-sproing-jumper`, working tree clean for Tumble,
  `HEAD` = `46f06445` = `origin/main`. Nothing is lost, nothing is unpushed.
- **Live:** `20260921h` on lucidwinds.com, checked this morning with a random probe: the html serves stamp
  `20260921h` and the repo's `index.html` says the same. That is Build 2 **phase 0 and phase 1, POCKET
  CHANGE**, deployed last night: coins found at the dryer door, the lint trap, a flipped sock, a Clean and a
  Spotless Load, a glass jar on the dryer top that rolls a Quarter at 25 cents, save v3, the Laundry Wall
  Calendar. 17 Node suites green, `gate-coins` 54 checks green at 412 and 360.
- The last hand's final two commits (up to 04:47 UTC) were a full gate sweep on a quiet machine: 13 of 15
  gates pass; `step3` and `step5` are red, older than this build, and NOT a broken game (`dev/gate-lob.mjs`
  proves one tap lobs the ball in). Details and the next move for them are in `HANDOFF.md` section 6.
- **Why he saw no change:** (a) phase 1 IS live, but the coins only appear while playing a Load and on its
  results sheet; the room shows a jar about 12 px wide on the dryer; (b) on a phone that has played before,
  the first visit after a deploy runs the OLD cached modules, so he must close the tab fully and reopen once;
  (c) `lucidwinds.com` and `www.lucidwinds.com` are two origins with two saves. Tell him all three, plainly,
  in your first report.
- **Phases 2 to 8: NOT STARTED.** Every `[ ]` in `DESIGN-T2.md` from 2.1 on is open.

## 2. What today is

**He wants Tumble LISTED on Google Play next, and he wants to see today's work live today.** The answer already
in the design (STEPHEN'S CALLS, item 2) is that phases **2, 3 and 7 plus the free pack** must be in before
listing; 4, 5, 6 and 8 ship afterwards as drops (the Play app updates from the web with no new upload).

So today's order is **2 → DEPLOY → 3 → DEPLOY → 7 → DEPLOY**, and that is a deliberate departure from
`HANDOFF-OPUS-T2.md` section 2's numeric order, made for the listing; write one line under phase 4's heading
in the design saying so. Honest sizing on a shared two core box: phase 2 alone is a full session (the finds
framework, the sheet looked at, the thirty, five sets, five comforts, four pegs). **Phase 2 live today is the
realistic bar. 3 and 7 are the stretch.** Deploy after every phase so whatever is done is in his hands.

Phase 2 in the handoff's own words: framework first (`data/finds.json`, the recipe painter on a plain tile,
`tools/find-sheet.mjs` LOOKED AT at 8x), then the thirty, the five sets and the five comforts, then the four
Clothesline pegs. `grantEverything` already takes a finds catalogue with a test, so the tester switch must
grow with it. **The law of a comfort** (design, and law 9): a find or peg that points at the twin, touches a
clock or a payout, or works in Rush or the Daily does not ship, whatever the design says.

## 3. Laws that bite hardest today (the full list is `HANDOFF-OPUS-T2.md` section 3)

- Every deploy bumps the version in THREE places (`sw.js`, `src/config.js`, `index.html`, a test enforces it)
  AND the portal card's `?v=` in `/portal/index.html`. Every imported module and data file is in the worker's
  PRECACHE (`tests/sw.test.mjs`). Deploy = `git fetch && git log HEAD..origin/main` empty, push the branch
  (`git push origin add-sproing-jumper`), then main (`git push origin add-sproing-jumper:main`), then grep the
  LIVE html with a random query for the new stamp, then `node dev/probe-live.mjs`.
- `tests/golden-seeds` passes unchanged at the end of every phase. Save stays v3 for the whole build.
- **Two Opus sessions share this codespace's TWO CORES today** (the other is building Tiny World in
  `/workspaces/tiny-world`, whose `npm test` runs 7 to 13 minutes). One browser at a time on the WHOLE
  machine: before any gate, `uptime` under 2 and `ps -eo pid,cmd | grep [c]hrom` empty, or wait. Write
  `[n]ode` in any pgrep. A gate run at load 6 fails on unchanged code.
- Every visual line ends with shots at 412x915 and 360x740, opened, three faults named. A green check is not
  a look: last night's room check passed while a results sheet covered the whole screen.
- `git add` by path, never `-A`. Copy: sentence case, no dashes, no exclamation points. No brand or near miss
  in any name. Audio never in git. No agents (the one allowed exception is authoring hero recipes in phase 4,
  which is not today).

## 4. What is his, unchanged, do not build

The 57 cents against 45 to 55 (nothing waits on it); paying (all four answers said never sell Quarters or
single packs); the radio songs, the name, the price, the target age, the store art; and whether 2, 3 and 7 is
the listing bar (it is Fable's answer, taken as the plan until he says otherwise). Write new questions in
`HANDOFF.md`, never guess them.

## 5. When you finish a session

`HANDOFF.md` gets a section 7 in the shape of section 6: what she will find, the numbers, what was wrong that
nobody had reported, what you SAW in the pictures, tests and gates, every `[-]` and why, what is next. Every
built line ticked in `DESIGN-T2.md`. `START-HERE.md`'s Tumble line updated with the live stamp. Pushed to the
branch and main, live stamp read back.

---

## THE START PROMPT (Stephen pastes this into a fresh Opus session opened in `/workspaces/lucid-winds`)

Read satellites/tumble/HANDOFF-OPUS-SEP22-MORNING.md from top to bottom, then satellites/tumble/HANDOFF-OPUS-T2.md,
then satellites/tumble/HANDOFF.md section 6, then plans/tumble/exp1/DESIGN-T2.md, before you change anything.
Build 2 phase 0 and phase 1 are LIVE as 20260921h and fully pushed; phases 2 to 8 are not started. Today is the
listing path: phase 2 POCKET FINDS, deploy, then phase 3 THE ROOM, deploy, then phase 7 PREMIUM, deploy; phase 2
live today is the bar, 3 and 7 the stretch. One design line at a time: its test watched red then green, npm
test, the golden seeds unchanged, the box ticked in the design file, commit, push the branch and then main,
grep the live html for the stamp. Every deploy bumps the version in sw.js, src/config.js, index.html and the
portal card, and every new file goes in the worker precache. Every visual line ends with shots at 412x915 and
360x740 opened and three faults named. Another Opus session is building Tiny World on this same two core
machine: one browser on the whole machine at a time, check uptime and ps before any gate. The law of a
comfort holds over the design. No agents. Stop only at a stop line, green and pushed, with HANDOFF.md and
START-HERE.md updated. First report to Stephen: the live stamp, that phase 1's coins show in a Load and on the
results sheet, and that a phone must close the tab fully and reopen once after any deploy.
