# Tarot Run — Sprite-Sheet Asset List (portal art skin)

Game: **Tarot Run** — pocket roguelite deckbuilder, 78-card tarot deck, single-file vanilla HTML PWA. Climb the tower, beat the Crowned Fool.
Loader: `hydrateArt()` in `index.html` scans every `[data-art-slot]` element and swaps `art-slots/{slot_id}.png` over a unicode-glyph placeholder. **Filenames must equal the slot_id exactly** (e.g. `card-wands-1.png`, `enemy-crown.png`, `title-mark.png`). 90 slots, all currently empty. Cut each contact-sheet cell to its slot_id and drop into `art-slots/`.

---

## STYLE (shared — paste with every sheet)

Bright, tactile handmade paper-craft game art, but skinned for a **candlelit velvet tarot-theater** instead of a garden — a late-curtain-call opera house where a deck of hand-made tarot cards is laid out under a single footlight. Deep near-black teal-velvet shadows, saturated jewel suit-colors, antique gold and rose-gold leaf rewards, warm cream parchment highlights, rose accent for the marquee/boss. Fiber-art materials throughout: cut paper, wool felt, macrame cord, glass beads, sequins, gold-leaf foil, glitter, scrapbook layers, stitched/whip-stitched edges, soft handmade texture. Clean readable silhouettes first — one memorable shape per card, centered like a felt medallion. Cozy-menacing enemy portraits (always a half-hidden face, never gory, never grim). Soft top-down key light with a warm gold footlight rim from below. Chunky arcade readability at tiny sizes (cards render ~88px wide in-hand). No photorealism, no 3D render, no anime, no text/numbers/titles/captions/borders/UI words unless a cell explicitly says a logo wordmark.

**Palette note (deliberate portal shift):** this game is NOT the midnight garden, so the paper-craft MATERIALS are kept but the palette is retuned to the game's own theme for cohesion — base shifts from near-black green to **near-black teal velvet #0d2127**; keep antique gold #c8a84b and cream #e8dcc8; the portal rose #e58fa0 reads here as **rose-gold #d4a574** (marquee/Major/boss). Per-suit accent tints below.

**Suit accent tints (felt/paper wash on the cream card):**
- Wands (fire) — vermilion-rose felt #c8443d + brass gold, warm cream ground
- Cups (water) — teal felt #3e7286 + silver bead, cool cream ground
- Swords (air) — silver-grey felt #8b929b + steel-blue thread, pale cream ground
- Pentacles (earth) — sage/forest felt #6a8157 + oxidized-bronze bead, olive cream ground
- Major Arcana — rose-gold #d4a574 + midnight-teal, warm cream with gilt flecks

---

## Sheet 1 — Wands suit (14 cards)
File: `sheet_cards_wands.png` · Grid 7 cols x 2 rows · Cell 512x720 (5:7) · Master 3584x1440
KNOCKOUT: full-bleed art (each card is a cream/vermilion parchment illustration filling its cell), no magenta inside a cell; magenta #FF00FF only in the gutters between cells.
Composition rule for every card cell: hero motif is a centered felt medallion with generous parchment margin (the in-hand view crops to a center band — keep the icon dead-center).

1. card-wands-1 — Ace of Wands: a cloud-hand of cut felt offering one blooming vermilion torch-staff sprouting green paper leaves.
2. card-wands-2 — Two of Wands: felt figure on a castle wall holding a bead-globe and one staff, a second staff stitched into the wall.
3. card-wands-3 — Three of Wands: back-turned figure on a cliff, three planted staves, tiny paper ships on a gold sea.
4. card-wands-4 — Four of Wands: a garland arch of four staves over two celebrating felt figures in golden light.
5. card-wands-5 — Five of Wands: five little felt figures in a friendly mock-battle, staves crossed like macrame.
6. card-wands-6 — Six of Wands: a victor on a white paper horse holding a wreath-crowned staff, attendants below.
7. card-wands-7 — Seven of Wands: a lone figure on high felt ground defending against six staves rising from below.
8. card-wands-8 — Eight of Wands: eight parallel staves streaking across a clear cream sky over a bead river.
9. card-wands-9 — Nine of Wands: a bandaged felt figure leaning on one staff, eight more standing wary behind.
10. card-wands-10 — Ten of Wands: a bent figure hauling a heavy felt bundle of ten staves toward a paper town.
11. card-wands-11 — Page of Wands: a youthful vermilion-clad figure studying one tall flowering staff, desert-cream ground.
12. card-wands-12 — Knight of Wands: armored felt figure on a rearing paper horse, salamander-pattern cape, flowering staff.
13. card-wands-13 — Queen of Wands: throned queen, black felt cat at her feet, sunflower bead in hand, staff in the other.
14. card-wands-14 — King of Wands: throned king in fire-pattern felt robes, a salamander at his feet, flowering staff, calm bearing.

