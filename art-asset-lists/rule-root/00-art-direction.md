# Rule Root — Art Pack

> The rules of this garden are written on pushable tiles. Push a word out of line and the wall forgets itself. Some rules are gripped by golden roots, and those you must dig free.

**Genre:** Baba Is You style rule-rewriting grid puzzle (single-file HTML5 canvas, 540×960 portrait, DOM screens over a canvas board). Word tiles on the grid form rules by lining up three in a row (SPROUT IS YOU, STONE IS STOP); every word tile is pushable, so the player rewrites reality to reach the bloom. 14 hand-authored solver-proven levels across 4 chapters. Signature twist: **Root Words** — one gold word tile per late level is gripped by glowing roots and cannot be pushed until the player tramples the root knot hiding somewhere on the board. Full undo, seeds on detour paths, keepsake blooms per chapter, D-pad + swipe movement.

_The game already ships and plays procedurally (`satellites/rule-root/index.html`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game wardrobe economy. Word text is ALWAYS engine-rendered over the tile plates, so every plate in these sheets stays text-free. Grid geometry, rule parsing and the colorblind shape-badges are IDENTICAL across all themes; only the skin changes._

## Pick a look — theme direction

⚖️ **Director note:** per-game direction, no forced cozy-botanical house style. This game is *about words*, so the strongest themes treat the tiles as artifacts of writing: carved, painted, or gilded.

### 1. Illuminated Herbal ⭐ RECOMMENDED (polished, kid-friendly, quietly mature)
*A medieval herbal manuscript come alive at night. Word tiles are vellum plates with inked borders; active rules join with hand-drawn flourish underlines; GOLD ROOT WORDS are true gold-leaf, gripped by illuminated root tendrils straight out of a manuscript margin. Objects are marginalia paintings: a plump inked sprout, a woodcut stone, thorny margin-vines, a little gilt pond. The board is a dark writing-desk garden.*

**Why this one:** the Root Word twist IS gold leaf — the game's one unique mechanic gets the most premium visual metaphor for free, and locked-vs-free rules read instantly (gilded+gripped vs plain vellum). Vellum plates keep engine-rendered words maximally legible (the whole game is reading). It sits native on the locked midnight palette (#0d100c void, #c8a84b gold, #e8dcc8 cream), and it is distinctive next to the other Sky Wolf packs (no other game owns "manuscript"). Kid-friendly but not babyish — exactly the cozy→mature middle Stephen asked the packs to span.

### 2. Toy Garden Blocks (alt, coziest)
*Word tiles as chunky painted wooden toy blocks; objects as felt and clay miniatures in a shoebox diorama garden.* Warm and instantly charming, and blocks say "push me." But gold-leaf reads better than gold paint for the root-lock fantasy, and the toy look overlaps with other cozy packs in the portal.

### 3. Woodcut Fable (alt, most mature)
*Everything as bold black woodblock prints with a single gold spot-color on root words; heavy carved outlines, paper grain.* Striking and cheap to cut, but high-contrast black plates fight the word legibility rule at small tile sizes, and it reads oldest of the three.

**Recommendation: Illuminated Herbal.** Native gold-lock metaphor, best text legibility, locked-palette compatible. Keep Toy Blocks as the cozy alternate; hold Woodcut as a possible premium tile-theme unlockable later.

## Sheets (generate each separately)

- `01-ruleroot-objects.md` — Object stamps (sprout / stone / vine / pond / gate / bloom / root knot / seed) + the six property badge glyphs + the 3 walker skins
- `02-ruleroot-tiles.md` — Word-tile plates for all three wardrobe themes (Parchment / Slate / Neon Runes) + gold root-word plate + locked tendril grips + rule underline caps — ALL TEXT-FREE
- `03-ruleroot-backgrounds.md` — Board backdrops (Night Soil / Moss Library / Dawn Terrace) + full-bleed title screen
- `04-ruleroot-ui.md` — D-pad, HUD chips, level/chapter cards, win panel plates
- `05-ruleroot-fx.md` — rule-form flash, rule-break scatter, root-unlock burst, trample poof, sink splash, win bloom, hint shimmer
- `06-ruleroot-cosmetics.md` — Wardrobe catalog cells (3 tile themes, 3 walkers, 3 gardens) + grove keepsake blooms — 💰 COSMETICS / ECONOMY

## Cosmetics economy

Everything is earned by **PLAYING** — no loot boxes, no randomized purchases, nothing that changes puzzles, hitboxes or solutions. Every locked wardrobe card shows its exact requirement with live progress. Three families, all already wired in `ruleroot_save` (fields `eq:{tile,walker,bg}`, thresholds read from `life.solves`, `life.seeds`, `daily.streak`):

- **Word-tile themes** (`TILETHEMES`): *Parchment* (free) → **Slate** (solve **6** gardens) → **Neon Runes** (solve all **14**). Faucet: `life.solves`.
- **Walker skins** (`WALKERS`, reskins the YOU sprout): *Sprout* (free) → **Pebble** (find **5** seeds) → **Spark** (**3-day** Daily Root streak). Faucets: `life.seeds`, `daily.streak`.
- **Gardens** (`BGS`, board backdrop + grid tint): *Night Soil* (free) → **Moss Library** (solve **10**) → **Dawn Terrace** (find **10** seeds).

Seeds are the completionist faucet (one optional seed per level on a harder detour, solver-proven collectable); the Daily Root streak is the lapsed-friendly return loop. Sunbeams stay the earn currency only (`_sbCapEarn`, key `sw_sb_ruleroot`, 30/day, 12/run: 1 per first-solve, 2 per chapter keepsake, 3 per daily +1 under par; Zen pays 0).

## Style block

```
STYLE — "Illuminated Herbal" (Rule Root / Sky Wolf Studios manuscript puzzle-garden). A medieval herbal manuscript opened on a midnight writing desk: vellum word-plates, inked marginalia garden objects, true gold-leaf accents for root-gripped rules. Chunky, rounded, softly-lit shapes with confident dark ink outlines (nothing scratchy, nothing scary); one soft candle-warm key light from upper-left, gentle parchment texture, restrained gilding that glows without blooming. Reads instantly at thumbnail size; objects must stay recognizable at 44px. Palette (locked to the game's real values): midnight void #0d100c / #0b0f0b, board soils #11150e / #0e1a14 / #1d1512, grid line #2a331f, vellum plate #d8c9a3 -> #b7a475, slate plate #7e8a96 -> #5a6470, neon rune plate #1a1030 with #e0c9ff / #7fe0d0 glints, ink #241c08, rubric #7a4a12, cream #e8dcc8, sage #7ab356 / leaf #9ed07a / deep vine #5c8f3f, gold leaf #c8a84b + hot gilt #ffe9a8, stone #6f7a72 / #8b968e, pond #27506e / #5b9bd5 / dew #bfe0f2, bloom pink #e58fa0, thorn warning #e56b6b, gate timber #8a6a3a, seed husk #b98b4e, muted moss #8a9178. Rendering: soft cel with paper grain, inked outlines, NO photoreal, NO lens effects, NO text / letters / numbers / logos / watermarks baked into ANY art (all words are engine-rendered on top of the plates). Each PNG must compress under 150KB. Per-sheet knockout / layout rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural canvas draws in `/workspaces/lucid-winds/satellites/rule-root/index.html`; keep every existing canvas fallback as an absent-asset safety net (gate each blit behind an image-loaded check). Asset folder: `/workspaces/lucid-winds/satellites/rule-root/assets/` (subfolders `obj/`, `tiles/`, `bg/`, `ui/`, `fx/`, `cosmetics/`). Path-version every file (`?v=BUILD`) per the Hostinger resizer rule; ship only <150KB cut cells. Map:
- `rr_objects.png` → `drawObj()` (~line 780): the eight object stamps replace the vector glyphs (sprout/stone/vine/pond/gate/bloom/root/seed); the property badges replace the drawn YOU ring / WIN star / STOP frame / PUSH arrows / thorn spikes / sink ripple (same corner anchors); walker cells key off `PROG.eq.walker` in the sprout branch.
- `rr_tiles.png` → `drawWord()` (~line 860): plate gradients per `TILETHEMES[PROG.eq.tile]`, gold plate for `e.g`, tendril grips + glow ring for `locked` tiles, underline caps for the rule-link stroke drawn in `render()` (green active / gold locked).
- `rr_bg.png` set → `render()` background gradient + grid tint per `BGS[PROG.eq.bg]`, plus the `s-title` screen backdrop.
- `rr_ui.png` → `.dbtn` D-pad plates, `.hbtn` HUD chips (menu/hint/undo/retry), `.lvlcard` level cards + chapter plaques, `s-win` panel framing, `#soft` softlock card.
- `rr_fx.png` → rule-form flash, rule-break scatter shards, root-unlock burst (drawn where `sndRoot()` fires), trample poof, sink splash, win wash (`st.won` overlay), hint shimmer frame.
- `rr_cosmetics.png` → wardrobe cards in `buildWardSec()` (`.wcard`), the three theme/walker/garden previews, and `drawKeepsake()` grove blooms (~line 960).

Bump the asset cache version on any art change and cache-bust `img.src` with `?v=BUILD`.
