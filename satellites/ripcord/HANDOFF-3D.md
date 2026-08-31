# HANDOFF-3D — the tilted-camera 3D battle view

You are building ONE feature in `/workspaces/lucid-winds/satellites/ripcord/`:
an optional 3D rendering of the battle, riding the EXACT same simulation.
The Director is Stephen. This handoff was written by Fable, who will review
every line you produce against this document. Deviation is the failure mode
this document exists to prevent.

## THE CONTRACT (read twice)

1. **You edit `src/`, then run `node tools/bundle.js`.** `index.html` is
   GENERATED. Never edit index.html directly.
2. **Every edit to an existing file is an anchored replacement that asserts
   its match** (python `assert s.count(old)==1` style, or Edit-tool exact
   match). You never rewrite an existing file wholesale. If an anchor does
   not match, STOP and write the mismatch into the progress log at the
   bottom of this file. Do not improvise a similar-looking anchor.
3. **You may create these new files and no others:**
   `src/battle3d.js`, `test/battle3d.mjs`, `docs/shots-3d/*` (images).
   **You may edit these existing files and no others:**
   `src/play-shell.html`, `tools/bundle.js`, this file's progress log.
4. **A checkbox is flipped only with pasted evidence** (the command and its
   real output) in the progress log. A [x] without evidence is a lie and
   Fable will treat it as one.
5. **Never push to main.** Commit to the branch `add-sproing-jumper` and
   `git push origin add-sproing-jumper` after every phase. `:main` deploys
   the live site and is NOT yours. Do not bump `src/version.json` or the
   portal buster - that is the deploy step, which is not yours either.
6. **Gates before every commit:** `node tools/bundle.js` then
   `node tools/check.js` must print `ALL GATES PASSED`. Known flake: the
   playthrough gate can fail under CPU contention; if it fails in the
   suite, run `node test/playthrough.mjs` alone - twice - and if both print
   PLAYTHROUGH OK, the suite failure was the documented flake and you may
   proceed. Any OTHER gate failing means you broke it: fix or roll back.
7. **A visual change is not done until you have LOOKED at it.** Every phase
   ends with screenshots you open with the Read tool and describe. Name
   three things wrong in the image before moving on. "The probe passed"
   is not a look.
8. **The 2D game is the product.** Nothing you do may change how the game
   plays, draws, or measures when the 3D toggle is OFF. `test/determinism`
   and every balance gate prove the sim untouched; the playthrough proves
   the 2D flow untouched. If you find yourself editing sim2.js, wind.js,
   rigs.js, ladder.json, or any balance number: STOP. That is deviation.

## FACTS (verified against the repo on 2026-08-31; do not re-derive)

- **Units:** sim positions are METERS; every mesh is MILLIMETERS.
  `sim meters x 1000 = mesh units`. `SIM.K.arenaR = 0.15` (the standard
  dish; a boss round overrides per-round via `arenaR` on the round object,
  the game already passes it - read it from the state you are given, never
  from K). The chalk_ring stadium glb measures 420mm across, which is the
  150mm play radius plus the rail: the glb's own geometry is ALREADY at
  the right scale for arenaR x 1000. Do not rescale stadium meshes.
- **The nominal stack** (proven by forge, `docs/FORGE3D.md`): a top is
  bit (0 to 12mm) + ratchet (12 to 18mm) + blade (underside at 18mm) +
  core (top at ~26mm). Hero core glbs are ~20mm wide and ~10mm tall;
  hero blade glbs are ~45mm wide, already fitted flat, bores machined.
  Assemble a top as a THREE.Group: bit at y=0, ratchet y=12, blade y=18,
  core y=18+blade_height (use each glb's own bbox height rather than
  hardcoding; the stack rule gives the ORDER and the seams).
- **Meshes:** `assets/3d/hero/{core,blade}/<id>.glb` (Meshy sculpts,
  ~30k tris, textured) for the two visible slots;
  `assets/3d/{assist,ratchet,bit,weight}/<id>.glb` (forge procedural,
  small) for hardware; `assets/3d/stadium/{chalk_ring,posts,taya_circle,
  long_range}.glb`; `assets/3d/launcher/*.glb` (NOT in scope this build).
- **Mode to stadium:** pangkah=chalk_ring, uri=posts, taya=taya_circle,
  tujlub=long_range.
- **Painted floors:** `assets/arenas/{pangkah,uri,taya,range}.webp` -
  the 2D game draws them under its marks. The stadium glbs have their own
  floor geometry; for this build the glb's floor is enough. Do NOT try to
  project the webp onto the mesh in v1.
