# HANDOFF ASTERISM, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-ASTERISM.md`
(Stephen's design, read in full) plus the fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then this file, then the design. Where the design and
this file differ, this file wins; every difference is in section 3 with its reason.
**Game folder:** `satellites/asterism/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/asterism/`.
**Data already prepared for you:** `plans/asterism/hyg-asterism.json`, the packed star catalogue (section 2). You copy it into
the game folder; you do not fetch anything from the network at night.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written, catalogue packed and checked (Vega, Polaris, Sirius, Altair, Deneb, Betelgeuse all present
  with the right numbers). Nothing built.
- 2026-09-05 Opus: P0 step 1, `tools/check.js` with one gate and no `sim.js` to run, red, pasted in section 13. Next action:
  P0 step 1 continued, the scaffold and the ASTRO layer in `satellites/asterism/index.html`.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/asterism/**` and this plan's ledger (section 12 of `plans/asterism/HANDOFF-ASTERISM.md`).
   Nothing else. Not another satellite, not `portal/index.html`, not `scripts/`, not `music-unlocks.js`, not any other game's
   `sw.js`, not `art-asset-lists/`, not memory. A fix that seems to need a file outside the fence goes in the morning report as
   a request to Fable and the game works around it tonight.
2. **Git.** `git pull --rebase --autostash origin add-sproing-jumper` before the first edit and before every push. Stage with
   `git add satellites/asterism plans/asterism/HANDOFF-ASTERISM.md`, never `-A`, never `.` (a second builder shares this
   tree). Commit after every green subsystem, push the branch. **Never push to main.** Fable deploys.
3. **Studio laws.** No dashes and no exclamation points in anything a player reads, including every generated myth and every
   generated name (the myth gate greps for them). 48 px rendered touch targets at 375x667 proved by `elementFromPoint`. The
   brand is **Sky Wolf Studio**, singular (the design's Sky Walk Studio is a typo). Runtime modules `.js`, never `.mjs`. Every
   loaded URL carries `?v=<stamp>`; `sw.js` `SHELL_VERSION` and the registration `?v=` move together. Text 0.7 rem or larger.
   Portrait, one hand. **LOOKING IS PART OF THE JOB**: a visual change is done when you have opened the shot with the Read
   tool and named three faults.
4. **Never wait on a human.** Section 13. The open questions in section 9 take the answers written there.
5. **No fonts from the network, no data from the network.** The catalogue is in the repo; the serif is the system stack.

---

## 1. WHAT ASTERISM IS, AND WHY IT IS WORTH A NIGHT

From the design: *"The actual night sky, real stars, correctly placed for your location, right now, rendered as a quiet,
scrollable dome. Tap stars to connect them into your own constellation. Name it. The app studies the shape you drew and writes
its myth: a short, strange, beautiful origin story that references what you actually made. Your constellations live in a
personal Almanac and stay pinned to the real sky."* Positioning line: **"The sky is still hiring gods."** Tone: planetarium
hush; a nine year old's Space Dog gets the gravity Ptolemy gave Lyra.

Why it is worth a night: the design's market read holds (I checked it before writing this: neal.fun's Constellation Draw is a
toy with no real sky; the itch and iOS entries either fake the stars or teach the official 88; the star map poster category is a
real print on demand market). Nobody combines a real sky, your own constellations, a generated myth and a keepsake export. The
astronomy is small and provable (section 5, P0 has the numbers), the render is a few thousand dots, and the myth engine is
text, which this studio already knows how to gate (the haiku engine and Keepsies' words gate). It goes second because its first
hour is pure math with known answers, which is the safest possible start for an unattended run.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| **The star catalogue** | `plans/asterism/hyg-asterism.json` (88 KB) | Copy to `satellites/asterism/data/hyg-asterism.json`. 1,792 stars: every star of magnitude 5.0 or brighter (1,637) plus every fainter star that has a proper name (155 more), the Sun removed. Fields per star: `[ra_hours, dec_deg, mag, ci, proper, con, bayer, hip]`, epoch J2000. 548 have proper names, all 88 constellation codes are present. Source HYG v4.4 by David Nash, `codeberg.org/astronexus/hyg`, sha256 of the source gz `00b349893b9a53106dd488d8371e8d2fa586043e500bb3cdb8bff3931682197d`. **Licence CC BY-SA 4.0**, section 3.2 |
| Single file layer order, marker comments, seeded RNG, page test harness | `satellites/deepwell/index.html` lines 548 to 575, `seedFromString` (687), `mixSeed` (694), `dailySeedFor` (700), `var TEST` from 1548 | Same names. Asterism's layers: `CONFIG, DATA, ASTRO, SKY, DRAW, MYTH, ALMANAC, POSTER, SHARE, AUDIO, INPUT, TEST, BOOT`. `ASTRO_EXPORT` markers wrap CONFIG through ASTRO plus the MYTH grammar so `sim.js` runs them headless |
| Headless runner | `satellites/deepwell/sim.js` | The marker extractor and the `--test` shape. Asterism's `sim.js` has `--test`, `--myth=N` (print N myths for reading), `--sky=<lat>,<lon>,<iso>` (print the 20 brightest stars above the horizon with alt and az, for a human to check against any planetarium app) |
| Service worker, manifest, icons, portal frame protocol, music hook, gate runner, browser gate shape, headless flags, thumb and icon tools | exactly as listed in `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `asterism` in place of `fathom`. Add `./data/hyg-asterism.json?v=<stamp>` to `SHELL_ASSETS` so the sky works offline after the first load |
| Pinch zoom on a canvas | `satellites/abduct-a-chameleon/index.html` `tryStartPinch` at 1298 and the `pinch` state at 1039 | A second finger while a pan finger is live becomes a pinch; `d0` is the starting distance; the zoom scales `vz0 * d / d0`; a third finger never fights a pinch |
| Share by link, no backend | `satellites/blockspace/index.html` lines 1060 to 1080: `b64u`, `packJSON`, `unpackJSON`, `copyLink`, `importFromHash` | Base64url of the JSON in `location.hash`, `history.replaceState` after import, `navigator.share({title, url})` first, clipboard second, a visible text box third. Asterism uses `#c=`; with at most 60 stars per constellation the JSON is small enough to skip the deflate step, so no `CompressionStream` dependency |
| Export a canvas as a PNG the phone can keep | `satellites/attic/index.html` lines 1446 to 1466 | `toBlob`, `new File([...], name, {type:'image/png'})`, `navigator.canShare({files})` before `navigator.share`, then a plain download as the fallback |
| Geolocation that never soft locks | memory `feedback_ios_gps_softlock` (Fable's note in 3.6) | Never gate a tap on a position that may still be null; a fallback place is always set; a 6 s timeout; a visible state while waiting |
| A gate on generated words | `satellites/keepsies/test/words.mjs` | Its three rules: every fragment reachable, no fragment swallows the output, the ladder is monotonic. Asterism's `test/myth.mjs` in section 5 |
| Voice rules for the corpus | `HAIKU_PRINCIPLES.md` at the repo root | Concrete images over morals, no absolutes as a crutch (always, never, forever), a gnomic line as a minority voice only, personification only of real things doing observable things |

Not inherited, on purpose: no three.js (a 2D stereographic dome is a few lines), no map library, no font files.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each one forced by a measurement, a licence or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable. No Firebase Hosting.

3.2 **The catalogue is CC BY-SA 4.0, not public domain, and it ships as its own file.** The design says HYG is a public domain
compilation; the repository README says every version since 4.0 is Creative Commons Attribution ShareAlike 4.0. Two
consequences. First, an attribution line appears in the About sheet and in the small credit on every exported poster: `Star data
from the HYG database by David Nash, astronexus.com, CC BY-SA 4.0`. Second, the packed catalogue stays a separate file,
`data/hyg-asterism.json`, with the licence written inside it, rather than the design's base64 blob inside `index.html`; the
share alike obligation then attaches to the data file, which is what we want. Whether that is enough is Stephen's question
(section 10); tonight you build it this way.

3.3 **The astronomy has known answers and the gate uses them.** Section 5, P0, lists constants that are published (not
computed by us) and geometric identities, with the numbers. No pixels until they pass.

3.4 **The official 88 constellation lines are not built.** The design recommends off by default; the line data would need its
own licence check, so it is out of the slice entirely. The catalogue's `con` field is used instead: every star knows its
region, and the myth may say "in the region the old charts call the Lyre". A table of the 88 codes to English names lives in
DATA; TEST asserts every code in the catalogue has one.

3.5 **Stars are picked by nearest within 28 CSS px, and the pick is named.** A star is a 2 to 4 px dot and the 48 px law is
for buttons, not for stars. The rule: a tap picks the nearest star within 28 px of the finger; nothing within 28 px is a miss
(no chime); after a pick a small label under the star shows its proper name, else its Bayer letter and region, for 1.2 s, so the
player knows which star they got. Pinch zoom (30 to 120 degrees of field) is how close pairs are separated.

3.6 **Place and time never block on the network or on GPS.** Boot uses the device clock and the saved place; the first ever
boot uses **Columbus, Ohio, 39.96 N 83.00 W** (the design's nod to Ohio), shown by name in the place chip so it is never a
secret. "Use my location" is a button in the place sheet with a 6 s timeout and a visible waiting state; it is never called on
boot. A manual city list of at least 120 cities (name, country, lat, lon) and a lat and lon field are always available.

3.7 **Local time at a chosen place is longitude time.** For Birth Sky at a manual place the app has no time zone table.
`UT = local - lon / 15` hours. An hour of error moves nothing a poster can show and the almanac says "about 9 in the evening",
never a minute. Logged in DECISIONS.

3.8 **Fonts: the system serif stack, no files.** `Georgia, "Iowan Old Style", "Palatino Linotype", "Book Antiqua",
"Times New Roman", serif`, small caps by `font-variant: small-caps`, letter spacing 0.08 em on names. The design's "subset one
embedded serif if the look demands it" is a morning question for Stephen with a poster in hand.

3.9 **Twinkle is information, so it is allowed, and it is cheap.** Only stars brighter than magnitude 3 twinkle, alpha noise
amplitude 0.15, off under reduced motion and off by a setting. The star layer is drawn once to an offscreen canvas on any
view or time change; the per frame composite is that layer plus at most 60 twinkling stars plus the UI.

3.10 **Poster sizes and the host.** Posters export at 2048x2560 (4:5). Any image the game ships (the Plate frame, section 7)
is delivered at 1200x1500 because the host resizes anything over 1600 px on a side, and is drawn scaled up at export time.

3.11 **Share links carry HIP numbers, not indices.** A constellation is `{v:1, s:[hip...], e:[[i,j]...], n:name, m:mythSeed,
t:createdIso, p:[lat,lon], d:skyIso}`; edges index into `s`. HIP numbers survive a catalogue update; row indices do not. A star
with no HIP (a handful of named faint stars) is skipped from picking entirely (TEST asserts every pickable star has `hip > 0`).

3.12 **The myth corpus is written tonight in the studio voice, and the six anchors are Stephen's.** The design wants six hand
written myths from Stephen and Penny first; that did not happen before this night. You write the grammar and a seed corpus
(section 4) under `HAIKU_PRINCIPLES.md` rules, and `data/anchors.json` ships empty with a comment saying whose it is. The
morning report asks for the six.

3.13 **Re-roll keeps three.** "Another" advances the seed; the sheet holds up to three alternates and the player keeps one.
After three, "Another" reads "Keep one of these" and stops. The design says the same; this makes the cap a rule.

3.14 **Portal music is left alone.** Asterism has an air tone and chimes, no music of its own, so it does not post
`game-music`. The player's portal music choice stands (Fathom is the one that silences the portal, because sound is its play).

3.15 **Copy.** No dashes, no exclamation points, in myths, names, prompts and UI. The myth gate fails the build if a fragment
contains either, or the words always, never, forever.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/asterism/`):

```
index.html                       the app, one file
data/hyg-asterism.json           the catalogue, licence inside, loaded with ?v=
sim.js                           --test, --myth=N, --sky=lat,lon,iso
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/boot.mjs  test/draw.mjs  test/almanac.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md  data/anchors.json
```

**CONFIG (frozen):**

```
GAME_ID 'asterism'  SAVE_KEY 'lw_asterism_v1'  SAVE_V 1
FALLBACK_PLACE {name:'Columbus, Ohio', lat:39.96, lon:-83.00}
FOV_MIN 30  FOV_MAX 120  FOV_DEFAULT 90       (degrees across the short axis)
PICK_PX 28  MAX_STARS_PER 60  LABEL_MS 1200
TWINKLE_MAG 3.0  TWINKLE_AMP 0.15  TWINKLE_MAX 60
MAG_LIMIT_DARK 5.0  MAG_LIMIT_DUSK 2.0  MAG_LIMIT_TWILIGHT 3.5
SUN_DARK -18  SUN_DUSK -6                 (sun altitude thresholds, degrees)
TYPE_CPS 30  REROLL_MAX 3
POSTER_W 2048  POSTER_H 2560
GEO_TIMEOUT_MS 6000
```

**ASTRO (pure functions, no DOM, the part `sim.js --test` runs):**

- `jd(dateUtcMs)`: Julian Day from a UTC millisecond timestamp: `ms / 86400000 + 2440587.5`.
- `gmstHours(JD)`: `(18.697374558 + 24.06570982441908 * (JD - 2451545.0)) mod 24`.
- `lstHours(JD, lonDeg)`: `gmst + lon / 15`, mod 24 (east positive).
- `altAz(raH, decDeg, latDeg, lonDeg, JD)`: hour angle `H = (lst - ra) * 15` degrees; `sin alt = sin dec sin lat + cos dec cos
  lat cos H`; `az = atan2(-sin H cos dec, cos lat sin dec - sin lat cos dec cos H)`, normalised to 0..360 with north 0 and
  east 90.
- `sunRaDec(JD)` (USNO low precision): `n = JD - 2451545.0`; `L = 280.460 + 0.9856474 n`; `g = 357.528 + 0.9856003 n`
  (degrees, mod 360); `lambda = L + 1.915 sin g + 0.020 sin 2g`; `eps = 23.439 - 0.0000004 n`; `ra = atan2(cos eps sin
  lambda, cos lambda)`, `dec = asin(sin eps sin lambda)`. Used only for the sky palette and the magnitude limit.
- `moon(JD)`: phase from `((JD - 2451550.1) / 29.530588853) mod 1` (0 new, 0.5 full); position, low precision, `d = JD -
  2451545.0`: `L = 218.316 + 13.176396 d`, `M = 134.963 + 13.064993 d`, `F = 93.272 + 13.229350 d`; `lon = L + 6.289 sin M`,
  `lat = 5.128 sin F`; to RA and Dec through the obliquity above. A degree of error is fine for a disc in the sky.
- `project(alt, az, viewAlt, viewAz, fovDeg, w, h)`: stereographic projection about the view centre; returns screen x, y and
  a flag for behind the view cap (angular distance from the view centre over 100 degrees at the widest field).
- `unproject(x, y, ...)`: the inverse, for picking and for the drag to pan.
- `galacticBand(raH, decDeg)`: angular distance from the galactic north pole (RA 12.857 h, Dec 27.13) minus 90 degrees, so the
  Milky Way brightness is `exp(-(d / 12)^2)` times a seeded noise along the band.
- `wellPlacedMonth(raH, lonDeg)`: the month in which the constellation's mean RA transits at 21:00 local time: evaluate
  `lst(21:00 local)` for the 15th of each month and pick the month whose LST is nearest the RA. Returns a month name.

**DATA.** The catalogue loader (fetch with `?v=`, then typed arrays: `Float32Array` ra, dec, mag, ci; a names table; a
`hip` `Int32Array`; a spatial index by 1 hour RA bands for picking). The 88 code to name table. The city list (120 or more:
name, country, lat, lon; hand written; every major world city and every US state capital, at least). The grammar corpus.

**SKY.** The offscreen star layer (redrawn on view or time change), colour by `ci` (blue white below 0.0, white to 0.6, yellow
to 1.0, amber to 1.5, red above), size by magnitude (mag -1: 4.5 px, mag 5: 1.2 px, at DPR 1), a cross glint on stars brighter
than 1.0, the ground silhouette (rolling hills, drawn by code, a painted strip later if delivered), the palette from the sun's
altitude (dusk deep blue, true dark near black indigo `#070A1A`, pre dawn indigo), the moon disc with its phase, the Milky Way
band.

**DRAW.** The constellation being drawn: `stars` (hip list), `edges`, the last picked star for undo, branch on tapping any
star already in the chain, close a loop by tapping the first star. Lines are chalk gold `#E8C97A`, 1.5 px, with a 1 px waver
from a seeded noise along the segment, drawn with an ease out over 350 ms on creation.

**MYTH.** `features(constellation, sky)`: star count, kind (`chain`, `branched`, `loop`), aspect (`long`, `tall`, `compact`),
symmetry score, largest interior angle, brightest star (proper name if any), faintest star, region (most common `con`), near the
Milky Way (mean `galacticBand` under 15 degrees), near the horizon at creation (mean altitude under 20 degrees), season of
creation, hour of creation. `archetype(features)`: `loop` → creature or vessel; `chain` of 5 or more → journey, river,
serpent; `branched` → tree, antlered thing, family; `compact` → seed, eye, ember. The grammar: three beats, ORIGIN, DEED, OMEN,
each a template with slots filled from lists keyed by archetype, seeded by `mixSeed(mythSeed, beat)`. Slots and minimum counts
tonight: ORIGIN_OPEN 20, ARCHETYPE_NOUN 12 per archetype (48), DEED 10 per archetype (40), FALL 12, PLACED 12, OMEN 30 (every
one gentle: found keys, good bread, a brave first day, rain on the right field), STAR_HOOK 8 templates that take the brightest
star's real name, REGION_HOOK 6 that take the region name, NAME_ADJ 40 and NAME_NOUN 40 for the dice. About 270 fragments,
each a concrete image. The typewriter reveals at `TYPE_CPS` with a soft scratch per word; tapping the sheet completes it.

**ALMANAC.** Save `lw_asterism_v1`: `{v, place, entries:[constellation...], settings:{sound, twinkle, motion}, seen:{how}}`.
Read, modify, write; `storage` event reloads; entries are merged by id, never replaced wholesale. Export and import as a text
string in Settings.

**POSTER.** A 2048x2560 canvas: `Chart` (indigo, the sky around the constellation at 60 degrees of field, the constellation in
gold, the myth beneath in the serif, name in small caps, footer with date, place and the credit), `Minimal` (black, the stars,
one line of the myth), `Plate` (the Chart inside an engraved border: the delivered frame if `art/plate-frame.png` exists, else
a drawn double rule with corner ornaments). The credit on every layout: `charted with Asterism, lucidwinds.com` and the HYG
line from 3.2 in 18 px at 2048 wide.

**SHARE.** Section 3.11. Opening a link with `#c=` draws that constellation into the live sky at the link's `d` time and place,
types its myth, and offers "Save to my almanac".

**AUDIO.** Web Audio, synthesised, behind the first pointerdown: air tone (filtered noise, gain 0.02), star chime (sine, pitch
by magnitude, bright is deeper: mag -1 → 330 Hz, mag 5 → 880 Hz, 400 ms decay), pen scratch on a line (short noise burst
through a 2 kHz bandpass), the myth swell (a low triad rising over 1.5 s at completion). Mute in settings.

**INPUT.** Pointer events, `touch-action: none` on the canvas. One finger drag pans (view altitude and azimuth), a tap without
slop picks (3.5), two fingers pinch the field of view. A drag never picks; the slop is 10 px.

**TEST.** Deepwell's harness; assertion floor 60; `sim.js` exits 3 if the count ever drops below it.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts: change the number or the code it guards, see red, put it back, see green,
paste both lines into the ledger.

### P0. The astronomy, headless, with known answers (about 1.5 hours)

1. Scaffold (layers, CONFIG, DATA loader, `sim.js`, `sw.js`, manifest, icons, `tools/check.js`, `test/boot.mjs`).
2. ASTRO as in section 4. `sim.js --test` asserts, in this order:
   - `gmstHours(jd of 2000-01-01 00:00 UT)` is **6.6645** within 0.001 (published value 6h 39m 52s).
   - `gmstHours(2451545.0)` is **18.6974** within 0.001 (the published J2000.0 constant).
   - Transit identity: for Sirius (RA 6.7525 h, Dec -16.716) at latitude 40, at the minute when LST equals its RA, altitude is
     `90 - |40 - (-16.716)|` = **33.28** within 0.05 and azimuth is 180 within 0.5.
   - Polaris (RA 2.5297, Dec 89.264) from five random northern places and times has altitude within 1.0 of the latitude.
   - Vega (RA 18.6156, Dec 38.784) from 40 N, 83 W at 2026-07-15 04:00 UT (midnight in Ohio): altitude **82.78**, azimuth
     **96.75**, LST **18.002** h, each within 0.05. (Fable computed these with the same standard formulas on 2026-09-05; the two
     published constants above are the independent anchors, the transit identity is geometry, and this one pins the sign
     conventions: east positive longitude, azimuth from north through east.)
   - The catalogue loads 1,792 stars; Vega's row has mag 0.03 and hip 91262; every `con` code has an English name; every star
     with mag 5.0 or brighter has `hip > 0` or is excluded from picking.
   - `project` then `unproject` round trips 200 random points inside the visible cap within 0.01 degrees; a point 100 degrees
     from the view centre is flagged behind.
   - `wellPlacedMonth(5.5, -83)` (Orion) is January or February; `wellPlacedMonth(18.6, -83)` (Vega) is July or August;
     `wellPlacedMonth(16.5, -83)` (Scorpius) is June or July.
   - `moon` phase at 2000-01-06 18:14 UT is within 0.02 of 0 and at 2000-01-21 04:40 UT within 0.03 of 0.5.
   - Same seed, same myth text (once MYTH exists; add then).
3. `test/boot.mjs`: page loads over the static server, `ready` posted, the catalogue fetched with a `?v=`, and the number of
   stars the renderer drew equals the number ASTRO says are above the horizon at the fallback place and the frozen test time
   (`?t=2026-07-15T04:00:00Z` freezes the clock in TEST mode; a real boot uses the device clock).
4. Watch them fail: flip the sign of the longitude term and the Vega line goes red; return 0 from `altAz` and the boot count
   goes red.

Ends with: no shot yet, only `sim.js --sky=39.96,-83,2026-07-15T04:00:00Z` pasted into the ledger: twenty stars with alt and
az that a human can check against any planetarium app in the morning.

### P1. The sky and the pen (about 2.5 hours)

1. SKY: stars by magnitude and colour, the glint, drag to pan, pinch to zoom, the ground, the palette by sun altitude, the
   place and time chip. **Stop and feel test: shoot `docs/shots/p1-sky.png` at 375x667 from Columbus at the frozen time.** Open
   it. Vega should be almost overhead, the Summer Triangle obvious, the Milky Way not yet drawn. If it reads as random dots, the
   magnitude to size curve is wrong; fix it before the pen.
2. DRAW: pick within 28 px with the label, connect, branch, close, undo by tapping the last star, chime and scratch, the line
   ease and waver. DONE opens the name sheet: a text field, the dice, SAVE.
3. ALMANAC save of the constellation (no myth yet), the list screen with chart thumbnails.
4. `test/draw.mjs` (browser, real pointers at 375x667, frozen time and place): ASTRO gives the screen positions of Vega, Deneb
   and Altair at the default view; three real taps produce a constellation of 3 stars and 2 edges; a fourth tap on Altair again
   undoes one; a real drag of 80 px changes the view azimuth and the star positions move the same direction; DONE, a typed name
   through the real input, SAVE, and the save holds one entry whose `s` is `[91262, 102098, 97649]` in some order.
5. `test/layout.mjs`: every button on every screen 48 px rendered, `elementFromPoint` at its centre; the bottom left 120x120
   of the sky screen has no Asterism element (the music pill's seat).

Ends with: `p1-sky.png`, `p1-draw.png` (three stars joined, a label showing), `p1-name.png`.

### P2. The myth, the almanac, the poster, the link (about 2.5 hours)

1. MYTH: features, archetype, the grammar and the corpus (section 4 counts), the typewriter, re-roll with three kept, the dice
   names. The myth sheet on parchment (CSS, no image) under the name.
2. ALMANAC spread: chart, name, myth, date and place, "well placed in <month> evenings", SHOW ON SKY, POSTER, SHARE, DELETE with
   a confirm.
3. POSTER: Chart and Minimal, export through the Attic pattern.
4. SHARE: the `#c=` link, import on boot, "Save to my almanac".
5. `test/myth.mjs` (node, through `sim.js`): every fragment in every list is reachable across 5,000 seeds; no list's single
   fragment appears in more than 60 percent of outputs for its slot; 5,000 seeds over one fixed constellation give at least 4,000
   distinct myths; every myth for a constellation whose brightest star has a proper name contains that name; every myth is 60
   to 140 words; no myth or name contains a dash, an exclamation point, or the words always, never, forever; same seed same
   text. Watch it fail by adding a dash to one fragment.
6. `test/almanac.mjs` (browser): from a saved entry, SHARE produces a link; a fresh browser context opening that link draws
   the same 3 stars and 2 edges and shows the same name; POSTER Chart produces a PNG blob of 2048x2560 (read back in page as an
   Image) whose bottom 120 rows are not uniform (the credit and footer were drawn).

Ends with: `p2-myth.png` (mid typewriter), `p2-almanac.png`, `p2-poster-chart.png` (the exported poster itself, scaled down to
512 wide for the repo), `p2-share.png`.

### P3. Birth Sky, the wanderers, the plate (about 2 hours; where a night may stop)

1. Birth Sky: date input, place sheet (city list with search, lat and lon, Use my location with the timeout), GO, the same
   pipeline; the almanac entry records `d` and `p`; the poster footer says the date and place.
2. The moon disc and phase, the Milky Way band, twinkle, reduced motion, the time scrubber on Tonight (sweep the night by
   dragging the chip).
3. Prompt of the Night: 30 prompts in DATA, `dailySeedFor` picks one, shown as a card on the sky screen once a day, dismissable.
4. Plate poster with the drawn ornament (or the delivered frame if present).
5. `tools/shots.mjs` at 412x915, 375x667, 320x568 for the sky, the draw, the myth and the almanac. Open all twelve.
6. `tools/thumb.mjs` to `docs/thumb.png` under 150 KB, `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (portrait, one hand, 48 px rendered at 375 wide)

- **Sky (home).** Full bleed canvas. Top left: the place and time chip (48 px tall, "Columbus, Ohio, tonight 11:42 pm"), tap
  opens the place and time sheet. Top right: menu (48 px): Almanac, Birth Sky, Prompt of the night, Settings, About. Bottom
  right: DRAW (56 px round, becomes DONE once a star is picked); UNDO (48 px) appears to its left while drawing. Bottom left
  empty. The first ever boot shows three lines over the sky: "This is your sky, right now." "Tap a star, then another." "Name
  what you made and the sky will tell you its story." and a GOT IT.
- **Name sheet.** Slides up over the sky: the name field (system keyboard), the dice (48 px), SAVE (56 px). After SAVE the
  parchment grows under it and the myth types. ANOTHER (48 px, up to three) and KEEP (56 px).
- **Almanac.** A list of spreads, each 88 px tall: chart thumbnail, name in small caps, date and place, the well placed month.
  Tap opens the spread: the myth, SHOW ON SKY, POSTER, SHARE, DELETE.
- **Poster.** Three layout cards (Plate says Soon until P3 lands) and EXPORT (56 px).
- **Place and time.** Tonight: a scrubber for the hour. Birth Sky: the date, the place (search over the city list, lat and lon
  fields, Use my location), GO.
- **Settings.** Sound, Twinkle, Motion, Export almanac, Import almanac. **About.** The positioning line, the studio line
  ("Sky Wolf Studio"), the HYG credit from 3.2.

Every framed page posts `ready`; there is one page.

---

## 7. ART (what Stephen can make this month; the app never waits on it)

Four sheets, paste ready prompts in `plans/asterism/ART-PACK-ASTERISM.md` (Fable puts a copy in 012Assets as
`Asterism — Art Pack`). Only the plate frame changes what a player sees at export; the rest are quiet upgrades.

| File Stephen delivers | Used for | Delivered | In game |
|---|---|---|---|
| `plate-frame.png` | the Plate poster border, empty centre | 4:5 | `art/plate-frame.png` 1200x1500 (host resizes over 1600), drawn at 2048x2560 |
| `parchment.png` | the myth sheet and the almanac spread, tiled at 20 percent | 1:1 | `art/parchment.jpg` 1024x1024 q75 |
| `hills.png` | the ground silhouette strip, keyed from white | wide | `art/hills.png` 1600x400 with alpha, made by Fable from the drop |
| `icon-mark.png` | PWA icon and favicon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

`ART_ASSETS.md` in the game folder lists the four paths the code reads (each behind an `onerror` that leaves the drawn
version alone).

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit; the night makes every line true first)

```
{nm:"Asterism", ds:"The real night sky over your head, right now. Join the stars into a shape of your own, name it, and read the myth the sky writes for it.", cat:"creative", url:"/satellites/asterism/?v=<stamp>", ic:"✨", thumb:"/portal-assets/thumbs/asterism.png", beta:true, fresh:true}
```

Must be true first: `docs/thumb.png` under 150 KB; the live URL answers with the stamp; `tools/check.js` prints ALL GATES
PASSED; `test/draw.mjs` passed with real pointers; the About sheet carries the HYG credit; the shots were opened.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9 applies (probes that cannot fail, `el.click()`, `canvas.width =`,
  two tabs, bounded loops, `pointercancel`, headless taps, contention, `?v=` on imports, born hidden classes, seeing art,
  disk).
- A sign error in the hour angle puts the whole sky mirrored east to west and every star still looks plausible. The Vega
  azimuth assertion (96.75, east of south) exists for this.
- `Date` in a browser is local; every ASTRO call takes UTC milliseconds. Build the JD from `Date.UTC` or `getTime()`, never
  from `getHours()`.
- `atan2` argument order. The azimuth formula in section 4 is written with `y` first.
- Degrees and radians: keep ASTRO in degrees at its edges and radians only inside a function, and assert Polaris every time
  you touch it.
- The typewriter and the twinkle are both timers; a re-render storm comes from either calling the other. The star layer is
  redrawn on view or time change only; the typewriter touches DOM text only.
- The design says stories are "a gift from the app, not homework". A myth that names the wrong star, or names "the brightest
  star" without its name when it has one, breaks the gift. The gate asserts the name.
- A generated name like "The Door Ajar" is the design's taste. "Space Dog" typed by a nine year old is the player's. The name
  field never rejects, never title cases, never trims to fit; the poster wraps.
- Nothing personal in a share link but what the player put there. The link carries the place at city precision (two decimals)
  and never the device's raw GPS reading.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's four open questions take these answers tonight:

1. **Name: ASTERISM.** Stephen's folder and title. Skywright, Starlore and The Almanac stay in the morning report as his call.
2. **Ghosted official 88: off, and not built.** Section 3.4.
3. **Font: the system stack.** Section 3.8. Stephen decides with a poster in hand.
4. **The six anchor myths: Stephen and Penny's, later.** Section 3.12. The corpus is yours tonight.

Yours without asking: the colours inside the palette, the exact size curve, the grammar's structure inside the counts, the city
list, the 30 prompts, the drawn ornament.

Stephen's, never guessed: price, store, any name change, the licence question in 3.2 (whether the separate data file satisfies
share alike, or whether he wants a lawyer's read before a paid store), the poster print on demand link, anything with money.

---

## 11. STEPHEN ONLY

The six anchor myths with Penny (any time; they drop into `data/anchors.json` and the grammar prefers them). The licence read
(3.2) before Asterism goes on a paid store. The four art sheets. The phone test after listing: draw the Summer Triangle from the
porch, name it, read the myth, export a poster, open the share link on Jessie's phone.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1.5 h, P1 about 2.5 h, P2 about 2.5 h, P3 about 2 h: about 8.5 hours to the end of P3, so a
full night and a bit. Expect 4,500 to 5,500 lines plus the corpus. **Where a single night stops well:** the end of P2 step 4 is
a complete product (a real sky, your constellations, a myth, an almanac, a poster, a link); Birth Sky, the moon and the plate are
gifts on top. If the clock says P2 cannot finish, finish P2 steps 1 and 2 (the myth and the almanac) and the myth gate, and leave
the poster and the link for the next session; a sky with a myth and no poster is honest, a poster with no myth is a toy.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, the gate that fails (2026-09-05)

```
$ node satellites/asterism/tools/check.js
astro           FAIL  0s

================================================================

--- astro (wanted: ASTERISM TEST OK) ---

Error: Cannot find module '/workspaces/lucid-winds/satellites/asterism/sim.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)

1 GATE FAILED
```


---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `boot, draw,
almanac, layout`. Unchanged otherwise: never wait on a human; three honest attempts then BLOCKED, never a weakened gate; gates
one at a time, browser gates alone twice on a flake; commit and push after every green subsystem; finish the subsystem in hand
when context runs long and write SESSION STATE with file, function and step; shoot and look at night; the design is not edited,
CONFIG and DECISIONS are; nothing leaves the fence; disk.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the `--sky` listing**
pasted, so the morning reader can hold a phone with a planetarium app next to it.
