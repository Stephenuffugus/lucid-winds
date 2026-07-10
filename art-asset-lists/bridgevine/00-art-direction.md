# Bridgevine — Art Pack

> Sprout living pods, weave vine struts between them, and grow a swaying truss bridge that carries its own weight all the way to the Sun Bloom.

**Genre:** Construction physics (World of Goo lineage) with a garden heart. Drag to sprout a pod, it self-weaves struts to its nearest neighbours, the whole structure sags and swings under real Verlet gravity. Struts show strain by color AND notch marks, overworked ones snap, orphaned fragments fall away. Signature **Dew Ballast**: dewdrops caught by the growing vine can be spent to crystallize a strut, stiffening it far beyond its natural limit — strategic stiffening beats brute pod count. Ten machine-proven trials, a seeded Daily Build, an endless Sky Reach tower, and a snapless Zen Garden.

_The game already ships and plays procedurally (`satellites/bridgevine/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game wardrobe economy._

## Pick a look

### 1. Copperwood Atelier  ← RECOMMENDED
*A Renaissance inventor's garden workshop: warm candle-lit blueprint linework, polished copper and brass fittings, living sage vines growing OVER the engineering — every pod a turned-wood-and-copper sprout capsule, every strut a vine lashed to fine brass cable, crystal struts as cut quartz in copper collars. Soft vellum grain, thin gold construction lines that fade like pencil ghosts, nocturnal light from a lantern low on the left.*

The construction fantasy IS the game — a truss builder deserves drafting-table DNA, and the "living garden reclaiming the machine" tension gives Bridgevine an identity none of our other satellites use. Silhouettes stay bold and readable at thumbnail size, hazard/state changes (stress notches, crystal facets) read by shape first, and the copper-on-midnight palette sits natively inside the Lucid Winds glasshouse. **All sheets below bake this in.**

### 2. Moonlit Treehouse (alt, cozier)
*Storybook rope-and-plank childhood treehouse at night, fireflies, knotted twine, soft gouache.* Maximum warmth, but planks and rope read as WOOD construction, which fights the living-vine mechanic (structures grow, they are not carpentered), and fine stress states blur at gameplay scale.

### 3. Vitrine Terrarium (alt, more mature)
*A brass-and-glass Victorian terrarium: the whole level inside a display case, condensation, museum-plate elegance.* Beautiful frame fiction, but the case chrome eats screen space on a 540px canvas and the glassware wants reflections that fight the flat readability bar.

## Sheets (generate each separately)

- `01-bridgevine-pods.md` — Pods, Anchors & Pod Skins — the buildable node family — 💰 COSMETICS
- `02-bridgevine-struts.md` — Struts, Crystal States & Strain Marks — the line work the game is made of
- `03-bridgevine-world.md` — Terrain, Sun Bloom & Dewdrops — goals and stage furniture
- `04-bridgevine-backgrounds.md` — Skies & Screens — Full-Bleed Portrait — 💰 COSMETICS (4 unlockable skies)
- `05-bridgevine-ui.md` — UI / HUD — buttons, chips, plaques, trial cards
- `06-bridgevine-fx.md` — FX & Keepsakes — snap burst, bloom flowers, grove keepsakes

## Cosmetics economy

All Bridgevine cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, no pay-to-win, nothing that changes physics, budgets, or snap thresholds. Every unlock is a KNOWN item at a KNOWN threshold (mirrors `WARD` in the shipped code): **Pod skins** — Sprout Pod free, Acorn Pod at 3 trials cleared, Lantern Bud at 7 trials, Berry Pod at a Daily streak of 3. **Skies** — Meadow Dusk free, High Cirrus at Sky Reach height 300, Aurora Loft at Daily streak 7, Deep Night as the capstone for all 10 trials. **Craft styles** — Braided Struts after 10 lifetime crystallizations, Gold Thread for all trials plus height 500. Three mastery lanes (trials, daily streak, tower height) so every mode feeds the wardrobe, and the Grove keepsake gallery gives a fourth, purely sentimental collection wall: every won span presses a one-of-a-kind flower. Sunbeams follow the portal standard (30/day, 12/run via `_sbCapEarn`, Zen pays zero) and stay the earn currency — cosmetics never touch them.

## Style block

```
STYLE — "Copperwood Atelier" (Bridgevine / Lucid Winds midnight-garden drafting workshop). A Renaissance inventor's garden atelier at night: warm candle-lit blueprint linework on deep vellum-over-void, polished copper and brass fittings, and living sage vines growing over the engineering. Crisp flat fills with gentle vellum grain, thin gold construction "pencil ghost" lines allowed as accents, NO photoreal gradients, NO glossy 3D render, NO harsh black keylines; every subject a bold clean silhouette that reads at thumbnail size. Consistent flat front-on diorama camera, subjects centered and upright with a small soft contact shadow EXCEPT cutout pieces marked "no shadow" (the engine layers those). Deep-night palette — void #0d100c and #05070a; vellum warm #1a1408 and #302408 shadows; foliage sage #7ab356 over deep #3f6b34 with mid #5c8f3f; copper #b87346 with hot edge #e8a06a; brass-gold #c8a84b, highlight #ffe9a8, cream #e8dcc8; muted moss #8a9178, dusk line #2a331f; luminous dew #bfe0f2 over moon-blue #5b9bd5 and deep #2b567c; crystal frost #d8f0ff; strain amber #c8a84b and strain red #e56b6b; accent rose #e58fa0; bark #8a5a2b / #5c3a1a. Lighting is nocturnal lantern-warm from low-left, copper edges catch a thin hot rim, dew and the Sun Bloom emit soft radial glows, everything else stays low-key. Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons pictographic only). Each PNG must compress under 150KB. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural draws in `/workspaces/lucid-winds/satellites/bridgevine/index.html`; keep every canvas fallback as an absent-asset safety net. Asset folder: `/workspaces/lucid-winds/satellites/bridgevine/assets/` (subfolders `pods/`, `struts/`, `world/`, `backgrounds/`, `ui/`, `fx/`). Path-version every file (`?v=LW_VERSION`) per the Hostinger resizer rule; ship only cut cells under 150KB, keep master sheets out of the live web path. Map: `bridgevine_pods.png` → the node draws in `render()` (free pods keyed by `PROG.pod` via `PODCOLS`: sprout/acorn/lantern/berry; pinned root anchors = the bark knob draw). `bridgevine_struts.png` → the strut stroke pass (normal vine, `crystal` frosted state with band marks, plus Braided/Gold Thread wardrobe styles keyed by `PROG.craft`); keep the notch strain marks engine-drawn on top (colorblind requirement). `bridgevine_world.png` → terrain platform tiles (`G.terrain` rects), the Sun Bloom goal (`G.goal` pulsing radial + petal ring + hold-progress arc), and dewdrops (`G.dew`). `bridgevine_bg.png` → the four `SKIES` gradients (meadow/cirrus/aurora/night) as full-bleed portrait paintings plus title/trials/wardrobe screen panels. `bridgevine_ui.png` → `.btn`/`.btn.primary` plates, `.hchip` pod/dew chips, `.lvlcard` trial frames, `.wardcard` rows, toggles. `bridgevine_fx.png` → the snap burst, win bloom petals along `G.bloomPath`, pollen motes, and the Grove keepsake flower set (`drawKeepsake` species). Bump the asset cache version on any art change.
