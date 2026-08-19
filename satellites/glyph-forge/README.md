# Glyph Forge

A pocket roguelite deckbuilder. Fuse runes into spells. Find what shouldn't work.

**Built by**: Stephen / SWS Strategic Media LLC
**Status**: MVP complete, ready for art import and ship
**Stack**: Single-file vanilla HTML/CSS/JS. PWA. No build step. No backend.

---

## What's in this folder

```
glyph-forge/
├── index.html              ← The whole game. Single file. Open it in a browser.
├── manifest.json           ← PWA manifest (install to home screen)
├── sw.js                   ← Service worker (offline play after first load)
│
├── DESIGN.md               ← Game design — mechanics, philosophy, run structure
├── BALANCE.md              ← Numbers — enemy HP, damage tables, win rates
├── ART_DIRECTION.md        ← Midjourney prompts for all 39 art slots
├── ASSET_MANIFEST.json     ← Programmatic asset list (slot → filename → concept)
├── README.md               ← This file
│
├── test.js                 ← Mechanics stress test (Node, no DOM needed)
├── sim-run.js              ← Full-run AI simulator for balance validation
│
├── data/                   ← Reserved for future exports (e.g. rune data dump)
└── art-slots/              ← DROP MIDJOURNEY IMAGES HERE. Filenames in ASSET_MANIFEST.json.
```

---

## For Claude Code — Handoff Instructions

This is what's left to do:

### 1. Generate art (the bulk of the work)

Use `ART_DIRECTION.md` for the prompts. There are **39 images** total:

- 1 title mark
- 30 rune sigils
- 8 enemy portraits

The user (Stephen) has Midjourney Pro and will be generating these. You don't need to. But when he drops PNGs into `/art-slots/`, you should verify they match the expected filenames in `ASSET_MANIFEST.json`.

### 2. Verify auto-load works

The game has a runtime art loader (`hydrateArt()` in index.html). It:
- Scans the DOM for `[data-art-slot]` elements
- Attempts to load `art-slots/<slot>.png` for each
- Replaces the unicode placeholder with `<img>` on success
- Caches failures so it doesn't retry on every render

If a user wants static replacement instead (faster, no flicker), you can write a build script that finds each `<div class="rune-art placeholder" data-art-slot="rune-X">` and rewrites it to `<div class="rune-art"><img src="art-slots/rune-X.png"></div>`. Not required.

### 3. Generate app icons

The manifest references `art-slots/icon-192.png` and `art-slots/icon-512.png`. These are versions of the title-mark. Stephen can generate the title mark in Midjourney and you can:
- Use ImageMagick / sharp / similar to resize to 192×192 and 512×512
- OR he generates dedicated icon prompts

Either path works.

### 4. Optional polish

If there's time after art import:

- ~~Add SFX~~ ✅ **done** — `GFAudio`, a zero-dependency Web Audio synth, is
  wired to cast/combo/reward/hit/victory/defeat/tap with a persisted mute
  button. No asset files; Node-safe (inert in test/sim).
- **Add Firebase** for daily leaderboard. Stephen already uses Firebase on Focus Grove — same stack works here. Hook into the existing `state.run.seed` and POST results on victory.
- **Animation polish**: the combo banner could pull in a parchment background swatch instead of a flat color. Adds atmosphere.

### 5. Ship

To deploy:
- Static host. Netlify / Vercel / Firebase Hosting / GitHub Pages — any.
- Single folder upload. No build needed.
- HTTPS required for PWA installability and service worker.

---

## For the developer (Stephen)

### Run it locally

```bash
# Just open index.html, OR for the service worker to work, serve it:
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Test mechanics

```bash
node test.js       # spell math, combo detection, balance smoke tests
node sim-run.js    # 50 simulated runs, win rate, loss distribution
```

### Drop new art

1. Generate via Midjourney with prompts from `ART_DIRECTION.md`.
2. Save with the exact filename listed in `ASSET_MANIFEST.json` (e.g. `rune-ember.png`).
3. Drop into `/art-slots/`.
4. Refresh the browser. The art-loader picks it up automatically.

### Edit a rune

All rune definitions live in `index.html` in the `RUNES` array (~line 600). Each rune has:

```js
{ id:'ember', name:'Ember', element:'Fire', shape:'Bolt',
  basePower:2, rarity:'common', glyph:'☄',
  desc:'A small spark, hungry for tinder.',
  starter: true,
  effect: (ctx, i) => { /* mutate spell context */ } }
```

To add a rune: append to the array. To rebalance: change `basePower`. To rewrite an effect: edit `effect`. The art slot auto-resolves to `rune-<id>.png`.

### Edit an enemy

`ENEMIES` array below `RUNES`. HP, threat, tag, glyph. Tag is used by some runes (e.g. Ray gets +50% vs `shadow` tag).

### Add a named combo

`NAMED_COMBOS` array below `ENEMIES`. Each entry: `{ id, match: (runes) => boolean, name: string }`. The `match` function gets the array of cast runes (with full data) and should return true if it matches.

### Modify the run path

In `startNewRun()` look for the `path.push` loop. Currently fixed 13 encounters with tier brackets. Easy to change to 9 or 15 — just modify the loop and adjust `path.length === 13` checks elsewhere.

---

## Known issues / future work

- ✅ Sound shipped — synthesised Web Audio (no asset files), with a mute toggle.
- ✅ Relics shipped — 22 relics + 5 hidden transmutations; sim-balanced.
- Boss has no special mechanics — just high HP / high threat. A phase-2 mechanic would lift the climax.
- No deck management between encounters (can't remove runes). Could add as a rare reward.
- Daily Sigil works mechanically but no leaderboard yet. Hook into Firebase.

---

## Credits

- Game design + code: Claude (collaborating with Stephen)
- Art: Stephen via Midjourney Pro
- Inspiration: Balatro (the broken combo feeling), Slay the Spire (the run structure), illuminated manuscripts (the look)

---

## License

TBD by Stephen / SWS Strategic Media LLC.
