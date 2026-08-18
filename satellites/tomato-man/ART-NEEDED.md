# TOMATO MAN — Art Manifest

> **You (Stephen) make these in Midjourney / ChatGPT / Gemini.** The game ships fully playable with procedural art, so every file here is **drop-in optional** — add them one at a time, nothing breaks.

## How art plugs into the build
1. Make an `art/` folder next to `tomato-man.html`.
2. Save each PNG at the path the game looks for. The loader lives in `tomato-man.html` as `ASSET_PATHS` (currently `art/hero/tomato_body.png`, `art/ui/logo.png`). Add a key there for any new sprite, then save the file at that path.
3. Reload. If the PNG loads, the game uses it; if it's missing or fails, it silently falls back to the procedural drawing. **Zero risk.**

## What the shipped game actually contains (make art to match)
- **5 worlds:** Morning Tide · Midday Blaze · Tide Pools · Dunes at Dusk · Eclipse (20 hand-built levels + endless "Shadow Run" + a Daily Challenge).
- **Hero cosmetics in the character builder** — produce bodies: tomato, strawberry, orange, lemon, lime, peach, cherry, bell pepper, eggplant, avocado, heirloom, pickle, golden, sunburn · hats: sun hat, ball cap, tiny sombrero, lettuce cap, lifeguard visor, umbrella hat, sun crown · dash trails: ember, cool, aloe, rainbow.
- **Mechanics that want art:** sweeping shade, drifting clouds, patrolling cart-shadows, hot sand, wilting awnings (Tide Pools), wind streaks (Dunes), popsicles & ice water, SPF, the **Angry Sun** boss + eclipse darkness (Eclipse), sunbeam currency.

The complete style guide + per-asset prompts follow. ⬇️

---

# TOMATO MAN — ART MANIFEST ("ART-NEEDED")

**Hero:** Tomato Man · **Platform:** single-file vanilla HTML/CSS/JS, mobile-first, top-down.

> **Read this first.** The game renders **everything procedurally as a fallback** (see `tomato-man.html`), so every asset below is **drop-in optional** — ship without any of it and the game still plays. Art exists to *replace* the procedural placeholders, one file at a time, with no code rewrite. That means two hard rules for the artist:
> 1. **Match the footprint, not just the vibe.** Each sprite slots into a shape the engine already draws (a circle, a rect awning, an umbrella ellipse, a cart). Honor the listed dimensions and anchor/pivot so the swept-shadow geometry still lines up.
> 2. **Silhouette over detail.** This is a tiny-on-screen mobile game where *reading the sweep* is the whole skill. Every prop must be identifiable at thumbnail size, in motion, on a glaring sand background.

---

## 0. How to use this document

- **Folders = filename prefixes.** `hero/`, `casters/`, `hazards/`, `pickups/`, `tiles/`, `ui/`, `fx/`. Keep the keys exactly as written so a future loader can map them automatically.
- **Every prompt below is the *subject* prompt.** Append the **Master Style Block (§1.6)** to the end of each one before generating. That single shared suffix is what guarantees one cohesive look across 150+ files and across three different generators (Midjourney / ChatGPT / Gemini).
- **Transparency:** anything that moves or sits *on top of* the world (hero, casters, props, pickups, UI, FX) must be a **transparent PNG**. Only full-screen backgrounds and seamless ground tiles are opaque.
- **Authoring resolution is 2–4× the in-game size** so sprites stay crisp on retina phones and when lightly scaled. Downscale on export; never upscale.
- **Generator tips for clean cutouts:** Midjourney doesn't reliably do transparency — generate the subject on a **flat chroma background** (`solid magenta #FF00FF background` or `solid chroma-green background`) then key it out, OR use ChatGPT/Gemini image which can emit transparent PNG directly ("transparent background, isolated sprite, no backdrop"). For Midjourney add `--style raw` and the relevant `--ar`; for icon sheets use `--ar 1:1`.

---

## 1. STYLE GUIDE — one cohesive look

### 1.1 The look in one sentence
**Bright, juicy, slightly painterly beach-cartoon** — think gouache-painted vinyl stickers: chunky rounded shapes, a thick warm navy outline, soft cel-shaded volume with a single warm sun, and a sun-bleached coastal palette turned up to maximum saturation. Friendly enough for a kid (the game exists because Penny named him), punchy enough to read as an action-platformer.

### 1.2 Master palette (locked — pulled from the live build)

| Role | Name | Hex |
|---|---|---|
| Outline / ink (everything) | Deep Navy | `#23314A` |
| Paper / UI base | Cream | `#FFF6E6` |
| Hero body | Tomato Red | `#E8332A` |
| Hero deep shadow | Tomato Core | `#B5231C` |
| Safe / exit / success | Aloe Green | `#4FB56A` |
| Currency / sun / highlight | Beam Yellow | `#FFD23F` |
| Sand (light → deep) | Beach | `#F4DCA6` → `#E6C074` |
| **Shade (the safe ground)** | Cool Shade Blue | `#465A82` → `#5A78A0` |
| Hot sand hazard | Scorch Orange | `#EB6E28` → `#C8461E` |
| SPF immunity | SPF Cyan | `#7FD0FF` |
| Umbrella / cabana cloth | Coral | `#FF8A5C` → `#E85D3C` |
| Wood (awning/cart) | Driftwood | `#C98B53` / `#7A5230` |

Per-world accents extend this palette (see §6). The **shade is always cool blue** and the **danger is always warm** — that warm/cool split is the game's core readability contract; never violate it.

### 1.3 Outline & shape language
- **Outline:** one consistent **deep-navy `#23314A`** line on all foreground objects. Weight ~**3–4% of the sprite's longest side** (thick, confident, slightly hand-painted — not a thin vector hairline). Outline color may darken toward black in the Eclipse world only.
- **Shapes:** rounded, chunky, blob-friendly. No sharp spikes except where meaningful (Angry Sun rays, broken rock). Big readable masses; tuck detail inside, never on the silhouette edge.
- **Corners:** generous radii everywhere — produce, props, UI all share the same "soft toy" rounding.

