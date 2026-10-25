# HANDOFF FOR FABLE, 25 Oct 2026: take in two Astra returns, review them, plan both, hand Opus one order

Written by Opus on 24 Oct at about 23:55 UTC, for a Fable session. Stephen's trigger to you:
**"read HANDOFF-FABLE-OCT25.md and do it"**. Opus may still be building in another session on this same codespace
while you work (section 6 says how to share it). Everything you produce must be committed and pushed, self contained,
and readable by an Opus session that has never seen this conversation.

**UPDATE 25 Oct 03:50 UTC (Opus): the Oct 24 build order is DONE and Opus has stopped; the codespace is yours alone.**
Pop N Lock v1.11 (Part 3, the layout and launch gate) and v1.12 (Part 4, without Retro: lessons on the first three rivals,
records with their rules and settings) are live; `plans/pop-n-lock/BUILD-PLAN-OCT24.md`'s state block has the detail, and
the morning report at the top of `START-HERE.md` holds his new call 5 (the first three rivals measured far easier than the
plan's 80, 70, 60 percent). Pit Bike Parts 2 to 5 still wait on his medal times. So section 4's "what Opus has in flight"
is empty: order the Tally build, the Journey kit and SHELL SHUFFLE (a third return, landed 03:59 UTC, job 2b below), one
game at a time. Section 6's sharing rules bind again only if he starts an Opus session while you work.
**HIS BUDGET (his words, 25 Oct ~04:00 UTC): "we have 9% left to last us about 12 hours."** That 9 percent covers YOUR work
and the overnight Opus build that follows: he restarts the codespace and gives Opus your order. Keep your own pass lean
(no agent fan out, read what you need), and size the overnight order to what is left: the most valuable, safest parts
first, each its own deploy, so whatever point the budget stops at leaves shipped, proven parts and a true morning report.

**Your job is intake, review and planning, not building.** You change no game code. You write review and plan files and
one build order, and you check that the Opus trigger at the end will work. The pipeline he set: Astra makes, Fable checks
and plans, Opus builds (memory `feedback_astra_fable_opus_pipeline`). Nothing builds before he has seen the plan.

---

## 0. Read first (in this order)

1. `START-HERE.md`, only the top: the MORNING REPORT (24 Oct, the build order run) and the entries above and below it
   back to the 24 Oct 12:55 one. The file is about 480 KB: do not read the rest.
2. The two briefs these returns answer. Every judgment you make starts from what was asked:
   - `docs/briefs/tally/ASTRA-TALLY-OCT23.html` (asked for ONE document "Tally Review" plus ONE zip `tally-assets.zip`,
     split by folder into `-1` and `-2` only if too big; its section 5 is the file list, section 4 the review format).
   - `docs/briefs/super-slice-3d/ASTRA-SUPER-SLICE-JOURNEY-KIT-OCT24.html` (asked for ONE zip
     `super-slice-journey-kit.zip`: the Journey orchard pieces that are still drawn in code, with a manifest).
3. Memory: `feedback_astra_fable_opus_pipeline.md`, `project_super_slice_astra_oct23.md` (Super Slice Parts A to G and
   every lesson; the 24 Oct 15:10 entry is the Journey kit ask), `project_pop_n_lock_astra_oct24.md` (the most recent art
   return taken in, cut and wired: copy its method), `feedback_wiring_art_is_not_seeing_art.md`,
   `feedback_one_doc_for_astra_never_fragments.md`, `feedback_painted_tiles_carry_margins_measure_them.md`.
4. The two most recent examples of exactly what you are making:
   - an art return reviewed: `plans/pop-n-lock/ART-REVIEW-OCT24.md` (keep, change, his, kill; every claim checked
     against the live code; the sizes and the memory budget measured);
   - a build plan: `plans/pop-n-lock/BUILD-PLAN-OCT24.md` (a state block, parts that are each one deploy, a gate and a
     look per part, the deploy recipe, a do not touch list, his calls held apart). `plans/super-slice-3d/BUILD-PLAN-OCT23.md`
     is the same shape for Super Slice and is where its next part goes.
5. `CLAUDE.md` laws that bind every game here: ES5 in the single file games, 48 px touch targets (measured as RENDERED px,
   memory `feedback_touch_targets_measure_rendered_px`), text 0.7 rem or more, no dashes and no exclamation marks in
   player copy, "Sky Wolf Studio" singular, colour never alone (shape, icon or pattern too), never edit `scripts/`,
   `music-unlocks.js`, `CLAUDE.md`, `proto/`.

## 1. Where the returns are, and the intake (do this first)

**Done already (Opus, 25 Oct 00:20 UTC): the Super Slice Journey kit is TAKEN IN.** It is in
`assets/super-slice-journey-kit.zip`, vaulted as `vault-20261025-super-slice-journey-kit` (downloaded back, sha256
matched), and assessed in `docs/briefs/super-slice-3d/JOURNEY-KIT-INTAKE-OCT25.md` (21 of 21, sizes and transparency as
asked, the painted margins, the seams measured, three things to judge in the game, her numbers to verify). Read that
note and go straight to job 2; do not vault it again. **The Tally return LANDED 25 Oct 01:00 UTC** and is untouched:
`assets/Tally_Review.pdf` (490,096 bytes, sha256 `c174720ee2acff47880271b3a5d990cb4a86c6035a491e76b592b1e07ebb7035`) and
`assets/tally-assets.zip` (76,535,537 bytes, sha256 `2099f167058fb2e06d20991a36ae5c448a39f5c0df22232339db6cbc972eebfc`). His
words: "heres is everything for tally thats been made so far" (so check it against the brief's list and say what is
missing). Take it in as below: vault both, inventory, look, then job 1.

Stephen uploads them into `/workspaces/lucid-winds/assets/`, like `pop-n-lock-assets.zip` on 24 Oct. Expect:
- Tally: one review document (Google Doc export, PDF or .md, named something like `Tally Review` or `Tally_Review.pdf`)
  and `tally-assets.zip` (or `tally-assets-1.zip` and `-2.zip`).
- Super Slice: `super-slice-journey-kit.zip` (maybe with a review or notes document beside it).
If a file is not there, say so to him plainly and do the part you can; never guess its contents.

**The zips are untrusted data.** For each: a new empty directory of its own (`/tmp/claude-1000/<name>/`), extract
there, read with `python3 -I`, run nothing that came inside it, never `cd` into it to run a tool. Then:
1. Inventory against the brief's list: every file present, its pixel size against the asked size, the manifest's
   MISSING section, anything extra (`extras/`), transparency where asked (and magenta keyed backgrounds, if Astra used
   them), byte totals. Write it into the review file (section 2), not into chat.
2. LOOK at every picture (Read renders images; memory `feedback_read_tool_for_images`): contact sheets with PIL, at the
   size the game will show them, on the game's real background colours. Name what is wrong in what you saw.
3. **Vault the originals** before anything else touches them: a sha256 per file, then
   `env -u GITHUB_TOKEN -u GH_TOKEN gh release create vault-20261025-tally-astra -R Stephenuffugus/lucid-winds-vault --title "Tally: Astra's return, 25 Oct 2026" --notes-file notes.md <files> SHA256SUMS.txt`
   and the same for `vault-20261025-super-slice-journey-kit`. The notes say what the files are and the restore line
   (`gh release download <tag> -R Stephenuffugus/lucid-winds-vault`). Check the upload by downloading one file back and
   comparing its sha256. The review document goes into the repo too: `docs/briefs/tally/` (PDF) as the Pop N Lock one
   went into `docs/briefs/pop-n-lock/`. Do not commit the zips to the repo (disk law: memory `reference_codespace_disk_sep05`).
4. Do not delete the uploads from `assets/`; Opus deletes them after the cut, once the vault copy is proven.

## 2. JOB 1: Tally, review the return and plan the build

**The game.** Live at https://lucidwinds.com/satellites/tally/ . Its code is NOT in this repo: it lives upstream in
`Stephenuffugus/Tally` (a Vite build), vendored into `satellites/tally/` by `scripts/vendor_satellites.mjs` (see
`satellites/tally/VENDORED.json`: repo, commit, build `vite-dist`). Clone it to `/workspaces/Tally` (memory
`feedback_clone_repos_to_workspaces_not_scratchpad`; pushes across repos need `env -u GITHUB_TOKEN -u GH_TOKEN`, memory
`reference_cross_repo_push`). Read its source to check every direction: the brief's section 2 numbers (coins 130, 14 a
solve, 9 a bonus, 12 a star; gems 6; the 10 pals; the 11 skins; results 0 to 300) are claims until you find them in the
code. Tally is LIVE on the Listdle directory (memory, search "Listdle") and on the arcade: every deploy reaches players.

