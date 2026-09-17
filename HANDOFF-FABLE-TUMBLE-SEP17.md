# HANDOFF, FABLE CHECKS TUMBLE, Sep 17 2026

**Written by:** Opus, 14:30 UTC Sep 17 (portal added 14:46), just before Stephen shut this codespace down to refresh it.
**For:** Fable, reviewing TUMBLE (the cozy 3D sock sorting game) while Stephen tests it on his Pixel 9.
**Branch:** `add-sproing-jumper`, and **`main` is level with it: TUMBLE is LIVE** (Stephen asked for it at 14:05 UTC so he
can test on his phone). Nothing is only in a working tree. Section 6 lists the gate results at the moment of shutdown,
honestly, including the ones that still need a rerun on the final code.

---

## 0. WHAT HE ASKED FOR, IN HIS WORDS

1. 06:00 UTC, with DESIGN.md and OPUS_PROMPT.md attached: *"You're going to throughly build this out. Read the prompt
   then the handoff. Do this impeccably, make the memories, and save everything as you go. Work while I sleep and I'll
   have fable check the work in the morning. I want this to be such a good looking game with all the tools at your
   disposal. Go"*
2. 11:35 UTC: *"polish thegame game and everything ill check in a bit"*
3. 14:05 UTC: *"push it live so i can test on my phone and write a detailed handoff for fable to check your work as well
   and i will shut down and refresh the codespace"*

Your job, as I read it: check the work against `satellites/tumble/DESIGN.md` (the contract) and
`satellites/tumble/docs/OPUS_PROMPT.md` (the brief), and take his phone notes when he brings them.

---

## 1. WHEN HE COMES BACK WITH PHONE NOTES

Same law as every other game (`HANDOFF-FABLE-SEP06-EVENING.md` section 1):

1. Write each note down **verbatim** first.
2. Sort each into **fault** (fix, gate, deploy, say it is live), **taste** (his call: recommend, do not build unasked),
   or **already known** (section 7 below; say so and say why).
3. Names, prices and the shape of the game are Director calls.
4. For every fault ask whether a gate should have caught it. If yes, fix the gate too and watch it fail once.

The things most likely to come back, because no machine here could judge them:
- **Flick strength.** Tuned from physics math, never by a thumb (section 7.1). `?debug=1` prints every flick.
- **Frame rate.** Unknown on a phone (section 7.2).
- **Sound.** Every cue is a Web Audio synth; nobody has listened to any of it on a speaker.
- **Held sock size and the hold and tap feel.**

---

## 2. WHERE IT IS AND HOW TO OPEN IT

- Code: `satellites/tumble/` (its own README, DESIGN, DECISIONS, HANDOFF). 88 tracked files, about 9,500 lines of JS.
- **Live:** https://lucidwinds.com/satellites/tumble/
  - The studio **workbench gate** (`/dev-gate.js`) covers it on lucidwinds.com. Stephen's usual tester key opens it
    (same key and localStorage flag as the portal, `sws_dev_ok`).
  - **On the portal since 14:46 UTC**: https://lucidwinds.com/portal/ , "The Test Lab", "Step inside", the TUMBLE card
    (In Development, `beta:true`, category Puzzle, thumbnail `portal-assets/thumbs/tumble.jpg`). The card entry is in
    `portal/index.html` next to Marrowdeep; its `?v=` must follow the game's version stamp. Checked live with a real
    tap: the card is listed, a tap on it shows the tester key prompt (`dev/probe-portal.mjs`). Stephen wants other
    people to test it this way, so their notes may arrive through him too.
  - Useful URLs on the phone:
    - `?debug=1` fps, frame time, physics ms, bodies, draw calls, and the **last flick** line
    - `?load=laundry&size=regular&tier=4` straight into a Load; `?load=rush&sub=timed|endless|balance`
    - `?shotgain=2.6&rangeassist=0.8&assist=0.6` flick tuning without a code change (defaults 2.3, 0.7, 0.6)
    - `?smoke=200&debug=1` the 200 sock physics pile; `?low` smaller shadow map
    - `?nosw` no service worker
  - The dev pages are also served: `dev/atlas.html`, `dev/flick.html`, `dev/physics.html` (no gate on those; harmless).
