# Rabbit Ronin — background art drop-in (for Stephen)

The game draws procedural silhouette backdrops per world. Your painted art
replaces them the moment the files exist; no code changes needed.

## Files (put them in this folder, under `assets/`)

| File | World |
|---|---|
| `assets/bg-crate-far.png` + `assets/bg-crate-near.png` | The Crate Yards |
| `assets/bg-burrow-far.png` + `assets/bg-burrow-near.png` | The Burrows |
| `assets/bg-grove-far.png` + `assets/bg-grove-near.png` | The Grove |
| `assets/bg-peak-far.png` + `assets/bg-peak-near.png` | The Peaks |

Any missing file keeps the procedural fallback for that layer, so you can
deliver one world (or one layer) at a time.

## Spec

- **Size:** 1080 x 640. Wider is fine; it tiles horizontally.
- **Transparent sky.** The PNG's transparent area shows the world's sky
  gradient behind it.
- **The bottom edge of the image sits at ground level.** Paint the horizon
  and silhouettes rising from the bottom edge.
- The image must **tile seamlessly left to right** (it scrolls with
  parallax: far layer at 0.16x camera speed, near at 0.42x).
- Far layer reads best as large, soft, dark shapes. Near layer can carry
  more detail; it draws over the far layer and behind the platforms.
- Palette anchors (the sky each world already has):
  - Crate Yards: mossy greens on near-black (#20351c sky top)
  - Burrows: warm browns (#241a12)
  - Grove: deep forest greens (#16301e)
  - Peaks: cold blue night (#1b2940)

After adding files, hard-refresh with a new `?v=` or bump the portal card.
