---
name: Lucid Winds art handoff for artist (Apr 27 2026, batch-organized)
description: Comprehensive art-needed list organized by feature batch and ordered for artist priority. Each entry has filename, dimensions, concept, in-game context, style reference. Built from the Apr 26-27 dev sweep.
type: project
originSessionId: ed657dcd-42e7-4e80-99b4-77907a2638de
---
# Lucid Winds — Artist handoff (Apr 27 2026)

This doc is for the artist. Drop PNGs at the EXACT paths listed; the engine auto-loads them on next refresh, no code changes needed. Sizes are real pixels (verified against existing siblings).

Priority legend:
- **P0** broken now or shipping with a placeholder
- **P1** shipped but no art (graceful emoji or color block fallback)
- **P2** polish only

The 9 batches are ordered roughly by impact on player-visible screens.

---

## BATCH 1 — Six ultra-rare mutation portraits (P1)

Six new mutations shipped Apr 26 (commit 84a2959) with full SVG-filter transformations on the live plant. The visible plant in greenhouse and wild needs no art (the engine paints the effect). What IS missing is the small painted PORTRAIT used in the Compendium and Book of Secrets discovery pages.

Match `assets/mutations/mutation-fossil.png` (655 x 1168) for tone: a single stylized plant centered on a dark background, painted look, silhouette readable at thumbnail size.

### mutation-constellation.png
- **Filename:** `assets/mutations/mutation-constellation.png`
- **Dimensions:** 655 x 1168
- **Concept:** Dark navy plant whose leaves are pierced with bright pinpoints arranged like a star chart, with thin connecting lines drawn between them.
- **In-game:** Compendium mutations entry; Book of Secrets discovery card.
- **Style match:** `assets/mutations/mutation-fossil.png`
- **Priority:** P1

### mutation-origami.png
- **Filename:** `assets/mutations/mutation-origami.png`
- **Dimensions:** 655 x 1168
- **Concept:** A flat paper sculpture of a plant. Hard triangular crease lines on every petal and leaf, posterized into 4 flat colors with sharp ridge highlights along the folds.
- **In-game:** same as above
- **Style match:** `assets/mutations/mutation-fossil.png`
- **Priority:** P1

### mutation-stained-glass.png
- **Filename:** `assets/mutations/mutation-stained-glass.png`
- **Dimensions:** 655 x 1168
- **Concept:** A plant divided into colored glass panels by black diagonal lead lattice; light glows softly from behind, color saturation rich.
- **In-game:** same
- **Style match:** `assets/mutations/mutation-fossil.png`
- **Priority:** P1

### mutation-verdigris.png
- **Filename:** `assets/mutations/mutation-verdigris.png`
- **Dimensions:** 655 x 1168
- **Concept:** A bronze plant overtaken by copper-oxide patina; soft green-blue blooms on the surface, drip runs down stem, warm copper highlights showing through where the patina is thin.
- **In-game:** same
- **Style match:** `assets/mutations/mutation-fossil.png`
- **Priority:** P1

### mutation-mycelium.png
- **Filename:** `assets/mutations/mutation-mycelium.png`
- **Dimensions:** 655 x 1168
- **Concept:** A dimmed plant with cream-white fungal threads visibly running through its leaves and along its stem, plus small mushroom cap ellipses sprouting at base and joint points.
- **In-game:** same
- **Style match:** `assets/mutations/mutation-fossil.png`
- **Priority:** P1

### mutation-daguerreotype.png
- **Filename:** `assets/mutations/mutation-daguerreotype.png`
- **Dimensions:** 655 x 1168
- **Concept:** Plant rendered as a 19th-century silver-plate photograph: warm sepia greys, soft circular vignette, faint tarnish blooms in the corners, the worn elegance of an antique portrait.
- **In-game:** same
- **Style match:** `assets/mutations/mutation-fossil.png`
- **Priority:** P1

**Priority count:** 6 P1.

---

## BATCH 2 — Engagement system trophies (P1)

The new BoS QUESTS subtab (Apr 27 commits b57bfa1, b59cdf2, f2936a3) ships a TROPHY CABINET section. 43 mythic-tier achievements grant trophies. Confirmed via `engagement.js` lines 143 to 417 (43 entries with `tier:'mythic'` and `reward:{type:'trophy'}`).

The agent's earlier audit recommended a TEMPLATE approach instead of 43 unique sculptures. We confirm: ship 8 generic plates first, then 6 hero trophies for the most legendary entries.

### 2A. Eight generic trophy plates (one per category, with 2 visual variants for cabinet variety)

