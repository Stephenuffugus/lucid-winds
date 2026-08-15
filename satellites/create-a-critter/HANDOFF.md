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
