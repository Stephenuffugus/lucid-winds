# Silent Reel

A person trying to remain perfectly ordinary while the room becomes increasingly interested. Soft theatrical scenery, bold ink performers, parchment cards and sage fittings. Use the supplied assets, not a new illustrative style for each screen. Generated room and witness artwork is described as generated illustration, never hand painted.

## Palette and tinting

| Token | Matinee Sepia | Midnight Show | Technicolor | Silver Screen |
|---|---|---|---|---|
| Paper | #e7e0cb | #c9d2d8 | #f6e7c4 | #e9e9e4 |
| Paper shade | #c7bd9c | #93a3ae | #dccb9d | #bdbdb6 |
| Sage / coat | #37493d | #17262e | #1f5f5b | #3d3d3a |
| Deep | #1c2620 | #141a1e | #153c39 | #232321 |
| Ink | #221f18 | #141a1e | #20322d | #252523 |
| Accent | #e0902f | #9ebbbd | #e0592f | #a8905c |
| Relief | #5fd0b0 | #a8d9d6 | #76d4bb | #d2d2ca |
| Danger | #c0392b | #a32f2a | #a91e43 | #383836 |

Surface colors must come from CSS variables. Inline character SVGs expose coat, paper and ink; skin remains natural across the three color themes, with a grayscale art filter for Silver Screen. Other fixed SVG strokes and raster art use the art-layer filters defined in `dev/palette_and_controls.css`. These are perceptual tints rather than exact per-pixel hex replacement. Text, timers and controls sit outside those filters. Use the palette showcase preview to compare the results. If exact raster recoloring becomes necessary, export per-theme derivatives from these source files rather than hue-rotating the entire app.

Never rely on red versus mint alone: unsafe VENT has a cross and explicit text; cover VENT has a countdown and changed label; tired pads have hatch marks; strike tokens gain an X; equipped cards gain a check. Silver Screen intentionally keeps state shapes.

## Type

- **Noto Serif Bold**, Google Fonts: wordmark and large title cards. The wordmark exports contain outlined paths, not live text. Title cards: 32 to 40 CSS px depending on room name; headings 24 to 28 px. Do not track long titles until they overflow.
- **Open Sans Regular/Semibold**, Google Fonts: control labels, counters and instructions. Body 16 px, compact labels 14 px, essential meter values no smaller than 12 px. Sentence case for explanations; short capitals on pads.
- Google sources: https://fonts.google.com/noto/specimen/Noto+Serif and https://fonts.google.com/specimen/Open+Sans . Local system copies were used for the supplied outlines and previews. Font binaries are not required to display the wordmark. Self-host the selected Google Fonts files in the production asset cache if offline typography is required; retain their licenses.
- Do not use tiny tracked serif text for timers, long tutorial instructions or locked-card progress.

## Icon grammar

48 by 48 viewBox, usually 3 unit rounded strokes, open internal spaces, one `currentColor`. Inspect at both 24 and 48 px. Use inline SVG or CSS masking when tinting; an SVG loaded through `<img>` does not inherit the parent's currentColor. A 24 px drawing still belongs to at least a 48 px interactive target. Icons are not standalone instructions: keep short visible labels for Cough, Sip and Waft. A fake cough has a star cue to distinguish it from environmental coughing.

## Surfaces

- Cards: opaque parchment, two thin inset rules, small geometric corner detail. Do not put text directly on generated grain. The card frame has 48 source-pixel nine-slice corners.
- Pads: solid sage theatre fittings, inset brass rule, simple thumb bracket, visible lower lip. Pressed state loses perceived depth and gains a mint inset. Tired state gains amber hatching. The center remains clear.
- VENT: parchment when unsafe, mint when covered, brass for the perfect result. Player labels are `Do not vent`, `Vent`, `Perfect`. No exclamation mark.
- Stage: scenery behind everything, witness strip behind player, seated bust in front. Furniture anchors the shoulders; do not restore the floating head by cropping off the collar.
- Intertitle: tall parchment double-rule card. Text band is x=90, y=330, w=720, h=470 in its 900 by 1200 art. The game supplies act, title and subtitle. Show no more than those three text levels.
- Grain is static and weak. Paper cards retain enough solid fill to keep text legible.

