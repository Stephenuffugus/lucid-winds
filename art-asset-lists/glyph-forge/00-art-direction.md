# Glyph Forge — Art Direction

> Fuse 1-3 rune sigils into one spell, stack a huge number, and break through 13 escalating spirit-foes on a single pocket screen.

**Genre:** Pocket roguelite deckbuilder (rune-fusion combat)

## Pick a look (kid-friendly options)

### 1. Hearthbound Grimoire — *cozy*
A warm, hand-inked storybook spellbook: soft gouache washes, friendly rounded ink contours, and candle-glow gold on aged cream paper. Sigils feel doodled-by-a-kindly-wizard and foes are plush, wide-eyed marginalia critters. Inviting and gentle, the safest read for the youngest players but the least premium-looking of the three.

### 2. Illuminated Arcana — *elegant* ⭐ RECOMMENDED
Jewel-bright hand-illuminated codex art: painterly gouache-and-ink on vellum, elevated with crisp burnished gold-leaf linework and a luminous gilt halation on every sigil. Jewel pigments (lapis, verdigris, imperial violet, vermilion) sit on near-black ink. Sophisticated, precious and mystical, yet wholesome; foe-spirits read as characterful illuminated-bestiary creatures, a little eerie but always kid-friendly. Reuses the game's exact CSS palette anchors so art seats perfectly into the runtime rarity frames.

### 3. Astral Circuit — *bold*
Clean modern-mystic: glowing vector sigils rendered as luminous constellation-linework and neon gold circuitry on a deep space-indigo ground, with prismatic bloom. Crisp, high-contrast, arcade-punchy and very readable at thumbnail size. The most contemporary and boldest look, but colder and less tactile than the codex direction.

**Recommended: Illuminated Arcana.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-title-mark.md` — Sheet 1 — Title Mark & App Icon (cutout)
- `02-rune-sigils.md` — Sheet 2 — Rune Sigils (all 36, full-bleed card tiles)
- `03-enemy-portraits.md` — Sheet 3 — Enemy Portraits (8, circle-masked)

## Style block (baked into every sheet prompt here)

```
STYLE — ILLUMINATED ARCANA: rich hand-illuminated codex illustration for a pocket rune-forge deckbuilder. Render as painterly gouache-and-ink on aged vellum, elevated with crisp burnished gold-leaf linework and luminous gilt accents — the look of a jewel-bright medieval illuminated manuscript crossed with clean modern arcane game art. Matte painted forms with confident ink contours, delicate hatching, and gold-leaf highlights that catch a warm candlelit key light; a soft gilt halation and a faint inner glow radiate from every sigil-line. Jewel-toned pigments — lapis blue, verdigris green, imperial violet, vermilion crimson — sit on near-black ink and warm parchment. Sophisticated and mystical yet inviting and wholesome: an arcane world that feels reverent and precious, never grim, gory, or frightening; foe-spirits read as characterful illuminated-bestiary creatures, a little eerie and cute-uncanny, always kid-friendly. Strong readable silhouette first — each glyph or creature reads instantly at thumbnail size, detail kept bold and simple so any cropped cell compresses cleanly under 150KB. No photorealism, no 3D render, no drop-shadow clip-art look, no text, captions, borders, watermarks, or UI words unless a cell explicitly calls for logo text. Palette anchors: ink #0a0705, vellum #f4e8d0, parchment #e8dcc3, gilt #d4a849, bright-gilt #f0c46a, lapis #2a4a7c, verdigris #3e7d5a, violet #5a3d78, crimson #a83232.
```

## Wire notes

Drop cut PNGs into the existing /art-slots/ folder using the EXACT filenames below — zero code changes needed. The loader hydrateArt() (index.html:3153) scans every [data-art-slot], loads art-slots/<slot>.png, and swaps the unicode placeholder for an <img>; it runs on boot (4128) and on showScreen (4132). There is NO full-screen background slot — the loader only hydrates title-mark, rune-*, and enemy-* elements, so these three sheets cover the game's entire art surface.\n\nTITLE MARK (Sheet 1) -> title-mark.png. Element data-art-slot=\"title-mark\" (index.html:1293); .title-mark img is object-fit:contain at 70% on a gold disc (CSS ~113), so it MUST be a transparent cutout (magenta knockout). Also downscale the same transparent art to art-slots/icon-512.png (512) and art-slots/icon-192.png (192) — these are the manifest.json PWA icons (currently ~4.4KB / ~1.4KB placeholders).\n\nRUNES (Sheet 2) -> rune-sigils.png, cut into 36 files named rune-<id>.png. Emitted by runeCardHTML() as data-art-slot=\"rune-${rune.id}\" (index.html:3131); .rune-art img is object-fit:cover (index.html:765) so paint FULL-BLEED and keep the sigil centered. Do NOT bake card borders/rarity glow — runtime CSS tints the frame per rarity (common gilt / uncommon verdigris / rare violet / mythic crimson, ~751). The 36 ids come from the RUNES table (index.html ~1561-1740) and match the sheet order exactly: ember, drop, stone, gust, hollow, ray, veil, tally, roll, echo, mirror, surge, cascade, anchor, drift, drain, beacon, sympathy, squall, ouroboros, twin, triskel, wildfire, tidewall, quake, tempest, eclipse, crescendo, undertow, umbral, recursion, pandemonium, singularity, aurora, culminate, lumen. Note: rune-triskel's id is 'triskel' (name is Triskelion) and rune-umbral's id is 'umbral' (name is 'Umbral Knot') — file names use the id. These 6 (squall/undertow/umbral/crescendo/culminate/lumen) are the expansion runes absent from the stale ASSET_MANIFEST.json.\n\nENEMIES (Sheet 3) -> enemy-portraits.png, cut into 8 files named enemy-<id>.png. portrait.setAttribute('data-art-slot','enemy-'+enemy.id) (index.html:3242); .enemy-portrait img is object-fit:cover masked to a CIRCLE (index.html:390) so center subjects, corners clip. The 8 ids come from the ENEMIES table (index.html ~1766-1788) in sheet order: cinder, wisp, fenmote, wight, sirenshade, revenant, glasswyrm, sovereign.\n\nRecommended folder: /art-slots/ (already the loader target). Every cut asset must compress under 150KB — the illuminated palette is flat-ish jewel tones on ink so PNG-8 or quantized PNG-24 will hit that easily. Palette hexes in the styleBlock intentionally mirror the game's CSS vars (ink/vellum/gilt/verdigris/violet/crimson) so painted art seats seamlessly into the runtime rarity frames.

