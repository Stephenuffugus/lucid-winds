# Lucid Winds hub audit, 12 Nov 2026 (Fable)

What this is: one look over the hub (`index.html`) as a player and as code. No hub code was changed.
How it was done: the file was split and parsed; the hub was run in a headless phone browser (412x915) as a
brand new player and as a returning player with 14 seeded plants; all 102 games in the picker were launched
once; every screenshot was opened and read. Shots are in `docs/audits/shots-2026-11-12/`.

Not checked, so do not read a pass into it: a real Pixel, a signed in account (none was made, it would write
to production), the breeding, bloom and wild drop loops end to end, payments, audio, the deployed Firestore
rules, GA4 numbers. Headless Chrome has no emoji font, so the empty boxes in the shots are not bugs.

## The short version

The hub works better than it looks. All 93 script blocks parse, 98 of 102 games launch clean, and the whole
walk threw zero page errors. The server side mint and earn path is in place. The haiku, the backgrounds, the
cinematic art and the Hermit's Hut are strong.

What holds it back, in order:
1. One tab is broken on the live site today (the Wild map).
2. A new player downloads about 53 MB before the first screen, nearly all of it oversized button art.
3. Popups stack on every screen and never leave on their own.
4. A new player must hand over an email and password before playing anything.
5. The plants are shown badly: small, boxed by their auras, and the rarest ones are the hardest to see.
6. The picker holds 102 games of very uneven finish, six of which ask a portrait app to turn sideways.
7. Three things block a Play listing outright: no account deletion, real money buttons with no Play rail,
   and a cannabis plant on the Puzzles banner.

## A. Broken on the live site now

**A1. The Wild map shows "API KEY REQUIRED" on every tile.** (shot 10)
The map loads CARTO tiles (`index.html:52630`, used at `:53511`). CARTO now answers every tile request with a
2,049 byte placeholder reading "API KEY REQUIRED carto.com/basemaps/apikey". A direct request carrying the
lucidwinds.com referrer gets the same placeholder. In the run 8 of 8 tiles were the placeholder. There is no
`tileerror` fallback. `sw.js` keeps tiles in `lw-tiles-v1`, so phones may hold the placeholders after a fix:
bump that cache name with the fix. The Wild Wardens satellite uses the same provider.
Fix: a CARTO key (their page above) or another provider. Small code change either way. Needs Stephen's call.

**A2. A signed out player with saved plants sees an empty greenhouse.** (shot 05)
With 14 plants in local storage and no session, the banner reads "PLANTS: 14 / 14" and `#greenhouse-grid` has
0 children. Calling `window.renderGreenhouse()` by hand draws all of them. Seen in a seeded signed out state;
confirm on a real account that signs out or whose session lapses.

**A3. The first visit downloads about 53 MB.**
107 requests before the first screen. 87 images make 45.6 MB of it. Seventeen UI images are 1.9 to 2.7 MB each
at 1254x1254 for buttons drawn at 140 px or less (`btn-shop-v2.png`, `btn-sunbeams-v2.png`, `btn-dew-v2.png`,
`potshop.png`, `nurseryexpansion.png`, `clippingexpansion.png`, `btn-share.png`, `btn-breed.png`,
`btn-details.png`, `btn-compost.png`, `btn-download-v2.png`, `btn-install-v2.png`, `cutting.png`, `water.png`,
`wilditems.png`, `toplantwildbutton.png`, `btn-compendium.png`). The live site serves them at full size
(`btn-shop-v2.png` is 2.67 MB there). The page has 415 `<img>` tags and 6 are lazy.
Measured fix: the 18 biggest become 0.55 MB as 384 px WebP (38.3 MB before). The nine picker banners are
18.8 MB and become 1.2 MB at 1080 px; today they draw half finished in the picker (shot 08).

**A4. Popups stack and stay.** (shots 01, 03, 04, 13)
First run: the beta notice is the first thing read (the cinematic's words do wait for it; see the second
pass). The music offer then stays on screen until answered and covers the gift plant and the line "This one
began with you". Later screens add the "73 omens" toast (it never left during a four minute
sweep), the Identity Terminal, the morning report, the Pollen explainer, a "wild plants detected" toast and,
inside studio games, a "you unlocked a song" sheet. In a studio game the playable area was about a third of
the screen.

## B. The first five minutes

