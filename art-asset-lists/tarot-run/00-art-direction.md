# Tarot Run — Art Direction

> A single-file tarot deckbuilder where you climb a candlelit tower one hand at a time, spending the whole 78-card arcana to duel a gallery of cozy-menacing spirits and dethrone the Crowned Fool.

**Genre:** Pocket roguelite deckbuilder (78-card tarot deck; climb the tower, beat the Crowned Fool)

## Pick a look (kid-friendly options)

### 1. Gilded Arcana (recommended) — *elegant* ⭐ RECOMMENDED
Painterly hand-illustrated tarot in the Art-Nouveau / Mucha / Smith-Waite lineage: gouache-and-ink color with fine gold-ink filigree framing each motif, jewel-tone per-suit washes on warm cream parchment, deep teal-velvet grounds and rose-gold accents. Candlelit-theater mood with a warm gold footlight rim from below. Elegant and grown-up-looking but always kid-friendly (cozy-mysterious, never gory) — this is the game's own native intent, finally rendered as real illustration instead of forced paper-craft.

### 2. Midnight Mystic — *bold*
Clean modern-mystic vector: bold flat shapes, confident gold single-weight line-art and geometric arcana glyphs on deep indigo-teal, a tight 5-color-per-suit palette with neon-gilt highlights. Reads instantly at 88px in-hand and compresses to almost nothing. Cooler and more graphic-designer than painterly — think a premium mobile tarot app skin. Lower render cost, extremely crisp, slightly less warmth than Gilded Arcana.

### 3. Storybook Arcana — *cozy*
Soft gouache storybook: rounder, friendlier characters, warm rag-paper texture, gentle desaturated jewel tones and hand-lettered charm. The bridge back toward cozy — the enemies read as spooky-cute picture-book spirits rather than baroque portraits. Warmest and most approachable of the three; slightly less prestige/menace than the marquee boss wants.

**Recommended: Gilded Arcana (recommended).** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-sheet-cards-wands.md` — Sheet 1 — Wands suit (14 cards)
- `02-sheet-cards-cups.md` — Sheet 2 — Cups suit (14 cards)
- `03-sheet-cards-swords.md` — Sheet 3 — Swords suit (14 cards)
- `04-sheet-cards-pents.md` — Sheet 4 — Pentacles suit (14 cards)
- `05-sheet-cards-major.md` — Sheet 5 — Major Arcana (22 cards + 2 empty)
- `06-sheet-enemies.md` — Sheet 6 — Enemies, gallery portraits (10)
- `07-sheet-boss-crown.md` — Sheet 7 — Boss: The Crowned Fool (1)
- `08-sheet-title.md` — Sheet 8 — Title mark + app icons (1 authored + 2 derived)

## Style block (baked into every sheet prompt here)

```
STYLE — GILDED ARCANA: Painterly, hand-illustrated tarot in the Art-Nouveau / Mucha / Smith-Waite lineage — elegant, polished, softly mysterious, and always kid-friendly (cozy-mysterious, never gory, no true horror, no sexualization; any "menace" is theatrical, never scary). Render as rich gouache-and-ink illustration: smooth luminous color, fine gold-ink linework and Art-Nouveau filigree wrapping the central motif, subtle canvas grain, gentle painterly edges. NO photorealism, NO 3D render, NO anime, NO pixel art. Warm candlelit-theater mood on a deep near-black teal-velvet ground (#0d2127), with antique gold (#c8a84b) and rose-gold (#d4a574) leaf accents, warm cream-parchment highlights (#e8dcc8), and jewel-tone per-suit washes. Soft top-down key light plus a warm gold footlight rim glowing up from below. One bold, memorable silhouette per card, composed as a CENTERED MEDALLION with generous parchment margin so the hero motif survives being cropped to a small center band (cards render ~88px wide in hand). Enemy portraits keep the face HALF-HIDDEN (theatrical conceit). Absolutely NO text, numbers, titles, captions, borders, or UI words anywhere unless a cell explicitly asks for a logo seal. Chunky arcade readability at tiny sizes; limited layered palette that compresses cleanly under 150KB per cut cell.
```

## Wire notes

Loader: hydrateArt() in Tarot_Run/index.html (~line 4741) scans every [data-art-slot] element on each render (renderHand, renderMap, renderCodex) and swaps in art-slots/{slot_id}.png over the unicode-glyph placeholder — NO code edits needed; filenames must equal the slot_id EXACTLY. Recommended asset folder: art-slots/ (same dir the loader and manifest.json PWA icons already point at). Slot list of record: ASSET_MANIFEST.json (90 slots confirmed: 78 cards + 10 gallery enemies + 1 boss + 1 title). Card slot emitted as card-${card.id} (~line 3729); ids in data/cards.json (suits wands|cups|swords|pents + major, e.g. card-wands-1 … card-major-21). Enemy slot emitted as enemy-{id} (~line 3837); ids in data/enemies.json (spectre, jackal, echoman, duelist, reflection, sleeper, gilded, archivist, twins, oracle, crown). CROP QUIRKS THAT DROVE THE COMPOSITIONS: .card-art (CSS ~line 776) is object-fit:cover at ~88px wide x 56px tall in-hand and ~132px in inspect — it CENTER-CROPS the 5:7 source both ways, so every card keeps its hero motif in the middle ~512x512 band. .enemy-portrait (CSS ~line 456) is object-fit:cover on a 175px rounded square — full-bleed 1:1, art carries its own teal-velvet backdrop. .title-mark img (CSS ~line 126) is object-fit:contain inside a CSS gold-ring circle with its own radial glow — hence title-mark is the ONLY cutout/transparent asset (magenta-bg knockout), everything else is full-bleed (magenta in gutters only). Cut each contact-sheet cell to art-slots/<slot_id>.png, ≤150KB each. MVP wave order if generating in phases: title-mark + icons → 22 Majors → enemy-crown → the 4 Aces → remaining enemies → the rest of the minors.

