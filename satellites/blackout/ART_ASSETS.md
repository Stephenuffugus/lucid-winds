# BLACKOUT art asset list

Written from `satellites/blackout/index.html` as it is on branch `add-sproing-jumper`
(3857 lines, 176 KB), not from what the docs hoped it would be. Every size below is
measured from the stylesheet or the SVG strings at a 375x667 CSS px viewport.

## What the game is

Blackout is a one screen deduction game: a procedural country house murder (six suspects,
six weapons, six rooms, six hours) with a proven single answer, played by spending a
budget of 16 to 28 actions on searching rooms, asking people and pressing them, then
marking a 6x6 board and naming who, with what, where and when. There is no map, no
avatar and no motion; the whole game is text in dark panels, six tiny procedural suspect
silhouettes, and a pocket watch dial that empties as the evening is spent.

## Render architecture (read this before generating anything)

**There is no canvas.** `grep -c "<canvas\|getContext\|drawImage\|requestAnimationFrame"`
returns 0. The game is plain DOM built by `el()` (line 3069) into `#app`, styled by the
`<style>` block at lines 15 to 156. The only drawn art is two inline SVG strings:

- `silhouette(i)` at line 3078: a 34x44 viewBox figure per suspect (head circle, torso
  path, optional service collar chevron in cyan, optional spectacles in gold).
- `watchSvg(left, total)` at line 3098: a 52x52 viewBox pocket watch (dark face, 12 dot
  ticks, a stroke-dasharray ring showing the fraction of actions left, a hand at
  `-90 + (1 - frac) * 360` degrees, a centre pin). Cyan `#5ad1e6`, or gold `#e8c37a` when
  4 or fewer actions remain.

**The draw loop is `render()` at line 3245.** It runs after every tap, calls
`clear(app)` and rebuilds the header, watch bar, the active tab (`renderCase` 3286,
`renderBoard` 3343, `renderFile` 3417) and the bottom nav from scratch. Overlays
(`openPicker` 3482, `openAccuse` 3557, `openReveal` 3620, `openOptions` 3745) are built by
`overlay()` at line 3547 into `#ov` on `document.body`. Consequence for art: any sprite
animation must be CSS keyframes on a class, because JS timed frames restart on every
rebuild. There is no DPR handling and none is needed; the browser scales `<img>` and
CSS `background-image` by devicePixelRatio itself. Generate at 256 px cells and let
the browser downscale to the CSS sizes below (Pixel 9 is ~2.6x, so a 44 px silhouette
is drawn from ~115 device px).

**Viewport.** Nothing scales with a formula. Widths are `100%` of a 375 px body minus
`--pad` 10 px each side, so content is 355 px wide; the board is full bleed at 375 px.
Heights are `min-height` in px. The only computed fit is the case title
(`titleTier()` line 1651: 14 / 12.5 / 11 px, at most two lines, inside
`375 - 65 - 68 - 32 = 210 px`).

**The palette the CSS and SVG actually use (hex):**

| token | hex | used for |
|---|---|---|
| `--bg` | `#0a0b0f` | page ground, manifest background_color |
| `--panel` | `#14161d` | cards, overlay box, board |
| `--panel2` | `#1b1e27` | action buttons, picker cells, switches |
| `--line` | `#2a2f3b` | every 1 px border |
| `--ink` | `#d8dde6` | body text, big counter |
| `--dim` | `#8891a3` | labels, tags, nav text |
| `--accent` | `#5ad1e6` | cold cyan: watch ring, yes marks, selected, active tab, primary button fill, theme_color |
| `--warm` | `#e8c37a` | candle gold: case title, overlay h3, maybe marks, stars, low budget watch, statement cards |
| `--bad` | `#e8746a` | rust red: contradiction stamp, liar brief edge |
| header gradient | `#111319` to `#0c0e13` | `.hd` |
| bars | `#0c0e13` | watch bar, bottom nav |
| grid hairline | `#1e222c` | board cell borders |
| silhouette body | `#39414f` | suspect figure, watch tick dots |
| watch face | `#0f1218` | dial ground |
| done / locked text | `#59606e` | spent action buttons |
| accuse button | `#1d1416` fill, `#4a2f2c` border, `#f0a79e` text | `.danger` |
| on-cyan text | `#06222a` | text over a cyan fill |
| halo | `rgba(90,209,230,.16)` fill, `.5` ring | board cells a clue speaks to |
| overlay scrim | `rgba(6,7,10,.94)` | `.ov` |

## How art drops in (per sheet)

The game has no asset folder. Create `satellites/blackout/art/` and reference it with
relative paths, versioned (`?v=1`) per the host caching law. Every drop-in below is a
`<img>` or a CSS `background-image`; there is no `drawImage` anywhere to replace.

