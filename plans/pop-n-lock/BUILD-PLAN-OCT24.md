# Pop N Lock build out: the plan (for Opus to build), Fable, 24 Oct 2026

Read `ART-REVIEW-OCT24.md` first. The game is `satellites/chaff-wars/index.html` (one file, ES5, 1,879 lines, BUILD
v1.6, dev hook `?cwdev=1` gives `CW_DEV`), its worker `sw.js` (`CACHE` chaff-wars-v12), the portal card
`/satellites/chaff-wars/?v=pnl2`, art version `CW_ART_V='pnl1'`. The engine, the campaign ladder, the AI and the Tsu
ruleset are done and were measured in July (memory `project_chaff_wars_jul19`); do not retune them in this plan.

## 0. State block (update IN THE TURN you finish a part)

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
