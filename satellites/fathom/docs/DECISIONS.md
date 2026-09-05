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
