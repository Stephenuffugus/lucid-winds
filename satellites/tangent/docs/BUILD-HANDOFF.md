# TANGENT — master build handoff

> ## ⚠️ VERIFIED CORRECTIONS, added 2026-09-01 after a six lens audit
> This document is the design record and is kept as written. These specific
> claims in it are **false against the shipped code**, each checked by running
> the game rather than reading it. Trust this block over the body text.
>
> | Claim in this doc | What the code actually does |
> |---|---|
> | §5 / §12 "live sim and predictor share one integrator" | They called the same function at **different step sizes** (1/60 predicting, 1/120 running), so the drawn line was a near miss of the run. **Fixed 2026-09-01**; check [11] in `test/smoke.js` now measures it per system. |
> | §4 "Scoring bands on closest approach: 26 / 60 / 112" | Those numbers appear nowhere. Landing is flat rate capture, with one graze band at 80. |
> | §7 "The runtime system is a deep copy" | It was a one level spread sharing each hole's `other` block with LEVELS by reference. **Fixed 2026-09-01**, check [14]. |
> | §15.7 "predictor cache interval, currently every 2 frames" | It counted CALLS and four places asked per frame, so it recomputed about 1.4 times per frame. **Fixed 2026-09-01.** |
> | §3 / D1 "OM_IDLE 1.15, ball starts settled at r ≈ 37" | `OM_IDLE` holds for about half a second. The deck decays to **ω=0.750** (TH_FLOOR times SPIN_GAIN over SPIN_DRAG) and the ball spirals inward toward **r=15.6**, still falling at r=20 after six seconds. There is no resting orbit at 37. A true park needs `TH_FLOOR` 0.46, which is a Director call. |
> | §4 "OMEGA_MAX ... only matters transiently" | It never binds at all: terminal spin is SPIN_GAIN over SPIN_DRAG = 2.5, under the 3.05 ceiling. Raising it in v6 changed no spin speed and only loosened the tear apart gate, which triggers at 0.72 times OMEGA_MAX. |
> | §16 "release ... the rim still auto releases if you ride into it" | `rimWall` has no exit path. The wall always retains; only the player launches. |
> | §8 solvability table | Stale. Run `node test/sweep.js` for the live numbers. |
> | §12.1 the deck as the moat | True as an ambition, **not true in the build**: every gated system clears with an empty deck, and measured per bearing the deepest the ball reaches bare versus with one part differs by at most 10 units against a 17.4 gate capture radius. Parts deflect, they do not open territory. See the T4 entry in HANDOFF-TANGENT.md. |
>
> Also note: `sfx.near` and `sfx.click` were defined and never called (wired 2026-09-01), and there was no `AudioContext.resume()` anywhere, which on a phone is permanent silence with every voice correct.


**Builder:** Claude Opus 5, in a GitHub Codespace.
**Reviewer:** Claude Fable 5 checks the finished work against section 15.
**Owner:** solo indie dev, publishes under Sky Walk Studio / Lucid Winds.
Ships single-file vanilla HTML/CSS/JS PWAs, no build steps, mobile-first,
deploys to Firebase Hosting and GitHub Pages, and frequently works from a
phone. Every decision below respects that.

**Bring alongside this document:** `tangent-v6.html` (the canonical playable
prototype, ~1,250 lines, one file) and `TANGENT-design.md` (the full design
history). This document is self-sufficient if those are missing — the critical
code is in the appendices — but the prototype is the ground truth for feel.

---

# PART I — WHAT THIS GAME IS

## 1. One paragraph

You stand at a spinning dish — the deck — with a ball riding it. Holding the
throttle spins the deck faster, which walks the ball outward into a wider
orbit; letting go launches it on whatever tangent it happens to be travelling.
The ball flies out into a small gravity system of named bodies: land on the
target, avoid the hazards, sling past the heavies. Black holes turn the whole
world inside out — literally, by circle inversion — and some bodies only exist,
or only become your target, on the other side. Before each run there is a build
phase: parts bolted to the deck that delay, deflect and route the ball through
checkpoint gates, under a mass-balance constraint that will tear the deck apart
if you stack everything on one side.

