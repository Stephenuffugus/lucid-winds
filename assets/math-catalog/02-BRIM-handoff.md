# BRIM — Build Handoff v1.0

**Fraction comparison and equivalence. Two identical graduated vessels; tap the fuller one.**

Spec: `BRIM-design-spec.md` — read §4 (the one rule) and §7 (anti-patterns) first.
Depends on: CORE v1, and **`FRACTION_BANK` from CREASE**.
Standards: 3.NF.A.3.b/c/d, 4.NF.A.1, 4.NF.A.2, 5.NF.A.2.

---

## 0. Mission

Students who succeed at fraction comparison use two strategies: **benchmarking** (against 1/2, 0, 1) and **residual thinking** (how much is left to make a whole). Everyone else reaches for common denominators or cross-multiplication — procedures that produce right answers and no understanding.

**BRIM is a strategy trainer, not a comparison quiz.** Each mode makes one strategy the only efficient path through it.

Three distinct bugs are being hunted, and a child can have one without the others:

1. **Whole-number bias** — "smaller numbers mean bigger fractions." 38.5% of wrong answers in the source study gave exactly this reason.
2. **Gap thinking** — comparing the *difference* between numerator and denominator, so 3/5 and 5/7 look equal. **Invisible unless deliberately tested**; a child with this bug answers many ordinary pairs correctly by accident.
3. **Doubling-only equivalence** — the child can only halve or double, because they believe each part can only be split in two.

---

## 1. Invariants

| # | Invariant | Why |
|---|---|---|
| B1 | **Vessels stay empty until the child commits.** No preview, no hover, no peek. | Judgment from symbols, picture as proof. Every competitor shows the bars during judgment, which trains nothing. **This is the rule the game lives on.** |
| B2 | **Interleave case types within a mode.** Never more than 2 consecutive rounds sharing a case type. | Blocked practice lets a child autopilot one rule and score well while learning nothing. |
| B3 | **The larger fraction is on the left 48–52% of the time**, never same side 4+ running. | |
| B4 | **Denominators ≤ 12 for grades 3–4.** | Larger denominators make cross-multiplication the fastest path. |
| B5 | **Color never carries meaning alone.** Position + label always. | |
| B6 | **≥ 2 gap-trap pairs per 12-round session.** | Otherwise bug 2 goes undetected. |
| B7 | **The two vessels are pixel-identical in size** in every mode except the flagged same-whole round. | |
| B8 | **No cross-multiplication anywhere** — not in hints, reveals, or help. | A correct procedure that shortcuts the reasoning the game exists to build. |
| B9 | **Mode 4b requires splits into 3 and 5**, not just 2, for ≥ half its targets. | If the mode is completable by only tapping "2," it has failed. |
| B10 | **Mode 3 reveal highlights the EMPTY space, not the fill.** | That inversion *is* residual thinking, and it's the name of the game. |

Plus CORE G1–G13.

---

## 2. Files

```
brim/
├── index.html
├── engine.js       generatePair, classify, scoreChoice, equivalentsOf
├── render.js       vessels, fill + meniscus, graduations, split animation
├── content.js      PAIR_BANK (imports FRACTION_BANK tags from CREASE)
└── test.js
```

---

## 3. Data structures

```js
Pair = {
  mode: 'matching' | 'half' | 'brim' | 'level' | 'build',
  left:  { n: 3, d: 4 },
  right: { n: 7, d: 9 },
  caseType: 'same-denominator' | 'same-numerator' | 'straddle-half'
          | 'same-side-half' | 'residual' | 'equivalent' | 'gap-trap',
  trap: 'whole-number-bias' | 'gap-thinking' | 'doubling' | null,
  sameWhole: true,
  wholeScale: { left: 1.0, right: 1.0 }
}
```

**PAIR_BANK seed:**

