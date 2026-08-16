# PLAN 5 — SIEGE OF ONE (build fifth, only after 1–4 are shipped and verified)

Spec: HANDOFF-11.md §7.1 — deliberately tight; this plan supplies the missing tables. Every number below marked TUNE is a starting point the sim sweep resolves; numbers not marked TUNE come from the handoff and are fixed (wave HP curve ×1.18^wave, scrap `40 + 12×wave`, 30 cells, 20 waves, build phase 20s, ~15% margin target for the optimal loadout).

**Target:** `satellites/siege/` · accent rust orange `#e8703a` · portal card `cat:"action"` · ic 🏰 (record final pick).

## Model decisions — RESOLVED

1. **Fixed-tick SIM: 100ms ticks.** Real-time feel lives in the driver; SIM is `step(state, playerIntent)` where intent ∈ {left, right, attack, none}. Headless sim runs the same function with a bot supplying intents. Combat phase = ticks until wave dead or an enemy reaches cell 0 (lose). Build phase is a separate state (place/sell traps, skippable).
2. **Player:** moves 1 cell per 2 ticks (TUNE), melee range 1 cell, damage 12 (TUNE), attack cooldown 8 ticks (TUNE). The player is subject to terrain: standing on a Pit slows the player the same as enemies; a Wall blocks the player too (§7.1). Enemies do not attack the player — the player cannot die, only the gate at cell 0 can fall. Contact with an enemy just means you occupy adjacent cells (enemies never pass through the player? NO — enemies WALK PAST the player; blocking is what Walls are for, the player's body is not a wall. Record this: the player is a damage dealer, not a barricade).
3. **Traps (6, §7.1 list) — cost / stats table (all TUNE):**
   | Trap | Cost | Effect |
   |---|---|---|
   | Spike Strip | 30 | 4 dmg per tick to any ground enemy on the cell, 120-tick lifetime of ~40 total procs |
   | Pit | 45 | ×0.4 speed on cell + 10 dmg on entry, permanent, affects player |
   | Ballista | 90 | 9 dmg every 14 ticks to the nearest enemy in an unbroken line of sight rightward, permanent |
   | Brazier | 60 | applies 1 burn stack on cell entry: 2 dmg/tick for 30 ticks, stacks to 3 |
   | Wall | 50 | blocks movement, 3 hits then breaks, blocks the player too, blocks Ballista line of sight |
   | Snare | 40 | holds the first enemy that enters for 25 ticks, single use |
   One trap per cell. Traps sellable during build phase for 100% (no economy for mid-combat placement — combat is the player fighting, per the two-mode cohesion risk in §2).
4. **Enemies (8, §7.1 list) — stats (baseHP column is wave-1 HP before the ×1.18^wave curve; all TUNE):** Runner 18 HP spd 1c/2t · Brute 70 HP spd 1c/5t · Shielded 30 HP, ignores first 3 damage EVENTS · Flyer 24 HP, ignores ground traps (Spike/Pit/Brazier/Snare; Ballista and Wall still apply) · Sapper 26 HP, destroys the first trap it touches then behaves as Runner · Healer 30 HP, heals 3 HP/tick to enemies within 2 cells · Swarm = 5× (8 HP spd 1c/2t) spawned together · Warden (waves 10, 20) 420 HP spd 1c/6t, smashes Walls in 1 hit. Wave composition table: hand-author all 20 waves in DATA (escalating mix, Swarm from 4, Shielded from 5, Flyer from 6, Sapper from 7, Healer from 8), spawn cadence 10–20 ticks apart (TUNE). Total wave HP is checked against the §7.1 TUNE rule by the sweep.
5. **Win/endless:** survive wave 20 = win screen + endless toggle (waves continue on the same curve, score = waves + kills). Loss shows which cell the breach came through and what the wave was.
6. **Daily:** daily seed shuffles wave composition within authored difficulty bands; share string (no dashes): `SIEGE day 142: fell on wave 14`.

## The verification sweep (§7.1, made concrete — this is the game's moat)

`sim.js` enumerates loadouts as multisets of traps affordable at each wave's cumulative scrap, capped at ≤6 trap types × positions bucketed into 5 lane zones (front/mid-front/mid/mid-back/back) to keep the sweep combinatorial but honest (full 30-cell placement enumeration explodes; zone bucketing is the cap the handoff invites). Two player bots: IDLE (never moves or attacks) and ACTIVE (moves to nearest enemy, attacks on cooldown, retreats behind its rearmost Wall when 3+ enemies are within 2 cells).

Gates (move CONFIG until all pass, never the gates):
- NO loadout clears all 20 waves with the IDLE bot — the player must matter (§7.1).
- ≥4 distinct loadouts (different trap multisets, not placements) reach wave 15 with the ACTIVE bot.
- The best loadout+ACTIVE clears wave 20 with ~15% total-HP margin (§7.1's TUNE rule).
- Median loss wave for a random-loadout ACTIVE bot lands in 8–14 (the 8–12 minute session window at ~30–40s/wave — state the time model in the output).
- Watch each gate fail first (e.g., set Ballista damage ×10 and see the IDLE gate go red).

## Build phases (commit + push after each)

1. **CONFIG + DATA** (tables above + 20 authored waves).
2. **SIM:** lane state (30 cells, trap slots, enemy list with positions as fixed-point cell×10 for sub-cell speeds), `step`, build-phase ops, wave spawner, win/loss.
3. **TEST (before UI), ≥80:** per-trap unit tests against scripted single enemies (each trap × each relevant enemy interaction — Flyer over Spike, Sapper eats Snare, Shielded's 3-event shield vs Brazier stacks, Warden smashing a Wall, Healer keeping a Brute alive: these interaction cases are the two-mode-cohesion risk made testable); scrap economy exact; determinism; save round-trip (best wave, endless best; no mid-run resume); corrupt save; 5,000-tick fuzz with random intents and random legal builds.
4. **sim.js sweep** (above) — paste the table into the report.
5. **VIEW.** Side-view lane, chunky cells, the player readable at a glance, enemy HP as pips not bars where possible; build phase shows trap costs and remaining scrap huge; a 20-second radial timer with SKIP. Buttons ≥48px: ◀ ▶ move, ⚔ attack (also tap-on-enemy), all thumb-reachable in portrait.
6. **INPUT + SAVE + daily.**
7. **Polish:** impact thuds per trap type, wave-start horn, breach alarm. Screen shake off under `prefers-reduced-motion`.
8. **SW + manifest + icons; portal card + thumb + LOOKING pass + deploy + live grep** per README. Suggested ds: "You are the whole army: set the traps between waves, then get down in the lane and fight beside them."

## Known risks

- Two-mode cohesion (§2's stated core risk): if the sweep shows ACTIVE-bot contribution under ~20% of total damage on cleared waves, the player is decorative — buff player damage / trap costs until fighting matters. Print the player-damage share per wave in the sweep output.
- Zone-bucketed placement in the sweep vs free placement in play: a player could find placements the sweep never tested. Acceptable for v1; note it as the known gap in the report.
- Ballista line of sight blocked by Walls (including your own) is the classic self-own — make the build phase preview the sight line when placing.

## Signature craft

- **Key: G minor, martial.** Wave-start horn (two-note fifth, brass-ish saws through a bandpass), one distinct impact voice per trap (spike = dry click, pit = deep thud, ballista = whip crack, brazier = crackle noise loop while burning, wall = stone knock, snare = taut string pluck) so the player can HEAR their build working without looking. The Warden gets a 5-note low ostinato that starts at its spawn and stops at its death — the only music in combat, so it lands like a boss should.
- **Breach alarm as geography:** enemies crossing cell 8, then 5, then 3 each raise a semitone-higher alarm ping and warm the left edge glow. The player learns the lane's geography by ear; a run lost to a leak you never heard is a design failure, TEST-assert the events fire.
- **Wave scorecard (the standout — surface the sim's own metric to the player):** after every wave, one card: damage share YOU vs EACH TRAP, scrap earned, breach near-misses (deepest cell reached). The verification sweep already computes player-damage share; showing it per-wave turns loadout theorycrafting into the visible metagame and proves the player matters to the player themselves. Keep it one tap to dismiss.
- **Spawn pips during build phase:** the next wave's exact composition as silhouette pips on the right edge (3 runner pips, a brute pip, a flyer pip...). Planning against known information is the whole build-phase fantasy; hiding composition would waste the authored wave table. Silhouettes are the 8 enemy shapes — silhouette-first design, distinct at 20px, colorblind-proof by shape.
- **Build phase feel:** tap a trap then tap a cell (drag as bonus); Ballista placement live-draws its sight line rightward and shows it breaking on Walls; the radial 20s timer with SKIP; LAST BUILD one-tap re-apply of the previous wave's surviving loadout shape. Sell-back full price (already ruled).
- **Player feel in the lane:** attack = 2-frame hit-stop + arc smear + 10ms haptic; footsteps tick per cell; the player silhouette must read instantly against 8 enemy shapes (give the player the ONLY warm-accent fill on the field).
- **War log:** run history as terse dispatches ("Fell wave 14. The sapper ate the east ballista."), generated from run events, no dashes. Loss screens name the breaching enemy and the cell it entered from (already ruled) plus the war-log line.
- **Endless + daily share** with seed links: "Wave 23 on today's siege. Same waves, your build."
- Cut-last order: wave scorecard > spawn pips > per-trap impact voices > breach alarm geography > Warden ostinato > war log.
