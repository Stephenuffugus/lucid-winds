#!/usr/bin/env bash
# One-shot: syntax check -> combat stress test -> tree/invariant validation.
# Pass an alternate html path as $1 if needed.
set -e
FILE="${1:-lucid-winds-arena.html}"
echo "▶ syntax check";   node test/syntax-check.js "$FILE"
echo; echo "▶ combat stress"; node test/stress.js "$FILE"
echo; echo "▶ validation";    node test/validate.js "$FILE"
echo; echo "✅ all checks passed for $FILE"
