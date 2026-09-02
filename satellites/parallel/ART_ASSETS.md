# PARALLEL: art asset list

> Drive copy (the prompts, for the phone): https://docs.google.com/document/d/1nNi-NyYL1bts9pLvUVBYWORxSNY3OHaqanYe6zbi3II/edit  in 012Assets. This file is the source of truth; the Doc is regenerated from it.

Written from the code in `satellites/parallel/index.html` (2778 lines, single file, Sep 02 2026 copy), not from the build notes.

## What the game is

Two avatars share one set of four inputs: A (violet circle) obeys the input, B (amber diamond) walks the opposite way on LEFT and RIGHT, and both share JUMP and WAIT. Walls, spikes, keys, doors, thin floor, ice and one way plates stop one twin and not the other, and the level is won when A stands on the A door and B stands on the B door on the same tick.

## Render architecture (read this before making anything)

**There is no canvas in this game.** Everything is DOM and CSS:

- The board is `#board` (a `div`, background `#0d0f16`, 1px `#242836` border, 14px radius) containing `#layers`, a `.cellwrap` that `drawStatic()` (line 2111) fills with one absolutely positioned `div` per non empty tile plus the two avatar divs. `drawDynamic()` (line 2162) moves the avatars with `transform:translate()` and toggles the state classes (`.gone`, `.open`, `.got`, `.dead`). `drawGhosts()` (line 2143) adds the ghost dots. There is no draw loop: the DOM is re rendered on input, and CSS transitions (`.av{transition:transform .13s}`) do the movement.
- The level select sky is an inline `<svg id="sky">` whose markup is built as a string in `buildSky()` (line 2357). Stars are `<circle>`s, labels are `<text>`, constellation lines are `<line>`.
- Every overlay screen (`THE SKY`, `RUN LOG`, `OPTIONS`, `THE ONE RULE`) is a `.sheet` div, and the win card is `#wincard`. All chrome is CSS (`.btn`, `.chip`, `.big`, `.tog`, `.stat`, `.tierbar`).
- Every icon in the game is a font glyph: `☰ ⚙ ↺ ✕ ◀ ▲ ■ ▶ ▼ ⚷ ★ ●◆`. That is the single biggest reason it reads plain: nothing on screen was drawn for this game.

**Cell size (the unit everything scales with).** `fitBoard()` (line 1988):

```
availW = app.clientWidth - 14          (375 wide phone: 361)
budget = appH - bar - hud - 62 - 30    (vertical room, appH = min(app height, visualViewport - 10))
cell   = floor(min(availW / w, budget / h)), clamped 14..92
```

On a phone the board is width bound, so at 375x667:

| Board | Levels | cell | board |
|---|---|---|---|
| 8x8 | 1 to 10 | 45px | 360x360 |
| 10x10 | 11 to 35 | 36px | 360x360 |
| 12x12 | 36 to 100, daily, seed | 30px | 360x360 |

(`pagecheck.js` reports 344 with its DOM stub; the browser formula gives 360. Plan art that reads at **30px** and still looks good at 92px, the desktop cap.)

**Palette the CSS and the code actually use (hex):**

| Token | Hex | Where |
|---|---|---|
| bg | `#0a0b0f` | page |
| board | `#0d0f16` | `#board` |
| panel | `#14161d` | buttons, chips, cards, sheets |
| line | `#242836` | every hairline border |
| ink | `#e9e8f2` | text |
| dim | `#9a9ab4` | secondary text |
| accent (A, violet) | `#8b7cf6` | avatar A, exit A, seam, stars, toggles |
| warm (B, amber) | `#f3b562` | avatar B, exit B, par stars, drift line |
| B in the teach demo and move arrows | `#e8b05a` | `#teachDemo .td.b`, `spawnMoveArrows` |
| bad (spikes) | `#e0607a` | `.spike` |
| good | `#67d6a5` | declared, never used by any element |
| wall | `#2b3048` inset `#3e466e` at 55% | `.t-wall` |
| ice | `#4b7fa8` top lip `#9fd4ee` | `.t-ice` |
| crumble | `#4a3b2c` hairline `#7a6248`, 45 degree dark stripes | `.t-crumb` |
| door | `#7a5a2e` top lip `#b18a4a` | `.t-door` |
| one way plate | `#33405e` lip `#4d5f88` glyph `#a9bde8` | `.t-ow` |
| avatar glyph ink | `#0a0b0f` | `.av .body` |
| sky locked / open / cleared / par | `#222634` / `#3b4058` / `#8b7cf6` / `#f3b562` | `buildSky` |
| sky tier label | `#6f7590` | `buildSky` |
| pressed pad | `#232840` | `#pad button:active` |
| sheet scrim | `rgba(6,7,11,.94)` | `.sheet` |
| desktop column | `#0e1017` to `#0a0b0f` | `@media (min-width:760px) #app` |

**How art drops in.** Because it is DOM, a sprite is a CSS `background-image` (or an `<img>`/`<image>`), never `drawImage`. Per sheet:

