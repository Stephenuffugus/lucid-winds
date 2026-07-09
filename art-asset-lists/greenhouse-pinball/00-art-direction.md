# Greenhouse Pinball — Art Pack

> Every flip grows a plant you keep — keep the pollen bead alive and bloom the living table.

**Genre:** Top-down botanical pinball (single-file HTML5 canvas, 540×960 portrait) — a moonlit greenhouse workbench where a pollen bead is the ball and the table is a plant you grow into Bloom Multiball

_The game already ships and plays procedurally — this art is an optional visual upgrade **and** the cosmetics library that powers the in-game customization economy._

## Pick a look

### 1. Storybook Terrarium
*Cozy, hand-painted, thick warm outlines. Soft gouache leaves, chunky friendly flower bumpers with big smiley pollen cores, felt-textured moss. Reads instantly to a 6-year-old; low glow, high charm. The safest kid-first read, least production cost.*

Warmest and most legible — the flowers look like plush toys and the ball like a honey drop. Great for Zen mode marketing, but the least 'premium' and the least aligned with the existing midnight-greenhouse SVG plant style the bloom must match.

### 2. Moonlit Workbench ⭐ RECOMMENDED
*The house style: deep-black soil playfield, sage-glowing trellis, gold dew-glint rails, cream light bleeding through a glass roof. Painterly but crisp, one soft rim-light per object, restrained bloom. Objects sit on a dark uncluttered center so the bead and bumpers pop. Matches Lucid Winds' _generatePlantSVG bloom exactly.*

