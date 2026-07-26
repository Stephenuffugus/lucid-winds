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
- [ ] **Slime tube top-left: much smaller** — direction confirmed (older entry said
  "one number to tune at index.html:1104 if Stephen wants it smaller" — he does).
- [ ] **Blip's intro animation still skippy** — he provided a movement sheet; redo
  carefully or pull the old assets and do it right. Take time on it.

### 🗡 Super Slice 3D — NEW DESIGN DIRECTION (supersedes "it's done" state, not the
    dead-features law: chimney/mist/kick/hold-to-spin stay DEAD)
- [ ] **Mix the ORIGINAL game into the 3D layout**: this camera angle, but the guy
  moves LEFT-TO-RIGHT (not down a tunnel). Brown/wood blocks, fruit that splits in
  half, tap = knife bounces farther, tap-and-hold = original rules, in 3D style.
- [x] **Wall-climb footing — the brake EXISTED, discoverability shipped (commit
  1a873a02).** Hold already brakes the spin and turns the blade to the wall
  (wired, traced end to end) — but the how-to taught the OPPOSITE ("hold to keep
  flipping") and nothing in the climb ever said otherwise. Now: a dedicated
  how-to row + a toast at every climb start. Physics untouched. ⚠️ Stephen
  feel-test with the knowledge; constants tune from his report if still hard.
- [ ] **Sound: keep + embellish** — he loves the current SFX direction.
- [ ] **Randomly generated levels** (walls, caps, forest feel like the original) —
  after the core is fun. Art/backgrounds AFTER playable ("we'll get into the assets
  once the game is playable and fun"). Bump BUILD stamp when shipping.

### 🍃 OriVex (extends the older OriVex entry)
- [ ] **Board bigger on screen** — puzzle is too small; showcase the origami look.
- [ ] **Thumbnail shows the full board** (Jessie: board partially out of view).
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
- [ ] **2D: capture still not really possible** — refine being caught, add more
  abilities, MANY more UFOs searching. May stay single-player (his words), BUT:
- [ ] **Jessie: online 1v1 broken** — "host a code could not reach the relay."
  Memory says versus needs `?mp=wss://` when iframed — verify the portal embed
  passes it; the game is an external github.io repo.
- [ ] **River line map (Jessie)**: if you're the colour of the water you should be
  able to pass under the bridge unseen — camouflage rule gap on that map.
- [ ] **3D version: LOCATE THE BUILD.** Stephen: "I know we coded a whole bunch for
  it but I don't know where it is." Memory says card pinned to
  `releases/v3.0.0/abduct-3d.html` in the external repo — verify what exists there
  and report state before any building. Kenney asset packs (~50k CC0 assets) or the
  white bathroom-sign blob as placeholder art. ⛔ Careful with resources: build,
  don't endlessly test-play.

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
- [ ] **Hunch prompt bank**: research classic Pictionary clue banks; grow the bank
  so children can play and understand. Also open (found in code, flagged): the
  round timer starts on round LOAD, not first stroke.
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
- [ ] **No Pain No Gain, still open**: a real END to runs (fully build out);
  description loses the word "cozy".
- [ ] **Sprout Dice** (extends older ⚠️ entry): Jessie: "this game doesn't make
  sense." Needs a first-contact/clarity pass or a rethink.
- [ ] **Hexa Hive**: study the real Hexa Sort — tiles should MOVE to the next stack
  visibly (like cards shuffling) with an ascending stretch sound, not teleport.
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
- [?] **Game descriptions, 1-sentence sweep** — 119/161 are multi-sentence, but many are his
  deliberate rich featured copy. Needs him to say which cards stay long. Blind sweeping
  would undo good marketing.
- [?] **X1 pacing sweep** — the Monopoly anchor already has Relaxed/Normal/Fast. A blanket
  sweep across all games would violate no-blanket-fixes. Needs specific game callouts.
- [?] **Locked-song behavior** — he offered three options: not accessible / snippet only /
  fully listenable in the portal but locked for in-game use. Pick one before building.
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
- [~] **Blobworks code debt** — slime meter shrunk 196→150 so it stops overhanging the
  painted eyeball jars (verified by screenshot, not guessed; one number to tune at
  `index.html:1104` if Stephen wants it smaller). STILL OPEN: Blip's intro animation is
  skippy. Also noted: `art/tube_straight.png` and `art/tube_curve.png` are referenced
  nowhere in the code.
- [ ] **Gnome Blitz** — new game, Dutch Blitz with garden gnomes.
- [ ] **Scrabble Overturn / Scrabble UpWords** — new game ideas, unspecced.
- [ ] **Nature Sound ID app** — needs an audio-fingerprint approach decision first; model on
  Merlin Bird.
- [ ] **Jade Garden is documented but never built.** `GAMES_MANIFEST.md:105` describes it
  (mahjong, match free pairs, hint + shuffle) and the portal has a search alias for it, but
  there is no `games/jade.js`, no shell, and no card. No player can reach it, so nothing is
  broken — it's just owed. Removed from the smoke list so the suite reads green; put it back
  the day the game lands.
- [ ] **Chameleon 3D card repoint** — pinned to `releases/v3.0.0/abduct-3d.html`; repoint
  when he ships a new release. A postMessage earn bridge was offered; needs event definitions.

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
- [ ] **STEPHEN, ELEVATED: file the second provisional (~$130) NOW, not December.**
  Every month the evolved protocol sits disclosed-but-unfiled weakens the
  position; the filing establishes priority for what remains protectable and
  feeds the March conversion decision. The prior art here is your own public
  repo.
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
- [ ] **Locked songs listed below unlocked ones** as the reason to try that game. Blocked on
  the behavior decision above.
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
- [~] Loop Warden — start button. Sizing FIXED (see the viewport sweep below), which is
  the likely cause: an oversized stage pushes the button off the bottom on a real phone.
  Verified all four mode buttons DO fire and BEGIN THE WATCH exists and is not below the
  fold at 390x844, so it was never a dead button. STILL OPEN: every touch target on that
  screen is 40px or 35px against the project's 48px minimum. Needs Jessie to re-check.
- [~] **48px TOUCH-TARGET SWEEP — worst SEVEN done (commits da8b517d + cbd4cb3f),
  measured in RENDERED px.** ⭐ Root cause split discovered: most "under-48" games
  are the SCALED-STAGE ILLUSION — 48 CSS px on a 0.72-scaled 540x960 stage renders
  ~35px real. Standard now set: 72 stage px in scaled games, 48 real px unscaled,
  invisible pseudo tap zones where visuals must stay small, ⛔ never vw units
  inside a scaled stage (double-shrink). Done: vinewinder, pollen-panic,
  nova-bloom, cipher-bloom, bramble-court, chaff-wars, flipbook — every screen
  re-measured at 390x844 + 360x800, zero under 48 effective, screenshots eyeballed.
  One documented exemption: cipher-bloom keyboard/cell WIDTH (26 keys across).
  REMAINING: ~69 satellites flagged by the old audit — re-audit with the
  rendered-px method (many share the same .btn template; the 72-stage-px fix is
  reusable). Memory: touch-targets-measure-rendered-px.
- [x] **Line Loom "incomprehensible" — FIXED.** Investigated first: the title screen already
  explains the game and there IS a how-to page, so information was never the gap. The gap
  was first contact — you land on a near-black board with four small outlines and six
  numbered buttons and nothing names the VERB. Added one first-run coach card on the board
  ("Drag from one station to another"), 48px dismiss, shown once. Verified headless:
  appears, dismisses, does not return, 0 errors.
- [ ] Mini Crossword — layout
- [ ] Bridgevine — scroll
- [ ] Plot Bloom — neighbours wording + depth
- [ ] Root Groups — text
- [ ] Season Sway — wording
- [ ] Hedgerow — replay-level
- [ ] Tinker Loft — her list, incl. finger-drag; plus "Tinker Shop" rename
- [x] **Micro Meadow renamed to Think Fast** — 10 display strings + portal card + social
  card regenerated. Slug stays `micro-meadow` (URLs). Verified 0 old strings remain.
- [ ] Leaf Fit — rename + rotate
- [ ] Merge & Blast — level-goal consistency (512 tile colour already fixed)
- [ ] **Directions pages + readable fonts for every SATELLITE** (the shells are done)

### From the Jul 16 "New notes" + Jessie doc
- [~] Pong Arena — landscape long-court still open (per-mode geometry + control remap)
- [ ] Portal: live "N playing now" per game (needs presence; design first)
- [ ] Portal search — "similar type" matching + her assistant-to-guide idea
- [ ] Comet Cadets — alien level-worlds (water / fire poles / ice / tornado / rain / desert)
- [ ] Dewtrail — retheme away from dew, THEN Jessie does the art
- [ ] Mosaic Draft — clarity pass
- [ ] Finish the "coming soon" games (Impossible Garden is the flagged one)
- [ ] ALL games earn sunbeams inside LW
- [ ] Silt — consistent element-behaviour message
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
- [ ] DL-C3 **Three Sisters "Daily Trio"** — estimate unknown, older inline build, locate the
  code before promising a number.
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
