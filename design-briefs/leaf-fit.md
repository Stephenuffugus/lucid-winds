# Leaf Fit — Revamp Brief

**Revives:** Woodoku / Block Blast — drag polyomino blocks onto an 8x8 grid, clear full rows, columns, and 3x3 boxes; no timer, endless until you run out of room.

## The essence (protect this)

The "one more piece" spatial-fit dopamine: a no-timer puzzle where every placement is a small satisfying click-into-place and every line-clear is a hit of relief, all under the quiet, ever-present tension of running out of room. Protect the three-piece tray (you must plan the next three drops) and the drag-fit-clear rhythm — that trio is the whole engine.

## Signature upgrade

The Nectar Bloom Bank — recovery earned through mastery, never bought. Every clear showers cleared leaves into drifting pollen that fills a Nectar meter on the side of the trellis. When you're truly stuck (no piece fits anywhere), instead of a hard game-over you spend banked Nectar on ONE of two earned garden helpers: a Ladybug that eats a single tile of your choice, or a Sprout wildcard — a 1x1 leaf you can slot into any gap. Nectar is scarce (a full board of clears buys roughly one save), so the tension survives: you lose to bad PLAY, never to a bad shuffle. This single idea kills the genre's rage-quit ad-wall, converts the loss moment into the most skillful decision in the game (do I burn my bloom now or hold it?), and is intrinsically botanical — the puzzle literally feeds a garden that feeds you back.

## Dated friction to kill

- Unskippable interstitial ads after nearly every clear/level — the #1 review complaint on Woodoku Blast; it shreds the flow state the puzzle depends on.
- The unfair-feeling sudden game-over: a bad three-piece shuffle can dead-end you through no fault of your own, and the only 'out' is watching an ad or paying — feels like a slot machine, not a puzzle.
- No undo and no forgiveness — one mis-drop with zero recovery, which reads as punishing rather than cozy.
- Thin feedback on the old wood-skin clones: blocks just blink out, no build-up, no reason to chase chains beyond an abstract number.
- No cloud sync / no persistence — progress and streaks live on one device (explicit Woodoku gap).
- No real endless high-score / leaderboard loop in some versions — nothing to master toward.
- Combo scoring that's opaque: players hit 20-chains without understanding how, so mastery feels like luck.

## Game-feel spec

- Pickup: leaf-sprig lifts to 1.08 scale with a soft drop-shadow and a tiny rotational wobble; light haptic tick; the tray gap it left dims.
- Predictive ghost: while dragging, translucent leaves show exactly which cells fill, AND any row/col/box that WILL clear on drop pre-glows green and pulses BEFORE you release — generous readability is the whole point.
- Magnetic, forgiving snap: valid fits pull in from ~0.6 of a cell away; the drop window is deliberately loose so kids and thumbs never fight the grid.
- Clear animation is a fall, not a blink: cleared leaves detach, curl, and dissolve into pollen motes that stream visibly across to the Nectar meter — you SEE mastery becoming resource.
- Combo audio: an ascending wind-chime/marimba arpeggio, pitch rising one step per consecutive-turn clear; a gold combo number pops and floats up.
- Camera: a subtle 2-3px parallax push-in on multi-line clears; NO screen-shake — cozy, not arcade-violent. Big triple-clears get a slow bloom-of-light vignette instead.
- Haptics ladder: light on snap, medium on any clear, celebratory triple-pulse when a box + row + column resolve at once.
- Perfect clear (board emptied): full-screen petal burst, bird trill, and a Sunbeam bonus — the game's peak moment.
- Danger read is gentle: when a tray piece can't fit anywhere, its edges breathe a soft amber (not a punitive red flash), warning you a turn early.
- Seasonal particle bed always drifting behind the trellis: fireflies (summer), petals (spring), falling leaves (autumn), frost sparkle (winter); ambient night-garden audio underneath.
- A companion creature perches idle on the trellis frame and reacts — leans in on near-misses, flutters up on big combos.

## Onboarding & difficulty

