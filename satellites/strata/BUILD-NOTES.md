# STRATA, build notes

**What it is:** a cliff face of layered sediment. Brush the dust away, chisel
through the stone, and something comes out that has never existed before.
Extract it, mount it, name it, and hang it in a museum that is only yours.

**Built:** 2026-09-06, by Opus, against `plans/strata/HANDOFF-STRATA.md`.

---

## The two laws

**A specimen is its seed.** `species(seed, era)` and `identity(sp, seed, ded)`
are pure functions of one number, and so are the bones and where the ground put
them. The museum stores a seed, the share link carries a seed, and everything
else is regenerated. That is why a link is seventy one characters and why a
stranger's link cannot smuggle in an animal this game did not make.

**The variety sheet is a gate a human reads.** `tools/variety.mjs` draws fifty
animals on one image and a person opens it and counts the ones they would take a
screenshot of. It failed twice, at nought and at about four, before it passed at
twelve, and both failures were real faults in the grammar that every assertion
in `sim.js` was green on the whole time.

## The files

```
index.html      the whole game, one file, no build step, no framework
sim.js          --test  --species=SEED  --census=N  [--over=KEY=VAL]
sw.js  manifest.webmanifest  icon-192  icon-512  icon-maskable-512
tools/check.js  the one command. It must print ALL GATES PASSED
tools/lint.mjs  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs  tools/variety.mjs
test/harness.mjs  dig  mount  share  layout
docs/DECISIONS.md  docs/shots/  docs/thumb.png
```

`SIM_EXPORT` markers wrap CONFIG through EXTRACT. Nothing inside them touches a
clock, a document, a window or an unspecified `Math` call: sin, cos and atan2
come from DMATH, built from `+ - * /` and `Math.sqrt` only.

## The seven gates

| gate | what it holds down |
|---|---|
| `sim` | 103 assertions: five hundred animals inside the bone budget with every bone hanging off the spine, all four plans and all four sizes inside two hundred seeds, deeper bands stranger and bigger, a long neck carrying a smaller head, five thousand seeds giving 4,950 different names, every history fragment reachable and none of them claiming a creature ALWAYS did anything |
| `lint` | the script parses, one stamp in three places, no dash and no exclamation point a player can read, no clock or page inside the rules |
| `census` | what the grammar is actually producing, as a table, and it fails if any one choice takes more than sixty percent of it |
| `dig` | real pointer strokes: the brush takes rock off, a quick chisel stroke is safe and a rest is not, the pick cracks at once, and a trace along a freed bone lifts THAT bone |
| `mount` | real drags out of the crate onto the armature, a real typed dedication, and a reload to prove a museum that forgets is not a museum |
| `share` | a SECOND browser with its own profile opens the link, a real tap opens the crate, and a hand written link cannot lie about a condition or a name |
| `layout` | every screen at five phone sizes, every group COUNTED before it is measured |

## What the screenshots found that the gates could not

The list is in the plan's evidence ledger. The three worth carrying to another
game:

1. **A buried thing must look exactly like what is over it.** Every skeleton
   showed through the cliff as pale rectangles, because bone cells were painted
   by a different route and their matrix had been softened.
2. **A rule charged by input EVENTS is not charged by time.** The pressure meter
   filled per pointermove, so holding a finger perfectly still, which is the
   thing the rule is about, filled nothing.
3. **A title screen that does not show the game is a wasted screen.** Both games
   in this run shipped a flat rectangle first and had it fixed by looking.

## Where the numbers live

`CONFIG` at the top of the SIM export, frozen. `sim.js --over=KEY=VAL` runs any
sweep against an override without editing the shipped file.
