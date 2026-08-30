# RIPCORD — the 3D part forge

Phase J from the brief, built to the handoff in Stephen's Aug 30 package
(`RIPCORD_CLAUDE_3D_HANDOFF.md`). 112 part meshes, one common mount, a
validation report measured off the finished meshes, and renders that feed
the same art pipeline the painted parts use.

## Run it

```
node tools/forge3d/spec.mjs          # sim2.js -> spec.json (the stats)
blender -b --factory-startup -P tools/forge3d/build.py -- \
    --export --render --stack        # build + validate everything
```

Outputs:
- `assets/3d/<slot>/<id>.glb` — 112 meshes, ~2.3MB the lot
- `tools/forge3d/renders/<id>.png` — one lit render per part (not committed)
- `tools/forge3d/report.json` — triangles vs budget + mount checks per part
- `docs/shots-art/stack-proof.png` + `assets/3d/stack-proof.glb` — one fully
  dressed top at the nominal heights, the proof the mount is one mount

## The geometry is the stats

Meshes derive from THE SAME numbers the game draws from, so the mesh and
the canvas top cannot disagree:

| slot | rule | source |
|---|---|---|
| blade | teeth = round(3 + sharp×8); family: sharp>0.7 deep spurs, <0.3 continuous rim, else scallops; outer radius = catalogue mm; thickness from mass | drawTop, assets.js |
| assist | gearMul>1.3 knurl teeth, <0.7 polished band, else lobed neutral profile | assets.js |
| ratchet | the name IS the geometry: teeth-height. Teeth are countable on the ring; body = height÷10 mm | the brief |
| bit | dash>1.2 rail cogs, <0.5 sharp/narrow, else rounded; 12mm long, 9mm shaft | assets.js |
| weight | chip 2 / slug 3.5 / brick 5 mm slugs for the 3.5mm holes; the brick stands proud so a heavy build is visible at a glance | — |
| core | 10mm lock chip, recessed face (the painted emblem lives there), 3 bayonet lugs at the 8mm boss | the brief |

## The mount, and the one judgement call in it

All the source numbers cohere under one reading: **a bit is a fixed 12mm,
and a ratchet body is its named height over ten.** Then the reference
60-ratchet stack puts the blade underside at 12+6.0 = 18mm and the core
top at 26mm — exactly the source list's numbers — and a 90 ratchet raises
the strike plane 3mm, which is what the game says it does. Read literally,
"60mm" of ratchet under a blade whose underside is at 18mm cannot exist;
this is the resolution that keeps every other number exact. Flagging it
because the brief says heights are encoded in the name, "no cheating":
the TEETH are literal, the height is ÷10. Stephen's call if that's wrong.

Origins are the MOUNT FACE per part (blade: underside; core: seat;
assist/ratchet: top face; bit: top of shaft; weight: hole face), so a
renderer stacks parts by translating to the mount plane and a misplaced
origin shows up as a floating blade. Files are glTF standard +Y up, 1 unit
= 1mm. Weight holes are shallow inset rings rather than 4mm bores — an
honest 12-hole boolean costs triangles the 1200 budget does not have, and
the weight mesh stands proud so the pairing still reads.

## Materials and finishes

Every mesh uses stable material names: `lw_steel`, `lw_accent_stock`,
`lw_accent_forged`, `lw_accent_relic`, `lw_dark`, plus per-family bit
materials. The 8 finishes in `sim2.js FINISHES` are (metalness, roughness)
pairs — a runtime applies them by retinting `lw_steel`, no textures.

## Renders feed the same art pipeline

The 68 parts with no painted art (assists, ratchets, bits, weights — the
ChatGPT thread's scope is support art only, it is not painting these) get
their workshop pictures from the forge renders:

```
cp tools/forge3d/renders/{<the 68 ids>}.png assets/parts/_raw/
python3 tools/artcut.py
```

Renders NEVER default into `_raw/` (a render named like a painted part
would replace Stephen's art on the next --force cut). If Stephen later
paints one of the 68, his art wins: drop it in `_raw/` and cut that id
with `--force`.

## The Meshy lane (ready — Stephen drives Meshy, the forge does the rest)

Procedural covers all 112, so nothing is blocked on Meshy — but the 22
cores and 22 blades are the identity parts, and sculpts of the painted
art beat clean discs. The whole loop:

1. **Upload package**: `tools/forge3d/meshy-in.zip` — the 44 singles at
   1024px, one part per image, named `core-<id>.png` / `blade-<id>.png`,
   with the runbook inside as README.txt. Pilot 4 first (bell, moth,
   cleaver, orbit), then the other 40.
2. Stephen: Meshy → Image to 3D → default settings → **name the
   generation exactly like the file** → export GLB → zip them back.
3. `blender -b --factory-startup -P tools/forge3d/meshyfit.py -- --in
   <dir>` lays each sculpt flat (thinnest bounding axis is the
   thickness), scales it to the catalogue radius, puts the origin on the
   mount face, **machines the mount in** (16mm bore + boss annulus for a
   blade, bayonet lugs for a core), decimates, caps textures at 512, and
   validates dimensions. `--flip <ids>` for any that land face-down.

**Hero lane, deliberately:** a Meshy core decimated to the 300-triangle
budget is mush, so fitted sculpts land in `assets/3d/hero/<slot>/<id>.glb`
at a 5,000-triangle ceiling for cards and closeups. The in-budget
procedural set in `assets/3d/<slot>/` stays the game LOD. Same ids, same
origins, same dimensions — a renderer swaps them freely. The hardware
slots stay procedural on purpose: a ratchet's teeth must be countable,
which a generator cannot promise.

## Validation, as of 2026-08-30

`report.json`, measured off the finished meshes: **112 parts, 0 over
budget, 286/286 mount checks pass.** 46,540 triangles across the whole
catalogue (cores 5.2k, blades 18.6k, assists 9.6k, ratchets 6.3k, bits
6.7k, weights 132) — a fully dressed top runs ~1.5-2k, well under the
brief's 3.5k. Checks that failed along the way and were real: a scallop
rim 0.14mm short of the catalogue radius (a sampled trough is phase
luck — profiles are normalised now), and 13 parts over budget before
the segment trims. Checks that failed and were the CHECK's fault: bore
measured through the weight-hole hints, and two angle-gap tooth counts
that lied in both directions before the count became structural
(connected shells in the tooth band).

## Not built yet

- 6 launcher meshes/skins (400 tris each; only ever seen on the wind screen)
- 4 stadium dishes (Chalk Ring, The Posts, Taya Circle, Long Range) — the
  floor TEXTURES are on the ChatGPT support-art list; the dish geometry,
  rail trim, pocket lips, dust card and shadow catcher are forge work
- decal masks / trail ramps: already live in-game as drawn cosmetics;
  painted 256px masks are on the ChatGPT list