| Sheet | Where the vector lives | What replaces it | In game px at 375x667 |
|---|---|---|---|
| 01 avatars | CSS `.av .body` lines 84 to 88 (`border-radius:50%` for A, `rotate(45deg)` square for B); markup pushed at `drawStatic()` lines 2134 to 2135 | set `.av.a .body{background:url(a.png) center/contain no-repeat;border-radius:0}` and same for B with the rotate removed, `inset:0` instead of `12%` if the sprite carries its own margin; `.dead` (line 89) becomes a second image | body is 76% of a cell: 34px (8x8), 27px (10x10), 23px (12x12); make the sprite fill the whole cell instead: 45 / 36 / 30 |
| 02 tiles | CSS `.t-wall .t-ice .t-crumb .t-crumb.gone .t-door .t-door.open .t-ow .spike .exit .keyt .keyt.got` lines 63 to 82; markup in `drawStatic()` lines 2118 to 2131; state classes toggled in `drawDynamic()` lines 2172 to 2184 | `background:url(...) center/100% 100%` per class; the state classes keep working unchanged. The one way glyph text (`◀ ▶ ▼ ▲` at lines 2128 to 2131), the key glyph `⚷` (line 2125) and the exit letters `A`/`B` (lines 2122 to 2123) become `color:transparent` or are removed from the markup (PATCH, four lines) | one full cell: 45 / 36 / 30 |
| 03 seam, ghosts, move arrows, hint | `#seam` lines 49 to 51, `#seam2` lines 56 to 58, `.ghost` lines 90 to 92, `.mvArrow` lines 204 to 206 with text set in `spawnMoveArrows()` line 2514, `.hint` keyframes lines 202 to 203, `.exit.lit` line 79 | seam becomes a repeating vertical strip image (`background:url() center/3px auto repeat-y`); ghost dot becomes a tiny image; move arrow becomes an image with the glyph text removed (PATCH at line 2519, `d.textContent = ch`) | seam 3px x board height (360); seam2 2px; ghost dot `max(3, floor(cell/5))` = 9 / 7 / 6px; move arrow one cell wide, font `cell*0.5` |
| 04 background | `#board` line 45, `body` line 26, desktop `#app` lines 217 to 221 | `background-image` on `#board` (under `#layers`, above nothing), on `body`, and on `#app` at 760px and up | board plate 360x360 (square, corners 14px); page 375x667; desktop column 700 wide, full height |
| 05 thumb pad | `#pad button` lines 129 to 133, markup lines 274 to 279 (`◀ ▲ ■ ▶` plus `A LEFT / JUMP / WAIT / A RIGHT` in `<small>`) | plaque as `background-image` per button id, glyph as an `<img>` or a second background layer; `:active` (line 131) and `.hint` (line 202) are second and third images | 4 buttons, each ~85px wide x `--padh`; `--padh` = 62 + floor(slack*0.72) capped at max(150, min(190, appH*0.19)): 98 to 105px at 375x667, 157 at 390x844 |
| 06 top bar, hud, ribbon, level card | `#bar .btn` line 37, `#title` line 40, `#hud` line 95, `#btnHint`/`#btnRestart` inline styles lines 256 to 257, `#ribbon .chip` lines 107 to 114, `#lvcard` lines 117 to 125 | `background-image` per element; the four hud words (`moves deaths off mirror par`) at lines 251 to 255 gain a 14px icon each via `::before` | bar buttons 48x48; title strip ~230x48; hud row 363x~44; HINT 48x48; restart 48x48; ribbon chip 48x48 minimum (wider with a star); level card 363x56; WATCH 48x48 |
| 07 THE SKY | `buildSky()` line 2357 to 2407: `<circle r=3.2/4.4/5.6>`, halo `<circle r=9>`, current ring `<circle r=11>`, `<line stroke=#8b7cf6>`, `<text>` tier labels | replace each `<circle>` push with `<image href="star_x.png" x=cx-12 y=cy-12 width=24 height=24>` (PATCH, ~6 lines); keep the transparent `.starhit` circle last so the 48px law survives | star cells 24x24 rendered (drawn at 6 to 11px today, so there is room to grow to 24); tier label plate ~120x14; the sky is 347 wide and ~1380 tall at 375, scrolls |
| 08 moments: win card, THE ONE RULE, toast | `#wincard` lines 177 to 184, markup 238 to 247; `#teachDemo` lines 192 to 199, markup 326 to 330; `#toast` lines 187 to 190 | `background-image` plates; the teach demo `●▶ / ◀◆` glyphs become an `<img>` strip | win card 359 wide x ~130; teach emblem 200x60; toast pill up to 330 wide x 40 |
| 09 OPTIONS and RUN LOG chrome | `.sheet` line 136, `.close` line 143, `.big` line 145, `.big.ghostb` line 147, `.tog` line 148, `input[type=range]` line 151, `.stat` line 163, `.tierbar .track/.fill` lines 167 to 169, `.runrow` line 170 | `background-image` per class | close 48x48; big button 347x52; toggle 70x48; slider track 8px tall; stat tile ~110x58; tier bar track 8px tall x ~220; run row 347x48 |
| 10 app icon | `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (files exist in the folder) | overwrite the three PNGs | 192, 512, 512 with the maskable safe zone |

**The style line, used once in every prompt below:**

> Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.

---

## Asset table

| id | what | draws in | in game px (375x667) | cells | priority |
|---|---|---|---|---|---|
| 01 | Avatars A and B, full animation sets | `drawStatic` line 2134, `drawDynamic` line 2169 | one cell: 45 / 36 / 30 | 2 rows x 8 | 1 |
| 02 | Tiles: wall, ice, crumble x2, door x3 x2 states, one way x4, spike, exit A x2, exit B x2, key x3 x2 states | `drawStatic` lines 2118 to 2131, `drawDynamic` 2172 to 2184 | one cell: 45 / 36 / 30 | 4 rows x 6 | 1 |
| 03 | Seam strip, drift line, ghost dots, move arrows, hint pulse, exit pulse | `#seam`, `#seam2`, `drawGhosts`, `spawnMoveArrows`, `.hint`, `.exit.lit` | seam 3 x 360, dot 6 to 9, arrow 15 to 22 | 2 rows x 6 | 2 |
| 04 | Background: board plate, phone backdrop, desktop column | `#board`, `body`, `#app` at 760px+ | 360x360, 375x667, 700x800 | 3 | 1 (board plate) / 2 (rest) |
| 05 | Thumb pad: four plaques, idle / pressed / hint, four glyphs | `#pad` lines 274 to 279 | 85 x 98 to 105 each | 3 rows x 4 | 1 |
| 06 | Top bar and hud: menu, options, restart, HINT, title plate, four hud icons, ribbon chip x4 states, level card plate, WATCH | `#bar`, `#hud`, `drawRibbon` line 2076, `drawLvCard` line 2055 | 48x48 buttons, 48x48 chips, 363x56 card | 3 rows x 6 | 2 |
| 07 | THE SKY: star x5 states, constellation link, tier plate, sheet backdrop | `buildSky` line 2357 | stars 24x24, sky 347 wide | 2 rows x 5 | 2 |
| 08 | Win card plate, BOTH DOORS emblem, PERFECT emblem, par star, teach demo emblem, toast pill, install nudge line | `onWin` line 2281, `#shTeach`, `toast` line 2192 | 359x130, 200x60, 330x40 | 2 rows x 4 | 2 |
| 09 | OPTIONS and RUN LOG chrome: close, big button x2 styles, toggle on/off, slider knob and track, stat tile, tier bar, run row, sheet scrim | `syncOpts` line 2621, `buildStats` line 2416 | listed above | 3 rows x 4 | 3 |
| 10 | App icon (any + maskable) | manifest, `<link rel=icon>` | 512x512 | 2 | 3 |