Everything on screen is ferrofluid: matte black, iridescent-rimmed, spiking
along the live gravity field. The look is procedural and it is a readout — the
ball visibly reaches toward whatever is pulling on it.

## 2. Why this game and not another

A prior-art search (documented in TANGENT-design.md §12.1) found the
launch-into-gravity-field genre crowded: Gravitura, Gravity Launch, Gravity
Sling, Slingshot Orbit, Gravity Assist, and Starfling (which is a single HTML
file with tap-to-release orbits — uncomfortably close to our flight phase).

What none of them have is the **deck**: a buildable, mass-balanced, physically
simulated centrifuge as the launcher, and a black hole that inverts the world.
The deck and the inversion are the moat. The flight is table stakes. Build
accordingly: polish and content effort goes to the deck and the far side first.

## 3. The three phases of a run

1. **Build** — place parts on the stationary deck against a budget and a
   balance tolerance. Camera tight on the deck.
2. **Spin** — deck idles at ω=1.15; hold the throttle to spin up; the ball
   walks outward; a live dashed prediction shows exactly where you go if you
   let go now; edge chevrons point to off-screen bodies with live distances.
   **Letting go of the throttle launches.**
3. **Flight** — camera pulls out; N-body gravity; land, crash, get lost, or
   fall into a hole and invert. Results card with score breakdown; best score
   persists per level.

---

# PART II — THE DECISION LOG. READ THIS BEFORE CHANGING ANYTHING.

Six versions were built and tested in one session. Several approaches failed
in instructive ways. **Do not re-derive these. Do not re-try the failures.**

### D1. Flat deck → dish (v1→v2). LOCKED.
A flat spinning plate with surface friction produces an exponential outward
spiral: the ball crawls near the hub ~2.6 s, then crosses the outer third in
0.25 s. Parts near the rim get ~3 frames of relevance. No drag tuning fixes the
shape. The fix is structural: the deck is a **dish** with inward pull `BOWL·r²`,
giving every spin rate one **stable** orbit radius `r_eq = ω²/BOWL`. The
throttle becomes a radius dial, not a timer. This is the single most important
design fact in the project.

### D2. The predictor must be honest (v1). PRINCIPLE.
A predictor that draws "where you'd go if released now" when release is not
actually available now (v1 launched at the rim, ~0.5 s later, 70° of deck
rotation later) is a lie and made play worse. Rule: whatever the prediction
shows must be exactly what the release action produces. In v6 this is trivially
true because release is instantaneous — keep it true.

### D3. Timing-only aiming was a coin flip (v1→v2). CONTEXT.
Launch heading is locked to exit position, which sweeps ~109°/s. Dead-centre
required ~1.6° ≈ 15 ms. Solved by (a) the honest predictor, (b) gravity wells
strong enough to catch near misses (targets got 2.6× mass), (c) instant release.

### D4. The port/latch system is DEAD (v3→v6). LOCKED BY OWNER PLAYTEST.
v3 added a rim wall with player-placed exit Ports and an arm-the-latch step, to
push weight onto the build phase. It tested well in bots and **failed the first
human contact**: the owner could not launch at all (no port placed → ball
bounces forever), and the interaction was illegible. It has been fully removed.
The control is: **hold throttle, let go to launch; a Launch button does the
same thing.** Do not re-add exit gating, arming steps, or any condition on
release. The retaining wall itself remains (rim-riding feel), but it retains,
it never imprisons: `doRelease()` is unconditional.

### D5. The build layer's job (v6). CURRENT POSITION.
Parts serve **gates, balance, and routing**, not the launch. The differentiation
argument (deck = moat) stands, but expressing it by gating the exit was wrong.
If the build layer needs more weight, add it through level design (gates that
genuinely require parts) — never through control friction.

### D6. Wall friction physics (v3). LOCKED NUMBERS.
For the ball to drift around the rim (rather than freeze in co-rotation), the
wall needs friction applied in a **contact band** (1.6 units), with restitution
0.05 (at 0.45 the ball chatters and gets ~1/5 of the intended drag), and
`WALL_DRAG = 2.0`. Higher drag (≥6) bleeds so much speed the dish pulls the
ball off the wall entirely. These numbers were swept empirically; the reasoning
is in TANGENT-design.md §12.3.

