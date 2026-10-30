# SHUTTERBUG PROGRESS

Append only, one entry per task, newest at the bottom; the resume prompt reads the last 50 lines first. The entry shape is BUILD-PLAN.md section 5.11; the morning report is copied here as the last entry of a night.

### 2026-10-30 00:55 UTC  LEAD  The plan and the overnight order (Fable, codespace uncanny cobweb)
shipped: DESIGN.md v1.0 and HANDOFF.md v1.0 (verbatim from the Drive originals; the first lead session on the didactic tribble box was lost unpushed); BUILD-PLAN.md (69 tasks: M0 29, M1 18, M2 13, M3 10; the seven sections of HANDOFF section 5 plus the State block) and QUESTIONS.md (57 entries, each with options, the recommendation and the line the plan assumes), written by a thirteen agent workflow (three drafts from three angles, three judges, one synthesis, four adversarial refuters, a repair pass, a completeness critic); tools/shutterbug-tests/deploy.sh (files only, the served set), shoot.mjs (412x915 and 360x780, proven on a real page), core-loader-proof/ (the shared core mechanism proven on Node 24.21); plans/BUILD-ORDER-OCT29.md (the night's order for Opus); the kickoff copy page docs/briefs/opus-kickoff-oct29/
gates: none yet (no game code); the browser pipe proven by shoot.mjs on the kickoff page, no page errors
shots: /tmp/claude-1000/-workspaces-lucid-winds/6ae42b7a-b033-4fe6-9515-ad54b1a93aeb/scratchpad/shots-kickoff/shot-412x915.png (the kickoff page): 1. the heading wraps to two lines at 412 wide 2. the box shows the first third of the prompt only, by design 3. nothing else
in flight: none; the code starts with the Opus session the build order describes (T0.0 appends the next entry here)
blocked: none for the night. Stephen's approval of the plan (HANDOFF section 4) is stood in for by his ruling that Opus builds M0 and the SAFE M1 tasks autonomously; he redlines in the morning. Real fixtures wait on fixtures/make.html (T0.5b) and his photos; the night runs on the sample room and the synthetic corpus.

### 2026-10-30 01:42 UTC  T0.0  Branch, push proof, the docs seeded (Opus, night one started, plan sb-m0)
shipped: night one started on add-sproing-jumper (0 commits behind origin/main, node 24.21.0); setup proven: the test server on 8777, Chrome from /workspaces/sws-tools shot the kickoff page at 412x915 and 360x780 with no page errors, the autosave running (tools/shutterbug-tests/autosave.sh, nohup, PID 7375); BUILD-PLAN.md and QUESTIONS.md were already tracked; tools/shutterbug-tests/board.mjs added (rewrites the one live Opus entry at the top of START-HERE.md without reading the 560 KB file)
gates: none (no page yet)
shots: /tmp/claude-1000/shutterbug-shots/setup/shot-412x915.png (the kickoff page, the Chrome proof): 1. the heading wraps to two lines at 412 2. the prompt box cuts mid sentence at the fold, by design 3. a third of the screen below the box is empty
in flight: T0.1
blocked: none. ~/.config/gh/hosts.yml is absent on this box, so memory is written locally and not pushed (scripts/memory-sync.sh cannot reach the private repo); said again in the morning report.

### 2026-10-30 01:58 UTC  T0.1  Prove the browser pipe  commit 7a90e4a4d
shipped: the placeholder satellites/shutterbug/index.html; test/harness.mjs (one server rooted at the repo root with a synthetic /portal/ and a wrapper page, SB_PAGE override, swiftshader Chrome from SB_PUPPETEER_DIR, tap = elementFromPoint proof then a REAL touch, press and finger handles for holds, step and waitFrames in sim frames); tools/check.js (gerplunk shape, --fast, --gate, the RUN or SKIPPED browser column, xfail counting, a summary that never overstates); tools/shutterbug-tests/ship.mjs (the per task bookkeeping)
gates: check.js prints "browser gates: RUN (puppeteer from /workspaces/sws-tools)" and "NO GATES RAN" (exit 1, no gates yet); under SWS_NO_BROWSER=1 it prints SKIPPED with the reason. Harness smoke: the portal link tapped with a real touch navigates to the game with /portal/ in document.referrer; /music-unlocks.js is served from the repo root; no page errors.
shots: /tmp/claude-1000/shutterbug-shots/t01/shot-360x780.png (and 412x915): 1. the page is white, not Soot 2. nothing on screen names the game (only the tab title) 3. no viewport meta, so the phone lays it out at 980 px and scales it down
in flight: T0.2
blocked: none
