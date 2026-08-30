# RIPCORD — Master Handoff

**For:** a Claude Code session with hours of autonomous runway.
**From:** design + physics work already completed and verified.
**Owner:** Stephen — Sky Walk Studio / Lucid Winds (SWS Strategic Media LLC).

---

## 0. Read this first

RIPCORD is a spinning-top battle game. Single-file vanilla HTML/CSS/JS PWA,
mobile-first, no build step, no framework, no physics library, deployed to
Firebase Hosting. A 3D build follows later and reuses the same headless
simulation unchanged.

**What already exists and is verified — do not rewrite it:**

| File | What it is | State |
|---|---|---|
| `sim2.js` | Headless physics + parts catalogue | Tuned, all acceptance targets met |
| `wind.js` | Hand-drawn winding grader | Tuned and validated |
| `ripcord.html` | Playable prototype (workshop + wind + battle) | Working on mobile |
| `harness2.js` | Balance harness with acceptance gates | Passing |
| `partaudit.js` | Part dominance auditor | Passing with known gaps |
| `ladder.js` / `ladder.json` | 20 opponents on a measured curve | Verified playable |
| `assets.js` / `ASSETS.md` | Art manifest, generated from the catalogue | Current |
| `catalog.js` / `CATALOG.md` | Every part, every stat, generated | Current |

**Your job is to extend, not to restart.** The tuning in `sim2.js` took many
iterations and every constant is load-bearing. If you change one, re-run
`node harness2.js 300` and it must still print ALL ACCEPTANCE TARGETS MET
before you move on. That is not a suggestion; it is the gate.

**Run everything before you start, so you know the baseline:**

```bash
node harness2.js 300     # balance matrix + finish mix + pacing
node partaudit.js 600 2  # per-part dominance, ceiling and mean
node ladder.js           # 20 opponents, difficulty curve check
node assets.js  > ASSETS.md
node catalog.js > CATALOG.md
```

---

## 1. What the game is

Two tops in a dish. You build yours from five slots plus counterweights, you
program one ability trigger before the round, you wind it by drawing circles
on the screen, and then you have no input at all until it is over. Rounds last
about six seconds. First to four points takes the match, about 44 seconds.

The whole design answers one question: **how does a nine-year-old beat a
thirty-nine-year-old?** The answer is not a random number. It is rotational
phase — an unbalanced top hits enormously when the heavy side comes round at
the moment of contact and weakly when it does not, and the wobble is visible
before the hit lands. Everything else in the game hangs off that.

---

## 2. Non-negotiables

These came out of a teardown of every competitor in the category. Each one is a
specific complaint from real players. Violating any of them is a regression
even if the harness still passes.

1. **No canned cutscenes.** Every dramatic moment is the physics doing
   something visible. The Hasbro app plays the identical dash cutscene every
   single time and players say they have never once seen a knockout finish. If
   two dashes look the same in RIPCORD it is because the numbers were the same.
2. **Builds stay distinct at maximum investment.** Super God Blade's fatal bug
   is that past part level ~23 every top converges and matches end in draws.
   There is no linear power axis in this game. Tiers are specialisation, not
   strength. `partaudit.js` is how you prove it.
3. **No currency, no shop, no grind gate.** Parts come from winning. Tuning is
   free and reversible. There is never an energy bar, a gem, or an IAP.
4. **Local-first.** Beyblade Burst App deleted all its online features in March
   2026 and took every player's ladder with it. RIPCORD works fully offline
   forever. Anything networked is additive and optional.
5. **Teach by playing.** Beyblade X: Xone opens with 38 pages of tutorial text.
   RIPCORD's tutorial is the first three ladder opponents. No tutorial screens.

**Also non-negotiable:** no online multiplayer, no accounts, no backend, no
ads, no physics library, and no branded or licensed content anywhere — no real
part names, no franchise terms, original names only.

---

## 3. Architecture rules

- `SIM` has **no DOM references, no renderer references, no globals** beyond
  its UMD export. The 2D canvas build and the future Three.js build consume the
  identical state object. If you find yourself importing anything into
  `sim2.js`, stop.
- The renderer owns nothing. It reads `{x, z, w, lx, lz, phase, spec, alive}`
  and draws. It never writes to a top.
- Fixed 120 Hz simulation step, decoupled from the render loop with an
  accumulator, capped at 8 substeps per frame.