### D7. Forgiveness lives in the wells, not the controls (v3). PRINCIPLE.
When landing windows collapsed to ~2° of rim, the fix was not aim assist but
stronger targets: 2.6× mass, radius 28, so the gravity well catches near
misses. Current target gravitational parameters: 5.7–6.8e6, hazards 0.4–1.6e6,
heavies ~3.4e6, holes 0.8–1.25e7. Calibration: a 190 u/s pass offset 160 units
bends 20° at m=1e6, 67° at 3e6, captures at 6e6.

### D8. Inversion is circle inversion (v4). LOCKED.
`d → R²/d` about the hole's horizon, bearing preserved. Animated in log space:
`d(t) = R^{2t}·d₀^{1-2t}`, so at t=0.5 **every object sits on the horizon ring
simultaneously** — that collapse is the signature visual. The ball re-emerges on
the horizon at its entry bearing, heading outward, at 45% of entry speed
(clamped 55–120): the slowdown is what lets far-side gravity act. Duration
1.5 s + 0.18 s hold.

### D9. "Finish it inverted" needs side-locked bodies (v4). LOCKED.
Three attempts at pure geometry failed (reachable from the far side, or flung
out of range). The working mechanic: `side: 0|1` on a body — it only exists
(gravity, collision, colour) when `inversions % 2` matches; off-side bodies
render as dashed outlines labelled "· other side". Separately `targetSide: 0|1`
makes a body a hazard on one side and the target on the other (`isTarget()`),
threading through collision, halo, rim hue and label.

### D10. The far side varies (v5/v5.1). LOCKED DIRECTION.
Each hole carries `other: {inv, tint, tintAmt, mode, bloom, bloomColor,
gravMul, hueA, hueB}`. Colour: a strict negative is only one option; partial
inversion + tint wash + bloom gives each far side a character (Maw: seared
rust at 1×; Nix: drowned teal at 0.72×; Cess: verdant green at 0.86×).
Mechanics: `gravMul` (0.65× / 1.35× / 1.5×) runs through both physics and
predictor because both use the same `flyStep`.

### D11. Ferrofluid is procedural (v5). LOCKED.
The look comes from the Rosensweig instability — spikes along field lines. We
already compute the field; `ferroBlob()` deforms outlines along it (verified:
longest spike within 1° of field angle; elongation 1.09×–2.1×, no degenerate
geometry). **Never replace the creature/bodies with static generated assets.**
Rendering: matte near-black fill, thin oil-slick rim gradient across the field
axis, one hard specular. Deck is machined metal for contrast.

### D12. Camera (v6). LOCKED BEHAVIOUR.
Spin phase: deck fills ~68% of the short screen dimension (it was 32 px when
framing the whole system — unplayable). Release: smooth ~0.3 s pull-out to fit
the system (`camZ` lerp). Off-screen bodies get edge chevrons with name + live
distance, colour-coded (cyan target / magenta hazard / violet hole). Spokes
stay visible during spin plus one bright index mark; a featureless disc reads
as motionless.

---

# PART III — COMPLETE TECHNICAL SPECIFICATION

## 4. Constants (current, verified)

```js
const DECK_R=100, BALL_R=3.4;
const MU=2.2, SPIN_GAIN=7.5, SPIN_DRAG=3.0;         // throttle τ = 0.33 s
const OM_RIM=1.9, BOWL=OM_RIM*OM_RIM/DECK_R;        // BOWL = 0.0361
const OMEGA_MAX=3.05, OM_IDLE=1.15;                 // idle orbit r ≈ 37
const TH_FLOOR=0.30, DT=1/120, RUN_LIMIT=34;
const FLY_H=1/60, FLY_STEPS=1500, FLY_BOUND=2200;
const HOLE_ANIM=1.5, HOLE_HOLD=0.18;
const WALL_REST=0.05, WALL_DRAG=2.0, CONTACT=1.6;
// PORT_W and DECK_STEPS are dead code from the removed port system — delete.
```

Key relations: `eqRadius(ω) = ω²/BOWL`. Terminal ω = SPIN_GAIN/SPIN_DRAG = 2.5
at full throttle (OMEGA_MAX only matters transiently). Scoring bands on closest
approach: 26 / 60 / 112 — but landing itself is capture: `d < b.r + BALL_R`.

