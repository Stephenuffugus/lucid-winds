# Jimothy on Steam: controller, crispness and lag (Sep 16 evening)

Release is **Fri Sep 18 10:01 EDT**. Stephen presses Release App. Anything here ships as build r5
(web first, then `store/jimothy-steam/vendor.sh`, package, vault, his upload, set live on default).

## 1. His notes, verbatim (Sep 16, first install on Jessie's Windows laptop, PDP Afterglow wired Switch pad)

> okay so it might just be my switch afterglow controller being weird but when looking at how to play ic ant scroll up and down with either the d pad or analog sticks im getting some mad lag in the beginning. i have to press the y button to select not a, b doesnt go back, and it only counts the analog stick. i want to be able to use the d pad like we had said, achoivements ticked right away which is cool. it keeps lagging a little and the analog stick messes up and sends me sideways into an enemy and thats why we need the d pad working. oither than that it seems to be running okay also i cant use the left analog stick, the only one that does anything, to move offacreen. like im looking at the prize bin and i have to put two fingers up to actually scroll and i cant see the curser cuz its off screen. the screen should follow the cursor so as i move down with the cursor, the screen follows it down, is the redeem a code still in there for skin unlocks? like i can publish codes to people to unlock skins or share it in a group or something that says follow on facebook or check our facebook for a code to unlock xyz. not sure the move i thought we just had them all unlockable, i should be able to click on the badges and see what theyre for in the menu. this is all on my steam play of jumping jimothy, theres no back button so i have to switch to the track pad and move with that and click back with the mouse. why the fuck cant i do it with a controller? its also showing the frogothy and dinothy and all the skins that come from playing days in a row. did we switch that up for the steam build i thought? a lot here and we have 36 hours to get it all tight

> its also maybe just a little fuzzy on her computer which has me super nervous its going to look liek shit if someone puts it on a tv but i dont know what i could do at this point. also these are pretty seriosu things we need done and im concerned we may want to use fables brain for this.

> theres also no way to stop the music or pause it

## 2. Sorted

| # | note | kind | cause found in the code |
|---|---|---|---|
| 1 | Y selects, A does not | FAULT | The pad poll (`index.html`, `GAMEPAD` IIFE in `boot()`) reads only the **standard** mapping: A = `buttons[0]`. His Afterglow is a raw HID pad (`mapping !== 'standard'`), whose order is Y B A X L R ZL ZR − + LS RS Home Capture, so `buttons[0]` is **Y**. |
| 2 | D-pad does nothing, only the left stick | FAULT | D-pad is read from `buttons[12..15]` only. A raw HID pad reports the D-pad as a **hat axis** (Chromium on Windows: one axis, 8 positions at `-1 + k*2/7`, neutral ≈ 1.2857). Never read. |
| 3 | B does not go back, no way back without the mouse | FAULT | `backOf()` matches text `^(back|close|…)` or id `^(b-back|back|close)`. The real buttons read `◄ Back`, `Got it`, `◄ Leave the run` with ids `set-back`, `how-back`, `ach-back`: **none match**, on any pad. |
| 4 | How to Play cannot be scrolled | FAULT | `targets()` drops everything outside the viewport, and a text screen has no buttons to move between, so up/down do nothing. |
| 5 | Prize Bin: the cursor goes off screen, the screen does not follow | FAULT | Same filter: off-screen cards are not targets, so the ring can never reach them; there is no scroll-follow. |
| 6 | No way to stop or pause the music | FAULT (pad) | The Music switches in Settings and Pause are `div.toggle`, not in the `targets()` selector, so a pad can never reach them. Mouse and touch can. |
| 7 | "mad lag", "keeps lagging a little" | FAULT | (a) `targets()` runs **every frame** while a pad is connected: every button's rect plus an `elementFromPoint` each, 60 times a second, on the busiest screens. (b) `steamworks.js` `electronEnableSteamOverlay()` with no argument starts a **60 Hz `setInterval` calling `webContents.invalidate()`**, not vsync-aligned: a full repaint 60 times a second even on a still menu, plus frame pacing jitter in play. |
| 8 | Stick sends him sideways into an enemy | FAULT | In a run the stick fires up/down and left/right independently at 0.5, so a diagonal push hops twice (forward AND sideways). |
| 9 | A little fuzzy; worried about a TV | FAULT | The canvas backing store is fixed at `540*min(2,dpr)` at boot, then the whole stage is scaled by CSS `scale(s)`. On a 1080p TV at dpr 1, s = 1.125, so every game frame is upscaled. The canvas should be sized to the real device pixels (`dpr*s`) and re-sized in `fit()`. |
| 10 | Tap a badge to see what it is for | FEATURE (small) | Badge cards print the description in small text but have no tap. |
| 11 | Froggothy, Dinothy and the other streak costumes show on Steam | ALREADY DONE | Store builds earn them by clearing Adventure levels 10, 20 … 100 (`STORE_UNLOCKS`, since Aug 18, so r4 has it). The headers read "Earn These By Playing". The cards show which level. |
| 12 | Is code redeem still in? | ALREADY THERE | Settings → Redeem a code, and the Prize Bin code row. Words live in `CONTENT-MAP.md` (never in the game file). `node scripts/make-code.js WORD` mints new ones. The five promo costumes also unlock by level on Steam (60–100). |
| + | Achievements ticked right away | GOOD NEWS | First real-hardware proof that the Steamworks bridge records unlocks. |

