# DEWBALL: Astra's review merged into the plan (9 October 2026, 16:50 UTC)

Astra (GPT) answered the brief the same afternoon. The file is verbatim at
`docs/briefs/dewball/ASTRA-DEWBALL-REVIEW-GPT.md` (40 directions, 8 corrections). Fable read every direction
against `satellites/dewball/index.html` and the six shots. This file is the sort, the validation, and the
changes to `DEWBALL-TOP-TIER-PLAN-OCT09.md`. Where this file and the plan disagree, THIS FILE WINS; the plan's
header points here. Stephen decides the three calls at the end before Phase 2 starts.

Astra's main recommendation, in one line: prove the moment to moment experience (pickup feedback, eligibility,
a memorable opening route, a small asset and ground benchmark) BEFORE replacing 115 to 185 models. Fable agrees.
The pipeline (section 4 of the plan) stays exactly as written; what changes is what gets built first and how
big the first spend is.

---

## 1. Astra's corrections, checked against the code

| # | Astra said | Checked | Verdict |
|---|---|---|---|
| 1 | Instructions already exist on the title screen (description, controls, How to Roll) | `index.html` line 257 `How to Roll`, line 269 the controls hint | **Astra is right; the brief was wrong.** C7 extends How to Roll with a first run overlay; nothing is duplicated. |
| 2 | Toybox Peaks shows 3:20 and Starfall Bay 3:15, not 3:05 and 3:00 | `WORLDS` in code: w1 165 s, w2 200 s, w3 205 s, w4 210 s, w5 195 s, w7 300 s, w6 none | **Astra is right.** `DESIGN.md`'s table and the plan's table carried stale numbers. The code is the law; the plan's table is corrected; no clock changes. |
| 3 | The live help mentions Sunbeams; the brief said cosmetic only | `/sunbeam-sdk.js` is loaded; stars pay Sunbeams, the fleet's cross game currency, through `_sbCapEarn` (30 a day, 12 a run) | **Both true.** Sunbeams exist and stay. Nothing new is added. The brief should have said so. |
| 4 | The 1.85 m second star target in the w1 shots needs verifying | w1 `goalD:24, s2:185, s3:270`: one star at 24 cm, two at 1.85 m, three at 2.7 m, by design (the v3.6 size jump) | **Not a bug.** C1 makes the HUD say "Next star at 1.85 m" so nobody has to guess. |
| 5 | "Smaller sticks" is a simplification of the real ratio rule | the ratio ramps 0.55 to 0.72 | **Right.** C1 changes the words, never the rule. |
| 6 | A song unlock dialog (Dewy Roll) appeared on the title | `/music-unlocks.js` is the fleet's music system, loaded at boot (line 226) | **Right, and it is a FLEET file.** The fix is a Dewball side ticket (C9): keep the script, ask it to stay quiet until the first results. If the SDK cannot, the ticket says so and stops; `music-unlocks.js` itself is not edited here. |
| 7 | The Grove shows five unknowns for each of six timed worlds; the brief said five keepsakes per world | keepsakes are defined for W1 to W5 only (comment blocks at lines 896 to 1031), 25 in all, none for w7 or w6 | **Right.** 25, not 35. If the Grove draws five empty slots for The Whole World that is a small display fault; verify and fix in C5. |
| 8 | Feel and performance unverified (no WebGL in the review browser) | | **Right.** The plan's Pixel 9 probes and the device gate stand. |

---

## 2. The 40 directions, sorted (FAULT = build it; TASTE = his call; HAVE = exists, keep or polish; NO = against a law or the code)

