# Sunforge v2 — handoff

**Merge `assets/` over the v1 pack. This ZIP is the complete Round 2 delta, not a replacement for the entire v1 pack.** Keep all v1 files absent from this ZIP. The game itself has not been modified or deployed.

## Decisions that ship
- The selected direction is Obsidian Shards: visible dark stone, broad molten fractures, cold silver active pieces; no ordinary center stamps.
- The requested Drive folder was unavailable in this session; the complete attached `ASTRA-SUNFORGE-ROUND2-NOV06.txt` supplied the brief, and the saved v1 ZIP supplied exact paths and cuts.
- I played the live portrait browser build; phone-size compositions are included, but no physical Pixel or outdoor-daylight claim is made.
- The three direction sheets are overpaints of the captured seven-ring live board; charged seams illustrate the intended state and are not evidence that its captured ring was one cell from completion.
- No existing dedicated almost-ring notch or lit-seam PNG was present in v1, so those two cues are new named 64 px overlays in `assets/f_fx/`.
- The recovered v1 core actually uses four **256 px** frames, while the Round 2 brief says **128 px**; `core_states.png` preserves the drop-in 256 cut and `core_states_128.png` provides the requested smaller cut.
- Core frames 0–2 are the original idle, charged and crushing art; frame 3 is now **spent**, replacing v1's overloaded slot. If code still uses that slot for overload, update the state mapping.
- G is an added fifth plate, `how_to_play_05_drag_tap.png`; the existing four plates stay untouched.
- Ring indices remain unchanged; ring 12 is cold slate, with the legacy filename `ring_12_brass.png` retained for loaders.
- `ring_marks.png` and `ring_marks_dark.png` are deliberately transparent compatibility sheets; they remove the stamps without breaking their existing image requests.
- H replaces `a_identity/promo_tile.jpg` and `a_identity/social_card.jpg`; the separate results-sharing frames in `g_results_sharing/` remain v1.
- The generated material art is packed into exact production cuts. Hollow ghost, seam, notch, and overlay masks use exact UI geometry. No gameplay code, tests, or validation scripts are included.

## File map
| Brief section | Folder | Files |
|---|---|---|
| A | `assets/c_cells_pieces/` | `ring_faces_unmarked.png`, `cell_seam.png`; 12 compatibility `ring_XX_*.png` sheets; transparent mark sheets |
| B | `assets/c_cells_pieces/` | `weld_trim_layers.png`, `weld_side.png`, `weld_inner_corner.png` |
| C | `assets/c_cells_pieces/` | `falling_cell.png`, `falling_cell_resting.png` |
| D | `assets/c_cells_pieces/` | `ghost_cell.png` |
| E | `assets/b_core/` | `core_states.png`, `core_states_128.png` |
| F | `assets/c_cells_pieces/`, `assets/f_fx/` | `stick_flash.png`; almost-ring cues, crush, swallow, SLAM sheets |
| G | `assets/e_hud_controls/` | `how_to_play_05_drag_tap.png` |
| H | `assets/a_identity/` | `promo_tile.jpg`, `social_card.jpg` |

`previews/` contains one contact sheet per direction, one per section A–H, and the live source capture. Preview labels are not part of game assets. `manifest.json` is a delta manifest; merge its records rather than discarding the rest of v1's manifest.

## Sampling and state hookup
All sprites are untrimmed horizontal strips with zero gutter. Frame `i` starts at `i × frameWidth`, y=0. Use normal straight-alpha blending for opaque material and ghost sprites. Never render an entire strip as one sprite.

| Sheet | Frame cut | Order / duration |
|---|---|---|
| Ring faces | 12 × 64 × 64 | Rings 1–12 |
| Each legacy ring / weld atlas | 8 × 64 × 64 | single, top, right, bottom, left, inner TL, outer TL, interior/seam |
| Core legacy | 4 × 256 × 256 | idle, charged, crushing, spent |
| Core alternate | 4 × 128 × 128 | same order |
| Stick | 6 × 64 × 64 | left to right, 20 ms/frame; 120 ms total |
| Ring crush | 6 × 256 × 256 | left to right, 50 ms/frame; 300 ms total |
| Void swallow | 6 × 256 × 256 | left to right, 50 ms/frame; 300 ms total |
| SLAM shockwave | 6 × 256 × 256 | left to right, 40 ms/frame; 240 ms total |

The falling resting frame, two almost-ring cues, and fifth How plate are additions and need references in the existing state/plate selection. Everything else replaces an existing image path. Do not claim those additions will appear from copying files alone.

During the existing 500 ms lock delay, crossfade cold to hot and back gently; reset when airborne. At lock, select the ring face by its current distance from the sun. Almost-ring seam is authored along the top edge: rotate the overlay to the needed boundary, not the face. Place one notch at the open gap, not on every cell. Keep the cues steady.

For the layered cell path, draw face, quiet seam, then only the boundary welds needed. The eight-frame ring compatibility sheets are an alternative for older loaders; do not apply their baked weld plus the same overlay twice. The full-perimeter single-cell variant is only for an isolated cell.

FX are one-shot overlays and should disappear after frame 5, not loop. Crush is centered on the collapsing band. The swallow's hole is near x=0.5, y=0.8 of its frame; place that anchor at the destination void. SLAM has a transparent center and should not cover the board with a filled flash. Keep the v1 movement logic and any reduced-motion choice.

## Art provenance
New painted material, active-cell art, FX, gesture illustration, and promotional overpaints were created with the built-in image-generation tool. Production work included cropping, resizing, atlas assembly, exact transparent UI geometry, and pressure-wave clipping. The first three core frames and typography in preview labels come from the supplied v1 pack.

Prompt direction: charcoal iron-glass with three large ash facets; broad ring-coloured molten cross-fracture; no candy, stamp, or bright tile frame. Weld: blackened steel beads and tiny heat punctures. Falling: intact brushed silver diagonal fold, then the same fold heating orange. Effects: local fracture, square inward stone collapse, downward void swallow, hollow square outward pressure. Gesture: wordless side-drag and tap-quarter-turn of the same S piece. Promotion: preserve SUNFORGE wordmark and v1 composition, replace painted cells with obsidian bands.