**B1. The account wall comes first.** (shot 03) Name, email and password are required to claim the gift
plant, before any real game. The only way round is "Just wanna play games?". The funnel events already exist
in GA4 (`onboard_start`, `onboard_tutorial_win`, `onboard_auth_attempt`, `sign_up`, `first_game_started`), so
the drop at this step can be read, not guessed.
**B2. Two sign up forms, two voices.** Onboarding says "Claim your first plant" and asks for 6+ characters.
The Identity Terminal says "SWS CLOUD PROTOCOL", "14 BOTANICAL ASSETS DETECTED LOCALLY", "INITIALIZE IDENTITY"
and asks for 8. Its targets are small: tabs 138x26, inputs 33 px tall, the dismiss link 12 px tall. (shot 04)
**B3. Small breaks on the cinematic.** Beat text runs into the two bottom buttons. The name placeholder is
cut off ("What should we call you, Kee"). (shots 02, 03)
**B4. The greenhouse gives the plants under half the screen.** The first card starts 45% of the way down. A
plant is drawn 95x129 inside a 187x254 card, about a quarter of the card. The "PLANTS: 14 / 14" box uses a
system font. Every card repeats "Ready to breed". (shot 06)
**B5. One plant, two names.** The grid says "Hydrangea Head"; the detail card for the same plant says "The
Shrouded Ammonite of Vinegar". (shots 06, 07)

## C. The look

**C1. The plants are let down by how they are shown, not by how they are drawn.** (shots 07, 16 to 19)
CORRECTED in the second pass. Seen forty at a time on a plain ground the plants have real variety and charm:
teacup, boot and birdhouse pots, raccoons and cranes, moons and light shafts. What hurts them: they are drawn
small inside heavy frames, their flat vector style sits inside painted chrome, eight auras paint a hard edged
box behind the plant, two mutations make the plant nearly invisible on a black card, and a Cosmic does not
look rarer than a Common. Details in the second pass.
**C2. Five art styles share one screen.** Jewel toned painted icons in the top bar, carved stone tiles in the
nav, parchment cards for actions and the nursery, dithered pixel painting in the Hut, and a banner set whose
members do not match each other.
**C3. The Puzzles banner is a cannabis plant.** (shot 15) `assets/games/category-banners/puzzle.png`.
**C4. Buttons without words.** Share, Details, Breed and Compost are picture only; Compost destroys a plant.
"+ SEED $2" and "+ CLIPPING $1" are gold and pink on parchment and hard to read. (shots 07, 09)
**C5. Art with a box behind it.** The SOW medallion on the map has a grey square, the Forager's Lens a black
one, Color Garden a white one. (shots 10, 11, 14)

## D. The games

102 in the picker: 67 native, 35 studio games in frames (9 of those load from `stephenuffugus.github.io`, not
from this site). 98 launched clean.
- Six solitaire games (Golf, Klondike, Spider, FreeCell, Pyramid, TriPeaks) and Pit Bike Rally open on "ROTATE
  TO LANDSCAPE". (shot 12)
- Rhythm and Vine and Stone Garden are listed as "Coming soon". Dragon Philosophy opens on "In development,
  tester key".
- Rhythm Vine threw a promise timeout. Glyph Forge, Tarot Run and Dragon Philosophy each ask for art files
  that answer 404.
- Most native games put a dark board in the middle 40% of the screen with small muted text and leave the
  lower 40% empty. (shot 14)

## E. The code

- 7.14 MB, 105,209 lines, 93 script blocks, 6.37 MB of inline script. 1.36 MB as brotli on the wire.
- The script itself is not what makes boot slow: main thread script time was about 1 s on this 2 core box.
  The Pi SDK is 603 ms of that, the largest single script, and it loads for every web visitor. Four Firebase
  files and Leaflet also load up front.
- 315 distinct localStorage keys, 574 functions on `window`, 754 inline `onclick`, 38 `setInterval`.
- The hub has one automated check (`tools/hub-tests/set_painted.mjs`). Nothing else guards it.
- Good: `earnHashes`, `mintPlant`, `claimPending`, `piApprove`, `piComplete` are called through Cloud
  Functions, so the core economy is not trusted to the client.
- The web root is the repo. The live site answers 200 for `CLAUDE.md`, `START-HERE.md`,
  `functions/index.js`, `firestore-rules-8.txt` and `nuke.html`. The repo is public already, so this leaks
  nothing new, but a reset page and internal notes sit on the game's own domain. Three stray 2 MB PNGs
  (`file_0000...png`) sit in the root.
- `LW_VERSION` still reads `2026.08.21.03`.

## F. What blocks a Play listing

1. **No account deletion for players.** The only delete is the dev panel's `nukeAccount`
   (`index.html:8620`), which removes the vault document and leaves the sign in. Play requires deletion in
   the app and by a web link.
2. **No Play rail.** The page knows `web-rail` and `pi-rail` only. Stripe and NOWPayments prices ($1, $2, $5,
   $10, $25) would show inside a Play wrapper, where digital goods must use Play Billing.
3. **Content and finish.** The cannabis banner, "may be reset" on the first screen, "Coming soon" and "In
   development" entries, and the 53 MB first load.
4. Location use needs its declaration; the map must work first (A1).

