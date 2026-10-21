# Main asset assembly notes

All indices are one-based. Within each strip read left to right. Grid pieces read top-left, top-right, bottom-left, bottom-right. fps and event timing are suggestions; physics and existing cooldown/escape rules remain authoritative. Source masters need chroma keying, normalization and packing before runtime use.

Pip assembly is in ASSEMBLY.md. Final world designs are in designs/. Use Crater Hop/Moss, Moon Mite/Crystal, Orbit Jelly/Rust, Bolt Bucket/Frost and Comet Chomp/Magma.

## Action and object inventory

| File | Frames/objects | FPS | Playback | Key | Moment/order |
|---|---:|---:|---|---|---|
| enemy_moss_moon_walk.png | 4 | 8 | Loop | MAGENTA #FF00FF | None; 1 left hind foot forward, 2 passing step knees compressed, 3 right hind foot forward with arms opposite, 4 return passing step. Alternating large hind feet; horns bob gently |
| enemy_moss_moon_hop.png | 6 | 12 | Once/static | MAGENTA #FF00FF | Push-off 2; landing 6, physics-controlled; 1 deep crouch, 2 extended legs toe push-off, 3 knees tucked rising, 4 tucked at apex, 5 feet reach down for landing, 6 landing squash. Two horns stay attached, arms balance |
| enemy_moss_moon_angry_walk.png | 4 | 12 | Loop | MAGENTA #FF00FF | None; 1 fast left-foot stride with furious brows, 2 low passing step fists tight, 3 opposite stride, 4 opposite passing step. Same body color and anatomy, angry expression |
| enemy_moss_moon_fall.png | 2 | 8 | Loop | MAGENTA #FF00FF | None; 1 surprised airborne with feet dangling and arms out, 2 feet slightly closer and loose parts flutter up. Body root same height, no downward translation and no landing |
| enemy_moss_moon_turn.png | 3 | 16 | Once/static | MAGENTA #FF00FF | Visual heading changes by 3; 1 RIGHT facing ready, 2 FRONT facing pivot, 3 LEFT facing ready. Rotate the entire body coherently; do not retain right-facing eyes in final left pose |
| enemy_moss_moon_trapped.png | 4 | 5 | Loop | MAGENTA #FF00FF | None; 1 curls tightly asleep eyes closed, 2 tiny breathing expansion, 3 soft breathing contraction, 4 returns toward first curl. Limbs folded compactly, same body center, no bubble |
| enemy_moss_moon_struggle.png | 4 | 12 | Loop | MAGENTA #FF00FF | Begin at existing hold time >5s; 1 angry eyes open compact curl, 2 presses limbs outward to right, 3 recoils/twists left, 4 pushes outward both sides. Same center; visible frustrated effort. No bubble or shell drawn |
| enemy_moss_moon_escape.png | 4 | 12 | Once/static | MAGENTA #FF00FF | Release at existing 7-second timer; animation must not delay gameplay; 1 tense compact curl angry eyes, 2 bursts limbs outward, 3 extends feet toward ground, 4 lands ready furious. No bubble or burst ring drawn; separate effect handles shell |
| enemy_moss_moon_popped.png | 5 | 14 | Once/static | MAGENTA #FF00FF | Character disappears on 4; spawn treasure once at pop event, not per frame; 1 startled wide eyes in compact pose, 2 body spins quarter turn, 3 body spins upside down smaller curl, 4 ONLY a compact puff of crisp cyan white gold sparkles with NO character remaining, 5 a few smaller fading sparkles only. Keep last two sparse effects centered at original body center, no bubble ring |
| enemy_crystal_caverns_run.png | 4 | 12 | Loop | MAGENTA #FF00FF | None; 1 front near foot forward/rear foot back, 2 all feet passing under low body, 3 opposing diagonal feet extended, 4 reverse passing. Body low, antenna flexes, crystals fixed |
| enemy_crystal_caverns_drop.png | 4 | 12 | Once/static | MAGENTA #FF00FF | Drop-through collision switches at 2 only for thin ledges; 1 normal low scuttle stance, 2 tucks all feet tightly under belly and bends antenna back, 3 fully airborne dropping vertically with feet tucked, 4 legs extend downward ready for fall. No ledge or ground drawn |
| enemy_crystal_caverns_angry_run.png | 4 | 16 | Loop | MAGENTA #FF00FF | None; 1 furious near-front stride, 2 low tight passing step, 3 opposite feet stride, 4 reverse passing. Furious eyes, antenna stiff, crystals bristling slightly but unchanged count |
| enemy_crystal_caverns_fall.png | 2 | 8 | Loop | MAGENTA #FF00FF | None; 1 surprised airborne with feet dangling and arms out, 2 feet slightly closer and loose parts flutter up. Body root same height, no downward translation and no landing |
| enemy_crystal_caverns_turn.png | 3 | 16 | Once/static | MAGENTA #FF00FF | Visual heading changes by 3; 1 RIGHT facing ready, 2 FRONT facing pivot, 3 LEFT facing ready. Rotate the entire body coherently; do not retain right-facing eyes in final left pose |
| enemy_crystal_caverns_trapped.png | 4 | 5 | Loop | MAGENTA #FF00FF | None; 1 curls tightly asleep eyes closed, 2 tiny breathing expansion, 3 soft breathing contraction, 4 returns toward first curl. Limbs folded compactly, same body center, no bubble |
| enemy_crystal_caverns_struggle.png | 4 | 12 | Loop | MAGENTA #FF00FF | Begin at existing hold time >5s; 1 angry eyes open compact curl, 2 presses limbs outward to right, 3 recoils/twists left, 4 pushes outward both sides. Same center; visible frustrated effort. No bubble or shell drawn |
| enemy_crystal_caverns_escape.png | 4 | 12 | Once/static | MAGENTA #FF00FF | Release at existing 7-second timer; animation must not delay gameplay; 1 tense compact curl angry eyes, 2 bursts limbs outward, 3 extends feet toward ground, 4 lands ready furious. No bubble or burst ring drawn; separate effect handles shell |
| enemy_crystal_caverns_popped.png | 5 | 14 | Once/static | MAGENTA #FF00FF | Character disappears on 4; spawn treasure once at pop event, not per frame; 1 startled wide eyes in compact pose, 2 body spins quarter turn, 3 body spins upside down smaller curl, 4 ONLY a compact puff of crisp cyan white gold sparkles with NO character remaining, 5 a few smaller fading sparkles only. Keep last two sparse effects centered at original body center, no bubble ring |
| enemy_rust_belt_fly.png | 4 | 8 | Loop | GREEN #00FF00 | None; 1 three tentacles spread outward, 2 tentacles pull inward, 3 tentacles extend down, 4 tentacles curl back outward. Dome body stays centered at constant height, copper vents tilt gently. No legs or ground |
| enemy_rust_belt_bounce.png | 4 | 14 | Once/static | GREEN #00FF00 | Wall collision at 1; reverse visual heading by 4; 1 facing RIGHT dome squashes slightly at imaginary wall, 2 tips back wobbling, 3 turns through FRONT, 4 faces LEFT ready to fly away. No actual wall drawn. Exactly three tentacles |
| enemy_rust_belt_angry_fly.png | 4 | 12 | Loop | GREEN #00FF00 | None; 1 furious eyes, tentacles flared, 2 tentacles tucked rapidly, 3 tentacles snap downward with two tiny orange sparks at vents, 4 tentacles flare back. Body same height, exactly three tentacles |
| enemy_rust_belt_trapped.png | 4 | 5 | Loop | GREEN #00FF00 | None; 1 eyes closed powered-down core and three tentacles folded inward, 2 tiny breathing float, 3 tentacles tucked a little tighter, 4 returns toward first pose. Dome center same height, no bubble |
| enemy_rust_belt_struggle.png | 4 | 12 | Loop | GREEN #00FF00 | Begin at existing hold time >5s; 1 angry eyes open compact curl, 2 presses limbs outward to right, 3 recoils/twists left, 4 pushes outward both sides. Same center; visible frustrated effort. No bubble or shell drawn |
| enemy_rust_belt_escape.png | 4 | 12 | Once/static | GREEN #00FF00 | Release at existing 7-second timer; animation must not delay gameplay; 1 tense compact folded tentacles, 2 three tentacles burst outward, 3 dome levels out and copper vents power up, 4 hovers ready furious. No landing, no bubble drawn |
| enemy_rust_belt_popped.png | 5 | 14 | Once/static | GREEN #00FF00 | Character disappears on 4; spawn treasure once at pop event, not per frame; 1 startled wide eyes in compact pose, 2 body spins quarter turn, 3 body spins upside down smaller curl, 4 ONLY a compact puff of crisp cyan white gold sparkles with NO character remaining, 5 a few smaller fading sparkles only. Keep last two sparse effects centered at original body center, no bubble ring |
| enemy_frost_ring_slide.png | 4 | 10 | Loop | MAGENTA #FF00FF | None; 1 robot leans forward very low over smooth belly plate, boot-skids stretched back, 2 tilts a little forward claws tucked, 3 slight side lean claws extend a little for balance, 4 returns toward first low sliding posture. No walking footsteps. Body stays low and slides on smooth belly/boot-skids, not upright marching |
| enemy_frost_ring_dash.png | 4 | 16 | Loop | MAGENTA #FF00FF | Loop only while actual dash is active; 1 streamlined low dash posture with claws tucked, 2 subtly stretched forward with small crisp white snow flecks trailing, 3 streamlined extension with different snow flecks, 4 returns near first dash pose. No anticipation or landing baked into this looping dash sheet, no floor. Keep rigid robot identity |
| enemy_frost_ring_angry_slide.png | 4 | 14 | Loop | MAGENTA #FF00FF | None; 1 furious slanted red eyes low sliding pose, 2 forward tilt claws tight, 3 sharper balance lean, 4 recover low slide. Robot remains on belly/skids, no walking cycle |
| enemy_frost_ring_fall.png | 2 | 8 | Loop | MAGENTA #FF00FF | None; 1 surprised airborne with feet dangling and arms out, 2 feet slightly closer and loose parts flutter up. Body root same height, no downward translation and no landing |
| enemy_frost_ring_turn.png | 3 | 16 | Once/static | MAGENTA #FF00FF | Visual heading changes by 3; 1 RIGHT facing ready, 2 FRONT facing pivot, 3 LEFT facing ready. Rotate the entire body coherently; do not retain right-facing eyes in final left pose |
| enemy_frost_ring_trapped.png | 4 | 5 | Loop | MAGENTA #FF00FF | None; 1 powered-down red eyes thin closed lines, arms and boot-skids folded close under body, 2 tiny relaxed tilt, 3 opposite tiny tilt, 4 first compact sleeping position. Rigid robot plates do not melt, no bubble |
| enemy_frost_ring_struggle.png | 4 | 12 | Loop | MAGENTA #FF00FF | Begin at existing hold time >5s; 1 angry eyes open compact curl, 2 presses limbs outward to right, 3 recoils/twists left, 4 pushes outward both sides. Same center; visible frustrated effort. No bubble or shell drawn |
| enemy_frost_ring_escape.png | 4 | 12 | Once/static | MAGENTA #FF00FF | Release at existing 7-second timer; animation must not delay gameplay; 1 tense compact curl angry eyes, 2 bursts limbs outward, 3 extends feet toward ground, 4 lands ready furious. No bubble or burst ring drawn; separate effect handles shell |
| enemy_frost_ring_popped.png | 5 | 14 | Once/static | MAGENTA #FF00FF | Character disappears on 4; spawn treasure once at pop event, not per frame; 1 startled wide eyes in compact pose, 2 body spins quarter turn, 3 body spins upside down smaller curl, 4 ONLY a compact puff of crisp cyan white gold sparkles with NO character remaining, 5 a few smaller fading sparkles only. Keep last two sparse effects centered at original body center, no bubble ring |
| enemy_magma_core_walk.png | 4 | 9 | Loop | MAGENTA #FF00FF | None; 1 near foot forward and far foot back, 2 short stomping passing step, 3 far foot forward near foot back, 4 reverse passing. Fists counter-swing, tail and crown flame flicker |
| enemy_magma_core_leap.png | 6 | 12 | Once/static | MAGENTA #FF00FF | Push-off 2; landing 6, physics-controlled; 1 deep pounce crouch, 2 forceful toe push-off body leaning right, 3 forward airborne stretch, 4 apex legs tucked, 5 feet extend to land, 6 low landing squash. Tail and crown flame follow motion, no separate projectile |
| enemy_magma_core_angry_walk.png | 4 | 14 | Loop | MAGENTA #FF00FF | None; 1 furious near foot stride fists tight, 2 stomping passing, 3 opposite stride, 4 reverse passing. Orange cracks brighter but no glow outside silhouette, flame tail flickers larger |
| enemy_magma_core_fall.png | 2 | 8 | Loop | MAGENTA #FF00FF | None; 1 surprised airborne with feet dangling and arms out, 2 feet slightly closer and loose parts flutter up. Body root same height, no downward translation and no landing |
| enemy_magma_core_turn.png | 3 | 16 | Once/static | MAGENTA #FF00FF | Visual heading changes by 3; 1 RIGHT facing ready, 2 FRONT facing pivot, 3 LEFT facing ready. Rotate the entire body coherently; do not retain right-facing eyes in final left pose |
| enemy_magma_core_trapped.png | 4 | 5 | Loop | MAGENTA #FF00FF | None; 1 curls tightly asleep eyes closed, 2 tiny breathing expansion, 3 soft breathing contraction, 4 returns toward first curl. Limbs folded compactly, same body center, no bubble Tail/crown flames become small orange embers, cracks dim; not fully extinguished. |
| enemy_magma_core_struggle.png | 4 | 12 | Loop | MAGENTA #FF00FF | Begin at existing hold time >5s; 1 angry eyes open compact curl, 2 presses limbs outward to right, 3 recoils/twists left, 4 pushes outward both sides. Same center; visible frustrated effort. No bubble or shell drawn |
| enemy_magma_core_escape.png | 4 | 12 | Once/static | MAGENTA #FF00FF | Release at existing 7-second timer; animation must not delay gameplay; 1 tense compact curl angry eyes, 2 bursts limbs outward, 3 extends feet toward ground, 4 lands ready furious. No bubble or burst ring drawn; separate effect handles shell |
| enemy_magma_core_popped.png | 5 | 14 | Once/static | MAGENTA #FF00FF | Character disappears on 4; spawn treasure once at pop event, not per frame; 1 startled wide eyes in compact pose, 2 body spins quarter turn, 3 body spins upside down smaller curl, 4 ONLY a compact puff of crisp cyan white gold sparkles with NO character remaining, 5 a few smaller fading sparkles only. Keep last two sparse effects centered at original body center, no bubble ring |

