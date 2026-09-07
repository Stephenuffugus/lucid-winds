# REFERENCE, Gerplunk: how other games let a thumb AIM

Written 2026-09-07 by Opus, before touching the turn, under the night handoff's rule that a
build phase opens with a reference note. The throw already has its own note,
`THROW-REFERENCE.md`, written 2026-09-07 for the spin ring; this one is about the other half of
the touch, the part Stephen called horrible.

**Everything below that is not measured out of our own code is FROM MEMORY and is labelled so.**
No source was fetched for this note. Ideas and mechanics only: nothing from any other game's art,
name, character or copy enters Gerplunk, and no other title is named anywhere a player can read.

---

## 1. THE PROBLEM, IN ONE SENTENCE

A stone skipping throw needs four numbers (how hard, how flat, how much spin, and WHERE), a
single stroke on glass carries three (speed, direction, curvature), so the fourth has to come from
somewhere else, and every candidate for that somewhere else is a compromise.

## 2. WHAT THE FIELD DOES, AND WHAT EACH ONE PAYS FOR IT

Four families, from memory. None of them is a stone skipping game, because there is no serious one;
that is the market read in the plan and it still holds.

**(a) The slingshot: aim and power in one pull, position based.** You drag back from a fixed
object and the vector from the object to your thumb is the whole shot. Memory: the bird flinging
games are the canonical case. What it buys: nothing to learn, the aim is visible as a line, and the
same gesture is both numbers, so there is never a mode. What it pays: the aim is a POSITION, so the
reachable arc is the arc your thumb can reach without changing grip, and the object has to sit
where a thumb can pull back from it. On a tall phone held one handed, the left third of the glass
is not reachable by a right thumb, so half the aim axis silently costs a re grip. **We refused this
in D18 and the reason was exactly that.**

**(b) Aim and power as two separate gestures, in sequence.** Drag the world to look, then swipe to
act. Memory: the phone golf games work this way, and so does almost every fishing game: you pan a
camera, then a separate power gesture. What it buys: each gesture does one thing, both can be
tuned alone, and a slip in one cannot ruin the other. What it pays: two gestures per shot, a mode,
and the flow of one continuous motion is gone. It is also the thing that makes those games feel
like a menu rather than a hand.

**(c) One continuous touch with a slow half and a fast half.** The slow part means one thing, the
fast part means another, and the boundary is a SPEED. Memory: the ball throwing in the big
augmented reality catching game is the closest relative, where a circular wind up before the flick
banks spin and the flick itself throws. **This is what Gerplunk does (D18), and it is the right
family for this game**, because a throw really is one motion with a settle in front of it.

**(d) Aim from the device: tilt, or a second thumb.** Refused: tilt cannot be gated by anything
headless, and a second thumb breaks the one handed law.

## 3. WHAT FAMILY (c) COSTS, AND IT IS ONE THING

**A speed boundary inside a single gesture is invisible.** The player cannot see how fast their own
thumb is moving, and the same physical stroke means two different things on either side of a number
they cannot perceive. Every game in this family pays this, and the ones that get away with it pay in
one of two ways, both from memory:

- **The two halves are separated by a PAUSE rather than by a speed.** The wind up is a hold: you
  circle the ball and it visibly charges, and the throw is what happens after you stop circling.
  The player feels the hold as a distinct act.
- **The slow half is shown while it happens.** The charge ring grows, the aim line swings. The
  player is never guessing which half they are in, because the screen is answering continuously.

Gerplunk already does the second: the lake turns live under the thumb, there is a haptic detent
every five degrees, and the spin ring grows. That is the right instinct and it is built.

## 4. WHAT THE MEASUREMENT FOUND, AND IT IS NOT A TASTE

Measured 2026-09-07 against our own model (`plantYaw`, `motionFromSamples`) out of `index.html`,
at the shipped CONFIG. The same 200 pixels of sideways thumb travel, moved two ways:

| how long the swipe takes | crawled at a constant speed | swiped the way a thumb moves |
|---|---|---|
| 900 ms | 25.0 degrees | 25.0 degrees |
| 600 ms | 25.0 degrees | 23.3 degrees |
| **450 ms** | **24.9 degrees** | **13.0 degrees** |
| **300 ms** | **4.4 degrees** | **4.5 degrees** |

A 450 millisecond swipe across a phone is not a fast gesture. It loses twelve of the twenty five
degrees it asked for, and the player is given no way to know why. At 300 ms the lake barely moves at
all. **The same travel, the same direction, a different answer every time, with nothing on the
screen to explain it.** That is what "swiping left to right to try and move is horrible" is, in
numbers, and it is a fault rather than a taste.

The cause is not the gain. It is that the plant weights EVERY segment by its own speed, on top of
already excluding the throw: the arm onset walk back (`armStartOf`, two consecutive slow segments
from the release) removes the throw from the plant completely and by construction, so the extra per
segment fade can only ever discount travel that is NOT the throw, which is to say the middle of an
ordinary swipe.

## 5. WHAT WE ADOPT

**One rule, in one place: everything before the arm turns the lake, at full gain.** The arm onset is
the only boundary, it is measured from the release where the player's intent is unambiguous, and it
is the same function live and committed. The screen keeps answering continuously, which is the
thing family (c) has to do to survive.

## 6. WHAT WE REFUSE, AND WHY

- **Separating aim and power into two gestures (b).** It would work, and it would cost the one
  unbroken motion the whole game is built on. If Stephen ever wants it, it is a real option and it
  is a day, not an hour.
- **Position based aim (a).** Costs left handed and small handed players half the axis. Refused in
  D18 and the reason has not changed.
- **Halving `TURN_DEG_PER_M` to 300 and widening `YAW_MAX_DEG` to 60** (call 22 options a and b).
  Measured and ruled out: at gain 300 the whole aim axis is 631 pixels of thumb, which does not fit
  a 412 pixel screen, and at a shore of plus or minus 60 degrees it is 1515 pixels, which is four
  re grips. The numbers are in the ledger. Both remain one line each if his thumb wants them.
- **A rise floor that makes a flat sideways stroke a set down rather than a throw.** It was measured
  because it looked like the other half of the complaint: a pure sideways release does throw, and it
  scores zero skips every time. But the floor cannot be placed anywhere useful, because a skimmer at
  rise 0.02 (eight degrees) still skips thirteen times, so any floor high enough to catch a stray
  swipe also refuses real throws. Left alone, and the reason is written down so nobody measures it
  twice.

## 7. WHAT IS STILL STEPHEN'S

The gain itself. With the fade gone, one ordinary swipe now turns the full twenty five degrees
where it used to turn thirteen, so the lake answers about twice as much per thumb as it did on his
phone. If that reads as twitchy rather than as fixed, `TURN_DEG_PER_M` is one number and 340 is the
first stop. This note exists so that when he says which, the reason is already measured.
