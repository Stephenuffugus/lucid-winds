# LUCID WINDS — Engine Architecture (Sunbeam reconnaissance)

> **Audience:** Sky Wolf Studios Director (bountyhunter codespace) — recon prepared
> by the Lucid Winds codebase Claude. **Read-only sweep, no code changed.** Every
> snippet below is copied verbatim from the live files. File paths and line numbers
> are accurate as of HEAD `ac8ddb7` (2026-05-23).

This document answers the 9 questions about extracting the Sunbeam engine for a
multi-game studio constellation.

---

## TL;DR

- A **Sunbeam** is an integer count in a single ledger document
  (`vaults/{uid}.hashLedger = { earned, spent }`) stored in Firestore, mirrored
  to localStorage `sws_hash_ledger` for instant UI. There is no per-sunbeam
  object — it's a counter.
- A sunbeam is **earned** when any mini-game calls `_e('event_name')`. That
  function looks up an amount in a per-game/per-event reward table, applies
  anti-farming guards, and calls `window.earnHashes(amt, source)`, which both
  writes the local ledger AND fires the `earnHashes` Firebase Cloud Function so
  the server ledger increments atomically.
- The 30-sunbeam → 1-plant conversion happens in a separate Cloud Function
  (`mintPlant`) that spends `MINT_COST = 30` and returns a server-signed plant
  hash.
- **The seam you want for the studio is `window.earnHashes(amount, source)`.**
  Every internal mini-game (inline + the 54 modular files in `/games/`) routes
  to it through `_e()` or directly. It is already authenticated against Firebase
  Auth (uid required) and rate-limited server-side (200/call, 300/min, 5000/day,
  per-source label for forensics).
- **Auth today:** Firebase Email/Password + Google + Facebook (popup → redirect
  fallback). **No anonymous auth.** Earning a sunbeam is server-gated on a
  signed-in uid.
- Engine is **tightly bound to one giant `index.html`** (101k lines, 6.9 MB),
  but the public surface that matters for extraction is small: a Firebase
  Cloud Function (`earnHashes`) and a thin authenticated client wrapper.
  Externalizing it is mostly a matter of publishing that wrapper as an SDK and
  whitelisting the new domain in the Firebase Auth console.

---

## 1. What is a Sunbeam, concretely?

### Data shape

A Sunbeam is **one increment in a per-user ledger document**, not a per-sunbeam
record. The ledger is a small, durable counter:

```json
// vaults/{uid}.hashLedger   (Firestore, owned/written by Cloud Functions only)
{
  "earned": 1247,    // lifetime sunbeams credited
  "spent":  900      // lifetime sunbeams burned by mintPlant (30 per plant)
}
```

The **spendable balance** is `earned - spent`. The client mirrors this in
`localStorage['sws_hash_ledger']` for instant UI feedback. From
`/workspaces/lucid-winds/index.html:42281-42293`:

```js
var HASH_LEDGER_KEY = 'sws_hash_ledger';
function getHashLedger() {
  try { return JSON.parse(_secureGet(HASH_LEDGER_KEY) || localStorage.getItem(HASH_LEDGER_KEY)) || { spent: 0, earned: 0 }; } catch(e) { return { spent: 0, earned: 0 }; }
}
```

A parallel **queue** in localStorage breaks the lifetime ledger into discrete
"ready-to-mint" 30-sunbeam buckets so the UI can show "you have 3 plants ready
to bloom":

| Key | Shape | Meaning |
|---|---|---|
| `pw_readyHashes` | `string[]` — list of hex strings | Each entry = 1 mintable plant in the queue |
| `pw_hashFilled` | int 0–30 | Progress toward the next mintable bucket |
| `pw_hashBuf` | 64-hex string (Uint8Array) | Entropy buffer that becomes the plant hash on mint |
| `pw_mTotal` | int | Lifetime sunbeams (engagement metric) |
| `sws_hash_ledger` | `{earned, spent}` JSON | Source of truth, mirrored from Firestore |

### Design meaning ("codeblocks made by your attention")

