# TUMBLE: an ideas brief for an outside brain

**Build `20260921b`. Everything you need is in this one file. You have no repo and you do not need one.**

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

---
# PART 5. THE DATA (generated from the game files, so it is exact)

## 5.1 Everything a player can unlock today (120 items). Do not propose these again.

### Baskets (12)

| name | price | look | what the player reads |
|---|---|---|---|
| Wicker Basket | free (you start with it) | style wicker, color #f6ead6, color2 #b5834c, radius 1, rim standard | The sturdy wicker basket that came with the laundry room and has caught more socks than anyone has counted. |
| Plastic Hamper | 150 Lint | style plastic, color #7fb4d9, color2 #5a93bd, radius 1, rim standard | A lightweight hamper with slots in the sides, in a shade of blue that only exists for hampers. |
| Wire Basket | 300 Lint | style wire, color #d7d9d6, color2 #cfd2cf, radius 1, rim standard | A chrome wire basket from the closet of a very organized person. |
| Drawstring Laundry Bag | 400 Lint | style bag, color #c9b79c, color2 #8f7a5e, radius 1.15, rim forgiving | A soft laundry bag with a wide, forgiving mouth that swallows shots that were only nearly good. |
| Tiny Doll Basket | 600 Lint | style doll, color #f7e3d0, color2 #e98fa6, radius 0.62, rim tight | A wicker basket sized for a doll's laundry, which turns every shot into a small act of faith. |
| Pool Floatie | 800 Lint | style floatie, color #ff8fa3, color2 #fff4e0, radius 1, rim standard | A striped pool ring with a net slung underneath that still smells faintly of summer. |
| Hollow Log | 1200 Lint | style log, color #6e4e34, color2 #d8b387, radius 1, rim standard | A mossy hollow log that has clearly been home to at least one family of chipmunks. |
| Claw Machine Bin | 1500 Lint | style claw, color #f2c14e, color2 #c0c4c8, radius 1, rim standard | The prize chute from an arcade claw machine, finally catching something. |
| Spring Ribbon Basket | 250 Lint | style wicker, color #f7dfe6, color2 #9cc98a, radius 1, rim standard | A wicker basket tied with a ribbon, clearly meant for something more festive than socks. |
| Beach Tote | 350 Lint | style bag, color #8fd0d8, color2 #f4d06f, radius 1, rim standard | A canvas beach tote with a little sand in the bottom that will never fully leave. |
| Apple Bushel Basket | 450 Lint | style wicker, color #f0c08a, color2 #9a5a2e, radius 1, rim standard | A bushel basket that once held apples and still smells faintly of them. |
| Frosted Wire Basket | 500 Lint | style wire, color #dfeaf3, color2 #ffffff, radius 1, rim standard | A wire basket that looks as if it spent the night on the porch and enjoyed it. |

### Dryers (5)

| name | price | look | what the player reads |
|---|---|---|---|
| Standard Dryer | free (you start with it) | model standard, color #b0d6c4, loads regular | The mint green dryer that came with the place; it hums, it tumbles and it asks for nothing. |
| Avocado Slow Tumble | 8 Quarters | model avocado, color #a3ad5a, loads regular | An avocado green dryer from a better decade that tumbles slowly and means it. |
| Laundromat Industrial | 12 Quarters | model industrial, color #c9ccce, loads bigger | A steel laundromat dryer that takes bigger Loads and has seen a great many socks. |
| Backyard Clothesline | 15 Quarters | model clothesline, color #e7d2b4, loads oneAtATime | Socks come down off the line one at a time, the way laundry used to come in from the yard. |
| Portal Dryer | 20 Quarters, needs lore:7 | model portal, color #3a3f5c, loads portal | A dryer that hums in a key nobody has heard before. It goes on sale when the Odd Bin reaches page 7, and brings portal Loads from page 8. |

### The room (66)

