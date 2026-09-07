# Fathom decisions log

Every choice the build made that the design and the plan did not make for it, newest last, one bold
line of what and one line of why (HANDOFF-FATHOM section 10). Numbers live in CONFIG; the design is
never edited.

## P0

**2026-09-05 — the ASCII grid is 50 rows of 30 characters, not 30 rows of 50.**
Why: the plan's CONFIG says `GRID_W 30 GRID_H 50` and `720 by 1200 wu`, and its DATA paragraph says
"30 strings of 50 chars", which is the same rectangle turned on its side. Portrait wins: 30 wide by
50 tall, so a cave is two screens across and three down.

**2026-09-05 — the five campaign caves are rendered by `tools/levels.mjs`, not typed.**
Why: five caves is 7500 characters of ASCII where one wrong character is a wall in a doorway that no
gate would name. The shapes are the authored thing, the ASCII is their rendering, and the `levels`
gate re-renders and diffs so the page and the tool can never drift. The page still ships plain data
with no build step.

**2026-09-05 — the bot's route is the shortest walk the BFS finds; only the throws are authored.**
Why: the plan puts `solution.path` in DATA. A hand typed path proves that one typed path works; a
BFS path proves the cave is actually walkable, and bricking an exit turns the solve gate red instead
of making it time out. The throws stay authored because where you throw is a judgement about the
cave, and it is the judgement the gate is there to protect.

**2026-09-05 — `PICKUP_R` 14 and `EXIT_R` 16 are new CONFIG keys.**
Why: the plan gives no radius for walking onto a cache, a pearl or the crystal. Half a tile plus the
player, so a brush past counts and you never have to stand exactly on a point you cannot see.

**2026-09-05 — no occlusion. A ping reveals every wall inside the ring, through rock.**
Why: the design asks and answers this itself (section 11, recommend v1.1) and the plan takes it
(3.5). Reveal through walls is forgiving for a ten year old and ten times simpler.

**2026-09-05 — `ENDLESS_FILL` 0.56 and `ENDLESS_SMOOTH` 4, not 0.46 and 5.**
Why: at the plan's numbers every deep cave came out as one open box, 78 percent water with the rock
only at the border, 142 segments, nothing to remember. The sweep walked fill 0.46 to 0.56 against 2
to 5 smoothing passes; 0.56 with 4 lands at 43 percent open and about 200 segments and reads as
chambers joined by passages. Two new keys, `ENDLESS_MAX_OPEN` and `ENDLESS_MIN_ROUTE`, put that
judgement in the generator, and the deep gate asserts it so a box cannot come back quietly.

**2026-09-05 — the lurker spawns in caves three, four and five moved off the shortest route.**
Why: the first draft put them on it. The bot was eaten within three seconds of every start, and so
would a player be: a lurker standing in the only corridor is a coin toss, not a lure. They now live
one room to the side, where a stone thrown at their side of the room stops them and the way through
runs down the other side. That is the mechanic the design is about.

**2026-09-05 — the solve gate runs five seeds per cave, not one.**
Why: a lurker drifts on the seed, so one seed proves that one run was survivable. Five say the cave
is. Fewer than that and the gate is a coin the morning reader would have believed.

## P1

**2026-09-05 — the light works on per tile faces, collision works on merged runs.**
Why: lighting merged runs switched a twelve tile wall on in a single frame and the screen read as a
technical drawing rather than as light arriving. `gridEdges` gives one face per tile so the
wavefront sweeps along a wall; `gridToSegments` still merges for collision and for the segment
budget. TEST asserts the sweep by counting lit faces a quarter second in against the final count.

**2026-09-05 — `WALL_FLASH_MS` 220, a white overstroke on a face lit in the last fifth of a second.**
Why: the only difference between the near end of a long wall and its far end was a few hundred
milliseconds of fade, which is invisible. The crest makes the wavefront's arrival readable.

**2026-09-05 — the ring falls off as the 2.2 power of its reach, not the square.**
Why: with no occlusion the ring keeps going over rock it has already passed, and at the old
brightness it read as a grey pencil circle laid over the drawing rather than as the thing that made
it.

