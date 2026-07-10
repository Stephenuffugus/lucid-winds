# Tempo Grove — Art Pack

> Sun and moon quads fall while a golden sweepline crosses the field on the beat of Stephen's own soundtrack, clearing every square you have grown and dropping petals into the garden border.

**Genre:** Beat-synced falling-block puzzle (Lumines lineage). 16x10 field, two cell kinds (Sun and Moon), same-kind 2x2s mark as squares, the sweepline erases them on the bar. Signature **Bloom Squares**: every cleared square drops a petal into a living garden border framing the field; four squares in one sweep is a Grove Burst; a full border presses a keepsake into the Grove.

_The game already ships and plays procedurally (`satellites/tempo-grove/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game wardrobe economy._

## Pick a look

### 1. Moonlit Metronome  ← RECOMMENDED
*Art-deco music-hall marquetry: every tile a lacquered wood inlay piece with brass edging, the Sun cells warm gilt-and-amber inlay with a solid brass dot, the Moon cells deep indigo lacquer with a hollow mother-of-pearl diamond, the sweepline a polished brass pendulum arm trailing warm light, the garden border a carved walnut frame that petals slowly fill like an inlaid vine.* The deco music-hall fiction ties the beat and the garden together in one object; tiles read instantly at 30px; brass-on-lacquer sits a clear tier above the procedural draw while staying inside the midnight-garden palette. **All sheets below bake this in.**

### 2. Stained Glasshouse (alt, more luminous)
*Leadlight glass tiles lit from behind, lead came seams, the sweepline a passing lantern.* Gorgeous glow but the busy came lines can muddy 2x2 square reads at speed.

### 3. Vinyl Grove (alt, more retro)
*Riso-print record-sleeve grain, halftone suns and moons, the sweepline a tonearm.* Charming and bold, but the halftone fights the marked-square highlight and reads flat next to the other satellites.

## Sheets (generate each separately)

- `01-tempogrove-cells.md` — Cells & Field — sun/moon tiles, marked states, ghost, sweepline
- `02-tempogrove-garden.md` — Garden Border & Keepsakes — petals, frames, keepsake blooms — 💰 COSMETICS / ECONOMY
- `03-tempogrove-backgrounds.md` — Era Backdrops & Screens — Full-Bleed Portrait
- `04-tempogrove-ui.md` — UI / HUD — buttons, chips, icons, track drawer
- `05-tempogrove-fx.md` — FX & Feedback — clear bursts, Grove Burst, petal drift, trails

## Cosmetics economy

All Tempo Grove cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, no pay-to-win, nothing that changes gravity, sweep timing, or scoring. Every unlock is a KNOWN item at a KNOWN threshold, shown plainly in the Wardrobe. THREE free mastery lanes matching the shipped `tempogrove_save` wardrobe: (1) **Cell sets** — Classic Grove free, Bloom Glyphs at 150 lifetime squares, Lantern Light for 6 squares in one sweep, Prisma at a 3 day Daily streak. (2) **Garden borders** — Meadow free, Night Garden at 300 lifetime squares, Gilded Trellis at 10 pressed keepsakes. (3) **Sweep trails** — Comet free, Petal Drift at 500 lifetime squares, Aurora at a 7 day Daily streak. The keepsake Grove (border fills → pressed bloom) is the native collection wall, Sunbeams follow the portal standard (30/day, cap 12/run via `_sbCapEarn`, Zen pays 0), and the soundtrack itself is the free flex: Stephen's originals plus the public domain classical library, swappable mid-run.

## Style block

```
STYLE — "Moonlit Metronome" (Tempo Grove / Lucid Winds deco music-hall marquetry). Lacquered wood inlay and brass edging: every subject built as flat marquetry pieces with thin brass outlines and a soft lacquer sheen, lit like a night concert hall — warm brass lamplight from the sweep side, cool moonlight elsewhere. Crisp FLAT fills with subtle wood grain (NO photoreal render, NO glossy 3D, NO harsh black keylines); shapes must read instantly at 30px tile size. Deep-night palette — void #0d100c and #05070a; walnut #3a2a18 and #241a10; foliage sage #7ab356 over deep #3f6b34; brass/gold #c8a84b with hot highlight #ffe9a8 and cream #e8dcc8; SUN tile amber #c8a84b/#e2b34d family with a SOLID brass dot glyph; MOON tile indigo #3d478f/#5b6bd5 family with a HOLLOW mother-of-pearl diamond glyph (the two kinds must be distinguishable by GLYPH SHAPE alone, never color alone — hard colorblind requirement); muted moss #8a9178, dusk line #2a331f, luminous dew #bfe0f2, accent rose #e58fa0, violet #b57de0. Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons are pictographic only). Each PNG must compress under 150KB. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural draws in `/workspaces/lucid-winds/satellites/tempo-grove/index.html`; keep the canvas fallbacks as absent-asset safety nets. Asset folder: `/workspaces/lucid-winds/satellites/tempo-grove/assets/` (subfolders: `cells/`, `garden/`, `backgrounds/`, `ui/`, `fx/`). Path-version every file (`?v=LW_VERSION`) per the Hostinger resizer rule; ship only the <150KB cut cells. Map: `tempogrove_cells.png` → `drawCellPx()` (sun/moon base + marked overlay + glyphs, one column per wardrobe skin: classic/bloomglyph/lantern/prisma), the ghost outline, and the sweepline head/trail in `render()`. `tempogrove_garden.png` → the border frame + petal sprites in `render()` (keyed by `PROG.garden`: meadow/nightgarden/gilded) and `drawKeepsake()` bloom species. `tempogrove_bg.png` → the `ERAS` gradient pairs (era backdrops), `#wrap`/`#stage` background, and the `.screen` title/over/wardrobe panels. `tempogrove_ui.png` → `.btn`/`.chip` plates, HUD glyphs (home, pause, music note), toggle knobs, track-drawer row icons. `tempogrove_fx.png` → `G.fx` petal particles, clear flash, Grove Burst bloom, sweep trails (comet/petaldrift/aurora). Bump the asset cache version on any art change.
