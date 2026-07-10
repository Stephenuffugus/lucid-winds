# Season Sway — Revamp Brief

**Revives:** Reigns (Nerial / Devolver, 2016) — the swipe-a-card, balance-four-meters kingdom game

## The essence (protect this)

One card, two choices, swipe left or right. Every choice quietly moves hidden forces, and your only job is to keep them in balance — push any one too far and the run ends. The magic is the tension of a simple binary decision with a consequence you have to *feel out*, a deck that dribbles out story and surprise, and the "just one more card" pull of a run that could always go a little longer. Protect the one-thumb swipe, the four-way tightrope, the short punchy dilemma, and the instant restart.

## Signature upgrade

THE LIVING KEEPSAKE — in Reigns your reign is just a number of years and a graveyard of dead kings. Here the run **grows a real plant in real time**, and every card you answer shapes not only the four meters but the plant's *traits*, deterministically. Lean into Sun and it grows gold, sun-hungry blooms; feed it Rain and the leaves go lush and heavy; enrich the Soil and the stem thickens and the substrate darkens; court the Wildlife and companions and pollinators cluster around it. When the run ends — a garden gone dormant, or a full season-cycle survived — the plant you cultivated **mints into your Greenhouse as a one-of-one, with a procedural haiku that narrates the choices you made.** This is the definitive hook because it fuses the reskin, the mechanic, and the economy into a single act: balancing the meters IS shaping the plant, so there's no "score" separate from the story — the run's outcome is a keepsake you keep and a poem about how you tended it. A Reigns where you don't count the years you ruled, you keep the garden your rule became.

## Dated friction to kill

- Fully-hidden consequences: Reigns tells you *nothing* about what a choice will do until after you commit, so early runs feel like blind luck, not decision. Ours softens without removing the mystery — as you begin a swipe, the meters give a small *directional* preview (which meters this choice touches, up or down; never the magnitude). You choose a direction, not a coin flip; the *how much* stays the surprise.
- Ambush death: a meter you weren't watching empties and the run ends with no warning. Ours pulses and desaturates any gauge that drifts into a danger zone, with a soft warning chime, so an ending always feels earned, not stolen.
- Grim, wordy tone: Reigns is darkly comic about beheadings and plague, and it's very text-heavy — wrong for a cozy, general-audience midnight garden. Ours is warm: an "ending" is the garden going dormant or a season closing, not a death; card copy is short, kind, and readable at a glance (0.7rem+), pictographic wherever it can be.
- Same intro deck every run: Reigns opens on near-identical early cards. Ours seeds card order and, because the plant visibly grows differently every run, even similar openings *look* like a different story unfolding.
- A number for a trophy: surviving longer just means a bigger year count with nothing to keep. Ours mints a plant + haiku from every run, so the collection meta advances whether you lasted three seasons or thirty.

## Game-feel spec

