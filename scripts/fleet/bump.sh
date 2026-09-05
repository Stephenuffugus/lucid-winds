#!/usr/bin/env bash
# Re-pin the three shared files every native loads. Run this in the SAME commit as any change
# to shared.css, play/shell.css or play/shell.js, or the change ships to nobody: the host
# caches by URL and the natives pinned shared.css?v=20260718 for seven weeks of edits.
#   scripts/fleet/bump.sh            # stamps today's date + 'a' on shared.css
#   scripts/fleet/bump.sh b          # a different letter for a second bump the same day
#   scripts/fleet/bump.sh a shell    # also bump shell.css / shell.js (integer pins)
set -euo pipefail
cd "$(dirname "$0")/../.."
L="${1:-a}"; STAMP="$(date -u +%Y%m%d)$L"
OLD=$(grep -oh 'shared\.css?v=[0-9a-z]*' play/*.html | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')
if [ "$OLD" = "shared.css?v=$STAMP" ]; then echo "shared.css already pinned $STAMP"; else
  sed -i "s|shared\.css?v=[0-9a-z]*|shared.css?v=$STAMP|g" play/*.html; echo "shared.css: $OLD -> shared.css?v=$STAMP"; fi
if [ "${2:-}" = "shell" ]; then
  for f in shell.css shell.js; do
    CUR=$(grep -oh "$f?v=[0-9]*" play/*.html | sort | uniq -c | sort -rn | head -1 | awk -F= '{print $2}')
    NEW=$((CUR+1)); sed -i "s|$f?v=$CUR\b|$f?v=$NEW|g" play/*.html; echo "$f: v=$CUR -> v=$NEW"; done
fi
echo "pins now:"; grep -oh '\(shared\.css\|shell\.css\|shell\.js\)?v=[0-9a-z]*' play/*.html | sort | uniq -c
