# JIMOTHY — Sheet 10: the final polish pack (last non-painted surfaces)

After wiring both drops, these are the ONLY things left in the game that are not
Stephen's art. Everything here is optional — the game reads as finished — but each
one replaces a procedural draw with paint. Same magenta-knockout format as before
(#FF00FF background, white divider lines between blocks, generous spacing —
the cutter uses your divider lines now, so spacing is free).

## 10A — THE STREET SWEEPER (the wilt, made visible) — biggest win on this list
The "wilt" that chases the player up the screen is currently a flat purple tint.
Make it a thing: a municipal STREET SWEEPER TRUCK wall, seen top-down front-on,
brushes spinning, spray flying, warning lights — wide enough to tile across the
whole road (draw one 3-4 lane-widths wide segment that tiles horizontally).
Plus a separate thin "leading edge" strip: wet foam + brush bristles + sparks.
- `sweeper-body`  (tileable wide segment, ~3:1)
- `sweeper-edge`  (thin tileable strip, the scary front line)

## 10B — SIDEWALK PLANTERS (3) — the last procedural object on the board
The blockers on safe rows are drawn in code. Three top-down planter variants,
one block each: a concrete city planter with a shrub, a wooden half-barrel with
flowers, a Seattle-style rain garden clump with ferns. ~1 tile footprint.
- `planter-concrete` · `planter-barrel` · `planter-ferns`

## 10C — MODE PLAQUES (5) + LEVEL-CLEAR RIBBON
The title menu buttons use emoji glyphs. Five small painted icon plaques in the
badge style (round, brass rim, rain-flecked): map/compass (Adventure), infinity
(Endless), stopwatch (Rush), leaf (Zen), calendar (Daily). Plus one wide
"LEVEL CLEAR" banner ribbon (blank center, stars go on top in code).
- `plaque-adventure` · `plaque-endless` · `plaque-rush` · `plaque-zen` ·
  `plaque-daily` · `ribbon-clear`

## 10D — SASQUATCH (4-frame hop cycle) — brings back the retired secret
He was cut from the roster because he had no art. One block, the standard
idle / crouch / leap / land strip, same scale as the other critters: a mossy,
shy Sasquatch who was never supposed to be seen. He becomes a found-in-the-fog
secret alongside Ghost Jimothy.

## 10E — SOUNDTRACK COVER TILES (6, square) — optional flourish
One small square cover per song for the Soundtrack screen (currently a note
glyph): Cartridge Moonwalk (a cassette walking in moon boots), Chiptune Loop
Circuit (a circuit-board street), Jimothy Crosswalk (Jimothy on a rainbow
crosswalk), Midnight Trash Run (bins under a streetlight at night), Pixel Bass
Cruise (a boombox on a duck boat), Raccoon Run Ballard (the Ballard strip at
dusk). These would make the music screen feel like a record shop.

Priority order: 10A (the sweeper transforms the core threat), 10B, 10D, 10C, 10E.
