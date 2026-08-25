# Flock the World — Google Play pre-flight (drafted 2026-08-25)

Companion to `CROSSCHECK-PLAY-AUG22.md` §5 (the bubblewrap runbook) and
`scripts/twa_ready.mjs flock-the-world` (all 10 gates GREEN as of Aug 25).
Everything checkable below is enforced by that gate script — re-run it after
any change rather than trusting this file.

## ⛔ TWA = wrapper around the LIVE URL

Whatever is on `lucidwinds.com/satellites/flock-the-world/` IS the app.
The portal exit (which can reach the portal's Stripe checkout) is disabled at
runtime via the `inTWA` guard on `SWS_EXIT` and the menu button — a policy
boundary, not CSS. The gate script asserts it.

## Verified facts (all enforced by twa_ready.mjs)

- No Stripe/payment surface, no ad SDK, no analytics, no sign-in wall.
- Offline: sw.js shell (`ftw-*` caches only, nav no-cache + 8s timeout +
  real offline response); cold-launch offline PROVEN by `_offline_check.mjs`.
- Storage: localStorage only (`ftw_run/recs/co/mute/seen/tips/playlist` +
  `ftw_guide_done`). Nothing transmitted anywhere.
- manifest.webmanifest: scope `./`, standalone, #05070b, icons 192/512 +
  maskable. `_twa_manifest_check.mjs` green.

## Data Safety form answers

- Does your app collect or share any of the required user data types? **No.**
- Is all of the user data collected by your app encrypted in transit? **N/A
  (nothing is collected).**
- Do you provide a way for users to request that their data is deleted?
  **N/A** (nothing leaves the device; clearing site data deletes everything).
- Privacy policy URL:
  `https://lucidwinds.com/satellites/flock-the-world/privacy.html` (live, 200).

## Content rating questionnaire — expect a maturity note

Political satire about surveillance capitalism. Honest answers:
- Violence: references to crackdowns, riots and (text-only) a strike whose
  coordinates were a school — described, never depicted. No gore, no
  depictions of violence; the art is object icons and map abstraction.
- No sexual content, no gambling with real money, no drugs, no user
  interaction/chat, no location sharing, no personal info collected.
- The player embodies the villain and the framing is explicitly critical
  (the menu names the civilians innocent; loss screens celebrate them).
  Expect Teen / PEGI 12-ish for "mild violence / political themes".

## Listing copy (draft — Stephen's voice check before pasting)

**Title:** Flock the World
**Short description (80 chars max):**
"Plague Inc for the surveillance state. Play the parasite. The world fights back."
(79 chars)

**Full description:**
You are the vendor. One camera on a free trial, then contracts, capability
and fear until nothing moves unrecorded. Buy the media, arm the police,
write your own oversight, manufacture the emergency and sell the response.

The civilians in this game are innocent, and they are not passive. They map
your cameras, wear masks, swap plates, encrypt everything, cop-watch your
crackdowns, unmask your provocateurs, and run prebunking workshops against
your narratives. Every tactic they use is real. Violence radicalizes them
permanently. They remember.

- A real world map, watched country by country
- Four win doors that demand four different empires: total coverage, the
  grateful world, nothing moves, too big to ban
- Three operations (Contractor, Deep Partnership, Crisis Engine), three
  resistance levels
- Hidden synergies, a rotating desk of dirty offers, a foreign desk whose
  ledger comes due
- Satire played from the villain's chair: see how the machine works from
  the inside. That's the point.

No ads. No purchases. No accounts. Nothing collected. Works offline.

## Assets (in this folder)

- `feature-graphic-1024x500.png` — draft (tagline "PLAY THE PARASITE. THE
  WORLD FIGHTS BACK." — Stephen may swap)
- `play-shot1-menu.png`, `play-shot2-map.png`, `play-shot3-world.png`,
  `play-shot4-ending.png` — 1080x1920 phone screenshots (staged states,
  honest UI)
- Icon: `satellites/flock-the-world/play-icon-512.png` (full-bleed; Play
  rounds its own corners)

## Still Stephen-only

Play Console account (org, D-U-N-S), $25 fee, keystore (backed up OFF the
codespace), `/.well-known/assetlinks.json` on the host, `bubblewrap init
--scope ./`, cold-launch test on a real phone, price/free decision
(plan said FTW = the $1 title; Play pricing is separate from Steam's).
