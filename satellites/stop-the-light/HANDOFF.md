# Stop the Light — handoff

Slug: `stop-the-light`
Built: 2026-08-07. Build stamp in game: `v1.0` (bottom of the menu).

---

## 1. Deploy

Not deployed yet. This folder is the whole game.

- **Serve path when vendored:** `lucidwinds.com/satellites/stop-the-light/`
- **Pages:** whatever branch/path the rest of the fleet uses. Nothing here needs
  a build step, an Action or a config file. Copy the folder, done.
- Every path in `index.html` is relative. The only file it references is
  `thumb.png`, and only from the `og:image` / `twitter:image` meta tags, so a
  missing thumb costs a link preview and nothing else.
- **No service worker ships with this game.** Nothing to strip when vendoring.
  There is no `manifest.webmanifest` either.
- Verified over HTTP: the page makes exactly **one** network request, itself.
  No fonts, no CDN, no favicon fetch (the icon is an inline SVG data URI), no
  analytics, no SDK.

## 2. File manifest

| File | Size | What it is |
|---|---|---|
| `index.html` | 54 KB | The entire game. Markup, CSS, JS, art, audio, all inline. |
| `thumb.png` | 167 KB | Portal card source. 500x500, cropped from the live menu. |
| `HANDOFF.md` | — | This file. Not deployable, harmless if it ships. |

Deployable total: **221 KB** (244 KB with this handoff file in the folder).
Nothing else is required.

## 3. Portal card copy

**Hook:** A firefly circles a ring of petals. Stop it, then decide whether to
keep what you won.

**Paragraph:** Stop the Light is the arcade ticket wheel with a real game inside
it. A firefly runs a ring of night petals and one tap stops it. Land in the gold
band and you keep going. Land in the pale heart and the stop pays triple. Then
comes the part that actually matters: bank the sparks you are holding, or go
again for more on a narrower band. Miss and the whole unbanked pot is gone. The
ring never runs at one flat speed, it swells and eases in a pattern that stays
the same for the whole run, so you learn tonight's rhythm rather than counting
frames. From round five the band starts drifting too, and you are stopping a
moving light on a moving gap. Three fireflies a run, a run summary, a personal
best, and one nightly ring that everyone plays on the same rhythm.

## 4. Earn moments

Announced with `parent.postMessage({sws:'earn', moment, detail}, '*')` **only**
when `window.SWS_EMBED` is true. The game never sets an amount. All four are
deduped in localStorage so replays cannot re-fire them.

| moment | detail | gate | rough frequency |
|---|---|---|---|
| `first_bank` | `{round, pot}` | **once ever** | once, in a player's first minute or two. Almost everyone hits it on their first run. |
| `deep_run` | `{round, pot}` | **once ever**, needs a bank at round 8 or deeper | rare. A new player will not get it. Typical player lands it somewhere in sessions 3 to 10. |
| `daily_done` | `{score, date}` | **once per calendar day**, fires when the nightly ring's run ends | at most 1 per day per player, and only if they play the nightly ring. |
| `personal_best` | `{score, previous}` | **once per calendar day**, and only on a genuinely higher free-run total | 1 to 3 on a player's first day, then it decays hard. Day one a player may set 2 or 3 bests in a session; after a week it is maybe one every few days. |

Casual solid session estimate: **2 to 3 moments** (`daily_done` + usually one
`personal_best`, plus the one-time pair on the first ever session). That lands
in the 20 to 40 sunbeam band if the host prices moments at roughly 10 each and
gives `deep_run` / `first_bank` a bigger one-time bump.

The game's own currency is **sparks**. It is internal only, stored nowhere the
host reads, and never converted. All of it flows through one object:

```js
var Wallet = { sparks:0, earn:function(n, reason){...}, moment:function(name, detail){...} };
```

`Wallet.earn` is called from exactly one place, `doBank()`. `Wallet.moment` is
called only through the four gated `fire*` helpers.

## 5. Nav map

Screens are internal `display` switches. Nothing calls `history.back()` or
touches `location` except `SWS_EXIT`.