## 5. On-deck physics (`advanceDeck`, one fixed step)

Order matters and all of it runs on a plain state object so the live sim and
the predictor share one integrator:

1. throttle lerps to target (rate 7/s), ω integrates with SPIN_GAIN/SPIN_DRAG,
   clamps at OMEGA_MAX; θ += ω·DT
2. surface drag toward the deck's local surface velocity (−ωy, ωx), coupling
   MU; brake zones ×3.4 on MU; booster zones +200 outward
3. dish pull: −BOWL·r² radially
4. integrate position
5. `collideOn`: rails and bumpers, resolved in the **rotating frame**
   (v_rel = R(−θ)·v_world − ω×r_local; reflect; transform back). Rail
   restitution 0.72, bumper 1.12.
6. `rimWall`: inside a 1.6-unit contact band, tangential wall friction
   (rate 2.0/s) — this is what makes the ball walk backwards around the rim in
   the deck frame (~35°/s at full hold, ~4°/s pulsing). At r ≥ DECK_R: if the
   state is released (`armed` flag — rename it `released`), set `exited`;
   otherwise push back to the rim with restitution 0.05.

The imbalance system: centre of mass of placed parts / DECK_R; over tolerance
at ω > 0.72·OMEGA_MAX the deck "tears itself apart" (fail). Ports had zero
mass; with them gone, all parts count. The wobble shake scales with
imbalance·ω.

## 6. Flight physics (`flyStep`)

For each **live** body (`active(b)` — see side-locking): gravitational
acceleration `b.m·sideGrav()/d²` toward it (d² floored at b.r²); track closest
approach per body; slingshot assist recorded when passing within 3× radius of a
non-target, non-hole body. Contact: hole → begin inversion; `isTarget(b)` →
land; else crash. Lost when |pos| > FLY_BOUND or flightT > 22 s.
`sideGrav()` returns the current side style's gravMul once invAmt > 0.5.

## 7. Inversion sequence

`beginInversion(hole)`: capture camera extent covering both arrangements;
store movers' original positions, ball entry bearing, emergence speed
(0.45×, clamp 55–120), palette from/to; phase = "invert".
Each step: t += DT/1.5; invAmt lerps from→to.
Rendering during: every body drawn at `invMap(x0,y0,hc,R,min(1,t))`, radius
scaled by the local factor clamped [0.35, 2.6]; deck likewise; ball pinches to
nothing at t=0.5; `drawHorizonFlash` lights the ring at the collapse.
`finishInversion`: apply t=1 positions to the runtime system, place the ball at
horizon×1.02 at entry bearing heading outward, inversions++, phase = "flight".
**The runtime system is a deep copy (`sys`) made at level load / run start;
LEVELS data is never mutated — there is a regression test for this.**

## 8. Level schema (current, 8 levels)

```js
{ name, budget, tol, gates:[{r,a,w}], note, sandbox?,
  bodies:[{ n, x, y, r, m,
            target?:true, targetSide?:0|1, side?:0|1,
            hole?:true, R?:horizon,
            other?:{inv,tint,tintAmt,mode,bloom,bloomColor,gravMul,hueA,hueB} }] }
```

Shipped: First tangent / Behind you / Not the nearest / Around the heavy /
Threading / Inside out / Two minds / Open deck (sandbox). `portBudget` fields
are dead — delete. Solvability under the final control (release-time sweep,
0.2 s steps × 60): 6–16 landing windows per level; crashes 0–29 (hazard levels
should keep a meaningful crash count — Two minds at 26/60 crashes into Vex is
the intended level of threat). Authoring facts: the ball's natural deck-frame
sweep passes r38@−7°, r52@−46°, r64@−67°, r77@−86°, r89@−103°; put gates
deliberately off that line so parts are required — currently they are hit too
incidentally (known gap).

## 9. Scoring

Land (with all gates) = 2000 + 300/gate + 120/unused part + up to 250 balance
bonus + 400/slingshot + 900/inversion + speed bonus max(0, (14−flightT)·60).
Graze < 80 = 500. Land missing gates = gates only. Best per level in
localStorage (`tangent.best.v3` — bump the key), try/catch-wrapped, silent
degrade.