### A. Gameplay feel
| id | verdict | checked against the code | where it lands |
|---|---|---|---|
| A1 pickup fly in, 3 percent squash, plink, recent pickups readable | FAULT | `attachVisual` places the mesh at once; 110 visible attachments already kept (`MAX_ATTACH_VIS`); no tween, no squash | FIRST SLICE |
| A2 eligibility rings, "Grow a little more" on a deliberate bump | FAULT | only the threat marker exists (unpickable MOVERS); nothing marks what you CAN eat | FIRST SLICE |
| A3 the w1 opening route (crumbs, a food cluster, the pawn you come back for) | TASTE, his call 3 | scatter is seeded; a subset's positions can move with counts and sizes untouched; the bot A/B on the same seed is the gate | FIRST SLICE if he says yes |
| A4 roll streak, lean, roll sound, surface rotation from distance | FAULT | none of the four exist | Phase 5 |
| A5 camera smoothing on growth, no recentre for 1.5 s, boom before fade | VERIFY | the camera was tuned on device (readability laws); smoothing exists for look ahead; the recentre delay and boom rule need measuring, not assuming | Phase 5, only with a device test |
| A6 knockback: the three objects eject with arcs, a ground glint | FAULT (partly HAVE) | the red flinch and the three pickups returning to the ground exist; no arcs, no glint | Phase 5 |
| A7 dash button: 56 px, label, readiness ring, no cross activation with camera drag | FAULT | `#dashBtn` is a 64 px circle with a 💧 at half opacity, no label; input routing to check | FIRST SLICE (it is small and the first thing a thumb finds) |
| A8 gate opening: sink over 450 ms, sign flash, chime, "Path open", frame the prize | HAVE, polish | the fence sinks, gold flash, toast and gateSound exist; the framing and the 1.2 s "Path open" are new | Phase 5 |
| A9 chess corner domino wobble | TASTE | nothing like it exists; a set piece reaction is a new idea | Phase 5 if he wants it; one, in w1 |
| A10 creature anticipation pose, startled turn, wiggle on the ball | FAULT, after models | movers are primitives with no poses; lands with B2's creatures | Phase 4, with each world's movers |
| A11 size facts: one slot, 2.2 s, 8 s gap, "Goal reached, keep rolling" | FAULT | the 25 facts fire as toasts with no queue or gap; the first star shows no message of its own | FIRST SLICE (copy and a queue, free) |
| A12 end of run: the final ball close up, the largest pickup, the starting bead beside it | FAULT | results are a text card (size, absorbs, combo, keepsakes, Sunbeams) and three buttons | Phase 5 |

### B. Assets and art direction
| id | verdict | checked | where |
|---|---|---|---|
| B1 handmade miniature, materials distinguished, not one plastic toy | TASTE, his call 1 | the plan said "toy shop katamari"; Astra's reason (material contrast carries the scale changes) is better than mine | section 2 of the plan, if he agrees |
| B2 a 15 asset w1 benchmark chosen by time on screen and pickup frequency | FAULT, replaces the 5 prop pilot | the manifest can rank by instances and zone | FIRST SLICE (about 500 credits) |
| B3 blanket palette: dusty coral and linen instead of vivid red and cream | FAULT | w1 `ground:{c1:"#b8483e",c2:"#e2d6c0"}`, `rim:0x8a4436`, fog `0xdf9a68`; the HSL check in the plan would have flagged the ladybug | FIRST SLICE (two numbers and a look) |
| B4 landmark recognition features (horn lip and record, page blocks, clock face and pendulum) | FAULT | the three are part lists; the features can be added as parts for free before any Meshy model | FIRST SLICE |
| B5 ground palettes for all seven worlds | FAULT | the plan's 4.8 covers the plates; Astra gives the palette per world | Phase 5 |
| B6 sky dome with distant silhouettes per world | FAULT | gradient plus fog today | Phase 5 (the equirect loader in ART_ASSETS.md) |
| B7 texture restraint (spend detail on the crust, pages, weave, face, lid; keep crumbs flat) | HAVE as a rule | the plan's tier D and the atlas sizes say the same | pipeline rule, section 4.4 |
| B8 Meshy as a draft, logical size kept apart from mesh extents | HAVE | the plan's 4.1 `dewfit.py` and 4.6 "the size ladder is sacred" | pipeline rule |
| B9 rendering plan: distance LOD, shared atlases, pooled effects, Pixel 9 profiling | HAVE | the plan's 4.6 LOD and section 2 fence | pipeline rule; adopt Astra's "1024 atlases first" |
| B10 one recognisable late run meal per world, one landmark with a sound when eaten | FAULT | LANDMARKS.md measured the closing minute; the "meal" is the tier B set per world | Phase 4 per world |

### C. User interface
| id | verdict | checked | where |
|---|---|---|---|
| C1 truthful pickup language; HUD "Next star at {size}"; sizes 28 / 15 / 8 px in a 184 x 64 panel | FAULT | How to Roll says smaller sticks; the HUD shows "★★ AT 1.85 m" | FIRST SLICE |
| C2 HUD hierarchy, 22 px clock, 48 px pause, title fades after 3 s, text on a panel | FAULT (partly HAVE) | the pill and clock exist; the world title sits bottom left forever; contrast over the sky unchecked | FIRST SLICE |
| C3 world select: one primary "Play {world}", cards with stars, best size, goal; utilities moved to Settings | FAULT | the title screen is cards plus a row of equal buttons (How to Roll, sound, invert, horizon, install) | Phase 5 |
| C4 results: stars and size first, largest pickup, keepsakes found, next world primary | FAULT (partly HAVE) | the unlock banner and the Next button exist (as an "alt" button); no largest pickup | Phase 5 with A12 |
| C5 the Grove: keepsakes grouped by world, silhouettes, a clue once the world is unlocked | FAULT | question marks today; and the w7 empty slots to verify | Phase 5 |
| C6 pause: Settings inside, confirm on Restart and Back to Worlds, music and effects sliders, invert, horizon, reduced motion, sensitivity | FAULT | pause is Keep Rolling, Restart, Back to Worlds with no confirms; no reduced motion anywhere in the file; invert and horizon live on the title | Phase 5 (sliders the Petri way) |
| C7 first run overlay: "Left side to roll", "Right side to look", "Start rolling"; fades after demonstrated use | FAULT | How to Roll exists; no contextual first run | FIRST SLICE |
| C8 one notification system with a priority order | FAULT | toasts, popups and the gate sign each do their own thing | FIRST SLICE with A11 |
| C9 the song unlock dialog before the first roll | FAULT, fleet | `music-unlocks.js` is a fleet file; Dewball may only ask it to wait | Phase 5; a ticket that may stop at "the SDK cannot" |
| C10 loading and WebGL failure state ("This browser could not start the game", Try again, Back to worlds) | VERIFY | a watchdog like Tiny World's is not in this file; check what a failed context shows today | FIRST SLICE if nothing exists (it is a hole a Play reviewer can fall into) |

