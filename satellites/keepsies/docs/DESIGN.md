<!-- Copied verbatim from assets/HANDOFF-28.md on 2026-09-04 (Stephen + Claude chat, v2 FULL, 2026-09-03). This is the DESIGN, the source of truth for what the game is. The BUILD PLAN, with corrections to this document that are binding where they conflict, is /HANDOFF-KEEPSIES.md at the repo root. Read both. -->

# HANDOFF.md — KEEPSIES (working title)
### Realistic 3D Marble Game — Complete Design & Build Specification, v2 (FULL)
**Studio:** Lucid Winds / Sky Wolf Studio Arcade (SWS Strategic Media LLC)
**Prepared for:** Claude Code (Opus 5) in GitHub Codespaces
**Product owner:** Stephen. All decisions below are FINAL unless marked OPEN.
**Sibling title:** RIPCORD (live: lucidwinds.com/satellites/ripcord) — shares design DNA, shares no code.
**Last updated:** 2026-09-03

---

## 0. HOW TO USE THIS DOCUMENT

This is the single source of truth and it is complete — game design, systems, full content catalog, tech architecture, build order. Rules for the builder:

1. **Read the whole document before writing any code.**
2. **Do not invent features.** Ambiguity → check §26 OPEN QUESTIONS. Not there → smallest reasonable choice, logged in `DECISIONS.md` at repo root.
3. **Build in phase order (§24).** A phase is done when its gate passes: sim harness green (§22), manual phone checklist done, HANDOFF status + session log updated.
4. **Mobile-first, always.** Nothing ships that isn't 60fps-capable on a mid-range 2021 Android phone (§20).
5. **All numbers in this doc are initial values** and live in `/src/data/tuning.json`, never hardcoded. Balance changes are data changes.

**STATUS: Phase 0 — no code exists. Repo is empty except docs.**

---

## 1. PRODUCT VISION

A realistic, physics-driven 3D marble game where **the marbles are the economy**. Players collect marbles — real playground/antique types up through fantasy and one-of-a-kind sulphides — and risk them in matches played *for keeps*: winner keeps the staked marbles.

**The fiction (voice + collecting conceit):** every marble in this game has been owned before. You don't buy product; you inherit pieces, and keepsies is the tradition continuing. All flavor text is one line, spare and a little wry — like an old man at a swap meet telling you where a marble's been. RIPCORD's copy register.

**Two modes at launch:**
- **RINGER** — authentic playground shooting marbles (real Ringer rules, house-rule toggles).
- **ARENA** — turn-based marble battle: visible damage, ring-outs, programmed special conditions, hazard arenas.

**One signature input:** THE KNUCKLE (§7) — the real thumb-snap of playground marbles, made the actual mobile gesture. No pull-back slingshot anywhere in ranked play.

**Core emotional loop:** *my best marble is also my most beautiful possession — do I risk it?*

**Platform path:** mobile web PWA first (portrait, touch), desktop same build, VR third via WebXR on Quest (§21). One codebase. One input model (thumb snap = controller snap = hand-tracked literal thumb flick).

**Explicit non-goals for v1:** no real-money purchases of any kind; no player-to-player trading; no real-time multiplayer (turn-based async only, and not until Phase 4); no permanent damage to owned marbles.

---

## 2. TECH STACK & CONSTRAINTS (FINAL)

| Concern | Decision |
|---|---|
| Renderer | Three.js, latest stable, version pinned via import map |
| Physics | Rapier (`@dimforge/rapier3d-compat`, WASM). Deterministic, runs headless in Node. Fallback to cannon-es only if WASM proves unworkable on low-end targets — log in DECISIONS.md |
| Build | **No build step.** ES modules + import maps, pinned CDN. Multi-file repo, no bundler/transpiler/framework |
| Language | Vanilla JS (ES2022). JSDoc on public APIs. No TypeScript |
| Hosting | Firebase Hosting primary, GitHub Pages mirror |
| Backend (Phase 4+) | Firebase Auth + Firestore + one Cloud Function (match verification, §25) |
| Assets | glTF 2.0 (.glb); KTX2/Basis textures where supported, PNG fallback |
| Audio | **100% synthesized via WebAudio — zero recordings** (§19). Studio signature carried over from RIPCORD |
| Save | localStorage (versioned schema §23) through Phase 3; Firestore mirror in Phase 4 |
| PWA | Installable, offline-capable for all solo content |
| Currency | Sunbeams (studio soft currency). Local `SunbeamWallet` interface now (`balance()/earn(n,reason)/spend(n,reason)->bool` + change event), localStorage-backed; Stephen wires the shared studio backend later. Do not import other studio code |

**Hard constraints:** 60fps on Pixel 4a-class Android (30fps graceful floor via quality scaler §20); initial payload ≤8MB compressed, marble assets lazy-loaded; every meta screen one-hand portrait; gameplay portrait-default; no login through Phase 3; everything solo works offline.

---

## 3. REPO LAYOUT

