# Dewball — Art Pack

> Roll a sticky bead of dew through six little worlds and everything smaller than you sticks. A giant picnic blanket, a toybox floor, the midnight garden, a market street, a dusk harbor, and an endless dream meadow.

**Genre:** Full-3D roll-and-grow (Katamari Damacy lineage). The ball grows by true volume from a 4 cm crumb-eater to a 25 m harbor-swallower; props attach at the contact point and get buried as you grow. Signature systems: **size gates** (fences that sink once you are big enough), **keepsakes** (25 named one-off treasures pressed into a persistent Grove), **movers** (critters that bully you until you outgrow and eat them), and 7 earned **dew skins**.

_The game already ships and plays fully procedurally (`satellites/dewball/`, three.js) — this art is an optional visual upgrade **and** the cosmetics library. Ground tiles, skies and ball skins wire into existing hooks; prop cards need a billboard wiring pass (see the pack README)._

## Pick a look

### 1. Paper Lantern Parade  ← RECOMMENDED
*Handcrafted cut-paper diorama: every prop is a layered flat card with a crisp die-cut silhouette, deckled edges on organic shapes, visible paper grain, warm lantern light and thin drop shadows between layers.* This is the DESIGN.md plan for a reason: in a 3D engine the cheapest honest art is a **double-sided card**, and a style built FROM flat cutouts makes the 2D sheets literally BE the 3D props — zero uncanny gap, minimal wiring risk. Crisp silhouettes survive the fingernail sizes Dewball props shrink to, the lantern-glow palette sits beside Dew Snip's Paper Nocturne as a family without repeating it, and six worlds stay coherent because they are all "the same craft table, different paper stock."

### 2. Gouache Storybook (alt, softer)
*Picture-book gouache: soft opaque brushwork, rounded forms, painted texture, storybook warmth.* Beautiful in stills and very Stephen-friendly, but soft brush edges fight the magenta-key cutout, interior detail muddies below 60 px, and painted props pasted onto 3D cards read as stickers rather than objects.

### 3. Felt and Button Diorama (alt, craftier)
*Craft-felt miniatures: stitched felt shapes, button eyes, embroidery accents, shallow depth-of-field render.* Charming and tactile, but the rendered-photo look needs consistent lighting the generator will not hold across 21 sheets, stitch detail dies at gameplay scale, and it reads younger than the Director's range.

**Stephen makes the final call.** All three keep the same sheet plan; only the STYLE paragraph changes.

## Sheets (generate each separately)

- `01-dewball-ground-w1.md` … `06-dewball-ground-w6.md` — six seamless ground tiles — **wire today** via `assets/ground-<worldId>.jpg`
- `07-dewball-skies.md` — six sky bands (one per world)
- `08-dewball-ballskins.md` — 7 equirect sphere maps — 💰 COSMETICS (earned skins)
- `09/10-dewball-props-picnic` — Crumb Country props + critters (2 sheets)
- `11/12-dewball-props-toybox` — Toybox Peaks props + critters (2 sheets)
- `13/14-dewball-props-nightgarden` — Night Garden + Dream Meadow extras (2 sheets)
- `15/16-dewball-props-bazaar` — Bazaar Lane props + critters (2 sheets)
- `17/18-dewball-props-bay` — Starfall Bay props + critters (2 sheets)
- `19-dewball-keepsakes.md` — all 25 Grove keepsakes on one golden sheet
- `20-dewball-ui.md` — logo, world emblems, buttons, sticks, dash faces, plates
- `21-dewball-fx.md` — sparkles, bursts, gate dust, dash trail, beacon, fence

## Cosmetics economy

Dewball cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, nothing that changes physics, pickup rules or timers. The shipped lanes in `dewball_save`: (1) **Lifetime absorbs** unlock Moss (150), Rose (600) and Amethyst (1600) skins — the counter is `lifetimeAbsorbs`. (2) **Worlds cleared** unlock Honey (1), Ember (3) and Midnight (5). (3) **Keepsakes** are the native collection wall — 25 named one-offs pressed into the Grove, art on sheet 19. Skin unlock thresholds are readable in the Skins screen before earning. Future seasonal lanes (dash-trail tints, crown accents) should follow the same visible-threshold rule. Optional soft-coin: portal Dew may early-unlock the CURRENT season's trail tint only — convenience, capped, never exclusive, and never Sunbeams (Sunbeams stay the earn currency, 30/day, cap 12/run via `_sbCapEarn`).

## Style block

```
STYLE — "Paper Lantern Parade" (Dewball / Lucid Winds papercraft night-fair). Handcrafted cut-paper diorama art: every subject built from two or three layered flat card shapes with crisp die-cut silhouettes, deckled or torn edges on organic forms, subtle visible paper grain, and one darker fold-shade per layer as if lit by a warm lantern one hand-span above the craft table. Flat color fields, tiny gold-thread accent lines; NO airbrush gradients, NO photoreal texture, NO 3D render gloss, NO hard vector outlines. Silhouettes must read instantly at fingernail size — Dewball props shrink tiny on screen. Shared Lucid Winds accents: night void #0d100c, sage #7ab356, gold #c8a84b, cream #e8dcc8, moss #8a9178. Each world's own paper stock is listed in that sheet's palette line. Glow subjects (lanterns, fireflies, moonflowers, star fragments, dew) carry a soft cream halo INSIDE their cutout, never a lens flare. Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere. Each PNG must compress under 150KB. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Asset folder: `/workspaces/lucid-winds/satellites/dewball/assets/` (subfolders: `props/`, `ui/`, `fx/`; grounds and skies sit at the root as `ground-w1.jpg`…). Path-version every file (`?v=<build>`) per the Hostinger resizer rule; ship only cut cells under 150KB. **Wire today (hooks exist):** `ground-w1.jpg`…`ground-w6.jpg` are auto-loaded by `buildWorld()` and replace the procedural canvas tile per world; ball skin maps swap into `skinTexture()` (replace the canvas with the loaded equirect, keep the canvas as the absent-asset fallback). **Wire pass needed:** sky bands (replace the vertex-colored dome with a textured dome per world), prop cards (billboard double-sided card mode per DESIGN.md — swap `kindGeo()` merged geometry for a `card` part with the cut PNG, keep procedural as fallback), UI plates (DOM/CSS swaps on the overlays), FX sprites (pip/flash/burst swaps). Keep every procedural draw as the absent-asset safety net. Bump `?v=` on any art change.
