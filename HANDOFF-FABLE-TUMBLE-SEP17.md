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

### 10.2b What is live

- **20260917h** (16:19 UTC): still press of any length = tap; Reunion copy; maskable icon precached; review gate hardened.
- **20260917m** (19:20 UTC): the motif bank is 32 shapes; `tools/fit-glb.mjs`; the GLB gate shoots the held sock.
- **20260917l** (18:44 UTC): base designs spread across families and the hue wheel; low tier colour decoys 67 degrees.
- **20260917k** (18:05 UTC): the web manifest is `manifest.webmanifest` (fleet convention); `node scripts/twa_ready.mjs
  tumble` now reads 9 ok, 1 warning, "ready to list". The fleet's offline check times out on this box, so
  `dev/probe-offline.mjs` does the reviewer's test itself: worker installed, server killed, cold launch boots to the
  room at version k with no errors (all passed, 18:12 UTC).
- **20260917j** (17:58 UTC): real files behind the radio stations (his beats), gated. Also deployed without a stamp
  change (dev and store files only): the GLB fixture gate, `privacy.html`, `store/tumble-play/`.
- **20260917i** (17:29 UTC, main = branch): the four fixes from his notes above. Step3 gate: the twin placed beside the
  held sock is fetched (red on the old code: the held sock flipped instead); the dragged ball is drawn under the thumb
  (red on the old code: 155 px above the finger). Review gate green. Node 11/11 (input 9/9).
- The version stamp moved g → h → i in `sw.js`, `src/config.js`, `index.html` and the portal card `?v=` each time.

### 10.3 What his beats and a Play listing need (so nothing waits on a question)

- **Beats.** Audio never lives in this repo (memory `project_music_unlock_system_sep02`): the tracks go to the private
  `lucid-winds-music` repo and are served from `/music`. TUMBLE's radio has six stations (`data/unlocks.json`, cat
  `radio`) that today call the synth in `src/audio.js`; the change is a `url` per station and an `<audio>` element behind
  the Radio hotspot, with the worker leaving `/music` alone. Loops or full tracks both work; loops under 30 s were the
  DESIGN 11 idea, but his beats set the length. He names the stations.
  **BUILT 20260917j (17:58 UTC):** a radio item's `look.url` now plays that file (looped, through the music bus, so the
  music switch and the Results duck apply); no url = the generated loop; a file that fails = the generated loop. Gate
  `dev/gate-radio.mjs`. So his beats are a data change: put the files in the music repo, add `"url":
  "/music/v1/tumble/<file>.mp3"` to the six radio items in `data/unlocks.json` (or new items with new names), bump the
  version. Also fixed on the way: the station picked before the first touch stayed silent until changed.
- **Play Store.** Same road as Flock the World (`project_ftw_play_package_sep05`, live Sep 17): a TWA built with
  bubblewrap (needs a TTY), package `com.skywolfstudio.tumble`, the keystore in the vault, one price across every store,
  the IARC questionnaire, a 512 icon and a 1024 x 500 feature graphic, five phone screenshots (the tour makes them at
  412 x 915; the store wants 1080 wide, so rerun the tour with `TOUR_W=1080 TOUR_H=2400` or upscale), a privacy page on
  lucidwinds.com with a contact address fenced from Cloudflare's email rewriting. Two Director calls first: the store
  name (plain "Tumble" collides with existing games; "TUMBLE: Sock Sorting" or similar) and the price.
  **Scaffolded Sep 17 17:55 UTC:** `store/tumble-play/` (Console field sheet with his calls marked STEPHEN, listing copy
  draft, `twa/twa-manifest.json` for `com.skywolfstudio.tumble`) and `satellites/tumble/privacy.html` (live once
  deployed; the email is fenced). ⛔ Blocker in the sheet: the workbench gate must come off before a reviewer can open
  the game.

### 10.4 Where the big gains are now (his "expand and improve everything")

