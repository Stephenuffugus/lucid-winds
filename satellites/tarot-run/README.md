# Tarot Run

A pocket roguelite deckbuilder. 78 hand-painted tarot cards. Climb the tower. Survive the Crowned Fool.

**Built by**: Stephen / SWS Strategic Media LLC
**Status**: MVP code-complete, ready for art import and ship
**Stack**: Single-file vanilla HTML/CSS/JS. PWA. No build step. No backend.

---

## What's in this folder

```
tarot-run/
├── index.html              ← The whole game. Single file. Open it in a browser.
├── manifest.json           ← PWA manifest (install to home screen)
├── sw.js                   ← Service worker (offline play after first load)
│
├── DESIGN.md               ← Game design — mechanics, philosophy, run structure
├── BALANCE.md              ← Numbers — enemy HP, damage tables, win rates
├── ART_DIRECTION.md        ← Midjourney prompts for all 90 art slots
├── ASSET_MANIFEST.json     ← Programmatic asset list (every slot → filename)
├── README.md               ← This file
│
├── test.js                 ← Combat flow / mechanics validation (Node, no DOM)
├── sim-run.js              ← Full 15-floor AI simulator
├── test-cards.js           ← Stress test that plays all 78 cards
│
├── data/
│   ├── cards.json          ← All 78 cards in clean JSON (id, name, suit, cost, desc, etc.)
│   ├── enemies.json        ← All 11 enemies with intents
│   └── relics.json         ← All 15 relics
│
└── art-slots/              ← DROP MIDJOURNEY IMAGES HERE
                              (filenames in ASSET_MANIFEST.json)
```

---

## For Claude Code — Handoff Instructions

This is what's left to do for v1:

### 1. Generate art (the bulk of the work)

Use `ART_DIRECTION.md` for the prompts. There are **90 images** total:

- 1 title mark
- 78 tarot cards (22 Major Arcana + 56 Minor Arcana)
- 11 enemy portraits

The user (Stephen) has Midjourney Pro and will generate these. The handoff process:
1. Stephen generates → saves PNG with EXACT filename from `ASSET_MANIFEST.json` (e.g., `card-major-13.png`)
2. PNG drops into `/art-slots/`
3. Refresh — the auto-loader picks it up

If Stephen can only do part of the deck initially, the **Minimum Viable Ship** order is in `ART_DIRECTION.md` (priority: title + icons + 22 majors + boss + aces + remaining enemies).

### 2. Verify the auto-loader

The game has a runtime art loader (`hydrateArt()` in index.html). It:
- Scans the DOM for `[data-art-slot]` elements
- Attempts to load `art-slots/<slot>.png` for each
- Replaces the unicode placeholder with `<img>` on success
- Caches failures so it doesn't retry on every render

If Stephen wants static HTML replacement instead (faster, no flicker), write a Node build script that finds each `<div class="card-art placeholder" data-art-slot="card-X">` and rewrites it to `<div class="card-art"><img src="art-slots/card-X.png"></div>`. Not required for v1.

### 3. Generate app icons

The manifest references `art-slots/icon-192.png` and `art-slots/icon-512.png`. These are derived from the title-mark. Stephen can:
- Generate the title mark in Midjourney at 1024×1024
- Use ImageMagick / sharp / similar to resize to 192×192 and 512×512
- Or generate dedicated icon prompts at smaller sizes

### 4. Optional polish (v1.1)

If there's time after art import:

- **Add sound**: a single MP3 of "card flip" for play, "metal chime" for aspect resonance, "deep bell" for Major Arcana, "scratch" for damage. The game has no audio hooks yet — add `<audio>` tags and trigger from `playCard()` / `triggerAspect()` / damage pop.
- **Reversed card content**: only the framework is in place. Adding `reversedPlay` functions to majors would unlock the Broken Mirror relic's full potential. Suggested reversed effects:
  - The Lovers reversed → take 4 damage, draw 2
  - The Devil reversed → strike 0, remove 1 debuff
  - Death reversed → restore your last discarded card to hand
- **Card "Study" upgrade**: rest-node "Study a card" currently just marks `entry.studied = true` but doesn't increase effect. To make it real, modify `dealDamage`/`gainBlock`/`healPlayer` to check `entry.studied` and add +2 to the relevant stat.
- **Add Firebase** for Daily Reading leaderboard. Hook into `state.run.seed` and POST results on victory.
- **Animation polish**: card draw deal-from-deck animation, reading-card flip animation, victory curtain-close transition.
- **Add Ascension difficulty modes**: standard Slay-the-Spire ladder. Higher Ascensions add: enemies start with stacking buffs, fewer rests, lower starting HP.

### 5. Ship

To deploy:
- Static host. Netlify / Vercel / Firebase Hosting / GitHub Pages — any.
- Single folder upload. No build needed.
- HTTPS required for PWA installability and service worker.

---

## For the developer (Stephen)

### Run it locally

```bash
# Just open index.html in a browser, OR (better for service worker):
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Test mechanics

```bash
node test.js        # combat flow validation, one full fight
node sim-run.js     # 50 simulated runs, win rate, loss-by-floor histogram
node test-cards.js  # stress-test every card; verify damage profiles
```

### Drop new art

1. Generate via Midjourney with prompts from `ART_DIRECTION.md`.
2. Save with the EXACT filename from `ASSET_MANIFEST.json` (e.g. `card-major-0.png`).
3. Drop into `/art-slots/`.
4. Refresh the browser. The art-loader picks it up automatically.

### Edit a card

All card definitions live in `index.html` in either `MAJOR_CARDS` (~line 700, hand-written) or via `SUIT_FACTORIES` (~line 600, minor cards procedural by suit/number).

To rebalance a minor card, edit the formula in its suit factory:
```js
// Wands at line ~610
if(n <= 10){
  const dmg = 3 + n;  // ← tune this
  ...
}
```

To rebalance a Major, edit its `play()` function in the `MAJOR_CARDS` array. Re-run `test-cards.js` after to verify damage profile.

### Edit an enemy

`ENEMIES` array (~line 870). Each has an `intents` array — these are chosen randomly per turn. To make an enemy harder, increase intent values or add more punishing intents. To make a boss have phases, add a state machine to `chooseEnemyIntent()`.

### Add a new relic

`RELICS` array (~line 920). Each has an `id`, `name`, `desc`, `flavor`. Then add the actual effect inside `playCard()` or `startCombat()` or `endTurn()`. Search for existing `state.run.relics.includes(...)` calls to see the pattern.

### Modify the path

In `generatePath(rng)` (~line 980). Currently 15 floors with fixed elite/treasure positions. Easy to change — just modify the loop and adjust `floor === 14` boss check.

---

## Known issues / future work

- No sound yet (intentional MVP cut)
- Boss has no special mechanics — just 5 cycling intents; ideally has phase 2 below 50% HP
- Card "Study" upgrade infrastructure exists but doesn't yet alter card power
- Reversed card framework exists but most cards lack `reversedPlay` variants
- No relic synergy display (some relics combo brutally — could be highlighted)
- Pending choice modals (Discard, Peek, Tutor) are partially implemented — discard auto-resolves randomly in test; Peek is currently a no-op

---

## Credits

- Game design + code: Claude (collaborating with Stephen)
- Art: Stephen via Midjourney Pro
- Inspiration: Slay the Spire (the run structure), Smith-Waite tarot deck (the look), Mucha and Khnopff (the brushwork)

---

## License

TBD by Stephen / SWS Strategic Media LLC.
