# HANDOFF AIRWORTHY, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-AIRWORTHY.md`
(Stephen's design, read in full) plus the fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then this file, then the design. Where they differ,
this file wins; every difference is in section 3 with its reason.
**Game folder:** `satellites/airworthy/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/airworthy/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-06 Opus: **P0, P1, P2 and P3 are DONE and pushed.** Eight gates, 123
  sim assertions, and every assertion in every gate watched to fail at least
  once. The morning report is at the top of section 15, the ledgers are in
  section 13 and every call is in `satellites/airworthy/docs/DECISIONS.md`.
  Sections 6 (THE SCREENS) and 4 (ARCHITECTURE LAW) have since been read clause
  by clause against the shipped file and everything they named that was missing
  is built: the result card's CHALLENGES button, the archetype line named once,
  the trim panel's two degree detents, medals on the hangar cards (which needed
  a hangar entry to remember what it won), the flight's `ring` and `zone`
  events, and pinch to pull the room back in the field.
  There is now a ninth gate, `test/play.mjs`, which plays one whole session with
  nothing but a thumb, and it found three dashes in the shipped game that the
  lint could not see because they were computed at run time.
  **Next action:** nothing is half built. The plan is complete through P3 and
  sections 4, 6 and 10 are closed. 129 sim assertions and nine gates. What is open is in the morning report under "what is
  thin": no painted art, the Stunt and Canyon and Stadium courses the design
  names are not built, nobody has played it on a phone and nobody has HEARD it.
- 2026-09-06 14:17Z (a second builder, 40 minutes): **THE CANYON AND THE
  STADIUM ARE BUILT**, courses three and four in the design's order
  (`ea306f66`, `ddf4c63f`). Two wind kinds (`ridge` lifts along a wall, `sink`
  drops in its lee, both a band of the floor that fades over its last metre),
  a swirl that is part of the stadium's ground, four challenges (canyon-hang,
  canyon-bar, stadium-far, stadium-hang) whose thresholds `sim.js --medals
  --write` flew forty folds for (best plane takes 6 of 10 golds, the tool
  accepted it), the dressing for both rooms (a far wall that climbs to nine
  metres with strata traced off its own silhouette, boulders and scrub; a six
  tier stand with a roof edge, masts every eight metres, hoardings, a mown
  pitch) and the ridge and sink drawn from the fields windAt sums. Sim 160
  assertions (was 129). `test/challenge.mjs` lists ten cards and reaches the
  canyon and the stadium. Shots `docs/shots/p4-{canyon,stadium}{,-tall}.png`
  at 375x667 and 412x915, opened; the wall height, the wire strata, the missing
  masts and the mast head in the readout were seen and fixed. Stamp
  20260906d. `node tools/check.js`: ALL GATES PASSED, nine of nine.
  **Next action:** play the canyon on a phone: canyon-hang's best plane hangs
  10.9 s riding the first wall (wing 0.45, elev 2), which is the design's
  "long glide heaven" and may be too long to watch; if so shorten the first
  ridge (`x1: 9.5`) and re-run `--medals --write`. The stadium has no stunt
  scoring (the design's fourth challenge kind): rings are hung and `ringsHit`
  counts them, but a `rings` challenge kind with integer medals needs the
  medals tool taught about ties first. No art, unheard, unphoned still stand.

- 2026-09-06 evening, Fable, after Stephen's phone notes: **NOTHING PLANNED FOR OPUS YET.** His
  three additions (upgrades to unlock, themed rooms with a story, a dogfight) are Director call 34
  in `docs/DIRECTOR-CALLS-SEP06.md` with sizes; the ladder is first if he says yes, gated by
  medals and inside the economy law, one to two days. Landscape (his 42) already works and was
  shot tonight at 915x412; he is asked what he saw. What was DONE tonight is the entry below.

- 2026-09-06 evening, Fable, DONE after Stephen's phone notes (his words, then what was found):
  **"I can't pull it all the way back. Infuriating for a player."** A FAULT, reproduced on a
  412x915 shot before any change: the plane sat at 28 percent of the width, 115 px from the left
  edge, and a full pull was 140 px, so the thumb left the glass at 0.81 power with the meter never
  full. Three changes: the plane sits at 36 percent in portrait (`V.ox`, one number the whole
  room reads instead of `V.W * 0.28` typed six times), the full pull caps itself inside the room
  to the edge (`pullFull()`), and the pull is measured from where the thumb went down rather than
  from the plane, so a thumb that lands right of the plane no longer starts at full forward power
  with a wrong angle. "Maybe the plane needs to sit a little farther forward" is the same fix.
  **"When you click through again you should be able to reset the angle and throw like that."**
  THROW AGAIN in the gym re fired the last angle and power on its own; it puts the plane back in
  the hand now (`G.armed`) with the ghost of the best flight drawn from it. The trim panel's THROW
  IT still repeats the last throw on purpose, so two flights differ by the trim alone (call C8
  stands for the challenges).
  **"It doesn't give you any kind of tutorial or explanation on throwing."** The only hint was a
  13 px grey line in the hud at the top of the screen. A coach is drawn AT THE PLANE until the
  first flight has landed: a dashed pull running back from the tail with a thumb travelling along
  it, the words above the plane, clear of the music chip's corner.
  **"It should work in both landscape and portrait."** It does: shot at 915x412, full power
  reachable, the hud across the top. Asked him what he saw (call 35).
  ⛔ THE GATE THAT SHOULD HAVE CAUGHT THE PULL asserted power 0.64 for a 90 px pull, which is 90
  over the constant 140: a gate built from its constant. It asks for a moderate throw now, and
  three new assertions in `test/throw.mjs` (the edge pull fills the meter; THROW AGAIN arms rather
  than fires; the coach is drawn before the first flight and gone after) were each watched to
  fail under their own mutation (full pull back to 140; THROW AGAIN back to launch; the coach
  call emptied).
  Stamp `20260906h` in three places. `node tools/check.js`: ALL GATES PASSED, nine of nine. Live
  and verified by probe (seven markers, sw.js at h). Shots in the scratchpad were opened; the
  docs shots were not reshot.
  **Next action:** his thumb on the pull and THROW AGAIN; call 34 for the ladder.

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

### P0 steps 2 to 4, the model with the nostalgia as a test (2026-09-06)

```
$ node sim.js --test
PASSED 76 / FAILED 0   (total 76)
AIRWORTHY TEST OK
```

**The Porpoise, in numbers.** This is the product, and it is a phugoid: up,
over, down, up again.

```
spec  {"nose":"blunt","noseFolds":1,"wing":0.6,"fins":"none","dihedral":0.4,"precision":0.8,"elev":6,"ail":0,"clip":"none"}
mass 4.50 g   area 260 cm2   AR 3.02   margin 4.8 percent chord   stall 12.0 deg
launched at 5 degrees, power 0.5

     t       x       y   pitch       V   alpha
   0.01    0.06    1.60     5.6    7.50     0.0
   0.26    1.53    1.90    20.4    4.96     2.3
   0.51    2.44    2.27    29.7    3.12     4.3
   0.76    2.96    2.51    34.4    1.66    12.1
   1.01    3.30    2.44    21.8    1.78    61.6
   1.26    3.74    1.99    -9.5    3.14    34.8
   1.51    4.50    1.58   -11.7    3.56     3.9
   1.76    5.35    1.40    -3.9    3.36     4.4
   2.01    6.13    1.33     3.1    2.96     5.4
   2.26    6.80    1.33     8.7    2.46     7.4
   2.51    7.35    1.34    12.8    1.95    11.0
   2.76    7.79    1.28    10.7    1.92    35.8
   3.01    8.29    0.92    -7.5    2.95    30.7
   3.26    9.02    0.57    -9.1    3.35     4.4
   3.51    9.82    0.43    -1.9    3.13     4.9
   3.76   10.55    0.38     4.4    2.75     6.1
   4.01   11.18    0.37     9.4    2.28     8.4
   4.26   11.68    0.38    13.0    1.82    12.8
   4.51   12.12    0.24     5.4    2.20    39.2

lands at 12.45 m after 4.67 s, 3 stalls, veer 0.017
descent 7.4 deg, pitch swing 24.7 deg, period 1.75 s, speed at 3 s 2.74 m/s
=> The Porpoise

AIRWORTHY FLY OK
```

Read the height column: 1.60 up to 2.51, down to 1.33, level, then down again,
with the pitch swinging plus 34 to minus 12 to plus 13. Three stalls, a period
of 1.75 seconds, and it lands 12.5 metres away after 4.7 seconds. Two bends of
the elevator turn it into a Cruiser that goes 13.3 metres with its nose never
more than ten degrees past the wind.

**The six names, measured** (launched at five degrees, the floater and the dart
at their own throws):

```
name      class          desc   amp   per pk stl maxA  V3 Vmean  dist    t
cruiser   The Cruiser      5.2  11.1  3.95  2   0   10  3.1   3.8  17.7   4.8
porpoise  The Porpoise     7.4  24.7  1.75  3   3   62  2.7   2.9  12.5   4.7
tumbler   The Tumbler      8.4  24.8  1.25  4   4   77  2.1   2.5  10.9   4.7
lawndart  The Lawn Dart    8.9  13.2  0.00  0   0    2  5.8   5.8  10.3   1.8
floater   The Floater      8.5   5.5  0.00  1   0   12  2.3   2.3  10.8   4.7
fixed     The Cruiser      6.9   7.9  0.00  1   0   10  2.3   2.8  13.3   4.9
dart      The Dart         4.3  15.8  0.00  1   0    8  4.7   5.5  21.4   4.0
```

Four mutations watched to fail, each restored:

```
$ node sim.js --test --over=CMQ=0            (the pitch damping removed)
FAIL  the cruiser fold flies like The Cruiser (swing 92 deg ...)  [expected cruiser, got porpoise]
FAIL  the tumbler fold flies like The Tumbler (swing 195 deg ...) [expected tumbler, got porpoise]
FAIL  and its swing takes between 1.2 and 3.5 seconds (0.18 s)

$ node sim.js --test --over=CM_STALL=0       (the post stall pitch down removed)
FAIL  the porpoise fold flies like The Porpoise ...   [expected porpoise, got tumbler]
FAIL  the plane you start with is a porpoise          [expected porpoise, got tumbler]

$ # the induced drag factor set to zero
FAIL  a wide wing pays more induced drag for its lift (0.000 to 0.000)
FAIL  and at a trimmed glide it is a real share of the drag (0 percent)

$ # the stability term's sign flipped
FAIL  the cruiser fold flies like The Cruiser   [expected cruiser, got porpoise]
FAIL  the lawndart fold flies like The Lawn Dart [expected lawnDart, got porpoise]
FAIL  the dart fold flies like The Dart          [expected dart, got tumbler]
```

**THE MODEL AS THE PLAN WROTE IT DOES NOT FLY.** Every plane it names dives into
the floor inside a second, and the phugoid the whole game is built on does not
exist. The plan says, in section 5, that if the Porpoise assertion fails the
model is wrong and not the test, so here is every correction, each forced by a
measurement.

- **The pitch damping is stiff and explicit Euler cannot carry it.** A paper
  plane's moment of inertia is about nine millionths, so the damping term alone
  gives hundreds of radians per second squared per radian per second: at 120 Hz
  it multiplies the pitch rate by about minus six every step and the flight is
  Infinity inside a fifth of a second. The moment is split into the part that
  depends on the pitch rate and the part that does not, and the first is
  integrated implicitly. Same physics, unconditionally stable.
- **The stability sign is inverted.** The plan writes `Cm = Cm0 + margin * CL`
  with `margin = cp - cg` and calls positive stable. With a plus, a stable plane
  DIVERGES. It is minus: the moment about the cg falls as lift rises when the
  cg is ahead of the lift, and that is what stability is.
- **cp has to sit behind cg.** The plan puts cg between 0.24 and 0.42 of the
  chord and cp between 0.25 and 0.28, which makes every plane it names unstable,
  including the ones it calls Cruisers. A low aspect ratio flat plate carries
  its lift well back; 0.45 puts cp behind every cg the folds can produce, so a
  nose heavy plane is stable and a tail heavy one is not, which is the point of
  the folds.
- **Cm0 has to be positive** and is 0.0312, sized so a mid plane with no trim
  settles at a lift coefficient near a quarter. With the plan's minus 0.02 every
  plane trims to NEGATIVE lift.
- **Positive elevator is the trailing edge UP and pitches the nose up.** The
  plan's parenthetical says the opposite of its own formula. This is the reading
  that makes the plan's own porpoise spec porpoise and its two bends of minus
  four fix it, and it is what a child means by "bend the back up so it climbs".
- **A stalled wing pushes its own nose down.** Without that term a plane trimmed
  beyond its stall pitches up for ever, because the lift falls and the restoring
  term falls with it: the pitch goes from six degrees to a hundred and twenty
  and never comes back. That is not a porpoise, it is a slow loop. With it, the
  plane pitches up, stalls, is shoved down, picks up speed and pitches up again,
  which IS the porpoise.
- **The drag is a folded sheet of paper, not a sailplane.** The plan's 0.012 to
  0.020 give a glide ratio over twenty and a thirty metre flight across a gym.
  Tripled, the flights are eight to twenty two metres, which is the size of the
  room the game is set in.
- **The wing needs real authority.** At the plan's 0.010 to 0.030 square metres
  a wide winged plane's loading is only sixteen percent under a narrow one's,
  and a Floater flies exactly like a Cruiser: no classifier can tell them apart
  because there is nothing to tell.
- **The gentlest throw is 3 metres a second, not 4.** A wide winged floater
  trims at under three, so a floor of four means every throw in the game is at
  least half again its trim speed and it zooms and stalls: there is no way to
  throw a floater gently, and the Floater is one of the six names.
- **The archetype thresholds come from the model.** The plan asks for a Lawn Dart
  at 35 degrees of descent and a Dart over 7 metres a second, and this model
  produces neither for any fold: thrown from head height a paper plane glides at
  four to eleven degrees and travels at two to six metres a second. What
  separates the six is the mean speed, the pitch swing, the airtime, and above
  all how far past the stall the nose gets: a porpoise reaches 62 degrees of
  angle of attack and a tumbler 77, while their pitch swings are the same to
  within a tenth of a degree.
- **A wrap by `while` hangs the gate.** `while (a > PI) a -= 2 PI` on an angle
  that has gone to Infinity never returns, and the whole run hangs with nothing
  to read. It is arithmetic now, with a finite check in front of it.


### P1, throw it, watch it, fix it (2026-09-06)

```
$ node tools/check.js
sim             pass  0s
lint            pass  0s
throw           pass  4s
layout          pass  8s

ALL GATES PASSED
```

`test/throw.mjs` in both orientations: a real 90 px pull back at 20 degrees
launches at 19.9 degrees and 0.65 power, the plane goes down the gym, the card
comes up with the archetype on it, and a real tap on TRIM plus the elevator dial
plus THROW IT relaunches inside 66 milliseconds and turns the porpoise into a
cruiser.

Two mutations watched to fail:

```
$ # the pull back angle ignored
FAIL  landscape: at the angle the drag asked for (5.0 degrees, wanted 20)

$ # the trim dial wired to nothing
FAIL  landscape: the dial bends the elevators (6)
```

### The P1 shots, opened and read

**`p1-swoop.png`**, six panels at half second intervals, is the feel test and it
passes: the plane climbs to 2.8 metres with its nose high, levels at 2.3, noses
over at 1.6, and settles to 0.7, with the dotted pencil trail arcing behind it
and the floor and its metre marks in every frame. It does not read as a sine
wave.

**The first cut of that strip failed the test and it was the CAMERA, not the
model.** Tracking the plane's height as well as its distance glued it to one spot
in the frame and pushed the floor out of shot, so six panels showed a plane in
the middle of a beige rectangle and the swoop was visible only as a faint line.
The camera scrolls sideways and holds its height now.

Three faults still in it: the plane's attitude is hard to read after the first
panel, because at this size a paper dart is mostly a dark arrowhead; the trail
runs off the left edge in the later panels, so the beginning of the swoop is
lost; and the gym's windows are plain rectangles floating in beige rather than
anything that says room.

**`p1-result.png`** — the card over the gym: the name, the line, and the numbers,
with TRIM and THROW AGAIN side by side. Three faults: THROW AGAIN wrapped onto
two lines until it was told not to; the card covers the middle of the trail,
which is the thing the player just watched; and the plane at the end of its
flight is half behind it.

**`p1-fixed.png`** — the same plane after two bends: "The Cruiser. Steady all the
way down. This is the one you keep. 10.2 m in 3.2 s, 1 stall, glide 9 degrees."
Three faults: the trail behind it is a straight diagonal with none of the drama
of the porpoise, which is correct and makes a dull picture; the card hides most
of it; and nothing on the card says what changed, so a player who did not watch
closely has to infer that the trim did it.

**`p1-sling.png`** — the slingshot mid pull: a dashed line back to the finger, a
solid arrow forward along the launch angle, a power bar and the angle in degrees.
Three faults: the arrow and the dashed line cross each other at the plane and the
crossing is muddy; the power bar sits below the plane where a thumb covers it;
and there is no mark for what a normal throw is, so the bar has no scale a player
can read.

**`p1-portrait.png`** — the same gym at 375 by 667. Three faults: the gym is a
narrow slice, so the plane leaves the frame almost at once and the camera does
all the work; the distance marks are the only clue to how far it has gone; and
there is a great deal of empty ceiling above the flight.


### P2, the workshop and the hangar (2026-09-06)

```
$ node tools/check.js
sim             pass  0s
lint            pass  0s
throw           pass  4s
fold            pass  9s
layout          pass  9s

ALL GATES PASSED
```

`test/fold.mjs` folds a whole plane with a real thumb in both orientations: it
taps into the workshop, walks all six creases tapping the second chip of each
and pressing the bar in the middle, and checks that what comes out is the nine
numbers that were tapped. Then a press at the edge of the bar (a sloppy crease,
0.06 out of one), Steady Hands (every crease perfect and no bar to hit), SAVE
into the hangar, and the `#p=` link opened in a FRESH context with every fold
intact and the workshop showing those creases.

Four mutations watched to fail, each restored:

```
$ # the chips wired to nothing
FAIL  portrait: the spec is the choices that were tapped: fins is none, tapped up, dihedral is 0.4, tapped 0.5

$ # every crease scored perfect however it was pressed
FAIL  portrait: a press at the edge is a sloppy crease (1.00)

$ # the share link drops the wing width
FAIL  and every fold came through: wing

$ # the hangar never saves
FAIL  portrait: saving puts it in the hangar (0)
```

**Two layout faults the gates caught.** In landscape the workshop's chrome took
307 pixels of a 375 pixel screen and there was no paper left to fold; it is a
column down the side now, which is what the plan's "landscape widens the same
room" means for a portrait workshop. And the "N of 6 creases pressed" label was
centred on the window, whose middle in landscape sits behind that column.

**One fault in the test hook rather than the game.** It returned the gym's spec
while the workshop was editing its own, so every fold in the workshop looked
like it had done nothing and three assertions went red on correct code. The hook
returns the spec you are working on.

### The P2 shots, opened and read

**`p2-workshop.png`** — the sheet with its centre crease, two nose fold
triangles, the wing folds with arrows showing which way the paper goes and the
winglet tabs, over "CREASE 4 OF 6", the three chips, the precision bar and the
running spec. Three faults: the nose fold triangles are drawn with dashed lines
that appear to escape the top edge of the paper; the winglet tabs read as two
small pale windows rather than folded tabs; and the spec line under the bar is
small and grey for something that is the whole point of the choices above it.

**`p2-crease.png`** — the moment after a press: the chosen chip filled blue, the
bar reading "pressed, 83 out of a hundred", the marker parked in the zone. Three
faults: the number is the only feedback, and a crease that scores 83 looks
exactly like one that scores 100 on the paper itself; the bar keeps its label
after the press when it could say what to do next; and there is nothing between
83 and a shrug to tell the player whether that was good.

**`p2-workshop-wide.png`** — the same room turned sideways: paper on the left,
chrome in a column on the right. Three faults: the back arrow overlaps the top
left corner of the paper; the paper is tall and narrow in a wide window, so
there is dead space either side of it; and the two rooms are separated by a
plain rule rather than anything that says the chrome is a workbench.

**`p2-hangar.png`** — three planes, each a plan view from above, with its name,
archetype and best throw, the selected one ringed in blue. Three faults: the
winglets are drawn at the tail and overlap the trailing edge, so they do not
read; the nose folds cluster near the tip as a bundle of lines; and two planes
with wings 0.15 and 0.5 apart are only subtly different at card size.

---

### P3 step 1 ledger, the wind tunnel (2026-09-06)

`node test/tunnel.mjs`

```
  ok    the title screen offers the wind tunnel and a thumb lands on it
  ok    and it opens the tunnel
  ok    the chamber has real room on a 375 wide screen: 355 by 277
  ok    #dialWind is reachable and 48.0 px tall (the floor is 48)
  ok    #dialAlpha is reachable and 48.0 px tall (the floor is 48)
  ok    #dialTunElev is reachable and 48.0 px tall (the floor is 48)
  ok    #dialTunAil is reachable and 48.0 px tall (the floor is 48)
  ok    #btnTunTrim is reachable and 56.0 px tall (the floor is 48)
  ok    #btnTunFly is reachable and 56.0 px tall (the floor is 48)
  ok    two hundred streaks are pooled, not allocated in the frame (200)
  ok    and the air in it moves: eight streaks travelled 0.412 chamber widths in six frames
  ok    the dial really moved, onto the peak and then deep past it: 11.5 then 27.5 degrees against a stall at 12.0
  ok    and the tunnel knows which side it is on
  ok    the lift arrow is at its longest on the peak (74.8 px)
  ok    and past the stall it collapses by at least half: 74.8 px to 29.6 px
  ok    while the drag arrow grows rather than shrinking: 13.0 px to 19.0 px
  ok    the stability row is coloured by derive: margin 4.80 percent reads "mid" and derive says "mid"
  ok    and it says it without a dash: "5 pc twitchy"
  ok    the slate says 5.83 to 1 and the field flew 5.83 to 1, off by 0.1 percent  {"nose":"pointed","noseFolds":3,"wing":0.5,"elev":0}
  ok    the slate says 7.84 to 1 and the field flew 7.84 to 1, off by 0.0 percent  {"nose":"pointed","noseFolds":3,"wing":0.35,"elev":2}
  ok    the slate says 4.32 to 1 and the field flew 4.32 to 1, off by 0.1 percent  {"nose":"locked","noseFolds":3,"wing":0.15,"elev":0}
  ok    the slate says 3.20 to 1 and the field flew 3.21 to 1, off by 0.1 percent  {"nose":"blunt","noseFolds":3,"wing":0.45,"elev":0,"fins":"up"}
  ok    the slate says 7.55 to 1 and the field flew 7.55 to 1, off by 0.0 percent  {"nose":"pointed","noseFolds":2,"wing":0.25,"elev":0}
  ok    and it was measured on 5 different planes, not one
  ok    TRIMMED ANGLE puts the dial on the angle the plane settles at: dial 11.5, trim 11.76
  ok    a press near the low end of the elevator dial bends it down: -10
  ok    and the trimmed angle comes down with it: 11.76 to -6.88 degrees
  ok    FLY IT goes to the field
  ok    and it takes the elevator you just bent with it (-10)
  ok    no page errors

TUNNEL OK
```

`node tools/check.js`

```
sim             pass  0s
lint            pass  0s
throw           pass  4s
fold            pass  8s
tunnel          pass  3s
layout          pass  9s

ALL GATES PASSED
```

**Every new assertion watched red before it was believed.**

The two the room is FOR:

```
$ (the tunnel given its own lift curve, CLt = D.CLa * at * 1.22)
  ok    the slate says 6.59 to 1 and the field flew 5.83 to 1, off by 13.1 percent
  FAIL  the slate says 5.02 to 1 and the field flew 4.32 to 1, off by 16.3 percent
  FAIL  the slate says 3.75 to 1 and the field flew 3.21 to 1, off by 16.9 percent

$ (a wing that keeps its lift past the stall, liftCoefficient returns D.CLa * D.alphaStall)
  FAIL  and past the stall it collapses by at least half: 74.8 px to 78.1 px

$ (a slate that colours the margin by mood, the row hard coded to 'good')
  FAIL  the stability row is coloured by derive: margin 4.80 percent reads "good" and derive says "mid"
```

And the two that replaced the tied one in the sim:

```
$ node sim.js --test --over=CM_STALL=0
  FAIL  a tumbler stalls at least twice (1)
$ node sim.js --test --over=CMQ=-40
  FAIL  a tumbler stalls at least twice (1)
$ (the tumbler fixture given a narrow wing and a hard throw)
  FAIL  and it pays more for it than a porpoise does (10.1 m against 9.5 m)
```

**The drag arrow shrinking past the stall was a hole in the FLIGHT MODEL, not a
drawing bug.** Induced drag follows CL and CL falls in a stall, so a separated
wing was getting cheaper to push through the air. `CD_STALL` at 0.45 per radian
past the stall fixes it; the sweep and everything it moved is in
`docs/DECISIONS.md`.

**Shots, opened and read.** `docs/shots/p3-tunnel.png`,
`p3-tunnel-stall.png`, `p3-tunnel-dive.png`, `p3-tunnel-wide.png`,
`p3-tunnel-320.png`. Eight faults found by looking and fixed:

1. The chamber was a 160 px letterbox on a 667 screen: the panel's seven slate
   rows and four stacked dials ate two thirds of the room. Paired into four and
   two, the glass now takes 46 percent.
2. The streaks were one pixel specks. Drawn frame to frame they are a smear on a
   fast machine and dots on a slow one. Now each is drawn ALONG the local flow
   and as long as the flow is fast, so the speed up over the wing is the picture.
3. Over half the streaks were seeded outside the glass and clipped, so the top of
   the chamber looked like still air when it was empty.
4. THE PLANE WAS MOUNTED BACKWARDS IN THE JET. The gym draws its nose at plus x
   because it flies left to right; the tunnel's air runs left to right past a
   plane that stands still, so the drawing has to be mirrored.
5. Dark ink on a dark chamber left a white sliver with no silhouette.
6. TRIMMED ANGLE rounded up onto the stall and answered itself with STALLED
   across the glass.
7. The four column slate truncated every value: "11.8 deg...", "The Porp...",
   "far more ...". A slate nobody can finish reading teaches nothing.
8. On a 320 wide phone the chamber was measured BEFORE the slate was put in the
   panel, so it came out 230 px tall, half of it hid under the panel, and the
   aeroplane was drawn in the part nobody can see.


### P3 step 2 ledger, the courses, the challenges and the medals (2026-09-06)

`node sim.js --medals`

```
forty planes, every challenge, thrown the way that challenge prescribes

  challenge    kind        bronze   silver     gold     best   the plane that took it
  gym-far     distance     10.00    11.60    14.80    18.90   wing 0.15 locked folds 3 elev 0
  gym-hang    airtime       2.10     2.30     3.40     3.77   wing 0.99 pointed folds 2 elev 8
  gym-desk    accuracy      1.90     0.86     0.08     0.00   wing 0.70 blunt folds 3 elev -4
  yard-far    distance      7.90     9.80    21.40    29.84   wing 0.26 pointed folds 1 elev 4 clip nose
  yard-hang   airtime       2.30     2.70     3.30     3.82   wing 0.99 pointed folds 2 elev 8
  yard-pool   accuracy      2.47     1.27     0.37     0.01   wing 0.38 locked folds 1 elev -6

the most golds any one plane in the bank takes: 3 of 6
AIRWORTHY MEDALS OK
```

`node test/challenge.mjs`

```
ok    the title offers the challenges and a thumb lands on it (48 px)
  ok    six of them are listed (6)
  ok    gym-far is reachable and 71 px tall
  ok    yard-hang is reachable and 71 px tall
  ok    and the list says what a medal wants before you fly
  ok    with no dash and no shouting in it
  ok    picking one takes you to the backyard for it (field, yard, yard-hang)
  ok    and the backyard has its fan and its thermal (2)
  ok    the throw button is there and reachable (56 px)
  ok    and a pull back on the canvas does NOT launch it, because the throw is set
  ok    the button does
  ok    from the mark
  ok    the result card comes up
  ok    named for the challenge, not the plane (Ride the grill)
  ok    and it is scored in seconds of air (3.62)
  ok    the line has no dash in it: "3.6 sGold, and your best is Gold"
  ok    a first flight leaves a ghost (41 points)
  ok    a worse plane scores worse (2.05 against 3.62)
  ok    and the ghost is still the better flight (41 points, unchanged)
  ok    the fold the medal tool named for the desk takes gold on it (0.01 m off, medal gold)
  ok    and it is kept
  ok    and the list shows it: "●The deskLand it on the deskbronze 1.9 · silver 0.86 · gold 0.08 m from the midd"
  ok    and it is still there after a reload ({"yard-hang":"gold","gym-desk":"gold"})
  ok    no page errors

CHALLENGE OK
```

`node tools/check.js`

```
sim             pass  0s
lint            pass  0s
throw           pass  4s
fold            pass  8s
tunnel          pass  3s
challenge       pass  3s
layout          pass  9s

ALL GATES PASSED
```

**Two design holes found by measuring, not by thinking.**

1. **An accuracy challenge with a free throw is not an accuracy challenge.** Best
   of three throws and any plane with the range simply throws softer until it
   lands on the mark, so landing on a mark asked nothing of the fold. One plane
   took gold in five of the six.
2. **Distance and airtime are the same challenge if the throw is free.** A good
   glider goes far AND hangs, so both were won by one fold. Each challenge now
   prescribes its throw: distance is flat and hard, airtime is lofted and gentle,
   the accuracy pair are fixed. The winners are now a wing of 0.15 and a wing of
   0.99, which is the trade off the workshop is for.

The suite gained an assertion for that, because the plan's own test (no fold
golds all six) PASSED in the broken state:

```
$ (throwsFor returning MEDAL_THROWS for every challenge, so the throw is free again)
  FAIL  and the same is true in the backyard (wings 0.26 and 0.30)
```

**Every new gate watched red.** The sim's:

```
$ (a gold nobody can reach)         FAIL  gym-far: the reference fold takes gold (18.90 against 40)
$ (medals out of order)             FAIL  gym-hang has its medals in order (3.4 2.3 2.1)
$ (a mark nowhere near the planes)  FAIL  gym-desk: the mark is where the planes come down
                                          (mark 17.5 m, the middle of forty lands at 8.5 m)
$ (air that is not the same twice)  FAIL  a challenge flies the same air every time, sideways
```

And the browser's:

```
$ (the sling allowed to override a prescribed throw)
  FAIL  and a pull back on the canvas does NOT launch it, because the throw is set
$ (the ghost overwritten every flight)
  FAIL  and the ghost is still the better flight (38 points, unchanged)
$ (medals not written to the save)
  FAIL  and it is kept
  FAIL  and it is still there after a reload ({})
```

**Shots, opened and read.** `p3-challenges.png`, `p3-yard.png`,
`p3-yard-wide.png`, `p3-yard-result.png`, `p3-desk.png`. What looking found:

1. The backyard's fence was two and a half metres tall across the whole frame,
   so the plane flew THROUGH the fence. It is waist height now.
