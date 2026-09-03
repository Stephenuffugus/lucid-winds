# 3D ASSET CANDIDATES, RANKED, INDEPENDENT OF VR

Written 2026-09-03 from `docs/3d-vr-audit.json` (187 rows, `catalog().total` 187). This is
the **phone** half of the Director's question: which games would look better with rendered
meshes, and by which route. **It does not need a headset and does not wait on the Meta
account.** `HANDOFF-SEP02.md` §W1 takes its "which game next" from this list.

The four routes are section 4's and nothing else: `SKIN` (a three.js world gets Meshy
meshes), `RIDE` (a 3D view rides an existing sim), `PRERENDER` (meshes rendered to sprites,
the runtime does not change), `NONE` (the art is the code, law cited).

**Route counts across all 187 rows:** PRERENDER 177 · SKIN 6 · RIDE 2 · NONE 2.

**W1's budget gate** (draw calls at most 2x today, triangles at most 3x, textures at most
24 MB, median frame under 12 ms at 4x CPU throttle) is a **three.js world** gate. It applies
to the six `SKIN` rows and to nothing else. A `PRERENDER` row adds no draw calls at all; its
limit is texture memory and the thumbnail rule (`reference_thumbnail_perf`, 150 KB), and the
pipeline is `tools/forge3d/` rendering each part to a lit PNG, which
`satellites/ripcord/docs/FORGE3D.md` already proves at 112 parts and about 2.3 MB.

---

## TIER 1 — the meshes already exist and are not being used

### 1. Ripcord · `SKIN` · W1 gate **applies**
**First family to make: none. Make nothing. Wire what is built.** 112 part meshes at about
2.3 MB total, 44 Meshy hero sculpts, 6 launchers and 4 stadium dishes are already in
`satellites/ripcord/assets/3d/`, and the only file in the whole game that loads them is
`src/battle3d.js` (16 references, one file), which sits behind a settings toggle the Director
has not switched on yet.

**Phone benefit in one line:** the workshop currently shows painted 2D parts for 44 of 112
slots and forge renders for the other 68; turning those meshes into the workshop's turnaround
art is a zero generation, zero spend job that finishes an art pipeline already paid for.

**Why it is first:** it is the only row on this page whose asset cost is nothing.

---

## TIER 2 — a three.js world exists, so this is what W1 is for

### 2. Dewball · `SKIN` · W1 gate **applies** · source in this repo
**First family: `dewball-landmarks`** — the structures the player navigates by, which
`project_dewball_landmarks_aug09` already treats as the game's readability layer.

**Phone benefit:** six little worlds currently built from procedural Box, Cylinder and Sphere
with `InstancedMesh` for the repeats; painted landmarks are the difference between "a level"
and "a place", and the globe world w7 is the one people will screenshot.

**The risk W1 already names, restated because it is the real one:** Dewball is fast
*because* everything is instanced and untextured. A hundred unique painted meshes with their
own materials undoes exactly that. One shared 2048 atlas per category, `InstancedMesh` kept,
two LOD levels only.

### 3. Abduct a Chameleon 3D · `SKIN` · W1 gate **applies** · ⚠️ external repo
**First family: `chameleon-props`** — the hiding props, which must read as one silhouette
family or the hiding game stops working.

**Phone benefit:** it already loads 153 CC0 Kenney glbs at 8 MB with per instance palette
re-projection, so it is on the right road; Meshy meshes replace generic kit props with props
that belong to this world.

**⛔ The constraint that decides everything here:** "colour comes from our per instance
palette, that is the whole game." A Meshy mesh with a baked albedo breaks the mechanic.
Every mesh must take colour from vertex colour or a palette uniform. And **build upstream and
re-vendor**; never hand edit `satellites/abduct-a-chameleon/`.

### 4. Super Slice · `SKIN` · W1 gate **applies**
**First family: `slice-knives`** — the knives are the collection and the reason to come back.

**Phone benefit:** the knives are the only thing a player owns in this game, and sculpted
blades in a 3D world that already exists is the highest ratio of visible change to work on
this page after Ripcord.

