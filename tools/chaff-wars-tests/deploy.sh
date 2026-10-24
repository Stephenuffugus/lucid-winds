#!/usr/bin/env bash
# Pop N Lock files-only deploy to main (24 Oct 2026, from memory scripts/files-only-deploy-bubblenaut.sh): main's tree plus
# exactly satellites/chaff-wars and the card stamp in portal/index.html + portal/catalog-tags.json, in a PRIVATE index.
# State files in $SP (default /tmp/claude-1000/pnl-deploy): msg.txt (@BR@ = the branch sha), want_build, want_swreg,
# want_cache, want_card, want_code (one line each). Checks read blobs from files (never git show | grep -q under pipefail).
set -euo pipefail
SP=${SP:-/tmp/claude-1000/pnl-deploy}
cd /workspaces/lucid-winds
git fetch -q origin main
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "STOP: main has commits the branch lacks; merge first"; exit 1; }
BR=$(git rev-parse HEAD); MAIN=$(git rev-parse origin/main); SHORT=$(git rev-parse --short=9 HEAD)
mapfile -t PATHS < <(git diff --name-only "$MAIN" "$BR" -- satellites/chaff-wars portal/index.html portal/catalog-tags.json)
echo "deploy set: ${#PATHS[@]} files: ${PATHS[*]}"
PD=$(git diff "$MAIN" "$BR" -- portal/index.html portal/catalog-tags.json | grep '^[-+] ' | cut -c2- | sed 's/?v=pnl[0-9]*//' | sort -u | wc -l)
[ "$PD" -le 2 ] || { echo "STOP: the portal diff is more than the Pop N Lock stamp ($PD distinct lines)"; exit 1; }
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
git show "$C:satellites/chaff-wars/index.html" > "$T/page.html"; git show "$C:satellites/chaff-wars/sw.js" > "$T/sw.js"
git show "$C:portal/index.html" > "$T/portal.html"; git show "$C:portal/catalog-tags.json" > "$T/catalog.json"
grep -qF "$(cat $SP/want_build)" "$T/page.html"
grep -qF "$(cat $SP/want_swreg)" "$T/page.html"
grep -qF "$(cat $SP/want_cache)" "$T/sw.js"
grep -qF "$(cat $SP/want_card)" "$T/portal.html"
grep -qF "$(cat $SP/want_card)" "$T/catalog.json"
grep -qF "$(cat $SP/want_code)" "$T/page.html"
if [ -f "$SP/want_file" ]; then git cat-file -e "$C:$(cat $SP/want_file)"; fi   # a file this build must carry (art.json)
echo "deploy commit $C verified; pushing to main"
git push origin "$C:main"
echo "$C" > "$SP/deploy.sha"
