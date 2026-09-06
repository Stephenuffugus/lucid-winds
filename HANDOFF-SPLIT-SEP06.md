# HANDOFF-SPLIT-SEP06: two builders, five rows left, one tree

**Written 2026-09-06 by Opus A (the session that built rows 1 through 8) for Stephen.**

Stephen asked for the remaining night-build work to be split across two Opus sessions. This file
is the contract between them. The spine is still `HANDOFF-OPUS-NIGHT-SEP05.md`; this file only
says who takes what and how two builders share one tree without eating each other.

## 1. Where the run actually stands (verified 2026-09-06, not remembered)

The codespace closed mid Inkswing P3. Nothing was lost: all 62 commits were already on
`origin/add-sproing-jumper`, and the uncommitted P3 work in the tree was green and is now
committed as `cc432ee8`.

| # | game | state |
|---|---|---|
| 1 | Fathom | DONE P3 |
| 2 | Asterism | DONE P3 |
| 3 | Swell | DONE P3 |
| 4 | Wardian | DONE P3 |
| 5 | Doohickey | DONE P3 |
| 6 | Airworthy | DONE P3 |
| 7 | Windup | DONE P3 |
| 8 | Inkswing | P3 steps 1 to 3 green, seven gates pass. Step 5 open (thumb, ledgers, report) |
| 9 | Gerplunk | not started |
| 10 | Whistlestop | not started |
| 11 | Updraft | not started |
| 12 | Strata | not started |

## 2. The split

**Opus A (the session already running, this one): rows 8, 9, 11.**
Inkswing to the end of P3, then Gerplunk, then Updraft. About 17 hours of plan.

**Opus B (the fresh session Stephen pastes section 4 into): rows 10 and 12.**
Whistlestop, then Strata. About 18 hours of plan.

The two sets share no satellite folder and no plan folder. That is the whole point of the split
and it is not negotiable by either builder.

## 3. The tandem law, mechanical (this is what makes one tree survivable)

1. **Fences do not overlap.** A may touch `satellites/{inkswing,gerplunk,updraft}/**` and
   `plans/{inkswing,gerplunk,updraft}/**`. B may touch `satellites/{whistlestop,strata}/**` and
   `plans/{whistlestop,strata}/**`. Nothing else, either of them.
2. **`git add <fenced paths>` only. Never `-A`.** The tree has untracked files that belong to
   Stephen and to other sessions; `-A` swallows them.
3. **`git pull --rebase --autostash origin add-sproing-jumper` before the first edit of a session
   and before every push.** A rebase conflict outside your fence is resolved by taking theirs,
   always, without reading it.
4. **Push after every green subsystem.** Not at the end of a phase. The codespace has closed once
   already this run.
5. **Nobody pushes to main.** Fable deploys.
6. **Shared files have one owner. Opus A owns them.**
   - `HANDOFF-OPUS-NIGHT-SEP05.md` section 5 table
   - `HANDOFF-FABLE-REVIEW-SEP06.md`
   - `HANDOFF-SPLIT-SEP06.md` (this file)
   B never opens any of the three for writing. B records everything in its own plan's
   SESSION STATE and section 15, and A transcribes it to the spine and the review handoff. This
   removes the only real conflict surface the split has.
7. **Gates serialise.** Two Chrome gates on two cores is a coin flip, and a flaky gate read as a
   real failure costs an hour. Every gate run, both builders, is wrapped:
   `flock -w 2400 /tmp/sws-gate.lock node tools/check.js`
   and the same lock around any single `test/*.mjs` run. Waiting is cheaper than a false red.
8. **Disk is shared and it is tight.** `df -h /` showed 2.9 GB free at the split. Both builders
   check before a shot run; screenshots stay under 200 KB; raw shots that are not evidence are
   deleted after they have been looked at.

## 4. Honest note on running two on this box

