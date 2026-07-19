# Super Slice 3D verification bots

Headless puppeteer suites for /satellites/slice-3d/ (Journey + Freefall + Endless
modes, plus the Knife Forge economy). Run from repo root. Run ALL of these after
any change to satellites/slice-3d/index.html before committing:

    node scripts/slice3d/bot_journey.js     # 4 Journey levels end to end (expects LOGIC OK)
    node scripts/slice3d/bot_mechanics.js   # handle-bounce / blade-stick / swing slice / head-bonk (expects MECHANICS OK)
    node scripts/slice3d/bot_cycle.js       # menu-game-menu-how lifecycle (expects CYCLE OK)
    node scripts/slice3d/bot_freefall.js    # Freefall orientation: wall-FAIL / clean-bounce / cut / bonk / pad bounce+chip / slab cut+bonk / clean winning dive (expects ORIENT OK)
    node scripts/slice3d/bot_endless.js     # endless build + live DEPTH hud + wall-fail + best saved + Dive Again (expects ENDLESS OK)
    node scripts/slice3d/bot_forge.js       # all 9 skins apply + buy/equip + premium block + insufficient-funds + grid render (expects FORGE OK)
    SP=/tmp node scripts/slice3d/shot_freefall.js   # screenshots to $SP
    SP=/tmp node scripts/slice3d/shot_title.js

Notes (hard-won):
- WebGL headless needs the swiftshader flags already baked into each script.
- Dev hooks gated on ?dev=1: window._S3 (game) exposes newGame/newFF/newEndless/tap/
  hold/state/world/freeze/stepN; window._S3forge exposes renderForge/forgeTap/sliv/
  setSliv/equip/apply/owned. Set window._S3skiprender=true during long stepped sims
  (rendering every step under SwiftShader is ~10x slower).
- stepN keeps running=false between manual steps; a live RAF with stale fake
  timestamps ran physics BACKWARD once (dt<0 clamp now guards it).
- CSS animations (confetti etc) never START in a frameless stepped-sim page;
  verify pieces in isolation, or run live with a real-time frame pump.
- IMPORTANT: micro-tests must ISOLATE their target by clearing the OTHER world
  arrays (W.slabs/W.pads/W.items/W.crystals .length=0). Adding content shifts the
  seeded RNG world layout, so hardcoded-position tests cross-contaminate (e.g. a
  stray fruit slice bumped the pad-test's combo). The bots already do this.
- The endless/full-run policies need stall-coast + steer-toward-open-shaft, or a
  simple centering policy self-traps.
