# Mini Crossword — Art Pack

> A five by five in a minute. Fill every square across and down, keep an error free Ink Streak, and spend the ink you earn on pens and papers at the desk.

**Genre:** NYT style mini crossword (single-file HTML5, 540×960 portrait stage). The **5×5 board is canvas-drawn** (`#game`, 540×820) by `render()`; the title / win / shop / how screens are **DOM overlays** on top of it, and the on-screen **QWERTY keyboard**, **HUD chips** and **clue bar** are DOM. A generator fills a 180-symmetric black-square template with real words from a 609 entry clue bank, every white cell checked in both directions. Tap a square to pick its word, tap again to flip Across / Down, type on the keyboard, use the **‹ ›** arrows to jump words. Four modes: **Daily Mini** (one shared puzzle a day), **Endless** (fresh minis), **Time Trial** (race the clock), **Zen** (auto check, wrong letters glow red, pays nothing so it never risks your streak). Solve with no wrong letters and your **Ink Streak** grows, inking new pens and papers; one wrong letter breaks the streak for that puzzle. There is no way to truly lose.

_The game already ships and plays procedurally (`satellites/mini-crossword/index.html`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game economy. The generator, black-square templates, clue bank, tap-to-flip, ink math, streak gates and every threshold are IDENTICAL across every theme below; only the skin changes. **Critical constraint for a crossword:** the clue **NUMBERS** and the entered **LETTERS** are ALL drawn live as engine TEXT on top of the board (exactly like Rule Root keeps its word tiles engine-rendered). So this art supplies the paper, the board furniture, the chrome and the shop cosmetics — and NOTHING in any sheet may contain a letter, a number or any glyph. Cell centers and the top-left number corner stay calm so the engine text always reads._

## Pick a look — theme direction

⚖️ **Director note:** NON-botanical lead by design. A mini crossword is a newspaper puzzle-desk game, not a garden — the desk, the paper and the pen ARE the content, so the reskin leaves the garden entirely. Three directions below, cozy → polished, all kid-friendly, with a recommendation.

### 1. Sunday Inkwell ⭐ RECOMMENDED (cozy, native)
*A midnight newspaper puzzle desk under one warm lamp. The board is the day's mini printed on a paper stock; guesses are fountain-pen ink; the pen you wear rests in a little brass tray beside the grid; solved puzzles get a quiet lamplit glow. Aged paper, halftone print dots, deckled edges, warm gold light over deep plum-black. Everything matte, papery, unhurried.*

**Why this one:** it is a 1:1 fit with what the code already renders. The play surface IS a paper field lit against a dark desk (`PAPERS[]` beds like Newsprint `#181228` on `#0d0a14`), the cosmetics ARE four papers and five pens (`PAPERS[]` / `PENS[]`), the shop already draws pen swatches and paper previews (`drawSwatch`), and the whole thing rides the app's own plum / gold / cream palette so integration risk is near zero. The wardrobe's real unlockables (Graph, Midnight, Parchment papers; Fountain, Emerald, Ruby, Gold Nib pens) become covetable objects on the desk instead of flat CSS fills. The Ink Streak twist gets a literal home: a nib flourish that grows as you solve clean. Cozy, papery, exactly the speed of a one minute puzzle.

### 2. Nightdesk (alt, cozier / more intimate)
*A moonlit study desk: a leather blotter, a cooling cup of tea, the mini on a loose sheet, a single lamp. Warmer and more personal than a newsroom.* Lovely and huggable, and it flatters the same warm palette — but it overlaps Sunday Inkwell without beating it, reads more "generic cozy study" than "puzzle desk," and gives the paper stocks and pens less of a reason to be the heroes. Best held in reserve as a future desk backdrop set (a "Blotter" paper and a "Teastain" pen would slot straight into the existing arrays).

### 3. Letterpress (alt, polished / graphic / more mature)
*A clean modern printshop: crisp two-color letterpress plates, metal type furniture, ink rollers, registration crosses, a tidy composing stone.* Bold, graphic and grown-up while staying kid-friendly, and "furniture that locks type into a grid" maps beautifully onto crossword cells. **Why not the lead:** its native look wants bright, high-key press inks and clean white stock, which fights the game's locked plum-black palette AND the hard calm-cell rule (busy plates would crowd the engine letters). Borrow its registration-cross motif for the outer grid frame and its roller texture for the Graph paper, but keep it in reserve.

**Recommendation: Sunday Inkwell.** It is the boldest step out of the garden that still sits natively on every plum / gold / cream anchor the engine already draws with, it matches the `PAPERS` / `PENS` names word for word, and the cosmetics literally ARE papers and pens so the wardrobe needs no fiction rewrite. Hold Nightdesk as a future backdrop set and lift Letterpress's registration crosses for the grid frame. **All sheets below bake the Sunday Inkwell look in.**

## Sheets (generate each separately)

- `01-minicrossword-papers.md` — Papers & Board — the 4 paper board backdrops (full-bleed) + their cell-tile treatments (normal / black square / in-word / selected) + paper shop chips. 💰 COSMETICS (the papers are half the wardrobe).
- `02-minicrossword-pens.md` — Pens — the 5 pen-nib shop icons + cursor-ring treatments + ink token. 💰 COSMETICS (the pens are the other half).
- `03-minicrossword-keyboard.md` — Keyboard — key-cap skins (normal / pressed / amber DIR toggle / wide backspace) + deck.
- `04-minicrossword-ui.md` — UI / Chrome — title crest, 4 mode plaques, HUD chips, clue bar frame, ‹ › nav, shop card frame, win emblem, the Ink Streak nib flourish.

## Cosmetics economy (💰 — the wardrobe lives in sheets 01 + 02)

Every Mini Crossword cosmetic is earned by **PLAYING** — no loot boxes, no randomized purchases, nothing that changes a puzzle, the black-square template, the clue bank or a payout. Everything is a **KNOWN unlock at a KNOWN price or streak gate** printed right on its shop card (`renderShop` shows `💧 price`, `equipped`, `tap to use`, or the streak gate text). All of it is already wired in `localStorage` key **`minicrossword_save`** (the `PROG` object). Two cosmetic families:

| Cosmetic | Family | What it changes | Unlock | Code |
|---|---|---|---|---|
| **Ballpoint** | Pen | ink `#e8dcc8` + cursor `#c8a84b` | free (starter) | `PENS.ballpoint` |
| **Fountain** | Pen | ink `#9ec8f0` + cursor `#5b9bd5` | 💧 80 ink | `PENS.fountain` |
| **Emerald** | Pen | ink `#7fdcc0` + cursor `#46b3a6` | 💧 120 ink | `PENS.emerald` |
| **Ruby** | Pen | ink `#f0a0b4` + cursor `#e58fa0` | 💧 120 ink | `PENS.ruby` |
| **Gold Nib** | Pen | ink `#ffe6a0` + cursor `#ffd76a` | free at **Ink Streak 10** | `PENS.gold`, gated `bestStreak>=10` |
| **Newsprint** | Paper | bed `#181228` on `#0d0a14`, rule `#2c2440` | free (starter) | `PAPERS.newsprint` |
| **Graph** | Paper | bed `#122028` on `#0a1216`, rule `#1f3a44` | 💧 90 ink | `PAPERS.graph` |
| **Midnight** | Paper | bed `#141428` on `#0a0a16`, rule `#28285a` | 💧 140 ink | `PAPERS.midnight` |
| **Parchment** | Paper | bed `#241a0c` on `#161006`, rule `#4a3820` | free at **Ink Streak 5** | `PAPERS.parchment`, gated `bestStreak>=5` |

**Two earn faucets, both real `PROG` fields.** **Ink** (`PROG.ink`, HUD `💧`) is the shop currency — earned per solve = **8 base + up to 10 for speed under a minute + 6 for a clean (error free) solve** (`doWin`, `CUR.ink=8+floor(max(0,60-seconds)/6)+(clean?6:0)`); it buys the priced pens and papers. **Ink Streak** (`PROG.streak` live, `PROG.bestStreak` record, HUD `✒`) counts consecutive error-free solves; **best streak** is the mastery gate that inks the two free-but-locked prizes (Parchment at 5, Gold Nib at 10) — the prettiest desk belongs to players who solve clean. Zen never touches the streak and never pays, by design.

**Currency lanes stay locked.** Ink buys cosmetics only — no cosmetic ever costs Sunbeams, and there are no mystery boxes. Sunbeams remain the portal earn (`_sbCapEarn`, hard-capped **12/run** in `payRun` and **30/day** under `sw_sb_minicrossword`; Daily clean pays 4, Endless clean 2, Time Trial 2 to 12 by speed, Zen 0). Skins are purely visual — `paper()` / `pen()` only change fill and stroke colors and touch nothing else.

## Letters & numbers stay engine text (read before generating)

`render()` draws every clue **number** (top-left of its cell, `pp.num` 12px) and every entered **letter** (cell center, `pe.ink` bold) as live canvas TEXT, and the DOM owns every label, emoji and clue string (`⌂ ✒ 💧 ‹ › ◀▶ ⌫`, `MINI CROSSWORD`, `Daily Mini`, clue text, etc.). **No sheet may contain any letter, number, word or glyph.** Keep two zones calm on every board asset: the **cell center** (letters land here) and the **top-left number corner** of each cell (numbers land here). Icons are pictographic only.

## Style block

```
STYLE — "Sunday Inkwell" (Mini Crossword / Sky Wolf Studios five-by-five word puzzle). A midnight newspaper puzzle desk under one warm lamp: aged paper stocks, fountain-pen ink, a folded morning paper, a small brass pen rest, quiet lamplight over deep plum-black. Cozy, papery, matte — soft torn / deckled paper edges, faint fiber grain and halftone print dots, flat gouache-and-ink rendering, ONE warm lamp key light from the upper-left and a soft warm vignette; restrained, never glossy, never neon. Rounded, chunky, kid-friendly shapes, readable at thumbnail size. Palette (the game's real colors): plum-black screens #0d0a14 / #070510 / #0a0714 / #150f26 over void #000; lamp gold #c8a84b, warm #ffd76a, gilt highlight #ffe6a0; cream ink #e8dcc8, muted #94889f; ink-rule plum #2c2440, plum panels #211a3a / #191330 / #161228 / #140f24; fountain blue #5b9bd5 / #9ec8f0, emerald teal #46b3a6 / #7fdcc0, ruby rose #e58fa0 / #f0a0b4; paper stocks — newsprint bed #181228 on #0d0a14 with rule #2c2440, graph bed #122028 on #0a1216 with teal rule #1f3a44, parchment bed #241a0c on #161006 with amber rule #4a3820, midnight-slate bed #141428 on #0a0a16 with indigo rule #28285a; black-square inks #050308 / #04080a / #0a0703 / #040410; warm SELECT amber #3a3016 and dimmer IN-WORD amber #241f14; solved green #78dc96; wrong-letter red #ff6a5a. This is a WORD game whose LETTERS and CLUE NUMBERS are ALL drawn live as engine TEXT on top of the art — so the art must contain ABSOLUTELY NO letters, numbers, words, glyphs, logos or watermarks anywhere; every paper, cell tile, key-cap, nib and plate is blank, and each cell's CENTER and TOP-LEFT number corner stay calm so the engine text reads cleanly. State cues must be shape-distinct, never hue-only (selected = warm amber bed PLUS a bright pen-color ring, current word = a dimmer amber bed, black square = a solid inked block, wrong-in-Zen = a red corner slash). Flat front-on desk camera, every subject centered and upright in its cell. Each PNG must compress under 150KB — flat papery fills and a tight palette make this easy. Per-sheet knockout / layout rule stated in that sheet's block MUST be followed exactly.
```

## Board geometry (for the calm-center rule)

The canvas is 540×820. The 5×5 grid is a centered 410×410 square at **x 65 to 475, y 96 to 506** (`GEO.cell=82, ox=65, oy=96`), with an 82px cell pitch. The HUD sits in the top strip (y 0 to ~90), the clue bar overlays at y 470 to 534, and the keyboard fills the bottom. So on the paper backdrops keep the central grid bed (roughly x 60 to 480, y 90 to 510) quiet and give the desk detail (lamp glow, pen rest, folded paper corner, halftone) to the top strip and the lower apron and side margins.

## Wire notes (per sheet, tied to real functions)

- **Sheet 01 Papers** — the board backdrops are a **PATCH**: `render()` fills the canvas with `pp.bg` then paints cells (index.html ~1129-1136); a backdrop blit is a small add before the cell loop, and the four cell-state fills (`pp.cell` / `pp.black` / `#241f14` in-word / `#3a3016` selected, ~1132-1135) become `drawImage` blits keyed off `PROG.paper`. The paper **shop chips** patch the paper branch of `drawSwatch` (~1194-1197). Keep every existing fill as the absent-asset fallback.
- **Sheet 02 Pens** — the **nib shop icons** patch the pen branch of `drawSwatch` (~1190-1193, the 72×48 shop swatch); the **cursor ring** patches the ring stroke in `render()` (~1151-1152, `pe.cur`). Both keyed off `PROG.pen`.
- **Sheet 03 Keyboard** — **DROP-IN**: pure CSS `background-image` on `.key` / `.key.act` / `.key.wide` and `:active` (CSS ~48-52); the DOM keeps the `◀▶ DIR` / `⌫` / letter text on top.
- **Sheet 04 UI** — **DROP-IN** for CSS-backed chrome (`.btn` and its `.gold`/`.blue`/`.teal` variants ~60-67, `.hbtn` / `.chip` ~29-32, `#cluebar .nav` / `.cluetext` ~38-42, `.scard` states ~81-86, `.screen` ~53, `h1` crest region ~57); the **win emblem** and **Ink Streak nib flourish** are a light **PATCH** (composited on the `s-over` screen and the `✒` HUD chip; the clean-solve state already exists at `doWin` ~1072/1092).

Asset folder: `/workspaces/lucid-winds/satellites/mini-crossword/assets/` (subfolders `papers/`, `pens/`, `kb/`, `ui/`). Path-version every file (`?v=BUILD`) per the Hostinger resizer rule; ship only the cut cells under 150KB, keep master sheets out of the live web path. Gate every swap behind an image-loaded check so the procedural draw stays the fallback, and bump the asset version on any art change.
