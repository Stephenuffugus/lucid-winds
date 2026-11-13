# Dewball: what stands between it and a Play release (13 Nov 2026)

Checked against satellites/dewball as it stands in this repo (service worker cache dewball-v36), served on
127.0.0.1:8777, and against the live site where marked. "Ran" means the kit ran something and looked (probe.mjs,
shoot.mjs, scripts/twa_ready.mjs; every picture named here was opened); "read" means inferred from the code or docs.
The Play app was played by giving the page the android-app:// referrer a Trusted Web Activity gives it, which is what
the game's own inTWA test reads; a real TWA also matches display-mode standalone, which headless Chrome does not, so
anything that depends on that is marked "check on the Pixel". Most serious first. Nothing in the game was changed.

The short version: the Play gates are green, the Play app sends nothing about the player, and offline works. What
stands in the way is smaller: a song card that covers the world row on a new player's first screen, two buttons that
may show inside the app, Lucid Winds branding and an arcade currency with no use in a standalone app, an icon that is a
placeholder and looks like a famous spotted egg, and a run that empties out at the end of the bigger worlds.

## The Play gates (ran: node scripts/twa_ready.mjs dewball, 13 Nov)

All ten green: no Stripe checkout inside the app; the portal exit is disabled inside a TWA (inTWA guard present); no ad
SDK; no analytics; no sign in wall; has a web manifest; has a service worker; has its own privacy page; the manifest is
bubblewrap ready (short name "Dewball", standalone, start and scope "./", theme and background #0d100c, id "./", PNG
192, 512 and a maskable 512, each the size it claims); cold launches offline. "ready to list".

## Release blockers and near blockers

1. **A new player's first screen is covered by a song card.** Ran (probe.mjs first, portrait 412 x 915 and landscape
   915 x 412, cold start as the Play app, no save). Two seconds in, the studio soundtrack script (/music-unlocks.js)
   slides up "Congratulations, you unlocked a song and 1 more. Dewy Roll. Play it now / Later". In landscape, the way
   the listing tells people to play, it sits right on top of the world row, so the first thing a new player must do is
   dismiss a music offer before they can tap Crumb Country. A "New song" pill and a note button then stay in the bottom
   left corner during the first run, where the left thumb rolls. Smallest fix: the script already has a "never mid
   round" rule and a game milestone hook; hold the first card until the first result card (or the second launch), and
   keep the pill out of the left third while a run is on.
2. **"Add to Home Screen" and "Horizon mode" may show inside the Play app.** Read, and seen in the referrer only run.
   syncModeUI hides both only when `(display-mode: standalone)` matches. A TWA is expected to match it (manifest display
   standalone), so on the phone they are probably hidden; if not, "Add to Home Screen" in an installed app is a dead
   button and Horizon mode asks for fullscreen the app already has. Check on the Pixel (BUILD.md step 3.3). Smallest
   fix whatever the result: hide both when window.SWS_IN_TWA is true, one line next to the mExit line (index.html 5520).
3. **The icon is a placeholder, and reads as a cream egg with big green spots.** Seen (play-icon-512.png is the game's
   own icons/icon-512.png, unchanged). Astra's own brief (docs/briefs/dewball/store-kit) calls it "a placeholder"; at
   launcher size it is a plain ball on near black, and a cream ball with green spots is close to a very famous game's
   spotted egg, which is the kind of likeness the brief's hard lines forbid. The Astra identity and store pack (wordmark,
   icon, feature graphic, frames) has not come back; nothing of it is in Drive's mirror here or on this box. Smallest
   fix: ship with the Astra icon when it lands; if it does not, at least recolour the spots to the game's own Dew skin
   (pale blue, as the ball looks in every shot).
4. **Sunbeams in the Play app buy nothing.** Ran (every result card in the shoot: "+3 Sunbeams", "+10 Sunbeams").
   Sunbeams are the Lucid Winds arcade's currency; inside the app the Sunbeam script is not loaded (correctly), the
   skins unlock by rolling, so the count goes nowhere. A paying player will look for what it buys. Smallest fix: hide
   the Sunbeam line on the result card when SWS_IN_TWA (OWNER DECIDES 3 in PLAY-LISTING.md).
