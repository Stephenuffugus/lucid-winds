<!-- Root Groups · Sheet 4: UI & FX — buttons, the six title-screen medallions (four modes + two doors), toggles, hint & shuffle chips, solve sparkle, gentle-end mist -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Midnight Curio" (Root Groups / Sky Wolf Studios word-sorting puzzle). Interface furniture for a warm cabinet of wonders: letterless brass-and-moss button plates, enamel mode medallions, soft lamplight FX. Flat matte gouache-and-ink, faint grain, chunky rounded silhouettes, ONE warm lamplight key from upper-left, gentle inner glows, restrained bloom — never glossy, never neon; reads at THUMBNAIL size. NO text, letters, letterforms, numbers, glyphs, logos or watermarks anywhere (all captions are live DOM text over these plates; icons are pictographic only). State cues shape-distinct, never hue-only. Palette (the game's real colors): midnight shelf #0d100c/#0e140d/#0b0f0b, void #05070a, moss line #2a331f, lichen #8a9178, panel #0f150c, toast #141a0e; sage #7ab356, deep leaf #3f6b34/#4f7d35, pale rim #9fd07a, under-shadow #2f4a1f, leaf-ink #0c1408; button faces #1a2415→#121a0f; brass #c8a84b, lamp glow #ffe9a8, cream #e8dcc8; dew #bfe0f2 (blue #5b9bd5); tier accents sage #8fca66, blue #72acdf, rose #eaa1b2, violet #c79ae6; spent plum #3a2430; cabinet woods #8a5a2b/#5c3a1a. Compress under 150KB.

Create one sprite sheet. File: rg_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep rose #eaa1b2/#e58fa0 and violet #c79ae6/#b57de0 clearly distinct from #FF00FF). Each item centered, upright, fully inside its cell with margin, NO ground shadow. Glow contained per cell. Button plates (cells 1-3) are drawn as LANDSCAPE rounded lozenges (about 470x150), 9-slice-safe with all detail in the border band — the engine stretches them across 60px menu buttons and 48px control buttons alike and prints all captions on top.

BUTTON PLATES (cells 1-3):
1. btn_plate — the standard button: matte moss face #1a2415→#121a0f, thin #2a331f rim, a soft lamplight kiss upper-left and two subtle brass corner tacks; the workhorse for menu rows, Hint / Deselect and the top-bar family.
2. btn_primary — the go button: sage enamel #7ab356→#4f7d35 with a pale #9fd07a rim, a deep #2f4a1f under-shadow band along the bottom edge and a warm sheen — the Submit / Grove Groups plate (its dark leaf-ink #0c1408 caption is DOM).
3. btn_ghost — the quiet back plate: near-flat #0f150c face, hairline #2a331f rim, no glow — for ◄ Back / ◄ Menu rows that must recede.

TITLE MEDALLIONS (cells 4-9) — SIX round brass-rimmed enamel medallions, one per title-screen door: the four modes (Grove / Daily / Zen / Tangle) plus the Compendium and Wardrobe doors; each silhouette bold enough to read at 22px; pictographic ONLY:
4. icon_grove — Grove Groups (endless): a sage #7ab356 enamel medallion with a plump sprout pushing from a mound — echoes the tier-1 pin but larger and rooted in soil.
5. icon_daily — Daily Roots: a dew-blue #72acdf enamel medallion with a hanging calendar-tag shape (blank face, a single leaf tucked under its ring) and a tiny sun-glint — NO numbers.
6. icon_zen — Zen Sort: a cream #e8dcc8/#bfe0f2 enamel medallion with one drifting leaf above two calm ripple lines — weightless, serene.
7. icon_tangle — Tangle (5 groups, expert): a violet #c79ae6 enamel medallion with a bold five-strand knot of roots — clearly FIVE strands, hinting the fifth tier.
8. icon_compendium — the Category Compendium: a brass #c8a84b medallion with an open ledger silhouette, a pressed sprig on one page and blank ruled hints on the other — letterless.
9. icon_wardrobe — the Wardrobe: a rose #eaa1b2 medallion with a small ribboned keepsake box, lid cracked, a soft glow escaping.

SMALL CONTROLS (cells 10-13):
10. icon_hint — a brass #c8a84b magnifying glass with a #bfe0f2 dew-drop caught in the lens and a soft glow — the Hint chip face (costs 3 Dew; the droplet says so pictographically).
11. icon_shuffle — two plump sage #7ab356 root-tendrils crossing over each other with small rounded arrow-tips — the 🔀 shuffle chip face, letterless.
12. toggle_kit — the settings switch furniture: a rounded track pill shown OFF in dark moss #26301c with a hairline rim, and beside it the round cream #e8dcc8 knob with a soft lamplight edge (the engine slides the knob and deepens the track to #3f6b34 when ON — the knob position, not color, is the state cue).
13. gear_medallion — a small brass gear-and-leaf medallion for the ⚙ settings chip: a rounded cog with a single sage leaf laid across it; friendly, not machiney.

FX (cells 14-16):
14. fx_solve_burst — the correct-group flourish: a soft radial puff of cream #ffe9a8 lamplight with a few brass sparkles and two or three tiny neutral petals — color-light so it sits over ANY tier banner (the equipped bloom style from the cosmetics sheet rides on top of this base).
15. fx_flawless_drift — the flawless-board celebration: a gentle drift of small brass stars, cream petals and one glowing seed, arranged as a loose rising column on transparent — the engine scatters copies.
16. fx_reveal_mist — the gentle-end overlay ("The rest of the garden reveals itself"): a soft lichen #8a9178→transparent mist wisp with a few floating dust motes and one faint sage glint — consoling, not punishing; the engine washes it over the board as unsolved groups reveal.
