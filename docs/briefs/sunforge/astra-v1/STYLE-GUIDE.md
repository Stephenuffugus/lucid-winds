# SUNFORGE • Sunbreaker
**Break the sun.** The name is SUNFORGE. Sunbreaker is the visual direction, never a replacement app name.

## Palette
Ring index is Chebyshev distance from the core. Index 0 is the core; ring 1 uses the first row. Never inherit the old piece colour after landing. A cell changing distance changes face and stamp together.

| Ring | Face | Redundant dark stamp |
|---|---|---|
| 1 | #FFD84A | dot |
| 2 | #9961E8 | two vertical bars |
| 3 | #2DD5DA | horizontal bar |
| 4 | #F15370 | triangle |
| 5 | #BCED55 | plus |
| 6 | #477DD9 | diagonal slash |
| 7 | #FF9947 | square |
| 8 | #C8D5E8 | two dots |
| 9 | #BA4FBE | chevron |
| 10 | #39BC8A | L corner |
| 11 | #A8A1E8 | X |
| 12 | #D5A36B | three bars |

Core light #FFF5CB. Void #080D15. Sky #182431. Graphite #263442. Neutral rim #8297A5. Main action #DFFF4F. UI ink #080D15 on acid; UI text #FFF5CB on dark. Warning #F15370 plus a shape cue; do not use red alone.

The sequence deliberately alternates warm/cool neighbours and light/mid values. The stamps carry redundant identity. No palette is claimed universally colour-blind safe. Keep a high-contrast pattern mode with the same stamps and white/graphite faces available in code. The one active falling cell uses ceramic #F3F0DC, a black slash and an unbroken cream keyline; all seven shapes use that same material. This avoids eight competing colour systems while falling. Ghost is hollow with corner brackets, never a translucent filled copy over a landed cell.

## Type
Google Fonts: **Barlow Condensed Black** for large display and the wordmark construction; **Space Grotesk Medium/Bold** for live UI. The supplied wordmark SVG is outlined and does not depend on font loading. Included fonts and OFL notices permit offline embedding. Do not use a CDN dependency for an offline single-file build.

At an actual phone scale: score 28 to 36 CSS px, mode heading 24, button labels 16 to 20, secondary labels at least 14. Display type is not for tiny HUD labels. Use tabular numerals if supported. Never shrink labels merely to fit the virtual stage. All interactive targets at least 48 × 48 CSS px even if their visible glyph is 24 px. SLAM display footprint 250 × 72 CSS px; source skins 500 × 144.

## Surfaces and geometry
- A settled cell is a flat enamel plate in a dark welded chassis, not candy, glass, a gemstone or textured grit. The exterior top/left catches light; the connected interior has no heavy bevel. A 64 px source cell is displayed around 26 px, leaving only simple shape information.
- Each ring's cells share face, stamp and exterior trim. Use neighbour-aware edges. The supplied single, four edge, inner-corner and outer-corner variants provide the vocabulary; the neutral interior variant covers fully surrounded cells. Rotate corner variants as described in the manifest. Never rotate the stamp: compose a face/stamp over rotated trim if needed.
- A tiny face mark is deliberately dark. At 26 px it remains a compact 3 to 5 px silhouette. Do not add microscopic serial numbers.
- The core is a square luminous aperture in four separate turbine jaws. Its resting board rendering stays inside a small envelope: core body about 1.5 cells, corona no more than 2.5 cells. Hero art exaggerates the jaws; do not use the giant marketing jaws to obscure playable ring 1.
- The void is an open drop. The play plate has no solid floor. Peripheral vents point inward but never resemble a legal landing shelf.
- The central grid square is quiet. Visible framing belongs outside it. No animated sparks behind ordinary cells.

## Icon grammar
Single-colour geometric strokes on a 24 unit viewBox; 2 unit stroke, square caps, bevel joins. Scale to 24 or 48 px. Every symbol has a matching visual weight. SVG icons use currentColor. Larger 96 px PNG control skins are 2× for 48 px display. Pause is supplied even though the observed game currently uses a home control; wiring is a code decision. Do not replace accessible DOM labels with unlabeled canvas-only hit regions.

## Motion contract
| Event | Timing | Behavior |
|---|---|---|
| Idle core | 1800 ms slow loop | Corona opacity only, 0.55 to 0.75. No scale breathing. |
| Almost ring | Steady | Highlight its seam and the missing-cell notch. No alarm strobe. |
| Stick | 120 ms | 6-frame local weld flash, anchor center of the just-locked piece. |
| SLAM | 240 ms | Land, short 35 ms hold, rotate board exactly 90 degrees with ease-out, settle. HUD fixed. |
| Quarter-turn streak | 240 ms | 4 full-frame overlays at 60 ms each. Do not rotate the control layer. |
| Crush | 300 ms | 6 frames at 50 ms; completed band contracts inward. Animate actual cells separately. |
| Inward flow | 300 ms | 6 frames, tint with the outgoing ring colour, maximum alpha 0.35. |
| Void swallow | 300 ms | Short downward pull; no impact floor. |
| Chain | 450 ms | Hold callout outside falling corridor; no huge screen shake. |
| Level up | 480 ms | 6 frames at 80 ms, perimeter only. Live text overlays the blank center. |
| Game over | 480 ms | 6 frames at 80 ms, machinery loses light, no white flash. |
| Sky clear | 180 ms | Opacity fade at maximum 0.25, confined above core. |

Reduced motion keeps the semantic 90 degree final orientation, colour reassignment, score and ring count. Snap or crossfade in 80 ms, suppress spin streaks, shake, particles, heat distortion and flash. Use a static charged rim. Sound controls stay independent. No gameplay input should be lost during cosmetic frames.

## Atlas rules
Origin top left. Frame order row-major unless explicitly stated. No spacing and no extrusion in exported sheets. Draw each source rect from manifest; never infer from the thumbnail. PNGs have straight alpha. Standard alpha composite; optional additive-looking effects are already painted and do not require global additive blend. Reset composite state after any effect. Core source frames are 256 × 256. Ordinary FX frames are 256 × 256. Four spin overlays are separate 540 × 960 PNG frames to keep each side below 1600 px. These are one animation sequence, listed together in the manifest.

## Composition
First frame has a wordmark and hero, with open bottom room for live mode controls. No mode text is baked into that plate. Share and screenshot windows are real transparency. Their coordinates are in native asset pixels and must be scaled with the whole frame. Place gameplay behind the window; draw score, rings, level, date and headline in the supplied bands. Store frames are not screenshots until Fable inserts actual captured play.

## Shown in context
- `previews/title_sunbreaker.jpg`: art-direction overpaint using the actual title capture.
- `previews/style_on_play_capture.jpg`: proposed skin laid onto the captured Journey board; a design composite, not an implemented game screenshot.
- `previews/a_identity_contact.jpg` through `previews/h_store_contact.jpg`: one contact sheet for each asset section.

## Delivery and integration
The manifest is authoritative for source dimensions, slicing, named states, inset windows and corner sizes. Keep the existing code-drawn fallback until an image has loaded. Embed only the required assets as data URIs in the one HTML build; the ZIP is a source pack, not a replacement application. Load store graphics only outside the live runtime. Keep “SUNFORGE” in install UI, accessible title and share metadata.
