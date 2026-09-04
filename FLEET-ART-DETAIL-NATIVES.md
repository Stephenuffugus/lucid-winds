# Fleet art detail — native /play/ games (66 games)

Per-game working list. These all share `play/shell.css` + `shared.css`, so read **Job 1** in `FLEET-ART-AUDIT-SEP04.md` first — most of them cannot have a background at all until it lands.

---

## POOR — looks unfinished or accidental  (2)

### Shut the Box
`play-doubleshutter` · native · dice · first committed unknown · impact 5/5 · effort M
`games/_inline/doubleshutter.js`

**Now:** A five-line rules paragraph in tiny grey text eats the top third, then two rows of tiles on flat near-black: the BACK row is seven dark diagonally-hatched empty slabs, the FRONT row is seven cream tiles reading 1-7 with the 7 cut in half at the right edge. Below sit two flat dark pills (ROLL 2, STYLE) and, underneath them, a large ornately carved wooden NEW GAME plaque in a completely different visual language.

**Wrong with it:**
- The tile rows are clipped off the right edge of the 375px frame: only 7 of 9 tiles are visible, the 7th is cut mid-glyph, and tiles 8 and 9 are entirely off-screen and untappable. Confirmed in source: shared.css:2504 .ds-row is repeat(9,1fr) but .ds-tile carries aspect-ratio:1 with min-height:48px, and a grid item's min-width:auto picks up the 48px transferred size, so the track floor is 9x48 + 8 gaps = ~456px inside a ~343px row.
- Three buttons in one 110px band, three visual languages: the flat dark ROLL 2 pill, the gold-tinted STYLE pill, and a painted carved-wood NEW GAME plaque with a drop shadow. Nothing else on the screen is painted wood, so the plaque reads as pasted in from another game.
- The whole conceit is a wooden box and there is no box: the BACK row is seven flat CSS slabs with a 45-degree hatch on near-black, with no lid, no routed slot, no hinge, no wood. The covered tiles look like assets that failed to load rather than closed tiles.

**Background now:** Nothing of its own. The shared play/shell.css body radial only: radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, --shell-bg 60%) over near-black. The game adds one gradient, on a button.

**Background wanted:** A full-bleed dark walnut tabletop lit from the upper left, warm gold rim on the near edge, vignetted to near-black at the corners. This is a pub/parlour dice game and it currently has no table at all.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-shutbox-750x1334.jpg` | 750x1334 full-bleed, dark walnut tabletop under a single warm lamp from upper-left, grain visible in the lit third, vignetted to near-black at all four edges | Replaces the shared radial gradient. Gives the box somewhere to sit instead of floating on flat black. |
| `shutbox-frame-702x440.png` | 702x440 transparent PNG, the open hinged box body: two routed channels sized for 9 tiles each, brass hinge pins at the corners, worn edge highlights, interior in shadow | Sits behind the two .ds-row grids so the tiles read as tiles in a box. Replaces nothing (there is no frame today). |
| `shutbox-tile-covered-96x96.png` | 96x96 transparent PNG, a face-down tile: dark wood in shadow, single brass pin, faint top-edge highlight | Replaces the CSS diagonal-hatch slab used for covered BACK tiles, which currently reads as a missing image. |
| `new-game-btn-256x256.png` | 256x256 transparent PNG, reissue of the existing carved plaque at button resolution | assets/games/new-game-btn.png is 3,386,974 bytes (3.4MB) for a button that renders at about 90px, and six inline games load it. |

**CSS to do:**
- shared.css:2505 .ds-tile - the aspect-ratio:1 plus min-height:48px combination sets a 48px minimum track width, overflowing the 9-column row. Add min-width:0 and change shared.css:2504 .ds-row to grid-template-columns:repeat(9,minmax(0,1fr)) so all nine tiles fit the frame.
- shared.css:2504 .ds-row - after the overflow fix each tile is about 35px, under the 48px touch minimum. Below 400px break each row into two lines (5 + 4) so every tile stays at or above 48px.
- games/_inline/doubleshutter.js:29 the directions div - font-size:clamp(0.6rem,1.7vw,0.75rem) resolves to 9.6px at 375px. Raise the floor to 0.72rem and collapse the five-line block behind a 'rules' disclosure so the board is not pushed below the fold.
- games/_inline/doubleshutter.js:42 #DSroll2 / #DSshut versus the NEW GAME image button - pick one language. Either give NEW GAME the .gb pill treatment or paint all three.

**Emoji as art:** Dice faces are the emoji die: 'ROLL 2' and 'ROLL 1' both use the U+1F3B2 die glyph, and the STYLE button uses it again, so the same emoji does three jobs in one row. Six distinct emoji total (arrow, die, check, leaf, star, herb) carry every icon in the game.

**Readability:** The persistent directions paragraph resolves to 9.6px (0.6rem floor) at 375px, well under the 0.7rem house minimum, and runs five lines of mixed grey and gold bold. The 'x2' multiplier badge in each tile corner is smaller again. Tiles 8 and 9 cannot be read or tapped at all because they are off-frame.

**Looks broken** (confirmed on a second look, severity ugly)**:** Front and back tile rows clip at the right edge of the 375px viewport. The FRONT row shows 1 through 7 with the 7 cut through the middle of the numeral; tiles 8 and 9 are off-screen, so two of the nine playable tiles cannot be seen or tapped. Root cause confirmed in shared.css:2504-2505 (aspect-ratio transferred min-width forces a 456px track floor into a 343px row).

### Nonogram Bloom
`play-picross` · native · puzzle · first committed unknown · impact 5/5 · effort S
`games/_inline/picross.js`

**Now:** Near-black throughout. The header runs back arrow, question mark, a red ladybug, a green-glowing Music pill, a sun and 0, and a gold Sign in - with no game title anywhere. Below, small sage clue numbers ring a 5x5 grid of near-black cells holding two dull olive filled squares, the grid sitting left with the right third of the frame empty. Under it, an enormous tall empty rounded box with 5x5 floating in its middle, beside a fully painted ornate copper-and-vine NEW GAME plaque.

**Wrong with it:**
- The game's title is gone from the header. capture.playText confirms 'Nonogram Bloom' is in the DOM between the ladybug and the Music pill, but at 375px the injected Music chip plus the Sign in button eat the row and the title renders at zero width. The header names no game.
- The size selector renders as a roughly 250px tall empty rounded rectangle with the words 5x5 floating in its vertical middle. It is a native <select class="gsl"> (games/_inline/picross.js:25) stretched by its flex row to match the height of the sibling .gb-new image button. It reads as a broken empty panel, not a control.
- The NEW GAME button is a fully rendered painted copper plaque with carved vines and a bevel sitting inches from flat 1px-border CSS rectangles. Nothing else on the page is painted, so the two controls in that one row share no silhouette, no palette and no rendering style. It is also a 3.4 MB PNG (assets/games/new-game-btn.png) for a roughly 100px button on a phone.
- The board has no ground and no frame. Empty cells are rgba(26,31,23,.6), filled cells rgba(74,124,53,.4), borders rgba(74,124,53,.18) - so a filled square reads as slightly-less-black, and the whole grid floats on the shell gradient with a large empty region to its right and above it.

**Background now:** Nothing of its own. play/shell.css line 32 radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%). All cells are inline rgba fills built in a table string. There is no assets/games/picross/ directory; the only two art files it touches are shared ones - assets/games/new-game-btn.png (3.4 MB) and assets/fx/bloom-leaf.png (43 KB, used only in the win overlay).

**Background wanted:** bg-picross-540x960.jpg - a dim herbarium page: pressed-fern paper texture in deep sage-black, a soft warm gold pool centred where the grid sits so the puzzle is lit, edges falling to near-black. It should read as a stitched sampler laid on cloth, which is exactly what a nonogram is.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `board-plate-420x420.png` | 420x420 transparent, painted dark linen or slate plate with a warm gold hairline edge, a soft inner shadow inside the rim and a faint woven texture | Sits behind the grid table (#Xw) so the puzzle has a ground; today the 5x5 floats on the shared shell gradient with nothing marking where the board begins. |
| `cell-filled-96x96.png` | 96x96 transparent, a single painted sage leaf-tile with a warm gold rim light on its top-left edge and a soft shadow at the bottom, designed to tile cleanly edge to edge | Replaces the rgba(74,124,53,.4) fill at games/_inline/picross.js:63 so filling a square reads as placing a leaf, instead of the square getting about twelve RGB points lighter. |
| `new-game-btn-256x256.png` | 256x256 transparent, the SAME copper-and-vine plaque re-exported at button scale, plus a matching narrower plaque for the size selector | The live asset is 3.4 MB for a phone button - the heaviest thing on the page - and its lone painted partner in that row is a plain CSS select. A matching pair at a sane size fixes both the weight and the silhouette clash. |
| `bg-picross-540x960.jpg` | 540x960 full-bleed pressed-fern herbarium paper, warm gold pool at centre, near-black edges | The game has no background of its own and the frame is roughly two thirds empty near-black. |

**CSS to do:**
- games/_inline/picross.js:25 (select.gsl) - add align-self:center; height:56px; max-height:56px. The select is currently stretched by its flex row to the height of the .gb-new image button and renders as a 250px empty box.
- games/_inline/picross.js:25 (.gb-new img) - cap it at width:96px; height:auto and point the src at a resized export; a 3.4 MB PNG is being downloaded for a small button.
- games/_inline/picross.js:63 (the cell <td> style) - filled background rgba(74,124,53,.4) becomes a solid #3f6a2c with a 1px rgba(122,179,86,.45) edge, and the cell border alpha goes .18 to .35, so filled and empty separate on a phone in daylight.
- games/_inline/picross.js:25 (#Xw) - add padding:10px; border-radius:12px; background:rgba(10,14,9,.55); margin:0 auto; width:fit-content so the grid gets a plate and centres, instead of sitting left with the right third of the frame empty.
- games/_inline/picross.js:63 - clue and cell font-size Math.max(10, cs*0.42) becomes Math.max(12, cs*0.42); 10px is 0.625rem, under the 0.7rem floor. Related: at the 12x12 size cells fall to roughly 28px, well under the 48px touch minimum.

**Emoji as art:** Almost none - a single reload glyph on New Game (1 emoji, 1 distinct); the ladybug in the header is shell furniture. This game's problem is the opposite of emoji-as-art: nothing is drawn at all except the one imported plaque.

**Readability:** Clue numbers are 10px (0.625rem) sage on near-black, under the floor and hard to scan against the grid. Filled and empty cells differ by about twelve RGB points, so the puzzle state is barely legible. At the 12x12 size cells drop to roughly 28px, well under the 48px touch minimum. And the game title does not render at all in the header.

**Music chip:** Yes. The green-glowing Music pill occupies the header slot where 'Nonogram Bloom' should read. capture.playText confirms the title is in the DOM ('back / ? / ladybug / Nonogram Bloom / Music / sun 0 / Sign in') but at 375px it renders at zero width between the ladybug and the chip, so the header names no game. Visible identically in play-picross-2play.png and play-picross-3later.png.

**A "looks broken" claim here was refuted on a second look.** Opened all three shots. 2play and 3later (identical frames) show a fully rendered 5x5 board: cell borders visible, sage clue numbers on both the top and left axes, two filled olive cells at bottom centre, all legible. No blank playfield, no missing-image box (the copper NEW GAME plaque loads fine), nothing clipped or overlapping at 375px, no unreadable text; pageErrors and badRequests are both emp

---

## PLAIN — flat colour, system font, emoji doing the work of art  (28)

### Rhythm and Vine
`play-rhythmvine` · native · creative · first committed 2026-04-12 · **workbench-gated** · impact 5/5 · effort M
`games/rhythmvine.js`

**Now:** A tall near-black rectangle with four barely-visible vertical hairlines, a thin gold horizontal glow near the bottom, and four small coloured dots (pink, gold, orange, blue) with tiny D F J K letters under them. The top two thirds of the playfield is completely empty black. In the -3later frame the only other thing on screen is one solid gold rounded pill sliding down lane 2 - that pill is the note art.

**Wrong with it:**
- About 65% of the playfield is literally empty black with nothing in it - no horizon, no motion, no depth. The frame has no content above the hit line.
- The game is called Rhythm and Vine and there is no vine anywhere on screen - no trellis, no leaf, no stem, nothing botanical at all.
- The four pads are 73px tall but painted transparent, so the player sees only a 14px dot; the real target and the visible target disagree by 5x.
- The lane dividers at rgba(122,179,86,0.08) are so faint they read as compression artefacts, not as structure - four lanes but no visible four-lane grid.

**Background now:** games/rhythmvine.js:48 - #RVstage is linear-gradient(180deg, rgba(13,16,12,0.96) 0%, rgba(20,28,18,0.9) 100%) with a 1.5px rgba(122,179,86,0.18) border and an inset shadow. That is the entire background. No image, no texture, no parallax. assetFiles:0.

**Background wanted:** bg-rhythmvine-trellis-540x900.jpg - a vertical vine trellis running the full height of the stage: four twisted stems marking the lane boundaries, leaves clustered at irregular heights so the emptiness has landmarks, deep near-black between the stems, sage green foliage catching a warm gold rim from the hit line below, darkening toward the top so notes emerge out of shadow.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-rhythmvine-trellis-540x900.jpg` | 540x900, four vertical vine stems on the lane boundaries, leaf clusters at irregular heights, near-black between stems, sage foliage, warm gold rim from below, top 20% fading to black | fills the empty 65% of the playfield and finally puts the vine in Rhythm and Vine |
| `note-leaf-sheet-336x44.png` | 336x44 transparent strip, four 84x44 painted leaf/petal notes tinted pink, gold, orange and blue to match the lanes, soft painterly with a warm rim light and a faint inner glow | replaces the flat CSS gold pill (.RVnote, games/rhythmvine.js:54) that is currently the only moving thing on screen |
| `hitline-bloom-540x72.png` | 540x72 transparent, a row of four half-open blooms sitting on the hit line, gold #c8a84b core with sage petals, glow baked in | replaces the 3px gradient hairline so the moment of contact has a shape, and gives the four invisible pads a visible plate |
| `pad-plate-136x100.png` | 136x100 transparent, a shallow lit stone/wood pad with a leaf motif, one per lane, 9-slice friendly | makes the 73px touch target visible instead of a 14px dot |

**CSS to do:**
- .RVpad .k (games/rhythmvine.js:57): font-size 0.55rem -> 0.7rem and opacity 0.55 -> 0.8. At 0.55rem on a near-black ground the D/F/J/K key hints are under the project's own text floor.
- #RVstart .s (games/rhythmvine.js:61): font-size 0.65rem -> 0.7rem, same reason.
- .RVpad (games/rhythmvine.js:54): its resting background is linear-gradient(rgba(255,255,255,0.02), rgba(0,0,0,0.35)), which is invisible. Give it rgba(122,179,86,0.10) to rgba(0,0,0,0.45) plus the existing gold top border so the target reads as a plate.
- .RVlane (games/rhythmvine.js:50): border colour rgba(122,179,86,0.08) -> 0.16, so four lanes are actually four lanes.
- #RVstage: add background-image for the trellis with background-size:100% auto and a slow background-position-y animation, so the empty upper stage reads as travel rather than void.
- #RVhitline (games/rhythmvine.js:52): it is 3px at bottom:14%. Thicken to 5px and add a second, softer rgba(122,179,86,0.4) glow line 8px below it, so the judgement point is unmistakable on a phone.

**Emoji as art:** ★ and ☆ stand in for the score/rating stars, ↻ and ⚙ sit on the New Game and CALIBRATE buttons. Five emoji total, four distinct - but there is no other art in the game at all, so CSS shapes (a gradient pill, a gradient line, four border-radius:50% dots) are doing 100% of the visual work.

**Readability:** The D/F/J/K key labels are 0.55rem at 55% opacity - under the 0.7rem floor and hard to read at arm's length. The start-panel sub-copy is 0.65rem, also under. Touch targets are fine in code (pads are 14% of a ~520px stage = ~73px), but visually a player aims at a 14px dot.

### Mosaic Garden
`play-mosaic` · native · puzzle · first committed 2026-04-12 · impact 5/5 · effort L
`games/mosaic.js`

**Now:** Two identically-shaped dark olive panels stacked down the screen - YOUR MOSAIC over MIRROR - each a staircase of empty outlined slots on the left, a thin arrow, then five muddy 24px coloured squares on the right, with a maroon FLOOR strip of red '-1 -1 -2 -2 -2 -3 -3' chips underneath. Every element is a rounded rectangle. There is not one image file in the game.

**Wrong with it:**
- Everything on screen is the same rounded rectangle: player rows, mirror rows, floor slots, wall cells, tiles. The two panels YOUR MOSAIC and MIRROR are the identical shape at the identical size with the identical border, so at a glance there is no read of which board is yours.
- The wall grid on the right of both panels is drawn at opacity:0.28 (.MStile.ghost, games/mosaic.js:79), so ten rows of muddy 24px squares read as dirt rather than as the pattern you are aiming for - the target of the whole game is the least legible thing in frame.
- The action row is sliced by the bottom of the viewport: 'DUMP TO FLOOR' shows only 'DUMP TO' with 'FLOOR' cut through the middle of the letters, and '⇤ UNDO PICK' is cut the same way. Two of the three primary buttons are half a button.
- The floor penalty strip is seven red chips at font-size:0.7rem (.MSfloorSlot, line 104) on a maroon band - right at the size floor, and the single loudest, most saturated thing on the screen while being the least important information on it.
- The tile faces are emoji at 0.9rem inside a 24px box, so at phone size you read colour and never the icon - the 🌸 🌿 💧 ☀️ ❄️ are a smudge that costs legibility and buys nothing.

**Background now:** Nothing. Zero asset files, zero image references anywhere in games/mosaic.js (grep for img/.png returns 0). The whole background is the shared native radial gradient over #0d100c; the panels are rgba(26,31,23,0.45) fills.

**Background wanted:** A dim conservatory floor - dark slate with a faint grout grid and a warm lamp falloff top-centre - so a game about laying tiles is happening on a floor instead of in a void.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-mosaic-540x960.jpg` | 540x960 full-bleed, dark slate conservatory floor, faint grout grid receding, warm lamp falloff top-centre, deep near-black corners | The game currently has no background of any kind - it is the shared gradient behind flat CSS panels. |
| `tile-petal.png / tile-leaf.png / tile-berry.png / tile-sun.png / tile-frost.png` | five 96x96 transparent, glazed ceramic tiles with a rim highlight, a soft drop shadow and a painted motif (petal, leaf, drop, sun, flake) in the existing colours #e07a8a #6bad4a #5b9bd5 #d4a843 #a0c4e8 | Replaces the flat hex fill plus emoji in mkTile (games/mosaic.js:730) - the only 'art' in the game is currently a system emoji at 0.9rem. |
| `panel-tray-9slice.png` | 320x320 transparent 9-slice, mossy stone tray edge with a shallow inner lip, ~24px inset | Applied to .MSboard so the two identical CSS rectangles become physical trays and stop sharing a silhouette. |
| `factory-dish-152.png` | 152x152 transparent, painted shallow stone dish with a worn rim, top-down | Replaces the .MSfac 76px CSS circle (games/mosaic.js:70) that is the tile-drafting pool. |
| `floor-strip-9slice.png` | 300x80 transparent 9-slice, cracked terracotta and swept debris, muted | Replaces the maroon .MSfloor band so the penalty row reads as a floor you dropped tiles on, rather than as the loudest red rectangle on screen. |

**CSS to do:**
- games/mosaic.js:108 .MSbtn action row: make it position:sticky;bottom:0 with a solid backing and padding-bottom:env(safe-area-inset-bottom,0px), so DUMP TO FLOOR and UNDO PICK are never cut by the viewport on a long board.
- games/mosaic.js:108 .MSbtn: font-size:0.76rem with letter-spacing:0.1em wraps 'DUMP TO FLOOR' onto two lines - set white-space:nowrap and reduce the letter-spacing, or shorten the label to 'DUMP'.
- games/mosaic.js:79 .MStile.ghost: raise opacity 0.28 to about 0.45 and add a dashed sage outline, so the wall pattern reads as a target instead of as dirt.
- games/mosaic.js:104 .MSfloorSlot: font-size:0.7rem is at the readability floor - raise to 0.8rem and drop the red saturation so the penalty strip stops dominating the frame.
- games/mosaic.js:82 .MSboard: give the active player's board a gold border and the MIRROR board a muted one - the two panels are currently pixel-identical in shape, size and colour.

**Emoji as art:** 🌸 🌿 💧 ☀️ ❄️ are the tile faces themselves (the ICONS map at games/mosaic.js:13), rendered at 0.9rem inside 24px squares. Emoji is the ENTIRE art of this game - there is no other imagery in it.

**Readability:** 'DUMP TO FLOOR' and 'UNDO PICK' are sliced by the bottom of the frame; floor penalty chips at 0.7rem sit at the size floor; the tile emoji is an illegible smudge at 24px; ghost wall tiles at opacity 0.28 are effectively unreadable.

### Sudoku
`play-sudoku` · native · math · first committed 2026-04-03 · impact 5/5 · effort M
`games/sudoku.js`

**Now:** A near-black page with a 9x9 mesh of flat charcoal cells and bright sage numbers in Bebas Neue, filling the top two thirds; below it a timer chip, NOTES and MISTAKES pills, a 5x2 dark number pad, a Medium pill, a New Game pill and the green Add to Home Screen button. There is no art anywhere - every pixel is a CSS rectangle from the shared shared.css block, and the whole board is one value of dark grey.

**Wrong with it:**
- The 3x3 box separators (shared.css:2238-2241) are rgba(74,124,53,.25) - the SAME sage as the .5px cell hairlines, only 2px - so at 375px the nine boxes are invisible and the board reads as one undifferentiated grid. That is the one line a Sudoku cannot afford to lose, and it is gone.
- In the play frame the top row of the grid is clipped by the viewport and the game header is scrolled off entirely. The 356px board plus toolbar, pad, difficulty row, Add-to-Home button and footer do not fit 667px, so the player never sees the whole puzzle and the header in the same frame.
- The difficulty control is a <select class="gsl"> and .gsl sets -webkit-appearance:none with no chevron background - so the 'Medium' pill sits beside the live 'New Game' pill sharing its exact silhouette while being a dropdown. Two controls, one shape, different behaviour.
- Empty cells are flat rgba(26,31,23,.45) with a 2.5%-alpha radial on ::after. The board has no material at all - no paper, no lacquer, no vignette, no edge. It reads as a spreadsheet, not a puzzle you would sit down with.

**Background now:** No game-owned background. Inherits play/shell.css:32 radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%), shared with all 66 natives. The board itself is rgba(13,16,12,.35). Sudoku's own 2 gradients are both in the SOLVED overlay, not the play screen.

**Background wanted:** A painted night-workbench ground plus a paper surface under the grid, so the 9x9 sits ON something instead of floating in the shared void. This is the whole lift for this game.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-sudoku-540x960.jpg` | 540x960 full-bleed. Night greenhouse workbench seen from above: dark slate, faint moss creeping in at the left and bottom edges, a warm gold lamp falloff entering top-right, centre deliberately flat and unbusy so the grid stays legible over it. | Replaces the shared 66-game radial gradient. Gives Sudoku its own room instead of the default corridor. |
| `sudoku-board-paper-880x880.png` | 880x880 (2x the 440px max grid), transparent outer edge. Aged vellum/ledger paper in cream-over-charcoal at low opacity, soft inner vignette, a faint hand-ruled hairline exactly on the 3x3 box lines, worn corners. | Sits behind .ug as background-image. Gives the board a material AND paints in the box structure that the CSS rules currently lose. |
| `sudoku-key-plate-216x188.png` | 216x188 (2x the ~108x94 pad key), transparent. A painted river-stone chip with warm rim light top-left, a soft contact shadow bottom, and a slightly irregular edge so no two keys look die-cut. | Replaces the flat rgba(26,31,23,.65) .upb rectangles - the 10 number keys are half the screen and currently carry no art at all. |

**CSS to do:**
- shared.css:2238-2241 - raise the 3x3 box rules from `2px solid rgba(74,124,53,.25)` to `2px solid rgba(200,168,75,.55)` (gold), and ADD `.uc:nth-child(3n+1){border-left:2px solid rgba(200,168,75,.55)}` so the left wall of each box closes. Right now only the right and bottom walls are drawn.
- shared.css:2232 `.ug` - add `border:2px solid rgba(200,168,75,.45)` and `box-shadow:0 10px 30px rgba(0,0,0,.55), inset 0 0 60px rgba(0,0,0,.5)` so the board has a lip and a shadow catch instead of meeting the page through a hard 2px sage line.
- shared.css:2215 `.gsl` - add a chevron via `background-image:url(data:image/svg+xml,...)` at `right 14px center` plus `padding-right:38px`, so the difficulty select stops reading as an inert label next to the New Game button.
- shared.css:2233 + 2236 - widen the clue/entry split: give `.uc.uf` (fixed clues) `color:rgba(232,220,200,.72)` and leave player entries at full sage `#8cc760`, so at a glance you can see what you put in. Today clues are the loud green and your own answers are the quiet cream, which is backwards.
- games/sudoku.js:202 `.utb` - tighten `margin:clamp(6px,2vw,10px) auto 0` to `margin:4px auto 0` and shrink `.up` padding (shared.css:2244) to `clamp(2px,1vw,6px)`, buying ~20px so the grid's top row is not clipped at 667px.

**Emoji as art:** Five glyphs doing the work of five icons: the erase key on the pad is a bare U+2715, New Game is U+21BB, the pencil is a raw emoji on the NOTES pill, the eye on MISTAKES, and a stopwatch on the timer chip. All at system-font rendering, so each has its own colour and weight.

**Readability:** The 3x3 box rules at .25 alpha are functionally invisible at 375px - a real readability fault, not a style one. Pencil notes (.unwrap, games/sudoku.js:201) are clamp(7px,1.9vw,10px) = 7.1px at 375, far under the 0.7rem floor. The done-chip check (.upb.ud::after) is .5rem. Everything else - the entered digits and pad keys - is large and clean, and .upb/.utbb both carry min-height:48px so touch is fine.

### Stone Garden
`play-stonegarden` · native · creative · first committed 2026-04-12 · **workbench-gated** · impact 5/5 · effort M
`games/stonegarden.js`

**Now:** A tall near-black canvas with a thin dark HUD strip across the top (SCORE 0, LIVES 3, 0/380px). Down the far left and far right edges sit two rails of eight flat grey stones - ellipses and octagons, each a single two-stop grey gradient - labelled +5, +1, +2, +1 and +1, +3, +3, +2 in small gold text. The entire middle of the frame, which is the whole play area, is empty black. A shapeless pale smudge sits in the upper right. A faint brown band and a hairline mark the ground at the very bottom. Below the canvas, three CSS pills - ROTATE, UNDO, MENU - and a green Add to Home Screen slab.

**Wrong with it:**
- The upper-right "moon" is a formless smudge - render() draws only a radial gradient from rgba(232,220,200,0.18) to transparent with no disc, so it reads as a dirty lens flare or a compositing artefact, not a light source.
- The stones are flat two-stop linear gradients with a black 0.32 stroke and nothing else - no rim light, no texture, no cast shadow - and four of the eight are the same squashed-ellipse silhouette, so a shape-matching game gives the player almost nothing to read shapes by.
- The ground is a flat rgba(42,38,28,0.6) rectangle capped with a 2px hairline, so the sand meets the sky through a hard horizontal cut with no transition band; and the 8 stars the code draws at 0.06 alpha are literally invisible - I count zero in the frame.

**Background now:** Canvas-painted, all procedural: a three-stop vertical gradient #0f1410 to #131a14 to #181c14, eight single-pixel stars at 0.06 alpha, a 70px radial gradient standing in for a moon at 0.18 alpha, and a flat rgba(42,38,28,0.6) sand rect with sine-wave rake lines. No images at all - assetFiles 0.

**Background wanted:** A moonlit zen garden painted as a real scene: raked sand receding toward a dark treeline, a genuine moon disc with a halo in the upper right, one warm paper-lantern point low on the left to break the monochrome, and a mist band where the sand meets the trees. The whole centre of the frame is currently empty black, which is the single largest wasted surface in this batch.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-stonegarden-750x1600.jpg` | 750x1600 full-bleed (taller than the viewport so it can parallax as the camera rises), moonlit zen garden - raked sand foreground, dark treeline midground, real moon disc plus halo upper right, one warm lantern point lower left, mist transition where sand meets trees | replaces the three-stop #0f1410 sky gradient and the formless radial-gradient moon; fills a play area that is currently pure black |
| `stones-stonegarden-1024x512.png` | 1024x512 sprite sheet, 10 painted river stones on transparent, each with a warm-lit top edge, a cool shadow side and visible mineral grain; deliberately distinct silhouettes - flat slab, tall wedge, boulder, disc, hex, teardrop | replaces drawStoneBody's two-stop createLinearGradient polygon; the stones are the game and right now they are flat grey blobs, four of them sharing one silhouette |
| `moon-stonegarden-256x256.png` | 256x256 transparent PNG, a cream moon disc with faint maria and a soft two-stage halo | the current moon is a bare radial gradient at 0.18 alpha with no disc and reads as a smudge |
| `rail-stonegarden-96x1334.png` | 96x1334 transparent PNG, a painted stone shelf or bamboo rail with a lit top edge, mirrorable for the right side | replaces drawTrayZone's rgba(16,20,12) gradient column, which currently reads as a slightly darker patch of the same black rather than a tray the stones sit in |

**CSS to do:**
- games/stonegarden.js drawTrayRocks (around line 512): ctx.font='bold 10px sans-serif' for the "+N" point labels is under the 0.7rem floor and is generic sans-serif, not the house DM Mono - raise to 12px and set DM Mono.
- games/stonegarden.js render() around line 566: the sand is a flat fillRect capped with a 2px stroke, so the horizon is a hard cut - add a 24px vertical gradient transition band above groundScreenY before the rect.
- games/stonegarden.js render() around line 552: the 8 stars at rgba(232,220,200,0.06) are invisible at 375px - either raise to about 0.22 alpha across 40 stars with two size classes, or delete the loop.
- games/stonegarden.js drawTrayZone: the left tray's stones are clipped by the canvas edge at x=0 - inset the tray content by 8px so no stone is cut by the frame.
- The ROTATE / UNDO / MENU pill row sits flush under the canvas with a hard edge between the scene and the page background - add a bottom fade on the canvas or a framed bezel so the playfield ends deliberately.
- games/stonegarden.js render() line 604: the HUD strip is rgba(13,16,12,0.55) over a near-black sky, so "0/380px" at 0.75 alpha barely separates from the background - raise the strip to 0.8 alpha and the text to full cream.

**Emoji as art:** A rock emoji and a curved-arrow emoji in the button row only. The canvas itself uses no emoji - everything in the playfield is procedurally drawn, which is why it looks unfinished rather than cheap.

**Readability:** The tray "+N" point labels are bold 10px sans-serif, under the 0.7rem floor and the only place the player reads a stone's value. "LIVES 3 · 0/380px" in the HUD is small and low-contrast against near-black. The ROTATE/UNDO/MENU pills clear 48px.

### Story Seeds
`play-storyseeds` · native · creative · first committed 2026-04-12 · impact 5/5 · effort M
`games/storyseeds.js`

**Now:** A single 🏞 system emoji at the top, an italic Georgia prompt ('What can a river teach a stone?'), a sage 'WISDOM' label, then a 220px empty bordered textarea holding one typed 'w', three pill buttons, and the Add-to-Home bar. Everything sits on the shell's near-black gradient. capture reached 'sparse-ui' — this IS the live writing screen, header scrolled off.

**Wrong with it:**
- The only illustration on the screen is a 1.8rem system emoji (games/storyseeds.js:108). Thirty prompts share thirty emoji and that is the entire art budget for a game whose whole surface is one card.
- The textarea is the largest shape in the frame and it is a void: a 220px rectangle with a 1px sage border and rgba(26,36,22,0.3) fill, hard corners meeting nothing (storyseeds.js:112). Below it the page runs empty to the footer.
- The buttons mix visual languages inside one 48px pill — a full-colour 💾 and 📖 emoji next to cream DM-Mono-fallback text on a flat green-black slab. Three of them, unaligned in a 2+1 stack, so the button block has no shape either.
- No hierarchy anchor: 1.8rem emoji, 1rem italic serif prompt, 0.78rem spaced sans category, 0.7rem footer — four sizes with nothing holding them together, no container, no rule, no frame.

**Background now:** Nothing of its own except one gradient in the journal overlay. The visible screen is play/shell.css:32 radial-gradient(1200px 600px at 70% -10%, #1a2a20, #0d100c 60%), unmodified.

**Background wanted:** A painted writing desk at night: a journal edge along the bottom, a candle or lantern glow falling from the upper left across the page, everything else dropping to near-black. It is a contemplative writing game with a garden voice and currently it looks like a form.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-storyseeds-540x960.jpg` | 540x960 full-bleed. Night desk: dark timber, the corner of a leather journal bottom-right, a warm candle pool of light upper-left falling off to #0d100c, a pressed leaf and a stub of pencil in a motivated group near the journal rather than scattered. | The game has no background at all; the whole screen is currently the shared shell gradient. |
| `prompt-card-540x260.png` | 540x260, transparent outside the card. Deckled cream-green parchment with a soft warm shadow, a pressed fern in the top-left corner, a thin gold rule across the lower third where the category sits. | Gives the prompt block a container. Right now the emoji, the italic line and the category float loose with nothing behind them. |
| `icon-prompt-96x96-observation.png (plus -perspective, -memory, -imagination, -senses, -feeling, -gratitude, -wisdom)` | Eight 96x96 transparent painted emblems, warm rim light, big silhouette at 48px: an open eye; a rain-struck leaf; a pressed dried flower; a moon over a garden gate; a hand in soil; a heart-shaped leaf; two folded hands; a river-worn stone. | Replaces the 30 system emoji at storyseeds.js:108 (one per category, not one per prompt) with house-voice art. |
| `paper-texture-540x420.png` | 540x420 tileable, opaque. Warm cream ruled paper with visible fibre and a faint gutter shadow down the left edge, supplied as a night-toned variant at ~18% luminance so cream text stays legible on it. | Backs the textarea so the biggest object on the screen is a page, not an empty rectangle. |

**CSS to do:**
- games/storyseeds.js:112 #SSta — swap background:rgba(26,36,22,0.3) for the paper texture and add box-shadow:inset 0 2px 10px rgba(0,0,0,.4); it is currently the largest and emptiest shape in the frame.
- games/storyseeds.js:108-110 — wrap the emoji, prompt and category in the prompt-card container; set the category as small-caps gold under a thin rule rather than a third loose type size.
- The mc(a) button row in games/storyseeds.js — replace the 💾 and 📖 emoji in the .gb labels with the 24px painted emblems so one button is not half full-colour system glyph and half cream text.
- play/shell.css:7 — add Crimson Text and Bebas Neue to the font @import; the prompt is currently falling back to Georgia and the category to a generic sans, which is why the type reads as a form rather than a page.

**Emoji as art:** Heavily. 30 prompt icons are system emoji (👁 🌧 🌳 🌙 🌍 🏡 🍽 🤲 🌸 🌱 🌿 🌲 📖 💪 and more, storyseeds.js:8-38) rendered at 1.8rem as the single hero image; plus 💾 / 📖 / 🔥 in buttons and the streak line. 38 emoji total, 33 distinct — the highest emoji-as-art load in this batch.

**Readability:** Buttons are .gb with min-height:48px — fine. Prompt at 1rem italic on cream is comfortable. The category at 0.78rem and footer at 0.7rem sit at the floor but pass. No contrast failures; the problem is emptiness, not legibility.

### Root Maze
`play-rootmaze` · native · puzzle · first committed 2026-04-12 · impact 5/5 · effort L
`games/rootmaze.js`

**Now:** capture.reached is no-more-controls but the play frame is the real board. A 7x7 shifting-tile maze drawn on canvas: dark brown tiles (#221a12 plain, #2a2018 fixed) with flat tan #a88356 corridor bars and round knobs, gold triangle glyphs on olive pads down all four edges, and fourteen system emoji flowers and mushrooms scattered across it as treasures. Two thin outlined HUD strips sit above the board and a small SPARE preview box plus a ROTATE pill sit below it.

**Wrong with it:**
- The top HUD strip is sliced in half by the top of the frame in BOTH the play and later shots - 'TURNS 0 / DIFFICULTY G - EASY / BEST -' is cut horizontally through the middle of the glyphs. The board plus three stacked HUD strips plus the spare row is taller than 667px.
- Every treasure, the player token and the rival token are system emoji painted into the canvas at ctx.font = CELL*0.34 (games/rootmaze.js:481). With CELL clamped to at least 44 (games/rootmaze.js:421) that is about a 15px glyph. They are a different art language from everything else on the board - glossy 3D vector emoji with their own drop shadows and their own colour system against flat matte tan bars - and at 15px the rose, the hibiscus and the tulip are indistinguishable from each other, which matters because the objective bar asks you to find one specific flower.
- The corridors are single flat #a88356 strokes butted straight against #221a12 tiles - no bevel, no shadow, no soil texture, no transition at the tile seam. It reads as a wiring diagram. Nothing in the frame says 'root' except the word in the title.
- The SPARE preview is a small gold-outlined box containing two vertical tan bars with no context at all. It is unreadable as 'the tile you are about to push in', and it sits on the same line as ROTATE with no visual relationship to the board it feeds.

**Background now:** Nothing of its own. The canvas is cleared to flat #0d100c (games/rootmaze.js:541) over the shared shell radial gradient at play/shell.css:32. record.code lists 3 gradients and 2 keyframes but those are on HUD pills, not a background. bgImage 0, assetFiles 0, ownCssKB 0. No assets/games/rootmaze/ folder exists.

**Background wanted:** bg-rootmaze-540x960.jpg - a painted cross-section of dark soil: strata bands, small stones, pale mycelium threads, a lantern glow from top-right. The board should look cut INTO earth; right now a flat black canvas floats on a flat black page with no boundary between them.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-rootmaze-540x960.jpg` | 540x960, full-bleed JPG. Painted soil cross-section: strata bands, pebbles, faint mycelium filaments, a warm lantern pool at top-right, all values kept under 20% luminance so the board reads on top. | Replaces the flat #0d100c canvas clear at games/rootmaze.js:541. Gives the maze a place to be dug into and puts a boundary between the canvas and the page. |
| `tile-sheet-rootmaze-512x512.png` | 512x512, transparent PNG. A 4x4 sheet of 128px painted maze tiles: straight, elbow, tee, cross, each in a plain and a fixed/gilded variant. Real root bark on the corridors, a soft inner shadow at the tile seam, warm rim light from top-right. | Replaces ctx.strokeStyle='#a88356' bars and the #221a12 / #2a2018 tile fills (games/rootmaze.js:448-478) - i.e. every tile on the board. This is the single biggest lift available in the game. |
| `treasures-sheet-576x192.png` | 576x192, transparent PNG. Eighteen painted 96x96 botanical tokens matching the TREASURES array at games/rootmaze.js:16 (sunflower, rose, tulip, mushroom, hyacinth, cactus, bamboo, clover, cherry blossom, potted plant, hibiscus, maple, wheat, lotus, herb, seedling, deciduous, evergreen), house palette, big readable silhouettes distinguishable at 24px. | Replaces the 15px system emoji, which are the loudest wrongness in the frame and are also a playability fault - three of them cannot be told apart at the rendered size. |
| `tokens-rootmaze-192x96.png` | 192x96, transparent PNG, two 96x96 cells. A painted seeker lantern-sprite in sage and its rival mirror in rose, each with a warm rim light and a cast ground shadow. | Replaces drawToken() at games/rootmaze.js:521-530, which draws a flat coloured circle with a black stroke and an emoji glyph on top of it. |
| `arrow-push-64x64.png` | 64x64, transparent PNG. A painted brass push-lever seen end-on with a shadow and a warm highlight, plus a 64x64 pressed variant. | Replaces ctx.fillText of a bare sans-serif triangle glyph on an rgba(200,168,75,0.18) rectangle (games/rootmaze.js:506-513). These are the game's primary input and they are currently typography. |

**CSS to do:**
- The HUD stack in games/rootmaze.js - the TURNS/DIFFICULTY/BEST strip plus the FIND/MIRROR strip plus the hint banner plus the board plus the spare row exceed 667px and the top strip is clipped in both play frames. Merge the TURNS/DIFFICULTY/BEST strip and the FIND/MIRROR objective strip into one row and give it position:sticky;top:56px so it is never scrolled through.
- The 'TAP AN EDGE ARROW TO SHIFT' banner is a permanent full-width strip eating about 28px of a 667px screen. Add a .rm-hint.done{opacity:0;height:0;margin:0;padding:0} rule applied after the first successful shift, and give the reclaimed height to the board.
- games/rootmaze.js:481 ctx.font=Math.floor(CELL*0.34)+'px sans-serif' - with CELL clamped to a minimum of 44 (line 421) that renders about a 15px treasure glyph. Raise to CELL*0.55 as an interim until the painted token sheet lands.
- The edge arrow hit pads (games/rootmaze.js:506-513, drawn CELL-6 wide by PAD-4 tall with PAD=max(24,CELL*0.42)) render about 38x20 CSS px - the short dimension is well under the 48px touch floor, and these are the game's primary input. Extend the touch band in onBoardTouch to a full 48px regardless of the drawn pad.
- The SPARE preview box - give it border:2px solid var(--gold);border-radius:10px;box-shadow:0 0 0 4px rgba(13,16,12,.9),0 4px 14px rgba(0,0,0,.6) and move the SPARE label above it rather than beside it, so it reads as a held tile rather than a stray outlined rectangle.

**Emoji as art:** Total - the highest emoji load in this batch at 30 uses across 22 distinct glyphs. The TREASURES array at games/rootmaze.js:16 is eighteen emoji flowers, mushrooms and trees painted straight into the canvas as the game's collectibles; drawToken() puts another emoji on the player and the rival; and every edge arrow is a sans-serif triangle glyph drawn with fillText. Emoji ARE this game's art, and they are rendered at about 15px.

**Readability:** Three faults. The 15px emoji treasures are the objective and cannot be told apart at 375px (rose vs hibiscus vs tulip). The top HUD row is clipped so it is literally unreadable. The edge arrow pads render about 38x20 CSS px - under the 48px touch floor - and they are the primary input. The FIND objective bar and MIRROR counter are legible.

**A "looks broken" claim here was refuted on a second look.** The sliced top row is real but it is scroll position, not clipping. In play-rootmaze-2play.png (and the identical -3later) the frame opens mid-strip on "0 / G · EASY / —", with the TURNS/DIFFICULTY/BEST labels above the frame edge — but the shell header (back arrow, ?, "Root Maze", ♫ Music, ☀ 0, Sign in) is also gone off the top while the "Add to Home Screen" button and the Sky Wolf Studio footer 

### Sea Battle
`play-battleship` · native · board · first committed 2026-04-24 · impact 5/5 · effort M
`games/battleship.js`

**Now:** A near-black 10x10 grid whose water is a checkerboard of two almost identical dark greens (rgba(18,26,22,.78) vs rgba(22,30,26,.88)) - you have to hunt for the alternation. Ships are flat sage squares drawn one cell at a time, each with its own 3px radius, so a five-cell ship reads as five separate blobs with visible seams; the only hit art on screen is an OS 💥 emoji on a brick-red cell at J2. Below the board sit three dark-on-dark pills (CONFIRM OFF, 🔍 1x, New Game) and then the shell's Add to Home Screen button.

**Wrong with it:**
- Ships have no hull. .th-cell.placed rounds EVERY cell, so column B rows 1-4 reads as four detached green tiles with gaps, not one vessel - the single most important silhouette in the game does not exist.
- The 💥 emoji at J2 is the only hit graphic, and it is a full-colour OS glyph dropped into an otherwise entirely CSS, entirely sage-and-near-black scene. 🌱 in 'YOUR FLEET', 📡 RADAR and 🌊 TIDE STRIKE do the same in the buttons.
- Columns C through G are a completely empty near-black field taking up half the board - the water is not water, it is unpainted background, and the checkerboard meant to carry it is invisible at phone brightness.
- Coordinate labels A-J and 1-10 are 0.52rem in var(--muted) grey - the one thing a Battleship player reads out loud is the hardest text on the screen.

**Background now:** Nothing of its own. The shared play/shell.css radial-gradient(1200px 600px at 70% -10%, #1a2a20, var(--shell-bg) 60%). The board itself is a flat rgba(74,124,53,0.08) fill with a 1.5px sage border. bgImage:0, assetFiles:0.

**Background wanted:** A full-bleed painted night-sea chart behind the grid: deep teal-black water with a warm lamp falloff from the top-left, faint parchment rules and chart marginalia bleeding under the board edges, a scatter of hand-drawn depth soundings in the dead water columns. It is the biggest single lift available - right now half the frame is unpainted void.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/battleship/bg-sea-540x960.jpg` | 540x960 full-bleed. Night sea seen from above: deep teal-black water, warm lamp glow top-left falling off to near-black bottom-right, faint cream chart rules and depth soundings, a soft compass rose ghosted at 8% in one corner. | Replaces the shared shell radial gradient. Fills the empty C-G columns and the dead space above and below the two boards with something composed. |
| `assets/games/battleship/ship-hulls-320x64.png` | 320x64 transparent sprite sheet, five hulls at cell pitch 32px: lengths 2,3,3,4,5. Olive-sage decks, dark keel line, warm gold rim light along the top edge, a soft drop shadow baked in. | Replaces .th-cell.placed. One image per ship instead of one rounded square per cell, so a 5-ship finally reads as a 5-ship. |
| `assets/games/battleship/hit-splash-96x96.png` | 96x96 transparent PNG. Amber ember burst with a curl of dark smoke and scattered splinters, warm rim light, painterly not vector. | Replaces the 💥 OS emoji at line 459 - the only piece of hit feedback in the game and currently the loudest style break on screen. |
| `assets/games/battleship/miss-ripple-96x96.png` | 96x96 transparent PNG. A pale sage water ring with a soft second ring and a faint foam speckle, 40% opacity core. | Replaces the bare middle-dot '·' used for misses, which currently looks like a rendering artefact rather than a shot. |
| `assets/games/battleship/icons-radar-tide-128x64.png` | 128x64 transparent, two 64x64 cells: a brass radar dish with a sweep arc, and a curling wave with gold foam. | Replaces 📡 and 🌊 in the RADAR / TIDE STRIKE buttons so the two special abilities stop being OS emoji. |

**CSS to do:**
- games/battleship.js .th-coord-row and .th-coord-col: font-size 0.52rem -> 0.7rem, color var(--muted) -> rgba(232,220,200,0.78). Both are under the readable floor today.
- .th-cell.water / .th-cell.water-alt: the two tones are 4% apart in luminance and read identical. Either widen to at least 10% apart or delete the checker and let the painted sea carry it.
- .th-cell.placed: drop border-radius:3px and add .placed-head / .placed-mid / .placed-tail so rounding happens only at the two ends of a ship.
- .th-grid: min cell is currently ~32px rendered at 375px width (324px board / 10). Either widen the board to the full gutter or accept it is a tap-a-cell game under the 48px floor and add a confirm step (CONFIRM is already there but defaults OFF).
- .th-special-btn and .th-diff-btn: dark-on-dark. Border to rgba(200,168,75,0.75), label colour to var(--cream); 'CONFIRM OFF' currently reads as disabled.
- The ship-chip caption at line 525 is font-size:0.44rem ('✓ placed' / 'tap') - raise to 0.62rem minimum.

**Emoji as art:** 💥 is the hit marker on the board (line 459 and in the status line), 🌿 marks a sunk ship, 🌱 is the YOUR FLEET header icon and ⚔ the ENEMY WATERS one (line 415), 📡 and 🌊 label the RADAR and TIDE STRIKE ability buttons, 🔍 is the zoom control, ↻ the new-game glyph. 14 distinct emoji, 35 uses, and zero image assets - emoji IS the art department here.

**Readability:** Coordinate rulers 0.52rem muted grey (both axes). Ship-chip status caption 0.44rem. Inline SALVO/SPECIALS buttons 0.58rem with 2px vertical padding, well under 48px. Board cells render ~32px at 375px, under the 48px touch floor. CONFIRM OFF and New Game pills are cream-on-near-black at low border contrast.

### Breathing Garden
`play-breathing` · native · creative · first committed 2026-04-12 · impact 5/5 · effort M
`games/breathing.js`

**Now:** A two-column grid of fourteen near-identical dark rounded pills on flat near-black, each holding a small condensed title and a line of sage monospace ('4-7-8 RELAX / Anxiety · sleep'), then three green pill buttons - START, RESET, Guide: ON. It reads as a terminal menu, not a garden. The captured play and later frames are both scrolled past the canvas, so the breathing bloom itself never appears in either shot.

**Wrong with it:**
- Fourteen identical dark capsules in a 2-column grid with nothing to tell them apart but text - no icon, no colour, no imagery. The selected one (NADI SHODHANA) differs only by a slightly greener fill and is easy to miss.
- The grid is ragged: titles that wrap to two lines ('BHRAMARI · BEE HUM', 'KAPALABHATI · SKULL SHINE', 'PHYSIOLOGICAL SIGH') make their pill taller than the one beside it, so every row is a different height and the two columns never line up. This is the sloppy-composition fault - nothing shares a silhouette with anything.
- Nothing on the screen is botanical. A game called Breathing Garden shows one 🌸 in the header and otherwise pure DM Mono green-on-black, and the ◆ (advanced) and 🔈 (audible) badges are rendered at 0.6rem, under the 0.7rem floor and too small to read as icons.

**Background now:** Nothing of its own. The page is the shared native shell: radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, --shell-bg 60%) on body, DM Mono from shared.css. The only painted-ish surface is the 360x260 canvas at games/breathing.js:289, which fills #0d100c then draws a radial gradient, one glowing circle with 4 CSS-coloured petal arcs and particles - and it is scrolled out of both captured frames. assetFiles = 0, no ART map, no manifest, no assets/games/breathing/ folder.

**Background wanted:** bg-breathing-540x960.jpg - a night garden seen close: dark leaves and stems crowding the left and right edges, one pale bloom lit centre-top by moonlight, falling to near-black at the bottom so the pill grid still reads. This is the game with the most headroom in the batch because it currently has no art at all.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-breathing-540x960.jpg` | 540x960 full-bleed, night garden, dark leaves framing the edges, one moonlit bloom top-centre, bottom 40% dropping to near-black for text legibility. | Replaces the shared shell radial gradient - the whole page is currently the same flat ground as 65 other natives. |
| `tech-{478,box,478relax,triangle,bhramari,sitali,ujjayi,sigh,nadi,energy,kapalabhati,lion,calm46,coherent}-64x64.png` | 14 files, 64x64 PNG-32 transparent, single-weight sage line-art glyphs on no background - a curled leaf for calm, a bee for Bhramari, a lion's head for Lion's Breath, a triangle of stems for Triangle, a moon for Nadi Shodhana. | Gives the fourteen identical capsules a distinguishing mark; right now the only difference between any two pills is the words inside them. |
| `bloom-petal-256x256.png` | 256x256 PNG-32 transparent, one soft painted petal, warm rim light on the outer edge, translucent toward the base, so 6-8 copies can be rotated around the canvas centre. | The canvas bloom is currently four hard-coded rgba arcs plus a radial gradient. One painted petal turns the whole breathing animation into art for the cost of a single file. |

**CSS to do:**
- games/breathing.js:301 (#BRlist) - grid-template-columns:1fr 1fr with variable-height children makes a ragged grid; add grid-auto-rows:1fr and align-items:stretch so all fourteen pills are the same height, and set the title div to min-height:2.2em so one-line and two-line titles match.
- games/breathing.js:341-342 - the ◆ and 🔈 badge spans are font-size:0.6rem, under the 0.7rem floor; raise to 0.7rem or swap them for the 64px icon PNGs at 18px.
- games/breathing.js:345 (selected pill) - background:rgba(122,179,86,0.22) alone is too quiet; add box-shadow:0 0 0 1px var(--sage),0 0 18px rgba(122,179,86,.22) so the current choice is obvious at a glance.
- games/breathing.js:289 (#BRcv) - background:#0d100c with border-radius:8px is a black box on a black page; add border:1px solid rgba(200,168,75,.22) and box-shadow:0 0 40px -8px rgba(122,179,86,.25) so the breathing vessel reads as lit.
- games/breathing.js:344 (pill title) - font-family:Bebas Neue at 0.7rem with the tag line also at 0.7rem gives the pill no typographic hierarchy; drop the tag to a lighter weight and raise the title to 0.82rem.

**Emoji as art:** 🌸 in the page title, 🔍 on the 'Not sure what you need?' quiz button, 🔔 / 🔕 on the Guide toggle, ◆ and 🔈 as the advanced/audible badges on every pill, ↺ on RESET, ▶ on START. 12 emoji, 7 distinct - they are the only non-text graphics on the screen.

**Readability:** The ◆ and 🔈 badges at 0.6rem are under the floor. The sage tag lines are 0.7rem at 0.85 opacity on near-black - legible but thin at arm's length. Touch targets pass comfortably: pills are min-height:64px and every .gb is min-height:48px.

### Mancala
`play-seedsow` · native · board · first committed 2026-04-12 · impact 4/5 · effort M
`games/seedsow.js`

**Now:** All three shots landed on the HOW TO PLAY overlay, not the board (capture reached "stuck-on:New Game" - the robot tapped RULES and never got out), so what I actually saw is a full-screen wall of 0.72rem DM Mono cream text on a dark card with gold section headings and gold hairline rules, plus an unlock toast for the song "Measured Steps" on boot. The board itself is never reached in any frame; from games/seedsow.js it is pure CSS - a linear-gradient(135deg,#5a3f22,#7a5c3a,#5a3f22) wood slab with radial-gradient pits and 6px gold radial-gradient dots as seeds, no image anywhere.

**Wrong with it:**
- The shell header behind the rules scrim is broken at 375px: the sunbeam counter wraps into two lines that read "sun (+8" / "0 pending)" - the number is separated from its icon - and the Sign in button is sliced to "Sign" by the right edge.
- The rules card is the entire first impression and it is a solid page of 0.72rem monospace with zero illustration - no board diagram, no seed sowing arrow, nothing showing the counterclockwise loop the text spends four paragraphs describing.
- Every icon in the game is an emoji glyph (lightbulb HINT, book RULES, curved-arrow UNDO, seedling in the rules title) so the control row has no visual relationship to the wood-and-seed board it sits under.

**Background now:** Nothing of its own. The shell's single radial-gradient(1200px 600px at 70% -10%, #1a2a20, --shell-bg) from play/shell.css, shared with 65 other natives. bgImage 0, assetFiles 0.

**Background wanted:** A painted night-garden tabletop: dark moss-green cloth under the board, warm lantern glow falling from the upper right, out-of-focus greenhouse glass and one leaf silhouette at the top edge. It is a tabletop board game and it currently floats on a bare gradient with nothing under it.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-seedsow-750x1334.jpg` | 750x1334 full-bleed, near-black moss cloth, warm lantern falloff from upper right, blurred glass and one leaf silhouette top edge, centre kept quiet so the board reads | replaces the shared shell radial gradient; gives the board a surface to sit on instead of floating in a void |
| `board-seedsow-960x420.png` | 960x420 transparent PNG, carved olive-wood mancala board seen slightly from above, 12 pits plus 2 end stores, visible end grain, warm gold rim light on the top lip, cool shadow inside each pit | replaces the .ss-board linear-gradient(#5a3f22,#7a5c3a) and the radial-gradient .ss-pit holes - the whole board is currently three CSS gradients |
| `seed-seedsow-48x48.png` | 48x48 transparent PNG, one painted amber seed husk with a specular highlight and a soft drop shadow; ship 3 rotation variants in a 144x48 strip | replaces .ss-seed, a 6px radial-gradient dot - 48 of these dots are the only thing that moves during play |
| `store-seedsow-160x340.png` | 160x340 transparent PNG, a deeper carved end bowl with a lit rim, one warm-toned for the player store and one coral-toned for the AI store | replaces .ss-store, currently a radial-gradient pill with a 30px border-radius that reads as a rounded rectangle, not a bowl |

**CSS to do:**
- games/seedsow.js line 80, #SSrulesOV .card: font-size 0.72rem is at the legibility floor for a full page of body copy - raise to 0.8rem and cap the card at max-height 78vh so the scroll is obviously a scroll.
- games/seedsow.js line 55, .ss-pit: min-height 46px is under the 48px touch floor - raise to 48px.
- play/shell.css header: give the sunbeam counter white-space:nowrap and collapse the music pill to its glyph under 400px, so the counter stops wrapping into "sun (+8 / 0 pending)" and Sign in stops clipping.
- games/seedsow.js line 45, .ss-board: add a background-image slot layered over the existing gradient so board-seedsow-960x420.png can drop in without touching the grid layout.
- games/seedsow.js line 76, .ss-banner: it sits at top:50%/left:50% of the board with position:absolute and the board has overflow:hidden - at 375px a longer capture message will clip; add max-width:88% and white-space:normal.

**Emoji as art:** Lightbulb on HINT, book on RULES, curved arrow on UNDO, refresh arrow on New Game, seedling in the rules card title, ladybug in the shell header. 7 distinct emoji, 16 total - they are the only iconography in the game.

**Readability:** Rules card body is 0.72rem DM Mono over a full screen of dense text - right at the 0.7rem floor. .ss-pit min-height 46px is under the 48px touch floor. Shell header counter wraps into a misordered "sun (+8 / 0 pending)" and Sign in is clipped to "Sign" at 375px.

**Music chip:** The header music pill takes roughly 140px of the 375px bar and squeezes the sunbeam counter into a two-line wrap reading "sun (+8" / "0 pending)", and pushes Sign in off the right edge where it is clipped to "Sign". Visible in play-seedsow-2play.png and -3later.png. This is the shell header pill, not a free-floating chip - it overlaps nothing, it just eats the width.

**Looks broken** (confirmed on a second look, severity ugly)**:** play-seedsow-2play.png, header row: the sunbeam counter is broken across two lines so it reads "sun (+8" above "0 pending)" with the value separated from its icon, and the Sign in button is sliced by the viewport at 375px so only "Sign" is visible. Confirmed at 2x in the cropped header. Note this is the shared shell header, so it likely affects every native whose counter carries a "(+8 pending)" suffix. The game itself is not broken - the robot simply never left the rules overlay.

### Bloom Wheel
`play-bloomwheel` · native · creative · first committed unknown · impact 4/5 · effort S
`games/_inline/bloomwheel.js`

**Now:** The top 40 percent of the phone is an empty near-black square with a single 3px gold dot at its centre. The mandala guide circle and spokes are drawn at 6 and 3 percent alpha over an identical #0d100c fill, so on a phone they are invisible. Under it sit thirteen flat CSS circles in the house palette wrapped as ten plus an orphan row of three, then two rows of dark rounded buttons whose sub-labels are grey caps too small to read.

**Wrong with it:**
- The playfield reads as an empty black rectangle. ctx fills #0d100c (bloomwheel.js:183), then strokes the guide circle at rgba(74,124,53,0.06) and the symmetry spokes at rgba(74,124,53,0.03) (lines 184-187) — on a #0d100c ground that is invisible. Nothing shows you where the wheel is or how many petals you picked until after you draw.
- The palette wraps 10 + 3, leaving a centred orphan row of three dangling under a full row of ten, and two of the thirteen swatches are the same colour: #e8dcc8 appears at index 3 and index 11 of _bwPalette (bloomwheel.js:207), so there is a visible duplicate cream circle.
- The button sub-labels PETALS, DRAW MODE, BRUSH, CANVAS and IMAGE are font-size:clamp(0.32rem,0.9vw,0.38rem) (bloomwheel.js:224), which resolves to 5.1px at 375px — grey caps too small to read at all.
- The canvas is a 12px-radius rectangle with background:#0d100c meeting the page's shared gradient on a hard edge, so the drawing surface has no frame and no separation from the shell.

**Background now:** Nothing painted. The canvas element carries background:#0d100c (bloomwheel.js:36) and every frame refills the same #0d100c (line 183). The page ground is shell.css's shared radial gradient. assetFiles is 0; the only asset URL in the file is a .png filename fragment for the save-image download name.

**Background wanted:** Keep the ground dark so strokes pop, but the canvas needs a visible wheel behind them: assets/games/bloomwheel/wheel-plate-840x840.png — dark slate with faint concentric sage rings, a small gold hub bloom and a soft radial vignette — plus a painted rim so the square canvas is a wheel and not a void.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `wheel-plate-840x840.png` | 840x840 opaque. Near-black slate ground with four concentric sage rings at 10-14 percent opacity, a small warm gold hub bloom at centre, and a radial vignette darkening the corners. | Replaces the flat #0d100c fillRect at bloomwheel.js:183 so the empty canvas reads as a spinning wheel with a centre, instead of the black hole it is now. |
| `wheel-rim-880x880.png` | 880x880 transparent PNG. A painted brass-and-vine ring with warm rim light on the upper left and a cast shadow on the lower right; the centre 840px is fully transparent. | Frames the canvas so the square drawing surface has an edge, replacing the bare border-radius:12px against black (bloomwheel.js:36). |
| `petal-guides-840x840-4.png / -8.png / -12.png` | Three 840x840 transparent overlays showing 4, 8 and 12 faint gold sector spokes radiating from the hub, roughly 15 percent opacity, with a slightly brighter first spoke. | Swapped when the player taps 4/8/12 PETALS, so the symmetry choice is visible before the first stroke. Today the only feedback is a highlighted button and 3 percent alpha spokes nobody can see. |
| `brush-tips-256x64.png` | 256x64 sprite, four 64x64 cells: round, chisel, spatter and ribbon brush marks painted in cream on transparent. | Replaces the bullet character standing in as the brush indicator on the BRUSH button (visible as a small green dot in play-bloomwheel-2play.png). |

**CSS to do:**
- Guide strokes (bloomwheel.js:184-188) — rgba(74,124,53,0.06) for the circle and 0.03 for the spokes are invisible over the #0d100c fill. Take them to roughly 0.18 and 0.10, and take the gold hub from rgba(212,168,67,0.15) to 0.5. This one change is what makes the playfield stop reading as empty.
- The _bls sub-label style (bloomwheel.js:224) — font-size:clamp(0.32rem,0.9vw,0.38rem) resolves to 5.1px at 375px. Raise to clamp(0.62rem,2vw,0.72rem), or delete the sub-labels and fold the word into the button.
- The palette swatch style (bloomwheel.js:211) and the auto swatch (line 218) — width/height clamp(28px,8vw,36px) is a 30px tap target with no wrapper. Wrap each in a 48x48 hit div exactly as colorgarden.js:158 already does.
- The MORE button (bloomwheel.js:248) — min-height:40px and font-size:0.55rem; raise to 48px and 0.7rem.
- _bwPalette (bloomwheel.js:207) — #e8dcc8 is listed twice (index 3 and index 11). Replace one with a rose (#c4849a) so the row is thirteen distinct colours.
- The canvas element (bloomwheel.js:36) — background:#0d100c with border-radius:12px meets the page ground on a hard edge. Add box-shadow:0 0 0 1px rgba(200,168,75,.18), 0 8px 30px rgba(0,0,0,.6) until the painted rim exists.
- palDiv (bloomwheel.js:208) — 13 swatches wrap to 10 + 3. Constrain max-width so they wrap 7 + 6 (or 5 + 4 + 4) instead of leaving one orphan row.

**Emoji as art:** Every icon in the game is a text glyph: the mandala flower, radial asterisk, kaleidoscope diamond, mirror arrow, quad star and freehand pencil are the draw-mode names (bloomwheel.js:277); a bullet is the brush-size indicator; a floppy-disk emoji is SAVE and a multiplication sign is CLEAR. There is not one painted icon in the file.

**Readability:** Sub-labels resolve to 5.1px at 375px — unreadable. The MORE button label is 0.55rem (8.8px), also under the floor. Touch: palette swatches are 30px and MORE is 40px, both under 48px. The 4/8/12 PETALS and MANDALA buttons are 56px min-height and fine.

**A "looks broken" claim here was refuted on a second look.** Refuted. In play-bloomwheel-2play.png (hi-res) the "flat black" playfield is not featureless — the mandala guide ring is traceable right across the canvas (top arc, both sides, bottom curve) with the gold hub dot at centre; it is faint at 1x but present, so it is low-contrast, not missing. The canvas holds no strokes because the capture robot only tapped "LET'S PLAY" (capture.taps) and never dragg

### Garden Lines
`play-gardenlines` · native · puzzle · first committed 2026-04-12 · impact 4/5 · effort M
`games/gardenlines.js`

**Now:** A Qwirkle board: a 5x6 grid of empty cells outlined in a barely-visible dashed sage on near-black filling the top half with nothing. Below it the hand - six 48px flat candy-coloured squares (grass green, hot pink twice, cream, mustard gold twice) each carrying one emoji and a tiny dark corner glyph. Two thin outlined SWAP TILES and NEW buttons underneath.

**Wrong with it:**
- The playfield reads as empty: 30 cells outlined at rgba(74,124,53,0.14) on a rgba(8,12,6,0.55) ground make a ghost grid you can barely see, so the top half of the screen looks like a rendering that failed rather than a board waiting for tiles.
- The tile colours (#E07A8A pink, #5B9BD5 blue, #A96BB8 purple, #D8C7A8 cream) are flat, saturated candy against the midnight ground - nothing in the house palette, no border, no bevel - and the cream tile and the mustard tile sit close enough in value that they read as the same tile at arm's length.
- Five emoji in five different rendering styles are doing all the art: a flat leaf, a glossy 3D mushroom, a gradient sun, a glass droplet, a flat seedling. The colourblind corner glyph at 0.7rem in near-black on top of a saturated tile reads as a smudge of dirt, not as information. The hand also wraps 5+1, stranding the last tile centred alone on its own row.

**Background now:** None. games/gardenlines.js paints .GLboardWrap as rgba(8,12,6,0.55) with a 1.5px sage border over the shared shell radial gradient; the score banner is a 135deg near-black gradient. Zero images, zero assets folder, ownCssKB 0, bgImage 0.

**Background wanted:** bg-gardenlines-540x960.jpg - a dark potting-shed tabletop seen from above: weathered boards running diagonally, a soft gold lamp pool behind the board area, heavy vignette at the edges, so the grid sits on a surface instead of in empty space.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `gl-tile-faces-576x96.png` | 576x96 PNG, transparent, six 96x96 painted botanical tokens: fern frond, toadstool, seedling, sun, dew drop, blossom - house palette, warm rim light, big readable silhouettes | Replaces the six emoji at games/gardenlines.js:11, which ARE the game's art and which render in five mismatched styles. |
| `gl-tile-plate-96x96.png` | 96x96 PNG, transparent, 9-slice-safe ceramic tile plate with a bevelled edge, top rim light and a dark underside, designed to sit over a colour tint | Replaces the flat CSS colour square in .GLtile so each piece has an edge and a body instead of being a colour swatch. |
| `gl-cell-empty-96x96.png` | 96x96 PNG, transparent, a shallow pressed socket in wood with a soft inner shadow | Replaces the near-invisible dashed .GLempty.inbounds outline so the empty board reads as a set of sockets waiting for tiles. |
| `gl-seed-bag-64x64.png` | 64x64 PNG, transparent, a small linen drawstring seed bag, warm gold rim light | Gives the 'Bag 96' counter an icon; it is currently bare monospace text at 0.7rem. |

**CSS to do:**
- COLORS in games/gardenlines.js:12: darken and desaturate toward the house palette - keep #6BAD4A, swap #5B9BD5 to #5A7E96, #A96BB8 to #7E6497, #E07A8A to #B9636F, #D8C7A8 to #C2B08C - so the hand stops being candy against midnight.
- .GLtile: add border:1px solid rgba(0,0,0,0.45) and box-shadow:inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 4px rgba(0,0,0,0.6) so each tile has an edge and a body.
- .GLempty.inbounds: raise the dashed border from rgba(74,124,53,0.14) to rgba(74,124,53,0.30) and add background:rgba(122,179,86,0.04) so the board is visible before the first tile lands.
- .GLscore: add position:sticky;top:0;z-index:5 with the panel background - at 375x667 the column runs roughly 90px taller than the viewport, so the score and turn banner scrolls off the moment the player looks at their hand (visible in the play frame, where the banner is half cut at the top edge).
- .GLturn: raise font-size from 0.68rem to 0.72rem - it is under the 0.7rem floor.
- .GLcsym: move the colourblind glyph to a 10px notch at the tile's top-left in cream at 70% opacity instead of dark-on-saturated inside the face.

**Emoji as art:** Blossom, leaf, droplet, sun, seedling and mushroom emoji are literally the six game pieces (SHAPES at games/gardenlines.js:11). The entire art of the game is one emoji per tile, on a flat colour square.

**Readability:** The 'YOUR HAND - tap a tile, then tap the board' hint wraps to two lines with 'board' alone on the second. .GLturn is 0.68rem, under the floor; .GLscoreLbl and .GLbagRow sit exactly on 0.7rem. Tiles are exactly 48px, so they only just meet the touch minimum and lose the margin the moment the board scrolls.

**Music chip:** Not visible in the play frame - the page has scrolled and the header sits above the fold. The capture's playText shows the same 'Garden Lines / Music / (+5 pending) / Sign in' string as Daily Bloom, so it will hit the identical title-eaten-and-Sign-in-clipped header overflow whenever the header is on screen.

### Bee's Pollen Sort
`play-colorsort` · native · puzzle · first committed 2026-04-23 · impact 4/5 · effort M
`games/colorsort.js`

**Now:** Amber-outlined rounded-bottom rectangles on flat near-black, stacked with solid colour swatches - marigold, rose, lavender, sage, amber, berry - each carrying a small white Unicode glyph (● ✕ ✚ ▲ ◆ ★ ■). Nothing is painted; there is no glass, no hive, no bee, despite the game being called Bee's Pollen Sort. Below the vials, a run of outlined pill buttons with OS emoji icons and, between them, an enormous empty black band filling roughly a third of the screen.

**Wrong with it:**
- The vial row wraps badly and leaves one orphan empty vial alone on a second row, hanging under the gap between vials 3 and 4, with a wide black void either side of it. The playfield is ragged, not composed.
- A third of the frame - the whole band between the vials and the Moves row - is empty flat black. The playfield is pinned to the top of the viewport instead of centred, so the game looks like it ran out of content.
- The button icons are three different OS emoji drawn in three different styles: 🏺 a terracotta amphora for 'Glass', ✨ for 'Classic', 📅 for the daily - and that calendar emoji renders as a full-colour sheet reading JULY 17 sitting directly next to the label 'Daily #247'. A wrong date baked into a picture, beside the right one in text.
- Rose #E47489 and Berry #8E3C5E are adjacent in the palette and nearly indistinguishable at 26px on a black ground - the glyphs (▲ vs ✕) are doing all the work, which is exactly the fallback the palette comment says it wants to avoid needing.

**Background now:** Nothing of its own. The shared play/shell.css radial gradient, unmodified. The vials are .PStube - a 2px rgba(220,180,120,0.35) outline with a dashed top border and a faint inner shadow; the pollen units are .PSpol, a flat hex fill with border-radius:3px and a Unicode glyph. bgImage:0, assetFiles:0, assetUrls empty.

**Background wanted:** A painted hive wall: warm amber honeycomb receding into shadow, a dark wooden shelf running under the vials so they sit on something, a soft lamp glow from above, deep near-black at the bottom to hold the controls. This game has the strongest theme hook in the batch (bee, pollen, vials) and uses literally none of it.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/colorsort/bg-hive-540x960.jpg` | 540x960 full-bleed. Amber honeycomb wall softly out of focus, a dark waxed-wood shelf across the upper third where the vials stand, warm lamp glow from top-centre, near-black bottom 30% for the control stack. | Replaces the bare shell gradient and gives the vials a surface. Kills the empty black band by making it part of a room. |
| `assets/games/colorsort/vial-glass-108x300.png` | 108x300 transparent PNG. A painted glass vial: rim highlight down the left edge, a warm reflection on the right, a small cork collar at the top, a soft contact shadow at the base. Interior fully transparent so pollen shows through. | Replaces the .PStube CSS outline. Turns eight identical rectangles into eight readable objects. |
| `assets/games/colorsort/pollen-grain-104x52.png` | 104x52 transparent, greyscale/white so it tints per colour. A soft clustered pollen puff with a rim light and a slightly irregular edge, plus a second variant frame for stack variety. | Replaces the flat 3px-radius colour swatches. Currently the units look like a spreadsheet legend, not pollen. |
| `assets/games/colorsort/bee-96x96.png` | 96x96 transparent. A painted bee in three-quarter view, amber and near-black bands, warm rim light, soft wing blur. | Replaces the 🐝 OS emoji in the header - the game's title character is currently a system font glyph. |
| `assets/games/colorsort/icons-controls-144x48.png` | 144x48 transparent, three 48x48 cells: a calendar leaf for Daily, a glass vial for the Glass skin, a stack of pollen for Classic. Sage and gold line art on transparent. | Replaces 📅, 🏺 and ✨ - three mismatched OS emoji, one of which shows the wrong date. |

**CSS to do:**
- The vial container in games/colorsort.js: force a fixed grid (grid-template-columns:repeat(5,1fr) with justify-items:center) so ten vials read as 5+5 instead of 7 plus one orphan on row two.
- The playfield wrapper: it is top-pinned, leaving a third of the screen empty black. Give it min-height:52vh and align the vial grid to centre so the composition fills the frame.
- .PStube (colorsort.js:191): width clamp(48px,12vw,54px) puts the tap target right on the 48px floor at 375px - raise the lower clamp bound to 52px.
- .PSpol (colorsort.js:194): border-radius:3px reads as a tile. Once pollen-grain art lands make this a background-image with the hex as a tint; until then raise the radius and soften the inset shadows.
- POLLEN palette (colorsort.js:17-27): Rose #E47489 and Berry #8E3C5E are too close in hue for adjacent vials at 26px. Push Berry toward violet or reorder so they are never both in an 8-colour level.
- The 'Daily #247 · 8 colors · 5 tall' caption is small muted italic mono - raise to 0.72rem cream; it is the only thing telling the player what puzzle they are on.
- The Undo button in its disabled state is nearly invisible against the black - raise disabled opacity or give it a dashed border so it reads as 'nothing to undo' rather than 'missing'.
- 'Glass' and 'Classic' are unlabelled toggles with no group heading - add a 0.62rem 'Vial' / 'Pollen' caption above each pair so they stop looking like stray buttons.

**Emoji as art:** Everywhere. 🐝 is the title character in the header, 📅 fronts the Daily button (rendering as a colour calendar reading JULY 17 next to the label 'Daily #247'), 🏺 fronts the Glass skin toggle, ✨ fronts Classic, ⏱ the timer, ↶ Undo, ↻ Reset. The pollen units themselves use Unicode geometry glyphs (● ◆ ▲ ■ ★ ▼ ✚ ✕ ◐ ✦) as their colourblind markers, so the playfield content is also font glyphs. 12 distinct emoji, zero image files.

**Readability:** Vial width clamps to 48px at the low end - on the 48px floor exactly, no margin. The 'Daily #247 · 8 colors · 5 tall' line and the disabled Undo label are both low-contrast small text on black. The colourblind glyphs are the right instinct but they are rendered at 0.74rem inside a 26px swatch, so they are small and the two magenta-family colours lean on them heavily.

### Daily Bloom
`play-dailybloom` · native · pattern · first committed 2026-04-12 · impact 4/5 · effort M
`games/dailybloom.js`

**Now:** The play frame is the WORD RECALL exercise: a gold Bebas title, an italic cream subtitle, five dark rounded word tiles with hairline sage borders laid 3-over-2, five small progress dots, and then nothing at all. The bottom 45% of the screen is bare near-black down to the green Add to Home Screen button. Boot is a full-screen how-to wall of gold headings and cream body text with a yellow LET'S PLAY bar.

**Wrong with it:**
- Everything below the progress dots (roughly y=300 to y=520, about 45% of the frame) is empty near-black. The exercise floats at the top of a void with no ground, no horizon and nothing anchoring it.
- The header's right side is clipped: the Sign in CTA is cut vertically by the viewport edge and reads 'Sign', and the sunbeam readout wraps into two interleaved lines showing 'sun (+5' over '0 pending)', which is unreadable as a number.
- The five word tiles are identical flat dark rectangles with a 1.5px sage hairline: no depth, no card plate, no glow. They read as disabled form fields rather than something to memorise, and the 3+2 wrap leaves a ragged centred stub row underneath.

**Background now:** Nothing of its own. #DBpan (games/dailybloom.js:76) sets no background, so the shared play/shell.css single radial sage glow over #0d100c is the entire backdrop. assetFiles 0, bgImage 0, no ART map, no manifest, no assets/games/dailybloom/ folder.

**Background wanted:** bg-dailybloom-540x960.jpg - a dim greenhouse potting bench before dawn: misted glass panes across the top, out-of-focus seedling trays low, one warm gold lamp glow at bottom-left, top third held near-black so the HUD and the Bebas titles stay readable.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-dailybloom-540x960.jpg` | 540x960 full-bleed JPG, dawn greenhouse interior, misted glass top, blurred seedling trays low, warm gold lamp glow bottom-left, top third near-black | Replaces the shared radial-gradient void; gives the exercise a room to sit in and kills the empty bottom half. |
| `bloom-progress-petals-256x64.png` | 256x64 PNG, transparent, eight 32x32 petal glyphs in filled and unfilled states on one sheet | Replaces the eight plain 10px CSS .DBdot circles so the session progress reads as a flower opening, matching the game's name. |
| `db-domain-icons-384x128.png` | 384x128 PNG, transparent, six 64x64 icons: memory (seed head), attention (eye in leaves), speed (wind), language (etched word), logic (branch fork), reaction (dew drop) | Replaces the Bebas text labels in .DBhubChip and .DBexplainDom, which are currently the only thing marking each exercise's domain. |
| `db-tile-plate-160x64.png` | 160x64 PNG, transparent, 9-slice-safe painted card plate with warm rim light on the top edge and a soft drop shadow | Replaces the flat rgba(26,36,22,0.75) rectangle behind .DBopt and the word-recall tiles so answers read as objects instead of form fields. |

**CSS to do:**
- #DBpan: add min-height:calc(100vh - 240px) and display:flex;flex-direction:column;justify-content:center so the exercise is vertically centred rather than stranded at the top of an empty column.
- .DBopt and the word-recall tiles: add box-shadow:inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 14px rgba(0,0,0,0.5) so the tiles sit on a surface instead of lying flat on the page.
- .DBdot: raise width/height from 10px to 12px and give .DBdot.done a linear-gradient(180deg,#c8a84b,#7ab356) fill - at 375px the current 10px hollow circles are almost invisible.
- .DBexTitle: raise font-size from 1.05rem to 1.3rem - the Bebas exercise title currently reads smaller than the cream subtitle beneath it, inverting the hierarchy.
- .DBexDesc: raise colour from rgba(232,220,200,0.6) to 0.78 - 0.72rem italic at 60% opacity on near-black is at the legibility floor.

**Emoji as art:** The ladybug in the header (feedback button), and inside the exercises a check and cross as answer marks, arrow glyphs for the flanker task, and a single leaf for the streak. Every icon in the game is a text glyph or emoji; there is no drawn art anywhere in games/dailybloom.js.

**Readability:** .DBexDesc is 0.72rem italic at 60% cream opacity on near-black - right at the floor. The wallet's '(+5 pending)' wrapping across two lines with the '0' balance interleaved is genuinely unreadable. Option buttons are min-height 48px so touch targets pass.

**Music chip:** The 'Music' pill covers the game title slot. music-player.js:307 rewrites #shell-music-btn to a labelled 'Music' pill and stamps an inline min-width:96px, which beats the width:40px !important narrow-phone rule at play/shell.css:211. That starves .shell-title{flex:1} to zero width, so 'Daily Bloom' is in the DOM (it appears in the capture's playText) but is not visible in the frame at all, and the oversized row pushes the Sign in CTA off the right edge.

**Looks broken** (confirmed on a second look, severity ugly)**:** play-dailybloom-2play.png: the Sign in button is sliced vertically by the right viewport edge, showing only 'Sign'; the game title 'Daily Bloom' is in the capture playText but renders at zero width behind the music pill; the sunbeam wallet wraps into two interleaved lines.

### Color Garden
`play-colorgarden` · native · creative · first committed 2026-04-12 · impact 4/5 · effort M
`games/colorgarden.js`

**Now:** Almost the whole phone is a colour-picker panel: a large HSV wheel, a lilac hex bar reading #9D8AB3, a BRIGHTNESS ramp and two rows of six flat swatches, all on the shared dark ground with gold-bordered pills above. The coloring page itself — real 1200x1200 line art, and there are 50 of them in assets/coloring/ — is a bright cream slab pushed off the top of the screen, with roughly 20px of it and the tip of one black outline visible.

**Wrong with it:**
- The picture and the palette cannot share a 375x667 screen. imgWrap is aspect-ratio:1 up to 480px wide (colorgarden.js:54), so the page alone wants about 375px of height; add the button rows, the wheel, the 44px hex bar, the slider and two swatch rows and the total blows past 667. The player has to scroll between the colour they are picking and the region they are filling on every single tap. In the landing frame the picture is 95 percent off-screen.
- The page panel is a flat #faf5ee rectangle with a 1px rgba(122,179,86,0.15) border butting straight into the near-black shell — the brightest and the darkest things on screen meet on a hairline, with no frame, no paper texture, no mat and no shadow.
- There is no garden in Color Garden. The composition is a paint utility: wheel, hex string, brightness ramp, swatch grid. None of the midnight-greenhouse dressing the rest of the fleet carries is present, and the largest non-wheel element is a 44px bar whose entire content is the hex code #9D8AB3, which tells a player nothing.
- BRIGHTNESS is set at font-size:0.55rem (colorgarden.js:135), which is 8.8px at 375px — a label under the floor sitting directly above the widest control on the screen.

**Background now:** No image and no gradient of its own. The coloring surface is ctx.fillStyle='#faf5ee' filled behind the line art (colorgarden.js:381 and 428) inside imgWrap, which is background:#faf5ee with a 1px sage border (line 54). Page ground is shell.css's shared radial gradient. The art hook already exists and works: BASE='assets/coloring/' with a manifest.json listing 50 real 1200x1200 line-art pages (colorgarden.js:11-12, 356-391).

**Background wanted:** assets/games/colorgarden/paper-1200x1200.jpg multiplied under the line art in place of the flat #faf5ee, plus a painted frame around imgWrap so the cream sheet meets the black shell through something. The dark ground behind should gain a soft top vignette so the sheet has a halo rather than a cut edge.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `paper-1200x1200.jpg` | 1200x1200, warm cream laid-paper texture with subtle fibre grain, very slight corner darkening, seamless enough to sit under any page. Matches the 1200x1200 line-art pages exactly. | Replaces the flat #faf5ee fill at colorgarden.js:381 and 428 so the coloring sheet reads as paper instead of a bright white slab, and softens the contrast jump against the near-black shell. |
| `page-frame-1024x1024.png` | 1024x1024 transparent PNG. A painted wooden or vellum frame with a soft deckle inner edge and four small brass pins at the corners; the centre is fully transparent so the page shows through. | Wraps imgWrap (colorgarden.js:54) so the cream page has a mat and an edge, replacing the 1px rgba(122,179,86,0.15) hairline where the brightest and darkest things on screen currently meet. |
| `cg-swatch-tray-720x180.png` | 720x180 transparent PNG. A painted paint-tray strip: two rows of six shallow wells with a wet highlight in each and a warm wooden lip. | Sits behind the two quick-palette rows so the twelve CSS circles read as pans of paint, not generic colour dots. Currently the palette is the plainest element on a screen that is mostly palette. |
| `cg-thumb-01.png through cg-thumb-50.png` | 96x96 each, transparent or cream ground, a downsampled thumbnail of each page's line art with a 2px cream border. | Gives PREV and NEXT something to show. Today the only identity a page has is the text 'Page n / 50', so choosing among 50 pictures is blind paging. |

**CSS to do:**
- imgWrap (colorgarden.js:54) — aspect-ratio:1 with max-width:480px forces a square that cannot coexist with the palette at 667px. Change to max-height:42vh with the view canvas at object-fit:contain, or move the wheel and slider into a collapsible drawer, so the picture and the colour you are picking are on screen together.
- imgWrap (colorgarden.js:54) — background:#faf5ee with a 1px rgba(122,179,86,0.15) border. Add box-shadow:0 10px 40px rgba(0,0,0,.65), 0 0 0 6px rgba(200,168,75,.12) so the sheet has a mat and a shadow rather than a hairline against black.
- slLbl / BRIGHTNESS (colorgarden.js:135) — font-size:0.55rem is 8.8px at 375px. Raise to 0.7rem.
- colorDisplay (colorgarden.js:128) — a 44px full-width bar whose only content is a hex string in 0.7rem mono. Shrink to 28px, or replace the hex with the paint's name so the second-largest element on the screen says something a player cares about.
- .cg-quick swatches (colorgarden.js:162) — 22 to 26px circles inside correct 48px hit areas. The hit target is right but the visible dot is too small to judge a colour by; take the swatch to 34px inside the same 48px hit div.
- sliderCanvas (colorgarden.js:144) — border-radius:6px is on the canvas but the sliderCursor is a bare 4px white bar with a black outline; give it a rounded cream cap and a soft shadow so it stops reading as a rendering artefact in the middle of the ramp.

**Emoji as art:** Light — a floppy-disk emoji on SAVE, an undo arrow, a multiplication sign on CLEAR, and triangle arrows on PREV/NEXT. Nothing stands in for the actual game art, because the actual game art is real: 50 painted line-art pages already ship in assets/coloring/. The problem here is presentation, not missing art.

**Readability:** One text fault: the BRIGHTNESS label at 0.55rem is 8.8px at 375px. The hex readout is 0.7rem which is exactly at the floor. Touch targets are handled properly — colorgarden.js:158 wraps every 22-26px swatch in an explicit 48x48 hit div, and the floating undo and reset buttons are 48x48. The real readability issue is spatial: the picture you are colouring is off-screen while you pick the colour.

### Memory Meadow
`play-recall` · native · pattern · first committed 2026-04-12 · impact 4/5 · effort L
`games/recall.js`

**Now:** Three gold-outlined boxes in a row near the top of an otherwise empty near-black screen, each holding one glossy colour emoji (carrot, mushroom, apple) with a tiny grey caption under it. Below them a gold 2s counter, then roughly 380px of pure empty black down to the New Game pill and the Add to Home Screen button.

**Wrong with it:**
- The whole game is Noto Color Emoji clipart. A 3D glossy red apple with a specular highlight and a cartoon toadstool sit on a matte near-black ground - the shading, outline weight and colour temperature all fight the midnight greenhouse look. Nothing on screen is painted for this game.
- The bottom two thirds of the frame is dead black. The panel is min-height:340px (games/recall.js line ~30) and in the WAIT phase it holds three short lines, so about 380 of the 667px screen is empty. Nothing is called Memory MEADOW anywhere on screen - there is no meadow, no ground, no horizon.
- The captions are font-size:0.5rem at opacity:0.6 (games/recall.js lines ~66 and ~110) - roughly 8px of grey on near-black, well under the 0.7rem floor and effectively unreadable at arm's length.
- The cards are flat rgba(212,168,67,0.15) rectangles with a 2px gold border and no shadow, glow or depth - three identical rounded boxes sharing one silhouette, floating with nothing under them.

**Background now:** None of its own. The shared play/shell.css radial gradient over near-black. Zero asset files, zero background-image, zero inline SVG.

**Background wanted:** A meadow the game is named after: a full-bleed 540x960 painted night meadow - grass silhouettes along the bottom third, a low warm moon glow, soft bokeh seed heads - dark enough that gold cards read on top of it. That alone fills the dead 380px and gives the cards a ground.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/recall/bg-meadow-540x960.jpg` | 540x960 full-bleed, night meadow, grass and seed-head silhouettes across the bottom third, low warm moon glow upper right, deep near-black sky | fills the empty bottom two thirds and delivers on the name Memory Meadow |
| `assets/games/recall/sym-*.png (20 files)` | 20 PNGs at 96x96 with alpha, one per SYMBOLS entry in games/recall.js (Fern, Bloom, Sun, Spore, Pine, Grain, Clover, Cactus, Palm, Leaf, Hibiscus, Bouquet, Rose, Tulip, Lavender, Berry, Grape, Root, Corn, Apple), painterly, warm rim light, big readable silhouette, sage and gold and rose on transparent | replaces all 20 colour emoji - this is the entire visual content of the game |
| `assets/games/recall/card-face-148x172.png` | 148x172 (2x of the 74x86 card) nine-slice-safe card face: dark pressed-earth panel, thin gold rule inset 4px, soft inner shadow | replaces the flat rgba gold tint so the three cards have depth instead of reading as coloured rectangles |
| `assets/games/recall/card-face-selected-148x172.png` | same size, sage-lit variant with a warm outer glow | the selected state is currently only a border-colour swap in _RCT, which is nearly invisible on a phone |

**CSS to do:**
- #RCpan - drop min-height:340px and instead let the panel centre vertically in the remaining viewport, so the WAIT phase does not leave 380px of dead black
- the .name span inside each card (games/recall.js, the inline style font-size:0.5rem;opacity:0.6) - raise to 0.72rem and opacity 0.85; 8px grey is under the readable floor
- the card div (inline style width:74px;height:86px) - swap the flat background:rgba(212,168,67,0.15) for the card-face PNG and add box-shadow:0 6px 16px rgba(0,0,0,0.55) so the cards sit on the meadow rather than in front of it
- .shell-hdr - same fleet fault as pipe: #shell-signin is clipped to 'Sign' at 375px and the sunbeam readout wraps to two lines

**Emoji as art:** Total. All 20 symbols are colour emoji declared in the SYMBOLS array at the top of games/recall.js (fern, blossom, sunflower, mushroom, pine, grain, clover, cactus, palm, leaf, hibiscus, bouquet, rose, tulip, lavender, blueberry, grape, carrot, corn, apple). The refresh glyph on New Game and the ladybug in the shell header are the only other pictures on the page.

**Readability:** Fails twice. The card captions are 0.5rem at 0.6 opacity - about 8px of grey on near-black. The 'Remember these 3 symbols' line is 0.7rem at 0.6 opacity, right on the floor and dimmed under it. The shell header clips 'Sign in to save' to 'Sign'. Cards are 74x86 so touch targets pass.

**Music chip:** The injected chip sits top-left at about x=128 inside the sticky shell header band, in the gap between the ladybug button and the sunbeam readout. No control is covered, but the glowing pill is the loudest thing in the header and outshines the game's own back and help buttons.

### Fast Math
`play-numbergarden` · native · math · first committed 2026-04-12 · impact 4/5 · effort M
`games/numbergarden.js`

**Now:** A near-black column. A three-cell HUD strip reading 0 - 0 sits under a thin green-to-gold timer bar. Below, a small flat brown owl head jammed against the left edge next to a large cream 6 + 1 =, then a gold 7085 over a gold rule. Under that a 4x3 keypad of dark-green rounded buttons, then RULES and START pills.

**Wrong with it:**
- The mascot is a 68px inline-SVG stand-in and it does not read as an owl. It is a brown ellipse body, a tan belly ellipse, two triangle tufts and two cream eye circles with dot pupils (games/numbergarden.js:83-92). No wings, no body, no perch, and no abacus at all despite being called the abacus owl. Next to the crisp type it reads as a smudge or a moth.
- assets/games/numbergarden/abacus-owl-idle.png 404s and there is no assets/games/numbergarden/ directory at all. Line 66 builds paths for six PNGs - abacus-owl-{idle,happy,oops}.png and sprout-{idle,happy,oops}.png - and not one has been painted. The onerror hides the img so it fails silently to the SVG blob.
- The mascot is pinned hard-left against the screen edge and vertically off-centre against 6 + 1 =, while the answer line 7085 is centred on the page. Two different alignment systems in one row. The owl is not in a motivated group with anything - it just sits in the left gutter.
- The mode chips row, which is the game's main navigation (ADD SUB MUL MIX TABLES MAKE 10 MAKE 100 DIGIT SPAN FLASH ANZAN), is .ng-mode at font-size 0.62rem - under the 0.7rem floor.
- On the boot frame the rules card sits on top of the yellow LET'S PLAY button and dims it to a brown smear with the words half-lost, and the card's bottom cuts a sentence mid-word at 84vh with no scroll cue at all.

**Background now:** Nothing of its own. play/shell.css line 32 radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%). The only local colour is a 5px .ng-timebar with linear-gradient(90deg,#7ab356,#c8a84b) and a rgba(26,31,23,0.55) HUD strip. assetFiles 0.

**Background wanted:** bg-abacus-540x960.jpg - a dim study desk at night: a soroban lying in soft focus across the lower third, a warm lamp pool from the top left, ink-dark falloff at the edges so the keypad reads as lit paper on a dark desk rather than dark boxes on dark nothing.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `abacus-owl-idle.png` | 216x216 transparent (68px at 3x), painted round tawny owl perched on a soroban bead rail, warm gold rim light from the left, big readable silhouette with visible wings and feet, neutral eyes | Fills the live 404 at /assets/games/numbergarden/abacus-owl-idle.png and replaces the flat ellipse SVG. games/numbergarden.js:102 already loads it with an onerror fallback, so dropping the file in is the entire job. |
| `abacus-owl-happy.png` | 216x216 transparent, same owl, arched happy eyes, one wing raised, a faint gold sparkle over the shoulder | The mood system already switches art paths by mood (line 66); happy currently degrades to the same brown blob with a curved line for eyes. |
| `abacus-owl-oops.png` | 216x216 transparent, same owl, tilted head, dropped brow, one bead knocked loose off the rail | Third mood on the same hook; without it a wrong answer changes almost nothing on screen. |
| `sprout-idle.png` | 216x216 transparent, painted sage seedling with two leaf-arms and a face, warm rim light, on a small clay lip | The FLASH ANZAN master mascot at games/numbergarden.js:66; today it renders as a yellow ellipse with two green comma leaves. |
| `bg-abacus-540x960.jpg` | 540x960 full-bleed night study desk with a soroban in soft focus and a warm lamp pool top-left | The game has no background at all; the keypad and mascot float on the same shared gradient as 65 other natives. |

**CSS to do:**
- games/numbergarden.js:163 (.ng-mode) - font-size 0.62rem goes to 0.72rem. This is the game's primary mode navigation and it is currently below the readability floor.
- games/numbergarden.js:138 (.ng-stats) - font-size 0.62rem goes to 0.72rem, same reason; category / mode / best / streak are unreadable at arm's length.
- The mascot row - wrap #NGmascot and the problem text in one flex container with align-items:center; justify-content:center; gap:14px so the owl sits beside the sum instead of pinned to the left gutter while the answer below it centres on the page.
- games/numbergarden.js:168 (#NGrulesOV .card) - the card is max-height:84vh; overflow-y:auto with no affordance; add a bottom fade mask (mask-image: linear-gradient(180deg,#000 88%,transparent)) so it stops cutting sentences mid-word with no cue.
- games/numbergarden.js:167 (#NGrulesOV) - the rgba(5,8,4,0.88) scrim leaves the yellow LET'S PLAY button showing through as a dimmed brown slab with the text half-legible; raise the scrim to 0.95 so the button is cleanly hidden rather than half-there.

**Emoji as art:** Heavy. The whole rules wall is section-headed by emoji: target for Goal, gamepad for BASIC modes, brain for FOCUS modes, plus owl, book, lightning, chart, bulb, star, check and cross (21 emoji, 12 distinct). The owl emoji in the rules copy is literally standing in for the mascot the game cannot draw.

**Readability:** .ng-mode at 0.62rem and .ng-stats at 0.62rem are both under the 0.7rem floor. The rules card body is 0.72rem DM Mono running about forty dense monospaced lines. The HOW TO PLAY heading visible behind the modal on the boot frame is dark grey on near-black and effectively invisible. Keypad buttons are min-height 52px and mode chips min-height 48px, so touch targets pass.

### Word Sprout
`play-sprout` · native · word · first committed 2026-04-12 · impact 4/5 · effort M
`games/sprout.js`

**Now:** A grid of empty squares outlined in dim sage on near-black, most of it scrolled off the top of the frame, above a full-width CSS keyboard of 76px dark-olive keys in a plain system sans. A loose gold 'Not in word list' line floats between them. Nothing is painted; the only colour beyond grey-green is the gold toast. capture reached 'stuck-on:ENTER' — this IS the live board, just scrolled.

**Wrong with it:**
- The ENTER key label overflows its own key on both sides — the E starts left of the key border and the R touches the Z key. Root cause: play/shell.css:7 imports only Hanken Grotesk, so games/sprout.js:76 '.pw-key.wide{font-size:.85rem}' in Bebas Neue falls back to a much wider system sans that does not fit flex:1.8.
- The proportions are inverted. The keyboard (3 rows x 76px min-height, sprout.js:74) eats roughly 55% of the 667px screen while the board is width:min(260px,70vw) (sprout.js:37) and is half scrolled off the top. The thing the player is trying to read is the smallest object in the frame.
- Nothing on screen is a sprout. The game is called Word Sprout and there is no seed, no soil, no leaf, no growth — just a grey grid and a grey keyboard on black. The bottom third is keyboard, the top third is empty outlined boxes, and the horizon is nothing.
- 'Not in word list' is bare 0.72rem gold mono floating in the gap with no panel behind it — it reads as a stray label rather than feedback.

**Background now:** Nothing of its own. play/shell.css:32 radial-gradient(1200px 600px at 70% -10%, #1a2a20, #0d100c 60%) is the entire background; cells are rgba(13,16,12,.7) with a 2px rgba(74,124,53,.5) border, keys rgba(36,42,30,.95).

**Background wanted:** A painted seed bed along the bottom edge behind the keyboard, fading up through deep green-black to an empty night sky behind the board — quiet enough that the letter tiles stay the brightest thing, but it puts the game's own subject on the screen.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-sprout-540x960.jpg` | 540x960 full-bleed. Bottom 25%: dark tilled soil with one pale sprout breaking through, warm gold key-light from the upper left. Upper 75%: deep green-black graduating to #0d100c, a soft glow where the board sits. Heavy vignette. | The game currently has no background at all beyond the shared shell gradient; every native looks identical because of it. |
| `sprout-stage-96x96-1.png through sprout-stage-96x96-6.png` | Six 96x96 transparent painted growth stages: seed, split husk, two seed-leaves, true leaves, bud, open bloom. Warm rim light from the left, big readable silhouette at 48px. | One stage lights beside the board per guess row used, so the six guesses are a growing plant. Puts the title on the screen and gives the frame a subject. |
| `key-cap-64x84.png` | 64x84 nine-slice PNG: warm dark stone/wood key cap, 2px lit top edge, soft shadow at the bottom, transparent outside the rounded rect. | Replaces the flat rgba(36,42,30,.95) fill on .pw-key so the keyboard reads as objects rather than 26 identical grey boxes. |

**CSS to do:**
- play/shell.css:7 — the @import loads only Hanken Grotesk. Add Bebas Neue, DM Mono and Crimson Text to that import: every native asks for those three by name and silently falls back today. This one line fixes the ENTER overflow and the generic system-font look across the whole native fleet.
- games/sprout.js:76 .pw-key.wide — flex:1.8 → flex:2.4 and font-size:.85rem → .72rem so 'ENTER' fits inside its cap even in the fallback face.
- games/sprout.js:37 .pw-board — width:min(260px,70vw) → min(320px,86vw), and give .pw-stage a top margin so the first row is not scrolled under the header.
- The 'Not in word list' message needs a container: background:rgba(13,16,12,.85); border:1px solid rgba(200,168,75,.35); border-radius:8px; padding:6px 12px — instead of loose gold text in a gap.

**Readability:** Keys are 76px tall — well over the 48px floor. Board cells clamp(1rem,5vw,1.5rem) are fine. The failure is the ENTER label spilling out of its key and touching Z, and the whole screen rendering in a fallback sans because the display fonts never load.

**Looks broken** (confirmed on a second look, severity ugly)**:** play-sprout-2play.png bottom keyboard row: the word ENTER extends past both edges of its key box, and its final R sits against the Z key with no gap. Verified at 2x — key border at x~32-140, glyphs span x~20-146.

### Speed Sort
`play-pottingbench` · native · pattern · first committed unknown · impact 4/5 · effort M
`games/pottingbench.js`

**Now:** capture.reached is sparse-ui, so this frame is the pre-game START screen, not the sorting table - the robot pressed LET'S PLAY but never pressed START. What is there: near-black ground, a centred column reading 'Beat your best time' in serif grey, a large cream monospace 0.00 with a faint gold bloom, SECONDS, a green gradient START slab with a sage border and a green glow, BEST, a one-line rules string, and a New Game pill. Below that sits roughly 130px of pure empty black before the Add to Home Screen bar. No art of any kind.

**Wrong with it:**
- The floating music chip has landed inside the shell header and completely covers the game's own title. capture.playText confirms 'Speed Sort' is in the DOM between the ladybug button and the sunbeam counter, but in the frame there is nothing readable there - a 195px green-bordered '(music) Music' pill is sitting on top of it.
- The gold Sign in button is clipped by the right edge of the viewport - only 'Sign' and about half the button is on screen, the word 'in' and the right rounded corner run off. The header row (back + ? + ladybug + 46px music button + a two-line sunbeam counter + Sign in) is wider than 375px.
- About 130px of dead black sits between the New Game pill and the Add to Home Screen bar. The composition has no bottom - the column is stacked hard against the top and the eye falls off the screen.
- START is the only lit object in the entire frame (the game's own CSS has exactly 2 gradients and 2 box-shadows and both are on that one button), and it is a plain rounded rectangle. Against a totally unlit screen it reads as a placeholder rather than a button on a bench.

**Background now:** Nothing of its own. Shared shell radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%) at play/shell.css:32. record.code: bgImage 0, assetFiles 0. The only 2 gradients in the game's own CSS are the START and TRY AGAIN button fills. No assets/games/pottingbench/ folder exists.

**Background wanted:** bg-pottingbench-540x960.jpg - a painted potting-bench top. The game is literally named for a bench and there is no bench anywhere on screen. Horizontal weathered planks, a terracotta pot, a coil of twine and scattered soil in the lower third (which fills the 130px dead band), warm lamp light from top-right, near-black in the upper third so the big clock numeral stays readable.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-pottingbench-540x960.jpg` | 540x960, full-bleed JPG. Painted potting-bench top: weathered horizontal planks, a terracotta pot, a coil of twine and a scatter of soil in the lower third, warm rim light from top-right, upper third kept near-black. | Replaces the shared radial gradient and puts something in the 130px empty band under New Game. Delivers the bench the game is named after. |
| `card-face-100x140.png` | 100x140, transparent PNG. A painted seed-packet card face: aged paper, a stitched or torn edge, a soft drop shadow, blank centre so the existing clover/pot/droplet SVG shapes draw on top of it. | Replaces the bare rounded div with a 2px sage border at games/pottingbench.js:216-217. The card shapes are already real inline SVG in the house palette - they just have nothing to sit on. |
| `pile-slot-120x170.png` | 120x170, transparent PNG. An empty painted card slot recessed into the bench: inner shadow, a shallow lip, faint soil dust in the corner. | Replaces border:2px solid rgba(122,179,86,0.3) on PILE A and PILE B so the piles sit in the bench instead of floating on black. |
| `start-plate-340x96.png` | 340x96, transparent PNG. A painted brass-and-wood START plate with a warm rim light, a stamped label and a cast shadow; plus a 340x96 pressed variant. | Replaces the linear-gradient slab at games/pottingbench.js:184, which is currently the only lit object on the screen and reads as an unstyled default. |

**CSS to do:**
- .shell-hdr (play/shell.css:41) - the row overflows 375px and clips the Sign in button. Drop gap:12px to gap:8px under a @media (max-width:400px) and extend the existing #shell-music-btn{width:40px;height:40px} rule at play/shell.css:211 into that same query; give the title element min-width:0 so it truncates instead of pushing.
- #sws-music-chip placement in music-unlocks.js freeCorner() - the top-edge candidate list is scanned first (for x=10; x+97<=W-10; x+=48 at y:34) and on this page every top spot scores at least 1, so the least-bad spot is still inside the header. Reject any candidate whose 97x48 footprint intersects the .shell-hdr bounding rect before scoring.
- The pre-game panel block, games/pottingbench.js:180 - give the panel min-height:calc(100vh - 200px);display:flex;flex-direction:column;justify-content:center so the column is optically centred instead of stacked at the top leaving 130px of dead black.
- games/pottingbench.js:186 font-size:0.5rem on '30 cards - match shape, color, or count' and :183 font-size:0.55rem on SECONDS - both are under the 0.7rem floor and both are var(--muted) at opacity 0.7. Raise both to 0.7rem and lift opacity to 0.85.

**Emoji as art:** Five as chrome only: the reload glyph on New Game and Try Again, a star on NEW BEST, a check on the correct-play cue, plus a leaf and a seedling elsewhere. The cards themselves are NOT emoji - they are real inline SVG clover / pot / droplet paths in the house palette (games/pottingbench.js:10-24), which is the one genuinely deliberate piece of art in the game.

**Readability:** Two failures under the 0.7rem floor: '30 cards - match shape, color, or count' at 0.5rem muted grey at 0.7 opacity is effectively unreadable at 375px, and the SECONDS label at 0.55rem. Also a touch-target fault: the Sign in button's tappable area runs off the right edge of the viewport, so part of it cannot be pressed. START itself is 170x72 and fine.

**Music chip:** Yes, and it is the worst in this batch. The '(music) Music' chip sits in the header at roughly x150-345, y10-58 and covers the game title 'Speed Sort' completely. It also crowds the sunbeam counter, which wraps to two lines ('(+8' / '0 pending)'), and that wrap is what pushes the Sign in button off the right edge of the screen.

**Looks broken** (confirmed on a second look, severity ugly)**:** In -2play (confirmed at 2x) the gold Sign in button is cut off by the viewport edge with only 'Sign' visible, and the game title 'Speed Sort' - present in capture.playText - is entirely hidden behind the injected music chip in the header row.

### Checkers
`play-checkers` · native · board · first committed unknown · impact 4/5 · effort S
`games/_inline/checkers.js`

**Now:** An 8x8 board where the checkerboard is effectively invisible - dark squares are rgba(18,24,16,.92) and light squares rgba(48,54,40,.28), so at phone brightness both read near-black and you cannot see the pattern the whole game is built on. The pieces are the good part: hand-built SVGs, gold seed-pods with a stem for the AI and green sprouted pods for the player, both with a drop shadow. Under the board sit two flat dark pills (UNDO, HINT), then a painted bronze NEW GAME plaque sitting beside a large empty outlined box containing only the word 'Sapling'.

**Wrong with it:**
- The board pattern does not read. Rows 4 and 5 of the shot are a solid black band - you cannot tell a legal dark square from an illegal light one, in a game whose only rule is diagonal movement on dark squares.
- The painted bronze NEW GAME plaque (assets/games/new-game-btn.png, wood grain, gold vine border, carved lettering) sits directly next to flat CSS pills and an outlined box. Two things in one frame that share no style at all - it looks pasted in from a different game.
- The difficulty <select> at games/_inline/checkers.js:63 renders as a ~136x126px empty rounded box with the word 'Sapling' left-aligned near the middle and nothing else - no chevron, no 'Difficulty' label, no affordance. It reads as a broken widget or a panel that failed to load.
- Board cells render ~43px at 375px width (345px board / 8), under the 48px touch floor, and the SVG pieces fill only 78% of that, so a piece is a ~34px target.

**Background now:** Nothing of its own. The shared play/shell.css radial gradient. The board is two rgba fills (.ckc.ckd / .ckc.ckl, defined in index.html:5162-5163 and mirrored in shared.css), the pieces are four inline SVG strings at games/_inline/checkers.js:39-42. assetFiles:0; the only image referenced is the shared assets/games/new-game-btn.png.

**Background wanted:** A painted board plate. Warm dark-walnut light squares against moss-black dark squares with visible grain, a thin gold inlay frame, and a soft table surface bleeding out past the frame edges so the board sits on something instead of floating on the shell gradient.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/checkers/board-720x720.png` | 720x720, 8x8 at 90px pitch. Light squares warm walnut with grain, dark squares moss-black with a subtle leaf texture, at least 3:1 luminance between them, a 12px gold inlay frame, soft inner shadow at the frame. | Replaces .ckd/.ckl entirely. The single fix for the game's biggest fault - a checkerboard you cannot see. |
| `assets/games/checkers/table-540x960.jpg` | 540x960 full-bleed. Dark greenhouse potting bench: worn wood, a scatter of soil grain, warm lamp falloff from the top, deep near-black at the bottom edge. | Gives the board somewhere to sit and fills the dead near-black band under the controls. |
| `assets/games/checkers/crown-64x64.png` | 64x64 transparent. A small woven-vine crown with three gold buds, warm rim light. | Replaces the polyline zigzag currently drawn into SVG_PK/SVG_AK for kings, which reads as a scribble at 34px. |
| `assets/games/checkers/btn-undo-160x96.png and btn-hint-160x96.png` | 160x96 transparent each, carved wood plaques matching new-game-btn.png exactly - same wood, same vine border, same carved lettering. | Ends the style clash. Either UNDO and HINT join the painted plaque or the plaque goes; today one painted object sits alone among flat pills. |

**CSS to do:**
- index.html:5163 / shared.css .ckc.ckl: rgba(48,54,40,.28) is 4% brighter than .ckd's rgba(18,24,16,.92) once composited on near-black. Raise to at least rgba(96,104,78,0.55), or apply board-720x720.png to the board container and make both cells transparent.
- The difficulty <select> (games/_inline/checkers.js:63): cap it at height 48px, add a visible 'Difficulty' label above it and a chevron glyph, and stop it stretching to match the new-game-btn image height - it is currently 126px tall with one word in it.
- .ckc min-height:36px (index.html:5159): at 375px the cell computes to ~43px. Raise min-height to 44px and let the board scroll rather than shrink, or drop to a 7-column layout on narrow phones.
- .ckc svg width/height 78% -> 88%, so the piece target is closer to the cell size.
- The UNDO pill in the shot is grey-on-near-black at what looks like disabled opacity even when it is live - give the enabled state a cream label and a sage border so it stops reading as dead.
- .gb-new img: the plaque has no hover/active state next to pills that do - add a transform:scale(.96) on :active to match.

**Emoji as art:** Light: ↩ on UNDO, 💡 on HINT (a full-colour OS lightbulb next to a hand-drawn SVG board), ↻ and → elsewhere. Only 6 emoji total. The pieces are real inline SVG, not emoji - this game already made the right call on its most important art and then left the board unpainted.

**Readability:** Board cells ~43px rendered, under the 48px floor, with pieces at 78% (~34px). The 'Sapling' select has no label so the control is unreadable in the sense that matters - you cannot tell what it does. UNDO reads as disabled. The stats line 'played 0 · won 0% · streak 0 · best 0' above the board is small muted mono. Text sizes are otherwise acceptable.

### Block Drop
`play-petalfall` · native · puzzle · first committed 2026-04-23 · impact 4/5 · effort M
`games/petalfall.js`

**Now:** A canvas tetris well outlined in a 1px rose line on a near-black green vertical gradient, holding flat bevelled pastel blocks (cyan, yellow, lilac, mint, salmon, blue, orange). Two tall empty dark rails flank the well with a single arrow glyph each, HOLD and NEXT preview boxes sit above, and a four-button bar reading HOLD / DROP / FAST / PAUSE is flush against the bottom edge of the viewport.

**Wrong with it:**
- The HOLD button's icon is the character U+29C9 (games/petalfall.js:1006) which has no glyph in the shipped font stack and renders as an empty rectangle - a visible tofu box sitting in the control bar beside three icons that work.
- The orange DROP and PAUSE emoji are the most saturated colour anywhere on the screen, brighter than any game piece, and orange emoji squares are not in the sage / gold / cream / rose palette at all. They pull the eye straight off the playfield.
- The four side rails are enormous dead panels - two roughly 78x160 columns down each side each holding one thin arrow glyph, about 30% of the frame given to empty dark rectangles while the actual game is a 210px strip. A 1px rose line is the only thing separating the well from them: no surface, no depth, no transition anywhere in the frame.

**Background now:** The well is a canvas linear-gradient(180deg, s.bg1, s.bg2) drawn from a four-entry SEASONS table (games/petalfall.js:61-65) - Spring #0d1410 to #1a2a1a with a rose accent border. Everything outside the well is the shared shell radial gradient. No image assets at all: assetFiles 0.

**Background wanted:** bg-petalfall-540x960.jpg - a night greenhouse pane behind the well: blurred glass with condensation, a bough of blossom leaning in from the upper left, a warm gold lamp glow low right, dark enough that a bright piece still reads on top. The SEASONS table already exists, so ship four: bg-petalfall-spring / -summer / -autumn / -winter-540x960.jpg and swap on level.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/petalfall/blocks-sheet-448x64.png` | 448x64, seven 64x64 transparent tiles, one per tetromino | Replaces ctx.fillRect plus a hand-drawn 2px white and 2px black bevel (petalfall.js:630-639) - seven soft-edged painted petals with a warm rim light instead of seven plastic squares. |
| `assets/games/petalfall/well-frame-660x1200.png` | 660x1200 transparent PNG, 9-sliceable, with a lip at the bottom | The well is currently a 1px rose stroke; a carved planter frame gives the pieces something to land in. |
| `assets/games/petalfall/petal-particle-64x64.png` | 64x64 transparent PNG, four rotation variants on one 256x64 strip | The game is named for falling petals and shows none - one drifting petal for line clears and idle drift earns the name. |
| `assets/games/petalfall/icon-hold / -drop / -fast / -pause-96x96.png` | four 96x96 transparent PNGs in var(--gold) | Replaces the U+29C9 tofu box and the two orange emoji in the control bar. |

**CSS to do:**
- .PFactBtn row is flush to the bottom of the 667px viewport - the labels' baselines land at about y=665. Add padding-bottom:calc(10px + env(safe-area-inset-bottom,0px)) to the control row; on a phone with a home indicator that row is under the gesture bar.
- .PFactIcon for data-act="hold" is the literal character U+29C9 - no glyph in the shipped stack. Replace with inline SVG or an img.
- The two side rotate rails are about 78px wide by 160px tall each and hold one glyph; either shrink them and give the width to the well, or fill them with the frame art. They are currently the largest empty shapes in the frame.
- PIECES colours (petalfall.js:25-31) are the stock tetromino pastels - #7EC4D4, #7095C2 and #B785C2 sit outside the house palette entirely. Re-key to petal tints: rose #E8A0BF, gold #C8A84B, sage #7AB356, cream #E8DCC8, copper #D4842A, ice #A0C4E8, plum #9B7BB5.

**Emoji as art:** The DROP and PAUSE icons render as orange emoji squares and the HOLD icon as an empty box; the rotate, move and fast icons are bare text arrow glyphs. Every game piece is a canvas fillRect - there is no art in this game at all.

**Readability:** The bottom control row is flush to the viewport bottom with no safe-area padding. The HOLD icon is an unrenderable glyph. The SCORE / LEVEL / LINES / BEST labels are small letter-spaced caps at roughly 0.62rem, under the 0.7rem floor. The gold Sign in pill in the shell header is clipped by the right edge and reads only Sign. Buttons are 54px min-height, which passes.

**Music chip:** Yes. The injected 97x48 music chip took the top-edge slot at left:154px;top:10px and covers the shell's #shell-title. Block Drop is in the DOM (capture playText lists it between the ladybug button and the chip) but appears nowhere on screen; the rendered header reads back-arrow, ?, ladybug, [Music chip], sunbeam counter, Sign.

**Looks broken** (confirmed on a second look, severity ugly)**:** Three visible in play-petalfall-2play.png: the HOLD button icon renders as an empty missing-glyph rectangle (game-owned, games/petalfall.js:1006); the gold Sign in pill is clipped by the right screen edge showing only Sign; and the floating music chip fully covers the game title. The last two are shared-shell chrome, so one fix covers all 67 natives.

### Word Search
`play-wordsearch` · native · word · first committed 2026-04-03 · impact 4/5 · effort M
`games/wordsearch.js`

**Now:** A 10x10 block of identical dark rounded tiles with cream Bebas letters, sitting on the shared near-black gradient, with six gold-outlined word chips, two pill buttons and an 'Add to Home Screen' block stacked underneath. Correct house palette, zero imagery — the entire screen is rectangles at one value.

**Wrong with it:**
- The grid overflows the phone: the tenth column is sliced in half by the right screen edge on every row (row 1 ends on a half-drawn K). .wc{min-height:36px} at shared.css:2269 with aspect-ratio:1 forces ~36px squares, so 10 columns need ~394px inside a .wg capped at clamp(280px,94vw,420px) = 352px at 375. Hard mode is 13x13, which is far worse.
- The header has scrolled off the top of the play frame — grid + word list + buttons + Add-to-Home + footer are taller than 667px, so the 'Flora · Found: 0/6' counter and the difficulty control are not on screen while you play.
- Nothing is composed: 100 identical tiles, 6 identical chips, 2 identical pills, no frame, no ground, no illustration. Two things in the frame share a silhouette a hundred times over, and the surfaces meet through hard 1px borders rather than any transition.

**Background now:** None of its own. Shared native ground: html,body radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%) at play/shell.css:32. bgImage 0, assetFiles 0; the only 'art' in the file is 3 CSS gradients used for the flash/shine animations and the win overlay.

**Background wanted:** A pressed-herbarium page: dark ink-stained paper, ghosted botanical line drawings at ~12% in the margins, a warm gold lamp glow from the top left, vignette at the corners. The puzzle should read as printed on something.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-wordsearch-herbarium-750x1334.jpg` | 750x1334 full-bleed, dark pressed-paper ground with fibre texture, ghosted fern and seed-head line art in the outer margins at ~12% opacity, warm lamp glow top-left, vignette | Replaces the shared flat gradient; turns the void behind the letters into a page. |
| `wordsearch-frame-9slice-96x96.png` | 96x96 transparent PNG cut as a 9-slice with 32px corners, thin sage-and-gold botanical border with small corner knots | Wraps .wg so the letter block reads as a printed puzzle panel instead of a floating grid of boxes. |
| `wordsearch-strike-ribbon-192x48.png` | 192x48 transparent PNG, hand-inked sage strike stroke with a slightly ragged end, stretchable in the middle | Replaces the CSS text-decoration:line-through on found words (games/wordsearch.js:23) with something that looks drawn. |
| `wordsearch-theme-flora-128x128.png (plus -harvest, -lunar)` | 128x128 transparent PNGs, one small painted motif per word theme: a pressed leaf, a wheat sheaf, a moon-and-moth | Sits beside the 'Flora' theme label (games/wordsearch.js:322) so each new grid has an identity instead of only a word changing. |
| `win-wreath-512x512.png` | 512x512 transparent PNG, painted sage-and-gold laurel wreath with a soft inner glow | Replaces the 🌿 emoji blown up to 4.6rem, which is currently the entire art of the win screen (games/wordsearch.js:197). |

**CSS to do:**
- shared.css:2269 .wc — min-height:36px is what overflows the board; drop it to min-height:0 and let aspect-ratio:1 size cells from the grid track, or change .wg to width:min(94vw, calc(100vw - 16px)) so 10 and 13 column grids both fit at 375px.
- shared.css:2268 .wg — give the grid a panel of its own: background:rgba(13,16,12,.55); border:1px solid rgba(122,179,86,.18); border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,.5), so the letters separate from the page instead of dissolving into it.
- shared.css:2269 .wc colours — letters are rgba(240,235,216,.75) on rgba(18,24,16,.7): raise the letter to .9 and drop the tile fill to .5 so unfound letters carry more contrast in the shot.
- games/wordsearch.js:323 (#Wl inline cssText) — .72rem chips with 3px vertical padding render ~26px tall; set min-height:34px, padding:8px 12px, and give .ws-word.pending a warmer gold so the list reads as a checklist, not as six disabled buttons.
- play/shell.css .shell-mount / #fg-ag — the Add-to-Home block and footer push the header off screen at 667px; cap the board area (max-height:62svh on .wg) or move the promo below the fold so the Found counter stays visible while playing.

**Emoji as art:** 🌿 at 4.6rem is the entire win-screen art (games/wordsearch.js:197), plus ↻ on New Game and the 🐞 feedback badge in the shell header. There is no other imagery anywhere in the game.

**Readability:** Word chips are .72rem, only just over the 0.7rem floor, and at 3px vertical padding they are ~26px tall. Grid cells are ~36px, under the 48px touch minimum (drag-select softens it, but the half-cut tenth column is not reachable at all). Unfound letters sit at 75% cream on a 70% black tile, which is the flattest text on the screen. The difficulty control is a <select class="gsl"> that renders as a plain 'Medium' pill with no affordance that it opens anything.

**Looks broken** (confirmed on a second look, severity ugly)**:** On both the -2play and -3later frames at 375x667 the rightmost column of the letter grid is cut vertically in half by the screen edge — visible on all 10 rows (row 1 '...H N O K' with the K sliced, row 2 '...E X L' with the L sliced). Confirmed in the 2x shot: cells are ~37.5px CSS wide, so 10 columns need ~394px in a 352px container. No failed requests at all for this game.

### Pixel Garden
`play-pixelgarden` · native · creative · first committed 2026-04-12 · impact 4/5 · effort M
`games/pixelgarden.js`

**Now:** Boot is the shared how-to wall: near-black ground, cream body type, gold section heads, one gold LET'S PLAY slab. The play frame is a 336px drawing canvas clipped to a ~62px band at the very top (the shell header is not in frame at all), then a solid 6x4 block of 24 flat colour swatches, then six ragged rows of dark pill buttons on empty black. There is no art anywhere - the palette slab is the only colour on the screen.

**Wrong with it:**
- The drawing canvas - the entire point of the game - is cut off at the top of both the play and later frames; only about 62px of a 336px board is visible. The stack (canvas 336 + four 52px palette rows + two tool rows + three action rows) is roughly 800px tall inside a 667px viewport, so the canvas and the palette can never be on screen together.
- The empty canvas is a #1a1a1a/#222222 checkerboard sitting on a #0d100c page, and its only edge is a 1px rgba(122,179,86,0.2) border (games/pixelgarden.js:52) which is invisible at 375px. The paper you are meant to paint on has no visible boundary and reads as a hole in the page.
- The 24 swatches are drawn as one unbroken 6x4 slab of full-saturation colour with no gaps between rows, so the loudest, largest, most saturated object in the frame is the paint-chip card, not the artwork. Nothing else on screen has any weight to balance it.
- The button groups wrap into six ragged rows with an orphan stranded on three of them: DRAW/ERASE/FILL/PICK/MIRROR then GRID alone; CLEAR/UNDO/SAVE then GALLERY/COMPOSE then PNG alone. Nothing lines up with anything - the classic sloppy read.

**Background now:** Nothing of its own. The shared native shell paints one radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%) in play/shell.css:32, the same gradient 66 other natives use. record.code confirms bgImage 0, gradients 0, assetFiles 0. There is no assets/games/pixelgarden/ folder.

**Background wanted:** bg-pixelgarden-540x960.jpg - a painted dark wooden potting-bench top seen from above, with the warm lamp pool placed at 70% -10% so it lands where the existing shell gradient hotspot already is, a folded rag and a jar of brushes along the bottom edge. Local contrast kept under about 18% so pixel art still reads on top of it.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-pixelgarden-540x960.jpg` | 540x960, full-bleed JPG. Painted dark wooden bench top, warm lamp pool top-right, a rag and a jar of brushes along the bottom edge, deep near-black values, local contrast under 18%. | Replaces the shared radial gradient that 66 natives already use. Gives the drawing tool a room to sit in instead of a void, and fills the empty black either side of the palette. |
| `canvas-mat-360x360.png` | 360x360, transparent PNG. A painted paper or linen mat with a soft rim-lit bevel and a cast shadow, sized to sit under the 336px canvas with a 12px reveal. | Replaces the invisible 1px rgba(122,179,86,0.2) border on games/pixelgarden.js:52. Gives the drawing surface a physical edge so the empty canvas stops reading as a hole in the page. |
| `palette-tray-336x224.png` | 336x224, transparent PNG. A painted wooden or chipped-enamel paint tray with 24 recessed wells on a 6x4 grid, each well 48x48 with an inner shadow, warm rim light from top-right. | Replaces the flat 6x4 colour slab. Puts the swatches into wells so the palette stops out-shouting the artwork it is meant to serve. |
| `tool-icons-288x96.png` | 288x96, transparent PNG, six 48x48 cells: brush, eraser, fill bucket, dropper, mirror butterfly, grid. Cream line art with a sage active state baked as a second 288x96 row. | Replaces the all-caps word buttons DRAW/ERASE/FILL/PICK/MIRROR/GRID. Collapses two ragged wrapped rows into one clean icon row and buys back roughly 55px of the vertical overflow that is clipping the canvas. |

**CSS to do:**
- The game panel container in games/pixelgarden.js (the element canvas, palEl and toolEl are appended to): pin canvas + palette + tools as the visible block and move the CLEAR/UNDO/SAVE/GALLERY/COMPOSE/PNG rows behind a single disclosure button, so the playfield and the palette fit inside 667px without scrolling.
- canvas inline cssText, games/pixelgarden.js:52 - replace border:1px solid rgba(122,179,86,0.2) with border:2px solid rgba(200,168,75,0.35);box-shadow:0 6px 22px rgba(0,0,0,.6),0 0 0 6px rgba(13,16,12,.9) so the paper has an edge and sits above the ground.
- palEl - wrap the swatches in display:grid;grid-template-columns:repeat(6,48px);gap:6px;justify-content:center instead of the current gapless flow, so the 24 colours read as a tray of chips rather than one saturated slab.
- The tool row and the action row (both .gcr-style flex-wrap groups) - set each to display:grid;grid-template-columns:repeat(3,1fr);gap:6px so no row is left with a single orphan button (GRID and PNG are each stranded alone today).

**Emoji as art:** Four: folder on GALLERY, puzzle piece on COMPOSE, down-arrow on PNG, wastebasket on the clear control. They sit inside otherwise word-only buttons, so half the toolbar has a picture and half does not - the toolbar has no consistent icon language.

**Readability:** Type itself is OK: tool and action buttons are 0.78rem cream on black at min-height 48px, and the swatches are exactly 48px border-box (games/pixelgarden.js:93) so touch targets pass. The readability failure is layout, not type - the playfield is 82% off-screen in the play frame, and the empty canvas has no visible edge against the page.

**A "looks broken" claim here was refuted on a second look.** The claim is that the 336px drawing canvas is "cut off at the top" to a ~62px band and that canvas + palette "can never be on screen together" at 667px. Both shots 2play and 3later are identical and are simply the page SCROLLED TO THE BOTTOM — the footer ("Sky Wolf Studio · sunbeams travel with you...") and the "Add to Home Screen" button sit at the bottom of frame, and the shell header, the "Canv

### Minesweeper
`play-mines` · native · puzzle · first committed 2026-04-03 · impact 4/5 · effort M
`games/mines.js`

**Now:** A 12x12 field of identical dark tiles fills the top half - each tile is the same painted mossy-stone plate with a black recessed centre, repeated 144 times at about 26px, so it reads as one wallpaper swatch rather than as art. Below it a gold-outlined FLAG button with a scarlet flag emoji, a NEW GAME button with a bright blue arrow emoji, a small Easy/Medium/Hard segment and a DAILY button with a red-and-white calendar emoji.

**Wrong with it:**
- The tile art is invisible at the size it renders. hidden.png is a painted forest-floor plate, but shared.css:2282 applies it as center/cover to every cell, so at 26px all you see is a dark square with a black hole in the middle, 144 identical copies, no rotation, no variation, no distinct edge tiles. You cannot tell there is art there at all.
- The board bleeds to a hard cut: .ng is width:clamp(280px,94vw,420px) so at 375px it stops 11px from each side as a bare rectangle with nothing behind it - no frame, no vignette, no ground the field is dug into. It just stops.
- The chrome is three clashing emoji: a scarlet flag, a bright blue refresh arrow and a red-and-white calendar. Those are the three most saturated things in the frame and none of them is in the sage / gold / cream palette; the blue arrow in particular has no relationship to anything else on screen.

**Background now:** Shared native shell radial gradient (play/shell.css:32) behind everything. The board tiles themselves are four painted PNGs in assets/games/minesweeper/ wired through shared.css:2282-2289 as background url(...) center/cover per cell - hidden.png 444KB, revealed.png 516KB, flag.png 597KB, mine.png 516KB, 2.1MB total to draw 26px squares.

**Background wanted:** bg-rootfloor-540x960.jpg - a dark forest floor under the grid: leaf litter and moss falling out of focus toward the edges, a warm lantern pool sitting exactly where the board lands, so the dug field has somewhere to be. Full-bleed.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/minesweeper/hidden-tiles-4x-256x256.png` | 256x256 sheet holding four 128x128 tile variants (different moss, pebbles, root fragments), under 120KB total | Replaces one 444KB bitmap repeated 144 times; picking a variant by (r*7+c)%4 kills the wallpaper look at a stroke. |
| `assets/games/minesweeper/revealed-128.png, flag-128.png, mine-128.png` | three 128x128 PNGs, under 40KB each | The current revealed/flag/mine art is 516KB, 597KB and 516KB respectively for tiles that render at 26px - about 1.6MB of wasted download. |
| `assets/games/minesweeper/board-frame-1080x1080.png` | 1080x1080 transparent PNG, 9-slice with mitred corners | A carved wooden planting-bed frame behind .ng so the board ends at a made edge instead of a hard rectangular cut. |
| `assets/games/minesweeper/icon-flag-96x96.png and icon-newgame-96x96.png` | two 96x96 transparent PNGs in gold and sage | Replaces the scarlet flag emoji and the bright blue refresh emoji, the two most off-palette marks in the frame. |

**CSS to do:**
- .nc is aspect-ratio:1 inside .ng{width:clamp(280px,94vw,420px)} (shared.css:2279-2280): at 375px on Medium (N=12) a cell measures about 26px and on Hard (N=16) about 19px - both far under the 48px touch floor. Raise .ng to 96vw, cap Hard at N=12, or add board pan/zoom.
- .nc.nh uses center/cover on a single bitmap so all 144 cells show the identical crop - switch to a four-variant sprite sheet driven by background-position keyed off the cell index.
- .ng has no outer frame: add a 2px sage border plus an outer glow, or the 9-slice frame above, so the board has an edge instead of a cut.
- .mn-btn .ic renders emoji at 1.4rem - swap to inline SVG in var(--gold) / var(--sage). The number colours .x1-.x8 (shared.css) also carry a blue #5e92ba and a purple #9474be that are outside the house palette.

**Emoji as art:** Every icon in the game is an emoji: flag on FLAG, refresh on NEW GAME, calendar on DAILY, and microbe / stopwatch / fire in the stat bar. Only the four board tiles are painted art.

**Readability:** Cells measure about 26px on Medium and about 19px on Hard, both far under the 48px touch floor, and the number inside is clamp(.85rem,3.5vw,1.2rem) = 13px in a 26px box. The Easy/Medium/Hard segment buttons are 52x48 which passes, and the .mn-btn buttons are 56px which passes. The hint line reads fine.

### Reversi
`play-reversi` · native · board · first committed unknown · impact 4/5 · effort S
`games/_inline/reversi.js`

**Now:** capture.reached is no-more-controls but the play frame is genuinely the board. A dark mossy-green 8x8 grid fills the top two-thirds with hairline sage cell borders and cream a-h / 1-8 rulers on all four sides. Four opening stones: two green moss discs with a pale leaf, two gold lichen discs with a cream eight-point star, plus five small sage dots marking legal moves. Under it two small UNDO / HINT pills, then a large ornate copper-and-vine painted NEW GAME plate sitting next to a big empty dark rounded box with the word 'Sapling' stranded in its lower-left.

**Wrong with it:**
- The difficulty select is rendered as a large empty box. .gcr (shared.css:2200) is display:flex with the default align-items:stretch, and its sibling .gb-new img is clamp(120px,35vw,180px) tall, so the .gsl select stretches to about 131px with 'Sapling' pinned at the bottom-left of an otherwise empty rectangle. It is the second-largest object on the screen and it is blank.
- The painted NEW GAME plate is the only painted object anywhere in the frame. Its ornate copper knotwork, warm bevel and cast shadow share no silhouette, no light direction and no palette weight with the flat CSS board and flat pill buttons beside it - it reads as a sticker dropped onto a wireframe.
- The board just stops. .rvb (shared.css:2451) ends in a 3px rgba(74,124,53,.25) border and then the page - no frame, no table, no transition of any kind, and in the play frame the top row is sliced by the frame edge. Chess, the fleet's strong benchmark, is the same shape and has a wooden board and a Celtic frame; this has neither.
- UNDO and HINT are two small pills centred under a 340px board with a large empty gap either side of them - a thin ragged line of chrome floating between the board and the New Game row, motivated by nothing.

**Background now:** Nothing of its own. Shared shell radial gradient at play/shell.css:32; the board cells are rgba(26,42,20,.7) translucent dark green laid straight over it. record.code: bgImage 0, gradients 0, ownCssKB 1. The only asset the game loads is assets/games/new-game-btn.png, which is shared fleet-wide. No assets/games/reversi/ folder exists.

**Background wanted:** bg-reversi-540x960.jpg - a painted night garden table: a dark stone slab with moss creeping in from the corners and a warm lantern glow from top-right, the board recessed into it. Reversi shares Chess's exact shape and Chess is the fleet's 'strong' example precisely because it has a painted board and a frame.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-reversi-540x960.jpg` | 540x960, full-bleed JPG. Painted night garden table: dark stone slab, moss in the corners, a warm lantern glow from top-right, deep values so light stones stay the brightest thing in frame. | Replaces the shared radial gradient. Gives the board a table to sit on instead of floating in the same black as the buttons. |
| `board-frame-reversi-460x460.png` | 460x460, transparent PNG with a transparent 8x8 well in the centre and a 30px carved stone-and-vine border, soft inner shadow on the well lip, warm rim light top-right. | Replaces .rvb{border:3px solid rgba(74,124,53,.25)} at shared.css:2451. The board currently meets the page through a hard 3px line with no transition - this is the 'every surface meets another through a transition' fault. |
| `disc-moss-96x96.png` | 96x96, transparent PNG. Painted moss stone: wet rim light, a real leaf blade with visible venation, a soft ground shadow. House sage palette. | Replaces SVG_MOSS at games/_inline/reversi.js:36, which is five concentric flat circles plus a lens shape and reads as clip art at its rendered 40px. |
| `disc-lichen-96x96.png` | 96x96, transparent PNG. Painted lichen stone: crusted gold plates, a bone-white rosette, a soft ground shadow. House gold palette. | Replaces SVG_LICHEN at games/_inline/reversi.js:37, the gold twin of the same clip-art problem, so the two sides read as objects rather than icons. |
| `assets/games/new-game-btn.png` | RESIZE, not a repaint. Currently 1529x1529 and 3.35MB, displayed at clamp(120px,35vw,180px) = about 131px. Re-export at 360x360, target under 45KB. | A 3.35MB PNG shipped to render 131px wide is a 25x oversize on the single heaviest asset in the game, and it is loaded by every native that uses .gb-new. |

**CSS to do:**
- .gcr (shared.css:2200) - add align-items:center. This one line is the entire cause of the empty stretched difficulty select next to the New Game image, and .gcr + .gb-new is used by several other natives, so it fixes them all at once.
- .gsl (shared.css:2215) - add max-height:56px;align-self:center and a chevron background-image. It has -webkit-appearance:none with no arrow supplied, so even at the right height it reads as a text field rather than a dropdown.
- .rvb (shared.css:2451) - replace border:3px solid rgba(74,124,53,.25) with padding:10px;border:0;background:url(assets/games/reversi/board-frame.png) center/100% 100% no-repeat so the board meets the page through a painted edge instead of a hard line.
- The UNDO / HINT tools row (games/_inline/reversi.js:66) - currently display:flex;gap:6px;justify-content:center with two auto-width pills. Set gap:10px and give both buttons flex:0 0 132px so they read as a deliberate pair under the board rather than two leftovers.
- .rv-score inner status span (games/_inline/reversi.js:195) - hardcoded font-size:0.58rem in var(--muted); raise to 0.7rem. The wrapper .rv-score at shared.css:2459 is clamp(0.55rem,1.6vw,0.7rem) which resolves near 0.6rem at 375px; set its floor to 0.7rem too.

**Emoji as art:** Three, all as button glyphs: an undo arrow on UNDO, a lightbulb on HINT, a reload glyph on the retry label. The discs are real inline SVG, not emoji, so no emoji is standing in for the game's actual art.

**Readability:** Two type faults under the 0.7rem floor: the turn-status span is a hardcoded 0.58rem in var(--muted) (games/_inline/reversi.js:195), and .rv-score is clamp(0.55rem,1.6vw,0.7rem) which lands near 0.6rem at 375px. The a-h / 1-8 rulers are clamp(.62rem,1.7vw,.74rem) at 48% opacity - borderline. Touch targets are fine: UNDO/HINT are min-height 48px, .gsl is min-height 48px, board cells are min-height 36px but the board is 92vw so they compute to about 42px each - slightly under the 48px floor.

**Music chip:** The chip is not in the play frame, but the injected music UNLOCK CARD is the worst offender on boot: in -1boot the fixed 'CONGRATULATIONS, YOU UNLOCKED A SONG / Measured Progression / Board Classics' card is pinned to the bottom and covers the lower ~38% of the how-to-play wall, hiding the entire 'The controls' section and the LET'S PLAY button. capture.taps confirms the robot had to press 'Play it now' before it could reach LET'S PLAY.

**A "looks broken" claim here was refuted on a second look.** Opened all three shots. In -2play/-3later (identical) the game renders correctly: complete 8x8 mossy board, hairline cell borders, a-h/1-8 rulers on all four sides, the four opening stones (2 green moss + 2 gold lichen discs), five sage legal-move dots on row 6, legible UNDO/HINT pills, and the painted NEW GAME plate loaded fine. No missing-image box, nothing clipped off a screen edge, no unreadab

### Dew Trail
`play-dewtrail` · native · puzzle · first committed 2026-06-12 · impact 4/5 · effort M
`games/dewtrail.js`

**Now:** A bare 6x6 grid of translucent dark-olive rounded squares floating directly on the shared native shell's one radial gradient; 23 of the 36 cells hold an identical small pale-blue CSS dot, the other 13 hold a cream number in a gold-ringed black pill. Below it an italic grey hint line and four buttons in four different visual treatments stack down to the footer. No art of any kind: assetFiles 0, no assets/games/dewtrail/ folder exists.

**Wrong with it:**
- 36 cells, 23 identical blue polka dots. The dew drops read as wallpaper pattern, not as objects, and they fight the numbers for attention instead of supporting them.
- The START cell is invisible. '1' is drawn with exactly the same .dt-num pill as '13' (games/dewtrail.js:371 emits one markup for every waypoint), so the one cell the whole rule depends on has no visual priority.
- Four button languages in the bottom third: .dt-btn outlined sage slabs (RESTART / PRACTICE), then the shell's rounded sage 'New Game' pill, then the shell's 'Add to Home Screen' pill, then the footer text. Different heights, radii and borders, none aligned.
- The grid has no board. Cells butt straight onto the page gradient with no mat, frame, shadow or transition, so the playfield has no edge and the composition has no anchor.
- Cell fill is rgba(26,31,23,0.55) over a border at 0.18 alpha (games/dewtrail.js:20) - the tiles barely separate from the ground, so the grid reads as a field of dots rather than a set of cells.

**Background now:** Nothing of its own. Inherits play/shell.css:32, one radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%) shared with 66 other natives. bgImage 0, usesCanvas 0.

**Background wanted:** A painted night-pond plate, full-bleed 750x1334: deep near-black-green water, a faint sage reed silhouette along the bottom edge, one soft gold moon-glow top right, held dark enough that cream numbers still read at 375px. This is the single highest-value change for this game.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/dewtrail/bg-pond-750x1334.jpg` | 750x1334 full-bleed, deep near-black-green still water, faint sage reed silhouette bottom edge, soft gold moon-bloom top right, no detail above 18% luminance in the centre band where the grid sits | replaces the shared 66-game radial gradient; gives the game a place instead of a default |
| `assets/games/dewtrail/board-mat-720x720.png` | 720x720 transparent PNG, a dark slate/lily-pad mat with a 2px warm-gold hairline frame and a soft outer drop shadow, centre kept flat | sits under the .dt-grid so the cells stop floating on the page and the playfield gets an edge |
| `assets/games/dewtrail/dewdrop-96x96.png` | 96x96 transparent, one painted dew bead, warm rim light upper-left, tiny caustic highlight below, soft contact shadow | replaces the .dt-drop CSS radial-gradient circle, the single most repeated element on screen |
| `assets/games/dewtrail/dewdrop-lit-96x96.png` | 96x96 transparent, same bead lit sage-green from inside with a faint bloom | gives the filled/on state real art instead of only a background colour swap |
| `assets/games/dewtrail/start-marker-128x128.png` | 128x128 transparent, a gold spiral-leaf ring with a soft glow, designed to sit behind a 58%-width number pill | marks cell 1 so the player can find the start without reading the hint line |

**CSS to do:**
- .dt-c: background rgba(26,31,23,0.55) -> solid #151a12, border-color rgba(74,124,53,0.18) -> 0.35 so the tiles separate from the shell gradient
- wrap #DTg in a .dt-board container: padding 10px, border-radius 16px, 1px solid rgba(200,168,75,0.22), inset 0 0 30px rgba(0,0,0,0.5) - the grid currently has no board
- add .dt-num.start: sage fill rgba(122,179,86,0.3), 2px gold ring, and set it on the waypoint whose value is 1 in games/dewtrail.js:371
- the italic hint div (inline font-size:0.78rem, color:var(--muted,#8a9178), games/dewtrail.js:379): raise to 0.82rem and colour rgba(232,220,200,0.72) - grey-on-black at 0.78rem is the weakest text in the frame
- .dt-btn and the shell New Game pill: unify min-height 48px, border-radius 10px and the same 1.5px sage border so the lower third stops showing four button styles

**Emoji as art:** Light. The game's own screen uses none - the 12 emoji counted are ↺ ↻ on buttons and 📤 on the share button in the win panel; 🐞 🎵 ☀ come from the shared shell header. The dew drop and the trail are CSS shapes, not emoji.

**Readability:** The hint line 'Drag one trail from 1, touch every cell, numbers in order.' is 0.78rem italic Georgia in --muted #8a9178 on near-black - lowest contrast text in the frame. Cells are ~52px at 375px so touch is fine; .dt-btn is min-height:48px, fine.

### Go (Living Stones)
`play-livingstones` · native · board · first committed 2026-04-12 · impact 4/5 · effort S
`games/livingstones.js`

**Now:** A muddy dark-brown rounded panel holds a 5-line grid with four flat circles on it (three near-black, one cream) around the centre point, gold PUZZLE 1/12 above and an italic cream hint. Below: twelve 10px progress dots and four dark pill buttons UNDO / HINT / NEXT / MENU. Everything outside the brown panel is the shell's near-black gradient.

**Wrong with it:**
- The brown board panel is much bigger than the grid inside it and not centred in it: renderBoard sizes the SVG to margin*(boardSize+1) while the grid only spans (boardSize-1) cells, so there is roughly a 55px dead brown band above the top grid line and only ~35px below. It reads as a mis-sized box, not a board.
- The stones are flat SVG circles (fill #1a1a1a with a #000 stroke, fill #e8e8e0 with a #888 stroke). No specular highlight, no bevel, no contact shadow. A Go stone is a polished lens; these are dots, and the white stone at the centre floats with nothing under it.
- The game contains two completely different-looking boards. The puzzle board (livingstones.js:260) is a flat #2a2418 mud rectangle; the full-game board (livingstones.js:442) is a warm kaya-wood linear-gradient #d9b36f to #c39a52 with star points, A-T column letters and an inset shadow. The puzzle screen, which is the first thing a new player sees, got the ugly one.
- Grid lines are rgba(140,120,80,0.4) at 1px on #2a2418. Under and around the black stones they vanish, so you cannot tell which intersections are still open.

**Background now:** Nothing of its own. play/shell.css line 32 paints radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%) for all 66 natives. The only local colour is the flat #2a2418 fill on the puzzle SVG. No assets/games/livingstones/ folder exists (assetFiles 0).

**Background wanted:** bg-go-540x960.jpg - a dim tatami room at night, a paper shoji screen going soft at the top, warm lantern rim light entering from the left, falling to deep near-black at the bottom edges so the board reads as a lit object on a low table rather than a rectangle on void.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `board-kaya-380x380.png` | 380x380, full-bleed opaque, painted kaya-wood goban surface with visible grain running vertically, a soft warm vignette at the corners and an inner shadow along the top edge | Replaces the flat #2a2418 SVG background fill at games/livingstones.js:260 so the puzzle board matches the warm wood the full game already uses, instead of looking like a different game. |
| `stone-black-96x96.png` | 96x96 transparent, painted slate Go stone, lens profile, cool top-left specular highlight, soft dark contact shadow baked into the bottom third | Replaces the flat <circle fill="#1a1a1a"> so stones sit on the board instead of being printed on it. |
| `stone-white-96x96.png` | 96x96 transparent, painted clamshell Go stone, warm cream with faint shell banding, top-left highlight, soft contact shadow | Replaces the flat <circle fill="#e8e8e0">; currently the centre white stone has nothing under it and floats. |
| `bg-go-540x960.jpg` | 540x960 full-bleed, dim tatami room, lantern light from the left, near-black at the edges | The game has no background at all beyond the shared shell gradient; this gives the board a room to sit in. |

**CSS to do:**
- games/livingstones.js:260 - the puzzle SVG's width/height are margin*(boardSize+1) while the grid only spans (boardSize-1)*cell; change the SVG box to margin*2 + (boardSize-1)*cell so the brown panel hugs the grid and the dead asymmetric band at the top disappears.
- games/livingstones.js:263-264 - grid line stroke rgba(140,120,80,0.4) at stroke-width 1 becomes #3b2a16 at stroke-width 1.2, matching the full-game board at line 446, so the lines survive next to the black stones.
- games/livingstones.js:282 (the progress dot style string) - unsolved dots are 10px with border rgba(122,179,86,0.3) and are effectively invisible on the dark ground; go to 12px and border-color rgba(122,179,86,0.55).
- games/livingstones.js:260 - add a drop shadow under the board panel (filter: drop-shadow(0 6px 18px rgba(0,0,0,.65))) so the board separates from the near-black page instead of butting into it with a hard edge.

**Emoji as art:** Minimal. The reload glyph on New Game plus arrows and check marks in the help copy (11 emoji, 5 distinct). The board, grid and stones are all real SVG, not emoji - nothing here is an emoji standing in for a sprite.

**Readability:** The PUZZLE 1/12 label sits exactly at the 0.7rem floor. The real readability failure is not text: grid lines at 0.4 alpha tan on #2a2418 disappear under the stones, so the open intersections cannot be read. All four buttons are min-height 48px and pass touch.

### Vine Words
`play-vinewords` · native · word · first committed 2026-04-12 · impact 4/5 · effort M
`games/vinewords.js`

**Now:** Sixteen identical dark olive-green rounded squares in a 4x4 grid, each with one cream capital letter, on flat near-black. Above them three pill buttons (SUBMIT and CLEAR dimmed grey-green, PAUSE with an orange pause glyph); below, an empty FOUND panel showing a single em dash, then a small New Game pill and a wide sage Add to Home Screen slab, then about 60px of nothing. Boot is the shared HOW TO PLAY directions page with a music-unlock sheet sitting over the bottom half.

**Wrong with it:**
- There is no vine. The game is called Vine Words and nothing on screen is botanical: sixteen boxes that share one silhouette, one colour and one border, arranged on an empty grid. No two elements differ, so the eye has nothing to land on.
- The timer is off screen. This is a two-minute game and at 375x667 the HUD (Score 0 - 0 words - 2:48 - best 0) sits above the visible frame; the first thing the player sees is the button row. The clock, the one thing that creates the tension, is the thing that scrolls away.
- Hierarchy is inverted. The orange pause glyph is the only warm accent on the screen and it is on PAUSE, while SUBMIT and CLEAR sit dim and disabled-looking. Below, #shell-install-btn (Add to Home Screen) is the widest, brightest control in the frame, louder than New Game and louder than any game action.
- The bottom third is dead: an empty FOUND panel holding an em dash, then flat black to the footer. The horizon is empty.

**Background now:** Nothing of its own. The shared play/shell.css radial gradient is the whole background. bgImage is 0, assetFiles 0, and the game's only paint is the per-cell linear-gradient rgba(42,50,32,.95) -> rgba(26,31,23,.95).

**Background wanted:** A full-bleed night garden wall with a real climbing vine: dark stone or weathered board, a thick vine entering bottom-left and branching up the left and top edges with three or four broad leaves overlapping the frame, a warm lantern glow behind the board area falling to near-black at the corners. The name should be visible in the art before you read the title.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-vinewords-540x960.jpg` | 540x960 full-bleed painterly night-garden wall. Vine entering bottom-left, climbing the left and top edges, 4-5 broad sage leaves with warm rim light; centre 340x340 region kept under 12% luminance so letters stay readable. | Replaces the bare shared radial gradient and finally makes the title literal. Fixes the empty horizon in one asset. |
| `vinewords-frame-800x800.png` | 800x800 transparent PNG. Woven willow square frame ~48px thick with visible twist and tendrils, three leaves overlapping the corners so the silhouette is not a perfect square. Inner opening 704x704 for the 4x4 grid. | Gives the grid an edge that meets the background through a transition instead of ending on flat black, and stops the board being a bare rectangle. |
| `vinewords-tile-96x96.png` | 96x96 transparent PNG. Painted bark-and-moss rounded tile, soft top-left rim light, seated shadow at the bottom, faint grain. Blank face; the letter is drawn over it. | Replaces the linear-gradient + 2px rgba(122,179,86,.25) border on all 16 cells, which is currently the entire art budget of the game. |
| `vinewords-tile-lit-96x96.png` | 96x96 transparent PNG. Same tile with a warm gold bloom in the bevel and a brighter rim, for the in-path selected state. | Gives the drag trail a painted destination instead of just swapping a background rgba value. |

**CSS to do:**
- The HUD strip built at games/vinewords.js:110 (font-size 0.85rem, injected above pan) must stay visible: make its wrapper position:sticky; top:0; z-index:6 with an opaque background, so the 2:48 clock is not the first thing to scroll away on a 667px screen.
- #VWpause: drop the orange pause glyph or tint it muted cream. It is currently the only warm accent in the frame and it sits on the least important button.
- #VWsubmit: give the enabled state a real sage fill (background rgba(122,179,86,.28); border-color rgba(122,179,86,.6); color #7ab356) so the primary action outranks PAUSE instead of reading as disabled.
- The FOUND panel (games/vinewords.js:151) is a 120px-tall empty box holding an em dash before the first word. Collapse it to a single line until foundList.length > 0, or fill the empty state with a faint watermark leaf instead of a dash.
- The 4x4 cell rule at games/vinewords.js:222 hard-codes border-radius:12px and one gradient for all 16 tiles. Once vinewords-tile-96x96.png exists, swap the gradient for background-image and vary rotation by 1-2 degrees per index so sixteen tiles stop sharing one silhouette.
- #shell-install-btn: demote from a 15px bold sage slab to a muted footer text link; it is the widest and brightest control on the play screen.

**Emoji as art:** Minimal but load-bearing: the pause, check and cross glyphs on the three main buttons and a seedling on NEW BOARD are the only non-text shapes in the whole game. There is no illustration anywhere, so those five glyphs are carrying the entire visual identity.

**Readability:** Mostly ok. Grid cells are ~85px at 375px (well over the 48px minimum) and letters are clamp(1.4rem,5.5vw,2.2rem) cream on dark. Two soft faults: the FOUND list is 0.72rem, right on the floor, and the SUBMIT / CLEAR labels in their idle state are dim grey-green on near-black, low enough contrast to read as disabled when they are not.

**Music chip:** Not the corner chip, but injected music furniture does collide: on the boot frame the music-unlock bottom sheet ('CONGRATULATIONS, YOU UNLOCKED A SONG' / Page Turning / Play it now / Later) covers the lower half of the shell HOW TO PLAY page, clipping 'The controls' section mid-line at its first bullet ('Drag through neighboring letters' is cut in half by the sheet's top edge). The player is asked to choose a song before they have finished reading how to play.

### Root Flow
`play-rootflow` · native · puzzle · first committed 2026-04-12 · impact 3/5 · effort M
`games/rootflow.js`

**Now:** A Flow Free board: a 6x6 near-black grid with faint hairline cell divisions inside a thin sage outline, holding ten glowing candy-coloured discs (green, pink, orange, blue, gold) each stamped with a small dark unicode glyph. Above it a gold-and-cream TIER / PUZZLE / TIME / HINTS bar; below it four identical dark rounded buttons in a 2x2 block.

**Wrong with it:**
- The endpoint palette is off-house. COLORS in games/rootflow.js line 12 is a stock puzzle-game set - #5B9BD5 office blue, #6BC7D4 cyan, #B578C2 purple - and the blue and orange discs in the frame are the two brightest, most saturated things on any screen in this batch. Nothing in the midnight greenhouse palette is that blue.
- Nothing on the board is a root or a garden. The game is called Root Flow and the board is empty rgba(13,16,12,0.45) cells with a 2px sage outline; the discs are gems, the paths will be flat coloured bars (.RFarm is background:var(--rfc) with no texture). The playfield sits at almost the same value as the page behind it, so the garden has no edge.
- HINT, RESET, NEW and TIER are four identical dark rounded rectangles in a 2x2 block, same size, same border, same type - four things sharing one silhouette, distinguished only by a word and one small glyph each.
- The legend strip between the status line and the board is five 14px grey pips with 8px glyphs inside them (.RFpip, line 77). At phone size it reads as a row of specks, not a key.

**Background now:** None of its own. The shared play/shell.css radial gradient. Zero asset files, zero background-image. The board's own ground is rgba(13,16,12,0.55) with a rgba(74,124,53,0.3) border - a near-invisible step off the page colour.

**Background wanted:** A cross-section of dark soil behind the grid so the board reads as a bed you are threading roots through: a 540x960 backdrop of packed loam with pebbles and mycelium threads, dimmed and vignetted, plus a distinct darker soil texture INSIDE the .RFgrid so the playfield separates from the page.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/rootflow/bg-loam-540x960.jpg` | 540x960 full-bleed soil cross-section, dark packed loam, a few pale pebbles, faint mycelium threads, heavy vignette so the board reads on top | replaces the shared grey-green shell gradient and gives the board somewhere to be |
| `assets/games/rootflow/soil-cell-256.png` | 256x256 seamless darker soil tile, slightly cooler than the backdrop | fills .RFgrid so the playfield is a visible bed rather than a 2px outline around the same colour as the page |
| `assets/games/rootflow/seed-*.png (10 files)` | 10 PNGs at 96x96 with alpha, one per COLORS entry: painted seeds and bulbs (acorn, bean, corm, tuber, sunflower seed, pip, hull, spore case, stone, rhizome), each a different SHAPE not just a different colour, warm rim light | replaces the ten glowing CSS discs so a colourblind player can tell pairs apart by silhouette, and so the endpoints stop reading as candy |
| `assets/games/rootflow/root-arm-sheet.png` | 192x64 strip with alpha: a straight root segment and an elbow, tapered and slightly irregular, tintable white-on-alpha | .RFarm is currently a flat rectangle of solid colour; a tintable root sprite makes the drawn path look grown instead of drawn |

**CSS to do:**
- .RFgrid - replace background:rgba(13,16,12,0.55) with the soil-cell tile and add an inset shadow, so the board is a bed with an edge rather than a near-invisible outline
- COLORS in games/rootflow.js line 12 - retune off the house palette: drop #5B9BD5, #6BC7D4 and #B578C2 for muted sage, moss, copper, rose and bone; keep only enough hue separation to distinguish ten pairs
- .RFpip (line 77) - 14px with an 8px glyph is unreadable; raise the pip to 22px and the glyph to 12px, or drop the legend entirely once the seeds have distinct silhouettes
- .RFbtn - give HINT and RESET different weights from NEW and TIER (HINT primary gold, RESET and NEW quiet outline, TIER a plain text link) so the 2x2 block stops reading as four identical slabs
- .RFbtn font-size:0.74rem is close to the floor - raise to 0.8rem; min-height:48px already passes

**Emoji as art:** The endpoints use unicode geometry glyphs, not emoji, drawn inside CSS discs: SYMS at line 18 is the circle, triangle, square, star, cross, diamond, floret, crescent, lozenge and down-triangle. The only true emoji on screen is the lightbulb on the HINT button; the shell contributes the ladybug.

**Readability:** The 14px .RFpip legend with 8px glyphs is well under the floor. The TIER/PUZZLE/TIME/HINTS labels are small-caps at roughly 0.6rem in muted grey. Buttons are 48px min-height so touch targets pass, and the 2x2 button block has adequate spacing.

---

## DECENT — deliberate but thin  (31)

### Four in a Row
`play-c4` · native · board · first committed 2026-04-03 · impact 4/5 · effort M
`games/c4.js`

**Now:** A 7x6 grid of black holes on a flat brown gradient slab fills the top half of the phone. The occupied cells carry genuinely painted flower discs — a green pom-pom zinnia for the player, a rose-pink calendula for the AI — and they are by far the best thing on screen. Below: UNDO and HINT pills, four theme swatches of which one is painted and three are CSS gradient balls with a pale flower glyph stamped on them, then a Sapling difficulty pill and a New Game pill.

**Wrong with it:**
- assets/games/c4/board.png already exists in the repo — a 420x360 painted walnut board with drilled holes and rim highlights, 35KB, committed in July — and nothing in the codebase references it. The live board is a flat linear-gradient(180deg,rgba(48,36,20,.95),rgba(32,24,14,.98)) slab (c4.js:102). A painted asset someone made is sitting unused while the game shows a CSS gradient.
- Player and AI pieces share a silhouette. Both are round pom-pom blooms of near-identical diameter and petal density, separated only by hue. At 375px, and for a red-green colour-blind player, the filled region of the board reads as one texture rather than two sides.
- Three of the four themes are unpainted. ZINNIA is a PNG pair; ROSE, IRIS and LILY are radial-gradient balls with a flower or diamond text glyph stamped over them (c4.js:30-49 — the code comment literally says 'easy to replace with real PNGs later'), so switching theme drops the game a full quality tier mid-session.
- The board's 2px rgba(80,60,30,.4) border meets the near-black shell on a hard line with only a 20px drop shadow, so the board edge is a cut rather than a transition.

**Background now:** No image behind the board. The grid is a CSS linear-gradient brown slab with a 2px border and an inset highlight (c4.js:102); each empty cell is background:rgba(10,8,4,.7) with an inset shadow (line 365). The page ground is shell.css's shared radial gradient. Painted assets that ARE used: assets/games/c4/zinnia.png and calendula.png (128x128 each).

**Background wanted:** Wire the existing assets/games/c4/board.png as the grid background and repaint it at 2x as assets/games/c4/board-840x720.png: walnut with visible grain, drilled holes with a bright top lip, a bevelled outer frame and a warm rim light, plus a soft outer glow so the board sits on the page instead of against it.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `board-840x720.png` | 840x720 opaque (2x the existing 420x360 board.png). Painted walnut board: visible vertical grain, 42 drilled holes each with an inner shadow and a bright top-lip highlight, a bevelled frame edge, warm light from the upper left. | Replaces the flat CSS gradient at c4.js:102 and supersedes the unused 1x board.png, which is too low-res for a 2x or 3x phone. The board is currently the only unpainted surface in a game whose pieces are painted. |
| `rose-128.png, iris-128.png, lily-128.png` | 128x128 transparent PNG each, matching zinnia.png's painting style, lighting angle and petal density. Player-side blooms. | Replaces .c4-rose, .c4-iris and .c4-lily radial gradients plus the U+273F glyph stamped on them (c4.js:30, 32, 34, 47), so all four themes are painted rather than only ZINNIA. |
| `sunflower-128.png, tulip-128.png, dahlia-128.png` | 128x128 transparent PNG each. AI-side blooms, deliberately given a DIFFERENT flower form from the player set — flat-faced ray petals or a spiked star bloom, not another pom-pom — so the two sides differ in silhouette and not only in hue. Repaint calendula.png to the same rule. | Replaces .c4-sun, .c4-tulip and .c4-dahlia plus the U+25C6 glyph (c4.js:31, 33, 35, 48), and fixes the shared-silhouette problem visible in play-c4-2play.png where green and pink discs are the same shape. |
| `piece-shadow-128.png` | 128x128 transparent PNG, a soft elliptical contact shadow with a warm dark core, sized to sit just under a seated 128px bloom. | Drawn under each placed piece so the discs sit down in the drilled holes; today they float flat on the board with no contact. |

**CSS to do:**
- The grid element (c4.js:102) — swap background:linear-gradient(180deg,rgba(48,36,20,.95),rgba(32,24,14,.98)) for url(assets/games/c4/board-840x720.png) center/cover, and drop the per-cell background:rgba(10,8,4,.7) at line 365 so the painted holes show through instead of being covered by CSS circles.
- The empty-cell style (c4.js:365) — box-shadow:inset 0 2px 6px rgba(0,0,0,.6) gives no lip. Add inset 0 -1px 0 rgba(150,110,50,.18) so each hole has a bottom highlight and reads as drilled.
- The board container (c4.js:102) — box-shadow:0 4px 20px rgba(0,0,0,.5) is not enough separation from the shell ground. Add a 40px outer glow or a page-level vignette so the board's edge is a transition and not a cut.
- .c4-swatch (c4.js:42) — the visible circle is 34px inside a correct 48px .c4-swatch-wrap. Take the swatch itself to 42px so the player can actually judge the art they are choosing.
- .c4-winline (c4.js:26) — the four-in-a-row is announced only by a CSS pulse animation on the pieces; add a gold ray or glow overlay behind the winning cells so the win moment reads.

**Emoji as art:** A flower glyph (U+273F) is stamped on the ROSE, IRIS and LILY player pieces and a diamond (U+25C6) on the SUN, TULIP and DAHLIA AI pieces (c4.js:47-48) — a text character is the entire art for six of the eight piece types. Elsewhere: a bulb emoji on HINT, an arrow on UNDO, a refresh glyph on New Game, and a trophy emoji in the win strip.

### Spider
`play-spider` · native · card · first committed 2026-04-03 · impact 4/5 · effort M
`games/spider.js`

**Now:** Both play frames land on the CARD STYLE modal, not the table: a dark rounded sheet listing three decks, each row showing a small fan of three real card PNGs. Floral (red and black line-art court cards, gold-framed as ACTIVE), Classic (plain pips), Garden (dark painted botanical cards). Behind it the board is dimmed to near-black with a single card face visible top-left. The boot frame is the HOW TO PLAY wall with the music unlock sheet covering its bottom half.

**Wrong with it:**
- Boot frame: the music unlock sheet (#sws-music-card, position:fixed bottom, max-height:60vh, z-index 2147482000) covers the bottom half of the HOW TO PLAY wall and slices the controls list off mid-sentence at 'Drag a card or a run onto a card one'. The very first thing a new player sees has its instructions eaten.
- In the CARD STYLE modal the Garden row's tag 'Botanical reskin · mushroom·bee·flower·bir' is clipped at the right edge: the word 'bird' is cut off. The deck rows also run past the modal's right inner padding at 375px, so the sheet is asymmetric, generous on the left and flush to nothing on the right.
- The three deck rows are three identical rounded slabs with an identical three-card fan; only the gold border says which is active. The Garden deck's painted botanical art is unreadable at roughly 40px per card, so the row that sells the best art in the game sells nothing.
- Behind the modal there is no table. The one visible card sits on the shell's radial gradient with nothing under it: no felt, no surface, no shadow catcher. games/spider.js has ownCssKB 0, zero gradients and zero hex colours of its own.

**Background now:** Nothing of spider's own. The whole ground is play/shell.css's shared radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, #0d1410 60%). The card art comes from games/_cards.js, which does have real files: 12 PNGs in assets/decks/floral/ and 29 in assets/games/cards/ for the Garden reskin. assets/games/spider/ does not exist.

**Background wanted:** A card-table surface. Dark sage-green felt with a warm lamp falloff so the ten columns and the deck sit on a table instead of floating on the fleet gradient. This is the single change that would move spider from decent to strong, because the cards themselves are already painted.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-spider-felt-750x1200.jpg` | 750x1200 full-bleed, dark sage felt with a visible weave, a warm lamp pool falling from the top, corners darkened to near-black, a faint worn patch near the centre | Replaces the bare shell radial gradient behind the tableau, so the already-painted cards land on a surface |
| `card-slot-96x137.png` | 96x137 transparent, an empty column slot: rounded rectangle, faint inset border, soft inner shadow, a hint of felt showing through | Replaces .gc-empty so the ten empty tableau columns read as places to put cards rather than gaps in the layout |
| `deck-preview-floral-320x180.png (and -classic-, -garden-)` | 320x180 each, a pre-composed painted fan of that deck's King, Queen and Jack at a size where the faces actually read, transparent background | Replaces the three 40px-wide live-card thumbnails in the CARD STYLE modal, where the Garden deck's botanical art currently reads as three dark smudges |

**CSS to do:**
- music-unlocks.js #sws-music-card: suppress the unlock sheet while the how-to-play wall is on screen and defer it to the first play frame. Right now it opens over the instructions and cuts the controls list mid-line.
- games/_cards.js:83, the Garden deck tag: shorten it to 'Botanical reskin' or add overflow-wrap:anywhere to the .tag element, so 'bird' stops being clipped at 375px.
- The CARD STYLE modal container in games/_cards.js: give it symmetric horizontal padding and cap the deck rows at max-width:100%; the rows currently reach past the sheet's right inner edge while the left keeps its inset.
- games/spider.js .gc-empty (rendered at line 233): add an inset border and inner shadow so an empty column looks like a slot rather than nothing.

**Emoji as art:** Only chrome: a playing-card glyph on the Style button and undo/refresh arrows on the controls. The deck itself is real PNG art (assets/decks/floral has 12 files, assets/games/cards has 29), so nothing important is standing on an emoji.

**Readability:** The deck tag lines are small monospace and the Garden one clips. The board behind the modal is dimmed to near-black in both play frames: the single visible card is legible, nothing else on the table is. The Style button carries an explicit font-size:0.7rem inline (games/spider.js:44), which sits exactly on the floor and will render at 11.2px.

**Music chip:** Boot frame: the music unlock sheet covers the bottom half of the HOW TO PLAY wall, cutting the controls list off at 'Drag a card or a run onto a card one'. Play frame: the Music pill sits in the header at the same top:10px;left:154px spot as in slider, but the CARD STYLE modal is over it, so there is no functional overlap there.

**A "looks broken" claim here was refuted on a second look.** Opened all three hi-res shots; nothing meets the broken bar. Both play frames (2play, 3later) are the same CARD STYLE deck-picker modal — a menu screen — and capture.reached is "sparse-ui"; the claiming auditor concedes in their own evidence that "the actual tableau was never photographed." The modal renders correctly: centered, symmetric margins, CLOSE fully on-screen, gold/cream text sharp again

### TriPeaks
`play-tripeaks` · native · card · first committed 2026-04-03 · impact 4/5 · effort S
`games/tripeaks.js`

**Now:** Three peaks of ornate green Celtic/botanical card backs sit at the top of the frame, with a base row of genuinely painted faces (gold bee, glowing mushroom, moth, flower pips) and a painted stock deck stamped '23'. It reads well for the top third; below the Undo/New Game/Style row the bottom ~40% of the screen is empty near-black with only an 'Add to Home Screen' button floating in it, so the painted deck has nothing to sit on.

**Wrong with it:**
- Header is clipped: the sunbeam wallet wraps to two lines ('☀ (+8' / '0 pending)') and the 'Sign in to save' button is sliced by the right screen edge, rendering as 'Sign'. shell.css:207-217 has a <=430px rule written to prevent exactly this by shrinking #shell-music-btn to 40px, but the header carries a ~95px wide '♫ Music' pill instead, so the fix does not bite.
- Roughly 250px of dead near-black between the button row and 'Add to Home Screen' — the whole board is jammed into the top third of a 667px screen while the bottom half is void. #fg-ag is top-aligned with no vertical centring.
- The 10-card base row runs to the exact viewport edge — the rightmost J card's border is cut by the frame while the leftmost card keeps a margin, so the row reads off-centre and clipped. Cards compute to ~35px wide at 375px (_cdFit(10,{maxW:64,gap:2,pad:6}) at tripeaks.js:202), under the 48px touch minimum.

**Background now:** No game background at all. It inherits the shared native ground: html,body radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%) at play/shell.css:32. The game's own assetFiles count is 0; all the good art comes from the shared deck in assets/games/cards/ (29 PNGs) and assets/decks/floral/ (12 PNGs).

**Background wanted:** A card-table plate: dark moss felt with a warm gold rim light raking in from the top right, a soft vignette, and a faint ring of shadow under where the three peaks sit. The painted deck is the best card art in the fleet and it is currently floating on a flat gradient.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-tripeaks-table-750x1334.jpg` | 750x1334 full-bleed, near-black moss felt with visible weave, warm gold rim light from top-right, heavy vignette at the corners, no baked-in UI | Replaces the shared one-gradient ground; gives the painted cards a surface so the empty bottom half becomes table instead of void. |
| `tripeaks-peak-shadow-256x96.png` | 256x96 transparent PNG, soft elliptical drop shadow, ~35% black at centre falling to zero | Drawn under each of the three peaks so the pyramid sits on the table; today the cards have no contact shadow and hover in space. |
| `tripeaks-slot-empty-96x134.png` | 96x134 transparent PNG, faint sage outline of a card with a small corner knot, ~18% opacity | Marks a cleared card position so the pyramid keeps its silhouette as it empties; right now cleared cards leave holes in the shape. |
| `icon-deck-style-64x64.png` | 64x64 transparent PNG, two fanned painted cards in sage and gold | Replaces the 🃏 emoji on the Style button (games/tripeaks.js:19), the only emoji standing in for art in the game's own chrome. |

**CSS to do:**
- play/shell.css .shell-wallet — hide the '(+N pending)' span (#shell-pend) below 400px and let #shell-signin collapse to the leaf icon while signed out (the rule at shell.css:214 already does this signed-in); today the wallet wraps to two lines and the CTA is cut by the viewport.
- play/shell.css @media(max-width:430px) — the width:40px!important rule targets #shell-music-btn only; add the injected chip (#sws-music-chip) to that selector so the header cannot be widened past the sign-in button.
- play/shell.css #fg-ag (line 238) — add justify-content:center for the card games so the board is vertically centred and the ~250px of dead space splits above and below instead of all pooling at the bottom.
- games/tripeaks.js:202 — raise _cdFit's pad from 6 to 16 so the 10-card base row keeps an 8px margin each side instead of kissing (and clipping at) the right viewport edge.
- games/tripeaks.js:238 — covered peak cards use cd.style.opacity='.5', which renders row 3 as black slivers; use a dark scrim plus a lit gold top edge so a covered card still reads as a card next to the fully painted base row.

**Emoji as art:** 🃏 on the Style button (games/tripeaks.js:19), ↶ Undo and ↻ New Game glyphs, and the 🐞 feedback badge in the shell header. The cards themselves are painted PNGs, not emoji — this game is the good case.

**Readability:** The 'Streak: 0' readout is font-size:clamp(.55rem,1.8vw,.75rem) (tripeaks.js:276) which resolves to .55rem ≈ 8.8px at 375px, under the 0.7rem floor. Base-row cards are ~35px wide, under the 48px touch minimum, and the third-row covered cards are ~35x12px strips with a rank glyph a few px tall. The Style button is pinned to font-size:0.7rem inline.

**Music chip:** Yes. A ~95px wide '♫ Music' pill with a green glow ring occupies the header band between the 🐞 feedback button and the sunbeam wallet — the shell's own music control is a 46px square (play/shell.js:805), so this is the injected 97x48 chip landing on the header row. Downstream of it the 'Sign in to save' CTA is clipped to 'Sign' at the right edge. On the boot frame the music UNLOCK CARD ('Congratulations, you unlocked a song' / Cozy Game Loop / Play it now / Later) covers the bottom ~200px of the How-to-Play wall, hiding the rest of the controls list.

**Looks broken** (confirmed on a second look, severity ugly)**:** Two visible clips in the play frame at 375x667: the 'Sign in to save' header button is sliced by the right screen edge and reads 'Sign', and the rightmost base-row card (J) has its right border cut by the same edge. Both are on the 1x and 2x shots. The only failed requests are audio (/assets/music/the-waiting-dojo.mp3, /music/v1/card-table/cozy-game-loop.mp3) — no missing image under the game's own folder; every card PNG resolves.

### Memory
`play-memory` · native · pattern · first committed 2026-04-03 · impact 4/5 · effort M
`games/memory.js`

**Now:** Sixteen cards on near-black, fifteen showing the same card back: a saturated orange-and-cobalt fire mandala on an opaque black square. One card is face up showing a photo-real white chrysanthemum. Below, a green-outlined 'Medium 4x4' select and a matching 'New Game' pill, then the shell's Add to Home Screen button. Nothing else - no table, no frame, no background.

**Wrong with it:**
- The card back (assets/games/memory/00-card-back-card.png, wired in shared.css:2260) is a hot orange-and-cobalt mandala. Sixteen of them fill the board, so a game called Memory Garden reads as a screen of fire, with no sage, no gold, no cream - nothing of the midnight-greenhouse palette.
- Every card PNG carries its own opaque BLACK square, and .mb draws it at background-size:75% on a rgba(18,24,16,.95) rounded card. The result is a black rectangle sitting inside a lighter green rounded frame with a hard edge and an uneven margin on all four sides - visible on all sixteen cards at once.
- The board floats on nothing. bgImage is 0 for this game; the entire background is the shared native radial gradient, the cards have no frame, no shadow catch, no surface. The 'Not a match' status line is small cream text hanging in that void with no panel behind it.
- Two art styles collide on one board: the face card is photo-real with a blown-out white centre, the backs are flat high-key vector mandalas. And the difficulty select and the New Game button are the same green-outlined monospace pill at the same size, so neither reads as the primary control.

**Background now:** None of its own. bgImage:0 - the shared native radial gradient over #0d100c is the whole background. The only images in the game are the 19 card faces plus the card back.

**Background wanted:** A dark greenhouse potting bench seen from above with a warm lamp pool in the centre, so the cards lie ON something instead of floating on the shell's gradient.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-memory-540x960.jpg` | 540x960 full-bleed, dark slate potting bench from directly above, warm lamp pool centred, soft moss and scattered seed at the edges, deep falloff to near-black at the corners | Gives the cards a surface. Right now the play screen is sixteen cards on the shared gradient with nothing behind them. |
| `00-card-back-v2.png` | 540x720 at 3:4 with TRANSPARENT corners, sage-and-gold Celtic knot back on deep near-black, warm rim light, a single small rose accent | Replaces the orange/cobalt mandala that fights the house palette, and kills the opaque black square that currently shows as a mismatched inset rectangle on every card. |
| `card-frame-3x4.png` | 240x320 transparent 9-slice, thin gold double-line with corner knots in the set-51 seasonal-knot language, ~14px inset | Applied to .mw so a card has a defined edge against the black ground instead of a barely-visible rgba(74,124,53,.22) hairline. |
| `01-18 face cards, re-matted` | same 18 paintings, alpha background instead of the baked black square, 3:4 | So a flipped flower sits on the card rather than on a black tile inside the card. |

**CSS to do:**
- shared.css:2260 .mb: once the back PNG has alpha, change background-size:75% to cover and drop the rgba(18,24,16,.95) fill - together they are what produces the visible mismatched border on every card.
- shared.css:2252 .mw: add border:1px solid rgba(200,168,75,.25) and border-radius:10px so cards have an edge against the black ground.
- shared.css:2251 .mg: wrap the grid in a padded container with an inset shadow so the board reads as a table surface, not as the page itself.
- games/memory.js:9-26 face-card inline style width:92%;height:92%: set to 100% with a border-radius matching the card, so the baked black matte stops showing as an inset square.
- games/memory.js:33 #Md select.gsl vs the adjacent .gb New Game button: differentiate them - identical pill silhouette, identical green, identical monospace, so the difficulty picker does not read as a control at all.

**Emoji as art:** 🎴 👆 ★ in the stat strip and 🌿 in the win toast; the cards themselves are painted PNGs, not emoji. No emoji stands in for a game object.

**Readability:** The difficulty select and New Game button use a monospace face at roughly 0.7rem in the same green on black; 'Not a match' is small cream text with no panel behind it; the header is scrolled off in the play frame so score, moves and Best are not visible at all.

### Klondike
`play-klondike` · native · card · first committed 2026-04-03 · impact 4/5 · effort M
`games/klondike.js`

**Now:** Painted floral line-art cards - red and black art-nouveau queens, decorated pip cards - laid on a bare near-black table with no felt and no frame, plus dense green damask card backs. Tableau and the four control buttons fill the top 60% of the frame; the bottom 40% is empty black above an Add to Home Screen bar.

**Wrong with it:**
- The floral deck has no back of its own (assets/decks/floral/ holds 12 files, all faces and pips), so the clean white line-art faces are paired with playing-card-backs.png, a dense photographic green damask from the LW botanical deck. Two art languages in one hand and you can see the seam straight across the tableau.
- The four foundation piles top right are 1px dashed outlines with tiny grey suit glyphs - unfinished placeholders sitting beside painted cards - and the stock's 24 count is a bare badge printed directly on the damask back art with no plate under it.
- Nothing is under the game: roughly 250px of flat black between the Style button (y about 395) and the Add to Home bar (y about 535), while the tableau simultaneously bleeds to both screen edges - the rightmost pile's cards touch x=375 with zero margin.

**Background now:** Shared native shell only: play/shell.css:32 radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, #0d1410 60%). The game paints no background of its own (bgImage 0, gradients 0 in its own CSS).

**Background wanted:** bg-cardtable-540x960.jpg - a dark greenhouse table from above: worn deep-green felt or moss cloth, warm gold rim light entering from the upper left, soft vignette into the four corners so the cards read as objects lying on a surface. Full-bleed, no baked frame or UI.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/decks/floral/card-back.png` | 240x336 (renders ~48x66 at 1x), full-bleed opaque, no transparency | The floral deck ships faces and pips but no back, so it borrows the LW botanical green damask. A red-and-black botanical lattice on cream drawn by the same hand as queen-red.png would make face and back one deck. |
| `assets/games/cards/foundation-slot-240x336.png` | 240x336 transparent PNG, one file with a faint suit sigil per corner variant or four files | Replaces the 1px dashed outline plus grey suit glyph that currently marks each empty foundation - a carved sage stone recess with a gold embossed sigil. |
| `assets/games/cards/stock-count-plate-96x96.png` | 96x96 transparent PNG, dark plate with a thin gold rim | The remaining-stock 24 is printed straight onto the damask back and is barely readable; it needs a plate behind it. |
| `bg-cardtable-540x960.jpg` | 540x960 full-bleed JPG, deep green felt, gold rim light upper left, corner vignette | The table is currently the shared radial gradient shared with 66 other games; a real surface is what separates this from Chess. |

**CSS to do:**
- #KLstyle carries an inline font-size:0.7rem (games/klondike.js:48) - exactly at the project floor. Take it to 0.78rem and drop the inline style.
- The klondike control row (.gb: Draw 1 / Undo / New Game / Style) measures about 40px tall in the shot, under the 48px touch floor - set min-height:48px on .gb in this game.
- The tableau container has no horizontal padding: the rightmost column touches x=375. Add 10px inline padding so cards never sit on the bezel.
- Roughly 250px of dead black sits below the controls while the board is crushed at the top - give the tableau flex:1 or centre the board block vertically so the frame is composed rather than top-heavy.

**Emoji as art:** Light: the undo, new-game and auto buttons use text glyphs and a card emoji on the Style button. The playing cards themselves are real painted art from assets/decks/floral/, not emoji.

**Readability:** The gold Sign in pill is cut off by the right screen edge and reads only Sign. The Style button is pinned to 0.7rem inline, at the floor. The control row measures about 40px tall, under 48px. Card faces are pure white against a #0d1410 ground with no card border, so they read as harsh paper cutouts.

**Music chip:** Yes. The injected 97x48 music chip took the top-edge slot at left:154px;top:10px and sits exactly on top of the shell's #shell-title. Klondike is present in the DOM (capture playText lists it between the bug button and the chip) but appears nowhere on screen; the rendered header reads back-arrow, ?, ladybug, [Music chip], sunbeam counter, Sign.

**Looks broken** (confirmed on a second look, severity ugly)**:** Two visible clips in play-klondike-2play.png, both in the shared shell header at y=10-58 and therefore one fix for all 67 natives: the gold Sign in pill runs off the right edge showing only Sign, and the floating music chip completely covers the game title. The game's own playfield renders correctly.

### FreeCell
`play-freecell` · native · card · first committed 2026-04-03 · impact 4/5 · effort M
`games/freecell.js`

**Now:** A real card game: eight tableau columns of crisp white cards with red and black filigree line-art pips and an illustrated Queen, sitting on flat near-black. Across the top, four dashed green outline boxes labelled FREE next to four solid dark boxes carrying suit symbols. Three flat pills below, then the lower 40 percent of the screen is empty black.

**Wrong with it:**
- The header CTA is clipped: the gold 'Sign in' button renders as 'Sign' with the pill running off the right edge of the frame. The wallet string '(+8 pending)' wraps to two lines and widens the row past what the max-width:430px rules in play/shell.css:203-217 budget for.
- The eight top slots are two mismatched groups sitting side by side: four dashed-outline boxes (.gc-empty, 1.5px dashed sage at 0.2 alpha) that read as an unstyled wireframe placeholder, next to four solid-bordered boxes with a floating white pip. Same size, same row, two different silhouettes and two different border treatments.
- The cards are pure white and the ground is near-black, so the board glares. Nothing in the midnight-greenhouse palette is pure white. There is also no table under them: no felt, no rail, no contact shadow, so 52 white rectangles float on a gradient and the bottom 40 percent of the frame is dead space.

**Background now:** Nothing of its own. ownCssKB is 0, zero gradients, zero hex colours in games/freecell.js. It inherits the shared play/shell.css body radial over near-black.

**Background wanted:** A card table: deep bottle-green felt with a warm lamp pool centred about 50%/28%, falling to near-black at the edges, and a hint of dark wood rail across the bottom to close the empty lower third.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-cardtable-750x1334.jpg` | 750x1334 full-bleed, bottle-green felt with visible nap, warm lamp pool at 50%/28%, near-black vignette, a dark wood rail across the bottom 12 percent | Replaces the shared radial gradient for both card games. Kills the floating-cards-on-void look and fills the empty lower 40 percent. |
| `cardslot-free-96x134.png` | 96x134 transparent PNG, an empty free cell: shallow felt inset with a thin gold rope edge and a small engraved sage leaf centred | Replaces .gc-empty's dashed CSS outline and the 0.48rem 'FREE' label, both of which read as a wireframe placeholder. |
| `cardslot-foundation-96x134.png` | 96x134 transparent PNG, same felt inset shell, with the suit pressed into the felt in dull gold rather than a bright floating pip; four variants (spade, heart, diamond, club) | Replaces .gc-fnd's solid box so the eight top slots finally read as one row of matching wells. |
| `card-contact-shadow-140x48.png` | 140x48 transparent PNG, soft elliptical drop shadow, about 30 percent black at centre falling to zero | Sits under each column so cards meet the felt through a transition instead of a hard cut edge. |

**CSS to do:**
- play/shell.css:208-217 .shell-wallet and #shell-signin - the pending-balance string wraps and widens the header row so the gold CTA clips at 375px. Give .shell-wallet min-width:0 and flex-shrink:1, and abbreviate the balance to '+8' (drop the word 'pending') below 430px.
- games/freecell.js:287 the FREE label - font-size:0.48rem is 7.7px, and the colour is rgba(122,179,86,0.6) on near-black. Raise to 0.72rem and lift the alpha to 0.85.
- games/_cards.js .gc-empty - border:1.5px dashed rgba(74,124,53,.2) reads as an unfinished placeholder. Make it a solid 1px inset with an inner shadow so it matches .gc-fnd and the top row reads as one group.
- games/_cards.js .gc card face - the face is pure #fff. Drop to a warm paper tone around #F4EDE0 so the cards sit inside the midnight-greenhouse palette instead of glaring against it.
- play/shell.css #fg-ag for this game - the board fills the top 55 percent and the rest is empty. Either centre the mount vertically or grow the card size so the layout reaches the bottom of the frame.

**Emoji as art:** Only chrome, not the board: the U+1F0CF joker glyph is the Style button icon, and arrow glyphs stand in for Undo and New Game icons. The cards themselves are real painted art from assets/games/cards/ (Floral line-art faces, illustrated court cards), which is why this scores decent rather than plain.

**Readability:** The 'FREE' labels are 0.48rem (7.7px) at 0.6 alpha sage on near-black, the worst text in the batch. The compressed indices in each column are small but legible. The header 'Sign in' CTA is cut in half, so the primary account action is partly unreadable.

**Looks broken** (confirmed on a second look, severity ugly)**:** Header CTA clipped at 375px: the gold sign-in pill renders the text as 'Sign' and the button body runs past the right edge of the frame. Visible in play-freecell-2play.png top-right. Caused by the '(+8 pending)' wallet string wrapping to two lines and widening the row beyond the max-width:430px budget in play/shell.css:203-217. The board itself renders correctly.

### Golf Solitaire
`play-golf` · native · card · first committed 2026-04-03 · impact 4/5 · effort S
`games/golf.js`

**Now:** Seven columns of white cards with filigree line-art pips and illustrated court cards, over a flat near-black ground. Top left, a genuinely handsome painted deck back in teal and gold with a mushroom motif, with the number 16 dropped straight onto the pattern in white, and a face-up Ace beside it. 'Need ±1 rank' is centred above; '35 left' floats alone in gold at the far right. The bottom 45 percent of the frame is empty.

**Wrong with it:**
- The top band is unmotivated: the deck and waste sit hard against the left edge, then about 400 real pixels of nothing, then '35 left' orphaned at the right margin. Two elements, one at each end, nothing tying them together and no group in the middle.
- The remaining-count numeral sits directly on the ornate deck-back artwork with only a text-shadow behind it, so a white 16 fights teal-and-gold filigree. It needs a plate. Source: games/golf.js:238, clamp(.62rem,2vw,.82rem), which resolves to about 10px at 375px.
- No table and no transition: the painted deck back is warm teal-gold, the cards next to it are pure white, and both meet flat near-black through a hard rectangular edge with no shadow, no felt, no rail. Below the three pills the lower 45 percent of the screen is empty void.

**Background now:** Nothing of its own. Zero gradients, zero hex colours, zero keyframes in games/golf.js. It inherits the shared play/shell.css body radial over near-black.

**Background wanted:** The same card-table asset as FreeCell: bottle-green felt, warm lamp pool, near-black vignette, wood rail across the bottom. One asset serves both card games and closes the dead lower half.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-cardtable-750x1334.jpg` | 750x1334 full-bleed, bottle-green felt with visible nap, warm lamp pool at 50%/22%, near-black vignette, dark wood rail across the bottom 12 percent | Shared with FreeCell. Replaces the flat shell gradient and fills the empty bottom 45 percent. |
| `deck-count-plate-72x72.png` | 72x72 transparent PNG, dark near-black disc at about 75 percent opacity with a thin warm gold ring, soft outer falloff | Sits under the remaining-count numeral on the deck back so the number stops fighting the ornate pattern. |
| `golf-waste-well-100x140.png` | 100x140 transparent PNG, an engraved felt well with a thin gold edge, empty | Anchors the waste pile position, which currently has no marked home, and gives the deck/waste pair a motivated group. |
| `card-contact-shadow-140x48.png` | 140x48 transparent PNG, soft elliptical drop shadow, about 30 percent black at centre falling to zero | Same asset as FreeCell. Gives every column a transition to the felt instead of a hard cut edge. |

**CSS to do:**
- games/golf.js:238 the stock-count span - font-size:clamp(.62rem,2vw,.82rem) resolves to about 10px at 375px, on top of busy artwork. Raise the floor to 0.8rem and put the plate behind it.
- games/golf.js:247 the 'empty' label - font-size:clamp(.5rem,1.5vw,.7rem) resolves to 8px at 375px, under the 0.7rem minimum. Raise the floor to 0.72rem.
- The '35 left' counter element - move it directly under the deck, or centre it on the same baseline as 'Need ±1 rank', so the top band is one group rather than two orphans at opposite margins.
- games/golf.js:51 the disabled Undo control - opacity:0.45 on already-muted text makes the label barely legible on near-black. Lift disabled opacity to about 0.65 and keep the border visible.
- play/shell.css #fg-ag for this game - vertically centre the mount, or grow the card size, so the board is not pinned to the top with 45 percent dead space beneath it.

**Emoji as art:** Chrome only: the U+1F0CF joker glyph on the Style button, arrow glyphs for Undo and New Game, and a trophy emoji on the win state. Four distinct emoji total. The cards and the deck back are real painted assets from assets/games/cards/.

**Readability:** Two labels resolve under the 0.7rem house minimum at 375px: the deck count at about 10px sitting on patterned art, and the 'empty' slot label at 8px. The disabled Undo button at 0.45 opacity is close to unreadable. Everything else is legible; the white card faces are if anything too hot against the black ground.

### Lights Out
`play-lights` · native · puzzle · first committed 2026-04-03 · impact 4/5 · effort M
`games/lights.js`

**Now:** A painted photo-real forest floor (grid.png) fills a rounded rectangle in the middle of the screen, with a 5x5 grid of stone sockets holding mushroom caps - nine lit in a hot mint-green glow, sixteen dark. Everything around that one image is bare: flat near-black page, two plain green pill buttons, and a header where the gold Sign in button is sliced in half by the screen edge.

**Wrong with it:**
- The gold Sign in button is cut in half by the right screen edge - it reads 'Sign' with no right border - and the sunbeam wallet beside it wraps mid-phrase so the count reads '☀ (+8' on line one and '0 pending)' on line two.
- The game title 'Lights Out' is in the page text but nowhere on screen: the wide green-outlined ♫ Music control is sitting in the centred .shell-title slot. The moves/solved strip the code writes at games/lights.js:14 ('#1 · 👆0 · ✅0') does not render either, so the player has no score anywhere on the play screen.
- The board is a hard-cropped photo rectangle with an 8px radius floating on flat #0d100c - ferns are sliced mid-leaf on all four edges, and there is no frame, vignette or transition between the painted image and the void it sits on.
- Unlit shrooms sit at almost the same value as their stone socket, so half the grid reads as empty holes rather than dormant lights - the pattern you are meant to solve is the hardest thing on screen to see. Every lit cell is also the identical sprite stamped nine times.

**Background now:** Painted forest-floor image assets/games/lights/grid.png inserted as a plain <img> inside the board wrapper (games/lights.js:16). The PAGE behind it has nothing of its own - the shared native radial gradient over #0d100c.

**Background wanted:** A full-bleed 540x960 forest-floor backdrop behind the whole page so the board sits in a place instead of on a void, plus a painted frame or vignette so the grid.png crop stops ending on a straight line.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-lights-540x960.jpg` | 540x960 full-bleed, deep night forest floor receding into darkness, warm gold firefly motes in the top third, moss and leaf litter at the bottom | Replaces the shared flat radial gradient so the board sits in a scene rather than on empty black. |
| `frame-lights-420x420.png` | 420x420 transparent, 9-slice mossy stone-and-root border with rounded corners, ~28px inset | Closes the hard photo crop of grid.png, which currently ends on a 1px line with ferns sliced mid-leaf. |
| `shroom-off-160.png` | 160x160 transparent, unlit cap with a cream rim light and a faint gold underglow at the base | Replaces shroom-off.png, which is so close in value to the stone socket that dormant cells read as empty holes. |
| `shroom-on-a/b/c-160.png` | three 160x160 transparent variants, cap tilt and gill count varied, same mint-into-gold glow | Replaces the single shroom-on.png so a lit row is not one sprite stamped five times. |

**CSS to do:**
- play/shell.css .shell-wallet: add min-width:0;flex-shrink:1 and give #shell-signin flex-shrink:0;white-space:nowrap - the @media(max-width:430px) block at line 208 was written for this exact bug and the button is still clipped at 375px.
- play/shell.css .shell-wallet: white-space:nowrap on the sunbeam readout so '☀ 0 (+8 pending)' stops breaking across two lines.
- The ♫ Music control must not sit over the header - it is covering .shell-title (play/shell.css:151), which is flex:1 and centred. Re-place it or lower its stacking.
- The lights board wrapper (inline style at games/lights.js:15, position:relative;width:clamp(300px,92vw,420px)): add box-shadow:inset 0 0 40px 12px rgba(13,16,12,.85) so the photo crop fades into the page instead of ending on an edge.
- The Reset button (games/lights.js:17): drop the ↩️ emoji, which renders as a blue-and-white system glyph inside a green pill, for a text ↺ or an inline SVG.
- Restore the stat strip - ms(a,...) is called at games/lights.js:14 but nothing appears between the header and the board, and its text is absent from the captured page text.

**Emoji as art:** ↩️ in the Reset button renders as a blue/white system glyph inside a green pill; 👆 ✅ in the stat strip (not rendering); 🍄 at 3.2rem is the entire art of the win overlay (games/lights.js:27).

**Readability:** Sign in clipped to 'Sign'; sunbeam readout wraps so the number lands on a different line from its icon; unlit-mushroom vs stone-socket contrast too low to tell a dormant cell from an empty one; no score readout on screen at all.

**Music chip:** The wide ♫ Music pill occupies the centre of the header, exactly where .shell-title sits, so the game name 'Lights Out' is never visible on the play screen even though it is present in the page text.

**Looks broken** (confirmed on a second look, severity ugly)**:** In play-lights-2play.png the gold Sign in button is sliced by the right viewport edge (reads 'Sign', no right border), the sunbeam wallet wraps to two lines mid-phrase, the game title is fully covered by the ♫ Music control, and the stat strip written at games/lights.js:14 renders nothing - it is also absent from capture.playText.

### Vine Puzzle
`play-pipe` · native · puzzle · first committed 2026-04-03 · impact 4/5 · effort M
`games/pipe.js`

**Now:** A 5x5 board of painted dirt-and-vine tiles on the shared near-black shell gradient - genuinely painted art, warm brown soil, green leaf clusters, a woody vine running through each tile. START (top-left) and FINISH (row 3, col 1) are dark swirl tiles with a green and a gold glow halo and small label chips.

**Wrong with it:**
- START and FINISH are the SAME picture. Both cells render vine-end.png (games/pipe.js line ~52 comment admits it: the start reuses the END cap art). The two most important squares on the board share one silhouette - a dark swirl - and are told apart only by a text chip and an arrow overlay.
- The tile art is obvious repeating wallpaper. Row 3 has four straight tiles side by side that are pixel-identical: same leaf cluster, same speckle pattern, same highlight. Across 25 cells there are only 3 distinct pictures rotated 4 ways.
- Every tile is an opaque 128x128 RGB square with a rounded corner and a 2px black gap, so the soil never meets its neighbour and the vine visibly BREAKS at each seam - even a correct run reads as 5 separate coasters, not one root.
- assets/games/pipe/vine-bg.png (128x128, 31KB) is painted and committed but referenced nowhere in the repo - the space behind the grid is the shared shell radial gradient and nothing else.

**Background now:** None of its own. The shared play/shell.css radial gradient: radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%) over near-black.

**Background wanted:** A soil bed behind and under the grid so the board sits IN a garden instead of floating. vine-bg.png already exists as a 128x128 tile - repeat it as the .lg container background with a dark vignette, then paint one full-bleed 540x960 backdrop of a night vegetable plot (raised bed edge at the bottom, dark canopy at the top).

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/pipe/vine-straight-b.png` | 128x128 PNG with ALPHA, vine only, no soil - a second straight run with a different leaf count and a knot in the wood | replaces the third and fourth identical straight tile in a row; kills the wallpaper repeat |
| `assets/games/pipe/vine-corner-b.png` | 128x128 PNG with ALPHA, vine only - a second corner with the elbow tighter and leaves on the outside of the bend | same, for corners |
| `assets/games/pipe/soil-bed-512.png` | 512x512 seamless tiling soil, dark loam, wet speckles, no vine | one continuous bed drawn under the whole grid so the alpha vine tiles lay on it and seams disappear |
| `assets/games/pipe/vine-source.png` | 128x128 REPAINT - a pale sprouting seed with two cotyledons pushing out of the soil and one clear exit direction | gives START its own silhouette; the current file was abandoned for reading as a 4-way crossroad and the end-cap was used instead |
| `assets/games/pipe/vine-bloom.png` | 128x128 - an open rose-pink bloom on a short stem, one entry stub, warm rim light | the goal text says connect the root to the BLOOM but FINISH currently shows a brown swirl with a small gold nut |
| `assets/games/pipe/bg-vinepuzzle-540x960.jpg` | 540x960 full-bleed, night vegetable plot, raised bed timber across the bottom, dark leaf canopy top, one warm lantern glow off-centre | replaces the shared grey-green shell gradient behind the board |

**CSS to do:**
- #PP (.lg) - add background:url(assets/games/pipe/soil-bed-512.png) center/256px repeat and change gap from 2px to 0, so the tiles butt together and the vine is continuous
- #PP .lg > div - remove the per-tile border-radius so the soil edge is not rounded off at every cell
- .shell-hdr - the row overflows 375px: the sunbeam readout wraps to two lines and #shell-signin is clipped to the word 'Sign'. Add flex-wrap:nowrap plus min-width:0 on the sun readout, and shorten #shell-signin to 'Sign in'
- .lg > div (START/FINISH wrapper) - the label chip sits on the tile's top edge and its glow spills into the neighbouring row; move the chip to overlay the tile centre-bottom with a 4px inset

**Emoji as art:** The START and FINISH markers are emoji chips over the tiles (seedling and cherry-blossom, games/pipe.js line ~96), and the New Game button uses the refresh arrow glyph. The board tiles themselves are real painted PNGs, so emoji only stand in for the two goal markers.

**Readability:** The shell header overflows at 375px: 'Sign in to save' is cut off mid-word at the right edge and the sunbeam count wraps to two lines. The START/FINISH chip text is about 0.62rem grey-on-dark over busy soil. Tiles are ~62px so touch targets pass.

**Music chip:** The injected #sws-music-chip lands top-left at about x=128, inside the sticky shell header band, between the ladybug button and the sunbeam readout. It does not cover a control but it is the brightest, largest element in the header - a glowing green-outlined pill louder than the game's own back and help buttons - and it reads as if it were part of the shell chrome.

### 2048
`play-merge` · native · math · first committed 2026-04-03 · impact 4/5 · effort M
`games/merge.js`

**Now:** A 4x4 grid of near-black rounded squares on a near-black ground, its top edge cut off by the scroll. Three cells hold a small green sprout PNG with a thin maroon soil line and a white 4 stacked underneath. Below the board, four large dark arrow buttons, then New Game and Themes pills and the Add to Home Screen bar.

**Wrong with it:**
- The value ladder has no colour ladder. shared.css:2306 gives .t0 rgba(26,31,23,.35) and .t4 rgba(30,36,26,.55) - four RGB points apart - and the whole 2 to 256 run lives inside a 32-unit span of dark olive. On the near-black shell you cannot tell a filled tile from an empty one except by the sprout. The climbing heat of the tiles is the entire visual point of 2048 and it is missing.
- Art and numeral collide. tileArt scales the plant 1.55x with transform-origin center 58% (games/merge.js:48) and the numeral is stacked directly beneath it (line 178), so the sprout's maroon soil line lands right above the white 4 and the number reads as part of the pot rather than as the tile's value.
- The board has no ground. The 4x4 of cells floats with no frame, no border, no inner shadow and no tray, on a background that is the same colour as the cells, and its top edge sits flush against the viewport with zero breathing room. Nothing in the frame tells you where the board begins or ends.
- The four direction keys are emoji glyphs, so their weight and colour are set by the system font and clash with the Bebas labels on the pills eight pixels below them.

**Background now:** Nothing of its own. play/shell.css line 32 radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%). Tile fills come from the shared .t0-.t2048 rgba ramp in shared.css:2306. There IS real art: assets/games/merge holds 23 plant files plus four full 11-tile theme sheets (cosmos, ember, sugar, tide), 66 files and 5.2 MB, all wired.

**Background wanted:** bg-merge-grove-540x960.jpg - a night greenhouse potting bench: out-of-focus glass panes and hanging leaves behind, a warm gold lantern glow falling from the top right, dropping to deep near-black across the bottom third so the tile tray reads as sitting on a real table under a lamp.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `tray-merge-480x480.png` | 480x480 transparent, painted dark slate-and-wood seed tray with 16 recessed square wells, a soft inner shadow inside each well, warm rim light along the top-left lip | Sits behind .tb#Rb2 and replaces the invisible .t0 cells, which currently differ from the page background by about 4 RGB points. Gives the board an edge and a ground. |
| `bg-merge-grove-540x960.jpg` | 540x960 full-bleed, night greenhouse bench, gold lamp glow top-right, near-black bottom | The game has no background of its own; the tray and the painted tiles currently sit on the same shared gradient as 65 other natives. |
| `arrow-pad-256x256.png` | 256x256 transparent 2x2 sheet, four painted brass-and-leaf directional keys (up, down, left, right), warm gold with sage inlay, big readable silhouettes | Replaces the emoji arrows in the four direction buttons at games/merge.js:88, which currently render in the system font and clash with everything else on screen. |

**CSS to do:**
- shared.css:2306 - rebuild the .t2 to .t512 ramp so lightness actually climbs (near-black at 2, mid sage around 64, lit sage at 256, and keep the gold treatment at 1024/2048). At present all eleven steps sit inside rgba(26..58, 31..78, 23..44) and the ladder is invisible.
- games/merge.js:76 (.tb#Rb2) - add padding:8px; border-radius:14px; background:rgba(10,14,9,.6); box-shadow: inset 0 2px 10px rgba(0,0,0,.6) so the board reads as a tray with an edge instead of dissolving into the page.
- games/merge.js:178 (the tile numeral div) - move the value out of the vertical stack to position:absolute; top:4px; right:6px at 0.75rem so the plant art gets the whole cell and the soil line stops colliding with the digit.
- games/merge.js:76 - the board is bd.style.width min(96vw,480px) with no top margin; add margin-top:10px so the top row is not flush against the viewport edge.

**Emoji as art:** The four direction keys are emoji arrows, the Themes pill uses a flower glyph, New Game a reload glyph, and the theme picker rows use palette/herb/leaf/star glyphs (15 emoji, 12 distinct). The tiles themselves are NOT emoji - they are real painted PNGs, 11 per theme across five themes.

**Readability:** The white 4 at clamp(.9rem,3vw,1.3rem) is legible. Direction buttons are 64x64, comfortably over the 48px minimum. The failure is contrast between tile and board, not type size. One text fault: the locked-theme SOON label in the picker is 0.7rem, exactly at the floor.

### Yacht-Sea
`play-yahtzee` · native · dice · first committed unknown · impact 4/5 · effort L
`games/_inline/yahtzee.js`

**Now:** A navy felted panel with a brass border holds thirteen identical rounded score plates running down the screen, each with an emoji at the left, a serif category name with a cyan nickname beside it, a tiny grey description under it and a comma-sized placeholder at the right. At the bottom a gold-bordered TOTAL plate reading 0. The boot frame is the shared how-to-play wall with a music-unlock card covering its lower half.

**Wrong with it:**
- Thirteen vendor emoji run down the left rail as the only icon art - lifebuoy, oars, shell, sailboat, compass, anchor, fish, ship, sailboat again, motorboat, wave, speedboat, die (games/_inline/yahtzee.js:49-61). Each one has a different colour temperature, outline weight and built-in shadow, so no two share a light source. On a navy plate it is a ransom note, and it is the loudest thing wrong in the frame.
- The palette leaves the house entirely: the pan is linear-gradient(135deg,#123048,#0c2036,#07162a) navy with #4aa8cf/#5fb0d9/#8fd6ee cyan type and a #6b4520 brass border - nautical, not midnight greenhouse. The code even admits it, hue-rotating the painted botanical dice by -16deg (line 33, comment: 'cool blue cast so the dice sit against the navy pan'). That is recolouring painted art to survive a background instead of painting art for the game.
- Type runs far under the 0.7rem floor throughout: category descriptions at 0.5rem (line 206), UPPER/LOWER section labels at 0.55rem (lines 219, 228), the empty-score placeholder at 0.65rem in 30%-opacity cream (line 199), and the dice-tray hint at 0.5rem (line 117). The sub-lines are grey mush on a phone.
- No grouping and no rhythm: thirteen plates of identical width, identical fill and ~40px pitch with 2px margins. Upper and Lower are divided only by a 0.55rem label, so the eye has nothing to hold and the card reads as one long undifferentiated stack.

**Background now:** The game paints its own pan (#Ypan, line 74-87): an inline SVG feTurbulence noise tile at 180x180 over radial highlight + radial shadow over a 135deg navy ramp, with a 2px #6b4520 brass border and inset shadows. Behind the pan is the shared play/shell.css radial gradient. No image files at all - assetFiles 0.

**Background wanted:** A painted felt ground in the house palette instead of the navy CSS ramp - a dice porch at night, deep teal-green baize under a warm lamp pool. If the Director wants the nautical theme kept, then commit to it with a painted harbour-night backdrop rather than a flat three-stop gradient pretending to be one.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `score-icons-13-832x64.png` | 832x64 transparent strip, 13 frames of 64x64: buoy, oars, shell, sail, compass, anchor, fish school, fleet, full deck, wake, current, yacht, tide. One painted set - one light source from top-left, one line weight, warm rim light, sage/gold/cream with a touch of rose. | Replaces the 13 mismatched emoji at games/_inline/yahtzee.js:49-61. This alone lifts the scorecard from ransom note to a designed object, and it is the biggest single visual win in the game. |
| `felt-pan-1120x1120.jpg` | 1120x1120 tileable. Painted felt/baize in deep teal-green, visible nap texture, a warm lamp falloff pooling at the top-centre, edges darkening. | Replaces the SVG-turbulence-over-navy-gradient stack in #Ypan and pulls the game back into the midnight greenhouse palette, which then lets the dice hue-rotate hack be deleted. |
| `bg-yacht-sea-540x960.jpg` | 540x960 full-bleed. A porch at night looking out over dark water: deep sage-black sky, one warm lantern glow top-left, a low band of water at the bottom, centre kept quiet so the scorecard stays legible over it. | Replaces the shared 66-game shell gradient behind the pan, so the game has a room instead of the default corridor. |
| `total-plate-680x120.png` | 680x120 transparent. A worn brass nameplate with a warm inner glow, hand-punched edges and two small rivets, sized to sit behind the TOTAL row. | The final score is the biggest number in the game and currently sits on a plain gold-bordered rectangle built from two rgba stops. |

**CSS to do:**
- games/_inline/yahtzee.js:206 - raise the category description from `font-size:0.5rem` to `0.68rem`; lines 219 and 228 - raise the UPPER and LOWER section labels from `0.55rem` to `0.7rem`; line 199 - raise the empty-score placeholder from `0.65rem` and lift its colour from rgba(232,220,200,0.3) to 0.5.
- games/_inline/yahtzee.js:203 - the score row is `padding:6px 10px` around two short lines, giving roughly a 38px tall control, and this row IS the primary tap target (onclick _YS(i)). Change to `padding:11px 12px` to clear the 48px floor.
- games/_inline/yahtzee.js:74-87 #Ypan background - swap `linear-gradient(135deg,#123048 0%,#0c2036 55%,#07162a 100%)` for the house ground `linear-gradient(135deg,#12211a 0%,#0d1713 55%,#080f0c 100%)`, or point it at felt-pan-1120x1120.jpg once painted.
- games/_inline/yahtzee.js:33 `.yDie img` - delete `hue-rotate(-16deg) saturate(0.92)` from the filter once the pan is repainted, keeping only the drop-shadow. Painted dice should not be recoloured to match a background.
- games/_inline/yahtzee.js:185 rowBg - alternate the idle fill between `rgba(0,0,0,.30)` and `rgba(255,255,255,.028)`, and add `border-left:3px solid rgba(122,179,86,.35)` on the six upper rows and `rgba(220,138,138,.35)` on the seven lower rows, so the card reads as two motivated groups instead of thirteen loose plates.

**Emoji as art:** Heavy. Thirteen category icons (lifebuoy, oars, shell, sailboat, compass, anchor, fish, ship, sailboat, motorboat, wave, speedboat, die) at games/_inline/yahtzee.js:49-61; an anchor in the turn counter (line 63); a die emoji on BOTH the Roll and the Style buttons (lines 108, 110); U+21BB on New; a star on the Yacht overlay (line 136); leaf/party/trophy in the end card. The dice faces themselves are real painted PNGs via window.LW_DICE (assets/dice/d1-6.png, all present) - those are the one piece of genuine art here.

**Readability:** Worst of the three. 0.5rem descriptions and 0.55rem section labels are well under the 0.7rem floor; the empty-score placeholder is a 0.65rem comma at 30% opacity, effectively invisible; and the tappable score rows are roughly 38px tall against a 48px minimum. The category names (0.75rem Georgia) and TOTAL (1.6rem) are fine.

**Music chip:** Yes, and it is doing real damage - though it is the music UNLOCK CARD, not the corner chip. On the boot frame it covers the bottom half of the how-to-play wall: it hides the entire 'The controls' list (the line 'Tap dice to hold them' is sliced in half by the card's top edge) and the LET'S PLAY button underneath. The player's first frame of this game is a song promo sitting on the instructions, and it is why capture.reached is 'no-more-controls'.

### Stop at Ten
`play-stopten` · native · pattern · first committed 2026-04-13 · impact 4/5 · effort M
`games/stopten.js`

**Now:** One tall dark panel edged with a thin gold-to-sage-to-brown gradient border, filling almost the whole frame. Inside, top to bottom: the goal line, an italic gold 'Target, 10 seconds', a small vector seed-sprout character with two flat green leaves and a sad face, 'ATTEMPT 3 / 3', a large gold monospace '0.52', the word SECONDS, a green outlined START button, 'MISS' in rose, and the delta in mono. Below the panel, RULES / New Game / Add to Home Screen. It is the most deliberately composed of the four, but it is one dark box on a dark ground with no art in it.

**Wrong with it:**
- The panel and the page ground are both near-black, so the 3px masked gradient border (.st-frame::before) is the only thing separating them. The frame reads as a hairline rectangle floating in a void: nothing behind it, no surface, no transition at its edge, and the whole outside of the frame is empty.
- The seed buddy is 74px of flat vector: two solid #4a7c35 leaf blobs, a plain oval body, two dots and a curve (BUDDY() at games/stopten.js:92). Against a frame that is otherwise gold, mono and gradient-bordered it reads as clip art. The source itself concedes the point at line 89, 'swap for <img src="assets/games/stopten/buddy.png"> whenever Stephen ships art', and that PNG has never been painted: assets/games/stopten/ does not exist.
- The four corner ornaments are 14px radial-gradient(circle,#c8a84b 0%,transparent 65%) dots. At 375px they are four fuzzy gold smudges in the corners and read as rendering artifacts, not as ornament.
- The word SECONDS is separated from the '0.52' it labels by roughly its own height, so the clock reads as an unlabelled figure with a stray caption drifting below it rather than as one number-plus-unit.

**Background now:** play/shell.css's shared radial gradient, unchanged. The panel is .st-frame: a near-black fill with a masked linear-gradient(135deg,#c8a84b,#7ab356 45%,#3b2a14 90%) border and an inset gold glow. No image is loaded anywhere: assetUrls lists assets/games/stopten/buddy.png but that string only appears inside a source comment, so nothing 404s and nothing paints.

**Background wanted:** A painted potting-shed interior behind the frame so the panel sits in a room rather than a void: dark boards, a warm lamp pool falling from the upper left, a shelf line low in the frame, all darkened enough that the gold border and the clock still read on top.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-stopten-shed-750x1000.jpg` | 750x1000 full-bleed, painted potting shed: dark vertical boards, a warm lamp pool top-left, a shelf edge across the lower third with two silhouetted pots, overall value kept low | Fills the empty ground the .st-frame currently floats in, and gives the gold frame a reason to be a frame |
| `buddy-stopten-idle-148x148.png (plus -focused, -happy, -sad)` | 148x148 transparent each (2x for the 74px slot), painted seed-sprout character: warm rim light from upper left, two real veined leaves, four expressions matching the existing states | This is the exact file games/stopten.js:89 already names and nobody has painted; it replaces the flat inline SVG that currently reads as clip art |
| `frame-corner-leaf-64x64.png` | 64x64 transparent, a painted gold leaf-and-tendril corner ornament, designed to mirror into all four corners | Replaces the four 14px radial-gradient dots (.st-corner) that currently read as smudges |

**CSS to do:**
- games/stopten.js .st-frame: give the panel a real fill a step lighter than the page (about #131a13) plus an inset top highlight, so it separates from the ground instead of relying on the 3px border alone.
- games/stopten.js .st-corner: swap the radial-gradient(circle,#c8a84b 0%,transparent 65%) for the corner PNG at 32px; the current dots read as artifacts.
- games/stopten.js .st-clock (margin:8px 0) and the SECONDS label below it: pull the label to margin-top:-2px so it captions the number instead of floating free.
- games/stopten.js .st-buddy: raise width/height from 74px to 96px once real art lands; at 74px the character is smaller than the START button's own label.

**Emoji as art:** Sixteen emoji, ten distinct, all in chrome: a book on RULES, a refresh arrow on New Game, a calendar on the DAILY mode chip, and outbox/check/target/chart/gamepad/bulb glyphs across the mode and stat rows. The character is hand-written inline SVG rather than emoji, but at 74px flat it reads like one.

**Readability:** Fine in this frame. The clock is clamp(3rem,13vw,4.4rem), the MISS line is large, and the delta '-9.46s from 10.00' is the smallest at roughly 0.72rem, just over the floor. .st-btn is min-height 60px and min-width 140px, and the RULES / New Game row below is comfortably over 48px.

### Tower of Hanoi
`play-hanoi` · native · puzzle · first committed 2026-04-03 · impact 4/5 · effort M
`games/hanoi.js`

**Now:** A small composed scene: a brown wooden plank across the lower middle carrying three pegs, with five stacked rounded disks running sage green at the top through gold to burnt orange at the base, lit by a faint sage radial glow. Everything else is empty - roughly the top 25% and bottom 30% of the play area are bare near-black. Below sit Moves and a timer, a greyed Undo and a gold New, then the peg and disk selectors.

**Wrong with it:**
- The peg rod renders THROUGH the disk stack: a brown post segment is painted on top of the third and fourth disks, stops dead in the middle of the tower, and is hidden behind the two above it. It reads as a splinter driven through the disks rather than a rod they are threaded onto.
- The composition is left-heavy and empty: the loaded peg sits hard against the far left of a 660px plank while two toothpick rods (about 7x20 CSS px) stand alone in the remaining 60% of bar, and the plank ends in a hard rounded edge with no table under it, no contact shadow and no ground - it floats in a green-black void.
- The controls row is three mismatched pieces: '3 pegs' inside a wide sage pill, '5' inside a circular pill, and the word 'disks' orphaned outside both in pure white system font - the only pure white on the screen. It comes from a bare ' disks' text node after the select at games/hanoi.js:346, and the two selects do not match each other. The top two green disks also share a silhouette: same value, nearly the same width, so they read as one shape.

**Background now:** games/hanoi.js:47 - a radial sage glow at 50% 8% over a dark linear gradient on the panel; the plank, pegs and disks are all CSS linear-gradients (#8a6a42 to #6b4520 to #3a2410 for the wood). 13 gradients, no images, assetFiles 0.

**Background wanted:** bg-hanoi-bench-540x960.jpg - a greenhouse workbench at night: a deep wooden bench top the plank can rest on, terracotta pots and a watering can blurred at the frame edges, one warm gold lamp from upper-left casting the tower's shadow to the right, top third near-black so the HUD stays readable.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `hanoi-plank-660x120.png` | 660x120 PNG, transparent, a painted worn wood plank with visible grain, cut and chamfered ends, and a soft contact shadow baked into the bottom edge | Replaces the CSS-gradient bar so the base is an object resting on a bench instead of a rounded rectangle with a hard edge. |
| `hanoi-peg-32x220.png` | 32x220 PNG, transparent, a turned wooden dowel with warm rim light on the left, a socket collar at the base, tall enough to stand clear above a full 8-disk stack | Replaces the 7x20px CSS toothpick rods, which are invisible as targets, and gives a rod tall enough that it never has to be drawn over the disks. |
| `hanoi-disk-sheet-1280x160.png` | 1280x160 PNG, transparent, eight 160x160 disks largest to smallest, painted stone and wood rings in sage through gold to terracotta, each with a real top face and a visible centre hole | Replaces the CSS pills - the centre hole lets the rod pass THROUGH the disk and fixes the splinter effect, and distinct materials stop the two green disks sharing a silhouette. |
| `hanoi-win-glow-540x300.png` | 540x300 PNG, transparent, a warm gold bloom with drifting motes, alpha falloff to nothing at the edges | Replaces the leaf and star emoji currently carrying the solved state. |

**CSS to do:**
- .hrod: set z-index:0 and give .hdk z-index:1 (or draw the rod as a ::before on .hpeg beneath the disk stack) - right now the rod paints over the lower disks and under the upper ones, which is the splinter artefact.
- .hpegs: change justify-content:space-around to space-evenly and add padding-inline:6% so the three columns are equally weighted; the loaded stack currently hugs the left end of the plank.
- .hrod: raise width to 12px and height to clamp(120px,32vw,160px) so an empty peg reads as a target rather than a splinter, even though the tappable .hpeg column is already 210px tall.
- games/hanoi.js:346: wrap the bare ' disks' text node in a span matching .gsl (sage rgba(122,179,86,.95), 0.72rem, DM Mono), or fold the word into the option labels ('5 disks') and delete the text node - it is currently unstyled white system font.
- The panel wrapper around .hpegs: add min-height and align the tower to the vertical centre - there is roughly 150px of dead black above the tower and 120px below it in the play frame.

**Emoji as art:** A stopwatch beside the timer, a leaf and a star on the win screen, and undo/reset arrow glyphs on the buttons. The disks, pegs and plank are all CSS gradients, so there is no drawn art in the game at all.

**Readability:** The 'disks' label is unstyled white system font sitting next to sage monospace pills - it looks like a bug rather than a label. The empty rods at about 7x20 CSS px are far too small to read as drop targets even though the tappable column behind them is 210px tall. Moves, the timer, Undo and New are all legible and comfortably over 48px.

**Music chip:** The 'Music' pill sits in the header exactly where the title belongs: 'Tower of Hanoi' is in the capture's playText but does not render in the frame at all. Root cause is fleet-wide - music-player.js:307 sets the button label to 'Music' and an inline min-width:96px on #shell-music-btn, and min-width beats the width:40px !important narrow-phone rule at play/shell.css:211, starving .shell-title{flex:1} to zero width. Hanoi's wallet has no pending badge, so here Sign in still fits; on Daily Bloom and Farkle it is clipped.

**Looks broken** (confirmed on a second look, severity minor)**:** play-hanoi-2play.png, zoomed on the stack: the peg rod is painted over the third and fourth disks and terminates mid-tower, hidden behind the top two - a z-order fault, not a design choice. Separately the game title is missing from the header behind the music pill, and the 'disks' label renders outside its control in unstyled white.

### Backgammon
`play-backgammon` · native · board · first committed unknown · impact 4/5 · effort M
`games/_inline/backgammon.js`

**Now:** A full-width CSS backgammon board fills the top two thirds: dark walnut ground, alternating maroon-brown and olive-green clip-path triangles, a bevelled tan frame, and small radial-gradient checkers each stamped with a shamrock or a four-point star glyph. A gold-glow ROLL pill with a die emoji sits on the centre bar. Below the board: pip counts in sage and rose, then a painted wooden NEW GAME plaque sitting next to a large, mostly empty rounded box with the single word Sapling floating in it.

**Wrong with it:**
- The difficulty select (#BGd, class .gsl) is stretched to roughly 137x125 CSS px, so the word Sapling floats alone and left-aligned inside a big empty dark rectangle beside the NEW GAME plaque. Cause: .gcr (shared.css:2200) is a flex row with no align-items, so the 48px select stretches to the height of the painted image button next to it. It reads as an unfinished panel.
- The ROLL pill sits directly on the point-number row and covers 17 and 18 above the bar and 8 and 7 below it, so four of the twenty-four point numbers are unreadable the whole time it is your roll.
- Two visual languages in one frame: a fully painted, vine-carved wooden NEW GAME plaque next to a board made of flat clip-path triangles with no grain, no rim light, and a hard 4px border meeting the near-black page.
- The two point colours, .tri.dark #5C4033 and .tri.light #3B5323, sit at nearly the same luminance, so at 375px the triangle field mushes into one brown-olive texture instead of reading as alternating points.

**Background now:** No image anywhere. .bg-board (shared.css:2532) is background:#2C1810 with a 4px #6B4F2D border; the points are clip-path triangles filled #5C4033 and #3B5323. The page ground is shell.css's shared radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%). Only one painted asset is on screen: assets/games/new-game-btn.png.

**Background wanted:** assets/games/backgammon/board-1024x838.png laid onto .bg-board: a painted walnut playing field with visible grain, inlaid points and a brass-capped centre bar. Behind it the shared page gradient should gain a soft vignette so the board's frame is a transition and not a cut into flat black.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `board-1024x838.png` | 1024x838 (11:9), full-bleed opaque. Painted walnut playing field: visible grain running vertically, 24 inlaid points alternating warm cream-sage and deep rose-brown, a brass-capped centre bar, warm rim light from the upper left, subtle inner shadow under the frame lip. | Replaces .bg-board's #2C1810 fill plus the 24 clip-path triangles (shared.css:2532, 2556-2560). Gives the board depth and, critically, separates the two point colours that currently sit at the same luminance. |
| `checker-sage-96.png` | 96x96 transparent PNG. A carved wooden disc in sage-green stain, one pressed shamrock in the face, top-left specular rim light, soft contact shadow baked into the lower edge. | Replaces .checker.human's radial-gradient plus the U+2618 text glyph in ::after (shared.css:2568, 2570). Right now the player's whole piece is a CSS circle with a font character on it. |
| `checker-rose-96.png` | 96x96 transparent PNG. The same carved disc in a dusty rose stain with a pressed four-point star, matched lighting to checker-sage-96 so the pair reads as one carved set. | Replaces .checker.ai's radial-gradient plus the U+2726 glyph (shared.css:2569, 2571). |
| `bg-frame-corner-128.png` | 128x128 transparent PNG, vine-and-leaf corner ornament carved in the same wood and at the same relief as new-game-btn.png. One per board corner, mirrored. | Ties the board to the one painted asset already on screen. Today the plaque button and the board look like they came from two different games. |
| `die-faces-384x64.png` | 384x64 sprite strip, six 64x64 cells, faces 1 through 6. Painted bone dice with warm amber pips, a soft top highlight and a cast shadow. | Replaces .bg-die's linear-gradient(145deg,#FAF5E8,#E8DCC8) box (shared.css:2585) and the die emoji sitting on the ROLL button. |

**CSS to do:**
- .gcr (shared.css:2200) — add align-items:center. Its default stretch is what inflates the .gsl difficulty select to the height of the painted NEW GAME image button and produces the big empty Sapling box.
- .bg-bo-lbl (shared.css:2581) — font-size:clamp(0.5rem,1.5vw,0.7rem) resolves to 8px at 375px. Raise the floor to 0.7rem so YOU: 0/15 and AI: 0/15 are readable.
- .bg-info (shared.css:2588) — font-size:clamp(0.45rem,1.4vw,0.6rem) resolves to 7.2px at 375px. Raise the whole clamp to 0.7rem minimum.
- .point .tri.light (shared.css:2560) — #3B5323 is nearly the same luminance as .tri.dark #5C4033; lift it toward house sage (#4A7C35 to #5C8F42) or darken .tri.dark so the points alternate visibly at phone size.
- .bg-dice (shared.css:2583) — currently top:50%; shift to top:44% (or move the point-number row) so the ROLL pill stops covering points 17, 18, 8 and 7.
- .checker (shared.css:2567) — width/height clamp(14px,3.6vw,22px) resolves to 14px at 375px, and tapping a checker is the primary game verb. Wrap each checker in a 48px hit area, or raise the clamp floor to 24px and reduce the stack overlap.
- .bg-board (shared.css:2532) — add box-shadow:0 0 60px rgba(0,0,0,.7) outside the existing inset so the tan frame does not meet the near-black page on a hard 4px line.

**Emoji as art:** U+2618 (shamrock) on every player checker and U+2726 (star) on every AI checker via .checker::after (shared.css:2570-2571) — the entire piece art is a CSS circle plus a font glyph. Also the die emoji on the ROLL button, and the arrow/bulb glyphs on the tool buttons. The header strip uses a shamrock and a sparkle glyph for the You/AI score labels (backgammon.js:42).

**Readability:** Two text faults: .bg-bo-lbl resolves to 8px and .bg-info to 7.2px at 375px, both under the 0.7rem floor. Point numbers 17, 18, 8 and 7 are covered by the ROLL pill. One touch fault: .checker is a 14px tap target at 375px and tapping a checker is how you move. The ROLL button (56px), .bg-tools .gb (48px) and the .gsl select (48px min-height) are all fine.

**A "looks broken" claim here was refuted on a second look.** Opened all three shots at 1x and hi-res. In play-backgammon-2play.png (and the identical -3later.png) the board renders completely and well: 24 alternating points, bevelled tan frame, all 30 checkers in the correct opening layout, point numbers 1-24, YOU PIPS 167 / AI PIPS 167, YOU 0/15, AI 0/15, and the painted NEW GAME plaque. No missing-image box, nothing clipped off screen, no 404s. Half the c

### Word Trellis
`play-trellis` · native · word · first committed 2026-04-12 · impact 4/5 · effort M
`games/trellis.js`

**Now:** A 15x15 Scrabble board fills the top half: a flat brown CSS-gradient wood frame around a grid of tiny dark-olive squares splashed with saturated crimson (TW), orange (DW) and two blues (TL/DL), three cream committed tiles (Y-A-Y) near the top. Below it a brown rack tray holds bevelled ivory letter tiles with point numbers, two flagged with green swap checks, then CONFIRM SWAP / CANCEL, New Game, and a big sage Add to Home Screen slab on bare near-black. Boot is the game's own gold-bordered rules card floating over the shell's dimmed HOW TO PLAY page.

**Wrong with it:**
- The premium squares are licensed-Scrabble red #c75050 / orange #e89846 / blue #3a8bd8 / #5aa0e0. Four saturated hues, two of them the only blue anywhere in the studio, sitting inside a midnight-greenhouse shell that is otherwise sage, gold and cream. The board reads as a different product pasted into the page.
- The 7-tile rack wraps to 6 + 1 at 375px. #TRrack is flex-wrap:wrap with 48px tiles and 5px gaps (366px needed, 340px available), so the seventh tile (E) hangs alone on a second row under the B. A Scrabble rack is one row of seven; this looks like a bug, not a design.
- Two instruction walls stack at boot. The shell's own .shell-dir HOW TO PLAY page is visible blurred behind the game's TRrulesOV card, and the card's CLOSE button sits below the fold inside an 86vh scroller, so the first screen is a wall of 0.72rem mono text with no visible way out.

**Background now:** Nothing of its own. The shared play/shell.css radial-gradient (#1a2a20 at 70% -10% into --shell-bg) is the entire background; the game paints only its board frame gradient (#3b2a14 -> #5a3f22 -> #3b2a14) and rack tray gradient.

**Background wanted:** A full-bleed night-garden trellis: slatted wood against a dark stone wall, ivy creeping the left and top edges, one warm lantern glow top-left falling off to near-black behind the centre so the 15x15 grid stays readable on top of it. This is a table game in a greenhouse; give it the table and the room.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-trellis-540x960.jpg` | 540x960 full-bleed, painterly. Slatted wooden trellis on a dark stone wall, ivy at left and top edges, warm lantern glow top-left, centre band pushed to near-black (under 12% luminance) so board tiles stay legible. | Replaces the bare shared radial gradient. Gives the board a room to sit in instead of floating on black. |
| `trellis-board-frame-880x880.png` | 880x880 transparent PNG, 9-slice safe. Carved wooden frame ~44px thick with real grain, brass corner pegs, warm rim light on the top-left edge, soft contact shadow baked into the outer 20px. Inner opening 792x792. | Replaces the flat #3b2a14 linear-gradient + 2px hard border on #TRboard, which is the single most plastic-looking element on screen. |
| `trellis-premium-192x48.png` | 192x48 sprite sheet, four 48x48 painted square emblems: gold laurel (TW), amber leaf (DW), sage sprout (TL), pale sprout (DL). Painted onto their own tinted tile grounds in house tones, no lettering. | Replaces the red/orange/two-blue flat fills AND the 7px TW/DL text labels in one move. Fixes the palette clash and the unreadable microtype together. |
| `trellis-tile-ivory-96x116.png` | 96x116 transparent PNG. Bone-ivory tile with a soft bevel, faint bone grain, warm rim light top edge, seated shadow bottom. Blank face; letter and value drawn over it. | Replaces .tr-rack-tile's gradient + triple box-shadow stack. The rack tiles are already the best-looking thing here; real art makes them the hero. |

**CSS to do:**
- #TRrack: flex-wrap:nowrap, and .tr-rack-tile width:clamp(40px,12.2vw,48px) so all seven tiles hold one row at 375px instead of breaking to 6 + 1.
- .tr-cell.prem-tw / .prem-dw / .prem-tl / .prem-dl: retire #c75050, #e89846, #3a8bd8, #5aa0e0 for house tones (deep rose #a85c62, warm gold #c8a84b, sage #7ab356, pale sage #9dc27a) so the board stops reading as a licensed Scrabble set.
- .tr-prem-label and .tr-val are hard-coded font-size:7px. Raise to 9px minimum with letter-spacing:0, or delete the text entirely once trellis-premium-192x48.png lands.
- #TRboard: add an outer vignette ring (box-shadow: 0 0 0 6px rgba(0,0,0,.5), 0 18px 40px rgba(0,0,0,.7)) so the frame transitions into the page instead of ending on a hard 2px #2a1d0e edge.
- .tr-score-bar: position:sticky; top:0; z-index:5. YOU / BAG / CPU scrolls off the top the moment the player reaches the rack, and in the play shot it is already gone.
- TRrulesOV should not open on top of the shell's .shell-dir directions page. Suppress one of the two so the player dismisses a single instruction wall, and pin the CLOSE button to the card bottom (position:sticky; bottom:0) so it is never below the 86vh scroll.
- #shell-install-btn (Add to Home Screen) is 15px bold sage and the widest control on the play screen, outranking CONFIRM SWAP. Demote it to a muted text link in the footer.

**Emoji as art:** Light. The centre-square star is a text glyph, and the swap flag is a green CSS circle with a check. Buttons carry the usual check/cross/refresh glyphs. The letter tiles themselves are CSS, not emoji, so emoji are decoration here rather than standing in for art.

**Readability:** .tr-prem-label and .tr-val are hard-coded 7px, well under the 0.7rem (11.2px) floor: every TW/DW/TL/DL label and every tile point value is illegible at arm's length. Board cells are ~21.6px square at 375px (width clamp resolves to 352px, minus padding and 14 gaps, over 15), under half the 48px touch minimum, and the player has to drag a tile onto one. Rack tiles (48x58) and buttons (min-height 48px) are fine.

### Seed Toss
`play-seedtoss2` · native · creative · first committed 2026-04-12 · impact 4/5 · effort M
`games/seedtoss2.js`

**Now:** A 380x480 canvas inside a thin sage-outlined rounded box: a dusk-to-night sky gradient, four dashed scoring rules labelled +25/+50/+100/+150 SKY, two low rolling hill silhouettes, and a gradient-shaded terracotta pot with a gold seed resting on its rim. Below the canvas, a dead black column with only a New Game pill and an Add to Home Screen pill. It is a composed scene, but every element is a canvas primitive: gradients, sine-wave polygons and dashed lines, no painted art anywhere.

**Wrong with it:**
- The ground is one flat translucent slab (games/seedtoss2.js:569, ctx.fillStyle='rgba(40,35,25,0.4)' filled from GROUND_Y-3) meeting the hill silhouette in a dead-straight horizontal edge across the full canvas width. No grass fringe, no tufts, no transition: two surfaces butt together on a ruler line.
- The middle 60% of the playfield is an empty void. Between the +25 rule and the +150 SKY rule there is nothing but dashed lines and 10 one-pixel 'sparkle' dots (draw() line ~518, fillRect(x,y,1,1)) which disappear entirely once the 380px canvas is scaled to ~340px on a 375px phone. The horizon is empty in the literal sense the Director means.
- The idle hint 'Flick the seed upward' is drawn ON TOP of the pot (line 614, italic 13px serif at rgba(232,220,200,0.5), positioned at seed.y+30). Grey half-opacity text over brown clay: it reads as a label glued to the pot rim, not an instruction.
- The ladder header strip '▲ higher = more pts · keep climbing · cap +1000' is bold 9px monospace (line 562) on a canvas that scales to ~0.89, so it renders at about 8 real pixels.

**Background now:** Canvas-painted each frame: a 3-stop vertical linear gradient #0a1016 -> #10160f -> #1a1810, plus 10 single-pixel stars. The page behind it is shell.css's shared radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, #0d1410 60%) that all 66 natives share. No image files at all: assets/games/seedtoss2/ does not exist.

**Background wanted:** A painted dusk meadow at the canvas's own 380x480, with a warm low horizon glow behind the ridgelines so the empty middle band has something in it, and a deeper teal-black zenith so the scoring ladder still reads against it. The source already anticipates this: line 11 says 'When art lands, swap colors for img refs.'

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-seedtoss-dusk-380x480.jpg` | 380x480 full-bleed, painted dusk meadow: warm gold horizon band low behind two ridgelines, deep teal-black at the top, two or three soft cloud banks in the middle third | Replaces the 3-stop linear gradient in draw() and fills the empty middle band where only dashed rules live now |
| `pot-terracotta-120x140.png` | 120x140 transparent, painted tapered flowerpot, warm rim light from upper-left, dark inner mouth, soft contact shadow baked out | Replaces drawPotSkinned's gradient-and-arc construction; the six POT_SIZES tiers become recolours of one painted pot instead of six palette swaps |
| `ground-fringe-380x80.png` | 380x80 transparent, grass and soil fringe with irregular tufts breaking the top edge, darkening to opaque at the bottom | Kills the ruler-straight hard edge where the rgba(40,35,25,0.4) ground rect meets the hill silhouette |
| `seed-32x32.png` | 32x32 transparent, painted seed with a warm specular highlight and a faint sprout tip | The projectile is currently a gradient circle with a white dot (drawSeed, lines 492-507); it is the thing the player watches for the whole game |

**CSS to do:**
- games/seedtoss2.js line 562, the ladder header ctx.font='bold 9px monospace': raise to 12px, or move the header out of the canvas into a DOM strip above it so it stops shrinking with the canvas scale.
- games/seedtoss2.js line 614, the idle hint fillText: move from seed.y+30 to seed.y+52 and draw a dark rounded pill behind it, so it stops sitting on the pot rim.
- The canvas inline style at line 95 (#STc) sets max-width:100% on a 380px bitmap inside a 420px panel: set width:100% and scale the drawing buffer to devicePixelRatio instead, so the 9-10px canvas text is not downscaled below the legibility floor.
- #STmsg (line 95) is min-height:20px and empty in the play frame, leaving a dead gap between the canvas and the New Game button: collapse it when empty.

**Emoji as art:** Only in chrome and copy: the round-end message uses seedling and sunflower glyphs (line 288) and New Game carries the refresh arrow. The playfield itself is fully canvas-drawn, no emoji standing in for art.

**Readability:** The ladder header is bold 9px monospace on a canvas scaled to ~0.89 = about 8 rendered px, well under the 0.7rem (11.2px) floor; the +25/+50 zone labels at bold 10px land near 9px. The idle hint is drawn at 50% opacity over the pot. New Game and Add to Home Screen are both comfortably over 48px.

### Bleeding Hearts
`play-bleedinghearts` · native · card · first committed 2026-04-12 · impact 4/5 · effort M
`games/bleedinghearts.js`

**Now:** A wine-dark table (deep maroon to near-black diagonal) with two gold-hairline panels: a 'PASS 3 CARDS / LEFT to West' plate with three dashed empty slots, and a YOUR HAND tray of thirteen small cream cards in Georgia serif with emoji pips. Two tall ornamented card-back stacks flank the top as the West and East hands. It is coherent and moody and the gold-on-wine reads as a card parlour, but there is not one painted asset in the frame - every surface is a CSS gradient.

**Wrong with it:**
- The centre trick area is an empty dark rectangle. It is background:rgba(26,31,23,0.3) with min-height:160px and nothing in it before the first trick, so the top half of the play frame is a void flanked by two card stacks - the horizon of the table is literally empty.
- The card faces fight themselves: a cream Georgia-serif rectangle (a 1950s bridge deck) with a full-colour Twemoji mushroom or bluebird as the pip. Thirteen cards wrap 6 + 6 + 1, leaving one lone card centred under the tray, the same accidental wrap Cribbage has.
- Sub-floor type all over the seat furniture: seat labels at 0.6rem, the card counts at 0.52rem, the last-trick seat name at 0.55rem, the 'Hearts unbroken' pill at 0.62rem - all under the 0.7rem floor. And the disabled 'Tap 3 more' pass button is opacity:0.5 dim green on dark, so the one thing the player is being asked to do is the faintest element on screen.

**Background now:** Pure CSS, no image: radial-gradient(ellipse at 50% 0%, 4% white) + radial-gradient(circle at 50% 100%, 30% black) over linear-gradient(135deg,#3a1020,#2a0a18,#1a0510) (games/bleedinghearts.js:96-98). assetFiles = 0. The only art reference is assets/decks/floral/suit-heart.png used at 18px on the deck-style toggle button.

**Background wanted:** bg-hearts-540x960.jpg - a wine-dark parlour: worn burgundy baize, a brass lamp pool falling top-centre, the edge of a dark wood table and a spilled hand of cards at the lower corner, dropping to near-black at the bottom edge. Keeps the existing colour story and gives the two gold panels something to sit on instead of a bare gradient.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `trick-well-300x200.png` | 300x200 PNG-32 with alpha, a painted oval felt inlay ringed with a thin brass bead, dark centre, soft inner shadow, transparent outside the oval. | Fills the empty rgba(26,31,23,0.3) rectangle that is the centre of the table and the biggest dead area in the frame. |
| `bg-hearts-540x960.jpg` | 540x960 full-bleed wine parlour with a lamp pool top-centre, falling to near-black at the bottom. | Replaces the flat CSS gradient and removes the hard rounded edge where the maroon panel meets the shell's green radial. |
| `queen-spades-96x134.png` | 96x134 PNG-32 transparent, a painted Q-of-spades face in the floral deck's line-art style, with a faint red bleed at the edges. | The Queen of Spades is this game's signature card and currently gets only a dark-red CSS border and a box-shadow aura. One painted card would give the whole game a hero image. |
| `suit-{spade,heart,diamond,club}-64.png` | 64x64 PNG-32 transparent, downsampled from assets/decks/floral/suit-*.png (currently 993KB-1.6MB each). | Same shared fix as Cribbage: the painted pips are unusable at 1-2MB apiece, so emoji win by default on every card in hand. |

**CSS to do:**
- games/bleedinghearts.js:461 (trick container) - replace background:rgba(26,31,23,0.3) with the trick-well PNG plus box-shadow:inset 0 0 44px rgba(0,0,0,.65) so the centre of the table is a lit well, not a grey box.
- games/bleedinghearts.js:448 / 455 / 571 - seat labels and counts at 0.6rem / 0.52rem / 0.55rem are below the 0.7rem floor; raise every one to 0.7rem and shorten 'NORTH x13' to 'N 13' so the row still fits at 375px.
- games/bleedinghearts.js:518 (pass button, disabled state) - opacity:0.5 makes it near invisible on the wine ground; instead keep full opacity and use border:1.5px dashed rgba(255,220,112,.5);color:rgba(245,235,208,.7).
- games/bleedinghearts.js:98 (table gradient) - add a top fade, linear-gradient(180deg,transparent 0,#3a1020 64px) layered above it, so the wine panel dissolves into the shell's green radial instead of butting against it.
- YOUR HAND tray - thirteen 42px cards wrap 6+6+1. Set the tray to display:grid;grid-template-columns:repeat(7,1fr);gap:3px and let the cards go width:100%;aspect-ratio:5/7 for an even 7+6.

**Emoji as art:** The suit pips ARE emoji: 🍄 🌸 🐝 🐦, twice per card (small corner pip at 0.58rem plus a 1.4rem centre pip) across all thirteen cards. Plus 🕐 on the Last trick button, ✦ as the trick-winner mark, ♥ in the Hearts broken/unbroken pill, ♠♣♦♥ and ⛔ elsewhere in source. 37 emoji, 15 distinct.

**Readability:** Four separate labels sit under the 0.7rem floor (0.52 / 0.55 / 0.6 / 0.62rem). The disabled pass button at opacity 0.5 is the faintest thing on screen and it is the call to action. Touch targets are fine - buttons are min-height:44-48px, though 44px on the New Game and deck-toggle buttons is under the project's 48px rule.

### Cribbage
`play-cribbage` · native · card · first committed 2026-04-12 · impact 4/5 · effort M
`games/cribbage.js`

**Now:** A bright green felt table panel inside a thin gold frame, with a painted wooden peg board strip across the top and two dark drilled tracks. Six computer cards show a genuinely nice painted green damask card back with a mushroom motif; your six face-up cards are plain cream rectangles with one big Twemoji pip each (🍄 🐝 🐦). Coherent and deliberate, but the felt is casino green rather than house sage-black, and the whole panel sits on flat shell black with a hard rounded edge.

**Wrong with it:**
- The 'Computer' peg-track label is CLIPPED and then overlapped by its own peg: it reads 'Comp' with the rose peg sitting on top of the rest. Cause is in games/cribbage.js:699 - the label div is width:34px, flex:0 0 auto, 0.7rem with letter-spacing:0.18em, which needs ~90px, and the peg at score 0 renders at left:0% translateX(-50%) so it lands on the overflow.
- Both six-card hands wrap 5 + 1: five cards in a row and a lone sixth centred underneath, in the computer hand AND your hand. It reads as a layout accident, not a fan.
- The card faces and the card backs are from two different worlds. The backs are painted damask; the faces are a cream rectangle with a serif rank, a big Twemoji sticker and the rank repeated upside-down in the corner - no suit pip beside the rank, and J/Q/K get no court art at all even though assets/decks/floral already holds painted jack/queen/king PNGs.

**Background now:** Pure CSS, no image: two radial-gradients (a 6% white ellipse at 50% 0%, a 22% black circle at 30% 100%) over linear-gradient(135deg,#0f5c35,#0b4d2c,#083d22) - a casino-table green. Outside that panel, the shared native shell radial gradient. assetFiles = 0 for this game; the only external art is the shared floral pip PNGs, which did not appear in the captured frame.

**Background wanted:** bg-cribbage-540x960.jpg - a deep sage-black baize with a warm lamp pool top-centre, a worn wooden table edge at the bottom and a corner of a knitted throw, so the gold-framed panel has a surround. Recolour the felt itself off casino green: #123a24 to #0c2a19, letting the gold frame and the brass pegs carry the warmth.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `cribbage-board-680x180.png` | 680x180 PNG-32 with alpha, painted walnut peg board, two drilled hole tracks with real bored shadows, a brass end-rail, worn edges. | Replaces the pure-CSS repeating-linear-gradient wood strip and the 3x6px CSS hole dots - the one hero object on the screen currently costs nothing and looks it. |
| `bg-cribbage-540x960.jpg` | 540x960 full-bleed, dark baize + table edge + warm lamp pool, falling to near-black at the bottom so the shell footer blends. | Kills the hard edge where the green panel stops and 200px of flat black begins under it. |
| `suit-spade-64.png, suit-heart-64.png, suit-diamond-64.png, suit-club-64.png` | 64x64 PNG-32 transparent, downsampled from the existing assets/decks/floral/suit-*.png. | The existing floral pips are 993KB to 1.6MB EACH and are used at 18px; 25MB of deck art is unshippable on a phone, so nobody sees it and the emoji fallback wins. 64px derivatives make the painted deck actually usable. |
| `court-{jack,queen,king}-{red,black}-128x180.png` | 128x180 PNG-32 transparent, downsampled from the existing assets/decks/floral/{jack,queen,king}-{red,black}.png (currently 2.2-3.0MB each). | Gives J/Q/K real faces instead of a bare serif letter next to a mushroom emoji. |

**CSS to do:**
- games/cribbage.js:699 (_pegBar label) - change width:34px to width:auto;min-width:78px;padding-right:6px, or shorten the label to 'CPU'. As written 'Computer' overflows and the peg is drawn on top of it.
- games/cribbage.js:714 (front peg) - it renders at left:pct% with translateX(-50%), so at score 0 half the peg hangs outside the track and onto the label. Inset the scale: left:calc(7px + (100% - 14px) * pct/100).
- games/cribbage.js hand rows - the 6-card rows wrap 5+1. Set the hand container to display:grid;grid-template-columns:repeat(6,1fr);gap:4px and drop the fixed width:48px on the card div (line 669) to width:100%;aspect-ratio:5/7 so all six fit at 375px.
- games/cribbage.js:39 - swap linear-gradient(135deg,#0f5c35,#0b4d2c,#083d22) for #123a24 / #0e3220 / #0a2417; the current pool-hall green is the only off-palette surface in the batch.
- games/cribbage.js:39 panel - add a bottom fade (linear-gradient to transparent over the last 40px) plus box-shadow:0 20px 50px -24px #000 so the felt panel meets the shell black through a transition instead of a hard rounded cut.

**Emoji as art:** The suit pips ARE emoji: 🍄 (spades), 🌸 (hearts), 🐝 (diamonds), 🐦 (clubs) at 1.2rem, one per card face, on every card in hand. Plus ⛔ and ✓ in status strings and ↻ on New Game. The painted floral pip set exists but did not render in the captured frame.

**Readability:** 'Computer' is clipped to 'Comp' by its own peg. The italic '2 more for the crib' is low-opacity cream on green and reads thin. Buttons are min-height:48px and pass. Card ranks at 0.75rem Georgia are fine; the mirrored bottom-right rank at the same size is visual clutter more than a legibility problem.

**Looks broken** (confirmed on a second look, severity ugly)**:** Clipped/overlapping UI, visible at 1x and confirmed at 2x: the peg-track row renders 'Comp' with the rose peg drawn on top of the remaining characters, because the label box is width:34px (games/cribbage.js:699) while the string needs ~90px at 0.7rem with 0.18em letter-spacing, and the score-0 peg sits at left:0% with translateX(-50%).

### Three Sisters
`play-set` · native · pattern · first committed unknown · impact 4/5 · effort M
`games/_inline/set.js`

**Now:** Twelve dark-green cards carrying gold, steel-blue and rose line-art SVG shapes (clovers, droplets, plant pots) with three shading modes, laid on a FLAT LIGHT-GREY slab (#b6bcb2, set.js:200) that floats on the shell's near-black radial gradient. Above it two pill mode buttons (CLASSIC / DAILY TRIO #246) and a Trios/Deck line in gold and sage; below, NEW GAME and +3 CARDS. capture reached 'stuck-on:CLASSIC' but the -2play frame IS the live board, not a menu.

**Wrong with it:**
- The card table is a flat light-grey rectangle (#b6bcb2, games/_inline/set.js:200) with a hard rounded edge straight onto near-black. It is the brightest surface anywhere on the screen in a midnight-greenhouse game, and nothing transitions between it and the ground.
- The header is clipped on two axes: the whole top row (feedback button, the 116px '♫ Music' pill, the sunbeam counter) is sliced in half by the top of the viewport, and the gold 'Sign in' button runs off the right edge at 375px — which is exactly what the <=430px media query in play/shell.css:208-217 was written to prevent.
- The colour-blind tags '● G / ■ B / ▲ R' are stamped on all twelve cards at 0.55rem (8.8px, shared.css:115), under the 0.7rem floor, and repeating them twelve times adds a field of tiny grey type on top of art that already carries colour and shape.
- Cards are bare rectangles: no card stock, no back texture, no frame, no shadow onto the table — a one-shape card and a three-shape card differ only by how much emptiness is left over.

**Background now:** play/shell.css:32 radial-gradient(1200px 600px at 70% -10%, #1a2a20, #0d100c 60%) for the page, plus a flat #b6bcb2 slab behind the grid and flat #232d1f card faces.

**Background wanted:** A painted table: dark oiled-wood bench top with a worn linen runner under the grid, warm gold rim light from the top-right, vignetting to near-black at the frame edges. It replaces the grey slab AND gives the bare radial gradient something to be.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-set-table-540x960.jpg` | 540x960 full-bleed, no transparency. Midnight greenhouse table: dark oiled wood, a worn cream-green linen runner across the middle third where the grid sits, warm gold rim light from top-right, heavy vignette to #0d100c at all four edges. | Replaces the flat #b6bcb2 slab and the empty radial gradient; gives the cards a surface to sit on instead of a grey rectangle cut out of black. |
| `card-face-set-256x358.png` | 256x358 (2.5:3.5), transparent corners. Aged cream-green card stock, subtle paper grain, a 4px sage inner rule inset 8px, soft warm drop shadow baked into the lower edge. | Replaces the flat #232d1f .grove-card fill so twelve cards read as objects on a table rather than CSS rectangles. |
| `card-glow-selected-256x358.png` | 256x358, transparent, additive. A warm gold bloom hugging the card border, brightest at the corners, falling off to nothing 20px in. | Replaces the plain gold border + box-shadow on .grove-card.selected so a picked card lifts instead of just changing outline colour. |

**CSS to do:**
- games/_inline/set.js:200 — gridWrap 'background:#b6bcb2' becomes the painted table image (fallback rgba(30,38,26,0.85)); keep the inset shadow. The single loudest fix on this screen.
- shared.css:115 .cb-marker — font-size 0.55rem → 0.7rem, and show it once as a legend above the grid instead of twelve times on the cards.
- play/shell.css:208 @media (max-width:430px) .shell-hdr — the row still overflows: add flex-wrap or collapse the music control to its glyph so #shell-signin stops clipping at the right edge on a 375px phone.
- The '♫ Music' pill needs its placement clamped to the visual viewport — only the bottom ~17px of its 48px box is on screen, which also breaks the 48px touch target.

**Readability:** cb-marker at 0.55rem (8.8px) is under the 0.7rem floor and appears 12 times. The blue shape stroke (#5b8fb9 at 1.2px) on #232d1f card fill is the weakest contrast on the board. 'Sign in' is cut off at the right viewport edge.

**Music chip:** Yes — a 116px wide '♫ Music' pill sits in the header row between the feedback button and the sunbeam counter, and is cut off by the top edge of the viewport (measured green border bbox: x 149-265 CSS, bottom edge y=16.5, top above 0). It is not the shell's 46px square #shell-music-btn. It covers whatever header chrome sits at that slot and leaves ~17px of a 48px target on screen.

**Looks broken** (not yet second-checked)**:** In play-set-2play.png the entire header row is sliced by the top of the frame (the feedback and bug buttons show only their bottom halves) and the gold 'Sign in' button is cut by the right edge of the 375px viewport. The '♫ Music' pill is cut off above y=0.

### Garden Rummy
`play-juniper` · native · card · first committed 2026-04-12 · impact 4/5 · effort M
`games/juniper.js`

**Now:** A plum-purple felt panel with the same noise texture and brass frame as Garden Spades. The stock pile is a genuinely beautiful painted card back - green Celtic knotwork with a mushroom, bee and flower worked into the relief - next to a cream discard card carrying a single pink blossom. Below that a wide empty purple field holding only a DEADWOOD 74 pill, a greyed KNOCK slab and a small ↕ Sort button, then the hand: eleven cream cards each showing ONE giant flat clip-art pip (blue bird, orange bee, red-capped mushroom, pink blossom) with a rank in the top-left and the same rank rotated 180 in the bottom-right.

**Wrong with it:**
- Two art languages fight inside one frame. The stock card back is a rendered painted relief with depth and rim light; 200px below it the hand cards carry the LW deck's 1.3-2.1KB flat clip-art pips (assets/games/cards/bird.png etc) blown up to fill a 46x64 card. Same screen, same object type, completely different craft level.
- Every card shows exactly one centred pip regardless of rank. A 9 of mushrooms shows one mushroom, identical in weight to the Ace - so rank has to be read from a 0.8rem corner digit and the card face carries no information at all.
- Roughly 250 real px of flat plum between the discard row and the hand holds three unrelated controls - DEADWOOD pill, KNOCK slab, ↕ Sort - each on its own line, centred, none grouped, none related to each other. Nothing composed, and the largest empty area in the frame.
- The hand wraps 6 + 5 with the second row centred rather than left-aligned, so the two rows do not share an edge - the hand reads as ragged rather than as a fan.
- Table is #2a1f48 -> #15102a plum (games/juniper.js:71) on the shell's #0d100c near-black-green: same hard-edge colour clash as Garden Spades, with black slivers visible outside the brass frame at 375px.

**Background now:** Its own panel: SVG feTurbulence noise over two radial gradients and linear-gradient(135deg,#2a1f48 0%,#1f1838 55%,#15102a 100%), brass border, inset gold hairline, 22px drop shadow (games/juniper.js:62-78). Page behind it is the shared 66-game radial gradient.

**Background wanted:** The same felt construction repainted near-black-green with a sage nap and gold vignette, plus a painted stock/discard tray so the two centre cards sit somewhere rather than floating on flat colour.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/juniper/felt-750x1334.jpg` | 750x1334 felt: #12271c to #0b1a12 ramp, woven sage nap, warm gold vignette top edge, a slightly worn oval under the stock/discard row | replaces the #2a1f48 plum gradient so the table joins the midnight-greenhouse palette |
| `assets/games/cards/shroom@2x.png, flower@2x.png, bee@2x.png, bird@2x.png` | 256x256 transparent each, the four botanical suits repainted: soft painterly shading, warm rim light upper-left, a small contact shadow, silhouettes readable at 24px | the current pips are 1.3-2.1KB flat clip art scaled up to fill a 46x64 card face; they are the loudest thing in the frame and they clash with the painted card back directly above them |
| `assets/games/juniper/table-inlay-360x200.png` | 360x200 transparent, a shallow painted two-well tray: two card-shaped depressions with soft rims and contact shadows, faint gold hairline between them | the stock and discard currently float in flat purple with only 0.68rem text labels underneath; the tray gives them a motivated place |
| `assets/decks/floral/card-front-frame-256x356.png` | 256x356 transparent, cream card face with painted deckle edge and hairline floral border inset 6%, centre transparent | shared with gardenspades and the other seven card games - stops painted pips landing on plain CSS rectangles |

**CSS to do:**
- #JUpan background: swap linear-gradient(135deg,#2a1f48,#1f1838,#15102a) for a near-black-green ramp (#12271c -> #0b1a12), keep the noise and radial layers
- hand card sty (games/juniper.js:529): width:46px is UNDER the 48px rendered-px floor at 375x667 - change to min-width:48px;height:66px
- the same rule: shrink the centre pip to ~55% of card height and add a small rank-count pip row, or at minimum vary pip scale by rank, so a 9 does not render identically to an Ace
- disabled KNOCK button (games/juniper.js:507, background rgba(0,0,0,0.4), color rgba(232,220,200,0.4)): raise text to 0.62 alpha and add a 1px dashed rgba(232,220,200,0.28) border - it is currently near-invisible on plum
- group DEADWOOD, KNOCK and ↕ Sort into one flex row with gap 10px instead of three centred stacked blocks, and pull the hand up - that reclaims ~120px of empty field

**Emoji as art:** ♠ ♥ ♦ ♣ and 🫐 ⛔ ↕ 🎉 ⚔️ 🪶 appear in the chrome and result strings. The suit pips are PNGs, not emoji - but they are 1.3-2.1KB flat icons, which is emoji-grade art doing the job of painted pips, and that is the real substitution here.

**Readability:** Hand cards are a fixed 46x64px (games/juniper.js:529) - width is under the 48px rendered-px floor and the cards overlap-tap in a wrapped two-row hand. The 'STOCK' / 'DISCARD' labels and the ↕ Sort button run 0.68-0.7rem in dimmed cream. The greyed KNOCK label at rgba(232,220,200,0.4) on plum is the least legible element in the frame.

**Music chip:** Not the floating chip, but the injected song-unlock sheet ('CONGRATULATIONS, YOU UNLOCKED A SONG / Cozy Sunday Shuffle / Play it now / Later') covers the bottom third of the boot How To Play wall and clips 'The controls - Tap the deck or the discard pile to…' mid-line.

### Code Breaker
`play-mastermind` · native · board · first committed unknown · impact 3/5 · effort M
`games/_inline/mastermind.js`

**Now:** The capture landed scrolled past the board: one gold-outlined guess row is clipped at the top edge, below it a strip of six hand-drawn SVG seed icons (rose, fern, sunflower, bluebell, mushroom, ember) each in its own coloured ring, then four flat dark pill buttons and one bronze carved NEW GAME plaque. Everything else is the shared near-black radial gradient.

**Wrong with it:**
- Four art languages in one frame: hand-drawn two-tone SVG seeds, flat CSS pill buttons, three emoji (lightbulb, calendar, dice), and one photoreal bronze-and-copper carved plaque. The plaque is the only painted object on screen and it is off-palette - copper against a sage and gold house style - and it is a shared asset borrowed from another game.
- That plaque is also the wrong weight: .gb-new img is width:clamp(120px,35vw,180px) so it renders about 131px wide, sitting alone under a row of 48px pills. The hierarchy reads NEW GAME as the primary action when GUESS is. It is also a 1529x1529 / 3.4MB PNG drawn at 131px.
- The seed strip and the button row are two stacked dark rounded panels of almost identical value on an almost identical ground - three flat rectangles with no transition between them. Nothing in the frame has a surface, a light direction or an edge; there is no horizon at all.

**Background now:** Shared native shell only: play/shell.css:32 radial-gradient at #0d1410. The game's own CSS reports 0 gradients and 0 bgImage; its only colour comes from 13 inline SVG peg icons and 17 hex colours in JS.

**Background wanted:** bg-codebreaker-540x960.jpg - a dark seed-sorting bench: worn wood counter, a bank of shallow apothecary drawers going out of focus at the top, a lantern glow entering upper right, so the guess rows read as trays set on a table. Full-bleed.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/mastermind/new-game-btn-360x360.png` | 360x360 transparent PNG, under 60KB, sage and gold seed packet | Replaces the shared 1529x1529 / 3.4MB bronze plaque that is off-palette and 26x larger than its render size. |
| `assets/games/mastermind/row-tray-1080x220.png` | 1080x220 transparent PNG, 9-sliceable, renders about 360x73 | Each guess row is currently a flat rgba() rounded rectangle. A shallow wooden tray with four seed wells and two peg holes at the right would give the board a surface. |
| `assets/games/mastermind/peg-right-96x96.png and peg-near-96x96.png` | two 96x96 transparent PNGs - a filled sprout peg and a hollow gold ring peg | The feedback pegs are the game's entire information channel and are currently plain CSS circles. |
| `bg-codebreaker-540x960.jpg` | 540x960 full-bleed JPG, dark wooden seed bench, lantern glow upper right | The game has no background of its own at all. |

**CSS to do:**
- .gb-new img (shared.css:2212) is width:clamp(120px,35vw,180px); cap it at 88px inside mastermind so the New Game plaque stops out-weighing the GUESS button.
- The stats strip (played / won / streak / best) renders at roughly 0.7rem muted monospace, at the floor - raise to 0.78rem and lift the colour toward var(--cream).
- The guess board scrolls entirely above the fold: scroll the newest row into view after each guess (scrollIntoView with block:'center') so the player never lands on a frame with no board in it.
- Replace the lightbulb, calendar and dice emoji in the HINT / DAILY / RANDOM button labels with inline SVG in var(--gold) and var(--sage); the calendar emoji renders red and white and is the most saturated thing on the screen.

**Emoji as art:** Lightbulb on HINT, calendar on DAILY, dice on RANDOM, outbox tray on SHARE. The six code pegs are genuine inline SVG in the house palette (games/_inline/mastermind.js:44-49), so the core art is not emoji - only the chrome is.

**Readability:** The stats strip is about 0.7rem muted monospace, at the floor. The four control pills and the six seed rings both measure about 48px, which passes. Nothing is clipped in this frame.

### Kakuro
`play-kakuro` · native · math · first committed 2026-04-12 · impact 3/5 · effort S
`games/kakuro.js`

**Now:** Both action frames landed with the combination-helper modal open, so the board is only visible through its scrim. What shows: a gold-bordered panel titled 'Down · 35 in 6' holding four monospace combination rows in sage-tinted pills and a green CLOSE bar, over a dimmed grid of dark olive and grey squares with gold clue numerals at the top of the frame. Below the panel, three low-contrast pills read HINT (3), AUTO, NEW.

**Wrong with it:**
- The modal scrim is rgba(8,12,6,0.82) with no blur (games/kakuro.js:172), so the grid ghosts through behind and around the panel. The top clue row bleeds directly into the panel's gold border with no separation, and the cream playable cells drop to a muddy mid-grey. It reads as a rendering fault rather than a deliberate overlay.
- The clue cells have no real diagonal. games/kakuro.js:144 draws it as a linear-gradient band at rgba(200,168,75,0.06), which is invisible at phone size, so the across clue in the top-right corner and the down clue in the bottom-left of the same cell sit in an undivided square. In a kakuro that diagonal rule is the whole grammar of the grid.
- The button row under the board is sloppy: 'HINT (3)' wraps onto two lines inside its pill while the other two labels sit on one, and 'AUTO' is grey text on a dark pill with a pencil emoji as its icon. Three pills, three different internal layouts.

**Background now:** Nothing of its own behind the grid. The game ships real CSS theming (5 gradients, 11 hex colours, 3 keyframes) but all of it is panel and cell fill; the page ground is the shared play/shell.css radial over near-black.

**Background wanted:** A dark slate or green-ledger surface with faint ruled lines and a warm lamp pool top-centre, vignetted to near-black. The grid should look like it is printed on something.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-ledger-750x1334.jpg` | 750x1334 full-bleed, dark green-black ledger surface, faint ruled lines at low contrast, warm lamp pool at 50%/20%, vignetted to near-black at the edges | Replaces the shared shell gradient so the grid sits on a surface rather than floating on the default background every native shares. |
| `kakuro-clue-tile-96x96.png` | 96x96 transparent PNG, dark slate tile with a real gold diagonal rule corner to corner at about 35 percent alpha, subtle top bevel, transparent corners for the numerals | Replaces the invisible 0.06-alpha CSS gradient in .KKcell.clue::before so across and down clues stop reading as one ambiguous square. |
| `kakuro-cell-paper-96x96.png` | 96x96 transparent PNG, warm cream vellum with faint fibre texture and a soft inner shadow at the top edge | Replaces the flat rgba(245,240,225,0.9) fill on .KKcell.white so filled cells look like paper rather than a solid swatch. |

**CSS to do:**
- games/kakuro.js:172 .KKcombosModal - background rgba(8,12,6,0.82) with no blur lets the grid ghost through the panel. Raise to about 0.94 and add backdrop-filter:blur(3px).
- games/kakuro.js:178 .KKcombosClose - min-height:42px is under the 48px house touch minimum. Raise to 48px.
- games/kakuro.js:144 .KKcell.clue::before - the diagonal is rgba(200,168,75,0.06) and is invisible on a phone. Make it a genuine 1px corner-to-corner rule at about 0.35 alpha.
- games/kakuro.js:146 .KKclueInfo (0.52rem), :152 .KKpencils (0.56rem) and :151 .KKcell.white.error::after (0.55rem) are all under the 0.7rem minimum. Raise to 0.62-0.72rem and grow the cell to carry them.
- The HINT / AUTO / NEW pill row - widen the pills so 'HINT (3)' does not wrap to two lines while its neighbours sit on one, and lift the disabled AUTO label above its current grey-on-dark contrast.

**Emoji as art:** Eight distinct emoji doing all the icon work: a lightbulb on HINT, a pencil on both PENCIL and AUTO (the same glyph for two different functions), filled and hollow stars for the difficulty rating, an X for clear, an arrow for New. No painted icons anywhere.

**Readability:** Three CSS rules fall under the 0.7rem minimum: the clue-info tap target at 0.52rem, pencil marks at 0.56rem, and the error marker at 0.55rem. The CLOSE button is 42px tall against a 48px minimum. In the captured frames the board itself is dimmed to about 18 percent by the modal scrim, so the cream cells drop to mid-grey and the grid is hard to parse behind the panel.

### Master Pollinator
`play-pollen` · native · board · first committed 2026-04-12 · impact 3/5 · effort M
`games/pollen.js`

**Now:** All three shots land on the pass-and-play SEATS modal (capture reached=max-rounds: the robot tapped BEGIN then New Game, which reopens setup), so what I mostly see is a stack of flat dark-sage rounded panels with pill buttons and a gold BEGIN bar on a near-black scrim. A 30px strip of the real board survives above the modal, and zooming it at 2x shows genuine painted flower art on the cards with glossy 3D marble cost-pips (gold '3', green 'G', dark red 'R') sitting on top of it.

**Wrong with it:**
- The seat-name inputs clip their own text: P2 reads 'Comp' not 'Computer', P3/P4 read 'Play' not 'Player 3'/'Player 4'. Four rows of visibly truncated words is the first thing on screen.
- The four HUMAN/CPU/x rows are identical silhouettes stacked four deep with no rhythm or grouping - the modal reads as a settings form, not the opening of a botanical board game.
- In the board strip, the glossy marble cost-pips are parked squarely over the painted bloom, so the one piece of real art the game owns is the one thing covered up.
- Nothing anywhere transitions: the modal's rounded panel edge meets the flat scrim dead, and the scrim meets the board with a hard horizontal line.

**Background now:** No art. Shell radial gradient (play/shell.css:32 radial-gradient(1200px 600px at 70% -10%, #1a2a20, --shell-bg)) plus a rgba(5,8,4,0.92) blurred scrim for the setup overlay; every panel is rgba(26,31,23,0.5) flat fill.

**Background wanted:** bg-pollen-meadow-540x960.jpg - a night meadow seen low to the ground: deep near-black loam at the bottom, moonlit blooms softening out at the left and right edges, one warm gold rim along the grass tips, heavy vignette so the card row stays the brightest thing. Also wanted behind the SEATS modal at low opacity so the first screen is not a bare form.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-pollen-meadow-540x960.jpg` | 540x960 full-bleed, deep near-black loam ground, moonlit blooms blurred at the edges, warm gold rim light on grass tips, strong vignette | replaces the shared shell radial gradient; gives the painted cards a place to sit instead of floating on the same gradient as 65 other natives |
| `assets/games/masterpollinator/tier{1,2,3}/*.png re-export at 240x320` | 240x320 PNG or WebP, under 40KB each, same paintings, opaque | the shipped art is 1.8-1.9MB PER FILE (blue-tailed-damselfly.png is 1,946,154 bytes) across 90 flowers + 11 pollinators - tens of MB for a phone to pull a 120px-wide card |
| `pollen-tokens-sheet-192x48.png` | 192x48 transparent sprite strip, 4 painted pollen-grain discs at 48x48 (green/rose/amber/spore) plus a gold one, soft painterly, warm rim light | replaces the CSS glossy-marble pips currently rendered over the flower paintings |
| `pollen-tree-64x64.png` | 64x64 transparent, a small painted canopy silhouette with gold rim light | the round/supply counters use the raw emoji tree; it is the only emoji left in the board furniture |

**CSS to do:**
- games/pollen.js:~348 seat-name <input>: font-size 0.7rem -> 1rem and give the name field flex:1.4 - at 0.7rem it both clips 'Computer' to 'Comp' and triggers iOS zoom-on-focus (an input under 16px always does).
- .pn-modal (games/pollen.js:336): add background-image:url(bg-pollen-meadow-540x960.jpg) center/cover with a rgba(5,8,4,0.86) overlay, so the opening screen is a meadow with a form on it rather than a form.
- The per-seat row div (rgba(26,31,23,0.5), games/pollen.js:~344): show 2 seats plus a compact '+ ADD SEAT' and reduce row padding 8px 10px -> 6px 10px, so four rows do not fill the whole viewport with identical slabs.
- Board cost-pips: drop from ~28px circles to 18px and cluster them bottom-left of the card with a rgba(0,0,0,0.45) backing plate, instead of centring them across the painted bloom.
- The board card-row container: add box-shadow:0 0 60px rgba(0,0,0,0.75) so the row's edge fades into the ground rather than ending on a hard line.

**Emoji as art:** Pollinator card icons are emoji fallbacks in games/pollen.js:36-46 (icon:'🦋' Monarch, '🐝' Honey Bee/Bumblebee/Fig Wasp, '🐦' Hummingbird, '🌙' Sphinx Moth, '🪰' Hoverfly, '🐭' Honey Possum, '🦇' Fruit Bat, '🐒' Ruffled Lemur) - painted PNGs exist for all 11 so these are only the fallback layer. 🌳 for the tree/supply counters has NO painted art behind it and is doing real work in the HUD.

**Readability:** Seat-name inputs at 0.7rem clip their contents ('Comp', 'Play') and will zoom-on-focus on iOS. Body copy '1, 4 players. Pass-and-play' is 0.7rem muted #8a9178 on near-black - right at the floor. Touch targets are all min-height:48px, correct.

### 15 Puzzle
`play-slider` · native · puzzle · first committed 2026-04-23 · impact 3/5 · effort S
`games/slider.js`

**Now:** A 4x4 sliding-tile board filling most of the frame: fifteen leaf-green rounded tiles with gold hairline borders and cream Georgia numerals, one tile tinted gold with a small check mark where it has reached its home square, all set in a darker inset board with a vignette. Under it a Moves/timer line, Undo and New buttons, one green pill reading '4x4 (15 Puzzle)', and an Add to Home Screen button. Genuinely on-palette and deliberate, but every surface is a CSS linear-gradient; nothing is painted.

**Wrong with it:**
- The header is broken at 375px. The fixed 97x48 injected Music pill sits on top of the header row, the wallet cluster wraps to two lines ('(+8' above '0 pending)'), and the Sign in CTA is cut mid-word to 'Sign' at the right edge. play/shell.css:208 has a whole @media (max-width:430px) block written specifically to stop this clip, and it fails here because the fixed-position chip is an overlay that block never sees.
- The board-size control is a bare native <select class="gsl"> (games/slider.js:379). It renders as a single green pill reading '4x4 (15 Puzzle)' with no caret and no affordance, so it reads as a static label rather than a control, and the 3x3 and 5x5 options are simply invisible on screen.
- The empty square is just a hole: the board's own linear-gradient shows through with no socket, no lip, no inner shadow, so the top-left corner reads as a rendering gap rather than as the one space the puzzle turns on.
- Fifteen tiles share one silhouette exactly: same gradient, same 1.5px gold border, same radius, same shadow. Only the gold home tile differs, so the board is a uniform field with no visual rhythm.

**Background now:** None of its own. play/shell.css paints html/body with radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, #0d1410 60%), shared with all 66 natives. The board itself has .Dboard's linear-gradient(135deg, rgba(28,36,24,.6) -> rgba(12,16,10,.85)) plus inset shadows. assets/games/slider/ does not exist; zero asset files.

**Background wanted:** A painted greenhouse-bench surface behind the board so the tray sits ON something instead of floating on the fleet-wide radial gradient: worn dark wood or slate with a warm lamp falloff from top-left.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-slider-bench-750x800.jpg` | 750x800 (2x for a 375x400 slot), painted dark potting-bench wood with visible grain, warm rim light from the top-left, corners falling to near-black | Gives .Dboard something to sit on; today the board floats on the same radial gradient as 65 other games |
| `tile-face-160x160.png` | 160x160 transparent, one painted leaf-green ceramic tile face: soft bevel, warm highlight along the top edge, faint glaze mottling, transparent outside the rounded square | Replaces the .Dtile linear-gradient so the tiles read as objects; CSS tints it gold for the .home state instead of swapping a second gradient |
| `tile-socket-160x160.png` | 160x160 transparent, an empty recessed socket: inner shadow, a darker floor, a little moss or grit in two corners | Makes the blank square read as a slot rather than a hole in the render |

**CSS to do:**
- #sws-music-chip (music-unlocks.js freeCorner, line ~191): drop the top-edge grid spots whose footprint intersects .shell-hdr, or return early on any page that has a .shell-hdr at all. It currently lands at left:154px;top:10px, straight across the wallet cluster.
- play/shell.css @media (max-width:430px) .shell-wallet: add white-space:nowrap to the balance and its pending count so '(+8 pending)' stops wrapping under the sun glyph, which is what pushes the row wide enough to clip 'Sign in'.
- select.gsl in games/slider.js:379: add a visible caret (background-image chevron, padding-right:26px) and lift the border to rgba(122,179,86,0.6) so the size picker reads as a control, not a label.
- games/slider.js:35 .Dtile: add a per-index hue jitter via a CSS custom property (--tint set in positionTiles) so fifteen tiles stop sharing one identical silhouette.
- games/slider.js:34 .Dboard: add an inset socket treatment for the empty cell (a positioned div, not just the board background showing through).

**Emoji as art:** Only glyph chrome: the undo and refresh arrows on the buttons, a stopwatch next to the timer, and a check mark on the settled tile (.Dtile.home::after, content \2713). Nothing in the playfield is emoji standing in for art.

**Readability:** .Dinfo and .Db are both 0.72rem (about 11.5px), just over the 0.7rem floor and the smallest type on screen. The disabled Undo at opacity .45 on a near-black ground is very hard to read. The Sign in CTA is clipped to 'Sign' at the right edge. Tiles at ~78px and buttons at min-height:48px are fine for touch.

**Music chip:** Yes. The fixed 97x48 injected pill reading Music sits at top:10px;left:154px, directly over the shell header row, immediately left of the sun balance. With the pill occupying that span the wallet cluster wraps to two lines and the gold Sign in button is cut off mid-word at the right edge of the 375px viewport.

**Looks broken** (confirmed on a second look, severity ugly)**:** In play-slider-2play.png the gold Sign in button at the top right is cut by the viewport edge, reading only 'Sign'; the sun balance beside it has wrapped so '0' sits under the sun glyph and '(+8' / 'pending)' break across two lines; and the fixed Music pill overlaps the header row it was never laid out with. This is shell chrome, so it is one fix for every native, not a slider bug.

### Root Rush
`play-rootrush` · native · puzzle · first committed 2026-04-23 · impact 3/5 · effort S
`games/rootrush.js`

**Now:** A square brown board with a warm 135deg gradient, a faint 6x6 grid, and seven rounded brown blocks with fine vertical/horizontal stripe grain. One block is a bright green gradient with a sprout emoji on it, and a thin gold glow marks the exit slot on the right edge. It is warm and coherent - the best-composed CSS in this batch - but everything is made of gradients and every block is the same colour.

**Wrong with it:**
- All seven wooden blocks share one colour AND one silhouette. WOOD_COLORS (games/rootrush.js:619) is ten browns spanning only #654020 to #9a5836 - at 375px that band is indistinguishable, so the board reads as seven identical brown pills and the player has to re-parse it every move.
- The grain is a repeating-linear-gradient at a flat 6px pitch, so it reads as printed corduroy stripes rather than wood or root - mechanical, not painted.
- The board's rounded rectangle ends dead against the flat page ground: a hard #6b4520 border with nothing outside it, no soil bleeding out, no cast shadow into the surround. The horizon around the board is empty.
- 'Move A up' at the top is unstyled white system text floating loose above the board, in a different typeface from every other label on the screen (which are Georgia cream).

**Background now:** games/rootrush.js:552 - .RRboard is linear-gradient(135deg,#3a2410 0%,#2a1810 55%,#1a0c08 100%) with a 2px #6b4520 border and inset shadows; .RRgrid (line 553) lays two 1px rgba(255,220,160,0.06) gradients at calc(100%/6). Outside the board it is the shared play/shell.css radial gradient. assetFiles:0, bgImage:0.

**Background wanted:** bg-rootrush-soil-600x600.jpg tiling inside the board, plus bg-rootrush-surround-540x960.jpg behind the page - dark loam with visible grit, a few pale pebbles, fine hair-roots threading through, lit warm from the top-left so the board has a light direction, going near-black at the bottom-right corner.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-rootrush-soil-600x600.jpg` | 600x600, dark loam texture, scattered pale pebbles and fine hair-roots, warm top-left light falling to near-black bottom-right, no visible grid | replaces the three-stop CSS gradient inside .RRboard; gives the puzzle a real surface |
| `root-blocks-sheet-512x512.png` | 512x512 transparent sheet: 6 painted root segments (h2, h3, v2, v3 plus two knotted variants) with bark texture, side nubs and a visible cut end, each in a distinct wood tone - one pale birch-root, one grey-barked, one dark peat, one ruddy | replaces the ten near-identical CSS browns so two blocks in one frame stop sharing both colour and silhouette |
| `seed-pod-block-160x80.png` | 160x80 transparent, a warm seed pod with a real painted sprout breaking from its top, sage leaves, gold rim light, soft inner glow | replaces the .RRblock.special green gradient plus the raw 🌱 emoji that is currently the player's entire avatar |
| `exit-gate-48x140.png` | 48x140 transparent, a gold-lit gap torn in the soil wall with warm light spilling through and a few root ends at the edges | replaces the 10px .RRexit radial-gradient sliver, which is easy to miss on a phone |

**CSS to do:**
- games/rootrush.js:619 WOOD_COLORS: the ten values only span #654020-#9a5836. Widen to include a pale birch (#c4a882), a grey bark (#6a6055) and a dark peat (#3d2a1c) so adjacent blocks are actually distinguishable at 375px.
- .RRblock.vert::after / .RRblock.horiz::after (games/rootrush.js:558-559): the single 6px repeating-linear-gradient reads as corduroy. Layer two gradients at 5px and 11px with rgba(0,0,0,0.10) and rgba(255,220,160,0.05) for an irregular grain.
- .RRboard (games/rootrush.js:552): add an outer box-shadow:0 0 70px rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.6) so the board's hard rounded edge sinks into the page ground instead of stopping dead against it.
- .RRb[disabled] (games/rootrush.js:569): opacity .35 -> .55. The 'Next ›' button is gold-on-dark at 35% and is barely legible in the shot.
- The 'Move A up' hint line: give it the .RRinfo treatment (font-family:Georgia,serif; font-size:0.72rem; color:rgba(232,220,200,0.85); letter-spacing:0.04em) - it is currently unstyled white sans and is the only element on screen in that typeface.
- .RRexit (games/rootrush.js:554): width 10px -> 16px and right:-6px -> right:-10px so the goal is visible at a glance rather than a hairline at the board edge.

**Emoji as art:** 🌱 is the entire art of the player's block - rendered at font-size:1.6rem inside .RRblock.special .RRleaf (games/rootrush.js:562). 💡 sits on the Hint button, ↶/↻ on Undo/Reset, ★ in scoring. The sprout is the one emoji doing real gameplay-art work.

**Readability:** Mostly ok. .RRinfo is 0.72rem, .RRb is 0.70rem, .RRlvl is 0.70rem - all at or just above the floor, and buttons are min-height:48px so touch targets pass. The only real failure is .RRb[disabled] at opacity .35, which makes 'Next ›' near-invisible.

### Pyramid
`play-pyramid` · native · card · first committed 2026-04-03 · impact 3/5 · effort M
`games/pyramid.js`

**Now:** A 7-row pyramid of playing cards over a bare dark-green gradient. The uncovered bottom row and the stock pile are the only crisp things: real painted card faces with ornate line-art royals (a red King, a black Ace) and a handsome green mandala card back stamped '24'. Everything above the bottom row is washed to a translucent grey haze, so the top two-thirds of the playfield reads as a smear of overlapping ghost rectangles.

**Wrong with it:**
- The covered cards are dimmed by opacity, not by tone, so 21 of the 28 pyramid cards lose their edges and merge into one grey blur - you cannot tell where one card stops and the next starts.
- There is no table. Pure white card slabs sit directly on the shell's radial gradient with no felt, no shadow pooling, no frame - a hard white-on-black edge with nothing between them.
- The waste slot right of the stock is a bare dashed/dotted rectangle - an unfinished placeholder box sitting in the middle of the playfield.
- The card faces are pure #fff, the loudest value on a midnight-greenhouse screen, clashing with the warm cream everything else in the fleet uses.

**Background now:** Nothing of its own. games/pyramid.js has ownCssKB:0, zero gradients, zero hex colours, zero box-shadows - it inherits play/shell.css:32 radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, --shell-bg 60%) and nothing else.

**Background wanted:** bg-card-table-540x960.jpg - dark green felt with visible weave, a warm pooled lamp light falling from top-centre onto the pyramid apex, felt darkening to near-black at the corners, a hint of worn wood at the very bottom edge behind the button row.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-card-table-540x960.jpg` | 540x960 full-bleed, dark green felt weave, warm pooled lamplight top-centre, near-black vignette corners, wood edge along the bottom 8% | replaces the shared shell gradient; gives the white cards a surface so they stop reading as cut-outs floating in a void |
| `pyramid-frame-540x420.png` | 540x420 transparent, thin vine-and-Celtic-knot corner frame sized to the pyramid area, gold #c8a84b at 40% with a sage inner line, corners only (no full box) | matches the Celtic frame that makes Chess read as strong; the pyramid currently has no compositional container at all |
| `waste-slot-plate-96x132.png` | 96x132 transparent, a soft inset shadow well with a faint embossed suit watermark at 12% opacity | replaces the dashed placeholder rectangle next to the stock pile |

**CSS to do:**
- Covered-card state in the pyramid: replace the opacity wash with filter:brightness(0.5) saturate(0.65) and keep opacity:1 - the card then keeps its white edge and drop shadow, so 28 cards stay 28 readable silhouettes instead of one grey haze.
- The pyramid card element: add box-shadow:0 2px 7px rgba(0,0,0,0.65) and border-radius:6px so each card lifts off the felt and its edge is a lit rim rather than a hard cut.
- Card face fill: swap pure #fff for #f5ebd0 (the fleet cream, already used in games/_cards.js LWCE-again) so the deck sits in the midnight-greenhouse palette instead of glaring against it.
- The empty waste slot: replace the dashed border with box-shadow:inset 0 2px 10px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(200,168,75,0.22) and border:none.
- #PYstyle carries an inline style="font-size:0.7rem" (games/pyramid.js:42) - exactly at the floor while its two siblings are larger, so the three buttons in that row do not share a type scale; lift to 0.75rem.

**Emoji as art:** 🃏 on the Style button, 🏆 in the win message, ↶/↻ on Undo/New Game. All UI chrome only - the cards themselves are real painted art from assets/games/cards/ and assets/decks/floral/ via games/_cards.js. No emoji stands in for gameplay art.

**Readability:** Rank and suit pips on the dimmed covered cards are effectively unreadable at 375px - that is the game's core information. Button row is fine. The '⤓ Add to Home Screen' and studio footer take the bottom 18% of the phone screen, pushing the stock pile up into the pyramid.

### Farkle
`play-farkle` · native · dice · first committed unknown · impact 3/5 · effort M
`games/_inline/farkle.js`

**Now:** A warm brown saloon table: a rounded panel with a 2px wood border, a generated SVG noise fill and deep inner shadow, floating on near-black. Player chips 1-4 across the top, a gold-ruled P1 score bar, amber Roll and Bank buttons, then a large empty dark-brown dice tray carrying six near-invisible pinprick dots and a monospace 'ROLL - THEN TAP DICE TO KEEP' caption.

**Wrong with it:**
- The button row overflows the viewport: the green reset button is sliced in half at the right edge and the 'Style' button never appears on screen at all, though both are in the DOM per the capture text.
- Three typefaces inside one 200px strip - serif italic for 'Tap ROLL to begin', bold serif for 'Roll' and 'Bank', monospace for the tray caption. Nothing shares a voice, and the monospace line is the only mono on the screen.
- The dice tray is the largest element on screen and it is an empty brown box: the six pre-roll placeholder pips render at about 2px and read as dust. The brown saloon palette (#3d1a08 to #1a0c04 with orange highlights) is also off the house midnight-greenhouse sage and gold, and it meets the black page at a hard 2px border with no transition at all.

**Background now:** games/_inline/farkle.js:59-64 - an inline SVG feTurbulence noise data URI tiled at 180x180 over two radial glows and a linear-gradient #3d1a08 to #2a1408 to #1a0c04, inside a 2px #6b4520 border. No image files; assetFiles 0.

**Background wanted:** bg-farkle-porch-540x960.jpg - a night porch table shot from above: worn plank wood, a lantern pool of warm gold light centred where the tray sits, dark falloff to all four edges, so the tray reads as a place rather than a brown rectangle pasted onto black.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `dice-faces-768x128.png` | 768x128 PNG, transparent, six 128x128 dice faces, bone-white painted dice with warm rim light from upper-left and hand-inked pips | Replaces the emoji die in the title and buttons and the CSS-dot dice in the tray; gives the biggest element on screen something painted to hold. |
| `dice-tray-felt-512x512.jpg` | 512x512 seamless tile, dark sage felt with visible nap and a worn lighter centre | Replaces the feTurbulence noise, which at 180px tiling reads as TV static rather than cloth, and pulls the tray back toward the house sage palette. |
| `farkle-icons-192x64.png` | 192x64 PNG, transparent, three 64x64 icons: a coin purse, a curled reroll arrow, a leather dice cup | Replaces the money-bag emoji on Bank, the reset arrow and the die emoji on Style, so the button row stops being emoji. |
| `farkle-streak-ember-96x96.png` | 96x96 PNG, transparent, a painted ember with a soft gold bloom | Replaces the flame emoji used for the hot-streak state, which is the loudest thing on screen when it fires. |

**CSS to do:**
- The Roll/Bank/reset/Style flex row: add flex-wrap:wrap and min-width:0 on the children, or break it to two rows under 400px - at 375px the last two buttons are currently clipped off the right edge.
- The panel cssText (games/_inline/farkle.js:58): change max-width:min(96vw,560px) to min(100vw - 16px,560px), and add an outer box-shadow 0 0 40px rgba(0,0,0,0.8) so the wood border feathers into the page instead of ending at a hard line.
- The tray caption 'ROLL - THEN TAP DICE TO KEEP': drop the monospace family, use the panel's serif at 0.75rem with letter-spacing 0.18em so it matches the rest of the panel.
- The empty-tray placeholder pips: raise from about 2px to 8px and colour them rgba(255,180,90,0.28) so the tray reads as six waiting dice rather than an empty box.
- The 'Tap ROLL to begin' hint: raise from the current muted brown-on-brown to rgba(255,220,180,0.7) - it is the lowest-contrast text on the screen.

**Emoji as art:** A die emoji in the page title, the Roll button and the Style button; a money bag on Bank; a reset arrow; and leaf, flame, trophy, seedling, medal and star emoji in results and streak states (10 distinct emoji, 22 uses). The dice themselves are CSS dots, so emoji plus dots carry the entire art load.

**Readability:** The 'Tap ROLL to begin' hint is serif italic in muted brown on brown - the weakest contrast in the frame. The clipped reset button shows under 20px of visible width, well under 48px. The score bar and player chips are legible.

**Music chip:** Same fleet-wide header fault: the 'Music' pill occupies the title slot and 'Farkle' does not render in the header, and Sign in is clipped to 'Sign'. Separately, in the boot frame the music-unlocks reward card ('CONGRATULATIONS, YOU UNLOCKED A SONG - Saloon Streak') slides up over the bottom half of the how-to wall and covers 'The controls' section entirely - the player cannot read the controls without dismissing it.

**Looks broken** (confirmed on a second look, severity ugly)**:** play-farkle-2play.png: the green reset button is cut vertically at the x=375 viewport edge and the 'Style' button is entirely off screen, although the capture playText lists 'reset, die, Style'. Header Sign in is clipped to 'Sign' and the 'Farkle' title is missing behind the music pill. Boot frame: the song-unlock card covers the how-to's controls list.

### Flood Fill
`play-flood` · native · puzzle · first committed 2026-04-03 · impact 3/5 · effort S
`games/flood.js`

**Now:** The play frame is the Appearance modal, not the board - the robot tapped 🎨 STYLE, so the grid is only visible as a dimmed strip behind the scrim at the top. The modal itself is the good part: a dark green panel with a gold border and gold serif-spaced heading, three fill-style tiles (Leaves shows a real painted autumn-leaf thumbnail), four colour-pack rows with swatch strips, and a full-width sage Done button. The board strip that shows through the rgba(4,10,6,.74) scrim is a plain 17-wide grid of small rounded squares with no frame or mat.

**Wrong with it:**
- The board has no board. The grid of squares butts straight onto the shell gradient with no mat, frame or shadow - same hard edge as Dew Trail. On the Wild size (17 cells across, ~20px each) it reads as a spreadsheet, not a garden.
- The Colourblind swatch row is far louder than the other three: six filled orange/blue chips with white glyphs and hard outlines against three rows of soft flat swatches. One loud row flattens the list - the eye goes there first even though Autumn is the selected row.
- The .ff-mlabel section headers ('FILL STYLE', 'COLOUR PACK (Solid & Gem)') are 0.7rem DM Mono in #8a9178 muted grey on #10160e - technically at the size floor but the weakest thing in the modal by contrast.
- The three FILL STYLE tiles are unequal: 'Leaves' gets a painted leaf image, 'Solid' gets a plain cream circle glyph and 'Gem' gets a small grey ◆. Two of three options are previewed by a character, not by what they actually look like.

**Background now:** Nothing of its own for the page; inherits play/shell.css:32 shared radial gradient. The board cells are painted per-cell: the DEFAULT style (styleIdx 0) is 'leaves', six real 17-21KB PNGs at assets/games/flood/leaf-*.png used as url() center/cover on each cell - so the shipped default IS painted art. The shot caught the Solid fallback because games/flood.js:308 force-switches leaves -> solid when you tap a colour pack row.

**Background wanted:** A near-black greenhouse-terrace plate behind the board (out-of-focus glass panes, one warm gold lamp bloom top-left) plus a board frame around the grid. The cells already have art; what is missing is the surface they sit on.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/flood/board-frame-780x780.png` | 780x780 transparent PNG, 9-slice-safe: warm gold hairline frame with soft inner shadow and four small leaf corner ornaments, centre fully transparent | gives the grid an edge; right now the playfield has no boundary and no transition to the page |
| `assets/games/flood/bg-terrace-750x1334.jpg` | 750x1334 full-bleed, near-black greenhouse interior, out-of-focus glass panes with faint sage muntins, one warm gold lamp bloom top-left, everything below 20% luminance behind the board area | replaces the shared 66-game gradient so the game reads as a place |
| `assets/games/flood/leaf-sage@2x.png (and gold, slate, copper, plum, crimson)` | 256x256 each, the existing six leaves repainted at 2x with a warm rim light and a soft contact shadow, edge-to-edge so center/cover crops cleanly | on the Cozy board (9 cells) each cell is ~110px CSS = 220 device px; the current ~17KB leaves are being upscaled and go soft exactly where the art is most visible |
| `assets/games/flood/style-gem-96x96.png` | 96x96 transparent, one painted faceted gem with a specular hit, and a matching style-solid-96x96.png painted enamel disc | replaces the ⬤ and ◆ glyphs in the two non-Leaves FILL STYLE tiles so all three options preview themselves |

**CSS to do:**
- the grid container (#FFg / the element .ff-gemgrid toggles on): add padding 8px, border-radius 14px, 1px solid rgba(200,168,75,0.22), box-shadow inset 0 0 32px rgba(0,0,0,0.55) - the board currently has no frame
- .ff-pack:not(.sel): opacity 0.72 and swatch <i> filter saturate(0.8) so the Colourblind row's hard orange chips stop out-shouting the selected Autumn row
- .ff-mlabel: color #8a9178 -> rgba(232,220,200,0.62) (keep 0.7rem) - the two section headers are the lowest-contrast text in the modal
- AUTUMN pack in games/flood.js:52 - #4a7c35 and #4a7aaa sit at nearly the same value; push one lighter and one darker so adjacent regions separate on the 17-wide Wild board, where cells are ~20px
- .ff-opt .ic: font-size 1.4rem -> replace with a 34px img slot so the Solid and Gem tiles can carry art instead of a glyph

**Emoji as art:** 🍂 ⬤ ◆ stand in as the three FILL STYLE previews inside the Appearance modal (games/flood.js STYLES array), and ✓ marks the selected pack. The board itself uses no emoji - it uses real leaf PNGs by default.

**Readability:** .ff-mlabel 0.7rem #8a9178 on #10160e is at the floor and low contrast. Touch is good: .ff-sb is min-height/min-width 48px, .ff-opt 52px, .ff-btn 60px, .ff-done 54px. The Autumn palette's value separation is the real legibility risk, not text size.

### Five in a Row
`play-vinecross` · native · board · first committed 2026-04-12 · impact 3/5 · effort M
`games/vinecross.js`

**Now:** A warm brown goban fills the top half of a near-black page - a 13x13 grid with five dark hoshi dots, one glossy jade stone and one glossy rose stone with a gold dashed hint ring around it. Below it a row of UNDO / REDO / HINT pills, a Grove and 13x13 pill pair, New Game, and the Add to Home Screen button. It is the only one of these three with a real composed object on screen, and it is entirely canvas-drawn.

**Wrong with it:**
- The 'wood' is one 3-stop diagonal linear gradient (#4a3620 to #6b4d2a to #4a3620, games/vinecross.js:107-109) plus a radial vignette. No grain, no knots, and the light band runs corner to corner diagonally - no plank on earth is lit that way. At 375px it reads as brown vinyl.
- The board meets the page through one hard edge: a 10px-radius canvas with a flat 3px #3b2a14 ring faked by box-shadow spread (line 93). No bevel, no lip, no shadow catch on the ground. The goban looks pasted onto the void rather than resting on a table.
- Player and AI stones share one silhouette - same circle, same CELL*0.46 radius, same top-left specular (lines 149-168). Only hue separates jade from rose, on a brown board, which is exactly the pairing that fails for a colour-blind player. The hint marker then adds a third white glyph on top of a stone, so three different meanings are carried by one shape.
- The horizon is empty. Above the board is a single 0.7rem mono stats line ('played 0 . won 0% . streak 0 . best 0') on bare background, and left and right of the board are two unmotivated black margins. The frame is one rectangle centred in nothing.

**Background now:** Shared play/shell.css radial gradient behind everything; the canvas paints its own board - createLinearGradient wood ramp + createRadialGradient inner vignette + rgba(28,20,10,.72) grid lines + hoshi dots. Zero image files: assetFiles 0, no drawImage anywhere in games/vinecross.js.

**Background wanted:** Keep the board painted rather than gradient-built, and put a table under it. The board is already the right idea; it needs a real surface and a ground plane so it is not a floating rectangle.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `board-wood-1040x1040.jpg` | 1040x1040 (2x the 520px max canvas), full-bleed. Painted walnut goban face: real grain running one direction, two or three subtle knots off-centre, a soft bowl of warm lamp light at the middle, corners falling to shadow. | Replaces the diagonal linear-gradient at games/vinecross.js:107-109. Turns brown vinyl into wood, and is the single highest-return asset for this game. |
| `stone-sage-128x128.png` | 128x128 transparent. Painted jade-green seed stone, warm rim light from top-left, faint internal translucency, a soft contact shadow baked into the bottom edge. | Replaces the canvas radial-gradient player stone. Drawn at 2x so it stays crisp at the 13x13 and 9x9 cell sizes. |
| `stone-rose-128x128.png` | 128x128 transparent. Painted rose-quartz stone, same light direction, but a DELIBERATELY different silhouette - slightly flattened top and a small nick in the rim - so the two sides read apart with colour removed. | Fixes the shared-silhouette fault: today only hue tells your stones from the computer's. |
| `table-vignette-750x400.png` | 750x400 transparent PNG. A dark tabletop plane - deep sage-black timber with warm gold rim light along the top edge and a soft falloff outward, sized to sit under and slightly wider than the board. | Gives the board a ground to sit on and fills the empty horizon above it, so the frame is a scene instead of a rectangle in void. |

**CSS to do:**
- games/vinecross.js:93 `#VCcv` inline style - replace `box-shadow:0 8px 28px rgba(0,0,0,0.5),0 0 0 3px #3b2a14` with a stepped lip: `0 0 0 3px #3b2a14, 0 0 0 6px rgba(120,86,40,.42), 0 14px 34px rgba(0,0,0,.65)`. One ring is a hard edge; two rings plus a deeper cast shadow is a transition.
- games/vinecross.js:36 statsRow - it is `padding:2px 0` and floats alone at the top of the page. Give it `padding:9px 0 11px;border-bottom:1px solid rgba(122,179,86,.12)` so it reads as a header band rather than a stray line of text above a board.
- Add a wrapper div around #VCcv with `padding:14px;border-radius:16px;background:url(assets/games/vinecross/table-vignette-750x400.png) center/cover` to seat the board once that asset exists.
- shared.css:2203 `.gb` - add `.gb[disabled],.gb.off{opacity:.38;border-style:dashed}`. REDO is currently dimmed only by colour and still wears the identical pill, so a live and a dead control share one silhouette in the tool row.
- games/vinecross.js:46 `#VChint` - it is already the only gold-lit pill; move it to the END of the row (it is currently third already) and add `border-color:rgba(200,168,75,.5)` so the accent is deliberate rather than emoji-driven.

**Emoji as art:** Only in chrome, not in the playfield: U+21A9 / U+21AA on UNDO and REDO, a lightbulb emoji on HINT, U+21BB on New Game, and a green bullet in the status line. The stones and board are canvas-drawn, not emoji - which is why this one grades above the other two.

### Garden Spades
`play-gardenspades` · native · card · first committed 2026-04-12 · impact 3/5 · effort S
`games/gardenspades.js`

**Now:** A deep navy-blue felt table with a fine SVG noise texture, framed in a 2px brass border with an inset gold hairline. Painted green Celtic-knot card backs: a compressed overlapping fan across the top for Partner, two 13-deep vertical stacks for West and East. A large empty dark rounded rectangle sits in the centre as the trick well. Below, a dark bid panel with NIL in oxblood and thirteen numbered slabs, then the player's hand as cream cards carrying real floral line-art pips - ornate filled clubs and spades in black, filigree hearts and diamonds in red.

**Wrong with it:**
- The table is BLUE (#0e3a5c -> #062035, games/gardenspades.js:84) sitting on the shell's #0d100c near-black-green ground. Two colour worlds meet at a hard 2px brass line down both sides of a 375px screen, with black slivers showing outside it. This is the one thing that stops the game reading as a Lucid Winds game.
- The trick well is a 160px-tall empty rounded rectangle at the exact optical centre of the frame (games/gardenspades.js:469). The composition's focal point is a blank box for the whole bidding phase.
- The Partner fan across the top is 13 card backs overlapped so hard that the knotwork is squeezed into vertical slivers - it reads as green noise, not as cards, and only the rightmost card is legible. The West and East stacks have the opposite problem: 13 identical slices repeated with no motivated grouping.
- Micro-type everywhere: the bag pips, the bid tags and the '…' awaiting badge are inline font-size:0.48rem and 0.5rem (games/gardenspades.js:395, 404), the History and STYLE buttons 0.6-0.62rem. Well under the 0.7rem floor.
- The hand cards are plain #F5F0E1 rectangles with a 2px flat border (games/gardenspades.js:551) - the pips are painted but the card face is not, so painted art sits on an unpainted surface.

**Background now:** Its own panel: an SVG feTurbulence noise data-URI layered over two radial gradients and linear-gradient(135deg,#0e3a5c 0%,#0a2c46 55%,#062035 100%), 14px radius, 2px #6b4520 brass border, inset gold hairline and a 22px drop shadow (games/gardenspades.js:71-90). Real, deliberate, and off-palette. The page behind it is the shared 66-game radial gradient.

**Background wanted:** The same felt construction repainted into the house palette: deep near-black-green with a sage weave and a warm gold vignette, plus a feathered outer shadow so the panel edge fades into the page instead of ending on a hard brass line.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/gardenspades/felt-750x1334.jpg` | 750x1334 tileable-centre felt: #12271c to #0b1a12 ramp, visible woven sage nap, warm gold vignette at the top edge, a faint worn patch under the trick area | replaces the #0e3a5c blue gradient so the table joins the midnight-greenhouse palette instead of reading as a poker room |
| `assets/games/gardenspades/trick-well-420x360.png` | 420x360 transparent, a shallow carved-wood inlay: a soft-edged oval depression with a faint gold compass rose or leaf medallion at 12% opacity, contact shadow around the rim | fills the 160px empty rectangle at the frame's optical centre with something composed, without competing with played cards |
| `assets/games/gardenspades/frame-corner-160x160.png` | 160x160 transparent, painted brass-and-olive table-edge corner ornament, designed to be mirrored into all four corners | turns the flat 2px #6b4520 border into a table edge and softens the hard panel/page boundary |
| `assets/decks/floral/card-front-frame-256x356.png` | 256x356 transparent, cream card face with a painted deckle edge, a hairline floral border inset 6%, and a soft inner shadow; centre transparent for the pip | the floral pips are real art landing on a plain #F5F0E1 CSS rectangle - this is the surface they need, and it is shared with juniper and the other seven card games |

**CSS to do:**
- #GSpan background: swap linear-gradient(135deg,#0e3a5c,#0a2c46,#062035) for a near-black-green ramp (#12271c -> #0b1a12), keep the _GS_FELT noise layer and the two radial gradients as-is
- #GSpan box-shadow: add an outer 0 0 0 14px rgba(13,16,12,0.9) plus a 24px blur so the brass border feathers into the page ground instead of cutting a hard line at 375px width
- the trick-area div (games/gardenspades.js:469, inline min-height:160px): drop to 120px and give it the trick-well art as a background-image, centred
- raise every inline badge from font-size:0.48rem / 0.5rem / 0.6rem / 0.62rem to 0.7rem minimum (games/gardenspades.js:395, 404, 424, 430) - five separate labels are currently under the floor
- TEAM_COLORS #5b9bd1 / #dc8a8a (games/gardenspades.js:94): the blue team colour disappears against a blue felt; on the new green felt re-pick as sage #7ab356 vs rose #dc8a8a so the two seats stay distinguishable

**Emoji as art:** ♠ ♥ ♦ ♣ glyphs are used for the seat markers and the 'Spades broken' pill (a ♠ in a cream circle, games/gardenspades.js:444), and 📜 stands in for the History button icon. The hand cards themselves use real floral pip PNGs, not emoji - the emoji are confined to chrome.

**Readability:** Five inline font sizes under the 0.7rem floor (0.48rem bag/bid tags, 0.5rem contract tag, 0.6rem History, 0.62rem STYLE button). Touch targets are fine: bid buttons min-height 46-48px, hand cards clamp(48px,12vw,64px) which lands exactly at 48px on a 375px screen - no margin, so anything narrower than 375 goes under.

**Music chip:** Not the floating chip, but injected music furniture does collide: on the boot frame the song-unlock sheet ('CONGRATULATIONS, YOU UNLOCKED A SONG / Smoky Club Loop / Play it now / Later') covers the bottom third of the How To Play wall and clips 'The controls - Tap a number to bid' mid-line, so the player never sees the control instructions before dismissing it.

### Music Studio
`play-song` · native · creative · first committed 2026-04-03 · impact 2/5 · effort S
`games/song.js`

**Now:** A dark DAW panel stack: a green-to-gold MUSIC STUDIO wordmark with a gold-outlined PADLAB / MPK badge, a transport row with Play, BPM 75 on a green slider, shuffle and New, then a row of section chips (A1 VERSE, B1 CHORUS, B2 CHORUS active in gold, C1 BRIDGE) each with a coloured left spine, then four instrument lanes - DRUMS, BASS, CHORDS, MELODY - with orange, red, blue and yellow spines, dice buttons, dropdowns, green volume sliders and M/S buttons. Everything is CSS boxes and DM Mono on a flat #0d100c ground. No art anywhere.

**Wrong with it:**
- Three of the four instrument lanes overflow their own panel and are sliced by the right edge with no fade or scroll affordance: BASS's S button, the CHORDS volume slider (cut mid-track), and MELODY's S button are all half-visible strips at x=375.
- The instrument dropdowns truncate mid-word inside a fixed-width select - they read "Up:", "El", "Ka:" - so the player cannot tell which instrument a lane is actually set to.
- The four lanes are visually inconsistent: DRUMS gets a real pattern strip of orange ticks, CHORDS gets three note glyphs, BASS and MELODY get nothing at all in that slot, and the two-line "Oct 2/3/4" sub-labels make three lanes taller than DRUMS so the row rhythm is uneven.

**Background now:** Flat var(--bg) #0d100c inside the iframe. games/song.js mounts /studio.html in an iframe with background:#060610 (a blue-black that does not match the house #0d100c green-black); studio.html's own body then paints var(--bg) over it. Zero gradients, zero keyframes, zero images in the wrapper.

**Background wanted:** None needed as a painted scene - this is a tool panel and a landscape behind it would fight the controls. What it wants instead is a subtle workbench texture: a very low-contrast grain or brushed-slate tile behind the lane stack so the panels read as hardware rather than as flat divs, plus a warm falloff at the top under the wordmark.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `tex-song-slate-256x256.png` | 256x256 seamless tile, near-black brushed slate grain at about 4 percent contrast, tileable in both axes | gives the lane panels a surface; currently every panel is the same flat rgba fill so the whole stack reads as one undifferentiated dark field |
| `icon-song-dice-48x48.png` | 48x48 transparent PNG, a painted bone-white die with warm rim light and a soft shadow, one face showing | replaces the dice emoji used as the randomize control on all four lanes - the emoji is the only saturated red in the panel and it renders differently on every device |
| `icons-song-lanes-64x64.png` | 256x64 strip, four 64x64 transparent badges - a drum skin, a bass string, a chord fan, a melody note - each tinted to its lane spine colour (orange, red, blue, yellow) | gives the four lanes a badge in the empty slot where DRUMS has a pattern strip and BASS and MELODY currently have nothing, and equalises the lane heights |
| `logo-song-padlab-96x96.png` | 96x96 transparent PNG, the PADLAB mark redrawn in sage, gold, cream and rose | the current badge is four primary red/blue/yellow/green squares - the only saturated primaries in the app and they clash with the midnight-greenhouse palette |

**CSS to do:**
- studio.html instrument lane row (the .gs-layer body containing the dice, arrows, select, slider and M/S): it overflows its own panel border and is cut by the viewport - add overflow-x:auto with a right-edge mask-image fade, or flex-wrap the controls, so BASS's S, the CHORDS slider and MELODY's S stop being sliced.
- studio.html instrument <select>: the fixed width truncates values to "Up:", "El", "Ka:" - either widen to fit the longest option or move the value onto its own line under the lane name.
- studio.html .gs-layer-head lane label column: give BASS, CHORDS and MELODY the same single-line label as DRUMS (move "Oct 2/3/4" into the octave control) so all four rows share a height.
- The M and S buttons measure roughly 44px tall in the 375px shot against a .gs-btn min-height of 48px - they are getting squeezed by the row; confirm and enforce 48px.
- games/song.js line 32, the iframe cssText: background #060610 is blue-black while studio.html paints #0d100c green-black - match them to var(--bg) so no cold seam can flash during load.
- studio.html .gs-sec section chips: A1/B1/B2/C1 plus the +A/+B insert buttons already fill the width at 375px - a fifth section will overflow; give the strip overflow-x:auto now.

**Emoji as art:** Dice emoji on all four lane randomize buttons, a triple-note glyph in the CHORDS pattern slot, triangle glyphs on the octave up/down controls, and a sparkle on New. Emoji and text glyphs are doing 100 percent of the icon work.

**Readability:** Instrument dropdown values are truncated mid-word and unreadable ("Up:", "El", "Ka:"). The "Oct 2/3/4" sub-labels are small mono at low contrast. Three lanes have controls clipped by the right edge. Lane names and the transport row are fine.

**Looks broken** (confirmed on a second look, severity ugly)**:** play-song-2play.png: the BASS, CHORDS and MELODY lane rows overflow the panel's own right border and are sliced by the viewport at x=375 with no scroll indicator or fade - BASS's S button and MELODY's S button are half-width strips, and the CHORDS volume slider is cut through the middle of its track. In the same frame the instrument selects render as "Up:", "El", "Ka:", truncated mid-word.

---

## STRONG — already carries itself  (5)

### Sokoban
`play-sokoban` · native · puzzle · first committed unknown · impact 4/5 · effort S
`games/_inline/sokoban.js`

**Now:** Genuinely painted art: a calico cat as the mover, a pale flagstone as the floor tile, a terracotta pot with a leaf emblem as the crate, a glowing soil ring as the target, a dark bramble hedge as the wall, and a large painted 'cat nuzzling a catnip bush' celebration illustration on the win screen. Both -2play and -3later landed on the LEVEL 1 COMPLETE overlay (capture reached 'sparse-ui'), so I never saw an undimmed board — everything below is judged through that dim, plus the raw PNGs opened directly.

**Wrong with it:**
- The win overlay is see-through. play/shell.js:1002 ends the gradient at rgba(13,16,12,0.92), so the game's own control row reads straight through it: a ghosted 'Next Level' sits directly underneath the live 'NEXT LEVEL' button and 'Jump to Level' underneath 'DIFFERENT GAME', with ghost Undo/Reset above them. Doubled buttons, and the ghosts are readable.
- assets/games/sokoban/wall.png is near-black — mean RGB 17,19,15 against a #0d100c page. The bramble hedge is the darkest asset in the folder and disappears into the ground, so the top of the board reads as an empty void with three objects floating in it rather than a walled room.
- The floor tile is drawn ONLY on empty cells (games/_inline/sokoban.js:306-312 — ART.floor is in the final else branch). Player, crate and target cells get no ground at all, so the pale stone path vanishes exactly under the cat and the pot. The walkable surface is missing where the action is.
- Tiles do not tile: floor.png is one isolated flagstone with transparent margins, so adjacent floor cells never join into a path — every ground cell is a separate stone with black between.

**Background now:** No game background of its own — the shell radial gradient (#1a2a20 → #0d100c) shows between and behind the tiles. The board is a bare CSS grid of 48px cells with rgba(26,31,23,.4) under the player/crate cells only.

**Background wanted:** A painted garden-bed ground under the whole grid plus a frame, so the board has an edge instead of dissolving into the page. Not a full-screen scene — the tiles carry the art; it needs a bed and a border.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `wall-hedge-128x128.png` | 128x128 transparent. Repaint the bramble at roughly 2.5x its current luminance (target mean RGB ~45-55, currently 17,19,15), with a sage-lit top edge and a warm rim on the left so it reads as a solid barrier, and edges that butt cleanly against a neighbouring hedge tile. | Replaces assets/games/sokoban/wall.png, which is darker than the page ground and makes the whole board look empty. |
| `floor-path-128x128.png` | 128x128 seamless tiling, opaque, no transparent margin. Damp soil with pressed flagstone fragments; the pattern must continue across a tile seam so a run of floor cells reads as one path. | Replaces floor.png, currently one isolated pale stone with transparent edges, so ground cells never join up. |
| `board-frame-540x540.png` | 540x540, 9-slice-friendly: a painted raised soil/timber garden-bed border ~28px thick, transparent centre, a few trailing leaves overlapping the top-left and bottom-right corners. | Gives the grid an edge; right now the board ends in a hard cut to black on all four sides. |
| `sokoban tiles re-exported at 128x128 (player, crate, planted, target, wall, floor, player-on-target)` | Seven 128x128 PNGs, transparent where the README asks, as assets/games/sokoban/README.txt already specifies. | wall.png is 1785px/2.8MB and the folder is 9.8MB for tiles that render at 40-80px on a phone. The art is good; the delivery is ~100x oversized. |

**CSS to do:**
- play/shell.js:1002 — the #LWGE overlay outer stop rgba(13,16,12,0.92) → 0.985, or paint a solid #0d100c layer under the radial gradient. This is fleet-wide: every native's win screen currently shows its own controls through the scrim.
- games/_inline/sokoban.js:306-312 — render ART.floor under the player, crate and target branches too, not just in the final else, so the ground is continuous.
- The grid wrapper needs a background + border-radius (or the board-frame image) so the playfield edge is a transition and not a hard cut to the page ground.
- The 'Undo / Reset / Next Level / Jump to Level' row should be hidden (or opacity 0) while #LWGE is up, so it cannot double the overlay's own buttons even if the scrim is thinned later.

**Emoji as art:** Only in button labels (⬅️ Undo, ↩️ Reset, ⏭️ Next Level, 📋 Jump to Level, 🎮 Different Game). The playfield is all painted PNG. Those emoji do clash with the painted illustration in the same frame — full-colour system glyphs beside a hand-styled cat.

**Readability:** '1 moves' is small grey type sitting on top of the ghosted Undo/Reset row and is hard to pick out. Button targets are 48px+. The main problem is not size, it is the ghost text bleeding through behind live buttons.

**Looks broken** (confirmed on a second look, severity ugly)**:** play-sokoban-2play.png at y~430-500: a ghosted 'Next Level' label reads directly under the live 'NEXT LEVEL' button and 'Jump to Level' under 'DIFFERENT GAME', with faint 'Undo' and 'Reset' pills above them. Two sets of controls visible in one place.

### Chess
`play-chess` · native · board · first committed 2026-04-03 · impact 4/5 · effort S
`games/chess.js`

**Now:** A painted wooden chessboard fills the top two thirds: warm walnut and pale maple squares under a carved dark-wood frame with green gem specks, genuinely handsome and by far the best-composed frame in this batch. But every one of the 32 pieces is an opaque near-black painted TILE pasted on top of the board, so each piece cuts a dark rectangle out of the wood; below the board the page falls straight off a cliff into flat near-black with a bare mono 'Move 0' and four small green pills.

**Wrong with it:**
- All 12 classic piece PNGs (assets/games/chess/p-*.png) are RGB 128x128 with NO alpha channel (verified: corner pixels are (7,8,4), (0,0,0), (4,9,14) opaque). Every piece therefore paints an opaque dark square over the painted board, so the wood grain dies under all 32 pieces and the back two ranks read as a grid of stickers, not pieces standing on squares.
- Below the board is a hard edge into nothing: the painted frame ends and the next 280px are flat shell black holding one line of mono text ('Move 0') and four 48px pills. No transition, no shadow, no surround - the horizon under the board is empty.
- Black pieces on the dark walnut squares are very low contrast (dark blue-green tile on dark brown wood); at 375px the b-rank rook and bishop silhouettes barely separate from the square. The green gem specks scattered over the frame are irregular and unmotivated - they read as dust on the lens rather than inlay.

**Background now:** assets/games/chess/chess-board.png (512x512 RGB, 338KB) as an <img class="ch-bg">, with 64 transparent .chs squares overlaid at rgba(255,255,255,.08) / rgba(0,0,0,.12). Everything outside the board is the shared native shell: one radial-gradient(1200px 600px at 70% -10%, #1a2a20, --shell-bg).

**Background wanted:** bg-chess-540x960.jpg behind the whole page - a dark green baize tabletop with the corner of a carved shelf and a warm lamp pool falling on the board's top-left, so the painted frame sits ON something instead of floating on shell black. Also re-export chess-board.png at 1024x1024; it renders at up to 420 CSS px, so 512 is already soft on a 2x phone.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `p-king-green.png (and the other 11: p-{king,queen,rook,bishop,knight,pawn}-{green,gold}.png)` | 256x256 PNG-32 WITH ALPHA. Piece only, fully transparent background, warm rim light from upper-left, one soft contact-shadow ellipse baked at the base. Gold set warmed ~10% and green set lightened ~15% so both read against dark walnut. | Replaces the current 128x128 RGB opaque tiles that stamp a black rectangle over the board under every piece. This single re-export is the biggest visual win available in this batch. |
| `chess-board.png` | 1024x1024 JPG/PNG, same painted walnut+maple board and carved frame, gem inlays regularised into four corner clusters instead of scattered specks. | Current file is 512x512 shown at 420 CSS px, soft at 2x; and the random specks read as noise. |
| `bg-chess-540x960.jpg` | 540x960 full-bleed, deep green baize table, warm lamp pool top-centre falling off to near-black at the bottom edge, a shelf corner and a mug at the lower left. | Fills the empty 280px of flat black under the board and gives the frame a surround to meet. |

**CSS to do:**
- shared.css .chs img - once the pieces have alpha, add filter:drop-shadow(0 2px 3px rgba(0,0,0,.55)) so they sit on the wood rather than hover.
- shared.css .ch-wrap - add box-shadow:0 24px 60px -22px rgba(0,0,0,.9) and a 28px linear-gradient fade below the board so the painted frame meets the shell ground through a transition instead of a hard cut.
- games/chess.js .ch-status ('Move '+moveCount) - bare DM Mono on flat black; move it into a gold-hairline strip with the New Game / Undo / Court buttons and set it in the same Georgia serif the frame implies.
- shared.css .chs.ch-move::after - raise rgba(122,179,86,.5) to .78 and .chs.ch-cap::after border to rgba(220,80,80,.75); the legal-move dots now have to read over painted wood, not a flat tint.

**Emoji as art:** The board itself is all PNG art. Emoji stand in on the chrome: 🌱 / 🌳 / ♛ as the difficulty ladder labels (Seedling / Sapling / Old Growth / Ancient), ♜ on the Court (theme picker) button, ↻ and ↩ on New Game and Undo, ⚔ in status strings. 122 emoji in source, 10 distinct.

**Readability:** Black pieces on dark walnut squares are the one real contrast problem - low separation at 375px. Text is fine: 'Move 0' and the pills are DM Mono at clamp(.8rem,2.2vw,.92rem) and .gb carries min-height:48px, so touch targets pass.

### Echo
`play-simon` · native · pattern · first committed 2026-04-03 · impact 3/5 · effort S
`games/simon.js`

**Now:** Four large painted seasonal panels in a 2x2 grid: carved wood squares with a sunken medallion at the centre, dressed with daffodils and cherry blossom, sunflowers and lilac, pumpkin and rowan and autumn leaves, and a frosted winter panel with pinecones and red berries. Each has a season-tinted border (rose, gold, copper, ice blue). Below them sit three plain dark pills - CHORD Maj7, OCTAVE Bright (C6), New Game - and a green-outlined Add to Home Screen slab, all on a flat near-black green-tinted ground.

**Wrong with it:**
- The four painted panels float on a bare flat void - there is no bench, table, frame or ground under them, so 8.5MB of real art sits on the same empty background as a game with no art at all.
- The SPRING/SUMMER/AUTUMN/WINTER labels are in the DOM but invisible on screen: .sl is font-size clamp(.42rem,1.2vw,.55rem), which at 375px resolves to about 6.7px at 0.7 opacity over a busy painted tile. A colour-blind player has no way to name a tile.
- The bottom third of the frame drops to a completely different quality level - three identical dark CSS pills in monospace, then a big green-outlined Add to Home Screen button that is visually louder than the game's own New Game control.

**Background now:** Flat near-black with a faint green cast - the shared shell radial gradient from play/shell.css. The game paints nothing of its own; all its art is the four tile background-images set in shared.css:2314-2317.

**Background wanted:** A dark greenhouse bench or stone sill running behind and under the 2x2 grid, warm gold rim light raking from the left, so the four carved panels read as objects laid on a surface rather than four stickers on black. Also a carved frame around the grid to bind them into one instrument.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-simon-750x1334.jpg` | 750x1334 full-bleed, dark greenhouse interior, a stone or worn-wood bench surface across the middle third, warm gold rim from the left, deep falloff top and bottom so the tiles stay the brightest thing | the painted tiles currently sit on the same empty shell gradient as an art-free game; a ground is the single thing separating this from Chess |
| `frame-simon-tiles-780x780.png` | 780x780 transparent PNG, a carved wood and tarnished-brass 2x2 frame with four square cut-outs and a centre cross member, worn edges, soft warm rim on the top lip | binds the four panels into one instrument instead of four separate floating cards, and gives the grid a silhouette |
| `spring/summer/autumn/winter-tile.webp` | 512x512 webp at quality 80, target under 80KB each, re-exported from the existing PNGs | the four tiles are currently 1.0-1.2MB PNGs each (8.5MB total in assets/games/simon/, and each file is duplicated as both -btn.png and -tile.png) to fill a roughly 165px box on a phone |
| `plate-simon-label-160x40.png` | 160x40 transparent PNG, a small dark brass nameplate with a soft inner shadow, one per tile | gives the season label a readable ground so it can be raised to 0.75rem without fighting the flower art behind it |

**CSS to do:**
- shared.css:2312, .st .sl: font-size clamp(.42rem,1.2vw,.55rem) resolves to about 6.7px at 375px - raise to clamp(.72rem,3vw,.85rem), opacity .7 to .95, and add a dark plate or text-shadow so SPRING/SUMMER/AUTUMN/WINTER are actually readable.
- shared.css:2310, .st: opacity .65 in the unlit state makes the painted art look muddy - raise to .85 and lean on the .lt brightness(1.8) for the flash instead.
- shared.css:2309, .sb: the grid plus the two selector pills plus New Game plus Add to Home Screen overflow 667px, so the shell header (back, help, sunbeams, Sign in) scrolls off during play - cap .sb at max-height 52vh so the header stays put.
- The CHORD and OCTAVE pills use the same dark pill as New Game, so a settings control and an action control are indistinguishable - give the two selectors a sunken/inset treatment and keep the raised pill for actions only.
- shared.css:2311, .st.lt: filter brightness(1.8) saturate(1.3) blows the painted tiles out to near-white on flash - drop to brightness(1.35) saturate(1.15) and let the box-shadow glow carry the signal.

**Emoji as art:** Only in the chrome - refresh arrow on New Game, a leaf and a sparkle in status strings, ladybug in the shell header. The playfield itself is real painted art, not emoji.

**Readability:** The season labels are effectively invisible at about 6.7px / 0.7 opacity over busy art - the one real fault. The CHORD and OCTAVE pills and New Game all clear 48px. Body text and the "Your turn!" status line are fine.

### Euchre
`play-bowergarden` · native · card · first committed 2026-04-12 · impact 3/5 · effort S
`games/bowergarden.js`

**Now:** A composed card table: green baize built from three stacked gradients with a top highlight and a bottom vignette, framed by a warm amber rail. Real painted assets are in play - the floral card backs are dark green with gold botanical filigree, the face cards carry engraved line-art pips, and the dealer button is a shaded gold coin. Your hand sits in a gold-glowing panel above a gold CALL STRONG pill; the three opponents are stacks of backs under WEST / PARTNER / EAST labels.

**Wrong with it:**
- The trick area is a plain lighter-green rounded rectangle floating dead centre with a hard edge and no motivation - a stray box. The played 10♣ sits near its bottom, so the top two-thirds of the box is empty felt-on-felt.
- Card faces carry one big centre pip and a single top-left rank and nothing else. The 10♠, the J♠ and the 9♣ in your hand share an identical silhouette; there is no mirrored bottom-right index, so you read the hand by squinting at five small numbers.
- The 'passed' pills under PARTNER / WEST / EAST are 0.52rem italic at rgba(232,220,200,0.6) on mid-green - the lowest-contrast text on the screen, and it is the state information the player actually needs during bidding.
- The baize meets the amber rail and then the black shell with a hard 2px seam on every side - no felt nap, no wood grain, no transition. The table is a gradient wearing a border.

**Background now:** A real, deliberate table built in CSS at games/bowergarden.js:112-114 - radial highlight ellipse at 50% 0%, a radial darkening at 50% 100%, over linear-gradient(135deg,#0f5c35,#0b4d2c 55%,#083d22). No image. The card art is real though: assets/games/cards/card-back.png and the assets/decks/floral/ pip and face PNGs via the shared games/_cards.js kit.

**Background wanted:** A painted baize plate to replace the three-stop gradient: woven felt nap, a slightly worn darker ring where the trick lands, a warm overhead lamp falloff, and a walnut rail that actually has grain at the bottom edge. The composition is already right - this is a texture pass, not a redesign.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/cards/table-baize-750x1334.jpg` | 750x1334 full-bleed. Green felt with visible nap and a few pulled fibres, warm lamp pool centred at 50% 25% falling to near-black at the corners, a worn darker oval in the middle where tricks land, walnut rail with grain across the bottom 8%. | Replaces the CSS gradient at bowergarden.js:112-114 and the hard rail seam. Same layout, real surface. |
| `assets/games/cards/trick-inlay-300x420.png` | 300x420 transparent PNG. A soft-edged oval of darker felt with a thin gold-thread border, feathered so it has no hard corner anywhere. | Replaces the lighter-green rounded rectangle that currently floats in the middle of the table as a stray box. |
| `assets/games/cards/seat-plate-120x40.png` | 120x40 transparent PNG, one carved wooden nameplate with a gold-inlay edge, greyscale-tintable so one file serves all three seats. | Gives PARTNER / WEST / EAST somewhere to sit. Right now three labels and three 'passed' pills float on bare felt with no motivated grouping. |
| `assets/decks/floral/pip-corner-32x32.png (x4 suits, red and black)` | 32x32 transparent, a small solid version of each suit pip readable at 12px. | Feeds the missing bottom-right mirrored index on the card face, so ranks read at a glance instead of one small top-left number. |

**CSS to do:**
- The trick-area div in games/bowergarden.js (the lighter-green rounded rect between the seats): swap its flat background for trick-inlay-300x420.png, or at minimum change it to a radial-gradient with a transparent outer stop so it stops having a hard rectangular edge.
- The 'passed' pill markup in _headerHtml / seat rendering: font-size 0.52rem -> 0.68rem and colour rgba(232,220,200,0.6) -> rgba(232,220,200,0.85).
- The 'Dealer' label (bowergarden.js:704) and the 'Strong' caption inside the trump chip (bowergarden.js:717) are both 0.52rem - raise both to 0.68rem.
- games/_cards.js .gc-center card face: add a bottom-right rank+pip index rotated 180deg so numeric cards differ in silhouette, not just in one corner digit.
- The trick box vertically: the played card is bottom-anchored inside a tall box. Set the container to align-items:center so the card sits in the middle of its own inlay.
- 'Make ♣ your Strong suit?' prompt above the CALL/PASS row is small muted italic - bring it to 0.72rem cream; it is the actual question being asked.

**Emoji as art:** Only in text: ♥ ♦ ♣ ♠ appear as Unicode in the prompt line 'Make ♣ your Strong suit?' and on the CALL ♣ STRONG button (assets/decks/floral/suit-club.png is used for the deck-style button instead), plus ⛔ ⚡ in the alone/loner badge and ↻ on New Game. The cards themselves use real painted PNGs - this is the least emoji-dependent game in the batch.

**Readability:** The 0.52rem tier is the problem: 'passed' pills, the 'Dealer' label, and the 'Strong' caption in the trump chip are all below the 0.7rem floor and all sit on mid-green at 60% opacity. Touch targets are fine - CALL STRONG and PASS are both min-height 44-48px and the hand cards are ~60px wide.

### Petal Match
`play-petalmatch` · native · puzzle · first committed 2026-04-12 · impact 3/5 · effort S
`games/petalmatch.js`

**Now:** A painted match-3 board in a heavy ornate metal-and-leaf frame, filled with eight kinds of glossy painted flower gems, sitting on a painted misty forest-glade backdrop that continues down past the board to a stone path. Below it a row of grey powerup labels, then three painted laurel-plated buttons. Genuinely the best-looking screen in this batch.

**Wrong with it:**
- The wallet line reads '0 PETALS  v27' - a debug build tag is printed in the live player HUD at font-size:0.55rem in #5a614f (games/petalmatch.js:655), well under the 0.7rem floor and in a colour that is nearly invisible; and the word PETALS beside it is a washed grey that disappears into the painted backdrop behind it.
- The powerup shelf (DIG 15 / CUT 25 / WASH 20 / BOOST) is a row of grey ghosts on painted art - the can't-afford styling reads as unfinished UI rather than as 'locked'. The BOOST cell also runs flush to the right screen edge with no closed frame, while DIG, CUT and WASH each sit in a bordered box. The comment at line 588 records fixing this same overflow at ~440px; at 375px it is back.
- There is a hard horizontal seam directly above the Add to Home Screen button where the painted chapter backdrop stops dead and the flat #0d100c shell resumes. The most beautiful asset on the page ends on a straight cut line with no fade.
- A stray gold horizontal bar sits above the board frame at the top of the visible area - a second frame edge that does not belong to the board and reads as a misaligned duplicate piece.
- The gems are eight high-saturation primary flowers (fire red, orange, hot pink, cobalt, cyan, sunflower yellow). Genre-correct for match-3, but the frame and backdrop are house style - sage, brass, deep green - and the pieces are not, so the board and its frame look like they came from two different games.

**Background now:** Painted full-bleed chapter backdrop - runtime/chapter-bg-1..4.jpg set on an absolutely-positioned #PMbg element (games/petalmatch.js:454-470) - with the board itself framed by ui-board.png as a border-image and vignette-corner-a.png overlays. 271 asset files, 37MB.

**Background wanted:** None needed - four painted chapter backdrops already ship and they look right. What it needs is for the backdrop to stop ending on a hard line: extend it under the shell footer or fade it out.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `pm-bg-fade-540x180.png` | 540x180 transparent, a vertical gradient from fully clear at the top to solid #0d100c at the bottom, no detail | Laid at the bottom of #PMbg so the painted chapter backdrop dissolves into the shell instead of ending on the straight cut line visible above Add to Home Screen. |
| `pu-dig.png / pu-cut.png / pu-wash.png / pu-boost.png` | four 96x96 transparent painted tool icons - brass trowel, garden shears, copper watering can, sunburst - warm rim light, on alpha | Turns the powerup shelf from four grey words into four objects. The code comment at games/petalmatch.js:313 already names this exact path (runtime/pu-<key>.png) and the hook was never painted. |
| `pill-locked.png` | 160x56 transparent 9-slice, a desaturated but still painted version of the existing pill-thin.png with a faint brass edge | So an unaffordable powerup looks deliberately locked rather than unstyled - right now DIG/CUT/WASH read as broken UI on top of finished art. |

**CSS to do:**
- games/petalmatch.js:655 - delete the PM_BUILD ('v27') span from the shipped wallet, or gate it behind the dev flag. A build tag at 0.55rem in #5a614f does not belong on the player's HUD and is under the 0.7rem floor.
- games/petalmatch.js:653 the PETALS label span: raise from the current washed grey to #e8dcc8 and add text-shadow:0 1px 3px rgba(0,0,0,.85) so it survives sitting on a painted backdrop.
- The PU_BTN disabled/unaffordable state (games/petalmatch.js:640-648): swap the flat grey wash for the locked pill art and keep the gold price legible.
- The powerup shelf container: still overflows at 375px - make it a 4-column grid with min-width:0 on each cell so BOOST closes its own frame inside the viewport instead of running off the right edge.
- #PMbg (games/petalmatch.js:455): the backdrop ends at the mount's bottom edge - extend it under the shell footer or add the fade PNG so the painted-to-flat transition is not a straight seam.
- Board top: the SCORE / LV / MOVES readouts are pushed above the fold at 375x667 - shrink the board to fit the HUD, or make the HUD sticky, so a player can see their score while playing.

**Emoji as art:** Almost none in the playfield - the gems, frames, pills, HUD bar and backdrops are all painted PNGs. Emoji appear only in status text and toasts (⛔ ⭐ ✓ ↻ ⚠️). This is the one game in the batch where art does the art.

**Readability:** The 'PETALS' label and the 'v27' build tag (0.55rem, #5a614f) are below the readable floor on a painted background; the DIG/CUT/WASH/BOOST labels are mid-grey on painted forest with poor contrast; SCORE, LV and MOVES are entirely off the top of the frame at 375x667.

**Music chip:** Not visible in this frame - the header is scrolled above the fold in both the play and later shots.

**A "looks broken" claim here was refuted on a second look.** The claim is that in play-petalmatch-2play.png the BOOST cell runs past the right viewport edge with no closed right border and the shelf overflows at 375px. I measured it live in headless Chrome at 375x667 DPR2 after tapping LET'S PLAY: DIG 18-102, CUT 106-190, WASH 194-278, BOOST 282-366, all exactly 84px wide, clippedRight false, and document.scrollWidth === innerWidth (zero horizontal overflow
