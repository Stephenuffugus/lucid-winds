# Sky Wolf Studios: brief for a Claude building one party game module

Paste this whole file into the conversation of any model building a Whack Box
game module. It explains the shell you are building against, the rules you must
follow, and exactly how to prove you are done. Follow it literally. Every
number in this document is a decision that has already been made. Do not
redesign anything. If something seems ambiguous, it is answered somewhere in
this file; read it again before inventing.

## What you are building into

Whack Box (working name) is the Sky Wolf Studios party system: one host screen
on a TV, phones as controllers, a 4-character room code, no install for
guests. The room shell already exists and owns all networking. You are
building ONE game module that plugs into it. You never touch Firebase, never
open a socket, never manage a room code. You code against the shell API below
and nothing else.

WHACKBOX_PLAN.md in this repo is the program source of truth and holds the
full catalogue. This brief tells you how to build one module from it.

## File layout (exact)

```
party/
  shell/                 SHELL-OWNED. Never edit anything in here.
    host.js              window.PartyShell, host side
    player.js            window.PartyShell, player side
    firebase-config.js   transport config
    shell.css            room chrome, lobby, join form, reconnect toasts
  host.html              shell-owned router, loads your module via ?game=<slug>
  play.html              shell-owned phone entry (code + name), loads your player module
  games/
    <slug>/              YOURS. Everything you write lives here and only here.
      host.js            host-screen logic and rendering for your game
      player.js          phone logic and rendering for your game
      content.js         the entire content bank, one plain JS array
      game.css           your game's styles, both screens
      README.md          your handoff notes
```

Your module is vanilla JS, no frameworks, no build step, no imports of
anything outside your folder except the shell API. Screens are
absolutely-positioned `.screen` divs toggled with an `.on` class, and every
scrim is fully opaque (hard fleet lesson: near-opaque is not opaque, the layer
underneath bleeds through and reads as a broken screen).

House palette, use these tokens:

```css
:root{ --bg:#05070a; --night:#0b1018; --panel:#0c1119; --line:#26314a;
  --sage:#7ab356; --gold:#c8a84b; --warm:#ffd77a; --hot:#fff4d0;
  --cream:#e8dcc8; --muted:#8a9178; --ember:#e08a4a; }
```

Radial night gradient background, gold primary buttons
(`linear-gradient(#e8c063,#c08f34)` with dark gold text and a hard shadow),
warm title glow, uppercase letterspaced sub-labels, system font stack only.

## The shell API (this is the whole contract)

`window.PartyShell` exists before your module code runs. Host page gets the
host half, phone page gets the player half.

**Host side (used by games/<slug>/host.js):**

```js
PartyShell.createRoom(gameSlug)            // Promise<{code}>; shell renders the lobby
PartyShell.onPlayers(cb)                   // cb(players) on every change;
                                           // players = [{id, name, connected}]
PartyShell.onPlayerMessage(cb)             // cb(playerId, msg) for every phone message
PartyShell.sendToPlayer(playerId, msg)     // msg is a plain JSON-able object
PartyShell.broadcast(msg)                  // send to every connected phone
PartyShell.setPhase(name, data)            // sets the room phase; every phone's
                                           // onPhase fires with (name, data)
PartyShell.startTimer(seconds, onTick, onDone)
                                           // host-authoritative countdown; shell
                                           // mirrors remaining seconds to phones;
                                           // onTick(remaining) each second on host
PartyShell.stopTimer()
PartyShell.gameComplete(resultsByPlayerId) // {playerId:{score, place}}; the shell
                                           // calls the Cloud Function which mints
                                           // sunbeams for EVERY participant. You
                                           // never pass amounts. Call exactly once.
PartyShell.closeRoom()
```

**Player side (used by games/<slug>/player.js):**

