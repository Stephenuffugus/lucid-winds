# RIPCORD, the arenas: an art asset list for eight worlds

> Drive copy (the prompts, for the phone): https://docs.google.com/document/d/1jVVHplyHfWm8x_ijQKjLlumPywxGOvgTnvIyEx-xAcs/edit  in 012Assets / newest request again. This file is the source of truth.

Sky Wolf Studio. Written 2026-09-03 against branch `add-sproing-jumper`.
Every number below was read out of the code on that day, with the file and
line it came from. If a line number drifts, grep the quoted symbol.

Stephen's brief: "i could create more worlds that the matches could be taking
place in to add a lot more depth." This list is what those worlds are, what
each one needs generated, and the one place in the code where a world gets
chosen. Prompts are copy-paste. Nothing in here touches the physics: the dish
is the SIM's dish (`src/sim2.js` line 16, `arenaR: 0.150`; line 18,
`ridgeAt: 0.72`; line 20, `pockets: 3`) and an arena is what that dish is
sitting in.

---

## 1. What an arena IS in the code today

### 1a. The 2D view (the shipping game)

**One image per MODE, not per world.** `src/play-shell.html` line 1097:

```
var ARENA_ART={
  pangkah:{f:'pangkah',rim:0.435,rot:Math.PI/2},
  uri:    {f:'uri',    rim:0.478,rot:0},
  taya:   {f:'taya',   rim:0.455,rot:0},
  tujlub: {f:'range',  rim:0.445,rot:0}
};
```

- **File:** `assets/arenas/<f>.webp`, loaded by `arenaArt(m)` at line 1109 with
  the build cache buster. The four live files are all **1024 x 1024** (measured
  off the WebP headers: pangkah, taya, uri are VP8; range is VP8X with alpha).
  Written by `tools/artsupport.py` as "1024px full frame webp q82, no cutting".
- **`rim`** is the generated plate's rail centreline as a fraction of the image
  width, calibrated per plate by compositing circles in PIL and looking (the
  comment at line 1102). It is the ONLY number that ties a plate to the dish.
- **`rot`** turns painted pockets onto the SIM's pocket angles, 0/120/240 from
  +X. Only the pangkah plate has painted pockets.
- **Drawn where:** `drawStadium(cx,cy,r)` at line 3523, called by `drawArena()`
  at line 3476, called every frame from the render loop at line 3430 whenever
  the 3D view is not up. `r = RAD() = min(W,H) * 0.44` (line 2333); centre is
  `W/2, H/2`. At 375 x 667 that is r = 165 px. Pixels per metre are
  `RAD()/arenaR` (line 2334), and `arenaR` is `SIM.K.arenaR` (line 2332)
  unless the rung's boss carries its own: `startPlay()` lines 2399 to 2401,
  `if(bs&&bs.arenaR)arenaR=bs.arenaR;` (The Giant, `src/ladder.json` line
  1110, `arenaR 0.23`).
- **How it is drawn under the dish** (lines 3524 to 3537): scale
  `sc = r/(iw*cfg.rim)` so the plate's rail lands on the SIM's r; clip to a
  circle of `1.30 r`; rotate by `rot`; draw the plate centred; then a radial
  vignette from `1.02 r` to `1.30 r` fades to `rgba(12,9,8,1)` = **#0C0908**.
  With no file, a gradient dish `#3A2D23 to #241C17 to #191210` is the
  fallback (line 3539).
- **What the code draws ON TOP, always** (lines 3552 to 3604): the rail band
  from `0.72 r` to `r` in `rgba(201,162,39,.055)`; the ridge ring at `0.72 r`
  in `rgba(201,162,39,.34)` 1.4 px; three red pocket arcs at `0.995 r` in
  `rgba(196,68,43,.62)` 7 px (skipped for uri and tujlub); Taya's pin circle at
  `0.13 r`; the broken chalk line at `r`. Uri's two posts (at `0.42 r`) and the
  range's five bands (`0.16 + 0.155 i` of r) are drawn ONLY when there is no
  plate, because the current uri and range plates carry their own.
- **Behind everything:** `html,body{background:var(--lo)}` at line 26, and
  `--lo:#160F0C` at line 16. `#field` (line 504) is `position:fixed;inset:0`
  and its canvas clears to transparent every frame (line 3423). **There is no
  backdrop image in the game today.** The page colour is the backdrop.

So on a 1024 plate with `rim` = 0.45 the geometry the code expects is:

| feature | fraction of r | px from plate centre |
|---|---|---|
| ridge crest, where the floor becomes rail | 0.72 | 332 |
| the SIM rail centreline (chalk line, pockets) | 1.00 | 461 |
| vignette begins | 1.02 | 470 |
| plate edge (512 px) | 1.11 | 512 |
| vignette fully page colour, clip edge | 1.30 | 599 |

The plate is smaller than the clip circle, so the corners of a 1024 plate are
already inside the fade. The apron beyond the rail is seen for about 40 px and
then dissolves into the page.

### 1b. The 3D view (`src/battle3d.js`, beta, behind the `battle3d` setting)

**One GLB per MODE.** Line 55:

```
var STADIUM = { pangkah:'chalk_ring', pass:'chalk_ring', field:'chalk_ring',
                uri:'posts', taya:'taya_circle', tujlub:'long_range' };
var STADIUM_R = { chalk_ring:150, posts:150, taya_circle:150, long_range:340 };
```

- **File:** `assets/3d/stadium/<name>.glb` (`stadiumUrl`, line 76). Loaded in
  `setStadium(mode)` at line 216, scaled by `arenaR*1000 / STADIUM_R[name]`
  (1.0 for every standard round, 1.533 for The Giant).
- **Mesh** (built by `tools/forge3d/arena.py`, `build_stadium`, line 49): one
  object `stadium_<name>`, 72 segments, a lathe profile in mm at R = 150 of
  `(0,0) (0.30,1.8) (0.55,7.5) (0.72,13.5) (0.80,10.5) (0.93,12.0) (0.985,30)
  (1.0,30)` plus an outer skirt down to y = 0 at `1.04 R`. Chalk Ring has three
  14 mm lip dips at 0/120/240 (the pockets); Posts has two tubes r 11 mm,
  42 mm tall, at `x = +/- 0.45 R`. Triangle counts from
  `tools/forge3d/arena-report.json`: chalk_ring 1224, posts 1316, taya_circle
  1224, long_range 1224.
