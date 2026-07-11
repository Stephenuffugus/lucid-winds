# Sheet 05 — Cosmetics catalog (the Wardrobe)

**DROP-IN wiring:** the Wardrobe screen (`renderWard`, `s-ward`) lays out `.wcard` plates
(~min 74px tall, 3 across) for the ten unlockables in the `WARD` array — 4 lamp skins, 3 dusk
palettes, 3 firefly colors. Each card currently shows an emoji icon; these badge plates replace that
icon (drop it into the `.wi` slot, or set the card background). Unlocks are **mastery-earned, no
purchases** (thresholds below, from code). A locked card renders at 0.4 opacity; the equipped card
gets a gold border — so the art gives a clean **default** badge and the engine handles lock/equip
states, but the sheet also includes a locked-frame and equipped-frame treatment to match.

| Lane | Badges (unlock) |
|---|---|
| Lamp | Brass (free) · Paper (6 streets) · Star (5 lanterns) · Moth (streak 3) |
| Dusk | Plum (free) · Ember (12 streets) · Tide (3 Deep Squares) |
| Fireflies | Gold (free) · Mint (all 20 streets) · Lilac (streak 7) |

Buttons/cards follow the painted-plaque rule: art FILLS the plate, any text sits over it in HTML —
keep centers calm.

**PROMPT (copy-paste):**

Lamplight Leadlight style: stained-glass leadlight nocturne, every shape framed by thin dark leaded
came outlines, luminous jewel-glass fills that glow as if lit from behind, warm amber lamplight
blooming through cool indigo and plum dusk glass, clean readable silhouettes, cozy old-town dusk,
crafted and handsome, kid-friendly not childish, no text, no watermark, crisp game-asset edges, flat
FF00FF magenta background for cutout.
A wardrobe badge sheet on flat magenta FF00FF with generous magenta gutters. Every badge is a small
dark slate 10182A rounded card plate with a thin frosted leaded border and one glowing emblem
centered on it.
Row 1, four LAMP badges, each 200x200 pixels: (1) a brass gold C8A84B diamond lantern emblem,
(2) a round ember E8875A paper lantern emblem, (3) a warm gold FFD76A five point star lantern
emblem, (4) a pale cream E8DCC8 winged moth lantern emblem with an amber body.
Row 2, three DUSK palette badges, each 200x200 pixels, each a tiny leadlight town-at-dusk thumbnail:
(5) PLUM dusk, indigo-to-plum 191036 3C2A5E sky with a pale moon and dark cottages, (6) EMBER dusk,
warm 200F0C to A86034 sky with a golden moon and cottages, (7) TIDE dusk, teal 081A26 to 508282 sky
with a cool moon and cottages.
Row 3, three FIREFLY badges, each 200x200 pixels: (8) a cluster of tiny gold FFD76A glowing motes,
(9) a cluster of mint 9EF0D0 glowing motes, (10) a cluster of lilac CFA0E8 glowing motes.
Row 4, two card-frame treatments, each 200x200 pixels: (11) a LOCKED plate, a dim slate card with a
small closed padlock emblem and a faint frosted border, greyed and quiet, (12) an EQUIPPED plate, a
bright slate card with a warm gold C8A84B glowing border and a small check tick in the corner, the
selected state.
Even spacing, one badge per cell, nothing touching cell edges, no text anywhere.
