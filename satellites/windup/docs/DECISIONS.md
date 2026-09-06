# WINDUP, the calls made while building it

Every one of these is a place the plan or the design left a choice, or was
wrong, and what was chosen instead. Written as it happened.

## P0, the voice and the rules

- **One byte a hole, not three.** The plan asked for `step u16, row u8` and for
  three hundred holes to fit in a kilobyte, and those cannot both be true: three
  bytes a hole is 900 bytes and base64 makes that 1204 characters. Holes are
  sorted, so what a link needs is the GAP since the last one, and a gap of
  fourteen eighths and a row on a fifteen tine comb both fit in a nibble. Three
  hundred holes now cost 404 characters and Twinkle costs 60. The high nibble 15
  escapes to a two byte gap for a longer rest; the low nibble can never be 15
  because the comb stops at row 14.
- **The decay is the time to a TENTH, and the envelope carries on past it.**
  Ramped straight from its peak to the floor over `TINE_DECAY_LOW_S`, a note is
  at eight tenths of one percent of its loudest a second later: on paper it
  decays over 1.8 seconds and to an ear it is a click. A tine falls twenty
  decibels in that time and keeps going down the same slope, which is what
  leaves it ringing quietly a second later. The render gate measures it: 26
  percent of the peak window at 1.2 seconds, and the difference between the top
  and the bottom of the comb comes out at 1.05 seconds against the 1.00 the
  config asks for.
- **A soft ceiling after the limiter.** Fifteen tines struck on one eighth is
  one hole in every row, which a player can do, and fifteen attack clicks walk
  straight through a compressor's three millisecond attack: the render peaked at
  0.997. A tanh knee after the limiter holds it at 0.949 and bends the top off a
  chord instead of squaring it.
- **AUTO_BPM is in quarter notes and a step is an eighth.** Read as eighths a
  minute it makes every note of Twinkle a second and a quarter long, which is
  not a music box, it is a doorbell winding down. `stepSeconds()` is the one
  place that says so and the suite asserts it.
- **Happy Birthday opens on two of the same note**, and on a real box those
  cannot be an eighth apart, because the tine is still moving. The starter is
  punched with them a quarter apart, which is what a real strip does, and there
  is an assertion about it so nobody quietly "fixes" the rhythm later.
- **The engine is built on a context it is handed**, never on one it reaches
  for. It is the only reason `test/tine.mjs` can render a note into an
  `OfflineAudioContext` and measure it, and an engine that cannot be measured
  cannot be trusted.
- **The jitter is keyed by the hole's index, not by a counter.** A gift has to
  sound the same on the recipient's phone as it did on the sender's, and it only
  will if the detune and the level are functions of the strip.
- **The wav tool measures the file before it writes it.** It autocorrelates the
  first two notes and refuses to write one that does not contain the pitches it
  claims. The only ear in the studio should not be spent on a file that is ten
  seconds of the wrong note.

## P1, the box, the crank, the punch

- **The paper runs edge to edge THROUGH the case, and a length of it hangs out
  of both sides.** The first drawing put the strip in a window inside the box
  and it read as a panel with dots on it. A strip going in one side and out the
  other is the one thing that says music box at a glance.
- **The case ends above the crank and a walnut bracket holds it.** Drawn to the
  plan's hub position with the box the height it wanted, the handle swept across
  the comb and the knob hung off the side of the case, which is not where a
  crank is on any music box ever made. Then, mounted on a bare shaft, it read as
  a lollipop lying on the cloth.
- **The mouth shadow is a light touch.** At the strength it was first drawn, the
  top and bottom of the strip went into shadow inside the case, so the highest
  and lowest rows, the ones a player has to aim at, were the darkest thing on
  the screen.
- **The test keyboard is TEST MODE ONLY and it was not.** Fifteen key buttons
  sat across the bottom third of the very first shot, on top of the PUNCH
  button. It is behind `?keys=1` now.
- **PUNCH moves to the right hand corner under 360 px wide.** Centred, its left
  edge lands at 95 px on a 320 wide phone, inside the 120 by 120 the fleet's
  music chip owns.
- **A hole is drawn at half the row pitch, not a third.** At seven pixels a row
  a hole drawn at a third of that is a speck, and the strip read as a white band
  with grey specks on it. The paper is warmer and a shade darker for the same
  reason.

## P2, the gift

- **The margin is part of the mapping, and two bugs lived there.** Start the read
  line at exactly step zero and a hole at step zero is never crossed, so the
  first note of every song a player punches is silent. Start the LINE in the
  margin but leave `stepAt` measuring from zero and the line leaps the whole
  margin on the first frame, so the first note plays the instant a strip loads,
  before anybody has touched the crank. `stepAt` subtracts the margin, and the
  read line begins where the box grips the paper.
- **The gift link is a stranger's text and it is treated that way.** The holes
  are clamped by `unpackStrip`, the name is cut at 60 bytes, the signature at 40
  and the dedication at 140, and everything that reaches the DOM goes through an
  escape. A four hundred letter name and a nine hundred letter dedication are in
  the suite.
- **⛔ THE RIBBON END WAS OFF THE SCREEN and the gate could not see it,** because
  the gate asked the GAME where the end was and then tapped there. Hung off the
  right of a box that is nearly the full width of the phone, neither the end nor
  the words under it were on the display, and every assertion still passed. The
  gate now asks the SCREEN: the end has to be inside the viewport with forty
  pixels of room around it, and `elementFromPoint` has to agree nothing is on
  top of it.
- **Sixty pixels of real drag, not a tap.** A present you open with a tap is a
  dialog. Let go short of it and the ribbon springs back.
- **A gift is not saved until the recipient says so.** It opens as a parcel, it
  plays, and only SAVE TO MY SHELF puts it on their shelf. The suite checks that
  a freshly opened link leaves the shelf holding only the three that come in the
  box.
