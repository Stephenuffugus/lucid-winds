# INKSWING, build notes

What is here, what it costs, and the scars.

## The shape

One file, `index.html`, no framework and no build step. Inside it:

```
SIM_EXPORT_START .. SIM_EXPORT_END     the rules: CONFIG, RNG, NOTES, RIGS,
                                       MOTION and FLING. No document, no window,
                                       no clock, no unseeded die, no audio node.
TEST_EXPORT_START .. TEST_EXPORT_END   87 assertions over that block.
THE PAGE, THE SHEET, THE RIG DRAWN,    everything a browser needs.
THE THROW, SOUND, THE POSTER, SHARE,
INPUT
```

**The one law: THE DRAWING IS ITS THROW LIST.** A sheet is a list of throws, each
one an initial position and velocity and a start time, and everything else is
derived from it. The line on screen, the poster at two thousand pixels and the
drawing that comes back out of a shared link are all the same numbers evaluated
at different resolutions. `test/share.mjs` is what holds this: it builds a sheet
in one browser, opens the link in a second browser that has never seen the game,
and requires the two pens to be in the same place at the same time all the way
through. Not the same picture by eye. The same numbers.

## The gates

`node tools/check.js` runs seven, in this order:

| Gate | What it holds | Assertions |
|---|---|---|
| `sim` | the motion, the rigs, the note ladder, the fling | 87 |
| `lint` | the studio laws in the source | |
| `fling` | a real pointer path throws the bob and the line that comes out | 31 |
| `sound` | the hum rendered into an OfflineAudioContext and measured | 17 |
| `share` | a link redrawn in a browser that has never seen the game | 19 |
| `poster` | a 2048 by 2560 PNG with ink on it and a caption in its bottom rows | 16 |
| `layout` | rendered pixels at 412, 375 and 320, reachability by elementFromPoint | 69 |

Every assertion in every gate has been watched to fail at least once.

## The scars

**⛔ Two of the sound assertions passed with the code under them deleted.** They
were rewritten. This is the reason every assertion here has been watched to fail
rather than watched to pass.

**⛔⛔ The layout gate's most important assertion could never fail, for its whole
life.** It checked that no button sits on the paper, over the list
`btnKeep, btnTear, btnUndo, btnFinish` — and every one of those is `hidden`
until a sheet has a throw on it, so the check ran over an empty list every time
and said the layout was clean. The same was true of the music chip corner check,
and `btnShare` was in neither list. It was found on 2026-09-06 by opening a
screenshot and seeing UNDO sitting on the paper while the gate was green. The
gate now loads a drawing and lets the frame run before it measures. Three real
layout faults were under it, all fixed:

- the sheet was centred in the full width, so its right third ran under the ink
  rail and the colour chips covered the drawing;
- the sheet hung from the top of its band, so on a 412 by 915 phone, where the
  width binds, three hundred pixels of empty floor opened between the paper and
  the buttons;
- the actions were a column of four up the right side, 224 px tall, reaching into
  the paper, and four different widths right aligned into a staircase. They are a
  two by two block in the bottom right now, one width, every edge shared, and the
  band they reserve fell from 186 px to 152 px so the drawing got bigger on every
  phone.

**⛔ `inked()` samples every seventeenth pixel and says so in its own name's
comment.** Returned as a raw count it reads seventeen times too small, and a gate
written against it asks for a drawing and accepts a dot. There is an
`inkedFraction()` next to it because a count in pixels measures the LAYOUT as
much as the drawing: making room under the paper for the buttons shrank every
layer and every gate written against a raw count went red on a drawing that was
perfectly fine.

**⛔ `canvas.width = ` clears the context**, so the device pixel ratio transform
is set after it, not before.

**⛔ A MutationObserver that removes the class the observer watches** is a loop
that hung the render thread and timed the shot tool out. The first boot hint is
emptied and pushed off screen instead, and it is dismissed before the shutter
rather than suppressed in the game.

## What is not done

- ~~The Double Link, P3 step 4 of the plan~~ built 2026-09-06 afternoon: see
  `DECISIONS.md`, P3 step 4. Twelve more assertions in `sim.js --test` (99),
  seven more in `test/fling.mjs` (38), `docs/shots/p3-double.png` and
  `p3-double-375.png` opened.
- The equal tempered slider question in the plan's section 15, which is a
  Director call and not a bug.
