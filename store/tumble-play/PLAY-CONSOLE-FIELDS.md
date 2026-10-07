# TUMBLE, Google Play Console field sheet (reordered 7 Oct 2026 to the Console's own checklist)

**His call, 29 Sep: TUMBLE goes to Google Play the moment Pixel Petri clears review.** Every field the Console asks for,
in the order the Console's "Set up your app" checklist lists them (his paste, 7 Oct, memory `reference_play_console_setup_order`), with the answer to paste or tick. Rebuilt from the 23 Sep sheet after the 29 Sep readiness
check (wf_fa79ef28-584) found it thinner than Pixel Petri's (`/workspaces/tw-listing/store/play/PLAY-CONSOLE-FIELDS.md`)
and partly stale. Fields that are his alone are marked **STEPHEN**. The copy to paste is in `PLAY-LISTING.md`.
**Refreshed 4 Oct (the lead), the day Pixel Petri was published:** the menu names are the ones from the Pixel Petri
submission; where the screen differs, trust the screen and send the lead a screenshot of the left menu (never hunt).
Every picture and the listing text download on any device from `https://lucidwinds.com/store/tumble-play/<file>`.

Package `com.skywolfstudio.tumble` (can never change after the first upload). Version 1.0.0 (versionCode 1), targetSdk
36. The app is a Trusted Web Activity of `https://lucidwinds.com/satellites/tumble/`, so the live web build IS the app:
every later Tumble deploy reaches Play players with no upload.

## ⚡ Quick copy (the values asked for more than once)

| Field | Value |
|---|---|
| Package name | `com.skywolfstudio.tumble` (fixed in the app file; can never change after the first upload) |
| Privacy policy URL | `https://lucidwinds.com/satellites/tumble/privacy.html` |
| App name | `TUMBLE: Sock Sorting` |
| Contact email | stephen@skywolfstudio.com |
| Website | `https://lucidwinds.com/portal/` |
| Price | `0.99` USD |
| Release name | `1.0.0 (1)` |
| Sign in details / App access | All functionality is available without any special access (no login) |

## ⛔ FIRST LINE, before anything else: the account

**STEPHEN.** Open the Play Console home page and read every banner at the top before you touch Send for review. If
anything says the developer account or its profile is **"no longer verified"**, **"action required"**, or asks to
verify an identity, an address or a phone, **stop there** (START-HERE: "do not submit apps while unverified"). Also look
at what Play shows publicly as the developer address and phone: Flock the World's public page shows a street address
and a phone, they come from the account, and TUMBLE's page will show the same ones. The home address item is still
open on the board. Everything below up to step 8 can be filled in and saved as a draft while you wait.

## ⛔ Blockers before Send for review (not Console fields, but the review fails without them)

1. ✅ **DONE 29 Sep (Tumble `20260929a` live; read back again 4 Oct 13:59 UTC): the Tumble web fix.** `sw.js` must precache the three.js
   BufferGeometryUtils module (imported since 23 Sep, never stored, so an airplane mode cold launch can stall on the
   boot screen), the privacy page must stop saying the game makes no other network requests (the radio streams his
   songs), and the offline probe must cut the CDN and font hosts for real and pass on the stamp being submitted.
   Deployed and read back live before step 8.
2. **assetlinks with Google's key.** The lead runs `bash store/tumble-play/assetlinks-tumble.sh '<what he sent>' --push`
   (built on origin/main without a checkout; tested 4 Oct with a dummy key, refuses a paste holding no new key). After step 7, Google's app signing SHA-256 goes into the `com.skywolfstudio.tumble`
   entry of `/.well-known/assetlinks.json`. ⛔ Make that edit on top of **origin/main's** file (the working branch's copy
   lacks Pixel Petri's entry): after the deploy the live file must still list three packages, flocktheworld (2 keys),
   pixelpetri (3) and tumble (2, or 3 with the debug key for step 9), read back bare and with `?r=$RANDOM`. Without
   Google's fingerprint live the app from Play opens with a browser URL bar, the classic rejection.
3. **The account banner** (the first line above).
4. **The package registration (STEPHEN).** Every Play app must be registered for Android developer verification (he
   confirmed Pixel Petri and Flock the World on 27 Sep). TUMBLE is a new package: after Create app, read its status on
   the Console home page and register it if asked, before Send for review. Read the status from the screen; nobody here
   knows the exact menu path.

## 0. Before the listing (Setup, already done for FTW)

| Field | Value |
|---|---|
| Account | Organization, Developer ID 5511621967707579601, payments profile attached (FTW sells through it). ⛔ The PERSONAL bank is still on the payments profile (the Huntington numbers had not come): swap to the LLC account before the first payout, about 15 Oct |
| Developer name shown on Play | Sky Wolf Studio |
| Contact email | stephen@skywolfstudio.com (the studio address, never the Gmail) |

## 1. Home → Create app

