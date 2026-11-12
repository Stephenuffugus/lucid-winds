# Lucid Winds: the path to a store listing (Fable, 12 Nov 2026)

Source: `docs/audits/LUCID-WINDS-HUB-AUDIT-2026-11-12.md`. This is a plan, not a schedule. Nothing here is built.
Stephen's order of release stands: the small paid games first (Shutterbug, then Dewball), the hub behind them
with the brand established. This page says what must be true before the hub can follow.

## The route
Google Play, as a Trusted Web Activity over lucidwinds.com, the same way the studio's other Play apps ship
(a kit under `store/<name>-play/`, an `assetlinks.json` entry, a signed bundle). The hub is already a PWA: its
manifest is in order (standalone, portrait, 512 maskable icon) and an offline relaunch boots (checked 12 Nov).
Free to install. Pi stays on the Pi listing; the web keeps Stripe.

## Gate 1: the hub is fit to be seen (repairs; `LUCID_WINDS_HUB_BUILD_PLAN.md` R1 to R7, R9, R10)
- The map works (R1). The first load is under 6 MB (R2). One popup at a time (R3).
- A signed out player sees their plants (R4). No internal files on the domain (R7).
- Desktop holds a column (R9). No text under 12 px on the main screens (R10).

## Gate 2: the hub is safe to open to strangers
- **The shared map (S1).** Today any signed in client can plant a forged plant or delete every drop on the
  map. `dropToWild` and `harvestWildPlant` move to Cloud Functions and the client rules close. This matters
  more on Pi than anywhere: money is attached and the audience is large.
- **Which rules are live.** The repo holds `firestore-rules-7.txt` and `-8.txt`. Confirm in the Firebase
  console which one is deployed and make the repo say so in one line. (Stephen, two minutes.)

## Gate 3: Play's own rules
| Rule | Today | What closes it |
|---|---|---|
| Account deletion in the app and by a web link | Email request only; a dev panel wipe | R8: `deleteAccount` function, a Settings button, `legal/delete-account.html` |
| Digital goods through Play Billing | Stripe and NOWPayments prices show everywhere off Pi | R8: a play rail that hides every price. v1 sells nothing on Play |
| Data safety form | not filled | Declare: email and name (account), precise location (only while the Wild tab is open), purchase history (web only), app activity (GA4). Not sold, not shared. Deletion available |
| Content rating | not filled | Replace the Puzzles banner first. The slot machine and mystery box spend Dew, and the server price catalog (`functions/fulfill.js`) sells slots, pouches and bundles, not Dew: confirm no product sells Dew, then answer "no real money gambling" |
| Location permission | used by the Wild tab | Foreground only; the listing and the privacy page must say why |
| Privacy policy | live at `legal/privacy.html` (28 Apr) | Name Stripe and NOWPayments, add the deletion link, use a studio contact address |
| Target audience | "not directed at children under 13" | Declare 13+ |

## Gate 4: what the Play build contains (Stephen's call 4)
Recommended: the plant loop (earn, mint, greenhouse, nursery, wild) and the dozen best portrait games. Hide:
the six landscape solitaire games until they have a portrait layout, anything marked coming soon or in
development, and the 9 studio games that still load from the GitHub address. The web hub keeps all 102.
A smaller, finished set reviews better than a large uneven one, and every hidden game can return in an update.

## Gate 5: the first five minutes (Stephen's call 2)
Guest first (G1) before the listing goes up. A store visitor who meets an email form at minute one leaves;
the same visitor with a plant in hand has something to save. Read the GA4 onboarding funnel once before and
once after, so the change is measured.

## Gate 6: the look (after Astra's round one)
- The plant defects V1 and V2 (boxed auras, invisible Constellation and Silhouette) before any screenshot is
  taken for the listing: the store shots will be plant cards.
- One style, chosen from Astra's STYLE.md, applied to the surfaces a store visitor sees first: the first
  screen, the greenhouse, a plant card, the picker.

## The store kit (`store/lucid-winds-play/`, built last)
Icon 512, feature graphic 1024x500, eight phone shots (first screen, a plant card with its haiku, the
greenhouse, a mint, the nursery, the wild map, the picker, a game), short and full descriptions, the
`assetlinks.json` entry once the signing key's SHA-256 exists. The feature graphic and the shots come from
Astra's round two.

## Stephen's part, in order
1. Yes to the repairs. A CARTO key, or the word to change provider.
2. Paste the Astra kickoff prompt (Drive: Astra / Lucid Winds Hub Round 1).
3. Look in the Firebase console: which rules file is deployed.
4. Calls 2, 4 and 6 in the audit (guest first, what the Play build holds, no purchases in v1).
5. Later: the Play Console entry, the signing key, the listing.

## What this plan does not promise
A date. The repairs are days of Opus work. S1, G1 and R8 each need a short plan of their own and a functions
deploy. The look depends on what Astra sends back and on what Stephen likes.
