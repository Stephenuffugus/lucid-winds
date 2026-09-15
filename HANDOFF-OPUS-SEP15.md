# HANDOFF for Opus, written Sep 14 2026 by Fable. The entry point for the next run.

**The mandate, in Stephen's words (Sep 14, 20:10 UTC):** "make a serious plan for opus to build out and improve
everything we worked on last week like marrowdeep and stuff before we hit a wall. i also have another 10 kids math
games designed ... id like some nice pixel art."

**Sep 14 evening addendum:** the ten math game handoffs arrived and were assessed; lane C below is now real and
`plans/math/CATALOG-PLAN.md` is its plan.

**What "last week" is:** the twelve arcade games plus Marrowdeep (thirteen single file games under `satellites/`),
Keepsies K2.6 and Blockspace. All live. The last commit to any of them was Sep 08. Nothing was built Sep 09 to 14;
those days went to Jimothy's Steam release and Flock the World's Play submission, both now out of the repo's hands.

**What "before we hit a wall" means:** the session limit hit at 99 percent on the night of Sep 08 with three
builders mid task and nothing committed. The wall is the usage cap and the codespace clock, not a technical one.
Every rule in section 0 about committing early exists because of that night.

The prompt to paste is section 9. Everything above it is what the prompt points at.

---

## 0. FIRST THING IN A FRESH CODESPACE, BEFORE ANY READING

1. Memory does not survive a fresh codespace. If `~/.claude/projects/-workspaces-lucid-winds/memory/MEMORY.md`
   is missing:
   ```
   git clone https://github.com/Stephenuffugus/sws-memory.git ~/.claude/projects/-workspaces-lucid-winds/memory
   ```
   The codespace `GITHUB_TOKEN` is scoped to this repo. Anything touching the memory repo, the vault or a sibling
   repo runs under `env -u GITHUB_TOKEN -u GH_TOKEN`.
2. `./workspace.sh` (status only; it never discards work). Then `git pull --rebase --autostash origin
   add-sproing-jumper`. The working branch is `add-sproing-jumper`. Deploy is `git push origin
   add-sproing-jumper:main` and Hostinger picks main up within about a minute. Check `git log HEAD..origin/main`
   is empty before deploying; if it is not, someone pushed to main directly and you rebase first.
3. `df -h /` must show at least 2 GB free. The old box was at 93 percent. A fresh one starts clean.
4. `ls ~/.cache/puppeteer/chrome` must list a version; if empty, `npx puppeteer browsers install chrome` from the
   repo root. Never delete that cache.
5. `(python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 &)` if nothing answers on 8777.
6. Read `CLAUDE.md` sections LOOKING IS PART OF THE JOB and WHAT THE DIRECTOR EXPECTS. Read
   `HANDOFF-FABLE-SEP06-EVENING.md` section 1 (how his notes are taken) and sections 8 and 9 (laws and scars).
   Read `docs/DIRECTOR-CALLS-SEP06.md` whole; it is the one list of everything he has not ruled on.

**Two cores, one builder.** Stephen ruled Sep 05: no machine upgrade, one Opus at a time, it may run for 24 hours,
and the codespace will be closed mid run. Every browser gate runs as
`timeout 2700 flock -w 1800 /tmp/sws-gate.lock node <cmd>`, one at a time. `scripts/fleet/sweep-twelve.mjs` flocks
inside itself; never wrap it in a flock of your own (it deadlocks). Helper agents: at most two, only for reading or a
mechanical sweep, never for a judgement call, never while a gate runs. He has said "do not disperse agents" twice.

**Commit the moment something is green.** `git add` fenced paths only, never `-A`. Push the branch after every
commit. A partial with an honest message beats a finished thing that was never saved.

---

## 1. WHERE EVERYTHING STANDS (verified on the branch Sep 14)

