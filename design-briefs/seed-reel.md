# Seed Reel — Revamp Brief

**Revives:** Luck be a Landlord (Trampoline Tales) — the slot-machine roguelike deckbuilder

## The essence (protect this)

The dopamine of a slot pull fused with deckbuilder authorship: you draft one symbol per round and watch a board you designed cash out in a cascading chain you half-predicted and half-got-surprised-by. The loop is Spin, Score, Draft, Pay, repeat — and the hook is the moment a synergy you planted three rounds ago suddenly snowballs.

## Signature upgrade

THE GARDENER'S HAND — one free replant every spin. After the reel settles but before it scores, you may drag any ONE symbol to an adjacent empty cell, and every synergy it would complete lights up as a live preview glow with a running payout tally BEFORE you commit. This is the whole revamp in one move: it converts the slot machine's passive 'watch luck happen' into an active, readable placement puzzle — you still get the draft randomness and the surprise cascade, but you always have exactly one meaningful decision that makes the board yours. It directly kills the 'it's just luck' complaint and the 'I can't see why it paid' complaint at the same time, and it's the thing no LbaL clone does. Skill ceiling: masters chain their one replant across rounds to set up delayed combos; beginners just move the flower next to the bee and feel smart.

## Dated friction to kill

- Pure-RNG helplessness: placement is random, so runs feel like watching, not playing. The #1 Steam complaint is 'it's really just luck' — critical synergy pieces refuse to appear and you can't do anything about it.
- Dead symbols: too many draft options build toward nothing, so late runs are cluttered with inert filler that never chains. Choice paralysis with no payoff.
- Illegible payouts: a fast spin fires ten interactions at once and you can't see WHICH symbols paid or why, so you never learn the synergy web — it stays opaque instead of teachable.
- Rent-tax anxiety loop: the escalating landlord rent is a punishing satire beat, not cozy. A missed payment = instant run death with a shrug. Wrong emotional register for a kid-friendly midnight garden.
- Grind-for-grind's-sake meta: achievements demanding 77-777 wins / billion-coin marathons stretch a one-hour game into 150 hours of repetition. No warmth, no collection, no reason to come back tomorrow specifically.
- Slow, samey spin tempo: no escalation of juice as chains get bigger, so a 5-coin spin and a 500-coin spin feel identical.

## Game-feel spec

- Reel settle: symbols drop into cells with a short squash-and-stretch and a soft soil 'thunk'; the last symbol overshoots and springs back so the board feels physical, not instantaneous.
- Chain-fire cascade: synergies resolve one link at a time (not all at once) on a ~90ms stagger, each link popping the paired symbols with a bloom-burst particle and a rising musical note — a pentatonic ladder that climbs with combo length so a 7-chain literally plays a little melody.
- Nectar arc: earned Sunbeams/nectar droplets physically arc from each scoring symbol into the counter with eased travel and a bucket-fill 'ding' that pitches up as the tally climbs.
- Payout-scaled screen response: tiny spins get a gentle 1px settle; big cascades get graduated bloom-light flash + light screen-shake + a half-second slow-mo hold on the final, largest link so the peak reads as an event.
- The Gardener's Hand grab: the dragged symbol lifts with a scale-up and drop-shadow, valid adjacent cells breathe with a sage glow, and completing-synergy cells pre-light gold with a ghosted '+N' tally that updates in real time as you hover.
- Generous input windows: replant has a large forgiving hitbox and snaps to the nearest legal cell; the draft cards have a long-press to read full synergy text with no timer pressure — cozy, never twitchy.
- Season wash: the whole board palette and ambient particle (petals/pollen/leaves/snow) shifts with the 4-season art system, and the daily seed picks the season so the table looks different every day.
- Haptic per link: one light tap per chain link on mobile so a big cascade is felt as a drum-roll of little pulses, not one buzz.
- Idle life: symbols micro-idle (a bee wing-flutter, a leaf sway) at low amplitude so the frozen board still breathes between spins.

## Onboarding & difficulty

