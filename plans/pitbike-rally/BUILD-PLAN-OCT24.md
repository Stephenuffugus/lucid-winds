# Pit Bike Rally build out: the plan (for Opus to build), Fable, 24 Oct 2026

Trigger: `plans/BUILD-ORDER-OCT24.md` names this file. Build the parts in order, one deploy each, nothing from
section 7 and nothing under his calls (section 8) without his word.

## 0. State block (update IN THE TURN you finish a part)

- 2026-10-24 (Fable): plan written, nothing built. Live is **v1.7** (upstream `/workspaces/skywolf-pitbike-rally`
  at `5dbb16b`, vendored as `satellites/pitbike-rally/src-5dbb16b/`, portal card `/satellites/pitbike-rally/` with no
  `?v=`; cache safety is the hashed `src-<sha>/` folder and `?v=<sha>` on css, json and images, see
  `tools/vendor_into_portal.sh` upstream). No service worker. Astra's return is a design review with no art
  (`docs/briefs/pitbike-rally/ASTRA-RETURN-PITBIKE-OCT24.md`); he agreed with every verdict on 24 Oct.

## 1. His calls (decided; plan with them)

- Every Astra verdict stands. The Trials style side view is **killed** for this build. No fees, no repair deductions,
  no wear in the standard career and time trials. The career is an honest 2 to 4 hours (44 races over six seasons).
- **Nitro must not need the gas thumb to lift** ("may need to be on the left side").
- **An analog throttle on the right thumb**: "the more you pull down the more you accelerate ... really premium feeling
  controls on such a simple game and open up a lot more avenues for us to expand."

## 2. Astra's claims checked against the source (Astra saw the live menu, never the code)

| Astra said | The code | So |
|---|---|---|
| remove career entry fees | `race.js:98` `fee = (tt || career) ? 0 : circuit.fee`: career and time trials already pay no fee; only the free race mode's Pro (300) and Ironman (800) circuits do | nothing to remove for the career; keep race mode fees (they gate nothing he cares about) |
| remove automatic repair deductions | there are none: wear accrues after EVERY race (`race.js:395 applyRaceWear`, unconditional, career and trials included) and the player repairs by hand in the garage (`shop.js`, 60 Sprockets per tier) | the real ask is: no wear accrual in career and trials (Part 0) |
| Tall Gearing requires Short Gearing | true by the ladder rule `ui.js:284`: a tier N part unlocks once a tier N-1 part in that slot is owned; Short (tier 1, top -20 accel +45) is the only tier 1 gearing, Tall (tier 2, top +45 accel -20) needs it | Astra's point stands: a behaviour choice is sold as a prerequisite (Part 5 presets) |
| brake upgrades claim a touch benefit touch cannot use | true: `input.js:64` "touch has no brake button"; `physics.js:43` brake force only when `b.brake > 0`, which touch never sets; the only touch effect of brake tiers is corner scrub `physics.js:52` | Part 1's stick gives touch a brake, which makes four parts honest |
| audit the Daily Rally generator | it exists: `race.js:52 generateDailyTrack`, a fixed virtual track index 12, a streak and titles, three laps | Part 6, deferred, as Astra ranked it |
| 22 rounds, prizes 3,000 / 6,000 / 12,000 | true: `data/seasons.json` events 6 + 8 + 8, prizes as listed, one prize per season, rival edges 0.03 / 0.035 / 0.04 | the career extension builds on this file |
| medal times should be recorded, never invented | `state.js:112 ttTargets`: per track `def.tt` is "measured per track (autopilot laps, stock and maxed bike)", generated tracks fall back to a ladder of `targetLap` multiples | keep; Part 2 re-records on the loan bike |
| records need a physics version | the save is `v: 2` (`save.js:84`) with no physics stamp on `best`, `tt`, `ghosts` | Part 0 |

## 3. The controls design (Part 1), his two notes answered together

Today: a floating steer stick on the left 46 percent (`#joy-zone`, `JOY_R` 56 px), GAS a 92 px button bottom right,
NITRO a 72 px button straight above it, no touch brake. The physics already takes a throttle from 0 to 1
(`input.js:94` sends 0 or 1; `physics.js:39` `target = throttle * top * envMul`; the AI riders use partial throttle at
`physics.js:194`), so an analog thumb plugs in with one line changed in `applyPlayerInput`.

