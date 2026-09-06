# WINDUP, build notes

What is here, what it costs, and the scars.

## The shape

One file, `index.html`, no framework and no build step. Inside it:

```
SIM_EXPORT_START .. SIM_EXPORT_END     the rules: CONFIG, RNG, STRIP, RULES, the
                                       link and gift formats, SEED, and the
                                       tine's numbers. No document, no window,
                                       no clock, no unseeded die, no audio node.
TEST_EXPORT_START .. TEST_EXPORT_END   119 assertions over that block.
VOICE, BOX, CRANK, PLAYER, MECHANISM,  everything a browser needs.
PUNCH, SHELF, GIFT, EXPORT, INPUT
```

**The one law: THE STRIP IS THE CLOCK.** A note sounds when the read line
crosses its hole, and the read line moves only when the crank turns. The auto
play is the single exception and it never runs while a finger is on the crank.
`test/crank.mjs` is what holds this: it drives a real pointer in a circle and
measures what the game does with it. Advance the paper by wall time instead and
two turns read 11.0 eighths instead of 18.8.

**The engine is bound to a context it is handed**, never to one it reaches for.
That is the only reason `test/tine.mjs` can render a note into an
`OfflineAudioContext` and measure it.

## The gates

```
node tools/check.js            all eight
node tools/check.js --fast     skips the slow ones and says which
node sim.js --test             119 assertions, no browser
node sim.js --play=twinkle     the note events of a starter, printed
node tools/shots.mjs [filter]  the evidence
node tools/thumb.mjs           the portal tile, measured before it is written
node tools/tinewav.mjs         the file Stephen listens to, ditto
```

| Gate | What it is for |
|---|---|
| `sim` | the rules, the link, the gift, the seed melody, the starters, the tine's numbers |
| `lint` | the studio laws, and that no timer anywhere fires a note |
| `tine` | a note rendered offline: it starts, it rings, it decays, and fifteen at once do not clip |
| `crank` | the strip is the clock, and the punch editor punches and refuses |
| `gift` | a link made in one browser and opened in another that has never seen the game |
| `pdf` | the printable strip: a real PDF, one page per 250 mm, every hole drawn |
| `layout` | 48 px at three sizes, the music chip's corner, and every row takes a tap |
| `wav` | the file made for a person to listen to contains the notes it claims |

## Scars

- **The plan's link format could not meet the plan's size claim.** Three bytes a
  hole is 1204 base64 characters for three hundred holes. Holes are sorted, so a
  link only needs the GAP since the last one, and a gap and a row both fit in a
  nibble: 404 characters, and Twinkle costs 60.
- **A decay read the obvious way is a click.** Ramp a note from its peak to the
  floor over 1.8 seconds and it is at eight tenths of one percent of its loudest
  a second later. A tine falls twenty decibels in that time and carries on down
  the same slope.
- **A limiter has an attack and a comb does not.** Fifteen tines struck on one
  eighth put fifteen clicks through a three millisecond attack and peaked at
  0.997. A tanh knee after the limiter holds it at 0.949.
- **The margin is part of the mapping.** Start the read line at exactly step zero
  and a hole at step zero never sounds. Start the LINE in the margin but leave
  the mapping measuring from zero and the first note plays the instant a strip
  loads, before anybody touches the crank.
- **⛔ A GATE THAT TAKES ITS COORDINATES FROM THE THING IT IS TESTING CANNOT SEE
  A THING IN THE WRONG PLACE.** The ribbon end of a gift was off the right edge
  of the phone. Nobody could have opened the present. Every assertion passed,
  because the gate asked the game where the end was and then tapped there. Ask
  the screen: inside the viewport, room for a thumb, and `elementFromPoint`
  agreeing nothing is on top of it.
- **A count of timers is a proxy for a law, not the law.** "Nothing schedules a
  note by wall time" written as "at most four setTimeouts" cried on correct code
  the moment the exporter needed one to stop a recording and one to revoke a
  blob URL. It reads the body of every timer now.
- **A regex for a call must not match prose.** `\btine\s*\(` matched the words
  "for the tine (2 steps)" in an assertion string and reported the game as
  broken while it was correct.
- **A tall phone is not a bigger phone.** Hung off the bottom of the screen the
  case sat in the lower half of a 412 by 915 phone with two hundred and eighty
  pixels of empty cloth over it. The case grows with the screen and the assembly
  is centred in what is left.
- **The bottom left 120 by 120 belongs to the fleet's music chip.** Centred,
  PUNCH's left edge lands at 95 px on a 320 wide phone.

## What nobody has done

Nobody has played this on a phone and nobody has heard it. The headless browser
runs with `--autoplay-policy=no-user-gesture-required`, which is the one flag a
real phone does not have. And nobody has printed a strip and laid it on a real
one, which is why the PDF says beta.
