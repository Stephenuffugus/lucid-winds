# FRETWORK UI and feature review
Model: GPT | Reviewed: 10 October 2026 | Build: fretwork-v11

**Recommendation: launch a clearer, more dependable practice room before adding more tools.** The strongest existing combination is related chord sets, immediate note feedback, and hearing a chord change before adding it to a chart. Make those easy to discover. A larger feature count is not a persuasive competitive advantage here.

This handoff follows the supplied brief's eight sections and exact direction fields. It contains 44 directions, eight ranked gaps, a competitor comparison, release checks, and a matching JSON block. It proposes no ads, accounts, purchases, microphone features, framework, or changes to the teacher's exercise content. New practice capabilities are explicitly placed in section 4.6.

### Evidence and limits

I read the supplied PDF, inspected the supplied phone screenshot gallery at 360 and 412 CSS pixels, opened the live app and its beginner route, and inspected the public v11 HTML and JavaScript. The live browser was desktop sized; narrow phone findings use the supplied captures and source geometry, not a claimed hands on test on an Android phone. The two screenshot widths sometimes show different randomly selected chords, so compare layout rather than treating them as identical lesson states.

Competitor comparisons use current official product pages and documentation retrieved on the review date. I did not install or benchmark those apps. Marketing feature claims are labeled as such; absence from a competitor page does not prove absence from its app. I have not tested the packaged Play build, offline installation, audio latency, or MIDI hardware. Check targets below are proposed acceptance criteria, not measured results. Effort estimates include implementation and focused verification and are rough estimates for someone familiar with this code: S under two hours, M about a day, L several days. Shared dependencies mean estimates should not simply be added.

### Build order by consequence

| Priority | Directions | Why this comes first |
| --- | --- | --- |
| P0, resolve before release | D08, D15, D20, D23, D43 | Real touch targets; teacher approved voicing acceptance; tuning and pitch integrity; mirror defects; claims the build can support |
| P1, polish the core before release | D01 to D07, D09 to D14, D16 to D19, D21 to D22, D24 to D32, D41 to D42, D44 | Entry, practice, feedback, chart experimentation, accessibility, and an honest store presentation |
| P1, first additions if schedule allows | D33 to D35 | Resume useful work, protect saved charts, undo mistakes |
| P2, next release after observation | D36 to D39 | Better rhythm access, transposition, connections between existing tools, faster scale finding |
| P3, validate demand first | D40 | Optional listening exercises, without a microphone |

Within P0, start with D23 and D20 because those affect whether the app plays and labels the intended notes. The biggest visible usability improvement is D08. Implement D29 to D32 as shared primitives while working on the other P1 directions.

## 4.1 The first minute


### D01. Make the first action unmistakable
Screen: home  
Now: The three doors have similar visual weight. The beginner door already starts a C hunt directly; retain that working shortcut.  
Direction: Keep one 56 px high primary action, "Find your first notes", with the subtitle "Tap every C, open strings to fret 5". Put "Build chord shapes" and "Explore scales" in two separate 64 px minimum neutral rows below it. Place a compact instrument selector above the action, defaulting to the saved choice or Guitar. No forced questionnaire. Keep the current exercise and let advanced players take either other door immediately.  
Why: A beginner can act without interpreting three statements about their identity.  
Color blind: The primary choice has explicit text and a leading note symbol; other routes retain equally readable labels.  
Effort: M  
Check: On a fresh save, at least 4 of 5 novice testers start the intended hunt unaided within 15 seconds and tap a note within 20 seconds. Default guitar needs one navigation tap, then a note tap.


### D02. Expose the instrument without a setup detour
Screen: home  
Now: Instrument and tuning controls are concentrated in Drills. Home can launch an exercise before the player has seen those controls.  
Direction: Show a 48 px "Guitar · Standard" setup row on Home and a compact equivalent on each destination screen. Opening it exposes instrument, tuning, custom tuning, and "Left handed" in one panel. Show note letters and octave numbers in custom tuning so high G and low G cannot look identical. On a running drill, a setup change ends or saves that run through an explicit choice; do not silently reinterpret its notes.  
Why: A ukulele or bass player should not start by practicing an unexplained guitar.  
Color blind: Instrument, tuning, and handedness are written states, with a check on the selected setting.  
Effort: M  
Check: From fresh Home, reach a correctly labeled ukulele hunt with no visit to Drills setup. Repeat for every instrument, five string bass, custom tuning, and both orientations.


### D03. Reduce the welcome block and duplicate routes
Screen: home  
Now: The welcome panel precedes the doors, and four small chips repeat routes already present in navigation.  
Direction: Use a 24 px heading "Know your neck" and one 16 px sentence "Find notes, build chords, and hear how they fit." Move the teacher credit and privacy detail below the doors. Remove "All drills" and "My charts" Home chips because the primary navigation already exposes them. Retain "Just play" and "Rhythm room" as 48 px neutral buttons. Do not introduce a tour carousel.  
Why: The first screen explains the activity and leaves room to begin.  
Color blind: No route depends on a color or an unlabeled icon.  
Effort: S  
Check: At 360 by 800, the beginner action and the other two doors are visible without scrolling at default text size. At 200 percent text, everything remains reachable without horizontal page scrolling.


### D04. Move the five destinations within thumb reach
Screen: all  
Now: Home, Drills, Scales, Play, and Charts are top tabs. The sound control and smaller chips also compete for header space.  
Direction: Use the same five destinations in a 64 px bottom navigation bar, plus the device safe area, with a minimum 48 px hit area per item. Use 12 px labels and simple inline SVG icons; selection uses a short top rule and bold text. Do not add a sixth tab. Hide this bar during an active exercise and use its dedicated bottom controls instead. In Play full screen, retain a 48 px "Exit full screen" control. Add content padding equal to the active bar height.  
Why: Frequent destinations become reachable without stretching over the neck.  
Color blind: An indicator line, icon, and weight identify selection independently of fill color.  
Effort: M  
Check: At both widths, all five labels fit without truncation. No final fret, dialog action, or chart row is obscured by either bar, including keyboard open and large text states.


### D05. Keep the web tip jar visible but secondary
Screen: home  
Now: The web Tip jar is a prominent red button. The footer also advertises planned work and shows a build tag.  
Direction: Place a neutral 48 px "Support Fretwork" button in an About area below the main routes with "Optional. Every practice tool stays free." Keep it absent in the Play build. Retain teacher credit, Privacy, and Feedback there. Move the build identifier into About details and remove unfinished feature announcements from the welcome screen. Do not make support interrupt a lesson or a result.  
Why: The first impression becomes about practicing; the studio still has a findable support route on the web.  
Color blind: The support action is identified by text, with no red signal that could imply an error.  
Effort: S  
Check: A fresh 360 px screenshot is dominated by the practice action. A web tester can still find support through About within two taps; the packaged Play build contains no tip entry.


## 4.2 The drills


### D06. Give the drill list a clear hierarchy
Screen: drills  
Now: Seven cards repeat descriptions, collapsed OPTIONS, and large gold Start buttons. The long column offers little guidance about where to begin.  
Direction: Group the unchanged drills under "Notes", "Chord shapes", and "Chord movement". Use compact rows with a 17 px title, one 14 px description, and a neutral 48 px "Start" action. Keep one recommended drill card expanded with the sole filled Start action. On a fresh save recommend Note hunt; do not present an invented mastery level. Returning recommendations depend on the new local progress work in D33.  
Why: The available practice becomes scannable without removing expert routes.  
Color blind: Group names and expansion state remain visible in text.  
Effort: M  
Check: From Drills, testers locate Triads within 10 seconds and two taps. At 360 px, the Notes group and the start of Chord shapes appear in the first screen.


### D07. Make current settings legible before Start
Screen: drills  
Now: The small OPTIONS disclosure hides important configuration and gives little evidence of the session about to begin.  
Direction: Replace OPTIONS with a 48 px "Practice settings" disclosure. Above it show a concise current summary such as "C · Open to 5 · All strings" or "Major triads · Strings 3 2 1 · Guided". Use instrument appropriate string numbers. Keep all existing options, show their current values, and restore settings through D33. Put Start after the settings when expanded; do not make the entire card another conflicting click target.  
Why: Players can start intentionally without repeatedly opening every panel.  
Color blind: Chosen options show checks and text, not filled chips alone.  
Effort: M  
Check: A tester states the selected fret range and help level without expanding settings. No disclosure or option is under 48 CSS px.


