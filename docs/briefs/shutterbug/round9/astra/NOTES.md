# SHUTTERBUG — Astra Round 9

**49 production PNG strips / 174 frames.** This is a new art pack for developer integration. The live game has not been modified.

| Folder | Contents | Strips | Frames |
| --- | --- | ---: | ---: |
| A | Five guardian bodies | 5 | 25 |
| B | Five second attacks and five tell marks | 10 | 21 |
| C | Five biome shove flashes, edge and corner components | 10 | 30 |
| D | Ten enemy kinds, each in fodder and elite sizes | 20 | 80 |
| E | Conveyor, shelf, lamp and gust | 4 | 18 |

Each folder contains its own `manifest.json`, `contact_sheet.png`, production PNGs and editable `source/*.txt` grids. Paths in a section manifest are relative to that section. Contact sheets are previews, not game atlases. No older asset pack is required to open these files; existing game art and behaviour remain in the developers’ project.

## Import convention

The Round 8 strip convention continues: RGBA PNG, transparent background, native pixel dimensions, horizontal frame order, no gutters or padding between frame cells. Import with nearest-neighbour sampling and no mipmaps. The lamp’s padding is inside each 96 × 96 frame and must remain intact. Frame `i` begins at `x = i × w`; its rectangle is `[i × w, 0, w, h]`.

The original sixteen-colour palette is recorded in every manifest. Source grids contain one frame per line: `frame_name row/row/...`; `.` is transparent, and `0`–`f` select the palette index. PNGs are the ready-to-import art; grids are editable masters. `sha256` is import metadata, not a separate audit deliverable.

`fps: 0` means state selection. Do not play such an entire strip as an animation. Additional timing fields describe suggested animation blocks; all actual attack windows, collisions and AI remain game-owned. Pivots use native pixel coordinates relative to a frame, not the combined strip. Edge pivots may equal the frame width or height.

## A — Guardian bodies

All five keys are **80 × 64**, five frames in this order: **breathe, brace, tell, hurt, down**. Their pivots are `[40,64]` and their erosion grid is **5 × 4 cells of 16px**, with its origin at the sprite’s top-left. Use one persistent erosion mask across every pose. Changing to tell, hurt or down must not restore destroyed cells. Keep the body’s world origin fixed while switching poses.

| Biome | Sprite key | Identity |
| --- | --- | --- |
| Attic | `boss_moth_mother` | Dusty ocellated wings, fur, a pitched shed on her back |
| Frost | `boss_rime_mass` | Tall, broken ice facets around a dark core |
| Deep | `boss_anemone` | Uneven tentacles and multiple open mouths |
| Bramble | `boss_thorn_heart` | An open knot of thorny stems around a split seed |
| Ember | `boss_cinder_kiln` | Brick courses, chimney and fire mouth |

Select tell for the brief’s **500ms** anticipation window. Hurt is a distinct bright pose with Ink retained. Down is a persistent remnant, not a disappearing particle burst. Alternate breathe/brace only if that matches the existing guardian state machine; these are named poses, not an imposed new timing model.

## B — Second attacks

| Key | Frame size | Order | Pivot / suggested playback |
| --- | --- | --- | --- |
| `boss_dust_cloud` | 32 × 32 | drift0–2 | `[16,16]`, loop 8fps |
| `boss_frost_breath` | 48 × 24 | breath0–2 | `[0,12]` at mouth, loop 10fps while active |
| `boss_floor_whip` | 16 × 48 | rise0–2 | `[8,48]` at floor, 10fps once |
| `boss_seed_pod` | 16 × 16 | roll0–3 | `[8,16]`, loop 10fps |
| `boss_floor_flame` | 16 × 16 | crawl0–2 | `[8,16]`, loop 10fps |

Each key has a matching `_tell` strip with one **16 × 16** frame and pivot `[8,16]`. Place that marker at the impending attack’s floor/location cue, then remove it as the attack activates. The frost marker identifies the emission point; it is not a 48px collision cone. The tentacle rises from a constant bottom anchor. Reverse the seed’s frame order for opposite rotation. Mirror the cone or flame about its emission anchor for opposite travel.

## C — Shove perimeter

For each of `attic`, `frost`, `deep`, `bramble`, `ember`, use:

- `fx_shove_<biome>_edge`: **16 × 16**, one-pixel horizontal line at `y=0`.
- `fx_shove_<biome>_corner`: **16 × 16**, one-pixel L along `y=0` and `x=0`.

Both contain **windup, flash, peak**. Draw all pieces with the same phase index. A suggested sequence is 6fps once; the shove’s actual windup clock wins. Preserve one native pixel of thickness and use integer coordinates.

