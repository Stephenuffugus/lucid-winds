# Tomato Man handoff notes

## Decisions that ship
- The supplied local brief and attached thumbnail were the source materials. I did not connect to or change Drive or the GitHub repository.
- The assessment was written before the asset work. The live review covered the guide, world selection, Morning Tide level selection and a short Dawn Ribbon attempt with move, Dash and Shade. No completed mobile or late-game playthrough is claimed.
- The default tomato keeps its calyx as anatomy. “Hatless” means no cosmetic hat. Gameplay bases are faceless; builder heads carry the face. Do not stack an engine face on the precomposed idle portrait.
- The readable gameplay treatment is an elevated puppet view with foreshortened limbs, not a strict overhead tomato circle. At very small size, prioritize socket and boot contrast over texture.
- The default head is a newly generated interpretation closely matching the supplied face, not a pixel-identical extraction of the thumbnail.
- “Blank” in the face sheet means a vacant neutral stare. Use tomato_head_faceless when no facial features are wanted.
- Faces were aligned into a fixed overlay box during extraction. Builder head neck socket is (192,340); body neck socket is (256,166). Place the head at body_socket minus head_socket. A full builder parent must allow the head above the body's canvas. For example, on a 512×840 parent, body at (0,180) and head at (64,6) align both sockets at (256,346).
- Cosmetic hats use the same 384×384 head coordinate system; their content is positioned within it. Cool Shades intentionally sits lower over the eyes. Top-view hats use the shared 128×128 canvas and approximate head anchor (128,52) on the default 256×256 body; pose-specific hat offsets belong to the animator, not physics.
- Animation sheets are short puppet beats. Walking uses 4 frames at 8 fps and Dash uses 2 at 12 fps. Hop, respawn and victory are single poses intended for runtime easing, not long baked sequences.
- The 4 exposure cells are healthy, warm, hot and a small charred finish. Keep the engine's continuous exposure tint if desired. Do not tint the UI or safe mask with the hero.
- The 3072×768 Angry Sun strip follows the specific requested size despite the general 1600-pixel limit. Separate 768×768 states are supplied for loaders that prefer smaller textures.
- All five ground tiles stay light, including Eclipse. Repeat edges are prepared through mirrored texture quarters. Horizons use a mirrored panorama repeat; expect a symmetrical pair of motifs, rather than unique scenery indefinitely.
- Decor sheets use a 4×2 grid of 256×512 cells inside 1024×1024. Individual cutouts are provided so the team does not need to crop the sheet. Their art scale is consistent within the sheet; scenery such as the far planet should be placed by role rather than interpreted as a real-world measurement.
- The shared vendor cart has controlled slate and sage pigment reskins derived from the same silhouette. Its wheels remain along the bottom. The generated alternative cart sheet with an opaque backdrop was not included.
- Thin natural contact occlusion inside a prop is illustrative, never a playable safe area. The engine alone casts long shade.
- Soft FX and clouds were extracted from pale generation plates with a soft alpha matte. Keep FX additive or source-over at low opacity. They do not determine collisions, wind, cooling, or exposure.
- Store and result frames are alpha PNGs because the brief explicitly requests transparent windows. This overrides its general opaque-store rule for those frames. Feature, social and promo art is opaque. Final store screenshots should be flattened only after real game capture and live text are added.
- The six screenshot frames contain no text. The frame filenames describe their intended message. The manifest provides exact window and headline-band rectangles.
- The logo is Bree Serif lettering converted to SVG paths with a calyx accent. UI marks are original one-colour SVG shapes. The heading type choice is Bree Serif and control/body type is Atkinson Hyperlegible, both from Google Fonts. Font files are not bundled; local packaging is needed for offline use. Font sources: https://fonts.google.com/specimen/Bree+Serif and https://fonts.google.com/specimen/Atkinson+Hyperlegible .
- All SVG icon marks use currentColor. The PNG versions are convenience renders. Do not rely on an SVG external font or remote image reference.
- No game code, test suite, validation scripts, audit report or test log is part of this delivery. The production work is the art, documents and manifest.

