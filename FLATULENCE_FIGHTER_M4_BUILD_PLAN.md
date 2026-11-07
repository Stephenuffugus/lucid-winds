# FLATULENCE FIGHTER m4, ASTRA'S ROUND 2 ON THE SIX PAD DECK (7 Nov 2026, Fable's plan for the Opus overnight run)

m3 is live (six pads, calls that move, the flap and squeak sounds; main e4bf2e8df's tree). Astra's round 2 is back and
drawn to the SIX PAD override: a theatre seat for the cheeks (divided at the centre gap), clipped glove plaques for the
hands (a three tab cuff) and the fingers (a narrow crest), every state at the upper rim so a finger never hides it; 34
call icons plus four marks; a table card; a how to play move panel; the lesson line plates; a ring specimen that fixes the
countdown's geometry. Her ranked next list: moving call continuity, keep all six targets 120 tall on short screens.

The pack: /workspaces/flatulence-fighter-astra-round2/pack (132 files; vault astra-four-packs-back-nov07). Docs copied to
docs/briefs/flatulence-fighter/round2/astra/ (ASSESSMENT-R2.md, NOTES.md, STYLE-GUIDE-R2.md, manifest.json, anchors.json:
READ STYLE-GUIDE-R2.md first, it holds the sizes, the ring maths and the layout budget). Game:
satellites/flatulence-fighter/index.html (2301 lines; the deck at line 727: #handL2 #handR2 the fingers, #handL #handR the
hands, #padL #padR the cheeks; .hand states idle called holding done missed leave at CSS line 355 on; CALLS at line 924;
CFG.hopLetGo 0.7 at line 951; hopCall at 1538; renderHands 2043; syncPads 2126; LESSON at 1894; #tableScreen 656;
#howScreen 635; the lesson overlay #tutOverlay #tutBig #tutText at 714). Check: `node tools/ff-tests/check.js`. Shot:
`node tools/ff-tests/shoot.mjs` (as m2 and m3 used it). Deploy pattern: /home/codespace/ff-drafts/deploy-ff-m3.sh.

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE 7 Nov | 3d8c92165 | 36 pad PNGs, the table card, the move card, the two lesson line plates into assets/deck/; her 34 call icons and the three pad marks inline in the ff-calls sprite (the Library's book call_book_library, Fold your hands call_fold, Clap call_clap, the move mark call_move, the fingers' idle mark call_finger); check green |
| 1 | DONE 7 Nov | 3d8c92165 | every pad a nine sliced ::before layer (her insets 56 56 52 56, half in CSS) picked by state through a --pad-plate variable per id and class; cheeks gain lifted and squeak classes from renderCheeks; the idle plate draws its own gesture (the icon hidden, the role label 11 px at her band); words 15 px; pads clamp(120px, 15.3dvh, 170px). Shot play at 412x915 (probed, not opened): fingers and hands 84 percent paper plate pixels, the called left hand 6 percent accent and its rim band half accent, the cheeks 78 percent sage seat; no page errors |
| 2 | DONE 7 Nov | 3d8c92165 | the circle ring is gone; a rim ring path per pad built from its real size (inset 9, radius 12, stroke 3, top centre clockwise, pathLength 100, refit by ResizeObserver); wait: dash 100r offset minus 100(1 minus r); hold: dash 100p offset 0; cheeks under a cover: the remaining noise, brass through perfectFrac then relief |
| 3 | DONE 7 Nov | 3d8c92165 | hopCall already kept the icon and words at the destination and the 0.7 s grace from the hop event (c.fromAt); the source now shows her move mark rotated toward the destination with Let go; the letgo blink is off (her LEAVE plate carries the arrows), so reduced motion needs nothing |
| 4 | DONE 7 Nov | 3d8c92165 | the table screen draws her card at up to 360 by 300 with the line in her paper band (top 77.7 percent, 20 percent tall); the How screen keeps the small picture with the line under it and gains the move step; the lesson has the move beat (a 3.2 s hymn book call that hops at 0.9 s; Follow it; Let go of the pad it left), You are ready splits on a screen 600 tall or less, her done plate shows 0.6 s between beats. Shot table card (probed): the picture region has a 60 lum stdev (an illustration, not a blank) |
| 5 | DONE 7 Nov | 3d8c92165 | the lesson line is her plate on the tut card's ::before (nine slice 92 32 28 64 at half), the serif at 22 px (18 under 340 wide), text from 38 px in, clear of her mark; the deck keeps six 120 px targets at 320x568 and the stage gives up the height. Shot lesson beat 1 at 320x568 (probed): the sage seats at the foot, paper plates in the two rows above, no page errors |
| 6 | DONE 7 Nov | 3d8c92165 | check green; the three visual shots above stand for the walk (one each, no image opened); /home/codespace/ff-drafts/deploy-ff-m4.sh DRY OK against main 9550354e0. LINE: `! bash /home/codespace/ff-drafts/deploy-ff-m4.sh` |

## THE LAWS
The laws of FLATULENCE_FIGHTER_M2_BUILD_PLAN.md bind (code directly; the check per step; ONE shot per visual step,
described from the shell, never opened; the walk once at the end; never push main; commit and push add-sproing-jumper
after every step; one HTML file plus assets/; no CDN fonts; 48 px targets; her text is never baked into an image). Her
docs are advice; the game's rules win and the difference is one line in STATE. No file of round 1 is replaced.

## THE STEPS

**Step 0. Import (S).** Copy the runtime set into satellites/flatulence-fighter/assets/deck/: the 36 pad PNGs
(assets/a_pads/pad_{finger,hand}_{left,right}_{idle,called,holding,done,missed,leave}.png and
pad_cheek_{left,right}_{idle,held,cover,lifted,squeak}.png, each 388 by 280 at 2x), c_table_card/table_card.webp,
c_table_card/how_to_play_move.webp, d_lesson/lesson_line.png and lesson_line_done.png. The 34 call SVGs plus
icon_call_move, icon_pad_cheeks, icon_pad_fingers, icon_pad_hands go INLINE into the ff-calls sprite (after line 552,
replacing the placeholder symbols): 48 unit viewBox, currentColor, 3 unit rounded strokes; ids follow the CALLS table
(call_book, call_shake, call_tissues ... as at line 924); where she drew two objects the table shares one id (hymn book
and the library's book both call_book; the menu and the program), give the second its own id and point the CALLS row at
it (The Library's "Hold the book" becomes call_book_library; "Hold the program" call_program is hers already). No
previews, no docs, no ring_specimen.svg (it is a drawing of the maths, step 2 builds the maths). Check green.

**Step 1. The pads (M; the look).** Each pad state becomes its plate: CSS border-image on the button (border-image-source
her PNG, border-image-slice her insets from anchors.json in SOURCE px, border-image-width the same insets at HALF in CSS
px, fill; background none), one rule per state class: .finger.idle ... .finger.leave, .hand.idle ... .hand.leave,
.cheek.idle .held .cover .lifted .squeak. The fingers are #handL2 and #handR2 (give them a finger class; they share the
.hand code). Left and right are her mirrored files, never a CSS flip. The icon (48 CSS px) and the words (15 px, two
lines) sit at her content anchors, independent of the stretched centre; the role label 11 px. Map the game's states: a
cheek held is .held; held while a cover plays is .cover; both lifted under a cover is .lifted; lifted in the quiet is
.squeak (the strike moment, hold it for the flash); .benched and .slipped keep their meaning on top. Sizes by width: 320
gives 148 by 120, 360 168 by 130, 412 194 by 140, 560 268 by 170; 8 px gutter and side margins; the stage gives up height
first and a target never goes under 120 tall (the layout budget in step 5). Check green. ONE shot of play at 412x915
with a call lit (the shoot tool's play screen): describe from the shell. Not opened.

**Step 2. The ring (S).** Replace the circle (r 44 in a 100 box) in every pad's .hring with a rounded rectangle path built
at the pad's real size: inset 9 CSS px, corner radius 12, stroke 3, pathLength 100, starting top centre, clockwise;
rebuilt on resize. Hold at fraction p: stroke-dasharray 100p 100(1 minus p), offset 0. Countdown with r remaining:
dasharray 100r 100(1 minus r), offset minus 100(1 minus r), so the erased part grows clockwise from the top. Cheeks:
cover and lifted draw the same remaining noise clock, brass for the first 40 percent (the Perfect window) then relief;
never colour alone, the countdown and the live words stay. Check green. No shot.

**Step 3. Moving calls (S; her number one).** Read hopCall (1538) against her rule and fix what differs: the destination
pad shows CALLED with the SAME icon and words; the source shows LEAVE with "Let go" and icon_call_move pointing at the
destination (mirror or rotate by where it is on the grid); the 0.7 s grace (CFG.hopLetGo) starts from the real hop
event; LEAVE is an instruction, never counted a miss by itself; DONE only on completion, never as a release warning;
reduced motion keeps steady LEAVE arrows and words (the letgo keyframe off). Check green. No shot.

**Step 4. Teaching (S).** #tableScreen shows table_card.webp (720 by 600 at 360 by 300) with the one line rendered into
her clear paper band (anchors.json gives the band; the line is DECISION 5's "Set your phone flat on a table and use both
hands."). The How screen gets the move step after the four pad steps: how_to_play_move.webp at 200 px illustration width
with its line under it, full size: "A call can move. Follow it, and let go of the pad it left." The lesson (LESSON at
1894 and its scripted beats): a move beat after beat 5, scripted to hop once: "A call can move. Follow it." then "Let go
of the pad it left."; beat 6 split into "You are ready." and "Three strikes and the room knows." when the viewport is
568 tall or less. Check green. ONE shot of the table card at 412: describe from the shell. Not opened.

**Step 5. The lesson line and the short screen (S).** #tutBig's plate becomes lesson_line.png nine sliced to the full
width above the deck, 64 CSS px tall (lesson_line_done.png with its check once the beat is done), the game's own serif
bold at 22 px (18 at 320), two lines at 24 px line height, the text clear of her left marker (anchors.json). Layout
budget at 320 by 568: six pad grid 376, lesson line 64, top controls 48, lesson gap 8, bottom margin 8, the stage the
remaining 64; on a viewport shortened further by browser chrome, the stage shrinks, never a target. Check green. ONE
shot of lesson beat 2 at 320x568: describe from the shell. Not opened.

**Step 6. The walk, the stamp, the line (S).** Check green. The walk ONCE: every screen at 412x915 and 320x568 (menu,
table, how, lesson beat 2 and the move beat, play with three states lit, a strike, result). Nothing is opened in
auto mode: probe each shot's pixels from the shell (a pad's rim colour at its top corners by state, the ring's stroke
present, the lesson line's text band not empty) and write what the probe found in STATE, one line.
The deploy script /home/codespace/ff-drafts/deploy-ff-m4.sh in the exact pattern of deploy-ff-m3.sh (SRC the final
commit; BASE the blobs main holds NOW for the game's index.html, og/card.jpg and the thumb: read them with git
rev-parse origin/main:<path> when you write it; m3 went live on main e4bf2e8df). `DRY=1 bash ...` once. The line into
START-HERE.md: `! bash /home/codespace/ff-drafts/deploy-ff-m4.sh`

## RULINGS (Stephen, 7 Nov 2026 ~15:40 UTC)
1. A miss is a STRIKE, with a little fart on it.
2. Modes: the story is the game; no separate Classic. Later a CHALLENGE mode (how long you last, faster and harder as it
   goes), not needed right away.
3. Portrait stays (the game is drawn for it).
4. The lesson's move beat (seven beats) stays; he wants it explained before he rules.
5. The sounds: not checked yet.

## DECISIONS for Stephen (built as written until he says otherwise)
1. Her Noto Serif Bold for the lesson line: default the game's own display serif (no new font file, offline law).
2. The lesson's move beat is added (default); he may want the lesson to stay six beats.
3. The six DECISIONS of the m2 plan stand as they are (fidget or strike, Classic mode, landscape, the medals' names).
