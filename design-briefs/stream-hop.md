# Stream Hop — Revamp Brief

**Revives:** Frogger / Crossy Road

## The essence (protect this)

One-more-run tension: read a shifting wall of hazard lanes, commit to a single clean hop through a gap, and push your distance one row further than last time. The whole game is the split-second "is the gap open NOW?" read, rewarded instantly and restartable in under a second.

## Signature upgrade

The Bloom Trail. Every clean hop grows a living vine of moonlit lily-lanterns behind your critter across the stream — it doubles as your visible combo meter (petals brighten, chime pitches up) AND, the instant you reach the far bank, the whole trail crystallizes into ONE keepsake plant minted straight into your Greenhouse. The longer and cleaner the crossing, the rarer the bloom. You are not just surviving the stream, you are weaving a garden across it — so risk, distance, and reward are the same gesture, and the arcade loop feeds the collection economy natively instead of bolting a shop on top. Bank early for a safe common; push deeper for a shot at Epic+, but one bad hop wilts the whole trail.

## Dated friction to kill

- Mushy, ambiguous input — the #1 complaint on every Frogger remake (Toy Town literally reviewed as 'a coin flip whether Frogger goes where I want'). Deaths feel like the game's fault, not yours.
- Instant, unforgiving death the frame a car/log edge touches you — no grace, no read of intent. Punishing for kids and casual players.
- Time-pressure and fixed levels (classic Frogger) cap the loop and add stress; the goal 'fill 5 home slots before the clock' is fiddly and dated.
- Log/turtle riding that silently slides you off-screen with zero forgiveness or auto-centering.
- Static, repeated board — no procedural freshness, so runs blur together.
- Score-by-time instead of score-by-distance, which kills the 'beat my own record' pull that made Crossy Road stickier than Frogger.
- Cluttered HUD and slow restart flow that breaks the dopamine-restart cadence.

## Game-feel spec

- Hop = a real arc with squash-on-crouch, stretch-at-apex, and a fat squash-landing; ~180ms so it's snappy but readable. Never a teleport.
- Input buffering / hop queue: taps during the in-air animation are stored and fire the instant you land, so rapid-fire hopping never eats an input (this alone fixes the Toy Town 'coin flip' feel).
- Coyote-time forgiveness: ~120ms grace window when a lily pad slides out from under you, plus auto-center onto the pad you land on so riding never feels like ice.
- Near-miss juice: a koi/acorn whooshing one tile away triggers a subtle camera nudge, a whoosh-pan of the SFX, and a bright 'PHEW' petal-burst — punishing you into learning the timing without killing you.
- Slow-mo on the final risky hop of a long trail: time dilates to ~40% for the last gap before the bank, so the payoff moment breathes.
- Landing feedback stack: ripple ring on water, dust puff on land, a single haptic tick per hop, and a combo chime that climbs a pentatonic scale as the Bloom Trail lengthens.
- Death is a soft wilt, not a hard cut: critter does a gentle plop/tumble, trail petals scatter, and the restart button is already under your thumb — new run in <0.8s.
- Trailing petal particles stream off the critter at high combo; screen edges bloom with a faint vignette of the current season's color.
- Camera eases forward with a slight lead-look in the hop direction so you can always see the next two lanes.

## Onboarding & difficulty

First run auto-drops you on the bank with the first three lanes SAFE and the current running at half speed; a soft ghost-arrow pulses forward and the word 'Tap' floats once. You learn the entire game — tap to hop forward, swipe to hop sideways — in the first two taps, no text wall. Training wheels are assists that silently decay: run 1 has wide pads + slow current + generous coyote-time; by run 4 they've faded to standard. The ceiling comes from mastery layers the tutorial never mentions: reading two lanes ahead, chaining hops in rhythm with the current for a flow-combo multiplier, choosing WHEN to bank your Bloom Trail vs. push, and threading express lanes where hazards move a full tile per beat. Easy to cross once, a lifetime to cross deep and clean.

## Modes

- Endless Stream (main): procedural hazard lanes scroll forever, score = furthest row, camera creeps up behind you so you can never fully stop. The Crossy-Road 'one more run' spine.
- Daily Current: one seeded run everyone in the world shares that day, single life, feeds the streak — miss a day and the streak resets. Drives the portal's daily/Sunbeam loop and a friendly leaderboard.
- Zen Meadow: no-fail cozy mode, slow dreamy current, no death — just hop and collect at your own pace. Kid-and-parent safe, still grows (lesser) Bloom Trails.
- Weekly Challenge: a rotating modifier run (fog banks, double-speed koi, 'pads only bloom once', mirrored controls) for the hard-to-master crowd, with a guaranteed rare bloom for a clean finish.

## Botanical identity

A moonlit midnight stream winding through the Lucid Winds garden. 'Roads' become dew-slick log causeways where the traffic is tumbling acorns, trundling hedgehogs, and rolling seed-pods; 'rivers' become the stream itself with drifting lily pads, floating lotus, and the koi from the companion roster gliding as living hazards; safe 'grass' rows are mossy banks dotted with fireflies. Your hopper is any of the 85 companions reskinned as the star — tree frog, newt, dragonfly, toad, even the mammoth as a heavy 'slow but sturdy' unlock — each subtly changing the world tint like Crossy Road's characters do. The 4-season art system reskins the same stream: Spring pads are wide and pink-lit, Summer current runs fast and gold, Autumn floats leaf-rafts you can ride, Winter freezes patches into slippery-but-slow ice. Deep blacks, sage water, gold lantern-blooms, cream firefly glow — reads native, not ported.

## Retention hook

Three interlocking pulls, all feeding the Sunbeam economy. (1) The Daily Current streak grants escalating Sunbeams and a milestone bloom at 7/30/100 days — the portal's core habit. (2) Every banked Bloom Trail mints a real plant into the Greenhouse collection, so an arcade session literally grows your garden; deeper crossings roll for rarer grades, giving the collection meta a fresh non-breeding source. (3) Distance milestones and a gentle 'which companion hops next' unlock reel turn the 85-companion roster into a long-tail collection chase. Sunbeams earned cap per run and per day per the portal standard, so it rewards showing up daily over grinding one session.

## Why ours wins

Every clone just re-skins the crossing — ours makes the crossing GROW your garden, with input so forgiving the deaths finally feel fair, so a kid and a veteran both leave every run holding a flower.

## Build notes

Single-file HTML5 canvas, ES5, fits the satellite/portal pattern. Cheap core: everything is grid-based (tile lattice + lane objects moving at fixed beats), so collision is index math, not physics — runs fine on low-end phones and avoids the iOS SVG-filter traps. Heavy reuse: the 4-season art system reskins lanes/pads/current directly; the 85 companions drop in as hopper skins + hazard koi with existing art; the Bloom Trail reward routes through the existing plant renderer (_generatePlantSVG / hashToTraits) so minted crossings are real one-of-one plants with haiku, no new art pipeline. Procedural lane generator = weighted lane-type table with a difficulty ramp + a solvability guarantee (never spawn an ungappable wall, à la the Pollen Panic maze-validator lesson). Daily Current = deterministic seed from the date. Effort estimate: medium — the arcade engine + input-buffer/coyote-time layer is the real work (~1-2 build phases); art and reward are mostly wiring into systems that already exist. Ship spine first: input-feel + endless mode + one companion, then layer trail-mint, then modes/streak. Colorblind: hazards get shape/motion cues, not just color. Follow the Sunbeam earn standard (30/day/game, cap 12/run).
