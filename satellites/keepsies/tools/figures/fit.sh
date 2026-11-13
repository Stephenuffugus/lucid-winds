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
# m5 second pass: these figures skip Blender's decimate and are simplified by gltfpack instead (-si), which keeps
# the UV seams whole: Blender's collapse broke Moon Moo's texture into blotches on the flank and left dark faceted
# streaks on the boba cup. id=ratio of the raw ~20,000 triangles (0.2 is about 4,000).
# Their textures also go to 1024 px at JPEG 60: Meshy's atlas is hundreds of tiny islands, and at 512 px the colours
# of neighbouring islands bleed across every border (the streaks and the blotches); 1024 halves the bleed and the
# lower quality keeps both under 200 KB (Moon Moo 199,888 bytes).
SIMPLIFY="moon_moo=0.2 boba_buddy=0.2"
HIRES="moon_moo,boba_buddy"
NODEC=$(for kv in $SIMPLIFY; do printf '%s=1000000,' "${kv%%=*}"; done)
if [ "${SKIP_BLENDER:-0}" != "1" ]; then
  blender -b --factory-startup -P "$HERE/figfit.py" -- --in "$RAW" --out "$WORK" --budget "$NODEC" ${ONLY:+--only "$ONLY"}
  blender -b --factory-startup -P "$HERE/figfit.py" -- --in "$RAW" --out "$WORK" --budget "$NODEC" --only "$HIRES" --tex 1024 --q 60
fi
for f in "$WORK"/fit/*.glb; do
  id=$(basename "$f" .glb)
  SI=""
  for kv in $SIMPLIFY; do [ "${kv%%=*}" = "$id" ] && SI="-si ${kv#*=}"; done
  "$WORK/bin/gltfpack" -i "$f" -o "$GAME/assets/figures/$id.glb" -kn -km $SI >/dev/null
done
python3 "$HERE/thumbs.py" "$RAW" "$GAME/assets/figures" void_loaf moon_moo mothlight dumpster_duke boba_buddy bolt_buddy snacktopus moss_boss boo_brew quarter_eater save_point tiny_tyrant book_wyrm pickle_wizard
node "$HERE/manifest.mjs" "$WORK/fit-report.json" "$GAME/assets/figures"
