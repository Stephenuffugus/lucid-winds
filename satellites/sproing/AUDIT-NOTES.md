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
  through actual DOM clicks and real keyboard input — at audit time this game exposed no
  dev hook, so everything below was reached the way a player reaches it. (One was added
  afterwards; see improvement B.)
- Corrupt-save cases poison one key per boot in a **fresh browser, launched and closed**.
  An IIFE that dies at parse dies once per document, so a shared context would let a later
  case pass for the wrong reason. Reusing one browser across ~30 boots also exhausts it on
  a 2-core box and the run dies on a navigation timeout, which reads exactly like "the game
  stopped loading" and is nothing of the kind.
- Every assertion in `audit-check.mjs` was watched FAIL on purpose before it was trusted.
  Its first full run produced **three red assertions that were all the probe's fault, not
  the game's** — worth writing down, because each is a trap the next audit will hit:
  - **The first-run coach modal.** `launch()` shows "How to climb" and sets
    `game.paused = true`. A probe that ignores it is measuring a paused game behind a
    full-screen overlay, so `pauseRun()` correctly no-ops (it refuses to pause an already
    paused game) and `elementFromPoint` correctly returns the modal. Two of the three
    failures were this. The suite now dismisses the coach — and asserts it appeared and
    could be dismissed, because a first-run tutorial that never shows is its own bug.
  - **The fab overlapping itself.** The feedback fab *is* a `<button class="lwfb-fab">`,
    so an unfiltered "does the fab cover a button" scan finds it covering itself and
    reports a defect that does not exist. The scan now excludes the fab and its badge.
  - Also worth knowing: `p-quit` "worked" in that failing run only because `.click()` on a
    hidden element still fires its handler. That is the `el.click()` trap — it proves a
    handler is bound, never that a player can reach the control.
- **The title screen is static HTML, so "it rendered" proves nothing.** Every corrupt-save
  case therefore asserts that a *button does its job* — PLAY reaches mode select, Adventure
  reaches a 25 cell map, the shop renders rows — because the exact failure being guarded
  against is a dead game that looks perfectly healthy.

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

- **Touch targets — measured twice, because the first measurement was misleading.**
  The 540x960 stage scales 0.6944 at 375x667. Map cells and world tabs are declared at
  72-76 stage px, landing at 50-53 rendered: fine.

  But `.icobtn` is declared **56 stage px, which is 38.9 RENDERED px** and would fail the
  48 rule outright on its box. It passes only because of `.icobtn::after{inset:-8px}`,
  which extends the real hit area to 72 stage px / 50 rendered. Two ways to get this
  wrong, and this audit nearly took both: a box-only `getBoundingClientRect` check
  condemns a control that is genuinely fine, and an `el.click()` check passes a control
  that is genuinely unreachable because it skips hit testing entirely.

  The suite now probes with `document.elementFromPoint` at the 48px extremes and asks who
  actually receives the tap. It also reports which boxes are under 48 and surviving on
  their expander, so nobody deletes that `::after` thinking it is decoration. **It is
  load bearing.**

  Worth flagging separately: `#pausebtn` and `#mutebtn` live in `#hud`, which is
  `display:none` on every menu screen. A touch-target sweep taken on the title screen —
  the obvious place to take one — never sees the two controls a player actually uses
  during a run. Phase 5b of the suite starts a run first, on purpose.
- **The feedback fab** sits at x 315..363, y 489..571 and overlaps nothing. Sproing's
  bottom-right corner is empty by construction — HUD controls are top-left
  (`#pausebtn`, `#mutebtn`) and top-right (`#coinbar`). Nothing to fix.
- **Dashes in player copy:** none. Every dash in the file is inside a code comment.
- **Missing `onerror`:** `loadDoodleSprite` has one and falls back to the baked default,
  and `applyEquip` has a terminal `else` that resets to `{type:'default'}`. A doodle whose
  PNG fails to decode degrades to a visible climber rather than an invisible player.

