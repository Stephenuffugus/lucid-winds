#!/usr/bin/env bash
# ============================================================================
#  Sky Wolf Studio — one codespace, everything in it.
#
#    ./workspace.sh            what is here, what is dirty, what is unpushed
#    ./workspace.sh pull       clone anything missing, fetch everything else
#    ./workspace.sh save       commit and push EVERYTHING, everywhere
#    ./workspace.sh pull --all also clone the whole back catalogue
#    ./workspace.sh clean      drop caches only (never work), then show the disk
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
CORE=(lucid-winds abduct_a_chameleon tiny-world)

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

# ---------------------------------------------------------------------------
# DISK. The box is 32 GB and about 23 GB of it is permanent: ~12 GB base
# image, ~3.3 GB lucid-winds tree + ~4.1 GB its git copy, ~0.9 GB Meshy
# originals (ignored, paid for, NOT in git: vault before ever deleting),
# ~2.5 GB tooling (puppeteer + playwright browsers, gradle, python, claude).
# VS Code screams at 90%. What pushes it there is always caches, so `clean`
# drops caches and nothing else. /tmp is a separate 44 GB disk wiped at
# every stop: scratch and build output belong there, and the npm cache lives
# there now (~/.npmrc cache=/tmp/npm-cache). Measured 2026-10-11.
# ---------------------------------------------------------------------------
disk_report(){
  printf "\n%s\n" "── disk"
  local used avail pct
  read -r used avail pct <<<"$(df -BM --output=used,avail,pcent /workspaces | tail -1)"
  pct="${pct%\%}"
  local msg="${pct}% used, $(( ${avail%M} / 1024 )) GB free of 32 GB"
  if [ "$pct" -ge 85 ]; then bad "$msg - run: ./workspace.sh clean"
  elif [ "$pct" -ge 78 ]; then warn "$msg (23 GB of this box is permanent; caches are the only slack)"
  else ok "$msg"; fi
}

cmd_clean(){
  printf "\n%s\n" "════ CLEANING CACHES (work is never touched)"
  local before; before="$(df -BM --output=avail /workspaces | tail -1 | tr -dc 0-9)"

  # npm: the cache is on /tmp now; an old ~/.npm (its _npx tree ran to 540 MB) is dead weight.
  npm cache clean --force >/dev/null 2>&1 && ok "npm cache cleaned ($(npm config get cache))"
  [ -d "$HOME/.npm" ] && rm -rf "$HOME/.npm" && ok "old ~/.npm removed"

  # Copilot runtimes: the extension keeps every version it ever downloaded (~190 MB each). Keep the newest.
  local cdir="$HOME/.cache/copilot/pkg/linux-x64"
  if [ -d "$cdir" ]; then
    local newest; newest="$(ls -1 "$cdir" | sort -V | tail -1)"
    for v in "$cdir"/*/; do v="${v%/}"; [ "$(basename "$v")" = "$newest" ] || { rm -rf "$v"; ok "copilot $(basename "$v") removed (kept $newest)"; }; done
  fi

  # Puppeteer browsers: keep the build the pinned puppeteer wants, drop orphans left by one-off npx runs.
  local rev; rev="$(grep -rho "chrome: *'[0-9.]*'" "$WS/lucid-winds/node_modules/puppeteer-core/lib" 2>/dev/null | head -1 | grep -o '[0-9.]*')"
  if [ -n "$rev" ]; then
    for kind in chrome chrome-headless-shell; do
      for v in "$HOME/.cache/puppeteer/$kind"/linux-*/; do
        [ -d "$v" ] || continue; v="${v%/}"
        [ "$(basename "$v")" = "linux-$rev" ] || { rm -rf "$v"; ok "puppeteer $kind $(basename "$v") removed (pinned: $rev)"; }
      done
    done
  else
    warn "puppeteer pin not found (no node_modules?) - browser cache left alone"
  fi

  python3 -m pip cache purge >/dev/null 2>&1 && ok "pip cache purged"
  # Gradle keeps the distribution zip beside the unpacked copy it actually runs.
  find "$HOME/.gradle/wrapper/dists" -name '*.zip' -delete 2>/dev/null && ok "gradle wrapper zips removed"
  # Ignored build output that its own script rebuilds (from the Sep 17 clean).
  for d in "$WS/lucid-winds/store/jimothy-itch/dist" "$WS/lucid-winds/publish/build"; do
    [ -d "$d" ] && rm -rf "$d" && ok "$(basename "$(dirname "$d")")/$(basename "$d") removed (rebuilds from its script)"
  done

  # What is big and MUST stay. Print it so nobody deletes it for space.
  printf "\n%s\n" "── big and not regenerable (vault, never delete)"
  for d in "$WS/lucid-winds/satellites/dewball/tools/forge/meshy-out" "$WS/lucid-winds/satellites/ripcord/tools/forge3d/meshy-out"; do
    [ -d "$d" ] && dim "$(du -sh "$d" | cut -f1)  ${d#$WS/}  (Meshy credits)"
  done
  dim "$(du -sh "$WS/lucid-winds/.git" | cut -f1)  lucid-winds/.git  (the history; 3.3 GB of it is the live tree itself)"

  local after; after="$(df -BM --output=avail /workspaces | tail -1 | tr -dc 0-9)"
  printf "\n%s\n" "freed $(( (after - before) / 1024 )) GB ($(( after / 1024 )) GB free now)"
  disk_report
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
  disk_report
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
  clean)     cmd_clean ;;
  *) echo "usage: ./workspace.sh [status|pull [--all]|save|clean]"; exit 1 ;;
esac
