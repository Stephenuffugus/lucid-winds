# Sunstruck Stop Motion

A sun-bleached miniature world with a little wrongness and a lot of stillness. The reference is the attached tomato portrait, not the retired glossy vinyl direction. Generated illustrations are described as generated art, never hand painted.

## Palette
These are production approximations sampled by visual judgment from the supplied reference, not measured colour claims.

| Role | Hex | Use |
| --- | --- | --- |
| Bone sand | #EBD9A1 | Main ground and paper |
| Bleached highlight | #FFF0C5 | Ivory eye slits, pale raised edges |
| Tomato | #E84C2B | Hero and sparse cloth accents |
| Bruised red | #AE3829 | Body modelling, never injury |
| Calyx | #087B61 | Leaves and cactus |
| Matchstick | #172419 | Limbs and hollow sockets |
| Boot orange | #E99532 | Boots and action accent |
| Planet magenta | #AE3D5C | Distant scenery only |
| Safe shade | #657E94 | Runtime safe-mask tint |
| Shade deep | #344D61 | UI dark panels; not opaque terrain |
| Aloe | #68AD72 | Star-shaped currency pickup |
| Sunbeam | #E8BD53 | Yellow currency, medals |

Light ground is non-negotiable even in Eclipse. Composite safe shade once from a union mask, suggested opacity 0.48 to 0.60; do not darken overlaps repeatedly. Keep hot sand warm and patterned. Colour is supported by shape: green star aloe, yellow radial sunbeam, round safe patch, jagged hot patch.

## Light and surfaces
Flat warm light from upper left. Matte pigment and fine restrained grain. Cloth looks like faded woven canvas; wood is dry and rounded; stone is chalky; leaves are thick paper; limbs resemble charred rubber. No plastic specular highlights, thick navy outlines or sticker rims. Prop cutouts do not contain long ground shadows. Any baked contact occlusion stays within the object footprint and is too short to imply safe ground. Engine shade is the authority. Keep ground grain low contrast and empty of hero-coloured marks.

## Hero and layering
The builder body is a headless tunic with limbs, not a second tomato head. Builder canvas 512×640, neck socket (256,166). Place the 384×384 default head so its socket (192,340) meets that neck socket; its top may extend outside the body canvas, so the assembled portrait needs a taller parent or a translated body. Hat canvas shares the head coordinate system, anchor (192,76). Face canvas 256×384; its internal head box is (0,64,256,256), so face cell placement maps to a 384 head at scale 1.5 with an offset of (0,-96). The manifest repeats exact exported anchors.

The head supplied with the face is for builder and marketing. A separate faceless head and faceless gameplay bases support engine expressions. Calyx is anatomy and is retained on the default tomato; it is not counted as one of the 12 cosmetic hats. When a hat occludes it, place the hat above the calyx. Cool Shades align to the eye line rather than the top anchor; see manifest notes.

For play use the elevated camera rather than an overhead circle. Visual centre (128,128) is the collision pivot, not the feet. Keep red head, green calyx, black arms and orange feet visible. Rendering scale is chosen by the head width (about 28 world pixels), so feet can extend beyond the radius-14 collider. Separate illustrative composites are included as ready previews; engine-ready bases remain faceless and cosmetic-hatless.

## Motion
Walk is a four-beat puppet shuffle, 8 fps. Dash has two compressed poses at 12 fps. Hop lifts the complete visual while its world pivot stays put; no misleading collision translation. Respawn is a brief pale pop, victory one small wave. A face change is preferable to frantic full-body animation. Burn progresses warm blush, droop, then a small sad charcoal silhouette and wisp; no wounds. Ordinary sun eyes may follow slowly. Keep rays and background drift separate from the position cue. Reduce motion disables grain animation, shake and shimmer but preserves necessary shadow motion and boss timing. FX are never collision masks.

## Type and copy
Use Google Fonts: **Bree Serif** for seed-packet headings and **Atkinson Hyperlegible** for controls, counters and coach copy. These are integration choices; no remote font request is needed at runtime if the developer packages the licensed font files. Wordmark is an outlined vector drawing and has no runtime font dependency. The pack does not bundle third-party fonts. Body text at least 16 CSS pixels on phone, headings 22 to 28; use tabular counters where available. All player-facing copy omits dashes and exclamation marks. Examples: “Stay in the shade”, “Try that crossing again”, “Three treasures found”.

## Icon grammar and interaction
One ink colour, broad silhouettes, round internal corners, no hairline detail. SVG viewBox dimensions are independent of CSS size. At 24 pixels keep the shape; at 48 add breathing room, not extra detail. Marks use currentColor. A 24-pixel pause mark still has a 48-pixel hit area. Shell is fan shaped, cone is triangular, gem is angular, aloe is a five-point succulent, sunbeam is a disc with short rays. Disabled means reduced contrast plus a slash overlay, not opacity alone. Selected means an inset ring or check, not colour alone.

## Worlds
Morning Tide uses bone sand, pale blue sky and old striped canvas. Midday Blaze uses bleached ochre and stunted vegetation. Tide Pools uses chalk, turquoise recesses and salt marks, with all walkable stone kept light. Dunes at Dusk uses peach sand, leaning growth and the far magenta tomato. Eclipse uses ivory ash, old arches and a muted charcoal sky; never bake safe darkness into the ground tile.

## Compositions included
See previews/hero_turnaround.png for front, side and rear reference. See previews/style_play_screen.png for the art direction composited with the actual Dawn Ribbon capture; it is labelled as a proposal, not implemented gameplay. See previews/style_world_select.png for the five illustrated destination cards. These are design communication images, not additional UI plates.

## Export and placement
Manifest units are pixels, anchor coordinates measured from top left. Sprite sheets include columns, rows, cell width, cell height and frame order. All cells retain their alignment; never auto-trim animation cells independently. A trim box, if present, is informative and does not replace the anchor. Nine-slice margins are stated per frame. Ground tiles are opaque. Horizon edges are prepared for repetition. Store frames intentionally exceed 1600 pixels where the brief explicitly requires 1920. The Angry Sun is delivered as the requested 3072×768 strip despite the general 1600 maximum; individual 768 states are also provided for constrained loaders.
