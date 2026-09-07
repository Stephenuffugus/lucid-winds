# REFERENCE, Whistlestop

**Written:** 2026-09-07, Opus, in the polish loop rather than before a build phase, because this
game had no reference file and the next person to change its shape should not have to guess.
**What it is:** the best things in the world that do what Whistlestop does, what each does that we
do not, what we adopt and what we refuse. Ideas and mechanics only. No asset, name, character or
line of copy from anyone else ever enters the game, and no other title is named in player copy.
**Honesty note:** claims marked **[memory]** come from my own knowledge rather than from a page
read today. The rest is from the sources at the foot, read Sep 07 2026.

---

## 1. THE CATEGORY, AND WHAT IT ACTUALLY IS

Whistlestop sits between two categories that almost never touch each other, and that gap is the
whole reason it exists.

**The first category is the track puzzle.** You are given a board, you lay or bend a limited
number of rail pieces, you press go, and then you WATCH. The best of them says so in its own
words: place, remove and reroute connections so that carriages safely connect, over two hundred
and forty puzzles, a hint system rather than a fail screen, and the difficulty comes from having
only a handful of tiles and needing the cars in the right ORDER. It is a comfortable, relaxed,
strictly turn based thing. The rest of the crop is the same skeleton: tap to switch a junction so
trains do not meet, or connect stations and let the trains run your paths automatically.

**The second category is the train set sandbox.** You lay track, build the town around it, and
then ride your own line from the driver's seat. Its own description is honest about the absence
of a goal: a toy train set builder that gives you the tools to play without limits. Junctions and
multiple trains are listed as optional creative toys, not as the point.

**What almost all of them do that we do not:**

1. **The puzzles run without you.** In the puzzle category the whole answer is committed before
   the trains move. You are an engineer at a desk, never a signaller at a lever, and once the
   button is pressed your hands are off.
2. **The sandbox has no stakes at all.** Nothing can go wrong, so nothing you build MEANS
   anything. A junction is decoration.
3. **They are one thing or the other.** The puzzle games have no free building worth the name and
   the sandbox has no puzzle. A child who wants both needs two apps.
4. **The board is a board.** A grid of tiles on a flat field. It is never an OBJECT in a room.
5. **Failure is a reset.** You retry the level. Nothing in the fiction tells a small player what
   went wrong or whose fault it was.

## 2. WHAT WHISTLESTOP DOES THAT NONE OF THEM DO

**The switches are worked while the trains are moving, and the trains are wooden, and the rug is
a rug.** Three things, and they only work together.

The first is the real bet: a lever thrown at the right moment against a train that is already
rolling. That is a signaller's job and it is a live skill, not a committed plan. It also gives us
the one rule the whole game turns on, which the puzzle crop cannot have because nothing of theirs
is live: **a facing switch ahead of the train obeys the lever and a trailing one never does.**
A train that backs into a siding leaves it through the switch trailing, so the lever cannot touch
it, and comes back at the switch facing, so the lever decides. Half of the puzzle content falls
out of that one physical truth rather than being invented.

The second is that the railway is a set of wooden pieces you snap together with a click, on a
rug, with a house and a cow and a tree standing beside it, and the same railway is both the toy
and the puzzle board. Nothing has to be unlocked to build.

The third is that a collision is not a reset. A flag comes up over the engine at fault and says
which train bumped, because the player we are building for is small and needs to be told whose
fault it was.

## 3. WHAT WE ADOPT

1. **Par, and stars for beating it.** The puzzle crop's real lesson is that a small fixed number
   makes a player replan rather than fiddle. Ours is already there: par is the number of lever
   flips, `sim.js --solve` proves every puzzle's par by search rather than by an author's guess,
   and Swap's par came out 2 when the plan had said 4. Keep proving it by search. Never type a par.
2. **A hint that does not give the board away.** The best of the puzzle crop is explicit that its
   hints stay challenging. We have none. **This is the single biggest thing we could take.**
   Ours should say what a switch DOES rather than which lever to throw, because our failure is a
   player not understanding facing and trailing, not a player unable to search.
3. **The relaxed frame.** No timer, no lives, no countdown. We already have this and the crop
   confirms it is right for the audience; the third star asking that no train was ever held is a
   better pressure than a clock, because it rewards planning and never punishes thinking.
4. **Riding it.** The sandbox's first person ride is the one thing in that category with real
   charm, and it costs nothing in a puzzle: a camera that sits on the engine and follows the
   route the follower already computes. `LAY` and the route model would give it almost free.
   Would land near `drawTrains` in `satellites/whistlestop/index.html`.

## 4. WHAT WE REFUSE, AND WHY

1. **We refuse the committed plan.** No press-go-and-watch mode where the whole answer is set
   before the trains move. That is the puzzle category's whole shape, it is well served by better
   funded games, and it would delete the one thing we have that they do not.
2. **We refuse limited pieces as the difficulty.** Their puzzles are hard because you have four
   tiles. Ours are hard because a train is already moving. Rationing the tray would turn this
   into a worse version of a game that already exists.
3. **We refuse an endless or procedural puzzle stream.** Six authored puzzles that each teach one
   truth about a switch beat a hundred generated boards, and every one of ours is solved by search
   before it ships.
4. **We refuse boosters, ramps and musical bells on the track.** The sandbox has them and they
   are exactly what makes its junctions decoration: once a train can be boosted, the routing stops
   mattering. Same failure as pickups in a flight game.
5. **We refuse an unlock ladder for track pieces.** Everything in the tray is there on the first
   run. A child building a rug should not meet a locked curve.

## 5. THE OPEN QUESTIONS FOR THE DIRECTOR

1. **A hint system, and what a hint says.** Recommended, and the single most valuable thing on
   this page. My proposal is two levels: the first names the rule the puzzle is teaching, in the
   game's own words, and the second highlights the one switch the answer turns on without saying
   which way. About half a day. **His call on whether it says anything at all.**
2. **Ride the engine.** A camera on the front of the engine, a button on the puzzle card. About
   half a day and it is charm, not depth. It is also a taste: it may make the rug feel smaller
   rather than bigger. **His call.**
3. **How many puzzles.** Six exist. The crop ships two hundred and forty. I do not think we should
   chase that, but somewhere between six and twenty is a real question about how long this game is
   meant to last, and it is a design decision, not a build one. **His call.**

## Sources

- Railbound on the App Store, read Sep 07 2026: https://apps.apple.com/us/app/railbound/id1636439801
- Tracks, The Train Set Game on Steam, read Sep 07 2026: https://store.steampowered.com/app/657240/Tracks__The_Train_Set_Game/
- Search results for train junction routing puzzles, Sep 07 2026, which surfaced the wider crop
  (tap to switch junctions so trains do not collide; connect stations and trains run your paths
  automatically; a switching loop logic puzzle in eleven stages). Descriptions only, not played.
- The train shunting puzzle, Wikipedia, listed in the same search as the paper form of the genre.
