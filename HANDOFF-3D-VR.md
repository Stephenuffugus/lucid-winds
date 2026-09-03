# SEP 03, 3D ASSETS AND VR ACROSS THE WHOLE CATALOG

Written by Fable on 2026-09-03 from Stephen's brief that night. Companion to
`HANDOFF-SEP02.md` (the master list; this file is its Lane F). Two Opus prompts:
**V1** audits every carded game for 3D asset potential and VR fit and writes the
shortlist; **V2** builds one VR pilot after Stephen picks from that shortlist.
Nothing is built by V1. Nothing here needs Stephen tonight.

## 0. How to use this file

Same rules as HANDOFF-SEP02.md, repeated so the prompt blocks stand alone:

1. `git pull --rebase origin add-sproing-jumper` before the first edit and before
   each commit. `git add` only the paths in the FILE FENCE, never `-A`. Commit on
   `add-sproing-jumper`. **Never push to main.** Fable reviews and deploys.
2. A gate is not a gate until it has been watched to FAIL first. A visual step is
   not done until a screenshot from where the player stands has been opened and
   described, three things wrong named, before it is called done.
3. Every patch asserts its anchor landed. A red gate names a suspect, not a
   culprit (the code, a stale test, or the two core machine).
4. No dashes in player-facing copy, ever. Commas. Internal docs: commas anyway.
5. "Sky Wolf Studio", singular.
6. This box has two cores. Gates run one at a time. At most two helper agents,
   and never for a judgement call.

## 1. His brief, in his words

> have it look over all the games for potential 3D assets and the best ones for
> VR. a lot of them would be really simple I think because they wouldn't need to
> be massively 3D but they could. some would play great, be fun, and look good in
> VR with some simple work.

Two asks in one sentence, and they are separable:

- **3D assets**: which games would look better with meshes, and by which route
  (pre-rendered art, a 3D view riding the existing sim, or a skinned 3D world).
  This is about the phone game first. It does not need a headset.
- **VR**: which games would be worth putting on the Quest, in which shape, and
  how much work each is. "Simple" is the operative word and section 3 says
  where simple honestly lives.

## 2. What already exists (read, do not redo)

| file | date | the one fact it holds |
|---|---|---|
| `incoming/VR-PLAN.md` | Aug 16 | Meta takes plain 2D PWAs. The whole arcade can be a Horizon Store app with zero VR work. Phase 1 = the 2D store app; the one blocker (13 off-origin games) was cleared Aug 18 (`HANDOFF.md` §1). Still waiting on the Meta developer account. |
| `incoming/VR-CANDIDATES.md` | Aug 16 | The selection test: does the player's BODY do something a thumb cannot, and does the camera translate without being asked. The "VR friendly" middle row (a flat game on a curved panel) is the one thing never to ship. Picks: Create A Critter first, Super Slice 3D forest only (never the falls), Dewball as a tabletop diorama, PadLab as an instrument. Two titles, not five. |
| `QUEST-COMPAT.md` + `scripts/quest_triage.mjs` | Aug 16 | 0 of 186 blocked from a controller pointer. STALE: 186 rows (187 today) and 17 "unknown" that are now readable because they were vendored. The Aug 16 lesson stands: the first run reported 19 blocked, every one a false positive. A checker is verified before the code it accuses. |
| `satellites/ripcord/docs/VR-PILOT.md` | Aug 31 | The pattern for cheap VR: "no new game logic, a new CAMERA and a new HAND." sim2.js runs headless; a 3D scene rides it 1:1. Meshes, launchers and dishes already exist. |
| `satellites/ripcord/src/battle3d.js` + `HANDOFF-3D.md` | Aug 30-31 | The precedent in code: a three.js view (r0.161.0, vendored) drawing the untouched sim on a tilted camera, behind the ⚙ "3D battle (beta)" toggle. 570 lines. Stephen has not played it (task R1 in HANDOFF-SEP02.md waits on that). |
| `satellites/ripcord/docs/FORGE3D.md` | Aug 30 | The mesh pipeline that works: Meshy → Blender clean-up → glTF with named materials → `gltfpack -kv -noq` → 112 parts at ~2.3 MB, triangle budget per part measured in a report. `tools/forge3d/meshy_api.py` drives Meshy; it has no task id persistence, so never kill and rerun a generation (double spend). |
| `HANDOFF-SEP02.md` §W1 | Sep 2 | The budget gate for skinning a three.js world: draw calls ≤2x today, triangles ≤3x, textures ≤24 MB, median frame <12 ms at 4x throttle; lazy load with the primitive as fallback forever. Dewball first. |
| `satellites/aura-off/docs/AURA-3D-VR.md` | Aug 28 | Google 3D Tiles cannot ship (four blockers, the trailer rule alone kills it); OpenStreetMap can. §5: Aura Off's gestures ARE hand tracking, the composure mechanic measures what a hand tracker measures. |
| `LOAF_3D_PLAN.md` | Aug 3 | The cat is 3D by direction; Blender headless authoring. Not a catalog game. |
| `design-briefs/kanoodle-3d.md`, `super-slice-3d.md`, `chameleon-3d-engagement.md` | Jul | Three 3D briefs; Kanoodle is unbuilt and its pyramid is a tabletop by nature. |

