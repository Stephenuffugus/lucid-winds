# HANDOFF GERPLUNK, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from
`docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-GERPLUNK.md` (Stephen's design, read in full) plus the fleet
on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then `plans/fathom/HANDOFF-FATHOM.md` sections 0, 2, 9,
14 and 15, then this file, then the design. Where they differ, this file wins; every difference is in section 3.
**Game folder:** `satellites/gerplunk/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/gerplunk/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written. Nothing built. Next action: section 5, P0, step 1.
- 2026-09-06 Opus: P0 step 1, `tools/check.js` with one gate and no `sim.js` to
  run, red, pasted in section 13.
- 2026-09-06 Opus: **P0 IS DONE, steps 1 to 4.** `node sim.js --test` prints
  PASSED 110 / FAILED 0 and `node tools/check.js` prints ALL GATES PASSED. Every
  assertion watched to fail under a CONFIG mutation, including the plan's own two
  (SPIN_DECAY 0.6 kills the fifteen skip assertion, DRIFT0_DEG 0 kills the no
  spin one). CONFIG, RNG, STONES, MODEL and FLICK are pure, `sim.js` has
  `--test`, `--throw`, `--stones` and `--sweep`, and the scaffold (sw.js,
  manifest, icons, lint) is in.
  ⛔ THE PLAN'S COLLISION MODEL WAS WRONG and is corrected: see section 15 and
  docs/DECISIONS.md D1. Restitution collapses the bounce height independently of
  speed and the trill turned into the stone falling through the timestep. The
  impulse is lift, per Bocquet, whom the design note cites.
  ⛔ THE TUNED CONSTANTS ARE A MEASUREMENT. The plan's LOSS0 0.12 and SPIN_DECAY
  0.06 gave ten skips against a gate that asks for fifteen. `node sim.js --sweep`
  walks the grid, reports every point that passes all seven P0 assertions at
  once, and FAILS if the shipped constants are not among them.
  ⛔ AIM DID NOT EXIST IN THE PLAN and now does, as the fourth axis of the throw
  tuple. A single stroke only carries three numbers, so aim comes from where the
  stroke starts. Stephen asked for a unique aim and flick mechanic on 2026-09-06
  and a design panel on that question was still running when this was written;
  what is built is a defensible baseline, not the final answer.
- 2026-09-06 Opus: **THE AIM MECHANIC IS DECIDED AND BUILT.** 126 assertions.
  Aim is THE PLANT: lateral thumb travel while the hand is slow, inside the same
  unbroken touch as the throw, sticky across throws. Chosen from a four design,
  three lens panel; the merge and every dropped idea are in docs/DECISIONS.md
  D18 to D24.
  ⛔⛔ It also found that the WebXR seam was broken the hour it was written and
  every gate was green: the phone returned the SINE of the throw angle and the
  headset returned the angle, so the same physical throw was theta 26.38 on a
  phone and 21.00 in a headset. The device assertions never compared the two
  devices to each other. Fixed, and there is now an assertion that does.
  **Next action:** P1 step 1, the LAKE render, the shore with three stones, the
  flight camera, the rings, the ticks and the plunk. Then P1 step 2, which is the
  feel test: shoot `docs/shots/p1-flight.png` and `p1-gerplunk.png` at 375x667,
  OPEN them, and fix the water before P2 if it reads as stripes rather than a
  lake at dusk.
  ⛔ P1 INHERITS FOUR THINGS FROM THE AIM PANEL, all in section 15 below: the
  world turns under the thumb rather than a cursor moving, the bent seam of calm
  water that previews the throw, the treeline scrolling at 8 px per degree, and
  the five degree haptic detents. P2 inherits the three faces of the lake, which
  is what gives aim a job at all.
- 2026-09-06 13:15Z Fable (P1 builder, 110 minute fence): **P1 IS DONE, A PAGE A
  PHONE CAN PLAY.** Commits 6546e966, 110cdc62 and the one this line is in.
  `node tools/check.js` prints ALL GATES PASSED over five gates: lint, sim (126),
  sweep, flick (real pointers, 33 assertions), layout (48 px by elementFromPoint
  at 375x667, 320x568, 412x915). flick and layout were each watched to fail
  (section 13). Icons, thumb (29 KB), shots at three widths, all opened.
  What a thumb can do: title, TO THE LAKE, three stones on the bank (the
  skimmer always among them tonight), a flick on the water skips the stone with
  a tick per skip and the plunk, the tally grows on the post, the best is saved,
  the folk line after every sink; a slow slide turns the lake (treeline and sun
  scroll, 5 degree haptic detents) and the SEAM, the model's own trace of a
  nominal throw bent by the day's crosswind, straightens as you turn into the
  wind. MENU: sound, motion, about, leave.
  ⛔ THE FLICK GATE'S FIRST DRAFT ASSERTED THE WRONG PREMISE: it expected a 60 px
  push over 300 ms to leave the lake where it was. A slow sideways push IS the
  plant (D18) and the turn survives a set down by design; the game was right and
  the gate was rewritten to say what the design says. Lesson kept in the gate's
  header.
  13:23Z: `test/audio.mjs` written and wired, SIX gates now. It found a real
  audible flaw the hour it was written: a throw that ends slow sinks AT its
  last hit in the model, so the plunk landed on the last tick of the trill and
  buried it (17 onsets for 17 skips and a plunk). The page now gives a slow
  ending a 120 ms beat before the plunk, in the sound and the picture (D34).
  Lap, crickets and the loon are in, synthesised, from the seeded stream (D35).
  13:26Z: the count is drawn as marks on the post (four strokes and a strike)
  beside the number the gates read; the camera drifts home to the shore once
  the rings have gone, so the seam is never drawn from behind the lens.
  **Thin:** no slow motion on a record; the sink rings stack into a spring on a
  straight throw; the folk line can sit across the near rings of a short throw;
  the thumb's bottom third is empty water; the shore is drawn by CSS, not art. The three faces of the lake are P2, so the turn changes where the stone
  lands and how the seam bends but not yet the water it lands on.
  **Next action:** P2 step 1 (section 5): the
  stone in the palm, the pebble bed by career, RECORDS per stone, in
  `index.html` after section 13 THE DAY, replacing the fixed offer in
  `setupDay` (the skimmer is pinned to slot three tonight so the gate can find
  it; the bed must keep a real skimmer reachable or the flick gate must pick
  whatever is on the bank).
- 2026-09-06 14:25Z Fable (P2 builder, 40 minute fence): **P2 STEP 1 IS DONE
  AND THE THREE FACES ARE IN THE MODEL.** Commits 5bbd5cee, f81afb8e, 9fd0619f
  and the one this line is in. Stamp 20260906d. `node sim.js --test` prints
  PASSED 157 / FAILED 0 (was 126); `node tools/check.js` ALL GATES PASSED over
  the six gates (flick failed once inside the suite, then passed twice alone).
  What a thumb can do now: the bank is the PEBBLE BED, `bedFor(date, career)`,
  pure and in the SIM export: three distinct stones a day off the bed stream,
  no rare before career 50, the skimmer a gift on the bank until career 30
  (D36, replaces D29); each stone carries the hand's own record under its name
  and says it once when picked. And AIM HAS ITS JOB: `faceOf(yaw, water, wind)`
  (D37 to write) makes left past minus 12 degrees the lee (glass whatever the
  day, wind cut to a third, the spit at 16 m stops the stone, `runThrow` ends
  'beached'), straight ahead the day's water, right past 12 degrees the bay
  (a step rougher, wind times 1.5). `throwEnv` reads the face, so the seam
  and the throw change with the yaw, and `drawWater` shimmers with the face
  the thumb looks at. Every new assertion watched to fail: BED_RARE_CAREER=0,
  BED_GIFT_CAREER=0, LEE_REACH_M=99, LEE_WIND=1, WATER_RIPPLE=1.
  ⛔ A PERFECT THROW IS NOT TAXED BY ROUGH WATER: rougher water narrows the
  window, it does not tax its centre, so 17 skips on glass is 17 on ripple. The
  bay assertion says what is true: ordinary throws either side of the magic
  angle die there and never gain. Which is the design's own line, half your
  throws die at six.
  Shots opened: p2-bank, p2-bank-late (career 1000, Lucky Quartz on the bank,
  no skimmer), p2-lee, p2-bay, p1-shore, p1-lake-small. Fixed from the shots:
  stone labels were 96 px on a 79 px pitch and collided on the late bank, and
  followed each rock's height so three baselines sat at three heights; now
  pinned inside the button at one baseline, 76 px, bank lifted 6 px.
  **Thin, seen, not fixed:** THE SPIT IS NOT DRAWN. In p2-lee the seam stops
  at 16 m in open water; a stone that runs up on the spit lands on nothing
  visible. The bay mouth is not drawn either, and 27 m against 16 m is subtle
  in perspective, so a still eye cannot tell the faces apart; only the shimmer
  moves differently. A beached stone still plunks rather than clicks on stone.
  No stone in the palm view yet (the line does that work for now).
- 2026-09-06 14:32Z Fable (same fence, the coordinator sent me back for the
  twenty minutes): **P2 STEP 1b IS DONE, THE LAND IS DRAWN.** Commit fb349d86.
  `drawLand` draws the point as a tongue in world space whose tip sits on the
  throw line at LEE_REACH_M exactly when the yaw reaches minus FACE_DEG, then
  sweeps back LEFT to meet the treeline at the horizon; `bayOpen` thins the
  near trees right of the bay's world edge over 90 px so a turn right opens the
  far shore. Neither pops at the model's step; both slide with the turn. A
  beached stone clicks on stone (`click` in AUDIO, same [osc, noise] shape as
  the plunk so keep() holds it). Shot p1-shore, p2-lee, p2-bay THREE times and
  opened each: the first draw was a flat black dock with a straight far edge;
  the second was a point but crowded the seam three degrees early and showed
  as a jetty in the bay; the third reads, the seam curving past the tip at the
  fresh stance, ending on the spit in the lee, the point far left in the bay.
  Lint, sim 157, layout, audio green after the land.
  **Thin, seen:** the land is a flat dusk silhouette with no texture or trees
  on it; the bay's far shore is a straight low line; the audio gate has no
  beached case yet (renderAudio on a lee throw would prove the click).
- 2026-09-06 14:58Z Fable (clock extended, then stopped by the coordinator):
  **P2 STEP 2 IS BUILT: THE DAILY LAKE, THE CARD, SHARE BY LINK, test/daily.mjs.**
  Commits 4911e4e4 and the one this line is in. Stamp 20260906e. `sim.js --test`
  167 / 0 (dailyStoneFor, dailyLink, parseDailyLink pure in the SIM export,
  watched to fail under DAILY_THROWS=6). DAILY LAKE on the sheet pins the
  day's stone (never a rare) as the one stone on the bank, a strip under the
  post counts the throws, the card comes up 2.6 s after the fifth sink, SHARE
  is navigator.share with a text field fallback, and a `#d=` link opens a fresh
  browser on the sender's card with THROW YOURS on the same lake. The audio
  gate proves the beached click (three assertions). `test/daily.mjs` drives it
  with five real flicks and a second browser and is registered in check.js;
  it printed DAILY OK at 14:48Z before the card fixes below.
  ⛔ THE EYE CAUGHT WHAT THE GATE DID NOT: on the first card shot THROW YOURS
  showed on my own card and SHARE on the recipient's, because `.btn{display:
  block}` beat the `hidden` attribute and the gate read the attribute. Fixed
  (`.btn[hidden]{display:none}`) and the DEV card hook now reports computed
  display, so the gate can fail on it. Also from the shots: the strip collided
  with the post and MENU (moved under them), the bank was a void (the day's
  one stone now sits on it), the slots sat over the treeline (card backdrop),
  and the date carried dashes in player copy (now "6 September 2026").
  ⛔ NOT RERUN AFTER THOSE FIXES: the browser gates. The last daily run had one
  red line, the gate comparing the ISO day to the worded date; fixed to read
  `d2.day`, syntax checked, lint, sim and sweep green, but the lock was not
  free at the stop. p2-daily, p2-card, p2-card-link shot and opened after the
  fixes and they read.
  **Next action:** `flock -w 1800 /tmp/sws-gate.lock node tools/check.js`
  (seven gates now); if daily flakes inside the suite, twice alone (the first
  flick after entering the daily can take 2.4 s of dispatch under swiftshader
  and read as a set down, which is the two cores). Then the SHARE IMAGE
  (1080x1350, plan section 4 SHARE) which is not built; then P3 step 1.

- 2026-09-06 15:05Z Opus (lead, taking over from Fable): **THE DEBT IS CLEAR. The seven
  gates were rerun cold on the shipped tree and ALL GATES PASSED**, nothing red, no rerun
  needed:
  ```
  lint            pass  0s
  sim             pass  0s
  sweep           pass  3s
  flick           pass  21s
  layout          pass  16s
  audio           pass  4s
  daily           pass  38s
  ALL GATES PASSED
  ```
  So `4911e4e4` and `f727ddc8` (the daily lake, the card, the hidden button fix, the worded
  date) stand as shipped and the "not rerun after those fixes" warning above is retired.
  **Next action:** the SHARE IMAGE at 1080x1350 (plan section 4 SHARE, the Attic path in
  `satellites/attic/index.html` near 1446), then P3 step 1.

- 2026-09-06 15:25Z Opus (lead): **THE SHARE IMAGE IS BUILT, AND P3's ONE REAL GAP,
  SLOW MOTION ON A RECORD, WITH IT.** Stamp 20260906f.
  **The card.** `SHARE` renders 1080x1350: the lake at dusk, the sun road opening toward
  the viewer, the best of the five drawn from the model's OWN skip positions with a ring
  where each landed and the plunk where it went in, then the day in words, the stone, the
  five counts with their distances and the summary. `DAILY.record` now keeps `xs` in the
  save only; the `#d=` link is untouched, so the daily gate's link shape still holds.
  SHARE sends the picture with the link when `navigator.canShare({files})` allows it and
  falls back to the link then the visible field; SAVE THE CARD writes the png anywhere.
  D38 and D39 in `docs/DECISIONS.md`. Three rounds of looking: the first card's foot ran
  off the bottom edge and the summary, the wordmark and the brand piled up; the sun road
  stood as a vertical column through the arc; a grey pebble sat detached at the near
  shore. Now the foot is laid out from the bottom up, the road fades out before the throw,
  and the plunk closes the run.
  **Slow motion on a record.** `CONFIG.SLOW_MO` 0.34. A throw that beats the hand's best
  for its stone slows from the moment the LAST SKIP lands until the plunk, so the final
  leap and the sink are watched. The trill is never touched: every tick has already been
  scheduled at the model's own time, and only the plunk is moved, to the wall time the
  screen will show it at (`wallOf`). Reduced motion and a throw under two skips are never
  slowed. Five assertions in `test/flick.mjs`, watched to fail at `SLOW_MO: 1`:
  ```
  ok    the first throw is a record and it slows from the last skip (1.508)
  ok    and the last stretch takes about three times as long to watch: 2.94 times
  ok    so the plunk lands later on the screen than in the model (1.73 s against 1.58)
  ok    a lob that beats no record plays at the model's own speed (slowFrom null)
  ok    so its plunk lands on the screen when the model sank it
  --- with SLOW_MO: 1 ---
  FAIL  and the last stretch takes about three times as long to watch: 1.00 times
  FAIL  so the plunk lands later on the screen than in the model (1.48 s against 1.48)
  ```
  The ratio is a literal in the gate on purpose: reading `CONFIG.SLOW_MO` and dividing by
  it would be a test of arithmetic rather than of the game.
  **What P3 still owes:** step 2 only, the shots at four sizes, `tools/thumb.mjs`, the
  `ART_ASSETS.md` and `BUILD-NOTES.md` refresh and the morning report. P3 step 1's other
  four items were already built: the wind and the water by day in `setupDay`, reduced
  motion through `G.motion` and `prefers-reduced-motion`, and the loon and the crickets in
  `AUDIO.ambience`.
  **Next action:** `tools/shots.mjs` at 412x915, 375x667, 320x568 and 667x375 including a
  card shot, then `tools/thumb.mjs`, then the two docs and the morning report.