| Thing | State | Entry point |
|---|---|---|
| The twelve (airworthy, asterism, doohickey, fathom, gerplunk, inkswing, strata, swell, updraft, wardian, whistlestop, windup) | All DONE P3, all live, all in the arcade's In Development tab (`localStorage.sws_dev_ok=1`), CI on every push (`.github/workflows/twelve.yml`, green today). Nine faults from his Sep 07 notes fixed and live; Sep 08 builds live (Gerplunk spit, curve, coach; Updraft kites, wind, sun, doodads; Airworthy doodads; Asterism river and planets; Burrow Bowl corner). | `plans/<game>/HANDOFF-<GAME>.md`, its SESSION STATE. `HANDOFF-SEP09.md` is the last full report. |
| Marrowdeep | BUILT AND LIVE Sep 08, stamp `20260908d`, eight gates green, behind the workbench door. **Nobody has played it on a phone. Nobody has heard it. The builder never wrote DECISIONS.md, the ledger or a morning report, and left the plan's SESSION STATE saying nothing existed (corrected Sep 14).** | `plans/marrowdeep/HANDOFF-MARROWDEEP.md` (SESSION STATE first), `RULES.md`, `AUDIT.md`, memory `project_marrowdeep_sep08`. |
| Keepsies | K2.6 live (`20260905a`), his open calls: fine step 0.5 vs 0.25 deg, button placement. | `satellites/keepsies/`, memory `project_keepsies_fine_aim_sep05`. |
| Blockspace | Live on the workbench (`20260905d`), M1 to M8 done, nobody has listened or held it on a phone. | `satellites/blockspace/HANDOFF.md`. |
| Jimothy (Steam) | Approved by Valve Sep 10. r4 build 25304387 live, 26 achievements published, Partial Xbox controller and Steam Achievements on the live page. **Stephen presses Release App Fri Sep 18 10:01 EDT.** Nothing in the repo to do. | `docs/LAUNCH-PLAN-SEP07.md` (history only now). |
| Flock the World (Play) | Submitted to Production Sep 14, $0.99, 172 countries, in Google review (1 to 7 days), managed publishing OFF so it goes live on approval. assetlinks carries the real Play signing key. `dl/flock.aab` is a temporary copy of the bundle at a short URL; delete it once the app is live. | `store/ftw-play/`, memory `project_ftw_play_package_sep05`. |
| Nothing else was touched | Lucid Winds itself (index.html), the back catalogue, the 3D games: untouched since their own handoffs. Not in scope for this run. | |

**Director calls open:** `docs/DIRECTOR-CALLS-SEP06.md` sections A to J, calls 1 to 71. He has answered 22 to 35
(section G), the four Sep 08 questions (section I, his answers verbatim) and nothing since. Marrowdeep's ten are
`plans/marrowdeep/HANDOFF-MARROWDEEP.md` section 10.

---

## 2. HOW THIS RUN DECIDES THINGS (the rule that keeps it moving without him)

He said "build out and improve everything". He also has a standing rule: money, price, name, tone and brand are
his; everything else that is reversible and under a day is the builder's smallest reasonable choice, logged. So:

- **Where a Director call in `DIRECTOR-CALLS-SEP06.md` carries a stated "My call:" from Fable, and the cost written
  next to it is a day or less, and it changes no price, name or saved record, TAKE FABLE'S CALL as the default and
  build it.** Write one line in that game's `docs/DECISIONS.md` (`<date> <call number>: built Fable's call because
  <why>; one line to reverse`). He overturns by saying so.
- **Where a call re grades saved records (section B), names a thing (section F), sets a price, or is a design sprint
  (calls 63, 64, Marrowdeep 1, 7d, 7e): DO NOT BUILD IT.** Leave it on the list, build the thing next to it.
- **RULES.md rulings are not ambiguities.** Marrowdeep is built from RULES; nothing in it is relitigated by a
  builder.
- His phone notes, if any arrive mid run, go VERBATIM into the plan's SESSION STATE first, numbered, then sorted
  fault / taste / already known, and the sort says which pile. Faults are fixed with the gate watched red first.
  Tastes join DIRECTOR-CALLS with a cost. Nothing is fixed before the sort is written.

---

## 3. LANE A: MARROWDEEP, THE FIRST THING (about one day)

It was built in a day against numbers and gates. It has never met a thumb. That is the gap.

**A1. Play it, honestly (2 h).** `cd satellites/marrowdeep && timeout 2700 flock -w 1800 /tmp/sws-gate.lock node
tools/check.js` first, and the summary line goes into the section 13 ledger, which is empty. Then real play at
412x915, 375x667 and 320x568 through `test/harness.mjs`'s `tap` (real pointerdown and pointerup on the element under
the thumb): a whole Depth I quest, one death, one retirement, the wall, both Hall tabs. Open every shot with the Read
tool and name three faults per shot BEFORE reading the Sep 08 list. Write `docs/DECISIONS.md` (the shape is
`satellites/keepsies/docs/DECISIONS.md`) starting with the rulings the Sep 08 build made without recording them:
Strike 1 at Depth I and II, the fourth Aspect dormant, and whatever else `grep -n DECIDED` in RULES.md and the
BALANCE block disagree on.

**A2. The list the audit's readers left, each a gated change, in this order:**
1. **The tutorial never says what a TN is.** A first quest coach on seen flags, the Gerplunk pattern
   (`satellites/gerplunk/index.html`, search `coach`): four beats at the moment each matters (what a target number
   is, what a Push costs, why a top face explodes, what Strain does), replayable from the Hall. Gate: the coach
   fires once per flag on a fresh fixture, never on `?test=1`.
2. **The greedy assignment is optimal 80 percent of the time**, so the central decision is a formality. This is a
   design finding, not a bug, and the lever is in RULES (R5.x, Chain and Relay frequency at Depth I and II). Do not
   move a BALANCE number. Instead: make the 20 percent VISIBLE. When the greedy plan is not the best plan, the
   pre roll card already prints the odds per assignment; add one line that names the better line ("Wren on the
   Chain passes more often") ONLY after the roll, as a lesson, never before. Gate in `sim.js --odds`: the lesson
   line appears only when the sim's best plan differed from the taken one.
3. **4.4 percent of new accounts roll four d4s they cannot replace.** RULES gives three free rolls at creation.
   Assert the floor: no starting character carries more than two d4s across its four stats (a re roll of the
   worst die, one line in GEN). Gate: 10,000 generated rosters, zero with three d4s.
4. **Rarity carried by colour alone, three contrast values failing** (plan section 7 names them). Every relic card
   prints its tier word in small caps; Relic gets a filled border; marrow lifts to `#c04a44`. Gate in
   `test/layout.mjs`: the tier word exists on every card in the drop screen fixture.
5. **The only exit from eleven screens sat where no thumb reaches.** Every screen's back or close control within
   the bottom 40 percent of the viewport at 320x568, proved by `elementFromPoint`. Gate: layout, all screens, all
   three widths.
6. **The challenge banks are half to a quarter of the spec's target** (~40 per stat per shape). Authoring, in
   `plans/marrowdeep/data/challenges-*.json`, then `tools/data.mjs` re inlines and the drift gate proves the block
   equals the files. Write in the spec's voice (skim `assets/MARROWDEEP_DESIGN_SPEC.md` sections 7, 12, 13). No
   dashes, no exclamation points; `sim.js --data` scans every composed string. Target: every bank to the spec's
   count. This is the biggest single line here (3 to 4 h) and it is the one that makes quest twenty feel different
   from quest two.
7. **The sound.** `docs/shots/p3-loud-minute.wav` exists for his ear. An ear gate (`satellites/fathom/test/audio.mjs`
   is the form: the loudest minute through the game's own voices into an OfflineAudioContext, peak, rms, share
   above 3 kHz) if Marrowdeep has none; a fresh GainNode's gain is ONE and three games clipped on that. Re render
   the wav after any change.
8. **Art.** The game draws everything as inline SVG symbols and `docs/ART_ASSETS.md` should list every symbol id
   (write it if the builder did not). Nothing else in art this run: the sheets are his (section 7 of the plan,
   `ART-PACK-MARROWDEEP.md`), and no image loads at runtime until he has cut one.

**A3. Stamp, deploy, prove.** Bump the stamp in every place lint checks (var STAMP, every head `?v=`, the music
include, the sw registration, `sw.js SHELL_VERSION`) and the portal row (`portal/index.html` line ~1052, both
`?v=`). Fable used to do the portal edit; you do it now, it is one line and it is inside this run's fence. Deploy,
then `node tools/live.mjs` against the real URL, then
`curl -s "https://lucidwinds.com/satellites/marrowdeep/?probe=$RANDOM" | grep -c "var STAMP = '<stamp>'"`.

**A4. Write the morning report** at the top of section 15 of the plan, in the template that is there. Then the
phone checklist for him: five lines, what to tap, what to look for.

**What is NOT in lane A:** the boss clock (call 1), the Scar cadence (1c), prices (7), the finite Marrow tree (7d),
the sixth Depth (7e), the name (8), Withdraw (4). Each is one BALANCE line or a design sprint and every one is his.

