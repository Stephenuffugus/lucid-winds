# CONDUIT — HANDOFF

**Read this first, then BUILD-PLAN.md §2. Update this file at the end of
every session.**

## Where we are

**Milestone: M0 complete. Next action is M1, and M1 is not a coding task —
it is five playtests and an honest answer.**

`index.html` is a complete, playable Phase 0 prototype. Single file, no
build step, canvas 2D, touch-first. It runs from `file://`, GitHub Pages,
or anywhere.

## What is built

- Mass ledger with a per-frame invariant assert (red HUD banner on leak)
- Blob with mass as health/ammo/reach/size; speed curve; squeeze (<30) and
  force (>70) thresholds, both actually gating real geography
- 48×32 site: entry room, corridor, generator hall, trap room, east wing,
  sealed exfil chamber with a force door **and** a squeeze vent
- Two concealed routing spines (1.6× cost, never spotted) plus a vent
  that doubles as a conduit channel
- Conduit: drag-to-route in Flow, orthogonal only, no self-crossing,
  per-tile cost, live/dead power resolution, discovery, guards walk the
  wire toward the device, retracting reclaim at 6 tiles/s for 75% back
- Sources: socket (cap 30, infinite, trickle floor) and generator (cap
  100, noisy — raises hearing site-wide while live)
- Devices: sprinkler, floor plate, speaker, breaker. Wet + electrified =
  kill. The socket deliberately cannot power the plate.
- Two enemies (sentry target + corridor drone): BFS pathing, vision cones
  with LOS, spot progress drawn as a filling ring, 5-state site alert
  including lockdown, breaker restoration
- Harvest bodies (30s decay), overflow above capacity → residue
- Four medals at exfil, lose state on zero mass

## Added after the first playtest read (M0.1)

The prototype had a planning layer and no sneaking layer — see
`DESIGN-ADDENDUM-1-prowl.md`, which is now part of the spec. Built:

- **Smother** — hold over an unaware guard for 2s. Needs mass ≥ 40, costs
  8, immobile and visible while it runs, uninterruptible once it lands.
- **Tap** — a noise at your own position, 2 mass, pulls patrols to you.
- **Drink a light** — 3 mass, turns a lit pool permanently to shadow, for
  your body *and* for wiring exposure.
- **Bodies are evidence** — a guard who finds a corpse escalates straight
  to Alarm. Harvesting is disposal.
- **Contextual ACT button** — labels itself SMOTHER / DRINK LIGHT / TAP /
  RELEASE depending on what is actually in reach.
- **Device inspection** — tap any box in Flow for what it needs, what it
  does, and why it is off. Unpowered devices print ⚡needs on the map.
- **Speaker moved to (14,11)** — it was 18 tiles from the only enemy who
  could hear it, behind a force door. It could never fire. The three-device
  chain (wet → lure → electrify) is now actually reachable.
- **Source capacity is a shared budget** — the socket's 30 runs sprinkler
  (20) + speaker (10) exactly, or one of them and something else.

## Progression groundwork (M0.2) — see DESIGN-ADDENDUM-2-progression.md

The affordances for the metroid layer are in the level *now*, because that
is the part that cannot be retrofitted cheaply:

- The facility's own wiring is drawn dim and inert (`S.siteWires`) behind
  the generator, along the corridor, up the vent shaft, out to the breaker.
- `traits.splice` exists and is `false`. Flip it: those lines turn green,
  cost **0 mass** to route along, and powering a device over them trips the
  site panel for +1 alert.
- Measured: the designed generator→plate route costs **28.4 locked, 21.6
  spliced**. Same map, different puzzle.

The rule for every future unlock is in the addendum: it must re-price an
old level, carry its own cost, and its affordance must have been visible
from level one. Thresholds stay absolute while capacity grows — that is
what stops progression from flattening the game.

## What is deliberately NOT built

Body dragging, peek, cling, pool, battery carts (all specced in addendum 1
§2 — build in this order). Ferro rendering (flag `CFG.ferroRender`, M2),
audio, haptics, splitting
(M5 — but `player.blobs` is already a list), the other seven devices,
level loader, save/load, 3D. Do not add these before the gate.

## Tests

`node test/smoke.js` — 57 assertions, all passing. Covers the invariant
under 20k random ops, routing rules, the 1.6× multiplier, exact 75%
refund with the tax booked, overflow → residue, level connectivity, and a
**scripted solve of the intended solution** that runs the trap end to end.

Run it before every merge. Two real bugs surfaced here during M0.

## What the numbers actually do (measured, not guessed)

The intended solution — socket→sprinkler up the concealed spine, and
generator→plate through the vent channel — costs:

```
wire A 24.6 · wire B 28.4 · committed 53.0 · body left 47.0
net after harvest + reclaim: +1.0 mass · residue 13.0 · tax paid 12.0
```

That is the design working as intended: solving the level leaves you at
**47 — below force, above squeeze, mediocre at everything**, exactly while
the sentry is walking into your trap. A clean run is roughly mass-neutral
(+1) with 13 banked as residue. The 12 paid in tax is the cost of the
route you chose; a sloppier route pays more.

## Your first session in Codespaces

1. `node test/smoke.js` — confirm 33/33 before touching anything.
2. Open on a phone via GitHub Pages. Play five runs.
3. Write the results in `PLAYTESTS.md` using the template there.
4. Answer the ship gate in that file. **Then** pick the next milestone.

Do not start M2 on a "sort of". A no here is cheap; a no after the art
pass is not.

## Known rough edges (fix only if a playtest says they matter)

- Route drawing is drag-only; if it feels fiddly on a phone, the fix is
  in BUILD-PLAN.md §7 (tap source, tap device, auto-route, then edit).
- The drone in the corridor may make early routing feel harsh. Its patrol
  is `S.enemies[1].route` — shorten it before you touch spot rates.
- Guard-walks-the-wire currently latches (`cd.walked`) so a discovered
  wire is investigated once. If it should recur, that flag is the lever.
- Lockdown is reachable but the breaker route is untested by hand.
