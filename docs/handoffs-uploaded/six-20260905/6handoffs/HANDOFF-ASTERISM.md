# HANDOFF — ASTERISM (Constellation Drawer)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, portrait.
**Deploy target:** lucidwinds.com/satellites/asterism
**Session goal:** Real star field for user's location/time, draw-and-name constellations, seeded myth generator, almanac collection, poster PNG export, any-date "birth sky" mode.

*(An "asterism" is the real astronomical term for an unofficial star pattern — the Big Dipper is technically an asterism, not a constellation. The name IS the pitch.)*

---

## 1. Concept

The actual night sky — real stars, correctly placed for your location, right now — rendered as a quiet, scrollable dome. Tap stars to connect them into your own constellation. Name it. The app studies the shape you drew and writes its myth: a short, strange, beautiful origin story that references what you actually made — its brightest star by real name, its seven points, whether it closes into a creature or trails off like a journey.

Your constellations live in a personal **Almanac** and stay pinned to the real sky — open the app in October and your summer constellation has wheeled toward the horizon, just like Orion does.

**Tone:** planetarium hush. Ancient-feeling, not sci-fi. The app treats a 9-year-old's "Space Dog" with the same gravity as Ptolemy treated Lyra.

## 2. Market research summary (Sep 2026)

- **neal.fun Constellation Draw:** proves the core verb is instantly delightful (connect two stars, share) — but it's a toy: no real sky, no persistence, no meaning layer.
- **Star—Line** (itch, Unity): naming + story prompts + journal, but randomly generated stars each night — no connection to the real sky, and stories are player homework, not a gift from the app.
- **Draw Constellations** (iOS, 2026): real astronomical data, but for memorizing the official 88 — education, not creation.
- Map-maker tools (rollforfantasy etc.): fantasy-map utilities, fake stars, desktop-fiddly.
- **Adjacent market proof:** custom star-map posters ("the sky the night you were born") are an established Etsy/print-on-demand category at $30–60 per print. Sustained demand for exactly the artifact we can export free.

**Nobody combines: real sky + your own constellations + generated myth + keepsake export.** That whole quadrant is empty.

**Positioning line:** "The sky is still hiring gods."

## 3. Core loop

1. Open → your sky, tonight, from your spot on Earth. Stars twinkle gently. Official constellations optionally ghosted at 5% opacity for orientation.
2. Pan the dome. Tap a star → it chimes and glows. Tap the next → a line draws itself with a soft pen-on-paper sound. Tap an existing star in your chain to branch or close a loop. Undo = tap last star again.
3. Done → name it (or tap the dice for a generated name) → **the myth writes itself**, letter by letter on parchment, referencing your actual shape and stars.
4. Saved to the Almanac. From there: view on sky, read myth, re-roll myth (3 alternates), **export poster**.
5. **Birth Sky mode:** enter any date + place → the sky exactly as it was that night → draw a constellation into it → poster. (Gift engine: anniversaries, births, memorials.)

## 4. The myth generator (the soul — fully offline)

No API calls; the generator is a seeded grammar fed by **shape analysis** of the drawing. That's the trick that makes it feel like the app *saw* your constellation:

### Shape features extracted
- Star count, chain vs branch vs closed loop, aspect ratio (long/tall/compact), symmetry score, largest angle (a "head"? a "bend"?), brightest star (real name if it has one — Vega, Altair, Deneb…), faintest star, sky region (near Milky Way band? near horizon at creation time?), season of creation.

### Myth assembly
- Archetype chosen from features: closed loop → creature/vessel; long chain → journey/river/serpent; branched → tree/antlered thing/family; compact cluster → seed/eye/ember.
- Grammar (Tracery-style, hand-written, ~400 fragment corpus) fills a 3-beat structure: **origin** ("Before the rivers chose their beds…"), **deed/fall** (why it was placed in the sky), **omen** (what it means when you see it — always gentle: good harvests, found keys, brave first days at school).
- Real-star hooks: "Its heart is the star the old astronomers called **Vega**" — free depth from the catalog's proper names. Kids learn real star names as a side effect (quiet educational-catalog fit).
- Seeded by constellation ID → myth is stable/re-showable; "re-roll" advances the seed, keep your favorite of 3.
- Name generator (dice): same grammar, offers "The Stitched Hare," "Grandmother Comet," "The Door Ajar."

