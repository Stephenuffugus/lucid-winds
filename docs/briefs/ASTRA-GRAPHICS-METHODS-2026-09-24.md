# SKY WOLF STUDIO: a graphics brief for an outside brain

24 September 2026. Response to Appendix B of `ASTRA-HANDOFF-SEP24-FULL-1.md`.

This is a production method for the coding model. No art, models, textures, or game code were changed. Numerical art thresholds below are proposed starting points, not measured properties of the current games. Inspect the actual UV map, renderer version, assets, and Pixel 9 captures before applying them. Current tool capabilities are referenced at the end of section G.

## A. The sock decals: the exact method

### A1. Improve the painter first, then use selective emblems

Keep the 2,000 pinned designs on their original painter, seeds, palette, and rendering path. Add an explicit hero painter version only to approved hero recipe IDs. A shared global outline or texture change would alter the pinned collection even if its source recipes stayed identical. Keep image hashes for the old generated tiles and representative rendered screenshots before work starts. Do not change matching IDs, pack membership, gameplay recipes, rarity, or saved unlock references during an art pass.

Start with ten representative heroes: two pale designs, two fine line designs, two dark designs, two complex emblems, and two already successful controls. Try the five procedural changes in B. Generate art only for the failures that remain. Ten is a review batch, not a request to generate ten crowded emblems on one sheet. For all 103 heroes, that is ten batches of ten and one final batch of three.

**Choose an emblem decal composited into the existing tile, not a generated whole sock tile.** This keeps the cuff, heel/toe zones, seams, knit scale, palette, and UV placement under code control. A generated rectangle cannot infer the real UV islands, which may not have cuff at top and toe at bottom. Put a labeled UV checker on the actual sock first and render front, back, heel, toe, and a rolling view. Place emblems only on verified visible islands. If both sides need the same recognizable motif, repeat the same accepted emblem on those two islands deliberately.

Bake the accepted RGBA emblem into the procedural 256×256 canvas once when the asset is prepared or first cached. Do not add a transparent decal mesh to every sock. One composited opaque sock texture avoids an extra surface, sorting problem, and draw call per sock. Keep material count unchanged. A whole-tile image is justified only for a deliberately all-over illustration with an authored UV template and seam review; it is not the default upgrade.

### A2. One style paragraph, one reference, one locked specification

Use this paragraph unchanged at the beginning of every emblem prompt:

> Create one bold illustrated motif designed to read as a flat printed emblem on a small knitted sock. Use a simple recognizable silhouette, broad solid color areas, rounded deliberate corners, and a consistent dark outline. The outline should look about one sixteenth of the motif width, with internal gaps at least that wide. Use exactly the three supplied opaque ink colors. Keep the largest shape dominant, with no more than two interior identifying details. Show a straight-on flat motif with no perspective, no fabric, no stitches, no embroidery, no cast shadow, no lettering, no border panel, and no surrounding objects. Center the complete motif with generous transparent space around it. Match the attached approved style reference in shape simplification, edge weight, and color balance.

Choose **flat print**, then add restrained knit grain in code after compositing. Asking for miniature embroidery adds detail the player cannot resolve and often weakens edges. Across sessions, reuse the same approved emblem reference and this exact paragraph. A paragraph alone cannot guarantee continuity or exact hex colors. Enforce the final palette during asset preparation and visually check whether quantization damaged antialiasing. Save the prompt, reference filename, model/tool used, palette, subject, rejected reason, crop box, and accepted asset ID.

Prompt skeleton to append:

```text
Hero asset ID: {stable_id}
Pack: {pack_name}
Subject: {one noun plus one distinguishing action or feature}
Three ink colors: outline {hex_1}, main fill {hex_2}, accent {hex_3}
Composition: {one large subject; optional second shape only if essential}
Identity detail that must survive at tiny size: {single feature}
Sock ground color, for contrast judgment only: {ground_hex}
Keep that ground color out of the image background.
Transparent RGBA background. One motif only. No grid, labels, text, sock, or mockup.
Square master, ideally 1024 by 1024 if supported. The motif occupies 70 to 80 percent of the width.
The final sock is approximately 70 screen pixels tall. Simplify rather than add detail.
Use the supplied approved reference as the style anchor.
```