### D08. Fix rendered fret targets before shrinking anything else
Screen: run  
Now: The renderer uses 64 by 52 drawing units and a 432 unit guitar viewBox. At the source derived inner widths of about 302 px on a 360 px phone and 354 px on a 412 px phone, cells become about 44.7 by 36.4 px and 52.4 by 42.6 px respectively. Neither meets the brief in both dimensions.  
Direction: Make the interactive board use nearly the full screen content width, outside the card padding. Recompute SVG geometry from its actual container width: a 24 px fret gutter, 12 px trailing space, columns at least 48 px, and rows 52 px. At 360 px with 12 px outer margins, six strings fit in roughly 50 px columns. Match viewBox dimensions to rendered dimensions; do not scale the whole SVG down afterward. Cap four and five string columns at 64 px and center them. Use a visible five fret viewport with 48 px "Lower frets" and "Higher frets" controls when the full task extends beyond it. Keep the entire original task range and found notes; show range and remaining targets per window. A compact full neck overview is display only. Never create overlapping 48 px hit regions as a substitute.  
Why: An accidental neighboring fret tap must not be mistaken for a knowledge error. Fifteen 48 px rows alone need 720 px, so showing the whole neck at once cannot also satisfy small phone reachability.  
Color blind: Number every visible fret and keep a clear current range label; the overview uses symbols and counts.  
Effort: L  
Check: Measure every visible interactive SVG cell with getBoundingClientRect at 360 and 412 px. Width and height must each be at least 48 px with no overlaps. Complete every long range drill using the window controls; no target becomes unreachable.


### D09. Keep the task and feedback beside the action
Screen: run  
Now: Task metadata is small; Show me, Skip, End drill, timer, and feedback can fall below a tall neck.  
Direction: Use a 20 px task line, a 14 px context line, and a two line minimum feedback region directly above the board. Move Show me, Skip, and End into three 48 px controls in the exercise footer. Keep progress adjacent to the task. Hide elapsed time behind "Session details" unless the exercise explicitly needs time. In lessons center the displayed window around the taught shape with one spare fret where possible. In memory tests use the session chosen window and range controls; do not auto center on the answer and inadvertently supply a location hint.  
Why: The player can see the question, the relevant board, and the response without hunting down the page.  
Color blind: Progress and verdict are written; focus movement does not rely on a colored flash.  
Effort: M  
Check: At 360 by 800, task, five fret interaction window, feedback, and footer fit with no overlap. At larger text allow scrolling instead of reducing type or targets. A test never reveals its answer location by moving the viewport.


### D10. Say what was practiced before claiming it was learned
Screen: summary  
Now: The lesson ends with "5 chords learned", followed by Test me, optional extra chords, Again, and Back. A guided completion is not evidence of unaided recall.  
Direction: Replace the heading with "You practiced 5 chord shapes". Replace the neck with the summary as a new screen state and focus its heading. Make "Test these 5" the only filled action; put "Practice these again" and "Back to drills" below it. Preserve "Learn N more first" as a neutral option only when more distinct items actually exist. Use actual set size, including sets shorter than five.  
Why: The moment feels earned without overstating what the player knows.  
Color blind: Text states distinguish practice from recall; no green mastery badge is used for guided work.  
Effort: M  
Check: At either width the test action is visible immediately after completion. Guided completion never writes an unaided success result. Summary counts agree with the actual unique set.


### D11. Keep five as a default, not a scientific promise
Screen: summary  
Now: The teacher designed a related set of five, optionally extending toward eight, followed by a test of those items.  
Direction: Keep that structure for release. State "5 shapes, then try them from memory" before starting. Do not automatically lengthen the session or treat eight as a better score. If a set only contains six unique suitable items, say "Learn 1 more first". Use observed completion and return rates to decide whether a future optional shorter set is needed; do not change the teacher's selection logic in a UI pass.  
Why: Five is a manageable product hypothesis, not a universally optimal memory load. Players can understand and finish a bounded activity.  
Color blind: Use numbered steps and numeric counts instead of five colored circles alone.  
Effort: S  
Check: Observe at least five novice and five experienced players through one lesson and test. Record where they stop and whether they request a shorter set; do not infer learning effectiveness from completion alone.


### D12. Name the level of recall being tested
Screen: test  
Now: The test locks each correct note and signals it immediately. The source counts a chord as first try only if it has no wrong taps and no explicit Show me request.  
Direction: Keep immediate guidance and label the activity "Build from memory" with "Correct notes stay. Help is here if you need it." Summarize each chord as "First try", "Corrected", "With help", or "Skipped". Track automatic two miss reveals explicitly as help, not just explicit Show me. Keep the existing first try condition strict. A wrong string tap counts as a correction, never as a clean recall. Do not call this a blind assessment or a measure of long term mastery.  
Why: The new flow becomes a trustworthy practice test instead of an inflated completion score.  
Color blind: Each category has a written label and distinct symbol; green fill never means both completed and mastered.  
Effort: M  
Check: Exercise all four result paths, including automatic reveal and a tap on an unused string. The summary totals match exactly and no assisted chord appears under First try.


### D13. Make wrong note feedback useful and calm
Screen: test  
Now: Correct notes stay green; a wrong note flashes red, and a ring reveals a location after two misses. The current "Not that one" message provides little musical context.  
Direction: Keep interval labels inside markers. Add a check badge to locked notes, an X badge to the attempted wrong note, and an outlined hint marker. Preserve a written line until the next deliberate action: "That was D. Try another note on the B string." For a revealed location say "Hint shown on the B string". For an unused string say "Leave the A string silent for this shape". Keep the actual played pitch; make the success ding subtle and respect sound off. No punitive buzzer or extra failure animation.  
Why: The player gets usable information without a screen full of punishment.  
Color blind: Symbols, outlines, and persistent text encode every status even in monochrome.  
Effort: M  
Check: Complete a muted, grayscale test and identify right, wrong, hinted, and unused string states correctly. No wrong answer explanation disappears solely because its flash timed out.


### D14. Let the player own the pace between chords
Screen: test  
Now: A completed chord automatically advances after 1.5 seconds. That can erase the voicing before a player has heard or examined it.  
Direction: Hold the completed chord with "Hear chord" and a primary 48 px "Next chord". Reuse the footer area rather than adding another bar. Offer an optional "Move on automatically" setting for experienced players and remember it through D33. Stop pending advancement when leaving the run. Finish with "5 of 5 first try today" only when that is the actual result, plus "Practice again"; do not say "You know these now" from one pass.  
Why: A player can connect the shape, spelling, and sound, then continue when ready.  
Color blind: The completed state includes its name, spelling, check, and explicit Next action.  
Effort: M  
Check: A completed shape remains visible until Next with automatic mode off. Leaving and immediately starting another drill cannot advance the new drill through an old callback.


### D15. Match the verdict to the teacher's voicing target
Screen: test  
Now: In the reviewed source testTap accepts a matching pitch class on each target string using m % 12. That can accept octave displaced notes even when the prompt specifies an inversion. This is a source identified risk, not a reproduced Android failure.  
Direction: Ask the teacher to confirm the intended acceptance contract before changing it. If the exercise tests the taught voicing, validate its actual pitches, register, and intended bass relationship. If equivalent chord tones in other octaves are intentionally allowed, keep accepting them but do not label every accepted result as the requested inversion without checking sounding pitches. Use a shared acceptance rule in lesson and test. For reentrant instruments derive bass from sounding MIDI pitch, not drawn string order. Keep this a correctness fix within the existing exercise.  
Why: A theory teacher's app must not award an inversion label to a different sounding arrangement.  
Color blind: The correction names the musical relationship in words and shows the implicated note with an outline.  
Effort: M  
Check: For teacher approved fixture shapes, test exact voicings, one note displaced by 12 frets, and reentrant ukulele and banjo examples. Accepted results and displayed inversion names must agree with that approved contract.


### D16. Make open strings and screen reader actions unambiguous
Screen: run  
Now: The letter above an open string auditions it, while the separate open fret cell submits an answer. Both can look like the same musical action. Every fret currently sits in the tab order.  
Direction: Label the answer row "Open" and keep it 48 px high. In a drill, a tappable string header should submit that same open string answer when valid, or become a noninteractive label; reserve audition for a clearly labeled Hear action. A high fret window retains static string letters even though open notes are outside the range. Keep the banjo short string unavailable below its start. Use one keyboard entry point into the SVG and arrow navigation between valid cells, with Enter or Space to answer. Announce string, fret, and answer state; do not disclose the hidden note name in a recall exercise.  
Why: Beginners and assistive technology users can understand where an answer is entered.  
Color blind: Open, inactive, and selected states have labels and outlines independent of note color.  
Effort: M  
Check: A novice can find and submit an open note without confusing it with playback. Keyboard navigation reaches every valid cell without tabbing through a whole neck. Screen reader labels never leak a test answer.


