# TOMATO MAN — Sprite-Sheet Asset List (portal contact-sheet format)

## STYLE (paste as the shared prefix on every cell)
Bright, colorful, fun handmade paper-craft game art. Sun-baked coastal-dune world — cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Cute botanical/produce critter energy (a little sandwich-tomato hero), cozy-menacing boss, never scary or grim. Clean readable silhouettes first, chunky arcade readability at tiny sizes. Soft top-down key light with a warm gold sun rim-light; cool blue-violet felt shade underneath. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a logo cell names exact text. Keep detail bold and simple so each cropped asset compresses under 150KB.

**Palette-shift note (portal cohesion):** Tomato Man is a sunny beach/dune game, NOT a midnight garden — I kept the house paper-craft/felt/bead/stitched MATERIALS and the cream + antique-gold + rose accents, but shifted the base from midnight-green to warm sun-baked sand + bright sky, with cool blue-violet felt as "shade" (the game's only safe ground). Sage green stays for the aloe pickup.
Palette: sand `#e6c074` (deep) / `#f4dca6` (light), sun-gold `#c8a84b`/`#ffd23f`, cream `#e8dcc8`, tomato-red `#e8332a`, rose `#e58fa0`, shade blue-violet `#4a5e86`, aloe sage `#7ab356`, navy ink outline `#23314a`.

---

## Sheet 1 — HERO PRODUCE BODIES (character builder)
- **File:** `sheet_hero_bodies.png`
- **Grid:** 4 cols x 4 rows (14 used + 2 spare)
- **Cell size:** 512x512 px · **Master:** 2048x2048
- **Knockout:** Flat magenta #FF00FF background in every cell. No magenta inside the artwork.
- **Anchor/footprint note:** each cell = the round produce BODY + its little leaf/stem sprig ONLY, centered, **face-less and hat-less** (the engine composites the cute stitched face, blush, exposure/sweat expression, and hat ON TOP — do not bake a face in, or it double-draws). Warm gold rim-light toward upper area, cool shade at base.

1. hero_tomato — plump felt tomato, tomato-red `#e8332a`, deep-red core shading, tiny green felt leaf-and-stem crown.
2. hero_strawberry — cut-paper strawberry, red-pink `#e6243f`, cream seed-bead dots scattered on the body, green calyx leaf top.
3. hero_orange — round felt orange `#ff9a2e`, pebbled peel texture, short green stem nub.
4. hero_lemon — felt lemon, yellow `#ffe24a`, softly ovoid with a nub tip, tiny leaf.
5. hero_lime — felt lime, green `#8ed04a`, glossy cream highlight, small leaf sprig.
6. hero_peach — soft wool peach, blush `#ffb07a`, faint felt cleft seam, single leaf.
7. hero_cherry — deep cherry `#c41e2a`, glossy, a slim driftwood-cord stem looping up as its "top".
8. hero_bellpepper — green bell pepper `#4fb04a`, felt lobed body, brown stem crown.
9. hero_eggplant — purple eggplant `#7d3fb3`, satiny felt sheen, green calyx cap.
10. hero_avocado — avocado `#3f7a2e` skin with a pale `#8fbf5a` felt belly, small leaf.
11. hero_heirloom — ribbed heirloom tomato `#b5453a`, cream seed-bead flecks, gnarled green top.
12. hero_pickle — pickle-man `#6fae3a`, bumpy stitched cucumber body, cream seed dots, tiny leaf.
13. hero_golden — golden tomato `#ffd23f` with antique-gold `#c8a84b` shading, sequin glint, gilded leaf.
14. hero_sunburn — sunburn-survivor tomato, hot coral-red `#ff6a4a` peeling-paper skin, tiny cream aloe-dab highlight, wilted leaf.

---

## Sheet 2 — HATS & HEADWEAR (cosmetic overlays)
- **File:** `sheet_hats.png`
- **Grid:** 4 cols x 3 rows (12 used)
- **Cell size:** 512x512 px · **Master:** 2048x1536
- **Knockout:** Flat magenta #FF00FF background in every cell. No magenta inside the artwork.
- **Anchor/footprint note:** each hat sits so its **brim/base rests on bottom-center of the cell = the crown of the head** (engine places hats at y ≈ top of the body). Overlay only, transparent everywhere else.

1. hat_sunhat — wide floppy straw sun hat, woven-paper brim, cream `#f2d68a` felt band.
2. hat_cap — ball cap, blue `#3a7bd5` felt with a stitched curved brim.
3. hat_sombrero — tiny sombrero, gold `#d8a24a` woven straw, upturned brim, cord trim.
4. hat_lettuce — ruffled lettuce-leaf cap, crinkled green `#7fc24a` felt frill.
5. hat_visor — lifeguard visor, red `#e8332a` felt band + translucent cream brim.
6. hat_umbrella — beach umbrella hat, rose `#ff5a7a` felt canopy on a short driftwood-cord pole.
7. hat_crown — little sun crown, gold `#ffd23f` felt points with bead tips.
8. hat_shell_crown — exclusive: pink `#f7a8c4` scallop-shell crown, macrame-cord band (World 1 reward).
9. hat_cone_hat — exclusive: ice-cream-cone hat, waffle-paper cone + cream+rose felt swirl, gold sprinkle (World 2 reward).
10. hat_cool_shades — exclusive: chunky sunglasses, near-black `#20242c` felt frames, cream lens glint (World 3 reward).
11. hat_gem_crown — exclusive: ice-blue `#37b6e0` cut-paper gem crown on a gold band (World 4 reward).
12. hat_eclipse_halo — exclusive: violet `#b48aff` felt halo ring with a soft glow rim, floating above head (World 5 reward).

---

## Sheet 3 — SUN, PICKUPS & PROPS
- **File:** `sheet_props.png`
- **Grid:** 4 cols x 3 rows (10 used + 2 spare)
- **Cell size:** 512x512 px · **Master:** 2048x1536
- **Knockout:** Flat magenta #FF00FF background in every cell. No magenta inside the artwork.
- **Anchor/footprint note:** all centered on the cell (engine draws each at a point). These render tiny on screen — silhouette + palette must read at ~32px. The two sun tokens are the on-screen sun/boss and only ~16-32px radius in play, so 512 cutout is ample (no 768 needed).

1. sun_friendly — the roaming sun token: warm gold `#ffd23f` cut-paper disc, macrame-cord rays, two tiny navy bead eyes + gentle smile. Cozy, kind.
2. sun_angry — the Angry Sun boss: hotter orange-red `#ff5a28` molten-felt disc, jagged flame-cut rays, angry navy eyes + frown. Cozy-menacing, not scary.
3. aloe_star — the lit aloe currency pickup: sage-green `#7ab356` felt 5-point star / aloe rosette with a glowing cream center and a sequin sparkle.
4. popsicle — rose `#ff6aa0` felt ice pop on a driftwood-cord stick, cream drip highlight (dash-refill pickup).
5. collect_shell — hidden treasure: pink `#f7a8c4` cut-paper scallop seashell, stitched ribs, cream pearl dot.
6. collect_cone — hidden treasure: ice-cream cone, waffle-paper cone + cream & rose felt scoops, gold-bead sprinkle.
7. collect_gem — hidden treasure: faceted ice-blue `#37b6e0` cut-paper gem, cream facet highlights, tiny gold glint.
8. cloud_platform — a drifting cloud you ride: fluffy wool/felt cream-white cloud puff, soft rounded lobes, cool shade underside.
9. exit_flag — level goal: green `#4fb56a` felt pennant flag on a slim navy-cord pole, stitched edge.
10. checkpoint_ring — a woven macrame hoop marker (safe checkpoint), sage `#7ab356` cord when active, cream when dormant.

---

## Sheet 4 — TITLE LOGO
- **File:** `sheet_logo.png`
- **Grid:** 1 col x 1 row (single wide cell)
- **Cell size:** 1024x512 px · **Master:** 1024x512
- **Knockout:** Flat magenta #FF00FF background. No magenta inside the artwork.

1. logo_tomato_man — the wordmark **"TOMATO MAN"** in chunky cut-paper letters, tomato-red `#e8332a` fill with a cream `#e8dcc8` inner layer and a stitched navy `#23314a` outline; a tiny felt tomato dotting the "i"/"A", a small gold sun-ray flourish behind. Exact text only, no tagline.

---

## WIRE NOTES
- **Loader lives in `index.html`:** `ASSET_PATHS` (line 431) currently holds only `hero_body:'art/hero/tomato_body.png'` and `logo:'art/ui/logo.png'`; `loadAssets()` (436-437) fills `ASSETS{}`; accessor `A(k)` (438). **Critical:** `A()` is defined but **never called** — `drawHero` (1085), the caster/pickup/sun draws (996-1201), and `drawBuilderPreview` (1285) are all pure canvas primitives with no image fallback. So these sheets are inert until each draw call gets a `var img=A(key); if(img){ctx.drawImage(img,...)}else{<existing procedural>}` guard and `ASSET_PATHS` is extended with per-produce/hat/prop keys.
- **Key map (add to ASSET_PATHS):** hero bodies → `hero_<id>` for COSMETICS body ids (`tomato,strawberry,orange,lemon,lime,peach,cherry,bellpepper,eggplant,avocado,heirloom,pickle,golden,sunburn`); hats → `hat_<id>`; props → `sun`, `sun_angry`, `aloe`, `popsicle`, `collect_shell`, `collect_cone`, `collect_gem`, `cloud`, `exit_flag`, `checkpoint`; logo → `logo`.
- **Draw hooks to wire:** hero body in `drawHero` (1085) and `drawBuilderPreview` (1285) — keep the procedural face/blush/expression + hat drawn on top (that's why hero cells are face-less/hat-less). Hats in `drawHero` hat-kind branch (1122-1128) + builder (1294+). Sun/angry-sun in `sunToken` (1183). Aloe in beams loop (1026-1035, LIT branch only). Popsicle (1020). Collectibles in `drawFindIcon` (1141, by `collectOf().kind`). Cloud (992-994). Exit flag (1046-1049). Checkpoints (1041-1043).
- **Recommended folder:** `art/` next to `index.html`, sub-foldered `art/hero/`, `art/hats/`, `art/props/`, `art/ui/` (matches the conventions already in `ART-NEEDED.md`). Cut each sheet into individual transparent PNGs at those paths.
- **Leave procedural (do not author):** casters (`R` rect awnings are width-stretched, `U` umbrellas tilt-rotate — parameterized, poor fixed-sprite fit), per-world sand ground (parallax gradient across a 2000x2900 scrolling world), hot-sand/shade/wilt overlays, and dash-trail particles.
