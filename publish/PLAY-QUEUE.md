# The Play queue, 13 Nov 2026 (after Shutterbug, Sixfold and Dewball)

Push Bandit's Box next: it is the only game outside the Play titles that passes every Play gate today, offline included, and it is a phone toy by nature.
Then Whistlestop, Doohickey and Strata: each fails one gate only (no privacy page of its own), reached play from a cold start with no page errors, and looks finished on a phone.
The one thing almost every game lacks is its own privacy page; a single template copied per game would move nine games to green in an hour.

How this was made. "Ran" means a command or a headless phone sized browser (412 x 915) did it tonight and I looked at the picture. "Read" means taken from the code or the repo. Nothing in any game, kit or script was changed.

## Already in the Play Console, so not in this queue

Read: lucidwinds.com/.well-known/assetlinks.json (fetched tonight) carries signing fingerprints for Flock the World, TUMBLE, Pixel Petri, Hues, Jimothy and OriVex (the petalvex folder), and store/ftw-play notes FTW and Pixel Petri went live in Sep and Oct. Shutterbug, Sixfold and Dewball have kits and are ahead of this list. I did not check the Console state of any of these.

## The gates, the whole catalogue (ran)

The static gates of scripts/twa_ready.mjs (no Stripe, portal exit guarded, no ads, no analytics, no sign in wall, manifest, service worker, own privacy page) plus its manifest check were run for all 150 satellites with an index page. 9 pass all of them, 9 fail one, 21 fail two, the rest three or more. 141 of 150 have no privacy page of their own. 89 have a portal exit with no inTWA guard. 121 have a manifest Bubblewrap would refuse (most often no "id").

