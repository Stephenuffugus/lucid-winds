# LOAF: THE CAT RENDERER SPECIFICATION

**One spec, grafted from three directions. Ground truth: both photographs, sampled pixel by pixel.**

---

## 0. WHAT I MEASURED, AND WHAT IT SETTLES

Before choosing a spine I sampled both photographs directly rather than eyeballing them. Six measurements decide most of the arguments between the three directions.

| Measured | Value | What it settles |
|---|---|---|
| Cat1 iris, un-shadowed lower arc | `#C5BD91`, `#BABB9B`, `#CCB991`. HSV saturation **0.22 to 0.29** | The render's eyes are a near-fully-saturated lime. She is a pale desaturated gooseberry at roughly **one third** the chroma. This is not a tuning miss, it is a missing chroma clamp. |
| Cat1 pupil | `#2C2421`, and **large and near-round** | Warm dark brown, never `#000`. The permanent hard slit in the current render is wrong for both cats and for most indoor photos. |
| Cat1 white | **none anywhere** | The render puts a pale blob low on the body in all three poses. It is inventing a marking. This must become structurally impossible, not merely defaulted off. |
| Cat2 white | bib `#E3D0D0`, paw `#E4D0C4` | His white is red-shifted by the room. His white **is** the neutral reference, so his "black" coat is genuinely cooler than it samples. Nobody renders him right without the white-balance step. |
| Cat2 bib boundary (crop) | a transition **band** 10 to 20 percent of the bib's width, made of interdigitated individual hairs | A wobbly bezier is not enough. The edge is a band, not a line. |
| Cat1 forehead (crop) | **stippled irregular mottle**, no clean M; and both ear outlines carry a **pale fringe of individual hairs** against the background | "Five converging strokes" is the wrong primitive for her. The ear edge fringe is one of the most distinctive things about her head and no direction mentions it. |

Two more from the crops. Her nose leather is brightest on the **upper** dome and darkest at the lower rim, which is the opposite of what one direction asserted, and it is what the fixed overhead key light predicts. Her upper iris goes olive under the lid, which means the **lid cast shadow is doing more visible work than the radial iris gradient**. Both facts are baked into section 3.

### The verdict on the current output, specifically

`real-compare.png`: one dome at three scales. The head is the same width as the body, so it is a snowman. The stripes are constant-width vertical bars running edge to edge, crossing the head and body seam, crossing the pale belly, with no taper, no break, no spine origin, no agouti halo. The pale belly blob is a light-shading smudge masquerading as pigment, on a cat with no white. The eyes are neon lime discs with hard black slits, no socket, no gradient, no limbal ring, no catchlight, no spectacle. The nose is a pink triangle with no muzzle mass around it. Three straight hairlines stand in for whiskers. The tail and legs are plain on a striped cat, which is anatomically impossible. The sit has no contact shadow, so it floats. Everything is perfectly bilaterally symmetric.

`catsheet.png`: eight cats, one silhouette, pixel identical in outline. Tortie drawn as polka dots. Calico's white is a hard-edged egg. Classic is a snail spiral. Ticked ginger has a blank face and blank legs, which is exactly backwards. Colourpoint is a hard oval mask.

### The spine, and the three big cuts

**Spine:** Direction 3's ordering thesis (a beautiful drawing gets the benefit of the doubt, an ugly one gets audited, so spend on eyes, light, edge and face mass first), built on Direction 1's structural insight (the silhouette must differ per cat; body in three-quarter, head near frontal; far-side limbs darker; the flat-black acceptance test), carrying Direction 2's identity mechanism (white as a seeded grade field, the obligatory tabby set, white beating pattern absolutely, markings in local UV).

**Cut 1: the runtime spine spline and variable-radius envelope sweep** (Direction 1, section 2.3). It is roughly 300 lines with a self-intersection failure mode at high curvature and a fragile dorsal-to-ventral join, and it buys a silhouette that can be authored directly in a fifth of the time with full artistic control. The requirement is "two cats must be different animals in flat black", not "a procedural anatomy engine". Replaced by **hand-authored per-pose anchor rings whose points are displaced by four build numbers**.

**Cut 2: the 9x5 per-chart per-pose deformation lattices** (Direction 2, section 1.1). Twelve 45-point lattices is a week of tuning that nobody will maintain. Because every part is baked in its own local space, limbs, tail, ears and head need **no** lattice at all; the pose moves the part. Only the body needs pose-varying UV, and that is two 5-point polylines per pose, sixty numbers in total.

