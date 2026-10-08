im rea# THE PLAY GAMES ON PI NETWORK, the plan (Fable, 8 Oct 2026)

## 0. His words and his rulings

8 Oct, verbatim: "i also thoguht we should take every game were publishing on the play store and publish it on the pi
network too! they are desperate for games and stuff. they ignored lucid winds but its a crazy game maybe they would be
more receptive to these individual games and apps"

Then: "so we cant put our games up for 5 or 10 pi? we would have to put a sale in game? could we make it a demo and
then you play and unlock full game for xpi? strategize with me what we can do and what the most realistic goal would be"

Then, switching to Fable: "do this job impeccably for the games weve got on playstore and make sure it cant messthem
up at all. were going to sub,it some gam,es to pi and then post some links in pi communities for people to play. if we
have toi pick a cut off point to make them pay okay like in tumble if you want to do anything more than play a ten pair
load it asks for 7 pi or something or 8 pi cuz asia likes the number 8. lets do this strategically but also carefully
to not mess anything up"

Rulings taken from that:
- All three Play games go to Pi: Tumble, Flock the World, Pixel Petri. Tumble first.
- Shape: free demo, then ONE unlock for the whole game. Price **8 Pi** (his lean, "asia likes the number 8").
- Tumble's free part: **the ten pair Load** (the Small Laundry Day Load). Anything more asks for the unlock.
- The Play apps must not change in any way a player could notice. Not one.
- After listing: links posted in Pi communities. The links must work for anyone, in or out of Pi Browser.

## 1. What Pi is and is not (checked today against Pi's own pages)