2. The fan was a smudge and the thermal a scratch at the edge of the screen. The
   asks are "through the fan" and "find the warm air", so both are drawn from
   the very fields windAt sums, at a size you can aim at from the launch mark.
3. THROW IT sat in the middle of the course in landscape, on top of the grill,
   and stayed up during the flight and under the result card. It hides while the
   plane is in the air and moves to the right hand corner in landscape.
4. The result card sat exactly on the floor line, so where the plane came down,
   which is what a result IS, was behind the card.
5. The gym's banners were bare rectangles indistinguishable from the gym's
   windows, and the desk was a blue smear on the floor. A banner hangs off the
   top bar now and the desk has legs.
6. The thermal column was a rectangle with hard sides and read as a wall.


### P3 step 5 ledger, the sound, the sizes and the tile (2026-09-06)

`node test/sound.mjs`

```
ok    nothing opens an audio engine before a gesture
  ok    a tap on the tunnel opens it (running)
  ok    and the rush is one held voice, not a note a frame (1)
  ok    more wind is more rush (0.0208 to 0.1688)
  ok    and a higher one (633 Hz to 1185 Hz)
  ok    and it is still one voice after all that
  ok    the dial is past the stall
  ok    and the rush opens out with it (Q 1.15 to 0.31)
  ok    with the paper buzzing (0.0000 to 0.0249)
  ok    the air rushes past a plane in flight (0.0558)
  ok    both are still in the air when the buzz is read
  ok    a sloppy fold with an aileron on it slides and a square one does not (veer 0.106 against 0.000)
  ok    and only the sloppy one buzzes (0.0058 against 0.0000)
  ok    and it all goes quiet when the plane is down
  ok    SOUND OFF turns it off
  ok    and nothing is left running under it (rush 0.0000, flutter 0.0000)
  ok    no page errors

SOUND OK
```

