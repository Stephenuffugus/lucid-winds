# Tomato Man — walk handoff

## Install

Merge `assets/a_tomato/hero/` and `assets/b_bodies/hero/` into the game's `art/hero/`, replacing the corresponding seventy sheets. All runtime sheets are lossless WebP, 1024×512, with four columns and two rows of 256×256 cells. The body filename stems are exactly those in the brief; map the game's `bellpepper` identifier to `bell_pepper` if that older identifier remains in use.

Cell 0 is idle; 1 left contact; 2 right pass; 3 right contact; 4 left pass; 5 dash crouch; 6 dash stretch; 7 hop. Only cells 1–4 have been rebuilt. Cells 0, 5, 6 and 7 are the downloaded drawings, resized into the requested 256-pixel cells and placed at the same pivots. Lossless delivery avoids another lossy encoding pass. The new walks use the existing idle head, torso and arms as a fixed upper layer and a shared articulated leg/boot cycle beneath it. The torso and head do not translate or bob.

## Playback — necessary code change

Use the sequence **1,2,3,4** for every delivered bearing and every body. Remove the temporary south sequence **1,2,4,3** and north sequence **1,3,2,4** described in the brief. Those compensations were for the old drawings and will scramble this cycle. Retain the existing distance clock of 14 world pixels per frame and the existing 64×64 world cell draw box.

Contacts alternate LEFT at 1 and RIGHT at 3. Cell 2 is the right leg swinging through while the left leg supports; cell 4 is the left leg swinging through while the right leg supports. The support-foot list is therefore L,L,R,R; the contact-foot list is L,R. Do not mistake support during a pass for a second contact on the same foot. The contact sheets put a small arrow beside the supporting foot in each of the four cells.

Left and right refer to the character. South's left leg is on the viewer's right. North's left leg is on the viewer's left. In se, e and ne the character's left leg is the darker far leg: it leads at cell 1 and trails at cell 3. Its shade does not switch with the forward/back position. Pass poses bring the feet toward the centre and lift the swinging boot.

The existing mirror scheme can continue for west bearings. A horizontal reflection also swaps the semantic anatomical sides of the pictured character. If anatomical left-contact phase must remain identical when crossing between eastern and western bearings, offset the mirrored walk by two cells (1↔3, 2↔4); otherwise keep the existing mirror timing. Alternating contacts are preserved either way.

## Stride interpretation

The brief's 96-pixel fore/aft separation is treated as a ground-plane stride and projected into the existing elevated camera. East uses the full 96 horizontal source pixels between contact feet; depth is foreshortened to 36% in south/north and the diagonal views. Consequently those views do **not** have 96 screen pixels of vertical separation. This deliberate interpretation keeps the rear boot visible below the fixed torso and the front boot inside the existing 256-pixel cell. The head position, cell pivot and 64-pixel world draw size are not shifted to make room for a literal 96-pixel vertical split. Per-frame visible foot positions are supplied in anchors.json.

## Hat seats

Replace walk entries 1–4 with these fixed coordinates in each 256-pixel cell:

| Bearing | Cell 1 | Cell 2 | Cell 3 | Cell 4 |
|---|---|---|---|---|
| s | [128,41] | [128,41] | [128,41] | [128,41] |
| se | [131,40] | [131,40] | [131,40] | [131,40] |
| e | [129,46] | [129,46] | [129,46] | [129,46] |
| ne | [129,42] | [129,42] | [129,42] | [129,42] |
| n | [129,51] | [129,51] | [129,51] | [129,51] |

These are the unchanged idle seats, reused consistently for the four new walk cells. They replace the drifting old walk entries; the whole table must not be labelled 'unchanged'. The complete eight-cell tables in anchors.json preserve the brief's entries for idle, crouch, stretch and hop. The same walk table applies to all thirteen produce heads, since their idle head position is held throughout the new cycle. Source render pivot remains [128,128]; [128,232] is a nominal ground reference, not the moving toe coordinate.

Anchors are measured in each file's own source pixels, from the upper left. Walk records include cell-local hat coordinates and sheet-absolute hat coordinates. Foot coordinates describe the visible artwork, not collision geometry. For horizontal geometric reflection use x'=256-x; pixel-index lookup uses 255-x.

## Art and scope

The seventy current sheets were downloaded directly from the public raw GitHub links in the brief. The live game was not opened or played. No tests, validation scripts or pixel audits were run. The supplied previews are the visual art contact sheets; no test harness or production scripts are part of this delivery.

A and C previews are 1024×512. The B preview is 1520×1450 to keep all sixty-five four-cell cycles legible on one contact sheet. This presentation-only dimension is the exception to the runtime sheet dimensions. The sand background and arrows belong only to previews; runtime sprites retain alpha and contain no arrows.

The boot components were generated with the built-in image tool using the downloaded tomato sheets as the visual reference: ten isolated matte orange clay boots, left/right pairs in front, front-right, right profile, back-right and back bearings, rounded toes, ankle folds, flat soles, transparent exterior, no labels or shadows. The leg surfaces use the existing tomato's dark limb texture, posed with fixed anatomical identity; the illustrated components are composited into the new walk. The existing head, tunic, arms and preserved cells supply the exact established character look. No builder portraits, planets or unrelated assets are changed in this round.

Source pattern: `https://raw.githubusercontent.com/Stephenuffugus/Tomato_Man/main/art/hero/<body>_<bearing>.webp`, with all fourteen body stems and the five bearings in manifest.json. The supplied walk brief is the source for the original anchor tables and the required phase ordering.