## 3. The fix (one builder, `satellites/stream-hop/index.html` + `store/jimothy-steam/main.js`)

**Pad layer.**
- Read buttons by **label**: standard mapping uses the Xbox order; a raw pad whose id names Nintendo, Switch, Pro Controller, PDP `0e6f`, PowerA `20d6`, HORI `0f0d` or `057e` uses the Switch HID order (Y=0, B=1, A=2, X=3, L=4, R=5, ZL=6, ZR=7, −=8, +=9). A standard-mapped Nintendo pad (Chromium maps the Pro Controller by position) swaps A and B so the button **labelled** A confirms.
- Unknown raw pads use the standard order.
- A Settings switch, "Swap A and B", overrides the guess for any pad.
- D-pad: `buttons[12..15]` when standard, plus any axis that has ever read outside ±1.01 is a hat and is decoded into the four directions.
- Minus / View toggles the music anywhere, with a toast.
- Targets are computed **only when a button fires**, never per frame. They include `.toggle`. They include cards clipped by a scroll container when that container itself is not covered.
- Moving focus scrolls its scroll container so the ring stays in view (the screen follows the cursor). When there is no target within reach in that direction and the container can scroll, up/down scroll the text instead. The right stick scrolls too.
- B finds the back control per screen (explicit ids first, then words: back, got it, close, done, not now, cancel, leave), closes an open overlay before anything else, and never leaves a run by itself.
- In a run the stick hops along its **dominant** axis only, fires at 0.6, re-arms below 0.35, and repeats only along the axis it started on. The D-pad keeps its repeat.

**Crispness.** `fit()` sizes the canvas to `VW*dpr*s` (clamped 1 to 3), re-applies the transform and keeps the frozen frame when not running.

**Shell.** `electronEnableSteamOverlay(true)` and our own 10 Hz invalidator, so the overlay still draws on a still menu without a 60 Hz repaint.

**Badges.** Tapping a badge shows its name, what it is for and whether it is earned.

## 4. Proof required before r5 is packaged
- `test/gamepad-check.mjs` grows a raw Switch pad (hat D-pad, Y B A X order) and a standard pad. It must:
  - press A by label;
  - go back with B on every menu screen;
  - reach the Music switch;
  - scroll How to Play;
  - reach the last Prize Bin card with the ring on screen;
  - hop once along the dominant axis on a diagonal stick;
  - show no per-frame target scan.
- Every new law is watched RED on a plant first.
- Shots at 1920x1080 dpr 1 and at the aspect-locked window, looked at.
- `node test/jimothy-check.js` and the root `node test/sw-lockout.mjs` stay green.
- Steam: `vendor.sh`, `runtime_preflight`, `test/electron_boot.mjs`.
