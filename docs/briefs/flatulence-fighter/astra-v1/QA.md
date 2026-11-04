# Asset verification

Completed 4 November 2026. This report covers the packaged artwork, not a runtime game test.

- 291 artwork files, including editable SVG and PNG variants, recorded with unique IDs and SHA-256 hashes.
- 14 exact 900x1600 room/mood plates. Largest compressed plate: 149,520 bytes, below 200,000.
- 30 exact 720x720 transparent character expressions and five SVG rigs. Each rig includes all six expression groups.
- 24 exact 1080x540 witness strips, with two or three figures per room after visual review. Largest strip: 86,868 bytes, below 150,000.
- 53 currentColor SVG icons; 18 SVG medal marks.
- Nine sharing/store PNG windows checked for actual zero alpha at their centers; corresponding SVGs use explicit clip paths. An early mask-rendering defect was corrected before packaging.
- All raster assets decode successfully and match the manifest dimensions. All SVGs parse as XML. No scripts, external image dependencies or live text nodes in artwork SVGs.
- All raster identity/store artwork is opaque. Screenshot and sharing overlays deliberately retain transparent capture windows.
- All non-store raster assets obey the 1600 px side cap, except the specifically requested portrait sharing frame.
- Contact sheets for sections A to I and both style proposals reviewed visually. All twelve room identities and the witness backs/turned states checked. Wide HOLD pads corrected in the play proposal so fatigue bars stay within the pads.
- The ZIP is checked for CRC errors before delivery.

## Deliberate limits

Generated witnesses are two-state drawings with small pose changes, not a tweenable rig. Palette filter previews are perceptual, not exact per-pixel recolor guarantees. No production source, browser build or physical-phone test was available. Controls, focus, live timings, save migrations, cache behavior, achievement conditions, audio and store capture composition still need the integration checks in `dev/INTEGRATION.md`. No store rating, acceptance or sales outcome is claimed.