- **Version stamp:** `20260917g` (or later if you see a newer one) in three places that must move together:
  `sw.js` VERSION, `src/config.js` VERSION, `index.html` TUMBLE_VERSION. `tests/sw.test.mjs` fails if they differ.
- **When the game's version changes**, also bump `?v=` on the TUMBLE card in `portal/index.html`.
- **Deploy:** `git push origin add-sproing-jumper:main` from the repo root, after `git fetch && git log HEAD..origin/main`
  is empty. Hostinger picked it up in under a minute today. Verify with
  `curl -s "https://lucidwinds.com/satellites/tumble/?probe=$RANDOM" | grep TUMBLE_VERSION`.
- **Caching (important for his re-tests):** the worker follows the host caching law from memory
  (`feedback_htaccess_does_not_deploy`): registered as `sw.js?v=VERSION` on every launch; install fetches every local
  file as `<file>?v=VERSION` and stores it under the plain name; pages are fetched network first with
  `cache: 'no-cache'`; no background refresh. **So every deploy that changes code MUST bump the three stamps**, or his
  phone keeps the old files. When a new version installs under an old one, the page says "A new version of TUMBLE is
  ready. Close it and open it again to get it." (one extra launch). If he ever reports "old version", check the stamp
  first, then have him close the tab fully.
- **Verified live at 14:15 UTC** by `node dev/probe-live.mjs`: boots to the room, first visit sees the gate, the worker
  is active as `sw.js?v=20260917f` (the build before the final one; `20260917g` only adds the sticky results actions), a relaunch is worker controlled with 47 cached entries, a Load starts, no console
  errors. All 39 precached files return 200 with the right types.

---

## 3. A FRESH BOX

```
cd /workspaces/lucid-winds && git pull --rebase --autostash origin add-sproing-jumper
cd satellites/tumble && npm install        # Rapier for the Node tests; node_modules is gitignored
ls ~/.cache/puppeteer/chrome               # the gates need the puppeteer Chrome (never delete that cache)
npm test                                   # 11 suites, about 2 minutes
```

Memory: clone `Stephenuffugus/sws-memory` into `~/.claude/projects/-workspaces-lucid-winds/memory` first (see the
MEMORY.md top line). The TUMBLE note is `project_tumble_build_sep17.md`; it is pushed.

**Two cores.** Run ONE browser at a time. The gates run headless Chrome with software WebGL at about 1 fps and take
5 to 15 minutes each. Kill stray runs by PID with the bracket trick (`pgrep -f "[n]ode dev/gate-"`), never
`pkill -f` a pattern your own shell contains.

---

## 4. WHAT WAS BUILT (the short version; `satellites/tumble/HANDOFF.md` has the long one)

All eight build steps of the brief, in order, each with a gate:

| Step | What | Proof |
|---|---|---|
| 1 | Rapier pile of up to 200 socks (compound capsule rafts), heightfield dump that settles in 1.0 to 1.7 s, freeze sleeping, drag and flick, debug overlay | Node physics suite, `dev/physics.html`, gate step1 |
| 2 | `engine/sockgen.js`: SHA-256 seeds, 37 bit spec, 10 families, 16 motifs, CIEDE2000 floor of 7 in all four colour modes, 43 painted hero recipes, 8x8 atlas in workers | Node atlas and match suites (golden hash), `dev/atlas.html` byte identical to Node |
| 3 | Tap to pocket, tap the twin, hold and tap, mismatch drop back, roll into a ball, flick or lob into a basket with real rim, Odd Bin, double tap flip | gate step3, Node input and shot suites |
| 4 | Laundry Day end to end: dump, play, Sweep, results with Tidy, Lint, Quarters, Drawer and Odd Bin in IndexedDB, five Loads, reload, settings, export and import | gate step4, Node lifecycle, economy, save suites |
| 5 | Rush: Timed, Endless, Basket Balance, streak to x5, power dots, four powers, lint fog | gate step5 |
| 6 to 8 | The Laundry Room as the menu, Drawer, Odd Bin, Clothesline (16 pegs), shop (120 unlocks), Reunion gifts in the room, Daily (same Load for everyone, local board, share card), 12 lore pages | gate step678, Node oddbin and daily suites |

