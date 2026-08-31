# ZOETROPE FACES — the build contract

Stephen's call (2026-08-31): *"cool ones like ones with the bird and a bird cage
and maybe a running horse and other stuff that animates when moving fast."*
That is a zoetrope: phase-stepped frames on a spinning disc. On a real top it
needs a strobe; in a game the renderer IS the strobe, so it simply works.

## The illusion, stated once

A zoetrope face is a 12-frame loop painted for the top of the top. The game
picks the frame from the top's own spin phase and draws it UPRIGHT (never
rotated with the disc). Result:

- **Stopped or slow top:** frame 1, frozen. So frame 1 must stand alone as a
  good static emblem.
- **Fast top:** the loop plays, its speed tracking the real spin. The horse
  gallops harder the harder you wound.

## Engine contract (when this is built)

- Draw layer sits in `drawTop` between the painted sprite and the decal, in
  the lean frame, NOT phase-rotated.
- Frame index: `k = floor(((o.phase*0.12) % TAU) / (TAU/12))` — one full loop
  per visual revolution, so spin speed IS playback speed.
- Visibility gate: fade the face in above ~40% of launch spin, out below it,
  crossfading with the static frame 1. `reduced` motion: frame 1 always.
- Assets: one sheet per design, cut by artsupport `('grid',[(4,3),...])` to
  `assets/zoe/<id>-01.webp .. <id>-12.webp`, composited once into an
  offscreen strip per design on first use (the topSprite pattern — and cache
  misses only once `ART.ready`, the law learned 2026-08-31).
- Fallback law as everywhere: no picture, no difference.
- Unlock lane: cosmetic, rung rewards / Field milestones, same as decals.

## Sheet format (what image generation must deliver)

- One design per sheet, flat `#FF00FF` ground, generous gutters.
- 12 frames, 4 wide x 3 tall, row major, frame 1 top left.
- Same subject scale, same anchor point, same palette in every frame.
- The loop must CLOSE: frame 12 flows into frame 1.
- No text, no labels, no posters. No magenta, pink, purple, violet in the art.
- Subject fills ~70% of its cell; silhouette must read at 25px.

The full design queue and the invention recipe live in the Drive doc
"RIPCORD zoetrope faces" in Stephen's Ripcord folder.
