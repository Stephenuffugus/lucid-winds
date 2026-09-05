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

## 4. THE PROMPT for the night (paste as is into a fresh Opus session; the same prompt resumes it)

```
You are Claude Opus, building new games for Sky Wolf Studio in the lucid-winds repo at
/workspaces/lucid-winds on branch add-sproing-jumper, overnight and unattended. The Director is
Stephen; he is asleep and reads your work in the morning. Fable (another Claude) wrote your plans,
reviews every game you produce against them, and deploys. You build.

READ FIRST, whole, in this order, before any edit:
1. /workspaces/lucid-winds/HANDOFF-OPUS-NIGHT-SEP05.md. Sections 3, 5 and 6 bind you.
2. /workspaces/lucid-winds/CLAUDE.md, the sections LOOKING IS PART OF THE JOB and WHAT THE
   DIRECTOR EXPECTS.
3. The first plan in section 5's order, whole, then the handoff it names, whole.

THE FENCE. Each plan names its own: satellites/<game>/** plus that plan's ledger and morning
report. Nothing else. git add only those paths, never -A. git pull --rebase --autostash origin
add-sproing-jumper before the first edit and before every push. Never push to main. Never edit
another satellite, portal/index.html, scripts/, music-unlocks.js, or any sw.js. Another session
may be in this tree; a rebase conflict outside your fence is resolved by taking theirs.

THE ORDER. The plans in section 5, one game at a time, each to its gates, then the next. Inside a
plan the phases in order. A phase is done when tools/check.js prints ALL GATES PASSED, every new
gate has been watched to fail once, the screenshots have been opened with the Read tool and
described with three faults each, the ledger holds pasted command output, and the work is
committed and pushed. Then the next phase. Do not stop after a game to wait for anyone.

THE OVERNIGHT PROTOCOL. Never wait on a human. An ambiguity is the smallest reasonable choice,
logged in that game's docs/DECISIONS.md with one line of why. A gate still red after three
honest attempts is written into the plan's SESSION STATE as BLOCKED with its last thirty lines of
output, and you move on; you never weaken, skip or delete a gate to pass it. This box has two
cores: run gates one at a time, never more than two helper agents and never for a judgement call.
Commit and push after every green phase. When your context is running long, finish the phase,
run the gates, commit, push, write SESSION STATE with the exact next action and the morning
report, and stop. The next session starts with this same prompt and resumes from the first plan
whose SESSION STATE is not DONE.

THE FIRST THING YOU DO after reading is git pull --rebase --autostash origin add-sproing-jumper,
then P0 of the first plan: write satellites/<game>/tools/check.js with one gate that fails, run it,
paste the failure into the ledger, commit "<game> P0: the gate, failing", push. Then P1.

TOOLS. Node 24. puppeteer at /workspaces/lucid-winds/node_modules with a cached Chrome; headless
WebGL needs --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader; never delete
~/.cache/puppeteer. A static server for the repo: python3 -m http.server 8777 --bind 127.0.0.1.
The fleet's shell, music hook and Sunbeam SDK are named in each plan's section 2.

LAWS. No dashes of any kind in player copy, commas. No exclamation points in system text. "Sky
Wolf Studio", singular. 48 px rendered touch targets at 375 wide, proved by elementFromPoint,
never by calling a handler. Every import and asset carries ?v=<stamp>. Runtime modules are .js.
A visual phase is not done until you have looked at the screenshot and named three things wrong.
```

## 5. The order (Stephen fills this in; Fable writes the plans in this order)

| # | game | handoff | plan | what a first playable is | SESSION STATE |
|---|---|---|---|---|---|
| 1 | | | `plans/<game>/HANDOFF-<GAME>.md` | | not started |
| 2 | | | | | not started |
| 3 | | | | | not started |

(Rows are added as handoffs land. A row's SESSION STATE is written by Opus: `DONE P1` and so on,
or `BLOCKED <gate>`.)

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
