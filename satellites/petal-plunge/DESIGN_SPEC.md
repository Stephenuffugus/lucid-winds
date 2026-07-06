# PETAL PLUNGE — Design Spec
*A botanical SkiFree for the Lucid Winds portal. Sky Wolf Studios.*
*Status: v1 built + headless-verified. Single file: `satellites/petal-plunge/index.html`.*

---

## 1. The pitch
Ride a leaf-sled down an endless wild-garden slope. Carve between trees, roots and
stones; thread dewdrop gates for combo; launch off toadstool ramps and spin for
style; grab Petals; and when you plunge past **2000**, the feral garden **Gnome**
wakes and gives chase. Outrun it, or grab a **Firefly Lantern** to shake it — but
it comes back angrier each time, and in the end it always catches you. How deep can
you go?

It is SkiFree's soul (the downhill, the tricks, the unbeatable chaser) rebuilt for a
one-thumb phone, wrapped in the Lucid Winds midnight-greenhouse look, with a real
cosmetic economy and four modes.

## 2. Why this design
- **Faithful to SkiFree** where it matters: continuous slope descent, discrete-feeling
  carving, jump-and-trick freestyle, and the dread of the chaser you can't ultimately beat.
- **Fixes SkiFree's one frustration**: the original just ate you. Here the Gnome is
  *escapable* (lanterns) and the chase is a recurring, escalating beat instead of a
  single death — so the run has rhythm, not just a wall.
- **Fits the fleet**: same-origin satellite, canvas-drawn art behind drop-in hooks,
  WebAudio SFX, Petals (game-local) + Sunbeam bridge (30/day cap), portal card.

## 3. Controls (one-thumb first)
| Input | Touch | Keyboard |
|---|---|---|
| Carve left / right | tap-or-hold **left / right third** of screen | ← → (A/D) |
| Tuck (bomb straight, fastest) | hold the **middle** | ↓ (S) |
| Trick (in the air) | **tap anywhere** while airborne | Space / ↑ / W |
| Pause | pause button | P |

Heading is a continuous float in [-3, 3] eased toward input, mapped to velocity by
`a = head/3 · 78°`, `vy = speed·cos a`, `vx = speed·sin a`. Straight down is fastest;
sideways brakes to a near-stop (and lets the Gnome close). You can't hard-carve while
tucking — the classic speed-vs-control tension.

## 4. Modes
| Mode | Goal | Length | Gnome | Notes |
|---|---|---|---|---|
| **Free Plunge** | deepest distance | endless | yes (@2000, escalating) | the core record chase |
| **Slalom** | fastest **time** | 1600 deep | no | gate-dense; missed gate = +1.5s penalty; ★ by time |
| **Freestyle** | most **style** | 1400 deep | no | ramp park; chain tricks; ★ by style |
| **Daily Descent** | deepest, one seeded slope for everyone | endless | yes | UTC-date seed → deterministic; streak + shareable result |

Timing is **game-time (accumulated dt)**, not wall-clock, so it's frame-rate
independent and pause-safe.

## 5. Biomes (depth bands — look + hazard escalate)
`Sunny Meadow (0)` → `Bramblewood (900)` → `Mushroom Hollow (2000, bouncy toadstools)`
→ `Thornfall Ridge (3300, faster)` → `Nightgarden (4800, the Gnome's home)`.
Each shifts palette, obstacle set, density and speed. The Gnome wakes at 2000 (start
of Mushroom Hollow), so difficulty and dread rise together.

## 6. The Gnome (the heart of it)
- Wakes at depth **2000** with a warning + drum hit; renders uphill, closing.
- Runs at `gnomeBaseK` (0.94) of your clean straight-line speed → **going straight
  outruns it; carving/braking/crashing lets it gain.**
- A crash costs a chunk of your lead (plus the stun slowdown). Two bad crashes in a
  row and it's on you.
- **Escape**: grab a 🏮 Firefly Lantern → lead resets to max, you get a score
  multiplier and a speed burst, and the Gnome escalates (+0.02 speed each escape).
- After ~6 escapes it outpaces even a perfect line — so the descent is ultimately
  unwinnable (SkiFree's memento mori), but a great run goes *very* deep first.
- **Fairness is proven**, not asserted: a lane-following autopilot across 6 seeds
  reached a median depth of ~50k, was never caught before ~9.7k (no cheap kills),
  and always eventually got gobbled after escalating escapes.

## 7. Fair-by-construction slope
The generator carves a **guaranteed clear corridor** (the "safe lane") whose centre
random-walks slowly enough (≤0.22 x per 1 y) that a player can always follow it while
staying faster than the Gnome. Obstacles only ever spawn *outside* the corridor.
A headless proof checks every generated obstacle (800+ across seeds) sits outside its
segment's lane window and that the lane never drifts faster than followable or leaves
the field. Coins and gates sit *on* the lane, rewarding the clean line.

## 8. Economy
- **Petals** 🌸 — game-local currency (localStorage `pp_profile_v1`), never Sunbeams.
  Earned from coin pickups, gates, tricks, and an end-of-run bonus
  (`depth/25 + gates·2 + style/12 + escapes·15`). Spent only on cosmetics.
- **Sunbeams** ☀️ — the shared cross-game currency. Awarded on run end via the fleet
  helper `_sbCapEarn` (per-run 1–12, **30/day/game cap**), formula
  `clamp(1 + depth/500 + style/300 + gates/6 + escapes, 1, 12)`. Matches
  `SUNBEAM_EARN_POLICY.md`.

## 9. Cosmetics (the shop — "Potting Shed")
Four slots, all hand-drawable via art hooks (see `ASSET_LIST.md`):
- **Riders** (13): the critter on the sled — Sprout, Acorn, Ladybug, Bee, Snail, Frog,
  Mouse, Robin, Fox Kit, Firefly, Mantis, + two milestone legends (Luminmoth, Gnomeling).
- **Sleds** (9): what you ride — Leaf, Petal, Bark, Lily Pad, Mushroom Cap, Birch, Seed
  Husk, Snail Shell, + Auroraleaf (milestone).
- **Trails** (7): particle spray colour — Dew, Pollen, Petal Fall, Frost, Rainbow,
  Ember, + Stardust (milestone).
- **Skies** (6): menu/free theme — Biome(auto), Dawn, Dusk, Rainfall, Aurora, + Starfield (milestone).

Prices tiered by rarity (common→legend). Five items are **milestone unlocks** (not
buyable): reach the Nightgarden, escape the Gnome ×3, plunge 5000, bank 5000 style in
a run, 7-day Daily streak.

## 10. Tech
Single-file vanilla JS + canvas (no framework). WebAudio-synth SFX (no audio assets).
DPR-aware, edge-to-edge, portrait. All sprites procedural but routed through `ART.*`
so painted PNGs drop in with zero code changes. Same-origin: `/sunbeam-sdk.js`,
`SWS_EXIT()` embed/exit, no own service worker.

## 11. Open / future hooks (not in v1)
- Draw-your-own rider (à la Sproing's paint studio) — the art pipeline already isolates
  the rider sprite, so this is a clean future add.
- Gnome cosmetic variants as collectibles.
- Weekly seeded "Gauntlet" leaderboard.
- Per-biome unique hazard mechanics (spore fog slow, ridge gaps) — biome data already
  carries the flags.
