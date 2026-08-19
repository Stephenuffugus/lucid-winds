# UMBRA — Build Handoff (v3: the shadow-traversal puzzle-platformer)

**Title:** UMBRA. Hero: **Tomato Man**. Origin: Penny, sunburned, declared she'd "make a sandwich tomato man."
**Logline:** The sun is death. Shade is the only ground you can stand on — and it moves as the sun sweeps the sky. Solve the route across a large level to the flag without stepping into the light.

**Studio constraints (unchanged):** single-file vanilla HTML/CSS/JS, no build, mobile-first, Firebase only where needed, GitHub Pages / Firebase Hosting, portal-compatible but allowed to grow past mini-game scope.

**Current build:** `umbra-v4.html` — scrolling camera, near-instant burn, shade-as-only-ground, swept-shadow geometry (rect awnings + round umbrellas), oscillating sun, drifting cloud platforms (horizontal + vertical "elevator" clouds), **moving cart-shadow platforms**, **hot-sand hazard**, fixed dash (see §2), deployable shade + SPF, checkpoints, a **4-level World 1**, level select + win + medals, plus polish (dash trail, danger vignette, burn shake, dash-cooldown ring).
**Superseded:** `umbra-v3.html` (good bones, but dash trivialized it and only 2 levels), `umbra-v2.html` (one-screen, generous health — no skill), `umbra-prototype.html` (survival toy). Reference only.

---

## 0. The two failed versions and the lesson (don't regress)

- **v1 (survival):** static one-screen field, forgiving heat → optimal play was "stand near center and nudge." No goal, no skill.
- **v2 (levels, generous health):** added start→exit + heat-as-health, but health was generous and levels fit one screen → **you could sprint straight across to the exit and ignore the sun entirely.** Shade was decorative.