- Card swipe: the card physically tilts to follow the thumb with a soft shadow lift; the two choices glow in on the left and right edges as you drag; past the commit threshold the card flutters off like paper and the next slides up. Under-threshold releases spring it back — no accidental commits.
- Directional preview: while you hold a partial swipe, the four gauges show a tiny up/down nudge on the meters that choice will touch (arrows/tilt, not a number). Lift or reverse to cancel. This turns every card from a gamble into a read.
- Embodied progress: the plant lives at the top-center of the screen and grows a beat with each resolved card — a new leaf, a bud, a color shift — so you *see* your run accumulating into something, not just a rising counter.
- No screen shake. Cozy is motion, not violence: a meter hitting a danger edge = that gauge pulses and dims + a low warning chime; a season turning = a gentle palette cross-fade and a drift of the new season's flora across the frame.
- Audio bed: a calm looping music bed (reuse the music funnel / Stephen's tracks); card commit = a soft paper slip; each meter has its own note when it moves (Sun a bright bell, Rain a watery pluck, Soil a low woody thud, Wildlife a small chirp) so you learn the board by ear; season change = a short seasonal motif.
- Haptics: light tick on card commit, a rounder medium tick when a season turns, a soft double-fade at run-end (never a hard buzz).
- Run-end: the plant either blooms fully open (survived a cycle / strong balance) or eases into a dignified dormancy (a meter maxed/emptied), the haiku types out line by line, and the remaining deck fans down into the soil. Then tap-to-replant in under 300ms.

## Onboarding & difficulty

The first two or three cards are unmissable and self-teaching: a friendly seed-sprite (or a starter companion) poses one obvious choice per meter, and you *watch* the gauge respond, so the swipe verb and the four forces land with zero tutorial screens. From there the ceiling stacks: (1) cards start touching *multiple* meters at once, so a choice that feeds Sun may starve Soil — trade-offs, not free wins; (2) a **season pressure** ramps — summer bleeds Rain, winter bleeds Sun, autumn drains Soil, spring floods Wildlife — so you must pre-balance for the season you're heading into, not the one you're in; (3) the real mastery layer is *steering the plant toward a rare trait while surviving* — anyone can keep four meters alive for a while, but cultivating a Legendary-grade keepsake means holding balance AND biasing the accumulation for many cards. Easy to tend a garden; a lifetime to grow exactly the flower you meant to.

## Modes

- The Keeper's Year (main) — the endless seasonal run: survive as many seasons as the deck throws at you while your plant grows, and mint it at run-end. Where high runs and the richest keepsakes live.
- Daily Almanac — one date-seeded deck everyone gets that day (same cards, same season order): fair, comparable, pays a guaranteed daily Sunbeam + a unique daily bloom whose rarity climbs with your login streak. The retention spine.
- Zen Tending — no-fail practice: meters can't end the run (they auto-nudge back from the edges), the plant grows slowly, nothing at stake. Earns no Sunbeams; for kids and warm-ups.
- Seed Vow (challenge) — you're dealt a *target*: "cultivate a winter frost-lily," "grow a gold sun-bloom with a koi companion." Steer the meters to shape that plant before a season limit. Meeting the vow mints a guaranteed rarer keepsake.

## Botanical identity

You are the unseen Keeper of a Lucid Winds midnight garden, and every card is a visitor asking you to decide: a rotating cast drawn straight from the 85 companions (a koi pleads for more rain, a scorpion wants the sun turned up, a mole wants richer soil, a heron speaks for the wildlife), plus weather-omens and the four season-spirits. Each card is a papercut/SVG character over the current season's palette. The four meters are living gauges rather than bars — a Sun that brightens and dims, a cloud that swells and thins, soil that darkens and pales, a pollinator swarm that thickens and scatters — labelled ☀️ Sun, 🌧️ Rain, 🌱 Soil, 🦋 Wildlife. The plant you're growing sits crowned above them. It reads as native because it reuses the entire stack wholesale: the 4-season palette, the 85-companion art as the card cast, the plant SVG renderer for the keepsake, and the haiku engine for the ending — the score literally IS a plant and a poem.

## Retention hook

Daily Almanac is the spine: log in, play the one shared deck, bank a guaranteed Sunbeam plus a unique daily bloom whose rarity rides your login streak (miss a day and the streak — and the flower's rarity — resets, so there's a gentle loss-aversion pull to come back). The Keeper's Year feeds the collection constantly: every run mints the plant you grew into your Greenhouse, so the meta advances whether you had a short run or an epic one, and better balance = rarer keepsakes = a visibly finer garden. Sunbeam payout follows the portal standard (30/day/game, 12/run cap) so it feeds the economy without inflating it. The compounding loop: the streak protects your daily bloom's rarity, every run grows the garden, and the garden shows off in the Greenhouse.

## Why ours wins

Every Reigns-like hands you a body count and a throne you'll lose; ours hands you a living plant you shaped one choice at a time and a haiku that tells the story of how you tended it. You don't count the seasons you survived — you keep the garden they became.

## Build notes

Single-file HTML5 (canvas + light DOM), ES5, no frameworks — fits the portal satellite pattern. **This is the cheapest high-ROI build in the whole sweep because almost everything already exists:** the plant SVG renderer + `hashToTraits` mint the keepsake (map the run's cumulative per-meter tally into trait bytes so choices deterministically shape the plant), the haiku engine (`getHaiku`) narrates the ending, the 4-season palette skins the board, the 85-companion art becomes the card cast, and the music funnel supplies the bed. Genuinely new code is modest: the swipe-card physics + commit threshold + directional-preview, the four-meter state machine with danger-zone warnings and end conditions, the choice→trait accumulation (a running per-meter tally hashed into a seed at run-end), and the date-seeded daily RNG (same pattern as the other dailies). **The real cost is content, not engineering:** a bank of short dilemma cards, each with a left/right pair of meter deltas + warm one-line copy (start ~40-60 cards, grow it over time like the haiku banks). Keep card copy short, kind, readable at 0.7rem+, and free of the original's grim register. Watch perf lightly (it's a calm game, low draw load). ⛔ **Sequencing caveat (from the mechanic sweep):** Season Sway is one of FOUR "your run mints a plant" concepts (with Cipher Bloom, First Sprout, Petal Alchemy) — don't ship them back-to-back or the mint hook dilutes. Season Sway is the cheapest of the four, so it's the natural first; space the others out. Honest note: this is a slight genre departure from the twitch-arcade wins the campaign has favored — it's a calm decision/narrative game — but it's the highest reuse-to-value ratio on the menu.