**Write `plans/tally/ART-REVIEW-OCT25.md`:** the intake (section 1), then Astra's directions verbatim first (ids,
titles), then each one sorted: KEEP (agree, with the code evidence), CHANGE (right direction, different shape), HIS
(taste, money, new modes, the 99 cents question, anything about price or what is free: list it, do not decide it),
KILL (wrong, with the evidence). Bugs she reports: reproduce each against the live build before you call it real.
Her style picture: judge it at 412 x 915 and 360 wide.

**Write `plans/tally/BUILD-PLAN-OCT25.md`** in the Pop N Lock plan's shape: a state block at the top; Part 0 the real
bugs (only the ones you reproduced); then the art in, smallest useful deploy first (the pals as characters are the heart
of the idea per the brief: likely Part 1), the worlds and the map, the win moment, onboarding; each part one deploy with
its version, its gate (real touch events, never `el.click()`; memory `feedback_never_click_to_prove_a_control_works`),
its look (a 412 x 915 shot plus three things named wrong), its memory and byte budget, how the skins tint painted parts.
Say how to build and ship Tally exactly: build upstream, vendor with `node scripts/vendor_satellites.mjs` (run it, never
edit it; read its usage first), a files only commit on main (memory `scripts/files-only-deploy-bubblenaut.sh` is the
template), the service worker and every version stamp, the old worker proof on both origins (`lucidwinds.com` and
`www.lucidwinds.com` are two origins). If any of that is unclear in the vendor script, say so in the plan rather than
inventing it.