- **Materials** (arena.py lines 36 to 47 and 102 to 106): `lw_dish_<name>`, a
  Principled BSDF whose Base Color is `assets/3d/stadium/floors/<name>_albedo.png`
  and whose Roughness is `<name>_rough.png`, both **1024 x 1024**, planar UV
  `u = x/(2R) + 0.5` so the texture spans the whole 2R square; and `lw_rail`,
  base (0.55, 0.57, 0.60), **metalness 1.0, roughness 0.25**, on every face
  beyond `0.74 R`. The rail never samples the floor texture, so only the inner
  74 percent of the albedo's radius (379 px of 512) is ever seen.
- **Stage furniture** the game hides: `shadow_catcher_<name>` and
  `dust_card_<name>` are made invisible by name prefix in `stripStage` (line
  237). Every other mesh gets `receiveShadow`.
- **Rim measurement** (`measureRim`, line 245): a `Box3` around the WHOLE
  stadium object gives `S.rimR` and `S.rimH`; the key light is then placed at
  direction `(-0.55, 0.78, 0.45)` normalised times `rimR * 4` (line 254), the
  shadow camera box is `+/- rimR * 1.15`, and `layoutCamera` (line 341) pulls
  the camera back until `rimR` and `rimH` fit. **Anything added to the
  stadium object grows this box and pushes the camera back**, which is the one
  trap for stand props (see section 5).
- **Floor height** (`buildFloorLUT`, line 266): 48 radii, 6 azimuths at
  `a * 60 deg + 0.37 rad`, a downward ray from `rimH + 400`, the LOWEST hit is
  the floor. Props above the dish floor do not disturb it; a prop that dips
  below y = 0 inside R does.
- **Lights** (`makeRenderer`, lines 194 to 207), the whole vocabulary:
  - `HemisphereLight(sky 0xFFF3E2, ground 0x241C15, 1.15)`
  - key `DirectionalLight(0xFFFFFF, 2.1)` at `(-600, 900, 600)`, castShadow,
    512 map, bias -0.0006 (position is overwritten by measureRim, above)
  - rim `DirectionalLight(0xCFE0FF, 0.8)` at `(600, 300, -600)`
  - environment: `PMREMGenerator.fromScene(RoomEnvironment, 0.04)`; every
    material's `envMapIntensity = 0.55` (`dress`, line 117)
  - `ACESFilmicToneMapping`, `toneMappingExposure = 0.70` (line 180)
  - renderer `alpha:true`, no scene background: the page colour shows around
    the stadium (line 161)
  - three is vendored r161; `scene.environmentIntensity` does not exist there.
- **Per frame** (`sync`, line 437): poses, camera, render. No animation of its
  own, no second clock. An arena motion has to ride `st.dt` inside sync and
  switch off on `st.reduce`.

What a 3D world is, then: **the mode's dish mesh, kept; plus a floor texture
pair, a rail retint, a stand of props beside the dish, and a lighting preset.**
No new dish geometry, ever.

### 1c. The hook, exactly

There is no arena id anywhere today. The closest thing is the LEAGUE:

- `src/ladder.json`: every rung carries `"league": 0..4` (25 rungs, five per
  league), generated by `tools/ladder.js` lines 258 and 266.
- `src/play-shell.html` line 1901:
  `var LEAGUE_NAMES=['Chalk Ring','The Market','Riverside','The Barrel','Kelantan'];`
  used only as headings in `buildLadder`.
- The current rung is `opp()` (line 1885): `LADDER[facing]`, or the Field's
  generated rung. `mode` is a plain string at line 793 (`pangkah`, `uri`,
  `taya`, `tujlub`, `pass`, `field`).
- **The selection point is `startPlay()` at line 2400**, `var o=opp(),
  bs=bossOf(o);`, the same place the boss dish radius is read. An arena id
  computed there from `o.arena || LEAGUE_ARENA[o.league]` and stored next to
  `mode` is then read by `drawStadium` at line 3524 (`arenaArt(mode)` becomes
  `arenaArt(arena)`) and passed to `B3D.enter(...)` at line 2555, whose
  `setStadium` at battle3d.js line 216 is where the 3D side keys off it.

---

## 2. The arena set: eight worlds

The ladder is five leagues, five rungs each, named after where people play:
Chalk Ring, The Market, Riverside, The Barrel, Kelantan. Five worlds are the
five leagues. The sixth is the last boss's own dish (The Giant already fights
in a wider one, `arenaR 0.23`, so it is the one dish that is physically
different and deserves its own ground). The seventh is the Field, the endless
opponent mode. The eighth is Pass the Phone, which is two people at one table.

The fiction is a hand wound top game played on dirt and chalk: nothing neon,
nothing that glows for its own sake (the stylesheet comment at line 13). Every
world below is a place a real ring could be drawn.

Ids are the file stems. Palette hex is the plate's dominant values, in order:
floor, rail, apron, one accent.

| # | id | name | where it is used | mood |
|---|---|---|---|---|
| 1 | `chalk_yard` | The Chalk Yard | league 1, Chalk Ring | a back yard ring under a tin awning, morning, the plate that already ships |
| 2 | `market_lantern` | Market Lantern | league 2, The Market | a night market lane cleared for a match, paper lanterns overhead |
| 3 | `riverside_jetty` | Riverside Jetty | league 3, Riverside | a wet plank landing at dawn, river mist, mossy stone |
| 4 | `barrel_house` | The Barrel House | league 4, The Barrel | a cooperage after hours, a dish set into a barrel head, one bulb |
| 5 | `kelantan_ground` | Kelantan Ground | league 5, Kelantan | the gasing field itself, cracked padi mud at golden hour, banners |
| 6 | `giants_quarry` | The Giant's Quarry | rung 25, The Giant (arenaR 0.23) | a cut stone pit, grey dust, the widest dish in the game |
| 7 | `foundry` | The Foundry | the Field (endless) | an ironmonger's forge floor, slag and scale, heat in the rail |
| 8 | `tin_roof_rain` | Tin Roof Rain | Pass the Phone | a kitchen table under a tin roof in the monsoon, rain sheeting past the eaves |

