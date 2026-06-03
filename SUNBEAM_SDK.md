# SUNBEAM SDK — Integration & cross-domain verification

> **Audience:** Sky Wolf Studios Director and the developers wiring each
> external constellation game (Glyph Forge, Tarot Run, Bar Brawl, future
> games) into the shared Lucid Winds Sunbeam economy.
>
> **Scope of this file:** the three studio-side build jobs from the spec —
> (1) build + host `sunbeam-sdk.js`, (2) add the `claimPending` Cloud Function,
> (3) confirm `earnHashes` is callable from authorized external domains.
> Nothing in the Lucid Winds game was modified to ship these.

---

## What changed in this repo

- **NEW** `sunbeam-sdk.js` at repo root → auto-deploys to
  `https://lucidwinds.com/sunbeam-sdk.js` via Hostinger.
- **NEW** `functions/claimPending.js` → Firebase Cloud Function.
- **EDIT** `functions/index.js` → one-line `export { claimPending } from './claimPending.js'`.
- **NEW** this doc.

No other file was touched. `index.html`, the 54 modular game files, the
existing Cloud Functions, the Firestore rules, and the game assets are
unchanged.

---

## 1. `sunbeam-sdk.js` — built and ready to host

### What it is

A single ES5-compatible JavaScript file (~280 lines, ~9 KB unminified) that
external games drop into their host page via:

```html
<script src="https://lucidwinds.com/sunbeam-sdk.js"></script>
```

It exposes one global: `window.LucidWindsSunbeams`. The API surface is:

| Method | Returns | Notes |
|---|---|---|
| `init(opts?)` | `{version, region}` | Required once. Auto-detects `window.firebase` (compat). |
| `earn(amount, source)` | `Promise<{ok, balance, earned, source}>` | Wraps `earnHashes` Cloud Function. amount 1..200. source <=32 chars. |
| `claimPending()` | `Promise<{ok, credited, count, items, balance}>` | Wraps `claimPending` Cloud Function. |
| `getBalance()` | `Promise<{earned, spent, balance}>` | Direct Firestore read from `vaults/{uid}.hashLedger`. |
| `onAuthChange(cb)` | unsubscribe fn | Subscribes to Firebase Auth state. |
| `isSignedIn()` | bool | |
| `getCurrentUid()` | string \| null | |
| `signInWithGoogle()` | `Promise<{uid, email, displayName}>` | Popup with redirect fallback. |
| `signOut()` | Promise | |
| `VERSION` | `'1.0.0'` | Bumped on every breaking change. |

### Where it gets hosted

Per `CLAUDE.md`, the Lucid Winds repo auto-deploys from `main` to Hostinger
(serving `lucidwinds.com`). Since `sunbeam-sdk.js` is a root-level file with
no build step, the next Hostinger sync after this commit publishes:

```
https://lucidwinds.com/sunbeam-sdk.js
```

No additional deploy step is required from Stephen. External games reference
this URL directly. Recommend appending a cache-buster `?v=1.0.0` to the
script tag so future SDK upgrades are picked up immediately by host pages.

### Minimal integration example

A standalone game page at `glyphforge.lucidwinds.com` (or any other authorized
domain):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Glyph Forge</title>
</head>
<body>
  <button id="signin">Sign in with Google</button>
  <button id="claim">Claim pending rewards</button>
  <div id="balance">—</div>

  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-functions-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
  <script src="https://lucidwinds.com/sunbeam-sdk.js?v=1.0.0"></script>

  <script>
    firebase.initializeApp({
      apiKey:            'AIzaSyBAE_JvPixhHwt4ziu8LdZ7HAszd9T58zY',
      authDomain:        'focus-grove-fffa8.firebaseapp.com',
      projectId:         'focus-grove-fffa8',
      storageBucket:     'focus-grove-fffa8.firebasestorage.app',
      messagingSenderId: '739627513827',
      appId:             '1:739627513827:web:3d4088a90fd388730652d6'
    });
    LucidWindsSunbeams.init();

    LucidWindsSunbeams.onAuthChange(function(user){
      if (!user) { document.getElementById('balance').textContent = 'Not signed in'; return; }
      LucidWindsSunbeams.getBalance().then(function(b){
        document.getElementById('balance').textContent = b.balance + ' ☀';
      });
    });

    document.getElementById('signin').onclick = function(){
      LucidWindsSunbeams.signInWithGoogle();
    };

    document.getElementById('claim').onclick = function(){
      LucidWindsSunbeams.claimPending().then(function(r){
        console.log('Claimed', r.count, 'rewards (+' + r.credited.hashes + ' ☀)');
      });
    };

    // In your game's win flow:
    function onGameWin(){
      LucidWindsSunbeams.earn(5, 'glyphforge:level_complete')
        .then(function(r){ console.log('Balance now', r.balance); });
    }
  </script>