```
s-title  (MENU)
  Play a run ........... -> s-how (mode free)
  Tonight's ring ....... -> s-how (mode daily); disabled once today's is done
  How to play .......... -> s-how (read only, no start button)
  Settings ............. -> s-set
  < All Sky Wolf games . -> SWS_EXIT()      <-- the only exit in the game

s-how   (RULES, always shown before play)
  Release the firefly .. -> s-play, starts the run
  < Menu ............... -> s-title, or back to the paused run if it was
                            opened from the pause overlay

s-play  (transparent HUD layer over the canvas)
  the canvas itself .... one tap stops the light
  pause button ......... -> o-pause
  Space / Enter ........ stop the light
  Escape ............... -> o-pause

o-choice  (THE DECISION, no dismiss on purpose, you must pick)
  Bank N ............... banks, ends that firefly's chain
  Go again ............. next round

o-pause
  Resume ............... back to s-play, re-arms after a fresh look
  How to play .......... -> s-how, and its back returns here
  End the run .......... -> s-sum with everything already banked intact

o-note  (one time drift telegraph, before round 5 the first time ever)
  Ready ................ starts round 5

s-sum   (RUN SUMMARY)
  Play again ........... -> s-how (free)
  Tonight's ring ....... -> s-how (daily); disabled once today's is done
  < Menu ............... -> s-title

s-set   (SETTINGS)
  Sound / Extra motion / High contrast band toggles
  Clear my scores
  < Menu ............... -> s-title
```

**Embed snippet:** pasted verbatim, unmodified, in its own `<script>` before the
game script. `SWS_EXIT()` is wired to `#b-exit` on the menu and nowhere else.
Confirmed in a real iframe with `?embed=1`: `{sws:'ready'}` posts on load, the
exit button posts `{sws:'close'}`, and the iframe URL never changes.

**The Skitterlings bug:** every screen change goes through one `show(id)` which
calls `closeAllOverlays()` first, so no back or X can leave a translucent layer
painted on top. Verified headless by walking each exit and listing every element
whose computed `display` is not `none` and `opacity` is above 0.01. Every path
came back with exactly one visible screen and zero overlays.

## 6. Thumbnail

`thumb.png`, 500x500, 167 KB. A crop of the live menu: title, the ring of
petals, the gold band with its pale heart, and the firefly sitting at the band's
leading edge. Regenerate any time by loading the page at a 540x960 viewport and
screenshotting `{x:20, y:6, width:500, height:500}` about 2.4 seconds in, which
is when the attract firefly reaches that spot.

## 7. localStorage keys

All writes are wrapped in try/catch, so private mode degrades to a session-only
game rather than throwing.

| key | shape | holds |
|---|---|---|
| `stl_best` | number as string | best free-run total, in sparks |
| `stl_daily_best` | number as string | best nightly-ring total ever |
| `stl_daily` | `{date:"YYYY-MM-DD", score, deepest}` | today's nightly ring result. Present and matching today = the nightly ring is spent. |
| `stl_stats` | `{runs, banks, deepest, totalBanked, hearts}` | lifetime counters, shown on the settings screen |
| `stl_moments` | `{first_bank:0|1, deep_run:0|1, pb_date:"", daily_date:""}` | the earn-moment dedupe gates |
| `stl_seen` | `{drift:0|1}` | whether the one-time drift telegraph has been shown |
| `stl_set` | `{sound:0|1, motion:0|1, contrast:0|1}` | settings. `motion` defaults to 0 when the browser reports `prefers-reduced-motion: reduce`. |

"Clear my scores" in settings removes `stl_best`, `stl_stats`, `stl_daily`,
`stl_daily_best` and `stl_seen`. It deliberately leaves `stl_moments` alone so
clearing scores cannot be used to farm the one-time earn moments, and leaves
`stl_set` so the player keeps their sound and motion choices.

## 8. How the game is tuned, and how to change it

Everything that shapes difficulty lives in four small functions near the top of
the game script. No level data, no generator, no external tool.

```js
roundValue(r)   // [_,10,15,25,40,60,90,130,190,270,400], then x1.45 per round
bandDeg(r)      // [_,66,58,50,44,38,50,34,30,26,22], then shrinking to a floor of 13
lapSec(r)       // 2.45 down to 1.15 seconds per lap; round 6 gets +0.28
ampFor(r)       // 0.18 up to 0.50 speed swing; round 6 gets -0.08
driftsOn(r)     // r >= 5 and r !== 6
```

**Round 6 is the bloom round** and it is deliberately out of line: wider band,
slower lap, calmer swing, no drift, and a payout jump to 90. It exists so the
climb is not one flat ramp of tension. If you retune, keep a breather in there.

**The rhythm.** Speed is `base * (1 + amp * sin(k*theta + phase))`, a pure
function of the light's angle. `k` is an integer (2 or 3), so the pattern is
continuous across the lap seam. `phase` and `k` are rolled once per run and held
for the whole run, so a player learns tonight's flower. The light never reverses,
never jumps, and its speed never changes at the instant of a tap. `base` is
solved exactly from the target lap time as `1/(lapSec * sqrt(1 - amp^2))`, which
is the closed form for the mean lap time of that easing.

**The fairness floor.** After the band is placed, `startRound` **integrates the
round forward from its own start state** (`windowMs`) to find how long the light
actually spends inside the band, then widens the band until that measured window
is at least 62 ms and the heart at least 40 ms.

