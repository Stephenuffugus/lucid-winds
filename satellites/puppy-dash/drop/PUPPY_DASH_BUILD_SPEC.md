# 🐾 Puppy Dash — Claude Code Build Spec & Handoff

**Read this first, then `puppy-dash.html` (the working prototype), then `PUPPY_DASH_ART_BIBLE.md` (the asset plan).** This document orients a fresh Claude Code instance to take the prototype from "fun proof-of-concept" to "shipped, art-driven, economy-connected game on the site."

---

## 0. TL;DR for the incoming instance

- `puppy-dash.html` is a **complete, single-file, dependency-free** endless runner (3 lanes, jump/slide/dodge, rainbow-poop jetpack power-up, synthesized sound). It runs as-is in any browser.
- It is the **design spec in executable form.** Don't rewrite it from scratch — extend it in place.
- Your job, in order: **(1)** drop it into the repo as a PWA page, **(2)** swap procedural art for real sprite sheets, **(3)** re-tune hitboxes against the real art using the built-in debug overlay, **(4)** wire the Firebase economy (coins + sunbeams into Lucid Winds), **(5)** content & polish.
- The **whole strategic point** is #4: Puppy Dash is a low-friction acquisition funnel for Lucid Winds (the plant game that's live but has no players). A runner nobody can convert into Lucid Winds sunbeams is just another orphan game. Build the funnel.

---

## 1. What it is & the strategic why

Puppy Dash is a Subway-Surfers-style runner: pick an animal, dodge dog-park hazards, collect bones, grab a rainbow-poop jetpack for an invincible bone-hoovering victory lap.

**Two currencies, one activity:**
- **Bones/biscuits → coins** — spent *inside* Puppy Dash on cosmetics. Low stakes.
- **☀️ Sunbeams** — the **cross-game** currency that also powers **Lucid Winds**. High stakes (they have value in another economy), so they must be minted **server-side**.

The runner is more shareable than a collectible plant game. If "your bones also grow your plants in Lucid Winds," the runner becomes the front door Lucid Winds never had. That linkage is the reason to build this, not a nice-to-have.

---

## 2. Current state — what's already built (in the prototype)

Feature-complete as a prototype:
- **3-lane runner** with a mild-perspective road, parallax hills/clouds, scrolling lane lines.
- **Verbs:** swipe ←/→ switch lane, swipe ↑ / tap jump, swipe ↓ slide. Keyboard: arrows/WASD/space. Instant swipe response + **jump/slide input buffering** (forgiving).
- **Obstacles with telegraphed actions** (floating ▲/▼/⇄ icons): hydrant & cone (jump over), solid wall (dodge lanes), limbo bar (slide under).
- **4 playable animals** (puppy/kitten/bunny/fox), procedurally drawn, selectable.
- **Rainbow-poop jetpack** power-up: pickup → flight to altitude, **invincibility**, a bone stream that follows your lane, fuel bar, speed lines, gold glow, then auto-descent. Ends with a `+N 🦴` bonus floater.
- **Game feel:** ground shadow that shrinks on jump, land squash-and-stretch, screen shake on death, collect particles, combo-pitched collect SFX.
- **Synthesized audio** (WebAudio, no assets): jump, slide, coin (rising with combo), jetpack, crash. Mute toggle.
- **Pause** (button + `P`), **best-distance** tracking, biscuit + total-stash counters.
- **Debug hitbox overlay** (🐞 button or `G`) — see §5. This is your tuning instrument.

**Prototype limits (by design):** no persistence (artifact sandbox has no localStorage/Firebase), placeholder vector art, hitboxes tuned to placeholder proportions.

---

## 3. Architecture of `puppy-dash.html`

Single file: `<style>` + `<canvas>` + `<script>`. One `requestAnimationFrame` loop, `update(dt)` then `render()`, dt-clamped and frame-rate independent.