</body>
</html>
```

That's the entire integration. The same uid earns sunbeams here that they
earn inside Lucid Winds at lucidwinds.com.

---

## 2. `claimPending` Cloud Function — built and ready to deploy

### What it is

A new v2 onCall function at `/functions/claimPending.js`. It atomically:

1. Reads every doc under `vaults/{uid}/pendingRewards/` for the calling uid
   (capped at 200/call to bound work; the next call drains the remainder).
2. Validates `type ∈ {hashes|sunbeams, dew}` and `0 < amount ≤ 40` per doc.
3. Inside a single Firestore transaction:
   - re-reads each doc to detect concurrent-claim races,
   - sums hash + dew credits,
   - increments `vaults/{uid}.hashLedger.earned` and `vaults/{uid}.dewLedger.earned`,
   - deletes the consumed reward docs.
4. Returns:
   ```json
   {
     "ok": true,
     "credited": { "hashes": 12, "dew": 4 },
     "count": 3,
     "items": [
       { "type": "hashes", "amount": 8, "plantName": "Crimson Tide", "grade": "Rare" },
       { "type": "hashes", "amount": 4, "plantName": "Foxglove Moon", "grade": "Common" },
       { "type": "dew", "amount": 4, "plantName": "Foxglove Moon", "grade": "Common" }
     ],
     "balance": { "earned": 1259, "spent": 900 },
     "dewBalance": { "earned": 80, "spent": 21 }
   }
   ```

### Why server-side

`hashLedger` is server-write-only by `firestore-rules-7.txt`
(`vaultServerFieldsImmutable` guard). The existing rules already allow the
client to read + delete its own `pendingRewards` docs, but the credit step
must run with admin SDK privileges. This function is the only legitimate
path; without it, an external game cannot turn a pending reward into a
spendable balance.

### Errors

| Code | Cause |
|---|---|
| `unauthenticated` | No Firebase Auth uid on the request |
| `resource-exhausted` | Called within the 2-second per-uid cooldown, or claim total exceeds 8000 sunbeams |
| `internal` | Firestore transaction failed (retryable) |

### To go live

Run from the repo root (the function is wired into `functions/index.js`):

```bash
firebase deploy --only functions:claimPending
```

Or to deploy everything:

```bash
firebase deploy --only functions
```

This is a Stephen-side action — the Cloud Function will not be callable until
this deploy runs. The existing `earnHashes` and `mintPlant` functions remain
live and untouched.

### Smoke test after deploy

```bash
# As a signed-in user via the Firebase emulator or a real test account:
curl -X POST \
  "https://us-central1-focus-grove-fffa8.cloudfunctions.net/claimPending" \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "data": {} }'

