# YONDER — Build Handoff v1.0

**Whole-number line estimation. A road running out to a distant signpost.**

Spec: `YONDER-design-spec.md` — read §2 (developmental model), §6 (anti-patterns), §7 (diagnostic engine).
Depends on: CORE v1 (`numberline`, `adapt.tier`, `adapt.classify`, `reveal`, `audio`).
Authors: the recursive-subdivision pattern GAUGE will extend.
Standards: K.CC.A.1–3, 1.NBT.A.1, 2.MD.B.6, 2.NBT.A.1–4, 3.NBT.A.1, 4.NBT.A.2.

---

## 0. Mission

The intervention here is already proven and simply hasn't been built properly as free software. Preschoolers who played a **linear** number board game for roughly an hour improved on magnitude comparison, number line estimation, counting, and numeral identification, with gains holding nine weeks later. Classmates who played an identical game with **colored** squares instead of numbered ones improved on nothing. Four 15-minute sessions eliminated the income-linked gap in estimation proficiency. **Circular boards produced no benefit.**

Separately: feedback is the active ingredient. In the IES-funded "150 Procedure," controls got the identical problems and simply weren't told whether they were right.

---

## 1. Invariants

| # | Invariant | Why |
|---|---|---|
| Y1 | **Nothing circular, anywhere.** No spinner wheels, clock faces, pies, radial progress rings, circular avatars. | Linear boards produced the gains; circular ones did not. The shape is doing real work and a circular element in the chrome quietly competes with it. |
| Y2 | **No auto-move in Mode 1.** One tap (or one keypress) per square, each square named as it is passed. | Saying "six, seven" while moving 5→7 is the mechanism, not the interface. An auto-move button deletes the intervention. **Do not add one, even as an accessibility option.** |
| Y3 | **Road pixel width and offset randomize every round.** | Same as CREASE C1. |
| Y4 | **No mileposts in FLAG or OPEN ROAD** unless the child placed them. | |
| Y5 | **Never show the child their log/linear diagnosis.** | Routing signal, not a report card. |
| Y6 | **Every round reveals the truth.** No round may be skipped past. | Feedback *is* the treatment. |
| Y7 | **Numerals shown AND named.** | Numeral identification improved alongside estimation in the source studies; both channels are load-bearing. |
| Y8 | **Range varies within a session**, including back-drops to mastered ranges. | |
| Y9 | **Sonified pitch is linear in the target value**, never in log frequency. | Log-frequency mapping would teach the exact misconception we're fighting. |
| Y10 | **Mode 1's track never wraps to a second line.** Scroll horizontally instead. | A wrapped track is a circular board in disguise. |

Plus CORE G1–G13.

---

## 2. The developmental model

The log→linear shift is **range-specific**. A child can be linear on 0–100 and simultaneously logarithmic on 0–1000.

| Range | Shift occurs |
|---|---|
| 0–10 / 0–20 | preschool → K |
| 0–100 | K → grade 2 |
| 0–1000 | grade 2 → grade 4 |
| 0–10,000+ | grade 3 → grade 6 |

**Calibration error rates (0–100):** K ≈ 27%, grade 1 ≈ 18%, grade 2 ≈ 15%. Tolerance tiers are seeded from these: ±15 / ±12 / ±9 / ±6 / ±4 / ±2.5 % PAE.

---

## 3. The 150 probe

On 0–1000, **150 is the maximum-discrepancy item**: a logarithmic representation predicts ~725, a linear one predicts 150 — a 57.5% spread. Serve it early at each new range. A placement past ~60% of the road is a near-unambiguous log signal.

Equivalents: **15** on 0–100, **1500** on 0–10,000. Store in `PROBE_TABLE`.

The reveal on a probe item gets extra weight: the traveler walks the long way back from the flag to the true position, slowly, with the tone falling as it returns.

---

## 4. Target sampling — the most likely implementation error

**Do not sample uniformly.** Log and linear predictions converge at the high end and diverge sharply at the low end; uniform sampling produces data that cannot distinguish the models.

```
~40% of targets from  0.02N – 0.20N     (maximum divergence)
~30%                  0.20N – 0.50N
~30%                  0.50N – 1.00N
```

Always include the range's probe at least once per stage at a new range.

---

## 5. Data structures