Ten sheets. Priority 1 is what is on screen every second of play: the two avatars, the tiles, the thumb pad, and the board plate under them.

---

## Sheet 01: Avatars A and B (full animation sets)

**PATCH-REQUIRED wiring:** today `.av.a .body` is a violet circle with a black `A`, `.av.b .body` is an amber square rotated 45 degrees with a black `B` (CSS lines 84 to 88), and the only state class is `.dead` (opacity .25 plus grayscale, line 89), which is shown for 150ms before the rewind (0ms under reduced motion, so it is effectively invisible). The SIM state carries more than the view shows: `s.fa` / `s.fb` are 1 on the jump tick, `ns.desync` fires on the tick where one twin moved and the other did not, `s.won` on the win tick, and the previous position in `G.lastA` / `G.lastB` gives facing. To play the sets, add four class toggles in `drawDynamic()` (line 2169, where `.dead` is set): `.air` when `s.fa`, `.face-l` / `.face-r` from the sign of `ax - lastA.x`, `.stuck` for one tick when `desync` and that twin did not move, `.won` when `s.won`. Each class points at a different cell via `background-position`. A gets `.face-r` when the input is RIGHT; B, being the mirror, gets `.face-l` on the same input, so the two sheets must be drawn facing opposite ways in the same cell index. Until patched, cells 1 and 2 of each row are a straight drop in for idle.

**Shape law:** A is round, B is a diamond, and that must survive at 23px with the letter removed. Never let B become a rounded square. States must differ by silhouette, not tint: airborne has the feet tucked and a lift line, stuck has the body leaned into an invisible wall with a flattened side, dead is a cracked shell and not a greyed copy, won is a lifted body with a crown of light. Both twins share one construction so they read as one creature seen in a mirror.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, avatar A, a round violet 8b7cf6 disc creature with a darker 5f52c4 rim, a soft inner glow toward c9c0ff at the top, and two tiny near black 0a0b0f eyes set to one side so it has a face:
(1) IDLE, resting, eyes forward.
(2) WALK FRAME 1, leaning right with a squash, eyes right.
(3) WALK FRAME 2, upright with a slight stretch, eyes right.
(4) JUMP, stretched tall and narrow, a thin violet lift line under it.
(5) FALL, squashed wide and low, a pair of tiny violet motion ticks above.
(6) STUCK, pressed against an unseen wall on its right, that side flattened, eyes squeezed.
(7) DEAD, the disc split by one clean crack, both halves dimmed to 4a4470, a little pale dust.
(8) WON, lifted a little, eyes closed happy, a ring of six small violet points of light around it.
Row 2, avatar B, the mirror of A as a diamond, an amber f3b562 rotated square with a darker c48a3a rim, a soft inner glow toward ffe0a8 at the top corner, the same two tiny 0a0b0f eyes set to the OPPOSITE side so it faces LEFT wherever A faces right:
(1) IDLE. (2) WALK FRAME 1 leaning left. (3) WALK FRAME 2 upright, eyes left. (4) JUMP stretched tall with an amber lift line. (5) FALL squashed wide with amber motion ticks. (6) STUCK pressed against an unseen wall on its LEFT, that side flattened. (7) DEAD, the diamond split by one crack, halves dimmed to 6b5430. (8) WON, lifted, eyes closed, a ring of six amber points of light.
Both creatures the same height, each about two thirds of its cell, centred, so the disc and the diamond read as one being in a mirror. Even spacing, one creature per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 02: Tiles (walls, ice, thin floor, doors, one way, spikes, exits, keys)

**DROP-IN wiring for the plain tiles:** each tile is one class with a flat CSS fill (lines 63 to 82), so `background:url(tile.png) center/100% 100% no-repeat` on `.t-wall`, `.t-ice`, `.t-crumb`, `.t-crumb.gone`, `.t-door`, `.t-door.open`, `.t-ow`, `.exit.a`, `.exit.b`, `.keyt`, `.keyt.got` changes them with no engine edit, and the state classes toggled in `drawDynamic()` (crumble `.gone` line 2174, door `.open` line 2179, key `.got` line 2184) keep working. **PATCH-REQUIRED for the glyph tiles:** the four one way plates carry a text arrow (`drawStatic` lines 2128 to 2131), the key carries `⚷` (line 2125), the two exits carry the letters `A` and `B` (lines 2122 to 2123), and the spike is a CSS `clip-path` zigzag inside an `<i>` (line 73). Set `color:transparent` on `.t-ow`, `.keyt` and `.exit`, and `display:none` on `.spike i`, then the images carry the whole tile. Cell is 45 / 36 / 30px; a tile is the full cell with no gap, so walls must tile seamlessly edge to edge, which is why the sheet asks for the wall as a flat slab with a 1px inner hairline and no rounded corners. **One thing the code cannot show today:** `KEY0/1/2` and `DOOR0/1/2` are three separate locks (`enterable` lines 752 to 754) but all three keys draw the same glyph and all three doors the same brown, so on a tier 7 board with three keys the player cannot tell which key opens which door. This sheet gives each lock its own shape; wire it with `data-k` / `data-d` (already in the markup) as `.keyt[data-k="1"]` and `.t-door[data-d="1"]` selectors.

