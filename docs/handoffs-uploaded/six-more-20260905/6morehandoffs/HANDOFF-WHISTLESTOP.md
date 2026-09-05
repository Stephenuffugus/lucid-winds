# HANDOFF — WHISTLESTOP (Wooden Train Set)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, both orientations.
**Deploy target:** lucidwinds.com/satellites/whistlestop
**Session goal:** Snap track builder + running trains + junction switching + 2 dispatch puzzles + share layouts by link.

---

## 1. Concept
A wooden train set on a sunlit rug, in your browser, instantly. Snap curves, straights, bridges, and junctions together; drop a little train on; it chugs. Then the twist the toy always begged for: **you work the switches.** Add a second train, then a third — tap junctions to route them, keep them from meeting nose-to-nose, get every train home. The builder is the toy; the dispatching is the game.

**Tone:** rug-level camera warmth, Sunday morning, tiny wooden clack sounds.

## 2. Market research summary (Sep 2026)
- **BRIO World – Railway** (official; Steam/Switch/mobile; 2025–26): cozy build sandbox, 250+ wooden-aesthetic pieces, missions, kid profiles, 100% positive early reviews. The build-and-decorate lane is now officially occupied by the brand itself.
- **Tracks: The Train Set Game** (PC): adult-nostalgia builder with first-person riding; interface called "clunky" in reviews; desktop-only.
- **The open lane:** (1) *instant* — free, no install, works in a waiting room on mom's phone; (2) *shareable* — a layout as a text-message link (neither competitor has anything like it); (3) *systemic* — junctions + multiple trains + collision avoidance as gameplay. BRIO official runs trains but the routing-puzzle verb (Mini Metro's soul in a wooden toy body) is unclaimed.
- Wooden-rail conventions worth copying from the physical toy: fixed piece vocabulary (curve = 45° arc, standard straight, riser+bridge, Y-junction), magnetic coupling snap feel.

**Positioning line:** "You've built the track. Now run the railroad."

## 3. Core loop
1. **Build:** tray of pieces → drag to snap onto open track ends (magnetic snap with the *klk* sound; pieces auto-orient — DOOHICKEY editor lessons: snap grid on rail-graph, big handles, undo, no lost pieces).
2. **Run:** place train(s), pull the whistle, they chug. Tap a train: speed 1–3 or stop.
3. **Switch:** junctions show their set direction with a wooden lever; tap to flip — including while trains run. Traffic emerges.
4. **Puzzle mode:** given layouts + goals ("get red to the red station and blue to the blue station; one crossing; don't stop either train") — dispatching brainteasers, escalating.
5. **Share:** layout (and puzzle attempts) as a link; recipient's set assembles itself piece by piece on open (the little build-montage is the delight).

## 4. Track system (the engineering core)
- Track = graph: nodes (endpoints/junctions) + edges (piece geometry as arcs/segments). Trains move by arc-length along edges; junction routing decided by lever state on entry node.
- Piece vocabulary (slice): straight, half-straight, 45° curve L/R, Y-junction, crossing (+bridge/riser in v1.1). All geometry from the physical toy's proportions — layouts feel authentically buildable.
- Snap rule: open end within radius + angle tolerance → snap and merge nodes. Closing a loop = tiny celebration chime (the true joy of the physical toy).
- Trains: engine + N cars as linked arc-length followers (each car trails at fixed spacing — free, perfect articulation). Collision = both trains stop, bump *clonk*, cartoon steam huff — never a failure animation harsher than that; in puzzles it's a retry.
- Determinism (house law): fixed timestep; puzzles and shared replays identical everywhere.

## 5. Scenery & charm
- Rug-texture ground; drop-in props: trees, station, tunnel-mountain, cows (look up as trains pass), water tower. Props are decor-only in slice (BRIO official owns deep decoration — we stay light and spend depth on dispatch).
- Trains: chunky wooden engines in solid colors; name each train (kids will) — name shows on a little flag.
- Sounds: all synthesized — wheel clickety-clack rate = speed, whistle (two-note wooden hoot), snap klk, coupling clack, station bell. The clickety-clack chorus of three running trains is the ambience goal.

## 6. Puzzle design (slice: 2, launch: 20)
- Teach ramp: (1) one junction, route one train home → (2) two trains, one crossing, timing → (3) shared single-track segment (the passing-siding lesson — real railroading's oldest puzzle) → escalate: more trains, loops, "never stop any train" constraints, "all trains swap stations."
- Par = number of lever flips; stars for under-par + no-stops.
- Endless "Yard Duty" mode later: trains keep arriving, route them to matching stations, one mistake ends the shift (Mini Metro pressure, wooden clothes).

## 7. Toolchain
- **Claude Code:** build. Track-graph + arc-length follower math first, headless (assert: loop closure, junction routing, car spacing through curves).
- **ChatGPT Pro:** puzzle set design + solvability/degenerate-solution audit (same job as DOOHICKEY levels).
- **Gemini Pro:** rug/wood palette + prop sheet studies for canvas encoding.
- **Grok basic:** name check (WHISTLESTOP), social copy.
- **Meshy premium:** wooden engine hero render (icon) + rug diorama card art. (VR note: room-scale wooden train set in VR = strong Horizon candidate, shares the AIRWORTHY gym-nostalgia energy.)

## 8. Architecture & build order
- Canvas 2D; graph model as typed arrays where hot; layout serialization = piece list (type, node refs) → base64url link (house pattern); localStorage saves; PWA inline.
1. Track graph + snap building + undo. **Feel-gate: snapping ten pieces into a loop must be satisfying with zero trains.**
2. Train follower + speed control + clickety-clack.
3. Junction levers + collision stop + second train.
4. Puzzle mode shell + 2 puzzles + stars.
5. Scenery props + naming + sounds pass.
6. Share links + self-assembling open montage + PWA wrapper.

## 9. Stretch
- Bridges/risers (adds over/under — big layout expressiveness).
- Yard Duty endless dispatch.
- Cargo (crane loads a log at the mill, deliver to the depot) — light purpose without missions bloat.
- Night mode: headlamps + firefly props.
- Penny's engine livery; brother consult on classic layout patterns (he'll have opinions — retro toy hobbyist energy is adjacent).

## 10. Open questions
- Name: WHISTLESTOP vs CLICKETY vs SIDINGS. (WHISTLESTOP for warmth; SIDINGS if we lean puzzle.)
- Puzzle mode in slice (recommend: yes, 2 levels — it's the differentiator vs BRIO official) or builder-only first?
- Collision behavior in sandbox: bump-stop (recommend) or pass-through ghost option for younger kids?