The three colors can vary by pack, but the outline darkness, visual mass, motif scale, and number of identifying details should stay consistent. Pick the palette from a small studio swatch list rather than inventing 103 unrelated palettes. Do not require every motif to have an identical silhouette; a leaf, a claw, and a cassette need different outlines.

### A3. Transparency and review workflow

1. Request actual transparency using the tool's transparent-background setting when available. Prompt words alone do not guarantee an alpha channel. A checkerboard painted into RGB pixels is a failure, not transparency.
2. Inspect the exported PNG's channels and corner alpha values. Composite it over white, dark gray, and the actual sock color. Look for pale fringes, dark fringes, and accidental holes inside the motif. Keep a true RGBA master.
3. If transparency fails, regenerate with the setting corrected. Only use a flat-color removal fallback when the background is uniform and clearly separate from every subject color. Do not erase cream fur or white eyes using a global white threshold.
4. Crop to visible bounds, retain padding, and scale through the actual UV placement into the final 256×256 tile. Edge RGB should remain compatible with the subject during downsampling; test the premultiplied-alpha convention used by the toolchain rather than toggling it blindly.
5. Render each accepted tile on the real sock mesh at 70 CSS pixels, 50 CSS pixels, and a diagnostic 140 CSS pixels. Use the actual game camera, filtering, lighting, and background. The 70-pixel render decides acceptance.
6. Make a labeled 5×2 comparison sheet of the ten socks at equal apparent scale, with the original directly above each revised version. Labels belong in the review sheet, never inside the game texture. Include two approved reference heroes in every later batch.
7. Ask a viewer to name the subject without reading the label. If they see a speck, flower instead of spider, or generic blob, revise the silhouette before adding texture. Keep an accepted reference fixed; do not progressively drift the baseline by comparing only to the previous batch.

The three common failures are: thin detail disappearing, pale ink merging into the ground, and a subject that reads in the flat PNG but wraps around the sock seam. Catch them with the 70-pixel render, grayscale contact sheet, and rolling mesh view respectively. A fourth operational failure is exact pairs looking different because of random per-instance painter noise. Seed texture detail by design ID, not by sock instance.

Pocket finds can use the same silhouette-first discipline, but retain their separate approved style paragraph and 512×512 RGBA master route. Do not force a metal screw and a knitted emblem to share material shading just because both are small.

## B. A procedural upgrade that costs no art

These five changes apply only to the versioned hero painter. They are adjustable design parameters, not a global rewrite of pinned recipes.

### B1. Budget features in screen pixels

The 256-pixel texture height is not guaranteed to map directly onto the 70-pixel visible sock height. Estimate the local UV projection from the actual rendered mesh. As a rough first estimate only, 70/256 = 0.273 screen pixels per texture pixel; a two-screen-pixel mark would need about 7.3 texture pixels before oblique projection makes it smaller.

Target a main emblem 14 to 22 screen pixels across at normal play size, with no essential gap or stroke below about two screen pixels in the front-facing view. If the sock's projected width cannot accommodate that, simplify the emblem instead of covering the whole sock with it. Measure on the ankle/body island where it is actually placed. Eliminate interior details that collapse to one flickering pixel. Give a guitar pick its triangular outline, not six strings; give a cat a strong ear and tail shape, not whiskers.

### B2. Make outlines and negative space survive

For a signed-distance shape, render the outline by evaluating a second wider distance threshold, then render the fill. Use a proposed outline width around 6 to 10 texture pixels only where the screen-space check supports it. Keep interior holes large enough to remain open after mip filtering. Favor one outside keyline over many internal contour lines. Draw stroke joins consistently, and use the same signed-distance antialias transition for every hero.

Pseudocode, with distances measured in texture pixels and negative inside:

```text
outlineMask = 1 - smoothstep(-aa, aa, distance - outlineWidth)
fillMask = 1 - smoothstep(-aa, aa, distance)
paint outlineColor through outlineMask
paint fillColor through fillMask
```

Here `aa` is chosen for the final painter sample resolution; it is not the screen-space outline width. Test downsampling, not merely the full-size signed-distance preview.

### B3. Enforce contrast at the boundary

Use a dark outline against pale ground and a lighter separating edge on very dark ground only when the silhouette otherwise disappears. As a proposed automated warning, require at least roughly 3:1 relative-luminance contrast between the outer identifying edge and immediately adjacent ground. This is an art readability heuristic, not a claim of accessibility conformance. Follow it with the actual rendered grayscale review because scene lighting and texture filtering change the result.

