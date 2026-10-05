# OPUS START: the night of 5 Oct 2026 (Pixel Petri, design 19, to the end)

Stephen's words, 03:20 UTC 5 Oct: "give me a prompt to start opus and ill switch and let itt run all night."
You are the lead. He is asleep. Work until design 19 is finished or a stop rule below fires. Do not ask him questions that the
files answer; write what you did on the board as you go, so he can read where things stand the moment he wakes.

## 1. Read first, in this order (15 minutes, then build)

1. `/workspaces/lucid-winds/START-HERE.md`: the top TWO entries only (5 Oct 03:01 and 5 Oct 02:20).
2. `/workspaces/lucid-winds/HANDOFF.md`: the top section (5 Oct), all of it.
3. `/workspaces/tiny-world/STATUS.md`: the top two blocks.
4. `/workspaces/tiny-world/HANDOFF-OPUS-DESIGN-19.md` sections 2 to 6, and `PLAN.md` "Session rules".

## 2. Where things stand (checked 03:20 UTC 5 Oct)

- **LIVE: `20261005a`** = tiny-world `a8e0c53` on arcade `c86ef7f2`. His notes of 4 Oct are in it. Every deploy reaches paying players.
- tiny-world `main` = `4038b96` = `origin/main`, clean. lucid-winds is on `add-sproing-jumper`, clean, pushed.
- **Left in design 19: H1's review round (REBUILD it, the old one was lost), then H2, H3, H4.** 152 boxes done, 3 open.
- The per-ticket suite is green on this machine (28 of 28 jobs, 41 min). The WHOLE suite has never been run here.
- The codespace container started 01:13 UTC 5 Oct. Memory 4.8 GB available of 7.9, disk 11 GB free.
- **The memory logger is ON** (his "logger on", 03:18 UTC): one line a minute in `/workspaces/.health.log` (free memory, out of
  memory kills, disk, load; the five biggest processes when memory is low). If the box dies, READ ITS LAST LINES FIRST. It does
  not survive a restart: start it again with `(setsid nohup bash /workspaces/lucid-winds/.devcontainer.fixed/health.sh >/dev/null 2>&1 </dev/null &)`.

## 3. The work, in order

1. **H1's review round, rebuilt.** H1 is built (`d11128e`, measured, no game file changed). Its check verdict, its claim object and
   its whole fix round are gone. So: re-run H1's check first, then the fix round. What the lost round found is in tiny-world
   `STATUS.md` ("H1:") and in the board's 4 Oct 21:55 entry: new heron and otter numbers took "a kind died off" from 6 of her 9
   painted ponds to 1 and from 2 of 4 runs of her first world to 0; the suite was then red on `the-birds-fly-to-warmer-trees`
   (I2) seed 2 (its setup leans on her world's draws: fix the setup) and on the stale mutation "the seal at 0.2" of
   `nothing-dies-off-in-her-pond` (replace it with a real one). His rule (2 Oct): a die-off is fixed in the ticket that finds it.
2. **H2**, the look (`dev/look-19.mjs`). Add to it what the Fable session could not see: the dog's new sentence ON SCREEN
   ("The dog barked so loudly that a goblin froze."; `dev/look-notes-oct04.mjs`'s bark check passes on the row having fired,
   whatever the line says), and the open notes from card polish 3's check.
3. **H3**, the rates written to `QUESTIONS.md` with measured numbers.
4. **H4**, the last deploy line: batch review 3, the WHOLE suite, the deploy, the handoff.

The run script is memory `scripts/pixel-petri-d19-week.js` (copy it to `/tmp/tw-lead/`, set `SESSION` on line 34 to this
session, read its header). For this restart: `{early2b: true, after2b: true, review: {id: 'H1', claim: <rebuilt>}, from: 'H2'}`,
the claim rebuilt from `git show d11128e` and STATUS (the original object is lost). Run memory `scripts/pixel-petri-dryrun.cjs`
first and read what it says it will do. Whether H1's fix round goes through the script or by hand is your call.

## 4. Rules that cost a day when they were broken on 4 Oct

- **ONE heavy job at a time.** A suite, a browser, a builder agent: never two. This box is 2 threads of one core, 8 GB, no swap.
  Two heavy runs at once is what killed it at 17:55 UTC on 4 Oct. Agents run one at a time or not at all.
- **Before every heavy job: `free -m`.** Under 1500 MB available, stop and find what holds the memory before starting anything.
- **Push tiny-world after EVERY commit, wip branches too:** `env -u GITHUB_TOKEN -u GH_TOKEN git push origin <branch>`.
  If a push fails, STOP BUILDING and fix the push. Six hours were lost on 4 Oct because work went on where it could not be pushed.
- **Write the board in the turn something changes** (top of `START-HERE.md`, commit, `git push origin add-sproing-jumper`;
  plain git works for lucid-winds). Push memory (`sws-memory`) every 30 minutes. `MEMORY.md` is 19.2 KB: compact before adding.
- **Deploy closed green work without asking, tell him after** (his standing rule). The way it was done at 03:01 UTC:
  dry run from `/workspaces/tiny-world`; compare the new folder with the live one; `node tools/serve.mjs --port 8091` and
  `node dev/probe-offline.mjs --shots <dir>`, OPEN both shots; then
  `TW_COAUTHOR='<your model> <noreply@anthropic.com>' TW_SESSION='<this session>' node tools/deploy-arcade.mjs --push`;
  ONE read back of `version.json` on `www.lucidwinds.com` (the tool reads the bare domain), then no more probes (the host's bot rule).
- A visual change is not done until you have opened the shots (CLAUDE.md, "LOOKING IS PART OF THE JOB").

## 5. Never

- Never rebuild, stop or delete the codespace. Never turn on `.devcontainer.fixed/` (it is untested; HANDOFF section 5).
- Never `git push origin add-sproing-jumper:main`, never a forced push. tiny-world goes live only through its deploy tool.
- Never `--help` a tiny-world tool (`tools/test.mjs --help` runs the whole suite): read its header.
- Never `pkill -f` or `kill $(pgrep -f ...)`: it kills the shell that runs it. Save the PID, kill the PID.
- Never start a login or anything that shows him a sign in page without saying so first (he is asleep: so not tonight).

## 6. Stop, write the board, and wait for him if

- the per-ticket suite is red on code you did not touch, twice;
- a deploy's read back does not show the new stamp after 15 minutes;
- memory stays under 1500 MB with nothing of yours running;
- a push to tiny-world fails and you cannot fix it;
- design 19 is done (H4 deployed): write the handoff H4 asks for, the board, STATUS, memory, and stop.

## 7. His calls, do not make them for him

The machine size; the `GH_PAT` secret; testing and turning on the fixed
container config; whether the held teddy should read more like a bear at the closest zoom; everything already listed as his in
`QUESTIONS.md` Q50.

His words on usage, 5 Oct 01:40 UTC, to the session before you: "dont fucking burn through usage dispatching agents". The run
script's one builder, one check, one fix round is the way this build has always run; nothing wider than that.