# Expect on first call (with some pending rewards):
# { "result": { "ok": true, "credited": {...}, "count": N, ... } }
#
# Expect on second call within 2s:
# { "error": { "status": "RESOURCE_EXHAUSTED", "message": "Slow down — try again in a moment." } }
```

---

## 3. `earnHashes` from external authorized domains — confirmation

### Yes, it works. Here's why.

Firebase Functions v2 `onCall` endpoints handle CORS automatically: every
preflight request is answered with `Access-Control-Allow-Origin: *` (when
authenticated via Firebase ID token, the auth context is read from the
`Authorization: Bearer` header, not from origin). This is by design and
unchanged from the framework.

There is **no per-domain restriction** on `earnHashes` or `claimPending`
themselves. The only requirement is that the caller present a valid Firebase
Auth ID token for the `focus-grove-fffa8` project.

### What the external page DOES need

1. **Firebase SDK loaded** (compat or modular). Both work; the SDK in this
   ship uses compat for simplicity.
2. **`firebase.initializeApp()` called** with the same project config as
   Lucid Winds (`projectId: 'focus-grove-fffa8'`).
3. **A signed-in user.** When the player signs in via Google, Facebook, or
   Email/Password on the external domain, the same uid is recognized by
   Firestore and by the Cloud Functions.
4. **The external domain authorized for Auth.** This is the only manual
   step — see checklist below.

### Domain authorization checklist (one-time per new domain)

For each new constellation game domain (`glyphforge.lucidwinds.com`,
`tarotrun.lucidwinds.com`, third-party host, etc.):

- [ ] Open [Firebase Console → Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/focus-grove-fffa8/authentication/settings).
- [ ] Click **Add domain**.
- [ ] Enter the bare domain (e.g. `glyphforge.lucidwinds.com`) — no protocol, no path.
- [ ] Save. Effective immediately, no deploy needed.

Already-authorized domains today (read-only, do not change unless coordinating):

- `focus-grove-fffa8.firebaseapp.com` (Firebase default)
- `focus-grove-fffa8.web.app` (Firebase default)
- `lucidwinds.com`
- `localhost` (Firebase default — useful for local testing)

`signInWithPopup` fails with `auth/unauthorized-domain` on any unauthorized
host. `signInWithRedirect` does the same. **Without this step, the
`signInWithGoogle()` helper in the SDK throws on first use** — that is the
visible symptom of a missed authorization, and the SDK error message will
surface the auth code so the integrator can self-diagnose.

### What the external page does NOT need

- A separate Firebase project. Reuse `focus-grove-fffa8`.
- A Cloud Functions deploy of its own. The functions live in this repo.
- Any custom CORS configuration. v2 onCall handles it.
- Any server. The SDK is pure client-side.
- A separate Firestore rules deploy. The existing rules already permit a
  signed-in uid to read its own `vaults/{uid}` and to read+delete its own
  `pendingRewards`. Writes to `hashLedger` are still locked behind the
  Cloud Functions; the SDK never tries to write the ledger directly.

### Verification recipe

After Stephen deploys the `claimPending` function and a new external domain
is authorized, the integrator can verify end-to-end with this sequence
from the external page's DevTools console:

```js
// 1. Confirm SDK loaded
LucidWindsSunbeams.VERSION                              // → '1.0.0'

// 2. Confirm Firebase compat is initialized
firebase.app().options.projectId                        // → 'focus-grove-fffa8'

// 3. Sign in
await LucidWindsSunbeams.signInWithGoogle()             // → {uid, email, displayName}

// 4. Read current balance
await LucidWindsSunbeams.getBalance()                   // → {earned, spent, balance}

// 5. Earn 1 sunbeam (smallest legit amount)
await LucidWindsSunbeams.earn(1, 'integration-test')    // → {ok:true, balance, earned, source}

// 6. Confirm the balance moved
await LucidWindsSunbeams.getBalance()                   // → balance + 1

// 7. Claim any pendings
await LucidWindsSunbeams.claimPending()                 // → {ok:true, count, credited, items}
```

If steps 3–6 succeed, the constellation game is live on the shared economy.

---

## Appendix A — security posture summary

What this ship changes about the security model:

- **No new attack surface on existing flows.** The game's `earnHashes` and
  `mintPlant` paths are unchanged. The 7-layer client + 8-layer server
  anti-cheat described in `ENGINE_ARCHITECTURE.md §8` still applies.
- **`claimPending`** adds an atomic, server-only path to convert
  `pendingRewards` (which other players create) into `hashLedger.earned`.
  Per-uid 2s cooldown and per-doc 40-sunbeam cap (enforced upstream by
  Firestore rules on the create side) bound damage.
- **External-domain calls** are still uid-gated. There is no way to call
  `earnHashes` without a valid signed Firebase ID token, and the existing
  per-uid rate limits (300/min, 5000/day) apply across the whole
  constellation — i.e., a player cannot earn more than 5000 sunbeams/day in
  total across all studio games combined. This is intentional and is the
  single best chokepoint we have until proof-of-play nonces ship.
- **`mintPlant` is NOT exposed by this SDK.** External games can credit
  sunbeams, but the conversion of 30 sunbeams → 1 plant still happens
  inside Lucid Winds via the existing `mintPlant` Cloud Function. This is
  deliberate — the plant is the NFT-grade artifact and its mint path stays
  centralized.

## Appendix B — versioning policy

| Version bump | Trigger | Action |
|---|---|---|
| Patch (1.0.x) | Bug fixes, performance, log changes | Replace file at `lucidwinds.com/sunbeam-sdk.js`. No host-page change required. |
| Minor (1.x.0) | New methods (additive) | Same. Document new methods here. |
| Major (x.0.0) | Removing or breaking a method | Publish at a new path: `lucidwinds.com/sunbeam-sdk-v2.js`. Old path remains so existing games don't break. Migrate games on each game's own cadence. |

Bump `VERSION` inside `sunbeam-sdk.js` on every change so integrators can
detect at runtime.

---

*End of integration & verification doc. Companion files:
`ENGINE_ARCHITECTURE.md` (Sunbeam engine recon),
`GAMES_MANIFEST.md` (per-game inventory).*
