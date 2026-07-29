#!/usr/bin/env bash
# memory-sync.sh — keep Claude Code's memory alive across codespace deaths.
#
# WHY THIS EXISTS
#   Memory lives at ~/.claude/projects/-workspaces-lucid-winds/memory/ — on the
#   CODESPACE DISK, not in this repo. Every new codespace starts with it empty,
#   so a session silently runs with no history of the project. That happened on
#   2026-07-28 and Stephen noticed ("i feel like youre not workign from it").
#
#   It CANNOT live in this repo: lucid-winds is PUBLIC, and memory holds the
#   wallets note, the provisional patent and revenue timelines. So it syncs to a
#   separate PRIVATE repo.
#
# USAGE
#   scripts/memory-sync.sh pull     # start of a fresh codespace — restore memory
#   scripts/memory-sync.sh push     # end of a session — save memory
#   scripts/memory-sync.sh status   # what would change
#
# FIRST-TIME SETUP (once, needs a token that can create repos):
#   gh auth login
#   gh repo create Stephenuffugus/lucid-winds-memory --private \
#     --description "Private memory sync for lucid-winds Claude Code sessions"
#   scripts/memory-sync.sh push
#
# NOTE: the codespace's default GITHUB_TOKEN (ghu_...) is scoped to lucid-winds
# ONLY, so it cannot touch the memory repo. This script unsets it so gh falls
# back to the broader token in ~/.config/gh/hosts.yml. See
# reference_cross_repo_push in memory.

set -euo pipefail

MEM="${MEM_DIR:-$HOME/.claude/projects/-workspaces-lucid-winds/memory}"
REPO="${MEM_REPO:-Stephenuffugus/lucid-winds-memory}"
WORK="${MEM_WORK:-/tmp/lw-memory-sync}"

GH="env -u GITHUB_TOKEN -u GH_TOKEN gh"
# A personal access token in a file is the path that actually works in a fresh
# codespace. `gh auth login --with-token` REFUSES a token without the read:org
# scope, which this script never needs, and the browser device flow has expired on
# us three times. So: use a stored gh login if there is one, otherwise read a PAT
# (repo scope is enough) from $GH_PAT_FILE, default ~/.gh_pat.
PAT_FILE="${GH_PAT_FILE:-$HOME/.gh_pat}"
TOKEN=""

die() { echo "ERROR: $*" >&2; exit 1; }

check_auth() {
  TOKEN="$($GH auth token 2>/dev/null || true)"
  case "$TOKEN" in
    ghu_*|"") TOKEN="" ;;          # codespace token cannot reach another repo
  esac
  if [ -z "$TOKEN" ] && [ -n "${MEM_TOKEN:-}" ]; then TOKEN="$MEM_TOKEN"; fi
  if [ -z "$TOKEN" ] && [ -f "$PAT_FILE" ]; then TOKEN="$(tr -d "\r\n" < "$PAT_FILE")"; fi
  [ -n "$TOKEN" ] || die "no usable credential.
       Put a GitHub token with 'repo' scope in $PAT_FILE (or set MEM_TOKEN).
       github.com/settings/tokens/new -> tick repo -> generate.
       Do NOT bother with 'gh auth login' — it demands a read:org scope this does not need."
  curl -sf -H "Authorization: Bearer $TOKEN" "https://api.github.com/repos/$REPO" >/dev/null \
    || die "that credential cannot see $REPO. Create it first:
       curl -X POST -H \"Authorization: Bearer \$TOKEN\" https://api.github.com/user/repos -d '{\"name\":\"${REPO#*/}\",\"private\":true}'"
}

repo_url() { echo "https://x-access-token:${TOKEN}@github.com/${REPO}.git"; }

clone_work() {
  rm -rf "$WORK"
  git -c credential.helper= clone -q "$(repo_url)" "$WORK" 2>/dev/null \
    || die "clone failed for $REPO"
}

case "${1:-}" in
  pull)
    check_auth; clone_work
    mkdir -p "$MEM"
    # additive on purpose: never delete a note this codespace wrote but has not pushed
    rsync -a --exclude '.git' "$WORK"/memory/ "$MEM"/
    echo "pulled $(find "$MEM" -type f -name '*.md' | wc -l) memory files into $MEM"
    ;;
  push)
    check_auth
    [ -d "$MEM" ] || die "no memory dir at $MEM"
    [ -f "$MEM/MEMORY.md" ] || die "$MEM has no MEMORY.md — refusing to push a half-empty memory over a good one"
    clone_work
    mkdir -p "$WORK/memory"
    rsync -a --delete --exclude '.git' "$MEM"/ "$WORK"/memory/
    cd "$WORK"
    git add -A
    if git diff --cached --quiet; then
      echo "memory already up to date — nothing to push"
    else
      git -c user.email=stephenfurpahs@gmail.com -c user.name=Stephenuffugus \
        commit -q -m "memory sync — $(git diff --cached --numstat | wc -l) files changed"
      git -c credential.helper= push -q "$(repo_url)" HEAD
      echo "pushed memory to $REPO"
    fi
    ;;
  status)
    check_auth; clone_work
    rsync -an --delete --exclude '.git' "$MEM"/ "$WORK"/memory/ | sed -n '2,40p'
    ;;
  *)
    sed -n '1,30p' "$0"; exit 1 ;;
esac