Each plate is a wooden-and-gold plaque silhouette with a tinted central medallion. The engine drops a small icon and earned date on top. 256 x 256 PNG. Cream + gold base; only the accent color shifts per category.

- **`assets/trophies/plate-collection-a.png`** — sage + gold accent (COLLECTION category)
- **`assets/trophies/plate-collection-b.png`** — same template, alt corner ornament for variety
- **`assets/trophies/plate-breeding-a.png`** — chimera red-gold accent
- **`assets/trophies/plate-mastery-a.png`** — deep sage + warm gold
- **`assets/trophies/plate-exploration-a.png`** — copper + warm cream
- **`assets/trophies/plate-hunt-a.png`** — firefly amber
- **`assets/trophies/plate-weather-a.png`** — slate blue + silver
- **`assets/trophies/plate-dedication-a.png`** — cream + warm gold

  - **Concept (all):** A small ornate plaque shape (roughly an inverted shield with floral flourishes top and side) on a transparent background. Empty central medallion sized to hold a 96px icon. Gold trim, small ribbon banner space at the bottom for the trophy name.
  - **In-game:** BoS > QUESTS > TROPHY CABINET grid. Each cell is a plate; engine paints the trophy name on the ribbon.
  - **Style match:** `assets/cards/back-cosmic.png` (ornament density), `assets/menu-frame-v2.png` (gold-on-dark frame voice).
  - **Priority:** P1 (8 files)

### 2B. Six hero trophies (1024 x 1024)

Most legendary mythic-tier achievements. Match `assets/hero-cards/hero-gilding.png` (full-painted hero portrait).

Picks (chosen by lifetime weight, story resonance, and visual distinctness — proposed list, Stephen has final say):

- **`assets/trophies/hero-year-of-lights.png`** — `hnt_all_seasons` "A Year of Lights" — Complete the firefly hunt in all 4 seasons.
  - **Concept:** Four small lanterns floating in a circle, each tinted to a season (pink, gold, copper, ice), with a single white firefly at the center.
- **`assets/trophies/hero-five-years-one-plant.png`** — `wea_five_year` "Five Years of One Plant" — Keep one plant alive 1825 days.
  - **Concept:** A single sturdy plant with five rings carved at its base, one for each year, weathered but thriving.
- **`assets/trophies/hero-thousand-quiet-days.png`** — `ded_login_1000` "A Thousand Quiet Days" — 1000-day login streak.
  - **Concept:** A stack of 1000 small horizon-line drawings stacked vertically, fading from indigo at the top to pale dawn at the bottom; a single keeper silhouette at the foot.
- **`assets/trophies/hero-every-trigger-found.png`** — `dc_bos_trig_all` "Every Trigger Found" — Discover all 480 BoS triggers.
  - **Concept:** An open spellbook with golden bookmark ribbons sprouting from every page edge, light pouring from the gutter.
- **`assets/trophies/hero-ten-thousand-km.png`** — `exp_km_10000` "Ten Thousand Kilometers" — Walk 10,000 km on Wild map.
  - **Concept:** A worn boot, sole-up, surrounded by a horizon of mileposts that curves into the horizon; the curve hints at the planet's size.
- **`assets/trophies/hero-garden-whole.png`** — `dc_completionist_99` "A Garden Whole" — Earn 99% of all lifetime achievements.
  - **Concept:** An overhead view of a completed garden mosaic, with one single empty patch of dark soil left at the center, waiting.

  - **In-game:** Featured on the TROPHY CABINET hero row when earned; appears on player profile.
  - **Style match:** `assets/hero-cards/hero-gilding.png`
  - **Priority:** P1 (6 files)

### 2C. QUESTS subtab section headers

Currently the four sections inside the QUESTS subtab use plain text headers with emoji. Banner art lifts the look.

- **`assets/engagement/daily-header.png`** (480 x 80, transparent PNG) — dawn feel: warm horizon line, three soft sun rays, low-saturation gold and rose. Fits above the TODAY block.
- **`assets/engagement/weekly-header.png`** (480 x 80) — moon feel: seven small moon phases left to right above a long horizon. Fits above the THIS WEEK block.
- **`assets/engagement/achievement-header.png`** (480 x 80) — laurel wreath wrapping a small empty plaque, gold + sage. Fits above the ACHIEVEMENTS block.
- **`assets/engagement/trophy-header.png`** (480 x 80) — display-case feel: an empty wooden shelf with a glass cover suggested by a soft highlight, gold trim. Fits above the TROPHY CABINET block.

  - **In-game:** Strip header above each QUESTS subsection. 480 wide matches a typical phone column.
  - **Style match:** `assets/games/category-banners/header.png` (band style, simplified)
  - **Priority:** P1 (4 files)

