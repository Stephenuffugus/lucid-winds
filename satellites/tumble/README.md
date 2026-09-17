# TUMBLE

A cozy 3D sock sorting game for phones. The dryer opens, a heap of socks tumbles onto the folding table, and you
find every sock's twin, roll the pair into a ball, and toss it into the basket. Laundry Day has no timer and nothing to
fail; Rush adds a clock, streaks and powers. Odd socks wait in the Odd Bin until their mate turns up.

- Design contract: [DESIGN.md](DESIGN.md). Overnight brief: [docs/OPUS_PROMPT.md](docs/OPUS_PROMPT.md).
- Every call made along the way: [DECISIONS.md](DECISIONS.md). Status and next steps: [HANDOFF.md](HANDOFF.md).

## Run

```
python3 -m http.server 8080      # from this folder; ES modules need http, not file://
```

Open `http://localhost:8080/`. Add `?debug=1` for the FPS and physics overlay (it also prints the last ball flick;
`?shotgain=` and `?rangeassist=` tune the flick on a phone without a code change).

## Test

```
npm install        # Rapier for the Node tests (the only dependency)
npm test           # 11 suites: physics, atlas, match, lifecycle, economy, odd bin, save, daily, service worker, input, shot
sh dev/run-gates.sh  # browser gates, headless Chrome with software WebGL (slow; one at a time)
node dev/perf.mjs    # the debug overlay numbers in five scenes
```

## Layout

```
index.html            shell, import map, boot
src/app.js            data, save, audio and UI around the game
src/game.js           state machine: room, drying, dump, play, sweep, results
src/play.js           gestures to sock handling (tap, hold and tap, drag, flick, lob, Odd Bin, flip)
src/session.js        the rules of one Load (pure)
src/physics.js        Rapier world: compound capsule socks, the basket, the Odd Bin, the dump
src/render.js         three.js: instanced socks with an atlas shader, the laundry room
src/table.js          entity poses: physics, held, flights, dump playback
src/room.js           the rest of the room: dresser, door, window, clothesline, decor
src/ui.js, screens.js DOM: HUD, results, settings, Drawer, Odd Bin, Clothesline, shop
src/loadgen.js        Loads, decoys, tiers, the Daily (pure)
src/economy.js        Lint, Quarters, Reunions, pegs (pure)
src/save.js           IndexedDB save, export and import, migrations
src/audio.js          Web Audio synth for every cue, and the radio stations
engine/sockgen.js     seed -> spec -> painted tile (pure JS, deterministic)
engine/flat.js        flat sock pictures for cards and thumbnails
assets/geo/           procedural placeholder silhouettes (drop Meshy GLBs here, see manifest.json)
data/                 hero socks, lore, unlocks, clothesline
tests/, dev/, tools/  Node tests, browser gates and dev pages, authoring tools
```

Sky Wolf Studio.
