# PUBLISHING — getting Sky Wolf games onto external networks

> Started 2026-08-03 from the GameDistribution and GameMonetize replies.
> Strategy: non-exclusive syndication everywhere that takes HTML5 —
> the portal stays the home; publisher builds are stripped copies.

## Status board

| Network | Contact | State | Next actor |
|---|---|---|---|
| GameDistribution (Azerion) | Sabina, s.sturzova@azerion.com | **Twelve games + Jimothy built and verified (Fable re-ran all 26 ZIPs on 2026-09-02 evening after finding two shipped with the playfield hidden; builder fixes BF10-12, see `publish/HANDOFF-PUB1.md` §9), marketing at all five sizes done, reply written.** ⚠️ Nova Bloom needs real card art before it goes anywhere. See `publish/QUEUE.md` and `publish/REPLY-GD.md`. | **Stephen**: dev account at gamedistribution.com (profile + payment details), create the game entry, send Fable the gameId, send `publish/REPLY-GD.md` |
| GameMonetize | Marian, mentolatux@gamemonetize.com | Same, and Marian asked for **one game first**. Lead with Bloom Breaker; his mail says "not simple ones" and it has 60 levels, 24 powerups and a boss in 44 KB. `publish/REPLY-GM.md`. | **Stephen**: dev account at gamemonetize.com, game entry → gameId, send `publish/REPLY-GM.md` |
| itch.io | — | Jimothy already live | more titles whenever |
| CrazyGames | — | requirements read 2026-09-02, three titles chosen, submission text written | **Stephen**: `publish/PITCH-CRAZYGAMES.md`. ⛔ Needs a third builder target: their SDK, and a rival network's SDK inside the build is a third party ad system. |
| Poki | — | requirements read 2026-09-02, ⚠️ **they prefer web exclusivity**, so anything that goes to GD or GM can only be their flat fee non exclusive licence | **Stephen**: read the exclusivity section of `publish/PITCH-POKI.md` and choose the door before sending |

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

## The batch of ten (2026-09-02)

`publish/QUEUE.md` is the record: how the ten were chosen out of 84 screened, the twenty
ZIPs and the assertions each one passed, the nine builder fixes the verification forced,
the fifty marketing images, and the Jimothy diet from 400.7 MB to 54.3 MB.

```
Bloom Breaker · Berry Vine · Petal Slice · Dew Snip · Picnic Panic
Bubblenaut · Stop the Light · Nova Bloom · Garden Guard · Pong Arena
```

⛔ Every ZIP in `publish/dist/` carries a PLACEHOLDER game id and therefore serves no
ads. Rebuild with the real id before any upload; that is one command and under a minute.

## Queue after the pilot clears

1. **Hues** — DONE 2026-08-07: `publish/dist/hues-{gd,gm}.zip` (7.9 MB,
   placeholder ID). Builder upgraded for the whole fleet: absolute-URL SDK
   strip, our-domain string sweep, feedback fab + jukebox + PWA refs out
   (stubs injected so nothing 404s), midroll auto-hooks `_sbCapEarn` earn
   sites when no named round-end function exists. Verified booted + played
   an Endless round headless, zero own-404s. ⛔ Rebuild with the real
   gameId before upload, same as the pilot.
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
