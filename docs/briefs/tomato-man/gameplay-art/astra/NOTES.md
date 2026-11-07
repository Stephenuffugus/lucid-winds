# Tomato Man gameplay art handoff

Use this pack alongside v2. It adds the new seed action and sun critters; it does not replace the existing hero, worlds, hats or boss. All delivered sheets are WebP with alpha. The two folders are assets/a_seed and assets/b_critters. No game code, tests, validation scripts or reports are included.

## Units and import

All gameplay raster art is authored at 2 source pixels per world pixel. All anchor and cell coordinates in anchors.json are SOURCE pixels, measured from each file's top-left. Draw a source cell at half its pixel dimensions, then place its cell-local anchor at the world position. For example, a cell anchor (40,72) becomes a world draw offset of (-20,-36). Source rectangles and anchor_in_sheet are given for every frame. Never auto-trim animation frames at import.

The manifest gives whole texture dimensions, frame names, loop choices, nominal world extents and timing. Sprite sheets contain discrete frames, not animated WebP files. A zero duration means a state selected by code, not a timed frame. SVG cue marks use currentColor and accept any UI render size. Their own viewBox pixels are also recorded in anchors.json.

## A. Seed toss

seed_spin has four tumbling frames, with a visible seed approximately 16 world pixels across inside a 24-pixel padded cell. The suggested spin is four 70 ms frames; the brief did not prescribe a spin rate. The engine keeps the existing 46-world-pixel arc and flight duration. Draw seed_shadow at the projectile's ground projection, without the arc's vertical offset. Its darkening is decorative and must never count as safe shade.

sapling_sprout plays four 50 ms frames. sapling_alive alternates two 600 ms poses while the live plant exists. sapling_wilt plays four 125 ms frames during the LAST 0.5 seconds of the engine's existing lifespan. Growth does not extend that lifespan. The root anchor stays at the landing point through all three sheets. Healthy foliage is 30 world pixels tall. The seed husk at its base links the projectile to its result.

sapling_shade is 232 source pixels square and draws at 116 world pixels square. Its centre is the landing point. The soft edge stays inside radius 58. The engine's circle remains the safety truth, including activation and expiration. If the game already shades through a union mask, use the texture as the mask's visual treatment rather than laying a second dark circle over it. Never double-darken overlapping safe circles.

seed_burst has four 75 ms frames inside 140-world-pixel square cells. It is seed husk, pale paper and green leaf fragments. It signals the existing successful ring interrupt; it does not imply damage or introduce an attack radius. Play it at the actual ring hit point. The last frame is sparse, and the engine removes the effect after 0.3 seconds.

button_seed_states contains ready, pressed and disabled cells, each 132 source pixels square for a 66 CSS-pixel button. Equivalent standalone SVGs are included. The rim, sand fill and slate ink follow the existing DASH and SHADE buttons. Keep SEED, the remaining seed count and the accessible name in code. Do not bake the word into an image. Use one selected cell, not an animation, and retain the existing input and cooldown rules.

landing_mark draws at 14 world pixels square. It is a faint ring around the predicted landing point. Do not attach it to the airborne visual or make it look like a tiny safe pool.

## B. Sun critters

The scorpion faces right at rotation zero. Rotate about its thorax anchor using the existing bearing. Its overall visible length is approximately 40 world pixels. Dark dry clay gives it contrast against every world's light sand; pale joint ridges preserve the claw and tail shape. No world-specific recolour is needed. Avoid tinting it towards the ground colour.

scorpion_run loops four frames at 12 fps. scorpion_charge is a two-pose warning with lifted tail and spread pincers, plus a warmer shell accent. The charging state is selected from the engine's existing detection/charge logic. Hold its second pose if the state outlasts the short visual lead-in. This pack does not change warning length, speed or collision.

scorpion_sink and scorpion_rise each have four 100 ms frames. The last sink and first rise show only disturbed sand; hide the object during the fully submerged interval. Sand particles are art, not collision or safe shade. Neither sequence indicates death.

scorpion_pin has two restrained poses and the exact same two-leaf sapling art from section A attached to its back. The taller padded pin cell preserves room above the shell for the sprout; use its recorded thorax anchor rather than centring the whole rectangle. Pin duration stays the live game's two seconds. A two-frame 300 ms sway may loop within that interval. Do not also draw a second planted sapling on top of the precomposed pinned sheet. Standalone sapling art remains available if the renderer needs separate layers.

The mirage is an orange, hollow, interrupted version of the hero silhouette. Its calyx, face openings and limbs are all in the same warm spectral family. It has no solid red tunic, green leaves, black limbs or separate orange boots. Its broken surface and open gaps distinguish it from the real hero without relying only on colour. Keep it behind the hero in the existing one-third-second delayed movement path. The art does not store or calculate that path.

mirage_shimmer loops four frames; mirage_dissolve plays four frames over exactly 0.35 seconds and then disappears. The pinned mirage keeps its orange body visible with the same green sprout attached. That green means pinned, not a new player. Do not make the whole mirage green. Its two pin cells may gently alternate, but must not continue travelling along the delayed path while the engine says it is pinned.

sting is a non-gory three-frame effect at the hero, inside a 72-world-pixel square canvas. The brief gives no duration; this pack chooses 60 ms per frame, 0.18 seconds total. It uses a few ochre and terracotta impact ticks, never a full-screen flash or a wound. Existing invulnerability and exposure logic remain unchanged.

The three one-colour marks are tm-seed, tm-scorpion and tm-mirage, both as standalone SVG symbols and a combined symbol file. Use the exact IDs with the cue-line and How to Play markup. A matching three-cell WebP icon strip is provided for canvas rendering. Minimum interactive hit area remains 48 CSS pixels even if a mark renders at 24.

## Motion, sound and scope choices

Reduced motion holds one alive sapling pose and one mirage shimmer pose, removes repeated decorative pin sway, and keeps gameplay-critical positions, charging tells, appearance and disappearance intact. Do not stretch the effect timelines to compensate. Leave moving shade and the boss's actual telegraph readable.

Keep sound quiet: a dry seed flick, a small paper pop for sprouting, a husk crack for a successful boss interrupt, sandy scorpion ticks and a soft airy mirage hiss. No audio files are supplied. Use the game's existing synthesis and provide every necessary signal visually too.

This was an art production pass. The live review was a desktop Dawn Ribbon session with seed use. A physical phone was not available, browser phone emulation was unavailable, and later worlds were locked in that session. The scorpion and mirage production follows the supplied brief and live How to Play rules. The capture-backed previews are labelled proposed art composites, not implemented phone screenshots or observed late-world encounters.

Raster artwork was made with the built-in image generator and then exported into fixed cells with alpha, shared pivots and 2x sizing. The shared prompts specified matte sunstruck stop-motion, bleached light, worn clay/paper, no gloss, no sticker outlines, no gore, no text, isolated frames and transparent backgrounds. Seed prompts specified four tumbling poses; sapling prompts specified sprout, two live sways and green-to-yellow wilt; burst prompts specified sparse husk and leaf confetti. Critter prompts specify the right-facing overhead scorpion's run, pin, charge, sink and rise, and a hollow orange hero echo with shimmer and dissolve. UI marks and exact circular masks extend the existing vector grammar. Generated art is not described as hand painted.
