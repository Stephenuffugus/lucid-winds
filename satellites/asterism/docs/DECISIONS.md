# Asterism decisions log

Every choice the build made that the design and the plan did not make for it, newest last, one bold
line of what and one line of why (HANDOFF-ASTERISM section 10). Numbers live in CONFIG; the design is
never edited.

## P0, the astronomy

**2026-09-05 — the moon phase comes from the real elongation, not from a mean lunation.**
Why: the plan specifies `((JD - 2451550.1) / 29.530588853) mod 1`, which is right to about six parts in
a thousand at the January 2000 new and full moons. The elongation of the moon from the sun is three
times closer, and it is free, because both ecliptic longitudes are already computed for the sky and
the palette. The gate asserts both moments to within 0.01 of a cycle.

**2026-09-05 — `unproject` uses `c = 2 atan(rho)`, not `c = 2 atan(rho / 2)`.**
Why: the forward map uses `k = 1 / (1 + cos c)`, which is the standard stereographic `2R` form with R a
half, so the inverse takes `2R = 1`. The textbook R = 1 version was in there and it was out by 38
degrees at the edge of a 90 degree field. Nothing else could have found it: every star still lands
somewhere plausible, and only a tap would have been wrong, silently, forever.

**2026-09-05 — the myth corpus is 290 fragments across FIVE archetypes, not four.**
Why: the plan groups a loop as "creature or vessel" and gives them one pool of nouns and one of deeds.
A copper kettle then kept the mice honest for eleven years and a boat with a patched hull answered a
knock nobody else heard. Charming twice and nonsense the rest of the time. A loop now picks creature
or vessel on a seeded coin and each has its own twelve nouns and ten deeds.

**2026-09-05 — star counts are written as words.**
Why: "3 stars, and the last one shakes hands with the first" reads as a receipt. "three stars" reads as
a myth. Numbers up to twenty are spelled.

**2026-09-05 — a shape sits IN its region, it does not border it.**
Why: the region a myth names is the most common region among the shape's OWN stars, so "it borders the
Bull and keeps to itself" was wrong about a shape made entirely of stars in Taurus.

**2026-09-05 — the myth gate skips its reachability check below 2000 seeds and says so.**
Why: three hundred seeds over four shapes leaves about thirty per archetype, and a twelve fragment list
legitimately misses one. The gate was red on correct code, which teaches you to ignore it.

## P1, the sky and the pen

**2026-09-05 — the magnitude curve: size and brightness both fall off, hard, with a floor.**
Why: the plan's linear 4.5 px to 1.2 px put almost the whole catalogue between one and two pixels,
because almost every star in it is magnitude three to five. The Summer Triangle was three more pieces
of confetti. Magnitude zero is now about five times the area and three times the alpha of magnitude
four, and the tint pulls back toward white as a star dims, because a faint star has no colour to the
eye. The first correction overshot and left five bright stars in a void, which is the same mistake
upside down; the alpha floor is 0.32.

**2026-09-05 — the Prompt of the Night card passes pointer events through.**
Why: its GOT IT button sat exactly on Vega at 375 wide on a first ever night, so the card ate the star
it was inviting you to draw. The button is gone entirely and any tap on the sky puts the card away.

**2026-09-05 — `.row > *` is `flex:1 1 0; min-width:0; width:auto`.**
Why: two buttons in a row each carried `width:100%` and `max-width:330px`, so the second hung off the
right edge of its sheet. On the myth sheet, SHARE was half off the screen and every gate was green,
because the page level scroll check misses it and `scrollIntoView` hid it a second time.

**2026-09-05 — `#cityList` has a real height and `flex:0 0 auto`.**
Why: with only a max height it collapsed to two pixels at 320 wide, inside a flex column, and every
city in it was clipped away. The fleet has this written down as "a scroll row in a flex column clips".

**2026-09-05 — the place chip shows longitude time and says "about".**
Why: reading the device's own hours put Columbus at four in the morning on a rig sitting in UTC. The
app has no time zone table by design (plan 3.7), so local time is longitude time and the chip never
claims a minute it does not know.

**2026-09-05 — a picked star glows; it does not get a ring.**
Why: a thin circle beside the star's own glint cross read as a gunsight, which is the wrong idea for a
thing you are about to make up a story about.

**2026-09-05 — the myth sheet reserves its height before the typewriter starts.**
Why: typing into a box that grows pushed ANOTHER, SHARE and KEEP IT down the screen under the reader's
thumb for four seconds.

## P2 and P3

**2026-09-05 — the poster frames the field to the shape, not to a fixed 60 degrees.**
Why: a three star constellation was a small mark in the middle of a 2048 by 2560 print.

**2026-09-05 — the toast is a snackbar at the bottom edge.**
Why: at twelve percent from the top it sat over the poster preview, over the almanac list, and over the
sky itself.

**2026-09-05 — the Milky Way is drawn from the IAU galactic transform, dim and mottled.**
Why: it has to be in the right place, so `galToEq` is asserted against the published position of the
galactic centre at 17h 45m 40s and minus 28.94 degrees. The first pass was three times this bright and
smooth, and it read as a searchlight across the sky, washing out the faint stars the pale road is made
of.

