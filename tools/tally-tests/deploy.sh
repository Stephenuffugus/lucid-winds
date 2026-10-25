#!/usr/bin/env bash
# Tally files only deploy to main (from the memory template scripts/files-only-deploy-bubblenaut.sh, 21 Oct 2026).
# main's tree + exactly the Tally paths from the branch, built in a PRIVATE index (another session may share the
# working index). The vendored folder ships whole: an empty ls-tree on the branch becomes a removal (the Vite bundle is
# hashed, so every vendor renames it). Every step gates the next. Checks read blobs from files, never `git show | grep -q`.
# Usage: BUILD=t0 CACHE=tally-v2 SWV=2 CARD=20261025a tools/tally-tests/deploy.sh
# Needs /tmp/claude-1000/tally-lead/portal.diff.sha (sha256 of the reviewed portal diff) and deploy-msg.txt (@BR@ = branch sha).
set -euo pipefail
: "${BUILD:?}" "${CACHE:?}" "${SWV:?}" "${CARD:?}"
L=/tmp/claude-1000/tally-lead
cd /workspaces/lucid-winds
git fetch -q origin main
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "STOP: main has commits the branch lacks; merge first"; exit 1; }
BR=$(git rev-parse HEAD); MAIN=$(git rev-parse origin/main); SHORT=$(git rev-parse --short=9 HEAD)
mapfile -t PATHS < <(git diff --name-only "$MAIN" "$BR" -- satellites/tally portal/index.html portal/catalog-tags.json)
echo "deploy set: ${#PATHS[@]} files"
[ "$(git diff "$MAIN" "$BR" -- portal/index.html portal/catalog-tags.json | sha256sum | cut -c1-64)" = "$(cat $L/portal.diff.sha)" ] \
  || { echo "STOP: the portal diff is not the reviewed one"; exit 1; }
export GIT_INDEX_FILE=$L/deploy.index; rm -f "$GIT_INDEX_FILE"
git read-tree "$MAIN"
# An old hashed bundle stays on main: index.html is served max-age=300 with stale-while-revalidate=86400 (.htaccess),
# so a browser may show yesterday's index once more, and it asks for yesterday's bundle (a 404 there is a blank page).
KEPT=()
for p in "${PATHS[@]}"; do
  mode=$(git ls-tree "$BR" -- "$p" | awk '{print $1}')
  if [ -z "$mode" ]; then
    case "$p" in satellites/tally/assets/index-*.js) KEPT+=("$p"); echo "keep on main: $p"; continue;; esac
    git update-index --force-remove -- "$p"; continue; fi
  blob=$(git rev-parse "$BR:$p"); git update-index --add --cacheinfo "$mode,$blob,$p"
done
TREE=$(git write-tree); unset GIT_INDEX_FILE
sed "s/@BR@/$SHORT/" $L/deploy-msg.txt > $L/deploy-msg.final.txt
C=$(git commit-tree "$TREE" -p "$MAIN" -F $L/deploy-msg.final.txt)
# proof before the push: the commit changes exactly the deploy set, the deployed folder equals the branch's, the values are in it
keep() { if [ ${#KEPT[@]} -eq 0 ]; then cat; else grep -v -x -F -f <(printf '%s\n' "${KEPT[@]}"); fi; }
diff <(git diff --name-only "$MAIN" "$C" | sort) <(printf '%s\n' "${PATHS[@]}" | keep | sort)
diff <(git ls-tree -r --name-only "$C" -- satellites/tally | keep) <(git ls-tree -r --name-only "$BR" -- satellites/tally) \
  || { echo "STOP: deployed folder differs from the branch beyond the kept bundles"; exit 1; }
for f in $(git ls-tree -r --name-only "$BR" -- satellites/tally); do
  [ "$(git rev-parse "$C:$f")" = "$(git rev-parse "$BR:$f")" ] || { echo "STOP: $f differs"; exit 1; }; done
T=$L/deploy-check; rm -rf "$T"; mkdir -p "$T"
git show "$C:satellites/tally/index.html" > "$T/page.html"
git show "$C:satellites/tally/sw.js" > "$T/sw.js"
git show "$C:satellites/tally/VENDORED.json" > "$T/vendored.json"
git show "$C:portal/index.html" > "$T/portal.html"
git show "$C:portal/catalog-tags.json" > "$T/catalog.json"
JS=$(grep -o 'assets/index-[A-Za-z0-9_-]*\.js' "$T/page.html" | head -1); [ -n "$JS" ]
git show "$C:satellites/tally/$JS" > "$T/bundle.js"
grep -q "\"$BUILD\"" "$T/bundle.js"
grep -q "var CACHE = \"$CACHE\";" "$T/sw.js"
grep -q "register('./sw.js?v=$SWV')" "$T/page.html"
grep -q "\"commit\": \"$(git -C /workspaces/Tally rev-parse HEAD)\"" "$T/vendored.json"
[ "$(git -C /workspaces/Tally rev-parse HEAD)" = "$(git -C /workspaces/Tally rev-parse origin/main)" ] || { echo "STOP: upstream HEAD is not pushed"; exit 1; }
grep -q "/satellites/tally/?v=$CARD" "$T/portal.html"
grep -q "/satellites/tally/?v=$CARD" "$T/catalog.json"
echo "deploy commit $C verified; pushing to main"
git push origin "$C:main"
echo "$C" > $L/deploy.sha
