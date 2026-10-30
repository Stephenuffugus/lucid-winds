#!/usr/bin/env bash
# Host proof for a Shutterbug deploy (BUILD-PLAN T0.18): curl only, one probe at a time, never a headless browser
# against the host (its bot check answers them with a 403 and can block the box's address). Each probe fetches
# index.html with a random query from lucidwinds.com, then www.lucidwinds.com, and compares the sha256 with the deploy
# commit's blob. Probes every INTERVAL seconds (default 120), at most MAX probes (default 10); prints LIVE with both
# hashes, or NOT LIVE with the last probe's time.
#
#   tools/shutterbug-tests/hostproof.sh <deploy commit>
set -u
C="${1:?deploy commit}"
INTERVAL="${INTERVAL:-120}"; MAX="${MAX:-10}"
cd /workspaces/lucid-winds || exit 1
WANT=$(git show "$C:satellites/shutterbug/index.html" | sha256sum | cut -c1-64)
echo "want $WANT (git show ${C:0:9}:satellites/shutterbug/index.html)"
for i in $(seq 1 "$MAX"); do
  ok=1; line=""
  for host in lucidwinds.com www.lucidwinds.com; do
    body=$(mktemp)
    code=$(curl -s -o "$body" -w '%{http_code}' -A "Mozilla/5.0" "https://$host/satellites/shutterbug/index.html?x=$RANDOM$RANDOM" || true)
    got=$(sha256sum < "$body" | cut -c1-64); rm -f "$body"
    line="$line $host HTTP $code $got;"
    [ "$code" = "200" ] && [ "$got" = "$WANT" ] || ok=0
  done
  echo "probe $i at $(date -u +%H:%M:%S) UTC:$line"
  if [ "$ok" = "1" ]; then echo "LIVE on both origins: $WANT"; exit 0; fi
  [ "$i" -lt "$MAX" ] && sleep "$INTERVAL"
done
echo "NOT LIVE (deploy lag, last probe at $(date -u +%H:%M:%S) UTC) for deploy ${C:0:9}"
exit 1