- 2026-09-06 evening, Fable, PLANNED FOR OPUS after Stephen's phone notes (his words are in
  `docs/DIRECTOR-CALLS-SEP06.md` section G, items 22 to 26; the transcript numbers are his):
  **P4 step 1, THE THROW REFERENCE AND THE SPIN RING (his 10, 13, 15, 16).** He wants the throw to
  feel like Pokémon Go's ball: a wind up you can see, a spin you can put on it, an indicator of how
  fast it is spinning, no sparkle. The model already carries `curl` in the motion tuple and nothing
  on the screen shows it. Exact next action: (1) research, before any code: what Pokémon Go reads
  from the thumb for a curve ball (the circular wind up before release, how spin maps to curve, how
  the flick length and speed map to distance, what the growing ring on the ball actually indicates),
  written to `satellites/gerplunk/docs/THROW-REFERENCE.md` as a table of their input against our
  tuple (speed, rise, curl, aim), with what we adopt and what we refuse and why; this note goes to
  Stephen before step 2. (2) `drawSpinRing` in section 15 THE LAKE: while the touch is down and the
  hand is slow, a thin ring under the thumb whose radius grows with the wind up's accumulated curl
  (read from the same samples `motionFromSamples` reads, through a pure `curlSoFar(samples, upto)`
  in the SIM block next to `plantYaw`), one haptic pulse at full spin, nothing drawn once the arm
  is fast. (3) The gate: `test/flick.mjs` gets a stroke with two circular loops before the flick
  (`stroke()` in the harness needs a `loops` option) and asserts curl above 0.6 in the committed
  motion AND that the ring was drawn (a colour sample under the thumb mid wind up, the way the
  Airworthy coach is measured); watched to fail with `drawSpinRing` emptied and with `loops: 0`.
  (4) Shoot `docs/shots/p4-windup.png` at 412x915 with the clock held mid wind up and OPEN it. Files:
  `satellites/gerplunk/index.html` sections 15, 16, 17; `test/harness.mjs` `stroke()`; `test/flick.mjs`.
  Nothing in `sim.js` changes. About a day. Stamp to the day's next letter in three places.
  **P4 step 2, THE TURN (his 4, 5, 9), ONLY after Stephen answers call 22:** (a) is one number,
  `TURN_DEG_PER_M`; (b) is `YAW_MAX_DEG` 25 to 60 plus the treeline and far shore drawn over the
  wider stance in `drawLake`; the flick gate's plant assertions and `--sweep` carry the numbers,
  widen them to the LAW not the number. Shoot the lake turned full left and full right and OPEN
  both: the far shore must not run out.
  **P4 step 3, MORE THINGS TO SKIP (his 7), after Stephen's list (call 24):** each is a STONES row
  (`mass`, `flat`, `round`, `rarity`, `line`) plus `drawStoneShape` cases for the palm and the flight,
  no art; `sim.js --stones` must print every new one inside the fifteen skip ceiling and the
  sweep must still pass; the bed gate (`daily.mjs`, `flick.mjs`) hardcodes the bank size, widen
  it to the law. Shoot the bank with a new thing on it and OPEN it.
  **P4 step 4, MORE WATERS (his 6), after call 23.** Not sized further until the turn is settled.
  What was DONE tonight is the entry below this one.

