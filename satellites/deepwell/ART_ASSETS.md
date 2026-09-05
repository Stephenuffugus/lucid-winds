# DEEPWELL art asset list

> Drive copy (the prompts, for the phone): https://docs.google.com/document/d/1hvLhYpwCUFrPbenZG8Tl1DNmuZYcu9No6H8i1csYr1g/edit  in 012Assets. This file is the source of truth; the Doc is regenerated from it.

Written 2026-09-02 from the code in `satellites/deepwell/index.html` (3464 lines), not from
the docs. Every size below was measured from the CSS and the JS at 375x667. Every entity
below exists in the code; nothing is invented, and the last section proves nothing is missed.

---

## 1. What the game is

A turn based push your luck dive down one vertical mine shaft: each tap DESCENDs one node
(3 to 6 meters), MINEs a vein into a weight capped pack, or WINCHes OUT in one commitment,
and ore only becomes cash at the surface while the climb costs `1 + weight/12` air per
meter, so the whole game is reading the AIR TO SURFACE number against the air you have
left. Between dives a surface screen sells six permanent upgrades, offers a daily seeded
shaft, and the well itself holds 18 shrine bargains, 3 hazards, 10 ores and 6 landmarks
below 200 m that almost nobody reaches.

## 2. Render architecture (read this before anything else)

**There is no canvas.** The brief called this a procedural canvas game; grep says otherwise:
zero `canvas`, zero `getContext`, zero `drawImage` in the file. The game is DOM + CSS end to
end. The only `requestAnimationFrame` is the payout count up in `dwCount` (line 2896).

- **No draw loop.** `render()` (line 2783) runs once per action, from `doAction` (3081), the
  replay `tick` (3295) and `resize` (3407). It rewrites text and bar widths, then calls
  `renderShaft()` (2649) which rebuilds the whole column as an HTML string and assigns
  `sc.innerHTML = html` (2726). So a sprite that needs to ANIMATE must animate by CSS
  (`animation: steps(N)` over a strip) because nothing redraws between taps.
- **No DPR handling.** The browser rasterises the DOM; give PNGs at 2x the in game size and
  let `background-size` or `width/height` scale them.
- **Viewport.** `#app` is `position:fixed; inset:0` (line 34), so at 375x667 the game is
  375x667. At `min-width:620px` `#app` caps at 520 wide and centres (line 388). At
  `min-width:700px` the shaft gutter `--gut` widens 68 to 96 px (line 30). Every size in this
  file is at 375x667 with `--gut` 68.
- **Shaft scale.** `pxPerM = 6` (line 2652). A node gap of 3 to 6 m is 18 to 36 px. The
  column is centred on the player: `top = depth - h/12`, so the player sits at half height.
- **The gutter and its two lanes** (lines 2657 to 2660): the column owns the left 68 px of the
  screen, full height (`#shaftScroll`, line 54). Inside it the ruler owns the left 22 px, and
  the bore is `boreL = 22`, `boreW = 68 - 22 - 4 = 42` px wide, `boreMid = 43`. Everything
  in the bore is drawn centred on x = 43.
- **Run screen cards** sit right of the gutter: left margin `--gutpad` = 78, right 12, so
  every card is **285 px wide**. Overlays use 14 px padding, so overlay content is **347 px**.

### The palette the CSS and JS actually use

| token | hex | used for |
|---|---|---|
| `--bg` | `#0a0b0f` | page ground, sticky bar |
| `--ink` | `#05060a` | test panel ground |
| `--panel` | `#14161d` | cards, cargo rows, shop tracks |
| `--panel2` | `#1b1e27` | buttons at rest |
| `--line` | `#2a2f3c` | every hairline border |
| `--amber` | `#f0a742` | THE colour: lamp, you, MINE label, cash, record line, gold buttons, seam flare |
| `--warm` | `#ffd9a0` | DESCEND label, ascent number, glint, the knife line |
| `--sage` | `#8fbf6a` | WINCH OUT label, brace pips on, WALK AWAY, switches on, safe end of the margin bar |
| `--cream` | `#e8dcc8` | body text, odometer |
| `--muted` | `#8a9178` | labels, captions |
| `--danger` | `#e2574c` | YOU CANNOT AFFORD THE WAY OUT, lost manifest lines |
| air bar | `#6fb1d6` to `#9fd8ee` | line 180 |
| lamp bar | `#c98a2a` to `#ffd9a0` | line 181 |
| pack bar | `#8a7f6a` to `#d8c9a8` | line 182 |
| node borders | vein `#f0a742` at .45, pocket `#7ab356` at .45, cache `#c8a84b` at .45, shrine `#b88cf0` at .50, hazard `#e05c4e` at .55, heart `#ff7a6a` at .9 | lines 88 to 96 |
| strata | topsoil `#3a2f1e`, shale `#2b2f38`, dark seam `#14161d`, wet shelf `#14262c`, the glass `#231b33`, below `#2a0f14` | lines 722 to 727 |
| ores | slag `#7c7466`, copper `#c2703c`, iron `#9aa3ad`, silver `#d8dde6`, cobalt `#4a76c8`, gold `#f0c04a`, beryl `#5fd6b0`, uranite `#9ad64a`, voidglass `#b98cf0`, heartstone `#ff7a6a` | lines 704 to 713 |
| shrine ground | radial `#1a1206` to `#08090d` | line 286 |
| rope | `#7a5c33` to `#3a2c18` | line 332 |
| death fade | `rgba(60,8,4,.85)` to `#000` | line 310 |
| gold button | `#f0a742` to `#c4832c`, text `#191207` | line 266 |
| briefing button | `#3a2c14` to `#241a0a` | line 328 |

### The style line (baked into every prompt below, named once)

> **Deepwell style:** lamplit mine shaft game art, matte flat shapes with chiselled rock
> edges and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as
> the only light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and
> bruised violet 231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only
> for what is not, clean heavy silhouettes that still read at sixteen pixels, tense and
> quiet, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for
> cutout.

### How art drops in, per sheet (the DOM version of drawImage)

Two mechanisms, both one line each:
- **CSS:** give the existing class a `background:url(deepwell-XX.png) -x -y / w h no-repeat`
  and blank the glyph. Works for `#youMark`, `.nmark.k-*`, `.pip`, `.oredot`, `.od`,
  the strata band divs, `.big`, `.btn`, `.iconbtn`.
- **HTML:** put `<img src>` into the string the JS builds at the line named.

