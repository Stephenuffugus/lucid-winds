# NOTCH — Build Handoff v1.0

**Mental rotation and spatial reasoning. A dim workshop; turn carved pieces until they seat.**

Spec: `NOTCH-design-spec.md` — read §2 (the typology), §5 Mode 1, and §6 (anti-patterns).
Depends on: CORE v1 (`reveal`, `adapt.tier`, `audio`, `store`, `collect`).
Standards: K.G.A.1–3, K.G.B.4–6, 1.G.A.1–2, 2.G.A.1, 3.G.A.1, 4.G.A.1–3, 5.G.B.3–4, 6.G.A.4.

---

## 0. Mission

Two reasons this game exists, and the second may matter more.

**The evidence is the strongest in the catalog.** A meta-analysis of 217 training studies found spatial skills genuinely malleable: g = 0.47 overall, **rising to g = 0.61 for children under 13**, with effects stable and unaffected by delays before post-test. Far transfer to mathematics has been demonstrated at age 8, and rotation training has been shown to **reduce children's use of counting strategies** in arithmetic.

**And it's the door in for children who've given up on math.** By eight or nine, plenty have decided they're bad at it, and a numeral on screen is enough to close them down. **NOTCH contains no numerals at all.** A child who "hates math" will play it, and it trains the substrate math sits on. This is what you hand a kid before you hand them CREASE.

---

## 1. Invariants

| # | Invariant | Why |
|---|---|---|
| N1 | **No multiple choice in TURN. Continuous drag rotation only.** | A picker lets a child feature-match to the answer without rotating anything. **Dragging the piece is the training** — individualized motoric mediation produced significantly greater gains than control and generalized to a structurally distinct task. |
| N2 | **Mirror foils in every rotation set from stage 2.** | A piece and its mirror can never be made to fit by rotation. Without foils, a child succeeds by spotting a notch and a bump; with them, feature-matching collapses and rotation is the only route. **This is the mechanism, not a difficulty knob.** |
| N3 | **Angular disparity sampled evenly 0°–180° in 30° steps.** | RT rises linearly with rotation magnitude in genuine mental rotation — that profile is the signature. Serving only 90° and 180° can't distinguish rotation from recognition. |
| N4 | **Rigorously ungendered content.** No pink/blue, no vehicles-and-robots-only iconography. | Training studies repeatedly find **no significant sex differences** in children's rotation gains. A spatial game that codes male does the most harm to exactly the children who'd benefit most. Content is carved animals, architecture, abstract solids, tools, plants. |
| N5 | **Never suggest spatial ability is fixed.** No "spatial type," no aptitude framing. | The headline finding is malleability. |
| N6 | **Children may fold to check in Mode 2.** | Verification is mediation, not cheating. Difficulty comes from harder folds, never from withholding the check. |
| N7 | **NO NUMERALS ANYWHERE.** Not in scores, levels, or collectible counts. | NOTCH's distinguishing property and the reason it works as the door-in. Enforced by grep. |
| N8 | **Seat tolerance is generous** — ±12° easiest, tightening to ±6°. | Fine motor precision is not the skill being trained. |

Plus CORE G1–G13.

---

## 2. The typology drives the mode list

|  | **Static** | **Dynamic** |
|---|---|---|
| **Intrinsic** | **FIND** (disembedding) | **TURN** (rotation) · **FOLD** (folding) |
| **Extrinsic** | **SCALE** (spatial scaling) | **AROUND** (perspective taking) |

**Unlock order follows the developmental trajectory, not difficulty guesswork:** intrinsic skills improve most between ages 6–8, extrinsic between 8–10.

`FIND` + `TURN` open → `FOLD` after a clean TURN run → `SCALE` around the age-8 transition → `AROUND` last.

**Where each reaches math** (matters for hub routing):
- **TURN** → addition, via missing-term problems → cross-link to **SPAN**
- **SCALE** → subtraction, and serially through proportional reasoning → number line estimation → **fraction** number line estimation → cross-link to **TINT**, **YONDER**, **CREASE**
- **FOLD** → stronger predictor of science achievement than scaling
- **FIND** → uniquely accounted for variance in chemistry

**SCALE is the hinge of the whole catalog.** A child stuck on fraction placement may actually be stuck on map scaling, one level down.

---

## 3. Data structures

```js
RotationTask = {
  pieceId: 'finch-07',
  axis: 'z' | 'xy',
  angularDisparity: 120,     // sampled evenly 0..180 step 30 (N3)
  isMirror: false,           // true = unseatable foil (N2)
  tolerance: 9,              // degrees (N8)
  stage: 2
}

Result = {
  seated: bool, finalAngle: 117, error: 3,
  rtMs: 4200,                // logged, never displayed
  rotationsAttempted: 2
}
```

