# First Frost (working name)

Trivia knockout where the people you knock out do not leave. They become the
Frost, and before every question they vote on how to make the next one worse.

## The standing rule that shapes this module
WHACKBOX_PLAN: *it ships only if the Frost console is the headline and the
trivia is the backdrop, never the reverse.* That is why the questions are fair
rather than fiendish, why the chosen power is announced in the largest text on
the screen, and why the Frost carry their own score and their own line on the
podium. If this ever reads as a trivia game with a gimmick, it has drifted.

## Files
| file | what it is |
|---|---|
| `content.js` | `window.FIRSTFROST_BANK`, 40 multiple choice questions. Generator prompt in the header. |
| `host.js` | host screen, all game logic and scoring |
| `player.js` | phone screen, TWO consoles in one module |
| `game.css` | both screens |

`options[0]` is ALWAYS correct and the game shuffles before showing, same rule
as Lifting Fog.

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (NEXT cuts it short) | the four rule lines | eyes up on the big screen |
| `vote` | 10, skipped while nobody is frozen | the three powers, how many Frost have chosen | Frost: the power buttons. Living: a warning. |
| `question` | 20, halved by CHILL | the power in play, the question, the options, the mark ledger | Living: question and options. Frost: their power is in play. |
| `reveal` | 7 | the answer, who took a mark, who joined the Frost | your result |
| `podium` | none | who outlasted the frost, the coldest ghost, the table | your final score |

Up to 12 questions. It ends early the moment one living player remains.

## The three powers
| power | what it does |
|---|---|
| CHILL | the clock is cut in half |
| FOG | the question stays hidden until half the clock is gone |
| DEEP FREEZE | a wrong answer costs two marks instead of one |

Frost majority wins the vote. Three is deliberate: a power has to be readable
from the far couch in one line, and four was one too many to hold in your head.

## Scoring
- living, correct answer: 100
- last living player: 300 more
- Frost: 40 for every mark their power helped land, and never for the round that
  froze them

An eliminated player is still playing for something. That is the whole point of
the format.

## Which console a phone shows
From the `frozen` map inside every phase payload, never from local state, so a
phone that locks and rejoins always wakes up on the right console.

## Storage
`fr_used` on the host page only. The shell owns everything else.

## Proof
```
node party/test/drive.js firstfrost 4
```
Four players minimum, enforced by the shell from `catalogue.js`.
