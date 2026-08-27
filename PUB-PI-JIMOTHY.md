# PUB-PI-JIMOTHY, Jimothy on Pi Network then Flock the World

Research done 27 August 2026 against live Pi sources. Every claim below carries a URL
and that access date. Where I could not verify something I say so in the same sentence
rather than at the bottom.

**Updated the same day after Stephen's call to skip the listing.** The new plan is at the top.
The listing material below it is now background, kept because it is what you would need if the
door ever opens, and because one of its findings is a live bug that matters either way.

---

# ⭐ THE PLAN CHANGED, 27 AUGUST: SKIP THE LISTING, JUST GET PLAYED

Stephen's call, and it is the right one: *"that doesn't mean I can't make it Pi accessible and
then just go post it everywhere and have the tip jar in there... just get them playing my games
and seeing my stuff on the Pi Browser. If they're talking about it, maybe the Pi Network will
actually listen."*

**Everything below still applies if you ever want a listing. But the listing is no longer the
plan, so here is what the plan costs, and there is one surprise in it.**

## ✅ The free version costs literally nothing

**If the game takes no payments, there is nothing to do.** No Developer Portal registration, no
KYC, no wallet, no review, no `validation-key.txt`. Pi Browser is a general browser with an
address bar; Pi's own instruction for its demo app is "Simply type demo.pi on the address bar
of the Pi Browser", and its docs say "Developers are able to host their apps on non-Pi domains
if they choose."

**Minimum viable: a public HTTPS URL.** You already have **108** of them: 116 satellites minus
the eight that carry `dev-gate.js` and serve the workbench gate (`burrow-bowl`,
`dragon-philosophy`, `flock-the-world`, `impossible-garden`, `moon-claw`, `puppy-dash`,
`skyshot`, `twin-lanterns`). A Pioneer types
`lucidwinds.com/satellites/stream-hop/` and plays. Today.

## ⛔ But the tip jar is not free, and this is the surprise

**There is no tip primitive in the Pi SDK.** `Pi.createPayment` is the only inbound path, so a
tip is a U2A payment, and U2A on Mainnet has its own gate:

> "Generate an app wallet keypair for the 'Connect App Wallet' step, then apply for an
> **Incoming Multisig Wallet for the U2A payment flow**. **The review process can take time**,
> but once the application is **approved by the Pi Core Team**, you can connect the approved
> wallet to your app."
> — [Launching on Pi Mainnet](https://pi-apps.github.io/pi-sdk-docs/Launch), accessed 2026-08-27

**That gate sits on the mainnet launch path, not the listing path.** Which means: skipping the
listing review does not skip a Core Team review. It swaps one for a different one. Verified
three ways: the page is titled "Launching on Pi Mainnet" and is step 5 of Getting Started;
listing lives on a separate page outside that sequence; and the requirement attaches to "the
U2A payment flow" as a capability, not to directory eligibility.

**Full cost of a working tip jar, all mandatory:**

1. Verify email in the Pi mining app
2. Register a **Mainnet** app in the Developer Portal (network is permanent, cannot be changed)
3. Configure hosting, self hosted is fine
4. **Complete Pi KYC**
5. **Obtain a migrated Mainnet wallet**
6. Verify domain ownership with `validation-key.txt` at the root
7. Generate a Mainnet API key (a Testnet key causes payment failures)
8. ⛔ **Apply for the Incoming Multisig Wallet and wait for Core Team approval**
9. Run a backend that calls `/approve` and `/complete`

⚠️ **Step 9 is not a client side feature.** Payments need server side approval and completion.
Your Firebase functions can host it, and `piApprove` and `piComplete` already exist, but a tip
is not a button you drop in the HTML.

⚠️ And one stale looking gate worth checking on the day: the community checklist says of the
Mainnet wallet, "Slots to apply are currently sent on an **invitation basis**." That page
footers as "Pi Network 2025" and likely predates Open Network. **UNVERIFIED** whether invitation
gating still applies in August 2026.

## The three ways to take Pi without that approval, and why none is clean

| Path | Verdict |
|---|---|
| `Pi.createPayment` without an approved app wallet | ⛔ **No.** That approval is what gates this exact flow |
| **Paste a plain wallet address in the game** | ⚠️ **Not prohibited by anything I could find**, and Pi's network rules allow "Transfer of Pi between Pioneers for goods and services". But nothing blesses it, it forfeits any future listing, and it reads to Pioneers exactly like the address paste pattern **Pi's own Safety Center trains them to distrust**. No receipt, no refund, no record. ⛔ Don't |
| Pi Ad Network | ⛔ **Same gate, different queue.** "Displaying ads is open to all applications in the Pi ecosystem, but **only applications approved by Pi Core Team can be monetized**" |

## ⛔⛔ And the thing that will actually break the plan on iPhones

This one is bigger than the tip jar and it is not about money at all.

> "The Pi Browser utilizes iFrames to display App within the browser... all apps displayed
> within Pi Browser will be considered Third Party Applications by the device. **iOS natively
> disables cookies from all Third Party Applications by default**... Developers should expect
> that **most Pioneers will have the cookies disabled**."
> — [Pi Browser Introduction](https://pi-apps.github.io/community-developer-guide/docs/gettingStarted/piBrowserIntroduction/)

Every game you have stores progress in `localStorage`. In a third party iframe on iOS that is
partitioned or blocked. **On iPhone, Pioneers may lose their save every single session.**

"Just get them playing" does not survive a game that forgets them. Android is fine per the same
page. ⚠️ Pi's doc says "cookies"; whether WebKit also evicts `localStorage` in Pi's iframe is
undocumented and I could not verify it.

⭐ **So the very first thing to do, before posting a single link, is open one game in Pi Browser
on an iPhone, earn something, close the app, and reopen it.** Ten minutes. If progress
survives, the whole plan works. If it does not, you are sending people to a game that wipes
them, and that is worse than not posting at all.

## Do you have to strip the Stripe surfaces? No, but it is a one way door

**The Mainnet Listing Requirements bind listing eligibility only, by their own text.** An
unlisted app is not breaking a rule by showing a dollar price. So strictly, no.

**Three reasons to gate them anyway, and they are not legal reasons:**

1. **It forecloses the listing you say you might want later** if Pi ever "actually listens".
   The compliance work is cheap now and expensive to retrofit after people have seen it.
2. **It reads badly to the audience you are courting.** A `$3` price and a "pay with crypto"
   button inside Pi Browser is exactly the thing the Pi community complains about.
3. **It is about four lines of code.** §5 has them. `?pi=1` declares the rail, the web only
   surfaces default to hidden.

**My recommendation: ship the free build with the `?pi=1` lane in place and no payments at
all.** Post it. See whether anyone plays. The tip jar is a second decision you can make with
evidence, after a Core Team review you have not started, on revenue whose withdrawal path
nobody has published (§6.5).

## The honest read on "if they're talking about it, maybe Pi will listen"

⚠️ This is the part of the plan I have the least evidence for, so treat it as a hope rather
than a mechanism.

**What supports it:** Pi's listing criteria are explicitly about "app quality, completeness of
app functionalities, evaluation of utility", so demonstrated usage is at least the right kind
of argument. And Ecosystem Directory Staking proves the ecosystem can move real volume, one
game reached "over 1.2 million game plays in under one week" off 3.19 million staked Pi.

**What does not:** there is no documented path from community buzz to a listing decision. No
appeal process, no status page, no published criteria weighting. The May 2025 headline listing
event **added five apps**. And a listing application still has to pass the Pi auth requirement,
which none of your games currently meet.

**So the realistic version of your plan is: get played, build something real, and have the
usage numbers ready if a door opens.** That is worth doing. Just do not build a schedule on the
door opening.

## The revised runbook for this plan

- [ ] **P0. Open a game in Pi Browser on an iPhone and check the save survives.** Everything
      else waits on this. Ten minutes.
- [ ] **P1. Add the `?pi=1` rail to Jimothy** (§5). No payments, just hide the fiat surfaces and
      the portal exit. Four lines.
- [ ] **P2. Post the links.** ⛔ Read `PUB-PI-JIMOTHY.md` §9 first: r/PiNetwork **Rule 2 bans
      sending people offsite for links**, and Rule 6 names AI written posts as removable. The
      posts there are already rewritten to obey both.
- [ ] **P3. Watch what happens for a month.** No further work.
- [ ] **P4. Only if people actually play:** file the support ticket (§9 Post 1). Its two live
      questions are the **multisig signer set** and whether **invitation gating** for Mainnet
      wallet slots still applies. ✅ The domain verification question came off it: the constraint
      binds the URL, not the domain, so Jimothy can have its own entry. Then decide about the
      tip jar with real numbers in hand, and note that **the tip UI is already built** (§4.3).

---

# THE VERDICT ON LISTING, WHICH IS NOW BACKGROUND

⚠️ **Read this as context for the decision above, not as the plan.** The plan is now "skip the
listing, just get played". This section is why that was the right call, and it is also what you
would have to fix if you ever change your mind.

⭐ **Blocker 3 is the exception and it is still live and still urgent.** It is a bug on the
Lucid Winds Pi rail today, it has nothing to do with listing, and it should be fixed whether or
not any of this ever ships.

**Jumping Jimothy could not be listed on Pi in its current form.** Not "would be hard".
Could not. There are four blockers and every one of them is on our side of the line, which is
the good news: none of them are Pi refusing us something.

| # | Blocker | Evidence |
|---|---|---|
| **1** | The unlock is bound to a **Firebase email and password account**. Pi's Mainnet listing requirements say apps "must integrate Pi's Authentication SDK for user logins" and that "**Other login methods, such as email or third-party accounts, are prohibited**", and separately that "unnecessary collection of personal information, like emails or phone numbers, is prohibited **unless required for the app's functionality**" (the carve-out matters, and an email login is not required for a game to function). | `satellites/stream-hop/index.html:5532` (`SUP.auth`) and `:5557` (the `sup-auth` panel gates the buy behind sign in) vs [Mainnet Listing Requirements](https://pi-apps.github.io/community-developer-guide/docs/gettingStarted/mainnetListingRequirements/), accessed 2026-08-27 |
| **2** | The game shows a **fiat price and a card checkout**. The Supporter Pack button literally renders `Or pay with crypto · $3` next to a Stripe card button. Pi: "All transactions must be conducted in Pi, with **no support for non-Pi Tokens or fiat currencies**." | `satellites/stream-hop/index.html:5561-5562`, `STRIPE_ON`, `stripeCreateCheckout` calls at 5508 and 5521 |
| **3** | **The Pi payment rail does not check the price.** `Pi.createPayment({amount: amount, ...})` takes the amount from the client, and neither `piApprove` nor `piComplete` ever compares it to an expected price. This is a live hole, see §4.3. | `index.html:77562`, `functions/piApprove.js`, `functions/piComplete.js` |
| **4** | **Jimothy has no Pi code at all.** `grep -rl "sdk.minepi.com\|Pi.createPayment\|Pi.authenticate" satellites/` returns nothing. Every line of the Pi integration lives in the Lucid Winds root `index.html`. | measured 2026-08-27 |

Blockers 1, 2 and 4 are a build job, not a wall. Blocker 3 is a bug that is live on the
Lucid Winds Pi rail right now and should be fixed this week whether or not Jimothy ever
ships to Pi.

**And one number that should shape the whole decision.** PI is **$0.093** as of
2026-08-27 15:44 UTC ([CoinGecko API](https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd), fetched directly). So the ~10 Pi unlock you described is worth
**about 93 cents**. Steam is $2.99. The web Supporter Pack is $3. To match $3 the Pi price
would have to be roughly **32 Pi**. That is not an argument against doing it, it is an
argument for deciding the number on purpose rather than by round figure.

**And one more thing before you spend a day on this.** ⛔ **Nobody has published how a
developer actually withdraws Pi revenue.** The Incoming Multisig wallet's signer set does not
appear in any of the seven Pi documents I read, whether inbound Pi is locked is undocumented,
and Pi's two live official docs contradict each other on whether paying users out works on
Mainnet at all. §6.5 has the detail and the one paragraph to send to Pi Support. Until that
comes back in writing, **treat Pi as a distribution experiment, not a revenue line.**

**The audience number in CLAUDE.md is wrong and should be corrected.** Pi's own year end
post says "over 17.5 million Pioneers have fully passed KYC and 15.8 million Pioneers have
migrated to the Mainnet" ([A Look Back at 2025](https://minepi.com/blog/pi-2025-year-end/),
2025-12-31). A Pioneer who has not migrated has no Mainnet Pi to spend. The spendable
audience is about **16 million**, not 47 million.

---

# TASK 1: JIMOTHY ON PI NETWORK

## 1. Listed versus merely loading, because they are not the same thing

This is the single most useful distinction in the whole document and it changes the plan.

**The SDK works on registration, not on listing.** Pi's own platform docs: "In order to
enable the SDK to function correctly, you need to declare your apps on the Developer
Portal" ([pi-platform-docs README](https://raw.githubusercontent.com/pi-apps/pi-platform-docs/master/README.md),
repo last pushed 2026-06-28). Nothing in the SDK reference, the payments doc or the Pi
Sign-in doc conditions any call on ecosystem listing. The portal's own checklist asks you
to "process a User-to-App Pi transaction" as **step 11**, before the listing application at
step 12. Real Pi changes hands before anyone reviews you.

