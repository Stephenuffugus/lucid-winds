# Flatulence Fighter — Art Pack

> Hold it in. Plug the leaks. Vent only under cover of noise. Any sound the room hears is a strike — played completely straight, as a silent film.

**Genre:** two-thumb composure game (single-file HTML/CSS/JS, portrait, max-width 560px). Pressure only ever climbs; the player clenches two pads (each hand tires and must rest), plugs leak bubbles before they squeak, and VENTs only during a cover noise (applause, thunder, a passing bus). Three ability buttons deepen it: **FAKE COUGH** 😷 (make your own short cover), **SIP** 🥤 (hold to drain pressure but both hands leave the pads), **WAFT** 🪭 (fan away a fresh strike in a 1.6s window). Modes: Stage (Easy/Normal/Panic), seeded Daily Ordeal, no-fail Zen Theater, and One Cheek (one pad benched, swapping every 15s). 12 scenes (Funeral → Baby's Nap), 18 medals, an animated SVG face that degrades through calm → nervous → strain → critical → blowout → relief.

_The game already ships and plays fully procedurally (`satellites/flatulence-fighter/index.html`, all UI is CSS + one inline SVG face; audio is synthesized) — this art is an optional visual upgrade **and** the catalog for the wardrobe economy. Mechanics, layouts, hitboxes and copy are IDENTICAL across every theme; only the skin changes._

## Pick a look — theme direction

### 1. Silent Reel ⭐ RECOMMENDED (cozy-classic, lowest risk)
*The game's own conceit, fully committed: a 1920s silent picture. Aged paper and sepia gouache, hand-inked title-card flourishes, subtle film grain and sprocket-edge vignettes, iris-in circles for moments of shame. The face is a vaudeville player in greasepaint; scenes are painted theater flats (a chapel, a radio booth, an elevator); ability buttons are brass-and-ivory theater fittings.*

**Why this one:** the shipped palette IS this look already (paper `#e7e0cb` → `#c7bd9c`, sage `#37493d` → `#1c2620`, amber `#e0902f`), so every sheet drops onto the live CSS with zero re-tinting and the fiction ("make no sound — like a silent film") does comedic work for free. It reads instantly on a portal card, it's kid-friendly without being childish, and the wardrobe (Gentleman, Grandma, Mime, Bulldog) is native to a vaudeville troupe. **All sheets below bake this look in.**

### 2. Vaudeville Velvet (alt, more polished / mature)
*A richer stage-theater dressing: deep velvet curtain reds and warm brass golds, a proscenium arch framing the face like a spotlight act, footlight glow from below.* Handsome and premium, but it pulls the palette away from the shipped paper-sage CSS variables (real re-integration work), and the red field fights the crimson strike/danger language the game relies on.

### 3. Sunday Funnies (alt, cozy-comic)
*Halftone newsprint comic strip: Ben-Day dots, bold ink outlines, a four-color face.* Very funny and very readable, but the halftone texture gets noisy under the sweat/shake/flood effects, and it's the least distinctive next to the portal's other cozy cards.

**Recommendation: Silent Reel.** It's already half-shipped (palette, serif type, title cards), costs near-zero integration, and is the funniest fit for a game about staying silent. Hold Vaudeville Velvet in reserve as a premium unlockable palette.

## Sheets (generate each separately)

- `01-ff-faces.md` — The five characters + accessory cutouts on the shared expression rig — the core sprites
- `02-ff-backdrops.md` — Scene backdrops and screen plates — full-bleed portrait (12 scenes + title/over/menu moods)
- `03-ff-ui.md` — UI plates — clench pads, VENT bar, ability buttons, strike pips, gauge, banner, cards
- `04-ff-fx.md` — FX and feedback — the 11 cover-noise icons, sweat, leak bubbles, waft swoosh, whiff swirl
- `05-ff-cosmetics.md` — Wardrobe cards, character portraits, palette plaques — 💰 COSMETICS / ECONOMY

## Cosmetics economy

Every Flatulence Fighter cosmetic is earned by **PLAYING** — no loot boxes, no randomized purchases, nothing that touches timing, pressure math, strikes or Sunbeam payouts. Every unlock is a **KNOWN threshold shown right on its locked wardrobe card**. Two families, persisted in `localStorage` key **`ff_save`** (`{chars[], pals[], eqChar, eqPal}`), unlock checks run at game over and on opening the Wardrobe:

- **Characters** (`CHARS`, equip swaps the SVG face skin + decor layers; every expression state works for every character): *The Everyman* (free) → **The Gentleman** 🎩 (10 min lifetime composure, `ff.l.time ≥ 600`) → **Grandma** 👵 (50 lifetime leaks plugged, `ff.l.plugs ≥ 50`) → **The Mime** 🎭 (3-day Daily streak, `ff.l.beststreak ≥ 3`) → **The Bulldog** 🐶 (8 medals earned).
- **Theater palettes** (`PALS`, CSS-variable retints of the whole set): *Matinee Sepia* (free) → **Midnight Show** 🌙 (reach Act V, `ff.l.bestact ≥ 5`) → **Technicolor** 🌈 (score 5000 in one ordeal) → **Silver Screen** 🎬 (play Easy, Normal, Panic, Daily and Zen).

Faucets: lifetime hold time, lifetime plugs, Daily streak, medal count, deepest act, best score, and mode variety — every one already persists offline-safe. Sunbeams stay the earn currency only (`_sbCapEarn`, 30/day shared cap, run payout capped at 12) and are never spent on cosmetics.

## Style block

```
STYLE — "Silent Reel" (Flatulence Fighter / Lucid Games silent-film composure comedy). A 1920s silent picture painted in aged-paper gouache: warm sepia paper fields, hand-inked lines, soft film grain, gentle iris-vignette corners; everything reads like a title card from a vaudeville comedy, played completely straight. Chunky, rounded, huggable silhouettes; crisp dark sage ink outlines; ONE soft top-light per subject, matte paper texture, no gloss. Faces are expressive vaudeville players in light greasepaint — big readable emotions at thumbnail size, never grotesque, never gross (this is a composure comedy: sweat, blushes and pursed lips, NOT toilet imagery). Consistent flat front-on stage camera, subjects centered and upright in their cells. Palette (matches the live CSS exactly): paper #e7e0cb / #d8cfb2 / #c7bd9c, sage greens #37493d / #2b3a31 / #1c2620, ink #221f18, amber spotlight #e0902f, crimson strike #c0392b, mint relief #5fd0b0 / #2c9d80, face skin #e8c9a0 with #b98f61 lines, sweat blue #7fc7e8 / #4a9bc4, greasepaint cream #f4f0e6, brass #c8a84b. Lighting is warm stage-key from top-center with soft paper shadow below. Rendering: flat gouache + ink, subtle grain, NO photoreal, NO neon, NO text / letters / numbers / logos / watermarks baked into any art (icons are pictographic only). Each PNG must compress under 150KB — flat paper fields make this easy. Per-sheet knockout / gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the CSS/SVG draws in `/workspaces/lucid-winds/satellites/flatulence-fighter/index.html`; keep every existing CSS/SVG fallback as an absent-asset safety net (gate each swap behind an image-loaded check). All copy and emoji glyphs are owned by code and stay as-is. Asset folder: `/workspaces/lucid-winds/satellites/flatulence-fighter/assets/` (subfolders `faces/`, `bg/`, `ui/`, `fx/`, `cosmetics/`). Path-version every file (`?v=BUILD`) per the Hostinger resizer rule; ship only the <150KB cut cells, keep master sheets out of the live web path. Map:
- `ff_faces.png` → the inline `#face` SVG rig (line ~284; expression groups `.v-calm/.v-nervous/.v-strain/.v-critical/.v-blowout/.v-relief`, decor layers `#decorBack`/`#decorFront`, skin recolor via `applyCharacter()` line ~949) — art replaces the SVG face with layered images per tier, or supplies accessory overlays composited on the rig.
- `ff_bg.png` set → `#app` paper gradient + `::before` wallpaper stripes (line ~26), the intertitle `#introScreen` card, `#startScreen`/`#overScreen` cards; 12 scene moods keyed by `SCENES` index (line ~465).
- `ff_ui.png` → `.pad` clench pads (line ~356), `.vent` bar (line ~359), `.ability` buttons (line ~344), `.pip` strikes, `.gauge-track/.gauge-fill`, `.cover-banner` plate (line ~337), `.card` double-line frame, `.toast` pill.
- `ff_fx.png` → the 11 `COVER_TYPES` icons (line ~450), `.leak` ring + core, sweat drops (`.sweatdrop`), waft swoosh + whiff swirl (`floatText` moments), `#flood` shame vignette tint, combo callout flourishes.
- `ff_cosmetics.png` → wardrobe `.ward-card` frames/lock/equipped badge, the five `CHARS` portraits and four `PALS` plaques (lines ~540-563, `buildWard()`).

Bump the asset cache version on any art change and cache-bust `img.src` with `?v=BUILD`.
