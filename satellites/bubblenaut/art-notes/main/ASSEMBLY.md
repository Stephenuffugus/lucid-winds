# Pip animation assembly — Batch 01 complete masters

Batch 01. All hero masters use GREEN #00FF00 because the approved backpack has pink/lilac reflections. Frame indices in this document are ONE-based, read left to right. These PNGs are source art, not a pre-keyed or runtime-packed atlas. Developer keying, scale normalization and alignment remain necessary; see the final audit for measured source bounds.

| Sheet | Frames | Suggested fps | Playback | Sequence / event |
|---|---:|---:|---|---|
| hero_idle.png | 4 | 5 | Loop | Ready, inhale, exhale, half blink. No gameplay event. |
| hero_run.png | 6 | 12 | Loop | Contact, down, up, opposite contact, down, up. Revised second half for distinct poses; tune foot contact to actual run speed in engine. |
| hero_jump.png | 4 | 14 | Once, hold 4 | Crouch, extension, rising tuck, apex. Leave ground around frame 2; actual physics controls ascent. |
| hero_fall.png | 3 | 8 | Loop | Open legs, dangling legs, flutter recovery. Physics supplies vertical motion. |
| hero_land.png | 3 | 14 | Once | Contact/squash on frame 1, rebound, ready. Dust event on contact, not on an artificial animation timer. |
| hero_blow.png | 4 | 16 | Once | Brace, nozzle extension/release on frame 2, recoil, ready. Bubble is a separate game object, never painted into this sheet. |
| hero_turn.png | 3 | 18 | Once | Right, front, left. Facing reaches left on frame 3. Corrected front pose has exactly two fins. Reverse for left-to-right; don't mirror it again mid-turn. |
| hero_hurt.png | 4 | 12 | Once | Surprise, recoil, dazed, ready. Life loss belongs to the actual hit event, not a later repeated frame. |
| hero_die.png | 6 | 8 | Once, hold 6 | Surprise, tip back, tumble, seated, lie down, still. Terminal resting pose is frame 6. |
| hero_respawn.png | 4 | 10 | Once | Sparkle appearance, drop, contact on frame 3, ready. Begin existing invulnerability/blink at gameplay respawn; do not grant repeated invulnerability from the art. |
| hero_cheer.png | 6 | 6 | Loop twice for about 2 seconds | Crouch, fist up, kick, pump, hop, landing. No gameplay event. |
| hero_wave.png | 4 | 5 | Loop | Front-facing wave in, out, blink/in, out. For title screen only. |

## Source anchors and exceptions
See IMAGE-CHECKS.md and source-frame-measurements.json for measured pixel bounds for every frame. Lowest-foreground y is the visible boot/contact baseline for planted poses; it is not the body root for airborne poses. Normalize grounded poses to final y=116 in a 128px runtime cell. Retain jump/hop offsets using the adjacent grounded frame, not a fresh bottom-alignment of every airborne frame. For fall, align the torso root consistently; do not interpret dangling boots as floor contact. For die frames 5–6, align the resting silhouette bottom to the floor. Use the respawn contact frame 3 to establish its root.

All twelve sheets deviate from a mathematically exact solid key color because the generated green has small RGB variations. Use tolerance-based keying and despill, as the developer brief anticipates. Source figures are not perfectly equal-cell aligned and cross-action scale differs, so use measured extraction regions and normalize anatomy before packing. Grounded baseline drift is recorded, not hidden. Do not load these source strips with a blind equal-cell slicer and assume they are runtime-ready. All twelve contain complete unclipped figures, the specified frame counts, no text, and no painted ground shadows. The only intentional front-facing frames are turn and wave. Respawn includes requested sparkles. All hero art was generated with the built-in image tool; the provided inspection script only measures pixels.

Do not insert input lag solely to show anticipation. If shoot() currently emits immediately, enter the firing animation at frame 2 for an immediate shot, then recover through 3–4. Alternatively, delay emission by 1/16 second only as an explicit feel change. Whichever path is selected, create exactly ONE projectile per accepted shot and retain the 0.42-second cooldown. Flipping left must also mirror the muzzle anchor.

Jump and landing art do not own physics. Trigger jump art when the existing jump is accepted, interrupt with fall on actual downward velocity, and trigger land on real collision contact. Do not replay a crouch while already airborne or freeze motion for animation. Airborne firing should preserve jump/fall physics; layer the weapon pose if the engine supports it, otherwise use a brief body override without moving the collider.

Stable final anchor target for a proposed 128x128 runtime cell: feet at (64,116), 12px above its bottom. This is a PACKING TARGET, not a claim about source masters. Scale consistently from the neutral head/body and retain pose offsets. Do not scale each frame's whole bounding box independently: that makes the hero inflate and shrink, especially crouches. Ensure the blaster and backpack remain inside the visual cell; use a larger cell if necessary instead of distorting the body. The 26x30 body collider remains independent of transparent padding and fins.
