# Tomato Man expansion pack v2

This ZIP adds animation and directional coverage to the downloaded v1 pack. Keep v1. Its five world families, produce builder, pickups, exposure states, ordinary sun, menu, store art and core UI remain the base delivery. This pack contains new files for sections A, B, C, E and F; it does not duplicate sections D and G.

The original assessment and style guide are carried forward unchanged. The motion details below supersede the guide's short v1 action descriptions. No second game assessment or new playthrough is claimed. No live game, repository or Drive content was changed.

## What is here

| Section | Expansion |
| --- | --- |
| A Hero | Eight movement bearings, each with idle, four walking poses, two dash poses and hop; faceless bases, separate neutral face layers and optional faced sheets |
| A Actions | Four frames each for victory, respawn, cooling and dropping shade, facing south |
| A Hats | Twelve hats in four bearings, with a direction map for diagonal movement |
| B Sun | Four-frame wind-up, lunge and recovery sequences, plus individual frames |
| C Casters | Four wilt states for each of two awnings and four umbrella tilt states |
| C Decor | Four-frame cactus blink, wave and wind lean animations |
| E FX | Four-stage boss countdown and eclipse availability ring sheets |
| F UI | Eight one-colour cue marks, each SVG and convenience PNG |

Every artwork file is recorded in manifest.json. Contact sheets are in previews. Documents and the manifest are not runtime textures.

## Hero import

Choose one rendering route: stack the base and face sheets at identical origins, or draw the neutral composite sheet. Do not add the engine face to a neutral composite. All character sheets use 256-pixel square cells, four columns, with zero gutters. Movement sheets have two rows. The first row is idle, walk 1, walk 2, walk 3; the second is walk 4, dash crouch, dash stretch, hop. Loop walking through indices 1, 2, 3, 4, not through the whole first row. The manifest supplies these sequences explicitly.

Direction names use screen coordinates: south faces the viewer/bottom; north faces the top; east points right. South, southeast, east, northeast and north are authored views. Southwest, west and northwest are mirrored exports; the tunic print is mirrored too. This is the chosen shipping interpretation. These are elevated puppet views, not strict orthographic overhead renders. Rear and rear diagonal face sheets are intentionally transparent.

Collision stays at the existing radius-14 circle. The visual pivot stays (128,128) within every cell. Scale the visible head to approximately 28 world pixels across; do not set the entire 256-pixel cell to 28 pixels wide. Limbs can extend beyond the collider. Keep the same sprite scale within a direction's animation, rather than rescaling each frame to its head-box measurement.

Per-frame head boxes, face rectangles and hat anchors are in manifest.animations. These are exported visual placement coordinates, not physics bounds. Place a hat at the pose's hat_anchor minus the hat asset's (64,28) anchor. Hat assets use a 128-pixel canvas: retain their authored pixel size relative to the 256-pixel body before applying the shared world scale. All non-Shades hats sit above the face; Cool Shades intentionally extends downward to the eye line.

Four hat views are supplied in S, E, N, W order. Diagonals choose the nearest supplied view through hat_direction_map. South hat art is carried forward from v1; east and north are new; west mirrors east. Four bearings are not eight independently rendered hat views. Hat proportions differ by design, so large crowns deliberately overhang the head.

The four new action sequences face south. Use them for results, respawn and stationary feedback. Do not turn the physics direction merely because a celebratory sprite faces the camera. The cooling wipe's second frame hides the face overlay behind the raised hand. The shade-drop prop is a theatrical token, not an extra pickup or safe area. Spawn the actual temporary shade using existing game state.

The new movement only covers the default tomato. The thirteen alternate produce options retain their v1 assets. They do not inherit these tomato faces or become full directional animation sets automatically.

## Timing and transitions

