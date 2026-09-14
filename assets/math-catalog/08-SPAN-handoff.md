# SPAN — Build Handoff v1.0

**The equals sign and missing terms. Two stone piers across a canyon; the span only lies flat when they match.**

Spec: `SPAN-design-spec.md` — read §2 (the one rule), §5 (language rules), §6 (anti-patterns).
Depends on: CORE v1 (`reveal`, `adapt.tier`, `audio`, `store`, `collect`).
Standards: 1.OA.D.7, 1.OA.D.8, 2.OA.A.1, 3.OA.D.8, 4.OA.A.3, 6.EE.B.5.

**Build this second, immediately after CORE.** Lightest engineering in the catalog, widest gap between how much damage the problem does and how cheap the fix is.

---

## 0. Mission

Give a child `8 + 4 = __ + 5`. In Falkner's study, **all 145 sixth graders** answered either 12 or 17 — the sum of the left side, or the sum of everything. Both are what you get if you read `=` as an instruction meaning *do the operation and write the result here*.

That's an **operational** understanding. The correct one is **relational**: the two sides have the same value. Children with the operational view reject `4 + 1 = 2 + 3` and `8 = 3 + 5` as nonsensical, because an equation with no answer slot isn't an equation to them.

**It doesn't resolve on its own** — 10% of students in grades 7–12 failed `7 + 6 + 4 = 7 + __`. And it's a gate: equal-sign knowledge at second grade predicts fourth-grade algebra competence.

**The cause is curricular, not the children's fault.** Across eight evaluated elementary curricula, in **seven of eight** students do not receive exposure to nonstandard equation types, and instruction on relational meaning is minimal and concentrated in K–2.

**The fix is proven.** Two randomized trials found **combined** tutoring — standard *and* nonstandard equations — beat standard-only and beat control.

**So the intervention is: show children equations that don't look like `a + b = c`.** That's it.

---

## 1. Invariants

| # | Invariant | Why |
|---|---|---|
| S1 | **Interleave standard and nonstandard, ~40/60. Never blocked, never pure-nonstandard.** | **Combined** tutoring is what worked. Standard-only failed; pure-nonstandard was never tested. Operational thinking is never erased, so the goal is to build the relational reading *alongside* it. A child who only sees strange equations in a game has learned a game rule. |
| S2 | **The blank rotates through all nine positions.** | A generator that only puts the blank after the `=` reproduces the exact curricular defect we exist to correct. |
| S3 | **≥ 60% of nonstandard-form items in Mode 1 are TRUE.** | A child running *this looks wrong so it's false* needs that heuristic to fail immediately and repeatedly. |
| S4 | **Near-miss false items** (`8 + 4 = 13 + 5`) are ≥ 25% of all false items. | Forces real evaluation over "looks balanced." |
| S5 | **No number pad. Stones are dragged.** | A keypad reintroduces "compute and enter the answer" — the operational frame in a different costume. |
| S6 | **Mode 3 numbers are computation-hostile** — ≥ 3 digits, differing by ≤ 3 across the `=`. | |
| S7 | **Language rules (§3) apply everywhere**, including settings, store listing, and landing page. | The mechanism here is partly linguistic. |
| S8 | **There is no preferred direction.** Neither side is "the question" and neither is "the result." | |

Plus CORE G1–G13.

---

## 2. The nine blank positions (S2)

```
a + b = __ + d          8 + 4 = __ + 5
a + __ = c + d          8 + __ = 5 + 7
__ + b = c + d          __ + 4 = 5 + 7
a + b = c + __          8 + 4 = 5 + __
__ = c + d              __ = 3 + 5
a = __ + d              12 = __ + 5
a − __ = c              9 − __ = 4
__ − b = c              __ − 3 = 4
a = c − __              4 = 9 − __
```

---

## 3. Language rules (S7)

