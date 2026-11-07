# Tomato Man — Hero handoff

This ZIP contains the complete hero round: 65 directional body sheets (520 frames), 10 planet frames, one shadow texture, one cue mark, 13 builder heads, and one contact sheet per section. It supplements the previous v2, gameplay and run packs; it does not repeat their assets or change the live game.

## Install and select

Copy `assets/a_bodies/hero/` into the game's `art/hero/`, and `assets/c_builder/builder/` into `art/builder/`. Put the contents of `assets/b_planet/` in `art/planet/` and register their manifest IDs. Paths in manifest.json are relative to this ZIP root, before installation. The current builder's `bellpepper` ID maps to the brief's filename stem `bell_pepper`. All other body stems are unchanged.

Use the directional tomato rendering branch for these bodies. Each WebP is 1024×512, four columns by two rows, with 256×256 source cells. Preserve the current 64×64 world draw box. The face is baked into each frame; do not also draw the legacy neutral face or static produce body. A new builder head also contains its face.

Frame order is 0 idle, 1–4 walk, 5 dash crouch, 6 dash stretch, 7 hop. Walk still follows the tomato's distance accumulator (one frame per 14 world pixels); 125 ms in the manifest is a nominal preview cadence, not a replacement for distance-driven animation. Use crouch for the first 1/12 second of a dash, then stretch for its remainder. Idle, stretch and hop durations of zero mean hold until gameplay selects another state. Hop remains available for the game to trigger.

Bearings are s, se, e, ne, n. Mirror se for sw, e for w and ne for nw. Mirror the entire cell, including its head and baked face; keep the hat transform consistent. For geometric anchor coordinates under a horizontal flip use x'=256-x. Pixel-index sampling uses 255-x instead.

## Seats and pivots

The five public tomato files are currently 512×256 (128-pixel cells); this pack follows the brief's requested 256-pixel cells. Existing limbs, orange boots, tunic and pose timing are retained and enlarged with the source motion. New directional produce heads are composited onto that motion, with a modest action-pose stretch. This is a shared puppet rig, not thirteen unrelated newly posed animations.

The current game renderer positions the cell at its centre. Preserve that placement: source render pivot [128,128], nominal feet/ground reference [128,232]. The latter is a layout reference, not a stationary toe position through a walk or hop. Do not rebase the cell to the foot reference without compensating the draw offset. This resolves the brief's 'pivot at the feet' wording in favour of current tomato placement.

The tomato's per-frame HAT_ANCHOR table is repeated for all thirteen bodies in anchors.json. Hat seats are logical attachment points; stems, the cherry's fork and the pickle's crown may rise above them. No body-specific anchor override is required for this composition. Frame anchors include cell-local and sheet-absolute coordinates. Builder heads use their own 384-pixel coordinate space: logical neck socket [192,340], hat seat [192,76]. The body colours and distinguishing silhouettes follow the current builder references; all thirteen portraits are refreshed to match the new heads.

## Planet event

The planet remains Stephen's wiring decision. The art does not choose its fixed path or scheduled start time. Restrict the proposed event to Dunes at Dusk and Eclipse, once per level, if enabled.

Three approaching frames play once; four passing frames form a slow ping-pong turn (0,1,2,3,2,1); three leaving frames play once. Proposed visual cadences are 250 ms per approach/leave frame and 500 ms per passing frame. State transitions follow the level event, not an assumed total lifespan. Do not jump from passing frame 3 directly back to frame 0 as a rotation loop.

Planet frames are separate 960×960 WebPs to keep every file below 1600 pixels per side. Draw the padded canvas at 560×560 world pixels for a visible fruit diameter of approximately 480; source centre is [480,480]. Keep this size fixed while the event travels. The image is a distant faceless caster at the screen edge, not the platform collision object. Lighting and surface turn change between frames; movement comes from the engine.

`planet_shadow.webp` is 880×880 source pixels, drawn at exactly 440×440 world pixels. Its centre is [440,440] and source radius is 440, corresponding to world radius 220. Clip the visual to the code's exact moving circle. Its soft alpha edge must never decide safety, shelter or platform collision. Do not infer a platform shape from the tomato moon silhouette. `tm-planet.webp` is the 48×48 cue-line icon, centred at [24,24].

## References and production decisions

The corrected ASTRA-TOMATO-MAN-THE-HERO-NOV07 brief was read in full. The live builder and a tomato level, including movement and dash, were viewed in the available desktop browser. A physical-phone session was not available; no phone-play claim is made. No automated tests, validation scripts or pixel audits were run. Contact sheets were used for the requested visual pass; source cutouts were corrected where action-pose arms were being clipped.

Authoritative public references:
- https://lucidwinds.com/satellites/tomato-man/
- https://raw.githubusercontent.com/Stephenuffugus/Tomato_Man/main/art/hero/tomato_s.webp (and se, e, ne, n)
- https://github.com/Stephenuffugus/Tomato_Man/tree/main/art/builder

The generated head prompt set was: six equal turnaround cells (front, right three-quarter, right profile, rear right three-quarter, back, front portrait); matte worn clay, dusty builder colours, tired hollow eyes, ivory slits and tiny teeth; unique fruit silhouette, transparent exterior, no labels. Subjects were seeded strawberry, leafy orange, pointed lemon, olive lime, blushed peach, paired-stalk cherry, lobed bell pepper, purple eggplant, pitted avocado, ribbed heirloom, long knobbly pickle, golden tomato and peeling sunburn survivor. The planet prompt set used the same clay treatment on a faceless tomato moon with approach lighting, a gentle surface turn and departing eclipse shade. Built-in image generation supplied the illustrated cutouts; compositing and WebP export produced the delivery assets. The shadow and cue mark are simple rendered graphics.

Only delivery assets and documentation are included. Generated working atlases and production scripts are omitted. Contact sheets have a sand-coloured presentation background; runtime WebPs retain transparency.