Use sRGB color textures with the correct texture color-space annotation; normal or roughness data should not be assigned the color texture space. Check the existing three.js version and output pipeline before changing color management. The three.js manual explicitly distinguishes color textures from non-color data and warns that misconfiguration can make textures too light or dark [S1]. Do not compensate for a double color conversion by making every recipe brighter.

### B4. Separate cloth texture from motif identity

Keep silhouette and outline masks clean. Apply one deterministic knit field to both ground and emblem fill, initially around ±3% luminance on ground and ±1.5% on the emblem. Those amplitudes are starting points. Reduce them further if the 70-pixel render shimmers. Do not put independent high-frequency noise on every colored shape or cut tiny holes through a silhouette. Use the same UV-aligned knit scale across all hero recipes. Cache the texture rather than repainting random grain every frame.

The goal is a motif printed on cloth, not a label floating above it. The cloth should be noticed on inspection while the silhouette is noticed during play.

### B5. Use one restrained volume cue

Add one consistent broad value gradient across the motif or a lower-edge shade, initially no more than about 5% luminance. Keep the outer outline uniform. Avoid a dark drop shadow that makes a decal appear to hover. Let the existing 3D sock lighting provide most volume. If shading weakens the signature shape at 70 pixels, remove it; a clean flat motif is better than noisy pseudo-embroidery.

Implement and compare in this order: size, outline, contrast, grain, shade. Save one image after each step for the pilot ten. Stop when recognition is solved; more layers are not automatically better.

## C. Pixel sprites at 8×8

### C1. Spend pixels on identity

Use the studio's existing 16-color palette. An individual sprite often needs only three to five colors; using all sixteen on every animal produces mottling. Start with a single-color 8×8 silhouette on the actual ground colors. Give each creature one dominant identifying feature and one secondary feature: camel hump plus long legs, elephant trunk plus wide body, crab wide claws plus low shell. Keep negative-space gaps between important limbs when feasible. Add one contrast edge where the silhouette meets difficult backgrounds, not a universal one-pixel outline that consumes most of the body.

An eye is a focal accent, not an excuse to sacrifice the species silhouette. Choose its position consistently relative to facing direction. Use consistent ground contact and bounding-box anchors so the creature does not appear to jump when it changes pose. A bobbing animation cannot fix a static shape that reads as the wrong animal.

For the specific failures in the brief:

1. Rubber chicken: a long narrow neck, red comb or beak accent, and a dangling thin body. Avoid a round yellow duckling shape. Its held orientation and squeak pose should reinforce that it is a toy.
2. Gargoyle: a heavy seated gray body, squared shoulder mass, visible perch contact, and compact folded wings. A bat gets wide triangular wings and a light hanging body. Do not rely on gray versus brown alone.
3. Brown mammals: reserve distinctive tails, ear silhouettes, body lengths, and gait rhythms. Raccoon needs mask/ring cues; hedgehog needs a spiky back mass; capybara needs a blunt rectangular muzzle and a low broad body. Enlarged screenshots can suggest which pixels matter, but native-size recognition decides.

### C2. Use generation for concepts only when useful

Do not ask an image model to produce a production-ready 106-sprite 8×8 atlas. It can suggest silhouettes at larger size, but exact grid alignment, palette, and consistent pixel clusters must be rebuilt in data. For many simple animals, editing 64 cells directly is cheaper and more reliable than generating art and reducing it.

If a silhouette is genuinely unresolved, use one small concept request:

```text
Create four clearly different simplified silhouette concepts for {creature}.
Top-down three-quarter game view matching the attached reference.
Each concept must remain recognizable after a pixel artist rebuilds it in an 8 by 8 grid.
Prioritize {signature_feature}; omit fur, tiny fingers, texture, text, and shading.
Use large connected shapes and obvious negative space.
This is a concept sheet, not a final pixel atlas.
```

Then have the coder encode a candidate as eight rows of eight palette indices and render it with nearest-neighbor scaling. Review at native size first, then enlarged to inspect errors. Do not simply resize a painterly image to 8×8 and call the result pixel art. Keep the source data editable, with a short note explaining the signature pixels.

