# HANDOFF — STRATA (Fossil Dig)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, portrait dig / landscape museum.
**Deploy target:** lucidwinds.com/satellites/strata
**Session goal:** Scratch-away excavation with 3 tools + procedural skeleton generator + field journal naming + one museum hall + share-a-specimen links.

---

## 1. Concept
A cliff face of layered sediment. Brush away dust, chisel through stone, and something emerges — a rib, then a claw, then a skull **belonging to a creature that has never existed before and will never be generated again.** Every skeleton is procedural: its proportions, its era, its plates and spikes, its scientific name. Extract it carefully (chisel too hard and bones crack), assemble it on the mounting armature, name it, and hang it in your museum — a hall of one-of-a-kind species only you have ever seen.

**Tone:** field-journal romance — canvas tents, tan paper, careful hands. The thrill is that *the earth is inventing animals for you.*

## 2. Market research summary (Sep 2026)
- **Physical dig kits** (Nat Geo, Discovery, endless Amazon variants) are a giant evergreen toy category — chisel/brush/magnifier tactility + "every brick is different" mystery is the proven core. We are digitizing a toy-aisle staple.
- **Fossil Quest** (itch, 2025): dig sites + careful cleaning + museum assembly + curation; charming, warmly received ("can't wait to add more dinosaurs to my collection"); commenters describe wanting exactly this genre (PowerWash-style cleanup + museum hub). Uses **fixed real dinosaurs** — collection is finite and identical for everyone.
- Mobile "dig idle" tap games: shovelware economy loops, no craft.
- **Our wedge:** (1) procedural species — infinite, personal, tradable; (2) honest excavation risk (fragile bones, tool choice matters); (3) instant single-file mobile; (4) light real-paleontology framing (strata = eras) for the studio's education catalog.

**Positioning line:** "Every fossil is the only one."

## 3. Core loop
1. **Survey:** cliff face with visible strata bands (each band = a generated era). Faint resistivity "scan" shimmer hints where something big sleeps (ping mechanic — one free scan per site, FATHOM cousin).
2. **Dig:** three tools, thumb-switchable:
   - **Pick:** clears rock fast; cracks any bone it touches (never use near the skeleton — or gamble).
   - **Chisel:** medium; safe unless you *linger* on a bone (pressure meter).
   - **Brush:** slow, silky, 100% safe; the dust particles + bristle sound are the ASMR payload.
3. **Reveal:** bones emerge in place, articulated as buried — half the joy is reading the creature before it's free ("that neck keeps GOING").
4. **Extract:** trace each freed bone with a finger (plaster-jacket gesture); cracked bones extract as "repaired" (visible glued seams — honest scars, museum-authentic, slight value/condition note).
5. **Mount & name:** bones snap onto a generated armature silhouette; missing/cracked ones show as bronze infill (real museums do this). Name it (or accept the generated binomial). Journal entry writes itself.
6. **Curate:** hang it in the museum hall; visitors (tiny silhouettes) wander in idle mode and cluster around favorites.

## 4. Procedural skeleton generator (the soul)
- **Parametric grammar:** spine spline (length, curve, whip-tail vs club-tail), skull archetype (long-jaw / beak / crest / dome), neck vertebra count, limb plan (biped/quadruped/flippers/wings), proportions, ornament pass (plates, spines, frill, sail — probability by era), size class (mouse → bus).
- Bones derive from the parameters (vertebra chain, ribs from spine, limb bones, digits) → placed into sediment with taphonomic scatter (slight disarticulation, missing probability — small realism, big charm).
- **Era bands** (generated names like "The Emberwash" alongside real-flavored epochs) bias the grammar: deep strata = stranger, older body plans; shallow = mammal-ish. Deeper digging = weirder wonders (natural progression, no XP needed).
- **Identity generator** (ASTERISM myth-grammar pattern, offline, seeded): binomial name (latinate syllable grammar — *Vexicanthus pennyi* if you name it after someone), diet, era, one-line natural history ("Waded slow rivers; sang through its crest at dusk"). Real-name hook: name a species after anyone — the gift/dedication move.
- Seeded end-to-end: a specimen's seed regenerates it exactly → **share-a-specimen links** (house pattern): recipient receives it as a crated loan, unpacks it, mounts it in *their* museum with your museum credited on the placard. Fossil trading with zero backend.

## 5. Excavation feel (the craft)
- Sediment = layered density field on a grid; tools subtract with different radii/rates; bone voxels flagged fragile. Dust particles pour and settle realistically-enough; brush strokes leave clean swept arcs.
- Sound: pick *tak*, chisel *tik-tik*, brush *shhh* (synthesized, granular); a bone's first *clink* under the chisel is the heartbeat moment — distinct sound + haptic + tiny freeze-frame.
- Crack rules are fair and legible: warning shiver + tone before damage; cracks are localized, never lose the whole find.
- Sites: small (one creature + scatter shells/plants as common finds) to large (two overlapping skeletons — the dramatic dig). New site generated on demand; deep sites unlock by specimens mounted.

## 6. Museum
- Landscape hall: mounted skeletons on plinths with brass placards (name, era, discoverer, condition); rearrange freely; wings unlock (Deep Time wing, Sea Hall, Aviary) as collection grows.
- Idle visitors + a gift-shop poster: export any specimen as a field-journal PNG plate (sketch-style render + name + history — ASTERISM poster pattern, fridge marketing).
- The journal doubles as collection index with dig-site memories.

## 7. Toolchain
- **Claude Code:** build. Skeleton grammar + placement headless first (render 50 random species as silhouettes, eyeball variety before any dig code).
- **Gemini Pro:** silhouette variety review sheets (generate style refs for skull/ornament archetypes to encode); sediment palette per era.
- **ChatGPT Pro:** natural-history line grammar expansion from hand-written anchors; latinate name-grammar syllable banks; era name lists.
- **Grok basic:** name check (STRATA), social copy ("the earth invents animals for you" thread).
- **Meshy premium:** mounted-skeleton-in-hall hero render for icon/card art.

## 8. Architecture & build order
- Canvas 2D; sediment grid (~200×300 cells) as typed arrays; skeleton as bone list (shape polys + fragile flags) rasterized into the grid; museum scene = simple placed sprites; seeds everywhere (house law); localStorage + export string; PWA inline.
1. Skeleton grammar headless + 50-species variety sheet. **Gate: if 50 randoms don't include 5 you'd screenshot, deepen the grammar before proceeding.**
2. Sediment + brush tool + dust + reveal. **Feel-gate: brushing a rib clean must be self-justifying ASMR.**
3. Chisel/pick + fragility + crack/repair + extraction gesture.
4. Mount/armature + naming + identity generator + journal.
5. Museum hall + placards + poster export.
6. Era bands + deep sites + scan shimmer + share-a-specimen links + PWA wrapper.

## 9. Stretch
- Amber inclusions (tiny frozen scenes), trace fossils (footprint trackways that *imply* a creature you then hunt deeper).
- Loan requests: a generated rival museum asks to borrow your best piece (temporary placard swap — pure flavor).
- Classroom: real strata/superposition principle one-pager (fourth education-door title).
- Penny co-curated wing; crinoid stone crossover already planted in GERPLUNK.

## 10. Open questions
- Name: STRATA vs BONEYARD vs THE DIG. (STRATA — elegant, expandable.)
- Bronze-infill missing bones: always allowed, or require a minimum % excavated to mount? (Recommend: 60% minimum — protects the "careful work" values without punishing.)
- Idle visitors in slice or v1.1? (v1.1 fine — the museum reads alive with placards alone.)
