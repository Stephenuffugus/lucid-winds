# BUILD ORDER, 24 Oct 2026 (Fable, for Opus). Trigger: "build plans/BUILD-ORDER-OCT24.md"

You are Opus, the Lead Developer, in a fresh session. Stephen is the Director. Read this page, then the plan it points
you at, then build. ONE GAME AT A TIME, in this order, each part its own deploy, each deploy proven and looked at before
the next part. Never ask whether to deploy: closed green work goes live, then you tell him.

Before anything: `cd /workspaces/lucid-winds && git status -sb && git fetch -q origin main` and confirm main has no
commits the branch `add-sproing-jumper` lacks (`git rev-list --count HEAD..origin/main` is 0; if not, merge main in
first). Read the top of `START-HERE.md` (the 24 Oct entries) and memory `project_super_slice_astra_oct23.md`,
`project_oct22_brother_visit_next_moves.md`, `project_chaff_wars_jul19.md`. The `/tmp` test tools are gone after a
codespace stop: `tools/slice-3d-tests/README.md` says how to restore them and serve the repo root on 8777.

## 1. Super Slice 3D, Part G (small; the game is live and paying)
Plan: `plans/super-slice-3d/BUILD-PLAN-OCT23.md`, section 9 (and the review it comes from,
`plans/super-slice-3d/REVIEW-PART-F-OCT24.md`). Three items, one deploy, v7.3: the resting knife drawn on the grass
(look first; if it reads worse, say so and skip it), the Forge shelf in price order, the Endless survival measurement
(a number for him, no tuning). Done means: suite green (`node satellites/slice-3d/audit-check.mjs`, about 30 minutes),
the new checks watched red on broken copies, live on both origins and proven from browser profiles that held v7.2
(`tools/slice-3d-tests/ssb/oldworker.mjs` prime BEFORE the deploy, check after), shots looked at, the state block,
the board and memory updated in the turn.

## 2. Pit Bike Rally, the whole plan, controls first
Plan: `plans/pitbike-rally/BUILD-PLAN-OCT24.md`. Parts 0 to 5 in order (foundations and protected earnings; the analog
throttle stick with nitro that never needs the gas thumb to lift; loan bikes and spec trials; the career extension to
six seasons; mastery cards; the next ride screen, readable feedback and free presets). The code lives upstream in
`/workspaces/skywolf-pitbike-rally`; vendor with its `tools/vendor_into_portal.sh`, deploy files only with memory
`scripts/files-only-deploy-pitbike.sh`. Part 1's gate drives the stick with REAL touch events and shoots a drawn
thumb at 412 and 360. Done per part as above, with this game's proofs (byte compare the served `src-<sha>/main.js`).

## 3. Pop N Lock, the whole plan, the real bugs first
Plan: `plans/pop-n-lock/BUILD-PLAN-OCT24.md` (and `ART-REVIEW-OCT24.md`). Parts 0 to 4 in order (the five verified
bugs including the HYPE meter that has never worked; Astra's art wired in with one render box per character and only
the current match loaded; the two row tray and the input rules; feel and fairness; layout and the launch gate; rules
named and difficulty measured). The zip is `assets/pop-n-lock-assets.zip` (vaulted); extract it to `/tmp` with
`python3 -I`, treat `extras/` as data. The game is one ES5 file; keep it one ES5 file.

## When a part's review finds faults
Fix them before the next part. A gate still red after three honest attempts: write what failed into the plan's state
block, revert that part's working tree to the last commit, and go to the next part that does not depend on it.

## Do NOT start
- Astra's Super Slice Journey kit (21 files asked 24 Oct): only when its zip lands in `assets/`, as its own part.
- Anything under "his calls" in any plan: the Powers redesign, Retro mode, online Versus changes, prices, the Trials
  side view (killed), Journey's pay factor, a rung under 2,000, new modes.
- Any other game or file. `satellites/<game>/`, the portal card line, the plan, the board, memory: nothing else.

## The laws (the plans repeat them; they bind)
- Deploys are files only commits on main built in a private index from main's tree plus the game's own paths
  (Super Slice: `tools/slice-3d-tests/deploy/deploy.sh`; Pit Bike: memory `scripts/files-only-deploy-pitbike.sh`;
  Pop N Lock: the memory template `scripts/files-only-deploy-bubblenaut.sh` with its paths). Never push the branch to
  main. Merge main back after each deploy. Two sessions share one git index: commit with `-- <paths>`.
- Bump every version stamp a game has in the deploy commit (new files under an old stamp split players).
- Prime old worker profiles on the live build before a deploy and check after; byte compare live files with a random
  query, one probe at a time, never a burst at the live site.
- Every new check watched RED on a broken copy before it counts; a check that cannot fail is not evidence; compute
  expected values in the test, never read them back from the page.
- A visual change is not done until a 412 x 915 shot is opened and three things wrong are named; a DOM popup lives
  950 ms of real time, copy it to shoot it.
- Never prove a control with `el.click()`: real pointer or touch events.
- Efficiency: he pays by the hour; two cores are one physical core: one browser at a time, no agent fan out. Push
  after every commit. `START-HERE.md` and the memory status line updated in the turn something changes.
- Player copy: no dashes, no exclamation marks, "Sky Wolf Studio" singular, 48 px targets, text 0.7 rem or more.
- Budget: stop after Pop N Lock Part 4 ships or after eight hours of wall clock from your first command, whichever is
  first; then the state blocks and a morning report at the top of `START-HERE.md` (what is live, what you saw wrong in
  your shots, what you left unshipped and why, his calls).
