#!/usr/bin/env bash
# Upload the packaged Jimothy build to Steam.
#
#   LW_STEAM_USER=<steamworks login> ./steampipe/upload.sh
#   (app id defaults to 5043360, Jumping Jimothy)
#
# The depot id is appid+1, which is what Steamworks hands you by default when
# you create the app. If your depot id differs, set LW_STEAM_DEPOTID too.
#
# Nothing here is destructive. The build lands on Steam as an unset build; you
# still have to walk into Steamworks -> Builds and push it to a branch.
set -euo pipefail
cd "$(dirname "$0")/.."
HERE="$(pwd)"

# Jumping Jimothy's real app id, activated by Stephen 2026-07-31. Overridable for
# a test app, but defaulted so nobody has to remember it or fat-finger it.
LW_STEAM_APPID="${LW_STEAM_APPID:-5043360}"
: "${LW_STEAM_USER:?set LW_STEAM_USER to your Steamworks builder account}"
DEPOTID="${LW_STEAM_DEPOTID:-$((LW_STEAM_APPID + 1))}"
DESC="${LW_STEAM_DESC:-Jimothy $(node -p "require('$HERE/package.json').version")}"

# 1. always rebuild from the live game, never upload a stale copy
npm run dist:win

CONTENT="$HERE/dist/win-unpacked"
# ⛔ THE EXE IS NAMED BY package.json build.productName, AND IT WAS RENAMED.
# This guard used to hard-code "Jimothy the Jumping Nugget.exe", which is what
# the LAST build (Jul 30, pre-rename) produced. `npm run dist:win` above now
# emits "Jumping Jimothy.exe", so the old guard would have aborted the very
# first real upload with a misleading "no exe" error. Read the name from the
# same file electron-builder reads, so it can never drift again, and stale
# artefacts from before a rename get swept so the depot cannot ship two exes.
EXE="$(node -p "require('$HERE/package.json').build.productName").exe"
find "$CONTENT" -maxdepth 1 -name '*.exe' ! -name "$EXE" -delete 2>/dev/null || true
[ -f "$CONTENT/$EXE" ] || { echo "no \"$EXE\" in $CONTENT (check build.productName)"; exit 1; }
echo "launch option must be: $EXE"

OUT="$HERE/steampipe/generated"
mkdir -p "$OUT/output"

cat > "$OUT/depot_build.vdf" <<VDF
"DepotBuild"
{
	"DepotID" "$DEPOTID"
	"contentroot" "$CONTENT"
	"FileMapping"
	{
		"LocalPath" "*"
		"DepotPath" "."
		"recursive" "1"
	}
	"FileExclusion" "*.pdb"
	"FileExclusion" "*.log"
}
VDF

cat > "$OUT/app_build.vdf" <<VDF
"appbuild"
{
	"appid" "$LW_STEAM_APPID"
	"desc" "$DESC"
	"buildoutput" "$OUT/output"
	"contentroot" "$CONTENT"
	"setlive" ""
	"preview" "0"
	"local" ""
	"depots"
	{
		"$DEPOTID" "$OUT/depot_build.vdf"
	}
}
VDF

echo "wrote $OUT/app_build.vdf  (app $LW_STEAM_APPID, depot $DEPOTID)"
echo "content: $CONTENT  ($(du -sh "$CONTENT" | cut -f1))"

# 2. steamcmd. On this box it is not installed by default; the Steamworks SDK
#    ships one at tools/ContentBuilder/builder_linux/steamcmd.sh
STEAMCMD="${LW_STEAMCMD:-$(command -v steamcmd || true)}"
if [ -z "$STEAMCMD" ]; then
  echo
  echo "steamcmd not found. Either install it, or point LW_STEAMCMD at the one"
  echo "in the Steamworks SDK (tools/ContentBuilder/builder_linux/steamcmd.sh),"
  echo "then run:"
  echo
  echo "  \$LW_STEAMCMD +login $LW_STEAM_USER +run_app_build \"$OUT/app_build.vdf\" +quit"
  exit 0
fi

"$STEAMCMD" +login "$LW_STEAM_USER" +run_app_build "$OUT/app_build.vdf" +quit
echo "uploaded. Steamworks -> your app -> Builds; set it live on the default branch."
