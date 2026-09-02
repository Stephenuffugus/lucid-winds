# HANDOFF P0 — Jumping Jimothy on Google Play, FREE (the account's first listing)

> Written 2026-09-02 by Fable. Runs NOW: a free listing needs no merchant profile, and
> Stephen wants the first Play title free. FTW ($1) follows as P1 once the payments
> profile exists. Branch `add-sproing-jumper`. **Never main.**

## Why Jimothy first

The Play account is approved and empty. The first listing is the one that teaches us the
Console (Data Safety, content rating, the testing track, the assetlinks handshake) on a
title that costs nothing if a reviewer bounces it. Jimothy is free on lucidwinds.com and
on itch, it already has a store kit (`satellites/stream-hop/store-listing/STORE-KIT.md`:
copy, feature graphic 1024x500, four 1080x1920 shots), a manifest and a service worker.
FTW is the paid one and its P1 prompt (HANDOFF-SEP02.md) is ready; it waits on the
merchant profile and a price, not on code.

## What is red today (measured, `node scripts/twa_ready.mjs stream-hop`)

```
 ⛔ portal exit is disabled inside a TWA   — SWS_EXIT has NO inTWA guard
 ⛔ no sign-in wall                        — the regex hits a firebase.auth string; find it
 ⛔ has its own privacy policy page        — the root one is titled for Lucid Winds
 ⛔ manifest is bubblewrap ready           — run scripts/_twa_manifest_check.mjs satellites/stream-hop/manifest.webmanifest
 ⚠  cold launches offline                 — did not run; needs python3 -m http.server 8777 at repo root
```

Plus the thing the gate does not measure: Jimothy's menu carries **Support the Studio**
(`#sup-buy`, `#sup-donate`, `#sup-d5/10/25`). Inside a Play-installed app that is a
payment surface outside Play Billing, which is the policy that pulls listings. It must be
unreachable inside the TWA (the `inTWA` guard, same as the portal exit), not merely hidden.

## THE PROMPT (paste into a fresh Opus terminal)

```
You are packaging JUMPING JIMOTHY (satellites/stream-hop) as a FREE Trusted Web
Activity for Google Play, in the lucid-winds repo, branch add-sproing-jumper.
Read first, in this order: store/jimothy-play/HANDOFF-P0.md (this brief),
CROSSCHECK-PLAY-AUG22.md sections 2, 4, 5, satellites/stream-hop/store-listing/
STORE-KIT.md, scripts/twa_ready.mjs, scripts/_twa_manifest_check.mjs,
scripts/_twa_boundary_check.mjs, and HANDOFF-SEP02.md task P1 (the FTW version
of this job; copy its shape). The TWA wraps the LIVE URL
https://lucidwinds.com/satellites/stream-hop/ ; whatever is live IS the app.

Inputs from the Director (STOP and write the question at the top of
store/jimothy-play/PLAY-CONSOLE-FIELDS.md if missing): package name
(recommend com.skywolfstudio.jumpingjimothy), and whether he enrols in Play App
Signing (recommend YES: Google holds the signing key, the upload key is
recoverable, and the assetlinks fingerprint comes from Play Console after the
first upload, so nothing has to be generated on his machine before you start).

Build, one commit each, git pull --rebase before each:
1. GATES GREEN. Start python3 -m http.server 8777 at the repo root, run
   node scripts/twa_ready.mjs stream-hop, and fix every red gate's CAUSE in
   satellites/stream-hop/ (fence extended for exactly that): the inTWA guard on
   SWS_EXIT AND on the Support the Studio surface (unreachable, not hidden;
   _twa_boundary_check.mjs must prove both), the privacy page
   (satellites/stream-hop/privacy.html, Jimothy's own, no Lucid Winds), the
   manifest fields bubblewrap needs (scope ./, start_url ./, display standalone,
   orientation portrait, 192 and 512 maskable icons, theme and background
   colours), and whatever the sign-in regex hit. Paste the ten green lines.
   ⛔ A green gate you did not watch fail is decoration: for each fix, show the
   red line before and the green line after.
2. BUBBLEWRAP. Install the JDK and Android SDK it asks for under /tmp (the
   workspace disk has ~4 GB; /tmp has room). bubblewrap init --manifest
   https://lucidwinds.com/satellites/stream-hop/manifest.webmanifest (the LIVE
   one; if it is not live yet, say so and stop: Fable deploys), portrait, the
   package name above. Strip every permission except VIBRATE from the generated
   AndroidManifest.xml. bubblewrap build, signed with an UPLOAD key you generate
   and name store/jimothy-play/UPLOAD-KEY-NOT-IN-GIT (gitignored; print its
   SHA-256 fingerprint into BUILD.md so the Director can enter it in Play App
   Signing). Commit the twa project under store/jimothy-play/twa/ with NO
   keystore, and the recipe as store/jimothy-play/BUILD.md. Put the .aab in the
   vault release (reference_lucid_winds_vault in memory says how), never in git.
3. ASSETLINKS. Write .well-known/assetlinks.json at the repo root with the
   package name and a PLACEHOLDER fingerprint clearly marked, plus the exact
   line the Director replaces once Play Console shows the app signing
   certificate. Add a gate to twa_ready.mjs that fetches the LIVE
   https://lucidwinds.com/.well-known/assetlinks.json and checks content type
   application/json, HTTPS, no redirect, and that the fingerprint is not the
   placeholder. It must be RED today. Fable deploys.
4. store/jimothy-play/PLAY-CONSOLE-FIELDS.md: every Play Console field in text,
   from STORE-KIT.md: app name, short and full description, category (Games /
   Arcade), contact email, privacy policy URL, Data Safety answers (no data
   collected, no third party sharing: verify by grep that nothing in the app
   phones home; the feedback form posts to our endpoint, so either the inTWA
   guard removes it or Data Safety declares it), content rating questionnaire
   answers, price FREE, countries all, ads declaration NO, target audience.
   Mark the fields only the Director can answer. No dashes anywhere in copy.
   The brand is "Sky Wolf Studio", singular.
5. SCREENSHOTS. Verify the four in satellites/stream-hop/store-listing/ are
   1080x1920 and honest (a state a player can reach). Regenerate any that is
   not. Open them. Write three things wrong before fixing.

RULES: FILE FENCE store/jimothy-play/**, .well-known/assetlinks.json,
scripts/twa_ready.mjs, and satellites/stream-hop/ ONLY for a red gate's cause
(say which gate for each file). No tip jar, no external payment link, no
Stripe surface reachable inside the TWA. Nothing installs on a phone from
here: the cold launch in airplane mode is the Director's. git add only the
fence; never -A; never push to main. Report: the exact order of clicks in Play
Console, with the file to paste from at each one, and the three things only
the Director can do.
```

## After Opus lands it

Fable diffs it, runs `twa_ready.mjs stream-hop` alone, opens the screenshots, deploys the
privacy page and assetlinks to main, and checks the live assetlinks gate turns green.
Then Stephen: Play Console → Create app (free, game) → upload the .aab to **Internal
testing** first → paste the fields → content rating → Data Safety → submit. First
review on a new account is typically days, not hours.