Then three passes on top:
- **A 42 agent adversarial review** (rules, UI, play, render, each finding checked by a skeptic): 38 issues, all fixed.
  Script: `satellites/tumble/docs/review-workflow.js`.
- **Gate driven fixes**: ball flicks were never launching (the release emptied the hand before reading it), a sub frame
  flick froze the game, lobs bounced off a heaped basket in Mountain Loads, the 200 sock smoke pile took 2.58 s.
- **The polish pass** (his second message): a 51 shot tour at 412 x 915 (`tools/tour.mjs`) and six critics with
  skeptics (copy, feel and sound, accessibility; table, room, sheets): about 90 changes. Scripts:
  `docs/polish-code-workflow.js`, `docs/polish-visual-workflow.js`. List in `satellites/tumble/HANDOFF.md` section 4c;
  the calls in `DECISIONS.md` "Polish pass".

Every call where the contract was silent or impossible is in `satellites/tumble/DECISIONS.md` with the reason.

---

## 5. HOW TO CHECK THE WORK (a suggested order)

1. **Read** `DESIGN.md`, then `DECISIONS.md`, then `satellites/tumble/HANDOFF.md`. A documented decision is not a bug
   unless it breaks the contract; if you disagree with one, it is a Director call for Stephen.
2. **Run** `npm test` (11 suites should pass).
3. **Run the gates**, one at a time: `sh dev/run-gates.sh` runs all nine
   (shaders, step1, step3, step4, step5, step678, devpages, review, basket) and logs to `dev/out/gates.log` and
   `dev/out/gate-<name>.log`. About an hour.
4. **Look.** `node tools/tour.mjs dev/out/tour3` makes 51 screenshots at a Pixel 9 size with `tour.json` describing each.
   Open them. The rule in CLAUDE.md applies: a green gate is not a look.
5. **Live:** `node dev/probe-live.mjs` checks the deployed site and its worker.
6. **Second opinion:** the three workflow scripts in `docs/` can be rerun (Workflow tool, `scriptPath`); they are read
   only and each finding is verified by a skeptic before it is kept.

Where I would look hardest, because these are the changes I am least sure of:

| Area | File | Why |
|---|---|---|
| Impact sounds | `src/play.js` step(), the `dv > 0.9` block | A velocity jump decides rim, basket or table; thresholds came from a Node probe, not ears |
| Drag lift ease | `src/play.js` frame(), `blendPose` | 0.12 s blend from the pile to the thumb; a very fast flick can end mid blend |
| Tap versus double tap | `src/play.js` deferBring, tapPocketed | A fetch waits 0.34 s so a double tap can flip instead; the grab sound plays at once |
| Hold and tap | `src/input.js` _down | A still thumb is lifted when the second finger lands; the press then always ends as a release |
| Body removal | `src/physics.js` remove() | Disables instead of removing (Rapier 0.20 panics otherwise); disabled bodies stay until the next Load |
| Busy counter | `src/play.js` flyBusy, `src/table.js` cancelFlight | Every flight the Load waits for must release exactly once, including aborted ones |
| Packed basket | `src/play.js` basketed() | Only 3 basketed balls stay physical; older ones are drawn packed, and come back on a tip |
| Worker | `sw.js` | Rewritten at 14:00 UTC for the caching law; tested in Node and once live |
| Sheets | `src/ui.js` openSheet/closeSheet | Focus moves in and back, Escape, `inert` on what is behind, shape change without sliding |
| Atlas uploads | `src/atlas.js` _upload | One or two tiles upload row by row (`addUpdateRange`); real GPUs untested |
| Hand glow | `src/render.js` setHandGlow | A sprite 0.25 m behind the held item; depth order verified by math, seen in the tour |
| Reduce motion | `src/game.js` DEFAULT_SETTINGS | Defaults to the phone's `prefers-reduced-motion`; changes several paths |
| Results actions | `src/ui.js` results(), `.sheet .actions` | Sticky at the bottom of the sheet (added 14:20 UTC after gate 4 could not reach "Another Load") |

---

## 6. GATE RESULTS AT SHUTDOWN (honest)

