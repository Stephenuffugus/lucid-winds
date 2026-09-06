# HANDOFF UPDRAFT, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from
`docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-UPDRAFT.md` (Stephen's design, read in full) plus the fleet
on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then `plans/fathom/HANDOFF-FATHOM.md` sections 0, 2, 9,
14 and 15, then this file, then the design. Where they differ, this file wins; every difference is in section 3.
**Game folder:** `satellites/updraft/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/updraft/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written. Nothing built. Next action: section 5, P0, step 1.
- 2026-09-06 13:33Z, a 110 minute builder (Fable 5.1): **P0 DONE** (`fd30aaa2`), **P1 DONE** (`9df87105`, `c2b39b31`, `314f70bf`, and the strip commit after `b482af76`): the page plays on a phone; `ALL GATES PASSED` five gates (lint, test 71 assertions, audio, fly with real pointers, layout at 375, 320 and 412 wide); every gate watched to fail once (section 13); shots opened and judged. NOT built: all of P2 (the mood picker is the pause MOOD button cycling gentle, fresh, blustery; gusts, Mabel and the snap all RUN in the model and on screen but have no P2 shots; trick stamps ARE on screen in calligraphy; no journal screen, no kite picker, no unlocks) and all of P3 (no Real Wind, no daily, no share; the sky DOES follow the device clock, `?hour=19` forces dusk). Corrections to the plan's numbers are in `satellites/updraft/docs/DECISIONS.md` (fourteen lines; the big ones: REEL_RATE 2.5 with REEL_BOOST 6, PAYOUT_RATE 10 only while the kite pulls, STALL_V 1.6, EL_MAX 1.0, apparent mass 0.4 kg, own speed only ever subtracts from airspeed).
  **Next action:** P2 step 1 in `satellites/updraft/index.html`: a MOOD screen (`#scrMood`, three 72 px cards Gentle, Fresh, Blustery reached from the pause MOOD button and the top left chip) replacing `cycleMood`; then the soft loss copy on a snap (the end screen already says THE LINE SNAPPED and toasts the friend); then `tools/shots.mjs p2-mabel` (place the kite at az 0.70, el 0.2, L 34 and wait for `state().snagged`), `p2-stamp` (the loop script from `sim.js` SCRIPTS.loop with a real thumb), `p2-journal`. Add `#scrMood` buttons to `test/layout.mjs`.
  **Faults seen in the shots, for the next session (the morning reader's list):** `p1-dive.png` is six panels (the camera slows the sim to a fifth through `UPDRAFT_DEV.timeScale`, a camera liberty, never a gate's) and in it the kite dives right and ends 7 m up beside Mabel's crown, which is the snag waiting to happen on a phone; in the last panel the tail leads the kite (a whip, honest, but check it on the phone); the dandelion tufts are small; the real thumb dive in the strip did not stamp Dive Bomb (the sim script does; the thumb's timing under swiftshader is coarse, worth a phone check); `p1-park.png` the kite at 67 m is a small mark and its tail a stub, honest for the distance but thin; the reel at the bottom reads as a gold coin; Mabel's crown is six flat circles; the tall title still leaves the lower third empty; `docs/thumb.png` a freshly placed kite's tail hangs straight down for a second.
  **Director call taken:** none beyond DECISIONS.md. The name UPDRAFT, Blustery only snap, Real Wind in settings stand as the plan says.
  **For Fable:** the card in section 8 is true: `docs/thumb.png` is 32 KB, the stamp is `20260906a`, no dashes in the copy. Nothing outside the fence was touched. Music chip seat: the bottom left 120x120 is asserted free at three widths.
