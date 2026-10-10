# FRETWORK: a UI review brief for an outside brain (10 October 2026)

You are being asked by the director of a one person studio, Sky Wolf Studio. Your answer will be read by the studio's
planning model (Claude), turned into a build plan, and built by the studio's coding model. So: analyze what is here and
give us DIRECTIONS, ranked, concrete enough to build. Do not make art here and do not change what the drills teach. This
is a user interface, experience and gap review of ONE app, right before it goes on Google Play.

**The app is FRETWORK, at https://skywolfstudio.com/fretwork/ (open it in a phone sized window, portrait).**
Twenty eight phone screenshots of the current build (fourteen screens at 412 and at 360 wide, dark theme, fresh save)
are at https://lucidwinds.com/docs/briefs/fretwork/ and are described in Part 2, so you can answer from this file alone
if you cannot browse. Nothing else on either site is under review.

**HOW I NEED YOUR ANSWER: as ONE downloadable file** named `FRETWORK-UI-<your model name>.md` (a `.docx` is fine if you
cannot make a `.md`). If you truly cannot attach a file, put the WHOLE answer inside one code block so it can be copied
in one tap. The file must end with the `json` block described at the end of Part 4.

Be specific and be brave. The weakest answer is generic mobile advice ("use consistent spacing", "add micro
interactions"). The best answer names the screen, the element, the pixel sizes or words to change, the reason a
guitarist would feel the difference, and how we would measure that it worked.

---
# PART 1. THE APP IN TWO MINUTES

Fretwork is a fretboard practice tool built by a working guitar and theory teacher: "a practice room, not a course".
Everything happens by TAPPING a drawn fretboard on the phone. No microphone, no account, no ads, works offline, nothing
leaves the phone. It is about to be listed on Google Play as a free app (the Play app wraps this exact web page, so any
web fix reaches Play players with no new upload).

**Five tabs** along the top: Home, Drills, Scales, Play, Charts. A Setup strip (instrument, tuning, the open string
letters, left handed mirror, sound on or off) sits on the Drills tab.

**Five instruments, each with its own tunings and a custom tuning set one string at a time:**
guitar (Standard, Drop D, Half step down, Drop C, DADGAD, Open G, Open D, Open E), bass (Standard, Drop D, Five string
low B), ukulele (Standard high G, Low G, Baritone), banjo (Open G, Double C, Sawmill; the short 5th string starts at
fret 5), mandolin (Standard, drawn as four courses). The open string letters sit above every neck. 15 frets are drawn.

**Home**: a welcome line, "Where are you today?" with three doors (Brand new to the neck; I play and I want tight
chords; Chasing sounds and theory), four quick chips (just play, all drills, rhythm room, my charts), and on the web
only a red Tip jar (it is switched off inside the Play app) with a credits line.

**Drills** (seven cards, each with collapsed OPTIONS and its own big Start button):
1. Note hunt: "Tap every C" in a fret window (Open to 5, Open to 12, ...), with a harder hunt offered after.
2. Name that fret: a gold note lights up, you name it on twelve pads; 12 rounds.
3. Intervals: from a gold root, tap the interval up (you pick which intervals); 10 rounds.
4. Triads: build the shape on a string set (root position, 1st, 2nd inversion), with help levels (walk me through it,
   most marked, a few marked, none).
5. Seventh chords: maj7, 7, m7, m7b5, dim7 on four strings, including the "big shape" rooted on the 6th string that
   skips the 5th.
6. Inversion climb: one seventh chord climbs through four shapes up the neck.
7. The one note ladder: maj7 to 7 to m7 to m7b5 to dim7, one note moving at a time.

**NEW TODAY (v11, built from the director's own notes, please review it hardest):** in Triads and Seventh chords a round
is now a SET of chords that belong together (one key when several qualities are chosen, the home chord first; round the
circle of fifths when one quality is chosen), never the same chord twice. After five chords the lesson offers "Test me
on these 5" (or "Learn N more first", up to eight). In the test you place each chord from memory: every right note
dings and stays green, a wrong note flashes red and sounds, a string the shape does not use says "Nothing on the A
string in this shape", and two misses on a string ring the right spot. Name that fret and Intervals never ask the same
thing twice running.

**Scales**: 22 scales (the seven modes, pentatonics, blues, harmonic and melodic minor and their modes, Hirajoshi, In
sen, double harmonic, whole tone, both diminished, Messiaen 3, augmented) in positions (one position at a time, lower /
higher) or three notes per string, numbered by interval ("numbers first"), with a vamp chord to play over and a "hide
the map" switch.

**Play**: a playable neck: hold a note to sustain it, slide along a string, light up a scale over it, seven voices
(Steel, Warm, Nylon, Keys, Bass, Drive, Mute), a looper, MIDI keyboard input, the strings mirror, full screen.

**Charts**: write a chord chart: a name, the progression as chord boxes, "+ add a chord", beats per chord, tempo,
sound, count in, Play, and a jam board under the chart. Adding a chord opens a picker: "Build one on the fretboard", My
chords (kept ones), and a bank of 31 shapes. **NEW TODAY:** tapping a chord PREVIEWS it (hear it; a bar shows a little
chord box, its name and notes, a replay button, "after <the chart's last chord>" which plays the change, and "Add this
one"); only Add commits. The chord builder names what you tap (Am7, C6/E, Cmaj7/B) and offers guesses as chips.

**The rhythm room**: polyrhythms (3 over 2, 4 over 3): "say it with me" words, a two row pattern, speed and count
along, and two big LEFT / RIGHT pads to tap along.

---
# PART 2. WHAT IS ON SCREEN TODAY (fourteen screens; the studio's own faults named so you can go past them)

Files `412-NN-name.jpg` and `360-NN-name.jpg` at the shots URL. All dark theme, fresh save.

- **01 home**: Welcome card, three door cards, four chips, the red Tip jar, credits, the build tag fretwork-v11.
  *We see:* the Tip jar is the loudest thing on the screen; the doors are three similar grey slabs.
- **02 / 03 drills**: seven cards in one long column, each a title, two lines of description, "OPTIONS" collapsed,
  and a full width gold Start button. *We see:* seven identical gold buttons; the page is several screens long; the
  options are hidden behind small text; nothing says what you did last time or what to do next.
- **04 note hunt**: "Tap every C 0 of 6", the neck, Show me / Skip / End drill, a timer.
- **05 triad lesson**: "B major, 2nd inversion, strings 3 2 1, in the key of B, chord 1 of 5", the help dots dashed.
  *We see:* the shape here sits at frets 11 and 12, at the very bottom edge of the drawn neck.
- **06 lesson done**: the summary card "5 chords learned", "Test me on these 5", Again, Back to drills (it scrolls
  into view under the neck).
- **07 chord test**: one green note, one red wrong note named D, "Not that one on the B string."
- **08 scales**: Scale and Root selects, Form, vamp, hide the map, the position stepper, a paragraph naming the scale,
  a SHORT neck window (frets 8 to 12), then two paragraphs of teaching text. *We see:* a lot of reading before playing;
  the board is small.
- **09 play**: a paragraph, then six controls (Light up, Root, Voice, From fret, To fret, loop, midi, strings, full
  screen) before the neck. *We see:* the neck starts halfway down the screen.
- **10 charts, empty**: "Your chord charts", a paragraph, "Nothing here yet", New chart.
- **11 chart editor**: the name field, All charts, "THE PROGRESSION, IN ORDER" as small chord boxes (D A E) and "+ add
  a chord", Beats, Tempo, Play, Sound, Count, jam board, a paragraph.
- **12 chord picker**: Build one on the fretboard, My chords (empty), the bank chips, the NEW preview bar (F chord box,
  "F C F A C F", play, "after E", "Add this one"), a paragraph, Back to the chart.
- **13 chord builder**: a paragraph, the neck with three notes placed, the mute / open buttons per string under the
  neck, "Looks like: C" guesses below the fold.
- **14 rhythm room**: 3 over 2 / 4 over 3, the words, the pattern grid, speed, count along, Hear it, the two pads.

---
# PART 3. THE BAR EVERY DIRECTION IS HELD TO

1. Portrait, one thumb. Every tap target at least 48 CSS px as rendered at 360 and 412 wide (fret cells included).
2. Readable at arm's length: body text never under 0.7 rem; labels never fainter than the dim ink unless decorative.
3. No dashes of any kind in anything a player reads (the studio writes "left handed", not "left-handed").
4. Nothing new is sold. No ads, no subscriptions, no new purchases. Directions that add any will be discarded.
5. The app stays ONE HTML file of vanilla JavaScript, no framework, inline SVG for every neck. Buildable that way.
6. Every direction must work for all five instruments, any string count (4, 5, 6), and the left handed mirror.
7. Color is not the only signal: green / red notes, gold roots and scale colors must also read for a color blind player
   (about 8 percent of men). Say what your direction does for them.
8. It is a teacher's tool: the words should sound like a good teacher at your elbow, short and warm, never like an app
   selling itself. Do not invent features the app does not have; if you want one, put it in 4.6 as a gap.
9. The studio measures. Say how we would know a direction worked (taps to first note, a screenshot comparison, time).

---
# PART 4. WHAT I WANT BACK, IN THIS ORDER

**4.1 The first minute (4 to 6 directions).** Home on a fresh save to the first note tapped. The doors, the chips, what
a beginner should see first, what belongs below the fold, the Tip jar's place on the web.

**4.2 The drills (8 to 12 directions).** The Drills page (seven cards, seven Start buttons, hidden options), the run
screen (task line, neck, Show me / Skip / End, timer, the verdict line), the summary card, and the NEW lesson then test
flow for chords: is five the right number, how the test should look and sound, how green / red guidance should read,
what a "you know these now" moment should be, whether progress should be remembered between visits.

**4.3 Charts and the chord picker (5 to 8 directions).** The chart editor, the progression boxes, the NEW try before
you add bar, the bank's 31 chips, My chords, the chord builder and its guesses. The director's words: "I should be able
to use this as an experimentation tool."

**4.4 Scales, Play and the rhythm room (4 to 6 directions).** The reading before playing, the board size, the controls
above the neck.

**4.5 The visual system (3 to 5 directions).** One accent, one pass color, one fail color, the neck's colors, type sizes
and weights per role, light and dark, with hex values.

**4.6 Gaps (up to 8).** What a guitarist would expect and not find, or a flow that dead ends. Rank by how much a new
player would miss it. (No microphone features: the app does not listen, by design.)

**4.7 The Google Play listing (3 to 5 directions).** The listing text below and the six screenshots: what a stranger
scrolling the store needs to see in the first screenshot and the first line, what to cut, what to say about the NEW test.

**4.8 Three things to cut**, and **three references** (an app whose handling of ONE specific moment we should study,
the moment named; no general praise).

**Format for every direction**, exactly:

```
### D<nn>. <short name>
Screen: <home | drills | run | summary | test | scales | play | charts | picker | builder | rhythm | listing | all>
Now: <what is there today, one or two sentences>
Direction: <what to change, concrete: sizes, positions, words, states>
Why: <the player's experience that changes, one or two sentences>
Color blind: <what this does for a player who cannot tell red from green>
Effort: <S | M | L> (S under two hours, M a day, L several days)
Check: <how we would measure it worked>
```

**End the file with this JSON block** (one entry per direction, same ids as above):

```json
{"app":"fretwork","model":"<your model name>","date":"2026-10-10",
 "directions":[{"id":"D01","screen":"drills","effort":"M","title":"...","summary":"one sentence"}],
 "gaps":["..."], "cuts":["...","...","..."], "references":["app: the moment"]}
```

---
# PART 5. DATA (skim; here so nothing you say is a guess)

- Build v11, live 10 Oct 2026. One file, about 184 KB. Fonts: the phone's system font. Theme follows the phone (light and dark).
- Colors (dark): background #14100f, card #1c1614, ink #f0e9dd, muted #a3968a, accent #c9974c, gold #e0b366,
  pass #3fbf77, fail #ff5d54. (Light: background #f3ede2, card #fbf8f1, ink #241c14, accent #8a5f22, pass #1a7f4e,
  fail #c23b35.)
- The neck: cells 64 wide by 52 tall in the drawing's units, scaled to the screen width; dots 17 px radius; the root
  wears R and chord tones wear their job (R, 3, b3, 5, b7, 7) when "numbers" is on, else the note name.
- Drill lengths: Name that fret 12 rounds, Intervals 10, chord lessons 5 (up to 8) then a test of those, the climb 4
  shapes, the ladder 5 chords.
- Stats kept on the phone: how many right per drill, a heat map of misses per fret.
- The current Play listing text (short description, 80 characters):
  "Know the neck. Tap drills, scales, chord charts and rhythm, by a guitar teacher."
  Full description:

```
Fretwork is a fretboard practice tool built by a working guitar and theory teacher. Not a course, not a subscription. One tool that does what a lesson does when the teacher points at the neck and says "find every C."

FIVE INSTRUMENTS. Guitar, bass, ukulele, banjo and mandolin, each with its own tunings, a custom tuning you set one string at a time, and the open string letters above every neck so a beginner always knows where they are.

TAP DRILLS. Name the note, find every instance, name the interval from a root. Natural notes first, one string at a time, then the whole neck. What you miss comes back sooner.

SCALES IN POSITIONS. Every position of the scales that matter, drawn on the neck the way you actually play them.

CHORD CHARTS. Build a chord by tapping the strings and the app names it honestly (Am7, C6/E, Cmaj7/B). Keep your favorites in your own library, nudge a shape up and down the neck, start from a bank of the thirty one shapes everyone meets first, and write charts you can play along to.

RHYTHM ROOM. A metronome and rhythm patterns to practice against, with the fretboard live while a chart plays.

LEFT HANDED AND FLAT ON THE TABLE. Reverse the strings once and every board follows: drills, scales, play, charts, the chord builder.

Free, the whole neck, forever. No ads, no account, no subscription. Nothing you do leaves your device. Works offline.

From Sky Wolf Studio.
```

Thank you. Rank honestly: if the most important thing is small, say so.