- 2026-09-06 evening, Fable, DONE after Stephen's phone notes (his words, then what was found):
  **"Oh my God, the sound effects, where did we get those? They sounded like fire alarms. They
  made everybody in my house flinch and scared my animals. Horrible."** A FAULT whose origin was
  on the thin list (nobody had heard it). Where they came from: nowhere, every voice is
  synthesised in section 14. What it was: the cricket's trill oscillator (amplitude one, through a
  gain of 0.5) was connected STRAIGHT INTO the envelope gain whose own value was 0.022, so the
  chirp swung between minus 0.48 and plus 0.52, a half scale 4 kHz sine chopped at thirty hertz,
  every second, for ever: the exact voice of a smoke detector, on the band where a phone speaker
  is loudest. The loon was a sine siren, 660 to 880 with a wide vibrato. The tick was a pure sine
  at half gain with a six millisecond attack, a test tone. Now: the trill is its own gain stage
  (one plus a third of a sine) and the envelope is the level, 0.006; the cricket is 2.3 kHz,
  slow trilled, low passed and sparse; the loon 440 to 560, breathy, rare; the tick a plip (a
  pitch that rises as the bubble closes, a grain of splash on the front, an octave lower, a third
  of the level); the lap low passed; master 0.62. ⛔ The audio gate could hear none of it because
  it never rendered the bed. `renderAmbience(seed, seconds)` renders the bed offline through the
  same functions and reports peak, rms and the share of energy above 3 kHz; three assertions in
  `test/audio.mjs`. The old wiring put back turns it red (peak 0.216, 28 percent); the real code
  measures 0.028 and 1.4 percent; the old cricket's PITCH put back at the new level stays green
  (9.9 percent), which is the point: the pitch was never the fault. The wav for his ear:
  `docs/shots/p4-bed-and-throws.wav` (fourteen seconds, the bed, a ten skip throw at four
  seconds, a record throw at nine), served at the live path.
  **"It needs a bit of a tutorial to explain how it works."** NEW WORK, small, built: the first
  line stays ("Flick a stone across the water"); after the first sink a second lesson stays up
  until the thumb has turned the lake five degrees ("Slide a slow thumb sideways to turn the lake.
  The bent seam on the water is where the wind will carry your stone."), and the turn itself is
  answered ("That is the turn. Now flick."); `seen.turn` on the save, defaulted for old saves.
  **The slide to turn ("horrible"), the landscapes, the things to skip, the Pokémon Go throw, the
  spin indicator, the store:** taste and new work, all in `docs/DIRECTOR-CALLS-SEP06.md` section
  G (22 to 26) with the P4 plan above for Opus. Not started, by the rule.
  Stamp `20260906h` in three places. `node tools/check.js`: six of seven green in the suite and
  the flick gate red inside it, then FLICK OK twice alone, which the law counts as a pass (two
  cores; the suite had the wav render queued behind it). Shots at 412x915 opened: the lesson on
  the water above the bank, clear of the chip corner; the turn answered.
  **Next action:** his ear on `docs/shots/p4-bed-and-throws.wav` and his thumb on the lake; then
  the P4 plan above once he answers calls 22 to 26.

---

## 0. RULES OF ENGAGEMENT

As `plans/fathom/HANDOFF-FATHOM.md` section 0 with `gerplunk` for `fathom`. One law particular to Gerplunk, from the
design's own note: *"this is the family lake in Venus, PA. Build it like a memory."* No timer anywhere, no counter that
ticks against the player, no red anything. The only number on the screen during a throw is the skip count, and it is drawn
like a tally on a fence post.

---

## 1. WHAT GERPLUNK IS, AND WHY IT IS WORTH A NIGHT

From the design: *"A lake at golden hour. Pick a stone from the shore, each one different, and flick it. Real skip physics:
release angle, speed, and the spin your flick imparts decide everything. Count the skips, watch the rings spread, hear the
tick, tick, tick tk tk trill, gerplunk."* Positioning line: **"Angle. Speed. Spin. Peace."**

Why it is worth a night: the physics is documented (Bocquet's magic angle near 20 degrees, spin stabilising the attack
angle, energy lost per skip growing with the miss from that angle) and tiny; the fleet already measures a flick path
(Keepsies); and the whole game is one gesture on one lake. The pitty pat trill at the end falls out of the model on its own.
It is third in the second six because the feel gate needs a human thumb on a real lake, and the sim can only prove the
counts.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| A flick path turned into a throw | `satellites/keepsies/src/input/knuckle.js` (header lines 1 to 40 explain the shape) | The sampler collects pointer samples with timestamps; release speed from the last 60 ms; straightness and the hook of the path are measured, not guessed; a long press fires `pointercancel` unless the canvas has `touch-action: none`, `user-select: none` and the pointer is captured |
| Deterministic sin and cos | `satellites/keepsies/src/core/dmath.js` | Optional; replays are per phone and the Daily Lake compares numbers, not bytes; keep `Math` (as Airworthy, section 3.5 there) |
| Share by link and a share image | `satellites/blockspace/index.html` 1060 to 1080; `satellites/attic/index.html` 1446 to 1466; `plans/asterism/HANDOFF-ASTERISM.md` section 4 POSTER | `#d=` for the Daily Lake result; the replay image at 1080x1350 |
| Real weather is NOT used | `plans/wardian/HANDOFF-WARDIAN.md` section 2 has the feed if a later version wants it | The design's wind is seeded by day, not real; keep it that way tonight |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `gerplunk` in place of `fathom` |
| Headless audio gate | `satellites/keepsies/test/audio_budget.mjs` | For the tick series and the plunk |

Not inherited: any physics library, three.js.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **Portrait first; the stone flies away from you.** The design says landscape. The arcade frames games portrait and a
skipped stone travels away from the thrower, so the natural view is over the shoulder with the lake receding up the
screen: distance is the vertical axis, the rings are ellipses flattened by perspective, the camera slides forward behind
the stone. Landscape widens the shore. This departs from the design and Stephen decides with the shots.

3.3 **The model is written down.** Section 4 gives the collision rule, the loss, the drift and the thresholds as numbers.
The design's assertions (magic angle at least 15 skips, no spin at most 3, the trill emerges) are the P0 gate.

3.4 **The folk wisdom readout is on, after a sink only.** The design recommends it; taken. One line, no numbers:
"Flatter, and snap the wrist." / "Faster. Put your shoulder in it." / "More spin. Curl the wrist at the end." chosen from
which of the three throw parameters was furthest from its sweet spot.

3.5 **Stones are data and there are eight.** Common: sandstone, shale, granite chunk (the joke stone, roundness 0.2).
Uncommon: perfect skimmer, heavy flat. Rare: sea glass, fossil stone (a crinoid print, the Strata wink), lucky quartz. The
pebble bed offers three a day from the seeded stream, rarity weighted by career skips.

3.6 **The Daily Lake is five throws, and the link carries the numbers.** `#d=` holds the date seed, the five skip counts
and distances; the recipient sees your five and throws their own five on the same lake.

3.7 **No golden hour clock.** The design says golden hour always; taken. No device clock palette here (unlike Wardian and
Updraft); the lake of memory is always at dusk.

3.8 **Copy.** No dashes, no exclamation points. The sink line is "gerplunk" in small letters on the water, once.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/gerplunk/`):

```
index.html            the game
sim.js                --test, --throw=<v>,<deg>,<spin>,<stone> (prints each skip's time, x, interval), --bed=<seed>
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/flick.mjs  test/audio.mjs  test/daily.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers: `CONFIG, RNG, STONES, MODEL, FLICK, LAKE, AUDIO, RECORDS, DAILY, SHARE, INPUT, SAVE, TEST, BOOT`. `SIM_EXPORT`
markers wrap CONFIG through FLICK.

**CONFIG (frozen):**

```
GAME_ID 'gerplunk'  SAVE_KEY 'lw_gerplunk_v1'  SAVE_V 1
SIM_HZ 120  G 9.81  FLIGHT_MAX_S 25
MAGIC_DEG 20  WINDOW_DEG [8, 34]  V_MIN 2.5 (m/s)  V_MAX_FLICK 14
E0 0.55  LOSS0 0.12  LOSS1 0.10 (per ((deg - MAGIC) / 10)^2)  DRIFT0_DEG 4  SPIN_DECAY 0.06 (per skip)
FLAT_LIFT [0.6, 1.0]  ROUND_STAB [0.2, 1.0]  MASS_KG [0.03, 0.12]
RELEASE_WINDOW_MS 60  HOOK_WINDOW 0.4 (last fraction of the path used for spin)  SPIN_MAX 1.0
PX_PER_M at 375 wide: 9 (a 40 m throw fits the screen height with the camera)   CAM_LEAD_M 6
WIND_MAX 1.2 (m/s lateral)   WATER {glass: 1.0, ripple: 0.85, chop: 0.6} (window width factor)
BED_OFFERS 3  BED_REGEN_DAILY true   DAILY_THROWS 5
```

**STONES** (data): `{id, name, rarity, mass, flat, round, lift, line}` with the eight from 3.5; `line` is the one wistful
sentence each stone carries in the shore view.

**MODEL.** State `{x, y, z, vx, vz, spin, theta}` with `x` downrange, `z` height, `y` lateral (wind only). Between hits,
ballistic at `SIM_HZ`. A hit when `z <= 0` with `vz < 0`. The bounce succeeds when `theta` is inside `WINDOW_DEG` widened
by `round * ROUND_STAB` and narrowed by the water state, and the horizontal speed is at least `V_MIN`; then `vz = -vz * E0 *
lift * flat`, `vx = vx * (1 - LOSS0 - LOSS1 * ((theta - MAGIC) / 10)^2)`, `spin = spin * (1 - SPIN_DECAY)`, `theta = theta +
DRIFT0_DEG * (1 - spin) * (seeded sign) + seeded noise of 0.5 degrees`. A heavier stone loses less speed per skip (`LOSS0 *
(0.06 / mass)^0.3`) but leaves the hand slower for the same flick (`v * (0.06 / mass)^0.4`), which is the 2023 finding as a
strategy. Otherwise the stone sinks: gerplunk. Events per skip: `{t, x, interval}`; the trill emerges as `vz` shrinks, and
the sim reports the last five intervals for the gate.

**FLICK.** The Keepsies sampler shape: pointer samples `{x, y, t}` from the pointerdown on the shore; release velocity from
the last `RELEASE_WINDOW_MS` by least squares; `v = clamp(speed_px_per_s / PX_PER_M * 0.2, 0, V_MAX_FLICK)` (a fast thumb is
about 12 m/s); `theta = 8 + 26 * clamp(|dy| / |d|, 0, 1)` where the path's overall direction decides flatness (a stroke
that travels mostly up the screen is a lob; a stroke that travels across and up is flat); `spin = clamp(signed curvature of
the last HOOK_WINDOW of the path / 0.02, -SPIN_MAX, SPIN_MAX)` with the sign by the curl direction. A throw is `{v, theta,
spin, stone, seed}`.

**LAKE.** Canvas 2D, portrait. Dusk gradient sky, the far treeline (drawn as a silhouette; a painted strip later), the
water as horizontal bands with a sine shimmer keyed to the seeded stream and the wind, the shore at the bottom with the
three offered stones, the stone in flight as a silhouette with a glint, rings as expanding ellipses whose flattening
follows the perspective, the tally on the post, the slow motion on a record breaking final skip, the camera easing
forward with the stone at `CAM_LEAD_M`.

**AUDIO.** Web Audio, synthesised: ticks as short sine pings descending a pentatonic series (one per skip, from E5 down,
wrapping), the trill as the last ticks compressed, the plunk (a 120 Hz sine thump with a 80 ms noise splash through the
plate at wet 0.35), water lap (filtered noise pulses every 3 to 6 s), crickets (a 4 kHz chirp train, gain 0.05), a loon
(a sine gliding 660 to 880 Hz with vibrato over 1.2 s, every 40 to 90 s from the seeded stream). The audio is the score
readout: TEST asserts one tick event per skip.

**RECORDS.** Per stone type: best count, best distance, career skips; shore spots unlock at career skips 100, 400, 1000
(a new angle on the lake, a wind change).

**DAILY.** `dailySeedFor` sets the stone, the wind and the water for the day; five throws; the card with the five results.

**SHARE.** The replay image (arc, rings, count, date, the stone's name) at 1080x1350 through the Attic path; the Daily
link `#d=`.

**INPUT.** Pointer events, `touch-action: none`; the flick starts anywhere on the water below the horizon; a tap on a
shore stone picks it.

**SAVE.** `lw_gerplunk_v1`: `{v, records, career, spot, daily:{date, throws}, settings:{sound, motion}, seen:{how}}`.

**TEST.** Deepwell's harness; floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The physics (about 1 hour)

1. Scaffold. STONES, MODEL, FLICK pure.
2. `sim.js --test`: the perfect skimmer thrown at 12 m/s, 20 degrees, spin 1.0 skips **at least 15 times**; the same
   throw with spin 0 skips at most 3 (the angle drifts out of the window); the heavy flat at the same flick skips fewer
   times than the skimmer and its first leap is longer; the granite chunk never exceeds 4 skips at any throw in a 200
   throw sweep; every throw sinks within `FLIGHT_MAX_S`; the last five skip intervals of a 15 plus skip throw decrease
   monotonically (the trill); chop narrows the window (fewer skips than glass for the same throw); the same throw and seed
   give the same events; the flick mapping is monotonic (a faster path gives a higher `v`, a hooked path gives more
   `|spin|`, a flatter path gives a smaller `theta`).
3. Watch it fail: set `SPIN_DECAY` to 0.6 and the 15 skip assertion goes red; set `DRIFT0_DEG` to 0 and the no spin
   assertion goes red.
4. `sim.js --throw=12,20,1,skimmer` pasted into the ledger: every skip's time, distance and interval.

### P1. The lake (about 2.5 hours)

1. LAKE render, the shore with three stones, the flick, the flight camera, the rings, the ticks and the plunk.
2. **Stop and feel test.** Ten throws by a scripted thumb are not a feel test, so shoot what a human would see:
   `docs/shots/p1-flight.png` mid skip and `p1-gerplunk.png` at the sink, at 375x667. Open them. If the water reads as
   stripes rather than a lake at dusk, fix the band spacing, the shimmer and the horizon haze before P2. The design says ten
   minutes of throwing must be self justifying; that ten minutes is Stephen's on the phone.
3. `test/flick.mjs` (browser, real pointers at 375x667): a real 14 sample stroke across and up the water, 320 px in 180
   ms with a hook at the end, produces a throw with `v` over 8, `theta` under 24 and `|spin|` over 0.3 and at least 6
   skip events; a straight slow lob (60 px in 300 ms, mostly up) produces at most 2 skips; the tally on the post equals the
   event count; the readout line appears after the sink.
4. `test/audio.mjs` (browser, offline): a 10 skip throw renders 10 tick onsets (energy peaks) then the plunk; peak under
   0.99.
5. `test/layout.mjs`: 48 px at 375x667 and at 667x375; the bottom left 120x120 empty.

### P2. Stones, records, the daily lake (about 2 hours)

1. Stone inspection (the stone in the palm with its line), the pebble bed with daily regeneration and rarity by career,
   RECORDS per stone, shore spots.
2. DAILY with five throws and the card; SHARE image and link.
3. `sim.js --test` grows: the bed over 365 seeded days offers every stone at least once by career 1000 and never a rare
   before career 50; the daily seed moves with the date.
4. `test/daily.mjs` (browser): five real flicks fill the card; the link round trips in a fresh context showing the five
   numbers and the same stone.

### P3. Wind, water, polish (about 1.5 hours; where a night may stop)

1. Wind drift by day, the three water states, slow motion on records, reduced motion, the loon and crickets.
2. `tools/shots.mjs` at 412x915, 375x667, 320x568, 667x375; `tools/thumb.mjs` (a stone mid skip with three rings behind
   it); `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (portrait first, one hand, 48 px rendered at 375 wide)

- **The shore (home).** The lake fills the screen; three stones on the shore at the bottom, each 64 px, tap to pick (the
  picked one rises into the palm with its name and line for 2 s); the tally post at the top left; menu top right (48 px):
  Stones, Daily Lake, Settings, About. Bottom left empty. A flick anywhere on the water throws. First boot: "Flick a
  stone across the water." and nothing else.
- **After a throw.** The count grows on the post; at the sink, the folk line fades in for 3 s, then RETHROW (56 px) and
  SHARE (48) at the bottom right; a tap on the water throws again without them.
- **Stones.** Eight cards 72 px: silhouette, name, rarity, best count, best distance, career; locked ones are grey
  silhouettes with "not yet found".
- **Daily Lake.** The day's stone and conditions in one line, the five slots, the card after five, SHARE.
- **Settings.** Sound, Motion, About: the positioning line, "Sky Wolf Studio", and the design's note about the club that
  named the plunk.

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the game never waits on it)

Three sheets in `plans/gerplunk/ART-PACK-GERPLUNK.md` (a copy in 012Assets as `Gerplunk — Art Pack`). The water is drawn by
code and stays drawn.

| File | Used for | Delivered | In game |
|---|---|---|---|
| `treeline.png` | the far shore silhouette, black on white, keyed | 21:9 | `art/treeline.png` 1600x400 with alpha |
| `stones.png` | the eight stones on white, one sheet | 1:1 | `art/stone-<id>.png` 256x256 cut by Fable |
| `icon-mark.png` | PWA icon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

Stephen's own photo of the real treeline at Venus is welcome as sheet 1 instead of a prompt; the code only needs a
silhouette.

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Gerplunk", ds:"A lake at golden hour, a stone in your hand, and one flick. Angle, speed and spin decide the skips. Count them by ear and chase the record with no clock anywhere.", cat:"action", url:"/satellites/gerplunk/?v=<stamp>", ic:"🪨", thumb:"/portal-assets/thumbs/gerplunk.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED; `test/flick.mjs` passed
with real pointers; the flight shot was opened and judged.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9.
- A release velocity from two samples is noise (Inkswing 9); a least squares slope over 60 ms.
- The skip window test on `theta` must use the attack angle relative to the water, not the flight path angle; a stone
  thrown flat at 20 degrees attack with a falling path still skips. Keep `theta` as its own state.
- Spin drift must have a sign per throw from the seed, or every stone drifts the same way and the lake looks rigged.
- The camera must never lead past the stone's sink point; ease to the last ring.
- Ticks scheduled at frame time land late; schedule each at the sim's hit time from `currentTime` (the Windup rule).
- The joke stone must be a joke, not a trap: the granite chunk's line says so on the shore before you throw it.
- No red, no timer, no counter that runs against the player (section 0).

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's two open questions take these answers tonight:

1. **Name: GERPLUNK.** Stephen's folder and title; Stillwater and Skim stay in the morning report.
2. **The readout: after a sink only, as folk wisdom.** Section 3.4.

And one that is not in the design: **portrait first** (3.2), which Stephen decides with the shots.

Yours without asking: the dusk palette, the shimmer, the tick series, the stones' lines, the shore spot changes.

Stephen's, never guessed: price, store, the name, anything that names the real lake or the family, anything with money.

---

## 11. STEPHEN ONLY

The phone, at dusk if he can: ten minutes of throwing, no reading. Then the treeline photo if he wants the real one.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1 h, P1 about 2.5 h, P2 about 2 h, P3 about 1.5 h: about 7 hours. Expect 3,000 to 3,800
lines. **Where a single night stops well:** the end of P1 is the whole feeling (a lake, a flick, the ticks, the plunk);
stones and records make it a game; the daily is a bonus. If the clock says P1 cannot finish, land the flick and the ticks
before the rings; sound is the score.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

```
(empty; the first entry is P0 step 3 and 4)
```

---


### P0 step 1, 2026-09-06: the gate, failing

`satellites/gerplunk/tools/check.js` cloned from Fathom's, cut down to one gate,
run before a line of the game exists:

```
$ node tools/check.js
sim             FAIL  0s

================================================================

--- sim (wanted: GERPLUNK TEST OK) ---
Error: Cannot find module '/workspaces/lucid-winds/satellites/gerplunk/sim.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)
  code: 'MODULE_NOT_FOUND',

1 GATE FAILED
```


### P0 steps 2 to 4, 2026-09-06: the physics, tuned and proved

```
$ node sim.js --test
PASSED 110 / FAILED 0   (total 110)
GERPLUNK TEST OK

$ node sim.js --stones
every stone off one perfect flick, 12 m/s at the magic angle with full spin, on glass

  stone            rarity      skips     dist      time   first leap   ended
  Sandstone        common         15    16.1m     1.95s        2.67m   plowed
  Shale            common         16    23.1m     2.58s        3.93m   plowed
  Granite Chunk    common          2     3.2m     0.38s        0.53m   tumbled
  Perfect Skimmer  uncommon       17    28.7m     3.37s        4.63m   slow
  Heavy Flat       uncommon       15    29.4m     4.86s        5.25m   slow
  Sea Glass        rare           16    25.0m     2.49s        3.97m   plowed
  Fossil Stone     rare           17    27.0m     3.50s        4.48m   slow
  Lucky Quartz     rare           17    27.8m     3.37s        4.58m   slow
GERPLUNK STONES OK
```

The trill, every interval of the seventeen skip throw, in seconds. This is the
one the plan's P0 step 2 asks for and it is also the measurement that exposed the
collision model:

```
0.267  0.383  0.342  0.308  0.283  0.258  0.225  0.208  0.183  0.175
0.150  0.133  0.117  0.100  0.092  0.075  0.067
```

Built with the plan's `vz = -vz * E0 * lift * flat` instead, the same throw gave:

```
   5  t 0.808  x 9.13m  int 0.033s
   6  t 0.817  x 9.19m  int 0.008s
   7  t 0.825  x 9.23m  int 0.008s
   8  t 0.833  x 9.27m  int 0.008s
   9  t 0.842  x 9.31m  int 0.008s
  10  t 0.850  x 9.33m  int 0.008s
```

Five skips inside three hundredths of a second covering fourteen centimetres,
every interval pinned to the 1/120 s timestep. Not a trill.

What a bad throw does, which is the skill gradient:

```
  no spin      3 skips  11.1m  tumbled
  too steep    0 skips   3.5m  tumbled
  too flat     1 skips   3.5m  tumbled
  half spin    5 skips  15.1m  tumbled
```

Every assertion watched to fail:

```
$ node sim.js --test --over=SPIN_DECAY=0.6
FAIL  a perfect skimmer at the magic angle with full spin skips at least fifteen times   [4 skips]
$ node sim.js --test --over=DRIFT0_DEG=0
FAIL  the same throw with no spin tumbles in three or fewer   [20 skips]
$ node sim.js --test --over=IRREG=0
FAIL  the granite chunk never beats four skips however it is thrown   [best was 7]
$ node sim.js --test --over=MASS_LIFT_P=0
FAIL  and its leaps are longer, which is the whole reason to pick it   [2.77m vs 5.83m]
$ node sim.js --test --over=CURL_REF=100000
FAIL  a hard wrist roll is worth at least six tenths of the spin   [0.00]
$ node sim.js --test --over=METRES_PER_CSS_PX=0.000528
FAIL  and an ordinary stroke still has somewhere to go   [14.00 against a ceiling of 14]
FAIL  a thumb crossing 320 pixels in 60 milliseconds is moving 1.41 metres per second   [got 2.816]
$ node sim.js --test --over=HOOK_WINDOW=1.0
FAIL  the wrist does not change the angle the arm threw at   [the angle moved 0.868 degrees]
```

And the sweep, which refuses to agree with itself if the shipped numbers drift:

```
$ node sim.js --sweep
swept 192 points of SPIN_DECAY, LOSS0, MASS_LIFT_P, IRREG
30 of them satisfy every P0 assertion at once
the shipped constants (SPIN_DECAY 0.015, LOSS0 0.08, MASS_LIFT_P 1.05, IRREG 28)
are in the passing set.
GERPLUNK SWEEP OK
```

It earned its keep the hour it was written: it caught IRREG still sitting at 6
while the comment above it claimed 28.

### P1, 2026-09-06: the page, the gates, and the two watched to fail

```
$ node tools/check.js
lint            pass  0s
sim             pass  0s
sweep           pass  3s
flick           pass  21s
layout          pass  13s

ALL GATES PASSED
```

The flick gate, the lines that carry the plan's P1 step 3 numbers, from a real
14 sample stroke dispatched on the real canvas with real time between samples:

```
  ok    the page recorded the stroke: 15 samples over 184 ms
  ok    v over 8: 9.90
  ok    theta under 24: 17.5
  ok    |spin| over 0.3: 0.81
  ok    at least six skip events: 8 skips, 12.3 m, tumbled
  ok    the tally grows in flight and matches the page: 1 on the post, 1 shown
  ok    at the sink the post says 8 and the model counted 8
  ok    one tick was scheduled per skip: 8 ticks for 8 skips
  ok    the readout line appears after the sink: "A shade higher off the water."
  ok    a 60 px push over 300 ms is a set down, not a throw
  ok    and because it was slow and sideways it was a plant: the lake turned -9.0 to -2.9 and the turn survived the set down
  ok    the lob was a throw (v 4.5, theta 27.3)
  ok    and it died inside two skips: 1
  ok    a 120 px slide before the throw turned the lake right: -2.9 to 10.8 degrees
```

Watched to fail. The post made to lie by one (`String(P.next + 1)`):

```
  FAIL  the tally grows in flight and matches the page: 2 on the post, 1 shown
  FAIL  at the sink the post says 9 and the model counted 8
2 FLICK FAILURE(S)
```

MENU shrunk to 40 px:

```
  FAIL  375x667  MENU  40x40
  FAIL  320x568  MENU  40x40
  FAIL  412x915  MENU  40x40
3 LAYOUT FAILURE(S)
```

And the gate's own first draft going red on correct code, which is the
finding worth keeping: it expected the slow push not to turn the lake.

```
  FAIL  while the throws before it, with no slide, did not move it (-9.0 then -2.9)
```

The throw table, `node sim.js --throw=12,20,1,skimmer`:

```
  skip      t        x        interval      vx     theta
     1    0.267s     3.50m       0.267s    12.07     18.79
     2    0.650s     8.13m       0.383s    11.09     18.10
     3    0.983s    11.82m       0.333s    10.16     17.99
     4    1.275s    14.79m       0.292s     9.31     17.94
     5    1.542s    17.27m       0.267s     8.52     16.97
     6    1.783s    19.33m       0.242s     7.76     17.42
     7    1.992s    20.94m       0.208s     7.09     17.25
     8    2.192s    22.36m       0.200s     6.47     17.86
     9    2.367s    23.49m       0.175s     5.92     16.60
    10    2.533s    24.48m       0.167s     5.38     16.42
    11    2.675s    25.24m       0.142s     4.88     16.26
    12    2.800s    25.85m       0.125s     4.42     15.57
    13    2.917s    26.37m       0.117s     3.98     15.28
    14    3.017s    26.77m       0.100s     3.57     14.31
    15    3.100s    27.06m       0.083s     3.17     14.15
    16    3.175s    27.30m       0.075s     2.81     12.54
    17    3.242s    27.49m       0.067s     2.43     12.19
  17 skips, 27.49 m, 3.24 s, and it ended: slow
```

The audio gate, and the finding it made (the beat removed by mutation):

```
  ok    the middling throw is a ten skip throw: 10 skips
  ok    it renders one onset per skip and one for the plunk: 11 onsets for 10 skips
  ok    and every tick of the trill is its own onset: 18 onsets for 17 skips
  ok    the last two hits are under 90 ms apart, which is the trill: 67 ms
  ok    every tick lands within 16 ms of its skip: worst 13.3 ms
  ok    and the plunk lands at the sink: 3370 ms against 3362 (slow)
  ok    a stone that ran out of speed goes under a beat after its last tick: 120 ms
  ok    the peak stays under 0.99: 0.570 and 0.803
  ok    a throw that never skips renders the plunk alone: 1 onset for 0 skips
AUDIO OK

$ (sinkTimeOf made to return res.time)
  FAIL  it renders one onset per skip and one for the plunk: 10 onsets for 10 skips
  FAIL  and every tick of the trill is its own onset: 17 onsets for 17 skips
  FAIL  a stone that ran out of speed goes under a beat after its last tick: 0 ms
3 AUDIO FAILURE(S)
```

The suite at 13:22Z: lint, sim, sweep, flick 19s, layout 13s, audio 5s, ALL GATES PASSED.

The listed path, booted through the repo root server with the real `/music-unlocks.js`
at 412x915 (13:26Z): no console errors, no failed requests, the worker registered
under `/satellites/gerplunk/`, and the music chip seated at 10,857 (97x48) in the
empty bottom left, clear of Sandstone. Shot: `docs/shots/p1-lake-tall.png`.

The shots, all opened, faults named in SESSION STATE: `docs/shots/p1-flight.png`
(stone up between skips two and three with the shadow under it and the sun
road behind), `p1-gerplunk.png` (the word on the water, the rings, the folk
line), `p1-shore.png` (the seam bending right with the crosswind),
`title-tall.png`, `title-mid.png`, `title-small.png`, `p1-lake-tall.png`,
`p1-lake-small.png`. `docs/thumb.png` 512 px, 29 KB.

### P2 step 1 and the three faces, 2026-09-06 14:25Z: bed, records, faces, six gates

```
$ node sim.js --test
PASSED 157 / FAILED 0   (total 157)
GERPLUNK TEST OK
$ node sim.js --test --over=BED_RARE_CAREER=0
FAIL  never a rare stone before career 0   [expected 0, got 280]
PASSED 141 / FAILED 1   (total 142)
$ node sim.js --test --over=BED_GIFT_CAREER=0
FAIL  a fresh hand finds the skimmer on the bank every day of a year   [expected 365, got 177]
$ node sim.js --test --over=LEE_REACH_M=99
FAIL  a perfect throw in the lee runs up on the spit   [expected beached, got slow]
FAIL  so the record lives on the main water   [17 vs 17]
FAIL  and the spit is where the stone stopped   [27.489924272373003]
$ node sim.js --test --over=LEE_WIND=1
FAIL  the lee shelters the wind and the bay does not   [1 1 1.5]
$ node sim.js --test --over=WATER_RIPPLE=1.0
FAIL  ordinary throws die in the bay that live on the main water   [0 angles worse, 0 better, 114 vs 114]
$ node sim.js --throw=12,20,1,skimmer
  17 skips, 27.49 m, 3.24 s, and it ended: slow
$ flock -w 1800 /tmp/sws-gate.lock node tools/check.js
lint            pass  0s
sim             pass  0s
sweep           pass  3s
flick           pass  21s
layout          pass  18s
audio           pass  4s
ALL GATES PASSED
(second run of the suite: flick failed once; node test/flick.mjs alone twice: FLICK OK, FLICK OK)
$ flock -w 1800 /tmp/sws-gate.lock node tools/shots.mjs p2-lee,p2-bay
  (p2-lee offers sandstone, shale, skimmer; day water ripple, face lee on glass)
  (p2-bay offers sandstone, shale, skimmer; day water ripple, face bay on chop)
SHOTS OK
```
Shots opened: `docs/shots/p2-bank.png`, `p2-bank-late.png`, `p2-lee.png`, `p2-bay.png`,
`p1-shore.png`, `p1-lake-small.png`. Faults named in SESSION STATE.

### P2 step 1b, 2026-09-06 14:32Z: the land

```
$ node tools/lint.mjs                      LINT OK
$ node sim.js --test                       PASSED 157 / FAILED 0   GERPLUNK TEST OK
$ flock -w 1800 /tmp/sws-gate.lock node tools/shots.mjs p2-lee,p2-bay,p1-shore   SHOTS OK (three rounds)
$ flock -w 1800 /tmp/sws-gate.lock node test/layout.mjs   LAYOUT OK
$ flock -w 1800 /tmp/sws-gate.lock node test/audio.mjs    AUDIO OK
```
p1-shore, p2-lee, p2-bay opened after each of the three rounds; faults and fixes in SESSION STATE.

### P2 step 2, 2026-09-06 14:58Z: the daily lake

```
$ node sim.js --test                       PASSED 167 / FAILED 0   GERPLUNK TEST OK
$ node sim.js --test --over=DAILY_THROWS=6
FAIL  a link with six throws is refused    PASSED 166 / FAILED 1
$ flock -w 1800 /tmp/sws-gate.lock node test/daily.mjs     (14:48Z, before the card fixes)
DAILY OK
$ flock -w 1800 /tmp/sws-gate.lock node test/daily.mjs     (14:57Z, after the card fixes)
FAIL  on the same day with the same stone: heavyflat on 2026-09-06   (the gate's ISO against the worded date; fixed, not rerun)
$ node tools/lint.mjs   LINT OK     $ node sim.js --sweep   GERPLUNK SWEEP OK
```
Shots opened after the fixes: `docs/shots/p2-daily.png`, `p2-card.png`, `p2-card-link.png`.

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `flick, audio,
daily, layout`.

---

## 15. THE MORNING REPORT

### Carried into P1 and P2 from the aim design panel, 2026-09-06

Built tonight: the plant, `THROW_SPEED` as one constant with two roles, the arm
onset on two consecutive slow segments, the arc length arm and wrist split, the
angle form of rise, and the set down.

**P1 owes the turn a body.** The world yaws under the thumb: the treeline
scrolls at about 8 px per degree so a landmark at one end of the axis is off
screen at the other, the sun path on the water swings, the shoreline pivots. That
is the difference between standing at a lake and dragging a cursor. A five degree
haptic detent lets a player count the turn without looking at it, 39 px of thumb
per tick.

**P1 owes the turn an instrument: the seam.** A lane of the water goes calm from
under the thumb out to the far trees, drawn as the MODEL'S OWN TRACE at a nominal
good throw, so it cannot lie about the wind. It is BENT by the day's wind and it
straightens as the player turns into it. This is how the wind is taught without a
word of copy, and it is the only instrument the game has.
⛔ If P1 runs out of clock, ship the seam against a fixed world rather than
cutting the seam. Never cut the seam.

**P2 owes aim a job: three faces of one lake.** Left past the point, short water
in the lee that forgives a bad angle, which is where you go for a count when it
is choppy. Straight ahead, the main water, where the record lives. Right past the
bay mouth, water that runs forever with nothing to stop the wind, which is where
you go when you are being greedy and where half your throws die at six. Proven in
the shipped model: an off magic throw (theta 13) on chop gives 13 skips at the
spit, 0 on the main lake and 0 in the bay. The anchors are `SHORE_REACH` and
`SHORE_SHELTER` in the panel output.

**Five Director calls, with recommendations, none of them blocking:**

1. **The starting stance.** A fresh save faces 9 degrees off centre so the seam
   is visibly bent on throw one and the lake is discoverably turnable. Costs
   nothing mechanically. Recommendation: keep it.
2. **The daily lake and the line.** Either everyone throws the same line so five
   results compare cleanly, or everyone picks their own and the wind and the
   three faces are part of the puzzle. Recommendation: let them pick, because
   forcing the line deletes the only thing aim is for.
3. **The dead band.** A release under 758 px/s of thumb is a set down rather than
   a weak throw, which deletes a real one to six skip band from the bottom of the
   range. Recommendation: keep it, it is what makes changing your mind free. It
   is a taste call.
4. **`TURN_DEG_PER_M` 480.** The one number only his thumb can settle: 197 px of
   drag covers the whole aim axis. Too fast to sit on a line, drop toward 320;
   needs a re grip to reach the spit, raise toward 640.
5. **The theta mapping is free tonight and not free later.** Moving flatness from
   the sine of the angle to the angle itself re grades every throw. No records
   exist yet, so it costs nothing now. Taken tonight for that reason.


The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the throw table**
from `--throw`, pasted.
