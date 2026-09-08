# HANDOFF — next session. Written Sep 08 2026 by Fable, at the end of the night Stephen's notes came in.

**Where the last session ended:** every fault from his Sep 07 phone notes is fixed, reviewed and live;
the builds he approved on Sep 08 are live or landing (see section 3); the durable records are in each
game's plan, `docs/DIRECTOR-CALLS-SEP06.md` sections I and J, and memory `project_stephen_notes_sep07_eve`.

---

## 0. FIRST THING, BEFORE ANYTHING ELSE

Memory does not survive a fresh codespace. If `~/.claude/projects/-workspaces-lucid-winds/memory`
is missing:

```
git clone https://github.com/Stephenuffugus/sws-memory.git \
  ~/.claude/projects/-workspaces-lucid-winds/memory
```

Then `./workspace.sh`. ⛔ The codespace `GITHUB_TOKEN` is scoped to this repo; anything touching the
vault, the memory repo or a sibling repo needs `env -u GITHUB_TOKEN -u GH_TOKEN`.

---

## 1. HOW HIS NOTES WERE TAKEN, AND WHAT THEY BECAME

His 35 lines (seven games, verbatim) are the VERBATIM entry in each plan's SESSION STATE; the sort
sits above it. One read-only agent per game verified every line against the live code, a second
agent tried to refute every fault, and nine survived. Every one of the nine is fixed, gated (each new
assertion watched red under a planted mutation), reviewed by a third agent, stamped, deployed and
probed on the served page:

| game | his line | the fault | stamp live |
|---|---|---|---|
| Airworthy | 18, 19, 22 | crease 1 never started its sweep; no plane was ever foldable | 20260908d |
| Asterism | 27 | the pen had no path to close a loop | 20260908d |
| Inkswing | 13 | UNDO removed a colour, not a throw | 20260908a |
| Inkswing | 17 | the Gimbal collapsed every slow release onto the midline | 20260908a |
| Gerplunk | 11 | the spin ring sat under the thumb (8 to 13 mm under a 15 mm pad) | 20260908b+ |
| Burrow Bowl | 30, 31 | a full power flick could never score; the corner 100 sinks now | 20260908b |
| Fathom | 25 rider | a tap at zero stones drew the reticle and said nothing | 20260908a |

Fathom's stone COUNTS were re-sorted to taste by the refuter: they are his own design (call 62).

⛔ Two scars from the sort, now in memory `feedback_thumb_units_and_thumb_shots`: a reach window has
to be stated in CSS px/s at the phone's width before it is called reachable (Burrow Bowl's Aug 20
"solution space" lived where no thumb goes), and a shot of a touch held control needs a thumb drawn
on it before it is called visible.

## 2. HIS FOUR ANSWERS (Sep 08, ~01:10 UTC, verbatim in DIRECTOR-CALLS section I)

- "the slip" = the SPIT of land ("looks like a bridge, horrible") → rebuilt, fresh stance moved.
- "not tuned" = THE THROW: a curve out and back, shown, and a simple skill → the curve build.
- Asterism "Oh" = nothing. "Keep building detail" → the river and the planets.
- "bring stuff" = TOY DOODADS on plane AND kite (finger puppet, chip clip, bouncy ball; a fidget
  spinner wrecks it; the paperclip is real weight) → `docs/GEAR-DOODADS-SEP08.md`, both halves.
- "keep building" = the go.

## 3. WHAT WAS BUILT ON THE GO (all reviewed by a second agent; see each plan's SESSION STATE)

- **Updraft, three changes (20260908d):** all five kites FLY as their own shapes (call 53); visible
  wind on the field with direction, lull and squall (grass, flowers, Mabel, a windsock); the sun on
  an arc, a moon and stars at night, a crossfade at band edges, the thermal by hour.
- **Airworthy doodads shelf (20260908d):** eight things a kid would tape on, each flown in the sim
  before its line was written; the paperclip is row one at its exact old numbers; the fidget spinner
  is The Brick by law (down inside two metres); the bouncy ball lands twice. `node sim.js --doodads`.
- **Asterism (20260908d):** the Milky Way as a mottled river with the Great Rift, a differential
  against the plain sky; the five naked eye planets from mean elements, premise gated over a year,
  nothing from the network; a planet can be a star of a chain and the myth calls it a wanderer.
- **Gerplunk spit (20260908b):** a real point of land with a broken silhouette; the fresh stance is
  yaw 0 and the faces step at 15 degrees, so a new player's straight throw is on the main water.
