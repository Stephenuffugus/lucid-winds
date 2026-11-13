#!/bin/bash
# KEEPSIES m5, THE FIGURES: raw Meshy GLBs -> satellites/keepsies/assets/figures/<id>.glb + manifest.json
#   bash satellites/keepsies/tools/figures/fit.sh [RAW_DIR] [WORK_DIR]
# RAW_DIR defaults to /workspaces/keepsies-meshy/out (Stephen's paid originals, NEVER committed);
# WORK_DIR holds the Blender output and the unpacked gltfpack (never inside the repo).
# Steps: figfit.py in Blender (normalise, decimate, one 512 px texture), then gltfpack with its default
# quantisation only (KHR_mesh_quantization, which lib/loaders/GLTFLoader.js reads with no decoder: no -c, no
# meshopt, no Draco, no KTX2), then manifest.mjs.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
GAME=$(cd "$HERE/../.." && pwd)
RAW=${1:-/workspaces/keepsies-meshy/out}
WORK=${2:-/tmp/keepsies-figures}
mkdir -p "$WORK/fit" "$WORK/bin" "$GAME/assets/figures"
if [ ! -x "$WORK/bin/gltfpack" ]; then
  unzip -o -q /home/codespace/dewball-drafts/dl-gltfpack/gltfpack-ubuntu.zip -d "$WORK/bin"; chmod +x "$WORK/bin/gltfpack"
fi
if [ "${SKIP_BLENDER:-0}" != "1" ]; then
  blender -b --factory-startup -P "$HERE/figfit.py" -- --in "$RAW" --out "$WORK" ${ONLY:+--only "$ONLY"}
fi
for f in "$WORK"/fit/*.glb; do
  id=$(basename "$f" .glb)
  "$WORK/bin/gltfpack" -i "$f" -o "$GAME/assets/figures/$id.glb" -kn -km >/dev/null
done
python3 "$HERE/thumbs.py" "$RAW" "$GAME/assets/figures" void_loaf moon_moo mothlight dumpster_duke boba_buddy bolt_buddy snacktopus moss_boss boo_brew quarter_eater save_point tiny_tyrant book_wyrm pickle_wizard
node "$HERE/manifest.mjs" "$WORK/fit-report.json" "$GAME/assets/figures"
