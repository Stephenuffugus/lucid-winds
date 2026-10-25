# Pop N Lock build out: the plan (for Opus to build), Fable, 24 Oct 2026

Read `ART-REVIEW-OCT24.md` first. The game is `satellites/chaff-wars/index.html` (one file, ES5, 1,879 lines, BUILD
v1.6, dev hook `?cwdev=1` gives `CW_DEV`), its worker `sw.js` (`CACHE` chaff-wars-v12), the portal card
`/satellites/chaff-wars/?v=pnl2`, art version `CW_ART_V='pnl1'`. The engine, the campaign ladder, the AI and the Tsu
ruleset are done and were measured in July (memory `project_chaff_wars_jul19`); do not retune them in this plan.

## 0. State block (update IN THE TURN you finish a part)

- **2026-10-25 03:47 (Opus): PART 4 LIVE as v1.12, WITHOUT RETRO (his call)** (main `3626ffe42`, both origins proven from
  old-worker profiles: v1.12 under sw.js?v=17, cache chaff-wars-v18; gate `p4_gate.mjs` 24, `fwrun.mjs p4` 19 broken
  copies red, p3b 75, p3a 22, p2b 12, p2a 37, p1 13, p0 11; two review lenses found 2 faults, both fixed: Reset campaign
  progress rebuilt PROG without the new keys and froze the next match; the cancel lesson named the NEXT pair, which can
  never cancel). RECORDS: `recMeta` on a stage's first win (`PROG.recs[id]`) and a solo best (`PROG.recs.solo`): rules
  ('standard', 'retro' only if RULES.classic), powers, input {rep, flick, mirror, big, guide}, the rival's {fall, q, react,
  hcap, colors} or {mode}, BUILD, time; old clears get none. LESSONS (PNL-050): pop, chain, cancel on stages 1 to 3
  (`LESSONS`, `lessonFor` skips a rival already beaten and the cancel under Retro, `lessonSeen` for the player only and
  never in the dev sweep): the intro card (STAGE n · LESSON, held 4.8 s or to the tap; the text shrinks to stay above the
  tray), the count, and the result after a loss ("Try this: ..."). The result screen's name and line paint above the
  banner (the name on its own plate). MEASURED (PNL-053, `p4_measure.mjs`, 200 seeded matches a rival a profile, the July
  reference player with its own gravity off, Math.random seeded; the table reproduces): July yardstick (430 ms, 15 percent
  blunders) 100, 100, 100; casual (800 ms, 30) 100, 99.5, 99; beginner (1200 ms, 45) 97.5, 94.5, 81.5. Against the plan's
  80, 70 and 60 percent targets the first three rivals are FAR easier for every bot; human rates are unknown, and no bot
  reads a lesson. Making them harder means ROSTER or AI_TUNE (do not touch): HIS CALL. Fixed seed regression: two
  baselines in p4_gate (the yardstick on stages 1 to 3, the beginner on stage 3 where the rival's Chaff arrives). NOT
  DONE: Retro (his call); the input device in records (INP has none); a save that survives the phone killing the game.
  THE POP N LOCK BUILD ORDER IS COMPLETE (Parts 0 to 4).
- **2026-10-25 03:05 (Opus): PART 3 LIVE as v1.11** (main `c0815c91b`, both origins proven from old-worker profiles: v1.11
  under sw.js?v=16, cache chaff-wars-v17; gates `p3a_gate.mjs` 22 and `p3b_gate.mjs` 75, `fwrun.mjs p3a` 20 and `p3b` 21
  broken copies red, p2b 12, p2a 37, p1 13, p0 11 pass; two review rounds, the second found 2 faults per lens, all fixed).
  The page in real px: fit() writes `--k`, every menu text and every canvas text 12 CSS px or more (`lab(d)`), buttons 48,
  settings rows 56, fixed sizes for engines without max(). Comfort settings: Reduce motion (Auto, On, Off), Screen shake,
  Larger text (x1.25), Vibration. The HUD lays itself out: the header keeps the score at full size (YOUR PLOT and the
  wordmark give way and climb), "N cancelled" left of the card and clear of LOCK, NEXT and RIVAL on plates, a six digit
  rival score beside RIVAL where it fits or on its own line with the rival board stepped down (OF.y set in render, decided
  by the size, never the live score), pest names via `cardName` (shrink, then two balanced lines narrowed, band grows),
  the danger X over the spawning pair (`dangerX`, pixel checked), intro and outro hints a line below the taunt. Title rows
  share their line (`flex:1 1 0; min-width:fit-content`). The fleet song card is HIDDEN in a match by CSS (never
  SWSMusic.hold: it marks a waiting card seen and the song is lost). NOT DONE (said plainly): a song earned mid match
  shows at the next boot, not at the result screen (a reveal there would re-offer any pending song after every match:
  his call); the soundtrack button says "on" (a state) beside "Play beat" (an action); the fleet's music-player.js has
  a dash in its playlist line (a fleet file, not this game); buttons have no side padding (`*{padding:0}`), so Larger
  text fills a third of a row edge to edge. NEXT: Part 4 without Retro (his call): the records carry ruleset, input and
  difficulty; the first three rivals measured (200 expert rounds, fixed seed suites), their speeds unchanged.
- **2026-10-24 23:24 (Opus): PART 2b LIVE as v1.10** (main `bf807d7a4`, both origins proven from old-worker profiles; gate
  `tools/chaff-wars-tests/p2b_gate.mjs` 12 (300 seeded boards for the guide against the real landing, the 30 cap, a mutual
  top out, 60 vs 120 Hz falls, the drain, a hidden Campaign match through its count with real input refused), `fwrun.mjs
  p2b` 14 red). Pause on hide for Solo and Campaign with a three count that holds the controls; the background watchdog for
  Versus only; afterTurn marks MATCH.judge and judgeTick ends the match at the end of update() (a mutual top out = 'draw',
  DRAW stamp, no series point, SERIES.draws counts the round); guideCells/colTop (Outline, Solid, Off; SET.guide); the
  queue as a number plus row rocks and "N cancelled"; falls on a clock (fallDur 110 to 180, eased; the outro drain 90 ms
  straight, chosen at setFall by a negative duration), an 80 ms squash on every landing, only FALLING cells clipped to the
  well. NOT DONE (said plainly): PNL-012's save of board, queue, seed and clocks for a page the phone kills (the pause is in
  memory); the queue's label sizes and the rival's 14 px number wait for Part 3; Astra's squash-before-pop order is HIS CALL
  (as built the pop starts with the squash, about 80 ms quicker per link). NEXT: Part 3 (layout and the launch gate).

