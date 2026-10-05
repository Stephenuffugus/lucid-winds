#!/usr/bin/env bash
# Rebuilds GAMES-FOR-ASTRA.md (every arcade game: its card sentence, where it lives, status, audit signals).
# Written 5 Oct 2026. Light: no browser. Run from anywhere: bash scripts/games-for-astra/regen.sh
# The store lines (STORE in gen-doc.py) and section 3's table in gen-front.py are written by hand: check them first.
set -euo pipefail
LW=/workspaces/lucid-winds; H="$(cd "$(dirname "$0")" && pwd)"
export SP="${SP:-/tmp/games-for-astra}"; mkdir -p "$SP/checks"
cd "$LW"
git fetch -q --depth=1 origin main:refs/remotes/origin/main                                   # the catalog is read from LIVE main's portal
node "$H/dump-catalog.mjs" "$SP"
node satellites/_exit_audit.mjs            > "$SP/checks/exit_audit.log"   2>&1 || true
node scripts/defect_sweep.mjs              > "$SP/checks/defect_sweep.log" 2>&1 || true
node scripts/vendor_satellites.mjs --check > "$SP/checks/vendor_check.log" 2>&1 || true
python3 "$H/enrich.py"
python3 "$H/gen-doc.py"
python3 "$H/gen-front.py"
cat "$SP/doc-front.md" "$SP/doc-catalog.md" > "$LW/GAMES-FOR-ASTRA.md"
echo "GAMES-FOR-ASTRA.md: $(wc -c < "$LW/GAMES-FOR-ASTRA.md") bytes, $(grep -c '^#### ' "$LW/GAMES-FOR-ASTRA.md") game entries"
