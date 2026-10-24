# HANDOFF FOR FABLE, 24 Oct 2026: review one, plan three, hand Opus one order

Written by Opus at the end of the 24 Oct day session, for the next Fable session. Stephen's trigger to you:
**"read HANDOFF-FABLE-OCT24.md and do it"**. Then he closes the codespace, reopens it, switches to Opus and says
**"build plans/BUILD-ORDER-OCT24.md"**. So everything you produce must be committed and pushed, self contained, and
readable by an Opus session that has never seen this conversation.

**Your job is review and planning, not building.** You change no game code. You write review and plan files, a build
order, and you check that the Opus trigger above will work. (The pipeline he set: Astra makes, Fable checks and plans,
Opus builds: memory `feedback_astra_fable_opus_pipeline`.)

---

## 0. Read first (in this order)

1. `START-HERE.md`, the 24 Oct entries at the top (his words verbatim, each sorted). Do not read the whole file (476 KB).
2. Memory: `project_super_slice_astra_oct23.md` (Super Slice, Parts A to F, every lesson), `project_oct22_brother_visit_next_moves.md`
   (Pit Bike, his calls), `project_chaff_wars_jul19.md` (Pop N Lock's history), `feedback_astra_fable_opus_pipeline.md`.
3. `plans/super-slice-3d/BUILD-PLAN-OCT23.md`: **the shape every plan you write must have** (a state block, parts that are
   each one deploy, gates per part, a look per part, a do not touch list, the deploy recipe, his calls held apart).
4. `CLAUDE.md` laws that bind every game here: ES5 in the single file games, 48 px touch targets, text 0.7 rem or more,
   no dashes and no exclamation points in player copy, "Sky Wolf Studio" singular, never edit `scripts/`,
   `music-unlocks.js`, `CLAUDE.md`, `proto/`.

## 1. His calls today (already decided; plan with them, do not reopen them)

- **Super Slice:** the boss lob forgiving; the boss pays by how well you fought; losing the fight costs the Clean Slice;
  prices much higher and balanced by measurement; no Daily practice; Deep Tide not slowed; Endless keeps accelerating
  until impossible. All built and live as v6.9 to v7.2 (section 2).
- **Pit Bike Rally:** he **agrees with every verdict in Astra's return**. The Trials style side view is KILLED for this
  build; no career entry fees, no repair deductions and no wear in the standard career and time trials; the career is an
  honest 2 to 4 hours (44 races, six seasons), not a 20 hour promise.
- **Pit Bike, his new fault:** nitro needs the gas thumb to lift. "we need a way to hit the nitro button without taking our
  thumb off of gas so it may need to be on the left side."
- **Pit Bike, his new idea:** an **analog throttle** on the right thumb, "the more you pull down the more you accelerate ...
  really premium feeling controls on such a simple game and open up a lot more avenues for us to expand."
- **Process:** Fable reviews today's Super Slice work too ("we should probably have Fable go through this work as well").

## 2. JOB 1: review Super Slice Part F (v6.9 to v7.2), the work shipped today with NO independent review

Parts A to E each had a multi lens review with a skeptic per finding before shipping. Part F shipped on the full suite
(230 green), fail watches (23 broken copies, every one red) and the builder's own looks. That is not a review. Do one.

| Part | Live | Branch commit | What changed |
|---|---|---|---|
| F1 | v6.9 | `7f5725101` | Endless ramp: `endlessLvl(k)` (chunk k at level k+1 to 7), `endlessExtra(k)` (more crystals, wasps, thorns past 600 m), `endlessTerm(d)` (fall speed past 917 m, cap 60); a band's verb host drawn first |
| F2 | v7.0 | `4dd278b6a` | the DRAWN knife never dips below the ground or a stump top (`kSurf`, `KDRAW`, `KLO`/`KHI`); drawing only |
| F3 | v7.1 | `9e9e708c0` | boss: `lobAim` caps speed toward the boss, `lobSpin` x0.25, grade by misses (x5, x3, x2) paid outside the landing multiplier; Daily: no practice, no Replay, `DAILY_PHYS` 2 |
| F4 | v7.2 | `c80440535` | `slivPayout` = round(0.5 x sqrt(score)) (+30 clean; Endless depth/8); prices 2,000 to 22,000; the six Astra knives priced and on the shelf |

**Check, in this order** (each finding: fault, taste, or fine, with the evidence; the builder's numbers are claims until you rerun them):
1. **F4 economy (his domain, the biggest judgment call).** `tools/slice-3d-tests/f4/earn.js` measures a "near human"
   controller: is its score a fair stand in for a real player, or does it inflate Freefall (it carves the Clean Slice
   line and aims for the bullseye every time)? Journey earns 70 to 95 a minute against Freefall's 180 to 270: fair or a
   reason nobody plays Journey? Is 14 hours for the whole shelf right for this game? The Sunbeam economy is separate and
   untouched; confirm.
2. **F3 boss.** `tools/slice-3d-tests/f3/steer.js`: 300 of 300 fights clear for any hold toward the boss. Too easy? Does
   the grade still mean something (entry misses and handle bonks are the only way to lose x5)? Is a rope still a real skip?
3. **F1 Endless.** The only death in Freefall is a blade into a side wall, so difficulty = shoves plus speed. Film it
   (`tools/slice-3d-tests/f1/film.mjs`) and judge: does 300 to 1,500 m feel fair and 3,000 m impossible?
4. **F2.** `tools/slice-3d-tests/f2/ground.mjs`: does the knife standing on its end read right, or float?

Tools: `tools/slice-3d-tests/README.md` (restore the `/tmp` tools, serve the repo root on 8777; ONE browser at a time,
the box has 2 cores that are one physical core). Suite: `node satellites/slice-3d/audit-check.mjs` (about 30 minutes).
Slices and fail watches: `tools/slice-3d-tests/fix/` (`node mkslices.js`, `fwrun_f1.js` to `fwrun_f4.js`).

**Write:** `plans/super-slice-3d/REVIEW-PART-F-OCT24.md` (findings) and, for every real fault, a **Part G** in
`plans/super-slice-3d/BUILD-PLAN-OCT23.md` (its state block says Part F is done; add Part G with the fixes, each with its
gate and look). Taste calls go to his list, not into Part G.

Also open, his, untouched (do not plan them unless he says): the supporter shelf, cross game entitlement, six authored
courses, seasonal remixes, the beehive, Cloud Croissant's squashed painting. Astra has a new ask in her queue for
Journey's trees and ground (`docs/briefs/super-slice-3d/ASTRA-SUPER-SLICE-JOURNEY-KIT-OCT24.html`); when that zip
lands it becomes its own part, not now.

## 3. JOB 2: plan Pit Bike Rally

**Inputs:** Astra's return, verbatim: `docs/briefs/pitbike-rally/ASTRA-RETURN-PITBIKE-OCT24.md` (a design review, no art:
ten verdicts, twelve new directions, a 44 race career table, a json backlog). The brief it answers:
`docs/briefs/pitbike-rally/ASTRA-PITBIKE-REPLAY-OCT22.html`. The code: upstream clone `/workspaces/skywolf-pitbike-rally`
(the source of truth; push recipe in memory `project_oct22_brother_visit_next_moves.md`), vendored into this repo as
`satellites/pitbike-rally/src-<sha>/` (live: v1.7 career seasons on `src-5dbb16b`, v1.6 time trial before it).

**Verify Astra against the code before planning** (Astra saw the live menu, never the source; it says so): entry fees and
repair deductions exist? "Tall Gearing requires Short Gearing"? a brake upgrade with a claimed touch benefit while touch
has no brake? the Daily Rally generator? 22 career rounds, prizes 3,000, 6,000 and 12,000? Write what is true.

**Controls come first** (Astra's own release boundary: "First stabilize controls, legal laps, save migration and
versioned records"), and his two notes live there:
- Today: steering is a floating stick on the left 46 percent of the screen (`#joy-zone`); GAS is a 92 px button bottom
  right; NITRO a 72 px button straight above it (`css`, `input.js`); touch has no brake.
- The physics already takes an analog throttle: `p.throttle = input.gas ? 1 : 0` (`input.js:94`), and
  `target = b.throttle * top * envMul` (`physics.js:39`); the AI riders already use partial throttle. So his analog
  throttle mostly plugs in. Design it: a floating right stick (reuse the floating stick of Rabbit Ronin and Bubblenaut,
  memory `project_floating_stick_oct23.md`), pull down = throttle 0 to 1 with a dead zone and a curve; nitro without
  lifting (flick up on the same thumb, or his left button idea, or both: decide and say why); keep the old GAS button as a
  setting. Half throttle IS Astra's N05 "useful coasting". Time trial records and medal times need a physics version.
  The gate must drive it by real pointer events (memory `feedback_never_click_to_prove_a_control_works`) and measure the
  thumb at his 412 px width (`feedback_thumb_units_and_thumb_shots`).

**Write:** `plans/pitbike-rally/BUILD-PLAN-OCT24.md`, Super Slice's plan shape: parts in order (controls first, then
Astra's priority 1 items: protected earnings, loan bikes, the career extension, spec trials, mastery, next ride screen,
readable feedback), each one deploy (vendored `src-<sha>`, the files only deploy), with gates, looks, do not touch
(saves, earned Sprockets, unlocks: "Preserve all older unlocks"), and what Astra deferred kept deferred.

## 4. JOB 3: Pop N Lock (Astra's return, zips)

**Inputs (both arrived 24 Oct ~16:40 UTC, copied byte for byte from his chat upload):**
- `assets/pop-n-lock-assets.zip`, 18,464,160 bytes, sha256 `6ce2238bbdcac8980430ff6b865dd025bd9c210cc24b88776801de3a63a1d4ac`,
  git IGNORED (on disk only: vault it first). 140 entries, about 18 MB unpacked: dance 54, react 30, extras 28, pods 16,
  powers 5, board 3, hud 3, and `manifest.txt` at the root. Not extracted yet.
- Astra's review, a PDF: `docs/briefs/pop-n-lock/ASTRA-RETURN-POP-N-LOCK-REVIEW-OCT24.pdf` (committed; also
  `assets/Pop_N_Lock_Review.pdf`), 365,730 bytes, sha256 `aec32653f43f3f40b54502c86327df97fa09827147da33a11bd5d51b0d003b70`.
  Read it with the Read tool (`pages`), not by extracting text with a tool that runs its content.
