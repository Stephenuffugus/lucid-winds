#!/usr/bin/env bash
# Final integration battery for the 2026-08-16 build out pass.
#
# Run this ONLY when the box is quiet (load under about 3 on this 2 core
# machine). Browser gates under contention disagree with each other, which is
# worse than having no gate, because it teaches you to rerun until green.
#
#   python3 -m http.server 8951 --bind 127.0.0.1 &
#   bash scripts/handoff11_final.sh
#
# Everything here is serialized on purpose. It is slow and that is the point.

set -u
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
line(){ printf '\n=== %s ===\n' "$1"; }
res(){ if [ "$1" = "0" ]; then PASS=$((PASS+1)); echo "  OK   $2"; else FAIL=$((FAIL+1)); echo "  RED  $2"; fi; }

line "node suites (no browser, safe to run under load)"
for g in deepwell blackout parallel wireworm siege; do
  out=$(timeout 400 node "satellites/$g/sim.js" --test 2>&1 | grep -oE "PASSED [0-9]+ / FAILED [0-9]+" | tail -1)
  timeout 400 node "satellites/$g/sim.js" --test >/dev/null 2>&1
  res "$?" "$g  $out"
done
for t in "hush/tests/hush_tests.mjs" "scripts/hush_audit.js" "padlab/check.mjs" "satellites/_exit_audit.mjs"; do
  [ -f "$t" ] || continue
  timeout 300 node "$t" >/dev/null 2>&1
  res "$?" "$(basename "$t")"
done
for t in satellites/*/test/logic.mjs satellites/*/check.js satellites/*/check.mjs; do
  [ -f "$t" ] || continue
  timeout 300 node "$t" >/dev/null 2>&1
  res "$?" "$t"
done

line "static gates"
timeout 200 node scripts/handoff11_gates.mjs >/dev/null 2>&1
res "$?" "handoff11_gates (five games)"
timeout 200 node scripts/sw_purge_audit.js >/dev/null 2>&1
res "$?" "sw_purge_audit (fleet cache safety)"

line "browser gates, one at a time"
for g in deepwell blackout parallel wireworm siege; do
  timeout 400 node scripts/handoff11_verify.mjs "$g" >/dev/null 2>&1
  res "$?" "verify $g"
done
LW_URL=http://127.0.0.1:8951 timeout 400 node scripts/page_health.mjs >/dev/null 2>&1
res "$?" "page_health (core apps)"

printf '\n%s passed, %s red\n' "$PASS" "$FAIL"
echo "None of this replaces the LOOKING pass. Shoot each surface and open the images."
[ "$FAIL" = "0" ]
