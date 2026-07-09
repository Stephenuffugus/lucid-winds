# Picnic Panic — Art Direction

> Root your potted bloom at the bottom of a moonlit garden and blast the diving swarm of glowing bugs before the Queen Bee beams your flower away.

**Genre:** Fixed-swarm arcade shooter (Galaga clone) — "Garden Galaga": a potted flower fighter shoots up at a diving swarm of garden bugs; 4 modes, a queen-bee capture boss, a Classic transform trio, floating power-up drops, and a nectar cosmetics shop.

## Pick a look (kid-friendly options)

### 1. Lantern Garden — *cozy*
Warm hand-illustrated storybook vector with soft gouache texture and rounded, friendly bugs lit by a lantern-lit garden night. Muted sage-and-amber palette on a warm charcoal ground, gentle grain, no hard neon. Reads as a bedtime-book arcade — the gentlest, most wholesome option, closest in spirit to the old paper-craft look but cleaner and less childish.

### 2. Bioluminescent Nocturne — *polished* ⭐ RECOMMENDED
Crisp modern vector-cartoon with a soft bioluminescent glow language: a moonlit midnight garden where every critter, bloom and pickup carries its own gentle inner light. Clean confident linework, smooth cel-shading with a crisp specular pop and a thin neon rim tracing each silhouette, rich jewel palette on deep near-black-teal. Sophisticated and arcade-punchy while staying cute and kid-safe — foes glow cool cyan, hero elements glow warm gold, everything pops at tiny size.

### 3. Neon Circuit Bloom — *bold*
High-energy neon-arcade look: chunky bold outlines, flat electric fills and glowing edges on a near-black field, synthwave-garden energy. Leans cyan / lime / violet / gold neon (deliberately AVOIDS pure magenta since that is the knockout color). Maximum arcade punch and the most graphic silhouettes, but the flat neon fills give bugs and bosses less warmth and personality than the recommended direction.

**Recommended: Bioluminescent Nocturne.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-picnic-enemies.md` — Sheet 1 — Swarm critters (the grunts)
- `02-picnic-bosses.md` — Sheet 2 — Boss + transform elites (big-score set pieces)
- `03-picnic-plants-pots.md` — Sheet 3 — Hero plants + pots (cosmetics / shop thumbnails)
- `04-picnic-icons.md` — Sheet 4 — Pickups + UI icons
- `05-picnic-scenes.md` — Sheet 5 — Scenes / full-bleed backgrounds (play-field skins)

## Style block (baked into every sheet prompt here)

```
STYLE — Bioluminescent Nocturne. Polished modern vector-cartoon with a soft bioluminescent glow language: a moonlit midnight garden where every critter, bloom and pickup carries its own gentle inner light. Clean confident linework, smooth cel-shading with one soft gradient plus a crisp specular pop, and a thin neon rim-light tracing each silhouette. Rich jewel palette on a deep near-black-teal world — base #070d12, midnight indigo #10203a, bioluminescent cyan #4fe3d0, glow-lime #b6f24b, warm amber-gold #f2b632 with antique gold #c8a84b for rewards, coral-rose #ff7a9c for targets and peaks, soft violet #9a7fe0 for arcane accents, cream #eaf5e2 highlights. Materials read as glossy chitin carapace, dewy translucent wing-membrane, plush petals and matte glazed ceramic — tactile but never photoreal. Cute, arcade-friendly bugs with big readable eyes; bosses are grand and cozy-menacing, never scary or grim, absolutely no gore or horror. Bold clean silhouettes first, symmetrical where noted, chunky enough to read at tiny arcade size. Soft top-down key light, warm gold rim on hero/reward elements, cool cyan rim on foes. No photorealism, no 3D render, no text, no captions, no borders, no UI words unless a cell explicitly asks for a logo. Keep shapes bold and shading simple so each cropped sprite compresses cleanly under 150KB.
```

## Wire notes

Inventory verified against satellites/picnic-panic/index.html. Enemies + boss: render loop at ~line 1266 draws cx.fillText(e.emojiOverride||TYPES[e.type].emoji) rotated by e.ang. TYPES keys (line 502) map 1:1 to Sheet 1 sprites (fly/ant/mosq/beetle/ladybug/wasp/butterfly/cricket/spider/puffer/sporeling) and boss→boss_queen_bee. Classic transform trio TRANSFORMS (line 1025, 🦂/🐍/🦎 via e.emojiOverride) → elite_scorpion/elite_serpent/elite_gecko. Sprites are head-up; keep existing rotation (rest = facing player, dive = facing travel); draw at each type's r; boss uses ×1.1; armored-ladybug/enraged-boss ring stroke (line 1268) stays layered on top. Hero: drawPlant() (line 1183) — draw pot_<POTS.k> once at base (POTS line 403, keys terra/sage/ocean/rose/night/moss/ember/ice/gild/obsid → map to pot_* filenames), then plant_<PLANTS.k> per head in the heads array (PLANTS line 415, keys snap/sun/rose/laven/cactus/ember/ice/gold); shield-ring overlay (line 1201) stays. drawGhostPlant 🌷 (line 1208, capture/rescue) → ui_captured_bloom. Drops: kinds array (line 1113) spread/rapid/pierce/shield/bomb/nectar/homing/slow/nullify + blossom (line 1117) → drop_spread_seed/drop_rapid_pepper/drop_pierce_thorn/drop_shield_petal/drop_bloom_bomb/drop_nectar_honey/drop_homing_pollen/drop_time_slow/drop_nullify_burst/drop_blossom; Power-Bloom HUD timers reuse the same drop_* icons. Lives 🌷 (line 1313) → ui_life_sprout; stage flags 🌳/🌻/🌼 (lines 1318-1320) → ui_flag_grove/ui_flag_sunflower/ui_flag_daisy. Scenes: applyCosmetics() sets bg from BGS (line 436, keys meadow/dusk/ocean/sunset/sakura/emerald/night/ash) — point at scene_<key> as bottom canvas layer; procedural fireflies + grass strip may stay layered or be baked in. SKIP shots: curShot() bullets (lines 1281-1287) are 2-3px tinted rects — leave procedural, cosmetic color tint only (shop shot cosmetics remain color-only). Hook: add a drop-in window.PP_ART map (key→preloaded Image) mirroring Nectar Drop's 'art replaces procedural draw when present' pattern — draw sprite when its Image is loaded, fall back to emoji/vector when absent. Deploy PNGs to satellites/picnic-panic/assets/ with subfolders enemies/ plants/ icons/ scenes/. Cache-bust with ?v=<version>; the ≤1600px cut backgrounds stay under the Hostinger 1600px image-resizer threshold, so no .bin fetch→blob trick needed here.

