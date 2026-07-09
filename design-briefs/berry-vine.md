# Berry Vine — Revamp Brief

**Revives:** Zuma / Luxor (marble-shooter: a moving chain of colored balls crawls toward a hole; a center shooter bursts groups of 3+)

## The essence (protect this)

The dopamine is the chain reaction under time pressure: you're placing berries faster than you can fully think, and a single good shot into a gap cascades into a screen-clearing combo you feel you earned. Protect the read-plan-fire loop and the escalating "the chain is almost at the burrow" panic-to-relief arc.

## Signature upgrade

THE DEW SWAP + COMBO CHARGE loop. You always see your next TWO berries and can tap to swap the loaded berry with a reserve (Zuma's Revenge proved swap works — we go further). Every burst feeds a COMBO CHARGE meter; when it's full you fire a POLLEN BURST that paints any 3 adjacent berries to one color of your choice — a skill-earned answer to the RNG that never punishes color luck again. It converts the classic's worst friction (praying for the right color) into the game's deepest expression: hoard charge, read the chain, and detonate a planned 8+ cascade. Kids clear levels never touching it; masters chain Pollen Bursts into screen-wipes for the leaderboard.

## Dated friction to kill

- Pure color RNG at the shooter: the ball you NEED never comes, and on hard levels 5-6 colors turn skill into luck (the #1 community complaint, and the reason fan mods force 4 colors).
- Colorblind death: Zuma's green/purple/grey were famously unreadable; color-only identity is an accessibility fail and unshippable for a kid-friendly portal.
- One mistake = instant loss: the chain reaching the hole ends the run cold, no recovery beat, brutal for new/young players.
- No aim assist / thin input windows: a pixel-off shot wastes a ball and the chain punishes you; feels unfair on touchscreens vs a mouse.
- Opaque scoring: gap shots, back-to-back combos and coin grabs all score but the game never TELLS you, so mastery is invisible.
- Difficulty wall with no ramp: classic Zuma spikes hard around level 7 with no easing, no assists that fade — you either get it or bounce.
- Long fixed levels with no bite-size session: a run is all-or-nothing minutes with no natural daily/short-play entry point.

## Game-feel spec

- Berry burst: 120ms squash-and-pop with a juice-splat particle in the berry's color, a short pitch-rising 'pip', and the two neighbors leaning in before they collapse into the gap.
- Cascade escalation: each link in a chain reaction bumps pitch a semitone and spawns a bigger splat + a floating '+N' that grows with the combo; a 4+ chain triggers a soft radial screen-flex (scale 1.008) — NOT a jarring shake.
- Chain-approaching-burrow dread: when the lead berry enters the last ~15% of the vine, the burrow pulses red, vine desaturates at the edges, music adds a heartbeat layer, and a gentle haptic tick per berry consumed.
- Fire feel: a subtle recoil dip on the shooter flower + a 6px trailing motion-blur streak on the berry so fast shots read; loaded and reserve berries breathe softly so the swap is always visible.
- Generous input: aim has a magnet-snap to the nearest gap within ~10 degrees, and a berry that lands within a half-berry of a valid match still counts (forgiving collision window) — assists strongest on Easy, decaying to near-zero on Expert.
- Pollen Burst payoff: charge meter fills as a glowing vine-sap gauge; at full it shimmers gold, firing it slows time to ~35% for 0.8s (the 'slow-mo finish' the portal already loves) while you pick the paint color, then a bloom of petals on detonation.
- Clear celebration: full-vine clear blooms the whole vine into flowers in a left-to-right wave, Sunbeam coins arc to the counter, and a single warm chord resolves.
- Coziness guardrails: no failure buzzer — a missed run gets a soft 'the vine curled back' and the seedpod gently closes; readable at 0.7rem+, 48px shooter touch target.

## Onboarding & difficulty

First 8 seconds: a 3-color, slow, short vine with a big arrow — 'drag to aim, release to plant a berry, match 3.' The first guaranteed gap teaches the gap shot; the second beat auto-charges the meter and hands you a free Pollen Burst with a highlighted target so you feel the signature move once, immediately. No text walls, no age gate. Hard-to-master ceiling comes from: (1) color count climbs 3->4->5 across worlds, (2) vine speed and branching paths (Luxor's split tracks) increase, (3) aim-magnet and forgiving-collision assists visibly decay by difficulty tier, and (4) scoring rewards you only truly optimize with Dew Swap planning + Pollen Burst timing. Assists are a training-wheel that fades, never a crutch you're stuck with.

## Modes

- Vine Journey (main): worlds of hand-tuned levels across the 4 seasons, each world a botanical biome; par-clear + optional 'full bloom' bonus objective for a 3-flower rating.
- Daily Sprout: one deterministic seeded vine everyone gets that day, one attempt for the streak/leaderboard — the core retention beat.
- Zen Trellis: endless, no burrow-fail, slow vine, just cozy matching and cascades for wind-down play (kid + casual safe).
- Bloom Rush (Endless/Challenge): survival with an accelerating vine and rising color count — how far can you push the chain; feeds the mastery leaderboard and biggest Sunbeam payouts.

## Botanical identity

The stone-frog shooter becomes a central seedpod flower that spits glowing berries; the chain is a living vine of dewy berries crawling a curling bramble path toward a burrow (a mossy rabbit-hole in the earth) instead of a skull. Berries are readable by BOTH color AND shape/pattern (round blueberry, heart strawberry, star elderberry, teardrop currant, etc.) so it's colorblind-native and cozy. Backgrounds reskin per season using the existing 4-season art system — spring blossom trellis, summer meadow, autumn hedgerow, winter frost-vine. Pollen Burst blooms petals; a cleared vine flowers over. One of the 85 companion creatures perches beside the seedpod per world (a Toad, a Koi, a Garden Spider) and does a small cheer animation on big combos — pure charm, reusing existing art. Midnight-garden palette: deep near-black bg, sage vine, gold Sunbeams, cream UI text.

## Retention hook

Daily Sprout drives the streak: play the one seeded vine each day, keep a Sunbeam streak multiplier alive (miss a day and it resets, streak-shields buyable). Runs pay Sunbeams (portal-standard: ~30/day/game, capped ~12/run) that flow into the Lucid Winds plant economy — 30 Sunbeams mints a plant, so Berry Vine is a legit farm for the collection meta. Collection layer of its own: each world completed unlocks a 'Berry Variety' entry in a compendium and a companion cheer-buddy; full-bloom 3-flower clears and Bloom Rush high scores unlock cosmetic seasonal vine skins. The 'one more try' of a lost run + the once-a-day streak + a growing berry compendium is the three-pronged pull.

## Why ours wins

Ours keeps Zuma's screen-clearing cascade high but kills the thing everyone hated — praying for the right color — by giving you a see-two/swap queue and a skill-earned Pollen Burst, wrapped in cozy, colorblind-readable botanical juice and a daily streak that actually feeds your plant collection.

## Build notes

Single-file vanilla ES5 canvas, no frameworks — fits the portal satellite pattern (self-contained in /satellites/, magenta-knockout art cut to alpha, path-versioned assets vs the Hostinger image resizer). Reuses three existing systems wholesale: the 4-season background/art set, the 85-companion art library (one perched buddy per world), and the SUNBEAM_EARN_POLICY (30/day/game, 12/run cap) + streak portal. Core engine is modest: a parametric vine path (bezier spline the berry chain rides by arc-length — Luxor split paths = branching splines), circle-collision insertion, flood-fill match-3 with recursive cascade resolution, and a projectile with the aim-magnet + forgiving-collision windows. Deterministic daily seed for Daily Sprout (mulberry32-style PRNG on the date). Biggest care items: dual color+shape berry encoding for accessibility from day one, tuning the assist-decay curve per difficulty, and keeping particles/AudioContext cheap for the portal's thermal budget (close contexts on exit, cap particle count). Estimate: a solid phased build — spine (path + chain + shooter + match/cascade) first, then Dew Swap + Pollen Burst, then modes, then art/companion/season reskin last.
