# Glyph Forge — Portal Art Asset List (paper-craft grimoire skin)

**Game:** Glyph Forge — pocket roguelite deckbuilder. Fuse 1–3 rune sigils into a spell, big number, beat 13 foes. Single-file vanilla PWA.
**Art status:** NONE (drop-in loader ready; 45 empty slots, 2 placeholder icons only).
**PALETTE-SHIFT NOTE:** This game is an occult rune-forge grimoire, not a garden. I kept the portal's tactile paper-craft/felt/bead MATERIALS for cohesion but shifted subject to arcane sigils + cozy-menacing spirit-foes, and the palette toward the game's own tones (which already rhyme with the portal: near-black base, gilt gold rewards, cream/vellum, rose→deep crimson accent, sage→verdigris green).

---

## STYLE (shared — paste at top of every sheet prompt)

Bright, tactile, handmade paper-craft game art — a cozy midnight **grimoire / rune-forge** world. Deep near-black ink-brown shadows, aged **vellum & parchment cream**, antique **gilt gold** for rewards and sigil-lines, warm **verdigris green** and dusky **violet** for arcane accents, deep **crimson** rose for menace/mythic/target energy. Fiber-art materials throughout: cut paper, wool felt, macrame cord, embroidery-floss sigil-lines, gold-leaf, beads, sequins, glitter, wax-seal blobs, scrapbook layers, stitched edges, soft handmade paper texture and grain. Clean readable silhouette first — each glyph/creature reads instantly at thumbnail size. Cute-arcane critter energy on foes: cozy-menacing spirits stitched from felt and cord, characterful and a little spooky, NEVER scary, gross, or grim. Soft top-down key light with a warm gold rim-light and a faint gilt halation. Chunky arcade readability at small sizes; keep detail bold and simple so each cropped cell compresses under 150KB. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a cell says exact logo text. Palette anchors: ink #0a0705, vellum #f4e8d0, cream #e8dcc3, gilt #d4a849, gilt-bright #f0c46a, verdigris #5a8d6a, violet #6b4d8c, crimson #a83232.

---

## Sheet 1 — Title Mark & App Icon
- **File:** `title-mark.png` (single hero cell)
- **Grid:** 1x1
- **Cell size:** 1024x1024
- **Master size:** 1024x1024
- **KNOCKOUT:** Flat magenta #FF00FF background in the cell for knockout. No magenta inside the artwork. (Renders object-fit:contain at 70% inside a circular gold disc — MUST be transparent-cutout so the disc shows through. Downscale the same art to 512 and 192 for the PWA icons.)

1. `title-mark` — a single central ritual sigil for the game's forge-mark: three interlocked rune-strokes fused into one symmetrical emblem, sculpted from cut vellum and gold-leaf with embroidery-floss linework, a wax-seal crimson bead at the heart, faint verdigris glow at the edges; dramatic, balanced, mystical, reads clean inside a small circle.

---

## Sheet 2 — Rune Sigils (all 36)
- **File:** `rune-sigils.png`
- **Grid:** 6 cols x 6 rows
- **Cell size:** 512x512
- **Master size:** 3072x3072
- **KNOCKOUT:** Full-bleed art, no magenta inside a cell; magenta #FF00FF only in the gutters between cells. (Each cell is drawn object-fit:cover to fill a card's art panel — paint each as a full-bleed square tile: a single sigil on textured parchment/ink ground. Do NOT bake a card border or rarity glow — the game's CSS tints each card frame per rarity at runtime. Rows escalate in ornamentation: common = one clean stroke; uncommon = a small motif; rare = richer gold-leaf + a jewel bead; mythic = ornate sacred-geometry, prismatic, most detail.)

**Row 1 — Common (1–6)**
1. `rune-ember` — Fire/Bolt: a single candle-flame caught between two felt fingertips, warm orange floss glow on dark parchment.
2. `rune-drop` — Water/Wave: one suspended cut-paper droplet over concentric silver ripple-rings, cool blue.
3. `rune-stone` — Earth/Burst: an angular carved-stone polyhedron with mossy felt edges inside a ring, earthen browns.
4. `rune-gust` — Air/Pulse: three curving wind-strokes of pale cord springing from a center bead, grey-blue, delicate.
5. `rune-hollow` — Void/Sigil: a perfect ring of darkness ringed by tiny gold tick-marks, deep purple-black.
6. `rune-ray` — Light/Bolt: a six-point star with one elongated gilt ray and soft halation on cream.

