#!/usr/bin/env bash
# Shutterbug's card on the arcade, under In Development (Stephen, 30 Oct 2026: "make it live on the sky wolf studios
# arcade behind the in development and i can try it there"). Files only, the deploy.sh recipe: main's tree plus exactly
# portal/index.html from the branch, built in a PRIVATE index, pushed as one commit on main, then merged back.
#
# It STOPs unless the branch's portal differs from main's by the card alone: lines added and none removed, every added
# line a // comment but one, that one the Shutterbug row, beta:true (the In Development tab; launching it asks for the
# tester key once per device), and its ?v= the SB.BUILD main serves now. So run it AFTER the game's own deploy.sh: the
# card opens the build it names. The game page itself never loads /dev-gate.js (a shared room's link must open for
# whoever it is sent to); the card is the only gate.
#
#   tools/shutterbug-tests/portal-card.sh                   check, build, pin, push, merge back
#   DRY=1 tools/shutterbug-tests/portal-card.sh             every check and the commit, nothing pushed
#   tools/shutterbug-tests/portal-card.sh --prove <commit>  curl only, one probe at a time: the host serves that
#                                                           commit's portal/index.html on both origins
set -euo pipefail
L=/tmp/claude-1000/shutterbug-lead; mkdir -p "$L"
cd /workspaces/lucid-winds
P=portal/index.html

if [ "${1:-}" = "--prove" ]; then
  C="${2:?the portal deploy commit}"; INTERVAL="${INTERVAL:-60}"; MAX="${MAX:-10}"
  WANT=$(git show "$C:$P" | sha256sum | cut -c1-64)
  echo "want $WANT (git show ${C:0:9}:$P)"
  for i in $(seq 1 "$MAX"); do
    ok=1; line=""
    for host in lucidwinds.com www.lucidwinds.com; do
      body=$(mktemp)
      code=$(curl -s -o "$body" -w '%{http_code}' -A "Mozilla/5.0" "https://$host/portal/index.html?x=$RANDOM$RANDOM" || true)
      got=$(sha256sum < "$body" | cut -c1-64); card=$(grep -c 'nm:"Shutterbug"' "$body" || true); rm -f "$body"
      line="$line $host HTTP $code ${got:0:16} card $card;"
      [ "$code" = "200" ] && [ "$got" = "$WANT" ] || ok=0
    done
    echo "probe $i at $(date -u +%H:%M:%S) UTC:$line"
    if [ "$ok" = "1" ]; then echo "LIVE on both origins: the arcade serves the card ($WANT)"; exit 0; fi
    [ "$i" -lt "$MAX" ] && sleep "$INTERVAL"
  done
  echo "NOT LIVE yet (last probe at $(date -u +%H:%M:%S) UTC) for ${C:0:9}"; exit 1
fi

git fetch -q origin main
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "STOP: main has commits the branch lacks; merge origin/main first"; exit 1; }
git diff --quiet HEAD -- "$P" || { echo "STOP: $P has uncommitted changes; commit the card first"; exit 1; }
BR=$(git rev-parse HEAD); MAIN=$(git rev-parse origin/main); SHORT=$(git rev-parse --short=9 HEAD)

# the build main serves now: the card's ?v= must name it (the game deploys first)
git show "$MAIN:satellites/shutterbug/index.html" > "$L/card-live-index.html"
LIVE_BUILD=$(grep -o "SB.BUILD = '[^']*'" "$L/card-live-index.html" | head -1 | sed "s/SB.BUILD = '\(.*\)'/\1/" || true)
[ -n "$LIVE_BUILD" ] || { echo "STOP: main serves no Shutterbug page with an SB.BUILD"; exit 1; }

