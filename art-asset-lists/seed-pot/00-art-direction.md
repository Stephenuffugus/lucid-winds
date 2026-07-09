# Seed Pot — Art Pack

> Drop, merge, grow — hatch a living companion at the top of the ladder.

**Genre:** Botanical Suika / merge-drop physics puzzler (single-file HTML5 canvas satellite)

_The game already ships and plays procedurally — this art is an optional visual upgrade **and** the cosmetics library that powers the in-game customization economy._

## Pick a look

### 1. Hearth Terracotta
*Cozy storybook gouache. Chunky rounded forms, thick soft edges, warm work-lamp glow, everything hand-thrown and huggable. The most kid-forward and the fastest to produce.*

Safest, warmest read at tiny sprite sizes — a Seed at 30px still parses. Merges feel like a picture book turning its page. Trade-off: slightly less premium than the house greenhouse look; can feel generic-cute if the palette drifts.

### 2. Midnight Greenhouse (RECOMMENDED) ⭐ RECOMMENDED
*The Lucid Winds house aesthetic: painterly semi-realistic botanical gouache floating on near-black, sage-and-gold rim-light, warm lamp key from upper-left, cool shadow fill. Lush, tactile, premium, glossy readable silhouettes.*

Matches the greenhouse tab and the existing procedural render so a Seed Pot bloom and a greenhouse plant read as one world — exactly what the brief asks for. Highest perceived quality, best cosmetics-store appeal, cohesive across all seven sheets. This is the pick.

### 3. Papercraft Terrarium
*Layered cut-paper and felt craft. Flat matte shapes, visible paper-grain, drop-shadow layering, stitched edges. Every tier is an unmistakable folded silhouette.*

The most colorblind-bulletproof (pure shape language, zero gradient reliance) and charmingly distinctive. Trade-off: diverges from the house's painterly realism, so companions hatched here would look like a different set than the greenhouse's — weakens the 'one world' promise.

**Recommended: Midnight Greenhouse — it is the only direction that keeps a Seed Pot companion visually identical to the same creature in the greenhouse Compendium, which is the entire point of the Companion Bloom hook. It also drops straight onto the existing near-black canvas, sage/gold palette, and lamp-glow render with zero tonal seam..** Sheets here use this look; swap the STYLE line to try another.

## Sheets (generate each separately)

- `01-seed-pot-tiers-sprites.md` — Growth-Ladder Plant Sprites (8 tiers, idle + merge-pop)
- `02-seed-pot-bench-bg-seasons.md` — Bench + Lamp Backdrop — 4 Seasons (full-bleed)
- `03-seed-pot-terracotta-pot.md` — Terracotta Pot — 4 Seasons (cutout)
- `04-seed-pot-overgrowth-vine.md` — Overgrowth-Vine Rim — Danger States (cutout)
- `05-seed-pot-fx-atlas.md` — Merge / Pollen FX + Companion-Bloom Burst (cutout)
- `06-seed-pot-ui-hud.md` — UI / HUD Frames + Buttons + Next-Queue (cutout)
- `07-seed-pot-cosmetics-catalog.md` — COSMETICS CATALOG — Pot Skins, Backdrops, Seed Reskins, Companion Cameos (cutout) — 💰 COSMETICS / ECONOMY

## Cosmetics economy

All cosmetics are aspirational, never pay-to-win, and there are NO loot boxes or purchasable RNG (house rule: Pi is inventory-only, currency lanes locked). Sunbeams stay the play-reward currency (30/day, 12/run cap) and flow into the core plant economy — cosmetics do NOT cost Sunbeams to keep them clean of grind pressure. Unlock paths: (1) MASTERY / SCORE-FREE milestones — pot skins and seed-reskin sets unlock from play achievements (first Heirloom reached, Nth companion hatched, personal-best pot, streak-day counts), so skill and collection pull the same direction with zero paywall; (2) SEASONAL ROTATION — the spring/summer/autumn/winter pot + bench dressing auto-equips by real-world month via the existing 4-season art system, and each Season Challenge badge grants a limited-run seasonal skin that rotates out, driving weekly return; (3) COMPENDIUM COLLECTION — each of the 85 companions is a hatch-to-collect page; hatching a companion in Seed Pot mints its cameo card (cells 17-20 are the template) permanently, and rarer companions only appear from deeper runs so the catalog fills by skill; completing a Compendium row awards a cosmetic frame/skin. (4) OPTIONAL Pi direct-buy — a player may buy a SPECIFIC, known cosmetic (a named pot skin) directly, cosmetic-only, no gameplay advantage, no randomness — consistent with the Pi inventory-only policy. Milestone blooms still mint an actual procedural greenhouse plant, tying the climax to the core meta.

