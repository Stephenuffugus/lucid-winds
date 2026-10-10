# Fretwork on Pi Network: what is built, and his steps (10 Oct 2026, night)

His go, verbatim: "Yes absolutely build all of that and I can have Fable check the work to walk me through the
steps tomorrow". His split (from Opus's proposal, his to change): **guitar in standard tuning is free with every drill
and tool; one unlock of 8 Pi opens every other instrument and tuning, custom tunings included.**

⛔ For whoever walks him through it (Fable): **never describe a third party screen from memory** (memory
feedback_no_guessing_console_ui). Work from his screenshot or paste, one screen at a time. Below is WHAT each step
needs, with the exact values, not where to click.

## Built and live tonight (nothing here can touch the Play app)

- **SWS-apps `1badd9f`, Fretwork v10 live on skywolfstudio.com/fretwork** (hosting deployed, read back byte identical;
  a real browser on the live page: rail web, zero Pi requests, no locks, tip jar as before). `apps/fretwork/pi.js`
  turns on ONLY on `fretwork.lucidwinds.com` and `fretwork-test.lucidwinds.com` (or `?rail=pi` for a look): Pi
  sign in, `(8 Pi)` on the locked instruments and tunings, the ask in Fretwork's own card style, Pi's payment dialog,
  approve then complete through our server, the unlock remembered on the Pi account. On the Pi hosts the tip jar,
  the feedback webhook, the email link and the studio link are gone (Pi: Pi payments only, no outside exits,
  essential data only), the home line no longer says "no account", and `privacy.html` has a Pi Network section.
- **Gate** `apps/fretwork/test/pi.browser.mjs`: web untouched, outside Pi Browser locked with every exit gone, a stub Pi
  Browser signs in, buys for 8 Pi, unlocks, an owned copy opens unlocked; `--plant webleak` RED. Fretwork's own smoke
  and the fleet guards (129 checks) green.
- **Server** `functions/piGames.js`: `fretwork` and `fretwork-test` in GAMES (secrets `PI_KEY_FRETWORK`,
  `PI_KEY_FRETWORK_TEST`, Testnet seed `PI_TEST_WALLET_SEED_FRETWORK`, wallet `PENDING`), **NOT in ACTIVE** (a secret
  named in a function's options must exist before the deploy). Tumble's 82 Pi tests green. Not deployed tonight.
- **Worker** `infra/cloudflare/pi-subdomain-worker.js`: the two Fretwork hostnames, with their own origin
  (`https://skywolfstudio.com`, path `/fretwork`), keys `PASTE_...` until the portal gives them. Routing checked in
  Node (Fretwork → skywolfstudio.com/fretwork/..., Tumble and its music unchanged). **Not uploaded** (no Cloudflare
  token on this box).
- **Listing images**: https://lucidwinds.com/store/fretwork-pi/ (icon 512, three 750x1500 previews).

## His steps, in order

0. **Play first** (his ruling: Play, then the Pi copy): upload Fretwork in the Play Console from the vault package
   (https://github.com/Stephenuffugus/lucid-winds-vault/releases/tag/vault-20261009-fretwork-upload, steps in its
   README). Then send the **app signing key SHA-256** from the Console; Opus puts it in SWS-apps
   `design/play-fingerprints.json`, runs `node design/play.mjs fretwork`, deploys hosting.
1. **Pi Developer Portal (in Pi Browser): a new Testnet app "Fretwork"**, URL `https://fretwork-test.lucidwinds.com/`.
   Send Opus its **validation key** (paste is fine; it is public by design, it sits at /validation-key.txt).
2. **The Mainnet app made from that Testnet app** (the portal makes Mainnet FROM Testnet, learned 8 Oct), URL
   `https://fretwork.lucidwinds.com/`. Send its **validation key**.
3. **Cloudflare**: either paste a fresh API token (Account: DNS Edit + Workers Scripts Edit; memory
   reference_cloudflare_worker_api) and Opus attaches both hostnames to the Worker as custom domains and uploads it
   with the two keys, or paste the Worker file into the dashboard himself. Then **verify both URLs** in the portal.
4. **Server API keys** of both apps, from his own terminal (values never in chat):
   `firebase functions:secrets:set PI_KEY_FRETWORK_TEST` and `firebase functions:secrets:set PI_KEY_FRETWORK`.
5. **The Testnet app wallet**: generate it on the Testnet app (the passphrase is HIS, never in chat), set it with
   `firebase functions:secrets:set PI_TEST_WALLET_SEED_FRETWORK`, and send Opus the wallet's public address (G...).
   Opus then fills `wallet`, adds `fretwork` + `fretwork-test` to ACTIVE, adds the two Testnet secrets to
   piGameTestPay's SECRETS list, deploys the functions, and proves a sandbox sign in on fretwork-test answers.
6. **App configuration for the listing** (the refusal text of 8 Oct names all of these): development URL
   (the -test host), open the Developer guide once, Run in Sandbox once, production URL verified, Privacy Policy URL
   `https://fretwork.lucidwinds.com/privacy.html`, the listing images above.
7. **Five testers** sign into `https://fretwork-test.lucidwinds.com/` in Pi Browser (allowing the wallet address),
   Opus pays each 1 test Pi on his yes, then he applies for the Mainnet app wallet, connects it, applies for the
   listing. One post can carry all three test links (Tumble, Pixel Petri, Fretwork): a Pioneer who signs into all
   three counts for all three.
