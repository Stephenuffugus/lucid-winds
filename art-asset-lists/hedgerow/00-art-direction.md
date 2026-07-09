# Hedgerow — Art Direction

> A meditative moonlit-garden JezzBall: sprout hedge walls both ways across a tilled bed, corner the bouncing bugs, and reclaim the soil before a growing wall gets bumped and wilts.

**Genre:** Territory-capture puzzle-arcade (JezzBall remake) — grow hedge walls to fence bouncing garden pests into a corner and reclaim 75% of the bed

## Pick a look (kid-friendly options)

### 1. Moonlit Botanical — *painterly* ⭐ RECOMMENDED
A polished picture-book-cover look: soft gouache brushwork fused with clean vector-readable silhouettes, set in a hedge garden at dusk under moonlight with a warm gold rim. Deep cool night palette — near-black pine and teal-green shadows, emerald and living-sage midtones, moon-cream highlights, antique gold rewards, a single rose accent, and bioluminescent gold-green glow on anything alive. Bugs stay cute and plump but are rendered with real illustration volume and soft glow, so it reads sophisticated and calm rather than childish, while chunky shapes keep every critter legible as a bouncing ball at 26px.

### 2. Storybook Hedge Maze — *cozy*
A warm hand-painted watercolor-and-ink storybook, golden-hour instead of midnight: cream paper tooth, loose inked outlines, honey and moss greens, dusty-rose blossoms. Friendly rounded topiary and chunky ladybug-cute bugs with dot eyes and soft cheeks. Cozier and warmer than the recommended pick — keeps the handmade charm of the old brief but trades literal felt/paper-craft for refined watercolor so it never feels like a kids' craft kit.

### 3. Neon Topiary Arcade — *bold*
A crisp modern flat-vector arcade skin with clean glow: near-black charcoal-green board, hedges in electric lime and emerald with soft outer-glow edges, bugs as bright high-contrast gumdrops with simple geometric faces, gold and cool-cyan reward pops. Highest readability and the most 'game-y', energetic feel; leans younger and punchier than the painterly pick but still tidy and grown-up, not cutesy.

**Recommended: Moonlit Botanical.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-hedgerow-sprites.md` — Sheet 1 — Sprites (pests, tiles, icons, fx)
- `02-hedgerow-bg.md` — Sheet 2 — Backgrounds (full-bleed portrait)

## Style block (baked into every sheet prompt here)

```
STYLE — Moonlit Botanical (Hedgerow). Polished painterly garden-at-dusk illustration: soft gouache brushwork fused with clean, vector-readable silhouettes — the refined look of a modern picture-book cover, never childish and never a hard photoreal 3D CG render. A twilight hedge garden lit by cool moonlight from above and a warm gold rim from the side, with a gentle bioluminescent gold-green glow on fresh growth and on the little garden bugs. Deep, rich, slightly cool night palette: near-black pine #0b140f and deep teal-green #12241a in the shadows, emerald #1f5a34 and living sage #7ab356 midtones, soft moon-cream #e8dcc8 highlights, antique gold #c8a84b for rewards and rim-light, a single warm rose #e58fa0 accent for targets and blossoms, and a cool moon-teal #8fd6c4 for glow. Forms are rounded and tactile with soft volumetric shading, a faint canvas-grain texture, delicate edge highlights, and a light glow bloom on anything alive; the bugs are cute, plump and appealing with big friendly eyes and rosy cheeks — cozy-charming, absolutely never scary, grim, gory, creepy or sexualized. Clean chunky arcade readability comes first: every critter must read as a distinct bouncing ball at ~26px and every tile at ~34px, with bold simple shapes and strong figure-ground separation. No photorealism, no hard 3D render, no text, letters, numbers, captions, UI, watermarks, borders or frames anywhere in the art. Keep detail bold and economical so each cropped asset compresses cleanly under 150KB.
```

## Wire notes

Folder: satellites/hedgerow/assets/ — hedgerow_sprites.png and hedgerow_bg.png. No ART hook exists yet; add a light fleet-standard image loader that draws sheet cells over the existing Canvas2D primitives. MAP: pest_ladybug/beetle/snail/aphid/caterpillar/grub (sheet1 cells 1-6) -> drawPest() at L450, indexed by balls[i]%roster (the code currently cycles 5 BALL_COL slots at L195/L228 — extend to index the 6-sprite roster). soil_tile (cell 7) -> field fill at L402 (replaces the #181109 fillRect). hedge_tile (cell 9) -> committed-wall cell draw where grid v===2 at L412. ground_planted (cell 10) -> claimed-cell draw where grid v===1 at L410. hedge_grow (cell 8) + sprout_tip (cell 11) -> growing-wall block + glowing tips at L420-427. leaf_life (cell 12) -> drawLeaf() HUD lives at L388/L449. sunbeam (cell 13) -> level-clear banner (L445) and over-sun reward (L363). fx_wilt (cell 14) -> wiltWall() burst at L276. fx_sparkle (cell 15) -> levelClear()/floodClaim claim bursts at L348/L311. bg_title (sheet2 cell 1) -> CSS background-image on #s-title (reuse on #s-over). bg_game (sheet2 cell 2) -> drawn first in render() replacing the L379 gradient. ENGINE QUIRKS: pests are never rotated (draw radially balanced, top-down 3/4); sprout_tip must be direction-neutral (wall grows in 4 directions); tiles 7-11 must be seamlessly tileable at CS~34px. DEPLOY: lucidwinds.com down-rezzes raw images over 1600px (host resizer note), so ship the 2560px sprite sheet as a .bin loaded via fetch->blob, and path-version or ?v=BUILD cache-bust on load; each cut asset must compress under 150KB.

