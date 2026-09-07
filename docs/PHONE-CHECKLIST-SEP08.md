# ONE PAGE FOR YOUR MORNING, Sep 08

Written by Opus at the end of the night of Sep 07, working alone. This is the only page you need
to open. Everything under it is bookkeeping.

**The arcade door:** Browse all, then the In Development tab. Beta rows never show on the public
shelves, so on your phone: `localStorage.sws_dev_ok = '1'` once, then reload.

---

## 1. THE FOUR GAMES THAT CHANGED TONIGHT, AND THE ONE THING TO DO IN EACH

| game | what changed | the one thing to do |
|---|---|---|
| **Gerplunk** | the turn, and three new stones | **Slide your thumb sideways on the lake.** That is the whole test. It used to answer half of an ordinary swipe and now it answers all of it |
| **Windup** | four more songs | Open the shelf. Crank **Ode to Joy** and tell me whether it is Ode to Joy |
| **Wardian** | the pouch stops saying BUY | Open the pouch. It says PLANT and TAKE now |
| **Updraft** | a master and a ceiling on the sound | Nothing to see. Fly once and tell me if anything sounds different, because nothing should |

---

## 2. THE TURN, WHICH IS THE ONE YOU SAID WAS HORRIBLE

You said: *"swiping left to right to try and move is horrible."*

**It was a fault and not a taste, and here is the number.** The same 200 pixels of thumb turned the
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
of thumb, which does not fit a 412 pixel screen, and at a 60 degree stance it is 1515 pixels, which
is four re grips. The table is in `satellites/gerplunk/docs/REFERENCE.md`.

---

## 3. YOUR EAR, WHICH IS STILL THE LARGEST UNKNOWN IN THE TWELVE

No gate in this repo has ears. Six files wait for yours, and they are all double clickable:

```
satellites/windup/docs/shots/p0-tine.wav          one note, then seven of Twinkle
satellites/swell/docs/shots/p0-swell.wav          dawn, one finger, six seconds
satellites/swell/docs/shots/p0-storm.wav          the same, in the storm mood
satellites/swell/docs/shots/p0-lullaby.wav        the same, in the lullaby mood
satellites/gerplunk/docs/shots/p4-bed-and-throws.wav   the lake and five throws
```

And the four new songs in Windup have **never been heard by anybody**. They are written from the
interval pattern, not from a score. A wrong note in a melody everybody knows is the one fault a
player spots in a second, and no gate here can catch it. **Crank all four.**

---

## 4. WHAT I DECIDED WITHOUT YOU, BY NUMBER, SO YOU CAN VETO BY NUMBER

The night's mandate was your words: everything, ten times better. I read that as taking the
recommended option on every open call where building it re grades nothing you have kept, needs none
of your hands, adds no store, and touches nothing of Jimothy.

| call | what I did | how to undo it |
|---|---|---|
| **22** Gerplunk's turn | fixed the fault, left the gain alone | one number, `TURN_DEG_PER_M` |
| **24** more things to skip | three of Fable's six: a bottle cap, a roof tile, a disc of ice | delete three rows |
| **37** Wardian says BUY | PLANT on a seed, TAKE on a thing | three words |
| **41** Wardian has no master | it has one, at 1.0, which changes nothing you can hear | one line |
| **43** Updraft has no master or ceiling | both, and neither is audible today: measured before and after | one line |

**Not taken, and each for a reason:** the other three stones you were offered (a sand dollar that
shatters, a turtle that swims off, a laptop that always beaches) each need a NEW MECHANIC rather
than a row, so they are a build and not a bank entry. Airworthy's unlock ladder (call 34) is
started on paper and NOT built: every part in that workshop is already available, so a ladder would
have to LOCK things you can use today, and locking the wrong one makes the first medal
unreachable. That needs your eye before code.

---

## 5. WHAT IS NEW SINCE YOU WENT TO SLEEP THAT YOU CANNOT SEE

**A gate now runs when nobody is here.** On 2026-09-07 Gerplunk sat red on `main` and was found by
accident, with nothing wrong in the game, because nothing in this repo ran a gate between sessions.
Every push now runs every gate of the twelve that needs no browser, in about three minutes, on
GitHub. It has been watched going green for real and going red on a planted fault. There is also a
local sweep that runs the FULL suites plus the four places a stamp lives, and writes
`docs/fleet-sweeps/<date>.md`.

---

## 6. THE RANKED LIST, IF YOU ONLY HAVE TEN MINUTES

1. **Slide your thumb on Gerplunk's lake.** Fixed, or now twitchy.
2. **Crank Ode to Joy in Windup.** Right notes, or not.
3. **The six wavs above.** Still the largest unknown in the twelve.
4. **Airworthy's ladder needs your eye before code** (section 4).
5. Everything else in `docs/DIRECTOR-CALLS-SEP06.md`, unchanged.