`node tools/check.js`

```
sim             pass  0s
lint            pass  0s
throw           pass  4s
fold            pass  8s
tunnel          pass  3s
challenge       pass  3s
sound           pass  6s
layout          pass  9s

ALL GATES PASSED
```

**All five sound assertions watched red**, two of them only after every backstop
was taken out, which is worth writing down: the first mutation of each pair
LOOKED like the gate was decoration and was actually a second guard doing its
job.

```
$ (the held voice recreated every frame)
  FAIL  and a higher one (689 Hz to 735 Hz)
  FAIL  and the rush opens out with it (Q 0.77 to 0.63)
$ (the stall not changing the rush)
  FAIL  and the rush opens out with it (Q 1.15 to 1.15)
$ (the flutter not wired to veer)
  FAIL  and only the sloppy one buzzes (0.0000 against 0.0000)
$ (EVERY guard against opening the engine outside a gesture removed)
  FAIL  nothing opens an audio engine before a gesture
$ (EVERY guard against SOUND OFF removed from the held voices)
  FAIL  and nothing is left running under it (rush 0.0042, flutter 0.0048)
```

**Two real bugs the sound gate found in the code around it.**

1. The frame loop was opening the AudioContext, from the first paint, before
   anybody had touched the screen. Headless this is invisible because of the
   autoplay flag; on a phone that context is born suspended and stays that way.
