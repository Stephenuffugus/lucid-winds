<!-- Impossible Garden · Sheet 5: UI / HUD — button plates, level cards, bloom marks, toggles, mode icons, badge -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Moonstone Monument" (Impossible Garden / Sky Wolf Studios dreamlike iso puzzle). Interface pieces carved from the same dream: dark indigo stone plates with soft enamel glazes and hairline cream engraving; quiet, monumental, kid-friendly, generous rounded corners, soft top-light. Flat cel + subtle stone grain, restrained glow, NO photoreal, NO heavy outlines, NO text/letters/numbers/logos/watermarks — ALL icons pictographic only (the game overlays its own live text on these plates). Palette: panel indigo #15141f / #232037 / #161425 / #12111c, toggle track #26243a, dusk line #2a331f; sage #7ab356 / #4f7d38 / deep #3f6b34 + rim #a6d77f, pale #eafbd6; gold #c8a84b, bloom-light #ffe9a8, cream #e8dcc8, moss-grey #8a9178, start-blue #5b9bd5, dew #bfe0f2. Compress under 150KB.

Create one sprite sheet. File: ig_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Each element centered, upright, fully inside its cell with margin, NO ground shadow (these are flat UI plates and icons the engine composites). Plates must be CLEAN in their centers — live text renders on top. SHAPE LAW (colorblind, restated): solved vs mastered level marks read by BLOOM COUNT (one bloom = solved, two blooms = solved with no hint), never by color alone; toggle state reads by knob POSITION, not tint.

BUTTON PLATES (cells 1-3) — wide rounded-rectangle plates (about 7:1 width:height feel, 16px-radius corners at game scale), rendered as generous horizontal plates in the cell:

1. btn_primary_plate — the hero action ("Journey", "Next Garden"): a sage enamel plate, #7ab356 top glaze falling to #4f7d38, a fine #a6d77f rim highlight, a soft dark under-ledge suggesting carved depth; clean empty center for dark text.
2. btn_dark_plate — the standard button: an indigo stone plate #232037 → #161425 with a hairline #2a331f border and a whisper of cream top sheen; calm and secondary.
3. btn_ghost_plate — the quiet button ("Back", utility): a flat #12111c plate, hairline border, no sheen — visibly the lowest-emphasis plate of the three.

LEVEL SELECT (cells 4-8) — the "Choose a Garden" grid of square cards:

4. lvlcard_frame — a square rounded level card: dark #15141f stone face with a hairline #2a331f rim and the faintest engraved 2:1 iso-diamond watermark in its center; clean enough for the big level numeral the game prints on it.
5. lvlcard_done — the solved version of the same card: identical geometry with a soft sage #7ab356 rim-glow and a slightly warmer face — quietly proud, not loud.
6. lock_icon — a small carved moonstone padlock, rounded and friendly (cream #e8dcc8 body, moss-grey #8a9178 shackle, a tiny start-blue keyhole glint), for locked level cards and locked wardrobe cards. The code's 🔒 textContent glyph (`renderLevels` ~494) stays as the absent-asset fallback; swapping it for this icon is a small glyph→image change in code.
7. bloom_mark_one — the solved mark: ONE small pressed gold #c8a84b bloom (five rounded petals, #ffe9a8 center), flat and emblem-like — replaces the ✿ under a cleared garden when this sheet is loaded; the code's ✿ textContent glyph (`renderLevels` ~495) stays as the absent-asset fallback.
8. bloom_mark_two — the mastery mark: TWO of the same small blooms side by side, slightly overlapping — the "solved with no hint" emblem. Count is the cue; both marks share the same gold so colorblind players read quantity, not hue.

HUD & SETTINGS (cells 9-12):

9. hud_badge_plate — the in-play corner badge (shows the garden name): a small rounded chip of smoked glass-stone — translucent-feeling dark indigo #15141f face, hairline #2a331f rim, soft inner shade; unobtrusive, top-left friendly.
10. toggle_off — a pill toggle track in #26243a with a hairline border and a round cream #e8dcc8 knob seated at the LEFT end; matte, obviously off by position.
11. toggle_on — the same pill glazed deep-green #3f6b34 with the knob at the RIGHT end in pale #eafbd6 and a soft inner glow along the track; obviously on by position.
12. panel_line_plate — the settings row plate: a wide rounded #15141f bar with hairline rim and a clean center, sized to hold a label left and a toggle right.

MODE ICONS & EXTRAS (cells 13-16) — pictographic emblems for the three title buttons and navigation:

13. icon_journey — a winding footpath emblem: a small cream #e8dcc8 path of three stepping tiles rising toward a tiny gold bloom, engraved-medallion style on transparent.
14. icon_daily — the Daily Path emblem: a rising sun-disc in gold #c8a84b half-crested over a single iso tile, three short cream rays; no calendar numerals, purely pictographic.
15. icon_zen — the Zen Garden emblem: a serene lotus-like bloom resting on two still ripple lines in dew #bfe0f2; soft, symmetric, meditative.
16. back_chip — a small round back-navigation chip: dark #15141f disc, hairline rim, a simple cream leftward chevron engraved at center.