| sheet | replace this | at | in game px |
|---|---|---|---|
| 01 miner + lamp | `#youMark` CSS (104 to 108) written at 2725; `#lampGlow` gradient (102) written at 2722 | `renderShaft` | you 16x16 ring + 14 px glow; lamp pool 42 wide x 44 (empty) to 284 (full) tall |
| 02 node markers | `NODE_FACE` glyphs (2637 to 2644) put into `.nmark` (79 to 97) at 2712 | `renderShaft` | 26x18 min, 42 max wide, radius 9 |
| 03 ore lumps | `oreDot()` (2617) 12x12 square in cards 2755 and 2864; `.od` 6 px round at 2707 | `nodeCardHTML`, `renderCargo`, `renderShaft` | 12 px and 6 px |
| 04 strata + backdrop | band fill divs at 2669 (68 wide, `sb.col`, opacity .9); `#shaftBand` wash at 2651 (375x667 at .13); `.bore` 67; `.rockrow` 57; `.tick` 73; `.strataSeam` 72; `#recLine` 59; `.dwdust` 338 | `renderShaft`, CSS | 68 px wide strips, full height |
| 05 hazards | `.nmark.k-hazard` at 2712 (add `k-haz-` + `n.hazKind`); node card 2766; toast 3118 | `renderShaft`, `nodeCardHTML`, `handleEvent` | 18 px marker, 40 px card icon, 20 px toast icon |
| 06 shrine emblems | `#shrineOvl .plate` (286 to 292, HTML 464 to 469) has no image; add `<img id="shrineArt">` above `#shrineName` and set it at 2879 from `SHRINE_BY_ID[id]` | `openShrine` | 128 px emblem, 347 wide plate |
| 07 landmarks | `DEEPS` 758 to 776; ladder rows at 3036 (13 px rows, `?????` when unhit); HUD flare `stampBand` 2731; no shaft marker exists, add one at `y(D.depth)` in `renderShaft` | `renderShop`, `handleEvent`, `renderShaft` | 20 px ladder icon, 42 px wide bore plaque, 40 px flare vignette |
| 08 gear + meters | shop track rows at 3019 (`.track`, 356); briefing `.bgear` chips at 3172 to 3177; meter labels HTML 425 to 428; `.pip` 184 written at 2820; `#cashBig` 3012 | `renderShop`, `startRun`, `render` | 40 px track icon, 16x16 pip, 14 px meter icon, 22x6 level pip |
| 09 screens | surface header (HTML 444 to 448); `#dwBrief` at 3165; `#dwLower .rope` at 3187 (2 px x 34vh = 227 px); `#resTitle` 2924 and 2933; `#dwFade` 2892 (CSS 310, 311); overlay heads 457, 481, 488 | `startRun`, `openResult`, `dwFlash` | plates 347 wide; fades 375x667 |
| 10 UI chrome | `.big` 204 (285x60 and 138x60); `#btnCargo` 222 (285x52); `.btn` 264 (347x52 and 169x52); `.buy` 363 (92x52); `.switch` 384 (70x48); `.drop` 277 (78x48); `.iconbtn` 125 (48x48); `.card` 260; `#margin` 141 + bar 147; `#toast` 377; `#odo` 135 (74 px digits); `.lgmark` 232 | CSS | as listed |

---

## 3. Asset table

| id | what it is | where it draws | in game px at 375x667 | cells | priority |
|---|---|---|---|---|---|
| 01 | The miner and the lamp pool (the only character) | `renderShaft` 2722, 2725 | 16 px ring (render at 28); lamp 42 x 44 to 284 | 32 | **1** |
| 02 | Column node markers, every kind, every reveal level, spent, heartstone | `renderShaft` 2712 | 26x18, up to 42 wide, 18 px apart at a 3 m gap | 16 | **1** |
| 03 | Ore lumps, 10 ores, plus the drop glint | `oreDot` 2617, `.od` 2707, `glint` 3142 | 12 px in cards, 6 px in the shaft, glint 10 to 26 px | 12 | **1** |
| 04 | Strata rock tiles, seams, bore walls, ruler, record line, dust, full bleed washes | `renderShaft` 2651 to 2686, 2717; CSS 338 | 68 px wide strips, 120 to 360 px per band | 20 | 2 |
| 05 | Hazards: gas, collapse, flood, struck, braces held, charm ate it | `renderShaft` 2712, `nodeCardHTML` 2766, `handleEvent` 3116 to 3121 | 18 px marker, 40 px card icon, 20 px toast icon | 12 | 2 |
| 06 | Shrine bargain emblems, 18, plus the refused stamp and generic shrine | `openShrine` 2877 | 128 px on a 347 px plate | 20 | 2 |
| 07 | Landmarks of the Below, 6, plus locked and the well keeps going | `renderShop` 3036, `handleEvent` 3122, `renderShaft` (patch) | 20 px ladder icon, 42 px bore plaque, 40 px flare | 8 | 2 |
| 08 | Gear and meter icons: 6 shop tracks, 4 meters, brace pip on and off, cash, cargo sack, pick, winch, down arrow, maxed seal, daily badge | `renderShop` 3019, `startRun` 3172, HTML 425 to 428, `render` 2820 | 40 px, 16 px, 14 px | 16 | 2 |
| 09 | Screens: surface header, contract briefing plate, winch beat, three verdicts, three overlay heads, two full bleed fades | `startRun`, `openResult`, `dwFlash`, HTML | 347 wide plates, 375x667 fades | 12 | 2 |
| 10 | UI chrome: button plaques in every state, icon buttons, card frames, margin bar, toast, odometer frame, log chips, app icon | CSS 125 to 384 | as listed in section 2 | 24 | 2 |

Priority 1 is on screen every second of a run: you and your lamp, the markers you are
descending past, and the ore you are deciding whether to carry. Nothing in this game is
priority 3: the Director said everything looks plain, and the surface screen is where every
run begins and ends, so the chrome and screens carry the same weight as the hazards.

Screens the game actually has (there is NO separate title screen and NO pause screen):
the surface (`#shopScreen`) IS the title, `boot()` goes straight to `toSurface()` (3444);
the how to play IS the contract briefing (`#dwBrief`, 3165), it waits for a tap; the run
(`#runScreen`); cargo drawer (`#cargoOvl`); shrine (`#shrineOvl`); result (`#resOvl`);
logbook (`#logOvl`); options (`#optOvl`, which is the closest thing to pause in a turn
based game); the winch beat (`#dwLower`); the two fades (`#dwFade.death`, `#dwFade.up`);
the toast; and `#testPanel` at `?test=1`, which is dev only and gets no art.

---

## Sheet 01: The miner and the lamp pool

**PATCH-REQUIRED wiring:** you are `#youMark` (CSS 104 to 108): a 16x16 amber ring with a
5 px amber dot and a 14 px glow, written once per render at line 2725, centred on
`boreMid` (x 43) at `y(st.depth)`. The lamp is `#lampGlow` (CSS 102, written at 2722): a
radial gradient ellipse `boreW` (42) wide and `reach * 2` tall where
`reach = 22 + 120 * lamp/capLamp`, so 44 px at an empty lamp and 284 px full, at opacity
`0.20 + 0.55 * frac`. To use sprites: set `#youMark{width:28px;height:28px;border:0;
box-shadow:none;background:url(deepwell-01.png) 0 0 / 1024px 2048px no-repeat}` and pick the
cell by a state class added to the div at 2725. Every state below is already a fact the
code knows at render time: `st.depth === 0` (mouth), `st.lamp <= 0` (dark), the last event
in `handleEvent` (descend 3096, mine 3104, hazard 3116, hazardShrug 3120, ascend ok 3130),
`G.run.over.reason` ('surfaced', 'air', 'collapse'), and `G.replaying`. Because nothing
redraws between taps, each multi frame row is a horizontal strip driven by CSS
`animation: steps(4) 0.6s infinite`. Keep the lamp pool as a PNG glow behind the miner
with `width:42px` and `height` set from `reach` exactly as line 2722 does now, 3 cells
(full, half, ember) swapped at `frac > .6`, `> .25`, else.