The brief it answers: `docs/briefs/pop-n-lock/ASTRA-POP-N-LOCK-OCT23.html` (asked for ONE review doc with a style
picture first, and ONE zip `pop-n-lock-assets.zip` with a `manifest.txt`). The game: `satellites/chaff-wars/` in this
repo (its own `context/STATE.md`, `ARCHITECTURE.md`, `ASSET-LIST.md`, `DESIGN-powers-mode.md`).

**Steps, as the Super Slice return was done** (memory `project_super_slice_astra_oct23.md`, the 23 Oct Fable entry):
1. sha256 each zip, then vault it FIRST (private repo `Stephenuffugus/lucid-winds-vault`, a release
   `vault-20261024-pop-n-lock-astra`, `env -u GITHUB_TOKEN -u GH_TOKEN gh release create ...`). Disk had 3.3 GB free.
2. Treat the zip as untrusted data: extract into its own empty folder, read with `python3 -I`, never run anything in it.
3. Check every file against the brief's section 5: count, names, pixel sizes, alpha, one style across sets, what the
   manifest lists as MISSING. Contact sheets, then LOOK at them (name what is wrong). Per file verdict: use, fix, skip.
4. Read Astra's review: every gameplay verdict and addition, sorted keep, change, kill, with your own agree or disagree.