## Style block

```
STYLE — MIDNIGHT GREENHOUSE (paste at the top of every sheet):
Cozy hand-painted botanical game art in the Lucid Winds "midnight greenhouse" style. Painterly semi-realistic gouache with soft airbrush volume, chunky rounded forms, and crisp readable silhouettes. Warm work-lamp key light from the upper-left; cool sage shadow fill. Gentle rim-light and a small top-left specular on every rounded form; no harsh black outlines, no cel banding. Kid-friendly, wholesome, calm. NO text, NO letters, NO numbers, NO logos, NO watermarks, NO UI chrome unless the cell explicitly asks for it. Colorblind-safe: every element must be distinguishable by SHAPE and VALUE, never colour alone. Do NOT bake drop shadows into cutout sprites (the engine adds its own). Palette LOCKED to: near-black base #0d100c, sage #7ab356, deep leaf #3f6b34, warm gold #c8a84b, cream #e8dcc8, muted olive #8a9178, terracotta clay #8a5a2b, rose #e58fa0, alarm red #e5604d. Use rose #e58fa0 for ALL pinks — never true magenta inside artwork. Each sprite fully opaque with clean anti-aliased edges.
```

## Wire notes

Asset root: satellites/seed-pot/assets/ with subfolders tiers/ bg/ pot/ vine/ fx/ ui/ cosmetics/. Load-time: pre-rasterize each cutout cell to an offscreen sprite, cache by name, blit in the existing draw calls; keep the current procedural draw as the fallback if a sprite is missing (art is a drop-in upgrade, game ships without it). All sprites authored at 2x for DPR; keep each exported PNG <150KB (index/quantize).\n\nDraw-call → sheet map (coords are the game's 540x960 virtual space):\n• drawFruitAt() / drawFruit() shape branches (seed/sprout/leaf/bud/blossom/round/heirloom, TIERS[0..7], radii 15..82) → seed_pot_tiers_sprites.png. Idle sprite blitted centered on (f.x,f.y) scaled to 2*T.r; use the MERGE-POP cell for the ~180ms squash frame when f.sq!=1. drawMini() (next-queue previews) and drawLadder() (title) reuse the same tier idle sprites downscaled.\n• render() bg gradient + radial lamp glow → seed_pot_bench_bg_seasons.png, pick panel by season; drawn first, full 540x960 (pot column kept clear).\n• drawPot() (body/rim/inner-dark/soil, spanning x≈82–458, y≈212–920, rim center ≈ (270,212)) → seed_pot_terracotta_pot.png (season) and, when a skin is equipped, seed_pot_cosmetics_catalog.png cells 1-8. Interior must stay a dark empty well since fruits render on top.\n• drawDanger() (overgrowth vine at y=DANGER=214, spanning pot mouth ~x110–430, center 270) → seed_pot_overgrowth_vine.png; cross-fade CALM→STIRRING→WARNING→OVERFLOW by G.warn/G.overTime.\n• drawDropper() beam + hovering seed (beam x-centered, y 0→DROPY=150) → beam = fx cell 9 (stretched), ghost preview = fx cell 10, the seed itself reuses the tier idle sprite.\n• burst()/ring()/float() and the companionBloom() particle spray + flash → seed_pot_fx_atlas.png (pollen motes 1-4 by season, rings 5-6, sparkle 7, glow 8, laurel 11, composted puff 12; the Companion-Bloom money shot uses 13 burst-core + 14 petal-ring + 15 sweep-arc; 16 halo behind idle Heirlooms).\n• HUD text/score/mode label + NEXT label → optional frames from seed_pot_ui_hud.png (score plaque, next-queue wells, mode badges); title/how/settings/game-over DOM buttons → the button/plaque/glyph cells. Text stays engine-drawn over the empty frames.\n• COMPANIONS[] emoji array in companionBloom() → replace with seed_pot_cosmetics_catalog.png cameo art (cells 17-20 are the frame template) sourced from the shared 85-companion library; hatching mints the cameo into the Compendium.
