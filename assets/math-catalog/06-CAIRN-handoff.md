# CAIRN — Build Handoff v1.0

**Working memory strategy. Stones surface from still water in sequence, then sink.**

Spec: `CAIRN-design-spec.md` — **§1 is mandatory reading. Do not start without it.**
Depends on: CORE v1 (`schedule`, `reveal`, `adapt.staircase`, `audio`, `session` cap).
Build position: **last in the catalog, and possibly not at all.** See §0.

---

## 0. Scope warning — read before committing engineering time

**This is the weakest evidence base of the ten, and Stephen has been told so.**

A meta-analysis of 87 publications and 145 experimental comparisons found reliable improvement only on **intermediate transfer** — the trained skills themselves. For **far transfer** to nonverbal ability, verbal ability, word decoding, reading comprehension, or arithmetic, there was **no convincing evidence of any reliable improvement** against a treated control. A multilevel meta-analysis in typically developing children found effect sizes proportional to task-outcome similarity, with intelligence and academic achievement essentially unaffected under active controls.

**A game that silently lengthens sequences and claims to make children smarter is the exact product this catalog exists as an alternative to.**

### What survives, and what this game therefore is

1. **Strategy instruction adds durable benefit training alone doesn't.** In a double-blind RCT, working memory gains were maintained at three months — and were **significantly greater for the group that also received metacognitive strategy training**.
2. **Chunking is trainable and reaches untrained measures**, with corresponding reductions in prefrontal and parietal activation. And **structured trials significantly encourage chunking**, lessening working memory demand.
3. **Rehearsal is trainable in this exact age band** — cumulative rehearsal training improved recall in children aged 5–9.
4. **Visuospatial modality** shows enhanced transfer likelihood and long-term stability. That's why this is stones, not digits.

**CAIRN teaches chunking and rehearsal explicitly, and says in writing what it doesn't do.** If this slot gets reallocated, that's a reasonable call.

---

## 1. Invariants

| # | Invariant | Why |
|---|---|---|
| K1 | **The words `brain training`, `IQ`, `smarter`, `cognitive enhancement`, `brain power` appear nowhere** — app, listing, landing page, social. | Enforced by grep. |
| K2 | **Always show the chunk after the trial.** A line sweeps through the stones and the caption names the shape. | **Implicit practice is the failed condition.** This is the one animation the game cannot ship without. |
| K3 | **Never display span as a number.** No "Level 6," no "Your span: 5." | Span is a capacity. Handing a child a number to compare against a sibling is a harm with no upside. Progress shows as cairns, which reveal nothing. |
| K4 | **Failure is the normal state.** No sound, no color change, no accumulating penalty. | An adaptive span task holds the child near their limit by design — they'll fail roughly a third of the time. |
| K5 | **Hard 5-minute session cap**, implemented in CORE's `session`. The game *ends*; it does not offer "one more." | Working memory tasks are genuinely fatiguing and a tired child is practicing failure. |
| K6 | **Never adapt below a floor of 2.** | A child who can't do 3 stays at 2 and succeeds. The game never communicates they've bottomed out. |
| K7 | **No n-back.** | Weakest point of a weak literature, aversive for children, and — decisively — **offers no strategy to teach**. Chunking has structure, rehearsal has rhythm, n-back has neither. Running span (Mode 5) covers the same updating demand and is playable. |
| K8 | **Chunk count, not stone count, drives stage progression.** | The lesson is that nine stones can be three shapes. |

Plus CORE G1–G13.

---

## 2. Modes

| Mode | Trains | Note |
|---|---|---|
| **1 PATH** | visuospatial span (Corsi lineage) | The substrate, not the point |
| **2 SHAPE** | **chunking** | The heart. Sequences built from `SHAPE_LIBRARY` structure |
| **3 HOLD** | **rehearsal**, with a filled delay | Rehearsal's value is maintenance *across an interruption* |
| **4 BACK** | manipulation (reverse order) | The line between storage and working memory proper |
| **5 CARRY** | updating under load | Rising water / running span / two colors |

**Mode 2 progression — note what the numbers do:**

| Stage | Structure | Chunks | Stones |
|---|---|---|---|
| 1 | one clean shape | 1 | 3–4 |
| 2 | one shape, longer | 1 | 5 |
| 3 | two shapes | 2 | 6 |
| 4 | two shapes, one repeated | 2 | 7 |
| 5 | three shapes | 3 | 8–9 |

