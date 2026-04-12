# STONE GARDEN — Complete Game Spec
## Petal Walk Physics Balance Game (Rock Stacking)

**Game #18 in the Petal Walk suite**
**Botanical Name:** Stone Garden
**Hash Code:** `stonegarden`
**Genre:** Physics / Zen / Puzzle
**Players:** 1
**Session Length:** 3-15 minutes
**Modes:** Zen (free build) / Challenge (reach target height)

---

## COMPETITIVE ANALYSIS

### The Market
The physical act of stacking stones (cairn building, rock balancing) is a global cultural phenomenon — zen gardens, hiking trail markers, meditative practice. Digitally, nobody has done it well.

### Closest Competitors
1. **Stack (Ketchapp)** — 100M+ downloads. NOT real physics stacking. Timing game with sliding blocks. Zero physics feel.
2. **Perfect Balance (TTG)** — Flash-era. Actual physics puzzler. Dead since Flash died. Never replaced. Reddit still mourns it.
3. **Jenga (official app)** — 3D, clunky controls. Universally hated on mobile.
4. **Various "Stone Stacker" apps** — All terrible. Broken physics, ugly, 2-3 stars, abandoned.

### Why They All Failed (or succeed for wrong reasons)
1. **Stack succeeds because it's simple** — but it's NOT stacking. It's timing. People want to FEEL the weight.
2. **Perfect Balance died with Flash** — nobody rebuilt it for mobile.
3. **3D stacking on 2D touchscreens doesn't work** — Jenga proved this. 2D side-view is the answer.
4. **Cheap physics engines feel wrong** — stones need WEIGHT. They need to THUD. They need to WOBBLE convincingly.

### Reddit's Exact Words
- "I want something that feels like actually stacking rocks by a river"
- "Perfect Balance was amazing, why hasn't anyone made a modern version?"
- "Give me zen mode where I can just stack forever"
- Stack is "not real stacking, it's just timing"

### Our Opportunity
**First polished 2D stone stacking game with real rigid-body physics, beautiful botanical aesthetic, both zen and challenge modes.** Blue ocean.

---

## GAME MECHANICS

### Core Loop
1. Stone appears at top of screen, hovering
2. Player drags LEFT/RIGHT to position horizontally
3. Player can TAP ROTATE button to rotate stone ±15°
4. RELEASE or TAP DROP to let go
5. Stone falls under gravity with full rigid body physics
6. Stone lands on stack/ground — collision, settling, wobble
7. If stack holds → next stone, score increases
8. If stack topples → game over (Challenge) or rebuild (Zen)

### Physics Engine (2D Rigid Body)
Each stone is a rigid body with:
- Position (x, y)
- Velocity (vx, vy)
- Angle (rotation in radians)
- Angular velocity
- Mass (proportional to area)
- Moment of inertia
- Width, height (bounding box for physics)
- Shape vertices (visual rendering — organic, irregular)

**Simulation:**
```
// Per frame (dt ≈ 16ms)
vy += GRAVITY * dt
x += vx * dt
y += vy * dt
angle += angularVelocity * dt
vx *= AIR_FRICTION  // 0.999
angularVelocity *= ANGULAR_DAMPING  // 0.98

// Collision detection: SAT (Separating Axis Theorem)
// Collision resolution: impulse-based with friction and restitution
```

