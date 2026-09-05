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

## ✅ The App ID exists (2026-07-31)

    Jumping Jimothy      app 5043360
    default depot        5043361   (appid + 1, what Steamworks hands you)

Activated by Stephen the day the name was settled. `steampipe/upload.sh` now
defaults to this app id, so the upload command is just:

    LW_STEAM_USER=<steamworks login> ./steampipe/upload.sh

⛔ If Steamworks shows a different depot id on the app's Depots page, pass
`LW_STEAM_DEPOTID=<that number>` — the +1 is a convention, not a guarantee.

Nothing technical is blocked any more. What remains is the store page art and
the tax/bank verification, both below.

## The build is packaged and ready

`dist/win-unpacked/` is the folder Steam wants. Built and verified Jul 30:

- `Jumping Jimothy.exe` plus the Electron runtime, 493 MB
- the whole game inside `resources/app.asar`, 239 MB, nearly all costumes
- proven to boot and play a real Adventure level **with the network switched
  off** (see VENDORED.md)

Steam takes an unpacked folder, not an installer, which is why the build target
is `dir`. Do not zip it.



## ✅ Controller support: IN THE GAME as of Sep 05 2026 (revision 4 build)

Standard-mapping pads (Xbox, PlayStation and anything Steam Input presents as one).
In a run: D-pad or left stick hops through the same `queueHop` the keyboard uses, same
orientation (down = forward), key-repeat while held; Start or B pauses, Start resumes.
Everywhere else: the D-pad moves a gold focus ring over whatever is clickable and not
covered on screen (a hit test, so overlays such as the daily reward card just work),
A presses, B presses the nearest back/close/done. Gate: `satellites/stream-hop/test/
gamepad-check.mjs`, a fake pad driving the REAL poll loop, 11 checks.

Steamworks: Store Presence → Supported Features → tick **Partial controller support**
for now (the code redeem box still wants a keyboard; everything else is pad-driven).
Application → Steam Input: leave the default; Steam presents pads as standard gamepads.
His playtest with a real pad on the Steam build is the only test this box cannot run.

## ✅ Steam achievements: IN THE BUILD as of Sep 04 2026 (revision 3, now folded into revision 4)

26 achievements = the game's 21 badges + 5 seasonal, one API name rule
(`ACH_` + badge id upper-cased), generated table + 64x64 icon pairs in
`ACHIEVEMENTS.md` / `capsules/out/achievements/` by `python3 capsules/achievements.py`.

How it is wired: `steamworks.js` (native, main process only) behind IPC;
`preload.js` exposes `window.__steam` with `unlock` and `sync`; the game calls
`steamUnlock(id)` the moment `achCheck()` awards a badge and `steamSyncAll()` once at
boot so earlier progress is replayed. `contextIsolation` stays on. Without a Steam
client the bridge reports `on:false` and every call returns false; the game does not
know or care. Proven by `node test/electron_boot.mjs` (real shell under xvfb).

⛔ What cannot be proven here: an unlock that Steam RECORDS. That needs Steam running,
so the first real test is Stephen's: install from his own library after the build is
live, take the first hop, watch for "Silly Little Guy" in the overlay.

Steamworks order (his clicks): 1) define + Publish the 26 achievements
(ACHIEVEMENTS.md), 2) upload the revision 3 zip to the depot and set it live,
3) tick **Steam Achievements** under the app's Store Presence → features (it was
honestly unticked on Aug 21 when there were none), 4) test one unlock.
The Steam overlay (Shift+Tab) is enabled too; check it in the fullscreen playtest.

### ✅ Icon and version strings: EMBEDDED as of Sep 04 2026
`npm run dist:win` now ends with `npm run brand` (`tools/brand_exe.mjs`, pure Node via
resedit) which writes `capsules/out/jimothy.ico` and the version block into the exe.
Verified by extracting the icon group back out with `wrestool` and looking at it.
The wine route below is dead on this box (64-bit wine cannot run rcedit-ia32); the
paragraph is kept as history.

### Two honest gaps in the exe (history, first one closed Sep 04)

- **No icon and no version metadata are embedded — but the .ico now exists.**
  `python3 capsules/icon.py` builds `capsules/out/jimothy.ico` (256/128/64/48/32/
  24/16) from the same painted hero the capsules use, so the taskbar matches what
  a Steam player sees everywhere else. `build.win.icon` in package.json points at
  it.

  ⛔ **It still will not embed from this box, and the reason is not only wine.**
  `build.win.signAndEditExecutable` is `false`, which makes electron-builder skip
  the rcedit step entirely, so an `.ico` alone changes nothing. Embedding needs
  BOTH that flag true AND rcedit, which needs wine, which is not installed here.
  Do not flip the flag on Linux; it breaks the build that currently works. Run
  `npm run dist:win` once on a Windows machine with the flag on, or install wine
  here. Still cosmetic: Steam draws the capsule art, not the exe icon.

  ⛔ **The old `assets/icons/jimothy-512.png` is the wrong source for an icon**,
  even though it is lovely: it is the paper keyart, with a wordmark, a skyline and
  Mount Rainier around a small raccoon. An icon gets ONE shape, and at the 16px a
  taskbar draws that is an unreadable smudge. `icon.py` uses two crops, head and
  shoulders below 32px, and writes `icon_contact_sheet.png` so the small sizes get
  looked at instead of assumed.
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
`Jumping Jimothy.exe`, OS Windows → back to the build checklist and
mark it ready for review.

## The store page

Every field is written and paste ready in `marketing/steam-jimothy.md`: name,
short description, About This Game, features, tags, genre, system requirements,
and the honest AI disclosure that Valve now requires as a form.

⛔ **This paragraph used to say the capsule set and screenshots were missing. As
of 2026-08-01 they are not.** `capsules/build.js` generates all seven capsules at
Valve's exact sizes and `capsules/shots.js` the five 1920x1080 screenshots, both
out of art the game already ships, into `capsules/out/`. Verified by
`node capsules/preflight.js`.

**A trailer is the one store asset still genuinely missing**, and it needs
Stephen. Steam weights the small capsule hardest because it appears everywhere,
and nothing survives it but the logo and Jimothy's face.

⚖ Art direction on the capsules is Stephen's; `capsules/README.md` says they are
drafts to react to. He has since said he likes the paper style thumbnail, so do
not restyle anything without asking.

## ⛔ VERIFY THE COMMERCE STRIP AT RUNTIME, NOT BY ITS FLAG

    node store/jimothy-steam/runtime_preflight.mjs     # needs a server on :8777

`capsules/preflight.js` checks the commerce flag is present and set before the
game reads it. That is necessary and it is not sufficient: **a flag nothing acts
on passes it**, which is exactly the failure recorded below. Valve does not review
flags, they open the game and click things.

`runtime_preflight.mjs` boots the real vendored build and walks every route a
player has into the payment screen. Current result: the **web** build shows 3 of 3
doors open, which proves the check can see a door at all, and the **Steam** build
shows 0 of 3 with all three routes actually walked, no payment host contacted, and
no external request of any kind.

⛔ It reports an UNREACHED route as a failure, not a pass. "Not shown" on a screen
the run never opened is a vacuous pass and looks identical to a real one.

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
