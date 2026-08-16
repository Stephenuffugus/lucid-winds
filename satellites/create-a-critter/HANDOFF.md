# Create A Critter — browser edition (satellite)

A kid draws a creature and it puffs up into a living 3D buddy. Everything runs
on the device: no server, no API keys, no uploads. Born from Stephen's
daughter's idea; the full-stack sibling repo (`Stephenuffugus/create-a-critter`,
FastAPI + Blender + React) remains the deluxe/kiosk build with real rigged
animation clips.

## How it works

- **Draw screen**: 1024px canvas, 12 kid colors, 3 brush sizes, bucket fill,
  eraser, undo (12 steps).
- **The Inflatinator** (straight JS port of the sibling repo's
  `blender/inflate_lib.py`): ink mask (lum < 235 or saturation spread > 30,
  keeps pale crayon) → dilate → 112-grid nearest sample → flood the outside so
  enclosed white is belly, not hole → 3-4 chamfer distance → two-sided pillow
  mesh with shared boundary verts (watertight) → 7 laplacian smoothing passes →
  textured both sides with the drawing itself (three.min.js r147, vendored,
  same copy as dewball/slice-3d).
- **Field guide is offline but really looks at the drawing**: dominant color,
  bbox tallness, leg count (mask runs near the bottom), spikiness
  (perimeter²/4πA) and coverage seed the name, species, personality and first
  fun fact. FNV hash of the silhouette + hues seeds a mulberry32 rng, so the
  same drawing always births the same critter.
- **Procedural clips** (no skeleton): idle breathe/sway, waddle walk on a
  circle, hop, munch squash, nap with 💤, tap-for-a-twirl, plus an idle brain
  (left alone it strolls, bounces, and eventually naps).
- **Nursery**: localStorage (`cac_nursery`, cap 30), stores the 512px drawing
  PNG; reopening re-runs the pipeline so nothing but the drawing is stored.
  Care (tummy/happy) decays gently while away and floors at 15 — a returning
  kid must NEVER find a sad creature (kid-safety rule inherited from the
  sibling repo; keep it).
- Print keepsake card (`#printCard` + @media print), WebAudio chirps with mute,
  rename via tap on the name.

## Aug 15 buildout (v=20260815c)
- **Berry Picnic** mini-game: buddy scampers under falling berries (drag to
  aim), 45s, no fail state (misses just poof), celebration + confetti + best
  score (`cac_berry_best`). Lane width is computed from the camera frustum at
  the buddy's depth minus its half-width so it can never leave the frame.
  Earns +2/game via _sbCapEarn.
- **Dress up**: party hat / crown / bow / flower as three.js primitives perched
  on the top-band CENTROID of the mesh (single-highest-vertex put the crown on
  a mane wisp). Saved per critter (`acc`).
- **Hatch moment**: wiggle → crack → confetti → "It's… NAME!" reveal.
- **Easel**: rainbow crayon (hue cycles along the stroke) + stamps (googly eye,
  star, heart, spot — star/heart/spot tint from the selected color).
- **Real-time sky**: dawn/day/dusk/night gradients by actual hour; night gets
  stars + fireflies, darker lights and ground, easier naps, and light-colored
  meter text. `applySky` re-checks every 5 min.
- **Photo button**: downloads a PNG snapshot of the buddy.
- Meadow friends (up to 2 nursery critters visit), size-pitched voice, easel
  clears after each birth.

## Aug 15 playtest round (Penny + Jessie feedback, v=20260815d)
- **Big pad + zoom**: tools compressed to two scroll strips (undo + zoom
  pinned, always visible), the canvas takes every remaining pixel. Pinch to
  zoom/pan or tap 🔍 (steps to x4); a second finger landing mid-stroke undoes
  that stroke so palms never scribble. Drawing math is transform-proof
  (getBoundingClientRect on the scaled canvas).
- **Fill deselects itself** after one pour.
- **Texture brushes** (fluffy/furry/shiny/sparkly): low-alpha patterned dabs
  that ONLY land on already-painted pixels (checked against a stroke-start
  snapshot) so texture can never grow the silhouette or speckle the paper.
