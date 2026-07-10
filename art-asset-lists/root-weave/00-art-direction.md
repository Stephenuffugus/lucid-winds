# Root Weave — Art Pack

> Drag the root bulbs until no two roots cross. Gnarl turns to living vine under your fingers, and a finished weave blooms into a pressed root mandala.

**Genre:** Untangle / Planarity remake. Every board is grown flat first and then scrambled, so a perfect untangling always exists. Signature **Taproots**: anchored bulbs that hold their solved position and force you to weave around them. Solving mints a **root mandala keepsake** into a local gallery.

_The game already ships and plays procedurally (`satellites/root-weave/`) — this art is an optional visual upgrade **and** the cosmetics library for the in-game wardrobe economy._

## Pick a look

### 1. Inkwood Atlas  ← RECOMMENDED
*Engraved botanical etching: fine copperplate/woodcut linework on deep night paper. Living roots are hand-inked strokes in sage green with cream rim-light; tangled roots are dry charcoal gnarl with visible burr knots; bulbs are small engraved medallions. Subtle paper tooth, plate-edge vignette, gold-leaf accents on taproots and blooms.*

The whole game IS lines, so an etching style makes the lines themselves the art. Crossing vs clean reads by stroke TEXTURE (dry broken gnarl vs smooth inked vine), which is exactly the game's colorblind rule; medallion bulbs read at thumbnail size; and nothing else in the portal uses an engraved-atlas look, so Root Weave gets a clear identity.

### 2. Paper Nocturne Kin (alt, cozier)
*Layered cut-paper roots and bulbs in the Dew Snip papercraft family: flat fills, backlit rim-glow between layers.* Warm and proven, but blends into the Dew Snip / papercut family instead of standing alone, and paper strands read slightly worse than inked strokes at the thin widths this game needs.

### 3. Stained Moss Glass (alt, more mature)
*Leadlight stained glass: bulbs as jewel cabochons, roots as lead cames, backdrop as dark cathedral glass.* Gorgeous and grown-up, but crossings vs clean would lean on color more than texture, which fights the colorblind requirement.

## Sheets (generate each separately)

- `01-rootweave-bulbs.md` — Bulb medallions — all 5 skins + taproot + drag states
- `02-rootweave-vines.md` — Root strokes — clean vine styles, gnarl segments, crossing marks (seamless tiles)
- `03-rootweave-blooms.md` — Win blooms + mandala keepsakes — 💰 COSMETICS / ECONOMY
- `04-rootweave-backgrounds.md` — Backdrop soils — Full-Bleed Portrait x4
- `05-rootweave-ui.md` — UI / HUD — buttons, chips, level cards, toggles
- `06-rootweave-fx.md` — FX — clean-snap sparkle, hold ring, nudge candle, bloom burst

## Cosmetics economy

All Root Weave cosmetics are earned by PLAYING — no loot boxes, no randomized purchases, no pay-to-win, nothing that changes board generation or hitboxes. Every unlock is a KNOWN item at a KNOWN threshold, shown in the wardrobe before it is earned. THREE free mastery lanes matching the shipped `rootweave_save` wardrobe: (1) **Weave mastery** — bulb skins by lifetime solves (Pearl free, Acorn at 10, Dewdrop at 25, Star at 50) and soil backdrops (Midnight free, Moss Terrace at 40, First Dawn at 60). (2) **Clean mastery** — vine styles for quality play: Braided at 15 solves, Blossom for 5 clean no-nudge weaves, Aurora for beating par in 5 Gnarl Trials. (3) **Daily mastery** — Firefly bulbs at a 3 day streak and Warm Loam soil at a 7 day streak, giving lapsed-friendly reasons to return. The keepsake mandala gallery (24 pressed mandalas) is the free collection wall that grows alongside. Sunbeams follow the portal standard (30/day, 12/run via `_sbCapEarn`, Zen pays zero).

## Style block

```
STYLE — "Inkwood Atlas" (Root Weave / Lucid Winds midnight-garden engraving). Engraved botanical etching: fine copperplate and woodcut linework on deep night paper, hand-inked strokes with visible plate texture and gentle paper tooth, NO photoreal gradients, NO glossy 3D, NO harsh solid black fills; shapes must read instantly at thumbnail size. Living root strokes are smooth inked lines in sage #7ab356 over deep #3f6b34 with a thin cream #e8dcc8 rim-light; dead tangled roots are dry charcoal gnarl #6b5d4a / #54483a with broken burr texture; bulbs are small engraved medallions with cream #f2ead8 faces; taproots and blooms carry gold-leaf #c8a84b with warm highlight #ffe9a8. Palette: night paper #0d100c and #05070a, dusk line #2a331f, moss #8a9178, luminous dew #bfe0f2 over moon-blue #5b9bd5, accent rose #e58fa0, warning tip #e56b6b, bark #5c3a1a, violet #b57de0. Lighting is nocturnal: a soft moon sheen from upper left, gold accents glowing softly, everything else low-key. Crossing vs clean must read by STROKE TEXTURE (broken dry gnarl vs smooth living ink), never by hue alone (colorblind rule). Absolutely NO text, letters, numbers, logos, UI chrome, or watermarks anywhere (icons are pictographic only). Each PNG must compress under 150KB. Per-sheet knockout/gutter rule stated in that sheet's block MUST be followed exactly.
```

## Wire notes

Drop-in over the procedural draws in `/workspaces/lucid-winds/satellites/root-weave/index.html`; keep the canvas fallbacks as absent-asset safety nets. Asset folder: `/workspaces/lucid-winds/satellites/root-weave/assets/` (subfolders: `bulbs/`, `vines/`, `blooms/`, `backgrounds/`, `ui/`, `fx/`). Path-version every file (`?v=LW_VERSION`) per the Hostinger resizer rule; ship only the <150KB cut cells. Map: `rootweave_bulbs.png` → the node medallion draw in `render()` keyed by `PROG.bulb` (pearl/acorn/dewdrop/firefly/star) + the taproot knot + drag-highlight ring. `rootweave_vines.png` → `edgeStyle()` strokes: clean styles keyed by `PROG.vine` (classic/braided/blossom/aurora), the gnarled kinked segments + burr knots, and the ✗ crossing marker sprites. `rootweave_blooms.png` → the win-bloom petal burst in `render()` and `drawKeepsake()` mandala petal/ring stamps (Grove gallery cards). `rootweave_bg.png` → the `BACKS` gradient backdrops keyed by `PROG.backdrop` (midnight/loam/terrace/dawn) + ambient specks. `rootweave_ui.png` → `.btn`/`.btn.primary` plates, `.chip` dock buttons, `.lvlcard` frames, `.toggle` knob, hud ⌂/? glyphs. `rootweave_fx.png` → clean-snap sparkle, the gold hold-progress ring, the nudge candle ghost ring + dashed guide, rescramble swirl. Bump the asset cache version on any art change.