**Surprises found here:** the miner has no descent motion at all; the column jumps 18 to
36 px per tap with no tween (`#shaftScroll` declares `will-change:transform` at line 55 but
nothing ever transforms it). The lamp out state has no full screen darkening, only the
pool shrinking to 44 px and the node card reading DARK. The replay (`G.replaying`) looks
identical to live play except for a toast and inert shrine buttons.

**Shape law:** the miner is 28 px tall in a 42 px bore with the lamp pool behind him. He
must read as helmet plus lamp beam by silhouette alone; every state is a different POSE
(crouch, swing, flinch, slump), never a recolour. The lamp pool cells differ by SIZE of the
lit ellipse, never by hue.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 8 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, one
small stocky miner seen from the side, round helmet with a single amber F0A742 headlamp,
dark canvas coat 1B1E27, cream E8DCC8 face and hands, a heavy sack on his back, the helmet
lamp is the only light source in every cell.
Row 1, IDLE at the working face, 4 frames of a slow breathing loop, sack resting on the
floor, lamp beam a soft amber cone.
Row 2, DESCEND, 4 frames of dropping down a rope hand over hand, boots braced on rock.
Row 3, MINE, 4 frames of a pick swing, wind up, strike with a small amber spark burst,
follow through, recover, one small ore lump flying.
Row 4, cells 1 and 2, HIT by a hazard, 2 frames of a flinch with the helmet lamp
flickering to a dim C98A2A; cells 3 and 4, BRACES HELD, 2 frames of the miner ducking
under a timber prop that holds, sage 8FBF6A dust motes.
Row 5, cells 1 and 2, LAMP OUT, 2 frames of the miner as a near invisible slate 2B2F38
silhouette with one hand feeling the wall and no beam at all; cell 3, LAMP POOL FULL, a
wide soft amber F0A742 ellipse of light with no miner in it; cell 4, LAMP POOL EMBER, the
same ellipse shrunk to a quarter size and dimmed to C98A2A.
Row 6, WINCH OUT, 4 frames of the miner rising in a rope loop, sack swinging below him,
beam pointing up, rock passing.
Row 7, cells 1 and 2, THE AIR RAN OUT, 2 frames of the miner slumped against the wall,
lamp guttering, deep red 3C0804 shadow; cells 3 and 4, THE ROOF CAME DOWN, 2 frames of
the miner under a fall of slate blocks, helmet lamp the only thing showing.
Row 8, cells 1 and 2, SURFACED, 2 frames of the miner climbing out over a stone lip into
pale daylight FFD9A0, sack held high; cell 3, AT THE MOUTH, the miner standing at the top
of the well looking down, beam off, sky behind; cell 4, REPLAY GHOST, the idle miner drawn
as a translucent pale B88CF0 outline with no fill.
Even spacing, one figure per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 02: Column node markers

**PATCH-REQUIRED wiring:** each node is a `.nmark` div (CSS 79 to 97) written at line 2712
with a class `k-<kind>` and a body that is a glyph from `NODE_FACE` (2637 to 2644): vein
`◆`, pocket `○`, cache `▣`, shrine `✠`, hazard `⚠`, empty `·`, plus `?` when the reveal
level is `hidden` (2694) and one 6 px ore dot per lump when a vein is fully revealed
(2707, that art is sheet 03). Size: `min-width:26px; height:18px; border-radius:9px;
max-width:42px`, 10 px glyph, 1 px border in the kind colour, ground `rgba(8,9,13,.92)`,
and a 1 px tie line 20 px past each side (`.nmark:before`, line 99). States: `.spent`
(`n.used || n.mined`, opacity .32 and desaturated, line 95), `.heart` (amber red glow, line
96), `.k-hidden` (dashed, line 94). To use sprites: blank the glyph and give each
`.nmark.k-*` and `.nmark.k-*.spent` a background cell at 24x24, keeping the 18 px box (the
cell may overhang the box by 3 px, the bore is 42 wide and the box is centred).

**Surprises found here:** an air pocket and a lamp pocket draw the same `○` even though
`n.pocketKind` is on every node (line 841); a one word patch at 2712 (`'k-pocket-' +
n.pocketKind`) separates them. All 18 shrines draw the same `✠`. Three hazards draw the
same `⚠` (sheet 05). The `empty` glyph is a middle dot at opacity .45, which at 18 px is
invisible.

**Shape law:** at a 3 m gap two markers are 18 px apart and touch. Each kind must be a
different SILHOUETTE at 18 px: diamond (vein), ring (pocket), box (cache), cross (shrine),
triangle (hazard), dot (empty), question mark (hidden). Spent is the same silhouette
cracked open and darkened, never a lighter copy.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, small
objects set into a mine shaft wall, each one a bold single silhouette.
Row 1: (1) VEIN, a fat diamond of raw ore embedded in slate 2B2F38 rock, amber F0A742 rim
glint; (2) VEIN WORKED, the same diamond hollowed out and cracked, dark 101219 inside, no
glint; (3) AIR POCKET, a round ring shaped hollow in the rock with a pale sage 8FBF6A
breath curling out; (4) LAMP POCKET, the same round hollow with a dark oily C98A2A pool
and one amber drip.
Row 2: (5) POCKET SPENT, the round hollow empty and dusty, edges crumbled; (6) CACHE, a
square tin box with a strap, brass C8A84B corners, lid shut; (7) CACHE SPENT, the same tin
box open and empty, lid hanging; (8) SHRINE, a small carved cross shaped niche in the
rock with a violet B88CF0 candle glow inside.
Row 3: (9) SHRINE SPENT, the same niche dark, candle out, a wisp of smoke; (10) HAZARD, an
upward triangle crack in the rock leaking ember red E05C4E light; (11) HAZARD SPENT, the
same crack dark and settled, loose rubble below it; (12) EMPTY ROCK, a single small pale
E8DCC8 chip in plain slate, almost nothing.
Row 4: (13) HIDDEN, a rough question mark shape scratched into the rock in muted 8A9178
chalk; (14) HEARTSTONE, a heart shaped lump of warm FF7A6A stone glowing from inside,
amber halo; (15) HEARTSTONE TAKEN, the heart shaped socket left empty, faint pink rim;
(16) TIE LINE, a short horizontal wooden ledge peg in 7A5C33 timber for the line that ties
a marker back to the shaft wall.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 03: Ore lumps and the drop glint

**PATCH-REQUIRED wiring:** `oreDot(col)` at line 2617 returns a 12x12 square span
(`.oredot`, CSS 196, radius 3) coloured by `ORE_BY_KEY[key].col`; it is used in the node
card ore rows (2755) and the cargo drawer rows (2864). In the shaft each lump of a revealed
vein is a `.od` 6 px circle (CSS 97, written at 2707). The result manifest (2921, 2929)
and the logbook worst line (3062) name ores in text only. The drop glint is `.glint` (CSS
281, made at 3142): a 10 px warm circle scaling to 26 px over 620 ms at screen centre. To
use sprites: change `oreDot` to return `<img class="oredot" src="deepwell-03-<key>.png">`
(or a sheet offset by key index) and give `.od` the same cell at 6 px. Sizes: 12 px in
cards, 6 px in the shaft, so render cells at 256 and let the browser downscale.

