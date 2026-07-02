# LUCID WINDS — FIAT MONEY PLAN (Ko-fi + Printed Keepsakes)
# Drafted 2026-07-01. Companion to PAYMENT_GOLIVE.md (crypto rail) and PROMOTE_PLAYBOOK.md (reach).
# Voice rule: warm, human, dad angle where it fits, ZERO en/em dashes.

## WHY THIS EXISTS (the honest reason)

The two payment rails we built (Pi SDK and NOWPayments web crypto) are both crypto only.
There is no card path anywhere in the code today. The audience our marketing attracts
(cozy, general, mostly non crypto) will not open a wallet, hold coins, and wait on a
new tab for an on chain confirm to buy a two dollar slot. So the crypto rail can bill
only a razor thin sliver of visitors.

Fiat is the money rail that matches the people we bring in. This plan stands up two fiat
surfaces that take a normal debit or credit card, need no wallet, and can be live this week
without touching the locked economy:

1. Ko-fi tips (first real dollar, days)
2. Printed keepsake plant cards (the differentiated product, weeks)

The crypto rail stays on as a parallel afternoon flip for the minority who prefer it
(see PAYMENT_GOLIVE.md). We are not replacing it. We are adding the rail the cozy crowd
will actually use.

Council of Five ruling (2026-07-01): fiat first, crypto second, NFT never in marketing copy.
All five seats independently pushed back on "flip the crypto rail as the income unlock."

---

## GUARDRAIL BEFORE ANY PAYMENT GOES LIVE (blocking)

Cloud sync is incomplete (see memory project_vault_sync_completeness_audit). Clearing site
data can lose local only state. If a player pays and their purchase lives only in browser
cache, then a cache clear becomes a chargeback and a burned player.

Ko-fi tips and printed cards do NOT grant in game entitlements, so they are safe to launch
first with zero sync risk (nothing to lose on a cache clear). Any purchase that grants an
in game unlock (slots, pouches, the crypto catalog) must wait until purchases write to the
cloud vault, not the browser. Do the sync fix before switching on any entitlement purchase.

---

## SURFACE 1: KO-FI TIPS (first dollar, ~30 minutes of Stephen only setup)

Ko-fi takes card payments, one time or monthly, 0 percent platform fee on the free tier
(the card processor still takes its cut). No inventory, no code risk, instant to stand up.

### Stephen only steps
1. Create the Ko-fi page at ko-fi.com. Handle suggestion: lucidwinds or lucidwindsgame.
2. Connect Stripe or PayPal for payouts (Ko-fi walks you through it).
3. Set the page title, the header image (reuse a plant card or the og card), and paste the
   About copy below.
4. Turn on "Buy me a coffee" one time tips. Set the coffee unit to 3 dollars. Add a short
   thank you message (below).
5. Grab the page URL (ko-fi.com/yourhandle) and send it to me so I can wire the buttons.

### What I (agent) do once you send the URL
- Add a small "Support the gardener" button on the portal, the app menu, and the future
  /name page, opening the Ko-fi page in a new tab. No account or wallet needed to give.
- Keep it soft and late. Never a wall, never a nag. One gentle button.

### Ready to paste: Ko-fi About copy (no dashes)

  Hi, I am Stephen. I built Lucid Winds on my own over about sixty days, mostly late at
  night after my kids went to sleep. Every plant in the game is one of a kind, grown from
  math so no two are ever the same, and each one gets its own little poem.

  The game is free and it will stay free. If it made you smile, a tip helps me keep the
  lights on and keep growing it. Thank you for being here.

### Ready to paste: thank you message after a tip

  Thank you so much. You just helped a solo dad keep this garden growing. Come say hi any
  time at lucidwinds.com/portal.

### Reality check
Tips are real money but small and lumpy. Expect coffee money, not rent, at current traffic.
The point is that it is the first surface a normal person will actually use, and it rides
for free on the same reach the video and share loop create. It also warms up the audience
for Surface 2.

---

## SURFACE 2: PRINTED KEEPSAKE PLANT CARDS (the product that fits the feeling)

This is the dollar sitting in plain sight. Nobody pays two dollars for "greenhouse slots,"
but people pay fifteen to thirty dollars for an object with meaning: a plant grown from a
newborn's name, a memorial plant for someone gone, a kid's name framed on the wall. This is
the one fiat product that matches the emotional audience the marketing brings in, and the
one of a kind angle is finally true and literal on a physical object.