## 4.3 Charts and the chord picker


### D17. Show a useful first chart instead of an empty wall
Screen: charts  
Now: The empty state offers a paragraph and New chart. Creating one immediately focuses the name field, which can bring up the keyboard before any music exists.  
Direction: Lead with "Try a chord change" and keep "New chart" as the primary action. Do not automatically focus the name field on entry; begin at Add a chord with an editable "Untitled chart" heading. A future example progression is covered in D38; do not invent a universal guitar shape for all instruments. In My chords, calculate emptiness after filtering for the current instrument and tuning, not from the total library length.  
Why: The first interaction creates sound rather than requiring administration.  
Color blind: Empty state instructions and named actions are fully textual.  
Effort: M  
Check: Create a chart and reach its chord picker in two taps without opening the keyboard. A ukulele library with only saved guitar chords shows an accurate empty state.


### D18. Make the chart behave like an editable musical sequence
Screen: charts  
Now: Chord boxes can already be selected, moved left or right, edited, and removed. Individual chords already support beat counts and tempo overrides; these are not missing features.  
Direction: Use chord cards at least 88 px wide and 72 px high, wrapping into reading order at narrow widths. Show the chord name at 20 px, its position number, and an explicit beat count. A selected card exposes the existing Move earlier, Move later, Edit, and Remove actions at 48 px. Use disabled states at sequence boundaries. During playback show "Playing 2 of 4 · A minor" and a moving playhead symbol, distinct from editing selection. Keep one visible Play or Stop action and the chart tempo; put voice and count sound under Playback settings.  
Why: The player can see what will happen and correct the progression without discovering hidden editing behavior.  
Color blind: Position numbers, a playhead, and selected outlines distinguish order, playback, and editing.  
Effort: M  
Check: Reorder D A E to D E A, change only one chord's beat count, then replay it. The edit takes no more than three actions after selecting the chord and the active position remains identifiable in grayscale.


### D19. Make auditioning the center of the picker
Screen: picker  
Now: The new preview bar is useful but sits after the chord bank. "After E" plays a two chord example using a fixed delay of 1100 ms.  
Direction: Keep the preview visible in a bottom panel above navigation: chord name, notes, a display only diagram, "Hear chord", "Hear E then F", and a 52 px "Add F" action. Reserve layout space so it covers nothing. Use the previous chord's beat count and tempo for the transition preview, or label a deliberate shortened preview clearly. Selecting another candidate cancels queued preview audio. After adding, show "F added as chord 4" and remain in the picker; Add can intentionally repeat the same chord. Preview alone must never mutate a chart.  
Why: Experimenting becomes a stable listen, compare, decide loop.  
Color blind: The chosen candidate has a check and its name; the commit action names exactly what it adds.  
Effort: M  
Check: Audition six candidates without changing chart length, add one, then intentionally add it again. Rapid candidate switching never plays a stale delayed chord. The preview remains visible at both widths.


### D20. Protect tuning and instrument meaning in saved music
Screen: charts  
Now: New charts and kept chords store the instrument, but not a tuning snapshot. Playback uses the current tuning. The standard guitar bank is still offered in other guitar tunings with an explanatory warning below it.  
Direction: P0: store instrument id, exact tuning MIDI array, short string starts, course count, and schema version with charts and saved voicings. Open each chart in its saved musical context without silently altering a separate practice setup. Do not relabel standard tuning shapes as their old chord names after a tuning change. In incompatible tuning, hide that preset bank behind "These shapes use standard guitar tuning" and offer the current instrument builder. Scope My chords by full tuning signature. For legacy charts whose tuning was never saved, ask once which tuning they use and preserve the original data; do not assume it can be recovered. A future explicit conversion is D37.  
Why: A saved progression must sound the same tomorrow even if today's practice uses Drop D.  
Color blind: Show the tuning name and full note sequence, not a warning color alone.  
Effort: L  
Check: Save a standard guitar chart, change global tuning, then reopen and compare every sounding pitch and label. Repeat with five string bass and custom tuning. No legacy file is silently rewritten under an assumed tuning.


### D21. Organize the bank without turning it into a catalog project
Screen: picker  
Now: Thirty one bank chips and an empty My chords section compete with a large Build action. Only standard guitar shapes are supplied in this bank.  
Direction: For compatible standard guitar, organize existing shapes into named sections "Major and minor", "Sevenths", and "Other colors" with 48 px minimum chips and 8 px gaps. Retain one neutral "Build a chord" action near the top. Keep My chords compact when empty and show recent compatible choices first only after the local history addition in D33. Other instruments should see an honest builder route instead of an empty section titled as though presets exist. Do not add hundreds of shapes before usage demonstrates demand.  
Why: Players can find and compare familiar material without confusing unsupported presets with broken UI.  
Color blind: Section headings and checkmarked candidates carry the hierarchy.  
Effort: M  
Check: Find Am, D7, and Asus4 in under 10 seconds each in a small usability check. Every non guitar instrument gets a useful action and no misleading guitar bank label.


### D22. Keep chord identity next to the fingers
Screen: builder  
Now: The name guesses, mute and open controls, and save actions come after a twelve fret board. A player can place notes without seeing what the app calls them.  
Direction: Put a persistent 72 px result area above the D08 board viewport: "Possible names", up to three 48 px name chips, and the sounding note list. If more height is needed, allow the result area to grow. Put per string Open and Mute states in a 48 px header row aligned with the strings, with a plain text legend. Show "Use in chart" as the primary action and "Keep in My chords" as secondary. Preserve user entered names when suggestions change and describe ambiguous labels as possibilities. After a shape is nudged, mark a manually chosen name for review rather than silently leaving an apparently verified old name.  
Why: The chord builder becomes a feedback instrument rather than a long form with a result at the bottom.  
Color blind: X, O, fret numbers, and named suggestions make every string state readable.  
Effort: M  
Check: Place three notes and see a possible name without scrolling. After changing a note or nudging the shape, the suggestion updates immediately and the player's chosen name is not overwritten.


### D23. Remove six string assumptions from the builder
Screen: builder  
Now: The source uses S.lefty ? 5-col : col in paintChordEditor, which is wrong for four and five strings. chordMidis uses tun()[s] + fret, while the board uses a short string offset in midiAt. Builder Open can also assign fret 0 to the banjo short string.  
Direction: P0: replace hardcoded mirror indices with NS()-1-col and reuse the same string mapping in large and small diagrams. Route analysis, audition, chart playback, preview note labels, and nudging through one validated pitch function. For the banjo short string, Open means its valid start fret and tuned sounding pitch; below start is unavailable, not zero. Validate migrated or imported fret arrays against their instrument context. Keep the established music exercises unchanged.  
Why: Wrong strings or pitches would undermine trust more than any missing feature.  
Color blind: Each string control shows its number, note, and explicit state in both orientations.  
Effort: M  
Check: For 4, 5, and 6 strings in both orientations, toggle every builder string and verify only the matching string changes. On standard banjo, the short string at its start sounds G4, not the offset pitch from adding five twice. Diagram, name analysis, and playback must agree.


## 4.4 Scales, Play, and the rhythm room


### D24. Put the scale under the thumb before the explanation
Screen: scales  
Now: Scale, Root, Form, vamp, hide map, position controls, and explanatory text precede a small board window. The five fret window is useful but rendered too small.  
Direction: Keep Scale and Root in one row, then a concise title such as "C major · Position 1 of 7". Use the D08 full width board geometry for the current position, retaining its complete note set and numbers first. Place 48 px Lower and Higher controls immediately below it. Put Form and fuller explanation in "Scale options" and "About this sound" disclosures. Label the sound control "Play backing chord" and show "Cmaj7" rather than relying on the word vamp.  
Why: The player can hear and explore the scale before reading several paragraphs.  
Color blind: Root uses R or 1 plus a double outline; every scale note retains its interval number.  
Effort: M  
Check: At 360 by 800 the player sees at least five usable fret rows and reaches the backing chord in one tap. Existing scale notes and intervals match the old build.


### D25. Make hidden maps an explicit practice state
Screen: scales  
Now: The map can be hidden, but the surrounding text does not strongly distinguish exploration from trying to recall it.  
Direction: Use a 48 px toggle labeled "Hide note map", changing to "Show note map" when active. Display "Map hidden. Tap to hear a note." Keep the selected scale, root, position, and static string labels visible. Never represent hidden map exploration as a scored drill. Retain immediate note information after a deliberate tap. Preserve the map state when moving between neighboring positions.  
Why: The user understands what vanished and how to recover it.  
Color blind: The state is written and indicated by an open or closed eye symbol with text.  
Effort: S  
Check: With sound muted, a tester can identify the current scale and restore its map without guessing. No passive tap is added to a recall score.


