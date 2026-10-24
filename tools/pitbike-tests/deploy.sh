#!/usr/bin/env bash
# Pit Bike Rally files-only deploy to main (24 Oct 2026, from memory scripts/files-only-deploy-pitbike.sh): main's tree plus
# exactly the satellites/pitbike-rally paths from the branch, built in a PRIVATE index (two sessions share one git index).
# Usage: deploy.sh <upstream short hash the vendor stamped> <file under src-HASH> <one line only this build has>
#        message in $SP/msg.txt (@BR@ = the branch's short sha); SP defaults to /tmp/claude-1000/pb-deploy
set -euo pipefail
HASH="$1"; WANTF="$2"; WANT="$3"; SP=${SP:-/tmp/claude-1000/pb-deploy}
cd /workspaces/lucid-winds
git fetch -q origin main
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "STOP: main has commits the branch lacks; merge first"; exit 1; }
BR=$(git rev-parse HEAD); MAIN=$(git rev-parse origin/main); SHORT=$(git rev-parse --short=9 HEAD)
mapfile -t PATHS < <(git diff --name-only "$MAIN" "$BR" -- satellites/pitbike-rally)
echo "deploy set: ${#PATHS[@]} files"
[ "${#PATHS[@]}" -gt 0 ] || { echo "STOP: nothing to deploy"; exit 1; }
mkdir -p "$SP"; export GIT_INDEX_FILE=$SP/deploy.index; rm -f "$GIT_INDEX_FILE"
git read-tree "$MAIN"
for p in "${PATHS[@]}"; do
  mode=$(git ls-tree "$BR" -- "$p" | awk '{print $1}')
  if [ -z "$mode" ]; then git update-index --force-remove -- "$p"; continue; fi
  blob=$(git rev-parse "$BR:$p"); git update-index --add --cacheinfo "$mode,$blob,$p"
done
TREE=$(git write-tree); unset GIT_INDEX_FILE
sed "s/@BR@/$SHORT/" "$SP/msg.txt" > "$SP/msg.final.txt"
C=$(git commit-tree "$TREE" -p "$MAIN" -F "$SP/msg.final.txt")
diff <(git diff --name-only "$MAIN" "$C" | sort) <(printf '%s\n' "${PATHS[@]}" | sort)
T=$SP/check; rm -rf "$T"; mkdir -p "$T"
git show "$C:satellites/pitbike-rally/index.html" > "$T/page.html"
grep -q "src-$HASH/main.js?v=$HASH" "$T/page.html"
grep -q 'id="btn-restart"' "$T/page.html"
git show "$C:satellites/pitbike-rally/src-$HASH/$WANTF" > "$T/want.js"
grep -qF "$WANT" "$T/want.js"
git cat-file -e "$C:satellites/pitbike-rally/data/seasons.json"
git show "$C:satellites/pitbike-rally/data/economy.json" > "$T/economy.json"
grep -q '"tt"' "$T/economy.json"
for old in dly17 60146e4 5dbb16b; do git cat-file -e "$C:satellites/pitbike-rally/src-$old/main.js"; done   # cached index pages keep working
echo "deploy commit $C verified; pushing to main"
git push origin "$C:main"
echo "$C" > "$SP/deploy.sha"
