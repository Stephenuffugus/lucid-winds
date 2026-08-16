#!/usr/bin/env bash
# Every Whack Box gate, one at a time.
#
# ⛔ ONE AT A TIME IS THE POINT. This box has two cores, and two browser suites
# running together starve each other into timeouts that look exactly like game
# hangs. Do not add & to these lines.
#
# Usage: bash test/all.sh   (from party/)
set -u
cd "$(dirname "$0")/.."
GAMES="mothlight:3 firefly:3 liftingfog:3 firstfrost:4 moongraft:4 samesoil:3 samesoil:2 widemargin:4 bearing:4 understudy:4"
FAIL=0
LOG=${LOG:-/tmp/wb-suite}
mkdir -p "$LOG"

echo "== front door =="
if timeout 150 node test/picker.js > "$LOG/picker.log" 2>&1; then
  echo "  picker           PASS"
else
  echo "  picker           FAIL  ($LOG/picker.log)"; FAIL=1
fi

echo "== static =="
if node test/audit_static.js > "$LOG/static.log" 2>&1; then
  echo "  static gate      PASS"
else
  echo "  static gate      FAIL  ($LOG/static.log)"; FAIL=1
fi

echo "== content =="
if node test/bank_audit.js > "$LOG/banks.log" 2>&1; then
  echo "  bank audit       PASS  ($(grep TOTAL "$LOG/banks.log" | tr -s ' '))"
else
  echo "  bank audit       FAIL  ($LOG/banks.log)"; FAIL=1
fi

echo "== sound =="
if timeout 150 node test/audio.js > "$LOG/audio.log" 2>&1; then
  echo "  audio            PASS"
else
  echo "  audio            FAIL  ($LOG/audio.log)"; FAIL=1
fi
if timeout 200 node test/leak.js > "$LOG/leak.log" 2>&1; then
  echo "  interval leak    PASS"
else
  echo "  interval leak    FAIL  ($LOG/leak.log)"; FAIL=1
fi

echo "== titles, start to gameComplete =="
for pair in $GAMES; do
  slug="${pair%%:*}"; n="${pair##*:}"
  if SHOTS="$LOG/shots-$slug-$n" timeout 400 node test/drive.js "$slug" "$n" > "$LOG/$slug-$n.log" 2>&1; then
    printf "  %-16s PASS  (%s players)\n" "$slug" "$n"
  else
    printf "  %-16s FAIL  (%s players, %s)\n" "$slug" "$n" "$LOG/$slug-$n.log"; FAIL=1
  fi
done

echo "== the big screen dies mid game =="
for slug in mothlight samesoil; do
  if timeout 250 node test/hostdrop.js "$slug" 3 > "$LOG/hostdrop-$slug.log" 2>&1; then
    printf "  %-16s PASS\n" "hostdrop:$slug"
  else
    printf "  %-16s FAIL  (%s)\n" "hostdrop:$slug" "$LOG/hostdrop-$slug.log"; FAIL=1
  fi
done

echo
if [ "$FAIL" = "0" ]; then echo "SUITE: ALL GREEN"; else echo "SUITE: SOMETHING FAILED"; fi
echo "⛔ Green is not a look. Now run test/shots.js and OPEN the images."
exit $FAIL
