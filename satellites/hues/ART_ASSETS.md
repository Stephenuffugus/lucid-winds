# HUES art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/hues/` under the names below; say which landed and the code side wires them.

## Conventions, read once
- Sizes in the rows are written at 1x, the size the game shows them at. Deliver full bleed plates at
  900x1600 portrait (a row that says 540x960 means that file at 900x1600) and everything else at twice
  the size the row names. Never a side over 1600 px: the host's image optimizer resizes anything bigger
  on the way out, so a 1080x1920 plate would arrive at 900x1600 anyway, resampled by a stranger.
- PNG with alpha for anything that sits on the game (pieces, parts, tiles, frames, tokens); JPG or
  WebP for full bleed plates. Your master goes in the vault and the web copy is cut under a new
  name; nothing you send is ever overwritten or shrunk in place.
- Style anchors: the midnight greenhouse palette (deep blacks, sage #7ab356, gold #c8a84b, cream
  #e8dcc8) unless the row names its own, one light direction (upper left), no text baked into a
  plate unless the row asks for it, no real trademarks or mascots, generated art is never called
  hand painted.
- The "replaces" column says what is on screen today and what the file unlocks. Rows are in the
  order they change the most.

**Game:** `hues` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 128

## Background wanted

bg-hues-540x960.jpg, a painted pigment bench: ground-glass mullers, three open pigment pots (viridian, gold ochre, madder rose), a stained cloth, all in deep near-black with a warm lamp raking from top-left, kept low contrast and heavily vignetted so the two colour swatches stay the only saturated things on screen.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-hues-540x960.jpg` | 540x960, painted pigment-grinding bench in near-black with warm rim light from top-left, full-bleed, heavily vignetted, low internal contrast | replaces the flat radial plus noise overlay and gives the game a place instead of a void |
| `frame-swatch-default-320x220.png` | 320x220 transparent 9-slice with a 25% slice inset, painted brass-and-cream picture frame with a soft inner shadow lip | the TARGET/YOURS swatches currently ship as bare rounded rects while 100+ painted frames already sit unused in satellites/hues/borders/pack/; a painted default puts art on the first play screen |
| `picker-plate-360x300.png` | 360x300 transparent, a painted wooden palette board with a thumb hole, dried paint smears and a 10px inner shadow lip, sized to sit behind the HSV square | turns the stock colour-picker widget into an object in the world instead of a floating browser control |
| `hues-wordmark-420x140.png` | 420x140 transparent, the HUES serif wordmark hand-set with pigment bleed at the stroke ends and a thin gold underscore rule | replaces the plain webfont title on boot, which is the game's only identity moment |

_4 files._
