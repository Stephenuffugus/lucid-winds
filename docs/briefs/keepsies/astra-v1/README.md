# Keepsies development handoff

Open INDEX.html in a browser after extracting this ZIP. It works locally without a server and lets you search all 240 proposed marble designs by family, name and render route.

## Included
* 240 original expansion designs in 24 families, with unique names, motifs and lore, supplied as Markdown, JSON and CSV.
* 18 individual 1024 px Meshy references: the four original grail figures plus 14 new collectible inserts.
* 248 asset files across sections A through K, including format and size variants. This is a file count, not a claim of 248 unique illustrations.
* Ten boss portrait states, twenty opponent portraits and their atlas, Dusty's tin scene and heirloom cloth.
* Six transparent pouch states, shelf plates, economy objects, dirt and ring assets, and two arena concept boards.
* 49 SVG icons, HUD states and tier frames, sharing templates, six store screenshot frames, wordmarks and exact-size promotional exports.
* Screen-by-screen assessment, gameplay recommendations, style guide, Meshy fitting notes, coordinates, manifest, contact sheets and two composition studies.
* The original supplied handoff ZIP and brief in reference/.

## Read in this order
1. ASSESSMENT.md: immediate defects, source contradictions and ranked recommendations.
2. STYLE-GUIDE.md: palette, light, type, material and motion rules.
3. GAMEPLAY_RECOMMENDATIONS.md: first session, ownership, collecting and Arena priorities.
4. catalog/EXPANSION_RULES.md: phased rollout, rendering families and compatibility contract.
5. meshy/MESHY_HANDOFF.md: fit the insert, keep the outer sphere in code.
6. anchors.json and manifest.json: integration coordinates and exact files.

## What still needs the developer
The 226 procedural additions are design specifications, not implemented shaders. Fourteen expansion entries have sculpt reference images. The four original grails also have references. No Meshy GLBs were generated. The original 65 marbles were not replaced. No runnable source was supplied, so there are no game patches or claims of device-tested performance in this ZIP.

Fix the camera going below the floor and the undefined setup chip first. Reconcile boss ransom behavior and the missing binding build handoff before wiring final copy. The arena condition count and physics-unit concerns are documented explicitly.

## Integration order
Ring and Dusty, then grail inserts, then ownership ceremonies and sharing, then a small themed collection wave. Use the 240-design bank over successive releases. Do not add all of it to one random pool or load all reference images in the game.

Use WebP exports where provided, SVG for icons, and PNG when alpha matters. Source/reference art, store images and previews stay outside the initial client payload. Six screenshot windows remain empty by design and must be filled with genuine game captures.

## Rebuild tools
The tools/ scripts created the catalog, native vector assets, export variants and preview index. They use Python, Pillow and CairoSVG. export_assets.py expects original generated image masters and is a one-time conversion script, not an idempotent runtime command. finalize_pack.py expects the extracted original handoff at a sibling source/ directory for its before/after studies. The shipped assets are ready to inspect without running any scripts.

Generated illustration prompts and method are recorded in meshy/IMAGE_PROMPTS.json. The outline wordmarks and UI SVGs have no font dependency. No audio recordings, external libraries, paid-service credentials or runtime AI are included.
