# HANDOFF — AIRWORTHY (Paper Airplane Wind Tunnel)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, landscape flight / portrait workshop.
**Deploy target:** lucidwinds.com/satellites/airworthy
**Session goal:** Fold workshop → wind tunnel test chamber → 2 flight courses, with the full fold→physics mapping, trim-between-throws loop, and streamline visualization working.

*("Airworthy" — the aviation certification term for "fit to fly." The game is the act of making paper airworthy.)*

---

## 1. Concept

Fold a paper airplane through real fold choices — nose weight, wing width, dihedral, trim tabs. Test it in a **wind tunnel** where you can *see* the air: streamlines bending over your wings, lift and drag vectors breathing, a stall warning flickering when your design is tail-heavy. Then take it to the field: launch it through gyms, backyards, and canyons full of thermals, fans, gusts, and rings — and here's the sacred part — **between throws you trim it**, bending the elevators a hair, adding a paperclip, just like on the playground.

Your folds aren't cosmetics. Every crease changes the physics, honestly. A dart flies like a dart. A glider floats like a glider. A bad fold porpoises across the gym exactly the way your real bad folds did in fourth grade.

**Tone:** warm workshop nostalgia + quiet engineering pride. School-gym light through high windows. The feeling of being the kid whose plane actually flew.

## 2. Market research summary (Sep 2026)

- **Paperly: Paper Plane Adventure** (mobile, polished, "S-tier" reviews): fly-a-plane-through-landscapes with upgrade progression. Its own store reviews explicitly request "folding/creating customizable planes" and "more realistic simulation" as missing features — users of the category leader are asking for exactly this game.
- **Paper Plane Flight** (mobile, 2026): folding exists only as unlockable preset designs — progression skin, not a design space. No cause-and-effect between fold and flight.
- Browser/flash lineage (Kizi Paper Flight etc.): pure distance-tappers; one literally advertises "you can skip the folding part!"
- **STEM validation:** paper airplane design (dart vs glider, paperclip CG tests, dihedral, elevator bends) is a canonical classroom aerodynamics experiment — kids' science curricula walk through the exact parameters our fold system exposes. Third catalog title with a teacher door (after DOOHICKEY, Diamond Rules).
- **Nobody has:** honest fold→physics mapping, visible-airflow wind tunnel, or the trim-between-throws loop.

**Positioning line:** "Every crease counts."

## 3. Structure — three rooms

1. **The Workshop** (portrait): fold your plane.
2. **The Wind Tunnel** (landscape): see why it flies — or doesn't.
3. **The Field** (landscape): courses, challenges, records.
Plus **The Hangar:** your saved designs, each with earned stats and flight history.

## 4. The fold system (design space)

Rendered as an actual folding sequence on paper (top-down sheet with animated creases — satisfying, tactile, each fold has a paper-crease sound). Choices, in fold order:

| Fold choice | Options | Physics effect |
|---|---|---|
| Nose style | Blunt / Pointed / Locked-tab | Drag profile; Locked-tab adds nose mass + stiffness (the classic "nose lock" fold) |
| Nose fold count | 1–3 extra folds | Each fold shifts CG forward + adds nose mass (higher wing loading) |
| Wing crease height | Slider: narrow ↔ wide | Wing area (wide = low wing loading = floaty; narrow = dart) |
| Wingtip fins | None / Up / Down | Yaw stability (up = stable, slight drag; down = agile, twitchy) |
| Dihedral | Slider: flat ↔ V | Roll stability (flat = efficient but roll-prone; V = self-righting) |
| Fold precision | Mini-skill: stop the sweeping marker in the center zone | Symmetry quality → flutter/veer magnitude (see §6). Perfect = "crisp fold" chime |

**Trim (adjustable anytime, including between throws — no refold needed):**
- Elevator bend: both trailing edges up/down (pitch trim — the single most important dial)
- Aileron split: left/right elevator differential (turn/roll trim)
- Paperclip: none / nose / mid (CG shift + mass)

Six fold choices + three trim dials = a real design space (~thousands of meaningfully distinct planes) while every option stays physically legible to a 9-year-old. Named archetypes emerge naturally rather than being presets: players will independently discover The Dart, The Floater, The Loop-de-loop — and the game names a design's archetype after its first flight based on measured behavior ("This one's a Cruiser").

## 5. Flight model (2D longitudinal — honest physics, small math)

Side-view flight with real glider dynamics. State: position, velocity vector, pitch angle, pitch rate.

