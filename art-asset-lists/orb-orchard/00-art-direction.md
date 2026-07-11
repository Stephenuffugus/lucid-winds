# Orb Orchard — Art Direction

**Game:** `satellites/orb-orchard/index.html` — Blue Spheres homage. Auto-run walker on a
32×32 wrapping checkerboard world that curls away beneath you (curved-horizon projection),
tap-to-turn at tiles, jump hops two. Gather every **dew orb**; **thorns** end the run;
**sunbeads** are optional (all = PERFECT); silver **bumpers** bounce you, green **springs**
throw you three tiles; walk a closed ring of dew around others and the sealed dew converts
to sunbeads in one burst. 12 handmade stages + Daily Sphere + Zen Stroll + Blitz.
Wardrobe: 3 runners × 3 floor palettes × 3 skies. Grove gallery grows a tree per clear and
presses a golden bloom per perfect.

**What ships today (all engine-drawn, zero image assets):** internal 270×410 canvas
upscaled ×2 with `image-rendering:pixelated`. Sky = 3-stop gradient + glow disc + procedural
star specks (`SKIES`). Ground = projected flat-color quads (`PALS` ca/cb checker, reda/redb
once walked, distance-fogged toward the sky mid color). Pickups = `drawOrb()` vector circles.
Runner = `drawRunner()` ellipses at a fixed screen spot. Grove = procedural canvas trees and
blooms. Everything else is DOM/CSS with emoji icons. Fully playable without this pack.

---

## Style options (pick one; sheets 01-05 bake the pick)

### Option A — CHROME HORIZON (RECOMMENDED, non-botanical)
The 90s Sega special-stage, grown up. A lacquered candy-chrome checkerboard planetoid
rolling under a huge airbrushed gradient sky; dew orbs as polished glass spheres, sunbeads
as burnished gold rings, thorns as garnet caltrops, bumpers as arcade chrome. Saturated
jewel colors over deep dusk blues, bright speculars, clean rounded silhouettes. Catchy and
kid-friendly with zero garden dressing — the "orchard" is a place you run, not a plant
catalog. Palette anchors come straight from the live code so no engine retune is needed:
floor 79B356/3F5C2F · 6874C4/363C6E · D69654/7A4A2A; skies 0A1230/27406E/C8A84B,
180A2C/4A286E/E58FA0, 061A1E/1E5A54/BFE0F2; dew 8FC4EC; gold E2B34D.

### Option B — MARBLE ORRERY (non-botanical)
Victorian observatory instrument. The world is a polished brass-and-enamel orrery globe;
dew orbs are glass marbles, sunbeads are engraved brass rings, thorns are iron burrs, the
skies are star charts and aurora seen through observatory glass. Mature, museum-case,
gorgeous stills — but heavier surfaces read slower at speed on a phone, and it overlaps
Brass Nightreel (Seed Reel) territory.

### Option C — LANTERN ORCHARD (botanical fallback, NOT the pick)
Moonlit orchard rows, paper-lantern glow, dew on branches — the classic Lucid Winds house
look. Listed only as the portal-cohesion fallback; skipped by default per the standing
no-garden-themes rule.

**Recommendation: A (Chrome Horizon).** It is the genre's native costume (Blue Spheres WAS
candy-bright arcade), it keeps motion clarity at the game's top speed, it reuses every hex
already in `PALS`/`SKIES` so the art drops onto the live renderer without retuning, and no
other pack in the catalog owns the glossy-arcade-planetoid space. The game keeps its name.

---

## STYLE BLOCK (baked into every sheet prompt below — Option A)

> Chrome Horizon style: glossy 90s arcade special-stage art, candy-lacquer and polished
> chrome surfaces with bright specular highlights, airbrushed gradient light, saturated
> jewel colors over deep dusk blues, clean rounded game-asset silhouettes readable at 24
> pixels, soft ambient occlusion, no text anywhere, flat magenta FF00FF background for
> knockout.

⚠️ Magenta knockout: keep every subject color at least 25% away from pure #FF00FF (the
Twilight walked-tile rose C46E96 and Nebula glow E58FA0 are the closest — keep them muted,
never hot pink) or the cutter will eat it. Cut via magenta-KEY-distance, NOT hue.

