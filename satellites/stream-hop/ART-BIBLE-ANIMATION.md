# JIMOTHY — Sheet 15: THE ANIMATION BIBLE

**Read this once. Then every character gets its own sheet, built to this spec.**

---

## 1. What is actually wrong

You are right, and the numbers are worse than they look from the outside.

**One character out of twenty-nine is fully animated.** Jimothy has twenty paintings. Every other
character — all twelve Seattle critters, all thirteen costumes, all three secrets — has **four**:
`idle`, `crouch`, `leap`, `land`. That is it.

The engine has a fallback table that folds every other pose onto those four. Here is what the player
actually sees when they are playing as anyone but Jimothy:

| What happens in the game | What Jimothy does | What everyone else does |
|---|---|---|
| Clears a level (held 2.6s, camera zooms in) | throws an arm in the air, cheering | **stands still** |
| Gets flattened by a car (held 1.55s, camera leans in, light closes on him) | on his back, legs up, stars circling | **shows its landing frame** |
| Drowns (same 1.55s hold) | soaked, arms up, water bursting | **shows its landing frame** |
| Swept up by the street sweeper (same hold) | spiral eyes, tongue out | **shows its landing frame** |
| Drinks the coffee, sprints for 4.2 seconds | flat out, fire streaking off his feet | **stands still** |
| Grabs the snacks, magnet on for 6.5 seconds | delighted, bottlecaps swirling in | **stands still** |
| Holding an umbrella shield | standing under an open umbrella | **stands still** |
| Umbrella eats a hit | braced, paws up, energy dome | **shows its landing frame** |
| A gull lines up a dive at them | up on his hind legs, paws to his chest | **stands still** |
| The sweeper closes in | sprinting, panicking, "!!" | shows its leap frame |
| Left alone 4 seconds, then 8 | sits down, then gets out the fries | **stands still, then stands still** |

And it got worse last week, not better. The new death ceremony holds the camera on the character for
a second and a half with a spotlight closing on their body — which is a great moment when it is
Jimothy on his back with stars circling, and a dead-flat one when it is a crow showing its landing
frame.

**Six of those characters are entirely my fault.** Deckhand, Market Day, Hard Hat, Scoutmaster, First
Frost and Garage Band came off sheet 7, where you had painted one standing pose each. I wired all
four hop frames to that single painting so they would be playable, told myself the engine's squash
and stretch would carry it, and shipped them. They do not have four frames. They have one. That is
the half-arsed you are looking at, and you are right that it drags the whole shop down.

---

## 2. The recommendation before you paint anything

**Fewer characters, fully animated, beats a lot of characters half-animated.** So:

1. **Nothing goes in the shop until its sheet is finished.** I will add a completeness gate to the
   engine: a character is only offered for sale once all eighteen of its frames exist. The roster
   grows as you paint, and a player can never buy something that stands still when it should cheer.
2. **The six one-pose costumes come out of the shop today** and go back in when their sheets land.
   They are the weakest thing in the game and they are the newest, so nobody will miss them.
3. **Then work down the roster in the order in section 6**, one character per sheet.

Say the word and I will do 1 and 2 before you paint a single frame.

---

## 3. The eighteen frames

Every one of these is a real state the engine asks for **by name**. The file goes to
`assets/<sheet>/<name>.png`. Triggers and durations are measured out of the live code, not guessed —
they tell you how long the frame is actually on screen, which tells you how much it deserves.

