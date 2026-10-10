# Fretwork: the UI plan from Astra's review (10 October 2026)

Source: `docs/briefs/fretwork/reviews/FRETWORK-UI-GPT-2026-10-10.md` (Astra / GPT, 44 directions D01 to D44, 8 gaps,
3 cuts, 3 references, a listing rewrite). Brief: `docs/briefs/ASTRA-FRETWORK-UI-BRIEF.md`. App: SWS-apps
`apps/fretwork/index.html`, live v11 at skywolfstudio.com/fretwork (the Play app wraps this page, so every web fix
reaches Play players with no upload).

## 1. What was checked in the code before planning (Astra's claims, verified 10 Oct)

| Claim | Verdict | Evidence |
|---|---|---|
| D08 fret cells under 48 px | **TRUE, measured** | getBoundingClientRect on the hunt board: 44.7 x 36.4 px at 360 wide, 52.4 x 42.6 at 412 |
| D32 controls under 48 px | **TRUE, measured** | all 9 visible run screen controls under 48 px tall at both widths |
| D23 left handed chord builder assumes 6 strings | **TRUE** | `var s2 = S.lefty ? 5-col : col;` (paintChordEditor) |
| D23 banjo short string wrong pitch in charts | **TRUE** | `chordMidis` adds `tun()[s]+fret`; the board uses `T0()` (the virtual open) via `midiAt` |
| D17 empty My chords wrong on other instruments | **TRUE** | `if (!S.chordLib.length)` counts every instrument |
| D20 charts do not save their tuning | **TRUE** | a new chart stores `c.inst` only; kept chords store `inst` only |
| D43 "What you miss comes back sooner" | **TRUE, unsupported** | `record()` writes the heat map; no drill reads it when choosing |
| D19 stale delayed preview audio | **TRUE (v11, mine)** | "after <last>" uses an uncancelled `setTimeout(..., 1100)` |
| D15 test accepts a note an octave away on the right string | **TRUE, by design so far** | `testTap` and the lessons' `voiceTap` compare pitch class (`m%12`); a teaching call, not a bug |
| D14 test auto advances after 1.5 s | TRUE (v11, mine) | `setTimeout(testNext, 1500)` |

Nothing Astra claimed about the code was wrong in the checks above.

## 2. The sort (fault = broken against our own bar; taste = design change; gap = new feature)

- **Faults:** D08, D17, D19, D20, D23, D30 (11 px labels are under 0.7 rem), D32, D43, D10 (my "learned" overclaims),
  D16 (the string letter auditions while the open cell answers, two meanings for one place).
- **Taste:** D01 to D07, D09, D11, D12, D13, D14, D18, D21, D22, D24 to D29, D31, D41, D42, D44.
- **Gaps (new features, after launch unless he says otherwise):** D33 resume practice, D34 backup and restore,
  D35 undo and duplicate, D36 metronome and a real count in, D37 transpose a chart, D38 connect the rooms, D39 scale
  search and pins, D40 listening drills (prove demand first).
- **Already ours / agreed:** D05 (we named the loud Tip jar), cut 1 (the "on the bench" roadmap paragraph).

## 3. The packets

### F1. Before publishing: the bugs and honest words (about a day; smoke + a look at 360 and 412)
1. D23: the builder mirrors by `NS()-1-col`; one pitch function (`T0`/`midiAt`) for analysis, preview, chart playback
   and nudging; banjo Open on the short string means its start fret.
2. D17: My chords' empty state counts only the current instrument; D19: switching candidates cancels a queued
   "after" chord; after Add the bar says "F added as chord 4".
3. D20 (lite, forward safe): charts and kept chords save the tuning (MIDI array) they were made in and play in it;
   the chart shows its tuning when it differs from today's. Legacy charts (no tuning saved) play as before and are
   flagged "tuning not saved" (no silent rewrite).
4. D10 / D12 / D13: "You practiced 5 chord shapes"; the test's result per chord is First try / Corrected / With help /
   Skipped (an auto ring counts as help); messages stay until the next tap ("That was D. Try another note on the B
   string.", "Leave the A string silent for this shape."); check and X badges so right / wrong read without colour.
5. D14 (his call 2): a finished chord holds with Hear it and Next chord.
6. D15 (his call 1): the test and the lessons accept the call he makes.
7. D30: no text under 12 px (0.75 rem).
8. Home trims: the Tip jar becomes a quiet "Support Fretwork" row lower down (still absent in Play); cut the roadmap
   paragraph; the build tag moves into the credits line.
9. D43 / D41 / D44: the listing loses the unsupported claim and the "metronome" wording, gains the chord set and
   memory test paragraph (Astra's draft, checked against the build), new short description.
**Gates:** smoke (extended: mirror on 4 and 5 strings, banjo short string pitch, legacy chart flag, result
categories), the look at 360 and 412 dark and light, read back live.

### F2. The board (several days; the biggest felt change)
D08 + D09 + D16 + D24 + D26: the neck goes full width; cells at least 48 x 48 px at 360 (columns ~50 px); a visible
five fret window with 48 px "Lower frets / Higher frets" controls whenever the task range is longer; every drill keeps
its full range and found notes; task, feedback and the three run buttons sit with the board (48 px each); the timer
goes under "details"; Scales and Play show the neck first and move options into disclosures.
**Gates:** every cell measured at 360 and 412 (both dimensions >= 48, no overlap); every drill completed through the
window controls; all five instruments and the mirror; smoke; the look.

### F3. Finding your way (a few days)
D01 / D02 / D03 home (one first action, an instrument row on Home), D04 bottom navigation (his call 3), D06 / D07 the
drills list grouped with visible settings, D18 chart cards, D21 bank sections, D22 the builder's names above the neck,
D25 / D27 / D28 states named, D29 / D31 one accent and one marker vocabulary, D32 the rest of the 48 px audit.

### F4. The gaps (after launch, in this order unless he reorders)
D33 resume where practice stopped, D35 undo and duplicate a chart, D36 metronome with tap tempo and a real one bar
count in, D34 backup and restore, D37 transpose, D38 connect lessons to charts and scales, D39 scale search, D40 only
after demand.

### Listing screenshots (D42)
Retake the six store shots after F1 in Astra's order (find notes; practice a set then from memory; hear a change
before you add it; your own charts; scales by interval; another instrument), and again after F2/F3. Play lets the
shots change any time without a review of the app.

## 4. His calls
1. **D15:** in the chord test (and the lessons), must the notes be exactly the taught shape, or is the right note on
   the right string in another octave also right? (Recommend: exactly the shape, it is a voicing drill.)
2. **D14:** hold each finished test chord with Hear it / Next chord, or keep moving on by itself? (Recommend: hold.)
3. **D04:** move the five tabs to a bottom bar within thumb reach? (Recommend: yes, in F3.)
4. **Publish timing:** publish after F1 with F2 and F3 following live, or wait for F2? (Recommend: after F1; web
   fixes reach Play users with no new upload or review.)

## 5. Laws for whoever builds
- One file, vanilla JS, ES5 style as the file is; anchored replacements only; bump `fretwork-vN` in the build tag,
  `sw.js` CACHE and the smoke check together; smoke green before deploy; deploy hosting; read back byte identical.
- LOOK at 360 and 412 (dark and light) before calling a packet done; name three faults in the shots before he does.
- No dashes in copy; nothing sold; every direction works for 4, 5 and 6 strings and the mirror.
- Do not change what a drill teaches without his call (D15 is his).