**Cut 3: every field that does not change a pixel at 200px.** Gone: `bodyDepth`, `rumpHeight`, `backCurve`, `jowlDrop`, `browHeight`, `skullW`, `earSetY`, `chinDepth`, `tailTaper`, `girth` separate from `chonk`, `waistTuck` separate from `chonk`, `headTurn` as DNA, `tortieScale`, the 14 iris fibre strokes (invisible below 160px and charged per frame), the 30 to 40 directional fur streaks, and `rust` (the OKLab pipeline already warms the lit edge of a black coat for free, and cat2's lit back measured `#33383C`, a cool grey, so there is no evidence to fit).

---

## 1. THE FINAL DNA

**72 scalar fields plus two lists. The owner is shown 14 controls.** Roughly 46 fields are filled automatically and the owner never sees them.

Source tags: **[PIX]** on-device pixel analysis fills it. **[TAP]** one tap by the owner on the photo. **[GRD]** vision model or a preset picker with live previews. **[OWN]** owner judgement only, no automatic estimate is worth trusting. **[DER]** derived, never stored, never exposed.

### 1.1 Meta (1)

| field | type | default | source | controls |
|---|---|---|---|---|
| `seed` | uint32 | hash of photo | [PIX] | Every asymmetry. Ear tilt, whisker fan, white boundary noise, stripe break phase, per-paw white onset, mark jitter. **No marking may ever be mirrored.** If the two sides of a cat match, the seed is not being consumed. |

### 1.2 Palette (8). Six anchors, sixteen derived colours.

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `pal.coatMid` | hex | | `#8C7752` | [PIX] | Body ground. Everything else derives from it. |
| `pal.coatDark` | hex | | `#3A2E22` | [PIX] | Stripe and spot core, non-agouti pigment. |
| `pal.undercoat` | hex | | `#D9C8A6` | [PIX] | The pale warm mass: muzzle, chin, throat, belly, inner leg. **Absent from the current parameter set and half the reason cat1 misses.** |
| `pal.whiteTone` | hex | | `#F2EADF` | [PIX] | Spotting white. **Never `#FFF`.** Also the white-balance reference. |
| `pal.innerEar` | hex | | `#C79E92` | [PIX] | Pinna interior. |
| `pal.noseLeather` | hex | | `#B0736E` | [TAP] | Best identity per pixel in the whole file. |
| `pal.warmth` | float | -1 to 1 | 0 | [OWN] | Global hue push in OKLCH, cool grey to warm brown, applied after clamping. |
| `pal.contrast` | float | 0 to 1 | 0.6 | [PIX] | Lightness spread between `coatMid` and `coatDark`. Near 0 is a ghost tabby. |

**White balance rule, mandatory.** If the cat has any white on it, that patch is a known neutral. Compute the correction from it before sampling any other colour. Cat2's bib measured `#E3D0D0`, which is 10 percent red-heavy; without the correction his black coat renders warm brown, and every grey cat photographed under tungsten renders as a brown cat. If the cat has no white, fall back to the brightest 2 percent of the background.

### 1.3 Build (4). Skeleton, soft tissue and coat are three separate layers.

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `build.frame` | float | -1 to 1 | 0 | [PIX] mask aspect | **Skeleton.** Sleek Oriental to cobby British. Displaces back length, brisket depth, neck length. |
| `build.chonk` | float | 0 to 1 | 0.35 | [PIX] belly line vs elbow line | **Soft tissue.** Drops the belly below the elbow, fills the waist, collapses the visible neck. Does **not** change the head. |
| `build.legLen` | float | 0 to 1 | 0.5 | [PIX] if standing | Independent of frame. |
| `build.posture` | float | -1 to 1 | 0 | [OWN] | Slumped to upright. Spine angle and withers height. |

### 1.4 Coat (6). An edge property, not a shape property.

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `coat.length` | int | 0, 1, 2 | 0 | [PIX] boundary gradient sharpness plus tail-to-head width ratio | short / semi / long. Gates the four below and sets the white boundary band width. |
| `coat.floof` | float | 0 to 1 | 0.2 | [PIX] | **Edge only.** Flap amplitude 1px to 6px, flap count, halo scale 1.02 to 1.07. Does not touch the outline anchors. |
| `coat.ruff` | float | 0 to 1 | 0.15 | [GRD] | Neck and cheek mass. |
| `coat.britches` | float | 0 to 1 | 0.15 | [GRD] | Hind thigh feathering. |
| `coat.tailPlume` | float | 0 to 1 | 0.15 | [PIX] tail width / head width | Tail width multiplier 1.0 to 2.6, and flap size along the tail. |
| `coat.tailLen` | float | 0 to 1 | 0.7 | [PIX] tail px / head px | |

A fluffy cat and a sleek cat have the identical body underneath and differ only at the edge. Conflating floof with body shape is why nothing on the current sheet reads as fluffy.

### 1.5 Head (4)

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `head.width` | float | 0 to 1 | 0.55 | [PIX] | Wedge to apple. Cranium width, and it inversely drives muzzle length. |
| `head.cheek` | float | 0 to 1 | 0.5 | [PIX] | Zygomatic and whisker-pad bulge **in the silhouette**. The single most underrated shape parameter: it is what makes a face read "mature tabby" rather than "generic cat". |
| `head.muzzleLen` | float | 0 to 1 | 0.45 | [GRD] | |
| `head.age` | float | 0 to 1 | 0.55 | [OWN] | **One slider driving four numbers together:** eye width as a fraction of head width 0.34 down to 0.24, eye centreline 0.58 to 0.46 down the skull, inter-eye gap 0.78 to 1.02 eye widths, muzzle size. This composite **is** neoteny, and an owner judges it instantly, whereas they will never understand `eyeRound`. |

### 1.6 Ears (7)

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `ears.size` | float | 0 to 1 | 0.7 | [PIX] | Height and base width together. |
| `ears.spacing` | float | 0 to 1 | 0.6 | [PIX] | 0 crown, 1 corners of the skull. Wide set is about 60 percent of the "big ears" impression and is the strongest single personality dial in the rig. |
| `ears.angle` | float | -1 to 1 | 0 | [PIX] | Outward flare. Positive reads relaxed and large, zero alert, negative cross. |
| `ears.tipRound` | float | 0 to 1 | 0.3 | [GRD] | Sharp point to domed. Visible on the silhouette test at 200px. |
| `ears.tuft` | float | 0 to 1 | 0.3 | [PIX] | Interior furnishing density. On a black cat this is the only face texture there is. |
| `ears.tuftPale` | float | 0 to 1 | 0.5 | [PIX] | How much lighter the furnishings are than the coat. Cat2 is 1.0 and it is most of his face. |
| `ears.edgeFringe` | float | 0 to 1 | 0.4 | [PIX] | **New, from the photograph.** A halo of individual pale hairs along the ear outline. Cat1 is a shorthair with `floof 0.2` yet has a strong ear fringe, so this is genuinely independent of coat length. Two dozen tapered strokes at bake time; enormous character per op. |

### 1.7 Eyes (9)

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `eye.irisInner` | hex | | `#C9B45C` | [TAP] | Colour **at the pupil**: warmer, lighter. |
| `eye.irisOuter` | hex | | `#8CA04E` | [TAP] | Colour **at the rim**: cooler, darker. A single-colour iris will never match cat1. **Both are chroma-clamped on the way in.** |
| `eye.size` | float | 0 to 1 | from `head.age` | [PIX] | Overridable. |
| `eye.aperture` | float | -1 to 1 | -0.2 | [OWN] | Round and startled to almond and elegant. |
| `eye.lidDrop` | float | 0 to 1 | 0.1 | [OWN] | Upper lid chord lowered. Cat2 sits at 0.32 and it is his whole expression. |
| `eye.lidTilt` | float | -1 to 1 | 0 | [OWN] | Inner corner down reads cross, outer corner down reads sad. |
| `eye.pupilRound` | float | **0.25 to 1**, floor locked | **0.80** | [TAP] | 1.0 fully round, 0.25 the narrowest we will ever ship. Phrased as roundness, not slit, so the owner cannot set it backwards. Both photographs show near-round pupils. The permanent hard slit is why every cat on the current sheet looks sinister. |
| `eye.limbal` | float | 0 to 1 | 0.75 | [DER] from `irisOuter` lightness | Dark ring at the aperture edge. Cheapest big win in the rig: it turns a sticker into a jewel. Near 0 on black cats where there is no rim contrast. |
| `eye.eyeRing` | float | 0 to 1 | 0 | [GRD] | Pale spectacle of fur outside the lid line. Cat1 is 0.85; cat2 is 0, and that absence is exactly what makes his eyes float. |

Runtime state, **not DNA**: `blink` 0 to 1, `pupilDilate` 0.7 to 1.4, `gaze` (x, y), `headTurn` -1 to 1.

### 1.8 Face markings (9)

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `face.maskLight` | float | 0 to 1 | 0.5 | [PIX] | How pale the muzzle, pad and chin mass is against the cheek. Cat1 measured a 25 to 30 percent lightness step; the current render has zero. |
| `face.M` | enum | `none / faint / broken / solid / stippled` | `broken` | [GRD] preset with preview | Cat1's forehead is genuinely `stippled`, an irregular mottle, not five clean strokes. |
| `face.mWeight` | float | 0 to 1 | 0.6 | [OWN] | |
| `face.mascara` | float | 0 to 1 | 0.5 | [GRD] | Two lines per eye: inner corner down the nose side, outer corner back to the ear base. Set to 0 on black cats. |
| `face.cheekComma` | float | 0 to 1 | 0.4 | [GRD] | Curved dark hook below and behind the outer eye corner. People notice its absence without being able to name it. |
| `face.whiskerDots` | float | 0 to 1 | 0.4 | [GRD] | Dark spots at the whisker roots on the pale pads. Tiny, and disproportionately charming. |
| `face.noseBridge` | float | 0 to 1 | 0.4 | [GRD] | Dark stripe up the bridge between the eyes. Clearly present in cat1's muzzle crop. |
| `face.whiskerColour` | hex | | `#F2EADA` | [PIX] | |
| `face.whiskerCount` | int | 5 to 14 | 8 | [OWN] | Per side. Cat2 measures 12 or more. |

### 1.9 Pattern (10). Body pattern and the obligatory set are separate, because the genes are.

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `pat.type` | enum | `solid / mackerel / classic / spotted / ticked` | `mackerel` | [GRD], always a pre-selected picker, never a silent decision | Topology of the flow field. `rosette` is cut as out of scope for domestic cats. |
| `pat.strength` | float | 0 to 1 | 0.75 | [PIX] fur luminance variance | Alpha of the multiply pass. |
| `pat.scale` | float | 0.6 to 1.6 | 1.0 | [PIX] | Stripe pitch relative to body length. |
| `pat.breakup` | float | 0 to 1 | 0.3 | [PIX] | Continuous stripes to dashes to discrete spots. **This one continuum replaces three of the current presets.** Push past 0.8 and you get spotted tabby correctly derived, with spots lying **along stripe paths** rather than on a lattice. |
| `pat.ghost` | float | 0 to 1 | 0 | [GRD] | Residual tabby ghosting visible on a solid or black coat. |
| `pat.tortie` | float | 0 to 1 | 0 | [GRD] | **Overlay on any type**, not a type of its own. Reuses the white blob code with 22 elongated seeds and fingered edges. |
| `pat.tortieColour` | hex | | `#B4602A` | [PIX] | |
| `pat.legBars` | float | 0 to 1 | 0.7 | [PIX] | Bracelets. **Currently 0 in the renderer, which is why a striped cat has plain legs.** |
| `pat.tailRings` | int | 0 to 7 | 5 | [PIX] | Plus a dark tip, always. |
| `pat.necklaces` | int | 0 to 3 | 1 | [PIX] | Broken arcs across the throat. |

**Locked, never exposed, derived from `pat.type`:** `spineLine` (0.9 for mackerel and spotted, 1.0 with three lines for classic, 0.35 for ticked; every mackerel bar springs from it), `bellyStop` (0.74; cats are never striped on the belly), `patHalo` (0.65 minimum; the warm agouti halo either side of every stripe core).

**The obligatory set is present even when `pat.type` is `ticked`.** Face marks, leg bracelets, tail rings, tail tip and necklaces are governed by different loci than the flank pattern. This is why the sheet's ticked ginger, with its blank face and blank legs, is exactly backwards, and why the mackerel brown with a plain tail is not a mackerel tabby at all. Fixing this single table, changing nothing else, is the largest correctness gain available.

### 1.10 White (10 scalars, plus `paws[4]` and a `spots` list)

`whiteStyle` and `whiteAmt` are deleted.

| field | type | range | default | source | controls |
|---|---|---|---|---|---|
| `white.grade` | float | 0 to 10 | 0 | [PIX] | Breeder scale. Drives the whole body against the seed field in section 4. 0 self, 3 bib and odd toes, 5 tuxedo, 7 bicolour, 9 van, 10 all white. |
| `white.edge` | float | **0.15 to 1**, floor locked | 0.45 | [PIX] from `coat.length` | Boundary raggedness and interdigitation band width. A clean bezier white edge is the single ugliest thing on `catsheet.png`. |
| `white.paws` | enum[4] | `none / toecap / sock / boot / high` | seeded | [PIX] then [OWN] | `[FL, FR, HL, HR]`. Cat2 is `['toecap','none','none','none']`, which no preset at any percentage can express, and which is the first thing his owner would say in a sentence about him. |
| `white.chin` | float or null | 0 to 1.5 | null | [PIX] | null means "as the grade predicts". |
| `white.bibShape` | enum | `locket / round / teardrop / flame / shield / split / ragged` | `teardrop` | [OWN] | |
| `white.bibSkew` | float | -1 to 1 | 0 | [OWN] | Which side it flares to. **Bibs are never centred.** |
| `white.bibLength` | float | 0 to 1 | 0.6 | [PIX] | How far down the chest, past the elbow or not. |
| `white.belly` | float or null | 0 to 1.5 | null | [PIX] | |
| `white.blaze` | float or null | 0 to 1.5 | null | [PIX] | Plus `white.blazeSkew` folded in as `sign(seed)`; blazes are almost never straight. |
| `white.tailTip` | float or null | 0 to 1.5 | null | [PIX] | |
| `white.spots` | list | `[{part,u,v,r}]` | `[]` | [OWN] | Free-placed lockets and odd patches. The escape hatch for the cat whose identity is one weird armpit patch. |

### 1.11 Quirks (1 list)

`quirks: []` from `earNotchL`, `earNotchR`, `tailKink`, `lidDroopL`, `lidDroopR`, `scarNose`, `whiskersShortL`, `collar`. All [OWN]. Low frequency, total identity when present, and the owner will absolutely use it if it is there.

**A note on honesty.** One direction asserted cat1 has a notched left ear. I looked at the forehead crop at 4x and I cannot confirm it. It is not in her parameter set below. Do not put quirks in from inference; they are owner-only for a reason.

---

## 2. THE DRAW STACK

### 2.0 Four laws the current renderer breaks

1. **PIGMENT, THEN LIGHT.** All coat colour, all pattern, and all white go down first. Every gradient, occlusion, rim and bounce goes on top of all of it, at once. The current render paints a shading blob and then lays stripes over it, which is exactly why the stripes read as tape stuck onto a shape rather than fur growing out of an animal. **Precision that matters:** white beats every pigment layer absolutely, but white still **receives** light. A bib that skips the form gradient and the rim reads as a sticker.
2. **THE LIGHT NEVER MOVES.** One rig, hard coded, not a parameter.
3. **FOUR VALUES PER MATERIAL.** Light, mid, shadow, occlusion, plus the rim. Nothing in between. This is the discipline that would have prevented the mushy grey belly smudge.
4. **NOTHING IS PURE.** No `#000`, no `#FFF`, no fully saturated hue anywhere on the animal. Pure black is a silhouette-shaped hole with no drawing in it. The neon lime eyes are the loudest ugly thing in the sheet and they measure at three times cat1's actual chroma.

### 2.1 Colour derivation, once per DNA change, about 0.2ms

**No sampled photo colour ever reaches a fill call.** Every anchor passes through a harmoniser in OKLCH. sRGB to OKLab and back is about 25 lines each way with standard constants; HSL is not an acceptable substitute because its lightness is badly wrong for exactly the browns and near-blacks these two cats are made of.

```
clampL(coatMid)  -> [0.20, 0.86]
clampC(coatMid)  -> [0.02, 0.14]
clampC(iris*)    -> [0.03, 0.11]        <- this clamp alone kills the neon lime
H += pal.warmth * 14
```

Then derive sixteen working colours:

```
coatLight     L+0.09  C+0.010  H+10        warm toward the key
coatShadow    L-0.15  C+0.025  H-16        cool toward violet, NEVER toward grey
coatOcclusion L-0.26  C+0.030  H-22
coatEdgeHalo  mix(coatMid, roomBg, 0.30), L+0.03
patternCore   coatDark, L clamped >= 0.14
patternHalo   mix(coatDark, coatMid, 0.55) L+0.04 H+8     the agouti band
underLight    undercoat L+0.06 H+8
underShade    undercoat L-0.11 C+0.02 H-14
whiteLit      whiteTone L+0.05, capped at #FFFBF2
whiteShade    whiteTone L-0.13 C+0.035 H-20
rim           mix(#DCE8FF, coatLight, 0.35)
bounce        #FFE0B8 at alpha 0.12
irisRim       irisOuter L-0.30 C+0.02 H-12
lidLine       darker of (patternCore, coatOcclusion)
noseOutline   noseLeather L-0.28 C+0.02
contactShadow roomFloor L-0.22, hue pulled 25% toward the coat hue
```

This single function is the largest beauty lever in the project and it is one afternoon of work.

### 2.2 The light rig, locked constants

```
KEY    dir (-0.62, -0.78)   colour #FFF3D8   strength 0.55
RIM    dir (+0.78, -0.55)   colour rim       alpha 0.45, on 35% of the outline arc
BOUNCE up-facing surfaces   colour bounce    alpha 0.12
AO     at joins             coatOcclusion    alpha 0.18
```

### 2.3 The view, and the parts

**Body in profile three-quarter, head near frontal, neck reconciles them.** This is not a convenience cheat, it is how cats actually sit, and it is the single most important art-direction call in the whole document. The current renderer draws the body front on, which is precisely the view in which a cat has no anatomy at all, only a blob. Three-quarter gives you a real spine, a visible waist, a haunch, a folded hind foot, and a face at full expressive width.

**Far-side limbs are drawn behind the body at 0.86 value with the hue shifted 4 percent toward `coatShadow`.** That alone produces more depth than any amount of gradient work.

Parts, each baked to its own `ImageBitmap`:

| pose | parts | count |
|---|---|---|
| SIT | tailA, tailB, tailC, legHindNear, legForeFar, body, legForeNear, earFar, head, earNear | 10 |
| LOAF | tailA, tailB, tailC, body (paw bumps baked in), earFar, head, earNear | 7 |
| STAND | tailA, tailB, tailC, legHindFar, legForeFar, body, legHindNear, legForeNear, earFar, head, earNear | 11 |

### 2.4 The silhouette: authored anchor rings, displaced

Units are HL, head length, occiput to nose tip. At a 200px sit, HL is about 64px. Origin at the ground contact under the body centre; +x forward, +y up.

**SIT body ring, 15 anchors, authored:**

```
napeDip    ( 0.36, 1.52)      hindHeel   (-0.40, 0.04)   hock on the floor
withers    ( 0.20, 1.58)      hindToe    ( 0.34, 0.02)   plantigrade, points forward
backUpper  (-0.16, 1.44)      bellyBack  ( 0.16, 0.30)
backMid    (-0.42, 1.10)      bellyLow   ( 0.34, 0.40)
rumpTop    (-0.60, 0.78)      chestLow   ( 0.52, 0.62)
rumpBack   (-0.68, 0.44)      chestFront ( 0.62, 0.94)   the brisket
tailRoot   (-0.62, 0.22)      throatLow  ( 0.58, 1.24)
                              throat     ( 0.50, 1.44)
head origin ( 0.44, 1.90)
```

**Build displacements, the part that makes two cats different animals:**

```
frame:   backMid.x    -= 0.10*frame     shorter back when cobby
         rumpTop.x    -= 0.08*frame
         chestFront.x += 0.06*frame     deeper brisket
         throat.y     -= 0.05*frame     shorter neck
chonk:   bellyLow.y   -= 0.26*chonk     the belly drops BELOW the elbow
         bellyBack.y  -= 0.16*chonk
         chestLow.x   += 0.10*chonk
         throatLow.x  += 0.09*chonk     the visible neck collapses
         backMid.y    += 0.05*chonk
posture: withers.y    += 0.10*posture
         backUpper.x  += 0.06*posture
         napeDip.y    += 0.06*posture
```

The elbow sits at y = 0.66 in the sit and the neutral belly line at 0.40 plus the chonk term. Push chonk to 1 and the belly line goes to 0.14, well below the elbow, which is precisely the visual signature of a fat cat and falls out of the numbers for free.

**LOAF** and **STAND** get their own 15-anchor rings with the same displacement table. Two signature rules are non-negotiable:

- **LOAF:** `withers` must be the highest point in the ring, above `rumpTop`, by at least 0.08 HL. That scapular shelf **is** the loaf. All legs fold to zero visible length and the only leg evidence is a paw bump at the chest front. The chin drops so the neck vanishes. Top line flat, front line tucked and vertical, back line a long shallow curve to the tail.
- **SIT:** `chestLow` and `bellyLow` must sit at least 0.15 HL above the ground so the forelegs bridge down as separate parts and **the triangular hole between them is real**. The current sit has zero interior negative space, which is why at 25 percent flat black it reads as a bread bun.

Then walk the resolved ring and displace it along its normals with deterministic 1D fbm seeded from `seed`, amplitude `coat.floof * 6px`, **restricted to the fur zones** (ruff, cheek, chest, haunch, belly line, tail). Skull top and face front stay smooth or the head loses its read.

### 2.5 Body UV for markings

Per pose, two authored 5-point polylines: `spineU` from nape (u=0) to tail root (u=1) along the dorsal line, and `bellyU` from throat (u=0) to the hind end (u=1) along the ventral line. Then:

```
P(u, v) = CR(spineU, u) * (1 - v) + CR(bellyU, u) * v
```

Catmull-Rom evaluation, about fifteen lines. Sixty authored numbers for all three poses. **That is the entire marking-wrapping mechanism**, and it means the loaf's stripes curl with the loaf instead of being stamped into it. Limbs, tail, ears and head need no equivalent because each is baked in its own straightened local space and the pose transforms the part, not the marking.

### 2.6 Per-part bake stack, body, in order

Everything here runs **once per DNA or pose change**, into an offscreen canvas at 2x. Take fifteen milliseconds; nobody is watching.

| # | Layer | Canvas technique |
|---|---|---|
| B1 | Halo silhouette | Resolved ring scaled `1.02 + 0.05*floof` about the centroid, edge flaps at 1.6x amplitude, one `fill()` in `coatEdgeHalo`, drawn **behind**. One extra fill, and it is the entire shorthair versus semi-longhair difference. |
| B2 | Flat fill | `fill()` the ring in `coatMid`. |
| B3 | Clip | `ctx.save(); ctx.clip()`. Everything from B4 to B15 lives inside this. |
| B4 | Undercoat mass | Two or three `createRadialGradient` fills in `undercoat`, opaque centre to transparent, at the belly and throat anchors. **Drawn before the pattern so stripes can fade into it.** |
| B5 | Spine line | One tapered filled path along v = 0.03 from nape to tail root, `patternCore`, alpha `spineLine`. Real mackerel springs off this. Free-floating parallel bars never look like a cat. |
| B6 | Pattern | Draw into a scratch canvas: per bar, first the halo (`patternHalo`, width x1.9, alpha 0.25), then the core (`patternCore`, width x1.0, alpha 0.85). Punch the belly with `globalCompositeOperation = 'destination-out'` using the B4 radial and `bellyStop`. Then `drawImage` the scratch onto the body with **`globalCompositeOperation = 'multiply'`** at `pat.strength`. Multiply is what makes stripes inherit the form gradient instead of sitting flat on top of it. |
| B7 | Necklaces | 0 to 3 broken arcs in body UV, same double stroke, same multiply. |
| B8 | Tortie | If `pat.tortie > 0`: 22 elongated seed blobs via the section 4 blob function, fingered edges, filled with the re-hued pigment set, composited normal, over the pattern, **under** the white. |
| B9 | Ghost | If `pat.ghost > 0`: redraw the B6 scratch at alpha `0.12 * ghost`. |
| B10 | **WHITE** | Union of the seed regions from section 4, boundary displaced, filled `whiteTone`, alpha 1.0, then the interdigitation band. **Nothing pigment-related is drawn over it.** If `white.grade === 0` this layer is unreachable, not merely skipped. |
| B11 | **THE LIGHT** | One cached `createLinearGradient` along the key axis across the bbox. Stops: `0 -> coatLight @0.55`, `0.42 -> transparent`, `1.0 -> coatShadow @0.70`. One `fillRect`. **Linear, not radial.** A radial reads as a bubble, which is precisely what the current belly smudge looks like. |
| B12 | Occlusion | Radial gradients, `coatOcclusion` alpha 0.18 to 0, at: **under the chin** (most important, this is what attaches the head to the body), foreleg to chest, tail root, belly to ground contact. Warm, never neutral. |
| B13 | Bounce | `bounce` at alpha 0.12 on the up-facing undersides, `globalCompositeOperation = 'lighter'`, one soft radial from below. |
| B14 | Texture | One 128x128 alpha noise tile generated once at module load with `createImageData`, cached as an `ImageBitmap`, used via `createPattern`, `globalCompositeOperation = 'soft-light'`, `globalAlpha 0.07`, one `fillRect`. Kills flat plastic instantly. |
| B15 | Inner shadow, then rim | Inner shadow: refill the ring offset `(+3, +3)` in `rgba(50,35,28,0.25)` with `ctx.filter = 'blur(6px)'`; the clip crops it to a rim hugging the shadow edge. Rim light: `stroke()` the ring, `lineWidth 3.5`, `rim` at alpha 0.45, `lineCap round`, dashed to the arc facing the rim direction; the clip removes the outer half, leaving a clean 1.7px rim exactly on the edge. **Never an outline stroke.** An outline stroke is why the current sheet reads as clip art. |
| B16 | Restore, outer fur | `ctx.restore()`. Then 30 to 40 individual tapered hairs crossing the outline outward in the fur zones, alpha ramping 0.35 to 0, `coatEdgeHalo` and `rim` mixed. Only if `coat.length > 0`, plus `coat.guardHairs` behaviour folded into `floof`. |

Head, ears, limbs and tail segments bake through the same B1 to B16 sequence against their own outlines, in their own UV. A sock is a white layer on the limb part; a tail ring is baked into tail segment 2. Limbs get their own occlusion at the shoulder and hip so the transform seam never shows.

**One performance deviation worth naming:** use `ctx.filter = 'blur()'` for the body inner shadow only. For limbs, ears and tail segments, use a three-pass offset stroke at decreasing alpha instead. It looks 95 percent as good and saves 4 to 6ms of bake per pose.

### 2.7 Per-frame composite, back to front

```
F1   contact shadow      1 or 2 ellipse fills using ONE cached radial gradient
F2   tailC, tailB, tailA drawImage + setTransform, chain-rotated on sine phase offsets
F3   far hind, far fore  drawImage, pre-baked at 0.86 value
F4   body                drawImage + scale(1, 1 + 0.02*sin(t))  breathing
F5   near hind, near fore drawImage, rotating about hip and shoulder anchors
F6   earFar              drawImage, rotate about the base anchor
F7   head                drawImage + translate and rotate for bob and tilt
F8   earNear             drawImage, rotate about the base anchor
F9   EYES                LIVE, section 3.4, about 40 path ops for the pair
F10  WHISKERS            LIVE, 16 quadratics double stroked, lagged 3 frames behind the head
```

Seven to eleven `drawImage` calls, two live path groups, one cached gradient. Nothing else. No `filter`, no `shadowBlur`, no gradient construction, no `getImageData`.

**The contact shadow is not optional.** Tight and dark where the body touches, fading fast, offset opposite the key. Sit: one wide pool. Stand: two small dark pools at the paws plus one wide faint one. It is the highest value pixels in the frame and it is what glues the character to the world. Its absence is why the current sit floats.

**The tail is three baked segments, not a live path.** This is the one place where the markings requirement overrides the "draw the tail live" instinct. A live path cannot carry five rings with compressing spacing and a dark tip without redrawing all of it every frame, and a mackerel tabby with a plain tail is not a mackerel tabby. Draw back to front with 15 percent overlap and the joints are invisible.

---

## 3. THE FACE AND EYES

This is where the appeal lives and where the engineering hours go. At a 200px cat the head is about 80px and the face decal about 55px wide.

### 3.1 Head-local UV

Origin between the eyes, x right, y down, unit = head width HW. **Jitter every paired landmark by `seed`, plus or minus 3 percent of HW, per side.** Perfect bilateral symmetry is the strongest clip-art signal there is.

```
skullTop   ( 0.00, -0.62)     browL/R   (+-0.30, -0.28)
eyeC L/R   (+-0.26,  0.00)    cheekOut  (+-0.55, +0.18)
padC L/R   (+-0.16, +0.36)    muzzleTop ( 0.00, +0.18)
noseTip    ( 0.00, +0.30)     mouthY    ( 0.00, +0.46)
chinBottom ( 0.00, +0.60)
```

The head is built as three lobes across, narrow between the ears, wide at the cheeks, narrow at the muzzle, then bulging again at the pads. That profile, driven by `head.width` and `head.cheek`, is worth more than any amount of fur shading.

**Ears** are a pinna, not a triangle: a long shallow S on the outer edge, an arc of radius `tipRound * 0.06 HL` at the tip, a straighter inner edge back down. The back plane is offset 0.035 HL outward and drawn behind the head so the ear has a visible rim. Base chord placed by `ears.spacing` along the cranium arc, rotated by `ears.angle`, jittered per ear by `seed` so one sits 3 degrees higher and 2 percent larger. Then `ears.edgeFringe` adds 18 to 30 tapered pale hairs along the outer silhouette, and `ears.tuft` adds 7 to 12 furnishing strokes inside the pinna at `ears.tuftPale` lightness.

### 3.2 The pale mask, before any dark mark

The single structural fact the current render misses: **cat1's face reads light in the centre and dark at the surround.** Not one flat grey. Measured, a 25 to 30 percent lightness step.

Three soft masses in `undercoat` at `face.maskLight` alpha, each a radial gradient with a soft edge, never a hard path:

1. Two whisker-pad lobes at `padC`, each 0.17 HW wide, overlapping slightly, with a thin `coatShadow` crease between them at alpha 0.2 (the philtrum).
2. A chin lobe below `mouthY`, 0.12 HW wide, with a crease shadow above it so the chin sits forward.
3. A low-alpha wash over the bridge and brow.

Feather the boundary against the cheek by about 2px and no more; in the photograph it is a definite edge made of individual hairs, not a fade. Cat2 gets `maskLight 0.05` and his ears and whiskers do all the work instead.

### 3.3 The dark marks, in order

1. **Nose bridge line.** One tapered path up the centre of the bridge from the leather to between the eyes, `patternCore`, alpha `face.noseBridge`.
2. **The forehead M.** Five short tapered paths converging on the midline. `solid` draws them continuous and joined. `broken` splits each into 2 or 3 dashes. `stippled` dissolves the two inner paths into 3 or 4 dots each before they reach the brow, and scatters 8 to 14 irregular blotches across the field. **Cat1 is `stippled`;** the crop shows an irregular mottle, not five clean strokes, and a clean solid M would be a different cat. Every path gets plus or minus 6 percent length and 3 degrees angle jitter from the seed, independently per side. Double stroke each one, `patternHalo` under `patternCore`.
3. **Inner-corner line.** From the inner canthus down alongside the nose, tapering. Part of `face.mascara`.
4. **Mascara.** A hard line hugging the outer half of the eye and running back toward the ear base, thickest at the outer canthus, tapering both ways. **These sit outside the pale eye ring, which is what makes the ring read as a spectacle.**
5. **Cheek comma.** A curved hook below and behind each outer eye corner, roughly parallel to the mouth line, tapered at both ends, jittered independently per side.
6. **Whisker dots.** Three rows of four per pad, radius 0.6 to 1.1px at 200px, alpha `0.5 * face.whiskerDots`, jittered hard by seed, **positioned at the whisker roots so they line up with the live whiskers**.

### 3.4 The nose, corrected against the photograph

Not a triangle. A rounded trapezoid: top edge flat-ish, sides bowed outward, bottom coming to a point that becomes the philtrum. Width 0.13 HW.

- **Fill:** a short vertical `createLinearGradient`, **lighter at the top, darker at the lower rim.** This is the opposite of what one direction asserted, and it is what the measurement shows (`#A26563` at the mid dome falling to `#693534` at the lower rim) and what the overhead key predicts.
- **Nostrils:** two comma shapes cut at the lower outer corners, measured near black at `#030102`.
- **Liner:** a 0.8px stroke in `noseOutline`, measured `#1E1215`, heavier on the shadow side and heaviest along the bottom. Cat1 has a strong one and it is why her nose reads as a nose and not a sticker.
- **Specular:** one 1px light dot upper left.
- **Philtrum:** a 1px dark groove from the nose point down 0.05 HW.
- **Mouth:** two shallow arcs forming an omega, alpha 0.35, corners drooping slightly. **Never a smile.** Cats do not smile and a smiling cat reads as a cartoon dog.

### 3.5 The eye stack. Fourteen layers, live, and worth the whole budget.

`W` is eye width, roughly 13 to 16px on a 200px cat. `R = 0.48 W`.

```
 1  socket shadow    ellipse 1.35W x 1.15H, radial coatOcclusion alpha 0.16 to 0.
                     Skipping this is exactly why the current eyes look glued on.
 2  pale eye ring    soft ring in underLight outside the lid, 2.5px at 200px,
                     alpha 0.55 * eye.eyeRing. A soft-stop radial, not a stroke.
                     Baked into the face decal, listed here for order.
 3  aperture + clip  4 quadratics: upper lid chord (rotatable by lidTilt, lowerable
                     by lidDrop), outer corner, lower lid, inner corner. aperture
                     morphs almond to round. save(); clip().
                     Cats show almost no sclera. DO NOT draw an eyeball.
                     Draw the opening and fill it with iris.
 4  iris base        fill irisOuter
 5  iris gradient    createRadialGradient centred at (0, -0.12W), r0 0.05W, r1 0.55W.
                     Stops irisInner -> irisOuter -> irisRim.
                     Bright and warm at the pupil, darker and cooler at the rim.
                     Cached per DNA.
 6  LID CAST SHADOW  a soft dark band hugging the top 28% of the aperture, alpha 0.22.
                     PROMOTED from layer 9 in every source direction. Measurement:
                     cat1's upper iris reads #554434 olive under the lid while her
                     lower arc reads #C5BD91. The lid shadow is doing MORE visible
                     work than the radial gradient. If you build only one of 5 and 6,
                     build this one.
 7  limbal ring      stroke the iris circle, lineWidth 1.2, irisRim,
                     alpha 0.8 * eye.limbal. Cheapest big win in the rig.
 8  pupil            ellipse, rx = lerp(0.10, 0.85, eye.pupilRound) * R, ry = 0.96 R.
                     Fill #0E0B0A. NEVER #000: measured #2C2421, and pure black at
                     this size reads as a punched hole.
 9  catchlight       circle r = 0.30 R at (-0.34W, -0.30W) from centre, STRADDLING
                     the pupil edge so it sits half on pupil and half on iris.
                     rgba(255,252,244,0.92). Deliberately larger than real: small
                     catchlights read as realism, large ones read as cute.
                     THE SAME OFFSET IN BOTH EYES, NOT MIRRORED. The light is at
                     infinity. Mirroring is the commonest mistake in the genre and
                     it makes the character look cross-eyed.
10  bounce light     circle r = 0.13 R at (+0.28W, +0.30W), rgba(230,240,255,0.34).
                     Two lights read as a sphere. One light reads as a disc. This
                     single dot is the line between professional and amateur.
11  restore()
12  lid line         stroke the upper aperture arc only, lineWidth tapering 1.6 at
                     the outer corner to 0.3 at the inner, in lidLine.
                     Set to near zero on black cats: cat2's irises float in black
                     with no visible rim and that IS the read.
13  lower lid        thin LIGHT line along the bottom arc, rgba(255,242,224,0.30),
                     0.8px. The lower lid catches light. Tiny, and it seats the eye
                     in flesh. Measured on cat2 at #9E9188.
14  lash tick        one 2px stroke continuing the lid line out and slightly up at
                     the outer corner. Enormous elegance per pixel.
```

**Cut from the source directions:** the 14 radial iris fibre strokes. They are invisible below 160px and they are charged per frame.

**Blink.** Scale the aperture vertically about its centre; above 0.85 closure the lid line becomes one downward arc. Every 3 to 6 seconds, 120ms close, 180ms open, occasional double. Reserve an 800ms slow blink as a directable affection beat. It costs nothing and adds more life than any other single feature.

**Pupil dilation** is the cheapest emotion channel in the product. 1.35 excited, 0.75 cross, two frames of tween.

### 3.6 Whiskers, live

Cat2's photograph settles this: I count twelve or more per side, in four distinct rows, individually varied in length and curvature, bending downward at the tips, plus prominent white brow whiskers. They are most of the charm in that image and the current renderer draws three straight hairlines.

Six to eight per side plus two or three brow whiskers, each a quadratic **originating from an actual pad point**, never from a shared point in the middle of the face. Each stroked twice for taper: 1.2px at alpha 0.25, then 0.6px at alpha 0.7 on the same path. Lengths vary by 25 percent. Lag the head transform by three frames so they jiggle.

---

## 4. THE WHITE SPOTTING MODEL

White is not a shape and not a percentage. It is the union of fourteen seeded regions, each anchored at an anatomical point, each with an onset grade at which it appears and a growth span. Melanocytes migrate outward and downward from the dorsal neural crest; the last places they reach are the first to go white, and the order is repeatable.

### 4.1 The seed table

```
key        part    u     v     onset  span  maxR  shape   asym
chestBib   body   0.06  0.95   0.40   2.4   0.42  bib     0.0
chin       head   0.50  0.94   1.30   1.2   0.20  lobe    0.0
toe_FL     legFL  0.50  0.97   1.70   3.0   0.55  cap     1.4
toe_FR     legFR  0.50  0.97   1.70   3.0   0.55  cap     1.4
toe_HL     legHL  0.50  0.97   2.20   3.0   0.50  cap     1.4
toe_HR     legHR  0.50  0.97   2.20   3.0   0.50  cap     1.4
belly      body   0.45  1.00   2.80   2.4   0.50  blob    0.3
tailTip    tail   0.50  0.96   4.40   2.0   0.28  cap     0.0
muzzle     head   0.50  0.80   4.80   1.6   0.28  lobe    0.0
blaze      head   0.50  0.32   5.60   2.0   0.26  wedge   0.0
flank      body   0.55  0.66   6.80   2.0   0.44  ragged  0.5
shoulder   body   0.18  0.44   7.60   1.8   0.44  ragged  0.5
back       body   0.55  0.16   8.60   1.6   0.52  ragged  0.5
cap        head   0.50  0.06   9.20   1.2   0.55  blob    0.0
```

```
onset_i = seed.onset + jitter(DNA.seed, i) * seed.asym
t       = clamp01((white.grade - onset_i) / seed.span)
r_i     = smoothstep(t) * seed.maxR * (override_i == null ? 1 : override_i)
```

Three consequences fall straight out, none of which the current model can reach:

- **"Three white paws and not the fourth" is automatic.** Each paw seed gets an independent jitter of plus or minus 1.4 grades. At grade 4 a cat typically shows three or four white paws **at different heights**; at grade 3, one or two. This is exactly what real mitted cats do and it is free.
- **The two sides never match**, because every bilateral pair jitters independently.
- **A grade-0 cat cannot render white, structurally.** All onsets are above zero. The invented belly blob on cat1 becomes unrepresentable, which is the correct fix for a correctness bug.

### 4.2 Bib shapes

`chestBib` is not a circle. `white.bibShape` selects one of seven authored closed polylines in body UV, 12 to 16 points each: **locket** (a small oval), **round**, **teardrop** (wide at the throat, tapering to a point low), **flame** (narrow, wavering, long), **shield** (wide, flat bottomed), **split** (two lobes with a coloured island between), **ragged**. Scaled by `r`, sheared horizontally by `bibSkew`, stretched along v by `bibLength`. Seven shapes crossed with skew, length and seeded raggedness covers the real distribution.

### 4.3 The boundary is a band, not a line

This is the correction the photograph forces. Cat2's bib boundary is a transition **band** 10 to 20 percent of the bib's width, made of individual white hairs interdigitating into black fur, in both directions.

**Step one, displace the outline:**

```
n(t)  = amp * fbm1(seed * 7919 + seedIndex, t * freq)
amp   = (0.018 + 0.040 * coatLen01 + 0.030 * floof) * regionDiameter * white.edge
freq  = 8 + 7 * white.edge
```

`fbm1` is a 256-entry random table with cubic interpolation and three octaves, about ten lines. Draw through midpoints with `quadraticCurveTo` so it stays smooth but irregular rather than jagged.

**Step two, the interdigitation band:**

```
N = 14 + 46 * coatLen01           hairs distributed along the boundary
each: a tapered spike, length 1.5*amp to 4.0*amp, width 0.8px at base to 0 at tip
half in whiteTone pointing OUTWARD into the coat
half in coatMid  pointing INWARD  into the white
alpha 0.55 to 0.8, angles jittered by seed
```

For cat2 (`coat.length 1`, `floof 0.62`, `white.edge 0.70`) that produces the wide ragged band the photograph shows. For a shorthair it produces a crisp edge with a dozen stray hairs. This is the single cheapest thing in the whole document and it converts "decal" to "animal" instantly. The hard-edged egg on the sheet's calico is the giveaway.

### 4.4 White wins, and then receives light

The white layer is composited **after and over every pigment layer**, at full alpha, clipped to the part. Not underneath, not blended. A white paw has no bracelets; a blaze cuts a hole in the M; a bib erases the necklaces it crosses. That one ordering rule fixes the calico and the tuxedo at once.

But white is still fur. It sits at **B10**, so it receives the form gradient (B11), the occlusion (B12), the noise (B14) and the rim (B15) like everything else. Fill it with a short `createLinearGradient` from `whiteLit` to `whiteShade` along the key axis so it has its own local form on top of that.

### 4.5 Free bonus: colourpoint from the same field

Build a scalar `P(u, v)` equal to the lowest seed onset reaching that point. Threshold it against `white.grade` and you get spotting. Use it as a **gradient** instead, `pointDark = smoothstep(P)`, and you get a correct colourpoint: dark at the extremities (ears, muzzle, paws, tail, exactly the late-onset regions inverted), grading smoothly into a cream body, with legs darkening toward the toes. The hard oval mask on the sheet's colourpoint disappears for free. One baked field, two uses.

---

## 5. THE TUNER

**Governing law: spatial identity is set by tapping a picture of the cat, never by moving a slider. Owners cannot describe a body type, but they can point at one.** Sliders are only for continuous things a person can judge by eye. Every control is phrased as an observation they already have, and every screen keeps the photo on the left and the live breathing render on the right. **No numeric readouts anywhere.** Nothing is named after a parameter. `whiteAmt 0.34` never appears.

Target: 90 seconds, everything pre-filled, the owner is only ever correcting.

### Screen 1: "Is this her?"

The auto-filled cat, large, animated, in the actual room. Under it, four **nudge pairs** (each tap moves one derived quantity by a fixed step and re-renders) plus one real slider:

1. **warmer / cooler** to `pal.warmth`
2. **bolder / softer stripes** to `pal.contrast` and `pat.strength`
3. **fluffier / sleeker** to `coat.floof`, `coat.length`, `ruff`, `britches`, `tailPlume`
4. **rounder / slimmer** to `build.chonk`
5. **kitten to grown**, one slider, to `head.age`, which drives eye size, eye height, eye gap and muzzle together

Plus one button: **"shuffle the little things"**, which rerolls `seed` only. Owners love it and it costs nothing.

### Screen 2: Shape

A 3x3 grid of flat black silhouettes, best guess pre-selected: sleek and long, sleek and short, moderate and long, moderate, moderate and cobby, cobby and short, round and short, long legged, low slung. Tap the closest. Fifteen seconds, and it fills `build.frame`, `build.legLen`, `build.posture` and nudges `coat.length`, none of which the owner could ever have set directly.

Then a row of 5 head silhouettes, wedge to round, driving `head.width` and `head.cheek`. Then two sliders: **"Ear size"** and **"Ear set"**, the latter shown as a small skull picture with the ears sliding from crown to corners. Cat1 needs all three high and none of them exist today.

### Screen 3: White bits. The important screen.

One slider at the top: **"How much white?"**, labelled with pictures rather than numbers, driving the whole body live as you drag. Below it, a large line drawing of their cat in the shape they just chose, with tappable regions:

- **Four paws.** Tap each to cycle `none` to `toes` to `sock` to `boot`. Four seconds, and it is what makes cat2 recognisable.
- **Chin, bib, belly, tail tip, nose blaze.** Tap to toggle.
- **The bib**, when on, opens seven shape thumbnails, plus **"which way does it lean?"** and **"how far down?"**
- **"Anything else?"** drops a white spot wherever they tap, draggable, pinch to resize. This is `white.spots` and it is the escape hatch for the cat whose identity is one odd patch.
- One slider: **"Neat edges / Scruffy edges."**

This screen alone is worth more than the entire current parameter set for the 40 percent of cats that carry white.

### Screen 4: Face

Four tabby-face presets shown as **live head thumbnails rendered on their own cat**: *clean*, *classic M*, *broken M*, *heavy liner*. Tap one. Then three sliders: **"Eye rings"**, **"Pale muzzle"**, **"Cheek marks"**. Face markings cannot be estimated reliably from a photo, so this is presets with previews and never automation; a wrong automatic answer that the owner then has to find and undo is worse than one tap.

Plus a **nose colour** swatch row of four: pink, brick, black, spotted. Best identity per tap in the whole product.

### Screen 5: Eyes

**"Tap her eye in the photo."** One tap samples both iris stops, chroma clamped. Then eight preset swatch pairs to override with. Then two controls: a row of 5 aperture pictures from round to sleepy almond (`eye.aperture` and `eye.lidDrop`), and **"Round pupils / Narrow pupils"** (`eye.pupilRound`, floored at 0.25). Show the blink running so they can see it.

### Screen 6: Anything unusual? (skippable)

Chips, all off by default: *one white paw, white chin, white tail tip, notched ear, kinked tail, odd eyes, a scar, missing whisker, wears a collar.* Chips, not fields.

### The advanced fold

One "More" at the bottom of each screen, closed by default, most owners never open it: `pat.type` picker with live previews, `pat.scale`, `pat.breakup`, `pat.ghost`, `pat.tortie` and its colour, `legBars`, `tailRings`, `necklaces`, `ears.angle`, `ears.tipRound`, `ears.tuft`, `ears.tuftPale`, `ears.edgeFringe`, `head.muzzleLen`, `build.posture`, `coat.tailLen`, per-paw sock height, `bibSkew` numerics, individual face-mark strengths, `eye.lidTilt`, `eye.limbal`, `face.whiskerCount`, and per-eye colour override for odd-eyed cats.

### Never exposed

`seed`, the light rig, `bellyStop`, the `white.edge` floor, `patHalo`, `spineLine`, every derived colour, the fur flap parameters, the chroma clamps. These are craft settings. If an owner can turn them wrong they will, and then the drawing is ugly and it is our fault.

---

## 6. WHAT TO CACHE AND WHAT TO REDRAW

Budget: 16.6ms per frame. Room, physics and UI take about 6. **The cat gets 4ms and uses about 1.5.**

### Per frame, one cat at 200px, mid-range Android

| op | count | cost |
|---|---|---|
| `drawImage` of `ImageBitmap` plus `setTransform` | 7 to 11 | about 0.80 ms total |
| contact shadow, cached radial gradient | 1 | 0.08 ms |
| eyes, 14 layers x 2, 2 cached gradients | 2 | 0.30 ms |
| whiskers, 16 quadratics double stroked | 1 | 0.25 ms |
| **total** | | **about 1.45 ms** |

Four cats in a room: about 5.5ms, which still fits. Beyond four, degrade the background cats: bake whiskers into the head bitmap and drop the eye stack to six layers (socket, aperture, gradient, pupil, catchlight, limbal).

### Bake, on DNA or pose change

| stage | cost |
|---|---|
| geometry: anchor resolution, build displacement, fbm edge noise | 1 ms |
| body, B1 to B16 including one `filter` blur | 12 to 16 ms |
| head plus face decal | 8 to 10 ms |
| 4 limbs (offset-stroke shadow, no filter) | 4 ms |
| 3 tail segments | 3 ms |
| 2 ears including fringe and furnishings | 2 ms |
| `createImageBitmap` x 11 | 3 to 5 ms |
| **one pose** | **33 to 41 ms** |
| **three poses** | **100 to 125 ms** |

Bake the visible pose synchronously during the card reveal. Bake the other two in `requestIdleCallback`. If a pose change arrives before its bitmaps are ready, cross-fade over 120ms from the old pose, which you want anyway.

### Cached once, at module load

- The 128x128 alpha noise tile, as an `ImageBitmap`.
- The seven bib silhouettes, as normalised point arrays.
- The `fbm1` 256-entry random table.
- The three per-pose anchor rings and the six spine and belly polylines.

### Cached per DNA

- Every gradient object, in an LRU of 48 keyed by `(colourA, colourB, w, h, kind)`. **Creating a gradient inside the render loop is the number one performance bug in canvas character code.** The cost is in object construction, not the fill.
- The two iris radial gradients.
- The white priority field as a small lookup.
- An LRU of **8 baked cats**, keyed by a stable hash of the DNA object, so the room can hold several without rebaking.

### Resolution

Bake at `2 * min(devicePixelRatio, 2) * displaySize`, capped at 512px on the long edge of any single part. Render the game canvas at `min(devicePixelRatio, 2)` with CSS size set separately: DPR 3 on a mid Android costs 2.25x fill rate for nothing a human can see. Set `imageSmoothingQuality = 'high'` on the destination context. Use `ImageBitmap`, not source canvases; it blits measurably faster on Chrome Android.

### Banned per frame, no exceptions

`ctx.filter = 'blur()'` (5 to 15ms for a 300px region: it allocates a surface and runs a real convolution), `shadowBlur` (same cost, charged per draw call), `getImageData` and `putImageData` (pipeline stall), any per-hair loop, any `createLinearGradient`, `createRadialGradient` or `createPattern`, and more than four `clip()` calls.

**The rule that makes the whole document affordable: all softness happens at bake.** Blur, fur, noise, occlusion, rim, ragged white edges, stripes and rings are all expensive and all static. Motion is transforms plus two live path groups. That is how you get a wallpaper-quality drawing running at 60fps beside a physics loop on a phone.

### Animation, entirely through transforms

Breathing: `scale(1, 1 + 0.02*sin(t))` about a base pivot. Squash and stretch on opposed axes with volume preserved, `sx = 1+k, sy = 1-k`. Head bob as translate plus small rotate; because the head is its own bitmap the neck occlusion stays baked into the body and does not tear. Ear twitch as a rotate about the base anchor, plus or minus 8 degrees over 150ms, random every 2 to 5 seconds. Walk as two leg bitmaps rotating about hip and shoulder anchors on opposed sine phases, with a body bob at twice the leg frequency. Four transforms and it reads as a walk.

---

## 7. THE TWO REAL CATS

### 7.1 Cat 1, the brown mackerel tabby

Reading the photograph: a cobby, mature, broad-cheeked domestic shorthair. Her ears are the largest thing about her, tall, wide based, set well out on the corners of the skull, flared outward, with pale wispy furnishings inside and a distinct pale fringe of individual hairs along the outer edge. Her eyes are large, wide and near round with big indoor pupils. Her muzzle, pads and chin are distinctly cream against a much darker face. She has a strong pale spectacle around each eye with a hard dark mascara line just outside it, a stippled and broken forehead, a dark comma on each cheek, obvious whisker dots, a dusty rose nose with a strong dark liner and a dark bridge line running up between the eyes. Her coat is warm khaki brown with cream ticking. There is no white on her anywhere.

```
seed 0x4A21C7F3

pal.coatMid  #96795C     measured lit flank #917762, ticking #B39883
pal.coatDark #42342A     measured stripe core, lit
pal.undercoat #DFC5A6    measured lit pad #D2AA91
pal.whiteTone #F2EADF    unused, grade 0
pal.innerEar #C79E92     measured #C6A390
pal.noseLeather #B0736E  measured lit leather #A26563
pal.warmth +0.45   pal.contrast 0.60

build.frame +0.30   build.chonk 0.50   build.legLen 0.45   build.posture +0.10
coat.length 0   floof 0.20   ruff 0.22   britches 0.18   tailPlume 0.12   tailLen 0.70

head.width 0.62   head.cheek 0.78   head.muzzleLen 0.42   head.age 0.55
ears.size 0.88   spacing 0.82   angle +0.18   tipRound 0.25
ears.tuft 0.50   tuftPale 0.90   edgeFringe 0.80

eye.irisInner #CFC79A    eye.irisOuter #A5A776
     measured un-shadowed arc #C5BD91 / #BABB9B / #CCB991, HSV sat 0.22 to 0.29
eye.size 0.32   aperture -0.35   lidDrop 0.08   lidTilt 0
eye.pupilRound 0.85      measured: large and near round, indoor light
eye.limbal 0.85   eye.eyeRing 0.85

face.maskLight 0.85   M 'stippled'   mWeight 0.70
face.mascara 0.85   cheekComma 0.75   whiskerDots 0.75   noseBridge 0.65
face.whiskerColour #F2EADA   whiskerCount 8

pat.type 'mackerel'   strength 0.72   scale 1.00   breakup 0.50
pat.ghost 0   tortie 0
pat.legBars 0.70   tailRings 5   necklaces 1

white.grade 0            <- and that zero IS her identity
quirks []                <- no notch confirmed from the photograph
```

**What changes versus `real-compare.png`, in order of visible impact.** Grade 0 removes the invented belly blob. The chroma clamp takes her eyes from neon lime to the measured pale gooseberry, at roughly one third the saturation, with a two-stop gradient, a limbal ring, a lid cast shadow, a straddling catchlight, a bounce dot and a near-round warm-brown pupil. `maskLight 0.85` gives her the cream muzzle, pads and chin she actually has, so the face finally reads light centre and dark surround. Eight face marks appear where there were none: spectacles, mascara, inner-corner lines, cheek commas, whisker dots, bridge line, stippled forehead, nose liner. `legBars` and `tailRings` stop a striped body having plain legs and a plain tail. The double stroke turns the barcode into agouti-banded stripes that spring off a dark spine, bow with the ribcage, taper at both ends, break into dashes as they descend and stop dead before the pale belly. `warmth +0.45` moves her off putty. `ears.edgeFringe 0.80` gives her the pale hair halo that is the most distinctive thing about her head silhouette. And a contact shadow glues her to the floor.

**What cannot be captured.** Her forehead is a fingerprint and `M: 'stippled'` is a family resemblance; the specific arrangement of her blotches is not reproducible without a per-cat mark placer, which is a v2 feature. Her shoulder stripes are diffuse and her flank stripes are crisp, and `breakup` is one global number; a per-region breakup curve is cheap to add later and I would not ship it first. Real per-hair agouti banding is a baked noise tile and will read as a scatter on a 2x zoomed card. Her whisker dots are about 1px at 200px and will read as texture, not dots. And the mature jowl of a middle-aged female is not in the rig; `head.cheek` widens the pads but she will read slightly young.

### 7.2 Cat 2, the tuxedo semi-longhair

Longer and lighter framed, semi-long coat with a visible ruff and a thick plumed tail carried across the front. Fully black face with no blaze and no pale muzzle, so the gold eyes float with no structure around them. Long white furnishings sprouting from both pinnae, which on a black cat are the only face texture there is. Twelve or more prominent white whiskers per side in four rows, plus white brow whiskers. The bib begins as a narrow strip at the chin, widens through the throat, then hangs as a broad rounded teardrop down the chest past the elbow, leaning to his right, with a boundary that is a wide band of interdigitated hairs rather than an edge. The extended left forepaw carries a white cap over the toes only, stopping well short of the ankle; the other three paws are entirely black.

```
seed 0x91B0E44D

pal.coatMid  #221E22     measured face-lit #3B373D, back median #0B0A0C, tail #252427
pal.coatDark #0E0C0F
pal.undercoat #3A353A
pal.whiteTone #F0E7DE    measured bib #E3D0D0, paw #E4D0C4, white-balance corrected
pal.innerEar #3E3236     pal.noseLeather #241D21
pal.warmth +0.10   pal.contrast 0.22

build.frame -0.05   build.chonk 0.35   build.legLen 0.55   build.posture 0.00
coat.length 1   floof 0.62   ruff 0.60   britches 0.55   tailPlume 0.78   tailLen 0.82

head.width 0.50   head.cheek 0.58   head.muzzleLen 0.38   head.age 0.65
ears.size 0.78   spacing 0.50   angle 0.00   tipRound 0.15
ears.tuft 0.95   tuftPale 1.00   edgeFringe 0.55

eye.irisInner #D8B478    eye.irisOuter #9C7A40
     measured lit crescent quintile mean #B29A78, brightest pixels #C1A683,
     in a dim warm room. THE ESTIMATOR WILL UNDER-SATURATE HIM. The owner tap
     is not optional for this cat.
eye.size 0.26   aperture +0.45   lidDrop 0.32   lidTilt +0.10
eye.pupilRound 0.88      measured: hugely dilated
eye.limbal 0.25   eye.eyeRing 0.00
     limbal low and eyeRing zero: on a black cat you must SUBTRACT face
     structure, not add it, and the current renderer has no mechanism to do either.

face.maskLight 0.05   M 'none'   mWeight 0
face.mascara 0   cheekComma 0   whiskerDots 0.05   noseBridge 0
face.whiskerColour #FBF6EE   whiskerCount 13

pat.type 'solid'   strength 0   ghost 0.15
pat.legBars 0.08   tailRings 0   necklaces 0

white.grade 3.2   white.edge 0.70
white.paws ['toecap','none','none','none']    <- the sentence his owner says first
white.chin 1.0
white.bibShape 'teardrop'   bibSkew +0.30   bibLength 0.72
white.belly 0   blaze 0   tailTip 0   spots []
quirks []
```

**The black-cat treatment is a deliberate special case.** `coatMid` is `#221E22`, never `#000`, because a pure black fill is a silhouette-shaped hole with no drawing in it. A black cat carries almost no interior information, so **all of his form lives at the edge**: the strongest rim light in the rig, the heaviest halo silhouette, the most guard hairs, `ghost 0.15` so faint tabby appears in the light, and the OKLab `coatLight` derivation which warms the lit back for free. The gold eyes floating in a black face with no visible lid rim are the highest contrast object in the room, which is exactly right.

Note that his entire white map is seven values and it is exact. `whiteStyle: 'bib', whiteAmt: 0.3` cannot say any of it, and in particular cannot say "one white paw".

**What cannot be captured.** The exact bib contour: seven shapes crossed with skew, length and a seeded band gets to roughly 85 percent of correct, and the specific notch on its upper edge is a genuine fingerprint; the fix is a 12-point draggable outline in the advanced fold, and I would not ship it until someone complains. His whiskers are individually varied in curvature across four distinct rows; a single fan of 13 is fine at 200px and will read as a fan on the full-size card. The pink skin showing through the thin fur at the top of the bib. His greying undercoat showing through at the ruff parting, which is a fur-layer feature I am declining to build. And his plumed tail at 120px is about 9px wide with 4px of fuzz, so it will read as "fluffy" and not as "plumed"; that is a resolution limit, not a rig limit.

### 7.3 What neither cat can have, honestly

- **Head yaw past about 25 degrees.** `headTurn` is a lateral slide of a flat decal plus a far-eye scale. There is no 3D, so a cat looking over its shoulder is not available. Both photographs are three-quarter views and both warp convincingly; a cat whose signature look is full profile cannot be matched.
- **Fur that overlaps between parts.** Because limbs and body are separate baked bitmaps, the ruff cannot spill over the shoulder and the britches cannot spill over the flank. Long-haired cats will always look slightly more assembled than short-haired ones.
- **Loaf coat compression.** A real loaf squashes its coat against the floor and the silhouette changes. We fold the legs and keep the same edge treatment.
- **Movement, and this is the honest big one.** A meaningful fraction of what an owner recognises is gait, the specific speed of a tail flick, the way that cat's ears rotate. The rig gives us the joints and the transforms to express it. The animation direction is where the next round of work should go once the shape is right.
- **The headline trade.** At 120 to 240px this delivers "oh that is lovely, that is so her", not "that is a portrait of my cat". Under this brief that is the correct trade, and I would not spend an hour buying the second at the cost of the first.

---

## 8. BUILD ORDER

Ranked by visible improvement per hour, not architectural tidiness. **Nothing in steps 1 through 4 is invalidated by step 5**: the colour pipeline, the eye stack, the white model, the face marks and the light stack all clip to whatever path they are given, so rebuilding the silhouettes later throws none of it away.

| # | Work | Time | What the Director sees |
|---|---|---|---|
| **1** | **The colour pipeline and the eye stack.** OKLab conversion both ways, the chroma clamps, the sixteen derived colours, then the 14-layer eye with the lid cast shadow, limbal ring, straddling catchlight, bounce dot and warm non-black pupil at `pupilRound 0.80`. | 1 day | The single loudest ugly thing in the sheet is gone. Every cat on `catsheet.png` stops looking sinister and starts having jewels for eyes. Colour stops being putty. This is provable on day one against `real-compare.png`. |
| **2** | **Delete `whiteStyle` and `whiteAmt`. Ship `white.grade`, the 14 seeds, the overrides, the ragged band and the interdigitation hairs. Move white to B10, above all pigment.** | 0.5 day | Cat1 stops having invented white, which is a correctness bug, not a taste call. Cat2 becomes expressible for the first time. The calico's hard-edged egg is fixed by the same reordering. |
| **3** | **The face: the pale mask first, then the seven dark marks, then the spectacle, then the nose as a real construction with a liner and nostrils.** | 1 day | This is where the owner looks. Cat1's face goes from three tick marks to a full read. |
| **4** | **The light: pigment-then-light reordering, pattern via `multiply`, the linear form gradient, occlusion, bounce, noise tile, inner shadow, rim light, contact shadow.** | 1 day | Flat vector becomes a drawing. The one-line version of this, drawing the pattern with `globalCompositeOperation = 'multiply'` inside the body clip under the form gradient, is worth doing on hour one of this step because it alone is the difference between stripes on a shape and a striped animal. |
| **5** | **Silhouettes: three authored anchor rings, the build displacement table, the three-quarter body with a near-frontal head, far-side limbs at 0.86 value, and the two pose invariants.** | 2 days | Two cats stop being the same dome. This is the biggest lift in the document and it is what makes the whole thing survive scrutiny. |
| **6** | **The obligatory tabby set: leg bracelets, tail rings, tail tip, necklaces. Tail as three baked segments.** | 0.5 day | A striped cat stops having plain legs and a plain tail. |
| **7** | **Stripes as tapering, bowing, breaking curves off a spine line with belly exclusion, double stroked with the agouti halo. Classic and spotted derived from the same code.** | 1 day | The barcode becomes a coat. Deliberately last of the rendering work: it is the fiddliest and it is sixth on the recognition budget. |
| **8** | **Edge fur, halo silhouette, guard hairs, ear edge fringe, ear furnishings.** | 0.5 day | The shorthair and the semi-longhair finally differ at the edge, which is where coat length actually lives. |
| **9** | **The tuner, six screens.** | 2 days | The owner can fix the five things that are wrong. |

**The recognition budget, for the record: white placement, then face markings and eye colour, then coat warmth, then ear size and set, then fluff, then flank pattern.** Flank pattern is the only thing the current renderer does at all, and it is last.

**Day one deliverable:** re-render cat1 with steps 1 and 2 only, and put it beside `real-compare.png`. If that pair does not change the verdict, stop and re-plan before spending the other seven days.

---

## THE ACCEPTANCE TEST

After every change: **fill everything flat black, scale to 25 percent, squint.**

- You must be able to name the animal, the pose and the mood.
- **Cat1's silhouette and cat2's silhouette must be visibly different animals with all colour removed.** If they are not, the rig is still wrong and no amount of shading will save it. This is the test `catsheet.png` fails eight times over.
- The sit must show **two holes**: a triangular gap under the chin between the forelegs, and a gap between tail and body.
- The loaf's highest point must be the **withers**, not the hip.
- No tangents. The tail must never exit tangent to the body outline, and no ear tip may touch a marking.
- **Nothing may be bilaterally symmetric.** If the two sides match, the seed is not being consumed.
- No pure `#000`, no pure `#FFF`, no colour above the chroma clamps, anywhere on the animal.
- The `white.grade 0` path must be unreachable, provably, by unit test.

And the second gate, in colour, at full size: **would a stranger screenshot this.**