# HANDOFF — GERPLUNK (Skipping Stones)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, landscape.
**Deploy target:** lucidwinds.com/satellites/gerplunk
**Session goal:** Flick-to-skip with honest physics, stone collection, one lake at golden hour, daily challenge, share replays.

*(A "gerplunk" is real stone-skipping slang for the final plunk when the stone sinks — the Mackinac Island club literally calls itself the Stone Skipping & Gerplunking Club.)*

---

## 1. Concept
A lake at golden hour. Pick a stone from the shore — each one different — and flick it. Real skip physics: release angle, speed, and the spin your flick imparts decide everything. Count the skips, watch the rings spread, hear the *tick…tick…tick-tk-tk-trill…gerplunk*. Chase your record, collect rarer stones, learn the magic angle with your thumb.

**Tone:** the most peaceful competitive game ever made. Dusk light, loon calls, no timer anywhere. (Personal note: this is the family lake in Venus, PA. Build it like a memory.)

## 2. Market research summary (Sep 2026)
- Physics literature is rich and game-ready: Bocquet (Am. J. Phys. 2003) — lift vs gravity per collision, **magic attack angle ≈ 20°**, spin gyroscopically stabilizes the attack angle across bounces (without spin the stone tumbles after 1–2 hits), minimum speed threshold, energy loss per skip. A 2023 study: heavier stones → fewer but *bigger* leaps. This maps directly to feel: flat flick = angle, flick speed = velocity, flick curl = spin, stone choice = mass/shape tradeoffs.
- **Sidewards** (Steam): stone-collecting + realistic skipping, well-received — proof of the collect-and-skip loop, but PC-bound with dial-a-throw UI, not gesture feel.
- itch: small week-jam games capture the calm ("really captures the calm and relaxing nature") but are thin.
- **Mobile has no definitive flick-based, physics-honest skipper.** The genre's whole soul is a wrist gesture — it belongs on a phone.

**Positioning line:** "Angle. Speed. Spin. Peace."

## 3. Core loop
1. Shore view: 3 stones offered from the pebble bed (regenerates daily + after throws). Inspect: shape, flatness, weight shown as the stone in your palm.
2. Flick: drag back then release in one stroke — stroke straightness→angle, stroke speed→velocity, end-curl→spin. Tutorial teaches by feel with ghost hints, never sliders.
3. Camera chases the stone low across the water; each skip = tick + ring; skips shorten into the closing trill; gerplunk.
4. Result: skip count, distance, best-run rings replay. Rethrow instantly.
5. Meta: skip totals unlock shore spots (new angles/wind), rare stones appear over time, records board per stone type.

## 4. Physics model (honest, tiny)
- Ballistic flight between collisions; collision model per Bocquet: impulse from lift/drag on the immersed edge — bounce succeeds if attack angle in window and speed above threshold; energy loss per skip scales with deviation from magic angle; spin decays slowly and widens the stability window (low spin = angle drifts → early tumble, exactly like real life).
- Stone params: mass, radius, flatness (lift coefficient), roundness (stability bonus). Heavy stones: fewer, longer leaps (2023 finding) — a real strategy choice for distance vs count records.
- Late-run "pitty-pat": when speed decays near threshold, skip spacing collapses into the rapid mini-skip trill before sinking — the signature sensory payoff; make sure the model produces it (it will, naturally, as bounce interval → 0).
- Wind: gentle lateral drift, varies by day seed. Water states: glass / ripple / chop (chop narrows the angle window — expert conditions).
- Deterministic, seeded (house rule): replays + daily fairness.

## 5. Stones (collection)
- Common: sandstone, shale, granite chunk (bad on purpose — the joke stone).
- Uncommon: perfect skimmer (flat oval), heavy flat (the long-leaper).
- Rare: sea glass (glints), fossil stone (crinoid print — fossil-dig crossover wink), lucky quartz.
- Each stone type keeps its own record line. Pebble bed rarity influenced by total career skips. No purchases, no energy — stones are found, like real ones.

## 6. Presentation
- Look: layered gradient dusk sky, dark treeline, water as horizontal light bands with sine shimmer; rings as expanding ellipses; stone as a silhouette with glint. Loon call, cricket bed, water lap — all synthesized/procedural. Golden hour always (it's the lake of memory).
- Skip sounds: pitched ticks descending in a natural series; the trill; the plunk with a little reverb across the water. Audio IS the score readout — you can count skips with eyes closed.
- Slow-mo on record-breaking final skips; long-exposure-style trail on the replay share image (PNG export: your throw's arc + rings + count + date — ASTERISM poster pattern).

## 7. Modes
- Free skip (default, endless dusk).
- **Daily Lake:** seeded stone + wind + water for everyone; one scored attempt window of 5 throws; share link compares results on the same seed (zero backend, DOOHICKEY pattern).
- Records: per-stone, distance and count separately.

## 8. Toolchain
- **Claude Code:** build. Physics headless first: assert magic-angle throw ≥ 15 skips, no-spin throw tumbles ≤ 3, threshold pitty-pat emerges.
- **Gemini Pro:** dusk palette frames; loon/ambience synthesis recipe check.
- **ChatGPT Pro:** stone flavor text (each stone gets one wistful line), store copy.
- **Grok basic:** name check (GERPLUNK — likely clean), social copy.
- **Meshy premium:** hero stone-in-hand render for icon; lake diorama card art.

## 9. Architecture & build order
- Canvas 2D; flight sim 120Hz fixed; gesture sampler (pointer events, 60–120Hz) → throw params.
1. Physics headless + assertions.
2. Water/sky render + flick gesture + flight camera + skip ticks. **Feel-gate: ten minutes of throwing must be self-justifying before any meta exists.**
3. Pitty-pat/gerplunk audio choreography + rings.
4. Stone inspection/selection + pebble bed + records.
5. Daily seed mode + share image + replay.
6. Shore spots, wind/water states, PWA wrapper, polish.

## 10. Stretch
- Night lake (moon path on water), winter (skip on ice — Eskimo tradition per LoC), Venus PA skin with the real treeline.
- "Grandpa's stone" narrative unlock at 1,000 career skips.
- Two-thumb local duel (alternate throws, same seed).

## 11. Open questions
- Name: GERPLUNK vs STILLWATER vs SKIM. (GERPLUNK is the charmer; STILLWATER the mood.)
- Show a subtle angle-readout after each throw (learn faster) or keep it pure feel? (Recommend: readout appears only after a sink, phrased as folk wisdom — "flatter, and snap the wrist.")
