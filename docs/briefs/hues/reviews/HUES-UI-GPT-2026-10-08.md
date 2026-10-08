# HUES UI review

Model: GPT (ChatGPT / Codex)  
Date: 2026-10-08  
Deliverable: ranked implementation directions for the planning and coding models

## Decision

HUES should feel like a small, precise color instrument with a collectible gallery around it. Its strongest visual identity is the comparison between two colors. Protect that comparison, bring its controls together, and make the result teach one useful thing. A painted workshop is not the missing ingredient.

The highest priority discovery is that presentation can interfere with the task itself. The current code applies screen grain, a red urgency vignette, a brightness flash on the target at round start, and colored decorative frames. These can change the rendered appearance or surround of the colors while the timer is running. Fix that before commissioning scenery.

### Evidence and limits

I read the supplied brief and notes, visually inspected all ten supplied JPEGs, downloaded the live public HTML, and used the live interface through first launch, rules, and a Daily timeout. The supplied images are the phone layout evidence. The browser session was not a controlled 360 or 412 CSS px device test; proposed dimensions below require implementation validation on those widths. I did not complete a Daily set, purchase a frame, inspect all 112 frame images, or physically test thumb reach. Later states are source reviewed where noted, not claimed as visually tested.

Sources: [brief](https://lucidwinds.com/docs/briefs/ASTRA-HUES-UI-BRIEF.txt), [ten phone screenshots](https://lucidwinds.com/docs/briefs/hues/), [live game and its HTML](https://lucidwinds.com/satellites/hues/). Retrieved on the review date. These are a changing build, not a versioned release.

### Corrections to the brief

| Brief or annotation | What the evidence supports | Consequence |
| --- | --- | --- |
| 112 frames are unused | Live HTML has 112 image frame entries plus eight CSS frames. `renderShop()` iterates all entries; play and sharing already have image frame paths. Individual image validity was not audited. | Organize and verify the existing integration. Do not rebuild it from zero. |
| Unlabeled coin count during play | `#scoreVal` renders `G.score`. Coins are separate on the menu and shop. | Label it Score. Do not add a second coin counter to play. |
| Endless has no lives and an ellipsis button | The three dots in the supplied image correspond to the three 8 px life indicators in `#lives`. They are not a menu button. | Lives exist but are visually ambiguous. |
| Timer digits and bar are redundant | They provide precise remaining time and a glanceable proportion. | Keep both, with a smaller numeric treatment. |
| Seven daily goals | Live code selects three goals from a pool of seven. | Show progress for today's three. |
| Precision margin about 3 | Code uses `max(3, tolerance × 0.28)`. At starting Normal tolerance 30, that is 8.4. | Explain bonuses from actual round values, not a fixed 3. |
| Seven menu chips mean nothing | They are seeded decorative colors, but do not explain the task or show completed rounds. | Replace with a useful comparison motif. |

### Build rank

Directions remain grouped in the requested order. Execute this priority order across sections:

| Rank | Work | Directions |
| --- | --- | --- |
| 1 | Protect input, visual color fidelity, and accessible screen state | D01, D02, D14, D17, D33 |
| 2 | Repair the play layout and explain score and survival | D08 through D13, D15, D16, D18, D19, D29 |
| 3 | Teach the controls and make results useful | D03 through D07, D20 through D24, D28 |
| 4 | Finish collection, goals, and visual consistency | D25 through D27, D30 through D32 |

Effort: S is under two hours; M is about a day; L is several days. These are incremental estimates for one developer who knows this file. Overlapping directions should be implemented together. Checks are proposed acceptance targets, not measured improvements. No scoring curves, round counts, currencies, prices, or target generation need changing.

## 4.1 The first ten seconds

### D01. Stop congratulating an untouched save
Screen: menu
Now: The supplied fresh save screenshot and my live first launch show an unsolicited music unlock sheet before any play.
Direction: Gate unlock announcements on a newly earned event in this session. Loading an existing global entitlement must not create an unlock announcement. Queue legitimate events until the set ends or the player returns to the menu. Keep music available through a 48 px menu row. Preserve the shared music system's entitlement data; fix presentation rather than deleting progress.
Why: The first event should establish what HUES asks the player to do. An unearned reward makes both the game and its rewards look unreliable.
Color blind: Textual music status stays available; no colored badge is required to discover it.
Effort: M
Check: Fresh local save, returning local save, and existing studio account each boot without a sheet. One real unlock produces one announcement after play, including after a reload.

### D02. Give HUES ownership of the active screen
Screen: all
Now: Shared music and feedback widgets overlap controls or remain above overlays in the supplied phone shots.
Direction: Add one HUES presentation state hook for menu, rules, play, round review, final result, shop, and share. Through the existing arcade integration, suppress floating music, feedback, and reward chrome during rules, play, review, and sharing. Expose Feedback as a labeled 48 px menu row. Queue reward messages without suppressing the underlying reward. Do not solve this by escalating z-index values. If the shared widget lacks a visibility hook, add that narrow integration contract as a separate dependency.
Why: Locking a guess and advancing a round must remain predictable even when another studio feature has news.
Color blind: Named menu entries replace ambiguous icon circles and colored notification dots.
Effort: M
Check: At 360 and 412 px, inject music and goal events in every state. Zero widget rectangles intersect the pad, strip, primary action, or modal content. Feedback remains reachable from the menu.

### D03. Make the mode order match the decisions
Screen: menu
Now: All three modes are followed by an always visible Endless difficulty control and a large goals card, even when the player wants Daily.
Direction: Use this order: compact header; comparison motif; Daily Hue; Endless; Versus; collapsed Today’s goals summary; Border Shop; utility rows for Music, How to play, Add to Home Screen, Feedback, and All Sky Wolf games. Make Daily 80 px tall and the other mode cards 64 px, separated by 12 px. Tap Endless to expand its difficulty selection and a 56 px Start Endless button inside that card; retain the saved selection. Daily and Versus never show the Endless control. Use 16 px side gutters at both widths.
Why: The first screen asks which experience the player wants before asking how hard one particular experience should be.
Color blind: Selection uses text, a check mark, and a 2 px outline, not a colored fill alone.
Effort: M
Check: Daily, Endless, and Versus are fully visible without scrolling at 360 × 640. Returning Daily needs one menu tap; Endless needs two, excluding an optional difficulty change.

### D04. Demonstrate the identity in two swatches
Screen: menu
Now: HUES has an attractive serif title and seven small decorative chips, but no visual demonstration of matching.
Direction: Keep the live text wordmark at 48 px. Replace the chips with a 144 × 52 px paired swatch motif labeled Target and Your mix. Use a fixed demonstration pair unrelated to today's seed. On an explicit 48 px Replay demo control, let the second swatch approach the first over 600 ms, then hold. Show a static matched pair by default and under reduced motion. Use the existing near black background without a scene illustration.
Why: The title gets a recognizable symbol that also explains the game. It avoids leaking today's actual target colors.
Color blind: The labels and the adjacent phrase “Make your mix match the target” explain the task even if the animated difference is invisible. This does not make the underlying hue judgment equally accessible.
Effort: M
Check: In five first impression sessions, at least four people describe the matching task after five seconds. The motif never consumes the live game's random sequence.

### D05. Teach the axes before the clock
Screen: rules
Now: The rules are readable but prioritize bonus explanations before a novice has learned which gesture changes what. Starting a mode opens them on first use.
Direction: Retain one short first use overlay. Give it three numbered lines: “Slide the color strip to choose a hue.” “Slide the pad right for more color, up for more brightness.” “Tap Lock it in before time runs out.” Include a static 160 × 88 px pad diagram with arrows. Use 15 px body text, 22 px heading, and a 56 px Start Daily button whose mode name reflects the pending choice. Move scoring details to an expandable 48 px How scoring works row. When opened from Help without a pending game, the button says Back to menu. Start the existing clock only when the start action is accepted and the game view is ready.
Why: The explanation prepares the player's hand instead of teaching an economy before an interaction.
Color blind: Axis names and arrows describe controls without requiring identification of example hues.
Effort: M
Check: Four of five new testers correctly identify both axes before playing. Help never says it will start a game when it only closes. No timer elapses behind the rules.

### D06. Show Daily status before commitment
Screen: menu
Now: The Daily card shows its number and, after completion, a score, but the brief does not explain the first scored run versus later practice.
Direction: Before play, show “Daily Hue”, “5 rounds · Your first completed run counts”, and the puzzle number. After completion, show “Completed today · 2,140 points” using the stored value. Keep the card as one action, labeled Practice today, and make the existing result reachable through a separate 48 px View result row when its data are available. Preserve the current local date logic; show the actual next reset time in expanded details rather than implying a universal midnight. Do not silently substitute a practice score into the original result.
Why: Players know whether the next set affects the daily record and streak.
Color blind: Completion is stated in words; five colored squares are optional supporting information.
Effort: M
Check: First clear, replay, refresh, and local midnight fixtures retain the original counted result. Five testers can tell whether the next attempt counts before starting it.

### D07. Keep the header small and utilities honest
Screen: menu
Now: Sound, Help, a coin pill, and an injected ladybug compete around the title. Installation and arcade navigation sit farther down.
Direction: Use one 48 px header row: Sound button at left, a noninteractive “Coins 0” balance at right. Put How to play in the utility list and let the rules remain automatic only on first play. Sound has an accessible name describing its current state. Installation stays a utility entry; only show a direct install action when supported, otherwise show brief platform instructions on request. Put All Sky Wolf games last, preserving the existing embedded exit protocol.
Why: The header supports play without looking like a toolbar for several unrelated products.
Color blind: Sound has an icon and accessible state; Coins is explicitly named.
Effort: S
Check: The header fits at 360 px with 200 percent text scaling through wrapping or reflow. All interactive controls have at least 48 × 48 px hit areas, with no overlap.

## 4.2 The play screen

### D08. Anchor the controls as one lower module
Screen: play
Now: `.spacer` sits after the controls and separates the hue strip from Lock it in. The 412 px screenshot has much more empty space than the 360 px screenshot.
Direction: Use a `100dvh` game layout with a compact HUD at the top, one flexible spacer above the comparison and input module, then this fixed order: labeled swatches, pad, strip, Lock it in. Move the flexible space above the module. Keep 12 px between swatches and pad, 12 px between pad and strip, and 12 px between strip and button. Reserve 30 px plus the bottom safe inset below the button, preserving the existing protection against phone edge gestures. Use 16 px side gutters and a centered maximum content width of 380 px. The coordinate table below is the starting specification.
Why: Thumb travel follows a short continuous path instead of crossing an empty area before submission.
Color blind: The same predictable physical grouping benefits users who depend more heavily on labels and position.
Effort: M
Check: At all four specified viewport fixtures, the strip to button gap is 12 px, play requires no scrolling at normal text size, and no control reaches the reserved bottom gesture band.

### D09. Give the pad useful height without making it vertical
Screen: play
Now: The pad is `clamp(88px,22vh,210px)`, which can shrink severely and does not establish a deliberate relationship to the available width.
Direction: Target a 380 × 228 px pad at 412 wide and 328 × 197 px at 360 wide: width to height 5:3, not taller than wide. For usable heights under 620 px after safe insets, reduce pad height to a minimum of 156 px before reducing swatches. Keep the 48 px strip and 56 px submission action intact. Size from available height as well as width; the page must tolerate expanding browser chrome.
Why: More vertical control helps brightness adjustments, while a portrait pad would force upper corners beyond comfortable one thumb reach.
Color blind: Brightness control gets a larger physical range; color discrimination limitations remain.
Effort: M
Check: On actual 360 and 412 px phones, testers reach all four corners with one hand. Record grip changes and overshoots in ten rounds; compare with the current pad rather than claiming success from a screenshot alone.

### D10. Stage two equal samples
Screen: play
Now: Two rounded rectangles have very faint uppercase Target and Yours labels; frame choices alter their surrounds.
Direction: Keep target permanently on the left and guess permanently on the right. Rename the labels Target and Your mix. Use 13 px Hanken Grotesk at weight 600, 18 px line height, and `#b5b2aa`; give labels a 22 px slot above the samples. At 412 wide, each outer well is 184 × 120 px with a 12 px gap. At 360 wide, each is 158 × 104 px. Include a 6 px neutral `#202024` mat inside each well and a 10 px corner radius. Both samples have identical visible areas and no text over their color.
Why: The eye gets a stable comparison and the player can instantly tell which swatch responds to touch.
Color blind: Words and fixed left/right positions identify the samples; neither relies on its hue for identification.
Effort: M
Check: Sample dimensions remain equal for every equipped frame. Four of five new testers identify the editable sample within two seconds. Labels remain legible on all fixture widths.

### D11. Make the hue strip's hit box visible
Screen: play
Now: A 36 px strip gets a larger upward pseudo element hit area. Its visible boundary does not describe its full touch region.
Direction: Render the strip itself 48 px tall, with a 28 px visible handle, a white 2 px ring, and a black 2 px outer ring. Retain pointer capture. Clip the visual handle inside the strip at the two ends while preserving the full numeric hue range; do not shrink the selectable range. Map pointer coordinates through the strip's real bounding rectangle. Add a 13 px Color label in the compact instruction text above the module, not another tall row.
Why: Touching just above a control should not unexpectedly adjust it. The position marker must remain visible on yellow, black, and saturated colors alike.
Color blind: A clearly outlined position marker works independently of the spectrum colors. Hue names are explained after a round, not exposed as target hints during play.
Effort: M
Check: Taps across the visible 48 px strip always register. Taps in the 12 px gaps never register. Left and right endpoints, pointer cancel, and off-control drags retain correct behavior.

### D12. Put submission immediately below selection
Screen: play
Now: Lock it in is pinned far below the strip at the taller phone size and can be covered by the music pill.
Direction: Use a full content width, 56 px high button immediately beneath the strip, with 12 px spacing, 14 px corner radius, and 16 px bold text “Lock it in”. Keep its position unchanged throughout a round. Submit on click or completed tap, not pointer down, and accept only once per round. A drag ending over the button must not submit. After submission, retain the button's space while switching the review panel's primary action into that same bottom slot.
Why: Finishing becomes a short downward thumb movement and accidental duplicate locks cannot occur.
Color blind: The cream filled button, text, and fixed location communicate the action without a success color.
Effort: M
Check: Zero duplicate scoring events in rapid double tap tests. In ten rounds per tester, median strip to button movement time falls relative to the old layout without more unintended submissions.

### D13. Keep time readable and local
Screen: play
Now: A 40 px timer, thick bar, pulsing digits, and changing colors compete with the color samples.
Direction: Keep digits and bar, but put “7.7 s” in 24 px tabular mono at the right of the compact HUD. Use a 4 px cream time bar in a 16 px row below the HUD. Keep a fixed numeric width to avoid reflow. At the existing warning thresholds, use a small exclamation icon and warning color on the timer only. Preserve existing audio cues, with sound and vibration preferences respected. Remove scale pulsing; under reduced motion, only the bar's ordinary time progression remains.
Why: Urgency is available at a glance without turning the whole screen into an alarm.
Color blind: Remaining seconds, shrinking length, and an exclamation icon provide independent signals.
Effort: S
Check: At 3 seconds, 1 second, and timeout, the color comparison region is pixel identical for a fixed pair. Testers can report time remaining without mistaking the bar for match quality.

### D14. Protect the actual rendered colors
Screen: play
Now: Source includes a full page grain blend, a red danger vignette, a target brightness flash at round start, and optional colored frame glows. Their actual impact varies by location and frame.
Direction: Remove `body::after` grain from every sample and picker surface by scoping it to decorative containers. Remove `#vignette` from play. Remove `.flash .swatch` brightness animation. Keep all active color fills opaque sRGB with no filter, blend mode, opacity animation, texture, highlight, or shadow painted over them. Decorative glow must stop outside the shared neutral mat. Do not animate a target color while the scoring clock runs.
Why: A player should be judged against the color shown, without a presentation effect changing that appearance at the most pressured moment.
Color blind: Stable luminance and surround are especially useful when hue cues are weaker. This protects fidelity rather than claiming to correct color vision.
Effort: M
Check: Capture fixed RGB samples before warning, during warning, and after lock. Center pixels are equal within capture tolerance. Inspect the entire swatch for spatial overlays, and compare every frame against Hairline.

### D15. Keep collectibles outside the comparison
Screen: play
Now: Live image frames overlay the swatch with an inset of negative 11 percent; some CSS frames add saturated glow. The image pack is already referenced by the game.
Direction: Keep the same equipped frame around both wells, anchored outside the 6 px neutral mat. Reserve its decorative extent inside the overall well allocation and prohibit overlap with labels or the neighboring sample. Define per-frame fit metadata rather than stretching every asset identically. Add a persistent “Simple frames during play” preference; it uses Hairline while retaining the equipped art in the shop, final result, and share. Honor existing ownership and prices. Do not automatically remove owned art from active play without this preference or a clipping defect.
Why: Collecting stays expressive, while the central color comparison remains consistent and usable.
Color blind: The simple frame option reduces competing color signals without changing targets or scores. Names identify collectibles independently of palette.
Effort: L
Check: Audit all 120 entries for clipping, opaque centers, distorted corners, and encroachment at both widths. Target and guess visible areas match exactly. The preference survives reload and works offline for cached art.

### D16. Use the HUD for score and round context
Screen: play
Now: The right hand number is unlabeled score. Mode and round context occupy multiple rows; the brief incorrectly reads the number as coins.
Direction: Use a 48 px top row with a 64 px wide Menu button, a flexible middle area for “Daily · 1 of 5” or “Normal · Level 1”, and the timer at right. Use one 32 px status row below: “Score 0” on the left and mode specific context on the right. Endless shows the labeled life count from D29. Keep coin earnings in review and final result. Do not add a running match percentage while dragging.
Why: Players see the context they need without confusing points, coins, and closeness or receiving a live solution guide.
Color blind: Every value has a word label. Round progress never depends on colored dots.
Effort: M
Check: At 360 px, longest expected labels and a six digit score wrap or shorten without overlapping time or Menu. Five testers correctly distinguish score from coins.

### D17. Make a lock feel immediate and final
Screen: play
Now: The code waits 640 ms before showing the round breakdown, while another verdict appears above the picker. Pointer controls do not expose a complete keyboard alternative.
Direction: Freeze the selected RGB and disable editing synchronously on lock. Within 100 ms, show a neutral 2 px outline around Your mix and the text “Locked”. Begin the 160 ms review transition immediately; reveal the single verdict in the review. Under reduced motion, switch without sliding. Add keyboard support to the existing pad for saturation and brightness and to the hue strip for hue, with visible focus and documented arrows; expose two named range alternatives for the pad to assistive technology. Never announce the target's numeric coordinates during a scored round.
Why: The app acknowledges input before the player wonders whether the tap registered, and supports input methods beyond precision dragging.
Color blind: Textual confirmation and keyboard position control do not depend on color. They improve control access but cannot remove the game's perceptual challenge.
Effort: L
Check: Tap to acknowledgment stays under 100 ms on the test phone. All controls can be used without a pointer; no input mutates a locked guess. Reduced motion has no sliding or flashing.

### Play geometry to implement

All coordinates below are CSS px in the page's usable viewport, not physical screenshot pixels. These are proposed normal text size fixtures, not measurements of the current JPEGs. Insets are zero in this table. Subtract actual top and bottom safe insets from available height, then apply the same bottom anchoring. Browser toolbar changes must use the current dynamic viewport height.

| Element | 412 × 915 | 360 × 740 | 360 × 640 |
| --- | --- | --- | --- |
| Content x and width | 16, 380 | 16, 328 | 16, 328 |
| HUD top, height including bar and status | 12, 96 | 12, 96 | 12, 96 |
| Swatch label top, height | 375, 22 | 247, 22 | 147, 22 |
| Outer sample top, height | 397, 120 | 269, 104 | 169, 104 |
| Pad top, height | 529, 228 | 385, 197 | 285, 197 |
| Strip top, height | 769, 48 | 594, 48 | 494, 48 |
| Lock top, height | 829, 56 | 654, 56 | 554, 56 |
| Reserved space below button | 30 | 30 | 30 |

The fourth fixture is 412 × 740: use the 412 dimensions with module y coordinates 175 px higher. Extra height intentionally sits above the module. Do not fill that space with artwork, goals, or a tall clock. On short usable heights, first reduce excess space, then pad height toward 156 px, then wells toward 88 px. At large text settings, use a scrolling reflow with a sticky action and content clearance; do not clip text or shrink touch targets to preserve the normal fixture.

## 4.3 The result moment

### D18. Use one verdict and explain what it means
Screen: result
Now: The same match percentage and “off” verdict appear above the pad and again in the sheet. Closeness words, percent, survival, and Daily squares use different thresholds.
Direction: Remove the play screen verdict. The round review has one 28 px heading: Bullseye, Very close, Close, or Keep tuning, using the existing closeness thresholds. Under it show “45% color similarity” in 16 px text. In Endless, add a distinct text status “Level survived” or “Life lost” from the actual passed flag. Put the unchanged percentage formula and the current pass threshold in expandable scoring details. Do not present percentage as points accuracy or imply that Keep tuning always means a lost life.
Why: A middling color can survive an early Endless level. The interface must explain this honestly instead of looking mathematically inconsistent.
Color blind: Verdict and survival state are explicit words, not red or green coloring.
Effort: M
Check: Fixtures at ΔE 1.5, 3, 4, 8, 10, and each tolerance boundary produce consistent words, score details, lives, and squares. Five testers explain a survived Keep tuning result without guessing.

### D19. Make a miss informative before rewarding it
Screen: result
Now: A poor manual lock prominently awards +40 with zero base accuracy; timeout text says only that 30 percent was lost.
Direction: Put the color verdict and adjustment hint above a modest “40 points” total in 24 px mono. Use a 48 px Points details disclosure for Match points, Locked before time ran out, Precision bonus, and Speed bonus. Show “Locked before time ran out +40” for the current lock bonus. For timeout, use “Time ran out” plus “70% of match points kept. No bonuses.” Preserve the current arithmetic and do not call a miss a win. Show actual rounded values from the scoring object, not a second implementation.
Why: Players can understand why they earned something without confusing participation points with accurate matching.
Color blind: The textual reason for points remains understandable without seeing how far apart the colors are.
Effort: S
Check: A zero accuracy manual lock shows 40 points and a clear reason. A timeout with zero base shows 0 points without a misleading negative total. Expanded lines reconcile exactly to the total.

### D20. Explain the best control adjustment after the round
Screen: result
Now: A player is told how close they were, but never which movement would have improved the submitted guess.
Direction: Add one primary instruction under the verdict, such as “Move up for more brightness”, “Move left for less saturation”, or “Move the color strip toward violet”. Compute three diagnostic candidates by replacing only the submitted H, S, or V with that round's target component, then use the existing ΔE function to rank which isolated correction reduces the error most. Call this “Biggest adjustment”, not a decomposition of perceptual error. Only show a claim if the candidate improves ΔE by at least 0.5; otherwise show “Several small adjustments remain”. For hue, use a cyclic distance for diagnosis but derive the actual left or right gesture from the linear strip coordinates. Suppress hue advice when target or guess saturation is below 0.05, or brightness below 0.05; emphasize brightness or saturation instead. In optional details, draw a miniature labeled pad or strip with Your mix and Target markers only after lock.
Why: Feedback teaches a useful gesture instead of asking the player to interpret an abstract percentage. The next target is different, so label the hint as a review of this round.
Color blind: Written axis directions and distinguishable circle and diamond markers explain the relationship even when the hue difference cannot be seen. Do not promise a color blind player can perceive all targets after practice.
Effort: L
Check: Synthetic fixtures for pure H, S, V errors, hue seam crossings, low saturation, near black, and combined errors never recommend a change that raises ΔE. Testers correctly move the named control in an unscored usability exercise.

### D21. Replace the picker with a complete review surface
Screen: result
Now: The round sheet partly covers a still visible picker. The timer and duplicate verdict remain behind it. In live code this sheet is `#breakdown`; `#result` is the set ending screen.
Direction: Make `#breakdown` an opaque review surface covering the entire picker and controls region, with a 20 px top radius and 16 px padding. Keep the original paired samples visible above it on tall phones; hide or replace them with one compact paired sample row inside the review on short phones. Never show a partial strip or pad behind the sheet. Use one internal scroll region and keep a 56 px Next round button in the same bottom action slot as Lock it in. The final round says See results; the last Player 1 round says Pass to Player 2.
Why: The game visibly changes from editing to reviewing, and the next action remains where the thumb expects it.
Color blind: Stable sample order, labeled review, and explicit action text clarify the state transition.
Effort: M
Check: At 360 × 640, the heading, hint, points total, and action fit or scroll without covered content. Picker input and focus are disabled behind the review. The next clock starts only after the next action.

### D22. Make the run ledger optional and scannable
Screen: result
Now: Each round adds another large paired swatch row, repeats the verdict, and grows the review sheet's scrolling content.
Direction: After the current review, use a 48 px “This run · 3 of 5” disclosure. Expanded rows are 64 px minimum: round number, two 32 × 32 px samples labeled by the column header, similarity, and points. Keep the newest row visible first, but preserve round numbers so chronology is unambiguous. Any row that opens details is a real button at least 48 px high. Endless renders the latest 20 rows initially with a Load earlier rounds control; retain the full history data.
Why: The current mistake is easy to understand without a growing wall of repeated cards pushing the next action away.
Color blind: Round number, percentage, points, and words carry meaning that the small color pairs may not convey.
Effort: M
Check: Five round and 100 round fixtures keep Next round visible and render bounded initial DOM content. Expanding and collapsing does not reset the reading position unexpectedly.

### D23. Share the achievement without spoiling the puzzle
Screen: share
Now: The source builds an image with all five target and submitted color pairs, plus colored tier dots. The modal already previews the image and separates Share image, Save image, and Copy text. I did not visually test the generated PNG.
Direction: Keep that preview and those honest actions. Default to a spoiler free 1080 × 1350 card with HUES, puzzle number, counted or practice status, total points, streak, and five tier tiles. Give each tile a numeral 1 through 5 and a short tier word: Precise for ΔE at most 3, Near for at most 8, Wide otherwise. Preserve the existing green, yellow, and dark tier mapping. A 48 px “Include color pairs” toggle, off by default, reveals the existing pairs and labels the preview “Shows today’s colors”. Keep the equipped border outside a 64 px content safe zone. Copy text includes tier words as well as squares, and the game URL. Share cancellation returns to the preview without a failure toast.
Why: Posting a daily result should invite a friend to play without showing that day's answers. The current preview is worth keeping.
Color blind: Tier words and round numerals make the card meaningful without differentiating colored squares. The image's accessible description summarizes the same information.
Effort: M
Check: Default exported image and text contain no target RGB, HSV, or target swatches. At a 360 px displayed width, text stays readable. File share refusal leaves working Save image and Copy text options. Test the actual PNG with cached fonts and offline art fallback.

### D24. End each mode with an unambiguous record
Screen: result
Now: Source shows distinct Daily, Endless, and Versus endings, but the supplied screenshots omit them. The Daily coin line assigns an SVG string through `textContent`, which can expose markup instead of an icon.
Direction: Use Daily complete with counted score, streak, and earned coins; retain Practice as a clearly separate state. Use Endless headings Run complete or New best, followed by “Reached level 12”, “Normal”, score, best, and coins. Primary actions are Share result for Daily and Play again for Endless. Versus shows Player 1 and Player 2 scores and an explicit winner or Tie; its primary action is Rematch. Render coins as a real DOM icon plus text, or simply “23 coins”, never SVG markup in `textContent`. Keep score 36 px and subordinate figures 16 px. Preserve a 48 px Menu action.
Why: The set ending screen should settle what was achieved and what was saved, without making the shop the dominant next step.
Color blind: Winner, record, practice, and rewards are written explicitly.
Effort: M
Check: Capture Daily first clear and replay, Endless death and new best, and both Versus winner and tie states. No raw SVG text, clipped totals, duplicate reward, or practice result presented as today's counted record.

## 4.4 Menu, shop, goals

### D25. Make frame previews comparable and actions explicit
Screen: shop
Now: The shop uses one purple and orange split sample. That consistency is useful; those colors need not appear elsewhere to justify a preview. Live purchase and equip controls are clickable divs.
Direction: Keep a consistent sample across every card; replace the split fill with two small equal swatches on the same neutral mat used in play. At the top add a 48 px Preview colors disclosure with three fixed pairs: medium blue and teal, near white and gray, and near black and plum. Default to blue and teal. Each frame uses the same chosen pair. Replace clickable divs with buttons. States read Equipped with a check, Equip for owned, “Use 350 coins” for affordable, or “Need 120 more coins” for unaffordable. Keep purchases cosmetic and use existing prices. Provide a brief Undo action for a mistaken coin purchase if the transaction can be fully reversed.
Why: A preview should reveal how a frame behaves with different brightnesses, while its button states explain the consequence of a tap.
Color blind: Names, check marks, brightness examples, and explicit ownership text carry the state.
Effort: M
Check: Keyboard operation covers preview, purchase, and equip. With coins just below, equal to, and above each price, copy and balance updates are correct. Preview changes never alter actual game targets.

### D26. Turn the existing 120 entries into a collection
Screen: shop
Now: Although the old screenshot shows CSS frames, live `BORDERS` includes 112 image frames and eight CSS ones; the renderer builds every tile into one long grid.
Direction: Add a 48 px segmented control for Featured, All frames, and Owned. Featured is a stable curated set of eight existing entries, not a timed scarcity rotation. All frames has a 48 px native collection select with explicit metadata for each family and a text search field. Render 12 cards at a time in two columns, followed by a 48 px Show 12 more button. Owned sorts Equipped first. Store scroll and filter state on return from a preview. Lazy load thumbnails and preload only the equipped art. Keep all inventory available without new rarity, price, or unlock rules.
Why: The player can browse a recognizable collection instead of scrolling through 60 rows of near identical card structure.
Color blind: Collection names and frame names support discovery without relying on palette thumbnails.
Effort: L
Check: No more than 12 initial cards are rendered. Find a named frame in at most three actions using search. Missing images show a named CSS fallback, with no blank center or broken image icon. Offline owned frames either render from cache or fall back safely.

### D27. Put progress ahead of goal rewards
Screen: goals
Now: Today's three selected goals have progress bars and reward values, but their numbers are not explicit enough to explain progress at a glance. Completion can toast during play.
Direction: Collapse the menu card to a 56 px “Today’s goals · 1 of 3 complete” row. Expanded content shows each actual goal with numeric progress such as “2 of 3 perfect matches” and a 4 px bar, followed by “35 coins”. Define Perfect in the help disclosure as the current ΔE 1.5 threshold; do not equate it with the larger precision bonus margin. Completed rows read “Complete · 35 coins added”. Queue completion notices to round review. Use auto credit as the game already does; do not add Claim taps. Validate stored mission IDs and numeric fields before rendering, preserving valid same day progress.
Why: Goals become a useful record instead of a demand competing with the first game. Validation avoids a broken menu from malformed saved data.
Color blind: Numeric progress and completion words replace dependence on fill color.
Effort: M
Check: Test zero, partial, exact completion, reload, next day, and unknown saved goal ID. Rewards apply once, and the menu remains playable without silently discarding valid progress.

### D28. Explain the actual Versus turn order
Screen: versus
Now: The play header says P1. Source confirms Player 1 completes all five rounds before passing to Player 2, who receives the same seeded set.
Direction: Before the existing first round, show “Player 1 plays five rounds. Then pass the phone to Player 2.” The action is a 56 px “Player 1 ready”. During play use “Player 1 · Round 2 of 5”. After round five, show an opaque handoff screen reading “Pass the phone to Player 2” and “Five rounds · Same colors”. Start Player 2's timer only on “Player 2 ready”. Do not leave target pairs or diagnostic hints visible on the handoff screen. Explain in the rules that players should avoid watching each other's turns; the screen alone cannot prevent observation.
Why: The player knows when to hand over the phone without changing the existing five rounds per player structure.
Color blind: Player numbers and explicit ready text identify turns; no player color is required.
Effort: M
Check: A complete ten round set has one handoff, matching seeded targets, and no elapsed Player 2 clock before ready. Five pairs of testers follow the sequence without verbal coaching.

### D29. Name lives and show real stage recovery
Screen: play
Now: Endless uses three tiny dots that look like an ellipsis. Source restores a life at a stage boundary but caps lives at three, while the stage message always says +1 life.
Direction: In the HUD status row, show “Lives 3 of 3”, with optional three 12 px heart outlines as redundant decoration. On failure update the count immediately and put “Life lost · 2 remaining” in the review. At stage clear, calculate displayed life gain from the actual before and after count; say “Life restored · 3 of 3” only if a life was restored, otherwise “Lives full”. Show “Stage 1 complete · 15 coins” from the existing reward data. Put next stage progress in review so it does not crowd the play HUD.
Why: Players understand the resource that ends their run, and the game stops promising an extra life it cannot grant.
Color blind: Counts and words identify loss and recovery even if decorative hearts are indistinguishable.
Effort: S
Check: At 3, 2, 1, and 0 lives, the HUD and review agree with state. At a stage boundary with full lives, no copy claims a gained life. The apparent ellipsis disappears.

## 4.5 The color and type system

### D30. Give colors explicit roles
Screen: all
Now: Cream controls, gold coins, mint equipped states, red Help, multiple verdict colors, and colored samples compete without a clear separation of roles.
Direction: Use one interaction accent, Chalk `#f3f1ec`; one warning state color, Coral `#f2a19a`; and one metal, Brass `#d6b86a`, reserved for coins and collection decoration. Use background `#0a0a0c`, surface `#17171c`, secondary ink `#b5b2aa`, and neutral mat `#202024`. Success and Equipped use Chalk plus words and a check, not a new green accent. Keep the game colors and legacy share tier colors as semantic content outside this chrome palette. Measure text contrast on its actual rendered surface; target at least 4.5:1 for all normal size text. Increase values if the actual surface fails.
Why: The samples carry the color; interface controls have an unmistakable, quiet hierarchy. Semantic exceptions are named rather than forced into a fake single color rule.
Color blind: State meaning always includes words, icons, or shape, and does not rely on coral versus cream alone.
Effort: M
Check: Audit every non-content color token and its role. No small text uses faint ink. Equipped, warning, price, and primary action remain distinguishable in grayscale screenshots.

### D31. Give each font one job
Screen: all
Now: Three suitable fonts are present, but many functional labels are 9 or 10 px, tracked out, and low contrast. The timer is more prominent than the task.
Direction: Instrument Serif is for HUES at 48 px and optional final screen titles at 30 px only. Hanken Grotesk is for headings 24/30 at 700, body 15/22 at 400 or 500, labels 13/18 at 600, and buttons 16/20 at 700. JetBrains Mono is for timer 24/28, score 20/24, final score 36/40, and detailed numbers 14/20. Use tabular numerals. Avoid all caps paragraphs and label tracking above 0.06em. Specify sizes in rem equivalents and allow reflow. Use serif, system sans, and monospace fallbacks without delaying play.
Why: The type system retains personality while making information readable at arm's length.
Color blind: Improved text hierarchy supports people using labels instead of subtle color differences.
Effort: M
Check: No functional text renders below 12 CSS px at default settings. At 200 percent text scaling, all copy remains available and every action is reachable. Offline fonts do not produce clipped buttons or blank share text.

### D32. Enforce the copy rule in every state
Screen: all
Now: Current player text includes compounds such as Lock-in bonus and dead-on, timeout minus notation, and frame descriptions with hyphens. The brief prohibits dashes in player copy.
Direction: Centralize player visible strings in a small in-file copy object. Use “Locked before time ran out”, “Exact match”, “Pass and play”, “Long press”, and “70% of match points kept”. Use numbered player names consistently. Validate descriptions, accessibility labels, toasts, share text, canvas text, dynamically built phrases, and imported music display titles for dash characters. Do not alter asset filenames, URLs, CSS properties, JavaScript subtraction, or stored frame IDs. For external titles, sanitize only their HUES display form and preserve their underlying identifiers.
Why: The studio's voice stays consistent beyond the handful of main screens.
Color blind: Plain language improves the nonvisual explanation of every state.
Effort: M
Check: A player string scan and screenshots find no hyphen, en dash, em dash, nonbreaking hyphen, or minus sign used as player copy. Numeric loss is expressed in words. Source identifiers remain intact.

### D33. Hide inactive screens from focus, not just sight
Screen: all
Now: `.screen` uses opacity and pointer events for hiding. My live accessibility snapshot exposes menu, game, result, and shop content together. Shop actions also include clickable divs.
Direction: Give inactive screens `hidden` or a combination of `inert` and appropriate accessibility hiding during transitions. Remove them from focus order. Rules and sharing have named dialog semantics, contained focus, Escape or explicit Close when appropriate, and return focus to the launching control. Preserve keyboard access to the result primary action. Announce a verdict once through a polite live region, not the timer every tenth of a second. Keep at least 48 × 48 px for all interactive targets, including close buttons and new disclosures; avoid overlapping invisible hit extensions.
Why: Visual state and interaction state must agree. Otherwise assistive technology and keyboard users encounter controls belonging to another screen.
Color blind: This complements color independent labels and supports players with additional visual or motor access needs. It does not claim the color game is fully playable without color perception.
Effort: M
Check: Keyboard and TalkBack traverse only the current screen. Open and close every overlay; focus returns correctly. One lock produces one verdict announcement. Timer updates do not flood announcements.

## 4.6 Three things to cut

1. **Unsolicited arcade reward chrome during the task.** Cut the false first boot celebration and all floating music or feedback overlays while matching or reviewing. Preserve the underlying features through labeled menu entries. Implement through D01 and D02.
2. **Decorative effects on colors being judged.** Cut the target brightness flash, full screen grain over samples, and urgency vignette. These effects can compete with or alter the object of measurement. Implement through D14.
3. **Repeated verdicts and permanent bonus accounting.** Cut the extra verdict above the pad and collapse detailed score arithmetic behind one disclosure. Keep a single verdict, a useful hint, and an honest total. Implement through D18, D19, and D21.

## 4.7 Three references

These are specific moments to study, not instructions to copy whole products. The observations below are grounded in the linked primary documentation; I did not conduct fresh hands-on sessions in these three products.

| Reference | Exact moment to study | Transfer to HUES | Limit |
| --- | --- | --- | --- |
| [Procreate Classic color picker](https://help.procreate.com/procreate/handbook/colors/colors-classic) | The relationship between a rectangular saturation/brightness field, its reticle, and the hue slider below it. | Preserve the spatial separation of hue and two dimensional mixing, with an immediately visible selected color. Supports D09 through D11. | It is an art tool, not evidence that its entire layout works with one thumb under a short clock. Do not add eyedropper or numeric target entry. |
| [Duolingo Explain My Answer](https://blog.duolingo.com/explain-my-answer-now-free/) | Feedback that places the submitted answer and correction next to a brief explanation of the mistake. | Pair the two swatches with one actionable explanation and optional deeper detail. Supports D20. | HUES can calculate deterministic local feedback; it needs no model call, subscription, or extra motivational screens. |
| [Wordle in Discord, official sharing flow](https://support-apps.discord.com/hc/en-us/articles/31598005086359-Wordle-FAQ) | The explicit Share action after completing the daily puzzle and the compact daily result shown to friends. | Treat sharing as an intentional post-completion action; design a compact result that carries game identity and achievement. Supports D23. | The spoiler free default for HUES is this review's recommendation. Do not infer that Discord features or platform integration are required. |

### The scoring mismatch the studio should explain

This is a presentation correction, not a request to retune the game. From the supplied formula and inspected implementation:

| Example | Displayed similarity, rounded | Closeness verdict | Daily tier | Other implication |
| --- | --- | --- | --- | --- |
| ΔE 1.5 | 98% | Bullseye | Green | Also meets the current perfect goal threshold |
| ΔE 3 | 96% | Very close | Green | Not necessarily a perfect goal match |
| ΔE 8 | 89% | Close | Yellow | Within starting Normal precision margin of 8.4 |
| ΔE 10 | 87% | Close | Dark | Still survives early Normal |
| ΔE 20 | 76% | Off, proposed Keep tuning | Dark | Survives starting Normal tolerance 30 |
| ΔE 30 | 66% | Off, proposed Keep tuning | Dark | At starting Normal pass boundary; base accuracy points are zero |

Thus “89%”, “Close”, a yellow square, and a precision bonus can all describe one round. A single green or red verdict cannot explain all these concepts. D18 separates similarity from survival, D19 explains points, and D23 labels share tiers. Also, the displayed first level starts at internal level zero in the inspected code; obtain durations and tolerance from the current round object instead of recomputing them from the visible level number.

### Accessibility boundary

No unchanged hue matching game can promise equal perceptual difficulty across different color vision conditions. This review improves control labels, state recognition, feedback, and visual stability. It deliberately does not add live target names, target numeric values, alternate target generation, or a live closeness meter, because those would change the task. If the studio later wants a genuinely nonvisual or hue independent mode, scope and evaluate it as a separate rules decision. Include people with different color vision conditions in usability sessions; simulated screenshots alone are insufficient.

### Art decision

No new raster art is required for this iteration. `art_wanted` is deliberately empty.

| Previously proposed asset | Decision | Reason |
| --- | --- | --- |
| `bg-hues-540x960.jpg` | Defer | A pigment bench adds detail without resolving control reach or trust. The active comparison needs a stable neutral surround. |
| `frame-swatch-default-320x220.png` | Replace with the existing Hairline CSS frame and neutral mat | A new brass default would duplicate available work and increase surround color. Existing collectible art remains useful outside the protected sample area. |
| `picker-plate-360x300.png` | Cut | Texture and ornament behind a precision gradient do not teach its axes or improve the hit box. |
| `hues-wordmark-420x140.png` | Keep live Instrument Serif text instead | It scales, remains accessible, avoids an extra image request, and already provides a recognizable title. |
| Existing `borders/pack/` art | Audit and curate | Integration is present. Verify centers, fit, performance, and export parity before adding more assets. Refer to it as image frame art unless its production method is verified. |

### Verification handoff

Keep this as one HTML file with vanilla JavaScript. The frame pack and existing cached font assets remain external assets as today; no framework or build step is needed. Use existing game state and scoring outputs as the source of truth. Add small view helpers for chrome visibility, active screen focus, review feedback, and shop pagination. Do not duplicate score logic in display code.

Release checks should cover 360 × 640, 360 × 740, 412 × 740, and 412 × 915 CSS px, plus browser chrome changes and bottom safe insets. Test normal text size, 200 percent text scaling, reduced motion, keyboard input, TalkBack, fresh save, returning save, completed Daily, and offline reopening after one successful load. Assert the 48 px target requirement against rendered hit regions, not nominal CSS alone. Test portrait on a physical Pixel 9 and one narrower phone before accepting thumb reach claims.

Capture the missing states explicitly: a default spoiler free share preview and actual PNG; an opt-in color pair PNG; Endless life loss, final life loss, and stage clear at full lives; Versus ready, handoff, and tie; goals partially complete and credited. Those screenshots close the evidence gaps in the original brief.

Use a small consented usability sample first, with local timings or the studio's existing analytics. Record boot to first deliberate lock, opening the wrong mode, missed button taps, grip changes, result comprehension, second round continuation, and share export success. Target at least four of five first time testers completing the control sequence without coaching. Treat first lock within ten seconds as an aspiration for returning players, not a reason to rush first time instructions or count random taps as success. Compare medians against the existing build before claiming an improvement.

The work is complete when the player can tell what to do, reach the controls, trust the displayed colors, understand the result, and choose to return. More art is not the acceptance criterion.

```json
{
  "game": "hues",
  "model": "GPT",
  "date": "2026-10-08",
  "directions": [
    {
      "id": "D01",
      "screen": "menu",
      "effort": "M",
      "title": "Stop congratulating an untouched save",
      "summary": "Gate unlock announcements on a newly earned event in this session."
    },
    {
      "id": "D02",
      "screen": "all",
      "effort": "M",
      "title": "Give HUES ownership of the active screen",
      "summary": "Add one HUES presentation state hook for menu, rules, play, round review, final result, shop, and share."
    },
    {
      "id": "D03",
      "screen": "menu",
      "effort": "M",
      "title": "Make the mode order match the decisions",
      "summary": "Use this order: compact header; comparison motif; Daily Hue; Endless; Versus; collapsed Today’s goals summary; Border Shop; utility rows for Music, How to play, Add to Home Screen, Feedback, and All Sky Wolf games."
    },
    {
      "id": "D04",
      "screen": "menu",
      "effort": "M",
      "title": "Demonstrate the identity in two swatches",
      "summary": "Keep the live text wordmark at 48 px."
    },
    {
      "id": "D05",
      "screen": "rules",
      "effort": "M",
      "title": "Teach the axes before the clock",
      "summary": "Retain one short first use overlay."
    },
    {
      "id": "D06",
      "screen": "menu",
      "effort": "M",
      "title": "Show Daily status before commitment",
      "summary": "Before play, show “Daily Hue”, “5 rounds · Your first completed run counts”, and the puzzle number."
    },
    {
      "id": "D07",
      "screen": "menu",
      "effort": "S",
      "title": "Keep the header small and utilities honest",
      "summary": "Use one 48 px header row: Sound button at left, a noninteractive “Coins 0” balance at right."
    },
    {
      "id": "D08",
      "screen": "play",
      "effort": "M",
      "title": "Anchor the controls as one lower module",
      "summary": "Use a `100dvh` game layout with a compact HUD at the top, one flexible spacer above the comparison and input module, then this fixed order: labeled swatches, pad, strip, Lock it in."
    },
    {
      "id": "D09",
      "screen": "play",
      "effort": "M",
      "title": "Give the pad useful height without making it vertical",
      "summary": "Target a 380 × 228 px pad at 412 wide and 328 × 197 px at 360 wide: width to height 5:3, not taller than wide."
    },
    {
      "id": "D10",
      "screen": "play",
      "effort": "M",
      "title": "Stage two equal samples",
      "summary": "Keep target permanently on the left and guess permanently on the right."
    },
    {
      "id": "D11",
      "screen": "play",
      "effort": "M",
      "title": "Make the hue strip's hit box visible",
      "summary": "Render the strip itself 48 px tall, with a 28 px visible handle, a white 2 px ring, and a black 2 px outer ring."
    },
    {
      "id": "D12",
      "screen": "play",
      "effort": "M",
      "title": "Put submission immediately below selection",
      "summary": "Use a full content width, 56 px high button immediately beneath the strip, with 12 px spacing, 14 px corner radius, and 16 px bold text “Lock it in”."
    },
    {
      "id": "D13",
      "screen": "play",
      "effort": "S",
      "title": "Keep time readable and local",
      "summary": "Keep digits and bar, but put “7.7 s” in 24 px tabular mono at the right of the compact HUD."
    },
    {
      "id": "D14",
      "screen": "play",
      "effort": "M",
      "title": "Protect the actual rendered colors",
      "summary": "Remove `body::after` grain from every sample and picker surface by scoping it to decorative containers."
    },
    {
      "id": "D15",
      "screen": "play",
      "effort": "L",
      "title": "Keep collectibles outside the comparison",
      "summary": "Keep the same equipped frame around both wells, anchored outside the 6 px neutral mat."
    },
    {
      "id": "D16",
      "screen": "play",
      "effort": "M",
      "title": "Use the HUD for score and round context",
      "summary": "Use a 48 px top row with a 64 px wide Menu button, a flexible middle area for “Daily · 1 of 5” or “Normal · Level 1”, and the timer at right."
    },
    {
      "id": "D17",
      "screen": "play",
      "effort": "L",
      "title": "Make a lock feel immediate and final",
      "summary": "Freeze the selected RGB and disable editing synchronously on lock."
    },
    {
      "id": "D18",
      "screen": "result",
      "effort": "M",
      "title": "Use one verdict and explain what it means",
      "summary": "Remove the play screen verdict."
    },
    {
      "id": "D19",
      "screen": "result",
      "effort": "S",
      "title": "Make a miss informative before rewarding it",
      "summary": "Put the color verdict and adjustment hint above a modest “40 points” total in 24 px mono."
    },
    {
      "id": "D20",
      "screen": "result",
      "effort": "L",
      "title": "Explain the best control adjustment after the round",
      "summary": "Add one primary instruction under the verdict, such as “Move up for more brightness”, “Move left for less saturation”, or “Move the color strip toward violet”."
    },
    {
      "id": "D21",
      "screen": "result",
      "effort": "M",
      "title": "Replace the picker with a complete review surface",
      "summary": "Make `#breakdown` an opaque review surface covering the entire picker and controls region, with a 20 px top radius and 16 px padding."
    },
    {
      "id": "D22",
      "screen": "result",
      "effort": "M",
      "title": "Make the run ledger optional and scannable",
      "summary": "After the current review, use a 48 px “This run · 3 of 5” disclosure."
    },
    {
      "id": "D23",
      "screen": "share",
      "effort": "M",
      "title": "Share the achievement without spoiling the puzzle",
      "summary": "Keep that preview and those honest actions."
    },
    {
      "id": "D24",
      "screen": "result",
      "effort": "M",
      "title": "End each mode with an unambiguous record",
      "summary": "Use Daily complete with counted score, streak, and earned coins; retain Practice as a clearly separate state."
    },
    {
      "id": "D25",
      "screen": "shop",
      "effort": "M",
      "title": "Make frame previews comparable and actions explicit",
      "summary": "Keep a consistent sample across every card; replace the split fill with two small equal swatches on the same neutral mat used in play."
    },
    {
      "id": "D26",
      "screen": "shop",
      "effort": "L",
      "title": "Turn the existing 120 entries into a collection",
      "summary": "Add a 48 px segmented control for Featured, All frames, and Owned."
    },
    {
      "id": "D27",
      "screen": "goals",
      "effort": "M",
      "title": "Put progress ahead of goal rewards",
      "summary": "Collapse the menu card to a 56 px “Today’s goals · 1 of 3 complete” row."
    },
    {
      "id": "D28",
      "screen": "versus",
      "effort": "M",
      "title": "Explain the actual Versus turn order",
      "summary": "Before the existing first round, show “Player 1 plays five rounds."
    },
    {
      "id": "D29",
      "screen": "play",
      "effort": "S",
      "title": "Name lives and show real stage recovery",
      "summary": "In the HUD status row, show “Lives 3 of 3”, with optional three 12 px heart outlines as redundant decoration."
    },
    {
      "id": "D30",
      "screen": "all",
      "effort": "M",
      "title": "Give colors explicit roles",
      "summary": "Use one interaction accent, Chalk `#f3f1ec`; one warning state color, Coral `#f2a19a`; and one metal, Brass `#d6b86a`, reserved for coins and collection decoration."
    },
    {
      "id": "D31",
      "screen": "all",
      "effort": "M",
      "title": "Give each font one job",
      "summary": "Instrument Serif is for HUES at 48 px and optional final screen titles at 30 px only."
    },
    {
      "id": "D32",
      "screen": "all",
      "effort": "M",
      "title": "Enforce the copy rule in every state",
      "summary": "Centralize player visible strings in a small in-file copy object."
    },
    {
      "id": "D33",
      "screen": "all",
      "effort": "M",
      "title": "Hide inactive screens from focus, not just sight",
      "summary": "Give inactive screens `hidden` or a combination of `inert` and appropriate accessibility hiding during transitions."
    }
  ],
  "cuts": [
    "Unsolicited arcade reward chrome during matching and review.",
    "Decorative effects over colors being judged.",
    "Repeated verdicts and permanently expanded bonus accounting."
  ],
  "art_wanted": []
}
```
