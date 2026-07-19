# OriVex — raw art drop (source for re-cuts)

Stephen's "Clean Paper Meets Pixel" origami pack for OriVex (slug still `petalvex`),
committed per ART-LEDGER rule 6. 10 sheets + `Gpt prompts.docx` (11 prompts).

## Sheet → purpose (verified visually)
- `1.png` — paper facet + tile sheet (4x4 grid): cells 0-9 = the 10 facet colours (up-triangles),
  cell 12 = plain tile, cells 13-14 = composited tiles, cell 15 = origami crane.
- `2.png` — desk/UI sheet (4x4): 0 tile base, 1/2 tray slots, 4 selection glow, 5 peel-corner,
  6 arrow, 7 crane, 8 crane+sparkles (win), 9 confetti (FX), 10 wax daily-seal, 11-15 UI plates/note.
- `3.png`..`10.png` — 8 full-screen backgrounds: dawnfold, koi, lantern-night, tearoom, winter-fox,
  canyon, swan-deep, sailboat-night.

## Wired (assets/, re-skins the existing `enamel` pipeline)
tiles/wedge_0..9 + wedge_plain (value0 = charcoal cell9 so its light digit reads; VAL2CELL in
memory), tiles/tile_frame (cell0 stitched, centre knocked out), bg/bg_theme_0..7 (rotate by puzzle),
bg/bg_bed (sailboat) + bg/bg_menu (dawnfold), fx/fx_petal_a/b + fx_pollen (cell9 confetti),
ui/win_bloom (cell8 crane+sparkles). Facets are DOWN-pointing (base top, apex centre); the engine
rotates one facet per edge. Skin `enamel` is now the DEFAULT (renamed "Folded Paper").
