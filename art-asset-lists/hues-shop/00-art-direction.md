# Hues · Border Shop Expansion — art direction + economy design
*(Stephen 7/19: Hues is featured on Listdle. Build the shop out with a TON more unlockables, a balanced work-for-it-but-fun economy, borders with critters in the corners, claymation + crayon + more unique directions to mix and match.)*

## What Hues is
A fast color-matching game with a minimalist ink-on-charcoal UI. The one cosmetic surface today is the **frame around the color swatch** (the "Border Shop", CSS-drawn). Coins (🪙) come from Endless stages, the Daily, and daily goals. That frame is prime real estate: it sits on screen every second of play, so borders are the perfect flagship unlockable — plus swatch-back textures, coin skins, and win-burst styles as supporting lanes.

## The five style families (mix and match — every family ships borders + a pattern + FX so players can clash or coordinate)
1. **Clay Crew** (claymation) — hand-squished plasticine critters hugging the frame corners: thumbprints, fingernail dents, Aardman warmth. The critters are the stars Stephen asked for.
2. **Crayon Box** (crayon/kid-craft) — waxy scribbles, construction paper, finger paint, dot markers. Looks like the player's little sibling decorated it, on purpose, perfectly.
3. **Sticker Book** (my pick for the sleeper hit) — glossy die-cut stickers with white outlines slapped around the frame, slightly overlapping, one always half-peeling. Collectible energy; endless future packs.
4. **Pressed Garden** (elegant) — herbarium flowers, gold leaf, watercolor wash. The "grown-up" set that makes the game look gallery-beautiful for the players who don't want critters.
5. **Foil Arcade** (chase tier) — holographic trading-card foils, neon diner tubes, CRT scanlines. Shimmery showpieces priced at the top of the ladder.

## Economy (balanced: work for it, but fun)
Coin sources today: Endless stage clears, Daily Hue, daily goals. Target: a casual daily player earns ~400-600/day; a grinder ~1200.
- **Common** 250-400 🪙 (about a day) — 8 items: entry border from each family + basic patterns.
- **Uncommon** 700-1,100 (2-3 days) — 10 items.
- **Rare** 1,800-2,600 (about a week) — 8 items incl. the best critters.
- **Epic** 4,500-6,000 (a committed stretch) — 4 items: animated-feel borders (blinking critter eyes via 2-frame swap), holo foils.
- **Showpiece** 12,000 — 1 item: *Golden Chameleon* clay critter border (he slowly cycles hue — the perfect Hues mascot joke).
- **Earned-not-bought** (no price, no shortcuts, the bragging lane): Daily-streak 7/30 borders, Endless stage-15 border, Versus-win border, Perfect-daily (no misses) border. These make the shop feel like a trophy case, not a store.
- House rules: no loot boxes, no mystery pulls, prices visible, preview-before-buy, one free starter border per family after the first Endless run (taste of every style = the hook to collect the rest).

## The sheets
| # | file | contents |
|---|------|----------|
| 1 | `01-hues-clay-crew-borders.md` | 8 claymation critter borders (corner critters) |
| 2 | `02-hues-crayon-box-borders.md` | 8 crayon/craft borders |
| 3 | `03-hues-sticker-pressed-borders.md` | 4 sticker-book + 4 pressed-garden borders |
| 4 | `04-hues-foil-trophy-borders.md` | 4 foil-arcade + 4 earned-trophy borders |
| 5 | `05-hues-patterns-coins-fx.md` | 12 swatch-back patterns + coin skins + win-burst styles |

## Wire notes (engine, after art lands)
- Borders render as a 9-slice frame image around `.frame` (currently CSS `background`); corner critters live in the corner cells of the 9-slice so they never stretch.
- Two-frame "alive" borders (Epic tier): engine swaps `_a.png`/`_b.png` every ~1.6s (blink/wiggle) — trivial timer, no sprite engine needed.
- Shop tiles preview at ~150x100; borders must read at that size.
- New PROG fields: owned[], equipped, plus streak/stage/versus flags for the earned lane (some already tracked by goals).
