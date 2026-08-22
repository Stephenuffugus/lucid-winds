# CROSS CHECK — the Google Play recommendation, Aug 22 2026

**To the reviewer:** Stephen asked you to check my work before he acts on it,
because he does not want to take my word for it. He is right not to. This
document is written to make me easy to catch, not easy to agree with.

Three rules for reading it:

1. **Every factual claim below carries the command that re-derives it.** Run
   them. Do not take a number from this page. Where I could not verify something
   I have said so in the same sentence rather than at the bottom.
2. **Facts and judgements are in separate sections on purpose.** Section 2 is
   checkable. Section 3 is opinion and is where I am most likely to be wrong.
3. **Section 6 is my error log from the last two days.** It is there so you can
   calibrate how much weight to give me. It is not short.

⛔ **The single most useful thing you can do is attack section 3.** The facts
will mostly hold up because they are mechanical. The strategy is where a
confident wrong answer costs him a developer account or a launch window.

---

## 1. THE DECISION ON THE TABLE

Stephen has a Google Play **organization** account with a D-U-N-S number,
approved and ready. He has ~182 browser games and a handful of apps, all free at
lucidwinds.com. Jumping Jimothy ships to **Steam at $2.99 around Sep 15**.

He set the account up for **free apps**. He noticed the conflict himself: putting
Jimothy on Play free while it is $2.99 on Steam.

**What I recommended:**

- Do **not** set up a merchant account to sell paid apps
- Do **not** list Jimothy first; delay it to roughly November, free, after Steam
  has run its launch
- List **Bandit's Box** first, in **Entertainment**, not Games
- Hush second
- Keep the Stripe tip jar on the web only, never inside a Play app

He has NOT acted on any of it yet.

---

## 2. VERIFIED FACTS — re-derive these yourself

Run from the repo root. If any of these disagree with what I said, I am wrong
and the number wins.

### 2.1 The payment rail
```
grep -ril stripe --include=*.js --include=*.html . | grep -v node_modules | wc -l     # 54
grep -ril nowpayments --include=*.js --include=*.html . | grep -v node_modules | wc -l # 8
grep -rn "buy.stripe.com" --include=*.html . | grep -v node_modules
```
Stripe is the live rail. NOWPayments is dead code plus stale docs. Three live
Stripe links: `portal/index.html` and `support.html` share one, `hush/index.html`
has its own. **Lucid Winds has no payment link** — it drives Stripe Checkout
through `/api/create-tip-session.php` instead.

⚠️ **I could NOT verify that Lucid Winds' tip jar actually works.** The endpoint
is deployed (a GET returns 405) but the method check runs *before* the config
check, so the 405 proves nothing about whether `stripe-config.php` with a live
secret key is on the Hostinger server. **Stephen can settle this in ten seconds
by tapping his own lantern button.** If it says "Server config missing", his
flagship's tip jar has been dead and that is worth more than everything else in
this document.

### 2.2 Bandit's Box, the proposed first listing
```
node scripts/twa_ready.mjs bandits-box      # ten gates
node scripts/twa_ready.mjs --all            # the fleet
node scripts/_offline_check.mjs bandits-box # cold launch, network cut
node scripts/_twa_boundary_check.mjs        # the policy boundary, four states
```
- No Stripe, no ad SDK, no analytics, no sign-in wall, one localStorage key
  (`bandit-set`)
- The single `fetch()` is **dead code**: it iterates `SFX_MANIFEST`, which parses
  to **zero live keys**, every row commented out
- **24 toys**, not 4
- Cold launches with the network cut: splash renders, 24 toys in the DOM

⛔ **Check that I did not write gates that cannot fail.** `twa_ready.mjs` fails
on `siege` (unguarded portal exit, no privacy page) — run it and watch. If a
gate passes everything you hand it, it is decoration and you should say so.

### 2.3 The fleet fact
`node scripts/twa_ready.mjs --all` reports **80 of 112 satellites have an
unguarded portal exit** — each can walk a player to `portal/index.html` and its
live Stripe checkout. Fine on the web, fatal inside a Play app.