### C3. Audit all 106 without redrawing all 106

Generate a contact sheet sorted both by species family and by silhouette similarity. Include a silhouette-only sheet, the full-color sheet, and the actual scene over grass, sand, water, snow, and dark/night conditions. Native view should show the exact in-game size, with a separate enlarged diagnostic view. Hide labels for the recognition pass.

Check these eight items: species recognized, distinct from nearest visual twin, right number of essential limbs/features, readable eye/facing direction, ground contact stable, gear does not erase identity, motion clip remains on the pixel grid, and contrast survives the worst terrain. Compare binary-mask overlap to flag possible twins, but never treat the metric as a verdict. A one-pixel beak may distinguish two otherwise similar masks.

Keep approved sprites fixed. Revise only failed or ambiguous sprites. For each failure, write “looked like X because Y” and change the identifying cluster. Add at most a few purposeful frames: idle, travel, and signature reaction. The living-land expansion particularly needs silhouettes for tucked turtle, panting sheep, shallow splash, wet dog shake, and bank arrival. Environmental cues belong beside or under the actor, not permanently over its face or name.

## D. Meshy, efficiently

### D1. Reuse the cat already paid for

The brief says a cat with nine animations already exists at about 715 KB after optimization. The cheapest route is to inspect and reuse it if its style, license, anatomy, and clips fit. First list the nine real clip names, durations, looping flags, root movement, and preview failures. Do not regenerate a cat because the new game needs sleep if the existing rig can be posed into sleep in Blender.

Meshy's current documentation describes humanoid and quadruped rigging and animation export, but that does not establish that the account has good cat sleep, stretch, and walk clips for a particular rig. Check the actual compatible clip list before buying or spending credits. For custom motion, the documentation points to external animation work [S2]. A generic motion-count claim is not a promise that all those clips suit a cat.

### D2. If a new model is needed, validate one before a batch

Generation prompt:

```text
One stylized domestic cat for a small mobile game.
Clean broad shapes, recognizable triangular ears, short muzzle, clear paws,
and one separated curved tail. Four legs with visible space between them.
Neutral standing quadruped pose, weight balanced, mouth closed.
Match the supplied approved proportions and simple material style.
No clothes, accessories, floor, pedestal, scenery, loose fur strands, or extra limbs.
Simple color regions suitable for one texture atlas and one principal material.
```

Do not put a quadruped into a human T-pose merely because a general auto-rig guide mentions it. Reject before rigging if limbs are fused, the tail connects to a foot, paws cannot be separated, the underside is malformed, bilateral proportions are badly mismatched, or the character's silhouette is wrong from the game camera. Rotate the mesh before committing credits. Use simple flat or clay shading to see shape errors without a pretty texture hiding them.

Test one compatible walk clip immediately after rigging. Reject or repair collapsing shoulders, knee inversion, detached paws, and tail stretching before making nine more animations. One or two successful inspection cycles are enough; repeated blind regeneration is not a production method.

### D3. Finish the animation set in Blender

Minimum useful set: idle, walk, sleep, wake, stretch, and short react. If the game also needs run, hop, and sit, retain those as separately named clips. Keep idle/walk/sleep loops, with wake/stretch/react as one-shots. Use an in-place walk when the game already moves the root; otherwise animation root motion can double movement. Decide the convention once.

Use Blender to fix scale, root orientation, weights, tail or paw intersections, action names, loop seams, and a few missing clips. Do not use Meshy regeneration for exact hinge animation, a slight ear shape repair, final export naming, pivot placement, or turning one material into two UV islands. Those tasks need deterministic edits. Do not simplify or rescale a skinned character destructively after animation without verifying every clip and bind pose.

Proposed clip direction for the coder: sleep lowers the body and settles the head over 0.5 to 1 second, then loops a very small breath; wake lifts head before standing; stretch lowers the forequarters while the back rises, then returns to idle. These are staging directions, not claims that the current rig has the required controls. Author them against its actual bones and limits.

Check the exported asset with a floor grid, a known-size cube, and skeleton display. glTF uses meters and a right-handed coordinate system with +Y up [S3]. Adopt an explicit game-facing direction and test it rather than rotating twice because Blender and the game differ. Verify front-facing movement, left/right turns, root at the intended ground point, feet on the floor, joint deformations, and consistent clip scale. Clip blending must not pull the actor below the floor.

