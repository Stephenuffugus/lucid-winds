# JIMOTHY — App Store Publishing Kit
_Last updated 2026-07-21. Everything Stephen needs to list Jimothy, in one place._

The web game is the launch surface and is LIVE right now at
**https://lucidwinds.com/satellites/stream-hop/** (installable as an app from the
browser menu on both Android and iPhone — it has the full PWA setup: icon,
splash, standalone mode, offline shell).

The Google Play listing rides on top of that same URL as a Trusted Web Activity.
No new code is needed; the steps below are console work.

---

## 1. What already exists (nothing to make)

| Asset | Where |
|---|---|
| App icon 512x512 + 192 + maskable | `assets/icons/` (referenced by the manifest) |
| Feature graphic 1024x500 | `store-listing/feature-graphic-1024x500.jpg` |
| Share/OG card 1200x630 | `assets/og-jimothy.jpg` |
| Screenshots 1080x1920 | `store-listing/shot-*.png` (regenerate any time with the probe) |
| Privacy policy | https://lucidwinds.com/privacy.html (LIVE) |
| Manifest + service worker | `manifest.webmanifest`, `sw.js` (network-first) |

## 2. Store listing copy (paste as-is)

**App name (30 max):** `Jimothy: Seattle Raccoon Hop`

**Short description (80 max):**
`Hop Seattle's roundest raccoon through rain, traffic and ferries to the feast.`

**Full description:**

> Meet Jimothy, Seattle's roundest and most beloved raccoon. Somewhere across
> the rainy city waits the greatest dumpster feast in town, and the only way
> there is through: past the geese, the rolling coffee cans, the light rail,
> and straight across Puget Sound on whatever floats.
>
> HOP THE WHOLE CITY
> A never ending Adventure through six real Seattle neighbourhoods, from the
> Waterfront to the Ballard Locks, level after level, each with three stars to
> earn. Or chase pure distance in Endless, race the clock in Rush Hour, and
> unwind in the no-fail Zen Meadow.
>
> COLLECT THE WHOLE CREW
> Every bottlecap you grab feeds the Prize Bin. Pull 21 playable Seattle
> critters and costumes: the crosswalk pigeon, the Ballard crow, the banana
> slug, the orca, and a couple of secrets nobody will tell you about. Find all
> eight hidden Seattle landmarks and earn 23 badges, five of them seasonal.
>
> PROPER SEATTLE WEATHER
> Rain slicks the streets and speeds the traffic. Fog rolls in and hides the
> road ahead. Stay out in it too long and something pale may find you.
>
> AN ORIGINAL SOUNDTRACK
> Six original tracks by Sky Wolf Studios, earned through play.
>
> Free forever. No ads. No energy bars. A single optional $3 Supporter Pack
> unlocks the costumes and soundtrack instantly, and never sells progress.
> Made with love in the Pacific Northwest.

**Category:** Arcade · **Tags:** casual, arcade, endless hopper
**Content rating questionnaire:** Everyone (no violence beyond cartoon bonks, no user chat, no gambling; contains a $3 digital purchase — answer "yes" to in-app purchases)
**Ads:** NO. **Privacy policy URL:** `https://lucidwinds.com/privacy.html`
**Data safety form:** collects email ONLY if the player creates the optional free account (Firebase Auth); game progress stored on device; no ads SDKs, no data sold.

## 3. Google Play, step by step

1. **Play Console account** — play.google.com/console, one-time $25. Identity
   verification can take a day; start it first.
2. **Package the app** — go to **pwabuilder.com**, paste
   `https://lucidwinds.com/satellites/stream-hop/`, click through to
   **Package for stores → Android**. Accept defaults (TWA). Download the ZIP:
   it contains the signed `.aab`, and `assetlinks.json`.
3. **Digital asset links** — the `assetlinks.json` from that ZIP must be served at
   `https://lucidwinds.com/.well-known/assetlinks.json`.
   Hand the file to Claude Code ("here's the assetlinks, deploy it") and it goes
   in the repo as `.well-known/assetlinks.json` — one commit, auto-deploys.
   Without this the app shows a browser address bar on top of the game.
4. **Create the app** in Play Console → upload the `.aab` to **Closed testing**
   (NOT production — see step 5) → paste the listing copy + graphics above →
   fill content rating + data safety with the answers above.
5. **The 12-tester runway (the only real wait):** new personal accounts must run
   a closed test with **12 testers for 14 continuous days** before production
   access. Make it a community moment: post "join the Jimothy testing crew" with
   the opt-in link Play gives you — his fans will fill 12 slots in an hour, and
   the community LOVES being deputized. Production submit ~2 weeks later.
6. **Meanwhile the web link is the store**: share
   `https://lucidwinds.com/satellites/stream-hop/` today. Android Chrome offers
   "Add to Home screen" (full app: icon, splash, no browser chrome). On iPhone:
   Share → Add to Home Screen. Word it exactly like that in the post.

## 4. iOS App Store (later, optional)

PWABuilder can also produce an Xcode iOS wrapper, but that needs an Apple
Developer account ($99/yr) and a Mac to submit. The Add-to-Home-Screen PWA is
already a first-class iPhone experience; recommend shipping Play first and
deciding on iOS after launch traction.

## 5. In-app purchase note (important, not urgent)

The $3 Supporter Pack currently checks out through the studio's web rail
(NOWPayments crypto invoice). That is fine for the WEB game. Google Play policy
requires digital goods bought **inside the Play-installed app** to use Play
Billing — before the production submit we either (a) hide the pack when running
inside the TWA (one-line check, honest, common), or (b) wire Play Billing's
Digital Goods API to the same sw_supporter fulfillment. Option (a) ships day
one; (b) is a fast follow. Flag this to Claude Code when the Play build is real.
