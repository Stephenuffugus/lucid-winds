# Production notes

- Art was generated with the built-in image-generation tool for eleven starter illustrations; UI marks, frames, brand shapes and cover examples are native vector designs or deterministic rendering. None is described as hand painted. No sounds are included.
- Keep Music Studio in production until Stephen approves a name and the team checks availability. Grovewave is the proposed wordmark, with a complete current-name fallback.
- 193 visual assets include both logical SVG marks and their requested raster sizes, larger starter art, and bonus source-confirmed World Beat kit art. See final manifest and QA for final totals.
- Every raster listed as a frame is an intermediate overlay; store uploads must be opaque composites. Explicit 1920-pixel export/store frame sizes override the generic 1600-pixel rule.
- Circle cells are unlabelled art; actual key names remain accessible live UI. Necklace reference is 16-step decoration; the app must render actual rhythm counts.
- Small user-facing naming changes remove dashes without changing serialized internal IDs. Developer documentation can use normal technical punctuation.
- Files in dev are integration references, not a new production app or a patch to the live studio. No deployment, publishing, provider account setup, paid API subscription or message to the development team was performed.

## Sound design notes

UI editing is silent by default. Metronome: short dry neutral tick, stronger first beat, separate count-in level, no long click tails. Sample previews need level matching and short anti-click fades. Do not squash all imported audio to a fixed peak automatically. Stop transport with a short release ramp rather than a click. Test quiet headphones and phone speakers, then inspect actual clipping. Preserve expressive dynamics.

## Next art after integration

Create additional mood covers only after matching starter music exists. Compose six final store shots from real captures. Extend the same icon grammar for MIDI/stem export if those workflows ship. The highest-value next work is implementation and real-device musical testing, not more decorative plates.