## G. Stephen's calls

1. The map: get a CARTO key, or change provider?
2. Let a guest play first and ask for the account when there is something to save?
3. The plants: commit to raising the renderer, guided by target frames from Astra?
4. What the Play build of the hub contains: the plant loop plus the best dozen games, or all 102?
5. Replace the Puzzles banner (assumed yes).
6. Play v1 with no purchases at all (a rail that hides money), or wire Play Billing?

A scan of tracked files for live Stripe keys, webhook secrets, private keys and GitHub tokens found none.

## Second pass, same day (deeper checks, and two corrections)

### Corrections to the first pass
1. **The cinematic does wait for the beta notice.** `_gatedStart` (`index.html:74706`) holds beat 1's words
   until `lw_beta_ack` is set. The first pass said the words were lost. They are not. What stands: the notice
   is the first thing read, and the popups stack.
2. **"The plants are the weakest art" was too harsh and too broad.** It was judged from two plants in small
   cards. Forty plants on one sheet (shot 16) say otherwise. The narrower findings are P1 to P4 below.

### The plants (shots 16 to 19)
The rarity table in CLAUDE.md is true: 60,000 hashes through the live engine gave Common 33.77%, Uncommon
31.82%, Rare 22.93%, Epic 9.48%, Legendary 1.70%, Mythic 0.25%, Cosmic 0.03%. A plant's SVG is about 117 KB
of markup and draws in 3 ms.
- **P1. Two mutations hide the plant.** Constellation (byte 0xFF, the rarest, about 1 mint in 220) and
  Silhouette draw the plant as a near black shape on a black card. Both of the Constellation plants found
  graded Mythic and Cosmic, so the rarest reward is the one a player can barely see. (shot 17, left two)
- **P2. Eight auras paint a hard edged box.** Aurora Borealis, Ethereal Veil, Poison Miasma, Tidal Pool,
  Moonlit, Golden Hour, Frost Crystal, Deep Sea. The Porcelain and Holographic mutations add a box too. Time
  Crystal and Poison Miasma also draw outside the 70 unit canvas. (shot 18)
- **P3. Eight auras barely show in a still.** Starfall, Storm Wraith, Shimmer, Rain, Cherry Blossom, Pollen
  Drift, Dandelion Seeds, Chain Lightning. Some animate; none reads at grid size.
- **P4. Rarity does not read.** Nothing on the grid card says Common or Cosmic, and a Legendary is not
  visibly grander than a Common.

### Root causes found
- **A2, the empty greenhouse.** On a null user `_nukeGameUI()` (`index.html:49917`) clears the grid. The
  Identity Terminal's dismiss button calls `closeSWSIdModal()` (`:11247`), which never redraws. The newer slot
  banner is not reset by the nuke, so it still reads 14 / 14. Fix: redraw on dismiss when local plants exist.

### New findings
- **N1. The shared map is not safe from a hostile player (launch blocker for any public push).** In
  `firestore-rules-8.txt:485` a signed in client may create a wild drop with any hash, and any signed in
  client may delete any drop. Nothing checks a dropped plant against `mintLog`. The rules file marks this as a
  TODO ("move harvest to Cloud Function") and `dropToWild` and `harvestWildPlant` are already on the planned
  migrations list. Everything else on the money path is sound: `hashLedger` and the mint counters are server
  only, `mintLog` is admin write only.
- **N2. Desktop is broken.** (shot 20) At 1366 wide the header is a 680 px column, the book and backpack
  float at the far right, the banner spans the screen, and the plant grid is two cards of 680 px each, so no
  plant is visible without scrolling. Anyone who opens lucidwinds.com on a computer sees this.
- **N3. On a small phone the first screen shows half of two plants.** (shot 21) At 360 by 640 the cards start
  64% of the way down.
- **N4. Small text.** Under 12 px: 14 of 24 visible strings in the nursery (three at 8.9 px), 10 of 11 in
  the picker ("Try it!" is 5.2 px), the level line in the greenhouse (10.2 px).
- **N5. Guest first would be cheap.** Every rule and every function checks only `request.auth.uid`. An
  anonymous Firebase sign in has a uid, and linking an email later keeps it, so nothing migrates. One caution:
  anonymous accounts are free to make, so anything a new account is given can be farmed; the server mint caps
  are per account.
- **N6. Store paperwork.** The privacy page offers deletion by email only and does not name Stripe or
  NOWPayments; its contact is a personal Gmail. `assetlinks.json` has six packages and no Lucid Winds entry.
  The manifest has no screenshots.

### Checked and fine
- An offline relaunch boots: service worker active, 122 images, none broken.
- A 60 plant greenhouse draws in 126 ms with the processor slowed four times. Scrolling it ran at 13 frames a
  second in that test, worst frame 183 ms; headless overstates this, so confirm on a slow phone.