### D26. Make Play open onto a playable instrument
Screen: play  
Now: A paragraph and nine controls precede the board. Some useful features are present but compete with the core action.  
Direction: Show one sentence "Tap, hold, or slide along a string" and one 48 px Voice control above the neck. Put scale overlay, root, range, and the shared handedness control in "Play settings". Keep Loop and Full screen in a 48 px action row beneath the visible fret window. Move MIDI into Play settings with explicit supported, unavailable, waiting, and connected states. Do not promise that MIDI works in every Android wrapper. Keep an always reachable Stop sound control during active looping.  
Why: The immediate experience becomes making a sound, with advanced tools available when needed.  
Color blind: Recording, looping, and connected states have text and distinct symbols.  
Effort: M  
Check: From the Play tab, first note requires no scrolling and no configuration at 360 px. Hold and slide still work; range navigation does not trigger notes accidentally.


### D27. Give the looper and transport states plain names
Screen: play  
Now: The app already has a looper, sustained voices, a jam board, and MIDI input. Compact controls do not explain their current state or recovery paths well.  
Direction: Expose "Record loop", "Stop recording", "Play loop", and "Stop loop" as the current applicable actions, each 48 px. Show loop duration and whether a loop is temporary. Use "Clear loop" with Undo only when D35 is implemented; otherwise ask before discarding a nonempty loop. On tab changes and app backgrounding, stop or explicitly pause sounding voices according to one documented transport rule. Do not imply the loop is saved between visits until that is actually implemented.  
Why: A player can experiment without wondering what is recording, playing, or about to disappear.  
Color blind: Use a record circle, stop square, play triangle, and words together.  
Effort: M  
Check: Leave Play during a sustained note, a loop, and a MIDI held note; no unintended voice continues. Reenter and see an accurate loop state. Muting stops audible output without erasing the loop.


### D28. Make the rhythm hands readable without color
Screen: rhythm  
Now: The pattern has two colored rows, explanatory words, speed, Hear it, and LEFT and RIGHT pads; the pads fall low on the narrow screenshot.  
Direction: Place the pattern and mnemonic first, then two 96 px minimum pads labeled "LEFT · 2 per cycle" and "RIGHT · 3 per cycle" for 3 over 2, with corresponding counts for 4 over 3. Keep the teacher's existing hand assignment. Label every pattern row with its hand; show a moving vertical beat cursor and a visible hit symbol, not fill changes alone. Put Hear and Stop next to the tempo, move the longer explanation under "How to practice", and keep both pads visible together. Large text may scroll the page but never split the pad pair into separate screens. Do not add timing scores without a separately validated timing system.  
Why: The player can follow two simultaneous rhythms without decoding colors or losing a hand offscreen.  
Color blind: LEFT and RIGHT labels, row positions, beat counts, and cursor position carry the pattern.  
Effort: M  
Check: Both pads and the current cycle are visible at 360 by 800 with default text. A muted grayscale demonstration still explains which hand plays each event.


## 4.5 The visual system


Shared palette proposal, preserving the warm instrument character:

| Role | Dark | Light | Use |
| --- | --- | --- | --- |
| Background | #14100F | #F3EDE2 | Page |
| Surface | #211A17 | #FBF8F1 | Cards and panels |
| Main ink | #F0E9DD | #241C14 | Body and headings |
| Secondary ink | #B9AA9A | #66594B | Supporting labels |
| Accent | #E0B366 | #80551B | Main action and root identity |
| Accent ink | #21170C | #FFFFFF | Text on filled accent |
| Pass | #59CF91 | #146B42 | Correct status only |
| Fail | #FF837A | #A92F2B | Incorrect status only |
| Functional border | #8C7B6A | #8C7B6A | Required control outlines |
| Neck wood | #2A1C16 | #2A1C16 | Same dark wood in both themes |
| Fret wire | #C6AD83 | #C6AD83 | Position boundaries |
| String | #D8D5CE | #D8D5CE | String lines |
| Ordinary note | #D9E1E7 | #D9E1E7 | Filled marker with #17212B text |

These are candidate tokens, not a blanket accessibility certification. Verify actual foreground/background pairs, opacity, disabled states, focus, and gradients. Retain main ink for status sentences; use status colors as icons or solid badge fills with suitable contrasting text. [S6]


### D29. Keep one accent and reserve status colors for status
Screen: all  
Now: There are separate accent and gold values, red support emphasis, dark wood, pearl dots, gradients, and decorative card corners.  
Direction: Use the table above as shared CSS custom properties. Alias root gold to the accent instead of adding another competing action color. Use one filled primary action per screen or active panel. Keep decorative lattice corners on the Home identity card only; remove them from working drill and editor panels. Keep wood subtle and flatten note gradients so text contrast is predictable. Use pass and fail only for correctness, never for the tip jar or rhythm hand identity.  
Why: The app retains a recognizable warm character while the next action becomes obvious.  
Color blind: Every status color is accompanied by D13 symbols and text.  
Effort: M  
Check: Compare all fourteen screens in both themes: one clear primary action per active surface and no decorative element outshines a task or a note. Check rendered text contrast, not just hex values.


### D30. Use type sizes that survive a music stand
Screen: all  
Now: The source includes 11 px section labels, 11.5 px form labels, 12.5 px descriptions, and 10.5 px chart metadata; some text falls below the brief's floor.  
Direction: Use system fonts with 24/30 px weight 700 for page headings, 20/26 px weight 700 for the task and chord name, 17/23 px weight 600 for rows, 16/23 px weight 400 for body, 14/20 px weight 500 for labels and feedback, and 12/16 px only for secondary navigation or metadata. Render note labels at least 14 CSS px, accounting for SVG scale. Use 8 px small gaps, 12 px control gaps, 16 px panel padding, and 24 px section spacing. Remove all caps from teaching sentences. Never shrink text to keep a fixed panel height.  
Why: A player glancing between an instrument and a phone can read the task without leaning in.  
Color blind: Required labels use solid secondary ink or main ink, never low opacity color hints.  
Effort: M  
Check: At 200 percent text, no instruction or action clips, disappears, or overlaps the board. Normal text contrast is at least 4.5 to 1, and required graphical boundaries at least 3 to 1 where applicable. [S6, S7]


### D31. Define note states once for every neck
Screen: all  
Now: Root, target, correct note, wrong note, revealed location, and ordinary scale notes use different fills and rings, but color carries too much meaning.  
Direction: Create one marker specification shared by all inline SVG boards: root has R or 1 and a double outline; an ordinary scale note has its interval; selected input has a bold outer ring; confirmed note has a small check badge; incorrect attempt an X badge; revealed location a hollow dashed ring plus the word Hint in feedback. Never replace the musical interval with a status symbol; badges sit beside it within the cell. Provide a compact "Note symbols" key on first use and in Help. Ensure overlays have pointer events disabled.  
Why: The same visual vocabulary follows the player through lessons, maps, tests, and charts.  
Color blind: Every meaningful distinction survives monochrome and muted sound.  
Effort: M  
Check: Compare every note state in normal color, grayscale, and simulated common color vision deficiencies. Touch hit regions remain unchanged under badges and rings.


### D32. Apply accessible interaction to every shared control
Screen: all  
Now: Several chips and tab controls are below 48 px tall. SVG buttons exist, but the interface also needs coherent focus, status announcements, and reduced motion behavior.  
Direction: Set 48 px minimum rendered targets for all buttons, toggles, select controls, and relevant links, including compact library actions. Use a 3 px visible keyboard focus outline with 2 px separation. Announce verdicts through a polite live region without reading every animation frame. Respect reduced motion for confetti, scrolling, and pulse effects. On closing a settings panel restore focus to its opener; on changing screens focus the heading. Keep theme following the system for release. Add no new theme picker unless asked for.  
Why: Comfortable touch use and assistive access become part of the same implementation.  
Color blind: Focus and selection use outlines and symbols, not color changes alone.  
Effort: M  
Check: Audit all interactive controls at both widths and in both themes; none are smaller than the brief's 48 CSS px requirement. Keyboard and TalkBack routes finish a hunt, add a chord, and leave a dialog without a trap. Android guidance uses 48 dp; this project explicitly uses 48 CSS px, so verify both in the wrapper. [S7]


## 4.6 Gaps, ranked by practical value