- **2026-10-24 22:43 (Opus): PART 2a LIVE as v1.9** (main `57c949749`, both origins proven from old-worker profiles; gate
  `tools/chaff-wars-tests/p2a_gate.mjs` 37 (a vm harness on the page's own repeat scheduler, buffer, kick table and
  landing window; real CDP touches for every tray button and gesture; thumb shots), `fwrun.mjs p2a` 28 red. The tray is
  OUTSIDE the scaled stage in CSS px and fit() keeps the board (BOARD_FOOT 840) above it. CORRECTIONS from two reviews:
  DROP must not be a click (a phone sends no click for a tap while another finger is down) and must drop only the pair in
  play at its press (a tap straddling a landing lock slammed the next pair); a touch is captured by its button and ENTERS
  before it goes down (release the capture, roll only for a pointer that went down on the arrow row); the landing wait is
  max(300, the stage's fall) because a flat 300 locked stage 1 four times sooner than v1.8 (HIS CALL to flip); v1.8
  saved big:true for everyone, so the tray size is a new key (bigTray). Gate scars: CDP touchEnd lists the points LIFTED;
  a broken copy that does not parse proves nothing (fwrun parses first). Not done: the settings rows' text is still under
  12 px at 360 (Part 3); iPhone Safari retargeting after releasePointerCapture is unmeasured.

- **2026-10-24 21:33 (Opus): PART 1 LIVE as v1.8** (main `30e027b49`, both origins proven from old-worker profiles; gate
  `tools/chaff-wars-tests/p1_gate.mjs` 15, `fwrun.mjs p1` 14 red). art/pnl2 = 104 WebP, 4.0 MB, cut by
  `satellites/chaff-wars/tools/cut_art.py` (python3 -I, the zip extracted; art.json is the contract: sizes, the nine slice
  and aperture geometry, frame.slice [90,70,90,70] so the speakers keep one scale, dance timings, ONE render box per
  character = the union of its painted frames). CORRECTIONS from the review (one lens, live code harnesses): Astra's
  next window opening is clear (fill it); the HYPE meter sat on the frame's right neon line (now x 374, the rim); the
  incoming rows sat on the frames' top bands (player's now in the header x 206, rival's beside RIVAL; Part 2b redraws);
  the chain 5 freeze rewound the loop (the loop now plays once and HOLDS d6 until finishResolve on the rival calls
  railChainEnd; 5+ stops the dance clock 240 ms plus a flash); every pest's July portraits stayed decoded (cwRelease).
  The Keeper's rail waits for Part 3's layout. HIS CALLS on the board: a face on the painted Chaff; the marks swapped
  (red diamond, purple star) and Tag shapes inert with her pods; six pests without a dance.

- **2026-10-24 20:30 (Opus): PART 0 LIVE as v1.7** (main `0d841452e`, both origins proven from old-worker profiles; gate
  `tools/chaff-wars-tests/p0_gate.mjs` 11, `fwrun.mjs` 9 red). The dt audit: in tickField, resolveTick, decayFall, the AI
  and update every timer is milliseconds and right (power cooldown, shake, the 110 ms gravity wait, the AI timer, fall decay,
  floats, the rotate tween) except HYPE and the rival's chainGlow, now fixed. CORRECTIONS: the whole game is inside a
  strict IIFE, so gates reach it only through `CW_DEV` (`CW_DEV.match()` added; `CW_DEV.start` stops the loop on purpose,
  `beginStage` starts a match as the game does); the held repeat is proven on the page's own `hold()` with a fake clock
  (the swiftshader page holds its main thread ~40 ms, too coarse for 105 vs 138). FOUND AND FIXED: a soft drop spent the
  gravity time saved at the slow rate (up to 20 rows in a frame); the clamp sits BEFORE the frame is added (the review's
  catch: after it, the soft drop ran 25 percent slow and every stage up to 10 percent slow). With HYPE alive the ALL CITY
  HYPE float (life 1.4) popped to 73 px and 750 px wide: big floats are capped, fitted, stacked. Lock mid drag clears the
  soft drop only when the drag set it (a Part 2a held button must carry over). HIS CALLS on the board: the +500 HYPE bonus
  now pays; the 105 ms tap window; the floats' exclamation marks.

- 2026-10-24 (Fable): plan written, nothing built. Astra's zip at `assets/pop-n-lock-assets.zip` (vaulted
  `vault-20261024-pop-n-lock-astra`); extract to `/tmp` with `python3 -I`, read `extras/` as data, never run it.

## 1. His calls (decided)
None yet for this game beyond the process: Astra made, Fable checked, Opus builds what is planned here; his calls in
section 8 wait for his word.

## 2. The parts, in order (each one deploy; stamps on every ship: `BUILD`, `CW_ART_V` when art changes, the sw
`CACHE`, the card `?v=pnl<N>`)

