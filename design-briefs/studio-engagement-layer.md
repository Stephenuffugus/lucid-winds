# STUDIO ENGAGEMENT LAYER — Achievements, Music Library, Rewards

**Status:** CONCEPT — Stephen review. Phasing proposal at the bottom.
**Source:** Stephen 2026-07-29: "what do you think of adding a studio wide
achievement board?... every game to have more than one song that you unlock
through playing... maybe built a giveaway system for rewards... trying to
come up with ways to make players want to come back and engage with our
entire studio."

## My honest read

The achievement board is the right spine, and we are unusually well set up
for it: the cross-game unlock bridge (sws_game_unlocks) and the vault
union-merge sync shipped THIS WEEK for music and generalize cleanly. The
studio's real moat is 160+ games under one identity — an achievement layer
is the thing that makes that breadth VISIBLE to a player standing in one
game. Music slots and reward drops then hang off the same rails instead of
being three separate systems.

## 1. Achievements (build first)

Three tiers, one storage pattern:

- **Per-game badges.** 3-5 per game, defined in one manifest file (id,
  name, icon, test). Games report events through the same bridge pattern
  music uses today; no per-game backend.
  Examples: Petal Match "Serpent Charmer" (make 5 serpentines), Super Slice
  "Top of the Wall", Bubblenaut "World 3 Collection complete".
- **Studio meta-badges.** The cross-game hooks: "played 10 different
  games", "a badge in every category", "unlocked 5 songs", "7-day arcade
  streak". These are the come-back-and-explore engine.
- **THE BOARD.** A trophy room page in the portal: meta wall up top,
  per-game shelves below, empty silhouettes visible (collectors need to see
  the gaps — same law as the plant compendium). Signed-in: rides the vault
  like musicUnlocks (union-merge, local never dropped). Anonymous: local,
  folded in on sign-in — a real sign-in carrot.
- **Petal Match already has achv-* art cut** (flame, collection, compass,
  tower, coins, geode) — the board's visual language can start from there,
  with a studio-standard badge frame around per-game icons.

## 2. Multi-song libraries (build second, waits on the music anyway)

Standard per game, three slots so it never sprawls:
- **Slot 1 — the teaser.** Unlocks on first OPEN of the game (the Jimothy
  moonwalk pattern, already the shelf's design).
- **Slot 2 — the milestone.** A game-appropriate accomplishment (beat world
  2, reach ground 50, first 3-star chapter). Defined next to achievements in
  the same manifest — an achievement WITH a song attached.
- **Slot 3 — the deep cut.** A real challenge, rare on purpose (easter-egg
  ruling stays: hidden until found, no teaser rows).
The ledger, shelf sorting, and cross-device sync all exist. When each new
track lands, wiring it is one manifest line. This also becomes the partner
hook already written into PARTNER_INTEGRATION.md.

## 3. Rewards and giveaways (build third, carefully)

- ⛔ **Legal line first:** prize + chance + consideration = a lottery.
  Play-to-enter random-prize drawings are the pattern to AVOID. Everything
  below stays on the safe side: earned by deed, or free-entry.
- **Earned cosmetic drops.** Badges pay cosmetics: portal card frames,
  profile borders, board themes, Hues borders, game skins (Cosmic Edge
  proved the shape this week). Deterministic — do X, get Y.
- **Seasonal events.** "Harvest Week: earn any badge in 5 different games,
  take the exclusive border." Time-boxed collection across the arcade is
  the strongest whole-studio loop we can run, and it reuses the board.
- **Community giveaways** (physical or big-ticket) stay MANUAL on socials
  with free entry, Stephen-run — never automated into gameplay.

## Phasing (each phase ships alone)

1. **Board v1:** manifest format + bridge + vault sync + portal trophy room,
   wired into 10 launch games incl. every 2026-07 release. No new art needed
   to start (badge frame + existing icons; silhouettes are CSS).
2. **Fleet sweep:** manifest for the rest of the arcade, batched.
3. **Song slots:** attach tracks as they land; slot-2 milestones come free
   from phase 1's achievement definitions.
4. **Event kit:** one reusable seasonal-collection event + its cosmetic
   payout path.

⛔ Stephen calls: greenlight + phase-1 game list, badge art direction (frame
now, painted per-game icons later?), and the first event's theme when we get
there. Song-slot milestones per game are his taste call, proposed in the
manifest for his edit.