**Row 2 — Common → Uncommon (7–12)**
7. `rune-veil` — Shadow/Pulse: a crescent moon half-draped by a horizontal band of dark felt, indigo and silver.
8. `rune-tally` — Order/Sigil: a precise gilt cross with four small gold-leaf marks at the points on cream.
9. `rune-roll` — Chaos/Spiral: a many-sided die mid-tumble amid scattered tally-sparks, magenta-and-gold glitter.
10. `rune-echo` — Order/Sigil (uncommon): a bell-shape shedding three concentric ripple-bells, brass gold on ink.
11. `rune-mirror` — Chaos/Spiral (uncommon): two crescents forming a cracked-glass yin-yang, iridescent sequins.
12. `rune-surge` — Fire/Burst (uncommon): an eight-petal starburst of flame with a hot white core, orange-red felt.

**Row 3 — Uncommon (13–18)**
13. `rune-cascade` — Water/Chain: a vertical chain of three shrinking droplets linked by wavy cord, aquamarine.
14. `rune-anchor` — Earth/Sigil: an anchor-cross with felt roots growing into soil below, bronze and umber.
15. `rune-drift` — Air/Wave: a single feather pulled on an unseen current leaving a curving trail, pale silver.
16. `rune-drain` — Shadow/Wave: a downward spiral of dark liquid vanishing into a small drain-glyph, deep purple.
17. `rune-beacon` — Light/Pulse: a lighthouse burst of twelve evenly spaced gilt rays, hot gold.
18. `rune-sympathy` — Void/Spiral: two intertwined infinity-loops, one bright one dark, violet and silver floss.

**Row 4 — Uncommon → Rare (19–24)**
19. `rune-squall` — Air/Chain (uncommon): a chain of three slanted gale-slashes / stacked wind-chevrons whipping sideways, steel-grey with a cyan spark.
20. `rune-ouroboros` — Chaos/Spiral (rare): a serpent biting its tail, scales stamped like alchemical marks, crimson and gold-leaf.
21. `rune-twin` — Order/Sigil (rare): two identical sigils overlapping with a slight rotational offset, mirror-bright gold.
22. `rune-triskel` — Order/Spiral (rare): three interlocked Celtic spirals (triskelion), gold on green-black, illuminated.
23. `rune-wildfire` — Fire/Chain (rare): flames forming a running chain sweeping across the tile, vermillion felt with ember beads.
24. `rune-tidewall` — Water/Wave (rare): a vertical cresting wave-wall with foam at the top, Hokusai-style cut paper, deep blue.

**Row 5 — Rare (25–30)**
25. `rune-quake` — Earth/Burst (rare): ground cracked in an eight-point fracture with depth in the cracks, sandstone and ash.
26. `rune-tempest` — Air/Chain (rare): three lightning bolts triangulating a funnel-cloud, cyan and steel cord.
27. `rune-eclipse` — Shadow/Sigil (rare): a black disc with a corona ring and a single golden tear of light at 3 o'clock, astral.
28. `rune-crescendo` — Order/Chain (rare): a rising staircase of gilt bars / ascending stacked chevrons growing louder toward the top, brass gold, a "building" feel.
29. `rune-undertow` — Water/Wave (rare): a curling under-current dragging downward, a spiral pull beneath a flat surface, deep teal with silver drag-lines.
30. `rune-umbral` — Shadow/Spiral (rare, "Umbral Knot"): a tight knot of dark macrame cord tangled into a spiral, a crimson bead trapped at the center, purple-black.

