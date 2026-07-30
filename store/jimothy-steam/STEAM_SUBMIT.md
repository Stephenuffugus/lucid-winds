# Jimothy on Steam — how the submission actually works, and when

Written Jul 30 2026, the day the $100 Steam Direct fee cleared. Two Valve rules
set the whole schedule, and they run at the same time, so nothing here is
sequential the way it first looks.

## The two clocks

1. **30 days from the day you paid the fee** before your first product may
   release. Paid Jul 30, so the earliest possible release is **Sat Aug 29**.
2. **14 days of a publicly visible Coming Soon page** before release. That clock
   only starts when Valve *approves* the store page, not when you write it.

Both must be satisfied, plus two separate approvals: the store page and the
build. They are reviewed independently and you can be waiting on one while the
other is done.

## The realistic schedule

| When | What | Whose |
|---|---|---|
| now | Activate the app credit, name the app, get the **App ID** | Stephen |
| now | Finish tax questionnaire + bank details (2 to 7 business days to clear) | Stephen |
| now → Aug 6 | Capsule art set + screenshots + trailer | Stephen art, me for shots |
| ~Aug 6 (Thu) | Store page filled in, "mark as ready for review" | me, then Stephen submits |
| ~Aug 12 (Wed) | Valve approves store page → Coming Soon goes public, wishlists start | Valve |
| ~Aug 12 | Upload build via SteamPipe, mark ready for review | me |
| ~Aug 17 | Build approved | Valve |
| Aug 26 (Wed) | 14 day Coming Soon clock satisfied | — |
| Aug 29 (Sat) | 30 day fee clock satisfied | — |
| **Tue Sep 1** | Press the green Release App button | Stephen |

Sep 1 is the earliest sane date. Valve's store review is stated at 3 to 5
business days and they ask for 7 days of slack, so every date above is a target,
not a promise. Slipping the store page a week slips launch a week; slipping the
build does not, as long as the build clears before Aug 29.

Wishlists are the reason to get the Coming Soon page up early rather than
perfect. It can be edited after approval. Two extra weeks of wishlists is worth
more than a better first draft.

## What blocks me right now

**The App ID.** Everything on the technical side keys off it: the depot id, the
SteamPipe config, the upload. The credit can only be activated by the Steam
account that paid, so it has to be you. It takes about two minutes:
partner.steamgames.com → your dashboard → the unused app credit → name it
`Jimothy the Jumping Nugget`. Send me the number.

## The build is packaged and ready

`dist/win-unpacked/` is the folder Steam wants. Built and verified Jul 30:

- `Jimothy the Jumping Nugget.exe` plus the Electron runtime, 493 MB
- the whole game inside `resources/app.asar`, 239 MB, nearly all costumes
- proven to boot and play a real Adventure level **with the network switched
  off** (see VENDORED.md)

Steam takes an unpacked folder, not an installer, which is why the build target
is `dir`. Do not zip it.

### Two honest gaps in the exe

- **No icon and no version metadata are embedded.** Setting those on a Windows
  exe needs `rcedit`, which needs wine, which this Linux box does not have. It
  is cosmetic: Steam shows your capsule art everywhere a player looks, but the
  taskbar and the raw exe show the default Electron atom. Fixed either by
  installing wine here or by running `npm run dist:win` once on a Windows
  machine, and it needs an `.ico` that does not exist yet anyway. Add it to the
  art list.
- **The exe is not code signed.** Steam does not require it. Unsigned means
  Windows SmartScreen may warn on first launch outside Steam. A certificate runs
  a few hundred dollars a year. Not a launch blocker, revisit if players report
  warnings.

## Uploading, once the App ID exists

    LW_STEAM_APPID=<the number> LW_STEAM_USER=<steamworks login> ./steampipe/upload.sh

It re-vendors from the live game first, so a Steam upload can never ship a
stale Jimothy. It writes the two SteamPipe vdf files and runs steamcmd. If
steamcmd is missing it stops and prints the exact command to run with the one
in the Steamworks SDK.

Then in Steamworks: **Builds** → set the build live on the *default* branch →
**Installation → General** → add a launch option, executable
`Jimothy the Jumping Nugget.exe`, OS Windows → back to the build checklist and
mark it ready for review.

## The store page

Every field is written and paste ready in `marketing/steam-jimothy.md`: name,
short description, About This Game, features, tags, genre, system requirements,
and the honest AI disclosure that Valve now requires as a form.

Still missing, and all art: the capsule set (sizes listed in that file), at
least five 1920x1080 screenshots, and ideally a trailer. Steam weights the
small capsule hardest because it appears everywhere, and nothing survives it but
the logo and Jimothy's face.

## Commerce: fixed, and it was broken

Valve does not allow a game to take money on a rail that is not theirs, so the
Supporter Pack, the card checkout, the crypto button and all three donate
buttons have to be dark in this build.

The vendor script already had a step that *looked* like it did this. It did not.
It swapped two HTML comment markers that do not exist in the game, and set a
flag named `window.STEAM_BUILD` that nothing in the game ever read. The strip
was a no-op and the build would have gone to review with a live Stripe checkout
inside it.

Now the game has a real `STORE_BUILD` lever, the same one the itch build uses,
driven by `window.__STEAM_BUILD`, and vendor.sh asserts the flag both exists in
the game and lands before the game reads it, so it cannot silently rot again.

**The pack is granted, not hidden.** A Steam player already paid for the game,
and hiding the surface without granting would lock the pack costumes and the
soundtrack behind a button the build never draws. Grant beats hide here.
If you would rather sell the pack as Steam DLC later, say so and it changes.

**Sign in is hidden too.** Cloud sync is short circuited in the desktop build,
so the account button was a door with no room behind it. Everything on Steam
stays on the machine.

Proven by A/B: the same bundle, once with the flag and once without, driven past
the splash to the title screen. With the flag off, Support the Studio and Sign
in are both on screen. With it on, both are gone, `sw_supporter` is granted, and
the game still reaches for nothing and logs no errors.

One judgement call left to you: the title screen still has a
**◀ Sky Wolf Studios Arcade** button that opens the portal in the player's
browser. Outbound links are allowed by Valve, and it is real cross promotion,
but it does read a little odd in a store-bought desktop game. Say the word and
it hides with the rest.