---

## 4. LANE B: THE TWELVE, THE IMPROVEMENT PASS (two to three days, one game at a time)

The order is by how much a phone would notice, given what he has already said. For each game: read its plan's
SESSION STATE, run its `tools/check.js` under the lock, build the items, gate each (watched red once), stamp in the
four places (var STAMP, head `?v=`, sw, portal row), deploy, probe the served page, write SESSION STATE with the
exact next action, commit, push. Then the next game. Never two games open at once.

**B1. Gerplunk (his most played; three calls with Fable's call stated, none over half a day):**
- Call 56: widen the stance to plus or minus 90 degrees and draw the far shore and treeline over the wider arc.
  The world is drawn per degree from a continuous function; the numbers are in the call. About 2 h.
- The curve's honest caveat (HANDOFF-SEP09 section 3): the sideways "out" is 0.45 m, seven screen pixels. If your
  own shot at 412 wide with a thumb drawn on it cannot see the out, raise `CURVE_DEG_PER_SKIP` until it reads and
  re run every sim assertion. Say what you set and why in DECISIONS.
- The coach's first paragraph was cut to one line to fit 320 with a sixth button; the note says a Director may
  want the prose back. Leave it. It is his.

**B2. Inkswing (calls 59, 60, 67):**
- 67: clip, not shrink, at the Gimbal's corner (Fable's call, half a day, touches every rig's reach rule; the sim
  assertion must be pinned per rig, the Sep 07 scar was a test pinned to `rig:'single'`).
- 59, the cheap half only: the "this clears the sheet" toast before a rig switch (ten minutes). Mixed rigs on one
  sheet changes the link format and is his.
- 60: the throw strip along the bottom with HIGHLIGHT and REMOVE, and the palette folds into it (a day; Fable's
  call was yes, after the undo per throw fix, which is done).

**B3. Airworthy (calls 61, 69):**
- 69: the workshop pass, half a day: the crease paper takes 540 of 915 px while the thumb's bar is 60 px; two
  labels saying the same thing 580 px apart; the Locked chip's subtitle wrapping.
- 61 in Fable's order: a course picker on TO THE GYM (half a day); a weights crease in the workshop (coin, second
  clip) with a sim pass because `CLIP_CM` makes the lawn dart (half a day). Paper stock as mass and stiffness is one
  to two days and re measures every medal threshold: do it only if B1 to B5 are done.

**B4. Updraft (call 70):** (a) the Delta and Box cards say tail "none" but fly the ribbon: change the cards to
"short tail" (the cheaper, truer fix). (b) the Fresh shudder threshold to 0.85 in Fresh only. Both are one number
or one string, both Fable's call.

**B5. Fathom (calls 62, 71):**
- 71: the HUM button pulses once when the zero state line says "Hum"; the grey reticle at zero brightened. Ten
  minutes each.
- 62 is the stone economy and it is HIS (the counts are his design). Do not build a regain. Build the
  instrument: a dev overlay (`?fathomtest=1` only) that prints stones spent per cave per route so his next note
  has numbers under it.