**Priority count:** 18 P1 (8 plates + 6 hero + 4 headers).

---

## BATCH 3 — Hut + Hermit (P0)

Per `project_art_needs_apr27.md` already saved. The Hermit's Hut shipped as a working modal but uses placeholder art today.

### btn-hut.png
- **Filename:** `assets/btn-hut.png`
- **Dimensions:** 1024 x 1024 (verified vs `assets/btn-mystery.png` and `assets/btn-sunbeams.png`)
- **Concept:** A small wooden hermit's hut seen from outside on a moonlit hillside, single warm window glowing. Round dark vignette so it sits on any background.
- **In-game:** Middle button on the Greenhouse home button row (currently borrows `btn-mystery.png`).
- **Style match:** `assets/btn-mystery.png`, `assets/btn-weather.png`
- **Priority:** P0

### bg-hut-540x960.jpg
- **Filename:** `assets/bg-hut-540x960.jpg`
- **Dimensions:** 540 x 960 (matches all 5 tab backgrounds; verified vs `bg-game-540x960.jpg`)
- **Concept:** Interior of a wooden hut at night. Warm lamp on a small table, maps and dried herbs hanging on plank walls. Bottom 30% kept dim and uncluttered so UI panels read on top.
- **In-game:** Hermit's Hut modal (almanac, slots, quests). Currently dark scrim with no painting.
- **Style match:** `assets/cinema-beat3-tendril-540x960.jpg` (warm interior FLUX feel) plus `assets/bg-menu-540x960.jpg`
- **Priority:** P0

### Hermit portrait (already shipped)
`assets/hermit-bio.jpg` (500 x 750) is in place at the BoS About tab. NO action needed; included here only so the artist sees the existing voice.

**Priority count:** 2 P0.

---

## BATCH 4 — Class portraits (P1)

Per `project_class_milestone_art_swap.md`: current 5 files in `assets/character-sheet/classes/` are mis-placed milestone art per Stephen. The shelved earlier set is in `_shelved-{class}.png`. Stephen wants dedicated class portraits when he's ready; until then the swap stays.

All 5 are P1 (the screen ships, just with wrong art). Each 1024 x 1024 (verified). Drop the new files in place; the engine auto-picks them up.

- **`assets/character-sheet/classes/forager.png`** — A keeper crouched at the foot of a wild plant, hand reaching for a feral seed. Autumn palette, copper and sage.
- **`assets/character-sheet/classes/breeder.png`** — Two plant stems gently crossing to braid into one new chimera shoot, hands holding pollen brush. Red-gold and cream.
- **`assets/character-sheet/classes/cartographer.png`** — A keeper standing at a hilltop with a compass open, lines of footsteps trailing behind. Copper and slate.
- **`assets/character-sheet/classes/tender.png`** — Wide hands cupping a watering can over a tiny plant, water suspended in motion. Soft blue and sage.
- **`assets/character-sheet/classes/keeper.png`** — A central robed figure under sun rays, five smaller class symbols arrayed around them in a wreath. Cream and warm gold.

  - **In-game:** Class selection screen at L7, character sheet header.
  - **Style match:** `assets/character-sheet/classes/_shelved-forager.png` (the shelved set is the tonal reference)
  - **Priority:** P1 (5 files)

**Priority count:** 5 P1.

---

## BATCH 5 — 96 mementos (B-recommended, A-optional)

`LW_MEMENTOS` at index.html:60854 ships 96 entries, all currently TEXT + EMOJI only. They live in BoS Mementos tab. Each is a small relic awarded after long-term companion bonding.

### Path B (RECOMMENDED — ship first)
Single shared frame the engine wraps around the existing emoji + text.

- **`assets/bos/memento-frame.png`**
- **Dimensions:** 256 x 256
- **Concept:** Cream-velvet display tray with gold edge ornament, empty in the center. The engine drops the existing emoji on top of the empty middle.
- **In-game:** Backdrop card behind every memento entry in BoS Mementos tab.
- **Style match:** `assets/menu-frame-v2.png` (gold trim) sized down
- **Priority:** P1 (1 file)

### Path A (LONG-TERM polish queue, optional)
96 unique relic illustrations at 256 x 256 each, filename convention `assets/bos/memento-{idx}.png` for idx 1 to 96. Massive job; only do this if Stephen wants the BoS Mementos tab to feel like a museum cabinet rather than a list.

