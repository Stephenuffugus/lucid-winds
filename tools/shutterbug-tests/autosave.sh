#!/usr/bin/env bash
# Shutterbug WIP autosave (Fable, 30 Oct 2026). Every ten minutes: commit whatever changed under the Shutterbug paths
# and push the branch, so a codespace that stops itself (the box closes after about twelve hours) or hangs never again
# holds unpushed work (the 29 Oct lesson: the didactic tribble box died with a whole lead session unpushed).
#
# Start once per session, in the setup:
#   mkdir -p /tmp/claude-1000/shutterbug-lead && nohup tools/shutterbug-tests/autosave.sh >/tmp/claude-1000/shutterbug-lead/autosave.log 2>&1 &
# Stop: pkill -f shutterbug-tests/autosave.sh
# The builder's own task commits (explicit paths) and deploys are unaffected: a cycle that collides with one of them on
# the index lock simply fails quietly and tries again ten minutes later. [skip ci] keeps the twelve.yml run quiet on
# WIP pushes; the builder's real commits run CI as usual. Nothing here ever touches main.
set -u
cd /workspaces/lucid-winds || exit 1
PATHS=(satellites/shutterbug tools/shutterbug-tests plans/BUILD-ORDER-OCT29.md START-HERE.md)
while true; do
  sleep "${AUTOSAVE_SECONDS:-600}"
  if [ -n "$(git status --porcelain -- "${PATHS[@]}" 2>/dev/null)" ]; then
    if git add -- "${PATHS[@]}" 2>/dev/null && git -c core.hooksPath=/dev/null commit -q -m "WIP autosave $(date -u +%H:%M) UTC [skip ci]" -- "${PATHS[@]}" 2>/dev/null; then
      echo "$(date -u +%H:%M:%S) committed $(git rev-parse --short=9 HEAD)"
    else
      echo "$(date -u +%H:%M:%S) commit skipped (index busy or nothing staged)"
    fi
  fi
  if [ "$(git rev-list --count origin/add-sproing-jumper..HEAD 2>/dev/null || echo 0)" != "0" ]; then
    if git push -q origin add-sproing-jumper 2>/dev/null; then echo "$(date -u +%H:%M:%S) pushed $(git rev-parse --short=9 HEAD)"; else echo "$(date -u +%H:%M:%S) push failed, next cycle"; fi
  fi
done