- 2026-09-06 14:40Z, a 40 minute builder (Fable 5.1, 14:03 to 14:45 hard stop): **P2 screens DONE, P2 as a whole DONE except the landing flourish, P3 step 2 half done (the haptics toggle), the rest of P3 NOT STARTED.** Commits `094b68dd` (the MOOD screen, `#scrMood`, three 72 px cards Gentle, Fresh, Blustery reached from the pause MOOD button and the play chip, returning to where it was opened; `cycleMood` deleted), `9eca2c0a` (shots p2-mood, p2-mabel, p2-stamp), `cf5dbeff` (the JOURNAL screen, `#scrJournal`, bests, hours, flights and the stamps in calligraphy, from pause and from the end screen), `12f5a785` (the KITES screen, `#scrKites`, five cards built from KITES, `kiteUnlocked` reads CONFIG.UNLOCK against the journal: Delta at 0.5 h, Box at 2 h, Sled at ten Loops, Dragon at one High Park; locked cards name the feat and toast it on a tap; picking on the grass swaps the kite in hand, aloft it waits for the next flight). Stamp `20260906d` in all three places. `test/layout.mjs` now walks every new screen from every door at three widths (mood cards 72 px, kite cards 64 px, journal rows counted, four locked kites on a fresh journal) and each addition was watched to fail (section 13). What already RAN in the model from P1 and is now reachable and shot: the gusts, the three moods, Blustery only snap with the soft loss toast, Mabel and the wiggle rescue, the trick stamps.
  **Not built:** the landing flourish (a clean landing is a word on the end screen and nothing on the field); every part of P3 (no WEATHER, no Real Wind toggle or honesty line, no Daily Wind or `#w=`, the CLOCK palette exists from P1; the HAPTICS toggle IS built, commit after `989d300c`: a HAPTICS ON/OFF button on the pause screen under SOUND and MOTION writing `settings.haptics`, gated at three widths and watched to fail when the save was not written). No Settings or About screen: sound and motion live on the title and pause screens as before. No silhouettes on the kite cards (the art pack's kites sheet is not delivered; the cards are name and line).
  **Faults seen in the shots:** `p2-mood.png` clean, the picked card is outlined in the red with a tick, the sky ghosts through the veil at 96 percent (kept, a soft screen); `p2-mabel.png` the kite is honestly inside the crown at 7 m with the line running into it, but the snag toast at 14 percent overlaps the sun and, because the camera placed the kite within five seconds of boot, the first boot hint is on screen at the same time (two messages at once; on a phone the first snag will not be that early, left alone), and the dashed snag circle reads a little like a debug overlay; `p2-stamp.png` the Loop stamp lands right under a kite at 21 m and could touch it at a lower altitude, and the tail bunches left mid loop (honest); `p2-journal.png` the counts sat above the cursive baseline, fixed with align-items center before the commit; `p2-kites.png` the padlock emoji is louder than the rest of the type, and the cards want the silhouettes.
  **Next action:** P2 last piece, the landing flourish in `index.html` (on `ended === 'clean'` a settle: the kite lies flat on the grass, the tail lays out downwind over a second, a soft chord; then the end screen); then the rest of P3 step 2 (reduced motion already drops the parallax; check the tail crack flash honours it); then P3 step 1: WEATHER behind a Real Wind toggle on a new `#scrSettings` (default OFF, no network call until the player turns it on, the honesty line under 3 mph, the Wardian fetch shape from `plans/wardian/HANDOFF-WARDIAN.md` section 2), the mood screen's fourth card when it is on; then the Daily Wind with the `#w=` link. Shots for each, opened.
  **Director calls taken:** none new. The kite unlock feats are the plan's (3.8 and CONFIG.UNLOCK) read literally: ten Loops for the Sled, one High Park for the Dragon.
  **For Fable:** the stamp is `20260906d`; bump the arcade card's `?v=` when you push. Nothing outside the fence was touched. The gate table result is pasted at the end of section 13.
- 2026-09-06 14:59Z, the same builder on an extended clock (14:29 to a stop called at 14:58): **P2 DONE, P3 steps 1 and 2 DONE, P3 step 3 (shots at three sizes, thumb, ART_ASSETS, BUILD-NOTES, morning report) NOT DONE.** Commits `01c7ea4c` (the landing flourish: after a clean landing or a tumble the tail keeps moving 1.4 s in a ground breeze with the grass as a floor and lays out beside the kite, the kite lies flat or flops, a soft chord or a thud, the end screen waits; sim suite `settle`, 76 assertions, watched to fail on SETTLE_S=0; Mabel's snag mark is eight loosened leaves round the crown, not a dashed ring; the toast moved from 14 to 26 percent, off the sun), `fdac2472` (Real Wind as the fourth card on the MOOD screen, off by default, nothing fetched until tapped, geolocation 6 s with a waiting state, Open-Meteo no key, hour cache in the save, a failed feed said on the card and retried no sooner than ten minutes, the honesty line under 3 mph flying Gentle, the real mph replacing the base only with the rules' mood by band; `test/weather.mjs` counts requests at the network from the first byte and answers with literal numbers; watched to fail when the calm branch was removed; one tick on the mood screen), and the Daily Wind commit after it (DAILY WIND on the title, seed = date, mood from the seed, called at 180 s with TIME. THE DAILY WIND IS FLOWN, tally in the journal, `#w=<date>.<alt>.<initials>` link read back into words and FLY THEIR WIND on the title, SHARE on the end screen and in the journal; `test/daily.mjs` boots the same link twice and requires the same seed and mood). Stamp `20260906e` in all three places. Seven gates now: lint, test 76, audio, fly, layout, weather, daily. All seven were green at 20260906e in this session, one at a time under the lock (fly once, after the flourish; the suite as one table NOT rerun after the Daily Wind, the stop came first).
  **Not watched to fail:** `test/daily.mjs` (green once; the stop was called). The mutation that should bite: make `DAILY.seedFor` use `Date.now()`, and the two boot assertion goes red.
  **Faults seen in the shots:** `p2-landing.png` the laid out tail is a short white stub after a tumble (SETTLE_WIND raised 3 to 5 after the shot, not reshot), the first boot hint sits over the landing (a camera artefact, the kite is placed within five seconds of boot); `p2-mabel.png` the leaves read as the tree's own mark, the toast is clear of the sun, still three lines; `p3-realwind.png` first take had two ticks (fixed, asserted, reshot), the lower third is empty; `p3-realwind-field.png` the wind line under the chip is faint at .7 rem over sky; `p3-daily-title.png` the toast sits over the title art's kite and the date reads as raw 2026-09-06, wants "today" or a spoken date; `p3-daily-journal.png` the date wraps to two lines in the narrow left column, the row wants the date in the right column or shortened.
  **Next action:** watch `test/daily.mjs` fail once (the seedFor mutation above), then run the whole table `flock -w 1800 /tmp/sws-gate.lock node tools/check.js` and paste it into section 13; then the two copy faults (the daily date as words on the toast and the journal row); then P3 step 3: `tools/shots.mjs` title at three sizes and a dusk field, `tools/thumb.mjs` regenerated at 20260906e (the tail cracking), `ART_ASSETS.md` and `BUILD-NOTES.md` brought up to the seven gates and the four new screens, the morning report; then reduced motion on the leaves and the tail flash (the leaves already hold still when MOTION is off).
  **Director calls taken:** three in `docs/DECISIONS.md`: Real Wind is the fourth mood card, not a Settings toggle (no Settings screen exists); Real Wind picks the RULES mood by band (Gentle under 4 m/s, Fresh under 6.7, else Blustery, so a 16 mph day can snap); a failed feed is retried no sooner than ten minutes. The Daily Wind's mood is drawn from the date seed (40 percent Gentle, 40 Fresh, 20 Blustery) and Real Wind never touches it.
  **For Fable:** the stamp is `20260906e`; bump the arcade card's `?v=`. Nothing outside the fence was touched.

---

## 0. RULES OF ENGAGEMENT

As `plans/fathom/HANDOFF-FATHOM.md` section 0 with `updraft` for `fathom`. One law particular to Updraft: **the whole
control surface is hold, release and slide.** No buttons during a flight, no second thumb. Every trick, save and landing
in the design comes from those three, and a feature that needs a fourth verb is not built tonight.

---

## 1. WHAT UPDRAFT IS, AND WHY IT IS WORTH A NIGHT

From the design: *"A field, a sky, a kite, your thumb on the string. Press to reel in, release to let line out, slide
left and right to lean it. That is the whole control surface, and it is enough for loops, dives, figure eights, stall and
catch saves, and long lazy afternoons. The line bows in a real catenary. The tail streams and cracks like a ribbon. On gusty
days it fights you."* Positioning line: **"Go fly a kite. Right now. In today's wind."** And the design's own note: a kite
app from a studio called Lucid Winds is practically contractual.

Why it is worth a night: the mobile kite genre is all fighting games; the peaceful one is unserved; the fleet already has
the weather feed (Wardian plan), a verlet rope (No Pain No Gain), and the clock palette. The risk is feel: the dive and save
must make someone gasp, and the design says to tune until it does; the P0 gate can at least prove the stall, the save, the
launch rhythm and the loop exist in the numbers.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| A verlet rope | `satellites/no-pain-no-gain/index.html` lines 274 to 285 (`integrate`, `satisfy`) | Position and previous position per point, air drag as a velocity multiplier (`AIRF`), distance constraints satisfied in two passes. The tail is sixteen of these hung from the kite |
| Real wind, cached, silent on failure | `plans/wardian/HANDOFF-WARDIAN.md` section 2 (the main game's `fetchWeather`, `index.html` 90222 to 90245) | The Open-Meteo URL with `windspeed_10m,winddirection_10m` added to `current`; hourly cache; never on boot; the honesty line for calm days |
| Geolocation that never soft locks | `plans/asterism/HANDOFF-ASTERISM.md` 3.6 | A button, a 6 s timeout, a visible waiting state |
| Sky palette by the device clock | `plans/wardian/HANDOFF-WARDIAN.md` section 3.5 and 4 CLOCK | Dawn, day, dusk, night bands by hour |
| Share by link | `satellites/blockspace/index.html` 1060 to 1080 | `#w=` for the Daily Wind tally |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `updraft` in place of `fathom` |
| Headless audio gate | `satellites/keepsies/test/audio_budget.mjs` | For the wind bed and the line whine |

Not inherited: any physics library, three.js.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **The model is a kite on a sphere, written down.** The design describes lift, drag, tension and a wind window in prose.
Section 4 gives the state, the forces and the numbers, so the flight is transcription and the P0 suite is the test spec.

3.3 **Snap risk is Blustery only.** The design recommends it; taken. Gentle and Fresh never snap; Blustery snaps after
the strain shudder if the hold continues.

3.4 **Real Wind lives in Settings with a journal hint.** The design recommends it; taken (the Wardian answer).

3.5 **Real Wind is honest, including about calm.** Under 3 mph the app says "Barely a breath today. The Gentle field is
open." and flies Gentle; it never invents wind.

3.6 **The Tree has a name and a rule.** Its name is Mabel (yours to change in DECISIONS; never "the tree"). Its snag zone is
a circle around its crown; a kite entering it below 12 m altitude is snagged; the rescue is three alternations of reel and
release inside 4 s (the wiggle), or the line is let out fully and the kite comes free as it drifts. A snag never ends a
flight.

3.7 **Trick stamps are quiet and named in calligraphy, and there is no score.** The journal counts them; the sky never
does.

3.8 **Kites unlock by flight hours and feats, never currency.** The design says so; the thresholds are in CONFIG.

3.9 **Copy.** No dashes, no exclamation points. Mood names: Gentle, Fresh, Blustery. Kite names: Diamond, Delta, Box,
Sled, Dragon.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/updraft/`):

```
index.html            the game
sim.js                --test, --fly=<mood>,<script> (a hold/release/slide script, prints altitude and heading per 0.25 s)
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/fly.mjs  test/audio.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers: `CONFIG, RNG, KITES, WIND, FLIGHT, TAIL, TRICKS, FIELD, AUDIO, WEATHER, CLOCK, JOURNAL, SHARE, INPUT, SAVE, TEST,
BOOT`. `SIM_EXPORT` markers wrap CONFIG through TRICKS.

**CONFIG (frozen):**

```
GAME_ID 'updraft'  SAVE_KEY 'lw_updraft_v1'  SAVE_V 1
SIM_HZ 120  LINE_MAX 120 (m)  LINE_MIN 4  REEL_RATE 6 (m/s)  PAYOUT_RATE 4
MOODS {gentle: 2.7, fresh: 5.4, blustery: 8.0} (m/s at 10 m)   GUST_AMP {gentle: 0.15, fresh: 0.35, blustery: 0.6}
PROFILE_TURB_H 8 (m; below this the wind is 0.5 x and noisy)   THERMAL_UP 1.5 (m/s)  THERMAL_R 12
STALL_V 2.2 (m/s airspeed)  LEAN_TURN_RATE 2.2 (rad/s per unit lean at 6 m/s airspeed)
SNAP_TENSION 1.0 (of the kite's max, Blustery only)  SNAP_HOLD_S 0.4  STRAIN_AT 0.75
TAIL_PTS 16  TAIL_SEG 0.35 (m)  TAIL_AIRF 0.94
CAM_LEAD 0.35  GROUND_Y 0
UNLOCK {delta: 0.5 h, box: 2 h, sled: 'ten loops', dragon: 'a high park of 60 s'}
TAP_SLOP 8  SLIDE_GAIN 1 / 90 (lean per CSS px)  DAILY_FLIGHT_S 180
```

**KITES** (data): `{id, name, area, mass, CL, CD, tailLen, stability, maxTension}`: Diamond (0.5 m2, 0.12 kg, CL 1.1, CD
0.35, stability 0.6), Delta (0.7, 0.16, 1.3, 0.3, 0.85), Box (0.6, 0.22, 0.9, 0.5, 0.95), Sled (0.6, 0.10, 1.2, 0.4,
0.7), Dragon (0.4, 0.14, 1.0, 0.45, 0.5, tail 6 m).

**WIND.** `wind(x, y, t)` = base vector (into the screen, magnitude by mood) times the altitude profile (`0.5 + 0.5 *
smoothstep(0, PROFILE_TURB_H, y)`), plus gusts (three seeded sines in time at 0.05, 0.13 and 0.31 Hz summed and scaled
by `GUST_AMP`, plus a spatial term), plus the thermal column over the sunny patch (upward `THERMAL_UP` inside `THERMAL_R`,
marked by drifting dandelion seeds). Real Wind replaces the base magnitude only.

**FLIGHT.** The kite lives on a sphere of radius `L` (the paid out line) centred on the anchor (the player at the bottom
centre of the field). State: `az` (across, radians, 0 straight downwind), `el` (elevation), their rates, `L`, `heading`
(the kite's nose direction in the sky plane, radians), `tension`. Apparent airspeed `Va = W_eff + reelSpeed - vAlongWind`
where `W_eff = |wind| * cos(az) * cos(el)` (the wind window: power fades toward the edges and the zenith) and `reelSpeed` is
positive while reeling in. Lift `0.5 * 1.2 * Va^2 * area * CL` acts along the kite's heading in the sky plane (a single line
kite goes where its nose points); drag `0.5 * 1.2 * Va^2 * area * CD` pushes toward the window edge (downwind); gravity
pulls `el` down; the line constrains the kite to the sphere and its tension is the radial component of the sum, floored at
0. The heading turns at `LEAN_TURN_RATE * lean * (Va / 6)` per second; without lean it relaxes toward "up" at `stability`
per second (the tail's pendulum stability). Stall: when `Va < STALL_V` the lift collapses to 0.15 of itself and the heading
falls toward "down" at 2 rad/s (the flutter); a reel within the fall restores `Va` and the kite catches. Reel: `L` shrinks
at `REEL_RATE` while held, `L` grows at `PAYOUT_RATE` while released and the kite is above 3 m. Ground: `el <= 0` ends the
flight (a clean landing if `Va < 3` and `|lean| < 0.2`, else a tumble; both soft). Launch: the kite starts on the grass at
`L = 8`; the profile's turbulence keeps `Va` near `STALL_V`; each reel pulse adds `REEL_RATE` to `Va` for its duration, so
the tug and release rhythm walks the kite up through the layer.

**TAIL.** Sixteen verlet points hung from the kite's tail point, drag against the apparent wind projected into the sky
plane, `TAIL_AIRF`, two constraint passes; the tip's speed over 8 m/s cracks (a sound and a 1 px flash at the tip).

**TRICKS.** A recogniser over the last 8 s of `(az, el, heading)`: Loop (heading winds through 2 PI within 4 s), Figure 8
(two loops of opposite sign within 8 s), Dive Bomb (el falls 0.5 rad in under 1.5 s then rises 0.2 within 1 s of the low
point), Stall Save (a stall flag then `Va > STALL_V` within 1.2 s while `el > 0.1`), Sky Write (heading rate under 0.4
rad/s and `el` between 0.4 and 1.0 for 10 s), High Park (the same for 60 s). Each stamps once per flight per type with a
calligraphy card.

**FIELD.** Canvas 2D, portrait. Painterly layers: the grass with parallax wildflowers at the bottom, the sky (the clock
palette), cumulus drawn from seeded circles, Mabel the oak upwind, the sunny patch with dandelion seeds, the kite drawn
as a wobbling quad (vertex wobble by tension), the line as a 1 px catenary from the anchor to the kite with sag `w L^2 /
(8 T)` clamped (a taut line is straight), the tail as a ribbon through the verlet points, the trick stamps. The camera
follows the kite with `CAM_LEAD` and keeps the field anchored at the bottom.

**AUDIO.** Synthesised: the wind bed (filtered noise whose gain and cutoff follow the gust state, so the ear hears the gust
before the kite feels it), the line whine (a sine at 200 to 900 Hz by tension above `STRAIN_AT`), the tail flutter and
crack, the fabric luff on stall (a slow noise flap), meadow birds (a seeded chirp every 10 to 25 s). Haptics:
`navigator.vibrate` on gust bumps (10 ms), the strain shudder (30 ms), a trick stamp (15 ms).

**WEATHER, CLOCK.** The Wardian patterns; Real Wind behind the toggle; the sky by hour.

**JOURNAL.** Best altitude, longest flight, tricks caught, flight hours, the kites unlocked; the Daily Wind tally.

**SHARE.** `#w=` = the date seed and the tally; the recipient flies the same gusts.

**INPUT.** One pointer: down anywhere = hold (reel), up = release (pay out), horizontal movement while down = lean
(`SLIDE_GAIN` per px from the down point, clamped to plus or minus 1), `pointercancel` = release. No second pointer.

**SAVE.** `lw_updraft_v1`: `{v, journal, kite, mood, settings:{sound, motion, realWind, haptics}, weatherCache, seen:{how}}`.

**TEST.** Deepwell's harness; floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The flight, headless (about 1.5 hours)

1. Scaffold. KITES, WIND, FLIGHT, TAIL, TRICKS pure with a scripted input `{t, hold, lean}`.
2. `sim.js --test`, Diamond, Fresh, no gusts unless stated:
   - the launch rhythm (hold 0.6 s, release 0.6 s, repeated) reaches 20 m altitude within 15 s; a continuous hold from the
     grass does not leave the turbulent layer within 15 s (it stalls and drops back); no input never leaves the grass;
   - a hold with lean 0.8 at 25 m altitude produces a Loop within 6 s;
   - alternating lean 0.8 and -0.8 every 3 s produces a Figure 8 within 10 s;
   - a release at 40 m in Gentle descends steadily and lands within 60 s;
   - a stall (release then lean 0 at low `Va`) followed by a hold within 0.8 s recovers: altitude 3 s after the stall
     exceeds altitude at the stall minus 4 m, and a Stall Save is stamped; the same stall with no hold falls at least 8 m;
   - a Dive Bomb script stamps Dive Bomb; a 60 s steady hold at 30 m stamps High Park;
   - in Blustery a continuous hold under a gust peak raises tension past `SNAP_TENSION` and the snap fires after
     `SNAP_HOLD_S`; in Fresh it never fires under any script;
   - the tail's sixteen segments stay within 1 percent of `TAIL_SEG` after every step; the tail tip never leads the kite
     into the wind;
   - the thermal extends a release glide's airtime by at least 20 percent;
   - Mabel's snag zone snags a kite that enters it under 12 m, and the wiggle frees it within 4 s;
   - the same seed and script give the same trace.
3. Watch it fail: set `LEAN_TURN_RATE` to 0 and the Loop goes red; set the stall lift factor to 1 and the stall
   assertions go red.
4. `sim.js --fly=fresh,launch` pasted into the ledger.

### P1. The field you can fly in (about 2.5 hours)

1. FIELD render, INPUT, the line, the tail, the camera, the wind bed and the whine, the launch on the grass.
2. **Stop and feel test.** Fly a dive and save with a scripted thumb and shoot `docs/shots/p1-dive.png` as a 6 panel strip
   at 0.4 s intervals, plus `p1-park.png` (a high park at dusk). Open them. The design says the dive and save must make
   someone gasp; that is Stephen's phone, but the strip tells you if the tail reads as a ribbon and the line as a bow; if
   either reads as a straight line, fix the sag and the tail drag before P2.
3. `test/fly.mjs` (browser, real pointers at 375x667): a real hold on the canvas raises the sim's reel flag and, held in
   pulses (down 600 ms, up 600 ms, five times), the kite's altitude passes 12 m; a real slide of 90 px to the right while
   holding sets lean near +1 and the heading rate goes positive; release sets pay out and `L` grows; `pointercancel`
   releases.
4. `test/audio.mjs` (offline): the wind bed's gain rises with a gust in the script; the whine is present only above
   `STRAIN_AT`; peak under 0.99.
5. `test/layout.mjs`: 48 px at 375x667; the bottom left 120x120 empty; nothing tappable during a flight except the pause
   glyph top right.

### P2. Gusts, moods, Mabel, tricks, the journal (about 2.5 hours)

1. The gust system, the three moods and the mood picker, snap and the soft loss (the kite flutters over the trees and an
   unseen friend hands you another), Mabel and the rescue, the landing flourish.
2. TRICKS on screen with the calligraphy stamps, the JOURNAL, the kite unlocks, the five kites.
3. Shots: `p2-mabel.png` (snagged), `p2-stamp.png` (a Loop stamp), `p2-journal.png`.

### P3. Real wind, the clock, the daily (about 2 hours; where a night may stop)

1. WEATHER behind the toggle with the honesty line; CLOCK palette; the Daily Wind with the tally and the `#w=` link.
2. Reduced motion (no tail crack flash, no parallax), haptics toggle.
3. `tools/shots.mjs` at 412x915, 375x667, 320x568, dusk and day; `tools/thumb.mjs` (the kite high with the tail cracking);
   `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (portrait, one hand, 48 px rendered at 375 wide)

- **The field (home).** Full bleed. The kite on the grass at the start; a hold anywhere begins. Top left: the mood chip
  (48 px) and, when Real Wind is on, the wind line ("9 mph from the west"). Top right: pause (48 px). Bottom left empty.
  Nothing else during a flight. First boot: "Hold to pull the string. Let go to give it line." then, once the kite is 10
  m up, "Slide your thumb to lean." and never again.
- **Pause.** RESUME (56), LAND IT (48), Kites, Mood, Journal, Settings, About (48 each).
- **Kites.** Five cards 72 px: silhouette, name, one line, locked ones say the feat.
- **Mood.** Gentle, Fresh, Blustery cards, and Real Wind's card when it is on with today's numbers.
- **Journal.** Bests, hours, the trick stamps collected, the Daily Wind tally with SHARE.
- **Settings.** Sound, Motion, Haptics, Real Wind (asks for location on tap, shows the waiting state and the last fetch),
  About: the positioning line, "Sky Wolf Studio".

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the game never waits on it)

Four sheets in `plans/updraft/ART-PACK-UPDRAFT.md` (a copy in 012Assets as `Updraft — Art Pack`). The kite, the line and
the tail are drawn by code and stay drawn.

| File | Used for | Delivered | In game |
|---|---|---|---|
| `field.png` | the grass and far hills, the bottom layer | 9:16 | `art/field.jpg` 900x1600 q80 |
| `mabel.png` | the oak on white, keyed | 1:1 | `art/mabel.png` 800x800 with alpha |
| `kites.png` | the five kites on white, one sheet, for the picker cards | 1:1 | `art/kite-<id>.png` 256x256 cut by Fable |
| `icon-mark.png` | PWA icon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Updraft", ds:"Go fly a kite. Hold to reel in, let go to give it line, slide to lean. Loops, dives and saves come from your thumb, the tail cracks like a ribbon, and on a good day you can fly in the wind outside your window.", cat:"action", url:"/satellites/updraft/?v=<stamp>", ic:"🪁", thumb:"/portal-assets/thumbs/updraft.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED; `test/fly.mjs` passed
with real pointers; the dive strip was opened and judged.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9 and the audio scars in `plans/swell/HANDOFF-SWELL.md` section 9.
- A kite on a sphere near the zenith has a singular azimuth; clamp `el` to 1.45 rad and let lift fade there (the window
  does anyway).
- The catenary sag formula divides by tension; floor tension at 0.05 for the drawing and draw a taut line straight.
- A verlet tail integrated at the render rate is a different tail on every phone; integrate it inside the 120 Hz step.
- Lean read from the pointer's absolute x makes the kite jerk on a re-grab; lean is relative to the down point, and it
  resets to 0 on every release.
- The trick recogniser must not stamp a Loop during a tumble on the grass; every trick requires `el > 0.1`.
- Real Wind direction is where the wind comes FROM in Open-Meteo; the field's base wind blows away from the player, so
  the direction changes only the wind line's words and never the flight (the player always faces downwind).
- Haptics throw on iOS in some versions; wrap `navigator.vibrate`.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's three open questions take these answers tonight:

1. **Name: UPDRAFT.** Stephen's folder and title; Stringsong and Go Fly A Kite stay in the morning report.
2. **Snap risk: Blustery only.** Section 3.3.
3. **Real Wind: Settings plus a journal hint.** Section 3.4.

Yours without asking: the painterly look inside the palette, the cloud shapes, Mabel's drawing, the stamp calligraphy, the
gust feel inside the amplitudes, the tree's name.

Stephen's, never guessed: price, store, the name, Penny's kite pattern, anything with money.

---

## 11. STEPHEN ONLY

The phone, outside if there is wind: launch with the tug rhythm, one loop, one dive and save, one landing; then turn Real
Wind on and read the line. The four art sheets when the Midjourney month allows.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1.5 h, P1 about 2.5 h, P2 about 2.5 h, P3 about 2 h: about 8.5 hours. Expect 3,800 to
4,800 lines. **Where a single night stops well:** the end of P1 (a kite you can launch, fly, dive and save in steady wind)
is the toy and the feeling; P2 makes it a game with weather and Mabel; Real Wind is the promise on the store page and can
be the next session. If the clock says P1 cannot finish, land the flight and the line before the tail; the tail is the
juice, the string is the game.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

```
2026-09-06 13:13Z  P0 step 2 and 3, sim.js --test, and the two watched failures

$ node sim.js --test
PASSED 71 / FAILED 0   (total 71)
UPDRAFT TEST OK

$ node sim.js --test --over=LEAN_TURN_RATE=0
FAIL  a hold with lean 0.8 at 25 m produces a Loop within 6 s   [stamps [] hU 0.00]
FAIL  alternating lean every 3 s produces a Figure 8 within 10 s   [stamps [{"name":"Sky Write","t":9.99}]]
FAIL  loops carry a sign, and both signs were flown   [[]]
FAIL  a dive script stamps Dive Bomb   [min el 0.90 stamps [] ended null]
(8 FAIL lines in all)

$ node sim.js --test --over=STALL_V=0
FAIL  the stall happens at once   [stall at -1]
FAIL  and a Stall Save is stamped   [[]]
FAIL  the same stall with no hold falls at least 8 m   [0.0 to 99.0]
PASSED 67 / FAILED 4   (total 71)
(the plan's STALL_LIFT=1 does NOT go red: at 1.5 m/s of airspeed the lift is 0.7 N whatever the factor; DECISIONS.md)

2026-09-06 13:13Z  P0 step 4, the launch trace

$ node sim.js --fly=fresh,launch
UPDRAFT fly  mood fresh  script launch  kite Diamond
    t   alt(m)   L(m)     el    az   head    Va   tens  hold  state
  0.00     0.0    8.0   0.00  0.00   0.00   0.0    0.0  hold  grass
  0.25     1.0    7.4   0.14  0.00   0.00   7.6   10.2  hold  flying
  0.50     2.1    6.8   0.32  0.00   0.00   7.9   14.2  hold  flying
  0.75     3.6    8.0   0.47  0.00   0.00   3.2    2.3        flying
  1.00     5.1   10.5   0.51  0.00   0.00   4.2    4.0        flying
  1.25     6.3   12.4   0.54  0.00   0.00   9.4   22.5  hold  flying
  1.50     7.0   11.8   0.64  0.00   0.00   9.2   24.8  hold  flying
  1.75     7.7   11.1   0.77  0.00   0.00   8.9   25.0  hold  flying
  2.00     9.9   13.0   0.86  0.00   0.00   3.5    3.4        flying
  2.25    12.1   15.5   0.89  0.00   0.00   3.4    2.9        flying
  2.50    13.2   16.8   0.91  0.00   0.00   8.3   21.8  hold  flying
  2.75    13.3   16.1   0.97  0.00   0.00   8.0   21.3  hold  flying
  3.00    13.0   15.5   1.00  0.00   0.00   7.9   20.0        flying
  3.25    15.1   18.0   1.00  0.00   0.00   2.8    1.6        flying
  3.50    17.1   20.5   0.99  0.00   0.00   2.7    1.5        flying
  3.75    17.7   21.1   0.99  0.00   0.00   8.0   20.2  hold  flying
  4.00    17.3   20.5   1.00  0.00   0.00   7.9   20.0  hold  flying
  4.25    17.2   20.5   1.00  0.00   0.00   2.9    1.8        flying
  4.50    19.3   23.0   1.00  0.00   0.00   2.8    1.6        flying
  4.75    21.3   25.5   0.99  0.00   0.00   2.7    1.5        flying
  5.00    21.4   25.5   1.00  0.00   0.00   7.9   20.2  hold  flying
  5.25    20.9   24.9   1.00  0.00   0.00   7.9   20.0  hold  flying
  5.50    21.5   25.5   1.00  0.00   0.00   2.9    1.8        flying
  5.75    23.5   28.0   1.00  0.00   0.00   2.8    1.5        flying
  6.00    25.5   30.5   0.99  0.00   0.00   2.7    1.4  hold  flying
  6.25    25.1   29.9   1.00  0.00   0.00   7.9   20.0  hold  flying
  6.50    24.6   29.3   1.00  0.00   0.00   7.9   20.0  hold  flying
  6.75    25.7   30.5   1.00  0.00   0.00   2.8    1.7        flying
  7.00    27.7   33.0   1.00  0.00   0.00   2.7    1.5        flying
  7.25    29.2   34.9   0.99  0.00   0.00   8.0   20.1  hold  flying
  7.50    28.8   34.3   1.00  0.00   0.00   7.9   20.0  hold  flying
  7.75    28.3   33.6   1.00  0.00   0.00   7.9   20.0  hold  flying
  8.00    29.9   35.5   1.00  0.00   0.00   2.8    1.6        flying
  8.25    31.9   38.0   1.00  0.00   0.00   2.7    1.4        flying
  8.50    32.9   39.3   0.99  0.00   0.00   8.0   20.1  hold  flying
  8.75    32.5   38.6   1.00  0.00   0.00   7.9   20.0  hold  flying
  9.00    32.0   38.0   1.00  0.00   0.00   7.9   20.0        flying
  9.25    34.0   40.5   1.00  0.00   0.00   2.8    1.6        flying
  9.50    36.1   43.0   0.99  0.00   0.00   2.7    1.4        flying
  9.75    36.6   43.6   0.99  0.00   0.00   7.9   20.1  hold  flying
 10.00    36.2   43.0   1.00  0.00   0.00   7.9   20.0  hold  flying
 10.25    36.2   43.0   1.00  0.00   0.00   2.9    1.8        flying
 10.50    38.2   45.5   1.00  0.00   0.00   2.7    1.5        flying
 10.75    40.2   48.0   0.99  0.00   0.00   2.6    1.4        flying
 11.00    40.3   48.0   1.00  0.00   0.00   7.9   20.1  hold  flying
 11.25    39.9   47.4   1.00  0.00   0.00   7.9   20.0  hold  flying
 11.50    40.4   48.0   1.00  0.00   0.00   2.9    1.7        flying
 11.75    42.4   50.5   1.00  0.00   0.00   2.7    1.5        flying
 12.00    44.4   53.0   0.99  0.00   0.00   2.6    1.3  hold  flying
 12.25    44.1   52.4   1.00  0.00   0.00   7.9   20.1  hold  flying
 12.50    43.5   51.7   1.00  0.00   0.00   7.9   20.0  hold  flying
 12.75    44.6   53.0   1.00  0.00   0.00   2.8    1.7        flying
 13.00    46.6   55.5   1.00  0.00   0.00   2.7    1.4        flying
 13.25    48.1   57.4   0.99  0.00   0.00   7.9   19.7  hold  flying
 13.50    47.8   56.8   1.00  0.00   0.00   7.9   20.0  hold  flying
 13.75    47.2   56.1   1.00  0.00   0.00   7.9   20.0  hold  flying
 14.00    48.8   58.0   1.00  0.00   0.00   2.8    1.6        flying
 14.25    50.8   60.5   1.00  0.00   0.00   2.7    1.4        flying
 14.50    51.8   61.8   0.99  0.00   0.00   7.9   20.1  hold  flying
 14.75    51.4   61.1   1.00  0.00   0.00   7.9   20.0  hold  flying
 15.00    50.9   60.5   1.00  0.00   0.00   7.9   20.0        flying
 15.25    53.0   63.0   1.00  0.00   0.00   2.8    1.6        flying
 15.50    55.0   65.5   1.00  0.00   0.00   2.6    1.3        flying
 15.75    55.5   66.1   1.00  0.00   0.00   7.9   20.1  hold  flying
 16.00    55.1   65.5   1.00  0.00   0.00   7.9   20.0  hold  flying
 16.25    55.1   65.5   1.00  0.00   0.00   2.9    1.8        flying
 16.50    57.2   68.0   1.00  0.00   0.00   2.7    1.5        flying
 16.75    59.2   70.5   1.00  0.00   0.00   2.6    1.3        flying
 17.00    59.2   70.5   1.00  0.00   0.00   7.9   20.1  hold  flying
 17.25    58.8   69.9   1.00  0.00   0.00   7.9   20.0  hold  flying
 17.50    59.3   70.5   1.00  0.00   0.00   2.8    1.7        flying
 17.75    61.4   73.0   1.00  0.00   0.00   2.7    1.4        flying
 18.00    63.3   75.5   1.00  0.00   0.00   2.6    1.2  hold  flying
 18.25    63.0   74.9   1.00  0.00   0.00   7.9   20.1  hold  flying
 18.50    62.5   74.3   1.00  0.00   0.00   7.9   20.0  hold  flying
 18.75    63.5   75.5   1.00  0.00   0.00   2.8    1.7        flying
 19.00    65.5   78.0   1.00  0.00   0.00   2.7    1.4        flying
 19.25    67.0   79.9   1.00  0.00   0.00   7.8   19.4  hold  flying
 19.50    66.7   79.3   1.00  0.00   0.00   7.9   20.0  hold  flying
 19.75    66.2   78.6   1.00  0.00   0.00   7.9   20.0  hold  flying
ended still flying  max altitude 67.7 m  stamps ["Sky Write@10.6"]
events ["liftoff@0.00","launched@1.81","stamp@10.59"]

2026-09-06 13:24Z  P1, the gate table and the watched failure of test/fly.mjs

$ flock -w 1800 /tmp/sws-gate.lock node tools/check.js
lint            pass  0s
test            pass  0s
fly             pass  12s
layout          pass  16s

ALL GATES PASSED

$ (SLIDE_GAIN set to 1 / 9000 in index.html, then reverted)
$ flock -w 1800 /tmp/sws-gate.lock node test/fly.mjs
  FAIL  a real 90 px slide to the right while holding sets lean near +1 and the heading rate goes positive (lean 0.01, rate -1.94 rad/s)
1 FLY FAILURE(S)

$ node test/fly.mjs   (the green run, what a real thumb did)
  ok    a real hold on the canvas raises the sim's hold and reel flags
  ok    five real pulses take the kite past 12 m (altitude 20.0 m, max 21.5)
  ok    and the altitude label on screen says so (20 M)
  ok    a real 90 px slide to the right while holding sets lean near +1 and the heading rate goes positive (lean 1.00, rate 1.43 rad/s)
  ok    and the line pays out (L 22.4 to 24.7 m)
  ok    pointercancel releases the string
  ok    the pause glyph is on top at its centre, 48x48

$ node test/layout.mjs   LAYOUT OK at 375x667, 320x568, 412x915 (every button 48 px and on top at its centre; bottom left 120x120 free)
$ node tools/thumb.mjs   docs/thumb.png  512 px  31.8 KB  THUMB OK
$ node tools/shots.mjs   title-tall 40 KB, title-mid 29 KB, title-small 27 KB, p1-dive 84 KB (six panels, 0.4 s apart), p1-park 44 KB (dusk), p1-grass 45 KB, p1-launch 41 KB. All opened with the Read tool; faults in SESSION STATE.

2026-09-06 13:32Z  P1 step 4, test/audio.mjs, and its watched failure

$ node test/audio.mjs
  ok    the flight gave 600 samples before it ended (still flying)
  ok    the bed rises with the gust: 0.279 at gust 0.42, 0.121 at gust -0.48
  ok    the whine is silent under STRAIN_AT (590 samples, loudest 0.000)
  ok    and sounds above it (10 samples, quietest 0.040)
  ok    the whine's pitch rises with tension
  ok    the peak stays under 0.99 (0.314)
  ok    the bed on the grass is quieter than aloft (0.089 vs 0.149)
  ok    no flight is a soft bed and no whine
AUDIO OK

$ node test/audio.mjs --over=STRAIN_AT=0
  FAIL  the whine is silent under STRAIN_AT (0 samples, loudest -Infinity)
  FAIL  and sounds above it (600 samples, quietest 0.000)
  FAIL  the whine's pitch rises with tension
3 AUDIO FAILURE(S)

$ flock -w 1800 /tmp/sws-gate.lock node tools/check.js   (after the bow fix, commit 314f70bf)
lint            pass  0s
test            pass  0s
audio           pass  0s
fly             pass  14s
layout          pass  17s
ALL GATES PASSED

2026-09-06 14:19Z  P2 screens, the layout gate grown and watched to fail three times

$ node tools/lint.mjs            LINT OK   (stamp 20260906d, sw.js shell 20260906d)
$ node sim.js --test             PASSED 71 / FAILED 0   (total 71)  UPDRAFT TEST OK
$ flock -w 1800 /tmp/sws-gate.lock node test/layout.mjs        LAYOUT OK  (mood, journal, kites screens at 375, 320, 412)

watched to fail, each restored and green again:
  #moodBlustery{display:none}      FAIL  375x667  BLUSTERY card  MISSING   (and at 320, 412)   3 LAYOUT FAILURE(S)
  #btnJournalBack{display:none}    FAIL  375x667  BACK from the journal  MISSING
  kiteUnlocked delta -> true       FAIL  375x667  a fresh journal has four locked kites and the Diamond open (box, sled, dragon)   (x3)
  (a first try, .card min-height 72 -> 40, did NOT go red: the cards' content is taller than 72 on its own; the hidden card is the mutation that bites)

$ node tools/shots.mjs p2-mood / p2-mabel / p2-stamp / p2-journal / p2-kites
  p2-mood             32 KB
  mabel: snagged true at alt 7.0
  p2-mabel            49 KB
  stamp: ["Loop"]                 (SCRIPTS.loop flown by a real pointer: hold, lean 0.8, 5 s)
  p2-stamp            39 KB
  p2-journal          28 KB
  p2-kites            35 KB

2026-09-06 14:27Z  the gate table at 20260906d

$ flock -w 1800 /tmp/sws-gate.lock node tools/check.js
lint            pass  0s
test            pass  0s
audio           pass  0s
fly             FAIL  14s      FAIL  the kite starts on the grass, not held   (the known swiftshader race on the at rest read)
layout          pass  19s
$ flock -w 1800 /tmp/sws-gate.lock node test/fly.mjs   (alone, four runs, the box shared with three builders)
FLY OK
FAIL  the kite starts on the grass, not held
FAIL  the kite starts on the grass, not held
FLY OK
(two passes alone is the rule's pass; the honest number is 2 of 4 under contention, and the morning reader should run it once on a quiet box)

2026-09-06 14:28Z  P3 step 2, the haptics toggle
$ flock -w 1800 /tmp/sws-gate.lock node test/layout.mjs        LAYOUT OK   (HAPTICS in pause at three widths; a tap turns it off and the save says so)
watched to fail: the tap writes settings.haptics = 1 instead of G.haptics
  FAIL  375x667  a tap turns haptics off and the save says so (HAPTICS OFF, 1)   (and at 320, 412)

2026-09-06 14:35Z to 14:58Z  P2 landing flourish, P3 Real Wind and the Daily Wind, at 20260906e
$ node sim.js --test                                   PASSED 76 / FAILED 0   (total 76)  UPDRAFT TEST OK
$ node sim.js --test --over=SETTLE_S=0                 FAIL  within 1.5 s the tail lies along the grass, the tip 2 m or more to the side   [tip u 0.00 (was hanging at w 4.95)]   PASSED 75 / FAILED 1
$ flock ... node test/layout.mjs                       LAYOUT OK   (REAL WIND card 72, DAILY WIND on the title, at three widths)
$ flock ... node test/fly.mjs                          FLY OK      (once, after the flourish)
$ flock ... node test/audio.mjs                        AUDIO OK
$ flock ... node test/weather.mjs                      WEATHER OK  (24 assertions: 0 requests from boot through a flight and the mood screen; 1 request, no key, 3 dp; 9.2 mph flies 4.113 m/s as Fresh; no second call inside the hour; 1.8 mph is CALM and flies Gentle 2.7; a 500 says so and flies the picked Blustery 8.0; one tick)
  first run, 13 FAIL: the interceptor's answer had no CORS header (a harness fault) and a failed feed was re-asked on every flight (a real fault, the ten minute floor came from it)
  watched to fail, the calm branch removed:        FAIL  and the flight is Gentle at 2.7 m/s, never 1.8 mph invented into lift (0.804672, gentle)   1 WEATHER FAILURE(S)
$ flock ... node test/daily.mjs                        DAILY OK    (18 assertions; first run timed out on the time call because a frame may take only 30 steps, so a dev clock above 1 now takes more; state() exposes seed and endT)   NOT watched to fail
$ node tools/shots.mjs p2-landing / p2-mabel / p3-realwind / p3-daily
  landing: ended tumble tip [1.045,-0.34] screen play    p2-landing 43 KB
  p2-mabel 49 KB   p3-realwind 36 KB   p3-realwind-field 48 KB   p3-daily-title 38 KB   p3-daily-journal 33 KB
```

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `fly, audio,
layout`.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the launch trace**
from `--fly`, pasted.