### The eight, in full

**1. The Chalk Yard** `chalk_yard`
- Mood: the ring everyone learned on. Packed earth, a chalk line, the shade
  edge of a tin awning.
- Palette: floor `#5B4A3A`, rail `#8E9BA2`, apron `#2A1F18`, accent `#EDE6D8`
  (chalk).
- Rim and floor: a pressed steel rail, worn bright on the crest; tamped dirt
  floor with chalk dust in the grain.
- Motion: the awning's shadow edge creeps across the apron, one slow sweep per
  round (a single translucent plane, translated).
- Note: `assets/arenas/pangkah.webp` IS this world's plate. It needs only a
  backdrop and the 3D stand.

**2. Market Lantern** `market_lantern`
- Mood: after the stalls shut, a lane of flagstones swept for a ring; lantern
  light, warm and low, faces in the dark beyond it.
- Palette: floor `#4A3B2E`, rail `#B08A3C` (brass), apron `#1C130F`, accent
  `#D9782E` (lantern orange).
- Rim and floor: a brass rail, dull, thumb polished on the crest; a floor of
  flagstones with sand brushed into the joints.
- Motion: lanterns on a line above the stand sway a few degrees; their light
  on the apron sways with them (rotate the lantern group about its line by
  `sin(t) * 0.04`, key light colour fixed).

**3. Riverside Jetty** `riverside_jetty`
- Mood: dawn on a landing stage, everything damp, the far bank a grey line,
  mist sitting on the water.
- Palette: floor `#3F4A46`, rail `#6E7A76` (wet stone), apron `#141A18`,
  accent `#9FC7D6` (mist blue).
- Rim and floor: a rim of fitted river stone, moss in the seams, a ring of
  iron pinned into it as the rail; a floor of wet planks with sand thrown
  across the centre.
- Motion: a mist plane drifts across the apron at one direction, very slowly,
  alpha 0.10 (one textured quad, translated, wrapped).

**4. The Barrel House** `barrel_house`
- Mood: a cooperage after hours. The dish is a barrel head set into the floor,
  oak staves standing round the walls, one hanging bulb.
- Palette: floor `#6A4A2E` (oak), rail `#3A3633` (iron hoop), apron `#1A120C`,
  accent `#C9A227` (rope).
- Rim and floor: the rail is a barrel's iron hoop, black, rust at the rivets;
  the floor is the end grain of oak staves, sanded flat, chalk ring on the
  wood.
- Motion: the bulb swings and the shadows of the standing staves swing with
  it (the key light's position circles by a few mm; `measureRim` already
  places the key from a direction, so the direction gets a wobble).

**5. Kelantan Ground** `kelantan_ground`
- Mood: the real thing. A harvested padi field at golden hour, mud cracked
  into plates, a ring of hardened clay, banners on bamboo behind the crowd.
- Palette: floor `#8A6A44`, rail `#C9A227` (rope over clay), apron `#3A2A18`,
  accent `#C4442B` (banner red).
- Rim and floor: a raised clay rim bound with rope, the rope worn pale on
  the crest; a floor of smooth hardened clay, the traditional gasing surface,
  with the mud cracks fading out toward the centre.
- Motion: the banners flutter (two or three cloth planes, vertex wave, or a
  cheap rotation of each banner group about its pole by `sin(t*1.3)*0.06`).

**6. The Giant's Quarry** `giants_quarry`
- Mood: a stone pit, walls of cut rock, grey dust on everything, the dish cut
  straight into the quarry floor. Bigger than any other ring.
- Palette: floor `#5E5A54`, rail `#8E9BA2` (steel set in rock), apron
  `#262421`, accent `#EDE6D8` (chalk on grey).
- Rim and floor: a rail of steel plate bolted into cut stone; a floor of
  swept rock dust over flat bedrock, the chalk ring drawn on it.
- Motion: grit falls from the pit wall in one thin curtain, off to one side
  (a `Points` cloud of 60 particles, y decreasing, wrapped).
- Note: the SIM dish is 230 mm here. The stadium mesh is scaled 1.533 at
  runtime; the plate and floor are drawn to the same fractions as every other
  world and need nothing special.

**7. The Foundry** `foundry`
- Mood: an ironmonger's floor, the forge banked in the corner, scale and slag
  underfoot, the rail still warm.
- Palette: floor `#3A2F2A`, rail `#6B4F3A` (heat tinted steel), apron
  `#120C0A`, accent `#C4442B` (ember).
- Rim and floor: a rail of blued steel with heat colour on the crest; a floor
  of cast iron plate, scale flaking, one chalk ring.
- Motion: embers rise from the forge corner (a `Points` cloud, 40 particles,
  y increasing, alpha fading) and the forge glow breathes (the rim light's
  intensity `0.6 + 0.2 * sin(t * 0.8)`).

**8. Tin Roof Rain** `tin_roof_rain`
- Mood: a kitchen table under a tin roof, monsoon night, rain sheeting off
  the eaves just beyond the light, two people and one dish.
- Palette: floor `#4A3E36`, rail `#9C9286` (tin), apron `#0F0D0C`, accent
  `#9FC7D6` (rain).
- Rim and floor: a rail of rolled tin, dented; a floor of oilcloth over a
  table, the chalk ring drawn straight onto it.
- Motion: rain streaks beyond the eaves (a `Points` cloud of 120 stretched
  particles falling fast, well outside the dish) and a slow drip ring on the
  apron every few seconds.

---

## 3. The 2D sheet, per arena

Two generated images per world:

- **The dish plate**, 1024 x 1024, square, the dish centred, the rail
  centreline at 45 percent of the image width from the centre (461 px), the
  floor flat and unmarked inside 72 percent of that (332 px), the apron
  beyond the rail darkening to near black by the edge. The game clips it to
  a circle and fades it to `#0C0908` from `1.02 r` outward, so the corners
  are never seen. Saved as `assets/arenas/<id>.webp` at q82 (the
  `artsupport.py` rule). The builder calibrates `rim` by measuring where the
  rail centreline actually landed; ask for 45 percent and expect 0.43 to
  0.48, which is the range the four live plates span.
