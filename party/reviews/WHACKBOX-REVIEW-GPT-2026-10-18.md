# WHACK BOX REVIEW, GPT, 18 October 2026

Prepared for Sky Wolf Studio and Claude. This is a complete improvement handoff based on the supplied WHACKBOX ASTRA BRIEF, including its design notes, sample content, screen text and embedded screenshots. I have not played the live build or inspected its code. Fun scores are design judgments, not playtest results. Proposed timings are starting values to test.

Keep the nine prototypes, but finish a smaller, dependable party experience first. The strongest identity is a room discovering how differently people think, with Moongraft providing a creative break. Prioritize the shared shell, Mothlight, Same Soil and Moongraft. Hold The Understudy out of the default family playlist until its recognition mechanics have passed real mixed age testing.

Instructions to Claude: inspect the existing implementation before changing it. Preserve working transport, room identity and content unless a direction below requires a change. Implement one game at a time after the shell foundation. Each numbered direction is a reviewable task; section D contains exactly those tasks. P0 means correctness or a prerequisite for dependable play, P1 means the next playable improvement, and P2 means an experiment after the core passes. S, M and L are relative effort, not delivery promises. Do not implement P2 experiments automatically. No prices, advertisements, currency rewards, typed answers, accounts or online matchmaking are requested.

There are 270 authored content candidates, 30 per game. They are additions for editorial review, not replacements for the existing banks. Only sample entries were supplied, so Claude must check new IDs and semantic duplicates against the complete repository. New IDs use a review namespace. Do not silently renumber shipped IDs. Factual entries have supporting references within this file. Sources support the underlying facts; clue difficulty, friendliness and enjoyment still require human testing. No new factual entry is certified for release merely because it appears here.

## A. THE SHELL

### Directions

**SHELL-D01 | P0 | L | Make phone play complete without duplicating secrets**

Where: both. Screen: mode selection and every game phase. Change: offer “Shared screen” and “Phones only” before opening the lobby. Both use the same room and game state. In Phones only, the host is also a normal participant on the same page, with a separate collapsed Room controls panel. Use a public phase view plus a recipient specific private view. Do not broadcast a Bearing target, Same Soil pick, Firefly poll response, future clue, answer key or unfinished Moongraft drawing to other players and merely hide it with CSS. A shared display is an optional public viewer, never a participant or a secret viewer. Why: every player can follow play from their seat without giving the host an unfair advantage. Acceptance: complete all nine games with the shared display absent; inspect actual recipient payloads for secrets; verify host role changes and ordinary scoring. If banks currently download to every phone, do not claim cheat resistant secrecy until answer keys and future content are removed from ordinary participant bundles. The organizer's browser remains trusted if it still owns the rules.

**SHELL-D02 | P0 | L | Recover the host and reject stale actions**

Where: both. Screen: all timed phases and reconnect. Change: retain one authoritative room state, absolute phase deadlines, a monotonically increasing phase revision, round ID and stable player ID. Actions carry revision and a unique action ID. Reject late, duplicate, wrong role and previous round actions. Reconnect returns the current phase, score and acknowledged action, not a new player. Show “Sending” until acknowledged and “Saved” only after acknowledgement. Detect host loss, pause fairly and resume from a persisted checkpoint when the host returns. Expired phases resolve once, never in a burst of skipped reveals. Mobile host tab suspension is a real blocker: a background browser timer must not be the only reliable clock. Use the existing service if it supports authoritative deadlines; otherwise ship honest pause and recovery before promising uninterrupted phone hosting. Why: a locked phone should not decide the winner. Acceptance: lock and reload the host and a player in each role, replay packets, interrupt transport and reconnect near a deadline; no double scores or changed secret roles. Host migration is deferred unless the existing service already supports it.

**SHELL-D03 | P0 | M | Make joining and returning unambiguous**

Where: both. Screen: picker, lobby and join. Change: show a four character letters and numbers code, QR and lucidwinds.com/join together. Phones only also offers Copy invite link using an ordinary participant link with no organizer token. The organizer enters a display name and is counted once. Preserve roster and code through Another game. Show player count, minimum and maximum, individual connection status and explicit “Waiting for 1 more player”. Reject full rooms clearly. A late joiner sees the public game and “You play next game”; they cannot act or score until the next roster snapshot. Permit case insensitive pasted codes and trim spaces. Reserve ambiguous character avoidance for new codes only. Why: nobody needs a tutorial to enter a room. Acceptance: six first time testers join without spoken troubleshooting in a target of 90 seconds; duplicate display names retain different identity markers; refresh restores the same seat.

**SHELL-D04 | P0 | M | Separate saved choices from final answers**

Where: both. Screen: every input phase. Change: “Saved. You can change it.” means editable; “Final answer saved.” means irreversible. Never end an editable phase the instant the last first tap arrives. After all eligible players have an acknowledged choice and a minimum reading interval has elapsed, show a three second “All set. Finishing soon.” countdown; edits remain possible until that announced deadline. Do not repeatedly restart this countdown when somebody edits. Original maximum deadlines still apply. Mothlight always uses its full question clock because changing sides is the game. Lifting Fog and First Frost use irreversible submission and may finish once everyone has answered. Sliders require explicit submission, so an untouched 50 is not a guess. Why: words and controls must make the same promise. Acceptance: an early player can edit during the announced window; a late packet cannot alter a resolved round.

**SHELL-D05 | P1 | M | Make the lobby explain the choice of game**

Where: both. Screen: picker. Change: each card shows a concrete action, player range, measured session estimate and format badge. Use these descriptions: Mothlight “Pick true or false. Watch people change sides.”; Firefly Futures “Answer privately. Guess how many said yes.”; Lifting Fog “Use the clues. Choose when to answer.”; First Frost “Answer questions. Then become the weather.”; Moongraft “Draw secret pieces. Grow one strange plant.”; Same Soil “Pick your favorite. See who knows your choice.”; Wide Margin “Guess a percentage. See how close you came.”; Bearing “Say one word. Help everyone find the spot.”; The Understudy “Choose who fits a playful role.” Show Drawing, Spoken clue or Questions as appropriate. Do not label Same Soil the only two player game: Wide Margin is also documented as 2 to 8. Why: botanical names alone do not communicate gameplay. Acceptance: testers can choose without opening every rules page.

**SHELL-D06 | P1 | M | Give phones a stable layout and readable reveals**

Where: both. Screen: all phases. Change: phone order is game and round, task, live timer, public play area, personal action, then personal outcome. Use an ordinary vertical flow, with a pinned action only when it cannot obscure text. At 360 CSS pixels and enlarged text, keep the task and answer accessible without horizontal scrolling. Shared display uses the same public information with much larger type and a restrained botanical frame. Start with 40 to 56 pixel primary question text on a 1080p display and test from ten feet; the existing 28 pixel floor is insufficient evidence of readability. Use shape and text as well as player color; initials plus a distinct symbol distinguish duplicate names. Show full standings in a scrollable phone panel between rounds and a compact own score during play. Why: ornamental empty space should not make the actual game tiny. Acceptance: 360 and 430 pixel phone captures, enlarged text, keyboard focus, screen reader labels and a real couch reading test pass; no essential color only information.

**SHELL-D07 | P1 | M | Tune reading time and sound as room settings**

Where: both. Screen: lobby, rules and settings. Change: provide Standard and More reading time. The latter multiplies decision windows by 1.5, including each clue tier, while keeping animations short. Rules show one playable example and a host Continue button, with a maximum timer; returning rooms can skip the example. Use visual urgency and optional vibration, never sound alone. Only the shared display plays public music in Shared screen; in Phones only, only the host plays public music, if enabled. Other phones are silent by default. Personal audio controls never start eight competing soundtracks. Why: fast readers should not set the pace for the entire family. Acceptance: a child can finish reading before deciding; muted play loses no information; backgrounding a tab does not cause delayed audio bursts.

**SHELL-D08 | P0 | S | Remove false reward and room ending messages**

Where: both. Screen: results and podium. Change: remove all sunbeam claims until the server actually confirms an enabled award. Preserve one idempotent game completion event per game instance, including Moongraft, but do not invent economy behavior. A game ending says “Game complete”; only explicit End night closes the room. Host has Play again, Another game and End night. Everyone else sees “Waiting for the host” plus their results and available card saves. End night requires a small confirmation to prevent an accidental room closure. Why: a player should know whether to keep their phone open. Acceptance: replaying a podium does not repeat completion; game over never disconnects the roster; no reward copy appears in disabled economy mode.

**SHELL-D09 | P1 | M | Make a party night varied without adding a second competition**

Where: both. Screen: picker and between games. Change: offer a suggested three game sequence, editable by the host. For 3 to 8 players, suggest Mothlight, Same Soil, Moongraft; for two, Same Soil and Wide Margin. More energetic rooms can substitute Bearing, then First Frost when at least four are present. Do not add raw scores from unlike games or crown an overall winner. Show completed game cards and a final shared night card with plants and game names. Spectators becoming players enter only at the next game. Why: a good ending is a shared memory, not an eight minute leaderboard after every activity. Acceptance: switching games preserves the room; a two person room never receives an unplayable suggestion; players know when the selected sequence finishes.

**SHELL-D10 | P0 | M | Audit content with evidence and a single editorial contract**

Where: both and authoring pipeline. Screen: content selection and reveals. Change: retain the bank schemas below and add a separate audit manifest keyed by ID with source URL, supporting value or fact, checked date, reviewer, difficulty, topic family and release status. This manifest is not extra player text. Detect duplicate wording and repeated underlying facts across games in the same night. Validate character limits, field names, category values, four unique options where required and forbidden punctuation in player text. No global free text answers. Player names and drawings already are user generated content, so “no moderation surface” is not literally true: keep names short, render them as text, provide organizer removal, and let Moongraft discard an unsuitable card before sharing. Why: a named source without a specific supporting claim is not an audit. Acceptance: malformed entries fail import, quarantined content cannot be sampled, and no answer is shipped from an unverified generated list.

**SHELL-D11 | P0 | M | Specify absence and low player behavior**

Where: both. Screen: all gameplay. Change: snapshot participants at game start and eligible actors at phase start. A brief disconnect does not remove a submitted action. Explicit departure removes future eligibility, never rewrites a finished round. At phase expiry, missing input is missing, not false, zero, 50 or a self vote. If a game's minimum is no longer met, finish an already resolvable reveal, then pause for a 30 second return window and offer the host Return to lobby. A skipped or aborted game does not award a competitive completion. Same Soil and Bearing rotate over the retained roster and skip absent role holders fairly. Why: empty input must not fabricate a personality or decide a percentage. Acceptance: exercise no input, all input, one departure and the entire room disappearing; no infinite waits, phantom actions or empty winners.

**SHELL-D12 | P1 | M | Verify real play before polishing the menu**

Where: both. Screen: full game paths. Change: extend the existing harness rather than replacing it. Capture synchronized host and phone phase IDs; the Mothlight rules screenshot currently pairs host rules with a phone question, which may be capture timing rather than a build bug. Test the actual transport on separate devices, both display modes, minimum and eight players, ties, no input, deadline boundaries and reconnect. Then observe at least three mixed age rooms and one adult room. Record join time, rule clarification requests, missed inputs, forced waiting, confusing scoring and willingness to replay. Targets are goals, not existing results: at least 80 percent can explain their task after the example; at least 80 percent of new players can explain their last score; no critical disconnect or secret leak. Why: automated clicks cannot prove a spoken clue or a drawing reveal is fun. Acceptance: Claude reports what passed, what failed and the exact remaining blockers, without calling generated content human tested.

### Shell copy table

Braces indicate runtime variables, not literal braces shown to players. A current fragment is quoted exactly as it appears in the supplied text; replace the assembled message in code, not an arbitrary substring. “New” marks copy for a new state. Keep “Whack Box”, “WHACK BOX”, “Play again”, “Another game”, “Grow more”, “Join the party”, “Join another room”, “Scan to join this room”, “Sound on” and “Sound off”.

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, picker | pick tonight's game | Choose a game |
| Both, picker | Sky Wolf Studio party night | A party night by Sky Wolf Studio |
| Both, lobby | Phones: open | Join at lucidwinds.com/join |
| Both, lobby | and enter the code | Enter room code {code} |
| Both, picker | Pick another game | Choose another game |
| Phone, waiting | eyes up on the big screen | You are ready. The game will appear here. |
| Both, reconnect | Lost the big screen | Reconnecting to the room |
| Both, reconnect | Waiting for it to come back. You do not need to do anything, and you will not lose your place. | Keep this page open. We are trying to restore your place. |
| Both, closed room | The night is over | This room has closed |
| Both, closed room | The big screen closed the room. Thanks for playing. | The host ended this party. Thanks for playing. |
| Phone, late join | You are in for the next one | You play next game |
| Phone, late join | A game is already running. You will join automatically when it finishes, and there is nothing to tap until then. | Watch this game here. You will join the next one. |
| Both, lobby | nobody yet | Waiting for players |
| Both, lobby | nobody has joined yet | Waiting for players |
| Both, lobby | Start with | Start with {count} players |
| Both, lobby | Phones anywhere can join: scan the square, or open that address and type the code. | Scan the QR code, or enter the room code at lucidwinds.com/join. |
| Both, test tools only | Practice room: every player joins from a tab in this same browser. | Practice room. Open each player in this browser. |
| Phone, join error | No room answered to | Room {code} was not found. Check the code and try again. |
| Phone, settings | screen on | Keep screen awake |
| Phone, join | your name | Your name |
| Both, connection error | The room could not connect. | Could not connect. Check your connection and try again. |
| Phone, join help | The code is the four big letters on the screen. | Enter the four letters and numbers from your host. |
| Phone, join help | Tell the room who you are. | Choose a name for this room. |
| Phone, join error | No room is open with the code | Room {code} was not found. |
| Phone, join error | . Check the code on the big screen and try again. | Check the code from your host and try again. |
| Phone, practice error | No practice room answered to | Practice room {code} was not found. |
| Phone, practice error | . Practice rooms only join from tabs in this same browser; scan the square on the big screen to join from a phone. | Practice rooms work in this browser only. Use a live room to join from another phone. |
| Both, audio control | Sound on or off | Game sound |
| Both, mode choice | New | Shared screen / Phones only |
| Host, lobby | New | Copy invite link |
| Host, lobby | New | Waiting for {count} more players |
| Phone, acknowledgement | New | Sending / Saved. You can change it. / Final answer saved. |
| Both, phase close | New | All set. Finishing soon. |
| Both, paused | New | The host disconnected. This round is paused. |
| Phone, recovery failure | New | We could not restore this room. Return to join. |
| Host, end confirmation | New | End this party for everyone? / Keep playing / End night |
| Phone, full room | New | This room is full. Ask the host about the next game. |

The shared game copy table below applies inside every game, including exact punctuation variants. Individual game tables supply the remaining replacements and every full rules screen. This avoids nine conflicting versions of the same status message.

| where | current text (exact) | your text |
| --- | --- | --- |
| Phone, rules | Eyes up on the big screen. | Here is how to play. |
| Phone, standings | Standings on the big screen. | Scores so far |
| Phone, standings suffix | . Standings on the big screen. | Your total is {score}. See everyone's scores below. |
| Both, game podium | The night is over | Game complete |
| Both, game podium | The night is over. | Game complete. |
| Both, game podium | Everyone earned sunbeams for playing. | Thanks for playing together. |
| Phone, game podium | You earned sunbeams. | Your total is {score}. |
| Phone, game podium suffix | . You earned sunbeams. | Your total is {score}. |
| Phone, game podium | The night is over. You lit | Game complete. Your total is {score}. |
| Phone, waiting after game | New | Waiting for the host to choose what is next. |
| Both, standings ties | New | Tied for {place} |

## B. ONE SECTION PER GAME

### B1. Mothlight

#### 1. Verdict

**Polish. Family 8 out of 10. Adults 8 out of 10.** Public movement makes this more than a true or false quiz. Keep the visible change of mind and the full decision window. The problems are mostly clarity, readable moth movement and the misleading “Lone moth” label: the documented bonus actually applies to any correct strict minority, not just one person. Do not conceal all choices for the entire round, which would erase this game's distinction from Firefly Futures.

#### 2. First time misunderstandings

Rules: “brave” is not a scoring rule. Question: players may believe their first tap is final or follow the first confident adult. Reveal: two correct players in a room of five can receive the minority bonus, despite neither being alone. Standings: phone users cannot inspect the room's results. Podium: “night over” sounds like a disconnected room. The screenshot's host rules and phone question mismatch must be reproduced before calling it a synchronization bug.

#### 3. Directions

**MOTHLIGHT-D01 | P0 | S | Define the minority bonus exactly**

Where: both. Phase: rules and reveal. Change: keep 100 for correct; award 150 total, not an extra 150, when correct respondents are fewer than half of all respondents. Require at least three valid answers for a minority bonus. Missing answers do not count as false. Exactly half earns 100. Label the bonus “Right with the smaller group”. Why: transparent scoring preserves trust. Acceptance: score fixtures for 1 of 3, 2 of 5, 2 of 4 and 1 of 1 correct; only the first two receive 150.

**MOTHLIGHT-D02 | P1 | M | Make a change of mind the visual event**

Where: both. Phase: question. Change: show the full statement, two clear landing areas and name plus symbol for every answered player. Keep True and False buttons in fixed positions. Animate only the changing player's moth for at most 300 ms; use a static move with reduced motion. Show own selected side and acknowledged state. Keep the documented full question time, approximately 20 seconds in the screenshot, pending code verification; do not end because everybody tapped. Why: the social pressure is visible without turning into visual noise. Acceptance: eight markers remain identifiable and an edit never moves a button under a thumb.

**MOTHLIGHT-D03 | P0 | M | Explain the answer and quarantine dubious samples**

Where: both. Phase: reveal and content audit. Change: reveal truth, one short corrective explanation, source name and individual score. Put URLs and explanations in the sidecar manifest, not new bank fields. Quarantine ml-0163 until its blanket claim about wasps and honey is checked against honey producing wasp species; ml-0001 until the named dictionary actually supports the collective noun; and ml-0055 until “cocoa solids” is qualified to avoid confusion with cocoa butter. These are audit flags, not verified replacement facts. Also remove sample questions about bodies if applying the stated no bodies rule literally. Why: the surprise should lead to understanding rather than an argument. Acceptance: every sampled entry resolves to evidence and a plain explanation; a flagged entry cannot enter the deck.

**MOTHLIGHT-D04 | P1 | S | Use a balanced deck without repeating a lesson**

Where: both. Phase: selection. Change: preserve 12 rounds with six true and six false, but never announce the remaining truth balance to players. Mix easy and surprising entries and avoid adjacent questions about the same topic. Track underlying fact families across the party night, not just IDs. Why: a run of obscure astronomy or reused answers rewards specialist knowledge more than social judgment. Acceptance: deck validation preserves 6 and 6, no repeated IDs, and no back to back source families when the pool allows alternatives.

**MOTHLIGHT-D05 | P2 | M | Try a short private opening before public movement**

Where: both. Phase: question. Change: experiment with four seconds to choose privately, then open the public landing areas for the remaining question time. Choices stay editable throughout. Explain “Choose first. Then watch the room.” No extra points. Why: a child gets an independent thought before the fastest adult anchors everyone. Acceptance: compare ordinary public rounds with this variant; retain only if players still notice and enjoy changes of mind. This is an experiment, not the default build.

