# Jimothy — the 50 level course plan

**Status: PROPOSAL. Not built. Needs Stephen's yes before I touch `makeLane`.**
Written 25 July 2026, off measurements of the live generator, not guesses.

---

## What is wrong today, measured

**1. There are no combos. There are only rows.**
`makeLane` builds one row at a time. It flips between a "safe band" and a "hazard band",
and inside a hazard band every single row independently rolls road-or-water. Nothing knows
about the row above it except `G.lastType`. So the game can never produce a *set piece* —
a boulevard, a braided river, a tram crossing — because no code ever thinks about more than
one row at a time. Everything is texture and nothing is composition.

**2. The ramp finishes at level 21 and then wobbles for the rest of the game.**
`advEase` reaches 0 at level 21. `advDiff` reaches 9.2 at level 24 and then crawls to 10.8
by level 56. Measured road speed per level:

| level | 21 | 26 | 31 | 36 | 41 | 46 | 51 | 56 |
|---|---|---|---|---|---|---|---|---|
| road speed | 204 | **317** | 251 | **198** | 242 | 241 | 293 | **199** |
| water % | 44 | 38 | 56 | 44 | 56 | 50 | 31 | 38 |

Level 56 is easier than level 26. That is not a difficulty curve, it is noise with a
slight upward bias. A player who reaches level 30 has seen everything the game will ever
show them.

**3. Safe ground collapses early.** Level 1 is 63% safe rows. By level 26 it is 19%. Bank
rows are checkpoints, so the game gets much less forgiving much faster than it gets
interesting.

---

## The proposal: patterns, not rows

Replace the per-row coin flip with a **library of hand authored multi row set pieces**.
A pattern is a small designed unit that knows about itself:

```js
{ id:'boulevard', name:'The Boulevard', tier:2, tags:['road','wide'],
  rows:[ {road:1, dir:+1, speed:0.85, density:0.7},
         {road:1, dir:+1, speed:1.00, density:0.7},
         {road:1, dir:+1, speed:1.15, density:0.7} ] }
```

Three lanes, all one direction, speed stepping up as you go — so the gap you can see from
the curb is the gap you actually get. That is a designed idea. Today's generator cannot
express it at all.

### Starter library, roughly 24 patterns across 6 tiers

**Tier 1 — teaches one thing (levels 1 to 6)**
- `first-street` one slow sparse road
- `two-abreast` two roads, same direction, same speed, readable as one crossing
- `stepping-stones` one water row, wide slow pads

**Tier 2 — a second idea (7 to 14)**
- `boulevard` three roads one way, speed stepping up
- `oncoming` two roads facing each other, generous gap between
- `wide-river` two water rows, same direction, pads staggered so there is always a line

**Tier 3 — pressure (15 to 24)**
- `the-squeeze` two fast roads with one unbanked safe row between
- `braided-river` three water rows alternating direction
- `tram-and-traffic` a train row above a road row

**Tier 4 — commitment (25 to 34)**
- `four-lane` four roads, alternating direction, mixed speed
- `ferry-crossing` one wide slow ferry, then narrow fast pads
- `rush-hour` three same direction roads, dense, small gaps

**Tier 5 — real difficulty (35 to 44)**
- `the-gauntlet` five hazard rows with no safe row inside
- `long-river` four water rows with a ferry in the middle
- `railyard` two train rows

**Tier 6 — the deep end (45 to 56 and beyond)**
- `the-crucible` six rows mixing train, road and water
- `whitewater` four fast water rows, small pads
- `expressway` four roads at express speed

Plus two to four variants of each so the same tier does not read as the same level.

### How 50 levels get their shape

Two dials, both authored, neither random:

**Which tiers may appear**, widening slowly:

| levels | tiers drawn from | patterns per level |
|---|---|---|
| 1-6 | 1 | 2 |
| 7-14 | 1-2 | 2-3 |
| 15-24 | 1-3, weighted high | 3 |
| 25-34 | 2-4 | 3-4 |
| 35-44 | 3-5 | 4 |
| 45-56 | 4-6 | 4-5 |
| 57+ | 5-6 | 5, speed keeps creeping |

**Rhythm rules**, so a level is a sentence and not a pile:
- never two patterns with the same tag back to back
- always a bank row after any tier 3+ pattern
- a level never opens on its hardest pattern, it opens one tier below and builds
- the row before a feast gate is never the hardest thing in the level

The existing special levels (STORM WATCH, RAIL YARD, FERRY CROSSING and the rest) become
**pattern weightings** rather than separate code paths. RAIL YARD just means "draw
`railyard` and `tram-and-traffic` first".

### Endless and Zen get it free

One library, two schedules. Adventure unlocks tiers **by level**. Endless unlocks the same
tiers **by depth** (roughly a tier every 45 rows), so the deep end of Endless finally has
composition instead of just faster noise. Zen stays capped at tier 1-2 forever, which is
what the fix I just shipped does with the old machine anyway.

---

## What this costs and what it risks

- It is a **rewrite of `makeLane`**, the heart of the game. Everything else in the file
  feeds off it.
- **It changes the Daily course.** Anyone who plays today before the deploy and someone who
  plays after get different roads on the same Daily number. The honest fix is to ship it
  right after a UTC midnight rollover so one Daily is not split in half. Worth planning.
- Star goals were tuned against the current generator (`2-5 bank rows and 0-5 coins per
  level` is written into the code comments). They will need re-measuring afterwards or
  three stars becomes either trivial or impossible.
- I would build it behind a flag, generate all 56 levels headlessly, and put the
  measurements in front of you before it goes live.

## What I need from you

1. **Yes to the shape?** Patterns instead of per row rolls, six tiers, widening window.
2. **Does 56 levels feel right**, or do you want the authored part to run further before it
   hands over to "same tiers, creeping speed"?
3. **Any set pieces you want in the library by name?** This is the part where your taste
   matters more than my measurements. The list above is a starting skeleton, not a menu.
4. Ship timing around the Daily rollover.
