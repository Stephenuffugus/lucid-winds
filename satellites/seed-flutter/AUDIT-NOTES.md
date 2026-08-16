# SEED FLUTTER (ships as "Cosmic Cadets") — audit, 2026-08-16

Read end to end (1170 lines) before any edit. Defect list written first, fixed worst first.

## Core loop, start to finish

Title → four modes (Endless Drift, Daily Gust, Gauntlet, Zen) → bare-canvas play → results →
Again / Sky Map / Menu / Share. Wardrobe and Sky Map are real screens with real content.
No stub screens. No mode dead-ends: every mode reaches `showResults` and every results button
lands somewhere valid. Daily is a finite 45-gap seeded course; Gauntlet is 4 boss legs; Zen is
no-fail. Difficulty is REAL, not flat: `scrollSpeed()` and `gapHalf()` both ramp with `G.gaps`,
wind amplitude ramps after gap 6, and the gauntlet adds `G.leg*12` speed and `-G.leg*6` gap.

## Defects found (worst first)

1. **CORRUPT SAVE IS A DEAD END (class 3).** `seedflutter_save` is loaded with a bare
   `for(var k in s) PROG[k]=s[k]`. Anything that merely parses is copied in wholesale. Two live
   crash paths, both silent to the player:
   - `{"blooms":5}` → `PROG.blooms` is a number, the `if(!PROG.blooms)` guard passes (5 is
     truthy), then `PROG.blooms.push(...)` in `endRun()` throws **inside the run**, so the game
     freezes on the death animation and never reaches results.
   - `{"owned":7}` → the file is in `"use strict"`, so `PROG.owned[k]=1` inside `ownedC()`
     throws TypeError on a primitive. Every wardrobe card click dies.
   - `{"blooms":{}}` → `renderGrove()` reads `.length` as undefined, the loop never runs, and
     the "No stars yet" branch is also skipped, so the Sky Map renders **completely blank with
     no message**. Plausible-looking, totally wrong (class 5).
2. **TWO TABS CLOBBER (class 4).** `save()` is `LS.set(key, JSON.stringify(PROG))` from a boot
   snapshot. Coins earned in tab A are erased the moment tab B finishes a run. `bestDist`,
   `grewTotal`, `streak`, purchased `owned` entries and the `blooms` list all lose whichever
   tab wrote last.
3. **IN-PLAY HUD BUTTONS UNDER 48px RENDERED (class 6).** `HB_MENU` and `HB_RETRY` are declared
   48x48 in a 540x960 stage that is transform-scaled. At 375x667 the scale is 0.694, so both
   render at **33.3px**. These are the only two controls in play, and the menu one is the only
   way out of a run without dying. (The DOM buttons are fine — they are 72px on purpose, which
   is exactly why the canvas ones are wrong.)
4. **`_sbCapEarn` can double-pay past the cap (class 5).** If `localStorage.setItem` throws
   (Safari private mode, quota) the `catch(e){}` swallows it, `granted` stays 0 and the earn is
   skipped — that half is correct. But the day bucket is never written, so the daily cap resets
   on every run for that player. Silent, and it favours the player, which is why nobody notices.
5. **Exit affordance is real but inherited.** `/arcade-exit.js` supplies `SWS_EXIT` and appends
   a button to `#s-title`, and the referrer fallback is correct (class 1 satisfied) — but the
   game itself has no `SWS_EXIT` at all, so if the shared script 404s the player is stranded in
   an installed PWA with no back gesture. Verified by assertion rather than assumed.
6. **The first thirty seconds do not teach the game on the play surface.** The rules live on
   the title ribbon and the How screen. In play the cadet hovers until the first tap with no
   on-canvas prompt, and the whole Perfect/Bloomstreak mechanic — the thing the game is
   actually about — is never named where the player is looking.
7. **No dashes in player copy** (class 7) — checked, clean.
8. **No overlay covers a control** (class 8) — the buy-confirm dialog is `z-index:60` inside
   `#stage` and covers only the wardrobe grid, which is intended. The feedback fab's footprint
   is bottom-right; the two canvas HUD buttons are top-left and top-right.

## Fixes applied

- **1 fixed.** `PROG` now loads through a per-key validator (`_num`, `_arrNum`, `_obj`, `_str`).
  A save that parses to a string, a number, an array or an object with wrong-typed members can
  no longer poison state; anything unrecognised falls back to the default.
- **2 fixed.** `save()` re-reads the stored record and MERGES: `bestDist`/`bestGauntlet`/
  `grewTotal`/`streak` take MAX, `coins` adds this tab's delta since its last write, `blooms`
  concatenates only this tab's new entries, `owned` unions. Equipped cosmetic ids are last-write
  (a preference, not a counter). `PROG` is then rebased on the merged result so the tab shows
  the truth.
- **3 fixed.** HUD hit boxes and art are now 70x70 in stage units (48.6px rendered at 375x667)
  and sit clear of each other and of the HUD text.
- **4 fixed.** The bucket write is now checked; if storage is unavailable the earn is skipped
  rather than granted uncapped.
- **5 fixed.** The canonical embed block from `incoming/PORTAL-CONTRACT.md` now ships in the
  page itself, and something calls it: `SWS_EXIT` is defined at parse time, `{sws:'ready'}` is
  posted at parse and on load when genuinely framed, and the title screen gets its own
  "All Sky Wolf games" button. `/arcade-exit.js` sees `window.SWS_EXIT` already defined and
  correctly does nothing, so there is exactly one exit button, not two.
- **6 improved.** A one-line on-canvas coach appears for the first six gaps of a run:
  "Tap to flap" before the first tap, then "Thread the star in the middle for a Perfect".
  This is the highest-value minute in the file: the Perfect band is the entire scoring system,
  the whole cosmetic economy hangs off `bestCombo`, and a player who never learns it sees a
  flappy clone with no reason to come back.

## What still worries me

- The wardrobe is 90+ entries deep with no filter or sort. It is a wall, and the six style
  collections all look alike at 96x64. Not touched — that is an art/IA call, not a defect.
- `PROG.blooms` is capped at 240 but `grewTotal` is not, so the Sky Map stops growing visibly
  long before the counter does. Deliberate as far as I can tell, but it reads as a bug.
- The daily course is generated from `dateSeed()` in LOCAL time, so two players in different
  time zones fly different "same" courses. Left alone: fixing it changes today's course.