### Part 0. The real bugs (PNL-060, 061, 062, 063, 067, 066), v1.7
- `tickField`: `f.hype -= dt/1000*1.3` and `f.chainGlow -= dt/1000*1.1` (dt is milliseconds: `loop(t)` passes
  `t - lastT`). Check every other `dt*` in `tickField`, `resolveTick`, `decayFall` and the AI for the same slip and list
  what you found in the state block.
- `finishResolve`: consume `allBonus` only when `R.chain > 0`; a lock with no clear keeps it.
- `pointercancel`: clear `dragSt` and `softHold` only; never a rotate or a hard drop. Also clear holds when a piece
  locks mid drag.
- The hold repeat fires its first repeat at the 105 ms delay, then every 33 ms.
- The next window: one preview rectangle for the art and the pair.
- Gate: a vm harness (the e2 pattern) that pulls `tickField`, `finishResolve`, `hypeTierOf` and the handlers out of
  the page and checks: HYPE 80 after 16 ms is 79.98 (not 59); chainGlow 1 after 16 ms is 0.98; an `allBonus` survives
  a no clear lock and is spent once on the next chain; a dispatched `pointercancel` after a 10 px, 100 ms touch rotates
  nothing (real pointer events through puppeteer, never `el.click()`); the first repeat lands at 105 ms. Each watched red
  on a copy with the fix removed. Look: a match with HYPE climbing past WARM and holding.

