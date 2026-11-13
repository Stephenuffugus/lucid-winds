# Dewball on Google Play: the build and the steps (13 Nov 2026)

The Play app is a Trusted Web Activity shell around the live game, https://lucidwinds.com/satellites/dewball/
(whatever is live IS the app; a web deploy updates every installed copy). Package com.skywolfstudio.dewball (new: no
other kit or assetlinks entry uses it). Built the Shutterbug way: bubblewrap 1.27, JDK 21, VIBRATE the only permission,
an upload key outside git. Dewball lives in this repo (satellites/dewball has no VENDORED.json), so game fixes are made
in satellites/dewball by the studio's coder and deployed by the owner; this kit changed nothing there.

The start address has no ?twa=1: the game's Play app guard (index.html, "THE PLAY APP" block) reads
document.referrer (android-app://) and the standalone display mode, never the query string.

## Done (13 Nov, in this folder)
- The listing text, the content rating answers and the Data safety answers: PLAY-LISTING.md.
- What still stands between Dewball and a release, most serious first: READINESS.md. Read it before anything below.
- Eight LANDSCAPE screenshots (play-shot-1..8.png, 1920 x 1080), the feature graphic (1024 x 500, no alpha) and the
  listing icon (512 x 512, opaque), all from the real game: shoot.mjs, graphics.py, kit.json.
- twa/twa-manifest.json: Dewball's values in Sixfold's shape, orientation "any" (both ways, as the owner asked). Its two
  icon URLs and the web manifest URL answer 200 on the live site today.
- probe.mjs: the cold start weight, the throttled frame rate and the first minute runs READINESS.md quotes.
- `node scripts/twa_ready.mjs dewball`: every gate green (13 Nov).

## 1. What the studio's coder can do next (in satellites/dewball, then the owner deploys)
In READINESS.md order; none needs the owner's word except where marked.
1. Hide the "+3 Sunbeams" line and the Sunbeam count inside the Play app (SWS_IN_TWA), or give it a use there
   (OWNER DECIDES 3 in PLAY-LISTING.md).
2. The menu's subtitle "Lucid Winds · Roll the world up" and Night Garden's card line "the Lucid Winds garden": in the
   Play app the brand is Dewball by Sky Wolf Studio. One line each.
3. The two v36 copy lines in satellites/dewball/index.html that are not live yet (the rotate tip inside an installed app,
   the iPhone install alert): deploy them with the next game change.
4. Stop asking for assets/ground-<world>.jpg (a 404 on every world start), or ship the tiles.
5. Then rerun `node scripts/twa_ready.mjs dewball` once.

## 2. Build the bundle (the owner runs it; it accepts Google's Android SDK licence terms)
Not written yet: copy /home/codespace/sb-drafts/play-build/build-shutterbug-aab.sh to a dewball version (the key path
~/.dewball-keys/dewball-upload.jks, the folder store/dewball-play/twa, the package name com.skywolfstudio.dewball). It
installs the SDK under /tmp/bw, makes the upload key ONCE, builds store/dewball-play/twa/app-release-bundle.aab from
twa-manifest.json, prints the upload key's SHA-256 and vaults the bundle, the key and its password in the private
vault. The bundle and the key never enter git (add twa/*.aab, twa/*.apk, twa/*.idsig and twa/build/ to .gitignore when
the Android project lands here).

## 3. Play Console (only the owner)
1. Create app: name `Dewball: Roll and Grow`, default language English (United States), App, Game, Paid (he said
   $0.99). Paid can later become free, never the other way.
2. Enrol in Play App Signing (the default).
3. Upload app-release-bundle.aab to Internal testing first. On the Pixel: open it with the network on, play Crumb Country
   sideways and upright, turn the phone mid run, check there is no "Add to Home Screen" or "Horizon mode" button and no
   arcade button on the menu (READINESS.md item 2), then open it again with the network off.
4. App content: privacy policy URL https://lucidwinds.com/satellites/dewball/privacy.html, ads (No), app access (all of
   it, no login), content rating (PLAY-LISTING.md), target audience (OWNER DECIDES 5), Data safety (PLAY-LISTING.md: no
   data collected).
5. Store listing: short and full description, play-icon-512.png, feature-graphic-1024x500.png, play-shot-1..8.png in
   order (phone screenshots; they are landscape 16:9, which Play accepts), category Games, Casual, contact
   `[support email]`. Then pricing ($0.99), then Production.

## 4. After the first upload: assetlinks (removes the browser bar in the installed app)
Copy "App signing key certificate SHA-256" from Console, Test and release, App integrity. Add a Dewball entry to
.well-known/assetlinks.json at the repo root (package com.skywolfstudio.dewball) with that fingerprint AND the upload
key's (printed in step 2), then deploy that one root file. Until then the app works, with a URL bar at the top, and the
game's inTWA guard still holds (it reads the referrer, not the bar).

## 5. The store pictures (rerun after any visible change to the game)
    node store/dewball-play/shoot.mjs          # plays every world with a bot, raws into raw/ (git ignored), about 7 min
    python3 store/dewball-play/graphics.py     # frame-land.png, play-shot-1..8.png, the feature graphic, the icon
graphics.py needs Roboto (Apache 2.0) TTFs named roboto-500/700/900.ttf in $DEWBALL_FONTS (default
/tmp/claude-1000/dewball-kit/fonts); fetch them once from Google Fonts' css2 API with an old user agent, which returns
.ttf links. The headlines and the raw chosen for each shot live in kit.json. The run is deterministic (?dbseed=4242, the
bot has no randomness), so the raw names do not change between runs. tools/store-kit/compose.mjs is not used: it only
makes portrait frames. Respect the quiet rule (/home/codespace/lw-drafts/QUIET) before each browser run.