### 1.4 Lighting
- **Single warm key light from upper-frame**, matching the in-game sun. Warm highlight on top, cool shadow underneath, a thin rim of bounced sand-light at the bottom edge.
- **Cel-shaded, 2–3 tone bands** with a soft painterly transition (not hard flat, not airbrushed). One small specular hotspot on glossy produce.
- **Contact shadow:** every object carries a soft, semi-transparent **navy-blue ellipse** beneath it (`#23314A` at ~14% alpha) so it sits on the sand. (In-game the *real* shadow is computed; this baked one is just for grounding props that don't cast gameplay shade.)

### 1.5 Mobile readability rules (non-negotiable)
- Must read at **~32–64px on screen**. Test by squinting / shrinking to a thumbnail.
- **High contrast against hot sand** (`#F4DCA6`–`#E6C074`): avoid pale-yellow or beige objects with no outline — they vanish. The navy outline is what saves them.
- **One dominant color per object** so the player parses the board instantly: hero = red, safe shade = blue, danger = orange/red glow, currency = yellow, exit/safe = green.
- **No baked text** inside sprites (text is a separate UI/logo layer and won't localize otherwise).
- Keep internal detail low-frequency; busy textures strobe and shimmer when the camera scrolls.

### 1.6 ⭐ Master Style Block — paste at the END of every prompt below

```
STYLE: bright juicy slightly-painterly beach-cartoon, gouache-on-vinyl
sticker look, chunky rounded shapes, thick consistent deep-navy #23314A
outline, soft 2-3 tone cel shading with a single warm sun from top, small
specular highlight, saturated sun-bleached coastal palette, high-contrast
readable silhouette designed to be legible at small mobile size, clean
flat or softly-gradient background, no text, no watermark, centered single
subject, crisp edges. --style raw
```

**Master negative (append for generators that support it):**
```
--no text, letters, watermark, logo, busy background, photorealism, gritty
texture, harsh noise, drop-shadow clutter, 3d render bevel, gradient mesh
```

### 1.7 Orientation conventions (so art lines up with top-down gameplay)
- **HERO:** two deliverables — a **3/4 hero "builder" pose** (for the character-builder screen and menus) and a **top-down in-game sprite** (slightly-tilted top-down, head readable from above). Heads/hats are authored to fit the **builder pose**; the in-game sprite is a simplified top-down version.
- **CASTERS:** **soft top-down / high-3/4** view (you see the structure roughly from above, the way it sits in a top-down level). The art is the *physical object*; the engine draws the moving shadow separately.
- **PICKUPS / FX / UI:** flat front-facing icons.
- **TILES / BACKGROUNDS:** flat top-down, **seamlessly tileable** unless noted.

### 1.8 Standard export specs
- PNG-24 + alpha (sprites) / PNG-24 opaque (backgrounds & tiles).
- Trim transparent margins to a consistent ~6% padding; keep the **pivot centered** unless an anchor is specified.
- Provide each at the stated px; if your generator outputs 1024², downscale on export.
- Naming: lowercase, `snake_case`, exact keys below.

---

## 2. HERO — Tomato Man + character builder

The hero is a **sandwich/produce mascot**: a round produce *head* on a stubby body with **bread-slice feet** and **lettuce-frill arms**. The character builder swaps the **head**, adds **hats/face cosmetics**, and recolors. Build the body once; make everything else a layer that snaps to named anchor points.

### 2.1 Body & core

**`hero/body_base.png`** — The reusable body (torso, bread feet, lettuce arms), headless, neutral standing builder pose. Everything snaps onto this. `512×640 px, transparent`. Include a faint navy neck-socket so heads seat cleanly.
> A cute cartoon sandwich-creature BODY with no head: a small round torso, two toasted golden bread-slice feet, two ruffled green lettuce-leaf arms with little mitten hands, friendly proportions, standing front-3/4 hero pose, empty round neck socket on top where a head will attach, warm soft cel shading, navy outline.

**`hero/tomato_head.png`** — Default head: a glossy ripe tomato with a green leafy crown, big friendly eyes, tiny smile, a faint pink sunburn blush on the cheeks (the running gag). `384×384 px, transparent`. This is the franchise face — make it iconic.
> A glossy ripe red tomato character HEAD, big expressive friendly cartoon eyes, small cheerful smile, a little green star-shaped leafy stem crown on top, subtle pink sunburn blush on the cheeks, smooth round shape, warm highlight, navy outline, sticker-style.

**`hero/face_expressions_sheet.png`** — Swappable face overlay sheet (eyes+mouth only, transparent over any head): `neutral, happy, determined, squint(hot), pain(burning), dizzy(respawn), wink`. `1024×768 px, 4×2 grid, transparent`.
> A sheet of 7 cartoon FACE expressions (eyes and mouth only, no head outline), arranged in a tidy grid on transparent background: neutral, big happy smile, determined squint, sun-squint with sweat drop, pained ouch grimace with X-eyes, dizzy spiral eyes, playful wink. Simple navy linework, consistent eye spacing.

### 2.2 Swappable produce heads (character builder)

All heads: **`384×384 px, transparent`**, same eye height and same neck-socket position as `tomato_head` so they snap interchangeably. Same friendly face treatment. Prompt pattern: *"A cute cartoon **[produce]** character HEAD with big friendly eyes and a small smile, same head size and eye placement as a mascot tomato, [signature feature], navy outline, glossy cel shading"* + Master Style Block.

| Key | Produce | Signature feature to include |
|---|---|---|
| `hero/head_strawberry.png` | Strawberry | red body, seed dots, green calyx hat |
| `hero/head_lemon.png` | Lemon | bright yellow oval, dimpled peel, leaf sprig |
| `hero/head_lime.png` | Lime | green oval, glossy peel |
| `hero/head_orange.png` | Orange | round, navel dimple, leaf |
| `hero/head_eggplant.png` | Eggplant | deep purple gloss, green stem cap |
| `hero/head_avocado.png` | Avocado | half-avocado face with brown pit cheek |
| `hero/head_watermelon.png` | Watermelon | green rind, pink wedge mouth area, seeds |
| `hero/head_pineapple.png` | Pineapple | crosshatch skin, spiky green crown |
| `hero/head_bellpepper.png` | Bell pepper | glossy red/orange lobes, green stem |
| `hero/head_onion.png` | Onion | papery layered skin, sprout top |
| `hero/head_potato.png` | Potato | lumpy tan, little eye-dots (spuds) |
| `hero/head_corn.png` | Corn | yellow kernel rows, green husk leaves |
| `hero/head_broccoli.png` | Broccoli | bushy green floret crown |
| `hero/head_grape.png` | Grape bunch | cluster of purple spheres, vine curl |
| `hero/head_peach.png` | Peach | soft fuzzy pink-orange, cleft, leaf |
| `hero/head_blueberry.png` | Blueberry | round deep blue, frosted dusty bloom, tiny crown |
| `hero/head_carrot.png` | Carrot | orange cone, leafy green top |
| `hero/head_mushroom.png` | Mushroom | red spotted cap, cream stem face |

### 2.3 Hats & head cosmetics

All: **`384×384 px, transparent`**, authored to sit on the **top/`hat_anchor`** of any head (don't cover the eyes). Prompt pattern: *"A cartoon **[item]** prop, sized to sit on top of a mascot's round head as a wearable, isolated, navy outline, soft cel shading"* + Style Block.

- `hero/hat_sunhat.png` — wide floppy straw sun hat (the responsible choice, ironic for a burn-prone hero)
- `hero/hat_lifeguard_cap.png` — red lifeguard cap with white cross
- `hero/hat_sombrero.png` — colorful embroidered sombrero
- `hero/hat_visor.png` — neon beach visor
- `hero/hat_captain.png` — white sailor/captain's cap
- `hero/hat_crown.png` — gold beam-yellow crown (mastery cosmetic)
- `hero/hat_party.png` — striped party cone hat
- `hero/hat_icecream.png` — ice-cream-cone hat (two scoops)
- `hero/hat_bandana.png` — tied surf bandana
- `hero/hat_flower_lei.png` — tropical flower crown / lei
- `hero/hat_headphones.png` — chunky beach headphones
- `hero/hat_snorkel_mask.png` — snorkel + dive mask (overlays upper face)
- `hero/hat_chefs_hat.png` — white chef's toque (the sandwich gag)
- `hero/hat_pirate.png` — pirate tricorn with skull

### 2.4 Face / body cosmetics

All: **`384×384 px, transparent`**, anchored to `face_anchor` or `body_anchor`.
- `hero/cos_sunglasses_round.png` — round retro shades
- `hero/cos_sunglasses_sport.png` — wraparound sport shades
- `hero/cos_star_sunglasses.png` — star-shaped novelty shades
- `hero/cos_zinc_stripe.png` — white zinc sunscreen nose stripe (on-theme protection)
- `hero/cos_mustache.png` — friendly curly mustache
- `hero/cos_swimring.png` — inflatable flamingo swim ring (wraps the body)
- `hero/cos_cape.png` — heroic little towel-cape
- `hero/cos_sandals.png` — flip-flops replacing/over the bread feet
- `hero/cos_floaties.png` — arm floaties on the lettuce arms
- `hero/cos_backpack_cooler.png` — tiny cooler backpack

### 2.5 In-game hero sprites (top-down)

**`hero/ingame_tomato.png`** — Top-down in-game Tomato Man as the engine sees him: a rounded red blob from slightly-above, leafy crown poking up, simple navy face, soft contact shadow baked separately. `256×256 px, transparent`. Pivot dead-center; on-screen radius ≈ 14px world.
> Top-down view of a small round red tomato character seen from slightly above, little green leaf crown, simple friendly navy face, compact chunky silhouette, designed to be instantly readable as a tiny moving dot on bright sand, navy outline, soft cel shading.

**`hero/ingame_states_sheet.png`** — Top-down hero in 4 exposure states for tinting reference (the engine already lerps pale→pink→red; these are *baked* alternates if preferred): `cool/safe (normal red)`, `warming (pink)`, `hot (deep red, squint)`, `burning (white-hot flash + smoke)`. `1024×256 px, 4×1, transparent`.
> Four top-down frames of the same round tomato character in a row showing escalating sunburn: healthy red and happy, warm pink and worried, scorched deep-red squinting with sweat, and a white-hot burning frame with little smoke puffs and X eyes; consistent size and centering, navy outline.

---

## 3. CASTERS — the shade-makers

These are the **physical objects** that cast the moving shade. The engine computes and draws the *shadow* itself (cool blue polygons/ellipses); your art is the **prop that sits at the caster's footprint**. Author them **top-down / high-3/4**, with the **caster's footprint matching the listed world size** and a clear "this is overhead cover" read. Keep the cloth/canopy colors warm (coral family) so they pop against blue shade.

> Engine note: `['R',x,y,w,d,shadowHeight]` = rect awning (footprint `w×d`); `['U',x,y,r,facing,shadowHeight]` = round umbrella (radius `r`, `facing` is tilt). `movers` = patrolling carts (same as awning but moving). Provide art at ~2× the typical world footprint.

### 3.1 Rect awnings (`['R']`)

**`casters/awning_striped.png`** — Classic beach-stall striped awning, top-down. The bread-and-butter shade caster. `720×220 px, transparent` (typical world `w≈360,d≈70`). Pivot at top-left corner = the caster's `x,y`.
> A top-down beach stall AWNING: a wide rectangular candy-striped coral-and-cream canvas canopy with a scalloped front valance, two little wooden support posts visible at the lower corners, seen from above and slightly in front, warm sun highlight along the top edge, navy outline, sized to sit on sand as an overhead cover.

**`casters/awning_solid.png`** — Plain canvas awning variant (palette-swappable per world). `720×220 px, transparent`.
> A top-down rectangular canvas AWNING in a single warm color with a smooth scalloped front edge, simple wooden posts, clean readable silhouette, navy outline, soft cel shading.

**`casters/cabana.png`** — A four-post draped cabana/canopy (bigger, "rest-room" shade pools). `768×512 px, transparent`. Footprint roughly square.
> A top-down beach CABANA: a square draped fabric canopy on four corner posts with tied curtains at the corners, flat shaded roof seen from above, breezy cloth, coral-and-cream palette, navy outline, sticker-style, reads as a large patch of overhead cover.

**`casters/billboard.png`** — A tall beach billboard / signboard on legs (casts a long hard-edged rectangular shadow). `640×512 px, transparent`. Blank face (no text — text would be a decal layer).
> A top-down/high-angle beach BILLBOARD: a large blank rectangular sign panel on two sturdy posts planted in sand, slightly weathered wood frame, smooth blank face, casts-an-obvious-long-shadow feeling, navy outline, beach-cartoon, no text on the sign.

### 3.2 Round umbrellas (`['U']`) — the tilt puzzle

The umbrella's **`facing` tilt** is gameplay-meaningful (it only shades well when aimed at the sun), so render a clear **directional tilt** and a top-knob the engine can rotate around center. Author **facing "up"** (toward exit) as the neutral 0; the engine rotates the sprite.

**`casters/umbrella_neutral.png`** — Standard round beach umbrella, top-down, pole at center. `512×512 px, transparent`. Pivot = center (pole), so rotation reads as tilt.
> A top-down round beach UMBRELLA seen from above, classic radial coral-and-cream panel segments, a small finial knob at the exact center, subtle dome curvature shading so the tilt direction is readable, clean circular silhouette, navy outline, soft cel shading.

**`casters/umbrella_palm.png`** — Tiki/palm-thatch umbrella variant (Tide Pools / tropical worlds). `512×512 px, transparent`.
> A top-down round thatched TIKI UMBRELLA made of layered dried palm fronds radiating from a center pole knob, warm straw tones, slightly shaggy circular edge, readable dome shading, navy outline, beach-cartoon.

**`casters/umbrella_tilted_ref.png`** — A 3/4 reference of a *tilted* umbrella for the tutorial pop-up that teaches the tilt mechanic. `512×512 px, transparent`. (Illustrative, not the in-game caster.)
> A friendly 3/4 view of a beach umbrella tilted at an angle on its pole, with a little curved arrow showing it can swivel toward the sun, teaching-illustration feel, coral canopy, navy outline, soft cel shading.

### 3.3 Natural & structural casters

**`casters/palm_tree.png`** — Palm tree, top-down: a star of fronds (the canopy is what shades; trunk is a small dot). `640×640 px, transparent`. Pivot at trunk base/center.
> A top-down PALM TREE seen from directly above: a radial burst of long curved green palm fronds forming a rough circle, a small brown trunk dot at the center, a couple of coconuts, lush layered greens, navy outline, reads clearly as a round patch of canopy cover.

**`casters/palm_lean.png`** — Leaning coconut palm (asymmetric canopy for directional shade). `768×640 px, transparent`.
> A top-down leaning PALM TREE, fronds bunched to one side creating an off-center oval canopy, curved trunk visible, tropical greens, navy outline, beach-cartoon, clear overhead-cover silhouette.

**`casters/lifeguard_tower.png`** — Lifeguard tower/hut on stilts (tall → long shadow; iconic beach landmark). `640×768 px, transparent`. High-3/4 so the elevated hut reads.
> A high-angle beach LIFEGUARD TOWER: a small wooden hut with a slanted roof and a red flag, raised on four tall stilt legs with a ladder, classic red-and-white life-guard styling, casts a strong tall shadow, navy outline, juicy beach-cartoon.

**`casters/rock_arch.png`** — Sea-rock arch (natural overhang; casts a curved shade band). `768×640 px, transparent`. High-3/4.
> A high-angle natural ROCK ARCH on the beach: a chunky weathered sandstone arch with a tunnel of shade beneath it, a few barnacles and tufts of beach grass, warm tan-and-ochre stone with cool shadow underneath, navy outline, stylized cartoon rock.

**`casters/canyon_overhang.png`** — Cliff/dune overhang ledge (long directional shade for Dunes world). `768×512 px, transparent`.
> A high-angle desert dune CLIFF OVERHANG: a curved sandstone ledge jutting out to throw a long band of cool shade beneath it, layered sediment lines, warm amber rock, navy outline, beach/dune cartoon.

### 3.4 Moving carts (`movers`)

**`casters/cart_awning.png`** — The patrolling food/ice-cream cart whose awning shadow is a ride-able moving platform. `512×320 px, transparent`. Footprint ≈ `w 230 × d 60` world; **wheels at the bottom edge**, awning on top. Pivot top-left.
> A top-down/high-3/4 beach VENDOR CART: a little wooden ice-cream cart with two round wheels, a striped coral-and-cream awning roof on top, a small serving counter, cheerful and chunky, clearly a moving object, navy outline, soft cel shading. Wheels at the bottom edge.

**`casters/cart_variants_sheet.png`** — 3 reskins of the cart (ice-cream / fruit-stand / drinks) for visual variety across levels. `1536×320 px, 3×1, transparent`. Identical footprint & wheel line.
> Three top-down beach VENDOR CARTS in a row, identical size and wheel placement, different themes: an ice-cream cart, a fresh-fruit stand cart, and a cold-drinks cart, each with a striped awning roof, chunky and readable, navy outline, beach-cartoon.

---

## 4. HAZARDS

### 4.1 Hot sand (`hot:[x,y,r]`) — burns even in shade

**`hazards/hot_sand.png`** — A circular patch of scorching sand: a tileable/stretchable warning texture that reads as "don't stand here, even in shade." `512×512 px, transparent` (soft circular falloff at edge). Color = Scorch Orange.
> A top-down circular patch of SCORCHING HOT SAND: glowing orange-to-red rippled sand with shimmering heat lines and a few tiny cracked-earth marks, soft glowing edge that fades to transparent, clearly a danger zone, warm danger palette #EB6E28 to #C8461E, navy-tinted ripple lines, no text.

**`hazards/hot_sand_shimmer.png`** — Optional animated-feel heat-shimmer overlay (additive) to sit above hot sand and bright plazas. `512×256 px, transparent`, mostly faint.
> A faint horizontal HEAT-HAZE shimmer overlay: wavy translucent warm-white distortion bands, very low opacity, additive glow, transparent background, suggests rising heat, no hard edges.

### 4.2 Angry Sun (Eclipse boss) — the Mario-3 lunger

**`hazards/angry_sun.png`** — The boss face: a scowling sun that lunges and drags the lethal zone. `768×768 px, transparent`. Big personality, menacing but cartoon. This is the World 5 antagonist.
> A menacing cartoon ANGRY SUN FACE: a round blazing sun with furious furrowed eyebrows, glaring eyes, gritted teeth in a snarl, surrounded by jagged flame-like rays, hot white-gold core with orange-red rays, intimidating but stylized and readable, navy outline, juicy cartoon villain.

**`hazards/angry_sun_frames_sheet.png`** — Expression/attack frames: `idle-glare, wind-up (eyes wide, inhale), lunge (open-mouth screaming dive), cooldown (panting)`. `1536×384 px, 4×1, transparent`. Same center/size.
> A sheet of 4 ANGRY SUN faces in a row, same size and centering: a steady glare, a wide-eyed wind-up with cheeks puffed, a furious open-mouthed screaming lunge with rays stretched forward, and a tired panting recovery; jagged flame rays, hot orange-gold palette, navy outline, cartoon boss.

**`hazards/eclipse_corona.png`** — The eclipse state (Angry Sun blocked → brief safe darkness window). `768×768 px, transparent`. A black disc with a glowing corona ring.
> A solar ECLIPSE: a deep black disc with a brilliant glowing white-gold corona ring and soft wispy flares around it, an eerie calm beauty, cool dark surround, suggests a moment of safe darkness, navy/black palette with bright rim, no text.

### 4.3 Wind (Dunes world — drift + re-tilts umbrellas)

**`hazards/wind_streak.png`** — A single wind gust streak (tileable/repeatable, directional). `512×160 px, transparent`. Faint, motion-suggesting.
> A horizontal WIND GUST streak: soft swirling translucent white-and-sand lines suggesting a strong directional breeze, a few flecks of sand and a tiny leaf caught in it, tapered ends, low opacity, transparent background, motion-blur feel, no hard outline.

**`hazards/wind_arrows.png`** — Directional wind indicator icon (UI/telegraph for which way drift pushes). `256×256 px, transparent`.
> A clean cartoon WIND DIRECTION icon: three curling breeze lines with a soft arrow, white-and-pale-blue, friendly and readable as a UI telegraph, navy outline, small size.

---

## 5. PICKUPS & MARKERS

All pickups are flat front-facing icons, **`256×256 px, transparent`**, with a small baked glow so they pop on sand. Each should have an obvious dominant color matching its function.

**`pickups/sunbeam.png`** — Sunbeam currency (collectible **only in sun** = risk/reward). `256×256 px, transparent`. Beam Yellow, sparkly.
> A glowing SUNBEAM currency token: a bright beam-yellow faceted star-spark with a radiant glow halo and tiny sparkle accents, premium collectible feel, like a coin made of light, navy outline on the star body, juicy and inviting.

**`pickups/sunbeam_collected_burst.png`** — One-frame collect burst for the sunbeam (also reusable FX). `256×256 px, transparent`.
> A small celebratory BURST of beam-yellow sparkles and a star pop, radial spokes of light, no central object, transparent background, FX flourish.

**`pickups/popsicle.png`** — Popsicle = **dash refill**. `256×256 px, transparent`. Cool colors so it reads as "refresh."
> A cute twin-stick POPSICLE pickup: a frosty pink-and-blue ice pop on a wooden stick with a little drip and a cold frost sparkle, refreshing and cool-toned, navy outline, glossy cel shading.

**`pickups/ice_water.png`** — Ice water = **briefly slows the sun** (reposition window). `256×256 px, transparent`. Icy cyan.
> A frosty glass/bottle of ICE WATER pickup: a clear bottle with cold blue water, ice cubes and condensation droplets, a chilly cyan glow, reads as a 'cool down / slow time' power-up, navy outline, juicy cartoon.

**`pickups/spf_bottle.png`** — SPF bottle = ~2.6s immunity. `256×256 px, transparent`. SPF Cyan, sunscreen styling.
> A cartoon SUNSCREEN SPF BOTTLE pickup: a chunky white-and-cyan sunscreen tube with a sun symbol on the label area (no readable text), a dollop of white cream at the cap, protective and friendly, soft cyan shield glow, navy outline.

**`pickups/shade_token.png`** — Pop-up shade charge icon (the deployable safe circle tool). `256×256 px, transparent`. Cool blue.
> A small POP-UP SHADE token icon: a folded little blue parasol/umbrella bursting open into a cool blue shade circle, with a soft blue glow, reads as a deployable 'drop shade here' tool, navy outline, friendly.

**`pickups/shade_drop_placed.png`** — The deployed shade circle as it appears on the ground (the safe pool the tool drops). `512×512 px, transparent`. Cool blue, soft edge.
> A top-down circular pool of cool blue SHADE on sand, soft feathered edge, a faint little parasol icon hint at the center, clearly a safe standable zone, cool shade-blue #465A82, semi-translucent, no harsh outline.

**`pickups/checkpoint_flag.png`** — Checkpoint marker (off / on states). `256×384 px, transparent`. Two states in one sheet preferred.
> Two states of a beach CHECKPOINT FLAG side by side, same pole: left is inactive (limp grey-white flag, dim ring), right is activated (bright aloe-green flag mid-flap with a green glow ring at the base), planted in sand, navy outline, juicy cartoon.

**`pickups/exit_flag.png`** — The goal flag at the top of the level. `384×512 px, transparent`. Aloe Green, celebratory, the thing you climb toward.
> A triumphant GOAL FLAG on a tall pole planted in sand: a big waving aloe-green pennant with a little tomato emblem, a soft golden victory glow and a few sparkles, clearly 'the finish', navy outline, juicy beach-cartoon.

---

## 6. TILES & BACKGROUNDS — the five worlds

Each world ships: **(a)** a **seamless ground tile** (the sand/terrain you walk on), **(b)** a **far parallax background strip** (sky/horizon for the scroll), **(c)** 2–4 **decor props** (non-gameplay set-dressing scattered for character), and **(d)** a **world-select key art** thumbnail. Worlds are mostly the *same verbs recolored* — keep the structure identical, change the palette/mood. Ground tiles are **opaque, seamless `512×512`**; parallax strips are **opaque, horizontally-tileable `2048×768`**; props are transparent.

> Readability reminder: whatever the world palette, the **walk-on ground must stay light/warm** so the **cool-blue computed shade** still reads as the safe contrast layer on top. Don't make a world so blue that shade disappears.

### 6.1 World 1 — Morning Tide (low sun, long forgiving shadows)
Cool, gentle, dawn. Wet sand, tide line, pastel sky. The teaching world — calm and inviting.

- **`tiles/w1_morning_ground.png`** — `512×512, seamless opaque`.
  > Seamless top-down WET MORNING BEACH SAND tile: smooth damp peachy-tan sand with gentle tide ripples, a few tiny shells and pebbles, soft dawn coloring, low-frequency texture that tiles invisibly, calm and clean, beach-cartoon.
- **`tiles/w1_morning_sky.png`** — `2048×768, horizontally tileable opaque`.
  > A wide soft DAWN BEACH SKY backdrop: pale peach-to-lavender gradient sky, a low gentle morning sun glow near the horizon, a calm pastel sea line with soft foam, distant hazy headland, dreamy and serene, painterly cartoon, tileable horizontally.
- **`tiles/w1_decor_sheet.png`** — `1024×1024, transparent` props: seashells, starfish, a tide-pool puddle, a sandcastle, washed-up driftwood.
  > A sheet of top-down MORNING TIDE beach decor props on transparent background: assorted seashells, a starfish, a small sandcastle, a piece of driftwood, a shallow tide puddle, soft dawn colors, navy outline, consistent scale.
- **`tiles/w1_keyart.png`** — `512×512, opaque` world-select thumbnail.
  > Cozy world key-art thumbnail of a calm dawn beach with long soft shadows and Tomato Man waving, peach-lavender palette, inviting, beach-cartoon, room for a title overlay.

### 6.2 World 2 — Midday Blaze (short shadows, harsh, tool-heavy)
Brutal noon. Bleached white-gold sand, blinding sky, heat shimmer everywhere. Tension.

- **`tiles/w2_blaze_ground.png`** — `512×512, seamless opaque`.
  > Seamless top-down BLEACHED MIDDAY SAND tile: hot pale-gold dry sand with faint cracked patches and shimmer, sun-baked and bright, very light value, low-frequency, tiles invisibly, beach-cartoon.
- **`tiles/w2_blaze_sky.png`** — `2048×768, tileable opaque`.
  > A wide HARSH NOON BEACH SKY: near-white hot sky with an intense glaring sun high overhead, washed-out pale-blue at the edges, heat shimmer along the horizon, oppressive bright heat, painterly cartoon, tileable.
- **`tiles/w2_decor_sheet.png`** — `1024×1024, transparent`: cracked earth patches, a melting popsicle puddle, a sun-bleached skull-shell, beach towel, empty cooler.
  > A sheet of top-down MIDDAY blaze decor props on transparent background: cracked dry-earth patches, a melted popsicle puddle, a faded beach towel, an open cooler, a sun-bleached shell, hot pale palette, navy outline.
- **`tiles/w2_keyart.png`** — `512×512, opaque`.
  > World key-art thumbnail of a blinding noon beach, short harsh shadows, Tomato Man squinting and sweating under a glaring high sun, hot white-gold palette, intense, beach-cartoon.

### 6.3 World 3 — Tide Pools (reflective water = secondary sun angles)
Rocky shoreline, teal pools that **reflect light** (bounce-light mechanic). Cooler, prettier, trickier.

- **`tiles/w3_tidepool_ground.png`** — `512×512, seamless opaque`.
  > Seamless top-down ROCKY TIDE-POOL terrain tile: wet dark-tan rock shelves with patches of teal pool water, slick algae, barnacles and pebbles, glossy reflective puddles, cool teal-and-tan palette, tiles invisibly, beach-cartoon.
- **`tiles/w3_tidepool_water.png`** — `512×512, seamless opaque/translucent` — a reflective water tile (separate so it can shimmer/reflect light in-engine).
  > Seamless top-down shallow TIDE-POOL WATER tile: clear teal water with a bright reflective sun-glint sheen, gentle ripples, hints of rock and starfish beneath, glossy mirror highlights (the reflection that bounces light), cool palette, tiles invisibly.
- **`tiles/w3_tidepool_sky.png`** — `2048×768, tileable opaque`.
  > A wide TIDE-POOL COAST SKY: clear bright teal-blue sky, fresh sea breeze clouds, a sparkling reflective sea with sun-glitter on the water, rocky outcrops on the horizon, fresh and vivid, painterly cartoon, tileable.
- **`tiles/w3_decor_sheet.png`** — `1024×1024, transparent`: anemones, crabs, mussels, kelp, glossy wet rocks, a tide-pool sea star.
  > A sheet of top-down TIDE-POOL decor props on transparent background: sea anemones, a little crab, mussel clusters, kelp strands, glossy wet rocks, a colorful sea star, cool teal palette, navy outline, consistent scale.
- **`tiles/w3_keyart.png`** — `512×512, opaque`.
  > World key-art thumbnail of a sparkling rocky tide-pool coast with reflective water bouncing light, Tomato Man hopping between rocks, teal-and-tan palette, fresh, beach-cartoon.

### 6.4 World 4 — Dunes at Dusk (wind pushes you; sun reverses)
Sweeping desert dunes at golden/magenta sunset, sea grass bending in wind. Long reversed shadows, drift control.

- **`tiles/w4_dunes_ground.png`** — `512×512, seamless opaque`.
  > Seamless top-down DUSK SAND DUNE tile: warm amber-and-rose rippled dune sand with wind-blown ripple lines all flowing one direction, tufts of sea grass, long-shadow dusk lighting, golden-magenta palette, tiles invisibly, beach-cartoon.
- **`tiles/w4_dunes_sky.png`** — `2048×768, tileable opaque`.
  > A wide DUSK DUNE SKY: a dramatic sunset gradient of amber, magenta and deep purple, a large low setting sun on the horizon, wind-streaked clouds, a few early stars, warm-to-cool gradient, painterly cartoon, tileable.
- **`tiles/w4_decor_sheet.png`** — `1024×1024, transparent`: sea-grass tufts, a weathered fence, tumbleweed, a beached buoy, a kite caught in wind.
  > A sheet of top-down DUSK DUNE decor props on transparent background: bending sea-grass tufts, a half-buried weathered fence, a tumbleweed, an old buoy, a kite tugging in the wind, warm sunset palette, navy outline.
- **`tiles/w4_keyart.png`** — `512×512, opaque`.
  > World key-art thumbnail of windswept dusk dunes with long reversed shadows and Tomato Man leaning into a gust, amber-magenta sunset palette, dramatic, beach-cartoon.

### 6.5 World 5 — Eclipse (Angry Sun boss + intermittent darkness relief)
The climax world. Dark, eerie, beautiful. Eclipse corona, purple-black sky, brief safe-darkness windows. The Angry Sun (§4.2) is the star.

- **`tiles/w5_eclipse_ground.png`** — `512×512, seamless opaque`.
  > Seamless top-down ECLIPSE-LIT BEACH tile: dim cool-purple sand under eerie eclipse twilight, faint reddish glow at the edges, a few glowing bioluminescent specks, dark moody palette but still readable, tiles invisibly, beach-cartoon.
- **`tiles/w5_eclipse_sky.png`** — `2048×768, tileable opaque`.
  > A wide ECLIPSE SKY: a deep indigo-to-black sky with a dramatic solar eclipse — black disc and glowing white-gold corona — eerie twilight glow on the horizon, scattered stars, ominous and beautiful, painterly cartoon, tileable.
- **`tiles/w5_decor_sheet.png`** — `1024×1024, transparent`: glowing jellyfish, lanterns, eerie glowing shells, cracked obelisk, will-o-wisp light.
  > A sheet of top-down ECLIPSE decor props on transparent background: glowing jellyfish, a beach lantern, eerie bioluminescent shells, a cracked stone obelisk, a floating wisp of light, cool glowing purples and golds, navy outline.
- **`tiles/w5_keyart.png`** — `512×512, opaque`.
  > World key-art thumbnail of an eerie eclipse beach with the glaring Angry Sun boss looming and Tomato Man bracing in a patch of safe darkness, indigo-and-gold palette, climactic, beach-cartoon.

### 6.6 Shared environmental layers

- **`tiles/cloud_platform.png`** — Drifting safe cloud (the ride-able cloud-shadow platform). `512×320 px, transparent`. Soft, puffy, reads as safe.
  > A top-down fluffy white CLOUD platform seen from above: a soft puffy cumulus blob with a faint cool-blue shaded underside, gentle rounded lobes, reads as a safe standable drifting platform, navy outline, soft cel shading.
- **`tiles/cloud_elevator.png`** — Vertical "elevator" cloud variant (slightly taller/stretched). `384×512 px, transparent`.
  > A top-down tall fluffy CLOUD platform, slightly elongated vertically, soft puffy lobes with a cool-blue underside, suggests it rises and falls like an elevator, navy outline, beach-cartoon.
- **`tiles/parallax_far.png`** — Generic far-distance silhouette strip (palm/headland silhouettes) reusable & tintable per world. `2048×384 px, transparent`.
  > A horizontal silhouette PARALLAX STRIP of distant beach scenery: simple flat silhouettes of palms, dunes and a headland along a baseline, single-color tintable shapes, transparent above, tileable horizontally, clean cartoon.

---

## 7. UI

UI is the **cream/navy** system layer. Buttons live over gameplay so they need high contrast + a clear pressed state. Mobile-first: big touch targets, thumb-reachable. Author at 2×.

### 7.1 Branding

**`ui/logo_tomato_man.png`** — Primary game logo/wordmark. `1024×512 px, transparent`. The hero face integrated.
> A playful game LOGO reading "TOMATO MAN" in chunky rounded hand-painted letters with a thick navy outline and a beam-yellow fill, the dot/letterform incorporating a smiling sunburnt tomato character wearing a tiny sun hat, a sun and beach vibe, juicy sticker style, transparent background.

**`ui/logo_alt.png`** — Alternate stacked wordmark "TOMATO MAN" (sun/shade split). `1024×384 px, transparent`.
> A bold game LOGO reading "TOMATO MAN" in strong rounded uppercase letters, half the letters in warm sun-gold and half slipping into cool blue shade, a small sun-and-shadow motif, navy outline, dramatic but friendly, transparent background.

**`ui/title_splash.png`** — Full title-screen key art (hero + beach + sweeping shadow). `1536×2048 px, opaque` (portrait).
> Portrait title-screen KEY ART: Tomato Man standing heroically in a slice of cool blue shade on a blazing beach, a dramatic sweeping shadow cast across bright sand, beach umbrellas and palms, a big sun in the sky, juicy painterly beach-cartoon, vibrant, space at the top for a logo, no text.

### 7.2 Controls (the floating joystick + 3 action buttons)

**`ui/joystick_base.png`** — Floating thumb-joystick base ring. `256×256 px, transparent`. Semi-translucent so it doesn't block the board.
> A floating virtual JOYSTICK base: a soft translucent white ring with a faint inner gradient and a subtle navy rim, clean and minimal, semi-transparent, mobile control UI, no text.

**`ui/joystick_thumb.png`** — The draggable thumb knob. `160×160 px, transparent`.
> A floating virtual JOYSTICK thumb knob: a translucent white rounded disc with a soft highlight and a faint tomato-red center dot, clean mobile control UI, semi-transparent.

**`ui/btn_dash.png`** — Dash action button (largest, primary). `192×192 px, transparent`. Two states (idle / cooldown-ring) — provide idle; engine draws the conic cooldown ring.
> A round mobile ACTION BUTTON for DASH: a chunky circular button with a navy rim and a translucent tomato-red fill, a little speed/dash chevron icon in the center, energetic, pressed-friendly, semi-transparent, no text.

**`ui/btn_shade.png`** — Drop-shade tool button. `160×160 px, transparent`.
> A round mobile ACTION BUTTON for DROP SHADE: a circular navy-rimmed translucent button with a small blue parasol/umbrella icon casting a shade dot, cool blue accent, semi-transparent, no text.

**`ui/btn_spf.png`** — SPF tool button. `160×160 px, transparent`.
> A round mobile ACTION BUTTON for SPF: a circular navy-rimmed translucent button with a small sunscreen-bottle / shield-with-sun icon, cyan accent, semi-transparent, no text.

**`ui/btn_disabled_overlay.png`** — Greyed "empty / no charges" overlay for tool buttons. `160×160 px, transparent`.
> A round translucent grey DISABLED overlay for a button: a soft dim circle with a faint slash, low opacity, indicates 'no charges left', no text.

**`ui/btn_pause.png`** / **`ui/btn_back.png`** / **`ui/btn_retry.png`** / **`ui/btn_next.png`** — Small system buttons. `128×128 px each, transparent`.
> A small clean cartoon UI button icon for [pause bars / back arrow / circular retry arrow / next arrow], navy outline on a cream rounded square, friendly, no text.

### 7.3 Meter & status

**`ui/exposure_meter_frame.png`** — Frame/casing for the exposure bar (the engine fills it pale→pink→red, or cyan when SPF). `512×96 px, transparent`. Leave the fill area clear.
> A horizontal EXPOSURE METER frame: a rounded-rectangle gauge casing with a thick navy rim and a small sun icon at the left cap, the inner bar area left empty/transparent for a dynamic fill, cream-and-navy, clean mobile HUD, no text.

**`ui/exposure_fill_gradient.png`** — Reference fill gradient strip (pale→pink→red) if a baked fill is preferred over the procedural lerp. `512×64 px, opaque`.
> A horizontal gauge FILL gradient strip going from pale cream-yellow (safe) through pink to hot red (burning), smooth, glossy, rounded ends, HUD bar fill.

**`ui/heart.png`** — Heart/life icon (off + on) for any life-count UI. `128×128 px, transparent`.
> Two small cartoon HEART icons side by side: one full glossy tomato-red heart and one empty grey outline heart, plump and juicy, navy outline, HUD style.

**`ui/sun_clock_icon.png`** — Small sun-position indicator (the "sun is a clock" telegraph token). `128×128 px, transparent`.
> A small cartoon SUN icon for a HUD position indicator: a friendly beam-yellow sun disc with short rays and a tiny face hint, clean and readable at small size, navy outline.

### 7.4 Medals, stars & progression

**`ui/medal_gold.png`** / **`ui/medal_silver.png`** / **`ui/medal_bronze.png`** — Win-screen medals (flawless + under-par tiers). `256×256 px each, transparent`.
> A chunky cartoon award MEDAL on a striped ribbon, [gold / silver / bronze] with a little embossed sun-and-tomato emblem, glossy and celebratory, navy outline, beach-cartoon, transparent background.

**`ui/star_filled.png`** / **`ui/star_empty.png`** — Level-rating stars (the menu shows ★ best). `128×128 px each, transparent`.
> A cartoon rating STAR: one bright beam-yellow filled star with a soft glow and one empty grey outline star, plump rounded points, navy outline, HUD style.

**`ui/lvl_tile_frame.png`** — Level-select card frame/badge (the grid buttons). `384×256 px, transparent`. Cream card with corner star slots.
> A rounded LEVEL-SELECT card frame: a cream rounded-rectangle badge with a thick navy rim, a little number medallion in the top-left corner and three small star slots along the bottom, clean mobile menu UI, no text inside.

**`ui/lvl_locked.png`** — Locked-level padlock overlay. `128×128 px, transparent`.
> A small cartoon PADLOCK icon for a locked level: a chunky navy-and-cream padlock with a sun keyhole, friendly, no text.

### 7.5 Shop / cosmetics economy icons

**`ui/shop_icon.png`** — Shop button (sunbeam-funded cosmetics store). `192×192 px, transparent`.
> A cartoon SHOP icon: a little striped beach-stall storefront with an awning and a sunbeam-coin sign, inviting, navy outline, beach-cartoon.

**`ui/currency_sunbeam_ui.png`** — HUD/shop sunbeam coin (UI-sharp version of the pickup). `128×128 px, transparent`.
> A small crisp UI SUNBEAM coin: a beam-yellow star-spark coin with a glossy highlight, designed to sit next to a number in the HUD, navy outline.

**`ui/shop_category_icons_sheet.png`** — Category tabs: `heads, hats, faces, body, world-skins`. `1280×256 px, 5×1, transparent`.
> A row of 5 cartoon SHOP CATEGORY tab icons on transparent background: a produce head, a sun hat, sunglasses, a cape, and a paint-palette world-skin icon; consistent size, cream-and-navy, friendly, no text.

**`ui/btn_buy.png`** / **`ui/btn_equip.png`** / **`ui/btn_equipped_check.png`** — Shop action chips. `256×128 px each, transparent`.
> A rounded cartoon UI button chip for [buy with a sunbeam-coin / equip / an equipped green checkmark], cream fill, navy outline, beam-yellow or aloe-green accent, no readable text (icon-led).

### 7.6 Character-builder screen

**`ui/builder_backdrop.png`** — Backdrop for the character-builder (Penny's "make a sandwich tomato man" screen). `1536×2048 px, opaque` (portrait). Center reserved for the live hero.
> Portrait CHARACTER-BUILDER backdrop: a cozy beach-workshop scene with a wooden stage/turntable in the center (left empty for the live character), shelves of produce heads and hats around the edges, warm inviting lighting, soft and uncluttered in the middle, beach-cartoon, no text.

**`ui/builder_arrow.png`** — Left/right swap arrows for cycling options. `128×128 px, transparent`.
> A chunky rounded cartoon NAVIGATION ARROW button, cream fill with navy outline and a beam-yellow inner chevron, friendly, mobile UI, mirrorable for left/right.

**`ui/builder_randomize.png`** — "Surprise me" randomize button. `192×192 px, transparent`.
> A cartoon RANDOMIZE button icon: two tumbling dice made of produce (a tomato-die and a lemon-die) with little motion sparkles, playful, navy outline, beach-cartoon.

---

## 8. FX

FX sit over gameplay; keep them **additive-friendly** (bright on transparent) and short-read. Provide as single hero frames and/or small sprite-sheets; the engine can animate by frame or scale/fade.

**`fx/dash_trail.png`** — Dash motion trail (the engine streaks warm afterimages). `512×256 px, transparent`. Tapered warm streak.
> A horizontal DASH TRAIL streak: warm orange-to-yellow motion afterimage with soft tapered ends and a few speed sparkles, additive glow, transparent background, energetic, suggests a fast burst of movement.

**`fx/burn_flash.png`** — Burn/respawn flash (the white-hot "BURNED" pop). `512×512 px, transparent`. Radial white-hot.
> A BURN FLASH effect: a sharp white-hot radial flash with orange-red edges, jagged shock spikes and a puff of smoke, intense one-frame impact, additive, transparent background, conveys an instant-death sun burn.

**`fx/burn_smoke_sheet.png`** — 4-frame smoke-puff dissipation after a burn. `1024×256 px, 4×1, transparent`.
> A 4-frame SMOKE PUFF dissipation sequence in a row: a small grey-white smoke cloud forming and then thinning out and fading, consistent center, soft cartoon smoke, transparent background.

**`fx/sparkle.png`** — Generic sparkle/twinkle (pickups, checkpoints, glints). `128×128 px, transparent`.
> A single clean SPARKLE: a bright four-point star-twinkle with a soft glow and a tiny cross-flare, beam-yellow-white, additive, transparent background, reusable juice element.

**`fx/checkpoint_pop.png`** — Checkpoint-activation ring pop. `512×512 px, transparent`. Aloe-green expanding ring.
> A CHECKPOINT POP effect: an expanding aloe-green glowing ring with a burst of small green sparkles and an upward flag flourish, celebratory one-frame, additive, transparent background.

**`fx/spf_shimmer.png`** — SPF-active shield shimmer (cyan aura that orbits the hero). `256×256 px, transparent`. Soft cyan ring.
> An SPF SHIELD shimmer: a soft glowing cyan protective ring/aura with gentle sparkle dots and a faint sunscreen-bubble sheen, semi-transparent, additive, orbits a character, conveys temporary immunity.

**`fx/matched_umbrella_glint.png`** — The "umbrella aimed right" success glint (tilt-puzzle feedback). `256×256 px, transparent`.
> A satisfying GLINT effect: a bright lens-flare star-glint with a soft golden ring pulse, signals a correct alignment, additive, transparent background, short and rewarding.

**`fx/heat_shimmer_overlay.png`** — Full-screen subtle heat-haze overlay for the Blaze world / hot plazas. `1024×1024 px, transparent`, very low opacity, tileable.
> A faint full-screen HEAT-HAZE overlay: very subtle wavy translucent warm distortion bands across the frame, extremely low opacity, additive, tileable, suggests rising heat with no hard edges, transparent.

**`fx/splash.png`** — Water splash for Tide Pools (stepping in/near water). `256×256 px, transparent`.
> A small cartoon water SPLASH: a teal-blue crown of droplets and a ripple ring, glossy and fresh, navy outline on the main droplets, additive sparkle, transparent background.

**`fx/danger_vignette.png`** — Optional baked danger vignette (engine also draws this procedurally). `1024×1024 px, transparent`. Red corners → clear center.
> A full-frame DANGER VIGNETTE overlay: deep transparent center fading to a glowing hot-red at the edges and corners, pulsing-warning feel, additive, transparent center, conveys 'you are exposed to the sun', no text.

**`fx/win_confetti_sheet.png`** — Win-screen celebration confetti burst. `1024×512 px, transparent`.
> A festive CONFETTI burst: tumbling beam-yellow, tomato-red and aloe-green paper bits with a few sunbeam sparkles, celebratory, transparent background, juicy cartoon.

---

## 9. Appendix — production guide

### 9.1 Priority tiers (build in this order)
1. **Tier 1 — Identity & playability:** `hero/tomato_head`, `hero/body_base`, `hero/ingame_tomato`, `casters/awning_striped`, `casters/umbrella_neutral`, `casters/cart_awning`, `tiles/cloud_platform`, `hazards/hot_sand`, `pickups/sunbeam`, `pickups/spf_bottle`, `pickups/exit_flag`, `pickups/checkpoint_flag`, `ui/logo_tomato_man`, `ui/joystick_base`+`thumb`, `ui/btn_dash`/`shade`/`spf`, `ui/exposure_meter_frame`. *(This set alone reskins the entire current 4-level build.)*
2. **Tier 2 — World 1 polish & juice:** `tiles/w1_*`, `fx/dash_trail`, `fx/burn_flash`, `fx/sparkle`, `fx/checkpoint_pop`, `ui/medal_*`, `ui/star_*`, `ui/lvl_tile_frame`.
3. **Tier 3 — Worlds 2–5 + new mechanics:** `tiles/w2–w5_*`, `hazards/angry_sun*`, `hazards/wind_*`, `pickups/popsicle`, `pickups/ice_water`, `casters/lifeguard_tower`/`rock_arch`/`palm_*`/`cabana`/`billboard`/`canyon_overhang`.
4. **Tier 4 — Meta & replay:** full produce-head set, hats, cosmetics, `ui/builder_*`, `ui/shop_*`, character-builder & shop UI, `fx/win_confetti_sheet`.

### 9.2 Consistency QA checklist (run on every asset before it ships)
- [ ] Master Style Block was appended; outline is deep-navy `#23314A` at consistent weight.
- [ ] Palette pulls only from §1.2 (+ the asset's world accents).
- [ ] **Warm = danger, cool blue = safe shade** contract is respected.
- [ ] Reads clearly at ~48px (squint test) against bright sand `#F4DCA6`.
- [ ] Correct transparency (sprite) or seamless tiling (ground/sky) per spec.
- [ ] Centered pivot (or stated anchor); margins trimmed to ~6%.
- [ ] No baked text; no busy strobing internal texture.
- [ ] For casters: footprint proportions match the engine's `w×d` / radius so the computed shadow still aligns.
- [ ] For builder parts (heads/hats/faces): identical eye-height and anchor so they snap interchangeably.

### 9.3 Drop-in note
Because the engine already renders procedurally, you can ship any subset at any time — there is **no all-or-nothing gate**. Each PNG simply replaces its procedural counterpart when present. Start at Tier 1, playtest the reskin on a phone, and expand outward. Keep filenames exact so a thin asset-loader (`if image exists, draw it; else draw procedural`) can adopt files automatically as they land.