## IMPROVEMENTS MADE (and why they buy the most per minute played)

### A. The two-tab merge (defect 3) — best return per minute of the lot

Not cosmetic. This game's whole meta layer is the wallet: hats, themes, trails, five
upgrade tracks and 300 levels of stars all hang off `coins` and `levelProg`. A player who
leaves a tab open on their phone and opens the game again in the same browser was, until
now, silently rolling back their own shop. Everything downstream of the wallet gets more
trustworthy for one merge function.

### B. A `?dev=1` test hook, so this game is auditable at all

The only structural gap this audit hit. Sproing exposed nothing, so every check had to be
driven through real clicks and real wall-clock time — which is why the deep assertions a
300 level game most needs (a full 1200m clear, the Dandelion Save path, whether the three
star thresholds are actually reachable) could not be verified headlessly at all. They are
still not verified. Nobody has proven this game is completable past the levels a bot can
stumble into.

Added `window._SP` behind `?dev=1`, matching Slice 3D's pattern: read-only accessors for
screen, run state, level progress, wallet, stats and settings, plus `launch`, `pause`,
`resume`, a hand-driven `step(n)` over the fixed timestep, and `input(dir)`. It changes
nothing about how the game plays and is absent from a normal session. It is what makes the
next audit of this game cost hours instead of days.

Beyond those two this pass is deliberately conservative. The spring is locked, the loop is
complete, the economy ladders sensibly, and the failure modes worth spending minutes on
were all in persistence rather than in play.

## SECOND PASS, 2026-08-16 (the first agent was cut off mid-audit)

Everything the section above claims was **re-verified in the file**, not taken on trust,
because the agent that wrote it never got to run its own suite to green. All four fixes are
genuinely applied: `LS.getJSON` takes the shape from the default it was handed (line 402),
`getInt` guards the numeric keys (413), `levelProg.stars` is shape-checked as a nested map
(1205), `writeCoins`/`saveBest`/`saveLevelProg` are read-modify-write (442-447, 1209), the
ready handshake is gated on being framed and fires at parse AND load (2019), and the
`?dev=1` `window._SP` hook is present (1993). Nothing was half applied.

### The one red assertion was the PROBE, not the game

`FAIL the HUD is up during a run -> {"hudOn":false,"alt":"29m","screen":"s-over"}`.

Reproduced first, then traced. `show(id)` toggles `#hud.on` with `id===null`, so the moment
`onGameOver()` calls `show('s-over')` the HUD comes down **on purpose** — a HUD left floating
over the game-over panel would be the actual defect. The probe steered blindly for six
seconds and then asserted the HUD, and a bot with no real steering falls: my reproduction died
at 101m, the reported one at 29m. Intermittent, which is worse than always-red, because it
passes on the runs where the bot happens to survive and looks like flake.

Fixed in the probe, two ways:
- The HUD is now sampled the instant the coach is dismissed, when the run is provably alive
  (`hudAtStart` + `screenAtStart`), and that is what "the HUD is up during a run" asserts.
- A new assertion says the HUD must **follow** the run state: up while the screen is `(game)`,
  down the moment any screen takes over. That covers the real defect in both directions
  instead of asserting "up" at a moment the run may already have ended.
- Phase 5b had the same latent flake (it idled 1.7s before measuring the in-run HUD hit
  areas, and a dead run would have measured a `display:none` element). It now checks the run
  is alive and climbs again if it is not.

### CLASS 9 — a stated promise that is not true. FOUND AND FIXED

Zen. `commitRun()` returns early on `game.zen` and banks nothing, which is correct: a
deathless mode must not be farmable. But the HUD coin bar counted the run's coins up in Zen
exactly as it does in Endless, `pauseRun()` printed the same total, and the wallet then
received none of it. The economy was right and **the readout was the lie**. Both readouts now
say `practice`, and mode select states it before you pick: "Zen: you cannot fall out. Practice
only, so coins are not kept."

Do NOT "fix" this by banking Zen coins — a mode you cannot die in would print money.

