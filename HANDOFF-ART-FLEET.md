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

**2026-09-05 morning, after Stephen's Shut the Box report** ("horribly sloppy, it cuts half way across the 8, the dark
garden dice have a huge white grid border, now I'm nervous about everything"): the row "⛔ Shut the Box" in §3 is the
record. Two process holes, not two bugs. (a) Every native pins `shared.css?v=`, and I changed shared.css three times
without moving the pin, so three batches of CSS shipped to nobody and his phone ran seven-week-old rules. (b) Every check
ran at 375 and 320 in a fresh headless profile, which means the default skin only; his phone is 412 wide with Dark
Garden dice selected. Standard from here: 412x915 in every check, every fleet skin, `scripts/fleet/overflow.mjs` on every
touched page, `scripts/fleet/bump.sh` in the same commit as any shared file. The 412 overflow sweep of all 67 natives
is the re-verification of the earlier batches; its result goes in a §3 row, then 375 and 320, then the em dash sweep.

**Still open, in order:**
0. **The re-verification above**: 412, 375 and 320 overflow sweeps DONE and fixed (two rows in §3, nine pages, all clean at all three widths). Dash sweep DONE (row in §3). Long tail 8 to 12 DONE (rows 61 to 140). Exclamation pass DONE. Satellite copy dashes DONE (Stream Hop excluded). Satellite overflow sweeps 412/375/320 DONE. Next: long tail 13 from row 141 (Master Pollinator, 15 Puzzle, Root Rush, Pyramid, Farkle, Flood, Five in a Row, Garden Spades), then the natives past row 160.
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
| **⛔ Shut the Box, on Stephen's phone, Sep 05 morning: "cuts halfway across the 8, the dark garden dice have a huge white grid border"** (Fable) | `assets/dice/dark/d1..d6.png` (cut, masters beside as `-master.png`), `tools/cut_dice.py`, every `play/*.html` (`shared.css?v=20260905a`, `shell.css?v=13`, `shell.js?v=35`) | Two things my checks could not see. (1) The cut 8 is the nine column rule: his phone was serving an older `shared.css` because every native pins `shared.css?v=20260718` and I changed that file three times without bumping the pin (the caching law says bump it every time; the SW is network first, the edge and browser caches are 4 h, so a play earlier in the night saw the old rule). Every pin is bumped now. (2) Five of the six Dark Garden faces were 1254px opaque masters exported over a light checkerboard matte, 2 MB each; in the game's `object-fit:cover` box that is a die inside a white grid. The audit and I only ever rolled the default Parchment set in a fresh profile. `tools/cut_dice.py` floods the matte from the corners (light grey counts, the pips sit inside the die's dark rim and cannot be reached), crops, squares on transparent, ships 512px with alpha 0 at every corner, about 480 KB each (was 13 MB a set). Looked at with Dark Garden selected at 412. ⛔ From here every native check runs at 412 by 915 as well, and any game with a fleet skin (dice, cards, wardrobe) is shot in each skin. (3) A new DOM probe, `scripts/fleet/overflow.mjs`, compares scrollWidth with the DEVICE width (⛔ `innerWidth` follows the layout viewport: mobile Chrome widens it to hold wide content, 412 read 443 on Reversi, so scrollWidth against innerWidth is always "clean"). It found Reversi 31 px too wide on every phone (a 92vw board plus its row-number gutter and two paddings; the right-hand row numbers had been off screen since it shipped) and Backgammon 4 px over (98vw inside a 12 px page padding). Both clean at 412, 375 and 320 now; Reversi looked at. (4) Every `.gsl` select and the STYLE pill stretched to the plaque's height in a plaque row: `align-self:center` on `.gsl`, `align-items:center` on the two flex rows (Shut the Box, Mastermind). (5) The Picross plaque was 96 px by my own earlier override, back to the fleet clamp. (6) Checkers rules line carried an em dash. (7) `scripts/fleet/bump.sh` re-pins shared.css (and shell.css/shell.js with `shell`); ⛔ run it in the SAME commit as any change to those files. The music chip's "♫ Music" label now waits for 480 px so the title is not squeezed to "Shu…" at 412. Dark Garden masters stay UNTRACKED beside the cuts (12 MB; the old blobs are in history: `git show 631ad9a2:assets/dice/dark/d1.png`) pending JOB 9. Next: the 412 overflow sweep over all 67 natives, then the em dash sweep across player copy (rough count: kakuro 9, vinewords 6, rootmaze 5, stopten 4, rootflow 4, pottingbench 3, set 3) |
| **Re-verification: horizontal overflow, all 68 native pages, 412 / 375 / 320** (Fable, Sep 05) | `scripts/fleet/overflow.mjs` (now skips children of an on-screen horizontal scroller and prints the top offender's chain with `DUMP=1`), `games/c4.js`, `games/_inline/farkle.js`, `games/petalmatch.js`, `games/petalfall.js`, `games/stopten.js`, `shared.css` (`.c4g` box), pins `shared.css?v=20260905b` | 412: 64 of 68 clean; over the edge were Reversi 31 px and Backgammon 4 px (found by hand first, row above), Connect Four 4 px (a board 8 px narrower than the viewport on purpose for 48 px cells, but centred in the padded column, so it hung 4 px off the right; now centred on the screen with a computed margin), Farkle 39 px (a non-shrinking four-button group beside a hint with a minimum width in a row that could not wrap; wraps now), Block Drop 42 px (three faults stacked: the pan's 100vw ceiling inside the shell's 12 px padding, ⛔ the board sized from `window.innerWidth`, which the first paint's overflow had ALREADY widened so the board was sized from a lie and kept the overflow forever, and a 62 px rail pair plus an 18 px cell floor that cannot fit 320; pan capped to its parent, board sized from the pan, rails clamp 48..58, floor 16) and Petal Match 2 px (a cast-shadow image 104% of the board; 102% now). 375: 65 of 68 clean; Block Drop again (same fix), Stop Ten 10 px (inline `max-width:440px` beat the stylesheet's 100% and a flex item's minimum is its widest child; `min(100%,440px)` + `min-width:0`), Merge 7 px which was a tile animation caught mid-flight (clean on two re-runs, not touched). 320: see the next row. Every fix measured clean at all three widths; Reversi, Connect Four, Block Drop (412 and 320) and Stop Ten looked at. ⛔ Lessons: a board sized in vw must subtract everything beside it; a pan's ceiling is its PARENT, never 100vw, because the shell pads 12 px; `innerWidth`, `clientWidth` on html and any ancestor of the overflow all follow the widened layout viewport, so size from an element the overflow cannot widen (the shell mount) or from `screen.width`; a probe must rank by page overflow, not by the loudest element, or the second fault hides under the first (Block Drop's play zone sat under its preview strip). Still open from the frames: the header title truncates at 412 when signed out ("Four in a Ro…", "Nonogram …"): the Sign in button is the widest thing in the bar and signed-in players get the room back; a call for the shell lane |
| **Re-verification, 320 x 568 sweep** (Fable, Sep 05) | `shared.css` (`.skg`, pins `shared.css?v=20260905c`), `games/trellis.js` | 65 of 68 clean. Sokoban 12 px over: the grid's `clamp(320px,96vw,480px)` floor cannot sit inside a 320 phone with 12 px of page padding, and 96vw sat 3 px from the right edge and 12 from the left on a 375 (floor 240, `max-width:100%`, border-box). Trellis 5 px of page overflow: the pan's inline `max-width:460px` beat the column and, as a flex item, its minimum was the 15 by 15 board (`min(100%,460px)`, `min-width:0`, `overflow-x:hidden`); its fixed rules overlay read as the top offender because a fixed `inset:0` box is as wide as the layout viewport, which is the SYMPTOM, so read the second offender when the first is position fixed. Merge 7 px was the same load-timing transient as at 375 (clean on every direct run). Block Drop and Stop Ten measured clean at 320 after their fixes above. Looked at: Trellis 320. ⛔ The pattern behind five of these nine: a pan or board given a ceiling in `vw` or an inline `max-width` inside the shell mount, which is `display:flex` with 12 px padding; a flex item's minimum width is its widest child, so `max-width:100%` in the stylesheet is not enough when an inline style or a child's own floor says otherwise. The fix is always the same three words: `min(100%, N)`, `min-width:0` |
| **No dashes in player copy** (Fable, Sep 05, `766b788e` + this batch) | 17 natives + `games/chess.js` (escaped `\u2014`), juniper, stonegarden, storyseeds, seedsow | 55 literal em/en dashes swapped (sentence dashes to commas or semicolons, score pairs to "34 to 30", empty values to a middle dot, empty lists to "none yet", unearned bonuses to 0) plus 11 ESCAPED ones the glyph search missed (`\u2014` in Chess's seven end-of-game lines). ⛔ grep the escape as well as the glyph. Exclamation marks: 180 in player strings; the rule on file says none unless a genuine celebration, so that is a judged pass, not a regex, and it is next |
| **Long tail 8: Word Search, Pixel Garden, Minesweeper, Reversi (rows 61 to 70) + the hidden live line** (Fable, Sep 05) | `shared.css` (`.wg` panel + letter contrast, `.ng` frame + `.x4`/`.x6` house colours, `.rv-score`, `.mg` clip), `games/wordsearch.js` (chips), `games/pixelgarden.js` (canvas edge, palette grid, 3-column tool and action grids), `games/_inline/reversi.js` (UNDO/HINT pair, status 0.7rem), `play/shell.css` (`.gu-bar`), 16 games' `ms()` lines; pins `shared.css?v=20260905d`, `shell.css?v=14`, `shell.js?v=36` | ⛔⛔ FOUND WHILE LOOKING: `play/shell.css` hid every native's `.gu-bar` to stop the old in-game toolbar doubling the header, but the bar's LEFT half is the game's own live line and 54 natives write it: Word Search's Found 0/6, Shut the Box's Rolls · Open score · Best, Stop Ten's attempts, Potting Bench's best. None of it had ever been on screen in the shell (Stephen played Shut the Box without an open score). The shell now shows the left half as a quiet centred 0.72rem line and hides the right half (multiplier + timer, the header has the wallet); `#_h` stays in the DOM. Then the 54 lines were read: 8 were the bare title (now empty, hidden by `:has(.gu-left:empty)`), 8 prefixed real information with the title (prefix cut: "attempt 0/3 · best", "best 3.20s", "day #12 · 0:00"), 38 stand. Word Search: grid in a panel with a shadow, letters .75 to .9 on a quieter tile, chips 26 to 34px with a warmer pending gold. Pixel Garden: canvas gets a gold edge and a dark halo, palette is a 6x4 grid of 48px chips (auto-fill capped at 318px so a 320 phone gets five across instead of an overflow), tools and actions are 3-column grids so GRID and PNG are no longer stranded alone. Minesweeper: sage frame + halo on the field, number colours 4 and 6 moved from off-palette blue/purple to the house winter ice and spring rose. Reversi: UNDO/HINT a fixed 132px pair, status 0.58 to 0.7rem, score row to the floor. Merge: every plant tile draws at 1.55x its cell on purpose, so a tile in the right column pushed the layout 7px past the phone whenever one spawned there (that was the "transient": it was the random opening); the board clips at its own padding now. All four measured clean at 412/375/320 and looked at; the tap-aware 412 sweep (start button pressed before measuring) is clean across all 68. Not done: the emoji chrome swaps (JOB 8, his call), the Pixel Garden disclosure for the action rows |
| **Exclamation pass, judged** (Fable, Sep 05) | 18 natives | The rule on file (tutorial plan) is no exclamation points unless a genuine celebration. 180 in player strings were read: wins, perfects, new bests, Yahtzee, Petal Match's match callouts, Farkle's HOT DICE and the like stay; 47 instructions, statuses and errors lost theirs ("Tap ROLL to begin", "Hit, sent to bar", "Check", "Your turn", "Copied", "Root rot. Tap NEW", the nine Fast Math "Go, 60 seconds" starts, Mancala's rules aside). ⛔ This is a judgement per line, never a regex |
| **Long tail 9: Dew Trail, Go, Vine Words, Root Flow, Four in a Row (native rows 71 to 99)** (Fable, Sep 05) | `games/{dewtrail,livingstones,vinewords,rootflow,c4}.js` | Dew Trail: tiles solid #151a12 with a .35 border, the grid inside a `.dt-board` (gold hairline, inset shadow), the start waypoint gets a sage fill and a gold ring, the hint 0.78 to 0.82rem in cream. Go: the margin was a whole cell so a 4x4 puzzle sat as a small cross in a big brown square; margin is now 0.55 of a cell and the grid fills the board, lines #3b2a16 at 1.2, progress dots 12px at .55, a drop shadow under the board. Vine Words: it re-homed the hidden bar's children into its own HUD, and once the bar was visible again that moved BOTH halves (the multiplier and timer wrapped it onto two lines); it now takes the left half only, sticky at the top in cream 0.85rem; PAUSE is plain text (the pause glyph is an emoji and cannot be tinted, and two other lines rewrote the label), SUBMIT gets a sage enabled state. Root Flow: the bed has an inset shadow and a firmer edge, the three off-palette hues (blue, cyan, purple) become winter ice, muted teal and mauve, pips 14 to 22px with a 12px glyph, buttons 0.74 to 0.8rem. Four in a Row: each hole gets a bottom lip, the board a 44px sage glow, swatches 34 to 42px, the win pulse a wider gold halo. All five measured clean at 412/375/320 after the start tap and looked at. Root Flow's controls are a 2x2 grid with HINT primary and its pan is `min(100%,560px)` (its ceiling was 100vw inside the shell padding, the same pattern as Stop Ten and Trellis) |
| **Satellite overflow sweep, 412** (Fable, Sep 05) | `scripts/fleet/overflow.mjs /satellites/<slug>/`, `satellites/tarot-run/index.html`, `satellites/letter-launch/docs/styles.css` | 119 satellite pages, 117 clean. Tarot Run 36 px: the title curtains are skewed and shifted 12 px past both edges on purpose and nothing clipped them, so the title page panned sideways (`#title-screen{overflow:hidden}`). Letter Launch 75 px: seven children in a 54 px no-wrap top bar summed to 508 px on a 412 phone and the restart button sat off the right edge; under 440 px the pills tighten, two of the three preview tiles hide, icon buttons go 34 to 30 (under 340 the Score label and help button hide too). ⛔ Letter Launch's `index.html` only redirects to `docs/`; probe `/satellites/letter-launch/docs/`. Not yet swept: satellites at 375 and 320, and satellites after a start tap |
| **Long tail 10: the five solitaires + Lights Out (rows 100 to 110)** (Fable, Sep 05) | `games/{spider,tripeaks,klondike,freecell,golf,lights,_cards}.js`, `shared.css` (`.gc-empty`), pins `shared.css?v=20260905e` | TriPeaks: the 10-card row gets 16px of air a side instead of kissing the bezel; covered peak cards were opacity .5 black slivers, now a dark scrim with a lit gold top edge so they read as cards. Klondike and Spider: controls in a 2x2 grid (they wrapped 3+1), Style off the 0.7rem floor, tableau 10px off the bezel, disabled Undo at .65. FreeCell: FREE labels 0.48 to 0.72rem at .85 alpha, empty cells a solid inset slot (shared `.gc-empty` too, so the top row reads as one group with the foundations). Golf: the stock count 0.62 to 0.8rem on a dark plate, the empty label off the floor. Lights Out: the photo fades into the page through an inset-shadow overlay (an inset shadow on the wrapper itself paints UNDER the image), Reset loses the blue system emoji, and the stat strip is back via the live-line fix. The deck picker's tag is 'Botanical reskin' at 0.7rem with overflow-wrap. ⛔ REFUTED BY LOOKING: the audit's 'centre the mount vertically for the card games' was built (`body[data-game=…] #fg-ag{justify-content:center}`), shot at 412x915, and read as the board falling to mid-screen under a 350px void; reverted, pins put back. Not done: the warm paper card face (the face colour lives in the deck art, not a CSS rule), Golf's '35 left' placement. All six clean at 412/375/320 and looked at |
| **Satellite copy: no dashes** (Fable, Sep 05) | `scripts/fleet/dashes.py`, 70 files across ~100 satellites (Stream Hop EXCLUDED: Jimothy's copy, Steam release Sep 18, his call) | The tool reads only what the player sees (HTML text nodes, title/aria-label/placeholder/alt, JS string literals incl. inline scripts; comments and code untouched) and swaps by context: 'a — b' to 'a, b', a capitalised clause to '; ', labels and all-caps to ' · ', '3–5' to '3 to 5'. 48 changes in Letter Launch first (read line by line), then 818 across the rest after two sampled dry runs; 43 literals that were ONLY a dash (delimiters or placeholders) were left alone and listed. Every touched .js and inline script parses (one Ripcord script fails identically at HEAD: it is a build placeholder `/*__LADDER__*/`). 332 files still carry a dash somewhere, nearly all in comments or in Stream Hop |
| **Long tail 11: Vine Puzzle, Yacht-Sea, Tower of Hanoi, Backgammon, Word Trellis, Seed Toss (rows 112 to 124)** (Fable, Sep 05) | `games/{pipe,hanoi,trellis,seedtoss2}.js`, `games/_inline/yahtzee.js`, `shared.css` (`.hdk`, backgammon rules), pins `shared.css?v=20260905f` | Vine Puzzle: tiles butt together (the grid's INLINE 2px gap beat the stylesheet rule the first time) so the vine is continuous where the art allows; the tile PNGs carry rounded corners of their own, so square tile art is a paint-lane item, START and FINISH chips sit centre-bottom of their tile instead of on its top edge. Yacht-Sea: the navy pan becomes the house ground and the painted dice lose the hue-rotate that recoloured them to match it; category descriptions 0.5 to 0.68rem, section labels 0.55 to 0.7rem, score rows 38 to 48px tall (they are the primary tap target), idle rows alternate and carry a sage or rose left rule by section, the empty-score placeholder is a middle dot at 0.8rem (it was a comma at 0.65). Hanoi: the rod paints under the disks (z-index, `.hdk` gets a stacking context in shared.css), is 12px wide and reads as a target when empty, the three columns are evenly spaced, the bare 'disks' text node is styled. Backgammon: bear-off labels and the info line 7 to 8px up to 0.7rem, light points to house sage so they alternate visibly, checkers 14 to 20px (the ROLL pill was tried at 44% and 38%: the point numbers sit at the bar end of every point and the checkers stack from the outer end, so every pill position covers two numbers and 38% also covered a stacked checker; it stays at centre, REFUTED by looking), a 60px outer shadow so the frame meets the page. Word Trellis: the rack holds seven tiles on one row at 375, premium squares in house tones (rose, gold, sage, pale sage) instead of the licensed-set red/orange/blue, 7px labels to 9px, a vignette ring round the board, the score bar sticky, the rules card's CLOSE pinned to its bottom, and the rules no longer auto-open on top of the shell's directions wall. Seed Toss: the ladder header 9 to 12px, the idle hint on a dark pill clear of the pot rim, the empty message line collapses. Not done: Seed Toss's devicePixelRatio canvas (a renderer change), the Add to Home Screen demotion (shell lane) |
| **Satellite overflow sweeps, 375 and 320, after a start tap** (Fable, Sep 05) | `scripts/fleet/overflow.mjs` | 375: 119 of 119 clean (Letter Launch probed at `docs/`). 320: 119 pages, 117 clean; Pollen Panic 41 px (three 48px icon buttons plus a stat column in a no-shrink HUD; under 360 the buttons go 40px and the gaps close, and ⛔ the media block had to sit AFTER the base `.icobtn` rule or it lost on source order); Shell Shuffle 3 px was a phantom: its body already clips horizontally, so the page cannot pan and the layout viewport stays 320. The probe now judges a page whose html or body clips by the layout viewport, not by scrollWidth (`bodyClips` in its output), and its size floor is configurable (`MINW`/`MINH`) |
| **Long tail 12: Bleeding Hearts, Cribbage, Three Sisters, Garden Rummy, Code Breaker, Kakuro (rows 127 to 140)** (Fable, Sep 05) | `games/{bleedinghearts,cribbage,juniper,kakuro,rootmaze,rootflow}.js`, `games/_inline/{set,mastermind}.js`, `shared.css` (`.cb-marker`), pins `shared.css?v=20260905g` | Bleeding Hearts: seat labels and the trick winner line 0.52 to 0.7rem, the disabled pass button a dashed gold outline instead of opacity .5, a top fade so the wine table dissolves into the shell ground, the thirteen-card hand a 7-column grid of proportional cards (7+6 instead of 6+6+1; the first replacement hit the pass-slot card, the hand card has its own style string), the trick well an inset-shadowed dark well, and the score cards' empty round line was a literal comma at 0.5rem (an old dash swap), now a dot at 0.66. Cribbage: the pool-hall green becomes the house felt, the peg bar label no longer overflows under the peg and the peg is inset so score 0 sits inside the track, hand rows stay on one line with cards that shrink to 36px, the panel gets a long soft shadow, and its pan is `min(100%,460px)` (the no-wrap rows exposed the flex-item minimum at 320). Three Sisters: the light grey table becomes a dark green surface, the corner markers 0.55 to 0.7rem. Garden Rummy: the plum ramp becomes the house green, hand cards 46 to 48px, the deadwood label 0.5 to 0.7rem, the disabled KNOCK legible with a dashed border. Code Breaker: stats strip 0.62 to 0.78rem in cream, the newest guess scrolls into view. Kakuro: the clue diagonal a real 1px rule at .38 instead of an invisible .06, the combos modal opaque with a blur, its CLOSE 48px, clue-info and pencil marks off the floor, buttons 0.8rem and no-wrap; tier cards' empty best reads 'none yet' (also Root Maze and Root Flow). Not done: the plaque cap in Code Breaker (fleet plaque size kept), emoji swaps (JOB 8). All six clean at 412/375/320 after the start tap and looked at |
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