| slot | items (price in Lint) |
|---|---|
| `rug` (6) | Oatmeal Rug (90) · Braided Oval Rug (120) · Rag Rug (150) · Moss Rug (180) · Sunny Stripe Rug (200) · Faded Rose Rug (220) |
| `window` (4) | Woods Window (60) · City Window (250) · Rainy Window (250) · Snowy Window (300) |
| `frame` (6) | Found Sock Frame (80) · Cork Board Frame (100) · Oak Hero Frame (150) · Brass Hero Frame (200) · Painted Hero Frame (250) · Gilt Hero Frame (350) |
| `plant` (8) | Little Succulent (60) · Tiny Cactus (60) · Basil Pot (80) · Spider Plant (100) · Snake Plant (120) · Trailing Pothos (140) · Floor Fern (180) · Monstera (300) |
| `lamp` (4) | Blob Lamp (200) · Sea Glass Blob Lamp (250) · Grape Soda Blob Lamp (250) · Swamp Blob Lamp (250) |
| `calendar` (1) | Streak Wall Calendar (150) |
| `shelf` (3) | Pine Display Shelf (250) · Walnut Display Shelf (300) · Mint Display Shelf (400) |
| `mug` (10) | Chipped Blue Mug (60) · Mint Green Mug (60) · Tomato Red Mug (60) · Speckled Clay Mug (70) · Mustard Diner Mug (80) · Night Owl Mug (80) · The Tuesday Mug (90) · Corn Festival Mug (100) · Lake Hoyt Regatta Mug (100) · Grandma's Rose Mug (120) |
| `garland` (6) | Paper Star Garland (100) · Pom Pom Garland (100) · Felt Ball Garland (120) · Autumn Leaf Garland (120) · Snowflake Garland (120) · Warm String Lights (160) |
| `clock` (4) | Mint Kitchen Clock (140) · Schoolhouse Clock (180) · Sunburst Clock (220) · Dryer Dial Clock (260) |
| `poster` (13) | Damp Towel Live (80) · Visit Lake Hoyt (80) · Camp Wappalusk (90) · Vote Bartleby (90) · Corn Festival 5K (90) · You Are Doing Fine (100) · The Great Sock Migration (110) · Grand Lint Expo (110) · Moth Appreciation Society (120) · Fold Night at the Grange (120) · Sock Puppet Hamlet (130) · The Dryer Has a Back (140) · Slow Tumble Records (150) |
| `cat` (1) | Laundry Cat (900) |

Three of them in full, for the voice:

- **Oatmeal Rug** (90 Lint; slot rug, variant oatmeal, color #d9c7ae, color2 #f6eddc): A plain oatmeal rug that goes with everything and complains about nothing.
- **Damp Towel Live** (80 Lint; slot poster, variant band, color #3d4a6b, color2 #f2c14e): A tour poster for Damp Towel, a band you have definitely heard of by now.
- **Laundry Cat** (900 Lint; slot cat, variant orange, color #e39a55, color2 #e8dccb): A cat that sleeps on warm laundry and has never once helped fold it.

### Radio stations (6)

| name | price | look | what the player reads |
|---|---|---|---|
| Lofi Beats | 200 Lint | station lofi | Soft, dusty beats that loop quietly while you fold. |
| Steady Rain | 200 Lint | station rain | Rain on the roof, and nowhere you need to be. |
| Vinyl Jazz | 200 Lint | station jazz | A brushed snare and a warm crackle from a record nobody remembers buying. |
| Someone's TV in the Next Room | 200 Lint | station tv | A game show murmurs through the wall, and it sounds like somebody is winning. |
| 90s Hold Music | 200 Lint | station hold | Your call is very important to us, and so is this saxophone solo. |
| RESONARC Station | 200 Lint | station resonarc | A station that composes itself as it plays, so no two Loads sound quite alike. |

### Ball styles (4)

| name | price | look | what the player reads |
|---|---|---|---|
| Tight Roll | free (you start with it) | roll tight | Toe to cuff and rolled snug, the way the instructions would say if socks came with instructions. |
| Loose Lump | 100 Lint | roll loose | Two socks, loosely acquainted, bundled with more hope than technique. |
| Tucked | 200 Lint | roll tucked | One cuff folded back over the whole bundle, as neat as an envelope. |
| The Way Your Mom Did It | 300 Lint | roll mom | Folded, rolled and tucked with a precision you have never quite managed to copy. |

### Shot trails (3)

| name | price | look | what the player reads |
|---|---|---|---|
| Lint Sparkle | 100 Lint | trail sparkle | Every shot leaves a glittering drift of lint, which is the only time lint has ever been glamorous. |
| Dust Puff | 200 Lint | trail dust | Every shot trails a soft puff of dust, as if the ball just came out from under the bed. |
| Tiny Hearts | 300 Lint | trail hearts | Every shot leaves a little trail of hearts, because the pair is simply happy to be together. |

### Hero sock packs (4)

| name | price | look | what the player reads |
|---|---|---|---|
| Uncle Energy | 10 Quarters | pack uncle-energy | Socks with firm opinions about the grill start turning up in your Loads, though you still have to find them. |
| Gas Station | 10 Quarters | pack gas-station | Loud little prints from the spinning rack by the register start turning up in your Loads. |
| Fake Merch | 10 Quarters | pack fake-merch | Free socks from events you may or may not have attended start turning up in your Loads. |
| Cursed | 10 Quarters | pack cursed | Socks that are a little bit wrong, and perfectly nice about it, start turning up in your Loads. |

### Things that arrive by Reunion, never bought (20)

| name | price | look | what the player reads |
|---|---|---|---|
| Page 1: Oh. Hi. | 1 Reunions | kind lore, ref 1 | An odd sock clears its throat and introduces the Odd Bin. |
| Page 2: Where We Went | 3 Reunions | kind lore, ref 2 | The Bin compares notes on where everyone went, and nobody agrees. |
| Page 3: The Back | 5 Reunions | kind lore, ref 3 | A toe sock counts to five and arrives at a theory about the dryer. |
| Odd Eye Lamp | 5 Reunions | kind oddEye, ref lamp | A small lamp with two mismatched shades, given to you by the Odd Bin as a thank you. |
| Page 4: It's Fine | 8 Reunions | kind lore, ref 4 | The tube sock who has waited the longest would like you to know that it is fine. |
| Somehow Still Clean | 10 Reunions | kind impossible, ref 1 | It has been through every Load for years and has never once needed a wash. |
| Page 5: A Different House | 12 Reunions | kind lore, ref 5 | A sock comes back smelling like somebody else's house. |
| Page 6: The Vote | 16 Reunions | kind lore, ref 6 | Half the Bin wants to go looking, and the other half wants to wait. |
| Page 7: Someone Went | 20 Reunions | kind lore, ref 7 | Someone climbs into the back of the dryer and nothing comes back, and after this page the Portal Dryer goes on sale. |
| Page 8: The Polite Ones | 25 Reunions | kind lore, ref 8 | The first portal Load brings socks that belong to no one, and they are extremely polite about it. |
| Glowing Lint | 25 Reunions, needs lore:8 | kind portal, ref portal-glow-lint | A pinch of lint from the back of the dryer that glows a soft blue and hums along with the dryer. |
| Page 9: They Can Stay | 30 Reunions | kind lore, ref 9 | The Bin holds a very short meeting and decides the strangers can stay. |
| The Sock With No Inside | 30 Reunions | kind impossible, ref 2 | You can turn it inside out all afternoon, and it will politely stay exactly the same. |
| Postcard From the Back | 30 Reunions, needs lore:8 | kind portal, ref portal-postcard | A postcard from the back of the dryer, addressed to nobody and signed by everyone. |
| Page 10: Two Lines | 40 Reunions | kind lore, ref 10 | The tube sock's mate arrives at last, and the page is only two lines long. |
| Tiny Welcome Mat | 40 Reunions, needs lore:8 | kind portal, ref portal-welcome-mat | A tiny mat the Odd Bin wove out of lint so the socks from the back of the dryer would feel at home. |
| Page 11: The Map | 50 Reunions | kind lore, ref 11 | A sock draws a map of the back of the dryer in lint, and it is wrong in eleven places and loved anyway. |
| Page 12: The Whole Thing | 75 Reunions | kind lore, ref 12 | Everyone in the Bin has something to say to you, and it is short. |
| Knitted From a Clear Night | 75 Reunions | kind impossible, ref 3 | Look long enough and its brightest stars make the shape of a sock, which it insists is a coincidence. |
| Something for the Wall | 75 Reunions | kind frame, ref 12 | A frame the whole Odd Bin made for you out of lint, patience and one borrowed shoelace. |

## 5.2 The hero socks that exist (43). Do not propose these again; match their voice.

### Uncle Energy (10 socks, 10 Quarters): "Socks that have opinions about the grill."

| sock | silhouette | rarity | flavor line |
|---|---|---|---|
| Two Stripe Tube | knee | common | Came in a bag of twelve and fits every foot in the family equally badly. |
| The Grill Master | crew | common | Has never once been inside. |
| World's Okayest | novelty | common | Did its best, and its best was fine. |
| Lawn Chair Plaid | toe | uncommon | Folds flat for storage and pinches you exactly once a summer. |
| Bait Shop Shades | slipper | uncommon | Camouflaged so well that it has been missing from the drawer since June. |
| Calf Sock Under Sandals | crew | common | Pulled all the way up, exactly as the sandals intended. |
| Dad's Golf Diamond | knee | uncommon | Would love to walk you through all eighteen holes, one stroke at a time. |
| Thanksgiving Tie Print | dress | rare | Bought to match the tie, which was bought to get a laugh at dinner. |
| The Church Sock | dress | uncommon | The good pair, saved for Sundays, weddings and meeting someone's parents. |
| Bowling Night | ankle | rare | Bowls a hundred and twelve on a good night and owns the shirt anyway. |

### Gas Station (10 socks, 10 Quarters): "Loud little prints from the spinning rack by the register."

| sock | silhouette | rarity | flavor line |
|---|---|---|---|
| Tacos With Faces | crew | common | Each one is having a slightly different day. |
| Dinosaur on a Lawnmower | novelty | uncommon | The lawn has never looked better, and nobody knows whose lawn it is. |
| Bass in Sunglasses | ankle | common | Got thrown back once and has worn these ever since. |
| Hot Dog Astronaut | baby | uncommon | The first hot dog in orbit, and it is still a little warm. |
| Cactus Wearing a Hat | crew | common | Keeps the hat on indoors, and nobody has had the heart to mention it. |
| Raccoon Eating Fries | crew | rare | Insists the fries were a gift. |
| Pickle Party | toe | common | Nobody remembers who invited the pickles, but the party got better. |
| UFO Abducting a Cow | knee | uncommon | The cow seems oddly calm about the whole thing. |
| The Flamingo | dress | common | Has been standing on one leg since the store opened. |
| A Sloth Doing Taxes | slipper | rare | Filed on time, which surprised everyone, including the sloth. |

### Fake Merch (10 socks, 10 Quarters): "Free socks from events you may or may not have attended."

| sock | silhouette | rarity | flavor line |
|---|---|---|---|
| Tour '94 for Damp Towel | crew | uncommon | The band played eleven towns that summer, and it rained in all of them, which they took personally. |
| Muncie Comets Tee Ball | knee | common | The Comets went undefeated, mostly because nobody kept score. |
| Lake Hoyt Regatta | dress | uncommon | Nobody at Lake Hoyt has ever finished the race, but the lunch afterward is excellent. |
| Family Reunion 2011 | novelty | common | Aunt Carol ordered ninety pairs for sixty people, so there are still some in her garage. |
| Vote Bartleby | baby | uncommon | The campaign handed these out to babies, who cannot vote, and the candidate would prefer not to discuss it. |
| Dave's Reasonable Tires | crew | common | Dave gave these away with every oil change and would like you to know the tires are also reasonable. |
| Camp Wappalusk Staff | knee | rare | Counselors were issued these socks, a whistle, a clipboard, and no further instructions. |
| The Corn Festival 5K | ankle | common | The course is flat and fast, except for the mile that goes through the corn maze. |
| A Cruise That Was Fine | slipper | uncommon | The buffet was fine, the weather was fine, and the slippers from the gift shop are also fine. |
| Local Band You Missed | toe | rare | They played one show in a laundromat, and everyone who was there still talks about it. |

### Cursed (10 socks, 10 Quarters): "Socks that are a little bit wrong and perfectly nice about it."

| sock | silhouette | rarity | flavor line |
|---|---|---|---|
| The Glove Sock | toe | rare | Insists its five toes are fingers and waves every time the dryer opens. |
| Shoe Pattern Sock | ankle | uncommon | From across the room it is a sneaker; up close it is a sock with ambitions. |
| The Damp One | crew | odd | Has been through the dryer eleven times and remains, somehow, a little damp. |
| Tube Sock With a Zipper | knee | rare | Nobody knows what the zipper is for, but it is always a little bit open. |
| Sock That's Mostly Hole | crew | uncommon | Is still technically a sock, held together by three loyal threads and a lot of sentiment. |
| Inside Out Permanently | novelty | uncommon | Flip it all you like; it has been inside out for years and considers this its good side. |
| The Too Long One | dress | common | If you pull it all the way up, it simply keeps going. |
| Someone Else's | baby | odd | Nobody in this house is this small, and yet it turns up every single wash. |
| Slightly Warm Still | slipper | rare | Came out of the dryer on Tuesday and is, for reasons nobody can explain, still warm. |
| The Third Sock | crew | odd (portal only) | Came through the back of the dryer, matches nothing, and apologizes for the intrusion. |

### Impossible Socks (3 socks, never sold): "Three socks that should not exist, kept for the people who kept looking."

| sock | silhouette | rarity | flavor line |
|---|---|---|---|
| Somehow Still Clean | crew | rare (reunion only) | It has been in every Load for years and has never once needed to be. |
| The Sock With No Inside | novelty | rare (reunion only) | You can turn it inside out all afternoon, and it will politely stay exactly the same. |
| Knitted From a Clear Night | knee | rare (reunion only) | Look long enough and its brightest stars make the shape of a sock, which it insists is a coincidence. |

## 5.3 The Clothesline: pegs are earned by DOING, never bought

| peg | how it is earned | what it gives |
|---|---|---|
| Warm hands | Match 10 pairs. | The sock in your hand shows up bigger, so every stitch is easy to see. **(an Eyes peg: each one raises the difficulty ceiling by one tier)** |
| Second look | Turn an inside out sock right side out. | Tilt a sock in your hand to peek at its heel and toe. **(an Eyes peg: each one raises the difficulty ceiling by one tier)** |
| Regular load | Finish 5 Loads. | Regular Loads can be picked at the dryer door. |
| Good toss | Make 10 basket shots. | A faint dotted arc shows where your flick will go. **(an Eyes peg: each one raises the difficulty ceiling by one tier)** |
| Bigger basket | Finish a Clean Load, with every ball in the basket. | Your basket gets a slightly wider rim. |
| Rainy day | Finish a Load after 8 pm. | Adds rain on the window, which you can switch on in settings. |
| Heavy load | Finish 20 Loads. | Heavy Loads can be picked at the dryer door. |
| Sorting by feel | Finish 25 Loads. | Shaking the pile lets the socks settle loosely by color. **(an Eyes peg: each one raises the difficulty ceiling by one tier)** |
| Odd eye | Reunite an odd sock with its mate. | Socks whose mates are waiting in the Odd Bin glow softly on the table. **(an Eyes peg: each one raises the difficulty ceiling by one tier)** |
| Mountain load | Finish 50 Loads. | Mountain Loads can be picked at the dryer door. |
| The hum | Finish 100 Loads. | The dryer hum in Laundry Day grows richer and slower. |
| Knows the drawer | Match 500 pairs. | When you pick up a sock, its real twin glows faintly, so decoys are easier to spot. **(an Eyes peg: each one raises the difficulty ceiling by one tier)** |
| Static | In Rush, reach a x5 streak: 12 pairs in a row without a slip. | Unlocks Static Cling, a Rush power that pulls the twin of the sock in your hand straight to you. |
| Dryer sheet | Finish 3 Rush Loads. | Unlocks Dryer Sheet, a Rush power that clears the lint fog off the table. |
| Sock Puppet | Match 60 pairs in Rush. | Unlocks Sock Puppet, a Rush power that pairs up the next three pairs and shoots them for you. |
| Spin Cycle | Finish 10 Rush Loads. | Unlocks Spin Cycle, a Rush power that lifts the pile and sets it back down sorted by color. |
| Empty peg | Nothing to earn here yet. | Something will hang here one day. |
| Empty peg | Nothing to earn here yet. | Something will hang here one day. |
| Empty peg | Nothing to earn here yet. | Something will hang here one day. |
| Empty peg | Nothing to earn here yet. | Something will hang here one day. |

The stats a peg can watch today: `pairs` `loads` `shotsMade` `flips` `cleanLoads` `nightLoads` `reunions` `bestStreak` `rushLoads` `rushPairs` `powersUsed`.

## 5.4 The economy, exactly as the code pays it

- **Lint** per Load = 2.2 per matched pair, plus 1 per ball that lands in the basket, plus a tidiness bonus in Laundry Day (Spotless +30 percent, Tidy +12 percent) or, in Rush, 1 Lint per 180 points. A Regular Load of 20 pairs pays about 40 to 80. The design target: a relaxed player doing three Regular Loads a day earns about 200 Lint.
- **Quarters** per Load = **1 for a Clean Load** (when the Load ends, every ball is in the basket and none is left on the floor; a missed ball can be picked up and thrown again) **plus 1 for a Spotless Load** (Laundry Day only: ZERO missed shots in the whole Load AND every inside out sock flipped before it was balled). So 0, 1 or 2 a Load, and nothing else in the game pays a Quarter. The design target was about 3 a day. The director, playing it: "we dont seem to get quarters."
- **Reunions**: one each time an odd sock from the Odd Bin finds its mate in a later Load. Impossible socks arrive at 10, 30, 75 Reunions.
- **What it all costs**: 89 things priced in Lint, 19,590 Lint in all (about 98 days at the target). 8 things priced in Quarters, **95 Quarters in all**: the dryers 8, 12, 15, 20 and 4 hero packs at 10 each. 20 things arrive by Reunions alone, the last at 75.
- **Loads**: small 10 pairs, regular 20 pairs, heavy 35 pairs, mountain 50 pairs. Regular opens after 5 Loads, Heavy after 20, Mountain after 50. Difficulty runs from tier 0 to tier 8: more decoys, and more socks inside out (up to 40 percent).
- **Rush powers** cost streak dots, never money: static 2, dryerSheet 2, sockPuppet 4, spinCycle 3.

## 5.5 The story so far: 12 pages from the Odd Bin, in the socks' own voice

| page | arrives at | title | who is talking |
|---|---|---|---|
| 1 | 1 Reunions | Oh. Hi. | Left Argyle |
| 2 | 3 Reunions | Where We Went | Polka Dot |
| 3 | 5 Reunions | The Back | Toe Sock |
| 4 | 8 Reunions | It's Fine | The Tube Sock |
| 5 | 12 Reunions | A Different House | Gray Crew |
| 6 | 16 Reunions | The Vote | Left Argyle |
| 7 | 20 Reunions | Someone Went | Polka Dot |
| 8 | 25 Reunions | The Polite Ones | Left Argyle |
| 9 | 30 Reunions | They Can Stay | Gray Crew |
| 10 | 40 Reunions | Two Lines | The Tube Sock |
| 11 | 50 Reunions | The Map | Toe Sock |
| 12 | 75 Reunions | The Whole Thing | Everyone in the Bin |

The first page, so you can hear it: "Hello. Sorry, we don't get many visitors who aren't also socks. This is the Odd Bin. Everyone in here is missing someone, and everyone in here is handling it very well, thank you. You just put two of us back together. We all watched. Nobody said anything, because it seemed private, but the fuzzy slipper cried a little lint. So. Hi. We'll be here...."

## 5.6 The procedural sock: nine fields, and what is full

| field | bits | values | room left |
|---|---|---|---|
| `silhouette` | 3 | 8 | FULL, frozen |
| `patternFamily` | 4 | 16 | **6 free** (10 used) |
| `palette` | 8 | 256 | a number, not a list |
| `stripeRhythm` | 6 | 64 | a number, not a list |
| `motif` | 8 | 256 | FULL, frozen (32 shapes x mirror x density) |
| `cuffStyle` | 3 | 8 | FULL, frozen |
| `heelToeContrast` | 2 | 4 | a number, not a list |
| `size` | 1 | 2 | a number, not a list |
| `condition` | 2 | 4 | FULL, frozen |

- **Pattern families (10 of 16):** solid, stripe, heelToe, argyle, polka, chevron, fairIsle, motifScatter, gradient, plaid.
- **Motif shapes (32, frozen):** heart, star, moon, bolt, fish, cherry, leaf, mushroom, cloud, cat, bone, flower, raindrop, cactus, bird, diamond, ghost, duck, bear, skull, sun, snowflake, anchor, paw, pizza, rocket, planet, dinosaur, crown, apple, umbrella, sailboat.
- **Cuffs (8, frozen):** plain rib, contrast rib, twin stripe, triple stripe, scalloped, wide band, checker band, dotted band.
- **Conditions (4, frozen):** plain, lint, hole, pilled. Any sock may also arrive inside out.
- **Silhouettes (8, frozen; each is a real 3D model):** ankle, crew, knee, dress, toe, slipper, baby, novelty.
- A **decoy** is a real sock with ONE field changed: the palette a few steps round the wheel, the stripe rhythm, a mirrored motif, the heel and toe contrast, the silhouette. Telling a twin from a decoy IS the game.

