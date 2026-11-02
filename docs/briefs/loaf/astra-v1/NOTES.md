# LOAF | Fable handoff

Start with **ASSESSMENT.md**, then open **previews/card_and_room.png** beside **STYLE-GUIDE.md**. The five section contact sheets are a visual index. **manifest.json** identifies each asset and its dimensions, including the physical size reference for each furnishing. Import files from assets/ only. Previews are internal review material.

## Scope and integration

| Section | Files | Use |
|---|---:|---|
| a_identity | 6 | Custom outlined wordmark, two opaque 512 px icons, opaque 192 px icon, feature graphic and first frame. Keep the maskable file distinct in the launcher configuration. |
| b_card | 33 | Five transparent overlays, one reverse, six stat marks, six shield badges and fifteen separately drawn neutral poses. The app owns all names and numbers. |
| c_room | 25 | Nine matched shell layers and sixteen individually framed, transparent three-quarter furnishing renders. Scale in meters using the manifest. |
| d_play | 28 | Ten SVG controls, nine illustrated book entries, two laser layers, ball and trail, water and ripple, and three paw close-ups. |
| e_bond | 22 | Five ritual controls, three paired need states, ten numbered bond levels and one counter motif. Draw the current days value alongside the motif. |

**Density.** PNG illustrations/plates use 3× exports of the logical sizes in the manifest. The identity exports instead follow the exact launcher/store sizes. SVG coordinates are logical units. Black or transparent interiors on floating art are intentional. Use straight-alpha compositing. Keep the floor and pond textures opaque with repeat sampling. Edge-clamp other PNGs. Load the Fish Book and additional furniture when opened. A package download size is distinct from device texture memory.

**Unambiguous bindings.** THREE_AM_SPRINT is the file spelling for “3AM Sprint.” Map CHONK → Immovable Object, MISCHIEF → The Swat, ZOOMIES → 3AM Sprint, FLOOF → Full Fluff, CHARM → The Slow Blink, VOID → Vanish. Use the Nov 2 brief’s visible stat names. Migrate old saves through the engine's actual stat semantics after checking the source.

**Shelf copy.** Bind each posture ID to the existing shelf's localized strings. Supplied romanizations are The Loaf (kobako-zuwari), Navel to the Sky (heso-ten), The Apology (gomen-ne), Too Bright (mabushii-ne), Hands Hidden (otete-nai-nai), and The Hotpot (neko-nabe). The supplied brief gives English names only for the other nine. Preserve their existing Japanese labels from the app’s string table. “The Scottish Sit” remains the requested posture title. The coat picker and grade never use it as a breed.

**Room pilot.** Put tower_three, box_cardboard, bed_donut and yarn_rainbow into one test room first. The tower is nearly five sitting cats tall. Keep it back from the camera. For Meshy, use each isolated PNG as its input, retain materials and target 3,000 polygons per furnishing as specified by the studio. Give the box a usable interior, keep the tunnel open at both ends, place the yarn collision sphere inside the ball and anchor the loose tail separately. Review generated backs and undersides before using a model. Single-view references do not prescribe hidden geometry.

**Art choices.** The mark combines folded cat ears, a window into the room and a glint. It has no coat or face to compete with an owner's cat. The feature artwork is an unoccupied window with brand typography. The Fish Book uses original generated illustrations cropped to individual entries. Props were constructed and rendered in 3D for consistent projection. Production furnishables here are PNG references, as requested. The three paw plates are authored interaction art. Place pad hit targets in local coordinates of the 154 × 152 logical image. Four toe centers are approximately (32,53), (66,35), (101,38), (126,58), with the central pad at (79,90). If left/right mirrored, mirror hit coordinates too. Prefer the corrected coat’s pad material when the live 3D paw is ready.

**Next build.** Fable's first ticket is the subject chooser and reversible marking correction. Its acceptance fixture is both-perch plus the two Barthalomew photos. The second ticket is the neutral-light, same-coat recognition test in ASSESSMENT.md. When those pass, wire one touch response, one deliberate laser catch and one persistent filing. Bring the remaining assets into the playable flow in the numbered build order.

**Verification boundary.** Reviewed the 22 source screens and four photo/render pairs. The supplied ZIP contains no runnable client, so game feel, frame time, audio, hit areas, persistence, translated layouts and exports require on-device validation. The preview board uses the supplied reference cat and prototype model for internal design review. Compose store screenshots and any owner-facing likeness demonstration from an approved real build. Select and clear any real cat photo separately before promotional use.