- **The backdrop**, 1080 x 1920, full bleed, no transparency, no magenta.
  The dish sits at the exact centre and covers a circle of radius
  `1.30 * 0.44 * 1080 = 618 px`, so the middle 1236 px of the backdrop is
  under the dish and its fade: keep that circle calm and dark (nothing
  brighter than about `#1A1410` inside it, or the fade to `#0C0908` will show
  a ring). Detail lives in the top 340 px, the bottom 340 px and the side
  margins. The score sits at the top centre and the Launch button at the
  bottom, so keep the bottom 200 px low contrast. Saved as
  `assets/arenas/<id>-bg.webp`.

**No marks on the floor.** The game draws its own: the rail band, the ridge
ring, the pockets, the Taya pin, the range bands. A plate with three pockets
in it is right for pangkah and wrong for uri, taya and the range, so new plates
carry no pockets and no posts; the code's red arcs mark the pockets. The Chalk
Yard keeps its existing plate, pockets and all, under `rot`.

**The Ripcord style line** is the fixed tail every part prompt in
`docs/ART-PROMPTS.md` ends with (generated by `tools/artkit.js` line 74):
"Lit from the upper left, a soft specular along the top edge, deep shadow on
the lower right. No text, no logo, no border, no frame, no packaging, no hand,
no motion blur." The plates keep it and drop the black background clause,
because a plate is full frame and nothing is keyed out of it.

Each prompt below is complete on its own. Paste it whole.

### 1. The Chalk Yard `chalk_yard`

Plate: already shipped as `assets/arenas/pangkah.webp`. No new plate.

Backdrop `chalk_yard-bg` (1080 x 1920):
```
A back yard seen from directly above, morning light, the ground packed dirt swept smooth in the middle and scattered with chalk dust, a strip of corrugated tin awning shadow crossing the upper third, a wooden bench and a bucket against the top edge, a coiled cord and a few loose steel washers near the bottom edge, weeds in the corners. The centre of the picture is a calm empty circle of dark packed earth with nothing in it, darker than the edges. Muted earth colours: dirt 5B4A3A, deep shadow 160F0C, chalk EDE6D8, steel 8E9BA2. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Portrait image, 1080 by 1920 pixels.
```

### 2. Market Lantern `market_lantern`

Plate `market_lantern` (1024 x 1024):
```
A circular spinning top arena seen from directly above, centred in a square frame. A dull brass rail ring, thumb polished bright along its crest, its centreline at 45 percent of the image width from the centre so the ring spans about 90 percent of the picture, the rail band about one eighth of the ring radius wide. Inside it a flat floor of worn flagstones with fine sand brushed into the joints, completely unmarked, no chalk, no lines, no pockets, no posts. Outside the rail a narrow apron of dark swept flagstone darkening to near black at the corners. Lit by warm paper lantern light from above and slightly upper left, orange D9782E in the highlights, floor 4A3B2E, brass B08A3C, apron 1C130F. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 1024 by 1024 pixels.
```

Backdrop `market_lantern-bg` (1080 x 1920):
```
A night market lane seen from directly above, the stalls shut, a row of paper lanterns strung across the top of the frame glowing orange, a folded awning and stacked crates along the top edge, a tea kettle and stools along the bottom edge, flagstones everywhere else. The centre of the picture is a calm empty circle of dark swept stone with nothing in it, darker than the edges, the lantern light barely reaching it. Colours: stone 4A3B2E, deep shadow 1C130F, lantern orange D9782E, brass B08A3C. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Portrait image, 1080 by 1920 pixels.
```

### 3. Riverside Jetty `riverside_jetty`

Plate `riverside_jetty` (1024 x 1024):
```
A circular spinning top arena seen from directly above, centred in a square frame. A rail ring of fitted wet river stone with moss in the seams and a band of pinned iron along its crest, the ring's centreline at 45 percent of the image width from the centre so the ring spans about 90 percent of the picture, the rail band about one eighth of the ring radius wide. Inside it a flat floor of wet grey planks running one direction with a thin layer of damp sand thrown over the middle, completely unmarked, no chalk, no lines, no pockets, no posts. Outside the rail a narrow apron of dark wet planking darkening to near black at the corners. Cool dawn light, floor 3F4A46, stone 6E7A76, apron 141A18, a mist blue 9FC7D6 in the highlights. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 1024 by 1024 pixels.
```

Backdrop `riverside_jetty-bg` (1080 x 1920):
```
A wooden river landing seen from directly above at dawn, planks running the length of the frame, grey water with drifting mist along the top edge and a mooring post with coiled rope in one top corner, a fish basket and a lantern along the bottom edge, everything damp. The centre of the picture is a calm empty circle of dark wet planking with nothing in it, darker than the edges. Colours: plank 3F4A46, deep shadow 141A18, stone 6E7A76, mist 9FC7D6. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Portrait image, 1080 by 1920 pixels.
```

### 4. The Barrel House `barrel_house`

Plate `barrel_house` (1024 x 1024):
```
A circular spinning top arena seen from directly above, centred in a square frame. The rail ring is a black iron barrel hoop, rust at the rivets, worn to bare metal along its crest, its centreline at 45 percent of the image width from the centre so the ring spans about 90 percent of the picture, the rail band about one eighth of the ring radius wide. Inside it a flat floor of oak barrel head, the end grain of the staves sanded flat and oiled, completely unmarked, no chalk, no lines, no pockets, no posts. Outside the rail a narrow apron of dark sawdust covered floorboards darkening to near black at the corners. One hanging bulb overhead, warm. Colours: oak 6A4A2E, iron 3A3633, apron 1A120C, rope gold C9A227 in the highlights. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 1024 by 1024 pixels.
```

Backdrop `barrel_house-bg` (1080 x 1920):
```
A cooperage workshop floor seen from directly above at night, oak staves stood in bundles along the top edge, a stack of iron hoops and a mallet along the bottom edge, sawdust and shavings on dark floorboards, one bare bulb lighting it from above. The centre of the picture is a calm empty circle of dark floorboard with nothing in it, darker than the edges. Colours: oak 6A4A2E, deep shadow 1A120C, iron 3A3633, gold C9A227. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Portrait image, 1080 by 1920 pixels.
```