These are proposed additions, not claims about existing capabilities. The ranking balances what a new player notices with the cost of losing work. Fix P0 correctness before starting any of them.


### D33. Remember where practice stopped
Screen: home  
Now: The app keeps aggregate taps, hits, shapes, hunts, and a miss grid. The reviewed grid uses string and fret keys without instrument or tuning context, and no durable current chord set or next review record is evident.  
Direction: Gap rank 1. Add a versioned local session record with instrument, tuning signature, drill settings, exact related chord set, stage, item position, and per item first try, correction, help, and skip outcomes. Show "Continue chord practice · 3 of 5" on Home only when a valid session exists. After completion offer a short "Review these shapes" route using existing exercises, prioritizing assisted items without removing correct ones forever. A simple revisit suggestion on the next day is enough initially; no streak penalties or unsupported optimal spacing claim. Separate future stats by instrument, tuning, drill, and task. Preserve old aggregate stats as legacy totals; do not fabricate their missing context.  
Why: Returning users get a reason to resume and a useful starting point. This is more valuable than an eighth drill at launch.  
Color blind: Review categories use words and counts; a heat map also offers a sortable text list of difficult positions.  
Effort: L  
Check: Close and reopen midway through a set; return to the exact remaining items in the correct context. Assisted results never increase unaided totals. Changing tuning cannot contaminate another tuning's miss history.


### D34. Make saved work portable without an account
Screen: charts  
Now: Charts and kept chords live in localStorage. No user facing export or restore control was found in the reviewed v11 HTML; save errors are swallowed.  
Direction: Gap rank 2. Add "Save a backup" and "Restore a backup" in About or Settings using a versioned JSON file containing charts, voicings, context, settings, and progress. Validate size, structure, numeric ranges, and instrument context before import. Show an import summary and default to keeping both when names conflict. Keep a recovery copy before replacement. Report "Could not save changes on this device" when storage fails and provide an export route. Use a standard file input and download where supported; verify the actual Android wrapper path before promising export there. A deliberate user export is different from background data collection. smartChord offers backup and restore, making this an established utility expectation. [S4]  
Why: People will invest more in writing charts if changing phones does not strand their work.  
Color blind: Save success, failure, and conflict options use written explanations and symbols.  
Effort: L  
Check: Export representative charts and settings, import into a clean profile, and compare all values and sounding pitches. Invalid or oversized files fail without altering current work; failed saving cannot produce a false Saved state.


### D35. Let people experiment without losing the original
Screen: charts  
Now: Charts have a deletion confirmation stating there is no undo. Chord removal and My chords deletion do not provide a reversible experimentation history.  
Direction: Gap rank 3. Add Undo and Redo for chart edits and builder note changes, plus "Duplicate chart" for a variation. Keep a capped in memory edit history and persist a short recently deleted list for whole charts and kept voicings. After removal show "Chord removed" with a 48 px Undo action and keep Undo available beyond a fleeting toast. Keep IDs distinct when duplicating. Never ask for confirmation on every reversible note edit.  
Why: Trying a different progression becomes low risk, which directly serves the studio's experimentation goal.  
Color blind: Undo and Redo are named controls; removal is stated explicitly.  
Effort: L  
Check: Remove, reorder, rename, and edit chords, then undo and redo each operation. Duplicate a chart and alter it without changing the original. A reopened app can recover a recently deleted chart.


### D36. Make rhythm support direct and dependable
Screen: rhythm  
Now: There are chart count sounds and polyrhythm playback. The chart Count control selects a continuing click or spoken count; the reviewed Play handler starts immediately, so a true lead in is not established despite the brief's count in wording.  
Direction: Gap rank 4. Add a direct "Metronome" mode alongside the existing polyrhythm modes, with BPM entry, a 48 px Tap tempo button, beats per bar, and accent control. Add a real optional one bar count in to charts, separate from the continuing click choice. Share an audio clock scheduler with chart and rhythm playback, using AudioContext time for events and scheduling ahead; drive visual beats from that clock. Browser timers can wake the scheduler, but should not define musical onset timing. Scope background behavior explicitly and stop cleanly on interruption. Preserve existing exercise content. [S9]  
Why: A guitarist expects to start a pulse without constructing a chart, and to know when to enter.  
Color blind: Beat numbers, an accent symbol, and a moving marker accompany the clicks.  
Effort: L  
Check: Verify one full bar precedes the first chord when enabled. Across three representative Android devices, log scheduling and measure audible timing separately; target stable intervals with no cumulative drift or stuck audio during a five minute run. No unsupported universal latency claim.


### D37. Transpose the music, not just one shape
Screen: charts  
Now: The builder can nudge a shape by a fret. A complete chart transposition command was not found.  
Direction: Gap rank 5. Add "Transpose chart" with a semitone offset, preview, and "Save as a new chart" default. Distinguish transposing sounding harmony from shifting a fingering. Recompute valid voicings for the saved instrument and tuning; if none is available within the supported fret range, flag that chord for manual rebuilding instead of silently clipping or wrapping it. Treat user custom names as labels that may need confirmation. Preserve rhythm and tempo overrides.  
Why: A progression can fit another singer or practice key without being rebuilt chord by chord. Chordbot and Solo document whole progression transposition. [S2, S3]  
Color blind: Before and after names and unresolved chords are listed in text.  
Effort: L  
Check: Transpose charts with open strings, slash chords, custom labels, and per chord timing. Verify pitch changes and valid frets; unsupported transformations stay uncommitted and clearly named.


### D38. Connect the rooms into a useful musical loop
Screen: charts  
Now: Lessons, saved chords, scales, and charts are capable but mostly separate destinations. The chart jam board already exists.  
Direction: Gap rank 6. After a completed lesson offer "Use these shapes in a chart" with an editable preview of that exact set, preserving its voicings and tuning. From a chart offer "Explore over this chord" to the existing scales or jam surface with current chord identity retained. Suggest only teacher approved scale relationships with explanations such as "Contains these chord tones"; never imply one scale fits every change. Add one optional teacher authored example chart per supported instrument only when valid voicings have been checked. User created charts remain the main route.  
Why: The app can demonstrate why practicing the notes matters, using tools it already owns.  
Color blind: Carry chord names and interval labels across screens, rather than connecting them through matching colors.  
Effort: L  
Check: A player completes a lesson, previews a chart from its exact shapes, and hears it within three navigation actions. No tuning context or original voicing is lost.


### D39. Make the existing scale collection easier to search
Screen: scales  
Now: The app already contains 22 scales and several forms. The selector is a long menu, and no pinned favorites route was found.  
Direction: Gap rank 7. Add local text search with aliases such as "major" and "Ionian", and a small pinned list. Show common names first while retaining theoretical names. Display Recently used only after real use. Keep the full collection available under the same selector. Do not add more scales just to compete with a larger catalog.  
Why: Players repeatedly revisit a small subset; faster retrieval beats a bigger number in a listing.  
Color blind: Pinned state has a star and the word Pinned in its accessible name.  
Effort: M  
Check: Find C major pentatonic or a pinned mode within two selection actions after opening Scales. Searching an alias produces the correct existing scale, with no duplicate definitions.


### D40. Consider listening practice only after the core works
Screen: drills  
Now: The app already synthesizes notes and chords, but no dedicated hear and identify exercise is specified. Competitors advertise ear training; this is not a launch requirement. [S1, S5]  
Direction: Gap rank 8. Prototype one optional teacher authored interval listening exercise: hear a pair, replay it, then choose from a small set of named intervals using 48 px answer buttons. No microphone, account, or new sound asset is required. Use an intentional start gesture, volume control, and a replay limit only if pedagogically justified. Keep it out of launch until teachers validate the examples and users request it.  
Why: It could connect visual interval knowledge to hearing without turning FRETWORK into a full course.  
Color blind: Answers and feedback use interval names and symbols; do not rely on answer pad colors.  
Effort: L  
Check: A teacher validates every interval and register example. Users can distinguish replay from answer selection; the feature is unavailable with a clear explanation when audio cannot start.


## 4.7 The Google Play listing


### D41. Lead with the concrete activity
Screen: listing  
Now: The short description lists several tools. The full description leads with a positioning statement rather than the tap interaction a stranger needs to understand.  
Direction: Use this short description: "Learn fretboard notes and chord shapes with tap practice. Free and offline." Lead the full description with "Tap the fretboard to find notes, build chord shapes, and test what you remember." Then identify the five instruments and the teacher. Say early that this is screen based practice and does not listen to an instrument. Use the revised full copy below only after the claims gate in D43 passes.  
Why: A person can decide immediately whether this is the practice tool they need.  
Color blind: The promise is conveyed in words and does not depend on screenshot highlights.  
Effort: S  
Check: Count the short description under 80 characters. In a five second comprehension test, at least 4 of 5 people identify that they tap the screen and do not need to connect a guitar.