## Alignment and event rules

Use main-frame-measurements.json for measured source rectangles and foreground bounds. Bounds are [left, top, right, bottom), original source pixels. For planted walk/slide/turn poses, visible feet/skids establish the ground line. For fly/bounce/trapped/struggle use the torso/dome center, not the lowest tentacle or sparkle. Grounded runtime anchor suggestion: (64,116) in a 128x128 cell. Centered runtime anchor: (64,64). These are final packing targets, not claims about source pixel placement. Preserve intended hop, leap and fall offsets using a shared body-root anchor. Never independently scale every frame to its own bounding box.

Jump and pounce push-off/landing events must follow actual physics. For enemy_popped, the character is gone by frame 4; the provided strip then shows sparkles. Award/spawn treasure ONCE from the authoritative pop event. If the existing game creates treasure immediately, keep that behavior and treat delayed disappearance as visual only, or explicitly approve delaying the reward. Never allow the animation loop to spawn repeated rewards.

The Rust flyer never lands. Frost robot slides low on its smooth belly/boot-skids; decorative snow does not create a collider. Thin ledges allow Crystal drop-through only when its existing drop state enables it; no squeeze mechanic is implicitly added. Angry speed remains the existing 1.5x; playback fps does not set motion speed.

## Known source-master limitations

