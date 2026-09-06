#!/usr/bin/env bash
# ============================================================================
#  Sky Wolf Studio — one codespace, everything in it.
#
#    ./workspace.sh            what is here, what is dirty, what is unpushed
#    ./workspace.sh pull       clone anything missing, fetch everything else
#    ./workspace.sh save       commit and push EVERYTHING, everywhere
#    ./workspace.sh pull --all also clone the whole back catalogue
#
#  Design rules, because this script exists to prevent data loss:
#    - It NEVER discards local work. It fetches, it does not pull or reset.
#    - A branch with no remote is treated as an emergency and pushed.
#    - Memory is restored from sws-memory if it is missing.
#    - Satellite games are CLONED beside lucid-winds, never copied into it.
#      Vendoring a satellite into this repo is the documented stale-build trap:
#      the copy goes stale the instant the game is pushed again.
# ============================================================================
set -uo pipefail

WS="${WS:-/workspaces}"
OWNER="Stephenuffugus"
MEMDIR="$HOME/.claude/projects/-workspaces-lucid-winds/memory"

# Repos worked on actively. These are always present.
CORE=(lucid-winds abduct_a_chameleon)

# The back catalogue. Cloned only with --all.
GAMES=(Litter_Bug Hues Hunch plainsight Tomato_Man Tally sixfold
       skywolf-pitbike-rally skitterlings glyph_forge Sweet-Spot letter_launch
       Blooming_Words BarBrawl pompond shell_shuffle word_stack Tarot_Run)

C_OK=$'\033[32m'; C_WARN=$'\033[33m'; C_BAD=$'\033[31m'; C_DIM=$'\033[2m'; C_OFF=$'\033[0m'
ok(){   printf "  ${C_OK}ok${C_OFF}    %s\n" "$*"; }
warn(){ printf "  ${C_WARN}note${C_OFF}  %s\n" "$*"; }
bad(){  printf "  ${C_BAD}RISK${C_OFF}  %s\n" "$*"; }
dim(){  printf "        ${C_DIM}%s${C_OFF}\n" "$*"; }

# EVERY remote operation strips the ambient tokens first. The codespace token
# does not carry access to the private sws-memory repo, so with it set, clone,
# fetch and ls-remote all 403 and the status check cries wolf every morning.
gitnet(){ env -u GITHUB_TOKEN -u GH_TOKEN git "$@"; }

repo_report(){
  local d="$1" name; name="$(basename "$d")"
  printf "\n%s\n" "── $name"
  if [ ! -d "$d/.git" ]; then bad "not a git repo"; return; fi
  local br dirty untracked
  br="$(git -C "$d" rev-parse --abbrev-ref HEAD 2>/dev/null)"
  dirty="$(git -C "$d" status --porcelain 2>/dev/null | grep -vc '^??' || true)"
  untracked="$(git -C "$d" ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')"
  dim "branch $br"
  [ "$dirty" -gt 0 ]     && bad "$dirty uncommitted change(s)"      || ok "working tree clean"
  [ "$untracked" -gt 0 ] && bad "$untracked untracked file(s)"      || true

  # A branch with no upstream lives on this machine only. That is the one that
  # actually loses work when a codespace is reclaimed.
  while read -r b up; do
    [ -z "$b" ] && continue
    if [ -z "$up" ]; then
      bad "branch '$b' has NO REMOTE - it exists only here"
    else
      local ahead; ahead="$(git -C "$d" rev-list --count "$up..$b" 2>/dev/null || echo 0)"
      [ "$ahead" -gt 0 ] && bad "branch '$b' is $ahead commit(s) ahead of $up" || true
    fi
  done < <(git -C "$d" for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads)

  local st; st="$(git -C "$d" stash list 2>/dev/null | wc -l | tr -d ' ')"
  [ "$st" -gt 0 ] && bad "$st stash(es) - stashes are NOT pushed by anything" || true
}

cmd_status(){
  printf "\n%s\n" "════ WORKSPACE $WS"
  for d in "$WS"/*/; do [ -d "$d" ] && repo_report "${d%/}"; done
  if [ -d "$MEMDIR/.git" ]; then
    repo_report "$MEMDIR"
  else
    printf "\n%s\n" "── memory"
    bad "memory is MISSING. run: ./workspace.sh pull"
  fi
  printf "\n"
}

clone_one(){
  # Split, do not chain. `local a=$1 b=$WS/$a` expands EVERY argument before it
  # performs ANY assignment, so $a is still unset and `set -u` kills the run.
  local name dest
  name="$1"; dest="$WS/$name"
  if [ -d "$dest/.git" ]; then
    gitnet -C "$dest" fetch --all --quiet 2>/dev/null && ok "$name fetched" || warn "$name fetch failed"
  else
    printf "  cloning %s ...\n" "$name"
    if gitnet clone --quiet "https://github.com/$OWNER/$name.git" "$dest" 2>/dev/null; then
      ok "$name cloned"
    else
      bad "$name could not be cloned"
    fi
  fi
}

cmd_pull(){
  printf "\n%s\n" "════ RECONSTITUTING $WS"
  for r in "${CORE[@]}"; do clone_one "$r"; done
  if [ "${1:-}" = "--all" ]; then
    for r in "${GAMES[@]}"; do clone_one "$r"; done
  else
    dim "back catalogue skipped. use: ./workspace.sh pull --all"
  fi

  printf "\n%s\n" "── memory"
  if [ -d "$MEMDIR/.git" ]; then
    gitnet -C "$MEMDIR" fetch --quiet 2>/dev/null && ok "memory fetched"
  else
    mkdir -p "$(dirname "$MEMDIR")"
    if gitnet clone --quiet "https://github.com/$OWNER/sws-memory.git" "$MEMDIR" 2>/dev/null; then
      ok "memory restored from sws-memory"
    else
      bad "memory could not be restored. It is a PRIVATE repo; check auth."
    fi
  fi
  printf "\n%s\n" "Fetched, not merged. Nothing local was touched. Now run: ./workspace.sh"
}

save_one(){
  local d="$1" name; name="$(basename "$d")"
  [ -d "$d/.git" ] || return
  printf "\n%s\n" "── $name"

  if [ -n "$(git -C "$d" status --porcelain)" ]; then
    git -C "$d" add -A
    git -C "$d" commit -q -m "Save working state before the codespace closes

Committed by workspace.sh so that nothing lives only on one machine.
Untidy on purpose: the point is that it survives." && ok "committed"
  else
    ok "nothing to commit"
  fi

  # Push every branch, and adopt any that has no remote.
  while read -r b up; do
    [ -z "$b" ] && continue
    if [ -z "$up" ]; then
      gitnet -C "$d" push -q -u origin "$b" 2>/dev/null \
        && ok "branch '$b' adopted by origin" || bad "branch '$b' FAILED to push"
    else
      gitnet -C "$d" push -q origin "$b" 2>/dev/null \
        && ok "branch '$b' pushed" || warn "branch '$b' nothing to push or push failed"
    fi
  done < <(git -C "$d" for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads)
}

cmd_save(){
  printf "\n%s\n" "════ SAVING EVERYTHING"
  for d in "$WS"/*/; do [ -d "$d" ] && save_one "${d%/}"; done
  [ -d "$MEMDIR/.git" ] && save_one "$MEMDIR"
  printf "\n%s\n" "Done. Run ./workspace.sh to confirm nothing is still at risk."
}

case "${1:-status}" in
  status|"") cmd_status ;;
  pull)      cmd_pull "${2:-}" ;;
  save)      cmd_save ;;
  *) echo "usage: ./workspace.sh [status|pull [--all]|save]"; exit 1 ;;
esac
