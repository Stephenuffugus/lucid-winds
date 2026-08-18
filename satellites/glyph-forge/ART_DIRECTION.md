# Glyph Forge — Art Direction

## The Look

Imagine the inside of a dark academia library. Heavy oak, candlelight, a manuscript spread open on the table. The pages are filled with sigils that pulse faintly when you turn the page. That's the game.

**Single-line summary**: *Illuminated manuscript marginalia, drawn for a sorcerer who knows too much.*

## Core Style Tokens

Every Midjourney prompt should pull from this shared palette:

- **Setting**: ancient manuscript, codex margin, vellum parchment, alchemical grimoire
- **Era references**: 14th-century illumination, Book of Kells, Voynich manuscript, Hilma af Klint, Codex Seraphinianus
- **Modern touches**: subtle digital glow, kintsugi gold cracks, prismatic edges on mythics
- **Avoid**: photorealism, anime, cyberpunk, generic fantasy, dragons, swords-and-sorcery clichés, cartoon

## Universal Prompt Stem

Use this stem on every rune. Replace `{subject}`:

```
ancient illuminated sigil of {subject}, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6
```

Use this stem on every enemy. Replace `{subject}`:

```
baroque portrait of {subject}, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, unsettling but dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6
```

---

## Rune Prompts (30 total)

### Common — The Nine Elements (starter pool)

| ID | Prompt |
|---|---|
| `rune-ember` | A small candle flame caught between two fingertips, warm orange glow, simple sigil |
| `rune-drop` | A single suspended water droplet with concentric ripple lines beneath, cool blue silver linework |
| `rune-stone` | An angular polyhedron of carved stone with moss creeping along its edges, set inside a perfect circle, earthen brown palette |
| `rune-gust` | Three curving wind lines emerging from a central point, delicate pale grey-blue ink |
| `rune-hollow` | A perfect circle with absolute darkness inside, ringed by tiny tally marks like a clock face, deep purple-black |
| `rune-ray` | A six-pointed star with one elongated golden ray, halation glow, golden filament |
| `rune-veil` | A crescent moon partially obscured by a horizontal drape of darkness, indigo and silver |
| `rune-tally` | A precise cross with four small Roman numerals at the points, gold leaf on cream parchment |
| `rune-roll` | A many-sided polyhedral die mid-tumble surrounded by random tally marks, magenta and gold sparks |

### Uncommon — Amplifiers and Modifiers

| ID | Prompt |
|---|---|
| `rune-echo` | A bell shape with three concentric ripple-bells emerging from its base, brass gold ink |
| `rune-mirror` | Two crescents forming a yin-yang of cracked mirror glass, iridescent fractures |
| `rune-surge` | An eight-petaled starburst of flame, hot white center, vermillion radiating outward |
| `rune-cascade` | A vertical chain of three diminishing water droplets connected by wavy lines, aquamarine |
| `rune-anchor` | A heraldic anchor-cross with roots growing into the earth below it, bronze and umber |
| `rune-drift` | A single feather pulled by an unseen current leaving a curving silver trail behind it |
| `rune-drain` | A downward spiral of dark liquid disappearing into a small drain glyph at the bottom, deep purple |
| `rune-beacon` | A lighthouse-style burst with twelve evenly spaced rays radiating from a hot golden center |
| `rune-sympathy` | Two infinity-loops intertwined, one bright silver and one dark violet, slight rotation |

### Rare — Heavy Synergy Pieces

| ID | Prompt |
|---|---|
| `rune-ouroboros` | A serpent biting its own tail, scales detailed as small alchemical sigils, crimson and gold leaf |
| `rune-twin` | Two identical sigils overlapping at center with a slight rotational offset, mirror-bright gold |
| `rune-triskel` | Three interlocked spirals forming a Celtic triskelion, gold leaf on green-black, illuminated manuscript style |
| `rune-wildfire` | Flames forming a chain of small running figures sweeping across the sigil, vermillion and ash |
| `rune-tidewall` | A vertical wall of cresting wave with foam at top, Hokusai-inspired, deep blue base |
| `rune-quake` | Cracked ground in an eight-pointed fracture pattern, deep cracks showing molten gold beneath, sandstone and ash |
| `rune-tempest` | Three lightning bolts forming a triangle around a small tornado funnel at center, cyan and steel |
| `rune-eclipse` | A perfect black disc with corona ring around it, single golden tear of light at the three o'clock position, astral painting |