2. The flutter was tuned to veers the game never reaches. Veer builds on a time
   constant of about seven seconds and a flight lasts three, so a buzz that
   started at 0.12 and needed 0.8 to be loud was a cue nobody would ever hear.

**Shots at the four sizes the plan names**, plus the tile:
`p3-412.png`, `p3-375.png`, `p3-320.png`, `p3-915.png`, `docs/thumb.png`.

What looking at 412 by 915 found, which no gate would have:

- **A tall phone is not a bigger phone.** Scaled by the width alone the flight
  sat in a two hundred pixel band at the bottom and two thirds of the screen was
  blank paper. The room is drawn closer on a tall screen, the floor is dropped
  to 86 percent, and the gym grew a ceiling: roof trusses with lamps hanging off
  them and a painted stripe down the wall. The ceiling is anchored to the FRAME
  and not to the world, which is the one thing in the game that is, and the
  comment in `drawCourse` says so and says why.
- The trusses were drawn with their apex ABOVE the roof line and poked up into
  the back button and the readout. They hang down now.
- The portal tile went through four framings. A whole room wide it was ninety
  percent empty paper with a banner in the middle; cropped tight at device ratio
  one it was a blurry aeroplane with a staircase for an edge; in the backyard it
  had three faint blue rules across it, which were the fan's jet. It is now a
  plane at the top of a hard throw, above the gym's high windows where the wall
  is plain, at three times the pixels.


### P3, closing section 6 against the built game (2026-09-06)

The phases were done; section 6, THE SCREENS, was not. Read clause by clause
against the shipped file, four things were missing and one was a real bug.

**Missing, now built.**

1. *"the result card: distance or time or zone, the medal, the archetype line
   (first time), TRIM (48), THROW AGAIN (56), CHALLENGES (48)"*. There was no
   CHALLENGES button: from a result the only way back to the list was the back
   arrow and the title screen. Two rows now.
2. *"the archetype line (first time)"*. A challenge named the archetype never
   and free flight named it every time. It is named once, the first time you fly
   one, and then it gets out of the way of the score.
3. *"Trim panel. Elevator and aileron as 48 px tall sliders with detents at 2
   degrees"*. They stepped by one, with no detents at all.
4. *"Hangar. Cards 72 px tall: name, archetype, medals"*. The cards had no
   medals on them, and could not have: a medal was recorded against the
   CHALLENGE and nothing was recorded against the fold that won it. A hangar
   entry now carries its own medals and the shelf shows them as dots.

**And the bug looking found.** The cards were 56 by 44 rendered, and at that
size a wing of 0.15 and a wing of 0.99 are the same picture, which is the exact
fault P2 fixed by moving to a plan view and did not fix far enough. 76 by 58,
and the span drawn across the range the player actually has.

`node test/challenge.mjs` (the six new assertions at the end)

```
  ok    the result card offers a way back to the challenges (48 px)
  ok    and it goes there
  ok    the trim panel opens and the elevator is a 48 px slider (48 px)
  ok    and both trim sliders detent every two degrees: minus three landed on -2, five landed on 6
  ok    a fold saved out of the workshop lands in the hangar
  ok    and the medal it wins is written onto that fold, not just onto the challenge ({"gym-desk":"gold"})
  ok    and the shelf shows it: "KestrelThe Cruiser · 8.5 m● 1 of six"
  ok    a challenge names the archetype the first time you fly one ("18.9 mGold, and your best is GoldFast and flat. It gets there and it does not hang about.")
  ok    and gets out of the way of the score after that ("18.9 mGold, and your best is Gold")
  ok    and it knew what it was (dart)
  ok    no page errors

CHALLENGE OK
```

