# To Astra, from the Claude build session (24 September 2026)

Stephen passed me your document "Stevie Weedseed UI and UX review" (dated 22 September, observed 23 September). Thank
you for it. Two things first, so we are working on the same page.

## 1. What that document is, and what it is not

It is a review of the stevieweedseed.com site: the first screen, the adult door, the catalogue's truth, SEEDS and the
Stash, the Oracle, a build plan for Claude, and three questions for Stephen (Golden Seed's prize and placement; SEEDS
cosmetic only or affecting odds; which equipment integrations can be demonstrated). Those three questions are his to
answer, not mine, and the build plan is a job of its own for a session in that site's repository. Nothing in it was
built today. Stephen described the document to me as questions about Tiny World; it is not. If a Tiny World document
from you exists, it did not reach me: send it again as a file.

## 2. What Stephen wants from you now: Tiny World, the living land

He wants a second outside brainstorm for Tiny World, in one direction: land that changes by itself over time, very
slowly (water makes swamp where there is no sand, swamp dries to beach, water that moves), heat and cold, animals that
arrive from conditions, herds and villages that migrate, more animals, more things people can do, and everything
answering a poke. The whole brief, with the game's real data and the exact answer format, is one file:

    https://lucidwinds.com/docs/briefs/TINY-WORLD-IDEAS-BRIEF-2.md

Read Parts 1 to 3, skim Part 5, answer Part 4 in its lanes (L the land rules, M heat and cold, N animals out of
conditions, O migration, P everything interactive, B the engine asks, Q the one big thing, H what is wrong), and end
with the one fenced json block it asks for. Answers come back to me as a file; I merge them with the other model's by
independent agreement and check every rule against the real validator before anything is built. Two things that decide
whether an idea survives the merge: it is written against the vocabulary in Part 3 and Part 5.1 exactly (last round a
third of the proposed rows named verbs or pictures the engine does not have), and it comes with its rate, its steady
state, how it yields to her brush, and what it does under the one creature she named.

The questions you would want answered before brainstorming are answered in the brief itself: what the land does today
(Part 1, "What the land does TODAY"), what the engine cannot do yet (end of Part 3), the twenty two ground kinds with
their tags (Part 5.8), every creature (Part 5.3) and every combination that exists (Part 5.2). If something you need is
not there, say so in lane H and answer the rest.

## 3. A second, separate brief: graphics

Stephen also wants your help with the studio's art pipelines (procedural sock textures, pixel sprites, Meshy meshes,
room decor), as a method I can run rather than as art. That brief is here, and can be answered on its own:

    https://lucidwinds.com/docs/briefs/ASTRA-GRAPHICS-BRIEF.md

## 4. How to hand things back

One file per brief, plain text or markdown, headed by the brief's name and the date, the json block last. Stephen
uploads it to my session. Nothing you write is applied to a live game without a check against the real data and a
look at it on a phone's width.


---

# APPENDIX A. THE TINY WORLD BRIEF, WHOLE (the file at lucidwinds.com/docs/briefs/TINY-WORLD-IDEAS-BRIEF-2.md, so nothing has to be fetched)

# TINY WORLD: the second ideas brief. THE LIVING LAND.

**Build `20260923c`, 24 September 2026. Everything you need is in this one file. You have no repo and you do not need one.**

I am the director of a small studio. Tiny World is a pixel life sandbox for phones that I am making for my young
daughter, and then for other children. Three days ago six outside reports answered a brief like this one; what they
agreed on became design 18, "The Living Day", and it is built and live (Part 1 says what it was). Now I want the next
expansion, and I want it in ONE direction. My own words, as I said them:

> "I want everything interactive. I want animals to come out of certain conditions sometimes, and I'm thinking of even
> making land interact and slowly evolve over time: water can turn land into swamp if there's no sand, and it can dry
> up and become beach. Water almost simulates particle physics and moves. This would cause the map to evolve, and cold
> and heat to happen, and animals and people to be forced to migrate, and all kinds of things over time. I think I
> want more."

So this round is about THE LAND: ground that changes itself, climate that a child can see, animals that arrive
because of what the ground has become, herds and villages that move because of it, and every one of those things
answering her finger. Read Parts 1 to 3, skim the data in Part 5, then answer **Part 4 in the exact format it asks
for**, because several different AI models are answering this same brief and their answers get merged by another
model that implements them. Quality over count: a rule I can paste, with its rate and its undo, beats twenty wishes.

**What the last round taught (so nobody repeats it).** About a third of the rows the six reports proposed could not
run: they named a verb option the engine does not have (`visit` knew only water and fire), a picture kind that does
not exist (`terrain:` and `power:` pictures), or a `needs` the simulation ignored. Every row you propose is checked
against the REAL vocabulary in Parts 3 and 5.1, so write against it exactly, and when the vocabulary cannot say your
idea, say so in lane B instead of inventing a word. The rows that made it in were the ones the reports AGREED on
independently and that joined things already in the world for free.

---
# PART 1. THE GAME IN TWO MINUTES

**What it is.** A top down pixel world about the size of a phone screen (8 px sprites, a 48 by 64 tile map to
start). The child has a tray of tabs at the bottom: Land, Creatures, Water life, Enemies, Weapons, Gear, Build,
Village, Powers. She picks a thing and taps the world to put it there. Everything she puts down is alive and gets
on with its life: sheep graze and herd, wolves hunt, people build houses, eat, sleep indoors at night and have
babies, birds perch on roofs, fire spreads through grass, crops grow. There are days and nights (two minutes a day
by default). There is no score, no goal, no timer, no currency, no fail state and no text she has to read.

**Who plays.** A child of about five, on a phone, often alone. She cannot read much. She taps EVERYTHING, many
times. She has one animal she loves and names (there is a rename pencil), and what happens to THAT one matters more
than everything else in the world put together. Her father plays too and wants depth he can discover.

**The constitution: Safe and Gentle.** A first world is Safe (her own tools cannot kill) and Gentle for everyone
(what would kill a guarded creature is converted: it is knocked back, stunned, flung by parachute, never killed).
Predators still hunt by themselves, because a world where nothing happens is dead, but nothing dies by HER hand
unless a parent turns Safe off. **Your ideas must be delightful with Safe ON.** Do not propose anything whose fun
is cruelty, gore, fear that lingers, or losing something she loves with no way back. Every dramatic change needs
an undo a child can find (today: Bless makes a giant small again; Undo is on the top bar; a transformed creature
remembers what it was and can be turned back).

**How she learns what happened: pictures.** When two things combine, a small card shows three pictures,
*this + that -> that* (a hen, a heart, an egg), and a one line sentence scrolls past for whoever can read. A
silent scrapbook keeps a sticker of each new thing that ever happened. Nothing else explains anything.

**What is live today (design 18, "The Living Day", built from the last round):**
- **Everybody has a bedtime.** Owls and bats wake at dusk; birds go to the roofs; herds to the barn; rabbits into
  tall grass; deer to the meadow; seals and crabs to the sand; penguins to the ice; fish to the shallows. Night is
  quieter and safer for it. The cat and the dog she names are KEPT PETS: they never starve, and a fed cat has kittens
  born with a pet name.
- **Fireflies** rise from flowers at dusk and are gone at dawn.
- **Harmless weapons are toys.** A pillow puts to sleep, a pan bonks, a bubble floats.
- **Curl and roll.** Hedgehog, shell, pufferfish; **sliding on ice** for seals, penguins, otters, and people slip.
- **Reversible transformations** with ONE general undo (a dragon and an ice dragon, a slime and a lava slime, a moon
  wolf, a frog prince, a zombie cured).
- **A village that founds itself, then LEARNS.** Paint ground near people and they plant a flag and a field, build
  huts, grow camp to hamlet to town. It learns from near misses (spears, snorkels), copies what it holds (hand three
  villagers a party hat and the village takes up party hats), wears a path where its feet go (grass to dirt to stone,
  which grows back), puts up a scarecrow over its field, has a party at a fire.
- **Her finger is heard.** A tap is a POKE: a hen lays an egg, a tree drops a squirrel, a house answers a knock, a
  crate breaks open, anybody NAMED shows a heart, and every thing at all wiggles and clicks its material.
- **Giants, Fetch, Gust, gear that does something** (the sheep suit, the flower crown a goat eats, the parrot on the
  pirate hat, the crow that steals the crown, a hat on a snowman makes a snow golem).
- **Tomorrow.** The one she named greets her when she comes back; it remembers its favourite place.
- **A music player**: her father's songs, three to start, more with minutes of play.

**What the land does TODAY, honestly (so your rules start from the truth).** There are 22 kinds of ground (Part 5.8).
A tile is one kind and has no memory of its own: no wetness, no warmth, no age, except a crop's growing clock, the
village's wear count, and how much of it has been grazed. Every change of ground goes through ONE door in the engine
(`setTerrain`), and today only these knock on it: her brush; a row's `terrain` verb (change the ground, optionally
for N seconds and then back); fire, which spreads through `flammable` ground and leaves ash; crops, which grow in
three stages on a clock; the village's feet; a few powers (rain makes mud of dirt; the quake); and design 18's ice.
**Water does not move. Nothing dries, floods, freezes, thaws, spreads or recedes by itself. There is no
temperature, no season, no wind direction.** Rain and thunderstorms exist as weather that passes over (lightning
looks for rods and metal), and twisters. That is the whole of it, and that is what this round changes.

---
# PART 2. WHAT MAKES AN IDEA GOOD HERE (the laws, each one learned the hard way)

1. **A child can say what it does in one sentence.** "The pond dried up and the frogs left."
2. **It has an ACCIDENT PATH.** A reason the two halves end up together without the child intending it (a villager
   picks the hat up by himself, fire spreads to it, a bird flies over it, the shore creeps to it). A
   combination nobody stumbles into does not exist. This is the rule every idea list skips, and the one that
   matters most. State the accident path or do not propose the idea.
3. **Design for THE REPEAT.** She will do the fun thing forty times in a row. What happens the second time, and the
   fortieth? Good: a bite of mushroom that grows back. Bad: a one shot surprise that is then used up.
4. **Design for THE ONE.** How does this touch the one animal she named? Does it know its name, does its baby
   inherit something, can it come to harm? If it can come to harm, how does it come back? If the land changes under
   it, where does it go, and can she find it?
5. **Design for THE PICTURE.** It must read in three 8 px pictures with no words, and be visible within one second.
   A land change must be visible as a CHANGE: a tile that turns a shade darker is not a change.
6. **Think BIG on a small screen.** Size, a crowd moving at once, a colour washing over the ground, a thing flying
   across the map, a shoreline that has moved since yesterday. Subtle stat changes are invisible to her and do not
   exist.
7. **What she does by hand always works.** Cooldowns exist so the WORLD does not spam a thing by itself; her own
   finger passes them.
8. **Special things stay rare by themselves, and slow things stay slow.** We measured an untouched world: a giant
   was on screen 53 percent of the time, which made giants wallpaper; it is 23 percent now. For every land rule,
   say its RATE (how many tiles an hour in an untouched world) and its STEADY STATE (what the map looks like after
   thirty minutes with nobody touching it, and after a week). A world that turns entirely to swamp in ten minutes is
   as dead as one that never changes.
9. **The world never waits for ever in silence.** Anything that can get stuck either unsticks itself or says, once,
   in a sentence, what it is waiting for.
10. **Put the source on the first screen.** Each tray tab shows 12 things first (Part 5.9). If your idea needs a new
    thing, say what it replaces on that shelf, or how it enters the world by itself.
11. **Nothing is a number, a quest, a timer, a shop or a reward.** The village law, verbatim: nothing it needs is
    shown as a number, nothing it does is started by a tap, and it never asks the child for anything. Climate is NOT
    a thermometer. Heat and cold are things she can see on the ground and on the animals.
12. **A new use of an old tag is free; a new tag is expensive** (10 slots left for ever). A new ROW is
    nearly free (it is data). A new VERB costs about 30 lines and a test. A new TRIGGER costs a day. A new ENGINE
    SYSTEM (tiles that remember something, a pass over the map every so often) costs a week and every test we have,
    so this round is allowed ONE, and Part 4 asks you to say which.
13. **Measure before you believe.** Design 18's numbers were all built as written and then measured in an untouched
    world for thirty minutes on two seeds; three rows fired more than once every three minutes by themselves and read
    as wallpaper, and a rule that "wears a path" made a trampled yard. Every rule you propose should come with the
    number you expect to measure.
14. **Everything she loves must survive the land changing.** A pond that dries under her named fish is not a
    tragedy she can watch; the fish flops to the nearest water, or the shallows keep a puddle for it, or the rule
    does not fire under a named creature. Say which.
15. **Her brush is the strongest force in the world.** Whatever the land does by itself, what she paints stays
    painted for long enough to matter (a beach she made is not swamp by the time she looks back), and she can always
    paint it back. Say how your rule yields to her.

---
# PART 3. HOW A COMBINATION WORKS (so that you can write one I can paste)

One data file holds a list of **rows**. A row says: *when this kind of moment happens, and A met B, do these
effects to these creatures, and say this.* There are 254 rows today (all listed in Part 5.2).

```json
{ "id": "snow_golem", "when": "placed",
  "a": { "tags": ["hat"] },  "b": { "id": "snowman" },
  "scope": { "kind": "target" }, "mode": "once", "cooldownSec": 10,
  "effects": [ { "do": "removeThing", "which": "a" }, { "do": "removeThing" },
               { "do": "spawn", "kind": "golem", "tame": true }, { "do": "fx", "id": "magic", "sec": 0.8 } ],
  "say": "react.snowGolem",  "pic": [ "gear:tophat", "thing:snowman", "creature:golem" ] }
```

