# MUSIC STUDIO art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/song/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-song` · native · creative · audit impact 2/5 · effort S · audit rank 161

## Background wanted

None needed as a painted scene - this is a tool panel and a landscape behind it would fight the controls. What it wants instead is a subtle workbench texture: a very low-contrast grain or brushed-slate tile behind the lane stack so the panels read as hardware rather than as flat divs, plus a warm falloff at the top under the wordmark.

## Files

| file | spec | replaces |
|---|---|---|
| `tex-song-slate-256x256.png` | 256x256 seamless tile, near-black brushed slate grain at about 4 percent contrast, tileable in both axes | gives the lane panels a surface; currently every panel is the same flat rgba fill so the whole stack reads as one undifferentiated dark field |
| `icon-song-dice-48x48.png` | 48x48 transparent PNG, a painted bone-white die with warm rim light and a soft shadow, one face showing | replaces the dice emoji used as the randomize control on all four lanes - the emoji is the only saturated red in the panel and it renders differently on every device |
| `icons-song-lanes-64x64.png` | 256x64 strip, four 64x64 transparent badges - a drum skin, a bass string, a chord fan, a melody note - each tinted to its lane spine colour (orange, red, blue, yellow) | gives the four lanes a badge in the empty slot where DRUMS has a pattern strip and BASS and MELODY currently have nothing, and equalises the lane heights |
| `logo-song-padlab-96x96.png` | 96x96 transparent PNG, the PADLAB mark redrawn in sage, gold, cream and rose | the current badge is four primary red/blue/yellow/green squares - the only saturated primaries in the app and they clash with the midnight-greenhouse palette |

_4 files._
