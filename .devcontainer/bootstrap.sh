#!/usr/bin/env bash
# Runs once, when a codespace is first created.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 0
chmod +x workspace.sh 2>/dev/null || true
./workspace.sh pull || true
cat <<'BANNER'

  ────────────────────────────────────────────────────────────
   Sky Wolf workspace ready.

     ./workspace.sh          what is dirty or unpushed
     ./workspace.sh pull     clone or fetch the sibling repos
     ./workspace.sh save     commit and push EVERYTHING
     ./workspace.sh pull --all   also clone the back catalogue

   Read WORKSPACE.md first if anything looks missing.
  ────────────────────────────────────────────────────────────

BANNER