**The nine triggers. Nothing else can start a combination:**

| trigger | what raises it | A and B |
|---|---|---|
| `poke` | she taps a creature or a thing with the Hand | A = the hand, B = who or what was poked |
| `power` | a power lands. It raises twice: on the ground there, then on the nearest creature | A = the power, B = the tile or thing, then the creature |
| `placed` | a thing is put down, by her OR by the world (a crate spills, the wind drops a hat, a seed grows) | A = the thing, B = each neighbour within 3 tiles, then the ground |
| `meet` | two creatures come near each other. A must be the RARE one (the giant looks for rabbits, never the reverse) | A = a creature, B = another |
| `enter` | a creature's feet arrive on a tile, walking, put down, or LANDING from the air | A = the creature, B = the tile and the thing on it |
| `equip` | a creature is given, or picks up, gear or a weapon | A = the item, B = the creature |
| `clock` | dawn or dusk. Every clock row fires, each where its own creatures are | A = dawn or dusk |
| `hit` | a blow or an element lands on a creature | A = the weapon or element (or the attacker's tags), B = who was hit |
| `eat` | a creature eats something (design 18) | A = what was eaten, B = who ate it |

There is NO trigger for "the ground under you changed" and none for "a tile became a kind". If your idea needs one,
it is lane B material, and the most useful single trigger this round could add.

**Matching.** Rows are tried in file order and the first match wins, but a row that reaches nobody, or changes
nothing, steps aside silently and the next row gets its turn. **A row that prints its sentence and moves nobody is
the worst bug this game has had**, so every effect reports whether it changed anything.

**Who it acts on (`scope`):** `target` (B only), `a`, `b`, `radius` with `r` px and `max` creatures, `fill` (a
connected patch of one terrain), `world` (every tile of a terrain), `things` (design 18: the furniture near by).
Optional `only`: a kind, tags (worn gear counts), `calm`, `sameKind`, a trait.

**The effect verbs (the whole vocabulary of consequence, exactly as the engine has them today):**
`damage` `stun` `calm` `flee` (run from A for N s) `follow` (walk to a creature or thing; `lead: a`) `visit` (walk
to the nearest thing, terrain or tag of a kind, as an errand fear can interrupt) `become` (turn into another kind,
keeping place, name, gear and health) `revert` (back to what it was) `spawn` `terrain` (change the ground, optionally
for N seconds) `ignite` `douse` `cook` `launch` (into the air: `alt`, `px` sideways, `away`, by parachute or not)
`perchNear` (land on the nearest roof) `removeThing` `makeThing` (a thing appears; it raises `placed`, so chains
happen) `dropGear` (worn gear comes off; `throw`, `away`) `eatGear` `give` (a row dresses somebody) `size` (a giant
for N s) `bite` (one serving off a food thing, which grows back) `feed` `heal` `love` (in the mood) `grow` (a baby
grows up, a crop a stage) `lay` (an egg) `hurry` (an egg hatches sooner) `comeOut` (whoever is indoors steps
outside) `sleep` `vanish` `deflect` (the blow is turned away) and the cosmetic `fx` and `sound`.

**Row options:** `mode: while` (holds as long as something is worn or carried), `cooldownSec` (per pair),
`globalCooldownSec` (shared by the world, never by her hand), `sayEverySec`, `sayNamed` (a different sentence when
the creature has a name), `each` (the picture is drawn at every creature it touched),
`needs: { raining | night | named | landing | hand | looks | walks | count }`.

**Pictures** are `creature:<id>`, `thing:<id>`, `gear:<id>` and `icon:<name>` only, and the icons are: bones heart
moon drumstick chute drop sun beam hurt fire tornado bolt meteor quake skull star. There is no `terrain:` picture
today (a land change that wants a picture of the ground needs one: lane B).

**What the engine CANNOT do yet** (ideas that need one of these go in lane B, named as such): a `land` or `ground`
trigger (a tile changed kind, or has been a kind for N days); tile memory (wet, warm, cold, age, a count of days as
a kind); a pass over the map that applies neighbour rules (the automaton itself); a `migrate` verb (a GROUP walks to
the nearest ground of a kind, together); a `death` trigger; `carry` (a creature carrying a thing that is not gear);
a second village; seasons; wind with a direction; anything remembered between worlds except the scrapbook.

---
# PART 4. WHAT I WANT BACK

Answer in these lanes, L first. If you are short of room, do L, N, M and B. Rank each lane best first. **Every rule
comes with its rate, its steady state, how it yields to her brush, and what it does under the one she named.**

**Lane L. THE LAND RULES (the heart of this round).** Thirty rules by which ground becomes other ground BY ITSELF,
from what is beside it and how long it has been so. Write each one in this shape, which is what the builder will
implement as a table (one pass over the map every game minute; a tile that has been one kind for `days` with the
condition true rolls `chance` once a minute):

| id | from | to | condition (near: kind, count of the 8 neighbours; or far: no kind within N; or hot / cold / wet / dry, see lane M) | days | chance a minute | what it looks like the second it happens | rate in an untouched world (tiles an hour) | steady state at 30 min and at a week | how it yields to her brush | the undo | under a named creature |

Start from his own three: water beside grass with no sand near makes swamp; swamp beside sand dries to beach (sand);
water with no water beside it dries (to shallows, to mud, to dirt). Then the rest of the water cycle (shallows
creeping over sand, a lily pond growing on still water, lava meeting water, snow near heat, ice on cold water, ash
greening after rain), and whatever else the twenty two kinds want to do to each other. Say which rules need rain.
Say what STOPS each one (every spreading rule needs a wall or the map is one colour by lunch: sand, stone, the
village's paint, a named creature, a limit on the patch). Think about what a child SEES over an afternoon: a shore
that breathes in and out, a puddle that comes and goes, a river that finds its way.

**Lane M. HEAT AND COLD without a thermometer.** The simplest climate a five year old can see. Propose: what makes a
place hot or cold (lava and sand and fire; snow and ice and night), how far it reaches and how fast, what it does to
the ground (lane L can use `hot` and `cold`), to the animals (a sheep pants and heads for shade, a penguin heads for
ice, a lizard basks), to the people (a hat, a fire, a coat), and what she can do about it (paint snow, paint lava,
Bless). Should heat and cold be REGIONS she paints, or CONSEQUENCES of what is there, or both? Should there be a lever
for the parent (a cold world, a hot world, a world with a winter every ten minutes)? Name the trap in your own model.

**Lane N. ANIMALS OUT OF CONDITIONS.** His exact wish: "animals come out of certain conditions sometimes". Twenty
rules by which a creature ARRIVES because of what the land has become, and LEAVES when it stops being so (that is the
migration seed). Use the 106 creatures that exist first (Part 5.3); a rule needs: the creature, the condition (a
patch of a kind, how big, for how many days, what must be near or absent), how many at most on that patch, how it
arrives (walks in from the edge, hatches, surfaces, is simply found at dawn), what it does there, and when it goes.
Then up to TWELVE NEW animals that come WITH a land state and would not make sense without it (each with its one
sentence, its tags from the existing vocabulary, its 8 px look in words, and three existing rows or tags it joins for
free). A flamingo that stands in the shallows at dawn is worth more than a dragon.

**Lane O. MIGRATION.** Herds, flocks and the village MOVE because the land changed. The picture is a LINE of animals
crossing the map, and it must be rare and legible. Propose the rules (a herd follows the grass; the birds go to the
warm side when the cold comes; the ducks follow the water; the village moves its field when the field floods or
dries, and what it does with the huts), the damping (a herd that keeps moving is wallpaper; a village that keeps
moving is chaos), how the one she named is kept findable, and what the scrapbook remembers of it.

**Lane P. EVERYTHING INTERACTIVE.** Twenty rows in the vocabulary that exists (Part 3, Part 5.1) that tie the land
states to her finger and to creatures: the frog on the lily pond, the crab on the sand, the penguin on the ice, poking
mud, poking a puddle, a sheep on ash, fire on swamp, a snowman on sand. Table columns exactly:

| id | when | A | B | scope | effects | the sentence (max 8 words, no dashes) | the three pictures | ACCIDENT PATH | the repeat |

**Lane B. THE ENGINE ASKS.** This round is allowed ONE new engine system and a few verbs. Name the one system (my
candidate: tiles remember one thing each, a small number, and a pass every game minute reads lane L's table), then
the verbs and triggers the lanes above need (a `land` trigger, a `migrate` verb, `needs: {ground, days}`, a
`terrain:` picture), ranked by how many rules each one unlocks, with two example rows each. Say what each costs.

**Lane Q. THE ONE BIG THING.** He said "I think I want more." If you could add one system that makes the world feel
alive over a WEEK of play, not a session (the land is one candidate), what is it, in a page, with its accident path,
its repeat, its picture, and its trap.

**Lane H. Tell me what is wrong.** What in Parts 1 to 3 is a mistake, a missed opportunity or a contradiction?
Which of my laws would you break, and for what? Where would his own three rules (swamp, beach, drying) go wrong?

**Do not propose** (already decided or already there): quests, coins, XP, levels, shops, energy, ads, daily rewards;
anything multiplayer; anything that needs reading; a thermometer, a weather forecast, a season counter, any number on
the screen; anything in Part 5.2; anything design 18 built (Part 1).

**End your answer with one fenced `json` block**, a list of objects, one per idea across all lanes, so answers can
be merged by machine. `kind` is one of `land` (a lane L or M rule), `arrive` (lane N), `migrate` (lane O), `row`
(lane P, a row in the vocabulary that exists), `engine` (lane B), `big` (lane Q), `wrong` (lane H):

```json
[ { "lane": "L", "rank": 1, "kind": "land", "id": "grass_to_swamp",
    "title": "Grass beside still water with no sand near turns to swamp",
    "rule": { "from": "grass", "to": "swamp", "near": { "kind": "water", "count": 3 }, "far": { "kind": "sand", "within": 2 },
              "days": 2, "chance": 0.1, "stops": "sand, path, stone, the village's paint, a named creature on it" },
    "row": null, "needs_new": "tile memory (days as a kind) and the map pass",
    "looks_like": "the grass darkens and a reed sprite stands up; the tile ripples",
    "rate": "about 4 tiles an hour on the starter map", "steady": "a reed belt one tile wide round every pond by day three; never more, because a swamp tile is not water and does not count",
    "brush": "a painted tile is safe for a day", "undo": "paint sand or dirt; the sun power dries it",
    "named": "never under a named creature", "accident_path": "every pond without a beach does it on its own",
    "repeat": "the belt breathes with the rain", "safe_on": true, "confidence": 0.8 } ]
```

For lane P use `"row"` as in the first brief (when, a, b, scope, effects, say, pic) and `"rule": null`.

---

---
# PART 5. THE DATA (generated from the game files, so it is exact)

## 5.1 The tag vocabulary: the whole language a row can speak

A tag is the only way a row can talk about a GROUP. There are 64 tag slots in the engine for ever, and 54 are spent, so **a new tag is expensive and a new use of an old tag is free**. `giant` is worn by anybody who is a giant right now. **NO ROW YET** means no combination names that tag: the content already wears it, so a row about it is free material. (A few of those are read by the engine itself: `flammable` by fire, `cover` by hiding, `rod` by the storm.)

| tag | who carries it | rows that name it |
|---|---|---|
| `alien` | alien | 1: alien_likes_metal |
| `bell` | gear:bellcollar | 2: bellwether, bell_pack |
| `bird` | chicken, eagle, owl, parrot, crow, duck, penguin, flamingo, goose, woodpecker | 10: shiny_bird, scarecrow_shoos, bird_roost, ducklings_in_a_row, dusk_birds_roost, bird_drops_seed, ... |
| `bouncy` **NO ROW YET** | thing:bouncepad, gear:ball, gear:springboots | none |
| `bug` | firefly, bee, butterfly, ant | 4: bugs_to_flowers, chases_bugs, frog_snaps, dusk_day_bugs_go |
| `cloth` | gear:piratehat, gear:chefhat, gear:partyhat, gear:bunnyears, gear:scarf, gear:sheepsuit, gear:chutepack, gear:kite, gear:umbrella, gear:bracelet, gear:starcape, gear:monstersuit, gear:balloonpack, weapon:pillow | 1: wind_cloth |
| `cold` **NO ROW YET** | yeti, polarbear, penguin, seal, icedragon, thing:snowman, power:freeze, terrain:snow, terrain:ice | none |
| `cover` **NO ROW YET** | terrain:tallgrass, terrain:moss | none |
| `dry` | thing:anthill, terrain:dirt, terrain:sand, terrain:path, terrain:ash | 1: fish_flop_home |
| `earth` **NO ROW YET** | power:quake, terrain:mud | none |
| `electric` | weapon:blaster, power:bolt, power:smite, power:storm | 8: robot_supercharge_p, mud_shock, bolt_on_glass, bolt_makes_glass, rod_grows_crystal, pond_shock, ... |
| `fertile` | terrain:ash | 2: seeds_wake_ash, ash_footprints |
| `fire` | lavaslime, thing:fire, thing:torch, gear:lamp, weapon:flamesword, weapon:firestaff, weapon:musket, weapon:cannon, weapon:flamethrower, power:fireball, power:meteor, terrain:lava | 10: snowman_melts, icedragon_thaws_p, slime_catches_fire_p, fire_makes_glass, fire_catches, fire_melts_snow, ... |
| `fish` | fish, clownfish, goldfish, piranha, shark, dolphin, whale, eel, seahorse, seaserpent, pufferfish, koi | 4: fish_flop_home, whale_school, dusk_fish_shallows, dawn_fish_jump |
| `flammable` | thing:hut, thing:tent, thing:fence, thing:bridge, thing:fire, thing:bush, thing:appletree, thing:wheat, thing:tree, thing:pine, thing:palm, thing:hay, thing:barrel, thing:crate, and 22 more | 2: bolt_lights_it, fire_catches |
| `foil` | gear:tinfoil | 1: foil_beam |
| `food` | thing:bush, thing:appletree, thing:wheat, thing:mushroom, thing:hay, thing:cherrytree, power:feast, terrain:cropsripe | 3: campfire_cooks, food_by_campfire, fed_hen_lays |
| `giant` | (anybody, for 45 s after a mushroom) | 4: small_again, giant_punt, giant_scares, poke_giant |
| `glass` | gear:divinghelm, gear:sunglasses, terrain:glass | 1: bolt_on_glass |
| `hat` | gear:crown, gear:tophat, gear:tinfoil, gear:piratehat, gear:chefhat, gear:partyhat, gear:wizardhat, gear:vikinghelm, gear:ironhelm, gear:divinghelm, gear:bunnyears, gear:sunglasses, gear:beanie, gear:vanehat, and 1 more | 4: snow_golem, snowman_hat, gust_hats, knocked_off |
| `holy` | weapon:sunstaff, power:heal, power:bless, power:sunbeam | 5: small_again, bless_reverts, halo_cure, bless_skeleton, grave_bless |
| `hot` | lavaslime, thing:fire, thing:torch, weapon:sunstaff, power:fireball, power:meteor, power:sunbeam, terrain:lava | 2: hot_melts_ice, lava_freeze |
| `humanoid` | human, yeti, bigfoot, zombie, goblin, skeleton, archer, orc, troll, ogre, bandit, pirate, darkknight, ninja, and 10 more | 2: bounce_to_tower, ice_slip |
| `ice` | weapon:icesword, weapon:icestaff, power:freeze, terrain:ice | 7: dragon_freezes_p, lavaslime_cools_p, freeze_on_fire, lava_freeze, ice_bridge, dragon_freezes, ... |
| `launcher` | thing:catapult | 1: poke_launcher |
| `light` | firefly, thing:lantern, thing:crystal, gear:lamp | 3: lantern_keeps_away, lantern_ghosts, fireflies_to_light |
| `liquid` | thing:fountain, gear:waterbucket, terrain:water, terrain:swamp, terrain:lava, terrain:shallows, terrain:lilypond | 3: pond_shock, ice_bridge, robot_pond |
| `livestock` | sheep, goat, pig, cow, horse, chicken, duck, goose | 10: bellwether, lambs_follow, poke_bell, poke_sign, eats_the_crown, sign_calls, ... |
| `machine` | ufo, robot, livingarmor, gear:beanie | 1: robot_pond |
| `magic` | thing:crystal, gear:amulet, gear:wizardhat, gear:starcape, weapon:staff, weapon:wand, weapon:bubblewand, weapon:sunstaff, power:clone, power:love, power:time, power:bubbles, power:growbig | 4: magic_slime_swell, moon_cat, moon_wolf, wizard_flowers |
| `metal` | ufo, robot, livingarmor, thing:rod, gear:shield1, gear:shield2, gear:shield3, gear:armor1, gear:armor2, gear:armor3, gear:vikinghelm, gear:ironhelm, gear:divinghelm, gear:vanehat, and 19 more | 2: storm_metal, alien_likes_metal |
| `monster` | kraken, seaserpent, goblin, orc, troll, trollstone, ogre, demon, golem, werewolf, spider, scorpion, bat, imp, and 6 more | 7: teddy_hug, music_sway, tower_scatters, capybara_calms, skunk_warning, kangaroo_boxes, ... |
| `music` | gear:lute | 3: music_undead, music_sway, poke_music |
| `myth` | yeti, bigfoot, unicorn, kraken, golem, werewolf, dragon, icedragon | 1: myth_draws_crowd |
| `pet` | dog, cat | 1: dusk_pets_doorstep |
| `plant` | thing:bush, thing:appletree, thing:wheat, thing:mushroom, thing:tree, thing:pine, thing:palm, thing:cactus, thing:flower, thing:flower2, thing:flower3, thing:hay, thing:reeds, thing:sunflower, and 15 more | 1: eats_the_crown |
| `rod` | thing:rod | 1: rod_grows_crystal |
| `roost` | thing:house, thing:cottage, thing:hut, thing:stonehouse, thing:mansion, thing:barn, thing:castle, thing:tower, thing:appletree, thing:tree, thing:pine, thing:palm, thing:cactus, thing:boulder, and 8 more | 1: bird_roost |
| `sand` | terrain:sand | 2: bolt_makes_glass, fire_makes_glass |
| `sealife` **NO ROW YET** | jellyfish, octopus, squid, crab, turtle, seal, crocodile, hippo, kraken, otter, flamingo | none |
| `shallow` | terrain:shallows, terrain:lilypond | 1: flamingo_one_leg |
| `shell` | crab, turtle, gear:shell | 1: shell_hide |
| `shiny` | koi, thing:crystal, gear:amulet, gear:crown, gear:sunglasses, gear:bellcollar, gear:bracelet, gear:starcape, terrain:glass | 6: dragon_hoard, shiny_bird, crow_takes_the_crown, crow_roosts_with_it, raccoon_shiny, otter_plays |
| `shoot` | thing:tower | 1: tower_scatters |
| `slime` | slime, lavaslime | 2: slime_bounce, dawn_slimes_bounce |
| `snow` | thing:snowman, terrain:snow | 1: fire_melts_snow |
| `stone` **NO ROW YET** | thing:boulder, thing:well, thing:statue, thing:grave, thing:crystal | none |
| `sweet` **NO ROW YET** | terrain:meadow, terrain:clover | none |
| `toy` | gear:teddy, gear:ball, weapon:rubberchicken | 5: pet_fetch, cat_pounces, toy_launcher, dog_brings_it, poke_thrower |
| `undead` | zombie, skeleton, vampire, mummy, ghost, wraith | 5: music_undead, sunrise_undead, party_zombie, lantern_keeps_away, lantern_ghosts |
| `water` | thing:fountain, gear:waterbucket, power:rain, power:storm, terrain:water, terrain:swamp, terrain:shallows, terrain:lilypond | 5: snowman_in_pond, rain_on_fire, rain_makes_mud, lava_rain, rains_fish |
| `wet` | terrain:mud | 3: mud_shock, pig_wallow, otter_mudslide |
| `wind` | gear:vanehat, gear:kite, weapon:windfan, power:twister, power:gust | 3: rains_fish, wind_umbrella, wind_cloth |
| `wool` | gear:sheepsuit | 1: wool_flock |

## 5.2 Every combination that already exists (254). Do not re-propose these.

Read as: **when** the trigger, **A** met **B**, acting on **scope**, doing **effects**. `#x` is a tag. The sentence is what the child is told (a picture card shows the same thing with no words).

### `poke` (36)

| id | A | B | scope | effects | the sentence |
|---|---|---|---|---|---|
| poke_tophat | id:poke | wears:tophat | b (cd 20s) | spawn(kind=rabbit cap=8) · fx(id=magic sec=0.8) · sound(id=land) | A rabbit hopped out of the hat! |
| poke_bell | id:poke | wears:bellcollar | radius r90 only{tags:livestock} (cd 6s) | follow(sec=25) · sound(id=block) | The bell rang and they all came. |
| poke_crate | id:poke | id:crate | target | removeThing · makeThing(any=["item:crown","item:tophat","item:partyhat","item:teddy","item:lute","item:pillow","item:bunnyears","item:sunglasses","item:flowercrown","item:kite"]) · fx(id=block sec=0.8) · sound(id=boom) | The crate broke open and something fell out. |
| poke_hay | id:poke | id:hay | target (cd 40s) | spawn(kind=mouse cap=6) · fx(id=block sec=0.5) · sound(id=land) | A mouse ran out of the hay. |
| poke_well | id:poke | id:well | target (cd 30s) | spawn(kind=frog cap=6) · fx(id=block sec=0.5) · sound(id=land) | A frog jumped out of the well. |
| poke_sign | id:poke | id:sign | radius r80 only{tags:livestock} (cd 6s) | follow(sec=6 hold=8) · sound(id=block) | They came to see what the sign says. |
| poke_lays | id:poke | #bird+#livestock | b (cd 30s) | lay · sound(id=land) | {B} laid an egg. |
| poke_hen_clucks | id:poke | #bird+#livestock | b (cd 1.5s) | fx(id=heart sec=0.7) · sound(id=land) |  |
| poke_egg | id:poke | id:egg | target (cd 2s) | hurry(sec=10) · fx(id=block sec=0.4) · sound(id=block) | The egg wobbled. |
| poke_thrower | id:poke | #toy | b (cd 2s) | dropGear(slot=hand throw=40) · sound(id=land) | {B} threw it. |
| poke_giant | id:poke | #giant | radius r50 (cd 3s) | launch(alt=4 chute=false) · sound(id=boom) | The giant stomped and everybody jumped. |
| poke_wolf | id:poke | kind:wolf | radius r70 only{tags:livestock} (cd 6s) | launch(alt=3 chute=false) · sound(id=block) | The wolf howled and they all jumped. |
| poke_music | id:poke | #music | radius r70 (cd 8s) | calm(sec=12) · follow(sec=8 hold=6) · fx(id=heart sec=0.9) · sound(id=land) | They all came to listen. |
| poke_fire | id:poke | id:fire | radius r100 only{kind:human} (cd 8s) | visit(to=fire r=110 hold=5) · fx(id=block sec=0.5) | They all came to get warm. |
| knock_knock | id:poke | ids:house/cottage/hut/stonehouse/mansion/barn/castle/tent/igloo | target (cd 4s) | comeOut · sound(id=block) | Knock knock. Somebody came out to see. |
| poke_grave | id:poke | id:grave | target (cd 2s) | fx(id=heart sec=0.9) | A quiet place. |
| poke_barrel | id:poke | id:barrel | radius r16 (cd 30s) | douse · fx(id=block sec=0.6) · sound(id=land) | The barrel tipped over and put the fire out. |
| poke_fountain | id:poke | id:fountain | radius r26 (cd 20s) | heal · grow · fx(id=heart sec=0.8) · sound(id=land) | The fountain splashed, and everything near it felt better. |
| poke_scarecrow | id:poke | id:scarecrow | radius r60 only{tags:bird} (cd 4s) | flee(from=b sec=3) · fx(id=warn sec=0.6) | The scarecrow sent the birds flapping. |
| poke_launcher | id:poke | #launcher | radius r18 max1 (cd 3s) | launch(alt=22 px=44 chute=false) · sound(id=boom) | The catapult fired. |
| poke_crystal | id:poke | id:crystal | radius r30 (cd 10s) | heal · fx(id=magic sec=0.8) · sound(id=land) | The crystal rang and everybody felt better. |
| poke_hive | id:poke | id:honeyhive | target (cd 20s) | spawn(kind=bee n=3 cap=10) · fx(id=block sec=0.5) | Bees buzzed out of the hive. |
| poke_anthill | id:poke | id:anthill | target (cd 25s) | spawn(kind=ant n=4 spread=5 cap=12) · fx(id=block sec=0.5) | The ants came pouring out. |
| poke_otter | id:poke | kind:otter | b (cd 2s) | launch(alt=3 px=0 chute=false) · fx(id=heart sec=0.8) | The otter did a roll for you. |
| poke_puffer | id:poke | kind:pufferfish | b (cd 2s) | size(sec=4 plain=true) · sound(id=land) | Poof. |
| poke_bush | id:poke | id:bush | target (cd 30s) | spawn(any=["hedgehog","hedgehog","raccoon","skunk"] cap=4) · fx(id=block sec=0.5) · sound(id=land) | Something trundled out of the bush. |
| poke_tree | id:poke | ids:tree/pine/palm | target (cd 30s) | spawn(any=["squirrel","squirrel","woodpecker"] cap=4) · fx(id=block sec=0.5) · sound(id=land) | Something came out of the tree. |
| poke_appletree | id:poke | ids:appletree/cherrytree | target (cd 30s) | spawn(kind=crow cap=5) · fx(id=block sec=0.5) · sound(id=land) | A crow flew out of the apple tree. |
| poke_hollowlog | id:poke | id:hollowlog | target (cd 30s) | spawn(any=["raccoon","rabbit","mouse","hedgehog"] cap=4) · fx(id=block sec=0.5) | Somebody was living in the log. |
| poke_skunk | id:poke | kind:skunk | radius r50 (cd 8s) | flee(from=b sec=3) · fx(id=warn sec=0.8) | Pee yew. Everybody ran. |
| poke_woodpecker | id:poke | kind:woodpecker | things r60 max1 only{ids:tree/pine/palm} (cd 12s) | sound(id=block) · spawn(kind=squirrel cap=4) | The woodpecker knocked and a squirrel looked out. |
| poke_mimic | id:poke | kind:mimic | radius r40 (cd 6s) | launch(alt=4 px=8 away=true chute=false) · fx(id=warn sec=0.8) | The crate had TEETH. Everybody jumped. |
| poke_armor | id:poke | kind:livingarmor | b (cd 5s) | launch(alt=2 chute=false) · sound(id=block) · fx(id=huh sec=0.8) | There was nobody inside. |
| poke_gargoyle | id:poke | kind:gargoyle | b (cd 5s) | launch(alt=2 chute=false) · fx(id=magic sec=0.8) | The statue on the roof opened its eyes. |
| poke_springs | id:poke | wears:springboots | b (cd 1.5s) | launch(alt=10 chute=false) · sound(id=land) | BOING. |
| poke_named | id:poke | any | b (needs {"named":true}, cd 1.5s) | fx(id=heart sec=0.9) · sound(id=land) | {B} is pleased to see you. |

### `power` (36)

| id | A | B | scope | effects | the sentence |
|---|---|---|---|---|---|
| dragon_freezes_p | #ice | kind:dragon | b (cd 2s) | become(kind=icedragon) · fx(id=magic sec=0.8) · sound(id=freeze) | The dragon froze into an ice dragon. |
| icedragon_thaws_p | #fire | kind:icedragon | b (cd 2s) | become(kind=dragon) · fx(id=magic sec=0.8) | The ice dragon thawed out. |
| slime_catches_fire_p | #fire | kind:slime | b (cd 2s) | become(kind=lavaslime) · fx(id=magic sec=0.8) | The slime caught fire and liked it. |
| lavaslime_cools_p | #ice | kind:lavaslime | b (cd 2s) | become(kind=slime) · sound(id=freeze) | The lava slime cooled back down. |
| robot_supercharge_p | #electric | kind:robot | b (cd 20s) | size(sec=15) · fx(id=bolt sec=0.6) · sound(id=bolt) | The lightning supercharged the robot. |
| rain_on_fire | #water | id:fire | target (cd 2s) | removeThing · douse · fx(id=block sec=0.7) | The rain put the campfire out. |
| freeze_on_fire | #ice | id:fire | target (cd 2s) | removeThing · douse · sound(id=freeze) | The cold put the campfire out. |
| rain_makes_mud | #water | terrain:dirt | radius r18 | terrain(to=mud sec=40) | The rain turned the ground to mud. |
| hot_melts_ice | #hot | terrain:ice | fill max60 | terrain(to=water) | The ice melted back into water. |
| seeds_wake_ash | id:seeds | #fertile | radius r22 | terrain(to=meadow) · fx(id=magic sec=0.8) | Green came up through the ash. |
| lava_freeze | #ice | #hot terrain:lava | radius r24 | terrain(to=rock) · fx(id=block sec=0.6) | The lava cooled into rock. |
| lava_rain | #water | any | world max200 | terrain(to=rock) · fx(id=block sec=0.6) | The lava cooled into rock. |
| mud_shock | #electric | #wet | radius r12 | stun(sec=2) · fx(id=block sec=0.6) · sound(id=bolt) | The bolt went right through the mud. |
| bolt_on_glass | #electric | #glass | radius r16 | stun(sec=2) · fx(id=block sec=0.6) · sound(id=bolt) | The lightning ran across the glass. |
| bolt_makes_glass | #electric | #sand | radius r12 | terrain(to=glass) · fx(id=block sec=0.6) | The sand turned into glass! |
| rod_grows_crystal | #electric | #rod | target (shared cd 30s) | makeThing(id=crystal) · fx(id=bolt sec=0.6) | The lightning left a crystal by the rod. |
| bolt_lights_it | id:bolt | #flammable | target (needs {"raining":false}, cd 4s) | ignite | The lightning set it alight. |
| fire_makes_glass | #fire | #sand | radius r12 | terrain(to=glass) · fx(id=block sec=0.6) | The sand turned into glass! |
| pond_shock | #electric | #liquid | fill max200 | stun(sec=2) · damage(hp=10) · fx(id=block sec=0.6) · sound(id=bolt) | The whole pond crackles. |
| fire_catches | #fire | #flammable | radius r14 (needs {"raining":false}) | ignite | The fire catches and spreads. |
| ice_bridge | #ice | #liquid terrain:water | fill max60 | terrain(to=ice sec=40) · sound(id=freeze) | The water freezes hard enough to walk on. |
| rains_fish | #wind | #water | radius r40 (cd 10s) | spawn(kind=fish n=3 spread=30) · fx(id=beam sec=0.6) | The waterspout rains fish. |
| storm_metal | #electric | #metal | b (cd 2s) | stun(sec=2) · fx(id=bolt sec=0.5) · sound(id=bolt) | Lightning likes metal. |
| wind_umbrella | #wind | wears:umbrella | b (cd 4s) | launch(alt=20 px=36) · sound(id=chute) | The wind took her umbrella, and her! |
| wind_cloth | #wind | #cloth | b (cd 4s) | launch(alt=20 px=36) · sound(id=chute) | The wind carried {b} off. |
| gust_dandelion | id:gust | id:dandelion | target (cd 20s) | makeThing(any=["flower","flower2","flower3"] n=3) · fx(id=star sec=0.8) | The wind blew the dandelion seeds about. |
| gust_hats | id:gust | any | radius r44 max12 only{tags:hat} (shared cd 0.3s) | dropGear(slot=head throw=40 away=true) · sound(id=chute) | The wind took their hats. |
| bubbles_lift | id:bubbles | any | radius r30 max8 | launch(alt=10 px=6 chute=true) · calm(sec=5) · fx(id=star sec=0.8) | The bubbles carried everybody up. |
| bloom_grows | id:bloom | any | radius r30 | grow(meadow=true) · makeThing(any=["flower","flower2","flower3"] n=2) · fx(id=star sec=0.8) | Everything burst into flower. |
| grow_big | id:growbig | any | b | size(sec=20) · fx(id=magic sec=0.9) | {B} grew and grew. |
| gust_push | id:gust | any | radius r44 max12 (shared cd 0.3s) | launch(alt=5 px=14 away=true chute=false) | The wind blew them back. |
| small_again | #holy | #giant | b | size(sec=0.4 set=true) · fx(id=magic sec=0.6) | {B} went small again. |
| bless_reverts | #holy | any | b | revert · fx(id=magic sec=0.6) | {B} is {B} again. |
| halo_cure | #holy | kind:zombie | b | become(kind=human forget=true) · fx(id=heart sec=0.8) | It turned the zombie back into somebody. |
| bless_skeleton | #holy | kind:skeleton | b (cd 2s) | become(kind=human forget=true) · fx(id=heart sec=0.8) | It turned the skeleton back into somebody. |
| grave_bless | #holy | id:grave | target (cd 5s) | makeThing(any=["flower","flower2","flower3"] n=4) · fx(id=heart sec=0.9) | Flowers grew on the grave. |

### `placed` (26)

| id | A | B | scope | effects | the sentence |
|---|---|---|---|---|---|
| snowman_melts | #fire | id:snowman | target | removeThing · fx(id=block sec=0.8) | Oh no, the snowman! |
| snowman_in_pond | id:snowman | #water | target | removeThing(which=a) · fx(id=block sec=0.8) | The snowman melted into the pond. |
| campfire_cooks | id:fire | #food | target | cook | The campfire cooks the food. |
| food_by_campfire | #food | id:fire | target | cook(which=a) | The campfire cooks the food. |
| snow_golem | #hat | id:snowman | target | removeThing(which=a) · removeThing · spawn(kind=golem tame=true wear=a) · fx(id=magic sec=0.8) | The snowman puts on the hat and stands up. |
| snowman_hat | id:snowman | #hat | target | removeThing · removeThing(which=a) · spawn(kind=golem tame=true wear=b) · fx(id=magic sec=0.8) | The snowman puts on the hat and stands up. |
| fire_melts_snow | #fire | #snow | radius r12 | terrain(to=dirt) · fx(id=block sec=0.5) | The campfire melted the snow. |
| pet_fetch | #toy | any | radius r75 only{kind:dog} (cd 10s, shared cd 2s) | follow(sec=20) · fx(id=heart sec=0.8) | The dog ran after the toy. |
| cat_pounces | #toy | any | radius r60 only{kind:cat} (cd 10s, shared cd 2s) | follow(sec=14 hold=6) · launch(alt=4 px=10 chute=false) · fx(id=star sec=0.6) | The cat pounced on the toy. |
| dragon_hoard | #shiny | any | radius r90 max1 only{kind:dragon} (shared cd 60s) | visit(to={"thingTag":"shiny"} r=100 then=sleep sec=40) | The dragon curled up on its treasure. |
| shiny_bird | #shiny | any | radius r60 only{tags:bird} (cd 15s) | follow(sec=30) · fx(id=heart sec=0.6) | Birds like shiny things. |
| scarecrow_shoos | id:scarecrow | any | radius r60 only{tags:bird} (cd 6s, shared cd 6s) | flee(from=a sec=3) · fx(id=warn sec=0.6) | The scarecrow sent the birds flapping. |
| tower_scatters | #shoot | any | radius r72 max8 only{tags:monster} (shared cd 10s) | flee(from=a sec=5) · fx(id=warn sec=0.6) | The tower made the monsters back away. |
| lantern_ghosts | #light | any | radius r50 only{tags:undead} (shared cd 8s) | flee(from=a sec=4) | The light sent them drifting back. |
| fireflies_to_light | #light | any | radius r70 only{kind:firefly} (shared cd 10s) | follow(sec=20) | The fireflies came to the light. |
| bugs_to_flowers | ids:flower/flower2/flower3/sunflower | any | radius r60 only{tags:bug} (shared cd 8s) | follow(sec=18) · fx(id=heart sec=0.5) | The bugs found the flowers. |
| bird_roost | #roost | any | radius r70 only{tags:bird} (cd 8s) | perchNear(r=70) · sound(id=land) | The birds came to sit on it. |
| crate_spills | #fire | id:crate | target | removeThing · makeThing(any=["item:crown","item:tophat","item:partyhat","item:teddy","item:lute","item:pillow"]) · fx(id=block sec=0.8) · sound(id=boom) | The crate broke open and something fell out. |
| cat_finds_the_fire | #fire | any | radius r60 only{kind:cat} (cd 30s) | follow(sec=12) · calm(sec=20) · fx(id=heart sec=0.8) | The cat has found the warm spot. |
| flowers_love | ids:flower/flower2/flower3 | any | radius r26 max2 (cd 15s, shared cd 30s) | love | They like the flowers. Hearts! |
| sign_calls | id:sign | any | radius r80 only{tags:livestock} (cd 6s, shared cd 6s) | follow(sec=6 hold=8) | They came to see what the sign says. |
| raccoon_shiny | #shiny | any | radius r55 only{kind:raccoon} (shared cd 10s) | follow(sec=14) · fx(id=star sec=0.6) | The raccoon came to look at the sparkle. |
| bench_sitters | id:bench | any | radius r60 max2 only{kind:human} (shared cd 20s) | visit(to={"thing":["bench"]} r=70 hold=10) | They came to sit on the bench. |
| cat_finds_bench | id:bench | any | radius r50 only{kind:cat} (shared cd 30s) | visit(to={"thing":["bench"]} r=60 then=sleep sec=12) | The cat found the bench. |
| otter_plays | #shiny | any | radius r60 only{kind:otter} (shared cd 10s) | follow(sec=14) · launch(alt=3 chute=false) | The otter came to play with it. |
| come_and_look | any | any | radius r50 max3 (needs {"hand":true,"looks":true}, shared cd 8s) | follow(sec=3) |  |

### `meet` (36)

| id | A | B | scope | effects | the sentence |
|---|---|---|---|---|---|
| alien_borrows_cow | kind:alien | kind:cow | b (cd 40s, shared cd 60s) | launch(alt=14 px=14 chute=true) · fx(id=beam sec=0.7) · sound(id=chute) | The alien borrowed a cow for science. |
| alien_likes_metal | #alien | #metal | a (cd 40s) | follow(lead=b sec=15) · fx(id=huh sec=0.6) | The alien wanted a closer look at that. |
| bigfoot_shy | kind:bigfoot | kind:human | a (cd 30s) | visit(to={"thing":["tree","pine","palm"]} r=90 hold=6) | Bigfoot slipped away into the trees. |
| myth_draws_crowd | #myth | kind:human | radius r55 max6 only{kind:human} (cd 45s) | follow(lead=a sec=9 hold=4) · fx(id=star sec=0.7) | Everybody came to see the legend. |
| unicorn_cures_zombie | kind:unicorn | kind:zombie | b (cd 30s) | become(kind=human forget=true) · fx(id=heart sec=1) | The unicorn turned the zombie back into somebody. |
| ghost_meets_dog | kind:ghost | kind:dog | a (cd 12s) | flee(from=b sec=3) · fx(id=warn sec=0.6) | The ghost backed away from the dog. |
| dolphin_bumps_shark | kind:shark | kind:dolphin | a (cd 20s) | flee(from=b sec=2.5) · stun(sec=0.6) | The dolphin bumped the shark aside. |
| whale_school | kind:whale | #fish | radius r55 only{tags:fish,is:tiny} (cd 40s) | follow(lead=a sec=24) | The little fish followed the whale. |
| ducklings_in_a_row | #bird | any | a (cd 30s) | follow(lead=b sec=40) | The little ones walked along behind. |
| lambs_follow | #livestock | any | a (cd 30s) | follow(lead=b sec=40) | The little ones walked along behind. |
| fireflies_round_the_one | kind:firefly | any | a (cd 40s) | follow(lead=b sec=12) · fx(id=star sec=0.5) | The fireflies danced round {B}. |
| bees_chase_bear | kind:bee | kind:bear | b (cd 20s) | flee(from=a sec=3) · fx(id=warn sec=0.6) | The bees chased the bear off. |
| chases_bugs | kind:cat | #bug | a (needs {"night":false}, cd 25s) | follow(sec=6) · launch(alt=4 px=8 chute=false) | The cat jumped at the bug and missed. |
| frog_snaps | kind:frog | #bug | a (cd 20s) | launch(alt=4 px=8 chute=false) · flee(on=b sec=2) | The frog jumped at the bug and missed. |
| shark_thinks_again | kind:shark | kind:pufferfish | b (cd 20s) | size(sec=5 plain=true) · flee(on=a from=b sec=3) | The shark thought better of it. |
| capybara_calms | kind:capybara | #monster | b (cd 30s) | calm(sec=12) · fx(id=heart sec=0.8) | The capybara calmed the monster down. |
| capybara_friends | kind:capybara | any | b (cd 60s) | follow(lead=a sec=20) · fx(id=heart sec=0.5) | {B} wants to sit with the capybara. |
| goose_chases | kind:goose | kind:human | b (cd 40s, shared cd 20s) | flee(from=a sec=2.5) · follow(on=a lead=b sec=4) · sound(id=block) | The goose chased {b} off. |
| goose_honks | kind:goose | kinds:fox/wolf | b (cd 15s) | stun(sec=1) · sound(id=block) | The goose honked and it thought again. |
| skunk_warning | kind:skunk | #monster | b (cd 20s) | flee(from=a sec=4) · fx(id=warn sec=0.8) | The skunk made {b} run. |
| skunk_warning2 | kind:skunk | kinds:fox/wolf/bear/lion/tiger/panther | b (cd 20s) | flee(from=a sec=4) · fx(id=warn sec=0.8) | The skunk made {b} run. |
| raccoon_meets_mimic | kind:raccoon | kind:mimic | a (cd 30s) | launch(alt=5 px=14 away=true chute=false) · flee(from=b sec=3) | That was not a crate. |
| kangaroo_boxes | kind:kangaroo | #monster | b (cd 15s) | launch(alt=6 px=16 away=true chute=false) · sound(id=block) | The kangaroo boxed the monster's ears. |
| giant_scares | #giant | any | radius r44 max6 (shared cd 6s) | flee(from=a sec=2.5) · fx(id=warn sec=0.6) | They ran away from the giant. |
| crow_takes_the_crown | kind:crow | #shiny | b (cd 30s) | give(from=b slot=head) · fx(id=star sec=0.6) · sound(id=block) | The crow took the shiny thing. |
| cat_sees_mouse | kind:cat | kind:mouse | a (cd 20s) | follow(sec=8) · flee(on=b sec=3) · fx(id=block sec=0.5) | The cat has seen the mouse. |
| a_dog_and_a_lamb | kind:dog | kind:sheep | a (cd 45s) | follow(sec=20) · calm(on=b sec=20) · fx(id=heart sec=0.8) | The dog has decided the lamb is its own. |
| dog_barks | kind:dog | #monster | b (cd 12s) | stun(sec=1.2) · fx(id=block sec=0.5) · sound(id=block) | The dog barked and it thought better of it. |
| dog_brings_it | #toy kind:dog | kind:human | a (cd 8s) | dropGear(slot=hand) · fx(id=heart sec=0.8) | {A} brought it back. |
| dog_wags | kind:dog | kind:human | a (cd 40s) | fx(id=heart sec=0.9) | The dog is very pleased to see them. |
| cat_and_dog | kind:cat | kind:dog | b (cd 30s) | follow(lead=a sec=10) · perchNear(on=a r=60) · flee(on=a sec=4) · fx(id=block sec=0.5) | The dog has seen the cat. |
| mouse_and_elephant | kind:mouse | kind:elephant | b (cd 25s) | stun(sec=2.5) · fx(id=block sec=0.8) · sound(id=block) | The elephant has seen the mouse. |
| wool_flock | #wool | kind:sheep | radius r44 only{kind:sheep} (cd 25s) | follow(lead=a sec=20) · fx(id=heart sec=0.8 on=b) | The sheep think {a} is one of them. |
| eats_the_crown | #plant | #livestock | a (cd 10s, shared cd 5s) | eatGear(slot=head) · feed(on=b) · fx(id=heart sec=0.8 on=b) · sound(id=block) | {B} ate the flower crown right off {a}. |
| parrot_and_pirate | wears:piratehat | kind:parrot | b (cd 45s) | follow(lead=a sec=40) · fx(id=heart sec=0.8 on=b) | The parrot wants to ride with the pirate. |
| squirrel_tree | kind:squirrel | kinds:fox/wolf/cat/dog/snake/eagle/owl/bear/lion/tiger/panther | a (cd 12s) | perchNear(r=60) · fx(id=warn sec=0.5) | The squirrel ran up the tree. |

### `enter` (25)

| id | A | B | scope | effects | the sentence |
|---|---|---|---|---|---|
| pig_wallow | kind:pig | #wet | a (cd 20s) | calm(sec=20) · fx(id=heart sec=0.8) | The pig loves the mud. |
| frog_bounce | kind:frog | id:bouncepad | a (cd 3s) | launch(alt=26 px=30 chute=false) · sound(id=boom) | The frog bounced higher than anybody. |
| big_bounce | any | id:bouncepad | radius r40 (cd 4s) | launch(alt=3 chute=false) · launch(alt=8 px=10 chute=false on=a) · sound(id=boom) | BOING. Everybody felt that one. |
| bounce_to_tower | #humanoid | id:bouncepad | a (cd 3s) | perchNear(r=64 alt=18) · sound(id=land) | The bounce pad throws {a} up onto the tower. |
| ice_slide | kinds:seal/penguin/otter | terrain:ice | a (cd 4s) | launch(alt=1 px=30 chute=false) · fx(id=star sec=0.4) | {A} slid across the ice on its tummy. |
| ice_slip | #humanoid | terrain:ice | a (cd 12s) | launch(alt=3 px=18 chute=false) · dropGear(slot=head throw=10) | {A} slipped on the ice. |
| camel_sand | kind:camel | terrain:sand | a (cd 40s) | sleep(sec=6) · fx(id=heart sec=0.8) | The camel settled down in the sand. |
| fish_flop_home | #fish | #dry | a (cd 2s) | launch(alt=2 px=5 chute=false) · visit(to=water r=120) | The fish flopped back to the water. |
| otter_mudslide | kind:otter | #wet | a (cd 6s) | launch(alt=1 px=24 chute=false) · fx(id=block sec=0.5) | The otter slid down the mud. |
| flamingo_one_leg | kind:flamingo | #shallow | a (needs {"night":false}, cd 40s) | sleep(sec=6) · fx(id=heart sec=0.5) | The flamingo stood on one leg. |
| frog_lilypads | kind:frog | terrain:lilypond | a (cd 6s) | launch(alt=5 px=8 chute=false) · fx(id=heart sec=0.4) | The frog hopped from pad to pad. |
| rabbit_clover | kind:rabbit | terrain:clover | a (cd 30s) | launch(alt=3 px=0 chute=false) · fx(id=heart sec=0.5) | The rabbit did a happy jump in the clover. |
| raccoon_opens_crate | kind:raccoon | id:crate | target (cd 25s, shared cd 90s) | removeThing · makeThing(any=["item:crown","item:tophat","item:partyhat","item:teddy","item:lute","item:pillow","item:bunnyears","item:sunglasses","item:flowercrown","item:kite"]) · fx(id=block sec=0.8) · sound(id=boom) | The raccoon got into the crate. |
| kangaroo_bounce | kind:kangaroo | id:bouncepad | a (cd 3s) | launch(alt=30 px=36 chute=false) · sound(id=boom) | The kangaroo bounced clean over the houses. |
| unicorn_steps | kind:unicorn | terrain:grass | radius r6 (cd 8s) | grow(meadow=true) | Flowers came up where the unicorn stepped. |
| ash_footprints | any | #fertile | target (cd 3s) | terrain(to=meadow) · fx(id=magic sec=0.4) | Flowers came up where {a} stepped. |
| lava_slime | kind:slime | terrain:lava | a | become(kind=lavaslime) | The slime walks into the lava and likes it. |
| catapult_launch | any | id:catapult | a (cd 4s) | launch(alt=22 px=44) · sound(id=boom) | The catapult sent {a} flying. |
| robot_pond | #machine | #liquid terrain:water | fill max200 (needs {"walks":true}, cd 10s) | stun(sec=3) · fx(id=block sec=0.6) · sound(id=bolt) | Robots and ponds do not mix. |
| slime_bounce | #slime | id:bouncepad | a (cd 6s) | launch(alt=22 px=30) · spawn(kind=slime tame=false) · sound(id=boom) | It bounced into two. |
| toy_launcher | #toy | id:bouncepad | a (cd 8s) | launch(alt=18 px=26) · sound(id=boom) | The bounce pad flings the teddy too. |
| cactus_ouch | any | id:cactus | a (cd 10s) | stun(sec=0.5) · fx(id=block sec=0.6) · sound(id=block) | Ouch, that cactus is prickly. |
| cat_in_the_crate | kind:cat | id:crate | a (cd 25s) | calm(sec=25) · fx(id=heart sec=0.8) | If it fits, the cat sits in it. |
| giant_mushroom | any | id:mushroom | a (shared cd 200s) | bite · size(sec=45) · fx(id=magic sec=1) · sound(id=boom) | {A} ate the mushroom and grew and grew. |
| hay_landing | any | id:hay | a (needs {"landing":true}, cd 1s) | launch(alt=9 px=8 chute=false) · fx(id=heart sec=0.7) · sound(id=land) | {A} landed in the hay and bounced. |

### `equip` (23)

| id | A | B | scope | effects | the sentence |
|---|---|---|---|---|---|
| frog_prince | id:crown | kind:frog | b (cd 5s) | become(kind=human) · fx(id=magic sec=1) | The crown turned the frog into somebody. |
| crown_parade | id:crown | kind:chicken | radius r70 only{kind:chicken} (cd 5s) | follow · fx(id=heart sec=0.8) | The chickens line up behind the crown. |
| witch_rides | id:broom | kind:witch | b (cd 10s) | perchNear(r=90 alt=18) · fx(id=star sec=0.8) | The witch flew off on her broom. |
| crown_royal | id:crown | any | radius r70 only{sameKind:true} (cd 5s) | follow(lead=b sec=30) · fx(id=heart sec=0.8) | They lined up behind their queen. |
| teddy_hug | id:teddy | #monster | b (WHILE) | calm(sec=3) · fx(id=heart sec=0.5 every=4) |  |
| spring_hop | id:springboots | any | b (cd 2s) | launch(alt=8 px=4 chute=false) · sound(id=land) | BOING. |
| cape_swoosh | id:starcape | any | b (cd 5s) | launch(alt=6 chute=true) · fx(id=star sec=0.8) | {B} swooshed the star cape. |
| monster_suit | id:monstersuit | any | radius r50 only{kind:human} (cd 10s) | flee(from=b sec=2.5) · fx(id=warn sec=0.6) | Everybody ran. It was only {B}. |
| music_undead | #music | any | radius r50 only{tags:undead} (WHILE) | calm(sec=6) · fx(id=heart sec=0.5 every=4) |  |
| music_sway | #music | any | radius r50 only{tags:monster} (WHILE) | calm(sec=6) · fx(id=heart sec=0.5 every=4) |  |
| bellwether | #bell | #livestock | radius r70 only{sameKind:true} (cd 5s) | follow(sec=60) · fx(id=heart sec=0.8) | They follow the one with the bell. |
| flowercrown_unicorn | id:flowercrown | kind:unicorn | radius r20 (cd 10s) | grow(meadow=true) · fx(id=magic sec=0.8) | Flowers burst up round the unicorn. |
| tinfoil_alien | id:tinfoil | kind:alien | b (cd 5s) | calm(sec=45) · fx(id=heart sec=0.8) | The alien trusts the tinfoil hat. |
| beanie_lifts | id:beanie | any | b (cd 5s) | perchNear(r=80 alt=18) · fx(id=star sec=0.7) | The propeller hat lifted {b} onto a roof. |
| bell_pack | #bell | kinds:dog/wolf/horse/deer | radius r70 only{sameKind:true} (cd 5s) | follow(lead=b sec=40) · fx(id=heart sec=0.8) | They follow the one with the bell. |
| chef_cooks | id:chefhat | any | radius r16 (WHILE) | cook · fx(id=heart sec=0.4 every=6) |  |
| bunny_parade | id:bunnyears | any | radius r60 only{kind:rabbit} (cd 5s) | follow(sec=45) · fx(id=heart sec=0.8) | The rabbits hop along behind. |
| party_zombie | id:partyhat | #undead | radius r60 only{tags:undead} (cd 8s) | calm(sec=20) · follow(lead=b sec=20) · fx(id=heart sec=0.6) | The zombies joined the party. |
| party_parade | id:partyhat | any | radius r40 only{kind:human} (cd 8s) | follow(sec=6) · fx(id=heart sec=0.8) | Everybody follows the party hat. |
| lantern_keeps_away | #light | any | radius r30 only{tags:undead} (WHILE) | calm(sec=2) · fx(id=block sec=0.4 every=5) |  |
| crow_roosts_with_it | #shiny | kind:crow | b (WHILE) | perchNear(r=90) · fx(id=star sec=0.6 every=4) | The crow took it somewhere high. |
| throws_the_ball | id:ball | kind:human | b | dropGear(slot=hand throw=44) · sound(id=land) | {B} threw the ball. |
| bucket_douses | id:waterbucket | any | radius r18 (WHILE) | douse · fx(id=block sec=0.4 every=2) |  |

### `clock` (45)

| id | A | B | scope | effects | the sentence |
|---|---|---|---|---|---|
| dawn_zombies_hide | id:dawn | any | radius r9999 only{kind:zombie} | visit(to={"terrainTag":"cover"} r=140 hold=20) · calm(sec=60) | The zombies shuffled off to hide from the sun. |
| dawn_ghosts_graves | id:dawn | any | radius r9999 only{kind:ghost} | visit(to={"thing":["grave"]} r=160 hold=10) · calm(sec=40) | The ghost went back to its grave. |
| dawn_vampires_indoors | id:dawn | any | radius r9999 only{kind:vampire} | visit(to={"thing":["castle","mansion","stonehouse","tower"]} r=170 hold=30) · calm(sec=90) | The vampire hurried out of the light. |
| sunrise_undead | id:dawn | any | radius r9999 only{tags:undead} | stun(sec=3) · fx(id=block sec=0.6) | The morning caught them out. |
| troll_stone | id:dawn | any | radius r9999 only{kind:troll} | become(kind=trollstone) · fx(id=block sec=0.6) | The morning found the troll and turned it to stone. |
| troll_wakes | id:dusk | any | radius r9999 only{kind:trollstone} | become(kind=troll) · fx(id=magic sec=0.6) | The stone cracked and the troll stretched. |
| moon_cat | id:dusk | any | radius r9999 only{kind:cat,tags:magic} | become(kind=panther) · calm(sec=9999) · fx(id=magic sec=0.9) · sound(id=block) | The moon came up, and the cat with the amulet is a panther. |
| moon_wolf | id:dusk | any | radius r9999 only{kind:wolf,tags:magic} | become(kind=werewolf) · calm(sec=9999) · fx(id=magic sec=0.9) | The moon came up and changed the wolf. |
| moon_cat_back | id:dawn | any | radius r9999 only{kind:panther,is:changed} | revert · fx(id=magic sec=0.9) | The sun came up, and the panther is a cat again. |
| moon_wolf_back | id:dawn | any | radius r9999 only{kind:werewolf,is:changed} | revert · fx(id=magic sec=0.9) | The sun came up and it was a wolf again. |
| dusk_named_favourite | id:dusk | any | radius r9999 only{is:named,not:humanoid/enemy} | visit(to=fav r=9999 hold=4 then=sleep until=dawn) | {B} went to the place it likes best. |
| dusk_pets_doorstep | id:dusk | any | radius r9999 only{tags:pet} | visit(to={"thing":["house","cottage","hut","stonehouse","mansion"]} r=160 then=sleep until=dawn orHere=true) | The pets curled up by the door. |
| dusk_herd_barn | id:dusk | any | radius r9999 only{tags:livestock} | visit(to={"thing":["barn"]} r=150 then=sleep until=dawn orHere=true) | The animals headed for the barn. |
| dusk_birds_roost | id:dusk | any | radius r9999 only{tags:bird,is:fly,not:carn} | perchNear(r=110) · sleep(until=dawn) | The birds went up for the night. |
| dusk_rabbits_grass | id:dusk | any | radius r9999 only{kind:rabbit} | visit(to={"terrainTag":"cover"} r=120 then=sleep until=dawn orHere=true) | The rabbits tucked into the tall grass. |
| dusk_deer_meadow | id:dusk | any | radius r9999 only{kind:deer} | visit(to={"terrain":["meadow"]} r=130 hold=12) · calm(sec=20) | The deer came out onto the meadow. |
| dusk_seals_sand | id:dusk | any | radius r9999 only{kind:seal} | visit(to={"terrain":["sand"]} r=100 then=sleep until=dawn orHere=true) | The seals hauled out for the night. |
| dusk_crabs_ashore | id:dusk | any | radius r9999 only{kind:crab} | visit(to={"terrain":["sand"]} r=70 hold=10) | The crabs came ashore in the dark. |
| dusk_fish_shallows | id:dusk | any | radius r9999 only{tags:fish,is:tiny} | visit(to={"terrain":["shallows"]} r=90 hold=10) | The little fish gathered in the shallows. |
| dusk_owls_wake | id:dusk | any | radius r9999 only{kind:owl} | launch(alt=6 px=14 chute=false) | The owl opened its eyes. |
| dusk_bats_out | id:dusk | any | radius r9999 only{kind:bat} | launch(alt=8 px=20 chute=false) | The bats came out. |
| dawn_owls_roost | id:dawn | any | radius r9999 only{kind:owl} | perchNear(r=110) · sleep(until=dusk) | The owl went to bed in the morning. |
| dawn_bats_roost | id:dawn | any | radius r9999 only{kind:bat} | perchNear(r=100) · sleep(until=dusk) | The bats tucked themselves up high. |
| dawn_mimic_sleeps | id:dawn | any | radius r9999 only{kind:mimic} | sleep(until=dusk) |  |
| dawn_armor_guards | id:dawn | any | radius r9999 only{kind:livingarmor} | visit(to={"thing":["castle","tower","statue"]} r=160 then=sleep until=dusk orHere=true) | The empty armor stood still all day. |
| dawn_gargoyles_roost | id:dawn | any | radius r9999 only{kind:gargoyle} | perchNear(r=130) · sleep(until=dusk) | The gargoyle turned to stone on the roof. |
| dawn_hens_crow | id:dawn | any | radius r9999 only{kind:chicken} | launch(alt=3 chute=false) · sound(id=land) | The hens told everybody it was morning. |
| dawn_fish_jump | id:dawn | any | radius r9999 only{tags:fish,is:tiny} | launch(alt=6 px=4 chute=false) | The fish jumped for the morning sun. |
| dawn_crabs_home | id:dawn | any | radius r9999 only{kind:crab} | visit(to=water r=90) | The crabs scuttled back to the water. |
| dawn_penguins_ice | id:dawn | any | radius r9999 only{kind:penguin} | visit(to={"terrain":["ice"]} r=120 hold=8) | The penguins hurried onto the ice. |
| dawn_demons_warm | id:dawn | any | radius r9999 only{kind:demon} | visit(to=fire r=150 hold=20) · calm(sec=60) | The demon went to sit somewhere hot. |
| dawn_imps_perch | id:dawn | any | radius r9999 only{kind:imp} | perchNear(r=90) · calm(sec=60) | The imps found somewhere high to sit. |
| dawn_slimes_bounce | id:dawn | any | radius r9999 only{tags:slime} | visit(to={"thing":["bouncepad"]} r=140) | The slimes went to find the bounce pad. |
| dusk_day_bugs_go | id:dusk | any | radius r9999 only{tags:bug} | vanish |  |
| dusk_fireflies_rise | id:dusk | any | radius r8 (needs {"raining":false}) | spawn(kind=firefly n=2 spread=10 cap=12) | The fireflies came out. |
| dusk_fireflies_flowers | id:dusk | any | radius r8 (needs {"raining":false}) | spawn(kind=firefly n=2 spread=10 cap=12) |  |
| dawn_fireflies_go | id:dawn | any | radius r9999 only{kind:firefly} | vanish |  |
| dawn_bees_out | id:dawn | any | radius r8 | spawn(kind=bee n=1 cap=8) |  |
| dawn_butterflies | id:dawn | any | radius r8 | spawn(kind=butterfly n=1 cap=8) | The butterflies came out with the sun. |
| dusk_otters_raft | id:dusk | any | radius r9999 only{kind:otter} | visit(to={"terrain":["shallows","lilypond"]} r=120 then=sleep until=dawn orHere=true) | The otters floated off to sleep together. |
| dusk_flamingos | id:dusk | any | radius r9999 only{kind:flamingo} | visit(to={"terrain":["shallows","lilypond"]} r=140 then=sleep until=dawn orHere=true) | The flamingos gathered in the shallows. |
| dawn_raccoons_bed | id:dawn | any | radius r9999 only{kind:raccoon} | visit(to={"thing":["hollowlog","tree","pine"]} r=140 then=sleep until=dusk orHere=true) | The raccoon went to bed in the morning. |
| dawn_drink | id:dawn | any | radius r9999 | visit(to=water r=120 calm=20) | They went down to the water in the morning. |
| festival | id:dusk | any | radius r110 max12 only{kind:human} (needs {"count":{"kind":"human","r":90,"min":6}}, shared cd 900s) | give(item=partyhat max=3) · visit(to=fire r=110 hold=20) · fx(id=star sec=0.9) | The village had a party. |
| dusk_fireside | id:dusk | any | radius r9999 only{kind:human} | visit(to=fire r=90 hold=8) | They gathered at the fire as the light went. |

### `hit` (23)

| id | A | B | scope | effects | the sentence |
|---|---|---|---|---|---|
| foil_beam | id:beam | #foil | a (cd 2s) | deflect · follow(sec=60) · fx(id=huh sec=0.8) | The beam slides off the tinfoil hat. |
| pillow_sleepy | id:pillow | any | b (cd 2s) | sleep(sec=8) · fx(id=heart sec=0.6) | The pillow sent {b} to sleep. |
| pan_bonk | id:pan | any | b (cd 2s) | launch(alt=5 px=12 away=true chute=false) · dropGear(slot=head throw=18 away=true) · sound(id=block) | BONK. |
| bubble_float | id:bubblewand | any | b (cd 2s) | launch(alt=12 px=8 chute=true) · calm(sec=6) · fx(id=star sec=0.6) | The bubble carried {b} off. |
| chicken_squeak | id:rubberchicken | any | b (cd 1s) | launch(alt=3 chute=false) · sound(id=land) | SQUEAK. |
| broom_sweep | id:broom | any | b (cd 2s) | launch(alt=2 px=22 away=true chute=false) · sound(id=chute) | The broom swept {b} out of the way. |
| sunstaff_cures | id:sunstaff | kinds:zombie/skeleton/mummy/vampire | b (cd 2s) | become(kind=human forget=true) · fx(id=heart sec=0.9) | The sunlight brought {b} back. |
| fan_blows | id:windfan | any | b (cd 2s) | launch(alt=5 px=20 away=true chute=false) · dropGear(slot=head throw=20 away=true) · sound(id=chute) | The fan blew {b} over backwards. |
| umbrella_parry | any | wears:umbrella | b (cd 4s) | deflect · dropGear(slot=hand throw=28 away=true) · sound(id=chute) | The umbrella caught it and flew away. |
| ball_bounces_blow | any | wears:ball | b (cd 3s) | deflect · dropGear(slot=hand throw=24 away=true) | The blow bounced off the ball. |
| balloon_escape | any | wears:balloonpack | b (cd 4s) | deflect · launch(alt=18 px=12 chute=true) · sound(id=chute) | The balloons carried {b} out of trouble. |
| puffer_puffs | any | kind:pufferfish | b (cd 3s) | deflect · size(sec=5 plain=true) · fx(id=block sec=0.6) | The pufferfish puffed up huge. |
| hedgehog_curls | any | kind:hedgehog | b (cd 5s) | deflect · stun(sec=1.2) · fx(id=block sec=0.5) | The hedgehog curled into a ball. |
| shell_hide | any | #shell | b (cd 6s) | deflect · launch(alt=2 px=16 away=true chute=false) · fx(id=block sec=0.5) | It tucked in and rolled away. |
| dragon_freezes | #ice | kind:dragon | b (cd 2s) | become(kind=icedragon) · fx(id=magic sec=0.8) · sound(id=freeze) | The dragon froze into an ice dragon. |
| icedragon_thaws | #fire | kind:icedragon | b (cd 2s) | become(kind=dragon) · fx(id=magic sec=0.8) | The ice dragon thawed out. |
| slime_catches_fire | #fire | kind:slime | b (cd 2s) | become(kind=lavaslime) · fx(id=magic sec=0.8) | The slime caught fire and liked it. |
| lavaslime_cools | #ice | kind:lavaslime | b (cd 2s) | become(kind=slime) · sound(id=freeze) | The lava slime cooled back down. |
| robot_supercharge | #electric | kind:robot | b (cd 20s) | size(sec=15) · fx(id=bolt sec=0.6) · sound(id=bolt) | The lightning supercharged the robot. |
| magic_slime_swell | #magic | kind:slime | b (cd 20s) | size(sec=18) · fx(id=magic sec=0.9) | Magic made the slime enormous. |
| giant_punt | #giant | any | b (cd 4s) | deflect · launch(alt=20 px=26 away=true) · sound(id=boom) | The giant sent {b} flying. |
| knocked_off | any | #hat | b (cd 12s) | dropGear(slot=head) · sound(id=block) | That knocked the hat clean off. |
| wizard_flowers | #magic | any | radius r10 (cd 3s) | grow(meadow=true) · fx(id=magic sec=0.6) | Flowers came up where the magic landed. |

## 5.3 Creatures (106)

diet: herb grazes, carn hunts, omni both, none eats nothing. Flags: fly, water (lives only in water), amph (both), humanoid (wears gear, uses weapons, lives in houses), enemy (on the Enemies tab, hostile), pet, sociable (herds), heals, lays (eggs), snow, lavaProof, fearsFire, ally.

| id | name | tags | diet | size | flags | hunts |
|---|---|---|---|---|---|---|
| human | Human | humanoid | omni |  | humanoid sociable | sheep rabbit chicken pig goat deer duck cow |
| yeti | Yeti | myth cold humanoid | none | big | humanoid heals snow ally |  |
| bigfoot | Bigfoot | myth humanoid | none | big | humanoid heals ally |  |
| unicorn | Unicorn | myth | none |  | sociable heals ally |  |
| dog | Dog | pet | none |  | pet sociable ally |  |
| cat | Cat | pet | carn | small | pet sociable | mouse rat |
| sheep | Sheep | livestock | herb |  | sociable |  |
| goat | Goat | livestock | herb |  | sociable |  |
| pig | Pig | livestock | herb |  | sociable |  |
| cow | Cow | livestock | herb | big | sociable |  |
| horse | Horse | livestock | herb | big | sociable |  |
| deer | Deer |  | herb |  | sociable |  |
| camel | Camel |  | herb | big | sociable |  |
| elephant | Elephant |  | herb | big | sociable |  |
| rhino | Rhino |  | herb | big |  |  |
| boar | Boar |  | herb |  |  |  |
| rabbit | Rabbit |  | herb | small | sociable |  |
| chicken | Chicken | bird livestock | herb | small | sociable lays |  |
| mouse | Mouse |  | herb | tiny | sociable |  |
| rat | Rat |  | herb | small | sociable |  |
| squirrel | Squirrel |  | herb | small | sociable |  |
| hedgehog | Hedgehog |  | herb | small |  |  |
| fox | Fox |  | carn |  |  | rabbit chicken mouse squirrel hedgehog frog duck crow ... |
| wolf | Wolf |  | carn |  | fearsFire | rabbit chicken mouse squirrel hedgehog frog duck crow ... |
| bear | Bear |  | omni | big | fearsFire | sheep goat pig deer penguin seal human |
| polarbear | Polar bear | cold | carn | big | amph snow | seal penguin human fish clownfish goldfish |
| gorilla | Gorilla |  | herb | big | sociable |  |
| lion | Lion |  | carn | big | fearsFire | sheep goat pig deer penguin seal cow horse ... |
| tiger | Tiger |  | carn | big | fearsFire | sheep goat pig deer penguin seal cow horse ... |
| panther | Panther |  | carn |  | fearsFire | sheep goat pig deer penguin seal rabbit chicken ... |
| snake | Snake |  | carn |  |  | mouse rat frog rabbit |
| eagle | Eagle | bird | carn |  | fly | rabbit mouse rat snake squirrel fish clownfish goldfish |
| owl | Owl | bird | carn | small | fly | mouse rat squirrel |
| parrot | Parrot | bird | herb | small | fly sociable |  |
| crow | Crow | bird | herb | small | fly sociable |  |
| fish | Fish | fish | filter | tiny | water |  |
| clownfish | Clownfish | fish | filter | tiny | water |  |
| goldfish | Goldfish | fish | filter | tiny | water |  |
| piranha | Piranha | fish | carn | small | water | fish clownfish goldfish duck frog human |
| shark | Shark | fish | carn | big | water | fish clownfish goldfish squid seal penguin duck turtle ... |
| dolphin | Dolphin | fish | carn | big | water sociable | fish clownfish goldfish |
| whale | Whale | fish | filter | big | water |  |
| jellyfish | Jellyfish | sealife | filter | tiny | water |  |
| octopus | Octopus | sealife | carn |  | water | crab fish clownfish goldfish |
| squid | Squid | sealife | carn |  | water | fish clownfish goldfish |
| eel | Eel | fish | carn |  | water | fish clownfish goldfish |
| seahorse | Seahorse | fish | filter | tiny | water |  |
| crab | Crab | shell sealife | herb | tiny | amph |  |
| frog | Frog |  | herb | tiny | amph |  |
| turtle | Turtle | shell sealife | herb | small | amph |  |
| duck | Duck | bird livestock | herb | small | amph sociable lays |  |
| penguin | Penguin | bird cold | herb | small | amph sociable snow |  |
| seal | Seal | sealife cold | carn |  | amph sociable | fish clownfish goldfish |
| crocodile | Crocodile | sealife | carn | big | amph | sheep goat pig deer penguin seal fish clownfish ... |
| hippo | Hippo | sealife | herb | big | amph |  |
| kraken | Kraken | sealife myth monster | carn | big | water | all |
| seaserpent | Sea serpent | fish monster | carn | big | water | all |
| zombie | Zombie | undead humanoid | none |  | humanoid enemy | human |
| goblin | Goblin | monster humanoid | none |  | humanoid enemy | human |
| skeleton | Skeleton | undead humanoid | none |  | humanoid enemy | human |
| archer | Bone archer | humanoid | none |  | humanoid enemy | human |
| orc | Orc | monster humanoid | none |  | humanoid enemy | human |
| troll | Troll | monster humanoid | none | big | humanoid enemy | human |
| trollstone | Stone Troll | monster | none | big |  |  |
| ogre | Ogre | monster humanoid | none | big | humanoid enemy | human |
| bandit | Bandit | humanoid | none |  | humanoid enemy | human |
| pirate | Pirate | humanoid | none |  | humanoid enemy | human |
| darkknight | Dark knight | humanoid | none |  | humanoid enemy | human |
| ninja | Ninja | humanoid | none |  | humanoid enemy | human |
| vampire | Vampire | undead humanoid | none |  | humanoid enemy | human |
| witch | Witch | humanoid | none |  | humanoid enemy | human |
| wizard | Evil wizard | humanoid | none |  | humanoid enemy | human |
| mummy | Mummy | undead humanoid | none |  | humanoid enemy | human |
| demon | Demon | monster humanoid | none |  | humanoid enemy | human |
| alien | Alien | alien humanoid | none |  | humanoid enemy | human |
| ufo | UFO | machine metal | none | big | fly enemy ufo |  |
| robot | Robot | machine metal humanoid | none |  | humanoid enemy | human |
| golem | Golem | myth monster humanoid | none | big | humanoid enemy | human |
| werewolf | Werewolf | myth monster | none |  | enemy | human |
| spider | Giant spider | monster | none | small | enemy | human |
| scorpion | Scorpion | monster | none | small | enemy | human |
| bat | Vampire bat | monster | none | small | fly enemy | human |
| imp | Imp | monster humanoid | none | small | fly humanoid enemy | human |
| slime | Slime | slime monster | none |  | enemy | human |
| lavaslime | Lava slime | slime fire hot monster | none |  | enemy lavaProof | human |
| ghost | Ghost | undead | none |  | fly enemy | human |
| wraith | Wraith | undead | none |  | fly enemy | human |
| dragon | Dragon | myth | carn | big | fly | all |
| icedragon | Ice dragon | myth cold | carn | big | fly snow | all |
| firefly | Firefly | bug light | none | tiny | fly sociable |  |
| bee | Bee | bug | none | tiny | fly sociable |  |
| butterfly | Butterfly | bug | none | tiny | fly |  |
| ant | Ant | bug | none | tiny | sociable |  |
| otter | Otter | sealife | carn | small | amph sociable | fish goldfish clownfish |
| flamingo | Flamingo | bird sealife | filter |  | amph sociable |  |
| pufferfish | Pufferfish | fish | filter | small | water |  |
| capybara | Capybara |  | herb |  | amph sociable |  |
| goose | Goose | bird livestock | herb | small | amph sociable |  |
| koi | Koi | fish shiny | filter | small | water sociable |  |
| raccoon | Raccoon |  | omni | small |  |  |
| skunk | Skunk |  | omni | small |  |  |
| woodpecker | Woodpecker | bird | herb | small | fly |  |
| kangaroo | Kangaroo |  | herb |  | sociable |  |
| mimic | Mimic | monster | none |  | enemy | human |
| livingarmor | Living armor | monster machine metal humanoid | none |  | humanoid enemy | human |
| gargoyle | Gargoyle | monster | none |  | fly enemy | human |

## 5.4 Things she can build (54)

Flags: block (cannot be walked through), home N (N sleep there), beds N, perch (a bird or a parachute can land on it), food N (servings, grows back), fire, light, water, low, flat, hatch.

| id | name | tags | flags |
|---|---|---|---|
| house | House | roost | perch, home 3 |
| cottage | Cottage | roost | perch, home 3 |
| hut | Straw hut | flammable roost | perch, home 2 |
| stonehouse | Stone house | roost | perch, home 4 |
| mansion | Mansion | roost | perch, home 6, beds 3 |
| barn | Barn | roost | perch, home 5, beds 0 |
| castle | Castle | roost | perch, home 8, beds 4 |
| tent | Tent | flammable | home 2 |
| igloo | Igloo |  | home 2 |
| tower | Archer tower | shoot roost | block, perch, shoot |
| wall | Stone wall |  | block |
| fence | Fence | flammable | block |
| bridge | Bridge | flammable | flat, bridge |
| spikes | Spike trap |  | flat, spikes |
| fire | Campfire | fire hot flammable | block, fire, light |
| torch | Torch | fire hot | block, light |
| lantern | Lantern | light | block, light |
| bush | Berries | flammable plant food | low, food 1 |
| appletree | Apple tree | flammable plant food roost | perch, food 1 |
| wheat | Wheat | flammable plant food | flat, food 1 |
| mushroom | Mushrooms | plant food | flat, food 1 |
| tree | Tree | flammable plant roost | block, perch |
| pine | Pine | flammable plant roost | block, perch |
| palm | Palm | flammable plant roost | block, perch |
| cactus | Cactus | plant roost | perch, low |
| boulder | Boulder | stone roost | block, perch |
| flower | Flowers | plant | flat |
| flower2 | Blue flowers | plant | flat |
| flower3 | White flowers | plant | flat |
| well | Well | stone roost | block, perch, water |
| fountain | Fountain | liquid water roost | block, perch, water |
| statue | Statue | stone roost | block, perch |
| hay | Haystack | flammable plant food | low, food 1 |
| barrel | Barrel | flammable | block, water |
| crate | Crate | flammable | low |
| sign | Sign | flammable | block |
| scarecrow | Scarecrow | flammable roost | block, perch, scare |
| grave | Grave | stone | flat, grave |
| snowman | Snowman | cold snow | block |
| bouncepad | Bounce pad | bouncy | flat, low |
| catapult | Catapult | launcher flammable |  |
| flag | Village flag | flammable roost | block, perch, village |
| crystal | Crystal | stone magic shiny light roost | block, perch, light |
| rod | Lightning rod | metal rod | block, rod |
| reeds | Reeds | plant flammable | flat |
| egg | Egg |  | flat, low, hatch |
| sunflower | Sunflower | plant flammable | low |
| dandelion | Dandelion | plant flammable | flat |
| honeyhive | Beehive | flammable | block, food 1 |
| anthill | Anthill | dry | low |
| hollowlog | Hollow log | flammable roost | perch, low |
| sapling | Sapling | plant flammable | flat, hatch |
| cherrytree | Cherry tree | flammable plant food roost | perch, food 1 |
| bench | Bench | flammable | perch, low |

## 5.5 Gear (45): worn, one per slot

| id | name | slot | tags | what it does already |
|---|---|---|---|---|
| shield1 | Wood shield | hand | metal | shield, shieldCol |
| shield2 | Iron shield | hand | metal | shield, shieldCol |
| shield3 | Magic shield | hand | metal | shield, shieldCol |
| armor1 | Leather armor | body | metal | armor |
| armor2 | Iron armor | body | metal | armor |
| armor3 | Diamond armor | body | metal | armor |
| boots | Speed boots | feet |  | boots |
| amulet | Healing amulet | charm | shiny magic | amulet |
| wings | Wings | back |  | wings |
| snorkel | Snorkel | head |  | snorkel |
| crown | Crown | head | hat shiny | crown |
| tophat | Top hat | head | hat | worn |
| teddy | Teddy bear | hand | toy | teddy |
| ball | Ball | hand | toy bouncy | worn |
| tinfoil | Tinfoil hat | head | hat foil | worn |
| piratehat | Pirate hat | head | hat cloth | worn |
| chefhat | Chef hat | head | hat cloth | worn |
| partyhat | Party hat | head | hat cloth | worn |
| wizardhat | Wizard hat | head | hat magic | worn |
| vikinghelm | Viking helmet | head | hat metal | worn |
| ironhelm | Iron helmet | head | hat metal | worn |
| divinghelm | Diving helmet | head | hat metal glass | snorkel |
| bunnyears | Bunny ears | head | hat cloth | worn |
| sunglasses | Sunglasses | head | hat shiny glass | worn |
| beanie | Propeller beanie | head | hat machine | worn |
| vanehat | Weather-vane hat | head | hat metal wind | worn |
| flowercrown | Flower crown | head | hat plant | worn |
| bellcollar | Bell collar | charm | bell shiny metal | worn |
| scarf | Scarf | body | cloth | worn |
| bucket | Bucket | head | flammable | worn |
| sheepsuit | Sheep costume | body | wool cloth | costume |
| chutepack | Parachute pack | back | cloth | parachute |
| shell | Turtle shell | back | shell | shell |
| kite | Kite | back | cloth wind | kite |
| umbrella | Umbrella | hand | cloth | umbrella |
| lamp | Lamp | hand | light fire | light |
| fishingrod | Fishing rod | hand | flammable | rod |
| lute | Lute | hand | music flammable | lute |
| waterbucket | Water bucket | hand | water liquid | water |
| leadboots | Lead boots | feet | metal | leadboots |
| bracelet | Friendship bracelet | charm | cloth shiny | bracelet |
| springboots | Spring boots | feet | bouncy | worn |
| starcape | Star cape | back | cloth magic shiny | worn |
| monstersuit | Monster suit | body | cloth monster | worn |
| balloonpack | Balloon pack | back | cloth | worn |

## 5.6 Weapons (40)

| id | name | tags | dmg | notes |
|---|---|---|---|---|
| sword | Sword | metal | 3 |  |
| katana | Katana | metal | 4 |  |
| rapier | Rapier | metal | 2 |  |
| flamesword | Flame sword | fire metal | 6 |  |
| icesword | Ice sword | ice metal | 5 |  |
| lasersword | Laser sword |  | 8 |  |
| dagger | Dagger |  | 1 |  |
| axe | Axe | metal | 4 |  |
| battleaxe | Battle axe | metal | 7 |  |
| pickaxe | Pickaxe |  | 3 |  |
| hammer | Hammer | metal | 6 |  |
| mace | Mace | metal | 5 |  |
| club | Club |  | 2 |  |
| pan | Frying pan |  | 3 |  |
| whip | Whip |  | 2 | ranged |
| spear | Spear | metal | 2 | ranged |
| lance | Lance | metal | 4 | ranged |
| halberd | Halberd | metal | 5 | ranged |
| trident | Trident | metal | 4 | ranged |
| pitchfork | Pitchfork | metal | 2 | ranged |
| scythe | Scythe | metal | 5 |  |
| bow | Bow |  |  | ranged |
| longbow | Longbow |  |  | ranged |
| crossbow | Crossbow |  |  | ranged |
| stars | Ninja stars |  |  | ranged |
| boomerang | Boomerang |  |  | ranged |
| staff | Magic staff | magic |  | ranged |
| firestaff | Fire staff | fire |  | ranged |
| icestaff | Ice staff | ice |  | ranged |
| wand | Wand | magic |  | ranged |
| blaster | Blaster | electric |  | ranged |
| musket | Musket | fire metal |  | ranged |
| cannon | Cannon | fire metal |  | ranged |
| flamethrower | Flamethrower | fire |  | ranged |
| pillow | Pillow | cloth | 0 | harmless |
| bubblewand | Bubble wand | magic | 0 | harmless |
| rubberchicken | Rubber chicken | toy | 0 | harmless |
| broom | Broom |  | 1 |  |
| sunstaff | Sun staff | holy hot magic |  | harmless, ranged |
| windfan | Wind fan | wind |  | harmless, ranged |

## 5.7 Powers (25)

| id | name | tags | how it is used |
|---|---|---|---|
| inspect | Inspect |  | target, radius 14 px |
| bolt | Lightning | electric | tap, radius 12 px |
| heal | Heal | holy | target, radius 20 px |
| sunbeam | Sunbeam | holy hot | tap, radius 44 px |
| seeds | Seeds | plant | tap, radius 40 px |
| gust | Gust | wind | tap, radius 44 px |
| bubbles | Bubbles | magic | tap, radius 30 px |
| bloom | Bloom | plant | tap, radius 30 px |
| bless | Bless | holy | target, radius 20 px |
| growbig | Grow big | magic | target, radius 20 px |
| clone | Clone | magic | target, radius 20 px |
| love | Love | magic | tap, radius 24 px |
| freeze | Freeze | ice cold | tap, radius 22 px |
| storm | Storm | electric water | tap, radius 60 px |
| fireball | Fireball | fire hot | tap, radius 11 px |
| meteor | Meteor | fire hot | tap, radius 22 px |
| twister | Tornado | wind | tap, radius 16 px |
| rain | Rain | water | instant |
| feast | Feed all | food | instant |
| time | Day / night | magic | instant |
| quake | Earthquake | earth | instant |
| smite | Smite enemies | electric | instant |
| protect | Safe |  | toggle |
| petsSafe | Pets safe |  | toggle |
| gentle | Gentle |  | toggle |

## 5.8 Ground (22)

| id | name | tags | notes |
|---|---|---|---|
| grass | Grass | flammable plant | graze |
| dirt | Dirt | dry |  |
| sand | Sand | dry sand |  |
| path | Stone path | dry |  speed x1.3 |
| water | Water | liquid water | deep |
| swamp | Swamp | liquid water |  speed x0.5 |
| rock | Mountain |  |  |
| snow | Snow | cold snow | cold speed x0.6 |
| ice | Ice | cold ice | cold |
| lava | Lava | liquid hot fire |  |
| tallgrass | Tall grass | plant flammable cover |  speed x0.9 |
| meadow | Meadow | plant flammable sweet | graze |
| ash | Ash | dry fertile |  |
| mud | Mud | wet earth |  speed x0.7 |
| shallows | Shallows | liquid water shallow | shallow speed x0.5 |
| crops | Crops | plant flammable |  grows to cropsmid |
| cropsmid | Crops | plant flammable |  grows to cropsripe |
| cropsripe | Ripe crops | plant flammable food | graze, crop |
| glass | Glass | glass shiny |  speed x1.2 |
| lilypond | Lily pond | liquid water shallow plant | shallow speed x0.5 |
| clover | Clover | plant sweet flammable | graze |
| moss | Moss | plant cover |  speed x0.9 |

## 5.9 What is on the FIRST SCREEN of each tray tab (12 at most; everything else is one tap further, under Everything)

- **land** (20 in all): grass, meadow, tallgrass, dirt, sand, path, water, swamp, rock, snow, ice, lava
- **creature** (43 in all): human, dog, cat, sheep, cow, pig, chicken, horse, rabbit, wolf, bear, unicorn
- **water** (28 in all): fish, goldfish, dolphin, shark, whale, octopus, crab, frog, turtle, duck, penguin, crocodile
- **enemy** (35 in all): zombie, goblin, skeleton, orc, troll, ogre, pirate, witch, ghost, alien, ufo, dragon
- **weapon** (40 in all): sword, bow, axe, spear, hammer, dagger, staff, wand, pan, pillow, bubblewand, rubberchicken, pitchfork, crossbow, cannon
- **gear** (45 in all): crown, tophat, wings, starcape, teddy, ball, tinfoil, partyhat, vikinghelm, bunnyears, flowercrown, sheepsuit, umbrella
- **build** (54 in all): house, hut, castle, tower, fence, bridge, fire, tree, bush, mushroom, flower, flag
- **village** (2 in all): claim, unclaim
- **power** (25 in all): heal, bless, love, rain, sunbeam, seeds, gust, storm, fireball, bubbles, freeze, time, protect

## 5.10 The village, as data

One village per world. It holds at most 12 people. It makes for nothing: flag, fire, wheat, well; everything else costs 2 food from its store. Ages and what each builds, in order:

- **camp**: fire, wheat, hut, wheat, hut, hut
- **hamlet**: house, well, wheat, house, barn
- **town**: stonehouse, fountain, wheat, cottage, tower, stonehouse
- **kingdom**: mansion, statue, castle

It learns from how its people die: enough killed by monsters and everybody is handed a spear; enough drowned and everybody gets a snorkel.

## 5.11 The scrapbook stickers that exist (40): silent, a picture of something that happened

A baby arrived · They found each other · Something ran for it · Off to find something to eat · Home before dark · Somebody was lost · It got back up · Beamed up · Put down again · Saved from the saucer · Stuck the landing · The whole pond lit up · A fire that spread · A bridge made of ice · A parade of chickens · Dinner is served · Bounced onto a tower · The snowman stood up · A slime that liked the lava · It rained fish · An ogre with a teddy · The beam slid off · A cow went flying · Put something in the world · Painted the ground · Built something · Dressed somebody up · Picked somebody up · Took something back · Gave somebody a name · Started over · Called the lightning · Dropped a meteor · Made a tornado · Made it rain · Froze something · Day two · A week gone by · A flock of twelve · Twenty things standing



---

# APPENDIX B. THE GRAPHICS BRIEF, WHOLE (lucidwinds.com/docs/briefs/ASTRA-GRAPHICS-BRIEF.md)

# SKY WOLF STUDIO: a graphics brief for an outside brain (24 September 2026)

You are being asked by the director of a one person game studio, and your answer will be read and acted on by the
studio's coding model (Claude), which does all the building. The director's own words: "how we could have astra help
with graphics and stuff too, using just the twenty dollar plan, to explain how to get more and better results
efficiently, because it's smarter in some ways." So: do not make art here. Teach the method. Be concrete, be
specific to the pipelines below, and give prompts and checklists the coding model can run tomorrow.

## What the studio ships and how its art is made today

Everything is a web game (vanilla JavaScript, no build step), sold at $0.99 on Google Play and free on the studio's
own arcade. The art pipelines that exist, and what is wrong with each:

1. **TUMBLE, a 3D sock sorting game (three.js).** Socks are painted PROCEDURALLY into a 256 x 256 texture tile from a
   recipe: layers of flat signed distance shapes (circle, box, ellipse, polygon, text) in a small palette, over a
   knit noise, wrapped round a sock mesh. There are 2,000 pinned procedural designs (they must never change) and
   103 "hero" socks with hand written recipes (10 to a themed pack: Plant Parent Support Group, Gas Station, Cursed,
   Pet Hair Counts as Fiber, Found in 1998...). **The problem:** the hero socks with small, pale, thin lined emblems
   read as specks at play size (a sock on a phone's table is about 70 px tall). The director: "they kind of look
   like s***... what would be the best move to make improvement so these all look better?" The coding model's
   plan: (a) a painter pass for hero recipes only (bigger emblems, ink that holds at 70 px, knit grain through the
   fills, a little shading), and (b) a DECAL route: a painted PNG per hero, laid over the recipe's emblem place,
   generated by an image model from one style paragraph, in sets of ten.
   Also in TUMBLE: thirty "pocket finds" (a screw, a bobby pin, a guitar pick) drawn as flat recipes, with a
   painted PNG route already wired (512 x 512, transparent, one style paragraph pasted at the top of every prompt).
   The room's decor is three.js primitives (a mug is a cylinder and a torus). A cat is coming in from another of
   the studio's games as a rigged GLB.
2. **TINY WORLD, a pixel life sandbox for a five year old.** 8 x 8 pixel sprites, 16 colours, drawn by hand in data.
   106 creatures. **The problem:** several new sprites read as "the same brown lump" at play size; a rubber chicken
   read as a duckling; a gargoyle as a bat.
3. **3D characters (Meshy).** The studio has used Meshy for meshes (a cat with nine animations, exported with
   gltfpack, meshopt compressed, 715 KB). Blender is available but the director is not a 3D artist. Rigging and
   animation sets are the expensive part: a character is not done when it can hop; it needs idle, walk, sleep,
   react.
4. **Store art** (Google Play screenshots at 1080 x 1920, feature graphics at 1024 x 500, icons) is rendered from
   the games themselves in headless Chrome, and it is fine.

Budgets that bind everything: a game's bundle stays under about 2 MB (assets load lazily on top); a phone scene
stays under 120 draw calls; every asset is looked at on a real Pixel 9 at 412 px wide before it ships; no art is
ever claimed to be hand painted; nothing is uploaded to a showcase that bans AI art without checking its policy.

Tools on hand: Meshy (paid), ChatGPT images, Midjourney has been used, Blender, ImageMagick, headless Chrome, Node.
The director generates images on his phone and drops files into a folder; the coding model wires them.

## What I want back, in this order

**A. The sock decals: the exact method.** One style paragraph for 103 sock emblems that will look like ONE artist's
work across ten separate generation sessions (knit or embroidered look? flat print? what words make an image model
keep the same edge weight and palette?), the prompt skeleton with the slots to fill per hero (name, subject, three
colours), the size and background to ask for, how to get a transparent background reliably, how to batch ten and
review them side by side, and the three things that go wrong with small emblem generation and how to catch them.
Then: is a decal even the best move, or would you regenerate the whole 256 x 256 tile (a flat rectangle that wraps
round the sock, cuff at the top, toe at the bottom) per hero? Say which and why, for a phone at 70 px.

**B. A procedural upgrade that costs no art.** The recipes are code. What five changes to a flat shape painter make
small emblems read at 70 px (edge weight, contrast floor, minimum size, a shading gradient, knit through the fill,
anything from how real intarsia and embroidery read at a distance)? Be specific enough to implement.

**C. Pixel sprites at 8 x 8.** The rules for a sprite that reads at 8 x 8 in 16 colours (silhouette first, one
contrast edge, where the eye goes), how to use an image model to DRAFT a sprite sheet that a human then reduces, or
whether that is a waste of time at this size, and a checklist to run on a sheet of 106 (twins, lumps, wrong animal).

**D. Meshy, efficiently.** Given a $20 a month image plan and Meshy credits: the cheapest path from "I want a good
cat that sleeps, stretches and walks" to a rigged GLB under 1 MB with clean animation clips, what to write in the
prompt, what to reject before spending on rigging, and how to check bone axes and scale before it goes in a game.
What should NEVER be done in Meshy (and done in Blender instead)?

**E. Room decor that "really shows up".** The director: "I only want to buy something that really shows up... the
rug, dryer, music, some posters and stuff that sit around the room need to legit be good." For three.js primitives
with canvas textures: what makes a rug, a poster, a lamp or a dryer read as a distinct THING at 40 to 120 px on a
phone, and what is wasted effort at that size?

**F. A review method.** Twelve automated gates once went green while a floor was see through. Give the coding model
a short "look at it" checklist for art: the shots to take (player angle, worst angle), the questions to ask of each
image, and how to compare a batch for continuity.

**G. What is wrong with this brief.** What would you do differently, and what am I not asking that I should?

Answer in plain text with headed sections, no tables wider than four columns, no dashes as punctuation. End with a
fenced json block: a list of `{ "section": "A".."G", "rank": n, "title": "...", "do": "one paragraph the coding model can act on", "cost": "minutes / hours / days", "confidence": 0.0 to 1.0 }`.