- **LIVING FACES**: stamped eyes/mouths are tracked (`FEATS`, persisted per
  critter as `feats`), erased from the skin at build time (patched with
  nearby body color) and replaced with real 3D features projected onto the
  front surface via the pillow geometry's projector: eyes blink on a
  scheduler and their pupils wander; the mouth smiles, opens wide during
  munch, grins on happy/spin, and relaxes in sleep. Meadow friends get
  their faces too. Undo snapshots include the feature list.

## Aug 15 sticker book round (v=20260815e)
- **STICKER BOOK**: 36 code drawn canvas stickers in 4 flyout groups (Face:
  4 eye styles / smile / lips / grin / fangs / shark teeth / noses / 3 ear
  kinds / antenna / freckles / wrinkles · Extras: top hat, cap, glasses,
  monocle, flower, ascot, pocket square · Parts: wing, tail, unicorn horn,
  curved horns, centipede legs, spikes · Shapes: spot, star, heart, moon,
  bolt, ring). Previews self-render from the same draw fns; tintable
  stickers take the selected color (white falls back to a per-sticker
  default); asymmetric stickers auto-mirror by canvas side. The flyout
  closes when anything else is tapped, incl. stamping. Pen-size click
  deselects stickers/textures. Fill icon is a paint drop (SVG). Zoom out
  button always visible.
- Live features grew: eyeIris carries its color into a real 3D IRIS.
  ⛔ Anything added inside the eye group must PROTRUDE past the ball
  (offset + radius > r3) or the white sphere swallows it. Eyes/mouth
  lookAt a viewer-ish point so sloped head placement can't hide pupils.
  Erase-patch color = average of BRIGHT ring samples only (a dark outline
  sample used to smear ink over the patch).

## Aug 15 bone machine round (v=20260815f)
- **THE BONE MACHINE** (`buildRigData`): real joints, no API. The fattest
  chamfer region is the torso core; every remaining mask component is a
  limb lobe; each lobe gets a two-bone chain (attachment → BFS midpoint →
  tip), classified leg / top / side by direction from the core. Vertices
  are weighted procedurally by BFS-distance along their lobe (root blend
  near the attachment) into a THREE.SkinnedMesh — no bone-heat solver,
  nothing to fail; blob drawings with no lobes fall back to the unrigged
  mesh. The gait driver swings legs alternately (phase by x-order) in
  walk/berry, tucks them in hops, flaps side lobes (rotation.x) when
  happy, droops everything in sleep, sways tails and ears at idle.
- **Mark-your-own face** (👀 Face button): tap your drawn eyes and mouth
  on the drawing; that exact art is lifted off the skin as circular
  cutout meshes (skin patched underneath) that blink, wobble, and open
  when munching. Replaces stamped features; persists like them.
- Inflation plumped (PLUMP 0.85 → 1.0) so bodies read rounder.

## Aug 15 Jesse round (v=20260815g)
- Toolbar is TWO fully-visible rows (nothing hidden in scroll): undo /
  REDO (new) / zoom in / zoom out / fill / rainbow / eraser, then size +
  the five flyout groups incl. the new 🎨 texture menu with drawn
  swatch previews (textures were undiscoverable at the end of a scroll
  strip — Jesse never found them).
- 🕺 Dance: toggle state with its own WebAudio groove (140ms step
  scheduler), body twist + hop choreography and a rig routine (legs
  kick, side lobes flap); button flips to ⏹ Stop.
- Feeding shows the picked food flying to the mouth before the munch;
  cuddling floats hearts.
- Berry Picnic: ✖ quit button in the HUD (ends with the celebration and
  whatever you caught — never a fail), and the critter plays at 0.55
  scale with a tighter catch window so it is a real game.

## Aug 15 games round (v=20260815h)
- Play button opens a GAME MENU: Berry Picnic + Snack Toss (flick snacks
  into the wandering critter's mouth, 12 snacks, streak-of-3 = golden ×3,
  launch from under the finger). Shared HUD/celebration, both quittable.
