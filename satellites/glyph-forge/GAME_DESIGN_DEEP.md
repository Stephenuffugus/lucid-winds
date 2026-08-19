# Glyph Forge — Deep Systems Design Bible

Synthesis of a 6-lane research deep-dive (roguelite combo engines, RPG build-identity,
Neon-Abyss progressive reveal, MTG/TCG combo theory, international/award-winning
standouts, and a codebase architecture pass). This is the plan to take Glyph Forge
from "a damage calculator" to "a build-craft RPG that floors players with its depth."

The whole genre's award winners (Balatro, Inscryption, Slay the Spire, Library of
Ruina, Cobalt Core, Shogun Showdown) derive depth from the **same four moves**.
We will make all four.

---

## The Core Problem (what every agent independently flagged)

Glyph Forge has *combinatorial surface* (9 elements × 7 shapes × fusion) but:

1. **One depth axis.** Synergy just multiplies one damage number, flatly. No
   additive-vs-multiplicative tension, so there is no "engine you build then
   detonate" — the genre's central pleasure.
2. **No commitment.** Every run draws the same undifferentiated pool. Fluency
   rewards *killing*, not *focusing*. There is no build identity to sculpt.
3. **No reveal.** Encounter 13 plays identically to encounter 1. Nothing "opens
   up" mid-run. The owner's Neon-Abyss reference is the missing spine.
4. **Depth players can't see is wasted.** No signposting, so even existing
   combos feel like luck, not authorship.

---

## PILLAR 1 — The Two-Track Engine (Balatro's lesson; highest leverage)

**Replace flat "synergy × damage" with a sequential, order-dependent pipeline.**

Every fused spell resolves its 3 slots **left → right (I → II → III)** through
three explicit tracks the codex teaches:

```
POWER  (additive)   base = Σ (rune.basePower + add)        ← Earth/Order, big-base runes
MULT   (additive)   mult = 1 + Σ synergy & effect bonuses  ← same-element/shape, most effects
XMULT  (multiplicative) xmult ×= …                          ← scarce Void/Chaos payoff runes
damage = floor( POWER × MULT × XMULT × fluency )
```

