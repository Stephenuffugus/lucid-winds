# DEWBALL: a review brief for an outside brain (9 October 2026)

You are being asked by the director of a one person game studio, Sky Wolf Studio. Your answer will be read by the
studio's planning model (Claude), turned into a build plan, and built by the studio's coding model. So: analyze
what is here and give us DIRECTIONS, ranked, concrete enough to build. Do not make art here. This is a review of
ONE game across four things: gameplay feel, assets and art direction, user interface, and user experience.

**The game is DEWBALL, at https://lucidwinds.com/satellites/dewball/ (play it on a phone, landscape; it also
plays with WASD and a gamepad on a laptop).** Six screenshots of the current build are at
https://lucidwinds.com/docs/briefs/dewball/ and are described in Part 2, so you can answer from this file alone
if you cannot browse. Nothing else on that site is under review.

**HOW I NEED YOUR ANSWER: as ONE downloadable file** named `DEWBALL-REVIEW-<your model name>.md` (a `.docx` is
fine if you cannot make a `.md`). If you truly cannot attach a file, put the WHOLE answer inside one code block
so it can be copied in one tap. The file must end with the `json` block described at the end of Part 4.

Be specific and be brave. The weakest answer is generic mobile game advice ("add juice", "improve onboarding").
The best answer names the world, the screen, the object, the size in centimetres or pixels, the words to change,
the reason a player would feel the difference, and how we would measure that it worked.

---
# PART 1. THE GAME IN TWO MINUTES

**What it is.** A katamari. You roll a sticky ball through a world of things. Anything small enough sticks to
the ball and the ball grows by the volume it eats. Bigger things shove you, much bigger things are walls, and a
hard hit knocks your three most recent pickups back off. Each world has a clock, a goal size, and three star
sizes; size gates (fences that sink when you are big enough) fence the later parts of a world behind "come back
bigger". Creatures and vehicles roam; eat them once you outgrow them. Five named keepsakes per world are
collectibles. It is three.js in one HTML file, runs in the browser, installs to the home screen, and will be
listed on Google Play.

**The seven worlds, in order, each unlocked by one star in the one before.**

| world | theme | start to goal | clock |
|---|---|---|---|
| Crumb Country | a giant picnic blanket | 4 cm to 24 cm | 2:45 |
| Toybox Peaks | a playroom in concentric rings | 8 cm to 70 cm | 3:20 |
| Night Garden | a garden in rings | 15 cm to 1.7 m | 3:25 |
| Bazaar Lane | a market town in rings | 30 cm to 3.4 m | 3:30 |
| Starfall Bay | a beach and harbour in rings | 60 cm to 16 m | 3:15 |
| The Whole World | a 129 m planet you roll around | 45 cm to 22 m (44 m for three stars) | 5:00 |
| Dream Meadow | endless, no clock, everything | 20 cm to no end | none |

