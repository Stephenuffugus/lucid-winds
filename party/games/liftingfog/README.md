# Lifting Fog (working name)

Something in the fog tells you what it is, one clue at a time, and it is worth
less every time the fog lifts.

## Files
| file | what it is |
|---|---|
| `content.js` | `window.LIFTINGFOG_BANK`, 20 questions of 4 ordered clues. Generator prompt in the header. |
| `host.js` | host screen, all game logic and scoring |
| `player.js` | phone screen, renders from phase payloads only |
| `game.css` | both screens |

## Content format
Each entry has `options` (4 strings) and `clues` (4 strings, cryptic to obvious).

**`options[0]` is ALWAYS the correct answer.** The game shuffles the options
before showing them. This means an author can never mismatch an answer to an
index, and a reviewer can audit a line by reading it left to right.

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (NEXT cuts it short) | the four rule lines | eyes up on the big screen |
| `question` | 24, a clue every 6 | clues stacking, fog thinning, WORTH dropping, how many have locked in | the current clue, WORTH, and the same 4 options throughout |
| `reveal` | 7 | the answer, and who scored what | your result |
| `standings` | 8 after question 4 | everyone by score | your score |
| `podium` | none | top of the table, then PLAY AGAIN, ANOTHER GAME, END NIGHT | your final score |

Eight questions. A question ends early the moment everybody has locked in,
because dead air is the enemy of a party game.

## Scoring
100 at clue 1, 75 at clue 2, 50 at clue 3, 25 at clue 4.

**One answer only.** A wrong guess scores nothing and locks you out of the rest
of that question. Without that cost, guessing at clue 1 would be free and the
whole press your luck shape collapses into random tapping. This is the decision
that makes it a game.

## Two things the phone must not do
- The option order never changes between clue tiers. A tier change re-sends the
  phase, and `renderOpts` refuses to redraw when the options are the same list,
  so a button never moves under a thumb.
- A locked phone stays locked through every later tier of the same question.

## Storage
`lf_used` on the host page only. The shell owns everything else.

## Proof
```
node party/test/drive.js liftingfog 3
```
