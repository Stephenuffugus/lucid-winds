# Spore Drift — Art Pack

> Drift a single luminous spore through still deep water. Puff to move, drink what is smaller, slip past what is not, and ride the Season Current until your spore blossoms.

**Genre:** Ambient absorption (Osmos lineage) with a seasonal drift twist. Tap to breathe out a puff of yourself and glide the opposite way; absorb smaller motes to grow, avoid the ringed giants, and let the slow Season Current carry you for free. Signature **Season Current**: a visible flow field that turns through spring, summer, autumn and winter over one run, recoloring the whole water as it goes. Chamber wins blossom the spore into a keepsake Grove.

_The game already ships and plays procedurally (`satellites/spore-drift/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game wardrobe economy._

## Pick a look

### 1. Inkwater Bioluminance  ← RECOMMENDED
*Deep-sea ink-wash: soft translucent orbs like bioluminescent plankton suspended in layered ink-dark water, each body a glassy membrane with an inner glow-core and a thin bright rim, drifting particulate bokeh and hair-thin current filaments behind everything.* Reads perfectly at gameplay scale (the game IS circles — this look makes every circle feel alive), the glow language maps one-to-one onto the game's threat/prey readability (bright rim = alive, dashed ring stays an engine overlay), and the ink-dark water sits natively in the Lucid Winds midnight palette while feeling grown-up and meditative like the source game deserves. **All sheets below bake this in.**

### 2. Paper Nocturne Deep (alt, house-consistent)
*The Dew Snip papercut language taken underwater: stacked cut-paper orbs with backlit rim-light, paper-grain water in flat layered bands.* Maximum brand consistency with the other satellites, but flat paper reads less "floaty" for a physics drift game and the layered-depth fiction fights the single-plane arena.

### 3. Naturalist Plate (alt, more mature)
*Vintage microscopy field-guide: diatom and radiolarian engravings, sepia-on-ink plates, hairline stipple.* Beautiful and distinctive, but hazard readability at speed suffers and it drifts from the cozy LW night-garden warmth.

## Sheets (generate each separately)

- `01-sporedrift-spore.md` — The Spore + Membranes — hero orb, 4 membrane skins, puff states — 💰 COSMETICS
- `02-sporedrift-motes.md` — Motes, Elder & Flowers — prey/threat orbs, elder crown, flowering motes
- `03-sporedrift-fx.md` — FX & Current — flow filaments, season particles, absorb/eject/bloom feedback
- `04-sporedrift-backgrounds.md` — Backdrops & Screens — 4 unlockable waters + title — 💰 COSMETICS
- `05-sporedrift-ui.md` — UI / HUD — buttons, chips, bars, chamber cards, wardrobe frames
- `06-sporedrift-trails.md` — Trails & Keepsakes — 4 wake styles + Grove blossom set — 💰 COSMETICS

## Cosmetics economy

All Spore Drift cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, no pay-to-win, nothing that changes physics, mote layouts, or absorption math. Everything is a KNOWN unlock at a KNOWN threshold shown in the Wardrobe. THREE free mastery lanes, exactly as wired in `sporedrift_save`: (1) **Chamber mastery** — membrane skins (Plain free, Comet Rim at 3 chambers, Lichen Mottle at 7, Prism Veil at all 10) plus the Kelp Glade backdrop at 5 chambers. (2) **Hunt & biomass mastery** — trail wakes (Dust free, Petal Wake for 3 Bloom Hunt wins, Aurora Wake for 5000 lifetime biomass) and the Moon Pool backdrop for the first Bloom Hunt win. (3) **Daily mastery** — Ember Wake at a 3-day Daily streak and the Starfield backdrop at a 7-day streak, the lapsed-friendly comeback lane. Feeding the meta: first-clear chambers and every third Bloom Hunt win blossom a keepsake into the Grove (the native collection wall), and Sunbeams follow the portal standard (30/day, cap 12/run via `_sbCapEarn`, Zen pays nothing). No soft-coin sink is wired in v1; if one is added later it may only early-unlock the CURRENT seasonal recolor, never a mechanic.

## Style block

```
STYLE — "Inkwater Bioluminance" (Spore Drift / Lucid Winds deep-water nocturne). Deep-sea ink-wash bioluminescence: every subject is a soft translucent orb or filament suspended in layered ink-dark water — a glassy outer membrane, a dimmer body layer, a small bright glow-core, and ONE thin luminous rim catching an unseen moon above; faint particulate bokeh motes and hair-thin drifting current filaments may pass BEHIND subjects only. Soft radial glows, wet translucency, NO hard outlines, NO photoreal caustics, NO glossy 3D render; silhouettes must read instantly at thumbnail size. Deep-night water palette — abyss #070b10 and #0c121c over void #05070a; luminous dew #bfe0f2 over moon-blue #5b9bd5 and deep #2b567c; foliage sage #7ab356 over deep #3f6b34; lantern gold #c8a84b with bloom-highlight #ffe9a8 and cream #e8dcc8; muted moss #8a9178; dusk line #22303a; accent rose #e58fa0 and soft violet #b57de0. Season tints — spring rose #E8A0BF, summer gold #D4A843, autumn copper #D4842A, winter ice #A0C4E8. Lighting is abyssal: bodies glow from within, rims catch thin cream light, the water itself stays deep and quiet. Threat/prey readability is sacred: BIGGER creatures get heavier, more textured membranes; smaller ones stay simple and soft (the engine draws its own dashed threat ring on top — leave room for it). Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons are pictographic only). Each PNG must compress under 150KB. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural draws in `/workspaces/lucid-winds/satellites/spore-drift/index.html`; keep the canvas fallbacks as absent-asset safety nets. Asset folder: `/workspaces/lucid-winds/satellites/spore-drift/assets/` (subfolders: `spore/`, `motes/`, `fx/`, `backgrounds/`, `ui/`, `trails/`). Path-version every file (`?v=LW_VERSION`) per the Hostinger resizer rule; ship only the <150KB cut cells, keep master sheets out of the live web path. Map: `sporedrift_spore.png` → the player draw in `render()` (three stacked circles today) keyed by `PROG.membrane` (`plain`/`comet`/`lichen`/`prism`). `sporedrift_motes.png` → the mote draw loop (body + highlight), elder crown notches (`m.e`), flower petal ring (`m.f`) — the dashed THREAT ring + notch triangle stay engine-drawn on top. `sporedrift_fx.png` → flow-line particles (`FLOWP` loop), eject puff birth flash, absorb sip glow, win blossom burst. `sporedrift_bg.png` → the `render()` radial gradient per `PROG.backdrop` (`abyss`/`kelp`/`moonpool`/`starfield`) tinted by `seasonBlend()`, plus `.screen` panels. `sporedrift_ui.png` → `.btn`/`.btn.primary` plates, `#hud .hbtn`, `#goalbar`/`#goalfill`, `#goalchip`, `.lvlcard` chamber cards, `.wardcard` frames, `.toggle`. `sporedrift_trails.png` → the trail dot ramp keyed by `PROG.trail` (`dust`/`petal`/`ember`/`aurora`) and the `drawKeepsake()` blossom set for the Grove. Bump the asset cache version on any art change.
