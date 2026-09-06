# WHISTLESTOP, build notes

**What it is:** a wooden train set on a sunlit rug. Snap curves and straights
together, pull the whistle, then work the switches so every little train gets
home without meeting nose to nose.

**Built:** 2026-09-06, by Opus, against `plans/whistlestop/HANDOFF-WHISTLESTOP.md`.

---

## The one law

**The track is a graph and the train is an arc length.** Nothing moves by
pixels. A train's position is a distance along the route it has recorded, and
body `i` is at `p - i * CAR_SPACING` on that same route. The consist is
therefore rigid: reversing flips the sign of travel and moves nothing, which is
why a train that backs into a siding does not fold up like a concertina at the
buffer.

The second half of that law is the switch. A facing switch ahead of the train
is re-derived from the lever before the train reaches it; a trailing one never
is. Both fall out of one route model rather than being special cased, and
together they are the whole of the second puzzle: a train that backs into a
siding comes out of it trailing, so the lever cannot touch it, and comes back
at it facing, so the lever decides.

## The files

```
index.html      the whole game, one file, no build step, no framework
sim.js          --test  --solve  --lap=N  --race  [--over=KEY=VAL]
sw.js  manifest.webmanifest  icon-192  icon-512  icon-maskable-512
tools/check.js  the one command. It must print ALL GATES PASSED
tools/lint.mjs  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/harness.mjs  boot  build  run  share  sound  layout  mutants
docs/DECISIONS.md  docs/shots/  docs/thumb.png
```

`SIM_EXPORT` markers wrap CONFIG through PUZZLES and `sim.js` reads the rules
out through them, so the headless runner and the thumb play the same game.
Nothing inside those markers touches a clock, a document, a window or an
unspecified `Math` call: sin, cos and atan2 come from DMATH, built from
`+ - * /` and `Math.sqrt` only, because a rug sent by link has to run the same
on the other person's phone.

## The eleven gates

| gate | what it holds down |
|---|---|
| `sim` | 131 assertions: the ring closes, a lap does not drift, six cars hold their spacing through a curve AND stay on the circle, a switch is facing one way and trailing the other, two trains never get inside each other |
| `lint` | the script parses, one stamp in three places, no dash and no exclamation point a player can read, no `shadowBlur`, no clock or page inside the rules |
| `solve` | both puzzles are won by their own solution and lost by doing nothing |
| `lap` | forty laps of the ring with no drift at all |
| `mutants` | thirteen plausible wrong versions of the rules, each of which must turn a NAMED assertion red |
| `boot` | two real taps from the title to a rug with track on it, and the wood measured lighter than the wool |
| `build` | eight real drags of the curve tile close a ring with the chime, undo reopens it, a piece dragged off the rug goes back in the box, two fingers zoom |
| `run` | the whistle starts a train, a lever thrown sends it the other way, and the 48 px law measured on painted controls by pressing them off centre |
| `share` | a SECOND browser with its own profile opens the link and gets the same rug with its joints closed |
| `sound` | every cue rendered into an OfflineAudioContext and measured: the whistle really is two notes a fourth apart, the chime rises, the clack is budgeted |
| `layout` | every screen at five phone sizes, every group COUNTED before it is measured |

## What the screenshots found that the gates could not

Ten things, and they are the reason the plan makes looking a step rather than a
courtesy. The full list is in the plan's evidence ledger; the three worth
carrying to another game:

1. **A sprite rotated past a quarter turn is upside down.** A train running west
   had its chimney pointing at the floor. Mirror, do not turn over.
2. **The camera has to know where the chrome is.** Three separate versions of
   this: the tray, the goal line, and the win card, each of which took a band of
   the screen the camera then fitted the game behind.
3. **Scenery cannot chase a camera.** Three drafts placed the props inside
   whatever the camera was showing at that instant, and three times the camera
   moved afterwards.

## Where the numbers live

`CONFIG` at the top of the SIM export, frozen. `sim.js --over=KEY=VAL` runs any
sweep against an override without editing the shipped file, and throws on a key
it cannot find, so a typo in a tuning pass can never silently measure the
shipped numbers and call them tuned.