- Determinism matters: `SIM.mulberry(seed)` is the only randomness in the
  harness. A seed plus two builds must always produce the identical round.
- Single file for shipping. Sources live separately and are concatenated into
  `ripcord.html` at bundle time via the `/*__SIM__*/`, `/*__WIND__*/` and
  `/*__LADDER__*/` placeholders in `play-shell.html`.
- **No localStorage in Claude artifacts** — it fails there. Write a storage
  shim that prefers `window.storage`, falls back to `localStorage` when running
  as a real PWA, and falls back to memory. Never call storage APIs directly.

---

## 4. The physics core

Reduced heavy-symmetric-top model. Each top carries position, velocity, axial
spin `w`, and a **lean vector** `(lx, lz)` whose direction is the way it leans
and whose magnitude is the lean angle. Per step, in order:

1. **Precession.** The lean vector rotates about vertical at
   `ωp = precScale · M g R · cogH / (I · max(|w|, 40))`, clamped to `precMax`.
   It speeds up as spin decays, which is why dying tops wobble faster and why
   the death spiral reads correctly without being animated.
2. **Rise / fall.** Above a stability threshold `wStable / (0.55 + 0.45·stable)`
   tip friction *rights* the top toward an equilibrium lean; below it, lean
   grows until it topples. This is Fokker's rising top. It is why a healthy top
   self-corrects after a hit and a tired one does not.
3. **Drive.** The contact point sits off the centre axis by the lean, so
   friction pushes the top perpendicular to its lean, signed by spin. One line
   of code, and it is the entire reason tops orbit instead of sitting still.
4. **Bowl + rail.** Inward pull `bowl · r`, flattening and reversing past
   `ridgeAt`. **The bowl constant is the single most sensitive number in the
   game.** Loosening it from 12 to 8.4 collapsed attack from 48% to 21%,
   because a loose bowl lets tops drift apart and turns every round into a pure
   spin race, which the stamina archetype wins by definition. Tight bowl =
   forced engagement. Do not touch it without re-running the harness.
5. **Rail dash.** A geared bit above a speed threshold on the rail slingshots
   inward and pays spin. Rail drag is reduced, but only in proportion to the
   bit's `dash` — a needle tip scrapes, a gear flat grips. This is attack's
   kill route and the loudest moment in a round.
6. **Spin decay.** `load · (base + lean + travel + wobble) / stamina` where
   `load = (m/0.035)^massCost · (iRef/I)^inertiaPow`. Mass loads the tip and
   costs spin; mass carried at the **rim** buys rotational inertia and protects
   it. That asymmetry is what gives wide blades and the outer weight ring their
   identity, and it halved the blade dominance spread when it was added.
7. **Collision.** Separate normal and tangential impulses. The **aggressor** is
   whoever is driving into the contact; they deal full smash scaled by blade
   sharpness and the heavy-side swing, and pay only `recoil` (35%) back. Before
   this split existed, attacking was strictly unprofitable and the attack
   archetype could not be made viable at any settings.
8. **Spin direction physics.** Counter-rotating rims *mesh* — low relative
   slip, so friction transfers angular momentum from faster to slower. That is
   spin-stealing and it falls out of Coulomb friction with no special-casing.
   Co-rotating rims *scrub* — maximum slip, both bleed spin, big tangential
   kick. **The original spec had this backwards.** Same spin is violent and
   short; opposite spin is a long grind.
9. **Finishes.** Spinout 1pt, ringout 2, knockout 2, burst 2. A topple counts
   as a knockout only if a strike landed within 0.6s, otherwise it is a
   spinout. Burst wear scales as `(impulse/impRef)^3` against the ratchet's lock
   teeth, lands on whoever is *struck*, and the striker takes 14% back — so
   bursts come from one big connected blow, never from grinding.

Every constant is tabulated with a plain-English note in `CATALOG.md`.

---

## 5. Current verified state

```
WIN MATRIX (row beats column, %)        FINISHES
             attack stamina defense balance    spinout  48.9%
attack        45.3   47.4   46.6   49.4        ringout  27.3%
stamina       48.6   43.7   58.4   64.6        knockout 10.0%
defense       45.7   42.9   48.9   50.9        burst     8.9%
balance       42.3   35.3   41.1   49.0        double    4.9%

ROUND  p10 1.3s  median 6.2s  p90 15.8s
MATCH  median 4 rounds / 44 seconds (first to 4 points)
```