- **Right thumb, a floating stick like the left one** (the Rabbit Ronin and Bubblenaut stick: memory
  `project_floating_stick_oct23`): touch anywhere on the right 54 percent below the HUD, the stick appears under the
  thumb. **Pull down = throttle** 0 to 1: dead zone 8 px, full at 56 px, `t = ((d-8)/48)^1.2` so the first centimetre
  is gentle. **Push up = brake** 0 to 1 on the same scale, held 120 ms or more (a brake the touch game never had, and
  the thing that makes the brake tiers honest). Release = coast (Astra's N05 "useful coasting" is the throttle between
  0 and 1 plus the existing `physics.js:44` coast decay).
- **Nitro without lifting, two ways, both on by default:** (a) **flick**: the right thumb moves UP faster than
  600 px/s over 80 ms and the move ends within 150 ms: nitro fires, the throttle is restored to where the thumb settles,
  and a flick never brakes (the brake needs the 120 ms hold); (b) **his left button**: a 56 px NITRO button top left,
  above the steer zone (the steer zone starts 72 px lower so the stick never spawns under it), for the steering thumb on
  a straight. Both call the one `fireNitro`.
- **Settings:** Classic (the old GAS button and the right side NITRO) stays as a choice; Analog is the default for new
  saves; an existing save keeps Classic until it opens settings once (a one time card: "Try the new throttle").
- **Records are comparable:** full pull is throttle 1, exactly what GAS sent, and the brake has existed on keyboard; no
  physics constant changes, so `physV` stays 1 in Part 0's stamp. If a later part changes a constant, bump it there.
- **Gate (the law: never prove a control with `el.click()`):** a puppeteer script in `tools/pitbike-tests/` drives the
  stick with real touch events (CDP `Input.dispatchTouchEvent`, 412 x 915, DPR 2): a pull of 20 px reads `p.throttle`
  between 0.15 and 0.35; 56 px reads 1; a push up held 200 ms reads `p.brake` above 0.5 and fires no nitro; a flick
  fires nitro once and leaves `p.brake` 0 and the throttle where it was; the left button fires nitro while the right
  thumb keeps the throttle at 1 (two touches at once); lifting both reads throttle 0. Each watched red on a copy with
  the rule removed. Thumb shots: a drawn thumb on the stick at 412 wide and at 360 wide (memory
  `feedback_thumb_units_and_thumb_shots`); every control 48 CSS px after layout.

## 4. The parts, in order (each one deploy)

### Part 0. Foundations: protected earnings and versioned records (Astra N08, C03 "versioned records")
- No wear accrual in career and time trials: `applyRaceWear` runs only for the free race mode. Repair stays in the
  garage for that mode. No new fees anywhere.
- Save v2 to v3: `physV: 1` on the save and on every record written from now (`best`, `tt`, `ghosts` entries carry
  `pv`); old entries are read as pv 1. Migration keeps every owned part, colour, medal, trophy, ghost, wallet and
  streak byte for byte (gate: a fixture save from v1.7 migrates and every field round trips).
- Gate: a vm harness over `race.js` finish: a career race and a trial leave `G.wear` unchanged, a race mode race
  changes it; red with the guard removed. Look: the garage after a career race shows no new wear.

### Part 1. Controls (section 3). The biggest change; ship it alone.

### Part 2. Loan bikes and spec time trials (Astra N07, C03)
- A **Spec** time trial per track and variant on a fixed loan bike (stock parts, `physV` stamped, no wear, no pickups,
  no nitro), its own records (`G.tt[key].spec`), medals bronze to platinum from laps RECORDED on that bike (an autopilot
  lap and the Part 1 stick driven by the gate, never invented; `def.tt` re-recorded for the loan bike, the old garage
  medals kept under their own key). Ship the 12 Classic tracks first; the 48 variants come when each variant has a
  recorded lap.
- Retry restores the start under one second (measure it in the gate: the time from the restart tap to the first
  movement frame).
- Gate: the recorded targets exist for 12 tracks; a lap slower than bronze earns nothing; a platinum lap earns all four;
  the garage bike's records never move during a spec trial. Look: the trial result card at 412.

### Part 3. The career extension (Astra Part C: Spec Cup, Line Masters, Wolf Cup)
- Three seasons added to `data/seasons.json` with Astra's event tables (C = Classic, M = Mirror, R = Reverse,
  MR = both; Spec Cup on loan bikes, no nitro, no wear; Line Masters with one optional clean line contract each; Wolf
  Cup a fixed expert field). Substitute a validated variant where a ramp or crossing fails reverse testing (the gate
  drives every event with the autopilot in its variant and all four riders must finish).
- Scoring 10, 7, 5, 3; ties by wins then the final round; save after every result; restart before a result commits,
  never after. Completion opens the next season, first place earns the trophy; each listed prize splits 50 percent on
  completion and 50 percent on a first championship, paid once per season id. Resume Season on the menu.
