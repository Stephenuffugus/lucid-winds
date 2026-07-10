# Bramble Court — Triple Triad / Queen's Blood grid card battler (build spec, Jul 10)

Stephen: "a grid card battle in the triple triad/queens blood mold. this is coming highly recommended so ill neeed you to figure that out."
Status when written: fork building satellites/bramble-court/. If missing/partial next session, rebuild from THIS spec.

## Core (Triple Triad base + positional spice, SIMPLE AND DIRECT)
3x3 board. Cards have 4 edge pips N/E/S/W (1-9, pips + numerals). Place → each touching enemy card flips if your facing edge is higher. Most cards owned at end wins (5/4 split, seeded coin flip for first).

## Twist: Rich Soil
Boards carry 1-3 visible FERTILE squares (+1 all edges of the card placed there), sometimes 1 THORN (-1). Layouts vary per rival → positional play (the Queen's Blood flavor).

## House rules ladder (introduced one per rival, one-line explainers)
Open (see hand, trainer rule) · Same (equal on 2+ adjacent sides flips them) · Plus (two adjacent edge-sums equal → both flip). Base game = none.

## Roster
40 cards from LW companion/creature lore (mice, koi, herons, raccoons, toads, cicadas, garden spiders, Baby Mammoth; The Beholder = the one legendary). NO retired names (Phoenix/Capybara/Starfall). 5 rarity tiers, pip budgets ~10 (common) → ~26 (Beholder). Procedural canvas portraits (silhouette+palette) until art lands.

## AI
Game-tree search: exact last 4 plies, heuristic+depth-2 earlier; <300ms/move. Difficulty = depth + noise (Sprout → Court Regent near-perfect).

## Economy/Modes
Court Journey (10 rivals; first win vs each = claim 1 of 3 shown from their deck; losses cost nothing; dupe protection; 2-common booster each 3 wins, deterministic pity) · Daily Duel (seeded deck+board+first, streak) · Zen Table (practice vs beaten rivals, pays 0) · Draft Court (both draft 5 from seeded 15). Collection screen w/ rarity filters. bramblecourt_save.

## Colorblind/touch
Sides by frame SHAPE + corner emblem (leaf vs thorn), flips animate rotation. Cards ≥120px tall in hand, 48px targets, text 0.7rem+.

## Plumbing
ES5, single file satellites/bramble-court/index.html, 540x960. sunbeam-sdk v4, gameId "bramblecourt", DEFINE _sbCapEarn sw_sb_bramblecourt 30/day + 12/run (win 2, daily 3, zen 0). SWS embed/exit. PWA meta.

## Provability (?bctest=1 → BC_DEV) — ALL must pass
newDuel(seed/rules/board) / place / state / ruleCheck: scripted scenarios w/ EXACT expected flips for base, fertile, thorn, Same, Plus / aiVsAi(n): all legal, all complete / aiStrength: ≥85% vs random over 40 / determinism / claimTest / earnTest. 0 errors, node --check clean.

## Ship steps (parent)
Same pipeline as nova-bloom.md. ⛔ Art pack leads with non-botanical options; name debatable pre-art.