- 🎪 Critter Parade from the nursery: up to 6 of your critters march
  (facing the crowd — edge-on a pillow vanishes) and dance to the groove.
- Critter Pal rail shipped: see GAMES-PLAN.md.

## Aug 15 nests round (v=20260815i)
- **10 free nests** (mirrors the greenhouse's 10 starting slots). Nursery
  title shows n/cap. At cap, Bring to Life is blocked by a friendly
  full-nursery overlay — the old silent oldest-critter eviction is DEAD
  (silently deleting a kid's creation was a bug, not a cap).
- **Set free = balloon send-off** (🎈 on every nursery card): confirm
  card is honest ("cannot come back") but joyful; the card floats off on
  a balloon. Never sad, never the word delete.
- **Monetization (recorded, not wired)**: extra nests are the natural Pi
  purchase, mirroring greenhouse slot expansion (1 Pi/slot). The
  purchase credits `cac_extra_slots`; `slotCap()` already reads it. DO
  NOT wire a buy button until the studio-wide Pi SDK rail exists — the
  full overlay says "coming to the Sky Wolf shop soon" and nothing more.
  Legacy nurseries over 10 are grandfathered (blocked from new mints
  until they free below cap, nothing evicted).

## Aug 15 stitch pivot (v=20260815j) — ⛔ THE AUTO-RIG IS RETIRED
Stephen's verdict on the automatic lobe rig: it warped detailed drawings
badly (weights aliased across cells, everything swayed at idle, and the
group-anchored eyes sat still while the mesh deformed under them). The
pivot, per Stephen + Jesse: STOP GUESSING, hold their hand, make the
seams the aesthetic.
- **No limbs marked = no skinning.** A plain plush that breathes and hops
  always looks right.
- **🪡 Stitch Studio**: drag along each limb (attachment → tip), name it
  (leg / wing-arm / tail / ear), and a sewing needle stitches every seam
  with thread sounds before the critter is rebuilt. Limbs persist
  (rec.limbs), friends and parade members use them.
- **Capsule weights**: smooth falloff around the marked segment, limb
  influence faded to zero at the attachment (the body side of a seam
  NEVER moves), two adjacency-diffusion passes, top-3 influences kept.
  Stitch seams (dashed thread + cross stitches) are drawn onto the skin
  at every attachment — the plushie look is now intentional.
- Idle is calm: legs planted, tails wag, ears flick occasionally, wings
  barely breathe. Hatch gained a "Stitching it together…" beat.
- buildRigData (the old guesser) is dead code kept for reference.

## Aug 15 guided builder + freshness (v=20260815k, BUILD k1)
- **⛔ STALENESS ROOT CAUSE FOUND**: the host serves
  `cache-control: max-age=300, stale-while-revalidate=86400`, so on a
  rapid-deploy day players get yesterday's page instantly while the
  refresh happens in the background — Stephen tested three versions
  behind and concluded features were missing. The page now carries a
  BUILD sentinel: it fetches its own source (no-store) after load,
  compares BUILD, silently reloads on the home screen or shows an
  update pill mid-play. Keep BUILD in sync with the card ?v=.
- **Guided builder** (default for every Draw): Step 1 draw the body →
  Step 2 give it a face (eye stamp auto-armed) → Step 3 draw each limb
  in a SINGLE stroke starting on the body, then answer "What did you
  just add?" (leg / wing-arm / tail / ear / just drawing). Named limbs
  become jointed and get sewn at hatch. Trash can restarts the wizard.
  Awkwardly built walkers are a feature, not a bug.

## Aug 15 engagement suite (v=20260815l, BUILD l1)
- **Daily rituals**: `cac_bond` days-together (only counts UP, gold line
  under the name), welcome-back celebration on a new day, morning yawn
  before 11am, 🌙 Tuck in at dusk/night (blanket mesh + lullaby, wake
  button), and LEARNED HABITS: dance on 3 different days and the critter
  learns it and shows off on arrival (per-critter, persisted).
- **Daily wild visitor**: a seeded scribble is generated through our own
  pipeline (wobbly body, legs/tail/ear limbs, googly eyes — all fed to
  buildCritterMesh so it is fully alive) and peeks in from the meadow
  edge with a 🐾 Visitor! badge. Feed it on 3 different days → it asks
  to stay → adoption needs a free nest (drives the nest economy). New
  visitor after each adoption. Zero network, zero storage beyond one
  seed + fed-days list.
- **Playdate** (nursery 🤝): pick two critters; they run to each other,
  nuzzle with hearts, play chase, and dance together to the groove.
- Home screen shows "a wild critter is visiting" when unfed today.

## Aug 15 world round (v=20260815m, BUILD m1)
- **Seasonal meadow**: real calendar drives DOM particles — spring petals,
  summer dandelion fluff (daytime; fireflies own the night), autumn
  leaves, winter snow with a whitened ground. Paused during games and
  indoors.
- **Mystery eggs → companion bugs**: strong Berry Picnic (≥10) or Snack
  Toss (≥7) rounds have a 50% chance of leaving an egg (once per
  critter). Hatches a tiny generated bug buddy (seed persisted as
  rec.bugSeed) that hovers beside the critter forever.
- **Coloring page**: 🖨️ now opens a menu — keepsake card or a
  black-and-white outline extraction of the drawing ("Color me in!"),
  print-ready.
- **THE ROOM** (🛋️): a second full-easel drawing becomes the critter's
  home — textured back wall, floor auto-tinted from the drawing's
  bottom edge, warm indoor light, cozy CSS backdrop. Bed marking makes
  tuck-in happen at the bed. Toggle inside/outside, redraw anytime.
  Friends/visitor/seasons stay outdoors; the bug buddy comes inside.
  Room edit saves/restores the easel and never creates living-face
  records.

## Aug 16 audit round (v=20260816a, BUILD n1) — read AUDIT-NOTES.md
Full audit of the shipped browser edition, then fixes worst first. Headlines:
- **No path can strand the player any more.** Every stored drawing goes
  through one `loadDrawing()` with an `onerror` and an honest message; a
  missing `THREE` or a refused WebGL context is caught instead of freezing
  the hatch screen; `readSilhouette` returning null is a message, not a
  shrug.
- **A save that fails says so.** `lsSet`/`jSet` report, and a full quota
  raises an overlay instead of quietly losing a kid's critter.
- **`saveNest()` merges** (two tabs no longer clobber each other), bests go
  through `lsMax`, days together only counts up.
- Leaving the room easel by the back arrow used to hide the bring to life
  button forever AND save the next critter drawing as wallpaper. Fixed.
- Picking a color left a sticker armed with nothing looking selected. Fixed.
- 🎲 **Surprise me** rolls a whole creature onto the easel (the visitor
  generator, now with body families, patterns, horns, wings and 16 colors).
- 🖌️ **Redraw** reopens a critter's own drawing for changes and rebuilds it.
- Palette is 2 sets of 12 with a visible swap button; 48px touch targets;
  no dashes in player copy.
- ⛔ Verify with `node check.js --selftest` and `node boot-test.js --selftest`
  (nine static checks plus a stub DOM boot; both watched failing first).
- ⛔ BUILD is `n1`. Bump the portal card `?v=` to match on deploy.

## Studio wiring

- sws bridge: `{sws:'ready'}` at parse + load when framed, exit posts
  `{sws:'close'}`; standalone exit follows the hues fleet pattern.
- Earns: `_sbCapEarn` (30/day cap): +6 first critter ever, +4 per
  bring-to-life.
- Card URL is versioned (`?v=`): bump it on every deploy (host caching law).

## Safety posture

No moderation gate exists in the browser edition because nothing leaves the
device: the drawing, the critter, and the nursery are localStorage on the
kid's own machine. If sharing/upload is ever added, a moderation gate must be
added FIRST (see sibling repo's CLAUDE.md kid-safety rules).
