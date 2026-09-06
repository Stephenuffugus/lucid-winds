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

**D-PL1 (2026-09-07, Opus, the polish loop) — the seal is measured now, not promised.** `draw`
has carried this game's own law in a comment since it was written: everything inside the jar is
clipped to the jar, "which is a thing a sealed jar cannot do". Every layer that draws life does
clip itself, and nothing had ever checked. `WARDIAN_TEST.outsideInk` counts the pixels in a ring
just outside the glass that are brighter than the room behind it, with two pixels of slack for
the glass's own antialiased edge. It reads zero, and the brightest thing out there is the room at
38 to 69 of 255.
⛔⛔ AND THE ASSERTION COULD NOT FAIL FOR THREE ROUNDS, in three different ways, all mine:
1. **Nothing in the jar could leak.** Measured on whatever frame the gate happened to be on,
   there were no particles alive at all, so removing the clip left it green, and so did removing
   the clip AND making the particles drift seven hundred units sideways. The jar is misted first
   now, which is the one thing in this game that throws anything loose, and the gate asserts that
   twenty six motes exist before it asserts that none of them got out.
2. **The cooldown would not clear.** The hook set `MISTED_AT` to zero, but the cooldown is
   measured against `nowMs()`, which a few hundred milliseconds after a page loads is a small
   number, so `doMist` quietly returned false. It is a large negative number now.
3. **⛔ A DUPLICATE KEY IN AN OBJECT LITERAL SILENTLY WINS.** `WARDIAN_TEST` already had a `mist`
   key below the one I added, so my hook was never called at all: `T.mist()` ran the old one,
   which only raises humidity, and the gate reported nought motes three times while looking like
   the game was at fault. Nothing in the file, the lint or the console says a word about it. The
   hook is `mistPuff` now.
With a real leak (unclipped, and a mote that drifts) it goes red at all three sizes, 47, 26 and
2 bright pixels.
