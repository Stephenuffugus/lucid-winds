# Seed Flutter — Art Pack

> Tap to lift a tiny drifter on the night wind, thread the paired gaps, and thread the CENTER for a Perfect that blooms a keepsake and climbs your Bloomstreak — drifting through four changing skies with a floating companion at your side.

**Genre:** One-tap "flappy" arcade drifter (single-file HTML5 canvas, 540×960 portrait). A light hero taps/rises and drifts down through paired vertical obstacles with a gap; center-threading a gap = a **Perfect** (slow-mo, a bloom rides the obstacle, **Bloomstreak** +1). Four-phase cross-fade + rising wind; a floating companion with a soft passive; Perfect streaks grow keepsakes into a persistent gallery ("Grove"). Modes: **Endless Drift, Daily Gust, Gauntlet** (4 legs / 4 phases with oscillating boss gates), **Zen** (no-fail).

_The game already ships and plays procedurally (`satellites/seed-flutter/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game customization economy. Mechanics, hitboxes and layout stay 100% identical; only the SKIN theme changes._

---

## ⛔ THEME DIRECTION (Stephen, this session)

Move AWAY from forced botanical. The game plays as a gentle drifter with a natural fantasy — *a small glowing thing floating up through a changing night, threading gaps, a soft glow trail behind it, never a hard crash.* That fantasy re-skins cleanly into a **night-sky / cosmic** world without touching a single hitbox: the dandelion seed's "pappus tuft + glowing body" is already 1:1 a **comet head + ray-fan**, the trail is already a **comet tail**, the four seasons are already four **sky phases**, and the keepsake blooms become **collected stars**. Below are three looks; the recommended one is bold, catchy, kid-friendly and non-botanical.

## Pick a look

### 1. Comet Cadets ⭐ RECOMMENDED  (bold · non-botanical · Sky Wolf night-sky arcade)
*Starlit layered-papercraft night-sky arcade. The hero is a plucky little **Comet Cadet** — a rounded cream-gold glowing head with a soft radiant fan of light-rays (the old pappus tuft) — tapping UP through a starry night, threading between glowing **crystal star-spires**, and threading the center **Star** for a Perfect that ignites into a keepsake constellation. Four **sky phases** (Rosedawn / Goldveil / Meteor / Frostnight) cross-fade as the wind rises; a floating sky-buddy drifts alongside; earned stars fill a **Sky Map**. Same cut-paper flat-fill rendering as our other satellites, but unmistakably COSMIC, not a plant in sight.*

**Why this one.** (1) It is a *free* reskin — the code's own draw calls map 1:1: pappus tuft → ray-fan, trail crumbs → comet tail, gap bud → thread-star, `drawFlower` keepsakes → keepsake stars, the four `SEASONS` tints → four sky phases, moon/hills/fireflies → moon/ridges/starfield. Nothing about the physics or grid moves. (2) The locked midnight palette (`#0d100c`/`#05070a`, gold, cream, dew-blue) already reads as a *night sky* — so this is the smallest possible palette shift off the shipping look while being clearly non-botanical. (3) It's catchy and ownable: "Comet Cadets" gives Sky Wolf Studios a signature night-sky arcade identity that isn't "another garden game," and the **Star-Pup** companion is a wink at the Sky Wolf name. (4) Kid-friendly and cozy — soft glows, rounded shapes, nothing scary or spiky, a Perfect is a warm little star-bloom, the fail is a gentle drift-down. **All sheets below bake this look in.**

### 2. Candy Cloudhop  (cozy alt · non-botanical)
*A round marshmallow-puff hero bobs UP through a pastel sweet-shop sky, threading between striped candy-cane pillars and licorice gates; a Perfect pops a lollipop-bloom; four candy-lands rotate.* Maximum kid-magnet warmth and instantly readable, but it drops the moody midnight palette the rest of the portal shares (higher-key pastels can look "off-brand" next to the other satellites), and fine hazards read a touch flatter at gameplay scale.

### 3. Dandelion Nocturne  (the shipping botanical look · reference / fallback)
*The current procedural style leveled up: layered-papercut dandelion seed on the night wind, reed-spire gaps, keepsake blooms, seasonal washes.* Elegant and native to Lucid Winds, but it keeps the game firmly botanical — the thing Stephen asked us to move away from. Kept here only as the drop-in fallback if the reskin is deferred.

**→ Recommended: Comet Cadets.** Bold, catchy, non-botanical, kid-cozy, and the cheapest to integrate because every existing draw call has a 1:1 cosmic analogue. Sheets here use this look; swap the STYLE line to try another.

## Sheets (generate each separately)

- `01-seedflutter-sprites.md` — Core Gameplay Sprites — comet cadet, star-spires, thread-stars, moon, ridges, horizon
- `02-seedflutter-cosmetics.md` — Keepsake Stars & Skins — Sky-Map stars + comet/tail/companion cosmetics — 💰 COSMETICS / ECONOMY
- `03-seedflutter-backgrounds.md` — Backgrounds & Screens — Full-Bleed Portrait + 4 sky-phase washes
- `04-seedflutter-ui.md` — UI / HUD — buttons, mode icons, plaques, pips, cards
- `05-seedflutter-fx.md` — FX & Feedback — flap puff, Perfect star-burst, comet-tail mote, bloom flash, weather, vignette

## Cosmetics economy

All Seed Flutter cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, no pay-to-win, nothing that touches a gap's size, the wind, or the payout. Everything is a KNOWN unlock at a KNOWN threshold (the code already stores them in `seedflutter_save`), so a kid always sees exactly what they're working toward. Faucets, matching what ships: (1) **Distance mastery** — comet/tail/companion skins unlock at rising best-distance (gaps threaded): comet **Amber** at 40, **Rose Nova** at 80; tail **Rosefall** at 12; companion **Moon-Moth** at 25 (widens the Perfect band), **Sky-Koi** at 60 (one soft recovery). (2) **Grove/keepsake mastery** — the keepsake-STAR roster and glow skins unlock by lifetime keepsakes grown: tail **Emberspark** at 5, companion **Sparklet** at 10 (lights the haze), comet **Frost Comet** at 20; new keepsake-star silhouettes seed in as the Sky Map fills, so the loop that grows the collection also dresses up the tools that fill it. (3) **Daily-streak mastery** — the Daily Gust streak drips the lapsed-friendly rewards: tail **Prism Tail** at a 3-day streak, and (proposed, streak-milestone) a rotating sky-phase flourish, giving reasons to return. Optional soft-coin: the portal's existing **Dew** (never Sunbeams — Sunbeams stay the earn/collection currency, 30/day cap, 12/run via `_sbCapEarn`) can OPTIONALLY early-unlock a *currently rotating* streak cosmetic a little ahead of its gate — pure convenience, capped to the rotating set, every item still fully free by playing. Companions carry the existing passives (wider Perfect band / lights haze / one soft recovery) — cosmetic-with-a-tiny-passive, never pay-to-win, never RNG. Equipped ids persist in `seedflutter_save` (`seed`/`trail`/`comp`) so it's free to store and needs no server write.

## Style block

```
STYLE — "Comet Cadets" (Seed Flutter / Sky Wolf Studios starlit night-sky papercraft). Bold kid-friendly COSMIC layered cut-paper art — every subject built from 3-5 stacked flat paper layers in clean rounded silhouettes, with a soft backlit rim-glow leaking between the layers as if lit from behind by starlight, plus a warm glow from the subject's own light. Crisp FLAT fills (NO photoreal gradients, NO glossy 3D render, NO harsh black keylines, NO neon-blown bloom), gentle paper grain, a subtle soft shadow between stacked layers for depth; every shape must read instantly at thumbnail size and at 540x960 phone scale. NON-BOTANICAL night-sky world: comets, crystal star-spires, stars, moon, aurora, meteor dust — NOT plants, NOT flowers, NOT reeds. Consistent flat front-on / slight-side camera, each subject centered and upright in its cell. Deep-night palette — void #0d100c and #05070a, night-blue #0f1622 / #080b12; starlight cream #e8dcc8, hot core #ffe9a8, lantern gold #c8a84b; luminous star-dew #bfe0f2 over moon-blue #5b9bd5 and deep #2b567c; comet-rose #e58fa0, soft violet #b57de0, warning-core red #e56b6b; spire-crystal cool #5b9bd5/#bfe0f2 with cream rims; muted dusk line #2a331f. Sky-phase tints — Rosedawn #E8A0BF, Goldveil #D4A843, Meteor copper #D4842A, Frostnight ice #A0C4E8. Lighting is nocturnal: paper edges catch a thin cream/gold rim-glow, comets and stars emit a soft radial bloom contained to themselves, everything else stays low-key and moody. Kid-cozy, never scary, never spiky-cruel; the boss gate reads "stern" via gold/red rim, not menace. Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons are pictographic only). Each PNG must compress under 150KB — flat fills and a tight palette make this easy. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural draws in `/workspaces/lucid-winds/satellites/seed-flutter/index.html`; keep the canvas fallbacks as absent-asset safety nets (gate each blit behind an image-loaded check). Asset folder: `/workspaces/lucid-winds/satellites/seed-flutter/assets/` (subfolders `sprites/`, `cosmetics/`, `backgrounds/`, `ui/`, `fx/`). Path-version every file (`?v=BUILD`) per the Hostinger resizer rule; ship only the <150KB cut cells, keep master sheets out of the live web path. Map:

- `seedflutter_sprites.png` → **`drawSeed()`** (the comet cadet — pappus tuft becomes the ray-fan, body ellipse becomes the glowing head, keyed to `G.ang` rotation & flap pose); **`drawStem()` / `reed()`** (the paired star-spires — top spire + bottom spire, plus the STEM_W=66 seamless body tile and the gap-facing cap); the **gap bud** pulsing dot inside `drawStem` (`s.scored===false`) → thread-star normal + boss variant; the boss spire (`s.boss`, gold edge + oscillation); the **moon** (`render()` arc at 430,150), **`drawHills()`** parallax ridges (2 layers), the **ground** strip (`GROUND`), and the ambient **fireflies** loop → starfield twinkles.
- `seedflutter_cosmetics.png` → **`drawFlower()`** keyed by seed (the Perfect **`spawnFlowerAt`** bloom that rides the spire AND the **`renderGrove()`** keepsake gallery AND the results celebration) → keepsake STARS; plus the equipped **`curSeed()`** comet skins (SEEDS[]), **`curTrail()`** tail skins (TRAILS[]), **`curComp()`** companion sprites (COMPS[], replacing the emoji glyph in `render()` and the `wardCanvas()` previews). 💰 economy sheet.
- `seedflutter_bg.png` → `#wrap`/`#stage` background, the `render()` bg gradient (the `SEASONS[].bg` cross-fade), and the `.screen` title/how/settings/results/grove DOM panels, tinted per sky phase. The 4 sky-phase washes overlay the `seasonIdx()` cross-fade + the `sea.haze` overlay (winter snow / autumn tint).
- `seedflutter_ui.png` → `.btn` / `.btn.primary` plates, the title mode-button icons (`b-drift`/`b-daily`/`b-gaunt`/`b-zen`/`b-grove`/`b-ward`/`b-how`/`b-set`), the on-canvas `hudBtn()` menu (‹) / retry (↻) glyphs, the results `✿`/`·` star readout, the `.toggle` knob, and the `.wardcard` frame + locked state.
- `seedflutter_fx.png` → **`flap()`** puff crumbs, **`petalPuff()`** / `G.parts` particles, the **Perfect** star-burst + `spawnFlowerAt` puff, the `G.slow` slow-mo tint, the comet **`trail`** motes render, the seasonal **haze** (winter snow specks / autumn dust), the Koi **`recover`** soft-recovery puff, the win celebration, and a seat-the-scene vignette.

Bump the asset cache version (`?v=BUILD`) on any art change.