```js
PartyShell.joinRoom(code, name)   // handled by play.html before your code loads
PartyShell.onPhase(cb)            // cb(name, data); ALSO fires immediately with the
                                  // current phase on load, which is how rejoin
                                  // works: a reloaded phone lands in the live phase
PartyShell.onMessage(cb)          // messages addressed to this phone
PartyShell.sendToHost(msg)
PartyShell.onTimer(cb)            // cb(secondsRemaining), mirrored from host
PartyShell.playerId               // stable across rejoin (token in localStorage)
```

Rules of the contract:

- The host is authoritative. Phones send intents, the host decides, the host
  sets phase. Never compute score on a phone.
- Phase data must contain everything a freshly rejoined phone needs to render
  that phase from nothing. Design every phase payload as if the phone just
  woke up, because it did: phones lock every single session.
- The shell handles host drop, presence, reconnect toasts, and the lobby. Your
  module starts working at the moment the shell hands you a started game and
  stops at `gameComplete`.
- Messages are small plain objects. No blobs over the transport except where a
  spec explicitly says so.

## Non-negotiables

1. **48px minimum RENDERED touch targets** on phones. Audit at 375x667 with
   getBoundingClientRect, not by reading your CSS.
2. **Ten-foot readable host screen.** At 1920x1080: main content text 56px or
   larger, room code 96px, player names 28px or larger, timers 64px. If a
   grandparent on the far couch cannot read it, it is wrong.
3. **No third-party requests.** No fonts, no CDNs, no analytics, nothing. The
   shell's Firebase endpoints are the only network traffic and the shell owns
   them.
4. **No em-dashes or en-dashes anywhere in player-visible copy** or in the
   content bank. House copy rule. Plain warm voice, complete sentences.
5. **Rules on the host screen before round 1.** Always. A rules phase is part
   of every module, no exceptions, players never learn by losing.
6. **Content bank is one plain JS array in content.js** with a documented
   generator prompt in a header comment, so the bank can be regenerated and
   audited by anyone later. No content anywhere else, not in logic files, not
   inlined in HTML.
7. **Never navigate, never history.back(), never reload on purpose.** All
   screen changes are internal div toggles. The shell owns the pages.
8. **No free player text is ever displayed anywhere.** Names come from the
   shell (it filters them). If your spec involves typed input, it is matched
   by code and never rendered. If you think your game needs displayed player
   text, stop: the game was specced not to.
9. **General audience.** Nothing spicy, nothing edgy, nothing that needs an
   age gate. When a fact or prompt feels borderline, it is out.
10. Respect `prefers-reduced-motion`: no ambient animation when set.

## Definition of done (self-verify every line before handing off)

Run all of this yourself. A line you did not run is not checked.

1. Syntax: run `node --check` (or a vm parse) on every JS file you wrote.
   Zero errors.
2. Serve the `party/` folder locally over HTTP (`python3 -m http.server` is
   fine).
3. Write a Puppeteer script that: opens host.html with your slug, creates a
   room, reads the code off the DOM, opens 3 more pages as phones, joins all
   3 with names, starts the game, and plays a COMPLETE game start to podium
   with the phones tapping valid inputs. It must finish without hanging.
4. Screenshot the host screen in EVERY phase, and one phone in every phase
   that has phone UI. Then OPEN the screenshots and look at them. Name what
   is wrong before anyone else does. A green script run is not a look.
5. Zero console errors on all four pages across the entire run. Capture the
   consoles in the script and assert on it.
6. Rejoin test: during a mid-game phase, reload one phone page. Within 5
   seconds it must be back in the live phase with its state intact, and the
   game must not have stalled for anyone else.
7. Dash audit: scan every file you wrote for the em-dash and en-dash
   characters. Zero hits.
8. Touch audit: at 375x667, assert every interactive element's rendered box
   is at least 48px in both dimensions.
9. Confirm from the screenshots that the rules phase rendered on the host
   before the first question, and that `gameComplete` was called exactly
   once with every participant present in the results.
10. README.md handoff in your folder: file manifest, every phase and what
    each screen shows, the content bank size and its generator prompt
    location, every localStorage key you touch (there should normally be
    none; the shell owns storage), and how to run your Puppeteer proof.