## 3. What changed since Aug 16, and what V1 must reconcile

The Aug 16 advice was **two titles, not five, and never the "VR friendly" middle
row**. That still stands for flat ports: a 2D game on a curved panel with head
tracking costs nearly as much as real VR and gets punished harder.

What that document under-served is the lane where "simple" honestly lives, and
it is the lane Stephen is describing:

**The tabletop.** A board or an arena that already fits on one phone screen
becomes a physical board on a table in front of the player, at real scale, the
same rules, the same sim. The hands reach in: pick up, place, flick, throw, stack,
turn a piece over. That IS a body verb a thumb cannot do (question one, yes), and
the camera never moves because the player is standing at a table (question two,
comfortable by construction). It is the Moss and Demeo framing, and it is the
framing VR-CANDIDATES.md already gave Dewball. It generalises.

Why it is cheap **here** specifically: twelve satellites carry a headless `test/`
suite today (attic, aura-farm, aura-off, budburst, conduit, moon-claw,
power-scalers, ripcord, skyshot, stream-hop, tangent, twin-lanterns), which means
their sim runs with no screen, which is exactly the property that let Ripcord put
a 3D camera on an untouched game in 570 lines. Any game with a real sim/render
split is a candidate for a 3D view riding it, and V1's first job per game is to
find out whether that split exists.

Since Aug 16 the facts moved:

- The 13 off-origin games are same origin (Aug 18). The 2D store app has no
  code blocker left, only the Meta developer account.
- Ripcord grew a 3D battle view, 112 forge meshes, 44 hero sculpts, launchers,
  dishes, and a scoped VR pilot. The pattern is proven in this repo.
- The catalog is 187 carded (120 satellite, 67 native), 161 openable.
- W1 wrote the performance budget for a skinned three.js world.

So V1 does not ask "which five games", it asks, for every game, **which shape,
which route, at what cost**, and hands Stephen a ranked list he can pick one
from. Two titles at a time is still the build discipline. The audit is cheap;
the builds are not.

## 4. The vocabulary (binding; every row uses exactly these words)

**VR lane**, one per game:

| lane | meaning | the test |
|---|---|---|
| `WINDOW` | stays 2D, ships inside the arcade's 2D store app | the default. Not a failure. Most of the catalog. |
| `TABLETOP` | the board or arena at real scale on a table, same sim, hands reach in | the play area fits one screen without scrolling (or a reframe removes the scroll and is named), the verbs are reach, place, flick, throw, stack |
| `STANDING` | the player stands and the body does the verb: swing, wind, aim, throw at, look around a thing | there is a body verb and no camera translation, or the game is already 3D with a fixed or orbiting camera |
| `NEVER-IMMERSIVE` | never as VR; fine as a WINDOW | sustained camera translation (runners, falls, chase cameras) with no honest reframe |

**3D asset route**, one per game (independent of the VR lane):

| route | meaning | precedent |
|---|---|---|
| `PRERENDER` | meshes rendered to sprites, turnarounds or strips; the 2D game and its runtime do not change | `satellites/ripcord/tools/forge3d/` renders every part to a lit PNG; `docs/ZOETROPE.md` for phase-stepped faces |
| `RIDE` | a three.js view rides the existing sim; the 2D game stays the fallback | `satellites/ripcord/src/battle3d.js` |
| `SKIN` | an existing three.js world gets Meshy meshes under the W1 budget | W1 (Dewball, Abduct, Chameleon 3D) |
| `NONE` | the art IS the code and must stay so; cite the law | Conduit (`docs/DESIGN.md` Appendix A and B, the ferro law); Ripcord's parts derive from stats (`FORGE3D.md` "the geometry is the stats") |