| sheet | replaces | exact line | in-game px at 375 wide |
|---|---|---|---|
| 01 Suspects | `sv.innerHTML = silhouette(i)` | 3312 (`renderCase`) | 34x44 in `.silwrap` (CSS 76-77); also 3419 File dossier (no image today), 3568 accuse picker cells 103.7x48, 3686 `beats()` reveal (no image today, suggest 96x124) |
| 02 Weapons | text only today | 3428 `renderFile` dossier rows, 3570 accuse `.pick` cells 103.7x48, 3686 reveal beat 3 | suggest 40x40 in dossier, 28x28 inside picker cell, 96x96 on reveal |
| 03 Rooms | text only today | 3295 `renderCase` room rows (add a thumb before `.nm`), 3437 dossier, 3570 accuse, 3686 reveal beat 2 | 44x44 in the 56 px row, 96x96 on reveal |
| 04 Pocket watch | `wsvg.innerHTML = watchSvg(...)` | 3261 (`render`), SVG at 3098 | 52x52 (`.watch` CSS 45) |
| 05 Clue type icons | `.clue .tag` text prefix | 3399 `card()` in `renderBoard`, 3631 reveal "notes that did the work", 3641 contradiction stamp | 14x14 inline before the 9.5 px tag; 20x20 on the reveal |
| 06 Board marks | `glyph` text `✓ ✕ ?` | 3365 (`renderBoard`) | 24x24 centred in a 52.8x52 cell; halo tile fills the cell |
| 07 Action and nav icons | text only buttons | 3301 search, 3318 ask, 3325 press, 3265 accuse, 3250 exit, 3256 options, 3276 nav, 3648 share, 3456 link, 3460 replay, 3471 new case, 3474 daily, 3755 switch | 20x20 above 11 px label inside 48x48 minimum buttons; nav 22x22 |
| 08 Frames and panels | CSS `background`/`border` on `.hd .watchbar .brief .row .clue .ovbox .wide .bn .tabs button .stamp .toast .dz .arc` | CSS 31, 44, 60, 63, 102, 122, 129, 54, 79, 134, 142, 146, 149 | 9-slice at `border-image` or `background:url() ... ` 355 px wide cards, 351 px overlay box |
| 09 Hours and events | text `TIME_HEAD` / `TIMES` / `EVENTS` | 3360 board column headers (36 px tall), 3570 accuse "When" cells 103.7x48, 3686 reveal beat 2 | 24x24 in the header cell, 28x28 in a picker cell |
| 10 Result marks | `new Array(st.stars + 1).join("★")` | 3625 reveal `.stars` (26 px glyphs), 3454 archive rows (11 px) | 28x28 per star on reveal, 12x12 in archive; seals 96x96 |
| 11 Screen plates | overlay `h3` headers and empty states | 3487 picker, 3564 accuse, 3623 reveal, 3749 options, 3387 nothing yet, 3448 no archive | 323 px wide banners inside `.ovbox`, 64 px tall |
| 12 Backgrounds | `body{background:var(--bg)}` line 23, `.ov` scrim 120, `.gridwrap` 85 | CSS | full bleed portrait 1080x1920 (rendered at 375x667, cover) |
| 13 Icon and tile | `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | `<link rel="icon">` line 13, manifest | 512x512 |

## Asset table

| id | what | where it draws | in-game px | cells | priority |
|---|---|---|---|---|---|
| 01 | Six suspects, five states each | Case tab rows, accuse picker, reveal | 34x44 (rows), 96x124 (reveal) | 30 (6 rows x 5) | 1 |
| 02 | Six weapons plus four wound classes plus two evidence states | File dossier, accuse picker, Wound clue tags, reveal | 40x40, 28x28, 96x96 | 12 (2 rows x 6) | 2 |
| 03 | Six rooms in four states (open, searched, the scene, its trace substance) | Case tab room rows, dossier, accuse, Trace clue tags, reveal | 44x44, 96x96 | 24 (4 rows x 6) | 2 |
| 04 | Pocket watch face, hands, exhausted face, six baked fill frames | Watch bar, every screen | 52x52 | 12 (2 rows x 6) | 1 |
| 05 | Twelve clue type icons plus six badges (statement, evidence, the lie, contradiction, empty room, gave nothing) | Journal cards, reveal, toasts | 14x14, 20x20 | 18 (3 rows x 6) | 2 |
| 06 | Board marks yes / no / maybe, halo tile, empty tile, three column tab glyphs, possibilities counter ornament | Board tab | 24x24 marks in 52.8x52 cells | 8 (2 rows x 4) | 2 |
| 07 | Action and nav icons with states: search, ask, press (normal, done, locked, hot), accuse, exit, options, share, link, replay, new case, daily, switch on, switch off, three nav tabs | Every button | 20x20 to 22x22 | 24 (4 rows x 6) | 2 |
| 08 | Frames and panels: header bar, watch bar, brief card (honest and lying), row card, clue card (plain, selected, statement), overlay box, primary wide button, secondary wide button, bottom nav, tab pill on/off, red stamp, gold lie stamp, toast, dossier tile, archive row, picker row selected | Every screen | 355 x 48 to 355 x 120, 9-slice | 18 (3 rows x 6) | 1 |
| 09 | Six hours (7pm to midnight), hour ruled out, hour window, eight events | Board hour headers, accuse "When", Sequence and Timeline clue tags, reveal | 24x24, 28x28 | 16 (2 rows x 8) | 3 |
| 10 | Star lit, star unlit, three star row, Case Closed seal, Wrong seal, daily seal, streak mark, share mark | Reveal, archive, options record | 28x28 stars, 96x96 seals | 8 (2 rows x 4) | 2 |
| 11 | Screen plates: Pick a case (short, standard, long, liar), Accuse, Case Closed, Wrong, Options, Nothing yet, No old cases, The house brief | Overlays and empty states | 323x64 banners | 12 (2 rows x 6) | 2 |
| 12 | Backgrounds: house at night ground, board felt, overlay scrim, solved dawn, failed lamp | Body, gridwrap, `.ov` | 1080x1920 | 5 (1 row x 5, each 1080x1920) | 3 |
| 13 | App icon (keyhole), maskable icon, portal tile | Manifest, portal | 512x512 | 3 (1 row x 3, 512 cells) | 3 |

Thirteen sheets. Priority 1: 01 Suspects, 04 Pocket watch, 08 Frames and panels.

**Screens that do not exist in the code:** there is no title screen, no how to play
screen and no pause screen. `boot()` (line 3795) starts the daily case and lands on the
Case tab with the case title in the header; the four `BRIEF` lines (line 364) on the
Case tab are the only rules text; the reveal overlay is the game over; there is nothing
to pause. Sheet 11 dresses the screens that exist. Adding a title or how to screen is a
new state and a Director call, not an art drop-in.

---

## Blackout style (the style line every prompt below repeats)

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.

---

## Sheet 01: Suspects

**PATCH-REQUIRED wiring:** `renderCase` line 3312 sets `sv.innerHTML = silhouette(i)`.
Replace with `<img class="sil" src="art/suspect-<i>-<state>.png?v=1">` (the `.sil` rule
at CSS 77 already sizes it 34x44 and sets opacity .92). State is `pressed` when
`APP.st.pressed` holds i, else `asked` when `APP.st.interviewed` holds i, else `neutral`.
The reveal `beats()` at 3686 draws no image; add the `guilty` cell at 96x124 above the
first beat, and `revealLie()` at 3706 gets the `liar` cell beside the gold stamp. The
accuse picker `.pick` cells at 3570 are 103.7x48: put the neutral cell at 28x36 left of
the name. The dossier at 3419 can reuse neutral at 40x52. Attributes are data
(`SUSPECTS` line 312): Vance tall guest spectacles, Mira short guest spectacles, Ellis tall
staff, Odell short staff, Renna tall guest, Marek short staff spectacles. Sighting clues
literally say "a tall figure in spectacles" and "a figure in a service collar", so those
three traits must read at 34x44 or the clue has no referent.

**Shape law:** every suspect must be told apart by silhouette alone at 34 px tall:
height (tall figures fill the cell, short ones leave 4 px of headroom, exactly as
`top = s.tall ? 4 : 8` does today), a service collar V on staff, round spectacles on the
three who wear them. States differ by pose, not tint: neutral stands square, asked turns
a quarter away with one hand raised, pressed leans in with both hands up, guilty holds
the weapon hand behind the back with the head down, liar has a hand over the mouth.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 6 rows x 5 columns, each cell 256x256 pixels on flat magenta FF00FF, one
three quarter length human figure per cell in charcoal 39414F with a cream D8DDE6 rim light
from the left, 1930s evening dress or service uniform. Each row is one person, each column
is one state in this order: (a) NEUTRAL standing square facing front, (b) ASKED turned a
quarter to the right with one hand raised palm out, (c) PRESSED leaning forward with both
hands up and shoulders hunched, (d) GUILTY head bowed and one hand hidden behind the back,
lit from below in cold cyan 5AD1E6, (e) LIAR one hand flat over the mouth, eyes cut to the
side, lit in candle gold E8C37A.
Row 1 VANCE: tall man filling the cell top to bottom, round gold E8C37A spectacles, white
tie evening dress with a cream D8DDE6 shirt front.
Row 2 MIRA: short woman with clear headroom, round gold E8C37A spectacles, bobbed hair,
a long evening gown with one cream D8DDE6 pearl string.
Row 3 ELLIS: tall man filling the cell, no spectacles, butler's service collar drawn as a
sharp cyan 5AD1E6 V at the throat, apron line at the waist.
Row 4 ODELL: short stocky man with headroom, no spectacles, cook's service collar as a
sharp cyan 5AD1E6 V, sleeves rolled to the elbow.
Row 5 RENNA: tall woman filling the cell, no spectacles, hair pinned up, narrow gown with
a slate 8891A3 shawl.
Row 6 MAREK: short man with headroom, round gold E8C37A spectacles, footman's service
collar as a sharp cyan 5AD1E6 V, gloves in cream D8DDE6.
Even spacing, one figure per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 02: Weapons and wound classes

**PATCH-REQUIRED wiring:** weapons have no image anywhere today. `renderFile` line
3428 builds a `.dz` tile per weapon (name plus `CLASSWORD` class); prepend a 40x40
`<img>`. `openAccuse` line 3570 builds `.pick` buttons 103.7x48 with the weapon name;
prepend a 28x28 `<img>` (keep the text, the cell is too small for icon only). The reveal
beat 3 at 3686 ("With the Carving Knife.") gets the weapon at 96x96 beside the line. The
four class icons go in the Wound clue tag (`TYPE_NAMES[7]`, line 3399 `card()`) and the
two evidence states are for Object clues ("locked in its case") and Ownership clues.
Data is `WEAPONS` line 321: Letter Opener (blade), Carving Knife (blade), Iron Poker
(blunt), Brass Candlestick (blunt), Silk Cord (cord), Bitter Tonic (poison).

**Shape law:** the two blades and the two blunt weights must not collapse into one
another at 28 px: the opener is a slim symmetrical dagger with a flat ornamental hilt, the
knife is a long single edged kitchen blade with a riveted grip; the poker is a straight rod
with a hook, the candlestick is a flared column with a drip pan. The cord is a loop with
tassels, the tonic is a stoppered bottle. Class icons are abstract marks, not weapons:
a slash, a starburst, a loop, a droplet.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, six murder weapons as flat objects lit by one cold cyan 5AD1E6 edge light:
(1) LETTER OPENER, a slim symmetrical dagger with a flat ornamental brass E8C37A hilt.
(2) CARVING KNIFE, a long single edged kitchen blade in slate 8891A3 steel with a dark
riveted wooden grip.
(3) IRON POKER, a straight charcoal 39414F rod with a hooked tip and a ring handle.
(4) BRASS CANDLESTICK, a flared column in gold E8C37A with a wide drip pan and a stub of
cream D8DDE6 candle.
(5) SILK CORD, a thick looped cord in deep slate 2A2F3B with two gold E8C37A tassels.
(6) BITTER TONIC, a small stoppered apothecary bottle in cyan tinted glass 5AD1E6 with a
cream D8DDE6 label left blank.
Row 2, six flat badge marks on a round slate 14161D coin with a hairline 2A2F3B rim:
(7) BLADE class, a single diagonal cream D8DDE6 slash mark.
(8) BLUNT class, a four point cream D8DDE6 impact starburst.
(9) CORD class, a cream D8DDE6 closed loop with a knot at the bottom.
(10) POISON class, a single cream D8DDE6 droplet with a tiny skull dot pattern inside.
(11) RULED OUT, a padlocked display case in slate 8891A3 with a cyan 5AD1E6 lock.
(12) OWNED, an open hand in charcoal 39414F holding a gold E8C37A luggage tag.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 03: Rooms and traces

**PATCH-REQUIRED wiring:** rooms have no image today. `renderCase` line 3295 builds a
`.row` (355x56) per room with only a name and "staff key only" / "open to the house"; add
a 44x44 `<img>` as the first child, state `searched` when `APP.st.searched` holds i,
else `open`. `renderFile` line 3437 dossier tiles take the same cell at 40x40. Accuse
picker "Where" at 3570 takes it at 28x28. The reveal beat 2 ("In the Cellar, at 10pm.")
at 3686 takes the `scene` cell at 96x96. The trace substance cells go in the Trace clue
tag (`TYPE_NAMES[5]`, card() line 3399) and are named in `ROOMS[].sub` line 330: ink,
paper dust, potting soil, coal dust, floor wax, flour. Cellar and Kitchen are
`staffOnly` and the Access clue says "staff key only", so their open state must show a
lock.

**Shape law:** at 44 px each room is one object, not an interior: Study a desk lamp,
Library a ladder against shelves, Conservatory a potted palm under glass, Cellar a barrel
and an arched stair with a padlock, Hall a grandfather clock, Kitchen a hanging pan rack
with a padlock. Searched adds a torn crime scene ribbon across the object and dims it,
scene replaces the ribbon with a chalk outline on the floor and a cyan lamp. Traces are
small heaps or smears in a distinct shape each.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF.
Columns are six rooms in this order: STUDY a green shaded desk lamp on a writing desk;
LIBRARY a rolling ladder against tall shelves; CONSERVATORY a potted palm under a glass
pane; CELLAR a wooden barrel beside an arched stone stair with a heavy gold E8C37A padlock
on the arch; HALL a grandfather clock with a cream D8DDE6 face; KITCHEN a hanging rack of
copper pans with a heavy gold E8C37A padlock on the rack.
Row 1 OPEN: each object in charcoal 39414F and slate 8891A3 with a warm candle gold
E8C37A glow from a small flame somewhere in the cell.
Row 2 SEARCHED: the same six objects dimmed to slate 2A2F3B with a torn cream D8DDE6
ribbon crossing the object diagonally and the candle out.
Row 3 THE SCENE: the same six objects lit hard from below by cold cyan 5AD1E6 with a cream
D8DDE6 chalk outline of a fallen figure on the floor in front of the object.
Row 4 TRACES, small evidence heaps on a dark floorboard: (19) a spilled INK pool in deep
blue black 0A0B0F with a cyan 5AD1E6 sheen; (20) PAPER DUST as a fine cream D8DDE6 drift
with a torn page corner; (21) POTTING SOIL as a dark crumbly mound with one green leaf;
(22) COAL DUST as a black smear with tiny glinting cyan 5AD1E6 flecks; (23) FLOOR WAX as
a gold E8C37A smeared boot print; (24) FLOUR as a soft white D8DDE6 handprint.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 04: Pocket watch

**PATCH-REQUIRED wiring:** `render()` line 3261 sets `wsvg.innerHTML = watchSvg(left,
total)`. Keep the SVG ring and hand (they are computed from `frac = left / total`, and
total is 16, 20, 24, 25 or 28 depending on tier, so the fraction is not a fixed frame
count) and put the art face under it: make `wsvg` `position:relative` with the face cell as
`background-image` at 52x52, then draw only the ring, hand and pin from `watchSvg`. Use
the WARM face when `left <= 4` (the same test that colours the ring gold at line 3101)
and the EXHAUSTED face when `left === 0`. Row 2 is a fallback for a pure image swap:
pick `frames[Math.round((1 - frac) * 5)]`. The whole `.watchbar` (CSS 44) is 375x68.

**Shape law:** at 52 px the watch is a round case with a crown at 12 o'clock and a short
chain stub to the left; the hand is one thick tapered bar, not two. The warm state is not
just a colour change: the crown is popped up and a hairline crack crosses the glass. The
exhausted face has the glass fully shattered and the hand missing.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF, a
pocket watch seen straight on, filling 80 percent of the cell, crown at the top and a short
chain stub leaving the cell to the lower left but not touching the edge.
Row 1: (1) FACE CYAN, round charcoal 39414F case, dial ground 0F1218, twelve slate 39414F
tick dots, no hands, a faint cyan 5AD1E6 glow on the rim. (2) FACE WARM, the same watch
with the crown popped up and one hairline crack across the glass, rim glow in candle gold
E8C37A. (3) FACE EXHAUSTED, the glass shattered into a spiderweb, dial dark, no glow, crown
missing. (4) HAND CYAN, a single thick tapered watch hand alone in the cell pointing
straight up, cyan 5AD1E6 with a cream D8DDE6 highlight. (5) HAND WARM, the same hand in
candle gold E8C37A. (6) PIN, the small round centre pin alone, cyan 5AD1E6 with a cream
D8DDE6 dot.
Row 2, six baked states of the cyan face with a cyan 5AD1E6 ring around the dial and a
single hand, the ring and hand sweeping clockwise from twelve: (7) FULL, ring complete,
hand at twelve. (8) ring four fifths, hand at about two o'clock. (9) ring three fifths,
hand at about five o'clock. (10) ring two fifths, hand at about seven, ring turned candle
gold E8C37A. (11) ring one fifth, hand at about ten, gold E8C37A, glass cracked. (12) EMPTY,
no ring, glass shattered, no hand.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 05: Clue type icons and badges

**PATCH-REQUIRED wiring:** `card()` at line 3394 inside `renderBoard` builds each journal
`.clue` (355 x min 48) with a `.tag` line of 9.5 px uppercase text: "Marek says   Alibi" or
"In the Cellar   Trace". Prepend a 14x14 `<img>` for `cl.ty` (1 to 12, names in
`TYPE_NAMES` line 813). The same cell at 20x20 goes on the reveal's "notes that did the
work" (line 3631) and the contradiction stamp (3641). Badges: STATEMENT for
`src.kind === "said"` (the `.clue.said` gold edge at CSS 111 is colour only today),
EVIDENCE for `src.kind === "room"`, THE LIE beside `revealLie()` line 3706, CONTRADICTION
on the `.stamp` at 3641, EMPTY ROOM and GAVE NOTHING inside the two toasts at 3528
(`UI.emptyRoom`, `UI.emptyTalk`; `toast()` at 3540 has no icon slot, prepend one at 16x16).

**Shape law:** twelve marks must each read at 14 px, so each is one bold pictogram with
no interior detail: Alibi a standing pin, Ownership a luggage tag, Access a key, Sighting an
eye, Trace a boot print, Timeline a clock face, Wound a bandage cross, Motive a coin,
Company two linked rings, Empty room a closed door, Sequence three dots on a line, Object a
padlocked box. Statement is an open mouth, evidence is a magnifying glass; they must not
be told apart by gold versus cyan alone.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF, each
cell one bold flat pictogram in cream D8DDE6 with a single slate 8891A3 shadow shape,
drawn thick enough to read at 14 pixels, filling 70 percent of the cell.
Row 1: (1) ALIBI, a map pin standing on a short floor line. (2) OWNERSHIP, a luggage tag on
a loop of string. (3) ACCESS, an old fashioned door key with a round bow. (4) SIGHTING, one
open eye with a cyan 5AD1E6 iris. (5) TRACE, a single boot print. (6) TIMELINE, a round
clock face with two hands and no numerals.
Row 2: (7) WOUND, a bandage cross of two crossed strips. (8) MOTIVE, a coin with a hole
drilled through it, gold E8C37A. (9) COMPANY, two rings linked like a chain. (10) EMPTY
ROOM, a closed door with a keyhole. (11) SEQUENCE, three dots on a horizontal line with an
arrow head at the right. (12) OBJECT, a small locked strongbox with a cyan 5AD1E6 hasp.
Row 3 badges: (13) STATEMENT, an open speaking mouth in profile in candle gold E8C37A.
(14) EVIDENCE, a magnifying glass in cyan 5AD1E6. (15) THE LIE, the speaking mouth with a
gold E8C37A forked tongue and a crack through it. (16) CONTRADICTION, a rust red E8746A
wax seal stamped with a bold X. (17) EMPTY ROOM RESULT, an overturned empty drawer in slate
8891A3. (18) GAVE NOTHING, a closed mouth with a cream D8DDE6 line across it.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 06: Board marks and cell chrome

**PATCH-REQUIRED wiring:** `renderBoard` line 3365 sets `glyph` to the text characters
`✓`, `✕`, `?` or empty in a `.cell` button (52.8x52 at 375 wide, 19 px bold text, colour by
class `.y .n .q` at CSS 95 to 97). Replace the text with a 24x24 `<img>` per mark; keep
the four state cycle (`order = ["", "n", "y", "q"]` at 3369). The halo tile replaces the
`.cell.halo` background at CSS 98 (`rgba(90,209,230,.16)` fill plus a 1 px inset ring)
as a 52x52 `background-image`. The three column tab glyphs go inside the `.tabs` buttons
at 3344 (114x48) beside the words Weapon, Room, Hour. The counter ornament frames the
big cyan number in `.counter` at 3380 (26 px).

**Shape law:** yes, no and maybe must survive at 24 px in the same cyan: yes is a solid
tick, no is a thick X, maybe is a hollow question mark with a heavy dot. The halo is a
visible tile, not a tint: a cyan ring inset 2 px with four corner ticks.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, detective board marks as thick flat chalk strokes on nothing: (1) YES, a solid
heavy tick in cold cyan 5AD1E6 with a cream D8DDE6 edge. (2) NO, a thick X in slate
6B7382 drawn as two chalk strokes. (3) MAYBE, a hollow question mark with a heavy dot in
candle gold E8C37A. (4) HALO TILE, a square slate 14161D tile filling 90 percent of the cell
with a cyan 5AD1E6 ring inset from the edge and four short cyan corner ticks, centre empty.
Row 2: (5) EMPTY TILE, a plain square slate 14161D tile with a hairline 2A2F3B edge and a
faint diagonal chalk scuff. (6) WEAPON TAB, a crossed knife and poker in cream D8DDE6.
(7) ROOM TAB, a floor plan of three joined rooms in cream D8DDE6 with one door gap.
(8) HOUR TAB, a candle burned halfway with a cyan 5AD1E6 flame.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 07: Action and navigation icons

**PATCH-REQUIRED wiring:** every button is text only. The `.act` buttons (CSS 68, min
48x48, 11 px uppercase, a 9.5 px cost line below) are built at 3301 (Search / Searched),
3318 (Ask / Asked) and 3325 (Press / Pressed, with `.lock` when `pressUnlocked()` is
false and `.hot` when it is true and unspent). Prepend a 20x20 `<img>` above the label.
`.act.done` (dashed border), `.act.lock` and `.act.hot` differ by border colour only at
CSS 73 to 75, which breaks the shape law today; the four press cells fix that. Accuse is
`.danger` at 3265 (84x48). Exit ("Arcade") and Options are `.ghost` at 3250 and 3256
(65x48 and 68x48). The three bottom nav buttons at 3276 are 125x54 with an inset 2 px
cyan top bar when `.on`. Share 3648, Link 3456, Replay 3460, New case 3471, Today's case
3474, and the `.sw` switches at 3755 (64x48, text On / Off) take the rest.

**Shape law:** search is a magnifying glass, ask is a speech bubble, press is a fist on a
table. Done states are the same object with a cream tick cut into it, locked press is the
fist behind a chain, hot press is the fist with cyan motion lines. On and off switches
differ by a raised versus lowered lever, not by fill colour.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF, each
cell one flat pictogram in cream D8DDE6 with a slate 8891A3 shadow shape, thick enough to
read at 20 pixels, filling 70 percent of the cell.
Row 1: (1) SEARCH, a magnifying glass over a floorboard. (2) SEARCHED, the same glass with
a bold tick cut out of the lens. (3) ASK, a rounded speech bubble with three dots. (4) ASKED,
the same bubble with a bold tick inside instead of dots. (5) PRESS, a clenched fist coming
down on a table edge. (6) PRESSED, the same fist with a bold tick cut into the table.
Row 2: (7) PRESS LOCKED, the fist behind a slate 8891A3 chain with a padlock. (8) PRESS
HOT, the fist with three cyan 5AD1E6 impact lines and a cyan glow. (9) ACCUSE, a pointing
hand with the index finger extended, rust red E8746A. (10) EXIT, an arched doorway with an
arrow leaving left. (11) OPTIONS, a small brass E8C37A gear. (12) SHARE, an envelope with
a cyan 5AD1E6 wax seal.
Row 3: (13) LINK, two chain links in cyan 5AD1E6. (14) REPLAY, a curved arrow circling back
onto itself. (15) NEW CASE, a closed manila folder in slate 8891A3 with a cyan 5AD1E6 tab.
(16) TODAY'S CASE, a single calendar page with a candle gold E8C37A flame on it. (17)
SWITCH ON, a brass E8C37A toggle lever raised up with a cyan 5AD1E6 dot lit beneath it.
(18) SWITCH OFF, the same lever pushed down with the dot dark 2A2F3B.
Row 4 bottom navigation: (19) CASE TAB, an open dossier with a paper clip. (20) BOARD TAB,
a 3 by 3 grid with one cell ticked. (21) FILE TAB, a filing cabinet drawer half open. (22)
CASE TAB ACTIVE, the same dossier lit cyan 5AD1E6 with a cyan bar above it. (23) BOARD
TAB ACTIVE, the same grid lit cyan with a cyan bar above it. (24) FILE TAB ACTIVE, the same
drawer lit cyan with a cyan bar above it.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 08: Frames and panels (9-slice)

**PATCH-REQUIRED wiring:** these replace flat CSS fills. Apply with `border-image` or a
`background:url() center / 100% 100%` plus `image-rendering:auto` on: `.hd` (CSS 31,
375x60 at one line of title), `.watchbar` (44, 375x68), `.brief` (60, 355 x ~110, plus
`.brief.lying` at 109), `.row` (63, 355x56), `.clue` (102, 355 x min 48, `.sel` at 106,
`.said` at 111), `.ovbox` (122, 351 wide, up to 643 tall), `.wide` (129, 323x52, `.sec` at
131), `.bn` (54, 375x54 plus safe area), `.tabs button` (79, 114x48, `.on` at 81), `.stamp`
(134, 323 wide, `.lie` at 113), `.toast` (142, up to 330 wide), `.dz` (146, 355 x ~40),
`.arc` (149, 355x52), `.optrow.pickrow` (114, 323x56). Generate each as a 256x256 cell
whose corners are the 9-slice corners (24 px in the cell, 6 px in game) and whose middle
is a flat tileable fill.

**Shape law:** the honest brief and the lying brief differ by edge treatment (a straight
gold rule versus a torn red edge), the selected clue card has visible corner tabs not just
a colour change, a statement card has a curled paper corner, primary and secondary wide
buttons differ by fill versus outline plus a rivet at each end on the primary.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF, each
cell a flat rectangular UI panel filling 88 percent of the cell, built for nine slice
scaling: all detail in a 24 pixel band at the corners and edges, the middle a flat fill.
Row 1: (1) HEADER BAR, a wide strip in 111319 fading to 0C0E13 with a hairline 2A2F3B
bottom rule and a tiny brass E8C37A keyhole at the centre bottom. (2) WATCH BAR, a strip in
0C0E13 with a hairline 2A2F3B bottom rule and faint slate 39414F chain links along the
bottom edge. (3) BRIEF CARD HONEST, a slate 14161D panel with a 2A2F3B hairline and a
straight candle gold E8C37A rule down the left edge. (4) BRIEF CARD LYING, the same panel
with a torn rust red E8746A edge down the left. (5) ROW CARD, a slate 14161D panel with a
2A2F3B hairline and rounded 10 pixel corners. (6) CLUE CARD PLAIN, a slate 14161D index
card with a 2A2F3B hairline and a faint horizontal rule near the top.
Row 2: (7) CLUE CARD SELECTED, the index card with a cyan 5AD1E6 hairline and a small cyan
corner tab folded at the top right, ground darkened to 101A1F. (8) CLUE CARD STATEMENT,
the index card with a candle gold E8C37A left rule and a curled paper corner bottom right.
(9) OVERLAY BOX, a slate 14161D dossier folder with a 2A2F3B hairline, 14 pixel rounded
corners and a brass E8C37A corner rivet in each corner. (10) PRIMARY BUTTON, a solid cold
cyan 5AD1E6 pill with a slate 06222A rivet at each end. (11) SECONDARY BUTTON, the same
pill as a 2A2F3B hairline outline on nothing. (12) BOTTOM NAV, a strip in 0C0E13 with a
hairline 2A2F3B top rule.
Row 3: (13) TAB PILL OFF, a small slate 14161D pill with a 2A2F3B hairline. (14) TAB PILL
ON, the same pill filled solid cyan 5AD1E6. (15) RED STAMP, a rust red E8746A double rule
frame with rough stamped corners. (16) GOLD LIE STAMP, a candle gold E8C37A double rule
frame with rough stamped corners. (17) TOAST, a small dark 1D222C pill with a 2A2F3B
hairline and a cyan 5AD1E6 dot at the left. (18) DOSSIER TILE, a slate 14161D tile with a
2A2F3B hairline and a punched ring binder hole at the left edge.
Even spacing, one panel per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 09: Hours and events

**PATCH-REQUIRED wiring:** the hour column headers on the board (line 3360, `.grid .hc`
36 px tall, `TIME_HEAD` = 7 8 9 10 11 12) and the accuse "When" picker (3570, `TIMES` =
7pm to midnight) are text. Prepend a 24x24 `<img>` in the header and 28x28 in the picker
cell (keep the text, hours must stay readable). The reveal beat 2 at 3686 takes the hour at
96x96. The eight `EVENTS` (line 354) appear only inside Sequence clue text ("after the dinner
bell at 8pm and before the last train at 11pm"); their cells are a priority 3 flourish for
the Sequence clue tag at 14x14 and are not required for launch.

**Shape law:** the six hours are one candle burning down, so height of the candle is the
read: full at 7pm, a stub at midnight. Ruled out is the candle snuffed with a slate X of
smoke. Window is two candles with a bracket between them.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, a single cream D8DDE6 candle in a brass E8C37A holder with a candle gold E8C37A
flame, burning down across the row: (1) SEVEN, tall full candle. (2) EIGHT, five sixths.
(3) NINE, two thirds. (4) TEN, half. (5) ELEVEN, one third. (6) MIDNIGHT, a stub with the
flame turned cold cyan 5AD1E6. (7) RULED OUT, a snuffed candle with a slate 8891A3 smoke
curl in the shape of an X. (8) WINDOW, two short candles with a cream D8DDE6 bracket
arching between their flames.
Row 2, eight small event pictograms in cream D8DDE6 with a slate 8891A3 shadow: (9) THE
DINNER BELL, a hand bell. (10) THE SECOND COURSE, a domed serving cloche. (11) THE CAR IN
THE DRIVE, a 1930s car headlamp seen head on. (12) THE STORM BREAKING, a lightning bolt over
a rain line. (13) THE DOG BARKING, a dog head in profile with an open mouth. (14) THE LAST
TRAIN, a locomotive front with one cyan 5AD1E6 lamp. (15) THE LAMPS GOING OUT, an oil lamp
with a dark 2A2F3B chimney and no flame. (16) THE PIANO STOPPING, a raised piano lid with
three keys.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 10: Result marks, stars and seals

**PATCH-REQUIRED wiring:** `openReveal` line 3625 builds `.stars` as the literal
character `★` repeated `st.stars` times at 26 px gold with 6 px letter spacing; the archive
rows at 3454 repeat the same character at 11 px. Replace with `<img>` per star, 28x28 on the
reveal and 12x12 in the archive, and always draw three slots (lit and unlit) so one star
reads as one of three. The Case Closed and Wrong seals sit beside the `h3` at 3623 at 96x96.
The daily seal goes on the "Today's case" button at 3474 and on the reveal when
`APP.isDaily`. The streak mark goes beside `st.dailyStreak` in the Options record at 3768.
The share mark is the `.wide` share button at 3648.

**Shape law:** lit and unlit stars differ by fill and by a spark, not by colour alone
(unlit is an outline with no spark). Case Closed is a wax seal with a keyhole; Wrong is the
same seal cracked in two with a red X. The daily seal is a calendar page, the streak is a
row of small flames.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1: (1) STAR LIT, a five point star filled solid candle gold E8C37A with a small cream
D8DDE6 spark at its upper right point. (2) STAR UNLIT, the same star as a thin slate
2A2F3B outline with no fill and no spark. (3) THREE STAR ROW, three lit gold E8C37A stars
side by side, the middle one slightly larger. (4) CASE CLOSED SEAL, a round wax seal in
cold cyan 5AD1E6 pressed with a keyhole, on a short cream D8DDE6 ribbon.
Row 2: (5) WRONG SEAL, the same round seal cracked into two halves in rust red E8746A
with a bold X pressed into it. (6) DAILY SEAL, a single calendar page in cream D8DDE6 with
a candle gold E8C37A flame in place of the date. (7) STREAK MARK, a row of four small
candle gold E8C37A flames rising left to right. (8) SHARE MARK, a sealed envelope with a
cyan 5AD1E6 wax seal and a cream D8DDE6 corner lifted.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 11: Screen plates

**PATCH-REQUIRED wiring:** every overlay opens with an `h3` of 12 px gold uppercase text
and nothing else: `openPicker` 3487 ("Pick a case"), `openAccuse` 3564 ("Accuse"),
`openReveal` 3623 ("Case closed" / "Wrong"), `openOptions` 3749 ("Options"). Insert a
323x64 `<img>` plate above each `h3` inside `.ovbox`. The three tier rows in the picker
(3490, `.optrow.pickrow` 323x56) take the short, standard and long cells at 40x40 on the
left; the liar toggle row (3499) takes the liar cell. The two empty states,
`UI.nothingYet` at 3387 (board journal) and `UI.noArchive` at 3448 (File tab), take a
plate at 355x64. The house brief plate heads the `.brief` card at 3287. These are the
only screens the game has; there is no title, how to or pause screen to dress.

**Shape law:** each plate is a wide landscape vignette with a single readable object, no
figures with faces. Short, standard and long tiers differ by the number of lit candles
(one, two, three), the liar cell is a candle with a forked flame.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 6 columns, each cell 512x256 pixels on flat magenta FF00FF, each
cell a wide landscape vignette panel filling 90 percent of the cell on a 14161D ground with
a 2A2F3B hairline frame.
Row 1: (1) PICK A CASE, three closed manila dossiers fanned on a desk under one cyan
5AD1E6 desk lamp. (2) ACCUSE, a pointing hand in charcoal 39414F entering from the left
toward an empty chair, lit rust red E8746A from the right. (3) CASE CLOSED, a dossier tied
shut with cream D8DDE6 string under a cyan 5AD1E6 wax seal, first grey dawn light 8891A3 at
a window behind. (4) WRONG, the same dossier fallen open with pages sliding out, the desk
lamp knocked over and glowing rust red E8746A. (5) OPTIONS, a row of brass E8C37A wall
switches and one small gear on a slate panel. (6) THE HOUSE BRIEF, the dark silhouette of
a country house at night with one window lit candle gold E8C37A and one lit cold cyan 5AD1E6.
Row 2: (7) QUICK CASE, one lit candle gold E8C37A candle on a saucer. (8) STANDARD CASE,
two lit candles in a double holder. (9) LONG CASE, three lit candles in a candelabra.
(10) LIAR, one candle whose flame forks into two tongues, one gold E8C37A and one cyan
5AD1E6. (11) NOTHING YET, an empty open notebook with a pencil laid across it, one cyan
5AD1E6 highlight on the pencil. (12) NO OLD CASES, an empty filing drawer pulled open
with a single slate 8891A3 divider inside.
Even spacing, one vignette per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 12: Backgrounds

**PATCH-REQUIRED wiring:** `body{background:var(--bg)}` at CSS 23 is a flat `#0a0b0f`;
add `background:#0a0b0f url(art/bg-house.jpg?v=1) center top / cover fixed`. `.gridwrap`
at CSS 85 is flat `--panel`; give it the board felt tile. `.ov` at CSS 120 is a 94 percent
scrim; layer the scrim art at `opacity` so text stays readable. The solved and failed
plates go behind `.ovbox` only inside `openReveal` (3620) by adding a class to `#ov`
(`won` or `lost`) at 3621. There is no parallax and no scrolling background; `main` scrolls
over a fixed body. Keep every background 90 percent darker than `#14161d` in its middle
band or the 13.5 px clue text at `#c8d0dd` loses contrast.

