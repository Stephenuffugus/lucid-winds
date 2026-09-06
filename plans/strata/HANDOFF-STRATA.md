# HANDOFF STRATA, the build plan for one Opus night (and a morning)

**Written:** 2026-09-05 evening, by Fable, from
`docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-STRATA.md` (Stephen's design, read in full) plus the fleet
on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then `plans/fathom/HANDOFF-FATHOM.md` sections 0, 2, 9,
14 and 15, then `plans/asterism/HANDOFF-ASTERISM.md` section 4 MYTH (the seeded grammar this game's names and histories
copy), then this file, then the design. Where they differ, this file wins; every difference is in section 3.
**Game folder:** `satellites/strata/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/strata/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written. Nothing built. Next action: section 5, P0, step 1.
- 2026-09-06 Opus B: **P0 DONE.** SKELETON and IDENTITY built, 65 assertions green, the variety sheet passed at TWELVE of fifty after two rounds at nought and about four; all three counts and what was wrong each time are in section 13. Next action: section 5, P1, step 1, SEDIMENT and the brush.
- 2026-09-06 Opus B: P0 step 1 done, red, output in section 13. Next action: section 5, P0, step 1, the scaffold (SKELETON and IDENTITY, pure, inside `index.html`) and `tools/variety.mjs`.

---

## 0. RULES OF ENGAGEMENT

As `plans/fathom/HANDOFF-FATHOM.md` section 0 with `strata` for `fathom`. Two laws particular to Strata: **a specimen is
its seed** (the skeleton, its name and its history regenerate exactly from one number, which is what the share link and
the museum rely on), and **the variety sheet is a gate a human reads** (section 5, P0 step 3): fifty random skeletons on
one image, opened with the Read tool, and if fewer than five are worth a screenshot the grammar deepens before any dig
code exists.

---

## 1. WHAT STRATA IS, AND WHY IT IS WORTH A NIGHT

From the design: *"A cliff face of layered sediment. Brush away dust, chisel through stone, and something emerges, a rib,
then a claw, then a skull belonging to a creature that has never existed before and will never be generated again. Extract
it carefully (chisel too hard and bones crack), assemble it on the mounting armature, name it, and hang it in your museum."*
Positioning line: **"Every fossil is the only one."**

Why it is worth a night: the toy aisle proves the excavation kit forever, the itch precedent proves the museum loop, and
both use fixed real dinosaurs; procedural species are the wedge and the studio already generates one of one things from
hashes (The Attic, the plants). It is last in the second six because it is three games in one (a grammar, a dig, a museum)
and about ten hours; a night that lands the grammar and the dig leaves the soul, and the museum is a morning.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| A one of one thing from a hash, rendered dusty or clean | `satellites/attic/attic-engine.js` line 618 `hashToItem`, `satellites/attic/object-render.js` (`ATTIC_OBJECT.renderItem(h, size, {dusty})`), `satellites/attic/index.html` 846 to 880 (`wipeReveal`) | The shape: a seeded record, a renderer that takes the record, and a dusty variant. The Attic's wipe is a CSS sweep and NOT a scratch mask; Strata's sediment is its own grid (section 4) |
| A seeded grammar for names and one line histories, with a words gate | `plans/asterism/HANDOFF-ASTERISM.md` section 4 MYTH and 5 P2 step 5; `satellites/keepsies/test/words.mjs`; `HAIKU_PRINCIPLES.md` | Slots and counts, reachability, no fragment swallowing the output, no dashes, no absolutes |
| Share by link and a poster | `satellites/blockspace/index.html` 1060 to 1080; `plans/asterism/HANDOFF-ASTERISM.md` section 4 POSTER; `satellites/attic/index.html` 1446 to 1466 | `#f=` for a specimen; the journal plate at 2048x2560 |
| Multi pointer, pinch | `satellites/abduct-a-chameleon/index.html` `pointers`, 1298 | Strokes are one pointer; a second pinches the cliff |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `strata` in place of `fathom` |

Not inherited: the main game's `_generatePlantSVG` (SVG, one shot), any physics.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **Portrait everywhere; the museum widens in landscape.** The design says portrait dig, landscape museum. The arcade
frames games portrait; the hall is a scrolling row of plinths that works in both. No forced rotation.

3.3 **Mounting needs 60 percent excavated.** The design recommends it; taken. Under that, the mount button says "Free
more of it first" and the bronze infill covers the rest.

3.4 **Idle visitors are v1.1.** The design recommends it; taken. The hall reads alive with placards alone.

3.5 **The grammar's parameters are frozen, and the variety sheet is the gate.** Section 4 SKELETON lists the parameters
and their ranges; `tools/variety.mjs` renders fifty seeds; the human rule in section 0.

3.6 **Tool rules are numbers.** Pick radius 14 cells, rate 1.0, cracks any bone cell it touches. Chisel radius 8, rate
0.5, the pressure meter fills at 1.0 per second while the stroke rests on a bone cell and empties at 2.0 per second off
bone; damage at 1.0, the shiver and tone at 0.6. Brush radius 10, rate 0.15, never damages. A crack is local to one bone.

3.7 **Extraction is a trace.** A bone whose cells are at least 85 percent cleared can be traced: a stroke along its length
that stays within 12 cells of its spine for at least 70 percent of the spine; the plaster jacket animates, the bone leaves
the grid.

3.8 **Names are Latin flavoured, unique, and honour a dedication.** The binomial grammar makes a genus from syllable
banks and a species from a bank or from a dedication name plus `i` (Penny → pennyi; a name ending in a vowel drops it
first); TEST asserts 5,000 seeds give at least 4,950 distinct binomials.

3.9 **Era bands are generated names with a real flavour, and depth is the progression.** Six bands per site from the
seeded stream; deeper bands bias the grammar toward stranger plans and larger sizes; deep sites unlock by specimens mounted
(2, 5, 9).

3.10 **Copy.** No dashes, no exclamation points. Placards read: name, era, discoverer, condition. Condition words:
Pristine, Sound, Repaired, Patched.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/strata/`):

```
index.html            the game
sim.js                --test, --species=<seed> (prints the record), --dig=<seed>,<policy> (runs a scripted dig)
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs  tools/variety.mjs
test/dig.mjs  test/mount.mjs  test/share.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers: `CONFIG, RNG, SKELETON, IDENTITY, SITE, SEDIMENT, TOOLS, EXTRACT, MOUNT, MUSEUM, JOURNAL, VIEW, AUDIO, SHARE,
INPUT, SAVE, TEST, BOOT`. `SIM_EXPORT` markers wrap CONFIG through EXTRACT.

**CONFIG (frozen):**

```
GAME_ID 'strata'  SAVE_KEY 'lw_strata_v1'  SAVE_V 1
GRID_W 200  GRID_H 300  CELL_PX at 375 wide: 1.8
PICK {r: 14, rate: 1.0}  CHISEL {r: 8, rate: 0.5, fill: 1.0, drain: 2.0, warn: 0.6}  BRUSH {r: 10, rate: 0.15}
EXTRACT_CLEAR 0.85  TRACE_TOL 12  TRACE_COVER 0.70  MOUNT_MIN 0.60
BONES_MIN 12  BONES_MAX 80  SITE_SMALL 1  SITE_LARGE 2 (skeletons)  SCAN_PER_SITE 1
BANDS 6  DEEP_UNLOCK [2, 5, 9]  DUST_MAX 400
```

**SKELETON.** `species(seed)` from `mixSeed` streams: `plan` (biped, quadruped, flippers, wings), `size` class (mouse,
dog, horse, bus; scale 0.25 to 4), spine spline (length 8 to 40 vertebrae, curve, `tail` whip or club), neck vertebrae 3 to
16, skull archetype (long jaw, beak, crest, dome), limb proportions, digits 2 to 5, ornament pass (plates, spines, frill,
sail; probability by era band), `era` band index. `bones(species)` derives polygons: vertebrae along the spline, ribs from
the mid spine, limb bones from the plan, skull parts, ornaments; each `{id, poly, spine (for the trace), fragile}` in
site cells with taphonomic scatter (a seeded 2 to 6 cell disarticulation on 20 percent of bones, a 5 percent missing
chance, never the skull).

**IDENTITY.** `identity(species, seed, dedication)`: binomial (3.8), diet, era name (a generated name like The Emberwash
next to a real flavoured epoch word), one natural history line from a three beat grammar (habitat, habit, a small
particular) with at least 30 fragments per beat, gated as Asterism's myth.

**SITE.** `site(seed, depth)`: the grid's band boundaries (six wavy lines), one or two species placed with the deeper one
lower, common finds (shells, plant prints) scattered as small bone like objects with no fragility, the scan (one free
shimmer that marks the largest bone's centre for 4 s).

**SEDIMENT.** Typed arrays over the grid: `density` (0 clear to 1 stone; dust is 0.15 to 0.4), `bone` (bone id or 0),
`cracked` (bit). Tools subtract density with a radial falloff; a stroke over a bone cell with a damaging tool sets the
bone's crack flag by 3.6.

**TOOLS, EXTRACT.** Section 3.6 and 3.7.

**MOUNT.** The armature silhouette from `species`; each extracted bone snaps to its slot; missing or cracked show bronze
infill; the condition word from the crack and missing counts; the name sheet with the dedication field and the generated
binomial as the default.

**MUSEUM.** A hall of plinths in a horizontal scroll; a placard per specimen; drag to reorder; the poster (the journal
plate: a sketch render of the skeleton, name, era, history, discoverer, date) at 2048x2560; wings unlock at 4, 8, 12
specimens (Deep Time, Sea Hall, Aviary) as filters and a new backdrop tint.

**JOURNAL.** The collection index: every specimen's plate, the dig site memory (band names, tools used, cracks).

**VIEW.** Canvas 2D. The cliff face with the six bands in earth tones per era, bones as bone cream with a darker edge
under a translucent dust layer, the dust particles pouring and settling (`DUST_MAX`), the swept arcs of the brush, the
tool icons in a thumb rail, the pressure meter as a small ring around the finger, the shiver, the freeze frame on the
first clink of a new bone. The museum: warm wood floor, plinths, brass placards, the wings' tints.

**AUDIO.** Synthesised granular: the pick tak, the chisel tik tik, the brush shhh (a noise grain per 4 px of stroke), the
first clink (a bright bell with a 2 s tail, plus `navigator.vibrate(20)`), the crack (a dry snap), the jacket wrap (cloth
rustle), the museum's room tone.

**SHARE.** `#f=` = the species seed, the name, the discoverer, the condition; the recipient receives a crate in the hall,
unpacks it (a tap), mounts it with the sender's museum on the placard.

**INPUT.** One pointer strokes; the tool rail on the right; pinch to zoom the cliff (0.7 to 2.5); a two finger drag pans.

**SAVE.** `lw_strata_v1`: `{v, discoverer, museum: [specimens], sites: {seed, state}, unlocked, settings:{sound, motion,
haptics}, seen:{how}}`. The current site's grid is saved as a run length encoding on hide and every 60 s.

**TEST.** Deepwell's harness; floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The grammar, and fifty animals on one sheet (about 2 hours)

1. Scaffold. SKELETON, IDENTITY pure; `tools/variety.mjs` (renders fifty seeds as silhouettes on one PNG, 10 by 5).
2. `sim.js --test`: 500 seeds give skeletons with `BONES_MIN` to `BONES_MAX` bones, every bone inside the grid, every bone
   connected to the spine by the armature graph, the skull never missing; all four plans and all four size classes appear
   within 200 seeds; deeper era bands give more ornaments on average; 5,000 seeds give at least 4,950 distinct binomials;
   a dedication of Penny yields `pennyi`; histories are 12 to 40 words, every fragment reachable across 5,000 seeds, no
   fragment over 60 percent of its slot, no dashes, no absolutes; the same seed gives the same species, bones and identity.
3. **The variety sheet.** Run `tools/variety.mjs` to `docs/shots/p0-variety.png`. Open it with the Read tool. Count the
   ones you would screenshot. Fewer than five: deepen the grammar (more skull archetypes, ornament combinations, proportion
   ranges) and run it again. Write the count in the ledger both times.
4. Watch it fail: set the plan draw to always biped and the plans assertion goes red; add a dash to a history fragment
   and the words assertion goes red.

### P1. The dig (about 2.5 hours)

1. SITE, SEDIMENT, the brush with dust and the swept arcs, the reveal.
2. **Stop and feel test.** Brush a rib clean by a scripted stroke and shoot `docs/shots/p1-brush.png` mid stroke and
   `p1-rib.png` after, at 375x667. Open them. The design says brushing a rib clean must be self justifying; if the dust
   reads as a flat alpha rather than as grains pouring, fix the particle pour and the settle before the chisel.
3. The chisel and the pick, the pressure ring, the shiver and tone, cracks, the first clink freeze frame, the extraction
   trace and the jacket, the scan shimmer.
4. `test/dig.mjs` (browser, real pointers at 375x667): a real 120 px brush stroke lowers the density along its path by at
   least `BRUSH.rate` per pass and spawns dust; a real chisel stroke resting 1.2 s on a bone cell sets its crack and the
   warn event fired before it; a real pick stroke over a bone cracks it at once; a bone cleared past `EXTRACT_CLEAR` by a
   scripted brush is extracted by a real trace stroke along its spine, and a trace 20 cells off the spine is refused.
5. `test/layout.mjs`: the tool rail 48 px per tool at 375x667; the bottom left 120x120 empty; the pressure ring never
   under the finger.

### P2. Mount, name, hang (about 2.5 hours)

1. MOUNT with the armature and the snap, bronze infill, the condition; the name sheet with the dedication; IDENTITY on the
   placard; the JOURNAL plate.
2. MUSEUM: the hall, plinths, placards, reorder, the poster export.
3. `test/mount.mjs` (browser): with a site's skeleton fully extracted by the TEST hook, real drags snap three bones to
   their slots (the slot's `filled` flag), MOUNT with 60 percent gives a specimen in the museum with the generated name;
   the name field accepts a real typed dedication and the placard shows `pennyi`.
4. Shots: `p2-mount.png`, `p2-hall.png`, `p2-plate.png` (the poster scaled to 512 wide).

### P3. Depth, sharing, polish (about 3 hours; where a night stops, and the morning continues)

1. Era bands as progression, deep sites and their unlocks, the large site with two skeletons, common finds.
2. SHARE `#f=` and the crate; `test/share.mjs`: a specimen's link opened in a fresh context shows a crate, a real tap
   unpacks it, and the mounted specimen carries the sender's museum on the placard.
3. AUDIO, haptics, reduced motion, the wings.
4. `tools/shots.mjs` at 412x915, 375x667, 320x568; `tools/thumb.mjs` (a half revealed skull under dust);
   `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (portrait, one hand, 48 px rendered at 375 wide)

- **The cliff (dig).** Full bleed with the bands; the tool rail on the right edge: BRUSH, CHISEL, PICK (56 px each,
  the active one lit), SCAN (48, one per site, greys after); top left: the site chip (48 px, the band name under the
  finger); top right: menu (48): Museum, Journal, New site, Settings. Bottom left empty. When a bone is extractable it
  glows and a TRACE hint appears once. First boot: "Brush. Something is under there." and nothing else.
- **Mount.** The armature silhouette on a canvas sheet, the extracted bones in a tray along the bottom (56 px), drag to
  the slot; MOUNT (56 px) when 60 percent; the name sheet: the generated binomial, a dedication field, a diet and era line,
  KEEP.
- **Museum.** The hall scrolling sideways; plinths 120 px wide; tap a placard for the specimen: PLATE, SHARE, RENAME,
  REMOVE (confirm); the wings as chips across the top when unlocked.
- **Journal.** Plates in a list, the site memories.
- **Settings.** Sound, Motion, Haptics, Discoverer name, About: the positioning line, "Sky Wolf Studio", one line about
  superposition (older is lower).

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the game never waits on it)

Three sheets in `plans/strata/ART-PACK-STRATA.md` (a copy in 012Assets as `Strata — Art Pack`). Bones, sediment and dust
are drawn by code and stay drawn.

| File | Used for | Delivered | In game |
|---|---|---|---|
| `journal-paper.png` | the journal and the plate background, tiled | 1:1 tile | `art/paper.jpg` 1024x1024 q75 |
| `hall.png` | the museum hall backdrop, no plinths | 21:9 | `art/hall.jpg` 1600x686 q80 |
| `icon-mark.png` | PWA icon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Strata", ds:"Brush and chisel a cliff face until a creature nobody has ever seen comes out of the stone. Every skeleton is generated once. Mount it, name it, and hang it in a museum that is only yours.", cat:"creative", url:"/satellites/strata/?v=<stamp>", ic:"🦴", thumb:"/portal-assets/thumbs/strata.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED; the variety sheet count
in the ledger is five or more; `test/dig.mjs` passed with real pointers; the brush shot was opened and judged.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9.
- A grammar that draws every parameter independently makes plausible animals that all look the same; correlate (a long
  neck with a small skull, flippers with a short tail) and let the sheet judge.
- The pressure meter must fill by time on bone, not by distance; a fast stroke across a bone is safe, a rest is not.
- Density subtracted per frame is frame rate dependent; subtract per pointer sample distance and per second of rest.
- A 200 by 300 grid redrawn per frame is fine as an `ImageData` put; per cell `fillRect` is not.
- Dust particles are bounded (`DUST_MAX`) and pooled; a long brush session must not leak.
- The extraction trace must be judged against the bone's spine in grid cells, never in screen pixels, or zoom changes the
  rule.
- The share link is stranger data: regenerate from the seed; never trust a bone list from a link.
- A dedication name goes on a placard; strip anything that is not letters and spaces, cap it at 24, and never title case
  it (Wardian's rule about not correcting a nine year old).

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's three open questions take these answers tonight:

1. **Name: STRATA.** Stephen's folder and title; Boneyard and The Dig stay in the morning report.
2. **Mounting at 60 percent.** Section 3.3.
3. **Idle visitors: v1.1.** Section 3.4.

Yours without asking: the syllable banks, the era words, the earth tones, the plinth look, the wing thresholds inside the
rule.

Stephen's, never guessed: price, store, the name, Penny's wing, the classroom page, anything with money.

---

## 11. STEPHEN ONLY

The phone: brush a skull out, crack a rib on purpose with the pick, mount it, name it after someone, send it to Jessie.
Open `docs/shots/p0-variety.png` and say which five you would keep. The three art sheets when the Midjourney month allows.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 2 h, P1 about 2.5 h, P2 about 2.5 h, P3 about 3 h: **about 10 hours, the largest of the
second six.** Expect 5,000 to 6,000 lines. **Where a single night stops well:** the end of P1 (a generated animal you can
brush out of the stone) is the soul; the end of P2 is the game. If the clock says P1 cannot finish, land the brush and the
reveal and skip the chisel; the pick and the cracks are the morning's session.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, 2026-09-06. The gate, before there is anything to gate.

`tools/check.js` written with one gate, `sim` (`node sim.js --test`, wants `STRATA TEST OK`). There
is no `sim.js` yet, so it is red, which is the point.

```
$ flock -w 2400 /tmp/sws-gate.lock node tools/check.js
sim             FAIL  0s

================================================================

--- sim (wanted: STRATA TEST OK) ---

Error: Cannot find module '/workspaces/lucid-winds/satellites/strata/sim.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)

(tail)
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.14.0


1 GATE FAILED
```


### P0 steps 2 and 3, 2026-09-06. The grammar, and the variety sheet three times.

```
$ node sim.js --test
PASSED 65 / FAILED 0   (total 65)
STRATA TEST OK

$ node sim.js --census=3000
  3000 animals
  plan       biped 23.2%         flippers 18.6%      quadruped 41.9%     wings 16.4%
  size       bus 15.1%           dog 36.7%           horse 29.6%         mouse 18.6%
  skull      beak 28.5%          crest 25.1%         dome 10.1%          longjaw 36.3%
  ornament   frill 12.0%         none 35.3%          plates 19.9%        sail 13.5%   spines 19.3%
  bones       39 to 74, mean 55.8
STRATA CENSUS OK
```

**THE VARIETY SHEET, THE GATE A HUMAN READS. Three rounds, and the counts are the point.**

| round | how many of fifty I would take a screenshot of | what was wrong |
|---|---|---|
| 1 | **0** | fifty of the same dashed centipede |
| 2 | about **4** | real skeletons, and forty six of them curled into a prawn |
| 3 | **12** | passes, at more than twice the plan's floor of five |

**Round 1, nought of fifty.** Not one. Every animal was a dotted line of identical rectangles
curving gently, with a few scratches near the middle: a bicycle chain, not a skeleton. Measuring it
rather than squinting at it named the cause in one line:

```
$ node -e "...measure seed 0..."
body box        11.8 x 11.5
skull box       1.2 x 2.6
skull as a fraction of the body: 10.1%
vertebrae       16 over 11.8 units
total curl      -1.73 radians
ribs            6
```

**There was no body length.** The spine was built at one unit per vertebra and everything hung on
it was sized in absolute units, so an animal's proportions were a function of how many vertebrae it
happened to roll. A skull came out at a TENTH of the body where a real one is a quarter; six ribs
stood in for a ribcage; and the curvature accumulated PER VERTEBRA, so a forty vertebra animal
curled through two hundred and eighty degrees into a question mark. Rewritten: one body length,
every section and every part a fraction of it, and every turn per unit of LENGTH.

**Round 2, about four of fifty.** A completely different sheet: ribcages, heads, limbs, real
animals. And forty six of them were the same prawn, because the curl was one wide range and almost
every draw landed in the middle of it. An animal lies in the ground in one of a few ATTITUDES, and
the attitude is the first thing an eye reads, so the pose became a choice from five (`laid`,
`arched`, `curled`, `reared`, `slumped`), each with its own narrow curl, lift and tail carriage.
The same round added `spineClear`, because some necks lifted back over the trunk and put the skull
in among the ribs where nothing about the animal could be read at all.

**Round 3, twelve of fifty.** Named, so the count can be argued with: Dracotheroops (a long low
quadruped with its head up), Stenognathynx (an upright biped, bird like), Amblyplaxia (a wedge of
armour), Corvinothois (a broad plated swimmer), Sarcodonellus (a light quadruped with a long
straight tail), Pachyrhynax (a domed biped, chunky), Microvenatyx (small and delicate with an
upcurved tail), Corvimorphops (a winged thing on stilts), Amblytherooceros (a spindly wader),
Nyctignathes (spiky and upright), Cryoankylon (small, domed and hunched), Thalapodia (a fan of
spines on long legs).

**Three things still wrong with the sheet**, written down rather than chased: the head is a solid
block that merges into the neck on a silhouette, because the cranium and the jaw are one shape
until the game draws them as separate outlined bones; the plated species still read heavier than
they should even after the plates were narrowed below their own spacing; and a few of the widest
animals touch the edge of their cell on the sheet, which is the sheet's fit rather than the
grammar.

**Watched to fail.** The plan's step 4 named two:

```
=== the plan draw is forced to biped ===
  FAIL  all four body plans turn up inside two hundred seeds (biped 200, quadruped 0, flippers 0, wings 0)
  FAIL  a swimmer has a shorter tail than a walker (0.0 against 8.6)
=== a dash is added to a history fragment ===
  FAIL  no dash in anything the earth says about an animal: and sang through its crest at dusk
```

And one the suite caught by itself on its first run, which is exactly what it is for: the fragment
*"The spine curves to the left in every specimen found."* used the word EVERY, and a generated
history that claims a creature always or never did something is a lie about an animal nobody has
ever dug up. Rewritten as *"in the specimens found so far"*.


### P1 to P3, 2026-09-06. The dig, the bench, the hall, and the link.

```
$ flock -w 2400 /tmp/sws-gate.lock node tools/check.js
sim             pass  1s
lint            pass  0s
census          pass  1s
dig             pass  5s
mount           pass  7s
share           pass  11s
layout          pass  24s

ALL GATES PASSED
```

103 assertions in `sim.js --test`. Every browser gate was watched to fail against a backed up copy
of `index.html`, on the assertion that guards the rule:

```
=== the brush takes nothing off ===              8 of the dig gate's assertions go red
=== the rest is charged by move events again === resting the chisel on a bone cracks it, and it shivers a warning first
=== any stroke may lift a bone ===               a stroke that runs along a freed bone but starts out in the rock is digging, not lifting
=== the pick is harmless ===                     a pick stroke over a bone cracks it at once
=== a bone snaps into any slot ===               a bone dropped a long way from its slot stays in the crate
=== MOUNT is offered below the rule ===          MOUNT is not offered with the animal still in the ground
=== the dedication is dropped ===                named for Penny (Halodonops primus)
=== a museum that forgets ===                    and it is still there after the page is closed and opened again
=== the sender is dropped from the placard ===   and the placard says whose museum it came out of
=== the condition in a link is believed ===      but a condition nobody has is not believed (Immaculate)
=== the name in a link is believed ===           and the name is letters and one space (Fakeus <script>alerti)
=== the tools drop to 40 px ===                  and every one is a 48 px target (40x40 40x40 40x40 40x40)
=== the rail moves into the music corner ===     the bottom left 120 by 120 is empty while digging: tPick, tScan
```

**⛔⛔ THE ONE THE HEADLESS SUITE COULD NOT SEE.** The chisel's pressure meter was charged inside
`onMove`, with a fixed sixtieth of a second per event. A finger held perfectly still on a bone
generates NO pointermove at all, so the meter filled nothing and cracked nothing: the one rule the
chisel exists for, *a fast stroke across a bone is safe and a rest on one is not*, was exactly
inverted in the shipped game. All 103 headless assertions were green the whole time, because a
headless test hands the rest its own `dt`. The rest is charged in `tick` now, by the wall clock,
and travel is charged by travel. It was found by a browser gate resting a real finger for eight
turns and getting nothing.

**Eight more things the screenshots found that no gate could see.**

1. **Every buried skeleton showed THROUGH the cliff** as smooth pale rectangles. Bone cells were
   painted by a different route without the rock's own grain, and their matrix had been softened to
   0.44 while the rock around them ran to 0.66, and the painter maps density to colour. The rock
   over a bone is now exactly the rock beside it, asserted both ways.
2. **Six flat earth tones with wavy edges read as a lava lamp**, and superposition is the one piece
   of real geology this game teaches. The beds vary in thickness, each has its own lamination
   spacing and tilt, and there is a line between them.
3. **The cliff used half a tall phone**, fitted into the middle with a hundred pixels of dead brown
   above and below. A cliff face COVERS the screen and what is off the edge is reached by a pinch.
4. **A freed bone was a paper cutout** stuck on the rock: a flat cream shape with a line round it.
   It has a shaded edge and a light along its length now.
5. **The armature on the bench was fifty dotted outlines** on top of one another, a thicket rather
   than an animal, and the bones the GROUND KEPT were the only solid things on it, so the eye read
   the missing parts as the specimen.
6. **Every tray tile fitted its own bone to its own box**, so a rib, a vertebra and a skull were the
   same rounded rectangle. This is exactly the fault Whistlestop's piece tray had earlier the same
   night, made again here, then overcorrected to a measure taken from the LARGEST bone, which
   turned the ribs into three pixel specks. And they were drawn at half size anyway, because the
   scale was worked out against a 108 pixel canvas and every coordinate then halved for the 2x
   transform.
7. **A mounted skeleton floated a finger's width above the plinth** it is supposed to stand on.
8. **The title screen was a flat brown rectangle**, the one screen whose whole job is to say A CLIFF
   WITH SOMETHING IN IT. Both games in this run shipped that first and had it fixed by looking.

**And a design rule the shots forced:** a trace has to START on a freed bone. Without it every
brush stroke that ran along one lifted it, so cleaning around a rib kept pulling it out of the
ground and the plaster jacket gesture the design asks for was not a gesture at all.

**Two flakes, both real.**

- The dig gate went red about one run in four. Pressing DIG makes a FRESH site, seeded off the
  frame count, so the gate was working on a different animal every run and sometimes picked a bone
  near the edge of the cliff where its stroke would have begun on nothing. The button is still
  proved with a real press; every assertion after it runs against a site whose seed is written
  down, and every stroke point is pulled back inside the cliff.
- The mount gate could not reach the tile it wanted, because the crate holds fifty bones in ONE
  SCROLLING ROW and all but six of them are off the side of the screen at any moment. The gate
  scrolls to it the way a thumb does; that the row is that long at all is a Director question in
  section 15.

```
$ node sim.js --census=3000
  plan       biped 23.2%   flippers 18.6%   quadruped 41.9%   wings 16.4%
  size       bus 15.1%     dog 36.7%        horse 29.6%       mouse 18.6%
  skull      beak 28.5%    crest 25.1%      dome 10.1%        longjaw 36.3%
  ornament   frill 12.0%   none 35.3%       plates 19.9%      sail 13.5%   spines 19.3%
  bones       39 to 74, mean 55.8

$ node tools/thumb.mjs
  docs/thumb.png  143 KB   512x512   dark 19%  bone 6.6%  rock 62%
THUMB OK
```

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `dig, mount,
share, layout`.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the variety count**
and the path of the sheet.