**The fix that defines v3:** make the sun lethal and the levels large.
1. **Near-instant burn (~0.67s of direct sun).** Open ground is now lethal; you cannot cross it. This is the keystone — without it the shade doesn't matter.
2. **Shade is the only standable ground.** You move *through* connected shadow. Because the sun sweeps, that ground shifts — shadows are moving platforms.
3. **Large scrolling levels (Aladdin/Lion King scale).** Camera follows the player across a multi-screen world, so there's a real route to *solve*, not a screen to cross.
4. **Tools are the puzzle pieces.** Dash (cross a thin sun sliver), Pop-up shade (drop temporary safe ground / wait out the sun's swing), SPF (a few seconds of immunity for one bad stretch), and drifting **cloud shadows** (moving platforms you board and ride). All limited — *where/when* you spend them is the puzzle.
5. **Checkpoints**, because instant death across a big level needs them (same as the SNES platformers referenced). Burn → flash back to last checkpoint, not the start.

Skill now lives in: reading the sweep, route-finding through moving shade, dash timing across slivers, boarding clouds, and tool economy.

---

## 1. Perspective decision (still top-down; holds from v1 analysis)

Top-down keeps shade as 2-D pools that rotate/sweep and keeps the floating joystick fully meaningful. "Platformer scale" here means **large multi-screen traversal levels**, not literal side-view gravity-jumping. If Stephen later wants true side-view jump-platforming, that's a *different* build (shadow collapses to a 1-D strip on flat ground, joystick reduces to L/R+jump) — flag before committing. **Isometric remains the AAA upgrade** (height returns: a tall wall genuinely shades a low alley, so climbing *is* the shade mechanic), and 3-D / Quest 2 VR the far horizon ("tilt the umbrella to block the sun" is a perfect VR verb).

---

## 2. Engine internals (working in v3 — port/extend exactly)

**World/camera:** world is W×H pixels larger than screen; camera = player-centered, clamped to world bounds, lerped for smoothness. All draws offset by `-cam`. An on-screen arrow points to the exit when it's off-screen.

**Sun = far parallel light, OSCILLATING azimuth (key choice).** `az = azC + azAmp*sin(t*azSpeed)`. Oscillation (not full rotation) makes shadows sweep back-and-forth predictably → *designable, learnable, fair* puzzles. Higher `elev` = shorter shadows = harder.

**Swept shadows (instant, recomputed each frame):**
- Rect awning: project its 4 footprint corners along the sun-opposite direction by `len = sh/tan(elev)`, take the **convex hull** of the 8 points → shadow polygon. Point-in-convex-polygon test for safety. (Monotone-chain hull + half-plane test are in the file.)
- Round umbrella: ellipse shadow; coverage `q` scales with `cos(az - facing)` so a tilted umbrella only shades well when the sun matches its tilt (the original "find the umbrella angled right" idea — preserved, now one tool among many).
- Cloud + pop-up shade: circles. **Casters do not collide** — they're overheads you pass under; only their *shadows* matter. Keeps scope sane (no collision system).

**Safety:** safe if inside any shadow polygon / ellipse / cloud / pop-up / **moving-cart shadow**, OR SPF active. Exposure: −200/s in shade; **+150/s in sun, +270/s while dashing in sun** (sprinting in the open burns you *faster* — this is the fix for "dash through everything," so dash only clears thin slivers, not wide gaps); ≥100 = burn → respawn at checkpoint with brief grace. **Hot sand** adds +260/s even in shade (shade only partly mitigates → must route around it or cross fast; SPF still protects). Dash: ~96px, 1.2s cooldown (shown as a ring on the button). **Moving casters** patrol horizontally; their swept shadow is a moving platform you time and ride — the dynamic-difficulty element that dash can't shortcut.

**Phase-2 upgrade:** real penumbra/soft edges, depth-sorting for iso, possibly solid-wall casters with collision. Research agents verify current refs: 2-D visibility/shadow polygons (Red Blob Games), penumbra fakes via layered alpha.

---

## 3. Level format (the authoring surface — data-driven)

Each level is plain data in world pixels (y down; default travel bottom→top):
`{name, sub, worldW, worldH, start[x,y], exit[x,y], sun{azC,azAmp,azSpeed,elev}, shade(int), spf(int), par, casters[], clouds[], checkpoints[[x,y]], beams[[x,y]]}`
`casters`: `['R',x,y,w,d,shadowHeight]` rect awning, or `['U',x,y,r,facing,shadowHeight]` round umbrella.
`clouds`: `{x,y,r, vx?,minx?,maxx?, vy?,miny?,maxy?}` (drifting platform; vertical-only clouds act as elevators across a plaza). Also `movers:[{x,y,w,d,sh,vx,minx,maxx}]` (patrolling cart-shadows) and `hot:[[x,y,r]]` (scorching sand).
Adding a level = adding an object. **World 1 ships in v4 (teach one idea each):** First Light (stay in shade, sun sweeps) → The Crossing (ride a vertical elevator-cloud across a plaza of pure light) → Moving Day (sparse static shade; time and ride the moving cart-shadows) → Hot Noon (short shadows + hot sand + movers + cloud + SPF — the gauntlet).

### ⚠️ Balance pass is the #1 next task
The two v3 levels were authored **without playtesting**, so they're educated guesses. Before anything else, verify and tune:
- **Solvability:** every level must have a completable route at all sun phases given the tools. Confirm no pure-sun gap exceeds what dash/cloud/pop-up/SPF can bridge.
- **No free walk:** confirm Level 1 isn't trivially "walk up the center" — open the central corridor with the sweep, or shorten shadows so real gaps appear. (v3 may currently be too generous here.)
- **Gap math:** open ground tankable distance ≈ speed×burn-time ≈ 240×0.67 ≈ 160px. Meaningful plazas must exceed this so they can't be tanked; thin slivers under ~150px are the intended dash gaps.
- Tune tool counts (`shade`, `spf`), cloud speeds/paths, checkpoint spacing, and `par` per level.
This is exactly the iterate-in-the-data loop Stephen can run on his phone.

---

## 4. Difficulty curve & worlds

Teach one idea per level; escalate sun elevation (shorter shadows) and gap reliance. Five-world journey (maps onto VAULT's structure): **Morning Tide (low sun, long forgiving shade) → Midday Blaze (short shadows, tool-heavy) → Tide Pools (reflective water = secondary sun angles) → Dunes at Dusk (wind pushes you + tilts umbrellas; sun reverses) → Eclipse (Angry Sun boss + intermittent darkness-relief windows).** Each world: one new tool/hazard, a distinct sun behavior, a palette. Authored levels are the headline; an escalating endless "shadow run" can ride alongside (procedural caster layout, sun speeds up) — keep its difficulty ramping.

**New mechanics to slot in (one per world):** Angry Sun (Mario-3 lunge that drags the lethal zone across a lane — Stephen's call), wind (drift control + re-tilts umbrellas), reflective surfaces (bounce light → new angles), wilting awnings (close after you camp too long → anti-camping), Popsicle (dash refill), Ice water (briefly slow the sun → reposition window).

---

## 5. Art & procedural skins

Hero (Tomato Man sandwich-parts: bread legs, lettuce arms, swappable produce heads — a character-builder screen echoes Penny's original pitch). Casters (awning, cabana, palm, lifeguard tower, rock arch, canyon overhang, billboard — each carries a footprint + shadowHeight + optional tilt). Per-world tiles. Juice: heat shimmer, BURNED flash, SPF shimmer, matched-umbrella glint, dash trail, checkpoint pop. **Procedural skin engine** (your Focus Grove / Pom Pond / VAULT strength): generate casters + hero parts from seeds, parameterized and logged so output is harvestable as the training corpus you've been scoping.

---

## 6. Parallel workstreams for Claude Code

- **A — Sim & shade engine:** sun model, swept-shadow geometry, safety, camera. Headless-testable; owns rules only.
- **B — Input & feel:** floating joystick, dash, action buttons, haptics, exposure/burn tuning constants.
- **C — Render & art pipeline:** scrolling renderer → iso; procedural skin engine; juice. Consumes sim state.
- **D — Level design & balance:** the format, the solvability/tuning pass (#1 priority), five-world curve, Angry Sun patterns, endless mode, medals.
- **E — Meta & integration:** Firebase (scores / sunbeam wallet / cloud save, optional), portal integration, PWA manifest + service worker, best-score persistence (localStorage works in the distributed file; v3 keeps records in-session only), character-builder.
- **Research spike (time-boxed):** verify current refs for shadow polygons, penumbra fakes, joystick UX, iso projection + depth sort, and (Phase 3) Three.js shadow mapping + WebXR. Return "techniques + chosen approach"; flag version-sensitive items.

Maintain `CLAUDE.md` + `HANDOFF.md` per session so context survives flaky mobile connections.

---

## 7. Open decisions (Stephen)

1. **Name** — UMBRA (fits SIXFOLD / VAULT / HUNCH / CAIRN / GLYPH FORGE), Tomato Man as hero. Alts: PENUMBRA, SHADE, SIESTA, SOL.
2. **Sunbeam economy** — recommend yes; beams collectable only in sun (risk), banked to the shared wallet.
3. **Perspective for full build** — top-down now → isometric AAA. Confirm before renderer work; flag if you actually want literal side-view platforming (different build).
4. **Endless mode** — alongside the campaign, or campaign-only for v1?
