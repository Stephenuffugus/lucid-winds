# Berry Vine — Art Pack

> A crawling chain of glowing orbs winds toward the burrow — fire from the center pod, match three, and set off a cascade before the chain curls home.

**Genre:** Zuma / Luxor marble-shooter (single-file HTML5 canvas, 540×960 portrait). A chain of colored orbs crawls a curving path toward a burrow; a center pod shooter inserts orbs into the chain; matching **3+** of the same bursts them and touching ends **cascade**. Signature assists: **Dew Swap** (tap the reserve to swap your next orb) and a chargeable **Pollen Burst** (repaints an orb and its neighbors to your color). Every orb reads by **SHAPE and color** (circle / heart / star / teardrop / diamond / hex) so it is clear for colorblind players.

_The game already ships and plays procedurally (`satellites/berry-vine/index.html`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game customization economy. Mechanics, path layout, hitboxes and the six shape-cues are IDENTICAL across every theme below; only the skin changes._

## Pick a look — theme direction

⚖️ **Director note (this session):** move AWAY from the forced botanical look. The mechanic is a marble-shooter, not a garden, so the reskin is free to leave the orchard behind. Below are three theme directions — one bold non-botanical, one cozy, one mature-neutral — with a recommendation.

### 1. Starberry Cosmos ⭐ RECOMMENDED (bold, kid-friendly, non-botanical)
*A cozy-cosmic arcade. The marbles are glossy glowing **star-berry orbs** — little fruits of light — crawling a **stardust comet-trail** that winds into a friendly swirling **wormhole**. The shooter is a chunky, huggable **launch pod** at center. Rounded, bright, luminous shapes over a calm deep-space void; rockets, planets, comets and a friendly (never scary) wormhole maw.*

**Why this one:** it is the biggest theme jump — space, not plants — while keeping the game's locked **deep-black midnight palette** (deep space IS the existing `#05070a`/`#0d100c` void), so the reskin costs almost nothing in integration and every bright orb still pops on a dark field. The three real path variants in code — *serpentine*, *wider loops*, *spiral inward* — read instantly as comet arcs and an orbiting galaxy; the code's `burrow` becomes a swirling wormhole (a swallowing vortex reads more naturally than a hole with a face competing with the orbs); the ten drifting `fireflies` become drifting stars for free. It is genuinely catchy and kid-magnetic (space is a top-tier kid theme) yet fresher than yet-another candy-match. And the game's cozy no-fail promise ("no harsh game over, the chain just curls back") survives beautifully as "the orbit loops back." The name **Berry Vine** even survives — glowing **star-berries** ride a stardust **vine**. **All sheets below bake this look in.**

### 2. Orchard Nocturne (alt, cozy — the botanical option, upgraded)
*The current midnight-orchard fiction, polished into the house papercut/gouache look: soft glossy berries on a living sage vine, a warm burrow, firefly-lit calm.* Warmest and most native to Lucid Winds, but it keeps the game inside the botanical lane the Director wants to leave, and reads a touch quieter on a portal card than the cosmic look.

### 3. Circuit Gems (alt, more mature / arcade-neon)
*Faceted glowing gemstones sliding a dark neon circuit-board track into a data-vortex; a machined chrome injector pod at center.* Sleek, premium, gender-neutral and very "arcade," but heavier per asset, the neon fights the "keep the field dark so orbs read" rule, and it is less warm than the cosmos look for a young audience.

**Recommendation: Starberry Cosmos.** Boldest non-botanical shift, native to the locked dark palette (lowest integration risk), maps 1:1 onto the real paths/burrow/fireflies, keeps the "Berry Vine" name intact, and is the most instantly catchy for kids. Borrow Orchard's cozy warmth in the glow, hold Circuit Gems in reserve as a premium unlockable orb/track skin.

## Sheets (generate each separately)

- `01-berryvine-orbs.md` — Star-Berry Orbs — the six shape-marbles + loaded / paint / matched / shard states — the core sprites
- `02-berryvine-shooter-track.md` — Launch Pod + Stardust Track + Wormhole burrow (the path & shooter)
- `03-berryvine-backgrounds.md` — Backgrounds & Screens — Full-Bleed Portrait (play / title / results / nebula moods)
- `04-berryvine-ui.md` — UI / HUD — buttons, mode icons, chips, charge meter, burst button, stars
- `05-berryvine-fx.md` — FX & Feedback — match burst, cascade, flash, dread vignette, star drift, launch flash
- `06-berryvine-cosmetics.md` — Pod skins + Berry palettes + wardrobe furniture — 💰 COSMETICS / ECONOMY

## Cosmetics economy

Every Berry Vine cosmetic is earned by **PLAYING** — no loot boxes, no randomized purchases, no pay-to-win, nothing that changes a bed's path, hitboxes, colors or solution. Everything is a **KNOWN unlock at a KNOWN threshold** so a kid always sees exactly what they are working toward (the game shows the requirement right on each locked wardrobe card). There are two cosmetic families and three earn faucets, all already wired in `bv_save`:

- **Launch-pod skins** (`PROG.pod`, `PODS[]`): *Seedpod* (starter, free) → **Amber Pod** (clear **3** beds) → **Blossom Pod** (clear **8** beds) → **Thorn Pod** (**Bloom Rush** personal best ≥ **6000**). Two faucets here: cumulative **beds cleared** (`PROG.totalCleared`) and **rush-score mastery** (`PROG.bestRush`).
- **Berry palettes** (`PROG.pal`, `PALS[]`, six colors each): *Orchard* (starter, free) → **Dusk** (clear **5** beds) → **Frost** (clear **12** beds) → **Ember** (**3-day Daily streak**). Faucets: **beds cleared** and the **Daily Sprout streak** (`PROG.streak`), the lapsed-friendly return loop.

All three faucets already persist in `localStorage` (`bv_save`), so gating is free and offline-safe; the equipped choice lives in `PROG.pod` / `PROG.pal`, and `PROG.owned{}` allows an optional manual grant without touching the earn logic. Skins are **purely visual** — they never touch the path, orb hitboxes, match rules, star thresholds or Sunbeam payout. Sunbeams stay the earn/collection currency only (`_sbCapEarn`, 30/day cap, 12/run). **Optional soft-coin (convenience only, not required):** the portal's existing **Dew** — never Sunbeams — could early-unlock a cosmetic slightly ahead of its threshold, but every item stays fully earnable free by playing, so the wall is a showing-up wall, not a paywall.

## Style block

```
STYLE — "Starberry Cosmos" (Berry Vine / Sky Wolf Studios cozy-cosmic marble-arcade). Bold, kid-friendly deep-space arcade art: glossy glowing "star-berry" orbs and a chunky friendly launch pod drifting through a calm nocturnal cosmos. Rounded, huggable, chunky silhouettes (nothing sharp, nothing scary); crisp clean shapes each with ONE soft rim-light and a gentle inner glow, restrained bloom — luminous but never neon-blown, so orbs always read on a dark field. Reads instantly at thumbnail size and by SHAPE first, color second (colorblind requirement — the six marbles are circle / heart / star / teardrop / diamond / hex and MUST stay distinguishable by silhouette alone). Consistent flat front-on / slight-top arcade camera, every subject centered and upright in its cell. Palette (sits native on the Lucid Winds midnight void so the theme shift keeps the dark base): deep-space void #05070a and #0d100c, nebula indigo #1a1636 / #241a4a, star-berry hues rose #e24d6a, sky-blue #4d7fe2, amber #e2b34d, teal #3fb6a8, violet #a468d8, leaf-green #7ab356; launch-gold #c8a84b + hot bloom #ffe9a8 + cream starlight #e8dcc8; muted moss #8a9178, dusk line #2a331f, comet-dew #bfe0f2 / moon-blue #5b9bd5, warm rose #e58fa0, alarm plum #7d3450 + warning-tip #e56b6b, warm metal #8a5a2b / #5c3a1a, spark violet #b57de0. Lighting is nocturnal-cosmic: a soft starlight key from top-center, cool nebula fill, deep drop-off toward the middle so the bright moving orbs pop. Rendering: soft cel + gentle gradient sheen, subtle grain, NO photoreal, NO harsh chrome keylines, NO text / letters / numbers / logos / watermarks baked into any art (icons are pictographic only). Each PNG must compress under 150KB — tight palette + flat glow make this easy. Per-sheet knockout / gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural canvas draws in `/workspaces/lucid-winds/satellites/berry-vine/index.html`; keep every existing canvas fallback as an absent-asset safety net (gate each blit behind an image-loaded check). The DOM copy and emoji labels ("Berry Vine", "Vine Journey", "Pollen Burst", 🫐/📅/🌸/🍃/🎀) are owned by code and stay as-is; this art reskins the **canvas-drawn** sprites and provides retinted screen backdrops. Asset folder: `/workspaces/lucid-winds/satellites/berry-vine/assets/` (subfolders `orbs/`, `world/`, `bg/`, `ui/`, `fx/`, `cosmetics/`). Path-version every file (`?v=BUILD`) per the Hostinger resizer rule; ship only the <150KB cut cells, keep master sheets out of the live web path. Map:
- `bv_orbs.png` → `drawShape()` (the six shape-orbs, keyed by `SHAPES[ci%6]` and tinted by `berryColor(ci)`), the loaded orb at the pod mouth, the reserve/next orb, the paint-shot halo (`G.proj.paint` white ring, line ~533), the sheen dot, and `splat()` shard base.
- `bv_world.png` → `drawShooter()` pod body + fins + burst ring + aim guide, the path guide stroke in `render()` (lines ~522-524, tileable stardust ribbon), the `burrow` ellipse + dread pulse (lines ~526-529), and the chain spawn point.
- `bv_bg.png` (full-bleed set) → `#wrap`/`#stage` and the `render()` background gradient + `fireflies` loop (lines ~516-518), plus the `.screen` title / results panels; nebula-mood variants keyed to `def.variant` (0/1/2).
- `bv_ui.png` → `.btn` / `.btn.primary` CSS plates, the six mode-button icons, the on-canvas `hudBtn()` menu/retry chips, the `drawHUD()` charge meter + `HB_BURST` button + `◆` score glyph, and the `✿` star readout on results/level cards.
- `bv_fx.png` → `splat()` / `addFloat()` particles, `G.flash` overlay, the dread red vignette (line ~545), the `fireflies` → star-drift, the fire muzzle-flash, the swap swirl, and the win celebration confetti.
- `bv_cosmetics.png` → the four `PODS` pod skins (`PROG.pod`, drawn in `drawShooter()` and the wardrobe canvas), the four `PALS` six-orb palette sets (`curPal()`), and the wardrobe card frame / lock / equipped furniture (`renderWard()`).

Bump the asset cache version on any art change and cache-bust `img.src` with `?v=BUILD`.