### D. User experience
| id | verdict | checked | where |
|---|---|---|---|
| D1 a distinct situation per world | TASTE | the worlds already differ by layout; naming each one's situation is writing, not code | Phase 4 as each world is looked at |
| D2 a next day objective ("Find the last keepsake in Crumb Country") on the title | FAULT, small | nothing on return today beyond the greeting | Phase 5 |
| D3 keepsake banking rule documented and tested | VERIFY | `R.keepsRun` is per run; when a keepsake is banked to the save (on pickup, or at results) must be read, then documented | FIRST SLICE (a read and a sentence, maybe a fix) |
| D4 portrait pause with Resume, background pause, held inputs cleared | HAVE (partly) | `visibilitychange` pauses; `isPortrait` nudges; a Resume prompt after rotation and clearing held thumbs to check | Phase 5 |
| D5 install offer after a run, not before | FAULT, small | the install button lives on the title | Phase 5 |
| D6 Dream Meadow's "no clock" said on its card, with its unlock rule | FAULT, small | the card says "endless zen" in the data; the unlock rule is one star in w7 | Phase 5 |
| D7 the store clip: bead, pawn, growth, the pawn collected | FAULT | Phase 6 | Phase 6 |
| D8 validation order: new players on a physical phone first, local event logs, matched runs | ADOPT | our testers are Stephen, Jessie and the Pioneers' families, not ten strangers; the 8 of 10 targets become "each of three people" | the gate of the FIRST SLICE |

Nothing in Astra's file contradicts a law. Nothing asks for a currency, a timer, an ad, or a tuning change.

---

## 3. What changes in the plan

### 3.1 Section 2, the bar: art direction (his call 1)
Replace "toy shop katamari: chunky, rounded, bright, saturated, soft bevels, painted textures" with Astra's
**handmade miniature**: rounded, tactile objects with broad painted colour areas and restrained material cues,
so cloth, food, painted wood, metal and water read as different things; one dominant shape, one recognition
feature and at most two accents per asset; saturation highest on what can be eaten, lower on floors and skies;
the dew bead an opaque soft highlight with a bright rim, no refraction. Fable's recommendation: take it. The
reason holds: a scale change from a crumb to a gramophone is felt through what things are made of.

### 3.2 Phase 2 becomes THE FIRST SLICE (replaces the five prop pilot; his call 2)
No credits until the free work is done and looked at. In order:
1. **C1 + A11 + C8**: truthful words ("Collect small things. Grow to collect bigger things."), the HUD "Next
   star at 1.85 m", one notification queue (pause, star, keepsake, gate, fact), facts 2.2 s with an 8 s gap,
   "Goal reached. Keep rolling for the next star." on the first star. Free.
2. **A7 + C2 + C7**: the dash button with a label and a readiness ring, routed apart from the camera drag; the
   HUD on a panel, the title fading after 3 s, a 48 px pause; the first run overlay over How to Roll. Free.
3. **A2**: eligibility rings on up to three nearest eatable things within three ball diameters, a 250 ms sparkle
   when something becomes eatable, "Grow a little more" only on a deliberate bump. The ring reads the SAME
   function the collision uses; it never says yes when the pickup says no. Free.
4. **A1**: the pickup fly in (90 to 130 ms), the 3 percent render only squash, the plink. The collision sphere
   and the growth never move; a recorded pickup sequence yields the same size with the animation on or off. Free.
5. **B3 + B4**: the blanket to dusty coral and linen (two colour numbers, then the HSL check against every red
   prop), and the three w1 landmarks given their recognition features in their part lists. Free.
6. **C10 + D3**: what a failed WebGL context shows, and when a keepsake is banked; write both down; fix what is
   wrong. Free.