**Shape law:** wall is a flat slab; ice is a slab with a bright lip and a sheen line; thin floor is a slab cracked into three plates; the open door is a hollow frame; the three locks are a triangle, a circle and a square carved into both the key and its door; one way plates are a chevron slab; the spike row is three hard teeth; exit A is a round violet portal and exit B is a diamond amber portal so the exits share the avatars' silhouettes. Every tile must still read at 30px.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A tile sprite sheet, 4 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF. Every tile is a full square that fills its cell edge to edge with sharp 90 degree corners and NO rounded corners, so it tiles seamlessly; the only exceptions are the spike, key and exit cells which sit inside the square.
Row 1, floors and walls:
(1) WALL, a flat dark slate slab 2b3048 with a 1px inner hairline 3e466e and a faint 12 percent lighter top edge, nothing else.
(2) ICE, a cold blue slab 4b7fa8 with a bright 9fd4ee lip along the top 8 percent and one thin diagonal sheen line.
(3) THIN FLOOR INTACT, a dry earth slab 4a3b2c with a 7a6248 hairline, split by two dark cracks into three plates.
(4) THIN FLOOR GONE, the same square as only a dashed 4a3b2c outline with the three plates fallen out, empty inside.
(5) ONE WAY LEFT, a steel blue plate 33405e with a 4d5f88 top lip and one large pale a9bde8 chevron pointing LEFT carved into it.
(6) ONE WAY RIGHT, the same plate with the chevron pointing RIGHT.
Row 2, more plates and the hazard:
(1) ONE WAY DOWN, the same plate with the chevron pointing DOWN.
(2) ONE WAY UP, the same plate with the chevron pointing UP.
(3) SPIKES, a row of three hard rose e0607a triangular teeth rising from the bottom of the cell, tips at 78 percent height, with a thin darker 9a3f52 base bar.
(4) DOOR ONE CLOSED, a warm wood slab 7a5a2e with a b18a4a top lip and a small carved TRIANGLE lock plate in the centre.
(5) DOOR TWO CLOSED, the same slab with a carved CIRCLE lock plate.
(6) DOOR THREE CLOSED, the same slab with a carved SQUARE lock plate.
Row 3, doors open and keys:
(1) DOOR ONE OPEN, only a dashed 7a5a2e frame with the triangle mark ghosted at 40 percent.
(2) DOOR TWO OPEN, the dashed frame with the circle mark ghosted.
(3) DOOR THREE OPEN, the dashed frame with the square mark ghosted.
(4) KEY ONE, a small pale e9e8f2 key with a TRIANGLE bow, floating in the cell with a faint glow, filling half the cell.
(5) KEY TWO, the same key with a CIRCLE bow.
(6) KEY THREE, the same key with a SQUARE bow.
Row 4, keys taken and the two doors home:
(1) KEY ONE TAKEN, the triangle key as a faint 18 percent outline only.
(2) KEY TWO TAKEN, the circle key as a faint outline.
(3) KEY THREE TAKEN, the square key as a faint outline.
(4) EXIT A, a round violet 8b7cf6 portal ring 2px thick on a 20 percent violet fill, a soft glow, filling 80 percent of the cell.
(5) EXIT B, a diamond amber f3b562 portal, a dashed ring on a 20 percent amber fill, a soft glow, same size.
(6) EXIT LIT, the round violet portal and the diamond amber portal overlapped as one bright shape with a burst of light, for the win tick.
Even spacing, one tile per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 03: Seam, drift line, ghosts, move arrows, hint and exit pulse

**DROP-IN wiring:** `#seam` (line 49) is a 3px vertical strip, full board height, violet to amber to violet with a glow; `#seam2` (line 56) is a 2px dashed amber strip that fades in by drift (`setDriftMeter` line 2038, opacity `0.42 + d*0.16`). Both become `background:url() center top / 3px auto repeat-y`. `.ghost` (line 90) dots are `max(3, floor(cell/5))` px circles at 50 percent, one per visited cell of the previous attempt, violet for A and amber for B; a background image on `.ghost.a` / `.ghost.b` replaces the fill. **PATCH-REQUIRED:** `.mvArrow` (line 204, spawned in `spawnMoveArrows()` line 2514 for the first ten inputs a save ever makes) is a text glyph in `#8b7cf6` or `#e8b05a`; replace `d.textContent = ch` at line 2519 with an `<img>` picked by `ch`. The `.hint` pulse (line 202) is a box shadow ring and `.exit.lit` (line 79) is a scale pulse; both stay CSS, but a ring image can be layered as a `::after`.

**Shape law:** the seam is a mirror edge, so it is drawn as a thin bright thread with a soft halo and never a solid bar; the drift line is broken into dashes so it reads as "not quite" against the seam's continuity; ghost dots are plain discs; arrows are chunky and unmistakable at 15px.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, the mirror seam and its marks:
(1) SEAM, a vertical strip filling the cell top to bottom, a 12 pixel wide bright thread that fades violet 8b7cf6 at the top through amber f3b562 in the middle back to violet at the bottom, with a soft 40 pixel glow either side, designed to tile vertically with no visible join.
(2) DRIFT LINE, a vertical strip of amber f3b562 dashes, each dash 48 pixels tall with a 48 pixel gap, 8 pixels wide, faint glow, tiles vertically.
(3) GHOST DOT A, a soft violet 8b7cf6 disc at 50 percent opacity, filling one third of the cell.
(4) GHOST DOT B, a soft amber f3b562 disc at 50 percent opacity, one third of the cell.
(5) HINT RING, a hollow violet 8b7cf6 rounded rectangle ring 14 pixels thick with a soft outer glow, filling the cell.
(6) EXIT BURST, a ring of eight thin light rays radiating from the centre, half violet 8b7cf6 and half amber f3b562, on nothing.
Row 2, move arrows, chunky flat arrows filling half the cell:
(1) LEFT ARROW violet 8b7cf6. (2) RIGHT ARROW violet 8b7cf6. (3) UP ARROW violet 8b7cf6. (4) WAIT MARK, a violet 8b7cf6 square with a soft glow.
(5) LEFT ARROW amber e8b05a. (6) RIGHT ARROW amber e8b05a.
Even spacing, one mark per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 04: Background (board plate, phone backdrop, desktop column)

**DROP-IN wiring:** there is no parallax and no layered background. `#board` (line 45) is a flat `#0d0f16` square with a 1px `#242836` border and 14px corners; `body` (line 26) is flat `#0a0b0f`; at 760px and wider `#app` (line 218) becomes a 700px column with a vertical gradient `#0e1017` to `#0a0b0f` and hairline sides. Set `background-image` on each. The board plate sits UNDER every tile, so it must stay darker than the wall slab (2b3048) and never carry detail that competes with a 30px tile: a faint grid of the cell pitch is the most it can hold, and since the cell size changes with the board (45 / 36 / 30), the grid should be drawn in the plate only as a soft vignette, not as lines. Board plate at 375: 360x360. Phone backdrop: 375x667 (make 1080x1920 and let CSS `cover` it). Desktop column: 700 wide, 800 to 1000 tall.