A child holding nine positions has exceeded every published span estimate. A child holding **three shapes** has not. The child feels the strategy work rather than being told about it.

**Scaffold fade:** stages 1–2 draw the shape faintly *during* presentation as well as after; from stage 3, reveal only.

**Mode 3 phase order:** presentation → **hold** (stones dark, a pulse runs at the presentation rhythm, the child taps along from memory — motor rehearsal) → **filled delay** ~4s (mist, a bird, a small unrelated tap target) → recall.

**Mode 4 pays off Mode 2's lesson visibly:** reversing *chunks* is dramatically easier than reversing *items*. That's a deliberate curriculum — teach the strategy, then build a room where only the strategy works.

---

## 3. Data structures

```js
Path = {
  mode: 'path'|'shape'|'hold'|'back'|'carry',
  stones: [{ id, x, y }],
  shapes: [{ type:'L', stoneIds:[3,7,8,12] }, { type:'run', stoneIds:[14,15,16] }],
  chunkCount: 2,
  stage: 3,
  presentMs: 800, gapMs: 400,
  delayMs: 4000            // HOLD only
}

Result = {
  correct: bool,
  divergenceIndex: 4,      // where their path left the true one
  taps: [...], rtMs: [...]  // logged, never displayed
}
```

`SHAPE_LIBRARY`: runs, Ls, hooks, triangles, repeated pairs.

---

## 4. Build order

1. Moor renderer + **frame-accurate presentation scheduler** — verify timing under throttle before building anything on top
2. `generatePath` + `SHAPE_LIBRARY` with the decomposition test
3. Mode 1 PATH + `scoreCrossing` — proves the loop
4. **The shape-reveal stroke** — the single most important animation (K2)
5. Mode 2 SHAPE + scaffold fade
6. RESONARC tones + **chunk-as-phrase reveal** — stone pitches play as one connected musical idea, so chunking is audible as well as visible. Tones sound during presentation at stages 1–2, then fade from stage 3 so the child holds the path spatially rather than as a tune; the reveal keeps its phrase at every stage.
7. Mode 3 HOLD + rehearsal pulse + `DISTRACTOR_LIBRARY`
8. `adaptSpan` with floor and the no-numeral guarantee (K3, K6)
9. Mode 4 BACK
10. Mode 5 CARRY, all three variants
11. Cairn collectible (~24), session cap, storage
12. URL config, SW, accessibility, forbidden-claims grep

**v1 scope = Modes 1, 2, 3 + the shape reveal.** A complete and honest product.

---

## 5. Test gates

- Every generated path at stage ≥ 1 decomposes into the declared number of shapes — **assert no "structured" path is actually random**
- Chunk count, not stone count, drives stage progression (K8)
- `adaptSpan` never returns below 2 and never surfaces a numeric span to any render path (K3, K6)
- **Grep the built app for `IQ`, `brain train`, `smarter`, `cognitive enhance`** — zero hits (K1)
- Measured presentation rate within ±25ms under 4× throttle
- Filled delay actually occupies its window, and its tap target cannot be confused with recall
- Session terminates at the 5-minute cap regardless of state (K5)
- Audio emits one event per stone, and the reveal phrase is not present during presentation at stage ≥ 3
- 60fps during presentation and shape stroke
- Keyboard-complete

---

## 6. Things that will tempt you

- **Adding n-back because it's the famous one.** (K7)
- **Showing the span number "so they can see progress."** (K3)
- **Making failure feel like failure** so success feels earned. At correct difficulty the child fails a third of the time. (K4)
- **Offering "one more round" at the cap** because it's a nicer UX. (K5)
- **Generating random sequences and calling them structured.** The decomposition test exists because this is easy to do by accident. (K2, gates)
- **Writing landing copy that implies academic benefit.** (K1)

---

## 7. Ask Stephen, don't decide

- **Whether to build this at all.** The case for: chunking and rehearsal are teachable, strategy instruction is the part of the literature that survives, and no free game teaches them explicitly. The case against: weakest evidence of the ten, competing on honesty against products that aren't.
- Whether the honesty is public-facing — a landing page stating plainly what this does and doesn't do, with the meta-analyses linked, would be the only kids' memory game on the internet doing that.
- Hard session cap: right call, but a real product decision, not a technical one.
