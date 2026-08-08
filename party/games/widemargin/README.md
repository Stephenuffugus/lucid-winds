# Wide Margin (working name)

Everybody guesses a percentage at the same time. The truth slides in. Nobody is
ever completely wrong, only further away.

This is the game Stephen remembered: *"guess what percentage of whatever was
whatever, and if you were within such a range there was points."*

## Files
| file | what it is |
|---|---|
| `content.js` | `window.WIDEMARGIN_BANK`, real sourced percentages. Generator prompt in the header. |
| `host.js` | host screen, the number line, scoring |
| `player.js` | phone screen, the dial |
| `game.css` | both screens |

## ⛔ The rule that outranks everything else in this game
**We never invent a number.** This bank is nothing but numbers, so a single made
up one poisons the whole game in a way a wrong trivia answer never could: a
player has no way to tell an invention from a fact. Every entry is a published
figure with a source that can be checked, and if a figure cannot be confirmed
the question does not exist.

**And nothing that drifts.** No populations, no market shares, nothing that will
quietly become false in three years and make a liar of us on somebody's
television. Physical, geographic, biological and historical constants only.

## Why simultaneous, when the game this borrows from does it one at a time
Guesspionage has one player guess while everybody else bets higher or lower. At
eight players that means one person plays and seven watch, seven eighths of the
round. Here everybody drags at once, so nobody waits, and the reveal is eight
coloured markers scattered across one line, which is funnier and is the best ten
foot readout in the pack.

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (NEXT cuts it short) | the four rule lines | what is coming |
| `question` | 22, ends early when everyone is in | the question and an empty number line, plus how many have guessed and never what | the question, a big number, a drag bar and nudge buttons |
| `reveal` | 9 | every marker on the line in its player's colour, the truth in gold, and the source | your result and what you said |
| `standings` | 8 after round 5 | everyone by score | your score |
| `podium` | none | the table, then PLAY AGAIN, ANOTHER GAME, END NIGHT | your final score |

Guesses stay private until the reveal, exactly like Firefly Futures. If markers
appeared as they landed the room would anchor on the first one, and the spread
IS the show.

## Scoring, deliberately generous
| how close | points |
|---|---|
| within 3 | 150 |
| within 7 | 100 |
| within 12 | 70 |
| within 20 | 40 |
| within 30 | 15 |
| closest in the room | 50 more |

**Nobody ever scores zero for a thoughtful guess.** A player who reasons their
way to within twenty has done something real. The charm of the format is that
being close is an achievement and being wrong is funny rather than punishing.

## The phone has three ways to set the dial
A slider alone is a bad phone control. You can drag the track for a rough sweep,
tap the big minus and plus for precision, and the number itself is enormous so
you always know what you are about to commit. Somebody who wants exactly 47 can
get exactly 47 without fighting their thumb.

## Storage
`wm_used` on the host page only.

## Proof
```
node party/test/drive.js widemargin 4
```
