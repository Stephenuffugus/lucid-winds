# Midnight greenhouse, tuned for music

Keep the house palette. Use tactile starter illustrations as the invitation and precise vector controls as the instrument. Quiet surfaces make the notes feel bright. Avoid decorative controls, fake LEDs, mascot characters and a physical hardware replica.

## Color tokens

| Token | Value | Role |
|---|---|---|
| canvas | #0d100c | Page and transport |
| panel | #1a2119 | Lane surface and modal |
| raised | #263222 | Picker cards and hovered items |
| border | #708666 | Essential control boundaries |
| divider | #364332 | Decorative separators only |
| text | #f0e8d8 | Primary text |
| secondary | #a7b29e | Supporting text, increased contrast over original muted |
| sage | #8fc776 | Main action and Verse |
| gold | #d6b85c | Accent, selection and Chorus |
| drums | #e99a62 | Drum skin badge and active drum cells |
| bass | #e88686 | Bass strings badge and active bass cells |
| chords | #a0c4e8 | Chord fan badge and active chord cells |
| melody | #d6b85c | Note badge and active melody cells |
| recording | #e88686 | Recording state, always paired with dot/text |
| destructive | #e88686 | Destructive action label, never the sole warning |

The slightly lighter colors are deliberate for small controls. Never use cream text on a filled gold, sage or pastel button; use canvas text. Existing #c75050 stop red becomes the lighter semantic red for legibility. Selection is an outline plus label/state, not color alone. Contrast measurements are in dev/QA_REPORT.md.

## Typography

Bebas Neue: display headings 28–36 px, wordmarks and optional section labels. DM Mono: BPM, step numbers, values and short labels at 13–14 px. Use system sans-serif for paragraph fallback, or load Google Fonts DM Sans at 15–16 px for longer explanatory copy; this pack's drawn mockups use the existing two families. Avoid condensed type for instructions. Do not set UI copy under 12 px. Keep user song names in a normal readable face, wrap to two lines before truncating.

Outlines in wordmark SVGs make them independent of font loading. Their source lettering is Bebas Neue; Google Fonts license references are in dev/THIRD_PARTY.md. Runtime labels must stay real text, not outlined graphics. Use font-display: swap, and test fallback widths. No remote font is required to view the supplied PNG previews.

## Spacing and surfaces

4 px base unit. Page gutters 16 px, card gutters 12 px, section gaps 20–24 px. Cards 16 px radius; controls 12 px; grid cells 8 px. Thin visible boundaries; no repeated neon glow. Use the supplied periodic slate texture at .24 opacity only behind broad panels, never behind small text or note grids. Modals have a solid panel fill, clear heading, 48 px close button, safe-area padding, focus containment, Escape handling and return focus to the opener. No backdrop-only dismissal for unsaved edits.

Lane header: 32 px badge, name, instrument, status and expansion affordance. Whole header minimum 64 px. Expanded header has a second row for Mute, Solo, volume and randomize. Avoid horizontally hiding important lane controls. Color is repeated in badge, name and active notes; the four distinct symbols support non-color identification.

Section identities: A Verse / sage / one underline; B Chorus / gold / double underline; C Bridge / blue / dotted underline. Preserve A/B/C and variation numbers. Mark active section using aria-current or equivalent, border and selected text; never only tint.

## Controls and grid

All interactive hit boxes at least 48×48 CSS px, including trim handles, icon buttons, note cells, keys and controls inside modals. Do not place overlapping invisible 48 px boxes over 20 px cells. Grid cell CSS states and slider/toggle definitions are in assets/b_grid_lanes/ui_tokens.css.

On phones, use 4 visible steps per beat page, a sticky 48 px pitch/drum-name rail, and previous/next 48 px buttons. The 16/32/64-step overview can be a noninteractive miniature; navigation remains through buttons or scrolling the large grid. Desktop can show more columns at the same minimum cell size. Retain existing note lengths, accents, probability and ratchet data. A grid viewport may scroll horizontally and vertically; the page itself must not clip required controls.

Off: dark fill and visible boundary. On: lane color. Accent: inner dark diamond or inset border plus announced accent. Ghost: dashed border, low fill, not yet committed. Playhead: cream outline outside current cell, never replaces the cell state. Selected: separate two-tone outline; do not confuse selection with playback. Show beat boundaries every four steps without adding narrow interactive targets.

Slider: 6 px visual track centered in a 48 px high input, 24 px thumb, enough width for useful movement. Native range semantics retained; paired value can open numeric editing. No knobs at launch; thumbs control sliders more accurately. M/S: 48 px square buttons with visible Mute/Solo text nearby or in expanded layout, aria-pressed, filled active state and keyboard focus. Toggle labels belong in HTML, not art.

## Icon grammar

24×24 viewBox, 1.8-unit stroke, round ends and joins, principal geometry within 2–22 units. One currentColor only. Render at 24 px inside a 48 px button; 48 px icon size is for illustrations or larger controls, not a different source. Most files are stroke symbols. Fill can remain none; Play is an outline triangle by design. Use supplied standalone SVG inline or through a CSS mask. An img element does not inherit the parent currentColor into the SVG: use mask/background-color or inline markup. Set aria-hidden on decorative SVG and accessible names on their buttons. Tooltips supplement labels; they do not replace them on touch devices.

There are 66 general icons plus twelve family companion marks. Family marks may reuse familiar visual grammar; text names remain authoritative. Full set is visible in the c_icons contact sheet at readable sizes.

## Starter gallery

Two columns, 160×100 logical art region, name and BPM below. Original generated illustration crops are 320×200; 1280×800 WebP variants serve large views. Never stretch aspect ratio or place small text over busy art. Labels use Hip Hop, Trap, Lo Fi Chill, House, Pop, Reggaeton, Rock, Drum n Bass, Funk, Dreamy and Blank Canvas. Existing internal IDs stay unchanged.

Start screen hero is a short abstract ribbon; do not spend the whole first viewport on art. Include Resume when there is a draft and a visible Blank Canvas option. Picking a starter previews or starts with one deliberate tap, with its selection and playback state visible.

## Motion

- Press feedback 80 ms; expansion 160 ms; drawer 180 ms. Use opacity and small translation, never layout bouncing.
- Only active recording and live playhead convey continuous state. Do not pulse idle Play or unsaved-work indicators.
- Show visualizers use requestAnimationFrame, bounded particles and a proposed 30 fps mobile target, with pause on page hidden. Tie visuals to audio time, not independent timers.
- Reduced motion disables sliding, orbit rotation and pulse. Keep a static waveform/cover and plain recording state. Do not strobe or use flashes as beat indicators.
- No click sounds on editing controls by default. Metronome belongs to musical playback and never contaminates export unless explicitly selected.

## Previews

previews/style_grid.png, style_starters.png and style_sound_drawer.png are design proposals, not captures of implemented features. The grid preview shows four editable columns with a 16-step overview. UI text is illustrative and does not assert tested performance. Contact sheets cover every section A–G.

## Frame composition

Six screenshot overlays are 1080×1920 with a transparent 824×1464 window at x128, y344. Capture the real integrated app at a 412×732 CSS viewport and scale 2×. Set the headline as live layout before raster export, with the specified text region. The PNG is an intermediate overlay; flatten the completed store image to an opaque canvas. Do not submit empty frames or fabricated app screens.

Video frames are 1080×1920 and 1920×1080; share frames 1080×1080 and 1080×1920. Those explicit dimensions override the generic 1600 px maximum. Prevent host resizing for these downloadable export/store resources. Other artwork stays at or below 1600 px per side. Window coordinates and clear text bands are in the manifest.
