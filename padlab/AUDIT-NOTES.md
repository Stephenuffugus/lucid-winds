# PadLab audit, 2026-08-16

Audit and deepening pass over the whole app, with the weight on the Marble tab
that landed the same night. No browser was available in this lane, so sections 1
to 3 are reasoned from source. **Section 6 is the LOOKING pass** the coordinator
then ran on the real app at 390x844 and 1280x800, and what it found.

`node padlab/check.mjs` is the gate. Fifteen checks, each one watched failing on
purpose before it was kept.

---

## 1. What the audit found, before anything was changed

Ordered worst first. Everything in this list is now fixed unless it says
otherwise.

**1. Show my beat goes stale the moment you edit the beat.** `mbRebuildGhosts`
was only reachable from `renderSeq` and `refreshAllUI`, and toggling a
sequencer cell does neither: the handler writes `p.tracks[r][s]` and toggles a
class. So the headline feature of the merge failed its own gate. Editing a
step, or muting a track, left the ghosts showing the pattern as it was when the
tab was last built. Muted tracks also ghosted, which is a lie: nothing is
playing them.

**2. Three of the five shelf labels never drew.** The fix for the label
collision inverted its own test. The loop walks from the tallest shelf down, so
screen y GROWS as it goes, but the room test read `y < lastLabelY - 12`, which
after the first label can never be true. Only "1 bar" and whichever shelf was in
hand were ever labelled. The collision was fixed by hiding the evidence.

**3. The marble canvas never resized after the first look.** There was no
window resize handler for it. Turn a phone sideways and the canvas keeps its old
pixel size, so the plate is stretched and, worse, `mbUnproj` works back from
`mbW`/`mbH` and puts every tap on the wrong cell. This is the kind of bug that
reads to a child as "the game is broken now".

**4. "+ Plate" appeared to do nothing.** A new plate is appended to the right
and `mbWorldCenter` shifts, but the camera never refit and `mbFitOnce` latches
after the first visit, so at the default zoom the new plate lands outside the
frame. There was no way to recentre a camera you had panned away from, either.

**5. No cap on marbles, and no guard on voices per tick.** Six plates times 256
cells is 1536 legal marbles. All of them on the 1/16 shelf at 200 BPM is roughly
twenty thousand oscillator allocations a second. A child holding a finger down
can reach that.

**6. Clear wipes the plate in one tap with no confirm and no undo,** and it sits
next to Demo, which also wipes the plate.

**7. The stage was 300 px tall on every device.** `#mb-stage` was `flex:1` inside
an auto-height section, and a flex child has nothing to grow into when its
parent has no definite height, so the min-height floor was also the ceiling. On
a tall phone the plate sits in a letterbox with dead space under the dock.
(Reasoned from the box model, not seen.)

**8. Pressing play while the arpeggiator is running starts the bar mid-beat.**
`startClock` resets `grid`, but if the clock is already running for the arp or a
held roll then `startBeat` does not, so `playSeqStep` begins at whatever
sixteenth the arp had reached. Every marble inherits the same offset. This one
predates the marble tab; the plate is just where you can finally see it.

**9. Re-keying the studio left the marble read-out lying.** The marbles
themselves re-key correctly, because a marble stores a scale degree and resolves
it at play time, but the pitch chips and the selected-marble read-out are built
once and were not rebuilt on a key or scale change: the plate played D and the
label still said C.

**10. Ghosts were all one bar high.** Correct physics, wrong picture. A ghost
repeats once per bar so its period must be sixteen sixteenths, but rendering it
at the 1-bar shelf height makes a picket fence you cannot read a beat through.

**11. Per frame cost.** The painter sort called `mbIso` inside its comparator,
so it projected twice per comparison, and `mbIso` called `mbWorldCenter`, which
loops every plate. The plate cache does the same per visible CELL: sixteen by
sixteen by six plates. And `mbDraw` called `getComputedStyle(document.body)`
once a frame to read a font that never changes.

**12. Dropping a marble left nothing selected,** so Remove did not appear and
you had to hunt for the marble you had just placed to get rid of it.

**13. Em dashes throughout the player facing copy,** against house style, in
about thirty strings across the whole app rather than only the marble tab.

Checked and found sound, for the record: there is exactly one clock, and
`marbleTick` is called from inside `schedulerTick` in the playing branch and
nowhere else; the marble drums go to `drumBus` including the snare's second gain
layer, and the melody goes to `instrBus`; the four tabs do not steal each
other's state, and switching tabs touches no audio node, so there is no click on
a tab switch; the rAF loop stops when the marble tab is left; nothing in the
marble tab is a stub. Marble state is in all three of `collectState`,
`applyStateVars` and `refreshAllUI`, and a v3 project still loads.

---

## 2. What was fixed

