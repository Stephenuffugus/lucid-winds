# NEXT SESSION — start here

> ⛔ **NOWPAYMENTS IS DEAD — STRIPE IS THE RAIL.** Stephen switched to Stripe and
> makes payment links himself; the crypto rail below was built, never switched on,
> and is not coming back. Corrected 2026-08-21 after this document sent an agent
> to recommend a 20 minute NOWPayments go-live that had already been abandoned.
> Live Stripe links today: `portal/index.html` and `support.html` share one, and
> `hush/index.html` has its own. **Lucid Winds has no tip link yet.**

Two priorities, in order: get payments live, then start the marketing push. Everything below is built and waiting. Updated 2026-06-24.

---

## PRIORITY 1 — PAYMENTS LIVE (first and foremost)
The web crypto rail (NOWPayments) is fully built, committed, and verified against NOWPayments' own docs (the webhook signature matches their reference exactly, so it should work on the first deploy, not just clear legally). It is inert behind a flag until you turn it on.

**Do this (about 20 to 30 minutes, follow `PAYMENT_GOLIVE.md` for the exact commands):**
1. Make a NOWPayments account, add a payout wallet, copy the API key + IPN secret.
2. `firebase functions:secrets:set NOWPAYMENTS_API_KEY` and `NOWPAYMENTS_IPN_SECRET`.
3. `firebase deploy --only functions` (deploys the 2 new functions + the refactored piComplete).
4. Set the IPN callback URL in the NOWPayments dashboard to the deployed `nowIpn` URL.
5. Publish the updated `firestore-rules-7.txt` (Firebase Console).
6. Test on your own device first (`localStorage.lw_webpay_enabled='1'`), buy something small, confirm it unlocks.
7. Re-test one Pi purchase inside Pi Browser (piComplete was refactored, same behavior).
8. Flip the global switch: `LW_WEBPAY_ENABLED = true` in index.html, bump LW_VERSION, push.

**Only you can do this part** (it needs your NOWPayments account, your keys, and your Firebase deploy access). The engineering is done.

**Prices** (editable in `functions/fulfill.js` + the client mirror): greenhouse 10 slots/$2, nursery + clipping $1/$2/$3 escalating, seed pouch $3/$4, item pouch $1, emergency $3.

Outcome: a normal web visitor (outside Pi Browser) can pay real, USD-convertible crypto. That is the first real-dollar path.

---

## PRIORITY 2 — MARKETING PUSH (once payments are live)
The whole plan is written and ready. You do not have to think, just execute.

- **Strategy + the why:** `PROMOTE_PLAYBOOK.md` (channels ranked, what works, paid-spend honesty, the single biggest risk to avoid).
- **Daily doing:** `DAILY_PROMO.md` (also a Google Doc in your Drive). A few minutes a day: open it, do today's one line, close it. It has 8 record-ready video scripts and 5 warm outreach drafts already written.

**The lead:** cozy one-of-one garden. **The link, everywhere:** lucidwinds.com/portal/ (instant play, no install, no account). **The single highest-leverage action:** record and post video 1. Nobody but you can press record.

**On advertising specifically:** for a free web game, cold paid ads waste money. The one place a small spend pays off is boosting a clip that has ALREADY proven itself organically. So: post organically first, find your winner, then put a little money behind that proven clip. Details in the playbook's paid-spend section.

**Only you can do this part:** recording videos, posting, and the genuine community engagement + outreach. Agents can keep refilling the script/outreach queue, but the authenticity has to be you (and auto-posting gets accounts banned).

---

## STATUS — what is already done (so you start confident)
- Web crypto payment rail: built + verified, awaiting your deploy.
- Pi rail: built (sandbox; flips to mainnet after App Studio approval).
- Marketing: full playbook + daily kit written, daily kit also in your Google Drive.
- Recent ships: garden visiting + share-my-garden, the wolf banner, the music system (49 instrumental tracks, your 8 originals + auto-greeting + per-section playback + skip checkboxes), reachable walking cocoons + per-km Dew reward, longer fresh-device splash.

Everything is committed and pushed to origin/main. Nothing is fragile.
