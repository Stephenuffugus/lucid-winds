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
| 6 | Shutterbug R10: film stocks, rank, prints, four new verbs | SHUTTERBUG_R10_BUILD_PLAN.md | round 10 art (placeholders until it lands) | sb-m2-13 and sb-m2-15 (step 4) |
| 7 | Shutterbug round 10 art wired | SHUTTERBUG_R10_BUILD_PLAN.md, the art rows | round 10 (back 7 Nov) | sb-m2-14 |
| 8 | Tomato Man The Run's art wired | written when the pack lands | The Run | deploy-tomato-man-run-art.sh |
| 9 | Keepsies m5, round 4 wired | written when the pack lands | round 4 | deploy-keepsies-m5.sh |
| 10 | Tomato Man The Hero wired (thirteen bodies on the rig, her heads; the planet art parked) | TOMATO_MAN_RUN_BUILD_PLAN.md, chapter 10 | The Hero (back 7 Nov) | deploy-tomato-man-hero.sh |
| 11 | Tomato Man PLANET TOMATÓ (his name, 7 Nov): the moon crosses the Dunes and the Eclipse once a level, its shadow is shade | TOMATO_MAN_RUN_BUILD_PLAN.md, chapter 11 | The Hero's planet art | deploy-tomato-man-planet.sh |
| 12 | Tomato Man THE SPLIT and the walk order (his Pixel notes, 7 Nov): two lanes of awnings in the Dunes and the Eclipse, each shade on its own clock; the walk frames alternate the feet | TOMATO_MAN_RUN_BUILD_PLAN.md, chapter 12 | none (The Walk round fixes the side views' gallop) | deploy-tomato-man-split.sh |
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
| 2 | LIVE 7 Nov ~22:15 UTC | 7 Nov (Fable, daytime) | m4 (3d8c92165) and m5 (a miss is a strike, his ruling; 5fb6ecb5e) on lucid-winds main 692ca6b87 by his one line |
| 3 | DONE, waits for his line | 7 Nov (Fable, daytime) | m4 at 3ba0a05cc; `! bash /home/codespace/kp-drafts/deploy-keepsies-m4.sh` |
| 4 | LIVE 7 Nov ~18:05 UTC | 7 Nov (Fable, daytime) | sunstruck 5097685, carried by milestone B's line (its own line never ran and is stale) |
| 5 | LIVE 7 Nov ~18:05 UTC | 7 Nov (Fable, daytime) | sunstruck 1125c0d4 (B0 to B7, with chapter 8 inside) on lucid-winds main b3c737e20 and Tomato_Man main |
| 6 | LIVE 7 Nov ~22:25 UTC through sb-m2-18 | 7 Nov (Fable, daytime) | sb-m2-13 and 15 on main 5bfb72309; sb-m2-16 (the moves taught), 17 (the Loom and the Wasp) and 18 (the phases) on main e5dfd0c44, his one line; sb-m2-19 (the crosswind) and sb-m2-20 (the collapsing staircase), round 11 code, STAMPED 8 Nov, wait for his ONE line: `! bash /home/codespace/sb-drafts/sb-m2-20/deploy-sb-m2-20.sh` |
| 7 | LIVE 7 Nov ~18:20 UTC | 7 Nov (Fable, daytime) | sb-m2-14 live inside sb-m2-15's line |
| 8 | LIVE 7 Nov ~18:05 UTC | 7 Nov (Fable, daytime) | her run pack wired inside chapter 5's stamp |
| 9 | waits on the pack | | |
| 10 | LIVE 7 Nov ~22:11 UTC | 7 Nov (Fable, daytime) | sunstruck d5e80d9 (thirteen bodies on the tomato's rig, her builder heads; the planet art in and parked for his call) on lucid-winds main 1c2388105 and Tomato_Man main |
| 11 | LIVE 7 Nov ~22:47 UTC | 7 Nov (Fable, daytime) | sunstruck fe645b1 (Planet Tomató crosses the Dunes and the Eclipse once a level, its shadow the code's circle) on lucid-winds main d5b3a7a75 and Tomato_Man main, his line |
| 12 | STAMPED 7 Nov ~23:52 UTC, waits for his line | 7 Nov (Fable, night) | sunstruck 1d461e6: THE SPLIT (two lanes, own sway clocks) and WALK_ORDER; `! bash /home/codespace/tm-drafts/deploy-tomato-man-split.sh` |
| 11 | waits on the pack | | |
| 12 | waits on the pack and his pick | | |
