# HANDOFF — the fleet art pass
**Written Sep 04 2026 by Opus, for Fable, mid-session. Everything below is on disk and UNCOMMITTED.**

## SESSION STATE — the next action

**2026-09-05 early, Fable.** After Keepsies (its own handoff), the audit's cross-cutting jobs went down
in lift order, each measured before and after and looked at, each its own commit on `add-sproing-jumper`:
JOB 4 header clipping (`e0164451`, with JOB 3), JOB 3 the ♫ chip (same), JOB 6 Queen Bee's 20 MB boards
(`1e0322cc`), JOB 5's code half (`ab99df55`), JOB 7's five native cards (`a6df3f35`), the piece rig's
dice and discs (`bf609f16`), and the four shell fixes plus two boards from the first pass (`40466406`).
JOB 10's nine boards do not reproduce on this tree (row in §3). Everything is on the branch; main
carries what the other session deployed under its Jimothy push (bc7be9c2, 40466406) and nothing after.

**Still open, in order:**
1. **Three Director calls in §5.** Unchanged. Plus JOB 8 (emoji as art, a policy) and JOB 9 (delete the
   16 MB of phone photos in `assets/games/pipe/repello/`, move masters to the vault), both his nod.
2. **JOB 7's satellite cards** (row in §3): three need their own taps written down, two have no page.
3. **JOB 5's paint**: Glyph Forge, Tarot Run and Tomato Man art from the image lane; briefs exist.
4. **JOB 1's art**: the backdrop hook is live for 66 natives and `assets/games/bg/` is empty; the specs
   are in `FLEET-ART-AUDIT-SEP04.md` under Backgrounds & backdrops. That is the image lane.
5. The long tail: 900 CSS jobs and 747 art files named per game in the two DETAIL files. Five
   batches are done (rows "Long tail 1" to "Long tail 5" in §3): the seven poor games' no-paint jobs,
   the 3.4 MB button, and the no-paint items down to row 60 of the ranked table (seven batches).
   Next is row 61 on, same method: read the game's CSS to do list, shoot before, patch, shoot after,
   look, one commit per batch. `scripts/fleet/shot.mjs <path> <out> "tap,tap"` is the camera.

Tandem tree still: `git add` fenced paths only, `git pull --rebase --autostash` first.

---

## 1. What this is

Stephen: *"start looking over a lot of the old games. a bunch of them could do with a lot more
graphics, backrounds, and css. make a massive list of everything for us to work from then we will
go through it improving all of the games."* Then, later: *"whats the move? we also have meshy to
make 3D assets now."*

So there are two halves: **the audit** (done) and **the fixes** (started).

---

## 2. The audit — DONE, 186/186 games

Every carded game launched at 375x667, photographed 3x (boot, in play, a few seconds on), and
**every frame opened and read**. 558 shots, 555 with real content.

- `FLEET-ART-AUDIT-SEP04.md` — master: method, **10 cross-cutting jobs**, all 186 ranked, art batches, "checked and fine"
- `FLEET-ART-DETAIL-SATELLITES.md` / `FLEET-ART-DETAIL-NATIVES.md` — the per-game working list
- `FLEET-ART-FACTS-SEP04.md` — every structural measurement **with the command that re-derives it**
- Browsable, filterable, tickable (db-backed shared ticks):
  https://claude.ai/code/artifact/d1dd7447-0b05-4cae-8bfc-d6f85f1a9d09

**Result: 7 poor · 80 plain · 75 decent · 24 strong. 747 art files and 900 CSS jobs named.**
Every "looks broken" claim went to a second agent whose only job was to refute it:
**54 confirmed, 13 refuted, 0 unchecked.**

The whole rebuild pipeline lives in the session scratchpad and is re-runnable:
`shootv2.mjs` → `metrics*.mjs` → `build_bundle.mjs` → `wf-look.js`/`wf-verify.js` →
`collect.mjs` → `render.mjs`/`batches.mjs`/`assemble.mjs`/`build_page.mjs`.

---

## 3. Shipped this session — 4 fixes, each MEASURED (verified by Fable, committed 40466406)

