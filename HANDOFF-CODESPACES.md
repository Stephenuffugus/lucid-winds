# HANDOFF: codespace cleanup (executable by any model, Aug 22 2026)

Goal: free Stephen's codespace quota (~30 open) WITHOUT losing work. Nothing here
requires judgment beyond reading a table. Do every step in order. Do not skip 0.

## 0. Precondition (Stephen only)
In the Claude Code prompt he runs:
    ! env -u GITHUB_TOKEN -u GH_TOKEN gh auth refresh -h github.com -s codespace
and enters the 8-char device code at github.com/login/device.
Verify:   env -u GITHUB_TOKEN -u GH_TOKEN gh api /user/codespaces --jq .total_count
Must print a number ~30, not 2 and not a 403. If 403, stop and ask him to redo step 0.

## 1. Build the table (read-only)
    env -u GITHUB_TOKEN -u GH_TOKEN gh codespace list --limit 100 \
      --json name,repository,lastUsedAt,state,gitStatus \
      --jq '.[] | [.name,.repository,.lastUsedAt[0:10],.state,
            (if .gitStatus.hasUncommittedChanges or .gitStatus.hasUnpushedChanges then "DIRTY" else "clean" end)] | @tsv' \
      | sort -k3
Show Stephen the table. Mark KEEP on: `didactic-couscous-6x47p79v577h545w` (the one
Claude works in) and anything he names.

## 2. Delete the clean ones (safe, nothing to lose)
For every row marked `clean` and not KEEP:
    env -u GITHUB_TOKEN -u GH_TOKEN gh codespace delete -c <name>
`gh codespace delete` refuses a dirty codespace without --force, so a mistake here
fails closed.

## 3. DIRTY ones: look before deleting
For each DIRTY row, inspect without opening an editor:
    env -u GITHUB_TOKEN -u GH_TOKEN gh codespace ssh -c <name> -- \
      'cd /workspaces/* && git status --porcelain | head -30 && echo --- && git stash list && echo --- && git log --branches --not --remotes --oneline | head'
Then decide per codespace:
  - only build output / node_modules / .env / stale tracked edits → delete with --force
  - real commits or real edits → push them first:
        gh codespace ssh -c <name> -- 'cd /workspaces/* && git add -A && git commit -m "Rescue from codespace <name>" && git push origin HEAD:rescue/<name>'
    then delete. Never push a rescue branch to main.
  ⛔ `expert-palm-tree-vjq7576p7p4fxjgj` reports dirty with 0 unpushed commits, 32 behind;
    almost certainly junk from July, but LOOK (step 3) before --force.

## 4. Report
List what was deleted, what was rescued (branch names), what was kept. Save a one-line
summary to memory `reference_codespaces_cleanup_and_consolidation`.

## Going forward (tell Stephen once)
One codespace, many repos:  cd /workspaces && gh repo clone Stephenuffugus/<repo>
This box is 27G/32G; delete node_modules and /workspaces/tools (1.2G Blender) if it fills.
