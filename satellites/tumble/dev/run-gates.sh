#!/bin/sh
# Runs the browser gates one at a time (two cores: never two browsers at once). sh dev/run-gates.sh [names...]
cd "$(dirname "$0")/.."
for g in ${@:-shaders step1 step3 step4 step5 step678 devpages review basket glb}; do
  echo "== $g"
  timeout 1500 node dev/gate-$g.mjs > dev/out/gate-$g.log 2>&1
  tail -1 dev/out/gate-$g.log
done