- **The proven three.js loading pattern** is the V3D inspect viewer,
  `src/play-shell.html` lines ~1029-1230: importmap at line ~685 maps
  'three' to `assets/3d/lib/three.module.min.js`; dynamic
  `Promise.all([import(...)])` of three + GLTFLoader + RoomEnvironment on
  FIRST use only; `PMREMGenerator` + `RoomEnvironment` with
  `scene.environment` (metal with nothing to reflect renders as black
  soap - this is the fix, envIntensity ~0.55); an explicit clear function
  that disposes geometry, materials, and the renderer. COPY THIS PATTERN.
  The vendored lib files are byte-frozen: never edit, never cache-bust.
- **Sim state you ride:** the main IIFE's round objects `A` and `B`:
  `o.x, o.z` (meters, dish plane), `o.w` (spin rad/s, sign = direction),
  `o.phase` (heavy-side angle; the 2D game draws visual spin as
  `o.phase*0.12`), `o.lx, o.lz` (lean vector; magnitude = lean angle in
  radians, direction = where the top leans), `o.alive`, `o.spec.R`
  (radius, meters), `o.spec.cfg` ({core,blade,assist,ratchet,bit,...}).
  The drop animation state is `withDrop`'s: during phase 'drop' the tops
  fall in; read `dropT / DROP_DUR` for progress.
- **The 2D camera** is `CAM` (`{z, fx, fy, ev}`) - an event envelope that
  punches toward finishes. Map `CAM.z` to a dolly factor in 3D so the
  finish punch survives the view change.
- **Headless WebGL probes need**
  `--use-angle=swiftshader --enable-unsafe-swiftshader --no-sandbox` and
  the probe pattern is "evaluate, wait, screenshot, READ the image".

## THE DESIGN (locked; do not redesign)

`window.B3D` - a module in `src/battle3d.js`, bundled via a new
`/*__BATTLE3D__*/` slot in `tools/bundle.js` + `src/play-shell.html`
(follow how `/*__STORE__*/` is wired: one replace line in bundle.js, one
slot comment inside a script tag in play-shell). All code ES5-compatible
EXCEPT it may use dynamic import() exactly the way V3D does (that shipped
and is the precedent). Inside an IIFE; expose only `window.B3D`.

