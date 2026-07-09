# Greenhouse Pinball — Revamp Brief

**Revives:** Pinball (Space Cadet / arcade tables)

## The essence (protect this)

The instant, physical thrill of the flipper: a heavy ball rockets around a live table and you keep it alive with perfectly-timed thwacks, chasing "one more shot" up a ramp for the escalating payoff. Protect the tactile flipper feel and the escalation-to-multiball crescendo above everything.

## Signature upgrade

THE CULTIVATION TABLE: the ball is a bead of pollen and the table is a living plant that visibly GROWS as you play. Every lit bumper, completed trellis ramp, and dewdrop target adds a real segment -- stem, leaf, bud -- that sprouts onto the playfield in real time. Fill the growth meter and the plant BLOOMS, triggering Bloom Multiball where the table erupts with pollen-balls; every ball you pollinate (sink in a bloom saucer) mints a real seed into your Nursery. The grown plant's traits are seeded by the day's hash, so the table's layout, bumper placement, and the plant you're cultivating are DIFFERENT every day and deterministic for the daily leaderboard. This fuses the pinball loop directly into Lucid Winds' plant-collection economy and dissolves the \"losing sucks\" problem: a drain doesn't wipe your run, it just ends the current bloom -- you keep every seed you already pollinated. Pinball stops being a disposable score chase and becomes the game's most exciting way to grow plants.

## Dated friction to kill

