# Super Slice 3D: the Journey orchard kit, intake (Opus, 25 Oct 2026, 00:20 UTC)

Stephen's words with the upload: "Here's the super slice assets ... Don't jump into this work. You can assess it and we
will have Fable analyze and put together the work and I will have him make a handoff to get back to you to actually do
the physical coding cutting and labor". So this note is the assessment only: no plan, no cut, no code. Fable plans
(HANDOFF-FABLE-OCT25.md, job 2); Opus builds from Fable's plan.

## What arrived

- `super-slice-journey-kit.zip`, 8,631,553 bytes, sha256 `6677b3be462927ac65a4442ed322b8e572ba5e492d17243bfaefe9f0cf664c92`.
  Uploaded through the chat; copied to `assets/super-slice-journey-kit.zip` (not committed: disk law).
- **Vaulted:** release `vault-20261025-super-slice-journey-kit` in `Stephenuffugus/lucid-winds-vault` (zip plus
  SHA256SUMS.txt). Downloaded back and the sha256 matched. Restore:
  `env -u GITHUB_TOKEN -u GH_TOKEN gh release download vault-20261025-super-slice-journey-kit -R Stephenuffugus/lucid-winds-vault`
- 37 entries, no unsafe paths, the zip tests clean, 8.41 MB unpacked. Extracted with `python3 -I` into its own folder
  (`/tmp/claude-1000/ssjk/zip`, gone after a codespace stop: re-extract from the vault). Nothing inside was run.
- Besides the art: `manifest.txt`, `README.txt`, `IMPLEMENTATION.md` (her integration order and acceptance checks),
  `asset_index.json` (visible bounds and sha256 per PNG), `qa_report.json`, `generation_prompts.json`,
  `docs/original_handoff.pdf` (our brief) and `qa/` contact and 3 by 3 repeat sheets (not runtime files).

## Inventory against the brief (`ASTRA-SUPER-SLICE-JOURNEY-KIT-OCT24.html`)

All 21 asked PNGs present, no extras, every one at the asked pixel size. Tiles are opaque RGB, cut outs are RGBA with
real transparency (alpha 0 to 255). Her manifest's MISSING section: none.

| File | Size | Visible bounds in the canvas (left, top, right, bottom) |
|---|---|---|
| ground/grass_top | 1024 x 1024, tile both ways | opaque |
| ground/soil_face | 1024 x 256, tile across | opaque |
| trees/tree_apple, tree_pear, tree_plum, tree_far | 768 x 1024 | feet at y 1019 (5 px above the canvas floor); crowns from y 84, 5, 32, 20 |
| trees/tree_poplar | 512 x 1024 | x 123 to 374, feet at y 1019 |
| plants/bush_a, bush_b | 512 x 320 | feet at y 315, tops at y 80 and 98 |
| plants/tuft_a, tuft_b, flower_a, flower_b | 128 x 128 | feet at y 125 |
| pieces/stump_top | 256 x 256 | a disc, 3 to 253 |
| pieces/stump_bark | 512 x 256, tile across | opaque |
| pieces/mushroom | 512 x 512 | cap top at y 130, base at 507 |
| pieces/branch | 1024 x 256 | 5 to 1019 across, 5 to 251 down |
| pieces/vine | 64 x 512, tile down | opaque |
| pieces/shelf_cracked | 512 x 128, tile across | opaque |
| pieces/flag | 512 x 320 | 5 to 507 across, 25 to 295 down (no pole: the game's pole stays) |
| backdrop/hills_far | 2048 x 512, tile across | land from y 266 down, transparent sky above (as the brief's own line asked) |

**Painted margins to register (memory `feedback_painted_tiles_carry_margins_measure_them`):** every cut out stands a
few pixels above its canvas floor (trees and bushes 5 px, plants 3 px). Anchor them by the visible bounds in
`asset_index.json`, never by the PNG rectangle, or they float (the 23 Oct rabbit).

## The seams, measured

Every repeating tile's first and last line are IDENTICAL (edge difference 0.00 against 1.3 to 6.8 between neighbouring
lines inside each tile). Her "wrap overlap preparation" copied the first line onto the last, so a straight repeat draws
that line twice at every seam: one pixel, close to invisible, but the cut can drop the last column (or row) and the
tile then wraps exactly. Her `qa_report.json` scores this as a pass (`repeat_border_pixels: 0`).

## The look (her QA sheets and my contact sheet, looked at)

The kit matches the Orchard Loft pack: warm, painted, upper left light, chunky shapes; five clearly different trees
(apple, pear, plum, a tall poplar, a hazy blue back row tree), two bushes, tufts and flowers, a ringed stump top and bark,
a red and cream springboard mushroom, a gold pennant, a leafy branch, a braided vine, a cracked plank, a soft hill band.
Three things to judge in the game, at the player's camera AND a close worst angle, before anyone calls it right:
1. **The grass top carries a strong diagonal light band** that reads as stripes when it repeats (her own 3 by 3 sheet
   shows it), and it is a bright lime next to the old greens. At the grazing Journey camera it may shimmer or stripe.
2. **The shelf's crack repeats every 512 px**: a shelf longer than one tile shows a crack per tile.
3. **The branch is a slim stick** where the code draws a leafy blob today: check it still reads as the thing the fruit
   hangs from, at the camera distance.

## Her claims to verify against the code (not facts yet)

`IMPLEMENTATION.md` quotes the game's own numbers back (most came from our brief): two loose tree rows 9 to 17 units
apart and 9 to 19 tall; the counter 3 units tall and 14 deep; stump radius 1.7; mushroom cap 4.4 wide over a 2.2 stem;
branch span 6 to 14 at 8 to 11 high; the flag allocation 3.4 x 2.2; the shelf 4 to 6 wide and 0.9 high. Check each in
`satellites/slice-3d/index.html` before a plan uses it. Her acceptance checklist (end of `IMPLEMENTATION.md`) is a good
start for Part H's gate, beside the suite (`node satellites/slice-3d/audit-check.mjs`) and the G1 rule that the drawn
knife rests on the grass lip at `GRASS_TOP` 0.25.