**Shape law:** at 6 px only the colour survives, which is fine because the colours are
already the game's language (you can see gold four nodes down). At 12 px each ore must ALSO
differ by silhouette so a colourblind player can tell copper from gold: slag crumbly blob,
copper ribbed nugget, iron blocky cube, silver flat leaf, cobalt twin crystal, gold rounded
nugget, beryl hexagonal prism, uranite spiky cluster, voidglass long shard, heartstone
heart shaped lump.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, raw
ore lumps as game pickups, each filling most of its cell, lit from the upper left by one
amber lamp.
Row 1: (1) SLAG, a crumbly porous grey blob in 7C7466 with darker pits; (2) COPPER, a
ribbed rust orange nugget in C2703C with a green tinge on one edge; (3) IRON, a blocky
near cube of dull steel 9AA3AD with rusty seams; (4) SILVER, a flat leaf shaped flake in
bright D8DDE6 with a mirror highlight.
Row 2: (5) COBALT, a pair of twin blue crystals in 4A76C8 grown from one base; (6) GOLD,
a fat rounded nugget in F0C04A with a soft warm glow; (7) BERYL, a clean six sided prism in
sea green 5FD6B0, translucent; (8) URANITE, a spiky cluster in acid green 9AD64A that
glows faintly on its own.
Row 3: (9) VOIDGLASS, a long dark violet B98CF0 shard with a starry inner depth; (10)
HEARTSTONE, a heart shaped lump of warm FF7A6A stone lit from inside with an amber halo;
(11) DROP GLINT FRAME 1, a small warm FFD9A0 point of light with four short rays; (12)
DROP GLINT FRAME 2, the same glint bloomed to twice the size and fading, soft edges.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 04: Strata rock tiles and backdrops (the BACKGROUND sheet)

**PATCH-REQUIRED wiring:** `renderShaft` draws the rock as six flat colour divs, one per
band, at line 2669: `left:0; right:0` inside the 68 px gutter, `height = (t1 - t0) * 6` px,
`background: sb.col`, opacity .9. Band heights at 6 px per meter: topsoil 120 px (0 to 20),
shale 180 px (21 to 50), dark seam 240 px (51 to 90), wet shelf 300 px (91 to 140), the
glass 360 px (141 to 200), below unbounded. To use art: change that line to
`background:url(deepwell-04-<key>.png) center top / 68px auto repeat-y` and the tiles MUST
tile vertically. Over the bands: `.bore` (CSS 67, line 2671) is a 42 px wide dark gradient
with 1 px cream walls; `.rockrow` (57, 2675) is a 2 px line every 30 px; `.tick` (73, 2676)
is a 5 px ruler notch with a 9 px number every 60 px in the left 22 px lane; `.strataSeam`
(72, 2684) is a 1 px cream line at each band roof; `#recLine` (59, 2717) is a 2 px dashed
amber line at the all time record depth; `.dwdust` (338) is four radial gradient motes
drifting 24 px over 9 s. Behind everything `#shaftBand` (52, set at 2651) is a full screen
wash of the band colour at opacity .13, and it is almost entirely covered by opaque cards,
so a full bleed backdrop would only show in the 78 px gutter column and the 12 px margins.
Spend on the gutter tiles first; the washes are the last row here and optional.

**Shape law:** the tiles sit behind 18 px markers and a 28 px miner, so rock detail must
stay LOW contrast (nothing in a tile brighter than the band colour plus 12 percent) or the
markers vanish. Each band must be tellable from the next by TEXTURE at 68 px wide: loose
soil, flat layered shale, near black seam with pinprick coal glints, dripping wet stone,
glassy violet facets, deep red haze.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A tile sheet on flat magenta FF00FF with generous magenta gutters between elements, all
rock textures dark and low contrast, no object brighter than its own base colour by more
than a little, every vertical strip seamlessly repeatable top to bottom.
Row 1, six tall rock strips, each 256x1024 pixels, unlit mine rock in cross section:
(1) TOPSOIL, loose brown earth 3A2F1E with pebbles and a few pale root threads;
(2) SHALE, flat stacked grey slate layers 2B2F38 with thin horizontal partings;
(3) DARK SEAM, near black coal 14161D with tiny scattered glints;
(4) WET SHELF, dark teal stone 14262C with drip streaks and a wet sheen;
(5) THE GLASS, bruised violet 231B33 rock with glassy angular facets catching faint light;
(6) BELOW, deep dried blood red 2A0F14 rock with a slow haze, no detail at all.
Row 2, five square seam transition tiles, each 256x256 pixels, the top half one rock and
the bottom half the next with a crisp jagged boundary and a thin pale E8DCC8 seam line:
(7) topsoil into shale, (8) shale into dark seam, (9) dark seam into wet shelf, (10) wet
shelf into the glass, (11) the glass into below.
Row 3, bore and ruler pieces: (12) LEFT BORE WALL, a 64x1024 strip of cut rock face with a
1 pixel pale cream edge on its right side, seamless vertically; (13) RIGHT BORE WALL, the
mirror of it; (14) RULER STRIP, a 96x1024 strip of dark rock with small chalk notches every
sixty pixels and a slightly larger notch every one hundred twenty, seamless vertically;
(15) RECORD LINE, a 256x32 strip of a dashed amber F0A742 chalk line with a tiny arrow
head at the right end; (16) ROCK ROW, a 256x8 strip of a faint pale hairline crack.
Row 4, four small square pieces, each 128x128 pixels: (17) a single drifting amber dust
mote with a soft halo; (18) a cluster of three motes; (19) a water drip mid fall in pale
teal 6FB1D6; (20) a tiny coal glint in warm FFD9A0.
Even spacing, nothing touching element edges, no text anywhere.

---

## Sheet 05: Hazards

**PATCH-REQUIRED wiring:** three hazards exist in `HAZARDS` (777 to 781): GAS POCKET,
COLLAPSE, FLOOD. Every node carries `n.hazKind` (line 843) and becomes a hazard when
`hazRoll < hazardRateAt(depth)` (`nodeType`, 965). On arrival (`resolveArrival` 1084 to
1099) one of three things happens: `hazard` (braces lost, `handleEvent` 3116 toasts the name
and shakes), `hazardShrug` (3120, THE BRACES HELD), `hazardNull` (3121, THE CHARM ATE IT).
Today NOTHING visual distinguishes gas from flood: the shaft marker is the same `⚠`, the
node card (2766) reads HAZARD / It already happened for all three, and only the toast text
differs. Patch: at 2712 add `' k-haz-' + n.hazKind` when `kind === 'hazard'` and give the
three classes their own cell (the marker body is 18 px); in `nodeCardHTML` 2766 return a
40 px `<img>` in the body by `n.hazKind`; in `handleEvent` 3118 prefix the toast with a
20 px icon. Whether a NOT YET STRUCK hazard shows its kind is a design call (it reveals
information the `type` level does not promise), so the unstruck marker is one generic cell
and the kind only appears on the spent marker and the card.