### D4. Optimize the accepted asset, then review the optimized result

Proposed starting budget: one principal material, roughly 2,000 to 6,000 triangles if silhouette permits, one 256 or 512 color texture, and only needed animation tracks. These are working targets, not Meshy output guarantees. A 512 RGBA texture alone expands to about 1 MiB before mipmaps even if its compressed download is much smaller. GLB download size and GPU memory are different budgets.

Keep an uncompressed source GLB and editable Blender file. Start with the existing proven compression settings. A minimal reproducible command to try, after checking the installed tool version, is:

```bash
gltfpack -i cat-source.glb -o cat-mobile.glb -cc
```

gltfpack can change meshes, node structure, and animation sampling. Its compressed output needs matching decoder support; its documentation describes `GLTFLoader.setMeshoptDecoder` for three.js [S4, S5]. If game code addresses named nodes, inspect the installed `-kn` option and preserve the required names rather than assuming optimization leaves them intact. Do not switch compression extensions just because a newer option exists.

Verify the resulting file is below the requested 1 MB budget, loads through the actual game loader, contains every required clip, and preserves animation quality. If it misses the size target, inspect whether textures, geometry, or animation data dominate before removing quality. Compare the source and optimized model at the player camera during the worst bend and every loop seam. A successful load is not an art pass.

## E. Room decor that really shows up

### E1. Choose by screen area and silhouette

At 40 to 120 screen pixels, spend effort on object proportions, contrast against the room, one signature feature, and a credible contact shadow. Model details that change silhouette. Paint details that live on a flat surface. Skip subpixel labels, hidden undersides, tiny bolts, thread geometry, and excessive bevel segments. Keep the first ten or so distinct decor silhouettes legible together before adding variants.

| Object | Essential readable feature | Cheap implementation | Wasted effort |
| --- | --- | --- | --- |
| Rug | Strong outline, broad border, one large motif | Thin plane or shallow box, one opaque canvas texture, soft contact shadow | Thousands of fibers or busy tiny patterns |
| Poster | Large subject and high-contrast frame | Plane/box with a bold texture; no essential small text | A detailed illustration readable only when zoomed |
| Lamp | Shade silhouette, neck, base, warm pool below | Few low-segment shapes; emissive shade and a restrained light/shadow cue | Many real-time shadow lights or unseen bulb filaments |
| Dryer | Big circular door, correct proportions, a recognizable control strip | Box plus shallow door ring and opaque painted drum depth | Transparent multi-layer glass and modeled internal hardware at tiny scale |

### E2. Make the floor and contact trustworthy

An opaque floor should use an opaque material and an opaque texture. Do not set `transparent:true` on every canvas-textured object because some unrelated assets need alpha. For genuine hard cutouts, three.js provides alpha testing; blending and alpha testing are different choices [S6]. Do not use DoubleSide as a universal repair for a see-through floor. Check winding, normals, camera placement, alpha, material opacity, depth handling, near/far planes, and whether the floor is actually present.

A dryer should sit on the floor rather than float on a generic circular shadow. A rug should not z-fight with the floor; give it a deliberate tiny height separation in the project's scale. Posters should face the room, with a small depth offset from the wall. These basic relationships are more visible than another hundred polygons.

### E3. Keep a coherent room palette and motion hierarchy

Use one shared room palette with warm/cool accent families, consistent edge treatment, and a common texture scale. Put detailed decor behind the play surface in visual hierarchy. One moving dryer drum or gently swaying lamp is enough in a quiet scene. Every object oscillating creates distraction from sorting socks. Music has no inherent visual quality: give the existing player a recognizable object or speaker face, clear active state, and predictable volume control rather than adding effects everywhere.

### E4. Account for real cost

Use the existing under-120-draw-call target as a scene budget, not proof of speed. Log the actual draw calls in the real renderer [S7], visible texture count, decode/upload stalls, and frame-time spikes during play. Shared geometry/materials or instancing help repeated decor only when their asset and interaction needs permit it. A hundred small unique materials can still be expensive even if every mesh is simple.

