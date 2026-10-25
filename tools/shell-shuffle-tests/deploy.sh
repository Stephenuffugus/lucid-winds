#!/usr/bin/env bash
# Shell Shuffle files only deploy to main (from the memory template scripts/files-only-deploy-bubblenaut.sh, 21 Oct 2026).
# main's tree + exactly the Shell Shuffle paths from the branch, built in a PRIVATE index (another session may share the
# working index). Every step gates the next. Checks read blobs from files, never `git show | grep -q` (pipefail).
# Usage: BUILD=v1.1 CARD=20261025a tools/shell-shuffle-tests/deploy.sh
# Needs /tmp/claude-1000/ss-lead/portal.diff.sha (sha256 of the reviewed portal diff) and deploy-msg.txt (@BR@ = branch sha).
set -euo pipefail
: "${BUILD:?}" "${CARD:?}"
L=/tmp/claude-1000/ss-lead
cd /workspaces/lucid-winds
git fetch -q origin main
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "STOP: main has commits the branch lacks; merge first"; exit 1; }
BR=$(git rev-parse HEAD); MAIN=$(git rev-parse origin/main); SHORT=$(git rev-parse --short=9 HEAD)
mapfile -t PATHS < <(git diff --name-only "$MAIN" "$BR" -- satellites/shell-shuffle portal/index.html portal/catalog-tags.json)
echo "deploy set: ${#PATHS[@]} files: ${PATHS[*]}"
[ "$(git diff "$MAIN" "$BR" -- portal/index.html portal/catalog-tags.json | sha256sum | cut -c1-64)" = "$(cat $L/portal.diff.sha)" ] \
  || { echo "STOP: the portal diff is not the reviewed one"; exit 1; }
export GIT_INDEX_FILE=$L/deploy.index; rm -f "$GIT_INDEX_FILE"
git read-tree "$MAIN"
for p in "${PATHS[@]}"; do
  mode=$(git ls-tree "$BR" -- "$p" | awk '{print $1}')
  if [ -z "$mode" ]; then git update-index --force-remove -- "$p"; continue; fi
  blob=$(git rev-parse "$BR:$p"); git update-index --add --cacheinfo "$mode,$blob,$p"
done
TREE=$(git write-tree); unset GIT_INDEX_FILE
sed "s/@BR@/$SHORT/" $L/deploy-msg.txt > $L/deploy-msg.final.txt
C=$(git commit-tree "$TREE" -p "$MAIN" -F $L/deploy-msg.final.txt)
diff <(git diff --name-only "$MAIN" "$C" | sort) <(printf '%s\n' "${PATHS[@]}" | sort)
[ "$(git rev-parse "$C:satellites/shell-shuffle")" = "$(git rev-parse "$BR:satellites/shell-shuffle")" ] || { echo "STOP: deployed folder differs from the branch"; exit 1; }
T=$L/deploy-check; rm -rf "$T"; mkdir -p "$T"
git show "$C:satellites/shell-shuffle/index.html" > "$T/page.html"
git show "$C:portal/index.html" > "$T/portal.html"
git show "$C:portal/catalog-tags.json" > "$T/catalog.json"
grep -q "const BUILD='$BUILD';" "$T/page.html"
grep -q "/satellites/shell-shuffle/?v=$CARD" "$T/portal.html"
grep -q "/satellites/shell-shuffle/?v=$CARD" "$T/catalog.json"
echo "deploy commit $C verified; pushing to main"
git push origin "$C:main"
echo "$C" > $L/deploy.sha