| Tag | Pairs |
|---|---|
| `same-denominator` | 3/8·5/8, 2/6·5/6, 7/12·4/12 |
| `same-numerator` | 1/3·1/8, 2/5·2/9, 3/4·3/10, 5/6·5/12 |
| `gap-trap` | 3/5·5/7, 2/3·5/6, 1/2·6/7, 4/5·8/9 |
| `straddle-half` | 5/8·3/7, 4/9·7/12, 5/11·6/10 |
| `same-side-half` | 5/8·7/10, 2/7·3/11 |
| `residual` | 5/6·7/8, **3/4·7/9**, 9/10·11/12, 4/5·7/9 |
| `equivalent` | 1/2·2/4·3/6·4/8, 2/3·4/6·6/9·8/12 |

`3/4 vs 7/9` had a ~10.8% success rate among grade-6 students. Treat it as a boss.

**Difficulty order — do not place same-numerator early, it is harder than intuition suggests:**
1. Same denominator → 2. Straddling 1/2 → 3. **Same numerator** → 4. Residual

---

## 4. Build order

| # | Step | Acceptance |
|---|---|---|
| 1 | Vessel renderer + fill animation | Meniscus curve, slight overshoot-and-settle, highlight as level passes. **Get the feel right before anything else — it's the whole game.** |
| 2 | `generatePair` / `classify` / `scoreChoice` | All 7 case types correctly tagged across full bank |
| 3 | **Mode 1 MATCHING with interleaving** | B2 asserted; round 1 of a first session is same-denominator and obviously lopsided (`1/8 vs 7/8`) |
| 4 | Reveal + caption system | Chosen vessel fills first, then the other; caption is a fact |
| 5 | Mode 2 HALF + etched benchmark line | Permanent half-line; brightens on reveal; same-side pairs after a streak |
| 6 | Mode 3 BRIM + **empty-space highlight inversion** (B10) | Water dims, unfilled band glows, caption `1/8 to the brim` |
| 7 | Mode 4 LEVEL: spot-the-twin + **split** | **The waterline holds perfectly still while the glass re-etches.** This is the most important animation in the game. |
| 8 | Adaptive hint ladder | Silent visual scaffolds only, escalating over 2 misses. No text hints. |
| 9 | RESONARC audio incl. the **level ring** | Two sine partials at exact 2:1 — an octave is a 1/2 relationship, so the sound makes the same point the math does |
| 10 | Mode 5 BUILD + pass-and-play | v1.1 |
| 11 | Same-whole special rounds | v1.1; ~1 in 12, never in session 1, never consecutive, third answer is "can't tell" |
| 12 | Bottle shelf, unlocks, storage, SW, config | |

**v1 scope = Modes 1–4 + the reveal.**

---

## 5. Test gates

- `classify()` correctly tags all case types across the full bank
- No case type appears more than twice consecutively in 200 rounds (B2)
- Larger-fraction side is left 48–52% across 500 rounds, never 4+ consecutive (B3)
- Every `gap-trap` pair's values are genuinely unequal — **guards against authoring errors**
- `equivalentsOf()` produces non-doubling equivalents for every seed fraction (B9)
- Mode 4b target sets are ≥ 50% non-doubling
- Same-whole rounds never in session 1, never consecutive
- Vessels render zero fill before commit — assert fill height is 0 at commit time (B1)
- Grep bundle for cross-multiplication references (B8)
- 60fps during fill under 4× throttle; `prefers-reduced-motion` makes fill instant
- Keyboard-complete

---

## 6. Definition of done

Modes 1–4 playable, B1 asserted, interleaving asserted, side balance asserted, split animation holds the waterline still, level ring rings, gap traps present every run, keyboard-complete, offline.

---

## 7. Things that will tempt you

- **Showing the fill during judgment "so they can check."** That is B1 and it is the entire game. Refuse.
- **Blocking same-denominator rounds together because it "teaches the rule first."** It teaches autopilot. (B2)
- **Adding a "find common denominator" helper.** (B8)
- **Making Mode 4b completable by tapping 2 repeatedly.** (B9)
- **Highlighting the water in Mode 3 because that's what the fractions are.** The empty space is the lesson. (B10)
- **Using red/green for the two vessels.** (B5) Use deep teal and muted plum, differing in value as well as hue.

---

## 8. Ask Stephen, don't decide

- Final name
- Mode 5 pass-and-play in v1 or v1.1
- Whether same-whole rounds stay in-game or become their own micro-title