It has to be integrated, not solved. The first build estimated the window from
`speedAt(bandCentreAtStart)`, which is the wrong angle: the light takes 0.3 to
1.5 seconds to reach the band, the band drifts under it the whole way, and with
`amp` up to .5 the ring runs three times faster at the crest of a swell than in
the trough. Measured against the live code at 375x667 that estimate shipped
these, well under the floor it claimed:

| round | band | heart | verdict |
|---|---|---|---|
| 10 | 58 ms | 29 ms | under floor |
| 11 | 51 ms | 22 ms | under floor |
| 12 | 41 ms | 20 ms | two frames wide |
| 16 | 48 ms | 24 ms | under floor |
| 20 | 44 ms | 22 ms | under floor |

With `windowMs` driving the widening loop, 42 consecutive rounds sampled to
round 21 on two different fireflies came back with a minimum of **79 ms band /
39 ms heart**, and the shape of the run is unchanged up to round 7:

| round | band | heart | drift |
|---|---|---|---|
| 1 | 514 ms | 181 ms | none |
| 4 | 202 ms | 67 ms | none |
| 5 | 200 ms | 66 ms | +0.10 rev/s |
| 6 | 366 ms | 129 ms | none (bloom round) |
| 8 | 79 ms | 39 ms | -0.25 rev/s |
| 12 | 80 ms | 40 ms | -0.30 rev/s |
| 20 | 83 ms | 41 ms | -0.30 rev/s |

The loop costs about 0.2 ms and runs once per round, not per frame.

**The drift.** From round 5, the band slides. Odd rounds drift with the light
(relative speed drops, gentler), even rounds drift against it (harder). The rate
is capped below the light's own slowest speed so the band can never outrun the
firefly. The first time a player ever reaches round 5 they get a full-screen
telegraph before the round starts, gated on `stl_seen.drift`.

**The tap is honest to the millisecond.** `stopLight` reads the pointer event's
`timeStamp` and integrates the light forward from the last rendered frame, so
the result is not snapped to a 16 ms frame boundary. That sub-frame advance is
capped at 50 ms, the same cap the frame loop uses, so a stuttering device can
never judge a player on light they did not see.

**Adding content.** There is nothing to generate. To extend the game, extend the
tables above, or add a phase to the state machine in `startRound` /
`openChoice` / `doBank` / `loseChain`.

**Test hook.** `window.STL` exposes `state`, `settings`, `launch(mode)`,
`stopNow()` and `aim('heart'|'band'|'miss')` so a headless harness can play a
deterministic chain. **It only attaches when asked for: load `?stl_test=1`, or
set `localStorage.stl_test='1'` for a harness that navigates between pages.**
It used to attach unconditionally, which was wrong: `state` is the live mutable
`G` and `aim('heart')` is a one line guaranteed perfect stop, so any player with
a console could bank an arbitrary personal best and fire the `deep_run` earn
moment at the host.

## 9. What was verified, headless, at 375x667

- Full round played to completion. A 9 round chain banked 880 sparks, with a
  heart on round 3 paying 75 instead of 25. Arithmetic checked by hand.
- Rules screen is shown before every play and is re-openable from the menu and
  from the pause overlay. It fits without scrolling at 375x667.
- Every menu button's centre point hit-tests to itself (`elementFromPoint`), not
  to something sitting on top of it.
- Rendered touch targets at 375x667: menu buttons **51.4 px**, pause button
  **51.4 x 51.4 px**, choice buttons **77.8 px**. All above the 48 px floor.
  These are rendered pixels after the 0.694 stage scale, not CSS pixels.
- A real `touchscreen.tap` on the play field stops the light and resolves.
- Space and Enter stop the light. Escape opens pause. Resume re-arms.
- The four lap tire-out fires at 4.01 revolutions and costs a firefly.
- The nightly ring is seeded from the date: the same rhythm, the same first band
  position across a reload. It locks after one run.
- `prefers-reduced-motion: reduce` turns extra motion off by default.
- Embedded in an iframe with `?embed=1`: ready posts, all four earn moments post
  once, a replay bank does **not** re-post `first_bank`, the exit posts close,
  and the frame URL never changes.
- Zero console errors and zero failed requests on every path.

## 10. Known weak spots

- The top of the play screen has an empty band of night above the ring, roughly
  140 px, holding only the small run total. It is quiet rather than broken, but
  a designer might want something there.
- The rules screen's bullet glyphs are system font symbols and render at
  inconsistent weights across platforms. Only tested in headless Chromium.
- The synthesised audio has not been heard on a real device. It is short
  oscillator blips and the sound toggle defaults on.
- Not yet tested on a physical phone, on iOS Safari, or in the Pi Browser.
