# MASTER CHECKLIST — Sky Wolf Studios

**This file is the single source of truth for outstanding work.** It merges the Jul 20
dump, Jessie's Jul 19 queue, the Jul 20 handoff, and everything raised since. When
Stephen brings a new list, MERGE IT INTO THIS FILE rather than starting a fifth one.

Marks: `[ ]` not started · `[~]` in progress · `[x]` done + deployed · `[?]` blocked on Stephen
Last updated: 2026-07-26

---

## 🚨 FROM STEPHEN 2026-07-26 (chat) — merged before work started, per the system

- [~] **CRITICAL: Jimothy unopenable while LOGGED IN.** His words: "if i log in i cant
  open jimthy. i have to clear my browsing data and i can log in again and then if i
  close it and try to play again while logged in, i cant... its punishing players who
  are logged in and actively playing."
  INVESTIGATED 2026-07-26, commit 51eb37ff:
  · NOT the July-25 splash freeze: the fixed worker (4s timeout) is confirmed served
    at every ?v= URL, cf-cache-status BYPASS. Found + fixed en route: SWV had drifted
    to 57 vs CACHE 67 (registration URL frozen ten bumps); now lockstep at 68.
  · DID NOT REPRODUCE: live-site repro with a throwaway account ran his exact
    close-and-reopen-signed-in sequence — all three boots opened, signed-in state
    intact. Harness kept at `satellites/stream-hop/scripts/login_repro.js`. Throwaway
    deleted after.
  · SHIPPED INSTEAD OF A GUESS: boot breadcrumbs. Every boot logs its stages; a boot
    that never reaches its first frame is auto-reported (with the exact dying stage,
    SW + installed-PWA flags) through swFeedback to Discord on the next good boot.
    Verified headless end-to-end with the POST intercepted. Next occurrence on his
    phone names the layer. WAITING ON: one occurrence, or Stephen's answers — what
    does the failure look like (white page / frozen splash / arcade black screen),
    and is he opening the installed app, a tab, or through the portal, and where did
    he log in (Jimothy's chip vs the portal/LW)?
- [x] **Petal Match green-background regeneration doc → Drive 012Assets.** DONE +
  verified 2026-07-26 (create call returned the doc in 012Assets, owner Stephen):
  "PETAL MATCH — Pink + Purple Remakes on GREEN (cutting sheets)", doc id
  1XlXg6N0yLLk0HIl4Xr5X5QlU9VAVI6Gf7aaOUE4qc60, in 012Assets root. Item list is
  MEASURED, not guessed — every cut sprite was scanned for pink/purple fraction and
  key-danger (share of paint a colour key would eat); 60+ items grouped into 5
  proposed green sheets, background spec included (flat 00FF00, no shadows onto the
  background, green/teal art stays on magenta). Sheet 4's lost board shadow flagged
  mandatory.
- [x] **More large lists of notes are coming.** Landed 2026-07-26 (Stephen's notes +
  Jessie's 7/21 doc) and merged below as THE JUL 21+26 LIST, verified against code
  before writing — three Jimothy items were already done, two renames already live.

---

## 🚨 FROM STEPHEN + JESSIE 2026-07-28 (chat) — merged before work started

- [ ] **Super Slice 3D — the wall climb must be ENDLESS.** Stephen: "the wall
  climb needs to just keep going and going so you can see how high you can get on
  the wall 30. the whole challenge of the game is to see how high you can make
  it." So the climb should not end at a fixed wall/level — it keeps going and the
  score IS the height reached.
- [ ] **Super Slice 3D — FREE FALL may need to be its own game.** Stephen: "The
  free fall game may need to be its own game too call super slice 3D free fall
  and there should be an endless mode in that too to see how far the can fall
  without sticking to the side." Two parts: split it out as its own titled game,
  and give it an endless mode scored on distance fallen without sticking.
- [ ] **Pop N Lock — you cannot see which piece you are holding.** Stephen: "its
  hard to see what piece your even working with because the second blob seems to
  render so slow it would really help gameplay." The second blob of the pair
  renders late, so the piece reads wrong while you are trying to place it.
- [ ] **Pop N Lock — reclaim the empty screen for the UI.** Stephen: "there seems
  to be some open screen too that we can clean up and use to improve the overall
  UI."
- [ ] **Pop N Lock — pieces must move FASTER.** Stephen: "i really just need to be
  able to move my pieces faster so i can play on higher difficulties without
  having to slowly wait or fumble with the onscreen controls." Higher difficulty
  is unplayable at the current input speed.
- [ ] **Hues — the bottom bar is unswipeable on iPhone (Jessie 7/28).** "On an
  Apple phone, when you go to swipe the bar at the bottom, it's too close to the
  edge of the phone, so it's trying to swipe the entire window, rather than the
  color bar." iOS reserves the bottom edge for its own system gesture, so the
  control has to sit above that band.
- [ ] **Hues — no rules before play (Jessie 7/28).** "Does not have the objective,
  rules, how to play screen before the game starts." Needs a tutorial, and Stephen
  ruled it comes AFTER the edge-swipe fix.

---

## 📒 THE JUL 21+26 LIST — Stephen 2026-07-26 notes + Jessie 2026-07-21

Merged 2026-07-26 before any work started. Duplicates against older sections were
FOLDED (the older entry got extended rather than doubled). Verified-already-done
items are marked here so nobody re-does them.

### 🌸 Petal Match — ACTIVE PRIORITY (a player is on it daily; "our version of Candy Crush")
- [x] **Green-background sheets CUT + WIRED, verified (commit 6181e431).** 5 sheets ->
  77 masters via `scripts/cut_petalmatch_green.py` (projection banding + true
  chroma-key UNMIXING after the first pass left green fringes on every glow), 36
  runtime sprites replaced in place, the LOST board shadow remade + wired under the
  frame, runtime art URLs stamped `?v=PM_AV` (7-day image edge pin), 0 404s,
  screenshots at levels 1 + 3, dew count cross-checked vs the engine.
- [x] **Cover art mismatch FIXED, verified by looking (commit fd65891b).** Portal card
  (87KB jpg, was a 385KB png over the 150KB law), OG 1200x630 with the title composed
  into the painting's own dark panel, icons 192/512 on the crystal lotus, portal thumb
  cache stamp bumped to 2026072601.
- [x] **Algorithmic hooks SHIPPED, verified (commit e6c11ca7).** The honest three:
  daily streak (first clear each day pays a climbing Petal bonus, 5..20 cap, DAY N
  chip on the wallet row), near-miss framing (out-of-moves says HOW close via the
  same progressPct() the bar draws — the screen cannot contradict itself; +5 Moves
  glows gold at 80%+), comeback grant (3 straight losses on one level = every retry
  opens with a FREE Bloom Burst until cleared, shares placeHeadStart() with the
  paid boost). Hooks probe 5/5 through the real input path; powerup probe 19/19.
  Ladder untouched — nothing manufactures difficulty.
- [x] **Timed mode pays Petals, capped like the daily — verified (commit 44ac6865).**
  1 per 5000 score, hard cap 20/day (the streak's ceiling), end panel names the
  cap when it binds. Probe 16/16: a 15000 run paid exactly 3; a planted 19/20 day
  let exactly the remainder through.
- [ ] **"Fully developed"** — standing direction; still open from the build-out
  list: endless + daily modes, new specials (serpentine first), competitive layer.

### 🎬 Stop Motion (`satellites/stop-motion`)
- [x] **Eyes + mouths ASSET DOC delivered + verified in 012Assets** (doc id
  1g2AcAoxQDQ81INWH2YRoTlbWOeP10AEdGlLMnowwoyU): 6 sheets, 45 sticker states —
  googly, cartoon, button-and-stitch, claymation families (7 eye states + 6
  mouths each), an expression add-on pack, and a 6-shape lip-sync ladder. Built
  around how the app actually works: stickers hold STATE between frames and the
  player steps them, so stop motion itself does the animating.
- [ ] **Sticker-layer feature in the Stop Motion app** — the code side that
  consumes those sheets: drag/size/rotate stickers over the live view, state
  stepping between shots, composited into the captured frame. Build when art lands.
- [x] **Camera permission flow DONE, verified (commit d6fc6d84, 15/15 across three
  permission states).** Pre-prompt explains before asking; denial gets per-platform
  steps + Try again + the import fallback; a permissions watcher auto-resumes the
  camera the instant the toggle flips (closest possible to "back to the game" —
  a web page cannot open the settings app, told honestly in the card copy).

### 🖥 Studio-wide / portal
- [x] **Feedback button dismissable DONE, verified (rode into e6c11ca7; cache rule
  d36adfaa).** Investigated first: the only FAB floating OVER gameplay is the
  portal's (shells use a sticky-header button; the LW app retired its floater in
  April). 48px corner × hides it for the rest of the day (localStorage day bucket,
  returns tomorrow — feedback matters). Verified headless: tap removes, persists
  across reload, returns on a stale day key. Also closed the cache gap it exposed:
  feedback.js matched no .htaccess rule (the shell.js trap) — now in the
  revalidation rule + loaded ?v=2.
- [x] **Word Lightning rename** — already live in the portal: bloomzap card reads
  "Word Lightning" with the storm description + thumb (verified portal/index.html:730
  2026-07-26). Slug stays `bloomzap` per the display≠slug law.
- [x] **Word count brag = the real number (Stephen: "do the real number"; commit
  0c94ebf6).** Footer renders DICT.size live (13,511 today), verified headless —
  it can never drift from the dictionary again.
- [x] **OriVex rename** — already live: petalvex card reads "OriVex" (verified
  portal/index.html:732). Slug stays `petalvex`.
- [x] **Mosaic twins untangled DONE (commit fc56aa7e).** Garden's card now leads
  with "Simple solo filler, no drafting" — front-loaded to survive the two-line
  clamp; Draft already leads with the Azul drafting line. Verified side by side
  in one screenshot.

### 🌈 Hues — featured elsewhere, Stephen wants the shop built out
- [ ] **Shop build-out** — "a ton more unlockables, balanced economy, work for them
  but fun." Borders with critters in the corners. Claymation + crayon styles plus
  new directions.
- [x] **Asset sheet list doc DELIVERED + verified in 012Assets** (doc id
  1skxzJqR3G7TDwLVE4OUWw4ML6kyM5nDqYa2Qi03LZaI): 15 sheets, ~86 new borders in 10
  styles incl. claymation + crayon waves, an earned Trophy Grove lane, win bursts,
  textures, shop furniture, coin skins, and an economy sketch marked as his call.
  Grounded in the live shop (118 borders, real price ladder, real earn rates).

### 🟣 Blobworks (extends the older Blobworks entry)
- [x] **Monsters + modular ramps asset doc DELIVERED + verified in 012Assets** (doc id
  1d3trNH9TPh6D68NjRsfe_MqOY5_-BB3DNKmGwTkIGk4): 3 monster sheets on GREEN key
  (purple art) sized to the real bumper slots incl. the 1.3x height cap that
  skinnied the old one, and a 5-sheet modular ramp kit — one material per route so
  the ball reads at a glance, one angle per piece with the engine rotating (the
  cheap trade), orphan tube_straight/curve ruled superseded. Art itself still [?].
- [x] **Slime tube top-left: much smaller — SHIPPED (commit a23bd880), verified
  2026-07-28.** Meter height 150→104 at `satellites/greenhouse-pinball/index.html:1108`
  (Blobworks = the greenhouse-pinball dir; portal/index.html:755 maps the name). It now
  reads as a gauge inside the left rail, clear of the painted eyeball jars — ~40×104 on a
  540×960 stage, down 72% in area from the original 196. BUILD v1.6.1, sw cache v6 so it
  is not stuck behind the worker. ⚠️ The commit's "Stephen confirmed 'much smaller'" quotes
  his REQUEST, not sign-off on 104 — **pending his eyes**; tune `_mh` at :1108 if still off.
- [ ] **Blip's intro animation still skippy** — he provided a movement sheet; redo
  carefully or pull the old assets and do it right. Take time on it.

### 🗡 Super Slice 3D — NEW DESIGN DIRECTION (supersedes "it's done" state, not the
    dead-features law: chimney/mist/kick/hold-to-spin stay DEAD)
- [x] **Left-to-right 3D layout — verified ALREADY BUILT** (the v3 director pivot:
  "the ORIGINAL slice-master ruleset... played LEFT TO RIGHT through a 3D forest",
  index.html:322; wood blocks, splitting fruit, tap/hold rules all present). The
  Jul-26 note predates his seeing v5.x.
- [ ] **Randomly generated levels / more art** — after Stephen confirms the core is
  fun ("we'll get into the assets once the game is playable and fun").
- [x] **Wall-climb footing — the brake EXISTED, discoverability shipped (commit
  1a873a02).** Hold already brakes the spin and turns the blade to the wall
  (wired, traced end to end) — but the how-to taught the OPPOSITE ("hold to keep
  flipping") and nothing in the climb ever said otherwise. Now: a dedicated
  how-to row + a toast at every climb start. Physics untouched. SUPERSEDED SAME
  DAY by his playtest verdict, next entry.
- [x] **Climb REBUILT to Stephen's own design (commit 659a4f13, verified: parse +
  static wires + the boot probe caught and fixed its one real bug).** Hold-brake
  KILLED ("small partial rotation and stops"); climb back to normal tap rules;
  stick needs a committed ~27 degree blade angle (was 3); freefall handle clamps
  outside the wall; x10 jackpot varies within the top three bands; portal card is
  "Super Slice Wall Climb" beside Super Slice 3D, climb button removed from the
  in-game menu; BE THE BLADE shipped as a persisted toggle (circle your finger to
  spin; handle strikes convert spin to height). ⚠️ Feel constants tuned blind —
  no GPU here; 3D games get boot checks, Stephen's phone verifies feel.
- [ ] **Sound: keep + embellish** — he loves the current SFX direction.
- [ ] **Randomly generated levels** (walls, caps, forest feel like the original) —
  after the core is fun. Art/backgrounds AFTER playable ("we'll get into the assets
  once the game is playable and fun"). Bump BUILD stamp when shipping.

### 🍃 OriVex (extends the older OriVex entry)
- [x] **Board bigger on screen DONE, verified (2026-07-27 sweep).** Board 460->512
  stage px, sits 22px higher; tray re-columned so tray tiles GREW 64->76; all 4 bed
  sizes screenshot-verified at 375x667 + 540x960, no clipping. sw orivex-v4 +
  registration ?v=4 lockstep, portal card ?v=ov4.
- [x] **Thumbnail shows the full board DONE, verified.** Root cause was the crop:
  old thumb was 270x480 portrait, portal card is 1:1 object-fit:cover, so it was
  center-cropped square. New 480x480 thumb rendered from a REAL solved 3x3 board,
  38.5KB, portal thumb URL cache-busted ?r=20260727.
- [x] **Asset list doc DELIVERED + verified in 012Assets** (doc id
  16-0XVWbCFxfFHSBrxmU-jcT_0cB2vJhyyvP6MyDO6CA): supersedes the stale repo pack,
  which contradicted the engine (ink/stock swap on digits 0 and 9, dead asset
  proposals with no code hook). 3 triangle sheets tuned to the live VINK inks
  (pink/purple stocks on GREEN key), 16 backgrounds with pairing logic, thumbnail
  spec = composite from a real solved board. Numbers are printed by the engine;
  faces generated blank — verified in code.

### ⚡ Word Lightning (bloomzap) — in-game retheme still open (rename is done)
- [x] **Asset list doc DELIVERED + verified in 012Assets** (doc id
  1c7siUYwxEn4fW6AdShIr5NO5y-AIMP-Rfq-glf58AJ8): 10 sheets in the full mid-century
  spec, grounded in the real code (5 modes, 3 beds), incl. proposed storm renames
  (Choose your storm: Drizzle/Downpour/Tempest) and a complete wording-sweep list
  for the wiring pass.
- [x] **In-game storm retheme + next-round button DONE, verified (commit 900d6432,
  30/30 headless assertions + screenshots reviewed).** Full wording map (Choose
  your storm: Drizzle/Downpour/Tempest, Vs Rival, strikes, storm glossary), navy +
  storm-gray + lightning-yellow surfaces, all plant glyphs replaced incl. favicon,
  yellow "Next round" re-enters with the same mode + storm. Best-time keys kept.
  ⚠️ Stephen: settings copy says 9,600 words, the stamp measures 13,511 — pick the
  brag. Art sheets from the spec doc still slot in later.

### 🦎 Abduct-a-Chameleon (2D external repo + lost 3D)
- [x] **3D "turn it sideways and nothing happens" — SHIPPED AND PLAYABLE
  2026-07-28 PM (commit `ba570fac`), live at
  `lucidwinds.com/satellites/chameleon-3d/`.** It was fixed in the morning and
  still not reachable, because the fix could only be pushed to a repo this
  codespace has no write token for. Delivery route changed instead of waiting:
  the patched build is VENDORED at `satellites/chameleon-3d/` (index.html +
  assets/*.glb + maps/*.json, 4.7MB; three.js and Playroom stay on CDNs) and the
  portal 3D card now points there instead of github.io.
  Verified ON THE LIVE SITE, emulated Pixel 9, through the real portal jukebox
  iframe and the real Playroom lobby: prompt appears in portrait → ONE tap gets
  into the game on a phone that never rotates → same tap clears `tapStart` →
  `stickR` under the thumb; rotating back to portrait does not re-trap; a phone
  that CAN rotate still clears it normally; every asset 200.
  ⚠️ **FORK DEBT:** upstream 3D commits do NOT reach this copy. Un-fork steps in
  `satellites/chameleon-3d/VENDORED.md` — push `handoff-chameleon/0001-*.patch`
  upstream when a credential exists, repoint the card, delete the folder.
- [ ] **3D props render untextured — 3 × 404 on
  `assets/props/Textures/colormap.png` every load.** FOUND 2026-07-28 while
  verifying the orientation fix. The Kenney prop `.glb` files all reference that
  palette atlas and it is missing from the upstream repo too, so crates, barrels,
  statues and grass render flat on the live github.io build as well. Fix = source
  the real Kenney colormap PNG and drop it at that path (do NOT invent a palette,
  it would recolour every prop wrong).
  *Root-cause detail, kept for the un-fork:* Two
  separate walls in `abduct-3d.html`, both only reachable AFTER Launch (setupTouch
  runs after `await insertCoin()`, so neither can show during the Playroom lobby —
  which is why the lobby looks fine): (1) `#rotate` is opaque, inset:0, z-70, with
  NO dismiss path, clearing only on a `resize` reporting landscape — so any phone
  that cannot produce a landscape viewport (OS rotation lock, installed PWA pinned
  to portrait, portrait iframe container) sealed the player behind a black screen
  forever; it also covered `#tapStart` (z-65), the ONE control that would have
  rotated the screen for them. (2) `init()` re-showed `#clickToPlay` four lines
  after `setupTouch()` hid it, so every phone that got past the gate was handed a
  desktop "Click to capture mouse" prompt over the game. Fix adds
  orientationchange + matchMedia + pageshow listeners, +250/+700ms re-checks
  (mobile reports stale dims mid-rotation), a tappable "Already sideways? Tap to
  play" escape that tries fullscreen+orientation-lock first, sticky dismissal, and
  gates clickToPlay on `!touch.on`. Verified headless through the REAL Playroom
  lobby on an emulated Pixel 9, 6/6, 0 JS errors — thumb-target after escaping
  went from the desktop prompt to `stickR`, the real touch control.
  ⛔ The codespace `ghu_` token is lucid-winds-scoped, so the UPSTREAM repo still
  has the bug; that is what the fork above routes around. Patch + verifier +
  apply instructions live in `handoff-chameleon/`.
- [ ] **2D: capture still not really possible** — refine being caught, add more
  abilities, MANY more UFOs searching. May stay single-player (his words), BUT:
- [~] **Jessie: online 1v1 broken — DIAGNOSED end to end (2026-07-27), blocked on
  a Render deploy.** The relay server was NEVER DEPLOYED: game falls back to
  wss://stephenuffugus.github.io/ws and GitHub Pages rejects WebSocket upgrades
  (probed: HTTP 404, no 101). The repo already ships server/relay.mjs + render.yaml
  (a one-click Render.com blueprint), but abduct-relay.onrender.com answers 404
  x-render-routing: no-server (probed). ⛔ STEPHEN ACTION: Render.com -> New ->
  Blueprint -> pick abduct_a_chameleon -> deploy, then tell us the service URL.
  The one-line portal ?mp= edit is pre-written in the 2026-07-27 sweep report
  (do NOT apply before the relay is live). Free-tier caveat: service sleeps when
  idle, first versus after a quiet period may need one ~30s retry.
- [ ] **River line map (Jessie)**: if you're the colour of the water you should be
  able to pass under the bridge unseen — camouflage rule gap on that map.
- [x] **3D version LOCATED, verified (2026-07-27 live probes).** The live 3D build
  is the repo ROOT abduct-3d.html (HTTP 200, 111,207 bytes, title "ABDUCTEE —
  Multiplayer") — exactly what the portal 3D card already points at. The
  releases/v3.0.0 copy also still exists (97,972 bytes) but is an older frozen
  snapshot. 3D multiplayer uses Playroom's servers (playroomkit/insertCoin in
  source, zero raw WebSocket code), so it does NOT need the 2D relay and should
  work today. Next step when Stephen wants it: play it, then decide direction
  (Kenney packs etc.).

### 🦝 Jimothy (Jessie 7/21 — game is being promoted, checked against live code)
- [x] **"Don't call him deformed"** — verified 0 hits for "deformed" across the
  game, portal and alias pages (grep 2026-07-26). Portal desc is one sentence.
- [x] **Rules/objective/buttons page before play** — already built: `startGated`
  shows the How screen once before the first mode (verified in code, 6 call sites).
- [x] **Desc placement DONE (commit in SWV70 push, verified in file).** Card keeps
  the one-sentence short desc; the How screen (gates every first play) now opens
  with the long description before the mechanics rows.
- [x] **Bottle caps all reachable, verified (commit 888dbc63).** Measured 337
  generated caps: 14.2% had the hop-up approach bushed, 0.89% fully walled in
  (the uncollectable case). Column walk now also requires the approach cell
  clear — zero new rng draws so Daily generation stays reproducible. After:
  0.00% on both, coin rate unchanged. BUILD v7.4, SWV+CACHE 69.
- [x] **Edge-of-screen cheat — verified ALREADY FIXED in code** (startHop: a hop
  into the wall is refused outright, so a stationary "hop" no longer grants
  mid-air safety; the comment cites Jessie's report). Down-hop at row 0 is the
  same refusal. Needs her device to confirm the feel.

### 🎨 Other per-game (Jessie 7/21)
- [x] **Kakuro rules gate — verified ALREADY FIXED** (the 7/18 directions sweep,
  commit 8712fee0 on main; fresh-profile headless proof: card auto-shows before
  first play, dismiss writes the flag, second visit skips). Jessie's 7/21 note
  predates/straddles the sweep's deploy. Screenshots on file. ⚠️ Minor: the card
  promises "Notes help track possibilities" — unaudited whether a notes mode exists.
- [x] **Inkbound both DONE, verified (commits fc56aa7e + 8cc7393b).** Card copy one
  sentence. Starter skin: MEASURED every skin's in-play canvas luminance — the old
  default was the darkest of all 8 (32.1); new free starter is Astral Bindery
  (43.2, lightest non-premium). The two absolute lightest are PAID Supporter skins
  — making one free is Stephen's revenue call, flagged. Existing players keep
  their skin (12/12 profile assertions). BUILD v1.3.
- [x] **Stephen ruled "premium skin is fine" + better controls (commit 3593c86d,
  verified by touch-event probe 4/4 + screenshot).** Tide Pool (measured lightest,
  48.8) is the free starter; earn ladder re-formed 5/10/20 grounds. GLIDE
  STEERING added: one drag walks the mouse tile by tile (3 tiles in one gesture
  in the probe), flick still steps one, dpad snappier. BUILD v1.4.
- [x] **Hedgerow gate + next + share DONE, verified (commit 6a410965, 21/21).**
  Rules-before-play gate (first visit only), 56px "Next ground" wired to the real
  advance path, Share on level complete (also fixed shareHedgerow bragging
  "0 grounds" mid-run). Buttons use the game's "grounds" voice.
- [ ] **Hedgerow 100-level ladder** — still open, design+build. Baseline
  established: real successive grounds already exist (each adds a pest + speed to
  a cap); the ladder extends that with scenery changes, not from scratch.
- [x] **Hunch early-submit HARDENED, verified (Hunch repo, pushed to main, sw v5).**
  Honest finding: the listener/guard/hit-target were all correct and the deployed
  site matched HEAD — the tap was being eaten at the device layer. Closed both
  mechanisms: touch-action:manipulation (double-tap-zoom hold) + a pointerup
  listener beside the onclick (survives a never-synthesized click; roundActive
  guard makes double-fire a no-op). Verified incl. a dead-click simulation.
  Submit row raised to 48px. ⚠️ Needs Jessie's device to confirm the real-world fix.
- [x] **Hunch prompt bank DONE, verified (Hunch repo commit c43e256, pushed).**
  342 original prompts in classic Pictionary category spirit: EASY 178 (kid-cold:
  dog, rainbow, snowman) + STANDARD 164 (lighthouse, telescope, volcano),
  70/30-weighted into tier 1, the jellyfish-juggling combo grammar pulled off
  tier 1, Daily pool grown to 522. Guesser-sync finding: nothing to sync — the
  vision guesser is open-ended and concrete objects RAISE its win rate. Verified:
  20/20 fresh rounds from the new bank, 1000-draw split 695/305, zero dupes.
  prompts.js now ?v=2 (was an unversioned shared file), sw v6.
- [?] **Hunch kids-mode pin (Stephen)**: hit-based escalation still promotes into
  abstract tier 2 after 4 hits; a true KIDS mode would pin tier 1 (one constant,
  documented in code). Also open: the round timer starts on round LOAD, not
  first stroke.
- [x] **Flipbook all three DONE, verified (commit cbd4cb3f).** Closed eyes redrawn
  (the old set was droopy-open with bags); three-tab accordion (Draw/Pages/More),
  IDs unchanged; the red margin line removed — stroke through its old position
  asserted inking. ⭐ Found WHY its controls measured 35px: they were 48 CSS px on
  a transform-scaled stage — CSS pixels lie by the stage scale. Raised to 70 CSS
  = 48.6+ rendered at iPhone SE. ⛔ The whole 48px sweep must measure RENDERED px
  (memory: touch-targets-measure-rendered-px). BUILD v2.2, sw v6.
- [x] **Yacht-Sea asset list doc DELIVERED + verified in 012Assets** (doc id
  1KbneGqftkctM9at2gpGQ2DIhMO5yLoZkCJ1QQFm5k2Q): 7 sheets — own brass-porthole dice
  (the game currently borrows the LOCKED shared dice with a blue filter; doc routes
  around the lock), 13 log emblems matching the real scoring rows, log-book UI,
  4 backgrounds, celebration set, thumbnail. Art itself still [?] on Stephen.
- [x] **No Pain No Gain Clear + Undo DONE, verified (pushed with the NPNG commit).**
  Clear only nulled the ragdoll and never touched the placed-traps array — in
  build mode it did nothing visible. Now empties the board; Undo added (haz.pop,
  48px, no em-dash); verified headless through the real UI incl. undo-past-empty.
- [x] **No Pain No Gain: run END + "cozy" — BOTH DONE, verified 2026-07-28.**
  END shipped in 1ab3d865: `endRun()` at `satellites/no-pain-no-gain/index.html:249`
  and `drawRunOver()` at :413 (run-over card with coins this drop, best combo, NEW
  BIGGEST DROP, DROP AGAIN / BUILD), physics frozen while it shows, 350ms
  accidental-tap grace at :356, two triggers at :543 — Clayton settling (rest ≥1.6s)
  or 15s with no damage. "cozy" removed in ceed659c: grep count is 0 in the satellite,
  and the portal card :749 + in-game ribbon :86 are both clean. Only two files in the
  repo mention Clayton and both are current; all script blocks `node --check` clean.
  ✅ **Edge case found by the audit, then FIXED the same session (BUILD v1.2).** There
  was no max run length: a perpetual-damage build (fan pinning Clayton on a saw) kept
  refreshing `lastDmgT` so 'idle' never fired, while he never stopped moving so `rest`
  stayed 0 — the run never ended and paid out forever. Added `MAXRUN=90s` as a third
  trigger ('CLAYTON TAPPED OUT'). All three exits now live in one `checkRunEnd()` so the
  logic is testable rather than duplicated, exposed via `NP_DEV.runFor()` behind
  `?nptest=1`. Verified headless 6/6, 0 JS errors: alive at 89s, ends at 91s with
  reason 'timeout', an honest 60s damage run is NOT cut short, settling still ends as
  'rest'. 90s sits well past any real run (they settle in ~5-20s) so it only ever
  catches the exploit.
- [x] **Sprout Dice clarity DONE, verified (2026-07-27 sweep).** Jessie was right
  and it was a BUG: the End Turn button rendered as a ~15px sliver OFF-SCREEN at
  every phone width (flex CSS bug) — players spent dice and hit a dead end. Fixed,
  plus one-time coach card naming the verb, labeled Resolve bar, "Floor 1 of 12",
  legible die labels, em-dash sweep; root sprout-dice.html regenerated in sync.
  Verdict: core loop does NOT need a rethink. Watch two soft spots if she still
  stumbles: Wild die silently picks Thorn/Bark by target; Root's effect has no
  visible feedback moment.
- [x] **Hexa Hive dealing animation DONE, verified (2026-07-27 sweep).** Chips fly
  source->anchor one at a time (55ms stagger, eased arc, capped ~1.1s) with an
  ascending WebAudio blip per landing; board commits only after the flight,
  input locked mid-flight; merge outcomes byte-identical (mid-flight screenshots
  + lock/clear probes). PORT NOTE RETRACTED, verified 2026-07-27: an agent
  claimed Hedgerow + Grubtrap were engine copies that still teleport — FALSE.
  Hedgerow is the JezzBall remake, Grubtrap is Inkbound (Rodent's Revenge);
  the hex stack-merge engine exists ONLY in Hexa Hive (exhaustive grep for its
  distinctive function names). Nothing anywhere teleports; no port exists to do.
- [x] **Pop N Lock share button DONE, verified (commit dc270259).** Campaign +
  versus wins share a rival-naming brag (navigator.share + Copied! fallback),
  hidden on defeats/interim rounds/solo score. BUILD v1.6, sw v9.
- [ ] **Pop N Lock thumbnail** — should show actual gameplay better. Art call:
  screenshot-based card vs a painted piece; needs Stephen's pick.
- [x] **Plot Bloom desc → one sentence DONE (commit fc56aa7e, rendered + verified).**
- [ ] **Plot Bloom rework** — "needs reworking to make more sense" still open;
  needs design intent (what confused Jessie: neighbours wording + depth, per the
  older note).
- [x] **Mini Crossword typing FIXED, verified (commit 0f535a33).** advance() parked
  the cursor at a word's last cell forever; now flows forward to the next
  same-direction word with an open square. Real-keydown probe: trail 2-3-4-6-7-8,
  one fill per keystroke, backspace steps back one, built-in solve checks pass.
  BUILD stamp 1.1 so a stale phone copy is provable. Older "layout" note stays
  open pending Jessie's specifics.

### 💡 New game ideas (Stephen + Jessie — need names/design before building)
- [ ] **Fox picnic hang-man** — hangman alternative where a fox creeps toward the
  picnic with each wrong letter (Etsy listing 1089120913 is the reference concept;
  OUR OWN style and mechanics, no copying).
- [ ] **Sculpting game** — clay on a wheel, additive/subtractive sculpting.

---

## 🔴 BLOCKED ON STEPHEN — nothing moves until he acts

These are not "waiting for a decision I could make." Each needs his art, his intent, or
his go-ahead on a redesign.

### 🎨 ART STEPHEN ASKED FOR A LIST OF — exactly what to make, and where it goes

Ordered by how much it unblocks. Everything here is blocked ONLY on the art existing.

| # | What to make | Drop it here | Unblocks |
|---|---|---|---|
| 1 | **Pop N Lock pieces** — 5 pods + 1 chaff, from sheet 10 in the "Pop N Lock — Art Pack" Drive folder | `satellites/chaff-wars/assets/pods/pod-0.png` … `pod-4.png` + `chaff.png` | Flip `CW_POD_ART=true` and the game uses your art instead of drawn shapes |
| 2 | ~~**Petal Match art**~~ ✅ **DONE 2026-07-26** — 185 sprites + 5 paintings cut from 23 sheets and the board is wired and live | `assets/games/petalmatch/` | Only redo: sheet 4's board shadow is magenta-on-magenta, no data to recover |
| 3 | **Blobworks monsters** — the purple middle monsters, sheet 12 | Blobworks art folder | Jessie's "redo the purple monsters" |
| 4 | **Blobworks modular ramps** — sheet 13 | same | Ramps are drawn procedurally right now as a stand-in |
| 5 | **OriVex** — origami clean-paper triangle sheets + WIDE peaceful backgrounds with contrast against the number colours | `art-asset-lists/orivex/` pack has the spec | O2 + O3, two open items |
| 6 | **Card art, 3 satellites** — `mahjong`, `rootbound`, `sprout-dice` | `portal-assets/thumbs/<slug>.jpg`, 480×480 square | They currently post to social with the studio logo instead of game art |
| 7 | **Card art, 4 games** — `breathing`, `doubleshutter`, `stonegarden`, `stopten` | same | Same, plus they get real homescreen icons |
| 8 | **Sky Wolf head, square re-render** *(optional)* | `portal-assets/` | Current icon is cut from the wide banner, so the ears are clipped — they're clipped in the source too |

Any PNG dropped in the right place gets wired by me next session. Nothing here needs a
matching code change from you.

### Art he needs to generate or drop in
- [?] **Pop N Lock piece art** — generate pods/chaff from sheet-10 Doc, drop PNGs into
  `satellites/chaff-wars/assets/pods/pod-0..4.png` + `chaff.png`, then flip `CW_POD_ART=true`.
  Also needs a device test of the control/difficulty/animation changes.
- [x] **Petal Match art DONE** — 23 sheets cut to 185 sprites + 5 full-bleed paintings, board
  wired and live at `/play/petalmatch.html`. Verified: 16/16 board sprites load, 0 404s, 0 page
  errors, all 6 special/blocker cases resolve, balance unaffected, smoke 66 pass 0 fail.
  Procedural renderer kept as a fallback. ⛔ TYPES stays at 6; flowers 7 and 8 are for
  expansions. One redo logged (board shadow, magenta on magenta).
- [x] **Petal Match art ON SCREEN properly (2026-07-26)** — the first pass wired the files but
  was never LOOKED at. Stephen: "the flowers should fill the boxes, and wheres the background."
  Both were real: pieces were drawn into 0.4 of a cell (a radius/box units bug) and the four
  painted conservatories were cut but never referenced. Now fixed + widened.
  Verified by screenshot at 412x915 via the new `scripts/petalmatch_shot.js`:
  35/35 sprites load, 0 404s, 0 page errors; pieces fill the cell (PM_FILL 0.96); all four
  chapter backdrops confirmed (Meadow/Summer/Autumn/Winter, shot at levels 1/12/26/40);
  painted board tiles, objective emblems, ui-pill buttons on one row, combo pop art and
  fx-burst all confirmed warmed and rendering. Gameplay unaffected — balance bot levels 1-6
  plays every objective kind, "reasonably smooth level to level".
  Runtime art 183KB after quantizing (was 1036KB); pops/fx/emblems load in a deferred second
  wave so they never compete with the board.
- [x] **Petal Match art — EVERYTHING WIREABLE IS WIRED (2026-07-26)** — Stephen: "get it all
  done." Added on top of the pass above: painted selection corners (`ring-corners`), hint ring
  (`ring-plain`), a charged-piece ring on every special (`ring-ornate`), petal-shard particles on
  every clear (hard capped at 26 so a spore+spore cascade cannot turn into a slideshow),
  `ice-shatter` when a dew tile breaks, `cover-crack` for a half-broken double-dew tile, the four
  `combo-*` detonations drawn ON THE BOARD at the square they went off, a LEVEL + 3-star plaque
  with `laurel-burst` on level complete, a chapter title plate when the chapter turns, and the
  five painted `tut-*` cards inside the how-to-play card.
  Verified by `scripts/petalmatch_fx_probe.js` (new — drives the real game through `_PM_TEST`
  and shoots the moments a static screenshot cannot catch): 52/52 sprites, 0 404s, 0 page
  errors, 5/5 tutorial images in the rules card, level-up captured with the call-out layer
  asserted to hold the plaque ALONE. Balance bot levels 1-8 plays every objective kind,
  "reasonably smooth level to level".
  Runtime art now 2.7MB on disk, all quantized, split into a board-critical wave and a deferred
  second wave 1.5s later.
  ⛔ FOUND + FIXED EN ROUTE — the shell's generic `✿ NICE! ✿` win flourish printed straight
  through the new plaque. Shell now honours `LW_PLAY.ownWin` so a game with its own win screen
  opts out; the other 65 games are untouched.
  ⛔ ALSO FOUND — `play/shell.js` (66 pages) and `sunbeam-sdk.js` matched no `.htaccess` rule and
  sat on the host's 7-day edge default; `shell.js?v=18` was measured as a live cf-cache HIT with
  `max-age=604800`. Same class as the Jimothy worker bug. Both now `no-cache, must-revalidate`,
  and shell bumped to `?v=19` across all 66 play pages.
  ⛔ NOT DONE, and deliberately NOT invented — these need game systems and economy calls that
  are Stephen's, not art wiring: the 16 tool/booster sprites (needs a booster economy), the level
  map (`map-node-*`, needs a map screen), shop art (`coin`/`gem`/`price-bar`, needs a shop),
  medals + `rank-row` (needs a leaderboard), and `spec-strip`/`quake`/`serpent`/`big`/`box`
  (match-6, match-7 and travelling-piece mechanics the game does not have). The alternate
  green/purple/teal skins need a skin picker.
- [x] **Petal Match LAYOUT — clean and tight (2026-07-26)** — Stephen: "make this damn game look
  good... everything should fit clean and tight." Read the six spec docs in Drive → 012Assets →
  PETAL MATCH first; doc 04 §B specifies ONE HUD strip with the objective, a score bar carrying
  the star thresholds, and a moves frame. I had built two chunky stacked panels with 14-16px
  borders and stacked two-line labels eating a third of the screen. Now:
  one `hud-bar` objective strip on a single row (emblem · chapter · goal), three `pill-thin`
  chips for SCORE/LV/MOVES, and a progress bar with the three star pips lighting as it fills.
  ⛔ NEW TOOL `scripts/measure_9slice.py` — border-image slices are now MEASURED, not guessed.
  It caught three real errors: the board frame was set to 24% when the art's rim is 8.4%
  (3× too big, crushing the corner ornament); `bar-slider` and `slot-rect` are ASYMMETRIC and
  not 9-sliceable at all; and it handles hollow frames (transparent interior) like `board-frame`.
  Board frame now hugs: measured at 320/360/412/430px the frame is EXACTLY board+36 in both
  axes, chips one row, buttons one row, zero horizontal overflow at every width.
  Also swapped the two flat-rectangle effects for painted art: `fx-beam-h`/`fx-beam-v` for the
  line-clear sweep (was a flat gold fillRect — the most-seen effect in the game) and `fx-plume`
  for the area burst (was a flat yellow square). Plus vignette corner ornaments.
  ⛔ `confetti-petals` TRIED AND REMOVED — it is a SHEET of ~8 separate petals, not a composed
  burst, so drawing it whole blew each petal up to 200px and swamped the screen. It would need
  cutting into individual petals, and `fx-shard-1..3` already do that job.
  Verified: 55/55 sprites, 0 404s, 0 page errors, plaque asserted alone at level-up, bot still
  wins levels through the real input handler.
- [?] **Blobworks purple monsters** — asset list delivered (sheet 12). Needs the art.
- [?] **OriVex sheets + backdrops** — asset lists delivered (D3). Needs the art.
- [?] **Sky Wolf arcade icon** — current icon is cut from the banner, so the ears are
  clipped at the top because they're clipped in the source. A square re-render would fix it.
  Cosmetic; the icon works today.

### Design intent / direction needed
- [?] **Petal Academy** — "what's the point?" Purpose unclear, can't fix without knowing it.
- [x] **Super Slice 3D S1–S5 — RESOLVED, they were already done.** Checked the code, not the
  notes: `satellites/slice-3d/index.html:211` reads `var BUILD="v5.0"`, two whole versions
  past the v3 pivot. All five asks are present — horizontal lane movement, brown/wood blocks,
  fruit that splits, tap-vs-hold branching, segment-bag random levels, and the sound effects.
  The Jul 20 list was carrying stale entries. Verified 2026-07-25 by grepping the live
  source for each of the five asks. ⛔ Do NOT re-add hold-to-spin, chimney, mist,
  or kick — dead twice.
  **Player-visible tell:** the title screen footer prints "Super Slice 3D v5.0" (`#buildstamp`).
- [x] **Slice 3D BUILD stamp bumped v5.0 -> v5.1 (commit 1a873a02, verified in
  file).** The stamp now covers the post-v5.0 gameplay commits; sw CACHE
  slice3d-v60 in the same push.
- [?] **Rabbit Samurai** — two overlapping asks: retheme to "Hedgehog Hammer Throw", AND
  rework from sideways auto-runner to a 2D platformer through a maze / open land. Big
  redesign, needs his call on scope.
- [?] **Tomato Man** — "build it the rest of the way into a pseudo-platformer" needs
  specifics. More levels? New mechanics? New hazards? Ask before big content work.
- [?] **Garden Path rename** — Jessie's note is cut off mid-sentence ("look back at the real
  Candy Land board and notice how…"). Ask her what the rest was.
- [x] **Game descriptions, 1-sentence sweep — DONE 2026-07-27 (commit f0f0c6d8).** Stephen
  ruled the question himself after Jessie hit the Blobworks wall of text: Jessie's list meant
  ALL of them, no exceptions. Every one of the 97 portal `ds:` fields rewritten to exactly one
  sentence, no dashes, ≤130 chars, applied by exact-match script with automated copy checks
  (scratchpad desc_sweep.js: 97/97 replaced, 0 misses). Headless verified: 0 JS errors, new
  Blobworks line renders, old copy gone.
- [?] **X1 pacing sweep** — the Monopoly anchor already has Relaxed/Normal/Fast. A blanket
  sweep across all games would violate no-blanket-fixes. Needs specific game callouts.
- [x] **Locked-song behavior — STEPHEN RULED 2026-07-26, verified as his direct words: the easter-egg model.**
  "Music unlocks when you unlock it in a game, it gets added to your player.
  They may be all easter eggs and that's cool — most games will end up with
  their own songs eventually." So: locked songs simply are not in the player
  until found; no teaser rows, no snippets. Current wiring already matches.
- [?] **Daily rollover rule** — local midnight vs UTC. We do both by accident today. Wordle
  uses local. Recommendation: local everywhere EXCEPT where a timezone jump would scout a
  shared course early (Jimothy).

---

## 🌸 PETAL MATCH FULL BUILD-OUT (Stephen 2026-07-25, from a real player's notes)

Spec + complete asset list live in Drive → 012Assets → **PETAL MATCH** (6 docs).
Theme deliberately left open for the designer; every asset is described by function.

- [x] **Stale hint bug FIXED** — player reported "the hint is always the last hint from
  the previous game and often incorrect". Exactly right: `_PMN` and `_PMR` rebuilt the
  board but never cleared `hintCells`, so the old board's coordinates were drawn on the
  new one. Verified both paths call `clearHint()`; smoke 66 pass 0 fail; cache v3→v4.
- [x] ⭐ **THORNS WERE UNBREAKABLE BY NORMAL MATCHES — fixed.** The player's actual wall.
  `toClear` was only filled from match groups, and a match group requires `type>=0` while
  a thorn is `type -2`, so a match next to a thorn did nothing; only a special exploding
  on it worked. Verified with the harness: thorn level win rate **0% → 63%**.
- [x] **Balance harness built** — `scripts/petalmatch_balance.js` plays the real game with
  an objective-aware bot and reports measured win rates. Drives `_PM_TEST` → real
  `handleEnd()`, reimplements nothing. Verified working after three separate false-0%
  traps (file:// base href, rAF throttling, and win-detection racing the auto-advance).
- [x] **Dew was two bugs, not tuning** — dew rode the falling gem (jelly lived on the cell
  object and collapse moves objects down), and double-layer tiles silently lost their
  second layer. Fixed with a position-indexed `jellyBoard`. Verified: a double-layer level
  completes properly, 26 dew cleared in 12 moves.
- [x] ⭐ **DIFFICULTY BANDING DONE — ladder is balanced.** Fixed 10-step rotation replaced
  by a seeded order plus one shared difficulty curve driving every objective, with a
  scheduled spike at each chapter's end (the player LIKED the wall, they disliked it being
  random). Score targets made superlinear because points already scale with level.
  **Verified at 40 trials/level:** every kind now lands in a 12-point band —
  thorns 63.7 / gather 58.3 / mix 57.5 / score 53.8 / dew 51.7. Level-to-level swing
  **62.5% → 11.4%**. Was: thorns 0%, score 100%.
  ⛔ Seven calibration passes, two of which OVERSHOT. Re-run `scripts/petalmatch_balance.js`
  after touching any coefficient in `genLevel`; never hand-tune by eye. Confirmed in `genLevel()`: levels
  rotate on a FIXED 10-step pattern, so blocker levels are walls and everything between
  is a stroll, forever, in the same order. Level 25 = 12 blockers × 2 hits = 24 breaks in
  39 moves. Fix: seed the order per chapter, rate every generated level and reject
  out-of-band ones, keep ONE deliberate spike at each chapter's end.
- [x] **Timed mode + mode switching SHIPPED, verified (commit c22be0a7).** 48px
  TIMED toggle on the shelf: 2 minutes, pure score, clean board, best saved; end
  panel with PLAY AGAIN / BACK TO JOURNEY. The switch reads/writes NOTHING of
  Journey progress — probe proves level untouched + full budget on return (12/12
  through the real UI). Timed pays no Petals yet: unbounded-score farm vector,
  Stephen's economy call.
- [ ] **Endless + Daily modes** (Daily makes it directory-eligible)
- [ ] **New specials** — strip (6), quake (7), and the three nobody else ships:
  ⭐ serpentine (travels a winding path), large 2×2 piece, box-of-six. Serpentine first,
  it is the differentiator.
- [ ] **Economy** — coins earned by play, pre-level boosters, in-level tools, cosmetics.
  ⛔ No real money, no ads. Tools must help, never be required.
- [ ] **Competitive layer** — leaderboards, achievements, streaks, share cards.
- [?] **Art** — ~150 sprites + 4 chapter backgrounds + ~30 sounds. Phased; the game is
  shippable after the pieces alone.

---

## 🟢 READY TO BUILD — no blockers, just needs a session

Ordered by value per hour of work.

- [x] **Per-game install identity COMPLETE, verified (commit f844b1f8).** Reality
  was better than the note: 62 of 66 shells already had proper manifests; the last
  4 (breathing, doubleshutter, stonegarden, stopten) got the full petalmatch
  pattern + real-art icons (sourced from portal cards, NOT the wolf-fallback OG
  cards, dodging an identity collision; baked checkerboard corners repainted).
  Their OG social cards upgraded from wolf-fallback to real art in the same pass.
  All 66 manifests parse with unique ids; HTTP spot-checks pass. ⛔ make_og_cards.py
  regenerates ALL 66 — it clobbered the hand-composed Petal Match card once,
  caught + restored; mind it on future runs.
- [ ] **Portal black screen going in/out of games** — pressing back again fixes it. Needs a
  repro session on the iframe jukebox lifecycle; a watchdog already exists.
  ⚠️ NEW LEAD 2026-07-27: the SW fleet fix (all 12 workers were serving day-old
  pages via the HTTP cache, with a 5s cache-fallback race on cold launches) has
  the same fingerprint as this bug. Watch whether it recurs post-fix before
  spending a repro session.
- [~] **Blobworks code debt** — ~~slime meter shrunk 196→150 … one number to tune at
  `index.html:1104`~~ **STALE, corrected 2026-07-28:** it went 196→150→**104** and the
  number now lives at `satellites/greenhouse-pinball/index.html:1108` (see the closed
  entry above). STILL OPEN: Blip's intro animation is skippy. Also noted:
  `art/tube_straight.png` and `art/tube_curve.png` are referenced nowhere in the code
  (ruled superseded — the engine rotates one angle per piece).
- [ ] **FLAGSHIP: Litterbugs** — hashblock #2. UPDATE 2026-07-27: Stephen's
  **Stephenuffugus/Litter_Bug** repo is far along (turn-based battler, 134/0
  smoke, 4 pages) — read its NEXT_SESSION.md + PART_CATALOG.md before anything.
  Brief `design-briefs/flagship-litterbugs.md` converges with it (battles).
  Art answer: parts-based PNG/SVG library (~3MB for 180 parts, space fear
  disproven). PARKED until Stephen says go.
- [ ] **Feedback queue triage — new standing chore.** Every session: query the
  Firestore `feedback` collection (fleet fab wired 2026-07-27, all 82
  satellites + 66 classics + portal + app now report there). Fix what players
  hit, newest games first.
- [ ] **Jimothy super-easy mode — real player request** (feedback queue: "Too
  hard... make a super-easy version for old dummies like me"). ⛔ Stephen calls
  the difficulty design.
- [ ] **FLAGSHIP: The Attic (Retro Attic collab)** — hashblock #3, one-of-one
  fake vintage objects (records/VHS/cards), condition-grade rarity, parody text
  engine, store as GPS dig site. Brief written 2026-07-27:
  `design-briefs/flagship-attic.md`. ⛔ Stephen calls pending: name, launch
  classes, what the store wants, paper text-engine taste test OK?
- [ ] **Gnome Blitz** — new game, Dutch Blitz with garden gnomes.
- [ ] **Scrabble Overturn / Scrabble UpWords** — new game ideas, unspecced.
- [ ] **Nature Sound ID app** — needs an audio-fingerprint approach decision first; model on
  Merlin Bird.
- [x] **Jade Garden IS BUILT — the "never built" note was WRONG (corrected 2026-07-28).**
  Stephen: "we also have a mahjong called jade garden… i just played it." Verified:
  `satellites/mahjong/index.html` (64KB, `<title>Jade Garden · Sky Wolf Studios</title>`,
  with `assets/` + `og/`), and a live portal card at `portal/index.html:750` pointing at
  `/satellites/mahjong/` plus a search alias at :1113. The old note searched for
  `games/jade.js` (the CLASSICS path), found nothing, and concluded the game did not exist —
  it shipped as a SATELLITE under a different slug. Textbook
  [[reference_display_name_slug_map]] trap: **display name ≠ slug ≠ directory.**
  Corrected in the same pass: `scripts/smoke_shells.js` (comment claimed not-built) and
  `GAMES_MANIFEST.md:105` (pointed at the non-existent `games/jade.js`).
  ⚠️ Still open, Stephen's words: "the mahjong could maybe be improved" — no specifics yet,
  needs him to say what bothered him before anyone touches it.
- [x] **Chameleon 3D card — repointed AND surfaced (2026-07-27, commit f0f0c6d8).** The
  card already tracked the live repo-root `abduct-3d.html` (repointed Jul 20, 08cfeb4c);
  what kept Stephen from seeing it was `beta:true` hiding it in the In Development tab.
  Beta flag removed — the 3D card now sits directly beside the 2D card in the default
  view. Still open: postMessage earn bridge needs event definitions.

---

## 💰 BUSINESS / LEGAL — highest stakes, lowest effort

- [x] **Attention-protocol repo visibility CHECKED 2026-07-26 — IT IS PUBLIC.**
  Verified: `gh repo view Stephenuffugus/lucid-winds` returns visibility PUBLIC
  (repo created 2026-03-15, two days before the provisional). The evolved
  protocol code (earnHashes caps/anti-farming, engagement grading) has been in
  the public repo since its first commit 2026-04-29, and in-code comments show
  the repo was knowingly public well before today (the swFeedback webhook was
  rotated for exactly that reason). Not a lawyer, but per this item's own
  framing: the US grace clock on the evolved parts has been running since
  ~2026-04-29, and foreign absolute-novelty rights on publicly disclosed
  material are likely gone. The March 2027 conversion deadline still dominates
  for the US. ⛔ Repo visibility NOT changed — Hostinger deploys from it;
  making it private is Stephen's call with the deploy implications in view.
- [x] **Second provisional — STEPHEN RULED 2026-07-26, verified as his direct words (decision recorded, no
  further nagging).** His plan: revenue first; if the first provisional is not
  converting by its expiry (2027-03-17), file the second cheaply near that date
  (micro-entity fees apply with fewer than 5 prior applications). Noted for the
  calendar: that timing still lands inside the 12-month US grace window from the
  ~2026-04-29 public disclosure. One reminder exists in the BUSINESS section
  (December decision point), nothing else.
- [ ] **File a second provisional on the evolved attention protocol.** The 2026-03-17 filing
  only protects what that document describes. Everything the protocol learned since (grading
  engagement on any test/document/screen, bot detection) is unprotected. ~$130 self-filed.
- [ ] **Patent conversion decision — December 2026.** Provisional expires 2027-03-17. Needs
  attorney lead time, so the real decision point is December, not March. If international
  licensing is ever the goal, a PCT must be filed by the same date.
- [~] **Local venue outreach.** Tier 1: Milestone (Canton, 1,400+ games), Sapphire Games
  (North Canton), Green Dragon Inn (Akron, 750+ games). Tier 2 Akron: Quarter Up, Full Grip
  Games, Underhill's, Sweets and Geeks. Tier 3: Tabletop (Cleveland), 16-Bit (Ohio City +
  Lakewood), Barflyy (Kent). Verify hours before driving. Attribution links are LIVE — use
  `?from=<slug>` today.
- [ ] **Cold email follow-ups** — sent the batch Jul 24 night, 2 bounced. Follow up the rest.
- [?] **Social handles** — `/links.html` is live and is the one link to put in every bio.
  Fill in the `SOCIAL` array at the top of that file as each account is created (Instagram,
  Twitter, Facebook, itch.io, YouTube, Discord). Empty entries stay hidden, so there is never
  a dead link. Nothing else on the page needs editing.
- [x] **Social previews DONE — 100% coverage.** 66/68 `/play/` shells and 83/83 satellites
  have 1200x630 cards + og:/twitter: tags. Games with real card art use it; the 7 with none
  get a studio-mark fallback (the wolf, never a fake screenshot). The 2 remaining `/play/`
  files are `index.html` (a directory listing, not a game) and `power-scalers.html` (below).
- [?] **`play/power-scalers.html` — decide: delete, redirect, or keep.** It's a 2,245-line
  legacy duplicate. The portal deliberately points at `/satellites/power-scalers/` instead
  (see the comment at `portal/index.html:646`), so nothing links to this copy, but it is
  still reachable by direct URL and its `<title>` says "Lucid Winds · OC Arena" — a name
  that appears nowhere else. A redirect to the satellite is probably right.
- [?] **Portal black screen — needs a repro, not a guess.** Read every open/close path in the
  overlay lifecycle (`openGame`/`closeGame`/`requestClose`/`popstate`, `portal/index.html`
  ~1300-1650). It's already hardened with a double-back guard, a srcdoc navigation guard,
  satellite reframe recovery, and a 600ms fallback, and every close path consumes its own
  history entry correctly. No defect found by reading. Guessing at a fix here risks breaking
  the close path for all 159 games. Needs Stephen to catch it live, ideally on his phone.

---

## 🤝 PARTNER HOSTING — before onboarding anyone you don't know

`PARTNER_INTEGRATION.md` is a complete, sendable offer today, and link-out partners are safe
right now. These gate hosting strangers' code or advertising the program publicly.

- [ ] **gameId registry + server-side allowlist + per-game caps.** `functions/earnHashes.js:62`
  takes `source` as an arbitrary string. No attribution, no revoke without a redeploy. 1–2 days.
- [ ] **Origin-isolated SDK.** Today a partner page holds a real Firebase ID token for the LW
  project, which per `firestore-rules-8.txt:129-141` can read and WRITE the player's whole
  vault, plus call `mintPlant`. Fine for people he knows and has agreements with. Not fine for
  open onboarding. 3–5 days.
- ⛔ **Do NOT host partner code on lucidwinds.com** until the above lands — same-origin gives
  their code everything, including localStorage. Link-out gets ~90% of the value with none of
  the risk.
- [ ] **Partner agreement IP clause** — protocol stays his; integration grants a license, not
  a stake. Strengthens the patent story rather than diluting it.

---

## 🎵 MUSIC SHELF — v1 shipped, the rest is designed not built

- [x] Jimothy's soundtrack reaches the arcade (boot-time backfill, 2026-07-25). Verified by
  simulating the fold against a stubbed localStorage before shipping.
- [x] Per-game shelves, sorted above Originals. Verified: shelf order came back
  `Jimothy | Originals | Unlocked in Games | Classical`.
- [x] **Locked-song teaser rows — CLOSED, not wanted, verified against his words
  (Stephen's easter-egg ruling 2026-07-26).** Songs appear when found; hiding
  them IS the design.
- [ ] **One song unlocks just for OPENING a game.** SCOPED 2026-07-26: for the
  only soundtracked game this already works — Jimothy's free track (moonwalk) is
  the arcade teaser by design, and opening Jimothy backfills its shelf. The
  GENERAL feature (open any game, gain a studio track) is entangled with the
  locked-song behavior decision above [?] — build after Stephen picks, and after
  a second game has a soundtrack to give.
- [ ] **Unlock ledger synced to the vault.** Today it's localStorage only. It survives because
  the game re-exports on boot, which is exactly why that fix mattered, but it isn't durable.
- [ ] **Music rewards as a partner perk** — "integrate and your game gets a shelf, and your
  players unlock a track that plays everywhere." A stronger hook than sunbeams alone.

---

## 📒 THE JUL 16-18 LIST — recovered 2026-07-25, this is the one we were going down

⚠️ **I missed this when I built this file.** I merged the Jul 19/20 sources and did not
merge Jessie's Jul 16 doc or the colour-coded per-game sweep. Stephen was right that it
did not feel done. Source of truth is still the live Drive doc ("Notes on Games from
Jessie", `1NWkCIbodKNS1dhsDEUgTcVsRc_oIJcbxOeA9iNWP_eQ`) — ⛔ **read it as HTML, not text,
or the highlight colours that carry the session structure are lost.** It grows; check it
every session.

**Status below is 7-8 days old and NOT re-verified.** Treat each as "probably open, confirm
before building."

### PURPLE — the per-game readability sweep (Jessie's biggest batch, mostly open)
The `/play/` shells got directions pages and the font pass on 7/18. **⛔ The SATELLITES did
not.** These are per-game and specific:
- [x] Cipher Bloom — off-screen FIXED. `fitStage()` measured `innerHeight`, which on a
  real phone includes the strip behind the URL bar, so the stage scaled bigger than the
  visible area. Now prefers `visualViewport` and listens to its resize/scroll events.
  Verified: scale drops 0.7222 → 0.6250 when the visible area shrinks. ⚠️ needs Jessie
  to confirm on her actual device — headless has no URL bar so it cannot reproduce there.
- [x] Petal Alchemy — off-screen FIXED, same root cause, same fix, verified the same way.
- [x] **STUDIO-WIDE VIEWPORT SWEEP — 47 games fixed.** This was never a handful of games;
  nearly every satellite sized its stage off `innerHeight`. Done in three verified waves:
  the 2 Jessie reported → 9 → the 6 other games she flagged → 32 more matching the exact
  proven signature. Verified 32/32 + 6/6 + 8/8 shrink correctly, all parse clean, smoke
  suites pass, 8 service worker caches bumped.
  ⛔ **NOT swept, deliberately:** ~30 other `innerHeight` patterns do genuinely different
  things (dewball's 3D camera aspect, burr-blast canvas DPI, vinewinder's fixed -260,
  blooming-words percentages). A regex over those would have broken real games. If any
  of them turn out to be off-screen on device, they need individual review.
- [x] **Swept the other 9** — bridgevine, leaf-fit, nova-bloom, pollinator-paths,
  root-weave, spore-drift, tempo-grove, silt (scaled stages) + garden-td (full-bleed
  canvas, different shape, handled separately). Unblocked by Stephen confirming the first
  two on his phone. Verified: 8/8 stages shrink 0.7222 → 0.5417 when the visible area
  shrinks, garden-td canvas 844px → 520px, all 9 parse clean, 0 page errors.
- [x] **Loop Warden — CLOSED 2026-07-28, measured.** Sizing was fixed by the viewport
  sweep (an oversized stage was pushing the button off the bottom on a real phone), and
  all four mode buttons were verified to fire with BEGIN THE WATCH above the fold at
  390x844, so it was never a dead button. The "every touch target is 40px or 35px" half
  of the note is now STALE: measured at 375x667 in rendered px, 8 of the 9 targets on
  that screen are 48-50px. The single sub-48 hit was not Loop Warden's at all — it was
  the shared fleet feedback fab (44x46), fixed below. Re-measured: **9 targets, 0 under
  48px, 0 JS errors.** ⚠️ Jessie should still eyeball it on her own device; headless
  cannot reproduce a URL bar.
- [x] **Fleet feedback fab was under BOTH house minimums — fixed in shared code
  2026-07-28.** `feedback.js` shipped the bug button at `min-height:44px` (mini variant
  44x44) with `.66rem` label text: under the 48px touch minimum AND under the 0.7rem
  readability floor, on all 84 satellites at once. Now 48px / 48x48 / `.72rem`, with
  `border-radius` and `line-height` moved in step so the circle stays a circle. The
  `feedback.js?v=4` reference was bumped to `?v=5` in all 84 HTML files in the same
  commit, because a shared-asset fix behind a stale query string reaches nobody.
  Verified on loop-warden: fab now measures 48x50, 0 targets under 48. Parses clean.
- [x] **48px TOUCH-TARGET SWEEP — FLEET COMPLETE (commit d84b3788), 83/83 clean,
  measured in RENDERED px by the independent auditor (scripts/touch_audit.js,
  permanent).** 18 clean this morning -> 79 after the 8-agent workflow (63 games)
  -> 83 after four hand-finished stragglers. One standard fleet-wide: 72 stage px
  in scaled games / 48 real px unscaled / outward-only tap zones for small
  visuals / no vw in scaled stages. Documented exemptions: contiguous board
  grids + the crossword keyboard (geometry). Re-run `node scripts/touch_audit.js`
  any time; any NEW game must pass it before shipping.
- [x] **Line Loom "incomprehensible" — FIXED.** Investigated first: the title screen already
  explains the game and there IS a how-to page, so information was never the gap. The gap
  was first contact — you land on a near-black board with four small outlines and six
  numbered buttons and nothing names the VERB. Added one first-run coach card on the board
  ("Drag from one station to another"), 48px dismiss, shown once. Verified headless:
  appears, dismisses, does not return, 0 errors.
- [x] **Mini Crossword layout FIXED 2026-07-28, measured.** The note was one word
  ("layout"); the defect was two: the board ran y 96-506 in stage space while
  `#cluebar` started at 496, so the bottom row of every puzzle was clipped by the
  clue, and there was ~140px of dead air between the clue and the keyboard. The
  clue bar now sits directly above the keyboard (618-690, keyboard 706-960) and
  the reclaimed space went into bigger squares (cell 82 -> 96, a 17% larger
  board). Font size, cursor ring and the tap hit-test all derive from GEO, so
  they followed; the "SOLVED!" banner moved with the board.
  Verified at 375x667: stack is HUD 0-68, board 96-576, clue 618-690, keyboard
  706-960 — no overlaps; tapping the board still selects the right cell (clue
  switched to "5A Get up or come about"); parses clean, 0 JS errors.
- [x] **Bridgevine "scroll" — investigated, NOT reproducible, nothing changed
  (verified headless 2026-07-26).** Page scroll containment fully present
  (overflow:hidden + overscroll-behavior:none + touch-action:none + passive:false
  preventDefault); scrollY stayed 0 through board drags at 390x844 AND 360x800
  and in a portal-embed simulation; all 7 screens reachable (overflowing ones
  scroll inside their own pad); the OTHER reading — the goal parchment "scroll"
  text spilling — measured 0px overflow in all 14 trials + all modes (its fix
  was a20cf2d8). Note likely predates that fix. 21 screenshots on file.
  ⚠️ If Jessie hits it again: which screen, and standalone or inside the arcade —
  one sentence re-arms the exact repro.
- [x] **Plot Bloom neighbours+depth DONE, verified (commit e4d6fb02).** Coach + help now
  define a neighbour literally (8 touching squares, corners included, 3x3 diagram
  in both) and depth as pay-once-then-keep-counting; piece names match the SYN
  matrix; empty-board zeros explained. Mechanics untouched; autoplay run clean.
- [x] **Root Groups text DONE + real bug, verified (commit e4d6fb02).** 15 sub-floor text
  styles raised to 0.7rem rendered; help corrected (dots not leaves, real 3-dew
  hint cost); AND the audit surfaced that a HINTED TILE WAS UNSELECTABLE, making
  every hinted board unwinnable — fixed (one word), proven end to end. Portal ds
  hint sentence updated to match.
- [x] **Season Sway wording DONE, verified (commit e4d6fb02).** Loss messages were
  direction-blind ("The wild ran out." over a FULL meter) — now "Too much
  Wildlife." / "Not enough Sun." on overlay + results; Seed Vow HUD counts cards
  ("Favor Wildlife · 16 left"); How screen explains all four modes; fonts to
  spec; HUD buttons to 48px rendered. Open Director call: Zen Tending has no end
  state (How screen now says "never ends", at least honest).
- [x] **Hedgerow replay-level DONE, verified (2026-07-27 sweep).** Replay button
  on the level-complete bar (the gap: a COMPLETED ground vanished the moment you
  pressed Next). Keep-best rule: total banked on replay, re-clear takes the
  better attempt, mid-replay death ends at the bank; progress/skins/best never
  regress (localStorage-verified). Declined without Stephen: a start-at-any-ground
  picker (changes run economy). Pre-existing note: advance() stacks an extra rAF
  chain per Next press — future pass.
- [x] **Tinker Loft finger-drag + Tinker Shop DONE, verified (commit b1e65e14).** Pulled
  Jessie's actual Drive doc: "Tinker Shop" = the WARDROBE screen rename (done),
  NOT the game title. Finger-drag added: drag parts from the tray (part rides
  ~40px above the thumb, validity ring), tilt planks by end handles snapped to
  the proven angle set; old controls intact; all 14 level proofs still pass.
- [x] **Tinker Loft, rest of Jessie's doc list — ALL FIVE DONE 2026-07-28,
  verified (14/14 level proofs still win, 0 NaN, 0 JS errors).**
  · **Plaque above the box.** The level chip and hint used to float ON the machine
    and the nails really are underneath them (spikes live at world y=52). The
    canvas now starts at y=104 inside a real header band: back button, brass
    plaque with level name + goal, nudge chip, and the hint on its own two-line
    row. Cost was 8% of machine height, bought back by trimming the dock 170→148
    (tray buttons 118→96 stage px, still 59.7px rendered, above the 48 floor).
  · **Scissors bigger + rotatable.** Redrawn at proper size with real blades and
    finger loops, and the dashed ring is now drawn at radius 36 — which is the
    ACTUAL cut radius the physics has always used (it drew 22 and quietly cut 14px
    wider, so the tool was lying about its reach). TILT now offers itself for
    scissors and steps them 0/45/90/135; physics unchanged (the cut area is a
    circle, so rotation is honest presentation, not a mechanic change).
  · **Hints name their goal.** Updraft now says "Ring the bell up in the rafters";
    12 of the 14 hints were rewritten the same way (Snip, Snip Trio, Fan Ferry,
    Tilt Bridge, Chain Loft, The Long Way, The Bounce and the rest all name the
    basket, bell or balloons).
  · **Sandbox renamed "The Workbench"** (display only, MODE key stays `sandbox`)
    **+ a catch bin** on the floor built from three slanted segs so a ball settles
    instead of falling out of the loft. Ran 600 ticks clean.
  · **Capitalization**: the outlier lowercase buttons ("back" ×3, "menu") are now
    Title Case like every other button in the fleet.
  · Bonus caught in the same pass: `fit()` measured `innerHeight`, the exact
    signature the 47-game viewport sweep hunted — tinker-loft was MISSED by it.
    Now visualViewport with its resize/scroll listeners. And its own font
    offenders (.tag, .btn.sm, .lvlcard .lt/.ls) were raised, leaving only
    `div#buildstamp` — the pending Director call.
- [x] **Micro Meadow renamed to Think Fast** — 10 display strings + portal card + social
  card regenerated. Slug stays `micro-meadow` (URLs). Verified 0 old strings remain.
- [x] **Leaf Fit rotate DONE + fatal bug, verified (commit e4d6fb02).** Rotation existed
  but dropped the species id: every rotated placement wrote undefined into the
  grid as INVISIBLE unclearable cells that poisoned the board. Fixed; game-over
  check now rotation-aware (no premature end while a rotated fit exists); sage
  rotate-hint glyph when only a rotation fits.
- [x] **Leaf Fit rename DONE — Stephen picked TETROKU (Tetris + Sudoku), 2026-07-27.**
  All 11 display strings swapped (portal card + satellite title/OG/share/buildstamp),
  BUILD bumped v1.1→v1.2. Slug/URL stays leaf-fit (installed PWA + shared links),
  per the display≠slug pattern. **Evidence added 2026-07-28:** re-verified against
  the LIVE site — `lucidwinds.com/portal/` and `/satellites/leaf-fit/` both serve
  "Tetroku", byte-identical to the repo; the only "leaf fit" left is the portal
  search alias at `portal/index.html:1149`, which is deliberate so the old name
  still finds the game.
- [x] **Merge & Blast level-goal consistency DONE, verified (2026-07-27 sweep).**
  Make-goals could sit BELOW shown progress ("Make a 16 (best 64)") and complete
  on any merge — targets now max(ladder, best+1); score goals say "Score N more"
  matching the base-relative check; biggest-tile seeded from the opening board.
  5 live level completions verified; sw v7 lockstep.
- [~] **Directions pages + readable fonts for every SATELLITE** — DIRECTIONS HALF
  DONE, verified (commit f9aec63c): all 12 real no-directions satellites now show
  rules before play (star-field, pollen-panic, impossible-garden, petal-plunge,
  budburst, power-scalers, flatulence-fighter, dewball, vinewinder, pong,
  bramblewick, pitbike-rally), each re-gated through the auditor
  (scripts/satellite_ux_audit.js) flipping to directions-found with 0 em-dashes.
  vine-runner + stream-hop exempt with cause (canvas-painted directions /
  Jimothy splash). Bonus fixes in the wave: pollen-panic's 25-node 8px font
  rescue, vinewinder's 12-style font pass, flatulence-fighter's 9px label,
  petal-plunge's tutorial made re-readable, pong's 48px back-x everywhere.
  (b) **DONE 2026-07-28 — all ten games, measured before and after.** Audited
  first (`scripts/satellite_ux_audit.js`, rendered px at 375x667) rather than
  trusting the 7-day-old note: every one of the ten really was serving player
  copy under the 11.2px floor — 10 satellites, ~50 distinct selectors, worst
  7.3px ("best wave", frost-watch). Fixed surgically, sized per stage scale
  (scaled 540x960 stages need ~17px CSS to render 11.7px; unscaled games ~11.5px).
  Also caught and fixed what the note missed: line-loom's whole IN-GAME HUD
  (bridge/pool/week chips, shuttle numbers, UNWEAVE, the coach card and its GOT IT
  button, 8.3-10.4px) — the title screen was never the only offender.
  Re-audit: **8 of 10 fully clean, the other 2 clean except `div#buildstamp`**,
  which is the Director call below. Landing screenshots eyeballed for overflow
  (line-loom, star-field, frost-watch, budburst) — no clipping, no wrap breaks.
  All 10 parse clean; flipbook sw v7→v8 and dewball sw v4→v5 bumped in lockstep
  with their registration URLs so phones actually get the new CSS.
  ⛔ STEPHEN RULING still needed: ~60 games' worst offender is the tiny
  div#buildstamp version stamp (6.8-7.8px). Player copy that must hit the
  0.7rem floor, or dev chrome the auditor should exempt?
  (c) em-dash remainders: hues FIXED; bramblewick + pitbike-rally landing
  copy FIXED in the wave. **power-scalers DONE 2026-07-28** — 44 found, 41 were
  player-facing and every one was REWRITTEN rather than swapped for a comma at
  random (race blurbs, power/archetype descriptions, battle-log lines, the
  reforge toasts, tree and jewel hints, "— none —" in the alliance dropdown ->
  "no alliance", and the "—" empty-value glyphs in the stat table -> "·"). The
  3 left are inside code comments, which no player reads. Auditor: em-dashes in
  visible text 0. Same pass took its two sub-11px offenders clean as well
  (.brand .s "OC ARENA" 9px, .section-h .n 11px), so power-scalers is now clean
  on fonts AND dashes; parses clean; landing screenshot checked.
  ⚠️ `play/power-scalers.html` still carries 43 em-dashes — that is the stale
  vendor copy with the open delete/redirect/keep call below; fix it there or
  retire it, do not port blindly.
  STILL OPEN: pitbike-rally has
  runtime strings in src-dly17/ui.js (vendored module cache scheme: needs a
  new src-<ver> dir copy, fix in external repo Stephenuffugus/skywolf-pitbike-rally
  FIRST, then re-vendor — same for the HOW panel added here).
  ⛔ dragon-philosophy TRAP unchanged: vendored MINIFIED React bundle, 38
  em-dashes as its whole copy voice, log styling keyed on startsWith(em-dash);
  own careful session or source-project fix.
  NOTE for re-vendors: pollen-panic body edits + power-scalers three-way vendor
  drift (arena/ vs play/ vs satellites/ now differ; satellite is newest) — port
  or retire the stale copies.
  ⛔ STEPHEN RULING NEEDED: ~60 games' worst offender is the tiny div#buildstamp
  version stamp (6.8-7.8px). Player copy that must hit the 0.7rem floor, or dev
  chrome the auditor should exempt? One-line filter either way.

### From the Jul 16 "New notes" + Jessie doc
- [?] **Pong Arena landscape long-court — MEASURED 2026-07-28, and the landscape
  half is already DONE; what remains is a one-line design call from Stephen.**
  Verified on an emulated Pixel 9, Classic mode, rotating mid-match: `resize()`
  already calls `rebuildArena()`, so the court rebuilds correctly and landscape
  gives a proper full-length court — cyan paddle hard left, pink CPU hard right,
  centre line, HUD intact, 0 JS errors. Screenshots on file.
  The real defect is PORTRAIT: Classic keeps its paddles on the left and right
  edges, so on a 412x915 phone the rally crosses only 412px while 915px of court
  runs the other way. Most of the screen is dead space and the ball is across
  almost instantly — which is why the title screen has to tell players "rotate
  your phone for the full-length court".
  ⛔ **THE CALL IS YOURS, and it is a mode-identity question, so I did not guess:**
  should Classic flip its paddles to top/bottom when the phone is portrait (the
  court then runs the long way and the drag remaps to horizontal) — accepting that
  in portrait Classic then looks exactly like **Sky Duel**, and in landscape Sky
  Duel looks exactly like Classic? The alternative is to leave portrait as the
  stated compromise it is today. One sentence from you and it is built.
- [ ] Portal: live "N playing now" per game (needs presence; design first)
- [x] **Portal search "similar type" matching DONE 2026-07-28 — and it uncovered
  eight games nobody could find.** The ALIASES map is looked up as
  `ALIASES[nm.toLowerCase()]`, so **renaming a game silently orphans its aliases**.
  Eight had been orphaned: searching "blockudoku" or "woodoku" returned NOTHING
  because the alias was still keyed on "leaf fit" after the game became Tetroku.
  Same for Sunforge (was ring stacker), Acorn Drop (tonic drop), Jimothy (stream
  hop), Think Fast (micro meadow), Blobworks (greenhouse pinball), Mancala (seed
  sow) and Go (living stones). Re-keyed to current names with the OLD name folded
  into the keywords, so both titles find the game. Loud comment added with a
  rename checklist so the next rename cannot repeat it.
  Search itself upgraded: **category is now searchable** (typing "puzzle" or
  "dice" matched nothing before unless the word was in a name), hits are RANKED
  (title 3 > alias 2 > category/description 1) instead of alphabetical, and a
  narrow search now appends **type-neighbours** — other games sharing ≥2 alias
  keywords with a hit.
  Verified live: blockudoku/woodoku→Tetroku, frogger→Jimothy, dr mario→Acorn Drop,
  warioware→Think Fast, pinball→Blobworks, baduk→Go, old names still resolve,
  puzzle→8, dice→4, 12 blocks parse, 0 JS errors.
  ⛔ STILL OPEN, needs Jessie: her "assistant-to-guide" idea — no spec written down.
- [x] **Cosmic Cadets sprite scaling FIXED 2026-07-28** (⚠️ display≠slug: the note
  says "Comet Cadets", the game ships as **Cosmic Cadets** at
  `satellites/seed-flutter/` — another [[reference_display_name_slug_map]] trap).
  Stephen: "some sprites are smaller than others and dont seem to flow the same
  as the starting sprite." Verified and measured, he was exactly right.
  `drawSeed` called `_blit(im, x, y, 42)` — scale to a fixed FILE height. The art
  is framed inconsistently (files run 98x182 to 267x196, padding varies), so at
  h=42 the cadets drew anywhere from **24px wide (crayon) to 90px (metallic
  settle)** while the starting cadet is 41. A single skin's own poses swung as
  hard: metallic gold idle 75 wide, flap 34, settle 90, so the character changed
  size every time it flapped.
  Fix: scale on the opaque CONTENT diagonal, take that scale from the skin's IDLE
  pose and reuse it across that skin's poses (a flap can still stretch the shape
  without resizing the creature), anchor on the CONTENT centre, and bound each
  pose to the 0.84-1.18x band the default cadet's own three poses already sit in.
  Bounds table measured by `scripts/cc_sprite_bounds.py` (committed, re-runnable).
  Result: drawn width spread 4.0x -> 1.95x, worst within-skin swing 2.6x -> 1.33x
  (the default cadet is 1.18x), and the **default cadet is pixel-identical** to
  before (41.4x40.9 / 40.5x42.4 / 35.8x34.2). Hitbox untouched — HIT_R is a fixed
  11 and never derived from the sprite, so difficulty does not move.
  Verified: game runs and flaps headless, 0 JS errors, 3 blocks parse. Side-by-side
  proof at `satellites/seed-flutter/art-drop/sprite_scale_before_after.jpg`.
  ⚠️ ART GAP for Stephen: the 4 crayon skins and amber/frost/rosenova/sparkler have
  NO flap or settle pose, so they alone stay frozen while every other skin animates.
- [?] **Comet/Cosmic Cadets alien level-worlds** (water / fire poles / ice / tornado
  / rain / desert) — ⛔ STEPHEN 2026-07-28: "i dont know if cadets needs world
  levels or even a world mode". Parked on his call, do NOT build it. The game
  already has sky PHASES (Rosedawn / Goldveil / Meteor / Frostnight) which may be
  what the note was reaching for.
- [ ] Dewtrail — retheme away from dew, THEN Jessie does the art
- [x] **Mosaic Draft clarity pass DONE 2026-07-28.** Looked at what a NEW player
  actually meets, because the rules panel auto-opens on first load
  (`if(!SAVE.howSeen) showScreen("s-how")`) — it is literally the first screen of
  the game. Two defects there, both fixed:
  · **The version stamp printed across the rules.** `#buildstamp` is z-index 31
    and `.screen` is 30, so "MOSAIC DRAFT v1.0" was drawn letter-on-letter over
    rule 5. It is now an opaque footer strip (gradient to solid) with the screens
    padded clear of it, so copy scrolls behind and fades out instead of colliding.
  · **No way forward was visible.** The rules are ~890px taller than a phone
    screen and GOT IT sat far below the fold with no scroll affordance — you met a
    wall of text cut off mid sentence. GOT IT is now sticky. Verified headless at
    375x667: btnVisible true both at scrollTop 0 and at scrollTop 887 (the end),
    0 JS errors, 3 blocks parse — so the exit is always on screen and doubles as
    the hint that the panel scrolls. Shipped in commit 703c03a5.
  Checked first, NOT changed: the rules copy itself is good, and the
  "GOT IT returns to the title instead of starting a duel" I suspected was my own
  probe tapping a hidden button — the real first-run flow (load → rules → title)
  is correct and matches the house "rules before play" standard.
- [x] **The two "coming soon" cards are gone — both were wrong, 2026-07-28.**
  COMING SOON cards render as dead `<button>`s, so neither game could be opened.
  · **Impossible Garden is FINISHED CODE.** Verified: it plays end to end (Daily
    Path opens, the wanderer walks, vine arms turn), and its own harness
    `IG_DEV.solveAllCheck()` reports **8 levels, 8 solved, 0 fails, 0 JS errors**.
    What it is short of is CONTENT, not code — 8 levels is thin. So it is now
    `beta:true` (IN DEVELOPMENT): a real link players can open, honestly labelled.
    Remaining work is authoring more levels, which is a design job not a bug.
  · **"Brawl" pointed at a game that no longer exists.** The card read
    "Brawl · Multiplayer mayhem · 🍺"; the URL is live and now serves **WILD
    WARDENS** (tame the wild, tend your grove, walk the real world — roster, skill
    trees, territory, mastery, daily quests, and a FIGHT (DEMO) section). Card
    corrected to the destination's OWN title, not a name I invented, and flipped
    to IN DEVELOPMENT so it opens. ⚠️ STEPHEN: confirm the name, and whether
    `portal-assets/thumbs/brawl.png` (a green brawler on stone blocks) is still
    its art.
  Verified in the live portal render: both cards are now `<a>` links with the
  IN DEVELOPMENT badge; `soon:true` no longer appears anywhere in the portal.
- [x] **ALL same-origin games earn sunbeams — audited and closed 2026-07-28.**
  Audit first: 79 of 84 satellites were wired. The 5 that were not:
  · **bloom-breaker** and **bramblewick** LOOKED wired — both call an internal
    `earn()`/`earnMoment()` that posts `{sws:'earn'}` to the parent. Nothing on
    the portal side has ever listened for that message (the portal handles
    `ready`/`close`/`retryGame`/`game-music` only), so both games paid out
    **nothing**, quietly, for their whole life. Now on the house standard: SDK +
    a 30/day capped `_sbCapEarn`. bloom-breaker 3/level clear (4 if perfect),
    6/world clear. bramblewick 2 per survived minute, 5/boss, 1/elite.
  · **power-scalers** had no earn path at all. Now 3 per resolved arena bout,
    which is the unit of play there.
  · **chameleon-3d** — vendored external game, backend-free by design, no hooks.
  · **dragon-philosophy** — ⛔ STILL OPEN: vendored MINIFIED React bundle. Same
    trap as its em-dash copy; needs its own session or a source-project fix.
  Verified headless on all three: SDK present, helper present, a probe grant
  returns 3, per-game localStorage key written, 0 JS errors, all blocks parse.
  Cap proven, not assumed: 40 consecutive 3-sunbeam calls granted exactly 30 and
  then stopped (`sw_sb_powerscalers={"d":20662,"n":30}`).
- [x] **Silt element-behaviour message made consistent, 2026-07-28 (16/16 trial
  proofs still win, 0 JS errors).** The note was right and the worst case was
  concrete: the game told you to **"Fuse 24 sand into glass"** and to "Paint sand,
  water, soil and seed" — but there is no SAND chip. The element is **Silt**, which
  is also the game's name. A player was being sent looking for something that does
  not exist. Fixed in the goal text, the front-door ribbon and the help.
  Second half was typographic: the help shouted some elements in caps (SOIL, SEED,
  FIRE, WATER, MIST) and bolded others in lowercase (sand, glass, lava, ice...),
  so the copy read as two different games. Now one convention throughout — bold
  Title Case, exactly matching the chip labels the player taps.
  Also added the missing row: Stone and Glass never move and nothing eats them
  (verified in the sim — both are skipped by the update loop), Silt falls and piles,
  Oil pools like water and is the most flammable thing in the satchel (FLAM 0.62,
  highest of any element). Every drawable element now has a stated behaviour.
- [x] ~~New game: Mouse Trap~~ — ALREADY BUILT. Verified 2026-07-25: `satellites/mouse-trap/`
  exists and has a live portal card ("Trap the little garden mouse before it scurries off
  the edge"). Another stale entry on the Jul 16 list.
- [ ] Penny's queue, still open: Plant Flip, Mecha Chameleon
- [ ] **NEW GAME: Bubble Bobble remake** (Stephen 2026-07-25). Checked the whole repo,
  the portal, the satellites and the memory dir: there is NO Bubble Bobble and there was
  NO note for one. It is a genuinely new ask. Two players, trap enemies in bubbles, pop
  them, single screen platformer, fixed levels. Needs a name and a botanical or studio
  angle before building — every other remake got one (Snakes & Ladders → Garden Climb,
  Monopoly → Garden Estates, Yatzy → Yacht-Sea).

### Naming + economy calls (Stephen only)
- [?] Merge & Blast and Super Slice both still carry placeholder names — "⛔ Stephen NAMES it"
- [?] Tempo Grove rename (nothing plant-like about it)
- [?] LW 100 plant slots — cap is 60, economy call
- [?] Hues border-shop coin pricing
- [?] Hunch "see others" gallery — PARKED, public kid UGC needs his moderation sign-off.
  Full design already written at `design-briefs/hunch-gallery.md`.

---

## 🅿️ PARKED BY STEPHEN — plan written, do NOT start

**Daily modes** (⛔ Jul 22: "we don't have the resources… I want to finish the Jimothy art").
Full plan in `docs/daily-modes-plan.md`. Matters because Listdle only accepts free daily games
with no login, and it's the one directory that said yes.

- [ ] DL-A **Verify the six** that claim a daily — do FIRST. Scanned Jul 22: Dew Trail ✅ UTC ·
  Word Sprout ✅ · Flood ✅ · Minesweeper ✅ (last three roll at local midnight) ·
  **Daily Bloom ⚠️ half broken** (rotation seeded, content is not — `startWordRecall` calls
  `shuf(WORD_BANKS[Math.random()])`, so scores aren't comparable) · **Stop at Ten ⚠️**
  (reaction waits are `Math.random`).
- [ ] DL-B **Shared daily kit** (~half session) — day number, seeded RNG, first-run-counts,
  streak, share-strip encoder, countdown. Do this BEFORE more dailies; turns each one from a
  week into a day.
- [ ] DL-C1 **Vine Words daily** — highest value, named in the first email to Conor.
- [ ] DL-C2 **Word Search daily** — also named in that email.
- [x] DL-C3 **Three Sisters "Daily Trio" — ALREADY BUILT, the note was WRONG**
  (corrected 2026-07-28). Shipped 2026-07-16 in commit 0b8f1129, **nine days before this
  note was written.** Code is at `games/_inline/set.js`: mode button :186, date-seeded
  deck :397 (`mulberry32(dayNum()+77001)` — so scores ARE comparable, unlike the two
  ⚠️ games in DL-A), one counted lock-in + practice replays + share text :247-268, day
  helpers :146-164, `window._setDaily` :422. Loaded live by `play/set.html:36`.
  Remaining before submission: it rolls at LOCAL midnight (same caveat as Word Sprout /
  Flood / Minesweeper) and the Listdle submission is still parked per Stephen.
- ⛔ Do NOT submit any of these to Listdle before DL-A verifies them. Conor has been generous;
  sending a fake daily is how that ends.

---

## ✅ SHIPPED 2026-07-25 (this session)

- Arcade is installable — `portal/manifest.webmanifest`, head tags, install pill. The hub was
  the only surface in the studio with no manifest.
- Sky Wolf icon set cut from the banner — 192/512 any + maskable + apple-touch.
- **Jimothy splash-freeze fixed.** Three service worker bugs: no fetch timeout, respondWith
  (undefined) on a cache miss, and activate deleting every cache while a live page was still
  booting. That last one fired on every deploy, which is why it hit him constantly.
- **Swept the same three bugs from 7 more games** — Pop N Lock, Flipbook, Merge & Blast,
  Slice Master, Nectar Drop, Ring Stacker, Slice 3D.
- **Jimothy music reaches the arcade** — `syncMusicLibrary()` only ran on unlock events, never
  at boot, so anything unlocked before the bridge shipped was never exported.
- Per-game music shelves in the shared player.
- **Venue attribution** — `?from=` / `?venue=` with first-touch-wins, separate return-visit
  event, sanitised slug.
- Pop N Lock: stale "Chaff Wars" engine comment fixed (folder name stays, it's in URLs).

---

## 🔒 THE SYSTEM — how we stop losing track

Stephen, 2026-07-25: *"it's infuriating to give you a list of stuff and not have it done
when I'm assuming it is and you say it is, and then later I find things not done after
I've crossed the whole list off. We need a system so we never lose track."*

He is describing two separate failures, and each has its own rule.

**Failure 1: I marked things done that weren't verified.**
→ `[x]` is no longer allowed to be an opinion. It must carry evidence: a commit hash, the
word "verified", or a test result. `scripts/checklist_audit.js` FAILS if any `[x]` lacks
it. The first time it ran it caught three of my own. A promise can be broken silently; a
check that exits 1 cannot.

**Failure 2: whole lists never got merged.** The Jul 16 doc and the colour sweep sat
unmerged while we worked off newer notes, so real items were invisible.
→ Every list Stephen gives gets merged into THIS FILE, with its source and date, before
any work starts on it. Never work from a chat message alone. A list that only exists in
conversation is a list that gets lost.

### The loop, every session
1. `node scripts/checklist_audit.js --list` — see what is actually open, first thing.
2. Work items. Verify each before marking it.
3. Mark `[x]` WITH evidence. Commit and push.
4. Run the audit again before saying anything is done. If it exits 1, it is not done.

### The rule for Stephen
**Do not cross anything off your own list until the audit shows it `[x]`.** If I say
something is done and it is not in this file with evidence, I am wrong and you should
push back. That has already happened twice.

### Sources merged so far
Jul 16 "New notes" + Jessie doc · the colour-coded per-game sweep · Jessie Jul 19 queue ·
Jul 20 dump · Jul 20 handoff · everything raised in session since.
⛔ Jessie's Drive doc is LIVE and GROWS. Read it as HTML, not text, or the highlight
colours that carry the session structure are lost.

---

## 📌 STANDING RULES

- Deploy = push `add-sproing-jumper:main`. Not fixed until committed AND pushed.
- Bump each game's `sw.js` CACHE on any index.html change.
- **New satellites must start from the FIXED sw.js template** (`satellites/stream-hop/sw.js`),
  never a copy of an older sibling.
- Art ledger is the source of truth for art status. Never ask Stephen what art exists.
- Every art sheet goes to 012Assets as a Google Doc, not just a repo file.
- No em-dashes in player-facing copy. Rules before play. One-sentence descriptions on new games.
- Never claim art was hand-drawn or painted.
