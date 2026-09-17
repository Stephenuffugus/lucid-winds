# TUMBLE, Google Play Console field sheet (scaffold, Sep 17 2026)

Modelled on `store/ftw-play/PLAY-CONSOLE-FIELDS.md`, the sheet that took Flock the World live on Sep 17. Fields that
are Stephen's alone are marked **STEPHEN**. Nothing here is pasted until he has made those calls.

## ⛔ Blockers before any upload

1. **The workbench gate.** `satellites/tumble/index.html` loads `/dev-gate.js` on lucidwinds.com, so a Play reviewer
   (and every buyer) would meet the tester key box. The gate comes off in the same commit that goes to the store
   (HANDOFF-FABLE-TUMBLE-SEP17.md §8, his open call). Until then the TWA cannot be reviewed.
2. **Name and price**, below.
3. **The Meshy pass** is not a blocker, but the placeholder socks are what the screenshots will show; his call whether
   the listing waits for the real meshes.

## Before the listing (Console → Setup)

| Field | Value |
|---|---|
| Account | Organization, Developer ID 5511621967707579601, payments profile and Huntington bank already attached (FTW) |
| Developer name shown on Play | Sky Wolf Studio |
| Contact email | stephen@skywolfstudio.com (the studio address, as on FTW) |

## Create app

| Field | Value |
|---|---|
| App name | **STEPHEN** (see PLAY-LISTING.md; plain "Tumble" collides) |
| Default language | English (United States) |
| App or game | Game |
| Free or paid | **Paid**, price **STEPHEN**; one price across every store |
| Declarations | Developer Program Policies: agree. US export laws: agree. |

## Store listing

| Field | Value |
|---|---|
| Short description (80) | PLAY-LISTING.md |
| Full description | PLAY-LISTING.md, paste verbatim after his voice check |
| App icon 512x512 | `satellites/tumble/icons/icon-512.png` (check it is 32 bit RGBA; Play rejects 24 bit RGB) |
| Feature graphic 1024x500 | **STEPHEN** (art; none exists yet) |
| Phone screenshots | five at 1080 x 2400, PLAY-LISTING.md "Screenshots" |
| Category | Games → Puzzle |
| Contact email | stephen@skywolfstudio.com |
| External marketing | his call (FTW: on) |

## App content

| Section | Answer |
|---|---|
| Privacy policy | https://lucidwinds.com/satellites/tumble/privacy.html (in the repo; check the SERVED page shows the email) |
| Ads | No |
| App access | All functionality available without special access (once the workbench gate is off) |
| Content rating (IARC) | Game. Violence: no. Blood: no. Sexual content: no. Language: no. Controlled substances: no. Gambling: no (the slot style Daily board is a score list, no wagering). User interaction: no. Shares location: no. Personal info: no. Expect Everyone / PEGI 3. |
| Target audience | 13 and over (the same choice as FTW: under 13 drags the Families policy in; the game is fine for children but the policy load is not worth it for a one person studio) **STEPHEN** |
| News app | No |
| Data safety | Collects: No. Shares: No. (IndexedDB and localStorage on the device only; code libraries and fonts come from cdn.jsdelivr.net and fonts.googleapis.com, disclosed in the privacy page.) |
| Advertising ID | No |

## Build

Same road as FTW (`store/ftw-play/BUILD.md`): toolchain in /tmp/bw (`setup-toolchain.sh`), `twa/twa-manifest.json`
here is ready (package `com.skywolfstudio.tumble`, portrait, theme #2a2320), a throwaway debug keystore for the
sideload test, then the upload key from the vault (`vault-20260906-ftw-upload` holds FTW's; TUMBLE gets its own),
`/.well-known/assetlinks.json` gains TUMBLE's package with the Play App Signing SHA-256 after the first upload.
`node scripts/twa_ready.mjs tumble` for the static gates (payment surface, portal exit, manifest, offline).