#### 4. Copy table

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | A fact appears. True or false? | Read the statement. Choose True or False. |
| Both, rules line 2 | Your moth lands on your answer for all to see. | Everyone can see where your moth lands. |
| Both, rules line 3 | Change your mind any time before the timer ends. | You can change sides until time runs out. |
| Both, rules line 4 | Right answers score. Brave right answers score more. | Correct answers earn 100. A correct smaller group earns 150. |
| Both, rules detail | New | The bonus needs at least three answers. Equal groups earn 100. |
| Phone, reveal | Lone moth, +150 | Right with the smaller group. +150 |
| Phone, reveal | Not this time | Your answer was {choice}. The answer is {answer}. |
| Phone, input | New | Saved on {side}. You can change sides. |
| Both, reveal | New | {answer}. {explanation} |
| Phone, absent answer | New | No answer saved this round. |

#### 5. No big screen version

Rules: the four lines and one illustrated example are on every phone. Question: each phone shows the statement, both public landing areas, timer and its own buttons. Reveal: every phone shows the same correct side, explanation, public choices and score changes. Standings: the full room list is available on every phone. Podium: results plus host controls for the organizer, waiting copy for everyone else. Nothing about current choices is secret after public voting opens; answer keys and future facts remain outside ordinary participant payloads. The host's own phone shows the same player view and no answer preview. No timer change is necessary solely because the shared display disappears.

#### 6. New content

Thirty entries, 15 true and 15 false. Explanations and exact evidence links follow the bank. These additions deliberately avoid the supplied sample facts.

```json
[
  {"id": "ml-r001", "text": "Mercury has no moons.", "answer": true, "source": "NASA Mercury Facts", "category": "space"},
  {"id": "ml-r002", "text": "Venus is farther from the Sun than Mars is.", "answer": false, "source": "NASA Venus Facts", "category": "space"},
  {"id": "ml-r003", "text": "Jupiter has a ring system.", "answer": true, "source": "NASA Jupiter Facts", "category": "space"},
  {"id": "ml-r004", "text": "Saturn has a solid surface like Earth's.", "answer": false, "source": "NASA Saturn Facts", "category": "space"},
  {"id": "ml-r005", "text": "Neptune takes longer than Uranus to travel around the Sun.", "answer": true, "source": "NASA Neptune Facts", "category": "space"},
  {"id": "ml-r006", "text": "The Moon makes its own visible light like the Sun does.", "answer": false, "source": "NASA Moon Facts", "category": "space"},
  {"id": "ml-r007", "text": "The Sun is a star.", "answer": true, "source": "NASA Sun Facts", "category": "space"},
  {"id": "ml-r008", "text": "Mercury takes more than one Earth year to orbit the Sun.", "answer": false, "source": "NASA Mercury Facts", "category": "space"},
  {"id": "ml-r009", "text": "Bamboo belongs to the grass family.", "answer": true, "source": "Kew Bamboo", "category": "plants"},
  {"id": "ml-r010", "text": "Cinnamon sticks are made from a tree's roots.", "answer": false, "source": "Kew Cinnamon", "category": "plants"},
  {"id": "ml-r011", "text": "Cork can be harvested from the bark of a tree.", "answer": true, "source": "Kew Secret Gardens", "category": "plants"},
  {"id": "ml-r012", "text": "Ferns reproduce using seeds inside flowers.", "answer": false, "source": "National Park Service Ferns", "category": "plants"},
  {"id": "ml-r013", "text": "Mosses produce spores.", "answer": true, "source": "National Park Service Moss", "category": "plants"},
  {"id": "ml-r014", "text": "Natural vanilla pods grow on a kind of oak tree.", "answer": false, "source": "Kew Vanilla", "category": "plants"},
  {"id": "ml-r015", "text": "Ordinary ice is less dense than liquid water.", "answer": true, "source": "USGS Water Density", "category": "science"},
  {"id": "ml-r016", "text": "Water must boil before any of it can evaporate.", "answer": false, "source": "USGS Evaporation", "category": "science"},
  {"id": "ml-r017", "text": "Fog is a cloud at ground level.", "answer": true, "source": "Met Office Fog", "category": "science"},
  {"id": "ml-r018", "text": "Dew falls from clouds in the same way as rain.", "answer": false, "source": "Met Office Dew", "category": "science"},
  {"id": "ml-r019", "text": "Condensation turns water vapor into liquid water.", "answer": true, "source": "USGS Condensation", "category": "science"},
  {"id": "ml-r020", "text": "The air near Earth's surface contains more oxygen than nitrogen.", "answer": false, "source": "NOAA The Atmosphere", "category": "science"},
  {"id": "ml-r021", "text": "A magnetic compass uses a magnetized needle to show direction.", "answer": true, "source": "Merriam Webster Compass", "category": "science"},
  {"id": "ml-r022", "text": "A barometer is used to measure wind speed.", "answer": false, "source": "Merriam Webster Barometer", "category": "science"},
  {"id": "ml-r023", "text": "Some telescopes use mirrors to collect light.", "answer": true, "source": "Merriam Webster Telescope", "category": "science"},
  {"id": "ml-r024", "text": "A traditional hourglass measures time with flowing water.", "answer": false, "source": "Merriam Webster Hourglass", "category": "history"},
  {"id": "ml-r025", "text": "A xylophone has wooden bars.", "answer": true, "source": "Merriam Webster Xylophone", "category": "words"},
  {"id": "ml-r026", "text": "An accordion makes its notes with plucked strings.", "answer": false, "source": "Merriam Webster Accordion", "category": "words"},
  {"id": "ml-r027", "text": "A sieve lets smaller particles pass through its openings.", "answer": true, "source": "Merriam Webster Sieve", "category": "science"},
  {"id": "ml-r028", "text": "A zipper fastens a jacket by tying a row of knots.", "answer": false, "source": "Merriam Webster Zipper", "category": "words"},
  {"id": "ml-r029", "text": "A sundial uses a shadow to indicate the time.", "answer": true, "source": "Merriam Webster Sundial", "category": "history"},
  {"id": "ml-r030", "text": "A thermometer and a barometer measure the same thing.", "answer": false, "source": "Merriam Webster Thermometer", "category": "science"}
]
```

Evidence and proposed reveal explanations. Keep the explanations in the audit sidecar.

