# Glyph Forge — Art Shot List (production)

**This is the list.** Work top to bottom. Each row = one Midjourney generation.

## How to use
1. Copy the **full prompt** from a row (it already includes the style stem — no editing needed).
2. Generate in Midjourney, upscale the best, export **PNG, square**.
3. Save with the **exact filename** shown.
4. Drop the file into the `art-slots/` folder of this project.
5. The game auto-loads it on next refresh. No code changes, no rebuild.

The game already runs and looks coherent with **zero** art (unicode sigil fallback).
Every image you add just upgrades a placeholder. **Nothing here blocks launch** — see batches.

- Runes → save as `art-slots/<filename>` · square PNG · transparent or dark background
- Enemies → save as `art-slots/<filename>` · square PNG · dark background (game masks to a circle)
- Title → save as `art-slots/title-mark.png` · square PNG, transparent preferred · I auto-generate the two app icons from it (you do **not** make icons by hand)

---

# 🎯 STYLE LOCK — generate these 4 FIRST (do not batch yet)

These 4 span the entire visual range. Generate them, drop them in `art-slots/`,
look at them **in the running game at real size**, and decide if the look is
right. Adjust the shared style words once, here, then everything else inherits a
locked style. Don't generate the other 35 until these 4 feel right together.

1. `art-slots/title-mark.png` — the logo (sets the whole brand) — prompt = **A1** below
2. `art-slots/rune-ember.png` — simplest common rune (the everyday card look) — prompt = **A3** below
3. `art-slots/rune-aurora.png` — most ornate mythic (the high-end + glow rule) — prompt in **Batch C → Mythic**
4. `art-slots/enemy-sovereign.png` — the portrait style + marquee image — prompt = **A2** below

If all 4 read as one cohesive codex at thumbnail and full size → style locked,
proceed to Batch A. If not, tweak the recurring phrases (`dark academia, gold
leaf accents, alchemical grimoire style ...`) and regenerate just these 4.

---

# ⭐ BATCH A — THE LAUNCH SET (14 images) — do these first

After Batch A the whole first act is illustrated and the store page has hero art.
**We can launch the moment Batch A lands.** Everything after is a live upgrade.

### A1 — Title mark (also becomes the app icon + store icon)
`art-slots/title-mark.png`
```
ancient illuminated ritual sigil, a nine-pointed star with a single runic eye at its center, surrounded by four cardinal element symbols (fire, water, earth, air) at the compass points, gold leaf on midnight blue-black, high contrast, recognizable as a silhouette, hand-painted on aged parchment, dark academia, alchemical grimoire style, dramatic chiaroscuro, no text, no border, museum quality --ar 1:1 --style raw --v 6
```

### A2 — The Sovereign (boss · the marquee marketing image — iterate this the most)
`art-slots/enemy-sovereign.png`
```
baroque portrait of a regal silhouette wearing a crown of seven runes, robed in shadow, eyes closed but somehow watching, throne implied, black and gold with a single red highlight, the most ornate piece in the game, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, unsettling but dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6
```

### A3–A11 — The 9 starter runes (in every player's opening hand — highest screen time)

