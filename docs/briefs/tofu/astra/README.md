# TOFU — complete asset handoff

Copy the flat `assets/` folder next to the game HTML. All names in ASTRA_ASSETS.md are supplied, including the optional art. The asset set contains 68 base PNGs, 68 @2x PNGs, and an editable vector wordmark. `ASSET_MANIFEST.json` records exact sizes and strip frame widths. `assets/CHECKLIST.md` lists every art export.

## Compositing

- All PNGs use 8-bit RGB channels plus an alpha channel (RGBA truecolor), an sRGB intent chunk, and no ICC profile. Transparency is real alpha, never a checkerboard baked into the image.
- Bodies are faceless and contain no soy tint or stink wisps. Canvas is 96 × 96; all body silhouettes end at y=88. Footprints match the brief: plain 64 × 64, silken 76 × 44, firm 60 × 68, fried 76 × 76, frozen 64 × 64, spongy 64 × 64. Silken opacity is approximately 90%.
- Face layers are 64 × 64 with eyes near (24,30) and (40,30), mouth near (32,42). Position relative to the deforming body; face layers should not be aligned to the body's 96px origin without an offset.
- Sprite strips have no gutters. Use the frame width in the manifest. @2x doubles every canvas and frame dimension, including line widths. Keep gameplay dimensions in logical pixels.
- `eye_block_3f` has LEFT-looking open / half / closed poses; mirror the entire block to look right. These are blink states, not a repeating three-pose blink cycle. Suggested blink sequence: open, half, closed, half, open, then hold open.
- Chopsticks face right; mirror for left. The four poses alternate contacts and passing positions. Suggested starting timing: patrol 160 ms/frame, chase 80 ms/frame, flee 90 ms/frame.
- Suggested water timing: 140 ms/frame. Brine bubbles: 160 ms/frame. Pan shimmer: 100 ms/frame. These are art-side starting values, not game-tested timings.
- `pan_glow_3f` contains an emissive orange edge and shimmer lines. Code supplies bloom/glow; `bowl_ring` is the single supplied baked glow exception.
- Chip icons are all monochrome #f3efe6, including fried, as required by the UI color contract. Code can apply state color when desired.
- `screenshot_frame` is an optional 1080 × 1920 portrait surround. Put an actual gameplay capture behind the transparent window x=78, y=254, width=924, height=1512 (rounded corners).

## Art decisions

The knife wording is internally ambiguous about the blade's vertical position. The delivered interpretation is a point-up chef's blade above a bottom wooden handle. Fill tiles and connected bars reach tile boundaries intentionally; important interior symbols keep a margin. Empty zone pills receive text from code. `dish_korid` preserves the exact contracted spelling. Dish cards share white ceramic crockery and a three-quarter view, with the plated card using the requested plate. `dish_special` is a plain / fried / soy sampler. The marketing image has a display-lettering variation of TOFU and the exact tagline “You are the ingredient.”

No game source was supplied, so this delivery is an art pack, not a tested game integration. Exact filenames, dimensions, strip slicing, alpha, and archive integrity were checked. The contact sheets are previews only and are not loaded by the game.

## Creation

The six body illustrations, eight dish illustrations, and feature graphic were produced using built-in image generation. Faces, geometric tiles, animated overlays, particles, controls, recipe glyphs, and custom vector lettering were drawn deterministically for exact anchors and frame spacing. Export processing cropped transparent margins, normalized canvas sizes, and preserved alpha. The feature's @2x copy is a resized master; vector-based assets are rendered at their target resolution. Prompts are included in `ART_PROMPTS.md`.
