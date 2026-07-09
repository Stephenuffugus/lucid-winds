# Petal Slice — Art Pack

> Draw one glowing line, harvest a real bloom — the swipe you keep.

**Genre:** One-stroke slice / combo arcade (Fruit Ninja revival) with a graft-to-mint collection meta, set in the Lucid Winds midnight garden

_The game already ships and plays procedurally — this art is an optional visual upgrade **and** the cosmetics library that powers the in-game customization economy._

## Pick a look

### 1. Moonlit Cozy
*Soft painterly gouache, fully rounded silhouettes, gentle bloom glow, almost no hard edges. Pods read like plush felt fruit under moonlight. Warmest, most childlike, lowest contrast.*

Safest cozy read and fastest to produce, but risks looking flat next to the portal's more finished satellites — the pods can feel like colored dots rather than objects you want to slice.

### 2. Lantern Glass (recommended)
*Cozy core with a light layer of craft: pods and berries get a soft gel/glass top-highlight and a thin gold rim-light like they're lit by a hanging lantern; blossoms have faint translucent petal edges (moth-wing); bench wood is painterly with visible warm grain. Deep-black garden, sage + gold accents, one candy-pink hero. Kid-friendly, never spiky or scary, but clearly premium and sliceable.*

Best fit: keeps the midnight-garden family palette and the cozy promise while giving each object real volume and a satisfying 'cut me' surface. The rim-light and highlight double as free readability at speed, and the glassy sheen makes the two-halves split and nectar splatter pop — exactly the juice the design leans on.

### 3. Storybook Ink
*Confident dark-ink linework over gouache fills, richer contrast, slightly graphic leaf/petal shapes. The most 'grown', closest to an illustrated botanical field-guide.*

Most distinctive identity and great for marketing stills, but the ink outlines fight the soft glow FX and the fast physics-split halves, and it reads a touch mature/serious for the cozy Zen-Garden decompress promise. Hold in reserve for key art, not the in-game sprites.

**Recommended: Lantern Glass — it protects the cozy, kid-safe midnight-garden promise while giving every sliceable object the volume, rim-light and glassy sheen that make the one-stroke cut feel juicy and readable at speed. It sits a clear notch above the game's current flat procedural circles without ever tipping into spiky or mature, and its translucent-petal / lantern-glow language extends naturally into the FX, backdrops and the whole cosmetics economy..** Sheets here use this look; swap the STYLE line to try another.

## Sheets (generate each separately)

- `01-petalslice-objects.md` — Sliceable Objects + Sliced Halves + Burr
- `02-petalslice-fx.md` — FX — Blade Trails, Graft Glow, Splatter, Bloom Finish
- `03-petalslice-backdrops-seasons.md` — Season Potting-Bench Backdrops (full-bleed)
- `04-petalslice-ui.md` — UI / HUD — Icons, Petals, Meters, Buttons
- `05-petalslice-cosmetics.md` — Cosmetics & Customization Library (economy) — 💰 COSMETICS / ECONOMY

## Cosmetics economy

Two lanes, no loot boxes, nothing that touches hit-detection or scoring — cosmetics are look-only. FREE MASTERY LANE (default, already half-wired): blade skins unlock at best-Grove nectar thresholds exactly as the code does today (Vine 0, Nectar 1500, Rose 4000, Frostvine 9000, Aurora 16000) and the six new blades extend that ladder (Ember Willow / Moonsilver / Honeydrip / Koi Ribbon / Starwisp at rising nectar bests). Pod-skin sets and splatter packs unlock from cumulative GRAFTS WOVEN milestones (e.g. 10 / 25 / 60 / 120 grafts), so playing the collection meta is what dresses the game. SOFT-COIN LANE (optional, cozy): the game already earns 'nectar' as score — surface a small 'Nectar' wallet and a quiet potting-shed shop where extra backdrops and splatter packs can be bought for nectar you've banked; every item shows its exact price or unlock condition up front, so it's a store, never a gamble. SEASONAL ROTATION: the 4-season art is free variety for everyone; on top, one seasonal backdrop thumb + one seasonal splatter rotate quarterly and are earnable that season only (mirrors 'seasonal graft-blooms only harvestable in-season'), giving a reason to return each quarter without FOMO pressure — they cycle back. COMPANION BENCH PALS come only from weekly graft-milestone streaks (Firefly is the flagship), matching the retention spec: they buff your DAILY SUNBEAM TRICKLE, not your score. SUNBEAM/COLLECTION META: Daily Bloom streak pays the growing Sunbeam bonus and a chance at the seasonal companion; Sunbeam earn stays capped (12/run, 30/day) so cosmetics feed the Lucid Winds collection economy without inflating it. Kid-safe guardrails: no purchase with real money inside the game, no boxes, no randomized paid pulls, no pay-to-win — the fanciest Aurora blade cuts exactly like the free Vine.