- **Slot order matters.** A rune that does "XMULT ×1.5 if MULT ≥ 8" is worthless
  in slot I and game-breaking in slot III. Arrangement becomes the core skill
  expression (Balatro joker order; Vampire Crawlers' ascending chain).
- **Same-element / same-shape grant XMULT, not flat bonuses** — so focus scales
  *exponentially*, which is what creates build identity and the absurd ceiling.
- **XMULT runes are a scarce rarity** and scale off the spell's *built-up state*
  (`xmult ×= 1 + base/50`) so they are useless alone, nuclear on a built engine
  (Monster Train Multistrike). The big combo *feels earned*.

**Apex mechanic — recursive bounded retrigger.** A retrigger rune re-runs the
*entire* fused effect chain (its value = everything else combined, recursively).
Bound it so it's exponential-but-convergent: each recursion's contribution
×0.8, depth ≤ 3. This is the cleanest "1000s of damage from 3 runes" lever and
the euphoric peak — gated, not default.

This single pillar converts a flat number into a combinatorial space. Everything
else compounds off it.

---

## PILLAR 2 — The Element Pie (MTG color pie; build identity through constraint)

Each of the 9 elements gets a **mechanical lane it owns** and an **anti-lane it
is forbidden from** — expressed as a one-line "victory through X" thesis. This is
what makes "a Fire build" actually *mean* something. Restriction forges identity
faster and cheaper than bonuses.

| Element | Thesis | Owns | Forbidden |
|---|---|---|---|
| **Fire** | victory through tempo | high base, `repeats`, burn DoT | cannot write heal/defense |
| **Water** | victory through scaling | `mult`/`add` that grow over the run | weak burst |
| **Earth** | victory through persistence | huge flat base, carryover | lowest XMULT access |
| **Air** | victory through reach | chains, multi-hit, extra draw | poor single-target |
| **Void** | victory through sacrifice | top-tier XMULT, pay HP/runes | no safe lines |
| **Light** | victory through consistency | tutoring/filtering (find combos) | low ceiling |
| **Shadow** | victory through disruption | enemy debuff, lifesteal | low raw output |
| **Order** | victory through symmetry | pays off uniform spells | collapses if mixed |
| **Chaos** | victory through variance | coin-flip XMULT swings, retrigger | bad expected value |

These are *enforced in `effect()` design*, not flavor text (a Fire rune literally
has no branch that writes `heal`). The 7 **shapes** become the second build axis:
shape determines **slot-adjacency reach** (Backpack Hero / Luck be a Landlord) —
e.g. a "Chain" shape projects its bonus to both neighbor slots; a "Bolt" only to
the next. Mono-shape becomes a real strategy, not a coincidence.

---

## PILLAR 3 — Ability-Words & the Combo Grammar (MTG; the massive combo graph)

Tag every rune with **roles** (`enabler` → `engine` → `payoff` → `scaler`) and a
small dictionary of **ability-words** (named keywords printed on runes that bundle
a trigger with payoffs scattered across the 9×7 grid):

- **Attunement** — "for each same-element rune in this spell, +X" (devotion).
- **Cascade** — "if this is the 2nd+ rune in the combo, ×1.5 mult" (prowess).
- **Geometry** — "trigger whenever a shape repeats" (the shape build-around).
- **Sediment** — "if 4+ runes in discard, this gains effect" (self-mill archetype).
- **Overflow** — "first time MULT exceeds 10, retrigger" (the ramp payoff).

A combo is now legible and *assemblable*: hold an `enabler`, hunt a `payoff`.
N enablers × M engines × P payoffs = a huge discoverable space from few runes.
The codex grows from 14 hand-authored combos to a structural graph (~40+) where
`match()` reads tags, not brittle id lists. **Lenticular runes**: every common
has a plain effect *and* a hidden tag — beginners see filler, experts see an
enabler. That gap is the "oh god it's deep" moment.

---

## PILLAR 4 — Build Identity: Sigil + Curated Pool + Champion Rune

The owner's "sculpt your character, focus on certain spells/abilities":

- **Run-start Sigil (StS relic × Library of Ruina constraint).** Choose one. It
  **blesses AND forbids**: *Emberheart — Fire runes +3 base & gain Cascade;
  Water/Light runes cannot be fused.* Subtraction creates focus instantly for
  near-zero content. This is the single highest-leverage identity lever.
- **Curated draw pool.** Once a Sigil is equipped, the rune-offer pool is
  **weighted toward its element/shape** so the snowball can actually form. (StS
  pools are curated, not uniform — without this, identity is cosmetic.)
- **Champion Rune (Monster Train).** One signature legendary per element, unique
  to that build, that **levels up at encounters 4 / 8 / 12** along a 3-path tree
  where only 2 options show each time and earlier picks are re-offered →
  **irreversible specialization**. The run's narrative spine.
- **Element-pair archetypes feed the codex (Hades Duo Boons).** Mastering
  Fire+Chaos permanently unlocks a passive. The codex stops being a passive log
  and becomes the meta-progression engine that *names and rewards* identity.

---

## PILLAR 5 — The Rune Web: Progressive In-Run Reveal (the owner's Neon Abyss ask)

A per-run **Rune Web** (resets each run). Nodes are runes/effects/combos.

- A node renders **face-down "???"** until its prerequisite is **bound** (fused
  into a cast spell at least once *this run*). Binding a Fire rune reveals the
  Fire branch: higher Fire runes + named Fire combos that were invisible at run
  start. *You cannot see the door until you open the one before it.*
- **Forward-looking codex + Prophecy steering (Hades Codex).** A combo shows as
  a **silhouette** ("Element + Shape → ??? deals 3× and chains") the moment you
  hold *one* component. Pick one **Prophecy** at run start; offers that advance
  it get a visible icon — steerable RNG so reveals feel *earned, not random*
  (the Peglin failure mode we explicitly avoid).
- **Hidden transmutation families (Isaac Guppy).** Secret 3-rune triads that,
  when all bound in one run, fire a run-rewiring transmutation. Covert layer for
  veterans to keep discovering after the visible web is mastered.
- **Silent breakpoints (Risk of Rain 2).** 3rd same-element rune flips additive→
  multiplicative; the tooltip only reveals the true curve after you first cross
  it. Nearly free numeric depth on top of the structural reveal.

---

## PILLAR 6 — Relics, Risk, and the Counter-Boss (gating the depth)

- **Relics/Artifacts** — passive modifiers injected as hooks into the resolve
  pipeline (`ctx.relicHooks`). The backbone that archetypes and the Web grant.
- **Corruption track (Astrea, optional).** High-power runes deal recoil/curse to
  the caster but unlock a slot's "overcharged" mode — a glass-cannon identity and
  natural counter-pressure to the fluency ramp.
- **Gating infinites (StS Time Eater).** Loops are *allowed* but walled by:
  (a) cost — loop enablers need pool-thinning or scarce Mythic runes;
  (b) soft cap — retrigger decay ×0.8, depth ≤ 3 (exponential, convergent);
  (c) a **counter-boss** — "spells resolving >N times deal 0" / "removes one
  synergy axis." Forces a second viable build → more identity, not less.
- **In-run rune curation (Vault of the Void).** Between encounters: *Banish* a
  rune (thin the pool toward a deterministic combo) or *Attune* (lock an
  element). This is the missing meta-progression AND the infinite cost-gate, in
  one mechanic.

---

## What this becomes

A run is now: pick a **Sigil** (identity thesis) → draft into a **curated pool** →
fuse runes through an **ordered add/mult/xmult engine** where slot order is skill
→ **bind** runes to crack open the **Rune Web** and reveal deeper runes/combos →
chase a **Prophecy** and your **Champion Rune** upgrades → assemble an
**enabler→engine→payoff** line that detonates for absurd, *earned* numbers →
beat a **counter-boss** that punishes the dominant build → the **codex** records
your mastery and permanently unlocks more identities. Twelve-minute runs, but the
system keeps unfolding for 100 of them.

---

## Phased Rollout (each phase independently shippable & test-green)

From the codebase architecture pass. Discipline every phase: `node test.js` +
`node sim-run.js` stay green, BALANCE.md is the regression baseline, save key
(`glyph-forge-v1`) never changes (additive schema only), stay in ONE `<script>`
tag (the test harness regex depends on it), and relic/tree RNG uses *offset*
seeds so daily-sigil determinism and the sim win-rate baseline don't drift.

| Phase | Scope | Risk | Ships |
|---|---|---|---|
| **1. Tags + Combo Graph** ✅ SHIPPED | `tags[]` on all 32 runes; 22 tag-based `NAMED_COMBOS` appended (14→36). Math byte-identical. | None | Codex tripled; pure discovery depth |
| **2. The Two-Track Engine** ✅ SHIPPED | `ctx.xmult` + ordered resolution; exponential element/shape → XMULT; Crescendo/Culminate order-dependent XMULT runes. BALANCE.md re-baselined (37%→41%). | High (core) | The depth ceiling; slot order = skill |
| **3. Relics** ✅ SHIPPED | `RELICS` + `applyDepth` pre/post hooks, `run.relics`, relic-offer modal at enc 3/6/10 (offset seed). Inert when empty. | Med | Relics drop & reshape spells |
| **4. Build Identity** ✅ SHIPPED | Run-start **Sigil** picker (bless+forbid+HP), curated draw pool, Champion leveling at enc 4/8. | Med | Players sculpt a build |
| **5. The Rune Web** ✅ SHIPPED | Bind-to-reveal reward gating, run-start Prophecy (+12 HP on fulfil), hidden transmutation triads, forward-looking codex silhouettes. | Med | The Neon-Abyss spine |
| **6. Meta + Counter-Boss + Determinism** ✅ SHIPPED | Mythic-relic gate behind 1 win; Sovereign dampens mono triples ×0.6; `Date.now()` → deterministic `castCount` (daily reproducible, preview==cast). | Med | Long-tail mastery + robustness |

Phase 1 is free depth and ships immediately. Phase 2 is the keystone — it changes
"what the game is" and re-baselines balance, so it gets its own validation pass.
3–6 each layer on without breaking the prior.

---

## Sources

Full source lists are in the research briefs (Balatro scoring, StS Echo Form,
Monster Train Multistrike/Champion, Library of Ruina Key Pages, Hades Duo/Codex,
Neon Abyss skill pages, MTG color pie/ability-words/lenticular design, Cobalt
Core, Shogun Showdown, Inscryption, Astrea, Backpack Hero, IGF/TGA/BAFTA/GDCA
2022–2025 winners). Retained in the session research record.

---

## Final shipped state (stamp — 2026-05-19)

All 6 pillars shipped and sim-validated, then a content pack landed and was
balance-tuned to a clean verdict:

- **Content:** 36 runes · 48 named fusions · 7 Sigils (bless+forbid) ·
  6 Champions (level mid-run) · 22 relics · 5 hidden transmutations.
- **Balance:** `node sim-run.js` → *"depth systems balanced; determinism
  holds."* All 7 Sigils inside the healthy band (overall 56% optimal-AI);
  every relic Δ **+5..+25**, none dead/overpowered. The 5 content-pack hot
  relics (+31..+35, one at 100%) and the dead Low Lantern (−7.3) were
  sim-flagged and re-costed (fractional XMULT exponents + globalMult tax;
  Low Lantern reworked into a lean-cast archetype). Numbers in `BALANCE.md`.
- **Feel:** synthesised Web Audio (`GFAudio`, no asset files, mute toggle,
  Node-safe) + a juice pass — damage-pop magnitude tiers & count-up, XMULT
  screen flash/shake, chip-damage HP bar, synergy throb, modal entrance,
  tap-tooltips (fixed a real touch bug: `title=` never fires on mobile),
  full `prefers-reduced-motion` support, 44px tap targets.
- **Ship:** one `index.html`, single `<script>`, PWA, offline, deterministic
  Daily Sigil. Static-host deployable (`tools/pack.sh` → Hostinger/any host)
  or GitHub Pages. Saves additive-only (`glyph-forge-v1` unbroken throughout).

Design debt remaining (non-blocking, see `LAUNCH.md` backlog): Sovereign is
tanky not tricky (phase-2 wanted); post-pack Sigil spread is 37%↔67%
optimal-AI (inside the sim's pass band, future tightening possible); no
deck-thinning; art ships in post-launch batches (hot-loads, graceful fallback).
