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

die() { echo "ERROR: $*" >&2; exit 1; }

check_auth() {
  local tok
  tok="$($GH auth token 2>/dev/null || true)"
  [ -n "$tok" ] || die "not authenticated. Run: gh auth login"
  case "$tok" in
    ghu_*) die "only the codespace token is present (ghu_, scoped to lucid-winds).
       It cannot reach $REPO. Run: gh auth login" ;;
  esac
  $GH api "repos/$REPO" --jq .name >/dev/null 2>&1 \
    || die "cannot see $REPO. Create it first:
       gh repo create $REPO --private"
}

clone_work() {
  rm -rf "$WORK"
  $GH repo clone "$REPO" "$WORK" -- --quiet 2>/dev/null \
    || die "clone failed for $REPO"
}

case "${1:-}" in
  pull)
    check_auth; clone_work
    mkdir -p "$MEM"
    # additive on purpose: never delete a note this codespace wrote but has not pushed
    rsync -a --exclude '.git' "$WORK"/ "$MEM"/
    echo "pulled $(find "$MEM" -type f -name '*.md' | wc -l) memory files into $MEM"
    ;;
  push)
    check_auth
    [ -d "$MEM" ] || die "no memory dir at $MEM"
    [ -f "$MEM/MEMORY.md" ] || die "$MEM has no MEMORY.md — refusing to push a half-empty memory over a good one"
    clone_work
    rsync -a --delete --exclude '.git' "$MEM"/ "$WORK"/
    cd "$WORK"
    git add -A
    if git diff --cached --quiet; then
      echo "memory already up to date — nothing to push"
    else
      git -c user.email=stephenfurpahs@gmail.com -c user.name=Stephenuffugus \
        commit -q -m "memory sync — $(git diff --cached --numstat | wc -l) files changed"
      $GH auth setup-git >/dev/null 2>&1 || true
      env -u GITHUB_TOKEN -u GH_TOKEN git push -q origin HEAD
      echo "pushed memory to $REPO"
    fi
    ;;
  status)
    check_auth; clone_work
    rsync -an --delete --exclude '.git' "$MEM"/ "$WORK"/ | sed -n '2,40p'
    ;;
  *)
    sed -n '1,30p' "$0"; exit 1 ;;
esac
