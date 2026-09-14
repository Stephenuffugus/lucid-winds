# FREE KIDS' MATH & COGNITIVE CATALOG — Index

**Ten free games. No accounts, no ads, no data collection, offline-capable, Chromebook-native.**

Sky Walk Studio / Lucid Winds. This document is the map. Read it before picking up any individual handoff.

---

## 1. The catalog

| # | Name | Skill | Ages | Handoff |
|---|---|---|---|---|
| — | **CORE** | shared foundation | — | `00-CORE-handoff.md` |
| 1 | **CREASE** | fraction number line | 8–11 | `01-CREASE-handoff.md` |
| 2 | **BRIM** | fraction comparison & equivalence | 8–11 | `02-BRIM-handoff.md` |
| 3 | **YONDER** | whole-number line estimation | 4–11 | `03-YONDER-handoff.md` |
| 4 | **GLIMPSE** | subitizing & number sense | 3–8 | `04-GLIMPSE-handoff.md` |
| 5 | **NOTCH** | mental rotation & spatial reasoning | 5–11 | `05-NOTCH-handoff.md` |
| 6 | **CAIRN** | working memory strategy | 6–12 | `06-CAIRN-handoff.md` |
| 7 | **HUSH** | inhibitory control | 4–11 | `07-HUSH-handoff.md` |
| 8 | **SPAN** | the equals sign & missing terms | 6–12 | `08-SPAN-handoff.md` |
| 9 | **TINT** | proportional reasoning & ratio | 8–13 | `09-TINT-handoff.md` |
| 10 | **GAUGE** | decimal magnitude & place value | 9–13 | `10-GAUGE-handoff.md` |

Each handoff has a matching design spec (`<NAME>-design-spec.md`) carrying the full research rationale. **The handoff is what you build from. The spec is what you consult when you want to know why an invariant exists before you're tempted to break it.**

---

## 2. Recommended build order

Not the numbered order. This sequence front-loads the highest value and the widest shared foundations.

```
1.  CORE                 ← blocks everything
2.  SPAN                 ← cheapest build, widest gap between damage and fix
3.  YONDER               ← builds numberline + adapt.classify, both reused
4.  CREASE               ← consumes numberline; fraction flagship
5.  BRIM                 ← consumes CREASE's FRACTION_BANK
6.  GLIMPSE              ← builds schedule hardening, reused by CAIRN and HUSH
7.  HUSH                 ← consumes schedule; highest-evidence EF game
8.  NOTCH                ← self-contained; the no-numerals door-in
9.  TINT                 ← convergence point for CREASE/YONDER/NOTCH
10. GAUGE                ← consumes numberline + classify; ship AFTER CREASE/BRIM (§5)
11. CAIRN                ← weakest evidence base; build last or not at all (§6)
```

**Why SPAN second:** it's the lightest engineering in the catalog (static geometry, one animation at a time) and it addresses a failure where *all 145 sixth graders tested* gave a wrong answer. Best value per hour of build time in the whole set.

---

## 3. Dependency map

```
CORE
├── numberline ──┬── YONDER ──── GAUGE (adds recursive subdivide)
│                ├── CREASE ──── BRIM (shares FRACTION_BANK)
│                └── TINT (continuous mode only)
├── schedule ────┬── GLIMPSE
│                ├── CAIRN
│                └── HUSH
├── adapt.tier ──── CREASE, YONDER, GLIMPSE(1-3)
├── adapt.staircase ── GLIMPSE(4), HUSH, CAIRN
├── adapt.classify ─┬── YONDER (log vs linear)
│                   └── GAUGE (L / S / A / U)
└── reveal, audio, store, settings, urlconfig, session, collect ── all ten
```

**Shared content assets:**
- `FRACTION_BANK` — authored in CREASE, consumed by BRIM. Tagged by misconception.
- Six-tier sprite pattern — authored in HUSH, reusable anywhere detail should escalate.
- Ratio table component — authored in TINT, potentially useful in SPAN.

---

## 4. Cross-links between games

These are real pedagogical relationships, documented in the specs. If the hub ships, it should route on them.

| From | To | Why |
|---|---|---|
| **NOTCH** (SCALE) | **YONDER**, **CREASE** | Spatial scaling reaches math achievement through proportional reasoning → number line estimation → fraction number line estimation. A child stuck on fraction placement may be stuck on map scaling, one level down. |
| **NOTCH** (TURN) | **SPAN** | Mental rotation reaches math achievement via missing-term problems. |
| **TINT** | **CREASE**, **YONDER** | Proportional reasoning is the middle link in that same chain. |
| **GAUGE** | **HUSH** | Inhibitory control is implicated in overcoming decimal comparison errors. A child who knows the rule and fails under speed may need HUSH more than GAUGE. **The only math→EF route in the catalog.** |
| **GLIMPSE** (FRAME) | **SPAN** | Complement-to-ten is the substrate for missing-term fluency. |
| **YONDER** | **CREASE** | Whole-number line estimation precedes fraction number line estimation developmentally. |

---

## 5. Sequencing warning — read before shipping GAUGE

