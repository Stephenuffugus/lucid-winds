# PICNIC PANIC — Garden Galaga
## Lucid Winds Portal Integration Handoff · v2.0.0

**Deliverable:** `picnic-panic.html` — a single self-contained file (no build step, no external dependencies, no network calls). Drop it on any static host or embed it in the portal as-is.

---

## 1. What this game is

A complete Galaga remake with a botanical/picnic theme: the player is a potted snapdragon defending a picnic blanket from a swarm of bugs. Three game versions ship in one file, selected from the title screen, plus a persistent nectar economy with a shop.

| Mode | Internal key | Description |
|---|---|---|
| 🌱 Classic Garden | `classic` | Faithful Galaga loop: squads fly in on bezier entry paths (3 path archetypes) into a swaying/breathing formation; enemies peel off on dive attacks; queen-bee bosses (2 HP) sometimes dive with 1–2 fly escorts, or descend with a **pollen beam** that captures the player's plant. Destroying the carrying boss rescues the plant → **Double Bloom** (dual fighter, double shots). Challenge stage every 4th stage (fly-through squads, 40 targets, 10,000 perfect bonus). Extra lives at 20,000 and 70,000. |
| 🌻 Deluxe Swarm | `deluxe` | The "upgraded sequel": 1.25× speed, zigzagging wasps replace mosquitoes from stage 2, frequent twin dives, kill-streak multiplier up to ×5 (resets on death or when a diver escapes), rare 🌺 blossom bonus drops. |
| 🍄 Power Bloom | `power` | Classic rules plus power-up drops (13% on kill): 🌰 spread (3-way), 🌶️ rapid fire, 🌵 pierce, 🌸 shield petal, 🍄 bloom bomb (clears enemy bullets + damages divers), 🍯 +500 points. Timed at 10 s each. |

---

## 2. Standing economy

- **Currency:** Nectar 🍯. Earned at run end: `(score / 50 + 20 per stage cleared) × nectar-magnet multiplier`.
- **Persists across sessions** (see §4 for the storage adapter you control).
- **Seed Shop — permanent upgrades:**

| Item | Effect | Levels | Costs |
|---|---|---|---|
| Fast Runner Roots | +11% move speed / level | 3 | 120 / 280 / 560 |
| Quick Stamen | −12% reload time / level | 3 | 150 / 320 / 640 |
| Extra Sprout | +1 starting life / level | 2 | 420 / 900 |
| Lucky Clover | Shield petal at start of every life | 1 | 850 |
| Nectar Magnet | +25% nectar earned / level | 2 | 300 / 700 |

- **Cosmetics tab (economy sink):** pot glazes — Terracotta (free), Ocean Glaze (250), Midnight Ceramic (600), Gilded Pot (1000). Purely visual; owned + equipped state persists.
- High scores per mode and lifetime stats (runs, kills, best stage) also persist.

---

## 3. Controls & accessibility

- **Touch, buttons mode (default):** large ◀ ▶ buttons bottom-left, oversized FIRE button bottom-right. Pointer-capture based, so sliding a thumb off a button releases it cleanly.
- **Touch, joystick mode:** floating joystick appears wherever the thumb lands in the lower-left zone; FIRE button unchanged.
- **Options (Settings screen, all persisted):** buttons ↔ joystick, button size S/M/L, hand layout swap (FIRE left/right), sound on/off.
- **Keyboard:** ◀ ▶ or A/D move, SPACE fire, P pause. Works simultaneously with touch.
- Movement uses acceleration + exponential damping (not raw velocity), so it feels smooth on both input types.

---

## 4. Portal integration (the part your engineer needs)

### 4.1 Embed

```html
<iframe src="/games/picnic-panic.html"
        style="border:0;width:100%;height:100%"
        allow="autoplay"></iframe>
```

The game letterboxes itself to a 360×560 logical playfield and scales to any container, capped at 2× devicePixelRatio for crisp rendering without GPU waste. Portrait phones, landscape tablets, and desktop all work.

### 4.2 Save persistence — storage adapter

The game looks for storage in this priority order:

1. **`window.PicnicPanicStorage`** — *your* adapter. Define this **before** the game script runs (inject into the iframe document, or serve a wrapper page) and the game will route all persistence through the portal.
2. `window.storage` — the Claude-artifact KV store (used in the preview build).
3. In-memory fallback — session only.

Adapter contract (two async functions):

```js
window.PicnicPanicStorage = {
  // return the parsed save object, or null if none exists
  async load() {
    const raw = await LucidWinds.kv.get('picnic-panic-save'); // your API
    return raw ? JSON.parse(raw) : null;
  },
  // persist the save object (already debounced 250 ms by the game)
  async save(data) {
    await LucidWinds.kv.set('picnic-panic-save', JSON.stringify(data));
  }
};
```

### 4.3 Save schema (v2)

```json
{
  "v": 2,
  "nectar": 0,
  "upgrades": { "speed":0, "fire":0, "life":0, "clover":0, "magnet":0 },
  "cosmetics": { "pot":"terra", "owned":["terra"] },
  "highs": { "classic":0, "deluxe":0, "power":0 },
  "stats": { "runs":0, "kills":0, "bestStage":1 },
  "settings": { "controls":"buttons", "sfx":true, "padSize":"m", "swap":false }
}
```