- **Lift** = ½ρv²·S·CL(α) — CL linear in angle-of-attack up to stall α (~12°), then drops (stall). S from wing crease; stall angle lowered slightly by high wing loading.
- **Drag** = ½ρv²·S·(CD0 + k·CL²) — CD0 from nose style + fins; induced term gives the real glide-ratio tradeoff.
- **Pitch moment** from CG↔center-of-pressure offset (CG from nose folds/paperclip; CP from wing geometry) + elevator trim moment + pitch damping.
- **Why this model:** it produces the true behavior taxonomy *emergently*, no scripting:
  - CG well forward of CP + trim → **stable glide** (shallow descent, maximum distance-per-altitude)
  - CG slightly aft / over-trimmed → **phugoid** — the swooping porpoise every human recognizes as "paper airplane that needs fixing." This is the game's soul: the model *is* the nostalgia.
  - CG far aft → **stall-flip-flutter** (nose up, drop, tumble)
  - Nose-heavy / paperclip forward → **lawn dart**
- **Lateral behavior in a 2D world:** asymmetry (fold precision + aileron split) accumulates a veer/roll value; dihedral damps it. Mild veer = course drift (rendered as the plane easing toward fore/background lanes, a subtle 2.5D wobble); severe = spiral-out, flight over. Honest-enough, cheap, readable.
- **Wind coupling:** wind fields add to airspeed vector before force computation — so a headwind genuinely adds lift (planes balloon upward into a fan blast, exactly like real life), thermals genuinely extend glides. No special cases; the model just tells the truth.
- Fixed timestep (120Hz), deterministic (seeded gusts) — replays and ghost flights identical everywhere (DOOHICKEY law).

## 6. The Wind Tunnel (the wow room)