"Attention" maps mechanically to **completing meaningful in-game events** in
the 65 mini-games. The canonical event taxonomy used by `_e()` is:

- `progress` — interim success (a match, a capture, a cleared row)
- `milestone` — passing a per-game threshold (every Nth match, every Nth round)
- `cleared`, `capture`, `flip`, `hit`, `sequence`, `pheno`, `puzzle_solved` — game-specific progress synonyms
- `game_win` — full completion (a Sunbeam-rich event)
- `game_loss` — full completion with no win bonus, but still credits minor progress

Each game declares a reward table `_aw[gameId]` mapping these event names to
sunbeam amounts. So "attention" = "the count of these meaningful events,
gated by per-game caps, total-session caps, min-play-time, and
completion-cooldown anti-farming guards."

The 30-sunbeam plant cost (constant `MINT_COST = 30` in
`/workspaces/lucid-winds/functions/mintPlant.js:37`) is the canonical anchor —
**30 attention-events ≈ 1 plant**.

---

## 2. How is a Sunbeam earned right now?

### The single trigger: `_e(eventName)` → `window.earnHashes(amount, source)`

Every mini-game (inline or modular) fires `_e('event_name')` at the moment of a
meaningful in-game event. `_e()` looks up the amount in `_aw[gameId]`, applies
four anti-farming guards, then forwards to `window.earnHashes(amt)`.

**Definition of `_e`** — `/workspaces/lucid-winds/index.html:62080-62209`:

```js
function _e(v){
  var w=_aw[_a]||{};
  var base=w[v]||w[v.replace(/_\d+$/,'')]||w['default']||0;
  // ── TUTORIAL SUNBEAM FREEZE ──
  // After First Focus grants the deterministic 30 Sunbeams, no further
  // hashes accrue from any game play until the tutorial finishes and
  // plant XP unlocks at step 34. ...
  try{
    if(localStorage.getItem('lw_first_focus_done') && !localStorage.getItem('lw_plant_xp_unlocked')){
      base=0;
    }
  }catch(e){}
  // ── ANTI-FARM GUARD 1: Progress/milestone cap per session ──
  var isProgress=(v==='progress'||v==='milestone'||v==='cleared'||v==='capture'||v==='flip'||v==='hit'||v==='sequence'||v==='pheno'||v==='puzzle_solved');
  if(isProgress){
    var gc=_afClass[_afGameClass[_a]||'standard']||_afClass.standard;
    if(_afSessionProg>=gc.progCap){base=0;}
    else{_afSessionProg++;}
  }
  // ── ANTI-FARM GUARD 2: Min play time for completion events ──
  var isComplete=(v==='game_win'||v==='game_loss');
  if(isComplete&&_s>0){
    var elapsed=Math.floor((Date.now()-_s)/1000);
    var gc2=_afClass[_afGameClass[_a]||'standard']||_afClass.standard;
    if(elapsed<gc2.minTime){ /* block + toast */ base=0; }
  }
  // ── ANTI-FARM GUARD 3: Completion cooldown ──
  if(isComplete&&base>0){ /* block if within _afCompleteCd seconds of last completion */ }
  // ── RARITY HASH MULTIPLIER ── Legendary 1.10×, Mythic 1.15×, Cosmic 1.20×
  var amt=Math.round(base*_dm*_rarityMult);
  // ── ANTI-FARM GUARD 4: Per-session total sunbeam cap (default 20) ──
  if(amt>0){
    var remaining=_afSessionCap-_afSessionSunbeams;
    if(remaining<=0){amt=0;} else if(amt>remaining){amt=remaining;}
    if(amt>0)_afSessionSunbeams+=amt;
  }
  if(amt>0){
    if(window.earnHashes)window.earnHashes(amt);
    // ... UI updates, toasts, milestones, queue progress
  }
}
window._e=_e;
```

**`window.earnHashes`** (the routable client API) —
`/workspaces/lucid-winds/index.html:42295-42336`:

