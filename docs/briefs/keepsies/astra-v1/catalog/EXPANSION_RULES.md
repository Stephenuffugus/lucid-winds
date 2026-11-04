# Make 305 marbles feel collectible

65 existing designs plus 240 proposed additions. The additions are not 240 new combat kits. Preserve the existing catalog and original five tier economy until the actual build has been reconciled with its binding handoff.

## Launch a collection, not a backlog
Wave 1: 30 procedural designs from Coin Op Dreams, Back Alley Royalty and Snack Cabinet, plus three sculpt milestones: Quarter Eater, Dumpster Duke and Boba Buddy. A player can recognize the families without studying a spreadsheet. Their warm familiar themes make a stronger first showcase than an arbitrary rare-count target.

Wave 2: Night Visitors, Cozy Quest and Bookshop Magic. Introduce Mothlight, Save Point, Pickle Wizard and Book Wyrm only after the original grails are readable through the glass. Keep late discovery interesting by revealing a silhouette and a clue, not a page of unavailable purchase buttons.

Wave 3: fill other families according to playtest preference. The 240 rows are a design bank. Do not dump every entry into the same pouch at once: target dilution makes completion feel impossible.

## Acquisition proposals
* Rotate a featured family choice in earned rewards; never expire already-earned progress. A player chooses one of three visible family tracks before a match.
* A ten-entry family stamp card can reward its sculpt with wins, discoveries and technique milestones. Collection completion itself never raises ranked stats.
* Preserve boss signature exclusivity. Do not add The First Marble or other boss rewards to generic pouches.
* Duplicate cosmetic seeds are collectible instances. Do not auto-dust a distinct variant or an instance with provenance without a clear choice. The base design currently auto-dusts duplicate types; supporting variant keeping needs an explicit migration and product decision.
* Offer deliberate completion progress after duplicate draws; price and rates remain unassigned until measured against the existing 400 to 600 daily earn target.
* No real currency, pay-to-recover path, expiring purchased collection or limited-time pressure is introduced.

## Recognition before quantity
At a 48 px collection thumbnail every design must retain one unique large structure: a ring, slab, large vane, interrupted stripe, clear center, or recognizable insert. A new palette alone is not enough. Show tier mark plus label separately from material. Use monochrome and two common color-vision simulations during art acceptance; evaluate actual renders, not just the palette swatches in this pack.

## Seven procedural families to extend
These are renderer specifications. The JSON recipe_family values are new proposal identifiers and do not claim to match existing functions.

| Family | Object-space structure | Parameters to persist | Low quality route | Distinctive acceptance |
|---|---|---|---|---|
| layered_bands | Signed-distance slabs with broad warped boundaries inside sphere | axis, band count 2 to 7, widths, palette, seed | Existing broad band shader, no raymarch | Different boundary shapes and layer ratios, not only colors |
| twisted_ribbons | 1 to 3 broad internal strips twisting around one axis | turns 0.5 to 3, strip width, phase, axis | Few intersecting analytic ribbon surfaces | Open clear gaps remain visible while turning |
| nested_rings | Thick internal torus/ring structures | ring count 1 to 8, major radii, tilt, thickness | Instanced low-poly rings with opaque fake glass | Ring hole remains visible at 48 px |
| radial_vanes | Broad central blades/fans with stable count | count 2 to 9, angular spacing, curvature, opacity | Existing cat's-eye family extension | Blade count and silhouette readable in grayscale |
| geometric_core | Few chunky boxes, plates, checker cells or wedges | primitive list, transforms, material indices | Merged low-poly insert, one palette material | Large void/solid rhythm survives thumbnail reduction |
| seeded_inclusions | Sparse large interior chips, beads or flecks | seed, point count 5 to 24, radius range, occupied zones | Instanced low-poly inclusions | No glitter noise that aliases into a solid patch |
| volume_cloud | Low frequency interior density with distinct clear regions | noise seed, scale, threshold, clear cavity bounds | Two or three opaque blended shells, no raymarch | Motif remains distinct from existing Galaxy and Nebula Swirl |

All patterns use stable local object coordinates and rotate with the marble. Persist cosmeticSeed per UID; never regenerate it on loading. The visual model's hollow portions do not change collider mass, density, restitution or balance. If geometry changes the visual center of mass, the physics still uses the registered base profile.

## Compatibility contract
This delivery deliberately does not pretend to supply a drop-in marbles.json. Map proposed IDs to the actual game schema in a new catalog module, implement renderer dispatch, assign existing balanced base kits, and add migration coverage before enabling acquisitions. Unknown IDs need a visible placeholder plus recovery logging, never save deletion. Maintain a versioned alias map if any proposed ID changes.

## Avoid a shallow reference catalog
The references are cultural themes: arcade cabinets, cryptids, roadside Americana, cozy games, food, toys and fairy tales. The names and forms are original. No popularity rankings, trend claims or franchise permissions are asserted. Names have not been commercially cleared. Do not add recognizable logos or licensed character faces to these assets and call them original.
