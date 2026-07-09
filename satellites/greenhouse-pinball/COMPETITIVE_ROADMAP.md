# Greenhouse Pinball — Competitive Roadmap (vs Pinball FX)

> Generated 2026-07-09 from a 6-lens research + audit + synthesis workflow. The thesis: we cannot beat FX on 3D polygons, so we beat it on the two axes 2D can win — **predictable feel** and **rulesheet depth**. Build order is strict single-variable; every step has a PIN_DEV headless test hook.

## Vision

Greenhouse Pinball becomes the honest, deep, botanical answer to Pinball FX: one meticulously-tuned top-down table that out-READS and out-RULES anything on mobile, precisely because it refuses to chase FX's photoreal 3D and over-slung english. The engine we already have is the hard part done — swept sub-stepped collision, a flipper that transfers real angular velocity, deterministic seeding, and a headless test harness. On that spine we build the thing FX players actually remember: a full shot vocabulary (Fern/Trellis/Heartvine ramps, twin orbits with lane-change, a Dandelion spinner, a Thistle drop bank, B-L-O-O-M standups, a Compost scoop that captures the ball to start missions), a charged plunger with a skill shot, honest nudge+tilt as the top-down replacement for 3D body-english, layered multiballs that ladder jackpot→super-jackpot, six botanical Garden Quests that build to the FULL BLOOM wizard mode, a dot-matrix callout band with escalating audio, and a retention meta of challenge modes, a truly-different daily seeded LAYOUT, table-mastery objectives, personal-best ghosts, and a cosmetic art-pack economy that feeds 012Assets with zero pay-to-win. The flat orthographic look stops being a compromise and becomes the identity — a clean midnight-greenhouse schematic where every lane is a plant verb and the whole table flowers as you play. It stands next to Pinball FX not on polygons but on the two axes 2D can genuinely win: predictable feel and rulesheet depth.

## Pillars

- Honest physics over simulation flash — a deterministic, spin-free ball that does what the player meant beats FX's most-complained-about trait (flippers that 'sling' with too much english). Predictability IS our competitive edge; never add chaotic english or phantom shot-rejects.
- Depth lives in the ruleset, not the render — modes, lit-insert grammar, jackpot ladders and the wizard mode are pure JS state machines that cost zero polygons. We invest 75% of effort here because it is exactly what a top-down game can match a AAA table on.
- Every shot has a NAME, a LIGHT, and a SOUND — on a 540px phone the player must read 'what do I shoot now' at a glance. Each element (ramp habitrail-ting, spinner ratchet-decay, drop-bank clack+reset, scoop gulp+thwack) gets a distinct audio-tactile signature and a flashing/solid/dark insert state.
- One deep table, endlessly re-cut — no library. Challenge modes (1-Ball/5-Minute/Survival), a daily PROCEDURAL layout (not just seeded jitter), mastery objectives, and personal-best ghosts wring 50+ hours from a single playfield, the Space Cadet lesson.
- Botanical growth as the through-line — pinball verbs reskin as gardening (grow, pollinate, bloom, compost). Progression is a plant flowering; the wizard mode is the whole greenhouse in FULL BLOOM. Cosmetics and callouts stay inside the Lucid Winds midnight-greenhouse voice.

## Wizard mode — FULL BLOOM

NAME: FULL BLOOM — 'the whole greenhouse erupts into flower.' (The lighter growth-ribbon event is renamed Bloom Rush so this name is reserved for the finale.)

HOW YOU LIGHT IT: FULL BLOOM is gated behind completing all six Garden Quests in a single 3-ball game (G.questsDone[0..5] all true — quests persist across balls, only the bonus multiplier resets on drain). Each quest is started at the Compost scoop and marks a 'petal' insert solid when completed; the six petals form a flower ring drawn around the scoop so the player can always read '4 of 6 petals lit.' When the sixth petal lights, the Compost scoop begins a rainbow pulse and the DMD reads 'GREENHOUSE READY — SHOOT THE COMPOST HEAP.' Shooting the lit scoop captures the ball (1s hold, GI ramps to white-gold, a 0.3s time-dilation G.slow=0.3, a unique bloom music layer swaps in on the next bar) and starts FULL BLOOM.

STRUCTURE (capped victory multiball — cannot be camped): Spawn 4 balls staggered 200ms with a 12s ball-save. Every major shot — both ramps, both orbits, the Dandelion spinner, and the Compost scoop — lights as a MEGA-JACKPOT worth 1,000,000, each collect adding +250,000 to the running jackpot value. The center Heartvine ramp is the SUPER shot: collecting all six petal-mega-jackpots once lights Heartvine for a 5,000,000 super-jackpot, then the petals relight to be collected again. Add-a-ball is available once via the left inlane→lock feed so an early double-drain doesn't kill it. The mode does NOT end on drain — it ends when G.wizJackpots reaches 12 total mega/super jackpots collected, so a skilled player can't park two balls and farm forever, and an unlucky player still gets their full attempt.

OBJECTIVES / SKILL EXPRESSION: collect 12 jackpots; light and cash the 5M Heartvine super at least once; the expert power-play is to light Playfield 2X (still stackable) right before the super for a 10M swing. Nudge/tilt stays live (tilt still punishes), so control under 4-ball chaos is the real test.

PAYOUT: On finish, award a FULL BLOOM COMPLETE bonus = 3,000,000 × petalsCollectedThisMode (so a clean run pays ~18M+ on top of jackpots), fire the one-time 'Reach Full Bloom' mastery objective (the final 10% of the mastery bar), grant a capped Sunbeam trickle via _sbCapEarn (+4, still inside the 30/day ceiling), unlock the Solstice table skin cosmetic, run a 'greenhouse in full bloom' win beat on the DMD-band backglass (a blooming plant sprite), then RESET G.questsDone to all-false so a second FULL BLOOM is theoretically chaseable in the same game — near-mythical, exactly the bragging-rights carrot that sustains long-term chasing.

TEST HOOK: PIN_DEV.forceWizard() asserts 4 balls, all major shots lit, ends at exactly 12 jackpots regardless of balls-alive, and resets the checklist — see the P1-wizard-fullbloom upgrade testHook.

## Cosmetics economy (feeds 012Assets)

Cosmetics are strictly display-only, deterministically earned, and never sold as power — no loot boxes, no random rolls, no attempt-buying. State lives in localStorage gp_cosmetics {unlocked:[], equipped:{table,ball,flipper,dmd}} and is applied ONLY in render(), with a procedural fallback for every skin (like the current radial-gradient ball) so nothing breaks before art ships. Every skin references assets/greenhouse-pinball/skins/<name>/ PNGs produced by the 012Assets art-pack pipeline, matching the Lucid Winds midnight-greenhouse voice.

CATALOG — TABLE SKINS (backdrop image + insert/wall PALETTE object, zero physics change): Midnight Greenhouse (default, ships now), Dawn Conservatory (warm amber GI), Koi Water Garden (teal), Desert Terrarium (ochre), Bioluminescent Cavern (deep blue neon inserts), Solstice (gold-white — unlocked only by reaching FULL BLOOM). BALL ('pollen bead') SKINS: Dewdrop (default), Seed, Marble, Firefly (soft glow), Koi Pearl, Crystal. FLIPPER SKINS: Leaf, Petal, Bamboo, Trellis. DMD THEMES: gold-on-black (default), sage, amber, ice — a dot color + glyph pack. TROPHY-SHELF FIGURINES (collectible, display-only): small botanical trophies (a pressed flower, a mounted spinner blade, a Full Bloom rosette) shown on a Trophy Shelf screen as a grid with locked silhouettes for un-earned.