| fix | file | measured before → after |
|---|---|---|
| **Bebas Neue now loads** | `play/shell.css:7` | Sprout ENTER key **6px overflow → 5.3px clearance** each side |
| **Per-game backdrop hook** | `play/shell.js` `init()` | file present → applies with scrim; absent → old gradient untouched |
| **JOB 4: header no longer clips "Sign in"** (Fable) | `play/shell.css`, `play/shell.js`, `music-player.js` | with the SDK's own `(+8 pending)` chip: overflow **17px→0 at 320, 15px→0 at 375**, header 61px on one line at 320/360/375/390. Cause was the music button's attract state forcing `min-width:96px` in the header row (Stephen's 7/17 glow-up), now glyph+pulse under 400px; feedback button hidden under 400 (was 360); "pending" word dropped under 400; wallet's "☀ 0" no longer wraps |
| **JOB 7 (native half): five cards re-shot** (Fable) | `assets/games/thumbs/{chess,c4,lights,pipe,slider}.png` | were 128 to 256px paletted at 7 to 15 KB (Chess 9 KB); now 400x400 from the play frame, board element clipped exactly (Chess the inner 8x8 with every rank, Four in a Row with ten discs on it, Pipe without its instruction line), 256 colour dithered, 57 to 133 KB; looked at on a labelled sheet (⛔ an unlabelled sheet had me reading Pipe as Lights) |
| **Long tail 1: Shut the Box, Petal Alchemy, and the 3.4 MB button** (Fable, Sep 05) | `assets/games/new-game-btn.png` (256px cut, master beside it), `games/_inline/doubleshutter.js`, `satellites/petal-alchemy/index.html` | the NEW GAME plaque six inline games load was 1529px and 3.4 MB for a ~95px button: 98 KB now, same path, no code change. Shut the Box: the nine line rules block (9.6px at 375) folds behind a HOW TO PLAY disclosure at 0.72rem and the whole board, ROLL, STYLE and NEW GAME sit above the fold. Petal Alchemy: tray slots lifted so they read, Blooms off the edge, count legible, shelf hint in the empty half, primary button to house green with pink kept for the title. Before and after shots looked at. Still paint: the apothecary bench, the covered tile, the walnut table |
| **Long tail 2: Nonogram Bloom, Abduct 3D's how-to, Rabbit Ronin's slab, and the chip on canvas games** (Fable, Sep 05) | `games/_inline/picross.js`, `satellites/abduct-a-chameleon/abduct-3d.html`, `satellites/rabbit-samurai/index.html`, `music-unlocks.js` | Nonogram: the size select was a 250px empty box stretched to the plaque's height (56px pill now), the plaque capped at 96px, the grid on a centred plate instead of hugging the left, filled cells solid with a light edge, clue floor 12px; before, after and a filled board looked at. Abduct 3D: the how-to sheet was 5% see-through (the HUD ghosted through the rules) and its kicker sat under the portal back arrow; opaque and padded 64px now, the painted backdrop still the image lane. Rabbit Ronin: the red Start Dojo slab is an outline. ♫ chip: a full screen canvas scored as a wrapper (free everywhere) and the chip sat on Rabbit Ronin's canvas HUD; canvas scores like text now, HUD-band text worse than a canvas corner, candidates sides first (a canvas game ties every corner: the sides are play area, the bottom is pads, the top is HUD), keep-current only for a free corner, a re-check 1.5 s after any tap and a slow standing cadence; a 2d canvas is sampled (a flat patch is near background, a drawn patch is content) and a canvas the looked-through overlay does not contain is the overlay's ground (Burr Blast's story screen over its idle game canvas). `window.SWSMusic.corners()` lists every candidate with its score and `.reseat()` runs one, for probes. Probed after on eight satellites with the scores printed |
| **Long tail 3: Sudoku, Rhythm and Vine, Breathing Garden, Sea Battle** (Fable, Sep 05) | `shared.css` (Sudoku block, `.gsl`), `games/sudoku.js`, `games/rhythmvine.js`, `games/breathing.js`, `games/battleship.js` | Sudoku: 3x3 rules in gold with every box's left wall closed, the board on a lip with a shadow, clues quiet cream and entries loud sage, the pad tightened so the top row clears 667; every native's `.gsl` select carries a chevron now. Rhythm and Vine: key hints 0.55→0.7rem, lanes visible, hit line 5px with a second glow, pads that read as pads. Breathing Garden: the vessel canvas has a lip and glow, technique pills equal height, badges at the floor, the chosen pill glows. Sea Battle: coordinates 0.52→0.7rem and legible, water checker readable, difficulty and special buttons gold bordered with cream labels, chip captions up (the placed caption is the tick alone, the word wrapped five chips to two rows and pushed the board below the fold; grid bottom 774→705), chips share the row. Before and after pairs looked at |
| **Long tail 4: Stone Garden, Story Seeds, Root Maze, Mosaic Garden, Mancala** (Fable, Sep 05) | `games/stonegarden.js`, `games/storyseeds.js`, `games/rootmaze.js`, `games/mosaic.js`, `games/seedsow.js`, `scripts/fleet/shot.mjs` | Stone Garden: +N labels 10px sans to 12px DM Mono, stars visible, HUD strip 0.8 alpha, tray stones 8px in from the edge (a wide flat stone was cut by the frame). Story Seeds: the prompt is one card (emoji, line, gold category under a rule), the textarea has an inset, and Crimson Text is loaded by this game alone so the prompt stops falling back to Georgia. Root Maze: the treasure glyph 0.34 to 0.55 of a cell (a 15px treasure at 44px). Mosaic: ghost wall tiles at .45 with a dashed outline, floor slots at 0.8rem with the red pulled, action labels stop wrapping. Mancala: pits 48px, rules card 0.8rem at 78vh, the banner wraps inside the board. Play frames looked at for all five. Left: Root Maze's arrow pads (38x20, the PAD math) and hint banner, Mosaic's sticky action row and board borders, Stone Garden's horizon band |
| **Long tail 5: seven satellites' floors, targets and contrast** (Fable, Sep 05) | `first-sprout`, `garden-td`, `leaf-fit`, `tangent`, `star-field`, `power-scalers` (index.html each), `music-unlocks.js` | First Sprout: five 11px labels to 12px, the tend hint cream, the narration line 13.5px near cream. Garden Guard: level stars 11 to 13px, keeper pill 10 to 12px, boss rows gold bordered. Tetroku: the Willow board's cell and grid lifted so an empty board is visible. Tangent: tool labels 11/11.5 to 12.5/13px, the ground a gradient so the bottom strip separates from the sky. Star Field: board rim glows into its ground, helper text 13 to 17px and the count 15 to 20px in a 0.694 scaled stage. Power Scalers: emoji picks 44 to 48px. The music card's minimise button 40 to 48px everywhere. Chip related items in these lists (First Sprout `#hud`, Season Sway's canvas HUD, Tetroku's score) are moot under the new placement and were left. Before and after pairs looked at; Tetroku and Star Field also in play. Left: Season Sway's card stroke and meter ticks, Star Field's TINTS ramp and Power Scalers' palette (design calls), Garden Guard's level thumbs (paint) |
| **Long tail 6: Bloom Wheel, Garden Lines, Bee's Pollen Sort, Silt, Rule Root, Cipher Bloom** (Fable, Sep 05) | `games/_inline/bloomwheel.js`, `games/gardenlines.js`, `games/colorsort.js`, `satellites/{silt,rule-root,cipher-bloom}/index.html`, `music-unlocks.js` | Bloom Wheel: guide circle and spokes from .06/.03 to .18/.10 and the hub lit, the PETALS and DRAW MODE labels from 5px to 0.62rem, MORE 48px at 0.7rem, the duplicate cream swatch a rose, a rim on the canvas. Garden Lines: tiles get an edge, empty in-bounds cells read before the first tile, the turn label at the floor. Pollen Sort: tubes 52px minimum, the level caption 0.72rem cream. Silt: the how-to scrim thinned so the wash shows, Back clear of the song pill. Rule Root: chapters in four aligned columns, locked numbers readable. Cipher Bloom: buttons with an inset highlight and a bottom edge; its "intro blurb" is none of the three 13px rules and no canvas font, left. ♫ chip: two more candidates at three-quarters height (a menu ending above its footer leaves its free band there; the chip sat on Cipher Bloom's Gallery button with 150px of dark below). Pairs looked at, Garden Lines in play |
| **Long tail 7: eight natives, rows 43 to 60** (Fable, Sep 05) | `games/{dailybloom,colorgarden,recall,numbergarden,sprout,pottingbench,petalfall}.js`, `games/_inline/checkers.js`, `shared.css` | Daily Bloom: the exercise card centred in the column, title 1.05 to 1.3rem, description legible, progress dots 12px with a filled done state, option tiles on a surface. Color Garden: BRIGHTNESS label 8.8px to 0.7rem, the hex bar 44 to 28px. Memory Meadow: card names 0.5rem at 60% to 0.72rem at 85%, the panel centred instead of 380px of dead black. Fast Math: mode and stats rows 0.62 to 0.72rem, the rules scrim .88 to .95 so the keypad stops showing through. Word Sprout: board min(260px,70vw) to min(320px,86vw), ENTER fits its cap. Speed Sort: three captions under the floor to 0.72rem. Checkers: light squares from 4% brighter than dark to readable, pieces 78 to 88% of the cell, cells 44px, the difficulty select 48px instead of stretched to the plaque. Block Drop: the control row lifted by the safe area, the hold glyph a supported character, pieces re-keyed to house tints. Pairs looked at |
| **Wild Wardens: not touched here** (Fable, Sep 05) | none | `satellites/wild-wardens/` is a vendored Expo web build (`_expo/`, `VENDORED.json`); its four jobs (modal max height and pinned GOT IT, safe area padding, exit button z-order, one filled primary) are edits to the upstream React Native source, not to the bundle |
| **JOB 7 (satellite half): not done** (Fable, Sep 05) | none | Sprout Dice, Rootbound and Twin Lanterns each need deeper navigation than a start tap (the first playable floor is at the bottom of the climb list; Rootbound's bed cell is not a button and a text match hits the grid; Twin Lanterns' path wants two named lanterns first); Whack Box and Jade Garden have no page under `satellites/` (Jade Garden is a spec in `assets/`). The shooter is `scripts/fleet/satshoot.mjs`; each needs its own three taps written down |
| **JOB 10's nine boards: not reproduced** (Fable, Sep 05) | measured, no change | with the overflow un-clamp in place, `documentElement.scrollWidth - innerWidth` and the widest element past the right edge both read **0 at 375 and 320, boot and first play frame, how-to sheet open or closed**, for petalfall, farkle, reversi, stopten, merge, backgammon and c4 (boards confirmed rendered by screenshot). Stop Ten's `.st-mode` at x 856 sits inside an overflow-hidden carousel. Whatever produced 4 to 79 px on Sep 04 is not on this tree by this method; if a board scrolls on a phone, measure the state it scrolls in first |
| **JOB 5 (the code half): templated art slots no longer fetched** (Fable) | `satellites/glyph-forge/index.html`, `satellites/tarot-run/index.html`, `tarot-run/manifest.json` | both loaders skip a slot still carrying its template and the static `enemy-{id}` / `enemy-?` attributes are empty until the game sets a real id; headless: **0 malformed art-slot requests** in both (legit slots still ask). Tarot Run's manifest points at the arcade's shared icon so an installed app has one; the painted art itself is still the image lane |
| **JOB 6: Queen Bee ships cuts, not masters** (Fable) | `games/pollen.js`, `tools/cut_cards.py`, `assets/games/masterpollinator/**/*-card.jpg` | a twelve card board: **15 art requests, 20.2 MB → 0.5 MB**; 101 masters (134 MB, opaque RGB) cut to 512px JPEG q82 (4.4 MB, ~20-50 KB each); board and inspect view looked at, the inspect box is 528 device px so 512 is 1:1 |
| **JOB 3: the ♫ Music chip stops landing on game UI** (Fable) | `music-unlocks.js` | scorer: header/HUD bars and bordered panels are never "free"; candidates bottom row first (a title lives top left); reseat at 3/6/10/15s and on resize, never a dragged chip; 48px glyph when nothing is free; scrim. Measured on Petal Alchemy (off `#pa-top` to empty black after the tap), Rootbound, Deepwell (compact at the LAMP card's empty end, was on the row), Aura Farm, Bridgevine, Burr Blast (bottom-left over empty dark) |
| **`overflow-x` un-clamped** | `play/shell.css` | sticky header **0/45 → 45/45**; 9 of 66 now sidescroll |
| **Meshy double-spend** | `satellites/ripcord/tools/forge3d/meshy_api.py` | kill+rerun **2 POSTs → 1** |

### Detail worth keeping

- **Bebas.** `shared.css` styles 183 rules in it and 38 files under `games/` ask for it, but only
  `index.html`/`wild.html` loaded it. All 66 natives fell back to a wider system sans, so labels
  sized for a condensed face clipped. Some "clipped label" findings in the detail docs are THIS
  and will now be gone — **recheck before hand-fixing any of them.**
- **Backdrop.** Drop `/assets/games/bg/<id>.jpg` and that game has a backdrop. Folder exists, empty.
  Costs one 404 per game with no backdrop; a generated `index.json` manifest would remove that if
  Stephen dislikes it.
- **Overflow.** The clamp did not prevent bugs, it **concealed** them. The 9 now-sidescrolling
  boards are a precise worklist: doubleshutter **108px** · petalfall 79 · farkle 71 · reversi 34 ·
  wordsearch **16** · stopten 10 · merge 7 · backgammon 5 · c4 4. Shut the Box and Word Search
  were already independently confirmed as having **untappable** content, so they are real bugs
  either way. Four are <10px.
- **Meshy.** Credits are spent at the POST; the task id lived only in a local var and the sole
  rerun guard was "is the .glb on disk" — false in exactly the kill case. Now `meshy-tasks.json`
  is written **and fsync'd** before polling; a rerun RESUMES; success clears it; FAILED clears it;
  a 20-min timeout KEEPS it. Guard: `python3 tools/forge3d/test_no_double_spend.py` — spends
  nothing, and was verified **both ways** (pre-fix file → 2 POSTs and no ledger; fixed → 1).

---

## 4. The 3D lane — `tools/pieces/`

**⚖️ The call I made: Meshy balance is 2640 credits and I spent ZERO.** Meshy is image-to-3D and
needs a reference image per asset. A d6 is a rounded cube with recessed pips — Blender makes it
exactly, free, with the pip COUNT right rather than approximately right. **Spend the credits on
organic/ornate shapes that are expensive to model by hand** (creature pawns, carved tokens,
sculpted showpieces). Both routes render through the same rig so they still match.
⛔ `forge3d` is **NOT** Meshy — it is Blender procedural (that is the 366 glbs in the repo).
Meshy is only `meshy_api.py`.

- **`tools/pieces/rig.py`** — ONE locked ortho camera + fixed 3-point light + one material set +
  512px transparent PNG, so anything through it looks photographed on the same shelf.
  `--list` for sets; `--set dice`. Sets: dice, discs, rings, stones, tiles.
- **`tools/pieces/cut.py`** — masters → `out/<set>/ship/` at 128px.
  Dice: **1940KB → 81KB, 96% smaller, 16KB per sprite**, and the pips still read at 48px.
  ⛔ **Wire games to `ship/` ONLY.** Shipping masters is precisely the Queen Bee bug this audit
  found (`games/pollen.js` loads 101 PNGs at 1024x1024, 1.5-2MB each). Do not recreate it.

**Done: the dice set (5 pieces), validated at 48px board size.**
**Caveat on record: the dark die loses its silhouette on a near-black ground at 48px — it is a
light-surface variant only.**

### Which games the five sets actually serve — 18, counted by identity
| set | games |
|---|---|
| dice | Yacht-Sea, Farkle, **Shut the Box (poor)**, Backgammon, Sprout Dice, Snakes & Ladders |
| discs | Four in a Row, **Checkers**, **Reversi**, **Mancala**, Lights Out |
| rings | Tower of Hanoi, **Sunforge** |
| stones | **Stone Garden**, **Go (Living Stones)** |
| tiles | **Mosaic Garden**, **Garden Lines**, ~~Jade Garden~~ (already strong, skip it) |

**bold = currently plain or poor.** 74 art asks across the 18.
⛔ An earlier regex said "148 games" — it was matching prose (`disc` in "discovered", `ring` in
"during"). 18 is the counted number. See §6.

---

### 4b. What the first cuts taught (Fable, Sep 04 late)

- **Look at the numbers, not only the sheet.** The dice looked fine on a contact sheet and every
  one had its top vertex sliced flat: the cutter's edge check found alpha 255 on row 0 of every die,
  and the opaque run there was already 199 px wide (of a 428 px equator), so about 57 px of die sat
  above the frame. `rig.py` now frames per set (`FRAMING`: dice 1.75 with the camera lifted 0.20 up
  its own screen axis; discs and the default stay at 1.55). Re-rendered with `--force`.
- **The shadow must end inside the tile.** The soft key throws a contact shadow that ran off the
  bottom left of every sprite (alpha 40 in the corner on discs, 55 to 66 on dice), which on a
  butted board draws a straight line where the shadow stops. `cut.py` fades alpha to zero over the
  outer fifth, weighted so anything under half alpha (all shadow) fades fully and the opaque piece
  is untouched; a plain fade made the die tops translucent (217), a linear weight let border shadow
  keep a third of itself (alpha 20). Every sprite now reads 0 on all four edges except a piece that
  genuinely touches the frame, which is the framing's fault, not the cutter's.
- The honest test is a sheet of tiles BUTTED against each other on a tan ground, not sprites spaced
  out on dark (that hid both faults).

## 5. ⚖️ OPEN — Director calls, do not guess

1. **The 9 sidescrolling boards.** ✅ **Fable, Sep 04 pm: the two with untappable content are FIXED
   and measured** (Stephen said "get to work", and these were bugs, not a call):
   - Shut the Box: `shared.css` `.ds-row` goes to five columns under 480px. Measured at 320 and 375:
     **18 of 18 tiles on screen at exactly the 48px floor, sidescroll 0** (was 108px over, tiles 8-9
     off screen so the game could not be finished).
   - Word Search: `shared.css` `.wc` drops its 36px floor under 480px. Measured: **100 of 100 cells
     on screen, 33px at 375 / 28px at 320, sidescroll 0** (was 16px over, 10th column unreachable
     with words placed in it). Drag-select board, so cell size is not a tap target.
   The other seven (petalfall 79, farkle 71, reversi 34, stopten 10, merge 7, backgammon 5, c4 4)
   are still open and are per-game CSS in `FLEET-ART-DETAIL-NATIVES.md`.
2. **Commit?** Nothing is committed. Fenced paths would be: `play/`, `tools/pieces/`,
   `satellites/ripcord/tools/forge3d/`, and the four `FLEET-ART-*.md`.
3. **Which piece set next?** My recommendation was **discs** (5 games, 3 currently plain),
   then stones (both plain).

---

## 6. ⛔ TRAPS — every one of these cost real time today

**Capture / measurement**
- `?dev=1` does **NOT** open the 27 workbench-gated games. `localStorage.sws_dev_ok='1'` does.
  Without it all 27 photograph as the same "IN DEVELOPMENT" card.
- **`body.innerText` reads the game UNDERNEATH an overlay.** A how-to modal appended at the end of
  body left the first 500 chars showing the game. Detect the overlay ELEMENT (`#shell-dir`).
- A blind centre-tap + Escape navigated 7 games OUT to the arcade portal. Guard on the URL.
- "How to play" matches `/play/` — the advancer kept opening the instructions it was skipping.
- ⛔⛔ **`pkill -f "[s]hoot_all.mjs"` killed MY OWN SHELL** — the shell's argv contained the literal
  string. The bracket trick does not save you. **Kill by PID.**
- Music `/music/v1/*.mp3` 404s in local capture are expected — audio is not in git.
- `scripts/catalog.mjs` builds every native URL as `/play/<id>.html` and ignores GAMES row field 5,
  so **Pom Pond (external) looks like a missing file**. `portal/catalog-tags.json` inherited the
  same wrong URL, and a verifier reading only that called it a blocker. Check the source row.

**Reasoning**
- ⭐⭐ **A state-dependent bug reads GREEN on a fresh probe.** The header clip only happens once the
  wallet has a pending chip; a clean-browser probe said 0/12 fine. It had even been "fixed" once
  before, tuned on the empty-wallet state. → `feedback_state_dependent_bug_reads_green`
- ⭐⭐ **You cannot count a free-text field.** A prefix regex produced "126 of 126 games have a
  readability fault". Count something MEASURED instead, and say so.
  → `feedback_prose_fields_cannot_be_counted`
- I called the natives' empty lower third a margin bug; measured, the gap is **6px**. It is
  composition, not CSS. Do not go hunting for a margin.

**Blender**
- ⭐⭐ **sRGB fed in as LINEAR.** A CSS hex is sRGB, `Base Color` wants linear. House sage #7ab356 is
  sRGB(.478,.702,.337) but linear(**.194,.451,.093**) — 2.5-3.6x too bright. Everything rendered
  pastel and I first misdiagnosed it as the key light. `srgb()` in rig.py converts.
- Pips were flattened on **world Z for every face**, so the four side faces had pips bulging out.
  Flatten along the face's own normal.
- This Blender is **built without OpenImageDenoiser** — `use_denoising=True` hard-errors. Buy the
  clean image with samples (160).
- Cream pips on a sage die read as **icing blobs** and the count was unreadable at sprite size.
  Dark, recessed pips.

---

## 7. The standard this work is held to

From CLAUDE.md, and it is the reason four of the bugs above were caught at all:

> **LOOKING IS PART OF THE JOB.** A visual change is NOT done until you have LOOKED at it.
> SHOOT IT. READ THE IMAGE. Name three things wrong in it before Stephen does. Report what you
> SAW, not what you wired. A green test is not a look.

Every render in this session was opened and judged. The first dice pass passed every automated
check and was wrong in three ways that only the picture showed.
