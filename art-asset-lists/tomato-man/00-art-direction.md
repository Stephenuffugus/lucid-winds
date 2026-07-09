# Tomato Man — Art Direction

> A little produce hero survives the beach by hiding from a hungry sun — sunlight is death, shadow is the only ground, and you collect aloe and adorable hats along the way.

**Genre:** Top-down arcade survival / shadow-runner (dodge the sun, ride the shade) with a produce-mascot cosmetic-collection meta

## Pick a look (kid-friendly options)

### 1. Sun-Baked Vinyl (RECOMMENDED) — *polished* ⭐ RECOMMENDED
Premium soft-3D collectible-toy render — the produce heroes look like glossy-matte designer vinyl figures / stop-motion clay characters, each a smooth rounded volume with a faint subsurface glow, sculpted by soft studio light: a warm golden key from upper-left and a cool blue-violet beach-shade underside. Buttery gradients, soft ambient occlusion, one crisp specular hotspot and a thin navy edge-darkening instead of a hard cartoon outline. Reads as a step up from sticker-book paper-craft into a premium mascot-collection look while staying 100% cute and kid-friendly — perfect for a game whose whole meta is collecting produce characters and hats.

### 2. Sunny Vector Pop — *cozy*
Clean modern flat-cartoon vector: bold simple shapes, confident 3px navy outlines, 2-tone cel shading (core color + one warm highlight + one cool shade), fully saturated coastal palette. The safest possible read at 16–48px and the lightest files — every sprite is a crisp graphic silhouette. Friendly, snappy, mobile-native mascot energy; the low-risk fallback if the vinyl gradients ever feel too heavy.

### 3. Golden-Hour Screenprint — *retro*
Limited-ink beach-poster / risograph look — 3-4 spot inks per subject (sun-gold, tomato-red, teal-shade, cream), soft halftone grain, slight mis-registration charm, and bold graphic sun-ray motifs. Stylish and a little grown-up like a vintage travel poster, still bright and playful. Great personality but the grain fights readability at the smallest sprite sizes, so it's the character pick rather than the default.

**Recommended: Sun-Baked Vinyl (RECOMMENDED).** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-sheet-hero-bodies.md` — Sheet 1 — Hero Produce Bodies (faceless character builder)
- `02-sheet-hats.md` — Sheet 2 — Hats & Headwear (cosmetic overlays)
- `03-sheet-props.md` — Sheet 3 — Sun, Pickups & Props
- `04-sheet-logo.md` — Sheet 4 — Title Logo

## Style block (baked into every sheet prompt here)

```
STYLE — "Sun-Baked Vinyl": premium soft-3D collectible-toy render, like glossy-matte designer vinyl figures and stop-motion clay characters. Every subject is a smooth rounded volume in satin-matte vinyl/silicone with a gentle subsurface warmth (light glows faintly through fruit skin), sculpted by soft studio lighting — ONE warm golden key light from the upper-left (sun-gold #ffd23f / #ffb03a) giving a small crisp specular hotspot and a warm rim, and a cool blue-violet fill/shade underneath (#4a5e86 / #37507a) that reads as beach shadow. Forms are chunky, friendly, and beautifully clean: NO paper texture, NO stitching, NO visible brushstrokes — just buttery gradients, soft ambient occlusion where shapes meet, and a subtle grounding darken baked into the lower rim. Bold confident silhouettes finished with a THIN soft dark-navy #23314a edge-darkening (a gentle contour, not a hard cartoon outline) so each piece pops on any background. Coastal-sun palette: sand #e6c074 / #f4dca6, sun-gold #c8a84b / #ffd23f, cream #e8dcc8, tomato-red #e8332a, rose #e58fa0, cool shade #4a5e86, aloe sage #7ab356, ice-blue #37b6e0, navy ink #23314a. Mood: warm, sunny, appetizing, premium-cute — polished and a touch more grown-up than sticker-book art, but strictly kid-friendly (no gore, nothing scary, no sexualization, no text). Keep every shape simple and readable as a clean silhouette at 16–48px on screen — bold core color, one highlight, one shade — so each cropped sprite still reads instantly and compresses under 150KB as a PNG. No photorealism, no busy micro-detail, no borders, no captions, and no UI words unless a cell explicitly names exact logo text.
```

## Wire notes

Cut each sheet into individual transparent PNGs (knock out #FF00FF). Recommended folders next to Tomato_Man/index.html: art/hero/, art/hats/, art/props/, art/ui/ (matches existing ART-NEEDED.md convention). ASSET_PATHS currently (index.html line 431) only holds hero_body + logo; extend it with per-key paths and add an A(key) image guard in each draw call (A() is defined at line 438 but never called — every hero/prop/sun/pickup draw is currently pure canvas primitive). Key map: bodies -> hero_<id> for ids tomato,strawberry,orange,lemon,lime,peach,cherry,bellpepper,eggplant,avocado,heirloom,pickle,golden,sunburn (COSMETICS body ids, index.html 495-508); hats -> hat_<id> for sunhat,cap,sombrero,lettuce,visor,umbrella,crown,shell_crown,cone_hat,cool_shades,gem_crown,eclipse_halo (511-523); props -> sun, sun_angry, aloe, popsicle, collect_shell, collect_cone, collect_gem, cloud, exit_flag, checkpoint; logo -> logo. Draw hooks: hero body in drawHero (line 1085) + drawBuilderPreview (1285) — KEEP the procedural face/blush/expression/sweat and the hat drawn on top (that is why hero cells are faceless/hatless; a baked face double-draws). Hats in drawHero hat-kind branch (1122-1128) + drawHatExtra (1165) + builder (1294+). Sun/angry-sun in sunToken (1183) — NOTE the rotating rays are procedural strokes drawn over the core, so the sun sprite should sit under them or the baked rays should stay soft/short to avoid a double-ray look (or drop procedural rays when a sprite is present). Aloe in the beams loop LIT branch only (1026-1035); the dormant/shade bud stays procedural. Popsicle (1020), collectibles via drawFindIcon by collectOf().kind (1141), cloud (992-994), exit flag (1046-1049), checkpoints ACTIVE state (1041-1043; dormant ring stays procedural). Leave procedural (do NOT author): R/U casters (width-stretched awnings + tilt-rotated umbrellas), per-world scrolling sand ground, hot-sand/shade/wilt overlays, dash-trail particles. All 5 world palettes live in WORLDS (536-546) if a per-world reskin is ever wanted, but the sprites above are world-agnostic. Verify each cut PNG stays under 150KB and the lucidwinds.com host does not resize (keep long edge <=1600px final).