## Sheet 2 — Cups suit (14 cards)
File: `sheet_cards_cups.png` · Grid 7 cols x 2 rows · Cell 512x720 · Master 3584x1440
KNOCKOUT: full-bleed art, magenta #FF00FF only in the gutters. Teal-felt + silver-bead wash, cool cream ground. Centered medallion composition.

1. card-cups-1 — Ace of Cups: cloud-hand of felt holding a chalice overflowing with five silver-thread streams, a paper dove descending.
2. card-cups-2 — Two of Cups: two felt figures exchanging cups beneath a small winged-lion caduceus of gold cord.
3. card-cups-3 — Three of Cups: three felt women raising cups in a toast among paper fruit.
4. card-cups-4 — Four of Cups: a figure under a paper tree refusing a cup offered by a cloud-hand, three cups before them.
5. card-cups-5 — Five of Cups: a black-cloaked felt mourner over three spilled cups, two still standing, a bead river and bridge behind.
6. card-cups-6 — Six of Cups: two children in a garden, one offering a flower-filled cup, six cups arranged around.
7. card-cups-7 — Seven of Cups: a silhouette facing seven cloud-cups, each holding a different tiny felt vision (face, jewels, serpent, castle, dragon, laurel, veiled figure).
8. card-cups-8 — Eight of Cups: a red-cloaked figure walking into felt mountains under a bead moon, eight stacked cups left behind.
9. card-cups-9 — Nine of Cups: a satisfied figure before a blue-draped table, nine cups arrayed behind in a felt arc.
10. card-cups-10 — Ten of Cups: a couple arms upraised under a rainbow of ten cups, two children dancing, a cottage in cut paper.
11. card-cups-11 — Page of Cups: a youth on a felt beach holding a cup with a surprised paper fish emerging.
12. card-cups-12 — Knight of Cups: winged-helm knight on a white paper horse offering a chalice forward over a bead river.
13. card-cups-13 — Queen of Cups: throned queen at the water's edge gazing into an ornate covered reliquary-cup.
14. card-cups-14 — King of Cups: throned king on a stone slab in turbulent bead water, holding a cup steady, a fish leaping behind.

## Sheet 3 — Swords suit (14 cards)
File: `sheet_cards_swords.png` · Grid 7 cols x 2 rows · Cell 512x720 · Master 3584x1440
KNOCKOUT: full-bleed art, magenta #FF00FF only in the gutters. Silver-grey felt + steel-blue thread, pale cream ground, foggy dusk mood. Centered medallion.