### Voice anchor
Write 6 complete myths by hand first (Stephen + Penny session — she'll be great at omens), then expand the fragment corpus in their voice (see toolchain §9).

## 5. The sky (real astronomy, compact)

- **Star catalog:** brightest ~1,800 stars from the HYG database (public domain compilation of Hipparcos/Yale/Gliese) — RA, Dec, magnitude, color index, proper name where it exists (~300 named). Packed as base64 typed-array in-file (~25–40KB). Mag limit ≈ 5.0 — matches what a human actually sees in a decent sky (on-theme honesty).
- **Projection:** RA/Dec → alt/az via local sidereal time (standard formulas, well-documented; Claude Code implements + verifies against a known ephemeris case: "Vega near zenith, 40°N, July midnight"), then stereographic projection to screen. Pan = rotate view; pinch = zoom FOV 30°–120°.
- **Time & place:** device clock + coarse geolocation (or manual city pick — full offline path). Time scrubber to sweep the night; date picker for Birth Sky.
- Below-horizon stars dimmed behind a soft ground silhouette (rolling hills — a nod to Ohio, and a Venus-PA treeline skin later).
- Milky Way as a subtle pre-baked luminance band (procedural noise along galactic plane), moon as a correctly-phased disc (standard low-precision lunar formulas — phase + rough position is plenty).
- Sky palette shifts with real time: deep blue dusk → true dark → pre-dawn indigo.

## 6. Almanac & sharing

- Almanac = bound-journal UI: one spread per constellation — chart thumbnail, name, myth on parchment, created date/place, "next well-placed: October evenings" (computed from RA — teaches how the sky wheels without saying so).
- **Poster export** (canvas render → PNG, print-res 2048×2560): three layouts — *Chart* (constellation + myth beneath, star-map aesthetic), *Plate* (vintage celestial-atlas engraving style, ornament border), *Minimal* (black, stars, one line of myth). Date/place/name footer, tiny "charted with Asterism · lucidwinds.com" credit = organic marketing on every fridge and gift.
- Share-by-link, zero backend (DOOHICKEY pattern): star IDs + edges + name + myth seed pack into a URL hash — recipient sees the constellation in the live sky and can watch the myth type out.

## 7. Visual & audio design

- Stars: size/brightness by magnitude, tint by color index (blue-white → amber-red — real, and gorgeous), 2–3px cross-glint on the brightest. Twinkle = subtle per-star alpha noise, disableable.
- Lines: hand-drawn quality — slight waver, drawn with ease-out, chalk-gold (#E8C97A) on indigo.
- Typography is half this app: a serif with small-caps for names, generous letter-spacing, myth types on at ~30 chars/sec with a soft scratch. (Font: system serif stack tuned hard, or subset one embedded serif if the look demands it — decide at build.)
- Audio: near-silence + air tone; each star tap = soft chime pitched by magnitude (bright = deeper); connection = pen scratch; myth completion = low resonant swell. All Web Audio, synthesized.

## 8. Modes & extras

- **Tonight** (default): live sky, draw freely.
- **Birth Sky:** any date/place → that exact sky. The gift engine and the poster driver.
- **Prompt of the Night** (retention, date-seeded, no backend): "Draw something with exactly 6 stars" / "Draw what you lost this year." Shareable like the Daily Doohickey.
- **Penny mode consideration:** none needed — the whole app is already 9-year-old-safe. Instead: a "family almanac" toggle so multiple people's constellations coexist with author initials.

## 9. AI toolchain plan

- **Claude Code:** full build. Astronomy math module first with verification tests (known star positions at known times) before any UI.
- **ChatGPT Pro:** myth corpus expansion — feed it the 6 hand-written anchor myths + grammar slot spec, have it draft 300 fragments in-voice; you keep ~60%. Also poster-layout copy variants.
- **Gemini Pro:** visual dev for the *Plate* poster style (generate vintage celestial-atlas border/ornament references to encode as canvas drawing routines); sanity-check astronomy formulas independently (cheap second opinion on sidereal-time math).
- **Grok basic:** name checks (ASTERISM collisions), social copy, Prompt-of-the-Night ideas list (ask for 100, keep 30).
- **Meshy premium:** minimal fit here (2D app). Optional: 3D armillary-sphere render for icon/store art. Better spend: save Meshy budget for DOOHICKEY/marble-game assets. Note for the roadmap: a WebXR planetarium version of ASTERISM (draw constellations by pointing in VR) is a strong Meta Horizon beachhead candidate — Meshy does the environment then.

## 10. Tech architecture (single file)

- Canvas 2D, DPR-aware. Star field renders on demand (pan/zoom/time change) to an offscreen layer; twinkle + UI composite at 60fps on top. Idle = near-zero battery.
- Catalog: base64 → Float32/Uint8 typed arrays at boot; spatial index by RA band for tap hit-testing.
- State: Almanac entries (star IDs, edges, name, myth seed, date, place) in localStorage; export/import string; URL-hash share decode.
- Geolocation optional; manual location fully supported (city list, ~200 entries embedded, or lat/lon input). Never blocks on network. PWA manifest + SW inline; 100% offline after first load.
- Perf: 1,800 stars is trivial; guard the myth typewriter + twinkle from re-render storms.

## 11. Build order

1. Astronomy core headless: catalog decode, sidereal time, RA/Dec→alt/az, stereographic projection + **verification tests against known sky states**. No pixels until Vega is where Vega should be.
2. Sky renderer: stars (mag/color), pan/zoom, ground, sky palette by clock. **Stop and feel-test: just looking at it should already be worth opening.**
3. Draw system: tap-connect, branch, close, undo, hit-testing, line rendering + sounds.
4. Shape analysis + myth grammar (seed corpus in-file) + typewriter reveal + naming.
5. Almanac save/browse + "next well-placed" computation.
6. Poster export ×3 layouts.
7. Birth Sky mode (date/place picker, same pipeline).
8. Share links, Prompt of the Night, moon + Milky Way, PWA wrapper, polish.

## 12. Stretch / later

- Planets as wanderers (low-precision ephemerides — "the red wanderer crosses your constellation tonight" myth events).
- Meteor-shower dates: shooting stars streak the live sky during real showers (calendar table, no network).
- Physical poster fulfillment link-out (print-on-demand) — the Etsy-category money, if ever wanted.
- Family almanac multi-author toggle.
- WebXR planetarium successor (Horizon list).
- The Skywright: optional lore link to WARDIAN's Jarwright — same wandering family, one charts jars, one charts skies. A quiet Lucid Winds shared universe across satellites.

## 13. Open questions for Stephen

- Name: ASTERISM (current — the real term for an unofficial constellation; the name is the concept). Alternatives: SKYWRIGHT (ties the shared-universe knot tighter), STARLORE, THE ALMANAC.
- Ghost the official 88 constellations at low opacity by default, or off by default? (Recommend: off, discoverable in settings — the blank sky is the invitation.)
- Embed a real serif font subset (~30–80KB) or tune the system stack? (Recommend: try system stack first; the poster export is what decides it.)
- Hand-write the 6 anchor myths with Penny before the build session, so the corpus voice is locked?
