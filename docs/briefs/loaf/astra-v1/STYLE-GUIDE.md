# LOAF • companion field notes
Keep the field unit on paper. Let the room feel like the quiet corner of a real house. The existing dark ink makes the photo luminous and gives the funny titles their deadpan delivery. The violet void in the room erases paws, distances and movement. Give the room a muted floor, wainscot and a single arched window.

See **previews/card_and_room.png** for the two compositions using Stephen’s actual reference photo and matching prototype avatar. These are internal art-direction studies.

## Palette and typography

| Role | Values | Use |
|---|---|---|
| App shell | #150E1D, #221733, #2E2044, #3D2C58 | Outer background, card recess, raised controls and dividers, respectively. |
| Paper and supporting text | #EFE4D2, #C4B3C8 | Title/body and secondary labels on ink. Reserve #9A88B3 and #6C5A85 for nonessential detail. |
| Action and invitation | #FFB23F, #EAB674 | One primary action per sheet. Softer amber outline and plus for an available need. |
| Confirmation | #6FE3C4, #96C4B8 | One settled state and restrained icon accents. |
| Illustration | #221B30, #F0DFC6, #866E89, #CA9595, #8DA6B9 | Print ink, paper, heather, dusty rose and pond blue. Keep the strong values near the cat’s face. |
| Seal | #D93A4B | Exclude from needs, game meters and any time-away signal. |

Use Bricolage Grotesque from Google Fonts for the name and headings (28–36 and 20–24 logical px), and its regular weight for readable 16 px body copy. DM Mono from Google Fonts is for short labels and folios (12–14 px). Use sentence case for instructions. Keep strings live and wrap instead of shrinking names. The outlined wordmark has custom letterforms and needs no font. Static concept previews use locally available type.

## Card front and reverse

Open on the actual photo. Give it roughly three fifths of the face, use a crop the owner controls, and dock the name below the eyes. Put “Meet in room” beside the photo/3D toggle. In the detailed view pair each stat with a word and value. CHONK describes a settled loaf taking up space. Use its tuck-shaped glyph and avoid scales, weights, diets or grades. The reverse starts with the latest actual filing, followed by temperament, Fish Book and days together. Leave unfilled panels collapsed. Frame overlays have a 300 × 420 vector viewBox. Inset important content 18 units. Preserve the frame aspect or nine-slice the perimeter.

| Plate | Edge cue retained in grayscale |
|---|---|
| ALLEY | One quiet edge and one top notch. |
| HOUSE | Double rail and two notches. |
| SHOW | Three notches, engraved corner wedges and a heavier rail. |
| FOIL | Four notches, split corner highlights and pearl-to-jade foil. |
| MYTHIC | Five notches, larger four-point stars and a gold-lilac rail. |

Rarity belongs to a plate in this cat’s own history. Keep every rarity label available as text. FOIL and MYTHIC carry a static shine in the SVG. Optional highlight on reveal takes 600 ms once. Reduced motion uses the static edge.

## Room and cutout art

Use the three matched light sets. Map floor with repeating UVs on the horizontal plane, wall once on a vertical plane, and window as an alpha decal against the wall. Do not mirror the window as a second light source. The floor texture contains four boards per repeat. Begin at 0.8 m per tile and judge against the 0.25 m sitting-cat reference. Scale props by their manifest measurement. The raster canvas is a framing box, so size the visible object bounds. Anchor a prop at its lowest supporting surface and use a runtime contact shadow. Wall-mount the perch and steps. Keep the open floor in front of the cat available for laser and yarn.

An arched window and matte timber hold the horizon. Keep light behind dark coats mid-value, use side fill on the jaw and keep pale coats separate from the wall. Swap room colors without changing a saved coat texture. Fit for the cat first, then add a bed or box. Put the 1.2 m tower toward the room edge. Tangencies between ears and window bars need a camera adjustment.

Furniture has broad, rounded edges and a consistent three-quarter studio view, with material cues built into its geometry. The Fish Book deliberately uses more detail: isolated gouache-and-ink specimens on transparent grounds reward a closer look away from active play. Give entries a quiet plum or cream field and a live species label. The frog, boot and different fin silhouettes help readers who cannot distinguish colors. A future second species can reuse the room and field-note shell.

## Icons, inputs and motion

24 × 24 live grid, usually with a two-unit clear margin. Stroke 1.6–1.8 units, round ends and joins, two main values, solid mass first and one accent gesture. Ability badges add a shield, low needs add a small plus, and bond seals use numerals and added dots. Postures use a wider 64 × 48 gesture field. Render these at 48 logical units on the shelf and pair them with their localized names. Set the hit box independently of the artwork (44–48 logical units). Show a visible focus outline and a text name to assistive technology. The small-scale proof is in previews/icon_size_proof.png.

In the room place a single invitation under the pet. Keep the toy drawer closed until asked for. When a toy is selected, label the physical action (“Move the dot, then pause”). Show an immediate finger response; let the cat's anticipation take a beat. Use 120–180 ms for button feedback, 250–400 ms for a card flip, and about a second for a blink and settle. Tune timings against actual owners. Reduced motion uses direct state changes, static glints, no camera rush or perpetual foil shimmer. Audio and haptics supplement the visible response. Return to the same camera and cat when play ends.