**Shape law:** these are grounds, not pictures. Nothing in them may read as a token. The mirror motif belongs here as one faint reflected form: a centre fold, a soft symmetric glow.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A background sheet of three panels on flat magenta FF00FF with wide magenta gutters.
Panel 1, BOARD PLATE, a 1024x1024 square with 40 pixel rounded corners: near black ink 0d0f16, a 2 pixel 242836 hairline edge, a very faint vertical fold down the exact centre where the left half glows violet 8b7cf6 at 6 percent and the right half glows amber f3b562 at 6 percent, both fading to nothing by a quarter of the width, a soft dark vignette at the corners, no lines, no grid, no shapes.
Panel 2, PHONE BACKDROP, 1080x1920 portrait: ink 0a0b0f with a barely there field of tiny paired dots, each pair one violet 8b7cf6 point and one amber f3b562 point reflected about a vertical axis, all at 10 percent, sparse, denser toward the top, empty in the middle third where the board sits, nothing else.
Panel 3, DESKTOP COLUMN, 700x1000 portrait: a slate column 0e1017 fading to 0a0b0f at 60 percent height, a 2 pixel 242836 hairline down each side, the same sparse paired dot field at 8 percent in the top fifth only.
No text, no watermark, nothing touching panel edges.

---

## Sheet 05: Thumb pad (the four buttons, three states, four glyphs)

**DROP-IN wiring:** `#pad button` (line 129) is a `#14161d` plaque with a `#242836` hairline and 14px corners, `:active` (line 131) turns it `#232840` with a violet border, and `.hint` (line 202) pulses a violet ring three times. Markup at lines 275 to 278 gives each button an id (`kLeft kUp kWait kRight`), a glyph (`◀ ▲ ■ ▶`) and a small label (`A LEFT / JUMP / WAIT / A RIGHT`). Wire as `#kLeft{background:url(pad_idle.png) center/100% 100%}`, `#kLeft:active{background-image:url(pad_down.png)}`, `#kLeft.hint{background-image:url(pad_hint.png)}`, and replace each glyph `span` with an `<img>` from row 3 (leave the `<small>` label as HTML text: it is the only place the word A LEFT exists and the mirror rule depends on it). Rendered size at 375x667: four across, each about 85px wide by `--padh` tall (98 to 105px here, 157 at 390x844, up to 190 on a tall phone), so the plaque is drawn as a 9 by 10 to 9 by 22 rectangle and must be a nine slice or a flat fill with edge detail only, never a picture that stretches.

**Shape law:** all four plaques share one shape; the states differ by relief (idle is flat, pressed is sunk with a violet rim, hint is raised with a glow). The four glyphs are the only thing that tells them apart, so the glyphs are big and hard edged: the WAIT mark is a square and never a circle (the circle is avatar A).

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A UI sprite sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, four identical button plaques, each a 200x230 rounded rectangle with 28 pixel corners, filling its cell, slate 14161d with a 2 pixel 242836 hairline and a faint lighter top edge, the centre left calm and empty for a glyph:
(1) IDLE plaque. (2) PRESSED plaque, the fill sunk to 232840 with a 3 pixel violet 8b7cf6 rim and no top highlight. (3) HINT plaque, the idle plaque with a soft violet 8b7cf6 glow bleeding 20 pixels outside its edge. (4) DISABLED plaque, the idle plaque at 40 percent brightness.
Row 2, the four input glyphs as flat pale e9e8f2 shapes filling half the cell with a faint violet 8b7cf6 glow: (1) LEFT, a solid chunky left pointing triangle. (2) JUMP, a solid chunky up pointing triangle with a thin lift line under it. (3) WAIT, a solid square. (4) RIGHT, a solid chunky right pointing triangle.
Row 3, the same four glyphs in the twin colours for the mirror hint: (1) LEFT triangle in violet 8b7cf6 with a small amber f3b562 right triangle reflected beside it. (2) JUMP triangle half violet half amber down the middle. (3) WAIT square half violet half amber down the middle. (4) RIGHT triangle in violet 8b7cf6 with a small amber f3b562 left triangle reflected beside it.
Even spacing, one element per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 06: Top bar, hud, ribbon chips, level card

**DROP-IN wiring:** `#bar .btn` (line 37) and the two inline styled hud buttons `#btnHint` and `#btnRestart` (lines 256 to 257) are 48x48 `#14161d` plaques with `#242836` hairlines and 12px corners; their glyphs are `☰ ⚙ ↺` and the word `HINT`. `#title` (line 40) is text only, `PARALLEL` over a subtitle. The hud (line 95) is four bare words with numbers: `moves deaths off mirror par`; `#hDrift` turns amber when drift is non zero (`setDriftMeter` line 2042). `#ribbon .chip` (line 107) has four states: plain, `.done` (ink text, lighter border), `.cur` (violet border, `#1b1d2e` fill), `.lock` (40 percent), and a cleared chip carries a small amber `★` plus the move count (`drawRibbon` line 2099). `#lvcard` (line 117) is a 56px tall panel with a `WATCH` button (`#lvcWatch` line 123). Wire every plaque as `background-image`, put a 14px icon before each hud word with `#hud span::before{content:'';width:14px;height:14px;background:url()}`, and give `#title` a wordmark plate behind the text (the text stays HTML). All chrome sizes are 48x48 unless noted; the ribbon chip grows to ~64 wide when it carries a star and a number.