### 5. Kelantan Ground `kelantan_ground`

Plate `kelantan_ground` (1024 x 1024):
```
A circular spinning top arena seen from directly above, centred in a square frame. The rail ring is a raised rim of hardened clay bound tight with coiled rope, the rope worn pale along its crest, its centreline at 45 percent of the image width from the centre so the ring spans about 90 percent of the picture, the rail band about one eighth of the ring radius wide. Inside it a flat floor of smooth hardened clay, the traditional gasing surface, sun baked, faint mud cracks near the rim fading to smooth at the centre, completely unmarked, no chalk, no lines, no pockets, no posts. Outside the rail a narrow apron of cracked dry padi mud darkening to near black at the corners. Late golden hour light. Colours: clay 8A6A44, rope C9A227, apron 3A2A18, banner red C4442B only as a faint warm cast. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 1024 by 1024 pixels.
```

Backdrop `kelantan_ground-bg` (1080 x 1920):
```
A harvested rice field seen from directly above at golden hour, cracked dry mud in plates, cut stubble in rows along the sides, a line of bamboo poles with red and gold cloth banners along the top edge, a woven mat with a kettle and two wound cords along the bottom edge. The centre of the picture is a calm empty circle of smooth dark clay with nothing in it, darker than the edges. Colours: mud 8A6A44, deep shadow 3A2A18, rope gold C9A227, banner red C4442B. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Portrait image, 1080 by 1920 pixels.
```

### 6. The Giant's Quarry `giants_quarry`

Plate `giants_quarry` (1024 x 1024):
```
A circular spinning top arena seen from directly above, centred in a square frame. The rail ring is heavy steel plate bolted down into cut grey stone, scratched bright along its crest, its centreline at 45 percent of the image width from the centre so the ring spans about 90 percent of the picture, the rail band about one eighth of the ring radius wide. Inside it a flat floor of flat bedrock under a skin of swept pale rock dust, drill marks faint at the edge, completely unmarked, no chalk, no lines, no pockets, no posts. Outside the rail a narrow apron of broken grey stone and dust darkening to near black at the corners. Flat overcast light. Colours: floor 5E5A54, steel 8E9BA2, apron 262421, chalk EDE6D8 in the dust highlights. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 1024 by 1024 pixels.
```

Backdrop `giants_quarry-bg` (1080 x 1920):
```
The floor of a stone quarry seen from directly above, cut rock walls with drill lines along the top edge and one side, a heap of grey rubble and a broken sledge along the bottom edge, pale dust drifting over everything. The centre of the picture is a calm empty circle of dark flat bedrock with nothing in it, darker than the edges. Colours: rock 5E5A54, deep shadow 262421, steel 8E9BA2, dust EDE6D8. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Portrait image, 1080 by 1920 pixels.
```

### 7. The Foundry `foundry`

Plate `foundry` (1024 x 1024):
```
A circular spinning top arena seen from directly above, centred in a square frame. The rail ring is blued steel with heat colour, straw and violet, along its crest, its centreline at 45 percent of the image width from the centre so the ring spans about 90 percent of the picture, the rail band about one eighth of the ring radius wide. Inside it a flat floor of cast iron plate, mill scale flaking, swept, completely unmarked, no chalk, no lines, no pockets, no posts. Outside the rail a narrow apron of black slag and cinders darkening to near black at the corners, a faint ember glow from the upper right corner only. Colours: iron 3A2F2A, heat tinted steel 6B4F3A, apron 120C0A, ember C4442B. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 1024 by 1024 pixels.
```

Backdrop `foundry-bg` (1080 x 1920):
```
An ironmonger's forge floor seen from directly above at night, a banked forge glowing dull red in one top corner with a bellows and tongs beside it, an anvil and a water trough along the bottom edge, cinders and iron scale on black flagstones. The centre of the picture is a calm empty circle of dark iron floor with nothing in it, darker than the edges, the forge glow not reaching it. Colours: floor 3A2F2A, deep shadow 120C0A, steel 6B4F3A, ember C4442B. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Portrait image, 1080 by 1920 pixels.
```

### 8. Tin Roof Rain `tin_roof_rain`

Plate `tin_roof_rain` (1024 x 1024):
```
A circular spinning top arena seen from directly above, centred in a square frame. The rail ring is rolled tin, dented and dull, brighter along its crest, its centreline at 45 percent of the image width from the centre so the ring spans about 90 percent of the picture, the rail band about one eighth of the ring radius wide. Inside it a flat floor of faded oilcloth stretched over a kitchen table, a small worn check pattern almost lost under use, completely unmarked, no chalk, no lines, no pockets, no posts. Outside the rail a narrow apron of dark tabletop darkening to near black at the corners. One low lamp, warm, rain light cold at the very edges. Colours: oilcloth 4A3E36, tin 9C9286, apron 0F0D0C, rain blue 9FC7D6 only in the edge highlights. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 1024 by 1024 pixels.
```

Backdrop `tin_roof_rain-bg` (1080 x 1920):
```
A kitchen table under a tin roof seen from directly above on a monsoon night, the table filling the middle of the frame, the edge of the roof along the top with rain sheeting past it in streaks into the dark, two mugs and a folded cloth along the bottom edge, one low warm lamp. The centre of the picture is a calm empty circle of dark tabletop with nothing in it, darker than the edges. Colours: table 4A3E36, deep shadow 0F0D0C, tin 9C9286, rain blue 9FC7D6. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Portrait image, 1080 by 1920 pixels.
```

---

## 4. The 3D notes, per arena

### What every 3D world is made of

The dish mesh is NOT part of an arena. The four mode meshes in
`assets/3d/stadium/` stay exactly as they are, because their profile is the
SIM's profile and `buildFloorLUT` reads heights off it. A world supplies four
things, all keyed by the arena id:

