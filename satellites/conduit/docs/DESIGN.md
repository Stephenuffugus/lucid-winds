# CONDUIT — build handoff for Claude Opus (Claude Code)

**Supersedes:** CONDUIT-handoff.md (design session doc). This version is
self-contained: it carries everything from the original, plus a verified
numeric spec, an economy stress-test summary, resolved open questions,
enemy AI timers, mobile input spec, and an updated asset plan.

**Owner's stack (respect this):** single-file vanilla HTML/CSS/JS, no build
step, mobile-first, canvas 2D, deployed to Firebase Hosting / GitHub Pages,
often edited from a phone via Codespaces. No engines, no bundlers.

**Your first session:** read sections 2–6, then build Phase 0 (section 12)
in one file with rectangles. Do not touch rendering polish, 3D, or assets
until the ship gate (section 12) passes.

---

## 1. The pitch

You are an alien fluid — ferrofluid crossed with a symbiote. Matte black,
iridescent at the edges, spiking along field lines, able to flow up walls
and through grates. You infiltrate a site and take it apart from the inside
without being seen. You carry no weapons and build nothing. You **repurpose
the site's own machinery by wiring it up — and the wire is your own body.**

## 2. The core mechanic

**To route power, you stretch part of yourself along the path and leave it
there.** One rule, three genres:

- **Routing puzzle** (Flow Free): source → device, around obstacles. Path
  length is the cost.
- **Resource economy:** conduit is made of you. Every metre you lay is a
  metre you are not.
- **Novel stealth:** you leave a persistent, discoverable trail — and a
  discovered conduit *points somewhere*.

Every level is the same question in different shapes: the short route is
cheap and exposed, the long route is safe and expensive, and you do not
have enough of yourself to be safe everywhere.

---

## 3. Mass — the spine (verified spec)

One number, **mass**, shown as % of capacity. It is simultaneously health,
ammo, reach, body size, and stealth profile.

- **Full** (>70): can force doors, survives hits, conspicuous, slow, cannot
  enter vents.
- **Thin** (<30): fits grates and vents, nearly invisible, one hit from
  death, no budget to wire anything.
- Squeeze (<30) and force (>70) are **deliberately mutually exclusive** so
  "force this door AND enter that vent" is unsolvable until splitting.

### 3.1 The economy, stress-tested

A simulation of the numbers below was run before this handoff was written.
Findings you must build around:

1. **The reclaim tax is not the main pressure on successful plays.**
   Break-even conduit length = harvest ÷ 0.25 → 48–120 tiles for enemies
   worth 12–30. On a 48×32 map, almost every completed kill is profitable.
   The tax's real job is punishing *abandoned and re-planned routes*. The
   real pressure on live plays is **liquidity**: mass committed to conduit
   is mass missing from your body. A 35-tile trap leaves you at 65 —
   below force, above squeeze, mid-sized and mediocre at everything —
   exactly when a patrol is walking into it. Wealthy but illiquid. Design
   levels and tune damage around *that* tension.
2. **Capacity overflow rule (required).** A clean kill (20-tile route,
   harvest 18, reclaim +15) totals 113 vs cap 100. Without a rule,
   efficient play wastes its reward. **Overflow converts to meta-currency
   ("residue") at 1:1** and feeds the Economy medal. Never silently
   discard it.
3. **Squeeze-by-wiring is emergent and good.** Laying 71 tiles from full
   drops you under the squeeze threshold — laying conduit doubles as
   slimming down. Keep it, teach it in an early level (wire a long safe
   loop *specifically to get thin enough* for a vent).
4. **Death-spiral guards (required):**
   - You cannot lay conduit that would drop any blob below **5 mass**.
   - Wall sockets always allow draining at **+1 mass / 2 s** while
     touching, even at alert 4. This is the guaranteed climb-out floor.
   - A destroyed (not reclaimed) conduit refunds **0%** — that risk is
     real and the sim confirms it can kill you; the floor above is what
     makes it recoverable rather than a softlock.