No tutorial wall. The first piece auto-ghosts a glowing path to a lit target cell — one line of copy, "drag the leaf toward the light." Three guided drags teach place, clear, and combo, then the hand comes off. Training wheels (the pre-clear green glow, snap magnetism, the one-turn 'no fit' amber warning, and Nectar auto-suggesting the best rescue tile) are ALL on by default and quietly decay: the pre-clear highlight fades in from generous to subtle over your first ~15 runs, and all assists are individually toggleable in a Comfort menu for grown-ups. The skill ceiling is deep and self-revealing: novices survive on row/col clears; the mastery layer is chasing simultaneous box+row+col resolutions, holding pieces to set up chains, and timing Nectar spends for maximum multiplier — none of which the game forces, all of which the leaderboard rewards.

## Modes

- Bloom Run (main): the standard endless board, but every run carries a bloom goal — hit the clear/combo threshold and the trellis flowers into a mintable plant. This is the economy spine.
- Zen Trellis: truly no-fail; Nectar auto-recovers so the board never fully locks. Pure cozy fidget mode for kids and wind-down, no leaderboard pressure.
- Daily Trellis: one seeded board per day, identical pieces for every player worldwide — pure skill leaderboard, streak-driven, shareable score.
- Gauntlet (mastery): tighter starting boards + a rotating seasonal modifier (e.g. Winter = slower Nectar fill, Autumn = a pre-filled leaf-litter row), assists OFF — the hard-to-master proving ground.

## Botanical identity

The 8x8 grid is a woven-willow trellis at midnight — dark lattice against the deep-black/sage/gold Lucid Winds palette, cream UI text. Polyomino pieces are sprigs: clusters of leaves and petals in the 4-season leaf palette rather than abstract wood blocks (piece SHAPES stay identical to Woodoku so muscle memory transfers; only the skin changes). A clearing line reads as the vine drinking light — leaves curl off and become pollen. The whole board reskins through the existing 4-season art system: willow tone, particle layer, and the species that blooms all shift Spring→Winter. The 85 companion creatures do double duty — the idle perched mascot on the frame AND the Nectar rescue helpers (Ladybug eats a tile, others themeable per season/companion family). Bloom flavor text pulls a line from the haiku engine. It reads as tending a night garden, not stacking blocks — native, not ported.

## Retention hook

Three interlocking pulls, all feeding the economy. (1) Collection: every completed Bloom Run flowers the trellis into a 1-of-1 procedural plant minted straight into the greenhouse via _generatePlantSVG — the block puzzle becomes a plant-acquisition faucet, the strongest pull in the whole game. (2) Streak: the Daily Trellis seed drives a login streak with a rising Sunbeam multiplier; miss a day and a one-time 'grace petal' cushions the reset so lapsed players aren't punished into churning. (3) Sunbeam economy: combos → Nectar → Sunbeams, paid on the standard policy (30/day/game, ~12/run cap) with the streak multiplier on top, plus a fat perfect-clear bonus — so the mastery layer (chains, box-clears) is exactly what pays out, aligning fun with retention with revenue.

## Why ours wins

You never lose to a bad shuffle or an ad wall — only to your own play — and every winning run hands you a one-of-one plant you keep forever; it's the block puzzle that grows a garden instead of interrupting you.

## Build notes

Single-file HTML5 canvas, ES5, one IIFE, window-exposed entry per portal convention. The puzzle core is small and cheap: an 8x8 board array, the standard Woodoku polyomino set, a clear-check on rows/cols/3x3 boxes, and a solvability probe for the 'no fit' warning. The real work — and where it should NOT skimp — is the juice/art layer: predictive ghost + pre-clear glow, the pollen-to-Nectar particle stream, combo audio ramp, and season transitions. Heavy reuse: the 4-season art system (trellis skins + particle beds), the 85 companion sprites (perched idle + Nectar helpers), _generatePlantSVG + getHaiku for the bloom-mint reward, FG_Audio for the layered SFX. Daily seed = deterministic date-hash for identical worldwide boards. Follow SUNBEAM_EARN_POLICY.md for payout/caps and the Sunbeam two-source drift note (server ledger is source of truth). Colorblind: give each piece-species a subtle symbol, not color-only. Effort: MEDIUM — logic is a weekend; the feel and art integration are the month, and that's the whole reason ours wins.
