# Jimothy on itch.io — the free lane

Paste ready. The build is a command; the account and the upload are Stephen's.

## Why this exists

itch costs nothing, needs no review, hosts HTML5 directly, and gives us a public
storefront link the same week. Steam is the flagship listing with the wishlists
and the revenue; itch is the one we can have live immediately and point at in
any pitch. They do not compete: the itch build hides every payment surface,
because itch owns that rail.

## Build it

    ./store/jimothy-itch/build.sh

Produces `store/jimothy-itch/dist/jimothy-itch.zip`.

⚠️ **Re-run before every upload.** The staged copy is exactly that, a copy of
`satellites/stream-hop`, and the live game moves.

### What the script changes, and why

1. **The one root absolute path.** `/sunbeam-sdk.js` is the only reference of its
   kind in the whole game, and inside an itch iframe it resolves against itch.io
   and 404s. Made relative.
2. **`window.__ITCH_BUILD=true`** injected as the first thing in the head. The
   game already reads this into `STORE_BUILD` and darkens the Supporter Pack, the
   card checkout, the crypto button and all three donate buttons. The script
   asserts the flag exists in the game and lands before the game reads it, so it
   cannot silently rot into a no-op.
3. **No service worker.** A worker scoped to somebody else's asset host is a
   support ticket, and the splash-hang bug class is not worth inheriting on a
   page that is online by definition.
4. **No PWA manifest.** Meaningless in an iframe and it only produces a 404.

Verified in a browser: flag set, every payment surface hidden, no worker, no
manifest tag, zero 404s, zero console errors.

## Upload settings on itch

- **Kind of project:** HTML
- **Upload:** `jimothy-itch.zip`, then tick **This file will be played in the browser**
- **Embed:** click to launch in fullscreen, **manually set size 540 x 960**
  (Jimothy is portrait by design, and letting itch guess gives a squashed frame)
- **Mobile friendly:** yes
- **Pricing:** No payments, or Donate. ⛔ Not Paid, because the Steam build is
  the paid lane and a paid itch copy undercuts it.
- **Visibility:** Public when you are ready.

### About the size

The zip is about 228MB, nearly all of it the 45 costumes at 605 PNGs. That is an
upload cost, not a load cost: itch serves the files over HTTP on demand and the
game only ever fetches the costume a player is actually wearing. First load pulls
a few megabytes. Nothing was compressed or resized, because the art is yours.

## Page copy

**Title:** Jumping Jimothy

**Short description (itch shows this in listings):**
Hop Seattle's roundest raccoon across rainy streets, rooftops, and the canal.

**About:**

Meet Jumping Jimothy, a real Seattle legend with a short spine and a
big appetite.

Hop lane by lane through a rain-soaked city. Every clean hop forward grows your
Feast Trail, and reaching a safe curb banks it for a big score. One bad hop and
the trail is gone.

- A hundred fixed levels through ten Seattle neighbourhoods, from Pike Place to
  the great Downtown feast
- A Daily run shared by every player in the world. One try counts.
- 45 costumes to pull from the Prize Bin, plus secret critters
- Eight hidden Seattle landmarks to find
- Kind to your time. A run takes two minutes.

**AI disclosure (same honest text as the Steam form):**
The artwork in this game was pre generated with AI tools, then hand curated,
cut, and animated by the developer. The game does not generate any content with
AI while you play.

**Tags:** arcade, casual, cute, animals, score-attack, 2d, singleplayer,
family-friendly, seattle, raccoon

**Cover image:** 630x500. Same source art as the Steam header capsule.
**Screenshots:** the same five as Steam, 1920x1080.

## Still Stephen's

Create the itch account, create the project, upload the zip, paste the copy
above, pick the cover art. Nothing else blocks it.
