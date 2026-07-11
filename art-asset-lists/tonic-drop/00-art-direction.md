# Tonic Drop — Art Direction

**Game:** `satellites/tonic-drop/index.html` — a Dr. Mario-style falling-capsule matcher.
Two-tone **capsules** drop into a tall **bottle** (8 wide × 16 tall grid). Slide / turn / drop
them; line up **four+ of one tone** in a row or column and they **fizz away**. The bottle's
floor holds grumpy fixed **grumps** — trap four of a tone in a line to pop them; clear **every
grump** to finish the bottle. Every 8 fizzes the next capsule pours a **✦ wild half** (any tone).
4 modes: Bottle Service (20 ramping bottles) · Daily Bottle · Sprint · Zen Fizz.

**What is art-wireable vs engine-drawn (read first):**
The game draws EVERYTHING procedurally on one 540×820 canvas — capsule halves, grumps, the
bottle frame, the faint grid, the fizz flash — plus DOM/CSS screens. That procedural layer is
fully playable today; this pack is the optional sprite upgrade **and** the Shop's cosmetics
catalog. Wire-in scope, cheapest first:
1. **Full-bleed backdrops** — one per `BACKS` theme (cellar / sunset / tide / amberroom). DROP-IN:
   draw the image in `render()` where the background gradient is built, keyed by `PROG.back`.
2. **UI chrome** — title crest, mode buttons, dock pads, HUD chips, level + shop card frames,
   win/over ribbons. DROP-IN, pure DOM/CSS.
3. **Shop swatches** — the collectible cards in `renderShop()` / `drawSwatch()`. DROP-IN.
4. **Capsule + grump sprites** — swap `drawPiece()` / `drawSym()` fills for PNGs
   (PATCH-REQUIRED: `drawImage` keyed by tone + capset / grump family; the SHAPE badge stays
   baked in). Until patched, sheets 01/02 double as Shop card art.
5. **Bottle frame** — swap the `render()` rim/neck/cork/glass rects for a keyed frame PNG with a
   knocked-out interior window (PATCH-REQUIRED; the 8×16 grid stays engine-drawn on top).
6. **FX** — fizz/chain/cork-pop bursts drawn from the (currently unused) `CUR.popFx` hook
   (PATCH-REQUIRED).

---

## Colorblind law (non-negotiable — preserve in every asset)

Tones are told apart by **SHAPE, never color alone**. The engine stamps a shape on every
tone-bearing object and any art MUST keep it, bold and centered:

| Tone | Shape | Default (Tonic set) hex |
|------|-------|-------------------------|
| tone 0 | **disc ●** (round, with a specular dot) | `#46b3a6` teal |
| tone 1 | **triangle ▲** (points up) | `#e0a13c` amber |
| tone 2 | **diamond ◆** (points up/down) | `#d76a86` rose |
| wildcard | **star ✦** (5-point) | `#f3e18a` gold |

Grumps wear the SAME shapes as a small badge (top-left of the face) so a grump's tone is
readable without color. Never ship a cap or grump whose shape badge is missing or ambiguous.

---

## Style options (pick one; all sheets bake the chosen STYLE block)

### Option A — **Apothecary Fizz** (LEAD, RECOMMENDED — non-botanical)
A moonlit tonic apothecary at night: hand-blown tinted glass, cork-and-brass fittings, little
glowing **gel-cap** tonics, tinctures lit from within, deep plum-indigo cellar shadows warmed
by candle-gold rim light. The capsule halves are colored gel-caps with a wax-seal shape stamp;
the grumps are cranky bottled "spirits" scowling up from the dregs; the currency **caps** reads
literally as tonic **bottle-caps**. This is the game's own fiction (cork the bottle, line up the
tonic, watch it fizz) and it matches the live palette **exactly** — plum `#0d0a14`/`#3c2a5e`,
gold `#c8a84b`, cream `#e8dcc8`, tone teal/amber/rose — so nothing in the engine needs retuning.
Kid-friendly and collectible with zero garden anywhere.
*Distinct from Petal Alchemy's "Midnight Apothecary": that's an alchemist's crafting bench of
reagents; this is a fizzy tonic **bar** — bottles, corks, bubbles, gel-caps.*

### Option B — **Vintage Soda Fountain** (enamel)
A 1950s malt-shop soda fountain: glossy enamel signage, chrome fittings, checker-tile counter,
candy-bright pop flavors, grumps as grumpy soda mascots, and the "caps = crimped bottle-caps"
pun taken all the way. Cheerful, nostalgic, extremely catchy for kids — but it repaints the app
warm and bright, away from the current plum-night mood, so it's more work and less faithful to
the shipped look.

### Option C — **Chromatic Lab** (clean vector)
A crisp modern chem-lab matcher: flat matte darks, bright saturated tone chips, a clean
geometric bottle, neon-edge fizz. The most hyper-legible at 44px and the most colorblind-safe
(big flat shapes), but also the most generic — it reads like any polished puzzle app rather than
owning a look.

**Recommendation: Option A (Apothecary Fizz).** It IS the fiction, it reuses every live hex so
the art drops onto the renderer with no retune, it's the required non-botanical lead, it keeps
the tiny 44px caps crisp, and the cork-pop / fizz story is the game's signature moment. The
game keeps its name.

---

## Palette anchors (lifted from live code — no engine retune)