All sixteen cells inside the 30–70 band. Half of all rounds now end in
something other than a top quietly running out of spin, which is the version
worth watching.

---

## 6. Parts, tiers, tuning, rigs

### 6.1 The five slots

```
CORE     spin direction, ability, small centre mass
BLADE    the weapon: mass, radius, sharp, rest, gear, taken
ASSIST   rim shaping: gearMul, absorb, radAdd, smash
RATCHET  height (CoG + strike plane) and lock teeth (burst resist)
BIT      the tip: stamina, drive, stable, dash, shaft
WEIGHTS  up to 4, in 12 positions (2 rings x 6 holes)
```

10 parts per slot today = 100,000 chassis; 46,666 weight configurations;
4.67 billion functionally distinct tops. Full stat tables in `CATALOG.md`.

### 6.2 Counterweights — the differentiator

Nobody in this category models static imbalance. Imbalance is the vector sum of
weight positions normalised by mass and radius, and it feeds four places:

```
drive   x (1 + 1.30·imb)        more travel, more aggression
stamina x (1 - 0.42·imb)        paid for in spin
impact  x clamp(1 + 7.0·imb·sin(phase), 0.18, 2.10)    the heavy-side swing
rail    x (1 + 3.20·imb)        a wobbling top bites the rail harder
```

Three chips at holes 0/2/4 cancel: heavy, reliable, boring. Three bricks at
holes 0/1: a wobbling monster that travels twice as far, burns spin, and
sometimes deletes a perfectly tuned build. Verified as a genuine sidegrade —
the *feral* imbalance band currently outperforms the *balanced* band 45.8% to
32.9% in random builds, so the wobble is a real choice and not a trap.

### 6.3 TIER SYSTEM — to build

**Tiers are not power levels.** Every tier spends the same stat budget; higher
tiers spend it more extremely.

| Tier | Name | Target count | Rule |
|---|---|---|---|
| 1 | Stock | 50 (built) | Balanced trade-offs, forgiving, no drawback |
| 2 | Forged | 40 | One stat ~25% past the Tier 1 range, another pulled back further |
| 3 | Relic | 20 | One stat at an extreme, **plus a named drawback the sim enforces** |

Relic drawbacks must be real simulation behaviour, not a number. Examples to
implement:

- **Glass** — `taken` doubles below 40% spin. A monstrous blade that shatters
  once it is tired.
- **Greedy** — ability charge accrues 40% faster but the top cannot spinout-win;
  below `spinDead + 40` it topples instead. You must finish them.
- **Cold Start** — first 2.5 seconds at 60% drive, then 130% for the rest.
- **Loose Lock** — `burstResist` halved, `stable` +30%. Hard to topple, easy to
  pop.
- **Hungry** — spin steal on contact is +40%, but decay is +25% baseline.
- **One Shot** — the first strike you land does triple wear; every strike after
  does 40%.

**Acceptance gate for the whole tier system:** run `node partaudit.js 800 2`.
If any Tier 3 part raises the *mean* win rate of builds containing it more than
4 points above its Tier 1 sibling, it is power creep and it is wrong. The
*ceiling* is allowed to be higher — that is the point of a Relic — but the mean
must not be.

Target after expansion: **22 cores, 22 blades, 22 assists, 20 ratchets, 24
bits = 110 parts, 5,111,040 chassis.**

### 6.4 TUNING (upgrades) — to build

Straight from the beigoma tradition: real players file their tops, add wax and
lead, and sand out casting flaws. Every operation is a **trade**, is **free**,
and is **fully reversible**. There is no currency and no grind — this is a
puzzle, not a treadmill.

| Operation | Slot | Effect | Max |
|---|---|---|---|
| File | blade | `sharp` +0.06, `taken` +0.05 | 3 |
| Polish | blade / assist | `gear` −0.15, `rest` +0.03 | 2 |
| Wax | bit | `stamina` +0.06, `drive` −0.08 | 3 |
| Knurl | bit | `dash` +0.10, `stamina` −0.05 | 2 |
| Shim | ratchet | `lock` +0.08, height +2mm | 2 |
| Drill | blade | `mass` −0.0008, `taken` +0.04 | 3 |
| Bevel | assist | `smash` +0.05, `absorb` −0.08 | 2 |

A single part may carry at most **3 total modifications**. Store mods on the
config, apply them inside `build()` after the base part lookup so the sim never
needs to know they exist. Show the modified stat in the workshop in the accent
colour with the delta.

