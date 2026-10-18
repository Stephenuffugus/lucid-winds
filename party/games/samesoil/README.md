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
| `content.js` | `window.SAMESOIL_BANK`, 206 either or pairs. Generator prompt in the header. |
| `candidates.review.js` | Astra's 30 new pairs, NOT LIVE, not reviewed, loaded by nothing |
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

## Phases (18 Oct 2026, Astra's review B6, SAMESOIL-D01 to D03)
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 24 (Start now cuts it short) | the four rule lines, the scoring line, this game's length; a Short game switch | the same rules and length |
| `pick` | 16, ends the moment the chooser taps "This is my pick" | who is choosing and the two things | chooser: select, then "This is my pick". Everyone else: the pair and "What do you think {name} will choose?" |
| `guess` | 18; once every eligible guess is saved (after 6 s) the room gets "All set. Finishing soon." for 3 s, still editable | the two things, "{n} of {m} guesses saved" | guessers: two buttons, "Sending" then "Guess saved". Chooser: their own choice, told to that phone alone |
| `reveal` | 9 | the chosen side lit, the chips (name and symbol) of everybody who called each side | the same, your result, your total, a Show scores panel |
| `reveal` (void) | 6 | "no choice was saved", the round does not count | the same |
| `podium` | none | the table, then PLAY AGAIN, ANOTHER GAME, END NIGHT | the table, your place |

## Rounds (SAMESOIL-D01): every player chooses the same number of times
Standard: 12 rounds for 2, 3, 4 and 6 players, 10 for 5, 14 for 7, 16 for 8. Short: two turns each (two players: four
each, 8 rounds). The chooser order is shuffled once, then cycled. A chooser who has left is skipped. A chooser who does
not choose in time voids the round (no points) and gets ONE retry with a spare pair.

## Scoring
- a correct guess: 100
- the chooser: 40 for every correct guess
- a missing guess: nothing, and it is not a wrong guess either

## No big screen (catalogue noTv:true)
Every phone shows the whole room, phase by phase, and the host plays from its seat (the chooser role rotates through
it like anybody). The chooser's pick is never in a phase payload before the reveal (data level: the transport still
delivers every message to every phone, which drops what is not addressed to it; no SCREEN shows it).

## Storage
`ss_used` on the host page only. The shell owns everything else.

## Proof
```
node party/test/drive.js samesoil 3
node party/test/drive.js samesoil 2   # a couple on a sofa
node party/test/samesoil_rules.js     # turns, voids, scoring fixtures
```