**2026-09-05 — the arcade tile is panned so the shape is centred.**
Why: at the default view a square tile cropped Vega off the top and left the right two thirds empty.

**2026-09-05 — the thumb tool checks that its own tile has a sky AND the gold shape in it.**
Why: counting bright pixels alone put the bar in the wrong place and rejected three good tiles; a real
star field on a 512 square is about one percent bright pixels.

**2026-09-06 (Opus) — the first screen of a game about the sky now shows the sky.**
The how screen painted the flat ink colour over the canvas, so the first thing a new
player met was three lines of type in a void, and the sky had to be taken on trust until
they pressed GOT IT. It is a veil now, a gradient of the same ink at 82, 62 and 86 percent
down the screen, so the real stars, the real Milky Way and the real horizon are behind the
words and the words are still comfortably readable over them. The three lines are centred
under the title as well; left aligned against a centred word the block read lopsided. The
layout gate is unchanged and green: nothing moved, only what is behind it.

**D-C1 (2026-09-07, Opus) — something stands on the land.** The look pass named the bottom
quarter of a tall phone as a flat field, the same spare band Airworthy, Doohickey and Inkswing
all had. The ridge was drawn and then nothing stood on it and nothing was nearer than it, so the
land was a colour rather than a place.
- **A treeline on the ridge**, conifers and round crowns as silhouettes, because at that distance
  a tree is a hole in the sky.
- **A fence across the lower band**, with two rails and posts, running a little off level and
  higher at its far end because it is further away, and the grass grows thicker at the feet of
  the posts.
⛔ SEEDED FROM THE PLACE, never from the clock, because this file's own promise is that "a place
gets the same horizon every night".
⛔ AND THE FIRST FOREGROUND WAS A ROW OF GRASS HEADS at one height and one spacing along the
bottom edge, which read as a barcode and left two hundred and forty pixels of flat ground between
it and the trees. A foreground needs a REASON to be there, which is the lesson Whistlestop's
unmotivated props taught: you are standing at the edge of a field looking up, so there is a
fence, and it is one object with a middle plane rather than a scatter.

**D-C1b (2026-09-07, Opus) — the gate measures a COLOUR CLASS, not a region, and it took three
goes to see that.** Counting how many pixels differ from the modal colour in a band read 21.5
against 19.2 at 375 over the bottom quarter, then 22.9 against 19.9 over 0.78 to 0.94, then
NOTHING AT ALL over a band anchored to the ridge's own foot: the first two still held sky, whose
gradient dominated the count, and the third excluded the fence entirely at the shorter sizes
because the ridge dips lower there. A region that has to be right at three aspect ratios is the
wrong tool. Anything STANDING on the land is darker than the land, wherever the ridge falls, so
that is what is counted: 3.89, 4.09 and 4.11 percent with the furniture and exactly zero without,
at all three sizes. It is a class and not a constant, so painting the trees a different dark
still holds it.


**D-C10 (2026-09-07, Opus) — the preview is its own layout, and the export is untouched to the
pixel.** The poster's every size is a fraction of its own width, which is right for a 2048 px
file and wrong for a 720 px canvas shown at 360: the credit and the star data line came out at
5.2 and 3.7 CSS px and the myth body at 8, under the fleet's 0.7 rem law, on the screen a player
actually looks at. Neither the rem lint nor the canvas font lint could see it, because the size
is computed and the scale is a CSS rule in another file.

**What did not work, and it was tried and shot before it was thrown away:** flooring the type
alone. Every BOX is sized from the same fractions the type is, so floored type overran the myth's
box, the footer's three lines landed on top of the myth and each other, and the credit ran off
both edges of the poster. A floor is not a layout.

**What the preview is now.** `mn` being nought is the export and every line of it is the code
that was there before. With `mn` set:
- the myth's LEADING follows the type, and its LINE COUNT is whatever fits between the rule under
  the chart and the top of the foot, so it can never overrun whatever the type turns out to be;
- the FOOT has a band of its own, six and a bit lines deep, and its three lines WRAP and walk down
  a cursor, so a wrapped line pushes the next one instead of covering it;
- and the CHART gives way, 58 percent of the height to 44. Something had to: the poster's own
  proportions do not leave room for a legible myth and a legible three line credit in nine hundred
  pixels. It is the same picture with less sky around it, which is what a preview is for.
- A line under the canvas says the preview shows the start of the myth and the poster carries all
  of it, because it does: two lines here, twelve in the file.

**D-C10b (2026-09-07, Opus) — three assertions, because the fault had three shapes and a size
check can only see one of them.**
1. The smallest type is 0.7 rem ON THE SCREEN, measured in the pixels a player looks at. Red at
   3.56 with the floor removed.
2. Nothing overlaps and nothing is clipped, measured as the clear rows between the myth block's
   last ink and the foot's first, and the margin under the last ink of all. Red at 0 px of bottom
   margin with the foot band back at 5.2 lines. ⛔ A size check cannot see an overlap: every font
   size involved was correct while the myth was landing on the credit.
