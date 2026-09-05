# FREECELL art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/freecell/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-freecell` · native · card · audit impact 4/5 · effort M · audit rank 108

## Background wanted

A card table: deep bottle-green felt with a warm lamp pool centred about 50%/28%, falling to near-black at the edges, and a hint of dark wood rail across the bottom to close the empty lower third.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-cardtable-750x1334.jpg` | 750x1334 full-bleed, bottle-green felt with visible nap, warm lamp pool at 50%/28%, near-black vignette, a dark wood rail across the bottom 12 percent | Replaces the shared radial gradient for both card games. Kills the floating-cards-on-void look and fills the empty lower 40 percent. |
| `cardslot-free-96x134.png` | 96x134 transparent PNG, an empty free cell: shallow felt inset with a thin gold rope edge and a small engraved sage leaf centred | Replaces .gc-empty's dashed CSS outline and the 0.48rem 'FREE' label, both of which read as a wireframe placeholder. |
| `cardslot-foundation-96x134.png` | 96x134 transparent PNG, same felt inset shell, with the suit pressed into the felt in dull gold rather than a bright floating pip; four variants (spade, heart, diamond, club) | Replaces .gc-fnd's solid box so the eight top slots finally read as one row of matching wells. |
| `card-contact-shadow-140x48.png` | 140x48 transparent PNG, soft elliptical drop shadow, about 30 percent black at centre falling to zero | Sits under each column so cards meet the felt through a transition instead of a hard cut edge. |

_4 files._
