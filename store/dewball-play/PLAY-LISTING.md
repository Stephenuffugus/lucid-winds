# DEWBALL, Google Play listing copy (13 Nov 2026, written against the build in satellites/dewball, cache dewball-v36)

Every number below was counted in that build (the list at the end says where). Studio voice: no dashes, no exclamation
points, no hype words, "Sky Wolf Studio" singular, nothing about how the art, the models or the music were made. Paste
each block as it is: one line per paragraph, a blank line between paragraphs (Play keeps newlines). Character counts
were measured by script.

## App name (30 max)

`Dewball: Roll and Grow` (22 characters).
Why: "Dewball" alone says nothing to a stranger scrolling Play; "roll and grow" is the whole game in three words and is
what people type when they look for this kind of game. The web manifest's name and short name stay "Dewball", which is
what the launcher shows. Fallback: `Dewball` (7).

## Short description (80 max)

```
Roll a sticky ball, pick up what is smaller, grow from a crumb to a planet.
```
(75 characters, measured.)

Why this one: it is the game's own store line (the manifest's description, near word for word), it says the verb, the
rule and the arc in the order a player meets them, and "a crumb to a planet" is true: the first world starts the ball at
4 cm and the sixth is a planet you roll round.

Three to test against it (Store listing experiments, one at a time):

```
Pick up anything smaller than you. Grow. Now pick up the bigger things.
```
(71)
```
Start the size of a crumb. Roll up a picnic, a town, a harbor, a planet.
```
(72)
```
Seven worlds to roll up, from a picnic blanket to a whole small planet.
```
(71)

## Full description (4000 max)

```
You start as a drop of dew the size of a crumb, on a picnic blanket. Put your left thumb down and roll. Anything clearly smaller than you sticks to the ball, and you grow. Grow a little and the next size of thing sticks too: a pea, then a cookie, then the jam jar.

Each world gives you a clock and a goal size. Reach the goal before time runs out for one star, and keep rolling for two and three. Fences and gates drop away once you are big enough, and the world opens up behind them. Things that move, like ants, ladybirds, crabs and street dogs, bump you around until you outgrow them. Hit something big too hard and your last few pickups shake loose.

Seven worlds, each bigger than the last:
Crumb Country, a giant picnic blanket. 4 cm to 24 cm.
Toybox Peaks, a playroom. 8 cm to 70 cm.
Night Garden, a garden after dark. 15 cm to 1.7 m.
Bazaar Lane, a market town. 30 cm to 3.4 m.
Starfall Bay, a beach and a harbor. 60 cm to 16 m.
The Whole World, a small planet you roll all the way round. 45 cm to 22 m, and three stars far beyond that.
Dream Meadow, with no clock and no goal. Just roll.

Every world hides keepsakes to find and press in your collection, the Grove, along with your proudest rolls. As you grow, size facts tell you what you are as big as, from a ping pong ball onward. Roll enough and you earn new ball skins: Moss, Honey, Rose, Ember, Midnight, Amethyst and Royal. They are looks only, earned by rolling, never bought.

Left thumb rolls. Right thumb turns the camera. Double tap the right side to turn around. When the water drop glows, tap it to dash. It plays either way up, and best sideways, where the world is wider. Settings let you invert the camera, reduce motion and turn the sound off.

Once you have played a world, it opens offline too.

No ads. No purchases inside the game. No account. Nothing about you leaves your phone.

From Sky Wolf Studio.
```
(1886 characters, measured.)

The description assumes the Play build is sold at $0.99 with nothing inside to buy and no ads, as the owner has said.
If that changes, replace the "No ads. No purchases inside the game. No account." line and nothing else.

## Release notes (en-US, 500 max)

```
First release of Dewball. Roll a sticky ball through seven worlds and grow from a crumb to a planet. Plays either way up, best sideways.
```

## Category and tags

Games, Casual (the nearest Play category to a relaxed roll and collect game; Arcade is the second choice, it fits the
clock and the stars; Puzzle and Simulation are wrong). Tags, up to five from the Console's own list, nearest names it
offers: Casual, Arcade, Single player, Offline, Stylized. Only the Console shows which names exist; pick Offline only if
it is on the list (a world plays offline once it has loaded once, see READINESS.md).

## Screenshots and feature graphic

