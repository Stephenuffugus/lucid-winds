#!/usr/bin/env bash
# Shutterbug files only deploy to main (from the Tally recipe tools/tally-tests/deploy.sh, 29 Oct 2026).
#
# main's tree + exactly the SERVED set of satellites/shutterbug from the branch, built in a PRIVATE index (another
# session may share the working index). Served set: index.html, manifest.json, sw.js, icons/. The docs, harness.js,
# fixtures/ and tools/ never leave the branch. Music never enters git: .gitignore ignores every directory named
# music/, and the soundtrack lives in its own private repo that Hostinger deploys to /music/ on the host (an M3
# question for Stephen). Every step gates the next. Checks read blobs from files, never `git show | grep -q`. A blob
# that is not on the branch becomes a removal on main.
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
# Every stamp must move (BUILD-PLAN T0.18): read the live ones from main's blobs (into files, never a pipe into grep -q)
# and STOP when any equals the new value. A first deploy has no blob on main: the comparison is skipped and said.
if git cat-file -e "$MAIN:satellites/shutterbug/index.html" 2>/dev/null; then
  git show "$MAIN:satellites/shutterbug/index.html" > "$L/live-index.html"
  LIVE_BUILD=$(grep -o "SB.BUILD = '[^']*'" "$L/live-index.html" | head -1 | sed "s/SB.BUILD = '\(.*\)'/\1/" || true)
  [ "$LIVE_BUILD" != "$BUILD" ] || { echo "STOP: BUILD $BUILD equals the live stamp on main; bump it"; exit 1; }
  LIVE_SWV=$(grep -o "sw.js?v=[0-9A-Za-z._-]*" "$L/live-index.html" | head -1 | sed 's/sw.js?v=//' || true)
  if [ -n "${SWV:-}" ] && [ -n "$LIVE_SWV" ] && [ "$LIVE_SWV" = "$SWV" ]; then echo "STOP: SWV $SWV equals the live registration stamp; bump it"; exit 1; fi
  LIVE_CACHE=""
  if git cat-file -e "$MAIN:satellites/shutterbug/sw.js" 2>/dev/null; then
    git show "$MAIN:satellites/shutterbug/sw.js" > "$L/live-sw.js"
    LIVE_CACHE=$(grep -o "shutterbug-v[0-9A-Za-z._-]*" "$L/live-sw.js" | head -1 || true)
    if [ -n "${CACHE:-}" ] && [ "$LIVE_CACHE" = "$CACHE" ]; then echo "STOP: CACHE $CACHE equals the live cache name; bump it"; exit 1; fi
  fi
  echo "live stamps on main: BUILD $LIVE_BUILD${LIVE_SWV:+, sw.js?v=$LIVE_SWV}${LIVE_CACHE:+, $LIVE_CACHE}; the new ones differ"
else
  echo "note: main holds no satellites/shutterbug/index.html yet (a first deploy): the stamp comparison is skipped"
fi
# The stamps move together (T1.11, section 1.5's host caching law): the page holds SB.BUILD = '$BUILD' and registers
# sw.js?v=$SWV; sw.js holds the same BUILD and CACHE shutterbug-v$SWV. A split stamp stops before anything is written.
grep -q "SB.BUILD = '$BUILD'" satellites/shutterbug/index.html || { echo "STOP: the page does not hold SB.BUILD = '$BUILD'"; exit 1; }
if [ -f satellites/shutterbug/sw.js ]; then
  : "${CACHE:?CACHE required once sw.js exists}"; : "${SWV:?SWV required once sw.js exists}"
  [ "$CACHE" = "shutterbug-v$SWV" ] || { echo "STOP: CACHE $CACHE and SWV $SWV do not move together"; exit 1; }
  grep -q "var CACHE = '$CACHE';" satellites/shutterbug/sw.js || { echo "STOP: sw.js does not hold CACHE $CACHE"; exit 1; }
  grep -q "var BUILD = '$BUILD';" satellites/shutterbug/sw.js || { echo "STOP: sw.js does not hold BUILD $BUILD"; exit 1; }
  grep -q "sw.js?v=$SWV'" satellites/shutterbug/index.html || { echo "STOP: the page does not register sw.js?v=$SWV"; exit 1; }
fi
SERVED=(satellites/shutterbug/index.html satellites/shutterbug/manifest.json satellites/shutterbug/sw.js
        satellites/shutterbug/icons)
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
if git diff --name-only "$MAIN" "$C" | grep -v -E '^satellites/shutterbug/(index\.html|manifest\.json|sw\.js|icons/)' ; then
  echo "STOP: a file outside the served set is in the deploy"; exit 1; fi
T=$L/deploy-check; rm -rf "$T"; mkdir -p "$T"
git show "$C:satellites/shutterbug/index.html" > "$T/page.html"
grep -q -- "$BUILD" "$T/page.html" || { echo "STOP: build stamp $BUILD is not in index.html"; exit 1; }
grep -q "SWS_EMBED" "$T/page.html" || { echo "STOP: no SWS_EMBED guard in index.html (fleet embed protocol)"; exit 1; }
grep -Eq "^ *window\.SWS_EXIT *= *function" "$T/page.html" || { echo "STOP: SWS_EXIT is not assigned on window (fleet exit protocol; a call site does not count)"; exit 1; }
if git cat-file -e "$C:satellites/shutterbug/sw.js" 2>/dev/null; then
  : "${CACHE:?CACHE name required once sw.js exists}" "${SWV:?SWV required once sw.js exists}"
  git show "$C:satellites/shutterbug/sw.js" > "$T/sw.js"
  grep -q -- "$CACHE" "$T/sw.js" || { echo "STOP: cache name $CACHE is not in sw.js"; exit 1; }
  grep -q -- "sw.js?v=$SWV" "$T/page.html" || { echo "STOP: the sw registration ?v=$SWV is not in index.html"; exit 1; }
else
  echo "note: no sw.js on the branch yet (M0 has no worker); CACHE and SWV not checked"
fi
# Gate the exact blob that will be served (T0.18): the lint and the fast harness against the deploy commit's page, so a
# mis stamped or stripped block is caught here, not on the host.
node satellites/shutterbug/tools/lint.mjs --page "$T/page.html" > "$T/lint.out" 2>&1 || { tail -20 "$T/lint.out"; echo "STOP: the lint fails on the deploy blob"; exit 1; }
node satellites/shutterbug/harness.js --page "$T/page.html" --fast > "$T/harness.out" 2>&1 || { grep -m 20 'FAIL' "$T/harness.out"; echo "STOP: the harness fails on the deploy blob"; exit 1; }
echo "the deploy blob passes the lint and the fast harness ($(grep -o '[0-9]* assertions in' "$T/harness.out" | head -1))"
# The pre deploy pin: what the host serves now, both origins, one probe at a time, curl only (never a headless browser).
for host in lucidwinds.com www.lucidwinds.com; do
  code=$(curl -s -o "$T/pre-$host.html" -w '%{http_code}' -A "Mozilla/5.0" "https://$host/satellites/shutterbug/index.html?pin=$RANDOM$RANDOM" || true)
  echo "pre deploy pin $host: HTTP $code $(sha256sum < "$T/pre-$host.html" | cut -c1-16)"
done
echo "deploy commit $C verified; pushing to main"
git push origin "$C:main"
echo "$C" > "$L/deploy.sha"
git merge -q --no-edit "$C" && echo "main merged back into the branch; now prove the host (see the header)"