3. ⛔ AND THE PREVIEW STILL SHOWS A MYTH. Nothing overlapping is not enough: with the chart left
   at its poster proportion the sum simply says no line fits, the preview shows a title and a
   credit and no words at all, and that passes every overlap check ever written. Red at minus one
   line with the chart mutation.

**Eight meteor showers, and the dates are from memory.** 2026-09-07. The Quadrantids,
Lyrids, Eta Aquariids, Perseids, Orionids, Leonids, Geminids and Ursids, with their radiants and
their peaks, **taken from memory of the standard almanac tables and not from a source fetched for
this build**, which is said out loud because the rule is to say it. They are good to about a
degree, which is a drawing's accuracy and not an ephemeris's.
**Why they belong here:** the almanac is the reason to open this app on a NIGHT rather than on any
night, and "tonight the Perseids fall" is the only thing it can say that is true of that evening and
not of every evening. On a shower night the prompt is the shower.
**A meteor is the subject, not atmosphere.** The fleet's law is no ambient particles unless they are
information; here the information IS the meteors. They come from the shower's radiant and nowhere
else, there are none at all on any other night of the year, and they fall only while the radiant is
above the horizon, because a Perseid drawn while Perseus is below it is a lie about the sky and this
app's whole claim is that the sky is the real one.
⛔ **THE PROMPT READS THE SKY'S CLOCK, NOT THE WALL'S.** It read `nowMs()` first, so a player who
scrubbed the time to August would watch meteors fall while the card talked about something else, and
my own probe read "no shower" on a night the sky was full of them. `G.whenMs` is what the sky is
drawn from; one clock.
⛔ **AND MY FIRST FOUR PROBES ALL READ THE SAME WRONG NIGHT.** Passing the date on the base url put
it in the PATH and the harness appended its own fixed `t=2026-07-15` after it, so every run measured
15 July, a night with no shower on it, which is exactly the answer a broken feature would give. The
harness has a `query` option and that is what it is for.
**The assertions are PREMISES**, never positions: a gate that said "the Perseids peak on the twelfth"
would only be reading the table back to itself. Every radiant is on the sky, every window is one a
person could miss but not by much, **no two showers run on the same night** (the Geminids and the
Ursids are eight days apart and are the pair that makes it worth asserting), every shower is found
on its own peak, and **most nights of the year have none**, which is what makes the ones that do
worth opening the app for.

**D-P27 (2026-09-08, Fable's builder) — the pen closes a loop, and undo takes back the last
thing done.** Stephen's line 27 from the Sep 07 phone test: "I can't complete like a loop. If I'm
doing a loop and maybe intentional I don't know." It was not intentional. Since P1 a tap on a star
already in the chain moved `from`, chimed, and drew nothing, so `features()`'s loop rule, `SHAPE.loop`
and the creature and vessel myths were unreachable from a phone while the plan, the design and two
prompts of the night promised a shape that closes. His answer to the sort: "keep building detail if
we want to be able to have a full sequence connect at the end okay."
**The rule, in one place.** `drawTap(d, hip, now)` inside the ASTRO export, so `sim.js` taps the same
code the thumb does. The pen stands on the last star, or on `from` once a tap has moved it there. A
tap on a star already in the chain draws a line from the pen to it if there is not one (a close), and
the next new star leaves from it (a branch): both halves of the design line. Tapping the star the pen
stands on at the end of the chain is still undo. **Two stars tapped back on the first only move the
pen**: they have their one line already, and two stars and one line are not a loop; nothing is ever
drawn twice.
**Undo is per THING done, not per star.** `acts` carries one letter per action, `'s'` for a star with
the line that brought it and `'e'` for a closing line. UNDO after a close takes the closing line and
keeps the stars; UNDO again takes the last star. The old undo would have eaten the third star of a
closed triangle, lines and all, when the player only wanted the close back. A closing line never
touches a star added after it, so the two kinds never tangle.
**The tell.** The closing line eases in like any other and for `CLOSE_PULSE_MS` (900) wears a wider,
brighter glow that fades (wide strokes, never shadowBlur); the label reads "Vega, and it closes" for
one and a half label lengths, and the label is now clamped to the screen because that is longer than
a name; and `AUDIO.close` rings the star's note and the fifth above it 90 ms later, each voice starting
when its envelope starts. The close is in the ear gate's loudest minute at one every 1.5 s: peak
0.369, rms 0.0545, 0.39 percent above 3 kHz; the second note started at t0 with its envelope late
read 1.200 and went red.
**Copy.** A fourth line on the how screen, "Tap your first star again to close the shape." GOT IT is
on the screen with no scroll at every width (643 of 667, 544 of 568), asserted in `layout.mjs` before
`centre()` gets to scroll it into view.
**Found on the way.** A SHAPE fragment that starts with `{N}`, or carries one after a full stop,
opened a sentence lowercase in shipping myths ("It shuts. three stars, and no way out of it."). Every
sentence in the fragment opens with a capital now, and the corpus gate refuses a lowercase sentence
opener anywhere in a myth.
