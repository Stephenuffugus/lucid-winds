# Slice Master style (working title — Stephen names it)

**Source request:** Penny (via Jessie doc, 7/16/2026) — plays "Slice Master" on poki. Doc cut off mid-sentence ("It counts…") — spec reconstructed from the actual poki game.

**Genre:** one-tap physics knife-flip runner. NON-botanical, kid-friendly, extremely snackable (poki's is one of their stickiest one-button games).

## Core loop (faithful to the original)
- A **knife auto-advances** through a side-scrolling course, flipping end-over-end. **Tap = hop-flip** (small upward impulse + spin). Physics: gravity + spin; the knife slices anything soft it touches while spinning.
- **Sliceables** (fruit, logs, jelly blocks…) burst for points; slicing chains build a combo.
- **Hazards:** hitting a wall/blunt obstacle edge-on stops the run (gentle fail — restart at the course start; courses are short, 20–40s).
- **Course end: the reward wall** — a target board of multiplier bands (×1 ×2 ×4 ×8 jackpot); where the knife finally sticks multiplies the run's points. This is the dopamine spike — land the jackpot band.
- Occasional **golden targets** mid-course pay bonus; slicing EVERYTHING in a course = "Clean Slice" badge.

## Progression
- **Course ladder** (30+ short courses, sequential unlock, per-course best score + 3-star thresholds).
- **Knife cosmetics** earned by points (KNOWN thresholds, no lootboxes): cleaver, katana, paintbrush (slices in color), starlight blade… ~12 at launch.
- **Daily Course** — seeded daily, one lock-in (house daily pattern; directory-eligible).

## Physics notes
Verlet or simple rigid: knife = 2-point segment (handle/tip) with angular velocity; slice check = tip speed above threshold while intersecting a sliceable; stick check = tip contact with target wall at angle within ±35° of normal. Machine-prove each course completable with a scripted tap sequence (Sled Vine proof pattern — bake tap-tick lists, replay through the live engine in a `?smtest=1` DEV hook).

## House integration
Same conventions as merge-blast.md: self-contained satellite, 540×960, sunbeam caps (+2 per course first-clear, +4 daily), studio music button, PWA kit, in-play home button, colorblind-safe (shapes not colors for hazards), portal row + thumb + ALIASES ('slice master knife flip fruit'), procedural art first.

## Open for Stephen
Name; theme skin (kitchen? workshop? cosmic forge?); whether slicing debris feeds any studio-wide keepsake.
