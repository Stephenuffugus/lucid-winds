# TUMBLE: an ideas brief for an outside brain

**Build `{{STAMP}}`. Everything you need is in this one file. You have no repo and you do not need one.**

I am the director of a one person studio, Sky Wolf Studio. TUMBLE is a cozy 3D sock sorting game for phones. It is
built, it is fun, and it is about to go on Google Play. Before it does I want one more BIG build: far more socks, more
dryers, more of the room, an economy that actually pays out, and a look and feel that says premium the second it
opens. I want your best ideas for that build.

Several different AI models are answering this same brief and another model merges the answers and builds them. So
read Parts 1 to 3, skim the data in Part 5, then answer **Part 4 in the exact format it asks for**.

**HOW I NEED YOUR ANSWER: as ONE downloadable file.** A Markdown file named `TUMBLE-IDEAS-<your model name>.md`
(a `.docx` is fine if you cannot make a `.md`). I will download it and upload it to the builder, so a file matters more
than a pretty chat reply. If you truly cannot attach a file, put the WHOLE answer inside one code block so I can copy
it in one tap. The file must end with the `json` block described at the end of Part 4.

Be concrete and be brave. The weakest answer is a list of generic mobile game features ("add a battle pass", "add
daily rewards"). The best answer is an item I could paste into the game's data tonight, with a name that makes
somebody smile and a reason a grown adult who likes quiet games would want it.

---
# PART 1. THE GAME IN TWO MINUTES

**What it is.** The dryer opens and a real 3D heap of socks tumbles onto a folding table. With one thumb you dig
through it, find each sock's twin, roll the pair into a ball, and flick the ball into the laundry basket. Some socks
are inside out (flip them). Some look almost like another sock (decoys that differ by one thing: the stripe rhythm,
the cuff, a mirrored motif). Some have no mate at all: they go to the **Odd Bin**, and finding that mate in a Load days
later is a **Reunion**, the emotional hook of the whole game.

**Two moods, the same physics.** **Laundry Day**: no timer, no fail state, a dryer hum and a radio. **Rush**: a timer,
streaks up to x5, and four powers (Static Cling, Dryer Sheet, Sock Puppet, Spin Cycle), with Timed, Endless, Basket
Balance and a Daily. Loads come in four sizes (Small 10 pairs, Regular 20, Heavy 35, Mountain 50) and nine difficulty
tiers that rise as you play.

**Who plays.** Adults. The cozy game crowd: people who loved Unpacking, A Little to the Left, PowerWash Simulator,
Stardew. Mostly on a phone, one thumb, often with the sound on and something else half on in the room. They pay once,
they notice craft, they screenshot things they love, and they punish anything that smells like ad bait or a grind.
The tone is warm and deadpan. The socks have opinions. Nothing is ever mean.

**Home is a room.** The menu is a small laundry room seen from one fixed camera: the dryer, the folding table, a rug,
a window, a wall of frames and posters, a shelf, a lamp, plants, a mug, a clock, a garland, a radio, a door, a
clothesline of pegs, and a cat if you have earned one. Everything you unlock is something you can SEE in that room or
on that table.

**The three kinds of sock.**
1. **Procedural socks**: effectively infinite. Every sock is a permanent seed made of nine fields (Part 5.6). Decoys are
   made by changing one field.
2. **Hero socks**: hand made, funny, collectable, sold in packs of ten. Owning a pack seeds its socks into your Loads;
   you still have to find them. 43 exist today (Part 5.2).
3. **Odd and impossible socks**: they arrive only through Reunions, with twelve pages of story told by the socks.

**Where it stands.** Live on the studio's web arcade as a test build. The sock models are placeholders today; real
modelled socks are coming from Meshy. It runs on three.js and the Rapier physics engine, in a browser, wrapped as an
Android app for Google Play. It will be a PAID app (about one dollar, one price on every store). There are no ads and
there never will be.

---
# PART 2. WHAT MAKES AN IDEA GOOD HERE (the laws)

1. **Cosmetics and comforts only, never advantage.** Nothing you can own makes you better at the game than somebody
   who does not own it. A basket may be harder for a joke (the Tiny Doll Basket). It may never be the one you need.
2. **Everything you unlock is VISIBLE.** In the room, on the table, in the basket's arc, in the Drawer. If a player
   cannot point at it, it does not exist.
3. **A name does half the work.** "The Way Your Mom Did It" is a ball style. "Someone's TV in the Next Room" is a radio
   station. "A Sloth Doing Taxes" is a sock. Deadpan, specific, affectionate. No puns that need explaining.
4. **Original absurdity, never a near miss.** No real brands, teams, bands, characters, slogans or logos, and nothing
   one letter away from one. Parody a CATEGORY (the gas station sock rack, the free sock from an event you do not
   remember attending), never a company. I have already had to rename four socks for this.
5. **The flavor line is nine words or fewer**, in the sock's own dry voice. "Has never once been inside."
6. **It must read at thumbnail size.** A hero sock is seen about 96 pixels tall in the Drawer and smaller in a heap.
   One bold idea per sock: a big emblem, two or three flat colors, a strong silhouette.
7. **A reward is for CARE, not for time served.** No streak you lose, no energy, no lives, no timers that sell a skip,
   no loot boxes, no random paid anything. Misses are free: a missed ball is picked up and thrown again.
8. **Premium is restraint.** Warm light, soft shadows, real materials, quiet motion, one good sound instead of five.
   If an idea adds noise, particles or a pop up, it is probably not premium.
9. **One thumb, one hand, a phone held upright.** Nothing needs two hands, a long press menu, or reading small text.
10. **It must be buildable by one person.** Data is nearly free (Part 3 shows how an item is written). A new look for
    an existing kind of thing is cheap. A new KIND of thing costs real code. Say which yours is.

---
# PART 3. HOW THINGS ARE WRITTEN (so that you can hand me something I can paste)

**An unlockable item** is one record. The `look` is what the renderer reads, and its fields differ by category:

```json
{ "id": "basket-floatie", "cat": "basket", "name": "Pool Floatie",
  "desc": "A striped pool ring with a net slung underneath that still smells faintly of summer.",
  "cost": { "lint": 800 }, "start": false,
  "look": { "style": "floatie", "color": "#ff6f8a", "color2": "#fff4e0", "radius": 1, "rim": "standard" } }
```

| category | `look` fields today | what each means |
|---|---|---|
| `basket` | `style` `color` `color2` `radius` `rim` | `style` picks the 3D shape (today: wicker, plastic, wire, bag, doll, floatie, log, claw). `radius` 1 is normal, 0.62 is the joke doll basket, 1.15 the forgiving laundry bag. `rim`: standard, forgiving, tight |
| `dryer` | `model` `color` `loads` | `model` is the 3D machine. `loads` is HOW THE SOCKS ARRIVE: `regular` (they tumble out in a heap), `bigger` (bigger Loads), `oneAtATime` (they drop off a clothesline one by one), `portal` (story Loads) |
| `decor` | `slot` `variant` `color` `color2` | `slot` is WHERE in the room it goes (today: rug, window, frame, plant, lamp, calendar, shelf, mug, garland, clock, poster, cat). One item shows per slot. `variant` picks the model or picture |
| `radio` | `station` (and `url` for a real music file) | what plays during a Load |
| `ball` | `roll` | how a finished pair is rolled (tight, loose, tucked, mom) |
| `trail` | `trail` | what follows a ball through the air in Rush (sparkle, dust, hearts) |
| `pack` | `pack` | a pack of ten hero socks |
| `reunion` | `kind` `ref` | arrives by itself at a number of Reunions: a story page, a lamp, a portal thing, an impossible sock |

A NEW value of `style`, `model`, `variant`, `station`, `roll` or `trail` means a new small model, picture or sound: that
is art, and it is fine. A new `slot`, a new `loads` behaviour or a new category is CODE: say so, and make it worth it.

**Costs** are `{ "lint": n }`, `{ "quarters": n }` or `{ "reunions": n }`. `requires` can gate an item on a story page
(`"lore:7"`) or a clothesline peg (`"peg:rainy-day"`).

**A hero sock** is a name, a silhouette, a rarity, a flavor line and a painted design. The design is built from simple
flat shapes on the sock's surface, so describe yours in those terms and the builder will write the recipe:
- a **body color** and up to six named accent colors, as hex
- a **pattern family** under the emblem: solid, stripe, heelToe, argyle, polka, chevron, fairIsle, motifScatter, gradient, plaid
- a **cuff**: plain rib, contrast rib, twin stripe, triple stripe, scalloped, wide band, checker band, dotted band
- a **heel and toe contrast** from 0 (none) to 3 (loud)
- one or two **emblems**: say WHERE (leg, ankle, top of foot, toe) and WHAT, as a handful of simple shapes: circles and
  ellipses, rounded boxes, thick line segments, polygons, raindrops, and any of the 32 stock motif shapes (Part 5.6).
  The Grill Master is three raindrop flames over a dark half moon bowl, a steel bar, three stick legs and two little
  brown sausages. That is the level of detail to aim for.
- a **silhouette**, one of eight: ankle, crew, knee, dress, toe (a toe sock), slipper, baby, novelty
- a **rarity**: common, uncommon, rare, or `odd` (it only ever appears WITHOUT its mate, and the mate comes by Reunion)

---
# PART 4. WHAT I WANT BACK

Answer in these lanes. If you are short of room do A, D, F and H first. **Quality over count: ten ideas I would ship
beat fifty I would not.** Rank each lane best first. For every idea say what it COSTS to build: `data` (I can paste
it), `art` (a new small model, picture or sound), `code-small` (an afternoon) or `code-large` (days).

**Lane A. Six new hero sock packs, ten socks each (sixty socks).** These are the heart of the game and the thing
people will screenshot. I want packs that a LOT of people will instantly recognise themselves in: think about what
is genuinely popular with adults who like cozy games right now (pets, plants, food, cottage life, cryptids, the
office, the 90s, zodiac signs, tiny hobbies, the seasons, regional pride without naming a team), and then make it
strange and specific the way Part 5.2's socks are. For each pack: its name, its one line blurb, who it is for, and ten
socks. For each sock: name, silhouette, rarity (aim for five common, three uncommon, two rare in a pack; an `odd` one
is welcome), the flavor line, and the design in the terms of Part 3. Mark any sock that should be `seasonal` and when.
Then rank your six packs by how many players you think would want them, and say which ONE should ship free.

**Lane B. Up to six new procedural pattern families.** The generator has ten families and room for exactly six more
(Part 5.6). The 32 motif shapes, 8 cuffs, 8 silhouettes and 4 conditions are FULL and frozen, because every sock ever
found is a permanent seed and changing those would repaint socks people already own. For each new family: what it
looks like, how it is drawn from stripes, dots, lines and shapes, how two socks of it differ enough to be told apart,
and what a convincing DECOY of it looks like (the game is about telling twins from near twins).

**Lane C. Eight new dryers.** A dryer is bought with Quarters and it is the biggest thing in the room. The good ones
change HOW THE SOCKS ARRIVE without making the game easier or harder (the Backyard Clothesline drops them one at a
time). For each: name, the machine's look, how socks arrive, the sound it makes, the price in Quarters, and whether
the arrival is a new `loads` behaviour (code) or an old one with a new look (art).

**Lane D. The room.** Today: 6 rugs, 4 windows, 6 frames, 8 plants, 4 lamps, 1 calendar, 3 shelves, 10 mugs,
6 garlands, 4 clocks, 13 posters, 1 cat (all in Part 5.1). Give me: **twelve rugs** (I especially want rugs: they are
the biggest block of color in the room), eight windows (a window is a view, and a view can move: rain, snow, a train
going past), six lamps, and ten more of anything else. Then **up to six NEW SLOTS** worth the code: things visible from
one fixed camera that a player would love to change (wallpaper, the floor, curtains, the folding table itself, the
door, a second animal). For each new slot: why it is worth it, and its first six items.

**Lane E. Baskets, ball styles, shot trails, radio stations.** Eight baskets (a basket is the target you flick at all
day, so it must be a pleasure to land in), six ball styles, six trails, eight radio stations (a station is a MOOD, and
the best names describe a place: "Someone's TV in the Next Room").

**Lane F. THE ECONOMY. This is the part that is broken, so think hardest here.** Part 5.4 has the exact rules and
every price. My own experience as the player, verbatim: **"we dont seem to get quarters."** Lint is fine. Quarters
come ONLY from a Clean Load (every ball ends in the basket) and from a Spotless Laundry Day Load (zero missed shots AND
every inside out sock flipped): one each, two at most per Load, and in practice often none. Everything big costs
Quarters: five dryers (55 in all) and four hero packs (40 in all). I want:
1. Your diagnosis: why does that feel bad, in one paragraph.
2. **Eight new ways to earn Quarters** that reward care and attention, never grinding, never advantage. (A quarter
   falling out of a sock's pocket is the kind of thing I mean: it belongs in a laundry room.) For each: what the
   player does, what they see, how often it should pay for a relaxed player doing three Loads a day.
3. The target: how many Quarters a day should that relaxed player earn, how many days until their first dryer, their
   first pack, everything. Show the arithmetic.
4. A rebalanced price list if you think prices are the problem and not the income.
5. Four more things to SPEND Lint on once the room is full, so Lint never becomes worthless.
6. The **four empty Clothesline pegs** (Part 5.3): pegs are earned by doing, never bought. Each needs a name, what earns
   it (use the stats listed in 5.3, or name ONE new stat), and the small comfort it gives.

**Lane G. Paying, without feeling cheap.** The game is paid up front. Once it is on Google Play I COULD add purchases
(Play requires its own billing for anything digital, and takes 15 percent). I am tempted by: a button to buy Quarters,
hero packs sold one at a time, a "supporter" bundle. I am worried about a cozy audience that pays once and one stars
anything that looks like a mobile game shop. Tell me straight: what would you sell, at what price, how would it be
presented in a laundry room with no shop screen, what must ALWAYS stay earnable by playing, and which of my three
ideas would cost me more in reviews than it earns. Name two paid cozy games that handle this well and what they do.

**Lane H. Make it look and feel PREMIUM: twenty specific things.** Not "improve the graphics". Things like: the exact
moment a ball drops into wicker, what the light does at 8 pm, how a menu sheet arrives, what the first ten seconds
are, what the five store screenshots should be. For each: what the player sees or hears or feels in their hand, why
it reads as expensive, how I would know it is DONE, and its cost. Rank by (how much a player notices) over (cost).
The rendering is real time 3D on a phone, so favour light, material, motion, sound and haptics over polygon counts.

**Lane I. Tomorrow.** With no streaks to lose, no daily rewards and no notifications that nag: what makes somebody
open TUMBLE again tomorrow, and what is different in their room because they were away? (A Daily Load exists. The
Odd Bin exists. Seasons do not exist yet.)

**Lane J. Tell me what is wrong.** What in this brief is a mistake, a contradiction or a missed opportunity? Which of
my laws would you break, and for what?

**Do not propose** (already decided): ads of any kind; energy, lives, or timers that sell a skip; loot boxes or any
random paid reward; anything multiplayer or social that needs accounts; real brands, teams, bands, characters or
near misses of them; new motif shapes, cuffs, silhouettes or sock conditions (frozen, see Lane B); anything that makes
a paying player better at the game; anything in Part 5.

**End your file with one fenced `json` block**: a list with one object per idea across all lanes, so the answers can
be merged by machine. Use exactly these keys. `data` holds the pasteable record when there is one, written in the
shapes Part 3 shows; otherwise `null`.

```json
[
  { "lane": "D", "rank": 1, "kind": "decor", "id": "rug-checkerboard-linoleum",
    "title": "Checkerboard Linoleum Rug",
    "data": { "id": "decor-rug-checker", "cat": "decor", "name": "Checkerboard Rug",
              "desc": "A rug pretending to be a kitchen floor, and nearly getting away with it.",
              "cost": { "lint": 240 }, "look": { "slot": "rug", "variant": "checker", "color": "#f4efe2", "color2": "#2f2b28" } },
    "looks_like": "cream and near black squares, slightly worn at one corner",
    "why": "the loudest block of color in a warm room, and it photographs well",
    "cost_to_build": "art", "confidence": 0.8 },
  { "lane": "A", "rank": 1, "kind": "hero", "id": "hero_plantparent_001", "title": "The Overwatered One",
    "data": { "name": "The Overwatered One", "pack": "plant-parent", "silhouette": "crew", "rarity": "common",
              "flavor": "It was fine until you helped.", "source": "pack",
              "design": { "body": "#dfe8d2", "accents": { "leaf": "#4f8a4a", "pot": "#c46a3c", "drip": "#6fb6d8" },
                          "family": "solid", "cuff": "contrast rib", "heelToe": 1,
                          "emblems": [ { "where": "leg", "what": "a terracotta pot (rounded box) with three drooping leaves (leaf motif, tilted down) and two blue raindrops falling from the rim" } ] } },
    "looks_like": null, "why": "every plant owner has killed one this way", "cost_to_build": "art", "confidence": 0.85 }
]
```

`kind` is one of: `pack` `hero` `family` `dryer` `decor` `slot` `basket` `ball` `trail` `radio` `earn` `price` `sink`
`peg` `paid` `polish` `retention` `problem`.