UNLOCK MAP (deterministic, cosmetic-only): by mastery % thresholds (e.g. 25% → Marble ball, 60% → Bamboo flippers), by XP level milestones (L10 → Dawn Conservatory, L25 → Firefly ball, L50 → Koi Water Garden), by SPECIFIC objectives ('Reach Pollen Multiball' → Koi Pearl; 'Reach FULL BLOOM' → Solstice table), and by season points (weekly/season cadence unlocks shelf figurines). MONETIZATION LANE: the portal's 012Assets economy may SELL cosmetic art-packs (a themed table+ball+DMD bundle) with KNOWN contents — this is the only paid layer, it is purely cosmetic, grants zero gameplay advantage, and never touches the Sunbeam economy (Sunbeams stay a capped 30/day portal EARN currency, never a spend sink here). This mirrors Zen retiring Pinball Pass/Coins while keeping the free cosmetic loop: the free earn-by-play scaffold is the durable part, and any store is cosmetic-only.

VERIFY: equipping any skin must leave the ball's frame-by-frame trajectory byte-identical for a fixed seed (the P3-cosmetics-shelf testHook) — proof that cosmetics never leak into physics.

## Upgrades (30)

### P0-feel

#### `P0-plunger-skillshot` — Charged plunger + shooter lane + skill shot  _(effort M, impact 5/5)_

- **FX ref:** Lens 1/2/6 — variable-power plunger with a lit skill-shot lane; 'first skill test of every ball'. Replaces the arcade free-drop.
- **Ours now:** launch() (line 286) fires a FIXED randomized velocity (vx:-200±90, vy:-1160±90). serveBall() parks the ball at (412,700) inside the open field. Zero agency, no aim, no lane.
- **Build:** Add a right-edge shooter channel to WALLS (two segments forming a lane) and move serveBall()'s spawn into it. Add G.plunger={charging,power} state in newGame(). In press()/onDown()/onKey(): while G.awaitLaunch, holding the launch input ramps G.plunger.power 0→1; release calls launch() which sets b.vy=-(minPow+power*range), b.vx≈0 so the ball rides the lane. Add a one-way gate segment at the lane top so a charged ball feeds the top arc. Add G.skillLit (index of the lit top-lane); first rollover crossing (see rollovers upgrade) within G.skillWindow awards it. Relocate the growth ribbon draw in drawGrowth() from x=524 to the LEFT rail (x≈24) to free the right rail for the lane.
- **Specs:** Shooter lane walls at x=476 (inner) and x=528 (outer), y from 902 up to 150; one-way gate segment at (476,150)->(500,120). serveBall spawns b at (502,884), inLane:true. Charge 0→1 over 0.9s; launch vy = -(720 + power*820) (range ~ -720 to -1540), vx=(Math.random()*2-1)*20. Skill lane = middle top rollover at (265,130); award 50,000 if crossed first within G.skillWindow=2.0s of launch; 'SUPER SKILL' 100,000 if the ball is then flipped into the lit Heartvine ramp within 1.5s. Charge meter drawn as a vertical bar in the lane.
- **Test:** PIN_DEV.chargePlunge(p) sets power then launch(); loop step(0.016) and record ball apex y — assert apex is monotonic decreasing in p across p∈{0.1..1.0} (more power = higher). At p=0.62 assert the ball's first rollover crossing sets G.skillLit collected and score increased by 50000.

#### `P0-nudge-tilt` — Nudge impulse + graded tilt / TILT-out  _(effort S, impact 5/5)_

- **FX ref:** Lens 1/6 — nudge is the primary skill beyond flippers; graded warnings then a hard TILT that kills flippers and drains. The honest top-down replacement for 3D body-english.
- **Ours now:** No nudge input, no tilt. Screen-shake in render() (line 323) is cosmetic OUTPUT only, never a physics input. G has a shake field but nothing feeds the ball.
- **Build:** Add nudge as a third input in onDown()/press() (two-finger tap or dedicated tap zones) and onKey() (map to ',' left, '.' right, Space=up while in play, distinct from launch). Each nudge adds a one-shot impulse to every non-inLane ball's vx/vy and pushes G.nudgeJolt (render offset). Add G.tilt meter + G.tiltOut flag, decayed in step(). In physics() drain and flipHit(), if G.tiltOut skip flipper force. Reuse G.shake for the jolt visual.
- **Specs:** Nudge impulse: ball.vx += dir*190 (left/right) or ball.vy -= 190 (up), applied once, 250ms cooldown (G.nudgeCd). Board jolt 6px easing back over 150ms. Tilt meter += 34 per nudge, decays 20/sec; DANGER warning callout at 70; TILT at 100 → G.tiltOut=true for 3.0s: flippers dead, current ball drains, no bonus, DMD 'TILT'. Meter resets on new ball. Mobile: left third / right third / center-top nudge zones distinct from the flipper halves used only while a ball is live.
- **Test:** PIN_DEV.nudge('left') three times inside 1s (step 0.1 between) → assert G.tilt>=100, G.tiltOut===true, and a subsequent PIN_DEV.flip('l',true)+step leaves ball.vy unchanged by the flipper (dead). Single nudge from rest asserts ball.vx delta ≈ +190 ±5.

#### `P0-flipper-cradle` — Cradle/hold, honest tip-vs-base transfer, EOS snap, de-slung restitution  _(effort M, impact 4/5)_

- **FX ref:** Lens 1/6 — hold-to-cradle is the foundation of ALL aimed pinball; tip hits stronger than base; drop-catch dead-bounce; explicitly LESS english than FX to avoid the #1 complaint.
- **Ours now:** flipHit() (line 218) has a hardcoded teleport-launch: when |F.w|>3 && b.y>780 it OVERWRITES vx/vy with lv=1180... (arcadey slap, no aim). Resting coeff 1.02, swinging 1.4 (too bouncy). No cradle branch; a held ball on the blade gets no control.
- **Build:** In flipHit(): DELETE the hardcoded lv override block (line 234-235). Keep only the tangential-velocity transfer from F.w×arm so tip contact (t→1) is naturally faster than base (t→0) — this alone enables backhands and aimed shots. Add a cradle branch: if F.up && Math.abs(F.w)<3 && ballSpeed<250, damp tangential velocity ~0 so the ball rests in the crook. Lower coeffs. Add EOS: if contact occurs in the last 2 frames of the sweep (detect via F.a near F.actA and F.w sign), multiply exit speed ×1.15. stepFlipper() unchanged.
- **Specs:** Resting coeff 0.90 (drop-catch dead-bounce), swinging coeff 1.15 (was 1.4 — less sling). Cradle damp: multiply the tangential component by 0.12 when held+slow. EOS window: last 15% of the actA-restA arc, ×1.15 exit. Flip sweep stays ~ dt*34 ease (≈70-90ms). No spin/english scalar is ever added — omission is the feature.
- **Test:** Inject two balls via state() at identical low speed contacting LFLIP at t=0.9 (tip) and t=0.1 (base), PIN_DEV.flip('l',true), step 3 frames → assert tip-ball exit speed > base-ball exit speed. Inject a slow ball resting on a held flipper → assert |vy|<60 after 0.3s (cradled, not launched).

#### `P0-drain-geography` — Inlane/outlane split + rolling friction + readable drain  _(effort M, impact 4/5)_