| Field | Value |
|---|---|
| App name (30 max) | **`TUMBLE: Sock Sorting`** (20; his call 23 Sep; plain "Tumble" collides). The 30 character cap is exact: one stray space and the field will not save |
| Default language | English (United States) |
| App or game | Game |
| Free or paid | **Paid**, $0.99 (his call, final 23 Sep). A paid app can later become free; a free app can never become paid |
| Declarations | Developer Program Policies: agree. US export laws: agree |

## 2. Release → Production → Create new release (the upload)

| Field | Value |
|---|---|
| App signing | **Use Google-generated key** (Play App Signing). Never upload a keystore to Google. We keep only the upload key (`~/.tumble-keys/`, alias upload, SHA-256 `B3:D8:89:29…82:C3`) |
| App bundle | **`tumble-1.0-upload-signed.aab`** from the PRIVATE vault release `vault-20260923-tumble-upload` on `Stephenuffugus/lucid-winds-vault` (1,852,872 bytes, sha256 `a6dbefac…2344`, checked 29 Sep), or the download link the lead gives him. ⛔ **NEVER** `store/tumble-play/twa/app-release-bundle.aab`: that one is DEBUG signed (`6A:6F:A0:7B…CE:70`) |
| Release name | `1.0.0 (1)` |
| Release notes (en-US) | the block in `PLAY-LISTING.md` (143 of 500 characters, no dashes) |
| Then | **Save. Do not send for review yet.** |

⛔ Make ONLY this Production release (plus Internal testing if you take the route below). Pixel Petri picked up a stray
Open testing release on 25 Sep: harmless, but never start a rollout on one.

Optional and safer: put the same bundle on **Internal testing** first, add his own Gmail as a tester, install from the
Play link on the Pixel, cold launch in airplane mode, then promote the same build to Production.

## 3. Let us know about the content of your app (Policy → App content)