---

# WORKED EXAMPLE: MOTHLIGHT (slug: mothlight)

Build exactly this. Every decision is made. Zero design calls remain.

## The game in one paragraph

A true or false fact appears on the TV. Every player answers on their phone,
and the moment they answer, a moth with their name flies to that answer's
lantern on the TV, visible to the whole room. Anyone can change their answer
until the timer runs out. Being right pays. Being right when most of the room
was visibly wrong pays extra. The crowd is the puzzle.

## Players, length, structure

- 3 to 8 players. The shell enforces the minimum before start.
- 12 questions per game, played straight through with a standings break after
  question 4 and question 8.
- A full game runs about 8 minutes.

## Phases (the host drives these with setPhase, in this exact order)

`rules` then 12 cycles of `question` and `reveal`, with `standings` inserted
after the 4th and 8th reveals, then `podium`.

### Phase: rules (host taps NEXT, or auto-advance after 20 seconds)

Host screen shows the title and exactly these four lines, 56px, cream on
night, one blank line between each:

```
A fact appears. True or false?
Your moth lands on your answer for all to see.
Change your mind any time before the timer ends.
Right answers score. Brave right answers score more.
```

Phones show only: "Eyes up on the big screen." (32px, centered) and nothing
tappable.

### Phase: question (20 seconds, 12 times)

Host `setPhase('question', {num, total, text, endsAt})`. The host screen
shows:

- "QUESTION num OF 12" sub-label, uppercase, 28px, muted.
- The fact text, 56px minimum, cream, centered, max 3 lines.
- Two lanterns: LIGHT on the left labeled TRUE, SHADE on the right labeled
  FALSE. Labels 48px gold.
- The countdown, 64px, top center, turning ember colored at 5 seconds.
- A moth per answered player, name label 28px, hanging under the lantern they
  chose. When a player changes, the moth flies to the other lantern over 400
  milliseconds (instant reposition when prefers-reduced-motion).

Phones show the question number, the fact text at 22px, and two buttons that
each fill half the remaining screen height: TRUE (top) and FALSE (bottom),
minimum 120px tall each, 28px labels. Tapping sends
`sendToHost({t:'answer', q:num, v:true})` or `{v:false}`. The selected button
shows a gold border; tapping the other button changes the answer, allowed any
number of times until time is up. The mirrored timer renders at 40px.

Host records the LAST answer per player. At timer end the host locks answers
and moves to reveal. Players who never tapped simply score nothing; there is
no penalty and no callout.

### Phase: reveal (7 seconds, after every question)

Host `setPhase('reveal', {num, answer, source, correctIds, loneIds,
scores})`. The correct lantern glows warm, the wrong one dims to 40%
opacity. Moths on the correct side each show "+100"; lone moths show "+150".
Below the lanterns, 32px muted: "Source: " plus the source string. Scores
tick up on a persistent strip along the bottom of the host screen (all
players, name and score, 28px).

Phones show "Right, +100" (sage), "Lone moth, +150" (gold), "Not this time"
(muted), or "No answer" (muted), 40px centered, matching that player's
result. Nothing tappable.

### Phase: standings (8 seconds, after reveals 4 and 8)

Host shows "STANDINGS" and all players sorted by score, name 40px, score
40px gold, top player marked with a moth icon. Phones show their own rank
and score, 40px. Nothing tappable. Auto-advances.

### Phase: podium (no timer)

Host shows the top 3 large (1st center 64px, 2nd and 3rd at 48px), the full
scoreboard below at 32px, and the line "Everyone earned sunbeams for
playing." at 32px sage. Host has two buttons: PLAY AGAIN (starts a fresh 12
questions with new facts, same room) and END NIGHT (calls
`PartyShell.closeRoom()`).

On entering podium, the host calls `PartyShell.gameComplete(results)` exactly
once per game, with `{playerId: {score, place}}` for every player who was in
the room at start, including disconnected ones. Amounts are the server's
business, never yours.

Phones show their final place and score, and "You earned sunbeams." at 32px.