**Our own fraction games may create the misconception GAUGE treats.**

GAUGE's "shorter is larger" error — believing 0.3 > 0.496 because more decimal places means smaller pieces — is interpreted in the literature as an **intrusion of fraction knowledge**. It's the one misconception in the catalog that is plausibly *iatrogenic*: a side effect of learning fractions well.

Practical consequences:

1. **Ship CREASE and BRIM before GAUGE**, not alongside.
2. **The hub should not recommend GAUGE to a child currently working through CREASE or BRIM.**
3. If we ever measure anything, this is the relationship to watch.

This is not a reason to avoid teaching fractions. It's a reason to sequence deliberately rather than shipping independently and hoping.

---

## 6. The honest-claims register

Three games in this catalog rest on weaker evidence than the others. The specs say so in writing, and so should any public-facing copy. This register exists so nobody downstream — including us — accidentally overclaims.

| Game | Status | What must never be claimed |
|---|---|---|
| **CAIRN** | **Weakest.** Working memory training shows near transfer only; no convincing far transfer to arithmetic, reading, or nonverbal ability against treated controls. Strategy instruction (chunking, rehearsal) is the part that survives. | Any academic or intelligence gain. Marketed as a memory-*strategy* game. **Build last, or reallocate the slot.** |
| **GLIMPSE** Mode 4 | ANS acuity measurement is compromised by visual stimulus confounds; training transfer is contested. Modes 1–3 and 5 (subitizing) rest on solid ground. | That approximate-number training improves math. **Mode 4 ships only if the decorrelation tests pass. Modes 1/2/3/5 are a complete product without it.** |
| **HUSH** | Good provenance — the mechanic is IES-funded and validated. But gains demonstrated are *in-game*. | General, real-world inhibitory control. The physical SIMON mode is where the strongest evidence sits. |

Everything else — CREASE, BRIM, YONDER, NOTCH, SPAN, TINT, GAUGE — rests on well-established findings about misconceptions and instruction, not on contested training-transfer claims.

---

## 7. Standalone micro-tools

Four games contain a single mode that is arguably a better standalone free product than the game around it. Each is small, each fills a genuine market gap, and each is a natural funnel into the full catalog.

| Tool | From | What it is | Extra cost |
|---|---|---|---|
| **The equals-sign screener** | SPAN Mode 1 | 10 items, 3 minutes, whole class, no login | ~80 lines on top of SPAN |
| **Simon Says** | HUSH Mode 5 | Camera-free, mic-free, offline, any phone | Nearly free; it's the cheapest mode |
| **Not Everything Scales** | TINT Mode 4 | One idea, 90 seconds, absent from the market | Needs TINT's renderer |
| **The decimal screener** | GAUGE Mode 1 + classify | Names the misconception per student | ~1 screen on top of GAUGE |

Four of these is a product line, not a coincidence. Worth a deliberate decision about whether they get their own URLs.

---

## 8. The teacher pitch, per game

Each of these is a single item a teacher can try on their own class in under a minute and immediately see the problem exists in their room. That demo *is* the marketing.

- **SPAN** — *Give your class `8 + 4 = __ + 5`.*
- **GAUGE** — *Ask which is bigger: 0.3 or 0.125. Then 0.3 or 0.496. Watch who gets one right and one wrong.*
- **TINT** — *Ask how long four cloths take to dry if one takes two hours.*
- **BRIM** — *Ask which is bigger, 1/3 or 1/8.*
- **CREASE** — *Ask them to put 3/4 on a line with no marks on it.*
- **YONDER** — *Ask a second grader to put 150 on a line from 0 to 1000.*

---

## 9. Shared positioning

Every game's landing copy says the same four things, because they're the whole distribution strategy:

1. **Free.** No trial, no upsell, no premium tier.
2. **No account.** No email, no name, nothing to set up.
3. **Nothing leaves the device.** No analytics, no third-party scripts, no network after first load.
4. **Works on a school Chromebook, offline.**

That fourth one matters more than it sounds. Chromebooks dominate classrooms, and for many children the school Chromebook is the only computer they have — if it doesn't run in Chrome behind a district content filter, it doesn't exist for them.

The competitive field is login-walled (iKnowIt), ad-supported with an ad-free upsell (Math Playground, Mr. Nussbaum), trial-then-paid (Frax), or paid outright (Teachley). Nobody occupies free + no-login + offline + Chromebook-native. That gap is the entire business case.

---

## 10. What is not specced

Be honest about the edges of this work when planning:

- **Difficulty curves are seeded from published error rates, not from observed play.** Every tolerance band and tier table will need tuning against real children.
- **Collectibles are untested as retention mechanisms.** They're thematically apt and completely unvalidated.
- **Ten first sessions are specced; zero thirtieth sessions are.** Retention past the novelty window is unaddressed across the catalog.
- **The hub is sketched, not designed.** Cross-links, age banding, and shared save data are all open.

The fastest way to close the first three is to put one game in front of one child for ten minutes. Most of what that reveals will transfer to all ten at once, because they share a reveal system, an adaptive model, and a feel.