**Shape law:** the house ground must be nearly empty in the centre column where the panels
sit; all silhouette interest lives in the top 15 percent and bottom 10 percent. The
solved and failed plates differ by light direction and colour temperature (dawn from above
in cyan grey versus one red lamp from below), never by adding figures.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 1 row x 5 columns, each cell 1080x1920 pixels portrait, cells separated by
a 32 pixel flat magenta FF00FF gutter, every cell a full bleed background with its whole
middle 70 percent kept almost empty and very dark 0A0B0F so interface panels can sit on
it.
(1) HOUSE GROUND, the interior of a dark country house hall seen from the stair: a faint
slate 14161D wainscot line low on the walls, a single cold cyan 5AD1E6 glow at the very top
edge from an unseen lamp, a thin candle gold E8C37A sliver under a door at the very bottom
edge, nothing else.
(2) BOARD FELT, a seamless tileable dark green black felt texture 0D1210 with a faint
chalk grid scuff, no objects, no light source.
(3) OVERLAY SCRIM, near black 06070A with a very soft cyan 5AD1E6 vignette in the top
corners only, no objects.
(4) SOLVED DAWN, the same hall as cell 1 with cold grey cyan dawn 8891A3 pouring down
from a tall window at the top edge, the candle sliver at the bottom gone out.
(5) FAILED LAMP, the same hall as cell 1 lit from the bottom edge by one rust red E8746A
lamp glow, long charcoal 39414F shadows rising up the walls, the top edge fully dark.
Nothing touching cell edges except the deliberate edge lighting, no text anywhere.

