# NOTCH decisions (the smallest reasonable choice, logged instead of waiting)

- 2026-09-16 **Enter or Space lets go on the bench.** A task at 0 degrees of disparity is dealt already within its tolerance. A
  pointer seats it with a tap (a press and a let go with no turn); the keys had no let go, so a keyboard child had to turn it off
  the notch and back, two presses for a piece already home. Found by the turn gate's law 6 red on seed 4242 (`start 0, presses 2,
  want 0`). Enter or Space now runs the same seat check a let go runs, so it seats only a piece within its tolerance, never a
  mirror, never a piece off the notch (3.5's law that no key press seats a piece outside its tolerance holds).