| Sequence | Playback | Finish |
| --- | --- | --- |
| Walk | Four frames at 8 fps, loop | Idle of last bearing |
| Dash | Two frames at 12 fps | Return when the engine's dash ends |
| Hop | One held pose, runtime movement | Idle or walking |
| Victory | Four frames at 8 fps, once | Hold last frame |
| Respawn | Four frames at 10 fps, once | Idle |
| Cooling | Four frames at 8 fps, once | Idle; no repeating wipe |
| Shade drop | Four frames at 8 fps, once | Idle; cooldown remains unchanged |
| Sun wind-up | Four frames at 8 fps, once | Hold final wind-up until actual launch |
| Sun lunge | Four frames at 12 fps, once | Hold final lunge until actual travel ends |
| Sun recovery | Four frames at 8 fps, once | Return to glare |

The sun sheets are 1536 by 384, four 384-pixel cells. Use them in place of the matching v1 face state while keeping the same world diameter. Position, hit area, telegraph duration and recovery duration come from the game. Never shorten a warning to match the half-second art clip. Its pose can hold while the authoritative warning continues.

The whole visual disc must travel with the boss. The face art does not supply a movement path. The physical boss's current bounds determine the target ring and lane cue. The lane points right in its source; rotate it to the actual attack bearing.

## Casters and decorative motion

Awning sheets use a 2 by 2 grid of 720 by 220 cells. Order is healthy, drooping, sagging, collapsed. State selection follows existing wilt state. If the engine uses a continuous value, thresholds are an implementation choice; a collapsed illustration must never be shown while the game still promises full shade. The shared canvas is anchored at the caster's top-left. It is not a pixel silhouette collision mask.

Umbrellas use a 2 by 2 grid of 512-pixel cells: left, neutral, right, gust. The art includes an illustrative pole. The gameplay pivot remains (256,256); the engine's physical caster pole is authoritative. Treat left/right as posture selections and rotate with the existing tilt calculation. Avoid applying a second animated tilt over a state already depicting a gust. Preserve an accurate engine-drawn safe shadow through every transition.

Cactus strips use four 256 by 384 cells, anchor (128,360). They are scenery, never moving platforms, enemies, shade casters or collectibles. Put them at the margins where the short motion cannot hide a route. Blink at 6 fps occasionally, wave once on a result screen or distant edge, and use the wind lean only during actual wind. Do not run every cactus loop continuously. Reduced motion holds frame zero.

## Cues, colour and accessibility

Use boss_target and lunge_lane for danger, safe_exit for destination, awning_warning for a failing canopy, umbrella_turn for tilt, cooling for exposure recovery, eclipse_window for the dark interval, and shade_ready for the existing shade action. SVGs use currentColor and no external font or image. PNG versions use slate ink. Keep interactive targets at least 48 CSS pixels even when the mark is smaller.

The animated boss ring is a warm warning with a broken outline; the slate safe-window ring is an availability cue. Neither ring creates gameplay safety. Use ring scale from the actual mechanic, not the PNG's visible bounds. During reduced motion, hold the first ring frame and keep a steady lane outline. Do not blink a full-screen overlay. Keep needed moving shadows and attack cues intact.

The dark hollow eyes, orange boots, anatomical calyx and torn red tunic carry the thumbnail identity. Faces are composited from the v1 expression artwork into the new head views, with a single eye for side views. Small optical differences across authored views are part of the puppet treatment. Geometry, hat offsets and collision are deliberately separate.

## Sound direction

No sound files are included. Reuse the existing synthesis: dry boot taps, a cloth rustle for canopy wilt, a restrained wooden creak for umbrella tilt and a breathy kettle intake before the sun dives. Recovery is an exhale. Keep every necessary warning visible when sound is muted. Avoid screams or injury sounds.

## Scope and next work

These files are exported art and integration data, not an implemented game update. No test suite, validation script, audit log or runtime code is included. The production choices are documented here so the team can integrate without waiting for an answer.

The next major optional art job is the giant travelling tomato-shadow encounter proposed in v1. It needs the developers' chosen encounter footprint and travel rule before useful encounter-specific frames can be authored. Full directional animation for all thirteen alternative produce heads is a separate cosmetic expansion. Neither is claimed finished in this pack. The existing game can receive this expansion without adding either feature.
