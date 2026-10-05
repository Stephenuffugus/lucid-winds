# 15 — After Test 1: fixes, then a world that balances (Sep 20, 2026 · v2: Stephen's decisions and ChatGPT's review merged)

From Fable, in answer to `tiny-world-handoff-sep20.md`. Stephen approves this by placing it in
`/design`; it then sits beside 14 and continues it (14's Flow rules §1, interaction model §3, harm
matrix §6 and reaction semantics §5 still govern everything here). ChatGPT's review is merged (§9). No other reviews are pending.

Builder: where I name a file or function it comes from your handoff; where I am guessing a name I
say "(confirm)". Every behaviour change below **moves the recorded worlds**, so each lands with
your proof shape: *feature flag off ⇒ old hashes return; fixture passes; its mutation fails.* I do
not repeat that on every line. "Save" means a migration is needed.

## 0. Review verdict on T8–T14

The build is sound and the proof discipline is better than the design asked for. Answers to your
eight "independent eye" points:

1. **Dropped cues are right.** A child who looked away loses the sparkle, not the story: the record still reaches the Scrapbook and the new Today list (A3). Never queue sparkles.
2. **Would a child find the twelve?** Not reliably. Three are in set pieces; the rest need an *accident path*: a reason the two halves end up together without intent. Rule from now on: no row ships without one written next to it (§3 shows the form).
3. **Fire:** keep the spread, bound the damage. Add `rules.fire.maxTilesPerIgnition` (120), make path, dirt, sand, rock, water and wet ground firebreaks (confirm they already are), and let burnt ground become **ash** that regrows *lusher* than before (C1). A fire should leave a story and then a meadow, not a brown world.
4. **Inert gear:** fixed by rows, not code (C4). Sixteen comedy pieces → at most four stay pure comedy.
5. **Off-screen Firsts:** acceptable. When there is no canvas cut, use the Because triple as the picture. Do not build a second renderer.
6. **Village:** keep it in the test build exactly as thin as it is. Fix only the permission tint (A5). Watching one child use it is worth more than any extension.
7. **Naming ⇒ Pets safe:** keep. It matches what a child means by naming something. Show it: one shield pixel beside the name on the doll.
8. **Save chain:** add an adversarial check: for each fixture save, truncate at 20 random byte offsets and flip 20 random bytes (seeded); the loader must either load correctly or fall back to last-good, never throw, never load garbage. Migrations must be idempotent (migrating a v5 save again is a no-op).

## 1. Decisions (Stephen, Sep 20) — these are settled

| # | Decision |
|---|---|
| D-1 | **The words move right to left, like a news ticker,** so there is time to read them. Ticker is the default (A3). |
| D-2 | **Hold-to-pour** for placing lots of something, or whatever proves easiest for children in the hand trials (A2). |
| D-3 | **Raiding depends on the monster.** Some come by day, some by night, some always; **every monster attacks if people get too close** (B4 has the table). |
| D-4 | **Mostly humanoid monsters pick up weapons; a few other creatures grab specific things where it makes sense** (A4 has the table). Fable proposes, Stephen tweaks. |
| D-5 | **Nothing is removed from the tray for now.** ("Cut from the tray" meant: take an item out of the list at the bottom so there is less to scroll past.) The only change is a merge that loses nothing: the tree variants become one **Tree** and the three flowers become one **Flowers**, each picking its look from the ground it is placed on. Bless and Smite stay; Bless gets new jobs (C2). |

## 2. Group A — before a child plays the test build (small, felt immediately)

Order = what a child feels first.

**A1. Armed people only fight what is actually a danger, and they defend each other.**
- What: replace the `P_ARMED` filter `fHuntsMe` with the `fThreat` shape (hungry hunter, or `diet:none`, or "it already hit me"). Add one case: an armed person also fights anything whose current goal is attacking a person or a named pet within `rules.ai.armedScan`. That is the first "help" behaviour and it is what a child expects a knight to do.
- Where: `src/sim/ai/decide.js` (`P_ARMED`, `B_FIGHT`).
- Proof: your fixture (armed human + fed wolf ignore each other 30 s; hungry wolf ⇒ fight; mutation "wolf never hungry"). New: armed human 60 px from an unarmed human being chased ⇒ intervenes within 5 s; mutation "attacker's goal is never read".
- Cost: moves worlds. No save.

