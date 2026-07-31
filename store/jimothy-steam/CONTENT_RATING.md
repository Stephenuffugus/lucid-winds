# Content survey + age rating — every answer, ready to copy

⛔ **Stephen has to submit this himself.** It is a legal attestation about the
product, made under the account that owns the app. I can answer it; I cannot sign
it. Every answer below was checked against the actual game, not assumed — where
something is a judgement call it says so.

Steamworks → app `5043360` → **Edit Store Page → Content Survey**, and the
separate age-rating section.

---

## The survey

| Question | Answer | Why, checked against the build |
|---|---|---|
| **Violence** | **Yes — mild, cartoon** | Jimothy is bumped by traffic and tumbles over. It is slapstick: he flops, stars spin, you restart. No weapons, no combat, no injury shown. |
| **Blood** | **No** | None anywhere. Confirmed — the words blood/gore appear nowhere in the game, in art or text. |
| **Gore / dismemberment** | **No** | None. |
| **Sexual content or nudity** | **No** | None. The cast is animals and a raccoon in costumes. |
| **Profanity / crude humour** | **No** | No swearing. Humour is a fat raccoon in a chicken suit. |
| **Alcohol, tobacco, drugs** | **Yes — one incidental reference** | See the note below. Answer yes; it costs nothing and a "no" that is technically wrong is the kind of thing that earns a second review round. |
| **Gambling** | **No** | See the note below — the Prize Bin is not gambling and it matters that you can explain why. |
| **In-game purchases** | **No** | The Steam build has NO commerce. Stripe, the crypto button and all donate surfaces are hidden by `STORE_BUILD`, and the Supporter Pack is GRANTED at install. There is nothing to buy. Verified by A/B against the same bundle with the flag off. |
| **User-generated content** | **No** | Players create nothing and share nothing. |
| **Online / multiplayer / player interaction** | **No** | Cloud sync is short-circuited in the desktop build. No accounts, no leaderboards, no chat. Single player, entirely local. |
| **Does the game collect user data?** | **No** | ⛔ This was YES until 2026-07-31 and is now genuinely no. See the note below. |
| **Horror / fear** | **No** | Mothman and Ghost Jimothy are spooky-cute costumes, not horror. Dark rainy art, nothing frightening. |

**Expected rating:** Everyone / PEGI 3 / ESRB E. A hopper with no blood, no
language and no purchases sits at the bottom of every scale.

---

## The three answers worth being able to defend

### 1. Alcohol — say yes, and this is all it is
One of eight hidden Seattle landmark collectibles is **"A Rainier Tallboy Tab"** —
a discarded pull-tab off a beer can, lying in the street as litter for a raccoon
to find. Alongside Rachel the Pig, the Gum Wall and Fremont Lenin. **Nobody drinks
anything, no alcohol is depicted, no bottle or can is shown being consumed.**

Say yes and describe it in one line if there is a box: *"A single collectible is a
discarded beverage can tab found as street litter. No consumption is depicted."*
That is accurate and it will not move the rating.

⚖️ **One call for Stephen, not a blocker:** "Rainier" is a real beer brand as well
as the mountain. Renaming it **"A Tallboy Tab"** loses nothing and removes a brand
name from a commercial product. Your writing, your call — I did not touch it.

### 2. Gambling — the answer is no, and here is the reason
The Prize Bin takes bottlecaps you earn by playing and gives a critter you do not
own. It is not gambling and does not read as it to a rating board because:
- **No real money is involved at any point.** The Steam build cannot take money.
- **You cannot lose.** Every pull returns a critter you did not have. Duplicates
  are impossible by construction, so there is no losing outcome to chase.
- **No odds are hidden behind a payment.** The price is on the button.

If a box asks about randomised in-game rewards, say yes to that and no to
gambling. They are different questions and conflating them is what causes a
follow-up email.

### 3. Data collection — this changed today, deliberately
Until 2026-07-31 the build carried three things that phoned home: boot
diagnostics, an in-game bug form, and a redeem-code ping. All three were built for
the **web** version and are useless in a desktop wrapper.

They are now switched off in storefront builds. **Proven, not assumed:** the build
was driven with a fake crashed boot seeded into storage — the exact condition that
makes the web version transmit — and logged **zero outbound requests**. The bug
form's buttons are hidden rather than left as doors that silently fail.

So the honest answer is **no data collected**, which also means **no privacy
policy is required** on the store page. That removes a whole category of review
friction, and Steam Discussions is a better bug channel anyway — you get notified.

---

## Price — ratified

**$2.99 USD.** Stephen's call, 2026-07-31. Everything is included: no DLC, no
in-app purchases, and the $3 Supporter Pack is granted free in this build, so a
Steam buyer gets the whole game and every pack costume for one price.

A 10% launch-week discount is the recommendation. ⛔ Valve does not allow a launch
discount to be changed once the page is live, and a discount cannot run in the
first two weeks unless it is set up as a launch discount before release. Decide it
when you set the price, not after.
