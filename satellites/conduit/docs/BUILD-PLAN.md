# CONDUIT — build plan

**Companion to:** CONDUIT-OPUS-handoff.md (the design spec — the *what*).
This document is the *how, in what order, and how we know it works*.

**Status:** M0 complete (Phase 0 prototype built, see `index.html`).
Next action: **play it five times, answer the ship gate.**

---

## 0. How we work

| Role | Who | Owns |
|---|---|---|
| Design lead / architect | this session | spec, CFG tuning direction, milestone gates |
| Implementation | Claude Code in Codespaces | features, refactors, level authoring |
| Playtest + final call | Stephen | ship gate answers, fun verdict, priorities |

**Rules of engagement, from the first commit:**

1. **One file until it hurts.** `index.html` stays single-file through M2.
   Split only when it passes ~2500 lines *and* two systems need to change
   independently. No build step, ever.
2. **CFG is the only place numbers live.** A magic number anywhere else is
   a bug. Grep for `0.` in logic during review.
3. **The invariant assert never gets commented out.** If it fires, stop
   feature work and fix the leak. Every bug in this game is a mass leak.
4. **HANDOFF.md is updated at the end of every session** — current state,
   what's half-done, what the next instance should do first, and the
   running playtest log. This is how sessions stay continuous.
5. **No asset spend before the gate that unlocks it** (§6).

---

## 1. Repo structure

```
conduit/
  index.html            # the game (single file, no build step)
  HANDOFF.md            # living state doc, updated every session
  BUILD-PLAN.md         # this file
  DESIGN.md             # CONDUIT-OPUS-handoff.md, renamed
  PLAYTESTS.md          # dated log: seed, CFG diffs, what felt wrong
  test/
    harness.js          # headless runner — extracts the <script>, stubs DOM
    smoke.js            # invariant + solvability checks, runs in node
  levels/               # (M3+) one JSON per level, inlined at build-free load
  art/                  # (M6+) textures, atlases; source .blend files
  firebase.json         # hosting config
  manifest.webmanifest  # PWA
```

Branching: `main` is always playable. Feature work on `m<N>-<topic>`
branches, merged only when the milestone exit criteria pass.

---

## 2. Milestones

Each has a **hard exit criterion**. Do not start the next one early.

### M0 — Phase 0 prototype ✅ (built in this session)
Grid, blob with mass, one sentry + one drone, socket + generator,
sprinkler + floor plate + speaker + breaker, drag-to-route conduit with
concealed cost, retracting reclaim, exposure and conduit discovery,
harvest, lockdown, force door, squeeze vent, exfil, four medals, mass
ledger with per-frame assert.

**Exit:** it runs on a phone and one full cycle is completable.

### M1 — THE SHIP GATE 🔴 (next, and it is not a coding task)
Play five runs. Answer in `PLAYTESTS.md`, honestly:
- Is route → trigger → harvest → reclaim fun with rectangles?
- Did you ever *want* the long safe route, or was short-and-cheap always
  right? (If always short: raise spot rates or lower insulation value.)
- Did liquidity ever bite — were you mid-sized and useless at a bad
  moment? (If never: the trap costs are too cheap. Raise device `needs`.)
- Did lockdown feel like a setback or a wall? (Wall = breaker is too far.)

**Exit:** a written yes, plus a list of ≤5 CFG changes. A written no means
we iterate CFG and layout inside M0 — nothing downstream saves it.

### M2 — feel pass on the proven loop
Only after a yes. Squeeze capsule stretch, spring-damped radius, Flow
camera lift as a real animated transition, WebAudio (hum that rises with
alert, conduit-live tone, harvest slurp), haptics on discovery and hit,
Appendix A ferro rendering behind `CFG.ferroRender` flipped to true.

**Exit:** a 30-second clip you'd show someone.

### M3 — depth
Full device list (floodlight, fan, crane, coolant, door lock, camera),
battery cart dragging, vehicle battery, insulation upgrade + residue
spend screen, save/load to localStorage, level loader + three authored
levels (§5), pause/resume.

**Exit:** three levels beatable by two different strategies each.

### M4 — content and progression (see DESIGN-ADDENDUM-2)
Six levels, three enemy types tuned, site select with per-site medal state,
trait tree (~8 traits), tutorialisation folded into level 1–2 rather than a
text tutorial. **Splice ships here** — the first unlock that re-prices every
level already played. Anti-grind rule: a replay banks only the improvement
over your previous best on each axis.

**Exit:** a stranger finishes level 1 without being told the rules, *and* a
player who returns to level 1 with Splice solves it a visibly different way.

### M5 — splitting (the big unlock)
Multi-blob control, hold-position, decoy, hold-a-circuit-closed, the
force-a-door-and-enter-a-vent puzzle class. The data model already
supports it (blobs is a list) — this is control scheme + AI, not surgery.

**Exit:** one level solvable *only* by splitting.

### M6 — art and identity
Now, and not before. Tileable textures, colour keys per site, enemy
silhouettes → models (§6). PWA manifest, icons, splash.

**Exit:** looks intentional on a phone screenshot.

### M7 — the third-person camera (optional, evaluate first)
Three.js via script tag, 2D sim stays authoritative, Prowl drops to the
shoulder, Flow stays top-down. **Decide at M6 whether this is worth it**
— a beautiful 2D game may be the better product. Do not sleepwalk into it
because the original doc mentioned it.

### M8 — polish and ship
Settings, accessibility (colourblind-safe exposure tiers — never encode
exposure in colour alone; the prototype already hatches concealed tiles),
reduced motion, 60fps on a mid-phone, Firebase deploy, itch.io page.