7. **A3** (only with his yes on call 3): the opening route, a subset of w1's scatter moved into a loose trail
   toward the chess corner, counts and sizes untouched, `balance.js 1 12345 1 near` before and after on the
   same seed, the clear rate within ten percent or it comes out.
8. **B2, the benchmark** (about 500 credits): fifteen w1 kinds ranked by the manifest's time on screen and pickup
   frequency plus emotional weight: crumb, biscuit, sandwich, cupcake, ladybug, pawn, candle, basket, biscuit
   tin, folding chair, one book unit, gramophone, long case clock, one keepsake, one late run prop; substituted
   from the real inventory. Both Meshy model types on the first three, then the better one for the rest.
   Fitted, packed, loaded through the Phase 1 path, shot beside the primitives at the three sizes a player
   passes through, at 412x915 and 360x740, worst angle included.
9. **The gate (D8)**: Stephen, Jessie and one more person play the first ninety seconds of Crumb Country on a
   phone. Each must: collect something within five seconds, say which object went from wall to pickup, use
   dash on purpose, and name their largest pickup after results. Perf probe on w7 against the Phase 0 baseline.
   Then STOP: the before and after pairs, the bot numbers, the three people's answers, and the balance after.

Phase 3 onward stays as written (world 1 complete, then one world at a time), using the recipe the benchmark
proved. Phase 5 absorbs A4, A5 (device measured), A6, A8, A9 (if wanted), A12, B5, B6, C3, C4, C5, C6, C9, D2,
D4, D5, D6. Phase 6 adds D7.

### 3.3 Corrections to the plan's facts
- Section 1 table, clocks: w2 Toybox Peaks 3:20, w5 Starfall Bay 3:15 (the code; `DESIGN.md`'s table is stale).
- Section 1: "What the Director has said" stands; add: the title screen carries a description, the controls and
  How to Roll; Sunbeams are the fleet currency and stars pay them; keepsakes are 25 across W1 to W5.
- Section 6.1: "A directions card BEFORE the first world" becomes C7, an overlay that extends How to Roll.
- Section 6.3: pause gets Settings with the sliders, invert, horizon, reduced motion, sensitivity, and confirms.
- New everywhere: **reduced motion** is a setting from the first slice on; A1, A4, A6 and the camera shake
  respect it. The file has no reduced motion today.

### 3.4 Budget arithmetic after the merge
First slice: about 500 credits (the benchmark) against 4,120. World 1 complete after it: about 400 more (the
rest of tier A and B for w1, reusing the benchmark's fifteen). Worlds 2 to 7 as the plan said. The month still
covers about 115 kinds; the benchmark is inside that, not on top.

---

## 4. HIS CALLS BEFORE PHASE 2 (the plan proceeds under the first option until he says otherwise)

1. **Art direction:** Astra's handmade miniature with material cues (Fable's recommendation), or the plan's toy
   shop. (Default now: handmade miniature.)
2. **The first slice replaces the five prop pilot:** the free feel and readability work first, then a fifteen
   asset benchmark, then the stop. (Default now: yes.)
3. **The w1 opening route (A3):** move a subset of scattered pickups into a trail toward the chess corner,
   with the bot A/B as the fence. This touches placement, which the plan called untouchable. (Default: NOT
   done until he says yes.)

The other three calls in the plan's section 10 (price, orientation, credits floor, next world) stand.

---

## 5. Addendum, 17:00 UTC: facts measured by Opus in Phase 0 (satellites/dewball/FORGE.md), adopted

- **286 kinds declared, 282 placed** (the plan's 195 and 185 came from one regex; the manifest is the count).
- **Meshy prices as paid today: 30 credits a kind standard (20 preview + 10 refine), 15 smart topology (5 + 10).**
  The fifteen kind benchmark is therefore about 225 to 450 credits, not 500. The pilot stopped at 45 spent
  (balance 4,075; the cakestand standard done, its smart topology refine paid and resumable from the ledger).
- **18 of 21 movers are built long on x but travel along +z**: cars, the bus, camels and cows move sideways today.
  A real fault, free to fix in the part lists or the travel axis. It joins the first slice as step 5b, before any
  mover is modelled (B2's creatures inherit the right axis).
- **w7's per frame JS already sits at the 12 ms line at 4x throttle.** The fence in section 2 of the plan is not
  headroom, it is the ceiling: the two set LOD (plan 4.6) is mandatory before any world's batch, and the benchmark's
  perf probe compares against this number, not a guess.
- Opus confirms the order: 1 (C1+A11+C8), 2 (A7+C2+C7, reduced motion lands here), 3 (A2), 4 (A1), 5 (B3+B4, 5b the
  mover axis), 6 (C10+D3), then the fifteen kind benchmark in handmade miniature, then the three person gate, STOP.
  A3 waits for Stephen.