### 2.4 Google policy, as I read it on Aug 21 2026
Two searches, both worth repeating because policy moves:
- New **personal** accounts need 12 testers for 14 continuous days before
  production access; **organization accounts are exempt**
- Play Billing is required for in-app digital purchases; donations outside it are
  carved out **only for approved nonprofits with documentation**

⚠️ **I did not verify** that production access, once granted, is account level
rather than per app. I told him to confirm it in Console. If you can settle it,
do.

---

## 3. MY JUDGEMENTS — attack these

Nothing in this section is verified. This is where to spend your time.

### 3.1 "Do not set up a merchant account; paid mobile gets near zero installs"
**My reasoning:** a $2.99 paid app from a studio with no reviews faces a brutal
install cliff, and the tax and banking paperwork buys almost nothing.
**Where I could be wrong:** I did not measure this. It is general knowledge, not
a number I checked. If the real figure is "a few dollars a month for two hours of
paperwork", that is not nothing for a one person studio.
⛔ **One thing I am confident about and you should verify independently: free to
paid is a ONE WAY DOOR on Play.** Published free can never become paid. If that
is wrong, my whole recommendation loosens considerably.

### 3.2 "Delay Jimothy to November"
**My reasoning:** a free Play version during the Steam launch window risks a
sour Steam review from someone who finds it free on Android, and on a $2.99 game
with single digit reviews one of those hurts.
**Where I could be wrong:** I may be overweighting review risk. The audiences
barely overlap, the Steam page is Windows only, and a simultaneous free mobile
release could just as easily *drive* Steam sales through visibility. **Losing
three months of exposure is a certain cost against a speculative harm.** If you
think that trade is wrong, say so plainly, because it is the most consequential
call here.

### 3.3 "Bandit's Box first"
⛔ **Read this before weighing my recommendation: I changed my mind on this
twice in one conversation.** I recommended it, then abandoned it the moment
Stephen pushed back and said Jimothy was the better shop window, then returned to
it once the price conflict ruled Jimothy out. That is not a considered position
arrived at once; that is me moving with the conversation. **Discount it
accordingly and form your own view.**
**The case for it:** the only candidate needing zero surgery, genuinely free with
no price conflict anywhere, offline proven, ready in about a day.
**The case against, which I do believe:** it represents the studio weakly.
Someone installs it and learns Sky Wolf Studio makes a nice fidget box. They
learn nothing about 182 games. The fidget category on Play is a landfill of ad
farms with years of ratings, and a new account will not rank on "pop it" or
"fidget toys", possibly ever. **Expect single digit organic installs.**
**The alternative I did not argue hard enough:** Hush. "Free white noise, no
subscription, no account, offline" is a true, defensible claim in a category
where every incumbent is a paywalled subscription, and the search volume is far
higher. I put it second because its blockers are mechanical rather than zero. A
reasonable reviewer could put it first.

### 3.4 "Entertainment, not Games"
Judgement. In Games it competes with ad farms; in Entertainment it is a toy box.
I did not check category conventions or how Play routes discovery for either.

### 3.5 "The arcade as one TWA is the eventual big move"
Still my view for a later listing, and the assessment agreed the payoff is real.
But it had **nine payment and outbound surfaces** to strip and carries real
minimum functionality risk. It is not a first listing. ⚠️ **I did not verify that
a TWA of a 161 game arcade clears Play's minimum functionality bar.** That
deserves its own check before anyone builds it.

---

## 4. WHAT I CHANGED IN CODE — review these

All on branch `add-sproing-jumper`. Nothing has been deployed to main.

