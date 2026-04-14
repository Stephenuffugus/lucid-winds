# Master Pollinator — art drop folders

```
assets/games/masterpollinator/
  ├── tier1/        ← 40 common flowers
  ├── tier2/        ← 30 uncommon flowers
  ├── tier3/        ← 20 rare flowers
  └── pollinators/  ← 10 pollinator creatures
```

## Filename = slug from the catalog

Each card in the FLOWER_CATALOG (in `games/pollen.js`) has a `slug`. The
renderer looks for `assets/games/masterpollinator/tier{N}/{slug}.png`.

If the file doesn't exist yet, it falls back to the flat path
`assets/games/masterpollinator/{slug}.png`, then to the tier-icon emoji
so the card is still playable.

## Card layout (78 × 108 px display)

The renderer reserves these zones — keep your art clear of them or
expect overlap:

- **Top-left (~18×18 circle)** — GP value badge (gold pill, only shows
  if card has GP > 0)
- **Top-right (~18×18 circle)** — "Use" indicator (the produces-color
  token chip)
- **Bottom 22px strip** — Cost bar (cream band with cost chips +
  flower name in tiny caps)
- **Center ~70%** — your art

Art renders with `object-fit: contain`, so any aspect ratio works
without distortion. Cream (#fbf6e6 → #f0e8ce) card background shows
through edges of transparent PNGs.

## Pollinators (88 × 108 px display)

Same convention but folder is `pollinators/`. GP badge top-right,
requirement bar (color×count chips) along the bottom.

## RULES

- **Source resolution. Always.** Don't pre-shrink anything. The
  renderer scales for display; cropping or downsizing PNGs LOSES
  quality permanently.
- **Transparent PNGs preferred** so the cream card face shows
  underneath the edges of the art.
- **Slug must match the catalog exactly** — case, hyphens, no spaces.
  See `MANIFEST.md` for the full slug list.
