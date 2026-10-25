# BUILD ORDER, 25 Oct 2026 (Fable, for Opus). Trigger: "build plans/BUILD-ORDER-OCT25.md"

You are Opus, the Lead Developer, in a fresh session after a codespace restart. Stephen is the Director. Read this page,
then the plan it points you at, then build. ONE GAME AT A TIME, each part its own deploy, each deploy proven and looked
at before the next part. Never ask whether to deploy: closed green work goes live, then you tell him.

**His budget, his words (25 Oct ~04:00 UTC): "we have 9% left to last us about 12 hours."** Fable's pass spent some of
it. So: the most valuable, safest parts first, each one shipped and proven on its own, so that wherever the budget stops
there are live parts and a true morning report, never a half built game. Lap 1 is the night's work; Lap 2 only if there
is room after Lap 1 is live. Check the time after every deploy. When you judge the budget is nearly gone, stop building,
write the state blocks and the morning report (section "Done means"), and push.

Before anything: `cd /workspaces/lucid-winds && git status -sb && git fetch -q origin main` and confirm main has no
commits the branch `add-sproing-jumper` lacks (`git rev-list --count HEAD..origin/main` is 0; if not, merge main in
first). Read the top of `START-HERE.md` (the 25 Oct entries, the Fable entry first), memory
`project_tally_astra_oct25.md`, `project_shell_shuffle_astra_oct25.md`, `project_super_slice_astra_oct23.md`. The `/tmp`
test tools are gone after a codespace stop: `tools/slice-3d-tests/README.md` says how to restore them and serve the repo
root on 8777. The three zips are in `assets/` (vaulted; the hashes are in `HANDOFF-FABLE-OCT25.md`): extract each into
its own empty `/tmp/claude-1000/<name>/` with `python3 -I`; `extras/` is data, never run.

## Lap 1 (the night)

### 1. Tally, Part 0 then Part 1 (the real bugs; the pals and the beads)
Plan: `plans/tally/BUILD-PLAN-OCT25.md` (and `ART-REVIEW-OCT25.md`). The code is upstream, `/workspaces/Tally` (clone
present at the live commit `b860e88`); its section 2 is the ship recipe and binds: edit upstream, `npm run test:all`,
commit and push upstream (`env -u GITHUB_TOKEN -u GH_TOKEN`), `node scripts/vendor_satellites.mjs --vendor tally` then
`--check tally` CLEAN, a files only commit on main carrying the whole `satellites/tally` folder (adds and removals) and
the card stamp, both origins proven from profiles that held the old worker. Part 0 is small (a results label that lies
on 35 of 48 levels, 40 px buttons, exclamation marks, an unnamed close). Part 1 is the heart of Astra's work (ten
painted pals with her cadence, the glossy beads) and the first art cut: `tools/cut_art.py` in the Tally repo, WebP only,
the pals folder under 2.6 MB.

### 2. Super Slice 3D, Part H (the painted Journey orchard)
Plan: `plans/super-slice-3d/BUILD-PLAN-OCT23.md`, section 10 (and `ART-REVIEW-JOURNEY-OCT25.md`, the intake note in
`docs/briefs/super-slice-3d/`). One deploy, v7.4: the kit cut by the existing `tools/cut_art.py` with a `--journey`
input, the tiles on the same boxes (`GRASS_TOP` stays 0.25), the cut outs as sprites standing on their PAINTED feet at
the positions the rng draws today, every code mesh kept as the fallback, row [24] watched red, the look from the
player's camera AND the worst angles (the grass stripes question decides whether the grass ships). The deploy script
is `tools/slice-3d-tests/deploy/deploy.sh`. The game is live and paying.