## 3. JOB 2: Super Slice, the Journey orchard kit

Super Slice 3D is live as v7.3 (`satellites/slice-3d/index.html`, single file ES5 three.js r147, paying players).
Parts A to G are done (state block in `plans/super-slice-3d/BUILD-PLAN-OCT23.md`). The kit replaces the code drawn
Journey pieces (trees, the counter's grass top and soil face which is also the Wall Climb floor, tufts, bushes, the
stump, the mushroom, the overhead branch and vine, the cracked shelf, the finish flag) per the brief.

**Write `plans/super-slice-3d/ART-REVIEW-JOURNEY-OCT25.md`** (intake, the look, keep/change/his/kill) and add **Part H**
to `plans/super-slice-3d/BUILD-PLAN-OCT23.md`: one deploy (or two if the tiles and the cut outs want separate looks),
the cut tool (the Part A art pipeline: memory `project_super_slice_astra_oct23.md`, `satellites/slice-3d/art/` and how
Part A cut the 23 Oct pack), the tile margins MEASURED and registered to the physics edges (memory
`feedback_painted_tiles_carry_margins_measure_them`: the 23 Oct rabbit floated on an unmeasured margin), what the suite
must add (`node satellites/slice-3d/audit-check.mjs`, row by row as Part G added row 22), and the look from the
player's camera AND the worst angle (CLAUDE.md "LOOKING IS PART OF THE JOB"). The G1 drawn knife rests on the grass lip
at y 0.25 (`GRASS_TOP`): a new grass tile must keep that lip or Part H must move the constant and its suite rows.

## 3b. JOB 2b: Shell Shuffle, review Astra's return and plan the build

