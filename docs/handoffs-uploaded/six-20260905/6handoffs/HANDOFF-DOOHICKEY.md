# HANDOFF — DOOHICKEY (Rube Goldberg Builder)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries (custom physics — see §9). Mobile-first, landscape-preferred with portrait support.
**Deploy target:** lucidwinds.com/satellites/doohickey
**Session goal:** Working deterministic physics + touch editor + 8 parts + 6 puzzle levels + sandbox + share-by-link.

---

## 1. Concept

Drag ridiculous parts onto a canvas — ramps, dominoes, fans, balloons, seesaws, a sleeping cat — press GO, and watch a marble trigger beautiful chaos until the goal happens (ring the bell, pop the balloon, feed the cat). Puzzle mode gives you a scene and a limited parts tray; sandbox mode gives you everything.

**Tone:** Saturday-morning-cartoon contraptions. Boings, honks, springs. Failure is funny, not punishing — half the fun is watching it go wrong.

## 2. Market research summary (Sep 2026)

- **The Incredible Machine** (1993) invented the genre: limited parts tray + fixed scene + simple goal, objects with personality (cats chase mice, magnifiers light wicks). 160 levels. Still the template.
- **Contraption Maker** (2014, same creators): modernized with better physics + a level-sharing platform. Sharing is the proven modern addition.
- **Rube Works** (official Rube Goldberg license, mobile): NSTA-recommended, used in classrooms for Newton's laws / simple machines. Its recurring review complaint: touch UI failures — parts sticking together, drifting into the "ceiling," forced full resets. The genre has never gotten a genuinely great touch editor.
- Google Play has low-effort clones with sandbox modes; nothing with charm or share culture.

