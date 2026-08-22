# HANDOFF: finish the codespace cleanup (any model; written Aug 22 2026, rev 3)

⛔⛔⛔ **NO MODEL DELETES A CODESPACE. EVER.** Stephen's rule, Aug 22. Your job is RESCUE ONLY:
get the work onto a `rescue/*` branch on GitHub and verify it with `gh api`. Stephen deletes the box
himself at github.com/codespaces after he sees the branch. Any `gh codespace delete` in this file is
superseded by this line.

State when this was written: **30 → 10 codespaces.** Inspection of every box is DONE; no classification left. Scope `codespace` is already granted
to the gh login in hosts.yml. Every command below MUST be prefixed
`env -u GITHUB_TOKEN -u GH_TOKEN` (the ambient token is read-only for codespaces).
Pushes from this box need: `git -c credential.helper= -c "credential.helper=!/usr/bin/gh auth git-credential" push ...`

## Already done (do not redo)
- Deleted 11: trackfit, Hues, Blooming_Words, sws-live-site, old lucid-winds (expert-palm-tree),
  chameleon-glowup, blink, musicalboundaries, snapbinder, poems, BarBrawl.
- Rescued to `rescue/*` branches on GitHub (all verified): Attention-Protocol h1-challenge-binding
  (24 commits) + rescue/h1-work-aug22; rescue/{blink,musicalboundaries,snapbinder,poems,BarBrawl}-aug22;
  lucid-winds rescue/hush-countdown-v9 (Hush belongs to the app studio; leave it).
- KEEP, never delete: `didactic-couscous-6x47p79v577h545w` (Claude's box),
  `effective-eureka-qwvvqj655wf4j7j` (Attention-Protocol, used Aug 22),
  `animated-trout-wqgj4jrv4pvh5jvv` (Sports-R-D, used Aug 22), `supreme-lamp-vjq7576p56j2wr6g` (SWS-apps, Aug 21).

## What is left: exactly 6 boxes, ALL need a rescue before deletion (already inspected, do not re-inspect)
| codespace | repo dir | what is in it |
|---|---|---|
| automatic-space-goggles-4pw9r9jq9qg2jqq7 | lucid-winds (main, NOT shallow) | 3 real unpushed commits from Jun 23: `git format-patch origin/main..HEAD --stdout` |
| jubilant-space-funicular-p5pq6qj757p2rwgq | astravault | untracked PORTFOLIO_HANDOFF.md |
| literate-orbit-9gj4x4765w73p7v7 | bountyhunter | MASTER_PLAN.md, JOB_APPLICATIONS_2026-06-08.md, APT_TARGETS.md modified + 13 untracked (GUITAR_LESSONS, INVENTION_VAULT, FRIEND_SECOND_BRAIN_PROMPT...) = his personal docs, HIGH VALUE. Also `inspect_evals` dir, branch harden/claude-setup-trusted-restore, 1 unpushed commit |
| opulent-orbit-7jp4x4v7wvpfwpx7 | shell_shuffle | untracked shell-shuffle-handoff.zip + shell-shuffle-handoff/ |
| urban-cod-gv7wpw4xpj7c5rw | create-a-critter | 5 modified (web/src/App.jsx, api.js, CreatureViewer.jsx, package.json; docs/ARCHITECTURE.md deleted) + 5 untracked (docs/assets/...). Also `skitterlings` 3 untracked. Ignore the NONGIT `tools` dir (5579 files, a Blender install) |
| vigilant-space-couscous-xgvq4q5rqw4cvvqp | pallet_planner | untracked palette-planner.html + palette-finalize-brief.md |

Old inspection files (reference only) live in
Results land as one file per codespace in
`/tmp/claude-1000/-workspaces-lucid-winds/beb0f847-3635-40d5-9e1a-414f5f036ec2/scratchpad/cs/<name>.txt`
(a line `REPO <dir> ... unpushed_all=N tracked_mod=N untracked=N` per repo, `NONGIT <dir>` for loose dirs,
`  ST ...` lines listing dirty paths). If a file is missing or has no `REPO` line, inspect it yourself:

    B64=$(base64 -w0 /workspaces/lucid-winds/.cleanup-aug22/remote.sh)
    env -u GITHUB_TOKEN -u GH_TOKEN gh codespace ssh -c <name> -- "echo $B64 | base64 -d | bash" < /dev/null
    env -u GITHUB_TOKEN -u GH_TOKEN gh codespace stop -c <name> < /dev/null

⛔ ONE AT A TIME. Starting two codespaces at once returns HTTP 400/429. Always `< /dev/null`
on ssh (it eats stdin and kills loops). Stop each box after reading it.

## Decide per box, mechanically
1. Every REPO line has unpushed_all=0, tracked_mod=0, untracked=0 and no NONGIT line
   → report it as CLEAN. Do not delete it.
2. Any dirty/untracked/NONGIT → rescue FIRST. Inside the box (its own token is DEAD, do not push from there):
       gh codespace ssh -c <name> -- 'cd /workspaces/<repo> && git checkout -q -b rescue/<repo>-aug22 && git add -A && git -c user.name=Stephenuffugus -c user.email=99242197+Stephenuffugus@users.noreply.github.com commit -qm "Rescue from codespace <name>" && git format-patch -1 HEAD --stdout' < /dev/null > /tmp/<repo>.patch
   Then from THIS box: shallow-clone the repo into /tmp (`git clone --depth 1`), `git checkout -b rescue/<repo>-aug22`,
   `git am /tmp/<repo>.patch` (if it fails: `git am --abort`, commit the .patch file itself), push with the
   credential-helper form above, VERIFY `gh api repos/Stephenuffugus/<repo>/branches/rescue/<repo>-aug22`,
   then STOP. Report the branch name. Stephen deletes. A NONGIT dir: `cp -r` it into that box's main repo before the commit.
   ⛔ Never push to main. ⛔ `cmd | tail; echo $?` reports tail's exit, check the server instead.
3. unpushed_all>0 in a NON-shallow repo = real commits: same patch route (`git format-patch origin/<branch>..HEAD --stdout`).
   In a `shallow=true` repo that number is usually FAKE; confirm with `gh api repos/O/R/commits/<sha>`.

## Finish
Print: rescued (codespace → branch name, verified) / kept. Delete nothing. Append the tally to memory
`reference_codespaces_cleanup_and_consolidation.md` and push the memory repo.
Then tell Stephen: one codespace, many repos → `cd /workspaces && gh repo clone Stephenuffugus/<repo>`;
this box is ~29G/32G, delete node_modules or /workspaces/tools (1.2G Blender) when it fills.