**All six watched red.**

```
$ (the CHALLENGES button hidden)
  FAIL  the result card offers a way back to the challenges (0 px)
$ (the trim sliders back to step one)
  FAIL  and both trim sliders detent every two degrees: minus three landed on -3, five landed on 6
$ (the medal not passed to hangarRecord)
  FAIL  and the medal it wins is written onto that fold, not just onto the challenge (null)
  FAIL  and the shelf shows it: "KestrelThe Cruiser · 8.5 m"
$ (hangarMedalRow returning nothing)
  FAIL  and the shelf shows it: "KestrelThe Cruiser · 8.5 m"
$ (the archetype named every time)
  FAIL  a challenge names the archetype the first time you fly one
  FAIL  and gets out of the way of the score after that
```

`node tools/check.js`

```
sim             pass  0s
lint            pass  0s
throw           pass  5s
fold            pass  9s
tunnel          pass  3s
challenge       pass  4s
sound           pass  6s
layout          pass  10s

ALL GATES PASSED
```

**A test hook that was lying, found by looking at the shot it produced.**
`AIRWORTHY_TEST.toChallenge(id)` with no spec flew START_SPEC, so the first
shelf shot showed three folds that had all been flown as the starting plane:
three identical thumbnails, and archetypes that belonged to a plane nobody
folded. There is now `pickChallenge(id)`, which is what the challenge LIST
does, and the shot shows a wide Tumbler, a needle Dart and a Cruiser between
them, each with the gold it won.

Stamp bumped to `20260906b` in `index.html` and `sw.js` together.


### P3, closing section 4 against the built game (2026-09-06)

Section 6 was read clause by clause and closed; section 4, ARCHITECTURE LAW, had
two clauses left in it.

**1. *"Events: `launch`, `stall`, `land`, `ring`, `zone`."*** A flight carried
launch, stall and land. The gates and the mark were worked out by the SCREEN,
after the fact, from `ringsHit`, and the zone was worked out again by `scoreOf`.
Two consequences: a player who flew between both banners was told nothing about
it, because the banners were drawn hit or missed and never said out loud; and
there were two places that knew where the plane went. The flight emits `ring`
and `zone` now, the result card reads them, and six assertions hold them to the
one answer, including that the zone event's miss and the accuracy score are the
same number to within a billionth.

**2. *"INPUT. Pointer events; the slingshot; taps for creases; drags for dials;
pinch in the field."*** There was no pinch. A twenty metre throw does not fit on
a phone at the scale a fold is legible at, so the room now pulls back under two
fingers, clamped between 0.45 and 1.8. It is a VIEW change and nothing else:
zoom is a multiplier on the base scale, so the flight, the camera's own
following and every measurement stay exactly where they were.

```
  ok    landscape: pinching in pulls the room back (1.00 to 0.45)
  ok    landscape: and the scale really moves with it (55.6 to 25.0 pixels a metre)
  ok    landscape: and two fingers do NOT throw the plane
  ok    landscape: and spreading brings it back in (0.45 to 1.30)
  ok    landscape: and it stops rather than shrinking to nothing (0.45)
  ok    landscape: and one finger still throws it after all that
```

**Watched red, sim first.**

```
$ (a ring event for every ring, hit or not)
  FAIL  and every ring event matches what ringsHit counts   [expected 1, got 2]
$ (the zone event fired wherever it lands)
  FAIL  and a plane that misses it says nothing   [expected 0, got 1]
$ (the zone event reporting the wrong miss)
  FAIL  and the zone event agrees with the score (0.41 against 0.01)
$ (free flight allowed to leak course events)
  FAIL  the archetypes suite ran to the end   [Cannot read properties of undefined]
```

**And the pinch.**

```
$ (no pinch at all)          FAIL  pinching in pulls the room back (1.00 to 1.00)
$ (zoom moved, scale not)    FAIL  and the scale really moves with it (55.6 to 55.6 pixels a metre)
$ (no floor on the zoom)     FAIL  and it stops rather than shrinking to nothing (0.01)
$ (ALL THREE guards against a pinch becoming a throw removed)
                             FAIL  and two fingers do NOT throw the plane
```

That last one is worth the space. Two fingers on a canvas whose one finger
gesture is a slingshot is exactly the shape that fires a throw nobody asked for,
and it took removing three separate guards before the assertion could go red:
the second finger nulls the pull, the move handler nulls it again, and the up
handler refuses. Two mutations in a row looked like the gate was decoration and
both times it was another guard doing its job.

**Shots, opened and read.** `p3-pinched.png` (the whole throw in one frame),
`p3-result-rows.png`, `p3-shelf.png`, and every earlier one re-taken.

- The landscape result card was 250 of the 375 pixels of height: a card about
  where the plane came down, covering the room it came down in. It is a right
  hand panel now and the camera settles the landing in the left fifth, so the
  trail and the plane are both in shot beside it.
- Four buttons in one row was tried first and two of them ran off the edge of a
  430 pixel card.
- ⛔ AND THE CSS SCAR: the landscape rule was written ABOVE the rule it
  overrides. At equal specificity the later one wins, so it did nothing at all,
  and the first shot after "fixing" it was identical to the one before.

`node tools/check.js`

```
sim             pass  0s
lint            pass  0s
throw           pass  6s
fold            pass  8s
tunnel          pass  3s
challenge       pass  4s
sound           pass  6s
layout          pass  8s

ALL GATES PASSED
```


### P3, one session end to end, and the dashes it found (2026-09-06)

Every gate up to here proves a ROOM works. Nothing proved the rooms were
JOINED, and a broken join leaves every one of them green while the game is
unplayable. `test/play.mjs` is one session with nothing but a thumb: cold open,
fold a plane crease by crease, read it in the tunnel and bend the elevator
there, take it to the gym, throw it with a real pull, trim it, throw it again,
go to a challenge, win something, and find that medal on the shelf.

```
ok    the game opens on the title
  ok    with an empty hangar
  ok    the workshop is where a thumb can reach it (48 px)
  ok    a fold saved out of the workshop is the first thing on the shelf
  ok    and it puts you on the field holding it
  ok    the tunnel is where a thumb can reach it (48 px)
  ok    the slate tells you what it will do before you throw it
  ok    including the glide it will hold (3.25 to 1)
  ok    bending the elevator down in the tunnel really bends it (-7)
  ok    and the tunnel answers straight away (3.3 to -5.5 degrees)
  ok    FLY IT is where a thumb can reach it (56 px)
  ok    FLY IT takes it to the gym
  ok    with the bend you just put in it
  ok    a pull back and a release throws it
  ok    and the result card comes up
  ok    with what kind of plane it turned out to be (cruiser)
  ok    and the shelf remembers that about it
  ok    TRIM is where a thumb can reach it (48 px)
  ok    the elevator is where a thumb can reach it (48 px)
  ok    THROW IT is where a thumb can reach it (48 px)
  ok    a bend and THROW IT sends it again
  ok    the way to the challenges is where a thumb can reach it (48 px)
  ok    which opens the list
  ok    nothing has been won yet
  ok    picking one off the list sets it up (gym-far)
  ok    THROW IT is where a thumb can reach it (56 px)
  ok    a plane a person folded by tapping wins something on one of the six (bronze, after 2)
  ok    the challenge keeps it
  ok    and so does the fold that won it ({"gym-hang":"bronze"})
  ok    the hangar is where a thumb can reach it (48 px)
  ok    the shelf shows what it won: "KestrelThe Cruiser · 9.4 m● 1 of six"
  ok    nothing a player read on any screen had a dash in it (112 lines)
  ok    and nothing shouted
  ok    no page errors

PLAY OK
```

The plane a person folds by tapping the LAST choice of every crease won a bronze
on its second challenge, which is the first evidence in this build that the game
is playable by somebody who is not the person who wrote it.