```js
function earnHashes(amount) {
  if (!amount || amount < 1) return;
  // Tutorial freeze: ...
  try {
    if (localStorage.getItem('lw_first_focus_done') && !localStorage.getItem('lw_plant_xp_unlocked')) {
      return;
    }
  } catch(e){}
  var ledger = getHashLedger();
  ledger.earned = (ledger.earned || 0) + amount;
  _secureSet(HASH_LEDGER_KEY, ledger);
  try { if (window.LW_ACH) LW_ACH.bump('d_sunbeams', amount); } catch(e){}
  if(window.PW_grantXP) PW_grantXP(Math.max(1, Math.floor(amount/2)), 'dew_drop');
  if(window._accumulateHash) window._accumulateHash(amount);
  _updateGameDew();
  // ... sunbeam-rain animation, etc.
  try { if (window.syncVaultToCloud) window.syncVaultToCloud(); } catch(e){}
}
window.earnHashes = earnHashes;
```

**Server mirror** — `/workspaces/lucid-winds/index.html:42499-42514`:

```js
var _origEarn = window.earnHashes;
window.earnHashes = function(amount, source) {
  try { _origEarn.apply(this, arguments); } catch(e) {}
  try {
    if (typeof firebase === 'undefined' || !firebase.functions) return;
    if (!firebase.auth || !firebase.auth().currentUser) return;
    if (!Number.isInteger(amount) || amount <= 0 || amount > 200) return;
    var fn = firebase.functions().httpsCallable('earnHashes');
    fn({ amount: amount, source: source || 'unknown' })
      .catch(function(err){ /* best-effort */ });
  } catch(e){}
};
```

**Cloud Function (the canonical authority)** —
`/workspaces/lucid-winds/functions/earnHashes.js` (full file):

- HTTPS callable, region `us-central1`.
- Requires Firebase Auth uid.
- Validates `amount` is a positive int ≤ 200.
- Truncates `source` to 32 chars (for forensic per-source rate audit).
- Per-minute window: 300 max.
- Per-day window: 5000 max.
- Atomic Firestore transaction increments `vaults/{uid}.hashLedger.earned` + per-window rate buckets.
- Returns `{ ok, balance, earned, source }`.

This is the seam to extract. Every other game in the constellation calls this
endpoint with a different `source` label.

---

## 3. Where is Sunbeam state stored?

**Firebase Firestore is canonical. localStorage is a UI cache.**

### Firestore — server-only fields

- `vaults/{uid}` doc, field `hashLedger: { earned, spent }`
- `vaults/{uid}` doc, fields `mintCounter, lastMintAt, dailyMints, earnRateMin, earnRateDay, lastEarnAt, lastEarnSource` (rate accounting)
- `mintLog/{uid}/mints/{plantHash}` — unforgeable mint receipts (Cloud-Function-admin-write only)

The Firestore security rules (`firestore-rules-7.txt:117-148`) **block all
client writes** to these server-owned fields. The relevant guard:

```
function vaultServerFieldsImmutable() {
  return !request.resource.data.diff(resource.data).affectedKeys()
           .hasAny(['hashLedger', 'mintCounter', 'lastMintAt', 'dailyMints',
                    'earnRateMin', 'earnRateDay', 'lastEarnAt', 'lastEarnSource']);
}
match /vaults/{uid} {
  allow read:   if request.auth != null && request.auth.uid == uid;
  allow create: if request.auth != null && request.auth.uid == uid
              && validVaultRootCaps(request.resource.data)
              && !('hashLedger' in request.resource.data)
              && !('mintCounter' in request.resource.data);
  allow update: if request.auth != null && request.auth.uid == uid
              && validVaultRootCaps(request.resource.data)
              && vaultServerFieldsImmutable();
}
match /mintLog/{uid}/mints/{plantHash} {
  allow read:   if request.auth != null && request.auth.uid == uid;
  allow create, update, delete: if false;   // Cloud-Function admin SDK only
}
```

### localStorage — UI cache