```js
Round = {
  mode: 'race' | 'flag' | 'name' | 'open' | 'mileposts',
  range: { min: 0, max: 1000, bounded: true },
  target: 150,
  isProbe: true,
  road: { widthPct: 0.88, offsetPct: 0.06 },
  tier: 3
}

RangeState = {
  range: 1000, tier: 3,
  estimates: [{ target, placement }, ...],
  fit: { linearR2: 0.61, logR2: 0.93, meanPAE: 0.24 },
  model: 'logarithmic'          // Y5 — never rendered to the child
}
```

**Routing table:**

| Fit | Mean PAE | Action |
|---|---|---|
| Log better | any | Stay. This is the frontier. Max feedback, re-serve probe, inject MILEPOSTS rounds. |
| Linear better | > tier band | Stay, tighten nothing. |
| Linear better | ≤ tier band | Advance one tier. |
| Linear better | ≤ band ×2 stages | **Promote range**, reset to tier 2. |
| Linear, top range mastered | — | Rotate ranges, unlock OPEN ROAD. |

Needs ≥ 5 estimates spanning the range before fitting; below that, route on PAE alone. **Per-range state is stored independently.**

---

## 6. Build order

| # | Step | Acceptance |
|---|---|---|
| 1 | Road renderer, Y3 randomization, flag drag, loupe | Variance asserted |
| 2 | **Traveler walk + reveal sequence** | Build the feedback mechanism before anything else — it's the treatment |
| 3 | `scoreEstimate` + `generateTarget` with §4 distribution | Distribution matches table within tolerance over 1000 draws |
| 4 | Mode 2 FLAG at a fixed range | Core loop proven |
| 5 | `fitModels` + `routeRange` | Correctly identifies synthetic log and linear responders, 100 sims each |
| 6 | Multi-range routing + `PROBE_TABLE` | |
| 7 | RESONARC pitch sonification (Y9) | Pitch linear in target value |
| 8 | **Mode 1 THE RACE** with per-square tap advance and spoken numerals (Y2, Y7, Y10) | No auto-advance path exists; track never wraps |
| 9 | Mode 5 MILEPOSTS + persistent stage benchmarks | Halfway, then quarters, then estimation on the marked road |
| 10 | Mode 3 NAME IT + column steppers | v1.1 |
| 11 | Mode 4 OPEN ROAD + ghosted unit iteration | v1.1 |
| 12 | Map collectible, teacher view, SW, config | ~30 map pieces assembling westward |

**v1 scope = Modes 1, 2, 5 + the diagnostic engine.**

---

## 7. Test gates

- `fitModels` identifies synthetic logarithmic and linear responders across 100 simulated children each
- `generateTarget` distribution matches §4 within tolerance over 1000 draws; no repeats within a stage
- Road width/offset varies across 100 rounds (Y3)
- `scoreEstimate` PAE exact across the full randomized offset/width range
- **Mode 1 cannot be advanced without one input per square** — assert no auto-advance code path exists (Y2)
- Mode 1 track never wraps at any viewport width (Y10)
- **No circular geometry anywhere** — grep for `border-radius: 50%`, `<circle`, and `rotate(` on progress elements (Y1)
- Sonified pitch is linear in target value, not log frequency (Y9)
- Diagnosis never reaches a render path outside the opt-in teacher view (Y5)
- 60fps during walk under 4× throttle; walk still conveys position with `prefers-reduced-motion`
- Keyboard-complete

---

## 8. Definition of done

Modes 1, 2, 5 playable; diagnostic routing working and invisible; probe items serving; walk reveal on every round; pitch sonification linear; circular-geometry grep clean; keyboard-complete; offline.

---

## 9. Things that will tempt you

- **Adding an auto-move or "skip to end" to Mode 1** because tapping 30 squares feels tedious. It is the intervention. (Y2)
- **A circular spinner for Mode 1's dice roll.** Use a flipped card or a tossed stick. (Y1)
- **Sampling targets uniformly across the range.** Kills the diagnostic silently. (§4)
- **Showing the child "you're thinking logarithmically."** (Y5)
- **Mapping pitch logarithmically because that's how pitch works perceptually.** That is exactly the confusion we're correcting. (Y9)
- **Wrapping the track to fit the viewport.** (Y10)

---

## 10. Ask Stephen, don't decide

- Final name
- Teacher view in or out (~40 lines of SVG; the most differentiating feature for teachers, but it makes YONDER feel like an assessment tool)
- **Whether Mode 1 should be its own standalone title** — it's the proven intervention, targets ages 4–7, and shares almost no UI with the estimation modes
- Spoken numerals: Web Speech API (free, robotic, inconsistent) vs recorded (~60KB, breaks the file-size budget)