## Scoring (exact, computed only on the host)

- Correct answer at lock: +100.
- Lone moth bonus: +50 more if the correct side held a strict minority at
  lock. Strict minority means `correctCount * 2 < answeredCount`, where
  answeredCount counts only players who answered that question. Ties are not
  a minority.
- Wrong or no answer: 0. Never negative, never a penalty.

## Question selection (exact)

At game start the host picks 12 entries from the bank: shuffle a copy of the
full array with a Fisher-Yates shuffle using Math.random, take the first 12
whose ids are not in the used list, then append those 12 ids to the used
list stored at localStorage key `wb_mothlight_used` (a JSON array of ids, the
one storage exception the shell permits this module, host page only). When
fewer than 12 unused remain, clear the list and reshuffle. PLAY AGAIN
repeats this selection.

## Content bank (games/mothlight/content.js)

One file, one array, launch size 240 entries minimum with a target of 600.
Format:

```js
/* MOTHLIGHT FACT BANK
   Regenerate or extend with this exact prompt, then hand-audit every entry:

   "Write N true-or-false facts for a family party quiz. Rules: each fact is
   one complete sentence under 110 characters, checkable against a mainstream
   encyclopedia, general audience, no politics, no religion, no bodies, no
   violence, no brand names, no dash characters of any kind. Aim for half
   true and half false, and make several facts things people confidently get
   wrong. For each, output: the sentence, true or false, and a short source
   name (one recognizable reference). Output as a JS array of objects with
   fields id, text, answer, source, category. Categories: animals, space,
   food, history, science, world, words, plants."

   AUDIT RULE: a fact nobody verified does not ship. Check each answer field
   against the named source before committing. */
window.MOTHLIGHT_BANK = [
  {id:'ml-0001', text:'A group of moths can be called an eclipse.', answer:true,  source:'Merriam-Webster', category:'animals'},
  {id:'ml-0002', text:'Sealed honey can stay good to eat for thousands of years.', answer:true,  source:'Smithsonian', category:'food'},
  {id:'ml-0003', text:'Bananas grow on trees.', answer:false, source:'Britannica', category:'plants'},
  {id:'ml-0004', text:'The Eiffel Tower is a little taller in summer than in winter.', answer:true,  source:'Britannica', category:'world'},
  {id:'ml-0005', text:'Goldfish can only remember things for three seconds.', answer:false, source:'National Geographic', category:'animals'},
  {id:'ml-0006', text:'An octopus has three hearts.', answer:true,  source:'Britannica', category:'animals'},
  {id:'ml-0007', text:'Lightning never strikes the same place twice.', answer:false, source:'NOAA', category:'science'},
  {id:'ml-0008', text:'Venus is the hottest planet in our solar system.', answer:true,  source:'NASA', category:'space'},
  {id:'ml-0009', text:'Humans and giraffes have the same number of neck bones.', answer:true,  source:'Britannica', category:'animals'},
  {id:'ml-0010', text:'Bats are blind.', answer:false, source:'National Geographic', category:'animals'}
];
```

Bank rules: text under 110 characters, no dash characters anywhere, roughly
half true and half false overall, every entry audited against its source
before commit, ids sequential and never reused.

## Timers (exact, host-authoritative via startTimer)

- rules: 20 seconds auto-advance, host NEXT button can cut it short.
- question: 20 seconds.
- reveal: 7 seconds.
- standings: 8 seconds.
- podium: none.

## Earn moments

Exactly one: `PartyShell.gameComplete` at podium, once per game, every
participant included. The server mints for everyone, winner and losers
alike, and enforces all caps. The module contains no other economy code, no
postMessage earn calls, and no amounts.

## Done means

The full Definition of Done checklist above, run against this spec, with the
Puppeteer run answering randomly on all 3 phones, at least one game reaching
podium, screenshots of rules, question, reveal, standings, and podium on the
host plus question and reveal on a phone, the rejoin test performed during
question 6, and zero console errors end to end.