- Cheap SDTM (straight-down-the-middle) drains and VUK/kicker spit-outs that fire the ball right past the flippers -- the death feels random and unearned, not skill-based (the #1 Pinball FX complaint).
- "Losing sucks" -- a drain ends the whole run and dumps you back to a menu with nothing to show for it. Brutal for a cozy/kid audience and terrible for session length.
- Tilt/nudge is punishing and opaque: warnings burn too fast on common ball paths and you get penalized for defending a bad bounce.
- No goals for newcomers -- classic tables are a naked high-score chase with no legible objective, so a first-timer has no idea what they're supposed to do.
- Violent hair-trigger slingshots and inconsistent ramp passes make the physics feel unfair rather than crisp.
- The plunger is a mystery box -- new players don't understand pull-strength or where the ball is going on launch.
- Zero persistence -- yesterday's amazing run left no trace; nothing pulls you back tomorrow.

## Game-feel spec

- Flipper input buffer (~90ms): a press that lands just before the ball arrives still connects -- kills the "I hit it and nothing happened" feel. Flippers are two spring-loaded leaf-blades with a satisfying snap-back ease.
- "Moss net" ball-save: a glowing bed of moss spans the drain for the first 8s of every ball (and always on the last ball) and bumps a doomed ball back up once. Beginner-visible, generous, forgiving.
- Anti-SDTM insurance: kickers/saucers never eject dead-center; a subtle magnetic nudge biases ejects toward a flipper-reachable lane. Slingshots are tuned firm-not-violent with no hair trigger.
- Gentle nudge with a readable tilt: three warnings shown as the table leaning + creaking wood SFX and dew sloshing; warnings decay over ~10s so you're never one bad path from a tilt. Tilt only forfeits the current bloom, never the seeds banked.
- Juice on payoff: screen shake scaled to jackpot size, petal-burst and pollen-shimmer particles, a bass "thunk" on bumpers that rises in pitch as combos chain, and a light-bloom flash when a ramp completes.
- Slow-mo save moment: when a ball dives at the drain on your last ball, time dips to ~0.4x for a heartbeat so a clutch flipper save feels heroic and cinematic.
- Living camera: slight parallax and a soft zoom-punch toward the action on multiball launch; the table breathes (leaves sway on a 6s cycle) so it feels alive even at rest.
- Combo readability: a right-rail "growth ribbon" fills tick by tick with a springy overshoot; the current multiplier is a big soft-glow number so the escalation is always legible.
- Haptic map (where supported): a short tap on bumper hits, a firmer double-pulse on ramp completion, a sustained rumble during Bloom Multiball.

## Onboarding & difficulty

First launch drops you straight onto the table with the moss net glowing and a single objective pip lit: \"Grow the stem -- hit the sunflower bumpers.\" An animated tendril demos the plunger pull-and-release, and your very first launch is auto-aimed up a safe lane so shot one always feels good. There are no numbers to parse -- you watch a plant grow from your hits, which is self-explanatory and delightful in seconds. Mastery ceiling stays deep: precise flipper cradling and dead-bounce control, backhand trellis shots, nudging to steer, and combo-chaining to stack the bloom multiplier before it decays. Assists DECAY with skill -- as your running average climbs, the moss net shrinks and the tilt tightens, and choosing to play with a thinner net grants a score/Sunbeam bonus, so good players opt into difficulty for reward rather than having it forced on them.

## Modes

- Zen Greenhouse (main cozy mode): endless, no fail state -- drains just re-plunge; play forever, grow plants, no pressure. The kid-safe default.
- Daily Bloom: one deterministic hash-seeded table + plant everyone shares that day; single credit, leaderboard, and it feeds the streak. THE retention spine.
- Bloom Rush (challenge ladder): a run of escalating missions (light the trellis, chain 3 ramps, trigger multiball, pollinate 5) with a boss-bloom finale -- the hard-to-master track.
- Seed Hunt (collection challenge): a rotating table tuned to mint a specific rare companion-hosted plant, giving collectors a reason to grind a known target.

## Botanical identity

A moonlit greenhouse workbench viewed top-down: deep-black soil playfield, sage-glowing trellis lanes, gold dew-glint on the rails, cream light bleeding through the glass roof. Flippers are two spring-loaded leaf-blades; the plunger is a coiling tendril you draw back; bumpers are pollen-heavy flower heads (sunflower, foxglove, thistle) that puff petals when struck; ramps are climbing trellises; saucers are open seed-pods; the drain is a compost bin bridged by the moss net. One of the 85 companions \"hosts\" each table -- a Firefly lighting bumpers, a Koi circling a pond kicker, a Garden Spider strung across a skill-shot -- reused straight from the roster. The 4-season art system reskins the whole table: Spring cherry-blossom trellis and pink pollen, Summer sunflower gold, Autumn copper-maple ramps and drifting leaves, Winter frosted glass with icy-blue dew and slow-settling snow. The plant you cultivate renders in the existing procedural SVG plant style so the bloom on the table matches the seed it mints.

## Retention hook

Daily Bloom is the anchor: a fresh hash-seeded table and target plant every day, a visible streak counter, and a login-streak that widens the moss net / boosts payout so missing a day has a small sting. Every completed Bloom mints a seed straight into the Nursery -- pinball becomes a primary faucet for the collection meta, so the collector and the pinball wizard are the same pull. Sunbeams pay out as capped bloom-jackpots (respecting the per-run cap in the Sunbeam earn policy), and rarer plants only surface from the harder challenge tables, giving mastery a collection payoff. A weekly \"Perfect Bloom\" (full-clear the daily) awards a guaranteed rare seed to protect long-tail engagement.

## Why ours wins

It's the only pinball where every flip is growing a plant you actually keep -- the classic's flipper high wired straight into a daily, collectible, seed-minting loop, with none of the cheap-drain cruelty that makes the old ones feel unfair.

## Build notes

Single-file HTML5 canvas, ES5-compatible, one animation loop. Heaviest lift is a lightweight 2D physics core: circle-vs-line-segment collision for a ball against static wall segments plus two rotating flipper segments and impulse-based bumper/slingshot reflections -- entirely hand-rollable in a few hundred lines, no framework (which the no-frameworks rule requires anyway). Everything else is reuse: the 4-season art system reskins the table (seasonal palettes + particle sets already exist), the 85 companions drop in as table hosts, and the deterministic SHA-256 hash/trait pipeline (hashToTraits, _generatePlantSVG) generates both the daily table layout and the plant that grows on it, and mints the seeds into the Nursery via the existing FG_Data.addSeed path. Sunbeam payout routes through _e()/the existing earn policy with the per-run cap. Scope in phases: (1) physics + flippers + one table feel-complete, (2) growth meter + Bloom Multiball + seed minting, (3) Daily/Zen/challenge modes + streak wiring, (4) 4-season skins + companion hosts + juice/haptics pass. Tune flipper geometry and slingshot angles on-device (Pixel 9) since feel is the whole product; keep 48px+ touch zones for the two flipper halves.
