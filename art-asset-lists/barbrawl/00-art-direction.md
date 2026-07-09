# BarBrawl (portal display: "Wild Wardens") — Art Direction

> Diablo build-depth meets Pokemon-GO location play, reskinned kid-safe: seven nature-guardian wardens soothe mischievous plant-spirits through procedurally-generated garden dungeons and claim them to earn while they sleep.

**Genre:** Location-based tactical RPG / roster dungeon-crawler (turn-based rhythm combat, 7-class roster, procedural venue dungeons, overworld map)

## Pick a look (kid-friendly options)

### 1. Storybook Grove (cozy) — *cozy*
Warm hand-illustrated storybook-fantasy: soft gouache/watercolor washes inside clean ink outlines, like a premium children's picture-book RPG. Rounded friendly forms, midnight-garden palette kept gentle and glowy, visible paper-grain warmth without the literal felt-and-bead craft texture. Cozy and inviting, the softest of the three, but more crafted and painterly than the old paper-craft look.

### 2. Moonlit Vanguard (polished cel-shaded) — RECOMMENDED — *polished*
Clean modern-fantasy illustration, cel-shaded with confident dark-teal ink outlines, flat jewel-tone color-blocking, one crisp cel-shadow band and a warm gold rim-light. Heroic-chibi proportions with the polish of a premium mobile-RPG roster: distinct silhouettes that read instantly at portrait, battle, and 16px overworld sizes. Sophisticated and richly colored, unmistakably kid-friendly, the sweet spot for a 7-class tactical roster.

### 3. Enchanted Nocturne (painterly) — *painterly*
Lush painterly digital illustration with dramatic moonlit lighting, deeper contrast, bioluminescent sage-and-gold accents and glowing spore-motes, like the splash art of a high-end mobile RPG. Semi-stylized rather than chibi, the most mature-looking and atmospheric option while staying wholesome — trades some thumbnail readability and downscale-friendliness for mood.

**Recommended: Moonlit Vanguard (polished cel-shaded).** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-wardens-idle-portraits.md` — Sheet 1 — Warden battle idles + roster portraits
- `02-wardens-walk.md` — Sheet 2 — Warden overworld walk cycles
- `03-venue-spirits.md` — Sheet 3 — Venue plant-spirit enemies (critter / elder / boss)
- `04-overworld-tiles.md` — Sheet 4 — Overworld map tiles + venue faces
- `05-dungeon-tiles.md` — Sheet 5 — Dungeon interior tiles (per venue: floor / wall / boss dais)

## Style block (baked into every sheet prompt here)

```
STYLE — "Moonlit Vanguard": clean modern-fantasy illustration, cel-shaded, with confident 2-3px dark pine-teal ink outlines, flat color-blocking lifted by ONE soft cel-shadow band per form plus a warm gold rim-light along the upper-left edge and crisp specular glints. Semi-stylized heroic-chibi proportions — large readable heads, hands and key props, chunky simplified bodies — carrying the polish of a premium mobile-RPG roster: sophisticated and richly colored, never babyish, but always wholesome and kid-friendly (no gore, no blood, no menace, no weapons that read as real blades or firearms — blades are stylized leaf-fans). Subject world is a moonlit-garden botanical fantasy of nature-guardian wardens and mischievous, cute plant-spirits under a night sky. Palette: near-black pine #0e140d base, saturated sage #7ab356, antique gold #c8a84b, cream #e8dcc8, rose #e58fa0 accent, plus deep jewel supports amethyst #6c4ea0 and slate-teal #2f5d5a; jewel-tone saturation, clean smooth gradients, soft ambient occlusion pooled under each form. BOLD UNMISTAKABLE SILHOUETTES FIRST — every subject must read instantly at thumbnail size and hold up when nearest-neighbour downscaled to a tiny base grid, so keep shapes big, color-blocked and high-contrast with minimal fussy interior detail. Soft top-down key light, cool moonlit ambient fill, warm gold accent light. No photorealism, no 3D render, no text, no numbers, no captions, no borders, no UI, no logos, no watermark. Chunky arcade readability; every cut asset must compress cleanly under 150KB.
```

## Wire notes

INVENTORY IS CODE-ACCURATE — kept verbatim from art-asset-lists/barbrawl.md, which is keyed to the repo's real art seam. Only the STYLE was redirected (childish felt paper-craft -> polished cel-shaded \"Moonlit Vanguard\"); portal-safe nouns (Wild Wardens nature-guardians, plant-spirits, no bars/alcohol/weapons) are unchanged because the Sky Wolf portal is kid-safe.\n\nWHERE ART LANDS: cut each cell to a transparent PNG named EXACTLY the sprite key (e.g. steady_idle.png), drop into apps/mobile/assets/sprites/, and register one line each in apps/mobile/src/design/spriteAssets.ts (SPRITE_ASSETS, currently empty). Renderers already prefer a registered image over the procedural grid: PixelGrid.tsx (battle/enemies) and ImageSprite.tsx (overworld walk), keyed by spriteKey. Keys match docs/ART_SPEC.md sections 3-6 exactly.\n\nENGINEERING GAP (flag to Stephen — art shows nothing until this is wired): no screen currently passes spriteKey. To light these up: (1) add spriteKey to the <PixelGrid> calls in app/battle.tsx (~line 500) and preview.tsx; (2) swap the stacked-View PlayerSprite in app/map.tsx (~line 145) for <ImageSprite spriteKey=\"<id>_walk_<dir>_f<n>\">; (3) expand the venue->enemy sprite-key map to <prefix>_critter/_elder/_boss_idle. This is the same LOW-priority gap noted in the source list — art pack is ready ahead of the wiring.\n\nAUTHORING SIZE vs ENGINE GRID: author every cell at the sheet's cell size (512x512; boss column authored to fill the cell for its larger read) per the director's constraints, then downscale each CUT asset to its engine base grid BEFORE registering — idles/critters/elders/tiles/portrait -> 32-48px, overworld walk chibis + base tiles -> 16px, bosses -> 48px. The renderer nearest-neighbours to integer multiples (imageRendering:pixelated), so keep silhouettes bold; that's why the style clause demands high-contrast color-blocking. Every cut asset compresses well under 150KB. PNG 32-bit RGBA, hard alpha (0/255), no soft edges.\n\nORIENTATION/ANCHOR QUIRKS: walk sheet columns are locked order down_f0,down_f1,up_f0,up_f1,left_f0,left_f1,right_f0,right_f1; up = back turned (no face), down = facing viewer; feet anchored bottom-center on all 56 frames so the loop doesn't jitter; the engine may mirror left<->right, but all four are supplied. TILE KNOCKOUT IS SPLIT: seamless ground/floor/wall tiles are FULL-BLEED (magenta only in gutters, edges must tile), while venue-face buildings and boss daises are CUTOUTS (magenta behind the object) because they overlay other tiles.\n\nOUT OF SCOPE here (covered by the repo's own docs/ART_ASSET_LIST.md, ~670 sprites): attack/hit frames (SHOULD tier), item icons (26), skill-tree nodes (~112), consumables, resistance marks/VIP keys, status chips, FX particles, title wordmark. These 5 sheets are the MUST-tier visible-core set (Battle, Roster, Overworld, Dungeon).\n\nSUGGESTED PORTAL ASSET FOLDER: satellites/barbrawl/assets/sprites/ if/when it is vendored into the portal; native path stays apps/mobile/assets/sprites/.

