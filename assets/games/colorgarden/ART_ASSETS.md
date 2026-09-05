# COLOR GARDEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/colorgarden/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-colorgarden` · native · creative · audit impact 4/5 · effort M · audit rank 48

## Background wanted

assets/games/colorgarden/paper-1200x1200.jpg multiplied under the line art in place of the flat #faf5ee, plus a painted frame around imgWrap so the cream sheet meets the black shell through something. The dark ground behind should gain a soft top vignette so the sheet has a halo rather than a cut edge.

## Files

| file | spec | replaces |
|---|---|---|
| `paper-1200x1200.jpg` | 1200x1200, warm cream laid-paper texture with subtle fibre grain, very slight corner darkening, seamless enough to sit under any page. Matches the 1200x1200 line-art pages exactly. | Replaces the flat #faf5ee fill at colorgarden.js:381 and 428 so the coloring sheet reads as paper instead of a bright white slab, and softens the contrast jump against the near-black shell. |
| `page-frame-1024x1024.png` | 1024x1024 transparent PNG. A painted wooden or vellum frame with a soft deckle inner edge and four small brass pins at the corners; the centre is fully transparent so the page shows through. | Wraps imgWrap (colorgarden.js:54) so the cream page has a mat and an edge, replacing the 1px rgba(122,179,86,0.15) hairline where the brightest and darkest things on screen currently meet. |
| `cg-swatch-tray-720x180.png` | 720x180 transparent PNG. A painted paint-tray strip: two rows of six shallow wells with a wet highlight in each and a warm wooden lip. | Sits behind the two quick-palette rows so the twelve CSS circles read as pans of paint, not generic colour dots. Currently the palette is the plainest element on a screen that is mostly palette. |
| `cg-thumb-01.png through cg-thumb-50.png` | 96x96 each, transparent or cream ground, a downsampled thumbnail of each page's line art with a 2px cream border. | Gives PREV and NEXT something to show. Today the only identity a page has is the text 'Page n / 50', so choosing among 50 pictures is blind paging. |

_4 files._