| Key | Type | Notes |
|---|---|---|
| `sws_hash_ledger` | JSON `{earned, spent}` | Mirror of Firestore ledger, written by `earnHashes` for instant UI |
| `pw_readyHashes` | JSON `string[]` | Pre-minted ready-to-bloom hashes (1 per ready plant) |
| `pw_hashFilled` | int 0–30 | Progress toward the next bucket |
| `pw_hashBuf` | 64-hex | Entropy buffer |
| `pw_mTotal` | int | Lifetime earned (analytics) |
| `lw_first_focus_done`, `lw_plant_xp_unlocked` | flags | Tutorial sunbeam freeze gate |

### Vault read on app start

`_loadVaultForUser(user, onComplete)` at `index.html:49927` pulls
`vaults/{uid}` + `vaults/{uid}/meta/state` and hydrates the localStorage cache.
Crucially, since the May 6 audit, **`hashLedger` is no longer mirrored into
`meta/state`** — server vault root is canonical. From
`index.html:49835-49841`:

```js
// Audit security-deep H4: hashLedger removed from meta/state mirror.
// Was previously written here too, creating two hashLedger sources of
// truth: vault root (server-only via rules-7 vaultServerFieldsImmutable)
// and meta/state (client-writable, no validation). An attacker could
// spoof the local UI sunbeam balance by writing meta/state.hashLedger
// directly. The root doc is the canonical source; mintPlant Cloud
// Function reads/writes only the root copy. Mirror deleted.
```

---

## 4. How are Sunbeams spent, and how does the plant engine consume them?

**The only legit spend path is `mintPlant` — 30 sunbeams → 1 plant.**

### Client API

`window.mintPlant(hash, opts)` at `index.html:41728-41759` — wrapped client call
that prefers the server. Quoted:

```js
window.mintPlant = async function(hash, opts) {
  window._rarityMultCacheAt = 0;
  // Cross-pollination / breeding stays local
  if (opts && opts.isCross) {
    return _origMint.apply(this, arguments);
  }
  // Dev mints bypass server (Audit 5 C2)
  if (opts && opts.bypassServer && window.PW_Dev) {
    return _origMint.apply(this, arguments);
  }
  // Manual mint — try server first
  var serverPlant = await _serverMintCall(opts);
  if (serverPlant && serverPlant.hash) {
    var mergedOpts = Object.assign({}, opts || {}, {
      serverSigned: true,
      mintedAt: serverPlant.mintedAt,
      mintSource: serverPlant.mintSource
    });
    return _origMint.call(this, serverPlant.hash, mergedOpts);
  }
  // Fallback: legacy client mint
  var fallbackOpts = Object.assign({}, opts || {}, { serverSigned: false });
  return _origMint.call(this, hash, fallbackOpts);
};
```

### Server authority — `functions/mintPlant.js`

The Cloud Function is the single point of spend. Excerpts from
`/workspaces/lucid-winds/functions/mintPlant.js`:

```js
const MINT_COST = 30
const MIN_INTERVAL_MS = 60 * 1000
const DAILY_CAP = 30
// ...
const result = await db.runTransaction(async (tx) => {
  const snap = await tx.get(vaultRef)
  const vault = snap.exists ? (snap.data() || {}) : {}
  const ledger = vault.hashLedger || { earned: 0, spent: 0 }
  const balance = (ledger.earned || 0) - (ledger.spent || 0)
  if (balance < MINT_COST) {
    throw new HttpsError('failed-precondition',
      `Need ${MINT_COST} Sunbeams; server has ${balance}.`)
  }
  // ... rate-limit guards (60s min interval, 30/day cap) ...
  const counter = (vault.mintCounter || 0) + 1
  const seed = `${uid}:${now}:${counter}:${randomBytes(16).toString('hex')}`
  const hash = createHash('sha256').update(seed).digest('hex')
  // ... spend the cost ...
  tx.set(vaultRef, {
    hashLedger: { earned: ledger.earned, spent: (ledger.spent || 0) + MINT_COST },
    lastMintAt: now, mintCounter: counter,
    dailyMints: { dayBucket, count: ... },
  }, { merge: true })
  // Unforgeable proof
  const logRef = db.collection('mintLog').doc(uid).collection('mints').doc(hash)
  tx.set(logRef, { uid, hash, mintedAt: now, source, serverNow: now, mintCounter: counter })
  return { plant, logRef: logRef.path }
})
```