## Style block

```
STYLE: "Lantern Glass" — Lucid Winds midnight-garden, cozy-but-crafted, kid-friendly, never spiky or scary. Soft painterly gouache forms with a light gel/glass top-highlight and a thin warm-gold rim-light, as if lit by a hanging garden lantern; blossom petal edges faintly translucent like moth-wing. Rounded readable silhouettes, gentle bloom glow, soft contact shadow. Botanical, hand-made, calm night mood — NOT neon, NOT flat vector, NOT chibi-cartoon, NO harsh outlines except where noted. Core palette: night ground #0d100c / #0a0d08, sage #7ab356, deep leaf #3f6b34, gold #c8a84b, cream #e8dcc8, muted sage-grey #8a9178, dark rim #2a331f, hero candy-pink #e58fa0, warning red #e5604d. Object accents: red-berry #e5604d core #7a1f16, violet-berry #b57de0 core #5a3d78, blue-berry #5b9bd5 core #274867, green pod #7ab356 core #3f6b34, pink blossom #e58fa0 core #c96f82, gold blossom #e8c65a core #8a6d1e. Lighting from upper-left, moon-cool with warm gold kiss on rims. Consistent scale, centered, generous even padding, art fills ~78% of each cell. NO text, NO labels, NO watermarks, NO drop-shadow onto the magenta. Deliver crisp at native size; each cut asset must compress under 150KB PNG.
```

## Wire notes

Drop everything in /satellites/petal-slice/assets/ and gate behind an ART_ON flag so the procedural draws stay the fallback (art replaces draws only when the sheet loads, same pattern as the LW ART hook). Map: petalslice_objects.png → drawObj() (whole berries/pods/blossoms cells 1-6, burr cells 19-20, bonus/graft-node pods 21-22) and drawHalf() (left-half row 13 verb… cells 7-12 left, 13-18 right — pick side by h.side); seed cluster 23 + nectar droplet 24 feed juice() particles. petalslice_fx.png → drawBlade() (trail segments row 1 keyed by G.blades.id, leaves row 2 for the leaf decals), the graft connector + pulsing nodes block in render() (row 3 cells 13-16), graft slow-mo swirl/Bloom-Finish flash (cells 17-18, the G.flash draw), the splats loop (row 4, choose color by season/skin), and the parts/float punctuation (row 5). petalslice_backdrops_seasons.png → replaces the gradient + bench-plank fillRect backdrop in render(); select cell by G.season, blit once as the base layer. petalslice_ui.png → HUD draws (petals cells 1-2 swap the 🌸/🥀 emoji, timer ring 14, combo badge 13, best rosette 15, mode icons for the menu buttons) and the DOM menu (button plates 19-20, toggle knob 21, lock/check 23-24, blade preview cards). petalslice_cosmetics.png → the Blades screen picker tiles (blade-row cards) plus the new shop/equip grid for backdrops, pod-skins, splatter and companion pals; these are preview tiles, the live blade trail still renders from the fx sheet. All cut cells knockout magenta→alpha with the existing cutout script; backdrops slice on the magenta gutters, upscale each ≤1600px wide, keep every asset <150KB; bump a _SVG_CACHE_VER / ?v= query on the sheet URLs when art changes so the Hostinger resizer/cache serve fresh.
