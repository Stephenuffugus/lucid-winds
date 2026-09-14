# TINT — Build Handoff v1.0

**Proportional reasoning and ratio. A dyer's workshop; recipes in jugs.**

Spec: `TINT-design-spec.md` — read §2 (the two errors), §5 (continuous vs discretized), §6 (anti-patterns).
Depends on: CORE v1 (`reveal`, `adapt.tier`, `numberline` for continuous mode, `audio`).
Standards: 4.OA.A.1, 5.NF.B.5, 6.RP.A.1–3, 7.RP.A.1–2.

---

## 0. Mission

TINT is the catalog's convergence point. Spatial scaling reaches mathematics achievement **serially through proportional reasoning**, then number line estimation, then fraction number line estimation. NOTCH's SCALE sits on one side of that chain and CREASE on the other.

**Why color mixing:** it's the only context where a child's proportional reasoning gets checked against **physical reality instead of the app's authority**. 2 red : 1 white and 4 red : 2 white produce the same color, and you can see it. When a child says "those are different" and both vats pour, the game hasn't marked them wrong — the paint has.

---

## 1. The two errors — and only one gets built for elsewhere

### Error 1 — The additive strategy
Students compare **differences** where they should compare **ratios**. The diagnostic literature gives a taxonomy, which becomes the trap set directly:

| Error | Looks like |
|---|---|
| **Additive strategy** | compares differences, not ratios |
| **Incorrect build-up** | repeated addition that breaks at a non-integer step |
| **Magical doubling/halving** | doubles one part of the ratio but not the other |
| **Constant sum** | treats equal totals as equal ratios (3:1 and 2:2 "the same") |
| **Incomplete reasoning** | starts a valid method, abandons it partway |

Difficulty is strongly governed by whether the multiplicative relation is an **integer**. Integer factors like ×3 are the easy case; non-integer factors are where additive thinking surfaces.

### Error 2 — The illusion of linearity
Children in the middle years **over-generalise and apply missing-value proportion strategies to problems that require only additive reasoning.**

> **A game that only ever rewards multiplying is training this error.**

Every proportional-reasoning app I could find serves an unbroken diet of problems where scaling is correct, teaching children to multiply on sight without ever asking whether the situation is proportional. **Deciding whether a relationship is proportional is the actual skill.** Executing the proportion is arithmetic.

---

## 2. Invariants

| # | Invariant | Why |
|---|---|---|
| T1 | **Non-proportional items must appear** — Mode 4 entirely, plus ~15% of Mode 2. | Error 2. |
| T2 | **Mode 4 must include ~40% genuinely proportional items too.** | Otherwise it teaches the opposite reflex. The mode is *decide first*, not "never multiply." |
| T3 | **Non-integer scale factors ≥ 35% of all scaled tasks beyond stage 1.** | Integer-only sets won't surface additive thinking. |
| T4 | **All five named errors represented in the trap set.** | |
| T5 | **Always pour and show the result** in comparison modes. | The paint is the authority, not the app. |
| T6 | **Never teach cross-multiplication** — no hint, reveal, or help screen. | Same rule as BRIM. |
| T7 | **Ratios are color-to-white, never color-to-color.** | Tinting with white varies **lightness**, the dimension that survives every form of colour vision deficiency and grayscale rendering. The mechanic is inherently accessible. |
| T8 | **Jug counts always visible alongside every swatch.** | |
| T9 | **Both continuous and discretized representations, continuous first.** | §3. |
| T10 | **Mix in linear RGB, not sRGB.** | §4. |

Plus CORE G1–G13.

---

## 3. Continuous vs discretized (T9)

Middle-schoolers show **greater misconceptions in discretized tasks due to interference from whole-number information**, and performance on those discretized tasks better predicted symbolic fraction knowledge.

- **Continuous** — dye as a level in a vat, a smooth column. Whole-number interference minimised. **Start here.**
- **Discretized** — countable jugs. Whole numbers salient and interfering. **Harder and more diagnostic.**

Representation is a generator parameter, not a style choice. A child fluent continuous but failing discretized has told us something specific.

---

## 4. The colour pipeline — non-negotiable (T10)

**Mix in linear RGB.** Naive sRGB averaging produces muddy, physically wrong midpoints — and in a game whose entire premise is that equal ratios look identical, a colour pipeline that lies would undermine the mechanic. Convert to linear, mix, convert back. ~15 lines.

**The single most important test in this file:**

```js
assert(mix(2,1) === mix(4,2) && mix(4,2) === mix(6,3));   // exact equality
```

The whole game rests on equivalent ratios being perceptually identical. A floating-point or gamma error would quietly make the game teach the opposite of what it claims.

---

## 5. Data structures

```js
Task = {
  mode: 'compare'|'missing'|'strongest'|'nonlinear'|'match',
  representation: 'continuous' | 'discretized',
  recipes: [{ color:'madder', parts:3 }, { color:'white', parts:2 }],
  scaleFactor: 1.5,
  factorType: 'integer' | 'nonInteger',
  errorTarget: 'additive'|'buildUp'|'magicalDoubling'
             |'constantSum'|'incomplete'| null,
  isProportional: true       // false for NONLINEAR_BANK items
}
```

