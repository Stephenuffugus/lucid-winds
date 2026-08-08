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

## What makes a pair work, and it is not being opposite
It is that a room can place ANY word somewhere along it and mostly agree. "Cozy
to Thrilling" works because a kitten, a thunderstorm and a hot bath all land
somewhere obvious. "Red to Blue" fails, because most things are neither and there
is nothing to reason about.

**Audit rule:** take three unrelated things, a kettle, a wolf and a birthday, and
try to place each on the pair. If any has no sensible place it is a category, not
a spectrum, and it is cut.

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (NEXT cuts it short) | the four rule lines | what is coming |
| `clue` | 18, ends the moment the Lantern says they have spoken | the spectrum with NO target, and whose turn it is | Lantern: the spectrum WITH the target and one instruction. Everyone else: listen. |
| `guess` | 22, ends early when everyone is in | the spectrum, and how many have pointed | a pointer to drag |
| `reveal` | 9 | the target bands, the bullseye, every pointer in its player's colour | your result |
| `podium` | none | the table, then PLAY AGAIN, ANOTHER GAME, END NIGHT | your final score |

Rounds are chosen so everybody holds the Lantern the same number of times.

## Scoring
| how close | points |
|---|---|
| within 5 | 150 |
| within 12 | 100 |
| within 20 | 50 |
| within 30 | 20 |

**The Lantern scores exactly what the room averaged.** A clue giver paid for
their own accuracy would just describe the target. Paid for the room's accuracy,
they have to think about how OTHER people hear a word, which is the actual game.

The target never sits in the outermost 8 per cent, where a clue is trivially
easy.

## Storage
`br_used` on the host page only.

## Proof
```
node party/test/drive.js bearing 4
```
Note that the harness cannot say a word out loud, so it exercises every phase and
every control but always guesses from the middle. The spread is a thing to watch
for with real people.