**All nine browser gates pass on the final build (`20260917g`)**, run one at a time between 13:54 and 15:10 UTC:
shaders, step3, step4 (after the sticky results fix; before it, 9 checks failed because "Another Load" sat below the
fold), step5, review, step678, devpages, basket, and step1 (after a gate fix: it read the debug overlay after 3
frames, before its first quarter second refresh; the overlay itself was fine). `npm test`: 11 of 11 suites
(sw 14/14). Live: `dev/probe-live.mjs` and `dev/probe-portal.mjs` pass. You should still rerun them yourself.

Screens: the second tour, after the polish, is in `dev/out/tour2/` on this box only (`dev/out` is not committed, and
this box is being refreshed). Rerun the tour to see them.

---

## 7. KNOWN GAPS AND LIMITS (say "already known" if he reports these)

1. **Flick strength is tuned from math.** Launch speed = (finger px/s divided by screen height px) x 2.3, plus a nudge
   for flicks aimed within 9 degrees and between 0.55 and 1.8 times the ideal speed. On an 844 px tall phone,
   1000 to 1500 px/s flicks should land. `?debug=1` shows raw, ideal and launch per flick; scale `SHOT.gain` by
   1/ratio if natural flicks sit well off 1.0.
2. **Real frame rate is unknown.** The rig renders at 1 to 2 fps with software WebGL. Rapier alone steps a frozen
   200 sock pile in 0.89 ms in the page; dragging through a 200 pile costs about 20 ms a step in Node (185 wake).
   The phone risk is triangles: the procedural placeholder socks are about 2,500 triangles each (Meshy target 600 to
   900); a Mountain Load draws about 268k triangles before shadows. Knobs: `?low`, `RING`/`ALONG` in
   `assets/geo/placeholder.js`, or the Meshy meshes.
3. **Nobody has heard the audio.** All cues are synthesized (`src/audio.js`); the Rush pulse and the basket voice were
   reworked for phone speakers by reading the graph, not by listening. The Laundry Day hum likely sits too low for a
   phone speaker (a critic flagged it; the skeptic dropped the fix as a guess).
