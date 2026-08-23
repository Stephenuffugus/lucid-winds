# FLOCK THE WORLD — AUDIT BRIEF (for a second pair of eyes)

You are auditing one game, **Flock the World**, ahead of a paid Google Play
release. Be blunt. Stephen wants problems found, not reassurance.

## 1. Get the code and play it

Public repo: `https://github.com/Stephenuffugus/lucid-winds`, branch `main`.
The whole game is ONE file: `satellites/flock-the-world/index.html` (~270 KB).
Beside it: `check.js` (the test suite), `sim.js` (a balance harness),
`HANDOFF.md` (engine notes), `PLAN-AUG23.md` (the current design plan),
`AUDIT-NOTES.md`.

Live: `https://lucidwinds.com/satellites/flock-the-world/`

⛔ **The game is behind a beta wall.** You will see "IN DEVELOPMENT, tester key"
until you run this in the browser console and reload:
```js
localStorage.setItem('sws_dev_ok','1'); location.reload();
```
Without it you are auditing a gate, not a game.

**Play it in LANDSCAPE on a phone-sized window (about 915x412).** That is the
intended orientation; portrait works but the map is a band.

Flow: menu, pick mode and difficulty, "Open for business", tap a country on the
globe, name your vendor, "Deploy". Then it is a real-time sim: 1 tick = 1 day.

## 2. What the game is

A Plague Inc style satire strategy sim. You are the surveillance vendor. You buy
skill tree nodes, enter markets, manipulate the news, and try to reach 97%
subjugation before the Patriotism meter (the enemy meter) hits 100. Civilians
are explicitly the innocent party and they organise against you.

Tone is PG-13 corporate satire. Every official, agency and company in it is
invented. **If you find anything that reads as a real company, real person or
real logo, flag it loudly** — that is a launch blocker, not a nitpick.

## 3. What changed in the last 24 hours (audit this hardest)

Five features shipped today, each in `PLAN-AUG23.md` as F1 to F5:

- **F1 Population Ledger.** Six people-counts computed every tick (watched,
  compliant, organized, in the streets, expelled you, never watched). A rolling
  odometer in the HUD, a Ledger tab, people on the end screen. `popTotals()`.
- **F2 Map tap popover.** Tap a region, get its numbers and its action buttons.
  `rpopHTML`, `showRpop`. Shares `regionActionsHTML` with the World tab.
- **F3 Name your vendor.** Pick screen input, `CO()`, persisted in
  `localStorage.ftw_co`.
- **F4 Notification queue.** Four tiers: wire, toast, breaking banner, modal.
  `NOTE`, `noteToast`, `noteBanner`, `noteModal`.
- **F5 Sound wiring.** 32 cues, no audio files yet. `SFX_CUES`, `sfx()`.

## 4. Specific things to try to break

1. **The population identity.** `popWatched + popFree` must always equal the
   world population (7,845,000,000). Try to make it drift: lose a region, enter
   and re-enter, play a long run.
2. **Vendor name as an injection vector.** The name is player text and lands in
   `innerHTML` in several places. Try `<b>x</b>`, `<img src=x onerror=alert(1)>`,
   quotes, emoji, 24 characters of nothing but spaces. It should always render
   as literal characters. **If you get script execution, that is a launch
   blocker.**
3. **The notification queue.** Open a modal and make a banner fire underneath
   it. Spam an action to get four identical toasts. Check the toast never covers
   the HUD or the nav in either orientation.
4. **The map popover.** Confirm prices there are identical to the World tab for
   the same region. Drag the map with it open. Tap the same region twice.
5. **Save and resume.** Play, reload, resume. Then corrupt `localStorage.ftw_run`
   by hand (truncate the JSON, set it to `5`, set it to `null`) and reload. It
   must refuse the save, never boot into a broken state.
6. **Touch targets.** Everything tappable should be at least 48 real px at
   375x667. Measure, do not eyeball.
7. **Balance.** Can you win by doing one thing repeatedly? Is money ever
   pointless? Does the run drag after the doctrine choice?

## 5. Run the existing gates before writing anything up

```
cd satellites/flock-the-world
node check.js            # 114 checks, must exit 0
FTW_SELFTEST=1 node check.js   # the mutation harness: these SHOULD fail
```
`check.js` runs the real game script in a Node vm with a DOM stub. If you add a
check, **watch it fail on purpose before you trust it.** That rule exists because
this project has repeatedly shipped gates that could not fail.

## 6. House style, do NOT report these as defects

- `try{}catch(e){}` with an empty body is deliberate throughout.
- `JSON.parse` without a schema is deliberate outside the save path.
- ES6 is fine in THIS file. (The rule about ES5 applies to the repo root
  `index.html`, a different, much larger game. Do not confuse them.)
- No dashes in player-facing copy is intentional. Commas and colons instead.
- The studio is "Sky Wolf Studio", singular. Plural is someone else's domain.
- `#ctip` and `#shToast` are known dead elements, already logged.

## 7. Known open items, no need to re-report

- No audio files exist yet; all 32 cues are wired to a silent stub.
- No art: the game draws everything procedurally. Art sheets are written and
  the first 20 PNGs are delivered but not cut in.
- No `manifest.webmanifest` and no service worker yet, so it is not installable.
  That is the last task before the Play build.
- "In the streets" counts a whole region's population when any protest is
  active, so it can exceed the watched count. Known, a decision is pending.
- Regions you have never entered already show organized people. Known.
- The same ambient wire line can repeat several times in a row. Known.

## 8. How to report

Rank by whether it blocks a paid launch. For each: what you did, what happened,
what you expected, and the file and line if you have it. Screenshots help.
Please separate **bugs** from **design opinions** and say which is which.
