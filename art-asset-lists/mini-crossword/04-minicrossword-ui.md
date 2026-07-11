<!-- Mini Crossword · Sheet 4: UI / Chrome — title crest, mode plaques, HUD chips, clue bar, ‹ › nav, shop frame, win emblem, Ink Streak nib -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Sunday Inkwell" (Mini Crossword / Sky Wolf Studios five-by-five word puzzle). A midnight newspaper puzzle desk under one warm lamp: brass-and-paper chrome, quiet lamplight over deep plum-black, flat gouache-and-ink rendering, ONE warm lamp key light from the upper-left, restrained gilt glints; matte, never glossy, never neon. Rounded, chunky, kid-friendly, readable at thumbnail size. Palette: plum-black screens #0d0a14 / #070510 / #0a0714 / #150f26; plum panels #140f24 / #191330 / #1b1636 / #211a3a; ink-rule #2c2440; lamp gold #c8a84b, warm #ffd76a, gilt #ffe6a0; cream #e8dcc8, muted #94889f; fountain blue #5b9bd5, emerald teal #46b3a6, solved green #78dc96. This is a WORD game whose every LABEL, EMOJI and CLUE is live DOM TEXT drawn ON TOP of these plates (`⌂ ✒ 💧 ‹ › MINI CROSSWORD 📅 ♾️ ⏱️ 🌙 🛒 ❓`), so the art has ABSOLUTELY NO letters, numbers, words, glyphs or watermarks — every crest, plaque, chip and frame is a BLANK backing with a calm center where the DOM text lands. Icons that ARE art (the crest grid, the win burst, the streak nib) are pictographic only. State is shape-distinct, never hue-only. Compress each PNG under 150KB.

Create one sprite sheet. File: mc_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 256x256. Master: 1024x1024.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Each piece centered, upright, inside its cell with margin, NO ground shadow (these composite as CSS backgrounds / overlays behind DOM text). Wider-than-tall pieces (crest, plaques, clue bar) are centered with generous side margin — the engine stretches them via background-size. These are purely cosmetic chrome — they never change any control's behavior.

TITLE CREST (cell 1):
1. title_crest — the wordmark backing behind the DOM `MINI CROSSWORD` (h1). A small pictographic mini-crossword crest: a rounded plum #140f24 tile holding a tiny 3x3 hint of blank crossword squares (a couple cream #e8dcc8 fills, one dark #0d0a14 block, one gold #c8a84b block — matching the game's installed favicon), wreathed in a faint gold #c8a84b lamplit flourish. NO letters — the title text sits below / over it in the DOM.

MODE PLAQUES (cells 2-5) — the four mode-button backings (the DOM prints emoji + label on top; match each button's tint from the CSS `.btn` variants):
2. plaque_gold — Daily Mini backing: rounded plaque, gold #c8a84b66 edge, warm #2a2410 to #171307 face, a faint lamp glint (`.btn.gold`).
3. plaque_teal — Endless backing: emerald-teal #46b3a655 edge, #0f2320 to #08150f face (`.btn.teal`).
4. plaque_blue — Time Trial backing: fountain-blue #5b9bd54d edge, #14202b to #0b1219 face (`.btn.blue`).
5. plaque_plum — Zen backing: the default plum plaque, cream #ffffff26 hairline edge, #1e1836 to #131024 face (`.btn`). Also reused for the NEW MINI button.

CHIPS & BUTTONS (cells 6-8):
6. btn_sm — the small secondary button backing (Ink Shop / How / menu): a shorter rounded plum plaque, #1e1836 to #131024 face, cream hairline rim (`.btn.sm`).
7. hud_chip — the top HUD chip backing behind mode / time / streak / ink: a small rounded plum #140f24 (translucent-feel) tile, thin cream #ffffff24 rim, calm center for the DOM value + label (`#hud .chip`). One shared chip used four times.
8. hud_home — the `⌂` home button backing: a rounded plum #140f24 square, cream #ffffff2e rim, calm center for the DOM house glyph (`#hud .hbtn`).

CLUE BAR & NAV (cells 9-11):
9. cluebar_frame — the clue-text plate: a wide rounded panel, plum #1b1636 face with a warm gold #c8a84b40 edge, and a small tucked label-pill at the far LEFT (a gold-rimmed nook where the DOM prints `1A`) — the rest a calm field for the clue text. NO letters (`#cluebar .cluetext` + the `b` label).
10. nav_prev — the `‹` previous-word button backing: a tall rounded plum #191330 (translucent-feel) tile, cream hairline rim, a subtle left-pointing brass fitting HINT baked into the plate edge (pictographic, not an arrow glyph — the DOM `‹` sits on top).
11. nav_next — the `›` next-word button backing: mirror of cell 10, right-side fitting hint.

SHOP FRAME (cell 12):
12. scard_frame — the shop card backing (`.scard`): a rounded plum #161130 tile, thin cream rim, a small brass hanging-tag or shelf lip at the top so pens/papers read as displayed goods. Include, tucked in the corners, the two state accents pictographically: a soft blue #5b9bd544 "owned" rim and a gold #c8a84b99 "equipped" rim (the engine toggles `.scard.owned` / `.scard.sel`).

CELEBRATION & STREAK (cells 13-14):
13. win_emblem — the SOLVED celebration burst behind the DOM `SOLVED` / `CLEAN SOLVE!` title on the win screen: a warm radial lamp-bloom in solved-green #78dc96 and gold #c8a84b with a scatter of tiny gilt sparks and a faint laurel of ink flourishes (pictographic, NO letters), calm center for the DOM text.
14. inkstreak_nib — the Ink Streak flourish (the game's twist): a single fountain nib in gilt gold #c8a84b / #ffe6a0 trailing a confident ink-stroke flourish that curls into a small unbroken ribbon — reads as "an unbroken error-free run." Companion to the DOM `✒`; used by the streak HUD chip and on the win screen when the streak grows. NO number baked in.

DRESSING (cells 15-16):
15. toast_plate — the toast pop-up backing: a small rounded plum #140f24 pill with a gold #c8a84b55 rim and soft warm glow, calm center for the DOM message (`#toast`).
16. corner_ornament — a small brass-and-ink desk corner flourish (a lamplit filigree quarter-ornament) for framing screens / dividers — pictographic, optional polish.

WIRE: DROP-IN for the CSS-backed chrome — set as `background-image` with existing colors as fallback: title_crest→`h1` region on `#s-title` (~57/111), plaque_gold/teal/blue/plum→`.btn.gold`/`.btn.teal`/`.btn.blue`/`.btn` (~62-66), btn_sm→`.btn.sm` (~67), hud_chip→`#hud .chip` (~31), hud_home→`#hud .hbtn` (~29), cluebar_frame→`#cluebar .cluetext` (~40), nav_prev/nav_next→`#cluebar .nav` (~38, differentiate by nth-child), scard_frame→`.scard` with `.owned`/`.sel` accents (~81-85), toast_plate→`#toast` (~69). PATCH (light): win_emblem composites onto `#s-over` at `doWin` (~1092, the clean-solve title already swaps there), inkstreak_nib dresses the `#h-streak` chip and the win screen when `streakGrew` (~1079). corner_ornament is optional. The DOM keeps every label, emoji, clue and value as text on top (the absent-asset fallback). Path-version every file `?v=BUILD`.