| part | file | how it is applied |
|---|---|---|
| floor albedo + roughness | `assets/3d/arena/<id>/floor_albedo.png`, `floor_rough.png`, 1024 x 1024 | swapped onto the dish's `lw_dish_*` material at load (`material.map`, `material.roughnessMap`, `flipY=false`, sRGB on the albedo). Derived from the 2D plate: crop the plate to the rail centreline (a 922 px square centred, since the rail is at 461 px) and resize to 1024, so the dish rim is the image edge, matching the planar UV `u = x/(2R)+0.5`. Only the inner 74 percent of the radius shows. |
| rail retint | three numbers in the preset | set on the `lw_rail` material: `color`, `metalness`, `roughness`. Today (0.55,0.57,0.60), 1.0, 0.25, which is the chrome tub in `docs/shots-3d/probe-375x667-mid.png`. |
| the stand | `assets/3d/arena/<id>/stand.glb` | one GLB, its origin at the dish centre, 1 unit = 1 mm, +Y up, everything OUTSIDE the skirt (radius > 1.04 R = 156 mm; for the Quarry, build at R = 230 so 240 mm). Object names `stand_<id>` for the root and `prop_<id>_<n>` for each prop. Added to the scene as a SIBLING of the stadium, never a child, so `measureRim`'s Box3 does not see it. |
| lighting preset | in the ARENAS table in battle3d.js | three lights in the file's own vocabulary, below. |

Budget: FORGE3D says a dressed top runs 1.5 to 2k triangles and the brief puts
two tops and a stadium near 9k. Stadium 1224 to 1316. That leaves about 4k;
**the stand gets 3,000 triangles, no more than 600 per prop, one 1024
texture atlas per world** (material `lw_stand_<id>`), and the remainder stays
for trails. Five props each, the sixth is the motion element where there is
one.

Props that stand outside the dish are never hit by the floor rays (six
azimuths at radii 0 to R), so they cannot corrupt `floorY`. They DO catch the
key light's shadow only if they sit inside the shadow box `+/- rimR * 1.15`
= 179 mm at the standard dish; a lantern line at 300 mm casts nothing, which
is fine and cheaper.

**Prop sheet for Meshy.** The forge's Meshy lane (`docs/FORGE3D.md`) takes one
object per image and fits it flat; for props the fit step is
`tools/forge3d/meshyfit.py` with `--axis` for tall objects. Generate one
sheet per world, five props on pure magenta FF00FF, generous gaps, then
`python3 tools/artsheet.py` cuts singles. Sheet prompt tail, the same for all
eight (the "style line" plus the sheet ground):

```
Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

### Lighting presets

Vocabulary is battle3d.js lines 194 to 207: `HemisphereLight(sky, ground,
intensity)`, key `DirectionalLight(colour, intensity)` at a direction (the
code normalises it and sets the distance from `rimR`), rim
`DirectionalLight(colour, intensity)` at a position in mm. Exposure stays
0.70 and the room environment stays at 0.55 for every world; the presets only
move the three lights and the rail material. Positions use the file's
existing convention: `(x, y, z)`, camera side is +z, key comes from the
upper left at `(-600, 900, 600)`.

| id | hemisphere sky / ground / int | key colour / int / direction | rim colour / int / position | rail colour, metal, rough |
|---|---|---|---|---|
| chalk_yard | `0xFFF3E2` / `0x241C15` / 1.15 | `0xFFFFFF` / 2.1 / `(-0.55, 0.78, 0.45)` | `0xCFE0FF` / 0.8 / `(600, 300, -600)` | `#8C9196`, 1.0, 0.25 (today's values, kept) |
| market_lantern | `0xFFD9A8` / `0x1C130F` / 0.85 | `0xFFB870` / 1.8 / `(-0.30, 0.90, 0.30)` | `0xD9782E` / 0.9 / `(500, 250, -650)` | `#B08A3C`, 1.0, 0.45 |
| riverside_jetty | `0xDCE8EC` / `0x141A18` / 1.25 | `0xE8F0F4` / 1.6 / `(-0.60, 0.70, 0.40)` | `0x9FC7D6` / 1.0 / `(650, 200, -500)` | `#6E7A76`, 0.6, 0.55 |
| barrel_house | `0xFFE2B0` / `0x1A120C` / 0.75 | `0xFFD08A` / 2.4 / `(-0.15, 0.97, 0.20)` | `0xC9A227` / 0.5 / `(600, 350, -600)` | `#3A3633`, 0.9, 0.65 |
| kelantan_ground | `0xFFE6C0` / `0x3A2A18` / 1.30 | `0xFFCC88` / 2.3 / `(-0.75, 0.45, 0.50)` | `0xC4442B` / 0.6 / `(600, 250, -650)` | `#C9A227`, 0.2, 0.80 |
| giants_quarry | `0xD8D8D8` / `0x262421` / 1.40 | `0xFFFFFF` / 1.5 / `(-0.40, 0.90, 0.20)` | `0xB0B8C0` / 0.7 / `(600, 400, -600)` | `#8E9BA2`, 1.0, 0.35 |
| foundry | `0xFFC4A0` / `0x120C0A` / 0.70 | `0xFFE0C0` / 1.9 / `(-0.50, 0.80, 0.35)` | `0xC4442B` / 1.2 / `(700, 200, -400)` | `#6B4F3A`, 1.0, 0.30 |
| tin_roof_rain | `0xFFE8C8` / `0x0F0D0C` / 0.80 | `0xFFDDA0` / 2.0 / `(-0.20, 0.95, 0.25)` | `0x9FC7D6` / 0.9 / `(600, 300, -650)` | `#9C9286`, 0.8, 0.50 |

(`chalk_yard`'s key direction is the vector `measureRim` already uses; the
others are the same shape with the sun moved: low and from the left for the
padi field at golden hour, near overhead for the single bulb.)

### The stands, five props each, and the motion element

Each line is the `prop_<id>_<n>` list, the material atlas is one file. The
prop sheet prompt is the five props in a row, in the world's palette, on
FF00FF, with the tail above appended.

