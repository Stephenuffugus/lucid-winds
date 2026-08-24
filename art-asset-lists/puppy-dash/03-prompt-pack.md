# PUPPY DASH — Sheet 3: THE PROMPT PACK (paste and go)

**Doc in the Drive Puppy Dash folder:** https://docs.google.com/document/d/16Ggx6wK4-dJqoBKO6JYD5ql3KZcSz6RK2SclIoLlfkc/edit

Written 2026-08-24 after the first two sheets failed you at the generator. This
one is the house format: every entry below is a COMPLETE prompt. Copy the line
after PROMPT:, paste it into Midjourney, done. Relax mode, batch of four, pick
the best, and when a puppy generation looks right GRAB ITS SEED (--seed NNNN
from the envelope) and add it to every later puppy prompt so the character
holds.

THE PIPELINE HAS CHANGED IN YOUR FAVOUR: everything generates on flat magenta,
loose, any framing. Do not fight for transparency, exact sizes, contact points
or sprite strips. The cutter (scripts/pd_cut.mjs) keys the magenta, splits
multi pose images automatically, scales, plants every frame on the rig and
builds the strips. You generate pictures; the machine does the rig.

THE WHOLE JOB AT A GLANCE: puppy CORE is 7 generations. Obstacles 6.
Collectibles 3. FX 5. Dog park environment 11. That is 32 generations for a
complete first art pass, before variations. The other three animals reuse the
same 7 state prompts with their character paragraph swapped in (paragraphs at
the bottom).


====================================================================
THE PUPPY, CORE 24 IN 7 GENERATIONS
====================================================================
Multi pose prompts on purpose: one image means one style, and the cutter splits the row into frames. If a row comes back with fused poses, re-run the same prompt; do not hand fix.

1. RUN A, poses 1 to 4
PROMPT: a small golden retriever puppy, warm golden coat the color of #d9a05b, darker floppy ears #b87a36, cream belly patch #f1d9ad, big round dark eyes, black button nose, thick stubby wagging tail, chunky toy proportions with a big head and short legs, no collar and no markings on its back, seen from behind at a three quarter rear angle running away from the viewer, back of the head and tail toward the camera, 4 poses of the exact same character side by side in a row with clear gaps between them: left front paw planted and body mid height with tail up; body at its lowest with legs compressed and ears low; legs crossing under the rising body; push off with the body at its highest and ears lifted, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 7:3

2. RUN B, poses 5 to 8
PROMPT: a small golden retriever puppy, warm golden coat the color of #d9a05b, darker floppy ears #b87a36, cream belly patch #f1d9ad, big round dark eyes, black button nose, thick stubby wagging tail, chunky toy proportions with a big head and short legs, no collar and no markings on its back, seen from behind at a three quarter rear angle running away from the viewer, back of the head and tail toward the camera, 4 poses of the exact same character side by side in a row with clear gaps between them: right front paw planted and body mid height; body at its lowest again; legs crossing under the body; push off at the highest point of the stride, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 7:3

3. JUMP A, poses 1 to 3
PROMPT: a small golden retriever puppy, warm golden coat the color of #d9a05b, darker floppy ears #b87a36, cream belly patch #f1d9ad, big round dark eyes, black button nose, thick stubby wagging tail, chunky toy proportions with a big head and short legs, no collar and no markings on its back, seen from behind at a three quarter rear angle running away from the viewer, back of the head and tail toward the camera, 3 poses of the exact same character side by side in a row with clear gaps between them: deep crouch with haunches loaded and ears back; launching upward with rear legs fully extended; stretched long in the air with legs starting to tuck, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9

4. JUMP B, poses 4 to 6
PROMPT: a small golden retriever puppy, warm golden coat the color of #d9a05b, darker floppy ears #b87a36, cream belly patch #f1d9ad, big round dark eyes, black button nose, thick stubby wagging tail, chunky toy proportions with a big head and short legs, no collar and no markings on its back, seen from behind at a three quarter rear angle running away from the viewer, back of the head and tail toward the camera, 3 poses of the exact same character side by side in a row with clear gaps between them: at the top of a jump, body compact and rounded with legs tucked under and ears up; falling with front paws reaching down; landing in a crouch with all four paws down, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9