---

## Cosmetics / economy recap (verified vs live code — `WARD`, `RUNNERS`, `PALS`, `SKIES`, `payRun`)

| Lane | Item | Unlock (from code) |
|---|---|---|
| Runner | Seedling | free |
| Runner | Firefly | clear 6 stages |
| Runner | Comet | 3 perfects |
| Orchard floor | Meadow | free |
| Orchard floor | Twilight | daily streak 3 |
| Orchard floor | Ember | clear 9 stages |
| Sky | Dawn | free |
| Sky | Nebula | clear all 12 |
| Sky | Aurora | 5 perfects |

No purchases, no lootboxes. Grove keeps max 24 golden blooms. Sunbeams: stage first-clear 2 /
replay 1 / perfect +1 / daily 3 / blitz 1; 12 per run, 30/day cap (`sw_sb_orborchard`).

## Sheets

| # | File | Contents |
|---|------|----------|
| 01 | `01-orborchard-runners.md` | 3 runners × run A / run B / jump + wardrobe medallions |
| 02 | `02-orborchard-orbs-tiles.md` | Dew, sunbead, thorn, bumper, spring + floor/walked swatch medallions + sun disc |
| 03 | `03-orborchard-skies.md` | Dawn / Nebula / Aurora sky panels + title hero panel |
| 04 | `04-orborchard-fx.md` | Seal burst frames, collect sparkles, hit/bounce/launch/jump puffs, speed plate, perfect burst |
| 05 | `05-orborchard-ui.md` | HUD chip, dock pads, 4 mode plaques, clear/perfect medallions, grove keepsakes, frames |

## Wire notes (against shipped code)

- **Resolution:** renderer is a 270×410 internal canvas shown at 540×820 with
  `image-rendering:pixelated`. Author cells at 256px, downscale at wire time; the ×2
  pixel-snap upscale keeps the arcade chunk. Ship any full-bleed panel at 540×820 JPG
  ≤150KB (host resizes >1600px — stay under).
- **Pickups (DROP-IN after tiny patch):** `drawOrb(code,x,y,r)` draws vectors per grid code
  (`E_DEW/E_THORN/E_RING/E_BUMP/E_SPRING`). Swap = per-code `drawImage` centered at (x,y)
  scaled to r; r runs 1.1 up to ~60px internal near the camera, so 256px sources hold up.
  Engine ellipse shadow underneath stays.
- **Floor tiles are NOT texture-mappable:** checker quads are perspective-projected polygons
  filled with flat `PALS` colors and distance-fog mixed toward `SKY.mid`. Sheet 02's floor
  cells are wardrobe card art + palette anchors (DOM-only), not mapped textures. A UV-mapped
  floor would be a real engine rewrite — out of scope.
- **Skies (DROP-IN):** draw the cut panel in `render()` before the quad pass, keyed by
  `PROG.sky` (`SKIES` keys dawn/nebula/aurora); keep the lower third dark enough that orbs
  and the gold HUD stay readable. Engine glow disc + stars can then be skipped.
- **Runner (PATCH-REQUIRED):** `drawRunner()` paints vector ellipses at internal (135,352)
  with bob/jump offsets. Sprite swap = `drawImage` ~48×56 internal keyed by `PROG.runner`
  (`RUNNERS` keys seedling/firefly/comet), keep the engine shadow. Until patched, sheet 01
  medallions replace the `.wcard` emoji (🌱🪲☄️) — DOM-only, zero engine change.
- **Grove (PATCH-REQUIRED):** `renderGrove()`/`drawKeepsake()` paint procedural 90×110
  canvases; sheet 05 tree + golden bloom art can replace them via `drawImage`, seed-varied
  by tint. Optional — procedural grove is charming as-is.
- **UI (DROP-IN):** screens, chips, dock pads, level cards, wardrobe cards are pure DOM/CSS.
  All sheet 05 art wires as CSS `background-image`; engine text (stage names, counts,
  `✦`/`✿` marks, SPEED UP text) stays on top, so every plate must be text-free and quiet
  in its center.