# the diff: the card alone
git show "$MAIN:$P" > "$L/portal-main.html"; git show "$BR:$P" > "$L/portal-branch.html"
diff "$L/portal-main.html" "$L/portal-branch.html" > "$L/portal.diff" || true
[ -s "$L/portal.diff" ] || { echo "nothing to deploy: main's portal already equals the branch's"; exit 0; }
if grep -q '^<' "$L/portal.diff"; then echo "STOP: the branch's portal removes or changes lines of main's:"; grep '^<' "$L/portal.diff" | head -5; exit 1; fi
grep '^>' "$L/portal.diff" | sed 's/^> //' > "$L/portal-added.txt"
ROWS=$(grep -c '^ *{nm:' "$L/portal-added.txt" || true)
OTHER=$(grep -v -c -E '^ *(//|\{nm:"Shutterbug",)' "$L/portal-added.txt" || true)
[ "$ROWS" = "1" ] && [ "$OTHER" = "0" ] || { echo "STOP: the added lines are not the card alone ($ROWS rows, $OTHER lines neither the row nor a comment)"; exit 1; }
grep -q 'beta:true' "$L/portal-added.txt" || { echo "STOP: the card is not beta:true (it would open for everyone, not under In Development)"; exit 1; }
grep -q "url:\"/satellites/shutterbug/?v=$LIVE_BUILD\"" "$L/portal-added.txt" || { echo "STOP: the card's ?v= is not the live build $LIVE_BUILD (deploy the game first, or fix the row)"; exit 1; }

# the branch's list still evaluates, with exactly one Shutterbug row, and every advertised count stays true
node -e "
const s = require('fs').readFileSync('$L/portal-branch.html', 'utf8'), a = s.indexOf('var FEATURED = ['), b = s.indexOf('\n];', a);
const F = new Function(s.slice(a, b + 3) + '\nreturn FEATURED;')(), g = F.filter(x => x.nm === 'Shutterbug');
if (g.length !== 1 || g[0].beta !== true || g[0].cat !== 'action') { console.log('STOP: the list holds ' + g.length + ' Shutterbug rows'); process.exit(1); }
console.log('the list evaluates: ' + F.length + ' entries, ' + F.filter(x => x.beta).length + ' in development, the Shutterbug row ' + g[0].url);
"
node scripts/advertised_count_check.mjs > "$L/advertised.out" 2>&1 || { tail -12 "$L/advertised.out"; echo "STOP: an advertised count is no longer true"; exit 1; }
echo "the advertised counts stay true"

export GIT_INDEX_FILE=$L/portal.index; rm -f "$GIT_INDEX_FILE"
git read-tree "$MAIN"
mode=$(git ls-tree "$BR" -- "$P" | awk '{print $1}'); blob=$(git rev-parse "$BR:$P")
git update-index --add --cacheinfo "$mode,$blob,$P"
TREE=$(git write-tree); unset GIT_INDEX_FILE
C=$(git commit-tree "$TREE" -p "$MAIN" -m "Shutterbug on the arcade under In Development (tester key gated), $LIVE_BUILD (files only): $P from add-sproing-jumper $SHORT")
[ "$(git diff --name-only "$MAIN" "$C")" = "$P" ] || { echo "STOP: the commit changes more than $P"; exit 1; }
[ "$(git rev-parse "$C:$P")" = "$blob" ] || { echo "STOP: the commit's portal differs from the branch's"; exit 1; }

if [ "${DRY:-}" = "1" ]; then echo "DRY=1: portal commit $C verified (the card alone, $LIVE_BUILD); nothing pushed"; exit 0; fi
# the pre deploy pin: what the host serves now, both origins, one probe at a time, curl only
for host in lucidwinds.com www.lucidwinds.com; do
  code=$(curl -s -o "$L/portal-pre-$host.html" -w '%{http_code}' -A "Mozilla/5.0" "https://$host/portal/index.html?pin=$RANDOM$RANDOM" || true)
  echo "pre deploy pin $host: HTTP $code $(sha256sum < "$L/portal-pre-$host.html" | cut -c1-16), card rows $(grep -c 'nm:"Shutterbug"' "$L/portal-pre-$host.html" || true)"
done
echo "portal commit $C verified (the card alone, $LIVE_BUILD); pushing to main"
git push origin "$C:main"
echo "$C" > "$L/portal.sha"
git merge -q --no-edit "$C" && echo "main merged back into the branch; prove it: tools/shutterbug-tests/portal-card.sh --prove $C"
