# Petal Match art — what every file is

Cut 2026-07-26 from Stephen's 23 sheets + 4 backgrounds + share card.
Rig: `scripts/cut_art_sheet.py`. Every sheet was dry-run, QA'd and eyeballed on a
contact sheet before anything was written.

## Base pieces (sheet 1) — the 8 matchables
`base-1-camellia` `base-2-tulip` `base-3-daffodil` `base-4-poppy`
`base-5-bellflower` `base-6-iris` `base-7-hydrangea` `base-8-thistle`
⭐ Eight genuinely different silhouettes: round, cup, star, ruffle, bell, spike,
cluster, cone. They survive greyscale, which was the one hard rule.

## Specials (sheets 2, 3)
`spec-line-h` `spec-line-v` — match 4, clear a row / column
`spec-burst` — match 5 L/T, 3x3
`spec-wild` — match 5 in a row, clears a colour
`spec-strip` — match 6, row AND column
`spec-quake` — match 7
`spec-serpent` ⭐ the signature travelling piece · `serpent-trail` its path
`spec-big` — the 2x2 large piece · `spec-box` + `box-residue` — the box of six
`combo-cross` `combo-mega` `combo-storm` `combo-hydra` — special + special
`ring-corners` `ring-ornate` `ring-plain` — charged/selected overlays

## Board + blockers (sheets 4, 5, 6, 7)
`cell-empty` `cell-alt` `cell-locked` `board-frame`
`cover-full` `cover-half` `cover-crack` — the dew/ice covered tile states
`block-hard-3` `block-hard-2` `block-hard-1` `block-break` `block-cracked` — damage ladder
`block-steel` `block-spreader` `block-chain` — the un-matchable blockers
`drop-token` `drop-token-glow` `drop-exit` `token-pedestal`
`frame-oval` `frame-round` `frame-small` `ice-shatter` `banner-goal` `compass`

## Economy (sheet 8) + emblems (sheet 9)
`coin` `coin-pile-sm` `coin-pile-md` `coin-pile-lg` `gem` `price-bar`
`emblem-cross` `emblem-lotus` `emblem-beam` `emblem-clover` `emblem-dewshield`
⚠️ The emblems are objective icons by shape (dew shield = clear tiles, clover =
gather, beam = score). Confirm the mapping before wiring.

## Tools (sheets 10, 11) — every one has a `-ready` twin, same order
`tool-swap` `tool-hammer` `tool-shuffle` `tool-bomb` `tool-magnet`
`tool-hourglass` `tool-undo` `tool-empty`

## UI (sheets 12, 13, 14, 17, 18)
panels `panel-wide` `panel-portrait` `panel-portrait-gold` `panel-arch`
`panel-curve` `panel-leader` · plates `plate-bloom` `plate-tools` `plate-card`
hud `hud-bar` `pill-thin` `pill-button` `slot-rect` `bar-slider` `title-bar`
buttons `btn-pause` `btn-star` `btn-back` `btn-next` `btn-retry` `btn-share`
stars `star-1` `star-2` `star-3` `star-empty` `star-lit` `star-gold`
medals `medal-gold` `medal-silver` `medal-bronze` `medal-green` `medal-teal`
`medal-copper` · `badge-frame` `streak-flame` `laurel-burst`
`rank-row` `rank-row-you` — split out of one merged frame by their alpha gap
banners `banner-path` `banner-gate` `banner-orrery` `banner-compass`
`banner-spire` `banner-vine` `banner-lantern` `banner-lotus`

## Level map (sheet 16)
`map-node-locked` `map-node-open` `map-node-1star` `map-node-2star`
`map-node-3star` `map-star-empty` `map-star-full` `map-path` `map-chapter-gate`

## Tutorial (sheet 15)
`tut-frame` `tut-hand` `tut-arrow` `tut-swap` `tut-match3` `tut-line`
`tut-wild` `tut-combo`

## FX (sheets 19, 20, 21, 22)
`fx-burst` ⭐ the most-seen sprite in the game · `fx-sparkle` `fx-ring`
`fx-shard-1..3` `fx-beam-h` `fx-beam-v` `fx-trail` `fx-coin-pop` `fx-flash`
`fx-plume` `confetti-petals` `confetti-ribbons` `confetti-gems`
`vignette-corner-a` `vignette-corner-b`
pops `pop-nice` `pop-great` `pop-amazing` `pop-incredible` `pop-lastmove`
`pop-combo-frame`
emblems `emblem-rocket` `emblem-serpent` `emblem-cascade` `emblem-cradle`
`emblem-gate` `emblem-orb`
achievements `achv-flame` `achv-collection` `achv-compass` `achv-tower`
`achv-coins` `achv-geode`

## Board skins (sheet 23) — three complete looks
`skin-teal-bg/-frame/-grid` `skin-green-…` `skin-purple-…`

## Full-bleed art (kept whole, NOT keyed)
`chapter-bg-1..4.jpg` `share-card.jpg`
⛔ These are paintings with no magenta surround. Keying them ate the path, water
and deep foliage on the first attempt — the cutter now refuses and warns when a
measured background is not magenta.

## Weight
~42 MB of PNG. Deliberately NOT shrunk further: the studio rule is never
overshrink the art. Handle at wiring time with lazy-loading, or a WebP build
step, rather than by degrading sprites.