**Shape law:** four hud icons must be distinct at 14px: footsteps for moves, a crack for deaths, two offset bars for off mirror, a small star for par. Ribbon chip states differ by rim, not fill: lock is a chip with a bar across it, current has the violet rim, done has a lit rim.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A UI sprite sheet, 3 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, square button plaques 200x200 with 40 pixel corners, slate 14161d with a 2 pixel 242836 hairline, each with one pale e9e8f2 glyph: (1) MENU, three horizontal bars. (2) OPTIONS, a six toothed cog. (3) RESTART, a circular arrow. (4) HINT, a small lit bulb shape made of a circle over a short bar, glowing violet 8b7cf6. (5) WATCH, a solid play triangle inside a thin ring. (6) CLOSE, a thin x cross.
Row 2, the hud marks as flat pale e9e8f2 icons filling half the cell: (1) MOVES, two small footprints. (2) DEATHS, a cracked disc. (3) OFF MIRROR, two vertical bars, one violet 8b7cf6 and one amber f3b562, slid apart so they no longer line up. (4) PAR, a small five point amber f3b562 star. (5) TITLE PLATE, a wide 240x90 slate 14161d plate with 24 pixel corners and a faint violet to amber fold line down its centre, empty for a wordmark. (6) LEVEL CARD PLATE, a wide 240x70 slate plate with 20 pixel corners and a 2 pixel 242836 hairline, empty inside.
Row 3, ribbon chips, each a 200x200 rounded plaque with 40 pixel corners: (1) OPEN chip, slate 14161d with a 242836 hairline. (2) DONE chip, the same with a lit 8f96b4 rim. (3) CURRENT chip, fill 1b1d2e with a 3 pixel violet 8b7cf6 rim and a soft glow. (4) LOCKED chip, the open chip at 40 percent with a thin diagonal bar across it. (5) PAR STAR chip, the done chip with a small amber f3b562 star in its top left corner. (6) STAR BADGE, a lone small amber f3b562 five point star with a soft glow.
Even spacing, one element per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 07: THE SKY (level select constellation)

**PATCH-REQUIRED wiring:** `buildSky()` (line 2357) builds the SVG as a string. Each level is a `<circle>` whose radius and fill say its state: locked `#222634` r3.2, open `#3b4058` r3.2, cleared `#8b7cf6` r4.4, par matched `#f3b562` r5.6 plus a `r9` amber halo at 16 percent; the current level gets a `r11` violet ring; cleared neighbours are joined by a `<line stroke="#8b7cf6" stroke-opacity=".34">`; tier labels are `<text fill="#6f7590" font-size="10">`; the level number is `<text font-size="9">` 17px under the star. Replace the three `parts.push('<circle ...')` at lines 2386 to 2392 with `parts.push('<image href="' + cellUrl + '" x="' + (p.x - 12) + '" y="' + (p.y - 12) + '" width="24" height="24"/>')`, choose `cellUrl` from the five states, and keep the transparent `.starhit` circle last (line 2397) so the measured 48px tap circle is untouched. Stars are 6 to 11px today and can grow to 24px: the layout guarantees 48px between centres and the number sits 17px below, so keep the drawn star inside 20px. The sky is 347 wide at 375 and about 1380 tall (100 stars, 5 per row, 60px row pitch), so it scrolls inside `#selwrap`; a backdrop image goes on `#shSel` at `cover`.

**Shape law:** the five star states differ by shape: locked is a hollow dot, open is a solid dot, cleared is a four point star, par matched is a four point star with a halo, current is the ring around whichever of those it is. Never by colour alone.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 5 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, level stars, each filling the middle 60 percent of its cell:
(1) LOCKED, a hollow dark 222634 dot with a thin 3b4058 outline.
(2) OPEN, a solid 3b4058 dot with a faint pale rim.
(3) CLEARED, a solid four point violet 8b7cf6 star with a soft glow.
(4) PAR MATCHED, a solid four point amber f3b562 star with a wide soft amber halo at 20 percent.
(5) CURRENT RING, a thin hollow violet 8b7cf6 ring with a soft glow, empty in the middle, sized to sit around any of the four stars.
Row 2:
(1) CONSTELLATION LINK, a thin horizontal violet 8b7cf6 line at 34 percent opacity spanning the cell, with a tiny brighter bead at each end, designed to stretch.
(2) TIER PLATE, a wide low 240x60 slate 14161d plate with 14 pixel corners and a faint 242836 hairline, empty for a tier name.
(3) TODAY BADGE, a small hollow ring with a dot in the centre, pale e9e8f2, a faint amber f3b562 glow.
(4) TODAY DONE BADGE, the same ring with an amber f3b562 four point star in the centre instead of the dot.
(5) SKY BACKDROP TILE, a 256x256 near black 0a0b0f square with a sparse scatter of tiny 1 to 3 pixel 3b4058 points and one faint violet 8b7cf6 point, seamless on all four edges for tiling.
Even spacing, one element per cell, nothing touching cell edges except the backdrop tile which fills its cell, no text anywhere.

---

## Sheet 08: Moments (win card, THE ONE RULE, toast, install nudge)

**DROP-IN wiring:** `#wincard` (line 177) is a `#14161d` plate with a `#242836` hairline and 16px corners, 8px in from each side of the stage (359 wide at 375) and about 130 tall; `onWin()` (line 2281) sets the heading to `BOTH DOORS` or `PERFECT` when moves are at or under par, and the stats line carries a `★`. The three buttons (`RETRY WATCH NEXT`, `NEXT` reads `SKY` on the last level and on the daily) are 48 tall, the `NEXT` one violet filled. `#nudge` (line 246) is a text button that appears once, after the first clear, only if the browser fired `beforeinstallprompt`. `#shTeach` is the closest thing this game has to a title screen: it opens on the very first boot (line 2731) and from OPTIONS, and its `#teachDemo` (line 192, markup 326 to 330) is three text glyphs, a violet `●▶`, the words `you press RIGHT`, and an amber `◀◆`, nudging left and right. `#toast` (line 187) is a `#1a1e2b` pill, up to 88vw wide, 2.1 seconds. Wire the plates as `background-image`; replace the two `.td` glyph spans with an `<img>` of the teach emblem and keep the middle words as HTML. There is no title screen, no pause screen and no game over screen in the code: death is a 150ms rewind and the win card is the only end state, so these are the only moment plates the game has.

