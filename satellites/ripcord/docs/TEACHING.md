# TEACHING — how Ripcord stops leaving players scrambled

Stephen's phone verdict, 2026-08-31: "the game needs to slow down and
educate players and walk them through stuff as they would need to learn
it. it shouldn't leave them scrambled." This doc tracks what shipped and
what needs his call.

## Shipped (builds p and q)

1. **Rungs 1 to 4 are tuned against the player actually standing there.**
   Stock build, tuned on MATCHES (first to four points, the thing the
   player experiences), verified on independent seeds: the player takes
   rung one 62 percent, even money by rung three. Losing still happens,
   and every loss runs the what-beat-you coaching beat.
2. **The bench fills in as you climb.** Build and Weights are the game
   and are always there. Looks opens at rung 2, Tuning at rung 3, Rigs
   at rung 4 - one rung before the first boss asks for everything. Until
   then each section shows its promise in the bench's own voice, and
   announces itself once when it arrives.

## Already in the game and doing teaching work

The wind grade card with its coaching line; the loss beat naming what
beat you and one answer to it; each boss's `teaches` line; the ability
sentence under the trigger picker; stat bars on their slot ranges with
honest more/less directions; reveal cards comparing every won part
against what is fitted; the armed-trigger glyph explaining a waiting
move.

## Needs the Director's call (in rough order of value)

1. **First-session pacing.** Rung 1 could hold your hand harder: a
   pre-round line ("Wind three circles. Steadier beats faster."), and
   after the first loss, a beat that points at the Weights dial
   specifically. Cheap, high value, slightly scripted feel - his call.
2. **The rules sheet is a wall.** The howto at boot frontloads
   everything. Proposal: cut it to three beats (wind, fight, win points)
   and move the rest to where it matters (weights explained at the dial,
   triggers at the picker).
3. **Trigger teaching moment.** The first time a core with a
   conditional trigger is fitted, one beat: "This move waits for a
   door. Pick the door." Currently the picker just appears.
4. **Drop pacing.** Four parts per rung is a lot of reveal cards in a
   row. Option: two parts per rung for rungs 1 to 5, back-loading the
   rest, so early reveals stay special.
5. **Boss preambles.** The teaches line shows AFTER the fight. A
   one-line warning before ("Nobody outlasts a giant") turns a wall
   into a puzzle.

## Laws learned

- Tune early difficulty on the statistic the player experiences
  (matches and points), against the build the player actually has.
- A staged UI must stage its GATES too: the playthrough now asserts the
  promises on a fresh save and the real panels on an advanced one.