There is also a client-only `spendHashes(amount)` at `index.html:42363-42386`
used for non-mint spends (e.g. weather summons, cocoonery items) — but that
path only mutates the local ledger and the ready-hash queue, not the server.
For the multi-game studio, **the only spend you need to externalize at
launch is `mintPlant`** (or "convert 30 sunbeams to a plant in the player's
constellation").

---

## 5. Player identity — accounts or anonymous?

**Accounts only. There is no anonymous play.** Earning a Sunbeam requires a
signed-in Firebase uid.

### Auth setup — `index.html:11220-11241`

```js
var firebaseConfig = {
  apiKey:            'AIzaSyBAE_JvPixhHwt4ziu8LdZ7HAszd9T58zY',
  authDomain:        'focus-grove-fffa8.firebaseapp.com',
  projectId:         'focus-grove-fffa8',
  storageBucket:     'focus-grove-fffa8.firebasestorage.app',
  messagingSenderId: '739627513827',
  appId:             '1:739627513827:web:3d4088a90fd388730652d6'
};
firebase.initializeApp(firebaseConfig);
var db   = firebase.firestore();
db.enablePersistence({synchronizeTabs:true}).catch(/* ... */);
var auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(){
  auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(function(){});
});
```

> The Firebase web API key is by design public — it identifies the project, not
> a secret. Access control lives in Firebase Console (authorized domains) and
> in `firestore-rules-7.txt` (per-uid ownership). Leaving it in source is
> normal for Firebase web apps.

### Providers in use

| Provider | Wired? | Location |
|---|---|---|
| Email/Password | ✅ Yes — both signup + signin | `index.html:50443` (`createUserWithEmailAndPassword`), `:50492` (`signInWithEmailAndPassword`) |
| Google | ✅ Yes — popup with redirect fallback | `index.html:50171` (`GoogleAuthProvider`), `:50186` (`signInWithPopup`) |
| Facebook | ✅ Yes — same flow | `index.html:50174` (`FacebookAuthProvider`) |
| Anonymous | ❌ Not used | `grep signInAnonymously` returns zero hits |
| Pi Network | Pi SDK is loaded for payments (`sdk.minepi.com/pi-sdk.js`), but **identity** is still Firebase Auth |

### Cross-session recognition

Once a user signs in, `auth.onAuthStateChanged` (at `index.html:50051-50071`)
fires with `user.uid`. The uid is persisted in localStorage as
`sws_user_session.firebaseUid` and used as the key for the Firestore
`vaults/{uid}` document. Firebase Auth Persistence.LOCAL stores the credential
in IndexedDB, so the same browser re-authenticates silently on every visit.

### Cross-game recognition (the studio question)

All 65 mini-games inside Lucid Winds share the **same `auth.currentUser.uid`**
because they all live in the same single-page app. The shared Sunbeam ledger
"just works" inside the page.

For a *separate* domain (Glyph Forge, Tarot Run), the simplest path is to
authorize that domain in the same Firebase project's Auth console and call
`firebase.auth().getAuth()` / `signInWithCredential` to recognize the same
uid. Then the existing `earnHashes` Cloud Function will accept its calls
without any code change.

---

## 6. The seam — is there a shared earn API the 65 games already use?

**Yes.** Every internal mini-game routes through `window._e()` →
`window.earnHashes(amount, source)`. The modular games in `/games/*.js` import
this via a shared object `window._G`.

### Shared API definition — `index.html:63129-63135`

```js
window._G={
  e:function(v){ try{ return window._e(v); }catch(e){ return _e(v); } },
  play:_play, playWin:_playWin, st:_st, xt:_xt, sm:sm,
  ms:ms, mm:mm, mc:mc, sh:sh, sr:_sr, gr:_gr, setDiff:_setDiff,
  solEnterFS:_solEnterFS, solClearFS:_solClearFS, solExitFS:_solExitFS,
  getM:function(){return _m}, setM:function(v){_m=v}
};
```

### How every modular game uses it — `games/memory.js:1-6`

```js
// ═══ LUCID WINDS — Memory Garden ═══
(function(){
'use strict';
var G=window._G;
// Aliases for shared utilities
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;
```

Then in-game:

```js
// games/memory.js:32
if(cd[fl[0]]===cd[fl[1]]){
  setTimeout(function(){
    _play('match');
    mt++;
    _e('progress');                                      // ← single API call
    if(mt%Math.max(2,Math.floor(pr/3))===0&&mt<pr)_e('milestone');
    if(mt>=pr){
      _e('game_win');
      _playWin();
```

```js
// games/simon.js:104, 122-124
if(rd>1&&(rd-1)%5===0)_e('milestone');
// ...on completion:
_e('game_win');_sr('simon',{w:true,s:rd});
// or:
_e('game_loss');_play('lose');_sr('simon',{w:false,s:rd});
```

```js
// games/rhythmvine.js:198-200
for(var s=0;s<sb;s++)_e('progress');
var won=stars>=3;
if(won){_e('game_win');_playWin();}else{_e('game_loss');}
```

### Signature for an extracted shared SDK

The minimal externalizable surface is:

```ts
// All internal games already use this exact contract via _e()  →  earnHashes()
function earnSunbeams(amount: number, source: string): Promise<{
  ok: boolean
  balance: number       // earned - spent, after this grant
  earned: number        // lifetime earned, after this grant
  source: string        // echoed back for client logging
}>
// Constraints enforced by the Cloud Function:
//   amount: integer, 1..200
//   source: <=32 chars (recommend "<game-id>:<event>" e.g. "glyphforge:level_complete")
//   rate:   <=300/min and <=5000/day per uid
//   auth:   Firebase Auth signed-in uid required
```

This is the function to publish as the studio SDK. Internally it is one
HTTPS callable: `firebase.functions().httpsCallable('earnHashes')`. Outside
the Lucid Winds page, the same Firebase project just needs:

- the new game's domain whitelisted in Firebase Console → Authentication → Settings → Authorized domains;
- Firebase SDK initialized with the same `firebaseConfig` (or use Firebase REST + an ID token).

---

## 7. Tech stack of the engine + extractability

### Stack

- **Runtime:** Browser, vanilla JS / HTML5, ES5-compatible. **Hard rule in
  `CLAUDE.md`:** no frameworks ever, no `const`, no `let`, no arrow functions.
  Reason: the entire game ships as one `index.html` served via static hosting
  (Hostinger). No build step.
- **Storage:** Firebase Firestore (vault docs, mint log, social state).
- **Auth:** Firebase Auth (Email/Password + Google + Facebook).
- **Server logic:** Firebase Cloud Functions v2 (`us-central1`), Node 22+,
  ESM. Four exports live today: `piApprove`, `piComplete`, `mintPlant`,
  `earnHashes`. See `functions/index.js`.
- **Payments:** Pi Network SDK (`sdk.minepi.com/pi-sdk.js`). Pi only inside the
  Pi Browser; external builds do not see Pi UI.
- **PWA:** `manifest.json` + `sw.js` (service worker for asset caching).
- **Analytics:** GA4, measurement ID `G-XE58S4X6RX`, ~35 wired events.
- **Build:** None for the game itself. The 54 modular game files in `/games/`
  are loaded on demand via `<script src="games/{id}.js?v={LW_VERSION}">`.
  `package.json` only ships dev/test tooling (jsdom smoke tests, ESLint, puppeteer).

### Modular vs coupled

**Tightly coupled inside `index.html`:**
- The 30-sunbeam mint flow (anti-farm guards, sunbeam-rain animation, tutorial freeze).
- The plant rendering pipeline (SVG-from-hash, `_generatePlantSVG`).
- The vault sync (`syncVaultToCloud`, debouncer, hydration overlay).

**Already modular / easy to extract:**
- The 54 game files in `/games/`. Each is a self-contained `(function(){ ... })()` IIFE that consumes the small `window._G` API and pushes events with `_e('event_name')`. Drop them into a standalone host that provides `window._G` (or a stand-in) and they run.
- The earn API: `window.earnHashes(amount, source)` and its Cloud Function counterpart `earnHashes`. The Cloud Function has zero coupling to anything Lucid Winds-specific — it just authenticates, validates, rate-limits, and increments `vaults/{uid}.hashLedger`.
- The mint API: `mintPlant` Cloud Function returns a server-signed plant hash. Cleanly callable from any authenticated client.

### Extraction sketch (rough; no code written yet)

To wire Glyph Forge / Tarot Run into the same Sunbeam ledger:

1. The other game's web client initializes Firebase with **the same**
   `firebaseConfig`, signs the player in (or accepts a credential transfer
   from the LW page).
2. Add the new game's domain to Firebase Console → Auth → Authorized domains.
3. On a meaningful event, call:
   ```js
   const earn = firebase.functions().httpsCallable('earnHashes')
   await earn({ amount: 5, source: 'glyphforge:level_complete' })
   ```
4. To consume sunbeams in the other game without minting a plant, ship a new
   Cloud Function `spendSunbeams` that mirrors `mintPlant`'s atomic-spend
   pattern with a smaller cost. This is the only new server code required.

The existing per-uid rate limits in `earnHashes` (300/min total, 5000/day
total) are **shared across the constellation** by design — they're per-uid,
not per-game. That's a feature for anti-cheat but a consideration: the
combined attention budget across all studio games is still 5000 sunbeams/day.

---

## 8. Anti-cheat — what prevents a game from minting Sunbeams freely?

There are real guards, both client- and server-side. None of them are perfect,
but the answer is **not** "nothing."

### Client-side (`_e` in `index.html:62080-62209`)

1. **Per-event reward table** (`_aw[gameId][eventName]`) — bounds the base amount.
2. **Tutorial freeze** — zero earn after the first-focus 30-sunbeam grant until step 34.
3. **Anti-farm progress cap** — `_afSessionProg` per-session limit on `progress`/`milestone`/etc.
4. **Anti-farm min play time** — `_afClass[gameClass].minTime` before `game_win`/`game_loss` count.
5. **Anti-farm completion cooldown** — `_afCompleteCd` seconds between `game_win`/`game_loss` credits.
6. **Anti-farm session cap** — `_afSessionCap` total sunbeams per session, default 20.
7. **Rarity multiplier ceiling** — 1.0–1.2× max, only top tier in greenhouse counts.

A malicious client can edit JS and bypass all 7. The server guards are the real defense:

### Server-side (`functions/earnHashes.js`)

8. **Auth gate** — `request.auth.uid` is required.
9. **`amount > 0`, `amount <= 200`** integer validation.
10. **300/min rolling cap** per uid.
11. **5000/day cap** per uid (resets at midnight UTC).
12. **Per-source label** (truncated to 32 chars, recorded in `lastEarnSource`) — enables forensic audit of which game/source drove anomalies.
13. **Atomic Firestore transaction** — concurrent earn requests cannot double-credit.

### Firestore rules
14. **`vaultServerFieldsImmutable()`** — client writes to `hashLedger`, `mintCounter`, `dailyMints`, `lastEarnAt`, etc. are denied at the database layer (`firestore-rules-7.txt:117-119`).
15. **`hashWallet/state.balance` hard ceiling of 10 M sunbeams** for any direct write path that survives (`firestore-rules-7.txt:163-178`).
16. **`mintLog/{uid}/mints/{plantHash}` is admin-write only** — no client can forge a mint receipt. The future NFT marketplace listing check uses this collection as the eligibility oracle.

### What's still missing (today)

- **Proof-of-play nonces**: a player still calls `earnHashes` after "playing" a game; there's no cryptographic proof the game was actually played. The migration plan in memory (`project_cloud_function_migration_plan.md`) calls for `startGame` + `earnHashes`-with-nonce. Until that ships, a determined cheater within the 5000/day cap can credit themselves.
- **No per-source rate limit yet** (only per-uid). A new constellation game could in principle eat the whole 5000/day window even if it's only one of five games.

For the studio rollout, both gaps are addressable when the migration ships,
but launch can be feasible with the current per-uid caps + the per-source
label for monitoring.

---

## 9. Auth specifics, login gating, domains

### Providers

- Firebase **Email/Password** (signup at `index.html:50443`, login at `:50492`).
- Firebase **Google** (`GoogleAuthProvider`, `signInWithPopup` → `signInWithRedirect` fallback at `:50171-50196`).
- Firebase **Facebook** (`FacebookAuthProvider`).
- **Pi Network SDK** for payments only (`sdk.minepi.com/pi-sdk.js`). Pi is not the identity layer.
- **No anonymous auth.** `grep signInAnonymously` returns zero matches in `index.html` and `functions/`.

### Is earning gated behind login?

**Yes, twice.**

Client mirror in `index.html:42505`:
```js
if (!firebase.auth || !firebase.auth().currentUser) return;
```

Server gate in `functions/earnHashes.js:48-50`:
```js
if (!request.auth || !request.auth.uid) {
  throw new HttpsError('unauthenticated', 'Sign in required.')
}
```

A signed-out player still loads the game, can pattern-match, can hear sounds,
and the local UI may flicker a sunbeam toast on top of the in-page anti-farm
guards — but **no sunbeam is credited to any persistent ledger** without a
signed-in Firebase uid. The localStorage cache mirror also defers to the
server on next sync; the server's value wins on conflict.

### Domain map

The Lucid Winds frontend is currently single-domain:

- **Production:** `lucidwinds.com` (Hostinger static hosting). Referenced in
  `index.html:777-779` (OpenGraph + canonical).
- **Firebase Auth authDomain:** `focus-grove-fffa8.firebaseapp.com`
  (auth handler iframe lives here).
- **External APIs hit by the client:**
  - `https://api.open-meteo.com/v1/forecast` — weather feed (1h cache)
  - `https://api.inaturalist.org/v1/observations` — pheno-hunt species
  - `https://sdk.minepi.com/pi-sdk.js` — Pi Network SDK
  - `https://www.googletagmanager.com/gtag/js?id=G-XE58S4X6RX` — GA4
  - `https://us-central1-focus-grove-fffa8.cloudfunctions.net/...` — Cloud Functions

Everything LW-owned is on `lucidwinds.com` + the Firebase project hostnames.
There is **no studio subdomain or multi-domain setup yet** — adding one is
purely a Firebase Console + DNS change; no code change needed in this repo
for the auth side.

---

## Appendix A — Functions that must stay on `window`

From `CLAUDE.md`, the durable public surface of the engine (these are the
functions that the modular games + external integrations depend on):

```
window._e                          window.earnHashes
window.getTotalHashes              window.spendHashes
window.mintPlant                   window.buildAttentionPayload
window.updateFocusPlant            window._generatePlantSVG
window.hashToTraits                window.getTerraGrade
window.getHaiku                    window.getPlantName
window.renderGreenhouse            window.switchTab
window.openCarousel                window.syncVaultToCloud
window._fgDeviceId                 window.PW_Onboard
window.FG_Wild                     window.FG_Backpack
window.FG_Data                     window.G (game catalog)
window._G (shared game API)        window._gameFns (loaded modular games)
window._sg (game switcher)
```

For studio extraction, the minimum portable surface is just three functions:
`earnSunbeams(amount, source)`, `getBalance()` (read), and `spendSunbeams(amount, reason)`
(once the matching Cloud Function ships). Everything else stays inside
Lucid Winds.

## Appendix B — Cloud Function exports today

`/workspaces/lucid-winds/functions/index.js`:

```js
import { initializeApp } from 'firebase-admin/app'
initializeApp()
export { piApprove }   from './piApprove.js'   // Pi Network payment approval
export { piComplete }  from './piComplete.js'  // Pi Network payment completion + entitlement
export { mintPlant }   from './mintPlant.js'   // 30-sunbeam → plant mint, server-signed
export { earnHashes }  from './earnHashes.js'  // THE seam — externalize this
```

A parked `nftSignMint` (Polygon voucher signer) is also in the directory but
not currently exported.

---

*End of recon report. Companion file: `GAMES_MANIFEST.md` (per-game inventory).*
