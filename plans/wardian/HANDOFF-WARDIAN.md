# HANDOFF WARDIAN, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-WARDIAN.md`
(Stephen's design, read in full) plus the fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then this file, then the design. Where they differ,
this file wins; every difference is in section 3 with its reason.
**Game folder:** `satellites/wardian/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/wardian/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

**P0 and P1 are DONE and pushed** (2026-09-05). `node satellites/wardian/tools/check.js`
prints ALL GATES PASSED across four gates: `sim` (101 assertions), `lint`,
`boot`, `touch`. Every gate has been watched to fail, twice for the two that
turned out to be decoration. Evidence in section 13, shots in
`satellites/wardian/docs/shots/`, calls in `satellites/wardian/docs/DECISIONS.md`.

**Next action:** P2 step 1, the rest of the flora. In
`satellites/wardian/index.html`, `growPlant` already handles `crown` and `fruit`
species; the vine needs its climb (a segment that reaches a glass column turns
to follow it) and the dewsprout needs its droplet leaf. Then P2 step 2, the
fauna drawn properly, then the JOURNAL with its 24 written lines and
`test/journal.mjs`, then the pouch spending spores, then `test/layout.mjs`.

## 0. RULES OF ENGAGEMENT

Identical to `plans/fathom/HANDOFF-FATHOM.md` section 0 with `wardian` for `fathom`: the fence is `satellites/wardian/**`
plus this file's ledger; fenced `git add`, never `-A`; rebase before every push; never push main; no dashes or exclamation
points in player copy (the journal and the letters included; the words gate greps them); 48 px rendered buttons proved by
`elementFromPoint`; Sky Wolf Studio singular; `.js` at runtime; `?v=` on every URL with `sw.js` bumped in lockstep; text 0.7
rem or larger; LOOKING IS PART OF THE JOB; never wait on a human.

Two laws particular to Wardian, and they are the brand:

- **NOTHING IN THE JAR CAN DIE, GET SICK, OR LEAVE.** This is the design's promise and it is also a studio law (LOAF carries
  the same line: no decay, no expiry, no streaks, never a penalty for having been away). A plant can go dormant and come back.
  A bug can sleep. Nothing is ever removed from the state by the simulation. `sim.js` asserts it over thirty simulated days
  and the build fails if any species count ever goes down.
- **Never block on the network or on a permission.** Weather is a gift the jar can receive, never a thing the jar needs.

---

## 1. WHAT WARDIAN IS, AND WHY IT IS WORTH A NIGHT

From the design: *"A sealed glass jar on your phone. Inside: a tiny living ecosystem, moss, ferns, springtails, beetles, that
grows in real time, on your actual local time. Night falls in the jar when it falls outside your window. It rains in the jar
when it rains in your town. Open it after three days away and watch the sim fast forward: new shoots, a beetle you've never
seen, dew on the glass. Nothing in the jar can die. Ever."* Positioning line: **"A tiny world that lives on your time."**

Why it is worth a night: the category leader's two top complaints (plants die if unwatered, currency behind ads) are both
things this design refuses on principle, and real clock play is proven to build ritual (Animal Crossing). The studio already
has a weather feed and a catch up tick pattern in the main game, and its own botanical voice. The risk is not systems, it is
whether a fern unfurling is worth thirty seconds of attention (the design's own feel gate); that is a render question and it is
P1's first stop.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| Real weather, no key, cached, silent on failure | `index.html` (the main game) lines 90222 to 90245, `fetchWeather` | The Open-Meteo URL shape: `https://api.open-meteo.com/v1/forecast?latitude=<3 dp>&longitude=<3 dp>&current=temperature_2m,relativehumidity_2m,precipitation,weathercode,cloudcover,windspeed_10m`; `r.ok ? r.json() : null`, `.catch(() => null)`, a cache keyed by a coarse cell and the hour. Wardian caches for one hour in the save and never fetches more than once an hour |
| A tick that runs once per period and catches up | `index.html` `_wildClimateTick` (called from `_doReproduction` once a day) | The shape only: elapsed periods computed from a saved timestamp, ticked in a bounded loop, the timestamp advanced to the last whole period. Wardian's tick is 10 minutes and the cap is 14 days (section 4) |
| Geolocation that never soft locks | memory `feedback_ios_gps_softlock`, summarised in `plans/asterism/HANDOFF-ASTERISM.md` 3.6 | A button, a 6 s timeout, a visible waiting state, never on boot |
| Moon phase (for the moon cap) | `plans/asterism/HANDOFF-ASTERISM.md` section 4, `moon(JD)` | `((JD - 2451550.1) / 29.530588853) mod 1`; full when within 0.03 of 0.5 |
| Sun altitude for dusk and dawn through the glass | the same file, `sunRaDec` and `altAz` | Only if the drawn dusk from clock hours looks wrong; the clock hour version (section 4) is the default |
| Export a canvas the phone can keep | `satellites/attic/index.html` lines 1446 to 1466 | `toBlob`, `File`, `canShare({files})`, `share`, else download |
| Multi pointer, long press, drag | `satellites/abduct-a-chameleon/index.html` `pointers` Map, `blur` at 1264 | Roles per pointer; `pointercancel` ends a drag; `user-select: none` and `setPointerCapture` so a long press for edit mode arrives |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | as listed in `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `wardian` in place of `fathom` |
| A gate on generated words | `satellites/keepsies/test/words.mjs` and `HAIKU_PRINCIPLES.md` | The journal voice: concrete, small, a little odd; no morals, no absolutes, no dashes |

Not inherited, on purpose: the main game's `_generatePlantSVG` (an SVG one shot from a hash, inside an 11,000 line IIFE; it does
not grow, it does not sway, it cannot be sampled per tick). Wardian's plants are segment trees drawn on canvas and they are
this game's own engine. No three.js, no Meshy assets in game (the design agrees).

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **The nothing dies promise is a gate, not a sentence.** Section 0. Also: dormancy is the only downward state and it is
reversible within six ticks of moisture returning; the sim never deletes a plant, an agent, or a journal entry. The catch up
after a month is "two lush weeks", never a wasteland.

3.3 **Weather is opt in from Settings and hinted in the journal, never a boot popup.** The design recommends it; taken. The
first journal entry after day 2 says "The jar can listen to your sky, if you let it. The Jarwright left a switch in the
settings." Denied or offline, the jar runs on the clock and says nothing about it.

3.4 **Hemisphere: guessed from the time zone, with a toggle.** `Intl.DateTimeFormat().resolvedOptions().timeZone`; a zone
starting `Australia/`, `Pacific/Auckland`, `Pacific/Fiji`, `America/Sao_Paulo`, `America/Buenos_Aires`, `America/Santiago`,
`America/Lima`, `Africa/Johannesburg`, `Indian/`, `Antarctica/` is south; everything else north; a toggle in Settings
overrides and is saved. Never asked at boot.

3.5 **Local time comes from the device clock and nothing else.** Day and night are `Date` hours in the device zone; no sun
math in the slice. Dawn 5 to 7, day 7 to 18, dusk 18 to 20, night 20 to 5, with the season shifting the edges by up to an
hour (section 4). A player who moves time zones sees the jar follow the phone, which is the promise.

3.6 **The tick is 10 minutes live too, not 1 second.** The design runs the sim at 1 tick per second live and 10 minute ticks
for catch up, which is two sims to test. One tick, 10 minutes, everywhere; the live view interpolates growth between ticks
(the render reads a `growth` float per segment and a per tick target). Catch up is the same loop with more iterations, so the
system the design calls out as "one system to test" is literally one function.

3.7 **The grid is 24 by 8 and every number the design leaves as prose is in CONFIG.** Section 4.

3.8 **Plants and bugs are drawn by code tonight; painted art is an upgrade.** The design's Gemini reference sheets and Meshy
jar renders are not available at night. The segment trees, the moss cells, the bugs and the jar are canvas strokes and fills in
the design's soft flat vector look. The art pack (section 7) gives Stephen a jar, a room backdrop, and the journal's pencil
silhouettes to paint if he wants; the code reads each behind an `onerror`.

3.9 **Spores are the only currency and there is nothing to buy that the jar would give you.** Seeds cost spores; species arrive
by conditions only and are never for sale; jar shapes, backdrops and trinkets cost spores; there are no ads, timers, or
purchases in the slice at all. The daily cap on spores is in CONFIG.

3.10 **Rare species gate on real conditions with clock fallbacks.** Frost fern: real temperature under 0 C from the weather
feed, or, with weather off, a winter night in the guessed hemisphere. Sunburst bloom: real clear sky in daytime in summer, or
a summer noon with weather off. Moon cap: a night within 0.03 of full moon (the formula; no feed needed). A player who never
turns weather on can still find all eight.

3.11 **Photo export carries the date, the hour, and the weather word only.** Never coordinates. The stamp reads like a field
note: "Sept 5, evening, light rain".

3.12 **Copy.** No dashes, no exclamation points, in journal entries, letters, and UI. The Jarwright's voice: short sentences,
warm, a little odd, concrete; she never asks the player to do anything.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/wardian/`):

```
index.html            the app
sim.js                --test, --days=N (run N simulated days under a policy, print the census per day), --catchup=D
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/boot.mjs  test/touch.mjs  test/journal.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  docs/BUILD-NOTES.md  docs/ART_ASSETS.md
```

Layers: `CONFIG, RNG, SPECIES, ENV, FLORA, FAUNA, SIM, CLOCK, WEATHER, VIEW, INPUT, JOURNAL, ECONOMY, SAVE, TEST, BOOT`.
`SIM_EXPORT` markers wrap CONFIG through SIM so `sim.js` runs the whole ecosystem headless with a fake clock.

**CONFIG (frozen):**

```
GAME_ID 'wardian'  SAVE_KEY 'lw_wardian_v1'  SAVE_V 1
TICK_MIN 10   CATCHUP_CAP_DAYS 14   CATCHUP_MONTAGE_MS 3000
GRID_W 24  GRID_H 8
MOIST_MAX 1.0  MOIST_EVAP_PER_TICK 0.004 (day) 0.001 (night)  MOIST_PERCOLATE 0.15  MIST_ADD 0.25  MIST_COOLDOWN_S 20
NUTRIENT_FROM_LEAF 0.3  NUTRIENT_DRAW_PER_GROWTH 0.02
LIGHT_DAY 1.0  LIGHT_DUSK 0.4  LIGHT_NIGHT 0.08
SEG_MAX 400  AGENT_MAX 25  PARTICLE_MAX 60
DORMANT_AFTER_DRY_TICKS 720 (5 days)  DORMANT_MOIST 0.12  WAKE_TICKS 6
SPORES_PER_SPECIES_PER_DAY 3  SPORES_DAILY_CAP 30
SEED_COST {moss:5, fern:12, vine:15, mushroom:15, dewsprout:10}
WEATHER_CACHE_MIN 60  GEO_TIMEOUT_MS 6000
HOURS {dawn:[5,7], day:[7,18], dusk:[18,20]}  SEASON_SHIFT_H 1
```

**SPECIES** (data; the eight launch flora and three fauna):

Flora, each `{id, name, kind, rules, journal}`:
- `moss` Cushion moss, cellular: spreads to a neighbouring surface cell with moisture over 0.35 at 6 percent per tick per
  neighbour; starts in the jar.
- `fern` Button fern, segment tree: branch probability 0.18 per growth tick, angle jitter 12 degrees, max generation 4, leaf
  every 1.5 units, fronds unfurl by a `curl` parameter from 1 (rolled) to 0 over 40 ticks (the signature). Starts in the jar.
- `vine` Glass vine: segments seek the nearest glass cell and then climb it, max generation 6, tendrils.
- `mushroom` Ghost mushroom: fruits only in night ticks on cells with nutrients over 0.5, retracts by day, never removed.
- `dewsprout` Dew sprout: a single stem that opens a droplet shaped leaf when humidity is over 0.7.
- `frostfern` Frost fern, rare: section 3.10; pale, crystalline fronds.
- `sunburst` Sunburst bloom, rare: section 3.10; one bloom, opens over a day.
- `mooncap` Moon cap, rare: section 3.10; a faint blue cap that fruits at full moon.

Fauna, each `{id, name, arrival, behaviour, journal}`:
- `springtail` Springtails: arrive when any cell has mould (decay over 0.4 and moisture over 0.5); a dot swarm of 6 to 12;
  seek mould; eat it down.
- `pillbug` Pillbug: arrives after three leaves have decayed; trundles, cleans decayed leaves, **rolls up for 3 s when the
  glass is tapped within 60 wu** (the shareable moment).
- `glowbeetle` Glowbeetle: arrives after the jar's fourth night with moss cover over 30 percent; night only; a faint light
  trail; sleeps by day under the driftwood.

**ENV.** The soil grid `GRID_W x GRID_H` of `{moisture, nutrient, light, decay}`; the surface row and the glass columns are
flagged; the global `{temp, humidity, light, season, hour, weather}`. Misting adds `MIST_ADD` to the surface row; percolation
moves `MOIST_PERCOLATE` of the excess down each tick; evaporation by day and night; a decayed leaf adds nutrient beneath.

**FLORA.** A plant is `{species, cells or root:{x,y}, segs:[{ang, len, growth 0..1, gen, curl, leaf}], dormant, dryTicks}`.
Growth per tick draws nutrient and moisture from its root cell; below `DORMANT_MOIST` for `DORMANT_AFTER_DRY_TICKS` the plant
is dormant (desaturated, curled, halted); moisture back over `DORMANT_MOIST` for `WAKE_TICKS` wakes it with a relief sway.
Leaves that reach `growth 1` and age past a species lifetime become decayed leaves on the soil (nutrient, mould) and the plant
grows a new one; the plant itself is never removed. Segment count is capped at `SEG_MAX` across the jar; a plant at the cap
stops branching and keeps swaying.

**FAUNA.** Agents `{species, x, y, vx, vy, need, target, asleep, rolled}`, steering to needs (food, moisture, shade), bounded
by the glass, capped at `AGENT_MAX`.

**SIM.** `tick(state, clock)` pure: env, flora, fauna, arrivals, decay, spores, journal events. `catchUp(state, nowMs)`:
`elapsed = min(now - lastSeen, CATCHUP_CAP_DAYS days)`, `n = floor(elapsed / TICK_MIN)`, tick `n` times with the clock advanced
per tick (so nights and days pass in order), then `lastSeen += n * TICK_MIN`. The montage is the view playing the census
deltas over `CATCHUP_MONTAGE_MS`, skippable by a tap.

**CLOCK.** The device `Date`; `hour` as a float; the season from the month and the hemisphere; a fake clock in TEST.

**WEATHER.** Off until enabled. When on: the geolocation button, the Open-Meteo fetch, the hourly cache in the save, the
classified `{rain, snow, clear, cloudy, temp, humidity}`; rain draws streaks on the outside of the glass and bumps humidity;
snow creeps frost into the corners; the temp gates the frost fern.

**VIEW.** Canvas 2D, portrait, DPR aware. Layers back to front: the room (warm dark, vignette, the backdrop), the back glass,
the soil and moss, plants (stroked and filled segment chains, per segment sine sway with phase offsets so the jar is never
still), agents, hardscape (stones, driftwood, trinkets), the front glass (rim, specular streak, condensation droplets that grow
and slide with humidity, rain streaks, frost), the day and night light through the glass (a gradient tinted by the hour), the
HUD. Tilt (opt in) parallaxes three layers by up to 6 px. Under reduced motion, no sway and no parallax.

**INPUT.** Swipe down anywhere = mist (with the cooldown; droplets, glass fog, the shh). Tap the glass = tonk, startle within
60 wu, plants shiver 1 px, `navigator.vibrate(8)` where present. Long press 500 ms = edit mode (hardscape drags, plants do not
move). A seed from the pouch drags onto a soil cell.

**JOURNAL.** Species entries in the Jarwright's voice (undiscovered are pencil silhouettes with the name hidden), the hint
lines, the letters at milestones (first discovery, day 7, day 30, the first rare), each 2 to 3 sentences, at least 24 lines
written tonight (8 species, 3 fauna, 8 hints, 5 letters) under the words gate.

**ECONOMY.** Spores accrue `SPORES_PER_SPECIES_PER_DAY` per discovered species per day to the cap; the pouch sells seeds; jar
shapes (round, hex, bulb), backdrops (windowsill, desk, cave), trinkets (a gnome, a marble) cost spores. Nothing else.

**SAVE.** `lw_wardian_v1`: the whole state as one JSON (segments as arrays), `lastSeen`, `weatherCache`, settings. Saved on
`visibilitychange` hidden and every 60 s; read, modify, write; export and import as a base64 string in Settings. When the tab
hides, `requestAnimationFrame` stops; on return the same `catchUp` runs.

**TEST.** Deepwell's harness; assertion floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The ecosystem, headless (about 1.5 hours)

1. Scaffold. CONFIG, SPECIES, ENV, FLORA (moss and fern), SIM with the tick and the catch up, the fake clock.
2. `sim.js --test`: the fern reaches generation 3 within 2 simulated days under a "mist every 2 days" policy; moss covers at
   least 20 percent of the surface by day 5; a jar left dry for 6 days has a dormant fern (curl rising, growth halted) and **no
   plant removed**; misting a dormant jar wakes it within `WAKE_TICKS`; `catchUp` over 30 days ticks exactly the 14 day cap;
   nights and days alternate correctly through a catch up; segment count never exceeds `SEG_MAX` over 30 days; **over 30
   simulated days under every policy (never mist, mist daily, mist weekly) no species count ever decreases and no plant or agent
   is ever removed**; two runs from the same seed and policy give identical state JSON; no NaN anywhere in the state after 30
   days. Watch it fail: set `WAKE_TICKS` to 9999 and the wake assertion goes red; delete a dormant plant in the tick and the
   nothing dies assertion goes red.
3. `test/boot.mjs`: the page loads, `ready` posted, the canvas painted, and at a frozen night hour (`?t=` in TEST) the glass
   gradient is darker than at a frozen noon (two pixel reads).

Ends with: the `--days=14` census table in the ledger (species and segments per day).

### P1. The jar you can watch (about 2.5 hours)

1. VIEW: the room, the glass, the soil, moss and fern with sway and the frond curl, the light through the glass by hour, the
   condensation. Mist and the tap. The HUD (section 6).
2. **Stop and feel test.** Shoot `docs/shots/p1-jar-day.png` and `p1-jar-night.png` at 375x667, and a 6 frame strip of the
   fern unfurling at 10 tick intervals (`docs/shots/p1-unfurl.png`, 6 panels in one image). Open them. The design says
   watching a fern unfurl must be worth thirty seconds; if the strip reads as a stick growing, the curl and leaf shape are
   wrong and you fix them before P2.
3. The catch up montage on boot (skippable).
4. `test/touch.mjs` (browser, real pointers): a real 120 px downward swipe raises the surface row moisture by about `MIST_ADD`
   and spawns droplets; a real tap on the glass over a pillbug (placed by the TEST hook) sets `rolled` for about 3 s; a long
   press of 600 ms enters edit mode and a drag moves a stone by the drag distance; the frame loop stops within 1 s of
   `visibilitychange` hidden (wrapped `requestAnimationFrame` sees no calls).

### P2. Things that arrive, and the voice (about 2.5 hours)

1. Vine, mushroom, dew sprout; springtails, pillbug, glowbeetle with their arrivals and behaviours; decay and mould.
2. JOURNAL: the entries, silhouettes, hints, the milestone letters sliding behind the jar; discovery events with a soft chime.
3. ECONOMY: spores, the pouch, seeds onto soil, jar shapes, backdrops, trinkets.
4. `sim.js --test` grows: under the daily mist policy springtails arrive by day 4, the pillbug by day 9, the glowbeetle by day
   6; under never mist, none arrive and nothing is lost; spores per day never exceed the cap.
5. `test/journal.mjs` (node): every journal line and letter is 2 to 3 sentences, 12 to 60 words, no dashes, no exclamation
   points, no always, never, forever; every species has an entry and a hint; the letters are ordered by milestone.
6. `test/layout.mjs`: every button 48 px at 375x667; the bottom left 120x120 empty; the journal readable at 0.7 rem or more.

Ends with `p2-journal.png`, `p2-pillbug.png` (rolled), `p2-night-beetle.png`, `p2-pouch.png`.

### P3. The sky, the rares, the photo (about 2 hours; where a night may stop)

1. WEATHER behind the toggle and the button; rain streaks, frost; the hourly cache; the season shift; the hemisphere toggle.
2. The three rares with their real and clock gates; the moon formula.
3. Photo export with the field note stamp; tilt parallax behind the toggle; reduced motion; audio (room tone, droplets, the
   shh, the tonk, a skitter, a soft rain layer when raining), mutable and remembered.
4. `tools/shots.mjs` at 412x915, 375x667, 320x568, day and night; `tools/thumb.mjs` (the jar at dusk with a beetle);
   `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (portrait, one hand, 48 px rendered at 375 wide)

- **The jar (home).** Full bleed. The jar fills the middle 70 percent of the height. Top left: the day and hour as words
  ("Day 3, evening") 48 px tall, tap opens the journal. Top right: menu (48 px): Journal, Pouch, Settings, About. Bottom
  right: the photo button (56 px round). Bottom left empty. First boot: "The Jarwright left this for you." then "Swipe down to
  mist. Tap the glass to say hello." then nothing, ever again, unless Settings asks for it.
- **Journal.** A bound book: spreads of species (silhouette or painted, name, entry), the letters as loose notes, a spores
  count in the corner. BACK 48 px.
- **Pouch.** Seeds with costs, jar shapes, backdrops, trinkets, each a 64 px row with BUY or PLACE; a bought seed is dragged
  from the pouch bar at the bottom of the jar screen onto the soil.
- **Edit mode.** Entered by a long press; stones, driftwood and trinkets get handles; DONE (56 px) top centre.
- **Settings.** Sound, Motion, Tilt (asks on tap), Weather (asks for location on tap, shows the waiting state, shows the last
  fetch time), Hemisphere toggle, Export jar, Import jar, About: the positioning line, "Sky Wolf Studio", the Dr Ward line
  from the design's lore.
- **Catch up.** Not a screen: the montage over the jar with "3 days passed" and a tap to skip.

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the app never waits on it)

Four sheets in `plans/wardian/ART-PACK-WARDIAN.md` (a copy in 012Assets as `Wardian — Art Pack`).

| File | Used for | Delivered | In game |
|---|---|---|---|
| `room-backdrop.png` | the warm dark room behind the jar | 9:16 | `art/room.jpg` 900x1600 q80 |
| `jar-glass.png` | the front glass with rim and specular, on pure black for screen blending | 3:4 | `art/jar.png` 1200x1600 with alpha (Fable keys it) |
| `journal-plates.png` | the eleven species as pencil silhouettes on cream, one sheet | 1:1 | cut by Fable to `art/plates/<species>.png` 256x256 |
| `icon-mark.png` | PWA icon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Wardian", ds:"A sealed jar that lives on your time. Moss, ferns and small bugs grow while you are away, night falls when it falls outside, and nothing in the jar can ever die.", cat:"creative", url:"/satellites/wardian/?v=<stamp>", ic:"🫙", thumb:"/portal-assets/thumbs/wardian.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED with the nothing dies assertion
in it; `test/touch.mjs` passed with real pointers; the unfurl strip was opened and judged.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9.
- A catch up that ticks `elapsed / TICK` times with the clock frozen at "now" grows a month of daytime; advance the clock per
  tick, in order, and assert the night count.
- A save written on every tick is a phone with a hot pocket; every 60 s and on hide, and the ticks in between live in memory.
- `visibilitychange` fires hidden on a phone lock; the return path must be the same `catchUp`, with `lastSeen` as of the hide.
- A `Date` with `getHours()` is what the promise needs here (the device's own clock); do not convert to UTC.
- Segment trees serialised as objects blow the save past 1 MB by week two; arrays, and the cap.
- A moss that spreads on a 24 by 8 grid with no cap covers the jar in a day; the per tick probability and a cover ceiling of
  55 percent are in the species rules, and the census over 30 days is the gate.
- The pillbug rolling up on a tap is the shareable moment; if the tap is within 60 wu of two bugs, both roll. Never make the
  player aim.
- `navigator.vibrate` throws on iOS in some versions; wrap it.
- The Jarwright never asks. A journal line that says "water your fern" breaks the brand; the words gate cannot read intent, so
  reread every line with that in mind.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's three open questions take these answers tonight:

1. **Name: WARDIAN.** Stephen's folder and title; the alternates (Jarworld, Still Life, The Quiet Jar) stay in the morning
   report.
2. **Weather ask: Settings plus a journal hint.** Section 3.3.
3. **Hemisphere: guess from the time zone with a toggle.** Section 3.4.

Yours without asking: the species rules inside the caps, the drawn look inside the palette, the journal wording inside the
voice, the montage feel, the sounds.

Stephen's, never guessed: price, store, the name, the "Jarwright's Satchel" one time unlock (nothing is monetised tonight),
the Penny designed species, the classroom page, anything with money.

---

## 11. STEPHEN ONLY

The phone: open it in the evening, mist, tap the glass, close it, open it the next morning and watch the montage. The four art
sheets when the Midjourney month allows. Penny's species, whenever.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1.5 h, P1 about 2.5 h, P2 about 2.5 h, P3 about 2 h: about 8.5 hours. Expect 4,000 to 5,000
lines. **Where a single night stops well:** the end of P2 step 2 (the full flora and fauna with the journal) is a complete
product; spores and the pouch are a second session, weather a third. If the clock says P1 cannot finish, land the fern and the
sway and the catch up before the tap and the mist; the jar has to be worth watching before it is worth touching.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, the gate that fails first (2026-09-05)

```
$ node tools/check.js
sim             FAIL  1s
  marker not found: // ---- SIM_EXPORT_START ---- / // ---- SIM_EXPORT_END ----
1 GATE FAILED
```

### P0 step 2, the ecosystem green (2026-09-05)

```
$ node sim.js --test
PASSED 101 / FAILED 0   (total 101)
WARDIAN TEST OK

$ node tools/check.js
sim             pass  0s
ALL GATES PASSED
```

Four mutations, each watched to go red, each restored:

```
$ node sim.js --test --over=WAKE_TICKS=9999
FAIL  and a mist wakes it inside six ticks (-1)
PASSED 100 / FAILED 1   (total 101)

$ # a dormant plant spliced out of tick(), by hand, then restored
FAIL  under never mist, nothing in the jar dies, sickens or leaves over thirty days: fern fell on day 8, mooncap fell on day 8, a plant was removed on day 8
FAIL  under weekly mist, nothing in the jar dies, sickens or leaves over thirty days: fern fell on day 15, mooncap fell on day 15, a plant was removed on day 15
FAIL  and it never splices a plant or an agent out of the jar
PASSED 92 / FAILED 3   (total 95)

$ node sim.js --test --over=SPRINGTAIL_MOIST=0.5
FAIL  under twoDay mist every animal finds the jar inside a month: springtail never came
PASSED 100 / FAILED 1   (total 101)

$ node sim.js --test --over=GROWTH_PER_TICK=0.004
FAIL  a fern reaches its third generation inside two days (0)
FAIL  and it has leaves on it
FAIL  and it is a real jar, not two sticks (23 segments)
PASSED 98 / FAILED 3   (total 101)
```

Two real bugs the gates found, both fixed before P0 closed:

- **the springtails could never arrive.** Their gate wanted a surface cell wetter
  than 0.5 and a sealed jar's surface never passes 0.30, so a third of the fauna
  was dead content that no other check minded. `SPRINGTAIL_MOIST` 0.5 to 0.20,
  `SPRINGTAIL_DECAY` 0.4 to 0.25, and `suiteArrivals` now fails if any animal
  cannot find a misted jar inside a month.
- **moss reached 58 percent against a 55 percent ceiling.** The ceiling was a
  fraction tested once at the door, and one pass seeds both sides of several
  cushions. Counted in cells now, with the room decremented as it is used.

The fourteen day census, a jar misted every second day, nothing planted by hand:

```
a jar under "twoDay" mist, 14 days, from the first of April
  day   segs  moss  bugs  dorm  surf  water  species
    1     11     5     0     0   0.18   33.4  fern mooncap
    2     13     5     0     0   0.09   32.0  fern mooncap
    3     23     6     0     0   0.11   36.6  fern mooncap
    4     23     6     0     0   0.06   35.2  fern mooncap
    5     23     6     0     0   0.10   39.9  fern mooncap
    6     23     6     0     0   0.07   38.5  fern mooncap
    7     23     7     0     0   0.12   43.2  fern mooncap
    8     23     7     0     0   0.08   41.8  fern mooncap
    9     23     7     0     0   0.13   46.5  fern mooncap
   10     23     7     0     0   0.10   45.1  fern mooncap
   11     23     9     1     0   0.15   49.8  fern glowbeetle mooncap
   12     23     9     1     0   0.12   48.5  fern glowbeetle mooncap
   13     34    11    12     0   0.16   53.0  fern glowbeetle mooncap pillbug springtail
   14     56    13    12     0   0.13   51.6  fern glowbeetle mooncap pillbug springtail

spores 146.7, journal 4 entries, humidity 0.51
WARDIAN CENSUS OK
```

Reading it: the two ferns run out of ladder on day 3 and the segment count sits
at 23 until the first leaves fall on day 13. That plateau is real and it is what
the pouch is for; by day 14 the jar has 146 spores, which is nine seeds. The
mooncap on day 1 is not a bug, the moon of 2026-04-02 is full and the jar starts
on 04-01. Water climbs because a mist adds more than the seal leaks, which is
why nothing in here can be overwatered.

### P1, the jar you can watch (2026-09-05)

```
$ node tools/check.js
sim             pass  1s
lint            pass  0s
boot            pass  3s
touch           pass  8s

ALL GATES PASSED
```

The touch gate, every press a real pointer at a point elementFromPoint agrees is
reachable:

```
$ node test/touch.mjs
  ok    a 120 px swipe down mists the jar (surface up 0.250, MIST_ADD is 0.25)
  ok    and droplets come off the swipe (26)
  ok    a second swipe inside the cooldown does nothing (0.000)
  ok    and a 40 px drag is not a swipe (0.000)
  ok    the tap landed on the glass and not on a button (jar)
  ok    a tap over a pillbug rolls it up for about three seconds (2850 ms)
  ok    and it counts down in real time (1800.1 ms)
  ok    a tap on the far side of the jar does not (0)
  ok    the jar does not start in edit mode
  ok    a 620 ms press opens edit mode
  ok    and the done button is a 48 px target on top (56 px)
  ok    and a 46 px drag moves the stone by the drag distance (36.0 world units, the drag was 36.0)
  ok    and dragging in edit mode never moves a plant
  ok    the loop is asking for frames while the tab is visible (7)
  ok    and it stops inside a second of the tab hiding (0 frames asked for)
  ok    and the jar was written to the save on the way out
  ok    nothing landed on the console

TOUCH OK
```

Four more mutations watched to fail, each restored:

```
$ # SWIPE_PX 90 to 900
FAIL  a 120 px swipe down mists the jar (surface up 0.000, MIST_ADD is 0.25)
FAIL  and droplets come off the swipe (0)

$ # the visibilitychange stop removed
FAIL  and it stops inside a second of the tab hiding (31 frames asked for)

$ # the night veil made additive again, the bug the first night shot caught
FAIL  and the inside of the jar at midnight is darker than at one (84 against 78 average brightness)

$ # a dash put into a line the player reads
FAIL  no dash in anything a player reads: ["A tiny world - it lives on your time"]
```

**Two gates were decoration when first written, and the watch caught it.** The
darkness assertion averaged the WHOLE canvas, and the room is most of the
picture, so it stayed green with the night veil inverted; it measures the jar
interior now. And the frame loop assertion passed with its own guard deleted,
because the visibilitychange handler was doing the stopping; it was rewatched
with the handler broken and goes red properly.

### The shots, opened and read (2026-09-05)

**`docs/shots/p1-jar-day.png`** — a jar on a table in a dark room, two ferns of
different size, moss between them, stones set into the soil. Three things wrong
with it: the soil face is still a wide flat brown band across a third of the
frame and only the crumbs break it up; the condensation on the glass reads as an
even sprinkle rather than beads gathering at the top; and the room behind is
plain, so the jar has nothing to sit in front of.

**`docs/shots/p1-jar-night.png`** — the same jar cold and dark, the fronds gone
sage, the light coming from one point near the lid. Three things wrong: the soil
stays warm brown while the air above it has gone blue, so the horizon is an
abrupt seam; nothing in the frame says night except the colour, because the
glowbeetle has not arrived by day 10; and the beads are identical to the day
shot when they should be catching a colder light.

**`docs/shots/p1-unfurl.png`** — six panels, curl 1.0 down to 0.0. It reads: at
1.0 the fronds are tight croziers, at 0.6 they are opening hooks, at 0.0 they
are full pinnate blades. Three things wrong: the crown crosses over itself at
0.2 and 0.0 so the silhouette muddles; the panels show the whole plant rather
than one frond, so the unfurl is smaller in frame than it should be; and the
moss fringe sits at almost the same value as the ferns, which is why it was
pushed a step darker after this shot was taken.

**Six things the shots caught that no gate would have.** The plants were laid
out in world units and drawn as pixels, so both ferns stood in the ROOM above
the jar. `mixHex` could not read its own output, so the moss came out black. The
grain was placed by modular arithmetic and landed in diagonal dashes. A
`destination-out` fade erased the jar and left a black slab down one side. The
night jar was brighter than the noon one. And the fronds went bald for the last
fifth of their length.


### P2, the things that arrive and the voice (2026-09-05)

```
$ node sim.js --test
PASSED 122 / FAILED 0   (total 122)

$ node tools/check.js
sim  lint  journal  boot  touch  layout        ALL GATES PASSED
```

The arrival days the plan puts numbers on, measured on a twenty day run:

```
daily    springtail day 1, glowbeetle day 4, pillbug day 6   (the plan allows 4, 6, 9)
twoDay   springtail day 1, pillbug day 6, glowbeetle day 7
never    nothing arrives, and nothing is lost
```

Two mutations watched to fail:

```
$ # SPRINGTAIL_MOIST back to the surface a sealed jar can never reach
FAIL  under twoDay mist every animal finds the jar inside a month: springtail never came

$ # a line in the journal given an order to the player
FAIL  and the species pages and letters never give an order: species moss, species pillbug
```

That second one is not a mutation. It is what `test/journal.mjs` found the first
time it ran, on lines I had written and thought were fine: "Press a finger to
it" and "Tap the glass near her". Both are now description.

`test/layout.mjs` was also decoration on its first run: it measured a pouch
button below the fold and called it covered. It scrolls each one into view first
now, and passes at 320, 375 and 412.

### P3, the sky, the rares and the photograph (2026-09-06)

```
$ node tools/check.js
sim             pass  1s
lint            pass  0s
journal         pass  0s
boot            pass  3s
touch           pass  8s
settings        pass  6s
layout          pass  6s

ALL GATES PASSED

$ node sim.js --catchup=30
away 30 days: 2016 ticks run (the cap is 2016), 14 nights passed
  before {"fern":2}  segments 2
  after  {"fern":2,"mooncap":1}  segments 34
WARDIAN CATCHUP OK

$ node tools/thumb.mjs
  docs/thumb.png  99 KB   512x512   lit 42%  green 3.5%  warm 25.3%
THUMB OK
```

Four more mutations watched to fail:

```
$ # a location added to the photograph's stamp
FAIL  and it carries no coordinates

$ # the weather switch on by default
FAIL  the jar does not listen to the sky until it is asked

$ # the moon cap taken off the moon
FAIL  and a full moon at night brings the moon cap   [expected mooncap, got null]
FAIL  and the moon cap is rare rather than absent (0 nights in the year)

$ # the thumb tool pointed at a two in the morning jar
REFUSED to write the thumb: too dark (17 percent lit), no warmth in it (0.0 percent)
```

### The P2 and P3 shots, opened and read

**`p2-journal.png`** — eleven pages, each with a plate drawn by the same
renderer as the plant in the jar. Three faults: the unmet pages repeat one
sentence six times down the screen; the plates are pencil on cream and sit low
in value against the paper; and the spore count is a small line under the title
where a reader looks for it at the top right.

**`p2-pillbug.png`** — the phone screen with a four times crop beside it. She
reads as a dark bead with a lit rim on the soil. Three faults: at phone size she
is nine pixels and could be a pebble; the segment arcs on the rolled body are
too faint to see without the crop; and the crop panel is nearest neighbour, so
the evidence is blockier than the game.

**`p2-night-beetle.png`** — the beetle awake on the soil with a green light and
a short trail. Three faults: the trail is five dots rather than a smear; the
light does not fall on the frond above it; and the rest of the jar is so dark
that the beetle is the only thing in the frame with any information in it.

**`p2-pouch.png`** — seeds, things for the jar, and where it stands, each a 64 px
row with a buy button. Three faults: the seed rows have no picture while the
journal pages do; every row is the same height and colour, so the three sections
run together; and a bought seed says nothing about where it goes until you go
back to the jar.

**`p3-photo.png`** — the jar at 1080 by 1440 with "Sept 6, morning" under it.
Three faults: the top third is empty air above the plants; the stamp sits on a
wide band of table with nothing else in it; and the room's gradient bands
visibly at this size.

**`p3-rain.png`** — rain running down the outside of the glass on a grey
afternoon. Three faults: the streaks are all near vertical where real rain on
glass beads and runs; they cross the soil, which is correct but reads as
ambiguous; and the jar's interior is dimmed by the weather while the room
outside it is not.

**`p3-snow.png`** — frost creeping in from the four corners of the glass at two
in the morning. Three faults: the top left corner is a smudge rather than
crystals; the frost spikes are the same value as the condensation; and the jar
is so dark at that hour that the frost is most of what you can see.

**`p3-320-day.png`**, **`p3-375-day.png`**, **`p3-412-day.png`** and their night
pairs — the same jar on three phones. Three faults across the set: at 320 the
first line of copy sits right on the jar's bottom rim; at 412 there is a band of
empty room above the jar that the other two do not have; and the day shots at
all three widths put the horizon at exactly the same height, so the composition
does not use the extra room a taller phone gives it.

**`docs/thumb.png`** — the portal tile, the jar at dusk with two beetles lit.
Three faults: one beetle is half off the left edge and reads as a stray light;
the soil is nearly half the tile; and the trimmed colour depth bands the air
into visible stripes.

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `boot, touch,
layout`.

---

## 15. THE MORNING REPORT

### Wardian, built 2026-09-05 into 2026-09-06

**Where it is.** P0, P1, P2 and P3 are done, committed and pushed on
`add-sproing-jumper`. `node satellites/wardian/tools/check.js` prints ALL GATES
PASSED across seven gates: `sim` (122 assertions), `lint`, `journal`, `boot`,
`touch`, `settings`, `layout`. Every gate has been watched to fail, and two of
them had to be REWRITTEN because the first watch showed they could not fail.
Twelve mutations in total are in the ledger at section 13, each with its real
output.

**What it is.** A sealed jar that lives on the phone's clock. Moss spreads, ferns
put up crowns of fronds that unroll from croziers over forty ticks, a glass vine
climbs the wall, a ghost mushroom comes up at night, a dew sprout opens a droplet
when the air is wet. Springtails arrive on the first mist, a pillbug rolls into a
bead when you tap the glass near her, a glowbeetle walks the glass at dusk with a
light on. Three shy species answer real weather with a clock fallback, so a
player who leaves the weather switch alone still meets all eight plants inside a
year. You mist by swiping down, you plant with spores, you move the stones with a
long press, and you can photograph it. Nothing in the jar can die, get sick or
leave, and that is a gate over thirty simulated days under every watering policy,
enforced twice: as an assertion and as a grep for `plants.splice` in the shipped
file.

**What I would look at first.** The jar itself, at
`satellites/wardian/docs/shots/p1-jar-day.png` and `p1-jar-night.png`, and then
`p1-unfurl.png`, which is the six frame strip of a frond opening. The plan says
watching a fern unfurl has to be worth thirty seconds; that strip is my case
that it is.

**What the shots caught that no gate would have.** Nine things, and this is the
part worth reading. The plants were laid out in world units and drawn as pixels,
so both ferns stood in the ROOM above the jar. `mixHex` could not parse its own
output, so the moss rendered black. The soil grain was scattered by modular
arithmetic and landed in diagonal dashes. A `destination-out` fade meant to
soften the glass sheen erased the jar and left a black slab. The hour ADDED light
at every phase, so the night jar was brighter than the noon one. The fronds went
bald for the last fifth of their length. Rain fell INSIDE the sealed jar. The
glowbeetle's light spilled out through the glass into the room. And the beetle
was still glowing at four in the afternoon, because `asleep` is only refreshed on
a tick and a tick is ten minutes. Twelve automated gates were green through most
of that.

**What is thin.** Three things.

1. **The middle of the first fortnight is quiet.** Under a mist every second day
   the two starting ferns reach the top of their ladder on day three and the
   segment count sits at 23 until the first leaves fall on day thirteen. The
   pouch is the answer, and by day fourteen the jar has 146 spores, which is nine
   seeds. But a player who does not open the pouch sees moss move and nothing
   else for ten days. I would want the Director's eye on that before it ships.
2. **Humidity cannot separate a cared for jar from a neglected one.** Every jar
   runs damp by the afternoon, which is what a sealed jar IS, so the dew sprout's
   `needHumidity` gate opens most afternoons in any jar. It is pretty and it is
   honest, but it is not a reward for care. The dew sprout's assertion drives the
   air directly for that reason, and says so.
3. **No painted art and no sound files.** Every pixel is drawn by code and every
   sound is synthesised. `ART_ASSETS.md` lists what painted art would replace and
   the rules it has to keep. Nothing waits on it.

**What I did not do.** The plan's section 7 art pack is not written; the code
draws everything and `ART_ASSETS.md` covers what a painted version would have to
be. There is no portal listing edit, which section 8 says is Fable's.

**For Fable, to check independently.** Four things.

- The seven gates, run cold: `cd satellites/wardian && node tools/check.js`.
- The claim that no gate can pass while broken: pick any assertion in
  `sim.js --test` and break the code under it.
- The shots, opened rather than listed. Every one of them is under 200 KB and
  taken at the player's own pixels, and the two close ups carry a magnified crop
  beside the phone frame.
- **A stray, reported rather than hidden.** Four image files outside this fence
  (`satellites/asterism/docs/thumb.png` and three Fathom shots) came up modified
  by a few bytes during this session, from a shot tool being re-run. I restored
  all four to HEAD rather than commit the churn, and `git status` for those three
  satellites is clean. Worth a look, because I cannot fully account for when they
  were touched.

**Next action if the night continues:** row 5 of the spine, Doohickey, starting
at its P0 step 1.


The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the census** for the
14 day catch up, pasted.
