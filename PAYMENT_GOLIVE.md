# PAYMENT GO-LIVE — web crypto rail (NOWPayments)
Copy-paste runbook to turn on real USD payments for web (non Pi Browser) visitors. The code is already built and committed (inert behind a flag). This is just the switch-on. Budget about 20 to 30 minutes.

Reference: the build lives in functions/fulfill.js, functions/nowCreateInvoice.js, functions/nowIpn.js, and the client LW_WebPay in index.html. Pricing is in functions/fulfill.js (LW_WEB_PRICES).

---

## STEP 1 — Make a NOWPayments account (about 5 min)
1. Sign up at nowpayments.io.
2. Add a payout wallet (the coin you want to be paid out in, for example USDT or BTC). This is where your money lands.
3. In the dashboard, go to Store Settings or Payments, and find your **API key**. Copy it.
4. Go to the **IPN / Instant Payment Notifications** settings. Turn IPN on. It will give you an **IPN secret key**. Copy it. You will also set the callback URL here in Step 4.

You now have two secrets: the API key and the IPN secret.

## STEP 2 — Put the two secrets into Firebase (about 3 min)
From the repo, in a terminal that is logged into Firebase (run `firebase login` first if needed):

```
firebase functions:secrets:set NOWPAYMENTS_API_KEY
firebase functions:secrets:set NOWPAYMENTS_IPN_SECRET
```

Each command will prompt you to paste the value. Paste the API key for the first, the IPN secret for the second.

## STEP 3 — Deploy the functions (about 5 min)
```
cd functions
firebase deploy --only functions
```

This deploys the two new functions (nowCreateInvoice and nowIpn) and the updated piComplete (it was refactored to share code, same behavior). When it finishes, the output prints a URL for **nowIpn**. It looks like one of these:

```
https://us-central1-focus-grove-fffa8.cloudfunctions.net/nowIpn
or
https://nowipn-xxxxxxxx-uc.a.run.app
```

Copy whichever URL it printed for nowIpn. You need it in the next step.

If the URL is the run.app one (not the cloudfunctions.net one), set it so the invoices point to the right place, then redeploy:
```
firebase functions:secrets:set NOW_IPN_URL
```
(paste the exact nowIpn URL when prompted, then run `firebase deploy --only functions:nowCreateInvoice` again)

## STEP 4 — Point NOWPayments at our webhook (about 2 min)
Back in the NOWPayments dashboard IPN settings, set the **IPN callback URL** to the nowIpn URL you copied in Step 3. Save.

This is the handshake: when someone pays, NOWPayments calls our nowIpn, which verifies the signature and grants the item.

## STEP 5 — Publish the Firestore rule (about 2 min)
The web rail needs the new webOrders rule.
1. Open Firebase Console, project focus-grove-fffa8, Firestore Database, Rules tab.
2. Open firestore-rules-7.txt from the repo, copy the whole thing, paste it over the rules in the console, and Publish.

(If you already have a newer rules version deployed, just make sure the `match /webOrders/{orderId}` block from firestore-rules-7.txt is in it.)

## STEP 6 — Test it on YOUR device first, before the public (about 5 min)
Do not flip the global switch yet. Test quietly first.
1. Open lucidwinds.com in a normal browser (NOT Pi Browser), signed in.
2. Open the dev console and run: `localStorage.setItem('lw_webpay_enabled','1'); location.reload();`
3. Tap a buy button (for example, expand a greenhouse slot). It should open a NOWPayments checkout showing the USD price (greenhouse is 10 slots for $2).
4. Pay with a small amount of crypto. Wait a few minutes for it to confirm on chain.
5. The slots should unlock automatically when the payment confirms. If they do, the whole chain works.

Optional safer test: NOWPayments has a sandbox at sandbox.nowpayments.io for fake payments. If you want to test without spending real crypto, use a sandbox account and sandbox API key first, then switch to the real key. (The code points at the production API by default, so sandbox testing means temporarily using sandbox credentials.)

## STEP 7 — Re-test one Pi purchase (about 2 min)
Because piComplete was refactored (same behavior, shared code), do one Pi buy inside Pi Browser to confirm Pi still works exactly as before. It should be unchanged.

## STEP 8 — Turn it on for everyone
Once your own test worked, flip the global switch. In index.html, find:
```
return false;  // default OFF until backend deployed + secrets set
```
inside the `window.LW_WEBPAY_ENABLED` block, change it to `return true;`, bump LW_VERSION, commit and push. Now every web visitor outside Pi Browser can pay.

(Or, just for yourself, the localStorage flag from Step 6 keeps it on for your device only.)

---

## IF SOMETHING GOES WRONG
- Buy button shows "Checkout failed": the functions are not deployed yet or the API key secret is missing. Redo Steps 2 and 3.
- Payment went through but the item did not unlock: the IPN is not reaching us or the signature check failed. Check that the IPN callback URL in NOWPayments (Step 4) exactly matches the deployed nowIpn URL, and that the IPN secret in Firebase matches the one in the NOWPayments dashboard. Check function logs: `firebase functions:log --only nowIpn`.
- Underpaid status: NOWPayments reported the buyer paid less than owed. The code deliberately does not grant on underpayment. This is correct.

## THE PRICES (Stephen-approved 2026-07-03; edit anytime in functions/fulfill.js, then redeploy)
- Greenhouse: 10 slots for $1
- Nursery slot: $2 flat each
- Clipping slot: $1 then $2 then $3
- Seed pouch: $1 per +5 tier (to 15, then to 20)
- Item pouch: +5 slots for $1
- Emergency pouch: $3
- HALF BLOOM bundle: $5 (+20 greenhouse, +1 nursery, +1 clipping, seed pouch +5, item pouch +5)
- FULL BLOOM bundle: $10 (every slot maxed + the one-of-one Founder's Bloom plant). If the buyer already owns Half Bloom the server auto-prices it at $5 to complete.

The bundle chooser ("GROW YOUR GARDEN") appears from the greenhouse expand button whenever the web rail is on.

To change a price, edit the cents values in LW_WEB_PRICES and the matching display values in LW_WebPay._usd in index.html, then redeploy functions and push index.html.