**Effort**: `S` (3 days or less), `M` (10 days or less), `L` (more). The honest
Aug 16 number stands: a native VR title is 4 to 8 weeks before anyone plays it.
A TABLETOP ride of a sim that already runs headless is where `S` and `M` live.

**Comfort**: `SAFE` (fixed camera, the world comes to the player), `CARE`
(bounded motion, snap only, needs a comfort pass), `HAZARD` (sustained
translation, vertical worst of all).

**The hands**: one sentence per game, what the player's hands physically do in
the headset version. If the honest sentence is "tap a floating panel", the lane
is WINDOW.

## 5. OPUS TASK V1, the audit

```
You are auditing the whole Sky Wolf Studio catalog for 3D asset potential and
VR fit, in the lucid-winds repo, branch add-sproing-jumper. This is a READ
ONLY pass over the games: you write documents and scripts under docs/ and
scripts/, and you touch no game folder. Nothing is built from this task; the
Director picks from your shortlist and a second prompt (V2) builds the pilot.

Read first, in this order: HANDOFF-3D-VR.md sections 1 to 4 (the vocabulary
in section 4 is binding; do NOT open section 9 until your first pass is
written, it holds Fable's guesses and you must not be anchored by them);
incoming/VR-CANDIDATES.md and incoming/VR-PLAN.md (Aug 16, the selection
test and the comfort law); QUEST-COMPAT.md (stale; you regenerate it);
satellites/ripcord/docs/VR-PILOT.md (what "a new camera and a new hand"
means); satellites/ripcord/src/battle3d.js (the precedent in code);
satellites/ripcord/docs/FORGE3D.md (the mesh pipeline); the W1 section of
HANDOFF-SEP02.md (the performance budget); satellites/aura-off/docs/AURA-3D-VR.md
section 5 (hand tracking); the header comment of scripts/catalog.mjs (why you
never regex the catalog); docs/brain/INDEX.md.

THE LIST is the catalog, read by the one parser, never by regex:
  node --input-type=module -e "import {catalog} from './scripts/catalog.mjs';
  console.log(JSON.stringify(catalog().all, null, 1))"
187 rows today: 120 satellite cards (url /satellites/<dir>/) and 67 native
games (url /play/<id>.html, source play/<id>.html plus games/<id>.js). Every
row is judged, gated rows included (carry the gated flag). Lucid Winds itself
is one row.

STEP 0, THE TRIAGE REFRESH (one commit). node scripts/quest_triage.mjs
--selftest, then node scripts/quest_triage.mjs --report, then without
--report to rewrite QUEST-COMPAT.md. The 13 games it called "unknown" on Aug
16 were vendored into satellites/ on Aug 18 and must now read; if any still
reads unknown, fix the detector, add a selftest case that FAILS without the
fix, watch it fail, then pass. Report old and new counts side by side.

STEP 1, THE READ (no commit until the JSON is complete). For every row, open
the source and record, each with a file:line citation:
  renderer      DOM | canvas2d | threejs | webgl | mixed
  split         does the sim run without a screen? (a test/ folder, a node
                harness, or a step()/draw() separation you can point at)
  camera        fixed | scrolling | chase | orbit | first-person, and the
                line that moves it
  input         the verbs the game reads today: tap, drag, swipe, tilt,
                keys, two finger, hold
  area          board | arena | lane | scrolling world | screen of panels
  reading       how much text a round puts on screen (from
                portal/catalog-tags.json "reading", note its firm flag)
  length        from catalog-tags.json "length", note its firm flag
Proportional reads: for a file over 3000 lines, grep for the camera and loop
(camera., lookAt, cam., scrollX, translate(, draw(, step(, tick(,
requestAnimationFrame) and read those functions, not the file. Read the
folder's HANDOFF.md / AUDIT-NOTES.md / docs/ first when they exist; then grep
each feature a doc claims before you believe it (a documented camera has been
absent from code in this repo before). A row you could not read says UNREAD
with the reason, never a guess.

STEP 2, THE JUDGEMENT. Per row assign, using ONLY the section 4 words:
  lane, route, effort, comfort, hands (one sentence), notes.
Rules that decide the lane:
  - The two questions decide it: does the body do something a thumb cannot;
    does the camera translate without being asked.
  - A game that scrolls or chases is NEVER-IMMERSIVE unless a tabletop
    reframe removes the translation (the world turns under a fixed camera,
    the way VR-CANDIDATES.md reframes Dewball); then it is TABLETOP and the
    reframe is named in notes.
  - A board or arena that fits one screen is the natural TABLETOP shape.
    Say what the hands pick up.
  - STANDING needs a body verb (swing, wind, throw, aim, look around a
    thing) and a fixed or orbiting camera.
  - WINDOW is the default and is not a failure.
Rules that decide the route:
  - NONE where the art is the code, with the law cited.
  - PRERENDER when the game is 2D and would look better with rendered
    meshes but nothing in its runtime should change.
  - RIDE when a sim/render split exists (or is one refactor away) and a 3D
    view could draw the same state.
  - SKIN when three.js is already the renderer.
Effort is per the lane, not the route, and is honest: a TABLETOP ride on a
headless sim is S or M; anything that needs a new camera AND a new input
model AND new meshes is L.

STEP 3, THE SHORTLIST SHOTS. Rank by lane (TABLETOP and STANDING first),
then effort ascending, then comfort. Take the top 12. For satellites:
  node scripts/shoot_games.mjs docs/shots-vr <slug> [<slug>...]
For native games, the same with puppeteer at 375x667 against play/<id>.html
(serve the repo root; the shoot script shows how). OPEN every image with the
Read tool. For each game write: what the headset would show at table scale
(how big is the board, where are the hands), what would break (text at 1.5 m,
controls under 48px, anything needing two fingers or tilt), and three
things wrong with the shot as a VR starting point.

STEP 4, WRITE (one commit).
  docs/3d-vr-audit.json    one object per catalog row, fields exactly:
                           name, url, kind, gated, renderer, split, camera,
                           cite, input, area, lane, route, effort, comfort,
                           hands, notes. This is the source of truth.
  scripts/vr_audit_md.mjs  generates docs/3D-VR-AUDIT.md FROM the JSON
                           (the full table, sorted lane, effort, name), so
                           the two can never disagree. Rerunning it must
                           produce a byte identical file.
  scripts/vr_audit_check.mjs  asserts: row count equals catalog().total;
                           every row has lane, route, effort, comfort, and
                           a cite or UNREAD; every lane/route/effort/comfort
                           value is from section 4's word list. Watch it
                           fail once (blank one field) before you trust it.
  docs/3D-VR-SHORTLIST.md  the ranked top 10 for VR: for each, the thirty
                           second demo in one sentence, the hands, the lane
                           and comfort, the effort in days with what the
                           days are spent on, the asset list it needs
                           (families and counts, named the way
                           satellites/conduit/ART_ASSETS.md names them),
                           whether it has a headless path, and the one
                           question the Director must answer before V2.
  docs/3D-ASSET-CANDIDATES.md  ranked by 3D asset value regardless of VR:
                           route, the first asset family to make, whether
                           W1's budget gate applies, and the phone benefit
                           in one line. This list feeds W1's "which game
                           next".
Both md documents carry a section "Against Aug 16" that states, pick by
pick, where you agree and where you disagree with incoming/VR-CANDIDATES.md
(Create A Critter, Super Slice 3D forest, Dewball, PadLab) and why. Say it
explicitly. An older document that is not answered wins silently.

GATES (one at a time): node scripts/vr_audit_check.mjs; node
scripts/vr_audit_md.mjs twice and diff the output (byte identical); node
scripts/quest_triage.mjs --selftest; node scripts/catalog.mjs (the count you
built against, printed into your report).

RULES:
- FILE FENCE: docs/3D-VR-AUDIT.md, docs/3D-VR-SHORTLIST.md,
  docs/3D-ASSET-CANDIDATES.md, docs/3d-vr-audit.json, docs/shots-vr/**,
  scripts/vr_audit_md.mjs, scripts/vr_audit_check.mjs, QUEST-COMPAT.md, and
  scripts/quest_triage.mjs only for a detector bug with a failing selftest
  first. No game folder. Do not edit incoming/VR-*.md; they are history and
  you cite and correct them in your own documents.
- Helpers: at most two agents, for reading only, never for the lane call.
  Two cores. Nothing concurrent with a gate.
- No Meshy calls, no generation of any kind. This task spends nothing.
- git pull --rebase origin add-sproing-jumper before the first edit and
  before each commit. git add the fence only. Never push to main.

REPORT: the lane counts and route counts; the top 10 with one line each;
the three biggest disagreements with Aug 16 and the code line that decided
each; the detectors you fixed; every UNREAD row and why; the shot paths.
```

