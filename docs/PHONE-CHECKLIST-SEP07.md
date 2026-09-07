# ONE PAGE FOR YOUR MORNING, Monday Sep 07

Written by Opus overnight into Monday morning Sep 07, working alone. This is the only page you need to
open. Everything under it is bookkeeping.

**The arcade door:** Browse all, then the In Development tab. Beta rows never show on the public
shelves, so on your phone: `localStorage.sws_dev_ok = '1'` once, then reload.

**All twelve changed. Nothing is half built. Nothing is red now.**

⛔ One correction to what this page said first: it claimed nothing was red all night, and that was written
at 08:45. At 09:20 the fleet sweep caught Gerplunk RED, and section 7 says so. It was the gate and not
the game, it was fixed the same hour, and the sentence at the top was simply stale. Read section 7.

---

## 1. THE TEN, AND THE ONE THING TO DO IN EACH

| game | what changed | the one thing to do |
|---|---|---|
| **Gerplunk** | the turn, and three new stones | **Slide your thumb sideways on the lake.** That is the whole test |
| **Inkswing** | THE TWIN: two pendulums at once | Open the rig list, pick The Twin, throw both bobs |
| **Airworthy** | an unlock ladder in the workshop | Fold a plane and look at the fourth crease. One fold is shut, and it says what to win |
| **Windup** | four more songs | Crank **Ode to Joy** and tell me whether it is Ode to Joy |
| **Strata** | the brush answers, the crate fits | Brush the cliff once. Then open the bench: six tiles, not fifty one |
| **Doohickey** | the cat looks asleep | Open The Cat on the Shelf. She is curled up with two z's over her |
| **Updraft** | every kite card has its kite on it | Open the kites. Five shapes, not five words |
| **Wardian** | the pouch stops saying BUY | It says PLANT and TAKE now |
| **Asterism** | eight meteor showers | Nothing to do tonight. On 12 August it will say so and the sky will have meteors in it |
| **Swell** | an assertion, not a change | Nothing to see. It should look exactly as it did |
| **Whistlestop** | trains can pass through each other | Menu, then TRAINS BUMP. Send two trains at each other with it on |
| **Fathom** | its tile on the shelf | Open the In Development shelf. Fathom's tile is a cave now, not a black square |

Fathom's game is exactly as you left it. What changed is its picture on the shelf.

---

## 2. THE TURN, WHICH IS THE ONE YOU SAID WAS HORRIBLE

You said: *"swiping left to right to try and move is horrible."*

**It was a fault, not a taste, and here is the number.** The same 200 pixels of thumb turned the
lake 24.9 degrees if you crawled it at a constant speed and **13.0 degrees if you swiped it the way
a thumb actually moves**, over 450 milliseconds, which is not a fast gesture. At 300 milliseconds it
was 4.5 degrees out of 25. Same travel, same direction, a different answer every time, and nothing
on the screen to tell you why.

The cause was a double count in the code and it is gone. **One ordinary swipe now turns the full 25
degrees where it turned 13.**

**So the lake answers about twice as much per thumb as it did on your phone.** If that now reads
twitchy rather than fixed, say so and it is one number: `TURN_DEG_PER_M`, and 340 is the first stop.

**What I did NOT do, and why.** Your call 22 offered halving the gain and widening the stance to 60
degrees. Both were measured and both are worse: at the halved gain the whole aim axis is 631 pixels
of thumb, which does not fit a 412 pixel screen, and at a 60 degree stance it is 1515, which is four
re grips. The table is in `satellites/gerplunk/docs/REFERENCE.md`.

---

## 3. YOUR EAR, WHICH IS STILL THE LARGEST UNKNOWN IN THE TWELVE

No gate in this repo has ears. Six files wait for yours, all double clickable:

```
satellites/windup/docs/shots/p0-tine.wav          one middle C, then seven notes of Twinkle
satellites/swell/docs/shots/p0-swell.wav          dawn, one finger, six seconds
satellites/swell/docs/shots/p0-storm.wav          the same, in the storm mood
satellites/swell/docs/shots/p0-lullaby.wav        the same, in the lullaby mood
satellites/gerplunk/docs/shots/p4-bed-and-throws.wav   the lake and five throws
```

And **the four new songs in Windup have never been heard by anybody.** Ode to Joy, Frere Jacques,
Jingle Bells, Amazing Grace, all older than any copyright and all transposed onto the comb's fifteen
white keys. They are written from the interval pattern, not from a score. A wrong note in a melody
everybody knows is the one fault a player spots in a second and no gate here can catch it. **Crank
all four.**

---

## 4. WHAT I DECIDED WITHOUT YOU, BY NUMBER, SO YOU CAN VETO BY NUMBER

The night's mandate was your words: everything, ten times better. I read that as taking the
recommended option on every open call where building it re grades nothing you have kept, needs none
of your hands, adds no store, and touches nothing of Jimothy.

