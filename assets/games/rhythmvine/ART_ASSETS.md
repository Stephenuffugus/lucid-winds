# RHYTHM AND VINE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/rhythmvine/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-rhythmvine` · native · creative · audit impact 5/5 · effort M · audit rank 8

## Background wanted

bg-rhythmvine-trellis-540x900.jpg - a vertical vine trellis running the full height of the stage: four twisted stems marking the lane boundaries, leaves clustered at irregular heights so the emptiness has landmarks, deep near-black between the stems, sage green foliage catching a warm gold rim from the hit line below, darkening toward the top so notes emerge out of shadow.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-rhythmvine-trellis-540x900.jpg` | 540x900, four vertical vine stems on the lane boundaries, leaf clusters at irregular heights, near-black between stems, sage foliage, warm gold rim from below, top 20% fading to black | fills the empty 65% of the playfield and finally puts the vine in Rhythm and Vine |
| `note-leaf-sheet-336x44.png` | 336x44 transparent strip, four 84x44 painted leaf/petal notes tinted pink, gold, orange and blue to match the lanes, soft painterly with a warm rim light and a faint inner glow | replaces the flat CSS gold pill (.RVnote, games/rhythmvine.js:54) that is currently the only moving thing on screen |
| `hitline-bloom-540x72.png` | 540x72 transparent, a row of four half-open blooms sitting on the hit line, gold #c8a84b core with sage petals, glow baked in | replaces the 3px gradient hairline so the moment of contact has a shape, and gives the four invisible pads a visible plate |
| `pad-plate-136x100.png` | 136x100 transparent, a shallow lit stone/wood pad with a leaf motif, one per lane, 9-slice friendly | makes the 73px touch target visible instead of a 14px dot |

_4 files._
