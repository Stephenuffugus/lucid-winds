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