| File | Change | Why |
|---|---|---|
| `satellites/bandits-box/index.html` | added `inTWA` detection; `SWS_EXIT` returns early and the arcade button stays hidden inside a TWA | inside a Play app that button leads to the portal's live Stripe checkout |
| `satellites/bandits-box/privacy.html` | new | Play requires a privacy policy URL; the root one is titled for Lucid Winds |
| `satellites/bandits-box/play-icon-512.png` | new, full bleed | `icon-512.png` has transparent corners with rounding pre baked; Play applies its own |
| `satellites/bandits-box/PLAY-LISTING.md` | new | the pre flight, with the command that re proves each claim |
| `scripts/twa_ready.mjs` + 3 checkers | new | the gates |
| five payments `.md` files | ⛔ banner added | they told me NOWPayments was live and I repeated it to him |
| `store/jimothy-steam/package.json` | author plural to singular; now tracked | a bare `package.json` gitignore rule was hiding the Steam build recipe |

⛔ **The TWA guard is the one to review hardest.** It is a policy boundary
implemented as a runtime condition, and if my detection is wrong it fails open.
`document.referrer.indexOf('android-app://')===0` plus standalone display mode on
Android. **Is that the right detection? Is there a case where both are false
inside a real TWA?** I tested it in a headless browser, not on a phone.

---

## 5. WHAT ONLY STEPHEN CAN DO

1. Confirm the account is genuinely an **organization** account
2. Generate the release keystore and **back it up somewhere that is not this
   codespace** — losing it means never updating the app again
3. Publish `/.well-known/assetlinks.json` with that fingerprint, `application/json`,
   HTTPS, no redirect. Without it the TWA shows a **URL bar**, which is the
   classic minimum functionality rejection
4. `bubblewrap init` with scope `./`
5. Strip any permission from `AndroidManifest.xml` that is not `VIBRATE`
6. **Install on a real phone, cold launch in airplane mode, and look at it**
7. **Tap the lantern button on lucidwinds.com** and tell us whether the tip jar
   actually works

---

## 6. MY ERROR LOG — calibration

Not an apology. Weight my advice with it.

1. **I told him to spend twenty minutes going live on NOWPayments.** He had
   abandoned it long ago for Stripe. I read `NEXT_SESSION.md`, which says "start
   here" and was last correct in June. **I trusted a document over the code.**
2. **He thought I had broken the game shipping to Steam.** I had not touched it,
   but I wrote up a scanner bug as though he had been following the tool's
   internals. My writing caused that, not my code.
3. **A tool I built produced three false claims in its first run**: it flagged
   Jimothy as showing ads because "AdMob" appears in a *comment*; it truncated
   "Seattle's roundest raccoon" to "Seattle" at the apostrophe; and it reported
   "no chance mechanic" for a game whose Prize Bin pulls random critters. The
   last one is the dangerous kind: **a false clean bill of health.**
4. **A sweep I wrote reported "0 satellites affected"** because it ran from the
   wrong directory and its glob matched nothing. A clean result produced by
   measuring nothing looks exactly like good news.
5. **I shipped a policy boundary without watching it work**, then built the test
   afterwards. It passed, but I did not know that when I shipped it.
6. **Three CSS changes I made were silently dead**: a duplicate `#lanebox:before`
   the file already claimed, a rule for `#briefCard` which does not exist, and a
   `.card` restyle aimed at the wrong class. None errored.
7. **A name collision I introduced blanked six solitaires' card backs.** Every
   file parsed, every game ran, nothing errored. Only a screenshot caught it.
8. **I flip flopped on the first listing recommendation twice**, see 3.3.

The pattern across all eight: **nothing failed loudly.** Everything looked fine.
Where I am most dangerous is a confident claim that nothing checked.

---

## 7. WHAT I WANT YOU TO ANSWER

1. Is delaying Jimothy to November right, or am I trading certain exposure for a
   speculative review risk? (3.2)
2. Should Hush be first instead of Bandit's Box? (3.3)
3. Is the `inTWA` detection sound, and does it fail closed? (section 4)
4. Is free to paid genuinely a one way door on Play? (3.1)
5. Is production access account level or per app? (2.4)
6. What have I missed entirely?

Answer 1 and 2 even if you agree with me, and say what would change your mind.
Stephen is going to act on this, and a second confident voice agreeing with a
first confident voice is worth nothing to him.
