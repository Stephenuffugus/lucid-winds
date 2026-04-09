# LUCID WINDS — SVG ART BRIEF: BREED & COMPOST LAYER VISUALS
## For ChatGPT Art Director · 15 Layer Art Sets Required
### Production Manager (Claude Team) → Design Team · March 26, 2026

---

## CONTEXT

The breed layer engine (`evaluateBreedLayers`, Spec 11) activates 0-4 visual layers on bred plants. The compost layer system (Specs 7+) adds visual heritage markers on compost-born plants. **Nine breed layers and six compost layers need SVG art.** Chimera Vein already exists (cases 5-37 in renderLeaves). Mycelial Crown already exists (renderMycelialCrown). That leaves 15 art sets to deliver.

All art must fit inside the existing 70×95 viewBox. Pure inline SVG elements only — no `<image>`, no external references. Colors via inline hex or existing gradient IDs (`sg{uid}`, `bg{uid}`, `lf1{uid}`, `lf2{uid}`). All coordinates must respect the layer stack and clipping boundaries.

---

## THE VIEWBOX — YOUR CANVAS

```
ViewBox: 0 0 70 95

y=0   ┌─────────────────────── top
      │  SPORE HALO zone (above crown)
y~15  │  BLOOM ceiling
y~20  │  BLOOM + THORNED CROWN zone
      │  LEAF CANOPY (phyllotaxis spiral)
      │  BIOLUM SPOTS on leaf surfaces
      │  CANOPY WEAVE between leaves
y~45  │  CANOPY midpoint (widest spread)
      │  AERIAL ROOT dangling from lower leaves
y~60  │  LOWER LEAVES
      │  VIGOR BAND on stem midpoint
      │  NUTRIENT VEINS on stem body
y=74  │  FOSSIL IMPRINT on pot surface
y=78  │  SOIL LINE — stem base
      │  MYCELIAL CROWN (exists)
      │  ROOT TENDRILS below soil
      │  DECOMPOSER RINGS around stem base
      │  PHOENIX ASH glow zone
      │  POT BODY (y=78-92)
y=95  └─────────────────────── bottom
```

---

## RENDER ORDER (where each layer inserts)

Breed and compost layers render at specific points in the existing pipeline. The engineering team will wire insertion points. Art team delivers the SVG string functions.

```
1. Aura (background)
2. Base/Substrate
3. Stem ← VIGOR BAND renders ON stem, after stem fill
         ← NUTRIENT VEINS render ON stem, colored paths upward
4. Pot
5. ROOT TENDRILS ← render inside pot, below soil line
   DECOMPOSER RINGS ← render around stem base
   PHOENIX ASH ← render glow at soil line
   MYCELIAL CROWN (exists)
6. Foliage clip opens
7. Leaves ← BIOLUM SPOTS render ON leaf surfaces (inside clip)
           ← SPECTRUM LEAF modifies leaf gradient (no new art needed)
           ← CANOPY WEAVE renders arcs BETWEEN leaf pairs
8. Calyx
9. Bloom ← POLLEN DUSTING renders tiny circles around bloom
         ← HYBRID BLOOM modifies bloom color (no new art needed)
10. THORNED CROWN ← renders above topmost leaf, below bloom
11. Halo
12. Foliage clip closes
13. AERIAL ROOT ← renders OUTSIDE clip, dangling below low leaves
14. SPORE HALO ← renders above everything, halo ring above crown
15. Companion
16. Mutation FX
```

---

## DELIVERY FORMAT

Each layer is a JavaScript function returning an SVG string. Parameters vary per layer.

```javascript
// Template
function renderLayerName(params) {
  var s = '';
  // SVG elements concatenated into s
  return s;
}
```

ES5 only. No `const`, `let`, arrow functions, or template literals. String concatenation with `+`.

---

## BREED LAYERS — 9 ART SETS NEEDED