## 10. Rendering

- Starfield: seeded LCG, 34 nebula blobs + 380 stars, baked to an offscreen
  canvas per resize.
- Ferrofluid: `ferroBlob` (Appendix B), `tracePts` midpoint-quadratic smoothing,
  `paintFerro` (radial near-black fill, field-axis rim gradient hueA→hueB, one
  specular ellipse, clipped). Ball hues 268/44; targets use the side's hueA/hueB
  (default 188/266); hazards 322/32. Holes: 3 counter-sheared spike crowns +
  black core + violet halo + dashed horizon ring at radius R.
- Frame-level inversion stack (in order): `difference` white at invAmt·inv;
  tint wash in `mode` at invAmt·tintAmt; optional `screen` bloom.
- Camera: `camZ`/`camPan` lerp at rate 3.2/s between nearScale (deck·0.68) and
  wideScale (system·0.92); build phase fixed tight.
- HUD: level chips (parts, balance, gates, land-on-X), balance bubble gauge with
  tolerance band, throttle fill + rpm, prediction readout ("lands" /
  "crashes" / "falls in" / "N off"), radius/orbit/time overlay, edge chevrons.

## 11. Audio (all procedural, boots on first gesture, try/catch, silent-fail)

Continuous: deck hum (sawtooth 38+ω·26 Hz through a lowpass tracking ω) and
roll (looped noise, bandpass 220+speed·4.2 Hz), both gained by state. One-shots:
rail tick, wall thud, gate chime, release sweep (880→180), landing arpeggio
(523/659/784/1047), crash double-thud, fail groan, inversion (collapse
90→1800 Hz, bloom 2400→140 Hz, then a rising triad). Keep every new mechanic
audible; pitch-to-physics coupling is the house style.

---

# PART IV — WHAT OPUS BUILDS

## 12. Ground rules

- **One HTML file remains the deliverable.** Vanilla JS, canvas, zero
  dependencies, no build step. A PWA needs `manifest.json` and a service worker
  as separate files — those two are the only permitted additions.
- Mobile-first: pointer events, `touch-action:none`, safe-area insets, DPR-aware
  canvas, everything reachable with one thumb. Test at 390×780.
- Fixed-step simulation (1/120) with an accumulator; rendering interpolation is
  optional polish.
- The shared-integrator rule is inviolable: live sim and predictor call the
  same `advanceDeck`/`flyStep`. Any new force or body type goes into those
  functions or it will lie to the player (see D2).
- Keep the headless test harness green (section 14). New mechanics need new
  sweeps.

## 13. Workstreams, in priority order

**W1 — Cleanup and hardening (first session).**
Delete dead port code (PORT_W, DECK_STEPS, ports()/built() split where
unneeded, portBudget fields, the `armed` global → rename the state flag
`released`). Fix any lingering references. Add a proper reset/retry button in
flight. Pause when `document.hidden`. Acceptance: harness 50/50, no dead
symbols, file size does not grow.

**W2 — First-time experience.**
Level 1 currently lands if you release at 0.2 s — fine — but nothing teaches
hold-and-release. Add a 3-beat contextual tutorial (text chips, not modals):
"hold", "watch the line", "let go". Add level select with best scores and
medals. Acceptance: a new player reaches level 3 with no external explanation.

**W3 — Campaign structure.**
12–16 levels arranged in 3 acts: Act 1 the deck (levels teaching orbit, delay,
balance, gates-that-require-parts), Act 2 the system (hazards, heavies,
threading), Act 3 the far side (holes, side-locked bodies, targetSide,
different gravMul per side, at least one level needing **two** inversions —
the parity mechanic is built but unused). Use the authoring facts in §8 and the
sweep harness to verify 5–15 landing windows per level and a meaningful crash
count on hazard levels. Acceptance: sweep table in the PR for every level.

**W4 — New parts and bodies (pick 3–4, not all).**
Deck: counter-rotating inner ring (fixes one-directional drift — the strongest
candidate), one-way ratchet rail, timed drop-away rail. Sky: repulsor
(negative m — one code path, big payoff), orbiting body (moving target;
requires flyStep and predictor to advance body positions — respect D2), portal
pair, one-shot body that vanishes after a pass. Acceptance: each new element
appears in ≥2 levels and has audio.

