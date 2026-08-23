# PUPPY DASH — Sheet 2: the world (backgrounds, parallax and props)

**Doc in 012Assets:** https://docs.google.com/document/d/1J_aeuvMdslRV2jXf04FXzAf-Zwl2Yt5aCO2SsYhuSd8/edit  
*(Stephen works from Drive. The Doc is the delivered copy; this file is the repo mirror.)*

> **The problem this sheet solves.** I ran the game and shot the road. Between the horizon and
> the dog there is: nothing. Sky, two soft hills, a green field, a tan trapezoid. Not one tree,
> fence, bench, bin, lamp post or gate. **Speed in a runner is read off the world going past
> you, not off the obstacles.** With no world to go past, the only moving things on screen are
> the things that kill you, and the run feels like it is happening on a treadmill.

---

## 0. The law, before anything else

**Nothing decorative is ever on the running surface.**

The road carries obstacles and pickups and nothing else, forever. Every prop in this sheet
lives on the verge, beyond the road edge, or above head height. The moment a player has to ask
"is that a bench I hit or a bench I run past" the world stops helping and starts lying, and
they will learn to ignore the scenery entirely, which costs you every bit of the speed cue you
just paid for.

One exception, and it is the only one: **lane dividers**, which are painted ON the road and
are addressed in section 3.

---

## 1. The layer stack

Seven slots. **Every biome fills the same seven slots**, which is what lets one biome crossfade
into the next without any special casing.

| Layer | What it is | Parallax | Canvas | Notes |
|---|---|---|---|---|
| **L0 sky** | gradient plus sun or moon | static | 1024 x 640, tiles horizontally? no, single | one image, no seam needed |
| **L1 far** | mountains, city skyline, dune line, tree wall | 0.04 | 2048 x 320, **seamless horizontal tile** | sits on the horizon line |
| **L2 mid** | treeline, rooftops, pier posts | 0.14 | 2048 x 400, seamless tile | the first layer that visibly moves |
| **L3 near verge** | the run of fence, hedge, or rail beside the road | 0.45 | 2048 x 512, seamless tile | this is where speed starts to read |
| **L4 props** | individual objects placed in depth | full depth, same projection as obstacles | 512 each | see section 4 |
| **L5 road** | the running surface plus lane markings | full depth | see section 3 | |
| **L6 lens** | leaves, petals, blown litter crossing the camera | 1.35 | 512 each, 6 to 8 pieces | rare, one every few seconds, never blocks a lane read |

**Why parallax rates matter more than the art.** Four layers at four different speeds is what
your eye integrates into "I am moving fast". A beautiful single background at one speed reads
as a wallpaper. If you only have budget for two moving layers, make them **L2 and L3**, because
the near verge at 0.45 does more work than everything above it combined.

---

## 2. The biomes

Six. You run through them: the biome changes at distance milestones and crossfades over about
three seconds, which also gives the player a reason to keep running that the game does not
currently have.

| # | Biome | Changes at | Mood | L0 sky | L1 far | L2 mid | L3 near verge |
|---|---|---|---|---|---|---|---|
| 1 | **Dog park, morning** | 0m, home | bright, safe, the default | pale blue, low warm sun, fat clouds | soft green hills | oak and maple treeline | low white picket fence |
| 2 | **Suburb street, golden hour** | 500m | warm, long shadows | amber to peach, sun near the horizon | rooftops and a water tower | hedges and mailboxes | privet hedge run |
| 3 | **Beach boardwalk** | 1200m | open, breezy, bleached | wide pale blue, gulls | flat sea and a pier | dune grass and umbrellas | weathered timber rail |
| 4 | **Autumn woods** | 2000m | close, warm, loud colour | overcast cream, low light | dense orange and rust canopy | trunks and drifted leaves | mossy stone wall |
| 5 | **Night park** | 3000m | calm, lit, magic | deep indigo, moon, stars | city glow on the horizon | dark trees with lit windows behind | lamp posts with warm pools |
| 6 | **Snow park** | 4000m | quiet, high contrast | flat white grey, snowfall | white hills | bare black trees | snow banked fence |

After biome 6 it loops back to 1 with the distance counter carrying on.

**Palette discipline.** Every biome keeps the locked road tan (`#cda775` / `#b8935a`) and the
locked biscuit cream. The road and the pickups must look identical in all six, because those
are the things the player is reading at speed and they cannot be allowed to shift. **Change the
sky, the verge and the props. Never change the road or the biscuits.**

Night park is the one to watch: it is the biome most likely to hurt readability. Keep the road
lit as if by the lamp posts, keep obstacles rim lit, and if it fights the read, cut it.

---

## 3. The road, and the lanes you cannot currently see

Three lanes exist in code. **Nothing on screen says so.** There are two faint tan dash columns
near the road edges that read as road markings, not lane dividers, and the animal sits in the
middle lane with no way to know it. You cannot aim at a lane you cannot see, and this is a
large part of why lane changes feel like guesswork.

