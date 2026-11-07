# STUDIO BUILD PLAN (7 Nov 2026): the one plan Opus runs all night, and the next night, until it is done

Stephen, 7 Nov: "a single plan that can run autonomously all night and we'll have opus do the build. If it takes more
than one night, that's fine." This file is that plan. It is a table of chapters in order; each chapter's STEPS, LAWS
and DECISIONS live in its own file (written already) so nothing is said twice. The builder works down the table, marks
each chapter's STATE in its file and one line at the top of START-HERE.md, and ends every chapter with a deploy line
for Stephen. A chapter whose pack has not come back is SKIPPED (its line says waiting on the pack) and the next starts.
When the box dies, the next night starts from the same kickoff and resumes from the first step not DONE.

## THE CHAPTERS, in order

| # | Chapter | Its file | Needs | Ends with |
|---|---|---|---|---|
| 1 | Sunforge v5.2, the obsidian shards | SUNFORGE_V2_BUILD_PLAN.md | pack v2 (back) | deploy-sunforge-m3.sh |
| 2 | Flatulence Fighter m4, round 2 on the six pads | FLATULENCE_FIGHTER_M4_BUILD_PLAN.md | round 2 (back) | deploy-ff-m4.sh |
| 3 | Keepsies m4, round 3 on the new shot | KEEPSIES_M4_BUILD_PLAN.md | round 3 (back) | deploy-keepsies-m4.sh |
| 4 | Tomato Man A: canopies, the walk, the gameplay art | TOMATO_MAN_RUN_BUILD_PLAN.md, A0 to A4 | gameplay art (back) | deploy-tomato-man-art.sh |
| 5 | Tomato Man B: THE RUN | TOMATO_MAN_RUN_BUILD_PLAN.md, B0 to B7 | The Run art (placeholders until it lands) | deploy-tomato-man-run.sh |
| 6 | Shutterbug R10: film stocks, rank, prints, four new verbs | SHUTTERBUG_R10_BUILD_PLAN.md | round 10 art (placeholders until it lands) | sb-m2-13 and sb-m2-14 |
| 7 | Shutterbug round 10 art wired | written by Fable when the pack lands | round 10 | sb-m2-15 |
| 8 | Tomato Man The Run's art wired | written when the pack lands | The Run | deploy-tomato-man-run-art.sh |
| 9 | Keepsies m5, round 4 wired | written when the pack lands | round 4 | deploy-keepsies-m5.sh |
| 10 | Tomato Man The Hero wired (thirteen bodies, the planet) | written when the pack lands | The Hero | deploy-tomato-man-hero.sh |
| 11 | Flatulence Fighter m5, round 3 wired | written when the pack lands | round 3 | deploy-ff-m5.sh |
| 12 | Sunforge v5.3, round 3 wired | written when the pack lands, only if Stephen picked it | round 3 | deploy-sunforge-m4.sh |

Chapters 5 and 6 build with placeholder art when their packs are not back yet; chapters 8 and 7 then replace the
placeholders. If Stephen's order is to wait for every pack before the build, chapters 5 and 6 still run (their code
does not depend on the art) and 7 and 8 follow in the same night.

## THE LAWS (one breath; each chapter's file repeats what is its own)
Run all night without stopping and without asking: never AskUserQuestion, never end a turn with a question, never end
the turn until the box clock says stop; a question becomes a DECISIONS line and the default is built. Bash only (cat,
sed, grep, python heredocs, node): never Read, Edit or Write, never open an image. A denied command is not retried;
note it in START-HERE and build on. Alone: no Workflow, no lanes, no subagents, no review agents, no redwatch or mutant
runs. Per step only the one check the chapter names; one screenshot per visual step, described from the shell by its
pixels; the big checks once at the end of a chapter; never re run a green. Never push main: each chapter ends with its
deploy line for Stephen; if he sends the exact line as a message, run it. Commit after every step with a message that
says what changed and why. One line per step in the chapter's STATE and at the top of START-HERE.md. The box dies 12 h
after boot: `date -u -d @$(awk '/btime/{print $2}' /proc/stat)` plus 12 h, stop 40 minutes before it with START-HERE
written. Tomato Man builds on branch sunstruck of /workspaces/Tomato_Man, never in satellites/tomato-man; a git command
there may be denied if the folder was not added to the session: then edit on, do everything else, and leave that repo's
one commit as its own command, last.

## STATE (the builder updates this table; one line per chapter)

| # | State | Night | Note |
|---|---|---|---|
| 1 | DONE, waits for his line | 7 Nov (Fable, daytime) | v5.2 at 2403070e0; `! bash /home/codespace/sf-drafts/deploy-sunforge-m3.sh` |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | waits on the pack | | |
| 8 | waits on the pack | | |
| 9 | waits on the pack | | |
| 10 | waits on the pack | | |
| 11 | waits on the pack | | |
| 12 | waits on the pack and his pick | | |
