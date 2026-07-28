# chameleon-3d — vendored copy, NOT the source of truth

This is a **fork** of `Stephenuffugus/abduct_a_chameleon` (upstream commit
`d57a94f`) plus the orientation-gate patch in
`/handoff-chameleon/0001-3d-orientation-gate-and-touch-mouse-prompt.patch`.

## Why it is here

The live github.io build traps every phone behind the "turn it sideways" prompt:
`#rotate` is an opaque full-screen overlay with no dismiss path, and it sits on
top of `#tapStart` — the one control that would have rotated the screen. Stephen
hit it repeatedly ("i turn it sideways and nothing happens").

The fix was written and verified on 2026-07-28, but it **cannot be pushed
upstream from this codespace**: the Codespaces `GITHUB_TOKEN` is scoped to
`lucid-winds` only and the push 403s. Rather than leave the game unplayable, the
fixed build is served from here and the portal card points at it.

## ⚠️ Drift warning

Upstream 3D commits do **not** reach this copy. As soon as a push credential
exists (`gh auth login --with-token` with a PAT that has `repo`):

1. `git clone https://github.com/Stephenuffugus/abduct_a_chameleon.git`
2. `git am < handoff-chameleon/0001-*.patch`, push to `main`
3. Point the portal card in `portal/index.html` back at
   `https://stephenuffugus.github.io/abduct_a_chameleon/abduct-3d.html`
4. Delete this folder

## Contents

`index.html` (upstream `abduct-3d.html`, patched) + the only two things it loads
from its own origin: `assets/` (character + prop `.glb`) and `maps/` (level
JSON). Three.js and Playroom come from CDNs, so nothing else was needed.

## Known pre-existing bug (NOT caused by the fork)

The Kenney prop `.glb` files reference `assets/props/Textures/colormap.png`,
which **does not exist upstream either** — three 404s on every load, and the
props render untextured. Same on the live github.io build. Needs the Kenney
palette PNG dropped in at that path.

## Verified 2026-07-28

Through the real portal jukebox iframe on an emulated Pixel 9, real Playroom
lobby: prompt appears in portrait, one tap escapes it on a phone that never
rotates, the same tap clears `tapStart`, the touch stick is under the thumb
afterwards, rotating back to portrait does not re-trap, a phone that *can*
rotate still clears the prompt normally. Probe:
`handoff-chameleon/rotate_verify.js`.
