# Sproing — Art Direction

> A one-thumb bounce up an endless beanstalk — land pad to pad through six climbing worlds, stomp the garden bugs, and ride seed-powerups from the flowerbed all the way to the stars.

**Genre:** Endless vertical jumper (Doodle-Jump-style), botanical theme — bounce up leaf-pads through 6 biome bands from a garden bed to a starfield, stomping pests, grabbing coins and seed-powerups.

## Pick a look (kid-friendly options)

### 1. Meadow Gouache — *painterly*
Hand-painted gouache-and-watercolor storybook illustration with visible brush edges, soft paper grain and naturalistic botanical color — the cozy end of the range, like a modern picture book (Carson Ellis / Jon Klassen warmth) rather than kids' felt-craft. Muted-but-glowing greens and golds, soft-focus painterly backgrounds, chunky friendly critters with painted eyes. Charming and tactile, but heavier files and softer edges that fight small-sprite readability at 40px in a fast jumper.

### 2. Sunlit Vector Garden — *polished* ⭐ RECOMMENDED
Clean modern flat-vector botanical illustration with a premium mobile finish — Alto's-Odyssey calm crossed with a friendly Nintendo garden. Smooth bezier shapes, bold two-to-three-stop gradients, soft ambient-occlusion long-shadows, one crisp specular highlight per form, gentle inner glow. The daylight-to-starlight climb is native to gradient skies, silhouettes stay razor-readable at 40px, and flat shapes compress far under 150KB. This is the sophisticated, grown-up-looking-but-always-kid-friendly middle of the range.

### 3. Lumen Night-Garden — *bold*
A dramatic bioluminescent night-garden: deep near-black grounds with luminous neon botanicals, glowing rim-light, sequin-bright stars, and pickups that read as light sources. Palette intensifies as you climb so the whole game trends toward the starfield finale. The boldest, most mature-looking option — still cute critters, no horror — but the strong glow and dark grounds risk muddying the sunlit lower biomes and lean harder than a general-audience garden jumper needs.

**Recommended: Sunlit Vector Garden.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-sproing-bg-sheet.md` — Sheet 1 — Biome Backgrounds (full-bleed, 6 portrait skies)
- `02-sproing-platforms-sheet.md` — Sheet 2 — Leaf Platforms & Terrain (11 cutout pads + 1 blank)
- `03-sproing-critters-sheet.md` — Sheet 3 — Critters, Coins & Hazards (9 cutout sprites)
- `04-sproing-powerups-sheet.md` — Sheet 4 — Powerup Pods (10 cutout icon pods, one family)

## Style block (baked into every sheet prompt here)

```
STYLE — Sunlit Vector Garden: clean modern flat-vector botanical illustration with a premium mobile-game finish (Alto's-Odyssey calm meets a friendly Nintendo garden). Build every form from smooth bezier curves and bold 2-3 stop gradients, add soft long-shadow ambient occlusion and a gentle inner glow, and give each object rounded glossy volume with a single soft specular highlight. No sketchy or painterly texture, no visible pencil linework (an optional thin darker-tone edge only where a shape needs to separate for readability), no photorealism, no 3D render. The world is a daylight-to-starlight climb — sunlit garden bed low, warming through hedge, canopy and clouds, cooling to dusk and a calm starfield at the top — so palettes warm at the bottom and cool/darken toward the top. Critters and pickups are cute rounded botanicals with simple friendly faces and big readable eyes; silhouette reads first. Kid-friendly always: never scary, never grim, cozy-menacing at most for traps (a flytrap is playfully toothy, not horrifying). Soft top-down key light with a warm gold rim highlight. Chunky arcade readability so every element still reads clearly at ~40px. Keep shapes bold and flat enough that each cropped asset compresses well under 150KB. No text, no captions, no labels, no borders, no UI words anywhere. Palette anchors: deep green ink #0e140d, sage #7ab356, leaf-bright #8fbf4a, antique gold #c8a84b, warm gold #f2d24b, cream #e8dcc8, rose #e58fa0, sky-teal #5a9ad0, dusk-indigo #3a2a5a.
```

## Wire notes

No ART hook exists yet — the game is 100% Canvas2D and loads zero external images (the only new Image() calls read the player's own drawn climber doodles from localStorage). A drop-in ART loader must be added first, same pattern as Nectar Drop: preload each PNG keyed by asset name, draw it where art exists, fall through to the existing procedural draw when the image is missing. Cut every cell to its own snake_case PNG (names exactly as listed) and keep each under 150KB; path-version deploys (?v=hash) per the Hostinger image-resizer note, and verify against the LIVE url since that host resizes images over 1600px.

Mapping to code paths (satellites/sproing/index.html):
- Backgrounds → skyPair() + BIOME_SKY (~L1431-1435) and the renderGame() sky block (~L1439). Cross-fade the 6 bg_* frames by altitude using biomeIdx(m) (6 bands, 500m each, capping at 3000m) in place of the two-stop gradient. Keep the procedural gradient as fallback. Folder: assets/bg/. Files: bg_garden_bed, bg_hedgerow, bg_canopy, bg_clouds, bg_upper_air, bg_starfield (matches BIOMES order: Garden Bed, Hedgerow, The Canopy, The Clouds, Upper Atmos., Starfield).
- Platforms → drawPlatform() (~L1482), keyed by pl.type (broad, drifting, crumble, dewy, dandelion, mushroom, fiddlehead, thornleaf, flytrap). Swap thornleaf → platform_thornleaf_armed when pl.thornUp is true, and flytrap → platform_flytrap_open when pl.trapOpen is true. Anchor: wide-and-short, drawn centered; engine scales to platform width. Folder: assets/platforms/.
- Critters → drawPest() (~L1498), keyed by pe.type (aphid, wasp, snail, beetle, spider). Sprites face RIGHT; the code already flips/positions via pe.vx, so provide one right-facing orientation and let the wiring mirror on leftward travel. Folder: assets/critters/.
- Coins + hazards → drawCoin() (~L1508; use coin_nectar by default, coin_gold when the gold flag is set) and drawHazard() (~L1515; hazard_seed for type 'seed', hazard_bramble for type 'bramble'). hazard_seed is drawn with ctx.rotate(hz.phase) — supply it upright/neutral-rotation and let the engine spin it. Leave the 'wind' and 'haze' hazards procedural (full-screen overlays). Folder: assets/pickups/.
- Powerups → drawPowerup() (~L1509), keyed by the powerup id (matches POW_IDS / POW_SYM). Draw the pod sprite instead of the gold ring + emoji glyph; file names are powerup_<id> for all 10 ids (dandelion_parachute, nectar_magnet, bubble_shield, propeller_seed, spring_roots, giant_leaf, shrink_bud, pollen_jetpack, slow_time_honey, ghost_spores). Folder: assets/powerups/.

Recommended asset root: satellites/sproing/assets/ with subfolders bg/, platforms/, critters/, pickups/, powerups/.

DO NOT skin (procedural / player-identity, would fight the game): the climber (drawPlayer() / curSprite draw-your-own studio), the beanstalk vine, and hats/skins/trails/sky-themes (THEME_SKY studio cosmetics). This pack skins only the world drawn around the player.