**Mode 1 trap set:**

| Pair | Answer | Error caught |
|---|---|---|
| `2:1` vs `3:2` | different | **Additive** — "+1 each" says same; 2.0 ≠ 1.5 |
| `2:1` vs `6:3` | same | baseline |
| `3:2` vs `6:3` | different | **Magical doubling** |
| `3:1` vs `2:2` | different | **Constant sum** |
| `4:2` vs `6:3` | same | non-obvious, non-unit |
| `3:2` vs `9:6` | same | integer ×3 |
| `2:1` vs `5:2.5` | same | **non-integer** (much harder) |

**`NONLINEAR_BANK` seed:**

| Item | Proportional answer | Actual | Why |
|---|---|---|---|
| 1 cloth dries in 2h. Four cloths side by side? | 8h | **2h** | parallel, not sequential |
| Cloth twice as wide *and* twice as tall — dye? | 2× | **4×** | area scales as the square |
| Vat: 10 min heat + 2 min per jug. 10 jugs? | scaled | **30 min** | affine, not linear |
| 2 dyers do 6 cloths/hr. 5 dyers? | 15 | **15** | genuinely proportional |

---

## 6. Build order

1. **`mixLinear` + the equivalence assertion (§4)** — build and test before anything else
2. Workshop renderer, vats, **the pour** (two streams meeting, colour resolving over ~400ms from streaky to uniform, cloth taking it from the bottom edge)
3. `generateRatioPair` + `ERROR_TAXONOMY` with coverage tests
4. Mode 1 SAME COLOR? + the pour reveal — core loop
5. Ratio table component — a **first-class UI element**, always visible in Mode 2, scrollable, child can add rows
6. Mode 2 FILL THE VAT, integer factors first. **Let build-up fail on purpose** — 5→10→15 works beautifully until the order is for 12 jugs, and the table is right there showing why
7. `NONLINEAR_BANK` + Mode 4 + **the physical reveals** — four cloths drying simultaneously under one clock; the big square literally tiled out of four small ones. These are demonstrations, not explanations; build them with more care than anything else in the mode.
8. Non-proportional salting into Mode 2 (T1)
9. Non-integer factors and reduction tasks (15 jugs down to 6)
10. Continuous/discretized switch (T9)
11. Mode 3 STRONGEST
12. Swatch wall collectible (~30, each with its recipe hand-lettered)
13. Mode 5 MATCH IT
14. Audio, storage, URL config, SW
15. Accessibility, luminance assertion, cross-multiplication grep

**v1 scope = Modes 1, 2, 4 + the pour reveal.** **Mode 4 is in v1** — shipping without it means shipping a game that trains the illusion of linearity.

---

## 7. Test gates

- Across 200 Mode 2 tasks, **13–17% have `isProportional: false`** (T1)
- Across 100 Mode 4 tasks, **38–42% have `isProportional: true`** (T2)
- Non-integer factors ≥ 35% of scaled tasks beyond stage 1 (T3)
- All five `ERROR_TAXONOMY` entries appear in any 40-item comparison set (T4)
- Continuous representation precedes discretized for every new ratio family (T9)
- **`mixLinear` produces identical RGB for equivalent ratios — exact equality** (§4)
- **Every "different" swatch pair differs in luminance, not only hue** — assert ΔL > threshold (T7)
- Grep for cross-multiplication in all user-facing strings and help content (T6)
- Keyboard-complete

---

## 8. First run

No text. 6-second loop: 2 red + 1 white pour into a vat, a cloth takes the colour; beside it 4 red + 2 white pour into a second vat, and that cloth comes out the same shade. Both hang side by side, identical. Loop.

**That loop is the thesis of the game, delivered before a single word.**

First task is `2:1` vs `4:2` — same colour, continuous, integer factor.

---

## 9. Things that will tempt you

- **Cutting Mode 4 to v1.1 for scope.** Without it the game trains the illusion of linearity. (T2, §6)
- **Making Mode 4 entirely non-proportional** because that's the lesson. It isn't; *decide first* is. (T2)
- **Mixing in sRGB because it's what canvas gives you.** (§4)
- **Only serving integer scale factors** because they're cleaner. That's the easy case and it hides the error. (T3)
- **Adding a cross-multiplication helper for Mode 2.** (T6)
- **Using red vs green swatches** for a vivid comparison. (T7)
- **Blocking the build-up strategy** to force multiplication. Let it run out of road instead. (§6 step 6)

---

## 10. Ask Stephen, don't decide

- Final name
- **Whether Mode 4 becomes its own product** — "Not everything scales" is a one-idea game, ~90 seconds to understand, absent from the market, and the piece a middle-school teacher would forward to a colleague
- Age fit: TINT reaches into grade 7, past where the rest of the catalog lives. Deliberate upward extension, or trim Modes 3 and 5?
- **ChromaForge overlap** — you have a colour-intelligence venture and TINT needs a small correct linear-RGB engine. Different products, not unrelated code. Decide now whether they share anything.