## Motion and timing

These are proposed presentation timings, not changes to game balance.

| Event | Presentation | Reduced motion |
|---|---|---|
| Pad hold | 2 CSS px press depth, 80 ms | Instant state change |
| Cover starts | Rim emphasis once, 120 ms; countdown follows gameplay clock | Instant state + countdown |
| Perfect | Relief expression and small rosette for 450 ms | Same static feedback |
| Strike | Swap witness strip, local pip X, caption ribbon | Same static swap and caption |
| Blowout | One 2 px horizontal shudder, max 120 ms | No movement |
| Scene change | 180 ms crossfade only after inputs/timers safely pause | Instant change |
| Shame iris | Optional noninteractive result transition, max 250 ms | Omit iris |

Never move a hit target, pulse the whole background, flicker grain, or flood the whole phone red. Do not shake while the player is aiming at a leak. Presentation never determines whether a vent was safe. Onlookers are two-state drawings, not interpolated animation frames; swap them cleanly instead of morphing.

## Scene identities

| ID | Distinguishing scenery | Witness cast | Optional cover staging |
|---|---|---|---|
| funeral | Gothic arches, lilies, wooden pew | Veiled mourner, grey-haired man, bun-haired guest | Bus clipped to side window |
| job_interview | Panel desk, blinds, three chairs | Formal panel members | Coughing panelist |
| first_date | Restaurant lights and small table | Two formal restaurant guests | Passing bus or cutlery cue if later added |
| live_on_air | Ribbon microphone, acoustic panels | Headphone wearer and producer | Amber lamp plus cover icon |
| silent_yoga | Paper screens, fern and rolled mats | Modestly dressed practitioners | Sneeze icon |
| wedding_vows | Floral arch, bells, ribbon | Formal wedding guests | Bell icon |
| library | Shelves, ladder and reading lamp | Readers and librarian | Dropped book prop |
| elevator | Door seam, brass rail, blank dial | Two office strangers | Visual siren cue |
| recital | Grand piano and curtain swag | Proud audience members | Applause icon |
| confession | Carved wood and lattice | Quiet adult attendants | Organ icon |
| meditation_retreat | Mountain opening, lanterns | Quiet retreat guests | Thunder bolt icon |
| babys_nap | Crib, stars, nightlight | Two exhausted caregivers | Baby cry icon, no startled baby illustration |

Do not force every cover sound into every room. These suggestions require the developers to decide which combinations the current event rules actually allow. The scene backgrounds are deliberately free of people so witness states remain independently controllable.

## Cast silhouettes and expressions

| Character | Silhouette | Personality |
|---|---|---|
| Everyman | Rounded side-part hair, broad collar, short tie | Trying very hard to look normal |
| Gentleman | Top hat, monocle, moustache, pointed lapels | Excessive confidence under pressure |
| Grandma | Bun and side puffs, round spectacles, lace collar | Unimpressed with the whole situation |
| Mime | Tilted beret, pale face, striped shoulders | The professional has standards |
| Bulldog | Drooping ears, broad muzzle, jowls, formal collar | A dignified troupe member |

The six state IDs are `calm`, `nervous`, `strain`, `critical`, `blowout`, `relief`. No flush or sweat is baked into these busts. Each 720 px export corresponds to a 360 px logical square. Shoulder baseline is y=348 logical; standard cheek centers are (132,194) and (228,194). All five SVG rigs include six named expression groups. `expression_calm` is visible by default. Inline each rig and show exactly one group. Individual SVG and PNG states are also supplied.

## Layout demonstration

See `previews/style_play.png`, `previews/style_intertitle.png`, and `previews/palette_showcase.jpg`. These are labeled visual proposals, not captures of implemented gameplay. Their composition demonstrates the room, bust, controls and typography. The final DOM layout must be verified on short as well as tall phones. Keep the two pads and VENT anchored above the bottom safe area; shrink decorative stage height before shrinking targets. Do not scale the entire 412 px design down to 360 px.
