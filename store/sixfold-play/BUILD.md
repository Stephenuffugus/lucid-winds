# Sixfold on Google Play: the build and the steps (13 Nov 2026)

The Play app is a Trusted Web Activity shell around the live game, https://lucidwinds.com/satellites/sixfold/
(whatever is live IS the app; a web deploy updates every installed copy). Package com.skywolfstudio.sixfold.
Built the Shutterbug way: bubblewrap 1.27, JDK 21, VIBRATE the only permission, an upload key outside git.
The game itself lives in its own repo (Stephenuffugus/sixfold) and is vendored into satellites/sixfold/; every game
fix below is made THERE and re-vendored, never in satellites/sixfold/ (VENDORING.md).

## Done (13 Nov, in this folder)
- The listing text, the content rating answers and the Data safety answers: PLAY-LISTING.md.
- What still blocks a release, most serious first: READINESS.md. Read it before anything below.
- Eight phone screenshots (play-shot-1..8.png, 1080 x 1920), the feature graphic (1024 x 500, no alpha) and the listing
  icon (512 x 512, opaque), all from the real game and its own art: shoot.mjs, graphics.py, kit.json.
- twa/twa-manifest.json, Sixfold's values in Shutterbug's shape. Its two icon URLs point at files that do not exist
  yet (icons/icon-512.png and icons/icon-maskable-512.png): step 1 makes them.

## 1. What the studio's coder can do next (in the sixfold repo, then re-vendor, then the owner deploys)
These are the release blockers from READINESS.md, smallest fix each; all are code, none needs the owner's word except
where marked.
1. PNG icons: render icon.svg to icons/icon-192.png, icons/icon-512.png and a maskable icons/icon-maskable-512.png (the
   svg is already full bleed with the art in the safe zone; draw the 六 with a real font, not left to the phone), list
   all three in manifest.webmanifest with "purpose" set ("any" for two, "maskable" for one), and add an "id" ("./").
2. The arcade exit: guard SWS_EXIT and hide "All Sky Wolf games" inside the Play app (the inTWA guard the other Play
   titles carry: document.referrer starts with android-app://, or a ?twa=1 start URL). Without it the app can walk to
   the portal and its Stripe checkout.
3. A privacy page at satellites/sixfold/privacy.html saying what PLAY-LISTING.md's Data safety section says.
4. Delete a public duel's record after its result (as friend rooms already do 8 s after), so the Data safety form can
   say data is deleted automatically.
5. The owner's calls in PLAY-LISTING.md "OWNER DECIDES" items 4 and 5 (Find a rival and the Sunbeam script in the app)
   become one inTWA branch each once he has picked.
6. Then run, from the repo root, once: `node scripts/twa_ready.mjs sixfold` (after re-vendoring). It must be green.

## 2. Build the bundle (the owner runs it; it accepts Google's Android SDK licence terms)
Not written yet: copy /home/codespace/sb-drafts/play-build/build-shutterbug-aab.sh to a sixfold version (the key path
~/.sixfold-keys/sixfold-upload.jks, the folder store/sixfold-play/twa, the package name). It installs the SDK under
/tmp/bw, makes the upload key ONCE, builds store/sixfold-play/twa/app-release-bundle.aab from twa-manifest.json, prints
the upload key's SHA-256 and vaults the bundle, the key and its password in the private vault. The bundle and the key
never enter git (add twa/*.aab, twa/*.apk, twa/*.idsig and twa/build/ to .gitignore when the Android project lands here).

## 3. Play Console (only the owner)
1. Create app: name `Sixfold: Stance Duel`, default language English (United States), App, Game, the price he picks
   (PLAY-LISTING.md OWNER DECIDES 1). Free or paid is permanent in one direction: a free app can never become paid.
2. Enrol in Play App Signing (the default): Google keeps the signing key; the upload key is recoverable.
3. Upload app-release-bundle.aab to Internal testing first, install it on the Pixel from the testing link, open it once
   with the network on and once off, and play one friend room between two phones.
4. App content: privacy policy URL (step 1.3), ads (No), app access (all of it, no login), content rating (the
   questionnaire answers in PLAY-LISTING.md), target audience (OWNER DECIDES 3), Data safety (PLAY-LISTING.md).
5. Store listing: short and full description, the icon, the feature graphic, play-shot-1..8.png in order, category
   Games, Strategy, contact `[support email]`. Then pricing, then Production.

## 4. After the first upload: assetlinks (removes the browser bar in the installed app)
Copy "App signing key certificate SHA-256" from Console, Test and release, App integrity. Add a Sixfold entry to
.well-known/assetlinks.json at the repo root (package com.skywolfstudio.sixfold) with that fingerprint AND the upload
key's (printed in step 2), then deploy that one root file. Until then the app works, with a URL bar at the top.

## 5. The store pictures (rerun after any visible change to the game)
    node store/sixfold-play/shoot.mjs                         # eight raws from the real game into raw/ (git ignored)
    python3 store/sixfold-play/graphics.py                    # frame.png, the feature graphic, the icon
    node tools/store-kit/compose.mjs store/sixfold-play/kit.json   # play-shot-1..8.png
    python3 store/sixfold-play/graphics.py --squeeze          # any shot over 1 MB saved as 256 colours
shoot.mjs serves /workspaces/sixfold as it stands (check out the commit that is live first) at 412 x 915. `--only 37`
retakes single shots; `--no-room` skips shot 3, which opens a real room on the live database (both phones leave, so it
removes itself). Shots 1, 2 and 7 come from real Ascent duels played with random picks, so each run gives different
moments; the script plays up to 24 duels until it has a clean hit by You in round 1 (so the hearts agree with the
verdict), a Clash and a Victory. Headlines live in
kit.json (no dashes, no exclamation marks). This box has no colour emoji font, so the script removes emoji glyphs from
the page text before each capture and hides the room's Talk row; run it on a machine with Noto Color Emoji to keep them.
Respect the quiet rule (/home/codespace/lw-drafts/QUIET) before each browser run.
