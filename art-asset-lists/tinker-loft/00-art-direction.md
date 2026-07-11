# Tinker Loft — Art Direction

**Game:** `satellites/tinker-loft/index.html` — Amazing Alex style contraption puzzler.
Place parts from a tray, press RUN, honest 120Hz physics runs the machine, and the
player owns exactly ONE mid-flight nudge. 4 modes: Workshop (14 proven benches) /
Daily Contraption / Sandbox / Zen Loft.

**What is art-wireable vs engine-drawn (read first):**
Everything is currently PROCEDURAL CANVAS (see `drawPlank`, `drawDomino`, `drawFan`,
`drawBucket`, `drawSaw`, `drawScissors`, `drawBallSkin`, `drawBasket`, `drawBell`,
`drawBG` in the code). Physics does not care about art, so sprite swaps are safe:
1. **Full-bleed loft backdrops** (one per THEMES entry: attic/blueprint/sunset/copper) —
   drop-in, zero engine changes (draw before everything in `drawBG`).
2. **UI chrome** — tray part cards, RUN/RESET plaques, HUD chips, title art, screens.
3. **Part sprites** — swap each draw* body for a `drawImage` centered on the part
   anchor; rotation transforms already wrap every call site. Flagged PATCH-REQUIRED
   per sheet, one function each, no physics changes.
4. **Goal dressing** (basket, bell, spikes) and FX (pop, ring, nudge ripple) — same
   pattern, PATCH-REQUIRED but tiny.

---

## Style options (pick one; all sheets bake the chosen STYLE block)

### Option A — **Brass & Chalk** (LEAD, RECOMMENDED — non-botanical)
A warm vintage attic workshop out of a patent drawing. Oiled wood, stamped brass,
tin and rope, with chalk-white guide marks scribbled by an inventor. The machines
feel hand-built and a little precious, like a museum of childhood tinkering.
Kid-friendly through warmth and chunky silhouettes, never through babyish faces.
*Reference vibes:* Professor Layton props, Machinarium warmth without the grime,
Aardman contraptions, vintage Meccano box art.
*Palette anchors:* wood #8a5a2e, deep loft #171009, brass #c8a84b, cream #e8dcc8,
chalk #f2ead8, tin blue-gray #6a7480, accent red #c96a5a, glass blue #5b9bd5.

### Option B — **Tin Toy Factory** (non-botanical)
1950s lithographed tin toys: saturated enamel panels, visible rivets, crisp cut
edges, silkscreen wear at the corners. Louder and more colorful than A; parts pop
harder on small screens but the loft loses its cozy hush. Great for the tray icons
even if A leads elsewhere.
*Palette anchors:* enamel red #d84c3a, cream #f4e6c8, teal #3a8a8c, mustard #d8a83a,
tin #9aa0a8 on near-black #14100c.

### Option C — **Blueprint Noir** (non-botanical)
Cyanotype drafting-table fantasy: deep Prussian blue paper, chalk-white ruled
linework, hatched shadows, stamped title blocks. Gorgeous and mature, pairs with
the Midnight Blueprint unlock theme, but a full commit reads cold next to the rest
of the portal, so best as the THEME backdrop sheet only.
*Palette anchors:* paper #0c1526, line #bfe0f2, stamp gold #c8a84b, chalk #f2ead8.

**Recommendation: Option A (Brass & Chalk).** The One Nudge twist needs a world
that feels physical and hand-made, and warm wood plus brass reads instantly at
thumbnail size. Option C ships anyway inside sheet 05 as the blueprint theme.

---

## Cosmetics economy (already live in code — `WARD` array, `tinkerloft_save`)

| Lane | Item | Threshold (from code) |
|---|---|---|
| Hero ball | Brass Classic | free |
| Hero ball | Marble Swirl | clear 5 benches |
| Hero ball | The Eightball | clear 10 benches |
| Hero ball | Meteor Core | clear all 14 |
| Loft theme | Dusty Attic | free |
| Loft theme | Midnight Blueprint | daily streak 3 |
| Loft theme | Sunset Loft | 5 no-nudge stars |
| Loft theme | Copper Workshop | 7 daily wins |
| Ball trail | Chalk Line | free |
| Ball trail | Gold Filament | clear 7 benches |

No lootboxes, no payments. Zen pays 0 sunbeams.

---

## STYLE BLOCK (bake into every sheet prompt — Option A)

> Brass and Chalk style: warm vintage attic workshop game art, hand-built wooden and
> brass contraption parts, chunky readable silhouettes, soft painterly shading with
> crisp edges, chalk-white guide marks, no text, no watermark, flat FF00FF magenta
> background for cutout.

Sheets: 01 contraption parts · 02 hero balls + trails · 03 goals + scenery ·
04 effects · 05 loft theme backdrops · 06 UI chrome.
Every sheet: flat #FF00FF magenta ground, cells annotated with hex sizes, cut via
magenta-KEY-distance (NOT hue) per `reference_cutout_script`.
