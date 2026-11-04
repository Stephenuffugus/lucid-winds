# SHUTTERBUG — Round 8 developer handoff

**All five sections delivered: 42 PNG strips / 386 frames.** That includes 323 hero frames (the base set and all sixteen looks, each with movement and special poses), 24 furniture/prop frames, three control-strip frames, sixteen feedback frames and twenty enemy frames.

Import `manifest.json` by sprite key. `ASSET_INDEX.md` lists all files. `import_groups.json` separates the base big hero, first eight looks, next eight looks, furniture, control strip, feedback and enemy replacements so the team can integrate in the brief's priority order while using this one ZIP.

Every production entry has `context: room`, the exact 16-colour palette, binary transparency and an editable source grid. Old hero keys are retained in earlier packs; only the ten named enemy keys are whole-key replacements. This delivery is art and integration metadata, not an updated game build.

## 1. The big bug

The approved indexed hero silhouette and poses were enlarged onto the requested native grids without smoothing. The round rear, compact face, antennae and feet remain the same character. Cosmetic movement patterns come from their actual prior strips, rather than being guessed from names. Extra action patterns use the approved skin's shell pattern on the matching larger base pose.

### Sizes, placement and unchanged hitbox

For **every** pose, physics remains 12x16. Use the same world position and bottom-centre anchor as before. Coordinates below are native pixels; the pivot is at the lower edge of the image, not at the centre of its last pixel.

| Pose family | Render size | Pivot in image | Hitbox in image x,y,w,h | Draw offset from hitbox top-left |
| --- | --- | --- | --- | --- |
| Movement, dash, hurt, drop-in | 16x24 | 8,24 | 2,8,12,16 | -2,-8 |
| Squash | 20x20 | 10,20 | 4,4,12,16 | -4,-4 |
| Stretch | 14x28 | 7,28 | 1,12,12,16 | -1,-12 |

All nontransparent pixels on the bottom row are Ink. Mirror around the same bottom-centre pivot. Do not enlarge the collider, move its feet, or apply the previous runtime squash/stretch on top of the supplied squash/stretch frames. Visual pixels extending above or beside the collision box are intentional.

### Base look

| Key | Frames | Timing |
| --- | --- | --- |
| hero_big | idle0, idle1, run0, run1, run2, run3, jump, fall, cling, dive, land, dead | Pose selection; retain existing action clocks |
| hero_big_dash | dash | Static action pose |
| hero_big_hurt | recoil | Static action pose |
| hero_big_squash | squash | Static action pose |
| hero_big_stretch | stretch | Static action pose |
| hero_big_dropin | descending, contact, settled | 8 fps, once; settled equals idle0 |

Within the movement strip, idle is indices 0–1 at the old 2 fps cadence and run is indices 2–5 at the old 12 fps cadence. The other frames follow the existing action state. `fps: 0` on an atlas means select poses, not animate through every entry.

### All sixteen looks, with explicit compatibility mapping

The brief requests two eight-look groups. The previously delivered sources actually contain **4 + 4 + 8 looks across three keys**. This pack keeps all sixteen IDs and their order, grouping the first two old strips together and putting the Round 7 eight in the second requested family:

| New movement key | Skin indices 0–7 | Original source |
| --- | --- | --- |
| hero_colours_big | sun, umber, teal, lapis, pinstripe, domino, crescent, argyle | hero_colours indices 0–3, then hero_colours_r3 indices 0–3 |
| hero_colours_r3_big | chrome, night, polaroid, negative, tiger, rainbow_lens, ghost, gold | hero_colours_r7 indices 0–7 |

**Bind by `skin_id`, not by assuming a matching old strip suffix.** `skin_bindings.json` provides every old key/index, new key/index and exact action block. Preserve existing save IDs, reward conditions and unlocked state.

Each movement atlas contains 96 frames: **12 * skin_index + pose_index**. Special actions must use separate strips because squash and stretch have different dimensions. These companion families are included:

- `hero_colours_dash_big`, `hero_colours_hurt_big`, `hero_colours_squash_big`, `hero_colours_stretch_big`, `hero_colours_dropin_big`.
- `hero_colours_r3_dash_big`, `hero_colours_r3_hurt_big`, `hero_colours_r3_squash_big`, `hero_colours_r3_stretch_big`, `hero_colours_r3_dropin_big`.

Dash/hurt/squash/stretch contain one frame per skin; select that skin index. Drop-in has three frames per skin; select `3 * skin_index + phase`. Play only that three-frame block at 8 fps, then return to the selected look's idle. Every settled frame exactly matches its look's idle0. The manifest names every frame, and `skin_bindings.json` includes these start/count values directly.

