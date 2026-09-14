# GLIMPSE — Build Handoff v1.0

**Subitizing and number sense. Fireflies blink on in a dark meadow, blink off. How many?**

Spec: `GLIMPSE-design-spec.md` — **read §2 (honesty note) and §5 (the generator) before writing a line of code.**
Depends on: CORE v1 (`schedule`, `reveal`, `adapt.tier`, `adapt.staircase`, `audio`).
Authors: `schedule` hardening that CAIRN and HUSH will rely on.
Standards: K.CC.B.4, K.CC.B.5, K.CC.C.6, K.OA.A.3, K.OA.A.4, 1.OA.C.6.

---

## 0. Mission and scope warning

**Subitizing comes in two kinds and the second is the prize.** Perceptual subitizing is instant recognition of small sets — most children are fluent to 4 or 5 by ages 3–4. **Conceptual** subitizing is seeing 8 as two 4s, or 7 as 5-and-2. A child who sees 7 as 5+2 has a part-whole structure they can run addition on; a child who counts seven dots has nothing to build with.

**Scope warning, from the spec's §2:** Modes 1–3 and 5 (subitizing) rest on solid ground. **Mode 4 (approximate number comparison) does not** — ANS measurement is compromised by visual confounds and training transfer is contested.

> **Modes 1, 2, 3, and 5 are a complete, shippable product. Mode 4 ships only if the §3 decorrelation tests pass. It is entirely fine to ship without it.**

Nothing in this game is described as making children smarter. Marketed as a subitizing game.

---

## 1. Invariants

| # | Invariant | Why |
|---|---|---|
| GL1 | **Mask every flash.** ~200ms of grass-stir texture immediately after. | Without it children read the afterimage and the task measures nothing. |
| GL2 | **Never encode the count in audio.** One sound per flash regardless of quantity. | A chime-per-firefly lets children count by ear. **Easiest fatal mistake in the catalog — put a comment at the call site.** |
| GL3 | **No visible timers, countdowns, or speed scores.** | Slow answers count as correct but do not advance the tier. Nothing on screen indicates speed was noticed. |
| GL4 | **No visual cue may correlate with numerosity across a session.** | §3. Without this the game measures blob size. |
| GL5 | **Dots never overlap.** Minimum separation enforced. | Overlapping dots are counted as one by the visual system and silently corrupt the trial. |
| GL6 | **Regular arrangements before irregular ones.** | Dice → finger → tally → line → random. |
| GL7 | **Answer buttons carry a numeral AND its dot pattern.** | Pre-readers must be able to answer. |
| GL8 | **Blue/amber swarms** + optional shape difference in settings. | Safest pair for the most common CVD; color is never the only channel. |

Plus CORE G1–G13.

---

## 2. Timing

| Set size | Default flash |
|---|---|
| 1–5 | 400ms |
| 6–10 | 350ms |
| Mode 4 swarms | 300ms |

Settings expose 250 / 400 / 600ms plus **Long Look (1500ms)**, explicitly labelled as a *counting* game rather than a glimpsing one. Children with visual processing differences get a game they can play, and we're honest that it's a different exercise.

**Response window:** answers are never wrong for being slow. Beyond ~2.5s in Modes 1–3, a correct answer counts but does not advance the tier. (GL3)

---

## 3. The stimulus generator — the hardest engineering in the catalog

**Write the decorrelation test before the renderer. If the generator is wrong, everything built on it is wasted.**

### The problem

Numerosity cannot be changed without also changing visual properties. The confounded cues:

| Cue | Definition |
|---|---|
| Cumulative surface area | sum of dot areas |
| Convex hull | smallest convex area enclosing all dots |
| Average dot diameter | mean individual size |
| Density | cumulative area ÷ convex hull |

They are mathematically coupled and can point in opposite directions. Ignore this and you have built a game where children win by judging **which blob looks bigger**, producing high scores and no learning.

### The solution

Do not control cues *within* a trial. **Decorrelate them from numerosity across the session** by balancing congruency:

- **Congruent trial:** the more numerous array is also larger on the cue.
- **Incongruent trial:** the more numerous array is *smaller* on the cue.

```js
generateSwarmPair({ nA, nB, congruency }) -> {
  dotsA: [{x,y,r}], dotsB: [{x,y,r}],
  measured: { cumAreaA, cumAreaB, hullA, hullB,
              meanDiamA, meanDiamB, densityA, densityB }
}
```

**Requirements:**
1. **Congruency is set independently per cue.** A trial can be congruent on hull and incongruent on area. Sample the congruency vector so each cue independently lands at 50/50 across a session.
2. **The generator measures and returns realized values.** Convex hull via Graham scan — ~30 lines, no excuse for estimating.
3. **Minimum separation constraint** so dots never overlap or touch. (GL5)
4. **Both swarms occupy the same bounding region** in intermixed format, so field position isn't a shortcut.
5. **Radii jittered per dot**, so mean diameter is a controllable knob.

