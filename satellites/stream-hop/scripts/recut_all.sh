#!/usr/bin/env bash
# ART PATCH step 2 (plans/jimothy/ART-PATCH-PLAN.md). Needs the source sheets in /tmp/jim-src (step 1 of the plan).
# Recut every source sheet pair with the CURRENT cutter into /tmp/jim-all/cut/<tag>/ . About 6 minutes on 2 cores. Names are by sheet order and may be
# wrong for odd sheets (Orca is swapped); the matcher identifies every cell against the live frames afterwards.
cd /workspaces/lucid-winds/satellites/stream-hop
mkdir -p /tmp/jim-all/cut; rm -f /tmp/jim-all/DONE /tmp/jim-all/fail.txt
S="/tmp/jim-src/skins723/Jimothy skins"; Z="/tmp/jim-src/z/0moreskins"
for n in $(seq 1 29); do
  [ -f "$S/$n/${n}a.png" ] || continue
  python3 scripts/cut_sheet.py "$S/$n/${n}a.png" "$S/$n/${n}b.png" --out /tmp/jim-all/cut/s$n > /tmp/jim-all/log-s$n.txt 2>&1 || echo "s$n FAILED" >> /tmp/jim-all/fail.txt
done
for k in trashking pirate mothman astronaut Shinothy hazmat disco alien frogger Dinosaur wizard robot cardboardknight; do
  python3 scripts/cut_sheet.py "$Z/${k}1.png" "$Z/${k}2.png" --out /tmp/jim-all/cut/m-$k > /tmp/jim-all/log-m-$k.txt 2>&1 || echo "m-$k FAILED" >> /tmp/jim-all/fail.txt
done
python3 scripts/cut_sheet.py "art-drop6/The Barnacle/devito1.png" "art-drop6/The Barnacle/devito2.png" --out /tmp/jim-all/cut/x-barnacle > /tmp/jim-all/log-x-barnacle.txt 2>&1 || echo "x-barnacle FAILED" >> /tmp/jim-all/fail.txt
echo done > /tmp/jim-all/DONE