5. **The invariant needs a ledger.** `sum(blob.mass) + sum(conduit.cost)
   === owned` only holds if the 25% reclaim tax, damage, and overflow are
   recorded as explicit debits/credits to `owned`. Implement a tiny mass
   ledger (section 11) and **assert every frame in dev**. Every bug in
   this game will be a mass leak.

### 3.2 CONFIG — every tunable in one object

Put this literally at the top of the file. Nothing numeric lives anywhere
else.

```js
const CFG = {
  // mass economy
  capacity: 100, capacityMax: 180,
  costPerTile: 1, concealedMult: 1.6,
  reclaimRate: 0.75,          // refund fraction
  reclaimSpeed: 6,            // tiles/sec retraction (Q4: retract, not instant)
  minBlobMass: 5,             // cannot spend below this
  socketTrickle: 0.5,         // mass/sec while touching a socket
  squeezeAt: 30, forceAt: 70,
  harvest: { drone: 12, sentry: 18, brute: 30, decaySec: 30 },
  drainSpentSource: 5,

  // movement (speed multiplier by mass — full is slow, thin is quick)
  speedBase: 5.0,             // tiles/sec at mass 50
  speedCurve: m => 1.25 - 0.005 * m,   // 1.15x @20, 0.75x @100

  // combat
  enemyDamage: { drone: 8, sentry: 12, brute: 20 },
  liveConduitZap: 15,         // damage to enemy stepping on live conduit…
  zapBurnsTiles: 3,           // …destroys 3 tiles of it (Q5: yes, and it costs you)

  // detection (see §5 for the model)
  spotSecondsBlob:    { exposed: 0.8, shadowed: 2.5 },   // full-size, in cone
  spotSecondsConduit: { exposed: 1.5, shadowed: 4.0 },   // concealed: never
  sizeSpotFactor: m => 0.4 + 0.6 * (m / 100),  // thin blobs spotted slower
  hearingNoisy: 1.5,          // multiplier while generator runs
  alertDecaySec: [0, 8, 15, 30, Infinity],  // time to de-escalate from state n

  // modes
  flowRequires: "stationaryAndUnseen",  // §8 — chosen cost model
  flowTimeScale: 0.10,        // Q2: slowed, not paused (phone-friendly enough)
  pulseCost: 4, pulseRange: 8, pulseCooldownSec: 6,

  grid: { w: 48, h: 32, tilePx: 22 },
};
```

Values are opening guesses, but they are *coherent* guesses — the sim in
§3.1 was run against them. Change them only through playtests, and change
them here only.

---

## 4. Fluid "physics" — what to build and what to skip

The owner asked about ferrofluid physics research. Answer: **do not
simulate fluid.** Real ferrofluid behaviour (Rosensweig spiking) is an
aesthetic, already solved procedurally in Appendix A, and it is a
*behaviour*, not a fluid sim. The gameplay object is simple:

- **Gameplay model:** each blob is a point with continuous position on the
  tile grid, a mass, and a radius `r = r0 * sqrt(mass/100)`. Collision is
  circle-vs-tile. Squeeze check is mass vs `CFG.squeezeAt`, nothing more.
- **Feel layer (cheap soft-body):** render radius chases true radius with
  a spring (`k≈12, damping≈0.8`) so hits and harvests visibly ripple.
  While squeezing through a gap, draw the blob as a stretched capsule
  (length ∝ speed, width = gap) — pure rendering, zero physics.
- **Field direction for Appendix A's `ferroBlob`:** priority order —
  nearest live conduit direction → nearest powered source → velocity.
  The shape must read as information.
- **Conduit rendering:** same language — a thin ferrofluid ribbon whose
  spikes stand up when live. A polyline through tile centres with the
  Appendix A rim treatment is enough for Phase 2.

If deeper reference is ever wanted: search "Rosensweig instability" for
imagery, not equations. No CFD, no particles in Phase 0–1.

---