RECOMMENDED. It is literally the botanical-identity spec in the brief, drops straight onto the existing midnight-garden palette (#0d100c/sage/gold/cream/rose), and keeps the center-field dark so physics stays readable. Cozy enough for kids, polished enough to sell cosmetics. Lowest integration risk.

### 3. Bioluminous Glasshouse
*Polished, high-fidelity neon-botanical: glowing veins in every leaf, refractive glass bumpers, volumetric lamp shafts, particle-dense pollen. Firefly-lit, aquarium-deep. Screensaver-gorgeous.*

Most premium and the best showcase for the crystal-glasshouse / moonpond special skins, but heavy glow fights the 'keep the center dark so the ball reads' rule and risks thermal/perf cost on Pixel 9. Best reserved as a top-tier unlockable table skin rather than the base look.

**Recommended: Moonlit Workbench — it is the brief's own botanical-identity spec, sits native on the locked midnight-garden palette, keeps the play center dark so the bead and bumpers stay legible, and matches the procedural SVG bloom the table mints. Borrow Storybook's chunky-friendly bumper silhouettes for kid-legibility and hold Bioluminous in reserve as the premium crystal-glasshouse / moonpond special skins..** Sheets here use this look; swap the STYLE line to try another.

## Sheets (generate each separately)

- `01-sheet-01-table-backdrops-seasons.md` — Full-Bleed Table Playfield Backdrops — 4 Seasons
- `02-sheet-02-pollen-ball-trail.md` — Pollen-Bead Ball + Trail
- `03-sheet-03-leaf-flippers.md` — Leaf-Blade Flippers — Rest + Flipped
- `04-sheet-04-bumpers-slings.md` — Flower Pop-Bumpers (idle + lit) + Slingshots
- `05-sheet-05-moss-net-drain.md` — Moss-Net Ball-Save + Compost Drain
- `06-sheet-06-growth-ribbon-stem.md` — Growth-Ribbon / Cultivation-Stem States
- `07-sheet-07-ui-hud.md` — UI / HUD Frame + Screen Furniture
- `08-sheet-08-juice-fx.md` — Juice FX — Petal Burst, Pollen Shimmer, Bloom Erupt
- `09-sheet-09-cosmetics-catalog.md` — COSMETICS CATALOG — Table / Flipper / Ball Skins + Companion Hosts — 💰 COSMETICS / ECONOMY

## Cosmetics economy

All cosmetics unlock through PLAY, never money and never loot boxes (kid-safe, aligns with Sunbeam earn policy). Faucets: (1) MASTERY milestones — cumulative blooms triggered and personal-best score tiers unlock skins (e.g. 10 blooms → summer table, 25 → autumn, best-score tiers → flipper/ball skins). PROG.blooms and PROG.best already persist in localStorage, so gate off those. (2) SEASONAL ROTATION — the four season table skins auto-equip/feature with the real-world season (season = hash byte system already in Lucid Winds); the matching season skin is free during its season, collectible year-round after first unlock. (3) DAILY-STREAK — the login/Daily-Bloom streak (the retention spine) widens the moss net AND drips cosmetic unlocks at streak milestones (7-day → a ball skin, 30-day → night_market special, weekly Perfect-Bloom → a companion-host cameo). (4) SPECIALS (crystal_glasshouse, night_market, moonpond) are long-tail mastery/streak rewards, not sold. Companion-host cameos unlock by owning the matching companion in the main collection (Firefly/Koi/Garden-Spider/Luna-Moth already in the 85 roster) — cosmetic reuse, zero new economy. No RNG crates, no pay-to-win: skins are pure visual, never touch physics, score, or Sunbeam payout. Equipped skin stored in localStorage (gp_skins) so it's free to persist and doesn't need server writes.

## Style block

```
STYLE — "Moonlit Workbench" (Lucid Winds house look). Top-down botanical pinball art. Midnight-greenhouse aesthetic: deep-black soil base #0d100c, sage #7ab356, deep leaf #3f6b34, gold dew #c8a84b, cream glass-light #e8dcc8, rose pollen #e58fa0, alert red #e5604d. Painterly-but-crisp: each object gets ONE soft rim-light (cream or gold), gentle inner shadow, restrained outer glow — never neon-blown. Botanical, hand-tended, nocturnal, calm; kid-friendly rounded silhouettes, nothing scary or spiky-sharp. Flowers read as pollen-heavy heads (sunflower/foxglove/thistle), leaves as spring-loaded blades, moss as soft felt, dew as gold glint. Lighting: a single warm cream lamp from top-center of the table, cool moonlight fill, dark drop-off toward the middle of the playfield so the moving ball and bumpers pop. Rendering: soft cel + gouache texture, 2px-equivalent dark outlines, subtle grain, NO photoreal, NO harsh chrome, NO text/watermark/UI baked into art sprites. Everything reads at small size on a 540×960 phone table. Consistent 90° top-down orthographic view for all playfield pieces (no perspective tilt).
```

## Wire notes

Draw-call → sheet mapping (all in satellites/greenhouse-pinball/index.html). The game ships fine procedurally; art is a drop-in swap, gate each behind an image-loaded check with the current procedural draw as fallback. • render() backdrop gradient + lamp radial (lines ~325-326) → sheet_01 table backdrop (blit the season/skin image full-frame under everything; keep center dark). • drawBumper(BUMPERS,...) (line 333) → sheet_04 sunflower/foxglove/thistle idle+lit (pick by bumper index; o.lit drives idle→lit crossfade). • drawBumper(SLINGS,...) (line 334) → sheet_04 slingshot_idle/lit. • drawNet() (line 336, drawNet def ~374) → sheet_05 moss_net_armed (G.netTime>0), moss_net_flash (G.netFlash>0), compost_drain_mouth static under it. • drawFlipper(LFLIP/RFLIP) (line 338, def ~367) → sheet_03; rotate the horizontal blade sprite about F.px,F.py, swap rest↔flipped on F.up, overlay pivot_cap; flipper_glow_underlay when |F.w|>3. • ball radial gradient + trail (lines 341-342) → sheet_02 pollen_bead_core (or equipped ball skin), pollen_bead_lit during multiball, trail_mote for the b.trail loop, launch_streak on launch(). • burst()/G.parts particles (lines 289, 344) → sheet_08 petal_gold/petal_rose/pollen_mote/spark_save/combo_puff/compost_puff (choose by the col passed to burst). • G.flash overlay + triggerBloom() particle ring (lines 349, 271-276) → sheet_08 bloom_flash + bloom_erupt_ring. • drawGrowth() (line 355, def ~381) → sheet_06 ribbon_track_empty + fill_low/mid/high/bloom_burst keyed to G.growth/GROWTH_MAX, stem_leaf_accent as fill passes 0.3/0.6. • HUD text/score/mult (lines 351-353) + the .screen title/how/settings/gameover DOM → sheet_07 UI plates/badges/buttons/tendril (CSS backgrounds for DOM, canvas blits for in-play HUD). • floats (line 347) stay procedural text. • sheet_09 cosmetics are the swap sources for sheets 01/03/02 plus host cameos drawn as an extra decorative sprite parked near a bumper/kicker (new optional draw, no physics). Add a single _SVG_CACHE_VER-style asset version bump when art changes, and cache-bust image src with ?v=BUILD.