**Shape law:** at 18 px the three struck markers must differ by silhouette, not colour:
gas is a rising wisp, collapse is a wedge of fallen blocks, flood is a flat water line
with a ripple. The two saves (braces held, charm ate it) are a timber and a talisman.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 3 columns, each cell 256x256 pixels on flat magenta FF00FF, mine
hazards as bold single silhouettes, the danger colour is ember red E05C4E and nothing else
in the cell is red.
Row 1, GAS POCKET: (1) MARKER, a sour yellow green 9AD64A wisp curling up out of a crack;
(2) STRUCK, the same crack dark with the wisp thinned to a grey 8A9178 trace and a fallen
timber; (3) CARD ICON, a large sour cloud bleeding from a fissure in the wall, a single
amber lamp beam cutting through it.
Row 2, COLLAPSE: (4) MARKER, a wedge of three slate blocks mid fall from a broken roof
beam; (5) STRUCK, the blocks settled in a heap with the beam snapped; (6) CARD ICON, a
mine roof letting go, blocks and dust, a broken timber prop, red E05C4E light in the gap.
Row 3, FLOOD: (7) MARKER, a flat pale teal 6FB1D6 water line with one ripple ring; (8)
STRUCK, the water line dropped to a dark damp stain with a puddle; (9) CARD ICON, cold
water pouring from a wall seam over a pair of boots, teal 6FB1D6 spray.
Row 4, the saves and the unknown: (10) THE BRACES HELD, a stout timber prop in 7A5C33
wood standing under a bowed roof with sage 8FBF6A dust settling around it; (11) THE CHARM
ATE IT, a small carved bone talisman on a cord glowing violet B88CF0 as a red crack closes
behind it; (12) UNSTRUCK HAZARD, an upward triangle crack in the rock leaking ember red
E05C4E light with no hint of which kind it is.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 06: Shrine bargain emblems

**PATCH-REQUIRED wiring:** a shrine node sets `st.phase = 'shrine'` and `st.pending = id`
(1116 to 1119); `openShrine` (2877 to 2887) fills `#shrineTitle` with the title from
`SHRINES` (793 to 823), `#shrineNums` with the head, sub and body from `shrineText` (2457),
and shows `#shrineOvl` (HTML 464 to 469), a full screen overlay on a radial `#1a1206` to
`#08090d` ground (CSS 286) whose `.plate` is a centred column with NO image. Patch: add
`<img id="shrineArt" alt="">` as the first child of `.plate` (HTML 465) and at 2879 set
`$('shrineArt').src` from `id`; render at 128 px on the 347 px plate above the 12 px
letterspaced `#shrineName`. Ids never change (they are written into replay logs, line 807).
The refused state is `shrineAcceptable` (1130): `#shrineWarn` prints the reason and ACCEPT
disables; a stamp cell sits over the emblem then.

**Surprise found here:** eight of these bargains leave a run long FLAG behind
(`doubleVein`, `nullifyHazard`, `oreWeightBonus` from the oil and the tithe, `revealUntil`,
`emptyVeins`, `hazBonus` from the bright deal, `freeDescents`, `veinSense`) and the run
screen shows NONE of them; the only trace is a changed number on a button. A 20 px chip row
under `#recordRow` (HTML 417) built from `st.flags` in `render()` would reuse these emblems
as active effect badges. Flagged, not built.

**Shape law:** each emblem is an object, not a scene, and each pair that mirrors another
(the oil and the tithe, the counterweight and the pack) must be visibly the same object
reversed. Violet B88CF0 is the shrine colour and appears in every cell as the candle glow.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 5 columns, each cell 256x256 pixels on flat magenta FF00FF,
carved shrine emblems set in a small stone niche with a violet B88CF0 candle glow, each
emblem one bold object.
Row 1: (1) THE LUNG, a pair of lungs carved in stone with a cracked timber prop beside
them; (2) THE FAT SEAM, a swollen bulging vein of ore packed with amber F0A742 lumps; (3)
THE FENCE, an open hand of coins over an emptied sack; (4) THE OIL, a tin oil can dripping
into a lamp with a lead weight hanging from its handle; (5) THE LONG LOOK, a single wide
open eye carved in the rock looking straight down.
Row 2: (6) THE SPILL, a sack split at the bottom with ore lumps tumbling out; (7) THE
CHARM, a small bone talisman on a cord glowing violet; (8) THE SPARE BRACE, one stout
timber prop standing alone; (9) THE COUGH, an upward gust of wind from a shaft mouth with
one ore lump left behind on the floor; (10) THE TRANSMUTE, a lump half dull grey slag
7C7466 and half bright iron 9AA3AD split down the middle.
Row 3: (11) THE ADVANCE, a stack of coins above three hollow empty seam pockets; (12)
THE BRIGHT DEAL, a lamp blazing far too bright with a ring of ember red E05C4E warning
light around it; (13) THE BALLAST, a heavy dark lump left on the floor with a pale sage
8FBF6A breath rising from it; (14) THE TITHE, a coin being chiselled in half with a
feather floating beside it; (15) THE STRAIGHT DROP, a trapdoor floor of planks giving way
into black.
Row 4: (16) THE COUNTERWEIGHT, two timber props on one side of a balance and a shrunken
sack on the other; (17) THE DOWSER, a forked hazel dowsing rod held over three glowing
amber veins in the rock; (18) THE LAST BREATH, a single air bubble rising above a tall
stack of coins; (19) GENERIC SHRINE, the empty stone niche with its candle and no emblem;
(20) REFUSED, a heavy ember red E2574C chalk cross scratched over the empty niche.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 07: Landmarks of the Below

**PATCH-REQUIRED wiring:** six landmarks live in `DEEPS` (758 to 776) at 200, 230, 265,
300, 350 and 420 m. `resolveDeeps` (1061 to 1078) fires each once and `handleEvent` (3122
to 3129) flares the NAME in the HUD via `stampBand` (2731) and toasts the gain, then the
line. There is no picture anywhere: not in the shaft (`renderShaft` draws nothing at a
landmark depth), not in the flare, and the surface ladder (`renderShop` 3031 to 3040) is
13 px text rows that print `?????` until reached. Patch three places: in `renderShaft`
after the seams (2686) add `<div class="deepmark">` at `y(D.depth)` for every `D` in
`DEEPS` inside the window, 42 px wide in the bore, showing the LOCKED cell until
`st.deeps` contains its key; at 3036 prefix each ladder row with a 20 px icon (locked cell
when `!hit`); and let `stampBand` accept an image for a 40 px vignette beside the name.
Reach rates from BUILD-NOTES section 9.3: 65 percent of full kit dives touch the sill,
1 percent the door, so these are the rarest art in the game and the locked cell is the one
players will actually see.

