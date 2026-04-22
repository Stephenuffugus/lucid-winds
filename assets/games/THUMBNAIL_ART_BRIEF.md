# Thumbnail Art Brief

Reference: 2026-04-22 audit. See `reference_game_catalog.md` in memory for full game roster.

## Spec

- **Format:** PNG (JPG ok for dense illustration without hard edges)
- **Resolution:** source resolution — Midjourney native (1024×1024 or 1122×1402 are typical in the existing set). Never manually shrink. Browser downscales to display size (~120px).
- **Location:** `assets/games/thumbs/{canonical-key}.png`
- **Style:** dark background, single iconic element, readable at ~120px displayed size
- **Fallback:** picker auto-falls-back to the game's emoji (`i:` field) via `onerror`, so broken links just render the emoji — no crashes, just dull display
- **If cutout needed:** run `python3 scripts/cutout-bg.py SOURCE DEST` (flood-fill bg remover, keeps dark outline)

## Art targets — 14 games with no thumbnail on disk

The picker catalog points at these paths but the files don't exist. Every one falls back to an emoji right now.

| Category | Key | Display | Traditional | Visual hint |
|---|---|---|---|---|
| board | seedsow | Seed Sow | Mancala | Mancala pit with seeds sowing |
| board | trellis | Trellis | Scrabble | Wood tile rack + grid corner |
| board | vinecross | Vine Cross | Gomoku | 5-in-a-row stones on grid |
| puzzle | dailybloom | Daily Bloom | Brain training | Calendar page + sprig |
| puzzle | gardenlines | Garden Lines | Matching lines | Matching shape line |
| puzzle | kakuro | Garden Sums | Kakuro | Clue cell with sum arrow |
| puzzle | jade | Jade Garden | Mahjong | Stacked jade tile pair |
| puzzle | livingstones | Living Stones | Go life | Black/white stones on goban |
| puzzle | mosaic | Mosaic Garden | Tile mosaic | Colored tile grid fragment |
| puzzle | petalmatch | Petal Match | Match‑3 / Bejeweled | Three aligned gem/petals |
| puzzle | rootflow | Root Flow | Flow Free | Curved colored paths meeting |
| puzzle | rootmaze | Root Maze | Maze | Twisting root path |
| puzzle | sprout | Sprout | Wordle | 5‑letter row, green + amber tiles |
| puzzle | vinewords | Vine Words | Letter path | Connected letters on vine |

## Bonus — thumbnail exists but is a workaround

| Key | Current path | Fix |
|---|---|---|
| doubleshutter | `assets/dice/d6.png` (reusing dice sprite) | Make a dedicated `thumbs/doubleshutter.png` — two rows of numbered tiles |

## Orphan files to clean up later (not blocking)

Files in `assets/games/thumbs/` that no catalog entry references. Probably renamed at some point:

- `flood.png` — catalog already references `flood.png`, so likely a name collision; verify
- `ginrummy.png` — renamed to `juniper.png` long ago
- `set.png` — renamed to `threesisters.png`
- `stopten.png` — catalog points at `stopten-trimmed.png`

These can sit until we verify nothing else references them, then delete.

## When art drops in

1. Save as `assets/games/thumbs/<canonical-key>.png` — no rename step needed
2. The catalog already points at the right path — it just starts showing instead of the emoji fallback
3. No code change required unless you also want to update the emoji or rules copy

## 15 titles to visually hint at the classic form

These have display names that hide the mechanic. Thumbnail should help new players recognise the game at a glance:

Three Sisters → SET card columns · Connect Fleur → four‑in‑a‑row · Tide Hunt → Battleship grid · Seed Code → Mastermind pegs · Seed Sow → Mancala pits · Master Pollinator → Splendor tableau · Bloom Grid → Nonogram clues · Vine Cross → Gomoku grid · Jade Garden → Mahjong pair · Root Flow → colored paths · Petal Match → Match‑3 grid · Block Drop → tetromino · Garden Sums → Kakuro clue · Echo → Simon 4‑button · Speed Sort → card fan