5. **The game says Lucid Winds, not Dewball by Sky Wolf Studio.** Seen on the menu: "LUCID WINDS · ROLL THE WORLD UP"
   under the title, and Night Garden's card line "the Lucid Winds garden"; the page title is "Dewball · Lucid Winds"
   (not shown in a TWA). In a standalone paid app that name means nothing to the buyer. Smallest fix: "ROLL THE WORLD
   UP" alone, and "a garden at night".
6. **The music's licence for a paid app.** Read. The Play app streams the studio's songs from lucidwinds.com
   (music-catalog.js lists the Dewball shelf: "Dewy Roll", "Dewy Roll Downhill", "Rolling Collection" and more,
   artist "Stephen"). Where and how they were made is recorded in HANDOFF-MUSIC.md (LAW 15); the owner confirms that the
   plan he made them on lets them ship inside a paid app. The game's own sound effects are synthesised in code (Web
   Audio), so they carry no licence question.

## The first minute (ran: cold start, no save, as the Play app, portrait and landscape)

7. What a new player meets, in order: the song card (item 1); the menu, which says what to do ("Collect small things.
   Grow to collect bigger things... Left thumb rolls, right thumb looks."), seven world cards with only Crumb Country
   open, then eight buttons. Tapping Crumb Country starts at 4.0 cm with a first run overlay: "Left side to roll",
   "Right side to look", "Start rolling". A thumb held on the left for three seconds rolled the ball (4.0 to 4.1 cm,
   clock 2:45 to 2:43). The game teaches itself well enough; the tips that follow ("Now you can collect the Sweet Pea",
   size facts) keep teaching. Where a new player would be lost:
   - The menu shows keyboard help to a phone ("Keys: WASD roll · Q/E turn · R/F tilt · SPACE dash") under the buttons.
     Smallest fix: show the Keys line only when a keyboard has been used.
   - In landscape the menu does not fit 412 px of height: the second row of buttons and the hint sit below the fold,
     and the world row shows three and a half cards. It scrolls, so nothing is lost, but the first view is the title and
     the tag line.
   - In portrait the menu buttons wrap to five rows of mixed widths.
   - The goal is in the HUD ("Goal 24 cm") but the menu card says it as "4.0 cm → 24 cm · 2:45", an arrow the player
     has to decode.
8. **Rotation mid run.** Ran. Portrait to landscape and back during the first run: the run keeps going (not paused),
   the HUD stays on, the canvas resizes to the new shape (915 x 412, then 412 x 915), no errors. The rotate tip ("Turn
   your phone sideways for horizon mode...") shows on the portrait menu only. Fine. The tip's text inside an installed
   app is being changed in this repo (item 14).
9. **The end of a run in the big worlds empties out.** Ran (the shoot bot's runs, seen in the raws). Bazaar Lane at
   11.7 m is a bare floor and one tower; Starfall Bay at 43 m shows the edge of the map, a hard cut with striped shading
   along the shore and empty water beyond; The Whole World at 126 m, the planet eaten clean, shows the ball sitting on
   a bare green globe with a large black eight sided shape behind it (most likely the ball's shadow disc once nothing
   is under it; seen in a software rendered capture, check on the Pixel). AUDIT-NOTES.md (16 Aug) says the same of the
   ladder: nothing in the game needs a three star ball, so the last minute of a good run is the same small things or
   nothing. Not a release blocker; it is where a reviewer who plays well will end up. Smallest fix for the black shape:
   hide the shadow when the ball is bigger than the globe; for the rest, AUDIT-NOTES.md's "one or two final meals per
   world".

## Download weight and time to first play (ran: probe.mjs net, as the Play app, no cache, 1.6 Mbps down, 150 ms RTT)

10. Measured on the local server, which does not compress: the menu was up at 6.1 s after 1.19 MB (index.html 451 KB,
    three.min.js 608 KB, the soundtrack scripts 87 KB, favicon 42 KB); a tap on Crumb Country had the ball rolling at
    8.9 s; the world's 60 models and its texture atlas kept arriving until 29.5 s; 3.78 MB and 69 requests in all.
    The live site compresses (checked with curl, brotli): index.html 153 KB, three.min.js 144 KB, so the menu needs
    about 0.4 MB live, roughly 2 to 3 s at that speed. The models barely compress (teapot.glb 38.5 KB to 36.1 KB; the
    atlas is a 623 KB JPEG), so Crumb Country is about 3 MB live, near 17 s for every model at 1.6 Mbps (inferred from
    the measured bytes). The ball is rollable long before that; props without their model yet draw as the game's own
    simple shapes (read: the loader swaps models in as they land). Each further world is 2.5 to 5 MB of models
    (assets/3d/w1..w7 are 2.5, 3.0, 3.0, 3.3, 3.6, 3.2 and 5.0 MB; 24 MB in all). For a $0.99 download that is fine;
    a first open on a slow phone connection will show a sparse world for some seconds.
11. A 404 on every world start: assets/ground-w1.jpg (the "art pack hook" in index.html at 3505 asks for
    assets/ground-<world>.jpg; none exist). Harmless; one wasted request per world. Smallest fix: drop the request
    until the tiles exist.

## Frame rate with the CPU throttled 4x (ran: probe.mjs fps2, the real frame loop)

12. Not measurable on this box. Crumb Country (the most things of any world, 6977 at load) ran at 0.7 frames a second,
    The Whole World at 0.3, with the CPU throttled 4x, because this box has no GPU: Chrome draws WebGL in software
    (SwiftShader) on two cores that were also running other builds (load average 4.6). The game's own safety net did
    engage: after two slow seconds it drops the pixel ratio to 1 (the canvas came back at 915 x 412 on a 2.625 screen).
    A real phone draws with its GPU, so these numbers say nothing about the Pixel. What to do instead: on the Pixel,
    chrome://inspect, the Performance panel with 4x CPU slowdown, in Crumb Country and on the planet, before release.

## Offline (ran: probe.mjs offline)

13. One online visit that played Crumb Country for 25 s, then the network cut and a cold relaunch: the menu came up
    from the worker's cache, Crumb Country started, its models were there (the offline capture shows the full picnic,
    not placeholder shapes), no failed requests except the ground tile 404 (item 11). The shell precaches the page,
    three.min.js, the manifest and two icons; models are kept as they are fetched, so a world never opened online has
    no models offline (read: sw.js). The listing says "Once you have played a world, it opens offline too", which is
    what was seen. The songs never work offline (the worker never caches /music/, by design).

## Words, buttons and links (read and seen)

14. The repo's index.html is one small change ahead of the live page (curl of the live page, diffed): the rotate tip
    inside an installed app ("Dewball plays best sideways. Turn your phone for a wider world.") and the iPhone install
    alert. Both are copy; deploy them with the next change. The live page is otherwise the same build.
15. No "beta", "test", "demo" or "coming soon" a player can see (searched the page text and every screen the kit
    opened). The ?dbtest probe mode exists but is reached only by the query string.
16. Links that leave the game toward a checkout: none inside the app. The arcade button ("◄ Sky Wolf Studio Arcade") is
    hidden and SWS_EXIT refuses when SWS_IN_TWA (index.html 387, 5519, 5520); the worker's offline page removes its
    "Back to the arcade" link in the app; the feedback form and the Sunbeam script are not loaded in the app (absent in
    the Play app network run). The music player that opens from the "New song" pill is the studio player (music-player.js);
    the kit did not find a link in it toward the portal or a checkout (searched), but did not click through every part of it.
17. The inTWA test rests on document.referrer, kept across reloads, and on the standalone display mode. The only in app
    navigation is a reload (the "Try again" buttons), so it holds (read). If the game ever links to its own privacy page
    and back, the referrer is lost and only the display mode check remains: check on the Pixel.
18. The social card og/card.jpg (web only, not the listing) says "Free to play" and "SKY WOLF STUDIOS" (plural); the
    og description says "Free to play at Sky Wolf Studio". True on the web, wrong next to a $0.99 Play listing if the
    same image is reused. Leave it on the web; never use it on Play.
19. A likeness the Astra brief warns about: a keepsake called "The Little Crown" (The Whole World) and a "Royal" skin.
    Small, but crowns and royalty are exactly the genre ancestor's theme. The listing names neither.

## Text about how the art was made (read)

20. Nothing a player sees says how the art, the models or the music were made (searched the page text). The game folder
    on lucidwinds.com also serves its design notes: DESIGN.md, FORGE.md, MESHY-MANIFEST.md, ART_ASSETS.md, LANDMARKS.md,
    AUDIT-NOTES.md and the probe scripts, and these name the model and image tools. If that is not meant to be public,
    leave the .md and .js notes out of the deployed folder. The privacy page credits nobody and claims nothing about the
    art. The listing copy in this kit claims nothing about it either.

## Licences (read)

21. three.min.js (three.js r147), GLTFLoader.js and meshopt_decoder.js: MIT, fine for a paid app (keep the notices;
    three.min.js carries its header). Fonts: none shipped; the game uses the phone's own sans. The store pictures'
    headlines are set in Roboto (Apache 2.0), fine. The 3D models: MESHY-MANIFEST.md records each one and the account it
    came from; the owner confirms the plan they were made on grants commercial use in a paid app (the studio's notes say
    it was a paid plan; the kit did not read the terms). The music: item 6. Sound effects: made in code, nothing to
    licence. Nothing found without a recorded source.

## The store pictures (ran; every picture opened and looked at)

This box has no colour emoji font, so shoot.mjs removes emoji from the page text and the gate signs before each
capture (on a phone the world cards, the dash drop and the size facts carry colour icons). The moments come from a bot
playing the real engine in its probe mode; the camera is aimed down the ball's path because the probe mode does not
turn it by itself. Faults still visible:
- play-shot-1 "Roll round a whole small planet" (The Whole World, 2.42 m): the curve of the planet reads, but the ball
  is not yet rolling the planet, so the headline promises a later moment; a gate sign ("4.20 m") pokes out behind the
  size panel; a stone wall fills the lower left.
- play-shot-2 "Pick up anything smaller than you" (Starfall Bay, 7.29 m, beach umbrellas on the ball): the tip "Now you
  can collect the Weathered Rowboat." and the combo stack in the middle; the foreground is empty sand; the HUD's top
  panel sits over the boardwalk.
- play-shot-3 "Start the size of a crumb" (Crumb Country, 6.5 cm, "You're the size of a croissant."): the ball is small
  in the frame (true to the moment, but weak at thumbnail size); the cereal pieces read as orange blobs; a signpost
  is cut at the right edge.
- play-shot-4 "Your ball wears what it rolls up" (Toybox Peaks, 1.30 m, a ball of books): strong ball, but the floor
  around it is empty and the playroom is far away.
- play-shot-5 "Fences sink once you are big enough" (The Whole World, "The fence sinks. The Garden Wall is open."): a
  rowboat cuts in from the right edge; the sunk fence itself is not visible, only the words say it.
- play-shot-6 "A market town to roll up" (Bazaar Lane, 1.33 m): a good ball of crates and fruit, but the patterned
  floor fills half the frame and the town is a strip at the top.
- play-shot-7 "Keep rolling for three stars" (Night Garden, 9.11 m, "Two stars. Next star at 12.2 m."): dark; the
  subject is small; the garden reads as a green field at night.
- play-shot-8 "Earn stars, open the next world" (the result card, three stars, "NEW WORLD UNLOCKED: Bazaar Lane"): the
  game behind is blurred to near black; the text is small at 16:9; it shows "+10 Sunbeams" (item 4).
- feature-graphic-1024x500.png: shot 1's moment captured again with the HUD hidden, the game's title set the way the
  menu sets it and the game's icon. The title's weight is lighter than the menu's on this render; the stone wall
  crosses under the title; the icon (item 3) is the weakest part and will look like the placeholder it is.
- play-icon-512.png: the placeholder icon (item 3); the ball fills about 60 percent of the square, so it reads small
  on a launcher; the gold ring is faint.
Landscape was chosen because the game recommends it and the world reads far wider sideways; Play shows landscape
phone shots in its carousel at a smaller size than portrait, so the headlines are set large.
