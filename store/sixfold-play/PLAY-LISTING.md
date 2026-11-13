# SIXFOLD, Google Play listing copy (13 Nov 2026, written against the build about to go live: sixfold room-polish c4d7a2c)

Every number below was counted in that build (the table at the end says where). Studio voice: no dashes, no exclamation
points, no hype words, "Sky Wolf Studio" singular, nothing about how the art or music was made. Paste each block as it is:
one line per paragraph, a blank line between paragraphs (Play keeps newlines). Character counts were measured by script.

## App name (30 max)

`Sixfold: Stance Duel` (20 characters).
Why: "stance duel" is the game's own tag line under the wordmark, and it tells a stranger scrolling Play what kind of game
this is; "Sixfold" alone says nothing. Written in title case, not the all caps SIXFOLD of the wordmark, because Google's
guidance discourages caps in a title unless it is the brand; the web manifest's short name is SIXFOLD, so either is
defensible. Fallback: `Sixfold` (7).

## Short description (80 max)

```
Six stances, one secret pick. Read your foe, hide your habits, strike first.
```
(76 characters, measured.)

Why this one: it says the whole game in the order a player meets it (six stances, the hidden pick, the read, the
strike), and
"hide your habits" is the hook that makes it more than rock paper scissors: the computer learns your patterns.

Three to test against it (Store listing experiments, one at a time):

```
Both duelists pick a stance in secret. Read the pattern, break the bind, win.
```
(77)
```
A quick sword duel of hidden picks. Play the computer, or a friend by room code.
```
(80)
```
Six stances, one hidden pick a round. The foe learns your habits. Stay unread.
```
(78)

## Full description (4000 max)

```
Tap a stance on the wheel. Your foe picks one too, in secret. Then both of you reveal at the same moment, and the wheel decides who lands the blow.

There are six stances: Heaven, Tiger, River, Earth, Crane and Shadow. Yours beats the two that sit clockwise of it. The first is a clean hit and takes two of the foe's four hearts. The second is a glance and takes one. The stance straight across is a whiff: the blades pass and nobody bleeds. Pick the same stance as your foe and the blades lock in a clash, and you break the bind with Drive, Slip or Trap, each beating one of the others. After round six every blow strikes deeper.

The foe is reading you the whole time. Repeat yourself, walk round the wheel, favour one stance, and it notices. A bar under each fighter shows how unpredictable you are right now, and every duel ends by naming your biggest tell. Rounds where nobody lands a hit build Resolve. Spend it on Insight or Foresight to read your foe. Resolve buys information, never damage.

Eight foes, eight habits: the Berserker, the Stone, the Drunkard, the Mirror, the Metronome, the Trickster, the Ghost and the Echo. Each one leans a different way, and learning to counter it is the game. A slider sets how hard each one plays.

The Ascent is a climb of 70 duels in chapters, from foes with simple habits to foes that read you back. Almost every rung you win brings a new fighter to play as, 70 in the Roster counting the one you start with, and opens new arenas along the way, 16 in all.

Each day brings a Daily Duel, the same foe for everyone that day, with three trials to chase. Free Duel puts you against a random foe in one tap.

Play a friend: one of you gets a four letter room code or shares a link, the other joins, and you sit in a room together. Tap Ready, duel, and go again as often as you like while the room keeps the score. While you choose, you can send one of six emotes or call a stance as a bluff. Talk never touches the picks, and a Quiet switch hides the other side's emotes. Friend duels are unranked. Find a rival looks for other players searching at the same moment; when nobody is there, a practice bot called a Sentinel steps in.

Winning earns sunbeams, which buy new banner colours for your fighter. Nothing you unlock changes the odds of a round. Unlocks are looks only.

Accessibility is free and always on: a colourblind safe palette, reduced motion, high contrast, large tap targets and a slower reveal. Sound, music and vibration each have their own switch.

No ads. No purchases. No account. Duels against the computer play offline once the game has loaded; online play needs a connection.

From Sky Wolf Studio.
```

