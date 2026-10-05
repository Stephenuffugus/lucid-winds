#!/usr/bin/env bash
# Runs when a codespace is created AND every time its container is rebuilt.
#
# A rebuild keeps /workspaces and throws away everything else: the gh login, the
# memory directory, Chrome, Claude Code itself. This puts all of it back with
# nobody at a keyboard. Written 4 Oct 2026: the container died at 17:55 UTC, came
# back in recovery mode, and the old way back needed a token pasted into a
# terminal from a phone.
#
# The one thing it needs is a Codespaces secret named GH_PAT
# (github.com/settings/codespaces): a classic token with repo, workflow and
# read:org, given access to lucid-winds. Without it everything public still
# works and the summary at the end says what did not.
#
# Safe to run again by hand: bash .devcontainer/bootstrap.sh
set -uo pipefail
cd "$(dirname "$0")/.." || exit 0
LOG=/workspaces/.bootstrap.log
exec > >(tee -a "$LOG") 2>&1
echo
echo "== bootstrap $(date -u '+%F %T UTC')"

step(){ printf '\n-- %s\n' "$*"; }
# The codespace's own GITHUB_TOKEN reaches lucid-winds only; with it set, gh and
# git use it for every repo and the private ones 403. Strip it for these calls.
GH="env -u GITHUB_TOKEN -u GH_TOKEN gh"
SUMMARY=()

step "GitHub login"
if [ -n "${GH_PAT:-}" ]; then
  # chmod as well as umask: a directory's default ACL overrides umask.
  ( umask 077; printf '%s\n' "$GH_PAT" > "$HOME/.gh_pat" ); chmod 600 "$HOME/.gh_pat"
  if printf '%s\n' "$GH_PAT" | $GH auth login --hostname github.com --git-protocol https --with-token --insecure-storage 2>/dev/null \
     || printf '%s\n' "$GH_PAT" | $GH auth login --hostname github.com --git-protocol https --with-token 2>/dev/null; then
    echo "gh logged in"
  else
    # gh refuses a token without read:org, which nothing here uses: store it directly.
    mkdir -p "$HOME/.config/gh"
    ( umask 077; printf 'github.com:\n    oauth_token: %s\n    git_protocol: https\n    user: Stephenuffugus\n' "$GH_PAT" > "$HOME/.config/gh/hosts.yml" ); chmod 600 "$HOME/.config/gh/hosts.yml"
    echo "gh token stored without a login check (it has no read:org)"
  fi
  $GH auth setup-git 2>/dev/null && echo "git uses the gh login for github.com"
  who="$($GH api user --jq .login 2>/dev/null)"
  if [ -n "$who" ]; then SUMMARY+=("ok    GitHub: $who, private repos and pushes work")
  else SUMMARY+=("FAIL  GitHub: the GH_PAT secret is set but GitHub refused it (expired? wrong scopes?)"); fi
else
  SUMMARY+=("FAIL  GitHub: no GH_PAT secret. Private repos, memory and pushes will not work")
fi

step "repos and memory"
chmod +x workspace.sh 2>/dev/null || true
./workspace.sh pull || true
MEM="$HOME/.claude/projects/-workspaces-lucid-winds/memory"
if [ -f "$MEM/MEMORY.md" ]; then
  last="$(git -C "$MEM" log -1 --format='%cd' --date=format:'%d %b %H:%M' 2>/dev/null)"
  SUMMARY+=("ok    memory: $(find "$MEM" -name '*.md' | wc -l | tr -d ' ') notes from sws-memory, last saved $last")
  if [ -f "$MEM/claude-config/settings.json" ] && [ ! -f "$HOME/.claude/settings.json" ]; then
    cp "$MEM/claude-config/settings.json" "$HOME/.claude/settings.json" && echo "Claude settings restored"
  fi
else
  SUMMARY+=("FAIL  memory: not restored (needs GH_PAT)")
fi

step "Claude Code"
export PATH="$HOME/.local/bin:$PATH"
if ! command -v claude >/dev/null 2>&1; then
  curl -fsSL https://claude.ai/install.sh | bash >/dev/null 2>&1 || true
fi
if command -v claude >/dev/null 2>&1; then SUMMARY+=("ok    Claude Code: type  claude")
else SUMMARY+=("FAIL  Claude Code did not install. Type: curl -fsSL https://claude.ai/install.sh | bash"); fi

step "Node 24 (the recorded worlds and test timings were made on 24)"
export NVM_DIR="${NVM_DIR:-/usr/local/share/nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
case "$(node -v 2>/dev/null)" in
  v24.*) ;;
  *) if command -v nvm >/dev/null 2>&1; then nvm install 24.14.0 >/dev/null 2>&1 && nvm alias default 24.14.0 >/dev/null 2>&1; fi ;;
esac
case "$(node -v 2>/dev/null)" in
  v24.*) SUMMARY+=("ok    node $(node -v)") ;;
  *) SUMMARY+=("FAIL  node is $(node -v 2>/dev/null || echo missing), wanted 24") ;;
esac

step "Chrome for the look scripts (puppeteer in lucid-winds, MIGRATION.md section 6)"
if [ -d node_modules/puppeteer ]; then
  npx --yes puppeteer browsers install chrome 2>&1 | tail -1
  if node -e "require('/workspaces/lucid-winds/node_modules/puppeteer').launch({headless:'new',args:['--no-sandbox']}).then(b=>b.version().then(v=>{console.log(v);return b.close()})).catch(e=>{console.error(e.message);process.exit(1)})" >/tmp/chrome-check.txt 2>&1; then
    SUMMARY+=("ok    Chrome: $(head -1 /tmp/chrome-check.txt)")
  else
    SUMMARY+=("FAIL  Chrome does not launch: $(head -1 /tmp/chrome-check.txt)")
  fi
else
  SUMMARY+=("FAIL  Chrome: lucid-winds has no node_modules, run npm install there")
fi

step "summary"
free_ws="$(df -h /workspaces | awk 'NR==2{print $4" free of "$2}')"
SUMMARY+=("info  disk /workspaces: $free_ws (one heavy job at a time on this machine)")
printf '\n  Sky Wolf workspace, rebuilt %s\n' "$(date -u '+%F %H:%M UTC')"
printf '  %s\n' "${SUMMARY[@]}"
printf '\n  Then: claude, and say "lets get started". Full log: %s\n\n' "$LOG"
exit 0
