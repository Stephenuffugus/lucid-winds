# Lucid Winds — Cloud Functions

Pi Network payment processing + (legacy) Polygon NFT mint signing.

## Functions

| Name | Type | Purpose |
|---|---|---|
| `piApprove` | v2 onCall | Approves a Pi payment with the Pi server, records `piTransactions/{paymentId}` with `status: 'approved'` |
| `piComplete` | v2 onCall | Completes a Pi payment and grants entitlement to `vaults/{uid}` based on `metadata.type` |
| `nftSignMint` | v2 onRequest | Verifies plant ownership and signs a Polygon mint voucher (legacy, kept) |

## Setup

```bash
cd functions
npm install
```

### Required secrets

```bash
firebase functions:secrets:set PI_SERVER_KEY        # Pi developer-portal Server API key
firebase functions:secrets:set NFT_SIGNER_KEY       # 0x... signer private key (legacy mint)
firebase functions:secrets:set NFT_CHAIN_ID         # "137" mainnet, "80002" Amoy testnet
```

`PI_SERVER_KEY` is read at runtime via `process.env`. NEVER commit it.

### Deploy

```bash
firebase deploy --only functions
```

Functions deploy to `us-central1` and are exposed at:
- `https://us-central1-focus-grove-fffa8.cloudfunctions.net/<name>`

## Client integration (httpsCallable)

The Pi SDK in `index.html` currently calls `piApprove` / `piComplete` via `XMLHttpRequest`
without an Authorization header. **The new v2 onCall handlers require a Firebase auth
context.** The client-side calls need to be migrated to `httpsCallable`:

```js
import { getFunctions, httpsCallable } from 'firebase/functions'
const fn = getFunctions(firebaseApp, 'us-central1')

// piApprove
await httpsCallable(fn, 'piApprove')({ paymentId })

// piComplete
await httpsCallable(fn, 'piComplete')({ paymentId, txid })
```

`httpsCallable` automatically attaches the current Firebase ID token. The handler
reads it from `request.auth.uid`. No more manual `Authorization: Bearer ...`
plumbing needed.

(See `submission-prep.md` checklist — the parallel-Claude session owning
`index.html` will wire this swap.)

## piApprove flow

1. Client calls `Pi.createPayment({ amount, memo, metadata })`
2. Pi SDK fires `onReadyForServerApproval(paymentId)`
3. Client calls `piApprove({ paymentId })`
4. Function verifies Firebase auth, looks up payment on Pi server, writes
   `piTransactions/{paymentId}` with `status: 'approved'`, then `POST /v2/payments/{id}/approve`
5. Returns `{ ok: true, paymentId }`

## piComplete flow

1. User signs blockchain tx, Pi SDK fires `onReadyForServerCompletion(paymentId, txid)`
2. Client calls `piComplete({ paymentId, txid })`
3. Function:
   - Reads `piTransactions/{paymentId}` — must be `status: 'approved'` and uid must match
   - Re-fetches payment from Pi for tamper-proof metadata
   - `POST /v2/payments/{id}/complete` with txid
   - Runs a Firestore transaction that grants the entitlement on `vaults/{uid}` and stamps
     `piTransactions/{paymentId}` as `status: 'completed'`
4. Idempotent — re-calling on a completed payment is a no-op (returns `alreadyCompleted: true`)

## Entitlements granted by metadata.type

| `metadata.type` | Effect on `vaults/{uid}` |
|---|---|
| `slot` | `greenhouse.maxSlots += 1` (cap 60) |
| `nursery_slot` | `nursery.maxSlots += 1` (cap 6) |
| `item_pouch_slot` | `lw_pouch_cap += 1` (cap 40) |
| `emergency_pouch` | `emergency_pouch_today = today; emergency_pouch_expires = now + 24h` |
| `early_open_hut` / `hut_early_open` | `lw_hut_early_opens.opened[itemKey] = ts` |

Unknown types log a warning and do NOT grant anything; the transaction still
completes on Pi (we owe the player a manual reconciliation, not a stuck state).

## Firestore data contract

```
piTransactions/{paymentId}
  uid:           string         (Firebase auth uid)
  paymentId:     string
  amount:        number         (Pi amount, from Pi server response)
  memo:          string
  metadata:      map             (whatever client passed to createPayment, server-verified)
  status:        'approved' | 'approve_failed' | 'completed'
  createdAt:     timestamp
  completedAt:   timestamp?     (set on success)
  txid:          string?        (Pi blockchain transaction id)
  fulfillment:   map?           ({ type, applied, before, after, ... })
```

Firestore rules already enforce `read` only by `resource.data.uid == request.auth.uid`
and `write: false` (server only). See `/firestore-rules-7.txt`.

## Local emulation

```bash
firebase emulators:start --only functions,firestore
```

You'll need `firebase.json` at repo root:

```json
{
  "functions": [{ "source": "functions", "codebase": "default" }],
  "firestore": { "rules": "firestore-rules-7.txt" }
}
```

(not currently committed — Stephen's call whether to add)

## Logs & debugging

```bash
firebase functions:log --only piApprove,piComplete --lines 100
```

Common errors surfaced to client:
- `unauthenticated` — caller has no signed-in Firebase user (client must call
  `signInWithEmailAndPassword` before invoking; or attach `getIdToken()` token)
- `failed-precondition` — `PI_SERVER_KEY` not set, or completion called before approval
- `not-found` — paymentId never recorded (approval was skipped or rolled back)
- `permission-denied` — uid on the transaction doc doesn't match caller
- `internal` — Pi API call failed (network, rate limit, bad key)
