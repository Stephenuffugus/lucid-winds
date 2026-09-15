#!/bin/bash
# NOTCH turn gate law 6's Enter clause, watched red: k1 no Enter let go, k2 Enter seats at any angle.
# Each plant copies the frozen snapshot, asserts its edit matches once, and runs the turn gate under the lock.
SP=/tmp/claude-1000/-workspaces-lucid-winds/966ccee1-3aad-4d09-b625-c9946897860d/scratchpad
SNAP=$1
export NODE_PATH=/workspaces/lucid-winds/node_modules
for plant in k1 k2; do
  D=$SP/plant-notch-$plant; rm -rf $D; mkdir -p $D; cp -r $SNAP/satellites $SNAP/tools $D/
  F=$D/satellites/notch/main.js
  OLD="if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (seatCheck(current, angle)) finish(false); return; }"
  if [ $plant = k1 ]; then NEW=""; else NEW="if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(false); return; }"; fi
  n=$(grep -cF "$OLD" $F)
  echo "=== $plant (anchor $n)"
  [ "$n" = 1 ] || { echo "FAIL plant $plant planted nothing"; continue; }
  OLD="$OLD" NEW="$NEW" node -e "const fs=require('fs');const f=process.argv[1];fs.writeFileSync(f,fs.readFileSync(f,'utf8').split(process.env.OLD).join(process.env.NEW))" $F
  (cd $D/satellites/notch && flock -w 43200 /tmp/sws-gate.lock timeout 1800 node test/turn.mjs) 2>&1 | grep -E "FAIL|TURN (OK|FAILURE)"
done
echo "plants done"