| # | Fix |
|---|---|
| 1 | `mbRebuildGhosts()` on a cell toggle and on a mute toggle; muted tracks no longer ghost |
| 2 | Shelf label room test looks downward, which is the direction the loop travels |
| 3 | Window resize resizes the marble canvas, but only while the tab is up (a hidden view measures zero by zero) |
| 4 | `mbFit` fits ALL the plates, not just the first, and resets yaw and tilt; a **Fit** button in the zoom column; adding a plate refits so the new plate is visibly there |
| 5 | `MB_MAX_MARBLES = 80` with a toast at the cap, `MB_MAX_HITS_PER_TICK = 24` in `marbleTick`. Past the guard a marble still bounces, it just stops sounding, which is the only humane failure |
| 6 | One step of undo covering Clear, Remove and Demo. The Undo button appears when there is something to undo, and undoing is itself undoable |
| 7 | `#view-marble.on{min-height:100%}` so the stage takes what the dock leaves. `main` has 32 px of padding and the section resolves against the content box, so the arithmetic comes out level and the tab still does not scroll |
| 8 | `startBeat` sets `grid=0` when the clock is already running |
| 9 | Key and scale changes rebuild the marble chips and the read-out |
| 10 | Ghosts render at a fixed 110 units and 72% radius; their timing is untouched |
| 11 | `mbWorldCenter` memoised behind `mbPlatesChanged()`; one projection per marble per frame instead of two per comparison; the font read once |
| 12 | A newly dropped marble stays selected, silently, so Remove is right there |
| 13 | Every em dash in player facing copy rewritten, app wide. Placeholder dashes became words: the MIDI pill reads "none", an empty song chain reads "empty" |

---

## 3. What was added

Judged against "a working export beats three half features". Pad bank B and
record-into-sequencer were both left alone: bank B reaches into `pads`, the MIDI
map, the sequencer rows and persistence, and either would have been half done.

**WAV export of a take.** The roadmap's item 5, done the cheap correct way. A
take is recorded as WebM/Opus, which phones like and music software mostly does
not. The browser can decode its own recording and `encodeWAV` already existed for
pad samples, so a **WAV** button in the Recordings sheet decodes the take and
hands back a real 16 bit WAV, with no `OfflineAudioContext` render. It is a
finished feature rather than a start on one.

**Two more surfaces on the plate: Wood and Bell.** Four voices is a short
vocabulary for a plate that holds eighty marbles. Wood is a bandpassed knock
with a square ping under it, percussive, on the drum bus. Bell is an inharmonic
partial over the fundamental with a long tail, pitched, on the instrument bus so
it takes the reverb. Bell is pitched, which means it colours itself by the note
it sounds like the melody does, so it carries a lower saturation to tell the two
apart on the plate. Adding a voice is now one entry in `MB_INSTR`: the chips,
the colours, the pitch row and the save format all read that table.

**The ghosts teach better.** With Wood and Bell in the table the eight sequencer
tracks map to something true: kick to bass, snare to snare, clap and rim to
wood, hats to hat, tom to bass, cowbell to bell. Before, four of the eight
tracks ghosted as pitched melody marbles.

---

## 4. The gate

`node padlab/check.mjs`, thirteen checks. Twelve read the source. The
thirteenth RUNS it: `schedulerTick`, `marbleTick` and `mbPeriod16` are lifted
out of `index.html` and driven in a `vm` against a fake clock at 50, 74, 90,
120, 140 and 200 BPM, at 0% and 40% swing, over four bars, with four marbles on
four different shelves and phases. It asserts every hit lands on exactly the
sixteenth the grid calls for, that a swung hit carries exactly the scheduler's
own swing offset, that the count is exact in both directions so a dropped hit is
caught as well as a doubled one, and that a quarter note marble always coincides
with a sequencer step. Nothing in that test is a copy of the app's arithmetic; a
copy would drift and then agree with itself forever.

The checks cover: one clock and no second audio timer, no rAF scheduling sound,
every `getElementById` id existing in the markup, bus routing intact, marble
pitch still a scale degree, the state trio, ghosts rebuilding and never
sounding, `SHELL_VERSION` and the registration `?v=` agreeing, no dash
characters in copy, a 48 px minimum and no orphan buttons in the marble dock,
the plate cap, the canvas resize, and the timing run.

Each check carries a self test that mutates a copy of the source into the broken
shape. The runner trips every self test before it trusts a single pass and exits
2 if one has gone blind. Two checks WERE blind on the first run and were fixed
rather than accepted: `indexOf("function mbDraw")` was matching
`function mbDrawPlates`, and one check sliced the source on a comment marker
that `stripComments` had already eaten. The timing check was additionally proved
against a second, unrelated break (an off by one in the phase offset), which it
caught.

`SHELL_VERSION` is now `padlab-shell-v11` and the registration asks for
`sw.js?v=11`. The gate fails if those two ever disagree.

---

## 5. What still worries me

