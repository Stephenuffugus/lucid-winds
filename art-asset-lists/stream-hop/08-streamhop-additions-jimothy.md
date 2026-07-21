# Stream Hop → JIMOTHY — ADDITIONAL assets (build-out delta)

> This is the **separate doc** Stephen asked for: assets the game NOW needs that are **not** in
> sheets 00–07. Everything below was added while building the game out (power-ups, zones, Rush Hour,
> and the intro cinematic). Keep your reskin style (the Jimothy / Seattle-raccoon direction you're
> applying to the Lantern-Ink prompts); these just extend it. Same rules: magenta #FF00FF knockout,
> under 150KB per cut cell, no text/logos/watermarks, path-version files (?v=LW_VERSION).

Asset folders (new): `satellites/stream-hop/assets/powers/`, `.../intro/`.
Everything has a live procedural/canvas fallback, so the game already runs without any of this — the
art is a pure visual upgrade that drops in over the placeholders.

---

## 1 · POWER-UPS  (new — nothing in the existing sheets covers these)  🎮 GAMEPLAY

Three power-ups drop on safe rows and add a strategy layer. Each needs **one pickup token** (seen on
the board) and **one tiny HUD glyph** (seen top-left with a countdown ring). Perfect for a Seattle
raccoon, so they fit the reskin naturally.

Make **one sprite sheet**, `streamhop_powers.png`, grid **3 cols × 2 rows** (6 cells, 512×512 each,
master 1536×1024), magenta knockout, soft baked contact shadow under each token.