All larger cosmetic alpha masks match their larger base poses. Outlines, eyes and non-shell details are preserved. `hero_body_masks.json` supplies the nineteen **base-pose** shell masks for the existing dash/hurt flash treatment: `1` means shell, `.` means leave unchanged. Apply the matching base mask to any cosmetic; searching a Chrome or Ghost skin for Sun pixels would miss its body. Keep Ink and eyes unchanged. These masks are data, not additional PNG keys.

## 2. Furniture and landings

| Key | Frame size / frames | Behaviour and placement |
| --- | --- | --- |
| tab_bold | 16x8; plain, lit | Repeat horizontally; collision top at local y=0 |
| ledge | 16x8; attic, frost, deep, overgrowth, ember | Four tiles make a 64x8 landing; collision top at y=0 |
| tripod | 16x32; unlit, lit, flash0, flash1 | Bottom-centre pivot 8,32; camera checkpoint |
| film_strip | 48x8; a,b at 4 fps | Loop the sprockets; code supplies sideways movement and carries the player |
| fan | 16x16; a,b,c at 12 fps | Loop; bottom-centre pivot 8,16 |
| fx_wind | 16x48; wind_0–wind_3 at 8 fps | Loop; open upward chevrons, pivot 8,48 |
| key_glint | 16x16; glint_0–glint_3 at 6 fps | Loop at the hidden key's position; centre pivot 8,8 |

The platform strips have an uninterrupted Glare top row, Ink separation row and two-row Ink underside. Repeat tiles with no gap. Their visual thickness must not turn a one-way platform into an eight-pixel solid collision block. The explicit requested 16x8 dimensions take precedence over the brief's approximate “twice as thick” wording.

Cream Film appears only on the repair tab and moving film strip. The lit tab adds a white reflection, not beacon-yellow. The biome landing colours retain the established theme cues; the Attic line uses Amber as in earlier biome platform trim.

The tripod is a camera with a separate flash lamp. Unlit has a grey lens; lit has a Teal lens and a check, so state is not communicated by colour alone. On activation, play flash0 then flash1 at **12 fps**, then select lit. Its manifest's main `fps: 0` is intentional because the strip also contains static states; `activation_frames`, `activation_fps` and `activation_end` describe the transition. Trigger once per activation event, not every frame that the hero overlaps the checkpoint.

For the updraft, the wind column's bottom centre meets the fan's **top** centre. Relative to the fan image's top-left, draw the column at `[0,-48]`; relative to the fan's bottom-centre world anchor, the column's bottom anchor is 16 pixels above it. Wind does not conceal the photo with a filled rectangle. The glint is a small outlined white reflection; the actual hidden-key location and reveal rules remain game-owned.

## 3. Polaroid in the control strip

`polaroid_frame` is **72x96** with one `base` frame. Its transparent aperture is exactly:

**x=6, y=6, width=60, height=72** — inclusive bounds x=6–65, y=6–77.

Layer the room preview first, markers second, and frame last. Use the same image transform for the preview and marker positions. Prefer containing the whole room rather than silently cropping navigation information. For a 384x768 room, a full-room fit is 36x72, centred inside the aperture at local `[18,6]`; the side gutters are 12 pixels each within the window.

`hero_dot` and `beacon_dot` are each 4x4, frame `dot`, with centre pivot `[2,2]`. Hero is a square Sun core with a complete Ink border. Exit is a Glare core with a chamfered Ink silhouette; the two marks differ in both colour and shape. Clamp marker centres two native pixels inside the fitted image bounds so the whole mark stays visible. For the 36x72 fit above, clamp centre x to 20–52 and y to 8–76 before subtracting the marker pivot.

This print is room-context art and uses Paper/Ash/Ink, not Film cream. It supplies the visual element for the blank control area; button placement, touch targets and control-strip layout still belong to the game. `review/polaroid_example.png` demonstrates compositing, not a second production sprite.

## 4. Feedback effects

| Key | Frame size | Frames / timing | Event alignment |
| --- | --- | --- | --- |
| fx_pickup | 16x16 | pick_0–pick_3, 12 fps | Pivot 8,8 at the collected speck |
| fx_land_dust | 16x8 | dust_0–dust_3, 12 fps | Pivot 8,8 at the foot/landing line; draw behind the hero |
| fx_checkpoint | 32x32 | save_0–save_3, 12 fps | Pivot 16,16 at the tripod flash lamp |
| fx_floor | 48x16 | floor_0–floor_3, 8 fps | Pivot 24,8 at the centre of the landing's top edge |