### D42. Tell a six screenshot story
Screen: listing  
Now: The brief asks for six store screenshots but supplies fourteen review screen types, not a verified six image store sequence.  
Direction: Produce real screenshots after the P0 fixes in this order: 1 "Find notes on the neck" with a readable C hunt; 2 "Practice a set. Try it from memory" with the chord test and explicit first try feedback; 3 "Hear a change before you add it" with the picker audition bar; 4 "Build your own chord charts" with a short playing progression; 5 "Explore scales by interval" with a large map and backing chord action; 6 "Practice your instrument" showing the instrument selector and a correctly rendered non guitar neck. Show rhythm and voices in later listing text. Use one brief headline per image and actual states, no fake ratings or invented accomplishments.  
Why: The first images explain the strongest experience rather than presenting a menu inventory.  
Color blind: Use screenshots with status symbols and labels, not green and red dots alone.  
Effort: M  
Check: At a small store thumbnail size, viewers can explain images 1 through 3 without reading the full description. Every pictured action exists in the release build.


### D43. Remove unsupported claims and test the wrapper
Screen: listing  
Now: The listing says missed material returns sooner, describes a metronome, and promises offline use and that nothing leaves the device. The reviewed miss grid is written but was not found in question selection; the page registers an external sw.js, and includes optional feedback and platform specific code.  
Direction: P0: remove "What you miss comes back sooner" until D33 or an independently verified adaptive selector exists. Do not call the current Count dropdown a count in. Describe chart playback and the two polyrhythms precisely until D36 exists. Verify airplane mode cold starts after setup, a fresh installation's first offline launch, saved chart reopening, and interrupted updates in the actual Play wrapper. The source remains one HTML application, but offline behavior also depends on its existing service worker and packaging. A web fix can be cached; do not assume every installed copy updates instantly. Verify no unintended sign in or paid platform branch is reachable in Play. Say "Practice and charts stay on your device" if verified, with an accurate separate explanation of deliberate feedback or export. No legal compliance conclusion is implied by this UI review.  
Why: Clear limitations prevent the first reviews from becoming complaints about promised behavior.  
Color blind: Offline and unsupported states use plain text and a recognizable status symbol.  
Effort: M  
Check: Complete a release claims checklist on the signed Android build. Claims about privacy and offline use require inspecting relevant packaging, worker, and network behavior, not just index.html. If a claim cannot be verified, narrow or omit it. [S8]


### D44. Explain the new test without promising mastery
Screen: listing  
Now: The current full description does not give the new related chord sets and memory test enough prominence.  
Direction: Put a short chord practice paragraph immediately after note drills: "Practice a related set of chord shapes, then build the same shapes from memory. Correct notes stay in place, and hints help when you get stuck." If D12 ships, add "See which shapes you got first try and which needed help." Avoid "master chords", "learn in five minutes", or claims that screen tapping verifies physical guitar technique. Keep every promised instrument route accurate; the 31 preset shapes are a standard guitar bank, not a universal bank.  
Why: The strongest recent addition is understandable and its result is honestly bounded.  
Color blind: Listing language names success and assistance instead of explaining them as green or red.  
Effort: S  
Check: A new reader can explain the difference between guided practice and the memory test. Every claim maps to a visible release behavior, and the teacher approves the musical wording.


### Suggested listing copy after verification

Short description, 75 characters:

> Learn fretboard notes and chord shapes with tap practice. Free and offline.

Full description draft. Keep the offline sentence only if D43 passes; use the first try result sentence only if D12 ships.

> Tap the fretboard to find notes, build chord shapes, and test what you remember.
>
> Fretwork is a practice room built by a working guitar and theory teacher. Practice on your screen wherever you are. It does not use a microphone or judge your playing technique.
>
> FIND YOUR WAY AROUND THE NECK
>
> Hunt for notes, name a highlighted fret, and find intervals from a root. Choose your fret range and practice settings.
>
> PRACTICE CHORD SHAPES, THEN TRY THEM FROM MEMORY
>
> Work through related triads and seventh chords, explore inversions, and hear how changing one note changes a chord. Then rebuild your practiced set from memory. Correct notes stay in place, and hints help when you get stuck. See which shapes you got first try and which needed help.
>
> HEAR YOUR IDEAS
>
> Preview a chord and hear it after the previous chord before adding it to your chart. Build your own shapes, explore possible chord names, and keep voicings for later. Set chart tempo and beats, with individual chord overrides when you need them. A starter shape bank is available for standard guitar tuning.
>
> EXPLORE SCALES AND RHYTHM
>
> View scales by interval, move between positions, and play over a backing chord. Explore playable voices, a looper, and the rhythm room for 3 over 2 and 4 over 3 practice.
>
> FIVE INSTRUMENTS
>
> Guitar, bass, ukulele, banjo, and mandolin, with supported alternate tunings, custom tuning, and left handed display.
>
> Free. No ads, account, or subscription. Practice and charts stay on your device. Works offline.
>
> From Sky Wolf Studio.


## 4.8 Three things to cut, and three references


### Three cuts

1. The launch screen roadmap paragraph about unfinished sheet music, backing tracks, and CAGED features.
2. Repeated all drills and my charts Home shortcuts, plus redundant instructions above working boards.
3. The always visible timer in untimed drills and the word learned as a reward for guided completion.


### Three moments to study

1. **Solo: receiving the next interval task.** Study how one current root or chord and one interval function define the job. Transfer that clarity to the FRETWORK task header, not Solo's microphone input. The documented trainer model supports this reference; I did not benchmark its current mobile UI. [S2]
2. **Chordbot: changing a chord in a progression.** Study the separation of root, chord type, duration, inversion, and playback context. Borrow the musical editing structure, not its full arranger or track catalog. Its documentation and screenshot page show this moment. [S3]
3. **smartChord: protecting work before changing devices.** Study explicit backup creation and restore choices, then implement a much smaller local file version suited to FRETWORK. Do not copy cloud dependencies or accounts. [S4]

## Competitive comparison and positioning

These are adjacent practice and composition tools, not a ranking of overall quality. Product pages describe capabilities; prices, user counts, star ratings, and subscription terms are intentionally not used as decision evidence here.

| Area | FRETWORK v11 evidence | Relevant existing products | Practical decision |
| --- | --- | --- | --- |
| Note and interval practice | Note hunt, Name that fret, Intervals | Fretonomy markets more than 30 training games; Solo describes four focused trainers. [S1, S2] | Match clarity and reliability before adding drill count. |
| Instrument support | Five families; several tunings, custom notes, mirror | Fretonomy markets nine instrument configurations; Guitar Fretboard: Scales advertises custom configurations from 1 to 14 strings. [S1, S5] | Five working instruments are more credible than a larger selector with broken mirror or tuning behavior. |
| Chord learning | Related sets, guided shapes, a memory build, inversions, one note ladder | Solo has chord changes and interval function practice; Fretonomy advertises chord and theory games. [S1, S2] | Present FRETWORK's related set to recall flow prominently without claiming it is unique. |
| Progress and return visits | Aggregate counters and position misses; limited context | Fretonomy advertises progress across instruments. [S1] | Add exact session resume and honest assisted versus first try results. |
| Scale exploration | 22 scales, interval labels, positions, backing chord, hide map | Fretonomy advertises a much larger scale catalog; Guitar Fretboard: Scales documents custom scales, CAGED, and scale chord overlays. [S1, S5] | Improve board size, retrieval, and chord context. More catalog entries are low priority. |
| Chord experimentation | Name suggestions, preview, transition audition, charts | Chordbot documents chord type, duration, inversion, slash bass, transposition, and exports. [S3] | Preserve the new audition bar; add Undo and portability before arranger complexity. |
| Existing chart editing | Reorder, rename, remove, per chord beat and tempo overrides | Chordbot offers more extensive arrangement tools. [S3] | Improve discovery; do not reimplement features already present. |
| Backup and moving devices | No backup UI found in reviewed HTML | smartChord explicitly documents backup, restore, and device migration. [S4] | Local export and restore are valuable even without accounts. |
| Rhythm | Chart click/count sounds and two polyrhythm patterns | Guitar Fretboard: Scales documents a metronome with meter controls. [S5] | Give rhythm a direct entry and distinguish a lead in from ongoing count sounds. |
| Playing a physical instrument | Deliberately screen based, no microphone | Solo and Fretonomy describe instrument listening. [S1, S2] | Keep FRETWORK's boundary. Do not claim that successful tapping demonstrates playing technique. |
| Sound and creation | Seven voices, looper, playable neck, MIDI input | Competitors cover overlapping sound and composition use cases, with differing scope. | Keep these as supporting tools; verify MIDI and audio in the wrapper before emphasizing them. |

