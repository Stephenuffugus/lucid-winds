# Lucid Winds: three things to build before strangers arrive (Fable, 12 Nov 2026)

Designs for S1 (the shared map), G1 (guest first) and R8 (account deletion), named in
`LUCID_WINDS_HUB_BUILD_PLAN.md` and `LUCID_WINDS_PUBLISH_PLAN.md`. Each WAITS ON STEPHEN'S YES. Each is its own
Opus session under the laws at the top of the build plan. Line numbers are `index.html` on 12 Nov.

## S1. The shared map

**Today.** `firestore-rules-8.txt:485`: a signed in client may create a wild drop with any hash, and any signed
in client may delete any drop. The client writes drops directly: 5 creates (`:55894 :55965 :56304 :59789
:59794`), 3 deletes (`:53176 :55892 :94606`), 4 updates (`:55482 :56005 :58600 :60144`). No function exists
for the wild.

**What can be stopped, honestly, in two tiers.**
- *Tier 1, griefing (small, do first).* One player must not be able to wipe the map or tamper with another's
  plant.
  - `harvestWildPlant({dropId, lat, lng})`: the only way to remove a drop that is not yours. Checks: not your
    own, within range of the drop, the daily harvest cap, the defender's game result if one is set. Deletes
    the drop and writes the owner's reward to `pendingRewards` in one transaction.
  - `dropToWild({hash, lat, lng, zone, defenderGame})`: checks the daily drop cap (3, plus prestige) and the
    700 m and per zone limits on the server, then creates the drop.
  - Rules after both ship: `create` and `delete` on `wildDrops` become `if false` for clients except an owner
    deleting their own; `update` stays as it is (identity fields are already frozen).
  - GPS sent by a client can be faked. Tier 1 does not solve that; the caps bound the damage.
- *Tier 2, forged plants (larger, later).* A hash decides a plant's traits, and anyone can search hashes for a
  Cosmic. Only a `mintLog` row proves a plant was earned. But gift plants, bred plants and signed out mints
  are made on the client today and have no row. So "only mintLog plants may be dropped" has to wait until
  breeding and the gift mint are server issued (`breedPlant` is already on the migrations list). Until then a
  forged plant can still be planted; with Tier 1 in place it can no longer be used to destroy anything.

**Order of release (this matters).** Old clients stay cached on phones. Ship the two functions first. Ship the
client that calls them next, bump `LW_VERSION` and the service worker cache. Close the rules a week later, so
no working phone is locked out mid game.

**Stephen's part:** the functions deploy, then the rules deploy, a week apart.

## G1. Guest first

**Today.** The gift plant sits behind name, email and password (`createUserWithEmailAndPassword` at `:75159`
in onboarding; `:52069 :52126 :52189` in the Identity Terminal).

**The change.** "Claim this plant" signs the player in anonymously (`signInAnonymously`). An anonymous player
has a uid, and every rule and function checks only the uid, so the existing hydration path, the vault, the
server mint and the earn caps all work unchanged. Saving the garden later uses `linkWithCredential` with an
email credential: same uid, nothing migrates.

**Rules of the house for guests.**
- A guest can play, earn, mint, breed and tend. Anything that touches another player or money needs a saved
  account: wild drops, gifts and friends, purchases.
- The save prompt appears in three places: a quiet chip in the top bar, once after the first real mint, and
  at the door of anything in the line above.
- The Pioneer number is assigned when the account is saved, never at the anonymous sign in, or guests burn
  the sequence.
- "Already have an account? Sign in" stays. Signing in from a guest garden with more than one plant warns
  that the guest garden will be left behind. No merging in this version.
- Two GA4 events, `guest_start` and `guest_saved`, so the funnel can be read before and after.

**Stephen's part:** turn on the Anonymous provider in the Firebase console (one minute). Decide whether
unsaved guest accounts are cleared after 30 days.

**Risk, stated plainly:** guest accounts are free to make, so anything a new account is given can be farmed.
The server caps are per account (30 mints a day). Keeping guests away from gifts and the map is what stops a
farm from paying out.

## R8. Account deletion and the Play rail

- **`deleteAccount` (callable).** Requires a fresh sign in. Deletes, for the caller's uid: `vaults/{uid}` and
  every subcollection, `profiles/{uid}`, `friends/{uid}` with its `connections` and `inbox` and the matching
  rows on the other side, owned `friendCodes`, `referrals`, every `wildDrops` row with that `ownerUid`,
  `mintLog/{uid}`. Payment records (`piTransactions`, `webOrders`) are kept as the law requires with the uid
  replaced by a hash. Last, the auth user. Idempotent, so a retry after a failure is safe.
- **In the app.** Settings, "Delete my account": type DELETE, enter the password, done; then sign out, clear
  local storage, return to the first screen. Settings itself needs a visible way in (the audit found none).
- **On the web.** `legal/delete-account.html`: the steps above and an email fallback. Its address goes in the
  Play Console's data deletion field. `legal/privacy.html` gains the link and names Stripe and NOWPayments.
- **The Play rail.** One test for "running inside the Play wrapper" (the one Shutterbug's `twa_ready` uses),
  one body class, and every price, payment button and tip jar hidden under it. v1 sells nothing on Play.

**Stephen's part:** the functions deploy; later, the Play Console fields.

## What each costs, roughly
S1 tier 1: two functions, twelve call sites, one rules change. The largest of the three.
G1: one sign in call, one link flow, three prompts, a few gates. Medium.
R8: one function, one settings screen, one web page, one rail. Medium.
None of them changes the economy table in CLAUDE.md.