**TURN progression:** in-plane → in-plane **+ mirror foils** → 3D one axis → 3D two axes.

---

## 4. Rendering approach

**Do not pull in three.js.** It breaks the deployment model and won't hold frame rate on a Celeron.

Model each piece as a small vertex set and project with a hand-rolled 4×4 matrix — about 80 lines, runs anywhere. Render as SVG with pre-computed projected outlines.

**Grain is functional, not decorative.** Every piece carries a visible directional wood grain baked into the model, because grain is what makes orientation readable mid-rotation. A featureless shape gives the child nothing to track and quietly converts the task into something else. **Grain must rotate with the object**, not be applied in screen space.

---

## 5. Build order

| # | Step | Acceptance |
|---|---|---|
| 1 | `project()` + piece rendering with baked grain | Prove 3D-without-three.js before anything else; matches reference impl within 0.5px |
| 2 | Drag-rotate controller (pointer, then keyboard) | 60fps sustained during continuous drag under 4× throttle |
| 3 | `generateRotationTask` + `seatCheck` + mirror-foil generation | Mirror pieces provably unseatable at all 360 integer angles |
| 4 | Mode 1 TURN stages 1–2 | Core loop proven |
| 5 | **The slow reveal rotation** (~60°/s) incl. the mirror reveal | On a mirror miss: the piece rotates a full 360°, visibly failing to seat at every angle, *then* flips to show the mirror. Only way to make "no rotation can fix this" felt rather than asserted. |
| 6 | Mode 3 FIND | Cheapest mode; widens the age range immediately; the refuge for a frustrated child |
| 7 | TURN stages 3–4 (3D, two axes) | Dual-handle fallback for trackpad-only Chromebooks |
| 8 | Mode 2 FOLD + `foldSimulate` | N6 holds |
| 9 | Mode 4 SCALE | 1:2 → 1:3 → 1:1.5 → 2:1 → non-integer |
| 10 | Village collectible + shelf | ~24 buildings |
| 11 | Mode 5 AROUND — **depends on the village existing** | Orbit-to-match, not multiple choice |
| 12 | Audio, storage, unlocks, SW, config | Seat *thunk* is the best sound in the game — tune it until it's satisfying |
| 13 | Accessibility, perf, **numeral grep**, content audit | |

**v1 scope = Modes 1 and 3 + the reveal.** Already a defensible product. SCALE is the priority for v1.1 because of its catalog links.

---

## 6. Test gates

- Angular disparity distribution uniform across 0°–180° step 30 over 500 tasks (N3)
- Every rotation set at stage ≥ 2 contains ≥ 1 mirror foil (N2)
- **Mirror pieces provably unseatable:** `seatCheck` fails at all 360 integer angles
- `project()` matches a reference implementation within 0.5px across 100 random matrices
- Grain vector rotates with the piece, not screen-space — visual regression test
- **No numeral glyph renders anywhere — grep the DOM for `[0-9]` after a full run** (N7)
- Content audit: no gendered color coding, no gendered object categories (N4)
- 60fps sustained during continuous drag under 4× throttle
- Keyboard-complete (15° steps — the one place stepping is acceptable, since it's the only way keyboard play works)

---

## 7. Things that will tempt you

- **Turning TURN into a four-option picker** because drag is harder to build and easier to get wrong. It is the entire mechanism. (N1)
- **Skipping mirror foils** because they feel unfair. They're the reason the mode works. (N2)
- **Only serving 90° and 180°** because they're the clean cases. (N3)
- **Using three.js.** (§4)
- **Applying grain as a screen-space texture.** It won't rotate with the piece and the task quietly breaks. (§4)
- **Adding a level counter or progress number.** (N7)
- **Blocking the fold-to-check in Mode 2** to "make it a real test." (N6)
- **Tightening seat tolerance to make it feel precise.** You'd be filtering on fine motor control. (N8)

---

## 8. Ask Stephen, don't decide

- Final name (avoid UMBRA — existing shadow-traversal project)
- **Whether SCALE gets promoted into v1** given its links to CREASE, YONDER, and TINT
- Whether the no-numerals rule is worth its cost (it forfeits a visible progress count; my view is yes, but it should be a conscious choice)
- Two-axis rotation on phones: dual-handle as default rather than fallback?
- Whether the village becomes hub-level shared content
