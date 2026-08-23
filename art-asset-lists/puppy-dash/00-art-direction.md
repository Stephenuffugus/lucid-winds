# PUPPY DASH — art direction

**Status:** LISTED 2026-08-24. Zero art in the game today; everything on screen is drawn with
canvas vector shapes as a placeholder.

**Look:** locked already, in `satellites/puppy-dash/drop/PUPPY_DASH_ART_BIBLE.md`. Flat cel
shaded, chunky rounded toy like shapes, soft warm dark outline, single soft top light,
saturated and cheerful. Sunny neighbourhood dog park, not a subway. That direction is good and
this pack does not reopen it.

## The sheets

| Sheet | What it is |
|---|---|
| [01 — character frames](01-character-frames.md) | **the frame list.** One canonical pose set that any animal is drawn into. CORE 24 per animal ships all four; FULL 46 is the upgrade. Plus 22 shared FX frames drawn once for everybody |
| [02 — world and backgrounds](02-world-backgrounds.md) | seven layer parallax stack, six biomes you run through, the prop library, the lane dividers the game is missing, and the telegraph decals |

## Three decisions this pack makes

**1. Gameplay art is 3/4 REAR view.** The animal in the build today faces the camera while the
road runs away behind it, so it reads as a plush toy standing on a treadmill. Every gameplay
frame in sheet 01 is drawn from behind. Menu and card frames stay front 3/4, because those are
the frames where you want the face.

**2. Design every animal symmetric from behind,** and BANK RIGHT becomes the engine flipping
BANK LEFT. That is three frames saved per animal and it costs nothing but a rule about where
you put asymmetric markings: chest, face, underside, never the back.

**3. Nothing decorative ever touches the running surface.** The road carries obstacles and
pickups only. Every prop lives on the verge. The moment a player has to ask whether a bench is
a threat, they stop reading the scenery, and the scenery is what you are paying for.

## Do we need to go 3D?

No, and going 3D would not fix what is actually wrong.

I measured the current build rather than guessing. At top speed an obstacle takes **0.62
seconds** to travel from the horizon to the animal, and it is under half its final size for the
first 0.32s of that, so the **readable window is about 0.29 seconds**. A choice reaction, which
of three verbs do I need, takes a person roughly 400 to 500ms before their thumb even moves.
The game is asking for a decision in less time than a decision takes.

That is not a rendering problem. Underneath it are five things, and every one of them is fixable
in the 2.5D canvas that is already there:

1. the hero faces the wrong way, so nothing reads as moving
2. there is no world between the horizon and the animal, so there is nothing for speed to be
   measured against
3. the three lanes are invisible, so you cannot aim at one
4. the visible road is about one second long, where a runner wants two and a half to three
5. the projection is linear in screen space rather than a real 1/z perspective, so obstacles
   drift in at a constant rate with no sense of closing

A 3D rebuild that still had those five problems would feel exactly as bad, and would cost the
single file vanilla constraint the whole fleet is built on. Sheets 01 and 02 fix 1, 2 and 3.
Points 4 and 5 are engine work and are being done separately.

## Order

Sheet 02's road assets first (surface, lane dashes, edge). Then sheet 01's puppy RUN. Then look
at it in the game before anything else is generated.
