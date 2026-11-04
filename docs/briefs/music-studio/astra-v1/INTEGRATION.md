# Integration handoff

## Read first

This ZIP is a design, asset and implementation-specification handoff. It does not replace studio.html and does not claim the live app was fixed. Read ASSESSMENT, SOUND_LIBRARY and dev/LIVE_AUDIT before applying the reskin. The exact requested files are organized under assets/a_identity through assets/g_store. Paths in manifest.json are relative to this package root.

1. Back up the currently deployed single HTML and all device storage formats. Save a representative project with samples, multiple sections, FX, probability and ratchets as a migration fixture.
2. Resolve the microphone policy and sample-rights/copy issues. Verify current soundfont version and credit data before caching or republishing any bank.
3. Integrate SVG icons and CSS tokens. Keep real buttons, labels and range/select semantics. Do not replace native controls with inaccessible pictures. Convert clickable divs to keyboard-operable controls and announce selection states.
4. Integrate lane headers, grid paging and transport. Preserve 16/32/64-step songs. Check 360/390/412/430 widths and desktop; change copy laws through a mapping rather than changing serialized IDs.
5. Add starter covers and the new My Songs presentation. Hook cover seed to a stable project property. Save success artwork appears only after persistence succeeds.
6. Integrate sampler/Hum states, then Show/export art. Audio data is never baked into supplied waveform frames. Runtime waveform pixels must reflect the actual sample.
7. Adopt the sound-source expansion decision in SOUND_LIBRARY. Candidate JSON is research input, not a playable catalog. `ready:false` means not displayed as downloadable sound.
8. Compose store screenshots only from the finished real app. Do not use this package's UI mockups as purported store captures.

## Sound state machine

Idle → loading bytes → decoding → ready → auditioning → committed. Cancel/error returns to the last committed voice without mutation. Use an incrementing request generation token and AbortController so a late request cannot replace a newer choice. Commit one undoable action that updates sound ID/version, sample edits and project dirtiness. Stop old preview nodes and disconnect them; revoke transient object URLs.

Only ready content can be used. Cache storage must finish before a success message that promises offline availability. Retain the prior sample until replacement is committed. If saving fails, keep the new draft in memory with an explicit failure and a backup action. No “saved” toast after a caught quota exception.

## Project and sample identity

The live implementation uses sample names as IndexedDB keys and stores channel zero. Move toward immutable sample IDs plus a content hash, and separate display name. Support channels explicitly. Migrate old keys via an alias table so earlier song codes and projects do not lose references. Do not delete legacy stores until new data commits and reload verification passes. Store projects, index and sample references transactionally where practical; audio bytes and metadata must not get out of sync.

Portable backup needs a schema version, project data, audio or declared missing references, license/source records and cover recipe/seed. Validate sizes, note bounds, finite numbers and permitted strings on import. Insert titles/tags as textContent. Never eval pasted song codes or trust archive paths. If ZIP import is later added, bound expansion size and reject traversal/duplicate entries. Backup export is a proposed feature; this ZIP does not implement the production serializer.

## Saved cover generator

`dev/cover_system.js` is a standalone no-dependency reference utility. Paste into the app if desired; no build step is needed. It returns an SVG string with no external resources or user text. Create seed from normalized title and integer BPM once, store it with `recipeVersion:1` and palette index. A rename or tempo change must not unexpectedly change existing art. Offer Refresh cover as an explicit action. Cache rendered cover thumbnails; do not animate the song list. The twelve examples are reproducible using dev/cover_examples.json.

## Circle, rhythm and Keys

Circle ring positions are in dev/circle_positions.json, clockwise from C. Ring art is decorative. The key cell assets have no baked note labels; the app owns enharmonic spelling and active state. Keep the 360 px ring in a scroller if available width is smaller. A 16-dot necklace reference does not constrain the rhythm engine to 16 steps. Recompute dots for actual steps. Use named rhythm presets as starting patterns, not complete representations of a musical culture.

Keys cap states are up/down/recording, each 48×64 logical pixels. Seven columns require 360 px including gaps before outer gutters; scroll at 360-wide phones. Cover pointercancel, touch interruption and focus loss to prevent stuck notes. Trim handles need numeric alternatives when the waveform is too narrow for nonoverlapping 48 px handles.

## Visualizer references

Bars: 42 reference bins, implement a capped 24–48 visual bins on mobile. Log-spaced audio bins, modest smoothing and peak decay; don't claim amplitude calibration from the art. Orbit: at most 96 particles, seeded spawn paths, bass controls radius and treble opacity. Record: slow rotating concentric grooves with subtle bass radius, not a full-screen flashing disc. Keep current radial mode. All effects need a static reduced-motion view and hidden-page pause. Static reference boards are not final renderer code.

Title card: optional one-second card at start; end card optional one second. Keep audio rendering length and video length explicit; do not cut music to fit cards. Song title is dynamic. Use the current product name until the proposed name is approved. Existing footer may remain “made in Music Studio  lucidwinds.com”.

## Store and TWA

Frames are intermediate RGBA overlays. Their windows and text bands are in manifest.json. Fit real screenshots without distortion, render readable headlines in Google Fonts, composite to an opaque 1080×1920 image, then verify on phone. Suggested headlines are in dev/player_copy.json. Feature/social plates have blank name bands for the chosen wordmark. Maskable app icon has an opaque full square and a centered safe mark. Do not use a transparent logo as the launcher icon.

TWA integration remains the developer's release work: Digital Asset Links with the production signing certificate, actual host policy, microphone permission flow, supported export/download route and privacy disclosures. One HTML applies to the web application, not to the unavoidable Android wrapper and host files. Check current store policies and declarations at submission. No store submission or deployment was performed here.

## Acceptance gates

| Gate | Test | Expected outcome |
|---|---|---|
| Input | Every icon and note cell at all four phone widths, keyboard and 200 percent text | Operable labels and visible focus; no overlaps; grid scroll intentional |
| Start | Slow network, offline after warm session, fresh load | Explicit tap starts synth fallback; cached claims accurate; no false offline-shell promise |
| Mic | Allow, deny, previously denied, missing device, embed, TWA | Clear recovery; old melody/sample preserved; tracks stop on close |
| Save | Full quota, failed index/audio transaction, reload, migration | No false success; recoverable draft; old projects survive |
| Sounds | Rapid previews, cancel while loading, corrupt file, unknown license, missing URL | Single audition; stale results ignored; no silent project mutation |
| Export | Long arrangement, tails, clipping, probability, samples, missing notes | Consistent render with explicit sound choice and correct file format |
| Share | Share API unsupported or rejects, huge song code, local samples | Download fallback; honest missing-media notice; no fake QR or silent omission |
| Video | Unsupported MIME, interruption, frame drops | Supported real container and cancellation; WAV fallback |
| Accessibility | Reduced motion, grayscale, screen reader | Distinct labels/shapes; animation optional; logical focus |
| Store | Post-integration captures and production host | Every depicted action truly works; assets rendered at exact final size |

These are required developer tests. Asset QA completed in this pack is recorded separately in dev/QA_REPORT.md.
