# Keepsies Round 3 · handoff

This ZIP contains all art made for this round, editable SVGs, raster fallbacks, the optional dirt source, anchors, and five contact sheets. It is an asset handoff, not a game-code patch. Files labelled retained are included so their exact versions are available without another download.

**Source limitation:** the brief was supplied; keepsies-round3-materials.zip was not available among the attachments or file-search results. The live game displayed a WebGL-context startup error. No sign-in or Drive access was involved. The required compositing on nineteen real captures and the capture-specific judgments remain unfinished. All five previews are labelled studio studies; no older screenshot is passed off as the new build.

## A · circle and reticle

- SVGs have native 154×154 viewports; the dial cue is 48×48. Their PNG fallbacks are 2×. The transparent centre preserves the shooter. The thin dark keyline gives chalk separation on bright dirt without a filled pad.
- Replace the existing CSS ring with hold_circle, then swap to hold_circle_braced when the thumb is down. Do not stack both. Keep either centred on the projected shooter. On the reference 412×915 view, this is (206,743), with top 666 and bottom 820. The input circle remains a full 154 px hit region despite the small visual breaks.
- Keep the circle 154 CSS px on the 360 phone too. The shooter becomes 57.6 px there; no smaller-phone y-coordinate was supplied, so follow the projected shooter instead of inventing one.
- Both reticle SVGs also occupy the same **154 CSS px element**. The loose ring already measures 146.3 px; the settled one already measures 69.3 px. Do not resize the element to those diameters a second time.
- To breathe continuously, change the inline ring path geometry about (77,77), interpolating radius 71.65→33.15. Keep chalk 1.5 CSS px and dark keyline 3 CSS px. Width includes the outer keyline. Keep the settled tick at its final coordinates, fade it in only when settled. Do not animate the whole SVG with CSS scale; image-element scaling also scales raster strokes. The two supplied fixed states work without continuous path animation.
- Interpret “inner 60 percent” as 60% of radius, not area: radius 46.2 px, neutral band 46.2–77 px. Spin marks show only the top/bottom boundary arcs and ship **off by default**; a third visible ring competes with the aim. Code retains the full spin input region.
- Keep the existing R2 aim dash/cap and real-range calculation. The line starts at (206,666) in the reference view. It carries direction; no second aiming line is baked into this art.
- All these overlays are decorative: pointer-events:none. Existing gesture capture and accessibility text stay in code. Hide the dial cue after the existing first-few-turn teaching period; it does not occupy a new control.

## B · snap card

Replace #snapArt artwork with snap_card.svg at 320×150. The three equal panels read hold, sideways turn, upward flick. The ghost line in the middle preserves the before/after direction; ghost thumbs indicate movement. The words remain separate code text. The fourth spin panel is omitted because four panels would crowd a 320 px plate. The diagram uses the same open circle, not a target crosshair.

## C · close view

- chalk_stroke.svg and .png are 2048×64. Centre y32, chalk thickness 40, repeat length 2048. Breaks retain the R2 slant, positions and widths (5,7,4 px). Explicit clip polygons replace the luminance mask that was losing its cuts during PNG export. Map along the circumference; do not stretch this strip over a disc.
- dirt_detail.webp is a 1024×1024 optional near texture for a 0.25 m repeat. It is a candidate supplied because the brief's density numbers indicate magnification; capture 01 was not available to establish that the current dirt fails. Keep the existing base albedo by default. If used as detail, start with a restrained 18% blend and fade it out with distance (suggested 0.3–0.65 m camera distance); these blend settings are artistic starting points, not supplied build constants. It is colour art, not a normal map. Retain mipmaps and repeat wrapping. The generation source is included separately, not for runtime loading.
- ground_shadow is the exact R2 shadow_dirt artwork under the requested name; shadow_dark is also unchanged. Preserve the existing world-plane mapping, rather than assigning a 72 px CSS square to the 256 px texture. The preview's circle is a size gauge, not a game marble render or evidence of actual contact quality.

## D · statues

Retain R2 owner_you and owner_dusty. One bar means you, two bars mean Dusty; they use currentColor and are best inlined or used as alpha decals. Their SVG source is 24×24 and the existing badge display is 12×12. World decal centres and boxes are carried forward in anchors.json. No new collider, statue geometry, Meshy reference or visibility claim is introduced. Capture 12 is still needed for the requested bar-read assessment.

## E · plates

The chip is redrawn at 304×112 source pixels for **152×56 CSS px**. Seven pip centres are x32,72,112,152,192,232,272 at y78; divide by two for CSS. Source pip size is 32×32, hence 16×16 CSS and 20 px centre spacing. Names and pips are supplied by code; the frame is empty. Nine-slice caps are 24 source pixels on each side.

Retained tier tiles remain 192×192 source pixels, displayed at 96×96. New content bounds are [26,44,140,122] source pixels: [13,22,70,61] CSS. The content centre stays (96,105) in source pixels. Do not stretch a marble to fill that rectangle; preserve its aspect ratio and existing camera render. Tier marks remain separate, unscaled code artwork. Existing 560×96 pill frames are retained; their on-screen fitting cannot be assessed without the inspect capture.

## What comes next

Use the missing materials ZIP to replace the studio backgrounds with the nineteen supplied phone views, finish the dirt/contact/bar/pill judgments, and revise only what those captures show needs changing. No additional collectible marble pack or paid Meshy work belongs to this round.

## Dirt source

Created with built-in image generation. Prompt: “1024×1024 seamless repeatable fine dirt albedo/detail texture for the close camera of Keepsies, a warm tactile marble game. Flat orthographic top-down square, fills every pixel with finely compacted dry earth, minute sandy granules, tiny mottled clay flecks; the whole square represents only 25 cm of ground. Warm muted brown umber around #806b50 with quiet warm cream grit, very narrow contrast, no strong identifiable features or large stones. Even diffuse illumination, no directional shading, no cast shadows, no vignette, no perspective. Seamless matching opposite edges for infinite tiling, no visible seams, no cracks, no grass, no marbles, no footprints, no text, no border, no symbols. Fine detail rather than chunky gravel. Production game texture, restrained painterly realism.”
