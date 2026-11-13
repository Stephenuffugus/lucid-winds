# Sixfold: the friend room and a clearer duel (Fable, 13 Nov 2026)

Stephen and Jessie played the first live friend duel on 13 Nov. His words: "Sixfold worked great! It throws off
a little that something is highlighted in red. Is that my last move? I don't know. It could use a little cleaner
UI and explanation and then when we finish the first duel it automatically put us in matches against the
computer when one of us said something instead of maybe going to a lobby where you could use emotes or
something to play a little psychological game before the round and vote on a rematch or something."

Source repo: `/workspaces/sixfold` (upstream `Stephenuffugus/sixfold`, `main` = 691b500, live). Build on a new
branch `friend-room`. The page is built from `sixfold.src.html` + `src/*` by `node tools/build.js`.

## What he met (read in the code, 13 Nov)
- **The red highlight is the rival's pick.** At the reveal your stance gets `.node.ppick` (gold) and the rival's
  gets `.node.apick` (seal red); both the same is `.node.both` (white). `sixfold.src.html:1145, 1162, 210, 215`.
  Nothing on screen says which is which.
- **"Done" drops you into solo play.** The friend result card (`showFriendResult`, `:2246`) offers "Play again ·
  CODE" and "Done". "Play again" only works if BOTH tap it; "Done" calls `leavePvp()` and lands on the normal
  board, which is a duel against the computer. There is no shared place after a duel.

## Laws
- Work alone; Bash only for file writes; one headless browser at a time; never push `main` in either repo; no
  deploy; no vendoring.
- Keep the pillar in `HANDOFF_SIXFOLD.md` section 3 and the commit-reveal fairness: nothing a player sends
  before the reveal may leak or change a committed pick.
- Tests: all suites and `node tools/domcheck.js` stay green; new logic gets unit tests against the in-memory
  database; `tools/two_player_smoke.mjs` is extended to walk the room (below) and run once at the end against
  the live database (the rules already allow everything under `sixfold/friends/<CODE>`; no rules change).
- One look per new screen at 412x915, opened from `/tmp` and read.
- Player text: plain, short, no en or em dashes. Emoji are fine on phones; give every emote a word too.
- Bump `CACHE` in `sw.js`.

## F1. Say whose pick is whose
- At the reveal, a small tag on each lit stance: "You" on the gold one, the rival's name on the red one (the
  friend's name in a friend duel, "Rival" in a ranked one, the Sentinel's name against the computer), "Both" on
  the white one.
- The verdict line names both stances in words: for example "Your Crane cuts Jessie's Tiger" (use the game's
  own verbs for clean, glance, whiff and clash; stance names are in `STANCES`, `:910`).
- The bar that turns red when you are "readable" gets a three word label so red there is not a mystery either.
- First friend duel only: a three line card, "Pick in secret. Both reveal together. Gold is yours, red is
  theirs." One tap closes it; a flag remembers it.

## F2. The friend room (the lobby he asked for)
A friend code is a ROOM that outlives a duel. Data lives under the existing private path
`sixfold/friends/<CODE>/room` (presence for two seats, a score, the last emote from each seat, ready flags).
- **Entering.** "Get a code" and "Join" both land in the room, not straight in a duel. The room shows the two
  players by name, the code, and the session score (0 to 0 at first).
- **Ready.** One button, "Ready". When both are ready a short 3, 2, 1 runs and the duel starts. If only one is
  ready the other sees "Jessie is ready".
- **After a duel.** The result shows inside the room: who won, the score updated (for example "You 1, Jessie
  0"). The same "Ready" button is the rematch vote. Nobody is moved anywhere without tapping.
- **Leaving.** One clearly worded button, "Leave the room". The one who stays sees "Jessie left the room" and
  stays in the room, with "Wait here" and "Leave the room". Nobody is ever dropped into a duel against the
  computer from a friend room.
- The heading of this screen is "Play a friend", never "Ranked Duel".
- **A link, not only a code.** The room offers "Share a link": `https://lucidwinds.com/satellites/sixfold/?room=<CODE>`
  (and the same on the upstream Pages address). Opening it lands straight in that room. This is how a duel gets
  passed around, so it must work from a cold install: the page loads, the first run card is skipped or kept to
  one tap, then the room.

## F3. Emotes and the bluff (the psychological game)
- An emote bar in the room and, as one small button that opens it, during the choosing phase of a round:
  six emotes, each with a word (for example Smirk, Eyes, Gasp, Respect, Fire, Yawn). The rival sees the emote
  as a bubble by their name for about three seconds. A sender may send at most one every two seconds.
- **The call.** In the room and during choosing, a player may "call" a stance: tap "I am going..." and a
  stance; the rival sees "Jessie says: Crane". It is only talk. It never touches the committed pick and is
  never checked: it can be a lie. This is the mind game he asked for.
- Emotes and calls are plain small writes beside the duel (`.../room/say/<seat>`); they must not ride on or
  delay the commit-reveal messages, and a flood of them must not stall a round.
- A "Quiet" switch in the room mutes the rival's emotes and calls for that player.

## F4. Small cleanings
- The duel screen's leftover gap between the tier card and the buttons; the Close button's style, checked in a
  shot this time.
- Anything in the friend path that still says "ranked" or "rival" where it means "friend".

## Next, not in this build: the public lobby (Stephen, 13 Nov: "we should have a matchmaking lobby duels so we can get people actually playing and dueling random opponents. We will want to build to this")

"Find a rival" already searches a public lobby and has been live since 13 Nov; two lone humans match after
about 13 seconds. What stands between that and strangers duelling, in the order to build it:
- **L1. Safe for strangers (required first).** Anonymous sign in, and database rules keyed to the signed in
  id (the rules inside `sixfold/` are open today); a real id per player (`Rank.createLadder` gives every fresh
  install the same id; online play papers over it with a random id per page load); a per round timeout and a
  short reconnect grace, so a player who switches apps cannot hang the other; ratings that cannot be written
  by hand (a Cloud Function or rule validation); old duel records cleaned up.
- **L2. A lobby you can see.** Who is online (a count, names and tiers), a visible search, and the same room
  as F2 after every duel: ready for a rematch, emotes, or "Next rival".
- **L3. Someone to fight when nobody is online.** The honest problem is not code: with few players, a random
  search usually finds no one. Sentinels already fill in. Better: **ghost duels**, a recorded real player's
  habits played back by the predictor the game already has, clearly labelled as a ghost, so there is always a
  "human" to beat and a real name on the other side. Fable's recommendation.
- **L4. The ladder.** A global top list and your own neighbourhood, replacing "Your standing".
- **L5. Getting people in.** The room link from F2 on Reddit and the arcade; a set "duel hour" so players
  arrive together; the publishing board for the store listing.
Each of L1 to L4 is its own build with its own plan. L1 needs a functions deploy and a rules deploy, his.

## The end
All suites, domcheck, the extended smoke once against the live database (two phones: room, ready, a duel, an
emote seen on the other phone, a call seen on the other phone, the result in the room, ready again, a second
duel starts, one leaves and the other stays in the room). Commit on `friend-room`, push that branch with
`GIT_TERMINAL_PROMPT=0 env -u GITHUB_TOKEN -u GH_TOKEN git -c credential.helper= -c 'credential.helper=!gh
auth git-credential' push origin friend-room`. Report per step: commit, what changed, test counts, what you
saw. The lead writes the deploy line from `/home/codespace/lw-drafts/deploy-sixfold-multiplayer.sh`.