**W5 — Feel and polish.**
Haptics (navigator.vibrate: rim contact, release, landing, inversion collapse).
Trail and impact particles in the ferrofluid language (droplets, not sparks).
Results card medal per axis (ghost/efficiency/economy/speed style — adapt:
landing band, gates, thrift, inversions). Reduced-motion setting that disables
shake and the horizon flash. Acceptance: play on a real phone; the owner's
verdict is the gate.

**W6 — Ship.**
PWA manifest + service worker (cache-first, versioned), icons (procedural
ferrofluid render to canvas → PNG export is acceptable), Firebase Hosting
deploy config, GitHub Pages fallback, a settings sheet (audio, haptics,
reduced motion, reset saves). Acceptance: installs to a home screen and runs
offline.

**Explicitly out of scope without owner sign-off:** 3D, multiplayer, level
editor, monetisation hooks, theme change away from ferrofluid/space.

## 14. Testing methodology (this is how the whole session verified itself)

All testing is headless Node: extract the `<script>` from the HTML, run it in a
`vm` context with a stubbed DOM/canvas (Appendix C has the working stub —
note the gradient stub must cover `createLinearGradient` too), drive `step()`
directly, assert on outcomes. The three standing suites:

1. **Smoke** — for every level: build+draw with parts, full armed run,
   unarmed timeout, erase/clear, predictor returns sane objects for 500 steps,
   and **level-data immutability after an inversion run**. Currently 50 checks.
2. **Solvability sweep** — release-time sweep 0.2 s × 60 per level; record
   landing windows, first window, crashes. Regression gate: no level below 5
   windows, hazard levels keep crashes > 0.
3. **Mechanism probes** — one-off scripts when adding a mechanic (this session:
   spiral timing, bowl equilibrium, drift rates, bearing error, inversion
   role-flip, per-side field magnitude). Write these before trusting a feel
   change; they repeatedly caught wrong assumptions (D1, D3, D6, D7).

Also keep the syntax check habit: extract and `node --check` after every edit.

## 15. Definition of done — Fable's review checklist

Fable should verify, in order:

1. `node --check` passes; no dead port-era symbols; file is one HTML file plus
   at most manifest + service worker.
2. Harness: smoke suite ≥ 50 green; solvability sweep meets the §14 gates for
   **every** shipped level, table included in the handback.
3. Controls: hold-throttle-release launches instantly and unconditionally from
   any radius; the Launch button duplicates it; nothing gates release (D4).
4. Predictor honesty (D2): pick three random spin-phase moments per level via
   the harness; released outcome matches predicted outcome class
   (land/crash/invert/miss) in ≥ 95% of samples.
5. Inversion: log-space collapse renders ≥ 60 frames; palette holds after the
   flip and differs per hole; LEVELS data unmutated; a double-inversion level
   exists and returns the palette home.
6. Mass/energy sanity: ball speed never NaN/Inf across the sweep; camera scale
   never NaN (regression: `systemExtent` with holes counts R, not r).
7. Performance: 60 fps on a mid phone or graceful degradation (predictor cache
   interval is the first knob — currently every 2 frames; loosen before
   simplifying visuals).
8. Feel gates the owner set this session: deck ≥ ~60% of screen while aiming,
   spin visibly fast (spokes + index mark present), one-gesture launch.
9. PWA: offline load, home-screen install, saves survive reload.
10. The design doc updated with anything Opus changed, in the same
    decision-log style — future sessions depend on it.

## 16. Open questions — decision rights

**Owner decides (ask, do not assume):** final title (TANGENT is working);
whether Threading/Around-the-heavy difficulty is right after touch play;
whether the far-side worlds should get names/lore; monetisation; release
target (Lucid Winds catalogue slot).
**Opus may decide (document in the log):** exact new-part selection in W4;
tutorial copy; medal thresholds; icon design; act structure details.

---

# APPENDIX A — asset guidance (tools: ChatGPT, Meshy, Midjourney-expiring)

