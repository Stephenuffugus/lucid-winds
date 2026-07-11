# Lamplighter — Art Direction

**Game:** `satellites/lamplighter/index.html` — an Akari / "Light Up" logic puzzle. The square is
a grid of **walkways** and dark **houses**; you tap walkways to place **lamps** that shine up /
down / left / right until a house blocks the beam. Light every walkway, never let a lamp shine on
another lamp, and give each **numbered house** exactly that many wall-lamps. Every puzzle has one
solution. TWIST = the **Dusk Walk**: a painted town sits behind the grid and its **windows kindle**
(light up) as you solve, fireflies drift out near the finish, and a hintless solve hangs a
**keepsake lantern** in your Lantern Row. 4 modes: Lantern Walk (20-street campaign) / Daily Lamps
(seeded) / Deep Square (10×10) / Zen Dusk (no fail, pays 0).

**What is art-wireable vs engine-drawn (read first):**
Everything renders as PROCEDURAL CANVAS VECTORS (`render()`, `buildTown()`, `drawLamp()`,
`drawLanternArt()`). Drop-in scope with zero engine changes:
1. **Full-bleed dusk town backdrop** — one offscreen image (`CUR.town`, 540×820) drawn first in
   `render()`. Three palette variants live in code (`DUSKS`: plum / ember / tide). This is the
   biggest drop-in win.
2. **UI chrome** — title crest, mode buttons, HUD chips, dock buttons, level cards, over / wardrobe
   / row screens. All DOM/CSS.
3. *(PATCH-REQUIRED)* sprite swaps for **lamps** (`drawLamp`, skin = `PROG.lamp`), **grid tiles**
   (the house/walkway/clue loop in `render()`), **fireflies** and **kindled windows** (the fly +
   window loops), and **keepsake lanterns** (`drawLanternArt`, Lantern Row) via `drawImage` — spec
   included per sheet, flagged so nothing here is a dead end. Until patched, every sprite sheet
   doubles as wardrobe / how-screen / Lantern-Row card art (drop-in, no engine change).

**Colorblind law (carries into art):** rule breaks are marked by SHAPE, never hue. A lamp that
shines on another lamp gets a **red ✕ + red ring**; a "note" cell gets a **gray ✕**; a satisfied
numbered house dims and shows a **green check tick**; an overfed house shows a **!**. These marks
must survive as distinct silhouettes at 30px — do not let the artist soften them into colored blobs.

---

## Style options (pick one; all sheets bake the chosen STYLE block)

### Option A — **Lamplight Leadlight** (LEAD, RECOMMENDED — non-botanical)
Stained-glass / leadlight nocturne. Every shape is framed by thin dark **leaded came** outlines and
filled with luminous jewel-glass that reads as if lit from behind — so a town at dusk with kindling
windows becomes a cathedral-window street where each pane literally glows on. Warm amber lamplight
blooms through cool indigo-and-plum glass; the game's whole fantasy is *light passing through*, and
this look makes the kindle mechanic sing. Crafted and handsome, a touch more grown-up than the
paper-cut wing, still fully kid-friendly and never childish. Not a leaf or garden in sight.
*Palette anchors (lifted from code — no engine retune):* night glass #0D0A14, plum came #2C2440,
lead #1A122E, gold #C8A84B, warm lamplight #FFD76A, cream glass #E8DCC8, ice pane #5B9BD5,
rose pane #E58FA0. Dusk skies use the three in-code palettes below.
*Reference vibes:* Tiffany leaded lamps, a Gothic rose window at dusk, GRIS glasswork, the warm
window-glow of a gas-lamp lane at nightfall.

### Option B — **Gaslamp Gouache**
Soft painterly gouache storybook nocturne: brushy dusk skies, powdery hills, cozy old-town lanes,
warm windows blooming like watercolor. Warmer and softer — the cozy end of the range. Beautiful for
the backdrop, but brush texture fights the tiny grid tiles and small lamp silhouettes, and it is the
most expensive look to hold consistent across six sheets.
*Palette anchors:* dusk plum #3C2A5E, ink hill #1A122E, ember window #FFCE6E, cream #E8DCC8.

