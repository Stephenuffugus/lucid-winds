# Pi Network deployment — first-time setup

You only need to run this end-to-end once. After that, `firebase deploy --only functions` is the one command for code updates.

## Prereqs

- Node 20+ on your laptop (the `firebase-tools` CLI requires it; functions also runs on Node 20)
- A logged-in Pi Browser session with the dev account that owns the app

## Step 1 — Get your Pi credentials

1. Open Pi Browser → visit `develop.pi`
2. Tap **Create New App** → fill in name (Lucid Winds), URL (`https://lucidwinds.com`), category (Games)
3. After save, the portal shows **App ID** and **Server API Key**
4. Copy the Server API Key NOW — you cannot view it again. Stash it somewhere safe.

## Step 2 — Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

The login opens a browser; pick the Google account that owns the `focus-grove-fffa8` Firebase project.

## Step 3 — Install function dependencies

```bash
cd functions
npm install
cd ..
```

## Step 4 — Set the Pi Server Key secret

```bash
firebase functions:secrets:set PI_SERVER_KEY
```

CLI prompts for the value. Paste the Server API Key from step 1. The secret is stored in Google Secret Manager and never written to disk.

## Step 5 — Deploy

```bash
firebase deploy --only functions
```

First deploy enables the necessary APIs in your GCP project (a one-time prompt). Functions land at:

```
https://us-central1-focus-grove-fffa8.cloudfunctions.net/piApprove
https://us-central1-focus-grove-fffa8.cloudfunctions.net/piComplete
```

The frontend already calls them via `firebase.functions().httpsCallable('piApprove')`.

## Step 6 — Test in Pi Browser sandbox

1. Open `https://lucidwinds.com` in Pi Browser (logged in as a Pi account)
2. Trigger any Pi-priced action (greenhouse slot expansion is a good first test)
3. Pi prompts to approve a sandbox payment
4. Browser console: should see `[Pi] Approved: <paymentId>` then `[Pi] Payment complete`
5. In Firebase Console → Firestore → `piTransactions/<paymentId>` should have `status: 'completed'`

If the function calls 404, check the Cloud Functions tab in Firebase Console — they should be listed as `piApprove`, `piComplete`, `nftSignMint`. If the API call returns `unauthenticated`, the user isn't signed into Firebase Auth in the same browser session.

## Step 7 — Submit for App Studio review

In Pi developer portal:
1. Open the app entry
2. Tap **Submit for Review**
3. Pi reviewers will load `lucidwinds.com` in Pi Browser, attempt sandbox payments, and check policy compliance
4. Review takes 1-3 weeks. They'll email approval or feedback.

## Step 8 — Promote to mainnet

After approval, edit `index.html` line ~65238:

```js
Pi.init({version:'2.0', sandbox: false}); // was sandbox: true
```

Bump `LW_VERSION`, deploy. Real Pi flows.

## Troubleshooting

**`[Pi] firebase.functions not loaded`** — Firebase functions SDK isn't wired into the page. Check `<script>` includes; needs `firebase-functions-compat.js` loaded after `firebase-app-compat.js`.

**`unauthenticated` from piApprove** — The Firebase Auth context didn't reach the function. Make sure the player has signed in (email/password registration completes the auth state). Pi Browser sessions are per-tab; signing into Pi doesn't sign into Firebase.

**`failed-precondition: Pi server key not configured`** — Step 4 didn't take. Re-run `firebase functions:secrets:set PI_SERVER_KEY`.

**`not-found` from piApprove** — The `paymentId` Pi sent the client doesn't match what Pi's server thinks. Almost always a sandbox/mainnet mismatch. Verify `Pi.init` sandbox flag matches what your developer portal app is configured for.

## Cost estimate

The Cloud Functions free tier (2M invocations/mo) covers a launch with thousands of active keepers. Past that, ~$0.40 per million invocations. Pi has no cost on its side; their server takes the API call free.