Class 9 was also swept across the rest of the game's copy and the rest holds up. Checked
against the code, not assumed: all five shop upgrades are consumed (`luckyMult`, `passiveMag`,
`springHops`, `charmF`, and the `sturdy` branch in the death handler), every achievement's
test matches its sentence (including "Hit a x4 chain", which reads `maxChain>=35` and looks
wrong until you find `chainMultVal()` — 35 hops IS x4), and the two locked skins' "🔒 3000m" /
"🔒 7-day streak" labels are the conditions `isUnlocked` actually reads.

## SUITE

`node satellites/sproing/audit-check.mjs` (repo root served on :8777) — **68 passed, 0 failed**,
exit 0. Watched go red on purpose: the HUD assertion above reproduced red twice before it was
diagnosed, and the suite exits 1 with a red assertion. Seven phases:
26 corrupt-save poisonings that each prove a *button still works* rather than that a page
still renders, sane-value fallbacks, the two-tab merge driven through a real shop purchase,
the core loop including onboarding escape, **the Zen class 9 pair (Zen says practice and banks
nothing, a paying mode shows a number and banks it — the second half is what stops the
`practice` label leaking into a mode that pays)**, the standing defect classes, the in-run HUD
touch targets, and the portal ready handshake in a real iframe with no `?embed=1`.

## THE FIRST THIRTY SECONDS — looked at, one reservation

Screenshotted the onboarding studio at 375x667 rather than reasoning about it. A brand new
player presses PLAY and lands on a blank cream canvas headed "Draw your climber", with the
brush, colour and tool rows below it and **"✓ Save & Equip" sitting right on the bottom
edge**. The two buttons underneath it, "🗂 Sketchbook" and **"✨ Example"**, are below the
fold inside `.studio-wrap`'s scroll area.

"✨ Example" is the escape hatch for a player who does not want to draw, and it is the one
control they cannot see. The flow does self-correct — pressing Save with too few strokes
raises a modal that offers "Use example" as a button — so nobody is stuck, and this is
recoverable rather than broken.

Left unchanged on purpose. It is an onboarding layout call rather than a defect, the spring
is locked, and re-flowing that column is exactly the kind of edit that broke two touch
targets in Slice 3D during this same session. Flagging it beats churning it.

## WHAT STILL WORRIES ME

(second pass) The completability debt below is **still open and still unpaid**. The `?dev=1`
hook now has a customer — phase 4b drives Zen and Endless through it — so the tooling excuse
is gone, but no assertion covers a 1200m clear, the three star thresholds or the Dandelion
Save. That is the single biggest hole left in this game's coverage.

- **`sproing_acc`, `sproing_theme` and `sproing_trail` are raw strings**, not shape
  checked. They are safe today only because `accDef`/`themeDef`/`trailDef` all fall back
  to element zero on an unknown id. That is luck rather than design, and a future lookup
  written without the fallback would inherit a corrupt-save crash.
- **Nobody has proven this game is completable.** 300 levels, and the deepest thing
  verified here is that a run starts, scores, pauses and ends. The `?dev=1` hook added in
  improvement B is the tool for it, but the proof itself has not been written: no assertion
  covers a real 1200m clear, the three star thresholds, or the Dandelion Save. This project
  has already had a completability proof sit red for six weeks because replaying it needed
  a browser nobody ran — treat this as the same debt, not as covered.
- **`dayStr()` uses local time with no zero padding** (`2026-8-16`, not `2026-08-16`).
  It is only ever compared to itself so it works, but the streak, the free Dandelion Save
  and the Morning Dew bonus all key off it, and a player crossing a timezone can collect
  the daily twice or lose a streak. Not touched: it is a design call about which clock the
  daily should follow.
- **Emoji render as tofu boxes in headless Chrome** (no emoji font installed). Cosmetic
  and environmental, not a real defect, but it means screenshots from CI cannot be trusted
  to judge the icon buttons. Judge those on a device.