**Users can reach an unlisted https URL.** Pi Browser has an address bar, and Pi's own
browser design post describes chrome that distinguishes a "Core Team app, ecosystem listed
app, verified, unverified, or unaffiliated Pi app or a random website"
([Elevating The Pi Browser Design](https://minepi.com/blog/pi-browser-update/), 2024-02-22).
The existence of an "unaffiliated" state is proof that unlisted pages load.

**So what does listing actually buy?** Four concrete things:

1. **The `*.pinet.com` URL.** "To be eligible to register for a PiNet URL the application
   must be listed in the Ecosystem App" ([PiNet, Pi Developer Guide](https://pi-apps.github.io/community-developer-guide/docs/importantTopics/piNet/)).
   ⚠️ **And PiNet is less than it sounds.** The same document says users outside Pi Browser
   "can browse and view content without authentication, but once the app calls
   `Pi.authenticate`, they're blocked and must access it through the Pi Browser to continue."
   Combined with the rule that Pi Auth must be the only login, a listed app has **no logged in
   audience outside Pi Browser at all**. PiNet is a shop window, not a second storefront.
2. **The `.pi` domain**, which requires full PiNet integration plus listing compliance
   ([.pi Domain Reservation](https://minepi.com/blog/pi-domain-reservation/), 2025-03-21).
3. **Ad monetization.** "Displaying ads is open to all applications in the Pi ecosystem,
   but only applications approved by Pi Core Team can be monetized"
   ([ads.md](https://raw.githubusercontent.com/pi-apps/pi-platform-docs/master/ads.md)).
4. **Directory placement**, and with it the staking discovery mechanic in §7.

**What this means for you.** You can build the Pi build, register it, take real Pi
payments from Pioneers who have the link, and never wait on a reviewer. Listing is the
distribution upgrade, not the on switch. That reframes the May 2026 silence from a
blocker into a delay.

## 2. The Developer Portal flow as it stands in 2026

Entry is still `develop.pi` typed into the Pi Browser address bar. What has changed since
the old writeups is that there are now **three separate publish surfaces**, and only one
of them is ours.

| Track | What it is | Ours? |
|---|---|---|
| **Developer Portal** (`develop.pi`) | Hand built self hosted web apps plus the Pi SDK | ✅ yes |
| **Pi App Studio** | AI no code app builder, launched 2025-06-28, priced per creation since 2026-08-24 | no. A 400 KB hand built game does not go through a prompt |
| **SoloHost** (beta, announced Pi2Day 2026-06-28) | Self hosted local apps on **Pi Desktop**. "an open, permissionless publisher flow", no pre approval | no. Desktop, not Pi Browser |

The App Checklist unlocks sequentially. The confirmed steps:

1. Verify your email in the Mining App profile (one time prerequisite before your first app)
2. **Register App**: name, description, network. ⛔ **"An app can only connect to one
   network at a time, and once you register the app, this option cannot be changed."**
   ([developer_portal.md](https://github.com/pi-apps/pi-platform-docs/blob/master/developer_portal.md)).
   Pi's own advice is to register two apps, one Testnet and one Mainnet. App name should be
   letters, numbers and spaces only, because the name determines the URL.
3. **Configure Hosting**: self hosted (you supply a URL) or Core Team hosting via GitLab
4. **App Wallet**: connect a wallet from wallet.pi. A Mainnet wallet requires KYC
5. Read documentation
6. **Development URL**, which enables sandbox
7. **Run in Sandbox**: `Pi.init({version:"2.0", sandbox:true})` against `sandbox.minepi.com`
8. **Production URL**, HTTPS required
9. **App Domain / Verify Domain**: "place the provided validation key in a file named
   `validation-key.txt` at `https://yourapp.com/validation-key.txt`, then click Verify
   Domain" ([pi-sign-in.md](https://github.com/pi-apps/pi-platform-docs/blob/master/pi-sign-in.md))
10. **Add a PiNet subdomain**
11. **Process a User-to-App Pi transaction**
12. **Apply for Mainnet Ecosystem Listing**

⛔ **One extra gate the old notes miss.** Mainnet U2A needs a Core Team approved wallet:
"apply for an Incoming Multisig Wallet for the U2A payment flow. **The review process can
take time**, but once the application is approved by the Pi Core Team, you can connect the
approved wallet to your app" ([Launching on Pi Mainnet](https://pi-apps.github.io/pi-sdk-docs/Launch)).
So there are **two** reviews on the money path, not one, and this one is on the critical
path to taking a single Pi.

⚠️ **What I could not find, and you will have to screenshot.** No public source specifies
the listing form's **icon pixel sizes, screenshot count, description character limit, or
the category taxonomy**. I read every file in `pi-apps/pi-platform-docs`, the community
developer guide, `pi-sdk-docs`, `minepi.com/developers` and the developer terms. Those
specs appear to live only inside the portal UI, which only opens inside Pi Browser on a
phone. When you open `develop.pi`, screenshot the listing form and I will write the copy to
its real limits.

⚠️ **Provenance warning, stated plainly.** The seven Mainnet Listing Requirements that
this entire document leans on are published on `pi-apps.github.io`, which is Pi Network's
official GitHub organisation but is self described as a **community** developer guide. The
binding legal document, the [Developer Terms of Use](https://socialchain.app/developer_terms),
was last updated **9 January 2023** and contains none of these rules. So they are
authoritative in practice and are what reviewers apply, but they are not contract text.
Do not build anything expensive on the assumption that they cannot change without notice.

## 3. Review times, and what to do about the May 2026 silence

**There is no published SLA.** I searched for one. Pi publishes "submission does not
guarantee acceptance" and, for the Ad Network, "Applying does not guarantee your app will
be included". No turnaround commitment, no queue position, no status taxonomy.

**There is no published appeal path either.** The Developer Terms grant unilateral power:
"We reserve the right to review any Developer Applications and in Our sole discretion and,
without notice to you, remove any content submitted or posted by you."

⚠️ **A half true claim you will meet, and the precise version, because I got this wrong on
the first pass.** An outlet called hokanews published "Pi Network Overhauls Ecosystem Access:
Developers Can Now List Apps Without Pre-Approval" in April 2025 with quotes attributed to an
unnamed "Pi Network spokesperson". The quotes are junk and the headline is misleading. **But
the underlying mechanism is real and Pi published it themselves:**

> "Previously, apps had to be granted eligibility before they could apply to be listed in the
> Pi Ecosystem Interface in the Pi Browser. Now, this **pre-approval step has been removed**"
> and "eligible developers are no longer required to wait for approval **to apply**".
> — [Pi Day 2025](https://minepi.com/blog/pi-day-2025/), 2025-03-14

**Read that precisely: the whitelist to apply was removed. The approval to be listed was
not.** Anyone can apply now; the curation still happens after. My first draft of this document
said "there is no primary source for this", which is checkable and false. It is corrected here
rather than quietly.

⚠️ **And here is the throughput number, which is more useful than any wait time.** The
May 2025 announcement that added apps to the Mainnet Ecosystem Interface **added five**: a
snake game, some e-commerce apps and a couple of Pi token info apps
([ecosystem-and-product-updates](https://minepi.com/blog/ecosystem-and-product-updates/)).
Five apps, in a headline listing event, from an ecosystem with tens of thousands of
developers. **A May 2026 submission still silent in August 2026 is not anomalous. It is the
documented shape of the system.** Do not plan a launch around a listing date.

**The one real channel, and it is live.** Pi runs a Jira service desk with a dedicated
developer queue. Both of these returned HTTP 200 on 2026-08-27:

- Developers / Pi Apps Platform: `https://support.help.minepi.com/servicedesk/customer/portal/1/group/3/create/20`
- General: `https://support.help.minepi.com/servicedesk/customer/portal/1/create/1`

**Resubmit or new app?** ✅ **This one turned out to be answered, on a page this document
already cites.** I said four times that it was undocumented. It is not. The Getting Started
Checklist, under Launching on Pi Mainnet, Verify App URL:

> "**URL cannot match the URL that is verified of another Developer Portal Project**"
> "If adjusting the URL of another Developer Portal Project then you must verify a new URL on
> the other project prior to being able to reuse that URL on another project."
> — [Getting Started Checklist](https://pi-apps.github.io/community-developer-guide/docs/gettingStarted/gettingStartedChecklist/), re-read 2026-08-27

⭐ **The constraint binds the URL, not the domain.** `https://lucidwinds.com/` and
`https://lucidwinds.com/satellites/stream-hop/` are different URLs, so **Jimothy can have its
own app entry on the same domain without touching the Lucid Winds one.** That unblocks the
runbook and removes the headline question from the support ticket. I also could not confirm that a Developer Portal app entry can be **deleted**
at all; delete was announced for Pi App Studio creations, which is a different system.

**So the order is:**

1. File a ticket on the developer queue naming the app, the network, the submission date
   and the portal app ID. Zero risk, verified live channel.
2. While you wait, close the killers in §5. If the app is sitting in a queue with a
   prohibited login flow, the wait ends in a rejection anyway.
3. Do **not** create a second Mainnet entry on `lucidwinds.com` until support tells you
   whether the first can be withdrawn and the domain freed.
4. **Register Jimothy as its own app entry on its own URL.** This sidesteps the whole
   question. It is a different game on a different path (`/satellites/stream-hop/`), which
   means its own `validation-key.txt` question does not collide with Lucid Winds' at the
   root. ⚠️ Verify that with support too, because domain verification is documented at the
   **domain root**, not per path, and if verification is per domain rather than per app
   then two entries on `lucidwinds.com` may conflict regardless.

**And the honest structural point.** Lucid Winds is the wrong first Pi listing and always
was. It forces email signup at onboarding, which is the prohibited pattern, and CLAUDE.md
records that skip does not bypass it. Jimothy is a smaller, self contained game with a
single cosmetic unlock. It is a far better shape for a first listing, and that is the real
reason to put it first rather than fighting for the flagship's queue position.

---

## 4. The demo plus unlock model, and what the server actually needs

### 4.1 Is a paid unlock even allowed on Pi? Yes, though my first citation was misscoped.

⚠️ **The quote everyone reaches for here is about Pi App Studio, not the SDK**, and this
document elsewhere argues that App Studio documents do not bind SDK apps. So I am demoting it:

> "Persistent payment interactions allow **purchases or unlocks** to remain active beyond a
> single session... a user could **purchase access to a premium feature, unlock additional
> capabilities, or obtain a lasting upgrade**."
> — [Happy Pi Day 2026](https://minepi.com/blog/pi-day-2026/), under the heading "**Pi App
> Studio Apps Enabled on Mainnet**", accessed 2026-08-27

**The citation that actually carries the point is the games one**, which is first party and not
App Studio scoped:

And for games specifically: "Incorporate Pi payments for progression boosts or in-game
upgrades" ([Gaming and the Pi Network Ecosystem](https://minepi.com/blog/gaming-pi-ecosystem/), 2025-05-30).

No price floor or ceiling is documented anywhere. Pi's own example amount is `3.1415`.

**Tips are the same mechanism.** No Pi document treats a tip differently from a paid
unlock; both are a `Pi.createPayment` with an amount and a memo you choose. The two hard
constraints are that it must be in Pi and it must not route to an external processor,
which is exactly what the current Stripe tip jar does.

**Subscriptions are not available.** Pi launched subscription smart contracts on **Testnet
only** on 2026-04-17 with no Mainnet timeline
([Introducing Subscription Smart Contract Capability on Testnet](https://minepi.com/blog/subscriptions-smart-contract/)).
A recurring charge today means manually re prompting `createPayment` every period. Do not
plan a subscription.

### 4.2 Reusing `piApprove` and `piComplete`: mostly yes, with one hard stop

I read all four files. Here is the honest assessment.

**What reuses cleanly, with zero new server code:**

`piComplete` calls the shared `applyFulfillment(tx, db, uid, metadata)` from
`functions/fulfill.js`, using **Pi's own copy of the metadata**, not the client's claim
(`functions/piComplete.js:170`). And `fulfill.js:226` already has this branch:

```js
} else if (type === 'supporter_pack') {
  // Studio-wide cosmetic supporter flag. Satellite games (Jimothy, Hedgerow,
  // Grubtrap) read vaults/{uid}.sw_supporter and unlock their premium cosmetics
  tx.set(vaultRef, { sw_supporter: true, sw_supporter_at: Date.now() }, { merge: true })
```

So a Pi payment carrying `metadata: {type:'supporter_pack'}` would grant the Jimothy
Supporter Pack **today**, through the same code path the Stripe webhook uses. The rails
were deliberately unified and it shows. That is a genuinely good piece of architecture.

**The hard stop: `piApprove` and `piComplete` both require Firebase Auth.**

```js
if (!request.auth || !request.auth.uid) {
  throw new HttpsError('unauthenticated', 'Sign in required to approve a Pi payment.')
}
```
(`functions/piApprove.js:36`, and the same check in `piComplete`.)

The entire entitlement model is keyed on a **Firebase uid**. On Pi the identity is a
**Pi uid** from `Pi.authenticate`, and Pi prohibits us from asking for the email that
Firebase Auth needs. These are incompatible as written.

**What that costs.** A Pi build needs a second, small identity path: authenticate with Pi,
verify the access token server side with `GET https://api.minepi.com/v2/me` (Pi's docs are
explicit that client side user data "should not be passed to your backend"), and key the
entitlement on the Pi uid. Two practical options:

- **(a) Firebase custom token.** A new function takes the Pi access token, verifies it
  against `/v2/me`, and mints a Firebase custom token for uid `pi:<piUid>`. Every existing
  function then works unchanged, including `applyFulfillment`. This is the smallest change
  and it keeps one fulfillment code path. **Recommended.**
- **(b) A separate `piEntitlements/{piUid}` collection** and a Pi specific fulfillment.
  Simpler to reason about, but it forks the entitlement logic, which is exactly the drift
  the shared `fulfill.js` was written to prevent.

⚠️ **Two caveats on the Pi uid.** Pi's SDK reference says the uid "will change if the user
revokes the permissions they granted to your app". An entitlement keyed on it needs a
recovery story. And Pi Sign-in, the new OAuth flow that would let a normal browser use Pi
as a login provider, **does not yet support the `payments` scope**, only `username` and
`wallet_address` ([pi-sign-in.md](https://github.com/pi-apps/pi-platform-docs/blob/master/pi-sign-in.md)),
so it cannot replace in browser `Pi.authenticate` for a purchase.

### 4.3 ⛔ A live hole in the existing Pi rail, unrelated to Jimothy, fix it anyway

The web rails price on the server. `nowCreateInvoice.js:19` says so in its own header:
"USD price is recomputed from ./fulfill.js LW_WEB_PRICES; **the client cannot set its own
price**." Both it and `stripeCreateCheckout` call `resolveWebPrice(type, ...)`.

**The Pi rail does not.** The client calls:

```js
Pi.createPayment({amount:amount, memo:memo, metadata:metadata}, {...})   // index.html:77562
```

and both the amount and the metadata are chosen by the client. `piApprove` records the
amount and approves. `piComplete` re fetches the payment "to confirm amount/memo/metadata
weren't tampered" (its own comment, `piComplete.js:147`) and then **never compares the
amount to anything**. It passes the metadata to `applyFulfillment` and grants.

**The consequence:** a Pioneer who can open a console can create a payment for 0.001 Pi
with `metadata:{type:'full_bloom'}` and receive the bundle. Every Pi priced product in
Lucid Winds is affected. It has presumably never been exploited because the Pi rail has
had no real users, but it must be closed before it does.

**And it is worse for one product.** `fulfill.js:67` prices nine products in
`LW_WEB_PRICES`, and its own comment says: "Hut early-opens are deliberately NOT web-sellable
(Pi-only flavor) **absent from LW_WEB_PRICES**, so they throw here. Intended." So the one
product that is Pi exclusive has no server side price anywhere in the codebase, on any rail.

⛔⛔ **CORRECTION, 27 August. My first patch for this was wrong twice and would have broken a
live feature.** An audit caught both. Recording them rather than quietly swapping the code,
because the second one means the patch did not even close the hole it was written to close.

**Mistake 1: it would have rejected every Pi tip.** Lucid Winds already ships a **live Pi tip
jar** (`index.html:89749`, `window._lwOpenPiTipModal`, button at `:89572`), and it sends:

```js
createPayment(v, 'Tip the Studio · ' + v + ' π', { type: 'tip', amount: v },   // index.html:89795
```

`tip` was not in my table, and my patch threw `invalid-argument` on anything not in the table.
Today it works because `fulfill.js:288` handles unknown types gracefully. **Tips are also
variable by design** (`min="0.1"`, presets 1, 5, 10, 25), so a single expected price cannot
work for them. They need an allow with a floor, not a table row.

**Mistake 2: I priced three products at 1 π that actually cost up to 20 π.** Read out of the
client today:

| Product | Real Pi price | My patch |
|---|---|---|
| `nursery_slot` | **5 / 10 / 20 π** by slot (`index.html:77781`) | 1 |
| `nursery_clipping_slot` | **3 / 5 / 8 π** by slot (`index.html:77758`) | 1 |
| `seed_pouch_slot` | **10 / 20 π** by tier (`index.html:77735`) | 1 |

So with my first patch merged, a 20 π nursery slot would have approved at 1 π. The tiered
products are exactly the ones that need server side derivation, the way `resolveWebPrice`
already does it at `functions/fulfill.js:105`.

**The corrected shape.** Flat products get a floor, tiered products get a per slot map keyed
off server derived state, and tips get an explicit minimum:

```js
// functions/fulfill.js, next to LW_WEB_PRICES. Amounts in Pi, decided by Stephen.
export const PI_PRICES = {
  slot:                  { flat: 1 },
  item_pouch_slot:       { flat: 1 },
  emergency_pouch:       { flat: 10 },
  supporter_pack:        { flat: 30 },
  half_bloom:            { flat: 50 },
  full_bloom:            { flat: 100 },
  early_open_hut:        { flat: 5 },
  hut_early_open:        { flat: 5 },
  nursery_slot:          { perSlot: { 4: 5,  5: 10, 6: 20 } },
  nursery_clipping_slot: { perSlot: { 3: 3,  4: 5,  5: 8  } },
  seed_pouch_slot:       { tiers:   { seed15: 10, seed20: 20 } },
  tip:                   { min: 0.1 },   // ⛔ variable by design. Floor only, never a price
}
```

```js
// functions/piApprove.js
import { PI_PRICES } from './fulfill.js'

// after the piGet at line 54, BEFORE the Firestore write at line 64:
var md   = piPayment.metadata || {}
var spec = PI_PRICES[md.type]
if (!spec) {
  throw new HttpsError('invalid-argument', 'Unknown product: ' + md.type)
}
var paid = Number(piPayment.amount)
var expected =
  spec.flat    != null ? spec.flat :
  spec.min     != null ? spec.min  :
  spec.perSlot != null ? spec.perSlot[md.slot] :
  spec.tiers   != null ? spec.tiers[md.tier]   : null

if (expected == null) {
  throw new HttpsError('invalid-argument', 'Unpriced variant for ' + md.type)
}
if (paid + 1e-9 < expected) {
  logger.warn('[piApprove] underpay uid=%s type=%s paid=%s want=%s', uid, md.type, paid, expected)
  throw new HttpsError('failed-precondition', 'Payment amount is below the product price.')
}
```

The `1e-9` is float slop, because Pi amounts are decimals and Pi's own docs use `3.1415` as
their example amount.

⚠️ **Two things to settle before this ships.** The client currently sends `metadata.amount` but
I have not confirmed it sends `metadata.slot` or `metadata.tier`; if it does not, add them, and
**derive the expected slot from the vault server side rather than trusting the client's claim**,
exactly as `resolveWebPrice` does. And every `PI_PRICES` number above is a placeholder except
the three tiered maps, which are read from the live client. **Stephen sets the rest.**

⭐ **And a finding that changes the earlier advice in this document: there is already a Pi tip
jar built.** It is client side only and still needs the Incoming Multisig approval to move real
Pi, but the UI, the modal, the presets and the payment call all exist. The tip jar is less work
than the top of this document assumed.

Refusing to approve is better than refusing to complete, because an unapproved payment
never moves any Pi and the player is never charged for something they will not receive.

### 4.4 Demo plus unlock, honestly assessed as a design

You described a free demo with the full game unlocked for around 10 Pi. Three things worth
saying before it gets built.

1. **Jimothy has never had a gameplay paywall, on purpose.** The code comment on the
   Supporter Pack reads "Never gameplay power, only cosmetics." Locking chapters behind Pi
   is a different product from the one on Steam and itch, and it is the sort of thing a
   Steam reviewer or an itch commenter will notice and compare. It is your call, but it
   should be a decision, not a side effect of picking a Pi model.
2. **A hard paywall is a listing risk.** Pi judges "app quality, completeness of app
   functionalities, evaluation of utility". A reviewer who opens the app and hits a wall in
   ten levels cannot evaluate the rest of it. This is my inference and not a stated rule,
   but it is the sort of inference that costs a review round. Pi's own suggestion for games
   points the same way: "Games could allow a user to complete a tutorial, to see the game,
   prior to requiring the user to authenticate"
   ([PiNet](https://pi-apps.github.io/pi-sdk-docs/pitopics/PiNet)).
3. **The cleanest first version is the one that already exists.** Ship the Pi build with
   the whole game free, and sell the **Supporter Pack for Pi**: the 14 costumes and every
   song. It is already built, already server fulfilled, already cosmetic only, already
   consistent with Steam and itch, and it needs no new gating anywhere. If it sells, add a
   chapter unlock later with evidence. If it does not sell, you learned that for the cost
   of a build flag instead of a redesign.

**My recommendation: Supporter Pack for Pi at a deliberate price, not a full game unlock.**
If you want the full game unlock anyway, say so and I will spec the chapter gate.

**On the price.** At $0.093 per Pi: 10 Pi is 93 cents, 20 Pi is $1.86, **32 Pi is $2.98**,
which is the only number that matches what the same pack costs everywhere else. Pi prices
are conventionally round, so 30 Pi ($2.79) reads better than 32 and is close enough.

⚠️ **Do not print a dollar figure anywhere in the Pi build.** Charging in fiat is
explicitly prohibited. Merely *displaying* a fiat reference price is not addressed by any
rule I could find, so this is caution rather than a citation, but Pi's App Studio
guidelines do prohibit "Material discussions, representations or misrepresentations
regarding the value or valuation of Pi", and "30 π, about $2.79" lands close enough to that
line to be not worth the argument. **Price in π only.**

---

## 5. The `?pi=1` lane: exactly what must show and hide

The `project_pi_compliance_leak_aug01` rule stands and this is its second application. The
principle from that fix is the important part: **do not sniff the rail, declare it.** The
Pi listing URL carries `?pi=1`, that sets `localStorage.lw_rail_pi`, and every money gate
asks "am I provably on the web rail" rather than "am I not on Pi". A false negative on a
sniff costs the listing; a false negative on a declaration is impossible.

Jimothy already has the mechanism for this in a different shape. `STORE_BUILD` is
`ITCH_BUILD || STEAM_BUILD` and it hides every payment surface, because itch and Steam own
that rail. **Pi is not the same case.** Pi wants payment; it just wants Pi payment only. So
Pi needs its own flag, not a reuse of `STORE_BUILD`.

### 5.1 What must be HIDDEN on the Pi rail

| Surface | Where | Why |
|---|---|---|
| The `sup-card` card checkout button | `stream-hop/index.html:5561` | fiat transaction |
| `Or pay with crypto · $3` on `sup-buy` | `:5562` | fiat price string **and** a non Pi crypto rail |
| `sup-donate` and `sup-donate2` | `:879`, `:893`, toggled at `:5563-5564` | Stripe donations |
| The `sup-auth` email and password panel | `:872`, `:5557` | prohibited login method, prohibited email collection |
| The `b-acct` Sign in chip | `:665`, wired at `:5054` | same |
| The portal exit, `SWS_EXIT` on `b-exit` | `:5075` | "not simply acting as funnels to external platforms" |
| Any `$` character in a price context | grep the build | fiat pricing |

### 5.2 What must be SHOWN on the Pi rail

| Surface | Behaviour |
|---|---|
| A single **Unlock with Pi** button | calls `Pi.authenticate(['username','payments'])` then `Pi.createPayment` |
| The price, **in π only** | e.g. `30 π` |
| The Supporter Pack description | unchanged, it is already accurate and already cosmetic only |

### 5.3 The gate to write

Copy the shape from the Lucid Winds fix, which inverted every gate from "not Pi" to
**proven web**:

```js
/* Declare the rail. ?pi=1 is sticky, ?pi=0 clears it. UA and Pi host stay as
   secondary catches only. Never let a sniff be the only signal. */
var PI_RAIL = (function(){
  try {
    var qs = location.search;
    if (/[?&]pi=1\b/.test(qs)) localStorage.setItem('sw_rail_pi','1');
    if (/[?&]pi=0\b/.test(qs)) localStorage.removeItem('sw_rail_pi');
    return localStorage.getItem('sw_rail_pi') === '1';
  } catch(e) { return false; }
})();
var WEB_RAIL = !PI_RAIL && !STORE_BUILD;      /* proven web, not "not pi" */
var STRIPE_ON = WEB_RAIL;                      /* was: !STORE_BUILD */
```

and add `pi-rail` / `web-rail` to `document.body` so the CSS can hide the web only
surfaces **by default** and reveal them only on `body.web-rail`. Default hidden is the
whole point: if the JavaScript fails, the compliant state is the one that survives.

⛔ **Do not overload an existing class for this.** The August 1 incident happened because
`body.pi-browser` was doing two jobs and the "belt and suspenders" CSS keyed off the same
single signal, so there was no second signal at all.

### 5.4 The verification, before submitting anything

Run both rails in a real browser and read the screen, not the code:

```
https://lucidwinds.com/satellites/stream-hop/?pi=1   → no $ anywhere, no card button,
                                                       no sign in panel, no portal exit
https://lucidwinds.com/satellites/stream-hop/?pi=0   → $3 card checkout present, tips
                                                       present, revenue untouched
```

⚠️ **Do not test this with `grep -c '$'` on the source.** `$` is the file's own DOM helper and
appears 262 times in `satellites/stream-hop/index.html`, so that check fails permanently and
tells you nothing. Test the **visible text**:

```js
// in the console, on the ?pi=1 rail
document.body.innerText.match(/\$\s?\d/g)   // must be null
```

---

## 6. Is a plain hosted PWA URL enough?

**For running and taking payments: yes, with three caveats that are not small.**

The app is a normal https URL you host. Pi Browser loads it. The SDK works once the app is
registered and the domain is verified. Nothing about that requires a special build, a
native wrapper, or an app store.

**Caveat 1, and it is the one that could break a game: Pi apps run in an iFrame, and iOS
storage is hostile.** Pi's own developer guide:

> "The Pi Browser utilizes iFrames to display App within the browser... all apps displayed
> within Pi Browser will be considered Third Party Applications by the device. iOS natively
> disables cookies from all Third Party Applications by default... **Developers should
> expect that most Pioneers will have the cookies disabled.** The Core Team is actively
> working on an alternative method for developers to have sessions."
> — [Pi Browser Introduction](https://pi-apps.github.io/community-developer-guide/docs/gettingStarted/piBrowserIntroduction/), accessed 2026-08-27

Jimothy stores everything on the device: bottlecaps, costumes, streaks, the `sw_supporter`
flag. ⚠️ The doc says "cookies"; whether WebKit's storage partitioning also evicts
`localStorage` inside Pi's iframe is **not documented and I could not verify it**. This has
to be tested on a real iPhone before you promise anyone their collection is safe. It is the
single biggest technical unknown in this plan.

**Caveat 2: I could not verify a single PWA capability from a Pi source.** I grepped all
eleven platform docs for service worker, PWA, manifest, orientation, fullscreen and
localStorage and got zero hits. Service workers, add to home screen, orientation lock and
fullscreen are all **UNVERIFIED** in Pi Browser. Add to home screen is structurally
unlikely inside an iframe. Device test, do not assume.

**Caveat 3: Pi Browser is self described as beta.** "As a general-purpose browser tool,
however, it is still primitive... the browser is currently in its beta version."

---

## 6.5 ⛔ Can you actually get the Pi out? The honest answer is that nobody has published it

This is the single biggest unknown in the whole plan and it deserves its own section, because
an adversarial re read of my own research downgraded it from "fine" to "undocumented".

**Every gate before the money is confirmed and quotable:**

| Gate | Source |
|---|---|
| Developer KYC required | "Pi KYC is required" for a Mainnet wallet, [Getting Started Checklist](https://pi-apps.github.io/community-developer-guide/docs/gettingStarted/gettingStartedChecklist/) |
| A migrated Mainnet wallet required | "To process payments successfully on Pi Mainnet a wallet that has received a migration is required", same page |
| Core Team approved Incoming Multisig Wallet | "apply for an Incoming Multisig Wallet for the U2A payment flow... The review process can take time", [Launch](https://pi-apps.github.io/pi-sdk-docs/Launch) |

**And then it stops.** Four things I could not establish, having read the developer portal
docs, the pi-sdk-docs Developer Portal page, the Launch page, `payments.md`,
`payments_advanced.md`, the Developer Terms of Use and the main Terms of Service:

1. ⚠️ **The signer set of the Incoming Multisig wallet is unpublished.** "Multisig" by
   construction implies a co signer. Whether the Pi Core Team holds a signing key over your
   app's revenue, and under what conditions it will sign, appears in none of those seven
   documents. Pi does assert developer responsibility, "as the developers of your apps **you
   are the only party responsible for managing your app's wallets and assets**", but that is
   a liability statement, not a custody statement.
2. ⚠️ **Whether Pi received by inbound transfer is locked or free is undocumented.** The
   whitepaper covers lockup only at the moment of migration and never addresses inbound
   transfers or developers receiving Pi at all. My earlier assumption that it lands as
   ordinary spendable on chain balance is a reasonable inference from Stellar mechanics and
   **not a sourced fact.**
3. ⚠️ **A2U, paying users out, is documented two contradictory ways in two live official
   docs.** The Launch page says "currently available only for testnet apps and **selected
   mainnet apps**"; `payments_advanced.md`, still live today, says flatly "the A2U payments
   feature is currently available only on the **Testnet**". **Treat A2U as testnet only until
   proven otherwise.**
4. ⚠️ **Revenue defaults to a personal wallet until an app wallet exists.** "Until developer
   or app wallets are created the wallet address of the developer who creates the new project
   page will be used to process all transactions."

**And one adverse thing in the binding contract.** Pi's Terms of Service says the mobile
balance "has no cash value, is not transferrable within Pi Network, **is not your property**",
and describes forfeiture for terms violations or KYC failure. That clause governs *mined
mobile* balance, not app revenue. But it establishes that Pi's contract language contemplates
unilateral balance forfeiture, and **there is no offsetting clause anywhere in the Developer
Terms protecting developer revenue.** Those Developer Terms were last updated 9 January 2023.

**What to do about it, and it is cheap.** Put the custody question in the same support ticket
as §3, in these words: *"For the Incoming Multisig Wallet used for U2A payments, who holds the
signing keys, and under what conditions will the Core Team sign a withdrawal? Is Pi received
by an app through U2A subject to any lockup?"* One paragraph, and it is the difference between
a revenue line and a hope.

⛔ **Until that is answered, do not size any decision on Pi revenue.** Ship the free build,
prove the audience exists, and let the money question be answered by Pi in writing before you
build an economy on top of it.

---

## 7. The listing copy, paste ready

Derived from `store/jimothy-steam/STORE_PAGE_FILL.md`, then stripped of everything Pi
forbids: no dollar figures, no external storefront, no Frogger or Crossy Road, no "hand
built" claim about the art. The AI disclosure is kept, because it is true and because
hiding it is how a studio gets caught.

⚠️ Field lengths are guesses. I could not find Pi's published character limits for any
listing field (see §2). Screenshot the form and I will cut to the real numbers.

### App name
```
Jumping Jimothy
```
Letters and a space only, which satisfies "we advise using only letters, numbers, and spaces,
and no special characters". ⚠️ The "must not start with pi" rule is about the **URL or domain**,
not the app name: "Your app's URL/domain must not start with 'pi' or misuse Pi branding."
`lucidwinds.com` is fine either way.

### Short description
```
Hop Seattle's roundest raccoon across rainy traffic, floating dumpster lids and diving gulls. One hundred fixed levels, five ways to play, forty five critters and costumes to unlock, and a new Daily course every day.
```

### Long description
```
Jimothy is a very round raccoon with a very long way to go.

Seattle is wet, the traffic does not care, and the greatest dumpster feast in town is a hundred levels away. Hop him across the streets, ride a dumpster lid down the canal, grab every bottlecap you can reach, and get him there.

Every clean hop forward grows your Feast Trail. Reach a safe curb and it banks for a big score. One bad hop and the trail is gone. That is the whole game, and it is why a two minute run keeps mattering.

FIVE WAYS TO PLAY
Adventure, one hundred levels across ten Seattle chapters. Three stars on every level: finish it, hit its feast goal, clear out its bottlecaps.
Daily, one course a day, the same road for every player in the world, and your first run of the day is the one that counts.
Endless, no finish line, the deep end keeps deepening.
Rush, sixty seconds, nothing chases you, the clock is the pressure.
Zen, no street sweeper, no ramp, no rush.

A HUNDRED LEVELS THAT STAY PUT
Every Adventure level is a fixed course. Level 47 is the same road on your fortieth attempt as your first, so a level you keep failing is a level you can learn. Every fifth level is a twist, every tenth is a set piece, and every twenty fifth lends you somebody else's whiskers.

FORTY FIVE TO PLAY AS
Twelve Seattle critters out of the Prize Bin, bought with bottlecaps you find in the road. Fourteen costumes in the Supporter Pack. Ten you cannot buy at any price, handed to you one every ten levels as you clear the campaign. Seven found out on the street, and nobody will tell you how. One that only a code opens. And Jimothy, who you start with.

THE REST OF IT
Nine power ups on the safe rows. Eight hidden Seattle landmarks to find. Twenty six badges. Weather that turns mid run. Seven original songs, earned as you play.

Free to play, all the way to the feast. The Supporter Pack is cosmetic only: costumes and songs, never an advantage.

About the art: the artwork was pre generated with AI tools, then cut, curated and animated by the developer. Nothing is generated while you play.
```

### Category
⚠️ **UNVERIFIED.** The full PiApps category taxonomy is not published anywhere I could
find. "Games" is confirmed to exist as a Developer Portal registration category. Pick
Games, and if the listing form offers a subcategory, screenshot it.

### The Supporter Pack, in app
```
SUPPORTER PACK          30 π

Fourteen costumes and every song in the game, yours on this account.
Cosmetic only. It never sells you an advantage.

[ Unlock with Pi ]
```
No dollar figure. No card. No sign in panel. One button.

---

## 8. The runbook

Ordered so that nothing waits on anything it does not have to. Each step says who does it
and how you know it is done.

### Phase A, things only you can do, and they gate everything

- [ ] **A1. Confirm developer KYC is COMPLETE, not started.** "Developers must complete KYC
      to verify their identity before submitting an application to list." Nothing on the
      money path works without it. **Done when:** the portal shows KYC verified.
- [ ] **A2. Confirm the Mainnet wallet has received a migration.** "To process payments
      successfully on Pi Mainnet a wallet that has received a migration is required", and
      without one "all transactions will fail". **Done when:** wallet.pi shows a migrated
      Mainnet wallet.
- [ ] **A3. File the support ticket about the May 2026 Lucid Winds submission.**
      `https://support.help.minepi.com/servicedesk/customer/portal/1/group/3/create/20`
      Give the app name, the network, the submission date and the portal app ID. Ask three
      specific questions: what is the current status, can the submission be withdrawn, and
      **can a second app entry verify a different path on a domain the first app already
      verified**. That last one decides whether Jimothy needs its own domain.
      **Done when:** a ticket number exists.
- [ ] **A4. Open `develop.pi` and screenshot the Mainnet listing form.** Every field, every
      character counter, the icon and screenshot spec, the category list. This is the only
      way to get those numbers. **Done when:** the screenshots are in the repo.

### Phase B, the build, and it can start before A3 comes back

- [ ] **B1. Close the price hole in `piApprove` (§4.3).** This is not Jimothy specific and
      it is live on Lucid Winds today. **Done when:** a payment created with an amount
      below `PI_PRICES[type]` is rejected at approve, proven by a test.
- [ ] **B2. Add the Pi rail flag to Jimothy (§5.3).** `?pi=1` declares it, web only
      surfaces default to hidden, `WEB_RAIL` replaces every `!STORE_BUILD`.
      **Done when:** `?pi=1` renders no `$`, no card button, no sign in panel, no portal
      exit, and `?pi=0` is byte for byte what ships today.
- [ ] **B3. Wire the Pi SDK into Jimothy.** `<script src="https://sdk.minepi.com/pi-sdk.js">`,
      `Pi.init({version:'2.0', sandbox:true})`, `Pi.authenticate(['username','payments'])`.
      Note Pi's own warning: the browser does not inject `window.Pi` automatically, you
      must load the SDK and settle `Pi.init` before any other call. **Done when:** the
      sandbox reports an authenticated Pioneer.
- [ ] **B4. Add the Pi identity bridge (§4.2 option a).** A function that verifies the Pi
      access token against `GET https://api.minepi.com/v2/me` and mints a Firebase custom
      token for `pi:<piUid>`. **Done when:** `piApprove` succeeds for a Pioneer who has
      never given an email address.
- [ ] **B5. Make approve and complete idempotent under retry.** Pi's docs: on failure the
      SDK "will continue to invoke the function roughly every 10 seconds until the approval
      timer ends". `piComplete` already early returns on `status === 'completed'`;
      `piApprove` writes with merge. Verify both under a forced repeat rather than assuming.
- [ ] **B6. Device test storage on a real iPhone in Pi Browser (§6).** Earn a bottlecap,
      close the app, reopen it. If progress is gone, everything above is moot until it is
      solved. **Done when:** you have watched a saved value survive a full app restart on iOS.
- [ ] **B7. Place `validation-key.txt` at the domain root** with the key the portal gives
      you, and click Verify Domain.

### Phase C, register and prove the money moves

- [ ] **C1. Register the Testnet app entry** (the network cannot be changed later, so this
      is deliberate). Name "Jumping Jimothy".
- [ ] **C2. Register the Mainnet app entry.** Pi's hackathon guidance notes that
      registering a Mainnet app still requires linking a Testnet version.
- [ ] **C3. Apply for the Incoming Multisig Wallet.** ⛔ This is a Core Team review with no
      published SLA and it is on the critical path to a single real Pi. Start it the day the
      Mainnet entry exists, not after the build is finished.
- [ ] **C4. Flip `sandbox:false`, run one real U2A payment** (checklist step 11).
      **Done when:** `piTransactions/<paymentId>` shows `status: 'completed'` and the pack
      is granted.
- [ ] **C5. Add the PiNet subdomain** (checklist step 10, and the Submit button appears
      once you reach it).

### Phase D, list

- [ ] **D1. Apply for Mainnet Ecosystem Listing** with the copy in §7.
- [ ] **D2. The Pi listing URL must carry `?pi=1`.** This is the whole compliance
      mechanism. `https://lucidwinds.com/satellites/stream-hop/?pi=1`
- [ ] **D3. Plan for staking, not just submission.** Post listing rank in the PiApps
      directory is driven by **Ecosystem Directory Staking**: Pioneers stake Pi to boost an
      app. Pi gives no protocol level reward for staking, so the incentive has to come from
      you. Pi's own cited example: a game whose "ranking was organically boosted by 3.19
      million staked Pi, which resulted in strong visibility and over 1.2 million game plays
      in under one week" ([Ecosystem Directory Staking](https://minepi.com/blog/ecosystem-directory-staking/), 2026-06-18).
      That is the proof that a game can reach real volume on Pi, and it is also the proof
      that listing alone is not enough.

### What I am NOT recommending

- ⛔ **Do not list `portal/index.html`.** A hub whose function is linking out to 116
  satellites is the literal prohibited case: "not simply acting as funnels to external
  platforms".
- ⛔ **Do not build a subscription.** Testnet only, no Mainnet timeline.
- ⚠️ **The tip jar needs a price floor before it ships, not a ban.** ✅ Correction: Lucid Winds
  **already has a Pi only tip modal** (`index.html:89749`), whose own header comment says "PI-ONLY
  TIP MODAL (Pi Browser only)". An earlier draft of this document twice said the tip jar was
  Stripe. It is not. What it needs is the `min` branch in `PI_PRICES` (§4.3), because a variable
  amount with no floor is the one product the price check cannot handle with a fixed number.

---

## 9. Five posts for the Pi ecosystem, and an honest note about the venues

**I checked the rules first, as instructed, and the checking is the finding.**

⛔ **CORRECTION, and this one matters because acting on my first draft could have got the
account banned.** I originally wrote that r/PiNetwork's rules could not be read. **They can.**
An adversarial re read found all eight of them in a Wayback capture of the sub's front page
(`web.archive.org/web/20260820195421/https://www.reddit.com/r/PiNetwork/`, 186,826 members).
Here is what they actually say:

> **Rule 2:** "No Referral codes / links / telegrams / discords or recruiting for Pi or
> anything else. **Also no telling people to look at your profile or go offsite for links.**
> You can put your Picode as your user flair."

> **Rule 6:** "Undesirable content that will be removed. Including low effort, fake news,
> conspiracy theories, GCV promotion, sarcastic memes, Pi as a scam, **ai generated essays**,
> non english posts, technical analysis and anything else Mods deem undesirable."

> **Rule 4** (permanent ban list): "Offering to buy, sell or exchange Pi (for others).
> Anything that looks like scamming..."

The sub's installed mod tooling includes an app literally named **"Stop AI"**.

**So my original plan for Post 2 was wrong twice.** Rule 2 bans "go offsite for links", which
is exactly the "link in the first comment" pattern I proposed. And Rule 6 names AI generated
posts as removable, so whatever you post there has to be written by you, in your own words,
which it should be anyway.

**What is still true is the practice.** The sub has a dedicated **"Pi Apps" post flair** and
developers do post apps under it, with tiny engagement (0 to 9 upvotes). Two from the last
five days: a merchant integration question, and a builder's story that ended with a Pi Browser
URL. So the rule as written is stricter than the rule as enforced. ⛔ **That is not a licence
to test it.** Post 2 below is rewritten to work inside Rule 2 as written.
- **r/PiNetworkDevs does not exist.** Nor do `PiNetworkDevelopers`, `PiApps`,
  `PiNetworkApps`, or `PiNetworkOfficial`. The only live Pi adjacent subs are r/PiCoreTeam
  (2.8k), r/PiNetworkGlobal, r/PiNetworkMining and r/PiNetworkTrading (7 members).
- ⚠️ **I could not confirm that Pi runs an official public developer forum or Discord.** The
  developer surface I could verify is `https://minepi.com/developers/` plus the support desk
  in §3.

So: five pieces of copy below, but **only one of them has a venue whose rules I could read**,
and that one is Pi's own support desk. Everything else needs you to read the pinned rules on
the day. I would rather hand you that than five confident drafts for four venues I could not
check.

⛔ **One rule applies to all five and it comes from Pi's own listing requirements:** do not
name a dollar figure anywhere. Price in π. See §5.

---

### Post 1: the support ticket. Not marketing, and the highest value message on this list.

**Venue:** `https://support.help.minepi.com/servicedesk/customer/portal/1/group/3/create/20`
**Rules:** verified live, HTTP 200 on 2026-08-27. It is a ticket queue, not a forum.

```
Subject: Status of a Mainnet Ecosystem Listing submitted May 2026, and a domain
verification question

Hello,

I submitted an app for Mainnet Ecosystem Listing in May 2026 and have not had a
response either way. I am not writing to chase the queue, I know there is no published
timeline and I am not asking you to jump me up it. I have three specific questions I
cannot answer from the documentation.

1. Is there any way for me to see the current status of that submission from the
   Developer Portal? I cannot find a status field on the app dashboard.
2. If I wanted to withdraw that submission and resubmit later with a different app,
   is that possible, and does it free the domain?
3. For the Incoming Multisig Wallet used for U2A payments, who holds the signing keys,
   and under what conditions will the Core Team sign a withdrawal? Is Pi received by an
   app through U2A subject to any lockup? I cannot find this documented anywhere and I
   would rather know before building an economy on top of it.
4. Is the "invitation basis" note on Mainnet wallet application slots still current? The
   page it is on looks like it predates Open Network.

Thank you for your time. I am happy to give the app name and portal ID here if that
helps you look it up.

Stephen
Sky Wolf Studio
```

Question 3 is the one that decides whether Jimothy needs its own domain, and it is not
answerable from any public documentation. I looked.

---

### Post 2: r/PiNetwork, under the "Pi Apps" flair

⛔ **Read the sub's rules in a browser first.** Also read the sitewide Reddit shadowban
warning in `PUB-LISTINGS.md`: a new account whose first posts are links gets filtered
sitewide, and no moderator can undo it.

⛔ **Rewritten to obey Rule 2.** No link in the post, no link in your comment, and no "check
my profile". The app name is enough: a Pioneer who wants it can type it into Pi Browser, and
asking a question rather than announcing a launch is what the sub actually rewards.

**Title:**
```
Pioneers with iPhones: does app progress actually survive closing Pi Browser?
```

**Body:**
```
I am a solo developer building a game for Pi Browser, and I have hit something in the
documentation that I cannot resolve on my own.

Pi's own developer guide says apps run inside an iFrame, that iOS treats them as third
party, and that developers "should expect that most Pioneers will have the cookies
disabled". My game saves everything on the device: what you have collected, how far you
have got, your streak.

So the question I cannot answer from a desk: on your actual phone, when you use a Pi app
that remembers something, does it still remember it a day later? Has anyone lost progress
in a Pi app on iOS specifically?

I would rather find this out from Pioneers now than from a review later. Not linking
anything, just genuinely trying to learn whether this is a real problem or a stale doc.
```

⛔ **No link, in the post or in a comment.** Rule 2 forbids sending people offsite.

⚠️ **And be honest with yourself about what that costs, because I glossed it first time.** An
unregistered app has no `*.pinet.com` address and no name resolution in Pi Browser, so the only
way anyone reaches your game is by typing `lucidwinds.com/satellites/stream-hop/`. Naming the
game in a reply reaches nobody. Typing the URL in a reply is the thing Rule 2 bans.

**So r/PiNetwork has no rule compliant delivery path for a link, and you should treat it as a
listening post rather than a channel.** Post the question because you genuinely want the iPhone
answer, answer anyone who replies, put the game in your **user flair** (Rule 2 explicitly allows
a flair), and let curiosity do the rest. If that feels like too little return for the effort,
that is the correct read, and the effort belongs in the venues in `PUB-LISTINGS.md` instead.

And write every reply yourself: Rule 6 names AI generated posts as removable.

---

### Post 3: Pi Chat, the in app moderated channels

⚠️ **Rules unverifiable from outside.** Pi's chat channels are inside the Pi app and are
moderated per channel with their own pinned rules. **Read the pinned post in whichever
channel before posting, and do not cross post the same text into several.** That is the one
behaviour every moderated community treats as spam.

**Keep it short. Chat is not Reddit.**
```
Fellow Pioneers, I have a game running in Pi Browser and I am looking for testers before
I submit it for listing. It is a raccoon hopper, a hundred courses, free to play all the
way through. What I most need to know is whether your progress survives closing the app,
especially on iPhone.

Happy to answer anything about how it was built. I am one developer, not a team.
```

---

### Post 4: your own accounts

**Venue:** X, Bluesky, the Facebook page, and `links.html`. **Rules:** yours.

⚠️ Which is a problem, because per `PUB-LISTINGS.md` the studio's `SOCIAL` array is almost
entirely empty and the one filled slot is an opaque Facebook share redirect. **This post has
nowhere to go until that is fixed**, and the itch.io slot is empty while the itch page is
live.

```
Jumping Jimothy now runs inside Pi Browser.

It is a hundred fixed courses across ten Seattle chapters, and a very round raccoon who is
trying his best. Free to play all the way to the feast. The Supporter Pack is
thirty π and it is costumes and songs, never an advantage.

Built by one person. If you are a Pioneer, I would love to know what breaks.
```

---

### Post 5: the staking ask, and only after you are listed

**Do not write this one yet.** Post listing rank in the PiApps directory is driven by
**Ecosystem Directory Staking**: Pioneers stake Pi to boost an app. Pi gives no protocol
level reward for staking, so the incentive has to come from you, and Pi's own cited example
is a game whose rank was "organically boosted by 3.19 million staked Pi, which resulted in
strong visibility and over 1.2 million game plays in under one week"
([Ecosystem Directory Staking](https://minepi.com/blog/ecosystem-directory-staking/),
2026-06-18).

⛔ **Two things to decide before you ask anyone for anything.** What a staker gets, which is
your call and must be something you can actually honour forever. And whether offering an
in game reward for staking crosses any line, which Pi does not address in any document I
could find. **Ask the support desk that question in the same ticket as Post 1.**

```
Jimothy is listed. Thank you to everyone who broke it first.

If you want it seen by more Pioneers, the directory ranks on staked Pi, and staking is
reversible. [WHAT A STAKER GETS: decide this and put it here, and make it something you
can honour for as long as the game exists.]

No pressure either way. The game is free and it stays free.
```

---

### ⛔ And one lane I am explicitly not recommending

**Do not post the same text into several Pi channels, subs and Telegram groups on the same
day.** Pi's App Studio guidelines name spamming as an enforcement trigger, with consequences
that run to "permanent removal from Pi App Studio and the Pi ecosystem". A developer whose
app is in a review queue is exactly the wrong person to be testing where that line is.


# TASK 2: FLOCK THE WORLD ON PI, AFTER JIMOTHY

## The short version

**FTW is a much cleaner Pi candidate than Jimothy on every technical axis, and a much
riskier one on content.** And it is blocked on something simpler than either: a stranger
cannot play it today.

## ⛔ The blocker that comes first

`https://lucidwinds.com/satellites/flock-the-world/` currently serves the **workbench
gate**. I loaded it in a real headless Chrome at a phone viewport on 2026-08-27 and
screenshotted it: a panel that says IN DEVELOPMENT, a Tester key box, an Unlock button and
a Back to the arcade link. The cause is `<script src="/dev-gate.js?v=2"></script>` in the
head of `satellites/flock-the-world/index.html:10`.

Nothing in this section can happen until you decide FTW is open. That is a one line
change, and it is yours to make, not mine.

## Where FTW is genuinely better than Jimothy

| Requirement | Jimothy | FTW |
|---|---|---|
| Non Pi login present | ⛔ Firebase email and password gates the unlock | ✅ **none.** No sign in wall anywhere |
| Fiat surfaces | ⛔ `$3` string, Stripe card, Stripe donations, a crypto button | ✅ **none.** The only "Stripe" in the file is a code comment explaining why the portal exit is guarded |
| External funnel | portal exit live on web | ✅ **already guarded.** `SWS_EXIT` is disabled outright inside a TWA, and the same guard extends to a Pi build trivially |
| Data collection | account, email, cloud vault | ✅ **nothing.** Its own privacy policy says "collects nothing and sends nothing. Everything it remembers stays on your device" |
| Privacy policy page | root one is titled for Lucid Winds | ✅ **its own**, `satellites/flock-the-world/privacy.html` |
| Manifest, service worker, icons | itch build strips both on purpose | ✅ all present, `node scripts/twa_ready.mjs flock-the-world` returns **10 of 10 green** |

That table is the argument. FTW satisfies Pi's data minimisation rule, its Pi only
transactions rule and its no external login rule **by having no money and no accounts at
all**. The compliance work for Jimothy in §5 is mostly unnecessary here.

## Where FTW is worse: the content question, honestly

I read Pi's rules looking specifically for a political content restriction. **There isn't
one.** No Pi document mentions politics, satire, government criticism, propaganda or
surveillance in any direction. There is no explicit restriction, and equally **no explicit
protection**.

⚠️ **An adversarial re read of this section corrected me on scope, and the correction makes
the risk higher, not lower.** My first pass named four governing documents. Two of them do not
govern an SDK built app:

- The **Pioneer Code of Conduct** never says it applies to third party apps in the ecosystem.
- The **Pi App Studio Community Guidelines** carry an explicit scope: Pi App Studio, its
  "Creators" and its "End Users". Jimothy and FTW are SDK built, not App Studio built, so
  that document is not binding on them.

I had put the defamation risk in that second, non binding document. **It is also in the
binding one**, which I missed. The main [Terms of Service](https://socialchain.app/tos)
requires that user content be "libelous or defamatory, does not contain threats, would not be
considered hate speech or discriminatory" and "not intended to incite violence towards
individuals **or entities**".

So the two clauses that actually apply are:

1. **The catch all**, in the binding [Developer Terms of Use](https://socialchain.app/developer_terms):
   content that is, "in Our judgment, harassing, defamatory, abusive, lewd, pornographic,
   obscene or **otherwise objectionable**", removable "in Our sole discretion and, without
   notice to you". Unbounded by design, and that document was last updated **9 January 2023**.
2. **The defamation and incitement standard in the main ToS**, quoted above, which reaches
   "entities" as well as individuals. Satire that names or closely models a real country,
   agency, leader or company is the concrete risk.

**And a framing correction worth making explicitly: "not prohibited" is not the same as
"passes".** An unbounded discretion clause, plus a defamation standard that covers entities,
plus zero political speech protection anywhere, is not a green light. It is an absence of a
red one.

**And here is the good news, measured rather than assumed.** I grepped FTW's corpus for
real world entities. The gameplay map uses **fifteen regions**, not countries: Canada,
Central America, East Asia, Eastern Europe, Middle East, North Africa, Oceania, Russia and
Central Asia, South America, South Asia, Southeast Asia, Southern Africa, Sub-Saharan
Africa, United States, Western Europe. Individual country names (Israel, Ukraine, China)
appear **only inside the border polygon data**, as map geometry labels. No real politician,
party, agency or company is named anywhere in `game.js`.

So the satire is aimed at an invented vendor class, not at a real government. That is the
materially safer shape, and it happens to already be true. **Do not let that drift.** The
day a real company or a real head of state gets named in a news line is the day this
section changes.

⚠️ **Two more things worth saying plainly:**

- Pi's ToS states "This Site is not directed to users under the age of 18", so Pi presents
  as an adult platform overall. There is **no content rating scheme** of any kind in any Pi
  listing document I could find, no ESRB, no IARC, no maturity flag. That cuts both ways:
  nothing to fill in, and nothing to hide behind if a reviewer objects.
- **Gambling.** ⚠️ The often quoted ban, "Offering or facilitating gambling, betting, or
  lottery-related services involving Pi tokens, either directly or indirectly", is in the
  [Pi App Studio Community Guidelines](https://minepi.com/appstudio_community_guidelines/) and
  **not in the main ToS** (I checked; it is absent). By the same scope test used above, it does
  not bind an SDK app. FTW has no gambling anyway. Lucid Winds has a **slot machine and a
  mystery box priced in Dew**, which is not a Pi token. So on the text this does not apply, and
  it is still exactly the sort of thing a reviewer screenshots.

## Free with a tip, or paid unlock? My recommendation, with the reasoning

**Free, with a Pi tip, and no paywall.** Three reasons, weakest to strongest.

1. **It preserves the only clean compliance story you have.** The moment FTW takes a paid
   unlock it needs the identity bridge, the price table, an entitlement store and a
   restore path, and it stops being an app with no accounts and no data collection. That
   property is currently its single biggest listing advantage.
2. **A paywall is worse for a satire.** The game's argument is that surveillance is sold to
   you as convenience by people who profit from it. A version that stops you ten minutes
   in and asks for money to see the rest is making a joke it did not intend to make.
3. **The economics do not justify the work.** At $0.093 a Pi, a 30 π unlock is $2.79 and a
   generous 10 π tip is 93 cents. The Incoming Multisig Wallet review, the identity bridge
   and the entitlement store are days of work each. Against ~16 million migrated Pioneers
   with no documented tipping culture, the expected return does not cover it. Ship free,
   measure whether anyone plays, and only then decide whether money is worth wiring.

**The differences from Jimothy's lane, for the record:**

| | Jimothy | FTW |
|---|---|---|
| Existing paid product | $3 Supporter Pack, cosmetic, already server fulfilled | none, $1 intent on Play, nothing built |
| Orientation | portrait, deliberate, and the Steam page says stretching it would ruin it | responsive **both ways**: manifest declares `"orientation": "any"` and the CSS carries portrait and landscape branches including `@media (orientation:landscape) and (max-height:560px)`. This is the better position inside Pi's iframe, where you do not control the frame |
| PWA readiness | itch build strips the worker and manifest | manifest, `sw.js`, three icons, own privacy page, 10 of 10 Play gates |
| What it needs for Pi | the whole §5 compliance lane plus §4.2 identity | lift the dev gate, guard the portal exit for the Pi rail, add a Pi tip if wanted |
| Content risk | none | the §"content question" above, low but nonzero |

## FTW runbook, short because it is short

- [ ] **F1. Decide whether FTW is open.** Remove `dev-gate.js` from the head or leave it.
      Everything else waits on this.
- [ ] **F2. Extend the `SWS_EXIT` guard to the Pi rail.** It already refuses inside a TWA;
      make it refuse on `pi-rail` too, same one line shape as §5.3.
- [ ] **F3. Add `?pi=1` handling** even with no money in the build, so the exit guard and
      any future price surface have a declared rail from day one rather than retrofitted.
- [ ] **F4. Device test on a real iPhone in Pi Browser.** Same storage question as §6, and
      FTW is a long game with a lot of state. Orientation should be fine because the game is
      responsive both ways, but watch it rotate once rather than assuming.
- [ ] **F5. Register a separate app entry.** Do not reuse Jimothy's. Separate URL, separate
      `validation-key.txt` question, separate listing.
- [ ] **F6. Only after Jimothy is listed.** Two simultaneous submissions from one developer
      with no track record is the shape that reads as spam, and Pi's guidelines do name
      spamming as an enforcement trigger.

---

# WHAT I COULD NOT VERIFY

Collected here as well as flagged inline, because the shape of the gaps is itself a finding:
**almost everything Pi publishes about listing is on a community maintained GitHub Pages site,
and almost nothing about the money is published at all.**

### Only Stephen can answer these
- **Whether developer KYC is complete**, not started.
- **Whether the Mainnet wallet has received a migration.** Without it every transaction fails.
- **The Mainnet listing form's actual fields**: icon pixel sizes, screenshot count, description
  character limits, the category taxonomy. None of it is published anywhere. It lives inside
  the portal UI, which only opens in Pi Browser on a phone. Screenshot it and I will write the
  copy to the real limits.
- **Whether progress survives on a real iPhone in Pi Browser.** §6. The biggest technical
  unknown in the plan.

### Added 27 August, after the plan changed to "no listing, just get played"
- ⛔ **Whether progress survives on a real iPhone in Pi Browser.** Promoted from a technical
  footnote to **the single blocking question**, because the new plan is entirely about getting
  people playing and a game that forgets them is worse than no game.
- **Whether the Mainnet wallet "invitation basis" gating still applies** in August 2026. The
  community checklist says slots "are currently sent on an invitation basis" but that page
  footers as 2025 and likely predates Open Network.
- **Whether `Pi.Wallet.submitTransaction(xdr)` works outside an approved app.** It appears in
  the new SDK docs and not in the canonical `SDK_reference.md`. Undocumented, ungated as far as
  anyone can tell, and plainly routes around the payment flow. **Do not build on it**, but it
  is the only unexamined path to taking Pi without the multisig review.

### Only Pi Support can answer these, and they are all in one ticket (§9, Post 1)
- **The status of the May 2026 submission**, whether it can be withdrawn, and whether that
  frees the domain.
- ✅ **Whether two Developer Portal apps can verify the same domain: ANSWERED**, and I had it
  wrong. The constraint binds the **URL**, not the domain, so Jimothy can have its own app entry
  on a path under `lucidwinds.com`. See §3.
- ⛔ **Who holds the signing keys on the Incoming Multisig wallet**, and under what conditions
  the Core Team signs a withdrawal. Absent from all seven Pi documents I read. §6.5.
- **Whether Pi received through U2A is subject to any lockup.** The whitepaper covers lockup
  only at migration and never addresses inbound transfers or developers at all.
- **Whether offering an in game reward for directory staking crosses any line.** §9, Post 5.

### Documented contradictions, where two live Pi sources disagree
- **A2U (paying users out).** The Launch page says "testnet apps and selected mainnet apps";
  `payments_advanced.md`, still live, says "only on the Testnet". **Assume testnet only.**
- **Whether a Developer Portal app entry can be deleted at all.** Deletion was announced for
  Pi App Studio creations, which is a different system. Nothing covers the Developer Portal.

### Simply not published, anywhere
- **Any review SLA or wait time.** ⛔ **Any number quoted to you, "weeks", "two to three
  months", anything, is fabricated.** The throughput datum in §3 (a headline listing event
  that added five apps) is the closest thing to a real signal that exists.
- **Any appeal path** for a listing rejection.
- **Any platform fee or revenue share on U2A payments.** Not "0%", **undocumented**, and
  there is no contract clause preventing one being introduced.
- **Any CPM, eCPM or revenue share for the Pi Ad Network.** The docs' own "Developer Ad
  Network Application" section still reads "Coming soon...".
- **Any content rating scheme.** No ESRB, no IARC, no maturity flag, in any Pi document.
- **Service workers, add to home screen, orientation lock or fullscreen inside Pi Browser.**
  I grepped all eleven platform docs and got zero hits for every one of those terms.

### A provenance warning that applies to this entire document
The seven Mainnet Listing Requirements that most of the Pi compliance work here depends on
live on `pi-apps.github.io`, which is Pi Network's official GitHub organisation but is self
described as a **community** developer guide with an "edit on GitHub" link. The binding legal
document, the [Developer Terms of Use](https://socialchain.app/developer_terms), was last
updated **9 January 2023** and contains **no authentication clause, no Pi only transactions
clause and no external funnel clause**. Those rules are authoritative in practice for getting
listed, and they have **zero contractual force**. Build to them, and do not build anything
expensive on the assumption that they cannot change without notice.
