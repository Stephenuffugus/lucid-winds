# BLOOMZAP — paste-ready ChatGPT art prompts

*Bloomzap is a botanical WordZap duel (grow 7 words from a shared bed of 8 letters; plant a word
your rival grew and you ZAP it off their trellis). It's all CSS + emoji today. Generate these
**one at a time**; hand me any batch and I'll wire the `<img>` hooks (it's a DOM/CSS game).*

## STYLE (paste on top of every prompt)
> Cozy storybook game art, hand-painted gouache, clean cel-shading, soft warm rim-light, a little glow.
> Midnight-greenhouse palette: deep near-black green, sage green, warm gold, cream; a rose-pink accent
> for the rival, ember-orange for zaps. Menacing-cute, never grim. Plain flat **magenta #FF00FF**
> background, nothing else, subject centered, no text or labels.

## 1 · LETTER TILE (highest bang — every tile uses it)
- **`tile_blank`** — one empty botanical letter tile: a rounded **seed-pod / pressed-flower** tile,
  sage-and-cream, warm gold rim, a soft top highlight, room in the middle for a letter (I overlay the
  letter). Square, reads at ~120px. *(Make one clean blank tile; the game stamps the letter on top.)*

## 2 · THE 4 RIVALS (one square portrait each, friendly-competitive garden critter)
- **`rival_aphid`** — a small round green aphid gardener, big eyes (the easy rival).
- **`rival_moth`** — a pale cabbage moth, dusty wings (medium).
- **`rival_bee`** — a fuzzy bumblebee, determined (hard).
- **`rival_sprite`** — a hedge sprite, leafy little fae, sly (expert).

## 3 · THE ZAP (the signature moment — currently pure CSS)
- **`fx_zap`** — a single ember-orange **lightning bolt + scorch burst**, jagged, glowing, on magenta
  (I'll flash it over a zapped word). Bold, readable, energetic.

## 4 · WORD BLOOM (grown words show as plain text chips today)
- **`chip_bloom`** — a small single flower/leaf sprite to sit beside a grown word on the trellis
  (sage + gold, a little bloom). Tiny, cute.

## 5 · BACKGROUND & TITLE
- **`bg_trellis.jpg`** (full-bleed, NO magenta) — a dark midnight-greenhouse **trellis / garden bed**
  backdrop, faint climbing lattice, calm so the bright letter tiles + word racks pop. Portrait ~1080×1920.
- **`logo.png`** (transparent) — **BLOOMZAP** wordmark, chunky storybook, sage + gold, a leaf/spark flourish.
- **`res_win.png`** — a flourishing **trophy trellis** heavy with blooms (the win splash).
- **`res_lose.png`** — a wilted, empty garden bed (the loss splash).

**Order:** letter tile → 4 rivals → zap → logo/backdrop → win/lose splash. Send me a batch and I'll wire it.
