# Flock the World, Google Play Console field sheet (Sep 05 2026)

Every field the Console asks for, in the order it asks, with the text to paste. Three fields
are yours alone and are marked **STEPHEN**. Everything else is copied straight from
`PLAY-LISTING.md` and the game.

## Before the listing (Console → Setup)

| Field | Value |
|---|---|
| Account type | Organization (D-U-N-S on file). Paid apps need the **merchant profile**: Setup → Payments profile. **STEPHEN** |
| Developer name shown on Play | Sky Wolf Studio |
| Contact email | **STEPHEN** (the studio address, not personal) |

## Create app

| Field | Value |
|---|---|
| App name | Flock the World |
| Default language | English (United States) |
| App or game | Game |
| Free or paid | **Paid**, $0.99 USD (the plan says $1; Play's nearest tier is 0.99). ⛔ Paid can never become free-to-paid later; free CAN become paid never, paid CAN become free. Pick paid now. |
| Declarations | Developer Program Policies: agree. US export laws: agree. |

## Store listing (Grow → Store presence → Main store listing)

| Field | Value |
|---|---|
| App name | Flock the World |
| Short description (80) | Plague Inc for the surveillance state. Play the parasite. The world fights back. |
| Full description | see PLAY-LISTING.md "Full description" (paste verbatim) |
| App icon 512x512 | `satellites/flock-the-world/play-icon-512.png` |
| Feature graphic 1024x500 | `store/ftw-play/feature-graphic-1024x500.png` |
| Phone screenshots (2 to 8, 16:9 or 9:16) | `store/ftw-play/play-shot1-menu.png` … `play-shot4-ending.png` (1080x1920) |
| Tablet screenshots | optional, skip for launch |
| Video | none |
| Category | Games → Strategy |
| Tags | Strategy, Simulation, Single player |
| Contact email | **STEPHEN** |
| External marketing | off |

## App content (Policy → App content), in the order the Console lists them

| Section | Answer |
|---|---|
| Privacy policy | https://lucidwinds.com/satellites/flock-the-world/privacy.html |
| Ads | No, this app does not contain ads |
| App access | All functionality is available without special access |
| Content rating (IARC) | Category: Game. Violence: **yes, mild** (text references to crackdowns, riots, a strike; nothing depicted). Blood: no. Sexual content: no. Language: no profanity. Controlled substances: no. Gambling: no simulated gambling with real money. User interaction: no. Shares location: no. Personal info: no. Expect Teen / PEGI 12 for political themes. |
| Target audience | 13 and over (do not tick under 13; that drags Families policy onto a satire) |
| News app | No |
| COVID-19 apps | No |
| Data safety | Collects: **No**. Shares: **No**. Encryption in transit: N/A. Deletion request: N/A. (Everything is localStorage on the device; `twa_ready.mjs` asserts no analytics, no ads SDK, no sign-in, no payment surface.) |
| Government apps | No |
| Financial features | None |
| Health | None |
| Advertising ID | No, the app does not use the advertising ID |

## Pricing and distribution (Monetize → Products → App pricing)

| Field | Value |
|---|---|
| Price | $0.99 USD, let Play convert (round to local tiers) |
| Countries | All available |
| Distribute to | Phones and tablets. Not Wear, TV, Auto. |
| Managed Google Play | no |

## Release (Release → Production → Create new release)

| Field | Value |
|---|---|
| App signing | Use **Play App Signing** (Google holds the signing key; you keep the upload key). **STEPHEN** generates the upload keystore on his own machine, backs it up off the codespace. |
| App bundle | the signed `.aab` from `store/ftw-play/twa/app-release-bundle.aab` (see BUILD.md) |
| Release name | 1.0.0 (1) |
| Release notes | First release. Four win doors, three operations, three resistance levels. No ads, no accounts, works offline. |

## After the first upload: the one thing that makes it a real app

Play App Signing shows the **App signing key certificate SHA-256** under Release → Setup → App
signing. Paste it into `/.well-known/assetlinks.json` (the repo root file, deployed at
https://lucidwinds.com/.well-known/assetlinks.json) in place of `REPLACE_WITH_PLAY_APP_SIGNING_SHA256`
and tell Fable to deploy. Until that fingerprint is live, the installed app shows a browser URL
bar, which is the classic Play rejection. `node scripts/twa_ready.mjs flock-the-world` has a
gate for it.

## Testing track first

Upload to **Internal testing** first, add your own Gmail as a tester, install from the Play link
on your Pixel, cold launch in airplane mode. Then promote the same build to Production.