**Shape law:** the win emblem is the two portals from Sheet 02 shown side by side and lit; the PERFECT emblem is the same with the amber star above; the teach emblem is A and B back to back with their arrows, which is the whole rule drawn once.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A UI sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, wide elements allowed to span within their cell.
Row 1:
(1) WIN CARD PLATE, a 240x110 slate 14161d plate with 24 pixel corners, a 2 pixel 242836 hairline, a faint violet to amber fold down the centre, empty inside.
(2) BOTH DOORS EMBLEM, a round violet 8b7cf6 portal ring and a diamond amber f3b562 portal side by side, both lit with a soft glow, a small violet disc creature inside the round one and a small amber diamond creature inside the diamond one, filling 70 percent of the cell.
(3) PERFECT EMBLEM, the same two lit portals with a bright amber f3b562 four point star above them and six small light points around.
(4) TEACH EMBLEM, a violet 8b7cf6 disc creature on the left with a chunky violet arrow pointing RIGHT beside it, and an amber f3b562 diamond creature on the right with a chunky amber arrow pointing LEFT beside it, the two creatures back to back about a faint vertical fold line, filling the cell width.
Row 2:
(1) TOAST PILL, a wide 240x70 pill, fill 1a1e2b with a 2 pixel 242836 hairline and a faint top highlight, empty inside.
(2) NEXT BUTTON PLAQUE, a 240x80 rounded plaque with 20 pixel corners in solid violet 8b7cf6 with a slightly darker 7364d6 bottom edge, empty for a word.
(3) RETRY AND WATCH BUTTON PLAQUE, a 240x80 rounded plaque, fill 1a1e2b with a 2 pixel 242836 hairline, empty.
(4) INSTALL NUDGE MARK, a small pale e9e8f2 phone outline with a plus sign in the centre and a faint violet 8b7cf6 glow, filling half the cell.
Even spacing, one element per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 09: OPTIONS and RUN LOG chrome

**DROP-IN wiring:** every element is a CSS class: `.sheet` scrim (line 136, `rgba(6,7,11,.94)`), `.close` (line 143, 48x48), `.big` (line 145, full width 52 tall violet fill) and `.big.ghostb` (line 147, hollow), `.tog` (line 148, 70x48, `.on` gives a violet rim and violet text), `input[type=range]` (line 151, native slider with `accent-color` violet), `.stat` tile (line 163, three across, big number over a label), `.tierbar .track` and `.fill` (lines 167 to 169, 8px tall, violet fill, `.fill.star` amber), `.runrow` (line 170, 48 tall, hairline under). `syncOpts()` (line 2621) flips the toggle text and class; `buildStats()` (line 2416) builds the six stat tiles, the seven tier bars and up to twelve run rows. Wire each as `background-image`; the slider needs `-webkit-slider-thumb` and `-webkit-slider-runnable-track` rules to take the knob and track cells. The `#testpanel` (line 208) is a monospace dump reachable only with `?test=1` and needs no art.

**Shape law:** toggle ON and OFF differ by a knob position and a lit rim, never by colour alone. The stat tile and the run row are plates with a calm centre, text goes over them in HTML.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
A UI sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, wide elements spanning within their cell.
Row 1, buttons: (1) BIG FILLED BUTTON, a 240x64 rounded plaque with 18 pixel corners in solid violet 8b7cf6 with a darker 7364d6 bottom edge. (2) BIG HOLLOW BUTTON, the same plaque as only a 2 pixel 242836 hairline outline on nothing. (3) TOGGLE OFF, a 200x110 rounded plaque, slate 14161d with a 242836 hairline, a small pale 9a9ab4 knob sitting at the LEFT end. (4) TOGGLE ON, the same plaque with a 3 pixel violet 8b7cf6 rim, the knob at the RIGHT end in violet with a glow.
Row 2, slider and tiles: (1) SLIDER TRACK, a wide 240x16 rounded bar, dark 1c2030, with the left 60 percent filled violet 8b7cf6. (2) SLIDER KNOB, a round pale e9e8f2 knob with a thin violet 8b7cf6 rim and a soft glow, filling one third of the cell. (3) STAT TILE, a 200x150 slate 14161d plate with 24 pixel corners and a 242836 hairline, empty. (4) RUN ROW PLATE, a wide 240x80 flat slate 14161d strip with only a 2 pixel 242836 hairline along its bottom edge.
Row 3, bars and scrim: (1) TIER BAR TRACK, a wide 240x20 rounded bar in dark 1c2030, empty. (2) TIER BAR FILL VIOLET, the same bar filled solid violet 8b7cf6 with a soft glow. (3) TIER BAR FILL AMBER, the same bar filled solid amber f3b562 with a soft glow. (4) SHEET SCRIM TILE, a 256x256 square of near black 06070b at 94 percent with a barely visible paired dot field, one violet 8b7cf6 point and one amber f3b562 point reflected about the centre, seamless on all edges for tiling.
Even spacing, one element per cell, nothing touching cell edges except the scrim tile which fills its cell, no text anywhere.

---

## Sheet 10: App icon

**DROP-IN wiring:** `icon-192.png`, `icon-512.png` and `icon-maskable-512.png` already exist in the folder and are referenced by `manifest.webmanifest` and the two `<link>` tags (lines 12 to 14). Overwrite the three files; the maskable one must keep everything important inside the central 80 percent. Theme colour is `#8b7cf6`, background `#0a0b0f`.

**Shape law:** the icon is the game in one shape: the violet disc and the amber diamond reflected about a seam. It must read at 48px on a home screen.

**PROMPT (copy-paste):**

Parallel style: flat matte geometric game tokens on near black ink 0a0b0f, slate panels 14161d with a single 242836 hairline, two protagonist colours only, electric violet 8b7cf6 and warm amber f3b562, one soft inner glow per token and no other gradients, crisp hard edges, a quiet mirror motif of paired and reflected shapes, calm and precise, no text, no watermark, flat FF00FF magenta background for cutout.
Two app icons side by side on flat magenta FF00FF with a wide magenta gutter.
(1) ANY ICON, a 512x512 square with 110 pixel rounded corners, near black ink 0a0b0f, a thin bright vertical seam down the exact centre fading violet 8b7cf6 to amber f3b562, a solid violet disc creature with two tiny eyes on the left of the seam and a solid amber diamond creature with two tiny eyes on the right, mirrored, each about 30 percent of the icon, a soft glow on each.
(2) MASKABLE ICON, the same design on a full bleed 512x512 ink 0a0b0f square with no rounded corners, everything shrunk so both creatures and the seam sit inside the central 80 percent.
No text, no watermark, nothing touching the outer edges of the maskable icon.

---

## Full animation sets

A character is not done when it can hop. Per character, the sets the game state can drive (see the Sheet 01 wiring for which state bit drives which):

