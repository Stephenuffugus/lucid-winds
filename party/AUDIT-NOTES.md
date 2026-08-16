# WHACK BOX audit, 2026-08-16

Read every file in `party/` plus WHACKBOX_PLAN.md, PARTY_GAME_BRIEF.md and
PARTY_CLOUD_SETUP.md. No browser was run (ten agents on a two core box), so
everything below is either read from source or proved by `test/audit_static.js`,
a node checker written for this pass and watched fail on purpose first.

---

## THE SHAPE OF IT, HONESTLY

The shell is genuinely good. Nine titles, 1934 bank entries, no stubs: every
`games/<slug>/` has a real host module, a real phone module, its own CSS and a
real bank. `test/bank_audit.js` runs clean, there are zero duplicate entries in
any bank, zero duplicate ids, no answer leaks into its own clues, every mothlight
and widemargin entry carries a source. The content is in better shape than the
code around it.

**Room state is NOT on RTDB.** The plan said it would be; the database was never
switched on. What actually ships is `shell/transport.js` with two
implementations behind one interface: `LocalTransport` (BroadcastChannel, same
browser, this is what runs today) and `CloudTransport` (Firebase RTDB, written,
never once run against a real database). The cloud path is sound as written: it
anchors on the last existing push key so a late phone does not replay ten
minutes of timer ticks, and it fails loudly with a pointer to the setup doc
rather than looking like an empty room. It is still unproven, and one thing in
it is wrong on its face: **it has no `onDisconnect` and no presence at the
transport layer**, so cloud presence is entirely the 3 second ping in
`shell/player.js`. That is fine, but it means the ghost problem below is a cloud
problem too, not just a practice mode one.

**The one player id per browser bug is genuinely fixed.** `transport.js` keys the
id in localStorage under a per tab marker held in sessionStorage. Two tabs get
two players; a reload keeps the same player. Verified by reading, and the
static checker now asserts the sessionStorage marker is present so it cannot
quietly regress to a single key.

**Can a room reach a state it cannot leave?** Yes, three ways, all found below
(A, B, C). None of them is a hang inside a game: every phase in every title is
driven by a host timer, so no round can stall waiting on a person. The traps are
all at the edges, which is exactly where a party night actually breaks.

---

## FINDINGS, WORST FIRST

### P0, a room that cannot get out

**A. The lobby has no way out.** `host.html` hides the picker on launch and the
lobby has exactly one control, a Start button disabled until the title's minimum
is met. First Frost needs four. If four people are not there, or one of them
cannot get their phone on, the television is stuck: no back, no change of game,
no start anyway. The only exit is somebody walking over and reloading the tab,
which loses the room code and makes everybody retype. `PartyShell.backToPicker()`
already exists and already carries the code. The lobby just never offered it.

**B. End night strands every phone.** `PartyShell.closeRoom()` destroys the
transport and says nothing first. `shell/player.js` reads seven seconds of host
silence as a drop and shows "Lost the big screen. Waiting for it to come back.
You do not need to do anything." Every phone in the room sits on that screen
forever after the host presses End night. The phone is telling the player a
comforting lie about a room that no longer exists.

**C. A phone dies if a room replays a title.** `play.html` guards module loading
with `loaded[slug]` and never clears it. Mothlight, then Firefly, then Mothlight
again is a normal party night, and on the third switch `loadGame` returns early:
the phone keeps Firefly's DOM on screen while Firefly's callbacks have already
been overwritten by nothing. Every tap does nothing for the whole game. The host
screen looks perfect throughout.

### P1, the group waits on one person, or on somebody who left

**D. Nobody is ever pruned, so the room fills with ghosts.** `shell/host.js` sets
`PLAYERS[id].alive=8` on a ping and decrements once a second, but a player at
zero is still in `PLAYERS`, still in `roster()`, and still counted everywhere.
Three consequences, and the third is the one that bites:
  1. The Start gate counts people who are gone, so a room of two can start a
     four player title.
  2. Every "3 of 5 have guessed" readout on the television counts a phone that
     is not in the room.
  3. Five of the nine titles end a round early when everyone has acted
     (`liftingfog`, `widemargin`, `bearing`, `understudy`, `samesoil`). That
     early end is measured against the roster captured at game start, so one
     person leaving means the whole room waits out the full clock on every
     single round for the rest of the night. This is the exact failure the brief
     names as the thing to avoid.
  Worse in practice: a phone that leaves and rejoins from a NEW TAB is a new
  player id, so the ghost stays AND a new player appears. Three real people can
  become a room of six.