**The Marble tab still has not been looked at.** The LOOKING pass in section 6
covered boot, the header and the transport at both widths. The stage height fix,
the Fit button, the ghost heights, the Wood and Bell marbles on the plate and
the shelf label spacing are all still reasoned from source and unseen. The last
time twelve gates went green on this fleet the floor was see through. Open the
Marble tab at 375 by 667, then at desktop width, before believing any of it.

**Bell has a 1.5 second tail on the instrument bus.** Eight bells on the 1/16
shelf with the reverb up will smear. The per tick guard stops the audio thread
dying but does nothing about mud.

**One step of undo is one step.** Clear then Demo then Clear and the first plate
is gone for good.

**A marble still cannot be moved.** Phase drag owns the horizontal gesture, so
moving one means removing it and dropping a new one. That is the largest
remaining hole in the toy for a child, larger than anything added here.

**Show my beat has no explanation on screen.** It is a labelled toggle and
nothing more. A child who taps it gets a plate full of marbles they did not
place and no story about where they came from. Ghosts also share cells with real
marbles, so a real marble dropped on a ghosted step overlaps it.

**The stage `min-height:100%` depends on `main` resolving a definite height for
percentage children.** It should, since `main` is a flex item with `flex:1` in a
`100dvh` column, and the failure mode is a fall back to today's behaviour rather
than a break. Still, it is the one change here whose outcome I cannot see.

**`mbFit` on the sixth plate** will clamp at the minimum zoom with the world
still overflowing. Six plates is a lot of world; there is no answer to that
short of letting the zoom go further out.

**Pad bank B is still promised in the MPK sheet copy** ("next on the build
list") and is still not built.

---

## 6. The LOOKING pass, and what it found

Run by the coordinator on the real app at 390x844 and 1280x800. Boot was clean
at both widths. The start screen, the four tabs, the genre grid with its BPMs,
the pattern slots and swing all read well. Two findings, both in the chrome
above the tabs, both now fixed.

### 6.1 The beat subtitle truncated to "pick a gro..."

The transport is 244px of fixed furniture at 390px wide (two 52px buttons, a
46px meter, a 94px tempo box, gaps and padding) and the beat name got the 84px
left over. The subtitle is `white-space:nowrap` with an ellipsis, so it cut.

The important part is the coordinator's note: **size the slot to the longest
string it can ever hold, not the one that happens to be there at boot.** Five
strings land in `#nbSub`, and the placeholder was not the worst of them:

| string | chars |
|---|---|
| `142 BPM · tap keys or pads to jam` | 33 |
| `pick a groove to jam over` | 25 |
| `142 BPM · jam on` | 16 |
| `● REC 10:05` | 11 |
| `paused` | 6 |

Fixed from both ends. The furniture gives ground below 430px: the meter drops
34px, the tempo slider to 56px in a tighter box, which returns 34px to the name.
And every writer was shortened so the longest line is now 11 characters: the
subtitle's job is the tempo, and the nudge to go and play is the tour's job.
`142 BPM · jam on` was tried first and cleared 390px by only 14px, which would
have truncated again on a 360px Galaxy, so it went too.

Measured headroom, at the narrow-width sizes: 360px leaves 17px spare, 375px
32px, 390px 47px. The ellipsis stays as a safety net rather than a design.

### 6.2 Five unlabelled glyphs in the header

Dice, a glowing dot, sliders, a download arrow and a gear that reads as a sun at
that size. All five had a `title`, which does nothing on a touch screen, and
none had an `aria-label`. The only way to learn any of them was to press it.

Every one now carries a word under the icon in 8px mono: DICE, MIDI, FX, ADD,
SETUP, plus a real `aria-label` on each. The label lives inside the button and
the icon shrank from 22 to 20px, so the button grew to 48 by 52 and the touch
target is still at least 48 in both directions. The MIDI pill takes the same
shape as the buttons once its device name is dropped at narrow width, so it
reads MIDI instead of being a bare dot; the breakpoint that hides the name moved
from 390 to 430 so more phones get the label rather than the dot.

It was tempting to give the pill `role="button"` while renaming it. That would
have been a lie in two directions: no keyboard handler behind the role, and a
focusable div swallows the Space bar that the document handler uses for play and
stop. It keeps its `aria-label` and stays tap only, which is what it actually is.

### 6.3 Two new gate checks, so neither can come back quietly

- **every header control carries a visible label and an aria-label**, which also
  fails if the pill ever claims a role it cannot honour.
- **the beat name slot fits its longest string on a 360px phone**: it scrapes
  every string any writer puts into `#nbSub`, reconstructs the transport's width
  budget from the narrow-width CSS rather than from a number typed here, and
  fails if the longest one does not fit. It is set at 360 rather than the 390
  that was shot, so the check is harder than the photograph.

Both were watched failing first, and the second one caught a bug in its own scan
along the way: it was prefixing the interpolated tempo onto the wrong half of a
ternary. The scan was fixed rather than the threshold loosened.