## 6. OPUS TASK V2, the pilot (after Stephen picks a game from the shortlist)

Replace the bracketed fields from the shortlist row. One game, one fence.

```
You are building the VR PILOT for [GAME] at satellites/[slug]/ in the
lucid-winds repo, branch add-sproing-jumper. It is the Director's pick from
docs/3D-VR-SHORTLIST.md; its row there and its entry in docs/3d-vr-audit.json
are the brief (lane [TABLETOP|STANDING], comfort [SAFE|CARE], the hands:
"[sentence]"). Read first: those two, the game's own HANDOFF.md /
AUDIT-NOTES.md / docs/, satellites/ripcord/docs/VR-PILOT.md and
satellites/ripcord/src/battle3d.js (the precedent: a 3D view riding an
untouched sim), incoming/VR-PLAN.md section 3 (the technical spec), the W1
section of HANDOFF-SEP02.md (the budget), satellites/ripcord/docs/FORGE3D.md
(meshes), and /workspaces/abduct_a_chameleon/docs/RENDER-BUGS-AUG02.md (one
root cause was three of the Director's four reports; you look at the world).

THE LAW: no new game logic. The sim that runs on the phone today is the sim
that runs in the headset. You add a camera, a hand, and a scene. A player who
never enters XR gets a game that is unchanged, and a gate proves it.

PHASE 0, THE RIDE (one commit). A satellites/[slug]/vr/ entry (or a ?vr=1
path if the game is one file and its docs say so) that loads three.js from a
vendored copy (the r0.161.0 Ripcord ships in satellites/ripcord/, never a
CDN), builds the [table scene: table top at 0.75 m, board [W] m across,
player standing | standing scene per the row] at real scale, and draws the
existing sim state every frame with primitive geometry, no meshes yet. The
camera is fixed; the world comes to the player. Gates, headless: boots and
renders 120 frames with renderer.info draw calls under 100 and a median
frame under 12 ms at 4x CPU throttle; a determinism gate that the sim's
outputs for a fixed seed are identical with the vr view on and off (make it
fail first by letting the view write one sim value, watch it fail, remove
the write). test/vr_ride.mjs holds both.

PHASE 1, THE HAND (one commit). Map the verbs the row names onto: WebXR
controllers when navigator.xr.isSessionSupported('immersive-vr') resolves
true; hand tracking only if the row says so; a mouse and touch fallback
otherwise so the pilot plays on a phone and headless. Requirements from
VR-PLAN.md section 3, all of them: local-floor with a local fallback,
renderer.setAnimationLoop, setPixelRatio(1) inside XR, no artificial
locomotion ever, snap turn only if comfort is CARE, AudioContext resumed on
session start, THREE.PositionalAudio for the sounds the game already plays,
VR additive and never required. A control test at 375x667 for the fallback
(every target 48 rendered px, elementFromPoint at its centre, never
el.click()).

PHASE 2, THE LOOK (one commit). Meshes only through FORGE3D (gltfpack -kv
-noq), under the W1 numbers (draw calls at most 2x Phase 0, triangles at
most 3x, textures at most 24 MB, median frame under 12 ms at 4x throttle),
loaded lazily with the primitive as the fallback forever. Check the Meshy
credit balance BEFORE the first generation and write it in HANDOFF.md; the
driver has no task id persistence, so never kill and rerun a generation.
Then SHOOT from where the player stands (eye height 1.6 m at the table
edge), then the worst angle you can find (under the table, behind the
board, into the light, the edge of the room). Open the images. Write three
things wrong in satellites/[slug]/HANDOFF.md under "VR pilot" before you
fix any of them.

FUNNEL: the pause and end screens of the vr entry carry the lucidwinds.com
link tagged ?src=quest-[slug] and a QR of it.

RULES:
- FILE FENCE: satellites/[slug]/** only. If the game's source lives in
  another repo (VENDORED.json in the folder says so), build upstream and
  re-vendor; never hand edit the vendored copy.
- Gates one at a time. Nothing concurrent on the two core box.
- No dashes in anything the player reads. Commas.
- git pull --rebase origin add-sproing-jumper before the first edit and
  before each commit. git add the fence only. Never push to main.
- Nothing here is believed until the Director has it on the Quest 2. Write
  the device checklist in HANDOFF.md as unchecked boxes: text legible at
  1.5 m, every control reachable seated, no queasiness in five minutes, the
  hands sentence true in practice.

REPORT: each gate's last line, the shot paths, the three wrong things and
what you did about them, the Meshy balance before and after, and the
questions only the Director can answer.
```