### Option C — **Papercut Nocturne**
Layered matte paper-cut shapes with the faintest grain (the frost-watch / Dew Snip family look):
flat, clean, silhouette-first, cheapest to keep consistent. Handsome and safe, but it overlaps
several sibling packs already leading with paper-cut, so Lamplighter would not stand apart.
*Palette anchors:* indigo paper #191036, plum #3C2A5E, ember #A86034, cream #E8DCC8, gold #C8A84B.

**Recommendation: Option A (Lamplight Leadlight).** The core loop is windows lighting up one by one;
a leadlight look turns every kindled window into a glowing glass pane, ties the lamps' warm glow to
the same material language, reads cleanly at small grid sizes (leaded came = built-in silhouette),
and gives the pack a distinct, slightly more mature identity apart from the paper-cut wing — with no
botany anywhere.

---

## Dusk palettes (already live in code — `DUSKS`, a wardrobe cosmetic lane)

These drive the full-bleed backdrop; the hex is lifted straight from code so art drops in with no
engine retune. Each palette = sky top → mid → low gradient, plus house / hill / window-glow / moon.

| Palette | Sky top | Sky mid | Sky low | House | Hill | Window glow | Moon |
|---|---|---|---|---|---|---|---|
| **Plum Dusk** | #191036 | #3C2A5E | #7A5454 | #0D0918 | #1A122E | #FFD77A | #F0E8D2 |
| **Ember Dusk** | #200F0C | #5C301E | #A86034 | #140A08 | #2C1610 | #FFCE6E | #FFE0B4 |
| **Tide Dusk** | #081A26 | #1A4452 | #508282 | #061116 | #0E2630 | #FFE296 | #DCF0F0 |

Below the sky the backdrop is night glass #0D0A14, with a cobble strip #151021 / #1D1730 under the
grid.

---

## Cosmetics economy (already live in code — `WARD` array, `lamplighter_save`)

Mastery-unlocked by play, no purchases, no lootboxes. Ids stay stable even if display names shift.

| Lane | Item (id) | Threshold (from code) |
|---|---|---|
| Lamp skin | Brass (`brass`) | free |
| Lamp skin | Paper (`paper`) | light 6 streets |
| Lamp skin | Star (`star`) | hang 5 keepsake lanterns |
| Lamp skin | Moth (`moth`) | daily streak 3 |
| Dusk palette | Plum (`plum`) | free |
| Dusk palette | Ember (`ember`) | light 12 streets |
| Dusk palette | Tide (`tide`) | win 3 Deep Squares |
| Fireflies | Gold (`gold`) | free |
| Fireflies | Mint (`mint`) | light all 20 streets |
| Fireflies | Lilac (`lilac`) | daily streak 7 |

Keepsake lanterns are a separate *earned* reward (hintless solves), not a wardrobe pick — their art
lives on sheet 04 for the Lantern Row gallery.

---

## STYLE BLOCK (bake into every sheet prompt — Option A)

> Lamplight Leadlight style: stained-glass leadlight nocturne, every shape framed by thin dark
> leaded came outlines, luminous jewel-glass fills that glow as if lit from behind, warm amber
> lamplight blooming through cool indigo and plum dusk glass, clean readable silhouettes, cozy
> old-town dusk, crafted and handsome, kid-friendly not childish, no text, no watermark, crisp
> game-asset edges, flat FF00FF magenta background for cutout.

Sheets: 01 lamps + markers · 02 dusk town backdrops (plum/ember/tide) · 03 grid tiles + clue plates ·
04 fireflies + glow fx + keepsake lanterns · 05 cosmetics catalog (wardrobe) · 06 UI chrome.

Every sheet: flat #FF00FF magenta ground (EXCEPT the full-bleed backdrop panels on sheet 02, which
fill the frame with no key), cells annotated with hex sizes, cut via magenta-KEY-distance (NOT hue)
per `reference_cutout_script`. Leaded came stays THIN at small sizes so grid tiles and lamps read
clean — generate cells at 4× and downscale.