### M9 — post-ship
Level editor (the level format is already data), community levels, daily
seeded site.

---

## 3. Phase 0 task DAG (reference — all built in M0)

```
grid + tiles ──┬── movement + collision ── squeeze/force thresholds
               ├── LOS + vision cones ──── spot progress ── alert FSM
               ├── conduit routing ─┬── cost model (concealed 1.6×)
               │                    ├── live/power resolution ── devices
               │                    ├── discovery ── guard-walks-wire
               │                    └── reclaim (retract at speed)
               ├── enemies (BFS pathing) ── damage ── death ── bodies
               │                                        └── harvest
               └── ledger ── invariant assert ── medals ── win/lose
```

Everything hangs off the ledger. It was written first, deliberately.

---

## 4. Test strategy

Three layers, all cheap, all runnable from a phone via Codespaces:

1. **Per-frame invariant** (in-game, dev only):
   `sum(blob.mass) + sum(conduit.cost) === ledger.owned`, tolerance 1e-6.
   Fires a red HUD banner, not a silent console line.
2. **Headless smoke test** (`test/smoke.js`, node, no deps): loads
   `index.html`, extracts the script, stubs the DOM, and drives the sim
   for thousands of steps with scripted inputs. Asserts: invariant holds,
   no NaN positions, enemies never enter walls, conduit never self-crosses,
   reclaim refunds exactly 75%, harvest overflow lands in residue.
   **Run before every merge.** It caught two real bugs during M0.
3. **Solvability check**: for each authored level, a scripted solution
   path that must still complete after any CFG change. This is the
   regression net that lets us tune numbers fearlessly.

Determinism: all randomness goes through one seeded PRNG (`S.rng`) so a
playtest can be replayed from its seed. Log the seed in `PLAYTESTS.md`.

**Performance budget** (mid-range Android, 60fps): update ≤5 ms, draw
≤8 ms. Vision cones are the risk — cap ray count, not range.

---

## 5. Level curriculum

Each level teaches exactly one new idea and re-tests the last two. No
tutorial text; the layout is the lesson.

| # | Site | Teaches | Forced by layout |
|---|---|---|---|
| 1 | Intake bay | route → trigger → harvest → reclaim | Only one source, one device, one patrol |
| 2 | Coolant floor | Devices are inputs to each other | Sprinkler + plate is the only kill |
| 3 | Vent stack | The size inversion | A vent and a forced door on the same route |
| 4 | Generator hall | Concealed routing is worth 1.6× | Cheap routes are all under floodlights |
| 5 | Substation | Lockdown and the breaker | Alert is nearly unavoidable; the breaker is the level |
| 6 | Hive spine | Liquidity | Two simultaneous traps; you cannot fund both at once |

Level 1 is the prototype map, trimmed. The current M0 map is really
level 2 (it already has the sprinkler+plate combo, vent, and door) —
split it when the loader lands in M3.

---

## 6. Asset pipeline and its gates

**Gate A (after M1 yes):** nothing. Rectangles still.
**Gate B (after M2):** colour keys only — one palette per site, generated
as flat images for reference, not shipped.
**Gate C (after M5):** textures. Seamless 512² floor/wall/grating tiles,
desaturated so the creature owns all colour. Generated, then hand-checked
for tiling seams.
**Gate D (M6, and only if M7 goes ahead):** 3D props via Meshy →
**Blender** for decimate, re-UV, bake to one 1024² atlas per site → glTF.
Budget <10k tris per prop. Enemy silhouettes: concept images first, model
only the winners.

**Never generated, at any gate:** the creature and the conduit. They are
field-reactive procedural geometry (Appendix A). A static asset is a
downgrade, not an upgrade.

---

## 7. Risk register

| Risk | Signal it's happening | Response |
|---|---|---|
| Loop isn't fun | M1 answer is "fine, I guess" | Kill or pivot to pure puzzle (no realtime prowl). Do not proceed on a maybe. |
| Flow mode becomes the whole game | Player lives in top-down | Tighten `flowRequires`, add mass cost |
| Routing is fiddly on a phone | Misdrawn routes, rage-reclaims | Snap-to-path assist: tap source, tap device, auto-route cheapest, then let the player drag to edit |
| Detection feels arbitrary | "I don't know why he saw me" | Draw spot progress as a filling pip over the enemy — legibility before tuning |
| Scope creep into 3D | Three.js appears before M6 | The plan says M7 and conditional. Hold the line. |
| Progression flattens the game | Late player is strong at everything | Thresholds stay absolute while capacity grows — never scale squeeze/force with capacity |
| Upgrades sell away the puzzle | Someone proposes a reclaim-rate trait | Refuse. Upgrade reclaim *speed* instead. |
| Replay becomes a grind | Residue farmed on easy sites | Bank only the improvement over previous best |
| Mass leaks | Assert fires | Stop. Fix. It is never cosmetic. |

---

## 8. Moving to Codespaces (do this next, before M1 playtests)

1. New repo `conduit`, push `index.html`, `DESIGN.md`, `BUILD-PLAN.md`,
   `HANDOFF.md`, `PLAYTESTS.md`, `test/`.
2. Enable GitHub Pages on `main` → instant phone playtesting URL.
3. `node test/smoke.js` in the Codespace terminal before every merge.
4. Firebase Hosting later, at M8, when there's something to launch.
5. Start every Claude Code session with: *"Read HANDOFF.md and
   BUILD-PLAN.md §2. We are at milestone M<N>. Do not start M<N+1>."*
