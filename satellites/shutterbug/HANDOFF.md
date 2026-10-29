# SHUTTERBUG — Build Handoff v1.0

For the Codespace lead agent and workers. Read `DESIGN.md` first; this file says how to turn it into a build. Stephen Furpahs owns every decision; the lead owns the plan; workers own the code.

---

## 1. How this repo works

- `DESIGN.md` — the ruled design. Not a suggestion. If something in it is impossible or contradictory, write it in `QUESTIONS.md` and keep going on everything else.
- `HANDOFF.md` — this file. Scope, milestones, roles, prompts.
- `BUILD-PLAN.md` — written by the lead before any game code. Architecture, module boundaries inside the single file, task breakdown, test plan. Stephen approves it before M0 starts.
- `PROGRESS.md` — append-only log. Every session ends by adding what shipped, what is in flight, what is blocked. The resume prompt reads it first.
- `QUESTIONS.md` — anything that needs Stephen. Keep each entry to the question, the options, and the lead's recommendation.
- `fixtures/` — 20+ level records (grids, not photos) used by the harness. Stephen supplies the first batch; workers may add synthetic edge cases (blank wall, all-dark, checkerboard, one-giant-landmark).
- `music/` — Stephen's tracks, added later. Placeholder silence until then.

Deliverable files at the end: `index.html`, `manifest.json`, `sw.js`, `harness.js` (Node, headless), `fixtures/`, `music/`, and the docs above. Nothing else ships.

## 2. Hard rules for the build

1. Single `index.html`, vanilla ES2020, no frameworks, no bundler, no transpile, no npm dependencies at runtime. `harness.js` may use Node built-ins only.
2. The core (`pipeline`, `reach`, `sim`, `rng`) is pure: no DOM, no timers, no `Math.random`, no `Date`. It is shared verbatim between `index.html` and `harness.js` (one source block, included by both; the lead decides how without a build step — e.g. harness reads `index.html` and evals the tagged block).
3. Fixed 60 Hz sim step with an accumulator; render at display rate; input sampled once per sim step.
4. Every tunable number in `DESIGN.md` lives in one `TUNING` object at the top of the core. Grid size is a constant there (§3 of DESIGN).
5. Determinism is tested: the harness replays a recorded input script against a fixture and asserts the final state hash matches.
6. No network calls at runtime. The service worker caches `index.html`, `manifest.json`, and `/music/*`. Nothing else.
7. Mobile first: every milestone is tested on a real phone in portrait before it is marked done. Desktop keyboard is a convenience, not a target.
8. Photos never persist. The only stored image data is the 16-color grid.

## 3. Milestones

Each milestone ends with a tagged commit, a `PROGRESS.md` entry, a phone test, and the harness green.

### M0 — Vertical slice (the hook)
Scope: capture (file input, camera roll, sample room), crop UI with overlay, pipeline §6.1–6.8 and §6.12, develop reveal §5.2, hero movement §4 complete (jump, wall-slide, wall-jump, dive, dash, sticky walls), one-way platforms, film-tab repair, spawn/exit/beacon, Attic biome with moths only, hearts and death/restart, control strip with rocker + A + B, keyboard, `harness.js` v0 (generate every fixture, assert reach to exit, route score §6.9 minus enemies).
Done when: every fixture produces a playable climb; 60 fps on a mid-range phone; readability test passes; a tester who has never seen the game can shoot their room and reach the ceiling light.
This is the milestone that decides whether the game exists. Stephen plays it before M1 starts.

### M1 — Core game
Scope: all 5 biomes and enemies §7, feature detection with caps §6.11, route score with enemies, loot specks, chest, scroll pick-one-of-two, hearts growth, full onboarding §5.3 with first-room rules, free play loop, sharing §10 (link + QR + preview sheet), level codes, recent rooms, settings (mirror layout, sound), PWA manifest + service worker, SFX set.
Done when: a free-play session from first launch to a shared link works offline on a phone; harness green across fixtures × biomes.

### M2 — Runs and gear
Scope: house run (5 rooms, persistence, Retry House, resume), doorway screen, Darkroom (shop in-level; collector at doorways and title), all 24 weapons §9.1, stats §9.2, blueprints and banking, DP economy §9.3, loaded pool, pickup compare screen, boss §7.1 with intro, arena rules and fallback, harness asserts boss arena rules.
Done when: a full 5-room run with a boss kill is completable by a tester; every weapon is readable in one sentence by a tester who just picked it up; economy numbers logged for tuning.