**1. chalk_yard**: `prop_chalk_yard_1` wooden bench, `_2` galvanised bucket,
`_3` coiled launch cord on a nail block, `_4` tin awning post with a scrap of
awning, `_5` a chalk box. Motion: `shade_chalk_yard`, one translucent quad,
translated across the apron over the round.
Sheet prompt:
```
Five objects for a back yard: a low wooden bench with a worn seat, a dented galvanised steel bucket, a coil of waxed cord hung on a block of wood, a short steel post carrying a corner of corrugated tin awning, and a small open cardboard box of chalk sticks. Plain workshop objects, honest and unremarkable, earth colours 5B4A3A and 8E9BA2, chalk EDE6D8. Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

**2. market_lantern**: `_1` a stack of three wooden crates, `_2` a folded
stall awning on its frame, `_3` a brass tea kettle on a stool, `_4` a second
stool, `_5` a lantern pole. Motion: `lanterns_market_lantern`, a group of
four paper lanterns on a line between two poles at 300 mm out, 160 mm up,
rotated about the line by `sin(t) * 0.04`.
Sheet prompt:
```
Five objects for a night market: a stack of three rough wooden crates, a folded canvas stall awning on a bamboo frame, a dull brass tea kettle sitting on a low wooden stool, a second low wooden stool, and a tall bamboo pole with a hook and one round orange paper lantern hanging from it. Plain market objects, honest and unremarkable, colours 4A3B2E, B08A3C and lantern orange D9782E. Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

**3. riverside_jetty**: `_1` a mooring post with coiled rope, `_2` a woven
fish basket, `_3` a hurricane lantern, `_4` a stack of wet planks, `_5` a
mossy stone bollard. Motion: `mist_riverside_jetty`, one 600 x 200 mm quad
with a soft alpha texture, translated in +x at 20 mm/s, wrapped, alpha 0.10.
Sheet prompt:
```
Five objects for a river landing: a weathered wooden mooring post with rope coiled round it, a woven cane fish basket with a lid, a glass hurricane lantern with a wire handle, a low stack of wet grey planks, and a squat stone bollard with moss in its cracks. Plain riverside objects, honest and unremarkable, colours 3F4A46, 6E7A76 and mist blue 9FC7D6. Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

**4. barrel_house**: `_1` a bundle of oak staves stood on end, `_2` a stack of
iron hoops, `_3` a cooper's mallet on a block, `_4` a finished barrel, `_5` a
hanging bulb on a cord (the motion element doubles as a prop). Motion:
`bulb_barrel_house`, the key light direction wobbles by `0.03 * sin(t * 0.7)`
in x and the bulb mesh swings the same.
Sheet prompt:
```
Five objects for a cooperage: a bundle of oak barrel staves stood on end and bound with cord, a stack of five black iron barrel hoops, a heavy wooden cooper's mallet resting on a chopping block, one finished oak barrel with black hoops, and a bare light bulb hanging on a twisted cord from a small ceiling hook. Plain workshop objects, honest and unremarkable, colours 6A4A2E, 3A3633 and gold C9A227. Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

**5. kelantan_ground**: `_1` a bamboo pole with a red banner, `_2` a bamboo
pole with a gold banner, `_3` a woven pandan mat with a kettle, `_4` a
bundle of cut padi stalks, `_5` a low wooden stand holding two wound cords.
Motion: `banners_kelantan_ground`, each banner group rotated about its pole
by `sin(t * 1.3 + n) * 0.06`.
Sheet prompt:
```
Five objects for a village games field in Kelantan: a tall bamboo pole flying a long red cloth banner, a tall bamboo pole flying a long gold cloth banner, a woven pandan mat with a brass kettle sitting on it, a tied bundle of cut rice stalks, and a low wooden stand holding two coiled launch cords. Plain village objects, honest and unremarkable, colours 8A6A44, rope gold C9A227 and banner red C4442B. Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

**6. giants_quarry**: `_1` a cut stone block with drill lines, `_2` a heap
of rubble, `_3` a broken sledgehammer, `_4` a second stone block, taller,
`_5` a rusted iron wedge and feathers set. Motion: `grit_giants_quarry`, a
`Points` cloud of 60 particles in a 40 x 300 x 40 mm column at 260 mm out,
falling at 120 mm/s, wrapped.
Sheet prompt:
```
Five objects for a stone quarry: a rough cut block of grey stone with drill grooves along one face, a low heap of grey rubble and dust, a sledgehammer with a split handle, a taller cut stone block stood on end, and a set of rusted iron splitting wedges lying together. Plain quarry objects, honest and unremarkable, colours 5E5A54, 8E9BA2 and dust EDE6D8. Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