### B1: VIGOR BAND
**Where:** On stem body, at vertical midpoint
**Params:** `stemMidY` (y coordinate of stem midpoint), `stemWidth` (2-4px)
**Description:** A horizontal bark texture band — a thickened ring of wood grain that indicates hybrid vigor. Like a tree growth ring exposed on the surface.
**Visual:** 2-3 short horizontal strokes across the stem width, slightly darker than stem color, with one cream highlight line. Subtle — should look natural, not like a label.
**Coordinate zone:** x=32-38, y=stemMidY±2
**Opacity:** 0.3-0.5
**Example:**
```javascript
function renderVigorBand(stemMidY, stemWidth) {
  var s = '';
  var cx = 35, hw = stemWidth * 0.8;
  s += '<line x1="'+(cx-hw)+'" y1="'+stemMidY+'" x2="'+(cx+hw)+'" y2="'+stemMidY+'" stroke="#3A2A1A" stroke-width="0.6" opacity="0.35"/>';
  s += '<line x1="'+(cx-hw*0.7)+'" y1="'+(stemMidY-0.8)+'" x2="'+(cx+hw*0.6)+'" y2="'+(stemMidY-0.8)+'" stroke="rgba(240,235,216,0.25)" stroke-width="0.3"/>';
  s += '<line x1="'+(cx-hw*0.5)+'" y1="'+(stemMidY+0.8)+'" x2="'+(cx+hw*0.8)+'" y2="'+(stemMidY+0.8)+'" stroke="#3A2A1A" stroke-width="0.4" opacity="0.25"/>';
  return s;
}
```

### B2: POLLEN DUSTING
**Where:** Scattered around bloom position
**Params:** `fx` (bloom center x), `fy` (bloom center y), `flowerSize`, `uid` (for hash-based scatter)
**Description:** 6-10 tiny golden pollen specks floating near the bloom. Indicates both parents had flowers. Cosmetic only (+0 Terra).
**Visual:** Tiny circles (r=0.4-0.8) in gold/amber tones, scattered asymmetrically. 2-3 should have a faint animate drift (1-2px vertical oscillation over 3-4s).
**Coordinate zone:** fx±8, fy±8
**Opacity:** 0.25-0.55

### B3: ROOT TENDRILS
**Where:** Below soil line, inside pot body
**Params:** `uid` (for hash-derived variation)
**Description:** 3-4 thin root paths extending below the stem base into the soil. Indicates the parents had very different stem genetics.
**Visual:** Thin bezier paths (stroke-width 0.3-0.5) in muted green/brown, curving downward and outward from x=35, y=78 into the pot interior.
**Coordinate zone:** x=28-42, y=78-86 (strictly inside pot)
**Opacity:** 0.2-0.35

### B4: THORNED CROWN
**Where:** Above topmost leaf pair, at stem crown
**Params:** `visibleTop` (stem top y), `uid`
**Description:** 3-5 small thorn spikes radiating from the crown area. Triggered by Obsidian base + dense canopy. Rare and visually striking.
**Visual:** Sharp pointed paths radiating at 30°-150° angles from the stem apex. Dark color (near-black or deep purple) with a single cream highlight line on each thorn.
**Coordinate zone:** x=28-42, y=visibleTop-4 to visibleTop+3
**Opacity:** 0.5-0.7 (thorns should be visible)

### B5: CANOPY WEAVE
**Where:** Arcs connecting adjacent leaf pairs
**Params:** Array of leaf positions `[{x, y}, ...]`, `uid`
**Description:** Thin silk-like threads connecting nearby leaves, creating a web canopy effect. Indicates both parents had dense foliage.
**Visual:** Curved bezier arcs (stroke-width 0.2-0.3) in cream/sage, connecting the 2-3 closest leaf pairs. Should look organic, not geometric — slight droop curves.
**Coordinate zone:** Between leaf positions (dynamic)
**Opacity:** 0.15-0.25

