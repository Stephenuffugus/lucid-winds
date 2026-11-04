# Integration contract

No production source was supplied. The selectors in the old brief are historical clues, not verified insertion points. This file describes observable behavior and asset mapping. Keep one vanilla HTML game file and retain existing CSS/SVG fallbacks behind successful asset load/decode.

## Load and fallback

1. Copy only `assets/` into the game's asset location. The documents, previews and dev folder are handoff material, not startup payload.
2. Map the exact scene names to the IDs in the style guide. Do not derive them from display text or punctuation at runtime.
3. Load current scene, selected character and current witness strip first. Decode assets before switching visibility. Preload the next room during safe pauses, not every PNG at startup.
4. On an asset load failure, retain the existing drawing and game state. A failed image must never consume a strike, delay a cover window or block the start button.
5. Use the manifest dimensions, windows, anchors and nine-slice insets. Cache-version asset URLs when content changes. Do not request the original generated masters.
6. SVG rigs must be inline to switch groups or apply CSS variables. With an `<img>`, switch to the individual expression SVG/PNG files instead. Never inject unsanitized user-provided SVG.
7. Keep a bounded decoded-image cache: current room, next room and selected performer states. Twelve 900x1600 RGBA backgrounds alone would occupy roughly 69 MB decoded, regardless of their compressed file sizes.

## Layer order

Room plate → optional cover prop clipped inside scene → witness strip → player bust → flush/sweat overlays → noninteractive reaction caption → HUD and controls. Leaks must be on a separate interactive layer with non-overlapping minimum 48 CSS px targets. All decoration has pointer-events:none.

A strip is 1080x540 and contains a complete row, not three arbitrary equal sprite cells. Scale it uniformly. Start with its full width aligned to the stage container. The backs and turned files share their export canvas and registration. If individual witness timing is desired, use the manifest's region boundaries as clips; do not assume that all generated shoulder widths are equal. A simple first implementation swaps the entire row after a strike. More refined staggering needs per-person masks to avoid clipping shoulders.

## Controls and clock

- Use pointer IDs and pointer capture for each pad. Handle pointercancel, blur, visibilitychange and orientation changes; release both pads on pause.
- Keep pads at least about 140 CSS px wide and 120 px high when space permits. Every interactive control and leak is at least 48x48 CSS px; visible art may be smaller.
- Do not require two held pointers plus a third finger. Explicitly define the consequences and grace, if any, for moving one thumb to VENT, a leak, Sip or breath. Tune after a physical-phone playtest, not from this drawing.
- Cover countdown, perfect-window decision and visual prop position all use the same monotonic gameplay time. Timers freeze during pause and backgrounding. Do not use animation completion as game logic.
- The static cooldown and leak-ring exports demonstrate visual treatment. Real rings must reflect real remaining time, not rotate a fixed bitmap.
- Keep HUD content outside palette filters. Reserve a stable caption ribbon so words never cover eyes, the pressure fill or interactive leaks.
- Screen reader names and keyboard commands belong to native buttons. Tab order follows visual order; toggles expose state, and dialogs trap focus and restore it. Avoid announcing every pressure tick.

## Save data and rewards

Preserve existing `ff_save` identities and unlock thresholds. Confirm actual Silver Screen eligibility against the code before changing its wording. The legacy note says Easy/Normal/Panic/Daily/Zen, while the new brief says every mode. Do not remove existing unlocks or retroactively reset streaks.

Character IDs: everyman, gentleman, grandma, mime, bulldog. Expression IDs: calm, nervous, strain, critical, blowout, relief. Palette IDs: matinee_sepia, midnight_show, technicolor, silver_screen. Adapt to existing identifiers with an explicit map; do not rename persisted values without migration.

## Share export

Capture an immutable final-state record containing mode, difficulty, scene ID, act index, duration, final expression, verdict, seed/version when applicable and actual score. Draw the matching room/bust and frame onto a local canvas, then add text inside the manifest bands. No network upload is necessary. Escape text in DOM previews. Share only after a user tap; save-image fallback if native sharing is absent or canceled. Never invent a record for promotional convenience.

## Store capture

Frames are 1080x1920 with window [96,410,888,1440] and headline [100,80,880,200]. Capture a real integrated screen. Preserve aspect ratio, decide crop deliberately and ensure essential HUD is not cut. If a whole 412x915 capture is needed, letterbox it inside the window with paper rather than stretch it. Export the final flattened RGB PNG/JPG at 1080x1920. Six blank frames are included, not six final gameplay screenshots.

## Phone acceptance

Check 360, 390, 412 and 430 CSS px widths, short viewport and browser bars, bottom safe area, both orientations, mute, reduced motion, grayscale, each theme, all expressions, all scenes, every modal, failed asset loads, slow loading, offline reload, simultaneous touches, pointer cancellation, background/resume and saved-game migration. Inspect final real store captures for missing glyphs and arcade chrome overlap.