Eight LANDSCAPE shots, 1920 x 1080 (16:9). Landscape because the game says so itself (the menu's tip: "Dewball plays
best sideways"), the owner said landscape is the recommended way to play, and the world is twice as wide sideways: in
portrait the HUD, the sticks and the dash ring cover most of a narrow view. Play accepts landscape phone screenshots
(16:9, each side 320 to 3840 px). Each is a real capture from the real game at a 915 x 412 phone, device scale 2, in the
kit's dark green frame with one headline. Made by `shoot.mjs` then `graphics.py` (BUILD.md, step 5). The order and what
each shows are in kit.json and READINESS.md, section "The store pictures".
`feature-graphic-1024x500.png`: a real capture of the game with the game's own title and icon.
`play-icon-512.png`: the game's own icons/icon-512.png, opaque.

## Content rating questionnaire (IARC), answered from the code

- Category: Game.
- Violence: none. There is no fighting and nothing is hurt. Moving things (ants, ladybirds, crabs, gulls, cats, dogs,
  camels, hens, sheep, cows, toy cars, buses) bump the ball until it is big enough to pick them up; then they stick to
  the ball like everything else. No blood, no injury, no death animation, no cries. A hard hit makes the last few
  pickups fall off the ball. Answer "no" to every violence question.
- Fear: none. Night Garden is a garden after dark with fireflies, snails and a toad; nothing jumps out.
- Sexual content, nudity, crude humour, language: none. Players cannot type anything.
- Drugs, alcohol, tobacco: none named. The props were searched by display name for alcohol, tobacco, weapons and
  gambling words; none matched. (One model file in Crumb Country is called winebottle.glb; its name in the game is "Cordial
  Bottle", a green bottle with a cork among the picnic things, rolled up like the rest, never drunk. Answer "no"; if a
  reviewer reads it as wine, "depiction of alcohol, no use" does not move the rating for most regions.)
- Gambling or simulated gambling: none. No loot boxes, no chance based rewards for money. Sunbeams are a count earned by
  playing (see READINESS.md about what they do in the Play app).
- Users can interact or exchange content: NO. No chat, no multiplayer, no names, no sharing, no friend list.
- Shares the user's location: no. Shares personal information: no.
- Digital purchases: none inside the app (the $0.99 is the app price, not an in app purchase).
- Expected result: PEGI 3 / ESRB Everyone / IARC 3+. This is an expectation, not a promise; IARC issues the rating.

## Data safety form, answered from what the code sends

What leaves the phone in the Play app, verified by watching every request of a cold start played as the Play app (the
page given the android-app:// referrer a Trusted Web Activity gives it, which is what the game's own inTWA test reads),
network throttled, no cache, through to a fully loaded Crumb Country (probe.mjs net, 13 Nov), and by reading the page:
- lucidwinds.com only. The game's page (index.html), three.min.js, the model loader (GLTFLoader.js, meshopt_decoder.js),
  the model list (assets/3d/index.json) and one world's models and texture atlas (60 files for Crumb Country), the
  studio's soundtrack scripts (music-unlocks.js, music-catalog.js; music-player.js, music-tracks.js and the song files
  only when a player opens the music), and favicon.ico. Plain file requests. Nothing the player made, typed or did is in
  them; no identifier, no cookie the game sets, no query string beyond file versions.
- Not in the Play app (verified absent in that run): the Sunbeam script (lucidwinds.com/sunbeam-sdk.js) and the
  Firebase SDK it loads from www.gstatic.com, and the feedback form (feedback.js). Both load on the open web copy only,
  and the privacy page says so. No Google Fonts (the game uses the phone's own fonts).
- Nothing else: no analytics, no ads, no crash reporting, no sign in, no payments, no location, no permissions.
- Saves (stars, best sizes, keepsakes, skins, settings, the soundtrack's play time counter) stay in the phone's local
  storage under dewball_save, sws_music_progress and sws_game_unlocks, and never leave it.

The answers, field by field:
- Does the app collect or share any of the required user data types: No.
- Is all of the user data collected by the app encrypted in transit: not asked once the answer above is No (every
  request is HTTPS anyway).
- Do you provide a way for users to request that their data is deleted: not asked once the answer is No (clearing the
  app's storage deletes the save; the privacy page says so).
- Privacy policy URL: `https://lucidwinds.com/satellites/dewball/privacy.html` (it exists, it is dated 2 November 2026,
  and it says the same as above). Its contact line carries the studio's address; the kit does not repeat it. The Play
  listing's contact email is `[support email]`.
- A note for the owner, not the form: the host (and its CDN) sees each file request's IP address, as every web server
  does. Google's Data safety guidance does not count data a server receives only to deliver the app's own content, so
  "No" is the honest answer; the privacy page already describes it ("That server sees an ordinary file request").

In three sentences: the Play app collects nothing and shares nothing; its only network traffic is the game's own files,
3D models and, when a player opens the music, its songs, all from lucidwinds.com over HTTPS, with no identifier in any
of it. The Sunbeam account script, the Firebase SDK and the feedback form that the web copy loads are switched off when
the page runs as the Play app, which the kit verified by playing a cold start as the app. Saves stay in the phone's local
storage; there are no analytics, no ads, no fonts from Google, no sign in and no payments.

## OWNER DECIDES

1. Price. He has said $0.99, paid. Options: (a) $0.99, no ads, no purchases: the copy above as written, the simplest
   review, the studio's Play plan; (b) free: wider reach, no money from this listing unless ads come later, and a free
   app can never become paid; (c) free with ads: needs an ad SDK, a new Data safety answer (advertising id), the
   "Contains ads" label and a new privacy page. Recommendation: (a), as he said.
2. The app name: `Dewball: Roll and Grow` or plain `Dewball`. Recommendation: the longer one; it says what the game is.
3. Sunbeams in the Play app (READINESS.md item 4): keep the "+3 Sunbeams" line on the result card, or hide it when the
   page runs as the app. Recommendation: hide it; in the app they buy nothing.
4. The soundtrack in the Play app (READINESS.md item 6): keep the "New song" unlocks (songs stream from lucidwinds.com;
   no data is sent, but a paid app then plays the studio's songs, so their licence must cover a paid app), or switch the
   unlock script off inside the app. Recommendation: keep it if the licence covers it; it is a real reward.
5. Who the game is for (Target audience and content). Options: (a) all ages including children: the Families policy
   applies; the app has no ads, no data collection and no interaction, which is what Families asks, but every SDK and
   every outbound link must then meet it too (there are none in the app); (b) 13 and over: the lightest review.
   Recommendation: (a) is possible and honest for this game, but the review is stricter and slower; pick (b) for the
   first release unless he wants the children's audience.
6. Support email for the listing: `[support email]`.

## Where each number comes from

- 4 cm start, 24 cm goal (Crumb Country) and every world's start, goal and clock: DB_DEV.worlds() from the real engine
  (node satellites/dewball/node_harness.js), 13 Nov: Crumb Country 4 to 24 cm, 2:45; Toybox Peaks 8 to 70 cm, 3:20;
  Night Garden 15 cm to 1.70 m, 3:25; Bazaar Lane 30 cm to 3.40 m, 3:30; Starfall Bay 60 cm to 16.0 m, 3:15; The Whole
  World 45 cm to 22.0 m, 5:00, three stars at 107.75 m; Dream Meadow starts at 20 cm, no clock.
- seven worlds: the same list; the menu's world row shows seven cards.
- a pea, a cookie, the jam jar: Crumb Country's models (pea.glb, cookie.glb, jamjar.glb) and the tip "Now you can
  collect the Jam Jar." seen in the shoot run.
- fences drop away: "The fence sinks. Dessert Corner is open." seen in the shoot run (Crumb Country, at 14 cm).
- the moving things named: the movers of each world listed from DB_DEV.state() (ants, ladybirds, butterflies; wind up
  cars, a tin train; toads, snails, fireflies, hedgehogs; cats, camels, hens, dogs; crabs, gulls, dragonflies; sheep,
  dogs, cows, buses, cars).
- the size facts from a ping pong ball: SIZE_FACTS in index.html (36 entries, the first "you're the size of a ping pong
  ball"); seen in the run: "You're the size of a croissant.", "You're as tall as a house cat."
- the seven skins and "never bought": SKINS in index.html (eight, Dew is the one you start with); the Skins card says
  "Cosmetic only. Earned by rolling, never bought."
- the controls: the How to Roll card in the game.
- plays offline once a world has loaded: the offline relaunch in READINESS.md, item "Offline".
- no ads, no account, nothing leaves the phone: scripts/twa_ready.mjs gates (no ad SDK, no analytics, no sign in) and the
  Play app network run above.
