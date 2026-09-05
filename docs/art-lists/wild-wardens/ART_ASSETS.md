# WILD WARDENS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/wild-wardens/` under the names below; say which landed and the code side wires them.

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

**Game:** `wild-wardens` · satellite · creative · audit impact 5/5 · effort L · audit rank 3

## Background wanted

A painted overgrown-place plate for the title: a moonlit clearing swallowed by vines, a warm lantern glow low on the left, near-black canopy at the top so the wordmark reads against it. Plus a darker, softer variant of the same forest behind the roster and skill-tree screens so the menus feel like one place instead of eleven boxes on void.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/art/bg-title-1080x2340.jpg` | full-bleed opaque. Moonlit overgrown clearing, vine-swallowed stonework, warm lantern glow low-left, deep near-black canopy across the top third. | Replaces the flat black title ground - currently the entire background of the game's front door is #000000. |
| `assets/art/logo-wardens-1024x512.png` | transparent PNG. Painted WILD WARDENS wordmark in warm gold with a rim light, a couple of leaves breaking the letterforms, a soft dark drop so it holds on any plate. | Replaces the plain dark-gold web-font title that currently disappears into the black behind it. |
| `assets/art/btn-plate-360x88.png` | transparent 9-slice PNG plus a brighter primary variant (btn-plate-primary-360x88.png). Weathered wood and brass, warm gold edge light, dark interior. | Replaces the eleven identical hollow outlines with a plate that can carry a hierarchy - primary for WALK THE WILD, quiet for the rest. |
| `assets/art/icon-menu-walk.png (plus roster, tree, territory, inventory, equipment, mastery, quests)` | 8 files, 128x128 transparent PNG, one small painted mark each, gold-on-dark, readable at 32px. | Gives each menu row its own silhouette so the front door stops being a stack of eleven identical boxes. |
| `assets/art/warden-portrait-512x512.png` | transparent PNG, one painted warden bust, warm rim light, big readable silhouette. | Puts a character on the title screen. Right now the front door of a creature-taming game shows no creature and no warden. |

_5 files._
