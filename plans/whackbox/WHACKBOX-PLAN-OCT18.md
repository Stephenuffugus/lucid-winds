# WHACK BOX plan, 18 October 2026 (from Astra's review)

Source, kept whole: `party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md` (167 KB: 58 directions SHELL-D01..D12 and
<SLUG>-Dnn, a copy table per game, a no big screen design per game, 270 new content candidates, names, a ranking).
His instruction: "go one game at a time through those and fully flesh them out with ideas and good, well written material."

## Validation (checked against the code before planning)
- TRUE: "Everyone earned sunbeams" is printed by 8 of 9 hosts (firefly, liftingfog, firstfrost, moongraft, samesoil,
  widemargin, bearing, understudy host.js) and two phones (bearing, firstfrost player.js), while partyComplete is not
  deployed. A false claim on screen = FAULT (SHELL-D08).
- TRUE: Mothlight's "Lone moth" bonus applies to any correct strict minority (README), so the label misleads (MOTHLIGHT-D01).
- TRUE: First Frost's Deep Freeze costs two marks (README table) while the rules say three wrong answers (FIRSTFROST, rework).
- TRUE (the brief's own limit): the transport broadcasts every message to the whole room and phones filter by `to`; a
  private payload is readable by a curious player in devtools. Family party risk is low; what matters now is that no
  phone SCREEN shows another player's secret (per game, in no TV mode). Data level privacy = later, his call.
- TRUE: a phone host that locks or leaves the page stops the room's clocks (host timers in the page). SHELL-D02.

## Order (Astra's, kept): shell foundation, then one game at a time
W0 Shell foundation (P0 subset)
  - D08 remove every sunbeam claim; "Game complete"; End night asks once.
  - D03 lobby: count, min and max, "Waiting for 1 more player", full room refusal, late joiner "You play next game",
    Copy invite link on phones, pasted codes trimmed and case free.
  - D04 one wording law: "Saved. You can change it." vs "Final answer saved."
  - D02 lite: the host page pauses the room honestly when it is hidden (visibilitychange): phones see "Waiting for the
    host", clocks hold, the room resumes with the time left. (A server run clock = his call, later.)
  - D11 missing input stays missing; a room that drops below its minimum finishes the reveal, then offers Return to lobby.
W1 Mothlight: D01 to D04 (P0 + P1), the copy table, the no TV view (the pilot) adjusted to D02, content candidates through
   a fact check before any ship (D03 quarantine flags ml-0163, ml-0001, ml-0055 checked first).
W2 Same Soil · W3 Moongraft · W4 Bearing · W5 Firefly Futures · W6 Wide Margin · W7 Lifting Fog · W8 First Frost (rework)
W9 The Understudy (rethink; HELD from the family picker on his yes).
Each game: P0 + P1 directions, its copy table, its no TV conversion, its 30 candidates fact checked, shots of every role
and phase, scoring fixtures, then live. P2 experiments stay off until he picks them.

## His calls
1. Hold The Understudy out of the picker until reworked (Astra: rethink as unscored casting with consent)? Default: yes.
2. Names: three ideas per game in the review section 7; working names stay until he picks.
3. A server run clock for phone hosting (Cloud Functions as the room's authority) vs the honest pause (W0). Default: pause.
4. P2 experiments (one per game, section 3): off until he picks.

## Laws for the builder
ES5 style like the files; 48 px at 360 and 412; no dash punctuation in player copy; version changed shell/game URLs;
tests: audit_static, drive.js per game, cloud_join, hostdrop, notv; look at shots of every phase in both modes; the
host page must never show a player's secret in no TV mode; content ships only after a fact check with a named source.
