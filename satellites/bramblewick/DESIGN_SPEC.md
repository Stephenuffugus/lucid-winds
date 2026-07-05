<!-- Bramblewick design spec — synthesized from design sprint wf_b9d26785-985, 2026-07-05. Proposed name; Director may rename. -->

# BRAMBLEWICK — DESIGN SPEC

**Wake the garden. Its chemistry does the killing.**

Slug `bramblewick` · localStorage `lw_bramblewick_v1` · dev flag `?bramblewicktest=1` · embed flag `?embed=1`
Portal card: `{ nm:"Bramblewick", ds:"Paint the pests, chain the reactions, wake the menagerie. A botanical survivor-like.", url:"/satellites/bramblewick/", ic:"🌿", thumb:"/portal-assets/thumbs/bramblewick.jpg" }`

---

## 0. WHY THIS DESIGN (the synthesis decision)

Four sprint designs were judged. All scored 44-46. This spec picks the **strongest generative engine as the spine and grafts the best-scoring layers of the others onto it**, because the four hooks are genuinely complementary rather than competing.

- **SPINE = Reaction Alchemy (Nightbloom, 46).** The inverted damage model plus a 21-cell pairwise reaction matrix times four orthogonal levers is the single best synergy generator in the batch: thousands of felt build states from ~21 authored reactions + 4 lever rules. Everything else hangs off this.
- **GRAFT 1 = the Companion Menagerie (Bramblewick, brand-fit 9).** The 85 real companions draft in as **familiars**. Their real KEYWORDS become the reaction-multiplier lanes, and their real FAMILIES hit the parent game's tier two / tier three rituals (`_LW_hasFamilyRitual`). This is the best brand integration available and it deepens an existing designed asset instead of inventing throwaway content. It also supplies the game's name and heart.
- **GRAFT 2 = the Evolution Web (re-emission tag graph).** Weapons do not have one fixed evolution. They graft **conditionally** on lane pressure + a mutable state gate + your plant's season, and each graft **re-emits new tags** that unlock the next. This is the run-over-run mapping meta (the Codex) and it imports Dead Cells risk/reward via playstyle-gated grafts (deliberately drop to Wilting HP to open the glass-cannon branch).
- **GRAFT 3 (light) = Living Architecture, visual only.** Your plant **visibly grows organs** so your silhouette reads as your build. We **deliberately CUT** the full node-graph placement puzzle and the sway-is-aiming mechanic. Reason: both are the fiddliest inputs on a phone (that design's own Auto-Graft toggle conceded node-picking may not survive a thumb) and they fight the one-thumb + reaction-reading cognitive load that the spine already demands. We keep the fantasy ("your plant IS your gun") as cosmetic feedback; we drop the mechanic that endangers the build.

**How the layers multiply (the whole pitch in one line):**
`statuses -> reactions (base kill) -> status levers (reaction shape) -> keyword lanes (reaction magnitude) -> family tiers (ceiling) -> conditional grafts + season + HP gates (identity path)`
Each layer rewrites the output of the one below it without per-combo authoring. That is the emergent depth, and it is coherent.

---

## 1. FANTASY & CORE LOOP

You are a rooted **nightbloom** in a walled midnight greenhouse. Garden pests swarm from the top. Your weapons auto fire on their own timers, coating pests with **statuses** rather than damage. You read the field, kite loose swarms into a ball with Nectar, and trigger a reaction so one shot ripples into a cascade of scorch, rot, shatter and plague.

One thumb drags a floating joystick to move. Kills drop **Loam motes** you sweep up by moving over them; motes fill the **Bloom Meter**. When it caps the run softly slows and three cards rise: a **weapon**, a **companion**, a **passive**, or a gold **graft**. Elites drop **Seeds** (in-run reroll fuel). Every ~2.5 min an elite drops a guaranteed graft. Bosses at the mid and end. After a boss the arena opens into a **Grove breather** (no enemies, drifting Loam, a moment to read your build and take an optional risk pact). A run is **10-13 minutes** across three phases (Dusk, Deep Night, First Light), then optional endless **Overgrowth**.

At all times you are doing exactly one of three things: killing to feed the meter, choosing a card, or reading the **Graft Compass** to decide what to draft so a fusion lands.

---

## 2. THE SYNERGY ENGINE (one rule set, five multiplying layers)

### Layer A — Statuses (7)
Every damage source applies STACKS of exactly one status. A pest carries any number at once, each with its own stack count and decay timer. Four of the seven double as **multiplier levers** (marked).

| Status | Shape glyph (colorblind) | Role | Lever |
|---|---|---|---|
| **Pollen** | gold dot-ring | marks a pest; upgrades the NEXT reaction on it to **Nova** (bigger radius, +1 chain jump, +damage) | **CATALYST** — one source improves all 21 reactions |
| **Spore** | asterisk / starburst | infects; spreads pest to pest over time | **SPREAD** — makes any reaction re-emit onto neighbors |
| **Nectar** | teardrop | lures pests toward the mark, pulling loose swarms into a tight ball | **GEOMETRY** — every AoE overlaps 12 targets not 2 |
| **Frost** | snowflake | chills, slows, stores incoming damage as **brittle** | **SETUP/BURST** — next reaction Shatters the stored value as shrapnel |
| **Thorn** | spike / chevron | stacking physical bleed DoT | raw damage backbone reactions amplify |
| **Sun** | radiating rays | scorch DoT; dries Sap, thaws Frost | gatekeeps some reactions |
| **Sap** | drip | slows and roots in sticky glue | control setup |

Glyphs render as distinct shapes on a badge ring around the pest; **collapse to a small numeral count** past 3 stacks so the field stays legible at 540px. Never color-only.

### Layer B — The Reaction Matrix (21 authored pairwise + triples)
**THE RULE:** when a pest already carrying status A is hit with status B, the order-agnostic reaction {A,B} fires instantly, consumes one stack of each, deals its payload, and often **emits a third status or projectile** so reactions **chain**. C(7,2) = 21 reactions, authored once.

| # | Pair | Name | Payload (and emission) |
|---|---|---|---|
| 1 | Pollen+Spore | **Bloomburst** | large infecting cloud, seeds Spore across everything caught |
| 2 | Pollen+Sap | **Amberglow** | sticky gold pool that roots AND Pollen-marks every pest entering it (mass Nova primer) |
| 3 | Pollen+Nectar | **Goldlure** | the lured ball is entirely Pollen-marked at once (turns a cluster into pre-primed Nova fuel) |
| 4 | Pollen+Thorn | **Barbflash** | Nova thorn burst, doubles current bleed stacks in a radius |
| 5 | Pollen+Sun | **Ignition** | flammable pollen flash detonates for instant AoE burn (fastest crowd deleter) |
| 6 | Pollen+Frost | **Rime Bloom** | pollen crystallizes, shatters into shards that chill neighbors |
| 7 | Spore+Sap | **Rot** | decay melts armor + heavy DoT (answer to shelled pests) |
| 8 | Spore+Nectar | **Plague Swarm** | lured infected ball self-chains; one pest becomes a spore-spewing turncoat briefly |
| 9 | Spore+Thorn | **Cordyceps** | bleed carries spore into the wound, accelerates stacks, bursts thorns on death |
| 10 | Spore+Sun | **Blight Char** | spore field ignites into a scorched, still-infecting haze |
| 11 | Spore+Frost | **Coldrot** | frozen spores shatter into infecting shards that chill |
| 12 | Sap+Nectar | **Honeytrap** | gluey sweet tar pit that permanently roots and lures (arena control anchor) |
| 13 | Sap+Thorn | **Bramble** | rooting thicket holds pests still while heavy bleed ticks (signature) |
| 14 | Sap+Sun | **Resin Boil** | boiling sap cracks armor and applies a lingering burn |
| 15 | Sap+Frost | **Amber Lock** | pest freezes inside resin, fully immobile and brittle, next hit is a shatter crit |
| 16 | Nectar+Thorn | **Bleeding Lure** | the lure point becomes a bleed pool that Thorns anything walking in |
| 17 | Nectar+Sun | **Caramelize** | burning candy zone scorches the ball it lured in |
| 18 | Nectar+Frost | **Sugar Frost** | lured ball flash-frozen, primed for one group Shatter |
| 19 | Thorn+Sun | **Ashthorn** | burning bleed, scorched wound doubles DoT tick |
| 20 | Thorn+Frost | **Frostbite** | bleed ticks frozen in place, detonate all at once on thaw |
| 21 | Sun+Frost | **Thermal Shock** | violent temp swing bursts for big damage, emits a **Steam** puff that behaves as airborne Pollen (catalyzes the next reaction it touches) |

**Shatter** is not a 22nd cell; it is the Frost lever resolving: any burst on a Frost-brittle pest cracks it, dumping stored value as shrapnel carrying the triggering status onward.

**Triples (super reactions, v1 ships 4):** fire when a pest holds 3+ statuses at reaction time AND a Pollen catalyst is present. Top of the mastery curve.
- **Wildbloom Nova** (Pollen+Spore+Sun) — chained detonation leaping across the field
- **Glass Bramble** (Sap+Frost+Thorn) — Shatter throws rooting, bleeding glass shards into the next cluster
- **Plague Tide** (Spore+Nectar+Sap) — a rooted, lured, fully infected pit that never stops spreading until the wave ends
- **Sunforge** (Pollen+Sun+Thorn) — a rolling wall of burning shrapnel

### Layer C — Keyword Lanes (6, from the real companion keywords)
Every companion and passive carries up to two **real Lucid Winds keywords**. They sum loadout-wide into six lanes. Each lane is a stat channel AND a reaction multiplier, so a familiar never just does its trick, it tilts every reaction you already run.

| Lane | Keyword | Stat effect | Reaction effect |
|---|---|---|---|
| **Swift** | Swift | +fire rate, +projectile speed | more statuses/sec = more reactions/sec |
| **Thorned** | Thorned | +direct thorn/contact damage | **universal reaction damage multiplier** |
| **Rooted** | Rooted | +knockback resist, slow aura | **+reaction radius** (widens every AoE/Shatter) |
| **Lush** | Lush | +regen, lifesteal on kill | sustain to stay aggressive |
| **Hardy** | Hardy | +armor, +max HP | survival to let DoT math snowball |
| **Restless** | Restless | +move speed, +pickup radius | faster Loam = earlier drafts = earlier second status |

### Layer D — Family Tiers (the parent game's rituals)
Companions carry their real **family** (pollinators, scatterers, weavers, wayfinders, guardians, conduits, mycelium, listeners). Thresholds mirror the main game:
- **2 same-family = T2 aura** (e.g. Weavers T2: your Sap lingers 30% longer)
- **4 same-family = T3 ritual** copied in spirit from `_LW_hasFamilyRitual` (e.g. Mycelium T3: every kill puffs a Spore; Weavers T3: a global silk that Saps; Listeners T3: auto-mark the densest cluster with Pollen every few seconds; Guardians T3: a thorn ring that reflects contact; Pollinators T3: all Nectar lures pull from farther)

### Layer E — Conditional Grafts + State Gates + Season (the identity path)
This is the Evolution Web. A weapon has **no single fixed evolution**. A graft is a triple: **BASE (weapon at level >= k) + LANE PRESSURE (a lane total >= threshold T) + STATE GATE (a run-state predicate that can flip mid-run)**. The SAME base weapon has several triples pointing at it; which super weapon you get is decided by which pressure and gate are satisfied first, i.e. your draft order and how you are playing. Grafts **consume** their ingredient tags and **re-emit** a new bundle, so fusions chain into second-order grafts. A graph cycle-check and a per-weapon graft cap prevent infinite loops.

**State gates (v1: 4):**
- **Season** — permanent per-run key wired to the real 4-season engine. Your starter plant sets it (Nightshade = Shade/Night lean, Snowdrop = Frost, Sunflower = Sun). Opens whole graft branches, closes others.
- **HP band** — Verdant (>=70%) vs **Wilting** (<30%). Wilting grafts are the glass-cannon branch; you open them by playing near death (Dead Cells risk import).
- **Bloodless** — no hit taken this wave; opens the flawless-play branch.
- **Overgrown** — kill streak over a count; opens the aggressive/berserk branch.

Example (Nettle Lash): high **Sap** lane -> **Bramblewhip** (native Bramble). High **Frost** lane -> **Hoarfrost Flail** (chill + shatter). **Overgrown** -> **Bramble Reaper** (360 spinning cane wall). Three unrelated picks fuse into one behavior none of them describe.

---

## 3. WEAPONS / ORGANS (v1: 10 ship, roster grows to ~14)

Each is a visible organ that grows on your plant when drafted (cosmetic silhouette feedback; no placement puzzle). Each fires ONE status. `evolvesTo` lists the CONDITIONAL grafts.

| Weapon (botanical) | Status | Behavior | Conditional grafts |
|---|---|---|---|
| **Dandelion Puffer** (Taraxacum) | Pollen | drifting seed-parachute cone, the starter catalyst | Sun lane -> **Solar Chaff**; else L5 -> **Stormseed** (screen-wide pollen front) |
| **Nettle Lash** (Urtica dioica) | Thorn | whip arc across the front | Sap -> **Bramblewhip**; Frost -> **Hoarfrost Flail**; Overgrown -> **Bramble Reaper** |
| **Puffball Burst** (Lycoperdon) | Spore | lobbed spore bomb, spreads on its own | Sun -> **Blightcap Bloomburst**; Wilting -> **Cordyceps Hivemind** (low HP feeds a huge cloud) |
| **Sundew Spitter** (Drosera) | Sap | sticky roots + slow | Frost -> **Amber Tomb**; else L5 -> **Tar Pit Sundew** (lingering pools) |
| **Foxglove Volley** (Digitalis) | Nectar | homing lure darts | Bloodless -> **Chalice of Verdance** (radiant ring); else -> **Honeytrap Foxglove** |
| **Sunflower Lance** (Helianthus) | Sun | slow rotating scorch beam | Summer season -> **Solar Corona** (orbiting suns); Frost present -> **Thunderthaw** |
| **Frostfern Fan** (Dryopteris) | Frost | chilling cone that stores brittle | Sap -> **Glacier Amber**; Winter season -> **Everwinter Crown** |
| **Thornvine Orbit** (Rubus) | Thorn | 2-4 orbiting spheres, the bodyguard | Pollen -> **Barbed Halo** (contact Novas); Rooted -> **Strangleweave** |
| **Bloodroot Spike** (Sanguinaria) | Thorn | line of ground spikes, heavy single-target | Bramble present -> **Gallows Root**; else -> **Sanguine Trellis** (bleeding fence) |
| **Witchhazel Snap** (Hamamelis) | Frost | ranged snapping pods | Ember/Sun -> **Thermal Snap**; else -> **Hoarfrost Snap** (delayed group Shatter) |

**Grows to v1.1:** Ragweed Censer (passive Pollen aura -> Goldenrod Thurible), Milkweed Mortar (Nectar+Sap Honeytrap lobs -> Monarch Mortar with butterfly familiars), Foxfire Bloom (Light/Shade orbs).

---

## 4. COMPANIONS AS FAMILIARS (v1: 24 wired behind the Root Network; roster is all 85)

Drafted companions orbit your plant, apply a status, fill keyword lanes, and count toward family thresholds. Uses REAL companions, REAL keywords, REAL families, REAL rarity. Climate-protection flavor is repurposed into the status a companion applies. Starter 24:

| Companion | Family | Keywords -> lanes | Applies | In-combat kit |
|---|---|---|---|---|
| Ladybug | pollinators | Restless·Thorned | Thorn | dives and devours the nearest Aphid line |
| Firefly | listeners | Lush | Pollen | drifts and Pollen-marks the densest cluster (catalyst familiar) |
| Bee | pollinators | Restless·Lush | Nectar | busy short-range lure pulses |
| Butterfly | pollinators | Swift | Nectar | wide slow lure, drops bonus Loam |
| Hummingbird | pollinators | Swift | Nectar | fast dart lure across the screen |
| Garden Spider | weavers | Thorned | Sap | lays a silk line that Saps a lane |
| Praying Mantis | weavers | Swift·Thorned | Thorn | lunge strikes on elites |
| Seahorse | weavers | Hardy·Lush | Sap | slow drifting sap aura |
| Toad | guardians | Rooted | Sap | tongue-snipes the farthest pest (flood flavor) |
| Baby Mammoth | wayfinders | Rooted | Frost | periodic stomp shockwave (cold flavor) |
| Scorpion | guardians | Swift·Thorned | Sun | scorch sting (heat flavor) |
| Pangolin | guardians | Hardy | Sap | rolls a knockback arc (wind flavor) |
| Hedgehog | guardians | Rooted·Thorned | Thorn | contact-quill ring |
| Snail | guardians | Hardy | Sap | slow shell aura, +armor |
| Worm | conduits | Lush·Rooted | Spore | tills a spore trail underfoot (drought/soil flavor) |
| Koi | conduits | Lush·Hardy | Frost | drifting chill pool (flood flavor) |
| Jellyfish | conduits | Swift·Thorned | Sun | roaming scorch aura |
| Koala | conduits | Hardy·Lush | (heal) | regen aura, fills Lush hard |
| Mushroom Sprite | mycelium | Restless·Lush | Spore | plants spore puffs on kills |
| Deer Fawn | mycelium | Hardy·Swift | Nectar | skittish lure, fast |
| Raccoon | scatterers | Swift | Spore | grabs stray Loam and Spores what it touches |
| Owl | listeners | Hardy·Swift | Frost | reveals the next elite, snipes Frost |
| Cicada | listeners | Hardy | Sun | **herd**: +damage to nearby familiars (family ritual hook) |
| **The Beholder** | listeners | (Cosmic) | Pollen | **omnisight**: auto Pollen-marks EVERY pest on screen periodically — the top-tier reward familiar, turns the whole board into Nova fuel |

Roadmap unlocks the rest (Great Blue Heron, Dragonfly, Bat, Raven, Turtle, Axolotl, Luna Moth, Origami Crane, Flamingo, Robin, Rabbit, Cricket, Ant Trail, Scarab, Squirrel, Panda, Platypus, Gnome, Porcupine, Red-Crowned Crane, Puffin, Goose, Mouse, Will-o-Wisp, Navi, Moth, Caterpillar, Pill Bug, Spider, Dart Frog, Mantis variants, cocoon trio). Cocoon companions (Parasitic Wasp, Lungfish, Tardigrade) are Verdancy-tier unlocks only.

---

## 5. PASSIVES (v1: 12)

| Passive | Effect | Lane / synergy |
|---|---|---|
| **Golden Hour** | every reaction you trigger also applies 1 Pollen | self-catalyzing; makes triples reachable from a plain pair |
| **Windborne Spores** | Spore jumps +2 pests, travels farther | Spread lever as a passive |
| **Nectar Guide** | +50% lure radius, lured pests take +25% reaction damage | Geometry lever |
| **Chill Reservoir** | Frost never expires before it Shatters, brittle capacity x2 | Burst lever, Glass backbone |
| **Phyllotaxis** | +1 projectile, wider spread on all weapons | flat multiplier on the whole engine |
| **Heliotropism** | auto-aim biases weapons toward the densest cluster | one-thumb aim assist, feeds Nectar geometry |
| **Deep Taproot** | +max HP, +1 to Sap and Thorn stack ceilings (Rooted 3) | raises DoT ceiling; a graft key disguised as survival |
| **Guttation** | lifesteal on kill (Lush 2) | keeps you Verdant on purpose (steers AWAY from Wilting grafts) |
| **Thigmonasty** | thorn burst reflect when you take a hit (Thorned 3) | rewards taking hits, pushes toward Wilting gates |
| **Etiolation** | below 30% HP: +60% damage, +move (Shade 3) | the Wilting glass-cannon engine |
| **Vernalization** | shift your Season one step at the next level | the only state-gate editor; master key to closed branches |
| **Mycorrhizae** | +Loam pickup radius and faster leveling (Spore pressure) | pickup is bait; quietly pushes Spore grafts |

---

## 6. ENEMY ROSTER (v1: 12 + elite; all SHAPE-coded)

| Enemy | Silhouette | Behavior | Threat / lesson |
|---|---|---|---|
| **Aphid** | tiny round teardrop, trailing lines | fast conga lines, periodically splits | overwhelm by count; harmless singly |
| **Leaf Beetle** | hard hexagon domed shell | slow armored walker, shrugs off direct fire | needs **Rot** to melt carapace; teaches reaction routing |
| **Locust** | angular chevron, jagged wings | timed dash swarms, eats loose Loam | burst pressure + denies your income |
| **Slug** | fat blob dragging a slime trail | slow, high HP, slime speeds other pests | lane clogger; weak to **Sun** (dries it) |
| **Weevil** | pear body + long snout | burrows and erupts next to you | ambusher; ignores orbit weapons until it surfaces |
| **Wasp** | striped diamond + stinger point | fast homing dive-bomber, ranged sting | aerial; ignores ground Sap/Honeytrap |
| **Spider Mite** | X / asterisk star | strings web lines that slow YOUR movement | mobility denial; punishes clumping |
| **Scale Insect** | limpet teardrop on a shell plate | stationary, armors every nearby pest | priority target; aura makes a crowd tanky |
| **Mealybug** | cottony fuzzy oval | immune to the FIRST status you apply | forces you to lead with the right reaction |
| **Cutworm** | segmented crescent arc | chews a furrow toward you, curls to dodge slow shots | mid bruiser that dodges telegraphs |
| **Thrip** | thin needle sliver | drifts in near-invisible clouds, chips | attrition; easy to lose in a busy screen |
| **Vine Borer (ELITE)** | large segmented drill worm | tunnels and erupts in a line; drills through walls/traps | drops a guaranteed graft; anti-turtle, counters zoning builds |

---

## 7. WAVE & BOSS TIMELINE

A run is one **Night**, ~10-13 min, on a **Day/Night cycle** that is itself a state gate, with a rolling **Weather modifier** (Drought/Flood) mid-run.

- **DUSK (0:00-4:00):** Aphids, Thrips, one Slug. Three fast early drafts so you commit a starter status and first companion. Low stakes; learn to read the field. First Beetle pack elite ~2:00, then a breather draft.
- **DEEP NIGHT (4:00-9:00):** density and mix spike. Locusts and Wasps add burst; **Day flips to Night ~3:30-4:00** opening Shade gates (first graft usually lands here). Mealybug and Scale force you to reach new reactions. **Two elites** (Vine Borer, Scale escort) each drop a guaranteed graft + a **Wildgrowth pact** offer. A 20s **Grove breather** at the phase seam: no spawns, Loam to sweep, shop the wandering vendor, read your build. **Mid boss ~5:00.** A Weather modifier rolls, flipping weather gates and driving second-order grafts.
- **FIRST LIGHT (9:00-13:00):** compressed finale surge feeding the final boss; splitting pests and Vine Borers hunt wall builds. **Final boss ~11:00.** Clear it for `run_complete`, or step into endless **Overgrowth** (density + modifier stack ramps until you fall; a milestone earn moment every 5 min).

**Pacing rule:** never more than 90s without a draft or a lull, so the thumb never has to move and choose at the same time. **Difficulty is density and reaction-resistant pests, not just HP.**

### Bosses (v1 ships Grubfather + Stormwing; Motherspore + Deluge in roadmap)
1. **Grubfather, the Rootbound Weevil King** (mid) — burrows and erupts under telegraphed rings, summons Aphid broods. Armored back is immune to direct fire; break it with **Rot** (Spore+Sap) to expose a soft heart, then **Shatter** it (Frost) for the damage window.
2. **Stormwing, the Locust Queen** (final v1) — bullet-hell wing-beat arcs plus a swarm she hides behind. **Nectar** peels the swarm off her body, then **Ignition** (Pollen+Sun) flashes the lured cluster and opens her to focus fire.
3. **Motherspore, the Blight** (roadmap) — weaponizes your own engine: spreads Rot pools, spawns spore nodes you must **Sun**-scorch before they mature; final phase exposes Thermal Shock weakpoints that only crack under a Sun+Frost swing.
4. **The Deluge, Grand Slug** (roadmap) — rising slime tide speeds every pest and shrinks your safe ground; carve evaporation lanes with **Sun** and **Caramelize** the herded clusters, racing the tide.

---

## 8. DRAFT UX

On level-up the world softly slows (not a hard pause, so danger is still felt) and **three cards** rise from the bottom third, each a 96px-tall, 48px+ tap target under the resting thumb.

- Card = new **weapon** / **companion** / **passive** / **graft** (grafts only surface when their triple is satisfied; they render **gold with a laurel ribbon** and a one-line teaser, never the full recipe).
- Every card carries a **live REACTION PREVIEW** line derived from the SAME reaction table the sim uses (never a hand-mirror): e.g. under Sundew "with your Nettle this reaches Bramble", or under Golden Hour "every Bramble goes Nova". Chase-tags gold-highlight a pick that completes a reaction you can half-reach.
- Companion cards show a live family arc: "Guardians 3 of 4" so you can see how close a T3 ritual is, plus a tag strip (element / family / keywords) for at-a-glance synergy.
- A thin **Graft Compass** runs along the top: the single nearest pending graft as a **blacked-out silhouette** + the one missing tag rune + a fill meter, so you read "one Spore from something on your Thornwhip" without being told the name. A haptic tick fires the instant a card first turns gold.
- Controls (bottom, one-thumb): **Reroll** (free 1/level, extra costs Seeds), **Banish** (long-press to remove a card from this run's pool), **Lock** (pin one card to reappear next level to bank toward a graft). Reduced-motion swaps the slow-mo for a static fade.

---

## 9. META-PROGRESSION — The Germination Tree

Persists in `localStorage` under `lw_bramblewick_v1` ONLY. Never touches Sunbeams, Dew, Pollen, Pi, or Firestore. Spend **Loam** in a Dead Cells style branching web (unlocks widen CHOICE, not raw power):

- **SEEDS** — new starter plants, each biasing an opening status + a permanent **Season** state key and handing a signature weapon (Nightshade/Shade, Snowdrop/Frost, Sunflower/Sun, Bloodroot/Thorn, Puffball/Spore, Dandelion/Pollen). Biggest lever on how a run begins.
- **POOL** — inject more weapons, passives, and **companions** into the draft pool, unlocked family branch by branch, so early runs draw from ~24 companions and veterans from all 85.
- **CHARGES** — permanent extra rerolls / a banish charge per run.
- **VERDANCY** — the difficulty ladder (tiers 0-5, the Boss-Cell analog): each tier adds a hazard or a reaction-resistant pest and raises Loam + Sunbeam earn rates. Gates the cocoon companions and hardest content behind mastery.
- **GLASSHOUSE** — pure cosmetic canvas palette skins (midnight, mossglass, amber lantern, frost pane) and plant silhouettes.
- **GRAFTING CODEX** — the long game. Every graft and pairwise reaction is a collectible card: discovered ones show the full recipe (base + tag + gate), undiscovered show only a silhouette, hidden triple/Chimera recipes stay fully blacked out until stumbled into. Filling the Codex makes run 40 a deliberate route to a missing recipe instead of run 1's blind stumble.

---

## 10. LOCAL ECONOMY & EARN MOMENTS

- **Loam** (soil) — the run-to-run currency. Drops from kills (more from a Nectar Feast pocket), boss caches, and a lump at each 5-min survival mark. Fills the Bloom Meter (XP) and banks to the Germination Tree. Game-local, thematic, never collides with locked lanes.
- **Seeds** — smaller in-run resource spent live on draft rerolls/banishes. Elites always drop one; pests occasionally.
- **Wildgrowth pact** (Dead Cells cursed-chest analog) — at a Grove breather, accept a curse (pests gain a reaction resistance, the tide floods faster, statuses expire quicker) for a rarer draft tier and more Loam. A greed dial as far as your skill allows.

**Earn moments (Sunbeam bridge, additive, ONLY when `?embed=1`; host prices and caps at the 30/day fleet standard; inert standalone):**
- `run_complete` — any finished run (detail: minutes, Verdancy tier)
- `boss_down` — per boss killed (detail: boss name)
- `milestone_5min` — each 5-min survival mark
- `first_reaction` — first time each of the 21 reactions is triggered (gentle Codex chase)
- `graft_discovered` — first-ever discovery of a specific graft
- `deep_night_tier` — each Overgrowth 5-min tier

Route earns through a **30/day-capped helper** (same-origin: a `_sbCapEarn`-style guard on `sw_sb_bramblewick`; embedded: post `{sws:'earn', moment, detail}` to parent). The whole loop is fully rewarding on Loam alone with zero external reward.

**Embed protocol (copy verbatim):** on `?embed=1`, run the `SWS_EMBED` test, post `{sws:'ready'}` on load, `{sws:'close'}` on back-out. Movement is the only required input; auto-fire is the norm.

---

## 11. MOBILE FEEL & RENDERING

- One thumb is the whole scheme. A **floating virtual joystick** spawns wherever you first touch the lower two-thirds and follows your thumb. Weapons auto-fire on their own timers; **Heliotropism** auto-aims at the densest cluster. Optional manual-aim toggle for advanced players (see Fork C).
- **Pointer-id tracking** binds the joystick to the first finger; a second touch (draft card, pause) never hijacks movement; `pointercancel` and a lifted stray finger cleanly reset the stick.
- Draft cards are full-width, bottom-anchored, 48px+.
- Logical canvas **540x960 portrait**, DPR-scaled at `min(2, devicePixelRatio)`, letterboxed with `offX`/`offY`. `<meta viewport ... maximum-scale=1, viewport-fit=cover>`.
- **Colorblind standard (hard):** every pest is a distinct silhouette; every status is a distinct shape glyph; every rarity has a distinct corner notch. Color is never the only signal. Glyphs collapse to a numeral count at high density.
- Haptics (gated by setting) on level-up, first trigger of each reaction, a heavier pulse on Nova/Shatter, and boss spawn.
- **Reduced-motion** setting caps particle counts and swaps reaction bursts for brief flat flashes.
- **WebAudio only**, all synthesized (soft plucks for pickups, a low bloom swell for reactions, a detuned drone for Deep Night). AudioContext created on first tap and **closed on close** (thermal rule).
- Midnight greenhouse palette: deep black floor, sage foliage, gold organ glints and graft moments, cream UI text. **No dashes in any player-facing copy.** No mascot.

---

## 12. PERFORMANCE ARCHITECTURE (build this FIRST, not a retrofit)

This is the load-bearing risk on an 8GB no-swap box in Pi Browser on mid-range Android. All four judges flagged it. Non-negotiable from day one:

1. **Spatial hash grid** for ALL proximity work: collision, reaction adjacency, Spore pest-to-pest propagation (naively O(n^2)). Cap neighbor queries per frame; Spore spreads over several frames, not all at once.
2. **Object pooling** for every pest, projectile, status instance, and particle. **Zero per-frame allocation** (no GC hitches). Flat/typed arrays for hot data.
3. **Hard entity caps:** ~300 active pests (overflow queued), ~500 projectiles, a fixed particle budget the reduced-motion setting can slash. Offscreen culling.
4. **Cascade throttle:** per-pest **soft reaction cooldown** + diminishing returns per pest so screen-clears cannot loop every frame (also the balance fix for a dominant chain — see Fork D).
5. **Recompute topology / graft-eval / archetype only on level-up**, never per frame. Cache the plant stroke to an offscreen canvas; redraw only when it changes.
6. Draw with cheap strokes and radial gradients; **no per-element canvas filters** (they tank iOS). Batch by shape to cut fillStyle switches.
7. **Dev bridge** behind `?bramblewicktest=1` exposing `window.__bw` hooks: `spawn(type,n)`, `grantStatus(status,n)`, `forceReaction(a,b)`, `skipToBoss()`, `setSeason()`, `setHP(pct)`, `grantGraft(id)`, `state()` — so headless puppeteer covers the large verify surface from day one. Draft preview logic must derive from the same reaction table the sim uses.

---

## 13. SINGLE-FILE BUILD PLAN (ordered)

See the buildPlan field for the full ordered step list. In brief: perf floor and pooled entity sim first, then the status/reaction engine, then the draft loop, then companions and grafts, then bosses and meta, then the earn bridge and polish. Prove a vertical slice (Dandelion + Nettle + Puffball, 6 pests, 1 boss, the reaction engine, the perf floor) is fun and smooth BEFORE authoring the full content, because scope is the meta-risk that sinks this if built all at once.

---

## 14. WHY THIS IS UNIQUE (honest)

The skeleton is a survivor-like (drag, auto-fire, XP motes, level-up draft, wave clock, boss) and we will not pretend otherwise. The novelty stacks in three places no survivor-like has shipped together: (1) the **inverted damage model** where weapons deal ~0 and the FIELD STATE is the weapon, on a full 21-cell pairwise reaction matrix times four orthogonal levers; (2) the **85 pre-characterized companions** drafting in as familiars whose REAL keywords are the reaction lanes and REAL families are the parent game's rituals, so the satellite deepens an existing asset; (3) **conditional evolutions gated on how you are playing right now** (drop to Wilting HP to open the glass-cannon branch) on a re-emitting fusion graph you map across runs into a Codex. Build identity is not a stat pile. It is which reaction you are farming tonight.

---

## APPENDIX A — ORDERED BUILD PLAN

- **STEP 0** Shell + perf floor FIRST. Single HTML file: viewport meta (maximum-scale=1, viewport-fit=cover), 540x960 logical canvas, DPR min(2,dpr) with offX/offY letterboxing, requestAnimationFrame loop with fixed-timestep accumulator. Build the spatial hash grid, object pools (pest/projectile/statusInstance/particle), and hard entity caps NOW. Stress-test 300 pests + 500 pooled projectiles moving at 60fps with zero per-frame allocation before any gameplay.
- **STEP 1** Movement + auto-fire. Floating joystick spawned by pointer-id in the lower two-thirds, pointercancel reset, plant drags around. One placeholder weapon auto-fires on a timer. Heliotropism auto-aim toward densest cluster via the hash grid.
- **STEP 2** The status/reaction engine (the spine). Pest status stack-map with per-status decay. Author the 7 statuses and the full 21-cell pairwise reaction table as data. Implement THE RULE (applying B to a pest carrying A fires {A,B}, consumes a stack of each, deals payload, emits third status/projectile). Implement the four levers (Pollen Nova upgrade, Spore multi-frame spread via capped neighbor queries, Nectar lure geometry, Frost brittle-store + Shatter). Add per-pest soft reaction cooldown + diminishing returns. Wire the shape-glyph badge renderer with collapse-to-count.
- **STEP 3** Enemies. Author 12 shape-coded pests with distinct silhouettes and behaviors (Aphid split-lines, Beetle front-armor, Slug slime, Weevil burrow, Wasp aerial, Mite web, Scale aura, Mealybug first-status immunity, etc.) + the Vine Borer elite. Spawn director with density curve and the mealybug/scale reaction-resistance so one reaction cannot coast.
- **STEP 4** Loam motes, Bloom Meter, level-up draft loop. Soft-slow, three bottom cards at 96px, tap-to-take, Reroll/Banish/Lock. Draft preview lines derived from the SAME reaction table as the sim. Ship the vertical slice here (3 weapons, 6 pests, the engine) and PROVE it is fun + smooth on a real phone before expanding.
- **STEP 5** Keyword lanes. Six lanes (Swift/Thorned/Rooted/Lush/Hardy/Restless) summed loadout-wide, each a stat channel AND a reaction multiplier. Wire lanes into the reaction math (Thorned = damage, Rooted = radius, Swift = frequency).
- **STEP 6** Weapons + passives. Author the 10 v1 weapons (each a visible organ that grows on the plant silhouette, cosmetic only) and 12 passives. Wire the 12 passives' lane/lever effects.
- **STEP 7** Companions as familiars. Author 24 companions from the real roster with real family/keyword/rarity. Orbit + status-application + kit behavior. Family thresholds (2 = T2 aura, 4 = T3 ritual) mirroring _LW_hasFamilyRitual. The Beholder omnisight reward familiar.
- **STEP 8** Conditional graft web. Represent grafts as {base, lanePressure, stateGate} triples with re-emission tag bundles and a per-weapon graft cap. State gates: Season (per-run), HP band (Verdant/Wilting), Bloodless, Overgrown. Offline cycle-check the recipe table. Gold graft cards + the top-screen Graft Compass (silhouette + missing rune + fill).
- **STEP 9** Season + Day/Night + Weather. Wire Season as a per-run state key (from starter plant), the Day/Night cycle flipping Shade gates, and the rolling Drought/Flood weather modifier flipping weather gates mid-run.
- **STEP 10** Bosses. Grubfather (burrow + Rot-then-Shatter armor break) at mid, Stormwing (Nectar-peel + Ignition) as final. Telegraphs, phases, Grove breather after each.
- **STEP 11** Meta: Germination Tree in localStorage lw_bramblewick_v1. Branches Seeds/Pool/Charges/Verdancy/Glasshouse + the Grafting Codex (discovered = full recipe, undiscovered = silhouette). Wildgrowth pacts at breathers.
- **STEP 12** Earn bridge + embed protocol. SWS_EMBED test on ?embed=1, post {sws:'ready'} on load, {sws:'close'} on back-out. earnMoment for run_complete/boss_down/milestone_5min/first_reaction/graft_discovered/deep_night_tier routed through a 30/day-capped helper. Inert standalone.
- **STEP 13** Dev bridge ?bramblewicktest=1 (spawn/grantStatus/forceReaction/skipToBoss/setSeason/setHP/grantGraft/state) + headless puppeteer coverage of the reaction table, graft triples, and a full boss run.
- **STEP 14** Polish: WebAudio synth (pickup pluck, reaction swell, Deep Night drone, AudioContext closed on exit), haptics, reduced-motion path, colorblind audit, 48px audit, midnight palette skins, Overgrowth endless mode. Portal card + thumbnail. node --check the extracted script, verify on a real Pixel.

---

## APPENDIX B — DIRECTOR FORKS (decisions reserved for Stephen)

### Fork A

**Q:** How much of the physical plant body-plan do we ship? The Living Architecture design's node-graph placement + steering-is-aiming sway is the most ORIGINAL mechanic in the whole sprint, but also the fiddliest on a phone and the biggest buildability risk. My spec currently keeps only the cosmetic version (your plant visibly grows organs, but you do not place them and steering does not aim).

1. Cosmetic-only (my spec): organs grow to show your build, no placement puzzle, no sway-aiming. Lowest risk, ships clean, one-thumb stays trivial.
2. Light spatial: you choose a coarse ZONE (top/side/base ring) to graft each organ, which biases its fire arc, but no per-node fiddliness and no sway. Adds a little of the body-plan identity at moderate risk.
3. Full body-plan: node-graph placement + sway-is-aiming as a v2 mode or a separate satellite. Highest uniqueness, highest risk, likely a multi-week build on its own.

**Recommendation:** Ship Cosmetic-only for v1 (Option 1). It preserves the 'your plant IS your build' fantasy at zero buildability cost and keeps the reaction engine as the star. Park the Full body-plan (Option 3) as a possible sequel satellite, since it is strong enough to headline its own game and would dilute this one if crammed in.

### Fork B

**Q:** What is the v1 content budget? The reaction engine is buildable, but every judge warned that 85 companions + 14 weapons + 4 bosses in one file is a multi-week verify surface that risks shipping nothing.

1. Lean v1: 10 weapons, 24 companions, 12 pests, 2 bosses, 4 triples. Grow the rest behind the Root Network. (My spec.)
2. Mid v1: add ~16 more companions (40 total) and the 3rd boss.
3. Full v1: all 85 companions and 4 bosses at launch.

**Recommendation:** Lean v1 (Option 1). Prove the vertical slice is fun and smooth on a real phone first, then the Root Network turns the remaining 61 companions and 2 bosses into a natural post-launch unlock ramp that makes run 40 richer than run 1. Content growth IS the retention engine here, so holding some back is a feature, not a cut.

### Fork C

**Q:** Does the game have an execution skill ceiling, or is it pure accessible auto-play? The pitch sells 'cascade routing' as a mastery gap, but Heliotropism auto-aim does most of the routing on a one-thumb phone.

1. Pure auto-aim: fully accessible, the build IS the skill, no manual targeting. Widest audience.
2. Auto-aim default + optional MANUAL-FIRE toggle: advanced players can aim a specific status to control which reactions land where, unlocking the cascade-routing ceiling without forcing it on anyone.
3. Manual status-priming as a core verb: a second input to hand-place your catalyst. Highest ceiling, breaks the one-thumb promise.

**Recommendation:** Option 2. Auto-aim stays the default so the game is trivially one-thumb, but a manual-fire toggle gives the skill players a real routing ceiling. This resolves the tension the judges flagged (aspirational vs felt mastery) without taxing casual players, and it is cheap to build.

### Fork D

**Q:** Balance philosophy: power-fantasy screen-clears vs build diversity? The reaction engine will produce a dominant chain (likely Ignition or Wildfire) that trivializes runs unless tuned. How hard do we tune it?

1. Generous / power-fantasy: light cooldowns, let dominant chains rip. Satisfying, but collapses replayability to one funnel and matches the parent game's 'a little generous' Variant G ethos.
2. Tuned / diverse (my spec): per-pest soft reaction cooldowns + diminishing returns, so every reaction family stays viable and the Codex is worth mapping. Also doubles as the perf throttle.
3. Hybrid: generous inside a single run for the power spike, but Verdancy tiers progressively tighten cooldowns so higher difficulty rewards build diversity.

**Recommendation:** Option 3 (Hybrid). Low Verdancy tiers feel generous and let players taste screen-clears (retention hook, matches the house 'a little generous' philosophy), while high tiers tighten cooldowns so mastery demands real build diversity. This satisfies both the casual and the Dead-Cells-depth audiences from one dial, and the cooldown system is already mandatory for perf.