- Rival pace frozen per season; a difficulty choice between seasons. Existing medals and the old medal gates stay
  valid ("Preserve all older unlocks").
- Gate: a scripted run of all 44 rounds in a vm (autopilot) pays each reward exactly once, including a run interrupted
  and resumed mid season; red with the once-per-id guard removed. Look: the standings card and the season select.

### Part 4. Track mastery cards (Astra C09)
- One card per track: a star for Classic race gold + the track special + silver spec trial (separate runs allowed); a
  crown for race gold on all four variants + a Classic platinum time. Show the next unfinished requirement, personal
  best and the compatible ghost. Laps driven is a statistic only. Crowns gated on variant QA (Part 3's reverse testing).
- Gate: a fixture save with the three requirements earns the star, with two it does not; objectives are versioned by
  `physV`. Look: the card at 412 and 360.

### Part 5. Presentation and presets (Astra N11, N12, C05)
- One clear next ride on the menu: Resume Season, the nearest mastery goal, Today's Ride; missed dailies in a local
  archive; participation milestones instead of broken streaks.
- Readable feedback: rider colours paired with numbers, hazards with patterns, the largest lost sector after a trial
  (compatible laps only, by `physV` and spec).
- Free setup presets: gearing Balanced, Punch, Flow; suspension Balanced, Plush, Firm; one tap reset; one setup saved
  per track; never required to finish Rookie Cup; the purchased tiers stay quality, the preset chooses behaviour; Tall
  Gearing no longer needs Short Gearing (the ladder rule skips the gears slot).
- Gate: the presets each win on one representative track in the autopilot (two setups, two tracks, each wins its own);
  the next ride card names a real unfinished goal. Look: the menu at 412 with a season in progress.

### Part 6 and beyond (deferred by Astra, kept deferred): the Daily generator audit (C01), crashes as scrubs (C04),
three distinct new tracks (C06), local ghost files (C07), cosmetic reputation (C08), comeback sprints (N01), rival
identities (N02), risk lines (N03), corner school (N04), nitro windows (N06), challenge cards (N09), pass the phone
(N10). Each is its own part when he asks.

## 5. Deploys and gates (every part)

- Work in the upstream clone `/workspaces/skywolf-pitbike-rally` (commit there, push with the gho token recipe in memory
  `project_oct22_brother_visit_next_moves`), bump the version in `CHANGELOG.md` and the title, then vendor:
  `tools/vendor_into_portal.sh` writes `satellites/pitbike-rally/` with a fresh `src-<sha>/` and `?v=<sha>` stamps;
  restore the previous `src-<old sha>/` folders from git so pages a phone cached keep working (as the v1.6 and v1.7
  commits did).
- Deploy to main files only: memory `scripts/files-only-deploy-pitbike.sh` (the Pit Bike paths; read it first), never
  the branch. Merge main back. Probe one served file at a time with `?probe=$RANDOM` on both origins; byte compare
  with main; a phone must close the tab once.
- Gates live in `tools/pitbike-tests/` in this repo (new): a vm harness that pulls the real modules (the e2 pattern from
  `tools/slice-3d-tests/e2/world.js`) for economy and career, puppeteer with real touch events for controls, one browser
  at a time. Every new check watched red on a copy with its rule removed. Looks at 412 x 915 DPR 2 and 360 wide, with
  a drawn thumb on any control shot.
- Laws: ES modules are fine here (this game is modules, not the single file ES5 games), but no framework, no new server
  dependency, 48 px targets after layout, text 0.7 rem or more, no dashes or exclamation marks in player copy, "Sky
  Wolf Studio" singular, Sprockets earned only.

## 6. Reporting
Lead with what is live and the proof. One paragraph per part. Three things seen wrong in the shots before he finds
them. His words on the board verbatim. The state block above updated in the turn a part ships.

## 7. Do not touch
Saves (`save.js` keys; migrations only add), earned Sprockets, owned parts, medals, trophies, ghosts, streaks; the
physics constants in `physics.js` except the throttle plumbing named in section 3; the AI riders' skill; the track
data; the Sunbeam cap and `earnSunbeams`; `music-unlocks.js`, `arcade-exit.js`, `feedback.js`, `scripts/`, `CLAUDE.md`.
The Trials side view: not a prototype, not a branch, nothing.

## 8. His calls (not built unasked)
- The second ruleset tour and a difficulty choice between seasons: the choices offered (Astra: freeze pace per season).
- Prices for later cups after the net earnings audit (Part 3 reports the numbers).
- Whether the free race mode keeps its circuit fees (Astra silent; today Pro 300, Ironman 800).
- Everything in Part 6 and beyond.
