# Round two — proposed drawing scope

**For Stephen's approval; not a commission already started.** Counts below are proposed deliverable PNG files, including explicitly listed states. All dimensions are source pixels. Transparent RGBA unless described as a full background. Use sRGB. Names and dynamic values remain live text in the implementation; the finished proof PNGs demonstrate placement only.

## Plant card pieces

| Piece | Size | Count | Treatment |
|---|---|---:|---|
| Detail frame, one per grade | 1080 × 1620 | 7 | Finish the seven reusable geometry proofs |
| Compact grid frame, one per grade | 480 × 640 | 7 | Recompose for a tile; no tiny poem |
| Grade symbols | 128 × 128 | 7 | Seed through orbit; always paired with grade text |
| Card specimen field | 1080 × 1080 | 1 | Quiet midnight background |
| Slate pedestal | 900 × 200 | 1 | Finish existing proof |
| Soft aura bases, sage / gold / ice | 1080 × 1080 | 3 | Transparent falloff to zero alpha |
| Light and vignette | 600 × 1000; 1080 × 1620 | 2 | One of each |
| Dark-mutation backlights | 1080 × 1080 | 2 | Silhouette rim / constellation veil |
| Grade-specific reveal overlays | 1080 × 2400 | 7 | Common through Cosmic, empty center |
| Plant-card reverse / specimen record | 1080 × 1620 | 1 | Live DNA / metadata slots |
| Collection empty-state icon | 360 × 360 | 1 | Empty shelf and seed |
| Ready-to-breed and favorite marks | 96 × 96 | 2 | Separate from grade and EA |

**Keep:** procedural plant geometry, ~70 pots, ~80 companions, all generated names and haiku, and underlying grade/EA data. Do not redraw them from screenshot crops. Render native plant output into the new space. Existing aura concepts and mutations stay; hard edges, low visibility and clipping need renderer work, not 36 new paintings. The original greenhouse scene can stay as a dim, cropped environmental background, below readable surfaces.

## Top bar

| Piece | Size | Count | Treatment |
|---|---|---:|---|
| Compact bar background | 1080 × 220 | 1 | Opaque readable surface |
| Sunbeams, Dew, Shop, Book, Bag, Profile, Settings icons | 128 × 128 | 7 | One cream/sage icon language |
| Primary bloom-ready icon | 128 × 128 | 1 | Sun and seed, distinct from wallet icon |
| Counter capsule, notification dot, progress track, progress fill | 260 × 96; 48 × 48; 600 × 20; 600 × 20 | 4 | Fill stretches in code; values live |

**Keep:** balances, progression and inventory semantics. Replace jewel tiles and miscellaneous image-backed counters. Top bar becomes compact layout work; these images alone do not reduce its height.

## Navigation

| Piece | Size | Count | Treatment |
|---|---|---:|---|
| Games / Greenhouse / Nursery / Wild, inactive and selected | 256 × 160 | 8 | 4 destinations × 2 states, icon + live label space |
| Bottom dock background | 1080 × 190 | 1 | Safe-area extension handled in code |

**Keep:** four destinations and their order. Replace stone slabs. Selected state changes icon, rule and label treatment, not only color.

## Action buttons

| Piece | Size | Count | Treatment |
|---|---|---:|---|
| Share / Details / Breed / Compost, normal / pressed / disabled | 192 × 192 and 96 × 96 | 24 | 4 actions × 3 states × 2 sizes |
| Primary / secondary / destructive wide button, normal / pressed / disabled | 900 × 144 | 9 | 3 families × 3 states; live words |
| Focus ring, close, back, more, sound on, sound off | 208 × 208 for ring; 128 × 128 otherwise | 6 | Common overlays / utility symbols |
| Compost confirmation panel | 960 × 900 | 1 | Plant thumbnail, full name, explicit permanent-removal copy |

**Keep:** action meanings. Compost confirmation is code behavior, not a decorative warning badge. Disabled state must retain readable text.

## Nine category banners

| Piece | Size | Count | Motif |
|---|---|---:|---|
| Creative | 1680 × 720 | 1 | Color wheel / ginkgo |
| Card Games | 1680 × 720 | 1 | Simple card fan |
| Puzzles | 1680 × 720 | 1 | Finalize round-one tangrams |
| Board Games | 1680 × 720 | 1 | Board path / counters |
| Dice | 1680 × 720 | 1 | Dice / rounded seed shapes |
| Patterns | 1680 × 720 | 1 | Repeating tiles |
| Math | 1680 × 720 | 1 | Number tiles / geometric sequence |
| Words | 1680 × 720 | 1 | Letter tiles / small open book |
| Studio Games | 1680 × 720 | 1 | Small constellation of game windows |

