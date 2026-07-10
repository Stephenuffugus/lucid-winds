# Dew Snip — Art Pack

> Snip the moonlit vines, let a bead of dew swing free, thread it through three nectar glints into the waiting sprout — and grow a keepsake flower every time.

**Genre:** Physics rope-cutter (Cut the Rope lineage) with a native plant-collection meta. Swipe to snip vines, the dew swings on its pendulum arc through nectar and into the sprout; tap pollen-bellows to steer it across gaps and over thorns. Signature **Nectar Lineage**: every delivered dew blooms a one-of-a-kind keepsake flower into a persistent Grove.

_The game already ships and plays procedurally (`satellites/dew-snip/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game customization economy._

## Pick a look

### 1. Paper Nocturne  ← LOCKED / RECOMMENDED
*Layered cut-paper botanical art: every subject built from 3–5 stacked flat paper layers in bold clean silhouettes, with a soft backlit rim-glow leaking between the layers as if lit from behind by moonlight, plus a faint warm dew-light from below. Crisp flat fills, gentle paper grain, a subtle shadow between layers for depth.*

Reads instantly at thumbnail size (critical — the portal card and the mid-swing gameplay both need to parse in a glance), gives Dew Snip a distinct, modern identity so it doesn't read as a Cut the Rope port, and the "light leaking between paper layers" fiction literally IS the dew-glow and nectar-bloom of the game. Silhouettes separate hazards by shape, not just color (colorblind-safe). Sits natively in the Lucid Winds midnight-garden palette while looking a clear tier above the procedural placeholder. **This is the Director's pick; all sheets below bake it in.**

### 2. Moonlit Storybook (alt, cozier)
*Soft painterly gouache night-garden, rounded felt shapes, warm firefly bokeh, bedtime-picture-book grain.* Maximum warmth, but reads a touch flat next to the polished satellites and fine hazards can blur at gameplay scale.

### 3. Botanical Naturalist (alt, more mature)
*Field-guide realism — accurate leaves, real dewdrop refraction, muted naturalist palette.* Elegant and grown-up, but heavier per-asset and less instantly readable at thumbnail size than the papercut.

## Sheets (generate each separately)

- `01-dewsnip-sprites.md` — Core Gameplay Sprites — dewdrop, vines, nectar, thorns, bellows, sprout
- `02-dewsnip-blooms.md` — Keepsake Blooms & Skins — Grove flowers + dew/vine/bellows cosmetics — 💰 COSMETICS / ECONOMY
- `03-dewsnip-backgrounds.md` — Backgrounds & Screens — Full-Bleed Portrait
- `04-dewsnip-ui.md` — UI / HUD — buttons, icons, plaques, cards
- `05-dewsnip-fx.md` — FX & Feedback — snip burst, dew-trail, bloom flash, particles

## Cosmetics economy

All Dew Snip cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, no pay-to-win, nothing that changes a bed's hitboxes or solution. Everything is a KNOWN unlock at a KNOWN threshold so a kid always sees exactly what they're working toward. THREE free mastery lanes: (1) **Bed mastery** — dew skins unlock at rising beds-cleared / three-star counts (classic dew at 0, amber at 5 beds, rose at 10, prism as the all-15-three-star capstone). (2) **Grove mastery** — the keepsake bloom SPECIES roster and vine/leaf styles unlock by lifetime blooms grown (e.g. a new flower silhouette every 5 blooms, braided-vine style at 20, lantern-vine at 50), so the reward loop that grows the Grove also dresses up the tools that fill it. (3) **Daily/seasonal mastery** — the four seasonal bed backdrops + a seasonal bellows skin unlock and ROTATE with the real-world season and the Daily Dew streak (7/30/100-day milestone blooms), giving lapsed-friendly reasons to return. Optional soft-coin: the portal's existing DEW (never Sunbeams — Sunbeams stay the earn/collection currency) can OPTIONALLY early-unlock the CURRENT season's rotating cosmetic a little ahead of the streak gate, or re-unlock a past-season skin out of rotation — purely convenience, capped to the rotating set, every item still fully earnable free by playing. Feeding the meta: delivered dews keep growing keepsake Grove blooms (the native collection source), Sunbeams follow the portal standard (30/day, cap 12/run via `_sbCapEarn`), and the cosmetic catalog gives a second non-gambling collection wall that rewards showing up daily over grinding one long session.

## Style block

```
STYLE — "Paper Nocturne" (Dew Snip / Lucid Winds midnight-garden papercraft). Layered cut-paper botanical art: every subject built from 3-5 stacked flat paper layers in bold clean silhouettes, with a soft backlit rim-glow leaking between the layers as if lit from behind by moonlight, plus a faint warm dew-light from below. Crisp FLAT fills (NO photoreal gradients, NO glossy 3D render, NO harsh black keylines), gentle paper grain and a subtle soft shadow between stacked layers for depth; shapes must read instantly at thumbnail size. Consistent flat front-on / slight-top diorama camera, every subject centered and upright in its cell with a small soft baked contact shadow beneath (except cutout pieces where the shadow is noted separately so the engine can layer them). Deep-night palette — void #0d100c and #05070a; foliage sage #7ab356 over deep #3f6b34 with mid #5c8f3f; lantern gold #c8a84b, bloom-highlight #ffe9a8, cream #e8dcc8; muted moss #8a9178, dusk line #2a331f; luminous dew #bfe0f2 over moon-blue #5b9bd5 and deep #2b567c; accent rose #e58fa0, thorn plum #7d3450 with warning-tip #e56b6b, warm bark #8a5a2b / #5c3a1a, seed-green #6f9040, soft violet #b57de0. Season tints — spring rose #E8A0BF, summer gold #D4A843, autumn copper #D4842A, winter ice #A0C4E8. Lighting is nocturnal: paper edges catch a thin cream/gold rim-glow, dew and nectar emit a soft radial bloom, everything else stays low-key and moody. Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons are pictographic only). Each PNG must compress under 150KB — flat fills and tight palettes make this easy. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural draws in `/workspaces/lucid-winds/satellites/dew-snip/index.html`; keep the canvas fallbacks as absent-asset safety nets. Asset folder: `/workspaces/lucid-winds/satellites/dew-snip/assets/` (subfolders: `sprites/`, `blooms/`, `backgrounds/`, `ui/`, `fx/`). Path-version every file (`?v=LW_VERSION`) per the Hostinger resizer rule; ship only the <150KB cut cells, keep master sheets out of the live web path. Map: `dewsnip_sprites.png` → `drawDrop()` (dewdrop), `drawVine()`/`drawAnchor()` (vine + anchor + cut stub), the nectar mote gradient in `render()`, `drawThorn()`, `drawPuff()` (idle+fire), `drawTarget()` (open bud + bloomed states). `dewsnip_blooms.png` → `drawBloom()` species set (Grove + results celebration) keyed by seed, plus equipped dew/vine/bellows skin ids. `dewsnip_bg.png` → `#wrap`/`#stage` background, the `render()` bg gradient + ambient fireflies, and the `.screen` title/results/grove panels, tinted per season. `dewsnip_ui.png` → `.btn`/`.btn.primary` plates, the mode-button icons, the on-canvas `hudBtn()` menu/retry glyphs, the nectar dots + `✿` star readout, the `.toggle` knob, and the `.lvlcard`/grove-card frames. `dewsnip_fx.png` → `burst()`/`float()` particles, the dew `trail` render, the `slice` swipe trail, the win `flash`, and the snip/thorn/puff bursts. Bump the asset cache version on any art change.