- No paid download exists. Every Pi app opens free; money moves only through `Pi.createPayment` inside the app, and
  every payment is approved and completed by OUR server (phase I and III of Pi's flow). That server exists:
  `functions/piApprove.js` and `piComplete.js` do it for Lucid Winds.
- Listing rules (pi-apps community guide, mainnetListingRequirements): working app, developer KYC (his is done),
  **Pi login only** (email or third party logins prohibited), **Pi only payments**, no redirects to outside sites,
  collect only what the app needs, the domain must not start with "pi".
- Ownership is proven by a file **at the root of the app's domain**. lucidwinds.com's root already holds Lucid
  Winds' `validation-key.txt`. Measured today: the origin (Hostinger, 82.25.83.190) **refuses TLS for any hostname it
  does not know** (`tlsv1 alert internal error` for tumble.lucidwinds.com), so a subdomain needs more than a DNS line.
- A Pi app has its own server API key. Pi identifies the app by its registered URL, so one app per hostname:
  `tumble.lucidwinds.com`, `flocktheworld.lucidwinds.com`, `petri.lucidwinds.com` (NOT pixelpetri: it starts with "pi").
- The SDK: `Pi.init({version:'2.0', sandbox})`, `Pi.authenticate(['username','payments'], onIncompletePaymentFound)`
  returns `{accessToken, user:{uid, username}}`; the server verifies the token at `GET /v2/me` (Bearer). Payments:
  `GET /v2/payments/{id}`, `POST .../approve`, `POST .../complete {txid}` (Key auth). Testing: the sandbox at
  sandbox.minepi.com after a Development URL is set in the portal (`develop.pi` inside Pi Browser).
- PI price: about $0.136 on 22 Jun, about $0.0855 on 1 Aug. 8 Pi is roughly $0.70 to $1.10. Reach, not revenue.
- Cloud Functions run on Node 20, decommissioned **30 Oct 2026**. New functions can still be deployed before that
  date. The runtime upgrade is its own pass, before the date, not part of this job.

## 2. The law for this job: the Play apps cannot change

The Play apps are Trusted Web Activities that load `lucidwinds.com/satellites/<game>/`. Every deploy to that path
reaches paying players. So:

1. **The rail is decided by the hostname.** `tumble.lucidwinds.com` is the Pi rail. `lucidwinds.com` and `www.` are the
   web rail, exactly as today. On the web rail the Pi module does nothing: no SDK, no login, no gate, no new copy, no
   new request. A `?rail=pi` query exists only so the gates can run the Pi rail on 127.0.0.1; it only ADDS the gate and
   the login, it never unlocks anything, and a Play app has no address bar.
2. **One choke point.** Every Load begins in `App.start(pick)`; the gate sits there, so a dev query, the door, the
   results sheet's Another Load and the Daily all meet the same check. The shop's two buy paths get the same check.
3. **Nothing in the save changes.** Ownership lives on the Pi account (server) with a local hint in localStorage, so
   `save.js`, its migrations and the import filter are untouched.
4. **Insert only.** New file `src/pi.js`; the hooks in `app.js`, `screens.js`, `ui.js` are one line each and inert on
   the web rail. The 36 Tumble suites stay green; a new Node suite covers the rail; a headless gate drives both rails
   and is watched RED on a plant before it counts.
5. **The stamp law.** `src/pi.js` joins the service worker's PRECACHE; the four stamps bump in the deploy commit.

## 3. Hosting the Pi copy: a subdomain per app (his console, my probes)

Two ways. Both end with `https://tumble.lucidwinds.com/` serving the same files as `lucidwinds.com/satellites/tumble/`
and `https://tumble.lucidwinds.com/validation-key.txt` serving Pi's key.

**A. Cloudflare Worker (recommended: one console, TLS automatic, no Hostinger).** A Worker on the route
`tumble.lucidwinds.com/*` fetches `https://lucidwinds.com/satellites/tumble/<path>` and returns it, and answers
`/validation-key.txt` itself. Needs: a proxied DNS record for `tumble` (any placeholder address; the Worker answers
before the origin), the Worker, its route. Source kept in `infra/cloudflare/pi-subdomain-worker.js`.
Free plan: 100,000 requests a day, plenty.

**B. hPanel subdomain with a custom folder** (`public_html/satellites/tumble`), plus the Cloudflare DNS line to the
origin. Hostinger must then issue a certificate for the subdomain; hPanel already nags "Domain isn't connected" for the
apex, so this may not go smoothly. Fallback only.

⛔ I do not guess either console's screens. He opens the page, I read his screenshot, we do it together. My side:
one probe per served file after each step, random query, never a burst.

## 4. The shared Pi lane (built once, used by every game)

**Server** (`functions/piGames.js`, three v2 onCall functions, no Firebase login required; the Pi token or the
payment itself is the credential):
- `piGameApprove({game, paymentId})`: reads the payment with THAT game's key, requires `metadata.game === game`,
  a known sku, amount at or above the server price (8), records `piGamePayments/{paymentId}`, approves.
- `piGameComplete({game, paymentId, txid})`: re reads the payment, completes on Pi with the txid, then in one
  transaction grants `piGameOwners/{game}_{piUid}` and stamps the record completed. Idempotent.
- `piGameStatus({game, accessToken})`: verifies the token at `/v2/me`, returns what that Pi user owns.
- Secrets, one per app: `PI_KEY_TUMBLE`, later `PI_KEY_FTW`, `PI_KEY_PETRI`. Prices live on the server.
- Firestore: the two new collections have no client rule, so clients cannot read or write them (default deny).
- Deploy is HIS (his credentials): `firebase functions:secrets:set PI_KEY_TUMBLE` then
  `firebase deploy --only functions:piGameApprove,functions:piGameComplete,functions:piGameStatus`. Nothing else
  redeploys. Before 30 Oct.

**Client** (`satellites/tumble/src/pi.js`, copied into the other two later):
- `railFor(hostname, params)`: `'pi'` on the subdomain or `?rail=pi`, else `'web'`.
- On the Pi rail at boot: load `sdk.minepi.com/pi-sdk.js`, `Pi.init`, `Pi.authenticate` (username + payments; an
  incomplete payment found is completed through the server), then `piGameStatus` → owned. The local hint
  (`tumble-pi-owned`) makes a bought game open instantly offline; the server answer overwrites it.
- `allows(pick)`: on the web rail always true; on the Pi rail true when owned, else only the free pick.
- `gate()`: a sheet in the game's own paper. Title "The whole dryer". Copy: the ten pair Load stays free; one unlock
  of 8 Pi opens every size, Rush, the Daily and the shop. Button "Unlock for 8 Pi" → `Pi.createPayment({amount: 8,
  memo: 'TUMBLE, the whole game', metadata: {game:'tumble', sku:'full'}})` with the four callbacks wired to the
  server. Outside Pi Browser the same sheet says: open TUMBLE in Pi Browser to unlock. No dashes, no exclamation points.
- Sandbox vs mainnet: `Pi.init({sandbox})` reads `localStorage['tumble-pi-sandbox']` ('1' on, default OFF). Mainnet
  by default so the listed app takes real Pi; sandbox is switched on by hand for the portal's test.

## 5. Tumble's cut, exactly

| Surface | Free | After 8 Pi |
|---|---|---|
| Small Laundry Day Load (10 pairs) | yes, unlimited | yes |
| Regular, Heavy, Mountain | gate | yes (still open by Loads played, as today) |
| Rush (Timed, Endless, Basket Balance) | gate | yes |
| Daily Rush, Daily Laundry Day | gate | yes |
| The room, the Clothesline (pegs earned by doing), lore pages, the Drawer, the Odd Bin | free | free |
| Shop: buying anything with Lint or Quarters (baskets, dryers, decor, songs, ball styles) | browse yes, buy gate | yes |
| Settings, export and import, Tester row (tester devices only) | free | free |

The door sheet marks the gated choices with "8 Pi" and a tap on one opens the gate sheet instead of doing nothing.

## 6. Flock the World and Pixel Petri: proposed cuts (HIS CALL, nothing built)

- **Flock the World**: three operation types (The Contractor, The Deep Partnership, The Crisis Engine) and resistance
  levels. Proposed free: The Contractor at the first resistance level, a run that ends at a day count he names. The
  other two operations, the higher resistance levels and the music: 8 Pi.
- **Pixel Petri** ($1 on Play, everything included): proposed free: one world, its first days (a count he names), the
  Scrapbook's first section. New worlds and the rest: 8 Pi.
- Same module, same server, their own subdomains and keys. Each needs its own look at every exit (FTW's `SWS_EXIT`
  already refuses to leave inside a TWA; the Pi rail reuses that guard).

## 7. His steps, in order (I prepare every value; he pastes; screenshots at each screen)

1. Cloudflare: the `tumble` DNS line and the Worker (section 3A). I verify the served files.
2. Pi Developer Portal (`develop.pi` in Pi Browser): new app, name TUMBLE, Mainnet. It shows the validation key: paste
   it to me, I commit `satellites/tumble/validation-key.txt`, deploy, he presses verify.
3. Same portal: the app's server API key → `firebase functions:secrets:set PI_KEY_TUMBLE` (his terminal), then the
   functions deploy (section 4). Development URL for the sandbox if he wants a test round with test Pi first
   (then `localStorage['tumble-pi-sandbox']='1'` on that device).
4. He opens `https://tumble.lucidwinds.com/` in Pi Browser: plays the free Load, taps Regular, sees the gate, buys
   with 8 Pi (real or test), closes the tab, reopens: still unlocked. Screenshot of the gate sheet so I can see the
   bottom of the screen under Pi Browser's bar.
5. Submit for listing. Links go out the same day: the subdomain URL works in any browser (demo only outside Pi
   Browser), so the posts do not wait for Pi's review.
6. Flock the World, then Pixel Petri, after his cut rulings.

## 8. Gates (every one watched RED on a plant first)

- `tests/pi.test.mjs` (Node): the rail table (hostnames, `?rail=pi`), `allows()` over every pick on both rails and
  with ownership, the price is 8 and the memo names the game, the sheet copy obeys the copy law, `src/pi.js` is
  precached, the hook lines exist in app.js and screens.js.
- `tools/gate-pi.mjs` (headless, both rails on 127.0.0.1, `window.Pi` stubbed, the server intercepted):
  web rail: `?load=heavy` starts a Load, zero requests to minepi.com, no gate text in the DOM;
  pi rail: `?rail=pi&load=heavy` shows the gate with "8 Pi"; Unlock drives approve then complete and the Load starts;
  a status answer of owned shows no gate; no `window.Pi` shows the "open in Pi Browser" line; shots at 412 and 360.
- The 36 suites: `node tests/run-all.mjs`.
- Harness note (8 Oct): a Load settles to `play` only after about 200 s of SwiftShader on this box, so the gate waits for
  `dump` (the dryer's pre simulation, entered only from `startLoad`) with `?turbo=1`: a Load BEGAN is the signal.
  The fake server answers the CORS preflight (OPTIONS, `access-control-allow-origin`) the way v2 onCall `cors: true`
  does, or Chrome blocks every call before it is sent; the first run found exactly that.

## 9. Deploy order

Build → gates green → stamps `20261008a` in the four places → push the branch → `git push origin
add-sproing-jumper:main` → read back `sw.js?v=` and `src/pi.js` on both origins → tell him. The deploy is inert on the
web rail; the Pi rail does not exist until his Cloudflare step.

## 10. Honest risks

- Pi's review is silent (Lucid Winds: five months, nothing). The links do not wait on it.
- 8 Pi floats with the price. His call to move it; the server price is one number.
- Node 20 ends 30 Oct: his deploy before then, or after the upgrade pass.
- Pi Browser's bottom bar is untested on Tumble; Lucid Winds needed a 56px lift. His screenshot decides a lift.
- A Pi user who finds `lucidwinds.com/satellites/tumble/` plays the full game free, as any web player does today.
  That is his standing exception (free web, paid store). The Pi app never links there.

## 11. The app wallet gate (8 Oct, 19:40 UTC) and the way through it

**Where it stopped.** Everything in §7 is done except two things: the listing's "Apply" refuses without **a connected app
wallet**, and the API key step (his computer). Pi offers two wallets and a solo developer can get neither tonight:
- **Incoming multisig**: at least two Mainnet signer wallets, max 9 points each, threshold 10, so two people sign every
  withdrawal. His generated app wallet (`GBOUS…NXC6P`) is Testnet and was refused ("Only mainnet addresses can be
  used"). He has one wallet (`GBGJ2…65TNI`) and nobody with a second.
- **Mainnet app wallet** (Apply): "The paired Testnet app needs App to User transactions to 5 unique wallets."

**His call (verbatim):** "Make a plan and post and find where to do this ... and we will knock it out later."

**The Testnet route, step by step**
1. Build `piGameTestPay` (functions): an App to User payment on Pi TESTNET from the Testnet app. Needs two secrets
   he sets: `PI_KEY_TUMBLE_TEST` (the Testnet app's API key, App Configuration → API Key on the TESTNET app) and
   `PI_TEST_WALLET_SEED` (the generated app wallet's secret, from its passphrase; it holds only test Pi). The flow
   is Pi's: `POST /v2/payments` {uid, amount, memo, metadata} with the Testnet key → sign and submit the
   transaction on Pi Testnet (Horizon `api.testnet.minepi.com`, network passphrase "Pi Testnet") from the app
   wallet → `POST /v2/payments/{id}/complete` {txid}. The app wallet needs test Pi first (the Testnet faucet in the
   Pi Wallet app; the portal may fund generated wallets).
2. Testers: `piGameStatus` on the test host already verifies every sign in; it also records
   `piGameTesters/{uid}` {username, at} on the TESTNET rail, so the list of people to pay builds itself.
3. Five Pioneers open **https://tumble-test.lucidwinds.com/** in Pi Browser and sign in (they can play the free
   Load; buying there uses test Pi, so they can even test the unlock). Stephen, Jessie if she has Pi, plus three.
4. Run the payout (a callable only he can trigger, by a shared secret, or a one off script): 1 test Pi to each of
   the five uids. Five completed A2U payments to five unique wallets = the gate.
5. Portal, Mainnet app: App Wallets → Outgoing → Apply (reason: "Receive the 8 Pi unlock payment from players of
   TUMBLE"). When Pi grants the Mainnet app wallet, connect it, then Ecosystem Listing → Apply for Unverified Listing.
6. Then the API key (Mainnet app) → `PI_KEY_TUMBLE` → functions deploy; then he buys it once in Pi Browser.

**Where to find five testers** (verified channels first, per memory project_pi_ecosystem_state_2026-05-14):
- **r/PiNetwork** (Reddit): a "help test our game on Testnet" post with the test link and the Play listing as proof.
- **Pi Chats inside the Pi app** (the official rooms; the ecosystem and developer rooms): the same message, short.
- **The Pi Ecosystem Discord** (official; entry needs the short developer test in the Brainstorm.Pi app).
- **X** with #PiNetwork, and the fan Discord (discord.me/pinetwork, unofficial, 1.4k members; treat DMs as
  impersonators, never share seeds).
- Pi's Staked DMs cost Pi to send; do not DM strangers, let them come to the post.

**The post (no dashes, no exclamation points; honest about what it is):**
> TUMBLE is a cozy sock matching game, already on Google Play. We are bringing it to Pi and need five Pioneers to
> try the Testnet copy so Pi will give the app its wallet. Open this in Pi Browser, sign in with Pi, play a Load:
> https://tumble-test.lucidwinds.com/ . Everyone who signs in gets a little test Pi from the app as a thank you,
> and your name goes in the game's credits if you want it there. Sky Wolf Studio.

**Realistic timing:** the function is an evening's work; the five sign ins depend on the posts (a day or two); the
Mainnet app wallet grant is Pi's clock (unknown); then the listing application, also Pi's clock. Links to the game
itself do not wait: tumble.lucidwinds.com and https://tumble9745.pinet.com already work as the free demo.
