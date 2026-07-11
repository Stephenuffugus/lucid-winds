# Loop Warden — Art Direction

**Game:** `satellites/loop-warden/index.html` — idle auto-battler loop (Loop Hero homage).
The warden walks a closed 20-tile loop and fights on his own; the player places terrain
cards, equips looted gear, and picks the moment to retreat. TWIST: the loop is a CLOCK,
quartered into DAWN / NOON / DUSK / NIGHT, and every card behaves differently by quarter.
4 modes: Expedition / Daily Loop / Deep Loop (28 tiles, elites) / Zen Watch.

**What is art-wireable vs engine-drawn (read first):**
The engine draws everything procedurally on canvas (tiles, wedges, shape-coded monsters,
glyph tokens) plus DOM cards in the dock. Pack scope, cheapest first:
1. **Card illustrations** (sheet 02) — the 12 terrain cards are DOM buttons (`.card` in
   `renderHand`); a small background-image per card id is a drop-in, zero engine changes.
2. **UI chrome** (sheet 05) — buttons, chips, hint bar, over/camp/wardrobe screens, title art. Drop-in CSS.
3. **Full-bleed board backdrops** (sheet 04) — draw behind the loop in `render()` before
   `drawWedges()`, one per palette in `PALS` (ember/frost/gloam). One-line patch.
4. *(PATCH-REQUIRED)* token sprites for warden skins, monsters, meadow structures and the
   campfire via `drawImage` in `drawShape` / tile pass — specs in sheets 01/03; flagged so
   nothing here is a dead-end.

---

## Style options (pick one; all sheets bake the chosen STYLE block)

### Option A — **Ember Vigil** (RECOMMENDED, non-botanical)
Cozy dark-fantasy storybook: a night watch told in warm campfire ember light. Deep indigo
and soot-black grounds, characters and structures rimmed in amber glow, brass clockwork
accents for the day-wheel, soft painted texture like a lantern-lit picture book. Catchy and
kid-friendly without being childish — reads "campfire tales", not "nursery". No gardens,
no flowers; the loop is old stone, bone, storm and brass.
*Palette anchors:* #0b0d12 night ground, ember amber #ffb35c, brass #c8a84b, cream #e8dcc8,
dawn rose #e8a0bf, noon gold #f2c94c, dusk copper #d4842a, night blue #5b9bd5.

### Option B — **Clockwork Vellum**
An antique astronomer's chart come to life: aged vellum, ruled brass rings, enamel-ink
suns and moons, engraved monsters like bestiary marginalia. Elegant and distinctive;
slightly cooler emotionally, and small tokens risk reading busy at 15 px.

### Option C — **Gloamwood Relief**
Carved woodblock / linocut fantasy: chunky silhouettes, bold cut lines, ember rim light on
black. Strong and moody; the most masculine look, but monster shape-coding (circle,
triangle, square, pentagon, diamond) must stay louder than the cut texture.

**Recommendation: Option A (Ember Vigil).** It keeps the house midnight-and-gold palette,
makes the clock twist glow (each quarter gets its own light), and stays warm at thumbnail
size. Non-botanical per the standing rule.

---

## Cosmetics economy (already live in code — `WARD` array, `loopwarden_save`)

| Lane | Item | Threshold (from code) |
|---|---|---|
| Warden (token) | Warden | free |
| Warden | Knight | bank 500 supplies lifetime |
| Warden | Ranger | reach Day 8 |
| Warden | Moth Monk | daily streak 3 |
| Loop (palette) | Emberwood | free |
| Loop | Frostmere | bank 1500 supplies lifetime |
| Loop | Gloaming | fell 200 monsters |
| Campfire (flame) | Amber | free |
| Campfire | Sylvan | own every camp upgrade |
| Campfire | Starlight | win 5 dailies |

No lootboxes, no payments. Ids in code stay stable even if display names shift.

---

## STYLE BLOCK (bake into every sheet prompt — Option A)

> Ember Vigil style: cozy dark-fantasy storybook game art, warm campfire ember glow on
> deep indigo night, soft painted texture, amber rim light, brass clockwork accents,
> crisp readable game-asset silhouettes, high contrast, no text, no watermark, flat
> FF00FF magenta background for cutout.

Sheets: 01 warden + monsters · 02 terrain cards · 03 gear + fx · 04 clock board + backdrops · 05 UI.
Every sheet: flat #FF00FF magenta ground, cells annotated with hex sizes, cut via
magenta-KEY-distance (NOT hue) per `reference_cutout_script`.