The description above assumes the Play build ships with no purchases and no ads (see OWNER DECIDES). If either changes,
replace the "No ads. No purchases." line, and nothing else.

## Release notes (en-US, 500 max)

```
First release of Sixfold. Pick a stance in secret, read your foe, and climb the Ascent. Play a friend with a four letter room code.
```

## Category and tags

Games, Strategy (the closest Play category to a read and counter duel; Casual is the second choice, Card is wrong, Action
oversells the speed of play). Tags, up to five from the Console's own list, nearest names it offers: Strategy, Casual,
Multiplayer, Single player, Offline. Only the Console shows which names exist; pick Offline only if it is on the list.

## Screenshots and feature graphic

Eight phone shots, 1080 x 1920 (9:16, long side under twice the short), each a real screen from the real game at a
412 x 915 phone, in the kit's navy frame with one headline. Made by `shoot.mjs`, `graphics.py`, then
`node tools/store-kit/compose.mjs store/sixfold-play/kit.json` (BUILD.md, step 4). In selling order:
1. `play-shot-1.png` "Six stances. Both pick in secret." A clean hit in an Ascent duel against Hannya in Cherry Riverbank.
2. `play-shot-2.png` "Same stance? Break the bind." The Clash prompt: Drive, Slip, Trap.
3. `play-shot-3.png` "Play a friend with a room code" A live friend room, You and Player 2.
4. `play-shot-4.png` "Read their habits. Hide yours." The title screen.
5. `play-shot-5.png` "Win new fighters as you climb" The Roster, a player 33 rungs in.
6. `play-shot-6.png` "The Ascent: 70 rungs to climb" The Ascent ladder at rung 34.
7. `play-shot-7.png` "See your tell after every duel" The result card after a won Ascent duel.
8. `play-shot-8.png` "A new Daily Duel every day" The Daily Duel and today's trials.
`feature-graphic-1024x500.png`: the Sunset Cliff arena, the Crimson Ronin and Hannya from their own sprite sheets, the
title screen's own wordmark and tag line. `play-icon-512.png`: the game's icon.svg at 512, opaque.
The faults still visible in each picture are listed in READINESS.md, section "The store pictures".

## Content rating questionnaire (IARC), answered from the code

- Category: Game.
- Violence: yes, fantasy violence. Two stylised fighters (samurai, spirits and creatures from Japanese folklore) trade
  sword and weapon strikes; a hit plays a short strike pose, a flinch, a screen flash on a finishing clean hit, and a knocked down pose
  at the end. Is it realistic: no, painted characters, no wounds, no gore, no dismemberment. Blood: a few hit frames in the
  sprite sheets show a small red spatter (the Crimson Ronin's hit frame, for one); answer "blood: yes, mild" if the form
  asks, which is what most often lifts the rating from 7 to 12 in PEGI terms. Violence against humans: the fighters include
  human swordsmen; there are no civilians and no killing words beyond "falls" and "stands over you".
- Fear or horror: folklore spirits (a ghost, a skeleton giant, a demon mask, a centipede) as opponents, drawn in the same
  painted style; nothing jumps out, no horror sounds. Answer "mildly scary themes: no" unless the form is strict about
  skeletons and ghosts; the Gashadokuro (a giant skeleton) and Yurei (a ghost) are the two to think about.
- Sexual content, nudity, crude humour, drugs, alcohol, tobacco: none. Language: none (the only text players can enter is
  a name of up to 14 characters, see below).
- Gambling: none. No real money stakes, no loot boxes, no chance based purchases. Sunbeams are earned by winning and spent
  on banner colours.
- Users can interact: YES. Friend rooms and Find a rival show each player the other's typed display name (up to 14
  characters, no filter), and in a friend room duel a player can send one of six fixed emotes (Smirk, Eyes, Gasp,
  Respect, Fire, Yawn) or call a stance. There is no free text chat, no voice, no images, no friend list, no profile.
