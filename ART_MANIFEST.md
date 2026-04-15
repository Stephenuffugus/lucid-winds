# Lucid Winds — Running Art Manifest

**Maintainer:** Claude (auto-updated during sessions)
**For:** Jessie + Stephen's Midjourney/ChatGPT/Gemini pipelines
**Aesthetic anchor:** midnight-greenhouse — deep blacks (#0d100c), sage greens (#7ab356), warm gold (#c8a84b), cream (#e8dcc8), painterly botanical, no text on art, transparent or near-black backgrounds unless otherwise noted.
**Image handling rule:** drop at source resolution. Never resize, never compress. Code scales down.

Each entry: **slot** · **subject** · **dimensions** · **destination path** · **priority (P0=blocker, P1=next, P2=polish)**

---

## ✅ Shipped / wired (do NOT regenerate)

- **10 biome paintings** — `assets/wild-biomes/biome-{african,asian,coastal,desert,mountain,rainforest,suburban,temperate,tundra,wetland}.png` — wired into Wild hex inspector banner + BIOMES catalog
- **5 Keeper hero-milestone cards** — `assets/hero-cards/hero-{path-opened,second-bloom,gilding,near-horizon,long-watch}.png`
- **Book of Secrets spellbook cover** — `assets/bos/spellbook-cover.png`
- **5 class emblems** — `assets/character-sheet/classes/{forager,breeder,cartographer,tender,keeper}.png` — cut out at source res, render at 64/160px
- 15 FLUX backgrounds (tab bgs, onboarding beats, splash)
- 21-card deck + card backs (per memory)

---

## P0 — Active priorities

### ⚜️ 13 Mutation Symbols (you're making now)
- Format: **96×96 PNG**, transparent background, simple pictogram style
- Destination: `assets/mutations/mutation-{slug}.png`
- Code automatically uses these when they land — falls back to emoji glyph until then
- Slug = lowercase-hyphenated: "Glass Stem" → `glass-stem`, "Pixel Art" → `pixel-art`

| Slug | Mutation | Core visual idea |
|---|---|---|
| glitch | Glitch | a leaf fractured into 3 offset copies, RGB shift |
| glass-stem | Glass Stem | a translucent glass cylinder with a plant inside |
| wireframe | Wireframe | a leaf outline made of bright edges only, no fill |
| holographic | Holographic | a prism refracting light into a spectrum |
| neon | Neon | a bloom silhouette in hot pink + electric cyan glow |
| ink-wash | Ink Wash | a single brush-stroke leaf with bleed marks |
| golden | Golden | a leaf dipped in liquid gold, sheen visible |
| porcelain | Porcelain | a glazed white ceramic leaf with hairline crackle |
| bioluminescent | Bioluminescent | a leaf glowing against pure black |
| pixel-art | Pixel Art | a chunky low-res 8-bit leaf sprite |
| silhouette | Silhouette | a pure black leaf with a starfield interior |
| albino | Albino | a pale ghostly leaf with faint white vein tracery |
| fossil | Fossil | a leaf imprint in cracked stone |

---

## P1 — Next priority when you're free

### Event discovery scroll icon
- **64×64 or 128×128 flat icon**, transparent PNG
- Destination: `assets/bos/event-scroll-icon.png`
- Unfurled scroll with a wax seal stamped with a botanical sigil, warm gold ink
- Replaces 📜 emoji everywhere event discovery shows up (currently unused — system went silent)
- Could be repurposed: a small decorative flourish in the BoS sparkline header

### 6 Foraging Element Card Faces
- **512×512 PNG transparent**, symbol-only (card frame is already built in CSS)
- Destination: `assets/foraging/el-{slug}.png`
- Think medieval tarot minor arcana — one bold center glyph per card

| Slug | Element | Core motif |
|---|---|---|
| sun | Sun | radiant sun with botanical rays, or a single sunflower facing forward |
| shade | Shade | crescent moon behind a fern frond, or a dappled-leaf silhouette |
| rain | Rain | three falling droplets making concentric ripples |
| dry | Dry | a seed-pod cracked open in heat, or agave spear in silhouette |
| wind | Wind | dandelion seeds mid-release, or a whorl of leaves |
| still | Still | a single lotus on flat water, reflection visible |

### 3 Rare Wild-Cards
- Same format + destination pattern, `.rare` variant in CSS adds gold glow
- moonlight: full moon with pale blue botanical etching on its face
- thunder: lightning bolt splitting a seed pod
- dust: geometric spiral of fine particles

### 4 Weather Cast Button Art
- **128×128 plate-style illustration**, transparent background
- Destination: `assets/weather/weather-{slug}.png`

| Slug | Weather | Visual direction |
|---|---|---|
| sun | Sun / Shine | full sun over a bowl of sprouts, warm amber |
| rain | Rain | three clouds releasing diagonal rain over seedlings |
| wind | Wind | curved wind-line streams pushing a seed-puff |
| calm | Calm | still pond reflection with a single lily, absolute quiet |

---

## P2 — Polish (do last)

### Reader Component Corner Flourishes
- **2 PNGs**, 128×128 transparent background, gold ink
- Destination: `assets/ui/reader-flourish-{tl,tr}.png`
- Simple Celtic leaf flourish — one facing top-left, mirror for top-right
- Replaces the triquetra placeholder in the shared modal frame

### Pot Shop vessel art refresh (60 pots)
- 256×256 per pot, `assets/pots/pot-{slug}.png`
- Check `PW_UI.pots` data for the slug list
- ⚠️ **Dice 5/6 lock reminder**: check similar asset locks before any replacement

### Herbarium bundle cover cards (12)
- 3:2 landscape ~400×260, `assets/herbarium/bundle-{idx}.png`
- Painterly pressed-flower composition per bundle theme

### Celebration FX sprites
- Stephen has Midjourney prompts saved (memory: `project_celebration_art_prompts.md`)
- Sparkle · petal · leaf · ring — 4 PNG sprite sheets 128×128 each
- Destination: `assets/celebrations/{element}-sprite.png`

---

## Deferred (dedicated session later)

- **Full SVG art audit** — companions, leaves, flowers, stems. Stephen wants to perfect all procedural art in a focused pass.
- **62 companion portraits (real-photo style)** — Book of Secrets tap-for-real-photo view. Defer until SVG audit is done.
- **Repello board + pieces** — waiting on Stephen's board close-ups + color→number mapping

---

## Naming convention notes

- Lowercase, hyphenated, descriptive
- Slug matches the code key when possible
- Drop at source resolution — code resizes, Claude never compresses originals (see `feedback_never_overshrink.md`)
- Use `scripts/cutout-bg.py` for Midjourney bg removal (see `reference_cutout_script.md`)