| Section | Answer |
|---|---|
| Privacy policy | `https://lucidwinds.com/satellites/tumble/privacy.html` (the corrected page, live after blocker 1; the address must be readable in the SERVED page, not rewritten by Cloudflare) |
| Sign in details (the Console's name for App access) | **All functionality is available without special access** (no login; the tester gate has been off since 20260923l, checked live 29 Sep) |
| Ads | **No**, the app does not contain ads (no ad SDK, no ad code) |
| Content rating | the IARC questionnaire, answers in the next section |
| Target audience and content | **STEPHEN**, the section after next |
| Data safety | **Collects: No. Shares: No.** The two follow up questions (encryption in transit, deletion requests) are skipped when nothing is collected. The preview must read "No data collected" and "No data shared". Evidence: the game's own files, and his songs when the radio is on, come from lucidwinds.com; three.js and Rapier come from cdn.jsdelivr.net and the two typefaces from fonts.googleapis.com and fonts.gstatic.com; none of these requests carries anything about the player; no analytics, no crash reporting, no accounts, no ads, no purchases, no location, camera or microphone; the save stays in IndexedDB and localStorage on the phone. Sharing a sock or a Daily score happens only when the player taps Share and goes through the phone's own share sheet |
| Government app | No |
| Financial features | None of these |
| Health | None of these |
| News app | No |
| Advertising ID | **No**, the app does not use the advertising ID (the merged release manifest declares only androidx's own `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`) |
| Anything else the dashboard lists (photo and video, foreground service, exact alarms, full screen intents) | No / not used |

### Content rating (IARC), category Game. Honest answers, checked against the live build on 29 Sep

| Question | Answer | Why |
|---|---|---|
| Violence | No | socks, a basket, a laundry room; nothing is hurt |
| Blood or gore | No | none in the code or data |
| Fear, horror | No | "ghost", "smoke" and "dead" appear only as colour names (ghost white, smoke grey, dead leaf brown); the Cursed pack is jokes like "The Third Sock" and "Slightly Warm Still" |
| Sexual content, nudity | No | |
| Language | No | a scan of every data string found no profanity |
| Controlled substances (drugs, alcohol, tobacco) | No | none in the data |
| Crude humor | No (his to confirm) | the jokes are office and family ones ("Someone's Yogurt, Ancient", "Reply All at 4:58", "A Sloth Doing Taxes"), not bathroom humour |
| Gambling, simulated gambling | No | no wagering; coins and pocket finds turn up in the wash for free, and the Daily board is a score list |
| Users interact or share content | No (confirm the wording in the Console) | there is no chat, no account and no channel between players; the two Share buttons hand a link or a picture to the phone's own share sheet at the player's tap |
| Shares location | No | |
| Digital purchases | No | nothing is sold inside the game (the $0.99 is the Play price, not an in app purchase) |
| Unrestricted internet access | No | there is no link out of the game |

Expected: Everyone / PEGI 3. A guess until the questionnaire returns it (FTW's sheet predicted Teen and it came back E10+).

### Target audience and content (**STEPHEN**)

His call (23 Sep): **13 and over**, the same as FTW; under 13 brings in the Families policy. The design audience is
adults (DESIGN.md: "adults, cozy-game crowd") and the humour is adult (the office kitchen, taxes, uncles).

The Console then asks whether the store listing could **unintentionally appeal to children**. The honest answer for
TUMBLE is **Yes**: bright cartoon socks with faces, "Dinosaur on a Lawnmower", "Hot Dog Astronaut", "Raccoon Eating
Fries", "UFO Abducting a Cow", a cat in the room, kid size socks. Answering No would be the misrepresentation the
target audience policy removes apps for, and that risk sits on the one account that holds FTW and Pixel Petri. What Yes
brings: Google reviews the listing and may move the app into Families or ask for changes. The technical side already
holds (no ads, no identifiers, nothing collected, no link out); the two remaining questions a strict reviewer could ask
are the third party font and CDN requests (self hosting them is an optional web deploy) and the Families "webview"
clause (a TWA is Chrome showing our page; our case is that the page IS the game, installs its own worker and plays
offline). Only the Console shows its own reaction to the answer.

## 4. Manage how your app is organized and presented: select an app category and provide contact details (Store settings)

| Field | Value |
|---|---|
| App category | Games → **Puzzle** |
| Tags (up to 5, from the Console's own list) | Puzzle, Casual, Relaxing, Single player (take the nearest names the list offers; add Offline only if that tag exists) |
| Email address | stephen@skywolfstudio.com |
| Phone | leave empty |
| Website | optional: `https://lucidwinds.com/portal/` |
| External marketing | **STEPHEN** (FTW: on) |

## 5. Set up your store listing (Main store listing)

| Field | Value |
|---|---|
| App name | the name from step 1 |
| Short description (80) | `PLAY-LISTING.md` (76 characters) |
| Full description (4000) | `PLAY-LISTING.md`, the fenced block pasted as it is (2,540 characters; one line per paragraph, Play keeps newlines) |
| App icon 512 x 512 | `store/tumble-play/play-icon-512.png` (32 bit RGBA, full bleed, opaque, 89.6 KB; Play rounds the corners itself. `node satellites/tumble/tools/make-icons.mjs --store` makes it from the sock engine) |
| Feature graphic 1024 x 500 | `store/tumble-play/feature-graphic-1024x500.png` (24 bit, no alpha; = `feature-C.png`, reshot 29 Sep) |
| Phone screenshots | `store/tumble-play/play-shot-1.png` to `-5.png`, 1080 x 1920, in that order (reshot 29 Sep on 20260929a; shot 5 is his call, `PLAY-LISTING.md`) |
| Tablet screenshots | skip for launch (optional) |
| Video | none |

## 6. Set up pricing: create a merchant account, set the price of your app

| Field | Value |
|---|---|
| Create a merchant account | Already done for the account: the payments profile (Developer ID 5511621967707579601) sells FTW and Pixel Petri. Nothing to create for TUMBLE |
| Price | **$0.99 USD**, let Play convert to local prices |
| Countries or regions | All available (FTW went to 172) |
| Devices | Phones and tablets (Chromebooks may stay on). Not Wear, TV or Auto |
| Managed Google Play | No |

## 7. After the first upload: Protected with Play → Play Store protection → Play app signing

(The path he found for Pixel Petri on 27 Sep; Google's help calls the page "Play Store distribution". Not there? Send the
lead a screenshot of the left menu.) The page shows the **App signing key certificate SHA-256** (Google's key, there
after the first upload) and a **Digital Asset Links JSON snippet**: copy the snippet, or just the SHA-256, and send it to
Claude. It goes into assetlinks beside the upload fingerprint (blocker 2), is deployed and read back. If the bare URL still
serves the old file after the deploy, purge the site cache in hPanel.

## 8. Publishing overview → Send for review

Only when all four blockers are clear: the account has no banner, the web fix is live and read back, assetlinks with
**Google's** fingerprint is live bare and with `?r=`, and the package shows as registered. Managed publishing: off. Play
review took 3 days for FTW (sent 14 Sep, live 17 Sep) and 9 for Pixel Petri (sent 25 Sep, published 4 Oct). **One app in review at a time** (his cadence, 29 Sep).

## 9. Optional, before step 8: the sideload test on the Pixel

`store/tumble-play/twa/app-release-signed.apk` is signed with the throwaway DEBUG key (`6A:6F:A0:7B…CE:70`), which is
NOT in assetlinks: sideloaded as it stands it opens with a URL bar and looks broken. For the test, add that debug
fingerprint to the tumble entry in the same origin/main based edit as Google's key (blocker 2). Then: no URL bar; the
splash then the room; a cold launch in airplane mode after one online run; the Back button; Export save.

## 10. After approval

Install from Play on the Pixel and check it opens full screen with no URL bar. From then on **every Tumble deploy
reaches paying players at once.**