### B6: BIOLUMINESCENT SPOTS
**Where:** On leaf surfaces (inside foliage clip)
**Params:** Array of leaf positions, `uid`, `leafSize`
**Description:** 4-6 tiny glowing dots scattered on leaf surfaces. Triggered by Bioluminescent Pulse mythic parent. Rare and magical.
**Visual:** Small circles (r=0.5-1.0) with a soft glow filter — each dot has a bright core and a diffuse outer ring. Colors: cool cyan (#00E5FF) to warm gold (#FFD700) based on uid hash.
**Coordinate zone:** Scattered across leaf bodies
**Opacity:** 0.4-0.7 (dots should read as luminous)
**Animation:** Optional subtle pulse (opacity 0.4→0.7→0.4 over 2-3s, staggered per dot)

### B7: AERIAL ROOT
**Where:** Dangling from lowest leaf node(s), OUTSIDE foliage clip
**Params:** Lowest leaf position `{x, y}`, `uid`
**Description:** 1-2 thin dangling roots hanging from a lower leaf attachment point. Triggered by Hanging Pot parent + tall stem partner. Adds vertical flow.
**Visual:** Thin bezier paths (stroke-width 0.3-0.5) in muted brown/cream, curving gently downward from the leaf node toward the pot. Should look like gravity is pulling them.
**Coordinate zone:** From leaf y downward, x within 5px of leaf x, stopping before pot rim (y~76)
**Opacity:** 0.25-0.4

### B8: SPECTRUM LEAF (NO NEW ART)
**Engineering only.** Replace the leaf fill gradient with a 3-stop gradient using all unique parent colors. No SVG delivery needed — the engineering team swaps gradient definitions.

### B9: HYBRID BLOOM (NO NEW ART)
**Engineering only.** Use Parent A's bloom shape + Parent B's bloom color gradient. No SVG delivery needed — the engineering team swaps the color source.

---

## COMPOST LAYERS — 6 ART SETS NEEDED

### C1: DECOMPOSER RINGS
**Where:** Around stem base, at soil line
**Params:** `uid`
**Description:** 2-3 concentric partial arcs around the stem base. Indicates the plant was grown from compost. Always paired with Mycelial Crown.
**Visual:** Partial circles (60-120° arcs) in cream/tan at opacity 0.15-0.25. Not full circles — broken arcs suggest organic decomposition patterns.
**Coordinate zone:** cx=35, cy=77, r=4-8
**Opacity:** 0.12-0.22

### C2: SUBSTRATE MEMORY
**Where:** Behind current base, re-renders composted parent's base at ghost opacity
**Params:** `parentBaseIndex` (the composted source's base trait)
**Description:** A faint ghost of the composted parent's substrate visible behind the current substrate. No new art — re-renders the existing `renderBase()` case at 15% opacity.
**Engineering only — no new SVG needed.** Just calls renderBase with the stored parent base index and wraps in opacity group.

### C3: PHOENIX ASH (3 tiers)
**Where:** Around soil line, glow effect
**Params:** `tier` ('mythic' | 'legendary' | 'cosmic'), `uid`
**Description:** The "memory" of a composted high-tier plant, burning with residual energy.

**Tier A (Mythic source): Subtle amber haze**
- Soft elliptical glow at soil line
- 1 color: `rgba(200,168,75,0.06)`
- Coordinate: cx=35, cy=78, rx=12, ry=3

**Tier B (Legendary source): Golden shimmer + rising circles**
- Same amber glow, plus 3-4 tiny circles that slowly rise (animated translateY)
- Circles: r=0.4-0.6, gold, animated over 3-5s, staggered
- Coordinate: x=28-42, y=72-78

**Tier C (Cosmic source): Animated ember particle field**
- Same base glow, stronger opacity (0.12)
- 6-8 ember particles with animated drift (rising + slight horizontal wobble)
- Particles: r=0.3-0.5, alternating warm amber and cool violet
- Animation: translateY -4px over 2-4s, infinite loop
- Coordinate: x=25-45, y=70-80

### C4: FOSSIL IMPRINT
**Where:** On pot body surface
**Params:** `parentLeafType` (composted source's leaf type index), `uid`
**Description:** A faint outline of the composted parent's leaf shape, as if the leaf fossil were pressed into the pot ceramic.
**Visual:** Render a simplified version of the parent's leaf bodyD path at 8-12% opacity in a warm sepia tone (`rgba(180,160,120,0.10)`), positioned on the pot face area.
**Coordinate zone:** x=22-48, y=80-90 (on pot body)
**Opacity:** 0.08-0.12 — ghostly, almost subliminal

### C5: NUTRIENT VEINS
**Where:** Running UP the stem from roots
**Params:** `visibleTop`, `stemColor`, `veinColor` (from composted source's rare aura)
**Description:** Thin colored paths running upward along the stem body. Reverse of chimera veins (which are on leaves). Indicates the composted source had a rare aura.
**Visual:** 1-2 thin bezier paths (stroke-width 0.3-0.4) running from y=78 up to visibleTop+5, parallel to but offset from the stem center. Color matches the source's aura type.
**Coordinate zone:** x=33-37 (tracking stem path), y=visibleTop to 78
**Opacity:** 0.2-0.35

### C6: SPORE HALO
**Where:** Above the plant crown, ABOVE everything else
**Params:** `visibleTop`, `uid`
**Description:** A ring of tiny spore dots forming a halo above the plant. Event-only layer from Pollination Festival. One-gen, never inherits.
**Visual:** 8-12 tiny circles (r=0.3-0.5) arranged in a ring (cx=35, cy=visibleTop-6, ring radius=10-14). Alternating sage green and gold. Optional slow rotation animation.
**Coordinate zone:** cx=35, cy=visibleTop-6, r=10-14 (ring placement)
**Opacity:** 0.2-0.35 per dot

---

## PRIORITY ORDER

| Priority | Layer | Complexity | Why |
|----------|-------|-----------|-----|
| 1 | Phoenix Ash (3 tiers) | HIGH | Most visually dramatic compost layer |
| 2 | Thorned Crown | MEDIUM | Rare breed layer — needs to feel special |
| 3 | Biolum Spots | MEDIUM | Magical quality — key differentiator |
| 4 | Vigor Band | LOW | Simple — 3 lines on stem |
| 5 | Pollen Dusting | LOW | Simple — scattered circles |
| 6 | Root Tendrils | LOW | Simple — 3 bezier paths |
| 7 | Decomposer Rings | LOW | Simple — partial arcs |
| 8 | Canopy Weave | MEDIUM | Needs leaf positions — engineering coordination |
| 9 | Aerial Root | LOW | Simple — dangling bezier |
| 10 | Nutrient Veins | LOW | Simple — 2 stem-parallel paths |
| 11 | Fossil Imprint | MEDIUM | Needs parent leaf shape lookup |
| 12 | Spore Halo | LOW | Simple — ring of circles |

---

## TESTING HASHES FOR ART REVIEW

After delivery, the engineering team will render these test hashes to verify layer integration:

```
'f'.repeat(64)           — Max traits, all layers eligible
'0'.repeat(64)           — Minimum traits, baseline
'a5b3c1d2e4f6'.padEnd(64,'0') — Mid-range with flower
Custom hashes with mythByte 0xF4+ for Biolum Spots
Custom hashes with base index 16 for Thorned Crown
```

Each layer will be rendered in isolation first (force-on), then in combination with up to 3 other layers simultaneously to check visual stacking and clutter.

---

*Art Brief prepared by Production Manager (Claude Team).*
*Delivery: ES5 JavaScript functions returning SVG strings.*
*Coordinate validation: all elements must stay within 0-70 x-axis, 0-95 y-axis.*