### The model: print on demand, zero inventory, zero cash up front
Use Printful, Printify, or Gelato. You upload a print ready image per order, they print and
ship straight to the buyer, and they bill you only after the buyer pays. No stock, no risk.

Good first product formats:
- A5 or 5x7 art print of the plant plus its poem (cheapest, most giftable)
- Framed print (higher price, higher margin, great for the memorial and newborn angles)
- Greeting card version (the poem inside)

### The one build this needs (agent codeable, medium size)
The current download card renders at 640x960, which is screen resolution, too low for print.
For a crisp 5x7 at 300 dpi we need about 1500x2100. The renderer already draws to a canvas,
so this is a higher resolution pass of the existing downloadPlantCard path plus a print
layout (more margin, the poem larger, no app chrome). I will scope this as its own task after
the /name page, since it reuses the same renderer.

### The flow (simplest honest version to start)
Phase 1 (manual, prove demand first): a "Order a print of this plant" button emails the order
(the plant hash plus the buyer's shipping details) to Stephen, payment via a Ko-fi shop item
or a Stripe payment link. Stephen uploads the print image to Printful by hand and places the
order. Slow but zero build beyond a form, and it tells us if anyone actually wants this before
we build automation.
Phase 2 (if demand shows): wire the Printful API so the order auto creates the print job from
the hash. Only build this once Phase 1 has real orders.

### Pricing (draft, Stephen to rule)
- A5 or 5x7 print: 18 to 24 dollars (Printful cost roughly 5 to 9 plus shipping, healthy margin)
- Framed: 35 to 55 dollars
- Card: 6 to 9 dollars
Keep it simple at launch: one print product, one price.

### Why this ranks above the crypto catalog near term
It takes a card (everyone has one), it carries real emotional value (people pay more, gladly),
it needs no wallet and no signup wall, and it is a product competitors cannot copy because the
plant is derived from the buyer's own name or chosen word. It is the natural upsell from the
free /name page.

---

## SURFACE 3: PORTAL AD REV SHARE (not fiat, but the real near term engine)

Covered in the growth plan and PROMOTE_PLAYBOOK. Listing the strongest individual games on
CrazyGames, Poki, GameDistribution, and itch.io earns ad rev share from free traffic with no
signup and no wallet, and it is also distribution. Research puts a realistic first web game at
500 to 3000 dollars a month once traffic builds. This is both money and reach, so it belongs in
the money plan even though it is not a fiat checkout. Treat it as the near term income backbone.

---

## SURFACE 4: THE CRYPTO RAIL (parallel afternoon flip, keep it, do not lead with it)

Follow PAYMENT_GOLIVE.md as written. Verify the NOWPayments IPN HMAC in sandbox first (the one
documented pre flip risk), then set the secrets, deploy functions, flip LW_WEBPAY_ENABLED, and
move Pi to mainnet. This captures the crypto native and Pi Browser minority who genuinely prefer
it. It is real, but thin near term, so do not judge 90 day success by it, and never say "NFT" or
"mint" in cozy facing copy. When Base and Crossmint extraction ships later, frame it as "download
and own your plant."

---

## SEQUENCE AND WHO DOES WHAT

Week 1
- Stephen: create Ko-fi, connect payout, paste copy, send me the URL. (~30 min)
- Stephen (parallel): run the PAYMENT_GOLIVE.md crypto go-live steps.
- Agent: wire the Ko-fi button onto portal, app, and /name once URL arrives. Draft the print
  product page copy and the manual order form.

Weeks 2 to 6
- Agent: build the print resolution card render (after /name ships).
- Stephen: pick a print on demand provider, order one sample of your own plant to check quality,
  rule on pricing.
- Agent: stand up the Phase 1 manual print order flow.

Ongoing
- Agent: list the fleet on the aggregators for ad rev share (needs Stephen accounts).
- Both: watch the weekly scorecard. Money in is listed separately by source (tips vs ad rev
  share vs print orders vs crypto IAP) so a thin crypto week never reads as failure of the whole
  plan.

## THE ONE RULE
Judge 90 day success on portal sessions, shares, ad rev share, and tips, not on crypto IAP. The
fiat surfaces plus ad rev share are where the first real, repeatable dollars come from for this
audience.