### Mythic — The Broken Pieces (highest detail)

| ID | Prompt |
|---|---|
| `rune-recursion` | A spiral that nests into itself infinitely, Escher-impossible geometry, gold ink on indigo, sacred geometry, **extremely detailed** |
| `rune-pandemonium` | A crown of seven different sigils orbiting a central void, asymmetric chaotic arrangement, black gold ink, slightly menacing |
| `rune-singularity` | A pinprick of pure white light pulling all surrounding lines toward it, accretion disc effect, deep violet bleeding to white center |
| `rune-aurora` | A radiant crown of nine colored rays arranged in a halo, prismatic iridescent gold, the most ornate piece in the codex |

---

## Enemy Prompts (8 total)

| ID | Prompt |
|---|---|
| `enemy-cinder`     | A small hunched being made of soot and coal embers, glowing orange light inside its chest cavity, reluctant posture, baroque portrait, dark background |
| `enemy-wisp`       | A ghostly translucent figure half-formed drifting upward, pale ice-blue, disinterested expression suggested but no face, ethereal |
| `enemy-fenmote`    | A small mossy stone-skinned creature, lichen growing on its shoulders, stubborn squat posture, forest greens and mineral browns, gnomic |
| `enemy-wight`      | A robed figure with too many teeth visible through dark hood, no eyes, tatters of black cloth, purple-black palette with bone-white teeth, unsettling |
| `enemy-sirenshade` | A water-haired figure half-submerged with mouth open in song but the shape is wrong, deep blue-green, scaled details, eerie |
| `enemy-revenant`   | A man-shaped automaton of brass with hollow interior visible, bell-mouth where head should be, verdigris and gold patina, stoic regal pose |
| `enemy-glasswyrm`  | A serpentine creature made of fractured stained glass, multiple eye-shapes embedded across its body, iridescent cracked surfaces |
| `enemy-sovereign`  | A regal silhouette wearing a crown of seven runes, robed in shadow, eyes closed but somehow watching, black and gold with a single red highlight, most ornate piece in the game, throne implied |

---

## Title Mark

`title-mark` — Single central ritual sigil for the game logo. A nine-pointed star with a runic eye at center, surrounded by the four cardinal element symbols at compass points (fire, water, earth, air). Gold leaf on midnight blue-black. **High contrast** because this renders inside a 200px circle on the title screen. Should be recognizable as a silhouette.

---

## App Icons

Use the `title-mark` for both icons:

- `icon-192.png` (192×192) — for PWA install
- `icon-512.png` (512×512) — for splash screens

Crop tight, ensure good edge padding for maskable safe zone (40px inset on a 192px canvas).

---

## Style Consistency Notes

- All runes should have a **dark border edge** so they read against the parchment card.
- Mythic runes can break the rule slightly — add prismatic edges or unusual glow.
- Enemies should NEVER show full clear faces. Always partially obscured.
- Sovereign (boss) is the most polished image — give it the most attention.

If a generation looks "too cartoon" or "too video game", add `, museum oil painting, hand-painted, no digital art` to the negative prompts.

---

## Workflow with Midjourney

1. Open Midjourney. Use `--v 6 --style raw --ar 1:1`.
2. Copy a prompt from this doc. Generate 4 variations.
3. Upscale the best. Use Vary (Subtle) if you want a refinement.
4. Save with the exact filename (e.g. `rune-ember.png`).
5. Drop into `/art-slots/` in the project.
6. Refresh the game — the auto-loader picks it up.

You can iterate the title-mark and the Sovereign portrait the most since they're the marquee images. Common runes can go faster — they're seen at thumbnail size and don't need perfection.