## 5. Detection model and enemy AI

### 5.1 Spotting math

Per enemy, per frame, for each spottable thing (blob or conduit tile) in
the vision cone with line-of-sight:

```
progress += dt / spotSeconds(thing, exposureTier)
            * proximity          // 1.0 adjacent → 0.5 at max range
            * sizeSpotFactor(m)  // blobs only
```

At progress ≥ 1 the enemy escalates. Progress decays at 0.5/s when the
thing leaves the cone. Concealed conduit is never spotted. Insulation
upgrades multiply conduit spotSeconds by 1.5× per rank.

### 5.2 Escalation FSM (site-wide alert 0–4)

1. **Calm** — patrol routes.
2. **Suspicion** — investigates the spot (or walks the conduit — see
   below), returns after `alertDecaySec[1]`.
3. **Search** — cones widen +20°, patrols overlap, speed +25%.
4. **Alarm** — reinforcements spawn at entries, doors lock.
5. **Lockdown** — **power cut site-wide.** All live conduits go dead (mass
   stays committed; reclaim still works — reclaiming your wire in the dark
   is the lockdown loop). Devices inert. The breaker room re-energises the
   site: reaching it and wiring socket→breaker is itself a routing puzzle.
   Lockdown does not hurt you. It disarms you. The player keeps playing.

**Q1 resolved (default):** a guard who spots conduit walks it **toward the
device**, giving the player time to intervene — a mistake becomes a scene,
not a loss. Ship a debug flag `guardFollowsToPlayer` to test the other way.

### 5.3 Enemy spec (Phase 0 needs only sentry)

| Kind   | Move | Cone | Range | Hearing | Mass (=harvest) | Damage |
|--------|------|------|-------|---------|-----------------|--------|
| drone  | 3.5  | 60°  | 7     | 4       | 12              | 8      |
| sentry | 2.5  | 70°  | 9     | 6       | 18              | 12     |
| brute  | 1.8  | 80°  | 8     | 8       | 30              | 20     |

Harvest yield **equals** the enemy's mass field — one source of truth, no
separate table. Downed bodies decay in 30 s (use it or lose it).

---

## 6. Sources and devices

**Do not let the player build devices.** They repurpose what exists. It
fits the fantasy, caps art cost, and keeps each level a fixed puzzle.

Sources: wall socket (low, infinite, safe), battery cart (medium,
draggable slowly while exposed), generator (high, loud — hearing ×1.5
site-wide while running), vehicle battery (one-shot burst), downed enemy
(small, decays).

Devices: floodlight (blinds enemies facing it, lights area — reveals your
own conduit), fan (pushes objects, noise lure), sprinkler (wets area),
speaker (lures — the workhorse), magnetic crane (drops/crushes, drags
carts), door lock (open/seal — trap a patrol), camera (recon without
spending mass), coolant vent (freezes — a frozen enemy is a stationary
battery), floor plate (electrifies a tile — useless dry, **lethal wet**).

**Teach sprinkler + floor plate explicitly in level 2.** It is the lesson
that devices are inputs to each other, not buttons.

Power model for Phase 0: a device turns on iff a live conduit connects it
to a source with `capacity ≥ device.needs`. No amperage simulation yet.

---

## 7. Modes and mobile input

**Prowl** — over-the-shoulder in Phase 3; in Phase 0–2 it is simply the
real-time close view. Flow, climb, hide, harvest.