| Never | Instead |
|---|---|
| "the answer" | *what makes it true* |
| "solve" | *make it true* |
| "equals" (alone, as the sign's name) | *is the same as* |
| framing one side as question, other as result | neither |

"The answer" is the operational frame compressed into two words. Using it would undo the game while the game is running. **Enforced by a copy-audit grep.**

---

## 4. Data structures

```js
Equation = {
  mode: 'judge' | 'blank' | 'relational' | 'wording' | 'build',
  left:  [{ n: 8 }, { op: '+' }, { n: 4 }],
  right: [{ blank: true }, { op: '+' }, { n: 5 }],
  form: 'a+b=_+d',        // one of 9, or 'standard'
  isStandard: false,
  truth: true,            // judge mode
  nearMiss: false,
  wording: 'relational'   // wording mode
}
```

**Mode 1 item families:**

| Item | Answer | Probes |
|---|---|---|
| `4 + 1 = 2 + 3` | true | "both sides can have operations" |
| `8 = 3 + 5` | true | "the answer goes on the right" |
| `7 = 7` | true | "an equation needs an operation" |
| `6 + 2 = 9` | false | ordinary evaluation |
| `8 + 4 = 13 + 5` | false | near-miss — forces evaluation |
| `3 + 5 = 8` | true | standard, interleaved |

**Mode 4 wordings — the contrast is the lesson:**

| Equation | "gives you" | "is the same as" |
|---|---|---|
| `3 + 5 ? 8` | works | works |
| `4 + 1 ? 2 + 3` | **breaks** | works |
| `8 ? 3 + 5` | **breaks** | works |

The operational reading isn't wrong — it's **narrow**, and it stops working the moment an equation gets interesting.

---

## 5. Build order

| # | Step | Acceptance |
|---|---|---|
| 1 | Canyon/pier/span renderer + **the seat animation** | It's the reward; build it first. Stone drops the last inch, dust lifts, the structure takes the load. |
| 2 | `EQUATION_FORMS` + `generateEquation` | S1 ratio and S2 positional coverage asserted |
| 3 | **Mode 2 THE BLANK** + stone dragging | Core loop proven. Stones snap to pier; targets ≥ 56px; long-press yields a stack of five. |
| 4 | **The pier-height reveal** | Both piers shown at true heights, shortfall shaded. A child who answered 12 to `8 + 4 = __ + 5` watches a pier of 17 tower over a pier of 12. Nobody has to say "wrong." |
| 5 | Mode 1 TRUE OR NOT + near-miss generation | S3, S4 |
| 6 | `generateRelationalPair` + Mode 3 + labelled blocks for large values | Nobody drags 345 stones — granularity changes, metaphor holds |
| 7 | Viaduct collectible | One arch per session; ~30 assembling into a Roman-scale viaduct receding into haze |
| 8 | Mode 4 SAY IT DIFFERENTLY + `WORDINGS` | v1.1 |
| 9 | Audio — the deep stone *seat* with real bass weight | |
| 10 | Mode 5 BUILD BOTH SIDES | v1.1 |
| 11 | Storage, unlocks, URL config, SW | |
| 12 | Accessibility, **copy audit**, keyboard pass | |

**v1 scope = Modes 1, 2, 3 + the reveal.** That already does more for relational understanding than seven of eight elementary curricula.

---

## 6. Test gates

- **Standard : nonstandard ratio is 38–42% across 500 generated sets**, never more than 3 consecutive of either kind (S1)
- **All nine blank positions appear in any 50-item Mode 2 set**, none exceeding 20% (S2)
- ≥ 60% of nonstandard-form Mode 1 items are true (S3)
- Near-miss false items ≥ 25% of all false items (S4)
- Mode 3 equations differ by ≤ 3 across the `=` and have operands ≥ 3 digits at stage 2+ (S6)
- `evaluate` correct for all nine forms **including subtraction with the blank in the subtrahend**
- **Copy audit:** grep user-facing strings for `answer`, `solve`, `equals` — zero hits outside allowed contexts (S7)
- Pier reveal renders correct heights for every form, including when the child's response makes one side wildly larger
- No number-pad element exists in the DOM (S5)
- Keyboard-complete (`←`/`→` select pier, `↑`/`↓` add/remove, `Enter` lays the span)

---

## 7. First run

No tutorial text. 5-second loop: two uneven piers, a span tilting and sliding off, a stone added to the short pier, the span settling flat, a mason walking across. Loop. Tap to start.

First item is `3 + __ = 5` — tiny numbers, guaranteed success, teaches the drag. **The second item is nonstandard.** There's no reason to wait.

---

## 8. Things that will tempt you

- **Serving only nonstandard equations** because "they get standard ones at school." Not what the evidence supports, and it teaches a game rule rather than a relation. (S1)
- **Putting the blank after the `=` because it's the natural layout.** That is the defect. (S2)
- **Adding a number pad for larger values.** Use labelled blocks. (S5)
- **Writing "Enter the answer" in a caption.** (S7)
- **Making most of the weird items false** because they look wrong. Backwards — the heuristic must break. (S3)
- **Choosing round numbers for Mode 3.** If the child can compute it, the mode has failed. (S6)

---

## 9. Ask Stephen, don't decide

- Final name (SPAN vs TRUE — TRUE is more evocative, harder to search)
- **Whether Mode 1 ships as a standalone class diagnostic** — 10 items, 3 minutes, whole class, no login, ~80 lines on top of this. Genuinely useful free tool and an effective funnel.
- Whether Mode 3 gets a grade-6 extension (`2x + 5 = 2x + __` is the same skill with a letter in it)
- Whether the `?standard=0` teacher override stays available despite S1 being the game's own default