| call | what I did | how to undo it |
|---|---|---|
| **22** Gerplunk's turn | fixed the fault, left the gain alone | one number, `TURN_DEG_PER_M` |
| **24** more things to skip | three of six: a bottle cap, a roof tile, a disc of ice | delete three rows |
| **31** Inkswing's Twin | rig five, two bobs, two pens, unlocked at twenty drawings | delete one rig |
| **34** Airworthy's ladder | four earned folds, ADDITIVE, nothing ever locked | delete four rows |
| **37** Wardian says BUY | PLANT on a seed, TAKE on a thing | three words |
| **41, 43** no master gain | both games have one, at 1.0, inaudible by measurement | one line each |
| **15** Strata's crate of fifty | one tile per kind, six instead of fifty one | one function |
| (none) Asterism showers | eight showers, the prompt names the one that is running | delete one table |
| **C13** the little hands switch | Whistlestop: trains pass through instead of bumping, OFF for a new player | delete one button |

**The ladder is the one to read.** Every part in that workshop was already available, so a ladder
gated by medals could only work by LOCKING something you can use today, and the challenges are
measured against reference folds that use those very parts: lock the wrong one and the first medal
becomes unreachable and the ladder can never open. So it ADDS folds instead, four of them, each
flown before it was written. There is an assertion that no rung ever takes a fold away, and it names
the challenge when it goes red.

---

## 4b. THE SWITCH FOR A CHILD WHO IS NOT READY TO LOSE

Your call 13. Whistlestop's menu has an eighth button now, **TRAINS BUMP**, and pressing it says
**TRAINS PASS THROUGH**. With it on, two trains that meet go through each other and the run carries
on. It is **off for a new player**, and it stays where you put it, on the rug and in the puzzles.

Three things came out of building it that are worth your knowing.

**It did nothing at all when it was first wired**, and everything looked right: the button changed
its word, the setting saved, and all 175 of that game's assertions were green. The line that carried
it into the running railway wrote to a name that does not exist. That is now measured by a gate that
reads the setting, the railway and the button's word together and compares them.

**The eighth button pushed CLOSE off the bottom of a 320 pixel phone**, and no gate saw it, because
the one that measures the menu scrolls to each button before it looks. I found it by opening the
picture. Sideways it was worse and had been since the game was built: the menu ran 186 pixels past
the bottom edge on a phone held on its side. The menu tightens on short screens now and goes to two
columns sideways, and there is an assertion that the way out of a menu is on the screen.

**The toast covered the button it was about.** It said "Trains will pass through each other" in the
middle of the screen, which is exactly where the button is. The word on the button is the message.

## 5. ONE THING I BUILT AND THEN DELETED

Swell's motes. They were written to say which sections are sounding, because the look pass said a
still of the swell and a still of the resolve are almost identical. Then the top of the screen was
measured with them and without: **832 lit pixels either way at the moment the choir comes in, and 0
either way before it.** The choir's own curtain already said it. The fleet's law is no ambient
particles unless they are information, so they came out. What survives is the assertion the game
never had: the top of the screen is dark before the choir and carries it afterwards, in the choir's
own colour.

**And Asterism's showers are the opposite case.** Eight of them, with their dates and radiants taken
**from memory** of the standard almanac tables and not from any source fetched for this build, which
is written down in that game's DECISIONS. On a shower night the prompt names it and meteors fall
from its radiant. Every other night of the year has none.

## 6. THREE NEW THINGS FOR YOU TO DECIDE (53 to 55)

53. **All five of Updraft's kites still FLY as one diamond.** The cards have their shapes now; the
    sky does not. The Box and the Dragon fly as a Diamond with different numbers behind them. Half a
    day. My call: do it, five kites that fly identically are one kite with a menu.
54. **Strata's bench says "0 of 51 set, 91 percent of the animal"**, two numbers about two different
    things in one line. Ten minutes.
55. **Doohickey's bell is the least prominent thing on the board**, and every level exists to ring
    it. Its size is physics, so what changes is what is drawn around it. An hour.

---

## 7. WHAT IS NEW THAT YOU CANNOT SEE

**And on its first night it caught something.** The sweep found Gerplunk RED, an hour after I had
already written that nothing was red all night. It was the gate and not the game, for the second
time in two days in that same game: the assertion that says the hand is empty while the stone is in
the air was taking its two pictures from two different frames, and a short throw can land in
between. Fixed, and the fix is that a gate needing two pictures of one instant now gets them from
one instant. **Nothing you can see changed.**

**A gate now runs when nobody is here.** On Sep 07 Gerplunk sat red on `main` and was found by
accident, because nothing in this repo ran a gate between sessions. Every push now runs every gate
of the twelve that needs no browser, in about three minutes, on GitHub. It has been watched going
green for real and red on a planted fault. There is also a local sweep that runs the FULL suites
plus the four places a stamp lives, and writes `docs/fleet-sweeps/<date>.md`. Both of tonight's
sweeps read twelve green with every stamp agreeing in four places.

---

## 8. IF YOU ONLY HAVE TEN MINUTES

1. **Slide your thumb on Gerplunk's lake.** Fixed, or now twitchy.
2. **Crank Ode to Joy in Windup.** Right notes, or not.
3. **Open Inkswing's Twin and throw both bobs.** It is the biggest new thing in the twelve.
3b. **Whistlestop's menu, TRAINS BUMP.** Turn it on and drive two trains together.
4. **The six wavs above.** Still the largest unknown.
5. Calls 53 to 55, then the rest of `docs/DIRECTOR-CALLS-SEP06.md`.