```
/
├── HANDOFF.md            ← this file (keep updated)
├── DECISIONS.md          ← builder's running decision log
├── index.html            ← shell + screen router mount
├── manifest.json, sw.js
├── /docs/checklists/     ← per-phase manual phone test checklists
├── /src
│   ├── main.js           ← boot, quality detect, screen router
│   ├── /core             ← ZERO DOM/three.js imports. Runs in Node.
│   │   ├── physics.js        Rapier world wrapper, fixed-step loop
│   │   ├── marbleBody.js     marble rigid-body factory from catalog data
│   │   ├── rules-ringer.js   pure-logic Ringer referee
│   │   ├── rules-arena.js    pure-logic Arena referee (turns, charge, conditions)
│   │   ├── damage.js         integrity/chip/crack/shatter model
│   │   ├── specials.js       passive/active effect implementations
│   │   ├── snap.js           gesture-sample → AimSource resolver (§7.6)
│   │   └── rng.js            seeded RNG (all randomness flows through here)
│   ├── /render
│   │   ├── scene.js          scene, lighting, CameraRig interface + implementations
│   │   ├── marbleMesh.js     procedural marble materials + glb loader, LODs
│   │   ├── arenaEnv.js       arena/ring environment loader (COL_ convention)
│   │   ├── vfx.js            trails, burn patches, ice, crack decals, shatter frags
│   │   ├── ceremony.js       ante/pot/ransom/technique-toast presentation
│   │   └── quality.js        perf tiers + dynamic resolution
│   ├── /input
│   │   ├── knuckle.js        touch implementation of the Knuckle (§7)
│   │   ├── knuckleXR.js      (Phase 5) controller + hand-tracking implementation
│   │   ├── pullback.js       accessibility fallback aim (§7.8)
│   │   └── cameraCtl.js      orbit/inspect controls
│   ├── /game
│   │   ├── ringer.js         Ringer mode controller (wires core+render+input)
│   │   ├── arenaMode.js      Arena mode controller
│   │   ├── match.js          ante/pot/escrow/keepsies resolution
│   │   ├── ai.js             AI shot planner (headless clone sampling)
│   │   └── bosses.js         boss personas, league ladder state
│   ├── /meta
│   │   ├── collection.js     inventory grid, marble inspect turntable
│   │   ├── showcase.js       showcase case (3D room scene — VR seed)
│   │   ├── drops.js          pouches, pity counters
│   │   ├── economy.js        wallet, ransom, clay pool regen, chores
│   │   ├── progression.js    XP, levels, unlock gates, techniques earned
│   │   ├── practice.js       Practice Ring (player-facing sim, §15)
│   │   ├── onboarding.js     first-session flow (§16)
│   │   └── save.js           versioned persistence + migrations
│   ├── /audio
│   │   └── synth.js          physics-driven WebAudio synthesis (§19)
│   └── /data
│       ├── marbles.json      full catalog (§10) — generated from tables in this doc
│       ├── bosses.json       personas, collections, rules, signatures (§13)
│       ├── droptables.json   §11
│       ├── techniques.json   named techniques (§14)
│       ├── chores.json       daily chore pool (§17)
│       └── tuning.json       every physics/balance number in this document
├── /assets  /models /textures /audio-impulses(none: synth only) /env
└── /sim
    ├── harness.js            Node headless simulator (§22)
    └── /scenarios/*.json
```

**Non-negotiable architectural rule:** `/src/core` imports nothing from render/input/DOM. The sim harness, the AI planner, and (Phase 4) server verification all run this exact code headless. This separation is the project's spine.

---

## 4. UNITS, SCALE, DETERMINISM

- 1 unit = 1 meter. Gravity −9.81y. Real-world scale everywhere — in VR these are actual-size marbles at your feet; nothing may break metric scale.
- Marble diameters: mibs/commons **16mm**; shooters ("taws") **22mm**; Peewee 12mm; arena oversize caps 35mm.
- Physics: **fixed timestep 1/120s**, render interpolation. Determinism is a product feature: (seed + input log) → bit-identical replay, verified by state hash. Foundation for the sim harness, the Practice Ring, AI planning, and Phase-4 anti-cheat.
- All randomness through `rng.js` (xoshiro or mulberry32, seedable, streams per subsystem: `match`, `drops`, `cosmetic`).

## 5. PHYSICS SPECIFICATION

### 5.1 Bodies
Rapier dynamic `RigidBody` + `Ball` collider per marble. **CCD on** for any marble exceeding 2 m/s (snapped shooters tunnel otherwise). Linear damping 0.18, angular 0.12 baseline; surfaces multiply.

### 5.2 Material physics (initial → tuning.json)
| Class | Density kg/m³ | Restitution | Friction |
|---|---|---|---|
| Clay | 1800 | 0.55 | 0.45 |
| Glass | 2500 | 0.78 | 0.30 |
| Agate/stone | 2650 | 0.72 | 0.34 |
| Steel | 7800 | 0.60 | 0.22 |
| Fantasy | per-marble override, ±25% max off its base class | | |

Mass = density × volume at diameter. Never set mass directly.

### 5.3 Surfaces
Dirt ring: fr 0.55 / rest 0.35. Polished arena: fr 0.18 / rest 0.60. Ice zone: fr 0.04. Sand trap: fr 0.90. Rubber bumper: rest 1.1, exit speed clamped to 4.5 m/s. Burn patch: no physics change, applies burn damage (§9.4) on contact.

### 5.4 Tuning workflow (mandatory order)
1. Ringer physics in the harness first, no graphics.
2. Scenario `ringer_break`: taw at 3.5 m/s into the 13-mib cross → 1–3 mibs exit the 1.5m-radius ring; taw remains inside on ~50% of shots. Tune friction/damping until green.
3. Only then wire rendering. **Feel is validated numerically before visually.**

## 6. DESIGN DNA (inherited from RIPCORD — binding, not decorative)

1. **Gesture quality is expressive, not punished.** "A messy flick is not a weak flick, it is a wild one."
2. **Pre-commitment over mid-action input** — specials are programmed conditions, not buttons.
3. **Discovered names** — techniques and combos get named by the game when you first do them.
4. **The simulator is a player feature** (Practice Ring), not just a dev tool.
5. **All audio synthesized from the physics.** Nothing is a recording.
6. **Spare, wry copy.** One line of lore each. No exclamation points in system text.

## 7. THE KNUCKLE — signature input (input/knuckle.js → core/snap.js)

The real playground shot: knuckle down in the dirt, marble against the index finger, thumb cocked, snap. The phone gesture IS this motion. One continuous gesture, three readable layers. **No pull-back slingshot in ranked play, no trajectory prediction ever in ranked.**

### 7.1 Layer 1 — Knuckle down (brace)
Touch-and-hold near your shooter = your knuckle in the dirt. **Hold stillness matters:** jitter of the touch point over the last 600ms maps to the accuracy cone. Steady hold → a breathing reticle visibly settles → cone tightens from ±6° to ±1.5° over ~1.2s of stillness. Soft haptic "settle click" at full brace. Moving your aim (see 7.7) resets settle partially. While braced you see: aim line (direction only, no path prediction), your charge meter, threat shimmer (§9.2).

### 7.2 Layer 2 — The snap (power)
No drag-back. **Flick the thumb forward through the marble.** Power = actual sampled velocity of the touch over the final ~90ms before release (same sampling window the VR controller flick will use). Drag distance is meaningless; physical speed is everything. Mapping: thumb speed 0.2→2.4 m/s (screen-space, calibrated §7.5) onto launch 0.5→6.0 m/s, ease-out curve so the top 20% of human effort buys the last 12% of power.