**Shape law:** each landmark is a PLACE seen in cross section in the 42 px bore, and the
locked cell must read as "something is here" without hinting which: a sealed stone with a
question mark chalked on it.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, six
underground landmarks seen in cross section as if cut into the side of a mine shaft, deep
red 2A0F14 rock around each, one small amber lamp lighting each scene.
Row 1: (1) THE SILL, a ledge of squared cut stone blocks jutting into the shaft, clearly
built by hands, moss free, dry; (2) THE DRY RIVER, a round tunnel worn perfectly smooth
running off into the dark in both directions, its floor rippled like a dry riverbed; (3)
THE LAMP ROOM, a chamber with rows of dark iron lamps hanging on hooks along the wall and
ONE of them still burning amber; (4) THE OLD SEA FLOOR, a slab of rock pressed flat with
spiral shells and fish bones fossilised into it, pale E8DCC8 on dark.
Row 2: (5) THE QUIET, a perfectly still chamber of smooth dark rock with no drips, no
cracks and no dust, only a lamp beam and its shadow; (6) THE DOOR, a rough stone door
frame standing in the rock with pure black nothing on the other side of it; (7) LOCKED, a
sealed slab of plain red rock with a rough chalk question mark scratched on it in muted
8A9178; (8) THE WELL KEEPS GOING, a long downward chalk arrow on dark rock fading into
black at the bottom.
Even spacing, one scene per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 08: Gear and meter icons

**PATCH-REQUIRED wiring:** the six shop tracks (`CONFIG.SHOP`, 636 to 643: TANK, LAMP,
PACK, BRACE, DRILL, ASSAY) render at 3019 as `.track` rows (CSS 356) with a name, a blurb
and level pips (`.lv i`, 22x6 px, amber when on, line 361) and a `.buy` button (92x52)
that reads a cost, MAXED, or is disabled; there is no icon slot, add a 40 px `<img>` before
`.grow`. The briefing gear chips (`.bgear`, 3172 to 3177) list TANK, LAMP, PACK, BRACES in
11.5 px text; put a 14 px icon in each. The four run meters (HTML 425 to 428, `.meter .lab`
10.5 px) are AIR, LAMP, PACK, BRACES; 14 px icons before the label. Braces are `.pip`
16x16 squares (CSS 184, written at 2820), sage filled when on, hollow when off; give both
states a cell. Cash is `#cashBig` 38 px (3012) and `CASH` on the buy button; a coin cell.
The action buttons (DESCEND, MINE, WINCH OUT, CARGO) carry 17 px labels and no glyph; the
down arrow, pick, winch hook and sack cells go beside them at 18 px.

**Shape law:** these are 14 to 40 px glyphs on dark plates; one object each, no scene, and
the brace ON and OFF pips must differ by shape (a whole timber against a snapped one), not
just fill.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, mining
gear icons, each one bold object filling most of its cell, worn brass and dark iron with
one amber highlight.
Row 1: (1) TANK, a stout brass air tank with a gauge and a hose loop, pale teal 6FB1D6
gauge face; (2) LAMP, a dark iron miner's lamp with an amber F0A742 flame behind glass;
(3) PACK, a heavy canvas sack with a leather strap, lumpy with ore; (4) BRACE ON, a whole
sage 8FBF6A tinted timber prop standing straight.
Row 2: (5) BRACE OFF, the same timber snapped in two and greyed to 3A3F4D; (6) DRILL, a
hand cranked rock drill with a chisel bit and an amber spark; (7) ASSAY, a brass hand
lens over a sliver of ore, the glass showing a magnified glint; (8) CASH, a single thick
gold F0C04A coin with a rough struck edge.
Row 3: (9) AIR, a single round pale sage 8FBF6A breath bubble with a smaller one above it;
(10) CARGO EMPTY, the canvas sack slack and folded; (11) CARGO FULL, the canvas sack
bulging with amber and grey lumps showing at the mouth; (12) PICK, a mining pick head on a
short haft, iron and 7A5C33 wood.
Row 4: (13) DOWN, a heavy chalk arrow pointing straight down in cream E8DCC8; (14)
WINCH, an iron hook on a coiled rope loop pointing up; (15) MAXED, a small brass seal with
a raised star, no letters; (16) DAILY SHAFT, a sun disc in warm FFD9A0 half sunk behind a
well head.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 09: Screens and backdrops

**DROP-IN and PATCH wiring:** all DOM. The surface screen (`#shopScreen`, HTML 443 to 479)
opens with a 48 px `.ovlhead` row and a `.card` holding CASH ON HAND; there is no art
anywhere on it and it is the screen every session starts on (`boot` 3444), so a 347x140
header plate goes as the first child of `.scrollpane` (HTML 449). The briefing (`#dwBrief`,
built at 3165, CSS 317 to 329) is a fixed full screen on `rgba(5,4,3,.97)` with a 14 px
letterspaced heading THE CONTRACT or THE DAILY SHAFT; a 400x120 plate goes above `.bh`.
The winch beat (`#dwLower`, 3186, CSS 331 to 335) is a 2 px rope 227 px tall growing for
800 ms; replace `.rope` with a 120x400 strip and keep the `scaleY` keyframe. The result
overlay (`openResult` 2912) prints one of three verdicts into `#resTitle` (30 px): SURFACED
(2924), THE ROOF CAME DOWN or THE AIR RAN OUT (2933); a 347x160 plate above the title,
chosen by `o.reason`. The two fades (`dwFlash` 2892, CSS 310 and 311) are full screen
gradients for 460 to 620 ms; 540x960 vignettes replace them. The three overlay heads (THE
GREED LEDGER 457, COMPANY LOGBOOK 481, OPTIONS 488) are 15 px text on `.ovl` grounds; a
347x64 band each. Painted plaque rule: the art fills the plate, the text stays HTML, and
the centre band of every plate stays calm.

**Shape law:** the three verdict plates must be tellable apart with the title covered:
daylight from above (surfaced), a fallen roof (collapse), a guttering lamp in red dark
(air). The surface header is the only daylight in the game and must look like it.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A screen art sheet on flat magenta FF00FF with generous magenta gutters between elements,
every plate a wide painted panel with a calm centre band left open for overlaid text.
Row 1, one SURFACE HEADER plate 1040x420 pixels: a timber well head and winch house at
dusk on flat scrubland, the shaft mouth a black square in the ground, one lit window in
amber F0A742, sky a bruised 231B33 violet fading to 0A0B0F at the top, the only daylight
in the whole set.
Row 2, three VERDICT plates, each 1040x480 pixels: (1) SURFACED, the view straight up a
shaft to a square of pale FFD9A0 daylight with a rope hanging down into it; (2) THE ROOF
CAME DOWN, a shaft choked with fallen slate blocks and a snapped timber, dust hanging, one
lamp beam buried; (3) THE AIR RAN OUT, a lone lamp guttering to a dim C98A2A ember in a
narrow shaft, deep red 3C0804 dark closing in from every side.
Row 3: (4) THE CONTRACT plate 1200x360 pixels, a rolled parchment contract with a wax seal
in amber, a pick and a coin laid across it on dark timber; (5) THE DAILY SHAFT plate
1200x360 pixels, the same parchment with a small sun disc pressed into the wax; (6) WINCH
STRIP 240x800 pixels, a taut hemp rope 7A5C33 with an iron hook at the top and a small
wooden cage seat at the bottom, seamless in the middle.
Row 4, three overlay head bands, each 1040x192 pixels: (7) THE GREED LEDGER, a row of ore
lumps on a brass scale pan against dark timber; (8) COMPANY LOGBOOK, a worn leather ledger
lying open with a pencil, pages blank; (9) OPTIONS, a brass valve wheel and a lamp dial on
a dark iron panel.
Row 5, two full screen vignettes, each 540x960 pixels: (10) DEATH FADE, near total black
with a deep red 3C0804 glow low in the centre and blocks of slate closing in from the
edges; (11) UP FADE, a rising wash of amber F0A742 from the bottom brightening to cream
FFEBBE at the top with a faint square of daylight.
Row 6, one cell 256x256: (12) an empty dark timber plaque with rounded corners and a thin
amber F0A742 rule, for any panel that needs a ground.
Even spacing, nothing touching element edges, no text anywhere.

