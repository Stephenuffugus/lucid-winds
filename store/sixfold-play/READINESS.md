# Sixfold: what stands between it and a Play release (13 Nov 2026)

Checked against sixfold room-polish c4d7a2c (the build about to go live), served as it is on a spare port. "Ran" means
the kit ran something and looked; "read" means it is inferred from the code or the docs. Most serious first. Nothing in
the game was changed; every fix belongs in the sixfold repo, then re-vendored (VENDORING.md).

## Release blockers

1. **The arcade exit walks out of the app to a checkout.** Read. The title screen's "All Sky Wolf games" calls SWS_EXIT,
   which goes to https://lucidwinds.com/portal/; the portal carries the studio's Stripe checkout. Inside a TWA that is a
   payment surface outside Play Billing, the thing scripts/twa_ready.mjs exists to catch. sixfold.src.html has no inTWA
   guard (searched). Smallest fix: the guard the other Play titles carry (detect the app by `document.referrer` starting
   `android-app://`, or a `?twa=1` start URL), hide the button and make SWS_EXIT do nothing inside the app.
2. **No PNG icons, no maskable icon, no manifest id.** Read. manifest.webmanifest lists one icon, icon.svg, `"sizes":
   "any"`, `"purpose": "any maskable"`; bubblewrap and the Play listing need PNGs (192 and 512) and a maskable 512, and
   twa-manifest.json in this kit points at icons/icon-512.png and icons/icon-maskable-512.png, which do not exist. No
   "id" field. Smallest fix: render icon.svg to those three PNGs (the art already sits inside the maskable safe zone:
   the outer nodes end 184 px from the centre, the zone is 205), list them, add `"id": "./"`. Draw the 六 into the PNG:
   the svg sets it in Georgia or Shippori Mincho, which a phone may not have when the svg stands alone (this box drew an
   empty seal until the kit loaded the web font).
3. **No privacy policy.** Read (no privacy.html in the game). Play requires one for every listing, and this app sends
   names and picks to a database. Smallest fix: satellites/sixfold/privacy.html saying what PLAY-LISTING.md's Data
   safety section says.
4. **Public duel records are kept for good, so the Data safety form cannot say data is deleted.** Read
   (src/firebase-net.js; FINDINGS.md 13 Nov says the same: "Duel nodes are never deleted"). Find a rival writes both
   names, both ratings and every pick under `sixfold/duels/<id>` and nothing removes it; friend rooms tidy themselves.
   Smallest fix: remove the public duel node after its result, the same 8 second tidy friend rooms use.
5. **The database is open to anyone, and the names in it can be read by anyone.** Read (database.rules.json in this
   repo, the `sixfold` branch). `sixfold/lobby` and `sixfold/duels` are `.read: true, .write: true`; every friend room is
   readable and writable by anyone who knows or guesses its code (four characters from 32, about one million codes);
   there is no sign in, so nothing ties a write to a player. Anyone with the public config can list who is searching
   right now by name, read past duels, or write junk. A reviewer will not test this, but a child safety complaint would.
   Smallest fix: anonymous Firebase sign in on the first online tap and rules that only let a player write their own
   lobby entry and their own side of a duel; until then, keep the target audience 13 and over (PLAY-LISTING.md OWNER
   DECIDES 3).

## What a child safety reviewer would ask about the friend rooms and emotes

6. Read, and seen in the room shot (ran). The answers are mostly good: there is no free text chat, no voice, no images,
   no friend list and no profile. Talk is six fixed emotes (Smirk, Eyes, Gasp, Respect, Fire, Yawn) and a stance call,
   only inside a friend room duel, at most one every 2 seconds, and a Quiet switch hides the other side's. Friend rooms
   are private by code. The questions without a good answer yet:
   - The display name is free text, up to 14 characters, with no word filter, and Find a rival shows it to strangers.
     Smallest fix: a short blocked word list on the name, or Find a rival showing "Rival" instead of the typed name.
   - There is no way to report or block a player. With fixed emotes this matters less; the name is the one way to be rude.
   - A stranger who guesses a live room code with one player waiting takes the empty seat (the room is full at two;
     the check is in the client only). Smallest fix: the room creator sees "Player 2 is here" and can leave, which
     already exists; say it on the friend card.
   - Ratings: "Users interact" goes on the listing (PLAY-LISTING.md answers it).