| # | file | when the engine shows it | on screen for |
|---|---|---|---|
| 1 | `idle` | standing, at rest — the default | constantly |
| 2 | `sit` | 4 seconds without input | until they move |
| 3 | `eat` | 8 seconds without input | until they move |
| 4 | `crouch` | first quarter of every hop | 0.07s, hundreds of times a run |
| 5 | `leap` | middle half of every hop | 0.15s, hundreds of times a run |
| 6 | `land` | last quarter of a hop, plus a hold | 0.17s, hundreds of times a run |
| 7 | `run-r` | a sideways hop to the right | 0.28s |
| 8 | `dash-run` | hopping with the coffee dash up | 0.19s |
| 9 | `coffee` | **standing** with the dash up | 4.2s (Coffee) / 7.0s (Double Shot) |
| 10 | `magnet` | standing with Snacks up | 6.5s |
| 11 | `umbrella` | standing while a shield is held | indefinite, until it is hit |
| 12 | `shield` | the instant the shield eats a hit | 0.55s |
| 13 | `scared` | a gull or crow is lining up a dive | 0.82–1.15s |
| 14 | `flee` | the street sweeper is within 2.4 rows | seconds at a time |
| 15 | `cheer` | **LEVEL CLEAR**, camera zooms in | **2.6s, the biggest moment in the game** |
| 16 | `ko` | death by traffic, gull or steam | **1.55s under a camera lean and closing iris** |
| 17 | `dizzy` | death by the street sweeper | **1.55s, same treatment** |
| 18 | `splash` | death by water | **1.55s, same treatment** |

**Optional nineteenth:** `run-l`, a sideways hop to the left. If it is missing the engine mirrors
`run-r`, which is invisible on plain fur but flips asymmetric details — Scoutmaster's badges would
jump to the other side of his chest. Paint it only where that would show.

### Where to spend the effort

Frames 15 to 18 are held on screen for one and a half to two and a half seconds each, under a camera
move, with the rest of the picture going dark. They are the money frames. Frames 4 to 6 flash past in
under two tenths of a second but the player sees them hundreds of times a run, so they need to be
*correct* rather than *detailed*.

### The arithmetic, before you commit to anything

I wrote a frame audit (`scripts/frame_audit.py`) so this is measured rather than guessed. It hashes
the files, so it also catches the six costumes whose four "frames" are the same painting four times.

```
1 of 29 characters complete.
410 paintings outstanding across the roster.
```

**Four hundred and ten.** That is months. So do not commit to eighteen across the board on my say-so
— pick a tier per character and mean it:

| tier | frames | what it fixes | cost across the roster |
|---|---|---|---|
| **what we have** | 4 | nothing | — |
| **CORE 10** ← recommended | +`cheer` `ko` `splash` `dizzy` `umbrella` `shield` | every long-held, camera-on-them moment. Kills the cheap feeling outright. | **168 paintings** |
| **FULL 18** | +`sit` `eat` `run-r` `dash-run` `coffee` `magnet` `scared` `flee` | flavour, power-ups, personality between the big beats | **410 paintings** |

**My honest recommendation: Core 10 for the whole roster, Full 18 for a handful of favourites.** Six
new paintings per character buys back every moment the camera actually stops on them — the level
clear, all three deaths, and the two shield states. The other eight are lovely and nobody will feel
their absence the way they feel a crow standing still while the screen says LEVEL CLEAR.

The alternative worth considering: **a smaller roster, fully animated.** Twenty-nine characters is a
lot of characters. Eight brilliant ones at Full 18 is 112 paintings and would feel more expensive than
twenty-nine at Core 10. That is your call, not mine — but if you want the shop to feel pro rather than
big, that is the version I would ship.

---

## 4. Jimothy's twenty are the reference

`assets/hero/`. This is the standard every other character is matched to — frame for frame in energy
and staging, never a straight copy where a different body would do it differently.

| frame | what you painted |
|---|---|
| `idle` | standing four-square facing camera, calm, neutral |
| `sit` | sitting upright on his haunches, paws folded on his belly, content |
| `eat` | sitting beside an open box of fries, holding one up |
| `crouch` | flattened low on all fours, haunches up, eyes forward |
| `leap` | airborne, limbs spread wide, belly forward, delighted |
| `land` | front paws planted, body low, whiskers forward, weight absorbed |
| `run-r` / `run-l` | side-on sprint, body low, legs extended |
| `dash-run` | flat out, legs at full stretch, speed streaks, eyes wide |
| `coffee` | running with a takeaway cup, fire and speed streaks under his feet, pink steam |
| `magnet` | holding a box of fries, gold bottlecaps swirling in, mouth open, delighted |
| `umbrella` | standing under an open umbrella, rain coming down around it |
| `shield` | crouched, paws up, blue-violet energy dome around him, rain streaking off it |
| `scared` | up on his hind legs, paws clutched to his chest, eyes huge |
| `flee` | sprinting, mouth open in panic, red speed streaks, "!!" |
| `cheer` | standing tall, one arm thrown to the sky, mouth open, joyful |
| `ko` | flat on his back, legs in the air, stars circling his head |
| `dizzy` | sprawled, spiral eyes, tongue out, stars circling |
| `splash` | soaked to the skin, arms up, water bursting around him, shocked |