**2026-09-05 — `tools/check.js` is CommonJS.**
Why: it is named `check.js` because the plan and every morning report name it that, and an ESM `.js`
with no package.json prints a MODULE_TYPELESS warning above the gate table on every run.

## P2

**2026-09-05 — the lurker ribbon is 12 points every 55 ms, not 7 every 40.**
Why: 240 ms of trail is 40 world units at investigate speed, a four pixel sliver on a 360 unit
screen, and no amount of drawing makes that read as an eel. 600 ms is about 100 units. The dots also
ride a standing wave that is largest mid body and zero at head and tail, fixed per ghost so a memory
does not wriggle.

**2026-09-05 — a cache is three stones in a heap, about ten units across.**
Why: it was a ring with a dot in it, which is the ripple's shape language, and at two unit stones it
was four physical pixels, smaller than a letter of the hint line beside it. The pickup radius is 14,
so a ten unit glyph is honest about how near you have to be.

**2026-09-05 — the echo is one shared bus, not three oscillators per ping.**
Why: two overlapping pings and a hum put fourteen voices in the air against the plan's budget of
twelve. A delay with feedback, built once, is three permanent nodes and the delay time is still set
per throw from the nearest wall distance, so the room still decides the slap back.

**2026-09-05 — the caught line arrives after the black, and the HUD goes with it.**
Why: shown at the same moment as the fade it was half opacity type smeared across the brightest part
of a lit cave. Black first, then the line, then the restart.

## P3

**2026-09-05 — `CAM_MARGIN` 80: the camera may run past the edge of the cave.**
Why: clamped hard to the world, a deep run opened with the player jammed into the top left corner
under the stone count, because a generated cave starts at its highest open cell. In a game where
unrevealed space is black, void beyond the wall and rock you have not lit look identical, so the
margin costs nothing and keeps you off the edge of your own screen.

**2026-09-05 — the camera is placed in `beginRun`, not on the first frame that happens to draw.**
Why: anything asking where a world point is on screen between `beginRun` and the first draw got the
camera at the origin. The boot gate caught it one run in six: a player reported at screen x 550 on a
375 wide phone.

**2026-09-05 — every browser gate waits for N MORE frames, never for a frame count.**
Why: the counter runs on the title screen too, so `frames() > 12` was already true before a gate
reached the play screen and the read landed before a single frame of the cave was drawn. That is
what made the boot gate read a black pixel one run in six after the camera was fixed.

**2026-09-05 — `tools/thumb.mjs` measures how much of its own tile is lit and refuses a dark one.**
Why: its waits timed out silently, every wall faded, and it wrote a completely black tile and
printed THUMB OK. A camera with no check on its own picture is the same mistake as a gate that
cannot fail.

**2026-09-05 — the arcade tile is shot in a generated deep cave, not in cave one.**
Why: cave one opens in a hand drawn rectangle, and a rectangle photographed square is a rectangle:
the first tile read as a technical diagram with a hoop in it.

**2026-09-05 — the secondary echo off a big wall is NOT built.**
Why: design section 5 marks it a stretch and the plan gates it on P3 steps 1 and 2 being green
before the small hours. They were, but the audio budget was the binding constraint by then and a
second reflection is more nodes. It is in BUILD-NOTES as not built.

**2026-09-06 (Fable) — occlusion is built. A ping lights what the sound reaches, not everything inside its circle.**
The plan's 3.5 deferred the raycast to v1.1 and the morning report called it the single biggest change available: with
every face inside the ring lit through rock, the ring read as a circle laid over the screen in a big empty room. Now
`soundReaches(grid, x0, y0, x1, y1)` samples the grid every quarter tile along the ray from the sound to a face's nearest
point (or a cache, or a pearl) and stops a third of a tile short, so a face's own tile never counts against it. The
wavefront still marks the face as reached (`R.lit`), so a second sound can light it; only `litAt` waits for a clear
ray. `CONFIG.OCCLUDE: 0` restores the launch slice for a comparison, and `sim.js --test --over=OCCLUDE=0` goes red on
"the right wall behind the pillar stays dark". The exit still sings back through rock (it is heard, not seen) and
lurkers are still revealed as before. Cost: one short ray per face on the step the ring reaches it.