| Save as | Full prompt |
|---|---|
| `art-slots/rune-ember.png` | `ancient illuminated sigil of a small candle flame caught between two fingertips, warm orange glow, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-drop.png` | `ancient illuminated sigil of a single suspended water droplet with concentric ripple lines beneath it, cool blue and silver linework, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-stone.png` | `ancient illuminated sigil of an angular polyhedron of carved stone with moss creeping along its edges set inside a perfect circle, earthen brown palette, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-gust.png` | `ancient illuminated sigil of three curving wind lines emerging from a central point, delicate pale grey-blue ink, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-hollow.png` | `ancient illuminated sigil of a perfect circle with absolute darkness inside ringed by tiny tally marks like a clock face, deep purple-black, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-ray.png` | `ancient illuminated sigil of a six-pointed star with one elongated golden ray and halation glow, golden filament, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-veil.png` | `ancient illuminated sigil of a crescent moon partially obscured by a horizontal drape of darkness, indigo and silver, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-tally.png` | `ancient illuminated sigil of a precise cross with four small Roman numerals at the points, gold leaf on cream parchment, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-roll.png` | `ancient illuminated sigil of a many-sided polyhedral die mid-tumble surrounded by random tally marks, magenta and gold sparks, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |

### A12–A14 — The 3 Tier-1 enemies (every run fights these first)

| Save as | Full prompt |
|---|---|
| `art-slots/enemy-cinder.png` | `baroque portrait of a small hunched being made of soot and coal embers with glowing orange light inside its chest cavity, reluctant posture, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, unsettling but dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6` |
| `art-slots/enemy-wisp.png` | `baroque portrait of a ghostly translucent half-formed figure drifting upward, pale ice-blue, disinterested presence suggested but no clear face, ethereal, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, unsettling but dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6` |
| `art-slots/enemy-fenmote.png` | `baroque portrait of a small mossy stone-skinned creature with lichen growing on its shoulders, stubborn squat posture, forest greens and mineral browns, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, unsettling but dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6` |

---

# BATCH B — MID GAME (13 images)

9 uncommon runes + the 4 Tier-2/3 enemies. Add live, post-launch.

| Save as | Full prompt |
|---|---|
| `art-slots/rune-echo.png` | `ancient illuminated sigil of a bell shape with three concentric ripple-bells emerging from its base, brass gold ink, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-mirror.png` | `ancient illuminated sigil of two crescents forming a yin-yang of cracked mirror glass, iridescent fractures, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-surge.png` | `ancient illuminated sigil of an eight-petaled starburst of flame with a hot white center and vermillion radiating outward, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-cascade.png` | `ancient illuminated sigil of a vertical chain of three diminishing water droplets connected by wavy lines, aquamarine, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-anchor.png` | `ancient illuminated sigil of a heraldic anchor-cross with roots growing into the earth below it, bronze and umber, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-drift.png` | `ancient illuminated sigil of a single feather pulled by an unseen current leaving a curving silver trail behind it, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-drain.png` | `ancient illuminated sigil of a downward spiral of dark liquid disappearing into a small drain glyph at the bottom, deep purple, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-beacon.png` | `ancient illuminated sigil of a lighthouse-style burst with twelve evenly spaced rays radiating from a hot golden center, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-sympathy.png` | `ancient illuminated sigil of two infinity-loops intertwined, one bright silver and one dark violet, slight rotation, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/enemy-wight.png` | `baroque portrait of a robed figure with too many teeth visible through a dark hood, no eyes, tatters of black cloth, purple-black palette with bone-white teeth highlight, unsettling, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6` |
| `art-slots/enemy-sirenshade.png` | `baroque portrait of a water-haired figure half-submerged with mouth open in song but the shape is wrong, deep blue-green, scaled details, eerie, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, unsettling but dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6` |
| `art-slots/enemy-revenant.png` | `baroque portrait of a man-shaped automaton of brass with a hollow interior visible and a bell-mouth where the head should be, verdigris and gold patina, stoic regal pose, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, unsettling but dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6` |
| `art-slots/enemy-glasswyrm.png` | `baroque portrait of a serpentine creature made of fractured stained glass with multiple eye-shapes embedded across its body, iridescent cracked surfaces, painted in shadow and candlelight, dark academic library setting, ornate frame implied, oil painting texture, dramatic light from one side, unsettling but dignified, mythological grimoire, no text --ar 1:1 --style raw --v 6` |

---

# BATCH C — ENDGAME PAYOFF (12 images)

8 rare + 4 mythic runes. These are the "broken combo" reward art — **iterate the 4 mythics the most**, they're the screenshot-bait moments players share.

### Rare (8)

| Save as | Full prompt |
|---|---|
| `art-slots/rune-ouroboros.png` | `ancient illuminated sigil of a serpent biting its own tail, scales detailed as small alchemical sigils, crimson and gold leaf, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-twin.png` | `ancient illuminated sigil of two identical sigils overlapping at center with a slight rotational offset, mirror-bright gold, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-triskel.png` | `ancient illuminated sigil of three interlocked spirals forming a Celtic triskelion, gold leaf on green-black, illuminated manuscript style, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-wildfire.png` | `ancient illuminated sigil of flames forming a chain of small running figures sweeping across the sigil, vermillion and ash, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-tidewall.png` | `ancient illuminated sigil of a vertical wall of cresting wave with foam at the top, Hokusai-inspired, deep blue base, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-quake.png` | `ancient illuminated sigil of cracked ground in an eight-pointed fracture pattern with deep cracks showing molten gold beneath, sandstone and ash, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-tempest.png` | `ancient illuminated sigil of three lightning bolts forming a triangle around a small tornado funnel at the center, cyan and steel, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-eclipse.png` | `ancient illuminated sigil of a perfect black disc with a corona ring around it and a single golden tear of light at the three o'clock position, astral painting, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, dark border edge, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |

### Mythic (4) — highest detail, iterate most

| Save as | Full prompt |
|---|---|
| `art-slots/rune-recursion.png` | `ancient illuminated sigil of a spiral that nests into itself infinitely, Escher-impossible geometry, gold ink on indigo, sacred geometry, extremely detailed, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, prismatic iridescent edges, glowing, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-pandemonium.png` | `ancient illuminated sigil of a crown of seven different sigils orbiting a central void, asymmetric chaotic arrangement, black gold ink, slightly menacing, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, prismatic iridescent edges, glowing, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-singularity.png` | `ancient illuminated sigil of a pinprick of pure white light pulling all surrounding lines toward it, accretion disc effect, deep violet bleeding to a white center, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, prismatic iridescent edges, glowing, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |
| `art-slots/rune-aurora.png` | `ancient illuminated sigil of a radiant crown of nine colored rays arranged in a halo, prismatic iridescent gold, the most ornate piece in the codex, hand-painted on aged parchment, dark academia, gold leaf accents, alchemical grimoire style, intricate linework, centered composition, dramatic chiaroscuro, single rune isolated against dark background, prismatic iridescent edges, glowing, no text, no border, painterly, museum quality --ar 1:1 --style raw --v 6` |

---

## App icons — you do NOT make these
Once `art-slots/title-mark.png` exists, tell me and I run `tools/make-icons.mjs`, which generates
`art-slots/icon-192.png` and `art-slots/icon-512.png` (maskable-safe padding) automatically.

## Progress tracker

| Batch | Images | Status | Unlocks |
|---|---|---|---|
| A — Launch set | 14 | ☐ | Ship: first act fully illustrated + store hero art |
| B — Mid game | 13 | ☐ | Encounters 4–12 illustrated |
| C — Endgame payoff | 12 | ☐ | Rare/mythic reward art, share-bait |
| Icons | auto | ☐ | Derived from title-mark by Claude |

Total: **39** + 2 auto icons.

**How art goes live:** dropping a PNG into `art-slots/` shows instantly on a local refresh. For the
deployed site, the file has to be re-uploaded to the host — once we pick a host I'll wire a one-command
(or auto) deploy so you just drop files and run it. New art files load fine on first visit; if we ever
*replace* an existing file we bump the service-worker cache version so players get the new one.