**Note:** this row is `NEVER-IMMERSIVE` for VR and that has no bearing here. A game can be
the wrong shape for a headset and the right shape for meshes, and this is the clearest case
of it in the catalog.

### 5. Create A Critter · `SKIN` · W1 gate **applies**
**First family: `critter-props`** — the bowl, the ball, the bed, the things the creature
interacts with.

**Phone benefit:** the creature itself must stay procedural (it is built from the player's
drawing, which is the entire product), so the meshes go around it, not on it. Props are the
whole opportunity and they are small.

### 6. LOAF · `SKIN` · W1 gate **applies**
**First family: `loaf-furnishings`** — already enumerated in `LOAF_FURNISHINGS.md`.

**Phone benefit:** the cat is 3D by direction and Blender headless authoring is already the
pipeline (`LOAF_3D_PLAN.md`), so this is the one row where the asset route and the product
direction were decided in the same document.

**⛔ Gate that comes first:** the voice is still unheard. Audition it on the phone before any
mesh spend.

---

## TIER 3 — the asset list is already written, so the work is only the making

Nine games ship an `ART_ASSETS.md` with call sites, in game pixel sizes at 375x667, cell
counts and priorities. **These are the ready to run queue: no analysis left, only art.**

| game | route | first family to make | W1 gate | phone benefit in one line |
|---|---|---|---|---|
| **Conduit** | `PRERENDER` | `conduit-floors` (16 cells) | no | a near black floorplan whose walls, floor and void differ by a few percent of luminance becomes a place you can read at a glance |
| **Tangent** | `RIDE` | `04 Deck` (6 cells, one at 1024) | no | the deck is the object the whole game is about and it is currently a procedural disc |
| **Wireworm** | `PRERENDER` | see its `ART_ASSETS.md` | no | a board of drawn lines gets objects that read at 18 px cells |
| **Parallel** | `PRERENDER` | see its `ART_ASSETS.md` | no | two mirrored tokens become two things rather than two shapes |
| **Blackout** | `PRERENDER` | see its `ART_ASSETS.md` | no | a panel game whose whole atmosphere is carried by type today |
| **Deepwell** | `PRERENDER` | see its `ART_ASSETS.md` | no | 12 sub 32 px controls are a `QUEST-COMPAT` caution and better art is also bigger art |
| **Siege of One** | `PRERENDER` | see its `ART_ASSETS.md` | no | a 30 cell lane where every unit is currently a coloured shape |
| **Garden Guard** | `PRERENDER` | see its `ART_ASSETS.md` | no | towers you place should look like things you place |
| **HUNCH** | `PRERENDER` | see its `ART_ASSETS.md` | no | ⚠️ external origin (`hunch-mauve.vercel.app`); vendor first |

**⛔ Conduit's carve out, restated so nobody reads "PRERENDER" as permission:**
`docs/DESIGN.md` Appendix A and B, verbatim, "The creature and the conduit stay procedural.
Never generate them. A static asset would be a downgrade of the field-reactive behaviour."
`ferroBlob` (`satellites/conduit/index.html:2512`) aims the creature's longest spike at the
nearest live wire, so the shape is information a sprite cannot carry. Sheets `01
conduit-creature` and `02 conduit-wire` are `NONE` until the Director amends that law, and
`ART_ASSETS.md` already writes the amendment out in two forms for his pick. **The other
twelve sheets are unaffected and can proceed today.**

---

## TIER 4 — the biggest surface, and the one that pays per hour

**79 TABLETOP rows, almost all `PRERENDER`.** Every board, card, dice and tile game in the
catalog draws its pieces as CSS shapes, glyphs or flat canvas fills. They share components,
which is why they are cheap in bulk and expensive one at a time:

