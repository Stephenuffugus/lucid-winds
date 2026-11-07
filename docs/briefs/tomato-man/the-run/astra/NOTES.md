# Tomato Man: THE RUN

This ZIP adds the three new critters, the burn line and seed pod, and the run UI. Use it alongside the v2 and gameplay packs. Existing hero, scorpion, mirage, seeds, planted sapling, shade and Angry Sun lunge ring stay. All new compound poses already contain the existing sprout pixels, so they require no external art lookup. ASSESSMENT.md contains ten optional proposals for Stephen; none is silently added to the supplied design.

## Import contract

All raster assets use 2 source pixels per world or CSS pixel. WebP sheets contain discrete horizontal cells, not animated WebP. Crop the recorded source rectangle, draw at half size, and place its cell-local anchor at the entity position. For example crab_pinned uses an 80x128 source cell and anchor (40,88), so its world draw offset is (-20,-44). Never trim cells independently. Transparent cell padding is intentional. Durations are milliseconds; zero means a state selected by code. Grid and duration fields appear on every manifest entry; non-image documents use null size/grid and an empty duration list.

anchors.json gives each source rectangle, cell-local anchor and absolute anchor_in_sheet. For non-image documents there is no geometric anchor. Manifest entries with the same id and different extensions are equivalent SVG/WebP alternatives, not two layers to render together. SVG marks use currentColor; WebP marks use #344D61. All supplied strips and contact sheets are below 1600 pixels per side.

## A. Critters

**mote:** four 80 ms flickers. It falls down-screen, short tail upward. Its anchor sits in the core, rather than at the centre of the padded cell. About 12 world pixels total visible height. It is unshootable light: no seed hit or pin state is supplied. Keep its bright core and burnt edge, not a giant bloom that obscures sand.

**gull:** right-facing overhead bird; four fly frames at 100 ms each. Swoop has two 100 ms poses, then hold the second while code owns the dive. Hit has two 80 ms recoil/feather frames. Knocked is a single code-selected tumbling pose. Carry is a single flying pose with the existing two-leaf sprout held in its beak. Its wider cell has body anchor (48,64), beak and sprout-root (78,64). The carried sprout uses the same artwork at half its planted size so the bird remains readable. Rotate all bird art about the body anchor; no ground shadow is baked into it. Tiny detached feathers never change collision.

**crab:** four 100 ms sideways scuttle poses, with pincers right at zero bearing. Pinned alternates two 300 ms restrained poses. It uses the exact existing planted sapling at its usual 30-world-pixel height, root at (40,88) source. Do not draw another sprout over it. Flipped has one 100 ms settling pose and one zero-duration persistent pose. The specific A3 rule overrides the general second-hit sentence: the crab flips after THREE seeds and stays. The renderer should not infer damage or lifetime from sprite frames.

Cue SVG ids are exactly tm-mote, tm-gull and tm-crab. critter_icons.webp provides those marks in that order. Use broad shapes at 24 CSS px; keep interactive touch targets at least 48 CSS px where applicable.

## B. Sand and light

**burn_line:** one neutral strip for code tinting, four 100 ms frames, each 256x128 source / 128x64 world pixels. Tile horizontally only. The top-left anchor is the exact leading boundary at source y=0. Repeat the selected cell, not the complete four-frame strip. The wash is opaque; draw it ABOVE terrain and ALL safe-shade rendering, below the hero and HUD. Fill the rest of the screen below its bottom with the same tint colour. Never let an awning or shade mask punch a safe hole in it. The bottom of the band reaches white to join that fill; the leading three source pixels are a firm bright rim. Horizontally mirrored texture halves give matching repeat edges. Texture shimmer does not move the danger boundary.

Suggested multiply tint colours (RGB channel multiplication, not replacement of luminance): Morning Tide #FFF7E3; Midday Blaze #FFF4CE; Tide Pools #F2FFFA; Dunes at Dusk #FFF1E7; Eclipse #F7F7F2. White remains a light wash in all worlds. Reduced motion holds frame 0 while the actual burn line continues to rise. The twenty-second flare and three-second eclipse timing are gameplay rules, not encoded in these four frames.