| Asset | Spec |
|---|---|
| **road surface tile** | 1024 x 1024 seamless, tan, low contrast grain and a few worn patches. Must tile in the direction of travel with no visible seam |
| **lane divider** | a repeating dash, **two columns, one on each true lane boundary**, not at the road edges. Cream at about 55% opacity over the tan. These scroll, and their scroll is the strongest speed cue on the screen |
| **road edge** | a soft worn transition from tan into the verge, 64px wide, never a hard line |
| **verge strip** | 256px of grass or sand or snow either side of the road before L3 starts |

The lane dividers are the cheapest single improvement in this whole sheet. Two scrolling dash
columns in the right places give the player a lane grid, a speed read and a depth read at once.

---

## 4. The prop library

L4 props stream toward the player in real depth, on the same projection as obstacles, and they
are placed **on the verge only**. Six roles per biome. Same six roles every time, which means
the engine's placement logic never changes.

| Role | Frequency | Height | Dog park example | Purpose |
|---|---|---|---|---|
| **tall marker** | every 3 to 5 seconds | tall | oak tree | the big parallax beat, your main speed cue |
| **mid marker** | every 2 seconds | waist | park bench | fills between the tall ones |
| **low clutter** | every 1 to 2 seconds | ankle | tuft of flowers, a fallen ball | close ground detail, reads fastest of all |
| **overhead** | every 8 to 12 seconds | above frame | branch arch across the road | a moment of enclosure, breaks the openness |
| **landmark** | once per biome | large | the park gate with an arch sign | tells you the biome changed. Make these memorable |
| **life** | every 6 to 10 seconds | varies | a squirrel that bolts, a pigeon that lifts off | the world reacting to you is worth ten static props |

Per biome that is 6 props, so **36 props for the full world**. Start with dog park's 6.

**The life props are the ones people will remember.** A squirrel that startles and runs as you
pass costs one small sprite and three frames and does more for the feel of the place than
another tree. Put them on the verge, moving away from the road, always.

---

## 5. What obstacles must never look like

Because this is where a beautiful world quietly ruins a game.

| Obstacle | Verb | Must stay visually unique by |
|---|---|---|
| hydrant | dodge to another lane | it is the ONLY red object at road level. No red props, in any biome |
| wall | dodge | the only thing spanning a full lane at chest height |
| banner | slide | the only thing hanging across the road from above. No overhead prop may hang low enough to be mistaken for one |
| puddle | jump | the only dark reflective patch ON the road. No dark road decals of any kind |
| trash can | dodge | full lane width, hard silhouette, and it never appears on the verge as a decoration |

**So: no verge bins, no verge hydrants, no verge puddles.** If a biome wants a bin, it is a
different shape and a different colour from the obstacle bin, or it does not get one.

---

## 6. Telegraphing, which is art work and not code work

Obstacles currently carry a small blue triangle floating above them. It is a good idea executed
too small, too late and too high: it floats in the sky detached from the object, at about 30px,
and by the time it is legible the obstacle is already close.

| Asset | Spec |
|---|---|
| **verb glyph, jump** | upward chevron, warm gold, on a soft dark plate for contrast against any biome |
| **verb glyph, slide** | downward chevron, same treatment |
| **verb glyph, dodge** | left and right double chevron |
| **road decal** | the same glyph painted flat ON the road in the obstacle's lane, several body lengths ahead of it |

The **road decal** is the important one. A flat marker on the road in the obstacle's lane
appears far earlier than the obstacle is readable, sits in the lane so it doubles as a lane
cue, and scales with the projection so it also reads as depth. Three jobs, one asset.

---

## 7. Delivery

```
/art/environment/<biome>/  sky.png  far.png  mid.png  verge.png
                           prop_tall.png  prop_mid.png  prop_low.png
                           prop_overhead.png  prop_landmark.png  prop_life_01..03.png
/art/environment/road/     surface.png  lane_dash.png  edge.png
/art/environment/lens/     leaf_01..08.png
/art/ui/telegraph/         glyph_jump.png  glyph_slide.png  glyph_dodge.png
                           decal_jump.png  decal_slide.png  decal_dodge.png
```

L1, L2 and L3 must tile **seamlessly left to right**. Generate wider than you need and cut the
tile from the middle where the generator is most consistent.

---

## 8. The order to make them in

1. **Road surface, lane dashes, road edge.** Three assets. Put them in and look. This alone
   will change how the game reads more than anything else in the sheet.
2. **Dog park L1, L2, L3.** Three tiles. Now there is parallax and now there is speed.
3. **Dog park's 6 props.** Now there is a place.
4. Telegraph glyphs and road decals. Now the road is fair.
5. Look at the whole thing, in the game, at real size, before starting biome 2.
6. Biomes 2 through 6, in the order in the table.
7. Lens layer last. It is polish and it can hurt readability if it is added too early.

---

*Palette locked in `PUPPY_DASH_ART_BIBLE.md`. This sheet supersedes the bible's section 6,
which describes a parallax background but not the layer rates, the biome set, the prop roles,
the lane dividers, or the rule that keeps decoration off the running surface.*