1. **The Meshy pass is the single biggest visible upgrade.** Every sock on the table is the same procedural capsule L;
   the eight silhouettes in DESIGN 14 (ankle, crew, knee high, toe, baby, fuzzy slipper, dress, novelty crew) and the
   five props (wicker basket, plastic hamper, front load dryer, folding table, sock ball) are one Meshy session with his
   premium seat. The loader takes a GLB plus a mask PNG by name (`assets/geo/manifest.json`) and is now GATED with real
   GLB files (`dev/gate-glb.mjs`, fixtures from `tools/make-test-glb.mjs`, red on a missing file, green on the fixture),
   so his first Meshy file is a drop, not an experiment. When real GLBs ship: GLTFLoader.js into the worker's CDN
   precache, the files into PRECACHE, version bump. After Meshy: the Blender UV and mask pass (DESIGN 13.3), then
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

### 10.6 His second round of notes (Sep 17 ~18:20 UTC, verbatim)

> ill pick out the beats for you, what do you need in the emantime?

> you should have access to meshy ill have to go test it, then i alsop want to focus on having a really nice wide
> assortment of pattenrs and characters on socks because i did a load with 20 that had 4 pairs of white and green socks
> and it was just a mess, the flick had felt pretty good so im excited to see it centered, itll play better

Sorted:

| # | Note | Kind | What was done |
|---|---|---|---|
| 1 | "you should have access to meshy" | **confirmed** | `MESHY_API_KEY` is set on the codespace; the account had 2,640 credits. A pilot text to 3D preview of one crew sock cost 5 credits and came back as a standing, filled sock with a bent foot (940 triangles), not the flat relaxed sock the table needs; two prompts that insisted on a flat, empty, L shaped sock (10 credits) came back as a shapeless flat rag and another standing boot. **Image to 3D from a clean reference render of the crew silhouette (5 credits, no texture) gave the first usable shape: an L sock, cuff up, foot right, 922 triangles, thickness in proportion**, and also a plain copy of the picture it was given. So the road is: his Midjourney flat lay of each silhouette (top down, white cotton, cuff up, foot right, soft light) → Meshy image to 3D (5 credits each without texture) → `tools/fit-glb.mjs` (WRITTEN: finds the flat plane, sweeps the orientation every 3 degrees against the silhouette's outline, sizes and centres the mesh, presses a round tube to the silhouette's thickness, writes cylindrical UVs from the centreline and splits the seam triangles; a debug PNG shows the fit) → `assets/geo/`. The fitted pilot crew sock is in `dev/glbtest-meshy/` and the GLB gate shoots it held (`GLB_BASE=dev/glbtest-meshy/ node dev/gate-glb.mjs`). 20 credits spent in all, 2,620 left. |
| 2 | a 20 pair Load had 4 pairs of white and green socks, "just a mess"; wants a wide assortment of patterns and characters | **fault in the Load generator's variety + a content direction (his)** | **Fault fixed, live as 20260917l:** base pairs were plain random draws (a Regular Load at tiers 0 to 3 held two to four near identical pairs on top of its decoys) and a colour decoy at his tier shifted only 34 degrees (green against green). Now base designs spread across families and the hue wheel (no shared pattern within 67 degrees, at most three of one scheme in a 67 degree slice, no family over a fifth), and low tier colour decoys sit 67 degrees away. `tests/variety.test.mjs`: 1 of 18 on the old generator, 18 of 18 now. **Content, 20260917m:** the motif bank is 32 shapes (ghost, duck, bear, skull, sun, snowflake, anchor, paw, pizza, rocket, planet, dinosaur, crown, apple, umbrella, sailboat joined the sixteen), each looked at on three sheets (160 px, 28 px, real tiles) by the agent that drew them and again by me; DECISIONS "The motif bank is 32 shapes" has the bit layout and the one consequence (a seed with bit 7 set paints a new shape instead of a colour swap). **LIVE as 20260917m** (19:20 UTC; devpages gate green: the browser paints the new bank byte for byte like Node). |
| 3 | the flick felt pretty good; centred ball welcome | feel report, no action | the centred ball is live since 20260917i |

### 10.7 Meshy, the honest verdict after eight silhouettes (Sep 17, 19:30 UTC, 40 credits spent, 2,585 left)