### Part 1. Astra's art wired in (PNL-057, 054, 055, 056, 046, 047), v1.8, `CW_ART_V` pnl2
- The cut: a script `scripts/`-free tool at `satellites/chaff-wars/tools/cut_art.py` (like Super Slice's `cut_art.py`),
  reading the zip's folders and writing WebP under `satellites/chaff-wars/art/` with an `art.json` contract (file, size,
  anchor 256,470 for the 512 frames), under a budget (the dance and react frames are 84 files of 512 x 512; WebP them at
  quality 85 and measure the total). Astra's originals stay in the zip and the vault.
- Pods: `CW_POD_ART=true` path uses the five bodies and the chaff behind the code drawn faces (the marks stay visible
  under the eyes, PNL-055); the ten joins drawn behind equal coloured orthogonal neighbours, clipped to the cell, never
  through Chaff (PNL-056). Check at 38, 40 and 44 px in greyscale (a shot with a desaturate filter).
- The well: an opaque near black fill behind the board frame; `board_frame.png` nine sliced around the `PF` rect, the
  rival frame around `OF`, the next window from the one preview rectangle of Part 0 (PNL-054). Keep the painted alley.
- Characters: map the underscore file names to the hyphenated runtime ids (`integration.json` in the zip has the map;
  verify it against `ROSTER[]` yourself). A state machine per character rail: result, hit, danger, chain dance, idle
  (PNL-047: danger enters at spawn column height 10, exits at 8; hit 180 ms; return to the prior state); the six frame
  signature loop plays once at chain 2, with a beat accent at 3 to 4, a 240 ms freeze at 5+ (PNL-046); the six
  characters without a dance keep their idle for the loop. ONE render box per character for dance and react frames
  (scale jumps inside a loop are the moves). Reduced motion: freeze instead of flash.
- Memory: load only the two characters in the match (their dance and react sets) and the next opponent's idle;
  release the rest on stage change; measure decoded memory in the gate (a counter of live images x 1 MiB).
- Fallbacks: every draw stays behind an image loaded check (the game is identical with zero art files, as today); the
  105 missing files are never referenced.
- Gate: `art.json` lists every shipped file with its size; the loader asks for exactly the current match's sets (count
  the requests); the joins never touch a Chaff or a diagonal (a fixture grid, checked by the draw list); HYPE tiers,
  chain plates, pops and story remain code drawn. Looks: the match at 412 x 915, 375 and 360, greyscale check of the
  pods, a dance frame mid loop, a hit and a danger; three things named.

### Part 2a. Input (PNL-007, 005, 006, 003, 004), v1.9
- Two row tray: left, soft drop, right; rotate left, rotate right, Drop; all 56 px; a mirrored thumb option in settings
  (the match concept picture is the layout).
- One repeat scheduler on simulation time: Fast 105/33, Relaxed 160/50; one rotation buffered 120 ms across a spawn,
  never a hard drop.
- Drag: horizontal or vertical intent after 12 CSS px with a 1.5 axis ratio; the upward hard drop flick becomes a
  setting, off by default; pointer capture; every hold cleared on cancel, blur, pause, hide and match end.
- Landing window: 300 ms grounded timer, at most two successful move resets, 650 ms total contact cap, hard drop locks
  at once. Rotation: a documented kick table tested at both walls, on ledges, under roofs and in a one column shaft;
  never through occupied cells; collision immediate, the 90 ms tween visual only. (Quick turn only if he asks, section 8.)
- Gate: puppeteer with real touch events for every tray button and gesture (a tap on Drop drops once; a soft drop hold
  speeds gravity; a 20 px vertical drag does not move sideways); a vm harness for the kick table (each case lands where
  the table says) and the landing window (two resets then lock). Thumb shots at 412 and 360.

### Part 2b. Feel and fairness (PNL-009, 010, 011, 012), v1.10
- The landing guide shows both destination cells including split landings; Off, Outline, Solid options.
- Chain rhythm: 80 ms landing squash, 230 ms pop, 110 to 180 ms settle, landing animated by distance, no frame bound
  decay; input sounds immediate.
- Queued Chaff as a number plus row icons with the cancelled amount shown; the 30 cap is per landing, the rest stays
  queued; both fields commit on the same tick before victory is judged.
- Pause Solo and Campaign on hide; save board, queue, seed and clocks atomically; a three count on resume; gate the
  background watchdog by mode.
- Gate: a vm harness replays a fixed seed and checks the guide's cells against the real landing, the queue after a
  31 attack (30 land, 1 stays), a mutual top out on one tick; a hidden page resumes to the same board. Look: a chain
  mid pop at 412.