**Row 6 — Mythic (31–36)** *(most ornate, prismatic, sacred-geometry)*
31. `rune-recursion` — Order/Spiral (mythic): a spiral nesting into itself infinitely, Escher-like, gold ink on indigo, sacred geometry.
32. `rune-pandemonium` — Chaos/Sigil (mythic): a crown of seven mismatched sigils orbiting a central void, black-gold, deliberately asymmetric.
33. `rune-singularity` — Void/Burst (mythic): a pinprick of white pulling every line inward, accretion-disc swirl, deep violet to white.
34. `rune-aurora` — Light/Pulse (mythic): a radiant halo-crown of nine colored rays, prismatic iridescent gold-leaf.
35. `rune-culminate` — Void/Burst (mythic): converging strokes rushing to one apex point, a crowning burst at the summit, violet-black with a blinding gold peak — "the final word."
36. `rune-lumen` — Light/Burst (mythic): a keystone starburst of pure light, radiant many-point bloom of gold and prismatic sequins on ink, brightest tile on the sheet.

---

## Sheet 3 — Enemy Portraits (8)
- **File:** `enemy-portraits.png`
- **Grid:** 4 cols x 2 rows
- **Cell size:** 768x768
- **Master size:** 3072x1536
- **KNOCKOUT:** Full-bleed art, no magenta inside a cell; magenta #FF00FF only in the gutters between cells. (Each is drawn object-fit:cover and masked into a circle — keep the subject centered, important detail inside a circle-safe zone, corners expendable. Cozy-menacing felt spirits: characterful, a little spooky, never gross or grim; dark background so it seats into the round frame. Difficulty rises tier 1→4; the Sovereign is the final boss.)

1. `enemy-cinder` — tier 1: a small hunched soot-and-ember felt sprite, reluctant posture, coal-black body with an orange glow in its chest cavity.
2. `enemy-wisp` — tier 1: a half-formed translucent cut-tissue ghost drifting upward, pale ice-blue, disinterested.
3. `enemy-fenmote` — tier 1: a squat mossy stone-skinned critter with lichen felt on its shoulders, stubborn, forest greens and mineral browns.
4. `enemy-wight` — tier 2: a tattered black-felt robed figure, too many bone-white stitched teeth grinning from a dark hood, no eyes, purple-black.
5. `enemy-sirenshade` — tier 2: a water-haired half-submerged figure, mouth open in song but the wrong shape, deep blue-green with scaled sequin details, eerie.
6. `enemy-revenant` — tier 3: a brass-felt automaton, hollow, a bell-mouth where a head should be, verdigris and gold, stoic regal pose, small armor plates.
7. `enemy-glasswyrm` — tier 3: a serpentine creature of fractured stained-glass shards with many embedded eye-shapes, iridescent cracked sequins.
8. `enemy-sovereign` — tier 4 BOSS: a regal shadow-robed silhouette wearing a crown of seven tiny runes, eyes closed but watching, the most ornate portrait, black and gold with a single crimson highlight, cozy-menacing not scary.

---

## WIRE NOTES
- Loader: `hydrateArt()` (index.html:3153) scans every `[data-art-slot]` and loads `art-slots/<slot>.png`, swapping the unicode placeholder for an `<img>`; called on boot (4128) and on `showScreen` (4132). Drop cut PNGs into the existing **`/art-slots/`** folder using the exact filenames above — zero code changes needed.
- **Title mark:** `data-art-slot="title-mark"` (index.html:1293); `.title-mark img` is `object-fit:contain` at 70% on a gold disc (CSS ~113) → needs TRANSPARENT cutout. Also downscale to `art-slots/icon-192.png` + `art-slots/icon-512.png` (referenced by manifest.json PWA icons — currently 1.4KB/4.4KB placeholders).
- **Runes:** emitted by `runeCardHTML()` as `data-art-slot="rune-${rune.id}"` (index.html:3131); `.rune-art img` is `object-fit:cover` (index.html:765) → paint full-bleed; runtime CSS tints the card border per rarity (common gold / uncommon verdigris / violet rare / crimson mythic, index.html ~751) so do NOT bake borders. IDs come from the rune table at index.html ~1563–1725 (36 runes; 6 more than the stale ASSET_MANIFEST.json — squall/undertow/umbral/crescendo/culminate/lumen).
- **Enemies:** `portrait.setAttribute('data-art-slot','enemy-'+enemy.id)` (index.html:3242); `.enemy-portrait img` is `object-fit:cover` masked to a circle (index.html:390) → center subjects, corners clipped. IDs from the enemy table at index.html ~1765–1787.
- **Recommended folder:** `/art-slots/` (already the loader's target; filenames match ASSET_MANIFEST.json convention).