### 3.1 The core model — screen-space (READ THIS)
Earlier iterations used an abstract depth coordinate and the collision never matched what you saw. The rebuild is **screen-space: an object's real position on screen IS its game position.** Consequences you must preserve:
- Obstacles move **down** the screen (`ob.y` increases) toward the player line.
- **Contact resolves the frame `ob.y` crosses the contact line** (`prevY < cY && y >= cY`) — a swept check that can't fire early and can't tunnel at high speed.
- **Lane hits are horizontal distance:** `|ob.lane - laneF| < laneHitDist`. An obstacle visibly in another lane cannot hit you.

### 3.2 Coordinate system
- `L.PY` = player/foot line (0.82·H). The dog's **feet** are drawn here.
- `L.HY` = horizon (0.30·H). Obstacles spawn here (far/small) and grow as they descend.
- `L.S` = the game's unit size (dog size), derived from lane width `L.LW`. **All hitboxes are in `S` units.**
- `cY = PY + S·contactOffset` = where a hit resolves (slightly onto the dog so it reads as impact).
- `prog(y)`, `dscale(p)`, `lfac(p)` = perspective helpers for size/lane-fan as things approach.

### 3.3 Hitbox system (what you'll re-tune against art)
```
OB_VBOX = { jump:[0,0.70], slide:[1.00,1.75], dodge:[0,1.60] }  // vertical box per action, in S
DOG_STAND = 1.10   // dog standing height (S)
DOG_SLIDE = 0.55   // dog height while sliding (S)
DOG_FOOT  = 0.58   // where feet sit below the sprite origin (visual anchor)
```
Collision = same-lane (`laneHitDist`) AND vertical overlap of the dog box vs `OB_VBOX[action]`. Jump raises the dog box (clears "jump" obstacles); slide shrinks it (clears "slide"); a "dodge" wall spans full height (only a lane change avoids it).

### 3.4 CFG — every feel dial in one object
| Key | Meaning |
|---|---|
| `spd0`,`spdMax`,`speedK`… (`spd0`,`spdMax`) | run speed ramp (screen-heights/sec) + cap |
| `spawn0`,`spawnMin` | seconds between obstacle rows (tightens with distance) |
| `laneSnap` | lane-change tween speed (smaller = snappier) |
| `jumpV`,`jumpG` | jump arc (in S units) |
| `slideTime` | slide duration |
| `contactOffset` | **how far onto the dog a hit resolves — the key "did I hit it fairly?" dial** |
| `laneHitDist` | horizontal collision tolerance (dodge forgiveness) |
| `bufferTime` | input buffering window |
| `jetDur`,`jetCooldown`,`jetAltFrac`,`jetBoneEvery` | jetpack length / frequency / height / trail density |

### 3.5 Draw seams (where art plugs in)
Each is a pure function you will replace with sprite-sheet blits:
- `drawAnimal(ctx,a,x,y,s,t,pose,squash)` — `pose ∈ {run,jump,slide}`; `t` = time (drives run cycle).
- `drawObstacle(ctx,o,x,y,s)` — dispatches on `o.id` (hydrant/cone/wall/limbo).
- `drawBiscuit`, `drawJetItem` (poop pickup), `drawJetpack` (poop exhaust), `drawPoopSwirl`, `drawActionIcon`.
All anchor **bottom-center on the ground point** (`y`). Keep that contract and art drops in without touching physics.

### 3.6 Debug overlay (`state.debug`, 🐞 / `G`)
Draws the contact line (red), the foot line (white), the dog hitbox (blue), every obstacle hitbox (red=in your path / green=safe lane), a resolve ring at each contact (red=hit, green=pass), and a live readout. **This is how you re-tune hitboxes against real art without guessing.**

---

## 4. Build phases (do in order)

### Phase 1 — Repo integration + PWA
- Add as its own page/route (e.g. `/puppy-dash/`) on the site (GitHub Pages or Firebase Hosting — match whatever Lucid Winds uses so they can share an origin & Firebase project).
- Add `manifest.webmanifest` (name, icons, `display:standalone`, portrait) and a minimal service worker (cache the HTML + assets for offline). Keep the single-file ethos where practical; split out only assets (sprites/audio) and the Firebase module.
- Confirm it installs as a PWA and runs offline (minus economy calls).

