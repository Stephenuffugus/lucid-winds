BUBBLENAUT, Astra ANIMATION list (match your hero + antagonist)

Sky Wolf Studio. Written 20 Oct 2026 for Stephen to pass to Astra, one paste at a time.
Source of truth: lucid-winds repo, art-asset-lists/bubblenaut/ASTRA-ASSET-LIST.md. This replaces the earlier doc in this folder, "BUBBLENAUT, Astra Asset List (working title)", which you can delete.


READ THIS FIRST (Stephen, two minutes)

What changed: you have designed the hero and the antagonist yourself, so there is no style to choose any more. Every paste below tells Astra to match YOUR pictures exactly. And everything is now full frame by frame animation, built from the states the game really has (I read them out of the game's code).

1. THE ANTAGONIST NEEDS YOUR CALL BEFORE ITS PASTE. The game has no antagonist today: no boss, no villain, nothing in the code. Tell me what it does:
   a. a boss at the end of each world (room 5 of every world),
   b. one final boss at the very end (room 25, The Core),
   c. the one behind the critters, seen in story moments but never fought.
   For a or b, a boss fight is NEW GAME CODE that I would build (its moves, how many bubbles it takes, how it hurts you), not just art. For c, only its Entrance, Idle, Taunt and Defeated sheets are needed. Paste 8 is the full set any of these would use, so you can make it now. My working assumption until you say otherwise: b, one final boss in The Core.

2. THE NAME. Bubblenaut is still a working title. Nothing in these pictures has words in it, so the art does not wait on the name, but the Play listing will.

3. THE CRITTERS have no design from you yet, so Paste 2 makes a design picture of each of the five in your style. Pick the ones you like (or ask Astra for changes), and the chosen picture becomes the reference for that critter's animation paste.

HOW THIS WORKS, HONESTLY

Image generators struggle to keep a character exactly the same across many frames. So every animation is its own sheet of 2 to 8 frames in one row, and every paste tells Astra to attach your reference pictures. Attach them to EVERY message, even in the same chat. Some frames will still drift a little: I align, trim, space and time every frame in the build, and I will tell you which sheets drifted too far so you can ask for a redo.

The bubbles themselves stay drawn by the game, because a picture cannot carry see through glass. The critters are drawn curled up inside where a bubble will go, and the game draws the bubble around them. Player 2 is your hero recoloured pink by the game; if your design does not recolour well, tell me and we add a Player 2 paste.

HOW TO SEND THEM TO ME

Drop the finished pictures into the Bubblenaut folder in 012Assets, or straight into the chat, named with the file names in this doc (Astra is asked to name them that way). Say which paste they came from. I put each paste in the game and show you before anything goes live.

THE ORDER (one paste at a time)

Paste 1: the hero, 11 animation sheets. Send these first: I put your hero in the game moving, so you see the whole pipeline work before we make the rest.
Paste 2: the five critter designs, 5 pictures.
Paste 3: Hopper animations, 9 sheets.
Paste 4: Skitter animations, 9 sheets.
Paste 5: Drone animations, 7 sheets.
Paste 6: Slick animations, 9 sheets.
Paste 7: Cinder animations, 9 sheets.
Paste 8: the antagonist, 11 sheets. Fine to make now; only the fight itself waits on your answer to question 1.
Paste 9: effects (pop, angry burst, landing dust, treasure twinkle), 4 sheets.
Paste 10: world building blocks, treasures and icons, 7 pictures.
Paste 11: the five world backgrounds, 5 pictures.
Paste 12: title screen art, Play banner, app icon, 3 pictures.
Paste 13, OPTIONAL: a different background for every room, 20 pictures. Skip it if you like: I can also change the light, tint and drifting haze per room in the game for free. Make these only if you want different scenery in every room.

Total: 89 pictures for the full set (69 animation sheets, 5 critter designs, 7 pieces pictures, 5 backgrounds, 3 store pictures), plus 20 optional room backgrounds. The hero alone (Paste 1) already makes the game look new.

THE ANIMATION LIST (what each sheet is for; the frames per second, loop and cell size are for me)

Hero (11 sheets, 60 frames; plus 1 optional sheet, 6 frames)
hero_idle.png | Idle | for: standing on the ground, not moving | 6 frames | 8 fps | loops | cell 128 x 128 px | one row
hero_run.png | Run | for: moving left or right on the ground (the game flips it for left) | 8 frames | 12 fps | loops | cell 128 x 128 px | one row
hero_jump.png | Jump | for: the jump button, rising (the game holds the last frame until it starts falling) | 4 frames | 12 fps | plays once | cell 128 x 128 px | one row
hero_fall.png | Fall | for: in the air going down, including dropping out of the bottom of the room and back in at the top | 4 frames | 10 fps | loops | cell 128 x 128 px | one row
hero_land.png | Land | for: touching down after a fall | 3 frames | 16 fps | plays once | cell 128 x 128 px | one row
hero_blow.png | Blow a bubble | for: the bubble button (one shot every 0.42 seconds; the game sends the bubble out on frame 4) | 6 frames | 15 fps | plays once | cell 128 x 128 px | one row
hero_turn.png | Turn | for: changing direction | 3 frames | 16 fps | plays once | cell 128 x 128 px | one row
hero_hurt.png | Hurt | for: touched by a loose critter, a life is lost | 4 frames | 12 fps | plays once | cell 128 x 128 px | one row
hero_die.png | Out of lives | for: the last life is lost, game over | 8 frames | 10 fps | plays once | cell 128 x 128 px | one row
hero_respawn.png | Respawn | for: reappearing at the start point after a hit (the game then blinks the hero for 2.2 seconds) | 6 frames | 12 fps | plays once | cell 128 x 128 px | one row
hero_cheer.png | Room cleared | for: the 2.2 second room cleared banner | 8 frames | 10 fps | loops | cell 128 x 128 px | one row
hero_wave.png | Title wave (optional) | for: the title screen | 6 frames | 8 fps | loops | cell 128 x 128 px | one row

Hopper, Moss Moon (9 sheets, 44 frames)
hopper_walk.png | Walk | for: walking the floor between hops | 6 frames | 10 fps | loops | cell 128 x 128 px | one row
hopper_hop.png | Hop | for: its brain: a big hop every 1.6 to 3.8 seconds | 6 frames | 12 fps | plays once | cell 128 x 128 px | one row
hopper_angry_walk.png | Angry walk | for: after breaking out of a bubble: 1.5 times faster, glowing red in the game | 6 frames | 14 fps | loops | cell 128 x 128 px | one row
hopper_fall.png | Fall | for: walking off a ledge | 2 frames | 8 fps | loops | cell 128 x 128 px | one row
hopper_turn.png | Turn | for: turning around at a wall or a ledge | 3 frames | 16 fps | plays once | cell 128 x 128 px | one row
hopper_trapped.png | Trapped | for: caught in a bubble, floating (the game draws the bubble around it) | 6 frames | 8 fps | loops | cell 128 x 128 px | one row
hopper_struggle.png | Struggling | for: the last 2 seconds before it breaks free (the game turns the bubble red) | 4 frames | 12 fps | loops | cell 128 x 128 px | one row
hopper_escape.png | Breaking out | for: breaking out of the bubble after 7 seconds, angry | 5 frames | 15 fps | plays once | cell 128 x 128 px | one row
hopper_popped.png | Popped | for: popped by the player: it becomes its world's treasure | 6 frames | 15 fps | plays once | cell 128 x 128 px | one row

Skitter, Crystal Caverns (9 sheets, 42 frames)
skitter_run.png | Scuttle | for: running the floor (its brain: the fastest walker) | 6 frames | 16 fps | loops | cell 128 x 128 px | one row
skitter_drop.png | Drop through | for: its brain: sometimes drops straight through a thin ledge | 4 frames | 12 fps | plays once | cell 128 x 128 px | one row
skitter_angry_run.png | Angry scuttle | for: after breaking out of a bubble | 6 frames | 18 fps | loops | cell 128 x 128 px | one row
skitter_fall.png | Fall | for: dropping off a ledge | 2 frames | 8 fps | loops | cell 128 x 128 px | one row
skitter_turn.png | Turn | for: turning around at a wall or a ledge | 3 frames | 16 fps | plays once | cell 128 x 128 px | one row
skitter_trapped.png | Trapped | for: caught in a bubble, floating (the game draws the bubble around it) | 6 frames | 8 fps | loops | cell 128 x 128 px | one row
skitter_struggle.png | Struggling | for: the last 2 seconds before it breaks free (the game turns the bubble red) | 4 frames | 12 fps | loops | cell 128 x 128 px | one row
skitter_escape.png | Breaking out | for: breaking out of the bubble after 7 seconds, angry | 5 frames | 15 fps | plays once | cell 128 x 128 px | one row
skitter_popped.png | Popped | for: popped by the player: it becomes its world's treasure | 6 frames | 15 fps | plays once | cell 128 x 128 px | one row

Drone, Rust Belt (7 sheets, 33 frames)
drone_fly.png | Fly | for: its brain: flies a wavy lane across the room, never lands | 4 frames | 16 fps | loops | cell 128 x 128 px | one row
drone_bounce.png | Bump and turn | for: bouncing off a wall (used in place of a turn) | 4 frames | 14 fps | plays once | cell 128 x 128 px | one row
drone_angry_fly.png | Angry fly | for: after breaking out of a bubble | 4 frames | 18 fps | loops | cell 128 x 128 px | one row
drone_trapped.png | Trapped | for: caught in a bubble, floating (the game draws the bubble around it) | 6 frames | 8 fps | loops | cell 128 x 128 px | one row
drone_struggle.png | Struggling | for: the last 2 seconds before it breaks free (the game turns the bubble red) | 4 frames | 12 fps | loops | cell 128 x 128 px | one row
drone_escape.png | Breaking out | for: breaking out of the bubble after 7 seconds, angry | 5 frames | 15 fps | plays once | cell 128 x 128 px | one row
drone_popped.png | Popped | for: popped by the player: it becomes its world's treasure | 6 frames | 15 fps | plays once | cell 128 x 128 px | one row

Slick, Frost Ring (9 sheets, 42 frames)
slick_slide.png | Slide | for: moving along the floor | 6 frames | 10 fps | loops | cell 128 x 128 px | one row
slick_dash.png | Dash | for: its brain: a 0.7 second dash at 2.2 times speed every few seconds | 4 frames | 16 fps | loops | cell 128 x 128 px | one row
slick_angry_slide.png | Angry slide | for: after breaking out of a bubble | 6 frames | 14 fps | loops | cell 128 x 128 px | one row
slick_fall.png | Fall | for: sliding off a ledge | 2 frames | 8 fps | loops | cell 128 x 128 px | one row
slick_turn.png | Turn | for: turning around at a wall or a ledge | 3 frames | 16 fps | plays once | cell 128 x 128 px | one row
slick_trapped.png | Trapped | for: caught in a bubble, floating (the game draws the bubble around it) | 6 frames | 8 fps | loops | cell 128 x 128 px | one row
slick_struggle.png | Struggling | for: the last 2 seconds before it breaks free (the game turns the bubble red) | 4 frames | 12 fps | loops | cell 128 x 128 px | one row
slick_escape.png | Breaking out | for: breaking out of the bubble after 7 seconds, angry | 5 frames | 15 fps | plays once | cell 128 x 128 px | one row
slick_popped.png | Popped | for: popped by the player: it becomes its world's treasure | 6 frames | 15 fps | plays once | cell 128 x 128 px | one row

Cinder, Magma Core (9 sheets, 44 frames)
cinder_walk.png | Stalk | for: its brain: walks toward the nearest player | 6 frames | 10 fps | loops | cell 128 x 128 px | one row
cinder_leap.png | Leap | for: its brain: sometimes pounces at the player | 6 frames | 12 fps | plays once | cell 128 x 128 px | one row
cinder_angry_walk.png | Angry stalk | for: after breaking out of a bubble | 6 frames | 14 fps | loops | cell 128 x 128 px | one row
cinder_fall.png | Fall | for: dropping off a ledge | 2 frames | 8 fps | loops | cell 128 x 128 px | one row
cinder_turn.png | Turn | for: turning around at a wall or a ledge | 3 frames | 16 fps | plays once | cell 128 x 128 px | one row
cinder_trapped.png | Trapped | for: caught in a bubble, floating (the game draws the bubble around it) | 6 frames | 8 fps | loops | cell 128 x 128 px | one row
cinder_struggle.png | Struggling | for: the last 2 seconds before it breaks free (the game turns the bubble red) | 4 frames | 12 fps | loops | cell 128 x 128 px | one row
cinder_escape.png | Breaking out | for: breaking out of the bubble after 7 seconds, angry | 5 frames | 15 fps | plays once | cell 128 x 128 px | one row
cinder_popped.png | Popped | for: popped by the player: it becomes its world's treasure | 6 frames | 15 fps | plays once | cell 128 x 128 px | one row

Antagonist (11 sheets, 66 frames)
boss_intro.png | Entrance | for: its first appearance | 8 frames | 10 fps | plays once | cell 256 x 256 px | one row
boss_idle.png | Idle | for: standing between moves | 6 frames | 8 fps | loops | cell 256 x 256 px | one row
boss_move.png | Move | for: moving around the room | 8 frames | 10 fps | loops | cell 256 x 256 px | one row
boss_taunt.png | Taunt | for: mocking the player | 6 frames | 10 fps | plays once | cell 256 x 256 px | one row
boss_windup.png | Wind up | for: the warning before an attack, so the player can learn to dodge | 4 frames | 10 fps | plays once | cell 256 x 256 px | one row
boss_attack.png | Attack | for: the attack itself | 6 frames | 14 fps | plays once | cell 256 x 256 px | one row
boss_shot.png | Its projectile | for: the thing it throws or fires | 4 frames | 12 fps | loops | cell 64 x 64 px | one row
boss_hit.png | Hit | for: a bubble pops against it | 4 frames | 14 fps | plays once | cell 256 x 256 px | one row
boss_trapped.png | Trapped | for: caught in a giant bubble | 6 frames | 8 fps | loops | cell 256 x 256 px | one row
boss_escape.png | Breaking out | for: bursting free of the giant bubble | 6 frames | 14 fps | plays once | cell 256 x 256 px | one row
boss_defeated.png | Defeated | for: beaten | 8 frames | 10 fps | plays once | cell 256 x 256 px | one row

Effects (4 sheets, 19 frames)
fx_pop.png | Pop splash | for: every bubble pop, and every chain of pops | 6 frames | 20 fps | plays once | cell 128 x 128 px | one row
fx_escape.png | Angry burst | for: a critter breaking out of its bubble | 5 frames | 20 fps | plays once | cell 128 x 128 px | one row
fx_dust.png | Landing dust | for: the hero landing | 4 frames | 16 fps | plays once | cell 128 x 128 px | one row
fx_glint.png | Treasure glint | for: a sparkle that plays over every treasure | 4 frames | 8 fps | loops | cell 64 x 64 px | one row


START PASTE 1

You are making animation sheets for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds, then pops the bubbles to collect treasures. I will cut every frame out of your sheets and play them in the game, so every sheet must follow these rules exactly. These sheets are the hero.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts.

RULES FOR EVERY SHEET

1. A wide landscape image, 3 wide by 2 tall, holding ONE animation: its frames side by side in ONE row, left to right in playing order, each frame in an equal width cell.
2. The character is drawn at exactly the same size in every frame, its feet (or its lowest point) resting on the same invisible line in every frame, centred in its own cell, whole and never cropped, with clear empty space between frames. Nothing crosses from one cell into the next.
3. Seen from the side, facing right, unless the sheet says otherwise.
4. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground, no cell borders, no grid lines.
5. No text, no letters, no numbers, no frame numbers, no logos anywhere.
6. Smooth motion: each frame is a small step on from the frame before. When a sheet says it loops, its last frame leads straight back into its first.
7. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that still read when the character is shown the size of a fingernail.

HOW TO WORK

Make the sheets one at a time, in order, each as its own image. Before each image write one short line: Sheet N: its name. If you have to stop, stop after a finished sheet; when I say continue, carry on with the next one. After sheet 11, list any sheet where the character drifted from the reference or broke a rule so I can ask for a redo. Then, if you are able to, give me one zip file of all 11 images, each named exactly as its sheet name with .png on the end (for example hero_idle.png); if you cannot make a zip, just say so.

THE 11 SHEETS

Sheet 1, hero_idle, Idle, 6 frames: standing still on the ground, breathing gently, the body rising and settling a little, any loose parts (antenna, ears, hair, cloth) bobbing softly. It loops.

Sheet 2, hero_run, Run, 8 frames: a full running cycle, each leg taking one full stride, a light bounce in the body. It loops.

Sheet 3, hero_jump, Jump, 4 frames: crouch, push off, rising with the body stretched upward, then the top of the jump.

Sheet 4, hero_fall, Fall, 4 frames: falling, the body slightly stretched, legs dangling, loose parts trailing upward. It loops.

Sheet 5, hero_land, Land, 3 frames: touching down, a squash on impact, springing back to standing.

Sheet 6, hero_blow, Blow a bubble, 6 frames: breathes in, puffs up, blows forward hard, recovers. Do not draw the bubble, the game draws it.

Sheet 7, hero_turn, Turn, 3 frames: turning around: facing right, then facing the viewer, then facing left.

Sheet 8, hero_hurt, Hurt, 4 frames: bumped hard, knocked back, eyes squeezed shut, a dizzy wobble. Funny, nothing painful looking.

Sheet 9, hero_die, Out of lives, 8 frames: bumped, spins around, goes dizzy and sinks down, ending lying still with eyes closed. Gentle and funny, nothing gory.

Sheet 10, hero_respawn, Respawn, 6 frames: appears out of a swirl of sparkles, lands lightly, ready to go.

Sheet 11, hero_cheer, Room cleared, 8 frames: a happy little victory dance, jumping for joy and landing. It loops.

END PASTE 1


START PASTE 2

You are making 5 character design pictures for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds. These are the five critters, one for each world. I will choose from them and then use each one as the reference for its animations.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. The critters must look like they belong in the same game: the same rendering, outline and shading as my reference pictures, and smaller and simpler than the hero.

RULES FOR EVERY PICTURE

1. A wide landscape image, 3 wide by 2 tall, showing ONE critter twice, side by side: on the left seen from the side facing right, on the right seen from the front.
2. Both views the same size, standing on the same invisible line, whole and never cropped, with clear empty space between them.
3. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground.
4. No text, no letters, no numbers, no logos anywhere.
5. Each critter has one big clear silhouette that still reads when it is shown the size of a fingernail, and looks cute and cheeky rather than scary.
6. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.

HOW TO WORK

Make the pictures one at a time, in order, each as its own image. Before each image write one short line: Picture N: its name. After picture 5, give me one zip file of all 5 images, each named exactly as its picture name with .png on the end; if you cannot make a zip, just say so.

THE 5 PICTURES

Picture 1, critter_design_hopper, the Hopper of Moss Moon: a round lime green blob with big springy back legs, wide eyes and a cheeky grin, a little like a jelly frog. Main colour lime green (9BE86F).

Picture 2, critter_design_skitter, the Skitter of Crystal Caverns: a small lilac mite with six quick little legs and a back of shiny crystal points. Main colour lilac (C39BFF).

Picture 3, critter_design_drone, the Drone of Rust Belt: a small orange flying robot bug with a round riveted body, two buzzing propeller wings, one bolt for an antenna and one big glowing eye. Main colour orange (FFB066).

Picture 4, critter_design_slick, the Slick of Frost Ring: a smooth ice blue slippery blob, a little like a baby seal, with flippers and a glossy frosted body. Main colour ice blue (9FD8FF).

Picture 5, critter_design_cinder, the Cinder of Magma Core: a round coal black body with glowing coral cracks, a little flame tuft on top and stubby legs. Main colour coral (FF8A66).

END PASTE 2


START PASTE 3

You are making animation sheets for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds, then pops the bubbles to collect treasures. I will cut every frame out of your sheets and play them in the game, so every sheet must follow these rules exactly. These sheets are the Hopper, the critter of Moss Moon.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. I have also attached the design picture of the Hopper that I chose. The Hopper in every sheet must match that design picture exactly: a round lime green blob with big springy back legs, wide eyes and a cheeky grin, a little like a jelly frog, main colour lime green (9BE86F).

RULES FOR EVERY SHEET

1. A wide landscape image, 3 wide by 2 tall, holding ONE animation: its frames side by side in ONE row, left to right in playing order, each frame in an equal width cell.
2. The character is drawn at exactly the same size in every frame, its feet (or its lowest point) resting on the same invisible line in every frame, centred in its own cell, whole and never cropped, with clear empty space between frames. Nothing crosses from one cell into the next.
3. Seen from the side, facing right, unless the sheet says otherwise.
4. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground, no cell borders, no grid lines.
5. No text, no letters, no numbers, no frame numbers, no logos anywhere.
6. Smooth motion: each frame is a small step on from the frame before. When a sheet says it loops, its last frame leads straight back into its first.
7. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that still read when the character is shown the size of a fingernail.

HOW TO WORK

Make the sheets one at a time, in order, each as its own image. Before each image write one short line: Sheet N: its name. If you have to stop, stop after a finished sheet; when I say continue, carry on with the next one. After sheet 9, list any sheet where the character drifted from the reference or broke a rule so I can ask for a redo. Then, if you are able to, give me one zip file of all 9 images, each named exactly as its sheet name with .png on the end (for example hopper_walk.png); if you cannot make a zip, just say so.

THE 9 SHEETS

Sheet 1, hopper_walk, Walk, 6 frames: a bouncy little waddle cycle. It loops.

Sheet 2, hopper_hop, Hop, 6 frames: crouch, spring up with legs stretched behind, high in the air, tuck, land with a squash.

Sheet 3, hopper_angry_walk, Angry walk, 6 frames: the same waddle but furious and faster, frowning, puffed up. It loops.

Sheet 4, hopper_fall, Fall, 2 frames: dropping through the air, legs up, surprised. It loops.

Sheet 5, hopper_turn, Turn, 3 frames: turning around: facing right, then facing the viewer, then facing left.

Sheet 6, hopper_trapped, Trapped, 6 frames: curled up asleep, eyes shut, gently bobbing and breathing, as if floating inside a bubble. Do not draw the bubble. It loops.

Sheet 7, hopper_struggle, Struggling, 4 frames: still curled up but waking, wriggling and pushing outward, cross face, about to break free. Do not draw the bubble. It loops.

Sheet 8, hopper_escape, Breaking out, 5 frames: bursts out of its curl, uncurls fast and lands ready, furious.

Sheet 9, hopper_popped, Popped, 6 frames: startled, spins, shrinks into a puff of sparkles in its own colour, and is gone by the last frame, which is only a few fading sparkles.

END PASTE 3


START PASTE 4

You are making animation sheets for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds, then pops the bubbles to collect treasures. I will cut every frame out of your sheets and play them in the game, so every sheet must follow these rules exactly. These sheets are the Skitter, the critter of Crystal Caverns.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. I have also attached the design picture of the Skitter that I chose. The Skitter in every sheet must match that design picture exactly: a small lilac mite with six quick little legs and a back of shiny crystal points, main colour lilac (C39BFF).

RULES FOR EVERY SHEET

1. A wide landscape image, 3 wide by 2 tall, holding ONE animation: its frames side by side in ONE row, left to right in playing order, each frame in an equal width cell.
2. The character is drawn at exactly the same size in every frame, its feet (or its lowest point) resting on the same invisible line in every frame, centred in its own cell, whole and never cropped, with clear empty space between frames. Nothing crosses from one cell into the next.
3. Seen from the side, facing right, unless the sheet says otherwise.
4. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground, no cell borders, no grid lines.
5. No text, no letters, no numbers, no frame numbers, no logos anywhere.
6. Smooth motion: each frame is a small step on from the frame before. When a sheet says it loops, its last frame leads straight back into its first.
7. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that still read when the character is shown the size of a fingernail.

HOW TO WORK

Make the sheets one at a time, in order, each as its own image. Before each image write one short line: Sheet N: its name. If you have to stop, stop after a finished sheet; when I say continue, carry on with the next one. After sheet 9, list any sheet where the character drifted from the reference or broke a rule so I can ask for a redo. Then, if you are able to, give me one zip file of all 9 images, each named exactly as its sheet name with .png on the end (for example skitter_run.png); if you cannot make a zip, just say so.

THE 9 SHEETS

Sheet 1, skitter_run, Scuttle, 6 frames: a fast six legged scuttle cycle. It loops.

Sheet 2, skitter_drop, Drop through, 4 frames: lets go of the floor, flips its legs up and drops straight down.

Sheet 3, skitter_angry_run, Angry scuttle, 6 frames: the same scuttle but furious and faster, crystals bristling. It loops.

Sheet 4, skitter_fall, Fall, 2 frames: dropping through the air, legs waving, surprised. It loops.

Sheet 5, skitter_turn, Turn, 3 frames: turning around: facing right, then facing the viewer, then facing left.

Sheet 6, skitter_trapped, Trapped, 6 frames: curled up asleep, eyes shut, gently bobbing and breathing, as if floating inside a bubble. Do not draw the bubble. It loops.

Sheet 7, skitter_struggle, Struggling, 4 frames: still curled up but waking, wriggling and pushing outward, cross face, about to break free. Do not draw the bubble. It loops.

Sheet 8, skitter_escape, Breaking out, 5 frames: bursts out of its curl, uncurls fast and lands ready, furious.

Sheet 9, skitter_popped, Popped, 6 frames: startled, spins, shrinks into a puff of sparkles in its own colour, and is gone by the last frame, which is only a few fading sparkles.

END PASTE 4


START PASTE 5

You are making animation sheets for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds, then pops the bubbles to collect treasures. I will cut every frame out of your sheets and play them in the game, so every sheet must follow these rules exactly. These sheets are the Drone, the critter of Rust Belt.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. I have also attached the design picture of the Drone that I chose. The Drone in every sheet must match that design picture exactly: a small orange flying robot bug with a round riveted body, two buzzing propeller wings, one bolt for an antenna and one big glowing eye, main colour orange (FFB066).

RULES FOR EVERY SHEET

1. A wide landscape image, 3 wide by 2 tall, holding ONE animation: its frames side by side in ONE row, left to right in playing order, each frame in an equal width cell.
2. The character is drawn at exactly the same size in every frame, its feet (or its lowest point) resting on the same invisible line in every frame, centred in its own cell, whole and never cropped, with clear empty space between frames. Nothing crosses from one cell into the next.
3. Seen from the side, facing right, unless the sheet says otherwise.
4. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground, no cell borders, no grid lines.
5. No text, no letters, no numbers, no frame numbers, no logos anywhere.
6. Smooth motion: each frame is a small step on from the frame before. When a sheet says it loops, its last frame leads straight back into its first.
7. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that still read when the character is shown the size of a fingernail.

HOW TO WORK

Make the sheets one at a time, in order, each as its own image. Before each image write one short line: Sheet N: its name. If you have to stop, stop after a finished sheet; when I say continue, carry on with the next one. After sheet 7, list any sheet where the character drifted from the reference or broke a rule so I can ask for a redo. Then, if you are able to, give me one zip file of all 7 images, each named exactly as its sheet name with .png on the end (for example drone_fly.png); if you cannot make a zip, just say so.

THE 7 SHEETS

Sheet 1, drone_fly, Fly, 4 frames: hovering forward with a little bob, the propeller wings in four different spin positions. It loops.

Sheet 2, drone_bounce, Bump and turn, 4 frames: bonks into a wall, wobbles, spins around to face left.

Sheet 3, drone_angry_fly, Angry fly, 4 frames: the same flight but furious and faster, eye narrowed red, sparks. It loops.

Sheet 4, drone_trapped, Trapped, 6 frames: curled up asleep, eyes shut, gently bobbing and breathing, as if floating inside a bubble. Do not draw the bubble. It loops.

Sheet 5, drone_struggle, Struggling, 4 frames: still curled up but waking, wriggling and pushing outward, cross face, about to break free. Do not draw the bubble. It loops.

Sheet 6, drone_escape, Breaking out, 5 frames: bursts out of its curl, uncurls fast and lands ready, furious.

Sheet 7, drone_popped, Popped, 6 frames: startled, spins, shrinks into a puff of sparkles in its own colour, and is gone by the last frame, which is only a few fading sparkles.

END PASTE 5


START PASTE 6

You are making animation sheets for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds, then pops the bubbles to collect treasures. I will cut every frame out of your sheets and play them in the game, so every sheet must follow these rules exactly. These sheets are the Slick, the critter of Frost Ring.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. I have also attached the design picture of the Slick that I chose. The Slick in every sheet must match that design picture exactly: a smooth ice blue slippery blob, a little like a baby seal, with flippers and a glossy frosted body, main colour ice blue (9FD8FF).

RULES FOR EVERY SHEET

1. A wide landscape image, 3 wide by 2 tall, holding ONE animation: its frames side by side in ONE row, left to right in playing order, each frame in an equal width cell.
2. The character is drawn at exactly the same size in every frame, its feet (or its lowest point) resting on the same invisible line in every frame, centred in its own cell, whole and never cropped, with clear empty space between frames. Nothing crosses from one cell into the next.
3. Seen from the side, facing right, unless the sheet says otherwise.
4. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground, no cell borders, no grid lines.
5. No text, no letters, no numbers, no frame numbers, no logos anywhere.
6. Smooth motion: each frame is a small step on from the frame before. When a sheet says it loops, its last frame leads straight back into its first.
7. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that still read when the character is shown the size of a fingernail.

HOW TO WORK

Make the sheets one at a time, in order, each as its own image. Before each image write one short line: Sheet N: its name. If you have to stop, stop after a finished sheet; when I say continue, carry on with the next one. After sheet 9, list any sheet where the character drifted from the reference or broke a rule so I can ask for a redo. Then, if you are able to, give me one zip file of all 9 images, each named exactly as its sheet name with .png on the end (for example slick_slide.png); if you cannot make a zip, just say so.

THE 9 SHEETS

Sheet 1, slick_slide, Slide, 6 frames: shuffling forward on its belly and flippers. It loops.

Sheet 2, slick_dash, Dash, 4 frames: stretched long, zooming forward on its belly with a spray of snow behind. It loops.

Sheet 3, slick_angry_slide, Angry slide, 6 frames: the same slide but furious and faster, eyes narrowed. It loops.

Sheet 4, slick_fall, Fall, 2 frames: dropping through the air, flippers up, surprised. It loops.

Sheet 5, slick_turn, Turn, 3 frames: turning around: facing right, then facing the viewer, then facing left.

Sheet 6, slick_trapped, Trapped, 6 frames: curled up asleep, eyes shut, gently bobbing and breathing, as if floating inside a bubble. Do not draw the bubble. It loops.

Sheet 7, slick_struggle, Struggling, 4 frames: still curled up but waking, wriggling and pushing outward, cross face, about to break free. Do not draw the bubble. It loops.

Sheet 8, slick_escape, Breaking out, 5 frames: bursts out of its curl, uncurls fast and lands ready, furious.

Sheet 9, slick_popped, Popped, 6 frames: startled, spins, shrinks into a puff of sparkles in its own colour, and is gone by the last frame, which is only a few fading sparkles.

END PASTE 6


START PASTE 7

You are making animation sheets for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds, then pops the bubbles to collect treasures. I will cut every frame out of your sheets and play them in the game, so every sheet must follow these rules exactly. These sheets are the Cinder, the critter of Magma Core.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. I have also attached the design picture of the Cinder that I chose. The Cinder in every sheet must match that design picture exactly: a round coal black body with glowing coral cracks, a little flame tuft on top and stubby legs, main colour coral (FF8A66).

RULES FOR EVERY SHEET

1. A wide landscape image, 3 wide by 2 tall, holding ONE animation: its frames side by side in ONE row, left to right in playing order, each frame in an equal width cell.
2. The character is drawn at exactly the same size in every frame, its feet (or its lowest point) resting on the same invisible line in every frame, centred in its own cell, whole and never cropped, with clear empty space between frames. Nothing crosses from one cell into the next.
3. Seen from the side, facing right, unless the sheet says otherwise.
4. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground, no cell borders, no grid lines.
5. No text, no letters, no numbers, no frame numbers, no logos anywhere.
6. Smooth motion: each frame is a small step on from the frame before. When a sheet says it loops, its last frame leads straight back into its first.
7. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that still read when the character is shown the size of a fingernail.

HOW TO WORK

Make the sheets one at a time, in order, each as its own image. Before each image write one short line: Sheet N: its name. If you have to stop, stop after a finished sheet; when I say continue, carry on with the next one. After sheet 9, list any sheet where the character drifted from the reference or broke a rule so I can ask for a redo. Then, if you are able to, give me one zip file of all 9 images, each named exactly as its sheet name with .png on the end (for example cinder_walk.png); if you cannot make a zip, just say so.

THE 9 SHEETS

Sheet 1, cinder_walk, Stalk, 6 frames: a determined stomping walk, the flame tuft flickering. It loops.

Sheet 2, cinder_leap, Leap, 6 frames: crouch, pounce high and forward with flames streaming, land.

Sheet 3, cinder_angry_walk, Angry stalk, 6 frames: the same stomp but furious and faster, flames flaring. It loops.

Sheet 4, cinder_fall, Fall, 2 frames: dropping through the air, flames streaming upward, surprised. It loops.

Sheet 5, cinder_turn, Turn, 3 frames: turning around: facing right, then facing the viewer, then facing left.

Sheet 6, cinder_trapped, Trapped, 6 frames: curled up asleep, eyes shut, gently bobbing and breathing, as if floating inside a bubble. Do not draw the bubble. It loops.

Sheet 7, cinder_struggle, Struggling, 4 frames: still curled up but waking, wriggling and pushing outward, cross face, about to break free. Do not draw the bubble. It loops.

Sheet 8, cinder_escape, Breaking out, 5 frames: bursts out of its curl, uncurls fast and lands ready, furious.

Sheet 9, cinder_popped, Popped, 6 frames: startled, spins, shrinks into a puff of sparkles in its own colour, and is gone by the last frame, which is only a few fading sparkles.

END PASTE 7


START PASTE 8

You are making animation sheets for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds, then pops the bubbles to collect treasures. I will cut every frame out of your sheets and play them in the game, so every sheet must follow these rules exactly. These sheets are the antagonist, the villain of the game. It is bigger than the hero.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. In these sheets the antagonist is the subject. Sheet 7 shows only the thing it throws or fires, drawn small.

RULES FOR EVERY SHEET

1. A wide landscape image, 3 wide by 2 tall, holding ONE animation: its frames side by side in ONE row, left to right in playing order, each frame in an equal width cell.
2. The character is drawn at exactly the same size in every frame, its feet (or its lowest point) resting on the same invisible line in every frame, centred in its own cell, whole and never cropped, with clear empty space between frames. Nothing crosses from one cell into the next.
3. Seen from the side, facing right, unless the sheet says otherwise.
4. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground, no cell borders, no grid lines.
5. No text, no letters, no numbers, no frame numbers, no logos anywhere.
6. Smooth motion: each frame is a small step on from the frame before. When a sheet says it loops, its last frame leads straight back into its first.
7. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that still read when the character is shown the size of a fingernail.

HOW TO WORK

Make the sheets one at a time, in order, each as its own image. Before each image write one short line: Sheet N: its name. If you have to stop, stop after a finished sheet; when I say continue, carry on with the next one. After sheet 11, list any sheet where the character drifted from the reference or broke a rule so I can ask for a redo. Then, if you are able to, give me one zip file of all 11 images, each named exactly as its sheet name with .png on the end (for example boss_intro.png); if you cannot make a zip, just say so.

THE 11 SHEETS

Sheet 1, boss_intro, Entrance, 8 frames: arrives in a dramatic way that fits its design (drops from above, rises from the ground or steps out of a portal), ending in its idle pose.

Sheet 2, boss_idle, Idle, 6 frames: standing tall and menacing, breathing, small restless movements. It loops.

Sheet 3, boss_move, Move, 8 frames: its walk, float or crawl cycle, heavy and confident. It loops.

Sheet 4, boss_taunt, Taunt, 6 frames: mocks the player with a laugh or a rude little gesture.

Sheet 5, boss_windup, Wind up, 4 frames: gathers itself for an attack, a big clear warning pose that is easy to read.

Sheet 6, boss_attack, Attack, 6 frames: unleashes its attack: a throw, a stomp or a blast, whatever fits its design.

Sheet 7, boss_shot, Its projectile, 4 frames: the thing it throws or fires, alone, small and round enough to dodge, spinning or flickering. It loops.

Sheet 8, boss_hit, Hit, 4 frames: a bubble bursts against it, it flinches and shakes it off.

Sheet 9, boss_trapped, Trapped, 6 frames: caught inside a giant bubble, pressing against it, furious. Do not draw the bubble. It loops.

Sheet 10, boss_escape, Breaking out, 6 frames: bursts free with a roar and lands ready.

Sheet 11, boss_defeated, Defeated, 8 frames: dizzy, spins, shrinks or deflates, and flees or bursts into sparkles. Funny, nothing gory.

END PASTE 8


START PASTE 9

You are making animation sheets for a phone game called Bubblenaut. A little alien, the Bubblenaut, blows bubbles to trap runaway critters across five alien worlds, then pops the bubbles to collect treasures. I will cut every frame out of your sheets and play them in the game, so every sheet must follow these rules exactly. These sheets are small effects, drawn in the same rendering as my reference pictures.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. There are no characters in these sheets, only effects that match the look of the reference pictures.

RULES FOR EVERY SHEET

1. A wide landscape image, 3 wide by 2 tall, holding ONE animation: its frames side by side in ONE row, left to right in playing order, each frame in an equal width cell.
2. The character is drawn at exactly the same size in every frame, its feet (or its lowest point) resting on the same invisible line in every frame, centred in its own cell, whole and never cropped, with clear empty space between frames. Nothing crosses from one cell into the next.
3. Seen from the side, facing right, unless the sheet says otherwise.
4. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no scenery, no shadow on the ground, no cell borders, no grid lines.
5. No text, no letters, no numbers, no frame numbers, no logos anywhere.
6. Smooth motion: each frame is a small step on from the frame before. When a sheet says it loops, its last frame leads straight back into its first.
7. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that still read when the character is shown the size of a fingernail.

HOW TO WORK

Make the sheets one at a time, in order, each as its own image. Before each image write one short line: Sheet N: its name. If you have to stop, stop after a finished sheet; when I say continue, carry on with the next one. After sheet 4, list any sheet where the character drifted from the reference or broke a rule so I can ask for a redo. Then, if you are able to, give me one zip file of all 4 images, each named exactly as its sheet name with .png on the end (for example fx_pop.png); if you cannot make a zip, just say so.

THE 4 SHEETS

Sheet 1, fx_pop, Pop splash, 6 frames: a bubble bursting: a ring of droplets and sparkles flying outward and fading to nothing.

Sheet 2, fx_escape, Angry burst, 5 frames: an angry red burst: sharp red and orange shards flying outward and fading.

Sheet 3, fx_dust, Landing dust, 4 frames: a small puff of dust spreading out low and fading.

Sheet 4, fx_glint, Treasure glint, 4 frames: a small four point twinkle growing, flashing and shrinking. It loops.

END PASTE 9


START PASTE 10

You are making 7 pictures for a phone game called Bubblenaut, a platform game across five alien worlds. These are the pieces the rooms are built from, the treasures and a few icons. I will cut each object out of your pictures and use it at a small size, so every picture must follow these rules exactly.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. There are no characters in these pictures except the life icon; everything must match the look of the reference pictures.

RULES FOR EVERY PICTURE

1. A square image.
2. Every picture is a two by two grid of four separate objects, each alone and centred in its own quarter, with wide empty space around each one, nothing touching and nothing crossing the middle of the picture.
3. Background: transparent if you can make it, otherwise plain flat mid grey everywhere. No floor, no shadow on the ground, no scene, no grid lines drawn.
4. Every object whole and not cropped, seen from the front and a little above.
5. No text, no letters, no numbers, no logos anywhere.
6. The faces of the ledges and blocks must be plain enough to repeat side by side without a visible seam.
7. Nothing may look like a famous character, a brand, a real product design, a national flag or a religious symbol.
8. Style: match the attached reference pictures exactly, with clean edges that read at a small size.

HOW TO WORK

Make the pictures one at a time, in order, each as its own image. Before each image write one short line: Picture N: its name. After picture 7, list any picture you think broke a rule. Then, if you are able to, give me one zip file of all 7 images, each named exactly as its picture name with .png on the end; if you cannot make a zip, just say so.

THE 7 PICTURES

Picture 1, pieces_treasures_a, four treasures. Top left: the Sunfruit, a round golden fruit (FFD166) with one small leaf and a warm glow. Top right: the Geode, a rock cracked open to show glowing cyan crystals inside (8BE8FF). Bottom left: the Star Cog, an ivory cog wheel (E8E2D0) with a star shape cut through its middle. Bottom right: the Frost Pearl, a pale icy pearl (E8F6FF) with a frosty swirl on its surface.

Picture 2, pieces_treasures_b, the last treasure and three icons. Top left: the Ember Opal, a warm opal stone (FFCF8A) with flecks of fire inside it. Top right: a bubble shine, a thin glossy curved highlight like the reflection on a soap bubble, white. Bottom left: the hero's head only, from my reference picture, facing the front and smiling, used as a life icon. Bottom right: a small glass specimen jar with a soft glow inside and a screw lid, used as the collection icon.

Picture 3, pieces_moss_moon, Moss Moon building blocks. Top left: a floating ledge, much wider than it is tall, with a flat walkable top, made of dark green rock (3FAE72) with pale glowing moss along its top lip. Top right: a solid square wall block of dark wet rock (1D5C3C). Bottom left: the same square block with pale glowing moss growing over its top surface. Bottom right: a small cluster of glowing spore puffs (6FE8A8) that sits on top of a block.

Picture 4, pieces_crystal_caverns, Crystal Caverns building blocks. Top left: a floating ledge, much wider than it is tall, with a flat walkable top, made of violet stone (7A5FD0) with small crystal points along its underside. Top right: a solid square wall block of deep violet stone (43318A). Bottom left: the same square block with a crust of tiny crystals over its top surface. Bottom right: a small glowing crystal cluster (A98BFF) that sits on top of a block.

Picture 5, pieces_rust_belt, Rust Belt building blocks. Top left: a floating ledge, much wider than it is tall, with a flat walkable top, made of riveted rusty metal (B06A34) with a thin orange glow strip along its edge. Top right: a solid square wall block of dark rusted iron plate (6E3F1C) with rivets. Bottom left: the same square block with a worn hazard stripe across its top surface. Bottom right: a small bent pipe with a puff of steam that sits on top of a block.

Picture 6, pieces_frost_ring, Frost Ring building blocks. Top left: a floating ledge, much wider than it is tall, with a flat walkable top, made of blue ice (5AA8D8) with small icicles hanging under it. Top right: a solid square wall block of deep blue ice (2C5F86). Bottom left: the same square block with a cap of fresh snow on its top surface. Bottom right: a small ice spike that sits on top of a block.

Picture 7, pieces_magma_core, Magma Core building blocks. Top left: a floating ledge, much wider than it is tall, with a flat walkable top, made of black basalt with a glowing lava seam (D05A3A) along its edge. Top right: a solid square wall block of dark red basalt (84301C) with faint glowing cracks. Bottom left: the same square block with a crust of cooling lava over its top surface. Bottom right: a small lava vent with an orange (FF8A5E) glow that sits on top of a block.

END PASTE 10


START PASTE 11

You are making 5 background pictures for a phone game called Bubblenaut, one for each of its five alien worlds. Every room of a world sits on its world's background, so every picture must follow these rules exactly.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. The characters are not in these pictures; use the reference only for the look.

RULES FOR EVERY PICTURE

1. A tall portrait image, 2 wide by 3 tall.
2. The back wall of one room in a platform game, seen straight on from the front, flat like a stage backdrop. The game draws its own walls, platforms, characters, score and buttons on top of it.
3. The top tenth of the picture is plain and dark, because the score sits there. The bottom fifth is plain and dark, because the control buttons cover it. The outer tenth on the left and right is plain, because it is trimmed away.
4. Everything in between is evenly detailed, dark and low in contrast, with no bright spots. Nothing in it may look like a ledge, a shelf, a platform, a step, a creature or an item, and no long horizontal lines, so players never mistake the background for something they can stand on or catch.
5. No characters, no creatures, no text, no letters, no numbers, no logos anywhere.
6. Nothing may look like a brand, a real product design, a national flag or a religious symbol.
7. Style: the same rendering as the attached reference pictures, but softer, darker and slightly out of focus, so the characters always stand out in front of it.

HOW TO WORK

Make the pictures one at a time, in order, each as its own image. Before each image write one short line: Picture N: its name. If you have to stop, stop after a finished picture; when I say continue, carry on with the next one. After picture 5, list any picture you think broke a rule. Then, if you are able to, give me one zip file of all 5 images, each named exactly as its picture name with .png on the end; if you cannot make a zip, just say so.

THE 5 PICTURES

Picture 1, bg_moss_moon, the Moss Moon background: a mossy cavern inside a small green moon. Wet dark rock with clumps of pale lichen catching a cool green rim light, a few drips, a faint haze of glowing spores, a glimpse of a pale green moon through a crack near the top corner. Colours from 0A1A12 to 07130C, nothing brighter than the moss.

Picture 2, bg_crystal_caverns, the Crystal Caverns background: a violet cave lined with giant crystals around the edges, faint cyan glints deep inside them. Colours from 140F2A to 0B081C.

Picture 3, bg_rust_belt, the Rust Belt background: the inside of an abandoned scrap station drifting in space, rusted girders and pipes around the edges, a few dim orange warning lights, stars through a broken window high in one corner. Colours from 1D130A to 120B06.

Picture 4, bg_frost_ring, the Frost Ring background: an ice cave inside a ring of frozen rocks around a planet, blue ice walls at the edges with starlight glowing through them, frost on everything. Colours from 0A1522 to 061019.

Picture 5, bg_magma_core, the Magma Core background: a cavern near the hot core of a planet, black basalt walls at the edges, a distant red lava glow only along the bottom corners, a few floating embers. Colours from 1E0B0B to 140606.

END PASTE 11


START PASTE 12

You are making 3 pictures for a phone game called Bubblenaut: the title screen art, the store banner and the app icon. Follow the rules for each picture exactly.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. The hero in these pictures must be exactly my hero.

RULES FOR EVERY PICTURE

1. Each picture says its own shape: tall portrait 2 wide by 3 tall, wide landscape 3 wide by 2 tall, or square.
2. No text, no letters, no numbers, no logos anywhere.
3. Nothing may look like a famous character, a character from any existing video game, a brand, a national flag or a religious symbol.
4. Style: match the attached reference pictures exactly.

HOW TO WORK

Make the pictures one at a time, in order, each as its own image. Before each image write one short line: Picture N: its name. After picture 3, list any picture you think broke a rule. Then, if you are able to, give me one zip file of all 3 images, each named exactly as its picture name with .png on the end; if you cannot make a zip, just say so.

THE 3 PICTURES

Picture 1, title_art, tall portrait: my hero standing proudly on a floating ledge, blowing one big glossy bubble with a sleepy little critter curled up inside it. Behind, five small glowing planets in a curve across deep navy space (070B16): one green, one violet, one rusty orange, one icy blue, one red. Keep the top quarter calm, dark space, because the game's name goes there, and keep the bottom 45 percent dark and calm, because the buttons sit there. The hero and the bubble sit in the middle band.

Picture 2, store_banner, wide landscape: my hero leaping between floating ledges in a glowing cave, chasing three critters trapped in bubbles, a golden fruit and a glowing gem tumbling out of a popped bubble. Bright and lively against a dark cave. Keep the left third calmer and darker, because the game's name is placed there later. Keep everything important away from the top eighth and the bottom eighth, which may be trimmed.

Picture 3, app_icon, square: my hero's smiling face inside one big glossy bubble, centred, filling the middle two thirds of the picture, on a plain deep navy background (070B16) with a soft glow. It must read clearly when shown very small.

END PASTE 12

(If the antagonist is the one behind the critters, you can add this line to the end of Picture 1 before you paste: Far behind the planets, the antagonist looms large and shadowy, watching.)


START PASTE 13 (OPTIONAL)

You are making 20 background pictures for a phone game called Bubblenaut. Its five alien worlds have five rooms each; these are rooms 2 to 5 of every world, each a variation on its world's main background. If you have to send this in parts, send the rules with one world's four pictures at a time.

I have attached my reference pictures of our hero, the Bubblenaut, and our antagonist. They are the reference for everything you draw: match them exactly, the same proportions, colours, outline, shading and rendering. Do not redesign them, do not add or remove parts. The characters are not in these pictures; use the reference only for the look.

RULES FOR EVERY PICTURE

1. A tall portrait image, 2 wide by 3 tall.
2. The back wall of one room in a platform game, seen straight on from the front, flat like a stage backdrop. The game draws its own walls, platforms, characters, score and buttons on top of it.
3. The top tenth of the picture is plain and dark, because the score sits there. The bottom fifth is plain and dark, because the control buttons cover it. The outer tenth on the left and right is plain, because it is trimmed away.
4. Everything in between is evenly detailed, dark and low in contrast, with no bright spots. Nothing in it may look like a ledge, a shelf, a platform, a step, a creature or an item, and no long horizontal lines, so players never mistake the background for something they can stand on or catch.
5. No characters, no creatures, no text, no letters, no numbers, no logos anywhere.
6. Nothing may look like a brand, a real product design, a national flag or a religious symbol.
7. Style: the same rendering as the attached reference pictures, but softer, darker and slightly out of focus, so the characters always stand out in front of it.

HOW TO WORK

Make the pictures one at a time, in order, each as its own image. Before each image write one short line: Picture N: its name. If you have to stop, stop after a finished picture; when I say continue, carry on with the next one. After picture 20, list any picture you think broke a rule. Then, if you are able to, give me one zip file of all 20 images, each named exactly as its picture name with .png on the end; if you cannot make a zip, just say so.

THE 20 PICTURES

Picture 1, bg_moss_moon_steps, The Steps, a room in Moss Moon: the same world as Moss Moon background, the same cavern at its quietest, thin mist low down.

Picture 2, bg_moss_moon_floating_islands, Floating Islands, a room in Moss Moon: the same world as Moss Moon background, the moon outside brighter, its light falling through more cracks.

Picture 3, bg_moss_moon_twin_hills, Twin Hills, a room in Moss Moon: the same world as Moss Moon background, a slow storm of glowing spores drifting across.

Picture 4, bg_moss_moon_canopy, The Canopy, a room in Moss Moon: the same world as Moss Moon background, deep night, glowing roots hanging from above.

Picture 5, bg_crystal_caverns_twin_shafts, Twin Shafts, a room in Crystal Caverns: the same world as Crystal Caverns background, two deep shafts of darkness with crystals glinting far down.

Picture 6, bg_crystal_caverns_geode, The Geode, a room in Crystal Caverns: the same world as Crystal Caverns background, the walls curve like the inside of a cracked geode.

Picture 7, bg_crystal_caverns_crystal_spires, Crystal Spires, a room in Crystal Caverns: the same world as Crystal Caverns background, tall thin crystals rising along both sides.

Picture 8, bg_crystal_caverns_vault, The Vault, a room in Crystal Caverns: the same world as Crystal Caverns background, a deeper, darker chamber with one cold cyan glow far away.

Picture 9, bg_rust_belt_gantry, The Gantry, a room in Rust Belt: the same world as Rust Belt background, criss crossed girders far in the background, softly lit.

Picture 10, bg_rust_belt_chimney, The Chimney, a room in Rust Belt: the same world as Rust Belt background, a tall smoke stained shaft, embers drifting up.

Picture 11, bg_rust_belt_conveyor_ladders, Conveyor Ladders, a room in Rust Belt: the same world as Rust Belt background, rows of old machinery in shadow, one warning light blinking.

Picture 12, bg_rust_belt_foundry, The Foundry, a room in Rust Belt: the same world as Rust Belt background, a hotter room, a dull orange furnace glow low in one corner.

Picture 13, bg_frost_ring_ring, The Ring, a room in Frost Ring: the same world as Frost Ring background, the planet's ring visible as a pale arc through the ice.

Picture 14, bg_frost_ring_icicle_teeth, Icicle Teeth, a room in Frost Ring: the same world as Frost Ring background, rows of icicles along the top edge.

Picture 15, bg_frost_ring_broken_bridges, Broken Bridges, a room in Frost Ring: the same world as Frost Ring background, cracked ice walls with dark gaps between.

Picture 16, bg_frost_ring_frozen_throne, Frozen Throne, a room in Frost Ring: the same world as Frost Ring background, a grand frozen hall, faint blue light from far below.

Picture 17, bg_magma_core_diamond_lattice, Diamond Lattice, a room in Magma Core: the same world as Magma Core background, basalt columns in a diamond pattern, glowing seams.

Picture 18, bg_magma_core_crucible, The Crucible, a room in Magma Core: the same world as Magma Core background, a round chamber, heat shimmer, brighter embers.

Picture 19, bg_magma_core_gauntlet, The Gauntlet, a room in Magma Core: the same world as Magma Core background, a long narrow hall of black rock, lava glow on both sides.

Picture 20, bg_magma_core_core, The Core, a room in Magma Core: the same world as Magma Core background, the deepest chamber, a slow pulse of red light from below.

END PASTE 13 (OPTIONAL)


FOR THE BUILDER (Stephen can skip this part)

Read out of satellites/bubblenaut/index.html and LOOKED at on 20 Oct 2026 (412 x 915, the title, the rules gate, rooms 1 and 8).

The canvas: one 540 x 960 canvas (VW, VH) inside #stage, scaled to fit and letterboxed, never cropped (0.763 at 412 x 915, stage at y 91 to 823 in CSS px). HUD band y 0 to 90 (room, world, score, lives). The room: 15 x 19 tiles of 36 px (TILE, COLS, ROWS) from FY = 90, so y 90 to 774; the outer row and column of every map are solid walls, so the backdrop shows inside x 36 to 504, y 126 to 738. The four DOM pad buttons (left, right, jump, bubble) cover canvas y 798 to 950.

Animation is new build work, not new game rules: a sprite player keyed off the existing state. Hero: idle (ground, vx 0), run (ground, vx not 0, flip by face), jump (vy < 0, hold last frame), fall (vy > 0, not ground), land (ground after air), blow (shoot(), shootCd 0.42, bubble spawns on frame 4), turn (face flips), hurt (hurt path: lives--, G.flash), die (p.dead), respawn (respawn then the existing inv 2.2 s blink), cheer (G.phase 'clear', clearT 2.2). Player 2 = the same sprites recoloured (col #ff7ac8, dark #b04a8a) with a hue map, unless his design does not recolour.
Critters: brains in the critter update (world 0 hop vy -520 every 1.6 to 3.8 s; world 1 drop through at 0.2 percent per frame; world 2 sine lane flight, wall bounce; world 3 dashT 0.7 s at 2.2x; world 4 homes on the nearest player, pounce vy -540). turn on dir flip; fall when airborne (not drone); trapped while b.holds (bubble r 19, capY hover); struggle when holds.t > 5 (the code already reddens the bubble); escape in escapeBubble (holds.t > 7, angry true, 1.5x speed, red burst); popped in popBubble (spawns the treasure, chain within 64 px). The angry_* cycles replace the red tint, keep the glow.
Antagonist: no code exists. Roles a and b need a boss state machine, health in bubbles, an arena room, and its projectile; role c needs only a story beat (intro, idle, taunt, defeated) on world transitions.

Cells and shipping: Astra returns 1536 x 1024 strips. Cut each frame by connected component on the flat background, align to a common baseline and centre of mass, pad into equal cells: hero and critters 128 x 128 (they are 26 x 30 and 26 x 26 in play, about 4x), antagonist 256 x 256 (assume about two tiles tall until his design says otherwise), projectile, glint 64 x 64, effects 128 x 128. Pack each animation as a one row PNG strip, frames left to right. Flag any frame whose silhouette area or palette drifts from its neighbours by more than a set margin, and show Stephen those before wiring.
Pieces: cut the 2 x 2 grids with satellites/dewball/tools/forge/sheetcut.py. Ledges replace the 12 px platform bar ('=' drawn at y + 3 of its tile), so ship them 144 x 48 and make them seamless in post; blocks 144 x 144, seamless both ways; decorations sit on solid tops with open air above, placed by a seeded random per room. Treasures replace drawTreasure's tShape branches; the life icon replaces drawMiniAlien in the HUD; the bubble shine is laid over the code bubble.
Backgrounds: Astra returns 1024 x 1536. Trim 80 px off each side to 864 x 1536 (exactly 9:16, 1.6x the canvas) and draw it at 0,0,540,960 in place of the W.sky gradient and seedStars. Check that W.plat platforms and the critter colours still read on top; darken in code if not. Room variants (Paste 13) are keyed by level index; rooms without one fall back to the world background.
Title art behind #s-title (the BUBBLENAUT wordmark stays code text); store_banner cropped to the middle 1536 x 750 band, scaled to the 1024 x 500 feature graphic, wordmark set in code in the calm left third; app_icon is the source for icon-512, icon-192 and a maskable icon.
Masters go to the vault untouched; web copies under new names, never a side over 1600 px.

Counts: hero 11 sheets, 60 frames (+1 optional, 6); critters 43 sheets, 205 frames (Hopper 44, Skitter 42, Drone 33, Slick 42, Cinder 44) plus 5 design pictures; antagonist 11 sheets, 66 frames; effects 4 sheets, 19 frames; pieces 7 pictures; backgrounds 5 (+20 optional); title and store 3. Total 89 pictures, 350 animation frames, plus 21 optional pictures.
Open calls for Stephen: the antagonist's role (a, b or c); the name; whether Player 2 is a recolour; whether to make the 20 room backgrounds or vary rooms in code.
Laws: generated art is never called hand painted; check a showcase's AI art policy before submitting these anywhere.
