# Lucid Winds — Pi App Studio Submission Prep

Target submission: end of week (Tue Apr 28 → Fri May 1, 2026).
This file collects every text field, URL, and asset Pi App Studio asks for so
Stephen can paste it directly into the form.

---

## App identity

**App name:** Lucid Winds

**Tagline candidates** (Pi App Studio caps tagline at ~60 chars):

1. *Grow one-of-one botanical art with your attention.*  *(BEST — leads with the unique selling point. 51 chars.)*
2. *Pattern-match games grow procedural plants you keep forever.*  *(Solid, but starts with a mechanic. 60 chars exactly.)*
3. *A meditative botanical garden powered by SHA-256.*  *(Crypto-flavored. Nerdy but accurate. 50 chars.)*

**Recommended pick:** Tagline #1 — strongest hook.

**Category:** Games

**Subcategory recommendation:** Casual / Puzzle  *(SET-style pattern matching is the core loop. Avoid "Idle" — there's no idle progression.)*

**Age rating recommendation:** 13+ (Everyone, no violence, no chat, no UGC)

**Languages:** English only at launch. Add a note in the description that more
languages are planned.

---

## Long description (200–300 words, paste into the form)

> Lucid Winds is a meditative botanical game where every plant is a one-of-one
> piece of generative art. Play short pattern-matching games (think SET cards,
> a Wordle riff, dice puzzles, color sorts) to earn Sunbeams. Thirty Sunbeams
> mints a brand-new plant — its pot, leaves, flower, aura, and rare creature
> companion are all derived deterministically from a SHA-256 hash, so no two
> plants in the game can ever be identical.
>
> Plants live in your Greenhouse, a softly-lit collection of flippable cards
> with hand-tuned Celtic borders that change with the seasons. Cross-pollinate
> two plants in the Nursery to breed new offspring with chimera veins and
> traits inherited from both parents. Step into the Wild tab to drop plants on
> a real-world map, harvest feral seeds within 75 meters of your GPS location,
> and defend territory through skill-based mini-games.
>
> Pi Network powers the in-game economy: 1 Pi to expand your greenhouse,
> emergency pouch slots, item-pouch upgrades, and Hut early-opens. We never
> custody your Pi — the Pi SDK handles every transaction directly with the Pi
> server.
>
> Every plant comes with a unique procedural haiku (a 1,038-word bank in
> 7-5-7 strict syllabic structure). The 7-tier rarity system runs from Common
> to Cosmic, with Mythic creatures (the Toad, the Cicada, the Beholder) hidden
> in less than 1% of mints. Collect them, breed them, and grow a garden no one
> else will ever have.

(287 words)

---

## Screenshots needed (Pi App Studio asks for 6–8)

Export at 540x960 (Pi mobile target), PNG or JPEG, under 2 MB each. Keep the
top 80 px clean for Pi App Studio's overlaid title bar.

1. **Onboarding beat 1** — the cinematic intro frame ("a seed waits in dark
   soil") with the Lucid Winds logo. Sets brand, no UI clutter.
2. **GAME tab mid-play** — a SET grid with a winning trio highlighted in
   gold. Shows the core loop in one frame.
3. **GREENHOUSE grid** — 9-12 cards visible, mix of seasons (spring pink +
   summer gold + autumn copper) so the seasonal Celtic borders read.
4. **Carousel detail view** — one card flipped open showing the plant SVG,
   name, haiku, and the seasonal EA knot badge. Pure art moment.
5. **NURSERY** — two seeds growing, one with the bloom-ready button visible.
   Shows depth beyond the core loop.
6. **WILD tab** — Leaflet map with one of your plants dropped, a feral seed
   pulsing nearby, the Field Pouch visible at the bottom. Sells the
   real-world layer.
7. **BREEDING screen** — two card backs side by side with the Offspring
   Forecast meters showing EA range + chimera generation. (Optional, swap
   with #8 if you have to choose.)
8. **TROPHIES / BoS** — the Trophies tab with a row of achievements unlocked,
   to demonstrate progression hooks.

If we get only 6, drop #5 (Nursery) and #7 (Breeding). #1, #2, #3, #4, #6, #8
is the minimum viable set.

---

## Required URLs (need to be live before submission)

| Field | URL |
|---|---|
| App URL | `https://lucidwinds.com` |
| Privacy Policy | `https://lucidwinds.com/legal/privacy.html` |
| Terms of Service | `https://lucidwinds.com/legal/terms.html` |
| Support email | `stephenfurpahs@gmail.com` |
| Support URL (optional) | `mailto:stephenfurpahs@gmail.com` (or skip) |

**Action:** Push the `legal/` directory live to Hostinger so both URLs
return 200 BEFORE clicking Submit.

---

## Pi-side info needed from Stephen

These cannot be filled in by code; Stephen needs to grab them from the Pi
developer portal:

- [ ] **Pi App API key (server)** — set as Firebase secret:
      `firebase functions:secrets:set PI_SERVER_KEY`
- [ ] **Pi App ID** — referenced in any Pi developer-portal hookup forms
- [ ] **Pi developer wallet address** — the Pi wallet that will receive in-app
      payments (Pi App Studio will ask for it at submission)
- [ ] **Sandbox vs Mainnet** — game is currently `sandbox: true` in
      `index.html` line 65040. Flip to `false` BEFORE final submission.
- [ ] **Pi developer profile** — username + KYC status (Pioneer must be KYC'd
      to receive payments on mainnet)

---

## Pre-submission checklist

Backend (this Claude's scope):
- [x] piApprove + piComplete v2 onCall functions written and committed
- [x] firestore-rules-7.txt deployed (immutability + auth)
- [x] Privacy policy live at /legal/privacy.html
- [x] Terms of Service live at /legal/terms.html

Backend (deploy steps for Stephen):
- [ ] `cd functions && npm install`
- [ ] `firebase functions:secrets:set PI_SERVER_KEY` (paste developer-portal key)
- [ ] `firebase deploy --only functions` (deploys piApprove, piComplete, nftSignMint)
- [ ] Paste `firestore-rules-7.txt` into Firebase Console → Firestore → Rules → Publish
- [ ] Smoke-test: make one sandbox Pi payment end-to-end, confirm
      `piTransactions/{paymentId}` reaches `status: 'completed'` and the vault
      entitlement applied
- [ ] Push `/legal/` to Hostinger; visit both URLs in a browser; confirm
      they look good on mobile

Frontend (the parallel Claude's scope, but checking before submit):
- [ ] Pi SDK init flipped from `sandbox: true` to `sandbox: false`
- [ ] Client `_approvePayment` / `_completePayment` migrated from XHR to
      `httpsCallable` so Firebase auth attaches automatically
- [ ] Settings menu has a visible "Privacy" + "Terms" link pointing at
      `/legal/privacy.html` and `/legal/terms.html`
- [ ] `LW_PI_ENABLED` flipped to default `true` (or removed) once tested
- [ ] Onboarding beat 4 mentions Pi Network as the payment provider so
      players know what they're consenting to
- [ ] Service worker bumped, cache busted, fresh deploy verified on iPhone
      and Pixel

Polish:
- [ ] Take 6 screenshots above on real device, edit to 540x960, save to
      `assets/screenshots/`
- [ ] App icon: 512x512 PNG, ideally a stylized leaf or seed monogram on the
      midnight background. Pi App Studio will ask for one.
- [ ] Splash / banner: 1024x512 PNG, Lucid Winds wordmark over a botanical
      cinematic shot.

---

## What to expect after submission

1. **Initial review (~2-7 business days)** — Pi developer reviewers play the
   app in sandbox mode, click around, look for crashes, verify the privacy
   policy and ToS render. They will reject if either page 404s.
2. **Sandbox testing window** — even after approval, the app starts in
   sandbox by default. Stephen needs to request mainnet promotion through
   the developer portal.
3. **First mainnet rollout** — Pi caps the first wave at a small percentage
   of Pioneers. Watch the Firebase logs (`firebase functions:log`) for the
   first 48 hours; any non-2xx from `/v2/payments/*/complete` calls means a
   stuck transaction we need to manually reconcile.
4. **Payouts** — Pi settles paid-out Pi to the developer wallet on a rolling
   schedule. Stephen should reconcile against `piTransactions` weekly.

Common rejection reasons to head off proactively:
- Privacy policy or ToS page 404s — *fixed by P2 above, just deploy them*.
- Sandbox flag not flipped to mainnet on submission — *checklist item above*.
- App crashes on first launch in Pi Browser — *test in actual Pi Browser
  before submitting*.
- Missing app icon — *add one*.

---

## Open questions for Stephen before submitting

1. Are we keeping the legacy NFT mint signing function (`nftSignMint`) in the
   submission, or rolling it out separately later? It's harmless if the
   secrets aren't set, but Pi reviewers may ask why a Polygon endpoint is
   exposed.
2. Mainnet vs sandbox — submit in sandbox first to be safe, then promote? Or
   go straight to mainnet on first try? Sandbox-first is the conservative
   call.
3. Do we want a "Manage subscriptions / view purchase history" surface in the
   game before submission? Pi Studio doesn't require it, but it's a green
   flag for reviewers.

---

## Quick-paste cheat sheet

When the Pi App Studio form is open, this is the sequence:

```
Name:           Lucid Winds
Tagline:        Grow one-of-one botanical art with your attention.
Category:       Games
Subcategory:    Casual / Puzzle
Age:            13+
Languages:      English
URL:            https://lucidwinds.com
Privacy:        https://lucidwinds.com/legal/privacy.html
Terms:          https://lucidwinds.com/legal/terms.html
Support:        stephenfurpahs@gmail.com
Description:    [paste 287-word block above]
Screenshots:    [upload 6-8 from the list above]
Pi wallet:      [Stephen pastes from Pi dev portal]
Sandbox:        Off (mainnet) — confirm sandbox:false in client first
```

You're done.