---

## Sheet 13: Icon and tile

**PATCH-REQUIRED wiring:** `icon-192.png`, `icon-512.png` and `icon-maskable-512.png`
already exist (a cyan keyhole on `#0a0b0f` in front of a dark triangle) and are wired in
the `<head>` at lines 12 to 14 and `manifest.webmanifest`. Regenerating them is optional;
if regenerated they must keep the keyhole so installed users still find the tile. The
maskable cell must keep all detail inside the centre 80 percent. The portal tile is for
the Sky Wolf Studio portal card and is not referenced by this file.

**Shape law:** the keyhole silhouette is the icon; do not add a figure, a house or a
magnifying glass to it. The maskable version fills the ground to the edge.

**PROMPT (copy-paste):**

Blackout style: flat graphic noir of a country house after the lamps fail, near black ink
blue ground 0A0B0F with slate panels 14161D and hairline borders 2A2F3B, hard clean
paper cut silhouettes with no outlines, exactly two light sources in the whole world: one
cold cyan lamp 5AD1E6 and one warm candle gold E8C37A, a rust red E8746A used only for
danger, mid tones in dusty slate 8891A3 and figures in charcoal 39414F, highlights in cream
D8DDE6, matte finish, soft rim glow only, tabletop mystery card feel, crisp game asset edges,
no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 1 row x 3 columns, each cell 512x512 pixels, cells separated by a 32 pixel
flat magenta FF00FF gutter.
(1) APP ICON, a square 0A0B0F tile with 14161D inner border, a bold cold cyan 5AD1E6
keyhole silhouette centred, a faint charcoal 1E2A33 candle flame shape rising behind it,
one tiny candle gold E8C37A glint on the keyhole rim.
(2) MASKABLE ICON, the same keyhole with the 0A0B0F ground filled to every edge and all
detail inside the centre 80 percent of the cell.
(3) PORTAL TILE, a 512x512 card with the same keyhole small at the top and below it the
dark silhouette of a country house at night with one window in candle gold E8C37A and one
in cold cyan 5AD1E6, no figures.
Nothing touching cell edges except the deliberate full ground in cell 2, no text anywhere.