### Decorrelation gates — the game does not ship without these

Over **200 generated Mode 4 trials**, assert:

- `|corr(numerosity_difference, cumArea_difference)| < 0.1`
- same for convex hull, mean diameter, density
- congruency is 48–52% on **each cue independently**
- no dot pair overlaps in any trial
- both swarms' convex hulls overlap ≥ 80% in intermixed format

### Consequence for the staircase

Incongruent trials are harder at the same ratio (the congruency effect). **Track ratio and congruency separately.** A run of incongruent trials must never be misread as "this child needs an easier ratio." Log both; adapt on ratio only.

**Mode 4 ratio ladder:** 2.0 → 1.6 → 1.4 → 1.25 → 1.15 → 1.1, driven by a 2-down-1-up staircase converging near 70%.

---

## 4. Modes

**1 FLASH** (1–5, perceptual) · **2 GROUPS** (5–10, conceptual, five-anchored) · **3 FRAME** (ten-frames) · **4 MORE** (ANS, gated on §3) · **5 SPREAD** (conservation of number).

**Mode 3 carries the highest pedagogical value in the game.** Two question types alternate: *how many?* and — the reason the mode exists — **"how many more to fill the frame?"** Complement-to-ten is the engine under every make-ten strategy a child will use for four years, and almost nothing free drills it directly.

**Mode 5 turns a confound into a lesson.** A large convex hull makes people *overestimate* the count; spread-out looks like more. Three round types: same count different spread (answer: "the same"), fewer-but-wider, same count different dot sizes. On reveal the fireflies fly into a ten-frame and count themselves out — the arrangement changed, the number didn't.

**Mode 2 weighting:** bias the composition table toward pairs built on 5 (`5+2`, `5+3`, `5+4`, `5+5`), then widen. Serve the same total as several different splits within one run — 8 as `4+4`, then `5+3`, then `6+2`. That's the thing a printed card deck cannot do.

---

## 5. Data structures

```js
Trial = {
  mode: 'flash' | 'groups' | 'frame' | 'more' | 'spread',
  arrangement: 'dice'|'finger'|'tally'|'line'|'random'|'tenframe',
  counts: { a: 12, b: 15 },
  ratio: 1.25,
  congruency: { cumArea:'inc', hull:'con', diameter:'inc', density:'con' },
  flashMs: 300,
  ask: 'howMany'|'total'|'complement'|'whichMore'|'sameOrMore'
}
```

---

## 6. Build order

1. **Decorrelation test harness + `generateSwarmPair`** — test first
2. `convexHull`, arrangement generators, overlap constraint
3. Meadow renderer, **pre-rendered glow sprite reused via `<use>`** (not `box-shadow` blur — 20+ blurred elements will not hold 60fps on a Celeron), frame-accurate flash, mask
4. Mode 1 FLASH + answer pads — core loop
5. **Re-landing choreography and the reveal** — fireflies fade back where they were, then fly into structure and land one at a time. This converts a scatter the child couldn't resolve into a structure they can.
6. **Mode 3 FRAME + complement question** — build early, highest value
7. Mode 2 GROUPS + composition table
8. Mode 5 SPREAD
9. Mode 4 MORE + staircase — **only if §3 gates pass**
10. RESONARC audio (GL2)
11. Field journal (~24 sketched pages), unlocks, storage
12. URL config, SW, accessibility, flash-timing verification

**v1 scope = Modes 1, 2, 3, 5.**

---

## 7. Test gates

- **The four decorrelation assertions from §3 over 200 trials**
- No dot overlap in 500 generated arrangements (GL5)
- **Measured flash duration within ±30ms of spec under 4× CPU throttle** — a 400ms flash rendering at 900ms turns a subitizing game into a counting game with nobody noticing
- Mask renders between flash and response in every mode (GL1)
- **Audio emits exactly one event per flash regardless of count** (GL2)
- Answer pads legible and tappable at 320px width; every pad carries numeral + pattern (GL7)
- 60fps with 24 glowing dots on screen
- Keyboard-complete

---

## 8. Things that will tempt you

- **Playing a note per firefly because it sounds delightful.** It does, and it destroys the task. (GL2)
- **Using `setTimeout` for the flash.** (CORE S1)
- **Skipping the mask because the dots already disappeared.** The afterimage doesn't. (GL1)
- **Using `box-shadow` blur for the glow.** Will not hold frame rate.
- **Shipping Mode 4 because it's nearly done.** Gate it on the tests. (§0)
- **Controlling all four cues in every trial.** Mathematically impossible. Balance across the session instead. (§3)

---

## 9. Ask Stephen, don't decide

- Final name (avoid BLINK — existing project)
- **Whether Mode 4 ships at all**
- Spoken numerals — same open question as YONDER, same tradeoff, younger audience benefits more
- Whether GLIMPSE is the catalog's front door for young users (a three-year-old can play Mode 1)
