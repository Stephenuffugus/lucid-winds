# GAUGE — Build Handoff v1.0

**Decimal magnitude and place value. A precision bench; a loupe that opens ten new divisions between two that were touching.**

Spec: `GAUGE-design-spec.md` — read §2 (why the engine classifies patterns) and §5 (anti-patterns).
Depends on: CORE v1 (`adapt.classify`, `reveal`, `audio`) **and YONDER's `numberline`**, which GAUGE extends with recursive subdivision.
Standards: 4.NF.C.5–7, 5.NBT.A.1–4, 5.NBT.A.3b, 6.NS.C.7.

**Sequencing: ship AFTER CREASE and BRIM. See §7.**

---

## 0. Mission

Decimals are where children who survived fractions get caught again — by the same bug in new clothes, and by a second bug the first one's treatment creates.

**"Longer is larger"** — the child treats digits after the point as a whole number: 0.125 > 0.3 because 125 > 3. The natural-number rule, unchanged from BRIM's territory.

**"Shorter is larger"** — the child decides 0.3 > 0.496, reasoning that more places means smaller pieces so a longer decimal must be smaller. Usually interpreted as an **intrusion of fraction knowledge**.

**The developmental pattern is the uncomfortable part.** Longer-is-larger appears in younger children and decreases with age. **Shorter-is-larger persists for older children and is present in adults.** The one that looks more sophisticated is the one that lasts.

There's also a **zero rule** — a zero in the tenths column makes a number small — which is right about 0.05 and wrong about 0.50.

---

## 1. The finding that dictates the engine

The Decimal Comparison Test, in a version of 30 pairs, **diagnoses a student's misconception by the precise pattern of responses**, sorting into four coarse codes and twelve fine ones.

It works that way because **score alone is uninformative**, and the reason is **apparent experts**: students who get many items right while running entirely wrong reasoning. A longer-is-larger child compares 5.736 with 5.62 correctly — with the same thinking that put 0.125 above 0.3.

> **An adaptive engine that routes on accuracy will promote a child who understands nothing, and the failure will surface two years later in algebra.**

GAUGE classifies **response patterns**, not scores — the direct sibling of YONDER's log-vs-linear fitting.

| Code | Pattern | Route to |
|---|---|---|
| **L** | Longer is larger | Mode 2 ZOOM — magnitude on a line |
| **S** | Shorter is larger | Mode 4 SAME VALUE + Mode 2 |
| **A** | Apparent expert | Discriminating items + Mode 5 |
| **U** | Unclassified / genuine expert | Density and precision work |

---

## 2. Invariants

| # | Invariant | Why |
|---|---|---|
| GA1 | **Never route on accuracy alone. Classify response patterns.** | §1. |
| GA2 | **Every 20-item set contains ≥ 6 discriminating pairs** — items where L, S, and truth do not all agree. | Without them classification is impossible no matter how many items you serve. |
| GA3 | **"The same" is an available answer.** | Equal-value pairs are the cleanest place where both erroneous rules break at once. |
| GA4 | **Zoom always shows exactly ten divisions.** Never a continuous magnification. | The base-10 structure *is* the lesson; a smooth zoom erases it. |
| GA5 | **Money is never the only context.** | Currency caps at two places and hands children a crutch that breaks at three. It may appear; it may not carry a mode. |
| GA6 | **The decimal point is a separator, not a star.** Copy refers to *places* — tenths, hundredths. | |
| GA7 | **Never display the child's diagnostic code.** Not as level, badge, or hint. | Teacher view (opt-in, local) only. |
| GA8 | **Never say a person is wrong in Mode 5.** Reasoning is examined; the reasoner isn't judged. | The mode asks children to look closely at errors. It has to be safe to do that. |
| GA9 | **Decimals are strings or scaled integers, never floats.** | `0.1 + 0.2 !== 0.3` in IEEE 754. In a game about decimal magnitude that would be an embarrassing bug to ship. |

Plus CORE G1–G13.

---

## 3. Item bank

| Pair | Truth | L says | S says | Value |
|---|---|---|---|---|
| `0.125` vs `0.3` | 0.3 | 0.125 | 0.3 | **Separates L** |
| `0.3` vs `0.496` | 0.496 | 0.496 | 0.3 | **Separates S** |
| `0.4` vs `0.35` | 0.4 | 0.35 | 0.4 | **Separates L**; S right by accident |
| `5.736` vs `5.62` | 5.736 | 5.736 | 5.62 | **Catches apparent experts** |
| `0.05` vs `0.4` | 0.4 | 0.4 | 0.05 | Zero rule |
| `0.5` vs `0.50` | equal | 0.50 | 0.5 | **Both rules fail** |
| `2.6` vs `2.06` | 2.6 | 2.06 | 2.6 | Zero rule + L |

A run is 20 pairs — enough to classify with reasonable confidence, short enough to be a game.

---

## 4. Classification

After ≥ 12 items including ≥ 6 discriminating pairs, score the response vector against each rule's predicted vector:

```js
adapt.classify(responses, {
  rules: { L: predictL, S: predictS, truth: predictTruth },
  minItems: 12, minDiscriminating: 6, threshold: 0.8
});
```

- `E_match` high **and** both rule matches low → **U** (genuine expert)
- `E_match` high **but** one rule also ≥ 0.8 → **A** — the item set failed to separate them; **serve more discriminating pairs before concluding anything**
- Highest rule match → **L** or **S**
- Nothing above threshold → **U**, route to Mode 2 by default

---

## 5. Modes

**1 WHICH IS MORE** (the DCT, playable — simplest mode in the catalog, most informative) · **2 ZOOM** (the heart) · **3 IN BETWEEN** (density) · **4 SAME VALUE** (trailing zeros and the zero rule) · **5 SPOT THE ERROR**.

