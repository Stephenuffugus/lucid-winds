# Frost Watch — Art Direction

**Game:** `satellites/frost-watch/index.html` — Missile Command homage. A sleeping winter town,
3 braziers with limited embers per wave, falling frost shards (4 shapes), tap-to-send warmth
bursts that bloom into melting rings. TWIST = the Thaw Meadow: ground segments kept safe thaw
green wave over wave and raise the score multiplier; one strike refreezes the segment.
4 modes: Long Watch (endless) / Daily Watch (seeded, 10 waves) / Blitz (90s) / Zen Watch (no fail, pays 0).

**What is art-wireable vs engine-drawn (read first):**
The game draws everything as PROCEDURAL CANVAS VECTORS (see `render()`, `drawShard()` in the
code). Drop-in scope with zero engine changes:
1. **Full-bleed sky backdrop** (drawn before hills in `render()` — one image, 540x700).
2. **UI chrome** — HUD chips, mode buttons, title art, over/wardrobe screens.
3. **Ground/meadow tiles** — the 45px segment columns and 16px thaw rows are simple rects;
   tiling strips are drop-in with a tiny `drawImage` patch.
4. *(PATCH-REQUIRED)* sprite swaps for shards / houses / braziers / rings via `drawImage`
   inside `drawShard()` and the house/brazier loops — spec included per sheet, flagged so
   nothing here is a dead end.

**Colorblind law (carries into art):** every shard type must stay shape-distinct at 30px:
straight = slim kite, splitter = barbed chevron with fork mark, seeker = comma with curl tail,
glacier = fat hexagon (plus visible crack state). Never encode type by hue alone.

---

## Style options (pick one; all sheets bake the chosen STYLE block)

### Option A — **Midnight Vigil** (LEAD, RECOMMENDED — non-botanical)
Storybook paper-cut winter night: layered matte flat shapes with the faintest paper grain,
deep indigo midnight sky, crisp faceted ice-crystal geometry, and warm amber firelight as the
only heat in the frame. Cozy but composed — a quiet town holding the line, not a cute
Christmas card. Kid-friendly, never childish. The ice-versus-ember color duel IS the game's
readability, so the style leans on it hard.
*Palette anchors:* night #0a0e18, ice #bfe0f2, glacier #7fa8d8, lavender #c9b8f0,
ember #ffb347, gold #ffd98a, meadow #6fa84e, cream #e8dcc8.
*Reference vibes:* Alto's Odyssey nights, Röki's northern folk calm, classic paper-cut
storybook plates, the hush of Firewatch dusk (in flat shapes).

### Option B — **Ember Cabinet Arcade**
Straight retro-arcade vector homage: glowing tracer lines on near-black, phosphor trails,
Missile Command heritage worn proudly. Icy cyan shard lasers versus ember orange counterfire.
Punchier, more nostalgic, less warm; overlaps Nova Bloom's Vector Nova look, so only pick
if we want the two paired as an "arcade wing."
*Palette anchors:* #05070d base, cyan #9ee6ff, blue #5b9bd5, hot orange #ff8a5c, gold #ffd76a.

### Option C — **Nordic Woodblock**
Folk woodcut/linocut print: chunky carved shapes, visible ink texture, 5-ink limited palette,
snow as untouched paper. Distinctive and handsome, but texture fights small falling sprites
in motion and it is the most expensive to keep consistent across sheets.
*Palette anchors:* paper #e8e0d0, indigo ink #1d2a44, ice ink #7fa8c8, ember ink #d97b3f, pine #3f6b50.

**Recommendation: Option A (Midnight Vigil).** Best silhouette readability for a game about
identifying falling shapes fast, the warm-versus-cold palette does gameplay work, and it is
catchy without a single leaf or garden in sight.

---

## Cosmetics economy (already live in code — `WARD` array, `frostwatch_save`)

| Lane | Item | Threshold (from code) |
|---|---|---|
| Brazier flame | Hearth | free |
| Brazier flame | Sapphire Flame | survive 25 waves lifetime |
| Brazier flame | Solar Flare | daily streak 3 |
| Town | Timber Town | free |
| Town | Lantern Village | score 4,000 |
| Town | Starlight Hamlet | win 3 dailies |
| Warm ring | Warm Glow | free |
| Warm ring | Petal Ring | melt 300 shards lifetime |
| Warm ring | Aurora Ring | reach wave 10 |

No lootboxes, no payments. Ids in code stay stable even if display names shift.

---

## STYLE BLOCK (bake into every sheet prompt — Option A)

> Midnight Vigil style: storybook paper-cut winter night art, layered matte flat shapes with
> subtle paper grain, deep indigo midnight tones, crisp faceted ice-crystal geometry, warm
> amber firelight accents with soft glow, clean bold silhouettes, cozy but composed, no text,
> no watermark, crisp game-asset edges, flat FF00FF magenta background for cutout.

Sheets: 01 frost shards · 02 warmth fx · 03 town + braziers · 04 backdrops + meadow · 05 UI.
Every sheet: flat #FF00FF magenta ground, cells annotated with hex sizes, cut via
magenta-KEY-distance (NOT hue) per `reference_cutout_script`.
