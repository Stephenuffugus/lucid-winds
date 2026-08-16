# SPROING — audit notes

Audited 2026-08-16. Full pass: read end to end, defect list written BEFORE any edit,
fixed worst first, headless assertion suite left behind (`audit-check.mjs`).

Build at audit time: `v1.0.0`, 2011 lines, Canvas2D, art pack in `assets/`.

**The spring is LOCKED.** Project memory records Sproing's mechanics as settled
deliberately, so nothing in this pass touches feel: `GRAV 2200`, `HOP 1150`,
`SPRING 1850`, `MEGA 2350`, `MAXFALL 1500`, `MAXHORIZ 680`, `LOCK 432`, `PX_PER_M 10`,
`LANDTOL 12` and the fixed `DT 1/60` step are all untouched, as are the platform mix,
the chain tiers and the powerup pool. This audit is repair and hardening only.

## How this was verified

- Real headless Chrome at 375x667. Boot, onboarding, studio, map, and a live run driven
  through actual DOM clicks and real keyboard input — this game exposes no dev hook, so
  everything below was reached the way a player reaches it.
- Corrupt-save cases poisoned one key per boot in a fresh browser context, because an
  IIFE that dies at parse dies once and a shared context would have hidden it.
- Every assertion in `audit-check.mjs` was watched FAIL on purpose before it was trusted.

## The core loop, start to finish — WORKS

Fresh install: PLAY opens the drawing studio (onboarding). Draw, "Save & Equip", and the
run starts. `draw-back` sets `sproing_bounce_seen` and returns to the title, so a player
who does not want to draw is not trapped — the onboarding is escapable, and "✨ Example"
fills the canvas for them. Verified: not an inescapable state.

Beyond that: title → modes → 12 worlds × 25 levels map → run → level end or game over →
next / retry / map. Endless, Daily, Zen and Adventure all launch. Pause, resume with a
3-2-1 countdown, settings, shop (skins / hats / themes / trails / upgrades / goals),
gallery, Dandelion Save continue. Nothing stubbed, no dead button found.

Difficulty is real: `levelDef` scales `targetM` as `100 + world*80 + lw*10` (100m to
~1200m), `LEVEL_MODS` rotate per level, `powForBiome` gates the powerup pool by altitude
band, and the six biomes change platform mix every 500m.

## DEFECT LIST (written before any edit)

### 1. CRITICAL — a corrupt settings key kills the game while it still LOOKS fine. FIXED

`LS.getJSON` wrapped `JSON.parse` in a try/catch and returned whatever came out. That is
not validation: `5`, `"x"`, `true` and `[]` all parse and come straight back. `SET` is
then built with `for(var k in DEF_SET) if(!(k in s))`, and the `in` operator on a number
**throws**. This file is `'use strict'`, the throw is at top level, and the whole IIFE
dies — every function, every handler.

The title screen is static HTML, so it renders perfectly. The player sees a normal game
where **every single button does nothing**. That is the worst shape a failure can take,
and it is exactly the "silent failure" class.

Verified in a real browser, one poisoned key per boot:

```
sproing_settings=5   -> "Cannot use 'in' operator to search for 'steer' in 5"
                        title renders, PLAY does nothing, game is dead
sproing_levels=5     -> "Cannot read properties of undefined (reading '0')"
sproing_levels=[]    -> same; the map button looks alive and never opens Adventure
```

**Fix:** `getJSON` now takes the shape from the default it was handed and enforces it —
array default demands a real array, object default demands a real object, primitive
default demands the same primitive type. Added `getInt` for the numeric keys, because
`parseInt("abc")` is `NaN` and `NaN` poisons every sum it touches downstream.

### 2. HIGH — Adventure unreachable on a half-valid level save. FIXED

`{"stars":7}` passes an outer object check but is not a map, and `levelProg.stars[idx]=n`
on a number throws under strict mode — inside the level-clear handler, where nobody would
connect it to the save file. The outer type check is not enough on a nested structure.

**Fix:** the inner `stars` map and the `unlocked` counter are shape-checked too.

### 3. HIGH — two tabs clobber coins, best and stars. FIXED

`coins`, `best` and `levelProg` were read once at boot and written back wholesale. Two
tabs open, play a run in each, and the last write erases the other's wallet, record and
star progress. Coins are earned currency and the shop spends them, so this is real lost
player value.