API (the main IIFE calls these; keep the surface this small):

    B3D.wanted()        -> save.settings.battle3d === true
    B3D.ready()         -> lib loaded and scene built
    B3D.enter(mode, arenaR)  -> build/refresh the scene for this round:
                           stadium mesh for the mode, two top groups
                           built from A.spec.cfg / B.spec.cfg, camera
                           at 38 degrees elevation framing the dish,
                           lights + PMREM environment. Async; loads on
                           first use, reuses after.
    B3D.sync(state)     -> called once per frame from the main loop when
                           active. state = {A, B, phase, dropProgress,
                           camz} with A/B as {x, z, w, phase, lx, lz,
                           alive, R, cfg} plain copies. Positions the
                           top groups (x*1000, stackY, z*1000), spins
                           them (rotation.y advances by w*dt visually or
                           uses phase*0.12 - match the 2D game's visual
                           rate: phase*0.12), tilts them (lean vector ->
                           group rotation about the lean axis), applies
                           the drop height during the drop phase
                           ((1-dropProgress) * 220mm fall), hides dead
                           tops (a dead top lies flat: rotate to 88
                           degrees, rest on the floor - one static pose,
                           no physics theater), applies camz as a dolly.
    B3D.project(x, z)   -> {x, y} screen CSS pixels for a sim position,
                           via the 3D camera. The 2D overlay uses this to
                           keep tells and the armed glyph anchored.
    B3D.exit()          -> hide and stop rendering; full dispose happens
                           only on quit to menu (V3D's clear pattern).

Renderer: its own canvas `#b3d` inserted BEFORE the 2D canvas `#cv` in
the DOM so the 2D canvas (kept transparent where the arena was) overlays
it. When active, the 2D loop SKIPS drawStadium/drawTop/drawSparks
(one guard: `var b3dOn = B3D.ready() && B3D.wanted() && B3D.active;`)
but still draws: flash banner, finish symbol, spin bars, tells,
armed marker - the tells and armed marker call B3D.project for their
anchor instead of computing from CX/CY when b3dOn.

Settings: one toggle row "3D battle (beta)" in the settings sheet,
persisted at `save.settings.battle3d`, default OFF. Find the existing
settings rows (grep `reduceMotion` in the settings markup) and clone
their exact row pattern. When the toggle is ON but WebGL init throws,
set a session flag, fall back to 2D silently, and show one line in the
settings row: "3D could not start on this device." The fallback law:
no picture, no difference, NEVER an error screen.

Zoetrope faces: NOT in this build. Sparks: skip in 3D v1 (the 2D sparks
draw in screen space and will look wrong; leave them off when b3dOn -
one guard in drawSparks).

Performance: load ONLY the meshes for the two fitted configurations of
the current round (5 glbs per top + stadium = 11 files); cache by id
across rounds; dispose on quit-to-menu. Hero core+blade, forge hardware.
Do not preload the catalogue.

## PHASES - each ends with gates green, a commit, and a push

### Phase 0 - the gate that fails
Write `test/battle3d.mjs` FIRST, modeled on `tools/shots.mjs`'s server +
browser boot (serve webp! check its TYPES map) with the swiftshader
flags. The probe: boot fresh, enable the toggle via
`localStorage['ripcord.save.v1']` (parse, set `settings.battle3d=true`,
reload - the playthrough gate does exactly this dance for rung), start a
battle the way shots.mjs does (wind three circles, tap go), then assert:
(a) a `#b3d` canvas exists with nonzero size, (b) a screenshot's dish
region is not >90 percent one color (the black-soap assertion), (c) two
screenshots 600ms apart differ in the dish region (the tops move),
(d) zero page errors. Save shots to `docs/shots-3d/probe-*.png`.
RUN IT NOW and paste its FAILURE into the progress log - a gate you have
not watched fail is decoration. Commit "battle3d: the gate, failing".

### Phase 1 - the scene stands
`src/battle3d.js` + bundle slot + settings toggle + the enter/exit
skeleton: stadium mesh, two STATIC top groups at the spawn marks, camera,
lights, environment. Wire `B3D.enter` from the round-start path (find
where the 2D game calls `resetRound`/launch - enter once per round when
wanted). The 2D game must be pixel-identical with the toggle off: run
`node tools/shots.mjs` and compare 12-battle-early against the current
committed one by eye. Probe will still fail (c) - tops do not move yet;
(a), (b) must now pass. Evidence: probe output + a `docs/shots-3d/`
image you have LOOKED at and described. Commit.

### Phase 2 - the sim rides
`B3D.sync` from the frame loop (call it where the 2D loop draws, inside
the same `b3dOn` guard), skip-2D guards, drop animation, dead pose,
camera dolly from CAM.z. The full probe passes now, including motion.
LOOK at three probe shots: launch, mid-fight, a finish. Describe the
lean - if the tops stand bolt upright through a whole round, `lx/lz` is
not wired; if they wobble violently, you scaled radians wrong (lean
magnitude is SMALL, ~0.03-0.4 rad - apply directly as Euler about the
axis perpendicular to the lean direction). Commit.

### Phase 3 - information survives
Tells + armed glyph anchored via `B3D.project` when b3dOn; sparks off;
banner/bars/finish symbols confirmed drawing OVER the 3D (they already
draw on #cv, which sits above #b3d - verify by shot, not by assumption).
WebGL-failure fallback proven: probe variant that stubs
`HTMLCanvasElement.prototype.getContext` to throw for 'webgl2'/'webgl'
and asserts the 2D game still boots and plays with zero errors. Full
gates. Commit.

### Phase 4 - the hostile eye
Run the probe at 320x568 and 667x375. Run `node tools/shots.mjs` (375)
and `node tools/shots.mjs 320 568` - the 2D-off path stays clean. Take
the WORST shot you can: camera punched during a ringout at the rail,
both tops at the far rim. LOOK at everything. Fill the progress log's
"three things I would fix next" honestly - Fable will compare your list
against the images. Final full `node tools/check.js`. Commit, push the
branch, STOP. Do not deploy. Write "READY FOR REVIEW" at the bottom of
the progress log.

## TRAPS ALREADY PAID FOR (each of these cost a session once)

- Chrome on a black world = black rubber; metal with nothing to reflect
  = grey soap. PMREM RoomEnvironment, always (V3D lines ~1137-1138).
- The main IIFE's functions are invisible to inline onclick without
  `window.` exposure - if you add any inline handler, expose it.
- `pgrep -f` in a wait loop matches its own command line; poll files.
- A probe that must earn its state mostly tests its own play skill -
  seed state through storage like the playthrough gate does, then verify
  through the UI.
- Background bash tasks die at 10 minutes; long Blender/batch work needs
  resume-if-exists (not applicable here - you should need no Blender).
- `document.getElementById` on an element inside a hidden `<details>`
  still works; `getBoundingClientRect` on it returns zeros - do not
  measure hidden things.
- The wind screen and menu run a DEMO battle behind them with A/B set -
  gate `B3D.enter` on the real round path, not on "A exists", or the
  menu will boot WebGL for a backdrop nobody asked for.
- `o.phase` can be negative; normalize before deriving anything cyclic:
  `((x % T) + T) % T`.
- Edge-cache law if you ever THINK about deploying: you do not deploy.

## PROGRESS LOG (append only; evidence pasted inline)

- [ ] Phase 0: gate written, watched failing. Evidence:
- [ ] Phase 1: scene stands, 2D untouched. Evidence:
- [ ] Phase 2: sim rides, probe fully green. Evidence:
- [ ] Phase 3: information survives, fallback proven. Evidence:
- [ ] Phase 4: hostile eye done, ALL GATES PASSED, pushed. Evidence:
- Three things I would fix next (honest, from the images):