1. card-swords-1 — Ace of Swords: cloud-hand gripping an upright felt sword crowned with a gold-cord wreath and palm fronds.
2. card-swords-2 — Two of Swords: blindfolded felt woman by water, two crossed swords over her chest, a bead crescent moon.
3. card-swords-3 — Three of Swords: a red felt heart pierced by three swords against a stormy grey paper sky with rain-thread.
4. card-swords-4 — Four of Swords: a stone effigy of a knight on a tomb, three swords mounted on the wall, one beneath.
5. card-swords-5 — Five of Swords: a smug felt victor gathering three swords, two defeated figures walking off in the distance.
6. card-swords-6 — Six of Swords: a felt boatman ferrying a cloaked figure and child across calm bead water, six upright swords in the boat.
7. card-swords-7 — Seven of Swords: a figure sneaking from a striped paper tent carrying five swords, two left stuck in the ground.
8. card-swords-8 — Eight of Swords: a bound, blindfolded felt woman ringed by eight upright swords in muddy ground.
9. card-swords-9 — Nine of Swords: a figure sitting up in bed, hands over face, nine swords mounted on the wall above.
10. card-swords-10 — Ten of Swords: a figure face-down on a felt shore at dawn, ten swords in the back, dark sky giving way to a gold horizon.
11. card-swords-11 — Page of Swords: a youth on a windy hilltop holding a sword aloft, paper hair streaming, glancing back.
12. card-swords-12 — Knight of Swords: an armored knight on a charging paper horse, sword forward, scarves and birds whipping behind.
13. card-swords-13 — Queen of Swords: throned queen in profile, sword vertical, severe but composed, bead butterflies on her crown.
14. card-swords-14 — King of Swords: throned king holding a sword diagonally up, eyes forward, felt butterflies on the throne back.

## Sheet 4 — Pentacles suit (14 cards)
File: `sheet_cards_pents.png` · Grid 7 cols x 2 rows · Cell 512x720 · Master 3584x1440
KNOCKOUT: full-bleed art, magenta #FF00FF only in the gutters. Sage/forest felt + oxidized-bronze bead, olive cream ground. Centered medallion.

1. card-pents-1 — Ace of Pentacles: cloud-hand holding one golden felt pentacle over a garden archway to bronze mountains.
2. card-pents-2 — Two of Pentacles: a juggler balancing two pentacles in an infinity ribbon of cord, two paper ships on waves behind.
3. card-pents-3 — Three of Pentacles: a stonemason on scaffolding addressed by two patrons, three pentacles carved into felt stone above.
4. card-pents-4 — Four of Pentacles: a miser hugging one pentacle, two under his feet, one balanced on his crown.
5. card-pents-5 — Five of Pentacles: two beggars (one on crutches) in paper snow past a lit stained-glass window with five pentacles.
6. card-pents-6 — Six of Pentacles: a merchant weighing bead-coins on scales, giving alms to two kneeling felt beggars.
7. card-pents-7 — Seven of Pentacles: a farmer leaning on a hoe eyeing a leafy paper plant with seven pentacles growing on it.
8. card-pents-8 — Eight of Pentacles: an apprentice chiseling pentacle medallions, seven finished ones displayed on the felt wall.
9. card-pents-9 — Nine of Pentacles: an elegant woman in an embroidered robe in a vineyard, a hooded felt falcon on her glove, nine pentacles in the vines.
10. card-pents-10 — Ten of Pentacles: an old patriarch with two white paper hounds, family under an arch, ten pentacles laid out like a Tree of Life.
11. card-pents-11 — Page of Pentacles: a youth in a flowering felt field gazing at a single pentacle held aloft in both hands.
12. card-pents-12 — Knight of Pentacles: armored knight still on a sturdy black paper horse in a plowed field, examining a pentacle.
13. card-pents-13 — Queen of Pentacles: throned queen in a flower-canopy holding a pentacle in her lap, a felt rabbit at her feet.
14. card-pents-14 — King of Pentacles: throned king in vine-embroidered robes, golden felt bulls flanking the throne, pentacle on his knee.

## Sheet 5 — Major Arcana (22 cards)
File: `sheet_cards_major.png` · Grid 6 cols x 4 rows (24 cells; cells 23 & 24 empty = solid magenta) · Cell 512x720 · Master 3072x2880
KNOCKOUT: full-bleed art, magenta #FF00FF only in the gutters (and filling the 2 unused cells). Rose-gold + midnight-teal + gilt-fleck cream — the marquee tier, richest layering, most gold-leaf and sequins. Centered medallion.