The road works end to end: a reference picture → Meshy image to 3D (5 credits, no texture) → `tools/fit-glb.mjs`
(orientation, size, pressed flat, cylindrical UVs, largest piece only) → `dev/glbtest-meshy/` → the GLB gate boots a
43 sock pile on them and shoots each one held (`GLB_BASE=dev/glbtest-meshy/ node dev/gate-glb.mjs`,
`dev/out/g-glb-dev-glbtest-meshy-held-<key>.png`). All eight fits load, sit on the table, sleep, and hold. **Looked at:**

| Silhouette | Held shot verdict |
|---|---|
| crew | good: a rounded sock, cuff and heel bands right, pattern wraps cleanly |
| knee | reads as a long sock; the foot is small; pattern acceptable |
| novelty | reads as a sock, pattern wraps |
| toe | a chunky sock; no toes (the reference had none) |
| ankle | a wide lumpy blob, pattern streaks: worse than the placeholder |
| baby | folded flat shape, pattern streaks: worse than the placeholder |
| slipper | a bent tube; plausible as a slipper, pattern band heavy: not better |
| dress | a long tube with a flat cut foot: not better |

**Why:** Meshy builds what the picture shows, and my references are the game's own capsule L rendered white (no cuff
rib, no heel, no toe, no fabric). It inflated the small and wide ones into blobs and once hallucinated a second tube.
Text prompts were worse (standing socks, a rag). **Production keeps the placeholders.** Nothing about the pipeline
needs to change; the reference pictures do.

**What his Midjourney flat lays need to be, one per silhouette, for Meshy to give the real thing:**
- One sock, top down, lying flat on a plain mid grey surface, soft even light, no shadow drama, no props.
- Cuff at the top, foot turning to the RIGHT (the game's held pose; the fitter can turn it, but the outline match is
  better when it already lies that way), the whole sock inside the frame with margin.
- Plain white or light grey cotton, no pattern (patterns are painted by the game), but with the real character of the
  shape: a ribbed cuff, a visible heel cup, a rounded toe, a few soft folds. For the toe sock, five toes. For the
  slipper, a rolled fuzzy cuff and a thick sole. For the novelty crew, a ridge along the leg (ears or a fin).
- Square, 1024 or larger, PNG. Drop them in `_music-drop/` or anywhere he likes and tell me; I run the eight through
  Meshy (40 credits) and shoot them held the same day.

### 10.8 His third round, brainstorming (Sep 17 ~19:45 UTC, verbatim)

> so i need opus to build that handoff? or you need to do it? do we have great variety and references to all kinds of
> cultural icons and stuff taht would be easily recognizable? thatd be a great thing to attract people. im not surr about
> buying socks that land in your clothes basket, i think you shoukld unlock socks as you go, and then have other cool
> stuff to unlock. i want to keep it simple and cozy too, also im looking at FTW and this is fantastic. is it as easy to
> update that game and improve it as it is to do that on steam? im thinking of cleaning the menus up. we can make a fresh
> session for this just like i should for jimothy assets but where you open the world and look at the markets and
> everything it may be better to have all of that simplified and then have info boxes on everything to show all the
> specifics, then people wouldnt be overwhelmed with it. just brainstorming here.

Sorted (he said "just brainstorming": assessment only, nothing built):