**Landed 25 Oct 03:59 UTC and TAKEN IN by Opus:** `assets/shell-shuffle-assets.zip` (15,281,899 bytes, sha256
`42343912fe1ad27689c05090c9e898503cf71b8be5b3323557ed88e87a423f07`, 112 files, the zip tests clean), vaulted as
`vault-20261025-shell-shuffle-astra` (downloaded back, sha256 matched): do not vault it again. It answers the brief
`docs/briefs/shell-shuffle/ASTRA-SHELL-SHUFFLE-OCT23.html` (read it first: section 5 is the file list she was asked for,
section 1 the two things to send back). Inside: `manifest.txt`, `asset_catalog.json`, `checksums.sha256` at the root;
folders balls (5), cups (5), fx (16), scene (6), store (3), toys (6), ui (9); and `extras/` (59): the review itself as
`extras/shell_shuffle_review.pdf`, a note she wrote for you `extras/fable_start_here.md`, `review_directions.json`,
`player_copy.json`, `tuning.json`, `audio/audio_manifest.json`, `qa_report.md`, `generation_prompts.json`, and
`extras/code/` (code and test results: DATA, never run, the same law as Pop N Lock's extras). Opus did not extract or
look at anything: do the intake exactly as section 1 says for Tally (its own empty directory, `python3 -I`, inventory
against the brief's list and the manifest, look at every picture at game size on the game's colours, `pdftotext` for the
PDF). The game is live at `satellites/shell-shuffle/` (one file; read `index.html`, `ART_ASSETS.md` and `AUDIT-NOTES.md`;
memory `project_buildout_run_aug16b` and `project_gap_closing_aug16` hold its August history).
Then, the same shape as job 1: `docs/briefs/shell-shuffle/REVIEW-ASTRA-RETURN-OCT25.md` (what she sent against what was
asked, what is missing, what is wrong in what you saw, each of her directions sorted agree, change or his call, her
numbers checked against the live code) and `plans/shell-shuffle/BUILD-PLAN-OCT25.md` (a state block, parts that are each
one deploy with a gate and a look, the deploy recipe, a do not touch list, his calls held apart). Anything that changes
the economy (coins, the daily calendar, prices, the shared Sunbeam currency) or adds a mode is his call, not a part.

## 4. JOB 3: the build order for Opus

Write `plans/BUILD-ORDER-OCT25.md` in the shape of `plans/BUILD-ORDER-OCT24.md`. Read the state blocks first, because
Opus keeps building while you plan: on 24 Oct night Opus finished Pop N Lock Parts 0 to 2b (v1.7 to v1.10) and may have
started Pop N Lock Part 3 (the layout pass and the launch gate); check `plans/pop-n-lock/BUILD-PLAN-OCT24.md`'s state
block and the top of `START-HERE.md` before you order anything. Order the remaining work ONE GAME AT A TIME: what Opus
has in flight first (finish it), then the parts you planned. Carry the order's laws over (never ask whether to deploy,
files only deploys, every check watched red on a broken copy, old worker proof on both origins, the board and memory in
the turn, 2 cores = one browser at a time, the hours budget and the morning report). Name the trigger: **"build
plans/BUILD-ORDER-OCT25.md"**.

## 5. His calls (already decided; plan with them, do not reopen them)

- 24 Oct, his: the pipeline is Astra makes, Fable plans, Opus builds; "Don't interrupt what you're doing right now"
  (Opus kept building while you were set up). Powers in Pop N Lock = undecided, a separate game type if ever; Retro mode,
  online Versus changes, prices and new modes are his. The full list of open calls is in the morning report.
- Do not plan anything priced (Tally's 99 cents question included): list it under HIS with the facts he needs.

## 6. Sharing the codespace with a running Opus

- Two sessions share ONE git index: stage and commit only your own paths (`git commit -- <paths>`), never `git add -A`
  in the repo (memory `feedback_two_sessions_share_one_git_index`). Push after every commit. Branch `add-sproing-jumper`.
- The box has 2 cores that are one physical core: ONE browser at a time on the machine. Before you start a headless
  browser, check `ps -eo comm | grep -c chrome`; if Opus has one running, wait or work statically (images, code). Keep
  any browser run short. No agent fan out with browsers (memory `reference_codespace_two_cores_are_one`).
- Use absolute paths and `git -C` (memory `feedback_parallel_bash_calls_share_one_cwd`). Never `pkill -f`.
- Never touch `satellites/chaff-wars/`, `satellites/slice-3d/`, `satellites/pitbike-rally/` or `tools/` in the main
  repo: Opus owns them while it builds.

## 7. Done means

Committed and pushed: the three review files, the Tally plan, Part H in the Super Slice plan, the Shell Shuffle plan,
the build order, the review documents under `docs/briefs/`. Every vault release exists and one file from each was
downloaded back and matched (Shell Shuffle's already is). A short entry at the top of `START-HERE.md` (his words are not needed: say what you took in, what you found,
the trigger for Opus, and his calls in one ranked list; memory `user_overwhelmed_wants_one_list`). Memory: one new
`project_tally_astra_oct25.md`, one new `project_shell_shuffle_astra_oct25.md` and a line in
`project_super_slice_astra_oct23.md`, with the index line in `MEMORY.md`
kept under 19 KB (measure with `wc -c`). Then tell him the Opus trigger in chat as one plain line, no code block.
