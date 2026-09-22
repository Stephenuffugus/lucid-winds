#!/bin/sh
# Is this box quiet enough to trust a browser gate? (law 5: one browser on the WHOLE machine, load under 2)
#
# ⛔ Why this is a FILE and not a one liner. `pgrep -f chrom` and `ps -eo cmd | grep -E "[c]hrom"` both match
# THE SHELL THAT IS RUNNING THE CHECK, because the pattern is sitting in that shell's own command line. The
# `[c]` bracket trick does not help: it hides the grep from itself, not the wrapper from the grep. On 22 Sep
# that cost forty minutes of waiting for a browser that was never there, and then a `pkill -f` that killed the
# asking shell. `ps -eo comm` prints the BINARY NAME ONLY, with no arguments, so a shell can never match it.
#
# Usage:  sh dev/box-quiet.sh          -> prints "quiet" or "busy ..." and exits 0 or 1
#         sh dev/box-quiet.sh 2.5      -> with a load ceiling other than 2.0
LIMIT=${1:-2.0}
BROWSERS=$(ps -eo comm= | grep -cx -e chrome -e chromium -e chrome_crashpad -e headless_shell 2>/dev/null || true)
LOAD=$(cut -d' ' -f1 /proc/loadavg)
if [ "${BROWSERS:-0}" -gt 0 ]; then
  echo "busy: $BROWSERS browser process(es), load $LOAD"
  exit 1
fi
if awk "BEGIN{exit !($LOAD < $LIMIT)}"; then
  echo "quiet: no browser, load $LOAD (under $LIMIT)"
  exit 0
fi
echo "busy: no browser but load $LOAD (over $LIMIT)"
exit 1
