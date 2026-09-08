# GEAR DOODADS, the design note before the build. Sep 08 2026, Fable.

Stephen, Sep 08, answering what "bring stuff" meant on the kite:

> the gear I'm talking about is like being able to put like one of those little finger puppets on it
> or a chip clip or a bouncy ball or other fun cool little toy gadgets, doodads, fidget, spinner
> whatever that kids could hypothetically use. and of course like a fidget spinner would just wreck
> the plane. it wouldn't work like a paperclip you actually need for the weight to help give more
> lifts or counter the lift.

He said "the plane" while answering about the kite, so this is one idea across both flying games.
The idea in one line: **things a kid would actually tape to a paper plane or a kite, each with a real
consequence in the physics, some useful, some a joke, and the joke is allowed to wreck the flight.**

## The laws that bind it

- **Nothing is bought.** Doodads unlock by feats the way Airworthy's folds and Updraft's kites do
  (medals, hours, tricks). No currency, no store, no economy claim in copy.
- **Every doodad is a row in a physics table first and a drawing second.** It is flown in the sim
  before its line is written. A doodad that flies the same as no doodad is a sticker, not gear.
- **The joke is a law.** "A fidget spinner wrecks the plane" is asserted, not hoped: the sim proves
  the spinner plane cannot reach a bronze and the spinner kite cannot lift off below Blustery.
- **The base set stays winnable.** An assertion that the no doodad plane still reaches a bronze and
  the no doodad kite still lifts off, so gear is never required.
