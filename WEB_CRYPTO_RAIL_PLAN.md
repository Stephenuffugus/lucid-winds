# PLAN — USD-priced, pay-in-any-crypto rail for the open-web / PWA build

> **Status:** PROPOSAL — plan doc only, no app code changed. Awaiting Stephen's go + answers (bottom).
> **Author:** Claude Code · **Date:** 2026-06-18
> **Goal (Stephen, verbatim intent):** set a **dollar amount** for an item and let players pay in
> **whatever crypto they want** at that USD value — so the non-Pi-Browser audience can buy too.

---

## 0. The one hard constraint (read first)

This rail is for the **regular web / installed PWA build only** — NOT Pi Browser. Two Pi platform
walls make "pay in Pi from a normal browser" impossible (not a code choice, Pi's design):

1. **Pi payments only exist inside Pi Browser.** `window.Pi` is injected only there; in Chrome/Safari
   it doesn't exist, so no Pi payment can be initiated.
2. **Pi can't ride a USD-priced multi-crypto processor.** Pi isn't freely listed/convertible, has no
   reliable USD market rate to quote against, and Pi's rules forbid mixing Pi with fiat/other crypto
   inside Pi Browser.

So the model is **dual-rail, chosen by context** — and the branch already exists (`body.pi-browser`
is set at boot; client uses `_piOn`):

| Context | Rail | Pricing | Status |
|---|---|---|---|
| **Inside Pi Browser** | Pi SDK (`Pi.createPayment` → `piApprove`/`piComplete`) | Pi (e.g. 1 Pi/slot) | ✅ built |
| **Regular web / PWA** | This plan — NOWPayments | **USD, pay in any major crypto** | ⬜ to build |

The web rail must stay **hidden inside Pi Browser** (Pi forbids external content / non-Pi payment /
redirects) — same `body.pi-browser` gate the studio games use.

---

## 1. The key architectural win — fulfillment is already processor-agnostic

`functions/piComplete.js` applies entitlements in a Firestore transaction keyed purely on
`metadata.type`, idempotent via `piTransactions/{paymentId}.status`:

```
slot                  → meta/state.slots += 1 (cap 60)
nursery_slot          → vault.lw_nursery_slots += 1 (cap 6)
nursery_clipping_slot → vault.lw_nur_clipping_slots += 1 (cap 5)
item_pouch_slot       → vault.lw_pouch_cap += 1 (cap 40)
seed_pouch_slot       → vault.backpack.unlocks.{seed15|seed20} = true
emergency_pouch       → vault.emergency_pouch_today = today (24h)
```

**Nothing here is Pi-specific.** The web rail reuses the SAME product types and the SAME fulfillment.
Step 1 of the build is to **extract that switch into a shared module** (`functions/fulfill.js`,
`applyFulfillment(tx, uid, type, metadata)`) that BOTH `piComplete` and the new web webhook call.
One fulfillment definition, two payment rails. No entitlement logic gets duplicated or can drift.

---

## 2. Processor: NOWPayments (consistent with prior growth research)

Picked in `project_growth_research_jun12.md`. Why it fits:

- **USD-denominated invoices, paid in ~300 coins** at live checkout rate — exactly the ask.
- **Non-custodial-friendly + non-US-friendly** (Coinbase Commerce was flagged dead for non-US;
  Korea geo-gate must keep crypto OFF — handle in client gating).
- **Server API + HMAC-signed IPN webhook** → clean server-authoritative fulfillment, same shape as Pi.
- Fee ~0.5–1% + network fees.

Alternatives considered: **Coinbase Commerce** (dead non-US — rejected); **Crossmint** (great for the
separate NFT-extraction path, not general item sales — keep for that); direct on-chain (no USD pricing,
no fiat quoting — rejected).

---

## 3. The flow

```
Client (web/PWA, signed in)                Backend (cloud functions)            NOWPayments
  tap "Buy slot — $1"                          │                                    │
   └─ nowCreateInvoice({product})  ─────────▶  create webOrders/{orderId}           │
                                               (uid, type, usdPrice, status=created)│
                                               └─ NOWPayments API: create invoice ──▶│
   ◀───────────── invoice_url / pay_url ───────┘                                    │
  redirect/iframe to NOWPayments checkout ──────────────────────────────────────▶ user picks coin, pays
                                                                                     │ (async confirmations)
                                               nowIpn (HTTP webhook) ◀── IPN (HMAC) ─┘
                                               ├─ verify HMAC + amount + order
                                               ├─ if 'finished'/'confirmed':
                                               │    runTransaction:
                                               │      applyFulfillment(tx,uid,type,meta)  ← SHARED w/ Pi
                                               │      webOrders/{orderId}.status='completed' (idempotent)
                                               └─ 200 OK
  next vault load (or push) reflects the new entitlement
```

Unlike Pi (near-instant), crypto confirmation is **async** (minutes). UX needs a pending→confirmed
state; fulfillment happens on the webhook, and the client surfaces it on the next vault sync (or a
lightweight order-status poll / FCM push).

---

## 4. New backend pieces

- **`functions/fulfill.js`** — `applyFulfillment(tx, uid, type, metadata)` extracted from piComplete;
  piComplete refactored to call it (behavior-preserving). Caps stay in here.
- **`nowCreateInvoice`** (v2 `onCall`) — auth required (uid from `request.auth`). Validates product
  type ∈ catalog, looks up USD price **server-side** (never trust client price), creates
  `webOrders/{orderId}` (uid, type, metadata, usdPrice, status:'created', createdAt), calls NOWPayments
  create-invoice with `order_id`, `price_amount`(USD), `ipn_callback_url`, returns the checkout URL.
- **`nowIpn`** (v2 `onRequest`, HTTP) — verifies the `x-nowpayments-sig` HMAC against the IPN secret;
  loads `webOrders/{orderId}`; on `payment_status` ∈ {finished, confirmed}: runTransaction →
  `applyFulfillment` + set status='completed' (idempotent on already-completed); records actually-paid
  coin/amount for audit; returns 200. Ignores/records non-terminal statuses.
- **Secrets:** `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` via `firebase functions:secrets:set`.

### Firestore
- **`webOrders/{orderId}`** — `{uid, type, metadata, usdPrice, coin, amountCrypto, status, createdAt,
  completedAt}`. Mirrors `piTransactions` (audit + idempotency + per-user lookup).
- **Rules:** client may READ its own `webOrders` (uid match) for status polling; **no client writes**
  (created by `nowCreateInvoice`, completed by `nowIpn` — admin context only). Add to `firestore-rules-7.txt`.

---

## 5. Pricing — one catalog, two currencies

Today prices are hardcoded as Pi at each call site (`'PAY 1 PI'`, slot bundles, pouches at
`index.html:41284`, `46799`, `46843`, …). Introduce a single catalog so Pi + USD stay in lockstep and
nothing is hardcoded twice:

```js
// product type → { pi: <Pi price>, usd: <USD cents>, tier? }
var LW_PRICES = {
  slot:                 { pi:1,  usd:100 },
  nursery_slot:         { pi:1,  usd:100 },
  nursery_clipping_slot:{ pi:1,  usd:100 },
  item_pouch_slot:      { pi:1,  usd:100 },
  seed_pouch_slot:      { pi:1,  usd:150 },   // + tier
  emergency_pouch:      { pi:10, usd:300 }
};
```

- **Server is source of truth for USD** (the cloud function reads its own copy; client price is display-only).
- USD values are Stephen's call. **Crypto minimums matter:** network fees make sub-~$1 purchases
  uneconomic (a $1 buy can cost $0.30+ in fees on some chains) — recommend a **$1 floor** and/or steer
  small buys to low-fee coins / bundle pricing ("5 slots for $4").

---

## 6. Client changes (`index.html`)

- **Rail selection:** where buy buttons read `_piOn`, add the web branch: in Pi Browser → Pi flow
  (unchanged); else → `nowCreateInvoice` flow. A small `_lwBuy(productType, tier)` wrapper picks the
  rail so call sites don't each branch.
- **Hidden in Pi Browser:** the web-pay UI is gated on `!body.pi-browser` (same gate as studio games).
- **Pending UX:** "Payment received — confirming on-chain…" state; resolve on `webOrders` status poll
  or next vault sync; toast + entitlement refresh on completion (reuse `loadVaultFromCloud`).
- **Sign-in required** before invoice (need uid to map the order) — reuse existing Firebase auth.

---

## 7. Compliance / ops (flag now, decide before flipping on)

- **Real commerce:** selling digital goods for crypto = taxable revenue; track via `webOrders`. Fees
  ~0.5–1% + network. Consider a simple ToS/refund line (crypto is irreversible → "all sales final",
  state it).
- **Geo:** keep crypto OFF where required (Korea per growth notes) — client-gate the web-pay UI by
  region, or rely on NOWPayments' own restrictions; **confirm before launch.**
- **KYC:** NOWPayments handles processor-side KYC/AML; at low ticket sizes this is light, but volume
  may trigger thresholds — Stephen's compliance call.
- **Async settlement:** set clear "confirming" expectations; handle underpayment/overpayment/expiry
  IPN statuses (NOWPayments sends them) — record, don't fulfill partials.
- **Not in Pi Browser, ever:** belt-and-suspenders the gate; a non-Pi payment surfacing in Pi Browser
  is a Pi-policy violation.

---

## 8. Security

- USD price resolved **server-side** from `LW_PRICES` — client cannot set its own price.
- IPN **HMAC verified**; reject unsigned/mismatched. Validate the paid amount ≥ quoted (handle
  underpayment as non-fulfilled).
- Idempotent fulfillment keyed on `webOrders/{orderId}.status` (same guarantee as Pi's `alreadyCompleted`).
- `webOrders` writes are server-only (rules).

---

## 9. Open questions for Stephen

1. **USD prices** per product (proposed $1 across the board, emergency pouch $3) — your numbers?
2. **Minimum / bundles:** OK to set a ~$1 floor and add bundle pricing so crypto network fees don't
   eat tiny buys?
3. **Same catalog as Pi** (slots/pouches), or also sell something web-only?
4. **NOWPayments account:** you'd register + drop `NOWPAYMENTS_API_KEY` + `NOWPAYMENTS_IPN_SECRET`
   (I can't create the account or hold keys). Confirm you'll set that up when we build.
5. **Geo policy:** any regions to hard-disable crypto in (Korea flagged)?

---

## 10. Phased build (once approved)

- **P1 — Shared fulfillment refactor** (`functions/fulfill.js`; piComplete calls it). Behavior-preserving;
  ship + verify Pi still works. *(~0.5 day)*
- **P2 — Backend rail:** `nowCreateInvoice` + `nowIpn` + `webOrders` + rules + secrets. Test against
  NOWPayments sandbox. *(~2–3 days)*
- **P3 — Pricing catalog** (`LW_PRICES`) + client `_lwBuy` rail selection + web-pay UI + pending UX,
  gated out of Pi Browser. *(~2 days)*
- **P4 — End-to-end test** (sandbox coin → webhook → entitlement on vault), geo gating, ops/ToS line.
  *(~1 day)*

Rough total **~6 working days**, plus Stephen-side NOWPayments registration + price decisions.
No app code changes until P1 is approved.
