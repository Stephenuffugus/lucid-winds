# Blockspace, the handoff (built Sep 05 2026, one session)

**What it is:** the pocket 3D block-art studio in `docs/PLAN.md` (Stephen's Master Plan v4),
built as one `index.html` + `manifest.json` + `sw.js` + icons + a vendored three.js (r161, the
same file Keepsies ships; the plan said a pinned CDN, the fleet vendors because the PWA must be
offline-complete and the host caches by URL).

## Built (v1 milestones from PLAN §16)

| M | State | Where |
|---|---|---|
| M1 skeleton | done: scene, floor+grid, CSS sky, orbit rig, entity store, 8x8x8 chunked merged BufferGeometry with vertex colors, rotation baked into vertices, glass pass, shadow blob | S4 S5 S6 |
| M2 tools, undo, sound core | done: toolbar, gesture state machine (tap / orbit / pinch+pan / hold 350 ms draw-lock / hold eyedrop / double-tap reframe), JSON-safe commands with a 200-step ring and a persisted cmdLog, one undo step per stroke, place and erase anims, haptics, audio engine (pentatonic color=pitch, 6 packs, jitter, 24-voice cap, limiter, generated reverb, PannerNode per event, listener follows the camera) | S2 S7 S8 S12 |
| M3 color | done: drawer, HSL picker with LIVE scene recolor and one undo step on Done, Face / Block / Fill, eyedropper, note name per swatch, swatch preview note, hold-to-remove with nearest-color remap, 6 presets + My colors | S9 |
| M4 rotate + glass | done: select card, 45 degree Y (X and Z under More), glass toggle, glass always chimes, duplicate as ghost-commit, delete, placement on rotated blocks uses the dominant normal with a fallback cell | S8 |
| M5 gradients + mirror | done: 2 to 4 stops, paint-through, Fill + two taps = axis apply with a glissando, step snapping to the palette, X mirror with face swap and rotation mirroring, odd-centre self-pair | S9 S10 |
| M6 projects + share | done: 1 s debounced autosave + visibilitychange + pagehide, projects screen with JPEG thumbs, new / duplicate / rename / hold-to-delete, quota toast, 80% nudge, 2x PNG snapshot through the share sheet with download fallback, JSON file + paste-a-code import/export | S3 S13 S14 |
| M7 gravity | done: support BFS from the floor, clusters fall by their column-min drop, iterated until stable, tweened with squash, tumble + thud, ONE undoable command | S11 |
| M8 PWA + polish | mostly: manifest, versioned SW with old-cache purge and update toast, 3 starters (Rainbow Arch, Little House, Smiley), first-run card with the directions (fleet standard) + tap hint + spin toast, left-hand mode, reduced motion, cap messaging at 3000 / 5000, all 6 timbre packs, three ambience beds (day/dawn birds, night crickets, rain), ASMR mode, portal handshake, music-unlocks include | S13 S16 |

## Added in the second pass (same day)

- Long-press any icon button to hear its name (the release after a long press does not fire it).
- **Music box** (v1.5 #1): a glowing plane sweeps X or Z at a tempo; every block it passes plays
  its note, columns become chords (strummed, 12 voices max per column). Slower / Faster / Axis / Stop
  chip at the top. Starting it enters **play mode**, where taps on blocks play them and change nothing.
- **Watch it build**: the sculpture hides and rebuilds itself in placement order with sound,
  12 seconds at most. Any tap on the canvas stops it.
- **Today's palette** (v1.5 #3): date-seeded five colours and a prompt word, no server, same for
  everyone that day.
- **Copy link** (v1.5 #10): the whole build deflated into the URL hash (`#b=`), opened as a copy on
  arrival; falls back to Copy code when CompressionStream is missing or the link would pass 60 KB.
- Fixed: a `position:fixed` card centred with `left:50%` only gets half the viewport to size itself,
  so the select card and the music box chip wrapped one button per line. Centred with
  `left:0;right:0;margin:auto;width:max-content` instead.

## Gate

`node test/check.mjs` (from `satellites/blockspace`, needs the repo's node_modules; a symlink is
in place). Boots headless with swiftshader and drives REAL pointer events: tap the floor, tap a
block's top, hold-to-draw a 24-block line that is one undo step, an orbit drag that places nothing,
face and block paint, erase, select + rotate + glass, mirror twin, 4x4 bucket fill, gradient span,
a two-block floating cluster falling and coming back with one undo, thumbnail, save, reload, JSON
round trip, then a 2000-block recolor timing. 43 checks. Screenshots land in `test/out/`; look at
them, the gate does not. `node test/thumb.mjs` renders the portal thumbnail.

## Not done, honestly (PLAN QA items that need a phone or ears)

- QA 1 (60 fps at 2k on mid Android and an older iPhone), QA 3, 10, 12 on a real device.
- QA 13, the headphone pass: spatial pan tracks orbit, no repetition fatigue in 100 placements,
  limiter never pumps. Everything is wired; nobody has listened yet. The sample-pack go/no-go
  (PLAN §3) is open until someone does.
- Kid test (the north star): a 7-year-old and a parent, no tutorial.
- Long-press tooltips on the toolbar icons (icons carry aria-labels only).
- Ambience is a first cut. The birds and crickets are synthesized sketches; a headphone pass
  will want the levels moved.
- The v1.5 slate (Music Box first) is untouched, by design.

## Known shapes worth knowing

- Palette indices can be `null` (a removed swatch). Everything that iterates the palette skips
  nulls; face indices stay stable so nothing needs re-numbering.
- The Fill sub-mode does double duty: plain colour = bucket flood, gradient active = two-tap axis apply.
- `FX.hidden` hides a block from its chunk while a stand-in animates; `rebuildChunk` honours it.
- A recolor while sliding is throttled to 10 Hz and is NOT an undo step; Done commits one `pal` op.
- The shared "Music" chip (fleet music unlocks) draws itself over the scene; it is not this app's.