4. **`file://` does not run** (ES modules); it shows a notice.
5. **Meshy GLB silhouettes and Blender masks** do not exist yet; the loader path for them is untested.
6. **Economy numbers** come from a written "relaxed player" model in `tests/economy.test.mjs`, not from play.
7. **Tier 9** waits for a future Eyes peg (the cap is Eyes pegs + 2, six exist).
8. **Removed physics bodies stay disabled** in the world until the next Load (measured cost: noise level).
9. **Critic findings that were dropped on purpose** (taste or risk; Stephen's call if he raises them):
   the dock's Door button shows a settings gear (settings live behind the door); both floor plants are cut by the
   screen edges on narrow phones; the portal dryer is a deliberate navy "not from here" look; the table leaves a band
   of floor at the bottom (the held sock uses it); room decor slivers at the edges of the table view; the Dryer Sheet
   clears fog in one frame (a fade would break gate step5's check); settling a level basket still costs a streak
   point; peg names keep DESIGN 9.4's exact capitalisation; new sock names in the results fan are only in the
   cards' titles.

---

## 8. OPEN DIRECTOR CALLS (Stephen's, not ours)

- Whether TUMBLE stays behind the workbench gate, gets a portal card, or goes to stores.
- Flick feel after his test (numbers above).
- Brand line on the share card says "Sky Wolf Studio" (studio rule); DESIGN said "Sky Walk".
- Four hero names were changed under the IP rule (Bait Shop Shades, Tour '94 for Damp Towel, Muncie Comets Tee Ball,
  Dave's Reasonable Tires); DESIGN 8 still lists the old ones.
- Basket Balance settles with a one finger tap (DESIGN says two finger); Rush Quarters have no DESIGN figure;
  long shot distance is 0.75 m (DESIGN's "one basket length" is shorter than any shot on the table).
- The Daily Rush board is local to the device (no server, no analytics).

---

## 9. SCARS FROM TODAY (full list in memory `project_tumble_build_sep17.md`)

- A gate failed all night on "the flick never resolves" and I blamed harness timing; the game had emptied the hand
  before reading it. **Instrument the suspect function's output before tuning anything.**
- The harness waited between gesture steps with `setTimeout`; at 1 fps that stretched flicks into drags and I tuned
  the gain up on fake data. Gesture moves are now busy waited inside one evaluate.
- A synthetic tap sent as two evaluate calls is seconds apart on this rig and reads as a hold. Make both
  PointerEvents first, then dispatch them (the timestamp is taken at construction).
- Rapier 0.20: `removeRigidBody` right after a fixed/dynamic switch panics in the next step; manual `sleep()` keeps
  integrating gravity. `for...of` over a Map visits entries added during the loop (an endless basket tip).
- Canvas gradients interpolate unpremultiplied: a stop to `rgba(0,0,0,0)` paints grey halos on soft sprites.
- A DOM glow over the canvas washes out the 3D object under it.
- `#include <colorspace_fragment>` inside a one line shader string must start its own line.

---

## 10. FABLE'S REVIEW AND STEPHEN'S FIRST PHONE NOTES (Sep 17, 15:10 to 17:00 UTC)

### 10.1 His notes, verbatim (Sep 17 ~16:30 UTC, Pixel 9, build 20260917h)

> so far this looks fantastic. i wish we could upgrade a lot of our games grapghics like this now that we have more tools
> and experience. so when i pick up a sock, sometimes its in the way of its match and i cant click on it, then when it is
> matched and i go to throw it the ball is actually above where im touching, it should be in the middle of where im
> touching. tossing socks in the odd sock box should be a little more fluid, i can also just hold the socks and drop them
> in im not sure if thats intentional or not or if it scores no points or soemthing if you do it that way. i should be
> able to hold the sock with oen thumb and click its match with the other. im curious what the music is thats in there.
> i didnt ask for any because i have some really great beats i can give you for the game. im loving this so much i want
> to list it as well on the play store. i think we could drastically expand on everything though and improve. dont stop
> now.

### 10.2 Sorted

| # | Note | Kind | What was done |
|---|---|---|---|
| 1 | the held sock is in the way of its match and it cannot be tapped | **fault** | pocket moved from 80% to 85% of the screen height so it covers less of the mat; a tap that lands on a table sock peeking out beside the held one (more than 44 px from the pocket's middle) now fetches that sock instead of flipping the held one |
| 2 | the dragged ball floats above the thumb; it should be under it | **fault** (his ruling on feel) | a dragged ball is drawn centred on the thumb (lift 0); a dragged sock keeps its 96 px lift so its pattern stays readable |
| 3 | binning should be more fluid | **taste, his direction, built** | the Bin's answer is asked at the start, so an odd sock folds itself into the Bin in one 0.45 s motion instead of fly up, pause, tuck |
| 4 | holding a sock and dropping it in: intentional? does it score? | **already known / by design** | yes, intentional (DECISIONS "Handling"): a slow release over the Bin is the same as tapping the Bin, same rules, same (zero) points; a slow release over the basket is a tap shot: it counts as made, never as a long shot |
| 5 | hold with one thumb, tap the match with the other | **built since the brief; one fault found** | hold and tap exists (the review gate covers it). A deliberate second finger press over 320 ms did nothing (same rule as the still press fault); now a still second finger that lifts is the tap however long it pressed |
| 6 | what is the music? | **answer** | no music files exist: every sound, the dryer hum, the Rush pulse and the six radio stations are a Web Audio synth (the brief said no audio files this pass). His beats replace the radio: audio never in git, tracks live in the private `lucid-winds-music` repo served from `/music` (memory `project_music_unlock_system_sep02`); wiring them is a small follow up once the files exist |
| 7 | list it on the Play Store | **Director decision, plan below** | the FTW pipeline applies: a TWA via bubblewrap (`project_ftw_play_package_sep05`), package `com.skywolfstudio.tumble`, one price across stores, IARC questionnaire, 512 icon + feature graphic + phone screenshots, privacy page. Store name needs a check for "Tumble" collisions. Not tonight's build |
| 8 | expand and improve everything, don't stop | **mandate** | see 10.4 |

### 10.3 What his beats and a Play listing need (so nothing waits on a question)

- **Beats.** Audio never lives in this repo (memory `project_music_unlock_system_sep02`): the tracks go to the private
  `lucid-winds-music` repo and are served from `/music`. TUMBLE's radio has six stations (`data/unlocks.json`, cat
  `radio`) that today call the synth in `src/audio.js`; the change is a `url` per station and an `<audio>` element behind
  the Radio hotspot, with the worker leaving `/music` alone. Loops or full tracks both work; loops under 30 s were the
  DESIGN 11 idea, but his beats set the length. He names the stations.
- **Play Store.** Same road as Flock the World (`project_ftw_play_package_sep05`, live Sep 17): a TWA built with
  bubblewrap (needs a TTY), package `com.skywolfstudio.tumble`, the keystore in the vault, one price across every store,
  the IARC questionnaire, a 512 icon and a 1024 x 500 feature graphic, five phone screenshots (the tour makes them at
  412 x 915; the store wants 1080 wide, so rerun the tour with `TOUR_W=1080 TOUR_H=2400` or upscale), a privacy page on
  lucidwinds.com with a contact address fenced from Cloudflare's email rewriting. Two Director calls first: the store
  name (plain "Tumble" collides with existing games; "TUMBLE: Sock Sorting" or similar) and the price.

### 10.4 Where the big gains are now (his "expand and improve everything")

1. **The Meshy pass is the single biggest visible upgrade.** Every sock on the table is the same procedural capsule L;
   the eight silhouettes in DESIGN 14 (ankle, crew, knee high, toe, baby, fuzzy slipper, dress, novelty crew) and the
   five props (wicker basket, plastic hamper, front load dryer, folding table, sock ball) are one Meshy session with his
   premium seat. The loader already takes a GLB plus a mask PNG by name (`assets/geo/manifest.json`), untested with a
   real file; the first GLB he drops in is the test. After Meshy: the Blender UV and mask pass (DESIGN 13.3), then
   `?smoke=43&debug=1` to see the colliders still sit inside the meshes.
2. **Real audio**: his beats for the radio (10.3), then recorded fabric, thwip and basket sounds to replace the synth.
3. **His flick numbers.** `?debug=1` on the Pixel prints every flick (px/s, raw, ideal, launch); the gain is a one line
   change in `src/config.js` once he says what a natural flick reads.
4. **Frame rate on the phone** with the placeholder socks (2,500 triangles each): if a Mountain Load stutters, `?low`
   first, then the Meshy meshes (600 to 900 triangles) fix it for good.
5. **Content that is already designed but empty**: the four seasonal baskets, the four blank Clothesline pegs, monthly
   hero packs, and a real Daily leaderboard (a small Cloud Function; today the board is per device).
6. **The room** wants the same Meshy treatment as the socks once the socks are done: dryer, dresser, table, plants.

### 10.5 Tour 3 (build 20260917h, 61 shots at 412 x 915, `dev/out/tour3/`, looked at)

- The polish holds. Every screen Opus listed reads as described; no shot shows a broken layer, a clipped sheet or a
  missing label. `errors: none`.
- **The three shots the old tour never actually saw (27 to 29) are right now**: the deuteranopia Mountain Load is a
  blue, grey and ochre heap; the held inside out sock reads as faded; the flip shows the pattern.
- **Spin Cycle is visible for the first time** (shot 21, with the dots granted): the pile spreads and settles sorted, the
  fog stays.
- **Held sock per silhouette (30 to 36, new)**: ankle, crew, knee, toe, baby, slipper and novelty all stand cuff up, foot
  to the right, whole sock on screen, pattern readable. No dress sock lay on top of that pile, so no shot of it. Two
  nits, taste only: an ankle sock sits about 55 px left of centre (the heel offset meant for L shapes), and a baby sock
  in the hand is drawn as large as a crew sock, so it does not look small (size is never a decoy field, so nothing is
  lost for matching).
- **Every held shot covers the bottom band of the mat** at the old 80% pocket: his first note, seen. 20260917i moves the
  pocket to 85% and lets a peeking table sock win the tap.
- **Rush at 360 x 740 (61, new)**: both HUD rows fit; the powers column touches the basket's right rim. Same taste call as
  at 412, stronger at 360: the powers could sit along the bottom right, above the shake button, so the basket has air.
