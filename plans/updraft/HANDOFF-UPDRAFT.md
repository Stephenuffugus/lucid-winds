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
(empty; the first entry is P0 step 3 and 4)
```

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `fly, audio,
layout`.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the launch trace**
from `--fly`, pasted.