Loads are defensive: missing keys are back-filled from defaults, so older saves and hand-edited data won't crash the game. If you extend the schema, bump `v` and add your migration in `loadSave()`.

### 4.4 Runtime API & events

Exposed on the game window as `window.PicnicPanic`:

| Member | Purpose |
|---|---|
| `version` | `"2.0.0"` |
| `config` | Live balance object (see §5) — mutate before/at load to retune |
| `getSave()` | Deep copy of the current save |
| `grantNectar(n)` | Credit nectar from portal-side sources (daily rewards, achievements, cross-game bonuses) |
| `on(event, cb)` | Subscribe; returns an unsubscribe function |

Events (also broadcast to the parent frame via `postMessage` as `{source:'picnic-panic', event, data}`, so an iframe host can listen without touching the game window):

| Event | Payload |
|---|---|
| `loaded` | `{save}` — save hydrated, menus ready |
| `run_start` | `{mode}` |
| `run_end` | `{mode, score, stage, nectarEarned, newHighScore, accuracy}` |
| `purchase` | `{item, level?, cost, nectarRemaining}` |
| `save` | `{save}` — fired on every persist |

Portal-side listener example:

```js
window.addEventListener('message', (e) => {
  if (e.data?.source !== 'picnic-panic') return;
  if (e.data.event === 'run_end') {
    LucidWinds.leaderboard.submit('picnic-panic', e.data.data.mode, e.data.data.score);
  }
});
```

**Security note:** the game posts with `targetOrigin: '*'` for portability. If the portal treats these messages as trusted input, tighten the `postMessage` origin in `emit()` and validate `e.origin` on your listener.

### 4.5 Portal economy bridge (optional)

If you want nectar to be a shared portal currency rather than game-local: keep the game's save as-is, but on `purchase`/`run_end` events mirror deltas to the portal wallet, and use `grantNectar()` to push portal-side credits in. The game never touches the network itself.

---

## 5. Balance & tuning

All gameplay numbers live in one `CFG` object at the top of the script — dive frequency, beam capture odds/width/duration, bullet caps, drop rates, deluxe multipliers, nectar earn rates, extra-life thresholds, respawn/invulnerability timing, etc. Shop pricing is in `SHOP`/`POTS` right below it. Nothing else in the code needs touching for a balance pass.

Suggested first knobs if playtests say "too hard": `diveIntervalBase` up, `beamChance` down, `enemyBulletBase` down. If economy feels grindy: `nectarPerScore` and `nectarPerStage` up.

---

## 6. Tech notes

- **Rendering:** single `<canvas>`, `requestAnimationFrame`, delta-time simulation clamped to 33 ms (no spiral-of-death after tab switches). DPR-aware backing store. Juice layer: hit-stop on boss kills, screen shake, expanding kill rings, score popups, muzzle flash, twinkling firefly backdrop, capture/rescue tween animations, READY stage intro.
- **Enemy movement:** cubic/quartic bezier paths for entries and dives; formation slots computed from a shared clock so sway/breathe is perfectly synchronized; divers smoothly rotate to face their heading.
- **Audio:** procedural WebAudio (no assets). Created lazily on first user gesture, so it respects mobile autoplay policies. Mutable in-game and in settings.
- **Sprites:** emoji for bugs/pickups (zero asset pipeline), canvas-drawn player plant (so pot cosmetics can recolor it). If Lucid Winds later wants bespoke art, the draw calls are isolated in `render()`/`drawPlant()` — swap emoji `fillText` for `drawImage` against a sprite sheet and nothing else changes.
- **No external requests, no cookies, no localStorage** — persistence is exclusively through the adapter in §4.2.

---

## 7. QA checklist

- [ ] Buttons mode: hold-to-move and hold-to-fire, slide-off releases, multi-touch (move + fire simultaneously)
- [ ] Joystick mode: stick spawns under thumb, releases to zero, works with swap-hands layout
- [ ] Button sizes S/M/L render and persist
- [ ] Capture: get caught in a pollen beam → life lost, plant rides the boss; shoot that boss → rescue tween → dual fighter
- [ ] Rescue while dead: freed plant waits, attaches after respawn
- [ ] Challenge stages appear on 3, 7, 11…; perfect run pays 10,000
- [ ] Deluxe: streak multiplier climbs/resets correctly; twin dives occur
- [ ] Power: all six drop types function; bloom bomb clears enemy bullets
- [ ] Shop: purchases debit nectar, pips update, effects apply next run; pot cosmetics recolor the plant
- [ ] Save survives reload (with the portal adapter wired)
- [ ] Pause/quit mid-run banks nectar correctly; game-over totals match HUD projection
- [ ] iOS Safari + Android Chrome: audio starts after first tap, no scroll/zoom bleed-through

## 8. Known limitations / roadmap candidates

- Enemy art is emoji — consistent cross-platform enough for launch, but a sprite sheet would unify the look (isolated swap, see §6).
- No music loop — SFX only. Easy add via a WebAudio sequencer if wanted.
- Single-player only; leaderboards are expected to live portal-side via the `run_end` event.
- Nice-to-haves discussed for v3: haptics on capture/death (`navigator.vibrate`), a Galaga-'88-style "transform" bonus enemy, daily challenge seed.

---

*Questions on any subsystem → every section of the code is labeled with banner comments matching the section names in this doc.*
