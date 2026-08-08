# Same Soil (working name)

One of you picks which of two things is more them. Everybody else guesses.

## Why it is in the pack
It is the only title that works at **two players**, and a couple on a sofa is a
real party size. It is also the only one where the right answer belongs to a
person instead of to the world, which is what makes it safe to play with a child
or with somebody you met an hour ago: **nobody can ever be told they are wrong
about themselves.**

## Files
| file | what it is |
|---|---|
| `content.js` | `window.SAMESOIL_BANK`, 96 either or pairs. Generator prompt in the header. |
| `host.js` | host screen, subject rotation, scoring |
| `player.js` | phone screen, two big buttons |
| `game.css` | both screens |

## ⚖ The art decision, recorded
WHACKBOX_PLAN specs this title with roughly 720 small illustrations, and that
art pipeline is the critical path. **v1 ships authored WORD PAIRS instead**: two
or three words a side, large on the TV, readable at ten feet, costing nothing.
Illustrations are an upgrade that drops into the same bank as an `art` field per
side. Shipping words first means the game exists while the art is drawn, and it
means the pairs get playtested before anybody paints 720 of anything.

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (NEXT cuts it short) | the four rule lines | eyes up on the big screen |
| `pick` | 14, ends early the moment the subject decides | who the subject is and the two things | subject: the two things. Everyone else: think about it. |
| `guess` | 16, ends early when everyone has guessed | the two things again | everyone but the subject: which is more them |
| `reveal` | 8 | the chosen side lit, with the chips of everybody who called it | your result |
| `podium` | none | the table, then PLAY AGAIN, ANOTHER GAME, END NIGHT | your final score |

Rounds are chosen so every player is the subject the same number of times, 10 to
12 depending on the room.

## Scoring
- guess the subject correctly: 100
- the subject: 40 for every person who knew them

A subject can never lose by answering honestly, and being read well pays.

## Storage
`ss_used` on the host page only. The shell owns everything else.

## Proof
```
node party/test/drive.js samesoil 3
node party/test/drive.js samesoil 2   # the size nothing else in the pack has
```
