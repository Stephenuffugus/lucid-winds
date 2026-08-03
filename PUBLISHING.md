# PUBLISHING — getting Sky Wolf games onto external networks

> Started 2026-08-03 from the GameDistribution and GameMonetize replies.
> Strategy: non-exclusive syndication everywhere that takes HTML5 —
> the portal stays the home; publisher builds are stripped copies.

## Status board

| Network | Contact | State | Next actor |
|---|---|---|---|
| GameDistribution (Azerion) | Sabina, s.sturzova@azerion.com | Replied 8/03 with full intake steps. ZIP built, draft reply in Gmail. | **Stephen**: create dev account at gamedistribution.com (profile + payment details), create the game entry, send me the gameId |
| GameMonetize | Marian, mentolatux@gamemonetize.com | Replied 7/29: one game first, quality-reviewed. ZIP built, draft reply in Gmail. | **Stephen**: dev account at gamemonetize.com, game entry → gameId |
| itch.io | — | Jimothy already live | more titles whenever |
| CrazyGames / Poki | — | not yet contacted | outreach after first GD/GM acceptance (stronger pitch with a live track record) |

## Division of labor

**Stephen (once, ~15 min per network):** create the developer account, fill
payment details, create a game entry to obtain the game ID, upload the ZIP,
hit send on the two Gmail drafts.

**Claude Code (repeatable):** `scripts/pub_build.py` turns any satellite
into a publisher ZIP — strips the Sunbeam economy (calls are null-guarded),
neutralizes SWS_EXIT/portal links (networks forbid external links),
removes canonical/og pointers, injects the target SDK verbatim from their
docs, hooks the ad break into the win screen with a 180 s throttle, syntax-
checks every inline script it emits, zips, and flags any leftover
our-domain URL. Marketing assets are generated at the mandatory sizes.

```
python3 scripts/pub_build.py satellites/<game> --target gd --game-id <ID>
python3 scripts/pub_build.py satellites/<game> --target gm --game-id <ID>
# output: publish/dist/<game>-<target>.zip
```

⛔ Rebuild with the REAL game ID before uploading — the placeholder build
loads the game fine but serves no ads and may fail review.

## Pilot: Blooming Words (chosen by dependency audit)

- 696 KB, fully self-contained, zero external calls after the build pass.
- ZIPs: `publish/dist/blooming-words-{gd,gm}.zip` (571 KB, placeholder ID).
- Marketing: `publish/marketing/blooming-words/` — 512x384, 512x512,
  200x120 (mandatory), 1280x720, 1280x550 (optional).
- Ad placement: preroll (SDK automatic) + midroll on `completeLevel`,
  throttled to one per 3 minutes — matches GameMonetize's published
  guidance (play button and win/lose screens; never on initial load).

## Queue after the pilot clears

1. **Hues** — 8 MB, needs the same pass (16 our-domain refs, music shelf).
2. **Jimothy (stream-hop)** — 404 MB as-is; needs a DIET build (trim skins,
   music, unused decades art) before any network will take the ZIP.
3. Then the catalog, best-first, one per week per network.

## Verified SDK contracts (from their own repos, 2026-08-03)

- GameMonetize: `https://api.gamemonetize.com/sdk.js`, `window.SDK_OPTIONS
  {gameId, onEvent: SDK_GAME_PAUSE/SDK_GAME_START/SDK_READY}`, ads via
  `sdk.showBanner()`.
- GameDistribution: `https://html5.api.gamedistribution.com/main.min.js`,
  `window.GD_OPTIONS {gameId, onEvent}`, ads via `gdsdk.showAd()` behind a
  user gesture; rewarded fires `SDK_REWARDED_WATCH_COMPLETE`.
