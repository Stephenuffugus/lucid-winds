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

## The Meshy lane (optional, costs credits)

Procedural covers all 112, so nothing is blocked on Meshy. If a hero part
deserves sculpted detail: Meshy image-to-3D takes the cut singles from
`assets/parts/_raw/` (one part, transparent ground, three-quarter light —
exactly what it wants). Best candidates are the Relic cores (bell, magpie,
flint, millst) whose painted emblems are real objects. Retopo to the tri
budget and re-run the validator on the result; a Meshy mesh that misses
the mount is a bug like any other. Don't batch-spend credits on stock
parts a procedural mesh already covers.

## Not built yet

- 6 launcher meshes/skins (400 tris each; only ever seen on the wind screen)
- 4 stadium dishes (Chalk Ring, The Posts, Taya Circle, Long Range) — the
  floor TEXTURES are on the ChatGPT support-art list; the dish geometry,
  rail trim, pocket lips, dust card and shadow catcher are forge work
- decal masks / trail ramps: already live in-game as drawn cosmetics;
  painted 256px masks are on the ChatGPT list