Lazy loading does not remove memory cost. A 256×256 RGBA texture is 0.25 MiB before mipmaps. If all 103 hero textures were resident, that is 25.75 MiB, approximately 34.33 MiB with a full mip chain, before source images/canvases and other assets. Keep a bounded cache around active packs and release unused textures using the actual renderer's disposal path. Do not load every hero master PNG at startup. Keep the roughly 2 MB initial bundle separate from lazily fetched asset bytes, decoder bytes, and retained GPU memory in reports.

## F. A review method

### F1. The minimum visual proof pack

For each changed batch, take these shots from a deterministic scene with the same camera, lighting, seed, and objects before and after:

1. Full player view at 412 CSS pixels wide on the actual Pixel 9. Also retain its original device-resolution screenshot. CSS width and screenshot raster width are not interchangeable.
2. The asset at its actual play size against the busiest likely background.
3. The worst allowed camera angle or object orientation, including the sock seam, dryer side, and clipped silhouette.
4. Dark/night and bright views if the game genuinely uses both.
5. A before/after comparison with equal apparent scale. Enlarged diagnostic crops are additional evidence, not replacements.
6. A short motion capture covering the interaction or clip transition, not just a static frame.

For the floor regression, put a contrasting checker or colored object underneath the floor in a debug-only scene and photograph the normal and lowest allowed player angles. It should not become visible through an intended opaque surface. Check the corner where the floor meets the wall, not only its center.

Ask of each image: What is the object without its label? What draws the eye first? Does its shape remain distinct from the nearest similar asset? Is it attached to the floor/wall/body correctly? Is anything unexpectedly transparent, mirrored, clipped, stretched, or obscured by gear? Does the action's visible result match the code's claim? Does it still look good in motion? What got worse compared with the original?

### F2. Human judgment is a required gate

Automate dimensions, palette membership, alpha presence, pinned hashes, file size, draw-call logging, missing clips, and invalid identifiers. Have a person inspect the actual contact sheet and device captures before marking art approved. No number of green checks answers whether a gargoyle looks like a bat or a floor is visually wrong.

Use three outcomes: accept, revise with one specific visual reason, or revert. Keep accepted anchors in every comparison batch. Stop after sufficient evidence, rather than repeatedly running broad tests unrelated to a visible risk. The coding model should report what it inspected, at what size/device, what failed, and whether a human actually saw the same capture. It must not claim a real Pixel 9 review from headless Chrome emulation alone.

Short instruction the director can paste into the coder's session:

```text
Before calling this art finished, show the actual player view and worst allowed view,
at the target on-screen size, beside the unchanged original.
Identify the subject without its label. Inspect silhouette, contrast, transparency,
ground contact, seams, and the full motion loop.
List one remaining weakness or explicitly state what evidence supports acceptance.
Report automated checks separately from visual judgment and real-device review.
Keep accepted reference assets and all pinned designs unchanged.
```

## G. What is wrong with this brief

### G1. Production contracts are missing

The real sock UV layout, visible emblem width, three.js version, current alpha/color-space settings, approved palette, reference sheet, renderer screenshots, cat bone names, and nine clip names are absent. The methods above are usable, but exact recipe coordinates or animation code would be guessing. Have the coder collect those once into a compact asset manifest. Do not repeatedly ask the director to supply information already available in code.

The brief says 103 heroes in packs of ten; ten full batches cover only 100. Track the final three explicitly and preserve stable IDs throughout. “Looks like one artist” also needs an accepted reference, not just the same prompt paragraph across sessions. Never claim the artwork is hand painted when it is procedural or generated.

### G2. The order should be recognition, consistency, motion, then polish

Generating 103 new images before testing ten at 70 pixels risks replacing one unreadable collection with another. Start with the procedural painter and actual-size pilot. Reuse the existing animated cat before spending new rigging credits. Fix the few ambiguous pixel sprites instead of regenerating 106. Spend illustration effort on the rug/poster or hero motif that occupies visible screen area; spend simple geometry on a lamp silhouette or dryer door.

A subscription price is not a guaranteed monthly image output or per-image cost. This guide assumes access to the tools in the brief without inventing quota or price promises. Record attempts per accepted asset and stop blind retries. One corrected prompt and a small deterministic cleanup can be cheaper than another entire set.

### G3. Acceptance needs gameplay context

Art affects matching difficulty, item recognition, attention, and performance. Two visually similar socks may be confusing even if each is individually attractive. Verify exact pair consistency and neighboring designs together. A bigger emblem that hides the cuff color may erase another identification cue. A room full of high-contrast posters can pull attention away from the socks.

