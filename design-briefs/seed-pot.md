# Seed Pot — Revamp Brief

**Revives:** Suika / Watermelon Game

## The essence (protect this)

Drop a seed, watch two identical ones kiss and bloom into the next thing up the ladder, and ride the tension of a physics pile creeping toward the rim. The hook is the compounding "one more merge" chain reaction — a single well-placed drop cascades three tiers up — married to the sweaty overflow gamble. Protect that: generous, satisfying merges plus honest, self-inflicted overflow pressure.

## Signature upgrade

COMPANION BLOOM. The top of the ladder doesn't just pop for points like every Suika clone — when two Heirloom Blooms merge, one of the 85 Lucid Winds companions HATCHES from it in slow-motion, does a joyful sweep across its corner of the pot (clearing a neighborhood of seeds and relieving overflow pressure), and is minted into your Compendium as a permanent collectible. This one idea fixes the two worst legacy problems at once: it kills the dead-fruit endgame stalemate (the big blooms now have a glorious exit that also clears space and buys you runway), and it converts the climax from a throwaic score bump into a gotta-hatch-'em-all collection drop that feeds the meta and the economy. Nobody else does this — clones stop at reskinning the fruit.

## Dated friction to kill

- Pure drop RNG feels unfair: the classic hands you the wrong seed exactly when you need a match, so runs die to luck, not skill. Players say this out loud constantly.
- Only a one-seed lookahead. Not enough to plan, so it reads as random rather than strategic.
- Overflow is a hard, sudden death on a thin red line with no grace and no warning cadence — it feels like the game killed you, not that you lost.
- The endgame is a stalemate: the two biggest fruits just sit there hogging the pot with nothing to do but nudge them and pray. The reward for reaching the top (they pop) is anticlimactic.
- Mushy, unreadable physics — near-miss merges that visually touch but don't combine feel like a bug and break trust.
- No reason to come back tomorrow. It's a high-score island with no daily, no collection, no progression. Every clone just reskins the fruit and stops there.

## Game-feel spec

- Mercy-merge: merges resolve on generous overlap, not pixel-perfect tangency, so a near-miss that looks like it touched DOES combine. Trust is everything in a physics game.
- Squash-and-stretch on every merge: the new plant overshoots ~115% then settles with a spring ease (~180ms), so growth feels alive, not like a sprite swap.
- Audio ladder: each tier's merge chime is pitched one step up the scale, so a big cascade literally plays an ascending arpeggio. This is the dopamine spine — copy Threes/2048 phone-game satisfaction.
- Pollen burst on merge tinted to the current season's palette (spring rose, summer gold, autumn copper, winter ice), volume of particles scaling with tier.
- Screen presence scales with stakes: tier 1-3 merges get a soft haptic tick and no shake; high-tier merges get a low-frequency thump, a 2-3px settle-shake, and a micro camera push-in.
- Companion Bloom is the money shot: hard slow-mo to ~25% speed, camera zoom on the bloom, bloom of light, the companion's signature sound, then the sweep. Earn the pause.
- Overflow is a pulsing overgrowth-vine at the rim, not a thin red line. It glows amber, then breathes red faster as a seed rests above it, with a ~2.5s grace timer and a rising warning tone. You always feel the loss coming and own it.
- Ghost drop preview: a translucent seed + a faint drop-column guide shows where it lands and, if it'll merge, a little glow links it to its partner before you commit.
- The waiting seed rocks/bobs gently on the fingertip and squishes on release — tactile, cozy, idle-satisfying even between drops.

## Onboarding & difficulty

First-timer learns in about three drops: the opening pot pre-arms so the first two seeds are a guaranteed match, so your very first action produces a merge, a chime, and a bloom — the loop teaches itself. The overgrowth-vine danger line stays disarmed until after your first merge, so nobody dies before they understand why. Ghost preview and the partner-glow link are ON at the start. It stays hard-to-master because assists DECAY: the merge-partner glow fades out after your first few Companion Blooms, the visible next-seed queue is 3-deep in Zen and early play but narrows toward 1-deep at higher stakes / harder modes, and the mercy-merge radius tightens slightly as your skill rank climbs. Ceiling stays high because the real skill — pile management, saving a bank slot for the right moment, sculpting the pot so cascades chain — is never automated.

## Modes

- Classic Pot — the ranked climb: seed the pot, chase your best, real overflow, full leaderboard. The main event.
- Zen Pot — no overflow death (the rim just gently composts the lowest loose seed to make room). Cozy, kid-safe, endless pottering. The default for nervous first-timers.
- Daily Pot — everyone gets the same date-seeded seed sequence; one shot, shared leaderboard, feeds the streak. This is the retention engine.
- Season Challenge — a rotating small-pot or modifier run (e.g. Winter Pot: slippery seeds; Autumn Pot: everything one tier smaller) for a weekly badge and bonus Sunbeams.

## Botanical identity

A single hand-thrown terracotta pot sits on the midnight greenhouse bench (deep blacks, sage, gold, cream), a warm work-lamp glow pooling over it. The 'fruit ladder' becomes a plant-growth ladder rendered from the existing plant-SVG system: Seed to Sprout to Seedling to Bud to Blossom to Fruit to Heirloom Bloom, each tier a readable silhouette that clearly grows in size and lushness (readability first — distinct shape AND color per tier, never color-only, so it's colorblind-safe and kid-parseable). The whole palette reskins by real-world season via the 4-season art system, so the pot in July glows summer-gold and in December glows winter-ice. The rim danger line is an overgrowth vine curling over the pot's lip. The waiting seed hovers on a soft beam of light above the pot. Companions that hatch are the same 85 creatures used elsewhere, so a Seed Pot bloom and a greenhouse companion are the same characters — one world.

## Retention hook

Daily Pot is the spine: play once a day, keep the streak, streak pays Sunbeams (respecting the 30/day, 12/run cap policy) that flow straight into the plant-collection economy. Layered on top: the Companion Bloom Compendium — each of the 85 companions is a hatch-to-collect page, and rarer tiers only appear from deeper runs, so mastery and collection pull the same direction. Milestone blooms (first time you reach Heirloom, personal-best pot) mint an actual procedural plant into the greenhouse, tying Seed Pot's climax to the core meta. Three intertwined reasons to return: streak, collection gaps, and best-score chase — each feeding Sunbeams.

## Why ours wins

Every other Suika clone just repaints the watermelon — ours is the only one where reaching the top hatches a living companion you keep, turning the dead-fruit endgame into the best moment in the game.

## Build notes

Single-file HTML5 canvas, ES5, no frameworks (per house rules). The one genuine engineering cost is a compact custom 2D physics loop — circle-circle gravity/collision with impulse resolution and a small positional-correction pass; a few hundred lines of hand-rolled solver, very doable, no library. Reuse is heavy and derisks the build: the 4-season palette system drives the whole reskin; the 85-companion art library is the Compendium and the bloom payoff (no new character art needed); the plant-SVG tiers can be pre-rasterized to sprites at load for cheap canvas blits. Wire Sunbeam payouts through the existing economy/_e hooks and the daily-streak/Sunbeam portal plumbing already in place. Determinism for Daily Pot: seed a small PRNG from the date so the sequence is identical for all players. Keep the seed queue and mercy-merge radius as tunable constants for the assist-decay curve.