| # | Note | Kind | Answer |
|---|---|---|---|
| 1 | Opus or Fable for the Meshy handoff? | question | No handoff needed. The spec (§10.7) is written; the only input is his eight flat lay pictures. Once they exist it is 40 credits and one gate run, minutes, not a session. |
| 2 | recognizable cultural icons on socks to attract people | **content direction + IP rule** | Today: 32 generic motifs (heart, ghost, dinosaur, pizza...) and 43 parody heroes in four packs. DESIGN 6 (his rule): parody CATEGORIES, never near miss real brands or characters. Literal icons (a Pokemon, a swoosh, a Mario) = a Play rejection and a takedown. What is both recognizable and safe: holidays, foods, decades, sports, jobs, animals doing human things, regional flavour. Proposal: four more hero packs in that register (Holiday Drawer, Breakfast, Decades, Game Night), 40 heroes, same recipe pipeline, looked at on a sheet. His yes. |
| 3 | not sure about buying socks; unlock socks as you go, buy other cool stuff; keep it simple and cozy | **Director design call (leaning)** | Today hero packs cost 10 Quarters (DESIGN 9.5). His shape: packs unlock by playing (a milestone per pack, like Clothesline pegs), and Lint and Quarters buy baskets, dryers, decor, radio, ball styles and trails only. It is a data change (`cost` becomes `earn` on the four pack items) plus the peg style unlock check, one evening. Waiting for his yes; DESIGN 9.5 changes with it. |
| 4 | FTW: as easy to update as on Steam? | question | Easier. The Play app is a TWA: the app IS lucidwinds.com/satellites/flock-the-world/, so a web deploy updates every installed copy at its next launch, no store upload. Only the icon, name or package need a Play upload. Steam would be an Electron wrapper like Jimothy: every patch is a re vendor and an upload. Menu cleanup does not touch the IARC answers. |
| 5 | FTW menus: simplify, info boxes for the specifics, fresh session | **his direction, fresh session** | Yes to a fresh session with its own handoff (`HANDOFF-FTW-MENUS.md`): a shot inventory of every FTW screen at phone size, the principle (one glance surface, details behind an info box), the fleet laws (48 px, no dashes, tour and look), the deploy path. I write it when he says go; a builder or I run it. |

### 10.9 FTW on Play carries the fleet music system (his note 19:55 UTC, verbatim in START-HERE §0c)

Facts: `satellites/flock-the-world/index.html` includes `/music-unlocks.js` (one line, like 105 other satellites). Inside
FTW it shows a "♫ Music" chip and, at boot or a milestone, a card: "Congratulations, you unlocked a song", the title and
shelf, Play it now / Later. The tracks are his own (private music repo, served from /music). Nothing in it links out of
the app (the TWA gate's "no portal exit" is green; `SWS_IN_TWA` is set in FTW and blocks every exit). Policy: fine, it is
free content with no purchase. Taste: his. Off switches, cheapest first: (a) a two line change in FTW's index that skips
the include when `SWS_IN_TWA` is true (web keeps it, Play loses it, live in a minute, no store upload); (b) `?nomusic=1`
on the TWA start URL (needs a Play upload); (c) remove the include everywhere (the web loses it too).

**His call (20:05 UTC): "we should just have the music from this game in there with the little icon up top that fit
nicely."** Done as (c), because the floating chip is placed before the unlock system checks for a shelf, so taking FTW
off the Logic Den shelf would have left the button. FTW's page no longer includes `/music-unlocks.js` (web and Play);
FTW keeps its own soundtrack (his tracks in `sfx/`), the ♪ mute button in the HUD and the playlist settings. Shell
`v20260917a`, `check.js` law 378/378, `dev/probe-fleet-music.mjs` (no fleet file requested, no chip, no card, the mute
button present), both watched red first; Play readiness still ready; live index byte identical. Not touched:
`music-catalog.js` still lists flock-the-world in the Logic Den family (generated data; dead for FTW now, harmless).

### 10.10 Jessie's first TUMBLE note (relayed by Stephen, Sep 17 ~21:50 UTC, verbatim)

> jessie is testing tuble she says the instructions move too fast and she didnt get to read them as they popped up, she
> wants a click to continue on those

Sorted: **fault in feel + his direction** (Jessie tests as a new player, which is the audience). The popped up
instructions are the hints (`ui.hint`): timed, fading on their own, no way to hold or dismiss them.
**Fixed, LIVE as 20260917n (21:50 UTC):** the teaching hints (first tap, first missed shot, first lint fog) stay until a
48 px Got it button or the hint itself is tapped; every timed hint lasts at least 1.8 s plus 55 ms a character and
dismisses on a tap; the Sweep hint keeps its 2.8 s clock; a sheet opening or leaving to the room clears any hint. Gate
`dev/gate-hints.mjs` (red on the old code, 5 checks: no button, gone before a slow reader finished, not tappable), step4
and review green on the change; the sticky hint shot looked at (top band over the dryer, pile untouched).
