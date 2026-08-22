# Bandit's Box — Google Play pre-flight

Everything below was **verified against the file**, not taken from the app's own
copy. Where a claim is checkable, the command that checks it is included, so it
can be re-proved after any change rather than trusted.

---

## ⛔ The one thing to understand before anything else

**A TWA is not a packaged build. It is a wrapper around the live URL.**
Whatever is on `lucidwinds.com/satellites/bandits-box/` *is* what is inside the
app. There is no separate store build to strip things out of, so anything that
must not exist inside the app has to be handled **in the live file, at runtime**.

That is why the arcade back button was not deleted. Deleting it would break
returning to the portal on the web, where it is wanted. Instead the app now
detects a Trusted Web Activity and disables the exit outright:

```js
inTWA = document.referrer.indexOf('android-app://')===0
     || (matchMedia('(display-mode: standalone)').matches && /Android/i.test(navigator.userAgent));
```

**Why this matters:** if that button ever showed inside the app, it walks the
player to `portal/index.html`, which carries a live `buy.stripe.com` "Tip the
Arcade" checkout. An out-of-Play payment flow reachable from inside a Play app
is the thing that gets an app pulled. Hiding it is a CSS state; this is a policy
boundary, so the exit function returns early as well.

---

## Verified facts

| Claim | How it was checked | Result |
|---|---|---|
| No payment surface anywhere | `grep -c "buy\.stripe\.com"` and a sweep for tip/donate/purchase/billing | 0. The one "stripe" hit is a comment about corduroy **stripe spacing** |
| Nothing is transmitted | grep for `XMLHttpRequest sendBeacon WebSocket EventSource gtag analytics firebase` | 0 matches for all |
| The single `fetch()` is dead code | it loops `Object.keys(SFX_MANIFEST)`; the object was parsed and its keys counted | **0 live keys** — every row is commented out, the loop body never runs, all sound is synthesised |
| One storage key | `grep -oE "localStorage\.(setItem\|removeItem)\('[^']+"` | exactly one: `bandit-set` |
| No account | grep for `sign in / sign up / log in / account / password / email` | 0 |
| Works offline | `node scripts/_offline_check.mjs bandits-box` — installs the SW, then **cold launches a new page with the network cut** | ✅ splash renders, **24 toys** in the DOM, 42 svg/canvas, no page errors |

Re-run the offline proof any time:

    node scripts/_offline_check.mjs bandits-box

---

## Data Safety form — the answers

- **Does your app collect or share any of the required user data types?** → **No**
- Data collected: **none**. Data shared: **none**.
- Is all data encrypted in transit? → not applicable, nothing is transmitted
- Can users request data deletion? → not applicable, nothing is held. The app's
  own **Start fresh** button removes `bandit-set` from the device.

⚠️ Play's definition of "collect" is *transmitted off the device*. Settings kept
in local storage and never sent are **not** collection, which is why "No" is the
honest answer rather than a convenient one.

---

## Store listing

**Title (30 char max):** `Bandit's Box: Fidget Toys`

**Short description (80 char max):**
`24 quiet fidget toys. No ads, nothing to unlock, works with no signal.`

**Full description:**

> A quiet box of twenty four fidget toys, for hands that need something to do.
>
> Pull the raccoon's ears and tail. Pop a whole row of bubbles with one drag.
> Spin the spinner. Snap the bubble wrap, stretch the slime, mesh the gears,
> turn the knob, tip the rain stick, peel the foil, flick the coin.
>
> Everything works with the screen off the internet. Nothing is locked. Nothing
> is timed. There is no score unless you turn one on yourself, and no toy is
> ever taken away.
>
> No ads. No accounts. No purchases. Your settings sit on your phone and go
> nowhere.
>
> Sky Wolf Studio also makes 180+ free browser games at lucidwinds.com, with no
> account and no ads.

⛔ That last line is the studio bridge, and it belongs **in the listing, not in
the app**. Play restricts in-app flows that steer to out-of-app purchase; a
website named in a store description is ordinary and every app has one.

**Category:** Entertainment (not Games — this is a toy box, and Games is where it
would be buried under ad-farm clones)
**Content rating:** complete the IARC questionnaire honestly — no violence, no
purchases, no user interaction, no data sharing. It should come back as suitable
for everyone.
**Website:** `https://lucidwinds.com`
**Privacy policy:** `https://lucidwinds.com/satellites/bandits-box/privacy.html`

---

## Still to do, in order (⚖ Stephen only)

1. **Confirm the Play account is an ORGANIZATION account.** Organization accounts
   are exempt from the 12-tester / 14-day closed testing gate; new *personal*
   accounts are not. Everything below assumes organization.
2. **Generate the release keystore and back it up somewhere that is not this
   codespace.** Losing it means never being able to update the app again.
3. **Publish `/.well-known/assetlinks.json`** on lucidwinds.com with that
   keystore's SHA-256 fingerprint, served as `application/json` over HTTPS with
   no redirect. Without it the TWA falls back to a Custom Tab **with a visible
   URL bar**, which reads as a repackaged website and is the classic
   minimum-functionality rejection.
4. **`bubblewrap init`** against `https://lucidwinds.com/satellites/bandits-box/`
   with scope `./`, matching the manifest. Scope is the containment boundary:
   the portal, the Stripe link and every other game must be unreachable from
   inside the app.
5. **Audit the generated `AndroidManifest.xml`** and remove any permission the
   app does not use. It needs `VIBRATE` and nothing else. If `CAMERA`,
   `RECORD_AUDIO` or location appear, Bubblewrap added them, not the app, and
   each one drags in its own declaration form.
6. **Install the release build on a real phone, cold launch it in airplane mode,
   and LOOK at it.** Confirm: no URL bar, no back-to-arcade button, and all 24
   toys working with the radio off. A green build is not a look.

---

## Honest risk

The fidget category on Play is a landfill of ad-stuffed clones with years of
ratings behind them. A brand new account with zero installs will not rank on
"pop it" or "fidget toys", possibly ever. The realistic traffic is the long tail
— *fidget app no ads*, *sensory app for autism*, *offline fidget toys* — where
"no ads, nothing to unlock, works with no signal" is true, defensible, and rare.
Expect single digit organic installs in the first weeks. This is the best search
position in the catalogue; it is not a good one. It is here because it is the
only listing that needs no surgery and conflicts with nothing.