**A2. Hold-to-pour replaces the Spray chip as the way in.** (D-2)
- What: with a sprayable item in hand, a press that stays within 8 CSS px for 350 ms starts pouring; dragging then places along the path at the existing spacing. A press that moves sooner is a pan, as today. The chip stays but becomes an *indicator* that lights while pouring (and still works as a toggle for anyone who found it). The first pour on a device draws a one-second dotted trail ahead of the finger; no words.
- Where: `src/ui/input.js` / `act.js`.
- Proof: `dev/hand-trials.mjs` unchanged bar (50 pans, 0 placements) plus 50 hold-then-drag trials each placing ≥ 5. Mutation: hold threshold 0 ms must fail the pan trials.
- Cost: UI only.

**A3. The words: a ticker you can actually read, a Today list, and instant answers.** (D-1)
- What, default **Ticker**: sentences enter from the right edge of `#info` and travel left at **50 CSS px/s at 412 px width** (scale linearly with width; tune on Stephen's reading, never above 70). Each sentence is preceded by its cause pictures (the Because triple at 2×), so a non-reader gets the story from the pictures going by. 48 px gap between items. Queue max 6; overflow drops the **oldest unshown** news. **Touching the ticker holds it still** while touched. When the queue is empty the last sentence stops at the left and rests there (no endless motion over nothing).
- **Answers never crawl:** a reply to the player's own action ("No enemies to smite") appears at once, still, on a solid background over the ticker, holds 2 s, then the crawl resumes where it was.
- Tapping the line opens **Today**: the last 20 sentences, still text with their pictures, newest on top, scrollable, never pauses the world. This is the safety net for anyone the ticker is too fast for.
- Setting "News: Ticker / Lines". Lines = a still line that holds `1.5 s + 0.35 s per word`, queue 3. `prefers-reduced-motion` forces Lines. (Both outside reviewers and I expected still text to suit early readers better; Stephen wants the ticker and the live build is the judge. If his daughter ignores the ticker and opens Today instead, flip the default.)
- Where: `src/ui/status.js`, `src/ui/hud.js`, `#info` in `index.html`; Today reuses T8 story records.
- Proof: `dev/live-look.mjs` at 412 and 375 for both styles; measured crawl speed within 5% of the rule at both widths; queue never exceeds its cap across the 30-minute soak; an answer issued mid-crawl appears within one frame; touch-hold stops motion within one frame. Mutation: remove the cap ⇒ soak check fails.
- Cost: UI only.

**A4. Things on the ground get picked up by whoever needs them** (new behaviour *take*). (D-4)
- Scores: **92** "grab it!" when unarmed, a real threat is perceived (the A1 test: hungry hunter, monster, or it already hit me), and a loose *weapon it can use* is within 30 px **and nearer than the threat**. The person runs *to* the sword, arms, and A1 lets them stand their ground. A fed wolf minding its business makes nobody run for swords. **20** "ooh" when safe and fed, the matching slot is empty, a loose item is within 50 px, and the creature is curious (B2; until B2 lands, 1 in 3 by id). Never while hungry (eating outranks 20) or fleeing without a nearer weapon.
- No reservation: two may walk to the same item. First to arrive gets it; the other shows `mark(w,'huh')` and drops the goal, and does **not** instantly retarget another item. That little disappointment is the story.
- Must go through the same path as being handed something (`reactEquip` in `src/sim/commands.js`) so rows fire (a chicken that picks up the crown starts the parade).
- **Who grabs what** (new species field `grabs`, pure data; land it in two steps: **A4a** humans only, **A4b** everyone else below):

| Who | Grabs | Why / when |
|---|---|---|
| Humans | any weapon, any gear | threat (92) or curiosity (20) |
| Yeti, bigfoot, gorilla | clubs and hammers; any hat | threat or curiosity |
| Goblin, orc, bandit, pirate, dark knight, skeleton | weapons their hands suit: goblin daggers and clubs · orc axes, hammers, clubs · bandit daggers, swords, crossbow · pirate blades and musket · dark knight swords and lance · skeleton swords and spears | **Safe off only.** While one is heading for an item, the item **glints** so a Hand can snatch it first |
| Bone archer | bows and crossbows only | Safe off |
| Troll, ogre | clubs, hammers; an ogre will also take the teddy bear, which pacifies it (row exists) | Safe off for weapons; teddy any time |
| Witch, evil wizard | staffs and wands; the witch also takes hats | Safe off for weapons |
| Ninja | dagger, ninja stars, katana | Safe off, night |
| Demon | trident, flame sword | Safe off |
| Alien, robot | blaster-family (energy) weapons only | Safe off |
| Zombie, mummy, vampire, werewolf, ghost, golem | **no weapons.** A zombie keeps any *hat* it bumps into (harmless comedy) | — |
| Imp | steals hats off heads and runs; drops them when poked | any time; a prank, never harm |
| Crow | anything tagged `shiny`: carries it to the nearest tree or roof and perches on it; never wears it; drops it when poked | curiosity; makes a crown worth guarding |
| Dog | ball and bone only: brings it back to its owner, or to the nearest person | play (B3) |
| Octopus | anything lying in or beside water; holds up to two; uses weapons it holds | curiosity |
| Crab | daggers and other small blades (it pinches them) and walks about holding one aloft | curiosity |
| Slime | **absorbs** any weapon it rolls over: the weapon floats inside it and it hits with it; drops it when it splits or dies | always |
| Elephant | water bucket (sprays fires) | a fire within 80 px |

- Where: `src/sim/ai/decide.js`, `src/sim/update.js`, species data; uses `looseItems()`/`liftItem` from T7.
- Proof: sword + unarmed person + hungry wolf ⇒ armed within N s (mutation "wolf fed" ⇒ sword ignored); two people one sword ⇒ exactly one armed, one "huh"; hungry person passes the sword for berries; chicken picks up a loose crown ⇒ parade fires (mutation "pickup bypasses reactEquip"); goblin with Safe **on** never touches a weapon; crow carries a crown to a tree and drops it on poke; slime absorbs and later drops a sword.
- Cost: moves worlds. No save.

**A5. Polish.** Birth card draws the baby at baby size (6×6) so it reads "sheep + sheep → lamb". Village permission paint: keep the tint, add a 1 px dashed yellow border on the region's edge (readable on grass and snow; check at 375). Fire cap and firebreaks from §0.3. Shield pixel by names. Save fuzz check from §0.8.

**A6. Fourteen new rows that need no new code** (14 → 33 with the five adopted below). Each line: id · trigger · A + B → effects · *what a child says* · **accident path**. Builder: express in the live schema; every row gets `say`, `pic`, a fixture and a mutation as usual.

1. `storm_metal` · power · electric + creature wearing/holding `metal` within r 40 → deflect, stun b, fx bolt, sound · *"Lightning likes swords!"* · **any child who arms people and then plays with lightning.**
2. `music_sway` · while · held or placed `music` + `monster` in r 50 → calm, fx note · *"The lute makes monsters dance."* · **lute is on the Gear starter shelf; monsters wander into range.**
3. `bellwether` · equip · `bell` on `livestock` → same kind in r 70 follow · *"They follow the one with the bell."* · **bell sits next to crown on the shelf.**
4. `lava_rain` · power · `water` power + `hot` terrain in radius → terrain rock, fx steam · *"Rain turns lava into rock."* · **everyone rains on lava to save someone.**
5. `lava_freeze` · power · `ice` power + `hot` terrain → terrain rock, fx steam · *same sentence* · **same.**
6. `fire_melts_snow` · placed · `fire` thing on/next to `snow` or `ice` → snow→dirt r 1, ice→water r 1, fx drip · *"The campfire melted the snow."* · **children put campfires on snow to warm people.**
7. `snowman_melts` · placed · `fire` thing within 3 tiles of snowman → removeThing, terrain water r 0 (20 s), fx drip · *"Oh no, the snowman!"* · **same campfire.** (The golem is immune: it has a hat.)
8. `wind_cloth` · power · `wind` + creature wearing `cloth` (umbrella, cape, kite, scarf) in radius → launch with parachute · *"The wind took her umbrella, and her!"* · **umbrella is popular; tornado is irresistible.**
9. `halo_cure` · hit · `holy` + zombie → become human, fx heart · *"It turned the zombie back!"* · **Heal power carries `holy`; children try to heal everything.**
10. `sunrise_undead` · clock dawn · `undead` not inside a home → stun 3 s, fx smoke · *"Skeletons hate the morning."* · **happens on its own every day.**
11. `shell_hide` · hit · anything + `shell` → deflect, fx shell, cooldown 6 s · *"The turtle hid in its shell."* · **any predator near any turtle or crab.**
12. `robot_pond` · enter · `machine` + `liquid` terrain, scope connected → stun all swimmers and the robot, fx spark · *"Robots and ponds don't mix."* · **robots wander.**
13. `slime_bounce` · enter · `slime` + `bouncy` thing → launch, spawn slime · *"It bounced into two!"* · **bounce pad is a set-piece toy.**
14. Gear rows, one line each: chef hat (while, r 1 `food` → cook) · bunny ears (equip ⇒ rabbits follow) · party hat (equip ⇒ humans in r 40 follow 6 s, fx confetti) · lantern or torch held (while ⇒ `undead` in r 30 calm and turn away; needs no new verb if calm clears their goal (confirm)). Also generalise the cow-catapult row from `kind: cow` to tag `livestock`.

15–19, adopted from ChatGPT's review (all existing verbs): **Pet fetch** · placed · `toy` near a fed, safe `pet` → pet approaches, heart · *"The dog ran after the toy!"* · **teddy and ball are shelf items.** — **Shiny bird** · placed or dropped · `shiny` within r 60 of a `bird`, reachable and not hazardous → `perchNear`, sparkle · *"Birds like shiny things."* · **crowns get dropped constantly.** — **Fire makes glass** · power/hit · Fireball, Meteor, Lightning or lava contact on sand → Glass terrain r 1 (C1), sparkle; spreading grass fire never does · *"The sand turned into glass!"* · **beaches get bombed.** — **Fire melts ice** · hit/power · `fire` on ice → the tile's *source* terrain (temporary Freeze ice returns to water), steam · *"Fire melts the ice bridge."* · **the natural undo for Freeze.** — **Toy launcher** · enter/placed · `toy` on `bouncy` → launch, with per-pair cooldown and a landing offset so it cannot loop · *"The bounce pad flings teddy too!"*

**Compatibility twinkle** (adopted): while the Hand holds an item within 24 px of something it has a row with, both give one small sparkle, once per pair per minute; never for a reaction Safe or Gentle would cancel.

## 3. Group B — after the first child playtest: a world that balances

This is Stephen's direction ("take only when you need it… give and take… personalities"). One principle for all of it: **every taking act asks "do I need this?", and every idle moment asks "does someone near me need something?"**

**B1. Enough is enough: sated predators, shared kills, food-gated births.**
- Sated: after feeding, a hunter will not start a hunt until hunger > `rules.needs.hungry` **and** `satedSec` (60) has passed. Kill sharing: every same-kind creature within 40 px of a kill also receives `rules.needs.killFeed × 0.6` with a heart; a pack eats one sheep, not five. Births: herbivores need local graze ≥ 50% within 5 tiles; predators need two feeds since their last litter.
- Where: `decide.js` (hunt eligibility), `combat.js` (on kill), mate eligibility.
- Proof, a **balance gate**: M meadow, 12 sheep + 3 wolves, no input, 20 days, 16 seeds ⇒ both species alive in ≥ 12 seeds and sheep never above 60. Mutations: no sated state ⇒ sheep extinct in most seeds; no food-gated births ⇒ sheep hit the cap.
- Cost: moves worlds, moves the statistical gate (re-baseline with the flag proof). No save.

**B2. Personality: four dials, one byte.**
- Dials, each low / middle / high with odds 1/6, 4/6, 1/6 so most creatures are ordinary and a few are characters: **bold↔timid** (scales `brave()`), **generous↔greedy** (hunger needed before taking; willingness to share), **sociable↔solitary** (preferred distance to kin), **curious↔wary** (wander radius; the "ooh" in A4; approaching new things).
- **Species first, individual second** (adopted from ChatGPT): every species gets a baseline per dial in its JSON (rabbit: timid, sociable · bear: bold, solitary · wolf: bold, sociable, generous to its pack · human: all middle, widest spread). The individual shifts at most one step from its baseline, so a bold rabbit is a brave *rabbit*, not a bear. The doll shows only dials that differ from the species' normal.
- **Stage 1 (no save):** the individual step derives from `E.id`. **Stage 2 (save v6), after children have seen stage 1:** I recommend **one saved byte per creature** (2 bits per dial) over deriving from `E.id`: it costs a v6 migration (existing creatures derive from id once, so nothing visibly changes) and buys two things a child will notice: **babies take after their parents** (each dial from parent A, parent B, or fresh, by the world stream) and **birthplace leaves a mark** (born in a crowd of ≥ 6 kin ⇒ sociable +1; born alone ⇒ −1; born within firelight or a village ⇒ bold +1; born on snow ⇒ generous +1, the huddle).
- Environment bends the dials live, no fields: near a campfire or flag timid reads one step bolder; on cold ground everyone is one step more sociable; in a crowd above 8 kin the solitary wander off.
- Seeing it: the doll shows at most two non-middle dials as pictures (lion / mouse · open hand / closed fist · two heads / one head · eye with spark / eye half shut). Friends page remembers them. No words needed.
- Proof: two creatures identical but for bold/timid, same wolf at the same distance ⇒ one stands, one flees; inheritance fixture over 3 generations on 3 seeds; mutation "dial ignored".
- Cost: moves worlds; **save v6**.

**B3. Give and take** (new behaviours, all scored under eating 35+ and above idle 10, all blocked by any perceived threat, each visible in under a second, each writing a story record):
- **Feed the little one** (28): a fed parent (hunger < 30) beside its hungry baby (> 50) passes 20 hunger across; heart. Every species.
- **Share food** (26): a person carrying food beside a person hungrier by ≥ 25 hands it over. Generous: margin 10. Greedy: never.
- **Warn** (instant, not scored): the first of a group to perceive a threat makes an alarm mark and sound; kin within 60 px get that threat in perception immediately instead of on their own think tick. Flocks scatter as one.
- **Stay with the hurt** (24): kin within 40 px of a creature under 40% hp stand beside it instead of wandering; if it is a baby, adults stand between it and the last attacker's direction. Sociable only, until proven cheap.
- **Play / groom** (12): two fed, safe kin stand together 3 s with hearts; babies chase each other. The visible sign that the world is at peace.
- **Douse** (40): villagers with a well, barrel, bucket or water within 60 px of a fire carry water to it (uses `E.carry`). The village helping itself.
- Proofs: one fixture each with the obvious mutation (parent never checks baby; alarm not shared; etc.).
- Cost: moves worlds. No save.

**B4. Every monster has a schedule, a home, and a temper.** (D-3) New species fields, pure data: `raids` (`day` · `night` · `always` · `never`), `homeRadius` (territory around its spawn tile, kept on the entity: fold into save v6 or derive from first position), `provokeRadius` (default 40 px). Rules: a monster goes looking for people only during its `raids` hours; **at any hour it attacks a person who comes within `provokeRadius`, or who enters its territory, or anything that hits it**; otherwise it patrols inside `homeRadius` and postures at people it can see (a "grr" mark, no approach). Safe and Gentle still win over all of it.

| Schedule | Who | Why it makes sense |
|---|---|---|
| **night** | zombie, skeleton, bone archer, vampire, vampire bat, werewolf, ghost, wraith, mummy, giant spider, ninja | the dark is theirs; `sunrise_undead` sends the undead home stunned |
| **day** | bandit, pirate, goblin, orc, ogre, dark knight | they are people of a sort: they sleep at their camp at night, and a sleeping camp can be crept past |
| **always** | demon, lava slime, robot, alien, UFO, imp (pranks only) | not creatures of habit |
| **never raids; territorial only** | troll (its bridge), golem, scorpion (its rock), slime, witch and evil wizard (their spot; they curse trespassers) | dangerous if you wander in, harmless if you leave them be |
| exempt (titans) | dragon, ice dragon, kraken, sea serpent | they hunt by hunger like predators, across the whole map |

- Proof: goblin camp 150 px from a village, Safe off ⇒ raids by day, none at night; skeleton crypt ⇒ the reverse; a person walked to 30 px of a sleeping orc ⇒ it wakes and attacks; a troll never leaves its radius; mutation "is-night never true" breaks both schedule fixtures.
- Cost: moves worlds; data per monster; entity home tile.

## 4. Group C — content, under the combination rule

**The test, sharpened.** A new entry ships only if all six are true: (1) a child can say what it does in one sentence; (2) it reads at 8×8 in three colours and passes the similarity check; (3) it is not a re-skin of a role that exists; (4) it arrives with **at least two rows or one behaviour**, using tags rows already watch; (5) it has an **accident path**; (6) it removes or merges something if its tray tab is already over 40. Rows first, things second, creatures last.

**C1. Six terrains (10 → 16), each interactive.** All use `w.tmr` for change over time.

| Terrain | Looks like | Does | Tags | New reaction only it allows | Child says |
|---|---|---|---|---|---|
| **Mud** | brown, darker flecks, one shine pixel | speed 0.7; rain on dirt makes it for 60 s then it dries; walkers leave a 2-px footprint trail for 20 s (render only); pigs entering ⇒ calm + heart | wet, earth | footprints let a child *track* a wolf; `electric` + wet ⇒ stun r 1 | "He left muddy footprints!" |
| **Ash** | grey, pale flecks | what fire leaves; after 45 s becomes Meadow, not grass | dry, fertile | seeds and rain on ash sprout at once | "Flowers grew where the fire was." |
| **Meadow** | grass with 2 flower pixels (colour by tile hash) | grazable, regrows 1.5×; mating hearts 1.5× likelier here; flammable | plant, flammable, sweet | `magic` hit ⇒ flowers burst r 2; livestock prefer it (they drift here) | "The sheep like the flowers." |
| **Crops** | 3 growth stages: dots → stalks → gold | grows on a timer (rain ×2, Sunbeam ×2); ripe = food; trampled back to stage 0 by anything `big`; villagers and the hungry harvest | plant, food, flammable | scarecrow keeps birds off; fire at harvest spreads ×2; first *growing* terrain | "It's ready to pick!" |
| **Shallows** | pale blue with a sand pixel | land creatures wade at 0.5 and cannot drown; sea life larger than `tiny` will not enter; rain leaves it as **puddles** on rock and path for 40 s | liquid, water, shallow | a safe beach: children and ducks share it; pond shock still travels through it; robots still hate it | "You can paddle here." |
| **Tall grass** | grass, 3 px taller, sways (2 frames) | speed 0.9; creatures of size `small` or babies inside it cannot be perceived beyond 16 px; very flammable | plant, flammable, cover | **a refuge**: the first thing in the game that lets prey survive without the player, which is what balance needs | "The rabbit hid!" |

**A seventh terrain, Glass:** pale blue-grey with one hard white glint · made only by strong direct heat on sand (row above), never by spreading fire · slippery, speed 1.2 · tags glass, shiny · birds gather on it; lightning on glass scatters to a r 2 stun; a light source beside it glows one tile farther · *"The sand turned into glass!"* (10 → 17 terrains.)

**Crystal** arrives as a *thing*, not a terrain: Bless on rock grows one crystal (`stone`, `magic`, `shiny`, `light`). It glows at night, birds perch on it, the undead keep their distance (lantern row), and a storm strike on it flashes once. One per Bless; never a field of them.

Rain makes Mud on a **deterministic subset** of dirt tiles under the cloud (about 40%, by tile hash), so a big rain leaves patches, not a swamp.

Reach rules: only Shallows touches them. Land classes treat Shallows as passable-slow; sea classes treat it as blocked unless `tiny`. Proof: A* fixtures for both classes; drown hazard never fires on Shallows; mutation "Shallows treated as water".
Later candidates, not now: Glowmoss (light at night, undead turn away; needs a `repel` verb), Deep water, Desert (needs thirst), Jungle.

**C2. Powers: a Nature shelf, some of them wild.** The Powers tab gets four shelves (picture headers, no words needed): **Help** (Heal, Bless, Love, Clone, Feast) · **Nature** (Rain, Sunbeam, Seeds, Gust, Snowfall, Thunderstorm, Time) · **Trouble** (Lightning, Freeze, Fireball, Meteor, Tornado, Earthquake, Smite) · **Switches** (Safe, Pets safe, Gentle, Inspect). Nothing is cut (D-5). **Bless becomes the life power**, so it earns its slot: on a creature it protects as today; on rock it grows a Crystal; on ash or dirt it makes Meadow (r 2); on Crops it adds a stage. Wild powers roll on `w.rng` only.

| Power | Kind | What it does | How the child changes the odds |
|---|---|---|---|
| **Thunderstorm** | wild | a cloud shadow (r 60) drifts on a seeded heading for 40 s, raining; every 3–5 s it strikes one tile under it | weights: bare tile 1 · tree or tower 4 · creature with `metal` 6 · **Lightning rod thing 30** (and it is harmless there) · `foil` hat 0. Give someone a sword and they are in danger; plant a rod and the village is safe. |
| **Sunbeam** | deterministic | a warm circle for 10 s: melts snow and ice, dries mud, grows crops and meadow a stage, wakes sleepers, stuns `undead` at night, pleases cats (they walk to it and lie down) | — |
| **Seeds** | wild | scatters 8 seeds in r 40; each becomes something by the ground it lands on | grass ⇒ flowers or bush · dirt ⇒ tree · ash ⇒ meadow at once · farmland ⇒ crop · sand ⇒ cactus or palm · shallows ⇒ reeds · rock, path, snow ⇒ nothing. **The child chooses the ground.** |
| **Gust** | deterministic | swipe to set direction: pushes loose items and `small` creatures 20 px, leans fire spread downwind for 10 s, carries `cloth` wearers a short hop, blows seeds from flowers | the swipe *is* the control |
| **Snowfall** | wild | a drifting snow cloud 30 s: grass/dirt under it become snow for 90 s, water becomes ice at its edges | campfires and Sunbeam keep a patch clear |

Proof for wild powers: distribution fixtures on 3 seeds × 200 strikes (rod takes ≥ 80% when present; metal-wearer struck ≥ 3× as often as a bare neighbour); replay determinism; mutation "weights ignored".

**C3. Things that do something.** Convert scenery before adding any:

| Existing thing | New role (row or small rule) |
|---|---|
| Well, Barrel (the barrel fills when it rains) | water source for **Douse** (B3); full barrel splashes when bounced or hit: wets r 1 |
| Fountain | a peace spot: play/groom (B3) is 3× likelier within r 30; birds perch (`perchNear`) |
| Statue | birds perch; when a named creature with ≥ 3 story records dies within the village, the statue shows its sprite on top |
| Haystack | food for livestock; **any launched creature landing on it lands safely and bounces once** |
| Crate | refuge: a fleeing `small` creature or cat enters and cannot be targeted for 5 s; cats sit on it when idle |
| Sign | points: wandering herd animals within r 40 drift the way it faces (tap to rotate) |
| Scarecrow | birds and grazers will not enter Crops within r 30 |
| Boulder | blocks; catapult ammo; turtles and crabs shelter behind it |
| Cactus | first creature to bump it each 10 s: "ouch" mark, stun 0.5 s, no damage; camels and nothing else eat it |
| Trees (one tray entry; variant by ground: pine on snow, palm on sand) | birds perch; small climbers take refuge; struck by storms; shade later |
| Flowers (one tray entry; colour by tile hash) | mating hearts likelier within r 20; grazers eat them; Gust blows their seeds |
| Grave | unchanged (T11) |

New things, five only: **Lightning rod** (tall, metal; see Thunderstorm) · **Trough** (food thing that any peaceful animals share side by side; predators ignore creatures *while they are eating at it*: a truce spot) · **Music box** (placed `music`: creatures in r 50 gather and sway, monsters calm; winds down after 30 s, tap to rewind) · **Fishing dock** (on shallows or water edge; a person with nothing to do fishes; +food carried home; the first job that feeds people without hunting) · **Nest** (on a Tree; a bird pair adopts it, sleeps there, and is the only place birds breed).
New harmless hand items, three: **Ball** (`toy`, `bouncy`: dogs chase and return it, children kick it between them, a slime that eats it bounces higher) · **Watering can** (grows crops/meadow a stage; douses one burning tile) · **Net** (catch one `small` creature unharmed and carry it: relocation without the Hand).

**C4. Gear: comedy that works.** With A6 #14 and C-rows: bell, chef hat, bunny ears, party hat, lantern, umbrella/cape/kite/scarf (wind), turtle shell (shell), viking and iron helmets and all armor (metal ⇒ storms), wizard hat (wearer's hits carry `magic` ⇒ meadow bursts), fishing rod (wearer fishes at any water edge like a dock), water bucket (Douse from anywhere), top hat (poke the wearer: a rabbit hops out once a day; needs a `poke` trigger, small). Pirate hat: a parrot within r 60 flies to the wearer's shoulder (`perchNear`). Stay pure comedy, at most four: sunglasses, propeller beanie, flower crown, party hat's confetti.

**C5. The water's edge.** Shallows + dock + fishing rod + ducks and frogs preferring Shallows + **the dawn drink**: at dawn every land animal within 120 px of water walks to the edge, dips its head (2 frames), and leaves. No thirst meter, no penalty: it is a *tell* that makes a pond the centre of a world, and it is where a crocodile becomes interesting.

**C6. Night.** B4 night raids · lantern/torch rows · `sunrise_undead` · campfire gathering: at dusk, people with a campfire within 80 px sit around it for a while before going home (play/groom scoring); owls, bats, wolves get +25% sight at night and sleep by day (owls and bats only). Later: Moon power (full-moon night on demand).

## 5. Build order (tickets; one at a time; each ends with `npm test`, a look, and STATUS.md)

**Into the test build now (Group A):** A1 → A2 → A3 → A5 → A4a → A6 → A4b. About two to three build days. Then **a child plays** and Stephen writes three observations at the top of STATUS.md.

**Test 2, "a world that balances":** B1 → C1 (Tall grass, Ash, Meadow first; then Mud, Shallows, Crops) → B3 (feed the little one, warn, play first; then share, stay, douse) → B2 → C2 (Sunbeam, Thunderstorm + rod, Seeds; then Gust, Snowfall; shelves; cuts) → C3 conversions → C3 new things and hand items → C4 → C5 → B4 + C6. Re-run the balance gate after every B ticket and after Tall grass; it is the milestone's headline number.

**Definition of done for Test 2:** the balance gate passes; an untouched M world is still alive and varied at day 30 on 12 of 16 seeds; in a 20-minute child session at least five *different* rows fire without an adult pointing; no new text is required to play.

## 6. The rest of the game, in order, after Test 2

Each is a milestone with the same rules (flow, proof, accident paths); details come from the idea menu (08–13) only when its turn arrives.

1. **Families people can see:** moods as emotes driven by B2/B3 events, mourning at graves, babies that grow with a visible middle stage, eggs and imprinting ducklings.
2. **Curated hybrids:** twelve hand-checked pairs via Love (14 §2), each with its own row and sticker; procedural splice stays a lab toy.
3. **Wishes:** a picture bubble, a heart when granted, a story record; driven by personality (the curious wish to see things, the sociable wish for company).
4. **World generators + "Same world, different mischief".**
5. **Village, second pass:** repair, Douse, a guard with A1's defend rule, docks, a second village and the Trough-style truce between them; still only inside the paint.
6. **Roster drops:** five creatures at a time, each through the §4 test, each bringing two rows. Farm and pond first (they balance), dinosaurs and myth later (they break things).
7. **Arena**, then scenarios, then the Creature Maker. Modes last: they are separate games and the toy must be finished first.
8. Thirst, warmth, seasons: only as *tells* and gentle behaviour first (the dawn drink is the template), lethality never on by default.

## 7. Tray housekeeping (D-5)

Nothing is removed. Tree variants → one **Tree**; three flowers → one **Flowers** (−4 tray slots, no content lost: the variant is chosen by the ground it is placed on). The Gear tab opens on the 12 pieces that have rows. No new stickers until a child opens the Scrapbook unprompted. **No new creatures or weapons in Test 2:** 36 weapons against 2 harmless ones is already the wrong ratio; peaceful tools catch up first.

## 8. Builder's checklist for every ticket here (adopted from ChatGPT's review)

Safe and Gentle are constitutional: new behaviour calls the same harm checks, never its own exceptions · all randomness on `w.rng` · every scan, queue, follow and chain has a radius, a cap, a cooldown or a lifetime · no core event needs text · a consequence that takes 30 s gets an immediate first beat · no object without its verb, no trait without a behaviour and an icon, no terrain that is only a colour · inserting a row re-tests first-match order against every more specific row · removing the new rule must break its fixture · land behaviour changes separately enough that hash movement can be explained and bisected · prefer an existing tag to a new one (44 of 64 used).

## 9. Review merge record (Sep 20)

**ChatGPT (GPT-5.6 "Sol") — adopted:** species baseline + individual offset for personality, staged so the first version needs no save (B2) · the pickup scope guard, as a two-step landing (A4a/A4b) · rows Pet fetch, Shiny bird, Fire makes glass, Fire melts ice (with source-terrain restore), Toy launcher; Lantern refuge, Herd bell, Music calm and Rain→Mud were already here · Glass terrain and Crystal as a thing, each with at least two rows · Bless as the growth power instead of a new Grow power · deterministic patchy mud · compatibility twinkle · symbolic fallback picture for off-screen Firsts (§0.5) · the village order for §6.5: communal food at the flag → alarm (reusing Warn) → repair → dusk gathering → need-based defence, and no job tree, currency or panels · its cross-system rules (§8) · "no more weapons or creatures yet".
**Parked, pending a child's behaviour:** splitting Name (identity) from Favorite (protection). Today naming protects (T11). If a child names a wolf for fun and is then confused that nothing can hurt it, split them. · Scrapbook silhouette pairs for undiscovered rows: conflicts with Flow rule 5 (no homework); revisit only if discovery proves too slow. · Birdbath and Seed bag: the Fountain conversion and the Seeds power cover them without new tray slots.
**Not adopted:** still text as the default for the bottom words. ChatGPT and I both advised it; Stephen decided on the ticker (D-1). Lines, touch-to-hold and the Today list are the hedge. · Holding every feature until after one formal playtest: Stephen's daughter already plays daily, so Group A lands now in the order A1, A2, A3, A5, A4a, A6, A4b, and her observed habits still gate Group B.
**Grok:** no review is coming. The merge is closed; this file is final for Group A.
