#!/usr/bin/env bash
# Shutterbug files only deploy to main (from the Tally recipe tools/tally-tests/deploy.sh, 29 Oct 2026).
#
# main's tree + exactly the SERVED set of satellites/shutterbug from the branch, built in a PRIVATE index (another
# session may share the working index). Served set: index.html, manifest.json, sw.js, icons/, music/. The docs,
# harness.js, fixtures/ and tools/ never leave the branch. Every step gates the next. Checks read blobs from files,
# never `git show | grep -q`. A blob that is not on the branch becomes a removal on main.
#
# Usage: BUILD=sb-m0-1 CACHE=shutterbug-v1 SWV=1 tools/shutterbug-tests/deploy.sh
#   BUILD  a stamp that must appear verbatim in index.html (the page's own BUILD constant)
#   CACHE  the service worker's cache name, must appear verbatim in sw.js (required once sw.js exists)
#   SWV    the ?v= on the sw.js registration in index.html (required once sw.js exists)
# Bump all three in the same deploy commit: new files under an old stamp split players.
#
# After the push, prove it from the host, one probe at a time, with curl (the host's bot check answers headless
# browsers with a 403 and can block the box's IP for a while):
#   curl -sA "Mozilla/5.0" "https://lucidwinds.com/satellites/shutterbug/index.html?x=$RANDOM" | sha256sum
#   git show <C>:satellites/shutterbug/index.html | sha256sum        # the two must match; then www.lucidwinds.com
set -euo pipefail
: "${BUILD:?BUILD stamp required}"
L=/tmp/claude-1000/shutterbug-lead; mkdir -p "$L"
cd /workspaces/lucid-winds
git fetch -q origin main
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "STOP: main has commits the branch lacks; merge origin/main first"; exit 1; }
BR=$(git rev-parse HEAD); MAIN=$(git rev-parse origin/main); SHORT=$(git rev-parse --short=9 HEAD)
SERVED=(satellites/shutterbug/index.html satellites/shutterbug/manifest.json satellites/shutterbug/sw.js
        satellites/shutterbug/icons satellites/shutterbug/music)
mapfile -t PATHS < <(git diff --name-only "$MAIN" "$BR" -- "${SERVED[@]}")
[ "${#PATHS[@]}" -gt 0 ] || { echo "nothing to deploy: the served set on main already equals the branch"; exit 0; }
echo "deploy set: ${#PATHS[@]} files"; printf '  %s\n' "${PATHS[@]}"
export GIT_INDEX_FILE=$L/deploy.index; rm -f "$GIT_INDEX_FILE"
git read-tree "$MAIN"
for p in "${PATHS[@]}"; do
  mode=$(git ls-tree "$BR" -- "$p" | awk '{print $1}')
  if [ -z "$mode" ]; then git update-index --force-remove -- "$p"; echo "remove on main: $p"; continue; fi
  blob=$(git rev-parse "$BR:$p"); git update-index --add --cacheinfo "$mode,$blob,$p"
done
TREE=$(git write-tree); unset GIT_INDEX_FILE
MSG="Shutterbug $BUILD (files only): the served set from add-sproing-jumper $SHORT"
C=$(git commit-tree "$TREE" -p "$MAIN" -m "$MSG")
# Proof before the push: the commit changes exactly the deploy set, every served blob equals the branch's,
# and nothing outside the served set rides along.
diff <(git diff --name-only "$MAIN" "$C" | sort) <(printf '%s\n' "${PATHS[@]}" | sort)
for f in $(git ls-tree -r --name-only "$BR" -- "${SERVED[@]}"); do
  [ "$(git rev-parse "$C:$f")" = "$(git rev-parse "$BR:$f")" ] || { echo "STOP: $f differs between the deploy and the branch"; exit 1; }
done
if git diff --name-only "$MAIN" "$C" | grep -v -E '^satellites/shutterbug/(index\.html|manifest\.json|sw\.js|icons/|music/)' ; then
  echo "STOP: a file outside the served set is in the deploy"; exit 1; fi
T=$L/deploy-check; rm -rf "$T"; mkdir -p "$T"
git show "$C:satellites/shutterbug/index.html" > "$T/page.html"
grep -q -- "$BUILD" "$T/page.html" || { echo "STOP: build stamp $BUILD is not in index.html"; exit 1; }
grep -q "SWS_EMBED" "$T/page.html" || { echo "STOP: no SWS_EMBED guard in index.html (fleet embed protocol)"; exit 1; }
grep -q "window.SWS_EXIT" "$T/page.html" || { echo "STOP: SWS_EXIT is not assigned on window (fleet exit protocol)"; exit 1; }
if git cat-file -e "$C:satellites/shutterbug/sw.js" 2>/dev/null; then
  : "${CACHE:?CACHE name required once sw.js exists}" "${SWV:?SWV required once sw.js exists}"
  git show "$C:satellites/shutterbug/sw.js" > "$T/sw.js"
  grep -q -- "$CACHE" "$T/sw.js" || { echo "STOP: cache name $CACHE is not in sw.js"; exit 1; }
  grep -q -- "sw.js?v=$SWV" "$T/page.html" || { echo "STOP: the sw registration ?v=$SWV is not in index.html"; exit 1; }
else
  echo "note: no sw.js on the branch yet (M0 has no worker); CACHE and SWV not checked"
fi
echo "deploy commit $C verified; pushing to main"
git push origin "$C:main"
echo "$C" > "$L/deploy.sha"
git merge -q --no-edit "$C" && echo "main merged back into the branch; now prove the host (see the header)"