**Fix:** read-modify-write. `writeCoins(delta)` applies this tab's delta to whatever is on
disk right now (so a purchase in one tab cannot be undone by a run in the other),
`saveBest()` MAXes against disk, and `saveLevelProg()` MAXes stars per level and unions
the unlock frontier.

### 4. MEDIUM — the ready handshake did not follow the portal contract. FIXED

`{sws:'ready'}` was posted only when `?embed=1` was in the query AND the page was framed,
and never on the `load` event. The portal arms a black-screen recovery timer per load and
auto-closes any frame that does not announce itself — the bug that bounced Litter Bug
players back to the arcade on 7/30. A card whose url moves to a github.io host is framed
*without* that flag, and would have been closed as a black screen.

**Fix:** gate on actually being framed, and post at parse time AND on `load`, per
`incoming/PORTAL-CONTRACT.md`.

### 5. NOT A DEFECT — the exit works and something calls it

`window.SWS_EXIT` falls back to `document.referrer` and then to the portal URL, so it does
not depend on being framed — which matters, because the portal navigates `/satellites/`
urls TOP LEVEL. And it is genuinely invoked: `tap('b-exit', ...)` at line 1927 binds the
"← All Sky Wolf games" button that renders on the title screen. Several games in this
fleet shipped a correct `SWS_EXIT` that nothing ever called; this one does not.

### 6. NOT A DEFECT — touch targets, fab, dashes, missing onerror

All measured rather than assumed:

- **Touch targets.** The 540x960 stage scales 0.6944 at 375x667. Every visible control on
  the title screen measures at or above 48 RENDERED px. The map cells and world tabs are
  declared at 72-76 stage px, which lands at 50-53 rendered. Zero under 48.
- **The feedback fab** sits at x 315..363, y 489..571 and overlaps nothing. Sproing's
  bottom-right corner is empty by construction — HUD controls are top-left
  (`#pausebtn`, `#mutebtn`) and top-right (`#coinbar`). Nothing to fix.
- **Dashes in player copy:** none. Every dash in the file is inside a code comment.
- **Missing `onerror`:** `loadDoodleSprite` has one and falls back to the baked default,
  and `applyEquip` has a terminal `else` that resets to `{type:'default'}`. A doodle whose
  PNG fails to decode degrades to a visible climber rather than an invisible player.

## IMPROVEMENTS MADE (and why they buy the most per minute played)

The two-tab merge in defect 3 is the improvement with the best return here, and it is not
cosmetic. This game's whole meta layer is the wallet: hats, themes, trails, five upgrade
tracks and 300 levels of stars all hang off `coins` and `levelProg`. A player who leaves a
tab open on their phone and opens the game again on the same browser was, until now,
silently rolling back their own shop. Everything downstream of the wallet gets more
trustworthy for one merge function.

Beyond that this pass is deliberately conservative. The spring is locked, the loop is
complete, the economy ladders sensibly, and the failure modes worth spending minutes on
were all in persistence rather than in play.

## WHAT STILL WORRIES ME

- **`sproing_acc`, `sproing_theme` and `sproing_trail` are raw strings**, not shape
  checked. They are safe today only because `accDef`/`themeDef`/`trailDef` all fall back
  to element zero on an unknown id. That is luck rather than design, and a future lookup
  written without the fallback would inherit a corrupt-save crash.
- **No dev/test hook.** Everything here had to be driven through real clicks and real
  time, which makes the suite slow and makes deep-run assertions (a full 1200m level
  clear, the Dandelion Save path, the star thresholds) impractical to verify headlessly.
  Slice 3D's `?dev=1` hook is the pattern; Sproing would benefit from the same.
- **`dayStr()` uses local time with no zero padding** (`2026-8-16`, not `2026-08-16`).
  It is only ever compared to itself so it works, but the streak, the free Dandelion Save
  and the Morning Dew bonus all key off it, and a player crossing a timezone can collect
  the daily twice or lose a streak. Not touched: it is a design call about which clock the
  daily should follow.
- **Emoji render as tofu boxes in headless Chrome** (no emoji font installed). Cosmetic
  and environmental, not a real defect, but it means screenshots from CI cannot be trusted
  to judge the icon buttons. Judge those on a device.
