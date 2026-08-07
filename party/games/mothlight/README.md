# Mothlight, module handoff

Built 2026-08-07 exactly to the worked example in PARTY_GAME_BRIEF.md.
True or false facts on the big screen; every phone answers and the moths
land publicly; anyone can change until the timer dies; lone correct moths
score 150 instead of 100. The crowd is the puzzle.

## Files
- `host.js` host screen: rules, 12x question/reveal, standings after 4 and
  8, podium. Host records the LAST answer per player. Lone moth = correct
  while the correct side is a strict minority of players who answered.
- `player.js` phone: renders purely from phase payloads, so a locked and
  rejoined phone lands in the live phase.
- `content.js` fact bank, 240 audited entries (generator prompt inside).
  Bank skews 148 true / 92 false; SELECTION enforces balance: every game
  draws exactly 6 true + 6 false, shuffled, no repeats across recent games
  on the host device (`ml_used` in localStorage).
- `game.css` both screens, house palette, host text 28px minimum.

## Test hook
`?ml_fast=1` on the host URL shrinks timers (3s question, 2s reveal) so a
full automated game runs in about 90 seconds. Absent on plain loads.

## localStorage (host device)
- `ml_used` question ids seen recently, cleared automatically when the
  remaining pool cannot fill a balanced game.

## Economy
Exactly one call: `PartyShell.gameComplete(results)` at podium. No amounts
client side, ever. On the local practice transport nothing mints, honestly;
minting arrives with the cloud transport and its Cloud Function.
