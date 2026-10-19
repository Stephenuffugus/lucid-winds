# Wide Margin (working name)

Everybody guesses a percentage at the same time and saves it. The truth appears, then every saved guess slides
onto one number line. Every saved guess earns something; closer earns more.

This is the game Stephen remembered: *"guess what percentage of whatever was whatever, and if you were within such a
range there was points."*

## Files
| file | what it is |
|---|---|
| `content.js` | `window.WIDEMARGIN_BANK` (real sourced percentages, generator prompt in the header) and three sidecars: `WIDEMARGIN_QUARANTINE` (never dealt, with the reason), `WIDEMARGIN_FAMILY` (one answer must not teach the next), `WIDEMARGIN_EXACT` (answers that are exact; every other one is "About") |
| `host.js` | host screen, the number line, scoring, the deck |
| `player.js` | phone: the whole room's view in both modes, the dial |
| `game.css` | both screens |
| `candidates.review.js` | Astra's 30 candidates with its evidence ledger. NOT LIVE, NOT FACT CHECKED, no page loads it |

## ⛔ The rule that outranks everything else in this game
**We never invent a number.** This bank is nothing but numbers, so a single made up one poisons the whole game in a
way a wrong trivia answer never could. Every entry is a published figure with a source; if a figure cannot be
confirmed the question does not exist. **And nothing that drifts:** no populations, no market shares, no ice cover
without a year. A figure is stored rounded half up (68.7 is 69), and the reveal says "About" unless it is exact.

## Phases (18 Oct 2026, Astra's review B7)
| phase | seconds | host screen | phone |
|---|---|---|---|
| `rules` | 24 (Start now cuts it) | the four rule lines, the hundred squares ("25% means 25 out of 100"), the game's length | the same |
| `question` | 26; once every eligible guess is saved (after 6 s) "All set. Finishing soon." for 3 s, still editable | the question, an empty line, "n of m guesses saved" | the question and the dial, a draft until Save guess |
| `reveal` | 10 | the truth ("About 71%"), the source, then every saved guess on the line by name and symbol, and each one's distance and points | the same, plus this phone's distance and points and a score panel |
| `standings` | 8, after round 5 | "Scores so far, after round 5 of 10" | the same, this phone marked |
| `podium` | none | the table, then Play again, Another game, End night | this phone's total and place |

Guesses stay private until the reveal: no screen shows another player's guess or name while a question is open.
(Data level: a phone's saved guess travels to the host on the room's shared channel; other phones receive it and
drop it unread. No screen shows it.)

## Scoring: every saved guess earns something
| distance (percentage points) | points |
|---|---|
| 0 to 3 | 150 |
| 4 to 7 | 100 |
| 8 to 12 | 70 |
| 13 to 20 | 40 |
| 21 to 30 | 15 |
| 31 to 100 | 5 |
| everybody tied for closest | 50 more each |

A guess counts only once SAVED: the dial is a draft (an untouched 50 is not a guess; a 50 saved on purpose is).
Saving again changes it. A missing guess scores nothing and is never the closest. No saved guess, no bonus.

## The deck
Ten questions. Never two of one family, never more than two science questions (the gases and the chemistry), no
topic more than three times, at least four topics, no two neighbours from the same topic, nothing quarantined, and
nothing this host has dealt recently (`wm_used` in localStorage) until the pool runs dry.

## No TV mode
`noTv:true` in the catalogue. Every phone is the room's screen and the host plays from its own seat.

## Proof
```
node party/test/widemargin_rules.js          the table at every distance, the fixtures, the quarantine, the deck, a played room
node party/test/notv_widemargin.js           phones only, live database, the host's seat plays a full game
node party/test/drive.js widemargin 4        the shared end to end driver
```
