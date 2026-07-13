# Roguelite Pinball — Design Brief (Director decision doc)
*Sky Wolf Studios · Jul 13 2026 · from a 5-agent market research pass (sources inline in the research; corrections applied: Rollers of the Realm Reunion has NEVER shipped, still Coming Soon Jul 2026; Ballionaire dev is newobject)*

## The decision on the table
Stephen floated two directions: **roguelite pinball** or **RPG pinball**. Research verdict is decisive: **build the roguelite, and transplant exactly one RPG-proven organ into it (the persistent collection hook)**. RPG pinball is a 35-year graveyard of critical darlings and commercial flops; roguelite ball-physics games are the hottest indie quadrant of 2024-26 and NOBODY in it has real flippers yet.

## Why roguelite (the evidence)
- The four biggest ball-physics hits of 2024-26 are all roguelite-shaped: **Ball x Pit** (300k copies in 5 days, 95%), **Nubby's Number Factory** (97%, 16k reviews at $5), **CloverPit** (1M copies in <2 months), **Ballionaire** (86%). Raw Fury already announced another (Appulse, 2026) — publishers are doubling down.
- **The open niche: run structure + REAL FLIPPERS.** Games with flippers (Xenotilt 96%, Pinball Spire 84%) have no run loop; games with run loops (Ballionaire, Nubby) have no skill verb — and Ballionaire's recent reviews decayed to 60% for exactly that ("RNG on top of RNG"). We now own a research-grade honest-flipper engine (Greenhouse Pinball v1.6). That engine + a roguelite shell = an empty, validated quadrant.
- **Solo-dev economics**: roguelite content recombines (one board x N triggers/modifiers = sub-linear cost). RPG pinball's best outcome ever was Yoku's Island Express: a BAFTA and the studio barely breaking even (7 people x 4 years, world consumed in 6 hours, studio wound down).
- **Portal fit**: 10-20 min runs, portrait one-thumb-per-flipper, quota rounds that end naturally (no infinite farming — clean fit with the 30/day Sunbeam standard), premium-feel with zero MTX inside the game.

## The five load-bearing pillars
1. **Feel before everything.** The v1.6 physics IS the acceptance test: honest flipper aiming (contact point + timing), real incline gravity, low restitution with velocity falloff, cradles, input polled per substep. Every hit in this genre is praised physics-first; every flop indicted physics-first.
2. **Skill verb stays inside the run.** Flippers are our anti-Ballionaire: the player AIMS the payout. RNG lives only in what the shop offers, never in whether a good shot counts.
3. **Quota-escalation runs**: ~9 rounds, 10-20 min total, one meaningful pick every 30-90 seconds. Rising quota per round; overshooting BANKS into a bonus vial (Nubby's trick — overshoot must feel good); a run-warping twist each act; retry in under 5 seconds.
4. **One synergy explosion per run, designed for the clip** — cascade triggers, spell multiballs, chain blooms. Plus an ascension ladder (Cruciball-style) so the endgame is not thin (Ballionaire's documented failure).
5. **Persistent collection meta — the 5.31M-copy organ from Pokemon Pinball** ("Catch 'Em Mode" is the only mechanic that ever made pinball hybrids mass-market). Runs permanently unlock collectibles. Lucid Winds already HAS this organ natively: the greenhouse. The pinball game is the lever; the collection is the reason to pull it; Sunbeams are the bridge.

## Core loop sketch (v0)
- **A run = one living table, 9 rounds.** Each round: meet the round's quota (nectar) before the ball count runs out. Between rounds: pick 1 of 3 TRIGGERS (placeable table objects — bumpers, gadgets, wards, one-shot relics) and place them yourself on marked sockets. Trigger positions matter because shots are aimable — placement is strategy, flipping is skill.
- Overshoot banks into the **Overflow Vial** (spends as a mulligan ball or a quota discount later).
- Act twists at rounds 3/6/9 warp the table (a second drain opens, gravity storm, multiball round, boss bumper that eats triggers).
- Run rewards: Sunbeams by depth reached (within the 30/day standard) + permanent collection unlocks for feats ("bank 3 vials in one run").
- Meta: trigger-pool unlocks, ascension levels, collection wall.

## Theme options (Stephen debates with artists; no forced botanical per Jul 10 note)
A) **The Curiosity Drawer** — a magical junk-drawer table; triggers are trinkets (tin soldier, magnet, music box). Non-botanical, cozy-weird, huge trigger-art space, sits naturally beside the portal's keepsake DNA.
B) **Storm Cellar** — a weather-machine table; triggers are jars of bottled weather; the act twists ARE storms. Loud, kinetic, very clip-able.
C) **Nectar Run** (greenhouse-native) — the table feeds the actual Lucid Winds greenhouse; strongest economy tie, weakest theme novelty.

## What RPG pinball would need (if ever revisited)
Forgiving drains by default with drain-protection as progression (Pinball Quest's stoppers, 1989 — monetized forgiveness), retry under 5 s, upgrades that change how the ball MOVES (mass/size/bounce/magnets — the one universally praised Rollers of the Realm idea), procedurally recombined boards, and a collection hook. At which point it has converged on pillars 1, 2 and 5 anyway. RPG is viable as FLAVOR on the roguelite skeleton, never as hand-authored world structure at solo scale.

## Scope + reuse
- Engine: fork of Greenhouse Pinball v1.6 (honest flippers, rails, sensor system, PIN_DEV + shotsweep rigs carry over).
- New systems: trigger sockets + placement UI, quota/round state machine, shop, vial, act twists, ascension, collection wall. Single file, ES5, satellite pattern.
- Estimated: one focused build campaign (v1 playable) + a balance pass with a quota-tuning bot (same empirical method as Dewball's balance.js).

**Decision needed from Stephen:** greenlight direction (roguelite as specced), pick or remix a theme (A/B/C), and name it.
