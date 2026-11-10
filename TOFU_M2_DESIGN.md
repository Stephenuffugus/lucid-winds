# TOFU m2, THE EATERS: the design (Fable, 10 Nov 2026; nothing here is built)

Stephen, 10 Nov: "The core concept of preparing yourself different gives me kind of a Kirby's Dreamland idea where I can cook or
prepare myself differently and enemies eat me so I have to figure out how to budget myself to get all the enemies and survive the
level while properly countering the enemies. My weapon is how I prepare myself and then how they eat me."

## The idea in one breath

Kirby inhales an enemy and takes its power. Tofu is the other way round: the enemy eats YOU, and what you were when it bit is what
happens to it. You are the ammunition and the health bar at once. Every level asks: feed every eater the wrong thing for it, and
still arrive at the bowl with enough of yourself left to serve.

## The three rules

1. **You are six bites.** A bite meter of six sits in the HUD. An eater that reaches you takes a bite. At zero you are gone.
2. **How you are prepared is the hit.** Each eater has ONE preparation it cannot stomach. Bitten in that state, it takes one bite
   and is beaten (its own little defeat, then it sits harmless). Bitten in any other state, it takes TWO bites, enjoys them, and
   comes back for more.
3. **The bite takes the preparation with it.** The crust, the frost, the stink leave with the mouthful: you drop back toward
   plain and must prepare again at a station before the next eater. Stations are your ammunition, and the level decides how
   many you get.

The bowl still judges your state, as in m1, and now also your size: a dish needs a minimum of bites left. Stars: one for
serving, two for every eater beaten, three for doing both with bites to spare.

## The eaters and what beats them (six, plus one)

| Eater | How it eats | Tell | Beaten by | What you see |
|---|---|---|---|---|
| CHOPSTICKS (in the game today) | pinch and lift | a click, the tips open | SILKEN | you slip out, they cross and tangle |
| GULPER, a round wide mouth | inhales from three tiles, Kirby's own move turned on you | cheeks puff | FROZEN | brain freeze, it clutches its head and tips over |
| PECKER, a kitchen bird | dives from a perch | a head tilt, a squawk | FIRM | the beak bends, it wobbles off dizzy |
| TONGUE, a counter toad | a tongue shot along the floor | the throat swells | FRIED | a burned tongue, steam, it hides in its pot |
| SNIFFER, a snouted hound | follows your trail and charges | sniffs, nose lights | STINKY | it faints flat with its legs up |
| SLURPER, a soft slug | sticks and drinks you slowly (a bite every two seconds) | glistens | SOY (salt) | it shrivels to a raisin |
| THE CRITIC (boss, one per world) | all of the above in turn | holds up a card naming its course | three preparations in its order | it writes a review and leaves |

Each counter is something a child can guess from the picture: cold hurts teeth, hot burns a tongue, salt shrinks a slug, a
smell knocks out a nose. No chart needed after the first meeting, and the first meeting is a card.

## Why it is a budget

Six bites. A perfect level costs one bite per eater, so a level with four eaters and a dish that wants two bites is exact: no
mistake allowed. The designer's dials are the number of eaters, the number of stations, the order they come in, and the bites the
bowl demands. A second budget hides in rule 3: one fryer and two Tongues means you must reach the fryer twice, or bait one
Tongue to waste its shot.

Smaller is also different: under three bites you fit one tile gaps, so a level can hide a shortcut that only a half eaten tofu
can take. Being bitten is sometimes the right move.

## What stays from m1

Everything. The state model, the stations, the bowl, the eight dishes, the controls. m1's levels stay as the tutorial world
("The Kitchen"); the eaters arrive in world two ("The Dining Room"), one new eater per level, then mixes.

## What the build needs

1. The bite meter, the shrinking body (the blob scales by bites; hitbox follows), the bowl's minimum.
2. The eater base (patrol, tell, eat, chew, countered, beaten) and the six behaviours; chopsticks moved onto it.
3. A LEVEL LAB (Stephen makes the levels by hand): paint tiles, stations and eaters on a grid in the page (?lab=1, as in Tomato
   Man), play it at once, Copy the level as text, paste it to Fable. m1's maps are already ASCII, so the lab reads and writes
   the format the game has.
4. Astra's round two wired (the brief: docs/briefs/tofu/round-2/ASTRA-TOFU-ROUND-2-NOV10.txt).
5. Ten to twelve levels, his.

## His calls (each is built at its default if he says nothing)

1. Bites: six (default), or four for shorter levels.
2. A wrong bite costs two (default), or one plus the eater grows faster.
3. The bite strips your preparation (default yes; without it one frying beats every Tongue in the level).
4. Must every eater be beaten to finish (default no: the bowl opens anyway, beating all is the second star).
5. A way to get a bite back: a block of fresh curd, one per level at most (default yes, hidden).
6. Smaller fits gaps (default yes).
7. The eaters' names; the mode's name (THE EATERS is a working title); the world's name.
8. Astra's own ideas come back in IDEAS.md; nothing of hers is built without his yes.