---

## Sheet 10: UI chrome

**DROP-IN wiring (CSS only):** every button is a DOM element with a CSS ground; art fills
the button as `background`, the label stays HTML. Measured at 375x667:
`#btnDescend` 285x60 (CSS 218, plate `#1f2430` to `#171a23`, warm label);
`#btnMine` and `#btnAscend` 138x60 each (`.big` 204, gap 8, amber and sage labels);
disabled `.big` 214 to 217 (plate `#101219`, label `#5c6270`, reason `#7d8493`);
`#btnCargo` 285x52 (222); `.btn` 347x52 full width or 169x52 in a `.btnrow` (264);
`.btn.gold` GO DOWN and ACCEPT (266); `.btn.sage` WALK AWAY (267); `.buy` 92x52 with
`.can` amber, disabled at .45, and MAXED (363 to 367); `.switch` 70x48 on sage, off muted
(384 to 386); `#cargoOvl .drop` 78x48 (277); `.iconbtn` 48x48 with a 19 px glyph for
✕ (405, 445, 471, 482, 489), ⚙ (409, 447), ☰ (446); `#btnInstall` 48 tall amber tint
(239); `.card` 347 wide radius 14 (260); `#nodecard` 285 wide with a 3 px amber left rule
(189); `#margin` 285 wide with the 8 px `#marginBar` (147) whose fill runs sage to amber,
amber to warm under 30 percent margin, and danger when the climb cannot be paid (2803);
`.bar` 7 px meter tracks (178); `#toast` up to 330 wide, radius 12 (377); `.lgmark` 9 px
chips DEEPEST OF THE TEN sage and RICHEST OF THE TEN amber (232, 3059 to 3060); the
odometer `#odo` at 74 px, each `.digit` 46x68 (132, 135) with a rolling strip; the app
icon at `icon-512.png` (existing: an amber trapezoid shaft over four strata stripes,
generated, keep the trapezoid motif). The plaque rule: paint FILLS the button edge to edge,
the centre band stays calm for the label.

**Shape law:** the three big run buttons must differ by plate shape and end ornament
(DESCEND wide with a down chevron at each end, MINE with a pick at the left end, WINCH OUT
with a hook at the right end) and every disabled plate must read as the same shape gone
dark and dusty, not as a lighter ghost. Icon buttons are a single glyph on a bare 48 px
disc.

**PROMPT (copy-paste):**

Deepwell style: lamplit mine shaft game art, matte flat shapes with chiselled rock edges
and a faint chalk grain, near black ground 0A0B0F, one warm amber lamp F0A742 as the only
light in the frame falling off softly to cream FFD9A0, cold slate 2B2F38 and bruised violet
231B33 rock, sage 8FBF6A only for what is safe and ember red E2574C only for what is not,
clean heavy silhouettes that still read at sixteen pixels, tense and quiet, no text, no
watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A UI sheet on flat magenta FF00FF with generous magenta gutters between elements, dark
iron and timber plates with rounded corners and a quiet centre band for overlaid text.
Row 1, four wide button plaques, each 1140x240 pixels, painted edge to edge: (1) DESCEND,
a dark slate 1F2430 plate with a small cream chevron pointing down at each end and a faint
rope texture; (2) DESCEND OFF, the same plate gone dusty 101219 with the chevrons dimmed;
(3) CARGO, a dark 171A22 plate with a canvas sack silhouette at the left end; (4) GO DOWN,
a gold F0A742 to C4832C plate with a hammered brass edge and a small well head at the
right end.
Row 2, six half width plaques, each 552x240 pixels: (5) MINE, a dark 1B1E27 plate with an
amber pick head at the left end; (6) MINE OFF, the same plate dusty and dark; (7) WINCH
OUT, a dark plate with a sage 8FBF6A iron hook at the right end; (8) WINCH OUT OFF, the
same plate dusty; (9) ACCEPT, the gold plate at half width with a wax seal at the right
end; (10) WALK AWAY, a dark plate with a sage 3D4F33 rim and two small boot prints at the
left end.
Row 3, small controls: (11) BUY plate 368x208 pixels dark with an amber rim; (12) BUY OFF
368x208 dark and dusty; (13) MAXED 368x208 dark with a brass seal; (14) SWITCH ON 280x192
dark with a sage rim and a small lit lamp dot; (15) SWITCH OFF 280x192 dark with a grey
rim and the lamp dot out; (16) DROP 312x192 dark with a dull 4A3B34 rim and a tiny
falling lump; (17) INSTALL 1140x192 a very dark plate with a faint amber tint and a small
house shaped notch at the left end.
Row 4, four round icon discs each 192x192 on bare dark 14161D: (18) CLOSE, a cream X;
(19) OPTIONS, a brass valve wheel; (20) LOGBOOK, three stacked ledger lines; (21) NOT
NOW, a small cream X on a bare disc with no rim.
Row 5, frames and plates: (22) CARD FRAME 1388x400 pixels, a dark 14161D panel with a 1
pixel 2A2F3C rim and rounded corners, empty; (23) NODE CARD FRAME 1140x400 pixels, the
same panel with a 3 pixel amber F0A742 rule down its left edge; (24) MARGIN BAR 1140x32
pixels, an iron trough with a slot, and beside it three fill strips each 1140x24: sage
8FBF6A to amber F0A742, amber to warm FFD9A0, solid ember E2574C; (25) TOAST PLATE
1320x160 pixels, a dark 14161D pill with a thin rim; (26) ODOMETER DIGIT FRAME 184x272
pixels, a brass rimmed dark window for one rolling digit; (27) LOG CHIP SAGE and LOG CHIP
GOLD, two small 320x64 pill outlines, one sage 8FBF6A, one amber F0A742; (28) APP ICON
512x512 pixels, an amber F0A742 trapezoid shaft mouth narrowing downward over four dark
strata stripes with a single lamp glow at the bottom, no letters.
Even spacing, nothing touching element edges, no text anywhere.

---

## Full animation sets

A character is not done when it can hop. Deepwell has ONE character, the miner, and he is
on screen for every second of every run, so his set is the whole budget:

| character | idle | move | act | hit | die | win | extra |
|---|---|---|---|---|---|---|---|
| The miner (sheet 01) | 4 frames breathing | 4 descend, 4 winch out | 4 mine (pick swing) | 2 flinch, 2 braces held | 2 air ran out, 2 roof came down | 2 surfaced | 2 lamp out, 1 at the mouth, 1 replay ghost |

That is 30 miner cells plus 2 lamp pool cells, 32 in the sheet. Every row is driven by CSS
`animation: steps(N)` because the game never redraws between taps; a row that is missing
becomes a frozen frame, not a bug you can see in a test, so all of them ship together.

