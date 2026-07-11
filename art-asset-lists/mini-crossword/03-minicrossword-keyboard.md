<!-- Mini Crossword · Sheet 3: Keyboard — key-cap skins (normal / pressed / DIR toggle / backspace) + deck -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Sunday Inkwell" (Mini Crossword / Sky Wolf Studios five-by-five word puzzle). A midnight newspaper puzzle desk under one warm lamp: a tidy set of typewriter-style key-caps on a plum deck, warm lamplight from the upper-left, flat gouache-and-ink rendering, gentle rounded bevels (soft, papery, NOT glassy or 3D-photoreal); matte, restrained, never neon. Rounded, kid-friendly, readable at thumbnail size. Palette: key plum #211a3a (normal), pressed #2f2550, wide-key plum #191330, amber-key #241c10 with gold edge #c8a84b; deck plum #0d0a14 / #150f26; cream #e8dcc8, muted #94889f; lamp gold #c8a84b, warm #ffd76a. This is a WORD game — the letters, the `◀▶ DIR` label and the `⌫` backspace glyph are ALL live DOM TEXT drawn ON TOP of these caps, so the art has ABSOLUTELY NO letters, numbers, words, glyphs, arrows or watermarks; every cap is a BLANK key face with a calm center where the DOM text lands. State is shape / brightness distinct, never hue-only. Compress each PNG under 150KB.

Create one sprite sheet. File: mc_keyboard.png. Grid: 4 columns x 2 rows (8 cells, left-to-right, top-to-bottom). Cell: 256x256. Master: 1024x512.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Each cap centered, upright, fully inside its cell with margin, NO ground shadow (they composite as CSS backgrounds behind DOM key text). Caps are gently rounded rectangles with an 8px corner radius feel; keep the CENTER of every cap a calm flat field so the DOM letter / glyph reads. These are purely cosmetic — they never change the keyboard layout or behavior.

LETTER KEY-CAPS (cells 1-2) — the standard letter key (the 26 letters reuse this one cap):
1. key_normal — a rounded plum #211a3a cap, faint cream #ffffff26 hairline rim, a soft warm lamp glint on the upper-left bevel, calm center. The resting key.
2. key_pressed — the SAME cap in pressed state: brighter plum #2f2550, the bevel flattened / pushed in, a slightly stronger warm glint — reads as "held down" by SHAPE (flatter) as well as brightness.

DIR TOGGLE CAP (cells 3-4) — the amber Across/Down flip key (`.key.act`, the DOM prints `◀▶ DIR` on top; this is a WIDE cap, ~80px vs 52px, author landscape-ish and centered):
3. key_dir — a warm amber #241c10 cap with a gold #c8a84b55 edge and a faint gilt inner glow, clearly the special key of the row, calm center for the DOM label.
4. key_dir_active — the same amber cap lit brighter with a fuller gold #c8a84b rim and warm #ffd76a glow, the pressed / active flash.

BACKSPACE CAP (cells 5-6) — the wide delete key (`.key.wide`, the DOM prints `⌫` on top; also WIDE ~80px, author landscape-ish):
5. key_wide — a rounded deep-plum #191330 cap, cream hairline rim, a touch darker than the letter keys so it reads as a utility key, calm center.
6. key_wide_pressed — the pressed state: brighter, bevel pushed in, subtle warm glint.

DECK & FX (cells 7-8):
7. kb_deck — a horizontally-tileable segment of the keyboard tray / deck that sits behind all three rows of keys: a flat plum #0d0a14 to #150f26 band with the faintest fiber grain and a soft warm vignette from the upper-left, NO key shapes baked in (the caps composite over it). Tileable left-to-right.
8. press_fx — a small soft ink-ripple / lamp-flare puff (concentric warm #ffd76a to gold #c8a84b rings fading out, transparent center) that can bloom under a key on tap — pictographic, optional polish.

WIRE: DROP-IN — set these as CSS `background-image` (with `background-size:cover`, existing colors as fallback): `key_normal`→`.key` (index.html CSS ~48), `key_pressed`→`.key:active` (~50), `key_dir`→`.key.act` (~52) with `key_dir_active` on an active/pressed class, `key_wide`→`.key.wide` (~51) with `key_wide_pressed` on `:active`, `kb_deck`→`#kb` (~44). The DOM keeps every letter, `◀▶ DIR` and `⌫` as text on top (they are the absent-asset fallback). press_fx (8) is optional new wire on the key `onclick` handlers (~1182-1184). Path-version every file `?v=BUILD`.
