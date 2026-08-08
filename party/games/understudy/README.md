# The Understudy (working name)

A role appears and the room decides which of you it belongs to.

## ⚖⚖ This title shipped with a condition, and here is how it is met
WHACKBOX_ROUND2 scored it 39 with a flag attached: **this genre can turn into a
room ganging up on one person.** It only ships if a hundred roles can be written
that nobody would be hurt to be given.

The rule that makes that possible is in `content.js` and it is the most important
line in this folder: **every role is a charming quirk, never a virtue and never a
failing.** A bank of virtues is a popularity contest with extra steps. A bank of
failings is cruelty with a scoreboard. The register that works is affectionate
recognition, and the test is that BOTH ENDS of a habit are fine to be:

> The one who reads the instructions twice
> The one who has never read an instruction

Neither is an insult. Both are somebody at the table, and both should make that
person laugh and say yes, that is me.

**Audit rule for adding more:** read the role, then imagine the quietest person
at the table being chosen for it in front of everyone. If they would be pleased
or amused, keep it. If they would be embarrassed, cut it. There is no third
outcome, and no mechanical check can do this for you.

## Files
| file | what it is |
|---|---|
| `content.js` | `window.UNDERSTUDY_BANK`, 104 roles. Generator prompt and the cut list in the header. |
| `host.js` | host screen, tally, scoring |
| `player.js` | phone screen, one button per other player |
| `game.css` | both screens |

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (NEXT cuts it short) | the four rule lines | what is coming |
| `vote` | 20, ends early when everyone is in | the role, and how many have voted, never who for | the role and a button for every player except you |
| `reveal` | 9 | who the room chose, and the whole tally | your result |
| `podium` | none | the table, then PLAY AGAIN, ANOTHER GAME, END NIGHT | your final score |

Rounds are twice the room size, capped at twelve.

## Scoring
- vote with the room: **100**
- be the one the room chooses: **80**

Both can happen at once. **The chosen player scores** because being recognised
has to pay: otherwise the person the room keeps picking collects a running joke
and no points, and that is a bad seat to sit in for ten rounds.

## Two rules that are not decoration
- **You cannot vote for yourself.** Without it this is a race to claim the best
  roles. With it, the game is about how you see each other.
- **Your own name is not on your list**, removed on the phone as well as refused
  by the host. A control a player can see and press that silently does nothing is
  worse than no control: they press it, watch nothing happen, and conclude the
  game is broken.

## Storage
`us_used` on the host page only.

## Proof
```
node party/test/drive.js understudy 4
```