## 7. How this feeds the tasks already on the board

- **W1** (Meshy world skins) takes its "which game next" from
  `docs/3D-ASSET-CANDIDATES.md`. Dewball stays first because its source is in
  this repo.
- **R1** (Ripcord 3D battle) still waits on Stephen's three rounds. Ripcord is
  also the most complete STANDING candidate on paper (VR-PILOT.md); V1 will
  rank it, and if it ranks high, V2 for Ripcord is VR-PILOT.md's scoped build
  with the prompt above.
- **The 2D store app** (VR-PLAN.md Phase 1) is still the fastest exposure of
  all and is a separate, smaller task: package with `@meta-quest/bubblewrap-cli`
  in 2D mode once the Meta developer account exists. It does not wait on V1.

## 8. STEPHEN ONLY (none of it tonight)

1. **Meta developer account** under SWS Strategic Media LLC
   (developers.meta.com/horizon). Free, minutes. Every store path is blocked
   until it exists, and it has been the blocker since Aug 16.
2. **Fifteen minutes with the arcade on the Quest 2.** Not a test, a play.
   Text size, pointer precision, and comfort in the browser tell us more than
   any static read. Write three things down or tell Fable.
3. **Pick one game from `docs/3D-VR-SHORTLIST.md`** when V1 lands. That pick
   fills the brackets in V2.