## Things a new player meets in the first minute (ran: a cold start at 412 x 915, no save)

7. **The first screen is a wall of rules.** The How to duel card lists six rules with CLEAN, GLANCE, WHIFF, CLASH, the
   bind's Drive, Slip and Trap, Resolve, Foresight and READ before a single tap. Most players will tap Got it without
   reading it. Smallest fix: show only the first two rules, let the rest arrive as the existing one time hints do in the
   first duel (the game already has the read, predict, resolve and mirror hints).
8. **The biggest button is Ranked Duel.** After Got it, the title's top button (red, full width) is Ranked Duel, then
   Free Duel. A new player taps the top one and lands in a matchmaking screen about placements, tiers and Sentinels, not
   a duel. Smallest fix: Free Duel first and largest on a first visit, or the first visit's button starts Ascent rung 1
   (Stone, one star), which is the gentle start the Ascent was built to be.
9. **Free Duel can start against a five star foe.** It picks a random foe of the eight at difficulty 0.5; the first cold
   start drew the Echo, shown as five stars ("Learns you in real time"). Smallest fix: Free Duel picks from the habit
   foes (Stone, Drunkard, Metronome) until the player has won once.
10. **The foe has two names.** In a Free Duel the foe card names the personality and the label above the fighter names
    the skin: on the first cold start the card read "Echo" and the fighter read "Kappa Grappler". Smallest fix: the card shows "Kappa Grappler, the Echo".
11. **A stance takes two taps.** The first tap aims ("Strike? Heaven, tap again"), the second commits. The hub says so,
    which works, but nothing on the How to duel card says it. Smallest fix: one line on the card.
12. **The Daily strip sits between the foe card and the fighters on every duel** ("Daily: Stone, Play"), on the board a
    new player is trying to read. Smallest fix: show it on the title only.
13. The "unpred" label under each fighter is jargon until the first result card explains it. Smallest fix: "readable"
    with the number, or a one time hint.

## Words and buttons that promise something that is not there (read, and seen on screen)

14. **"Ranked" with no shared ranking.** Ranked Duel, the Ranked tag in the foe card, "ranked tier" and "ranked W L" on
    the Profile: the rating and tier live only in this phone's storage (src/rank.js via localStorage `sixfold_pvp`).
    It is a personal ladder, real enough, but nobody else sees it, and the screen says "A global leaderboard comes
    later.", a promise in the UI of a feature that does not exist. Smallest fix: drop the leaderboard line; call the
    button "Online duel" and the ladder "your rank"; or keep "Ranked" and add "on this phone".
15. Find a rival will mostly meet Sentinels at launch (it needs another player searching at the same moment). The
    screen is honest about it ("Nobody around? A Sentinel, a practice bot at your rank, steps in"). No fix needed; keep
    the listing honest too (it is).
16. No "beta", "test", "demo" or "coming soon" is visible (searched the page source and every screen the kit opened).
    The skin registry carries "Inkblade (demo)" but the Roster does not show it. No dead buttons found on the title,
    the duel board, the five overlays, the room or the settings.
17. The manifest name is "SIXFOLD", an em dash, then "stance duel"; the launcher uses short_name SIXFOLD, so the phone never
    shows it, but the Play listing name differs from it. Harmless; align it if the manifest is touched for item 2.

## Network off (ran: load once, cut the network, cold launch a new page)