Do **not** generate the ball, bodies, holes, deck, or conduit-like elements —
all procedural and field-reactive (D11). Midjourney before it lapses: 2–3
seamless space plates (≤60 KB WebP each — larger fights the single-file ethos;
they may live as separate cached files under the PWA), an oil-slick iridescence
reference, a colour key per far-side world. Meshy: skip unless a 3D build is
green-lit. ChatGPT: second pair of hands on code and level layouts.

# APPENDIX B — ferrofluid core (verified working)

```js
function fieldAt(x,y,skip){            // the same numbers physics uses
  let fx=0, fy=0;
  for(const b of live()){
    if(b===skip) continue;
    const dx=b.x-x, dy=b.y-y;
    const d2=Math.max(b.r*b.r,dx*dx+dy*dy), d=Math.sqrt(d2);
    const g=b.m/d2*sideGrav();
    fx+=(dx/d)*g; fy+=(dy/d)*g;
  }
  return [fx,fy,Math.hypot(fx,fy)];
}
function ferroBlob(cx,cy,r,fa,s,seed,detail){
  const N=detail||96, nS=7; s=Math.max(0,Math.min(1,s));
  const pts=[];
  for(let i=0;i<N;i++){
    const th=i/N*Math.PI*2, al=Math.cos(th-fa);
    const pole=Math.pow(Math.abs(al),4);
    const cones=Math.pow(Math.max(0,Math.cos((th-fa)*nS)),10);
    const wob=0.055*Math.sin(th*5+ferroT*1.1+seed)
             +0.035*Math.sin(th*9-ferroT*0.7+seed*2.3);
    const k=1 + 0.30*s*pole + 0.55*s*pole*cones + wob*(0.5+0.5*s);
    pts.push([cx+Math.cos(th)*r*k, cy+Math.sin(th)*r*k]);
  }
  return pts;
}
```
(`tracePts` and `paintFerro` are in tangent-v6.html and CONDUIT-handoff.md
Appendix A — identical code.)

Verified: longest spike within 1° of field angle; elongation 1.09× (s=0) to
2.1× (s=1); no non-finite output over full sweeps.

# APPENDIX C — headless harness skeleton (the gradient stub matters)

```js
const fs=require('fs'), vm=require('vm');
let js=fs.readFileSync('tangent-v6.html','utf8')
        .match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^"use strict";/,'');
const noop=()=>{};
const ctxStub=new Proxy({},{get:(t,k)=>/Gradient$/.test(k)
  ? ()=>({addColorStop:noop}) : ()=>({width:10}), set:()=>true});
const fakeEl=()=>new Proxy({style:{},classList:{add:noop,remove:noop,toggle:noop,
  contains:()=>false},dataset:{},addEventListener:noop,
  getBoundingClientRect:()=>({left:0,top:0}),setPointerCapture:noop,
  textContent:'',innerHTML:'',disabled:false,clientWidth:390,clientHeight:780,
  width:390,height:780,getContext:()=>ctxStub},
  {get(t,k){return k in t?t[k]:noop},set(t,k,v){t[k]=v;return true}});
vm.runInContext(js + TEST_CODE, vm.createContext({console,
  document:{getElementById:fakeEl,querySelectorAll:()=>[],
            createElement:fakeEl,addEventListener:noop},
  window:{devicePixelRatio:2,addEventListener:noop},
  requestAnimationFrame:noop, localStorage:null, setTimeout:noop,
  Math,JSON,Date,isFinite,String,Number,Array,Object,Set,Infinity}));
// Inside TEST_CODE: set W=390;H=780; then drive loadLevel/startSpin/step()
// and read phase, lastOutcome, closestTo, inversions, launchInfo directly.
```

# APPENDIX D — file inventory at handoff

| file | status |
|---|---|
| tangent-v6.html | **canonical** — build from this |
| tangent-v5.html | ferrofluid + mechanical far sides, pre-control-fix |
| tangent-v4.html | inversion introduction |
| tangent-v3.html | the port experiment — reference for D4/D6 only |
| tangent-v2.html | release-button era, simplest good feel |
| tangent.html | v1, flat-deck era — historical |
| TANGENT-design.md | full design history, sections 1–16 |
| CONDUIT-handoff.md | a **different game** — ignore for this build |
