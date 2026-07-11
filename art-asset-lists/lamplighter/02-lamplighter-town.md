# Sheet 02 — Dusk town backdrops (the Dusk Walk twist) + window states

**DROP-IN wiring (backdrop) / PATCH-REQUIRED (window kindle):** the town is one full-bleed offscreen
image built in `buildTown()` (`CUR.town`, **540×820**) and drawn first every frame with
`ctx.drawImage(CUR.town,0,0)` — swapping in a painted PNG per palette is zero engine change beyond
loading it. Three palette variants exist (`DUSKS`: plum / ember / tide) and are a wardrobe lane, so
this sheet delivers **three full-bleed backdrops**. Layout inside the 540×820 frame (match it so the
grid lands correctly): sky gradient fills the top ~300px, a crescent **moon** sits upper-right
(~x452,y64), a faint **star** field up top, two soft **hill** silhouettes cross ~y190, a row of
**houses** stands along the street line at **y252**, then night glass #0D0A14 fills the middle (the
grid draws over y262–742), and a **cobble strip** runs y754–820 at the bottom. Draw all house
windows **DARK / unlit** — the engine kindles them on top as you solve (that glow is the separate
window-state swatch below; wire it by `drawImage` in the window loop of `render()`, ~7×10px each).
Generate each backdrop at **1080×1640** (2×) and downscale.

**PROMPT (copy-paste):**

Lamplight Leadlight style: stained-glass leadlight nocturne, every shape framed by thin dark leaded
came outlines, luminous jewel-glass fills that glow as if lit from behind, warm amber lamplight
blooming through cool indigo and plum dusk glass, clean readable silhouettes, cozy old-town dusk,
crafted and handsome, kid-friendly not childish, no text, no watermark, crisp game-asset edges.
A layout sheet on flat magenta FF00FF with generous magenta gutters between the panels. Each of the
three tall panels is a FULL-BLEED background (it fills its own frame, no magenta inside it).
PANEL 1, 540x820 pixels, PLUM DUSK town: a leadlight night sky graded indigo 191036 at the top to
plum 3C2A5E to a dusty rose 7A5454 low band, a pale F0E8D2 crescent moon upper right, a scatter of
tiny stars, two soft rolling hill silhouettes 1A122E crossing the lower sky, and a row of small
old-town cottages 0D0918 with peaked roofs and chimneys standing along the horizon, ALL their little
windows dark and unlit, then a deep night-glass 0D0A14 lower half with a dim cobblestone strip along
the very bottom. Calm, still, empty of people, built to sit behind a puzzle grid.
PANEL 2, 540x820 pixels, EMBER DUSK town: the same composition and cottages, sky graded 200F0C to
5C301E to a warm 168-96-52 A86034 low band, a warm FFE0B4 moon, hills 2C1610, houses 140A08, windows
dark, night-glass lower half and cobble strip.
PANEL 3, 540x820 pixels, TIDE DUSK town: the same composition, sky graded 081A26 to 1A4452 to a teal
508282 low band, a cool DCF0F0 moon, hills 0E2630, houses 061116, windows dark, night-glass lower
half and cobble strip.
Bottom of the sheet, one row of three small swatches, each 200x200 pixels on magenta FF00FF:
(A) DARK WINDOW pane, a small tall unlit leaded window, cold and empty.
(B) KINDLED WINDOW pane, the same little window glowing warm amber FFD77A from within with a soft
outward bloom, its lead bars crisp — the lit state.
(C) COBBLE TILE, a dark 151021 cobblestone strip with rounded 1D1730 stones, seamless left-to-right.
Even spacing, nothing important touching panel edges, no text anywhere.
