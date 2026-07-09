# Seed Flutter — Revamp Brief

**Revives:** Flappy Bird

## The essence (protect this)

The tap-tap-tension of one-button flight through a gap you might not clear — a pure, self-blaming skill loop where death is instant and "one more try" is reflexive. Protect the flap, the gap, the near-miss squeeze, and the zero-friction restart.

## Signature upgrade

BLOOMSTREAK — you don't just survive gaps, you plant a garden through them. Every stem-gap has a bud in its center. Thread the *center* of the gap (a Perfect) and the bud instantly bursts into a flower on the passing stem; consecutive Perfects grow a rising bloom-combo that literally leaves a trail of flowers blossoming behind your seed. At run's end, your best streak mints a small bundle of those procedural flowers straight into your Greenhouse, scaled by combo. This is the definitive hook because it fuses the reskin, the skill mechanic, and the economy into one move: it converts binary pass/die into a GRADED target (edge = live, center = bloom), makes every near-miss thrilling instead of just lucky, and turns a throwaway distance score into a collection you keep and a Sunbeam payout you earn. A Flappy where mastery is measured in the garden you grow, not the wall you hit.

## Dated friction to kill

- Unfair hitbox: the original's collision box extends BEYOND the visible sprite, so you die on air. The single biggest 'this game cheated me' complaint. Ours: hitbox is ~65-70% of the visible fluff, always inside the art.
- Cold-start execution: you can die on gap #1, from frame one, with no runway. Punishing for a kid or first-timer. Ours: a brief eased-in runway + coyote-time.
- Zero input forgiveness: the flap impulse + gravity curve demand frame-perfect timing with no window. Feels like the game, not you, chose the death.
- Naked high score: the ONLY reward is a bigger number. Nothing to keep, collect, or show. Dead-ends for a portal with a collection meta and a streak economy.
- Repetition with no arc: identical pipes at identical spacing forever. No escalation, no biome change, no reason for run #40 to feel different from run #2.
- Punishing failure feedback: an abrupt, loud crash and instant score-wipe. Great for rage-quit virality in 2014, wrong tone for a cozy midnight-garden that wants you to breathe and go again.

## Game-feel spec

- Flap: seed pitches nose-up ~22-25deg on a soft floaty ease-out, then noses down as it falls; a puff of 3-4 downy fluff particles sheds on every tap so input is always visually confirmed.
- Center-thread SLOW-MO: threading a gap's center triggers a 110-140ms time-dilation squeeze (reuse Nectar Drop's slow-mo-finish system) — the world eases to ~35% speed, a bloom-chime plays one semitone higher per combo step, the flower pops open in the dilated window. This IS the juice payload.
- No screen-shake. Cozy = motion, not violence: near-miss = a soft vignette pulse + a drift of petals off the stem you brushed; a gentle 3-layer parallax meadow scroll instead of a jolt.
- Haptics: light tick on flap, a rounder medium 'bloom-pop' on a Perfect, a soft double-tap-fade on death (never a hard buzz).
- Audio bed: continuous low night-wind + firefly shimmer; flap = a wooden marimba pluck; combo = ascending glassy bloom chimes that build a little melody as your streak climbs; death = a soft 'settle' thud, no crash sting.
- Death animation: the seed doesn't smash — it spirals down and settles into the soil, and a tiny sprout pokes up where it landed. Gentle, dignified, and it seeds the instant 'go again' rather than punishing it.
- Input windows: ~80ms coyote-time after clipping so a hair-late flap still saves you; the gap's scoring band is generous (live) with a tight inner band (Perfect), so forgiveness and skill-ceiling live in the same gap.
- Restart: tap-to-retry in <300ms, seed re-forms from drifting fluff — the loop must never make you wait to try again.

## Onboarding & difficulty

