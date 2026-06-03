# Portal screenshots — Lucid Winds games

66 representative images, one per registered game. These are the
Lucid Winds game-picker thumbnails (Stephen's curated registry art at
`assets/games/thumbs/`) copied here under `<game-id>.<ext>` for
constellation-portal use.

Source of truth: the `G[]` registry in `index.html` (lines 61753-61818).

| Type | Count | Notes |
|---|---|---|
| `.png` | 63 | most games |
| `.jpg` | 2  | `breathing`, `colorgarden`, `pixelgarden`, `storyseeds` (rich photo thumbs) |
| `.webp` | 1 | `stonegarden` |

If the portal needs live in-game screenshots later (full UI captures,
not the curated catalog art), trigger a follow-up: the puppeteer
harness lives in `node_modules` and can drive `_sg(<id>)` in headless
mode, but that lift requires booting the game inside puppeteer and is
out of scope for this round.