All generated chroma backgrounds have small pixel variation, rather than mathematically exact FF00FF/00FF00. Use tolerance keying plus edge despill; preserve cyan and pink content. All art was generated with the built-in image tool. Key removal, exact runtime cell packing, semantic anchor placement and in-game animation testing have not been performed here. Source-scale and foot-line drift must be normalized by the builder. A frame rectangle is an extraction hint, not a hitbox. Any missing_clear_gutters entry in measurements requires tighter segmentation or a revised master. No source master should be deployed without this step.

Backgrounds are full opaque art, not collision maps. Crop portrait masters to 9:16 and retain the quiet HUD/control regions. The supplied PDF describes 1024x1536 -> remove 80px each side -> 864x1536. If actual generation dimensions differ, perform a proportional centered crop rather than assuming those literal offsets. Store banner needs a centered 1024x500 export, keeping key faces intact. App icon needs a square export with safe rounded-corner crop. Masters remain untouched; runtime web copies <=1600px per side per brief.

Tiles are visual masters: extract four objects independently, align flat ledge tops to the actual 12px bar, test seams in repeated strips and wall grids, then atlas-pack. Do not claim seamless tiling from a single picture inspection. Treasure/icon centers come from each isolated object, not the entire sheet.

## Pending main files

- fx_pop
- fx_escape
- fx_dust
- fx_glint
- pieces_treasures_a
- pieces_treasures_b
- pieces_moss_moon
- pieces_crystal_caverns
- pieces_rust_belt
- pieces_frost_ring
- pieces_magma_core
- bg_moss_moon
- bg_crystal_caverns
- bg_rust_belt
- bg_frost_ring
- bg_magma_core
- title_art
- store_banner
- app_icon