**seed_pod:** two frames, quiet 700 ms and glint 100 ms. The pod contains three seeds and reads at roughly 16 world pixels in a padded 24-pixel cell. The game awards three seeds on pickup, respecting whatever inventory cap its design uses; no new cap is invented here. Glint can be held off under reduced motion without changing pickup visibility.

## C. The run's face

**run_plate:** 220x66 CSS pixels, three states: ready, pressed, disabled. Its rim, paper and ink extend the existing DASH/SHADE assets. The disabled slash is a shape cue. SVG equivalents are included. Nine-slice margins are 36 source pixels on all four sides. Keep RUN and the best distance in code. At the supplied width, use RUN around 22 CSS px, best distance around 12–14 CSS px; source baselines 62 and 99. Enlarge the plate for larger accessible text instead of shrinking type. Text safe rectangle is [64,22,312,88] in source pixels.

**run_badge_0..4:** Morning Tide, Midday Blaze, Tide Pools, Dunes at Dusk, Eclipse. Each is a two-cell strip: earned first, unlit second. Draw at 48x48 CSS px. Unlit interiors and rims are dark, not simply faded coloured badges. Labels and accessible reached/not-reached status remain in code. Select the state explicitly; zero-duration frames do not animate.

**run_card_ornament:** a new 320x40 CSS-pixel line band for THE SUN WON, with sprout at left and sun at right. Reuse the v2 postcard frame. The central source rectangle [180,12,280,56] is left empty for live text. SVG and WebP are alternatives. Do not bake the sample preview's words into production art.

**tm-mile:** five 24-pixel marks in order 500, 1000, 2000, 3000, 5000 metres. One flag, then one through five tally bars distinguish their ordinal progress; the bars do not count kilometres. Exact metre labels remain in code. The combined SVG exposes generic tm-mile and tm-mile-500, tm-mile-1000, tm-mile-2000, tm-mile-3000, tm-mile-5000; standalone SVGs and a five-cell WebP strip are included. The brief's 1,200-pixel world step and metre milestones are different units: code owns distance conversion.

## Sound direction

- Mote: a short dry descending hiss with a soft high ember tick, low enough that a stream of motes never becomes a siren.
- Gull: one brief airy two-note squawk for the swoop tell and a papery wing flick on a seed hit, without loud real-bird screeches.
- Crab: quiet alternating sand clicks while moving, a woody seed tap when pinned, and a soft hollow clack on the third-seed flip.

No audio files are included; the game synthesises these cues.

## Live reference and production

The live reference session entered Dawn Ribbon, used its seed button, moved briefly, and entered Shadow Run with another seed toss. It was a desktop browser session, not a phone; physical-phone play and touch feel could not be reviewed here. The capture in the three contact sheets is from that real Shadow Run session. The cropped views and new-art overlays are labelled as proposals, not screenshots of a built THE RUN. The designed brief remains the source of truth; this pack does not claim an implemented or playtested new mode. No tests, validation scripts or pixel audit reports were made.

Raster art was generated with the built-in image generator and exported into fixed untrimmed cells. Production prompts specified Sunstruck Stop Motion, worn matte clay/paper, bleached light, transparent isolated frames, fine restrained pigment, and no text or scenery. Mote: four upward-tail flickers; gull: overhead right-facing fly/swoop/hit/tumble; crab: sideways walk, pin bases and legs-up flip; burn line: four neutral horizontal sand washes; pod: three-seed husk with one glint; badges: five world reliefs with corresponding dark states. Badge refinement corrected the midday background to ochre and darkened unlit rims. Existing sprout pixels were composited into carry/pin poses. UI plates, line ornaments and cue marks extend the established vector grammar. Export removes low-alpha generation fringe and retains fixed cell geometry; art is generated, not described as hand painted.
