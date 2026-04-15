# Lucid Winds — Running Art Manifest

**Maintainer:** Claude (auto-updated during sessions)
**For:** Jessie + Stephen's Midjourney/ChatGPT/Gemini pipelines
**Aesthetic anchor:** midnight-greenhouse — deep blacks (#0d100c), sage greens (#7ab356), warm gold (#c8a84b), cream (#e8dcc8), painterly botanical, no text on art, transparent or near-black backgrounds unless otherwise noted.

Each entry: **slot** · **subject** · **dimensions** · **destination path** · **priority (P0=blocker, P1=next, P2=polish)**

---

## P0 — Blocking or near-blocking

### Biome headers (Wild tab) — 10 banners
- 4:1 aspect, ~1600×400 preferred, PNG with alpha OR full-bleed painterly
- Destination: `assets/wild-biomes/biome-{slug}.png`
- **No text in the art** — the code composites biome name in Playfair

| Slug | Biome | Notes |
|---|---|---|
| african | African savanna | acacia silhouettes, tall grass, warm ochre in the gold accent |
| asian | Asian bamboo forest | bamboo, ferns, mist, cooler green-teal |
| desert | Desert (succulents / agave) | cracked earth, prickly pear, agave spears |
| rainforest | Rainforest canopy | dense layered foliage, bromeliads, deep emerald |
| tundra | Tundra (lichen + moss) | rock, frost-touched grass, pale sage |
| temperate | Temperate deciduous forest | oak + maple, dappled light, autumn hints acceptable |
| wetland | Freshwater wetland | reeds, lily pads, mirror-still water |
| mountain | Alpine mountain scree | hardy wildflowers, scree slope, distant peak |
| suburban | Suburban garden | fence, planter boxes, gardening tools |
| coastal | Coastal dunes | beach grass, driftwood, washed silver-green |

### Companion art — Cicada polish + full roster
Cicada (idx 33) currently `cicada-v1-a.png` placeholder. **Stephen's direction**: use SVG for in-game, but add REAL photos in the Book of Secrets when someone taps a companion's profile.
- **Cicada** — one hero macro-photo-style illustration · `assets/companions/cicada.png` · 1:1 square, 512×512 min
- **60+ standard companions** (idx 20–31, 39–81) — currently emoji fallback. Bio-book portraits only, low urgency per Stephen's note. Hold until P2.

---

## P1 — Next priority (UI skinning / milestone polish)

### Class emblem icons (replaces emoji 🍂🧬🧭💧🌿)
- 1:1, transparent PNG, 256×256, ornate heraldic circular emblem
- Destination: `assets/classes/class-{slug}.png`
- Current: each class uses its emoji in the keeper bar, class picker, avatar badge

| Slug | Class | Symbol direction |
|---|---|---|
| forager | Forager | oak leaf + acorn inside a woven-basket ring |
| breeder | Breeder | double helix of two flowering vines crossing |
| cartographer | Cartographer | compass rose made of fern fronds |
| tender | Tender | watering can pouring a single dewdrop |
| keeper | Keeper | small sun over a greenhouse dome |

### Onboarding scroll-sized hero variants (if we add Lv 5/15/35 mini-beats)
Deferred. Only queue if we decide to expand milestones.

### Event discovery toast icon
- 64×64 or 128×128, transparent PNG · `assets/bos/event-discovery-icon.png`
- Unfurled scroll with wax seal (botanical sigil, warm gold ink, sage accents)
- Replaces 📜 emoji in the `LW_Events.fire()` toast

### Active Foraging deck card-back art
- Foraging inventory cards currently render as colored pills. Want a real "card back" per element.
- 5:7 portrait, 256×360, transparent PNG · `assets/foraging/card-back-{element}.png`
- Elements: sun, shade, rain, dry, wind, still
- Subject: stylized elemental glyph with botanical frame, matches Celtic-knot border in greenhouse

---

## P2 — Polish (do last)

### Pot Shop vessel art refresh
- Current pots work but feel placeholder. Check `PW_UI.pots` data for the 8 pot types and render each as a 256×256 hero image with gold/sage palette.
- Destination: `assets/pots/pot-{slug}.png`
- **⚠️ FEEDBACK MEMORY: dice 5/6 are locked — check similar locks before any pot replacement**

### Herbarium bundle cover cards
- 12 weekly bundles in Book of Secrets → Herbarium tab
- 3:2 landscape, ~400×260, painterly pressed-flower composition per bundle theme
- Destination: `assets/herbarium/bundle-{idx}.png`

### Celebration FX (for mint/breed/milestone)
- Stephen has Midjourney prompts saved (see memory `project_celebration_art_prompts.md`)
- Sparkle · petal · leaf · ring — 4 PNG sprite sheets 128×128 each
- Destination: `assets/celebrations/{element}-sprite.png`

### Repello board + pieces (not started yet, blocked on Stephen's design drop)
- 13×13 grid background, 7×7 start zone overlay, scoring tokens, pest pieces
- Deferred until Stephen delivers board close-ups and color→number mapping

### Standard companion portraits (Book of Secrets real-photo tab)
- Per Stephen's direction: tapping a companion shows a real-photo illustration
- 60+ companions, 1:1 square, 400×400 min, painterly macro style
- Destination: `assets/companions/real/{idx}-{slug}.png`
- Low urgency — SVG fallback ships fine

---

## Already wired (for reference — do not re-generate)

- 15 FLUX backgrounds (tab backgrounds, onboarding beats, splash)
- 5 Keeper hero-milestone cards: `assets/hero-cards/hero-{path-opened,second-bloom,gilding,near-horizon,long-watch}.png`
- Book of Secrets spellbook cover: `assets/bos/spellbook-cover.png`
- All 15 CLAUDE.md-tracked core assets
- 21-card full deck (done per memory)
- Card backs (done)
- Cicada v1-a placeholder (needs replacement — see P0)

---

## Naming convention notes for Jessie

- Lowercase, hyphenated, descriptive
- Slug matches the code key when possible (e.g. `forager` not `Forager_v3_final`)
- Drop at source resolution — code resizes, Claude never compresses originals (see `feedback_never_overshrink.md`)
- Use `scripts/cutout-bg.py` for Midjourney bg removal (see `reference_cutout_script.md`)