- No leaked keys in tracked files.

## Third pass, same day: the reward moment (shots 22 to 26)

The whole game builds to one moment: 30 Sunbeams become a plant. Walked signed out with room in the
greenhouse; the mint worked and the numbers added up (30 earned, one plant minted, two level ups paid 50 more).
- **M1. The mint button has no words.** (shot 22) In the Sunbeam modal the button that mints is a painted
  picture (`_mintFromQueue()` on the image). The only button with a word on it is CLOSE. The line above it
  reads "Next plant: 0/30" with an empty bar while 30 are banked and a plant is ready.
- **M2. The first mint is hidden twice.** (shots 23, 24) Within three seconds an explainer ("A plant from
  your attention", three paragraphs) covers the new plant completely. When it is dismissed, the LEVEL UP
  overlay is drawn through the bloom card: "WILD TAB" lies across the plant's name and the unlock text across
  the haiku. The player meets the plant third.
- **M3. The reveal holds back the payoff.** (shot 25) The plant is drawn about 200 px wide, inside its aura's
  hard box, with "Inspect in your Greenhouse to discover its grade". For a collectible the grade is the
  payoff, and the reveal sends the player elsewhere to find it. Showing it here is a design call (Stephen's).
- **Breeding is the best system screen in the hub.** (shot 26, left) Two DNA cards, an offspring rarity bar
  from 600 simulated crosses, a pairing score and a forecast. Dense, and the grade is shown here.
- **The character page reads as empty.** (shot 26) Class, tools, effects, companion, showcase and milestones
  are all there, in text so dim and small the page looks blank.
- **"Just wanna play games?" opens the arcade** (`/portal/`), which says "160+ free games. No install, no
  account" and pitches Lucid Winds in three clear lines. The hub's own first screen pitches nothing and asks
  for an account. The arcade's card also says "patent-pending art engine": that marking should only stand if
  an application is on file.
- Not reached in this pass: the compost confirmation and the settings menu (my calls did not open them).

## Loose ends from the last checks
- **The live hub is the audited file.** `https://lucidwinds.com/index.html` and the branch's `index.html` have the
  same SHA-256, so every finding above applies to production as it stands.
- **Search and sharing tags are in order.** Title, description, canonical, a 1200x630 share image, the manifest
  link; zoom is not disabled.
- **Buttons have accessible names.** Greenhouse 16 of 16, plant card 7 of 7 (the picture only action buttons
  carry aria labels; they still show no words).
- **Where is Settings?** The settings menu holds Sound, Colorblind Mode, Reduce Effects, How to Play, Privacy
  Policy, Terms of Service and "Tip Jar and About". No control with an inline handler opens it from any of the
  four tabs in the signed out test state. Confirm on a phone how a player reaches it; Play expects the privacy
  policy to be reachable in the app. "Tip Jar" must be hidden on a Play rail (R8).

## Fourth pass, 13 Nov: the server code (read, not run)

`functions/earnHashes.js`, `mintPlant.js`, `claimPending.js` and the hub's two call sites.

**Sound:** every write is a Firestore transaction; the ledger, the mint counter and the rate buckets are server
only fields the rules will not let a client change; the plant hash is made on the server from crypto random
bytes; `mintLog` is admin write only.

**What a launch should not ship with:**
- **F1. Earning is self reported.** The client states the amount; the server only rate limits it (200 a call,
  300 a minute, 5,000 a day). Anyone with a browser console can grant themselves Sunbeams without playing.
  The mint cap bounds the result at 30 signed plants a day per account. Proof of play (`startGame` and a
  nonce) is on the migrations list and not built. `claimPending` is the same shape, capped at 50 a day.
- **F2. A refused mint still mints.** `window.mintPlant` (`index.html:42585` region) falls back to a local,
  unsigned plant whenever the server call fails OR refuses: signed out, offline, the 60 second gap, the daily
  cap, or too few Sunbeams on the server. So the server's caps do not limit what a greenhouse holds; a double
  tap gives one signed plant and one unsigned plant while the server charges once, and the server's balance
  drifts above the phone's. Honest players will collect unsigned plants without knowing (two blooms inside a
  minute, a tunnel, a flaky hotel network), and those are the plants a marketplace, an NFT extract or a
  "mintLog only" map rule will later refuse.
- **F3. No App Check.** The callables accept any signed in caller. App Check would make scripted calls from
  outside the real page much harder. One option per function and one init call on the client.
- **F4. A lost reply can pay twice.** An earn whose reply is lost is queued and retried with no idempotency
  key. Small, and in the player's favour.
- The 60 second gap between mints refuses an honest player who has two plants ready, with the words "Slow
  down". Worth shortening when F2 is fixed.