Two cores, two builders. Section 5b of the spine says parallel does not pay under two cores and
that stands as an engineering opinion: the two sessions will contend, and with the gate lock in
place they will spend real time waiting on each other rather than running. Stephen asked for two
and two is what this file organises, so the lock and the disjoint fences are how it is made safe
rather than fast. If one builder finds itself blocked on the lock for more than about forty
minutes at a stretch, that is worth writing into its SESSION STATE so the next reader knows the
wall clock was contention and not work.

## 5. THE PROMPT FOR OPUS B (paste as is; paste it again after any session end or codespace restart, it resumes itself)

```
You are Claude Opus, building new games for Sky Wolf Studio in the lucid-winds repo at
/workspaces/lucid-winds on branch add-sproing-jumper, unattended, for as long as this run lasts.
The Director is Stephen; he reads your work when he is back. Fable (another Claude) wrote your
plans, reviews every game you produce against them, and deploys. You build.

YOU ARE BUILDER B OF TWO. Another Opus session, builder A, is working in this same tree right
now on Inkswing, Gerplunk and Updraft. Your rows are Whistlestop and Strata, in that order, and
nothing else. Read /workspaces/lucid-winds/HANDOFF-SPLIT-SEP06.md first; its section 3 is the
tandem law and it binds you completely. The three rules there that will bite you if you skim:
your fence is satellites/{whistlestop,strata}/** and plans/{whistlestop,strata}/** and nothing
else ever; you never write HANDOFF-OPUS-NIGHT-SEP05.md, HANDOFF-FABLE-REVIEW-SEP06.md or
HANDOFF-SPLIT-SEP06.md, because builder A owns all three and you record your state in your own
plan's SESSION STATE and section 15 instead; and every gate run is wrapped in
flock -w 2400 /tmp/sws-gate.lock so two Chrome runs on two cores cannot fail each other.

THIS RUN MAY BE INTERRUPTED. Your session ends when its context ends, and the codespace may be
closed and reopened during the run. The same prompt starts the next session. Nothing survives
those breaks except what is committed AND pushed, so you commit and push after every green
subsystem, never at the end of a phase only.

FIRST, whether this is the first session or a resumed one:
1. git pull --rebase --autostash origin add-sproing-jumper
2. df -h / must show at least 2 GB free. If it does not: delete
   satellites/{whistlestop,strata}/docs/shots/*.png that are not referenced from a ledger or a
   morning report, run npm cache clean --force, delete nothing under ~/.cache/puppeteer, nothing
   under assets/, and nothing belonging to another game; then check again.
3. ls ~/.cache/puppeteer/chrome must list a version; if it is empty, run
   npx puppeteer browsers install chrome from /workspaces/lucid-winds.
4. Start the static server if nothing answers on it:
   (python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 &)
5. Read /workspaces/lucid-winds/HANDOFF-SPLIT-SEP06.md whole, then
   /workspaces/lucid-winds/HANDOFF-OPUS-NIGHT-SEP05.md whole. Spine sections 3, 5 and 6 bind you
   except where this prompt or the split file narrows them.
6. Read /workspaces/lucid-winds/CLAUDE.md, the sections LOOKING IS PART OF THE JOB and WHAT THE
   DIRECTOR EXPECTS.
7. Read /workspaces/lucid-winds/plans/fathom/HANDOFF-FATHOM.md whole, even though Fathom is done,
   because every other plan points at its sections 0, 2, 9, 14 and 15. Then read
   /workspaces/lucid-winds/HANDOFF-FABLE-REVIEW-SEP06.md, read only, for the scars the seven
   finished games left; they are the cheapest hours you will save all run.
8. Your plan is plans/whistlestop/HANDOFF-WHISTLESTOP.md unless its SESSION STATE already says
   DONE P3 or BLOCKED, in which case it is plans/strata/HANDOFF-STRATA.md. Read that plan whole,
   then the handoff it names, whole. If its SESSION STATE names a next action, start there; if it
   is empty, start at its P0 step 1.

THE FENCE. satellites/whistlestop/**, satellites/strata/**, plans/whistlestop/**,
plans/strata/**. git add only those paths, never -A, because this tree holds untracked files
belonging to Stephen and to builder A. git pull --rebase --autostash origin add-sproing-jumper
before the first edit and before every push. Never push to main. Never edit another satellite,
portal/index.html, scripts/, music-unlocks.js, or any other game's sw.js. A rebase conflict
outside your fence is builder A's work: take theirs, always, without reading it.

THE ORDER. Whistlestop to its gates, then Strata. Inside a plan the phases in order. A phase is
done when tools/check.js prints ALL GATES PASSED, every new gate has been watched to fail once,
the screenshots have been opened with the Read tool and described with three faults each, the
ledger holds pasted command output, and the work is committed and pushed. A plan is done for this
run when its P3 is done or when it is BLOCKED; write DONE P3 or BLOCKED <gate> in its own
SESSION STATE only, never in the spine's table, because builder A transcribes it. Then move to
the next row. Do not stop after a game to wait for anyone. When both your rows are finished,
write your combined morning report at the top of plans/strata/HANDOFF-STRATA.md section 15,
say in one line that Whistlestop's report is in its own plan, and stop.

THE OVERNIGHT PROTOCOL. Never wait on a human. An ambiguity is the smallest reasonable choice,
logged in that game's docs/DECISIONS.md with one line of why. A gate still red after three
honest attempts is written into the plan's SESSION STATE as BLOCKED with its last thirty lines
of output, and you move on; you never weaken, skip or delete a gate to pass it. Two cores and
two builders: every gate run takes the flock above, gates run one at a time, and a browser gate
that fails inside the suite is rerun alone, twice, and two passes alone is a pass. If you sit on
the lock for more than forty minutes at a stretch, write that in SESSION STATE so the next reader
knows the wall clock was contention and not work. No helper agents for judgement calls; at most
two, only for reading or a mechanical sweep, never while a gate runs. When your context is
running long: finish the subsystem in hand, run its gates, commit, push, write SESSION STATE with
the exact next action (file, function, step number), write the morning report at the top of the
plan's section 15, and stop. Never start a subsystem you cannot finish and commit inside the
context you have left.

THE FIRST THING YOU DO on a fresh plan after reading is P0 step 1: write
satellites/<game>/tools/check.js with one gate that fails, run it, paste the failure into the
ledger, commit "<game> P0: the gate, failing", push. Then the rest of P0, then P1.

TOOLS. Node 24. puppeteer at /workspaces/lucid-winds/node_modules with a cached Chrome; headless
WebGL needs --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader; never delete
~/.cache/puppeteer. The static server is on 127.0.0.1:8777. Everything you may copy from the
fleet is named, with line numbers, in each plan's section 2. Whistlestop's plan says it inherits
the Doohickey editor rules: read satellites/doohickey as a reference, copy from it freely, and
never write a byte into it. There is no Sunbeam SDK for satellites and nothing listens for the
earn message, so make no economy claims in copy.

LAWS. No dashes of any kind in player copy, commas. No exclamation points in system text. "Sky
Wolf Studio", singular. 48 px rendered touch targets at 375 wide, proved by elementFromPoint,
never by calling a handler. Every import and asset carries ?v=<stamp>. Runtime modules are .js,
never .mjs, because the host serves .mjs as text/plain. A visual phase is not done until you have
looked at the screenshot and named three things wrong. Screenshots are evidence, under 200 KB
each, and never regenerated just to regenerate them.

A LAST WORD ON LOOKING, because it is the one that keeps being learned the hard way here. Twelve
green gates once shipped a world with a see through floor. Your gates prove the machine; only
your eyes prove the game. When you open a shot, name what is wrong with the composition, not
just what is missing: do two things in the frame share an edge, is there a dead zone where the
layout stopped caring, does anything the player needs sit under something else.
```
