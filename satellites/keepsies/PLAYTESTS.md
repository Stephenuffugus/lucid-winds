# Keepsies playtests (the Director's own words, dated)

The first entry is Fable's, from a review pass with real pointer events on a headless phone sized
screen. It is not a thumb: it cannot feel weight or the snap, so it answers what it can measure and
leaves the two K1 questions open for Stephen. His entry goes above this one when he has played.

## 2026-09-04, Fable, 375 x 667, twelve matches, before and after the fixes

**How it was played.** A driver that boots the real page, taps every button by what is under its
centre, and snaps by dispatching `pointerdown`, a real time brace of `pointermove` events, a burst of
moves timed in real milliseconds and a `pointerup` on the canvas. The physics runs to rest through
the dev hook because the software rasteriser draws at two and a half frames a second; everything the
player touches is the real path. Nothing here went through `_feed()`.

**What I hit, in the order a person meets it.**

1. **The second calibration snap did nothing.** One counted, then the camera cut to a marble on the
   far side and no thumb was answered. Dusty was in the calibration world and the turn had passed to
   him. This is the first thing anybody would have found on a phone. Fixed: calibration is one player.
2. **"That was a wild one" on every clean shot.** Twenty straight flicks in a row, all called wild.
   The last 90 ms before release includes the still hold, and the hold's sub pixel jitter reads as a
   hook. Fixed by reading the snap from where the thumb started moving. After: clean flicks read 0.00,
   a hooked path reads 0.72, and the speed of a hard flick reads 1.84 m/s where it read 0.99.
3. **The reticle never went gold on a still hold** on this rig, and would have gone gold in 0.6 s on
   a 120 Hz phone: the settle was counting pointermoves. It is a clock now. Held still for 1.4 s the
   reticle reaches 48 px and gold every time.
4. **Dusty broke the cross in the beat that teaches you to break the cross**, when he won the lag,
   and the sticking lesson was on screen before my first snap. The player shoots first in beat 2 now
   and the beats only listen to the player's shots.
5. **The setup screen cut off its own title** once the stakes were on it, and BACK was below the
   fold. The rules card and setup had the chalk ring reading through them as a pale stripe across the
   chips. The collection's BACK button was transparent and the heading scrolled through it. All CSS.
6. **A purple Banana.** The six cat's eyes were coloured by hash. They carry their names now.

**Numbers a thumb will want to know.**

| thing | measured |
|---|---|
| calibration, three hard flicks | 1.50, 2.07, 1.39 m/s thumb; stored max 1.96 |
| a hard straight flick after that | power 0.78 to 0.93, launch 5.3 to 5.8 m/s |
| the break, 7 ft, fully braced | 3 mibs out |
| a medium backspin flick (~0.35 power, 2.9 m/s) | STUCK: shooter at rest 2.8 cm from the mib it hit, the referee called Sticking |
| the same flick harder (5.5 m/s) | blew through, two out, rest 1.12 m away: the stick has a window and it is the soft half of the range |
| a straight flick down the arm of the cross | a 2 degree error misses the whole arm; the shot the tutorial points you at is the knife edge shot |
| Rookie Dusty at 2.5 degrees, before | won 11 of 11 matches; at 7 ft pocketed 6 in 6 once the cross was open |
| Rookie Dusty at 5 degrees, after | see the ledger box in HANDOFF-KEEPSIES.md, measured after this entry was written |

**What I could not answer and Stephen can.** Whether the snap feels like a snap, whether the marble
weighs anything, whether 4 seconds of settle is too long, whether 16 mm at ten foot reads. The one
thing I would watch for first on the phone: the hold. If the reticle takes longer than about a second
and a half to go gold with a genuinely still thumb, the jitter threshold (2 px in `knuckle.js`) is too
tight for a real finger and wants to be 3 or 4.

**What I left alone on purpose.** The three Director calls. The sticking beat's deadlock guard (a
player who never sticks is released at the end of the match), which is right. The ten foot ring's
speck sized mibs, which is real scale and a camera question, tried in a contact sheet and recorded in
DECISIONS.
