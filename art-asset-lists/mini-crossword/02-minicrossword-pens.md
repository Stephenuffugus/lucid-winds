<!-- Mini Crossword · Sheet 2: Pens — 5 pen-nib shop icons + cursor-ring treatments + ink token -->
<!-- 💰 COSMETICS sheet (the five pens are the other half of the wardrobe). Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Sunday Inkwell" (Mini Crossword / Sky Wolf Studios five-by-five word puzzle). A midnight newspaper puzzle desk under one warm lamp: fountain pens and nibs resting in a brass tray, warm lamplight over deep plum-black, flat gouache-and-ink rendering, ONE warm lamp key light from the upper-left, restrained gilt glints; matte, never glossy, never neon. Rounded, kid-friendly, readable at thumbnail size. Palette: plum panels #161228 / #211a3a / #140f24, plum-black #0d0a14; lamp gold #c8a84b, warm #ffd76a, gilt #ffe6a0; cream #e8dcc8, muted #94889f; fountain blue #5b9bd5 / #9ec8f0, emerald teal #46b3a6 / #7fdcc0, ruby rose #e58fa0 / #f0a0b4, gold-nib #ffd76a / #ffe6a0. This is a WORD game — the letters are engine TEXT, so this art has ABSOLUTELY NO letters, numbers, words, glyphs, logos or watermarks; the nibs are pictographic pen tips only. Each pen must stay distinguishable by SILHOUETTE and its ink COLOR together (never color alone). Compress each PNG under 150KB.

Create one sprite sheet. File: mc_pens.png. Grid: 4 columns x 3 rows (12 cells, left-to-right, top-to-bottom). Cell: 256x256. Master: 1024x768.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Each item centered, upright, fully inside its cell with margin, NO ground shadow (these composite into the shop cards and onto the live board). Every nib gets a thin cream rim-glint so it reads as a prize. These are PURELY VISUAL skins — a pen only changes the ink + cursor COLOR, nothing else.

PEN-NIB SHOP ICONS (cells 1-5) — the five wearable pens, each shown as a small fountain-pen nib (or ballpoint tip) catching the lamp, sized and centered to read in the shop's 72x48 landscape swatch (author here at 256x256, engine downscales — keep the nib bold and legible tiny). The nib's ink well / tip catches its OWN ink color so the pen is recognizable by shape AND hue. Named and gated to match the code (`PENS`, `SHOP`):
1. nib_ballpoint — "Ballpoint" (starter, free): a simple rounded ballpoint tip, cream #e8dcc8 ink bead, gold #c8a84b collar. The everyone-starts-here pen.
2. nib_fountain — "Fountain" (unlock: 💧 80 ink): a classic slit fountain nib, cool fountain-blue #5b9bd5 ink glint, #9ec8f0 sheen — the first upgrade.
3. nib_emerald — "Emerald" (unlock: 💧 120 ink): a nib with an emerald-teal #46b3a6 ink pool and #7fdcc0 highlight, a tiny green gem set in the collar.
4. nib_ruby — "Ruby" (unlock: 💧 120 ink): a nib with a ruby-rose #e58fa0 ink pool and #f0a0b4 highlight, a tiny red gem in the collar.
5. nib_gold — "Gold Nib" (free at Ink Streak 10): the most ornate — a full gilt gold nib #ffd76a with #ffe6a0 lit edge and a warm halo, the long-haul mastery prize. Clearly the showpiece of the five.

CURSOR-RING TREATMENTS (cells 6-10) — the ring the engine strokes around the SELECTED cell, one per pen (it uses that pen's cursor color). Each is a square rounded-corner ring frame (transparent center — it hugs a cell over the amber select bed from sheet 01), a clean 3px-weight stroke with a soft inner glow, in that pen's CURSOR hex. Silhouette identical, hue per pen:
6. ring_ballpoint — gold #c8a84b ring.
7. ring_fountain — fountain-blue #5b9bd5 ring.
8. ring_emerald — emerald-teal #46b3a6 ring.
9. ring_ruby — ruby-rose #e58fa0 ring.
10. ring_gold — warm gold #ffd76a ring, a touch brighter with a gilt shimmer.

SHOP & CURRENCY FURNITURE (cells 11-12):
11. pen_tray — the shop card backing behind a nib: a small brass-and-felt pen rest / tray in plum #161228 with a warm gold #c8a84b lip, empty and centered (the nib icon composites on top; replaces the flat `#161228` swatch fill in `drawSwatch`).
12. ink_token — a single glossy ink drop / open inkwell in lamp-gold #c8a84b with a warm #ffd76a core and cream rim-glint, pictographic — the "ink" shop-currency mark for the wallet line (a companion to the DOM `💧`, NO number baked in).

WIRE: nib icons (cells 1-5) and pen_tray (11) patch the pen branch of `drawSwatch` (index.html ~1190-1193), keyed off `PROG.pen`, blitting into the 72x48 shop swatch behind an image-loaded check (keep the procedural "A" swatch as fallback). Cursor rings (cells 6-10) patch the ring stroke in `render()` (~1151-1152), replacing the `pe.cur` 3px `strokeRect` with a `drawImage` of `ring_<id>` keyed off `PROG.pen`. ink_token (12) can dress the `#shop-ink` wallet line in `#s-shop`. The ENGINE ink color (`pe.ink`, the letters themselves at ~1143) stays procedural TEXT — the pack's no-text rule keeps it that way; retint via the `PENS[].ink` hex if a pen ever needs it. Path-version every file `?v=BUILD`.