**Positioning recommendation:** a free, private, teacher designed place to practice and experiment with the neck in short visits. Show a useful action immediately. The combination is attractive; it is not evidence of an uncontested market or guaranteed downloads. Long courses, licensed song libraries, social feeds, staff notation, large backing track catalogs, and CAGED expansion can wait.

## Release verification that resolves actual risks

1. **Core geometry:** every visible fret cell and action passes the rendered 48 px requirement at 360 and 412 CSS pixels. Test short screens and large text, not width alone. Do not enlarge markers while leaving small underlying cells.
2. **Instrument matrix:** exercise guitar standard plus an alternate and custom tuning, four and five string bass, high G and low G ukulele, banjo short string, and mandolin courses in both orientations. Verify UI labels, sounding pitches, diagrams, and saved context agree. Course pairs are one input course unless a feature explicitly requires otherwise.
3. **Chord truth:** the teacher approves acceptance rules for register, inversion, and equivalent notes. Validate the lesson and test against the same examples. Do not secretly change what a drill teaches to accommodate UI code.
4. **State truth:** first try, corrected, hinted, skipped, and abandoned states remain distinct. Check repeated taps, rapid navigation, stale timeouts, and switching instrument mid run. Do not convert incomplete work into success.
5. **Creative safety:** audition never commits; Add commits once per deliberate activation; reordering retains timing; retuning does not change saved chart pitches; backup and Undo get focused checks when implemented.
6. **Platform truth:** test actual packaged app offline behavior, sound startup and stop, background interruptions, system Back, and supported MIDI states. Inspect the worker update strategy. Registration of a worker alone does not prove offline availability. [S8]
7. **Privacy preserving measurement:** begin with observed sessions and optional local counters. Proposed events are first action, first note, lesson complete, test started, test result, preview, and add. Store duration and outcomes locally only; share a diagnostic file solely after a deliberate user action. No analytics SDK or automatic uploads are part of these directions.

Run a small formative review with five beginners and five existing players if practical. Include at least one left handed player and a non guitar instrument; use screen reader and large text checks separately if the recruited sample does not include those needs. This is a usability sample, not evidence of population wide learning outcomes. Main measures are time to first note, unwanted neighboring taps, completion of a lesson and test, ability to interpret help, and time to audition then add a chord. Compare the same tasks before and after the redesign. Do not delay launch for statistically persuasive growth experiments when basic correctness has not yet passed.

## Sources and traceability

[B1] Supplied PDF: “FRETWORK Astra UI review brief (select all, copy, paste into Astra).pdf”, dated 10 October 2026. Used for goals, constraints, intended exercise semantics, requested structure, and listing draft. Some implementation claims differ from source, explicitly noted above.