### Phase 2 — Art pipeline (see §5)
Replace procedural draws with sprite sheets from the Art Bible. Start with the **hero puppy**; lock its look; then the rest.

### Phase 3 — Hitbox re-tune against real art (see §6)
Using the debug overlay, re-fit `DOG_FOOT`, `OB_VBOX`, `contactOffset`, `DOG_STAND/SLIDE` to the real sprite proportions.

### Phase 4 — Persistence + economy (see §7) ← the point
Firebase Auth shared with Lucid Winds, Firestore wallet, **server-authoritative sunbeam mint**.

### Phase 5 — Content & juice
More obstacle types, themed worlds/biomes, cosmetics (tie to the hash-SVG engine reused across your titles), magnet/shield power-ups, daily challenge, leaderboard, real audio.

---

## 5. Art integration spec

**Asset source of truth:** `PUPPY_DASH_ART_BIBLE.md` (style bible, palette, naming, frame counts, minimum-viable set, prompt workflow for Midjourney/Gemini/ChatGPT).

**Loader pattern:**
- Preload sheets into `Image` objects at boot; gate `startRun` on a loaded flag (show a tiny loading state).
- Represent each animation as `{img, frameW, frameH, frames, fps}`; current frame = `Math.floor(t*fps) % frames`.
- Replace the body of each `draw*` seam with `ctx.drawImage(sheet, sx,sy,fw,fh, x-fw/2*k, y-footY*k, fw*k, fh*k)` where `k` scales sprite → `S`. **Preserve the bottom-center ground anchor.**

**Critical anchor rule:** gameplay sprites are **3/4 rear view** (running away from camera), grounded at bottom-center. The select-screen portrait is front-facing. Don't mix them (see Bible §1).

**State → sheet mapping:** `run` (loop), `jump` (play once across the arc — map `state.jump` height to frame), `slide` (hold middle frame while `state.sliding`), plus `stumble` on death and `idle`/`portrait` for menus.