- **FX ref:** Lens 2 — the inlane (safe return) vs outlane (killer) split is the risk geography that makes the bottom of the table tense; avoid FX's 'too-steep, dive-bomb' drain.
- **Ours now:** WALLS inlanes (line 168-169) are plain angled walls funneling to the pivots; the ball drains anywhere it crosses DRAINY=902. No outlane danger, no inlane reward, single global drag 0.9992 with no distinct rolling friction.
- **Build:** Rework the two inlane WALL chains into a divided lower field: add divider-post segments so each side splits into an OUTLANE (outside the flipper) and an INLANE (inside, feeding the flipper). Tag outlane vs inlane crossing zones by x-range in the physics() drain loop. Add a light rolling-friction term (extra multiply when speed<300) so a slow ball dies in dead zones like real steel, distinct from air drag. Keep GRAV=1500 but this is our tunable — do NOT increase it chasing 'fast'.
- **Specs:** Left: outlane channel x∈[60,104] (drains), divider post segment (108,760)->(112,860), inlane x∈[120,168] feeding LFLIP. Mirror on right (x∈[436,480] outlane, x∈[372,420] inlane). Rolling friction: if speed<300, vx*=0.988,vy*=0.988 per tick (atop existing 0.9992 air drag). Inlane crossing lights a timed 5s combo arrow at that flipper (feeds the shots backbone).
- **Test:** PIN_DEV.dropBall(x) helper injects a ball above each lane and steps to drain. Assert a ball entering x=82 (left outlane) drains with no save while a ball entering x=140 (left inlane) is delivered to LFLIP (reaches y>820 with x within 30px of the pivot). Assert a ball at speed 200 in a flat zone stops within 1.2s.

#### `P0-ball-ball` — Ball-to-ball elastic collision for multiball  _(effort S, impact 3/5)_

- **FX ref:** Lens 3/6 — multiball must have real ball interaction; FX chaos of balls jostling is core to the peak moment.
- **Ours now:** triggerBloom() (line 271) already spawns extra balls, but physics() never tests ball pairs — multiball balls pass straight through each other. Audit flags this explicitly.
- **Build:** Add a pairwise pass inside the SUB loop in physics(): for each pair (i<j) of non-inLane balls, run a circHit-style resolver (equal-mass elastic: exchange the normal velocity components, push apart by overlap). Cheap at ≤4 balls (≤6 pairs). Must run every substep so fast balls don't tunnel through each other.
- **Specs:** Equal mass, restitution 0.95. On overlap d<2*BALLR: separate each by overlap/2 along the normal; swap normal-velocity components (v1n↔v2n), keep tangential. Cap total active balls at 4 (matches the 4-ball wizard). BALLR=11 unchanged.
- **Test:** Inject two balls on a head-on course (b1 vx=+400, b2 vx=-400, same y) via state(); step 5 frames → assert they never overlap (center distance ≥ 22 every frame) and total x-momentum is conserved within 5%.

### P1-depth

#### `P1-shots-backbone` — SHOTS array + lit-insert grammar + combo chaining  _(effort M, impact 5/5)_

- **FX ref:** Lens 2/3/4 — the universal shot grammar: every scoring zone is flashing(available)/solid(done)/dark, hitting a lit shot lights the NEXT for ~4s (combos). This one system underlies every ramp/orbit/loop.
- **Ours now:** Only BUMPERS/SLINGS exist and onBump() (line 263) is the single flat scoring choke point. No named shots, no lit inserts, no combo chain, no shot-direction feedback.
- **Build:** Add a module-level SHOTS array of {id,type,seg-or-rect,lampState:0/1/2,value,chain:[nextIds],litTimer}. Parse it in physics() exactly like WALLS: sweep the ball segment against each shot's trigger; on a lit crossing call scoreShot(shot). Add a comboManager in step(): lastShotT, comboCount; a lit hit within 2.5s increments comboCount and multiplies award. Add drawInserts() called in render() before drawFlipper() drawing a chevron/glow per shot driven by lampState (flashing = 0.5+0.5*sin(t*6)). Route bumper hits through the same combo layer.
- **Specs:** lampState flash 3Hz. Base values: standup 500, rollover 250, drop 1,000, ramp 2,500, orbit 3,000, spinner 800/rev. Combo window 2500ms; award ×comboCount capped ×5; 'COMBO xN!' float scales 110%→100% over 150ms. Lit inlane arrow (from P0-drain-geography) lights a random adjacent shot for 5s.
- **Test:** PIN_DEV.hitShot('fernRamp') → assert SHOTS['fernRamp'].lampState set, comboCount=1, and its chain targets flip to lampState=1. Call hitShot on a chained target within 2s → assert comboCount=2 and awarded points doubled; wait 3s and assert comboCount reset to 1.

#### `P1-ramps` — Ramps as raised auto-return lanes (detach-and-tween habitrail)  _(effort M, impact 5/5)_

- **FX ref:** Lens 2/6 — ramps are the backbone of FLOW; do NOT physically simulate a Z incline, detach the ball and tween it on rails, then feed it to an inlane. Reject too-slow entries fairly (be generous — avoid FX phantom rejects).
- **Ours now:** No ramps. The ball just bounces the open field.
- **Build:** Add three ramp shots to SHOTS with type:'ramp' and a Catmull-Rom/polyline path + exitVel. On a lit entry with entry speed above threshold, set b.onRail=path and b.railT=0, and SKIP normal integration for that ball in physics() while onRail (advance railT, position along path, render bigger + drop-shadow to fake height). At railT=1 re-inject at the habitrail exit with exitVel. Below threshold: reflect vy (rattle-back reject). Diverter flag chooses between two exit paths for mode routing.
- **Specs:** Fern Ramp mouth rect x∈[120,175] y≈460 → exit right inlane (330,760) delivering to RFLIP. Trellis Ramp mouth x∈[355,410] y≈460 → exit left inlane (210,760) to LFLIP. Heartvine (center) ramp mouth x∈[248,290] y≈420 → exit top-of-shooter-lane (feeds a controlled replunge) — this is the super-jackpot shot. Entry threshold speed 620; tween at constant 900 units over 420ms; ball scale 1.0→1.15→1.0; drop-shadow offset 4px. Values: 2,500 base, mode-lit far higher.
- **Test:** PIN_DEV.hitShot('fernRamp',{speed:900}) → assert G ball gains b.onRail, and after stepping ~0.45s the ball re-appears within 25px of (330,760) with downward vy. hitShot('fernRamp',{speed:300}) → assert reject (b.onRail null, vy reversed).

#### `P1-orbits` — Twin orbits/loops with lane-change and fast return  _(effort M, impact 4/5)_

- **FX ref:** Lens 2 — highest-velocity shots; full orbit returns to the opposite flipper, half-orbit to same side; mid-flight lane-change gives a moment of agency; return is dangerously fast.
- **Ours now:** None. The 'top arc' WALLS just bounce.
- **Build:** Same detach-and-tween as ramps but along a perimeter arc that exits opposite (full) or same side (half). During the tween read flipper input to toggle which top-lane rollover is lit (lane-change) and bias the exit. Re-inject at ~1.4x ramp speed so the return is a genuine threat (tune so it is controllable, NOT a dive-bomb).
- **Specs:** Left orbit entry near (95,600) hugging x=60 wall, arcs over the top, exits right side to RFLIP. Right orbit mirror. Injection speed 1260 (1.4× ramp). Lane-change: tapping the opposite flipper mid-tween shifts G.skillLit / bonus-lane index; exit lane biased ±30px. Value 3,000 base; full-orbit combo lights the Heartvine ramp next.
- **Test:** PIN_DEV.hitShot('leftOrbit') → assert ball enters tween and re-injects on the RIGHT side (x>360) heading down. During tween call PIN_DEV.flip('r',true) → assert G.skillLit index changed (lane-change registered).

#### `P1-spinner` — Dandelion Spinner — velocity→score ticks with decay  _(effort S, impact 4/5)_

- **FX ref:** Lens 2 — the purest speed-to-score converter; 'ripping the spinner' is a signature pleasure; mode-boosted spinner becomes a jackpot. Pass-THROUGH, never a bouncer.
- **Ours now:** None.
- **Build:** Add a spinner shot type:'spinner' as a gate segment in the left-orbit throat that the ball passes through unimpeded. On crossing, capture speed and spawn a decaying counter in step(): angular velocity w seeded from ball speed, w*=0.92/tick, one score tick + ratchet blip per simulated rotation until w<threshold. Draw a rotating blade rect in drawInserts() whose spin matches w.
- **Specs:** Spinner at (90,380) in left orbit lane. rotations = floor(speed/70); each tick = 800 × spinnerMult (×5 when mode-lit → 4,000/rev). Blip interval starts ~60ms, lengthens as w decays over ~1.5-3s. A fresh rip ≈ 15-40 ticks.
- **Test:** PIN_DEV.hitShot('spinner',{speed:1200}) then step 3s → assert score increased by approximately floor(1200/70)*800 (±one tick) and G.spinnerActive decays to 0.

