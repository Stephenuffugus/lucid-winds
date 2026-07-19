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
1. **[DONE — v4.4]** **Deadly walls** — blade-into-wall STICKS + FAILS; fail screen (Try Again / Replay / Menu), fail buzz, the knife buried in the wall + red sparks + "STUCK!". Handle bounce unchanged. Pads stay non-fatal (only the two side walls kill).
2. **[DONE — v4.5]** **Brown cuttable stacks** — columns of brown slabs down the pit; blade cut reveals a bright inner color + split halves + a rising SFX.slab chain; handle contact deflects off and costs combo.
3. **[DONE — v4.6]** **Longer + larger levels** — depth ~doubled (170 + level*26, up to ~1340), wider shaft (SW 9.2), content scales with depth.
4. **[DONE — v4.6]** **Endless mode** — deep pit, live DEPTH-in-metres HUD, ramping fall speed, blade-wall ends the run, best-depth saved + shown on the menu, "PIT CONQUERED" if you reach the bottom clean. Third title button.
5. **[DONE — v5.0]** **Economy + cosmetics** — currency "Slivers" (localStorage `s3d_slivers`) earned every run; KNIFE FORGE with 9 swappable blades (Classic free / Cleaver 150 / Rainbow Brush 300 / Katana 500 / Crystal 800 / Golden 1500 / Cosmic Edge trophy=50 clean dives / Starforge + Wolf Fang = Support-the-Studio premium). Known prices, no lootboxes, cosmetic-only, equip persists across modes. Premium tier SCAFFOLDED (marked "Support the Studio", not yet buyable — see below).
6. **[SHIPPED 2026-07-19]** **Wall Climb mode** — built per the spec below as an ENDLESS
   height-chase first (Stephen 7/19: "see how high you can get"): handle KICK off the walls
   (13.8 impulse), blade touch = stuck, THE MIST rises from below (1.15 accelerating to 4.6
   with height + time), sticky SAP wall patches dampen kicks to 6.0, 25m milestones pay score,
   slivers pay by height, `PROG.climbBest`, 4th title button + its own portal card
   (`?mode=climb` boots straight in), Wallbreaker Pick trophy blade at 100m. Bot-proven:
   `scripts/slice3d/bot_climb.js` (kick/blade-fail/sap/mist/pogo-climbability/sting/gourd/
   obstacles/forge + boot, all green). Goal-line level variant still open per the spec.
7. **[SHIPPED 2026-07-19]** **New obstacle wave** (Freefall lvl 3+ bags AND the climb):
   WASPS (oscillate across the shaft, contact stings you down), swinging PLANKS (blade cuts
   for 25x combo points, handle bonks), brown GATES (full-width slab rows with one hole),
   THORN brambles (any contact stings), BOOM GOURDS (dark spiky trap fruit — slicing it
   explodes, no points, combo gone; teaches target discrimination), sticky SAP (climb walls).

## Still owed on the economy (needs Stephen's payment side)
- **Real-money premium purchase:** wire Starforge / Wolf Fang buy → existing `LW_WebPay` (USD) / Pi (in Pi Browser) rail. On success set a `supporter` entitlement (localStorage now, server-mirrored later) that unlocks the premium blades. Needs the NOWPayments IPN / Pi product setup Stephen manages.
- **Cross-game unlock token:** buying a supporter blade drops a token other Sky Wolf games can read (e.g. a portal-level `sws_supporter` flag) to unlock a matching cosmetic elsewhere. Design the token shape with the portal/other games in mind.
- **Sliver daily soft-cap** (anti-farming) if it ever matters; currently uncapped (cosmetic-only, low risk).

## Wall Climb — full build spec (mode='climb', shares skins + currency)
Stephen: "climb the wall by literally kicking your back side off of it and keep strategically bouncing your back and avoid touching your blade." The Freefall duality, inverted: now the walls are your friend (kick off them with the HANDLE/back to gain height) and the blade is still the enemy.
- **Geometry:** a narrow chimney (SW ~6.5, closer than the pit) extending UPWARD (+y). Start at the bottom, climb to a goal line at the top; endless-climb variant later.
- **Physics:** reuse the Freefall physics head (gravity down, hold LEFT/RIGHT to steer + spin, release to settle). You fall unless you keep kicking.
- **Wall contact = the climb:** HANDLE into a wall → a strong KICK: `vy = KICK_UP` (big upward impulse) + `vx` toward the opposite wall, a satisfying kick/thump SFX, sparks. You zig-zag UP wall to wall. BLADE into a wall → FAIL (same stick-and-die as Freefall). So you must spin so the handle/back leads into each wall.
- **Pressure = a rising void** from below (`voidY += voidSpeed*dt`, speed grows with height/level). Fall into it → fail. This forces constant upward progress ("climb or die").
- **Content:** fruit + brown stacks mounted on wall brackets between the kick lanes — cut them BLADE-first (mid-flight, away from walls) for points/combo. Same cut/bonk rules.
- **Win/score:** reach the top goal (or in endless, height before the void takes you). Score = height climbed + slices*combo. Best height saved. Clean-climb (no wall-blade touches, which is implicit since they're fatal) → bonus.
- **Feel to nail (needs device test):** the KICK_UP magnitude vs gravity vs void speed is the whole game — tune so a skilled rhythm climbs steadily and a mistimed kick (or a blade-lead) is punished. Bot-prove completable with a kick-timing policy before ship; screenshot the chimney + a kick moment + the void.
- **Menu:** a fourth title button ("Wall Climb"), same visual language. Own progression (`PROG.climbLevel` / `PROG.climbBest`).

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
