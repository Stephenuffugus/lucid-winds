# Judgment calls and handoff notes

- The supplied local brief was used; the Drive folder did not open through the available retrieval tool, but all 26 public GitHub shots were retrieved and viewed.
- The initial whole-file read exposed section 7 before REVIEW.md was written; the review discloses that it is not blind, and no false independence claim is made.
- REVIEW.md was written before STYLE.md; proof work followed A, E, B, C, D, then the round-two list.
- No live game was opened; no tests or validation scripts were run; proof pieces received one visual pass with direct corrections.
- “Paint the card, not the plant” means the actual shot-16 plant pixels were cropped, their connected plain dark backing removed and the result enlarged and pasted; the plants were not generated or repainted.
- Proof Common is shot 16 row 3 column 1, Common EA 0; Legendary is row 4 column 7, Legendary EA 20; Cosmic is row 5 column 6, Cosmic EA 13 (rows and columns are one-based).
- Screenshot cells are roughly 150 × 226 pixels, so plant softness and residual JPEG edge artifacts remain; production must use the original procedural renderer, not these enlarged crops.
- The Quiet Chorus, The Gilded Kettle and The Amber Orbit, with their three-line poems, are new illustrative proof copy because shot 16 does not expose the specimens' real names or haiku.
- The poems are composed as 5–7–5 lines; copy placement is the target, while the live game keeps its existing generated names and haiku.
- EA values reproduce the numerical labels from the sheet; EA is not expanded into an invented term or substituted for grade.
- Cosmic EA 13 is intentionally retained to demonstrate that EA and rarity are separate; no unverified rarity odds are printed on the proofs.
- For Constellation, keep the dark connected silhouette and star map; raise star-point luminance, add a very thin cool rim and place a feathered slate/blue veil behind the plant, not a solid rectangle.
- For Silhouette, keep the interior solid and dark; add a restrained cream edge light and a localized pale sage halo that separates the entire outline, including its pot, from the card.
- Shot 17's left two are both described as Constellation in the brief; the Silhouette treatment is additionally grounded in shot 19, rather than mislabeling one of those two images.
- Hard aura rectangles should be fixed in the renderer with alpha falloff and unclipped effect bounds; the proof halo does not preserve a box as part of the specimen.
- Frame and aura PNG components have transparent surroundings; the full composed card, banner, screen, swatch and contact images intentionally have opaque backgrounds.
- The reusable frame PNGs are simplified production templates in the same arch language, not exact pixel extractions of the painted target backgrounds; round two reconciles the ornamental details to one final set.
- The Common moon, Legendary crown and Cosmic star medallion are large target-frame ornaments; the reusable grade marks are the small standardized signals that accompany the written grade.
- Seven reusable marks use increasing geometry: seed, two-point stem, three-point cluster, four-point cross, five-ray cluster, six-ray star and seven-point orbit; the final crown/leaf refinements are round-two work.
- Cards are 1080 × 1620; reveal and welcome frames are 1080 × 2400; Puzzles is 1680 × 720; all exported PNGs carry sRGB profiles.
- 192-pixel action buttons are 2× masters of the 96-pixel native-size versions, with 28/14-pixel words; the 96-pixel exports must not be divided by 2.6 again.
- The 1080-wide phone proofs use at least 32 source pixels for functional copy; contact sheets are review overviews and are not in-game text-size specifications.
- Compost uses a broken pot, coral rule and red surface; the dev implementation must still confirm permanent removal and identify the plant before committing.
- Beta terms are placed below the value proposition and above the primary welcome action, so they are available before commitment without dominating the welcome.
- Generated illustration used the built-in image tool; precise type, size variants, alpha components and original-plant compositing were assembled separately.
- Art prompts requested spare midnight herbarium card stages with no plants or text, sage/gold/ice grade illumination and an elliptical shelf; the Puzzles prompt requested readable PUZZLES with tangrams and ginkgo; the icon prompt requested Share, Details, Breed and a broken-pot Compost symbol on alpha.
- Only the requested ZIP is the final handoff; working scripts, downloaded fonts and source shots are excluded.

## Completion round

- The follow-up “finish all of this” was treated as authorization to complete the proposed round-two asset list; the finished exports are under assets/ and the initial proofs remain under proofs/round-one/.
- The final frame family is now editable vector geometry with exact seed, sprout, star, diamond, crown, crescent and orbit marks; it supersedes round-one's simplified frame placeholders and inconsistent ornament counts.
- Every runtime PNG has its final intended dimensions; dynamic content remains separate from frame backgrounds and is explained in HANDOFF.md.
- Full bloom, gift and account screens are design-reference images; they are not a claim that the live application now implements the layout.
- Additional source specimens: Uncommon row 1 column 7 EA 6; Rare row 1 column 4 EA 10; Epic row 4 column 3 EA 15; Mythic row 5 column 4 EA 28.
- Additional sample identities are The Lantern Bough, The Watching Leaves, The Starling Bloom and The Silver Keeper; these labels and poems are illustrative and must not overwrite actual plant records.
- The nine banner titles follow the proposed category names; the dev team maps them to real category IDs without renaming games or inventing unseen categories.
- The Words banner was redrawn once to restore its complete perimeter; the final version is the one in assets/banners/words.png.
- UI symbols and composable surfaces were finished as editable SVGs to keep line weights and exact geometry consistent; portrait, banner and inventory illustrations use the built-in image tool.
- Illustration prompts requested matching greenhouse banner siblings with category-specific motifs, a flat restyle of the referenced hooded Hermit, and isolated Mystery Box/Lens inventory artwork with true alpha.
- Native progress tracks and probability frames contain no invented dynamic counts; the growing slot has an empty track for live progress; the ready slot shows completion.
- The final ZIP includes font licenses, the manifest and a local gallery; downloaded screenshot sources and working scripts are not included.

- The final visual pass corrected plant upscaling in the seven bloom and welcome/gift layouts; native production layers still contain no screenshot specimen.