**Watched red on three broken joins.**

```
$ (FLY IT handing you a different plane than the one in the tunnel)
  FAIL  with the bend you just put in it
$ (the challenge list not setting the challenge up)
  FAIL  picking one off the list sets it up (null)
  FAIL  THROW IT is where a thumb can reach it (0 px)
  FAIL  a plane a person folded by tapping wins something on one of the six (nothing, after 6)
$ (a dash in a challenge's one line ask)
  FAIL  nothing a player read on any screen had a dash in it: ["Send it down the hall - hard"]
```

The second of those THREW a puppeteer stack trace on the first run instead of
naming the join, which is worth as much as a red gate that says nothing. Every
read of a thing that might not be there is null safe now, so the gate diagnoses
rather than dies.

**⛔ AND IT FOUND THREE DASHES IN THE SHIPPED GAME.** The lint's copy check
reads text nodes and `textContent = '...'` string literals; these were computed
at run time and it could not see them:

```
"-10"                              the elevator dial's readout
"best 9.4 m · elev -7 · 6.5 g"     the field's own heading
"gold at 14.8 m · elev -10 · 6.5 g"
```

A minus sign in front of a number is a dash on the screen whatever a
mathematician would call it, and the studio law does not carve out numerals. It
also reads worse than the alternative: what the player DID was bend the elevator
seven degrees down, so it says "elev 7 down", the aileron says "straight" or "3
right", and the tunnel's angle says "5.0 down". The tunnel's slate had been
saying it that way since the day it was built.

That change made the values twice as wide, which took the width out of the
sliders: in the tunnel's two column grid the angle dial was left about eighty
pixels of travel to aim with. The value moved onto the label's line and the
slider takes the full width under it.

**The copy check itself was nearly decoration.** Read off `document.body` at the
end of the run it only ever saw the hangar, and a dash sitting in the challenge
list went straight past it. It walks the screens now and keeps what it saw at
four points during play.

`node tools/check.js` (nine gates)

```
sim             pass  0s
lint            pass  0s
throw           pass  6s
fold            pass  8s
tunnel          pass  3s
challenge       pass  4s
sound           pass  6s
play            pass  5s
layout          pass  10s

ALL GATES PASSED
```


### 2026-09-06 14:17Z, courses three and four

```
$ node sim.js --medals --write        (forty planes, every challenge)
  canyon-hang airtime       3.00     3.90     5.10    10.91   wing 0.45 pointed folds 2 elev 2
  canyon-bar  accuracy      3.51     2.23     1.27     0.32   wing 1.00 pointed folds 2 elev 0
  stadium-far distance      7.30     9.40    11.70    15.29   wing 0.15 locked folds 3 elev 0
  stadium-hangairtime       2.10     2.20     2.50     3.62   wing 0.99 pointed folds 2 elev 8
the most golds any one plane in the bank takes: 6 of 10
$ node sim.js --test                  PASSED 160 / FAILED 0
$ node tools/check.js                 ALL GATES PASSED (sim lint throw fold tunnel challenge sound play layout)
```
Watched to fail: the placeholder gold on canyon-bar went red before the tool
wrote the measured set (`canyon-bar: the reference fold takes gold (5.49
against 1)`). The mark assertion for the sandbar passed on the first placing
at 15.5 m, so it has NOT yet been watched to fail; move the zone and watch it.

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `throw, fold,
tunnel, layout`.

---

## 15. THE MORNING REPORT

### 2026-09-06 16:10Z, Opus (lead): THE STUNT CHALLENGE, the design's fourth type

The design names four challenge kinds, Distance, Airtime, Accuracy and Stunt, and three
were built. The ring slalom is the fourth. Stamp 20260906g, nine gates green, sim 171.

**The score is continuous, because a count cannot carry three medals.** With three gates
the only counts are 0, 1, 2 and 3, and every near miss ties with every wild one. A gate is
worth one for the pass and up to a half more for the pass being centred, so more gates is
always better than fewer (a perfect single pass is 1.5 and never beats two ragged ones)
and the medal tool has something it can threshold.

**⛔ THE SLALOM HANGS ITS OWN GATES, and this was the finding.** Scored against the
Stadium's three arches, which sit at 5, 10 and 15 metres for the look of the place, forty
planes had a median of NOUGHT rings, so the medal tool, which reads percentiles, wrote
bronze 0.00 and silver 0.00: everybody wins bronze and nobody can tell. Five different
throws were measured and every one collapsed the same way, because a paper plane cannot
steer in the air and gates placed as scenery are not on any arc it flies. The challenge
hangs three of its own on the arc a middling fold actually flies, measured from a trace
(apex 3.9 m at six metres, down through 1.2 at nine). Measured after: bronze 1.20, silver
1.40, gold 2.50, best 3.92 of a possible 4.5, and no plane in the bank takes more than 6
of 11 golds.

**⛔ AND THE MEDALS WRITER WAS DELETING THEM.** `sim.js --medals --write` rebuilds the whole
CHALLENGES block from what the tool measured, so the first write silently dropped the
slalom's `rings` and the challenge went back to flying the scenery with nobody told. The
writer copies them through now, and that was proved by running it again and checking the
line survived. This is the same shape as the save whitelist that swallowed Strata's
counters an hour earlier: a writer that knows only some of a record's fields deletes the
rest.

**One source for which gates.** `ringsFor(courseId, ch)` is asked by the flight's ring
events, the drawing and the scorer, so the screen cannot show a player a gate that is not
being scored.

**Watched to fail:** the centring term removed (4.5 becomes 3.0), and `ringsFor` made to
ignore a challenge's own gates (three assertions red, including the reference fold losing
its gold). Two hardcoded counts had to be widened first, ten challenges to eleven and two
in the stadium to three.

**Seen in the shot** (`docs/shots/p4-slalom.png`, opened twice): the first take had the
gates drawn in the scenery's greys and they vanished into the stadium's striped stands,
which is the one thing a challenge about flying through them must not do; a challenge's
own gates are amber on posts now. The readout then ran to three wrapped rows, so on a
stunt the gate count leads and the distance goes. Still wrong: the camera follows the
plane so a still only ever shows the last gate; the stands are busy behind everything;
and a gate already flown turns blue, which is right in play and hides the amber in a shot.

**Next action:** nothing in Airworthy is half finished. The gust whistle unlock (design 6,
a single earned mid flight nudge) is the only named thing left unbuilt, and it is a later
phase in the plan.


### Airworthy, finished 2026-09-06

**Where it is.** P0, P1, P2 and P3 are done, committed and pushed on
`add-sproing-jumper`. Eight gates green: `sim` (123 assertions), `lint`,
`throw`, `fold`, `tunnel`, `challenge`, `sound`, `layout`, plus two tools that
refuse to lie, `sim.js --medals` and `tools/thumb.mjs`. Every assertion in every
gate has been watched to fail at least once, and the ones that took a second and
third mutation to turn red are named in section 13.

**What it is.** You fold a paper plane through six real creases, throw it, watch
it porpoise, and fix it with the elevator. There is a wind tunnel that cannot
lie to you about the field, because it has no model of its own: it calls the
same lift curve and the same drag polar the aeroplane flies on, and the gate
proves that by measuring an actual flight rather than by reading a variable.
There are two courses and six challenges, and the medals on them were measured
by flying forty folds through every one, not guessed.

**The three best things in it.**

1. The tunnel found a hole in the flight model. Drawn against the same drag the
   plane flies on, the drag arrow got SHORTER when the wing let go, because
   induced drag follows CL and CL falls in a stall. A stalled wing is a barn
   door and it was getting cheaper to push through the air. That is a bug you
   cannot see in a number and can hardly miss in a picture.