Your plane pinned in profile in a glass test chamber, airflow ON:
- **Streamlines:** particle streams flow around the silhouette, compressing above the wing, going turbulent behind a blunt nose, detaching at stall. (Visual metaphor driven by the flight model's numbers — curvature/turbulence keyed to CL, CD, stall margin — not CFD, but *truthful* to the sim that will fly.)
- **Live vectors:** lift (green, up from the wing) and drag (red, trailing) scale in real time as you drag the tunnel's wind-speed lever and angle-of-attack dial.
- **Stall demonstration:** pitch the plane past stall α and watch the streamlines rip off the wing while the lift vector collapses — the single best aerodynamics lesson a kid can receive, interactive, in ten seconds.
- **Readouts** (chalk on a slate): glide ratio, wing loading, stability margin (green/amber/red), predicted archetype.
- Trim dials live here too — tune, watch the numbers move, understand *why*. Then fly.
The tunnel is optional (impatient players skip straight to the field) but it's where the depth players and the classrooms will live.

## 7. The Field — courses & challenges

- **Launch:** pull-back-and-release slingshot gesture (angle + power), then *hands off* — the design flies itself. This is a design-then-watch game (DOOHICKEY's rhythm), not a steering game. Watching your creation succeed unaided is the emotion.
- **Mid-flight:** no control. (One exception unlockable late: a single mid-flight "gust whistle" nudge — earned, not default.)
- **Between throws:** the trim loop. Result screen offers Trim (elevator/aileron/clip, 5 seconds) → rethrow instantly. Throw-observe-bend-rethrow until it's *right* — the authentic playground loop, finally in a game.
- **Courses** (slice: first two):
  1. **The Gym** — teaching space: still air, distance line, banners to clear, desk to land on.
  2. **The Backyard** — box fan (steady jet), grill thermal (rising column), clothesline gaps.
  3. **The Canyon** — ridge lift along walls, sink zones, long-glide heaven for floaters.
  4. **The Stadium** — swirling gusts, ring slalom, stunt scoring.
- **Challenge types per course:** Distance / Airtime / Accuracy (land in the zone) / Stunt (rings, loops) — deliberately mirrors real paper-airplane competition categories (distance, time-aloft, accuracy). Different challenges *require* different designs — the Hangar becomes a golf bag: you bring the Dart for distance day and the Floater for airtime.
- Medals per challenge; ghost replay of your best flight (deterministic sim = free ghosts); one-thumb rethrow.

## 8. Visual & audio design

- Look: paper-craft diorama — courses built from cardboard, construction paper, tape; soft afternoon light. The plane renders with visible fold creases and slightly translucent paper (sun through wings on high arcs — the beauty shot).
- Flight camera: follows with gentle lead; on record-breaking flights, subtle slow-mo + vignette at the landing.
- Flight trail: faint dotted line (pencil-on-graph-paper), persists as the ghost.
- Audio: paper crease/snap in workshop; tunnel = filtered noise whose pitch/turbulence tracks airflow state (stall *sounds* ragged); field = air rush by speed, flutter buzz when unstable, soft applause-of-one (a single kid clapping) on medals. All synthesized.

## 9. AI toolchain plan

- **Claude Code:** full build. Flight model first, headless, with a behavior test suite: assert parameter sets produce their archetype (forward-CG set → stable glide; aft-CG → phugoid with expected period; symmetric fold → zero veer). The taxonomy in §5 is the test spec.
- **Gemini Pro:** paper-craft diorama style frames (courses as cardboard sets) to lock palette/props before canvas encoding; independent check of the lift/moment equations and sensible coefficient ranges.
- **ChatGPT Pro:** challenge design table (all courses × challenge types × which archetypes should win — hunting for degenerate "one plane wins everything" holes); teacher one-pager draft mapping features to NGSS forces/motion standards.
- **Grok basic:** name check (AIRWORTHY collisions), store copy, launch thread.
- **Meshy premium:** paper airplane hero model (creased paper material) for icon/store art + a cardboard-diorama scene render for the lucidwinds.com card. And the standing note: AIRWORTHY VR — folding with your hands, then throwing a plane down a real gym in VR — may be the strongest Horizon-beachhead candidate in this whole six-game batch; Meshy builds that entire prop set when the time comes.

## 10. Tech architecture (single file)

- Canvas 2D. Portrait workshop / landscape flight; orientation-aware layout, no forced rotation (letterbox politely).
- Modules-in-file: foldSpec (the 9 parameters) → derive() → physicsParams (mass, CG, S, CD0, stability margin…) → shared by tunnel visualization and flight sim. **One source of truth; tunnel never lies about the field.**
- Sim: fixed 120Hz, render 60fps interpolated; flights are ~5–30s, trivial load. Streamline particles: ~200, pooled.
- Persistence: Hangar designs (foldSpec JSON, tiny), medals, ghosts (sampled trail points) in localStorage; design share-by-link (foldSpec in URL hash — "fly my plane" is a fold recipe, a few dozen bytes; recipient's game folds it before their eyes). PWA + SW inline; fully offline.
- Determinism: seeded gusts per challenge-day; ghost + leaderboard integrity.

## 11. Build order

1. **Flight model headless + archetype test suite.** No pixels until aft-CG reliably porpoises and forward-CG reliably glides.
2. Minimal flight render: hardcoded plane, gym course, slingshot launch, trail. **Feel-test gate: throw a badly-trimmed plane — if the phugoid swoop doesn't make you smile with recognition, tune the model before proceeding. That swoop is the product.**
3. Workshop: fold sequence UI, precision mini-skill, foldSpec → physics derivation.
4. Trim loop: result screen → trim panel → instant rethrow. (Second feel-test: fix a porpoising plane with two elevator bends. The "I fixed it" moment must land.)
5. Wind tunnel: streamlines, vectors, dials, readouts, stall demo.
6. Courses 1–2 + challenge/medal system + ghosts + Hangar.
7. Wind fields (fan, thermal) + veer/2.5D drift rendering.
8. Share links, audio pass, PWA wrapper, polish.

## 12. Stretch / later

- Courses 3–4 (Canyon, Stadium) + gust whistle unlock.
- **Daily Field Day:** seeded wind conditions, one challenge, share your foldSpec + result (Daily-Doohickey pattern).
- Paper types (cardstock/newsprint: mass + stiffness modifiers — stiffness → veer damping, per the wing-stiffness research).
- Classroom pack: tunnel + fold system mapped to forces/motion standards; the wind tunnel alone is a teachable demo.
- Squadron mode: your Hangar vs. a friend's via shared links across all challenge types.
- AIRWORTHY VR on the Horizon list (see §9).
- Cross-satellite garnish: a tiny folded plane as a WARDIAN trinket; DOOHICKEY "paper plane" part that flies with this exact model.

## 13. Open questions for Stephen

- Name: AIRWORTHY (current). Alternatives: EVERY CREASE COUNTS (tagline-as-title), FIELD DAY, THE FOLD, MAIDEN.
- Fold precision mini-skill: keep (adds hands-on stakes + veer source) or auto-perfect folds (pure design game)? (Recommend: keep, with a "steady hands" accessibility toggle that auto-centers.)
- Mid-flight control: hold the hard line at zero (design purity) or ship the gust whistle in slice? (Recommend: zero in slice; whistle as an unlock later — protect the design-then-watch identity first.)
- Portrait workshop / landscape flight split OK, or force one orientation? (Recommend: the split — folding wants portrait paper in the hand; flight wants widescreen sky.)