First gap is oversized and gold-highlighted with a faint ghost-arc tracing the ideal flap path and a single word: TAP. The seed auto-hovers until the first tap, so nobody dies before they understand the verb. Difficulty assists DECAY over the opening ~6 gaps: gap size shrinks from huge to standard, scroll speed ramps from slow to full, and the ghost-arc fades out — by gap 7 you're in the real game without a single tutorial screen. Hard-to-master ceiling comes from three stacked pressures once assists are gone: (1) center-threading for Bloomstreak is far tighter than merely surviving, (2) wind gusts add lateral/vertical drift that varies per run, and (3) the 4-season cycle changes visibility (winter snow-haze, night-dark autumn) so reading gaps stays a live skill. Easy to clear a gap, a lifetime to Perfect a whole season.

## Modes

- Endless Drift (main) — classic infinite distance run with Bloomstreak, escalating wind and the season cycle. This is where high scores and the biggest bloom bundles live.
- Daily Gust — one deterministic seed everyone gets that day (same wind pattern, same season order): fair, comparable, and it pays a guaranteed daily Sunbeam + one unique daily flower that scales with your login streak. The engine of retention.
- Zen Meadow — no-fail practice with permanently generous gaps and slow wind, no death (you bob back up). For kids and warm-ups; earns no Sunbeams but grows your center-thread muscle. Assists here never decay.
- Season Gauntlet (challenge) — a fixed 4-leg run, one leg per season with rising gust intensity and a long 'boss reed' finale each leg; clearing all four with any Bloomstreak mints a guaranteed rarer seasonal flower.

## Botanical identity

You are a single dandelion seed — a downy achene with a glowing gold pappus tuft — drifting on the night wind across a Lucid Winds midnight meadow: deep-black sky, sage-silhouette grass, gold fireflies as ambient sparkle, cream moonlight. Obstacles are paired botanical stems/reeds (not pipes) with a gap between, each crowned by the current season's flora — spring cherry sprays, summer gold seedheads, autumn copper bramble, winter frosted rushes. The background biome visibly cross-fades through all four seasons as you travel distance, reusing the existing 4-season palette (Spring #E8A0BF, Summer #D4A843, Autumn #D4842A, Winter #A0C4E8). A chosen Companion (from the 85) floats alongside the seed and grants one tiny passive flavored to its nature — a firefly lights winter's haze, a koi cushions one 'splash' recovery, a moth nudges you gently toward gap-center — reusing companion art wholesale. It reads as native because the score IS a garden and the fail IS a sprout.

## Retention hook

Daily Gust is the spine: log in, play the one shared seed, and bank a guaranteed Sunbeam plus a unique daily flower whose rarity climbs with your login streak (miss a day, streak resets, so the flower degrades — loss-aversion pull). Bloomstreak feeds it constantly: every run mints a small bundle of the flowers you grew into your Greenhouse, so the collection meta advances whether you set a record or not, and better play = better blooms = a visibly fuller garden. Sunbeam payout follows the portal standard (30/day/game, 12/run cap) so it feeds the economy without inflating it. The compounding pull: streak protects flower rarity, runs grow the garden, garden rarity shows off in the Greenhouse.

## Why ours wins

Every other Flappy clone hands you a bigger number and a wall; ours hands you a garden you grew, a streak you're scared to break, and a near-miss that blooms in slow motion instead of killing you on air.

## Build notes

Single-file HTML5 canvas, ES5, no frameworks — fits the portal satellite pattern. Heavy reuse: Nectar Drop's slow-mo-finish system drives the center-thread squeeze; the 4-season art/palette system skins the biome cross-fade and stem crowns; the 85-companion art set drops in as the floating buddy + passive; and the existing plant SVG renderer mints the Bloomstreak flowers into the Greenhouse (no new art pipeline). Genuinely new code is modest: the flap/gravity physics with coyote-time + forgiving inner/outer hitbox bands, the parallax meadow scroller, the deterministic daily-seed RNG (date-seeded, same as other dailies), and the combo/scoring band logic. Estimated a compact single-file build — most of the cost is tuning the two hitbox bands and the assist-decay curve on real devices (48px touch target = whole screen taps, so touch is trivial). Deterministic seeds keep Daily Gust fair and cheat-resistant. Watch the perf note: cap particle counts on the fluff/petal emitters for low-end and iOS thermals.
