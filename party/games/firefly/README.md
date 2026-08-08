# Firefly Futures (working name)

Answer a question about yourself, then bet on what the rest of the room said.

## Files
| file | what it is |
|---|---|
| `content.js` | `window.FIREFLY_BANK`, 284 yes or no prompts. Generator prompt in the header. |
| `host.js` | host screen, all game logic and scoring |
| `player.js` | phone screen, renders from phase payloads only |
| `game.css` | both screens |

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (NEXT cuts it short) | the four rule lines | eyes up on the big screen |
| `poll` | 12 | the prompt, and how many have answered | the prompt, YES and NO |
| `market` | 18 | the prompt, the question, unlit lanterns 0 to N, how many have bet | a number pad 0 to N |
| `reveal` | 8 | the true count lit, every player's chip under the number they bet | your result |
| `standings` | 8 after rounds 4 and 8 | everyone by score | your score |
| `podium` | none | top of the table, then PLAY AGAIN, ANOTHER GAME, END NIGHT | your final score |

Ten rounds. `PartyShell.gameComplete` is called exactly once, on entering
podium, with every player who was in the room at the start.

## Scoring
- exact count: 100
- one off: 40
- exact and the only one who had it: 130
- no bet or further out: 0, never negative

## Why the bets are private
Mothlight owns the public changeable answer and that is its whole show. If bets
were visible here the two titles would feel like one game. Everything stays shut
until the lanterns light, so the reveal is a single loud moment. Both screens
report how MANY have acted, never what they chose.

## Standing decision
The "spicy" prompt tier from the original pitch is CUT, not toggled off. It is
not written and does not exist in `content.js`. General audience.

## Storage
`ff_used` on the host page only, a map of prompt ids already played on this
device so a repeat night does not repeat prompts. The shell owns everything else.

## Proof
```
node party/test/drive.js firefly 3
```
Drives a full game to podium with three phones, taps with a real mouse at each
control's centre, reloads a phone mid game for the rejoin test, screenshots
every phase, and fails on any console error or any control under 48 rendered px.