[B2] [FRETWORK live app](https://skywolfstudio.com/fretwork/), public HTML downloaded and inspected on 10 October 2026; browser Home and beginner hunt inspected. Relevant source functions: renderBoard, paintChordEditor, chordMidis, midiAt, renderChordPick, renderCharts, runShapeTest, testTap, testDone, record, save, and the chart playback handler. Source observations are not a full security, musical correctness, or Android audit.

[B3] [Supplied phone screenshot gallery](https://lucidwinds.com/docs/briefs/fretwork/), fourteen screen types at 360 and 412 CSS px. Used for visual hierarchy, clipping, fold placement, and dark theme comparisons. Live browser inspection supplied the light theme view.

[S1] [Fretonomy official product page](https://fretonomy.com/). Developer advertised training breadth, instrument support, progress, scales, and listening tools. Accessed 10 October 2026.

[S2] [Solo official product page](https://www.solotrainer.app/). Documented note, interval, changes, and scale trainers, progression transposition, and microphone model. Accessed 10 October 2026.

[S3] [Chordbot screenshots and feature explanations](https://chordbot.com/screenshots/) and [Chordbot manual](https://chordbot.com/manual/). Chord editing, inversions, song transposition, exports, and arrangement context. The manual is labeled version 3.0 and last updated in 2020; it is feature documentation, not evidence of a recent release. Accessed 10 October 2026.

[S4] [smartChord backup and restore documentation](https://smartchord.de/docs/general/backup-restore/). Backup, restore, and device migration. Accessed 10 October 2026.

[S5] [Guitar Fretboard: Scales official feature page](https://guitarfretboardapps.com/index.html). Scales, instrument configuration, overlays, ear training, and metronome features. Accessed 10 October 2026.

[S6] [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Use for text contrast evaluation, not as proof of complete app conformance. Accessed 10 October 2026.

[S7] [Android accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/apps). Touch targets and accessible interaction. Android dp is not automatically identical to CSS px in every embedding. Accessed 10 October 2026.

[S8] [MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers). Caching, lifecycle, and offline behavior. Accessed 10 October 2026.

[S9] [MDN: Advanced techniques, creating and sequencing audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques). Audio clock scheduling and lookahead sequencing. Accessed 10 October 2026.

## Machine readable handoff

```json
{
  "app": "fretwork",
  "model": "GPT",
  "date": "2026-10-10",
  "directions": [
    {
      "id": "D01",
      "screen": "home",
      "effort": "M",
      "title": "Make the first action unmistakable",
      "summary": "Keep one 56 px high primary action, \"Find your first notes\", with the subtitle \"Tap every C, open strings to fret 5\"."
    },
    {
      "id": "D02",
      "screen": "home",
      "effort": "M",
      "title": "Expose the instrument without a setup detour",
      "summary": "Show a 48 px \"Guitar · Standard\" setup row on Home and a compact equivalent on each destination screen."
    },
    {
      "id": "D03",
      "screen": "home",
      "effort": "S",
      "title": "Reduce the welcome block and duplicate routes",
      "summary": "Use a 24 px heading \"Know your neck\" and one 16 px sentence \"Find notes, build chords, and hear how they fit.\" Move the teacher credit and privacy detail below the doors."
    },
    {
      "id": "D04",
      "screen": "all",
      "effort": "M",
      "title": "Move the five destinations within thumb reach",
      "summary": "Use the same five destinations in a 64 px bottom navigation bar, plus the device safe area, with a minimum 48 px hit area per item."
    },
    {
      "id": "D05",
      "screen": "home",
      "effort": "S",
      "title": "Keep the web tip jar visible but secondary",
      "summary": "Place a neutral 48 px \"Support Fretwork\" button in an About area below the main routes with \"Optional."
    },
    {
      "id": "D06",
      "screen": "drills",
      "effort": "M",
      "title": "Give the drill list a clear hierarchy",
      "summary": "Group the unchanged drills under \"Notes\", \"Chord shapes\", and \"Chord movement\"."
    },
    {
      "id": "D07",
      "screen": "drills",
      "effort": "M",
      "title": "Make current settings legible before Start",
      "summary": "Replace OPTIONS with a 48 px \"Practice settings\" disclosure."
    },
    {
      "id": "D08",
      "screen": "run",
      "effort": "L",
      "title": "Fix rendered fret targets before shrinking anything else",
      "summary": "Make the interactive board use nearly the full screen content width, outside the card padding."
    },
    {
      "id": "D09",
      "screen": "run",
      "effort": "M",
      "title": "Keep the task and feedback beside the action",
      "summary": "Use a 20 px task line, a 14 px context line, and a two line minimum feedback region directly above the board."
    },
    {
      "id": "D10",
      "screen": "summary",
      "effort": "M",
      "title": "Say what was practiced before claiming it was learned",
      "summary": "Replace the heading with \"You practiced 5 chord shapes\"."
    },
    {
      "id": "D11",
      "screen": "summary",
      "effort": "S",
      "title": "Keep five as a default, not a scientific promise",
      "summary": "Keep that structure for release."
    },
    {
      "id": "D12",
      "screen": "test",
      "effort": "M",
      "title": "Name the level of recall being tested",
      "summary": "Keep immediate guidance and label the activity \"Build from memory\" with \"Correct notes stay."
    },
    {
      "id": "D13",
      "screen": "test",
      "effort": "M",
      "title": "Make wrong note feedback useful and calm",
      "summary": "Keep interval labels inside markers."
    },
    {
      "id": "D14",
      "screen": "test",
      "effort": "M",
      "title": "Let the player own the pace between chords",
      "summary": "Hold the completed chord with \"Hear chord\" and a primary 48 px \"Next chord\"."
    },
    {
      "id": "D15",
      "screen": "test",
      "effort": "M",
      "title": "Match the verdict to the teacher's voicing target",
      "summary": "Ask the teacher to confirm the intended acceptance contract before changing it."
    },
    {
      "id": "D16",
      "screen": "run",
      "effort": "M",
      "title": "Make open strings and screen reader actions unambiguous",
      "summary": "Label the answer row \"Open\" and keep it 48 px high."
    },
    {
      "id": "D17",
      "screen": "charts",
      "effort": "M",
      "title": "Show a useful first chart instead of an empty wall",
      "summary": "Lead with \"Try a chord change\" and keep \"New chart\" as the primary action."
    },
    {
      "id": "D18",
      "screen": "charts",
      "effort": "M",
      "title": "Make the chart behave like an editable musical sequence",
      "summary": "Use chord cards at least 88 px wide and 72 px high, wrapping into reading order at narrow widths."
    },
    {
      "id": "D19",
      "screen": "picker",
      "effort": "M",
      "title": "Make auditioning the center of the picker",
      "summary": "Keep the preview visible in a bottom panel above navigation: chord name, notes, a display only diagram, \"Hear chord\", \"Hear E then F\", and a 52 px \"Add F\" action."
    },
    {
      "id": "D20",
      "screen": "charts",
      "effort": "L",
      "title": "Protect tuning and instrument meaning in saved music",
      "summary": "P0: store instrument id, exact tuning MIDI array, short string starts, course count, and schema version with charts and saved voicings."
    },
    {
      "id": "D21",
      "screen": "picker",
      "effort": "M",
      "title": "Organize the bank without turning it into a catalog project",
      "summary": "For compatible standard guitar, organize existing shapes into named sections \"Major and minor\", \"Sevenths\", and \"Other colors\" with 48 px minimum chips and 8 px gaps."
    },
    {
      "id": "D22",
      "screen": "builder",
      "effort": "M",
      "title": "Keep chord identity next to the fingers",
      "summary": "Put a persistent 72 px result area above the D08 board viewport: \"Possible names\", up to three 48 px name chips, and the sounding note list."
    },
    {
      "id": "D23",
      "screen": "builder",
      "effort": "M",
      "title": "Remove six string assumptions from the builder",
      "summary": "P0: replace hardcoded mirror indices with NS()-1-col and reuse the same string mapping in large and small diagrams."
    },
    {
      "id": "D24",
      "screen": "scales",
      "effort": "M",
      "title": "Put the scale under the thumb before the explanation",
      "summary": "Keep Scale and Root in one row, then a concise title such as \"C major · Position 1 of 7\"."
    },
    {
      "id": "D25",
      "screen": "scales",
      "effort": "S",
      "title": "Make hidden maps an explicit practice state",
      "summary": "Use a 48 px toggle labeled \"Hide note map\", changing to \"Show note map\" when active."
    },
    {
      "id": "D26",
      "screen": "play",
      "effort": "M",
      "title": "Make Play open onto a playable instrument",
      "summary": "Show one sentence \"Tap, hold, or slide along a string\" and one 48 px Voice control above the neck."
    },
    {
      "id": "D27",
      "screen": "play",
      "effort": "M",
      "title": "Give the looper and transport states plain names",
      "summary": "Expose \"Record loop\", \"Stop recording\", \"Play loop\", and \"Stop loop\" as the current applicable actions, each 48 px."
    },
    {
      "id": "D28",
      "screen": "rhythm",
      "effort": "M",
      "title": "Make the rhythm hands readable without color",
      "summary": "Place the pattern and mnemonic first, then two 96 px minimum pads labeled \"LEFT · 2 per cycle\" and \"RIGHT · 3 per cycle\" for 3 over 2, with corresponding counts for 4 over 3."
    },
    {
      "id": "D29",
      "screen": "all",
      "effort": "M",
      "title": "Keep one accent and reserve status colors for status",
      "summary": "Use the table above as shared CSS custom properties."
    },
    {
      "id": "D30",
      "screen": "all",
      "effort": "M",
      "title": "Use type sizes that survive a music stand",
      "summary": "Use system fonts with 24/30 px weight 700 for page headings, 20/26 px weight 700 for the task and chord name, 17/23 px weight 600 for rows, 16/23 px weight 400 for body, 14/20 px weight 500 for labels and feedback, and 12/16 px only for secondary navigation or metadata."
    },
    {
      "id": "D31",
      "screen": "all",
      "effort": "M",
      "title": "Define note states once for every neck",
      "summary": "Create one marker specification shared by all inline SVG boards: root has R or 1 and a double outline; an ordinary scale note has its interval; selected input has a bold outer ring; confirmed note has a small check badge; incorrect attempt an X badge; revealed location a hollow dashed ring plus the word Hint in feedback."
    },
    {
      "id": "D32",
      "screen": "all",
      "effort": "M",
      "title": "Apply accessible interaction to every shared control",
      "summary": "Set 48 px minimum rendered targets for all buttons, toggles, select controls, and relevant links, including compact library actions."
    },
    {
      "id": "D33",
      "screen": "home",
      "effort": "L",
      "title": "Remember where practice stopped",
      "summary": "Gap rank 1."
    },
    {
      "id": "D34",
      "screen": "charts",
      "effort": "L",
      "title": "Make saved work portable without an account",
      "summary": "Gap rank 2."
    },
    {
      "id": "D35",
      "screen": "charts",
      "effort": "L",
      "title": "Let people experiment without losing the original",
      "summary": "Gap rank 3."
    },
    {
      "id": "D36",
      "screen": "rhythm",
      "effort": "L",
      "title": "Make rhythm support direct and dependable",
      "summary": "Gap rank 4."
    },
    {
      "id": "D37",
      "screen": "charts",
      "effort": "L",
      "title": "Transpose the music, not just one shape",
      "summary": "Gap rank 5."
    },
    {
      "id": "D38",
      "screen": "charts",
      "effort": "L",
      "title": "Connect the rooms into a useful musical loop",
      "summary": "Gap rank 6."
    },
    {
      "id": "D39",
      "screen": "scales",
      "effort": "M",
      "title": "Make the existing scale collection easier to search",
      "summary": "Gap rank 7."
    },
    {
      "id": "D40",
      "screen": "drills",
      "effort": "L",
      "title": "Consider listening practice only after the core works",
      "summary": "Gap rank 8."
    },
    {
      "id": "D41",
      "screen": "listing",
      "effort": "S",
      "title": "Lead with the concrete activity",
      "summary": "Use this short description: \"Learn fretboard notes and chord shapes with tap practice."
    },
    {
      "id": "D42",
      "screen": "listing",
      "effort": "M",
      "title": "Tell a six screenshot story",
      "summary": "Produce real screenshots after the P0 fixes in this order: 1 \"Find notes on the neck\" with a readable C hunt; 2 \"Practice a set."
    },
    {
      "id": "D43",
      "screen": "listing",
      "effort": "M",
      "title": "Remove unsupported claims and test the wrapper",
      "summary": "P0: remove \"What you miss comes back sooner\" until D33 or an independently verified adaptive selector exists."
    },
    {
      "id": "D44",
      "screen": "listing",
      "effort": "S",
      "title": "Explain the new test without promising mastery",
      "summary": "Put a short chord practice paragraph immediately after note drills: \"Practice a related set of chord shapes, then build the same shapes from memory."
    }
  ],
  "gaps": [
    "Remember practice context and offer local review based on actual results.",
    "Export and restore charts, voicings, settings, and progress without an account.",
    "Undo destructive edits and create safe chart variations.",
    "Provide a direct metronome entry and genuine count in with dependable scheduling.",
    "Transpose a complete chart while preserving valid instrument voicings.",
    "Connect practiced chords, charts, scales, and the jam board.",
    "Search and pin scales without expanding the underlying catalog.",
    "Offer optional listening practice without microphone input."
  ],
  "cuts": [
    "The launch screen roadmap paragraph about unfinished sheet music, backing tracks, and CAGED features.",
    "Repeated all drills and my charts Home shortcuts, plus redundant instructions above working boards.",
    "The always visible timer in untimed drills and the word learned as a reward for guided completion."
  ],
  "references": [
    "Solo: the moment one interval function is presented against one current root or chord.",
    "Chordbot: the moment a chord or inversion is changed while the progression remains the editing context.",
    "smartChord: the moment saved musical work is backed up and restored on another device."
  ]
}
```