1. card-major-0 — The Fool: a young felt figure stepping off a sunlit cliff, white paper rose in hand, a small white dog at heel, bright dawn sky.
2. card-major-1 — The Magician: a robed figure at an altar bearing wand/cup/sword/pentacle, one hand up one down, a gold-cord infinity sign overhead.
3. card-major-2 — The High Priestess: a veiled felt woman between a black and a white pillar, bead crescent at her feet, a half-hidden scroll.
4. card-major-3 — The Empress: a crowned woman haloed by twelve bead-stars on a velvet throne in a wheat field, scepter in hand.
5. card-major-4 — The Emperor: a stone-throned king in ram-horn felt armor holding an ankh scepter, paper mountains behind, stern profile.
6. card-major-5 — The Hierophant: a robed pope-figure between two pillars blessing two kneeling acolytes, crossed gold keys at his feet.
7. card-major-6 — The Lovers: two felt figures in a garden beneath a winged angel with arms raised, a gold sun behind the angel.
8. card-major-7 — The Chariot: an armored figure in a stone chariot drawn by a black and a white paper sphinx, starry canopy above.
9. card-major-8 — Strength: a white-robed woman gently closing a felt lion's jaws, gold-cord infinity overhead, soft sunset.
10. card-major-9 — The Hermit: a grey-robed felt hermit on a peak raising a lantern with a six-point bead star, staff in the other hand.
11. card-major-10 — Wheel of Fortune: an ornate paper wheel ringed by four winged creatures with books, a sphinx with a sword atop.
12. card-major-11 — Justice: a crowned figure between pillars, sword raised vertical, bead scales in the left hand, eyes forward.
13. card-major-12 — The Hanged Man: a felt figure hanging by one ankle from a T-tree, gold halo, serene, hands behind the back.
14. card-major-13 — Death: a skeletal knight in black felt armor on a white paper horse over a fallen field, sun setting between two towers.
15. card-major-14 — Temperance: a winged felt angel pouring bead-water between two chalices, one foot on land one in water, sunrise behind.
16. card-major-15 — The Devil: a horned baphomet on a black plinth, two lightly chained felt figures at its feet, an inverted star above (cozy-menacing, never scary).
17. card-major-16 — The Tower: a felt tower struck by yellow gold-foil lightning, crown blasted off, two small falling figures, stormy paper sky.
18. card-major-17 — The Star: a kneeling felt figure at a pool pouring water from two vessels, one large eight-point bead star, seven small stars.
19. card-major-18 — The Moon: a full bead moon dripping gold tears between two towers, a wolf and dog howling, a paper crayfish rising from a pool.
20. card-major-19 — The Sun: a laughing child on a white paper horse with a red felt banner, sunflowers behind, a big smiling gold sun.
21. card-major-20 — Judgement: a felt angel blowing a trumpet from a cloud, souls rising from open coffins, hands raised in awe.
22. card-major-21 — The World: a dancing felt figure inside a green paper laurel wreath, the four creatures at the corners.
23. (empty — solid magenta cell)
24. (empty — solid magenta cell)

## Sheet 6 — Enemies, gallery portraits (10)
File: `sheet_enemies.png` · Grid 5 cols x 2 rows · Cell 512x512 (1:1) · Master 2560x1024
KNOCKOUT: full-bleed art (each portrait carries its own deep-teal-velvet backdrop and fills the cell), magenta #FF00FF only in the gutters.
Style: cozy-menacing felt/paper baroque portraits in a haunted gallery; **face always half-hidden** (horror conceit), one memorable feature each, warm footlight rim from below. Never gory.

1. enemy-spectre — The Spectre: a pale translucent felt figure half-emerging from velvet curtains, no clear face, smoke-thread fingers.
2. enemy-jackal — Brass Jackal: a bronze jackal-headed automaton in a tailored Victorian felt coat, head tilted listening, glowing seam-bead lights.
3. enemy-echoman — The Echo-Man: a pale motley figure with two faint duplicate paper silhouettes overlapping him, triple-exposure look.
4. enemy-duelist — The Suit-Duelist: an elegant felt duelist in waistcoat, two long swords crossed before him, masked face turned, gold cords on the collar.
5. enemy-reflection — The Reflection: a human shape built of rough broken mirror-foil shards, each shard reflecting a different tiny scene.
6. enemy-sleeper — The Sleeper: a pale androgynous figure floating in soft paper mist, eyes closed, gold thread wound around wrists and throat.
7. enemy-gilded — The Gilded Idol: a massive seated bronze felt statue draped in red silk, gilt-leafed face, hollow eyes, palms up.
8. enemy-archivist — The Archivist: an elderly spectacled figure in dusty robes ringed by floating paper sheaves, ink-stained felt hands.
9. enemy-twins — The Reversed Twins: two identical pale felt figures in black suits, one upright one upside-down, sharing a single crown.
10. enemy-oracle — The Bound Oracle: a blindfolded felt woman in flowing white wrapped in dark macrame cords, mouth open mid-prophecy.

