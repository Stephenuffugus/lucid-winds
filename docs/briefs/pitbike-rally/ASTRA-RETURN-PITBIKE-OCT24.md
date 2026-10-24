<!-- Astra's return to docs/briefs/pitbike-rally/ASTRA-PITBIKE-REPLAY-OCT22.html, received 24 Oct 2026 from Stephen as Pit_Bike_Rally_Build_Out.docx (48 KB, no images, no assets: "No generated assets are required by this handoff"). Text extracted verbatim; headings marked. -->
Pit Bike Rally Build Out
# Part A Candidate verdicts
Recommendation: finish and connect the existing top down systems first. Use seasons to give races meaning, fair time trials to reward skill, and mastery to make improvement visible. Treat procedural generation as a quality problem, and keep side view physics outside this release.
Review basis: the supplied October 22 handoff and a live menu inspection on October 23 at https://lucidwinds.com/satellites/pitbike-rally/. The live UI already exposes Rookie Cup, Pro Tour, Ironman Series, Dusty, Rico, Mags, time trials and Daily Rally. Starting Rookie Cup displayed standings and round 1. This supersedes the handoff only for those visible features; race behavior, source code, generator quality and phone performance were not verified.
## 1 Seeded procedural stages
CHANGE  The live Daily Rally already advertises a shared daily track and a streak. Audit that implementation before building another generator. For release, use curated seeds or a rotation of validated layouts; a seed does not guarantee a good race. Validate road width, curvature, connected zones, ramp landings, checkpoints and crossings in every supported direction. Require all four AI riders to finish repeated runs. Ship a fixed fallback on failure. AI times are starting estimates, not medal calibration. Keep the daily playable offline; defer weekly online rankings until the service scope includes retrieval and score validation.
## 2 Career seasons
KEEP  Build on the three visible seasons and named rivals. The live menu has 6, 8 and 8 rounds with listed prizes of 3000, 6000 and 12000 Sprockets. Preserve their identities and saves. Add resume, clear standings, optional contracts and a second ruleset tour. Freeze opponent pace for each season; offer difficulty selection between seasons instead of secretly matching every improvement. Completion opens the next season, while winning awards its trophy. Replaying should teach better lines, not repeatedly block content. Distinguish a first completion reward from a champion bonus so neither can be farmed.
## 3 Time trials and target times
KEEP  Time trial buttons and lap targets already exist. Verify invalid lap detection, restarts and record compatibility before expanding the mode. Ship 12 Classic tracks first, then all 48 layouts after calibration. Use a fixed loan bike, fixed setup, no wear and no random pickups for comparable medals; retain personal garage records separately. Store times by track, variant, rules and physics version. Use recorded developer laps and novice playtests to set bronze through platinum, never invented times. A retry should restore the start in under one second on the target phone, with a consistent timing gate and an optional ghost.
## 4 Crashes
CHANGE  Do not make every wall brush or imperfect landing cost two seconds. At the stated race length that can erase a run, particularly with no touch brake. Begin with readable scrubs and speed loss; reserve a tumble for severe impacts in optional expert events. Define landing error from the bike heading versus its travel direction, with a forgiving window calibrated on touch. Recovery must return the rider to a safe legal checkpoint without gaining distance, then briefly prevent another collision. No added wear penalty during testing. Existing tumble frames justify a prototype, not a release commitment.
# Candidate verdicts continued
## 5 Track specific tuning
CHANGE  Use free presets first: Balanced, Punch and Flow for gearing; Balanced, Plush and Firm for suspension. Show the actual tradeoff, retain a one tap reset and save one setup per track. Do not make sliders stronger than every purchased part or let Tall Gearing be a universal upgrade over Short Gearing, which is currently shown as a prerequisite. Purchased tiers should improve component quality; setup chooses behavior. Fixed spec time trials lock both parts and tuning. Prove that two setups each win on different representative tracks before exposing advanced sliders. Never require tuning to finish Rookie Cup.
## 6 Twelve more tracks plus night and rain
CHANGE  Do not double the track list before existing races feel different. Prototype three showcase layouts: a rhythm course using whoops, a hardpack course with bermed corners, and a shallow water course with a visible safe route. Build one at a time after the core release and verify AI navigation, reverse traversal and touch readability. Rain should change a disclosed grip rule, never randomly punish a run. Night should be a readable visual treatment first, with bright road edges and unobscured hazards. Neither weather nor darkness counts as a new track. No new art batch is justified until each zone has a tested gameplay use.
## 7 Shareable ghosts
CHANGE  Keep local ghosts at release. Uploading a ghost and retrieving it by a short code needs storage and reads, beyond a literal leaderboard write exception. Under the current server constraint, add an explicit local file export and import later, with a versioned, size limited, validated schema. Store sampled positions for visual playback; an input replay needs verified deterministic simulation across devices. A ghost is noncolliding and never proof that a submitted time is legitimate. Embed track, variant, bike rules and physics version, and explain incompatible files. Defer hosted codes until backend scope, abuse handling and ongoing cost are approved.
## 8 Rider progression
CHANGE  Use rider reputation for helmets, plates, titles and garage trophies. Do not lock handling, recovery or essential scoring behind experience levels. Earn progress from first completions and distinct challenges, with small repeat rewards, so a short oval is not the best way to unlock everything. Avoid a second large grind layered on 52 parts. Whips and wheelies can be automatic visual flourishes for already supported actions; extra trick gestures compete with steering, gas and nitro. Add manual tricks only if a touch prototype proves they are readable, intentional and fun. Cosmetic rewards stay available without streaks or real money.
## 9 Track mastery
KEEP  Create one card for each of the 12 tracks. A mastery star requires a Classic race gold, the track special and a silver spec time trial; these can be completed in separate runs. An optional crown requires race gold on all four variants and a Classic platinum time. Show the next unfinished requirement, personal best and compatible ghost. Laps driven are a statistic, not a requirement. Do not require 48 variants to open the career finale. Gate crowns on variant QA and time calibration, and revalidate or version objectives when physics changes. Never erase a previously earned cosmetic reward after a patch.
## 10 Trials style side view mode
KILL FOR THIS BUILD  A side view mode would require a second driving model, course vocabulary, control layout and balancing effort. It risks feeling like an unfinished separate game inside this one. If pursued, make a separate Pit Bike Rally branded prototype with its own progression. Minimum feel: stable wheel contacts, damped suspension, convincing traction and torque, useful rider lean, predictable airborne rotation, fair failure detection and instant checkpoint retries on touch. Tune several short obstacles until failures are clearly attributable to input. Share visual branding and menu art, not garage statistics or promises of Trials level physics. A successful prototype should earn a separate project decision.
# Part B Additional directions
Replay estimates below are design hypotheses for interested players, not measured retention. They overlap and must not be added together. A session means roughly 5 to 15 minutes unless specified. S is localized work, M spans several systems, L adds a subsystem or substantial content QA. Priority 1 is release scope, 2 is a follow up, 3 is deferred.
## Structure and career
### 11 Comeback sprints
What and why: Start fourth with one lap remaining and three readable gaps to close. Curate starts on existing tracks so overtaking, not upgrades, decides the challenge.
What it adds to replay: 6 to 10 sessionsEffort: MPriority: 2
### 12 Rivals with driving identities
What and why: Give Dusty strong starts, Rico clean exits and Mags patient passing. Use visible habits and shared physics; never hidden speed boosts or midrace difficulty changes.
What it adds to replay: 6 to 12 sessions within careerEffort: MPriority: 2
## Tracks and content
### 13 Risk and reward racing lines
What and why: Add one marked optional line to three existing tracks. Make the longer route safer and the short route demand precision; validate both routes and checkpoints.
What it adds to replay: 6 to 9 sessionsEffort: MPriority: 2
### 14 Corner school
What and why: Practice three troublesome corners with a fixed bike, entry speed and exit gate. Reset locally and compare exit speed with your best attempt.
What it adds to replay: 5 to 10 practice sessionsEffort: MPriority: 2
# Additional directions continued
## Driving feel
### 15 Useful coasting
What and why: Tune throttle release to settle the bike predictably before corners. Make brake upgrades affect coast deceleration on touch, or remove their claimed touch benefit.
What it adds to replay: 3 to 6 practice sessionsEffort: MPriority: 1
### 16 Nitro windows
What and why: Reward clean exits with effective boost, while boosting through a tight turn widens the line predictably. Explain the tradeoff in one optional practice challenge.
What it adds to replay: 4 to 8 practice sessionsEffort: MPriority: 2
## Garage and economy
### 17 Free competitive loan bikes
What and why: Provide fixed loan bikes for medal trials and selected career cups. Make skill challenges immediately comparable regardless of wallet, wear or parts owned.
What it adds to replay: 10 to 20 sessions alongside trialsEffort: SPriority: 1
### 18 Protected race earnings
What and why: Remove career entry fees and automatic repair deductions. Disable wear in standard career and trials; reserve finite service budgets for optional endurance events.
What it adds to replay: No extra hours; removes replay frictionEffort: MPriority: 1
# Additional directions continued
## Social
### 19 Portable challenge cards
What and why: Export a short text code containing a validated track, variant, rules and target. Friends enter it locally; label results as unverified, with no ghost or server.
What it adds to replay: 2 to 5 sessions per shared challengeEffort: SPriority: 2
### 20 Pass the phone cup
What and why: Let up to four local players take turns on one fixed bike and compare valid laps. Keep standings local and give each rider a practice attempt.
What it adds to replay: 15 to 30 minutes per gatheringEffort: MPriority: 3
## Presentation
### 21 One clear next ride
What and why: Show Resume Season, a near complete mastery goal and Today's Ride. Keep missed daily challenges in a local archive; replace broken streaks with total participation milestones.
What it adds to replay: 3 to 5 short return sessions per weekEffort: SPriority: 1
### 22 Readable racing feedback
What and why: Pair rider colors with numbers, hazards with patterns and objectives with icons plus text. Show the largest lost sector after trials, using only compatible comparison laps.
What it adds to replay: No extra hours; supports confident retriesEffort: MPriority: 1
## Release boundary
First stabilize controls, legal laps, save migration and versioned records. Then finish the existing 22 career rounds, spec trials, mastery and the next ride screen. Add the second tour only after the first tour passes playtests. Defer new track art, online ghosts, unrestricted generation, manual tricks, weather physics and side view. No generated assets are required by this handoff.
Acceptance: retain one page of vanilla JavaScript and 2D canvas, with no frameworks or new server dependency. Test at 915 x 412 with every touch target at least 48 CSS px and no text below 0.7 rem; prefer 1 rem for essential copy. Use no dash characters in player copy. Preserve four bike 60 fps on a named midrange Android test phone with bounded particles and cached track drawing. Confirm phone interruption and reload resume the last committed round without duplicate rewards. No in game purchases; Sprockets remain earned only.
# Part C Proposed career structure
44 scored races in six seasons: retain the visible 22 round first tour, then add 22 expert rounds. Every race lasts about 1 to 3 minutes. This is 44 to 132 minutes of racing without retries, so the career alone is not a credible 20 hour promise. Target 2 to 4 hours with menus, practice and retries; optional mastery and time trials must earn the longer tail.
Season and rounds
Proposed event order
Unlock and pursuit
Rookie Cup6 rounds
Oval C, Hairpin C, Peanut C, Snake C, Oval R, Peanut M. Dusty; normal rules.
Open immediately. Finish to open Pro Tour.
Pro Tour8 rounds
Stadium C, Mud C, Ridge C, Ironman C, Stadium M, Mud R, Ridge M, Ironman R. Rico.
Finish Rookie Cup. Finish to open Ironman Series.
Ironman Series8 rounds
Crossover C, Rallycross C, Sandstorm C, Crossover M, Rallycross R, Sandstorm R, Ironman MR, Den C. Mags.
Finish Pro Tour. Finish to open Spec Cup.
Spec Cup6 rounds
Oval C, Hairpin R, Peanut M, Snake C, Stadium R, Mud C. Identical loan bikes; no nitro or wear.
Finish Ironman Series. Finish to open Line Masters.
Line Masters8 rounds
Ridge R, Ironman M, Crossover R, Rallycross M, Sandstorm M, Snake R, Stadium MR, Den R. One optional clean line contract each.
Finish Spec Cup. Finish to open Wolf Cup.
Wolf Cup8 rounds
Mud MR, Ridge MR, Ironman MR, Crossover MR, Rallycross MR, Sandstorm MR, Den M, Den MR. Fixed expert field; no forced crashes or wear.
Finish Line Masters. Trophy for champion; no prestige reset.
C = Classic; M = Mirror; R = Reverse; MR = Mirror plus Reverse. Short track names refer to the 12 tracks in the handoff. Orders above are proposals, not verified live schedules. Substitute a validated variant if a ramp or crossing fails reverse testing. No new tracks required.
Scoring and saves: 10, 7, 5, 3 points; ties resolve by wins, then final round finish. Save after each result. Practice is always free; restart before result commitment, never reroll a paid result. Completion unlocks seasons; trophies require first overall. Existing medals still count and race mode circuit access opens by either its old medal gate or the new season gate. Preserve all older unlocks.
Economy: standard career has no fees or wear. Keep base placement earnings initially; pay each medal, contract and season reward once per ID. Exclude career from daily multipliers. Split each existing listed season prize into 50 percent completion and 50 percent first championship, awarding both on a first winning finish. Audit net earnings before pricing later cups; test upgrades every 2 to 4 early races without requiring them.
Hour 1: beat Dusty, choose a useful part, set a first spec time. Hour 5: pursue an expert cup trophy and three mastery stars. Hour 20: optional crowns, platinum times and archived challenges for committed players. Day 2 offers a resumable season; day 10 offers mastery and rivals; day 30 offers skill goals and curated daily rides, without missed day penalties.
Validation: run fresh save, veteran save and zero wallet playthroughs. Ask testers to return voluntarily after 1, 3 and 7 days; record completed sessions and reasons for stopping with consent. Do not market 20 hours or 30 day retention until observed.
# Implementation backlog JSON
All ten candidate decisions and twelve additional directions. Candidate entries encode the verdict in summary. Replay values overlap; priority applies to the revised scope, including a decision to defer or exclude.
```json
[
  {
    "id": "C01",
    "title": "Seeded procedural stages",
    "group": "Tracks and content",
    "effort": "L",
    "priority": 2,
    "replay": "3 to 5 short sessions per week",
    "summary": "CHANGE: Audit the visible Daily Rally; ship validated layouts and a fallback. Defer unrestricted generation and online rankings."
  },
  {
    "id": "C02",
    "title": "Career seasons",
    "group": "Structure and career",
    "effort": "M",
    "priority": 1,
    "replay": "12 to 24 sessions across the proposed career",
    "summary": "KEEP: Extend the existing seasons and rivals; persist rounds and separate completion from championship rewards."
  },
  {
    "id": "C03",
    "title": "Time trials and target times",
    "group": "Driving feel",
    "effort": "M",
    "priority": 1,
    "replay": "15 to 40 practice sessions for interested players",
    "summary": "KEEP: Complete fair spec bike time trials, calibrated medals, valid laps and fast retries."
  },
  {
    "id": "C04",
    "title": "Crashes",
    "group": "Driving feel",
    "effort": "M",
    "priority": 2,
    "replay": "No guaranteed hours; improves repeat attempts if fair",
    "summary": "CHANGE: Prototype forgiving scrubs first; gate severe tumbles behind optional expert rules."
  },
  {
    "id": "C05",
    "title": "Track specific tuning",
    "group": "Garage and economy",
    "effort": "M",
    "priority": 2,
    "replay": "4 to 8 experimentation sessions",
    "summary": "CHANGE: Offer free presets with real tradeoffs; keep quality upgrades and setup choices distinct."
  },
  {
    "id": "C06",
    "title": "Twelve more tracks plus night and rain",
    "group": "Tracks and content",
    "effort": "L",
    "priority": 3,
    "replay": "6 to 12 sessions for three distinct additions",
    "summary": "CHANGE: Prototype three mechanically distinct tracks after launch; defer twelve tracks and reduced visibility."
  },
  {
    "id": "C07",
    "title": "Shareable ghosts",
    "group": "Social",
    "effort": "M",
    "priority": 3,
    "replay": "2 to 6 sessions per shared challenge",
    "summary": "CHANGE: Keep local ghosts; use validated local files if sharing is added. Hosted short codes need broader backend scope."
  },
  {
    "id": "C08",
    "title": "Rider progression",
    "group": "Garage and economy",
    "effort": "S",
    "priority": 2,
    "replay": "6 to 15 sessions alongside other goals",
    "summary": "CHANGE: Use cosmetic reputation, not skill unlocks or another mandatory grind."
  },
  {
    "id": "C09",
    "title": "Track mastery",
    "group": "Structure and career",
    "effort": "S",
    "priority": 1,
    "replay": "12 to 30 focused mastery sessions",
    "summary": "KEEP: Ship 12 readable mastery cards; reserve full variant completion for optional crowns."
  },
  {
    "id": "C10",
    "title": "Trials style side view mode",
    "group": "Driving feel",
    "effort": "L",
    "priority": 3,
    "replay": "0 hours in this release",
    "summary": "KILL FOR THIS BUILD: Exclude side view from this build; consider a separate branded game only after a convincing physics prototype."
  },
  {
    "id": "N01",
    "title": "Comeback sprints",
    "group": "Structure and career",
    "effort": "M",
    "priority": 2,
    "replay": "6 to 10 sessions",
    "summary": "Start fourth with one lap remaining and three readable gaps to close. Curate starts on existing tracks so overtaking, not upgrades, decides the challenge."
  },
  {
    "id": "N02",
    "title": "Rivals with driving identities",
    "group": "Structure and career",
    "effort": "M",
    "priority": 2,
    "replay": "6 to 12 sessions within career",
    "summary": "Give Dusty strong starts, Rico clean exits and Mags patient passing. Use visible habits and shared physics; never hidden speed boosts or midrace difficulty changes."
  },
  {
    "id": "N03",
    "title": "Risk and reward racing lines",
    "group": "Tracks and content",
    "effort": "M",
    "priority": 2,
    "replay": "6 to 9 sessions",
    "summary": "Add one marked optional line to three existing tracks. Make the longer route safer and the short route demand precision; validate both routes and checkpoints."
  },
  {
    "id": "N04",
    "title": "Corner school",
    "group": "Tracks and content",
    "effort": "M",
    "priority": 2,
    "replay": "5 to 10 practice sessions",
    "summary": "Practice three troublesome corners with a fixed bike, entry speed and exit gate. Reset locally and compare exit speed with your best attempt."
  },
  {
    "id": "N05",
    "title": "Useful coasting",
    "group": "Driving feel",
    "effort": "M",
    "priority": 1,
    "replay": "3 to 6 practice sessions",
    "summary": "Tune throttle release to settle the bike predictably before corners. Make brake upgrades affect coast deceleration on touch, or remove their claimed touch benefit."
  },
  {
    "id": "N06",
    "title": "Nitro windows",
    "group": "Driving feel",
    "effort": "M",
    "priority": 2,
    "replay": "4 to 8 practice sessions",
    "summary": "Reward clean exits with effective boost, while boosting through a tight turn widens the line predictably. Explain the tradeoff in one optional practice challenge."
  },
  {
    "id": "N07",
    "title": "Free competitive loan bikes",
    "group": "Garage and economy",
    "effort": "S",
    "priority": 1,
    "replay": "10 to 20 sessions alongside trials",
    "summary": "Provide fixed loan bikes for medal trials and selected career cups. Make skill challenges immediately comparable regardless of wallet, wear or parts owned."
  },
  {
    "id": "N08",
    "title": "Protected race earnings",
    "group": "Garage and economy",
    "effort": "M",
    "priority": 1,
    "replay": "No extra hours; removes replay friction",
    "summary": "Remove career entry fees and automatic repair deductions. Disable wear in standard career and trials; reserve finite service budgets for optional endurance events."
  },
  {
    "id": "N09",
    "title": "Portable challenge cards",
    "group": "Social",
    "effort": "S",
    "priority": 2,
    "replay": "2 to 5 sessions per shared challenge",
    "summary": "Export a short text code containing a validated track, variant, rules and target. Friends enter it locally; label results as unverified, with no ghost or server."
  },
  {
    "id": "N10",
    "title": "Pass the phone cup",
    "group": "Social",
    "effort": "M",
    "priority": 3,
    "replay": "15 to 30 minutes per gathering",
    "summary": "Let up to four local players take turns on one fixed bike and compare valid laps. Keep standings local and give each rider a practice attempt."
  },
  {
    "id": "N11",
    "title": "One clear next ride",
    "group": "Presentation",
    "effort": "S",
    "priority": 1,
    "replay": "3 to 5 short return sessions per week",
    "summary": "Show Resume Season, a near complete mastery goal and Today's Ride. Keep missed daily challenges in a local archive; replace broken streaks with total participation milestones."
  },
  {
    "id": "N12",
    "title": "Readable racing feedback",
    "group": "Presentation",
    "effort": "M",
    "priority": 1,
    "replay": "No extra hours; supports confident retries",
    "summary": "Pair rider colors with numbers, hazards with patterns and objectives with icons plus text. Show the largest lost sector after trials, using only compatible comparison laps."
  }
]
```