# HANDOFF AIRWORTHY, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-AIRWORTHY.md`
(Stephen's design, read in full) plus the fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then this file, then the design. Where they differ,
this file wins; every difference is in section 3 with its reason.
**Game folder:** `satellites/airworthy/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/airworthy/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-06 Opus: P0 step 1 done. `tools/check.js` exists with one gate that
  fails and the failure is in section 13. Next action: P0 step 2, the scaffold.
  Write CONFIG, MODEL, DERIVE, FLIGHT, WIND and CLASSIFY into
  `satellites/airworthy/index.html` between the SIM_EXPORT markers, exactly as
  section 4 spells them out, then `sim.js` with `--test`, `--fly` and `--medals`.

---

## 0. RULES OF ENGAGEMENT

Identical to `plans/fathom/HANDOFF-FATHOM.md` section 0 with `airworthy` for `fathom`: the fence is
`satellites/airworthy/**` plus this file's ledger; fenced `git add`, never `-A`; rebase before every push; never push
main; no dashes or exclamation points in player copy; 48 px rendered buttons proved by `elementFromPoint`; Sky Wolf Studio
singular; `.js` at runtime; `?v=` on every URL with `sw.js` bumped in lockstep; text 0.7 rem or larger; LOOKING IS PART OF
THE JOB; never wait on a human.

One law particular to Airworthy: **one source of truth for the plane.** `derive(foldSpec)` returns the physics parameters,
and the tunnel, the field, the readouts and the archetype namer all read that one object. The tunnel never lies about the
field because it cannot.

---

## 1. WHAT AIRWORTHY IS, AND WHY IT IS WORTH A NIGHT

From the design: *"Fold a paper airplane through real fold choices, nose weight, wing width, dihedral, trim tabs. Test it
in a wind tunnel where you can see the air. Then take it to the field, and here is the sacred part, between throws you trim
it, bending the elevators a hair, adding a paperclip, just like on the playground. Your folds are not cosmetics. A bad fold
porpoises across the gym exactly the way your real bad folds did in fourth grade."* Positioning line: **"Every crease
counts."**

Why it is worth a night: the category leader's own reviews ask for folding that matters and a more honest sim; the physics
is a 2D longitudinal glider model that a few hundred lines can carry; and the emotional core (the phugoid swoop and the "I
fixed it" trim) comes out of the equations for free, which means the P0 gate can literally assert the nostalgia. It is sixth
in the order because its three rooms make it wide; a night that lands P0 and P1 leaves a plane you can throw and fix, which
is the whole feeling, and the workshop and the tunnel follow.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| The pull back and release launch | `satellites/keepsies/src/input/pullback.js` (its header explains the shape) | Drag back from the plane, a power meter, let go and it goes the other way; angle from the drag vector, power from its length clamped; produces one `{angle, power}` the sim consumes |
| Deterministic sin, cos, atan2 | `satellites/keepsies/src/core/dmath.js` | Optional here (section 3.5); copy if ghosts are ever shared between phones |
| Share by link | `satellites/blockspace/index.html` lines 1060 to 1080 | `#p=` with the foldSpec (nine small integers) base64url; the recipient's workshop folds it |
| Multi pointer, pinch | `satellites/abduct-a-chameleon/index.html` `pointers` Map, `tryStartPinch` 1298 | The tunnel's dials and the field's camera pinch |
| Export a canvas the phone can keep | `satellites/attic/index.html` lines 1446 to 1466 | The hangar's "plane card" share |
| Manifest with an orientation field | `satellites/blackout/manifest.webmanifest` | `"orientation": "any"` here (section 3.2) |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | as listed in `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `airworthy` in place of `fathom` |
| A level with an authored solution | `plans/fathom/HANDOFF-FATHOM.md` section 4 | Each challenge carries a `reference` foldSpec that earns gold; `sim.js --medals` uses a bank of them |

Not inherited: any physics library (the model is a page of equations), three.js.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **Every room works in portrait; landscape widens the field.** The design proposes a portrait workshop and landscape
flight with polite letterboxing. The arcade frames every game in a portrait phone and the studio's law is portrait, one
hand; a landscape only field would letterbox to a strip inside that frame. So: the workshop is portrait; the tunnel and the
field are laid out for portrait (the camera leads the plane along the flight, the readouts stack) and when the phone is
turned the same rooms widen their view. No forced rotation, no "turn your phone" card. The manifest says `any`. Stephen's
open question stays in the morning report with a shot of each.

3.3 **The fold precision mini skill stays, with the Steady Hands toggle.** The design recommends it; taken. Steady Hands
auto centres every fold and the veer source becomes the aileron split alone.

3.4 **No mid flight control in the slice.** The design recommends it; taken. The gust whistle is not built.

3.5 **The flight model uses `Math`; determinism is per device.** Unlike Doohickey, a 20 s glide is not chaotic and there is
no leaderboard; ghosts and medals live on the phone that flew them. The sim is still fixed step, seeded and free of
`Math.random`, so replays on one phone are identical, and a later share of ghosts between phones would swap in `dmath`.

3.6 **The model's numbers are written down.** Section 4 gives every coefficient the design leaves as prose. A number that
sounds wrong changes in `MODEL` and is logged; the structure does not.

3.7 **Archetypes are measured, and the measurement is the test.** Section 4's classifier; the P0 suite asserts each named
foldSpec produces its archetype.

3.8 **Medals are earned from the sim, not guessed.** `sim.js --medals` flies a bank of 40 foldSpecs (the archetype set plus
random ones) through every challenge and sets bronze, silver and gold at the 40th, 70th and 90th percentile of the results;
the thresholds are written into LEVELS by that tool and TEST asserts they are ordered and that the reference plane earns
gold.

3.9 **Wind fields are additive and nothing else.** The design says so; the code has no special case for a fan or a thermal:
relative airspeed is `v - wind(x, y)` and the forces follow.

3.10 **The slice has the Gym and the Backyard, with Distance, Airtime and Accuracy.** Stunt and the Canyon and the Stadium
are later, as the design orders.

3.11 **Copy.** No dashes, no exclamation points. Archetype names: The Dart, The Floater, The Cruiser, The Porpoise, The Lawn
Dart, The Tumbler. The result line after a flight names the archetype once, the first time, in the design's voice: "This one
is a Cruiser."

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/airworthy/`):

```
index.html            the game
sim.js                --test, --fly=<foldSpec>,<course>,<angle>,<power> (prints the trace), --medals (writes thresholds)
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/throw.mjs  test/fold.mjs  test/tunnel.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers: `CONFIG, RNG, MODEL, DERIVE, FLIGHT, WIND, COURSES, CLASSIFY, WORKSHOP, TUNNEL, FIELD, HANGAR, SHARE, AUDIO,
INPUT, SAVE, TEST, BOOT`. `SIM_EXPORT` markers wrap CONFIG through CLASSIFY.

**CONFIG (frozen):**

```
GAME_ID 'airworthy'  SAVE_KEY 'lw_airworthy_v1'  SAVE_V 1
SIM_HZ 120  FLIGHT_MAX_S 40  GROUND_Y 0
LAUNCH_V [4, 12] (m/s by power 0..1)  LAUNCH_ANGLE [-10, 40] (degrees)
PRECISION_ZONE 0.18 (fraction of the bar)  PRECISION_SWEEP_S 1.2
TRIM_ELEV_DEG [-12, 12]  TRIM_AIL_DEG [-8, 8]  CLIP {none:0, nose:0.001, mid:0.001} (kg)
GHOST_SAMPLE_HZ 20  HANGAR_MAX 24
```

**MODEL** (the foldSpec is nine parameters; `derive` turns them into physics):

foldSpec: `{nose: 'blunt'|'pointed'|'locked', noseFolds: 1..3, wing: 0..1 (narrow to wide), fins: 'none'|'up'|'down',
dihedral: 0..1 (flat to V), precision: 0..1 (from the mini skill, 1 is perfect), elev: deg, ail: deg, clip:
'none'|'nose'|'mid'}`.

`derive(spec)` returns, in SI:
- `mass = 0.0045 + 0.0007 * (noseFolds - 1) + (nose == 'locked' ? 0.0006 : 0) + CLIP[clip]` kg.
- `S = 0.010 + 0.020 * wing` m² (wing area); `chord = 0.12 + 0.04 * wing`; `AR = (0.28)^2 / S` clamped to [1.2, 3.5].
- `CD0 = {blunt: 0.020, pointed: 0.012, locked: 0.015}[nose] + {none: 0, up: 0.004, down: 0.002}[fins]`.
- `k = 1 / (PI * 0.85 * AR)` (induced drag factor); `CLa = 2 PI * (AR / (AR + 2))` per radian; `alphaStall = 12 deg -
  2 deg * clamp((mass / S - 0.25) / 0.25, 0, 1)` (wing loading lowers it).
- `cg = 0.42 - 0.04 * (noseFolds - 1) - (nose == 'locked' ? 0.03 : 0) - {none: 0, nose: 0.10, mid: 0}[clip]` as a fraction
  of chord from the nose; `cp = 0.25 + 0.03 * wing`; `margin = cp - cg` (positive is stable).
- `Cm0 = -0.02`, `CmElev = -0.012 per degree * elev` (trailing edge up is negative elev and pitches nose up), `Cmq = -8`
  (pitch damping), `I = mass * chord^2 * 0.08`.
- `yawStab = {none: 0.5, up: 1.0, down: 0.2}[fins]`; `rollStab = 0.3 + 0.7 * dihedral`;
  `asym = (1 - precision) * 0.6 + abs(ail) / 8 * 0.4` signed by `ail`.

**FLIGHT.** State `{x, y, vx, vy, theta (pitch), q (pitch rate), veer}`. Each step at `SIM_HZ`: `rel = v - wind(x, y)`;
`V = |rel|`; `alpha = theta - atan2(rel.y, rel.x)`; `CL = alpha < alphaStall ? CLa * alpha : max(0.3, CLa * alphaStall -
(alpha - alphaStall) * 2.5)` (the stall drop); `CD = CD0 + k CL^2`; `qd = 0.5 * 1.2 * V^2`; lift `qd S CL` perpendicular to
`rel`, drag `qd S CD` against it, gravity; `M = qd S chord (Cm0 + margin * CL + CmElev + Cmq * q * chord / (2 V))`; integrate
semi implicit Euler. Veer: `veer += (asym * V * 0.02 - rollStab * veer * 0.5) * dt`; `|veer| > 1` ends the flight as a
spiral; the render eases the plane between three depth lanes by `veer`. Ground contact ends the flight. Events: `launch`,
`stall`, `land`, `ring`, `zone`.

**WIND.** Fields per course: `fan {x, y, dir, speed, width}` (a steady jet, falls to zero past `width`), `thermal {x,
radius, up}` (rising column), `gust` (seeded, per challenge day, `mixSeed(dailySeed, course)`), summed.

**COURSES.** The Gym (still air; a distance line, two banners to clear, a desk zone), The Backyard (a box fan, a grill
thermal, two clothesline gaps). Each with challenges `{kind: distance|airtime|accuracy, medals:{bronze, silver, gold},
reference: foldSpec}` and props for the render.

**CLASSIFY.** From the first 4 s of a flight trace: `descent = mean glide angle`, `pitchVar`, `period` (time between
successive pitch maxima), `stalls`. The Lawn Dart: descent over 35 degrees. The Tumbler: two or more stalls. The Porpoise:
pitch amplitude over 8 degrees with period in [1.2, 3.5] s. The Floater: descent under 8 degrees and `V` under 5 m/s at 3 s.
The Dart: descent 8 to 20 degrees and `V` over 7 m/s. The Cruiser: everything else stable.

**WORKSHOP.** A portrait sheet of paper drawn top down; each fold choice is an animated crease with a paper sound; the
precision bar for each crease (a marker sweeps in `PRECISION_SWEEP_S`, tap to stop; inside `PRECISION_ZONE` is crisp);
Steady Hands in settings. The spec preview names the archetype only after the first flight.

**TUNNEL.** The plane in profile in a glass chamber; 200 pooled particles advected left to right, their paths bent above
the wing by `CL` (curvature), shed behind the nose by `CD0` (jitter), and detached over the wing past `alphaStall`; live
lift and drag vectors; the wind lever (3 to 15 m/s) and the angle dial (-5 to 20 degrees); chalk readouts: glide ratio
`CL/CD` at the trimmed alpha, wing loading `mass g / S`, stability margin (green over 5 percent of chord, amber 0 to 5, red
under 0), predicted archetype; the trim dials.

**FIELD.** The course diorama, the slingshot launch, the flight camera leading the plane, the dotted pencil trail, the ghost
of the best flight, the result card with Trim and Throw Again, medals.

**HANGAR.** Saved designs (`HANGAR_MAX`), each with its archetype, best results per challenge, and a share link.

**AUDIO.** Web Audio, synthesised: paper crease and snap, the tunnel's filtered noise whose pitch and turbulence track `V`
and the stall margin, the field's air rush by speed, a flutter buzz when `|veer|` grows, one kid clapping on a medal.

**INPUT.** Pointer events; the slingshot from `pullback.js`; taps for creases; drags for dials; pinch in the field.

**SAVE.** `lw_airworthy_v1`: `{v, hangar:[specs with results], medals, ghosts:{challengeId: trail}, settings:{sound,
motion, steadyHands}, seen:{how}}`. Read, modify, write.

**TEST.** Deepwell's harness; floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The model, headless, with the nostalgia as a test (about 1.5 hours)

1. Scaffold. MODEL, DERIVE, FLIGHT, WIND (still air), CLASSIFY.
2. `sim.js --test`, each with a named foldSpec launched at 8 m/s and 5 degrees:
   - forward CG (`noseFolds 3, pointed, wing 0.5, elev 0`) classifies as The Cruiser or The Dart, with descent between 8 and
     25 degrees and no stall;
   - slightly aft CG with trim (`noseFolds 1, blunt, wing 0.6, elev 6`) classifies as The Porpoise, with a period in [1.2, 3.5]
     s and amplitude over 8 degrees (**this is the product; if this fails, the model is wrong, not the test**);
   - far aft (`noseFolds 1, blunt, wing 0.9, elev 12, fins none`) classifies as The Tumbler (two or more stalls);
   - nose clip (`noseFolds 3, pointed, clip nose`) classifies as The Lawn Dart;
   - wide wing, forward CG, low speed (`wing 1.0, noseFolds 2, launched at 5 m/s`) classifies as The Floater;
   - symmetric fold (`precision 1, ail 0`) has `veer` under 0.01 all flight; `ail +6` veers positive and `ail -6` negative;
     dihedral 1 halves the veer of dihedral 0 at 3 s (within 20 percent);
   - a headwind of 3 m/s from a fan raises the plane's altitude at 1 s compared with still air (it balloons);
   - a thermal under the path extends airtime by at least 20 percent;
   - the same spec, launch and seed give the same trace; `derive` is pure.
3. Watch it fail: set `Cmq` to 0 and The Porpoise assertion goes red (undamped); set `k` to 0 and The Floater goes red.
4. `sim.js --fly` of the Porpoise spec pasted into the ledger: `t, x, y, theta` every 0.25 s, so a human can see the swoop
   in numbers.

### P1. Throw it, watch it, fix it (about 2.5 hours)

1. FIELD with a hardcoded plane in The Gym: the diorama, the slingshot, the flight camera, the trail, the result card.
2. **Stop and feel test.** Throw the Porpoise spec. Shoot `docs/shots/p1-swoop.png` as a 6 panel strip at 0.5 s intervals.
   Open it. The design says the swoop must make you smile with recognition; if the strip reads as a sine wave, the camera
   lead and the plane's pitch drawing are wrong, and you fix them before the trim loop.
3. The trim loop: the result card's TRIM (elevator, aileron, clip) and THROW AGAIN, instant.
4. **Second feel test.** Fix the Porpoise with two elevator bends (`-4` then `-4`); it should become a Cruiser. Shoot
   `p1-fixed.png`. The "I fixed it" moment is the second product.
5. `test/throw.mjs` (browser, real pointers at 375x667 and 667x375): a real pull back of 90 px at 20 degrees launches (the sim
   logs `launch` with a power near 0.6 and an angle near 20); the plane's screen x advances; the result card appears at
   landing with the archetype line; a real tap on TRIM then a real drag on the elevator dial then THROW AGAIN relaunches
   within 2 s and the second flight's classification differs from the first when the first was The Porpoise.
6. `test/layout.mjs`: 48 px in both orientations; the bottom left 120x120 empty in the field.

### P2. The workshop and the hangar (about 2.5 hours)

1. WORKSHOP: the paper, the six creases with animation and sound, the precision bar, Steady Hands, the spec preview.
2. HANGAR: save, name, the archetype after the first flight, results, a share link, delete with a confirm.
3. `test/fold.mjs` (browser): real taps through the six creases produce a foldSpec whose fields are the tapped choices; a
   real tap on the precision bar at the centre reads `precision` over 0.9 and one at the edge under 0.5; Steady Hands makes
   it 1; SAVE puts the spec in the hangar; the `#p=` link round trips in a fresh context and the workshop shows the same
   creases.
4. Shots: `p2-workshop.png`, `p2-crease.png`, `p2-hangar.png`.

### P3. The tunnel, the backyard, the medals (about 2.5 hours; where a night may stop)

1. TUNNEL: the particles, vectors, lever, dial, readouts, stall demonstration, trim dials.
2. The Backyard with its fan and thermal; the veer lanes; Distance, Airtime and Accuracy on both courses; `sim.js --medals`
   writing the thresholds; ghosts.
3. `test/tunnel.mjs` (browser): dragging the angle dial past the stall angle collapses the lift vector's drawn length by at
   least half and the readout's margin colour matches `derive`; the tunnel's glide ratio equals the field's measured ratio
   for the same spec within 15 percent (one source of truth, measured).
4. `sim.js --test` grows: thresholds ordered; the reference spec earns gold on every challenge; no single spec earns gold
   on all six (the design's "one plane wins everything" hole; if one does, retune the reference set).
5. AUDIO; `tools/shots.mjs` at 412x915, 375x667, 320x568, 915x412; `tools/thumb.mjs` (mid swoop); `ART_ASSETS.md`,
   `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (portrait first; 48 px rendered at 375 wide and at 667 wide)

- **Title.** FLY (56 px, to the field with the hangar's last plane or a starter Cruiser), FOLD (48, the workshop), TUNNEL
  (48), HANGAR (48). The positioning line. Bottom left empty.
- **Workshop.** The paper fills the middle; the current crease's two or three choices as 56 px chips under it; the precision
  bar when a crease is made; NEXT and BACK 48 px; SAVE at the end.
- **Tunnel.** The chamber in the upper half; the lever and dial as 48 px tall sliders; the slate readouts; the trim dials;
  FLY IT (56 px).
- **Field.** The course; a pull back anywhere near the plane launches; during flight nothing; the result card: distance or
  time or zone, the medal, the archetype line (first time), TRIM (48), THROW AGAIN (56), CHALLENGES (48).
- **Trim panel.** Elevator and aileron as 48 px tall sliders with detents at 2 degrees, the clip as three 48 px chips,
  DONE.
- **Hangar.** Cards 72 px tall: name, archetype, medals; tap for results, FLY, SHARE, DELETE.
- **Settings.** Sound, Motion, Steady Hands, About: "Sky Wolf Studio".

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the game never waits on it)

The plane is drawn by code (creases, translucency on high arcs) and stays drawn, because it is re-folded per spec. Four
sheets in `plans/airworthy/ART-PACK-AIRWORTHY.md` (a copy in 012Assets as `Airworthy — Art Pack`): two course backdrops,
a paper texture, an icon.

| File | Used for | Delivered | In game |
|---|---|---|---|
| `gym-backdrop.png` | The Gym's far layer, parallax | 21:9 | `art/gym.jpg` 1600x686 q80 |
| `backyard-backdrop.png` | The Backyard's far layer | 21:9 | `art/backyard.jpg` 1600x686 q80 |
| `paper.png` | the workshop sheet, tiled | 1:1 tile | `art/paper.jpg` 1024x1024 q75 |
| `icon-mark.png` | PWA icon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Airworthy", ds:"Fold a paper airplane crease by crease, see the air move over its wings in a wind tunnel, throw it across the gym, then bend the elevators a hair and throw it again. Every crease counts.", cat:"creative", url:"/satellites/airworthy/?v=<stamp>", ic:"✈️", thumb:"/portal-assets/thumbs/airworthy.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED; `test/throw.mjs` passed with
real pointers; the swoop strip was opened and judged.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9.
- The angle of attack is the difference between where the nose points and where the air comes from, not the pitch angle;
  the first version of every glider sim gets this wrong and flies like a rocket. The Porpoise assertion catches it.
- `V` near zero at the top of a stall divides the damping term by zero; floor `V` at 0.3 m/s in the moment equation.
- Degrees in the spec and the UI, radians inside FLIGHT; convert at the edge of `derive` and nowhere else.
- A slingshot that launches on `pointerup` anywhere launches when the player taps a button; the pull back must start within
  60 px of the plane and exceed 20 px before a release counts.
- The precision bar's marker is timed by `requestAnimationFrame`; under a stalled frame a tap lands late and reads unfair.
  Judge the tap against the marker's position at the tap's `timeStamp`, not at the next frame.
- The camera leading the plane must not lead it into the ground; clamp the view to the course and let the plane approach the
  frame edge on descent.
- The tunnel's particles are a picture of the numbers, not a fluid; keep the mapping monotonic (more `CL`, more bend) or the
  stall demonstration teaches the wrong thing.
- The ghost trail is sampled at 20 Hz and drawn smooth; a ghost drawn at 120 Hz is a save that grows without bound.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's four open questions take these answers tonight:

1. **Name: AIRWORTHY.** Stephen's folder and title; the alternates (Every Crease Counts, Field Day, The Fold, Maiden) stay in
   the morning report.
2. **The precision mini skill: kept, with Steady Hands.** Section 3.3.
3. **Mid flight control: none in the slice.** Section 3.4.
4. **Orientation: portrait everywhere, landscape widens.** Section 3.2, and it is the one answer here that departs from the
   design's recommendation, for the arcade's sake; Stephen decides with the shots.

Yours without asking: every coefficient inside the model once the P0 suite is green, the diorama look, the course props, the
sounds.

Stephen's, never guessed: price, store, the name, the classroom pack, anything with money.

---

## 11. STEPHEN ONLY

The phone: fold a bad one on purpose, throw it, watch it porpoise, fix it with two bends. That is the review. The four art
sheets when the Midjourney month allows.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1.5 h, P1 about 2.5 h, P2 about 2.5 h, P3 about 2.5 h: about 9 hours. Expect 4,500 to 5,500
lines. **Where a single night stops well:** the end of P1 (a plane you can throw and fix in the gym) is the whole feeling
and an honest tech demo; the end of P2 (the workshop and the hangar) is a game. The tunnel and the backyard are the second
session. If the clock says P1 cannot finish, land the throw and the result card and skip the trim panel's aileron and clip;
the elevator alone fixes the Porpoise.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, the gate that fails first (2026-09-06)

```
$ node tools/check.js
sim             FAIL  0s

--- sim (wanted: AIRWORTHY TEST OK) ---
Error: Cannot find module '/workspaces/lucid-winds/satellites/airworthy/sim.js'

1 GATE FAILED
```

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `throw, fold,
tunnel, layout`.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the Porpoise trace**,
pasted.