18. **Offline cold start works.** The service worker (cache sixfold-v62) had precached the shell and the Ronin; the
    page came up on the How to duel card, the title drew, a Free Duel started and played a round, no page errors.
    Play a friend and Find a rival both say "Online play is not available. Could not reach the online server. Check
    your connection and try again."; Find a rival offers "Duel a Sentinel" as well. Two soft spots: the type faces come
    from Google Fonts and the service worker does not keep them (they came from the browser's own cache in the test; on
    a phone that has cleared it, the game falls back to the system fonts); arena pictures, fighters and music are cached
    only once seen, so the first offline Ascent rung in a new arena has no painted background. Smallest fix for the
    fonts: self host the two woff2 subsets in the game folder and precache them.

## Installable app requirements (read)

19. Display standalone, orientation portrait, start_url and scope "./", theme and background colours set: fine.
    Service worker: registered on load, network first for pages, cache first for the rest: fine. Missing: the PNG icons
    and id (item 2). The page's og:url and share image still point at the old GitHub Pages address
    (stephenuffugus.github.io/sixfold); the room link uses lucidwinds.com, which is right.
20. The Sunbeam script (lucidwinds.com/sunbeam-sdk.js) loads the Firebase app, auth, functions and firestore SDKs on every
    online start, about four extra downloads before a duel, and ties wins to a Lucid Winds account when the phone is
    signed in there in Chrome. Smallest fix: skip it inside the app (OWNER DECIDES 5 in PLAY-LISTING.md).

## Text about how the art was made (read)

21. Nothing a player sees says how the art or music was made (searched the page text; "painted" and "watercolor" occur
    only in code comments). But the web copy serves the design notes too: ART_SHEET.md, FINDINGS.md, HANDOFF_SIXFOLD.md
    and SIXFOLD_SPEC.md sit in the game folder on lucidwinds.com, and ART_SHEET.md and FINDINGS.md name the image tools
    the fighters and arenas came from. If that is not meant to be public, leave the .md files out when vendoring.
22. The music: five tracks in music/ with no source or licence note anywhere in the repo. Confirm the licence before a
    paid listing (PLAY-LISTING.md OWNER DECIDES 7).

## The store pictures (ran; every picture opened and looked at)

The kit's own faults, so nobody is surprised at upload time. This box has no colour emoji font: shoot.mjs removes emoji
glyphs from the page text before each capture (so the Roster and Profile chips, the arena names and the result chips
show their words without their icons) and hides the room's Talk row in shot 3. On a phone they are colour icons.
- play-shot-1 (a clean hit, round 1, Hannya in Cherry Riverbank): the header's "STANCE DUEL" and sunbeam count are
  unreadable on the gold sky; the Daily strip cuts across the scene; the foe card says CASUAL in an Ascent duel, and the
  dimmed wheel nodes on white snow read weakly.
- play-shot-2 (the Clash): the board behind is blurred to near black, so the lower half of the picture is empty; the
  three buttons are small for a hero shot; nothing says it is a duel against a fighter.
- play-shot-3 (the friend room, live database, room 2HG2): the score reads twice ("0 vs 0" and "You 0, Player 2 0");
  the Talk row is hidden (emoji); the lower third is empty and the room code is a real, short lived code.
- play-shot-4 (the title): the biggest button says Ranked Duel (item 14); the headline "Read their habits. Hide
  yours." is about play the picture does not show; the "All Sky Wolf games" link (item 1) is in the picture.
- play-shot-5 (the Roster): the bottom row is cut off by the Close bar; the tiles are small; two names wrap.
- play-shot-6 (the Ascent): only six rungs show, half of them dimmed; the list is cut top and bottom; the picture is
  mostly navy blur.
- play-shot-7 (Victory over Hannya): the fighters are blurred out behind the card; "Most exploitable moment: round 4"
  is cut at the bottom edge; the stats are small.
- play-shot-8 (the Daily Duel): it prints today's date (2026-11-13), which dates the listing; the foe has no picture;
  most of the frame is blur.
- feature graphic: the arena art is enlarged from a 760 pixel wide crop and is soft; the fighters keep a faint pale
  edge from their sheets; the centre bottom is empty.
- play-icon-512: the seal and its 六 are small at launcher size; the ring is faint; the six stance arrows of the wheel
  are not on the nodes, so the icon reads as dots.