Play each once, then remove it. The first three last approximately 333 ms; the floor shimmer lasts 500 ms. No Sun or Film appears in these effects. The pickup grows into four clear outlined glints, dust travels sideways, the checkpoint radiates white camera rays and the floor reflection sweeps along the landing.

Tripod flash origin is local `[12,4]`. For tripod top-left `(x,y)`, draw `fx_checkpoint` at `(x-4,y-12)` so its centre matches the lamp. On a 64px landing, centre the 48px floor effect with an 8px horizontal inset and an 8px upward offset from the landing top. The floor effect is a first-arrival event, not a continuous platform animation.

For reduced motion, skip the bursts/shimmer, select tripod lit immediately and use a static fan/wind/glint frame if the game suppresses decorative loops. Movement and collision rules do not depend on effect playback.

## 5. Enemy bold pass

Whole-key replacements are supplied for `moth`, `icicle`, `jelly`, `crawler`, `spark` and the corresponding `_elite` keys. Regular enemies remain 16x16, elites 24x24. Both original frames `a,b`, the 12 fps cadence, anchors and exact alpha silhouettes are retained. Replace each complete manifest entry by key; the new PNG basenames are the keys, while `legacy_file` records the older `enemy_...png` basename.

Every occupied boundary pixel now has Ink, including tips formerly drawn as exposed highlights. Glare highlights are inside the outline. Moth and icicle neutral bodies advance toward Paper/Glare; jelly and crawler gain stronger internal highlights without losing their Teal/Moss identity; spark cores gain Paper around their Glare centres. Existing elite Magenta marks remain. No Sun or Film appears on any enemy.

`review/enemies_before_after.png` compares every state against the prior regular art and Round 2 elite replacements. Silhouette/contact geometry has not been expanded to create the bold pass.

## Readability proof and a remaining camera limit

`review/phone_widths.png` places native assets over a crop from the supplied room reveal at **320, 360 and 412px**. It keeps the cat tree and table visible and places landings on their surfaces. It is an **illustrative placement proof**, not a running level, engine screenshot or new level layout. The photo crop is review context only; it is not in the production manifest.

The proof models a 384px-wide native room fitted inside 12px side margins. Under that assumption, the big hero's displayed bounds are approximately:

| Viewport | Old hero | Big hero |
| --- | --- | --- |
| 320px | 9x12px | 12x19px |
| 360px | 11x14px | 14x21px |
| 412px | 12x16px | 16x24px |

The larger sprite improves readability, but it does not by itself make the hero large at the narrowest fitted-room scale. Check the actual camera scale, render resolution, contrast and arm's-length play on phones. If it remains too small, adjust the camera's visible area rather than enlarging collision bounds. The photo-under-grid rendering, floor generation, furniture placement, checkpoints, camera lead and event timing described in the brief still require game-code work.

## Sources, rebuild and checks

All production PNGs are exact indexed-grid output with RGBA alpha 0 or 255. There are no painted backgrounds, generated marketing images, text strips or new store/Darkroom/album artwork in this round.

Each `source/<sprite>.txt` has one line per frame: `frame_name row0/row1/...`. Each row has exactly w characters and each frame h rows. `.` is transparent; `0`–`f` index the manifest palette. `source/reference_grids.json` embeds the approved prior art used for authoring and comparisons, so the tools work without earlier pack folders.

With Python 3.10+ and Pillow 10.1+:

```bash
python3 tools/verify_assets.py
python3 tools/rebuild_from_grids.py
python3 tools/render_reviews.py
```

After editing a grid, rebuild and verify. `tools/build_assets.py` is the original authoring recipe; rerunning it overwrites grid edits. Both the recipe and grid rebuild were checked for pixel-identical round trips. `hero_body_masks.json` describes the original base art: regenerate/update it if you deliberately redraw the base shell, rather than only recolouring it.

`review/validation.json` records the checks: all 42 strips / 386 frames, sizes, frame names, source reconstruction, hashes, palette/alpha laws, every hero's Ink feet row and physics offsets, sixteen skin bindings and action ranges, settled/idle equality, body masks, continuous platform edges, exact Polaroid aperture and all twenty enemy outlines. Review images show all sixteen looks in every pose, anchor overlays, room assets/effects, enemy comparisons, phone layouts and real-frame run animations.

The supplied previews are offline verification. Final device playtesting and integration with the actual camera, rendering and gameplay code remain necessary.