5. SLIDE, 4 poses
PROMPT: a small golden retriever puppy, warm golden coat the color of #d9a05b, darker floppy ears #b87a36, cream belly patch #f1d9ad, big round dark eyes, black button nose, thick stubby wagging tail, chunky toy proportions with a big head and short legs, no collar and no markings on its back, seen from behind at a three quarter rear angle running away from the viewer, back of the head and tail toward the camera, 4 poses of the exact same character side by side in a row with clear gaps between them: front paws thrown forward with the chest dropping; fully flattened and stretched low with ears pinned back; holding the low slide with a slight forward lean; rising back up with front legs pushing, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 7:3

6. BANK LEFT, 3 poses
PROMPT: a small golden retriever puppy, warm golden coat the color of #d9a05b, darker floppy ears #b87a36, cream belly patch #f1d9ad, big round dark eyes, black button nose, thick stubby wagging tail, chunky toy proportions with a big head and short legs, no collar and no markings on its back, seen from behind at a three quarter rear angle running away from the viewer, back of the head and tail toward the camera, 3 poses of the exact same character side by side in a row with clear gaps between them: leaning left about twelve degrees with the tail swinging right; in a full lean with legs crossing toward the left; settling back level with the tail still trailing right, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9

7. CAUGHT, 3 poses
PROMPT: a small golden retriever puppy, warm golden coat the color of #d9a05b, darker floppy ears #b87a36, cream belly patch #f1d9ad, big round dark eyes, black button nose, thick stubby wagging tail, chunky toy proportions with a big head and short legs, no collar and no markings on its back, seen from the front at a three quarter angle, 3 poses of the exact same character side by side with clear gaps: startled with all four legs braced and ears straight up; tumbling in the air with legs splayed; sitting flat on its rump looking dazed with drooped ears, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9


====================================================================
OBSTACLES, 6
====================================================================
The colour rules are gameplay: only the hydrant is red, only the puddle is a dark patch, only the banner hangs. Do not let a prompt drift into another obstacle's colour.

1. Fire hydrant (JUMP, the only red thing in the game)
PROMPT: a squat cartoon fire hydrant, bright red #e04b3b with a rounded cap and two side nozzles, front three quarter view, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1

2. Traffic cone (JUMP)
PROMPT: a cartoon traffic cone, bright orange with one white reflective band, slightly scuffed, front three quarter view, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1

3. Garden wall (DODGE, spans the lane)
PROMPT: a low wide garden brick wall segment, warm tan bricks with a flat stone cap, wider than tall, front view, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1

4. Limbo banner (SLIDE, hangs across the lane)
PROMPT: a wide fabric banner hanging between two short wooden posts, striped warm yellow and orange, gently sagging in the middle, front view, wider than tall, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 7:3

5. Puddle (JUMP, flat on the road)
PROMPT: a flat cartoon water puddle seen at a low angle, dark blue reflective water with a soft wavy outline and one white shine streak, wider than tall, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 7:3

6. Trash can (DODGE, full lane width)
PROMPT: a round metal trash can with a dented lid slightly ajar and one banana peel sticking out, silver grey with warm shadows, front three quarter view, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1


====================================================================
COLLECTIBLES, 3
====================================================================
1. Biscuit and golden biscuit, one image
PROMPT: two dog bone biscuits side by side with a clear gap: the left one warm cream #f5e6c4 baked biscuit color, the right one identical but shining metallic gold with tiny sparkles, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 7:3

2. Magnet pickup
PROMPT: a classic cartoon horseshoe magnet, bright red with silver tips, small sparks of attraction drawn as short gold lines, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1

3. Rainbow jetpack pickup
PROMPT: a small cartoon jetpack made of a swirled rainbow soft serve shape with two tiny silver rocket nozzles, playful and absurd, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1


====================================================================
FX, 5 GENERATIONS FOR 9 SETS
====================================================================
Stages in a row left to right; the cutter splits them into animation frames.

1. Dust puffs and slide trail, one image
PROMPT: six small cartoon dust puffs in a row, warm grey, growing from a tight puff to a large dissolving cloud left to right, simple rounded shapes, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9

2. Landing ring and impact star, one image
PROMPT: three flat elliptical impact rings growing and fading left to right, warm tan; then three comic style impact star bursts growing left to right, warm gold, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9

3. Biscuit pop sparkle, 4 stages
PROMPT: four small gold sparkle bursts in a row growing then fading, simple cartoon four point stars, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9

