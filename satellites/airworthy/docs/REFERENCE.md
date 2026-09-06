# REFERENCE, Airworthy

**Written:** 2026-09-07, Opus, before the A5 build phase (the gust whistle).
**What it is:** the best things in the world that do what Airworthy does, what each does that we
do not, what we adopt and what we refuse. Ideas and mechanics only. No asset, name, character
or line of copy from anyone else ever enters the game, and no other title is named in player
copy.
**Honesty note:** claims marked **[memory]** come from my own knowledge rather than from a page
read today. The rest is from the sources at the foot, read Sep 07 2026.

---

## 1. THE CATEGORY, AND WHAT IT ACTUALLY IS

There are a lot of paper plane games and almost all of them are the same game: a throw, then a
long side scrolling flight you steer, with pickups and upgrades. The published descriptions of
the current crop say it plainly: physics driven, throw it as far as possible, unlock advanced
designs as you play, sometimes a head to head mode. **[memory]** The oldest and best known
browser one is a distance record chase with boosts, and the one people remember from an office
is a paper plane you flick and then nudge along a corridor.

**What almost all of them do that we do not:**

1. **They give you the whole flight.** You steer, tilt, boost and dive for as long as the plane
   is up. The plane is a vehicle.
2. **They put pickups in the air.** Coins, rings, boosts. The flight becomes a lane to collect
   things in, and the aerodynamics stop mattering after the first second.
3. **They unlock plane designs as rewards** rather than as things you fold.
4. **They are endless.** There is no plane you keep and improve, only a distance number.

**What Airworthy does that none of them do:** the fold is the game. Every crease is a choice
with a consequence you can measure in the tunnel before you throw, the trim between throws is
the loop, and the plane is a thing you keep in a hangar. The flight is the RESULT of the plane,
not a level you fly through. That is the whole bet and it is the opposite bet from the category.

---

## 2. WHY THAT MAKES MID FLIGHT CONTROL DANGEROUS

The item this note is written for is the gust whistle: one tap, mid flight, once per flight,
adds a little lift under the plane. The design (item 6) has always had it and the build slice
deliberately took it out (plan 3.4, "no mid flight control in the slice").

The risk is exactly the category's failure. **The moment a player can steer, the fold stops
mattering.** Every game listed above proves it: they all have a plane you can fold or unlock,
and in none of them does the shape of the plane survive contact with a boost button. A player
who can save a bad flight will stop fixing bad planes, and the trim loop, which is the game,
goes quiet.

So the question is not whether to build the whistle. It is what shape of nudge does NOT eat the
fold.

---

## 3. THE ONE PLACE THE CATEGORY GETS THIS RIGHT

The nearest good answer is not in a paper plane game at all, it is in gliding, which is what
this plane actually does. **[memory]** A real glider pilot does not steer their way to
distance; they find lift that is already there and use it. The skill is in reading the air and
being in the right place, and the aircraft's glide ratio decides everything else.

Airworthy already has that air: thermals, ridge lift, sink in the lee, and a seeded gust on the
Stadium. What it does not have is any way for the player to ACT on knowing where the lift is.

That is the shape the whistle should take: **not a boost, a call.** One tap puts a small
upward parcel of air under the plane for half a second. It does not steer, it does not add
speed, it does not turn, and it cannot save a plane that is already stalled or spiralling,
because a wing that has let go does not care how the air under it is moving. What it can do is
carry a good plane a little further, and it rewards TIMING, which is a reading of the flight
you are watching rather than a correction of the plane you folded.

---

## 4. WHAT WE ADOPT

- **A1. One tap, once per flight, half a second of lift.** It is an event, not a control. There
  is nothing to hold and nothing to steer.
- **A2. It is EARNED, not given.** The first silver in the gym opens it. A player who has not
  yet made a plane that flies well has nothing to whistle at.
- **A3. It is off in the challenges.** The challenges already take the throw off the player
  (call C8) precisely so that six challenges ask for six planes. A nudge in a challenge would
  make one plane do for all of them, and the medals are measured numbers written by a tool that
  never whistled.
- **A4. The sim owns it.** `fly()` takes the nudge, so the whole flight is still one
  deterministic function of the plane, the throw, the air and the nudge. A share, a ghost and a
  medal all stay reproducible.

## 5. WHAT WE REFUSE, AND WHY

- **R1. No steering, no dive, no hold to boost.** See section 2. It is the category's mistake
  and it is the one thing that would make the fold not matter.
- **R2. No second whistle, no upgrade to more whistles.** An unlock ladder that sells more nudges
  is a slow slide to a plane that does not need to be folded well. If the ladder is built
  (call G34), the whistle is not on it.
- **R3. It does not rescue a stall or a spiral.** A separated wing is a barn door and the game
  models that already. The whistle adds air, not lift, and a stalled plane gets nothing from it.
  This is a physics fact rather than a rule, which is the best kind.
- **R4. No pickups, ever.** The air is a landscape to read, not a lane to collect in.
- **R5. It is not in the score.** Distance is distance. If a whistled flight sets your hangar
  best that is yours, and the challenge tables, which are what anyone compares, never see one.

---

## 6. THE THING TO WATCH

If the whistle turns out to be worth a lot of metres, it becomes the game and section 2 has
happened anyway. The number that keeps it honest is how far a whistled flight goes against the
same flight unwhistled: it should be a few percent, the difference between a good throw and a
very good one, not the difference between a bad plane and a good one. There is an assertion for
it, and if Stephen wants it to matter more, that is one constant and it is his.

---

## Sources

Read Sep 07 2026. Mechanics and published descriptions only.

- https://play.google.com/store/apps/details?id=com.atgstudios.paperly
- https://play.google.com/store/apps/details?id=com.Unicron.Lab.Epic.Plane.Flight.Landing
- https://apps.apple.com/us/app/paper-sim-flying-plane-games/id6745877058
- https://alternativeto.net/software/folded-flyer-paper-plane-flying-game
