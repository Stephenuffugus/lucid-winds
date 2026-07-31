# Limb audit — what I found looking at all 856 frames

Reviewed 2026-07-31 by rendering every character against the four poses that put
limbs furthest from the body (cheer, leap, dash-run, run-r), then zooming anything
that looked wrong. Sheets regenerate with
`node satellites/stream-hop/scripts/limb_sheets.js`.

⛔ I am not the art director. Confirmed means I could count the limbs and there
were too many. Everything else is flagged for Stephen's eye, not asserted.

---

## CONFIRMED — extra limbs, verified at full size

### 1. `assets/chars/sasquatch/` — the whole character, not one frame
**`idle.png` has three arms.** On his right side there is a raised open palm AND
a second forearm and hand hanging below it, from the same shoulder. The left side
has one arm. Three total.

`idle` is the pose a player looks at longest — it is what he stands in.

The same duplicated-arm pattern repeats across his sheet: **magnet, scared, ko,
splash and sit all read as three limbs** at review size. This is not one bad
export, it is the character. ⛔ Re-cut Sasquatch as a set; fixing `idle` alone
will leave the others wrong.

### 2. `assets/hero/cheer.png` — Jimothy himself
The raised arm grows out of his **snout**, not his shoulder, and there is a second
limb on his left side. This is the starter character, so every player sees it, and
`cheer` fires on every level clear.

---

## WORTH YOUR EYE — I could not call these from a thumbnail

Ambiguous at review size, and I would rather flag than guess:

- `chars/coyote/leap.png` — the tucked paws bunch in a way that may be a fifth leg
- `chars/coyote/dash-run.png` — same shape, same doubt
- `skins/garage/run-r.png` — possible extra hand low in the frame
- `skins/knight/cheer.png` — spoon arm, shield arm, and something below
- `skins/pirate/cheer.png` — possible third arm behind the spyglass

## CHECKED AND FINE — do not waste time on these
- `chars/sasquatch/cheer.png` — reads as extra limbs but that is the **fern and
  mushroom bundle** on his shoulder. Four limbs, correct.
- `chars/opossum/cheer.png` and `leap.png` — four limbs plus tail, correct.
- All birds, the seal, salmon and orca — no limb errors.
- `skins/dino/cheer.png` — the little T-rex costume arms read as extra arms **by
  design**. Leave it.
