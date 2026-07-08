# Jade Garden — tile face art goes HERE

Drop the 42 painted face PNGs in this folder (`satellites/mahjong/assets/tiles/`).
The game already loads `assets/tiles/<name>.png` for every tile, with an emoji+number
fallback, so each file appears the instant it's added — no code change needed.

**Filenames are exact and case-sensitive** (verified 1:1 against what the game requests):

## Number suits (27) — paint the count-motif + a small gold corner numeral
```
bloom-1.png  bloom-2.png  bloom-3.png  bloom-4.png  bloom-5.png  bloom-6.png  bloom-7.png  bloom-8.png  bloom-9.png
leaf-1.png   leaf-2.png   leaf-3.png   leaf-4.png   leaf-5.png   leaf-6.png   leaf-7.png   leaf-8.png   leaf-9.png
seed-1.png   seed-2.png   seed-3.png   seed-4.png   seed-5.png   seed-6.png   seed-7.png   seed-8.png   seed-9.png
```

## Honors (7) — centered hero motif, no numeral
```
companion-butterfly.png  companion-honeybee.png  companion-ladybird.png  companion-dragonfly.png
root-taproot.png  root-bulb.png  root-rhizome.png
```

## Bonus wilds (8) — the game draws the gold(Season)/silver(Element) frame; paint just the bloom
```
season-spring.png  season-summer.png  season-autumn.png  season-winter.png
element-rain.png   element-sun.png    element-soil.png   element-wind.png
```

## Delivery
- Paint the **motif only** — the ivory tile plate (cream body, bevel, gold hairline, 3D lip)
  is drawn in CSS, so you paint just the botanical on top of it.
- Either **transparent PNGs** named as above, OR **magenta `#FF00FF` sheets** (same chroma-key
  format as Burr Blast / Bramblewick) — send the sheets and I'll cut + name them.
- Export ~256–320px; must read at ~40px and in grayscale (shape first, colour second).

See `../../ASSET_LIST.md` for the full briefs + the chrome/background/UI assets
(tile-back, bg-table, bg-menu, wordmark, badges, trophies) — those aren't wired into
the game yet; I'll hook them up when you paint them.