- **Save fields are added without a version bump** (Updraft's `SAVE.read` wipes on mismatch;
  Airworthy's record writers are whitelists, find every one). Prove an old save loads.
- **Copy laws.** No dashes, no exclamation points, 0.7 rem, 48 px chips, the music chip's corner and
  the top band stay empty.
- **Code drawn.** Each doodad has a small code drawing on the plane or kite and on its shelf chip;
  a painted sheet can replace it later (add rows to the game's ART_ASSETS.md).

## Airworthy, where the hooks already are

`derive(spec)` (index.html about :532) already reads a clip: `CLIP_MASS` (1 g at nose or middle),
`CLIP_CG` (a 0.10 chord shift at the nose), `CLIP_CM` (a nose down moment of 0.028 at the nose,
which is what makes the lawn dart). The paperclip lives on the TRIM sheet after a throw, reached
from the result card. So a doodad is the paperclip generalised: **{mass kg, cgShift, Cm, CD0 add,
where it can go (nose, middle, tail, wing), a line, an unlock feat}**, and the TRIM sheet's
"Paperclip" row becomes a DOODADS shelf.

Proposed bank. Every number is a starting point for `node sim.js --fly`, not a fact; the builder
moves it until the plane does on the field what the line says, and re runs `--medals --write`
because mass moves every reference fold.

| doodad | mass | where | cg | Cm | CD0 | what it does | line |
|---|---|---|---|---|---|---|---|
| Paperclip (exists) | 1 g | nose, middle | 0.10 | 0.028 | 0 | the honest weight | as today |
| Penny | 2.5 g | nose, middle | 0.14 | 0.040 | 0 | a heavier clip: a dart in wind, a lawn dart on a calm day | A coin on the nose. It has opinions about down. |
| Rubber band | 1.5 g | nose | 0.06 | 0.012 | 0.004 | a lighter clip, and it holds a loose nose fold shut | Wound twice. It keeps the nose honest. |
| Googly eyes | 0.5 g | nose | 0.01 | 0 | 0.003 | nearly nothing, a face | Now it can see where it is going. |
| Finger puppet | 3 g | nose, tail | nose 0.08 / tail 0.12 back | nose 0.020 / tail up 0.020 | 0.050 | a slow nose heavy glider on the nose; a fluttering stall on the tail | A small passenger with a big hat. |
| Chip clip | 6 g | nose, tail | 0.20 / 0.20 back | 0.070 / 0.060 up | 0.030 | a lawn dart on the nose every time; on the tail it floats up and falls off the back | It was on a bag of crisps a minute ago. |
| Bouncy ball | 12 g | nose | 0.24 | 0.090 | 0.020 | straight down, then it BOUNCES: the plane lands twice and the second landing counts for distance | It goes down. Then it goes up. Then it goes down. |
| Fidget spinner | 45 g | wing | 0 | 0 | 0.200 | wrecks it: the wing cannot carry it, the plane is down inside a metre and the archetype is The Brick | You knew. You did it anyway. |

Rules of the shelf: one doodad per plane (the clip and a doodad do not stack; the clip is a doodad).
Where a doodad can go is drawn on the crease. The Brick unlocks a badge the first time, because
everyone will try it once and the game should be in on it. The bouncy ball's second landing is the
one new mechanic in the bank (a restitution on the ground contact when the ball is on the nose);
everything else is numbers in tables `derive` already reads.

Unlocks (feats, never currency): Googly eyes from the first flight; Rubber band, Penny at one
bronze; Finger puppet at three bronze; Chip clip at one silver; Bouncy ball at three silver;
Fidget spinner at one gold, so the joke is a reward.

Gates: each row flown before written; "the base set reaches a bronze in every challenge" (exists,
widen to "with no doodad"); "the spinner plane is down inside two metres"; "the bouncy ball plane
lands twice"; the shelf's chips are 48 px by elementFromPoint at 375x667; copy law on every line;
`dupkeys`; an old hangar record survives a save.

## Updraft, where the hooks are thinner

`KITES` carries seven numbers per kite (area, mass, CL, CD, tailLen, stability, maxTension). The
tail is cosmetic today (stepTail never feeds back), there is no line object, and break strength
lives on the kite. A doodad on a kite is **{mass, CD add, stability delta, where (tail, spine,
line), a sound if it makes one, a line, an unlock feat}**. A second row on the kites screen, or a
shelf after the pick.

| doodad | mass | where | CD add | stability | what it does | line |
|---|---|---|---|---|---|---|
| Ribbon tail | 0.01 | tail | 0.05 | +0.15 | steadier, a little lower | A longer tail for a nervous day. |
| Streamer bundle | 0.02 | tail | 0.10 | +0.25 | steadier again, and the ceiling drops | Three ribbons. The sky gets shorter. |
| Bell | 0.02 | line | 0 | 0 | rings on a gust: the wind you cannot see, heard | It tells you about the wind before the kite does. |
| Whistle | 0.015 | spine | 0.02 | 0 | a real kite thing: it sings above a speed | The old kites carried these. |
| Finger puppet | 0.03 | spine | 0.08 | 0 | waves in the gust, costs a little height | A passenger. It waves. |
| Bouncy ball | 0.05 | tail | 0.03 | +0.30 | a pendulum: very steady, and it cannot lift off under about four metres a second | It hangs there like an anchor, because it is one. |
| Chip clip | 0.04 | line | 0 | 0 | a messenger: clipped to the line it climbs to the kite in a gust and comes back (a small game in itself, later) | Clip it on. Watch it climb. |
| Fidget spinner | 0.06 | spine | 0.20 | 0.30 down | wrecks it: no lift off except Blustery, and then the line snaps at tension | It spins. Nothing else does. |

Unlocks by the journal: Ribbon tail from the first flight; Bell at half an hour; Whistle at one
Loop; Finger puppet at two hours; Streamer bundle at ten Loops; Bouncy ball at one High Park; Chip
clip and Fidget spinner at the Dragon.

Gates: the base kite still lifts off in Gentle with no doodad; "the spinner kite does not lift off
below Blustery"; "the bell rings within a second of a gust peak" (through a test hook, the audio
gate reads the bed); the 76 sim assertions rerun; an old save with no doodad field loads; the shelf
at 48 px; copy law.

## Order

1. Airworthy first, after the crease 1 fix is live, because `derive` already has the hooks: about
   a day (table, shelf, drawings, the bounce, medals re measured, gates, shots).
2. Updraft second, after the depth build (kite shapes, visible wind, the sun by hour) lands, because
   the wind display is what makes the Bell and the Whistle information rather than noise: about a
   day.
3. Nothing in either bank is a store. If a store is ever wanted, that is the fleet decision in call
   26 and it is Stephen's.

## What I would put in front of Stephen before building

The two tables above, and one question: is eight the right size for a bank, or does he want the
brainstorm first? My call: build these eight in each, because every one is a thing a kid would
really tape on, and let the brainstorm add to a bank that already flies.