**Real numbers, so you know what you are looking at.** A thing sticks when its size is at most the ball's
diameter times a ratio that ramps from 0.55 at 40 cm to 0.72 at 12 m. Growth is by volume at 75 percent of the
thing's bounding sphere. Each world holds 29 to 71 kinds of thing (195 kinds in all) and scatters 1,600 to 5,500
of them, plus six to nine hand placed set pieces (a chess corner, a sandwich tower, a koi pond, a container yard
with a crane, standing stones), three or four size gates, two to four kinds of creature, and eleven large unique
landmarks across the worlds (a gramophone, a tower of books, a long case clock, a water wheel, a moon bridge).
The camera looks down at the ball from behind; the left thumb rolls, the right thumb turns the camera; there is
a dash button. A 25 entry ladder of size facts fires as you cross real world sizes ("you're as long as a blue
whale"). The economy is cosmetic: ball skins and world clear unlocks, and stars pay Sunbeams, the studio's cross game currency; no ads, no timers, no purchases inside. The title screen carries a description, the controls and a How to Roll panel.

**What the art is today.** Nothing is modelled or painted. Every one of the 195 kinds is a stack of primitives
(cylinders, boxes, cones, spheres) with flat vertex colours; the ground is a procedural pattern (red and cream
checks on the blanket, carpet in the playroom, cobbles in the market); the sky is a two colour gradient with
fog. The plan that follows this review replaces the kinds that matter with modelled, textured props made through
Meshy and Blender, world by world, under a strict phone performance budget, and adds painted ground and sky.

---
# PART 2. WHAT IS ON SCREEN TODAY (the six shots)

All six are Crumb Country, the first world, shot from the real player camera with the ball at 26 to 28 cm, at a
landscape 1280x820.

1. `lmGramophone-wide.png`: the ball mid blanket; the gramophone landmark (a gold cone horn on a brown box) at
   the back left among picnic baskets; a red folding chair; a candle; a ladybug on the red check; a bread roll
   basket; the HUD at the top (27 cm, two stars AT 1.85 m, a growth bar), the clock top right (2:45), a pause
   button, the dash button bottom right, CRUMB COUNTRY bottom left.
2. `lmGramophone.png`: the same landmark close, filling half the frame.
3. `lmBookTower-wide.png` and `lmBookTower.png`: a tower of nine coloured book slabs on a plinth with a ball on a
   pole on top, chess pieces in a row behind, a blue biscuit tin, fences and baskets at the horizon.
4. `lmLongClock-wide.png` and `lmLongClock.png`: a tall long case clock among the picnic things.

**What the studio already sees wrong (do not spend your answer repeating these; build on them or disagree):**
the props read as toys close up and as coloured blocks past about ten ball diameters; the sky is an empty
gradient and the horizon is a hard line between orange fog and the checks; the fog pulls the far field to one
orange tone and the big saturated red checks swallow red props. What the studio thinks is right: the HUD is two
numbers and a clock, the ball reads instantly, the blob shadows seat everything, the gate signs read from far.

---
# PART 3. WHAT WE WANT FROM YOU

Ranked directions, as many as you have, in four groups. For each: the world or screen, the object or element,
the concrete change (sizes, words, colours, timings), why a player feels it, how we would measure it.

**A. Gameplay feel.** The roll, the camera, the pickup moment, the knockback, the gates, the size facts, the
clock pressure, the star ladder, the keepsakes. What would make the first ninety seconds of Crumb Country feel
like a toy you cannot put down? What is missing from a world clear?

**B. Assets and art direction.** We are about to model 115 to 185 kinds of thing. Which kinds matter most on
screen and why (the ones a player stares at, the ones that fill the closing minute, the creatures)? What single
art direction should every prop obey so seven worlds read as one game (the studio's working answer is "toy shop
katamari": chunky, rounded, bright, saturated, soft bevels, painted textures, no text)? What should the ground
and sky be per world? Where would a texture make things LESS readable on a phone?

**C. User interface.** The HUD, the world select, the pause menu, the results screen, the settings (Invert Y,
Horizon mode, sound), the directions a new player sees before the first world (How to Roll on the title screen today, nothing in the first run itself). Sizes in
pixels at a 412 wide phone in landscape, words, placement, what fades and when.

**D. User experience.** Onboarding, difficulty perception across the seven worlds, what a player tells a friend
about this game, what makes them come back on day two, and anything about the install, the landscape lock, or
the store listing.

Laws you should know so you do not suggest against them: no ads, no timers, no purchases inside the game, no new
currency; nothing a player reads carries a dash or an exclamation point; the growth numbers, the clocks and the
gate sizes were tuned on device and by a bot and are not on the table in this review; the game must hold 60
frames a second on a Pixel 9 in the biggest world.

---
# PART 4. THE SHAPE OF YOUR FILE

Markdown. Headings A, B, C, D as above. Under each, a numbered list, best first. Each item has four lines:
**What** (world or screen, element, the concrete change), **Why** (what the player feels), **Measure** (how we
know it worked), **Cost** (S, M or L for the builder). Then a final section **Corrections** where you tell us
anything in this brief that the live game contradicts. End the file with exactly this block, filled in:

```json
{ "model": "<your model name>", "date": "<today>", "directions": { "A": <count>, "B": <count>, "C": <count>, "D": <count> }, "top3": ["<one line>", "<one line>", "<one line>"] }
```
