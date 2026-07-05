# ROADMAP — Lucid Winds · OC Arena

Prioritized ideas for the next build-out, each with a rough size, where to touch, and how to verify.
Anything here is negotiable — treat it as a menu, not a mandate. Keep the single-file constraint and
the safety invariants (see CLAUDE.md) intact throughout.

Legend: **S** ≈ an afternoon · **M** ≈ a day or two · **L** ≈ multi-session.

---

## Near-term / high-value

### 1. Jewel sockets in the skill web — **M**
PoE's jewels: a handful of tree nodes become sockets that hold a "jewel" granting modifiers, often
scaling with nearby allocated nodes. Big build depth for modest effort since the modifier pipeline
already exists.
- Touch: mark some nodes `type:"jewel"` in `buildTree`; add a `JEWELS` table (like `AUGMENTS`); store
  `oc.tree.jewels = {nodeId: jewelKey}`; fold allocated jewels into `aggregateMods`. UI: a jewel picker
  modal reusing `openModal`. Migrate in `migrateOC`.
- Verify: `npm run validate` (allocation unaffected) + `npm run stress` (new modifiers).

### 2. Ascendancy / subclass — **M–L**
A small second mini-tree unlocked at a level milestone, chosen per race (or freely), with 4–6 powerful
nodes. This is the biggest "build identity" lever.
- Touch: `ASCENDANCIES` table; `oc.ascendancy = {key, allocated:[]}`; render as a compact panel in a new
  sheet tab or beside the web; fold into `aggregateMods`. Gate unlock on `oc.level`.
- Verify: stress + validate; ensure any keystone-like nodes have downsides.

### 3. Status effects / ailments layer — **M**
Generalize DoTs into named ailments (Burn, Poison, Bleed, Chill=slow, Shock=+dmg-taken, Freeze=skip).
Turns augments like Ignite/Toxic and keystones into a richer system, and makes Chill/Freeze meaningful
without breaking termination (cap stacks/among durations).
- Touch: extend the `dots`/status handling in `simulate`; add `applyStatus` helper; augments/powers push
  statuses; `hitDamage` reads defender shock. **Cap total control** (freeze/chill) so fights still end.
- Verify: `npm run stress` with special attention to `cap hits %` staying low.

### 4. Deterministic seeded fights (dev + "replay") — **S**
Add an optional seedable RNG (swap `Math.random` behind a `rng()` the sim uses). Enables reproducible
balance testing and shareable fight replays.
- Touch: a small mulberry32 in UTIL; thread a seed through `simulate(ocA, ocB, seed)`; default to random.
- Verify: two runs with same seed produce identical logs (add a tiny assertion to `test/validate.js`).

### 5. Save import/export + multiple rosters — **S**
Let users back up / move data (portable JSON blob) since storage is host-dependent.
- Touch: buttons in a settings area → serialize `{glory,roster,alliances,ownedAugments}` to a textarea /
  file download; import validates + runs `migrateOC`. Reuse `openModal`.
- Verify: round-trip a save; old saves still migrate.

---

## Content depth (mostly data, low risk)

### 6. More races, powers, augments, notables/keystones — **S each**
Follow `DEVELOPMENT.md` recipes. Cheapest way to add replay value. Aim for each new keystone to enable a
build that didn't exist before. After a batch, run `npm run validate` (keystone/notable counts, balance
spread) and `npm run stress`.

### 7. Second Stand-style archetype system for other races — **M**
Generalize the Stand "pick an archetype" pattern (e.g. Cyborg weapon-frames, Esper disciplines) so more
races get a signature customizable active. `STAND_ARCHETYPES` is the template.

### 8. Encounter/campaign mode & AI "gauntlet" opponents — **M**
Pre-authored enemy OCs (a bestiary table) and a ladder that grants Glory/XP, giving solo players
progression without needing two of their own characters.
- Touch: an `ENEMIES` table of OC-shaped objects (run through `migrateOC`); a new screen; reuse
  `simulate`/`battleStage`.

---

## UX / polish

### 9. True pinch-zoom + double-tap on the skill web — **S**
Current web supports drag + wheel + zoom buttons. Add two-pointer pinch and double-tap-to-zoom in
`setupTree` (track active pointers, compute distance ratio). Nice on phones.

### 10. Fight pacing / playback controls — **S**
The log currently staggers in via CSS. Add play/pause/step and an HP-timeline scrubber (data already in
`res.hpTimeline`). Optional speed toggle.

### 11. Build summary / shareable card — **S–M**
A "build card" for an OC (keystones, links, key stats) rendered to an offscreen canvas → image, for
sharing. Pairs well with the external art pipeline.

### 12. Sound & haptics — **S**
Tiny WebAudio blips for spin/crit/KO (respect a mute toggle + `prefers-reduced-motion`). No assets —
synth it inline.

### 13. Onboarding / codex — **S**
A first-run explainer and an in-app glossary (tags, increased vs more, keystones). Reduces the "what do I
do" cliff. New sheet tab or screen.

---

## Structural / tech-debt (do before things get big)

### 14. Split the inline data tables into a clearly-delimited "content block" — **S**
Still one file, but wrap all `const` content tables in an obvious banner so contributors edit data, not
logic. (Do NOT externalize to separate files — that breaks the artifact constraint.)

### 15. Targeted mechanic unit tests — **S, ongoing**
`stress`/`validate` cover "doesn't explode" + structure. Add focused assertions for specific mechanics
(e.g. Resolute → 0 crits and never-miss; Glass Cannon halves HP; Multistrike increases hit count;
Culling executes) in a new `test/mechanics.js`, using `harness-core` to call `deriveCombat`/`simulate`
and inspect `F`/log. This locks behavior against regressions when balance changes.

### 16. Perf pass for very large trees — **S**
If the tree grows past a few hundred nodes, `treeSVG` re-renders the whole SVG on allocate. Consider
updating only changed node/edge attributes on allocate (diff), or virtualizing labels at low zoom.
Measure first — it's fine at 105 nodes.

---

## Explicitly out of scope (keep the constraint)
No frameworks, bundlers, TypeScript, CDN scripts, servers, or multi-file app builds. No real-money or
account systems. Art stays external (image URL / emoji). Multiplayer/networking would require a backend
and breaks "one offline file" — only revisit if that constraint is formally lifted.

## Suggested order
1 → 3 → 15 (lock behavior) → 2 → 5 → then content (6) and UX (9–11) as desired.