**Constants:**
- GRAVITY: 600 px/s²
- RESTITUTION: 0.15 (stones don't bounce much)
- FRICTION: 0.7 (stones grip each other)
- ANGULAR_DAMPING: 0.96
- AIR_FRICTION: 0.9995

### Collision Detection (SAT)
For each pair of stones and stone-to-ground:
1. Project both shapes onto each potential separating axis (edge normals)
2. If projections overlap on ALL axes → collision
3. Find minimum penetration axis (collision normal)
4. Calculate contact point
5. Apply impulse-based resolution with friction

### Stone Shapes
Procedurally generated per level. Each stone is defined by:
- Base width × height rectangle
- 6-8 vertices displaced from rectangle corners for organic irregularity
- Visual rendering adds rounded corners, texture, moss

**Shape categories (by level):**
| Level Range | Stone Types |
|---|---|
| 1-3 | Wide, flat rectangles (easy to stack) |
| 4-6 | Mix of wide and medium stones |
| 7-9 | Some narrow/tall stones, some irregular |
| 10-12 | Varied sizes, some very small or oddly shaped |
| 13-15 | Extreme shapes: thin, tall, L-like, triangular |
| 16-20 | Maximum irregularity, tiny or huge, wedge shapes |
| 21+ | Chaos mode |

### Stability Detection
After each stone settles (velocity < threshold for 30 frames):
- Calculate combined center of mass of entire stack
- Check if COM is horizontally within the support base (ground contact footprint)
- If COM is outside support base → stack is unstable → topple sequence begins
- Visual wobble warning when COM is within 80% of support edge

### Two Game Modes

**ZEN MODE:**
- No fail state. Stack topples? Stones scatter, you start building again.
- Endless supply of stones
- Score = highest tower height achieved
- Moss gradually grows on settled stones (visual reward for patience)
- Background ambient sounds
- "Digital zen garden" — the whole point is the meditative act

**CHALLENGE MODE:**
- Target height line drawn on screen
- Stack must reach the line
- Limited stones per level (8-15)
- Increasing difficulty: fewer stones, weirder shapes, higher targets
- 3 lives (stack topples = lose a life)
- Game over at 0 lives
- Progressive levels 1-20+

---

## VISUAL DESIGN

### Botanical Zen Garden Theme
- **Background:** #0d100c with subtle horizontal sand pattern lines at bottom (zen garden raked sand)
- **Ground:** Flat sandy surface with tiny pebble details, y = 85% of screen height
- **Stones:** Natural irregular shapes with subtle texture
  - Rendered as rounded polygons with noise-displaced edges
  - Color: grays (#6b6b6b to #8a8a7a) with slight warm/cool variation
  - Subtle inner shadow for 3D-ish depth
  - Moss grows on stones that haven't moved for 3+ seconds (tiny green patches)
- **Target line (Challenge):** Dashed line in amber (#D4A843) with "TARGET" label
- **Height ruler:** Subtle marks on left edge showing height in "stones"

### Visual Juice
- **Landing thud:** Screen shake (2-4px, 100ms), dust particles burst from contact point, ring of expanding circles
- **Wobble warning:** Stack glows amber, slight oscillation animation
- **Topple:** Stones scatter with full physics, screen shakes hard, dust cloud, stones tumble and settle
- **Height milestone:** At new record height, subtle golden particles rise from the tower top
- **Zen moss:** Green gradient slowly paints onto stones that remain still — living tower effect
- **Water drip:** Occasional ambient drip particle falls past the screen (zen ambiance)

### Particle System
- Dust on impact (brown/tan puffs)
- Moss spores (green dots floating upward from settled stones)
- Height celebration (golden amber sparks)
- Wind particles (when wind is active in later challenge levels)

---

## MOBILE UI (Pixel 9 — 360×740)

### Layout
- **Top bar (40px):** Mode label | Score/Height | Level (challenge) or Record (zen)
- **Canvas (full remaining):** Physics simulation
- **Floating controls:**
  - Rotate CCW button (left side, 44×44px touch target)
  - Rotate CW button (right side, 44×44px touch target)
  - Mode toggle (Zen/Challenge) on start screen only

### Touch Interaction
1. **Touch & drag on canvas** → move hovering stone left/right
2. **Release** → stone drops from current position
3. **Tap rotate buttons** → rotate hovering stone ±15°
4. **After drop:** short delay (500ms) while stone settles, then next stone appears
5. **Pinch zoom** (stretch goal) → view full tower

---

## HASH INTEGRATION

### Milestone Events
- 1 hash per 3 successful stacks (stone settles without topple)
- 1 hash per new height record
- 1 hash per challenge level completed
- Bonus hash for stacking 10+ stones without topple

### buildAttentionPayload()
```javascript
_sr('stonegarden', {
  w: levelCompleted || newHeightRecord,
  s: score,
  ht: maxHeight,           // pixels of tower height
  st: stonesStacked,       // total stones placed successfully
  lv: challengeLevel,      // challenge mode level
  tp: toppleCount,         // times stack toppled
  mode: isZen ? 'zen' : 'challenge'
});
```

---

## GAME SELECTOR ENTRY
```javascript
{
  id: 'stonegarden',
  name: 'Stone Garden',
  icon: '🪨',
  desc: 'Stack stones in a zen garden — real physics',
  cat: 'dexterity',
  diff: 'medium',
  time: '3-15 min'
}
```

---

## TESTING CHECKLIST

### Physics
- [ ] Stones fall under gravity at consistent rate
- [ ] Stone-ground collision stops vertical motion
- [ ] Stone-stone collision resolves without interpenetration
- [ ] Friction prevents stones from sliding off each other unrealistically
- [ ] Angular momentum transfers correctly on off-center impacts
- [ ] Stack of 3+ stones remains stable when properly aligned
- [ ] Stack topples when COM exceeds support base
- [ ] No physics explosions or tunneling at any frame rate
- [ ] Restitution feels right (stones thud, don't bounce)

### Gameplay
- [ ] Stone positioning via drag works smoothly
- [ ] Rotation in ±15° increments works
- [ ] Score increases with height
- [ ] Zen mode: no fail state, can rebuild after topple
- [ ] Challenge mode: lives decrease on topple
- [ ] Challenge mode: level advances on reaching target
- [ ] Moss appears on settled stones after delay

### UI/UX (Pixel 9)
- [ ] All touch targets ≥ 44px
- [ ] No accidental drops during drag
- [ ] Rotate buttons accessible while dragging
- [ ] Canvas renders at 60fps with 15+ stones
- [ ] Particle effects don't cause jank
- [ ] HUD readable over game canvas
- [ ] Screen shake doesn't feel nauseating

### Edge Cases
- [ ] Very tall stacks (20+ stones) don't break physics
- [ ] Very fast drops don't tunnel through stack
- [ ] Tab switch during physics doesn't cause explosion on return
- [ ] Ground collision works at screen edges
