# Lucid Winds / Sky Wolf — Game Art Asset Lists

Sprite-sheet prompt docs for generating game art, in the format that skinned **Nectar Drop** (shared house STYLE, titled contact sheets, magenta #FF00FF knockout, cell prompts keyed to each game's real render code). Covers **satellite** games (this repo) + **external-repo** portal games.

**Flow:** pick a game → open its `.md` → paste each Sheet's STYLE + prompt into your generator → drop the PNGs to me → I cut (magenta-key knockout) + wire them.

**Do-first order** below is my practical ranking (newer/featured + high visual lift + ready to drop in). *Ready* = pays off the moment art lands; *needs wiring* = I add draw-call hooks first (short pass); *engine reskin* = framework game, bigger job.

## Make queue — 13 games, ~505 assets, ~47 sheets

| Do | Game | Src | Genre | Sheets | ~Assets | Ready |
|----|------|-----|-------|--------|---------|-------|
| 1 | [Glyph Forge](glyph-forge.md) | ext | Roguelite deckbuilder (rune-fu | 3 | 45 | drop-in |
| 2 | [Picnic Panic](picnic-panic.md) | sat | Fixed-swarm arcade shooter (Ga | 5 | 56 | drop-in |
| 3 | [Sproing](sproing.md) | sat | Botanical vertical jumper (Doo | 4 | 36 | drop-in |
| 4 | [Budburst](budburst.md) | sat | Bubble shooter (botanical, 12  | 2 | 18 | drop-in |
| 5 | [pollen-panic](pollen-panic.md) | sat | Maze arcade (Pac-Man-style, bo | 4 | 24 | drop-in |
| 6 | [Tarot Run](tarot-run.md) | ext | Roguelite deckbuilder / turn-b | 8 | 90 | drop-in |
| 7 | [Tomato Man](tomato-man.md) | ext | Top-down sun-shadow dash survi | 4 | 37 | needs wiring (loader stubbed) |
| 8 | [Grubtrap](grubtrap.md) | sat | Grid puzzle-action — cozy Rode | 2 | 17 | drop-in |
| 9 | [Hedgerow](hedgerow.md) | sat | Puzzle / arcade — JezzBall-sty | 2 | 17 | drop-in |
| 10 | [Hunch](hunch.md) | ext | AI drawing-guess duel / party  | 2 | 7 | drop-in (small overlay) |
| 11 | [petalvex](petalvex.md) | sat | Logic puzzle — botanical Tetra | 4 | 24 | drop-in |
| 12 | [Rootbound](rootbound.md) | sat | Sliding-block puzzle (Klotski) | 2 | 11 | drop-in |
| 13 | [BarBrawl](barbrawl.md) | ext | Location-based RPG / dungeon-c | 5 | 123 | engine reskin (React-Native) |

## Skipped (14) — already skinned or intentionally art-free

| Game | Src | Status | Why |
|------|-----|--------|-----|
| Shell Shuffle | sat | complete | Skip — every cup and ball is already skinned by 94 baked-in WebP data URIs plus CSS/SVG ball a… |
| Sixfold | ext | complete | SKIP — art-complete, no work needed. Full gap-check passed: 70 character sprite sheets (6-fram… |
| Vine Runner | sat | complete | Skip — every ART hook is already filled with real PNGs in art/ (13 slots + 2 full bonus skins)… |
| bloom-breaker | sat | procedural-by-design | Skip: fully procedural Canvas 2D game with no image-loading path; its 7 paddles / 7 balls / 6 … |
| blooming-words | sat | procedural-by-design | Skip — it's a fully-realized cyanotype vector word game (no canvas, no bitmaps; letter discs +… |
| bloomzap | sat | procedural-by-design | Skip — fully typographic word game (live letter tiles + planted-word chips are dynamic text fr… |
| Hue Match | sat | procedural-by-design | Skip — pure color-perception puzzle; swatches must stay flat for the deltaE2000 math, the HSV … |
| Letter Launch | ext | procedural-by-design | SKIP sprite art. Letter Launch is a single-canvas, fully vector/typographic game (docs/game.js… |
| Pom Pond | ext | procedural-by-design | SKIP — do not author an asset list. Pom Pond's entire art surface is a deterministic hash-to-S… |
| Pong Arena | sat | procedural-by-design | Skip: pure vector/neon-arcade renderer with a hundreds-strong retint-based procedural skin eco… |
| Skitterlings | ext | procedural-by-design | SKIP — do not author sprites. Skitterlings is intentionally 100% procedural: a seed->traits en… |
| Sweet Spot | ext | procedural-by-design | SKIP — procedural-by-design. Lowest priority (skip-tier); no sprite sheet authored, and I reco… |
| Tally | ext | procedural-by-design | SKIP — do not author a sprite sheet. Tally is intentionally procedural/typographic and would n… |
| vinewinder | sat | procedural-by-design | Skip — the vine is a fluid recolored spline and the whole cosmetic economy is color palettes (… |

## Already skinned up front (not re-assessed)
nectar-drop (371), garden-td (90), bramblewick (73), burr-blast (72), mahjong (66), sprout-dice (53), petal-plunge (49), pitbike-rally (33), sixfold (external, gap-checked complete).

## Not covered
- **word_stack** — no game (README only, no Pages site).
- Any repo not yet cloned — point me at it and I'll extend this.

> Note: external-game priority numbers inside individual docs came from separate agents on inconsistent scales; trust the **Do** order in this table, which I normalized by hand.
