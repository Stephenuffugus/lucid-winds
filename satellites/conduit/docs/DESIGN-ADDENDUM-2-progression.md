# CONDUIT — design addendum 2: progression and return

**The idea:** as you grow, you unlock more moves and more ways to connect,
which makes you want to go back to earlier sites. Metroid, in a stealth
puzzle.

This is right for CONDUIT, and CONDUIT is unusually well built for it. But
the obvious version of it would damage the game, so this document sets the
rule that keeps it honest.

---

## 1. The rule: re-read, don't re-walk

Metroid gates on **hard locks** — a door you cannot open until you hold the
key. CONDUIT's locks are almost all **soft**: the squeeze threshold, the
force threshold, exposure tiers, source capacity. You can already pass
nearly all of them today by spending yourself differently. That is the
best thing about the design, and a key-and-door progression would quietly
convert those interesting choices into binary checks.

So the standard for every unlock is:

> **A legal unlock changes what an old level *means*, not whether you are
> permitted to enter it.**

You return not because a door finally opens, but because you can now see a
solution that was invisible before. The map didn't change. You did.

**Three tests every unlock must pass:**

1. **Does it re-price an old level?** It should change the cost, the route,
   or the order of a puzzle you already solved — not just append a new room.
2. **Does it carry its own cost?** A strict upgrade is a dead unlock. Every
   one must make something else worse or louder or more visible.
3. **Was the affordance visible from level one?** The player must have
   walked past it and wondered. Retrofitting locks into old levels later is
   the version of this that feels cheap.

---

## 2. Growth makes the inversion harsher, not softer

This is the load-bearing detail, and the numbers already do it:

**The thresholds are absolute. Capacity is not.**

- Squeeze is under **30 mass**. Force is over **70 mass**. Fixed forever.
- Capacity grows 100 → 180.

At capacity 100, going thin enough for a vent means giving up 70 mass. At
180, the same vent costs you 150. And `sizeSpotFactor` scales on raw mass,
not on a fraction of capacity — so a grown player is spotted **1.5× faster**
than a starting one.

So progression does not trivialise old levels. A late-game player walking
back into level 1 is *stronger, richer, louder, more visible, and pays far
more to become small*. That is a real re-read: the level is easier to force
and harder to ghost. Both medals are still on the table, and they now pull
in opposite directions.

**Do not "fix" this by scaling the thresholds with capacity.** The tension
is the whole point.

---

## 3. What unlocks, and what it re-opens

| Unlock | What it does | What it re-opens | Its cost |
|---|---|---|---|
| **Splice** (built) | Route along the facility's own wiring for **0 mass** | Every level ever played, at once. The dim lines were always drawn. | Fixed paths you didn't choose, and powering over them **trips the site panel: +1 alert every time** |
| **Split** (M5) | Two blobs, controlled one at a time | Every force-door-plus-vent puzzle in the game — the one the spec calls unsolvable | Half of you is somewhere else and cannot be recalled quickly |
| **Insulation I–III** | Conduit spot time ×1.5 per rank | Levels where every cheap route was under a light | Nothing — so cap it at III and never let it reach "never spotted" |
| **Capacity 100→180** | Longer routes, more devices at once | Levels where two traps could not both be funded | Slower, louder, spotted 1.5× faster, and squeezing costs far more |
| **Junction** | One run powers two devices | Levels where the source budget was the wall | Both devices die when one wire is discovered |
| **Conductor** | Your own body closes a circuit while you stand in it | Gaps you could not bridge; lets you *be* the last tile | You cannot move without cutting the power |
| **Peek / Cling / Pool** (addendum 1) | Recon and approach verbs | Approach vectors, not puzzles | Time, and mass for peek |
| **Dissolve** | Destroy a corpse instantly | Levels you could only ghost by hiding bodies | Costs the harvest you'd have taken |

**Never sell as an upgrade: the reclaim rate.** Moving 75% toward 100% sells
the player the removal of the game's central tension. Upgrade reclaim
*speed* instead — same feeling of mastery, no damage to the puzzle. This is
already flagged in the pitfalls and it is the most tempting mistake here.

---

## 4. Why they come back: medals, not loot

The return incentive is already in the design — the four medals. Ghost on
an early site may be genuinely impossible before Insulation II. Efficiency
may be impossible before Splice. So earlier levels hold visible, named,
unfinished business, and the player can see exactly which tool would
finish it.

**Anti-grind rule:** a replayed level banks only the *improvement* over
your previous best on each axis, not the full yield again. Farming an easy
site pays nothing. Solving it a better way pays properly. Without this
rule, the residue economy turns into a treadmill within a week.

---

## 5. Structure: level select, not one connected map

A true interconnected Metroid map is the wrong shape for a phone game made
of 15–30 minute stealth puzzles with a save-anywhere expectation. Ship a
**site select** with per-site medal state and visible locked affordances.

Get the Metroid *feeling* from the sites themselves rather than from
geography: every site keeps its state, shows which medals remain, and hints
which tool would unlock them. If a connected spine still seems worth it at
M6, add cross-site vents between two adjacent sites as an experiment before
committing the whole map to it.

---

## 6. What this changes right now (already done)

The one thing that cannot be retrofitted cheaply is **the affordances**, so
they go in from today — the same reason `player.blobs` was a list on day one.

- The facility's own wiring is now drawn in the level, dim and inert. It
  runs behind the generator, along the corridor, up the vent shaft, and out
  to the breaker.
- `traits.splice` exists and is `false`. Flip it and those lines light up
  green and cost nothing to route along.
- Measured on the current map: the designed generator→plate route costs
  **28.4 locked, 21.6 spliced — 6.8 mass freed**, and using it trips the
  panel to alert 1. Same level, different game.

**Authoring rule from here on:** every level must contain at least two
affordances that its own tools cannot use. Site wiring, a vent too long to
cross on one body, a source out of budget range, a second device that could
have been junctioned. The player should walk past them and wonder.
