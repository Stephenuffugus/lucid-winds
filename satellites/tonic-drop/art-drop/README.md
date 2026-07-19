# Acorn Drop — raw art drop (source of truth for re-cuts)

Stephen's Midjourney art pack for the Tonic Drop → **Acorn Drop** rebrand
(80s graffiti b-boy squirrel). Committed per ART-LEDGER rule 6 (raw survives a
codespace close; the original zip lived under a gitignored `*.zip`).

## Sheet → purpose (VISUALLY confirmed — numbering does NOT follow the docx prompt order)
- `1.png`..`4.png` — board backdrops: cellar / sunset / tide / amberroom
- `5.png` — title hero background
- `6.png` — acorn-burst celebration (→ bg_win)
- `7.png` — UI chrome sheet (banners/nav/ribbons) — NOT sliced (CSS covers it)
- `8.png` — acorn tiles: teal ● / amber ▲ / rose ◆ / gold ★ wild
- `9.png` — grump faces: rows = families classic/sourpuss/fizzlings, cols = teal/amber/rose + burst FX
- `10.png` — 4 hollow/bottle frames (amber/sea/crystal/apothecary), magenta interior window
- `11.png` — shop cosmetics catalog — NOT sliced (shop renders the real sprites live)
- `mascot1.png` / `mascot2.png` — 6 squirrel poses

## Cut recipe
Magenta key `g<80 & r>150 & b>140 & (r-g)>80 & (b-g)>70` → 4-connected-component slice.
Frames normalized so the transparent window lands on the grid at x[94-446] y[96-800].
Cut assets live in `../assets/`. See memory `project_acorn_drop_art_wire_jul19`.
`Gpt prompts.docx` = the 11 generation prompts; `Tonic Drop — Art Pack.docx` = original art brief.