`run-r2` also exists but the engine never asks for it. Do not paint a second one for anybody.

---

## 5. House rules for every sheet

- **One character per sheet. Never combine characters.**
- Magenta `#FF00FF` background, as always.
- **Same camera and same scale across all eighteen frames.** The character must not change size
  between poses — the engine draws them all at one height.
- Three-quarter high angle, facing the viewer, the same camera as `hero/idle.png`. Sideways run
  frames are the exception and are side-on.
- **Lay out with clear gaps between rows, or draw white divider lines. Never butt frames up against
  each other on an even grid.** The cutter reads divider lines or connected components; a fixed grid
  is how we once shipped a car sliced in half.
- Suggested layout: **6 columns × 3 rows**, in the numbered order above, one frame per cell.
- **The character's identity survives every single frame.** If it wears a hard hat, the hard hat is on
  in all eighteen. If it carries a baguette, the baguette is there — including while it drowns.
  The costume *is* the character.
- **Effects are painted into the frame**, exactly as Jimothy's are: the fire streaks on the dash, the
  shield dome, the water burst, the circling stars, the swirling bottlecaps. The engine does not
  composite them.
- Warm, funny, slightly melancholy, rainy Seattle. Deaths are funny-sad, never grim, never gory.

---

## 6. The roster, in the order I would paint it

Twenty-eight characters still need sheets. Each character gets its own doc with all eighteen frames
described specifically for that body — a fish cannot hold an umbrella and a slug cannot run, and
solving those honestly is most of the work. Those docs follow this one.

**Wave 1 — the ones that are actively embarrassing** (one pose each, all eighteen needed)
Deckhand · Market Day · Hard Hat · Scoutmaster · First Frost · Garage Band

**Wave 2 — the first critters a player ever pulls out of the bin** (four frames each, fourteen needed)
City Pigeon · Ballard Crow · Seagull · Opossum

**Wave 3 — the costumes you already animated once** (four frames each, fourteen needed)
Soggy · Hot Jimothy Summer · Nordic · Barista · Fishmonger · Dr. Jimothy · Jimothy MD

**Wave 4 — the rest of the critters**
Skunk · Banana Slug · River Otter · Great Blue Heron · Discovery Park Coyote · Harbor Seal ·
Sockeye Salmon · Orca

**Wave 5 — the secrets**
Ghost · Rich Uncle · Sasquatch

The hardest characters on the roster are Banana Slug, Sockeye Salmon and Orca — no limbs at all, and
eighteen poses designed for a raccoon. They are also the funniest if we solve them properly, which is
why they are late in the order rather than dropped.

---

## 7. What I can do on the code side, on your word

Not doing any of this until you say so — you asked me to slow down and write the spec, so the spec is
the deliverable. These are ready when you want them:

- **A completeness gate.** Each character declares how many frames it actually has, and the shop only
  offers the finished ones. Anything already owned stays owned and playable — this only stops us
  *selling* unfinished work.
- **Pull the six one-pose costumes from sale** until their sheets land. They stay in the collection
  for anyone who already has them.
- **Keep `run-l` optional** by extending the existing left/right mirror to fully-animated characters,
  so you only paint it where mirroring would flip an asymmetric detail.
- **A frame-audit command** that walks `assets/` and tells us exactly which frames are missing per
  character, so the roster status is never a guess.
