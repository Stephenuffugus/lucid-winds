# CHAMELEON 3D — Engagement Redesign Brief

**Status:** CONCEPT — Stephen review. No build until he picks the cut.
**Source:** Stephen 2026-07-29: levels need much more detail for hiding and
painting; the scan as-is might be "scan the whole level and snatch em up";
chameleons should distract, the UFO could target or shoot probes; 20 seconds
is not enough hide time once maps are dense. "Focus group or research a
little what the best move will be."

## What the genre already learned (the research)

The asymmetric hide-and-seek genre (Prop Hunt, Witch It, Midnight Ghost
Hunt) solved our exact problems years ago, and the solutions are consistent
across all of them:

1. **Reveals must COST the seeker.** In Prop Hunt, shooting a wrong prop
   costs the seeker health. That one rule is the whole game: without it the
   seeker sprays every object and hiding is pointless. Our scan today is a
   free wallhack — Stephen's instinct is exactly right.
2. **Hiders must LEAK.** Prop Hunt forces every hider to emit a sound every
   ~25 seconds. Perfect stillness can never be a complete strategy, or
   rounds end in boredom instead of tension. Our camo decay partly does
   this; an active leak beats a passive one.
3. **False positives are the fun.** Decoys that read EXACTLY like a real
   hider on the seeker's tools create the mind games both sides remember.
4. **Hide phase: 30-45s** in every successful title, scaled to map size.
   20s is below the genre floor even on small maps.

## The proposed kit (each side gets tools, every tool has counterplay)

### UFO (seeker)
- **SCAN → PROBE DARTS.** Replace the area reveal with 3 physical darts the
  UFO SHOOTS (Stephen's own idea, and the genre-correct one). A dart sticks
  where it lands and for 8s pings MOVEMENT in a 12m radius — a heartbeat
  blip, not an outline. Restock 1 per 20s. Still frozen and painted? The
  dart says nothing. This turns "scan the level" into area denial + aim.
- **TARGET LOCK.** Aiming steadily at one chameleon-shaped suspect for 1.5s
  confirms or denies it (narrow cone, UFO must hover still — commitment,
  like the 2D beam). Wrong lock on a decoy = 6s sensor static (the cost).
- **The beam stays** as the capture, unchanged.

### Chameleons (hiders)
- **TAIL DROP.** Once per round, leave a wiggling tail decoy that pings on
  probes and LOCKS as a chameleon until touched. Sells the false positive;
  the counter is the lock-cost above.
- **PEBBLE FLICK.** Cooldown 15s: tongue-flick a pebble up to 20m — a rustle
  + movement ping where it lands (the classic thrown-rock distraction; it
  feeds the UFO's probes false movement).
- **THE LEAK (fairness).** Every 25s a hidden chameleon must breathe: a
  2s shimmer unless it spends a "held breath" charge (2 per round). Perfect
  camping now has a rhythm the UFO can hunt.

### Rounds
- **Hide phase 35s** base (45s on the big maps), skippable when all hiders
  vote ready. 20s stays only as a "quick match" toggle.
- Score by time-to-catch per chameleon, so early finds still pay the UFO
  even when one hider runs the clock.

## Level detail (the density pass)

Hiding needs OCCLUDERS and paint VARIETY, not just floor. Per map: foliage
clumps and canopies you can enter (silhouette breakers), rock fields, 3-4
distinct ground palettes in zones (so painting is a real choice and moving
between zones is a real risk), and burrow patches (port the 2D burrow: sink,
eyes only). Kenney props cover most of this — it is a placement + palette
pass, not new art. Do ONE map as the template, then rubber-stamp.

## The recommended v1 cut (one session)

1. Probe darts replace the scan (the degeneracy fix — highest value).
2. Hide phase 35s + ready-vote.
3. Tail drop + pebble flick.
4. Density pass on the smallest map as the template.
Park for v2: target lock, the leak, canopy entry, per-map palettes.

⛔ Stephen calls: the v1 cut, dart counts/cooldowns feel (his phone), and
whether the leak mechanic fits the cozy register or reads too sweaty.
