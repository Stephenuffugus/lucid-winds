# Shutterbug on Google Play: the build and the steps (3 Nov 2026)

The Play app is a Trusted Web Activity shell around the live game, https://lucidwinds.com/satellites/shutterbug/
(whatever is live IS the app; a web deploy updates every installed copy). Package com.skywolfstudio.shutterbug.
Built the OriVex and Jimothy way: bubblewrap 1.27, JDK 21, VIBRATE the only permission, an upload key outside git.

## Ready (checked 3 Nov, sb-m1-18)
- Play readiness gates green: no Stripe, no ads, no analytics, no sign in wall, the arcade exit refuses inside the
  app, its own privacy page, a bubblewrap ready manifest (`node scripts/twa_ready.mjs shutterbug`).
- Offline cold launch: the app is there with the network cut (scripts/_offline_check.mjs).
- The Console text: index.html in this folder, in the Console's order, updated with the album and trophies.

## BUILT 3 Nov 2026 05:33 UTC (his run of the script; he accepted the SDK license by running it)
- store/shutterbug-play/twa/app-release-bundle.aab, 986241 bytes: com.skywolfstudio.shutterbug 1.0.0 (versionCode 1),
  minSdk 24, targetSdk 36, label Shutterbug, adaptive icon; permissions: only Android's own
  DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION (matches "No data collected").
- Upload key SHA-256 (public, safe to paste):
  18:5C:D9:C9:EC:6E:8C:B5:78:30:36:99:5E:E9:D7:8A:87:95:6D:AF:E9:C6:DF:AD:C7:12:63:12:9D:20:86:DD
- Vaulted: vault-20261103-shutterbug-play-1.0.0 (the bundle, the key, its password; all three read back equal).
- The generated Android project (app/, gradle files, 36 files) is committed like Hues and Jimothy; build outputs and the
  key stay ignored. A next version: raise appVersionCode and appVersionName in twa-manifest.json, rerun the script.

## 1. Build the bundle (Stephen runs it; it accepts Google's Android SDK license terms)
    ! bash /home/codespace/sb-drafts/play-build/build-shutterbug-aab.sh
It installs the SDK under /tmp/bw, makes the upload key ONCE in ~/.shutterbug-keys, builds
store/shutterbug-play/twa/app-release-bundle.aab from twa-manifest.json, prints the upload key's SHA-256, and
vaults the bundle, the key and its password in the private vault. The bundle and the key never enter git.

## 2. Play Console
1. Create app with the fields on index.html (name, language, Game, Paid $0.99).
2. Enrol in Play App Signing (the default): Google keeps the signing key; the upload key is recoverable.
3. Upload app-release-bundle.aab to Internal testing first, install it on the Pixel from the testing link, open it
   once with the network on and once off.
4. The app content section, the store listing (icon, feature graphic, screenshots), pricing, then Production.

## 3. After the first upload: assetlinks (removes the browser bar in the installed app)
Copy "App signing key certificate SHA-256" from Console, Test and release, App integrity. Add a Shutterbug entry to
.well-known/assetlinks.json at the repo root with that fingerprint AND the upload key's (printed in step 1), then
deploy that one root file. Until then the app works, with a URL bar showing at the top.

## 4. The store pictures (Astra's round 7 frames)
    node store/shutterbug-play/shoot.mjs --photo /path/to/his-room.jpg      # six raws from the real game, raw-r7/
    node tools/store-kit/compose.mjs store/shutterbug-play/kit.json         # play-shot-1..6, feature graphic, icon
One room photo feeds shots 1, 2, 3 and 5 (the photo turning into the room, the bug in it, the album, the guardian);
`--only 25` retakes single shots, `--reveal 550` moves the moment of the dissolve. Headlines live in kit.json (no
dashes, no exclamation marks). The studio music chip is hidden in the menu shots; nothing else is touched.

