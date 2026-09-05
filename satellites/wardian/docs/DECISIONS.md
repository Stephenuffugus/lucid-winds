# WARDIAN, decisions

Every line here is a call the plan left to the builder, taken in the smallest
reasonable way, with the reason. Dated 2026-09-05 unless it says otherwise.

## The ecosystem

- **A sealed jar is a closed water loop, and the glass is the reservoir.** The day
  lifts water off the soil onto the glass; the night runs it back down the SIDES,
  so it lands in the bottom row and has to be wicked up again. Gravity down is
  0.05 of the difference per tick and the wick up is 0.030, which is why the top
  of a jar goes dry while the bottom of it never does. Without this the first
  build evaporated the whole surface inside one day and nothing grew.
- **A lid is a lid, not a weld.** `SEAL_LEAK` takes a little water off the glass
  every tick. It is the only way water leaves, and it is what makes a mist mean
  something. Nothing dies of it: the plants curl and wait.
- **Plants have roots.** Growth and dormancy read the top three rows weighted
  0.5 / 0.3 / 0.2, not the single surface cell. An afternoon does not put a fern
  to sleep; a fortnight of neglect does.
- **A fern is a crown, not a mast.** `crown` species put their whole first ring
  up from the base at once. Each plant rolls its own crown count, fan, lean and
  scale from its seed, so two ferns in one jar never share a silhouette.
- **A shed leaf grows back as a LEAF.** The replacement carries `noBranch`. It
  used to carry the parent's generation, so every shed leaf grew a whole new
  limb and two ferns filled the 400 segment budget inside a month.
- **The segment budget is counted, not flagged.** A crown pushes five segments in
  one go, and a boolean tested once let the jar overshoot `SEG_MAX` by four.

## The clock

- **One clock on the page.** Everything asks `nowMs()`. The HUD used to read
  `Date.now()` while the jar's light came from the last tick, so the chip said
  night over a noon jar. The test hook moves `nowMs` and the whole picture
  follows, which is also how the shots are taken.
- **`applyClock` is shared** by the sim tick and the view, so the light follows
  the minute while the sim still ticks every ten.

## The picture

- **The hour is a VEIL, not added light.** Night takes light away and gives back
  one small cold glow near the lid. The first version added light at every hour
  and the night jar came out paler than the noon one.
- **The soil is a curve, not a shelf.** `soilY(x)` is the ground, and plants,
  moss, props, animals and litter all ask it where they are standing.
- **Scatter needs a hash.** `(i * 137) % 719` walks a constant step in x and a
  constant step in y, so grain lands in diagonal dashes and the soil looks
  hatched. `hash01(i, salt)` fixed the soil, the gravel and the condensation.
- **`mixHex` reads its own output.** It only parsed `#rrggbb`, so a colour mixed
  twice returned NaN, canvas kept the last fill, and the moss came out black.
- **No `destination-out` for the sheen.** It erases the jar underneath and leaves
  a black slab. The sheen is a radial gradient, which feathers on every side.
- **Moss is one path per run, not one ellipse per cell.** A cushion per covered
  column reads as a caterpillar. The underside follows the ground back so there
  is no flat green shelf under it.
- **Depth in a flat jar.** Each plant carries a `z`: further back means smaller,
  standing higher on the mound, and a little colour lost to the air between,
  with a heap of soil and a contact shadow so it still touches the ground.
- **No tails on the condensation.** A drop with a line above it reads as
  something swimming. The wet is a fog band under the lid and beads on the glass.

## Scope

- **Photo, journal entries, pouch buying, weather and tilt are P2 and P3.** The
  buttons exist and say so rather than doing nothing.
