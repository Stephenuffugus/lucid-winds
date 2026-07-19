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
- **Wall Climb (v5.6 FINAL DESIGN, Stephen 7/19 after test-play):** "literally the normal
  game's ending — same physics and everything. essentially the shortest level with the
  tallest finishing wall with a scaling score multiplier." A 26-unit journey runway into ONE
  MEGA WALL (10 bands x1..x15 at L1, growing to 20 bands up to x75). Blade = stick (your
  multiplier + ceremony), handle = thunk back down. Flappy-flip up the face. The earlier
  chimney/mist/kick design (v5.2-v5.5) is DEAD — removed entirely, do not resurrect.
  Next per Stephen: "an entire group of worlds and levels" on this foundation.

## Build roadmap (priority order; each batch bot-verified + deployed)
1. **[DONE — v4.4]** **Deadly walls** — blade-into-wall STICKS + FAILS; fail screen (Try Again / Replay / Menu), fail buzz, the knife buried in the wall + red sparks + "STUCK!". Handle bounce unchanged. Pads stay non-fatal (only the two side walls kill).
2. **[DONE — v4.5]** **Brown cuttable stacks** — columns of brown slabs down the pit; blade cut reveals a bright inner color + split halves + a rising SFX.slab chain; handle contact deflects off and costs combo.
3. **[DONE — v4.6]** **Longer + larger levels** — depth ~doubled (170 + level*26, up to ~1340), wider shaft (SW 9.2), content scales with depth.
4. **[DONE — v4.6]** **Endless mode** — deep pit, live DEPTH-in-metres HUD, ramping fall speed, blade-wall ends the run, best-depth saved + shown on the menu, "PIT CONQUERED" if you reach the bottom clean. Third title button.
5. **[DONE — v5.0]** **Economy + cosmetics** — currency "Slivers" (localStorage `s3d_slivers`) earned every run; KNIFE FORGE with 9 swappable blades (Classic free / Cleaver 150 / Rainbow Brush 300 / Katana 500 / Crystal 800 / Golden 1500 / Cosmic Edge trophy=50 clean dives / Starforge + Wolf Fang = Support-the-Studio premium). Known prices, no lootboxes, cosmetic-only, equip persists across modes. Premium tier SCAFFOLDED (marked "Support the Studio", not yet buyable — see below).
6. **[SHIPPED 2026-07-19, FINAL FORM v5.6]** **Wall Climb mode** — after two iterations
   Stephen test-played and set the final design: THE JOURNEY ENDING, STRETCHED TALL. Journey
   engine (mode 'run', same tap/flip physics), 26-unit runway with warmup fruit, ONE MEGA
   WALL: 10 bands (x1..x15, 46 tall) at level 1 growing to 20 bands (x75, 92 tall).
   Blade = stick (multiplier + stars by height fraction), handle = thunk back. Level ladder
   `PROG.climbLevel`, per-level bests ('c'+lvl), Wallbreaker Pick trophy at a x30+ stick,
   `?mode=climb` portal card. The v5.2-v5.5 chimney/mist/kick/flick builds are REMOVED.
   Verified: bot_climb 15 probes (build/flappy/stick-low/stick-high/bounce/top-clamp/finish/
   ledge/bonk/obstacles/crumble/forge + boot). NEXT: "an entire group of worlds and levels".
7. **[SHIPPED 2026-07-19]** **New obstacle wave** (Freefall lvl 3+ bags AND the climb):
   WASPS (oscillate across the shaft, contact stings you down), swinging PLANKS (blade cuts
   for 25x combo points, handle bonks), brown GATES (full-width slab rows with one hole),
   THORN brambles (any contact stings), BOOM GOURDS (dark spiky trap fruit — slicing it
   explodes, no points, combo gone; teaches target discrimination), sticky SAP (climb walls).

## Still owed on the economy (needs Stephen's payment side)
- **Real-money premium purchase:** wire Starforge / Wolf Fang buy → existing `LW_WebPay` (USD) / Pi (in Pi Browser) rail. On success set a `supporter` entitlement (localStorage now, server-mirrored later) that unlocks the premium blades. Needs the NOWPayments IPN / Pi product setup Stephen manages.
- **Cross-game unlock token:** buying a supporter blade drops a token other Sky Wolf games can read (e.g. a portal-level `sws_supporter` flag) to unlock a matching cosmetic elsewhere. Design the token shape with the portal/other games in mind.
- **Sliver daily soft-cap** (anti-farming) if it ever matters; currently uncapped (cosmetic-only, low risk).

## Wall Climb — design history (the chimney is DEAD)
The original spec here (narrow chimney, handle-kick ascent, rising void) was built two ways
(hold-steer v5.2, tap-to-flick v5.5) and BOTH felt wrong in Stephen's hands ("skippy and
jumps around"). His final ruling (7/19): "it should literally just be like the normal game's
ending. same physics and everything — essentially the shortest level with the tallest
finishing wall with a scaling score multiplier." That is what shipped in v5.6 (see roadmap
item 6). Do NOT rebuild the chimney. Journey also gained LEDGE ASSIST + forward head-bonks
(no more stuck pockets on fruit shelves) and a pulled-back camera (z 26) from the same
feedback session.

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