**Write:** `plans/pop-n-lock/ART-REVIEW-OCT24.md` and `plans/pop-n-lock/BUILD-PLAN-OCT24.md` (the same plan shape;
any gameplay change that is his call goes under "his calls", never into a part).

## 5. THE BUILD ORDER FOR OPUS (the file his Opus trigger opens)

Write `plans/BUILD-ORDER-OCT24.md`: one page Opus can start from cold. It names, in order, which plan and which part to
build, ONE GAME AT A TIME (memory `feedback_one_game_at_a_time`). Suggested order, change it if your review says so:
1. Super Slice Part G (the review's real faults; small, the game is live and paying).
2. Pit Bike Rally, its plan top to bottom (controls first).
3. Pop N Lock, its plan.

For each: the plan path, the first part, what "done" means (live on both origins, proven from browser profiles that held
the old worker, suite green, every new check watched red on a broken copy, LOOKED at), and what to do when a part's
review finds faults (fix before the next part). Include the laws in section 6 and say what Opus must NOT start (Astra's
Journey kit until its zip lands; anything listed under his calls).

Then check the trigger works: `plans/BUILD-ORDER-OCT24.md` exists on the branch and main has nothing the branch lacks.

## 6. Laws every plan carries (Opus will follow what the plan says, so say these)

- **Deploys:** a files only commit on main built in a PRIVATE index from main's tree plus the game's own paths
  (template: memory `scripts/files-only-deploy-bubblenaut.sh`; Super Slice's version was in the last session's
  scratchpad, so rebuild it from the template), then merge main back into the branch. Never push the branch to main
  (it carries unapproved work). Two sessions share one git index: commit with `-- <paths>`.
- **Stamps:** bump every version stamp a game has in the deploy commit (Super Slice: `BUILD`, `sw.js?v=`, the sw
  `CACHE`, the portal card `?v=`).
- **Proof:** prime browser profiles on the live build BEFORE the deploy, check after
  (`tools/slice-3d-tests/ssb/oldworker.mjs` pattern); byte compare the live files with a random query, one probe at a
  time (never burst the live site).
- **Gates:** every new check watched RED on a broken copy before it counts; a check that cannot fail is not evidence
  (the 24 Oct lesson: a check that read the surface back from the page agreed with a wrong surface).
- **Looks:** a visual change is not done until a screenshot at 412 x 915 is opened and three things wrong are named.
  A DOM popup lives 950 ms of real time and a software rendered shot takes longer: copy it to look at it.
- **Efficiency:** he pays by the hour; the box is 2 cores = one physical core: one browser at a time, no agent fan out
  on 3D. Push after every commit; update `START-HERE.md` and the memory status line in the turn something changes.
- **Never ask whether to deploy:** closed green work goes live, then tell him.

## 7. Before you hand back

- Commit and push every file you wrote (`git add -- <paths>`; branch `add-sproing-jumper`).
- Add one entry at the top of `START-HERE.md`: what you found, where the plans are, his calls you need answered.
- Update memory (`project_super_slice_astra_oct23.md`, `project_oct22_brother_visit_next_moves.md`, a Pop N Lock entry)
  and push the memory repo (`env -u GITHUB_TOKEN -u GH_TOKEN git push`).
- Tell him in a few lines: what you found, the questions only he can answer, and that the Opus trigger is
  **"build plans/BUILD-ORDER-OCT24.md"**.