If shipping a partial set first, the highest-impact 8 (per the earlier audit) are:
- 23 Glowing Lantern, 24 Pressed Wing, 30 Silk Cocoon, 32 Rain Stone, 33 Cicada Shell, 36 Long Feather, 38 All-Seeing Pearl, 44 Moon Wing.

  - **Priority:** P2 for the full 96; 8 hero mementos at P2-high.

**Priority count:** 1 P1 (frame) + 96 P2 (full set, optional).

---

## BATCH 6 — 200 synergies (B-recommended)

`LW_SYNERGIES` (index.html:10046) ships 200 entries, currently text-only with a theme color. Confirmed 9 unique themes via grep: `blue, botanical, cosmic, dark, elemental, gold, mythical, nature, sage`.

### Path B (RECOMMENDED — ship 9 sigils, reuse across all 200)
One sigil per theme. The engine tints them subtly per-rarity. 128 x 128 each.

- **`assets/synergies/sigil-elemental.png`** — Concept: a triangle with a flame outline inside. Hot red-orange.
- **`assets/synergies/sigil-nature.png`** — Concept: a small triple-leaf trefoil. Sage.
- **`assets/synergies/sigil-cosmic.png`** — Concept: a 6-point starburst inside a circle. Indigo with white star.
- **`assets/synergies/sigil-dark.png`** — Concept: a crescent moon with a small star inside the curve. Deep violet.
- **`assets/synergies/sigil-mythical.png`** — Concept: a stylized phoenix wing outline. Magenta-gold.
- **`assets/synergies/sigil-botanical.png`** — Concept: a cross-section of a curling fern fiddlehead. Soft sage-green.
- **`assets/synergies/sigil-blue.png`** — Concept: a single water-drop with a ripple ring underneath. Steel blue.
- **`assets/synergies/sigil-gold.png`** — Concept: a small sunburst medallion. Warm gold.
- **`assets/synergies/sigil-sage.png`** — Concept: a circle of three small sage leaves. Pale sage.

  - **In-game:** Compendium SYNERGIES tab header tile; Greenhouse plant detail panel synergy chip.
  - **Style match:** `assets/items/foragers-lens.png` (clean transparent-PNG icon energy at 256-class)
  - **Priority:** P1 (9 files)

### Path A (POLISH QUEUE — 200 unique sigils)
200 individual 64 x 64 PNGs. Filename convention `assets/synergies/synergy-{id}.png` for id 1 to 200. Massive ask; defer until everything else lands.

  - **Priority:** P2 (full 200, optional)

**Priority count:** 9 P1 (sigils) + 200 P2 (full set, optional).

---

## BATCH 7 — Items + UI polish (no asks)

Items system is 100% art-shipped. Verified: 19 PNGs in `assets/items/` cover all 17 catalog items + lantern-path + pollen-storm extras. delegateToken art exists; gameplay flag stays `wired:false` until co-op ships.

**No new asks in this batch.**

**Priority count:** 0.

---

## BATCH 8 — Backgrounds + ambient (P0/P2)

Survey of every tab/overlay backdrop. Confirmed shipped:
- `bg-game / bg-greenhouse / bg-nursery / bg-wild / bg-menu` (all 540 x 960)
- `splash-seed / cinema-beat[1-3]-540x960` (onboarding)
- `breed-screen-bg.png`, `feral-challenge-bg.png`
- `hermit-bio.jpg` (BoS About)

### Missing or weak
- **Hut backdrop** — already in Batch 3 above (P0).
- **`assets/bg-bos-quests-540x960.jpg`** — The new BoS QUESTS subtab uses the standard BoS scrim. A dedicated dawn-meets-shelf backdrop (warm wood, gold rim light) would lift it. **P2.**
- **`assets/bg-foraging-540x960.jpg`** — Foraging panel uses inline gradient today. A lichen-and-stone backdrop would seat the puzzle better. **P2.**
- **`assets/bg-hex-inspector-540x960.jpg`** — Hex inspector overlay is dark scrim only. A faint biome backdrop would help. **P2.**

Each above: 540 x 960, jpg, match the 5 existing tab backgrounds for tone (deep blacks, hint of sage, bottom 30% kept clean for UI).

**Priority count:** 0 P0 (hut covered separately), 0 P1, 3 P2.

---

## BATCH 9 — Daily/weekly challenge icons (tag-based system)

Confirmed: 79 daily challenges + 51 weekly challenges in `engagement.js`. Way too many for unique art. Engagement engine does NOT yet ship a tag system — proposing one alongside this art.

### Proposed tag-based icon set (15 generic icons reused across all 130 challenges)

Each 32 x 32 transparent PNG. Filenames map to the most common counter prefixes in the codebase. The engine adds a small line of code mapping each challenge's `counter` field to a tag; the icon then displays beside the challenge text.

