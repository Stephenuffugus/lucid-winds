# HANDOFF-OPUS-NIGHT-SEP05: the night build, how the plans are made and how they are run

**Written 2026-09-05 (evening) by Fable for Stephen, before the codespace refresh.**
Stephen is uploading handoffs for six to eight new games. One Fable turns each handoff into a
build plan. One Opus runs the plans overnight, one game at a time. Fable checks each game in the
morning. This file is the spine those three sessions hang on. The per-game plans go in
`plans/<game>/HANDOFF-<GAME>.md` and follow section 3 exactly.

## 1. The order of operations (today, tonight, tomorrow)

1. **Land the handoffs in git before anything else.** Drop them in `docs/handoffs-uploaded/`
   (the four already uploaded are there). Untracked files die with a codespace; the two videos
   and the dice masters in `assets/` are already too big for git and belong in the vault.
2. **Close nothing until `./workspace.sh` is clean.** It prints what is dirty or unpushed in every
   repo. The four loss modes: uncommitted changes, untracked files, a branch with no remote, a
   stash. `./workspace.sh save` commits and pushes everything, everywhere. The second terminal
   pushes its own batch first.
3. **Refresh.** On the new codespace `.devcontainer/bootstrap.sh` clones the siblings and restores
   memory from `sws-memory` by itself. Then, by hand, because they live outside git:
   `python3 -m http.server 8777 --bind 127.0.0.1 &` (the Keepsies gates and the Ronin solver use
   it); if `ls ~/.cache/puppeteer` is empty, `npx puppeteer browsers install chrome`; the FTW
   Android toolchain is `store/ftw-play/twa/setup-toolchain.sh` only when it is needed.
   **Machine: this box, 2 cores, and that is the ruling (Stephen, Sep 05: "I'm not going to switch to eight cores. I'm not
   paying $0.72 an hour."). One Opus at a time, as long as it takes; slow is fine.**
   **Disk, before the night starts:** `df -h /` must show at least 3 GB free. On the evening of
   Sep 05 it showed 735 MB (`.git` 3.9 GB, `assets/` 1.9 GB of untracked video and drops,
   `/workspaces/tools` 1.2 GB, `~/.cache` 1.3 GB of which puppeteer's Chrome must stay). An
   overnight run shoots screenshots and renders audio; at 735 MB it will die mid phase. Stephen
   decides what leaves: the two videos in `assets/` (129 MB, already in the vault or his phone),
   `/workspaces/tools`, and a `git gc` are the candidates; Fable never deletes his files.
4. **Planning (Fable, one session, one handoff at a time, in the priority order Stephen gives).**
   Read the handoff whole. Grep the fleet for what already exists that it can use. Write
   `plans/<game>/HANDOFF-<GAME>.md` in the shape of section 3. Commit and push each plan as it is
   finished, so a plan is never lost with a session. Honest sizing in every plan.
5. **The night (one Opus, one tree, one game at a time).** Paste section 4. It builds plan 1 to
   its gates, commits and pushes, then plan 2, and so on, in the order written in section 5. It
   never pushes to main. It never waits for a human.
6. **The morning (Fable).** Section 6, per game, in the same order. Nothing reaches main until it
   has been played with real pointer events and looked at.

## 2. Honest sizing, so nobody is disappointed at breakfast

Keepsies took one Opus one full night to reach a playable first cut of a single game with a
complete 27 section design, and it still could not be played past the first snap until a real
pointer path found five things the gates missed. Six to eight games in one night for one Opus is
two or three games to a first playable and the rest scaffolded, if the plans are good. Two Opus
sessions on one tree double the risk of collision, not the output, on a two core box. So: order
the plans by what matters most, tell Opus the order, and expect the tail to carry into a second
night. A plan that reads "phase 1 is a playable loop with one screen, everything else is later"
gets a playable game; a plan that lists every feature gets a half built one.

**With twelve plans written (Sep 05 evening), one builder on two cores, running up to 24 hours:** the plans total
about 100 hours of one Opus (7 to 10 each), so a 24 hour run lands about three games to the end of P2 or P3 and starts a
fourth. Each Opus session ends when its context does; Stephen pastes the same prompt again and the next session resumes
from the first plan whose SESSION STATE is not DONE P3 or BLOCKED. **The codespace will be closed and reopened during the
run.** That is survivable only because every green subsystem is committed and pushed before the next one starts; a session
that dies with uncommitted work loses it, so the protocol's "commit and push after every green subsystem" is the whole
insurance policy.

## 3. The plan template (every `plans/<game>/HANDOFF-<GAME>.md` has these sections, numbered)

0. **Rules of engagement.** The fence (`satellites/<game>/**` plus this plan's ledger; never
   another satellite, `portal/index.html`, `scripts/`, `music-unlocks.js`, any `sw.js`; git add
   fenced paths only, never `-A`; `git pull --rebase --autostash origin add-sproing-jumper` before
   the first edit and before every push; never push to main). The studio laws that apply: no
   dashes or exclamation points in player copy, 48 px rendered touch targets at 375 wide measured
   by `elementFromPoint`, `?v=` on every import and asset, `.js` never `.mjs` at runtime, the
   brand is Sky Wolf Studio singular, LOOKING IS PART OF THE JOB.
1. **What the game is, in one paragraph, and why it is worth a night.** Quote the handoff.
2. **State of the inheritance.** What in the fleet it may copy (a satellite with the same shape,
   the shell, the music hook, the Sunbeam SDK, a check.js to clone). Verified paths, not guesses.
3. **Corrections to the handoff.** Every place the handoff is wrong or silent, each one forced
   by a measurement or a fleet law, each one a decision Opus does not have to make.
4. **Architecture law.** Files, single entry, no framework, deterministic where a replay or a sim
   will want it, the sim harness if the handoff has balance numbers marked TUNE.
5. **The phases, with gates.** P0 the gate that fails, P1 the loop playable with one screen, P2
   the rest of the screens, P3 the polish. Each phase names its `tools/check.js` gates and the
   screenshot it ends with. A gate must be watched to fail once. A gate that drives the game
   through an internal feed instead of the thumb's path is decoration (the Keepsies scar).
6. **The screens.** Portrait, one hand, every button 48 px, the shell's ready message on every
   framed page, the music chip's corner left free.
7. **Listing on the arcade.** What Fable adds to `portal/index.html` and what must be true first
   (a thumb, a description with no dashes, the live URL answering with the stamp).
8. **Pitfalls.** The studio scars that apply, copied from HANDOFF-KEEPSIES.md section 10 and the
   fleet memory, so Opus learns them free.
9. **Decision rights and open questions.** The smallest reasonable choice is Opus's, logged in
   `docs/DECISIONS.md` with one line of why; anything about money, price, tone or the brand is
   Stephen's and gets skipped, not guessed.
10. **Stephen only.** The physical steps (a store listing, a key, a payment) that no session can do.
11. **Honest sizing.** Hours per phase for one Opus on two cores, and where a single night stops.
12. **Evidence ledger.** Filled in place with commands and their real output, most recent last.
13. **The overnight protocol.** Copied from HANDOFF-KEEPSIES.md section 15, unchanged.
14. **The morning report.** Copied from HANDOFF-KEEPSIES.md section 16, unchanged.

## 4. THE PROMPT (paste as is into a fresh Opus session; paste the same prompt again after every session end or codespace restart, it resumes itself)

```
You are Claude Opus, building new games for Sky Wolf Studio in the lucid-winds repo at
/workspaces/lucid-winds on branch add-sproing-jumper, unattended, for as long as this run lasts.
The Director is Stephen; he reads your work when he is back. Fable (another Claude) wrote your
plans, reviews every game you produce against them, and deploys. You build. One builder, this
box, two cores; slow is fine, stopping is not.

THIS RUN MAY BE INTERRUPTED. Your session ends when its context ends, and the codespace itself
will be closed and reopened at least once during the run. The same prompt starts the next
session. Nothing survives those breaks except what is committed AND pushed, so you commit and
push after every green subsystem, never at the end of a phase only.

FIRST, whether this is the first session or a resumed one:
1. git pull --rebase --autostash origin add-sproing-jumper
2. df -h / must show at least 2 GB free. If it does not: delete satellites/*/docs/shots/*.png
   that are not referenced from a ledger or a morning report, run npm cache clean --force,
   delete nothing under ~/.cache/puppeteer and nothing under assets/, then check again.
3. ls ~/.cache/puppeteer/chrome must list a version; if it is empty, run
   npx puppeteer browsers install chrome from /workspaces/lucid-winds.
4. Start the static server if nothing answers on it:
   (python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 &)
5. Read /workspaces/lucid-winds/HANDOFF-OPUS-NIGHT-SEP05.md whole. Sections 3, 5 and 6 bind you.
6. Read /workspaces/lucid-winds/CLAUDE.md, the sections LOOKING IS PART OF THE JOB and WHAT THE
   DIRECTOR EXPECTS.
7. Read /workspaces/lucid-winds/plans/fathom/HANDOFF-FATHOM.md whole, even if Fathom is DONE,
   because every other plan points at its sections 0, 2, 9, 14 and 15.
8. Find your plan: the first row of section 5 whose plan's SESSION STATE is not DONE P3 and not
   BLOCKED. Read that plan whole, then the handoff it names, whole. If its SESSION STATE names a
   next action, that is where you start; if it is empty, start at its P0 step 1.

THE FENCE. Each plan names its own: satellites/<game>/** plus that plan's ledger and morning
report. Nothing else. git add only those paths, never -A. git pull --rebase --autostash origin
add-sproing-jumper before the first edit and before every push. Never push to main. Never edit
another satellite, portal/index.html, scripts/, music-unlocks.js, or any other game's sw.js.
Another session may have been in this tree; a rebase conflict outside your fence is resolved by
taking theirs.

THE ORDER. The plans in section 5, one game at a time, each to its gates, then the next. Inside a
plan the phases in order. A phase is done when tools/check.js prints ALL GATES PASSED, every new
gate has been watched to fail once, the screenshots have been opened with the Read tool and
described with three faults each, the ledger holds pasted command output, and the work is
committed and pushed. A plan is done for this run when its P3 is done or when it is BLOCKED;
write DONE P3 or BLOCKED <gate> in its SESSION STATE and the same word in section 5's row, then
move to the next row. Do not stop after a game to wait for anyone. When the table has no row
left, write the combined morning report at the top of the spine and stop.

THE OVERNIGHT PROTOCOL. Never wait on a human. An ambiguity is the smallest reasonable choice,
logged in that game's docs/DECISIONS.md with one line of why. A gate still red after three
honest attempts is written into the plan's SESSION STATE as BLOCKED with its last thirty lines of
output, and you move on; you never weaken, skip or delete a gate to pass it. Two cores: run
gates one at a time; a browser gate that fails inside the suite is rerun alone, twice, and two
passes alone is a pass. No helper agents for judgement calls; at most two, only for reading or a
mechanical sweep, never while a gate runs. When your context is running long: finish the
subsystem in hand, run its gates, commit, push, write SESSION STATE with the exact next action
(file, function, step number), write the morning report at the top of the plan's section 15,
and stop. Never start a subsystem you cannot finish and commit inside the context you have left.

THE FIRST THING YOU DO on a fresh plan after reading is P0 step 1: write
satellites/<game>/tools/check.js with one gate that fails, run it, paste the failure into the
ledger, commit "<game> P0: the gate, failing", push. Then the rest of P0, then P1.

TOOLS. Node 24. puppeteer at /workspaces/lucid-winds/node_modules with a cached Chrome; headless
WebGL needs --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader; never delete
~/.cache/puppeteer. The static server is on 127.0.0.1:8777. Everything you may copy from the
fleet is named, with line numbers, in each plan's section 2; there is no Sunbeam SDK for
satellites and nothing listens for the earn message, so make no economy claims in copy.

LAWS. No dashes of any kind in player copy, commas. No exclamation points in system text. "Sky
Wolf Studio", singular. 48 px rendered touch targets at 375 wide, proved by elementFromPoint,
never by calling a handler. Every import and asset carries ?v=<stamp>. Runtime modules are .js.
A visual phase is not done until you have looked at the screenshot and named three things wrong.
Screenshots are evidence, under 200 KB each, and never regenerated just to regenerate them.
```

## 5. The order (proposed by Fable 2026-09-05 by value times overnight feasibility; Stephen may reorder any row before pasting section 4)

| # | game | handoff | plan | what a first playable is | SESSION STATE |
|---|---|---|---|---|---|
| 1 | Fathom | `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-FATHOM.md` | `plans/fathom/HANDOFF-FATHOM.md` (written 2026-09-05, Fable) | level 1 cleared with real taps: drag to move, tap to throw, the ring lights the cave, a cache glints, the exit sings back. That is P1 step 5 of the plan | **DONE P3** (2026-09-05, ten gates, morning report in the plan section 15) |
| 2 | Asterism | `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-ASTERISM.md` | `plans/asterism/HANDOFF-ASTERISM.md` (written 2026-09-05, Fable; the star catalogue is packed at `plans/asterism/hyg-asterism.json`) | the real sky from Columbus at a frozen time with Vega overhead, three real taps join Vega, Deneb and Altair, a typed name saves to the almanac. That is P1 step 4 | **DONE P3** (2026-09-05, eight gates, morning report in the plan section 15) |
| 3 | Swell | `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-SWELL.md` | `plans/swell/HANDOFF-SWELL.md` (written 2026-09-05, Fable; the three moods are data in section 4) | one finger held for six seconds swells strings to choir and lets go into a cadence that ends on the tonic, rendered to `docs/shots/p0-swell.wav` for Stephen to hear. That is P0 step 5 | **DONE P3** (2026-09-05, seven gates, docs/shots/p0-swell.wav is the review) |

| 4 | Wardian | `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-WARDIAN.md` | `plans/wardian/HANDOFF-WARDIAN.md` (written 2026-09-05, Fable; nothing dies is a gate) | a fern unfurls over real minutes in a jar whose light follows the phone clock, a swipe mists it, a tap rolls the pillbug, and a 30 day headless run never removes a plant. That is P1 step 2 | **DONE P3** (2026-09-06, seven gates, twelve mutations watched, morning report in the plan section 15) |
| 5 | Doohickey | `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-DOOHICKEY.md` | `plans/doohickey/HANDOFF-DOOHICKEY.md` (written 2026-09-05, Fable; the physics engine is copied from Burr Blast, the domino cascade is a 300 trial gate) | a marble rolled down two planks knocks over eight dominoes into the bell, 100 percent of 300 seeded trials, and a real drag from the tray places a plank on the grid. That is P1 step 3. The largest of the six, about 10 hours | **DONE P3** (2026-09-06, eleven gates, 121 assertions, seventeen mutations watched, morning report in the plan section 15) |
| 6 | Airworthy | `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-AIRWORTHY.md` | `plans/airworthy/HANDOFF-AIRWORTHY.md` (written 2026-09-05, Fable; the flight model has every coefficient written down and the phugoid is an assertion) | a pull back throws a badly trimmed plane across the gym, it porpoises, two elevator bends from the result card fix it. That is P1 step 4 | **DONE P3** (2026-09-06, the whole plan; eight gates, 123 sim assertions, every assertion watched to fail; the wind tunnel cannot lie about the field and it found a hole in the flight model, two courses and six challenges with medals measured by `sim.js --medals`, the sound, the tile; morning report in the plan section 15 with two Director calls waiting) |

| 7 | Windup | `docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-WINDUP.md` | `plans/windup/HANDOFF-WINDUP.md` (written 2026-09-05, Fable) | a real circular drag on the crank plays Twinkle from a punched strip and stopping the finger leaves the tines ringing. That is P1 step 4. About 7.5 hours | **DONE P3** (2026-09-06, the whole plan; eight gates, 119 sim assertions, every assertion watched to fail; the crank really is the clock and a gate holds it there, the gift opens in a browser that has never seen the game, the printable strip is a hand written PDF; ⛔ NOBODY HAS HEARD `docs/shots/p0-tine.wav`; three Director calls in the plan section 15) |
| 8 | Inkswing | `docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-INKSWING.md` | `plans/inkswing/HANDOFF-INKSWING.md` (written 2026-09-05, Fable) | a real fling of the brass bob draws a spiral that dies into its centre and a second ink layers over it. That is P1 step 4. About 8 hours | **DONE P3** (2026-09-06, the whole plan except P3 step 4 the Double Link, which the plan made conditional on the rest landing early; seven gates, 239 assertions, every assertion watched to fail. ⛔⛔ the layout gate's most important assertion had never once been able to fail, because every button it checked is hidden until a sheet has a throw on it; three real layout faults were under it, all found by opening a screenshot; morning report in the plan section 15 with two Director calls waiting) |
| 9 | Gerplunk | `docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-GERPLUNK.md` | `plans/gerplunk/HANDOFF-GERPLUNK.md` (written 2026-09-05, Fable; portrait first, his call) | a real flick skips a stone at least six times with a tick per skip and the plunk, and the tally matches. That is P1 step 3. About 7 hours | **P0 DONE** (2026-09-06, Opus A; 126 assertions, every one watched to fail. ⛔the plan's COLLISION MODEL was wrong, restitution collapsed the trill into the timestep, corrected to Bocquet's lift impulse. ⛔the tuned constants are a measurement: `node sim.js --sweep` re-derives them and FAILS if the shipped values are not in its own passing set. ⛔AIM did not exist in the plan and now does, decided by a design panel: it is THE PLANT. P1 to P3 NOT started; next action and five Director calls in the plan section 15) → **P1 DONE** (2026-09-06 13:29Z, a Fable builder, 41 min: the lake, the shore, a real flick with a tick per skip and the plunk, the tally post, the seam bent by the wind, the turn; six gates green under Fable's own run; LISTED beta and LIVE; Fable made the skimmer the default pick so the first flick trills; next = P2 step 1, the pebble bed) |
| 10 | Whistlestop | `docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-WHISTLESTOP.md` | `plans/whistlestop/HANDOFF-WHISTLESTOP.md` (written 2026-09-05, Fable; inherits the Doohickey editor rules) | eight real drags snap curves into a loop with the chime, a whistle starts a train, a lever sends it the other way. That is P1 step 5. About 8 hours | **DONE P3** (2026-09-06, Opus B; twelve gates, every one watched to fail, twenty six screenshots opened and eleven real faults found in them, morning report in the plan section 15. NOT reviewed by A) |
| 11 | Updraft | `docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-UPDRAFT.md` | `plans/updraft/HANDOFF-UPDRAFT.md` (written 2026-09-05, Fable; the kite lives on a sphere, written down) | real hold pulses launch the kite through the turbulent layer, a slide leans it, a dive and save is in the numbers. That is P1 step 3. About 8.5 hours | **P0 + P1 DONE** (2026-09-06 13:36Z, a Fable builder, 48 min: sim 71 assertions, the field, hold to reel, slide to lean, ribbon tail, bowed line, Mabel, stamps, five gates green under Fable's run with the fly gate flaking once on the swiftshader tap-is-a-hold race; LISTED beta and LIVE with the card copy trimmed of the unbuilt Real Wind promise; next = P2 step 1, the mood screen; P2 and P3 not built) |
| 12 | Strata | `docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-STRATA.md` | `plans/strata/HANDOFF-STRATA.md` (written 2026-09-05, Fable; the variety sheet is a gate a human reads) | fifty generated skeletons on one sheet with five worth a screenshot, then a real brush stroke pours dust off a rib. That is P1 step 4. About 10 hours, the largest of the second six | **DONE P3** (2026-09-06, Opus B; seven gates, every one watched to fail, the variety sheet passed at TWELVE of fifty after failing at nought and about four, combined morning report for both B rows in the plan section 15. NOT reviewed by A) |

(Rows are added as handoffs land. A row's SESSION STATE is written by Opus: `DONE P1` and so on,
or `BLOCKED <gate>`.)

## 5b. Parallel mode (NOT IN USE: Stephen ruled Sep 05 evening to stay on 2 cores with one builder at a time. Kept for the day a bigger box exists.)

Parallel only pays on a box with more than two cores. On the 2 core, 8 GB box every gate already flakes under
contention (HANDOFF-KEEPSIES 15.4); two builders there halve each other. So:

- **2 cores:** one builder, the order above, no helper agents for judgement calls. This is the default.
- **8 cores (after the machine type change in section 1 step 3):** one coordinator Opus that does NOT build. It reads the
  spine, then spawns up to **three builder agents**, each handed exactly one plan by path and the prompt in section 4
  with this paragraph appended. Builders never share a fence: three games, three folders. When a builder finishes a game
  (its plan's SESSION STATE says DONE P2 or better, or BLOCKED), the coordinator hands it the next plan in the order.
  The coordinator's only other job is the combined morning report at the top of this file.
- **The tandem law, mechanical.** Every builder: `git pull --rebase --autostash origin add-sproing-jumper` before every
  commit; `git add satellites/<game> plans/<game>/HANDOFF-<GAME>.md` only; a rebase conflict outside the fence is taken
  as theirs; pushes are retried on rejection after another rebase. Never `-A`, never main.
- **Gates serialise across builders.** Every gate run is wrapped: `flock -w 1800 /tmp/sws-gate.lock node tools/check.js`
  (and the same lock around any single `test/*.mjs`). Browser gates from two builders at once are a coin even on eight
  cores because Chrome is the load; the lock makes them wait their turn instead of failing each other.
- **Disk.** Three builders shoot three sets of screenshots; the disk check in section 1 step 3 is a hard floor of 3 GB
  before the coordinator spawns anyone, and each builder deletes raw shots that are not evidence after reading them.
- **The prompt line to append for a builder:** "You are builder N of 3. Your plan is <path>. You share this tree with two
  other builders; the fence and the lock above are absolute. When your plan's SESSION STATE reads DONE P2 or BLOCKED,
  stop and report to the coordinator; do not start another plan yourself."

## 6. The morning (Fable's review, per game, in the order above)

1. `git diff --name-only <start>..HEAD` outside every fence must be empty.
2. `node satellites/<game>/tools/check.js` alone; then break one gate on purpose and watch it go red.
3. Play it with REAL pointer events at 412x915, 375x667 and 320x568, from the portal's door
   (`?dev=1` does not open gated games, `localStorage.sws_dev_ok=1` does). Every screen. Note
   every wall.
4. Open every screenshot; three things wrong in each before Stephen sees them.
5. Fix what is small, write what is not into the plan's SESSION STATE, then deploy only what
   plays: `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is empty, and
   prove it with a curl for a marker only the new build has.
6. Add the portal row, bump its `?v=`, and write the one line Stephen reads on his phone.