2. The challenges ask for different folds and it is proved rather than hoped:
   the fold that goes furthest has a wing of 0.15 and the fold that hangs
   longest has a wing of 0.99, and an assertion fails if that gap closes. The
   plan's own test for this hole (no fold golds all six) PASSED while the hole
   was open, so a sharper one was written next to it.
3. Every threshold in the file was written by a tool that flew for them, and the
   tool refuses to write a set where one plane wins everything.

**There is a ninth gate that plays the game.** Every other one proves a room
works; a broken join between rooms leaves all of them green and the game
unplayable. `test/play.mjs` folds a plane by tapping, reads it in the tunnel,
bends the elevator there, throws it in the gym, trims it, wins a medal on a
challenge and finds it on the shelf, all with real pointers. The plane it folds
by taking the last choice of every crease wins a bronze on its second challenge,
which is the first evidence in this build that somebody other than its author
can play it. It also caught three dashes in the shipped game, in readouts
computed at run time where the lint cannot see them.

**Sections 4 and 6 are closed too.** Section 4 had two clauses left in it: the
flight's `ring` and `zone` events, which the screen had been working out for
itself after the fact so that a player who flew between both banners was never
told, and pinch in the field, which did not exist at all. Both are built and
gated. The pinch assertion that two fingers must not throw the plane took three
guards removed before it could go red.

**Section 6 is closed too.** The phases were done and the screens spec was not.
Read clause by clause it named four things that did not exist: a way back to the
challenges from a result, the archetype line named once rather than never or
always, detents at two degrees on the trim sliders, and medals on the hangar
cards. That last one could not have existed: a medal was recorded against the
challenge and nothing at all was recorded against the fold that won it, so the
shelf was a list rather than a shelf. Looking at the first shot of it also
caught the cards at 56 by 44, where a wing of 0.15 and a wing of 0.99 are the
same picture, which is the exact fault P2 fixed once and did not fix far enough.

**What is thin, honestly.**

- **No painted art at all.** Every room, plane and prop is drawn by code. It
  holds together and it is consistent, but it is the plainest part of the game
  and the one a player will judge first. `docs/ART_ASSETS.md` says exactly what
  would need painting.
- **Nobody has played it on a phone and nobody has heard it.** The headless
  browser runs with the one flag a real phone does not have. The sound gate can
  prove the graph responds; it cannot prove the graph makes a sound.
- **A tall phone still has a lot of wall on it.** The room is drawn closer and
  the gym grew a ceiling, which turns blank paper into a room, but at 412 by 915
  the flight still lives in the lower half. The honest alternative was showing
  four metres of room across the width, and the flight is the subject.
- **Four of the six courses in the design are not built.** Stunt, the Canyon and
  the Stadium are named in the design and the plan puts them after this slice.
- The gym's accuracy mark is a desk at 8.5 m because that is where forty planes
  come down from the throw that challenge sets. If the throw is ever retuned the
  mark has to move with it, and `suiteChallenges` will go red if it does not.

**The four answers section 10 asked me to carry up here.**

1. **The name is AIRWORTHY**, which is Stephen's folder and title. The
   alternates, parked and not chosen: Every Crease Counts, Field Day, The Fold,
   Maiden. "Every crease counts" survives as the line under the title.
2. **The precision mini skill is kept**, with Steady Hands in the settings, which
   centres every crease and leaves the aileron split as the only source of veer.
3. **No mid flight control.** The gust whistle is not built.
4. **Portrait everywhere, landscape widens**, which is the one answer that
   departs from the design's recommendation and is Stephen's to overturn. The
   shots to judge it on are `p3-375.png` and `p3-915.png` (the same throw, same
   moment, both orientations), `p2-workshop.png` against `p2-workshop-wide.png`,
   and `p3-tunnel.png` against `p3-tunnel-wide.png`. Nothing rotates, nothing
   asks you to turn the phone, and the manifest says `any`.

**Two Director calls waiting.**

1. **The challenges take the throw off you.** Fold and trim are yours, the arm
   is the challenge's. It is what makes the six ask for six different planes,
   and it is a real change from a game whose other half is a slingshot. The gym
   with no challenge selected still has the free sling.
2. **The starting plane porpoises and it takes most of the elevator slider to
   settle it,** from plus four down to about minus four. That is the opening
   lesson working, but it is a big drag for a first ever interaction and a
   smaller airframe bias would make it two nudges instead.

### Airworthy, built 2026-09-06

**Where it is.** P0, P1 and P2 are done, committed and pushed on
`add-sproing-jumper`. `node satellites/airworthy/tools/check.js` prints ALL
GATES PASSED across five gates: `sim` (76 assertions), `lint`, `throw`, `fold`,
`layout`. Ten mutations watched to fail. P3 (the wind tunnel, the Backyard, the
medals and the rest of the sound) is NOT started.

**What it is.** A gym, a paper plane, and a slingshot. You pull back and let go,
the plane flies the flight the model gives it, a dotted pencil trail records
where it went, and a card tells you what it just did and offers to trim it. The
plane you start with porpoises, and two bends of the elevator turn it into a
Cruiser that goes further. That loop is the whole design and it works.

**What I would look at first.** `docs/shots/p1-swoop.png`. The plan's P1 step 2
says the swoop has to make you smile with recognition, and that strip is the
case for it. Then `p1-result.png` and `p1-fixed.png` side by side, which are the
before and after of the fix.

**THE PLAN'S MODEL DOES NOT FLY, and this is the thing to read.** Taken
literally, every plane the plan names dives into the floor inside a second and
the phugoid the whole game is built on does not exist. Ten corrections were
needed and all ten are in section 13 with their measurements. The three that
matter: the pitch damping is stiff and explicit Euler turns a flight into
Infinity inside a fifth of a second; the stability term's sign is inverted, so a
stable plane diverges; and a stalled wing has to push its own nose down, or a
plane trimmed past its stall pitches up for ever and the porpoise is a slow loop.
None of that is a criticism of the plan, which said in advance that the model
was the thing to fix if the Porpoise failed. It is a note that the coefficients
in section 4 are a sketch and not a model.

**What is thin.** Three things.

1. **A steep throw undoes the fix.** At eight degrees the two bends turn the
   porpoise into a cruiser; at sixteen the fixed plane porpoises again. That is
   true of a real plane and it is also a way for a player to conclude the trim
   does nothing. The result card's line is the only thing telling them.
2. **The archetypes are named from the flight, not the fold.** A player who
   changes one fold and gets the same name learns nothing. The tunnel's
   predicted archetype, which is P3, is what closes that loop.
3. **There is one course and no medals.** The workshop and the hangar are built
   now, so you can fold a plane, name it, fly it, trim it and keep it. What is
   missing is a reason to fold a second one: the Gym has no challenges, no
   thresholds and no ghosts, and the tunnel that would let you predict a fold
   before you throw it is P3.

**For Fable, to check independently.** Three things.

- The four gates, run cold: `cd satellites/airworthy && node tools/check.js`.
- `node sim.js --fly=porpoise`, and read the height column: 1.60 up to 2.51,
  down to 1.33, level, down again. That is the product in numbers.
- The six shots, opened rather than listed.

**Next action:** P3 step 1, the WIND TUNNEL. The chamber in the upper half with
200 pooled particles advected left to right, their paths bent above the wing by
`CL`, shed behind the nose by `CD0` and detached past `alphaStall`; the live lift
and drag vectors; the wind lever and the angle dial; and the chalk readouts,
every one of which reads off `derive` so the tunnel cannot lie about the field.
`test/tunnel.mjs` then asserts that the tunnel's glide ratio equals the field's
measured ratio for the same spec within 15 percent, which is the one source of
truth law, measured.


The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the Porpoise trace**,
pasted.