| ID | Explanation | Supporting source |
| --- | --- | --- |
| ml-r001 | Mercury has no natural satellites. | [NASA Mercury Facts](https://science.nasa.gov/mercury/facts/) |
| ml-r002 | Venus is the second planet. Mars is the fourth. | [NASA Venus Facts](https://science.nasa.gov/venus/venus-facts/) |
| ml-r003 | Jupiter has faint rings as well as its moons. | [NASA Jupiter Facts](https://science.nasa.gov/jupiter/jupiter-facts/) |
| ml-r004 | Saturn is a gas giant with no solid surface to stand on. | [NASA Saturn Facts](https://science.nasa.gov/saturn/facts/) |
| ml-r005 | Neptune takes about 165 Earth years. Uranus takes about 84. | [NASA Neptune Facts](https://science.nasa.gov/neptune/neptune-facts/) |
| ml-r006 | Moonlight is reflected sunlight. | [NASA Moon Facts](https://science.nasa.gov/moon/facts/) |
| ml-r007 | Our Sun is the star at the center of the solar system. | [NASA Sun Facts](https://science.nasa.gov/sun/facts/) |
| ml-r008 | Its orbit takes about 88 Earth days. | [NASA Mercury Facts](https://science.nasa.gov/mercury/facts/) |
| ml-r009 | Bamboos are woody grasses. | [Kew Bamboo](https://www.kew.org/read-and-watch/bamboo-kew-pandas) |
| ml-r010 | Cinnamon comes from bark. | [Kew Cinnamon](https://www.kew.org/plants/cinnamon) |
| ml-r011 | Cork oak bark supplies cork. | [Kew Secret Gardens](https://www.kew.org/read-and-watch/kew-secret-gardens) |
| ml-r012 | Ferns reproduce using spores, not flowers and seeds. | [National Park Service Ferns](https://www.nps.gov/muwo/learn/nature/ferns.htm) |
| ml-r013 | Mosses reproduce through spores. | [National Park Service Moss](https://www.nps.gov/acad/learn/nature/moss.htm) |
| ml-r014 | Vanilla comes from an orchid. | [Kew Vanilla](https://www.kew.org/plants/vanilla) |
| ml-r015 | The lower density allows ordinary ice to float. | [USGS Water Density](https://www.usgs.gov/water-science-school/science/water-density) |
| ml-r016 | Evaporation also occurs below boiling temperature. | [USGS Evaporation](https://www.usgs.gov/water-science-school/science/evaporation-and-water-cycle) |
| ml-r017 | Tiny suspended droplets reduce visibility near the ground. | [Met Office Fog](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog) |
| ml-r018 | Dew forms when water vapor condenses on a surface. | [Met Office Dew](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/temperature/dew) |
| ml-r019 | Condensation is the reverse of evaporation. | [USGS Condensation](https://www.usgs.gov/water-science-school/science/condensation-and-water-cycle) |
| ml-r020 | Nitrogen is much more abundant than oxygen. | [NOAA The Atmosphere](https://www.noaa.gov/jetstream/atmosphere) |
| ml-r021 | The needle aligns with the local magnetic field. | [Merriam Webster Compass](https://www.merriam-webster.com/dictionary/compass) |
| ml-r022 | A barometer measures air pressure. | [Merriam Webster Barometer](https://www.merriam-webster.com/dictionary/barometer) |
| ml-r023 | Reflecting telescopes collect light with mirrors. | [Merriam Webster Telescope](https://www.merriam-webster.com/dictionary/telescope) |
| ml-r024 | Its two bulbs hold flowing sand. | [Merriam Webster Hourglass](https://www.merriam-webster.com/dictionary/hourglass) |
| ml-r025 | Wooden bars make the notes of a xylophone. | [Merriam Webster Xylophone](https://www.merriam-webster.com/dictionary/xylophone) |
| ml-r026 | Air moves through reeds in an accordion. | [Merriam Webster Accordion](https://www.merriam-webster.com/dictionary/accordion) |
| ml-r027 | The mesh separates particles by size. | [Merriam Webster Sieve](https://www.merriam-webster.com/dictionary/sieve) |
| ml-r028 | A slider joins two rows of interlocking parts. | [Merriam Webster Zipper](https://www.merriam-webster.com/dictionary/zipper) |
| ml-r029 | Sunlight casts a shadow on a marked surface. | [Merriam Webster Sundial](https://www.merriam-webster.com/dictionary/sundial) |
| ml-r030 | A thermometer measures temperature. A barometer measures pressure. | [Merriam Webster Thermometer](https://www.merriam-webster.com/dictionary/thermometer) |

#### 7. Names

Mothlight; Follow the Glow; True to the Light. Keep Mothlight unless player testing shows the name prevents discovery; the picker subtitle does most of that work.

#### 8. Best one new idea

The four second private opening in MOTHLIGHT-D05. It protects the first independent guess without removing the pleasure of publicly switching sides.

### B2. Firefly Futures

#### 1. Verdict

**Polish. Family 8 out of 10. Adults 8 out of 10.** Guessing the room is accessible, and private predictions give the reveal a useful contrast with Mothlight. Remove financial “bet” and “market” language from player copy without changing internal phase IDs. The critical issue is the denominator: players must know whether their own yes counts, whether everyone answered and what happens to a missing answer. Privacy must be described honestly because a total can still reveal an individual's choice by deduction.

#### 2. First time misunderstandings

Poll: “Nobody sees your answer” sounds stronger than the game can guarantee. Prediction: “the rest of the room” suggests excluding yourself, while the rules say all of you. Reveal: a count of zero or everyone necessarily discloses all responses. Standings: 130 is the total for a unique exact prediction, not 100 plus 130. Podium: the room should stay open.

#### 3. Directions

**FIREFLY-D01 | P0 | M | Freeze and display the answered population**

Where: both. Phase: poll to prediction. Change: count only acknowledged yes or no answers, including the predicting player's answer if they gave one. At poll close, freeze M respondents and Y yes answers. Display “How many of these {M} answers were Yes?” and a grid from 0 to M. A missing or passed poll answer is excluded, never counted as No. All retained participants may predict. If M is below three, void the round without revealing the count and move on after a short message. Why: players can reason about a defined group. Acceptance: simulate one missing poll response; every phone shows the same M and range, and scoring uses that denominator.

**FIREFLY-D02 | P0 | M | Preserve individual privacy without overpromising**

Where: both. Phase: poll, reveal and payloads. Change: never show who said yes or attach names to poll choices. Show only the aggregate count, prediction markers and points. Poll copy says “Only the total is shown.” Add a quiet Pass control and family appropriate prompts. Server or trusted authority must keep responses recipient private. Do not label the game anonymous; three person rooms can infer answers. Why: truthful privacy language and low stakes questions protect the tone. Acceptance: no ordinary participant payload contains anyone else's poll response before or after reveal; pass is handled exactly like missing input for M, without identifying the passer publicly.

**FIREFLY-D03 | P1 | S | Keep a comfortable prediction rhythm**

Where: both. Phase: poll, prediction and reveal. Change: start at 15 seconds for poll, 18 for prediction and 9 for reveal; ten rounds. Both poll and prediction are editable with the shell's announced finish window. Keep 100 exact, 130 unique exact and 40 one away; all other predictions and no prediction earn 0. Label 40 explicitly. Reveal the actual lantern count first, then prediction markers and score. Why: the family has time to read and then react. Acceptance: verify tied exact predictions both earn 100, unique exact earns 130 total, and values one away at endpoints earn 40.

**FIREFLY-D04 | P1 | M | Make a hidden prediction visible as a saved action**

Where: phone. Phase: prediction. Change: show a 3 by 3 grid for up to nine choices, each at least 48 pixels, with the selected number, “Your guess” and its acknowledgement. No other player's selected number appears before reveal. Keep the prompt and M visible. Why: a player should not wonder whether their thumb registered or scroll away from the question to answer. Acceptance: all 0 through 8 values work at 360 pixels with enlarged text and without horizontal scroll.

**FIREFLY-D05 | P2 | S | Add a brief optional conversation beat**

Where: both. Phase: reveal. Change: after selected low stakes prompts, show “Any stories behind that?” for the ordinary reveal duration. No request to identify a yes voter, no microphone recording and no scoring. The host can extend the reveal once if people are talking. Why: the count becomes a reason to laugh together. Acceptance: people volunteer stories without being singled out; remove the prompt if it creates pressure rather than conversation.

#### 4. Copy table

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | A question about you appears. Answer it honestly. | Answer Yes or No about yourself. You can also pass. |
| Both, rules line 2 | Then the room bets on how many of you said yes. | Guess how many answers were Yes, including yours. |
| Both, rules line 3 | Guess the count exactly and you score the most. | An exact guess earns 100. One away earns 40. |
| Both, rules line 4 | Nobody sees anything until the lanterns light. | Only the total is shown. Guesses appear at the reveal. |
| Both, rules detail | New | The only exact guess earns 130 instead of 100. |
| TV, poll | Answer on your phone | Choose Yes or No on your phone. |
| Phone, poll | Nobody sees your answer. | Only the total is shown. |
| Both, prediction count | have bet | {count} of {eligible} guesses saved |
| Both, prediction fragment | How many of the | How many of these {count} answers were Yes? |
| Both, prediction fragment | said yes? | How many of these {count} answers were Yes? |
| Both, result fragment | said yes | {yes} of {count} answers were Yes. |
| Phone, prediction | Tap a number. You can change it. | Tap your guess. Include your own Yes, if you answered Yes. |
| Phone, poll saved | Answer in. You can change it until time is up. | Saved. You can change your answer until time runs out. |
| Phone, prediction saved | Bet in. You can change it until time is up. | Guess saved. You can change it until time runs out. |
| Phone, result | Only you had it, +130 | The only exact guess. +130 |
| Phone, result | Exactly right, +100 | Exactly right. +100 |
| Phone, result | Not this time | You guessed {guess}. The total was {yes}. |
| Phone, result | No bet placed | No guess saved this round. |
| Phone, result fragment | said yes. | {yes} of {count} answers were Yes. |
| Phone, result | New | One away. +40 |
| Both, void round | New | Too few answers this time. Let us try another question. |
| Phone, poll action | New | Pass |

#### 5. No big screen version

Rules: full instructions and a worked example with four responses and three yes answers. Poll: prompt, own answer and timer; no named response list. Prediction: same prompt, frozen respondent count, own original choice privately and 0 to M buttons. Reveal: aggregate lanterns, every prediction and personal points. Standings and podium: complete results. Host gets the same private personal view, plus room controls; no poll tally preview. Poll and prediction remain secret until their intended reveal, and individual poll choices never become public. Use the same revised timings as shared screen mode.

#### 6. New content

```json
[
  {"id": "ff-r001", "text": "Would you take a longer path to cross a little bridge?", "category": "nature"},
  {"id": "ff-r002", "text": "Do you prefer a pencil before a pen when making a list?", "category": "habits"},
  {"id": "ff-r003", "text": "Have you ever given a name to a cloud shape?", "category": "nature"},
  {"id": "ff-r004", "text": "Would you choose a window seat on a train?", "category": "travel"},
  {"id": "ff-r005", "text": "Do you like hearing rain while you are indoors?", "category": "tastes"},
  {"id": "ff-r006", "text": "Would you try a puzzle without looking at its picture?", "category": "habits"},
  {"id": "ff-r007", "text": "Have you ever made a tiny house from sticks?", "category": "experiences"},
  {"id": "ff-r008", "text": "Do you prefer a story with a map inside?", "category": "tastes"},
  {"id": "ff-r009", "text": "Would you keep a smooth pebble you found on a walk?", "category": "nature"},
  {"id": "ff-r010", "text": "Have you ever watched a snail until it disappeared?", "category": "nature"},
  {"id": "ff-r011", "text": "Do you like to sort colored pencils before using them?", "category": "habits"},
  {"id": "ff-r012", "text": "Would you choose a picnic over an indoor meal?", "category": "tastes"},
  {"id": "ff-r013", "text": "Can you fold a paper boat without instructions?", "category": "skills"},
  {"id": "ff-r014", "text": "Have you ever invented a name for an imaginary animal?", "category": "experiences"},
  {"id": "ff-r015", "text": "Would you put a secret door in a treehouse?", "category": "home"},
  {"id": "ff-r016", "text": "Do you prefer crunchy cookies to soft ones?", "category": "tastes"},
  {"id": "ff-r017", "text": "Would you read a story about a very ordinary dragon?", "category": "tastes"},
  {"id": "ff-r018", "text": "Have you ever followed a trail just to see where it went?", "category": "experiences"},
  {"id": "ff-r019", "text": "Do you like the sound of gravel under your shoes?", "category": "tastes"},
  {"id": "ff-r020", "text": "Would you rather explore a garden in the rain than in bright sun?", "category": "nature"},
  {"id": "ff-r021", "text": "Have you ever built something just to knock it down again?", "category": "experiences"},
  {"id": "ff-r022", "text": "Can you make a paper fan without instructions?", "category": "skills"},
  {"id": "ff-r023", "text": "Do you like finding a handwritten note in a book?", "category": "tastes"},
  {"id": "ff-r024", "text": "Would you choose a room with a round window?", "category": "home"},
  {"id": "ff-r025", "text": "Have you ever made up words to a familiar tune?", "category": "experiences"},
  {"id": "ff-r026", "text": "Do you enjoy untangling a knot in a piece of string?", "category": "habits"},
  {"id": "ff-r027", "text": "Would you visit a museum just to see one tiny object?", "category": "travel"},
  {"id": "ff-r028", "text": "Have you ever tried drawing with your eyes closed?", "category": "experiences"},
  {"id": "ff-r029", "text": "Do you prefer a surprise ending to a familiar one?", "category": "tastes"},
  {"id": "ff-r030", "text": "Would you give an imaginary pet a very long name?", "category": "tastes"}
]
```

Subjective prompts require no factual citations. These favor preferences and inexpensive everyday experiences over travel access, ownership or adult accomplishments.

#### 7. Names

Firefly Forecast; Lantern Count; Glow Together. Firefly Forecast better communicates prediction than Futures.

#### 8. Best one new idea

The voluntary story beat in FIREFLY-D05. This game is strongest when its reveal leads to an unexpected little story, without asking anyone to confess which button they pressed.

### B3. Lifting Fog

#### 1. Verdict

**Polish. Family 7 out of 10. Adults 8 out of 10.** The wait or risk decision works, but it is only as good as the authored progression. The sample contains clues that are too broad, too absolute or oddly obscure for the intended audience. A child should lose points for choosing to wait, not for being unable to read four options within six seconds. Keep one irreversible answer and make the commitment deliberate.

#### 2. First time misunderstandings

Rules: “buzz” suggests answering aloud, but this is multiple choice. Question: a tap may be irreversible before the player realizes it; new clues may seem to replace earlier ones. Tier change: the points seen just before a tap may differ from those awarded if a packet arrives later. Reveal: an unanswered round is not an incorrect answer. Standings: the four question break should not erase the explanation before it can be read.

#### 3. Directions

**LIFTINGFOG-D01 | P0 | M | Separate selection from irreversible submission**

Where: phone. Phase: question. Change: tapping an option selects it locally, and a fixed “Answer now for {points}” button commits once. No modal. Show all revealed clues in order, current value and “Next clue in {seconds}”. Keep option order fixed for the whole question and preserve scroll and selection on tier updates. The authority assigns points for the tier when submission is accepted, returns that tier in acknowledgement and updates the button at each boundary. Never trust client declared points. Why: deliberate commitment preserves risk without accidental loss. Acceptance: keyboard and touch can select and submit; a tier update cannot move an option; retrying a committed answer cannot replace it.

**LIFTINGFOG-D02 | P1 | S | Give each clue enough reading time**

Where: both. Phase: question and reveal. Change: use four eight second tiers, 32 seconds total, with 100, 75, 50 and 25 points. More reading time makes each tier 12 seconds. Reveal for nine seconds. Keep eight questions and the standings break after four. End early only after every eligible player has submitted a final answer. Wrong answers remain locked but do not reveal correctness until the common reveal. Why: waiting is a choice, not a reading penalty. Acceptance: most new family players can finish clue one and all four options before tier two; nobody learns the answer from an early wrong player's console.

**LIFTINGFOG-D03 | P0 | M | Audit the clue ladder rather than just the final answer**

Where: authoring and both. Phase: content and reveal. Change: require four first person clues, at least two plausible options after clue one, a useful narrowing by clue two or three, and exactly one defensible option by clue four. Quarantine lf-0100: a vacuum does not prevent every form of heat transfer. Review the universal owl hearing and silent flight claims in lf-0012. Replace “plain white ice cream” as a definitive vanilla clue; color is not a reliable unique flavor identifier. Separate factual review from difficulty review and test the new ladders aloud. Why: poetry cannot excuse misleading science. Acceptance: two independent readers agree on the last clue and can explain why distractors fail; factual evidence covers every literal claim.

**LIFTINGFOG-D04 | P1 | S | Explain the score as the point of recognition**

Where: both. Phase: reveal. Change: show the answer, all four clues, each player's accepted clue tier and points. On a phone prioritize own outcome then allow the room list below. Correctness is always the stored canonical option ID, not screen position. Why: “I knew it at clue two” becomes the round's conversation. Acceptance: shuffled options score correctly on every device and reconnect preserves the submitted tier.

**LIFTINGFOG-D05 | P2 | M | Let finished players make a private second thought**

Where: phone. Phase: after final submission. Change: prototype a clearly unscored “What do you think now?” choice after a later clue. It never replaces the competitive answer, changes points or becomes public before reveal. Why: a player who answered early has something to consider while the fog lifts. Acceptance: testers can distinguish scored answer from second thought; cut this feature if it weakens the risk decision or clutters the screen.

#### 4. Copy table

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | Something in the fog tells you what it is, one clue at a time. | Four clues describe one thing. |
| Both, rules line 2 | Name it early and it is worth the most. | Earlier answers earn more points. |
| Both, rules line 3 | Every clue that lifts makes it worth less. | Each new clue lowers the points: 100, 75, 50, then 25. |
| Both, rules line 4 | You get one answer only, so be sure before you tap. | Choose an option, then tap Answer now. You get one answer. |
| Phone, question | One answer only. Wait, or be brave. | Wait for a clue, or answer now. |
| Phone, committed | Locked in. Watch the big screen. | Final answer saved at clue {tier}. |
| Phone, result fragment | Found it, + | Found it at clue {tier}. +{points} |
| Phone, result | Not this time | You chose {choice}. It was {answer}. |
| Phone, result | You held back | No answer saved this round. |
| Both, status | locked in | {count} of {eligible} final answers saved |
| Both, result | Nobody found it that time. | This one stayed hidden. It was {answer}. |
| Both, podium | The fog has cleared | Game complete |
| Phone, podium | The fog has cleared. | Game complete. |
| Phone, podium fragment | The fog has cleared. You scored | Game complete. Your total is {score}. |
| Phone, submit | New | Answer now for {points} |

#### 5. No big screen version

Rules: four lines and a practice choice. Question: stacked revealed clues, points, deadline, fixed options and submit. Submitted phones keep all new public clues visible but disable scored input. Reveal: answer, clue progression and accepted tier. Standings and podium: full results. Host participates normally and never receives a visible answer preview. Ordinary participant payloads include only clues already revealed and shuffled public option IDs; future clues and the correct option remain private. Keep the revised eight second tiers on both display modes.

#### 6. New content

```json
[
  {"id": "lf-r001", "options": ["Compass", "Sundial", "Thermometer", "Clock"], "clues": ["I can help you choose without taking a step.", "My useful movement happens around a pivot.", "My magnetic needle responds to a field around Earth.", "I show directions such as north, south, east and west."], "category": "science"},
  {"id": "lf-r002", "options": ["Sundial", "Compass", "Weather vane", "Thermometer"], "clues": ["I let a moving patch of darkness do the work.", "I need sunlight to do my familiar job.", "My shadow falls across marks as the Sun changes position.", "I tell the time using a shadow on a dial."], "category": "history"},
  {"id": "lf-r003", "options": ["Hourglass", "Sundial", "Clock", "Stopwatch"], "clues": ["I make waiting visible.", "I can begin again when I am turned over.", "My narrow middle links two glass spaces.", "I measure time as sand runs from one bulb to the other."], "category": "history"},
  {"id": "lf-r004", "options": ["Prism", "Mirror", "Lens", "Window"], "clues": ["I can make one arrival become several departures.", "My clear faces change the direction of passing light.", "White light can leave me spread into different colors.", "My triangular glass shape can spread white light into a band of colors."], "category": "science"},
  {"id": "lf-r005", "options": ["Mirror", "Window", "Prism", "Lens"], "clues": ["I can send something back without moving.", "Light returns from my surface.", "I can show an image of what is in front of me.", "Look into my reflective surface to see your reflection."], "category": "science"},
  {"id": "lf-r006", "options": ["Magnet", "Spring", "Glue", "String"], "clues": ["I can help things meet without a knot.", "Some materials respond to me while others do not.", "I can attract iron without glue.", "My familiar ends are called north and south poles."], "category": "science"},
  {"id": "lf-r007", "options": ["Thermometer", "Barometer", "Clock", "Compass"], "clues": ["I turn an invisible change into a reading.", "My scale can help you compare a warm day with a cool one.", "Some versions of me use liquid, while others use electronics.", "I measure temperature in degrees."], "category": "science"},
  {"id": "lf-r008", "options": ["Barometer", "Thermometer", "Rain gauge", "Wind vane"], "clues": ["I can notice a change before you look outside.", "Weather watchers can use my rising and falling readings.", "My reading describes a property of the surrounding air.", "I measure atmospheric pressure, not temperature."], "category": "science"},
  {"id": "lf-r009", "options": ["Telescope", "Microscope", "Periscope", "Magnifying glass"], "clues": ["I gather what comes from somewhere else.", "I can help a distant object seem nearer.", "Astronomers use versions of me with lenses or mirrors.", "I collect light from distant stars for an astronomer to study."], "category": "science"},
  {"id": "lf-r010", "options": ["Microscope", "Telescope", "Camera", "Projector"], "clues": ["I can make a small world easier to explore.", "My work often begins with a little sample.", "An optical version of me uses lenses to magnify details.", "A tiny specimen on my stage can be magnified through my eyepiece."], "category": "science"},
  {"id": "lf-r011", "options": ["Kaleidoscope", "Telescope", "Microscope", "Periscope"], "clues": ["I can change the view while you stay in one place.", "A turn can rearrange what you see inside me.", "My mirrors repeat small colored pieces into patterns.", "Look down my tube and turn it for changing symmetrical designs."], "category": "science"},
  {"id": "lf-r012", "options": ["Zipper", "Button", "Buckle", "Knot"], "clues": ["I help two edges become neighbors.", "A small moving piece can open or close me.", "My two rows interlock as a slider moves along them.", "Pull my slider to fasten the front of a jacket."], "category": "words"},
  {"id": "lf-r013", "options": ["Sieve", "Funnel", "Bowl", "Spoon"], "clues": ["I decide what stays by letting something leave.", "My many openings do the sorting.", "Smaller particles pass through my mesh.", "Shake flour through me to separate out larger lumps."], "category": "science"},
  {"id": "lf-r014", "options": ["Funnel", "Sieve", "Jug", "Ladle"], "clues": ["I help a wide beginning find a narrow ending.", "I can guide a flow without needing a moving part.", "My broad opening narrows into a tube.", "Put me in a bottle opening to help pour liquid into it."], "category": "science"},
  {"id": "lf-r015", "options": ["Pendulum", "Wheel", "Spring", "Clock hand"], "clues": ["I keep returning without completing a circle.", "Gravity helps bring me back after a swing.", "My suspended weight swings about a fixed point.", "I am the swinging weight in a traditional longcase clock."], "category": "science"},
  {"id": "lf-r016", "options": ["Kite", "Balloon", "Glider", "Paper plane"], "clues": ["I can travel while someone stays connected to me.", "Moving air helps hold me above the ground.", "A light covering is stretched over my frame.", "You fly me in the wind while holding my string."], "category": "science"},
  {"id": "lf-r017", "options": ["Pulley", "Lever", "Ramp", "Spring"], "clues": ["I can make a change of direction useful.", "A line travels around part of me.", "My wheel has a groove that holds a rope.", "Pull the rope over my wheel to help raise something."], "category": "science"},
  {"id": "lf-r018", "options": ["Lever", "Pulley", "Ramp", "Screw"], "clues": ["I can turn a small movement into useful work.", "Where you push matters to how I work.", "My rigid bar turns around a support point.", "A seesaw is a familiar example of my simple machine."], "category": "science"},
  {"id": "lf-r019", "options": ["Accordion", "Flute", "Violin", "Trumpet"], "clues": ["I become music when air moves through me.", "My middle can open and close like a folded fan.", "My bellows send air through reeds.", "I have bellows plus buttons or a keyboard for choosing notes."], "category": "words"},
  {"id": "lf-r020", "options": ["Xylophone", "Guitar", "Drum", "Accordion"], "clues": ["I make a row of different sounds waiting to be heard.", "A player strikes rather than plucks me.", "My tuned bars are arranged for different notes.", "My wooden bars make music when tapped with small mallets."], "category": "words"},
  {"id": "lf-r021", "options": ["Dew", "Rain", "Fog", "Frost"], "clues": ["I can appear without a drop falling from a cloud.", "A cool surface helps me arrive.", "I form as water vapor becomes liquid on a cool surface.", "I am the tiny liquid droplets on grass after a cool night."], "category": "science"},
  {"id": "lf-r022", "options": ["Fog", "Dew", "Rain", "Frost"], "clues": ["I can make a familiar path look unfamiliar.", "My tiny droplets hang in the air.", "I am like a cloud resting at ground level.", "I reduce visibility around you with suspended water droplets."], "category": "science"},
  {"id": "lf-r023", "options": ["Rainbow", "Cloud", "Halo", "Aurora"], "clues": ["I appear to offer a destination you cannot reach.", "Sunlight and water droplets can make me visible.", "I appear as light bends and reflects inside water droplets.", "I am the colored arc often seen opposite the Sun after rain."], "category": "science"},
  {"id": "lf-r024", "options": ["Snowflake", "Hailstone", "Raindrop", "Dewdrop"], "clues": ["My journey through a cloud helps shape me.", "I grow as water vapor freezes onto ice.", "My crystal structure often creates sixfold patterns.", "I am an ice crystal falling as snow."], "category": "science"},
  {"id": "lf-r025", "options": ["Glacier", "River", "Iceberg", "Snowdrift"], "clues": ["I can change a landscape very slowly.", "I am a great mass that moves under gravity.", "Layers of accumulated snow can compress to form me.", "I am a slowly flowing mass of ice on land."], "category": "world"},
  {"id": "lf-r026", "options": ["Stalactite", "Stalagmite", "Icicle", "Crystal geode"], "clues": ["I can grow where daylight does not reach.", "I can grow from minerals left behind by dripping water.", "I hang from a cave's ceiling.", "I am the hanging cave formation, not the one growing from the floor."], "category": "world"},
  {"id": "lf-r027", "options": ["Geyser", "Waterfall", "River", "Hot spring"], "clues": ["I can send a quiet place into motion.", "Heat underground powers my display.", "Pressure builds in my natural water passages.", "I am a spring that erupts with hot water and steam."], "category": "world"},
  {"id": "lf-r028", "options": ["Bamboo", "Fern", "Palm", "Cactus"], "clues": ["I can look like a tree without belonging to that group.", "My stems can become useful building material.", "I am a woody member of the grass family.", "I am the tall grass famously associated with pandas."], "category": "plants"},
  {"id": "lf-r029", "options": ["Fern", "Moss", "Pine", "Daisy"], "clues": ["I can fill a woodland corner without making flowers.", "My familiar leaves are called fronds.", "I reproduce through spores rather than seeds.", "My fronds often carry spore structures on their undersides."], "category": "plants"},
  {"id": "lf-r030", "options": ["Cork", "Rubber", "Paper", "Wool"], "clues": ["I can be useful after leaving something alive.", "I begin as a protective outer layer.", "My source is the bark of a kind of oak.", "I am the light bark material used for pinboards and stoppers."], "category": "plants"}
]
```

The format intentionally has no source field. This table is the source map for the audit sidecar. Figurative opening clues are authored wording; literal claims and the intended answer must be checked together. The family set should mix objects, nature and familiar vocabulary rather than serving these 30 consecutively.

| ID | Correct answer | Supporting reference |
| --- | --- | --- |
| lf-r001 | Compass | [Merriam Webster Compass](https://www.merriam-webster.com/dictionary/compass) |
| lf-r002 | Sundial | [Merriam Webster Sundial](https://www.merriam-webster.com/dictionary/sundial) |
| lf-r003 | Hourglass | [Merriam Webster Hourglass](https://www.merriam-webster.com/dictionary/hourglass) |
| lf-r004 | Prism | [Merriam Webster Prism](https://www.merriam-webster.com/dictionary/prism) |
| lf-r005 | Mirror | [Merriam Webster Mirror](https://www.merriam-webster.com/dictionary/mirror) |
| lf-r006 | Magnet | [Merriam Webster Magnet](https://www.merriam-webster.com/dictionary/magnet) |
| lf-r007 | Thermometer | [Merriam Webster Thermometer](https://www.merriam-webster.com/dictionary/thermometer) |
| lf-r008 | Barometer | [Merriam Webster Barometer](https://www.merriam-webster.com/dictionary/barometer) |
| lf-r009 | Telescope | [Merriam Webster Telescope](https://www.merriam-webster.com/dictionary/telescope) |
| lf-r010 | Microscope | [Merriam Webster Microscope](https://www.merriam-webster.com/dictionary/microscope) |
| lf-r011 | Kaleidoscope | [Merriam Webster Kaleidoscope](https://www.merriam-webster.com/dictionary/kaleidoscope) |
| lf-r012 | Zipper | [Merriam Webster Zipper](https://www.merriam-webster.com/dictionary/zipper) |
| lf-r013 | Sieve | [Merriam Webster Sieve](https://www.merriam-webster.com/dictionary/sieve) |
| lf-r014 | Funnel | [Merriam Webster Funnel](https://www.merriam-webster.com/dictionary/funnel) |
| lf-r015 | Pendulum | [Merriam Webster Pendulum](https://www.merriam-webster.com/dictionary/pendulum) |
| lf-r016 | Kite | [Merriam Webster Kite](https://www.merriam-webster.com/dictionary/kite) |
| lf-r017 | Pulley | [Merriam Webster Pulley](https://www.merriam-webster.com/dictionary/pulley) |
| lf-r018 | Lever | [Merriam Webster Lever](https://www.merriam-webster.com/dictionary/lever) |
| lf-r019 | Accordion | [Merriam Webster Accordion](https://www.merriam-webster.com/dictionary/accordion) |
| lf-r020 | Xylophone | [Merriam Webster Xylophone](https://www.merriam-webster.com/dictionary/xylophone) |
| lf-r021 | Dew | [Met Office Dew](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/temperature/dew) |
| lf-r022 | Fog | [Met Office Fog](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog) |
| lf-r023 | Rainbow | [Met Office Rainbows](https://weather.metoffice.gov.uk/learn-about/weather/optical-effects/rainbows) |
| lf-r024 | Snowflake | [NOAA Snowflakes](https://www.noaa.gov/stories/how-do-snowflakes-form-science-behind-snow) |
| lf-r025 | Glacier | [USGS Glacier Ice](https://www.usgs.gov/faqs/glacier-ice-a-type-rock) |
| lf-r026 | Stalactite | [National Park Service Speleothems](https://home.nps.gov/subjects/caves/speleothems.htm) |
| lf-r027 | Geyser | [National Park Service Hydrothermal Features](https://www.nps.gov/yell/learn/nature/hydrothermal-features.htm) |
| lf-r028 | Bamboo | [Kew Bamboo](https://www.kew.org/read-and-watch/bamboo-kew-pandas) |
| lf-r029 | Fern | [National Park Service Ferns](https://www.nps.gov/muwo/learn/nature/ferns.htm) |
| lf-r030 | Cork | [Kew Secret Gardens](https://www.kew.org/read-and-watch/kew-secret-gardens) |

Supplemental references: [NASA Telescopes 101](https://science.nasa.gov/universe/telescopes-101/) for optical collection; [Kew Bamboo](https://www.kew.org/read-and-watch/bamboo-kew-pandas) for uses and classification. In lf-r016, Kite means the toy, not the bird. In lf-r023, the final clue specifies a rainbow rather than the listed halo or aurora. The distractors in lf-r009 deliberately exclude binoculars, which could also satisfy a distant viewing clue.

#### 7. Names

Lifting Fog; Clue by Clue; Clearer Now.

#### 8. Best one new idea

The private second thought in LIFTINGFOG-D05, if testing shows the two answer states are clear. The essential release improvement remains the deliberate Answer now button.

### B4. First Frost

#### 1. Verdict

**Rework. Family 6 out of 10. Adults 8 out of 10.** Becoming the weather is the strongest competitive premise here. Presently, Frost players appear to spend most of each question watching, and Chill and Fog both mainly remove answering time. “Three wrong answers” also conflicts with Deep Freeze applying two marks. Keep the transformation and the two roles, but make marks, power effects, scoring and all possible endings explicit before expanding trivia.

#### 2. First time misunderstandings

Rules: three wrong answers sounds like three guaranteed chances. Vote: the chosen power may be mistaken for a personal attack rather than a room effect. Question: Frost players may think they have been eliminated from play; hidden questions can leak through phone payloads. Reveal: people cannot tell how much their vote contributed to Frost points. Ending: one survivor, several survivors at the cap and everyone freezing together require different outcomes.

#### 3. Directions

**FIRSTFROST-D01 | P0 | M | Resolve marks and every ending deterministically**

Where: both. Phase: question, reveal and podium. Change: three total frost marks cause transformation. Ordinary incorrect or timed out answers add one mark; Deep Freeze adds two, capped at the three needed to freeze. A globally paused round applies no timeout marks. Correct living answers earn 100. Resolve all answers simultaneously, transform players, then evaluate ending. A sole survivor earns 300 once. If everyone freezes together, no survival bonus and no fabricated survivor. At the 12 question cap, all remaining players are named as survivors without the sole survivor bonus. Display ties honestly. Keep survival achievement and Frost contribution as separate podium panels, not one purportedly comparable combined ranking. Why: a family must be able to reconstruct what happened. Acceptance: fixtures cover a player with two marks taking Deep Freeze, simultaneous final eliminations, cap reached, tied totals and a duplicate reveal.

**FIRSTFROST-D02 | P1 | M | Give each power a different decision**

Where: both. Phase: vote and question. Change: retain three powers. Chill gives 12 seconds instead of the new ordinary 24. Fog shows the question immediately but reveals answer options only after eight seconds, leaving 16 to answer. Deep Freeze keeps 24 seconds but wrong or unanswered choices cost two marks. Only one power applies. Use More reading time consistently, including Fog's delay and remaining time. Frost see the same public question, never a correct answer preview. Why: Fog asks players to recall an answer, Chill asks for speed, and Deep Freeze raises the stakes. Acceptance: Fog options are absent from ordinary player payloads until reveal time; hidden controls cannot receive taps; all devices see the power announcement before timing begins.

**FIRSTFROST-D03 | P0 | M | Make Frost voting and rewards attributable**

Where: both. Phase: vote and reveal. Change: only players frozen at the start of the round can vote or earn its Frost points. Each such player earns 40 times the actual newly applied marks to living players that round, whether or not their vote won; label this shared weather work, not proven causal damage. No points for excess marks beyond the freeze threshold. A tied vote rotates through a fixed power order starting after the previous winner; zero votes means no power. Voting is private and editable under the shared closing rule, with a ten second maximum. A new Frost member starts voting next round. Why: nobody earns credit for the round that froze them, and a losing vote still belongs to the team. Acceptance: 2 marks applied means 80 to each eligible Frost member; excess hypothetical damage is never counted; disconnected members follow the phase eligibility contract.

**FIRSTFROST-D04 | P1 | M | Make transformation feel like a new job**

Where: both. Phase: tutorial, reveal and Frost question view. Change: show both consoles in a short unscored example before question one. On transformation, animate a mark becoming a weather token and say “You are the Frost. Choose the next weather.” Keep the Frost panel active during questions with the power, remaining time, living mark ledger and their own accumulated weather points. No individual targeting. If nobody freezes, the game can legitimately finish without a Frost vote; do not force a child out to demonstrate a feature. Why: the new role must feel visible and purposeful. Acceptance: newly frozen testers can explain their next action without host coaching and do not put down their phones thinking they are out.

**FIRSTFROST-D05 | P2 | M | Test a private weather forecast for Frost players**

Where: phone. Phase: question. Change: prototype “How many will answer correctly?” with 0 through the living count. Keep it a private unscored prediction during the first experiment; show its result on that phone at reveal. It does not expose living answers or affect mark scoring. Why: Frost players have a small decision while living players answer. Acceptance: test whether the extra task supports the weather fantasy; only consider points later if the baseline team scoring is already understood.

#### 4. Copy table

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | Answer the question before the clock runs out. | Choose your answer before time runs out. |
| Both, rules line 2 | Three wrong answers and the frost takes you. | Three frost marks turn you into the Frost. |
| Both, rules line 3 | Taken players do not leave. They become the Frost. | The Frost keep playing and choose the next weather. |
| Both, rules line 4 | The Frost choose how to spoil the next question. | Weather changes the time, the choices, or the marks. |
| Both, rules detail | New | A wrong answer or no answer adds one mark. Deep Freeze adds two. |
| Both, power | The clock is cut in half. | Half the answering time. |
| Both, power | The question stays hidden until half the clock is gone. | Read the question. The choices appear after a short wait. |
| Both, power | A wrong answer costs two marks instead of one. | A wrong answer or no answer adds two frost marks. |
| Both, Fog | The Frost are hiding this one | The choices are in the fog |
| Phone, Fog | The Frost are hiding this one. | Choices appear in {seconds}. Read the question first. |
| Phone, voting | Choose how to spoil the next question. | Choose the weather for the next question. |
| Phone, voting | The most voted power wins. | The most chosen weather wins. Ties rotate. |
| Phone, answer | One answer only. | Choose an option, then tap Final answer. |
| Phone, answer saved | Locked in. Watch the big screen. | Final answer saved. |
| Phone, vote saved | Vote in. You can change it until time is up. | Weather saved. You can change it until time runs out. |
| Phone, living wait | Whatever they pick lands on you next. | Their weather changes the next question. |
| Phone, Frost question | Your power is in play. | The room chose {power}. |
| Phone, power fragment | The Frost chose | Weather this round: {power} |
| Both, votes fragment | have chosen | {count} of {eligible} weather choices saved |
| Phone, weather points fragment | The frost bit, + | {marks} new frost marks. +{points} weather points |
| Phone, weather points | No damage that time | No new frost marks this round. |
| Phone, transition | The frost has you | You are the Frost. Choose the next weather. |
| Both, marks fragment | The frost reached | {name} has {marks} frost marks. |
| Both, transition fragment | joined the Frost. | {name} joins the Frost next round. |
| Both, reveal | Nobody took a mark that time. | Everyone answered correctly. |
| Both, answer fragment | The answer was | The answer was {answer}. |
| Both, sole survivor fragment | outlasted the frost. | {name} is the last survivor. +300 |
| Both, capped ending | The questions ran out first. | Twelve questions complete. |
| Both, capped ending fragment | are still standing. | Still standing: {names}. |
| Both, simultaneous ending | The frost took everyone. | Everyone became the Frost together. |
| Both, podium | Coldest of the Frost: | Most weather points: {names} |
| Phone, input | New | Final answer |

Keep “The Frost are choosing” and “You are the Frost”; apply shared podium and reward replacements from A.

#### 5. No big screen version

Rules: each phone previews living and Frost jobs. Vote: living players see the three public effects and the waiting timer; Frost receive three private choice buttons. Question: living players see marks, power, prompt and available options; Frost see the public question, living ledger and their team result context. Under Fog, no ordinary phone receives the options early. Reveal: everyone sees answer, marks applied and transformations; own console changes from authoritative role data. Podium: survival outcome and separate Frost contribution panel on every phone. Host uses whichever role they earned and does not obtain either private ballots or answers as a visible organizer feature. Timings follow D02 equally in both modes.

#### 6. New content

```json
[
  {"id": "fr-r001", "q": "Which planet is closest to the Sun?", "options": ["Mercury", "Venus", "Mars", "Jupiter"], "category": "space", "source": "NASA Mercury Facts"},
  {"id": "fr-r002", "q": "Which planet is the hottest in our solar system?", "options": ["Venus", "Mercury", "Mars", "Neptune"], "category": "space", "source": "NASA Venus Facts"},
  {"id": "fr-r003", "q": "What is the Great Red Spot on Jupiter?", "options": ["A giant storm", "A mountain", "A lake", "A crater"], "category": "space", "source": "NASA Jupiter Facts"},
  {"id": "fr-r004", "q": "Which planet is less dense on average than liquid water?", "options": ["Saturn", "Earth", "Mercury", "Mars"], "category": "space", "source": "NASA Saturn Facts"},
  {"id": "fr-r005", "q": "What gives Mars its rusty appearance?", "options": ["Iron minerals", "Liquid copper", "Green algae", "Frozen nitrogen"], "category": "space", "source": "NASA Mars Facts"},
  {"id": "fr-r006", "q": "What kind of object is our Sun?", "options": ["A star", "A planet", "A moon", "A comet"], "category": "space", "source": "NASA Sun Facts"},
  {"id": "fr-r007", "q": "What are comets largely made of?", "options": ["Ice and dust", "Only iron", "Liquid glass", "Only sand"], "category": "space", "source": "NASA Comet Facts"},
  {"id": "fr-r008", "q": "Where is the main asteroid belt?", "options": ["Between Mars and Jupiter", "Between Earth and Mars", "Beyond Neptune", "Inside Mercury's orbit"], "category": "space", "source": "NASA Asteroid Facts"},
  {"id": "fr-r009", "q": "Which plant belongs to the grass family?", "options": ["Bamboo", "Oak", "Fern", "Rose"], "category": "plants", "source": "Kew Bamboo"},
  {"id": "fr-r010", "q": "Which part of a tree supplies cinnamon?", "options": ["Bark", "Roots", "Flowers", "Pollen"], "category": "food", "source": "Kew Cinnamon"},
  {"id": "fr-r011", "q": "Which material comes from the bark of an oak?", "options": ["Cork", "Cotton", "Linen", "Wool"], "category": "plants", "source": "Kew Secret Gardens"},
  {"id": "fr-r012", "q": "How do ferns reproduce?", "options": ["With spores", "With flower seeds", "With cones", "With fruit stones"], "category": "plants", "source": "National Park Service Ferns"},
  {"id": "fr-r013", "q": "Vanilla belongs to which plant family?", "options": ["Orchids", "Grasses", "Pines", "Cacti"], "category": "plants", "source": "Kew Vanilla"},
  {"id": "fr-r014", "q": "What is water vapor becoming liquid called?", "options": ["Condensation", "Evaporation", "Melting", "Sublimation"], "category": "science", "source": "USGS Condensation"},
  {"id": "fr-r015", "q": "What does a barometer measure?", "options": ["Air pressure", "Wind speed", "Rain depth", "Temperature"], "category": "science", "source": "Merriam Webster Barometer"},
  {"id": "fr-r016", "q": "Which gas makes up most of Earth's dry air?", "options": ["Nitrogen", "Oxygen", "Helium", "Carbon dioxide"], "category": "science", "source": "NOAA The Atmosphere"},
  {"id": "fr-r017", "q": "Which instrument tells time with a shadow?", "options": ["Sundial", "Compass", "Barometer", "Rain gauge"], "category": "history", "source": "Merriam Webster Sundial"},
  {"id": "fr-r018", "q": "What flows through a traditional hourglass?", "options": ["Sand", "Oil", "Water", "Air"], "category": "history", "source": "Merriam Webster Hourglass"},
  {"id": "fr-r019", "q": "Which instrument usually has wooden bars struck with mallets?", "options": ["Xylophone", "Accordion", "Violin", "Flute"], "category": "words", "source": "Merriam Webster Xylophone"},
  {"id": "fr-r020", "q": "Which instrument has bellows that move air through reeds?", "options": ["Accordion", "Violin", "Drum", "Xylophone"], "category": "words", "source": "Merriam Webster Accordion"},
  {"id": "fr-r021", "q": "What is a cloud at ground level called?", "options": ["Fog", "Dew", "Frost", "Hail"], "category": "science", "source": "Met Office Fog"},
  {"id": "fr-r022", "q": "Where does a stalactite grow in a cave?", "options": ["From the ceiling", "Up from the floor", "Only in a pool", "Only outside the entrance"], "category": "world", "source": "National Park Service Speleothems"},
  {"id": "fr-r023", "q": "Which natural feature erupts with hot water and steam?", "options": ["Geyser", "Glacier", "Sand dune", "Waterfall"], "category": "world", "source": "National Park Service Hydrothermal Features"},
  {"id": "fr-r024", "q": "What is a glacier mostly made of?", "options": ["Ice", "Sand", "Salt", "Lava"], "category": "world", "source": "USGS Glacier Ice"},
  {"id": "fr-r025", "q": "Which process can make a puddle shrink on a dry day?", "options": ["Evaporation", "Condensation", "Freezing", "Magnetism"], "category": "science", "source": "USGS Evaporation"},
  {"id": "fr-r026", "q": "Which instrument helps us view very small objects?", "options": ["Microscope", "Telescope", "Barometer", "Compass"], "category": "science", "source": "Merriam Webster Microscope"},
  {"id": "fr-r027", "q": "What guides a rope around a grooved wheel?", "options": ["Pulley", "Wedge", "Lever", "Screw"], "category": "science", "source": "Merriam Webster Pulley"},
  {"id": "fr-r028", "q": "Which simple machine describes a seesaw?", "options": ["Lever", "Pulley", "Screw", "Wedge"], "category": "science", "source": "Merriam Webster Lever"},
  {"id": "fr-r029", "q": "What tool guides liquid into a narrow bottle opening?", "options": ["Funnel", "Sieve", "Rolling pin", "Whisk"], "category": "science", "source": "Merriam Webster Funnel"},
  {"id": "fr-r030", "q": "What turns a kaleidoscope's small pieces into repeated patterns?", "options": ["Mirrors", "Magnets", "Strings", "Springs"], "category": "science", "source": "Merriam Webster Kaleidoscope"}
]
```

Correct options are first in the stored arrays. Shuffle only at presentation, preserving canonical identity. These are approachable baseline candidates; do not claim the requested adult success rate until playtests measure it.

| ID | Correct answer | Supporting reference |
| --- | --- | --- |
| fr-r001 | Mercury | [NASA Mercury Facts](https://science.nasa.gov/mercury/facts/) |
| fr-r002 | Venus | [NASA Venus Facts](https://science.nasa.gov/venus/venus-facts/) |
| fr-r003 | A giant storm | [NASA Jupiter Facts](https://science.nasa.gov/jupiter/jupiter-facts/) |
| fr-r004 | Saturn | [NASA Saturn Facts](https://science.nasa.gov/saturn/facts/) |
| fr-r005 | Iron minerals | [NASA Mars Facts](https://science.nasa.gov/mars/facts/) |
| fr-r006 | A star | [NASA Sun Facts](https://science.nasa.gov/sun/facts/) |
| fr-r007 | Ice and dust | [NASA Comet Facts](https://science.nasa.gov/solar-system/comets/facts/) |
| fr-r008 | Between Mars and Jupiter | [NASA Asteroid Facts](https://science.nasa.gov/solar-system/asteroids/facts/) |
| fr-r009 | Bamboo | [Kew Bamboo](https://www.kew.org/read-and-watch/bamboo-kew-pandas) |
| fr-r010 | Bark | [Kew Cinnamon](https://www.kew.org/plants/cinnamon) |
| fr-r011 | Cork | [Kew Secret Gardens](https://www.kew.org/read-and-watch/kew-secret-gardens) |
| fr-r012 | With spores | [National Park Service Ferns](https://www.nps.gov/muwo/learn/nature/ferns.htm) |
| fr-r013 | Orchids | [Kew Vanilla](https://www.kew.org/plants/vanilla) |
| fr-r014 | Condensation | [USGS Condensation](https://www.usgs.gov/water-science-school/science/condensation-and-water-cycle) |
| fr-r015 | Air pressure | [Merriam Webster Barometer](https://www.merriam-webster.com/dictionary/barometer) |
| fr-r016 | Nitrogen | [NOAA The Atmosphere](https://www.noaa.gov/jetstream/atmosphere) |
| fr-r017 | Sundial | [Merriam Webster Sundial](https://www.merriam-webster.com/dictionary/sundial) |
| fr-r018 | Sand | [Merriam Webster Hourglass](https://www.merriam-webster.com/dictionary/hourglass) |
| fr-r019 | Xylophone | [Merriam Webster Xylophone](https://www.merriam-webster.com/dictionary/xylophone) |
| fr-r020 | Accordion | [Merriam Webster Accordion](https://www.merriam-webster.com/dictionary/accordion) |
| fr-r021 | Fog | [Met Office Fog](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog) |
| fr-r022 | From the ceiling | [National Park Service Speleothems](https://home.nps.gov/subjects/caves/speleothems.htm) |
| fr-r023 | Geyser | [National Park Service Hydrothermal Features](https://www.nps.gov/yell/learn/nature/hydrothermal-features.htm) |
| fr-r024 | Ice | [USGS Glacier Ice](https://www.usgs.gov/faqs/glacier-ice-a-type-rock) |
| fr-r025 | Evaporation | [USGS Evaporation](https://www.usgs.gov/water-science-school/science/evaporation-and-water-cycle) |
| fr-r026 | Microscope | [Merriam Webster Microscope](https://www.merriam-webster.com/dictionary/microscope) |
| fr-r027 | Pulley | [Merriam Webster Pulley](https://www.merriam-webster.com/dictionary/pulley) |
| fr-r028 | Lever | [Merriam Webster Lever](https://www.merriam-webster.com/dictionary/lever) |
| fr-r029 | Funnel | [Merriam Webster Funnel](https://www.merriam-webster.com/dictionary/funnel) |
| fr-r030 | Mirrors | [Merriam Webster Kaleidoscope](https://www.merriam-webster.com/dictionary/kaleidoscope) |

#### 7. Names

First Frost; Weather Turn; Frostbound. First Frost remains the strongest fit for the studio world.

#### 8. Best one new idea

The private weather forecast in FIRSTFROST-D05. It addresses actual waiting time without converting the Frost console into a second ordinary trivia game.

### B5. Moongraft

#### 1. Verdict

**Keep. Family 9 out of 10. Adults 8 out of 10.** This is the pack's most distinctive emotional reward: people keep something they could not have drawn alone. Protect the absence of ranking and votes. The main release work is practical: joined pieces, reliable stroke recovery, identical compositing and a real save flow. The three player assignment contains no dedicated stem, so the result needs an intentional connector rather than an accidental gap.

#### 2. First time misunderstandings

Rules: players may assume they are drawing a whole plant. Drawing: abstract layer names and invisible joining positions produce floating pieces; a shy artist may interpret a detailed hint as a requirement. Grow: “same hash” is not proof every different drawing gets a different poem. Gallery: “yours to keep” does not tell a phone owner how to save the card or whether other drawings will disappear when the host exits.

#### 3. Directions

**MOONGRAFT-D01 | P0 | M | Connect pieces at every room size**

Where: phone and compositor. Phase: assignment and draw. Change: retain one layer per person and the base assignment order. Add a thin neutral connector stem behind player art whenever no human stem role is assigned, including the three player pot, bloom and leaves set. Show simple edge notches on local canvases at the intended connection points and text identifying neighboring roles, without revealing their drawings. Match those local notches to normalized global card coordinates. Review overlap and z order for every roster size from three to eight. Why: the joint plant should look intentionally assembled without demanding realistic drawing skill. Acceptance: eight representative scribble sets produce connected, legible plants; no required connector lies outside the assigned zone.

**MOONGRAFT-D02 | P0 | L | Save acknowledged strokes and render one canonical card**

Where: both. Phase: draw, reconnect and grow. Change: keep normalized coordinates and existing caps of 260 points per stroke and 220 strokes per player as starting constraints. Use stable stroke IDs, revisions and acknowledgement; handle retries without duplicate lines. Undo references the removed stroke ID and is synchronized. Restore the acknowledged drawing after reconnect and keep an unsent local queue until accepted or rejected. At the deadline, composite only accepted revisions; never silently pretend a rejected stroke was included. Factor rendering into shared code used by host, phone and export rather than maintaining two diverging hand copies. Snapshot dimensions, palette, ordering and renderer version with each card. Hashes can collide and a finite poem bank necessarily repeats: promise repeatable selection for the same canonical card, not a unique poem for every plant. Why: the keepsake must match the reveal. Acceptance: pixel comparisons within rasterization tolerance, undo recovery, packet duplication, stroke cap, resized phone and export tests pass.

**MOONGRAFT-D03 | P1 | M | Make the drawing controls forgiving**

Where: phone. Phase: draw. Change: keep the canvas large, palette of eight, three labeled brush sizes, Undo and Clear with confirmation. Add “Done for now”, which keeps the drawing editable; only finish early once everyone is done and a three second notice has elapsed. Use 80 seconds per plant initially; More reading time allows 120. Rotate roles across three plants so nobody draws the same role repeatedly where avoidable. An untouched layer stays blank, with its normal connector behavior, rather than being fabricated and credited to someone. Why: people need permission to make an odd scribble, and finishing early should not mean staring at a timer. Acceptance: a first time child and a self described non artist can make and undo a line without explanation; touching controls never marks the canvas.

**MOONGRAFT-D04 | P0 | M | Make keeping the plant a real action**

Where: both. Phase: grow and gallery. Change: display Save card and Save all three on each participant's phone. Export a clean 1200 by 1600 PNG from canonical data, with the generated name and poem only when available. Default player names off in exported cards; optional “Include our names” uses already approved display names. No device, room or location identifiers. Give a preview and browser appropriate download or share fallback. Preserve the last gallery locally until the player dismisses it; do not promise indefinite storage. Host End night must not destroy an already delivered card on another phone. Why: the artifact is the game's reward. Acceptance: actual Android and iOS browser tests save a viewable file; denied share or download has a clear fallback; reload restores the recent gallery within the stated local retention behavior.

**MOONGRAFT-D05 | P1 | M | Rotate prompt variants without adding incompatible layers**

Where: content loader and phone. Phase: assignment. Change: treat the 30 entries below as variants of the existing eight roles, not 30 simultaneous layers. Keys before “_r” identify the base role. Select one variant for each assigned base role, then retain that role's established zone and z order. Never let a variant change assignment priority or give someone two pieces. Reserve all 30 keys against collisions during import. Why: a small prompt change creates another delightful plant without needing more players or more art assets. Acceptance: select exactly one variant for each assigned role, one role per player, and render correctly at every supported count.

**MOONGRAFT-D06 | P2 | M | Add a handmade seed packet to the gallery**

Where: both. Phase: gallery. Change: prototype an alternate export frame like a botanical seed packet, using the existing generated name and poem plus a small silhouette made from the actual composite. No ratings, ownership rarity, economy or generated claims about real plant care. Why: a cohesive souvenir makes the night feel authored. Acceptance: the original clean card remains the default and both exports faithfully show the same drawing.

#### 4. Copy table

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | Everybody gets one secret piece of the same plant. | Each person draws one secret part of our plant. |
| Both, rules line 2 | Draw only your piece. You will not see the others. | Draw your part any way you like. The others stay hidden. |
| Both, rules line 3 | When the time is up the plant grows on this screen. | When time runs out, we put every part together. |
| Both, rules line 4 | No scores and no winners. You all keep the card. | There are no scores. Everyone can save the finished card. |
| Both, draw | Everybody is drawing | Our plant is taking shape |
| Both, gallery | Everyone earned sunbeams. The cards are yours to keep. | Our garden is ready. Save your cards below. |
| Both, unnamed card | A Quiet Growth | Our moon plant |
| Both, draw status fragment | have put something down | {count} of {eligible} people have started drawing |
| Both, credit | grown by | Grown together by {names} |
| Phone, connection hint fragment | meets the | Your {part} meets the {neighbor} at this edge. |
| Phone, rules | You will each get a secret piece to draw. | Your secret part will appear here. |
| Phone, loading | Finding your piece. | Preparing your drawing space. |
| Phone, loading | It will appear in a moment. | Keep this page open. |
| Phone, credit fragment | You drew the | Your part was the {part}. |
| Phone, gallery | The moon garden is full. | Three plants, grown together. |
| Phone, credit fragment | You helped grow | You helped grow {name}. |
| Phone, gallery | You earned sunbeams, and the cards are yours. | Save your cards before you leave. |
| Phone, draw | New | Undo / Clear drawing / Keep drawing / Done for now |
| Phone, gallery | New | Save card / Save all three / Include our names |
| Phone, partial recovery | New | Your saved strokes are back. Some recent strokes could not be restored. |

Keep “The moon garden”, “Grow more” and “Another game”. Moongraft uses a gallery, not a scored podium; do not apply the generic score total line to it.

#### 5. No big screen version

Rules: all instructions on each phone. Draw: own brief, neighbor labels, canvas, tools and a compact public progress count. No other unfinished stroke data reaches that phone. Grow: every phone reconstructs the same accepted composite and reveals its layers in the same scheduled order, 15 seconds total, with reduced motion showing the complete plant. Gallery: all three cards and save actions remain on each phone; only the host chooses Grow more or Another game. The host draws one assigned part with the same secrecy as everyone else in the UI. Keep 80 second drawing rounds on both modes and never let one slow animation alter the next phase deadline.

#### 6. New content

Thirty authored variants using the exact layer object fields. These are imaginative prompts, not factual statements. D05 is required before importing them. Existing role geometry is preserved; D01's connector must be implemented separately.

```json
[
  {"key": "pot_r001", "z": 40, "zone": [0.24, 0.6, 0.52, 0.3], "brief": "Draw a pot from an imaginary kitchen.", "hint": "A wobble can make it feel well loved."},
  {"key": "pot_r002", "z": 40, "zone": [0.24, 0.6, 0.52, 0.3], "brief": "Draw a home for a moon plant.", "hint": "A simple bowl is plenty of home."},
  {"key": "pot_r003", "z": 40, "zone": [0.24, 0.6, 0.52, 0.3], "brief": "Draw a container with a tiny doorway.", "hint": "The doorway can be just one little mark."},
  {"key": "pot_r004", "z": 40, "zone": [0.24, 0.6, 0.52, 0.3], "brief": "Draw a pot with a surprising pattern.", "hint": "A few dots can be a whole pattern."},
  {"key": "bloom_r005", "z": 70, "zone": [0.24, 0.03, 0.52, 0.3], "brief": "Draw a flower that opens at midnight.", "hint": "It can be as simple as a circle."},
  {"key": "bloom_r006", "z": 70, "zone": [0.24, 0.03, 0.52, 0.3], "brief": "Draw a flower made of pretend paper.", "hint": "Folded, crumpled or flat can all be lovely."},
  {"key": "bloom_r007", "z": 70, "zone": [0.24, 0.03, 0.52, 0.3], "brief": "Draw a flower that looks like a lantern.", "hint": "A wonky glow is still a glow."},
  {"key": "bloom_r008", "z": 70, "zone": [0.24, 0.03, 0.52, 0.3], "brief": "Draw the smallest grand flower.", "hint": "Small can be splendid too."},
  {"key": "leaves_r009", "z": 60, "zone": [0.06, 0.26, 0.88, 0.36], "brief": "Draw leaves for a windy garden.", "hint": "A few loose curves can say plenty."},
  {"key": "leaves_r010", "z": 60, "zone": [0.06, 0.26, 0.88, 0.36], "brief": "Draw leaves from a paper collection.", "hint": "They do not have to match each other."},
  {"key": "leaves_r011", "z": 60, "zone": [0.06, 0.26, 0.88, 0.36], "brief": "Draw leaves with a playful pattern.", "hint": "Dots and squiggles are welcome here."},
  {"key": "leaves_r012", "z": 60, "zone": [0.06, 0.26, 0.88, 0.36], "brief": "Draw leaves for a sleepy plant.", "hint": "One relaxed shape could be enough."},
  {"key": "stem_r013", "z": 50, "zone": [0.34, 0.28, 0.32, 0.36], "brief": "Draw a stem with a little twist.", "hint": "A wandering line can hold a whole plant."},
  {"key": "stem_r014", "z": 50, "zone": [0.34, 0.28, 0.32, 0.36], "brief": "Draw a stem like a garden staircase.", "hint": "It does not need straight steps."},
  {"key": "stem_r015", "z": 50, "zone": [0.34, 0.28, 0.32, 0.36], "brief": "Draw a stem that takes the scenic route.", "hint": "Your line is allowed to wander."},
  {"key": "stem_r016", "z": 50, "zone": [0.34, 0.28, 0.32, 0.36], "brief": "Draw a stem with a tiny window.", "hint": "A single dot could be the window."},
  {"key": "companion_r017", "z": 80, "zone": [0.58, 0.56, 0.4, 0.36], "brief": "Draw a visitor carrying a leaf.", "hint": "Any little shape could be a visitor."},
  {"key": "companion_r018", "z": 80, "zone": [0.58, 0.56, 0.4, 0.36], "brief": "Draw a creature waiting for moonrise.", "hint": "It can be imaginary from top to bottom."},
  {"key": "companion_r019", "z": 80, "zone": [0.58, 0.56, 0.4, 0.36], "brief": "Draw a tiny gardener for this plant.", "hint": "A dot with a hat can be a gardener."},
  {"key": "companion_r020", "z": 80, "zone": [0.58, 0.56, 0.4, 0.36], "brief": "Draw something resting beside the pot.", "hint": "A simple curl can look quite content."},
  {"key": "aura_r021", "z": 20, "zone": [0.02, 0.02, 0.96, 0.74], "brief": "Draw the weather of a very quiet night.", "hint": "A few marks can suggest a whole evening."},
  {"key": "aura_r022", "z": 20, "zone": [0.02, 0.02, 0.96, 0.74], "brief": "Draw a little drifting garden magic.", "hint": "There is no wrong shape for pretend magic."},
  {"key": "aura_r023", "z": 20, "zone": [0.02, 0.02, 0.96, 0.74], "brief": "Draw a breeze you could almost see.", "hint": "A loose line is enough to begin."},
  {"key": "aura_r024", "z": 20, "zone": [0.02, 0.02, 0.96, 0.74], "brief": "Draw light from a hidden lantern.", "hint": "It can be faint, patchy or wonderfully odd."},
  {"key": "roots_r025", "z": 30, "zone": [0.18, 0.85, 0.64, 0.14], "brief": "Draw roots with a little secret.", "hint": "The secret can be something very small."},
  {"key": "roots_r026", "z": 30, "zone": [0.18, 0.85, 0.64, 0.14], "brief": "Draw a cozy place beneath the soil.", "hint": "A soft scribble can make a good hiding place."},
  {"key": "roots_r027", "z": 30, "zone": [0.18, 0.85, 0.64, 0.14], "brief": "Draw roots exploring the dark.", "hint": "Wandering lines are welcome underground."},
  {"key": "sky_r028", "z": 10, "zone": [0, 0, 1, 0.58], "brief": "Draw a sky with room for a surprise.", "hint": "Empty space can be part of your picture."},
  {"key": "sky_r029", "z": 10, "zone": [0, 0, 1, 0.58], "brief": "Draw a moon having a quiet evening.", "hint": "A lopsided moon is still a moon."},
  {"key": "sky_r030", "z": 10, "zone": [0, 0, 1, 0.58], "brief": "Draw clouds for an imaginary garden.", "hint": "Any cloudy shape belongs here."}
]
```

#### 7. Names

Moongraft; Odd Garden; Grown Together. Moongraft is memorable, while Grown Together is the clearest descriptive alternative.

#### 8. Best one new idea

The seed packet keepsake in MOONGRAFT-D06. The reward should be something the room made, not points attached to drawing skill.

### B6. Same Soil

#### 1. Verdict

**Polish. Family 9 out of 10. Adults 8 out of 10.** The simplest social game in the pack is an excellent opener, especially for two. Preserve the subject's authority over their own preference. The stated “10 to 12 rounds” cannot also guarantee equal subject turns for every supported room size: seven or eight players need a different total. Make that tradeoff explicit rather than shipping an invisible advantage.

#### 2. First time misunderstandings

Pick: the subject may not realize their answer is final, and non subjects cannot tell whether to answer yet. Guess: “which is more them” invites personality judgments rather than guessing this particular choice. Reveal: “nobody knew you” can feel personal after an innocent preference surprise. Podium: unequal subject turns can skew the subject's 40 point bonuses.

#### 3. Directions

**SAMESOIL-D01 | P0 | S | Guarantee equal subject turns with truthful round counts**

Where: both. Phase: setup and rotation. Change: standard counts are 12 rounds for 2 players, 12 for 3, 12 for 4, 10 for 5, 12 for 6, 14 for 7 and 16 for 8. Shuffle the subject order once, then cycle it evenly. A Short option gives two subject turns each, except two players get four each for eight rounds. Show the selected total and estimate before Start. Late joiners wait for the next game. Explicit departures trigger the shared minimum and fairness handling; never award an absent subject a fabricated pick. Why: equal opportunities matter more than an arbitrary duration claim. Acceptance: every retained player receives the stated equal count and the picker never promises ten rounds for an eight player standard game.

**SAMESOIL-D02 | P0 | M | Make the subject choice final and private**

Where: phone and authority. Phase: pick and guess. Change: subject selects, then taps “This is my pick”. Only that submission opens the guessing phase. Other phones see both options but cannot submit until then. Do not distribute the subject answer until reveal. No subject answer at the deadline voids the round; retry that subject once with a different pair, then move on if still absent. No competitive points for either void. Why: “they changed their mind after seeing our guesses” must never be possible. Acceptance: reload keeps the final pick private and final; guests cannot infer it from selected classes, option order or event payloads.

**SAMESOIL-D03 | P1 | S | Keep the preference language light and specific**

Where: both. Phase: rules, reveal and selection. Change: ask which option someone picked today. Keep 100 for each correct guess and 40 per correct guess to the subject. Do not score missing guesses. Use 16 seconds for the subject, 18 for guessing and 9 for reveal, with the shared editable finish window for guesses. Avoid presenting low consensus as poor friendship or faulty self knowledge. Why: a surprising answer should invite curiosity. Acceptance: testers can state that the subject cannot be wrong, explain their points and comfortably choose either side.

**SAMESOIL-D04 | P1 | M | Build a small illustrated set only after the words work**

Where: both. Phase: pair display. Change: keep large word pairs as the release requirement. Later pilot illustrations on 12 strongly tested pairs, keeping words visible and equal visual emphasis on both choices. Do not commission hundreds of assets before preference split and comprehension tests. Why: better art should clarify the choice rather than conceal an uneven prompt. Acceptance: image and text versions produce similar interpretation; no side looks like a reward while the other looks like a punishment.

**SAMESOIL-D05 | P2 | S | Offer a gentle conversation invitation**

Where: both. Phase: selected reveals. Change: occasionally show “What made you choose it?” without a mandatory response, input field or added points. Let the subject decline by simply waiting for the normal timer. Why: learning the reason can be more enjoyable than learning the answer. Acceptance: voluntary short stories add warmth without turning the game into an interview.

#### 4. Copy table

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | One of you is the subject each round. | Each round, one person makes a secret choice. |
| Both, rules line 2 | The subject picks which of two things is more them. | Pick the option you prefer today. |
| Both, rules line 3 | Everybody else guesses what they picked. | Everyone else guesses your choice. |
| Both, rules line 4 | The subject is always right about themselves. | Your choice is yours. There is no wrong preference. |
| Both, rules detail | New | A correct guess earns 100. The chooser earns 40 for each correct guess. |
| Both, picked fragment | has decided | {name} has made a choice. |
| Both, guessing fragment | have guessed | {count} of {eligible} guesses saved |
| TV, pick wait | Everyone else, eyes up and think | What do you think {name} will choose? |
| Both, no pick fragment | did not say | No choice was saved. |
| Both, void | Only they can answer that one, so it goes back in the soil. | This round does not count. We will try another pair. |
| Both, question fragment | Which is more | Which one did {name} choose? |
| Both, reveal fragment | knew that, and | {count} people guessed {name}'s choice. |
| Phone, pick saved | That is your answer. Nobody can argue with it. | Your choice is saved. Let us see what everyone guesses. |
| Phone, guess saved | Guess in. You can change it until time is up. | Guess saved. You can change it until time runs out. |
| Phone, pick | Which of these is more you? | Which would you pick today? |
| Phone, pick | Only you decide this one. | Your choice stays secret until the reveal. |
| Phone, wait | Have a think about what they will say. | What do you think {name} will choose? |
| Phone, subject wait | They are guessing you. | Everyone is guessing your choice. |
| Phone, subject wait | You score for every person who gets it right. | You earn 40 for each correct guess. |
| Phone, guess | Tap the one you think they picked. | Guess the option they chose. |
| Phone, void | That one waited for you | No choice was saved. |
| Phone, void | Round let go | This round does not count. |
| Phone, void fragment | can answer that, so nobody scored it. | Only {name} can choose. No points this round. |
| Phone, subject result fragment | They knew you, + | {count} people matched your choice. +{points} |
| Phone, subject result | Nobody had you that time | Your choice surprised everyone. |
| Phone, guess result | You knew them, +100 | You matched their choice. +100 |
| Phone, guess result | Not this time | You guessed {guess}. They chose {choice}. |
| Phone, pick submit | New | This is my pick |

#### 5. No big screen version

Rules: a simple sample pick and reveal on every phone. Pick: subject receives actionable choices and submission, others see the pair and subject name. Guess: subject sees their own final choice privately, others see identical choices and timer. Reveal: selected side, guess markers and score breakdown appear everywhere. Podium: full results and host controls. No separate standings phase is needed; provide an expandable score panel during reveals. Host rotates as a subject normally. Subject choice and other people's guesses remain recipient private until reveal. No display mode specific timer change is needed.

#### 6. New content

```json
[
  {"id": "ss-r001", "a": "A hidden path", "b": "A clear view", "category": "adventure"},
  {"id": "ss-r002", "a": "A rainy window", "b": "A sunny porch", "category": "comfort"},
  {"id": "ss-r003", "a": "A tiny waterfall", "b": "A wide river", "category": "places"},
  {"id": "ss-r004", "a": "A paper lantern", "b": "A string light", "category": "comfort"},
  {"id": "ss-r005", "a": "Warm bread", "b": "Cold fruit", "category": "food"},
  {"id": "ss-r006", "a": "A snowy pine", "b": "An autumn maple", "category": "weather"},
  {"id": "ss-r007", "a": "An otter", "b": "A red panda", "category": "animals"},
  {"id": "ss-r008", "a": "A garden maze", "b": "A woodland trail", "category": "adventure"},
  {"id": "ss-r009", "a": "Crunchy cookies", "b": "Soft cookies", "category": "food"},
  {"id": "ss-r010", "a": "A quiet train", "b": "A gentle boat", "category": "adventure"},
  {"id": "ss-r011", "a": "Cloud watching", "b": "Stone collecting", "category": "adventure"},
  {"id": "ss-r012", "a": "A rooftop garden", "b": "A courtyard garden", "category": "places"},
  {"id": "ss-r013", "a": "A long chapter", "b": "Several short tales", "category": "comfort"},
  {"id": "ss-r014", "a": "A crisp morning", "b": "A hazy afternoon", "category": "time"},
  {"id": "ss-r015", "a": "A smooth pebble", "b": "A curly shell", "category": "senses"},
  {"id": "ss-r016", "a": "A round window", "b": "A tall window", "category": "comfort"},
  {"id": "ss-r017", "a": "A paper map", "b": "A trail sign", "category": "adventure"},
  {"id": "ss-r018", "a": "A lemon scent", "b": "A mint scent", "category": "senses"},
  {"id": "ss-r019", "a": "A warm breeze", "b": "A cool breeze", "category": "weather"},
  {"id": "ss-r020", "a": "A tiny notebook", "b": "A big sketchbook", "category": "comfort"},
  {"id": "ss-r021", "a": "A hidden nook", "b": "A wide balcony", "category": "places"},
  {"id": "ss-r022", "a": "A fox", "b": "A badger", "category": "animals"},
  {"id": "ss-r023", "a": "Soft moss", "b": "Dry leaves", "category": "senses"},
  {"id": "ss-r024", "a": "A winding stream", "b": "A still pond", "category": "places"},
  {"id": "ss-r025", "a": "A pear", "b": "A peach", "category": "food"},
  {"id": "ss-r026", "a": "A waterfall sound", "b": "A rain sound", "category": "senses"},
  {"id": "ss-r027", "a": "A little cabin", "b": "A tent clearing", "category": "places"},
  {"id": "ss-r028", "a": "A striped moth", "b": "A spotted beetle", "category": "animals"},
  {"id": "ss-r029", "a": "Building a model", "b": "Solving a puzzle", "category": "comfort"},
  {"id": "ss-r030", "a": "Sun through leaves", "b": "Moon on water", "category": "senses"}
]
```

These are subjective choices. The requested brevity is preserved; unfamiliar words should be tested with younger readers before release.

#### 7. Names

Same Soil; Your Pick; This or That Together.

#### 8. Best one new idea

The optional reason behind the choice in SAMESOIL-D05. It builds connection without judging how well someone knows a family member.

### B7. Wide Margin

#### 1. Verdict

**Rework the content contract, polish the game. Family 7 out of 10. Adults 8 out of 10.** Simultaneous percentages produce a lovely reveal, but this is the most evidence sensitive bank. The supplied examples include drifting glacier coverage, imprecise food water content, inconsistent categories and a brand name despite the house rule. Also, the written score table allows zero beyond 30 points even though the promise says every thoughtful guess scores. Retain private guesses and generous distance bands; make the promise mathematically true and the source contract precise.

#### 2. First time misunderstandings

Rules: some players do not know what a percentage represents. Question: an untouched center value may be mistaken for a submitted guess. Submit: “Lock it in” conflicts with “Move it again”. Reveal: 10 percentage points away is not necessarily 10 percent relative error. Closest can be tied; an estimated scientific quantity is not exact to the last whole number.

#### 3. Directions

**WIDEMARGIN-D01 | P0 | M | Make units and evidence part of each question**

Where: both and authoring. Phase: question and reveal. Change: say what the percentage measures, including surface area, volume, mass or a named historical estimate. Audit against a specific source value and round half up to a whole number only for the game. Reveal “About {answer}%” for estimates and show the underlying figure in source details. Do not present scientific estimates as timeless exact constants. Exclude values with source disagreement larger than the scoring tolerance unless a named reference model or dated dataset is explicit. Quarantine glacier coverage items without a fixed historical scope, food water items without a specified food record, the vague catfish taste bud claim and the branded tile question. Normalize to the bank's declared categories in a deliberate migration. Why: “what percent of Earth is water” has several legitimate denominators. Acceptance: each released ID has one traceable value, one denominator, rounding metadata and a checked source.

**WIDEMARGIN-D02 | P0 | S | Make the scoring promise true at every distance**

Where: both. Phase: scoring and reveal. Change: use absolute difference in percentage points against the rounded stored answer. Distances 0 to 3 earn 150, 4 to 7 earn 100, 8 to 12 earn 70, 13 to 20 earn 40, 21 to 30 earn 15 and 31 to 100 earn 5 for a submitted guess. No submission earns 0. Each player tied for closest earns 50 extra; if there are no valid guesses, award no closest bonus. Show base and bonus separately. Why: every intentional guess earns something and ties are predictable. Acceptance: test every boundary, both endpoints, tied nearest guesses and no guesses. This deliberately changes the documented zero outside the bands.

**WIDEMARGIN-D03 | P1 | M | Teach out of one hundred and keep the dial honest**

Where: phone. Phase: rules and question. Change: one tutorial shows 25 shaded squares out of 100 with the sentence “25% means 25 out of 100.” Keep slider, large numeric value and 48 pixel plus and minus controls; add “Save guess”. A local draft value is not sent until saved. Subsequent edits require Save changes. Show the last acknowledged value separately if the draft differs. Allow 26 seconds per question, ten rounds and ten second reveals; use the shared announced close rule. Why: neither a default 50 nor an unsent draft should become a score. Acceptance: 0, 47 and 100 can be deliberately submitted with drag, keyboard and nudge controls.

**WIDEMARGIN-D04 | P1 | M | Reveal the room without teaching the next answer**

Where: both. Phase: selection and reveal. Change: first show the truthful value and source, then animate markers into their positions and show each distance. Stack equal markers with names rather than overlapping them. Do not sample complementary facts or near duplicates in the same game, such as hydrogen and helium percentages of the same atmosphere. Limit specialized gas and chemistry questions to at most two in a standard session when the full bank supports alternatives. Why: the spread is the show, and one answer should not solve the next. Acceptance: eight identical guesses remain readable; a ten question deck spans at least four topic families when enough audited entries exist.

**WIDEMARGIN-D05 | P2 | M | Add a private confidence note without changing points**

Where: phone. Phase: after saving a guess. Change: offer optional “A hunch” or “Quite sure”. Reveal the player's own confidence beside their result, without ranking confidence or adding a wager. Why: a surprising fact can become a small moment of self discovery. Acceptance: it adds no required tap and no waiting; remove if it distracts from the shared reveal.

#### 4. Copy table

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | A question with a real answer between nothing and everything. | Guess a percentage from 0 to 100. |
| Both, rules line 2 | Everybody drags to the number they believe, at the same time. | Set your number and tap Save guess. |
| Both, rules line 3 | Closest to the truth takes the most. | Closer guesses earn more. The closest earn 50 extra. |
| Both, rules line 4 | Being close still pays, so guess bravely. | Every saved guess earns at least 5 points. |
| Both, status fragment | locked in | {count} of {eligible} guesses saved |
| Both, unit | per cent | percent |
| Phone, submit | Lock it in | Save guess |
| Phone, instruction | Drag the bar, or nudge it. Lock it in when you are happy. | Drag or use the buttons. Then save your guess. |
| Phone, saved fragment | Locked at | Saved guess: {guess}% |
| Phone, edit | Locked in. Move it again if you change your mind. | You can change your number. Tap Save changes to send it. |
| Phone, rules | You will be guessing a number out of a hundred. | 25% means 25 out of 100. |
| Phone, result fragment | Closest in the room, + | Closest in the room. +50 bonus |
| Phone, result | Wide of it this time | You were {distance} percentage points away. +{base} |
| Both, reveal | New | About {answer}%. {explanation} |
| Phone, pending draft | New | Changes not saved. / Save changes |

#### 5. No big screen version

Rules: percentage example and scoring overview. Question: full scoped question, current draft, last saved value, timer and controls. No other guesses or answer appear. Reveal: the same 0 to 100 line, stacked room markers, source and own distance on every phone. Standings after five rounds and podium: full scores and tied placements. Host uses the same guessing UI and has no answer preview. All new timings apply in both modes. Source detail links open after the reveal and do not pause the room.

#### 6. New content

Thirty sourced percentage candidates. Some use named reference estimates because the original demand for only immutable constants conflicts with several kinds of interesting natural percentage. The wording makes that reference explicit. These additions are intentionally science focused; blend them with the audited existing bank, not as a standalone 30 question playlist. None is an invented survey or an arithmetic ratio masquerading as a published percentage.

```json
[
  {"id": "wm-r001", "q": "What percentage of Earth's dry air is nitrogen by volume?", "answer": 78, "source": "NOAA The Atmosphere", "category": "science"},
  {"id": "wm-r002", "q": "What percentage of Earth's dry air is oxygen by volume?", "answer": 21, "source": "NOAA The Atmosphere", "category": "science"},
  {"id": "wm-r003", "q": "What percentage of Earth's dry air is argon by volume?", "answer": 1, "source": "NOAA The Atmosphere", "category": "science"},
  {"id": "wm-r004", "q": "What percentage of Venus's surface air is carbon dioxide by volume, in NASA's fact sheet?", "answer": 97, "source": "NASA Venus Fact Sheet", "category": "space"},
  {"id": "wm-r005", "q": "What percentage of Venus's surface air is nitrogen by volume, in NASA's fact sheet?", "answer": 4, "source": "NASA Venus Fact Sheet", "category": "space"},
  {"id": "wm-r006", "q": "What percentage of Mars's air is carbon dioxide by volume, in NASA's fact sheet?", "answer": 95, "source": "NASA Mars Fact Sheet", "category": "space"},
  {"id": "wm-r007", "q": "What percentage of Mars's air is nitrogen by volume, in NASA's fact sheet?", "answer": 3, "source": "NASA Mars Fact Sheet", "category": "space"},
  {"id": "wm-r008", "q": "What percentage of Mars's air is argon by volume, in NASA's fact sheet?", "answer": 2, "source": "NASA Mars Fact Sheet", "category": "space"},
  {"id": "wm-r009", "q": "What percentage of Jupiter's air is hydrogen by volume, in NASA's fact sheet?", "answer": 90, "source": "NASA Jupiter Fact Sheet", "category": "space"},
  {"id": "wm-r010", "q": "What percentage of Jupiter's air is helium by volume, in NASA's fact sheet?", "answer": 10, "source": "NASA Jupiter Fact Sheet", "category": "space"},
  {"id": "wm-r011", "q": "What percentage of Saturn's air is hydrogen by volume, in NASA's fact sheet?", "answer": 96, "source": "NASA Saturn Fact Sheet", "category": "space"},
  {"id": "wm-r012", "q": "What percentage of Saturn's air is helium by volume, in NASA's fact sheet?", "answer": 3, "source": "NASA Saturn Fact Sheet", "category": "space"},
  {"id": "wm-r013", "q": "What percentage of Uranus's air is methane by volume, in NASA's fact sheet?", "answer": 2, "source": "NASA Uranus Fact Sheet", "category": "space"},
  {"id": "wm-r014", "q": "What percentage of all Earth's water is freshwater in the USGS reference estimate?", "answer": 3, "source": "USGS Water Distribution", "category": "earth"},
  {"id": "wm-r015", "q": "What percentage of all Earth's water is in oceans, seas and bays in the USGS estimate?", "answer": 97, "source": "USGS Global Water Distribution", "category": "earth"},
  {"id": "wm-r016", "q": "What percentage of Earth's freshwater is in ice caps, glaciers and permanent snow in the USGS estimate?", "answer": 69, "source": "USGS Global Water Distribution", "category": "earth"},
  {"id": "wm-r017", "q": "What percentage of Earth's freshwater is groundwater in the USGS reference estimate?", "answer": 30, "source": "USGS Global Water Distribution", "category": "earth"},
  {"id": "wm-r018", "q": "What percentage of Mercury's radius is occupied by its metallic core, according to NASA?", "answer": 85, "source": "NASA Mercury Facts", "category": "space"},
  {"id": "wm-r019", "q": "What percentage of Earth's surface magnetic field strength does Mercury's reach, per NASA?", "answer": 1, "source": "NASA Mercury Facts", "category": "space"},
  {"id": "wm-r020", "q": "What percentage of the Moon's surface can be seen from Earth over time because of its wobble?", "answer": 59, "source": "NASA Moon Wobble", "category": "space"},
  {"id": "wm-r021", "q": "What percentage of cosmic mass and energy was dark matter in NASA's 2013 Planck summary?", "answer": 27, "source": "NASA JPL Planck 2013", "category": "space"},
  {"id": "wm-r022", "q": "What percentage of cosmic mass and energy was dark energy in NASA's 2013 Planck summary?", "answer": 68, "source": "NASA JPL Planck 2013", "category": "space"},
  {"id": "wm-r023", "q": "What percentage of Earth's crust is silicon by mass, according to the RSC?", "answer": 28, "source": "Royal Society of Chemistry Silicon", "category": "materials"},
  {"id": "wm-r024", "q": "What percentage of Earth's crust is aluminium by mass, according to the RSC?", "answer": 8, "source": "Royal Society of Chemistry Aluminium", "category": "materials"},
  {"id": "wm-r025", "q": "What percentage of sterling silver's mass is silver at the 925 standard?", "answer": 93, "source": "Birmingham Assay Office", "category": "materials"},
  {"id": "wm-r026", "q": "What percentage of 18 carat gold's mass is gold at the 750 standard?", "answer": 75, "source": "Birmingham Assay Office", "category": "materials"},
  {"id": "wm-r027", "q": "What percentage of 9 carat gold's mass is gold at the 375 standard?", "answer": 38, "source": "Birmingham Assay Office", "category": "materials"},
  {"id": "wm-r028", "q": "What percentage of Earth's surface does the Atlantic Ocean cover, approximately?", "answer": 20, "source": "NOAA Atlantic Ocean", "category": "world"},
  {"id": "wm-r029", "q": "What percentage of incoming sunlight is reflected to space in NASA's 2009 energy budget?", "answer": 29, "source": "NASA Earth Energy Budget 2009", "category": "earth"},
  {"id": "wm-r030", "q": "What percentage of incoming sunlight heats the surface in NASA's 2009 energy budget?", "answer": 48, "source": "NASA Earth Energy Budget 2009", "category": "earth"}
]
```

Evidence ledger. Round nonnegative values half up, not Python's default ties to even. For example, 92.5 becomes 93 and 3.5 becomes 4. Percentages rounded individually need not sum to 100. Keep the raw value in reveal source details; compare guesses to the stored integer answer consistently.

The water distribution entries refer to the historical reference estimate reproduced by USGS, attributed there to Shiklomanov in Water in Crisis, 1993. Planetary atmosphere entries use the central values in the linked fact sheets, with their published uncertainty, rather than claiming an exact measurement for every altitude. The named reference scope is essential to these questions. Jupiter and Saturn estimates have uncertainty of roughly two percentage points; scoring precision must not be described as physical exactness. The core and magnetic field comparisons are approximate educational figures. The RSC abbreviation should be expanded as Royal Society of Chemistry in source details.

| ID | Published value | Stored answer | Scope and reveal note | Source |
| --- | --- | --- | --- | --- |
| wm-r001 | 78.084% | 78% | Dry air excludes water vapor. | [NOAA The Atmosphere](https://www.noaa.gov/jetstream/atmosphere) |
| wm-r002 | 20.946% | 21% | Oxygen accounts for roughly one fifth of dry air. | [NOAA The Atmosphere](https://www.noaa.gov/jetstream/atmosphere) |
| wm-r003 | 0.934% | 1% | Argon is a small but measurable part of dry air. | [NOAA The Atmosphere](https://www.noaa.gov/jetstream/atmosphere) |
| wm-r004 | 96.5% | 97% | The near surface atmosphere is overwhelmingly carbon dioxide. | [NASA Venus Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html) |
| wm-r005 | 3.5% | 4% | The figure is rounded independently of the carbon dioxide answer. | [NASA Venus Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html) |
| wm-r006 | 95.1% | 95% | This is atmospheric composition, not surface coverage. | [NASA Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html) |
| wm-r007 | 2.59% | 3% | The fact sheet gives 2.59 percent by volume. | [NASA Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html) |
| wm-r008 | 1.94% | 2% | Argon accounts for nearly two percent of this reference atmosphere. | [NASA Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html) |
| wm-r009 | 89.8% | 90% | Molecular hydrogen dominates this reference composition. | [NASA Jupiter Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html) |
| wm-r010 | 10.2% | 10% | Helium makes up about one tenth in this reference composition. | [NASA Jupiter Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html) |
| wm-r011 | 96.3% | 96% | NASA lists molecular hydrogen as the main gas. | [NASA Saturn Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html) |
| wm-r012 | 3.25% | 3% | This is the central reference estimate, not an exact constant. | [NASA Saturn Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html) |
| wm-r013 | 2.3% | 2% | A small methane fraction helps give Uranus its color. | [NASA Uranus Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html) |
| wm-r014 | 2.5% | 3% | Freshwater is only a small fraction of Earth's total water. | [USGS Water Distribution](https://water.usgs.gov/edu/gallery/watercyclekids/earth-water-distribution.html) |
| wm-r015 | 96.54% | 97% | This is the share of total water volume, not surface area. | [USGS Global Water Distribution](https://www.usgs.gov/water-science-school/science/how-much-water-there-earth) |
| wm-r016 | 68.7% | 69% | This reference estimate places most freshwater in frozen stores. | [USGS Global Water Distribution](https://www.usgs.gov/water-science-school/science/how-much-water-there-earth) |
| wm-r017 | 30.1% | 30% | Only fresh groundwater is included in this freshwater fraction. | [USGS Global Water Distribution](https://www.usgs.gov/water-science-school/science/how-much-water-there-earth) |
| wm-r018 | 85% | 85% | This is a radius comparison, not a volume or mass fraction. | [NASA Mercury Facts](https://science.nasa.gov/mercury/facts/) |
| wm-r019 | 1% | 1% | NASA gives an approximate surface field comparison. | [NASA Mercury Facts](https://science.nasa.gov/mercury/facts/) |
| wm-r020 | 59% | 59% | Libration lets us glimpse beyond a single fixed hemisphere. | [NASA Moon Wobble](https://svs.gsfc.nasa.gov/10836/) |
| wm-r021 | 26.8% | 27% | This is a named historical model estimate, not directly visible matter. | [NASA JPL Planck 2013](https://www.jpl.nasa.gov/images/pia16878-refining-the-ingredients-of-our-universe/) |
| wm-r022 | 68.3% | 68% | This figure belongs to the same specified 2013 summary. | [NASA JPL Planck 2013](https://www.jpl.nasa.gov/images/pia16878-refining-the-ingredients-of-our-universe/) |
| wm-r023 | 27.7% | 28% | The percentage concerns crustal mass, not the whole planet. | [Royal Society of Chemistry Silicon](https://periodic-table.rsc.org/element/14/silicon) |
| wm-r024 | 8.1% | 8% | Aluminium is the most abundant metal in the crust. | [Royal Society of Chemistry Aluminium](https://periodic-table.rsc.org/element/13/aluminium) |
| wm-r025 | 92.5% | 93% | The standard is 925 parts silver per thousand. | [Birmingham Assay Office](https://www.theassayoffice.co.uk/how-to-read-a-uk-hallmark-a-beginners-guide/) |
| wm-r026 | 75% | 75% | The standard is 750 parts gold per thousand. | [Birmingham Assay Office](https://www.theassayoffice.co.uk/how-to-read-a-uk-hallmark-a-beginners-guide/) |
| wm-r027 | 37.5% | 38% | The standard is 375 parts gold per thousand. | [Birmingham Assay Office](https://www.theassayoffice.co.uk/how-to-read-a-uk-hallmark-a-beginners-guide/) |
| wm-r028 | 20% | 20% | NOAA gives approximately one fifth of Earth's surface. | [NOAA Atlantic Ocean](https://oceanservice.noaa.gov/facts/atlantic.html) |
| wm-r029 | 29% | 29% | This is the reference global energy budget, not today's weather. | [NASA Earth Energy Budget 2009](https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/) |
| wm-r030 | 48% | 48% | The figure includes absorption by the land and ocean surface. | [NASA Earth Energy Budget 2009](https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/) |

Do not put paired atmosphere fractions, paired alloy standards, the two cosmic fractions or both energy budget entries in the same session. These are separate import candidates, not a suggested fixed deck. The material composition questions concern alloys, not wealth or purchasing. If the director interprets the no money rule to exclude precious materials entirely, quarantine those three and replace them before release rather than changing that rule silently.


#### 7. Names

Wide Margin; Somewhere Close; Give or Take.

#### 8. Best one new idea

The optional confidence note in WIDEMARGIN-D05. Keep it personal and unscored so a confident mistake remains amusing rather than expensive.

### B8. Bearing

#### 1. Verdict

**Keep with stronger onboarding. Family 8 out of 10. Adults 9 out of 10.** This is the strongest conversation engine in the pack. A one word clue forces creative interpretation without a typing surface. It still requires people to hear or otherwise communicate the spoken clue in the same physical room; Phones only is not the same as remote play. The spectrum audit is also too absolute: not every imaginable object has a sensible position on every useful continuum. Test whether the pair supports many familiar examples and meaningful middle positions, not whether a kettle has a literal place on every axis.

#### 2. First time misunderstandings

Rules: a clue giver may say a number, use an endpoint word or explain afterward. Clue: others may try to point before hearing anything. Guess: a default midpoint looks like a choice. Reveal: “whatever the room scores” sounds like the sum, whereas the documented rule is the average. Rotation: a longer session may give unequal Lantern turns if the round count is rounded arbitrarily.

#### 3. Directions

**BEARING-D01 | P0 | M | Protect the hidden target and define the spoken clue**

Where: both. Phase: clue. Change: choose an integer target from 8 through 92 inclusive, away from the extreme ends. Only the Lantern receives it. Permit one ordinary spoken word, no number, no endpoint word and no added explanation. Give a demonstration with an authored example: Quiet to Noisy, “Library” near the quiet end. A compound usually written as one word is allowed; do not build an automatic speech judge. The Lantern may repeat the same word for hearing, and may privately tap “Need another pair” once before saying a clue, with no penalty. No spoken clue by the deadline voids the round, then advances fairly. Why: shared expectations make creative play possible. Acceptance: host as guesser cannot see the target, no hidden target appears in other phone payloads and a skipped clue never scores midpoint defaults.

**BEARING-D02 | P0 | M | Make scoring and role rotation fair**

Where: both. Phase: setup, guess and reveal. Change: each guess earns 150 within 5, 100 within 12, 50 within 20, 20 within 30 and 0 otherwise. Lantern earns the arithmetic mean of eligible guesser scores, rounded half up, including zero for eligible players who did not submit. Explicit departures before the guess phase are excluded; a mid phase disconnect is missing input under the shared contract. With no valid guesses, award no points. Use two complete Lantern cycles: 6 to 16 rounds for 3 to 8 players, and offer one complete cycle as Short. Never score the Lantern as a guesser. Why: everybody has equal turns and the clue giver cannot profit from only their best friend submitting. Acceptance: test fractional means, absent guesses, all misses and reconnect during the Lantern role.

**BEARING-D03 | P1 | M | Make the spectrum usable with a thumb**

Where: phone. Phase: clue and guess. Change: keep endpoints fixed left and right on every phone. Show a large local pointer with nudge buttons, accessible slider labeling and explicit Save position. Unsaved defaults do not count. Do not reveal bands around the secret target before the common reveal. Start with 24 seconds for clue, 24 for guess and ten for reveal, with More reading time available. Acknowledged changes follow the shell close rule. Why: interpretation should be hard; placing a pointer should be easy. Acceptance: 0, 50 and 100 are reachable by keyboard, touch and nudges; every saved value maps identically across widths.

**BEARING-D04 | P1 | M | Audit useful middle ground and explain it in the reveal**

Where: authoring and both. Phase: selection and reveal. Change: require at least five familiar example clues spanning low, middle and high positions. Remove pairs that are primarily categories or personal judgments, including Morning to Night unless a coherent continuous interpretation is demonstrated. Prefer familiar literal axes for Family and more interpretive axes for Mixed. Reveal the target, scoring bands, all guess positions and the Lantern's average explicitly. Replace “lost them” language. Why: disagreement about a clue is fun; disagreement about what the axis means is usually not. Acceptance: two independent rooms can place three example clues in broadly ordered positions before a pair is released; pairs with no usable middle remain quarantined.

**BEARING-D05 | P2 | S | Give the clue giver a short explanation moment**

Where: both. Phase: reveal only. Change: show “Now you can tell us why.” for the Lantern after everyone sees the result. Optional spoken explanation uses the existing reveal time; no recorded audio or required response. Why: the story behind a surprising word is often the payoff. Acceptance: no explanations occur before guesses finish and the cue does not lengthen every round by default.

#### 4. Copy table

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | A line runs between two opposites, and one of you can see the target. | One person sees a secret spot between two ideas. |
| Both, rules line 2 | That person says ONE WORD out loud. Just the one. | They say one word to help everyone find that spot. |
| Both, rules line 3 | Everybody else moves a pointer to where they think it is. | Everyone else saves a position on the line. |
| Both, rules line 4 | The one who spoke scores whatever the room scores. | Closer guesses score more. The clue giver earns the average. |
| Both, rules detail | New | No numbers or words from the two ends. Save explanations for the reveal. |
| Both, clue | Listen. One word is all you get. | Listen for one word. |
| Both, status fragment | have pointed | {count} of {eligible} positions saved |
| Both, role fragment | can see it | {name} can see the secret spot. |
| Both, clue fragment | has spoken | {name} has given the clue. |
| Both, result fragment | read the room | {name} found the spot. |
| Both, result fragment | got them close | The guesses landed close together. |
| Both, result fragment | lost them | The guesses spread out this time. |
| Both, score fragment | , and scores | The clue giver earns the room average: {points}. |
| Phone, role | You are the Lantern | You are the Lantern. Give the clue. |
| Phone, clue | Say ONE WORD out loud. Just the one, and nothing else. | Say one word. No numbers or words from the two ends. |
| Phone, clue submit | I have said it | I have given my clue |
| Phone, clue help | Nothing is ever typed in this game. This one is spoken. | Say your clue so everyone in the room can hear. |
| Phone, submit | Point here | Save position |
| Phone, input | Drag or nudge, then point when you are happy. | Move the pointer, then tap Save position. |
| Phone, saved fragment | Pointed at | Saved position: {position} |
| Phone, saved | Pointed. Move it again if you change your mind. | Move your pointer and save again to change it. |
| Phone, rules | One of you will see a hidden target and say one word. | One person gives a word. Everyone else finds the spot. |
| Phone, wait fragment | is thinking of a word. | {name} is choosing a clue. |
| Phone, wait | Listen carefully. They only get one. | Listen for the clue. |
| Phone, Lantern wait | You have spoken. | Your clue is given. Everyone is choosing a position. |
| Phone, Lantern wait | You score whatever the room scores, so hope they heard it the way you meant it. | You earn the average of everyone's guess scores. |
| Phone, guess | Where did they mean? | Where does that word belong? |
| Phone, average fragment | The room scored | The average guess score was {points}. |
| Phone, average fragment | , so you do too | You earn {points} for your clue. |
| Phone, result fragment | Dead on, + | Within {band} of the spot. +{points} |
| Phone, result | Not this time | Your position was {distance} away. |
| Phone, result | You did not point | No position saved this round. |
| Phone, answer fragment | It was at | The secret spot was {target}. |
| Phone, private clue action | New | Need another pair |
| Both, reveal invitation | New | Now you can tell us why. |

#### 5. No big screen version

Rules: example on each phone. Clue: everyone sees the endpoints and Lantern name; only the Lantern sees the target and their clue button. Guess: non Lantern phones show pointer controls, while Lantern sees public response count and their private target. Reveal: shared bands, target and all submitted pointers. Podium: full results and tied placements. Host rotates into either role with the same private view rules. Keep the spoken clue in person; no audio transport is part of this scope. Offer an agreed existing accessible communication method for a room that needs one, without adding arbitrary typed content to the app. Timings follow D03.

#### 6. New content

```json
[
  {"id": "br-r001", "a": "Still", "b": "Bustling", "category": "motion"},
  {"id": "br-r002", "a": "Quiet", "b": "Noisy", "category": "senses"},
  {"id": "br-r003", "a": "Simple", "b": "Complicated", "category": "thinking"},
  {"id": "br-r004", "a": "Familiar", "b": "Unfamiliar", "category": "thinking"},
  {"id": "br-r005", "a": "Everyday", "b": "Very rare", "category": "time"},
  {"id": "br-r006", "a": "Spontaneous", "b": "Planned", "category": "thinking"},
  {"id": "br-r007", "a": "Delicate", "b": "Sturdy", "category": "scale"},
  {"id": "br-r008", "a": "Soft", "b": "Firm", "category": "senses"},
  {"id": "br-r009", "a": "Smooth", "b": "Bumpy", "category": "senses"},
  {"id": "br-r010", "a": "Plain", "b": "Elaborate", "category": "style"},
  {"id": "br-r011", "a": "Gentle", "b": "Intense", "category": "feeling"},
  {"id": "br-r012", "a": "Brief", "b": "Long lasting", "category": "time"},
  {"id": "br-r013", "a": "Predictable", "b": "Surprising", "category": "thinking"},
  {"id": "br-r014", "a": "Subtle", "b": "Obvious", "category": "thinking"},
  {"id": "br-r015", "a": "Private", "b": "Public", "category": "people"},
  {"id": "br-r016", "a": "Compact", "b": "Sprawling", "category": "scale"},
  {"id": "br-r017", "a": "Sparse", "b": "Crowded", "category": "scale"},
  {"id": "br-r018", "a": "Loose", "b": "Tightly packed", "category": "shape"},
  {"id": "br-r019", "a": "Flexible", "b": "Rigid", "category": "shape"},
  {"id": "br-r020", "a": "Tidy", "b": "Jumbled", "category": "style"},
  {"id": "br-r021", "a": "Faint", "b": "Strong", "category": "senses"},
  {"id": "br-r022", "a": "Casual", "b": "Ceremonial", "category": "style"},
  {"id": "br-r023", "a": "Practical", "b": "Whimsical", "category": "feeling"},
  {"id": "br-r024", "a": "Calming", "b": "Energizing", "category": "feeling"},
  {"id": "br-r025", "a": "Easy to overlook", "b": "Hard to miss", "category": "thinking"},
  {"id": "br-r026", "a": "Small occasion", "b": "Big occasion", "category": "people"},
  {"id": "br-r027", "a": "Close by", "b": "Far away", "category": "scale"},
  {"id": "br-r028", "a": "Fleeting", "b": "Permanent", "category": "time"},
  {"id": "br-r029", "a": "Low effort", "b": "Lots of effort", "category": "skill"},
  {"id": "br-r030", "a": "Matter of fact", "b": "Mysterious", "category": "feeling"}
]
```

Spectrum categories are editorial labels, as the brief does not define a closed enum for Bearing. These are design candidates rather than measured universal agreements. Test low, middle and high examples before release; avoid adjacent near synonyms in a session.

#### 7. Names

Bearing; One Word Away; Somewhere Between.

#### 8. Best one new idea

The explanation moment in BEARING-D05. “Why that word?” is the conversation the mechanic naturally earns.

### B9. The Understudy

#### 1. Verdict

**Rethink. Family 4 out of 10 in the documented form. Adults 6 out of 10.** Affectionate recognition can be charming, but positive sounding prompts do not eliminate popularity dynamics. Awarding 80 points for being selected still rewards being the person the room notices; a full tally also advertises who nobody chose. The safest improvement is an explicitly unscored casting game with consent and no public vote distribution. This is a substantial departure, so keep the existing prototype available for internal comparison but remove it from the default family playlist until the new version passes testing.

#### 2. First time misunderstandings

Rules: players may expect “the best person” rather than a neutral playful role. Vote: no self voting can make two close friends repeatedly choose each other. Reveal: receiving few or no votes can feel like a public judgment even when the label is friendly. Results: scoring recognition makes visibility competitive. No amount of cheerful wording guarantees the quietest player will enjoy being chosen.

#### 3. Directions

**UNDERSTUDY-D01 | P0 | M | Remove popularity scoring from the family version**

Where: both. Phase: rules, reveal and ending. Change: default to an unscored cast collection. Remove voter 100 and recipient 80 point awards, numbered rankings and podium winners. Keep private voting for any eligible player except yourself; enforce self rejection in the authority as well as the UI. Use six rounds in Short and eight in Standard, independent of a claim of equal subject turns because there is no assigned subject. Do not automatically append this game to a family sequence. Why: being noticed should not decide a child's rank. Acceptance: no score or zero vote list appears anywhere, and the completion event correctly identifies a noncompetitive session.

**UNDERSTUDY-D02 | P0 | L | Let a chosen person privately accept the spotlight**

Where: phone and both. Phase: vote, acceptance and reveal. Change: after 20 second private voting, find the most selected eligible person or tied people, but only if the leading tally is at least two. Never show individual votes or the full tally. Send each selected person a private “Would you like this role?” with “Keep it” and “Pass”. All others see a generic “Preparing the next card” for a fixed eight seconds, whether there is a nominee or not. If all selected people accept, reveal their names together; otherwise show only the role with “A role for another day.” No public refusal indicator or extra points. No nomination and all different votes use the same generic outcome. Explain privately that consent prevents a forced reveal but cannot prevent friends inferring how a vote went. Why: warm copy is not a substitute for control. Acceptance: no ordinary phone gets nominees before consent; the public screen cannot distinguish a refusal from no consensus through message or phase duration.

**UNDERSTUDY-D03 | P1 | M | Limit repeated attention without manipulating votes**

Where: both. Phase: roster setup and voting. Change: allow anyone to opt out of being cast before the game while still voting. After someone accepts two roles, give them a rest from nomination for the remainder of that game, with the public neutral label “Already in our cast”. Never alter submitted votes to produce an apparently fair result. If fewer than two people remain eligible to be cast, finish the collection early; do not force somebody into the spotlight. If most players opt out at setup, recommend another game. Why: a single person should not become the night's repeated joke. Acceptance: rested or opted out names never appear as actionable candidates and the session ends gracefully when no fair vote remains.

**UNDERSTUDY-D04 | P0 | M | Replace judgment with gentle imagined roles**

Where: authoring and both. Phase: content. Change: keep “The one who” but prefer playful hypothetical habits, such as naming a cloud, over claims about competence, loudness or responsibility. Quarantine “never read an instruction” as potentially shaming despite its endorsement in the brief; do not assume adults and children hear it identically. Have prospective mixed age testers privately veto prompts without explanation. A veto removes the prompt from the room's session and is not displayed publicly. Why: “charming” depends on the recipient and their relationships. Acceptance: no prompt is shipped solely because its author can argue it is a compliment; the tested set has no unresolved vetoes.

**UNDERSTUDY-D05 | P2 | M | Finish with a private collection of accepted roles**

Where: phone. Phase: final collection. Change: each person can save a simple card containing only roles they accepted, with no vote counts and no ranking. If they accepted none, provide a neutral “Part of tonight's cast” card instead of an empty scorecard. Export requires a tap and defaults to no names. Why: the game can end in a souvenir rather than a popularity table. Acceptance: declined roles never appear in exports, and no card exposes vote data.

#### 4. Copy table

These replacements apply to the proposed unscored version. Do not combine them with the old scoring logic.

| where | current text (exact) | your text |
| --- | --- | --- |
| Both, rules line 1 | A role appears, and it belongs to one of you. | A playful role appears. Who comes to mind? |
| Both, rules line 2 | Vote for whoever fits it best. You cannot vote for yourself. | Choose someone else, or pass this round. |
| Both, rules line 3 | Score for agreeing with the room, not for being right. | The chosen person can keep the role or let it go. |
| Both, rules line 4 | Whoever the room chooses scores as well. | There are no scores. We are making a cast together. |
| Both, vote status fragment | have voted | {count} of {eligible} choices saved |
| Both, no reveal | You all said somebody different | A role for another day |
| Both, no reveal | You all said somebody different. | A role for another day. |
| Both, no reveal | Nobody, this time | A role for another day |
| Phone, vote | You can change your mind until everybody has voted. | You can change your choice until time runs out. |
| Phone, saved vote | Vote in. You can change your mind until everybody has voted. | Choice saved. You can change it until time runs out. |
| Phone, rules | You will be deciding who is who. | Choose who comes to mind for a playful role. |
| Phone, former scoring fragment | That is you, and you called it, + | You kept this role. |
| Phone, former scoring fragment | The room says that is you, + | You kept this role. |
| Phone, former scoring fragment | You read the room, + | A new role for our cast. |
| Phone, former result | You saw it differently | A new role for our cast. |
| Phone, former scoring fragment | Nobody agreed, + | A role for another day. |
| Phone, consent | New | Would you like this role? / Keep it / Pass |
| Both, acceptance wait | New | Preparing the next card |
| Phone, opt out | New | I will vote, but do not cast me. |
| Both, rest label | New | Already in our cast |
| Both, final | New | Tonight's cast |

Use the shared reward removal but no score total replacement for this unscored version. The old “That is you, and you called it” message is also suspicious under the existing self vote ban; inspect its actual branch rather than assuming it is reachable.

#### 5. No big screen version

Rules and eligibility preference appear privately on each phone. Vote shows the role, eligible names, Pass and timer; no votes are public. Acceptance shows the nominee request only to the selected person or people, while every other phone gets the same neutral waiting screen. Reveal shows only accepted casting or the neutral role card. Final collection shows accepted roles, no tally or rankings. Host can be selected and accept on the same private terms; organizer controls do not reveal votes. Keep a fixed acceptance phase to avoid obvious refusal timing. This does not guarantee social anonymity or eliminate inference. Use 20 second voting, eight second acceptance and nine second reveal in both display modes.

#### 6. New content

```json
[
  {"id": "us-r001", "text": "The one who would give a cloud a name", "category": "weather"},
  {"id": "us-r002", "text": "The one who would put a tiny door in a tree", "category": "home"},
  {"id": "us-r003", "text": "The one who would invite a snail to a picnic", "category": "animals"},
  {"id": "us-r004", "text": "The one who would draw a map of an imaginary island", "category": "thinking"},
  {"id": "us-r005", "text": "The one who would choose a round window", "category": "home"},
  {"id": "us-r006", "text": "The one who would make a bookmark for every book", "category": "doing"},
  {"id": "us-r007", "text": "The one who would build a bridge for toy animals", "category": "doing"},
  {"id": "us-r008", "text": "The one who would collect pebbles shaped like letters", "category": "doing"},
  {"id": "us-r009", "text": "The one who would give the garden paths names", "category": "home"},
  {"id": "us-r010", "text": "The one who would invent a very gentle dragon", "category": "thinking"},
  {"id": "us-r011", "text": "The one who would make a tiny umbrella for a plant", "category": "weather"},
  {"id": "us-r012", "text": "The one who would put a paper crown on a pumpkin", "category": "food"},
  {"id": "us-r013", "text": "The one who would choose the winding path", "category": "travel"},
  {"id": "us-r014", "text": "The one who would choose the path with the widest view", "category": "travel"},
  {"id": "us-r015", "text": "The one who would sketch the view from a train", "category": "travel"},
  {"id": "us-r016", "text": "The one who would hum a tune while folding paper", "category": "doing"},
  {"id": "us-r017", "text": "The one who would name a boat after a flower", "category": "travel"},
  {"id": "us-r018", "text": "The one who would arrange a picnic in a circle", "category": "food"},
  {"id": "us-r019", "text": "The one who would imagine a story for a lost button", "category": "thinking"},
  {"id": "us-r020", "text": "The one who would leave a leaf inside a notebook", "category": "doing"},
  {"id": "us-r021", "text": "The one who would pick a favorite cloud of the day", "category": "weather"},
  {"id": "us-r022", "text": "The one who would design a house for a very small mouse", "category": "animals"},
  {"id": "us-r023", "text": "The one who would make a sign for a secret garden", "category": "home"},
  {"id": "us-r024", "text": "The one who would turn a cardboard box into a shop", "category": "doing"},
  {"id": "us-r025", "text": "The one who would choose a striped watering can", "category": "home"},
  {"id": "us-r026", "text": "The one who would invent a name for a new color", "category": "thinking"},
  {"id": "us-r027", "text": "The one who would make a trail of paper stars", "category": "doing"},
  {"id": "us-r028", "text": "The one who would plan a picnic for a rainy day", "category": "weather"},
  {"id": "us-r029", "text": "The one who would give an imaginary cat a long name", "category": "animals"},
  {"id": "us-r030", "text": "The one who would build a miniature mountain", "category": "doing"}
]
```

These are imagined, nonfactual roles. They still require human consent and the mixed age review described above; no author can guarantee that a particular family will find every role comfortable.

#### 7. Names

The Understudy; Our Odd Cast; Who Comes to Mind.

#### 8. Best one new idea

The privately accepted role card in UNDERSTUDY-D05. It gives recognition a form the recipient actually chooses to keep.

## C. THE ORDER

### Finish in this order

The shared shell comes before every game below. Ship a complete vertical slice of one game in both display modes before porting the rest. Do not work on all nine feature sets at once.

| Rank | Game | Why this position | Release decision |
| --- | --- | --- | --- |
| 1 | Mothlight | Existing phone pilot, simple input and a visible social hook make it the best transport and layout proving ground. | Finish core and scoring clarity first. |
| 2 | Same Soil | Excellent family opener, two player support and a useful test of recipient private information. | Finish role rotation and private choice flow. |
| 3 | Moongraft | Distinctive cooperative reward and the strongest contrast with quizzes. | Finish canonical drawing and saving before cosmetic upgrades. |
| 4 | Bearing | High conversation potential and a strong test of secret roles. | Finish example, target privacy and fair rotation. |
| 5 | Firefly Futures | Accessible social prediction with modest implementation scope after shell work. | Finish denominator, honest privacy copy and prediction UI. |
| 6 | Wide Margin | Good simultaneous guessing, but numbers need the strictest evidence audit. | Ship only audited scoped facts and corrected scoring. |
| 7 | Lifting Fog | Solid risk mechanic, but authored clue ladders and reading time need testing. | Ship after clue review and deliberate submission. |
| 8 | First Frost | Promising competitive centerpiece with several interlocking role and scoring changes. | Rework after basic transport and role recovery are proven. |
| 9 | The Understudy | Highest social downside and largest departure from the original scoring. | Hold from default family release until the rethought version is tested. |

### What to merge and what to cut

Merge implementation components, not games. Wide Margin and Bearing can share slider controls and public marker layout, but one asks about facts and the other interprets a person. Mothlight and Firefly must not be merged: visible changeable choices and private predictions produce different conversations. Same Soil and The Understudy are not equivalent; personal preference has an authoritative answer while peer recognition does not.

Cut false currency copy, invisible default answers, contradictory lock language, unconditional guarantees that all content is safe, the unique poem claim, and any “only two player game” claim. Cut The Understudy's competitive recognition scoring from the proposed family version. Do not permanently delete an entire game based on this desk review alone. If consent and nomination rests leave The Understudy consistently flat in testing, shelve it and launch eight stronger games.

### Practical implementation sequence for Claude

1. Inventory real current behavior. Match the nine modules, shared shell, transport service, catalogue, scoring functions, gameComplete calls, bank counts and screenshots to the repository. Old README counts conflict with the newer bank counts in the PDF; prefer inspected files and report the difference.
2. Make P0 shell changes, then complete Mothlight P0 and P1 as the first end to end slice. Check phone hosting with no separate tab visible. Do not claim client hosting is robust under suspension without testing the chosen pause or server solution.
3. Import candidate content only into a review state. Run schema and punctuation checks, semantic duplicate review and source review. Keep the audit manifest separate from the exact bank formats. When a question is revised, retain its change history.
4. Implement one game at a time in the ranked order. For each, produce a compact change list, screenshots of each role and phase, scoring examples and reconnect results. Implement P0 and P1; leave P2 behind disabled experiments until the director chooses them.
5. Run real household sessions. For Mothlight watch independent first choices and side changes; for Firefly watch denominator confusion; for Fog watch clue tier timing; for Frost watch post transformation engagement; for Moongraft watch connection and saving; for Same Soil watch equal turns; for Wide Margin watch interpretation and source disputes; for Bearing listen to actual clues; for Understudy solicit private comfort feedback.
6. Measure session duration from Start to the final usable screen, including reading and reactions. Replace the current approximate menu estimates with observed ranges by roster size and pace. Arithmetic from timers alone does not establish an eight or nine minute session.

### Build gates and preserved constraints

Each accepted implementation must have no secret leaks to ordinary participant payloads, no duplicated scores or game completion events, no invisible default submissions, no forced rejoin between games, no indefinite phase wait and no controls smaller than 48 CSS pixels. Test a 360 pixel phone and an actual couch view. Include equal placement ties, no answer cases, the host playing every available private role, and recovered versus unrecoverable connection states. These are focused tests for material risks, not an invitation to rewrite the test framework.

Do not add accounts, arbitrary chat, a live language model generating facts during play, voice recording, paid cosmetics, purchase prompts, currency prices, multiplayer matchmaking or a second overall leaderboard. Preserve the warm botanical identity, but make action labels direct enough that someone who has never heard of Lucid Winds can play.

### Source and review notes

The supplied brief is the source for all descriptions of the existing product. Its screenshots are evidence of those captured states, not proof of today's runtime behavior. External references in B support new factual content; all were consulted for this review on 18 October 2026. No full private content bank, production analytics, live tester session or source repository was provided. The studio's existing audit remains required before shipping. Suggested names have not been checked for availability or trademark clearance.

## D. MACHINE SUMMARY

```json
[
  {
    "id": "SHELL-D01",
    "game": "shell",
    "priority": "P0",
    "effort": "L",
    "summary": "Make phone play complete without duplicating secrets"
  },
  {
    "id": "SHELL-D02",
    "game": "shell",
    "priority": "P0",
    "effort": "L",
    "summary": "Recover the host and reject stale actions"
  },
  {
    "id": "SHELL-D03",
    "game": "shell",
    "priority": "P0",
    "effort": "M",
    "summary": "Make joining and returning unambiguous"
  },
  {
    "id": "SHELL-D04",
    "game": "shell",
    "priority": "P0",
    "effort": "M",
    "summary": "Separate saved choices from final answers"
  },
  {
    "id": "SHELL-D05",
    "game": "shell",
    "priority": "P1",
    "effort": "M",
    "summary": "Make the lobby explain the choice of game"
  },
  {
    "id": "SHELL-D06",
    "game": "shell",
    "priority": "P1",
    "effort": "M",
    "summary": "Give phones a stable layout and readable reveals"
  },
  {
    "id": "SHELL-D07",
    "game": "shell",
    "priority": "P1",
    "effort": "M",
    "summary": "Tune reading time and sound as room settings"
  },
  {
    "id": "SHELL-D08",
    "game": "shell",
    "priority": "P0",
    "effort": "S",
    "summary": "Remove false reward and room ending messages"
  },
  {
    "id": "SHELL-D09",
    "game": "shell",
    "priority": "P1",
    "effort": "M",
    "summary": "Make a party night varied without adding a second competition"
  },
  {
    "id": "SHELL-D10",
    "game": "shell",
    "priority": "P0",
    "effort": "M",
    "summary": "Audit content with evidence and a single editorial contract"
  },
  {
    "id": "SHELL-D11",
    "game": "shell",
    "priority": "P0",
    "effort": "M",
    "summary": "Specify absence and low player behavior"
  },
  {
    "id": "SHELL-D12",
    "game": "shell",
    "priority": "P1",
    "effort": "M",
    "summary": "Verify real play before polishing the menu"
  },
  {
    "id": "MOTHLIGHT-D01",
    "game": "mothlight",
    "priority": "P0",
    "effort": "S",
    "summary": "Define the minority bonus exactly"
  },
  {
    "id": "MOTHLIGHT-D02",
    "game": "mothlight",
    "priority": "P1",
    "effort": "M",
    "summary": "Make a change of mind the visual event"
  },
  {
    "id": "MOTHLIGHT-D03",
    "game": "mothlight",
    "priority": "P0",
    "effort": "M",
    "summary": "Explain the answer and quarantine dubious samples"
  },
  {
    "id": "MOTHLIGHT-D04",
    "game": "mothlight",
    "priority": "P1",
    "effort": "S",
    "summary": "Use a balanced deck without repeating a lesson"
  },
  {
    "id": "MOTHLIGHT-D05",
    "game": "mothlight",
    "priority": "P2",
    "effort": "M",
    "summary": "Try a short private opening before public movement"
  },
  {
    "id": "FIREFLY-D01",
    "game": "firefly",
    "priority": "P0",
    "effort": "M",
    "summary": "Freeze and display the answered population"
  },
  {
    "id": "FIREFLY-D02",
    "game": "firefly",
    "priority": "P0",
    "effort": "M",
    "summary": "Preserve individual privacy without overpromising"
  },
  {
    "id": "FIREFLY-D03",
    "game": "firefly",
    "priority": "P1",
    "effort": "S",
    "summary": "Keep a comfortable prediction rhythm"
  },
  {
    "id": "FIREFLY-D04",
    "game": "firefly",
    "priority": "P1",
    "effort": "M",
    "summary": "Make a hidden prediction visible as a saved action"
  },
  {
    "id": "FIREFLY-D05",
    "game": "firefly",
    "priority": "P2",
    "effort": "S",
    "summary": "Add a brief optional conversation beat"
  },
  {
    "id": "LIFTINGFOG-D01",
    "game": "liftingfog",
    "priority": "P0",
    "effort": "M",
    "summary": "Separate selection from irreversible submission"
  },
  {
    "id": "LIFTINGFOG-D02",
    "game": "liftingfog",
    "priority": "P1",
    "effort": "S",
    "summary": "Give each clue enough reading time"
  },
  {
    "id": "LIFTINGFOG-D03",
    "game": "liftingfog",
    "priority": "P0",
    "effort": "M",
    "summary": "Audit the clue ladder rather than just the final answer"
  },
  {
    "id": "LIFTINGFOG-D04",
    "game": "liftingfog",
    "priority": "P1",
    "effort": "S",
    "summary": "Explain the score as the point of recognition"
  },
  {
    "id": "LIFTINGFOG-D05",
    "game": "liftingfog",
    "priority": "P2",
    "effort": "M",
    "summary": "Let finished players make a private second thought"
  },
  {
    "id": "FIRSTFROST-D01",
    "game": "firstfrost",
    "priority": "P0",
    "effort": "M",
    "summary": "Resolve marks and every ending deterministically"
  },
  {
    "id": "FIRSTFROST-D02",
    "game": "firstfrost",
    "priority": "P1",
    "effort": "M",
    "summary": "Give each power a different decision"
  },
  {
    "id": "FIRSTFROST-D03",
    "game": "firstfrost",
    "priority": "P0",
    "effort": "M",
    "summary": "Make Frost voting and rewards attributable"
  },
  {
    "id": "FIRSTFROST-D04",
    "game": "firstfrost",
    "priority": "P1",
    "effort": "M",
    "summary": "Make transformation feel like a new job"
  },
  {
    "id": "FIRSTFROST-D05",
    "game": "firstfrost",
    "priority": "P2",
    "effort": "M",
    "summary": "Test a private weather forecast for Frost players"
  },
  {
    "id": "MOONGRAFT-D01",
    "game": "moongraft",
    "priority": "P0",
    "effort": "M",
    "summary": "Connect pieces at every room size"
  },
  {
    "id": "MOONGRAFT-D02",
    "game": "moongraft",
    "priority": "P0",
    "effort": "L",
    "summary": "Save acknowledged strokes and render one canonical card"
  },
  {
    "id": "MOONGRAFT-D03",
    "game": "moongraft",
    "priority": "P1",
    "effort": "M",
    "summary": "Make the drawing controls forgiving"
  },
  {
    "id": "MOONGRAFT-D04",
    "game": "moongraft",
    "priority": "P0",
    "effort": "M",
    "summary": "Make keeping the plant a real action"
  },
  {
    "id": "MOONGRAFT-D05",
    "game": "moongraft",
    "priority": "P1",
    "effort": "M",
    "summary": "Rotate prompt variants without adding incompatible layers"
  },
  {
    "id": "MOONGRAFT-D06",
    "game": "moongraft",
    "priority": "P2",
    "effort": "M",
    "summary": "Add a handmade seed packet to the gallery"
  },
  {
    "id": "SAMESOIL-D01",
    "game": "samesoil",
    "priority": "P0",
    "effort": "S",
    "summary": "Guarantee equal subject turns with truthful round counts"
  },
  {
    "id": "SAMESOIL-D02",
    "game": "samesoil",
    "priority": "P0",
    "effort": "M",
    "summary": "Make the subject choice final and private"
  },
  {
    "id": "SAMESOIL-D03",
    "game": "samesoil",
    "priority": "P1",
    "effort": "S",
    "summary": "Keep the preference language light and specific"
  },
  {
    "id": "SAMESOIL-D04",
    "game": "samesoil",
    "priority": "P1",
    "effort": "M",
    "summary": "Build a small illustrated set only after the words work"
  },
  {
    "id": "SAMESOIL-D05",
    "game": "samesoil",
    "priority": "P2",
    "effort": "S",
    "summary": "Offer a gentle conversation invitation"
  },
  {
    "id": "WIDEMARGIN-D01",
    "game": "widemargin",
    "priority": "P0",
    "effort": "M",
    "summary": "Make units and evidence part of each question"
  },
  {
    "id": "WIDEMARGIN-D02",
    "game": "widemargin",
    "priority": "P0",
    "effort": "S",
    "summary": "Make the scoring promise true at every distance"
  },
  {
    "id": "WIDEMARGIN-D03",
    "game": "widemargin",
    "priority": "P1",
    "effort": "M",
    "summary": "Teach out of one hundred and keep the dial honest"
  },
  {
    "id": "WIDEMARGIN-D04",
    "game": "widemargin",
    "priority": "P1",
    "effort": "M",
    "summary": "Reveal the room without teaching the next answer"
  },
  {
    "id": "WIDEMARGIN-D05",
    "game": "widemargin",
    "priority": "P2",
    "effort": "M",
    "summary": "Add a private confidence note without changing points"
  },
  {
    "id": "BEARING-D01",
    "game": "bearing",
    "priority": "P0",
    "effort": "M",
    "summary": "Protect the hidden target and define the spoken clue"
  },
  {
    "id": "BEARING-D02",
    "game": "bearing",
    "priority": "P0",
    "effort": "M",
    "summary": "Make scoring and role rotation fair"
  },
  {
    "id": "BEARING-D03",
    "game": "bearing",
    "priority": "P1",
    "effort": "M",
    "summary": "Make the spectrum usable with a thumb"
  },
  {
    "id": "BEARING-D04",
    "game": "bearing",
    "priority": "P1",
    "effort": "M",
    "summary": "Audit useful middle ground and explain it in the reveal"
  },
  {
    "id": "BEARING-D05",
    "game": "bearing",
    "priority": "P2",
    "effort": "S",
    "summary": "Give the clue giver a short explanation moment"
  },
  {
    "id": "UNDERSTUDY-D01",
    "game": "understudy",
    "priority": "P0",
    "effort": "M",
    "summary": "Remove popularity scoring from the family version"
  },
  {
    "id": "UNDERSTUDY-D02",
    "game": "understudy",
    "priority": "P0",
    "effort": "L",
    "summary": "Let a chosen person privately accept the spotlight"
  },
  {
    "id": "UNDERSTUDY-D03",
    "game": "understudy",
    "priority": "P1",
    "effort": "M",
    "summary": "Limit repeated attention without manipulating votes"
  },
  {
    "id": "UNDERSTUDY-D04",
    "game": "understudy",
    "priority": "P0",
    "effort": "M",
    "summary": "Replace judgment with gentle imagined roles"
  },
  {
    "id": "UNDERSTUDY-D05",
    "game": "understudy",
    "priority": "P2",
    "effort": "M",
    "summary": "Finish with a private collection of accepted roles"
  }
]
```
