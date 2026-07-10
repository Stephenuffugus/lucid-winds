# Nova Bloom — Geometry Wars remake (build spec, Jul 10)

Stephen: "i absolutely loved this so we can easily make our own and make it improved with bonus stuff."
Status when written: fork building satellites/nova-bloom/. If missing/partial next session, rebuild from THIS spec (it is the fork prompt).

## Core
Canvas neon twin-stick: LEFT stick move, RIGHT stick aim+auto-fire; AUTO AIM toggle (one-thumb play). Warping spring-mesh grid (~28x48, displaced by explosions/gravity, 1 relax/frame), particle pool + entity caps + Reduce Effects toggle (thermal). Fixed dt, seeded rng (mulberry32).

## Enemies (colorblind by shape+motion)
Moth (wander) · Wasp (seek) · Dart (waits, dashes straight) · Vine Serpent (invuln body, weak glowing head) · Thorn Mine (stationary, bursts to 4 darts when shot) · Gravity Bulb (pulls player/bullets/pollen, warps grid, dies to sustained fire).

## Scoring
Kills drop POLLEN (drifts to player near) → multiplier chain, decays. Score = kills × multiplier.

## Twist: Overgrowth
Kills seed flowers at death spot; mature ~8s; fly over mature flower = harvest → Bloom Bomb meter (manual screen-clear) + bonus. Meter fills / harvest streaks press keepsakes to local Grove gallery (Silt pattern).

## Modes
Arena (endless waves) · Deadline Daily (seeded 3-min score attack = THE daily, streak) · Pacifist Run (no firing; fly through bloom GATES to detonate them) · Zen Drift (invulnerable, pays 0).

## Cosmetics (novabloom_save)
4 ship skins, 3 trails, 3 grid palettes; thresholds on lifetime kills / best multiplier / daily streak / pacifist bests. No lootboxes.

## Plumbing
ES5 only, single file satellites/nova-bloom/index.html, 540x960 #stage. sunbeam-sdk.js?v=4 + Sunbeam.init({gameId:"novabloom"}). DEFINE window._sbCapEarn key sw_sb_novabloom 30/day + 12/run, zen 0. SWS_EMBED/SWS_EXIT block from Silt. PWA meta + favicon. Text 0.7rem+, sticks ≥48px.

## Provability (?nbtest=1 → NB_DEV) — ALL must pass headless
start(mode,seed) / step / state (nan flag) / input-script API / autoplay(seconds): kite+shoot+harvest, must survive ≥90s Arena with ≥50 kills / serpentCheck (body immune, head kills all) / gravityCheck (pull + overfeed kill) / pacifistCheck (gates kill, firing disabled) / zenCheck / determinism (seed+script twice = same hash) / earnTest grants. 0 pageerrors/console errors, node --check clean.

## Ship steps (parent)
Puppeteer re-verify → thumb portal-assets/thumbs/nova-bloom.jpg (270x480 ≤150KB) → portal entry + README row → commit ONLY its paths → push add-sproing-jumper AND :main → art pack Doc to REAL 012Assets (1PI3fQGALCs_5MVu-3NeGMcnaewdFmV7w).
⛔ Art pack must LEAD with non-botanical style options (Stephen's notes); name "Nova Bloom" debatable pre-art.
