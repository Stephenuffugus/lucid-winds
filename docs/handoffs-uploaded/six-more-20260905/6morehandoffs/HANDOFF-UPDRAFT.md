# HANDOFF — UPDRAFT (Kite)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, portrait (the sky is tall).
**Deploy target:** lucidwinds.com/satellites/updraft
**Session goal:** One-thumb tension flying with catenary string + verlet tail, launch-to-landing loop, 3 wind moods + real-wind option, trick recognition, one field.

*(Also: a kite app from a studio called **Lucid Winds** is practically contractual.)*

---

## 1. Concept
A field, a sky, a kite, your thumb on the string. Press to reel in (tension up — kite climbs, gets responsive, strains), release to let line out (kite drifts, relaxes, wanders downwind). Slide left/right to lean it. That's the whole control surface — and it's enough for loops, dives, figure-eights, stall-and-catch saves, and long lazy afternoons. The line bows in a real catenary. The tail streams and cracks like a ribbon. On gusty days it fights you.

Optional: fly in **your real wind** — the app reads today's local conditions, and the sky outside your window is the sky in your hand.

**Tone:** Peanuts field, first-day-of-spring. The danger is a tree, and the tree is negotiable.

## 2. Market research summary (Sep 2026)
- Mobile "kite games" = a dense cluster of **kite-fighting** titles (Patang/pipa/Basant tradition: cut opponents' lines, festivals, tournaments, unlock loadouts) — a rich genre serving a specific cultural competition, mostly ad-stacked. Plus kitesurfing trainers (niche technical).
- **Nobody is making the peaceful one:** single kite, string feel, tricks as self-expression, weather as character. The entire Western beach/park kite memory is unserved.
- Physics on-ramp is proven: the fighting games already sell "tension + angle + wind reading" as the skill — we keep that skill core and remove the combat.
- Real-weather integration (Open-Meteo, free/keyless, WARDIAN pattern) exists in no kite title found.

**Positioning line:** "Go fly a kite. Right now. In today's wind."

## 3. Core interaction
- **Hold (anywhere):** reel in. Tension rises: kite gains airspeed + lift + control authority; line straightens; too much in a gust = the *strain shudder* (haptic + line whine) warning before a snap (snap = kite flutters away gently over the trees; a new one is handed to you by an unseen friend — loss is soft).
- **Release:** pay out line. Kite falls back, drifts downwind, relaxes; altitude gained on tension converts to distance.
- **Slide left/right while holding:** lean/steer. Tension + lean = carve; the verb pair yields dives, loops, and figure-eights exactly like a real single-line kite worked with pumps and runs.
- **Launch:** kite starts on the grass downfield; build a rhythm of tug-release-tug (the real technique) to get it up through the low turbulent layer into clean air. Teaching this 15-second skill IS the tutorial, and nailing the launch is the first dopamine.
- **Landing:** guide it down gently to the grass = "clean landing" flourish; or park it on the wind ("high parking") and just watch.

## 4. Flight & string model
- Kite = point mass + orientation; lift/drag vs apparent wind (real wind + kite velocity + line constraint); pendulum stability from tail drag; stall when airspeed drops (nose flutter → falls — recoverable with a well-timed reel: the stall-save is the signature skill move).
- **Line:** distance constraint for physics + rendered catenary sag from tension (cheap closed-form curve) — the bow of the line is half the visual poetry. Line length = paid-out amount (0–120m); longer line = laggier control, higher sky.
- **Tail:** 12–20 segment verlet rope with air drag, streaming in apparent wind; cracks on whip turns. The tail is the juice organ — it makes every maneuver legible and beautiful.
- **Wind field:** base vector + gust system (seeded Perlin-ish over time) + altitude profile (turbulent near ground, cleaner aloft — makes launching meaningfully different from cruising) + thermal columns over the sunny patch (marked by drifting dandelion seeds — visible wind, learnable field).
- Deterministic per seed (house law) for daily mode fairness.

## 5. Wind moods & real wind
- **Moods:** Gentle (learning, 6 mph), Fresh (the sweet spot, 12 mph + gusts), Blustery (18 mph, hold-on-tight, snap risk, biggest tricks).
- **Real Wind (optional):** Open-Meteo current wind speed/direction for your area (coarse geolocate or city pick; cached; graceful offline → moods). Sky/cloud state matches too. Calm real day = the app honestly says "barely a breath today — the Gentle field is open" (never lie about the wind; the honesty is the charm).
- Time-of-day sky palette from device clock (WARDIAN pattern): golden-hour flights at actual golden hour.

## 6. Tricks & structure
- Trick recognizer watches trajectory: Loop, Figure-8, Dive Bomb (dive + late save), Sky Write (sustained smooth arcs), Stall Save, High Park (steady 60s+). Named calligraphy-style stamps appear quietly; no score counter on the default screen.
- **Free Fly** (default): endless field, tricks logged to a flight journal (best altitude, longest flight, tricks caught).
- **Daily Wind:** seeded gust pattern, 3-minute flight, trick tally share link (house pattern).
- **Kites:** diamond (starter), delta (stable cruiser), box (chunky, gust-hardy), sled (floaty), dragon (long serpent tail, pure spectacle). Unlock by flight-hours + journal feats, not currency. Custom colors; Penny-pattern kite credited.
- **The Tree:** one big oak upwind of the launch spot. It wants your kite (Charlie Brown law). Rescue mini-interaction (careful tension wiggle) if snagged. It has a name. Players will screenshot it.

## 7. Presentation
- Look: painterly flat layers — grass field with parallax wildflowers, big cumulus sky, the oak. Kite fabric ripples (cheap vertex wobble by tension). Line as 1px catenary with sun glint.
- Audio (synthesized): wind bed tracking gust state (the *sound* tells you when to reel), line whine under tension, tail flutter/crack, fabric luff on stalls, distant meadow birds. Sound-only flying should be nearly possible.
- Haptics: gust bumps, strain shudder, trick stamps.

## 8. Toolchain
- **Claude Code:** build. Flight model + gesture feel first.
- **Gemini Pro:** painterly field/sky palette frames; kite pattern sheets.
- **ChatGPT Pro:** trick-recognizer threshold review (trajectory feature spec → detection rules), journal/flavor copy.
- **Grok basic:** name check (UPDRAFT), social copy ("go fly a kite" writes itself).
- **Meshy premium:** kite-over-field hero render for icon/card. (VR: kite flying with a real hand controller as the reel = lovely gentle Horizon candidate.)

## 9. Architecture & build order
- Canvas 2D, portrait, camera follows kite with field anchored at bottom; sim 120Hz fixed, render interpolated; Open-Meteo fetch optional/cached (WARDIAN code pattern reusable).
1. Flight model + hold/release/slide controls + line + hardcoded steady wind. **Feel-gate: dive-and-save must produce an audible player gasp. Tune until it does.**
2. Launch sequence + altitude wind profile + stall/save.
3. Tail verlet + audio bed + haptics (the juice pass, early — this toy IS its feel).
4. Gust system + moods + snap/soft-loss + the Tree.
5. Trick recognizer + journal + kite unlocks.
6. Real Wind + time-of-day sky + Daily Wind mode + share links + PWA wrapper.

## 10. Stretch
- Night flights (kite LED, stars — ASTERISM sky data wink).
- Two-thumb dual-line stunt kite mode (the expert ceiling).
- Beach field, winter field (snow + bare oak).
- Message-on-a-kite: write a line, it flies on the tail, share as image (WINDUP gift energy).

## 11. Open questions
- Name: UPDRAFT vs STRINGSONG vs GO FLY A KITE (cheeky, searchable phrase). 
- Snap risk on by default in Fresh mood, or Blustery-only? (Recommend Blustery-only; Fresh stays consequence-free.)
- Real Wind prompt placement: settings-discoverable like WARDIAN (recommend) or offered after first clean landing?