- Row 1 = the **board pickups** (a chunky, glowing, collectible token, ~70% of cell, floating/bobbing):
  1. `power_coffee` — a Seattle to-go **coffee cup** (a raccoon's fuel). Warm #c8894b sleeve, cream lid,
     a curl of steam, a soft gold glow halo. This is the **Dash** (speed + dodge the chase).
  2. `power_umbrella` — a small **umbrella**, half-open, moon-blue #5b9bd5 canopy with a cream handle,
     a couple of rain-bead glints, soft blue glow. This is the **Shield** (survive one hit).
  3. `power_snacks` — a **trash/snack** bundle a raccoon would love: a tipped takeout box or a fry
     packet with a nugget or two spilling, warm greens/#7ab356 + cream, soft green glow. This is the
     **Magnet** (coins fly in, double value).
- Row 2 = the **HUD glyphs** (same three, but simplified to read at ~30px in a colored disc — bold,
  iconic, high-contrast, no fine detail):
  4. `hud_coffee` — a simple coffee-cup pictogram.
  5. `hud_umbrella` — a simple umbrella pictogram.
  6. `hud_snacks` — a simple trash/snack pictogram.

The active-power **auras** (dash speed-lines/steam, shield bubble, magnet ring) stay procedural — no art
needed — but if you want them as art later, that would live on the FX sheet (07).

---

## 1b · JIMOTHY HERO — the character sprite (NEW — the game now DESCENDS toward the camera) ⭐ HIGH VALUE

The camera has been **reversed**: instead of hopping *up and away* from the camera, Jimothy now comes
**down from the top of the screen toward you**, so you see his FACE the whole run. This is built for your
animated hero — the moment his frames land they drop straight in facing forward (no code needed).

- Files: `assets/hero/jimothy-1.png` … up to `jimothy-6.png` (as many as you make, **1 is fine to start**).
- **Facing the camera / forward** (front 3/4 is perfect), magenta #FF00FF knockout, soft baked contact
  shadow optional (the game draws its own ground shadow). Square-ish cell, hero ~70% of it.
- **How they animate:** whatever frames load (contiguously from 1) become the **hop cycle** — the game
  picks a frame by hop phase (crouch → launch → peak → land) and shows **frame 1 while idle**. So:
  - **1 frame** → a single face-forward Jimothy that still squashes/stretches and arcs on every hop.
  - **2–4 frames** → a real hop animation (e.g. 1 crouch, 2 mid-air stretched, 3 landing).
  - Up to **6** supported. The sprite inherits the game's juicy squash + hop arc automatically.
- He is **never flipped** on left/right hops (you asked to always see his face). If you later want a
  left/right lean, tell me and I'll add a subtle tilt.
- Until any frame exists the game draws the placeholder frog, so nothing breaks — pure drop-in upgrade.

## 1c · SPLASH SCREEN (optional, drop-in) 🖼️

You mentioned a splash screen (maybe Midjourney-animated). Give me the file and I'll wire it:
- **Static:** `assets/hero/splash.jpg` (or `.png`), portrait 1080×1920 — shows on the title screen behind
  the wordmark, OR as a first-frame before the intro cinematic.
- **Animated:** if you make it a short loop, either an animated `.gif`/`.webp` (`assets/hero/splash.webp`)
  OR a numbered sequence `assets/hero/splash-1..N.png` and I'll play it like the hero hop-cycle. Tell me
  the frame count + fps and I'll match it.

## 2 · INTRO CINEMATIC FRAMES  (new — the "fun little intro")  🎬 CINEMATIC

The intro plays 4 full-screen frames on first launch (Ken Burns pan + animated rain overlay + a fading
caption + Skip), then hands off to the title. It already runs with a stylized gradient fallback; your
Midjourney frames drop straight in.

- Files: `assets/intro/intro-1.jpg` … `intro-4.jpg`.
- **Portrait 9:16, 1080×1920** (they get a slow zoom, so a little headroom is good). JPG, under ~220KB
  each. **Leave the bottom ~22% darker / less busy** — the caption sits there.
- These are SCENES, not knockouts — full-bleed painted frames, edges can fade to near-black so the
  caption + rain read on top.

The 4 beats (caption baked into the game, not the art — art is scenery only):
1. **intro-1** — *"Meet Jimothy."* A hero portrait of Jimothy the deformed Seattle raccoon, chonky and
   lovable, in a rainy neon-lit Seattle alley at night, Space Needle glowing in the misty distance.
2. **intro-2** — *the dumpster-feast legend.* Jimothy's eyes gleam at a glorious overflowing dumpster /
   food-truck row across the way, steam and golden light, the "best trash in the city."
3. **intro-3** — *the obstacle.* A wide shot of the rainy city between him and the feast: a busy wet
   street of headlights and buses, the dark water of Puget Sound with logs and a ferry beyond.
4. **intro-4** — *the call to hop.* Jimothy at the curb's edge, determined, one paw raised, ready to
   cross, warm rim-light, hopeful.

(If you'd rather 3 or 5 beats, just tell me the count and I'll match the `INTRO[]` array — it's a
one-line-per-beat list in the game.)

---

## 3 · ZONES  (the run crosses named neighborhoods)  🗺️ OPTIONAL BACKDROPS

The run now travels through 5 neighborhoods, each shifting the palette + hazard mix with a "NOW
ENTERING ___" banner. **This needs no new art** — it recolors procedurally. But if you want each zone
visually distinct, they map naturally onto the existing **seasonal** slots (sheets 04 lanes + 05
backgrounds): since the Jimothy reskin isn't seasonal anyway, **repurpose the 4 seasonal ambient
backgrounds + seasonal lane bands as neighborhoods** instead. The 5 zones (rename freely in `ZONES[]`):

1. **The Waterfront** — Puget Sound docks, more water, ferries, gulls.
2. **Pike Market** — the market: crates, produce, neon, busiest traffic.
3. **Fremont** — quirky: the troll under the bridge, murals, mixed lanes.
4. **Capitol Hill** — nightlife: dark, neon, fastest express traffic.
5. **Interbay** — rail yards / industrial: grey, trains, the hard finish.

If you want distinct art, that's **5 lane-band trios (safe/road/water)** + **5 ambient backdrops** in
your reskin style. Otherwise the current palette-shift + banner already does the job.

---

## 4 · RUSH HOUR UI  (new 60-second mode)  🖥️ small UI add

Add to the UI sheet (06) whenever convenient:
- `icon_rush` — a stopwatch / clock pictogram (the Rush Hour mode glyph on the title), in your style.
- `plaque_clock` (optional) — a small HUD plaque for the big center countdown (turns urgent-red under
  10s). Currently drawn as plain text; a carved-plaque frame would match the score plaque.

---

## Summary of what to generate (delta only)
- **1 new sheet**: `streamhop_powers.png` (6 cells: 3 pickups + 3 HUD glyphs).
- **4 intro frames**: `intro-1..4.jpg` (portrait scenes with Jimothy).
- **Optional**: repurpose the seasonal lanes/backgrounds as the 5 neighborhoods (no extra generation),
  OR 5 neighborhood lane-trios + 5 backdrops if you want them distinct.
- **Optional**: `icon_rush` (+ `plaque_clock`) on the existing UI sheet.

Ping me the frame count / any renames and I'll wire it all the moment the art lands.
