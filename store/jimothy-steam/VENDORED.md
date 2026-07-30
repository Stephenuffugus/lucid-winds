# Jimothy on Steam — the desktop wrapper

Steam will not take a URL. It takes an executable. This wraps the real game in
Electron and ships it as one.

## ⚠️ app/ IS A COPY

`app/` is generated, not authored, and it is gitignored. The canonical game is
`satellites/stream-hop/index.html`. **Run `./vendor.sh` before every upload** or
Steam players get a stale Jimothy while the web build moves on.

## What vendor.sh changes, and why

The web build reaches out for three things a desktop build must not depend on.
Each rewrite happens in the COPY, never in the canonical game.

1. **`/sunbeam-sdk.js`** is the only root absolute reference in the whole file.
   It gets vendored beside the page and the tag made relative.
2. **Google Fonts.** Fredoka and Nunito are vendored as woff2 with a local
   stylesheet, so the game LOOKS right with no network. Without this it silently
   falls back to a system font and the wordmark is wrong.
3. **Firebase.** The sunbeam SDK lazy loads the compat SDK from gstatic to sync
   earnings to a cloud account. A Steam build has no account, so the loader is
   short circuited to a rejection, which callers already treat as offline.
   Earning still works. It just stays on the machine.

Also dropped: the service worker registration (a desktop app caches nothing
useful and the splash hang bug class is not worth inheriting) and the web
manifest tag (no install flow, and it only produced a missing file error).

Excluded from the bundle: `art-drop*`, `art-sheets`, `music-drop`, `scripts`,
the markdown docs and `sw.js`. Those are source, never loaded at runtime.
Bundle size is about 230MB, nearly all of it the 45 costumes.

## Verified

`scratchpad/steam_bundle_probe.js` drives the vendored bundle in a browser with
**the network switched off**: it boots, it reaches for nothing, a real Adventure
level plays, no service worker takes over, every file it asks for is present,
and the console is clean. Screenshot confirms the real splash art and the
correct font.

## Building

    npm install
    npm start            # vendor + run locally
    npm run dist:win     # vendor + package for Windows

## Still Stephen's to do

- Steamworks onboarding must clear before an app exists to upload to.
- Store copy is written and waiting in `marketing/steam-jimothy.md`.
- Capsule art sizes are listed there too.
- Price: $2.99 recommended.