- **Gerplunk curve (20260908d):** spin bends the path (a per skip heading change plus a small drift
  in the air), the release is on the screen (the ring freezes and rides off, an angle line, a release
  sound), the seam is redrawn from YOUR throw after each one, and one line names the three numbers
  after the sink. ⛔ The builder's honest caveat: the sideways "out" is about 0.45 m, seven screen
  pixels at the camera's distance, so the RETURN will read on the phone and the OUT may not. If his
  thumb says the curve is invisible, the number is CURVE_DEG_PER_SKIP and the camera's distance.
- **Gerplunk coach (20260908f):** five beats on five seen flags (flick, slide, wind up, the hook and
  the curve, the faces), each once at the moment it matters, HOW TO THROW on the sheet replays them;
  his Sep 06 save gets the three new beats once. The sheet was re laid to fit 320x568 with the sixth
  button, and its first paragraph was cut to one line because HOW TO THROW now does that job (a
  Director may want the prose back; it costs a scroll at 320).
- **Updraft doodads shelf (20260908e):** nine chips (NOTHING plus eight), every row flown in Gentle,
  Fresh and Blustery before its line was written; the Bell rings within a second of a gust peak, the
  Whistle sings above a line speed, the chip clip climbs the line in a gust, the fidget spinner never
  leaves the grass below Blustery and snaps the line there. `node sim.js --doodads`.

## 4. THE CALLS HE HAS NOT MADE (DIRECTOR-CALLS sections I and J, 56 to 71)

Highest first: **67** Inkswing's Gimbal at the paper's extreme corner (the reach law: clip or
shrink); **68** how hard Burrow Bowl's corner 100 should be (a straight overthrow is a 10 by design);
**62** Fathom's stone economy (regain or not, Penny mode); **59** Inkswing mixed rigs on one sheet
(changes the link format); **70** Updraft's Delta and Box "no tail" cards, and the Fresh shudder.

## 5. JIMOTHY AND FLOCK, UNCHANGED, HIS HANDS

Rev 2 in review, untouched. The live Steam page still shows "September 2026" and its own data sorts
it as "Coming Sep 29, 2026" (not Sep 30 as the plan said); the false "Mouse and keyboard only" line
is still live. Both are Steamworks edits only he can make. `docs/LAUNCH-PLAN-SEP07.md` is still the
plan. Flock on Play needs his hands for every step.

## 6. SCARS FROM THIS NIGHT

- ⛔⛔ **The session limit hit at 99 percent of the hourly at ~02:45 UTC** with three builders mid
  task and nothing committed. Their working trees were rescued to branch `wip/sep08-limit-rescue`
  (three commits) and the work resumed from it when he reset the limit. Rule: a builder commits a
  partial with an honest message the moment a gate is green, never waits for the whole task.
- ⛔ **A gate that SETS the state it should boot into** bit again: Airworthy's fold gates pressed
  through a test hook that set `sweeping=true`, so crease 1 was never seen frozen.
- ⛔ **A count green by the day it was written:** Gerplunk's flick gate said a weak lob "dies inside
  two skips"; the daily seed gave 2 skips on Sep 07 and 5 on Sep 08 with nothing changed. Now a seam
  assertion (the page's count equals the model's for the tuple thrown, on the day's face).
- ⛔ **`timeout 900` around a gate waiting on a busy lock kills it silently.** With four builders on
  the box the law is `timeout 2700 flock -w 1800`.
- ⛔ **The portal row is the fourth place a stamp lives** (url ?v= and thumb ?v=); the sweep reads it
  and the builders cannot touch it (outside their fence), so the lead bumps it at deploy. Done for
  six games tonight; do it again for whatever lands last.
- ⛔ **A builder stopped short a second time** (the Gerplunk coach: layout red on a sixth button,
  patch prepared, nothing committed) and the reviewer finished it. Rescue commits of both stalls are
  on `wip/sep08-limit-rescue` (four commits). The rule stands: commit the partial the moment
  something is green.
- CLAUDE.md was corrected: the Pi lane is built, and there are thirteen Cloud Functions.

## 7. THE PROMPT TO PASTE

```
Read HANDOFF-SEP09.md first. Then the newest SESSION STATE entries in plans/gerplunk and
plans/updraft to see how the curve, the coach and the kite doodads ended.

I have tested the fixes and the new builds on my phone and I have notes. Take them the way
HANDOFF-FABLE-SEP06-EVENING.md section 1 says: verbatim first, then fault / taste / known,
and say which. Do not fix anything until I have seen the sort.

Then answer calls 67 and 68 with me, and work down DIRECTOR-CALLS sections I and J.

Jimothy: rev 2 is in review, the Sep 18 date is locked. Nothing publishes until r4 is live.
```
