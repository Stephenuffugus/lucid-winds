# Bubblenaut main asset pack — saved production checkpoint

Use the newest version of this package. It includes the hero batch as well as subsequent work; do not upload two copies of the hero assets.

## Status — character chunk complete, 20 October 2026
60 of the 79 planned main images are present: 12 hero action sheets, 5 enemy world model sheets and all 43 enemy action sheets. These are generated SOURCE MASTERS; the runtime integration is not complete. No effects, pickup/tile sheets, world backgrounds or promotional pictures are included yet. See notes/REMAINING-WORK.md for the exact 19-image backlog and small-batch resume plan.

This archive is cumulative and already includes the hero batch. Unzip it and add the desired folders to your game repository; do not duplicate the separate hero ZIP. Begin with hero/, enemies/, designs/ and the assembly notes. reference/ contains the supplied brief and original roster. notes/ includes production records and recovery helpers; those are optional project documentation, not game runtime dependencies. No game source code or executable was provided or changed.

The archive was checked for readable PNGs, expected filenames, recorded source hashes, separable frame gutters, and ZIP integrity. Those checks do not prove smooth animation or collision correctness. The next useful milestone is integrating one hero action and one enemy in the actual build to confirm scale, extraction, anchors and timing before processing every sheet.

## Cast decision
Jessie approved five distinct enemies and then asked to finish the asset set. Preserve them with world skins: Moss Moon = Crater Hop; Crystal Caverns = Moon Mite; Rust Belt = Orbit Jelly; Frost Ring = Bolt Bucket; Magma Core = Comet Chomp. This replaces the PDF's assumption that every world uses a variant of a single antagonist. File names and behavior roles stay compatible with the developer's list. Orbit Jelly's flight hardware and Bolt Bucket's sliding skids adapt their art to the current world movement. Jessie has not separately reviewed these world skins yet; changes remain possible.

## Integration facts
The current PDF is in reference/. Character and effect images are unkeyed PNG SOURCE MASTERS, not a tested runtime atlas. Green key for Pip and Orbit Jelly (their art contains pink), magenta key elsewhere. Generated key fields have slight RGB variation: tolerance key and edge despill are required. Align after extraction using the measured bounds and ground/center anchors, then pack equal cells. Never distort a frame to fill a cell. Game colliders stay independent of visual fins, flames and padding. Pip fires from the approved blaster, not his mouth.

Read notes/LEVEL-DESIGN.md for the 25-room behavior-aware progression. It is a design handoff, not implemented maps. The source code was not supplied. Enemy-only squeeze cracks require a new explicit collider/state mechanic; they are not assumed to work merely because art shows a crack. Do not add invisible collision to background scenery.

## Optional work
The 20 extra room backgrounds in Paste 12 and bonus bosses/power-ups/omnidirectional aiming are optional and separate from the 79-picture main list. Five base backgrounds cover all worlds and can be reused across their five rooms. Do not claim optional work exists unless its files are included.

## Recovery
Read this document and the generated assembly notes. Check actual files against production-plan.json and continue the first missing item. Use the existing world model sheets as references. Do not regenerate finished images due to a context reset. Keep the named source masters untouched during runtime processing. The original source brief and approved roster are included.