**Keep procedural as fallback:** leave the vector `draw*` functions behind an `if (assetsLoaded) blit(); else vector();` so the game never hard-fails on a missing sheet. (The rainbow-poop jetpack can stay procedural — it's a good gag and cheap.)

---

## 6. Hitbox re-tune checklist (with the 🐞 overlay)

1. Turn on debug. Confirm the **blue dog box** wraps the real puppy sprite (adjust `DOG_STAND`, `DOG_SLIDE`, `DOG_FOOT` so feet sit on the white foot line and the box matches the art).
2. For each obstacle, confirm its **red/green box** matches the art silhouette; adjust `OB_VBOX[action]`.
3. Run into a wall on purpose: the **red resolve ring** should fire right as the art touches the puppy. If early/late, nudge `contactOffset`.
4. Confirm an obstacle one lane over shows a **green** box and never kills you; if adjacent lanes false-trigger, lower `laneHitDist`.
5. Verify jump clears "jump" boxes and slide clears "slide" boxes with a comfortable margin (jump apex ≈ 1.3·S; slide top ≈ 0.55·S).
6. Ship with debug off (it's dev-only; leave the toggle in for future tuning).

---

## 7. Economy architecture (the important build)

### 7.1 Identity — share it with Lucid Winds
Use the **same Firebase project** (or at minimum the same Auth) as Lucid Winds so a player is one identity across both games with **one shared wallet**. If they're separate projects today, the cleanest path is to bring Puppy Dash into Lucid Winds' Firebase project. Anonymous Auth is fine to start (upgrade to linked accounts later).

### 7.2 Firestore shape (illustrative)
```
users/{uid}: {
  coins: number,            // Puppy Dash cosmetics currency (low stakes)
  sunbeams: number,         // CROSS-GAME — also read by Lucid Winds
  cosmetics: string[],      // owned skins/hats
  puppyDash: { bestDistance, totalBones, runs }
}
runs/{uid}/{runId}: {       // append-only audit log of submitted runs
  distance, bones, durationMs, jetpacks, clientNonce, ts, granted
}
```

### 7.3 Coins vs sunbeams — different trust levels
- **Coins** (Puppy-Dash-only): acceptable to write client-side for v1; worst case a cheater buys cosmetics. Validate later.
- **Sunbeams** (cross-game): **must be server-authoritative.** A client that can write `sunbeams` can mint infinite Lucid Winds value. **Firestore rules must deny all client writes to `sunbeams`.** Only a Cloud Function may increment it.

### 7.4 The mint (Cloud Function, callable)
On `gameOver`, the client calls `submitRun({distance, bones, durationMs, jetpacks, clientNonce})`. The function:
1. **Plausibility-caps** the run: max bones per distance & per second, min duration for a given distance (speeds are known from CFG), max jetpacks per run. Reject or clamp outliers.
2. Computes **granted sunbeams** = `f(validatedBones)` with a **daily per-user cap** and a **per-run cap** (so the runner can't flood Lucid Winds and devalue real play there).
3. Writes an entry to `runs/...` (audit) and `increment(sunbeams, granted)` transactionally.
4. Returns `{granted, newSunbeamTotal}`; client shows a "☀️ +N to Lucid Winds" flourish on the game-over card.

Anti-abuse notes: use a monotonic `clientNonce`/idempotency key so a replayed request can't double-mint; rate-limit calls; keep the audit log for spot-checking. Don't over-engineer v1 — soft caps + plausibility + rules covering the `sunbeams` field is enough while player counts are low, but **design the mint as server-side from day one** (retrofitting is miserable).

The prototype marks the exact call site: search `TODO[economy]` in `gameOver()`.

### 7.5 Lucid Winds side
Lucid Winds already reads the user doc — it just needs to read the shared `sunbeams`. Add a small "earned in Puppy Dash" surfacing so players feel the crossover (this is the funnel paying off).

---

## 8. PWA + deployment
- `manifest.webmanifest` + icons (192/512), portrait, standalone, theme color `#74c4ff`.
- Service worker: cache-first for shell + assets, network-first (or skip) for Firebase calls.
- Deploy alongside Lucid Winds (same host/origin ideal for shared Auth cookies). CI via the existing Codespaces/GitHub Pages or `firebase deploy` flow.

---

## 9. Roadmap / stretch (post-MVP)
- **Cosmetics from the hash-SVG engine** (your reused generative asset) — infinite skins minted from seeds; coins unlock them. This is the "improvement on Subway Surfers" differentiator.
- Themed **worlds/biomes** (park → beach → night) with palette swaps.
- More power-ups: **magnet** (pull bones), **shield** (one free hit), **zoomies** (speed burst).
- **Daily challenge** + **leaderboard** (Firestore).
- Real **audio** (see Bible §11) — the synth SFX are placeholders.
- **Sunbeam events** — e.g., a golden-bone streak during jetpack converts to a bigger sunbeam payout, making the cross-game moment feel special.

---

## 10. Open decisions for Stephen
1. **Firebase:** fold Puppy Dash into Lucid Winds' existing project, or new project with shared Auth? (Recommend: same project.)
2. **Sunbeam exchange rate & daily cap** — what's a fair bones→sunbeams number that rewards runners without devaluing Lucid Winds play?
3. **Accounts:** anonymous-first (frictionless) then link, or require sign-in to earn sunbeams?
4. **Art scope for launch:** puppy-only MVP, or all four animals at launch?
5. **Keep the rainbow-poop jetpack as the hero power-up** (yes — it's the shareable moment), and does Penny want to name/design the worlds?

---

## 11. File manifest (this handoff)
- `puppy-dash.html` — the working prototype / executable design spec. Extend in place.
- `PUPPY_DASH_ART_BIBLE.md` — full art asset plan, style bible, naming, prompt workflow.
- `PUPPY_DASH_BUILD_SPEC.md` — this document.

**First move for the incoming instance:** get `puppy-dash.html` running as a PWA page in the repo, confirm the debug overlay works, then start Phase 2 with the hero puppy. Don't tune hitboxes until real art is in — you'll only redo it.
