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
5. The plants, the thing the whole game is about, are the weakest art on the screen.
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
First run: the beta notice sits on top while the cinematic plays underneath, so beat 1's words are gone by the
time it is dismissed. The music offer then stays on screen until answered and covers the gift plant and the
line "This one began with you". Later screens add the "73 omens" toast (it never left during a four minute
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

**C1. The plants are the weakest art on screen.** (shot 07) Flat vector shapes in a few colours, an aura made
of hard edged see-through rectangles, stray vertical lines. Around them sit painted backgrounds, painted
buttons and ornate frames. The collectible should be the richest thing in the frame and it is the plainest.
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
