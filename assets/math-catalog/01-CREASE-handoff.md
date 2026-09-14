# CREASE — Build Handoff v1.0

**Fraction number line. A paper strip pinned between 0 and 1.**

Spec: `CREASE-design-spec.md` — read §5 (anti-patterns) and §6 (feedback) before writing any game logic.
Depends on: CORE v1 (`reveal`, `adapt.tier`, `numberline`, `audio`, `store`, `session`, `collect`).
Authors: `FRACTION_BANK`, which BRIM will consume. Get its tagging right.
Standards: 3.NF.A.2.a/b, 3.NF.A.3.b/c, 4.NF.A.1, 4.NF.A.2.

---

## 0. Mission

90% of educators name fractions as the skill most blocking student progress, and the root cause is **whole-number bias** — a child reads `1/8` as two whole numbers and concludes it exceeds `1/3`. The number line is the corrective because it forces a fraction to be *one location*, not *two numbers*.

Every competing product hands the child a line that is **already partitioned**, so the child counts hash marks. That trains counting and leaves the bias entirely intact — a kid can score 100% and still believe 1/8 > 1/3.

**CREASE makes the child partition the line themselves, and then takes the partitions away.**

---

## 1. Invariants

| # | Invariant | Why |
|---|---|---|
| C1 | **Strip pixel width and left offset randomize every round** (72–94% width, jittered offset). | Otherwise children memorize screen positions. Single most important rule. |
| C2 | **No tick marks in FREEHAND.** Not faint, not on hover, not as a hint. | Counting must be impossible. |
| C3 | **The whole varies.** 0–1, 0–2, 0–5, mixed, with occasional back-mix to 0–1. | Children otherwise believe fractions live only between 0 and 1. |
| C4 | **Equivalent fractions land on the same point and are shown doing it.** Serve `1/2`, `2/4`, `4/8` in sequence; on the third, reveal all three markers stacked. | 3.NF.A.3.b/c delivered as a magic trick. |
| C5 | **Never label the answer before the child commits.** | |
| C6 | **Creases snap to equal spacing.** The child cannot produce unequal parts. | The mode is about the meaning of the denominator. |
| C7 | **Grade-3 config never exceeds denominators {2,3,4,6,8}.** | Explicit CCSS grade-3 limit. |
| C8 | **No creases are labelled with fractions during play** — only in the post-answer review. | Labels turn it into reading. |

Plus all CORE global invariants G1–G13.

---

## 2. Files

```
crease/
├── index.html          game shell, palette tokens
├── engine.js           pure — no DOM
├── render.js           strip, creases, marker, loupe
├── content.js          FRACTION_BANK (exported for BRIM)
└── test.js             gates below
```

---

## 3. Data structures

```js
Task = {
  mode: 'crease' | 'freehand' | 'halfway' | 'long' | 'squeeze',
  numerator: 3,
  denominator: 4,
  whole: 1,                       // right-pin value: 1, 2, 3, or 5
  tier: 2,
  trap: 'unit-fraction-inversion' | 'benchmark-half' | 'equivalence' | null,
  strip: { widthPct: 0.86, offsetPct: 0.07 }   // randomized, C1
}

Result = {
  correct: bool, near: bool,
  pae: 0.043,                     // |error| / whole
  truePosition: 0.75
}
```

**`FRACTION_BANK` tags** — BRIM depends on these names, do not rename:

`unit-inversion` · `benchmark-half` · `equivalence` · `whole-equals-one` · `improper` · `near-miss-pairs`

Seed content:
- unit-inversion: 1/3·1/8, 2/5·2/9, 3/4·3/10
- benchmark-half: 4/9, 5/9, 6/11, 7/15
- equivalence: 1/2·2/4·3/6·4/8, 2/3·4/6·6/9·8/12
- whole-equals-one: 4/4, 6/6, 8/8
- improper: 7/4, 9/8, 11/3
- near-miss-pairs: 3/5·4/6, 5/8·7/12

---

## 4. Build order

| # | Step | Acceptance |
|---|---|---|
| 1 | SVG strip renderer with C1 randomization, marker drag, loupe | Width/offset variance asserted over 100 rounds; loupe never occluded by thumb at 320px |
| 2 | `generateTask` / `scoreAttempt` | PAE exact across the full randomized offset/width range |
| 3 | **Mode 2 FREEHAND** — build the hardest mode first | Unmarked line, drag, commit, PAE-scored, tier ladder working |
| 4 | Mode 1 CREASE + fold animation | Tap-up/down adds equal creases; marker snaps; C6 holds |
| 5 | Mode 3 HALFWAY | 6s generous clock, no penalty on timeout, "exactly half" after 5-streak |
| 6 | Reveal sequence | Learner marker stays; truth fades in; gap hatches; strip creases itself to the correct denominator |
| 7 | RESONARC audio | Four sounds: crease, marker set, settle, reveal knock |
| 8 | Modes 4 (LONG STRIP) and 5 (SQUEEZE) | v1.1 |
| 9 | `localStorage`, paper specimens, unlocks | 24 folded-paper specimens, cosmetic only |
| 10 | Service worker, URL config | |
| 11 | Accessibility + Chromebook perf pass | |

**Tolerance ladder (FREEHAND):** ±10% → ±7% → ±5% → ±3.5% → ±2.5%.

**v1 scope = Modes 1, 2, 3 + the reveal.** That is a complete, shippable product.

---

## 5. Test gates

On top of CORE's shared assertions:

- Generator never repeats a fraction within 4 rounds
- In non-long modes, `whole` is never less than the fraction's value
- `scoreAttempt` PAE correct at every randomized offset/width — **coordinate-mapping off-by-ones hide here; test at the extremes of the randomization range**
- Strip width genuinely varies across 100 rounds (C1)
- Equivalence sequences (C4) fire the stacked-marker reveal on the third item
- FREEHAND renders zero tick elements — assert the DOM contains no division marks (C2)
- Grade-3 config never emits a denominator outside {2,3,4,6,8} (C7)
- Every mode completable by keyboard alone
- 60fps under 4× throttle

---

## 6. Definition of done

Modes 1–3 playable end to end, reveal correct on both paths, tolerance ladder adapting silently, strip randomization asserted, keyboard-complete, offline, zero network after load, `FRACTION_BANK` exported and tagged for BRIM.

---

## 7. Things that will tempt you

- **Adding faint ticks to FREEHAND "to help."** That is the competitor's design and the reason their games don't work. (C2)
- **Keeping the strip a fixed width because randomizing looks jittery.** It is the single most important invariant here. If it looks bad, animate the transition — don't remove it.
- **Labelling creases during CREASE mode.** (C8)
- **Letting the child make unequal creases "for realism."** (C6)
- **Serving only 0–1.** (C3)
- **Adding a "reveal the ticks" hint button after two misses.** Show the reveal, not a shortcut.

---

## 8. Ask Stephen, don't decide

- Final name (CREASE vs SNIP / TAUT / RUNG / PLUMB)
- Specimen collectibles in v1 or v1.1
- Landscape-lock on phones vs full portrait support
