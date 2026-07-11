# Mosaic Draft — Art Direction

**Game:** `satellites/mosaic-draft/index.html` — Azul homage tile drafter, you versus one AI rival.
Draft shards from kiln plates, fill pattern rows, fire them onto a 5x5 wall. Signature twist:
the **Kiln Glaze** — one glinting glazed shard per round that scores DOUBLE if its row fires
this round, or CRACKS to your floor if it does not.
4 modes: Duel Ladder / Daily Kiln (solo seeded) / Kiln Rush (3 glazes) / Zen Studio.

**What is art-wireable vs engine-drawn (read first):**
The engine draws every tile, plate, and board procedurally on canvas (see `drawTile()`,
`drawGhost()`, `render()`); each shard kind pairs a color with its own SYMBOL glyph
(triangle/circle/square/star/cross) for colorblind safety — any art MUST keep those glyphs.
Wire-in scope, cheapest first:
1. **Full-bleed backdrops** — one per studio theme in `THEMES` (workshop/nightkiln/alabaster/emberstudio). Drop-in: draw before the panels in `render()`.
2. **UI chrome** — title crest, mode buttons, HUD chips, over/wardrobe/ladder screens, rival portraits.
3. **Shard sprites** — swap `drawTile()` fills for PNGs per kind × tileset (PATCH-REQUIRED: `drawImage` keyed by kind+tileset; glyphs stay baked into the sprite).
4. **Board furniture** — factory plates, wall frame, floor strip (PATCH-REQUIRED, draw under tiles).

---

## Style options (pick one; all sheets bake the chosen STYLE block)

### Option A — **Kiln & Lacquer** (LEAD, RECOMMENDED — non-botanical)
A warm ceramicist's studio at night: fired terracotta, glazed porcelain shards with real
depth, lacquered walnut trays, brass pin fittings, soft candle-amber rim light. Feels like
handling museum pottery — tactile, catchy, kid-friendly without being childish, and zero
garden anywhere. The glaze twist reads perfectly: wet gold glaze catching light vs a dry
matte crack.
*Palette anchors:* walnut #1b1512 base, brass #c8a84b, cobalt #3f6db5, amber #d1a23c,
jade #5e9e58, garnet #b8524e, pearl #ddd6c6.

### Option B — **Byzantine Starlight** (non-botanical)
Midnight mosaic hall: gold-leaf tesserae, deep lapis grout, torchlit stone. Grander and
moodier; shards read as ancient treasure. Slightly heavier and riskier for small-tile clarity.

### Option C — **Paper Souk**
Cut-paper bazaar look: layered card stock shards with visible paper edges and stitched
trays. Charming and light, but softer contrast could fight the glaze glint readability.

**Recommendation: Option A (Kiln & Lacquer).** It matches the fiction (a kiln fires your
wall), keeps tiny 36-44px tiles crisp, and the wet-glaze-vs-crack story IS the twist.

---

## Cosmetics economy (already live in code — `COSM`, `mosaicdraft_save`)

| Lane | Item | Threshold (from code) |
|---|---|---|
| Tile set | Terracotta | free |
| Tile set | Azure Porcelain | win 3 duels |
| Tile set | Gilded Kiln | beat the Master |
| Tile set | Moonstone | daily streak 3 |
| Studio theme | Workshop | free |
| Studio theme | Night Kiln | win 10 duels |
| Studio theme | Alabaster Court | score 80 in one game |
| Studio theme | Ember Studio | finish 5 dailies |
| Glaze glint | Sunspark | free |
| Glaze glint | Prism | fire 10 glaze doubles |

No lootboxes, no payments. Ids in code stay stable; display names debatable pre-art.

---

## STYLE BLOCK (bake into every sheet prompt — Option A)

> Kiln and Lacquer style: warm handcrafted ceramic game art, fired clay and glazed
> porcelain with soft candle-amber rim light, lacquered walnut wood and brass fittings,
> rich matte darks, painterly but crisp game-asset silhouettes, no text, no watermark,
> flat FF00FF magenta background for cutout.

Sheets: 01 shards+states · 02 board furniture · 03 fx · 04 backdrops · 05 UI.
Every sheet: flat #FF00FF magenta ground, cells annotated with hex sizes, cut via
magenta-KEY-distance (NOT hue) per `reference_cutout_script`.
