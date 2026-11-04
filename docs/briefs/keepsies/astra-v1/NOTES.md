# Delivery notes

## What this is
A production art handoff and an expansion design bank. The original uploads contained specifications and captures, not game source. No live game behavior, shaders, physics, saves or economy code has been changed or tested here. Raster art was generated with the built-in image generation tool. SVG icons, frames, marks, decals and UI plates are authored vector graphics. Nothing is described as hand painted.

## What is intentionally separate
* Original 65 procedural marbles: unchanged.
* 240 new catalog proposals: 226 procedural designs and 14 individual sculpt reference images. These need registration and renderer work.
* Four original grail references: individual images ready to submit to the existing Meshy workflow. No GLB meshes are included.
* Shelf images: exact-slot 2D UI plates. The VR room remains 3D work.
* Arena images: concept boards plus supporting visual effects, not environment models or validated collision meshes.
* Store art: promotional illustration. The six transparent screenshot frames must receive genuine game captures. Do not advertise an illustrated mockup as a shipped screenshot.

## Export decisions
Portrait PNGs are 320 px for a 160 px display, with 160 px and 96 px WebP exports. Pouch PNGs are 640 px for a 320 px display, with 320 px WebP exports. Meshy references are 1024 square. Scene plates are 900 by 600 and arena concepts are 1600 by 900. This keeps runtime textures under the supplied caps while retaining separate reference art. The backdrop is a 1600 by 800 horizon panorama; test spherical seams and poles in the actual renderer before treating it as a fully validated environment map. Use it as a low horizon backdrop if projection artifacts occur. Generated grey reference grounds have slight tonal variation rather than certified exact flat color.

No normal map is fabricated from the dirt photograph. Roughness can stay a constant in the existing material. Runtime quality is measured on device, not inferred from the ZIP size. Reference PNGs, promo masters, store art and contact sheets should not be precached by the game.

## Sound direction
Keep the physics-driven synthesis. A clean glass contact needs a short bright attack and a small inharmonic ring, not a cartoon cash register. Clay lands with a short dull knock. A settled reticle gets one quiet click only when state becomes settled, never every frame. A rescued rare uses its own material contact sound; no jackpot stinger. A shatter is a cascade with a limiter, followed by the small fragments, never a clipping wall of noise. Respect sound and haptic settings independently. No audio files are included.

## Practical composition
Coordinates in anchors.json use each asset's exported pixel space. Scale both axes by the displayed dimensions. Empty render windows are intentional. For tin and pouch opening, clip the live marble pass to the mouth ellipse while it is inside, then change layer order when it clears the rim. Do not paint a reward into the source plate. Validate those animation masks in the real build.

## Next implementation pass
Fix undefined labels and camera limits; install the lot and Dusty; verify the first four grail sculpts; add provenance and the share card; then test a small expansion family. Re-render the original 65-marble contact sheet after any shared material change. Read ASSESSMENT.md for unresolved product rules instead of guessing their answers.