---

## Full animation sets

A character is not done when it can stand. Blackout has no per frame motion loop (every
tap rebuilds the DOM, see the architecture note), so animation is CSS keyframes swapping
cells on a class. Each suspect still needs the full set so the same person can be met,
questioned, leaned on, revealed and caught without a pose being reused for two meanings:

| character | idle | move | hit | die | win | extra |
|---|---|---|---|---|---|---|
| Each of the six suspects (sheet 01) | NEUTRAL x1 | ASKED x1 (turn away) | PRESSED x1 (leaning in) | GUILTY x1 (head down, hand behind back) | LIAR x1 (hand over mouth) | for a 2 frame breathe on the Case tab add NEUTRAL B with the chest raised 2 px; for the reveal add GUILTY B with the head lifted, so `beats()` can cut between them at the 260 ms beat interval (line 3698) |
| Pocket watch (sheet 04) | FACE CYAN | ring and hand sweep (computed) | FACE WARM with the crown popped, plus a 2 frame crack widening at 4 and 2 actions left | FACE EXHAUSTED | none, the watch never wins | the 6 baked fill frames are the fallback when the SVG ring is dropped |
| Board marks (sheet 06) | EMPTY TILE | none | YES / NO / MAYBE appear (a 2 frame chalk stroke each: half stroke, full stroke) | none | HALO TILE pulse (2 frames: ring at .5 and at 1) | |
| Case Closed / Wrong seals (sheet 10) | none | none | WRONG seal 2 frames (whole, cracked) | none | CASE CLOSED seal 2 frames (hovering, pressed) | |