#### `P1-drop-bank` — Thistle drop-target bank (knock-down → complete → reset → gate scoop)  _(effort S, impact 4/5)_

- **FX ref:** Lens 2 — the primary progress/puzzle element with visible state ('3 of 3 down'), a reset+reward loop, and completion that GATES a deeper shot.
- **Ours now:** None. No knock-down state anywhere.
- **Build:** Add N drop shots type:'drop' each a short static collider with down:false. On ball collision (via circHit/segHit path in physics()) set down:true, play CLACK, disable that collider, dim its sprite in drawInserts(). When all down: award bank bonus, fanfare, after 0.4s set all down:false + re-enable (pop up) and set G.scoopLit=true (reveal/light the Compost scoop).
- **Specs:** 3-target bank at (140,540),(175,545),(210,550) angled. Individual hit 1,000; bank complete 10,000 + light scoop. Reset delay 0.4s. Lit when standing (green), dark when down. Completing it 3 times in one ball lights a Playfield-2X standup.
- **Test:** PIN_DEV.hitShot('thistle0'),('thistle1'),('thistle2') → assert after the 3rd G.score += 10000, G.scoopLit===true, and after step(0.5) all three .down===false (reset).

#### `P1-standups` — B-L-O-O-M standup targets (spell-a-word qualifier)  _(effort S, impact 3/5)_

- **FX ref:** Lens 2 — the numerous cheap scoring element that drives 'spell the word' collection building toward a mode/multiball.
- **Ours now:** None.
- **Build:** Add 5 standup shots type:'standup' that bounce the ball (reflect via existing circHit) and set a bit in G.word bitmask when hit. When all 5 collected: chime, advance G.bloomLetters, light the ball-LOCK for the Pollen multiball, reset the word after a short flash.
- **Specs:** Standups spelling B-L-O-O-M at (70,300),(70,430) left inner rail, (265,190) top-center, (470,300),(470,430) right inner rail. Each hit 500 + light its letter; full word 5,000 + light Lock. Word resets each completion for repeat locks.
- **Test:** PIN_DEV.hitShot for all five B,L,O,O,M ids → assert G.word bitmask===0b11111, G.lockLit===true, and score += 5*500+5000.

#### `P1-scoop-modestart` — Compost Heap scoop — capture-hold-eject mode start with rotating selector  _(effort S, impact 5/5)_

- **FX ref:** Lens 2/3 — the scoop is the table's MENU: nearly every mission/multiball launches from a capture-hold-eject. The pause-and-announce beat makes a mode feel like an event.
- **Ours now:** No hole/capture mechanic anywhere. drainBall() is the only place a ball leaves play.
- **Build:** Add a scoop shot type:'scoop' (circle trigger). On entry with G.scoopLit: zero the ball's velocity, park it at scoop center (b.captured=true), open a mode-start overlay for ~1.0s (dim playfield, run a rotating selector cycling the armed quest every 1.2s so the player's timing chooses), then eject at a fixed vector toward a flipper and start the selected Garden Quest. Add the capture/hold/eject as a small state block in step() (not drainBall).
- **Specs:** Scoop at (265,600), r=16. Capture hold 1.0s; selector cycles the 6 quests at 1.2s each while lit; eject vector v=( -260, -900 ) toward LFLIP with a THWACK. Mystery award (unlit scoop) = 25,000 + advance bonus. Qualify: lit by completing the Thistle bank OR the B-L-O-O-M word.
- **Test:** Set G.scoopLit via PIN_DEV then PIN_DEV.hitShot('scoop') → assert ball velocity 0 and b.captured for ~1s, then a quest is active (G.quest!=null) and the ball is ejected (speed>800 heading up).

#### `P1-rollovers` — Top-lane S-U-N rollovers + inlane/outlane rollover logic  _(effort M, impact 3/5)_

- **FX ref:** Lens 2 — top lanes are the steady bonus-multiplier builder (light all → advance bonus X, then reset); inlanes light timed combos; outlanes are the deadly drains.
- **Ours now:** No rollover switches at all; the top arc is dumb walls; no bonus multiplier exists.
- **Build:** Add pass-through rollover shots type:'rollover' at the top (3 lanes) and one per inlane. Crossing a top lane lights it; all 3 lit advances G.bonusMult and resets the lanes. Lane-change (from orbits) toggles which top lane is lit. Inlane rollover lights a 5s combo arrow. Wire the top-center lane as the skill-shot lane (P0).
- **Specs:** Top lanes at (160,130),(265,130),(370,130) spelling S-U-N. All 3 lit → G.bonusMult += 1 (cap 5) + 2,500, reset lanes. Inlane rollovers at (150,770) and (330,770) each light a random shot for 5s and add +1,000 to end-of-ball bonus base.
- **Test:** PIN_DEV.hitShot('sun0'),('sun1'),('sun2') → assert G.bonusMult incremented by 1 and the three lanes' lampState reset to flashing.

#### `P1-kickback` — Kickback outlane save (charged resource)  _(effort S, impact 3/5)_

- **FX ref:** Lens 1/2 — the managed safety net; a lit kickback turns certain death into a reprieve and rewards setup-in-advance play. Cleaner in 2D than a half-working nudge-save.
- **Ours now:** Only the one-shot moss-net drain-save exists (physics line 257), centered on the drain, not tied to any outlane or resource management.
- **Build:** Add G.kickbackLit boolean (left outlane). In the physics() drain loop, if a ball enters the LEFT outlane x-range while G.kickbackLit, consume the charge and fire it back UP the lane (BANG) instead of draining. Re-light by hitting a designated standup/lane. Keep the moss-net as a separate, gentler first-drain mercy (newcomer aid).
- **Specs:** Left outlane zone x∈[60,104], y>860. If G.kickbackLit: set b.vy=-1050, b.vx=+120, G.kickbackLit=false, DMD 'KICKBACK'. Re-lit by hitting the left B standup or the left inlane rollover twice. Draw the outlane glowing green when charged.
- **Test:** Set G.kickbackLit=true, inject a ball into (82,880) heading down, step → assert b.vy<0 (punched up) and G.kickbackLit===false; repeat with kickbackLit=false → assert the ball drains.

#### `P1-garden-quests` — Garden Quests — 6-mission state machine with timed objectives & hurry-ups  _(effort M, impact 5/5)_

- **FX ref:** Lens 3 — the layered progression: qualify→start at scoop→hit lit shot set before a timer→complete→checklist. Includes hurry-up (decaying value) and escalating in-mode shot values.
- **Ours now:** No modes/missions at all. The only 'objective' is filling the growth ribbon. Scoring is flat.
- **Build:** Add G.quest (current) and G.questsDone[6] to newGame(). Define QUESTS[] each {name,shots:[ids],timer,type:'anyOrder'|'sequence'|'hurryup',onComplete}. Scoop start (P1-scoop) picks one and lights its shots (lampState=1). A tick in step() decrements G.quest.timer; scoreShot() marks lit-mode shots done with escalating value; all done → mark questsDone[i]=true, big score, DMD fanfare. Timer 0 → fail, relight later. Persist nothing per-ball — quests span the whole 3-ball game (only bonus mult resets).
- **Specs:** 6 quests: 1 Seedling Sprint (hit 3 lit ramps, 30s), 2 Pollen Trail (spinner rips ×3, 25s), 3 Root Network (drop bank + both orbits sequence, 35s), 4 Sun Chase (hurry-up starting 250,000 decay 10,000/s floor 25,000, collect at Heartvine), 5 Thorn Guard (5 standups under 20s), 6 Nectar Flow (any 6 lit shots, 40s). In-mode shot value escalates base×(1+hitsThisMode*0.5). Complete values 250k→1,000,000 across quests 1→6. Timer bar drawn in the DMD band; red flash + beep under 5s.
- **Test:** PIN_DEV.startQuest(0) then PIN_DEV.hitShot for its 3 ramps within simulated 30s → assert G.questsDone[0]===true and score jumped by the completion award; let a quest timer hit 0 → assert G.quest cleared and questsDone unchanged (fail, re-startable).

