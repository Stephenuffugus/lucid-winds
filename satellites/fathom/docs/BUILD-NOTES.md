# Fathom build notes

What the night learned, for whoever opens this next. The design is
`docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-FATHOM.md`, the plan is
`plans/fathom/HANDOFF-FATHOM.md`, and every choice this build made that neither of them made is in
`docs/DECISIONS.md`.

## The one command

```
node tools/check.js          everything
node tools/check.js --fast   skips level1 and campaign and SAYS so
```

Nothing commits without `ALL GATES PASSED`. Ten gates:

| gate | what it is | watched to fail by |
|---|---|---|
| `lint` | the studio laws against the shipped file: the script parses under `vm.createScript`, no `.mjs` at runtime, a `?v=` on every asset, one stamp in three places, no dash or exclamation point in player copy, no `shadowBlur`, no text under 0.7 rem | putting a dash in the tagline |
| `levels` | the five caves in `index.html` are exactly what `tools/levels.mjs` renders | editing a grid by hand |
| `test` | 170 assertions over the SIM layer, run in Node against the same source the page runs | `--over=CATCH_R=0`, `--over=HEAR_R=1`, bricking a cave's exit |
| `solve` | a bot walks each cave's shortest route and throws its authored script, five seeds each | moving cave three's exit one tile into rock |
| `deep` | 200 generated caves: connected, inside both budgets, a reachable cache, no lurker near the start, and NOT a room | `--over=ENDLESS_FILL=0.46,ENDLESS_SMOOTH=5`, the plan's first numbers |
| `boot` | the page framed, two real taps to a cave, and a canvas pixel that is not black where the player stands | commenting out the player glow |
| `play` | the drag, the slop rule, the tap, the light arriving, the HUD, the hum, the audio budget | `--over=TAP_SLOP_PX=500`, `--over=HUM_COOLDOWN_MS=0`, four extra oscillators per ping |
| `layout` | every button on every screen at 375, 320 and 412: 48 px rendered AND reachable by `elementFromPoint`. Plus the music pill's seat | `.btn.small` at 40 px, and parking the stone count in the corner |
| `level1` | one cave cleared by a steered thumb, the clear card, the save, the next cave opening | (covered by solve and by campaign) |
| `campaign` | three caves, the ghost, being caught, the restart, and the deep | (the long one, 45 s) |

## What the gates caught that a green run would have hidden

1. **The harness threw instead of failing.** `--over=RING_SPEED=0` produced a Node module loader
   stack, not a red line. `newRun` throws a NAMED error for a cave with no exit now, every suite
   runs inside `runSuite`, and `runSolve` catches per seed.
2. **A purity grep its own prose could satisfy.** `suitePurity` searches SIM for `Math.random`, and
   the sentence at the top of SIM says "no Math.random", so it would also have gone GREEN on a
   comment claiming the opposite. It strips comments first and asserts the stripper works. The same
   bug, in reverse, made `lint` red on correct code.
3. **The deep caves were not caves.** 78 percent open, walls only at the border, and every existing
   check green on it. See DECISIONS.
4. **A level tool that overwrote a cache with a lurker**, silently, costing cave three a cache.
5. **The slop rule check inferred throws from the stone count** after a second finger had already
   thrown, and stayed green with the rule broken.
6. **The music seat check asked `elementFromPoint`**, which skips `pointer-events:none`, so the HUD
   could sit in the corner and the gate would not notice.
7. **The thumb tool wrote a completely black tile and printed THUMB OK.** Its waits timed out
   silently. It checks how much of its own picture is lit now.
8. **Fourteen audio voices against a budget of twelve.** Three oscillators per ping became one
   shared echo bus.

## What the light is, mechanically

There are TWO views of the same walls and the difference is the whole look:

- `gridEdges(grid)` is one edge per tile face. **The light works on these**, so a wavefront sweeps
  ALONG a wall. The first build lit merged runs and a twelve tile wall switched on in one frame; it
  read as a technical drawing.
- `gridToSegments(grid)` merges collinear runs. **Collision and the thrown stone work on these**,
  and `MAX_SEGMENTS` counts these.

A face lit inside the last `WALL_FLASH_MS` also draws a white overstroke, so a bright crest runs
along the rock behind the ring. `TEST` asserts the sweep by counting lit faces a quarter second in
against the final count: a switch-on cannot pass that.

## Numbers that moved, and why

Everything is in CONFIG and `sim.js --over=KEY=VAL` runs any sweep against an override without
editing the game.

| key | plan | shipped | why |
|---|---|---|---|
| `ENDLESS_FILL` | 0.46 | 0.56 | the plan's numbers made one open box |
| `ENDLESS_SMOOTH` | 5 | 4 | same |
| `RIBBON_PTS` | 7 | 12 | a 240 ms trail is 40 units, a four pixel sliver |
| `RIBBON_EVERY_MS` | 40 | 55 | same |
| `CAM_MARGIN` | new | 80 | a deep run opened with the player under the HUD |
| `WALL_FLASH_MS` | new | 220 | the crest |
| `PICKUP_R`, `EXIT_R` | new | 14, 16 | the plan gives no radius for walking onto a thing |
| `MAX_WALLS` | new | 2000 | the face budget, distinct from the segment budget |
| `ENDLESS_MAX_OPEN`, `ENDLESS_MIN_ROUTE` | new | 0.55, 30 | the box gate |

## What is not built

- **Occlusion.** A ping reveals through rock. The design recommends v1.1 and the plan takes it.
- **The secondary echo off a big wall.** Design section 5, marked stretch. Not built.
- **A second species.** Design section 11.
- **A daily seed and a share card.** Design section 11.
- **Penny mode.** Design section 11.
- **`art/title-bg.jpg`.** The code reads it if it appears; nothing waits on it.