```
Frame / theme:  bg #0d0a14 · plum #3c2a5e · line #2c2440 · gold #c8a84b · warm #ffd76a
                cream #e8dcc8 · muted #94889f · blue #5b9bd5
Tonic tones:    disc #46b3a6 · tri #e0a13c · dia #d76a86 · wild ✦ #f3e18a
Capsule sets:   tonic #46b3a6/#e0a13c/#d76a86 · orchard #8fbf6a/#e8b24a/#c9607a
                neon #3fe0d0/#ffd24a/#ff6ba0 · dusk #7f7bd6/#e08a4a/#4aa0d0
                slate #8fa0b8/#c8ccd6/#5b6b86
Bottle rims:    amber-glass #c8a84b · sea-glass #46b3a6 · cut-crystal #a8c0ff · apothecary #9a7bc0
Backdrops:      cellar [22,16,40]→[8,6,16] · sunset [60,30,44]→[16,8,20]
                tide [10,34,44]→[6,16,22] · amberroom [44,32,14]→[16,10,6]
```

Board geometry (for the frame + backdrop sheets): canvas 540×820; interior grid 8×16 at
44px/cell; interior origin ox=94, oy=96, so the play window is 352×704 (from (94,96) to
(446,800)). Outer glass frame ≈ (88,90)→(452,806). Neck bar (222,66) 96×26; cork (226,56) 88×14.

---

## Cosmetics / economy (verified vs live code — `CAPSETS` `BOTTLES` `GRUMPS` `BACKS` `SHOP`, `tonicdrop_save`)

Bought with **caps** (earned in play) or **mastery-gated** — everything shown up front, **no
mystery boxes, no payments**. Ids in code stay stable; display names debatable pre-art.

| Lane | Item (id) | Price / gate |
|---|---|---|
| Capsule Set | Tonic (`tonic`) | free |
| Capsule Set | Orchard (`orchard`) | 120 caps |
| Capsule Set | Dusk (`dusk`) | 180 caps |
| Capsule Set | Neon (`neon`) | 220 caps |
| Capsule Set | Slate (`mono`) | mastery — Clear bottle 20 |
| Bottle | Amber Glass (`amber-glass`) | free |
| Bottle | Sea Glass (`sea-glass`) | 100 caps |
| Bottle | Cut Crystal (`cut-crystal`) | 260 caps |
| Bottle | Apothecary (`apothecary`) | mastery — Daily streak 7 |
| Grumps | Classic (`classic`) | free |
| Grumps | Sourpuss (`sourpuss`) | 90 caps |
| Grumps | Fizzlings (`fizzlings`) | 150 caps |
| Backdrop | Cellar (`cellar`) | free |
| Backdrop | Sunset (`sunset`) | 80 caps |
| Backdrop | Tide (`tide`) | 80 caps |
| Backdrop | Amber Room (`amberroom`) | mastery — Win a Sprint |

Sunbeams (separate from caps): first-clear 2 / replay 1 / daily 4 / sprint scaled; capped 12
per run, 30/day (`sw_sb_tonicdrop`). Zen Fizz pays no sunbeams.

---

## STYLE BLOCK (bake into every sheet prompt below — Option A)

> Apothecary Fizz style: moonlit tonic-apothecary game art — hand-blown tinted glass, cork and
> brass fittings, little glowing gel-cap tonics, tinctures lit from within, deep plum-indigo
> cellar shadows warmed by candle-gold rim light, glossy but crisp game-asset silhouettes
> readable at 40 pixels, soft inner glow, no text, no watermark, flat FF00FF magenta background
> for cutout.

⚠️ Magenta knockout: keep every subject color at least 25% away from pure `#FF00FF`. The Neon
set's diamond `#ff6ba0` and rose tones `#d76a86` / `#c9607a` are the closest — keep them muted
and never hot pink, or the cutter will eat them. Cut via magenta-KEY-distance, NOT hue.

## Sheets

| # | File | Contents | Wiring |
|---|------|----------|--------|
| 01 | `01-tonicdrop-capsules.md` | 3 tone gel-caps + ✦ wild half, loose vs linked, connector nub, swatch chip | PATCH (drawPiece/drawSym) / DROP-IN as swatch |
| 02 | `02-tonicdrop-grumps.md` | 3 grump families × 3 tones (shape badge baked) + popped face | PATCH (drawPiece grump branch) |
| 03 | `03-tonicdrop-bottle.md` | 4 bottle rim/neck/cork frames, interior magenta-knocked window | PATCH (render frame) |
| 04 | `04-tonicdrop-fx.md` | fizz burst, chain flash, cork-pop, glow, bubbles, sparkles | PATCH (CUR.popFx hook) |
| 05 | `05-tonicdrop-backdrops.md` | 4 full-bleed backdrops + title hero (NO magenta) | DROP-IN (render pre-bottle) |
| 06 | `06-tonicdrop-cosmetics.md` | Shop swatch catalog + owned/equipped/locked frames + caps coin | DROP-IN (drawSwatch/renderShop) |
| 07 | `07-tonicdrop-ui.md` | title crest, mode plaques, dock pads, HUD chips, card frames, ribbons | DROP-IN (DOM/CSS) |

**Generate order:** 05 backdrops → 07 UI → 01 capsules → 02 grumps → 03 bottle → 04 fx → 06
cosmetics (backdrops + UI light up the app with zero engine work; sprite sheets follow once a
look is approved). Every sheet is self-contained — STYLE baked in, no stitching. Cut via
magenta-KEY-distance per `reference_cutout_script`.
