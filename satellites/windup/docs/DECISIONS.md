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