Use the same perimeter, palette, title zone and visual density across all nine. Counts and play affordances are live overlays, never baked into banner art. **Keep:** individual satellite game artwork and logos; these banners are the shared hub wrapper. Nine labels above are the proposed taxonomy inferred from the category tags in shots 12–14, not a verified runtime configuration.

## Nursery

| Piece | Size | Count | Treatment |
|---|---|---:|---|
| Pot Shop / Seeds / Clippings tiles | 320 × 320 | 3 | Replace parchment tiles |
| Nursery slot, empty / growing / ready | 960 × 640 | 3 | One slot × three states |
| Two-parent breeding frame | 960 × 1000 | 1 | Calm shared frame, live plant previews |
| Pairing indicator / probability track | 864 × 96 | 2 | Numerical probabilities remain live text |
| Cross-pollinate icon | 128 × 128 | 1 | Matches Breed button |

**Keep:** parent plants, inheritance system, seed/clipping mechanics and useful pairing information. Keep prediction labels out of painterly scenery.

## Wild

| Piece | Size | Count | Treatment |
|---|---|---:|---|
| Forage / Sow / My Plants controls | 192 × 192 | 3 | Transparent edges; live counters |
| Map markers, yours / other / help / seed / selected | 128 × 160 | 5 | Different silhouettes, not color alone |
| Scan ring / radius edge | 1024 × 1024 | 2 | Transparent center; motion in code |
| Lens icon | 192 × 192 | 1 | Remove dark backing |
| Offline / no-results illustration | 480 × 320 | 2 | Legible fallback, not a fake map |
| Filter tray | 1000 × 160 | 1 | All / Yours / Help are live controls |

**Keep:** map provider, geography and spatial gameplay. The known outage is infrastructure work. Do not paint map tiles to hide it.

## Shop frames

| Piece | Size | Count | Treatment |
|---|---|---:|---|
| Shop panel / item tile | 1000 × 1800; 440 × 620 | 2 | Shared frame treatment |
| Shop / herbarium / seeds / pots / companions tab symbols | 128 × 128 | 5 | Unified geometry |
| Hermit portrait restyle | 512 × 512 | 1 | Preserve character, remove dithering |
| Mystery-box and lens inventory icons | 256 × 256 | 2 | Clean alpha, quiet matching art |
| Stock badge / sale badge | 240 × 96 | 2 | Live numbers; no decorative countdown urgency |

**Keep:** item identities, descriptions and shop inventory. Existing item concepts can stay; mismatched frames and pixel treatment change. This does not budget a redraw of the full unknown shop catalog.

## First run, book and keeper

| Piece | Size | Count | Treatment |
|---|---|---:|---|
| Welcome conservatory background | 1080 × 2400 | 1 | Finish D, text separate |
| Welcome / gift / account layout proofs | 1080 × 2400 | 3 | One clear account vocabulary |
| Inline beta / music preference / discovery notice panels | 960 × 260 | 3 | Separate panels, queued behavior |
| Bloom composition, all seven grades | 1080 × 2400 | 7 | Final layouts, native plant placeholders |
| Level-up panel | 960 × 1100 | 1 | Appears after bloom, not over it |
| Book cover / reading panel | 640 × 900; 1000 × 1800 | 2 | Same brass-rule language |
| Book section symbols: Today, Journal, Secrets, Events, Mementos, Herbarium, Items, Hunt, Quests, About | 96 × 96 | 10 | Flat, consistent marks |
| Keeper profile panel / showcase slot / milestone badge blank | 1000 × 1800; 300 × 420; 192 × 192 | 3 | Live class/effect text; procedural companion art |

**Keep:** the narrative premise and book content. Existing forest cinematic may remain an optional story illustration if its crop and text separation are fixed; it is not the default interface language. Keep studio branding and game-specific title screens outside the hub redesign.

## Implementation boundary

No full game reskins, new pots, new companions, production animation sequences, gameplay changes or live code fixes are included in this proposed art round. Layout compression, safe areas, account form consistency, alpha compositing, reveal sequencing and responsive typography must be implemented by the dev team. The proofs provide the target, not a claim those changes are already in the build.
