# Super Slice 3D verification bots

Headless puppeteer suites for /satellites/slice-3d/ (both modes). Run from repo root:

    node scripts/slice3d/bot_journey.js     # 4 Journey levels end to end (expects LOGIC OK)
    node scripts/slice3d/bot_freefall.js    # orientation mechanic: chip/clean-bounce/cut/bonk + winnable run (expects ORIENT OK)
    node scripts/slice3d/bot_mechanics.js   # handle-bounce / blade-stick / swing slice / head-bonk (expects MECHANICS OK)
    node scripts/slice3d/bot_cycle.js       # menu-game-menu-how lifecycle (expects CYCLE OK)
    SP=/tmp node scripts/slice3d/shot_freefall.js   # screenshots to $SP
    SP=/tmp node scripts/slice3d/shot_title.js

Notes (hard-won):
- WebGL headless needs the swiftshader flags already baked into each script.
- Dev hook window._S3 gated on ?dev=1; set window._S3skiprender=true during long
  stepped sims (rendering every step under SwiftShader is ~10x slower).
- stepN keeps running=false between manual steps; a live RAF with stale fake
  timestamps ran physics BACKWARD once (dt<0 clamp now guards it).
- CSS animations (confetti etc) never START in a frameless stepped-sim page;
  verify pieces in isolation, or run live with a real-time frame pump.
- The freefall bot needs its stall-coast + escape-toward-open-shaft policies;
  simple centering policies self-trap hopping on center platforms.
