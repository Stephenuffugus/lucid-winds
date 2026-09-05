# Swell decisions log

Every choice the build made that the design and the plan did not make for it, newest last, one bold
line of what and one line of why (HANDOFF-SWELL section 10). Numbers live in CONFIG and in the mood
data; the design is never edited.

## P0, the theory

**2026-09-05 — voice leading takes the nearest FREE tone that keeps a voice above the one below it.**
Why: the plan's rule, the nearest tone per voice chosen independently, collapses all three onto one
note inside four chords, and its own assertion, no voice moves more than six semitones, is perfectly
happy about it, because a unison is the smallest possible move. A section playing one note in
triplicate is not a chord. Four new assertions cover what a unison passes.

**2026-09-05 — `chordPitches` stacks its notes ascending from the home octave.**
Why: placing each pitch class at `base + pc mod 12` scrambled the voicing, so Storm's tonic came out
57, 60, 64 in the wrong order and a different inversion every chord.

**2026-09-05 — the voice leading candidates are bounded to the section's register.**
Why: without the bound the stack crept out of the section over three hundred chords, one legal
nearest tone at a time.

## P0, the sound

**2026-09-05 — gestures are SCHEDULED, not immediate.**
Why: `press(t)` and `release(t)` acted the moment they were called, so a release scheduled for six
seconds fired before the first pump: the render gate asked for a six second hold and got a flat
envelope with only the strings in it. Ambient mode queues its whole night the same way and had
exactly the same bug sitting in it.

**2026-09-05 — voices are held and glided, not retriggered at each bar.**
Why: four sections of three voices, retriggered every bar, is sixty six oscillators during the
crossfade against a budget of forty eight. Keeping each voice running and ramping its frequency
holds the count at about thirty five for a whole hold, and it is what a string section actually
does: it does not re attack every bar.

**2026-09-05 — the first note of a touch takes forty milliseconds, and the strings' layer curve is
fast at the front.**
Why: with the plan's 0.35 second attack and a smoothstep, the response fifty milliseconds after a
press was seventy eight decibels down, which is silence. The plan asks for a fifty millisecond
response in the same paragraph that gives the 0.35 attack; this is how both are true.

**2026-09-05 — the crescendo grows in level as well as in colour.**
Why: with intensity driving the filter alone, the sum of the sections wobbled half a decibel across
a chord change and the swell dipped between four and five seconds. A real crescendo is louder.

**2026-09-05 — the exported WAV is mono.**
Why: fourteen seconds of stereo at 44.1 kHz is 2.4 MB and the plan caps it at 1.5. Mono is 1.2 MB and
loses nothing anyone needs to hear from it.

**2026-09-05 — the render gate measures the swell over ONE second windows.**
Why: half second windows measure the beating between detuned voices as much as they measure the
crescendo, and a real orchestra wobbles inside a second. The plan names one second windows and it is
right.

## P1, the light

**2026-09-05 — a curtain is a radial gradient squashed horizontally, not a rectangle with a vertical
gradient.**
Why: the first aurora was a wall of hard edged beige stripes filling the whole screen with no
darkness left in it, which is the exact failure the plan names at P1 step 4. Each band is soft on
every edge now, the sections have their own homes and their own widths and heights, they add their
light rather than paint over each other, and the top half of the screen stays dark.

**2026-09-05 — the light carries the hold that earned it while the sound resolves.**
Why: `held()` returns zero the moment a finger lifts, so every curtain went black at the instant of
release while five seconds of cadence were still sounding. The picture and the sound disagreed and
`p1-resolve.png` was a blank screen.

**2026-09-05 — the curtains stay where the fingers left them, and wash cool as they fall.**
Why: reading the live finger list made every section snap from under the thumb to its home position
at the exact moment of release, which is a jump nothing in the sound is doing. The cool wash is the
design's own instruction.

## P2 and P3

**2026-09-05 — a chosen sleep segment is marked, not filled.**
Why: a solid amber slab made OFF the loudest thing on the ambient screen, louder than START, which is
the button you came for.

**2026-09-05 — "a film's first morning", not "a film first morning".**
Why: the apostrophe went missing when I transcribed the plan's mood copy and it reads as a typo on
the first screen a player chooses from.

**2026-09-05 — video recording is a toggle in Settings, off until asked for, capped at thirty
seconds.**
Why: the plan asks for video in P3 and does not say what turns it on. A toggle beside the other two
is the smallest reasonable control, and a recording that runs until the phone fills up is not a
keepsake.

**2026-09-05 — `art/plates.json` says which mood plates exist.**
Why: probing for the three image files directly put three 404s on the console of every boot, forever,
for art that has not been made yet.