**Flow** — camera lifts to top-down, time at 10%. Draw conduit by
dragging; vision cones and exposure shading visible. **Entry condition
(chosen from the original's options): only while stationary and unseen.**
Finding a safe corner becomes part of the loop, and Flow needs no mass
cost on top. Keep `flowTimeScale` so long planning still has a price.

**Pulse** — momentary sonar: costs 4 mass, 8-tile radius, 6 s cooldown,
reveals sources/devices/enemies through walls briefly.

Touch spec (build mobile-first, test on a phone from day one):
- Drag anywhere: move blob (relative joystick, not tap-to-move).
- Two-finger tap or dedicated corner button: enter/exit Flow (greyed out
  unless stationary+unseen).
- In Flow: drag from a source or conduit end to extend a route; tap a
  laid conduit then "reclaim" to start retraction; tap device to toggle
  if powered.
- Long-press blob: Pulse.
- Buttons ≥ 48 px. Canvas resizes to viewport; landscape primary.

---

## 8. The loop, splitting, theme (carried over)

**30 s:** flow → hide → observe → pulse → note a source.
**2–5 min:** source → Flow → route to device → trigger → patrol
neutralised → harvest → reclaim → mass recovered minus tax.
**Level (15–30 min):** infiltrate → map → neutralise targets → restore
mass → exfiltrate. **Meta:** spend residue on permanent traits; next site
bigger.

**Splitting (Phase 4, designed-for from day one):** divide into blobs; you
control one while others hold position, hold a circuit closed, or decoy.
A sub-squeeze split solves force-a-door-and-enter-a-vent. **The player
entity is a list of blobs from the first commit, even at length 1.**

**Theme:** go non-human — off-world facility, insectoid/crustacean
defenders. Harvesting is clean rather than grim, art is freed from
realism, machinery can be strange. The protagonist stays black iridescent
fluid regardless; organic-vs-industrial contrast is the visual identity.

---

## 9. Scoring

Four medals, never summed: **Ghost** (peak alert), **Efficiency** (tiles
laid), **Economy** (net mass at exfil + residue banked), **Speed**. A
one-long-clever-route player should feel as rewarded as a never-seen one.

---

## 10. Resolved open questions (defaults + test flags)

| # | Question | Default | Debug flag |
|---|----------|---------|-----------|
| 1 | Discovered conduit leads guard where? | To the device | `guardFollowsToPlayer` |
| 2 | Flow paused or slowed? | Slowed to 10% | `flowPaused` |
| 3 | Can conduit cross itself? | **No** (Flow Free rule; harder = better) | `allowCrossing` |
| 4 | Reclaim instant or at speed? | Retracts at 6 tiles/s — creates caught-mid-pull moments | `instantReclaim` |
| 5 | Live conduit hurts enemies stepping on it? | Yes, 15 dmg, burns 3 tiles of the run | `zapEnabled` |
| 6 | Floor when dry? | minBlobMass 5 unspendable + socket trickle always available | — |

Every flag lives in CFG. Test each with a real playtest before hardening.

---

## 11. Data schemas and the mass ledger

```js
const level = {
  id: "site-01", w: 48, h: 32,
  tiles: [],          // per-tile: type, exposure(0 exposed/1 shadowed/2 concealed-capable), passable, squeezeOnly, wet
  sources:  [{ id, x, y, kind: "generator", capacity: 100, noisy: true }],
  devices:  [{ id, x, y, kind: "sprinkler", needs: 20, on: false, area: [] }],
  enemies:  [{ id, x, y, kind: "sentry", route: [[x,y]], state: "calm" }], // stats from §5.3 table by kind
  targets:  ["enemy-3", "enemy-4"],
  breaker:  { x, y },       // lockdown recovery
  exfil:    { x, y },
};

const player = {
  blobs: [{ id: "core", x, y, mass: 100, active: true }],  // ALWAYS a list
  capacity: 100,
  traits: { insulation: 0, pulseRange: 8, maxSplits: 1 },
  residue: 0,                // overflow meta-currency
};

const conduit = {
  id, sourceId, deviceId,
  path: [[x,y]],             // ordered tiles; no self-crossing
  costPerTileActual: [],     // 1 or 1.6 per tile (concealed)
  cost: 24,                  // total mass committed
  live: false, discovered: false,
  reclaiming: false, reclaimIndex: 0,   // retraction progress from far end
};

const ledger = {
  owned: 100,                // authoritative total
  debits: { reclaimTax: 0, damage: 0, zapBurn: 0, destroyed: 0 },
  credits: { harvest: 0, drain: 0, trickle: 0 },
  toResidue: 0,              // overflow converted
};
// DEV ASSERT EVERY FRAME:
// sum(blobs.mass) + sum(conduits.cost) === ledger.owned
```

Reclaim implementation: pop tiles from the far end at `reclaimSpeed`,
crediting `tileCost * reclaimRate` to the nearest blob per tile and
debiting the remainder to `ledger.debits.reclaimTax`. Overflow above
capacity goes to `residue` via `toResidue`. Destroyed conduit debits its
full remaining cost to `debits.destroyed`.

---

## 12. Build phases and the ship gate

### Phase 0 — prove the loop (build this first, one file, rectangles)
- Grid map: walls, cover, floor exposure tiers, one squeeze-only gap
- One blob: mass, movement with speed curve, squeeze/force checks
- One sentry: cone, hearing, full 5-state escalation incl. lockdown stub
- One socket + generator; speaker + floor plate + sprinkler
- Conduit: drag-to-lay in Flow, per-tile cost, no crossing, reclaim at
  speed, exposure per tile, discovery + guard-walks-the-wire
- Harvest, drain, trickle floor, ledger + per-frame assert
- Win: target neutralised and exfil reached; four medals shown

**SHIP GATE — hold to this before building anything pretty:** play five
runs. Is route → trigger → harvest → reclaim *fun with rectangles*? Write
the honest answer at the top of HANDOFF.md. If no, iterate CFG and level
layout inside Phase 0. Nothing downstream saves a loop that isn't fun
here.

### Phase 1 — depth
Full device/source lists, combos, 3–4 enemies, lockdown + breaker
restoration for real, three hand-authored levels, save/load
(localStorage), residue + trait purchases.

### Phase 2 — feel
Appendix A rendering for blob and conduit, squeeze capsule animation,
Flow camera lift as an animated transition even in 2D, procedural audio
(WebAudio), haptics (navigator.vibrate).

### Phase 3 — the third-person camera
Only now. Three.js from a single script tag fits the no-build constraint.
**The 2D simulation remains the source of truth**; 3D is a renderer.
Flow stays genuinely top-down; Prowl drops to the shoulder.

### Phase 4 — splitting, progression, more sites.

---

## 13. Pitfalls (unchanged, still binding)

- Do not let the player build devices.
- Do not make detection instant failure — escalation to lockdown.
- Do not start in 3D.
- Do not implement a single-blob player. Use a list.
- Do not let Flow mode be free.
- Do not tune reclaim to 100%. The tax is the puzzle — specifically, the
  tax on *changing your mind*; liquidity is the pressure on live plans.

---

## Appendix A — ferrofluid rendering (verified, carried over)

Ferrofluid reads as ferrofluid because of the Rosensweig instability — it
spikes along field lines. Behaviour, not texture; procedural, and no
generated asset can replace it.

```js
// Deform a blob outline along a field direction.
// fa = field angle, s = field strength 0..1
function ferroBlob(cx, cy, r, fa, s, seed, detail){
  const N = detail || 96, nS = 7;
  s = Math.max(0, Math.min(1, s));
  const pts = [];
  for(let i = 0; i < N; i++){
    const th = i / N * Math.PI * 2;
    const al = Math.cos(th - fa);
    const pole  = Math.pow(Math.abs(al), 4);                       // both poles
    const cones = Math.pow(Math.max(0, Math.cos((th - fa) * nS)), 10);
    const wob = 0.055 * Math.sin(th * 5 + T * 1.1 + seed)
              + 0.035 * Math.sin(th * 9 - T * 0.7 + seed * 2.3);
    const k = 1 + 0.30 * s * pole + 0.55 * s * pole * cones + wob * (0.5 + 0.5 * s);
    pts.push([cx + Math.cos(th) * r * k, cy + Math.sin(th) * r * k]);
  }
  return pts;
}

// Smooth the point ring into a closed path (midpoint quadratics).
function tracePts(ctx, pts){
  ctx.beginPath();
  ctx.moveTo((pts[pts.length-1][0] + pts[0][0]) / 2,
             (pts[pts.length-1][1] + pts[0][1]) / 2);
  for(let i = 0; i < pts.length; i++){
    const a = pts[i], b = pts[(i+1) % pts.length];
    ctx.quadraticCurveTo(a[0], a[1], (a[0]+b[0])/2, (a[1]+b[1])/2);
  }
  ctx.closePath();
}

// Matte near-black body, thin oil-slick rim across the field axis, one specular.
// Ferrofluid is not shiny all over. It is black with an iridescent edge.
function paintFerro(ctx, cx, cy, r, fa, hueA, hueB){
  const g = ctx.createRadialGradient(cx - r*0.34, cy - r*0.4, r*0.06, cx, cy, r*1.5);
  g.addColorStop(0, "#232733"); g.addColorStop(0.35, "#12141C"); g.addColorStop(1, "#05060A");
  ctx.fillStyle = g; ctx.fill();
  const lx = Math.cos(fa), ly = Math.sin(fa);
  const rim = ctx.createLinearGradient(cx - lx*r, cy - ly*r, cx + lx*r, cy + ly*r);
  rim.addColorStop(0,    `hsla(${hueA},90%,64%,.85)`);
  rim.addColorStop(0.42, `hsla(${(hueA+hueB)/2},80%,52%,.30)`);
  rim.addColorStop(0.72, `hsla(${hueB},92%,60%,.60)`);
  rim.addColorStop(1,    `hsla(${hueB+26},95%,72%,.9)`);
  ctx.strokeStyle = rim; ctx.lineWidth = 1.5 + r*0.045; ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.beginPath();
  ctx.ellipse(cx - r*0.33, cy - r*0.42, r*0.30, r*0.17, fa + 0.6, 0, 7);
  ctx.fillStyle = "rgba(226,236,255,.30)"; ctx.fill();
  ctx.restore();
}
```

Verified: longest spike tracks the field within 1°; elongation scales
1.09×–2.1× with no degenerate geometry. Rim hues: violet 268 → gold 44.
Field priority: nearest live conduit → nearest powered source → velocity.
Conduit uses the same language — a ribbon whose spikes stand when live.

## Appendix B — asset plan (updated toolset)

Available: **Blender, Meshy (premium), ChatGPT Pro, Gemini Pro.**
(Midjourney from the original doc has expired — reassign its jobs.)

- **The creature and the conduit stay procedural. Never generate them.**
  A static asset would be a downgrade of the field-reactive behaviour.
- **Phase 0–2 need zero assets.** Rectangles, then Appendix A. Do not
  spend asset budget before the ship gate passes.
- **Tileable textures & colour keys** (floors, walls, grating, per-site
  lighting key): Gemini Pro or ChatGPT image generation, requested as
  seamless tiles at 512², desaturated so the iridescent creature owns all
  colour.
- **Phase 3 set dressing** (crates, generators, pipework, insectoid
  props): Meshy text-to-3D → **Blender** for decimation, re-UV, and
  baking to a single atlas → export glTF for three.js. Budget: <10k tris
  per prop, one 1024² atlas per site. Enemy silhouettes: concept via
  image gen first, model only the winners.
- **ChatGPT/Gemini as second hands** on level-layout generation and code
  review, not art direction — the art direction is already decided
  (organic black fluid vs hard industrial geometry).

## Appendix C — first-session checklist

1. Read §2–6. Everything else is downstream.
2. Copy CFG verbatim. All numbers live there.
3. Build Phase 0 in one HTML file. Rectangles only.
4. Player = list of blobs, length 1.
5. Ledger + per-frame invariant assert before any features.
6. One full cycle: route → trigger → harvest → reclaim.
7. Play five runs. Answer the ship gate honestly in HANDOFF.md.
8. Only then read the rest.
