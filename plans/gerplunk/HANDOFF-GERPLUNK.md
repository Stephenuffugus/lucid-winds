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

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `flick, audio,
daily, layout`.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the throw table**
from `--throw`, pasted.