#### `P1-multiball-locks` — Ball-lock multiballs with jackpot→super-jackpot ladder; retier the Bloom event  _(effort L, impact 5/5)_

- **FX ref:** Lens 3 — lock balls → release → lit shots become jackpots → build → super-jackpot; add-a-ball; ball-save protects launch. The scoring engine and emotional peak.
- **Ours now:** triggerBloom() (line 271) is a single binary 2-ball add off a full growth ribbon with a flat +3000 and NO jackpot ladder, no locks, no add-a-ball, no ball-save. It is 'Bloom Multiball' in copy.
- **Build:** Rework into a real ball-LOCK flow using the Compost scoop / a dedicated lock: locking a ball parks it (removes from active balls, increments G.locked); at 3, stagger-launch all into play and set G.multiball with jackpot shots lit. Keep the growth ribbon but rename its event 'Bloom Rush' (a lighter 2-ball add, +5,000/bumper) so the LOCK multiball ('Pollen Multiball', 3-ball) is the real one. Jackpots grow; collect all base jackpots → light super-jackpot at Heartvine. Add-a-ball relights the lock once. Add G.ballSave timer. Feed ball-ball collision (P0).
- **Specs:** Lock lit by completing B-L-O-O-M word. 3 locks → Pollen Multiball: spawn 3 balls staggered 200ms, ball-save 10s. Jackpot = lit orbit/ramp 100,000 growing +25,000; super-jackpot = Heartvine 500,000 after all base arrows hit. Add-a-ball once via left inlane→lock. Multiball ends when balls.length returns to 1. Bloom Rush (growth==GROWTH_MAX) = 2 balls, 8s, +5,000/bumper, no jackpot ladder.
- **Test:** PIN_DEV.lock() ×3 → assert G.balls.length becomes 3, G.multiball===true, jackpot shots lit; PIN_DEV.hitShot all base jackpots → assert G.superLit===true; drain to 1 → assert G.multiball===false.

#### `P1-eob-bonus` — End-of-ball bonus + bonus multiplier tally  _(effort S, impact 3/5)_

- **FX ref:** Lens 3 — the quiet accountant: sum of what you did this ball × a multiplier you built, animated with rising ticks; multiplier resets each ball.
- **Ours now:** drainBall() (line 280) just serves the next ball; there is no bonus accumulation, no multiplier, no tally.
- **Build:** Accumulate G.bonusBase during the ball (+= per lit hit / quest advance) and raise G.bonusMult (1→5) via inlane rollovers / top lanes. In drainBall(), when balls.length hits 0 and it's not the last ball, run a short animated tally (rising WebAudio ticks) adding bonusBase×bonusMult to score, then reset bonusMult to 1 (keep questsDone). On last ball, tally then endRun().
- **Specs:** bonusBase += 5,000 per lit-shot hit, +10,000 per quest advance. bonusMult 1→5 via 'SUN' lanes (P1-rollovers). Tally animates over 0.5-1.5s with pitched ticks. bonusMult resets to 1 next ball unless a (future) Hold-Bonus award set. Shown in the DMD band on drain.
- **Test:** Set G.bonusBase=40000,G.bonusMult=3 via state(), drain the last active ball (non-final ball) → assert score increased by 120000 and G.bonusMult reset to 1 for the next ball.

#### `P1-playfield-mult` — Playfield 2X — the expert power-play multiplier  _(effort S, impact 4/5)_

- **FX ref:** Lens 3 — a timed global 2X is the highest-leverage thing in the game; the classic power play is 'light 2X, THEN collect a super jackpot.' Gives the rulesheet its skill ceiling.
- **Ours now:** Only the combo mult (G.mult, onBump line 269, cap ×8) exists; no global timed playfield multiplier and no strategic 'cash-in' layer.
- **Build:** Add G.pfMult (1 or 2) and G.pfTimer lit by a dedicated standup (revealed by completing the Thistle bank 3×). While active, scoreShot() and onBump() multiply all awards by G.pfMult. Draw a bold '2X' HUD flag + screen-edge glow (drawInserts) so the player feels urgency.
- **Specs:** 2X for 25s from the Bloom-2X standup at (265,470). Stacks multiplicatively with combo mult and multiball ×2. Edge glow pulse while active. Cannot be re-lit until it expires.
- **Test:** Set G.pfMult=2,G.pfTimer=25 via state(), PIN_DEV.hitShot('spinner',{speed:700}) → assert the spinner award is exactly doubled vs the same hit with pfMult=1; step 26s → assert G.pfMult back to 1.

#### `P1-wizard-fullbloom` — FULL BLOOM wizard mode (capped victory multiball)  _(effort M, impact 5/5)_