| family | serves | why it pays |
|---|---|---|
| `sws-cards` | Klondike, Spider, FreeCell, Pyramid, TriPeaks, Golf Solitaire, Cribbage, Euchre, Bleeding Hearts, Garden Spades, Garden Rummy — **11 games** | **all eleven already draw through the shared helpers in `games/_cards.js`** (7 to 20 `_cd*` calls each; `_cdFit` at `:178` is the sizer). One rendered deck, dropped in once, lands in eleven games at once. |
| `sws-dice` | **Yacht-Sea, Farkle, Shut the Box share `games/_inline/_dice_lib.js`** and already listen for its `lw-dice-style-change` event, so they are a genuine drop in. Sprout Dice, Backgammon, Garden Estates and Snakes & Ladders roll their own and would each need wiring. | dice are the most satisfying rendered object per triangle there is, `reference_dice_spec` already locks the design, and `_dice_lib.js` is a style switch that was clearly built for exactly this |
| `sws-pieces` | Chess, Checkers, Reversi, Go, Five in a Row, Four in a Row, Mancala, Code Breaker — **8 games** | one turned wood and stone set covers the whole classics shelf |
| `sws-tiles` | Jade Garden, Tetroku, Hexa Hive, Meadow Weave, Mosaic Draft, Block Drop, Petal Match — **7 games** | one bevelled tile with a lit edge, recoloured |

**Phone benefit in one line:** four families, about 120 rendered sprites, would visibly
improve **33 carded games**, and two of the four have a shared drop in point already built, which is more of the catalog than every other tier on this page
put together.

**⛔ The one that is not in these families:** Jumping Jimothy. Its identity is an ink drawing
on a paper ground (`satellites/stream-hop/ART-BIBLE-ANIMATION.md`), and prerendered meshes
would destroy that rather than improve it. It is a `PRERENDER` row by mechanics and a `NONE`
row by direction, and that is a call only the Director can make.

---

## NEVER, AND THE LAW FOR EACH

| game | law |
|---|---|
| **Lucid Winds** | every plant is a one of one SVG generated deterministically from a SHA 256 hash by `window._generatePlantSVG`. The art IS the code, and a baked mesh library breaks the guarantee the whole economy rests on. A 3D plant would have to be *generated* from the same hash, which is a renderer, not an asset. |
| **The Attic** | `attic-engine.js` header: "hash → one-of-one fake vintage object"; `object-render.js` header: "hash → SVG ... every roll comes off the hash". Same law, same reason. |
| **Conduit's creature and conduit** | `docs/DESIGN.md` Appendix A and B, quoted above. |
| **Ripcord's parts** | `FORGE3D.md`, "the geometry is the stats": teeth count is `round(3 + sharp x 8)`, outer radius is the catalogue mm, ratchet body is the named height over ten. The mesh and the canvas top cannot disagree because both derive from `sim2.js`. Generated art that ignores the stats would be a lie about the build. **This is why Ripcord is `SKIN` and not a generation job.** |

---

## AGAINST AUG 16

`incoming/VR-CANDIDATES.md` §5 is the only part of that document about art, and this list
either confirms it or extends it.

- **"MidJourney is a 2D tool and its 360 output is not reliable" — AGREE, and it does not
  matter for this page.** Nothing in Tier 1 to 4 wants a skybox. Every route here is meshes
  or sprites of meshes, through `tools/forge3d/`, which is a pipeline this repo has already
  run to 112 parts.
- **"Skybox AI is $20/month and the VR plan said every path was $0" — AGREE, and noted so it
  stays true.** No row on this page needs it.
- **"A skybox is a backdrop, not a world; the scarce resource is staging, not art" — AGREE,
  and this is the sentence that should govern W1.** It is also why Tier 1 is Ripcord: 112
  finished meshes that only one file loads is a staging problem wearing an art problem's
  clothes.
- **Where I extend it:** Aug 16 looked only at the four games that had three.js. The largest
  3D asset opportunity in this catalog is not a 3D game at all, it is the **four shared
  families in Tier 4** that would improve 33 carded games from about 120 sprites, because the
  card, dice, piece and tile games already share their sizing and rendering helpers. Aug 16
  had no reason to look there because it was answering a VR question.

### Which game next, for W1
**Dewball stays first**, exactly as `HANDOFF-SEP02.md` §W1 says, because its source is in this
repo, it is a three.js world, and the budget gate was written for it. **But Ripcord should go
before it**, because Ripcord's answer is "wire up what you already paid for" and costs
nothing, and doing it first tells you whether the forge pipeline output actually looks right
in a game before Dewball spends Meshy credits finding out.
