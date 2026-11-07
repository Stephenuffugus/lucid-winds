# Round 2 additions

Use this pack beside Round 1. No Round 1 file is replaced. All asset text is supplied by the game. The previews contain sample runtime copy and are design compositions, not screenshots of a deployed replacement.

## Six targets

The order is finger left and right, hand left and right, cheek left and right. Keep an 8 CSS px gutter and 8 px side margins. At 320px wide each target remains 148 by 120px. At 360 use 168 by 130; at 412 use 194 by 140; at the 560 cap use 268 by 170. The stage gives up height first. Safe-area inset is additional layout space, not part of a target.

All pad sources are 388 by 280px. Render with nine slicing, never uniform stretching. Insets in anchors.json are top, right, bottom, left, in source pixels. At 2x assets, fixed edge regions display at half their source size. Position icons, words and state overlays independently from the stretched center. The runtime icon is 48 CSS px; call words are 15px with up to two lines. Role labels are 11px and supplemental to the accessible name. Keep interactive targets at their full pad bounds.

The cheeks are a mirrored buttoned seat, with its seam at the central gap. Hands have clipped corners and a three-tab cuff; fingers have a single crest and pointing idle mark. The call's object replaces the idle mark whenever a call is active. Never rotate a hand glyph to indicate side.

| Surface | State | Shape cue |
| --- | --- | --- |
| Cheek | idle | Raised cushion, stitched inner seam |
| Cheek | held | Depressed cushion, paired inward latches, mint rule |
| Cheek | cover | Outward arrows at both top corners, brass rim |
| Cheek | lifted | Open upper corners and centered check, relief rim |
| Cheek | squeak | Hard corner crosses, interrupted color field |
| Hand or finger | idle | Gesture under a distinct cuff or crest |
| Hand or finger | called | Accent corner brackets; icon and words are live |
| Hand or finger | holding | Paired inward latches, reduced depth, filling rim |
| Hand or finger | done | Checks at the upper corners |
| Hand or finger | missed | Cross plus dropped diamond; dim surface |
| Hand or finger | leave | Outward arrows and interrupted upper rule |

The lower central 70 CSS px may be obscured. Critical markers sit above that contact zone or at the side rim. Preserve all state shapes under Silver Screen and the other Round 1 palette filters. Base tokens remain paper #e7e0cb, sage #37493d, deep #1c2620, ink #221f18, accent #e0902f, relief #5fd0b0, brass #c8a84b, danger #c0392b. Render live call text in sage on paper, paper on sage.

## Rings and moving calls

ring_specimen.svg is a three-panel specimen: track, 60 percent remaining countdown, 60 percent completed hold. Each panel is 388 by 280. It is not a runtime animation or a sprite sheet. Draw the ring from the clock on the stretched target perimeter. Use 9 CSS px inset, 12px corner radius and 3px stroke. Start at top center and proceed clockwise.

With pathLength=100, a hold at fraction p has stroke-dasharray 100p, 100(1-p), offset zero. A countdown with fraction r remaining has dasharray 100r, 100(1-r) and offset -100(1-r). Its erased portion grows clockwise from the top. The specimen uses 60 40 with offset -40 for countdown, and 60 40 with zero offset for hold. Do not scale a precomputed path to a new aspect ratio; construct the rounded contour at the actual target width and height. The specimen's absolute contour is also in anchors.json.

Cheek cover and lifted use the same remaining-noise clock. Brass identifies the initial Perfect opportunity; transition the live overlay to relief after the first 40 percent of elapsed noise. Do not use a color change as the only signal: the countdown and runtime words remain. Both cheeks must be released to vent, then held again before the noise ends.

A moving call keeps the same icon and words at its new target. The source receives LEAVE and the text “Let go”; the destination receives CALLED and the same call. Use icon_call_move pointing toward the destination, with horizontal mirroring or rotation as required by the grid. Start the source's 0.7-second release grace period from the real move event. LEAVE is an instruction, not a miss. DONE is successful completion, not a release warning. A reduced-motion preference should retain the steady LEAVE arrows and words without blinking.

## Calls

34 unique scene-call icons serve 36 scene entries. Shake hands and Hold hands are intentionally reused. Four supporting marks include move, cheeks, hands and the added fingers mark. Each file has a 48-unit viewBox, 3-unit rounded currentColor stroke and open counters. Use inline SVG and inherit text color. Display at 48px on a pad and no smaller than 24px elsewhere. The contact sheet shows both sizes on paper and sage in scene order.

Do not bake the current call into a plate. Coffee has no steam, candle has no smoke, bouquet has no scent. The hymn book has musical notation, the library book a date card, the open book a turning page. The menu is bifold; the program is tall with a curtain panel.

## Teaching cards

table_card.webp is 720 by 600, displayed at 360 by 300. It shows six pads with index fingers on the middle row and thumbs on the cheeks. The unoccupied top row is intentional. Render “Set your phone flat on a table and use both hands.” into its clear paper band.

how_to_play_move.webp and its SVG source add the six-pad movement step. The same book travels from middle left to top right; the old target displays release arrows. Its runtime line is “A call can move. Follow it, and let go of the pad it left.” Both cards have text bands in anchors.json. At 200px illustration width, place full-size instructional text below the image rather than shrinking it with the illustration. The 412 menu preview shows both steps and one Got it button.

## Lesson line

lesson_line.png and lesson_line_done.png are 792 by 128. Nine-slice them to the full width above the deck, with a nominal 64 CSS px height. Use Noto Serif Bold at 22px, or 18px at 320. Wrap at word boundaries into two lines with 24px line height. The longest verbatim sample uses a 128px-tall contact-sheet specimen; on a short live screen split that beat into “You are ready.” and “Three strikes and the room knows.” No words are baked into these sources. Keep the text clear of the left marker. DONE adds a check and an under-rule.

On the very short 320 by 568 composition, reserve 376px for the six-pad grid, 64px for the lesson line, 48px for the top controls, 8px for the lesson gap, 8px bottom margin, and the remaining 64px for the stage. Long instructions must become successive short beats instead of reducing targets. The added move teaching beat can use “A call can move. Follow it.” followed by “Let go of the pad it left.” The full combined wording stays on the How to play card.