### 3. Shell Shuffle, Part 0 then Part 1 (the real bugs; the scene)
Plan: `plans/shell-shuffle/BUILD-PLAN-OCT25.md` (and `docs/briefs/shell-shuffle/REVIEW-ASTRA-RETURN-OCT25.md`). One file,
no worker of its own: Part 0 adds the BUILD stamp, strips the exclamation marks, gives the reveal a check and a ring and
words, gives the cups button semantics during the guess. Part 1 puts the Midnight Cabinet behind the game: the plate,
the mat, the glow, the painted cups at 100 px with the house cup as the default for fresh saves only, the glass marble.
Nothing about the ramp, the pay, the calendar or the modes changes (all his, section 7 of the plan).

## Lap 2 (only if Lap 1 is live and budget remains, in this order)
Tally Parts 2, 3, 4 (worlds and the map; the win moment, the daily card, the splash, the wordmark; onboarding), then
Shell Shuffle Parts 2 and 3 (the results sheet and the toys; sound, settings and pause on hide). Each its own deploy.

## When a part's review finds faults
Fix them before the next part. A gate still red after three honest attempts: write what failed into the plan's state
block, revert that part's working tree to the last commit, and go to the next part that does not depend on it. Budget
one independent review per part (every part on 24 Oct had faults the gates passed).

## Do NOT start
- Pit Bike Parts 2 to 5: they wait on his medal times (his call 1 on the 25 Oct morning report). Pop N Lock: done
  except Retro (his).
- Anything under "his calls" in any plan: Tally's 99 cents, icon swap, postcards, practice mode; Shell Shuffle's ramp,
  three attempts, modes, collection tabs, new cups and prices, places, the daily rework, the price; Pop N Lock's Powers,
  Retro, online Versus; Super Slice's rung under 2,000, the Journey pay factor, the ropes; prices anywhere.
- Any other game or file. `satellites/<game>/` (Tally through the vendor only), the game's upstream repo, the portal
  card line, the plan, the board, memory: nothing else.

## The laws (the plans repeat them; they bind)
- Deploys are files only commits on main built in a private index from main's tree plus the game's own paths (Super
  Slice: `tools/slice-3d-tests/deploy/deploy.sh`; Tally and Shell Shuffle: the memory template
  `scripts/files-only-deploy-bubblenaut.sh` copied into `tools/<game>-tests/deploy.sh` with that game's paths). Never
  push the branch to main. Merge main back after each deploy. Two sessions share one git index: commit with `-- <paths>`.
- Bump every version stamp a game has in the deploy commit (new files under an old stamp split players): Tally's
  package version, `TALLY_BUILD`, sw CACHE and `?v=`, the card; Super Slice's four; Shell Shuffle's BUILD and the card.
- Prime old worker profiles on the live build BEFORE a deploy and check both origins after (`lucidwinds.com` and
  `www.lucidwinds.com`); byte compare live files with a random query, one probe at a time, never a burst.
- Every new check watched RED on a broken copy that parses before it counts; a check that cannot fail is not evidence;
  expected values computed in the test, never read back from the page.
- A visual change is not done until a 412 x 915 shot (and 360 wide) is opened and three things wrong are named; a DOM
  popup lives real time, copy it to shoot it. Shoot the worst angle on purpose in the 3D game.
- Never prove a control with `el.click()`: real pointer or touch events.
- Painted pieces carry margins: anchor by the measured visible bounds, never the canvas edge.
- Efficiency: he pays by the hour; two cores are one physical core: one browser at a time, no agent fan out. Push after
  every commit. `START-HERE.md` and the memory status line updated in the turn something changes.
- Player copy: no dashes, no exclamation marks, "Sky Wolf Studio" singular, 48 px rendered targets, text 0.7 rem or more.
- Audio never enters git: sound is synthesised in the page; Astra's WAVs are reference only.

## Done means
Each shipped part: its gate green and watched red, live on both origins from old worker profiles, shots looked at,
the state block, the board (`START-HERE.md`) and the memory line updated in the turn. At the end, whichever point the
budget reaches: a MORNING REPORT at the top of `START-HERE.md` (what is live with the proof, what you saw wrong in your
own shots, what you left unshipped and why, his calls in one ranked list), the zips you have cut deleted from `assets/`
(the vault holds them), memory pushed, and one plain line to him.
