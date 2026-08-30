# What the ceremony looks like

Regenerate with `node tools/cershots.mjs`, or at another phone size with
`RC_W=320 RC_H=568 node tools/cershots.mjs`. It plays real rounds until a match
actually ends, then saves every beat.

These four are kept because each one is a bug that was fixed by looking at it:

- `02-drop-early` — the launch beat. It eased OUT at first, which is backwards
  for a falling object: a cubic covers 92 percent of the distance in the first
  60 percent of the time, so by 380ms the drop was over and the screenshots
  showed two tops sitting still.
- `05-narrow-320` — the reveal card at 320 by 568. A centred flex column taller
  than the viewport pushes its top above the scroll origin, which has cost this
  studio the menu twice.
- `06-beat-match-won` — the celebration. At 86 percent over a 3px blur the
  backdrop erased the dish and the win screen was green text on black.
- `08-beat-new-part` — the comparison. It printed percent change, so a blunt
  blade to a sharp one read `TEETH +355%`. And the tick showing what you are
  wearing was two cream pixels inside a clipped bar: present, measurable at the
  right offset, invisible.

The most expensive one is not in these frames, because it was the ABSENCE of
change: `AUDIO.click()` does not exist, so Fit it threw before it advanced and
the ceremony sat on the first card forever. Ten identical screenshots in a row
is what that looks like.
