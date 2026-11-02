#!/usr/bin/env bash
# Dewball dewball-v36 to main, FILES ONLY: main's tree plus exactly the satellites/dewball paths that differ between
# main and the branch commit below (Starfall Bay, The Whole World and Dream Meadow in models, the speck LOD rule, the
# stamp). Nothing outside satellites/dewball rides along. Built in a private index (the Shutterbug recipe).
#
# Stephen runs it at an idle prompt, from anywhere:   ! bash /home/codespace/dewball-drafts/deploy-dewball-v36.sh
#
# STEP 0, THE VAULT FIRST (FORGE.md's law): the 1,335 credits of Meshy originals for w5 w6 w7 exist only on this box.
# This script makes the private vault release before it deploys. The codespace's own token cannot see the private
# vault, so it needs YOUR GitHub login once, without the codespace token in the way:
#     ! env -u GITHUB_TOKEN gh auth login -h github.com -p https -w
# (it prints a code and a link; open the link, paste the code). Then run this script again.
# To ship WITHOUT the vault (the originals stay only on this box until you do it), run it with VAULT_LATER=1.
set -euo pipefail
BR_COMMIT=${BR_COMMIT:-afa458f651010952e7331492feea92282026b81e}   # dewball-w567, Play readiness
REPO=/workspaces/lucid-winds
VAULT=Stephenuffugus/lucid-winds-vault
TAG=meshy-dewball-w567-20261101
L=/home/codespace/dewball-drafts/deploy-v36; mkdir -p "$L"
cd "$REPO"

# ---- 0. the vault ---------------------------------------------------------------------------------------------
if env -u GITHUB_TOKEN gh release view "$TAG" --repo "$VAULT" > /dev/null 2>&1; then
  echo "vault: release $TAG is already there"
elif env -u GITHUB_TOKEN gh repo view "$VAULT" > /dev/null 2>&1; then
  echo "vault: making release $TAG (271 files, 288 MB; takes a few minutes)"
  CMD=$(sed -n '/^gh release create/,/^$/p' /home/codespace/dewball-drafts/VAULT-PENDING.txt)
  [ -n "$CMD" ] || { echo "STOP: no release command in VAULT-PENDING.txt"; exit 1; }
  (cd /home/codespace/dewball-drafts && env -u GITHUB_TOKEN bash -c "$CMD")
  N=$(env -u GITHUB_TOKEN gh release view "$TAG" --repo "$VAULT" --json assets --jq '.assets | length')
  echo "vault: release $TAG holds $N files"
  [ "$N" -ge 271 ] || { echo "STOP: the vault release holds $N files, 271 expected"; exit 1; }
elif [ "${VAULT_LATER:-}" = "1" ]; then
  echo "vault: NOT MADE (VAULT_LATER=1). The paid originals stay only on this box; run this script again after the login."
else
  echo "STOP: your GitHub login cannot see $VAULT yet. Run this once, then this script again:"
  echo "    ! env -u GITHUB_TOKEN gh auth login -h github.com -p https -w"
  echo "(or VAULT_LATER=1 to ship first and vault later)"
  exit 1
fi

# ---- 1. the deploy commit ---------------------------------------------------------------------------------------
git fetch -q origin main
MAIN=$(git rev-parse origin/main)
git cat-file -e "$BR_COMMIT^{commit}" || { echo "STOP: $BR_COMMIT is not in this repo (fetch dewball-w567)"; exit 1; }
git show "$MAIN:satellites/dewball/sw.js" > "$L/live-sw.js"
LIVE=$(grep -o 'dewball-v[0-9]*' "$L/live-sw.js" | head -1)
git show "$BR_COMMIT:satellites/dewball/sw.js" > "$L/new-sw.js"
NEW=$(grep -o 'dewball-v[0-9]*' "$L/new-sw.js" | head -1)
[ "$NEW" = "dewball-v36" ] || { echo "STOP: the branch's sw.js says $NEW, not dewball-v36"; exit 1; }
[ "$LIVE" != "$NEW" ] || { echo "STOP: main already serves $NEW"; exit 1; }
echo "live on main: $LIVE; deploying $NEW from $BR_COMMIT"
mapfile -t PATHS < <(git diff --name-only "$MAIN" "$BR_COMMIT" -- satellites/dewball)
[ "${#PATHS[@]}" -gt 0 ] || { echo "nothing to deploy"; exit 0; }
echo "deploy set: ${#PATHS[@]} paths under satellites/dewball"
export GIT_INDEX_FILE=$L/deploy.index; rm -f "$GIT_INDEX_FILE"
git read-tree "$MAIN"
for p in "${PATHS[@]}"; do
  mode=$(git ls-tree "$BR_COMMIT" -- "$p" | awk '{print $1}')
  if [ -z "$mode" ]; then git update-index --force-remove -- "$p"; echo "remove on main: $p"; continue; fi
  git update-index --add --cacheinfo "$mode,$(git rev-parse "$BR_COMMIT:$p"),$p"
done
TREE=$(git write-tree); unset GIT_INDEX_FILE
C=$(git commit-tree "$TREE" -p "$MAIN" -m "Dewball dewball-v36 (files only): Starfall Bay, The Whole World and Dream Meadow in models from his Astra pictures, the speck LOD rule, the globe signs, Play readiness; from dewball-w567 ${BR_COMMIT:0:9}")
# proof before the push: only satellites/dewball moves, and it equals the branch there
if git diff --name-only "$MAIN" "$C" | grep -v '^satellites/dewball/'; then echo "STOP: a path outside satellites/dewball is in the deploy"; exit 1; fi
[ -z "$(git diff --name-only "$C" "$BR_COMMIT" -- satellites/dewball)" ] || { echo "STOP: satellites/dewball on the deploy differs from the branch"; exit 1; }
git show "$C:satellites/dewball/index.html" > "$L/page.html"
grep -q 'var ASSET_V="24";' "$L/page.html" || { echo "STOP: the page's ASSET_V is not 24"; exit 1; }
grep -q 'register("sw.js?v=24")' "$L/page.html" || { echo "STOP: the page does not register sw.js?v=24"; exit 1; }
node -e "const fs=require('fs'),vm=require('vm');const h=fs.readFileSync('$L/page.html','utf8');const re=/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;let m;while((m=re.exec(h)))new vm.Script(m[1]);console.log('page scripts parse')"
echo "deploy commit $C; pushing to main"
git push -q origin "$C:refs/heads/main"
echo "PUSHED $C"

# ---- 2. read it back from the host, one probe each (a burst gets the box banned) ----------------------------------
sleep 60
for host in lucidwinds.com www.lucidwinds.com; do
  for f in sw.js index.html assets/3d/index.json; do
    got=$(curl -sA "Mozilla/5.0" "https://$host/satellites/dewball/$f?probe=$RANDOM" | sha256sum | cut -c1-16)
    want=$(git show "$C:satellites/dewball/$f" | sha256sum | cut -c1-16)
    [ "$got" = "$want" ] && echo "host $host $f equal" || echo "host $host $f DIFFERS (Hostinger may still be deploying; probe again in a few minutes)"
    sleep 3
  done
done
echo "DONE. Tell the lead the commit: $C"
