# Pollen Panic — Art Direction

> A midnight-garden Pac-Man: pilot a glowing bug through hedge mazes, gobble pollen seeds, gulp a bloom to turn the tables on cozy-menacing pests, and cash in a train of woken sprout drones.

**Genre:** Arcade maze-chase (Pac-Man-style) with a botanical/garden skin, 6 theme worlds, 8 collectible critter skins, 4 pest AI personalities, a drone "ghost-train" cash-in mechanic, and a sunberry bonus.

## Pick a look (kid-friendly options)

### 1. Nightbloom Gouache — *painterly*
Hand-painted storybook garden at night: soft gouache brush texture, visible paper tooth, warm layered washes and dabbed highlights instead of flat fills. The cozy end of the range — critters read as illustrated picture-book bugs with rosy cheeks and hand-drawn charm, palette anchored on deep loam green #0e140d, sage #7ab356, antique gold #c8a84b, cream #e8dcc8 and a rose #e58fa0 accent. Warmest, gentlest, most bedtime-story of the three.

### 2. Luminous Vector Nocturne — *polished* ⭐ RECOMMENDED
Clean modern-arcade vector illustration built for a glowing midnight maze: crisp flat shapes with smooth cel gradients, glossy bead-shine catchlights, thin confident ink accents, and soft bioluminescent rim-glow (warm gold on one side, cool moon-cyan on the other). This is the most POLISHED, mobile-arcade-store look — sophisticated but fully kid-friendly, and it leans into the game's existing per-theme glow system while compressing tiny and reading instantly at maze scale.

### 3. Glossy Garden Enamel — *bold*
Hard-enamel-pin / designer-vinyl-toy aesthetic: thick clean unifying outlines, high-gloss lacquered surfaces, jewel-saturated color blocking and metallic-gold trim like a collectible pin set. The boldest option — chunky, toyetic, ultra-readable silhouettes that pop off any dark backdrop. Great for a merch-forward brand feel; slightly heavier files than the vector route but still under budget.

**Recommended: Luminous Vector Nocturne.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-pollen-panic-players.md` — Sheet 1 — Player Critter Skins
- `02-pollen-panic-pests.md` — Sheet 2 — Pests, States, Drones, Sunberry
- `03-pollen-panic-backdrops.md` — Sheet 3 — Theme Backdrops (Garden Floors)
- `04-pollen-panic-logo.md` — Sheet 4 — Logo Wordmark

## Style block (baked into every sheet prompt here)

```
STYLE — LUMINOUS VECTOR NOCTURNE. Bright, clean modern-vector illustration for a midnight-garden arcade maze-chaser (Pac-Man energy). Crisp flat vector shapes with smooth cel-shaded gradients, subtle ambient occlusion under forms, glossy specular bead-shine catchlights on eyes and shells, and thin confident ink-line accents — polished mobile-arcade art, NOT paper-craft, felt, or collage. Every character carries a soft bioluminescent rim-glow: warm gold key-light on one side, cool moon-cyan glow on the other. Palette: near-black garden base #0e140d, electric sage #7ab356, luminous lime #b7e86f, antique gold #c8a84b, warm cream #e8dcc8, rose-glow accent #e58fa0, moon-cyan glow #7fd8ff. Bugs and garden pests are rounded, chunky, cute-but-sophisticated with big readable silhouettes and gentle inner glow. Cozy-menacing pests are mischievous and never scary; nothing grim, no gore, no fangs, no horror — kid-friendly throughout. Chunky arcade readability at tiny sizes, one clean central silhouette per cell first, generous padding. No photorealism, no 3D render, no visible pixels or dithering, no text labels, no captions, no borders or frames, no UI words unless a logo cell states exact text. Keep shapes bold and simple enough that each cropped asset compresses cleanly under 150KB.
```

## Wire notes

No ART hook exists yet — add a window.PP_ART image map and gate each procedural draw on it (art replaces the procedural draw when a sprite is present, exactly like the Nectar Drop pattern). Recommended folder: satellites/pollen-panic/assets/. Cache-bust every img src with ?v= on deploy. Mappings: Sheet 1 -> drawPlayer() (index.html:687), key by save.skin (ladybug/bee/firefly/dew/moth/ember/scarab/jade from the SKINS map at :160); render the sprite UPRIGHT with NO ctx.rotate (asymmetric bugs would flip) and fake the chomp with a small code-side vertical squash on chompT (:690), falling back to the procedural mouth-arc when the sprite is absent. Sheet 2 -> drawPest() (:732) key p.id to pest_aphid/pest_wasp/pest_mantis/pest_snail (PESTS at :258-261); frightened state -> pest_wilted (drawWilted :706); state===\"eaten\" -> pest_eaten_puff (drawEaten :716); the drone loop in frame()/render (:805) uses d.state===\"sleep\" -> drone_sleep else drone_awake, and frightened drones already reuse drawWilted (:808); drawFruit() (:656) -> sunberry_fruit; keep the existing bob offsets in code. Sheet 3 -> renderMazeOffscreen(): drawImage(PP_ART.bg[save.theme],0,0,w,h) BEFORE the hedge strokes, keyed by the 6 THEMES keys (day/moonlit/autumn/glass/desert/fungal at :152-159); invalidate offMaze=null on theme change (already done in the shop equip path at :924/:929). Sheet 4 -> menu: swap #menu .card h1 for the logo image. KEEP PROCEDURAL, do NOT skin: hedge maze strokes (renderMazeOffscreen, recolored per theme), seed dots (drawSeed :633, 2-9px + 4 seed styles + theme recolor), bloom power-pellets (drawBloom :649, theme recolor + pulse), and trail particles (drawParticles) — these are runtime-recolored across all 6 theme palettes and sprites would fight the theme system.

