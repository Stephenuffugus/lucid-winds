# STOP MOTION art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/stop-motion/` under the names below; say which landed and the code side wires them.

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

**Game:** `stop-motion` · satellite · creative · audit impact 4/5 · effort M · audit rank 32

## Background wanted

A painted maker-bench backdrop for the title screen, 540x960: a dark workbench top across the lower third lit by one warm desk lamp from the upper left, a phone propped on a small stand at the left edge, a clay figure mid-pose in the lamp pool, and a strip of developed film hanging out of focus at the top going near-black so the wordmark stays readable. That one plate answers 'what is this app' before the paragraph does.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-bench-540x960.jpg` | 540x960 full-bleed JPG. Dark workbench, one warm desk lamp from upper left, a propped phone at the left edge, a small clay figure mid-pose in the lamp pool, out-of-focus film strip across the top fading to near-black. | Replaces the flat #0b0f0b title screen and fills the ~180px empty band that is currently a `flex:1` spacer. |
| `hero-filmstrip-480x200.png` | 480x200 PNG, transparent. Six sprocket-holed frames in a gentle arc, each holding a clay figure one step further through a wave, with the last frame lit warmer than the first. | Drops into the empty middle of the title screen. Shows the core idea - small moves, many frames - in one glance, replacing pure explanation-by-paragraph. |
| `onion-ghost-frame-540x470.png` | 540x470 PNG, transparent. A soft cream corner-bracket viewfinder with a faint rule-of-thirds grid and a small ghost-icon badge in the top right. | The studio currently shows a bare `<video>` with four 1px `.tl` hairlines for thirds. A painted viewfinder frame makes the onion-skin state visible and gives the camera view a border. |
| `empty-strip-slot-96x96.png` | 96x96 PNG, transparent. A dashed sage frame outline with a small sprocket edge on the left and a faint plus at 30% opacity. | The frame strip at the bottom of the studio is empty on first run; a painted empty-slot plate turns the blank strip into an invitation. |

_4 files._
