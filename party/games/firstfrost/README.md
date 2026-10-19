# First Frost (working name)

Trivia knockout where the people you knock out do not leave. They become the Frost, and before every question they
choose the weather that changes it for whoever is still standing.

## The standing rule that shapes this module
WHACKBOX_PLAN: *it ships only if the Frost console is the headline and the trivia is the backdrop, never the
reverse.* That is why the questions are fair rather than fiendish, why the chosen weather is announced in the largest
text on the screen before any clock runs, and why the Frost carry their own points and their own podium panel.

## The law (19 Oct 2026, Astra's review FIRSTFROST-D01 to D04; the same words on every screen)
- Three frost marks turn you into the Frost. A wrong answer or no answer adds one mark; Deep Freeze adds two, never
  past the three that freeze you. A right answer earns 100.
- Every answer of a question resolves at once, then anybody at three marks joins the Frost, then the ending is
  checked:
  - one player still standing: the last survivor, +300, once;
  - nobody still standing: "Everyone became the Frost together." (no bonus, no invented survivor);
  - twelve questions done: "Twelve questions complete. Still standing: …" (no bonus);
  - nobody still standing is here when a question opens: "Nobody still standing is here."
- The Frost frozen at the start of a round (and here when its vote opens) choose its weather in a private, editable
  vote, 10 s at most, with the shared "All set. Finishing soon." window. The most chosen weather wins; a tie rotates
  Chill, Fog, Deep Freeze starting after the last winner; no votes, no weather.
- Each of those Frost earns 40 weather points for every frost mark that round actually added to a player still
  standing (a mark past the third counts for nothing), whether or not their own choice won. Somebody frozen this
  round earns nothing for it and votes from the next round.
- A player still standing who was away when a question opened takes no mark for it (SHELL-D11).

## Files
| file | what it is |
|---|---|
| `content.js` | `window.FIRSTFROST_BANK`, 307 multiple choice questions, and `FIRSTFROST_QUARANTINE` (5 kept out, each with why). |
| `candidates.review.js` | Astra's 30 candidates, NOT LIVE, NOT FACT CHECKED. No page loads it. |
| `host.js` | host screen, all game logic and scoring; `window.__firstfrost` is the read only test surface. |
| `player.js` | phone, the whole room's view in both modes (two jobs in one module). |
| `game.css` | both screens |

`options[0]` is ALWAYS correct in the bank and the game shuffles before showing, same rule as Lifting Fog.

## Phases
| phase | seconds | what it is |
|---|---|---|
| `rules` | 20 (Start now cuts it short) | the law, both jobs, an example; the host can turn on More reading time |
| `vote` | 10 (15 with more reading time), skipped while nobody is frozen | the Frost choose; everybody else sees the three effects and the count |
| `weather` | 3 | the chosen weather, on every screen, before the question clock |
| `question` | 24; Chill 12; Fog 24 with the choices after 8; Deep Freeze 24; all x1.5 with more reading time | choose, then Final answer (one, irreversible); ends early once everybody here has answered |
| `reveal` | 9 | the answer, who knew it, the marks added, who joins the Frost, the weather points |
| `podium` | none | the ending, a Survival panel and a Frost panel (never one combined ranking) |

Up to 12 questions.

## The three kinds of weather
| weather | what it does |
|---|---|
| CHILL | Half the answering time. |
| FOG | Read the question. The choices appear after a short wait (and are in no payload until then). |
| DEEP FREEZE | A wrong answer or no answer adds two frost marks. |

## Which job a phone shows
From the `frozen` map inside every phase payload, never from local state, so a phone that locks and rejoins always
wakes up on the right job. A rejoined phone asks the host privately for its saved answer (`mine?`) or weather
(`vmine?`).

## Privacy (reported)
No question payload names the answer; under Fog the choices are in no payload until they appear; answer and weather
acknowledgements go to one phone. Data level, not fixed: a phone's final answer and a Frost vote travel to the host
as intents on the room's channel, which other phones receive and drop; no screen shows them.

## Storage
`fr_used` on the host page only. The shell owns everything else.

## Proof
```
node party/test/firstfrost_rules.js          # the law, every ending, the weather, the vote, the payloads
node party/test/notv_firstfrost.js           # phones only, the host seat plays, a full game to the cap
node party/test/drive.js firstfrost 4
```
Four players minimum, enforced by the shell from `catalogue.js`.