### M3 — Meta and ship
Scope: unlocks §9.4 (Negative, Double Exposure, Open House, Daily Room), cosmetics hooks (no content), music integration from `/music/`, export/import save, determinism replay test, performance pass, accessibility pass (contrast, touch targets, reduced motion), store/landing copy and screenshots from real rooms (Stephen's call which rooms).
Done when: acceptance criteria §13 of DESIGN all pass; Stephen signs off for listing on the Lucid Winds arcade.

### Post-launch backlog (not scheduled)
Flash, Time-lapse, live viewfinder overlay (getUserMedia), repeat-clear decay, top-down crawler mode, leaderboards via static JSON drop.

## 4. Roles

- **Lead (one agent)**: reads DESIGN and HANDOFF, writes BUILD-PLAN.md, splits milestones into worker tasks with acceptance checks, reviews every worker merge against DESIGN, keeps PROGRESS and QUESTIONS current. The lead does not start game code until Stephen approves BUILD-PLAN.md.
- **Workers (one task each)**: implement exactly the task, in the single file, behind the module boundary the plan defines; run the harness; phone-test if the task touches input, rendering or layout; append to PROGRESS.
- **Stephen**: approves BUILD-PLAN.md, plays M0 before M1, answers QUESTIONS.md, supplies fixtures and music, rules on anything that would change DESIGN.

## 5. BUILD-PLAN.md must contain

1. Module map inside `index.html`: `rng`, `palette`, `pipeline`, `reach`, `features`, `sim` (hero, enemies, projectiles, boss), `render`, `input`, `ui` (screens, develop reveal, share sheet, Darkroom), `save`, `audio`, `pwa`. One tagged `<script>` block per module; the core modules are the ones the harness also loads.
2. The level record and run-state schemas, with versions.
3. The reach model as a spec the sim must satisfy (sim is never less generous than reach).
4. Task list per milestone, each task ≤ one session, with an acceptance check and the harness assertions it adds.
5. Test plan: harness fixtures, determinism replay, phone matrix (one low-end Android, one iPhone), readability test script.
6. Risks the lead sees that DESIGN does not cover, with a recommendation each.
7. Palette proposal (16 colors as hex) for Stephen to approve in M0.

## 6. Kick-off checklist (Stephen)

- [ ] Create the repo (`shutterbug`) and open it in a Codespace.
- [ ] Add `DESIGN.md` and `HANDOFF.md` to the root. Commit.
- [ ] Add `fixtures/` with 20 room photos' grids. Fastest path: ask the lead to build a tiny `fixtures/make.html` first that turns a photo into a level record JSON entirely in the browser, then run it on 20 photos and commit only the JSON. Photos never enter the repo.
- [ ] Decide whether M0 uses the 16-color palette the lead proposes or one Stephen authors.
- [ ] Paste the **lead prompt** (§7) into Claude Code. Review `BUILD-PLAN.md`. Approve or redline in `QUESTIONS.md`.
- [ ] Paste the **worker prompt** (§8) per task, or let the lead dispatch workers if the setup supports subagents.
- [ ] Play M0 on a phone before approving M1.
- [ ] Drop music into `/music/` any time before M3.

## 7. Lead prompt (paste into Claude Code in the Codespace)

```
You are the lead engineer for SHUTTERBUG, a single-file mobile pixel-art platformer where a photo of a room becomes the level.

Read DESIGN.md and HANDOFF.md completely before doing anything else. DESIGN.md is the ruled design; HANDOFF.md is how we build it.

Your first and only deliverable this session is BUILD-PLAN.md, with exactly the seven sections HANDOFF.md §5 lists. Do not write game code yet. Do not change DESIGN.md. If anything in DESIGN.md is impossible, contradictory, or underspecified, put it in QUESTIONS.md with options and your recommendation, and plan around your recommendation.

Hard rules you must plan within: single index.html in vanilla ES2020 with no build step and no runtime dependencies; a pure deterministic core shared by index.html and a Node harness.js; fixed 60 Hz sim; portrait mobile first; no network at runtime; photos never persist.

Also create fixtures/make.html: a tiny browser page that takes a photo, runs the crop and the pipeline steps 6.1–6.2 from DESIGN.md, and downloads the level record as JSON. Stephen will use it to make the fixture corpus without committing photos.

When BUILD-PLAN.md and fixtures/make.html are done, append a PROGRESS.md entry and stop. Stephen approves the plan before M0 begins.
```

## 8. Worker prompt (paste per task, filling in the task)

```
You are a worker engineer on SHUTTERBUG. Read DESIGN.md, HANDOFF.md, BUILD-PLAN.md, and the last 30 lines of PROGRESS.md.

Your task: <TASK TITLE from BUILD-PLAN.md>. Scope: <paste the task's scope and acceptance check>.

Rules: work only inside the module boundary the plan assigns; keep the core pure and deterministic; add the harness assertions the task lists; do not change DESIGN.md or BUILD-PLAN.md; if blocked, write the question in QUESTIONS.md and do the rest.

When done: run `node harness.js` and make it green, note any phone-test result, append a PROGRESS.md entry (what shipped, what is in flight, what is blocked), and stop.
```

## 9. Resume prompt (any new session)

```
Resume work on SHUTTERBUG. Read HANDOFF.md, BUILD-PLAN.md, QUESTIONS.md, and the last 50 lines of PROGRESS.md. Summarize in five lines: current milestone, last thing shipped, what is in flight, what is blocked, and the next task you will take. Then take it. Run `node harness.js` before and after. End by appending to PROGRESS.md.
```

## 10. Things Stephen decides later (do not block on these)

- Final 16-color palette approval (M0).
- Which rooms appear in store screenshots.
- Music track per biome.
- Whether Sunbeams and cosmetics ship in v1 or later.
- Unlock prices after M2 economy logs.
- Grid fallback (36×64) only if M0 shows 24×48 loses the room.
