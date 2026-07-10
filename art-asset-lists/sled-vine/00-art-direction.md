# Sled Vine — Art Pack

> Draw a glowing line and a seed-sled rides it: downhill momentum, ballistic hops off the ends, bloom gates to thread, and a trail that sprouts leaves behind the runners — finish clean and the whole ride blooms.

**Genre:** Draw-the-line rider (Line Rider lineage) recast as a botanical puzzle. Player inks polylines from a fixed ink pot; a single-mass seed-sled rides them under gravity through shaped gates (ring / diamond / star — colorblind-safe by silhouette) into a goal flower. Signature **Living Trail**: ink sprouts leaves wherever the sled has ridden, and a finished trail blooms end-to-end, pressing a keepsake flower into a persistent Grove.

_The game already ships and plays procedurally (`satellites/sled-vine/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game wardrobe economy._

## Pick a look

### 1. Moonlit Inkwash  ← RECOMMENDED
*Sumi-e ink-wash botany on deep night paper: every line is a luminous brush stroke with a wet bleed edge, foliage rendered in two or three confident strokes, gold-leaf accents on gates and blooms, faint paper grain in the dark field.* The player's core verb IS drawing a line, so an art style built from visible brushwork makes the mechanic and the aesthetic the same thing. Reads instantly at thumbnail size, separates hazards by stroke character (thorn strokes are dry and spiky, safe ink is wet and smooth), and sits naturally in the Lucid Winds midnight palette while feeling like nothing else in the portal.

### 2. Alpine Linocut (alt, more mature)
*Vintage ski-poster linocut: bold carved shapes, two-tone gradients, dramatic diagonal compositions.* Handsome and grown-up, strong motion feel, but carved texture can fight the thin 3px gameplay lines and it drifts from the botanical fiction.

### 3. Firefly Chalkboard (alt, cozier)
*Night-school chalkboard: chalk-stroke lines, smudged eraser ghosts, firefly motes.* Warm and playful, the eraser tool literally fits, but low contrast risks mud at gameplay scale and it reads younger than the Director's range.

## Sheets (generate each separately)

- `01-sledvine-sleds.md` — Sled Skins — seed, leafboard, acorn, dragonfly + ride states — 💰 COSMETICS
- `02-sledvine-trail.md` — Trail, Gates & Hazards — ink strokes, leaves, gates, goal flower, thorns, perch
- `03-sledvine-backgrounds.md` — Backgrounds & Screens — Full-Bleed Portrait
- `04-sledvine-ui.md` — UI / HUD — buttons, chips, ink meter, cards
- `05-sledvine-fx.md` — FX & Feedback — gate chime burst, bloom wave, crash puff, keepsakes

## Cosmetics economy

All Sled Vine cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, no pay-to-win, nothing that changes physics, ink budgets, or gate hitboxes. Every unlock is a KNOWN threshold the player can read in the Wardrobe before earning it. Lanes as shipped in `sledvine_save`: (1) **Trail mastery** — sled skins ride the trial ladder (Seed free, Leafboard at 4 trails cleared, Golden Thread ink as the all-12 capstone). (2) **Gate mastery** — lifetime gates threaded unlock the Acorn sled at 25 (counter already tracked as `PROG.gates`). (3) **Daily loyalty** — the Dragonfly sled needs a Daily Ride streak of 3, and future seasonal ink colors should follow the same streak lane (7/30 day milestones). Ink styles restyle the player's drawn line itself (plain sage, dashed Woven Vine at 8 trails, Golden Thread at 12), which makes mastery visible in every screenshot a player shares. The Grove keepsakes minted by first-clears and daily wins are the native collection wall; art for them lives on sheet 05. Optional soft-coin: portal Dew may early-unlock the CURRENT season's ink color only — convenience, capped, never exclusive, and never Sunbeams (Sunbeams stay the earn currency, 30/day, cap 12/run via `_sbCapEarn`).

## Style block

```
STYLE — "Moonlit Inkwash" (Sled Vine / Lucid Winds midnight-garden sumi-e). Luminous ink-wash botanical art on deep night paper: every subject built from a few confident wet brush strokes with soft bleed edges and visible stroke direction, foliage in 2-3 strokes, thin gold-leaf accents catching moonlight on gates, blooms and highlights. Crisp silhouettes over minimal interior detail (NO photoreal rendering, NO 3D gloss, NO hard vector outlines); shapes must read instantly at thumbnail size. Consistent flat front-on camera, subjects centered and upright in their cells. Deep-night palette — void #0d100c and #05070a, paper-grain charcoal #10150f; ink sage #7ab356 over deep #3f6b34 with wet-highlight #9ccf74; gold-leaf #c8a84b with hot accent #ffe9a8 and cream #e8dcc8; muted moss #8a9178, dusk line #2a331f; dew blue #bfe0f2 over moon #5b9bd5; bloom rose #e58fa0; thorn plum #7d3450 with warning tips #e56b6b; warm bark #6b5330 / #5c3a1a. Season tints — spring rose #E8A0BF, summer gold #D4A843, autumn copper #D4842A, winter ice #A0C4E8. Lighting is nocturnal: strokes glow faintly from within, gold leaf sparks at edges, everything else stays low-key and moody. Hazards must differ by SHAPE and stroke character (dry spiky thorn strokes vs smooth wet safe ink), never by color alone. Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons are pictographic only). Each PNG must compress under 150KB. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural draws in `/workspaces/lucid-winds/satellites/sled-vine/index.html`; keep the canvas fallbacks as absent-asset safety nets. Asset folder: `/workspaces/lucid-winds/satellites/sled-vine/assets/` (subfolders: `sleds/`, `trail/`, `backgrounds/`, `ui/`, `fx/`). Path-version every file (`?v=<build>`) per the Hostinger resizer rule; ship only the <150KB cut cells. Map: `sledvine_sleds.png` → the sled skin branch in `render()` (`skin==="leafboard"` / `"acorn"` / `"dragonfly"` / default seed) — engine rotates the sprite by velocity angle, so bake sprites facing RIGHT. `sledvine_trail.png` → `drawPoly()` player-ink stroke caps and the three `PROG.ink` styles, the leaf glyphs in the Living Trail block (`G.leaves` ellipses), `drawGateShape()` ring/diamond/star (idle + lit), the goal flower draw in `render()` (waiting + all-gates-lit states), thorn strokes + tips, terrain branch strokes, and the spawn perch. `sledvine_bg.png` → `#wrap`/`#stage` gradients, the canvas backdrop + pollen field, and the `.screen` title/trials/over panels, tinted per season. `sledvine_ui.png` → `.btn`/`.btn.primary` plates, dock `.chip` frames + Draw/Erase/Clear/Ride/Stop glyphs, the `#inkbar` frame + fill, `#goalchip` pill, `.lvlcard` and `.grovecard` frames, toggles. `sledvine_fx.png` → `burst()` particles (gate gold, crash rose), the end-of-run bloom wave along the trail, and `drawKeepsake()` pressed-flower elements (petal set, stem stroke, leaf pair). Bump the asset cache version on any art change.
