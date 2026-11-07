# Hero round

The produce selection should change his identity without taking away his movement. This pack keeps the tomato's existing limb poses, clothing, frame order and per-frame hat seats, with new directional produce heads composed into all sixty-five sheets. Long pickles, paired cherries, pitted avocados and peeling survivors retain their identifying shapes. Faces are part of each directional frame; the old static face overlay must be bypassed when these sheets are used.

The public reference textures are currently 512x256 with 128-pixel cells, while the brief requests 1024x512 with 256-pixel cells. This delivery uses the brief's larger source format and the game's existing 256-space HAT_ANCHOR coordinates. The live renderer positions a cell by its centre, despite the brief's description of a foot pivot; the existing feet and render placement are preserved rather than shifted.

The planet is a distant, faceless, weathered tomato moon. Its visual caster and its radius-220 shade circle are separate assets: only the code's exact circle grants safety. Large 960-pixel planet frames are delivered separately so every file stays below 1600 pixels per side. The live builder and a tomato level were reviewed in the available desktop browser; a physical-phone review was not available.