**E. Wide Margin and Bearing end the round on the first touch of the dial.** The
host counts a player as in the moment any value arrives, and the value arrives
on the first pointerup. So the round ends the instant the last person nudges the
dial once, while their own phone is still reading "You can change it until time
is up" and "You can still move it". The button labelled "Lock it in" does not
lock anything. The phone contradicts the host on a control that decides the
score.

**F. A late joiner gets a live game screen that does nothing.** The host adds
them to `PLAYERS` and re-sends the current phase, so their phone renders the real
question with real buttons. Every module then drops their messages, because they
are not in that module's `names` map. They tap, nothing happens, and they
conclude the game is broken. (Mothlight is the exception and it is the wrong
exception, see K.)

### P2, the television says something untrue

**G. First Frost tells a room of survivors that the frost took everyone.**
`phasePodium` only names a winner when exactly one player is still living. Twelve
questions is not enough to freeze four competent players, so the common outcome
of a good round is a podium reading "The frost took everyone." with four
unfrozen names under it.

**H. Same Soil invents a person's self report.** If the subject's phone is quiet
when the pick timer ends, the host does `subjectPick=(Math.random()<0.5)?'a':'b'`
and the room then guesses, scores, and is told "Sam said butter." Sam said
nothing. This is the one title in the pack whose entire design rule is that the
subject is the only authority on themselves, printed twice in its own header.

**I. The Understudy pays everybody the maximum for total disagreement.** With
three voters who all pick different people, every tally is 1, so `top` is 1,
every vote "matches the top" and every candidate is a winner: all three players
score 100 plus 80. A round where the room agreed completely and a round where it
agreed on nothing produce the same numbers and the same screen, except the second
prints three names joined by "and" as though it were a result.

**J. Mothlight's podium is a dead end.** Every other title's podium offers Play
again, Another game and End night. Mothlight offers only Play again, so the
first title in the catalogue is the one you cannot leave without a reload.

**K. Mothlight accepts input from players who are not in the game.** It is the
only host module with no `names[pid]` guard, so a late joiner's moth flies to a
lantern on the television under the name "?" and is then absent from the reveal,
the strip and the standings.

### P3, smaller but real

**L. Bearing broadcasts the hidden target to every phone.** `setPhase('clue',
{... target:target})` goes to everyone; only the Lantern's phone chooses to draw
it. On a couch this is nearly harmless and it is still the game's one secret
sitting in every player's message stream.

**M. Lifting Fog lies to a rejoined phone.** The phone resets `locked` whenever
the question number differs from its own, which a fresh phone's zero always
does. A player who answered, locked their phone and came back can tap a second
option and be told "Locked in" while the host correctly ignores it.

**N. Cosmetic:** `play.html` appends another copy of the same stylesheet every
time a module loads.

**O. Found while fixing, and it is a looking bug: eight of the nine podiums have
no button hierarchy at all.** Every podium uses `.ps-btn.ghost` for "Another
game" and "End night", and `.ps-btn.ghost` was only ever defined in
`games/firefly/game.css`. On the other eight titles all three podium buttons
render as identical gold slabs, so the button that ends the night looks exactly
like the button you press every round. Nothing automated could see this and I
only found it by grepping for the class after touching it.

**P. Play again carries the dead into the next game.** `PartyShell.players()` is
consumed by exactly one thing, every module's Play again handler, and it returned
the raw roster. Everybody who had already left came back as a permanent row on
the television with a frozen score and a seat in every "n of N" count for the
whole next game.

### Checked and NOT a problem

- Every module reaches `gameComplete` from every path: `phasePodium` /
  `phaseGallery` are reachable from the terminal branch of each state machine
  and each calls it exactly once per game.
- No phase can stall: every phase starts a host timer with an `onDone`.
- Content: no duplicate ids, no duplicate questions, no answer inside its own
  clue, no dash characters, all touch targets on the phone are 48px or larger in
  CSS.
- Sound is host only, muting persists, the wake lock is re-requested on
  visibility change.
- The host drop path on the phone is real and works: it notices silence, says so
  honestly, keeps knocking, and re-registers on return because hearing a host is
  not the same as being known to it.

---

## WHAT I CHANGED

Fixed, worst first: **A through P, all of them.**

Shell:
- `host.js`: lobby now carries a "Pick another game" control (A). Players away
  for more than 25 seconds are pruned in the lobby only, never mid game (D).
  `roster()` gained `connected` consumers: the Start gate and the new
  `PartyShell.presentPlayers()` count only people who are actually here (D).
  `closeRoom` broadcasts a goodbye before it destroys the room (B). A seat is
  announced on join so a late arrival is told they are in for the next game, and
  cleared for everybody when a game starts (F).
- `player.js`: handles the goodbye with an honest end screen and a way back to
  the join form (B), and shows the shell owned "in for the next one" notice (F).