### 6.5 RIGS (combo system) — to build

Named synergies that fire when a build satisfies a condition. Every rig must be
expressed as a **physics modifier**, never a flat stat bonus, and must announce
itself in the workshop the moment the condition is met — that is the discovery
loop.

| Rig | Condition | Effect |
|---|---|---|
| **Rail Lock** | bit `dash` ≥ 1.2 AND assist `gearMul` ≥ 1.4 | `dashGap` ×0.6 — chain dashes |
| **Flywheel** | blade `radius` ≥ 0.024 AND 4 weights all outer ring | `inertiaPow` effect ×1.12 |
| **Counterweight Set** | 3+ weights, imbalance < 0.02 | `imbDrain` ×0.70 — heavy without the cost |
| **Hammer** | blade `sharp` ≥ 0.85 AND assist `smash` ≥ 1.1 AND imbalance ≥ 0.10 | `imbSwing` ×1.25 |
| **Low Profile** | ratchet height ≤ 40 AND bit `stable` ≥ 1.1 | your `exitNeed` ×1.25 |
| **Spin Thief** | blade `gear` ≥ 1.3 AND assist is `hook` | tangential steal ×1.15, opposite spin only |
| **Deadweight** | total mass ≥ 0.046 AND bit `drive` ≤ 0.7 | incoming `jn` ×0.85 |
| **Featherline** | total mass ≤ 0.030 AND blade `sharp` ≥ 0.8 | `driveK` ×1.20, `taken` ×1.15 |

Aim for **16 rigs** total. Half should be obvious; half should be things a
player only finds by experimenting. None may stack more than two at once — cap
active rigs at 2 and let the player choose which if three qualify.

---

## 7. Abilities and triggers

Programmed **before** launch, never during. This preserves the no-input rule and
is strictly better than Xone's rock-paper-scissors prompt, which reviewers
called random. You pick an ability (from your core) and a trigger, and then
watch your two-line program execute.

**Built (10):** surge, anchor, overdrive, rebound, reversal, shed, burrow,
lash, lunge, brake.

**To build (8 more, one per new core):**