For an intact 80 × 64 body at `(bx,by)`, the surrounding tile rectangle starts at `(bx−32,by−32)` and measures **144 × 128**, or **9 × 8 tiles**. The body’s local offset inside it is `[32,32]`. Use seven straight tiles across the top and bottom between corners and six down each side. Keep this full body rectangle even after erosion, so losing a cell does not make the warning jump.

| Position | Component | Rotation from supplied top/left orientation |
| --- | --- | --- |
| Top edge | edge | 0° |
| Right edge | edge | 90° clockwise |
| Bottom edge | edge | 180° |
| Left edge | edge | 90° counter-clockwise |
| Top-left corner | corner | 0° |
| Top-right corner | corner | 90° clockwise |
| Bottom-right corner | corner | 180° |
| Bottom-left corner | corner | 90° counter-clockwise |

Rotation is around each square tile. Do not stretch the tile, extrude its line or add an opaque background. Overlay this coloured perimeter on the existing ink frame; remove the flash after the shove window. The outlined 80 × 64 box shown in the contact sheet is explanatory only.

## D — Enemy kinds

Every listed key has a matching `<key>_elite` strip. Fodder is **16 × 16**; elites are authored on **24 × 24** grids with stronger anatomy and Magenta tier markings. All strips contain **idle, move, hurt, dead**, with a continuous Ink silhouette.

| Biome | Kind 1 | Kind 2 |
| --- | --- | --- |
| Attic | `silverfish` | `thread_spider` |
| Frost | `snow_flea` | `icicle_bat` |
| Deep | `lamprey` | `lamp_jelly` |
| Bramble | `bramble_tick` | `seed_wasp` |
| Ember | `cinder_mite` | `ash_moth` |

Idle/move can alternate at a suggested 8fps. Hurt/dead are selected states and must never be included in that loop. Per-kind facing and anchoring are in the manifests. Ground crawlers use bottom-centre; flyers/swimmers use centre; the spider uses top-centre for its visible thread. Extend that thread toward the ceiling in code as it drops. Rotation/mirroring, trajectories, collision bounds and the ash moth’s burning trail are developer-owned. These are new kinds, not replacements for the existing Round 8 enemy keys.

## E — Room pieces

| Key | Frame size / order | Placement and playback |
| --- | --- | --- |
| `conveyor` | 16 × 16; right0–3, left0–3 | Top-left anchor; loop only one four-frame block at 12fps; code carries the player |
| `crumbling_shelf` | 16 × 16; whole, cracked, falling, gone | Top-left anchor; state sequence once; gone is fully transparent |
| `swinging_lamp` | 96 × 96; left, centre, right | Fixed ceiling pivot `[48,2]`; 48px chain; 32px lamp; angles −20°, 0°, +20° |
| `window_gust` | 16 × 48; gust0–2 | Bottom-centre `[8,48]`; 8fps loop; rightward curls, mirror for left |

For the lamp, use **0,1,2,1** as the repeating pose order, approximately 4fps, or map the poses to the existing pendulum simulation. The mount never translates. Do not independently rotate or scale the supplied poses unless you intentionally replace this animation. Belt and shelf collision surfaces are at local `y=0`; collision thickness is not dictated by the painted support below them.

## Shipping readings and limitations

- **Brief source:** the supplied `ASTRA-SHUTTERBUG-ROUND9-NOV06.txt` was read start to finish; the Drive folder could not be retrieved in this session, so the supplied copy governs this delivery.
- **Playthrough:** the requested URL exposed build `sb m2 11` with sample/photo play but no Darkroom route; I played the sample, did not reach a guardian, and proceeded from the supplied guardian specification.
- **Dark mass:** retain the existing game’s dark world mass under each guardian; it is not painted into these new erodible bodies or replaced with new terrain art.
- **Enemy sizes:** “ten kinds” is interpreted as ten designs, each with both a 16px fodder and 24px elite version, so the developers can use either tier.
- **Enemy states:** the explicit Round 9 idle/move/hurt/dead list takes precedence over the actual Round 8 two-frame a/b strips.
- **Existing jelly key:** the new Deep jelly is named `lamp_jelly` to avoid silently replacing Round 8’s `jelly` and `jelly_elite`.
- **Attack marks:** unspecified tell-mark dimensions are resolved to 16 × 16, one static mark for each attack.
- **Shove sprite:** “a 1px ring sprite we tile” is resolved to reusable 16px edge and corner tiles with a one-pixel stroke, three phases per biome.
- **Two-cell distance:** the shove frame is a fixed 32px expansion of the full 80 × 64 body rectangle, not the irregular surviving silhouette.
- **Lamp sizing:** “32px lamp on a 48px chain” describes the hanging object; a 96 × 96 padded frame preserves its ceiling pivot and complete swing.
- **Shelf ending:** gone is intentionally an empty fourth frame, not a missing export.

No HUD, weapon or title assets are included. The ZIP contains this round only; earlier packs remain separate and unchanged.
