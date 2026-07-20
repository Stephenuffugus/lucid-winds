# Sheet 10 — Seedpods + Chaff (the falling pieces)

The playing pieces. Right now the pods are drawn procedurally (neon spray-throwie
spheres with a colorblind tag-shape + googly eyes). Stephen wants real art for the
pieces to match the board/crew. This sheet skins the **pod BODY** (sphere + tag emblem
+ shading + glow). The engine keeps drawing the **eyes + smile on top** so pods still
gaze toward their same-color neighbors — so **do NOT paint eyes or a mouth on these**,
just the throwie body with its emblem. Cut-ready on magenta.

The five pod colors + their colorblind tag-shape are FROZEN (they match `PAL` and
`podGlyph` in `satellites/chaff-wars/index.html` — do not change hue or shape, they're
the colorblind aid):

| # | Name | Hue (base / light / dark) | Tag-shape emblem (centered, upper area of the sphere) |
|---|---|---|---|
| 0 | Crimson / Redline | `#ff3b3b` / `#ff8a72` / `#b01818` | an 8-point STAR |
| 1 | Sprout / Toxic | `#3be04a` / `#9fff6a` / `#1e8e2e` | a CHEVRON (downward arrowhead) |
| 2 | Dewdrop / Ice | `#2e8bff` / `#8fc8ff` / `#1550b0` | a DROPLET (teardrop) |
| 3 | Sunbean / Voltage | `#ffd21a` / `#ffe97a` / `#b88a00` | a lightning BOLT |
| 4 | Nightshade / Ultra | `#c24bff` / `#e0a6ff` / `#7a1fc0` | a DIAMOND (rhombus) |
| — | Chaff (grey garbage) | `#7a7a70` / `#9a9a90` / `#4a4a42` | a cracked/crusty grey lump, NO emblem, NO glow |

## Sheet layout

Generate the whole sheet at **2048x2048**, a strict **4 columns x 4 rows** grid of
identical **512x512** cells (equal margins/gutters so a fixed-pitch cutter slices it
blind). Pure flat **magenta #FF00FF** knockout fills every cell and all gutters. Each
sprite is centered in its cell, drawn BIG (it fills ~78% of the cell) so it downscales
crisp to a ~58px board cell. Nothing touches a cell edge; keep rim-light/glow off pure
`#FF00FF`.

Row assignment (top to bottom):
- **Row 1 — Pods, idle bodies:** `pods/pod-0` (Crimson star) | `pods/pod-1` (Sprout chevron) | `pods/pod-2` (Dewdrop droplet) | `pods/pod-3` (Sunbean bolt)
- **Row 2 — Pods, idle bodies:** `pods/pod-4` (Nightshade diamond) | `pods/chaff` (grey lump) | (blank) | (blank)
- **Row 3 — Pop burst, Crimson (4-frame anim, tint-neutral WHITE so the engine can recolor):** `pods/pop-1` | `pods/pop-2` | `pods/pop-3` | `pods/pop-4`
- **Row 4 — Chaff shatter (4-frame anim, grey):** `pods/chaffbreak-1` | `pods/chaffbreak-2` | `pods/chaffbreak-3` | `pods/chaffbreak-4`

(Rows 3-4 are OPTIONAL polish — the game already has a pop-splat FX from sheet 9. If
you only want the pod bodies, generate rows 1-2 and leave 3-4 flat magenta.)

## STYLE — "Neon Boombox" (paste the locked style block from 00-art-direction), plus:

Each pod is a **fat spray-paint throwie**: a glossy neon sphere with a THICK black comic
outline, neon airbrush shading (bright specular highlight upper-left, deep saturated
core, darker rim lower-right), a soft spray-glow halo in its own hue, and subtle halftone
dots. Dead-center-upper on the sphere sits its **tag-shape emblem** in the LIGHT tint,
with its own thin black keyline — like a sticker slapped on the throwie. The emblem reads
instantly at thumbnail size. Wet, juicy, bubbly, kid-friendly. **No eyes, no mouth, no
face** (the engine paints those). Chaff is the opposite: a dull matte grey crusty lump,
no glow, no emblem, cracked concrete texture, thick outline — it should look wack and
unwanted next to the fresh neon throwies.

## Assets

- **pods/pod-0** — Crimson throwie, `#ff3b3b` body with `#ff8a72` highlight and `#b01818`
  rim, an 8-point STAR emblem in `#ff8a72` upper-center, hot spray glow.
- **pods/pod-1** — Sprout throwie, `#3be04a` / `#9fff6a` / `#1e8e2e`, a downward CHEVRON emblem.
- **pods/pod-2** — Dewdrop throwie, `#2e8bff` / `#8fc8ff` / `#1550b0`, a DROPLET emblem.
- **pods/pod-3** — Sunbean throwie, `#ffd21a` / `#ffe97a` / `#b88a00`, a lightning BOLT emblem.
- **pods/pod-4** — Nightshade throwie, `#c24bff` / `#e0a6ff` / `#7a1fc0`, a DIAMOND emblem.
- **pods/chaff** — grey wack lump `#7a7a70` / `#9a9a90` / `#4a4a42`, cracked crusty edges,
  matte, no glow, no emblem. Colorblind-neutral on purpose.
- **pods/pop-1..4** — a 4-frame white paint-splat burst (pure white + light grey, thick
  outline, NO hue) so the engine tints it to the popped pod's color at runtime: frame 1 a
  tight star-splat, 2 a full ragged burst with flying droplets, 3 a gooey blob with drips,
  4 a fading mist of dots. (Optional — sheet 9's pop-splat already covers this.)
- **pods/chaffbreak-1..4** — a 4-frame grey shatter: frame 1 the lump cracking, 2 splitting,
  3 crumbling to chunks, 4 a puff of grey dust. Matte grey, no neon. (Optional.)

## Wiring (already scaffolded — this is DROP-IN)

Cut to `satellites/chaff-wars/assets/pods/pod-{0..4}.png` + `pods/chaff.png`. The engine
already has a gated hook: flip `CW_POD_ART=true` in index.html once the files land, and
`drawPod`/`drawChaff` use the sprite body behind an image-loaded check (procedural bodies
stay as the permanent fallback), with the eyes/gaze/smile still drawn on top. If the
sprite's body doesn't sit right on the cell, tune the single draw-box scalar noted at the
hook. Log LISTED -> DROPPED in `art-asset-lists/ART-LEDGER.md`.
