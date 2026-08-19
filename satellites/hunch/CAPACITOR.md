# HUNCH — Capacitor wrapper (downloadable iOS/Android app with AdMob)

This wraps the web build into native apps. The frontend ships **inside** the app
(loads instantly, offline-capable); only the AI calls hit your deployed Vercel
proxy. Real ads come from Google AdMob via `@capacitor-community/admob`.

> Prereq: deploy the web/proxy first (see `DEPLOY.md`) so you have a proxy URL,
> e.g. `https://hunch-xxxx.vercel.app`. Native builds need Android Studio (Android)
> and Xcode on a Mac (iOS).

## 1. Install Capacitor + plugins
```
npm i @capacitor/core @capacitor/cli
npm i @capacitor/android @capacitor/ios
npm i @capacitor-community/admob @capacitor/haptics @capacitor/share @capacitor/status-bar
```

## 2. Build the native web bundle (points the app at your proxy)
```
node scripts/build-web.mjs https://hunch-xxxx.vercel.app     # <-- your Vercel URL
```
This creates `www/` with the API base + AdMob adapter injected. `capacitor.config.json`
already sets `webDir: "www"`, appId `media.sws.hunch`, appName `HUNCH`.

## 3. Add platforms
```
npx cap add android
npx cap add ios
npx cap sync
```

## 4. AdMob native config
- **AdMob console**: create an app + ad units (banner / interstitial / rewarded).
  Put the real unit IDs into `scripts/capacitor-ads.js` (replacing the TEST IDs),
  then re-run step 2 + `npx cap sync`.
- **Android** — `android/app/src/main/AndroidManifest.xml`, inside `<application>`:
  ```xml
  <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
             android:value="ca-app-pub-XXXXXXXX~YYYYYYYY"/>
  ```
- **iOS** — `ios/App/App/Info.plist`:
  ```xml
  <key>GADApplicationIdentifier</key><string>ca-app-pub-XXXXXXXX~YYYYYYYY</string>
  <key>NSUserTrackingUsageDescription</key>
  <string>This identifier will be used to deliver personalized ads to you.</string>
  ```
  Plus add Google's published **SKAdNetworkItems** array.

## 5. Run / build
```
npx cap open android   # Android Studio → run on device / build signed AAB
npx cap open ios       # Xcode → run on device / archive for App Store
```

## 6. Store submission (the gotchas)
- **UGC moderation** (users draw + AI responds): the in-app **report** button +
  `/api/report` are wired; both stores expect report/block/filter — keep them.
- **Privacy policy** URL (required in both stores) + data-safety / privacy nutrition
  label (declare AdMob's advertising ID + anything the proxy logs).
- **Apple 4.2**: we add native value (AdMob, haptics, share, offline, splash) so it
  isn't "just a website."
- **Play** new-account closed testing (~12–20 testers, ~14 days) before production —
  start that gate early.
- Use **test ad unit IDs** until live; never click your own live ads.

## Architecture recap
```
Native app (www/ bundled)  ──fetch──►  Vercel /api/claude  ──►  Anthropic
        │                                   (holds the key)
        └── AdMob SDK (rewarded/interstitial/banner) via capacitor-ads.js
```