**7. foundry**: `_1` an anvil on a stump, `_2` a banked forge hearth with an
ember bed (emissive `#C4442B`), `_3` a water trough, `_4` tongs and a hammer
on a rack, `_5` a bellows. Motion: `embers_foundry`, a `Points` cloud of 40
particles rising from the hearth at 60 mm/s, alpha fading over 2 s; and the
rim light intensity breathing `0.6 + 0.2 * sin(t * 0.8)`.
Sheet prompt:
```
Five objects for an ironmonger's forge: a black anvil on a tree stump, a brick forge hearth banked with dull red embers, a wooden water trough, a wall rack holding tongs and a hammer, and a leather and wood bellows. Plain workshop objects, honest and unremarkable, colours 3A2F2A, heat tinted steel 6B4F3A and ember C4442B. Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

**8. tin_roof_rain**: `_1` a tin roof edge on two posts, `_2` two enamel
mugs, `_3` a folded cloth, `_4` a low oil lamp, `_5` a wooden chair back
(seen from the dish side). Motion: `rain_tin_roof_rain`, a `Points` cloud of
120 stretched particles beyond the roof edge at 320 mm out, falling at
900 mm/s, wrapped; a `drip_tin_roof_rain` ring on the apron scaling 0 to 1
over 0.6 s every 4 s.
Sheet prompt:
```
Five objects for a kitchen under a tin roof: a corner of corrugated tin roof on two wooden posts with a dripping edge, two chipped enamel mugs, a folded cotton cloth, a small brass oil lamp with a glass chimney, and the back and seat of a plain wooden kitchen chair. Plain household objects, honest and unremarkable, colours 4A3E36, tin 9C9286 and rain blue 9FC7D6. Five separate objects laid out in a loose row with wide gaps between them, each one whole and not touching another, on a flat pure magenta background, hex FF00FF, no shadow on the ground, no reflection, no surface under them. Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right. No text, no logo, no border, no frame, no packaging, no hand, no motion blur. Square image, 2048 by 2048 pixels.
```

---

## 5. Priority, and the wiring

### Make these two first

1. **Market Lantern** (league 2). It is the first world a player reaches
   after the yard, at rung 6, which is where most players still are; it is
   the strongest visual contrast to dirt and chalk that still obeys the
   "nothing neon" rule (warm lantern light against a dark lane); its motion
   element is the cheapest of the eight (four lanterns rotated on a line);
   and its brass rail is the first test of the rail retint, which is the one
   piece of the 3D wiring with no precedent in the code.
2. **Kelantan Ground** (league 5). It is the destination: the ladder's names,
   the modes and the launch ritual are all gasing, and the finale should be
   played where gasing is played. It also carries The Giant's approach (rungs
   21 to 24), so the two worlds together bracket the ladder: the first change
   and the last one. The banners are the second motion type (cloth), so the
   two worlds between them prove both cheap motion patterns.

The Chalk Yard costs nothing (its plate ships today) and becomes arena 1 the
moment the arena id exists. The Giant's Quarry is third, because it is the
only world with a different dish radius and the Quarry is where the 1.533
stadium scale gets looked at with real art around it.

### The wiring, exactly

A builder does this, and only this:

**Data.** In `tools/ladder.js`, add a table `LEAGUE_ARENA = ['chalk_yard',
'market_lantern', 'riverside_jetty', 'barrel_house', 'kelantan_ground']` and
write `arena: LEAGUE_ARENA[lg]` into both `ladder.push` calls (lines 258 and
266); on The Giant's boss entry (line 87 of the `BOSSES` table) set
`arena: 'giants_quarry'` and let the boss push prefer `b.arena`. Regenerate
with `node tools/ladder.js --json`. `ladder.json` then carries `"arena"` on
every rung and no runtime code has to know about leagues.

**2D.** In `src/play-shell.html`:
- Line 793, beside `var mode='pangkah';`, add `var arena='chalk_yard';`.
- In `startPlay()` after line 2400 (`var o=opp(), bs=bossOf(o);`), set
  `arena = mode==='field' ? 'foundry' : mode==='pass' ? 'tin_roof_rain'
  : (o&&o.arena)||'chalk_yard';`. The Field path returns early at line 2397,
  so set it BEFORE that return, or inside `nextFieldOpponent()` (line 2634).
- Re-key `ARENA_ART` (line 1097) by arena id: `{f, rim, rot, marks}`. The
  existing four entries move under `chalk_yard` as a per-mode sub-table,
  because those plates carry mode marks: `chalk_yard:{pangkah:{f:'pangkah',
  rim:0.435,rot:Math.PI/2,marks:true}, uri:{f:'uri',rim:0.478,marks:true},
  taya:{f:'taya',rim:0.455,marks:true}, tujlub:{f:'range',rim:0.445,
  marks:true}}`. Every new world is one entry with `marks:false` and its
  measured `rim`. `arenaArt(arena, mode)` picks the sub-entry when there is
  one and the single entry otherwise.
- `drawStadium` line 3524 becomes `var cfg=arenaCfg(arena,mode),
  img=arenaArt(arena,mode);` and the two `!img` guards at lines 3573 and 3591
  become `!(img&&cfg.marks)`, so uri's posts and the range's bands are drawn
  by code over a markless plate. Pockets already draw by code for pangkah
  and taya (line 3568).
- The backdrop: in `startPlay()` set
  `$('field').style.backgroundImage='url(assets/arenas/'+arena+'-bg.webp?v='+LW_BUILD+')'`
  with `backgroundSize:'cover'` and `backgroundPosition:'center'`, and clear
  it in `showMenu(true)` (line 1040). `#field` is the fixed full bleed box
  (line 32) under the transparent canvas, and the 3D renderer is `alpha:true`,
  so one backdrop serves both views with no other change. The vignette at
  line 3536 already fades the plate into `#0C0908`, which is why the
  backdrop's centre must stay near that colour.
- `tools/stadiums.mjs` gets one shot per arena id, because a stadium is
  dressing and only a picture says whether it reads.

**3D.** In `src/battle3d.js`:
- `enter(mode, arenaR, cfgA, cfgB)` (line 408) takes a fifth argument
  `arena`; `enter3D()` in play-shell (line 2553) passes it.
- Add `var ARENAS = { chalk_yard:{...}, ... }` beside `STADIUM` (line 55),
  each entry holding the lighting preset row from section 4, the rail
  retint, and `stand:true|false`.
- Keep the hemisphere and rim lights on `S` (they are created anonymously at
  lines 194 and 201) so a preset can set `color`, `groundColor`,
  `intensity` and `position`. Store the key DIRECTION on `S.keyDir` and make
  `measureRim` line 254 read it instead of the literal `(-0.55, 0.78, 0.45)`.
- `setStadium(mode)` becomes `setStadium(mode, arena)`: after the dish loads,
  traverse it, find the material whose name begins `lw_dish_` and swap
  `map` and `roughnessMap` for the arena's floor pair (`TextureLoader`,
  `flipY=false`, `colorSpace = SRGBColorSpace` on the albedo,
  `needsUpdate=true`); find `lw_rail` and set `color`, `metalness`,
  `roughness`. Then `glb('assets/3d/arena/'+arena+'/stand.glb')`, add it to
  the scene as a sibling of the stadium, scaled by the same factor, and keep
  it on `S.stand`. **Never add it under `S.stadium`** or `measureRim` and
  `buildFloorLUT` will read it (section 1b).
- Motion: one function per arena in `ARENAS[id].motion(dt, t)` called from
  `sync` (line 437) after the poses and before `render`, skipped when
  `st.reduce` is true. `S.t += st.dt`. Every motion above is a rotation, a
  translation or a `Points` cloud, and none of them reads the round.
- `exit(true)` (the full teardown) drops `S.stand` alongside `S.stadium`.
- `test/battle3d.mjs` (it rewrites `docs/shots-3d`) gets one probe per
  arena, at 375 x 667, mid round, and the worst angle: the far rail with the
  stand behind it, where a prop that grew the rim box would show as a
  camera that backed off.

Nothing in `src/sim2.js` changes. `bossArena` (line 1483) keeps returning
`arenaR` and `bowlMul` and never learns the word arena.
