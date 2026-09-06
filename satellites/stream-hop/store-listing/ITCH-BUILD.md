# Jimothy on itch.io — Tier 2 (embedded playable build)

Tier 1 (the link page) needs nothing but `ITCH-LISTING.md`. This file is Tier 2: uploading
a self-contained bundle so the game runs on the itch page itself.

## It works. The one real risk is resolved.
The genuine unknown was whether a **Sky Wolf Studio account sign-in survives inside
itch's cross-origin iframe** (browsers partition storage for third-party frames). Tested it
end to end — game served from one origin, embedded in an iframe on a different origin, exactly
like itch embedding `itch.zone` inside `itch.io`:

- ✅ boots and plays in the cross-origin iframe
- ✅ Firebase loads (lazy, from gstatic — needs no bundling)
- ✅ **sign-in works AND survives an iframe reload** (throwaway account created, persisted,
  deleted)
- ✅ the paid Supporter Pack UI is hidden (itch owns that rail)

⚠️ Tested in Chromium. Safari's ITP is stricter; email/password auth (no popup) is the safe
path and is what Sunbeam uses, so it should hold, but confirm on a real iPhone before leaning
on it. Worst case: accounts just do not persist on itch and the game falls back to
device-local save, which is fine — nothing breaks.

## How to build it

    node scripts/build-itch.mjs          # -> build-itch/  (git-ignored)
    (cd build-itch && zip -qr ../jimothy-itch.zip .)

The script makes two changes and nothing else:
1. the one root-absolute path `/sunbeam-sdk.js` -> relative (itch serves from a subpath)
2. sets `window.__ITCH_BUILD=true`, which hides the in-game card/crypto checkout (the
   `ITCH_BUILD` / `STRIPE_ON` flag). Accounts, costumes and cloud save all stay.

⛔ The flag defaults false, so the deployed game on lucidwinds.com is byte-unaffected.

## Uploading to itch
- New project → upload `jimothy-itch.zip` → tick **"This file will be played in the browser."**
- Set the embed **viewport to 412 × 915**, enable **Mobile friendly** and **Fullscreen**.
- itch unpacks the zip and serves it from `html-classic.itch.zone` in an iframe.

## The one thing to weigh: size
The bundle is **~226 MB** (44 characters × 19 poses + backgrounds). That is within
itch's 1 GB limit and the game lazy-loads sprites, so a player only downloads what they
meet (~10–20 MB a session) — but the one-time upload is chunky and itch's browser uploader
can be flaky at that size. Two options if it is a problem:
- upload with **Butler** (itch's CLI) instead of the browser — handles big files and does
  delta patches on future updates;
- or trim the art (lossy PNG recompress could cut it 50–70%) — but that is **Stephen's call**,
  he is protective of the painting quality, so do not do it without asking.

## Recommendation
Do **Tier 1 now** (30 min, zero risk, real discovery + SEO). Ship **Tier 2 when there is a
reason to** — an itch game jam, a featured slot, or just wanting the play-in-place button.
The build is proven and one command away whenever that day comes.
