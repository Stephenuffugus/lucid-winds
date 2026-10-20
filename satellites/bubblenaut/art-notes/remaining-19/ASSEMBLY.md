# Remaining image pack — assembly notes

Read frames left to right; objects top-left, top-right, bottom-left, bottom-right. The object rectangles are measured separately: some wide ledges extend beyond nominal quarter boundaries. Use source-measurements.json, not blind equal-grid slicing. Bounds use [left, top, right, bottom).

| File | Frames/objects | FPS | Loop | Key | Order |
|---|---:|---:|---|---|---|
| effects/fx_pop.png | 5 | 16 | False | MAGENTA #FF00FF | 1 broken white/cyan circular arc with tiny droplets, 2 arcs separate outward, 3 droplets spread and stars glint, 4 smaller isolated droplets, 5 tiny sparse points fading; no complete bubble or enemy |
| effects/fx_escape.png | 5 | 16 | False | MAGENTA #FF00FF | 1 compact jagged orange burst, 2 larger red-orange rays, 3 rays break into orange shards, 4 small separated sparks, 5 tiny sparse gold specks |
| effects/fx_dust.png | 4 | 14 | False | MAGENTA #FF00FF | 1 tiny cream dust cloud, 2 wider soft-edged but crisp-outlined puff, 3 separates into three small puffs, 4 few tiny cream specks |
| effects/fx_glint.png | 4 | 8 | True | MAGENTA #FF00FF | 1 tiny white dot, 2 medium four-point white/cyan star, 3 bright large four-point white/gold star, 4 medium white/cyan star returning to small dot |
| pieces/pieces_treasures_a.png | 4 | 0 | False | MAGENTA #FF00FF | TOP LEFT round golden Sunfruit with small leaf, TOP RIGHT geode cracked open showing cyan crystals, BOTTOM LEFT ivory cog wheel with a clear five-point star cutout, BOTTOM RIGHT pale ice-blue Frost Pearl with frosted swirl |
| pieces/pieces_treasures_b.png | 4 | 0 | False | MAGENTA #FF00FF | TOP LEFT warm orange-gold Ember Opal with fire flecks and no pink, TOP RIGHT ONLY thin white glossy curved bubble highlight crescent not a whole bubble, BOTTOM LEFT front-facing smiling orange Pip HEAD ONLY exactly like hero reference with TWO ear fins, BOTTOM RIGHT small cyan glass specimen jar with screw lid, empty without creature |
| pieces/pieces_moss_moon.png | 4 | 0 | False | MAGENTA #FF00FF | TOP LEFT long low floating ledge of dark green rock with yellow-green moss lip, TOP RIGHT square dark wet rock wall block, BOTTOM LEFT same square wall block capped with moss, BOTTOM RIGHT small decorative cluster of pale green glowing spore puffs |
| pieces/pieces_crystal_caverns.png | 4 | 0 | False | MAGENTA #FF00FF | TOP LEFT long low blue-violet stone ledge with small cyan crystal points underneath, TOP RIGHT square deep blue-violet stone wall block, BOTTOM LEFT same block capped with tiny cyan crystals, BOTTOM RIGHT small decorative cyan crystal cluster |
| pieces/pieces_rust_belt.png | 4 | 0 | False | MAGENTA #FF00FF | TOP LEFT long low riveted rusty metal ledge with thin orange illuminated strip, TOP RIGHT square dark rusted iron plate wall block, BOTTOM LEFT same block with worn black/yellow hazard stripe along top, BOTTOM RIGHT small bent pipe with compact white steam puff |
| pieces/pieces_frost_ring.png | 4 | 0 | False | MAGENTA #FF00FF | TOP LEFT long low blue ice ledge with small icicles underneath, TOP RIGHT square deep blue ice wall block, BOTTOM LEFT same block capped with white snow, BOTTOM RIGHT small blue ice spike |
| pieces/pieces_magma_core.png | 4 | 0 | False | MAGENTA #FF00FF | TOP LEFT long low black basalt ledge with thin orange lava seam, TOP RIGHT square dark red basalt wall block with faint orange cracks, BOTTOM LEFT same square block capped with cooling lava crust, BOTTOM RIGHT small orange glowing lava vent |
| backgrounds/bg_moss_moon.png | 1 | 0 | False | none | Whole image |
| backgrounds/bg_crystal_caverns.png | 1 | 0 | False | none | Whole image |
| backgrounds/bg_rust_belt.png | 1 | 0 | False | none | Whole image |
| backgrounds/bg_frost_ring.png | 1 | 0 | False | none | Whole image |
| backgrounds/bg_magma_core.png | 1 | 0 | False | none | Whole image |
| promo/title_art.png | 1 | 0 | False | none | Whole image |
| promo/store_banner.png | 1 | 0 | False | none | Whole image |
| promo/app_icon.png | 1 | 0 | False | none | Whole image |

All images were made with the built-in image generator. Prompts and reference paths are in production-plan.json; referenced character images remain in the earlier character pack.

Chroma sheets require tolerance-based magenta removal and edge despill. Preserve cyan, white and cream highlights. These are source masters, not alpha-ready runtime atlases. Group effect particles by frame, preserving their shared center and relative scale; do not independently expand each effect to fill its cell. Set runtime opacity/timing after extraction.

Tile faces and flat ledge tops are visual masters. Extract objects separately, normalize to the actual tile/ledge dimensions, and check repeated seams. Rounded ends and corners may require endcaps or a repeated center strip. Decorative crystals, icicles, moss and vents must not silently change collision geometry. No seamless-tiling guarantee or playable hazard behavior is implied.

Backgrounds are opaque scenery only. Preserve their dark HUD/control areas and crop proportionally to the game viewport. For a 1024x1536 master, a 9:16 crop is 864x1536 (80px removed each side). Use proportional values when dimensions differ. No collision platforms, characters or pickups belong in these backgrounds.

Title art is text-free and needs runtime title/buttons. Store banner is a source master for a centered 1024x500 export; check the crop before publication. App icon is a square master; check platform masks. Keep source masters unchanged and export web copies <=1600px per side as requested in the brief. Exact-size exports and in-game tests have not been performed here.


## Final layout review

The title illustration has clear top space and roughly the bottom 40% available for buttons; use actual UI placement rather than assuming every safe-area percentage in the generation prompt was exact. Its decorative planet arrangement is illustrative. The store banner keeps the key faces within a centered 1024x500 crop, but the upper bubble rim approaches the crop edge; inspect the final export and allow padding if the whole bubble rim must remain visible.

The five backgrounds intentionally have dim scenery and darker top/bottom regions. Background cave contours are decorative, not platforms. At native gameplay size, verify that cyan crystal and ice enemies remain distinguishable from their background; a subtle runtime sprite outline or background dimming can be tuned if needed. No real build was supplied for this test.