- Shares the user's location: no. Shares personal information with other users: only the name the player types, and it
  can be anything (a real first name included).
- Digital purchases: none in the current build (OWNER DECIDES if that changes).
- Expected result: PEGI 7 / ESRB Everyone 10+ for fantasy violence, PEGI 12 if mild blood is declared, plus the
  "Users interact" notice. This is an expectation, not a promise; IARC issues the rating.

## Data safety form, answered from what the code sends

What leaves the phone, verified by watching every request a cold start and a friend room make (13 Nov), and by reading
src/firebase-net.js and the page:
- Google Fonts (fonts.googleapis.com, fonts.gstatic.com): the two type faces, on every online start. Plain font requests;
  nothing the player made is in them. The service worker does not keep them, so offline the game falls back to the phone's
  own fonts.
- lucidwinds.com/sunbeam-sdk.js and the Firebase web SDK (www.gstatic.com/firebasejs: app, auth, functions, firestore), on
  every online start. With nobody signed in it only checks the sign in state and keeps a count in local storage; it calls
  no server. If the phone's Chrome is signed in to Lucid Winds on lucidwinds.com (a TWA shares Chrome's storage for that
  site), each win also calls the studio's earnHashes function under that account: an in game event tied to an account.
  The Play app has no sign in of its own, so a player can only reach this through the Lucid Winds site. OWNER DECIDES
  below (recommended: leave the SDK out of the Play app, then this line disappears).
- Firebase Realtime Database (focus-grove-fffa8-default-rtdb.firebaseio.com), only when a player taps Find a rival or
  Play a friend:
  - Find a rival writes the typed display name (or "Rival"), a rating number, a time and a status under
    `sixfold/lobby/<random id>`, removed when the player leaves or disconnects; a matched duel's record under
    `sixfold/duels/<id>` holds both names, both ratings and every committed and revealed pick, and is NEVER deleted.
  - Play a friend writes the name (or "Player"), presence, ready flags, picks, emotes, calls and the room score under
    `sixfold/friends/<four letter code>`; a duel's picks are removed 8 seconds after its result, and the whole room is
    removed when the last player taps Leave (if the last one just closes the app, it stays until someone opens that code).
  - The id is random per browser tab (sessionStorage), not a device or advertising id. There is no Firebase sign in.
- Nothing else: no analytics, no ads, no crash reporting, no location, no contacts, no photos. Saves (progress, unlocks,
  settings, the name) stay in the phone's local storage.

