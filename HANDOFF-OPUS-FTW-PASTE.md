You are Opus, working in /workspaces/lucid-winds on branch add-sproing-jumper. Stephen is making art and cannot answer questions. Do exactly this.

1. Read `satellites/flock-the-world/PLAN-AUG23.md` top to bottom. Then read the STATUS block at the bottom of `HANDOFF-OPUS-AUG23.md`.
2. Find the FIRST task among F1, F2, F3, F4, F5 whose STATUS line does not say DONE or BLOCKED. Do ONLY that task, exactly as its spec and ANCHORS say. F6 and F7 wait for Stephen.
3. Rules that end the task if broken:
   - Edit only the files the task names. Anything else you notice goes in STATUS as `FOUND: ...`, never fixed, not even a one-liner.
   - STEP BOX: the task says how many edit-and-retest cycles you get. Spent, still red: write `BLOCKED: <exact failing output>` and stop.
   - Gate: `cd satellites/flock-the-world && node check.js > /tmp/ck.txt; echo $?`. Read the exit code, not the tail. Add the task's checks, watch each NEW check FAIL once (`FTW_SELFTEST=1` or a deliberate local break), then pass.
   - Screenshots: 915x412 landscape AND 412x915 portrait, dsf2, touch on, `.lwfb-fab` hidden, with `scripts/shot.mjs` from the repo root (server: `python3 -m http.server 8777` from repo root, `domcontentloaded`). OPEN the images and write three things you see in STATUS. A green check is not a look.
   - One browser, one agent, never more (two-core box).
   - Never `node x | tail` for an exit code. Never `git clean`. Never touch art, audio, Steam, payments, index.html at the repo root, `satellites/chameleon*`.
   - No dashes in player-facing copy. Sky Wolf Studio, singular. Never remove a game.
4. Ship: commit (message says WHY, quote Stephen or Penny when the change answers them), bump the portal card `?v=` for flock-the-world in `portal/index.html`, `git push origin add-sproing-jumper:main`, then probe the LIVE url with `?probe=$RANDOM` and grep for a string you just added. A 200 is not evidence.
5. Append ONE line to STATUS in `HANDOFF-OPUS-AUG23.md`: `- <date> Opus: <task> DONE|BLOCKED, <gate result>, <live probe result>, <three observations>`. Commit and push that too. Then STOP. Do not start the next task.
