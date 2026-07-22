# JIMOTHY — Sheet 14: the three missing hop frames for the six errand costumes

**Status:** the six costumes are ALREADY IN THE GAME and playable. This sheet is the
polish pass that makes them animate like everyone else. Nothing is blocked on it.

## What happened

Way back in `art-drop/7.png` you painted six Jimothys out running errands. Only the top
two rows of that sheet ever got used, and those six raccoons sat in `assets/skins/` as
loose `cell-*.png` cuts for weeks. They are wired now:

| In-game name | The painting |
|---|---|
| **Deckhand Jimothy** | yellow rain hat, navy cape, coil of rope |
| **Market Day Jimothy** | green satchel, grocery bag, baguette and carrots |
| **Hard Hat Jimothy** | orange hard hat, hi-vis sash |
| **Scoutmaster Jimothy** | navy patch vest, white neckerchief |
| **First Frost Jimothy** | red scarf, takeaway coffee |
| **Garage Band Jimothy** | denim vest, purple bandana, button pins |

## The gap

Every other critter in the game has **four** frames — `idle`, `crouch`, `leap`, `land`.
You painted these six standing only, so right now all four frames point at the same
standing painting. The engine's squash, stretch and hop arc still carry the motion and
it honestly reads fine at game size, but their legs never tuck the way the sheet-17
costumes do (Soggy, Nordic, Barista, Fishmonger, Dr. Jimothy, Jimothy MD, Hot Jimothy
Summer). Side by side you can tell.

## The ask

**18 paintings: the same six raccoons, three more poses each.**

Match `art-drop2/Jimothy2/17a.png` exactly — that is the sheet where you did this for the
other seven costumes, and it is the reference for pose, scale, lighting and camera.

For each of the six costumes, in this order:

1. **CROUCH** — gathered down on all fours, weight forward, about to spring. Body
   compressed, head low, haunches up. (17a column 2.)
2. **LEAP** — fully airborne, front paws thrown forward, back legs trailing, body
   stretched long. (17a column 3.)
3. **LAND** — touching down, front paws planted, little splash of water at the feet,
   head coming back up. (17a column 4.)

### Rules that matter for the cut

- **Same camera as `hero/idle.png`** — facing the viewer, three-quarter high angle.
  These six already match it; keep them matched.
- **Magenta background** (`#FF00FF`), same as every sheet.
- **Keep every costume detail readable through all three poses** — the hard hat stays on,
  the baguette stays in the bag, the coffee does not spill, the rope stays coiled. The
  costume IS the character; if it vanishes in the leap frame the skin stops reading.
- **Lay the sheet out as 6 rows × 3 columns** with clear gaps between rows, or draw white
  divider lines. ⛔ Do not butt the paintings up against each other — the cutter reads
  divider lines or connected components, never a fixed grid, and a fixed grid is how we
  once shipped a car sliced in half.
- One row per costume, in the table order above, so I can cut them in one pass.

### Where they go

`assets/skins/<id>/{crouch,leap,land}.png` where `<id>` is one of
`deckhand, market, hardhat, scout, firstfrost, garage`. They overwrite the placeholder
copies and animate immediately. **No code change needed.**

---

## Optional, only if you feel like painting more

The shop now sells **finishes** — one purchase re-casts every critter you own in a
material (Old Bronze, Jade, River Ice, Gold Leaf, Night Sky and nine more). Those are
generated from your existing paintings at run time, so they need no art from you at all.

What the shop does NOT have is a **shopkeeper**. If you ever want to paint one: a single
standing Jimothy behind a counter of junk, same camera as these six, would sit at the top
of the Shop tab and give the place a face. Entirely optional and nothing waits on it.
