# Moongraft (working name)

The room grows one plant together, blind, and everybody keeps the card.

**This is the only title in the pack with no scores, no voting and no losers,
and that is the point.** A party needs somewhere for the person who does not
want to be quizzed. The artifact is the reward. `gameComplete` still fires, so
the server still mints for every participant.

## Files
| file | what it is |
|---|---|
| `content.js` | `window.MOONGRAFT_LAYERS` (8 layers with zones and briefs), palette, brush widths |
| `host.js` | host screen, layer assignment, compositing, name and poem |
| `player.js` | phone screen, the drawing surface |
| `game.css` | both screens |

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (NEXT cuts it short) | the four rule lines | what is about to happen |
| `draw` | 70, three times | who is drawing and how many have started, never WHAT | your brief, your hint, your surface, palette and tools |
| `grow` | 15 | the plant assembling a layer at a time, then its name, poem and the people who grew it | the finished plant, its name and its poem |
| `gallery` | none | all three plants on a shelf, then GROW MORE, ANOTHER GAME, END NIGHT | what you helped grow |

## The three ideas that make it work

**One layer each, always.** The layer set grows with the room. Three players get
pot, bloom and leaves; eight get all eight. Nobody ever draws two things and
nobody is ever idle.

**Each layer owns a rectangle of the card, and the phone shows that rectangle as
the WHOLE surface.** So you draw big and comfortable on a small screen and it
still lands in the right place at the right size. Without zones you get eight
drawings stacked on top of each other and a smear.

**The phone names the layer that meets your top and bottom edge.** Told that the
pot is waiting just under your edge, a person draws their stem DOWN to that
edge. Without it everybody draws a shape floating in the middle of their box and
the plant never joins up, which is the classic way exquisite corpse fails. It
leaks a word, never a picture, so the drawing stays blind.

## The name and the poem are the real ones
`host.js` pulls `/word-banks.js`, the same file Lucid Winds ships, and the
selection maths is lifted from `getHaiku` and `getPlantName`. A Moongraft card
reads exactly like a greenhouse card. The hash is computed from the drawing
itself, so the same plant always gets the same poem and a different plant never
does. If the banks somehow fail to load the card still renders and simply
carries no poem, which is honest.

## What goes over the wire
Quantised integer point arrays, never images. Coordinates are 0 to 1000 within
the layer's own rectangle, points closer than 7 units to the last one are
dropped, and a stroke is capped at 260 points with 220 strokes per player.
Strokes are sent after EVERY stroke, not at the end, so a phone that locks
mid round has still contributed everything it had drawn.

The phones rebuild the identical composite from the same arrays at the reveal.
**The renderer in `player.js` is a deliberate twin of the one in `host.js` and
the two must stay identical**, or the card a player keeps would not be the card
the room saw. Any change to one is a change to both.

## Storage
None. The shell owns everything.

## Proof
```
node party/test/drive.js moongraft 4
```
The autopilot draws real pointer strokes on the canvas. Tapping buttons alone
would have driven this to a gallery full of blank canvases and reported it
proven.
