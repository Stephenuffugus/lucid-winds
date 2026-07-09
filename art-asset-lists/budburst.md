# BUDBURST — Sprite-Sheet Asset List

Botanical bubble shooter (Sky Wolf / Lucid Winds). The game is fully canvas-drawn and ships "zero-asset" by design. Its 6 gameplay colour-buds are the backbone of a 16-skin cosmetic economy (recoloured from `SKINS[].cols`, shape-read from `SKINS[].glyphs` for colourblind players) and MUST stay procedural — do NOT author sprites for the colour buds. This list only skins the three fixed-appearance surfaces that will not fight the skin system: the 6 equipable backgrounds, the 6 launcher pots, and the fixed-colour special tiles (bomb / rainbow / seed / thorn / boss core). Backgrounds are the biggest lift because garden worlds currently look identical during play.

## STYLE (shared — paste at top of every generation)
Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world with deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for targets/peaks. Tactile fiber-art materials: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Clean readable silhouettes first. Cute botanical critter energy, cozy-menacing bosses, never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a logo cell says exact logo text. Keep detail bold and simple enough that each cropped asset compresses well. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0.

Subject nouns for this game: paper-craft flower buds/blossoms, felt garden foliage, macrame vines, seed pods, brambles, a bloom-core boss, and little launcher pots — a cozy night greenhouse where you fire buds to burst clusters.

---

## Sheet 1 — Backgrounds (full-bleed atmosphere)
- File: `budburst_bg_sheet.png`
- Grid: 4 cols x 2 rows (8 cells; 7 used, 1 spare)
- Cell size: 1620 x 2880 px (portrait)
- Master size: 6480 x 5760 px
- Knockout: full-bleed art, no magenta inside a cell; magenta #FF00FF only in gutters between cells.
- CRITICAL for this game: each background must stay DARK and low-detail through the vertical center (that is where the bubble field and aim line sit — the play must read cleanly). Put all the painted foliage/glow/atmosphere at the top, bottom, and side edges as a soft vignette frame; keep the middle a calm near-black wash.

1. bg_menu_title — deep midnight greenhouse for the menu screen; hanging macrame vines and cut-felt leaves framing the top and both edges, a few glowing paper fireflies, warm gold rim-light; wide calm dark-green center left empty for the wordmark. No text.
2. bg_night — "Deep Night" default: near-black sage-green wall, faint felt foliage silhouettes only at the extreme edges, dark calm center, subtle paper-grain.
3. bg_dawn — "Dawn Mist": soft rose light blooming across the top edge, torn-paper mist ribbons along the horizon, dark cream-shadow base, calm dark center.
4. bg_dusk — "Violet Dusk": violet upper glow with layered cut-paper dusk clouds up top, a scatter of tiny bead stars, dark base, calm center.
5. bg_tide — "Tidewater": cool teal underwater hush, felt kelp and reed silhouettes at the side edges, drifting glass-bead bubbles rising, dark center.
6. bg_ember — "Ember Glow": warm coal-orange glow banked along the bottom and lower edges, dark smoky top, tiny gold ember sequins, calm dark center.
7. bg_aurora — "Aurora": nectar-green and mint aurora ribbons of translucent cut cellophane sweeping across the top, dark forest base, faint gold sparkle, calm center.
8. (spare — flat magenta #FF00FF)

---

## Sheet 2 — Props & special tiles (cutout sprites)
- File: `budburst_props_sheet.png`
- Grid: 4 cols x 3 rows (12 cells; 11 used, 1 spare)
- Cell size: 512 x 512 px
- Master size: 2048 x 1536 px
- Knockout: Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- All items read at small size (buds render ~44 px, launcher ~90 px wide), so keep silhouettes chunky and bold. Special tiles are fixed-colour on purpose — do NOT tint them to any garden hue.

Launcher pots (the vessel at the bottom that fires the buds; design as a small pot/mouth facing up, rim roughly across the horizontal center):
1. launcher_clay — humble terracotta clay pot, cut-paper with a stitched rim and a warm earthy body. Cozy, plain.
2. launcher_brass — warm brass horn/funnel launcher in gold-foil paper, gently flared mouth, soft specular sheen.
3. launcher_stone — carved cool grey stone basin in felt, chiseled facets, mossy fleck accents.
4. launcher_crystal — faceted crystal-bloom launcher, translucent bead facets refracting sage and rose light.
5. launcher_vine — living woven-vine launcher of macrame cord wrapped around a bowl, sprouting little felt leaves.
6. launcher_gold — gilded nectar-gold cup, antique gold body with a soft rose inner glow, tiny sequin sparkle.

Special tiles (bubble-scale, fixed colour — these bypass the skin recolour):
7. bud_bomb — dark seed-pod "bomb" bud, near-black felt sphere with a lit antique-gold spark/star on top; cozy, not menacing.
8. bud_rainbow — prismatic wildcard bloom: six cut-paper petals in a full spectrum ring around a cream felt center; a wildcard that matches any colour.
9. bud_seed — golden sprouting seed pod (the rescue target): a gold felt seed with a tiny curling green sprout, glossy bead highlight.
10. bud_thorn — grey-green bramble thorn knot: tangled macrame cord with little spikes, an X of dark thorns across it; cozy-menacing, blocks the field.
11. boss_bloom_core — the "Bloom Core" boss tile: a deep-rose pulsing flower core with antique-gold spokes radiating outward, layered paper petals, a faint implied cozy-menacing face; reads as the thing you must destroy.
12. (spare — flat magenta #FF00FF)

---

## WIRE NOTES
- Backgrounds → hook `applyBg()` (~line 753); it currently sets a radial-gradient on `#app` from `equippedBg().top/bot`. Swap for `background-image:url(assets/bg/<id>.jpg)` keyed by `equippedBg().id` (BGS ids: night / dawn / dusk / tide / ember / aurora). Wire `bg_menu_title` behind `#menu` (or `body`). Folder: `assets/bg/`
- Launcher pots → hook the launcher-base draw in `render()` (~lines 1246-1249), keyed by `equippedLauncher()` (LAUNCHERS ids: clay / brass / stone / crystal / vine / gold). Replace the `ctx.arc(...)` half-dome with `drawImage(assets/launcher/<id>.png)` centered at `shooterOrigin()`, width ~R*3. Folder: `assets/launcher/`
- Special tiles → hook `drawBud()` (~line 1135) in the `bomb / rainbow / seed / thorn / core` branches. Add an art lookup (e.g. `window.BB_ART[kind]`) that `drawImage`s the sprite at the cell when loaded, else falls through to the existing procedural draw (keep it as the fallback). Folder: `assets/tiles/` (bud_bomb, bud_rainbow, bud_seed, bud_thorn, boss_bloom_core → core).
- DO NOT sprite the `kind:"bud"` colour buds or the shop skin previews (`drawGlyph` / `_drawGlyphOn`): the 16 SKINS recolour them and swap glyph shapes for colourblind reads. Sprites would kill the whole cosmetic economy.
- Load images once at boot into an `Image()` cache; gate each `drawImage` on `img.complete`. Cache-bust the src with `?v=<build>` per fleet rule so the host image resizer/cache does not serve stale art. Verify every final cut asset compresses under 150 KB (the dark, low-detail backgrounds will easily).