A fault in the script itself (read, then seen tonight): when the offline check exits with a failure, twa_ready.mjs catches it and prints a warning, "check did not run, is the server on 8777 up?", instead of a failed gate. The server was up. So "1 gate failed" can mean two. Also, the offline check counts start controls from a fixed list of selectors written for the games already listed (#startBtn, .wcard and so on), so a new game fails it even when it opens fine offline. My own cold offline load (below) is the better word for now.

## The queue, best first

### 1. Bandit's Box
What it is: a box of fidget toys (pop it, slime, gears, switches, a raccoon puppet) that you touch and that answer.
Gates (ran, full twa_ready): all ten green, "ready to list"; the offline check passed (24 toys, 42 drawings with the network cut).
Seen (ran): cold start reached the title "tap anywhere to begin" with no page errors; offline cold start drew all 27 controls. Folder 420 KB. A stranger sees a calm dark screen with a raccoon face and the name, then a toy shelf.
Missing, smallest fix each:
- A store kit (listing, five or six shots, feature graphic, 512 icon, TWA project): copy the store/hues-play shape and tools/store-kit. Opus.
- The studio song card covers the bottom of the first screen two seconds in ("Congratulations, you unlocked a song", Play it now / Later), the same fault as Dewball's blocker 1; hold it until a later visit inside the Play app. Opus, once the owner rules on the music (below).
- A real icon check: the manifest icons are PNG with a maskable one (read); whether they read well at launcher size I did not look at. Astra if they do not.
Work: small to medium. The game needs nothing; the kit is the work.
Why first: it is the only fully green new title, it is made for a thumb, and it explains itself in four words.

### 2. Whistlestop
What it is: a wooden train set puzzle; you flip switches and pull the whistle so each little train reaches its own station.
Gates (ran): nine green, one fail: no privacy page. The offline check printed the false "did not run" warning; my own offline cold load drew the menu with no errors.
Seen (ran): cold start, PUZZLES, The First Switch: the board drew a curve of track, a red train, stations and a TOOT button, with the line "Tap the switch, then pull the whistle." No page errors. Cold start pulled about 350 KB. A stranger sees a sunny toy railway on a rug and knows what to do in one line.
Missing:
- privacy.html of its own. Opus, minutes.
- The round Music button sits over the top left of the level list and over the board's right edge (seen); keep it out of the play area in the Play app. Opus.
- A store kit. Opus.
Work: small.
Why here: it looks finished, teaches itself in one sentence, plays in portrait one handed, and the levels give a store page a clear promise.

### 3. Doohickey
What it is: a marble contraption puzzle; drag ramps, dominoes, fans and balloons onto a board, press GO, and watch it almost work.
Gates (ran): nine green, one fail: no privacy page. Offline warning false as above; my offline cold load drew the menu with no errors.
Seen (ran): PLAY, The Bell on the Shelf: a graph paper board, a bell on a shelf, two parts in a tray, a green GO, the goal "Ring the bell, par 4". No page errors. About 300 KB cold.
Missing: privacy.html (Opus, minutes); the Music button covers the last level row on the level list (seen; Opus); a store kit (Opus).
Work: small.
Why here: the idea sells itself in a short clip, which helps the audience lane; it sits under Whistlestop only because the first level teaches less on screen.

### 4. Strata
What it is: a dig; brush and chisel a cliff face until a one of a kind skeleton comes out, then hang it in your own museum.
Gates (ran): nine green, one fail: no privacy page. Offline as above; my offline cold load drew the menu with no errors.
Seen (ran): DIG opened "The Farbank", layered rock, the hint "Brush. Something is under there.", four tools. The tool icons drew as empty boxes in headless Chrome, which usually means emoji the test machine lacks; check on the Pixel before shots are taken. About 320 KB cold. A stranger sees a sandstone wall and a brush, and wants to scrape.
Missing: privacy.html (Opus); check the tool icons on a phone (owner, one look); a store kit (Opus).
Work: small.
Why here: a strong hook for a store page ("every fossil is the only one"), but the first minute is slow scraping, so it is a harder screenshot than the two above.

### 5. Wardian
What it is: a sealed jar of moss, ferns and small bugs that grows on real time while you are away; nothing in it can die.
Gates (ran): nine green, one fail: no privacy page. My offline cold load drew the jar with no errors.
Seen (ran): cold start went straight to the jar, "Day 1, morning", a sprout, stones and a twig, a PHOTO button. No page errors. About 310 KB cold. A stranger sees a quiet, good looking jar and may not know what to do; the hint ("Swipe down to mist. Tap the glass to say hello.") shows only for a moment.
Missing: privacy.html (Opus); keep the first hint up until the first mist (Opus); a store kit (Opus).
Work: small.
Why here: lovely, but a slow idle toy is hard to sell at a price on day one; better as a free listing or a later one.

### 6. Airworthy
What it is: fold a paper aeroplane by real fold choices, test it in a wind tunnel, then throw and trim it in a gym.
Gates (ran): nine green, one fail: no privacy page. The offline check failed by its census (0 known start controls), but the offline page held the title, the menu words and three drawings, so it probably works offline. Not opened in my browser pass. Folder 2.5 MB.
Missing: privacy.html (Opus); one phone look (Opus); a kit (Opus).
Work: small to medium (unseen).
Why here: a good idea with more steps to explain; not looked at yet, so it sits below the five I saw.

### 7. Inkswing
What it is: throw a pendulum that draws in ink, and keep the drawing.
Gates (ran): nine green, one fail: no privacy page; offline warning not checked further. Not opened. Folder 2.7 MB. It reads the phone's tilt (read), which suits a phone.
Missing: privacy.html; a look; a kit (Opus).
Work: small to medium (unseen).
Why here: more a toy than a game; good for a short clip, weaker as a paid app.

### 8. Marrowdeep
What it is: a dice party crawler; roll your party, decide who faces what, bury the fallen and their callings return as cards.
Gates (ran): nine green, one fail: no privacy page; offline warning not checked further. Not opened. Folder 13 MB, the biggest of these.
Missing: privacy.html; a look; check what a cold start pulls; a kit (Opus).
Work: medium (unseen, larger, more rules to teach).
Why here: the deepest game in this group, so possibly the best paid title, but I saw nothing of it tonight.

### 9. Windup
What it is: punch holes in a music box strip, crank it, give the song away.
Gates (ran): nine green, one fail: no privacy page; offline warning not checked further. Not opened. Folder 2.2 MB.
Flag (read): the page says "beta" to players: satellites/windup/index.html line 157, "The printable strip is beta. Measure one against a real strip befor[e]...", and line 2584 notes the button says beta until a strip is printed and checked. Print one real strip, or hide the printable strip in the Play app.
Missing: privacy.html; the beta strip; a kit (Opus; the print test is the owner).
Work: small to medium.

### 10. Aura Off
What it is: a turn based gesture duel for two people sharing one phone, with a crowd.
Gates (ran): nine green including offline (it passed the census), one fail: no privacy page.
Flag (read): satellites/aura-off/index.html line 9: "This game is beta:true in the portal". Folder 1.5 MB, index 8 KB.
Missing: privacy.html; the owner's word that it is out of beta; a kit.
Work: small, but a two person game is a hard sell on a store page.

## Not ready, and why

- Tofu, and the small tools Brim, Crease, Gauge, Glimpse, Hush, Notch, Slice 3D, Span, Tint, Yonder (ran): two fails each, no privacy page and no "id" in the manifest. Both fixes are small, but Tofu is a first milestone still being built and the others are small utilities with little store pull.
- Tomato Man (ran): portal exit with no inTWA guard, no privacy page. It is vendored (VENDORED.json): the fix belongs in its own repo, not here. Mid build.
- Ripcord (ran): unguarded portal exit, no privacy page; the folder is 181 MB (assets 125 MB, plus docs and tools a Play build must not carry); the settings show "3D battle (beta)" (index.html line 697). It has Play art in store/ripcord-play. Medium to large.
- Sixfold (ran, on this branch): fails exit, privacy and manifest here, but this copy is older than the friend room build waiting on the owner's line, which the checklist says closes four of its five code blockers (read, not run); re-run twa_ready after that deploy.
- Bubblenaut (ran): no service worker, unguarded exit, no privacy page, though Play art exists in store/bubblenaut-play. Medium.
- Keepsies, Flatulence Fighter, Orb Orchard, Create-A and most of the larger catalogue (ran): four or five fails (no manifest, no service worker, no privacy page, unguarded exit). Each is a medium job before Play, and several are still in active milestones.

## What the owner decides

- Price. The Play titles so far are $0.99 (TUMBLE, Shutterbug). Suggested: $0.99 for Whistlestop, Doohickey and Strata; Bandit's Box either $0.99 or free as the studio's door; Wardian free.
- The studio music card and the Music button inside Play apps. It is the same script in every game (/music-unlocks.js): it covers the first screen of Bandit's Box and Dewball and overlaps the level lists of Whistlestop and Doohickey. One rule for all Play apps (for example: no card on the first visit, button only on menus) fixes every title at once.
- One listing style for the paper family: Whistlestop, Doohickey and Strata share one look (cream and kraft paper, the same menu, the same buttons). One store kit template could serve all three, and they could be pitched as a set.
- One privacy page template for every game (one support address, "this app collects nothing"), copied into each folder. Decide the address once.
- Names: WHISTLESTOP, DOOHICKEY, STRATA and WARDIAN are all capitals on their pages, as TUMBLE is; Play allows it when it is the brand. Bandit's Box keeps its apostrophe. Say if any should change before a kit is cut.
- Order of reviews: one app in review at a time has been the cadence (store/tumble-play notes); with Shutterbug, Sixfold and Dewball ahead, this queue starts after them.

## What I did not reach

I did not open Airworthy, Inkswing, Marrowdeep, Windup or Aura Off in a browser, did not look at any icon at launcher size, did not measure total cold start bytes precisely (the figures above count only responses that state their size), and did not check the Play Console state of the titles already there.