**Gaps we take:** (1) touch-first editor that actually feels good, (2) frictionless sharing with zero backend, (3) video export of your run (nobody does this and it's free UGC marketing), (4) education-ready framing.

**Positioning line:** "Build something needlessly complicated. Watch it (almost) work."

## 3. Core loop

1. **BUILD:** drag parts from tray → snap grid placement → rotate/flip with big touch handles.
2. **GO:** physics runs, camera gently follows the action. Any time: tap to stop and tweak. Iteration must be < 2 seconds from fail to editing.
3. **WIN:** goal fires → confetti + slow-mo replay of the final chain → stars (parts used ≤ par, all bonus stars touched).
4. **SHARE:** copy a link (whole machine in the URL) or export a video of the run.

## 4. Parts roster

**Launch 12 (slice builds first 8):**
1. **Marble** (the protagonist — start trigger drops it)
2. **Plank/Ramp** (static, rotatable, the workhorse)
3. **Domino** (tips, pushes neighbors — must feel perfect, see §9)
4. **Seesaw** (pinned plank, transfers momentum)
5. **Fan** (constant wind cone, blows light things; toggled by switch)
6. **Balloon** (rises, lifts light attachments by string, pops on spikes → drops cargo)
7. **Bell** (goal object — ring it)
8. **Bucket** (catches things; full bucket gets heavy → can pull rope)
9. **Rope/Pulley** (connect two things over a wheel)
10. **Spring pad** (bounce, tuned high restitution)
11. **Sleeping Cat** (wakes if touched or bell rings nearby → bats the nearest ball hard, then struts off — the personality part, every TIM-like needs one)
12. **Switch** (pressure plate; activates fans/gates)

**Later parts:** magnet, candle+string (burn through), toaster (launches toast), gear chain, portal pair, Penny-designed part (credited, same play as WARDIAN).

Every part: one clear input, one clear output, readable silhouette, distinct sound.

## 5. Modes & level design

- **Puzzle campaign:** 30 levels at launch (slice: 6). Fixed scene + parts tray + goal. Teach one part per early level, then combos. Par-parts for star ratings. Include 1–2 decoy parts by mid-game (classic TIM trick — forces understanding, not tray-emptying).
- **Sandbox:** all parts, blank room, save slots. This is where kids live.
- **Daily Doohickey:** same seed scene + tray for everyone, share your solution link. Cheap retention, no backend (date-seeded).
- Level format: JSON {static geometry, placed fixed parts, tray contents, goal condition, par}.

## 6. Touch editor (the make-or-break system)

Directly counter the genre's known failures:
- **Snap grid** (~24px cells) with magnetic edge alignment; free-place toggle for power users. Snapping kills the "parts stuck together" complaint.
- **Big handles:** selected part gets a rotate dial (15° detents) + flip + duplicate + delete, all thumb-sized, offset above the finger so it's never occluded.
- **No off-screen loss:** parts can't leave scene bounds; tray is a dock, drag out = return to tray.
- **Ghost preview:** invalid placement (overlap) shows red ghost, never silently fails.
- **Two-finger pan/zoom** of the scene; build area larger than one screen.
- **Undo/redo stack** (20 deep). Non-negotiable for a builder.

## 7. Visual & audio design

- Look: thick-outline cartoon flat shading (crayon-adjacent but cleaner), cream paper background with faint grid, parts in saturated primaries. Reads at small sizes; screenshots look like a toy box.
- Physics juice: squash-stretch on bounces (render-only, physics stays rigid), dust puffs on impacts, motion lines on fast objects.
- Camera on GO: eases toward the center of "action energy" (weighted average of moving bodies) with soft zoom. Replays feel directed, not static.
- Audio: every part has a synthesized signature (marble tick-tick, domino clack cascade — pitch rises down the line, fan whirr, balloon squeak, bell ding, cat MRRP). Web Audio, all procedural. Chain reactions become accidental music.

## 8. Sharing (zero-backend, the growth engine)

- **Machine-in-a-link:** serialize placed parts (type, x, y, rot — few bytes each) → binary pack → base64url → `…/doohickey#m=XXXX`. Whole machines fit comfortably in a URL. Copy Link button + native share sheet. Send your machine in a text message.
- **Video export:** `canvas.captureStream()` + MediaRecorder → webm (mp4 where supported) of the run, with the game's audio piped in via Web Audio destination stream. One button: "Film it." This is the TikTok/shorts pipeline for free.
- Daily puzzle links carry the date seed so recipients open the same challenge.

## 9. Physics (custom, deterministic — the engineering heart)

No libraries, so we write a small 2D engine. This is well-trodden; keep scope tight:
- **Bodies:** circles (marble, balloon) + oriented rectangles (planks, dominoes, cat) + static segments (scene). Impulse-based resolution with friction + restitution; 3–4 solver iterations. ~500 lines, Claude Code can build this from spec.
- **Constraints:** pin (seesaw), distance (rope), simple pulley (two distance constraints sharing length budget).
- **Forces:** gravity, fan wind (cone query, force ∝ 1/dist), balloon buoyancy (negative gravity while inflated).
- **DETERMINISM IS LAW:** fixed timestep (120Hz physics, render interpolated), fixed iteration order, no Math.random in sim (seeded PRNG only), no time-dependent branching. The same machine must produce the same run on every device, every replay — shared links and star ratings die without this. Test: run a 20-part machine 100× headless, assert identical final state hash.
- **Sleep states:** settled bodies sleep until touched — keeps 60fps with 100+ parts on phones.
- **Tuning over realism:** dominoes tip a little too easily, bounces are a little too lively. Fun physics, not correct physics. Budget a dedicated tuning pass on dominoes alone — the domino cascade is the game's heartbeat and must be 100% reliable.

## 10. AI toolchain plan

- **Claude Code:** full build. Physics engine gets written first with a headless determinism test before any rendering (see build order).
- **Gemini Pro:** cartoon part concept sheets (12 parts, 3 style variants each) to lock the visual language before encoding it in canvas draw code; also puzzle-idea brainstorming ("give me 20 goal scenarios using only these 12 parts").
- **ChatGPT Pro:** level-solution sanity checks (describe a level, ask for solution paths — if it finds a 2-part cheese solution, the level needs a decoy or wall), plus store copy.
- **Meshy premium:** hero-shot 3D render of a contraption mid-chain for icon/store art. (Also: if this ever goes 3D/VR — a room-scale Rube Goldberg builder is a *monster* WebXR idea for your Meta Horizon beachhead list — Meshy builds that part library.)
- **Grok basic:** name collision check (DOOHICKEY vs alternatives), launch posts, Daily Doohickey social copy templates.

## 11. Tech architecture (single file)

- Canvas 2D, DPR-aware. Physics at fixed 120Hz accumulator; render 60fps interpolated.
- State machines: EDIT ↔ RUN ↔ WON. Machine data = plain array of part records; edit ops mutate + push undo stack.
- Persistence: localStorage (campaign progress, sandbox slots); URL hash for shares; save import/export string.
- PWA manifest + SW inline; fully offline.
- Perf budget: 120 bodies, 40 constraints, 60fps mid-range phone. Sleep aggressively.

## 12. Build order

1. **Physics core headless:** circles + boxes + static segs + impulse solver + determinism hash test. No pixels until 100 identical replays pass.
2. Renderer + a hardcoded scene: marble down ramps into dominoes into a bell. **Stop and feel-test: the domino cascade must be reliable and delightful before anything else.**
3. Editor: tray, snap-drag, rotate handles, undo, GO/stop loop.
4. Parts 4–8 (seesaw, fan, balloon, bucket, spring) + goal system + win flow.
5. 6 campaign levels + star ratings + level loader.
6. Share links (serialize/deserialize) + Daily seed mode.
7. Audio pass + camera director + juice (squash, particles).
8. Video export (MediaRecorder), sandbox save slots, PWA wrapper.
9. Cat. (Last, as a treat.)

## 13. Stretch / later

- Remaining parts (magnet, candle, toaster, gears, portals).
- Machine gallery page on lucidwinds.com that renders shared links as thumbnails (static page reading URL params — still no backend).
- Classroom pack: 10 levels mapped to force/motion standards + teacher one-pager (same distribution door as Diamond Rules; Rube Works proved NSTA/classroom demand exists).
- Weekly community challenge via social ("this scene, 6 parts, film it").
- 3D/VR successor concept for the Meta Horizon list.

## 14. Open questions for Stephen

- Name: DOOHICKEY (current — kid-friendly, memorable, searchable). Alternatives: KERPLUNKT, WHIRLIGIG, THINGAMAJIG.
- Landscape-only, or fight for portrait builds too? (Recommend: support both, design levels landscape.)
- Daily mode in slice or v1.1? (Recommend v1.1 — ship campaign + sandbox + share first.)