**D-C11 (2026-09-07, Opus) — the tile is the MOMENT of the ping, not a bigger picture of the
cave.** On the shelf beside eleven others the tile read as a broken image: about eighty five
percent black, two pixel lines, the subject above centre with an empty band under it. Darkness is
this game's identity and a tile that reads as a failed load is still a fault.

**Two things that are not the answer, both tried and both measured.**
- **Four stones.** The hand does not carry four, so throws three and four land on nothing,
  `ringAt` waits its full twenty five seconds twice, and by the shutter the first two rings have
  expired and every wall has faded. 0.64 percent lit against the two stone tile's 2.63, a
  QUARTER, which is the exact failure `tools/thumb.mjs`'s own header describes arriving by a new
  door.
- **A bigger zoom alone**, 1.9 with the rings run out to 150. Zooming a sparse cave gives you a
  bigger sparse cave: the ring ran off all four edges and read as a lens artifact, and the lit
  walls became scattered corners.

**What worked was the moment, not the size.** The rings are caught EARLIER, at 110 and 45 rather
than 150 and 60, while the sound is still crossing the walls it is lighting, and the camera comes
in only 1.45 so the whole ring sits inside the frame with the lit cave inside it. That is this
game's own picture, a sound going out into the dark, rather than a diagram of some walls. 2.63
percent lit to 4.3.

`TILE_ZOOM` is the camera's one liberty and it is the tile's alone: nothing in the game ever sets
it, `tools/thumb.mjs` does for one shot, the same way the tool already seeds a save so the deep is
open. The stones are thrown FIRST, at the real field of view, so the cave the sound found is the
cave the game would have found; the camera only comes in afterwards to photograph it.

⛔ AND THE TOOL'S DARKNESS FLOOR WAS DECORATION. Six pixels in a thousand only catches a BLANK
tile, and a tile can be far from blank and still read as broken. It is 0.035 now, which the tile
clears at 4.3 and every framing below it fails: putting the old rings and no zoom back makes the
tool refuse the tile four times and exit non zero.

---

**D-C11b (2026-09-08, Opus) — the shelf tile, judged against eleven others rather than alone.**
Shot the arcade's In Development tab at 412x915 with all the tiles in frame and looked at it.
Fathom's was the worst thing on that shelf: black, with one white L shape and a dot, reading as a
failed image load beside neighbours that all carry a scene.

- **⛔ "THE HAND DOES NOT CARRY FOUR" WAS WRITTEN IN THIS TOOL AND IT IS WRONG.** The hand carries
  eight. The Sep 07 four stone attempt failed for the reason the same paragraph gives second, that
  its `ringAt` waits timed out and the early rings expired before the shutter, and then the wrong
  half of that sentence stood as a reason not to try again. There are no waits in the fan at all
  now, only frames, so nothing can time out.
- **⛔ WHERE YOU STAND IS NOT THE LEVER.** Seven places along the cave's own route were measured
  with the same two stones and the same camera: 4.43, 4.39, 4.39, 4.39 percent lit, twelve or
  thirteen wall segments every time. A room and a corridor light the same handful. What changes the
  picture is how many stones are in the air.
- **⛔ AND THE LIT FRACTION WAS MEASURING THE RING, NOT THE CAVE.** That is why those four numbers
  are identical to two decimal places: nearly all of it is the ripple circle, which is the same size
  wherever it is thrown. A tile with every wall stripped out would have cleared the 0.035 floor.
  The floor stays as a guard against a black tile; the picture is now defended by a **differential
  the camera measures on the spot**: the fan must light at least twice the wall a single stone
  lights in the same cave. Two stones could never have passed it.
- **The camera goes OUT, not in.** At 1.45 the outer rings ran off all four edges and read as lens
  flare. At 0.9 they nest around the cave, and the picture is a sound going out into the dark.
- **The numbers:** two stones, 13 wall segments, 4.1 percent. Seven stones, 29 segments, 7.0 percent,
  against 5 for the single stone the camera throws first to have something to compare with.
