# Firefly Futures (working name)

Answer a Yes or No question about yourself (or pass), then guess how many of the answers were Yes.

## Files
| file | what it is |
|---|---|
| `content.js` | `window.FIREFLY_BANK`, 284 yes or no prompts. Generator prompt in the header. |
| `host.js` | host screen, all game logic and scoring (`window.__firefly` is the test surface) |
| `player.js` | phone screen, renders from phase payloads only; the whole room's view in both modes |
| `game.css` | both screens |
| `candidates.review.js` | Astra's 30 new prompts, NOT LIVE, NOT REVIEWED (no page loads it) |

## Phases (internal ids; no player reads the words bet or market)
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 24 (Start now cuts it short) | the four rule lines, the 130 rule, a worked example, the honest privacy line | the same |
| `poll` | 15 | the question, how many have answered | YES, NO and a quiet Pass, "Sending" then "Saved" |
| `void` | 5 | "Too few answers this time. Let us try another question." | the same; nothing about the answers |
| `market` | 18 | "How many of these M answers were Yes?", unlit lanterns 0 to M, how many guesses are saved | the question, M, a 0 to M grid, "Your guess", this phone's own answer (to it alone) |
| `reveal` | 9 | the total first, then every guess by name and symbol under its number, with points | the same, this phone's result, Show scores |
| `standings` | 8 after rounds 4 and 8 | scores so far | scores so far, your place |
| `podium` | none | the table, Play again, Another game, End night | your total and place; the host's seat gets the controls in its bar |

Ten rounds. Answer and guess are both editable until time runs out; once everyone eligible has saved (after 6 s)
the room gets "All set. Finishing soon." for 3 s, never restarted. `PartyShell.gameComplete` is called exactly once,
on entering podium.

## The denominator (Astra FIREFLY-D01)
Only saved Yes or No answers count. When the poll closes the room freezes M (answers) and Y (Yes). A Pass or a missing
answer is left out of M and is never a No. Everyone may guess, including people who passed. Fewer than three answers
voids the round without showing the count, and the same round number gets one more question (then moves on).

## Scoring
- exact: 100 (a tie gives every exact guess 100)
- the only exact guess in the room: 130 in total
- one away: 40 (at both ends of the range too)
- anything else, or no guess: 0, never negative

## Privacy, honestly (Astra FIREFLY-D02)
Answers are never attached to names on any screen and never travel in a phase payload; each phone hears its own answer
back privately. The copy says only that the total is shown, and the rules say plainly that in a small room a total
can give an answer away (a total of 0, or of everybody, tells everybody), which is why every prompt is a light one.
Data level, not fixed: a phone sends its answer to the host over the room's channel, which other phones receive and
drop; a curious player with developer tools could read it. A server held tally is the director's call.

## Why the guesses are private
Mothlight owns the public changeable answer and that is its whole show. If guesses were visible here the two titles
would feel like one game. Everything stays shut until the lanterns light, so the reveal is a single loud moment. Both
screens report how MANY have acted, never what they chose.

## Standing decision
The "spicy" prompt tier from the original pitch is CUT, not toggled off. It is not written and does not exist in
`content.js`. General audience.

## Storage
`ff_used` on the host page only, a map of prompt ids already played on this device so a repeat night does not repeat
prompts. The shell owns everything else.

## Proof
```
node party/test/firefly_rules.js        # the denominator, the void, scoring fixtures, payload privacy (practice room)
node party/test/notv_firefly.js         # no TV mode, live database, the host's seat plays a full game
node party/test/drive.js firefly 3      # real taps to the podium, a phone reloaded mid game, 48 px controls
```