The 120-draw-call and 2 MB targets are useful but incomplete. Track actual device frame times, resident memory, texture upload hitches, and input responsiveness. For animated animals, review the worst pose and the transition between clips. For Tiny World, the named pet must remain recognizable beneath equipment and environmental effects. For sharing, check the destination's current policy at the time of posting; no blanket policy claim is made here.

### Primary technical references

These support the cited technical facts, not the original art thresholds or production estimates above. Checked during preparation on 24 September 2026. Match API usage to the installed project version.

1. [S1. Three.js color management](https://threejs.org/manual/pages/color-management.html). Color texture versus data texture assignments and output conversion.
2. [S2. Meshy animation guide](https://docs.meshy.ai/en/webapp/guides/animate). Documented rigging/export scope and custom-animation limitations. This is not proof of a particular compatible cat clip library.
3. [S3. Khronos glTF 2.0 specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html). Coordinate convention, units, skins, animation and material representation.
4. [S4. gltfpack documentation](https://meshoptimizer.org/gltf/). Optimization, compression options, node preservation, and loader requirements.
5. [S5. Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html). Supported extensions and loader integration.
6. [S6. Three.js Material](https://threejs.org/docs/pages/Material.html). Transparency and alpha-test material options.
7. [S7. Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html). Renderer instrumentation and configuration.

The final block is the requested action manifest. Costs are relative working estimates for a coder familiar with these projects, not measured commitments or tool-credit prices.

```json
[
  {
    "section": "A",
    "rank": 1,
    "title": "Improve the painter first, then use selective emblems",
    "do": "Version the hero-only painter, preserve all 2,000 pinned outputs and IDs, pilot ten representative heroes, and composite only needed emblems into verified sock UV islands rather than generating whole tiles or adding decal meshes.",
    "cost": "hours",
    "confidence": 0.8
  },
  {
    "section": "A",
    "rank": 2,
    "title": "One style paragraph, one reference, one locked specification",
    "do": "Use the exact flat-print style paragraph, one approved visual reference, stable asset IDs, a controlled three-ink palette, and a one-subject transparent emblem prompt. Record the prompt and accepted reference across sessions; enforce final palette and scale in preparation.",
    "cost": "hours",
    "confidence": 0.8
  },
  {
    "section": "A",
    "rank": 3,
    "title": "Transparency and review workflow",
    "do": "Validate real PNG alpha over three backgrounds, bake into the actual 256-pixel tile, render at 50/70/140 screen pixels, and compare ten equal-scale real socks with fixed accepted anchors. Complete ten batches of ten plus three remaining heroes.",
    "cost": "hours",
    "confidence": 0.8
  },
  {
    "section": "B",
    "rank": 1,
    "title": "Budget features in screen pixels",
    "do": "Measure UV-to-screen projection on the real sock; target a readable 14 to 22-pixel primary emblem only where it fits, and eliminate essential gaps or marks that shrink below about two screen pixels.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "B",
    "rank": 2,
    "title": "Make outlines and negative space survive",
    "do": "Add consistent signed-distance outer outlines and preserve large negative-space gaps. Review after mip filtering at 70 pixels; keep the original painter path untouched.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "B",
    "rank": 3,
    "title": "Enforce contrast at the boundary",
    "do": "Add a boundary contrast warning and grayscale inspection, verify color texture annotations and renderer output conversion, and fix color-management errors before compensating with brighter recipe colors.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "B",
    "rank": 4,
    "title": "Separate cloth texture from motif identity",
    "do": "Use deterministic UV-aligned knit grain with a smaller amplitude inside emblem fills, preserve clean silhouette masks, and cache by design ID so two matching socks have identical visual details.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "B",
    "rank": 5,
    "title": "Use one restrained volume cue",
    "do": "Add at most one restrained broad shade cue after size, outline and contrast pass; remove it if recognition becomes worse at play size.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "C",
    "rank": 1,
    "title": "Spend pixels on identity",
    "do": "Rebuild only ambiguous 8-by-8 silhouettes around a primary and secondary identity feature. Distinguish rubber chicken from duckling and gargoyle from bat through shape rather than color alone.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "C",
    "rank": 2,
    "title": "Use generation for concepts only when useful",
    "do": "Use generated concepts only for unresolved silhouettes, then rebuild accepted ideas as eight rows of eight palette indices. Do not ship a downsampled painted atlas as precise pixel art.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "C",
    "rank": 3,
    "title": "Audit all 106 without redrawing all 106",
    "do": "Render the full 106-sprite audit in silhouette, color and actual terrain contexts. Review without labels and revise only recognition failures, keeping anchors and gear readability stable.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "D",
    "rank": 1,
    "title": "Reuse the cat already paid for",
    "do": "Inventory and preview the existing 715 KB nine-animation cat before spending new credits. Reuse its mesh and rig where fit permits, and verify actual compatible clip availability rather than relying on a marketing motion count.",
    "cost": "hours",
    "confidence": 0.8
  },
  {
    "section": "D",
    "rank": 2,
    "title": "If a new model is needed, validate one before a batch",
    "do": "Generate at most a small pilot of clean neutral quadrupeds if reuse fails. Reject fused anatomy, poor underside and wrong silhouette before rigging, then inspect one walk clip before building the full animation set.",
    "cost": "hours",
    "confidence": 0.8
  },
  {
    "section": "D",
    "rank": 3,
    "title": "Finish the animation set in Blender",
    "do": "Finish missing sleep, wake, stretch and react actions in Blender using the actual rig. Check root motion, scale, facing direction, floor contact, weights and clip transitions; keep deterministic repairs out of regeneration loops.",
    "cost": "days",
    "confidence": 0.8
  },
  {
    "section": "D",
    "rank": 4,
    "title": "Optimize the accepted asset, then review the optimized result",
    "do": "Optimize an accepted source GLB with the installed gltfpack version, preserve needed nodes and clips, configure the matching loader decoder, verify the under-1-MB target, then visually compare every optimized motion against source.",
    "cost": "hours",
    "confidence": 0.8
  },
  {
    "section": "E",
    "rank": 1,
    "title": "Choose by screen area and silhouette",
    "do": "Spend decor detail on large silhouettes and one signature feature: rug border, poster subject, lamp shade and dryer door. Use geometry for silhouette and canvas textures for flat detail.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "E",
    "rank": 2,
    "title": "Make the floor and contact trustworthy",
    "do": "Keep intended opaque floor materials opaque, inspect normals/winding/alpha/depth before changing sidedness, and verify rug, poster and dryer contact without z-fighting or floating.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "E",
    "rank": 3,
    "title": "Keep a coherent room palette and motion hierarchy",
    "do": "Apply a coherent room palette and visual hierarchy. Let only a few decor objects move and keep posters and lighting from competing with socks.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "E",
    "rank": 4,
    "title": "Account for real cost",
    "do": "Track draw calls, actual frame times and texture residency separately from download bytes. Use bounded lazy caches and release inactive GPU textures instead of loading every hero master.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "F",
    "rank": 1,
    "title": "The minimum visual proof pack",
    "do": "Capture deterministic before/after player and worst-angle views, actual 70-pixel objects, bright/dark contexts and a motion loop. Verify on the real Pixel 9 and include a debug under-floor contrast check for opacity.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "F",
    "rank": 2,
    "title": "Human judgment is a required gate",
    "do": "Require a human visual accept/revise/revert decision in addition to automated checks. Report exact capture conditions and do not label emulation as real-device inspection.",
    "cost": "minutes",
    "confidence": 0.9
  },
  {
    "section": "G",
    "rank": 1,
    "title": "Production contracts are missing",
    "do": "Collect real UVs, palette, reference images, renderer version and cat rig/clip inventory once. Resolve the 103-item batch arithmetic and preserve asset identities.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "G",
    "rank": 2,
    "title": "The order should be recognition, consistency, motion, then polish",
    "do": "Order spending by recognition, consistency, motion and polish. Test the ten-hero procedural pass, existing cat reuse and failed sprite repairs before any broad regeneration.",
    "cost": "hours",
    "confidence": 0.9
  },
  {
    "section": "G",
    "rank": 3,
    "title": "Acceptance needs gameplay context",
    "do": "Review matching pairs and neighboring designs in gameplay, evaluate device memory/upload stalls as well as bundle and draw calls, and preserve named-animal recognition under gear and effects.",
    "cost": "hours",
    "confidence": 0.9
  }
]
```
