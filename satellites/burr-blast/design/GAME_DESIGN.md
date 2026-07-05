# BURR BLAST — Game Design (v2: the botanical roguelite slingshot)
_Locked direction (Stephen, Jul 05): **campaign spine + roguelite Expedition endgame**,
with **all three build pillars layered** (Nutrients + Seed Satchel + Companions)._
_This is the build roadmap. We take our time; ship in verified, playable slices._

## The fantasy
You are **Bramble**, keeper of the patch. You don't just fling seeds — you **cultivate
the arsenal** that brings the pests' forts down. Balance your nutrients, build your seed
satchel, recruit companions, and every choice compounds. It *grows*.

---

## Two modes

### 1. The Campaign (the spine)
The authored worlds (now 4, growing). Teaches the mechanics and **permanently unlocks**
seeds, companions and nutrient capacity. Flow per level:
`Loadout screen → play the fort → stars → Fertilizer/Sap → spend in Almanac/Grove`.
Curated difficulty curve; the place a new player learns each system one at a time.

### 2. Expeditions (the roguelite endgame)
A branching climb up a procedurally-assembled garden (Slay-the-Spire shape). At each
node you **draft** a reward and push on; the run ends when your **Vigor** runs out.
Meta-unlocks persist and feed back into both modes. This is the deep, replayable heart.

- **Node types:** Fort (normal) · Elite Fort (harder, better loot) · Shop (spend Sap) ·
  Cache (free seed/companion pick) · Event (a choice with a twist) · Boss (tier finale).
- **Run resource — Vigor:** start with 3 wilts; failing a fort costs a wilt; 0 = run ends.
  (Alt considered: cumulative-score target per tier. Vigor is simpler + tenser.)
- **Draft:** after each fort, pick 1 of 3 — a new seed, a companion, a nutrient boon, or a
  **Relic**.
- **Relics** (run-long passives): "Every 3rd shot is free" · "Glass shatters on any touch" ·
  "First seed each fort is a heavy acorn" · "Blastpods chain twice as far" · "+1 Vigor but
  forts have +1 pest". ~30 to start.

---

## The three build pillars (layered)

All three funnel into ONE computed stat block per launched seed:
`computeSeedStats(type, loadout)` → { radius, density, restitution, friction, abilityParams,
extras }. BASE = the AMMO table; Nutrients + Companions + Grafts + Relics apply on top.
This keeps physics clean and every build legible.

### Pillar 1 — Nutrients (N-P-K): the resource
A limited **Nutrient budget** (points) you allocate before each fort. Three tracks:
- **Nitrogen (N) → power & mass.** +density/mass → seeds hit harder, break tougher blocks,
  carry through. (Feeds the physics damage: closingSpeed*massFactor.)
- **Phosphorus (P) → ability potency.** Bigger splits (+fragments), bigger blasts (+radius),
  bigger spore cloud, stronger boomerang curve, harder slam.
- **Potassium (K) → utility.** +1 ammo, longer/steadier aim guide, wind & aim assist,
  +coins/Sap, small Vigor cushion.
Budget grows with progression (campaign) or draft (Expedition). Re-balancing per fort **is**
the strategy: stone fort → dump N; blastpod fort → P; a nasty fort → K for the extra shot.
UI: a 3-way point-buy with live preview of what each seed becomes.

### Pillar 2 — The Satchel (seed deck)
Your deck of **seed-cards**. Campaign levels give a fixed base loadout + slots you fill from
your satchel; Expeditions are fully deck-driven (your drafted seeds are your ammo).
- **Roster (start 6 → grow to ~18):** burr · split · acorn · puffball · thornpod · boomerang
  → then Ironacorn, Mudball (sticky), Frostberry (freezes/embrittles), Seedbomb (cluster),
  Vinewhip (grapple/yank a block), Sporepod (area denial), Sunflower (charge beam),
  Burrbramble (splits into stickies), Gourd (heavy roller), Puffcap (double-jump lob)...
- **Grafting (upgrade):** each seed has a 2–3 step upgrade branch. e.g.
  Split: 3→5 fragments → fragments leave stickies. Acorn: +mass → slam shockwave → burrows.
  Thornpod: bigger blast → cluster → napalm patch. Spend **Fertilizer**.
