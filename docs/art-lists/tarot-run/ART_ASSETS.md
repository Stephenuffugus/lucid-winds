# TAROT RUN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/tarot-run/` under the names below; say which landed and the code side wires them.

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

**Game:** `tarot-run` · satellite · card · audit impact 5/5 · effort L · audit rank 87

## Background wanted

A painted theatrical backdrop per act, 1080x1920 full-bleed: velvet stage curtains framing a lit proscenium behind the title, and a separate painted Undercroft wall behind the run map - wet stone, one low lamp, dust in the beam - held at about 25% brightness so the gold nodes still lead the eye. Three acts means three backdrops, and the run then visibly descends instead of staying in the same black room for 45 floors.

## Files

| file | spec | replaces |
|---|---|---|
| `art-slots/title-mark.png` | 1024x1024 PNG, transparent background. Nine-pointed ritual seal with wand, cup, sword and pentacle at the compass points, rose gold on nothing, Art Nouveau line weight. | Replaces the CSS text glyph currently sitting in the 220px gold circle on the title screen. The loader at index.html:4747 already scans [data-art-slot] and requests this exact path - it 404s today. |
| `art-slots/enemy-spectre.png, -jackal, -echoman, -duelist, -reflection, -sleeper, -gilded, -archivist, -twins, -oracle, -crown` | 11 files, 1024x1024 PNG each, square crop, painted figure on deep teal velvet, warm rim light from below (footlights). | Fills the 175px .enemy-portrait, which today draws a 78px gold letter glyph from attr(data-glyph). ASSET_MANIFEST.json already names all 11 slot ids; art-slots/ contains only .gitkeep. |
| `bg-act1-undercroft-1080x1920.jpg (plus act2, act3)` | 1080x1920 JPG, full-bleed, painted wet-stone crypt wall with one lamp and a dust beam, values held dark so gold UI reads on top. | Gives #map-screen a floor and a horizon. Right now the run map is a flat black field with a column of circles floating in it. |
| `art-slots/node-medallions-6x256.png` | One sheet, 6 cells at 256x256, transparent: combat blade, elite crown, event moon, treasure chest, rest cup, boss skull. Painted brass medallions, each a distinct outline. | Breaks the identical-circle problem on the map - six room types currently share one 58px ring and differ only by a washed-out border colour. |
| `art-slots/card-wands-1.png through card-*-* (78 files)` | 512x720 PNG each, 5:7, cream parchment field with the Art Nouveau subject centred; suit border stays in code. | The card faces. Today each card shows a 30px gold glyph in a 56px gradient strip - this is the bulk of the manifest and the reason a card game reads as a spreadsheet. |

_5 files._