- **FX ref:** Lens 3 — the finale gated behind completing every quest; a capped-multiball wizard (ends after N jackpots, can't be camped) is the respected design vs an anticlimactic point dump.
- **Ours now:** No wizard mode; nothing to chase past the growth ribbon.
- **Build:** When G.questsDone all true, light the scoop rainbow ('GREENHOUSE READY'); shooting it starts FULL BLOOM: spawn 4 balls, set G.wizard, light every major shot as a mega-jackpot, run a 12s ball-save, end after G.wizJackpots reaches 12 (NOT on drain). See wizardModeDesign for the full spec. On finish award the big bonus, fire the 'Reach Full Bloom' mastery objective + Sunbeam trickle, show a win beat, and reset questsDone for a theoretical 2nd wizard.
- **Specs:** Detailed in wizardModeDesign field. Key numbers: 4 balls; mega-jackpot 1,000,000 +250,000; Heartvine super 5,000,000; complete bonus 3,000,000×petalsCollected; ends at 12 jackpots; 12s ball-save; 0.3s time-dilation entry; unique gold-white GI + music layer.
- **Test:** PIN_DEV.forceWizard() → assert G.balls.length===4, G.wizard===true, all major shots lampState=1; PIN_DEV.hitShot a jackpot 12 times → assert the mode ENDS (G.wizard===false) even with >1 ball still live, and G.questsDone reset to all-false.

### P2-presentation

#### `P2-dmd` — Dot-matrix callout band with tweened score + priority queue  _(effort M, impact 4/5)_

- **FX ref:** Lens 4 — the DMD is the entire narrative/instruction layer: 'SHOOT THE VINE!', jackpots counting UP, ball-save rings; coarse dot-grid look signals 'pinball', not a generic HUD.
- **Ours now:** HUD is plain anti-aliased text drawn top-left in render() (line 351); score snaps instantly; no callout surface, no instruction of what to shoot.
- **Build:** Reserve the top ~70px as a faux-DMD: render callout text into an offscreen canvas, sample a coarse dot grid, paint lit cells in gold (#c8a84b) on near-black. Drive it from a G.dmdQueue of {text,priority,holdMs}. Keep G.displayScore lerping toward G.score each frame so jackpots roll up. Idle >3s → attract loop (scrolling leaf glyphs). Add priority so a jackpot preempts idle score.
- **Specs:** DMD band y∈[0,70], 3px dots, gold on #0a0a0c. displayScore += (score-displayScore)*min(1,dt*8) (≈0.4s roll). Callout hold 1.5s, slide-in 100ms. Priority tiers: TILT/MULTIBALL/SUPER > quest/jackpot > combo > idle score. Same line can't refire within 2s. Keep all text ≥0.7rem-equivalent legibility.
- **Test:** Set G.score=1000000 while G.displayScore=0, step several frames → assert G.displayScore strictly increases toward 1000000 (rolls, not snaps). Push a jackpot callout while an idle-score message shows → assert the jackpot text is the active DMD string (priority preempt).

#### `P2-lightshow` — Event-synced light show (GI layer + per-insert glow + combo run)  _(effort M, impact 3/5)_

- **FX ref:** Lens 4 — coordinated flashes convert a scoring event into a whole-table reaction; jackpot white flash, multiball persistent GI pulse, a light that 'runs' the shot path you just made.
- **Ours now:** Only a single static lamp radial-gradient (render line 326) and per-bumper lit fade. No GI states, no insert language, no event choreography.
- **Build:** Add two additive layers in render() using globalCompositeOperation='lighter': (1) a global G.gi fill whose alpha spikes to 0.35 white on jackpot then decays, and holds a low mode-hued pulse during multiball; (2) per-shot glow halos driven by each shot's litTimer. Combo 'run' = spawn a bright dot traveling the last shot's path at ~600px/s. Reuse G.flash for the jackpot spike.
- **Specs:** Jackpot GI: alpha 0.35 white 1 frame → decay 0.9/frame (~250ms). Multiball GI: 0.06 alpha mode-hue pulse for the whole mode. Insert glow decay 0.9/frame. Combo run dot 600px/s along the shot path, colored to the mode hue. All keyed to a G.modeHue that shifts per active quest.
- **Test:** Trigger a jackpot via PIN_DEV.hitShot on a lit jackpot → assert G.gi alpha spikes ≥0.3 that frame then decays below 0.1 within ~0.3s. Enter multiball → assert G.gi holds a nonzero pulse for the mode duration.

#### `P2-audio` — Escalating layered audio (base / mode / multiball stems, bar-quantized)  _(effort L, impact 3/5)_

- **FX ref:** Lens 4 — music that changes state with the game; multiball music is a Pavlovian reward; stems mute/unmute on a BAR boundary (never hard-cut), duck under callouts.
- **Ours now:** FG-style one-shot synth SFX only (sfx()/beep() lines 150-161). No music, no state layers, no ducking.
- **Build:** Build a small WebAudio music bed: base loop always running; a mode stem and a multiball stem as separate looping buffer sources started in sync, each with a GainNode. Ramp mode/multiball gain 0→1 on the next bar boundary (compute from a known BPM+loopStart); tail multiball out over 1.5s on end. If full stems are too heavy for the single file, fake it: base loop + raise master playbackRate to 1.06 during multiball + add a percussion loop. Duck master -6dB for 400ms whenever sfx() fires a callout.
- **Specs:** BPM ~120, 2s bars. Mode stem gain 0→1 at next bar on quest start; multiball stem enters within 1 beat of the 2nd ball, tails out 1.5s. Tempo/key constant across states so stems stack. Callout duck -6dB, recover 400ms. Respect the Sound setting toggle (SET.sound).
- **Test:** Headless smoke: PIN_DEV.startQuest then multiball; assert no exceptions thrown and G.musicState transitions base→mode→multiball→base as flags flip (audio itself is inaudible headless; verify the state machine + gain targets, not sound).

#### `P2-combo-flow` — Combo/jackpot flow feedback (semitone ladder + floating +N + punch-scale)  _(effort S, impact 4/5)_

- **FX ref:** Lens 4 — the single highest-value, lowest-cost juice: each clean link raises chime pitch a semitone, the combo number punch-scales, a '+points' particle rises and fades. Rewards flow in real time.
- **Ours now:** onBump() plays a flat sfx and a static float(); combo count exists (G.combo) but has no escalating audio/visual reward and collapses silently.
- **Build:** In the comboManager (P1-shots-backbone) and onBump(): on each clean lit hit, play a chime at pitch base*2^(min(comboCount,12)/12) via beep() frequency, spawn a floating '+N' via float() that rises 40px/fades over 500ms, and punch-scale the DMD combo number 110%→100% over 150ms. On combo break (flipper flat / drain), play a soft de-tune.
- **Specs:** Semitone ladder capped +12 (one octave). '+N' float rise 40px, fade 500ms. Punch-scale ease-out 150ms. Break de-tune drops ~4 semitones. Reuse existing beep()/float()/burst() — no new asset weight.
- **Test:** PIN_DEV.hitShot a chain of 5 lit shots within the combo window → assert the recorded chime frequency increases monotonically per link and G.comboCount reaches 5; then wait past 2.5s and assert a break event fired and comboCount reset.

#### `P2-screen-effects` — Reserved screen shake, jackpot bloom, mode-intro card, tilt frame  _(effort S, impact 3/5)_

- **FX ref:** Lens 4 — reserve big juice for meaningful events; shake only on ramps/jackpots (never routine pegs), a bloom flash on jackpots, a short mode-intro card, red frame on tilt.
- **Ours now:** Shake exists (render line 323) but is triggered broadly; no bloom, no mode-intro card, no tilt visual. G.flash exists but is only bloom-multiball.
- **Build:** Gate G.shake so it only fires from ramp/jackpot/multiball events, not onBump pegs. Add a jackpot bloom = one full-canvas white fill at 0.25 alpha fading 200ms (extend the G.flash usage). Add a mode-intro overlay in render(): on quest start, dim playfield to 40% for ~1.2s, slide a card with quest name + one-line objective, play a 3-note sting, gate ball release until it clears. Tilt (P0) pulses the canvas border red at 3Hz.
- **Specs:** Shake amp 2-4px scaled by impact speed, decay 0.85/frame; ONLY ramp/jackpot/multiball/wizard. Jackpot bloom 0.25 alpha, 200ms. Mode-intro card ≤1.2s (never longer — keep flow), 3-note rising sting. Wizard entry adds a 0.3s time-dilation (G.slow=0.3). Tilt border 3Hz red.
- **Test:** PIN_DEV.startQuest(2) → assert G.introCard active and ball input gated for ~1.2s then released; trigger a peg hit via onBump → assert G.shake stays ~0 (no shake on routine peg); trigger a jackpot → assert G.shake>0.

### P3-meta

#### `P3-challenge-modes` — Three challenge modes on the ONE table (1-Ball / 5-Minute / Survival)  _(effort S, impact 4/5)_

- **FX ref:** Lens 5 — per-table challenge modes are how Zen gets 50-100h from one table; 5-Minute (free drains, pure aggression) is the community darling. Separate high scores each.
- **Ours now:** Three modes exist (classic/zen/daily) but they differ only in ball count; no time-attack, no survival, no separate risk calculus. PROG.best has classic/daily/zen keys only.
- **Build:** Add run-controller branches in newGame()/drainBall(): 5-Minute = G.clock=300, infinite balls, drain respawns instantly free; 1-Ball = maxBall 1, moss-net + ball-save OFF; Survival = G.saver=15, subtract 4 each drain, game over when it hits 0 on a drain. Add PROG.best keys for each. Add 4 buttons to the pre-game screen. Route all payouts through _sbCapEarn (30/day) unchanged.
- **Specs:** 5-Minute: 300s countdown in HUD, respawn 0.3s after drain, no net. 1-Ball: single ball, ball-save/net disabled, cradle skill emphasized. Survival: saver 15s start, -4s/drain, over at 0. Four localStorage best keys (gp_prog.best.{classic,fiveMin,oneBall,survival}). Sunbeam amt formula stays capped at 12/run.
- **Test:** PIN_DEV.start('fiveMin') → assert G.clock counts down and a forced drain respawns a ball with no ball loss (G.ball unchanged); start('oneBall') → assert draining once calls endRun; start('survival') → assert G.saver drops by 4 per drain.

#### `P3-mastery-objectives` — Table mastery objective checklist + Sunbeam trickle  _(effort M, impact 4/5)_

- **FX ref:** Lens 5 — deterministic, permanent objectives (trivial→brutal) onboard players and give completion dopamine independent of raw score; last 10% gated behind the wizard mode.
- **Ours now:** Only best-score + a blooms counter persist (PROG). No objective tree, no mastery %, no legible goals for newcomers.
- **Build:** Define OBJECTIVES[] of {id,label,test(G),tier}. Evaluate test() on scoring events; persist a done-set in localStorage gp_mastery (permanent, never un-earns). Render a scrollable checklist + 0-100% mastery bar on a new panel; a newly-lit objective mid-run is a dopamine beat. Award a one-time small Sunbeam trickle per tier via _sbCapEarn (respecting the 30/day cap).
- **Specs:** 20-25 objectives: e.g. 'Rip the spinner 20+ in one shot', 'Complete the Thistle bank', 'Start 3 quests in one game', 'Light Playfield 2X', 'Reach Pollen Multiball', 'Complete all 6 quests', 'Reach FULL BLOOM' (final 10%). Sunbeam trickle: 1 per bronze tier, 2 per silver, capped so a session tops out at the 30/day ceiling. Mastery bar's last 10% requires the wizard objective.
- **Test:** PIN_DEV.completeObjective('spinner20') → assert gp_mastery localStorage contains it, mastery % increased, and it does NOT re-award Sunbeams on a second completion (idempotent).

#### `P3-xp-titles` — Account XP + level + botanical titles (cosmetic meta)  _(effort S, impact 3/5)_

- **FX ref:** Lens 5 — a single XP bar filling from every action, granting a numeric level and a cosmetic TITLE; strictly non-power so it can't corrupt the score chase.
- **Ours now:** None. No account-level progression across runs.
- **Build:** Add localStorage gp_xp integer, incremented in endRun(): xp += floor(score/1000) + 50*objectivesThisRun. Level = threshold table; titles = array indexed by milestone. Show a thin XP bar + title on the title/game-over screens and a level-up toast. Purely cosmetic — never touches physics or scoring.
- **Specs:** Level L(n) needs n*2500 cumulative XP. Titles at L1 'Sprout Tilter', L5 'Seedling Flipper', L10 'Pollen Runner', L25 'Nectar Wizard', L50 'Greenhouse Keeper'. XP ≈ score/1000 + 50/objective so effort is always rewarded even on a bad run.
- **Test:** Record gp_xp, run endRun with a known score+objective count via PIN_DEV → assert gp_xp increased by exactly floor(score/1000)+50*objectives and the level/title recompute crosses the expected threshold.

#### `P3-daily-procedural` — Daily PROCEDURAL layout (make Daily genuinely different)  _(effort M, impact 4/5)_

- **FX ref:** Lens 5/6 — the seeded daily-shared table enables honest offline score comparison; today's Daily must actually LOOK and PLAY different, not just jitter the launch.
- **Ours now:** Daily seeds mkRng from the date (line 193) but the seed only affects launch jitter — Daily and Classic are the identical static playfield. The title copy 'one seeded table a day' oversells it (audit flag).
- **Build:** Move SHOTS/BUMPERS/target-bank positions and mode-multiplier assignments into a generator run from G.rng inside newGame() (the physics loops already iterate arrays, so nothing downstream changes). Perturb bumper positions, choose which orbit hosts the spinner, pick the day's featured quest and a day-goal ('score 5M in 1 ball'). Same date → identical layout for everyone; new date → new layout. Gate generated layouts through the autoPlay metrics bot so a drainy/unfair table never ships.
- **Specs:** Seed from UTC YYYYMMDD (existing). Vary: 3 bumper positions within safe boxes, spinner side (L/R orbit), 1 featured quest with ×2 value, drop-bank angle, a daily goal. Attempt cap = 3/day (localStorage gp_daily keyed by date) — the natural Sunbeam rate-limiter. Reject any generated layout whose autoPlay time-to-drain <8s median.
- **Test:** PIN_DEV.start('daily') on two mocked dates → assert the generated SHOTS/BUMPERS coordinate hash DIFFERS between dates and is IDENTICAL for the same date across two starts. Run PIN_DEV.autoPlay(60) on today's layout → assert median time-to-drain ≥8s (fairness gate).

#### `P3-ghost` — Personal-best ghost chase (offline friend-leaderboard substitute)  _(effort M, impact 3/5)_

- **FX ref:** Lens 5 — global boards feel meaningless with sparse populations; the emotionally sticky, offline-honest version is beating YOUR OWN best (a 'you beat Tuesday by 340k' beat + a translucent ghost ball).
- **Ours now:** Only a single best-score number persists; no pacing feedback, no ghost, no rival-chase feel.
- **Build:** Record a lightweight ghost of the best run (array of {t,ballX,ballY,score} sampled at 10Hz) in localStorage gp_ghost per mode. During a run, replay it as a faded translucent ball racing alongside, and show a live 'PB pace' marker + a finish banner 'beat your best by X'. No server — pure localStorage. Do NOT add a fake global board.
- **Specs:** Ghost sample 10Hz; store only if the run beats the mode best. Ghost ball drawn at 35% alpha in a cool tint. PB-pace marker = compare current score vs ghost score at matched t. Finish banner shows +/- delta vs best. Keep per-mode (classic/daily/challenge).
- **Test:** Record a ghost via a scripted PIN_DEV run, start a new run → assert G.ghost loads and its sampled positions at matched t match the stored array within tolerance; assert equipping a ghost does not alter the live ball's trajectory for the same seed.

#### `P3-cosmetics-shelf` — Cosmetic unlocks + trophy shelf (012Assets art-pack economy)  _(effort M, impact 3/5)_

- **FX ref:** Lens 5 — collectible figurines on virtual shelves + table/ball skins, all display-only; loved precisely because they're cosmetic (no pay-to-win in a skill game). No loot boxes.
- **Ours now:** No cosmetics; the ball is a fixed radial-gradient, the table a fixed backdrop, no unlockables, no shelf.
- **Build:** Add localStorage gp_cosmetics {unlocked:[], equipped:{table,ball,flipper,dmd}}. Apply equipped choices at render() (backdrop image + palette, ball sprite/gradient, flipper color, DMD hue) with procedural fallback (like the current gradient ball) so it works before art ships. Each skin references assets/greenhouse-pinball/skins/<name>/ PNGs from the 012Assets pipeline. Add a Trophy Shelf screen: grid of earned figurines with locked silhouettes. Unlocks are deterministic (mastery %, XP level, season points, specific objectives) — never random, never sold-as-power.
- **Specs:** See cosmeticsEconomy field for the full catalog & unlock map. Store & apply in render only — zero physics impact. Example gates: 'Reach FULL BLOOM' unlocks the Solstice table skin; L25 unlocks the Firefly ball; season-point tiers unlock shelf figurines. Portal art-packs (012Assets) may SELL cosmetic skin packs (known contents, cosmetic-only) — the monetization lane, no gameplay edge, no gacha.
- **Test:** Equip a table skin and a ball skin via gp_cosmetics, run the SAME seed with two different skins under PIN_DEV → assert the ball's frame-by-frame trajectory is byte-identical across skins (cosmetic-only, no physics change). Assert an unlock only fires when its deterministic gate (e.g. mastery≥threshold) is met.

## Build order (single-variable, each headlessly verifiable)

0. STEP 0 — Regression baseline: extend PIN_DEV with the accessors the whole roadmap needs (chargePlunge, nudge, hitShot, startQuest, lock, scoop, forceWizard, completeObjective, layoutHash) and add an autoPlay metrics mode that reports median time-to-drain, blooms/min, and shot distribution. Ship nothing else; verify node --check passes and autoPlay(60) returns metrics on the CURRENT table so we have a before/after yardstick.
1. STEP 1 (P0) — Charged plunger + shooter lane ONLY: add the right-edge lane to WALLS, move serveBall spawn into it, replace launch() with the charge model, relocate the growth ribbon to the left rail. No skill-shot scoring yet. Verify: chargePlunge apex monotonic in power (P0-plunger testHook).
2. STEP 2 (P0) — Skill-shot scoring on top of the plunger: add G.skillLit + the top-center lane award. Single variable added. Verify the 50,000 award and SUPER path.
3. STEP 3 (P0) — Nudge impulse + tilt meter/TILT-out, isolated. Verify single-nudge vx delta and 3-nudge tilt-out kills flippers (P0-nudge testHook).
4. STEP 4 (P0) — Flipper cradle + honest tip/base transfer: DELETE the hardcoded lv teleport-launch, add the cradle branch, retune coeffs, add EOS. Verify tip>base exit and low-speed cradle (P0-flipper testHook). This is the riskiest feel change — ship alone.
5. STEP 5 (P0) — Drain geography: split inlane/outlane WALL chains, add rolling friction. Verify outlane drains vs inlane delivers (P0-drain testHook).
6. STEP 6 (P0) — Ball-ball elastic collision. Verify head-on conserves momentum and no overlap (P0-ball-ball testHook). P0 feel layer complete — re-run autoPlay metrics and compare to STEP 0 baseline before proceeding.
7. STEP 7 (P1) — SHOTS array + lit-insert backbone + comboManager + drawInserts, with ZERO real shots wired yet (a couple of dummy standups to exercise it). Verify lampState flashing/solid/dark and combo chaining (P1-shots testHook).
8. STEP 8 (P1) — Standup B-L-O-O-M targets as the first real shots on the backbone. Verify word bitmask + Lock lit (P1-standups testHook).
9. STEP 9 (P1) — Thistle drop-target bank. Verify complete→reset→scoop lit (P1-drop-bank testHook).
10. STEP 10 (P1) — Compost scoop capture-hold-eject (mystery award only, no quests yet). Verify capture 1s + eject (P1-scoop testHook).
11. STEP 11 (P1) — Fern/Trellis/Heartvine ramps (detach-and-tween). Verify made-shot re-injects at the inlane and slow entries reject (P1-ramps testHook).
12. STEP 12 (P1) — Twin orbits + lane-change. Verify opposite-side exit + lane-change (P1-orbits testHook).
13. STEP 13 (P1) — Dandelion spinner. Verify rip score ≈ floor(v/70)*800 with decay (P1-spinner testHook).
14. STEP 14 (P1) — Top-lane S-U-N rollovers + bonus multiplier + inlane rollovers. Verify bonusMult advance/reset (P1-rollovers testHook).
15. STEP 15 (P1) — Kickback outlane save. Verify punch-up vs drain by charge state (P1-kickback testHook).
16. STEP 16 (P1) — Garden Quests state machine wired to the scoop selector (uses shots from STEPS 8-14). Verify complete-before-timer and fail-relight (P1-garden-quests testHook).
17. STEP 17 (P1) — Ball-lock Pollen Multiball with jackpot→super ladder + add-a-ball + ball-save; rename the growth event to Bloom Rush. Verify lock×3 spawns 3, super lights, drain-to-1 ends (P1-multiball testHook).
18. STEP 18 (P1) — End-of-ball bonus + bonus multiplier tally. Verify base×mult added and mult reset (P1-eob testHook).
19. STEP 19 (P1) — Playfield 2X. Verify doubled awards for 25s (P1-playfield-mult testHook).
20. STEP 20 (P1) — FULL BLOOM wizard mode gated on all 6 quests. Verify 4 balls, ends at 12 jackpots not on drain, resets checklist (P1-wizard testHook). Core game complete.
21. STEP 21 (P2) — DMD callout band + tweened score + priority queue. Verify score rolls, jackpot preempts idle (P2-dmd testHook).
22. STEP 22 (P2) — Combo flow feedback (semitone ladder + floating +N + punch-scale). Verify rising chime frequency per link (P2-combo-flow testHook).
23. STEP 23 (P2) — Light show (GI + insert glow + combo run) then layered audio then reserved screen-effects/mode-intro card, each shipped as its own single-variable step. Verify GI spike on jackpot and intro-card gates ball release (P2 testHooks).
24. STEP 24 (P3) — Challenge modes (1-Ball/5-Minute/Survival) with separate best keys. Verify each mode's run rules (P3-challenge testHook).
25. STEP 25 (P3) — Daily PROCEDURAL layout generated from G.rng, gated by the autoPlay fairness bot. Verify different-per-date, identical-per-date, and time-to-drain≥8s (P3-daily testHook).
26. STEP 26 (P3) — Mastery objectives + Sunbeam trickle, then XP/titles, then personal-best ghost, then cosmetics/trophy-shelf — each its own step. Verify persistence idempotency, XP math, ghost replay, and cosmetic byte-identical trajectory (P3 testHooks). Confirm the 30/day _sbCapEarn ceiling still holds across all new payout paths.

## Risks

- Perf regression from the SHOTS loop: at SUB=8 substeps, sweeping the ball against many ramp/orbit/target segments per substep multiplies collision cost. On a mid phone this could drop below 60fps. Mitigate: broad-phase cull by y-band, and only test shots whose bounding box is near the ball; profile with the autoPlay bot after STEP 7.
- Tunneling on ramps/orbits: the detach-and-tween trick removes the ball from normal integration, but the ENTRY/EXIT hand-off can misfire (ball injected inside a wall, or accepted at a bad angle). Keep acceptance GENEROUS (avoid FX's phantom rejects) and clamp exit positions to known-safe points; regression-test entry at many speeds/angles.
- Flipper-feel regression (STEP 4 is the scariest change): deleting the hardcoded lv teleport-launch changes the entire tactile contract. If tuned wrong the table becomes unplayable or drainy. Ship it ALONE, keep the old constants in a comment, and gate with the autoPlay time-to-drain metric vs the STEP 0 baseline before building anything on top.
- Right-rail real-estate collision: the new shooter lane takes the right rail where the growth ribbon currently draws (x=524), and the DMD band takes the top 70px where the HUD is. Both relocations must happen cleanly or elements overlap; do the ribbon move inside STEP 1 and the HUD move inside STEP 21.
- ES5 discipline: the whole roadmap must stay var/function-only, single file, no frameworks, and pass node --check before each commit — easy to slip a const/arrow in during a big state-machine build. Lint the script block every step.
- Over-juicing into noise: firing callouts/flashes/shake on every peg is the documented FX complaint. Enforce the priority queue + cooldowns + shake-reserved-for-ramps rules from day one, or multiball becomes a garbled strobe.
- Scope: 30 interlocked upgrades cannot ship blind. The single-variable buildOrder is non-negotiable — any step that bundles two systems risks the 'stray ); killed all 11,000 lines' class of failure the project has already hit.
- Daily procedural layouts can generate unfair/drainy or unwinnable tables. The autoPlay fairness gate (median time-to-drain ≥8s, blooms>0) MUST reject bad seeds before ship, or players get a broken 'today's table' with only 3 capped attempts.
- Sunbeam cap breach: every new payout path (quests, mastery trickle, wizard bonus, challenge modes) must funnel through _sbCapEarn's 30/day ceiling; a direct localStorage write or a forgotten cap check would violate the locked economy rule.
- Cosmetics leaking into physics: a skin that changes ball radius/gradient bounds or flipper geometry would corrupt the score chase and the ghost/daily comparisons. The byte-identical-trajectory test is the guardrail — treat any failure as a release blocker.
- Mobile input latency on the new gestures: nudge zones must not steal or debounce flipper taps, and flips must still fire on the instant of keydown/pointerdown (never wait for keyup). Test the three-zone nudge vs two-half flipper mapping on a real device before shipping P0-nudge.
- Art-pack dependency: skins depend on the 012Assets pipeline delivering PNGs; every skin needs the procedural fallback wired so the game is fully playable and shippable before any art exists.
