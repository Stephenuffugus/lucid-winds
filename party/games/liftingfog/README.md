# Lifting Fog (working name)

Four clues describe one thing, from vague to plain. Answer early for more points, or wait for the fog to lift.

## Files
| file | what it is |
|---|---|
| `content.js` | `window.LIFTINGFOG_BANK` (140 questions of 4 ordered clues) and `window.LIFTINGFOG_QUARANTINE` (12 ids never dealt, each with its reason). Generator prompt in the header. |
| `host.js` | host screen, all game logic and scoring |
| `player.js` | phone screen, renders from phase payloads only (the whole room's view in both modes) |
| `game.css` | both screens |
| `candidates.review.js` | Astra's 30 new ladders, NOT LIVE, NOT FACT CHECKED (no page loads it) |

## Content format
Each entry has `options` (4 strings) and `clues` (4 strings, vague to plain).

**`options[0]` is ALWAYS the correct answer.** The game shuffles the options before showing them, so an author can
never mismatch an answer to an index and a reviewer can audit a line by reading it left to right.

**Audit the ladder, not just the answer** (Astra, LIFTINGFOG-D03): every literal clue must be true as worded (poetry
cannot excuse misleading science), clue 1 must leave at least two options plausible, and clue 4 must leave exactly
one. A clue that fails goes into `LIFTINGFOG_QUARANTINE` with its reason until it is rewritten and checked.

## Phases (Astra's review, 18 Oct 2026)
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (Start now cuts it short) | the four rule lines, an example, the reading pace, More reading time | the same rules |
| `question` | 32: four 8 s clues (12 s each with More reading time) | clues stacking, fog thinning, the points now, Next clue in N, who has saved (never what) | every clue so far in order, clues still to come with their worth, four options, Answer now for N, who has saved |
| `reveal` | 9 | the answer, the four clues with their points, everyone's clue and points | your outcome first, the answer, the clues, everyone this round |
| `standings` | 8 after question 4 | scores so far | scores so far, your place |
| `podium` | none | Game complete, PLAY AGAIN, ANOTHER GAME, END NIGHT | Game complete, your total |

Eight questions. A question ends early once every eligible player still here has saved a final answer (answers are
irreversible, so there is no edit window to wait out).

## Scoring
100 at clue 1, 75 at clue 2, 50 at clue 3, 25 at clue 4: the clue showing when the HOST accepts the answer, never a
number a phone declares. A wrong answer scores nothing; no answer is "No answer saved this round", never wrong.

**One answer only.** Tapping an option only selects it (nothing is sent); "Answer now for N" commits it once. A second
commit for the same question is answered with the stored one and can never replace it. Without that cost, answering
at clue 1 would be free and the whole wait or risk shape collapses into random tapping.

## Things the phone must not do
- Move an option under a thumb. The options and Answer now sit in a fixed foot; the clue stack grows in its own panel
  above, and everything that changes size (who has saved) lives above that panel. `liftingfog_rules.js` measures it.
- Redraw the options on a tier change, or lose a selection.
- Show anybody's choice before the reveal.

## Privacy (reported)
No phase payload carries a clue before its tier or marks the correct option before the reveal; every acknowledgement
is addressed to one phone. Data level, not fixed: a final answer reaches the host as an intent on the room's channel,
which other phones receive and drop.

## Storage
`lf_used` on the host page only. The shell owns everything else.

## Proof
```
node party/test/liftingfog_rules.js          # D01 to D04, privacy, quarantine
node party/test/notv_liftingfog.js [base]    # phones only, the host seat plays (live database)
node party/test/drive.js liftingfog 3
```