4. **Meshy credits.** Check the balance before any V2 Phase 2 or W1 spend.
5. **Ripcord 3D battle, three rounds** (⚙ Settings → "3D battle (beta)"), still
   open from the Sep 2 list.

## 9. Fable's first guesses (Opus: read only AFTER your first pass is written)

Guesses from names, folders and what I have read in earlier sessions, not from
the camera code of each game. They exist so the audit has something to refute,
not something to copy. A guess the code contradicts is wrong, and the code wins.

- **TABLETOP, likely S or M:** the board games in `/play/` (chess, backgammon,
  battleship, c4, mahjong), Ring Stacker, Hexa Hive, Sprout Dice, Shell
  Shuffle, Snakes and Ladders, Moon Claw, Burrow Bowl, Greenhouse Pinball,
  Garden TD, Siege, Skyshot, Tangent (its edge fall is a table edge), Dewball
  (the globe reframe from Aug 16), Kanoodle (unbuilt; the pyramid brief is a
  tabletop by nature).
- **STANDING:** Create A Critter (still the pick, its camera already orbits a
  fixed origin), Super Slice 3D forest only, Ripcord (VR-PILOT.md), Sweet Spot
  (a swing is a body verb, highest reinvention cost), Aura Off (hand tracking),
  PadLab as an instrument (from scratch, the only one nobody else can copy).
- **NEVER-IMMERSIVE (fine as WINDOW):** Super Slice Wall Climb, Free Fall and
  Endless Fall; Vine Runner, Puppy Dash, Stream Hop, Sproing, Pitbike Rally,
  Sled Vine, Bubblenaut, and any other runner or chase camera.
- **Route NONE:** Conduit (ferro law), Ripcord's parts (the geometry is the
  stats), Lucid Winds itself (the plant is a hash).
- **Route SKIN:** Dewball, Abduct a Chameleon, Chameleon 3D, Create A Critter,
  Slice 3D (already three.js).
- **Route PRERENDER, worth checking:** the card and token games whose pieces
  are flat today and would read better as rendered objects (Sprout Dice,
  Shell Shuffle, Hexa Hive tiles, the Attic's cabinets).

The sizes I would expect if the guesses hold: roughly two thirds WINDOW, a
dozen TABLETOP at S or M, five or six STANDING, a dozen NEVER-IMMERSIVE. If V1
comes back with very different proportions, that is information, not an error.