- **`assets/engagement/tag-tend.png`** — small watering-can (tend a wild plant)
- **`assets/engagement/tag-water.png`** — single waterdrop (water own plant)
- **`assets/engagement/tag-water-stranger.png`** — waterdrop with two-figure ring (water stranger)
- **`assets/engagement/tag-mass-water.png`** — three waterdrops in a fan (mass water)
- **`assets/engagement/tag-drop.png`** — small pot dropping into ground (drop a wild plant)
- **`assets/engagement/tag-feral.png`** — small seed with question-mark glow (catch feral seed)
- **`assets/engagement/tag-forage.png`** — small leaf with magnifier (foraging puzzle)
- **`assets/engagement/tag-walk.png`** — boot footprint (walk meters)
- **`assets/engagement/tag-mint.png`** — sun with sparkle (mint a plant via Sunbeams)
- **`assets/engagement/tag-breed.png`** — two intertwining stems (breed at nursery)
- **`assets/engagement/tag-game.png`** — small d6 die (play a mini-game)
- **`assets/engagement/tag-box.png`** — small chest (open mystery box)
- **`assets/engagement/tag-compost.png`** — small swirl into soil (compost a plant)
- **`assets/engagement/tag-streak.png`** — flame chain (login or streak)
- **`assets/engagement/tag-discover.png`** — small open eye (discovery, BoS, compendium)

  - **In-game:** Beside every daily and weekly challenge row in the QUESTS subtab.
  - **Style match:** `assets/items/foragers-lens.png` for cleanliness; tone scaled WAY down. Keep silhouettes ultra simple at 32 x 32.
  - **Priority:** P1 (15 files)

**Priority count:** 15 P1.

---

# PRIORITY ORDER FOR ARTIST (top 10 to ship first)

Order of impact on player visibility. Each line lists rationale.

1. **`assets/btn-hut.png`** (1024 x 1024). The Greenhouse home button row is the most-visited screen in the game and the Hut button currently borrows the mystery-box icon. Two players cannot tell them apart. Ship first.
2. **`assets/bg-hut-540x960.jpg`**. The Hermit's Hut is the central late-game shop, almanac, and quests hub. Dark scrim feels unfinished. Painting it sells the world.
3. **6 ultra-rare mutation portraits** (`mutation-constellation, -origami, -stained-glass, -verdigris, -mycelium, -daguerreotype.png`, 655 x 1168 each). Mutations shipped Apr 26 with no portraits. Compendium has 6 empty slots staring at the player.
4. **`assets/bos/memento-frame.png`** (256 x 256). Single frame instantly upgrades the look of all 96 mementos in BoS Mementos tab. Highest leverage per file in the doc.
5. **9 synergy sigils** (`sigil-{elemental, nature, cosmic, dark, mythical, botanical, blue, gold, sage}.png`, 128 x 128). 200 synergies all become illustrated for the cost of 9 PNGs. Compendium SYNERGIES tab transforms.
6. **15 daily/weekly tag icons** (32 x 32 each). The QUESTS subtab is the keeper's daily landing screen; today every row is a wall of text. 15 small icons make it scannable.
7. **8 trophy plates** (256 x 256, one per category with 1 collection variant). The TROPHY CABINET ships totally empty for everyone; even unearned plates as silhouette outlines give the cabinet a shape players want to fill.
8. **4 QUESTS subtab headers** (`daily, weekly, achievement, trophy`, 480 x 80 each). Polishes the section dividers in the most visited new subtab of Apr 27.
9. **6 hero trophies** (1024 x 1024 each). Long-game prestige rewards. Even seeing the locked silhouette gives Stephen's most dedicated keepers a horizon to walk toward.
10. **5 dedicated class portraits** (`forager, breeder, cartographer, keeper, tender.png`, 1024 x 1024). The current images are mis-placed milestone art per Stephen. Players see them at L7 class pick — a meaningful moment.

---

# Counts by priority

- **P0 (broken now):** 2 files (`btn-hut.png`, `bg-hut-540x960.jpg`)
- **P1 (shipped without art):** 6 mutations + 18 trophies/headers + 5 class portraits + 1 memento frame + 9 synergy sigils + 15 challenge tag icons = **54 files**
- **P2 (polish, optional):** 96 unique mementos + 200 unique synergies + 3 minor backgrounds = **299 files**

**Total artwork queue: ~355 PNGs.** First 10 covers ~50 files of those.

If the artist ships the top 10 list above, every visible-but-unfinished screen in Lucid Winds gets a face. The 299 P2 files are pure museum polish that can roll out over months.