| Character | idle | move | jump | fall | stuck (hit) | die | win | total |
|---|---|---|---|---|---|---|---|---|
| Avatar A (violet disc) | 2 (breathe) | 4 (walk, drawn facing right, flipped by CSS for left) | 2 (rise, hang) | 2 (drop, land squash) | 2 (press, recoil) | 4 (crack, split, dust, gone) | 4 (lift, glow, ring, hold) | 20 |
| Avatar B (amber diamond) | 2 | 4 (drawn facing left, the mirror of A) | 2 | 2 | 2 | 4 | 4 | 20 |

Sheet 01 above holds the first frame of each of those sets (8 cells per twin) so the drop in is immediate; the full 20 frame strips are the second pass and go in the same row order. One more set for each twin that is worth having because the SIM already knows the moment: an OVERLAP pose for when A and B stand in the same cell (`drawDynamic` lines 2166 to 2168 slides them 16 percent apart today), which reads best as both leaning away from the seam.

Tiles with animation: THIN FLOOR needs a 3 frame break (intact, cracking, gone) since `.gone` flips in a single tick today; DOOR needs a 2 frame open; EXIT needs a 3 frame lit pulse to replace the CSS scale. The seam wants a slow 4 frame drift of its glow so the mirror feels alive while the player thinks.

---

## Coverage: every draw function and which sheet covers it

| Function or rule | Line | Draws | Sheet |
|---|---|---|---|
| `fitBoard()` | 1988 | sizes the board, the seam, the pad, shows the ribbon and the card | 04, 05, 06 (sizing only) |
| `setDriftMeter()` | 2038 | `#hDrift` colour, `#seam2` position and opacity | 03, 06 |
| `drawLvCard()` | 2055 | tier name, mechanics list, best, WATCH | 06 |
| `drawRibbon()` | 2076 | ten neighbouring level chips with cur / done / lock / star states, or the daily and seed tags | 06 |
| `box()` | 2104 | positions one element to a cell (helper, no visual) | none needed |
| `drawStatic()` | 2111 | walls, ice, crumble, spikes, exit A, exit B, keys, doors, one way L R D U, the two avatar shells | 02, 01 |
| `drawGhosts()` | 2143 | previous attempt dots for A and B | 03 |
| `drawDynamic()` | 2162 | avatar transforms and `.dead`, overlap offset, crumble `.gone`, door `.open`, key `.got`, hud numbers | 01, 02, 06 |
| `setMsg()` | 2191 | the line of text under the board (`#msg`) | text only, no art |
| `toast()` | 2192 | the toast pill | 08 |
| `onDeath()` | 2271 | `again` message, deaths counter, 150ms rewind | 01 (dead cell) |
| `onWin()` | 2281 | `.exit.lit` pulse, win card heading and stats, NEXT or SKY | 02 (exit lit), 08 |
| `offerInstall()` | 2320 | install nudge line | 08 |
| `playReplay()` | 2328 | re drives `drawDynamic` on a 190ms timer | 01, 02 |
| `buildSky()` | 2357 | star circles x5 states, halo, current ring, constellation lines, tier labels, level numbers, foot line, TODAY / TODAY DONE | 07 |
| `buildStats()` | 2416 | six stat tiles, seven tier bars, up to twelve run rows, foot text | 09 |
| `openSheet()` / `closeSheet()` | 2466 | toggles a sheet scrim | 09 (scrim tile) |
| `flashHint()` | 2492 | `.hint` pulse on one pad button and on HINT | 05, 03 |
| `spawnMoveArrows()` | 2514 | a violet and an amber arrow riding each avatar for the first ten inputs | 03 |
| `syncOpts()` | 2621 | toggle ON / OFF text and rim, slider value | 09 |
| CSS `#seam` / `#seam2` | 49, 56 | the mirror axis and the drift line | 03 |
| CSS `.spike i` | 73 | the clip path teeth | 02 |
| CSS `.av .body` | 84 to 89 | the avatar disc and diamond, `.dead` | 01 |
| CSS `#pad button` | 129 to 133 | the four pad plaques, `:active`, `.hint` | 05 |
| CSS `#bar .btn`, `#hud`, `#btnHint`, `#btnRestart` | 37, 95, 256, 257 | top bar and hud chrome | 06 |
| CSS `#wincard` | 177 to 184 | win card plate and buttons | 08 |
| CSS `#teachDemo` | 192 to 199 | the one rule emblem | 08 |
| CSS `.sheet .close .big .tog .stat .tierbar .runrow`, `input[type=range]` | 136 to 172 | every overlay control | 09 |
| CSS `#testpanel` | 208 | dev only dump behind `?test=1` | none needed |
| `music-unlocks.js` chip (external, loaded at line 224) | site wide | a 97x48 Music chip in a free corner | owned by the site, not this list |
| `icon-*.png` | manifest | home screen icon | 10 |

Nothing else in the file paints. The SIM block (lines 344 to 1281), the test suites (1283 to 1861), the save and audio code (1862 to 1972) and the input handlers (2471 to 2620) put nothing on screen.

## Things the code cannot show today (found while reading)

1. **No title screen, no pause, no game over.** Boot lands on the highest unlocked level; the first ever visit opens THE ONE RULE sheet over it. Death is a 150ms rewind with the avatars at 25 percent grey, and 0ms under reduced motion, so the dead cell never really gets seen. Sheet 08 is the whole set of moment plates the game has.
2. **Three keys, one glyph; three doors, one colour.** `KEY0/1/2` and `DOOR0/1/2` are distinct locks in the SIM but visually identical. Sheet 02 fixes it with triangle, circle and square lock marks and the `data-k` / `data-d` attributes already in the markup.
3. **Airborne, facing and stuck exist in state but not in the view.** `s.fa`, `s.fb`, the previous cell and the `desync` flag are all computed each tick and thrown away by `drawDynamic`. Four class toggles unlock the full animation sets.
4. **Every icon is a font glyph** (`☰ ⚙ ↺ ✕ ◀ ▲ ■ ▶ ▼ ⚷ ★`). `⚷` in particular depends on the device font having it.
5. **`--good #67d6a5` is declared and never used** by any element.
6. **The one placeholder rectangle** is the WAIT button's `■`, which is the same shape as the amber diamond's bounding box; Sheet 05 keeps it a square and never a circle so it cannot be confused with avatar A.
