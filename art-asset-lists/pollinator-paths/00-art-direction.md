# Pollinator Paths — Art Pack

> Every wing needs a way home. Draw glowing flight paths for bees, butterflies and hummingbirds, keep their wings from ever meeting, and steer two species through a drifting blossom ring to spark a cross-pollination bloom.

**Genre:** Path-drawing traffic control (Flight Control lineage) in a night meadow. Three species with three path styles (solid, dashed, dotted — line identity is never color alone), three silhouette flower pads, drifting blossom rings, a bouquet meter that presses keepsake flowers into a persistent Grove.

_The game already ships and plays procedurally (`satellites/pollinator-paths/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game customization economy._

## Pick a look

### 1. Nocturne Flightchart  ← RECOMMENDED
*Vintage night-navigation chart meets pressed-specimen plates: the meadow is deep chart-paper darkness with faint survey ticks and constellation pricks; pollinators are fine ink-and-gold engraved specimens with luminous painted wing accents; drawn routes are glowing ribbon lines with tiny compass arrowheads; pads are engraved rosette medallions like chart stamps.*

The game IS about drawing routes, so a cartographic language makes the core verb the hero: every line reads as a charted flight. Engraved hatching gives each species a distinct texture (stripes, scale-stipple, sleek gloss) on top of silhouette — a third colorblind channel beyond shape and dash pattern. Sits in the Lucid Winds midnight palette, looks a clear tier above the procedural vectors, and no other satellite uses a chart/atlas-engraving look at the sprite level. **All sheets below bake this in.**

### 2. Velvet Aviary (alt, softer)
*Plush painterly night-garden, moth-wing dust, bokeh fireflies, soft felt shapes.* Warmest option, but path ribbons and small fliers can blur together at gameplay speed.

### 3. Firefly Airfield (alt, more toylike)
*Tiny night airfield fiction — pads as landing beacons, fliers with little aviator goggles, runway dashes.* Charming and legible, but leans younger than the Director wants as a default and fights the botanical fiction.

## Sheets (generate each separately)

- `01-pollinatorpaths-fliers.md` — The three pollinators, all flight states + liveries
- `02-pollinatorpaths-pads-rings.md` — Flower pads, blossom rings, landing states
- `03-pollinatorpaths-backgrounds.md` — Meadow backdrops (4 cosmetic skies) + title — Full-Bleed Portrait
- `04-pollinatorpaths-ui.md` — UI / HUD — buttons, hearts, bouquet, cards
- `05-pollinatorpaths-fx.md` — FX — route ribbons, bursts, daze puff, landing glow
- `06-pollinatorpaths-cosmetics.md` — Ink ribbons, liveries, keepsake bloom set — 💰 COSMETICS / ECONOMY

## Cosmetics economy

All Pollinator Paths cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, no pay-to-win, nothing that changes speeds, radii or spawn tables. Every item is a KNOWN unlock at a KNOWN threshold (shown in the Wardrobe before it unlocks). THREE free mastery lanes, exactly as wired in the shipped save: (1) **Landing mastery** — path inks and liveries unlock at lifetime landings (Gold Thread at 25, Ivory Wing livery at 50, Prisma Ink at 100, Dusk Ember backdrop at 300). (2) **Cross-pollination mastery** — the twist feeds the wardrobe: Rose Ribbon ink at 10 crosses, Star Meadow backdrop at 40; every 6 crosses also presses a keepsake bloom into the Grove, so the same skill grows the collection. (3) **Daily streak mastery** — Dawn Haze backdrop at a 3-day streak, Aurora livery at 7. Sunbeams follow the portal standard (30/day, cap 12/run via `_sbCapEarn`, Zen pays zero) and stay the earn currency only — cosmetics never touch them. Optional future soft-coin convenience (portal Dew) may early-unlock ONE current seasonal backdrop, never a livery or ink, and everything stays fully earnable free.

## Style block

```
STYLE — "Nocturne Flightchart" (Pollinator Paths / Lucid Winds midnight-meadow chartwork). Vintage night-navigation chart meets pressed-specimen engraving: subjects rendered as fine ink-and-gold engraved plates with luminous painted accents, on deep chart-paper darkness. Crisp engraved linework and hatching for texture (species differ by hatch pattern as well as silhouette), FLAT luminous fills for glowing elements (NO photoreal gradients, NO glossy 3D render, NO harsh cartoon outlines), faint survey ticks and constellation pricks allowed only where a sheet asks for them. Shapes must read instantly at thumbnail size. Consistent flat top-down-ish chart camera, every subject centered and upright in its cell, no ground shadows unless a cell says so (fliers are airborne). Deep-night palette — void #0d100c and #05070a; foliage sage #7ab356 over deep #3f6b34 with mid #5c8f3f; lantern gold #c8a84b, highlight #ffe9a8, cream #e8dcc8; muted moss #8a9178, dusk line #2a331f; luminous dew #bfe0f2 over moon-blue #5b9bd5; accent rose #e58fa0, violet #b57de0; ember #d4842a; ice #a0c4e8. Lighting is nocturnal: engraved edges catch thin cream/gold rims, routes and rings emit soft contained glows, everything else stays low-key chart-dark. Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons are pictographic only). Each PNG must compress under 150KB — flat fills, fine lines and tight palettes make this easy. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural draws in `/workspaces/lucid-winds/satellites/pollinator-paths/index.html`; keep the canvas fallbacks as absent-asset safety nets. Asset folder: `/workspaces/lucid-winds/satellites/pollinator-paths/assets/` (subfolders: `fliers/`, `pads/`, `backgrounds/`, `ui/`, `fx/`, `cosmetics/`). Path-version every file (`?v=LW_VERSION`) per the Hostinger resizer rule; ship only the <150KB cut cells, keep master sheets out of the live web path. Map: `pollinatorpaths_fliers.png` → `drawGlyph()`/`drawPoll()` (bee/butterfly/hummingbird flying frames, dazed, landing shrink) keyed by kind + equipped livery id from `LIVERIES`. `pollinatorpaths_pads.png` → `drawPad()` (three pad medallions, matching the SPEC dash identity) + the ring render in `render()` (idle, cooldown, burst). `pollinatorpaths_bg.png` → the `render()` background gradient + seeded meadow tufts, keyed by `BACKDROPS` id, plus the title screen panel. `pollinatorpaths_ui.png` → `.btn`/`.btn.primary` plates, HUD chips (`#hudmid`, hearts, bouquet), `.wardcard`/`.grovecard` frames, toggles. `pollinatorpaths_fx.png` → path ribbon texture + arrowhead (path stroke in `render()`), `addBurst()` particles (landing sage, collision rose, ring burst), the willLand end-glow pulse, daze spiral. `pollinatorpaths_cosmetics.png` → `INKS` ribbon swatches, `LIVERIES` flier variants, `drawKeepsake()` bloom species for the Grove. Bump the asset cache version on any art change.