Non character sets that still need more than one cell:
- Hazards (sheet 05): unstruck, struck, per kind, plus the two saves. Static, 2 states.
- Node markers (sheet 02): live and spent for every kind. Static, 2 states.
- Lamp pool (sheet 01): 3 sizes chosen by the lamp fraction, swapped, not tweened.
- Drop glint (sheet 03): 2 frames over 620 ms.
- Ore lumps, landmarks, shrine emblems, gear icons, screens, chrome: single cells.

---

## Coverage: every draw function and which sheet covers it

Everything in the VIEW, INPUT and BOOT layers (lines 2500 to 3464) that puts pixels on
screen, and the CSS only visuals, mapped to a sheet. The SIM and TEST layers (660 to 2456)
draw nothing by design (BUILD-NOTES grep gate: no `document` inside the SIM markers).

| function or CSS visual | line | covered by |
|---|---|---|
| `renderShaft` band fills | 2669 | 04 |
| `renderShaft` `.bore` walls | 2671 | 04 |
| `renderShaft` `.rockrow`, `.tick` ruler | 2675, 2676 | 04 |
| `renderShaft` `.strataSeam` | 2684 | 04 |
| `renderShaft` `.nmark` per node, `NODE_FACE` glyphs, `k-hidden`, `.spent`, `.heart` | 2637, 2689 to 2712 | 02 (kind and state), 03 (ore dots), 05 (hazard kind, patch) |
| `renderShaft` `#recLine` | 2717 | 04 |
| `renderShaft` `#lampGlow` | 2722 | 01 (lamp pool) |
| `renderShaft` `#youMark` | 2725 | 01 |
| `renderShaft` landmark marker (does not exist yet) | after 2686, patch | 07 |
| `#shaftBand` full bleed wash | 2651 | 04 (optional row, mostly covered by opaque cards) |
| `.dwdust` motes | CSS 338 | 04 |
| `stampBand` seam and landmark flare in the HUD | 2731 | 10 (HUD), 07 (landmark vignette, patch) |
| `nodeCardHTML` kind, title, body, ore rows | 2749 to 2771 | 03 (ore dots), 05 (hazard icon, patch), 10 (card frame) |
| `setMeterText`, meter bars, pips | 2773, 2812 to 2821 | 08 (icons, pips), 10 (bar tracks) |
| `render` odometer, strata name, record row | 2787 to 2793 | 10 |
| `render` AIR TO SURFACE bar and note | 2794 to 2810 | 10 |
| `render` action button labels and reasons | 2827 to 2848 | 08 (glyphs), 10 (plaques) |
| `render` CARGO button | 2849 to 2850 | 08, 10 |
| `setOdo`, `setOdoRoll` rolling digits | 2591 to 2610 | 10 |
| `toast` | 2612 | 10 (plate), 05 and 07 (icons, patch) |
| `oreDot`, `oreColor` | 2617, 2618 | 03 |
| `revealOf` (decides which marker cell) | 2624 | 02 |
| `renderCargo`, `openCargo` | 2857, 2874 | 03 (lumps), 09 (head), 10 (rows, DROP) |
| `openShrine`, `#shrineOvl` | 2877, CSS 286 | 06 (emblem, patch), 10 (ACCEPT, WALK AWAY) |
| `dwFlash` death and up fades | 2890, CSS 310, 311 | 09 |
| `dwCount` payout tween | 2896 | 10 (odometer frame) |
| `dwJolt`, `shake` | 2905, 3133 | 01 (hit frames carry the beat) |
| `openResult` three verdicts, manifest, knife, log | 2912 to 2965 | 09 (verdict plates), 03 (manifest names could carry lumps), 10 (card, buttons) |
| `renderInstallRow`, `#installRow` | 2989, HTML 470 | 10 |
| `renderShop` cash, tracks, buy, daily card, descent ladder | 3009 to 3040 | 08 (icons, pips, coin, daily badge), 07 (ladder icons, patch), 09 (surface header), 10 (buy, cards) |
| `renderLog` stats, lines, marks, replay button | 3042 to 3076 | 10 (chips, card), 09 (head) |
| `handleEvent` toasts and flares per event | 3095 to 3131 | 01, 05, 07 |
| `glint` | 3142 | 03 |
| `startRun` briefing `#dwBrief` and gear chips | 3165 to 3181 | 09 (contract plates), 08 (chips) |
| `startRun` winch beat `#dwLower` | 3186 to 3187 | 09 (winch strip) |
| `toSurface`, `playReplay` screen switches | 3254, 3278 | 09, 01 (replay ghost) |
| `openOpts`, `syncOpts` switches, slider, seed row | 3410 to 3420 | 10 (switches, COPY LINK, LEAVE), 09 (head) |
| `#strataName.stamped` keyframe | CSS 113 | 10 |
| `runTestPanel` | 3448 | none, dev only at `?test=1` |
| `wire`, `boot`, `finishRun`, `persistRun`, `shareString`, `doShare`, `doInstall`, `dismissInstall`, audio functions | various | no pixels, no art |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `manifest.webmanifest` | files | 10 (app icon cell) |

Things the code has that have NO visual today, all named above so they are not lost:
three hazard kinds drawn identically (05), air and lamp pockets drawn identically (02),
eight run long bargain flags with no HUD trace (06), six landmarks with no picture (07),
the lamp out state with no screen darkening (01), a replay that looks like live play (01),
a column that snaps 18 to 36 px per tap with no motion (01), and four saved stats
(`surfaced`, `collapses`, `mined`, `deepest` in `defaultSave` 1390) that the logbook never
prints. None of those are art tasks on their own, but every sheet above leaves a cell for
the day they get wired.

## Fleet audit rows (Sep 04)

Added Sep 05 from the fleet art audit. Same rules as above.

| file | spec | replaces |
|---|---|---|
| `satellites/deepwell/art/deepwell-04-shale.png (and -topsoil, -darkseam, -wetshelf, -theglass)` | 136x480 transparent PNG each (68px wide in game at 2x), must tile seamlessly top-to-bottom, painted rock strata with seams and dust | Replaces the six flat colour divs at renderShaft line 2669. Wired by changing that line to `background:url(...) center top / 68px auto repeat-y`. |
| `satellites/deepwell/art/deepwell-01-miner.png` | 1024x2048 sheet, 32 cells, transparent; the miner rendered at 28px plus the lamp pool from 42x44 up to 284px wide | Replaces `#youMark`, currently a 16px amber CSS ring with a 5px dot - the only character in the game. |
| `satellites/deepwell/art/deepwell-09-surface-header.png` | 694x280 JPG (347x140 in game at 2x), full-bleed painted headframe and winch over the well mouth at dusk | Gives the surface screen a face. Drops in as the first child of `.scrollpane` per the spec's sheet 09; right now that screen opens with nothing but text. |
| `satellites/deepwell/art/deepwell-08-gear.png` | 640x640 sheet, 16 cells at 40px in game, transparent: tank, lamp, pack, brace, boots, charm, plus cash, sack, pick, winch, down arrow, maxed seal | Breaks the four identical shop rows apart - each one gets its own object instead of the same grey price box. |
