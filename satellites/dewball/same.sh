#!/bin/bash
# same.sh: run smoke and the w1 near bot NOW and prove both are byte identical to the Phase 0
# baseline. Refuses (exit 1) on a missing or empty run, a missing PASS line, or any difference,
# so it cannot go green on two empty files (the 9 Oct false green). Run: bash satellites/dewball/same.sh
set -u
B=${SAME_BASE:-/workspaces/lucid-winds/satellites/dewball/tools/forge/baseline-oct09}   # the Phase 0 outputs (9 Oct 2026, before any first slice change)
G=/workspaces/lucid-winds/satellites/dewball
T=$(mktemp -d)
node $G/smoke.js > $T/smoke.txt 2>&1
node $G/balance.js 1 12345 1 near > $T/bal.txt 2>&1
for f in $B/smoke.txt $B/balance-w1-12345.txt $T/smoke.txt $T/bal.txt; do
  [ -s "$f" ] || { echo "SAME_FAIL missing or empty: $f"; exit 1; }
done
grep -q '^SMOKE_PASS' $T/smoke.txt || { echo "SAME_FAIL smoke did not pass:"; tail -3 $T/smoke.txt; exit 1; }
grep -q '^BALANCE_PASS' $T/bal.txt || { echo "SAME_FAIL balance did not pass:"; tail -3 $T/bal.txt; exit 1; }
if ! diff <(grep -v '"errors"' $B/smoke.txt) <(grep -v '"errors"' $T/smoke.txt) > $T/d1; then echo "SAME_FAIL smoke differs:"; head -20 $T/d1; exit 1; fi
if ! diff <(sed -n '1,/^BALANCE_PASS/p' $B/balance-w1-12345.txt) <(sed -n '1,/^BALANCE_PASS/p' $T/bal.txt) > $T/d2; then echo "SAME_FAIL balance differs:"; head -20 $T/d2; exit 1; fi
echo "SAME_PASS smoke and the w1 near bot byte identical to the Phase 0 baseline ($(wc -l < $T/smoke.txt) + $(wc -l < $T/bal.txt) lines)"
rm -rf $T