### 7.3 Layer 3 — Contact + path (spin/"english")
Where the snap path crosses the marble and how the path curves encodes spin, billiards-style but felt: low across the ball = backspin (the "Sticking" stop shot — essential Ringer tech); over the top = topspin follow; off-center = side english; a hooked/curved path = wildness (extra spin magnitude + a controlled noise term on the axis). Clean straight snap through center = pure clean shot. Wildness is a real strategy: harder to predict, can do things clean shots can't.

### 7.4 Warming the taw
While braced, a slow circular rub on the marble (distinct from jitter: low-frequency, deliberate, ≥ half-circumference arcs) charges the active meter +4/turn max and plays a soft glass-warming shimmer. Ritual layer; real players warm their shooters. Optional.

### 7.5 Calibration = first 20 seconds of onboarding
"Show me your hardest snap." Three snaps; we store the 90th percentile as that player's 1.0 power. Per-profile. A kid's flick and an adult's flick both reach max at *their* max. Recalibrate any time in settings. Also captures handedness (mirror UI).

### 7.6 AimSource (the one struct across all platforms)
`{ origin, dir, power01, contactOffset:{x,y}, pathCurvature, wildness01, braced01, warmed:boolean }`
Touch produces it (knuckle.js). Phase 5: VR controller flick and Quest hand-tracked literal thumb-flick produce the identical struct (knuckleXR.js). `core/snap.js` converts AimSource → impulse + angular velocity. Game code never sees raw input.

### 7.7 Aiming & camera
Aiming direction = camera-forward ± the snap's fine angle (cone ±25° max). Orbit camera with off-hand or before bracing; snap only fine-tunes. Keeps snaps short, comfortable, one-thumb. Second finger planted elsewhere on screen while snapping = **literal knuckling down**: accuracy cone floor −40%, power cap 90%. Brace harder, hit truer, give up the haymaker.