Minimum frame count to ship art without a pose collision: 30 suspect cells, 12 watch
cells, 8 board cells. The extras column is what makes the game stop looking still.

---

## Coverage: every draw function and which sheet covers it

| function | line | what it draws | sheet |
|---|---|---|---|
| `silhouette(i)` | 3078 | 34x44 SVG suspect figure | 01 |
| `tagsFor(i)` | 3089 | "tall staff spectacles" text under a name | 01 (traits must be visible in the cell) |
| `watchSvg(left, total)` | 3098 | 52x52 SVG pocket watch | 04 |
| `el(tag, cls, txt)` / `clear(n)` | 3069 / 3075 | DOM helpers, no art | none |
| `render()` | 3245 | header, watch bar, active tab, bottom nav, triggers reveal | 07 (exit, options, nav), 08 (header, watch bar, nav) |
| `renderCase(main)` | 3286 | brief card, six room rows, six suspect rows with Search / Ask / Press | 01, 03, 05 (statement badge not here, see board), 07, 08, 11 (house brief plate) |
| `colLabel(tab, i)` | 3338 | board column header text | 02, 03, 09 (column glyphs) |
| `renderBoard(main)` | 3343 | three tab pills, 6x6 grid, marks, halo, possibilities counter, journal clue cards | 06, 08, 05, 09, 11 (nothing yet plate) |
| `card(id)` inside `renderBoard` | 3394 | one journal clue card with tag and text | 05, 08 |
| `renderFile(main)` | 3417 | dossier tiles for people, weapons, rooms; archive rows; New case and Today's case buttons | 01, 02, 03, 08, 10, 07, 11 (no old cases plate) |
| `openPicker()` | 3482 | Pick a case overlay: three tier rows, liar switch, Open the file, Back | 11, 07, 08 |
| `doAction(act)` / `invalidText(why)` | 3518 / 3532 | no drawing, fires toasts | 05 (toast badges) |
| `toast(msg)` | 3540 | bottom toast pill | 08, 05 |
| `overlay(build)` | 3547 | scrim and `.ovbox` | 08, 12 |
| `openAccuse()` | 3557 | four 3x2 picker grids, Name them, Back | 01, 02, 03, 09, 11, 08 |
| `recordResult()` | 3599 | no drawing, saves | none |
| `openReveal()` | 3620 | Case closed / Wrong, stars, beats, lie stamp, teach stamp, worked notes, Share, New case, Back | 10, 01, 02, 03, 09, 05, 08, 11, 12 |
| `typeBeat(node, text)` | 3664 | typewriter text, no art | none |
| `beats(box, T)` | 3686 | the three reveal lines | 01 (guilty), 03 (scene), 09 (hour), 02 (weapon) |
| `revealLie(box)` | 3702 | gold lie stamp | 05 (the lie badge), 01 (liar cell), 08 |
| `doShare()` / `copyCaseLink()` / `caseUrl()` | 3712 / 3739 / 3733 | no drawing | none |
| `newRandomCase()` / `startCase()` / `persistResume()` | 3725 / 3223 / 3239 | no drawing | none |
| `openOptions()` | 3745 | five switch rows, Record line, Back | 07 (switches), 11, 08, 10 (streak mark) |
| `boot()` | 3795 | boots the case; the `?test=1` panel at 3831 is a developer surface | none (do not dress the test panel) |
| audio: `audioInit pluck tick pad roomTone buzz` | 3118 to 3190 | sound and haptics only | none |

Every function that touches the DOM is in the table above. Nothing in lines 160 to 3067
(generator, solver, state machine, save, tests) draws.

## Things in the code worth knowing before generating

- The header comment at line 173 says unreliable narrators are "not built"; they are
  (`makeLie` 1219, `liarMask` 1184, liar mode is live in the picker). The comment is stale.
- BUILD-NOTES section 6 still lists the old `64px + repeat(6, minmax(46px,1fr))` grid; the
  live CSS at line 87 is `56px repeat(6, minmax(52px,1fr))`, so cells are 52.8x52 at 375.
- Four states are colour only today and fail the shape law until sheets land: `.act.hot`
  versus `.act.lock` (CSS 74 and 75), `.wtx.low` (49), `.clue.said` (111), `.cell.q` (97).
- The `?test=1` results panel (line 3831) is the only screen unreachable from the UI.
- `save.unlocks` (line 2183), `stats.bestStars` and `best.fewestActions` are stored and
  never shown anywhere; there is no visual for a personal best.
- Weapons, rooms, hours and events have no visual at all today; they are names in text.
- Search result "Nothing here worth carrying away" and Ask result "They give you nothing"
  are toasts with no icon slot; sheet 05 cells 17 and 18 are the first art those moments
  will have.