4. Magnet ring pulse, 4 stages
PROMPT: four thin gold ellipse rings in a row, growing larger and fainter left to right, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9

5. Speed lines
PROMPT: three sets of thin horizontal cartoon speed streaks, warm cream, short medium and long, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9


====================================================================
DOG PARK ENVIRONMENT, 11
====================================================================
The three tiles must repeat left to right: if an edge does not match, re-roll rather than patch. Sky and tiles are NOT on magenta; they are full images.

1. Sky, dog park morning
PROMPT: a cheerful morning sky for a cartoon dog park game, pale blue gradient with a low warm sun and fat rounded cumulus clouds, flat cel shaded, saturated and friendly, no ground, no text --style raw --s 180 --ar 16:10

2. Far hills tile
PROMPT: a wide strip of soft rolling green hills on the horizon, flat cel shaded cartoon style, gentle overlapping rounded hill shapes in two greens, designed to repeat seamlessly left to right with matching edges, no sky no text --style raw --s 180 --ar 21:9  (crop the middle band after)

3. Mid treeline tile
PROMPT: a wide strip of cartoon oak and maple treetops in a row, flat cel shaded, two or three greens with rounded canopies, designed to repeat seamlessly left to right with matching edges, no sky, no text --style raw --s 180 --ar 21:9  (crop the middle band)

4. Near verge fence tile
PROMPT: a wide strip of low white picket fence with grass tufts at its base, flat cel shaded cartoon style, designed to repeat seamlessly left to right with matching edges, no text --style raw --s 180 --ar 21:9  (crop the middle band)

5. Road surface tile
PROMPT: a seamless repeating texture of a tan dirt path, subtle grain and a few lighter worn patches, flat cel shaded, low contrast so game objects read on top of it, no text --style raw --s 180 --ar 1:1

6. Oak tree prop
PROMPT: one large friendly cartoon oak tree, thick brown trunk and a big rounded three lobe canopy in two greens, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1

7. Park bench prop
PROMPT: a small wooden park bench, warm brown slats with darker legs, front three quarter view, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1

8. Flower tuft prop
PROMPT: a small tuft of grass with three tiny flowers, one yellow one pink one white, simple rounded shapes, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 1:1

9. Branch arch prop
PROMPT: a wide tree branch arching horizontally with leaves hanging from it, meant to pass overhead, wider than tall, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 7:3

10. Park gate landmark
PROMPT: a friendly wrought iron park gate with two stone pillars and an arched sign overhead reading nothing, flat cel shaded, welcoming, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 7:3

11. Squirrel, 3 poses
PROMPT: a small cartoon squirrel, warm brown with a big fluffy tail, 3 poses side by side with gaps: sitting alert; startled mid turn; running away, flat cel shaded mobile game sprite, chunky rounded toy like shapes, thick soft warm dark outline, single soft top light, saturated cheerful colors, on a solid flat magenta background, no drop shadow, no ground, no text, no watermark --style raw --s 180 --ar 21:9


====================================================================
THE OTHER THREE ANIMALS: swap this paragraph into the 7 state prompts
====================================================================

KITTEN: a small grey kitten, soft grey coat the color of #9aa3ad, darker pointed upright ears #717b86, pale grey chest #e4e8ec, big round green eyes, tiny pink nose, slim upright tail, chunky toy proportions with a big head and short legs, no collar and no markings on its back

BUNNY: a small white rabbit, soft white coat #f2f2f2, tall upright ears with pink inner ears #f7c9d4, round cotton ball tail, big round dark eyes, tiny nose, chunky toy proportions with a big head and short strong legs, no markings on its back

FOX: a small fox cub, bright orange coat #ef7d3a, darker pointed ears #c95a1e, cream belly and cream tail tip #fbe5cf, big amber eyes, black nose, one big bushy tail, chunky toy proportions with a big head and short legs, no markings on its back


====================================================================
HOUSE WORKFLOW REMINDERS (the $30 plan rules)
====================================================================
Relax mode always. Batch of four per prompt, pick the best, no re-roll unless
nothing works. Lock the style: every prompt above already carries the same
suffix. Seeds for consistency across a character. Upscale only final picks.
Name files the moment they land: puppy_runA.png, obstacle_hydrant.png, and so
on, then drop them in the Drive Puppy Dash folder and I cut and wire.
