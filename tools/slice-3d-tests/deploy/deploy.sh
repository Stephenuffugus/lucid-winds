#!/usr/bin/env bash
# Super Slice files-only deploy to main (from the memory template): main's tree + the slice-3d paths and the portal card, in a PRIVATE index.
set -euo pipefail
SP=${SP:-/tmp/claude-1000/ss-deploy}   # state dir: msg.txt + want_build want_swreg want_cache want_card want_code (one line each), see README
cd /workspaces/lucid-winds
git fetch -q origin main
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "STOP: main has commits the branch lacks; merge first"; exit 1; }
BR=$(git rev-parse HEAD); MAIN=$(git rev-parse origin/main); SHORT=$(git rev-parse --short=9 HEAD)
mapfile -t PATHS < <(git diff --name-only "$MAIN" "$BR" -- satellites/slice-3d portal/index.html)
echo "deploy set: ${#PATHS[@]} files: ${PATHS[*]}"
PD=$(git diff "$MAIN" "$BR" -- portal/index.html | grep '^[-+] ' | cut -c2- | sed 's/?v=2026[0-9a-z]*//' | sort -u | wc -l)
[ "$PD" = "1" ] || { echo "STOP: the portal diff is more than the Super Slice stamp"; exit 1; }
export GIT_INDEX_FILE=$SP/deploy.index; rm -f "$GIT_INDEX_FILE"
git read-tree "$MAIN"
for p in "${PATHS[@]}"; do
  mode=$(git ls-tree "$BR" -- "$p" | awk '{print $1}')
  if [ -z "$mode" ]; then git update-index --force-remove -- "$p"; continue; fi
  blob=$(git rev-parse "$BR:$p"); git update-index --add --cacheinfo "$mode,$blob,$p"
done
TREE=$(git write-tree); unset GIT_INDEX_FILE
sed "s/@BR@/$SHORT/" $SP/msg.txt > $SP/msg.final.txt
C=$(git commit-tree "$TREE" -p "$MAIN" -F $SP/msg.final.txt)
diff <(git diff --name-only "$MAIN" "$C" | sort) <(printf '%s\n' "${PATHS[@]}" | sort)
T=$SP/check; rm -rf "$T"; mkdir -p "$T"
git show "$C:satellites/slice-3d/index.html" > "$T/page.html"; git show "$C:satellites/slice-3d/sw.js" > "$T/sw.js"; git show "$C:portal/index.html" > "$T/portal.html"
grep -q "$(cat $SP/want_build)" "$T/page.html"
grep -q "$(cat $SP/want_swreg)" "$T/page.html"
grep -q "$(cat $SP/want_cache)" "$T/sw.js"
grep -q "$(cat $SP/want_card)" "$T/portal.html"
grep -q "$(cat $SP/want_code)" "$T/page.html"
echo "deploy commit $C verified; pushing to main"
git push origin "$C:main"
echo "$C" > $SP/deploy.sha