## Import notes
Paths are relative to the ZIP root. The manifest records every shipped artwork file, including previews. A sheet frame is identified by its frame order; origin is top left, no spacing or extruded padding between cells. Anchors are measured within the whole image or the individual sheet cell as noted. Nine-slice values are left, top, right, bottom. The SVG viewBox matches its listed dimensions.

The existing loader's art/ui/logo.png should point to assets/f_ui/logo.png or receive a copied alias when integrated. Keep source assets under the supplied folders; do not rename this pack to imitate old glossy art paths. The developer owns that mapping.

Layer order: light terrain, engine-computed safe shade, nonblocking ground decoration, physical casters and hero using the existing depth rules, pickup glow and pickup, weather FX, HUD. Distant planet and horizon belong behind the level. For the hero: base, expression, cosmetic hat, short particle trail behind the body. Builder uses body, selected head, then hat; the faced head does not need the face overlay unless using the faceless default.

At 360 to 430 CSS pixels, show a smaller mark inside a minimum 48-pixel interaction area. Keep controls clear of the player's route, preserve text labels or accessible names, and avoid using the colourful textures as button boundaries. Gold, silver and bronze need distinct labels in the accessible UI.

## Sound and motion direction
No audio files are supplied. Keep the existing procedural music and synthesis. Add dry soft rubber boot taps, a paper rustle on hat changes, a small ceramic tick for aloe, and a gentle exhale for a burn. Avoid screams, injury sounds and loud failure stings. The Angry Sun can sound like a tired accordion or breathy kettle, with a clean cue before every dive. Keep critical cues available visually for silent play.

Awnings sag slowly after a clear warning. Umbrellas rock only when tilt actually changes. Cactus spectators may blink rarely; their bodies stay still so they do not look like platforms. The planet drifts barely perceptibly. Use a short single screen-edge warmth cue for danger rather than repeated flashes. Reduced-motion mode keeps necessary moving shade but removes decorative wobble, grain animation and screen shake.

## What to make next
First integrate the default hero, ordinary sun, one awning and Morning Tide. Judge the scene on a real phone before expanding the visual density. After this pack, the most valuable new art is directional head and hat offsets for all movement bearings, a larger expressive victory sequence, then one giant travelling tomato-shadow encounter. Five extra bosses are lower priority than making the existing shade crossings feel fair.

## Generation prompt record
Raster art was generated with the built-in image generator using the supplied thumbnail as the identity and material reference. Production extraction, size conversion, palette compression, compositing and vector UI followed. The shared prompt requirements were: matte sunstruck stop motion; bleached upper-left light; fine film grain; tired hollow eyes; red tomato, green calyx, black limbs, orange boots; no glossy vinyl, thick sticker outline, gore, brands or unrelated characters; clean alpha for movable pieces; no text in scenery.

The hero source uses a 3×2 layout for headless body, faced head, faceless head and front/side/rear. Expression source is 4×2 in manifest order. Movement source is 4×3, with faceless poses. Produce sources are 4×4, with strawberry, orange, lemon, lime, peach, cherry, bell pepper, eggplant, avocado, heirloom, pickle, golden and sunburn followed by exposure alternates. Hats are 4×3 in manifest order, generated at builder and elevated camera angles. Trails are 4×4, one four-frame row each for ember, cool, aloe and rainbow. Sun source is 4×2, four boss faces followed by ordinary disc, corona, rays and HUD token.

Each world plate uses a broad open light foreground, sparse side scenery, no hero or text, with its world-specific sky and materials. Each world decor source is 4×2 in the manifest's named order. Caster source is 4×3 in the order striped awning, solid awning, cabana, billboard, umbrella, thatch umbrella, palm top, leaning palm, tower, arch, cliff, cart. Pickup source is 4×4 in its manifest order. FX source is 4×4 with hazard/weather in row one, burn smoke in row two, dash puff in row three and collection, respawn and clouds in row four. The menu prompt asks for the reference beach with a long diagonal cool shadow and open UI space. Promotional art asks for the exact hero stepping into shade on the right and open wordmark space on the left.
