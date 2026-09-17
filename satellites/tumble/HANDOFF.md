# TUMBLE: handoff

Overnight build, 2026-09-17, by Opus. Written for the morning reviewer (Fable) and for Stephen.
Honest status beats optimistic status: every "works" below says how it was checked.

> **This file is updated at the end of the run. If the header below still says IN PROGRESS, the run was cut
> short; the last commit on `add-sproing-jumper` touching `satellites/tumble/` is the truth.**

**Status: IN PROGRESS** (first draft at 07:45 UTC)

## How to run it

```
cd satellites/tumble
python3 -m http.server 8080        # any static server; file:// cannot load ES modules (DECISIONS.md)
open http://localhost:8080/            # the Laundry Room
open http://localhost:8080/?debug=1    # FPS, frame time, physics step, bodies, draw calls
open http://localhost:8080/?load=laundry&size=regular&tier=4   # straight into a Load
open http://localhost:8080/?smoke=200&debug=1                  # the 200 sock physics smoke pile
open http://localhost:8080/dev/atlas.html                      # 64 tiles from 64 seeds, determinism readout
open http://localhost:8080/dev/physics.html                    # DESIGN 15.1 on this device
open http://localhost:8080/dev/flick.html                      # DESIGN 15.2
npm install && npm test            # the Node tests (Rapier is the only dependency)
sh dev/run-gates.sh                # the browser gates, one at a time (headless SwiftShader, slow)
```

Where it lives: `satellites/tumble/` in the lucid-winds repo, branch `add-sproing-jumper`, pushed to the branch only.
It is **not on main** and not live. See DECISIONS.md "Where the game lives".

(The rest of this file is filled in at the end of the run.)