### 7.8 Forgiveness & accessibility
- Snap below 0.35 m/s thumb speed → cancel (return to brace), never a wasted turn. A deliberate sub-power tap-push (0.35–0.6) is a legal soft nudge shot.
- House rule `slips` ON: one re-do per player per game for a fumble.
- **Pull-back fallback** (input/pullback.js) in Settings → Accessibility: classic drag aim with power meter, plays everything unranked-normalized (matchmaking flags it Phase 4+; vs AI it's simply allowed). Never shamed in copy.
- Rookie Assist (default ON at levels 1–3, off in ranked forever): shows first 0.4s of predicted path.

## 8. MODE 1 — RINGER (rules-ringer.js)

Authentic Ringer, pure-logic referee, headless-testable.

### 8.1 Setup
Ring 3.05m (10ft) on dirt (house rule sizes: 2.1m/3.05m/4.0m). 13 mibs (16mm) in a + cross at center, 75mm spacing. Each player shoots their chosen taw (22mm) from their collection. Turn order by **lagging**: both roll a marble at a line, closest first (quick interaction; skippable → seeded random).

### 8.2 Turn rules
1. First shot of a turn knuckles down anywhere outside the ring edge.
2. Knock any mib fully out of the ring → pocket it, **shoot again** from where the taw lies (inside) or from the edge (if it exited).
3. No mib exits → turn over. Taw stays where it lies inside the ring ("Sticking" via backspin is how you control this).
4. Opponent may target your taw (see `poison`).

### 8.3 Win & house rules (match-setup toggles)
Win: first to pocket **7 of 13**. Toggles: `keepsies` on/off ("for fair") · `slips` (one re-do) · `bombing` (vertical drop shot allowed when your taw is inside the ring — dedicated drop-shot input: brace on taw, snap downward-screen) · `poison` (knocking out the enemy taw = it's out for the game AND steal one of their pocketed mibs) · `ringSize`. Quickplay defaults: keepsies ON vs AI, slips ON, bombing OFF, poison OFF, 10ft.

### 8.4 Keepsies visualization
With keepsies ON the pot is materialized: staked marbles are placed IN the cross (pot marbles + commie filler to reach 13). You are literally shooting at what you might win. Pocketing a pot marble doesn't award it mid-game — the whole pot resolves to the match winner (§12) — but seeing the Bloodstone Aggie sitting on the center cross is the point.

### 8.5 Presentation
Portrait default: elevated ~35° behind-the-taw cam auto-framing taw+cross; pinch zoom; one-finger orbit outside the marble; top-down tactical toggle. Shot cam (brief low follow on hard snaps) on Medium+ quality, skippable.

## 9. MODE 2 — ARENA (rules-arena.js)

Turn-based 1v1 (4-player FFA is OPEN, post-launch lean). Win by **shattering** all 3 enemy marbles or reducing enemy to no legal marble (all shattered; rung-out marbles can return). Alternate turns; 12s aim timer ranked / untimed casual; physics resolves fully between turns (all asleep or 6s cap).

### 9.1 Board state
Bags of 3 are public from ante screen. Special **conditions are hidden** (the mind-game). One active marble per player lives in the arena; benched marbles sit in a visible rack on your arena edge. Everything persists between turns: positions, integrity, floor states (burn/ice), hazard cycle counters. The arena is a developing situation.

### 9.2 Turn anatomy (target 15–25s)
1. **Read** — orbit freely; hazard indicators show next cycle ("piston fires in 1 turn" — all hazards are turn-cycle deterministic, never wall-clock). Threat shimmer marks your marbles inside a known danger.
2. **Positioning act (optional, one):** **Swap** (recall active to rack, roll a benched marble in at your edge — gentle entry, no attack momentum this turn: that IS the cost) or **Re-perch** (shift rack one slot along your edge, changing future entry point).
3. **Brace & snap** (the Knuckle, identical to Ringer).
4. Resolution — programmed specials fire mid-physics when conditions meet.

### 9.3 Integrity (damage.js)
The marble is the health bar — no floating HP. `integrity` 0–100 per marble per match (never persists to the collection; owned marbles are never permanently damaged — FINAL).
Damage per impact: `dmg = clamp((relSpeed − 1.2) × attackerMassKg × 55 / defenderHardness, 0, 35)`.
Visual tiers: 100–70 pristine → 69–40 **chipped** (decal chips, dust puff at transition) → 39–1 **cracked** (fracture-web decal + faint interior glow on fantasy glass) → 0 **shatter** (slow-mo fragmentation, 12 physics fragments, 4s TTL).
**Burn:** patches/trails apply 4 dmg per contact-second, ticks at most once per 0.5s per marble.

### 9.4 Charge (the connective resource)
One meter (0–100) **per marble**, persists through swaps and rack time, dies at shatter. Fill: +8 per 10 dmg dealt · **+12 per 10 dmg taken** (defenders charge faster — comeback pressure) · +5 per rail/bumper hit · +4/turn warming · Bioluminous only: +4/turn benched. A full meter is **public**: the marble overglows. 

### 9.5 Programmed actives (specials.js)
Actives never have buttons. Pre-match, per marble, choose ONE condition; the active **auto-fires when meter is full AND condition met**. Meter public, condition secret → play around the glow. Launch conditions (6): `when cracked` · `when meter fills (immediate)` · `on Nth enemy contact (N=1–3)` · `on rail/bumper touch` · `enemy within close range (0.25m)` · `when a bagmate shatters` (vengeance) · plus `on entering the arena` (ambush swap tech). *(That's 7 listed — cut `on rail` OR `Nth contact` if playtest shows condition-guessing is too diffuse; log in DECISIONS.md. Ship max 6.)*
Grail *Almanac* reveals enemy condition **category** only (contact/position/state).

### 9.6 Comeback architecture (never rubber-band aim or damage)
- Defender charge bonus (above).
- **Last-marble resolve:** final marble gains +15% hardness and 2× meter fill. Durability and inevitability, not damage.
- Vengeance condition exists so a shattered bagmate can be a plan.

### 9.7 Ring-out vs shatter (two win textures)
Ring-out (off arena / into pit, 3s recovery fail): the marble goes to your rack, **keeping current integrity**, can re-enter later by swap; a fresh marble enters for the rung-out player immediately at full 100. Safer to attempt, less permanent. Shatter: permanent removal this match, but you fed their charge getting there. Steelies push; glass executes (glass class: +40% shatter-bonus threshold vs cracked targets). 
**Shatter-point rule:** any hit above a modest threshold can finish a cracked (≤39) marble; if lethality came from the shatter bonus rather than raw damage, play the glass-fracture cam — every kill reads as overwhelm or placed killshot.

### 9.8 Arenas (launch: 3, all hazards turn-deterministic)
1. **The Ring** — the dirt ring with an edge drop-off. Reuses Ringer env.
2. **Foundry** — center molten pit (instant ring-out), rubber bumpers, piston hazard on a 2-turn cycle.
3. **Glacier** — ice friction zones; breakable ice tiles over water pits (tiles crack under >4000 kg/m³ class mass, break on second crossing).
Arena .glb ≤40k tris, single 2k atlas + lightmap; collision = simplified meshes named `COL_*` (auto-consumed as Rapier trimesh, hidden from render).

### 9.9 Match shape (sim-gated)
Target 8–14 turns per player, 3–5 minutes. Harness scenario `arena_shape`: AI-vs-AI across all class matchups must land in that window; no class matchup outside 35–65% win rate at launch tuning.

## 10. THE CATALOG — 65 designed marbles (marbles.json)

### 10.1 Schema
```json
{ "id":"aggie_bloodstone","name":"Bloodstone Aggie","tier":"rare","class":"agate",
  "diameterMm":16,"physics":{"densityOverride":null,"restitutionOverride":null},
  "arena":{"integrity":100,"hardness":1.3,"passive":"old_bones","active":null},
  "render":{"type":"procedural","recipe":"agate","palette":["#7a1f1f","#2e4d2e","#d9d0c1"],"glb":null,"seeded":false},
  "lore":"Older than the ring it plays in.","stakeable":true,"source":"pouch|boss|starter|clay" }
```
`render.type`: `procedural` (shader recipe — most of catalog) or `glb` (Meshy/Blender — grails + boss showpieces). Recipes: `clay, clearGlass, catsEye(vaneCount,color), swirl, corkscrew, patch, slag(seeded), steel, agateBands, onionLayers, lutzSparkle, custom shader per epic/grail`. Hardness baseline 1.0; stat leans are ±10–20% unless specified.

### 10.2 COMMONS (14) — dust 5, the losable floor
| Name | Recipe | Note / lore |
|---|---|---|
| Dirt Plain | clay | "Somebody made ten thousand of these in an afternoon." |
| Redware | clay rust | "Worth one shot, same as anything." |
| Chalkie | clay white | "Writes on pavement in a pinch." |
| Milk Glass | opaque white | "The one you learn on." |
| Bottle Green | seedy green glass | "Was a root beer once." |
| Clearie | clear | "Nothing to hide." |
| Cat's Eye: Banana / Blue Jay / Grass Snake / Ember / Beet / Inkwell | catsEye(1, color) ×6 | "The playground standard, accept no substitute." |
| Peewee | clearie @12mm | tiny/light, hard to hit. "Small target, big mouth." |
| Commie | mixed filler | ring filler mib. "Common as dirt and twice as brave." |

### 10.3 UNCOMMONS (20) — dust 25, stat leans, no abilities
Swirls: **Ribbon Candy** (red/white), **Nine Vane** (9-vane cat's eye, wilder off-center), **Oxblood**, **Seafoam Twist**, **Custard Swirl**, **Licorice Rope**, **Peppermint**, **Blue Onion**.
Corkscrews: **Auger** (+side-english retention), **Double Helix**, **Barber's Due**.
Patch/opaque: **Patch Pirate**, **Brick** (+hardness −restitution), **Slag** (seeded unique swirl — collectors chase pretty ones).
Steel: **Bearing** (entry tank), **Rusty** (+friction, pitted), **Chrome Dome**.
Stone: **Riverstone**, **Limey** (−integrity 85, +speed).
Wildcard: **Lucky Chip** — glass with a real chip; flat spot = slight roll wobble (deterministic per-seed). "Survived something. Won't say what."

### 10.4 RARES (14) — dust 120, ransom 400☀, passives only (no actives below epic — FINAL: uncommons lean, rares behave, epics scheme)
| Name | Class | Passive | Lore |
|---|---|---|---|
| Bloodstone Aggie | agate | **Old Bones** — immune to first crack transition (holds at 40) once/match | "Older than the ring it plays in." |
| Bumblebee Aggie | agate | **Sting** — +20% dmg on first contact after entering arena | "Mind the stripes." |
| Onionskin | glass | **Shed** — ignores first would-crack hit, visibly loses a layer | "It has more coats than you have hits." |
| Clambroth | glass | **Slick** — +15% speed retention on rail contact | "Milk and wire." |
| Lutz | glass | **Glint** — warming charges double | "Real gold? No. Real trouble." |
| Sulphide Blank | glass | **Hollow** — −20% mass, +20% launch speed | "Whatever lived in there got out." |
| Indian Blanket | glass | **Warm Welcome** — +25 charge on entering arena | "Woven tight." |
| Tiger Iron | stone | **Lodestone** — curves slightly toward nearest steel-class marble | "It leans. You'd swear it leans." |
| Frost Heave | glass | **Pre-Broken** — 30% less damage while cracked | "Already broken. Try again." |
| Drop Anchor | steel | **Set** — +50% effective mass from shot-resolve until its next turn | "It arrives. It stays." |
| Mercury | steel | **Quicksilver** — +launch speed, −hardness (0.8) | "Fast for its weight. Wrong for its weight." |
| Snake Eye | glass | **Read** — while braced, shimmer also reveals if enemy meter >50 | "It blinked first. Nobody believes you." |
| Kiln Kiss | clay | **Fired Twice** — clay stats, agate hardness (1.3) | "The kiln kept it three days extra. It remembers." |
| The Widow | glass | **Inheritance** — absorbs a shattered bagmate's remaining charge | "Wears black for a reason." |

### 10.5 EPICS (8) — dust 600, ransom 1500☀, passive + active kits
| Name | Class/role | Passive | Active | Lore |
|---|---|---|---|---|
| Galaxy | glass striker | **Orbit** — enemies within 0.25m bend slightly toward it | **Gravity Well** — well at rest point for one enemy turn; their shot fights the pull | "Hold it to the light. That's not paint." |
| Molten Core | stone bruiser | **Heat Bleed** — contact leaves 2s burn trail | **Eruption** — next impact detonates: cone knockback + burn patch | "Warm in your pocket. Always." |
| Glacier | glass tank-striker | **Rime** — floor behind it low-friction 1 turn | **Flash Freeze** — enemy contact patch ices; their next launch has reduced grip (wilder) | "It creaks when the room is quiet." |
| Thunderhead | glass striker | **Static** — +3 bonus charge per rail hit | **Chain Zap** — dmg arc to ALL marbles within 0.5m, yours included | "Smells like rain before it hits you." |
| Deep Sea | glass tank | **Pressure Hull** — per-hit dmg capped at 20 | **Undertow** — drags nearest enemy one hand-span (0.2m) toward nearest edge | "Went down with something. Came up alone." |
| Obsidian Knapp | stone executioner | **Conchoidal** — +40% shatter-bonus threshold vs cracked | **Knapping Strike** — next hit ignores hardness entirely | "Every chip off it was on purpose." |
| Bioluminous | glass support | **Photosynthesis** — +4 charge/turn while benched (only bench-charger) | **Bloom** — heal own integrity +25, once (the ONLY heal in the game — keep it that way) | "It's not glowing. It's growing." |
| Nebula Swirl | glass wildcard | **Unstable** — all shots +wildness, +10% dmg | **Supernova** — spend 30 own integrity, massive omni blast | "No two alike. This one least of all." (seeded render) |

Kit philosophy: every active answers a question the arena asks — edges (Undertow), cracked standoffs (Knapp), turtled steelies (Knapping Strike), swap tempo (Bioluminous), aim itself (Flash Freeze). Nothing is "big damage, no text."

### 10.6 GRAILS (4) — ransom 5000☀, glb sulphides (figure inside), never in standard pouches, no dupes. Power ceiling EQUAL to epics; uniqueness maximal.
| Name | Figure | Passive | Active | Lore |
|---|---|---|---|---|
| The Drowned Knight | kneeling armored figure | **Vigil** — while benched, your active marble takes 10% less dmg (only benched aura) | **Last Stand** — would-shatter → survive at 1 integrity, +50% dmg for rest of match, once | "He's not resting. He's waiting." |
| The Astronomer | robed figure, lens raised | **Almanac** — see enemy condition *category* (contact/position/state) | **Eclipse** — one enemy turn: your shimmer hidden, meters display empty | "She knew you'd come. It's written down." |
| Koi | koi mid-turn (rotation-locked interior anim — the Meshy flex piece) | **Upstream** — immune to all pulls (wells, Undertow, Lodestone, magnets) | **The Leap** — short arc jump over anything, lands with splash force (only vertical move in game) | "Swims against everything. Wins." |
| The Ember Dragon | coiled dragon, one eye out | **Hoard** — +2 charge per marble in the match pot (keepsies-scaling) | **Wake the Dragon** — permanent: every contact applies burn, rest of match | "You don't own it. You're holding it." |

### 10.7 BOSS SIGNATURES (5) — exist nowhere else; keepsies off the boss only (§13)
| Boss | Signature | Kit | Lore |
|---|---|---|---|
| Dusty Coyle | **Coffee Tin Champ** (rare, chipped bumblebee) | **Underdog** — +20% all stats vs a higher-tier marble | "Beat everyone on his street. His street's small." |
| Marlene "Knuckles" Ito | **The Thumbsplitter** (steel rare) | **Kill Shot** — +40% dmg vs the enemy *taw/active shooter* | "Her knuckles say more than she does." |
| The Pit Boss | **House Edge** (obsidian epic) | **The Rake** — steals 3 charge per contact | "The house always. You know." |
| Old Ironsides | **Old Ironsides** (steel epic) | **Dreadnought** — max 0.2m displacement per hit · Active **Broadside** — point-blank triple-contact slam | "The letters stopped. The marble kept coming." |
| The Curator | **The First Marble** (grail: sulphide containing a tiny marble) | **Provenance** — copies passive of last marble touched · Active **Acquisition** — match-winning hit → struck marble displayed cracked in your showcase (cosmetic trophy toggle) | "Everything in the collection was won. Everything." |

## 11. DROPS & ACQUISITION (droptables.json)

Two paths by design: pouches (sunbeams) and keepsies (skill).
- **Standard Pouch** 300☀ — 78%C / 18%U / 3.6%R / 0.4%E / 0G. Pity: guaranteed R within 10, E within 40.
- **Collector's Pouch** 1200☀ — 0C / 55%U / 36%R / 9%E / 0G.
- **Grail Pouch** 6000☀, weekly cap 1 — 85%E / 15%G. No dupe grails ever: reroll to highest epic.
- Dupes → dust: C5 / U25 / R120 / E600. Dust is sunbeams (single currency — dust is just the earn `reason`).
- AI opponents **genuinely own and stake** catalog marbles per difficulty (§13.4) — beating AI is a real acquisition path pre-multiplayer.
- **No real money anywhere in v1.** Sunbeam sources: §17.

## 12. KEEPSIES ECONOMY (match.js + economy.js)

### 12.1 Ante flow
1. Setup shows both antes; vs AI the AI auto-matches your tier.
2. **Tier-matched rule:** equal count (1–3 each), max one tier gap, both consent. No common-vs-grail.
3. Pot escrows at match start — marbles leave both inventories into a pot object written to save with `inMatch` flag BEFORE first turn (crash-safe: interrupted match returns pot on boot; a marble can never duplicate or vanish via refresh — harness test required).
4. Winner takes pot. Draw/abandon → returned.

### 12.2 The floor — Clay Pool
10 clay commons, regenerate to 10 daily. Stakeable, losable, worthless (dust 1). Anyone can always play keepsies risk-free-ish.

### 12.3 Safety valves (build all three)
- **Ransom:** lose a rare+ → 24h buy-back window: R400 / E1500 / G5000☀. Paid → winner gets the sunbeams. Unpaid → winner keeps marble. One offer, no negotiation UI.
- **For Fair:** any match zero-stakes, full XP/sunbeams minus pot. Progression never requires keepsies.
- **Showcase Case:** 6 slots (12 via one-time 2000☀). Showcased = unstakeable, unloseable, unplayable. A real 3D shelf room (VR seed §21.4).

### 12.4 New-player protection
Human keepsies locked until level 5 (AI keepsies from the start — the tutorial for loss). First rare acquired auto-showcases with explainer toast.

## 13. BOSSES & THE LADDER (bosses.json, game/bosses.js)

Five leagues, five personas. Each owns a themed collection they genuinely stake, plus one signature marble found nowhere else. Boss matches are keepsies at the boss's rules and minimum ante. **Lose to a boss: they keep your marble and DISPLAY it — visible in their collection at rematch. Beat them to steal it back.** (Bosses never ransom; they collect. Your ransom window doesn't apply to boss losses — this is stated clearly pre-match in red. OPEN #5 if playtest shows it's too hot.)

| League | Boss | Personality/rules | Stakes |
|---|---|---|---|
| I | **Dusty Coyle** — kid, taped glasses, coffee tin | 7ft ring, slips ON, Ringer only | commons/uncommons |
| II | **Marlene "Knuckles" Ito** — retired champion; plays For Fair until you beat her once, then offers keeps | `poison` always ON | uncommons/rares |
| III | **The Pit Boss** — runs the Foundry, talks odds | Arena only, bombing legal in his Ringer rematches | rares |
| IV | **Old Ironsides** — nobody's seen the player, the marble arrives by mail | ante minimum epic | epics |
| V | **The Curator** — final; plays only for keeps, only vs grails; must own a grail to challenge | mode alternates per rematch | grail-tier |

League gates: beat prior boss + level gate (5/9/13/17/21). Each league = 5 rungs of named AI opponents (generated personas from a name+quirk table, builder authors 20) then the boss. Rung wins pay sunbeams + first-clear pouch.

### 13.4 AI (ai.js)
AI aims by sampling N candidate AimSources in a **headless physics clone** (the same /core code as the harness — §3's separation pays off here), scoring outcomes (mibs out, dmg dealt, self-risk, pot value protection), picking per difficulty: Rookie N=6 @60th percentile ±8° noise · Sharp N=14 @85th ±3°, uses backspin · Shark/Boss N=24 best ±1°, optimal conditions, hunts taws under poison. Think-time cap 1.2s wall clock on-device; quality scaler may reduce N. Bosses get scripted opening lines and one signature behavior each (Dusty over-winds… no — Dusty snaps too hard when losing: +power +wildness below 3 points down; Marlene always targets taws; Pit Boss favors hazard-cycle shots; Ironsides never swaps; Curator adapts to your last match's stats).

## 14. NAMED TECHNIQUES (techniques.json)

First time a player performs one, freeze-frame + name toast + entry in their Technique list (profile flex). Launch set (12): **Sticking** (backspin stop after mib contact) · **Bombing** (legal drop shot pockets a mib) · **Dirty English** (wild-flick shot that pockets 2+ mibs) · **The Lag** (win lagging by <2cm) · **Knuckled Down** (win a match using second-finger brace on every shot) · **Clean Sweep** (pocket 4+ in one turn) · **Poison Pen** (win via poison steal) · **Doorstep** (ring-out an enemy from your own entry turn) · **Cold Read** (shatter a marble the same turn its meter filled, before its condition fired) · **The Long Goodbye** (win with last-marble resolve active) · **Housebreaker** (beat a boss's signature marble with a common) · **Provenance** (win back a marble a boss took from you). Detection logic in rules referees; data-driven.

## 15. THE PRACTICE RING (meta/practice.js)

RIPCORD's Bench, marble-flavored, player-facing: pick your bag + any opponent you've met (incl. bosses) → run 200 headless arena rounds or 50 Ringer games instantly → win rate, per-marble damage/survival, average turns. Free, unlimited, no stakes, no rewards. It teaches loadouts and doubles as live balance telemetry (Phase 4: opt-in anonymous upload — OPEN #6). Runs in a Worker; must not jank the UI.

## 16. ONBOARDING — the first session (meta/onboarding.js), target 4 minutes to first real match

1. **Calibration as hook (0:00–0:20).** No logo dwell. A marble sits on dirt. "Show me your hardest snap." Three snaps, each launches the marble satisfyingly into darkness with full audio. 90th percentile stored (§7.5). Handedness captured.
2. **The break (0:20–1:00).** A ring fades in around you, 13 mibs. Guided: brace (feel the settle), snap the cross. Whatever happens, the game names what it saw ("that was a wild one" / "clean through the middle"). Teach Sticking with one guided backspin shot.
3. **Meet Dusty (1:00–2:30).** Dusty Coyle walks up with his coffee tin. One full 7-ft ring game, slips on, For Fair, Rookie Assist path preview ON. He chats one line per turn, spare and funny.
4. **The tin (2:30–3:00).** Win or lose, Dusty rattles the tin: "play you for real ones." Player receives starters: the Clay Pool (10), all six Cat's Eyes, 2 uncommons (Bearing + one random swirl), and **the Heirloom choice** — pick 1 of 3 rares laid on a cloth: Bloodstone Aggie (endures) / Lutz (charges) / Mercury (strikes). Unpicked two enter the pouch pool as normal.
5. **First keepsies (3:00–4:00).** Vs Dusty, ante 1 clay each. Real stakes, zero pain. If the player loses, the loss ceremony + ransom UI explainer runs on a worthless clay — the system is learned before it can hurt. First rare auto-showcases with the case explainer.
6. From then on: the ladder is open, pouches unlock at level 2, Arena at level 3 (with a one-match guided Arena intro vs Dusty's cousin using loaner marbles).

Skippable-after-step-2 for veterans (small "I've played marbles before" link).

## 17. PROGRESSION SPINE & DAILY LOOP (meta/progression.js)

- **XP → level**, from any match win or lose, For Fair included (win 100 / loss 40 / boss win 300; Ringer and Arena equal). Curve: level N needs 120×N XP. Cap 30 at launch.
- **Unlocks:** L1 Ringer+AI keepsies · L2 pouches · L3 Arena + bag editing · L4 house-rules editor + Practice Ring · L5 human keepsies (Phase 4) + pass-and-play keepsies · L7 Foundry arena · L9 Glacier arena + League II · L13 League III · L17 League IV · L21 League V. Every level-up pays sunbeams (level×20).
- **Sunbeam faucets:** first win of day 150 · match completion 15–40 by performance · 3 daily **chores** from chores.json pool, 60☀ each (e.g. "pocket 3 mibs in one turn", "win by ring-out", "win using a clay taw") · streak bonus day 3/5/7: +100/+150/+250 · technique first-earns 50 · dupes-as-dust. Target honest earn ≈ 400–600☀/day active play → Standard Pouch ~daily, Collector's every 2–3 days, Grail Pouch a weekly event. No energy systems, no timers on play itself, ever.
- **Pass-and-play:** 2 local profiles, one device, keepsies between them fully supported (siblings will love/hate it; it's authentic).

## 18. PRESENTATION & CEREMONY (render/ceremony.js) — the drama layer

- **Ante ceremony:** both stakes roll to center and clink into the pot (Ringer: onto the cross). Camera gives each staked rare+ a 0.6s hero glint. Haptic tick per marble.
- **Post-match pot resolution:** won marbles roll across the screen into your bag ONE BY ONE, each with its name card and clink. Loss side: your marble rolls away toward the winner; if ransom-eligible, the offer card slides in (24h countdown starts). This ceremony is the emotional core of the game — give it disproportionate polish time.
- **Shatter cam:** slow-mo 0.7s on shatter-point kills only (§9.7). Fragments obey physics.
- **Technique toasts:** freeze 0.4s, name in the RIPCORD type voice, resume.
- **Haptics (where supported):** settle-click at full brace · light tick per pot marble · medium pulse on heavy hits (impact energy threshold) · distinct triple-tick on shatter. All optional in settings.
- **Reduced motion setting:** kills slow-mo, trails, sparks, screen shake (parity with RIPCORD).

## 19. AUDIO — synthesized from physics, zero recordings (audio/synth.js)

Studio signature. WebAudio graph, all sound derived from physics events:
- **Impacts:** filtered noise burst + modal resonance bank per material. Glass: 3–5 high-Q modes 1.8–6kHz, short decay, slight inharmonicity; pitch scales inversely with diameter (Peewee chirps, boulders knock). Clay: heavily damped low modes ~300–900Hz. Steel: ringing inharmonic partials, longest decay. Stone: between clay and glass. Amplitude and brightness from impact energy; tiny per-hit seeded detune so nothing machine-repeats.
- **Rolling:** per-marble looped filtered noise, cutoff + amplitude modulated by contact speed on the surface's material curve (dirt hisses, polish whirs, ice is nearly silent).
- **Cracks:** stick-slip burst (short sawtooth grain cloud) + immediate high mode. Shatter: dense grain cascade, then fragment impacts each synth as tiny glass.
- **Warming:** soft band-passed shimmer keyed to rub speed.
- **Music:** none in-match at launch. Menu: sparse generative plucks (synth) — OPEN #7 whether to ship or stay silent like RIPCORD.
- Voice/UI blips: none. Text is silent. Master limiter; total audio CPU budget 1.5ms/frame; degrade by dropping rolling loops first.

## 20. PERFORMANCE

Budgets (Pixel 4a-class @60fps): JS main ≤6ms/frame, physics ≤3ms (in-frame Rapier step; move to Worker only if measured over budget — log it), ≤20 active marble bodies + 24 debris (no CCD on debris, 4s TTL), marbles ≤24 draw calls, scene ≤50, match load ≤120k tris.
**Quality tiers** (quality.js): detect via hardwareConcurrency + dPR + 2s boot micro-bench → Low/Medium/High. Controls: resolution scale 0.6/0.8/1.0 · shadows off/1-light/soft · transmission glass materials off/off/on (Low+Medium use matcap+fresnel fake — BUILD THE FAKE FIRST, it's the workhorse) · shot-cam off/on/on · particle counts. **Never sacrifice:** input latency, physics determinism, and the marble-inspect turntable's beauty (inspect may run High materials on Medium devices; it's a static scene).

## 21. VR PATH (Phase 5, WebXR — but Phases 0–4 MUST respect these)

1. Metric scale everywhere (§4) — VR marbles are real-size at your feet. The magic. Never break it.
2. Cameras only behind the `CameraRig` interface in scene.js (`update(dt)`, `getRay(pose)`) — VR adds `XRRig`, game code never touches cameras.
3. All input through AimSource (§7.6). knuckleXR.js: controller flick velocity sampled over final 90ms before trigger release; Quest hand-tracking end-state: pinch-brace then literal thumb-flick.
4. Showcase Case is authored as a 3D room interior from day one → the VR trophy room with zero redesign.
5. In-match HUD renderable as world-space planes (canvas textures); menus stay DOM (XR DOM overlay where supported).
6. Target: Quest browser first (no store gate), Horizon Store packaging later.

## 22. HEADLESS SIM HARNESS (/sim) — Node, zero browser deps

Required capabilities: load tuning + scenario JSON (positions, materials, scripted AimSource list or AI-vs-AI) · step 1/120 deterministic · assert outcomes · AI-vs-AI batches at max speed with CSV output (winner, turns, shot powers, integrity curves) · **replay verification: (seed, input log) → identical final state hash — launch requirement, gates Phase 4**.
Launch scenario set (minimum): `ringer_break` (§5.4) · `sticking` (backspin AimSource stops taw within 0.1m of struck mib ≥70%) · `arena_shape` (§9.9) · `escrow_crash` (kill mid-match, reboot, pot intact) · `condition_matrix` (every condition × every active fires exactly when specified) · `clay_regen` (daily rollover) · `pity_math` (drop tables converge on spec across 100k pulls) · `boss_ladder` (each boss beatable by Shark-level play with tier-appropriate bag, win rate 25–45%).
`npm run sim -- --scenario=all` green = phase gate.

## 23. SAVE & DATA SAFETY (meta/save.js)

```json
{ "v":1, "profile":{"name","handedness","calib","level","xp","league","techniques":[]},
  "inventory":[{"id","uid","acquired":ts,"source","cosmeticSeed"}],
  "showcase":["uid"], "wallet":{"sunbeams"}, "clayPool":{"count","lastRegen":ts},
  "bags":{"arena":["uid","uid","uid"]}, "bossTrophies":{"bossId":["uid_taken_from_player"]},
  "pot":{"inMatch":bool,"escrow":[...]}, "chores":{...}, "streak":{...}, "settings":{...}, "stats":{...} }
```
Every marble instance has a `uid` — provenance matters when marbles change hands. Migrations: `migrate(vN→vN+1)` chain; never break an old save. localStorage now behind async `load()/save()`; Firestore mirror is a Phase-4 swap, not a rewrite. Escrow crash-safety per §12.1.3 with harness coverage.

## 24. BUILD PHASES & GATES

- **P0 Skeleton:** repo, physics wrapper, harness runs `ringer_break` headless, one marble rendered with orbit cam + synth impact audio. *Gate: sim green, page loads on phone.*
- **P1 Ringer:** full Knuckle (brace/snap/spin/calibration/fallback), Ringer referee + all house rules, lagging, Rookie AI, procedural marbles (fake-glass tier), dirt ring env, pass-and-play, techniques detection (Ringer set). *Gate: a full match is FUN on a phone — Stephen signs off feel; `sticking` scenario green.*
- **P2 Collection & economy:** all 65 catalog entries data+procedural renders (grails on placeholder figure — builder makes a low-poly dragon to prove the glb pipeline; Stephen supplies real Meshy figures later), pouches+pity, wallet+faucets+chores, keepsies full loop (ante/escrow/pot/ransom/clay pool/showcase room), ceremonies, onboarding flow, progression/unlocks, PWA install, save migrations. *Gate: loop closed — earn, roll, stake, lose, ransom, showcase all work; `escrow_crash`+`pity_math`+`clay_regen` green.*
- **P3 Arena + ladder:** damage/integrity visuals, 3 arenas, charge + all conditions, all passives/actives (specials.js), swap/re-perch, comeback systems, shatter cam, Sharp/Shark AI, 20 rung personas + 5 bosses + signatures + trophy-taking, Practice Ring, quality scaler pass, Glacier/Foundry. *Gate: `arena_shape`+`condition_matrix`+`boss_ladder` green; soft-launch build.*
- **P4 Online keepsies:** Firebase auth, async turn matches via Firestore (input-log exchange, both clients simulate, Cloud Function verifies state hashes before pot transfer — never trust a client's claimed outcome), level-5 gate, flagged-input matchmaking for pullback users. *Gate: replay verification green in production path.*
- **P5 WebXR:** XRRig, knuckleXR (controller then hand-tracking), world-space HUD, showcase room in VR, Quest browser target.

## 25. ANTI-CHEAT (architect now, enforce P4)

Keepsies = real property. Deterministic replays (§22) + server-held escrow (Firestore transaction) + Cloud Function hash verification + stored input logs per match + tier-matched antes limiting blast radius + ransom as recovery valve. A marble uid transfers only on verified outcomes.

## 26. OPEN QUESTIONS — ask Stephen, do not resolve

1. Title. "KEEPSIES" working, uncleared.
2. 4-player Arena FFA — post-launch lean, confirm.
3. Trading — default NO for launch, confirm forever-position.
4. Condition list: ship 6 of the 7 listed (§9.5) — which one cuts.
5. Boss no-ransom rule — confirm after playtest (it's hot).
6. Practice Ring anonymous telemetry opt-in (P4).
7. Menu music: sparse generative or RIPCORD-silent.
8. Ringer pot-on-the-cross: confirm feel in playtest (§8.4).

## 27. SESSION LOG

- 2026-09-03 — Full design v2 authored (Stephen + Claude chat): Knuckle input, arena turn structure/charge/conditions, complete 65-marble catalog, bosses/ladder, onboarding, progression, ceremony, synth audio, phases. Supersedes v1 skeleton entirely. No code exists. Next session: Phase 0.