## Sheet 7 — Boss: The Crowned Fool (1)
File: `sheet_boss_crown.png` · Grid 1 col x 1 row · Cell 768x768 (1:1) · Master 768x768
KNOCKOUT: full-bleed art (deep-teal velvet stage backdrop fills the cell), magenta #FF00FF only in the surrounding gutter/margin.
The marquee image — most polished, richest fiber-craft, rose-gold accents.

1. enemy-crown — The Crowned Fool: a full-figure felt jester in motley robes on a footlit velvet stage, wearing a heavy gold crown that is clearly too large, eyes closed, faint knowing smile — cozy-menacing, regal, never grim.

## Sheet 8 — Title mark + app icons (1 authored + 2 derived)
File: `sheet_title.png` · Grid 1 col x 1 row · Cell 768x768 (square seal) · Master 768x768
KNOCKOUT: cutout sheet — flat magenta #FF00FF background in the cell for knockout, no magenta inside the artwork (the seal is object-fit:contain inside a CSS gold-ring circle, so it must float on transparency).

1. title-mark — a central ritual seal: a 9-pointed rose-gold star with the four suit glyphs (wand N, cup E, sword S, pentacle W) at compass points, Art-Nouveau felt-filigree and gold-cord scrollwork, symmetrical, no text/wordmark. Keep the design inside a centered safe-zone (icons crop tighter).

Derived (do NOT author separately — export from title-mark): `icon-192.png` (192x192) and `icon-512.png` (512x512), the seal on a solid #0d2127 teal square with a 40px inset safe-zone so iOS maskable cropping never clips it.

---

## WIRE NOTES
- Loader: `hydrateArt()` (index.html ~line 4741) reads `data-art-slot` and loads `art-slots/{slot_id}.png`, dropping an `<img>` over the unicode placeholder. Render hooks: `renderHand`, `renderMap`, `renderCodex` all call it. **No code edits required** — filenames just have to equal the slot_id.
- Card art element `.card-art` (CSS ~line 776) is `object-fit:cover`, ~88px wide x 56px tall in-hand and 132px in the inspect view — it **center-crops** the 5:7 source both ways. That is why every card cell above uses a centered-medallion composition: keep the hero motif in the middle ~512x512 band or it gets cropped off in-hand.
- Enemy portrait `.enemy-portrait` (CSS ~line 456, set in code ~line 3837 as `enemy-{id}`) is `object-fit:cover` on a 175px rounded square — full-bleed 1:1, art carries its own velvet backdrop.
- Title mark `.title-mark img` (CSS ~line 126) is `object-fit:contain` inside a CSS-drawn gold-ring circle with its own radial glow — author as a transparent cutout seal so the CSS ring/glow shows behind it.
- Card `data-art-slot` is emitted at index.html ~line 3729 as `card-${card.id}`; card ids live in `data/cards.json` (suits `wands|cups|swords|pents`, `major`). Enemy ids in `data/enemies.json`. Slot list of record: `ASSET_MANIFEST.json`.
- Recommended asset folder: **`art-slots/`** (the drop dir the loader and `manifest.json` PWA icons already point at). Cut every contact-sheet cell to `art-slots/<slot_id>.png`, ≤150KB each (flat paper-craft + limited palette compresses easily at these sizes). MVP ship order if generating in waves: `title-mark` + icons, then the 22 Majors, then `enemy-crown`, then the 4 Aces, then the remaining enemies, then the rest of the minors.
