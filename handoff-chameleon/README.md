# Chameleon 3D — phone fixes, waiting on a push credential

**Status:** built, verified, committed — but NOT yet pushed to
`Stephenuffugus/abduct_a_chameleon`. It lives here so a codespace restart
cannot eat it. Meanwhile the same fixes ARE live to players: the patched build is
vendored at `satellites/chameleon-3d/` and the portal card points there
(see `satellites/chameleon-3d/VENDORED.md`).

**Two patches now, apply both in order:**

1. `0001-…-turn-it-sideways-…` — the orientation gate was a dead end.
2. `0002-…-left-and-right-were-mirrored-…` — `moveLocal()` built its strafe axis
   as `UP × fwd`; the camera looks along `fwd`, so screen-right is `fwd × UP`.
   Every strafe input (touch, keyboard A/D, gamepad X) was mirrored. Measured on
   an instrumented copy: before, stick RIGHT moved 4.5 units along screen-LEFT;
   after, RIGHT/LEFT/FORWARD all correct.

## The bug Stephen hit

> "when abduct a chameleon tells you to turn it sideways i do and nothing happens"

Two separate walls, both in `abduct-3d.html`, both only reachable **after** you
tap Launch. (`setupTouch()` runs after `await insertCoin()` resolves, so neither
can appear during the Playroom lobby — that is why it looks like the lobby is
fine and the game is broken.)

1. **The rotate prompt was a dead end.** `#rotate` is opaque, `inset:0`,
   `z-index:70`, and had no dismiss path. It cleared only on a `resize` that
   reported `innerHeight <= innerWidth`. Any phone that cannot actually produce a
   landscape viewport — OS rotation lock on, an installed PWA whose manifest pins
   portrait, an iframe in a portrait container — sealed the player behind a black
   screen permanently. Worse, it covered `#tapStart` (z-65), which is the **one**
   control that would have rotated the screen for them via
   `screen.orientation.lock('landscape')`.

2. **A desktop mouse prompt sat behind it.** `init()` calls `setupTouch()` (which
   hides `#clickToPlay`) and then unconditionally re-shows `#clickToPlay` four
   lines later. Every phone that got past the rotate gate was handed
   "Click to capture mouse" on top of the game.

## What the fix does

- Listens to `orientationchange`, a `matchMedia('(orientation:portrait)')`
  change event, and `pageshow` — not just `resize`.
- Re-checks at +250ms and +700ms, because mobile browsers report stale
  dimensions mid-rotation.
- Treats the viewport as landscape if **either** signal says so, biasing toward
  letting the player in rather than holding the gate.
- Makes the prompt itself tappable: it tries fullscreen + orientation lock first
  (which really does turn the screen on Android), then gets out of the way
  regardless. Dismissal sticks, so rotating back to portrait cannot re-trap.
- Clears `#tapStart` in the same tap — one tap into the game instead of two.
- Gates the `#clickToPlay` re-show on `!touch.on`.

## Verification

`rotate_verify.js` (in this folder) drives the **real** game through the **real**
Playroom lobby on an emulated Pixel 9. 6/6 pass, 0 JS errors:

| check | result |
|---|---|
| prompt appears in portrait | PASS |
| tapping it escapes into the game on a phone that never rotates | PASS |
| the same tap clears `tapStart` | PASS |
| rotating back to portrait does not re-trap | PASS |
| a normal phone rotating to landscape still clears it (no regression) | PASS |
| element under the player's thumb after escaping | went from the desktop prompt paragraph to `stickR`, the real touch control |

Run it with:

```bash
git clone https://github.com/Stephenuffugus/abduct_a_chameleon.git
cd abduct_a_chameleon && git am ../000*.patch
python3 -m http.server 8899 &
node rotate_verify.js "http://localhost:8899/abduct-3d.html" .
```

## Why it is not pushed yet

The codespace's default `GITHUB_TOKEN` (`ghu_…`) is scoped to **lucid-winds
only**. `gh api repos/…/abduct_a_chameleon` reports `push: true` (that is the
*user's* permission, not the token's), but the actual push returns:

```
remote: Permission to Stephenuffugus/abduct_a_chameleon.git denied to Stephenuffugus.
fatal: … The requested URL returned error: 403
```

The broader `gho_…` token normally lives in `~/.config/gh/hosts.yml`, which a
fresh codespace does not have. See `reference_cross_repo_push` in memory.

**To ship it, run this once in this codespace:**

```bash
gh auth login          # choose GitHub.com -> HTTPS -> browser
```

then:

```bash
cd /tmp/.../scratchpad/abduct_a_chameleon   # or re-clone and `git am` the patch
env -u GITHUB_TOKEN -u GH_TOKEN git -c credential.helper='!gh auth git-credential' \
  push origin HEAD:main
```

GitHub Pages redeploys on push, so the live game updates on its own. There is no
cache-bust on `abduct-3d.html` (the URL is stable and pushed to often), so
hard-refresh to see it.
