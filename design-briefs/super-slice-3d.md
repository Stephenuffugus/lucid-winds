# Super Slice 3D — game bible + build roadmap

**Status:** live satellite at `/satellites/slice-3d/`, two modes shipped (Journey runner + Freefall pit-dive with the blade/handle orientation mechanic). This brief catalogues Stephen's 7/20 vision to grow it into a flagship arcade game with its own economy, plus a sister mode (Wall Climb). Aligns with [slice-master.md](slice-master.md) (knife cosmetics earned by points, no lootboxes) and [sws-currency.md](sws-currency.md) (sunbeams stay the studio currency; per-game coins are allowed precedent — Hues, Nectar Drop).

## Director's intent (Stephen, 7/20)
- **Freefall becomes its own game** — its own identity, progression, depth. BUT keep it in the SAME satellite/codebase for now ("we may keep it together and we want to keep skins together"). Do NOT split into a standalone satellite until the whole thing is finished.
- **Walls now KILL:** touch the blade to a side wall and the knife STICKS in the wall and the run FAILS (replaces the softer combo-loss "chip"). This is the core risk that makes the dive tense.
- **Brown cuttable stacks** that reveal bright color when sliced (the Slice Master signature), with lots of satisfying sound effects.
- **Levels much longer and larger**, plus an **Endless mode**.
- **In-game economy:** currency + tons of unlocks — wild unique knives and swords and other skins. Some premium skins cost real money ("support the studio"). Supporting can grant **cross-game unlocks**.
- **New sister mode — Wall Climb:** you climb a wall by kicking your BACK (handle) off it and strategically bouncing, never letting the blade touch. Same blade/handle DNA, inverted geometry.
- Mandate: "catalogue it, make plans, and build this professionally, thoroughly, and completely."

## The unifying mechanic (the sellable hook)
Every mode is about **knife orientation on contact**: the BLADE cuts (fruit, stacks, ropes) and the HANDLE bounces (walls, pads). What is deadly vs rewarding flips per mode:
- **Journey:** blade sticks the score wall (good, ends level); handle bounces off it (retry).
- **Freefall:** blade into a side wall = STICK + FAIL; handle bounces clean; blade cuts fruit/stacks; blade down sticks the bullseye floor to win.
- **Wall Climb:** blade into the wall = FAIL; you kick your handle/back off the wall to ascend; blade cuts hazards/targets that drift past.

## Build roadmap (priority order; each batch bot-verified + deployed)
1. **Deadly walls** — blade-into-wall STICKS + FAILS; new fail screen (retry / menu), fail SFX, the knife visibly buried in the wall. Handle bounce unchanged. Pads/stacks stay non-fatal (only the two side walls kill) so the risk hierarchy is learnable. *(BUILDING FIRST.)*
2. **Brown cuttable stacks** — layered brown slabs spanning part of the pit; blade cut reveals a bright inner color per slab + a juicy chorus of slice SFX + split halves; handle contact bounces off (cannot pass). Slice-through builds combo. Multiple SFX variants by depth/material.
3. **Longer + larger levels** — deeper shafts, more content density, wider readable pit, gentler level-1 → steep late curve. Retune camera for the longer fall.
4. **Endless mode** — procedurally deepening pit, no floor; distance + combo score; speed ramps; a "cash out" or death-ends-run model; own best-distance record. Third menu entry under Freefall.
5. **Economy + cosmetics** — per-game currency ("Slivers"): earned from runs (score/clean-dives/distance), spent on a KNIFE FORGE of knives/swords/skins with KNOWN thresholds (no lootboxes). Skins are cosmetic-only (never change hitbox). Premium "Support the Studio" tier: a few showpiece blades behind the existing web-pay/Pi rail; a supporter flag unlocks them + grants a CROSS-GAME unlock token. Skin data lives in the shared satellite so it persists across modes.
6. **Wall Climb mode** — new build: vertical ascent, kick the handle off the wall to climb, blade-touch fails, targets/hazards drift past to cut/avoid. Shares skins + currency.

## Economy design (detail, for batch 5)
- **Currency = "Slivers"** (per-game, localStorage `s3d_slivers`, later server-mirrored). NOT sunbeams — sunbeams remain the studio-wide earn-and-carry hook (still awarded on top, capped 30/day via `_sbCapEarn`). Slivers are the spend sink this game lacked.
- **Earn:** end-of-run payout = f(score, clean-dive, distance in endless, stars). Small, satisfying, capped per day to respect anti-farming.
- **Spend:** the Knife Forge — tiers of blades (Common → Showpiece) at published Sliver prices; earned-only trophy blades (e.g. "100 clean dives"); no gameplay advantage, pure cosmetic.
- **Premium/support:** a clearly-marked "Support the Studio" shelf — 2-3 showpiece blades purchasable with real money via the existing rail (`LW_WebPay` / Pi in Pi Browser). Buying sets a supporter entitlement that (a) unlocks the blade and (b) drops a cross-game unlock token other Sky Wolf games can honor. Real-money wiring depends on Stephen's payment-side setup (NOWPayments IPN etc.) — build the UI + entitlement check; leave the live purchase behind the existing flag.
- **Skin system shape:** a `SKINS` catalog `{key,name,tier,price,build(group)}` where `build` decorates the knife THREE.Group; `applySkin(key)` swaps the blade/handle materials + geometry; owned/equipped in localStorage; equip persists across modes. Bot-verifiable by asserting the knife group child count/materials change.

## House rules (non-negotiable)
Single self-contained satellite, 540×960, ES-safe for mobile, vendored three.js (r130-era: BoxGeometry/CanvasTexture OK, no outputColorSpace), no em-dashes in player copy, correct grammar, readable fonts, 48px touch targets, directions before play, sunbeam caps intact, in-play home button, PWA + sw cache bump each ship. Every gameplay change proven by the headless bots in `scripts/slice3d/` before commit. Deploy = push `add-sproing-jumper:main`.

## Open for the Director
- Currency name ("Slivers"? "Shards"? "Sparks"?) — placeholder Slivers.
- Whether Freefall gets its own portal card + name now, or stays a mode until the build is complete (current plan: stays a mode).
- Premium price points + which blades are premium (Stephen sets all pricing).
- Wall Climb name + whether it is a third mode or its own eventual card.