- `play.html`: modules reload on every slug change, stylesheets are deduped (C, N).
- `shell.css`: chrome for the two new shell screens.

Games:
- All five early-end titles now measure against players who are present, not
  against the roster captured at game start (D).
- `widemargin`, `bearing`: Lock is a real commit. The dial keeps sending, the
  round only ends early once everybody present has locked, an unlocked dial still
  counts at the timer, and the copy says what is true (E).
- `firstfrost`: a podium with survivors names them (G).
- `samesoil`: a silent subject skips the round instead of having an opinion
  invented for them (H).
- `understudy`: agreement has to exist to be rewarded. A round where every vote
  is a singleton is called out as such and pays a small flat amount to everyone
  who voted (I).
- `mothlight`: podium gained Another game and End night (J), and a `names` guard (K).
- `bearing`: the target goes only to the Lantern, resent on rejoin (L).
- `liftingfog` and `firstfrost`: the host re-tells a rejoining phone that it is
  already locked, instead of ignoring a second tap in silence (M).
- `shell.css` now owns `.ps-btn.ghost` and `firefly/game.css` no longer
  redefines it, so all nine podiums finally have the same hierarchy (O).
- `PartyShell.players()` returns the people who are actually here, and
  `allPlayers()` keeps the full register for anything that wants it (P).

## VERIFICATION

`node test/audit_static.js` from `party/`, and it is wired into `test/all.sh`
ahead of the browser gates so a broken wire is caught in a second instead of
after four hundred seconds of driving. It proves what source can prove, and
**every one of its eleven assertions was watched fail on purpose** by mutating
the real tree and restoring it (see the header of that file for what each one
caught). Two of them were wrong on the first attempt and the watching is the only
reason I know:
  - the missing-file check crashed with a node stack trace instead of reporting,
    because everything below it reads the file that is not there. A checker that
    dies instead of failing is not a checker.
  - the identity check passed a mutation that moved the tab marker read to
    localStorage, because it only looked for the string anywhere in the file. It
    now asserts the read, the write and the keying separately, and all three
    mutations go red.

What it proves:

1. every catalogue slug has host.js, player.js, game.css, content.js
2. every host module's bank global is the one its content.js actually sets
3. every element id a module reads is an id that module or the shell writes
4. every phase a host sets is handled by that title's phone module, and every
   phone module handles `over`
5. every host module reaches `gameComplete`, and no phase is unreachable
6. no dash characters anywhere in player facing copy, banks included
7. no duplicate ids and no duplicate entries in any bank
8. the identity is per tab, not per browser (the bug that capped practice
   rooms at one player cannot silently come back)
9. the early end in every title measures presence, not the start roster
10. no secret rides on a broadcast phase payload (Bearing's hidden target)
11. every podium and the lobby offer a way out of the room, and closing the room
    says goodbye rather than looking like a dead host

**Not covered by any gate, and it should be:** the two scoring changes (the
Understudy tie rule and the First Frost survivor bonus) are arithmetic inside an
IIFE that needs a DOM to load, so nothing in node can reach them. `test/drive.js`
exercises the code path but asserts nothing about the numbers. Somebody should
watch a three player Understudy round where all three vote differently and check
it reads "You all said somebody different" and pays 20, not 180.

## STILL WORRIES ME

- **The cloud path has never run.** Everything above is the practice transport.
  The first real room is the test, and I would expect the first surprise to be
  presence: there is no `onDisconnect`, so a phone that dies leaves nothing
  behind but a stale ping clock. The lobby prune I added covers the lobby; a
  mid game death is still only visible as a stopped ping.
- **A dropped host still ends the party.** The phones survive a host reload and
  rejoin themselves, but the host comes back with an empty roster and `started`
  false, so the room lands back in the lobby and the game in progress is gone.
  Making that survivable means the host writing its phase to the room and
  reading it back on boot, which is a real piece of work and a cloud-only one.
- **Twelve questions of First Frost rarely eliminates anybody at four players.**
  I fixed the copy; the underlying tuning is a design call, not mine. If Stephen
  wants a knockout that knocks out, the mark cost or the question count has to
  move.
- **Nothing mints.** `gameComplete` is wired and `partyComplete.js` exists, but
  no sunbeam is minted until the cloud transport is on. Several podiums and
  phone screens already say "You earned sunbeams." That sentence is not true
  today. I left it alone because changing it back and forth around the switch on
  is worse than one wrong tense, but it is a lie on the screen and Stephen
  should know it is there.
- **I did not look at it.** No browser was run. Four defects on this project were
  found by looking and zero by four green gates, and that ratio has not been
  tested by anything I did today. Everything above is read or proved in node.
  The screenshots still need taking.
