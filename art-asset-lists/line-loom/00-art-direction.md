# Line Loom — Art Pack

> Stations wake across a midnight valley. Draw threads between them, let the shuttles carry every traveler home, and never let a platform overflow.

**Genre:** Mini Metro style transit puzzle (single-file HTML5 canvas, 540×960 portrait). Stations spawn over time, each with a SHAPE (circle / triangle / square / star / heart / hex); travelers queue at stations showing the shape they want; the player drags colored **threads** (up to 6 lines) between stations and auto-assigned shuttles ping-pong along them. A river crosses the map and threads cross only on scarce **bridges**. Every in-game week the player picks one of two gifts (thread / shuttle / baskets / bridge). Signature twist: **Bloom Junctions** — a connected station served cleanly for a full week blooms (bigger platform, bonus deliveries, gold halo), and blooming all six shapes in one run mints a keepsake to the Grove. Colorblind is native: destinations are SHAPES, and every line has its own dash pattern plus a numbered chip, never color alone.

_The game already ships and plays procedurally (`satellites/line-loom/index.html`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game customization economy. Station positions, hit radii, shape silhouettes, dash patterns and all rules are IDENTICAL across every theme; only the skin changes._

## Pick a look — theme direction

⚖️ **Director note:** no forced botanical look. The mechanic is a transit diagram; the reskin can leave the garden entirely. Three directions below, one tactile-cozy, one mature-minimal, one papercraft, with a recommendation.

### 1. Woven Atlas ⭐ RECOMMENDED (tactile, kid-friendly, true to the name)
*An embroidered map. The valley is deep midnight linen with a faint woven weft; threads are real stitched YARN with visible twist and tiny entry knots; stations are embroidered patches and buttons; the river is a band of blue running-stitch water; shuttles are little wooden bobbins, beetle buttons, folded paper moths and paper boats sliding along the yarn. Bloomed stations grow a small embroidered flower ring.*

**Why this one:** it makes the game's name literal and ownable — this is LINE LOOM, not a Mini Metro clone with new colors. It keeps the locked midnight palette (linen reads as the existing `#0b0f0b` void, so integration costs almost nothing and the bright thread colors still pop). Yarn texture makes the six dash patterns even MORE distinct (solid twist, running stitch, dotted french knots…), which strengthens the colorblind promise instead of fighting it. Warm, handmade, instantly screenshot-different from every transit game on a portal card.

### 2. Night Transit (alt, mature-minimal)
*The classic metro-diagram look, polished: glass-glow lines on a near-black map, stations as crisp signage discs, a soft vignette, tasteful bloom on interchanges.* Premium and closest to the original's famous minimalism, but it is also the least distinctive — it reads as "another Mini Metro" on a thumbnail, and glow-heavy lines risk muddying the dash-pattern identity rule.

### 3. Paper Valley (alt, cozy papercraft)
*A cut-paper diorama: torn-paper river, sticker stations, washi-tape threads, cardboard shuttles with drop shadows.* Charming and kid-magnetic, but paper layers demand soft shadows everywhere (heavier assets), and washi-tape lines read wider than the 5px engine strokes, which would fight station spacing on small screens.

**Recommendation: Woven Atlas.** It owns the name, keeps the dark base for free, strengthens (never weakens) the shape-and-dash colorblind language, and is the most distinctive card in the portal. Hold Night Transit as a premium unlockable backdrop later; borrow Paper Valley's boat for the Paper Boat shuttle skin, which is already in the cosmetics catalog.

## Sheets (generate each separately)

- `01-lineloom-stations.md` — Station patches: the six embroidered shape stations + warn ring / bloom halo / queue glyph states
- `02-lineloom-shuttles.md` — Shuttles and threads: the four shuttle skins, yarn thread caps, bridge planks, drag ghost
- `03-lineloom-backgrounds.md` — Backdrops: Night Loom / Parchment / Blueprint full-bleed linen maps + river band
- `04-lineloom-ui.md` — UI: line chips, unweave scissors, weekly gift card icons, buttons, pause plate
- `05-lineloom-fx.md` — FX: bloom burst, delivery sparkle, overflow warning, keepsake mint flash
- `06-lineloom-cosmetics.md` — Thread palettes + shuttle skins + backdrop cards — 💰 COSMETICS / ECONOMY

## Cosmetics economy

Every Line Loom cosmetic is earned by **PLAYING** — no loot boxes, no randomized purchases, nothing that changes station spawns, hit radii, dash patterns or rules. Every unlock is a **KNOWN threshold shown on its locked wardrobe card**. Three earn faucets, all already persisted in `lineloom_save`:

- **Thread palettes** (`PROG.pal`, `PALS{}` in code, six colors each, dash patterns never change): *Loom Classic* (starter, free) → **Meadow Threads** (deliver **300** lifetime travelers) → **Neon Night** (deliver **1000**) → **Royal Silks** (survive **8 weeks** in one run, `PROG.bestWeeks`).
- **Shuttle skins** (`PROG.shuttle`, `SHUTS{}`): *Dew Drop* (free) → **Button Beetle** (deliver **500**) → **Paper Moth** (survive **5 weeks** in one run) → **Paper Boat** (**3 day** Daily Weave streak, `PROG.streak`).
- **Backdrops** (`PROG.bg`, `BGS{}`): *Night Loom* (free) → **Parchment** (deliver **1500**) → **Blueprint** (**5 day** Daily Weave streak).

Faucets: lifetime deliveries (`PROG.delivered`), best weeks survived (`PROG.bestWeeks`), and the Daily Weave streak (`PROG.streak`) — the lapsed-friendly return loop. The **Grove keepsakes** (`PROG.grove`, minted by blooming all six shapes in one run, drawn by `drawKeepsake` line ~889) are trophies, not purchases. Sunbeams stay the earn currency only (`_sbCapEarn`, key `sw_sb_lineloom`, 30/day cap, 12/run via score payout).

## Style block

```
STYLE — "Woven Atlas" (Line Loom / Sky Wolf Studios embroidered transit puzzle). A hand-stitched night map: deep midnight linen with a faint woven weft, bright embroidered yarn threads, button-and-patch stations, tiny wooden and paper shuttles. Tactile, warm, handmade; chunky rounded silhouettes, nothing sharp or clinical. Every subject reads by SHAPE first, color second (colorblind requirement — the six station marks are circle / triangle / square / star / heart / hex and MUST stay unmistakable by silhouette alone; the six thread styles differ by STITCH PATTERN, not only color). Consistent flat top-down map camera, subjects centered and upright in their cells. Palette (the game's real hexes — keep them): midnight linen #0b0f0b and #0d100c, weft grid #131a11, hedge line #2a331f; cream stitch #e8dcc8, muted moss #8a9178; thread yarns gold #c8a84b, moon-blue #5b9bd5, rose #e58fa0, sage #7ab356, violet #a468d8, teal #3fb6a8; river night-water #101c29 with stitch edge #1d3a52; bloom gold #c8a84b + hot bloom #ffe9a8; warning ember #e56b6b; parchment alt #e2d7ba with ink #221f18; blueprint alt #0e2237 with pale ink #cfe4f5. Lighting: soft even craft-table light, one gentle top-left sheen on buttons and bobbins, subtle thread shadow, deep calm falloff at map edges. Rendering: soft cel with visible fabric grain and stitch detail, NO photoreal, NO glow blowout, NO text / letters / numbers / logos / watermarks baked into any art (numbers and labels are drawn by the engine). Each PNG must compress under 150KB — tight palette and flat fills make this easy. Per-sheet knockout / layout rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural canvas draws in `/workspaces/lucid-winds/satellites/line-loom/index.html`; keep every existing canvas fallback as an absent-asset safety net (gate each blit behind an image-loaded check). DOM copy and emoji (🧵 🚆 🧺 🌉, chip numbers, button labels) are owned by code and stay as-is; this art reskins the **canvas-drawn** map and provides screen backdrops. Asset folder: `/workspaces/lucid-winds/satellites/line-loom/assets/` (subfolders `stations/`, `shuttles/`, `bg/`, `ui/`, `fx/`, `cosmetics/`). Path-version every file (`?v=BUILD`) per the Hostinger resizer rule; ship only the <150KB cut cells. Map:

- `ll_stations.png` → the station draw block in `render()` (lines ~684-703: `drawShapePath` shape marks line ~606, warn ring arc ~681, bloom halo + petal dots ~672-679, queue glyphs ~695). Engine tints queue glyphs; patches replace the stroked shapes 1:1 at the same 12px radius footprint.
- `ll_shuttles.png` → the shuttle skin block in `render()` (lines ~705-737: dew capsule, beetle, moth, boat) plus thread end-caps for the numbered disc at line heads (~656), the drag ghost dash (~663-669), and the bridge plank at `riverCrossX` crossings (~651-655).
- `ll_bg.png` set → full-bleed 540×960 backdrops behind the canvas map for the three `BGS` themes (`render()` background + weft dots, lines ~630-639) and the river band along `riverY(x)` (~296, drawn ~640-645); plus title / results screen washes.
- `ll_ui.png` → the six line chips (`renderChips` ~754, dash previews), UNWEAVE scissors button, weekly gift card plates (`showWeekly` ~487, `.wcard`), `.btn` plates, pause and over screen cards.
- `ll_fx.png` → bloom burst moment, delivery sparkle, overflow ring flash, keepsake mint flash, toast plate.
- `ll_cosmetics.png` → wardrobe previews (`renderWard` ~826): four palette swatch plates, four shuttle skins at wardrobe scale, three backdrop cards, plus the Grove keepsake flower dressing (`drawKeepsake` ~889).

Bump the asset cache version on any art change and cache-bust `img.src` with `?v=BUILD`.
