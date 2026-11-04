# Delivery notes

This package is an art and design handoff for Fable and Stephen. The supplied archive contained screenshots and art briefs, not the game source. There is no claim that the live game has been changed, tested or made store-ready. The screenshot frames are blank assets for real captures after integration.

## Deliberate choices

- Retained Flatulence Fighter and Silent Reel. Used original generated scenery and witnesses with an editable vector cast and UI. No competitor material is included.
- Used the permitted SVG character route rather than an oversized six-cell 720 px atlas. All 30 individual expression SVGs and transparent PNGs are included in addition to five switchable rigs.
- Used Noto Serif and Open Sans, both available through Google Fonts. The wordmark is outlined. No runtime font dependency is hidden in its SVG.
- Did not include audio files. All audio below is a proposal for the existing synthesizer.
- Did not bake blush or sweat into player art. No clouds, smell trails, crude images, real brands or borrowed characters.
- Used monochrome vector medals, without an unnecessary painted duplicate. Wardrobe portraits and palette plaques are supplied at the requested exact sizes.
- A screenshot-frame PNG and a sharing-frame PNG are intentionally transparent inside their image windows. Final assembled store screenshots must be opaque. Their exceptional 1920 px height follows the store/share output sizes explicitly requested.
- Generated witness drawings are clean two-state cutouts, not mechanically identical animation meshes. Shoulder/head shapes change slightly between views. Use an immediate swap, or cover the cut briefly with the scene caption; do not tween geometry. Bounds and registration are recorded in the manifest.
- Repeated body-count errors in a generated source, if present, are handled by selecting a complete contiguous two- or three-person region during export, never by shipping a mismatched number of witnesses.
- The artwork-only dimensions/alpha/budget checks are in `QA.md`. Game input, DOM semantics, runtime memory, save migration and store submission remain the development team's acceptance work.

## Sound direction, synthesized only

1. Hold: nearly inaudible low woodblock/tick on initial press, not a constant repeated pulse. Provide mute and independent music levels.
2. Cover start: one short, clearly differentiated onset cue. Its onset is scheduled from the same event clock that opens VENT. No sound should precede the safe state without an explicit pre-cue rule.
3. Perfect: a light two-note piano interval, 60 to 100 ms per note, followed by silence. Keep it quieter than the cover event.
4. Strike: dry muted rim/wood tap plus the room reaction, never an exaggerated bodily sound. No startling full-volume burst.
5. Organ swell: a few band-limited oscillators with a slow attack, low gain and release, capped total polyphony. Stop or ramp down on pause and visibility loss.
6. Piano accompaniment: sparse 2-bar motifs; increase harmonic tension with pressure rather than increasing loudness. Avoid copying a recognizable tune. Duck music under timing cues.
7. Every audio event has visual parity. Silent players must see safe-window onset, remaining duration and outcome.

## What to build next

First integrate one complete Funeral loop: menu, tutorial, intertitle, hold, cover, leak, strike, recovery, result. Test it before cloning the mapping across all scenes. Then integrate the remaining 11 rooms and earned wardrobe. Next add the local result exporter, then staged cover props. Defer new scenes and comic reels until input confusion and repeated-run motivation have been playtested.

Measure where new players release pads unintentionally, whether they can explain their last strike, and whether someone voluntarily sends a result card. No download or revenue estimate can be justified from these captures.