**Mode 2 is the antidote, for three reasons:**
1. **It makes 0.125 visibly small.** A child who thinks 0.125 > 0.3 watches it land between the 1st and 2nd division while 0.3 stands at the 3rd. No argument required.
2. **Each zoom shows exactly ten divisions** (GA4).
3. **It works in both directions** — zoom out from 0–1 to 0–10 to 0–100, so tenths and tens are visibly the same move at different scales.

Progression: tenths → hundredths → thousandths → mixed whole-and-decimal → zoom-out.

**Mode 4 separates two things children conflate:** a zero *after* the last significant digit changes nothing; a zero *before* it changes everything. A child holding the zero rule fails exactly half these items in a detectable pattern.

**Mode 5 — evidence-backed, and almost nobody uses it.** Contrasting incorrect examples with correct ones helps students learn correct concepts, with the incorrect-example condition producing *more* discussion of correct concepts.

```
Ada says: 0.125 is bigger than 0.3, because 125 is bigger than 3.
Bo says:  0.3 is bigger than 0.125, because 3 tenths is more than 1 tenth.
```

The child picks the better **reasoning**, not the better answer. Two requirements:
- **Sometimes the wrong reason reaches the right answer** (`5.736` vs `5.62`). Ada's rule gives the correct result for a reason that will betray her next time. A child who can see that has understood something most adults haven't.
- **The errors Ada makes are drawn from the child's own classified code** — meeting your own reasoning in someone else's mouth is a far gentler mirror than being told. (GA8)

---

## 6. Build order

1. **`subdivide` + the recursive zoom renderer**, extending YONDER's `numberline`, with a **constant-node-count** constraint
2. **String / scaled-integer decimal arithmetic layer** with the float-free test (GA9)
3. `DCT_ITEM_BANK` + `generateComparisonSet` with the GA2 discriminator guarantee
4. Mode 1 WHICH IS MORE — proves the loop and produces the data
5. `classify` with five synthetic-responder test suites
6. Mode 2 ZOOM + the hairline reveal (**the loupe falls on wherever the child put the marker**, so they see their own answer magnified before the truth appears beside it)
7. `routeFrom` and adaptive item selection
8. Mode 4 SAME VALUE
9. Mode 3 IN BETWEEN + place-value steppers (columns labelled by **place name**, not digit position — doubles as place-value instruction and removes any need for a keyboard)
10. Mode 5 SPOT THE ERROR + `MISCONCEPTION_VOICES` keyed to the child's own code
11. Instrument case collectible (~24 pieces in milled recesses), storage
12. Teacher view
13. Audio (**the detent pitch rises with each place-value level**, so a child hears they've gone one layer finer), URL config, SW
14. Accessibility, perf, float grep

**v1 scope = Modes 1, 2, 4 + classification.** Modes 3 and 5 are v1.1, though Mode 5 is the one I'd least want to leave out.

---

## 7. Sequencing warning

**Our own fraction games may create the misconception GAUGE treats.** Shorter-is-larger is interpreted as an **intrusion of fraction knowledge** — the one misconception in the catalog that is plausibly iatrogenic.

1. **Ship CREASE and BRIM before GAUGE.**
2. **The hub must not recommend GAUGE to a child currently working through CREASE or BRIM.**
3. If we ever measure anything, this is the relationship to watch.

---

## 8. Test gates

- Every 20-item generated set contains ≥ 6 discriminating pairs (GA2)
- `classify` correctly identifies synthetic **L**, **S**, zero-rule, **apparent-expert**, and expert responders across 200 simulations each
- **Apparent-expert detection specifically:** a synthetic responder scoring ≥ 85% while running longer-is-larger must be coded **A**, never **U**
- **No decimal arithmetic uses floats** — grep for `parseFloat` and `Number(` on decimal values (GA9)
- `subdivide` returns exactly 10 divisions at every level, 0–1 through thousandths (GA4)
- Equal-value pairs appear in every set and "the same" is selectable (GA3)
- **Zoom holds 60fps under 4× throttle with no DOM rebuild** — assert node count is constant across zoom levels
- Diagnostic code never reaches a render path outside the teacher view (GA7)
- Keyboard-complete (`←`/`→` move by one division, `↑`/`↓` change zoom level, `Enter` commits)

---

## 9. First run

No text. 6-second loop: a rule 0 to 1, a marker drops past the 3rd division, the loupe falls, ten new divisions appear, the marker settles on the 5th, `0.35` etches beside it. Loop.

First item is `0.7` vs `0.2` — same length, unambiguous, no rule distinguishes it. It teaches the interaction and tells us nothing, which is correct for item one.

---

## 10. Things that will tempt you

- **Adapting on accuracy because it's simpler.** It promotes apparent experts. (GA1)
- **Generating random decimal pairs.** Most are non-discriminating and the classifier starves. (GA2)
- **A smooth continuous zoom because it looks better.** It erases base ten. (GA4)
- **Using floats "since the values are small."** (GA9)
- **Building the whole game on money** because it's relatable. (GA5)
- **Rebuilding division ticks on every zoom.** Generate current level ±1 and recycle.
- **Putting a sad face on Ada.** (GA8)

---

## 11. Ask Stephen, don't decide

- Final name (GAUGE vs VERNIER — the latter more beautiful and more obscure)
- **Whether the teacher view is the whole product.** Shorter-is-larger is described in the literature as surprising and not commonly recognised by teachers. A free, three-minute, no-login class screener naming the misconception per student is Mode 1 + `classify` + one screen.
- Age fit — like TINT, this reaches grade 7. The catalog now has a clear younger band (GLIMPSE, YONDER, NOTCH, HUSH) and an older one (TINT, GAUGE); the hub should probably reflect that.
