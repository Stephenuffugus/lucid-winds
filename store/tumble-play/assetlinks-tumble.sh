#!/bin/bash
# TUMBLE assetlinks: put Google's app signing SHA-256 (Play App Signing) into the com.skywolfstudio.tumble entry of
# /.well-known/assetlinks.json, built ON TOP OF origin/main WITHOUT a checkout (a temp index: /workspaces has ~2 GB free and
# the working branch is not main). Every other package and key is kept (flocktheworld 2, pixelpetri 3).
# usage: bash store/tumble-play/assetlinks-tumble.sh '<the SHA-256, or the whole Digital Asset Links snippet Play shows>' [--debug] [--push]
#   (no flag)  build the commit, print the diff and the counts; nothing leaves the machine
#   --debug    also add the throwaway DEBUG key (6A:6F:A0:7B...CE:70) for the sideload test (PLAY-CONSOLE-FIELDS.md step 9)
#   --push     push that commit to main (Hostinger deploys main) and to the record branch assetlinks-tumble, then read the
#              live file back gently (the host's bot rule 403s fast repeated probes); it waits with sleep, so run it in the
#              BACKGROUND in the Claude harness
# Written 4 Oct 2026 (the lead): the 27 Sep Pixel Petri edit (c988653d, done by hand) as a script.
set -euo pipefail
REPO=/workspaces/lucid-winds
FILE=.well-known/assetlinks.json
PKG=com.skywolfstudio.tumble
UPLOAD=B3:D8:89:29:E4:65:94:37:EB:4E:DD:FD:1F:26:2A:97:E6:68:1E:3D:DE:39:63:B9:18:FB:19:0C:96:41:82:C3
DEBUG=6A:6F:A0:7B:5F:F2:26:DC:20:AC:C2:5A:C4:89:A9:D8:5C:D9:41:68:A3:C3:84:62:7A:D6:D6:DE:AC:75:CE:70
g() { env -u GITHUB_TOKEN -u GH_TOKEN git -C "$REPO" -c credential.helper= -c "credential.helper=!/usr/bin/gh auth git-credential" "$@"; }

IN="${1:-}"; [ $# -gt 0 ] && shift
ADD_DEBUG=0; PUSH=0
for a in "$@"; do case "$a" in --debug) ADD_DEBUG=1 ;; --push) PUSH=1 ;; *) echo "unknown flag $a" >&2; exit 2 ;; esac; done

# every fingerprint in what he sent, upper case; our own upload and debug keys are left out (added by name, never by paste)
NEW=$(printf '%s' "$IN" | grep -o -i -E '([0-9a-f]{2}:){31}[0-9a-f]{2}' | tr 'a-f' 'A-F' | grep -v -x -e "$UPLOAD" -e "$DEBUG" | sort -u || true)
n=$(printf '%s' "$NEW" | grep -c . || true)
if [ "$n" -ne 1 ]; then echo "expected exactly ONE new fingerprint (Google's app signing key), found $n: $NEW" >&2; exit 2; fi
ADD="$NEW"; [ $ADD_DEBUG = 1 ] && ADD="$ADD"$'\n'"$DEBUG"

g fetch -q origin main
BASE=$(g rev-parse origin/main)
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
g show "$BASE:$FILE" > "$TMP/old.json"
python3 - "$TMP/old.json" "$TMP/new.json" "$PKG" "$ADD" <<'PY'
import json, sys
old, new, pkg = sys.argv[1], sys.argv[2], sys.argv[3]
add = [x for x in sys.argv[4].split('\n') if x]
d = json.load(open(old))
ent = [x for x in d if x['target']['package_name'] == pkg]
assert len(ent) == 1, 'no single tumble entry in origin/main'
fp = ent[0]['target']['sha256_cert_fingerprints']
for a in add:
    if a not in fp:
        fp.append(a)
keep = {'com.skywolfstudio.flocktheworld': 2, 'com.skywolfstudio.pixelpetri': 3}
for x in d:
    p, k = x['target']['package_name'], len(x['target']['sha256_cert_fingerprints'])
    assert keep.get(p, k) == k, ('origin/main lost keys', p, k)
    print(' ', p, k)
assert len(d) == 3, ('expected three packages', len(d))
open(new, 'w').write(json.dumps(d, indent=2) + '\n')
PY
if cmp -s "$TMP/old.json" "$TMP/new.json"; then echo "nothing to add: origin/main already lists it"; exit 0; fi

export GIT_INDEX_FILE="$TMP/index"
g read-tree "$BASE"
BLOB=$(g hash-object -w "$TMP/new.json")
g update-index --cacheinfo "100644,$BLOB,$FILE"
TREE=$(g write-tree)
unset GIT_INDEX_FILE
WHAT="Google's app signing key"; [ $ADD_DEBUG = 1 ] && WHAT="$WHAT and the debug key for the sideload test"
COMMIT=$(printf '%s\n\n%s\n%s\n' "assetlinks: TUMBLE gets $WHAT; flocktheworld and pixelpetri unchanged" \
  "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" "Claude-Session: https://claude.ai/code/session_017oVGpTiQJW83jm5Fc98aQ7" \
  | g commit-tree "$TREE" -p "$BASE")
echo "commit $COMMIT on origin/main $BASE"
g diff "$BASE" "$COMMIT"
[ $PUSH = 1 ] || { echo "built, NOT pushed (add --push to deploy)"; exit 0; }

g push -q origin "$COMMIT:refs/heads/main"
g push -q -f origin "$COMMIT:refs/heads/assetlinks-tumble"
echo "pushed $COMMIT to main at $(date -u +%H:%M:%S) UTC; reading back every 45 s"
U="https://lucidwinds.com/$FILE"
for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 45
  body=$(curl -s "$U?r=$RANDOM$RANDOM" || true)
  if printf '%s' "$body" | grep -q "$NEW"; then
    echo "LIVE with ?r= after about $((i * 45)) s:"
    printf '%s' "$body" | python3 -c "import json,sys; [print(' ', x['target']['package_name'], len(x['target']['sha256_cert_fingerprints'])) for x in json.load(sys.stdin)]"
    if curl -s "$U" | grep -q "$NEW"; then echo "LIVE on the bare URL too"; else echo "BARE URL STILL OLD: purge the site cache in hPanel (Stephen)"; fi
    exit 0
  fi
done
echo "NOT LIVE after 7.5 min (or the host's bot rule is 403ing this IP): check by hand later"; exit 1