| Ability | Effect |
|---|---|
| **Tether** | For 3s, your inward bowl pull is halved — you hold the rail |
| **Scatter** | Redistribute your weights to cancel imbalance instantly (Shed's opposite: keep the mass) |
| **Bite** | Your `gear` triples for 2s — a spin-steal window |
| **Stoneskin** | `taken` ×0.35 for 3s but drive → 0.4 |
| **Backspin** | Reverse only your *rim* friction sign for 2.5s without flipping travel |
| **Pitch** | Convert 25% of spin into one hard outward shove — self-ringout risk |
| **Echo** | Re-fire the last ability that hit you, against them |
| **Wind Up** | Charge for 1.5s at half drive, then release at 180% drive for 2s |

**Triggers (5 built):** `charged`, `lowSpin` (<45%), `thirdHit`, `onRidge`,
`behind`. **Add:** `firstBlood` (you land the first strike), `cornered` (outside
`ridgeAt` for 1s), `mirror` (opponent same spin direction), `late` (after 8s).

Charge comes only from the round: 0.20 per strike landed, 0.09 per strike
absorbed, 0.34/sec riding the rail. Never from a wallet.

---

## 8. The winding mechanic

You trace three circles around your top before launching. Implemented and
tuned in `wind.js`.

- **Roundness / evenness / concentricity** → craft, weighted 52/24/24
- **Lap count** → charge, kept separate from craft. Half a wind is half a wind.
- **Drawing direction** → spin direction. This is the pre-match tactical
  decision, with zero UI.
- **Bulge location** → the heavy-side phase at launch.

**The critical design decision: wind quality barely touches power (±5%).** If a
clean draw simply won, drawing becomes a skill gate that punishes kids — the
opposite of the brief. Instead a bad wind changes *what kind of top you
launched*: more imbalance, more lean, more travel, bigger swing, less stamina.
Sloppy is wilder, not weaker.

Measured on realistic hands, the spread between a careful adult and a kid's fast
scribble is 5–11 points. On a stamina build the scribble actually wins more,
because it wound more laps faster.

Over-winding binds the string past 1.2× the ask and costs both power and
balance — 3 laps gives A/1.04 power/0.018 wobble; 6 laps gives B/0.78/0.178. The
on-screen lane counter matches the grader to two decimals.

**Emergent rule worth surfacing to players eventually:** attack builds prefer a
wild wind; defense builds want precision.

---

## 9. Progression

### 9.1 Structure

Five leagues of five rungs. Each league ends in a boss. 25 opponents total —
`ladder.json` has the first 20 generated and verified; extend it.

```
League 1  Chalk Ring     rungs 1-4    boss: THE POST
League 2  The Market     rungs 6-9    boss: KATIS
League 3  Riverside      rungs 11-14  boss: THE PEMANGKIN
League 4  The Barrel     rungs 16-19  boss: TWO-DIRECTION
League 5  Kelantan       rungs 21-24  boss: THE GIANT
```

### 9.2 How opponents are made

Do not hand-write them. `ladder.js` samples candidate builds, measures each
against a reference panel, and keeps whichever lands closest to that rung's
difficulty target — then verifies the curve is monotonic before writing. Early
rungs are deliberately under-built: fewer weights, no trigger programming, metal
scattered at random, because a beginner opponent should look like a beginner's
top. Roles cycle balance → stamina → attack → defense so the ladder teaches the
matchup triangle without a screen that says so.

Current curve: 1 inversion across 19 steps, worst miss 5.6 points, and a
simulated playthrough from the starter kit wins 44–76% at every rung.

### 9.3 Bosses — to build

Each boss teaches one mechanic by making it the only way through. Every gimmick
must be expressible in the existing sim; if it needs a special case, it is the
wrong gimmick.

| Boss | League | Gimmick | What it teaches |
|---|---|---|---|
| **The Post** | 1 | Absurd stamina, drive ≈ 0. Parks in the centre and will outlast anything. | You cannot win every round by waiting. Attack has a job. |
| **Katis** | 2 | If it won the previous round it opens the next with a free unopposed strike (turumpo's punishing blow). | Momentum and loss stakes. Win the first round. |
| **The Pemangkin** | 3 | Enormous mass, permanent anchor — cannot be rung out. Lock teeth halved. | Burst exists and is the answer to the immovable. |
| **Two-Direction** | 4 | Fires `reversal` on a repeating 4s timer, flipping spin all match. | Same-spin vs opposite-spin is a real matchup, not flavour. |
| **The Giant** | 5 | A 4.5kg Kelantan-scale top in a wider stadium. Slow, unstoppable, spins for minutes. | Pockets. You must steer it out, not beat it. |

Bosses drop a Relic (Tier 3) part. That is the only source of Relics.

### 9.4 Unlockables

- **Parts.** Start with 10 of 50. Every rung drops one. All 20 drops distinct.
  After the tier expansion, 110 parts across 25 rungs plus repeatable Field
  matches.
- **Cosmetics.** 8 finishes, 12 decals, 7 trails, 6 launcher skins — 672 looks
  per top. Purely visual, flagged in the data model so no future balance pass
  can quietly give a paint job a stat. Launcher skins were the single most
  requested missing feature in competitor reviews.
- **Stadiums.** One per mode, unlocked with the mode.
- **Modes.** Uri at league 2, Taya at league 3, Tuj lub at league 4.

### 9.5 Field mode (endless)

After league 5, generate opponents on demand at the player's measured strength
using the `ladder.js` sampler. Infinite content, zero authoring, and it
naturally tracks the player's skill.

---

## 10. Modes, drawn from the traditions

Researched, not invented. Four formats already proven by a few centuries of
play, all reusing the same sim.

- **Pangkah** (Malay striking match) — the default duel. Built.
- **Uri** (Malay endurance) — no contact. Launch, then transfer your top onto a
  raised post and see who spins longest. Rewards exactly the builds that lose at
  Pangkah, which keeps stamina parts valuable.
- **Taya** (Filipino turumpo) — the loser's top is pinned in the circle as a
  target and the winner takes a free strike at it. This is the answer to
  "should losing cost you a part": it costs durability on one part, publicly,
  with a wind-up.
- **Tuj lub** (Hmong target range) — solo skill mode. Rows of stationary tops at
  increasing distance, points scale with range. This is the mode that teaches
  launch control without a tutorial.

---

## 11. 3D pipeline

Full manifest in `ASSETS.md`, generated from the catalogue. Headline: **53 part
meshes** (10/10/10/10/10 + 3 weights), 6 launchers, 4 stadiums. A fully dressed
top is ~3,480 triangles; two tops plus a stadium lands near 9k, comfortable on a
mid-range phone at 60fps.

**Fix the common mount before anyone models anything.** One skeleton, N runtime
attachments:

```
axis            vertical, +Y up, origin at the FLOOR CONTACT POINT
core socket     bayonet, 3 lugs at 120°, boss dia 8.0mm, top face Y = 26mm
blade boss      bayonet ring dia 22.0mm, underside face Y = 18mm
assist clip     same bayonet, seats 3.0mm below the blade underside
ratchet thread  M16 x 1.0 into the blade underside, teeth ring dia 14.0mm
ratchet heights 30 / 40 / 50 / 60 / 70 / 80 / 90 (the name encodes it)
bit shaft       press fit, dia 9.0mm, insertion depth 6.0mm
weight holes    12 blind holes, dia 3.5mm, depth 4.0mm, blade underside
                inner ring 0.42 × blade radius, outer 0.80; 6 per ring; hole 0 at +X
```

Model at real scale in millimetres, origin at the mount face rather than the
mesh centre. The renderer stacks parts by mount face; a mis-placed origin shows
up as a floating blade. Meshy for silhouettes, Blender to cut them to the
common mount.

Finishes ship as two material sliders, not textures. Decals are 256px alpha
masks. The entire cosmetic layer costs a handful of kilobytes.

---

## 12. UI

**The play field is the product.** The arena is fixed edge to edge; score, dock
and hint are transparent overlays that fade out entirely the moment a round
starts. During play there is nothing on screen but the stadium.

- **Wind screen.** Three concentric lanes, one per lap, with a START dot.
  Lanes fill as you complete them. Live counter in the arena centre turns green
  at 2.7 laps with "release", red past 3.6 with "over-wound".
- **Workshop.** Three accordions, one open at a time — Build, Weights & trigger,
  Looks — each summary showing its contents without opening. A role filter
  (all / attack / stamina / defense / balance / utility) narrows all five slot
  rails at once. **The fitted part always stays visible even when the filter
  excludes it**, so filtering can never hide what you are running.
- **Bench.** 220 headless rounds against the current opponent, on demand. This
  is the anti-convergence tool made visible: the player can prove their build is
  different.
- **Locked parts** render dimmed with a lock and say where to win them.

Palette is packed earth and chalk — `#241C17` ground, `#EDE6D8` chalk,
`#C9A227` rope, `#C4442B` ember, `#7E8B92` steel, `#7FA650` good. It reads as
chalk drawn on dirt, which is where gasing rings are actually drawn.

---

## 13. Testing and acceptance gates

Nothing merges without these.

**`harness2.js`** — must print ALL ACCEPTANCE TARGETS MET.
- Every cross-archetype cell inside 30–70%
- Mirrors 44–56% of *decisive* matches (doubles excluded)
- Round median 6–12s, p90 ≤ 25s
- knockout + burst between 5% and 20% of finishes

**`partaudit.js`** — no part may be un-buildable.
- Ceiling spread per slot under 25 points
- No Tier 3 part more than +4 mean points over its Tier 1 sibling
- Weight-count bands must stay flat (no "always fill the slots" answer)

**`ladder.js`** — ≤2 inversions across the curve, worst target miss < 9 points,
and the simulated starter-kit playthrough must win 45–80% at every rung.

**Add these, which do not exist yet:**
- `rigtest.js` — every rig must change at least one measurable outcome by ≥3
  points, or it is decoration.
- `modetest.js` — Uri, Taya and Tuj lub each need their own pacing targets.
- A determinism test: same seed, same builds, identical round, 1000 times.

---

## 14. Work plan

Ordered by dependency. Each phase has a definition of done you can check
yourself without asking.

**Phase A — Port and prove (start here).**
Move the sources into the repo, wire the bundler, confirm all four scripts run
and the harness passes. *Done when:* `ripcord.html` opens on a phone, a round
plays, and `node harness2.js 300` prints the green line.

**Phase B — Storage shim and save state.**
Persist: unlocked parts, current build, ladder progress, cosmetics, settings.
Shim prefers `window.storage`, falls back to `localStorage`, then memory.
*Done when:* progress survives a reload, and the app still works with storage
entirely unavailable.

**Phase C — Tier expansion.**
Author 40 Forged and 20 Relic parts to the budgets in §6.3, including the six
Relic drawbacks. *Done when:* 110 parts exist, `partaudit.js` passes, and no
Relic exceeds +4 mean points.

**Phase D — Tuning system.**
Seven operations, 3 mods per part, free and reversible, applied inside
`build()`. Workshop shows deltas. *Done when:* a filed Cleaver measurably beats
a stock one in a specific matchup and loses in another.

**Phase E — Rigs.**
16 synergies, physics-expressed, max 2 active. Write `rigtest.js` alongside.
*Done when:* every rig moves a measurable outcome ≥3 points and the workshop
announces each one the moment its condition is met.

**Phase F — Ladder to 25 and bosses.**
Extend `ladder.js` to five leagues, implement the five boss gimmicks, wire
league gating and Relic drops. *Done when:* the simulated playthrough clears all
25 rungs at 45–80% and each boss is unwinnable by the wrong strategy.

**Phase G — Modes.**
Uri, Taya, Tuj lub with their own stadiums and pacing targets. *Done when:*
`modetest.js` passes and stamina builds that lose at Pangkah win at Uri.

**Phase H — Abilities and triggers to 18 and 9.**
The eight new abilities and four new triggers in §7. *Done when:* every ability
is visible in the motion of the top without a caption.

**Phase I — Pass-the-phone two-player.**
Both players build, both wind, one device. This is where the multi-age drama
lives and it should ship before anything networked is even discussed.

**Phase J — 3D.**
Only now. Three.js viewer reading the same sim state, common mount, runtime
part swapping. If the workshop is not already fun on its own, no amount of
Blender will save it.

---

## 15. Known problems, honestly

- **Bit ceiling spread is 29 points.** Claw at 38% and Flat at 44% even at their
  best in random sampling. Partly a measurement artefact — attack tips need a
  coherent build and random sampling never gives them one; Flat reads 54% on a
  proper attack chassis. The real fix is a coherent-build generator for the
  audit instead of uniform random. Do that early in Phase C or the tier numbers
  will lie to you.
- **Balance archetype is soft**, 35% against stamina. It is the only reference
  build with no clear answer to anything.
- **Ladder rung 15 is a bump** at 44%, slightly harder than rung 20. Regenerate
  that rung.
- **Round p10 is 1.3s.** A small tail of rounds end almost instantly. Probably
  spawn overlap; worth a look.
- **The brawler chassis still mildly prefers balanced weights.** The rail-dash
  coupling fixed most of it but not all. Acceptable — real attack tops are
  tuned for balance — but a wild attack option would be better.

---

## 16. Why things are the way they are

Kept because future-you will be tempted to undo these.

- **Beigoma** is Beyblade's ancestor: a canvas sheet over a barrel, and players
  file material, add wax and lead, and sand out casting flaws. Modification, not
  purchase. That is where the tuning system comes from and why it is free.
- **Gasing** splits into *pangkah* (striking) and *uri* (endurance), where the
  top is scooped onto a bat and transferred to a post. Kelantan giant tops run
  4–5kg and spin for two hours. That is where Uri and The Giant come from.
- **Turumpo**: the loser's top is placed in the circle as a target and the
  winner gets a free punishing strike, the *katis*. That is Taya and boss 2.
- **Tuj lub**: a Hmong target range, teams of six, points scaling with distance
  out to 70 feet. That is the launch-control mode.
- **Beyblade X's Custom Line** went from three slots to five — lock chip, main
  blade, assist blade, ratchet, bit — and ratchet names encode geometry (`3-60`
  = three lock teeth, 60 height). Competitive players buy diagnostic tools to
  detect balance differences between physically identical parts. That is the
  depth this audience actually wants, and it is why imbalance is a first-class
  mechanic here rather than a hidden stat.
- **The trend is live.** Demand spiked across Hong Kong, Malaysia, Singapore,
  mainland China, Taiwan and Thailand through 2026; Hong Kong up 14-fold
  year on year. Adults run tournaments in tattoo shops and malls. The Toys "R"
  Us CEO's line about it is the whole design brief in one sentence: you can
  still win as a nine-year-old against a thirty-nine-year-old, and that creates
  a lot of drama.

---

## 17. Style

Vanilla JS, no framework, no build step, no dependencies. Comments explain
*why*, never *what* — the existing sources are the reference for tone. Keep
functions small and named for what they do physically (`stepTop`, `collide`,
`applyWind`). No abbreviations that need a decoder. When you tune a constant,
leave the reason in a comment, because the next session will want to know why
`bowl` is 12 and not 10.
