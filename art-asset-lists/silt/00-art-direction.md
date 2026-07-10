# Silt — Art Pack

> Paint sand, water, soil and seed into a glass world, watch it fall, flow, burn and bloom — and keep the garden's pulse beating.

**Genre:** Falling-sand cellular-automata garden (Powder Toy / sandspiel lineage) with a gardening win-state. 12 elements on a 135×196 grid at chunky 4px pixels; water soaks soil, seeds sprout vines, vines tip into blooms, fire eats and mist rains back off stone ceilings. Signature **Garden Pulse + Trials**: a live meter scores the living garden, 12 satchel-budget trials pose garden problems (every one machine-proven winnable), and five simultaneous blooms press keepsake flowers into a persistent Grove.

_The game already ships and plays procedurally (`satellites/silt/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game wardrobe economy._

**The sand itself stays procedural.** The falling grains ARE the game — 4px cells colored straight from the live `PALS` palettes, and no sheet here replaces them. This pack dresses everything AROUND the simulation: the vessel that frames it, the shelf world behind it, the dock chips and buttons, the keepsakes, the wardrobe pieces.

## Pick a look

### 1. Terrarium Nocturne  ← RECOMMENDED
*The simulation is a living specimen kept in a thick hand-blown glass terrarium on a midnight keeper's shelf. Painted matte-gouache surround: aged cedar shelf, brass fittings and lantern-light from one side, cool moon-dew light from the other, glass edges catching thin cream and gold rims. Chunky readable silhouettes that sit comfortably NEXT to chunky pixels.*

The pixel grains become the jewel and the painted vessel exists to frame them — the contrast is the identity, so the sim never has to apologize for being pixel art. The three FRAME cosmetics already in the live wardrobe (Slate / Cedar / Gilded) map literally onto vessel materials, the four palettes read as different specimen moods behind the same glass, and the whole thing sits natively in the Lucid Winds midnight-garden world. Cozy but grown-up.

### 2. Field Notebook (alt, cozier)
*A naturalist's pressed-flower journal: warm paper grain, botanical ink sketches in the margins, linen-tape UI plates, the sim sitting in a rectangular "specimen window" cut into the page.* Very warm and personal, but paper-white surfaces fight the deep-night palette, and fine ink detail muddies at 4px-neighbor scale.

### 3. Obsidian Apothecary (alt, more mature)
*A dark alchemical workbench: carved black stone, engraved brass instruments, faintly glowing reagent vials — the seven paintable elements presented as apothecary reagents.* Moody and striking, but colder than the garden fiction, and risks reading "potion game" instead of "living garden."

## Sheets (generate each separately)

- `01-silt-backdrops.md` — Backdrops & Screens — full-bleed portrait shelf scenes + palette moods
- `02-silt-ui.md` — UI / HUD — dock chips, element icons, buttons, pulse meter, goal pill
- `03-silt-cosmetics.md` — Wardrobe pieces — vessel frames, brush cursors, palette tokens — 💰 COSMETICS / ECONOMY
- `04-silt-keepsakes.md` — Grove keepsakes — pressed-bloom species set + celebration
- `05-silt-title-fx.md` — Emblem, screens chrome & FX — motes, sparks, toast/confirm plates, trial glyphs

## Cosmetics economy

All Silt cosmetics are earned by PLAYING — no loot boxes, no dice, no pay-to-win, nothing that changes the simulation rules or trial budgets. Every wardrobe gate below is LIVE IN CODE today (`WARD` array + `renderWard()`), a known unlock at a known threshold. Three mastery lanes: (1) **Trial mastery** unlocks the world PALETTES — Earthen free, Nocturne at 3 trials cleared, Ember Glass at 8, Prisma at all 12 (`trialsDone()`); palettes recolor the entire simulation via the live `PALS` table, so they are the most visible flex in the game. (2) **Lifetime bloom mastery** unlocks tools and frames — Trowel brush at 30 blooms grown, Cedar frame at 100 blooms (`PROG.blooms` counts every bloom ever tipped, across all modes). (3) **Ritual mastery** rewards showing up and finishing gardens — Dragonfly brush at a 3-day Daily streak (`PROG.streak`), Gilded frame at 15 gardens counted = 5 keepsakes pressed (`PROG.gardens`, every 3rd garden mints via `mintKeepsake()`). No coin store in v1 — the wardrobe screen literally says "Every piece is earned by playing. No boxes, no dice." Keep it that way; if a soft-coin convenience is ever added it must follow the Dew Snip pattern (Dew only, current-season convenience, everything still earnable free). Sunbeams stay the separate earn currency (`sw_sb_silt`, 30/day, 12/run): sustained Garden Pulse ≥50 pays 1/25s, first trial clears pay 2, the Daily pays 3, Zen pays 0.

## Style block

```
STYLE — "Terrarium Nocturne" (Silt / Lucid Winds midnight-garden). A living falling-sand garden kept as a specimen in a thick hand-blown glass terrarium on a midnight keeper's shelf: painted matte-gouache surfaces, aged cedar and warm brass fittings, lantern-gold light from one side and cool moon-dew light from the other, glass edges catching thin cream/gold rim highlights, deep botanical shadow everywhere else. FLAT painterly fills with gentle grain (NO photoreal render, NO glossy plastic, NO harsh black keylines), bold chunky silhouettes that sit comfortably beside CHUNKY 4px PIXEL sand — the simulation stays procedural pixel art and the painted vessel exists to frame it; never paint imitation sand grains into these assets. Palette: void #0d100c and #05070a; sage #7ab356 over deep #3f6b34; lantern gold #c8a84b, warm glow #ffe9a8, cream #e8dcc8; muted moss #8a9178, dusk line #2a331f; dew/water #bfe0f2 over moon-blue #5b9bd5; silt gold #c8a84b family; soil umber #5e4228 with wet #3a281a; seed-rose #e58fa0; fire ember #f08c32; mist silver #becdd7; oil plum-black #342c3c; stone slate #4a4c52; brass #b08d3e; cedar bark #6d4a2a; violet accent #a468d8; amber #e2b34d. Element-mood tints for palette variants — Nocturne cool blue-violet cast, Ember Glass warm amber-copper cast, Prisma saturated jewel cast. Lighting is nocturnal and low-key; glow is contained and soft. Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons are pictographic only). Each PNG must compress under 150KB — flat fills and tight palettes make this easy. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in around the procedural sim in `/workspaces/lucid-winds/satellites/silt/index.html`; keep every canvas/emoji fallback as an absent-asset safety net. Asset folder: `/satellites/silt/assets/` (subfolders `backdrops/`, `ui/`, `cosmetics/`, `keepsakes/`, `fx/`). Path-version every file (`?v=<BUILD>`) per the Hostinger resizer rule; ship only the cut <150KB cells, keep master sheets out of the live web path. KEY ENGINE FACT for backdrops: `render()` writes alpha 255 into every cell including EMPTY (bg color from `pal().bg`), so the sim canvas is fully opaque — to let a backdrop show through the air, change the empty-cell write to alpha 0 (`d[o+3]=el===E.EMPTY?0:255` around line 643) and let `#stage`/CSS show `backdrops/` behind `canvas#game`; otherwise backdrop art frames the canvas (title, dock, screens) without touching the engine. `frame` and `brushSkin` wardrobe keys are STORED AND EQUIPPABLE but not yet consumed by any draw path (palette IS consumed via `pal()`): wiring frames = a new absolutely-positioned border layer around `canvas#game` swapped by `PROG.frame`; wiring brushes = a pointer-following cursor ghost swapped by `PROG.brushSkin`. Map: `01` → `#s-title` background, `#stage` surround, `.screen` panel washes; `02` → `.chip` plates + the `ICONS` emoji map in `renderDock()` (line ~653), `.btn`/`.btn.primary`, `#goalchip`, `#pulsebar`/`#pulsefill`, `#hud-back`/`#hud-pause`; `03` → `PROG.frame` border layer, `PROG.brushSkin` cursor, `WARD` card icons in `renderWard()`; `04` → `drawKeepsake()` replacement keyed by keepsake seed (5-hue table at line ~426), `.grovecard` 84px canvas + mat; `05` → title emblem above `.title-word` (the SILT wordmark itself stays engine text — no text in art), `#toast`/`#confirm .box` plates, `.lvlcard` frames + ✿ done glyph, ambient mote/mist/ember FX layered over `#wrap`. Bump the `?v=` stamp on any art change.