First 10 seconds: the board opens with just three symbols pre-placed — a Flower, a Bee, and one empty cell glowing gold. A single hand-cursor demonstrates dragging the Bee next to the Flower; they chain, petals burst, nectar pours, done. That one gesture teaches the entire game: adjacency = income, and you get to make it happen. No text wall, no rent timer yet. The draft appears next with only 2 clearly-synergizing cards so the first real choice can't be wrong. Assists that decay: for the first ~3 rounds, the game auto-highlights the single best replant with a faint arrow; that hint fades out over the opening run and never returns, so training wheels come off invisibly. Hard-to-master ceiling comes from the synergy web itself (85 companion creatures + plant/season symbols = a huge interaction graph), delayed-combo planning across rounds, and the single-replant constraint forcing genuine priority decisions each spin — beginners feel clever immediately, experts optimize a placement calculus that runs deep.

## Modes

- Grove Run (main): the roguelike ladder — draft one symbol per round, meet a rising 'bloom quota' (reskinned rent) each few rounds, push as deep as you can. Failing a quota ends the run warmly (your garden goes to seed for winter) rather than a punishing eviction.
- Daily Seed: everyone gets the same seeded board, draft pool, and season for the day; one run, leaderboard by score. This is the streak spine and the shareable water-cooler mode.
- Zen Meadow: no quota, no fail state, infinite spins — pure sandbox to discover synergies and just make a pretty, productive garden. The cozy/kid on-ramp and the place people slip into 'the zone'.
- Bloom Rush (challenge): short 8-round sprint with a preset gimmick (e.g. 'all companions doubled', 'season flips every round') for a fixed Sunbeam bounty — bite-sized, rotates weekly.

## Botanical identity

The slot reel becomes a raised garden bed — a grid of soil cells under the midnight sky, deep-black background, sage and gold UI, cream text. Symbols are the game's existing vocabulary reused wholesale: plant/flower/leaf tiles plus the 85 companion creatures (Bee, Koi, Toad, Cicada, Baby Mammoth, the Beholder, etc.), each keeping its established rarity tier and lore-voice. Payout currency is Nectar that pours into Sunbeams, not coins — no cash, no landlord, no satire edge. The 'rent' is a seasonal Bloom Quota: the garden must produce enough nectar before the season turns, which reframes the escalation as a natural cozy rhythm (spring→summer→autumn→winter wash across the board) instead of an eviction threat. Synergy chains read as pollination and growth: a bee visiting a flower, roots feeding a companion, a season buffing its matching plants. Card backs, corner Celtic knots, and the frosted EA-style badges all match the greenhouse card system so it feels like a native Lucid Winds surface, not a ported slot game.

## Retention hook

Daily Seed drives the streak: one fresh seeded garden per day, a visible streak counter, and escalating Sunbeam payouts for consecutive days (feeding the portal economy directly). Every run also drops into a Seed Reel Compendium — a discovery collection of synergies found (e.g. 'Bee + Foxglove = Pollen Cascade') and companion symbols first encountered; completing synergy sets awards cosmetic soil/pot skins and seasonal frames. Because the 85 companions carry their real rarity, pulling a Cosmic-tier creature into your board is a genuine event worth returning for. The two-source Sunbeam economy already exists in the portal, so payouts route through the standard 30/day-per-game, 12/run-cap policy — Seed Reel becomes another daily faucet feeding the plant-collection meta without inventing a new currency lane.

## Why ours wins

Luck be a Landlord makes you watch luck happen and eviction punish you; Seed Reel gives you one perfect move every spin and a garden that blooms — same addictive cascade, finally with agency, readability, and a reason to come back tomorrow.

## Build notes

Single-file HTML5 canvas, ES5-compatible, fits the satellite pattern (self-contained game under /satellites/, wired into the app G[] studio + portal). Heavy reuse: the 85 companion roster, their rarity tiers, and existing plant/flower/leaf SVG art drop straight in as symbols; the 4-season art system supplies the daily palette/particle wash for near-zero art cost; card backs, corner knots, and EA-style frosted badges reuse the greenhouse card CSS for instant native feel. Reuse the Daily-Seed + streak + Sunbeam plumbing already standardized across satellites (30/day/game, 12/run cap) rather than building new economy. Core new systems to build: (1) the adjacency synergy graph + resolver with staggered chain-fire ordering, (2) the Gardener's Hand drag-with-live-preview interaction (the one hard, high-value piece — worth prototyping first to nail feel), (3) the draft pool + quota/season ladder. Effort: medium — a real game, not a weekend clone, but the art and economy are largely free. Watch the known satellite gotchas: knockout-magenta art cutouts to alpha, ?v=hash cache-busting on the image host, and keep it truly self-contained (no shared SW). Prototype the replant-preview loop and chain-fire juice in Zen Meadow before layering quotas — the feel lives or dies there.
