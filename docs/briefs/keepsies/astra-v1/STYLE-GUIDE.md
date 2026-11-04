# Keepsies style guide

## Dusk, dirt, brass and borrowed treasure
Keep the midnight greenhouse interface, but make the playing space an Ohio neighborhood vacant lot at the end of a warm day. The visual center is the marble. People and objects look used, cared for and specific. No mascot, franchise logo or product packaging.

## Palette
| Role | Hex | Use |
|---|---|---|
| Night | #0d100c | Main UI background |
| Cream | #e8dcc8 | Primary type and chalk |
| Brass | #c8a84b | Primary action, selection |
| Clay | #806b50 | Dirt midtone |
| Walnut | #3b2b21 | Shelf wood |
| Amber | #e0b060 | Motivated lamp light |
| Mist | #9fc9e8 | Focus and information |
| Muted | #98a086 | Secondary labels on dark only |
| Coral | #d86a5a | Loss or destructive choice, paired with words |

## One light
World key: warm 3000 K lamp at ring northwest, 35 degrees above the ground, projected upper left in the default playing view. Neutral dusk ambient fill is not a second shadow caster. Only the lamp casts directional shadows. Rotate environment and key together; do not move the sun when the camera orbits. Materials use the same neutral environment reflection. UI props and portraits use upper left amber light with soft neutral fill. Meshy references intentionally use neutral even studio illumination for geometry extraction; tint them in game, not in the reference photograph. Arena concepts inherit upper left key direction; molten and ice emissives are accents with no extra shadow maps.

## Type
Retain the current system rounded sans until fonts are measured. Proposed Google Fonts pair: Fraunces 600 for brief display headings, Nunito Sans 400/600/800 for interface text. Bundle WOFF2 locally if adopted; no runtime network font dependency. Minimum body 16 CSS px, secondary 14, controls 16, headline 26 to 34. Avoid all caps for multi-line instructions. Outlined wordmarks in this pack are custom vector lettering and require no font.

## Icon grammar
24 unit viewBox, 1.8 unit rounded strokes, one currentColor ink, two or three large features maximum. SVG drawings scale to 24 or 48 CSS px. The tappable wrapper is at least 48 by 48 CSS px even for a 24 px icon. Labels remain on unfamiliar actions. Do not communicate tier, stake eligibility or damage using color alone.

## Tiers
| Tier | Color | Mark | Frame |
|---|---|---|---|
| Common | #b9b4a4 | Circle | Single thin outline |
| Uncommon | #85bda8 | Two leaves | Paired lower corner strokes |
| Rare | #91bce1 | Diamond | Four corner cuts |
| Epic | #d7a0d9 | Four point star | Inset double outline |
| Grail | #e6c56a | Crown | Top crown medallion plus double outline |

Existing marble colors do not change with tier. Each card includes the written tier, tier mark and name. Selection uses a thicker outline and check, independent of tier hue. Protected status uses a lock; owned count does not imply stake eligibility.

## Surfaces and objects
Cards are near-black lacquer with brass edge, not piles of ornamental parchment. Dirt is fine compacted brown grit with scattered tiny pebbles, no baked sunlight. Chalk is granular cream with worn interruptions, never neon. Standard pouch is faded ochre canvas and cotton cord. Collector pouch is blue waxed canvas with a brass eyelet. Grail pouch is charcoal velvet, cream lining and a brass clasp. No branding. Open mouths stay dark and empty for live reward renders. Shelf is walnut with shallow brass-rimmed wells. Cloth is faded warm charcoal linen, broad folds outside the three resting areas.

## Boss silhouettes
Dusty: round taped spectacles, oversized jacket, battered tin, forward lean. Marlene: silver bob, rolled sleeves, broad scarred hands and steady posture. Pit Boss: triangular waistcoat silhouette, sleeve garters, folded hands, patient half smile. Old Ironsides: no person, only a heavy envelope with a circular occupied position; the real marble belongs in the overlay window. Curator: tall narrow high collar, close cropped silver hair, white glove and severe stillness. Kept-it expressions are quietly satisfied, never cruel.

## Motion
Keep the specified 0.6 second rare glint, one by one pot transfer, 0.4 second technique freeze and shatter-only slow motion. Add a 120 ms button depression, 180 ms selection transition, and a pouch mouth opening with no mandatory wait before Skip. Cloth, portrait, skyline, shelf and frames never oscillate. No breathing whole-screen glow. Reticle settles by narrowing its gap; reduced motion shows discrete settling/settled states. Reduced motion also removes glints traveling across cards, camera pushes and reward flights; names and ownership changes remain visible. Draw selection and motion in code, not in a looping texture.

## Composition examples
The previews folder contains proposed ring and tin layouts. They are annotated composition studies made from supplied captures and delivered assets, not screenshots of a modified build. Keep the shooter above thumb occlusion, live cross inside the middle third, score in the top safe area, and controls in a bottom tray outside the ring. Tin scene uses a 900 by 600 plate with mouth coordinates in anchors.json; heirloom cards remain below it with real render inserts.

## Runtime budget
Initial art target below 1.5 MB compressed; 8 MB is the whole game's limit, not permission to load this ZIP. Load the ring environment, core icons and Dusty only at first visit. Store art, 1024 Meshy references, contact sheets and documents never ship to clients. Load other boss states, showcase and pouches by screen. Sculpt inserts: proposed LOD0 2500 triangles, LOD1 800, shared simple materials, no unique 2K texture per marble. Validate actual total ≤120k match triangles, ≤50 scene draw calls, ≤24 marble draw calls. Low-tier fallback keeps the silhouette and removes expensive transmission. No performance claim is made without the target phone.