- **Synergies:** Mudball then Thornpod = a stuck bomb. Frostberry then anything = shatter.
  Vinewhip a support then let it fall. Surface these in the Almanac.

### Pillar 3 — Companions (the team)
Equip **1–3** companions (slots unlock via progression). Each is a passive modifier drawn
from Lucid Winds' 85-strong roster (pick ~24 with slingshot-relevant perks):
- **Bee** → splits fan wider / +1 fragment.  **Baby Mammoth** → acorns gain mass + slam.
- **Worm** → blastpods chain +radius.  **Beholder** → reveal fort structural weak points.
- **Koi** → seeds skip once off ground/water.  **Garden Spider** → a web mid-air re-aim.
- **Raccoon** → +Sap per fort.  **Scarab** → first break each fort drops bonus Fertilizer.
- **Pangolin** → seeds resist wind.  **Cicada** → louder = a small shot each 4th launch.
Companions **bond-level** with use (1→3), each tier a stronger perk. Ties straight into the
flagship's companion lore + gives huge build variety.

---

## Progression & economy
- **Coins** (existing) → cosmetic skin shop only. Unchanged.
- **Fertilizer** → the *build* currency: graft seeds, unlock companions, expand Nutrient cap.
  Earned from stars (first clears) + fort bonuses.
- **Sap** → the Expedition spend currency (shops, in-run buys). Earned inside runs.
- **Sunbeams** (existing bridge) → vault earn to the flagship, unchanged, still newStars-gated.
- **The Almanac + The Grove** — two screens where you spend Fertilizer: the **Seed Almanac**
  (unlock/graft seeds, see synergies) and the **Companion Grove** (unlock/bond companions).
  This is the "it really builds" surface players return to.

## The loadout screen (pre-fort)
Fort **intel** up top (biome, material mix preview, pest count, hazards). Three tabs:
**Satchel** (pick + order seeds) · **Companions** (equip up to slots) · **Nutrients**
(allocate N-P-K with a live "your acorn now: …" preview). Confirm → play.

---

## Physics/damage foundation (must be excellent first)
Filled from the physics audit (wf physics-audit). Headline targets:
- **Crushing debris:** destroyed large blocks (beams) should leave a brief PHYSICAL chunk so
  a collapsing roof can actually crush an enclosed pest (current gap — glass/wood vanish).
- **Damage states:** blocks show progressive cracks before breaking (readability + weight).
- **Weighty feel:** tuned restitution/friction, impact zoom-punch, layered SFX, better debris.
- **Robustness:** no tunneling at any dt, stable tall stacks, no resting jitter.
- Nutrients (N=mass) and companions must funnel through the same damage math cleanly.

---

## Build order (each a verified, playable, committed slice)
1. **Physics + damage polish** (from the audit) — the foundation.
2. **Seed-stat pipeline** `computeSeedStats(type, loadout)` — refactor launch to use it.
3. **Nutrient system + loadout screen** wired into the campaign — first visible pillar.
4. **Fertilizer economy + Seed Almanac** (unlock + graft the 6 seeds; +3 new seeds).
5. **Companions (Grove)** — equip + bond; ~10 to start.
6. **Expedition mode** — branching map, drafts, Vigor, relics, a boss.
7. **Content pass** — expand seeds to ~18, companions to ~24, relics to ~30, more worlds.

## Art (Stephen makes it — added to ASSET_LIST as we build each slice)
seed-card faces (per seed) · companion portraits · N-P-K nutrient icons · loadout/almanac/
grove UI frames · Expedition map nodes + relic icons · new pest types · biome backdrops.

## Guardrails
- Every slice stays **fully playable** and canvas-drawn (art optional, onerror fallback).
- Sunbeam earn stays anti-farm + 30/day. Build currencies (Fertilizer/Sap) are LOCAL.
- ES5, single file, headless-verified each slice (solvability, no self-destruct, no errors).
- Keep the core 3-shot slingshot instantly fun for a cold player; the build depth reveals
  gradually (campaign teaches, Expedition rewards mastery).