**B6. Burrow Bowl (call 65, Fable's call yes):** show the flick: a ghost of the line during the drag, a depth tick on
the HUD after the hop, a taller ramp. Half a day. The corner window (68) stays at 12 to 16 degrees; it is one
number and his.

**B7. The four he has not commented on since Sep 06** (Doohickey, Strata, Swell, Wardian, Whistlestop, Windup,
Asterism): each plan's SESSION STATE says "nothing is half finished, the next session takes the next row of section
5 of the spine". Take the next row of each, one gated change per game, only after B1 to B6. Whistlestop has
puzzles 3 to 6 designed as data and unbuilt (plan line ~940): that is its row. Windup's next step is his ear and a
printed strip (E20): nothing for you there. Wardian's is P2 step 1, the rest of the flora.

**Not in lane B:** every call in sections B (re grades records), D (judgement), E (paper, law), F (names), and A
(his ear). Calls 63 and 64 (Fathom creatures, gear) are design sprints. The Midjourney sheets for the flying games
(66 item 6) are his time.

---

## 5. LANE C: THE MATH CATALOG (nine games plus a shared core; about twelve builder days)

The ten handoffs arrived Sep 14 evening and are in the repo verbatim as `assets/math-catalog/` (read only).
**The plan over them is `plans/math/CATALOG-PLAN.md`, and it binds you:** where a handoff and that plan
disagree, the plan wins, because it was written against this repo. Read it whole before any handoff.

What it settles (the short form; the plan has the reasons):
- **Nine games, CAIRN cut** (weakest evidence, and Lucid Winds already has Memory Meadow). Its slot goes to two
  micro tools: the equals sign screener (on SPAN) and Simon Says (on HUSH).
- **No name collides** with any of the 156 portal rows, any `satellites/` folder or the back catalogue.
  Working titles stand; display names are Stephen's.
- **Order:** CORE, SPAN, YONDER, CREASE, BRIM, GLIMPSE, HUSH, NOTCH, TINT, GAUGE. GAUGE after CREASE and BRIM
  by its own rule. A game ships to In Development the day its v1 scope is green.
- **Architecture:** shared core as a versioned ES module include under `satellites/math/core/`, every import
  stamped; one folder per game in the fleet shape; `engine.js` pure and imported by the Node gates; each game
  its own `sw.js`; NO `music-unlocks.js` in these nine (the catalog promises no network after load); layout
  gates at the three phone widths AND 1366x768 keyboard only.
- **Corrections the handoffs need:** "Sky Wolf Studio" (the INDEX says Sky Walk); no dashes in any player
  caption (`close, 3/4 is here`); RESONARC does not exist, the audio module is written fresh in the fleet's
  WebAudio shape; the design specs the handoffs cite were not delivered, v1 is built from the handoffs.
- **Pixel art:** code drawn sprites at integer scale with a per game 16 colour palette and a `tools/sheet.mjs`
  that renders the whole sheet to a PNG you OPEN and fault before calling it art. NOTCH's pieces are projected
  SVG, the one exception. Painted sheets are Stephen's, later, through Midjourney.
- **Per game plan first, by you:** `plans/<game>/HANDOFF-<GAME>.md` in the twelve's template, from the game's
  handoff plus the catalog plan plus CORE, committed before P0. Section 8 of the catalog plan says what it
  must carry.
- **Kids' laws on top of the fleet's:** all thirteen CORE invariants (no accounts, no network after load, no
  timers, no scores, no red X, no reading required, keyboard playable, muted by default, the forbidden
  strings), the reveal contract, silent adaptation, SPAN's language rules. Directions before play are a
  wordless loop, which every handoff's "first run" section already describes.

Lane C starts after lane A and after B1 to B6, unless a SESSION STATE note from Stephen moves it up.

---

## 6. THE LAWS THAT BIND EVERY LINE (the short list; the long one is HANDOFF-FABLE-SEP06-EVENING.md 8 and 9)

- No dash of any kind and no exclamation point in player copy. Commas. "Sky Wolf Studio", singular.
- 48 px rendered touch targets at 375 wide, proved by `elementFromPoint`. `el.click()` proves nothing.
- Every import and asset carries `?v=<stamp>`; var STAMP, head `?v=`, the music include, the sw registration and
  `sw.js SHELL_VERSION` are one string. The portal row is the fourth place a stamp lives.
- Runtime modules are `.js` (the host serves `.mjs` as text/plain). `.mjs` is for Node tools.
- The bottom left 120 by 120 of every screen is empty for the music chip.
- Text 0.7 rem or larger, and a gate that MEASURES computed font size on every screen, not a CSS grep.
- Nothing between SIM markers touches document, window, Date or Math.random; the sim is the game and the seam gate
  proves the page's answer equals the sim's for the same seed.
- A count in a gate is a law, not today's number (Gerplunk went green by luck twice on the daily seed).
- A gate that SETS the state it asserts is decoration; write a fixture to localStorage and RELOAD into it.
- A colour threshold read off one variant is a gate that passes by luck; measure a DIFFERENTIAL (with the thing,
  with the thing set aside, everything else the same).
- A fresh GainNode's gain is ONE. Every voice sets its own. The ear gate measures peak.
- `.screen{justify-content:center}` on a scrolling column clips its own top at 320. flex-start plus the
  `::before/::after margin:auto` pair.
- A duplicate object key is legal and silent; `tools/dupkeys.mjs` in every lint.
- A batch patch that writes once at the end loses everything when a later assert fails; write per edit, assert
  the match before every `replace`.
- After a context compaction, `ps -eo pid,ppid,cmd | grep node` for a leftover gate before editing its files.
- A visual change is not done until the screenshot has been opened with the Read tool and three faults named.
- Deploy proof is a probe of the SERVED page with a random query, never the stamp in the repo.

---

## 7. SIZING (one Opus, two cores)

| Lane | Honest hours |
|---|---|
| A. Marrowdeep A1 to A4 | 8 to 10 |
| B1 to B6 | 14 to 18 |
| B7 | 6 to 8 |
| C. CORE plus nine math games (`plans/math/CATALOG-PLAN.md` section 3) | about 12 days total; SPAN in front of a child inside a week |

That is three to four days of building for A and B, and about two and a half weeks of interrupted runs for C. The run will be interrupted by the codespace clock and by
usage limits. Every stop leaves SESSION STATE with the exact next action, and the same prompt resumes it.

---

## 8. WHAT STEPHEN OWES THE RUN (so it does not stall on him)

- **The ten design specs** (`<NAME>-design-spec.md`) that every math handoff cites. Not in the delivery. v1
  builds without them; v1.1 and any public claim wait for them.
- **The ten calls in `plans/math/CATALOG-PLAN.md` section 9**, each with a default the build takes meanwhile.
  The two that matter most: CAIRN cut, and no music chip in the math games.
- If he wants generated pixel art rather than code drawn: connect an image MCP and say so. Default is code.
- What "Astra" is (he mentioned it can do graphics while coding games). Unknown to this repo; a link is enough.
- His phone notes on Marrowdeep, whenever. They go into the plan's SESSION STATE verbatim.
- The Director calls, at his pace. Nothing in this run waits on one.
- Fri Sep 18 10:01 EDT: Release App on Jimothy's Steamworks landing page. Not the run's job.

---

## 9. THE PROMPT (paste as is into a fresh Opus session; paste it again after every session end or codespace restart, it resumes itself)

```
You are Claude Opus, the builder for Sky Wolf Studio, in the lucid-winds repo at /workspaces/lucid-winds on
branch add-sproing-jumper, running unattended for as long as this run lasts. The Director is Stephen; he reads
your work when he is back. Fable (another Claude) wrote your handoff and reviews what you produce. One builder,
this box, two cores. Slow is fine. Stopping is not.

THIS RUN WILL BE INTERRUPTED by session ends and by the codespace being closed. The same prompt starts the next
session. Nothing survives a break except what is committed AND pushed, so you commit and push the moment
something is green, never at the end of a phase only.

FIRST, whether this is the first session or a resumed one:
1. If ~/.claude/projects/-workspaces-lucid-winds/memory/MEMORY.md is missing:
   git clone https://github.com/Stephenuffugus/sws-memory.git ~/.claude/projects/-workspaces-lucid-winds/memory
2. ./workspace.sh   then   git pull --rebase --autostash origin add-sproing-jumper
3. df -h / must show 2 GB free. ls ~/.cache/puppeteer/chrome must list a version (else
   npx puppeteer browsers install chrome). Start the static server if nothing answers on 8777:
   (python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 &)
4. Read /workspaces/lucid-winds/HANDOFF-OPUS-SEP15.md whole. It is your plan. Sections 0, 2 and 6 bind you.
   Then CLAUDE.md sections LOOKING IS PART OF THE JOB and WHAT THE DIRECTOR EXPECTS. Then
   HANDOFF-FABLE-SEP06-EVENING.md sections 1, 8 and 9. Then docs/DIRECTOR-CALLS-SEP06.md whole.
5. Find your place. Every game's plan (plans/<game>/HANDOFF-<GAME>.md) has a SESSION STATE at the top. If
   any SESSION STATE names a next action inside this run, start there. If none does, start at lane A, step A1.
6. Lane C is the math catalog: assets/math-catalog/ (ten handoffs, read only) under
   plans/math/CATALOG-PLAN.md, which binds you and wins over any handoff. Lane C comes after lane A and after
   B1 to B6, unless a SESSION STATE note from Stephen moves it up. Its order is CORE, SPAN, YONDER, CREASE,
   BRIM, GLIMPSE, HUSH, NOTCH, TINT, GAUGE; CAIRN is cut. For each game you write plans/<game>/HANDOFF-<GAME>.md
   in the twelve's template BEFORE P0 and commit it.

THE ORDER. Lane A (Marrowdeep) whole, then lane B one game at a time in the order written, then lane C one game
at a time. A game is done for this run when its tools/check.js prints ALL GATES PASSED under the lock, every new
gate has been watched to fail once, every new screenshot has been opened with the Read tool and three faults
named, the stamp is bumped in all four places including the portal row, it is deployed with
git push origin add-sproing-jumper:main (after git log HEAD..origin/main is empty), the served page is probed
with a random query, SESSION STATE holds the exact next action, and it is committed and pushed. Then the next.

DECIDING. Section 2 of the handoff. Where a Director call carries Fable's stated "My call" at a day or less and
touches no price, name, tone or saved record, build Fable's call and log it in that game's docs/DECISIONS.md.
Where it re grades records, names a thing, prices a thing, or is a design sprint, leave it and build the thing
next to it. RULES.md rulings are implemented as written. If Stephen's phone notes appear anywhere, they go
VERBATIM into the plan's SESSION STATE first, numbered, then sorted fault / taste / already known before anything
is fixed.

THE FENCE per game: satellites/<game>/** and plans/<game>/HANDOFF-<GAME>.md, plus the one portal row for that
game in portal/index.html (its two ?v= and nothing else on that line), plus HANDOFF-OPUS-SEP15.md section 10
(your reports). In lane C the fence also holds satellites/math/** (the shared core and landing) and the new
plan file you create per game; assets/math-catalog/ and plans/math/CATALOG-PLAN.md are read only. git add only those paths, never -A. Never edit scripts/, music-unlocks.js, another game's files,
RULES.md, proto/, data/ under plans/ (copy from them, never into them), CLAUDE.md or the memory directory. A
rebase conflict outside your fence is resolved by taking theirs.

TWO CORES. Every browser gate: timeout 2700 flock -w 1800 /tmp/sws-gate.lock node <cmd>, one at a time. Never
wrap scripts/fleet/sweep-twelve.mjs in a flock. A browser gate that fails inside a suite is rerun alone, twice;
two passes alone is a pass and is written that way. Helper agents: at most two, only for reading or a mechanical
sweep, never for judgement, never while a gate runs. After any context compaction, ps -eo pid,ppid,cmd | grep
node before editing a file a gate may be writing.

THE OVERNIGHT PROTOCOL. Never wait on a human. An ambiguity is the smallest reasonable choice, logged in
docs/DECISIONS.md with one line of why. A gate still red after three honest attempts is written into SESSION
STATE as BLOCKED with its last thirty lines of output and you move on; you never weaken, skip or delete a gate to
pass it. When your context is running long: finish the subsystem in hand, run its gates, commit, push, write
SESSION STATE with the exact next action (file, function, step), append a dated report to HANDOFF-OPUS-SEP15.md
section 10 (phases, gates, what to play, five shots to open, decided without him, blocked, next action), and
stop. Never start a subsystem you cannot finish and commit inside the context you have left.

LAWS. No dash of any kind and no exclamation point in player copy. Sky Wolf Studio, singular. 48 px rendered
targets at 375 wide proved by elementFromPoint, never el.click(). One stamp string in every place lint checks
and the portal row. Runtime modules are .js. Text 0.7 rem or larger, measured. Bottom left 120 by 120 empty. The
sim is the game; nothing between SIM markers touches document, window, Date or Math.random. A count in a gate is
a law, not today's number. A gate never sets the state it asserts. A colour threshold is a differential. A fresh
GainNode's gain is one. Screenshots under 200 KB, opened and described, never regenerated for their own sake.
Deploy proof is the served page, never the repo.

Start now with step 1.
```

---

## 10. REPORTS (the builder appends here, newest first; the morning reader starts at the top)

### 2026-09-15 01:10 UTC, Opus: B3 Airworthy call 69, the workshop pass
The press bar grows with a tall screen (60 to 92 px at 412x915, the paper giving up exactly that: 374 by 529 to
354 by 500, measured before and after); the canvas's duplicate "N of 6 creases pressed" is gone; a row of fold
chips lines its words up across a wrap, the Locked chip's "heavier, and it stays" included, nothing cut or
reworded. Every new law watched red against the committed page. Found and left for Stephen: the menu glyph
shows in the workshop although the code hides it, and it is the only way to STEADY HANDS there. Next: B3 call
61, a course picker on TO THE GYM.

### 2026-09-15 00:45 UTC, Opus: B2 Inkswing call 60, the throw strip, built and green
A row of 48 px chips under the paper, one per throw; a press lights the stretch of the drawing that throw
coloured; REMOVE (asks once) takes it out of the list and redraws; DONE puts it down. Two faults found and
fixed on the way (the folio kept the throw list by reference, so UNDO after KEEP edited a kept drawing; an
emptied sand tray kept its grains). Every new law watched red, including one the shots forced: the first
320 layout pulled the paper up until the rig's pivot sat under HIDE RIG with every gate green. ALL GATES
PASSED, seven of seven, stamp `20260915a`. Left for Stephen: the palette fold (call 28), "adjust", and the
drawing at 320 being 12 percent smaller to keep the row. Next: B3 Airworthy, call 69.

### 2026-09-15 00:20 UTC, Opus: lane B, B1 Gerplunk closed and B2 Inkswing two of three, both deployed
B1 Gerplunk: call 56 (the shore to plus or minus 90) rendered and NOT built, a design sprint (the lee's bar
becomes the Sep 08 bridge, 100 percent of the width at minus 60; the bay's trees run out; D49). The curve's
out measured and NOT retuned: the handoff's `CURVE_DEG_PER_SKIP` makes the out smaller, and the one record
safe pair only doubles 5.3 px to 9.9 at 412 while shortening every spun throw (D50). Found on the way: the
flick and audio gates were laws about the calendar (red on chop days, 5 of 30 in September); both now seed
a glass day through `GERPLUNK_DEV.forceDay` and assert it, watched red on the chop day (D51). ALL GATES
PASSED, eight of eight, stamp `20260914a`. B2 Inkswing: call 59's cheap half built (a rig card on a drawn
sheet warns before it clears, watched red, ALL GATES PASSED seven of seven, stamp `20260914a`, D-B2a); call
67 (clip, not shrink) built, measured and taken back out, because without the shrink the link law reads
2.600 units against 1.5 and holding it needs a finer link, a format change (D-B2b). Deployed at 9deb0260:
both served pages carry the stamp once, both portal rows twice, both sw.js the new shell. Next: B2 call 60,
the throw strip (Inkswing SESSION STATE names the first step), then B3 Airworthy.
**Stopped here, at a clean point, because the context ran long** (the overnight protocol). Everything is
committed and deployed; nothing is half built in any tree. Call 60's band is measured and written into
Inkswing's SESSION STATE (a 56 px strip row fits every phone but 320x568, where the paper would lose 4
percent). B3 starts from `plans/airworthy/HANDOFF-AIRWORTHY.md` SESSION STATE (Fable's reviewer, Sep 08,
stamp `20260908d`, eleven gates, portal row matching): call 69's workshop pass first (the paper takes 540 of
915 px, "0 of 6 creases pressed" and "CREASE 1 OF 6" say one thing 580 px apart, the Locked chip's subtitle
wraps), then call 61 in Fable's order (a course picker on TO THE GYM; a weights crease with a sim pass,
because `CLIP_CM` makes the lawn dart). Three things wait on Stephen from lane B: call 56's shape (bay
half only, or the full 180 with a curving cove), the curve's out (leave it, or slip 7 with per skip 3.2),
and call 67 (keep the shrink, or a finer link).

### 2026-09-14 23:08 UTC, Opus: lane A (Marrowdeep) done and deployed
A1 played through real taps at 412, 375 and 320. A2.1 to A2.8 built, each with its new law watched red, the full check
green, the shots opened with three faults named, committed and pushed: coach, Hall prices, lesson, d4 floor, tier
words, reach, 320 boards, whole words, forty line banks, the ear gate, the slot glyphs. Eight gates at the start of the
run, thirteen now. A3: stamp `20260914a` in all six places and the portal row, deployed (b735df5a), the served page with a random probe carries `var STAMP = '20260914a'` once, the portal row serves `v=20260914a` twice, `sw.js` serves `marrowdeep-shell-20260914a`, and the wav serves 200 `audio/vnd.wave` 5,292,044 bytes,
`node tools/live.mjs` against the deployed URL under the lock printed `LIVE OK the deployed page boots, paints and carries the engine` (stamp 20260914a, the title screen with BEGIN on it, no failed request and no console error). Morning report at the top of `plans/marrowdeep/HANDOFF-MARROWDEEP.md` section 15. Next: lane B, B1
Gerplunk call 56.