### Part 3. Layout and the launch gate (PNL-008, 065, 058, 059), v1.11
- At 412 wide a 264 x 528 player grid and a 96 x 192 rival rail; 228 x 456 at 360, 240 x 480 at 375; labels in CSS px,
  12 px minimum; the settings rows are the hit targets (56 px); the title back button 48 px.
- Text plus shape for tiers, incoming attacks and power readiness; reduced motion, no shake, larger text and haptics
  toggles; no dashes or exclamation marks in player copy; "Sky Wolf Studio".
- Gate: a shot sweep at 412, 375 and 360 with expanded browser bars and 200 percent text; every control measured
  48 px after layout (rendered px, memory `feedback_touch_targets_measure_rendered_px`); no text under 0.7 rem.

### Part 4. Rules named and the difficulty measured (PNL-002, 050, 053), v1.12
- Standard (today's Tsu) and Retro (`RULES.classic`: no countering, no All Clear) as a play option shown beside the
  score; the ruleset, input profile and difficulty stored in every record.
- The first three rivals unchanged in speed; guided restarts and prompts that stop once the skill is shown (80, 70,
  60 percent target win rates, measured with the July sweep tool, 200 expert rounds, one knob at a time, reported in
  the state block, never on a store page).
- Gate: a record carries its ruleset; Retro sends no counter and no All Clear in the vm harness; the sweep reproduces.

### Later, his word first (section 8): Powers (PNL-013 to 033 plus 064), Daily Mix (034), puzzles (035), the crew
collection and story (036 to 038, needs the story art), training (039), Versus rematch and durability (041, 044),
quick match (042), pass and play (043), share cards (045), sound (049), the middle ladder and the secret (051, 052).

## 3. Deploys and gates (every part)
- Commit on the branch with `-- <paths>` (`satellites/chaff-wars/...`, `portal/index.html` for the card stamp only).
  Files only deploy to main from the memory template `scripts/files-only-deploy-bubblenaut.sh` with the chaff-wars
  paths (copy it as `tools/chaff-wars-tests/deploy.sh` the first time, as Super Slice's was). Merge main back. Prime
  old worker profiles on live BEFORE, check both origins after, byte compare with a random query, one probe at a
  time. A phone must close the tab once.
- Gates in `tools/chaff-wars-tests/` (new): the vm harness over the page's functions, puppeteer with real pointer
  events, one browser at a time, every check watched red on a broken copy. The existing `CW_DEV` sweep and proof
  checks stay and must stay green.
- Laws: ES5 single file (no const, let or arrow functions in `index.html`), 48 px, 0.7 rem, no dashes or exclamation
  marks in player copy, nothing sold anywhere in this plan, Sunbeam cap untouched.

## 4. Reporting
As Super Slice: what is live and the proof, one paragraph per part, three things seen wrong, his words verbatim on
the board, the state block in the turn.

## 7. Do not touch
The engine constants (`TARGET_POINTS`, `ALLCLEAR_NUIS`, `GARBAGE_CAP`, the score table), the `ROSTER[]` ramp and
`AI_TUNE` (measured in July), the save keys (`cw_*`, `sw_sb_chaffwars`), the Versus relay and `firestore-rules`,
`sunbeam-sdk.js`, `music-unlocks.js`, `arcade-exit.js`, `feedback.js`, `scripts/`, `CLAUDE.md`, Astra's originals
(cut copies only). The board geometry line `var PF={x:16,y:112,cell:58}, OF={...}` moves only in Part 3 and the art
scales from it.

## 8. His calls (not built unasked)
- **Powers:** Astra's redesign (board tactics, no control sabotage, 17 powers with costs, a resolution contract with
  deterministic tests) replaces his July design. Yes, no, or a mix. Until then Powers stays the hidden mode it is.
- **Retro mode** as a named option (one boolean today): yes or no. The Tsu quick turn: yes or no.
- **The 105 missing files:** a new Astra ask (the six dance sets, 20 pops, 3 chaff cracks, 14 HUD plates, 13 power
  icons, 16 story panels, 3 store images) and a second try at the board frames as a painted speaker cabinet. Fable
  writes it when he says; one doc.
- **Online Versus in this build** (rematch in the room, durable attacks need the relay changed) and quick match.
- **Price** (Astra: 0.99 after the gates pass; 2.99 to 3.99 only with puzzles, daily, crew collection).
- Daily Mix, puzzles, training, pass and play, share cards, the story: which, and in what order.
