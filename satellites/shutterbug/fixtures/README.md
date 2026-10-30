# Shutterbug fixtures

Level records (grids, never photos) that `harness.js` builds and checks (BUILD-PLAN.md section 2.7, section 5.1).
Photos never enter the repo: a room photo becomes a record in the browser through `fixtures/make.html` (T0.5b), and
only the JSON is committed, into `fixtures/rooms/`.

**Making one from a photo (Stephen):** serve the repo (`python3 -m http.server 8777` at the repo root), open
`http://localhost:8777/satellites/shutterbug/fixtures/make.html` (on the phone through the Codespace's forwarded port),
take or pick photos, frame each one (drag, pinch, the plus and minus buttons, Fit), check the 24x48 overlay (solids
hatched, one ways as light lines, the exit outlined; the 36x64 view is a preview only), name it, Download JSON, move the
JSON files into `fixtures/rooms/` and commit only the JSON. Nothing leaves the page and nothing is stored.

Every fixture is the fixture v1 form: `{ v, name, source, notes, record, expect }`. The `expect` block is authored by
hand FROM THE FIXTURE'S DESIGN, never by running the pipeline (law 2 applied to the corpus); the reasoning is in each
fixture's `notes`. A `null` expectation means "not asserted for this fixture" and the notes say why. The harness
refuses a fixture missing `record` or `expect` and asserts every key below is present.

Expect keys: `biome` (attic, frost, deep, overgrowth, ember), `needsCrop` (true or false), `tabsMax` (the most film tabs
repair may add), `exitIsLight` (the exit stands in the ceiling light), `platformsMin` (one way runs), `landmarksMin`.
The sample room adds `beats`, the hand listed edges of its onboarding (DESIGN 5.3).

The synthetic set is written by `node tools/fixtures.mjs`, deterministic from each name (a second run changes
nothing); `--preset B` writes the same designs for the 36x64 fallback into `fixtures/synthetic-b/` (not loaded).

## The corpus (the harness checks it holds every record listed here)

- `sample-room` the built in attic bedroom, the onboarding room (hand, `tools/sample-room.txt`)
- `blank-wall` a bare Ash wall: the default spread
- `all-dark` Ink and Soot over a dim Slate floor: the Otsu clamp, an honest needsCrop
- `all-light` Paper, Glare and Ash noise: the clamp from above, Frost
- `checkerboard` a photographed checkerboard (10% noise): the smoothing
- `one-giant-landmark` one 12x30 Soot block: landmarks, repair beside a landmark
- `shelves-a` six one way planks and a pillar: the reach edges
- `stripes-h` thin dark rows every fourth row: erased solids, a full width plank ladder
- `stripes-v` thin dark columns every fourth column: erased solids, a bare wall
- `gradient-v` Glare at the top to Ink at the bottom: a solid lower mass, an honest needsCrop
- `gradient-h` dark to light across: a solid left wall, the rest open
- `noise-s1` Ink and Soot specks at 15%: smoothed nearly bare
- `noise-s2` the same at 35%: scattered blobs
- `noise-s3` the same at 55%: a mostly solid mass (needsCrop not asserted)
- `shelves-b` a plank every third row: a ladder of one ways climbed by jumps alone
- `pillars` three vertical solid runs, two of them one wide and 8 tall on the frame: sticky candidates
- `ladder-stack` four one ways within 3 rows of each other: a ladder zone
- `bright-door` a 4x4 Glare block over a plank: the Darkroom door candidate
- `trap-pattern` a 6x6 two cell repeat: the trap field candidate
- `saturated-blobs` saturated clusters of 3, 8 and 14 cells: enemy spawns and a boss candidate
- `tight-gap` a room whose only way up needs repair: the stair assertion

Twenty one records (twenty synthetic plus the sample room) since T0.5c; T1.1 adds the five biome tints, T3.1a the
double exposure sample. Authored needsCrop: all-dark and gradient-v (at most 2 over the corpus, H-rep-1).
