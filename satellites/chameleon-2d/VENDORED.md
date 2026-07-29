# ⚠️ FORK — vendored copy of Abduct a Chameleon (2D)

**Canonical repo:** `github.com/Stephenuffugus/abduct_a_chameleon` (branch `main`).
This folder exists because the 2026-07-29 gameplay pass (capture rework, 2/4/6
UFO fleets, tongue + burrow abilities, riverline bridges) could not be pushed
upstream: the 7-day PAT at `~/.gh_pat` returned **401 Bad credentials** that day
(worked 24h earlier for the un-fork; revoked or rotated). Same law as Jul 28:
a fix you cannot deliver is not a fix — so the patched build ships from here
and the portal 2D card points at `/satellites/chameleon-2d/`.

Upstream commits exist ONLY in this repo as patches: `/handoff-chameleon-2d/
0001-*.patch` + `0002-*.patch` (game pass + 19-assertion capture test suite).

## Un-fork steps (needs a fresh PAT with `repo` scope from Stephen)

```bash
echo 'ghp_NEW' > ~/.gh_pat && chmod 600 ~/.gh_pat
git clone https://github.com/Stephenuffugus/abduct_a_chameleon.git /tmp/aac
cd /tmp/aac && git am /workspaces/lucid-winds/handoff-chameleon-2d/*.patch
cd test && npm i && (cd ../server && npm i) && npm run all && npm run capture   # must be green
T=$(cat ~/.gh_pat) && git push https://x-access-token:$T@github.com/Stephenuffugus/abduct_a_chameleon.git main
# then: repoint portal/index.html card url back to
#   https://stephenuffugus.github.io/abduct_a_chameleon/?v=<today>
# verify the live github.io build sha-matches this folder's index.html,
# delete satellites/chameleon-2d/ + handoff-chameleon-2d/, push lucid-winds.
```

⛔ Do NOT `gh auth login --with-token` with the PAT (gh refuses tokens lacking
`read:org`). Use the token directly in the push URL, as above.

Note: pointing the card at `/satellites/` makes it a full-page NAVIGATION
instead of the jukebox iframe (portal interceptor only iframes `/play/` +
`github.io` URLs). Known trade-off, same as the Jul 28 chameleon-3d vendoring.
The game's P22 embed/earn bridge was never wired to pay Sunbeams, so nothing
is lost by leaving the iframe path.
