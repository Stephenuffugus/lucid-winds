# Blobworks — art2 raw drop (core monsters redo + table parts)

Committed per ART-LEDGER rule 6. Cut with `scripts`-style border-flood + inpaint (never a head-hole).

## Sheets
- `sheet1.png` — core monsters A (3x2), **TEAL** clay: col=monster, row=idle/hit. Stretch / Chub / Dib&Dob.
- `sheet2.png` — core monsters B (3x2), **GREEN** clay: tube-head / octopus / crowned-king.
  (Jul 19: Stephen re-sent 1&2 non-purple — teal+green cut cleaner off magenta AND read more distinct on the dark table. Purple originals superseded.)
- `sheet3a.png`, `sheet3b.png`, `sheet4.png` — clay table PARTS (rails, curves, Y-junctions,
  chevron arrows, gold funnel, striped rails, domino/eyes blocks, cone posts, ramps, grate).

## Wired (art/, PIN_ART overwrite + VER bump to 'a2')
6 monsters → bumper_a/b/c (Stretch/Chub/Dib&Dob idle→_idle hit→_lit), sling (octopus),
scoop (tube-head, idle/lit/open), standup_lit/done (king). One cone post → post_nub.

## PARKED (cut, not wired)
Rails / curves / Y-junctions / striped rails / ramps / domino blocks — the engine bakes rails into
the `table_*` backdrop (per-piece blits would misalign). To use them: re-bake the table backdrop
with these composited, or add new WALLS-keyed blit sites. Cone posts beyond post_nub also parked.