The answers, field by field (assuming the SDK stays out of the Play app; if it stays in, add "App activity: other
actions, tied to the Lucid Winds account, for app functionality" and answer deletion through the Lucid Winds account):
- Does the app collect or share any of the required user data types: Yes.
- Personal info, Name: collected (the display name, which can be a nickname or a real name). Optional. Purpose: app
  functionality (shown to the other player). Not shared (Firebase processes it for the studio as a service provider).
  Processed ephemerally: no (it is stored until the room or lobby entry is removed, and in public duel records for good).
- App activity, Other actions (picks, ready, emotes, results): collected, optional, app functionality, not shared, not
  ephemeral.
- Device or other IDs: no (a random id per tab, not tied to the device).
- Is data encrypted in transit: Yes (Firebase talks only over HTTPS and secure web sockets).
- Can users ask for their data to be deleted: this is the weak point. Friend rooms delete themselves; public duel records
  never do. Before submitting, either (a) make the game delete a duel's record after the result, as friend rooms already
  do, and answer "data is deleted automatically", or (b) answer Yes and handle requests at `[support email]` by room
  code or name. Recommended: (a), it is a small change in src/firebase-net.js.
- Is the data tied to the user's identity: no account exists; the name is whatever the player typed.
- Privacy policy URL: none exists yet for Sixfold (Play requires one). Needed at
  `https://lucidwinds.com/satellites/sixfold/privacy.html`, saying the above in plain words.

In three sentences: when a player taps an online mode, the name they typed and their picks, ready flags and emotes go to
the studio's Firebase Realtime Database, which only shows them to the matched player and holds no account. Friend rooms
delete their records by themselves, but public Find a rival duel records stay for good, so deletion needs a fix or a
request route before the form can honestly say Yes. Every start also loads Google Fonts and the Lucid Winds Sunbeam
script, which calls a server only when the phone is already signed in to Lucid Winds in Chrome; there are no analytics
and no ads.

## OWNER DECIDES

1. Price. Options: (a) free, no ads, no purchases: the easiest review, the widest reach, the copy above as written, and
   no money from this listing; (b) paid $0.99 like Shutterbug and Tumble: same copy, but Find a rival will rarely find
   another human (few installs, and the web copy is free), so the friend room becomes the online pitch; (c) free with
   ads: needs an ad SDK, a new Data safety answer (advertising ids), a "Contains ads" label, and is a bad fit for a
   children's audience. Recommendation: (b) to match the studio's Play plan, unless a free listing is wanted to feed the
   multiplayer.
2. In app purchases. None today. Sunbeams are earned. Selling sunbeams or fighters would need Google Play Billing (never
   Stripe inside the app), a new questionnaire answer, and it breaks the game's own rule that art is earned by skill.
   Recommendation: none for 1.0.
3. Who the game is for (Target audience and content). Options: (a) 13 and over: the friend rooms and Find a rival stay
   as they are; (b) include children under 13: the Families policy then applies, and a typed name shown to strangers in
   Find a rival is a problem; it would need Find a rival off for that audience or names limited to a fixed list.
   Recommendation: 13 and over.
4. Find a rival in the Play app. Keep it (it needs other players online at the same moment; at launch it will mostly
   meet Sentinels) or show only Play a friend. Either is honest; the copy already says a Sentinel steps in.
5. The Lucid Winds Sunbeam script inside the Play app. Keep it (wins also count toward a Lucid Winds account in Chrome;
   one more Data safety line) or skip it when the page runs as the app. Recommendation: skip it in the app.
6. Support email for the listing: `[support email]`.
7. The music's licence. Five tracks ship in music/. The kit could not find where they came from; the owner confirms
   they may be sold in a paid app before submitting.

## Where each number comes from

| Claim | Source (sixfold room-polish c4d7a2c) |
|---|---|
| six stances and their names | `sixfold.src.html` STANCES (Heaven, Tiger, River, Earth, Crane, Shadow) |
| four hearts, clean takes two, glance one, across is a whiff | `src/engine.js` constants N=6, HP=4, CLEAN=2, GLANCE=1; the How to duel card |
| Drive, Slip, Trap | `src/stage.js` BINDS, the Clash prompt (shot 2) |
| after round six every blow strikes deeper | `src/engine.js` escalation after round 6; the Fury line "Every blow strikes deeper" |
| Insight, Foresight, Resolve buys information | `src/resolve.js`; the How to duel card; HANDOFF pillar 4 (inferred from the docs and code, the harness was not rerun) |
| eight foes and their names | `src/personalities.js` ids; the Choose foe list seen on screen |
| 70 duels on the Ascent, 70 in the Roster | seen on screen: "33 / 70 cleared", "34 / 70 earned" (shots 5, 6); `ASCENT[]` has 70 rungs, the last a title |
| 16 arenas | the Arena list in Choose foe, 16 entries (THEMES) |
| three trials a day | the Daily Duel screen (shot 8), TODAY'S TRIALS |
| four letter room code, a link | `src/firebase-net.js` codes A-Z 2-9 without I O 0 1; Share a link in the room |
| six emotes, a stance call, Quiet | `src/firebase-net.js` EMOTES; the room's Quiet switch |
| sunbeams buy banner colours | `sixfold.src.html` PREMIUM_PALS priced in sunbeams |
| the five accessibility switches | the Settings drawer, seen on screen |
| plays offline once loaded | the offline cold start check (READINESS.md), run 13 Nov |
