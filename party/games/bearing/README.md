# Bearing (working name)

A line runs between two opposites. One of you can see a hidden target on it. That
person says ONE WORD out loud. Everybody else points.

## ⭐⭐ Why this title exists, beyond being fun
The house rule is that player TEXT never reaches a screen, which is why Quiplash,
Fibbage and half the party genre were written off. **Speaking never touches a
screen at all.** Nothing here is typed, sent, stored or displayed: the Lantern's
phone only ever says "say one word out loud", and their only control is a button
saying they have said it.

So this game gets the richest and funniest input a person has, with no moderation
surface whatsoever. That is the door this title exists to prove is open, and most
of the genre we thought was closed is behind it.

## Files
| file | what it is |
|---|---|
| `content.js` | `window.BEARING_BANK`, 90 spectrum pairs. Generator prompt in the header. |
| `host.js` | host screen, target placement, scoring |
| `player.js` | phone screen, two consoles |
| `game.css` | both screens |
| `candidates.review.js` | Astra's 30 pairs, NOT LIVE, not reviewed (no page loads it) |

## What makes a pair work, and it is not being opposite
It is that a room can place ANY word somewhere along it and mostly agree. "Cozy
to Thrilling" works because a kitten, a thunderstorm and a hot bath all land
somewhere obvious. "Red to Blue" fails, because most things are neither and there
is nothing to reason about.

**Audit rule:** take three unrelated things, a kettle, a wolf and a birthday, and
try to place each on the pair. If any has no sensible place it is a category, not
a spectrum, and it is cut.

## Phases (18 Oct 2026, Astra's review BEARING-D01 to D04)
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 28 (Start now cuts it short; Short game toggles) | the four rule lines, the limits, a worked example (Quiet to Noisy, "Library"), the game's length | the same, on every phone |
| `clue` | 24, ends when the Lantern taps "I have given my clue" | the spectrum with NO spot, who can see it | Lantern: the spot (private message) plus "I have given my clue" and, once a round, "Need another pair". Everyone else: the two ends and who is choosing a clue |
| `guess` | 24, or the 3 s "All set" window once every eligible position is saved | the spectrum, "N of M positions saved" | a pointer to move and SAVE (an unsaved pointer is not a guess); the Lantern waits with their spot and the count |
| `reveal` | 10 | the bands (inside the line), the bullseye, every saved position by name and symbol, the legend, the verdict, the Lantern's average | the same line, your result in words, every saved position closest first, Show scores |
| `podium` | none | the table (tied scores share a place), then PLAY AGAIN, ANOTHER GAME, END NIGHT | your total and place |

A Lantern who never gives the clue voids the round (nobody scores) and gets ONE retry with a different pair.
Two full Lantern cycles: 6 to 16 rounds for 3 to 8 players; the Short game is one cycle. The Lantern order is shuffled
once, then cycled; a Lantern who has left is skipped.

## Scoring
| how close | points |
|---|---|
| within 5 | 150 |
| within 12 | 100 |
| within 20 | 50 |
| within 30 | 20 |

**The Lantern scores the room's average.** The average is over every ELIGIBLE guesser (in the room when the placing
opened), a missing position counting 0, rounded half up; no valid position pays nothing. A clue giver paid for
their own accuracy would just describe the target; paid for the room's accuracy, they have to think about how OTHER
people hear a word.

The spot is a whole number from 8 to 92, never in the trivially easy ends, and it only ever travels to the Lantern's
phone on its own message (never in a phase payload). The transport still delivers every message to every phone and
each phone drops what is not addressed to it, so a player with developer tools could read it; no screen shows it.

## Quarantined pairs (BEARING-D04)
Categories, matters of taste and ends that are not opposites are kept out of games in `host.js` (`QUARANTINE`, with
the reason for each): Morning to Night, Winter to Summer, Weekday to Weekend, Underrated to Overrated, Sour to
Creamy, Salty to Fresh, Everyday shoes to Best shoes, Homemade to Shop bought, Handmade to Machine made. Astra's 30
new pairs are parked in `candidates.review.js`, NOT LIVE.

## Storage
`br_used` on the host page only.

## Proof
```
node party/test/drive.js bearing 4
node party/test/bearing_rules.js
node party/test/notv_bearing.js
```
Note that the harness cannot say a word out loud, so it exercises every phase and
every control but always guesses from the middle. The spread is a thing to watch
for with real people.
