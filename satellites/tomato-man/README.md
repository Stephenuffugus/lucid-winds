# 🍅 TOMATO MAN

![Tomato Man — a sunburnt tomato stranded in the dunes](thumbnail.png)

> The sun is death. Shade is the only ground you can stand on — and it **moves** as the sun sweeps the sky. Sweep through the shadows, gather the aloe, beat the heat, and don't get burned.

A single-file, mobile-first, top-down action-platformer. Hero: **Tomato Man** (named by Penny, who kept calling her sunburnt dad "tomato man"). No build step, no dependencies — just open the HTML file.

## ▶️ Play

**Live:** **https://stephenuffugus.github.io/Tomato_Man/** *(once GitHub Pages is on — repo Settings → Pages → Deploy from branch → `main` / root)*

**Install it** — Tomato Man is a full PWA: use your browser's *Install* button / *Add to Home Screen* and it runs standalone, fullscreen, and **works offline**. Each game in the studio is independently installable, so you can grab just this one. Or open **[`index.html`](index.html)** locally in any modern browser.

- **Move** — left thumb (floating joystick) or WASD / arrows
- **DASH** — cross a thin sun sliver (but it burns you *fast* in the open). Space.
- **SHADE** — drop a temporary safe circle. Q.
- **SPF** — a few seconds of immunity. E.
- **ICE** — briefly slow the sun's sweep to reposition (worlds 3+). F.
- **Pause** — Esc.

Collect **🌿 Aloe** — the green stars **glow when the sun lights them**; grab a glowing one for shop money (a dim star is asleep in shade). Chain pickups without burning to build a **Fresh Streak** multiplier.

New to it? The title screen has a **How to Play** legend, and a first-run coach teaches each mechanic the moment it first matters.

## 🎮 What's in it

- **26 hand-built levels across 5 worlds** — every one verified solvable by a physics-replay simulator (a verbatim port of the engine that pathfinds around the solid awnings) — plus an endless **Shadow Run** and a **Daily Challenge** (same seed for everyone each day, with streaks). Solid awnings you must route *around* make several levels real "looks-impossible-until-you-see-it" puzzles: **The Moat** (no natural shade crosses the sand, so you drop your own and island-hop it), **High Sun Gaps** (shadows only join when the sun stands straight up), and **The Long Dark** (a blackout maze you cross only while the eclipse blinks on).
- **Hidden collectibles + time trials** — every level hides **3 world-themed treasures**: 🐚 seashells (beach worlds), 🍦 ice-cream (the blaze), 💎 gems (dunes & eclipse). Some are a risky grab, one's tucked off the path — the level card shows your count (`🐚 2/3`), and your **best time** is on-screen so you race yourself. 100%-ing a level pays bonus aloe, and **100%-ing a whole world unlocks an exclusive hat you can't buy** (Shell Crown, Ice-Cream Hat, Cool Shades, Gem Crown, Eclipse Halo). All 78 placements are sim-verified reachable.
  1. **Morning Tide** — long forgiving shadows; learn the sweep, the dash, dropping shade, riding clouds.
  2. **Midday Blaze** — short shadows, hot sand, patrolling cart-shadows, popsicles, SPF economy.
  3. **Tide Pools** — wilting awnings (no camping) + ice water (slow the sun).
  4. **Dunes at Dusk** — wind drift that pushes you and re-tilts umbrellas; wide raking sun.
  5. **Eclipse** — the **Angry Sun** boss (telegraphed lunges) + eclipse darkness windows.
- **Aloe economy + shop** — 8 tiered upgrades (the T3 power tiers gate behind Gold medals so you can't grind past skill), single-use boosts, and **24 cosmetics**.
- **Character builder** — "build your tomato man": swap produce (tomato → strawberry → avocado → golden…), hats, and dash trails.
- **Game feel** — momentum movement, a hop/dash with squash-&-stretch + hitstop, coyote-grace on shade edges so instant-death stays *fair*, screen shake, particles, combo juice.
- **Procedural Web Audio** — SFX + a distinct per-world music bed, no asset files.
- Stars, medals, best times, full **localStorage** save, settings (SFX / music / reduce-motion).

## 🎨 Art (optional, drop-in)

The game renders **everything procedurally**, so art is 100% optional and risk-free. To use your own:

1. Make an `art/` folder next to `index.html`.
2. Save a PNG at the path the loader expects (see `ASSET_PATHS` in the file).
3. Reload — if the file loads it's used, otherwise it silently falls back to procedural art.

The full asset list, style guide, and ready-to-paste Midjourney / ChatGPT / Gemini prompts are in **[`ART-NEEDED.md`](ART-NEEDED.md)** (also mirrored in the Google Drive "Tomato Man" folder).

## 🛠️ For developers

Everything lives in `index.html`. Key sections (search the `<script>`):

- `LEVELS` — the 26 levels as plain data (world px, y-down, travel bottom→top). Easy to tune on a phone. New levels are appended (never inserted) so `world_index` save keys stay stable.
- `genLevel()` — the procedural generator for endless/daily.
- `computeShade()` / `safeAt()` — the swept-shadow geometry & safety test.
- `update()` — the sim (movement, mechanics, exposure, pickups, win/burn).
- `BASE_FEEL` / `FEEL()` — movement & burn tuning (+ upgrade modifiers).
- `ECON` / `UPGRADES` / `CONSUMABLES` / `COSMETICS` — the economy.
- `SFX` / `MUSIC` — the procedural audio.

**Older prototypes** (`umbra-v4.html`, `UMBRA-HANDOFF.md`) are kept for reference — `index.html` (the Tomato Man build) supersedes them.

---

*Made with ☀️ for Penny.*
