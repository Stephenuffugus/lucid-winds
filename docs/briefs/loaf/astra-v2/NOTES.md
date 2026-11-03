# LOAF · Pack 2

For Stephen and Fable. Start with **previews/a_beans_contact.png**, then wire one paw press, one marking correction and one guided scan on a phone. The ZIP contains the eight requested sections. The PNGs and PDFs in D and E are sculpting and painter references. The SVG and PNG versions in G describe the same seven layouts.

## A · Bean Press

Each pose uses a 154 × 152 logical canvas exported at 462 × 456 px. All five layers share the full canvas and origin. Keep transparent margins intact. Store straight-alpha PNGs and premultiply once if the rendering API requires it.

| Back to front | What to do |
|---|---|
| fur | Replace the neutral RGB with the confirmed coat colour, preserving alpha. |
| pads | Replace the neutral RGB with the chosen bean colour, preserving alpha. For mixed beans, use the region IDs below. |
| shading | Composite over the tinted result with multiply at the supplied alpha. |
| line_art | Normal alpha compositing. |
| highlights | Normal alpha compositing. |

The additional **pad_ids** image in each pose is an 8-bit grayscale data texture. Read raw byte values with nearest-neighbour sampling. 0 is background, 1–4 are toes in left-paw drawing order, and 5 is the central pad. Use the pads layer’s alpha for the antialiased edge. The pink, black, chocolate and mixed swatches accompany the selector. Mixed shows one possible assignment; persist each owner’s actual pad colours separately.

| Pad | Left rest and press | Right rest and press |
|---|---|---|
| 1 | (32, 53) | (122, 53) |
| 2 | (66, 35) | (88, 35) |
| 3 | (101, 38) | (53, 38) |
| 4 | (126, 58) | (28, 58) |
| 5 | (79, 90) | (75, 90) |

Use the left-hand coordinates directly or convert a touch on the right to left-local coordinates with x = 154 − x. Perform the conversion once. The supplied right art is already mirrored. The press variant changes the toe angles and outer fur silhouette around fixed targets. Switch all five layers and the corresponding data map together. Cancel or release restores the resting pose.

## B · Marking correction

The 16 SVGs use a 24-unit grid. Use 24 logical px for a chip, with its existing text label and a separate touch target. The cat’s left paw stays its left paw from every camera angle. Preserve that language in the chip. The three white heights step from toes to sock to boot. Iris and nose use SVG currentColor; set CSS color directly on the inline SVG root, or replace its root color before rasterization. External image tags will use the supplied jade default. Selection belongs to the chip border and accessible selected state.

## C · Photo guide

Fit the 360 × 640 overlay within a 9:16 preview. Apply the same cover/contain transform to the image and overlay if the preview is cropped. The dashed eye line sits at about y = 216. Use the guide as a suggestion and keep “Use photo” accessible when a cat is reclining. The fourth card is chooser help. In the supplied chooser capture, two cats share a photograph: show subject selection before assigning markings, then retain it as the owner adjusts the camera or backs out.

## D · Face atlas

The eight PNG plates also appear in **face_morph_atlas.pdf**. Each pair has a fixed front view and 35° turn at the same origin and scale. The dimension strip compares each target to a round domestic baseline of 1.00. These are proposed art-direction ratios. They are not measured population averages. For ear set, “span” refers to distance between roots; “height” refers to upward displacement relative to the neutral brow. Muzzle reach refers to forward projection. Chin depth is vertical. Separate these controls from the coat and from CHONK.

The supplied face comparison shows why to test the head in neutral light: the tuxedo’s white bib is already readable while its cheek contour still carries identity. Try cheek width on the same Barthalomew texture, then test muzzle reach on the same Oreo texture. Keep the camera, lighting, gaze and markings fixed during each comparison. The blind-pair sheet is a fixture; it does not establish how many owners recognized their cat.

## E · Coat atlas

All 13 body examples use one neutral standing volume, viewed from the side, top and front. The atlas has 15 pages including a second calico pigment key and a four-shape blaze reference. The front is magnified to expose facial markings. Plate labels, thin silhouette contours and facial registration marks are for the artist. Apply the patterns in body space to the game's own region/position map. These pages are visual targets, rather than UV textures for direct mesh import.

Calico needs three visible coat colours. To retain the two-ink reference system, the calico page locates all pigmented areas on white and the warm-islands key identifies the warm subset in corresponding coordinates. Match the filled islands and disregard the registration outlines. Ticked flecks indicate a field of banded hairs. Tune its strength at phone scale so the coat does not glitter when the cat moves. White grades are examples with editable borders. Keep bib, each paw and left/right blaze offsets separate. White spotting can overlap any underlying coat.

Pattern terminology was checked against the UC Davis Veterinary Genetics Laboratory’s [feline coat colour reference](https://vgl.ucdavis.edu/resources/cat-coat-color) and the [TICA pattern descriptions](https://tica.org/wp-content/uploads/2025/10/UCD-Version-A-16-October-2025.pdf). All atlas art was constructed for this handoff.

## F · Pond

Use the four left-facing silhouettes beneath the ripple and lily layers. The PNGs already have a soft edge and partial opacity. Test against the existing water before adding more attenuation. Rotate around the logical center (50, 32). The three pads are separate surface sprites. Repeat the 256 × 64 logical bank along x at the front of the scene, with the transparent side toward the water and the solid side toward the cat. Clamp vertically. Test horizontal camera movement across a join.

## G · Store frames

For each layout, place the real captures on a layer **below** the frame. Transparent PNGs are ready to composite. The paired SVGs provide scalable borders and portable Bricolage Grotesque headline outlines. Change headline copy by replacing the outlined title group in a vector editor using Bricolage Grotesque. The font is available from [Google Fonts](https://fonts.google.com/specimen/Bricolage+Grotesque). Store art in this ZIP contains empty windows. Use captures of the corresponding implemented state before publication.

Frame window coordinates are in export pixels, from top-left, ordered as x, y, width, height. Preserve capture aspect ratio. Use contain for full UI views and fill for intentional detail crops. Keep text and controls away from the rounded corners.

| Layout | First window | Second window |
|---|---|---|
| 01 Meet | 145, 374, 790, 1405 · first scan | — |
| 02 Choose | 80, 454, 920, 996 · subject chooser | — |
| 03 Correct | 72, 461, 575, 1023 · correction sheet | 671, 640, 336, 384 · actual face detail |
| 04 Card | 72, 427, 610, 1085 · owner-photo face | 713, 802, 295, 525 · card reverse |
| 05 Room | 72, 477, 936, 534 · day | 72, 1146, 936, 534 · dusk |
| 06 Shape | 206, 462, 668, 1188 · posture shelf | — |
| Feature | 401, 98, 278, 307 · owner-approved photo | 698, 98, 278, 307 · matching 3D face |

## H · Dated memory

Overlay the filed stamp only on a saved memory. Place a localized date as live text inside the blank date tab, between x = 22 and 116 on its 126 × 32 grid. Center the baseline vertically for the selected font. If a locale needs more room, use a shorter localized date and keep the full date in the accessible label. Store the original filing date across subsequent launches.

## Handoff checks

The eight contact sheets show the supplied art, including the mixed-tint composite, both icon sizes, transparent store wells and the example date position. On the next device build, press each toe on both paws after resizing the viewport, restore it after touch cancellation, and verify a selected nose or iris tint survives re-opening the same cat. Test the camera overlay over a backlit and a dark photo. Review the same avatar in all three room lights before recording store captures. These checks still require the integrated app.
