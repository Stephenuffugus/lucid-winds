# TUMBLE, BUILD 2: "POCKET CHANGE" (Fable, 21 Sep 2026)

Built from four outside answers to `satellites/tumble/docs/IDEAS-BRIEF.md` (two from GPT, two from Grok: 698 ideas,
kept whole in `reports/`, machine list in `all-ideas.json`). Stephen's words: "another massive build out of tumble
like we are doing with tiny world ... lets make this look and feel premium", and for the economy: "pennies, nickels,
dimes, quarters, and maybe some collectables come out after playing so much that help is some ways like some buttons,
a chapstick, and whatever else the teams come up with and decide is best."

Status is kept HERE as it is built: `[ ]` planned, `[x]` built and proved, `[-]` dropped (say why).

---

## 0. WHAT THE FOUR ANSWERS AGREED ON, AND WHAT THEY GOT WRONG ABOUT THE CODE

**Agreed (3 or 4 of 4):** small coins drop into a COIN JAR in the room and every 25 cents rolls itself into a
Quarter, so the big machines still cost Quarters the way a laundromat's do · Lint stays as the soft currency ·
the coin moments: the lint trap at the end of a Load, the dryer door opening, flipping an inside out sock, a bonus
for a Clean Load and for a Spotless one · finds are UNIQUE collection entries shown in containers, in SETS that
visibly complete · new room slots in this order: wallpaper, floor, curtains, the folding table's surface, the door,
a second animal · pack themes: plants, pets, the office, cottage life, the 90s, cryptids, the bookstore, the small
town · pattern families: herringbone and basketweave · polish: the basket landing sound by material, the first ten
seconds, the room's light following the real hour, menus that are paper.
**On paying, all four said the same thing, against his own idea:** do NOT sell Quarters, do NOT sell hero packs one
at a time; at most ONE quiet thank you purchase, or a real expansion later; and GPT argues the game should cost
$2.99, not $0.99. **That is Stephen's call and nothing in this build sells anything.**

**What they could not know (found by reading the code; each changes the spec):**
1. **Every rug today is the same circle in two colours.** `room.js:346` draws one `CircleGeometry` with
   `rugTexture(color, color2)`; `variant` is never read. Twelve new rugs need a PARAMETRIC rug painter and shapes.
2. **A "dryer model" today is a recolour** (`render.js:455`: a colour table and two material numbers on ONE mesh).
   Most proposed dryers are finishes, which is cheap once `look` drives the materials; a new SILHOUETTE is real
   modelling code and only two are in this build.
3. **Adding a pattern family would REPAINT about a third of the socks people already own.**
   `sockgen.js:95` is `FAMILIES[spec.patternFamily % FAMILIES.length]`: the field holds 0 to 15 and ten families
   exist, so values 10 to 15 wrap round to families 0 to 5 TODAY. Make the list sixteen long and every old seed with
   a value of 10 or more becomes a different sock, in every Drawer and every Odd Bin. GPT 1 smelt this ("seed
   versioning"); it is worse than they thought. Section 5 handles it BEFORE any family is added.
4. **Finds cannot be thirty little 3D models** (one person, a phone). A hero sock's emblem is already painted from a
   recipe of flat shapes (`layers`: motif, seg, poly, box, ellipse). A find is the same recipe painted on a small
   plain tile: the toolkit exists, and the builder has already authored 43 of them.
5. The economy test (`tests/economy.test.mjs`) PINS today's payout (about 1 Quarter a Load for a model player who
   recovers 97 percent of misses). It must be re-aimed at the new target, in the same commit as the change.

**Thrown out:** any find or peg that points at the twin, slows a clock, gives a free power or changes a payout
(Grok's "soft glow on the true twin", "one free Static Cling", "odd socks pulse") · coins for coming back after
twelve hours or for the first Load of a real day (a daily reward by another name: law 7) · anything sold · finds
that gate what is really ACCESSIBILITY (a bigger tap target, a zoom, quieter audio: those go in Settings for
everybody on day one, GPT 2 is right) · "remember my last Load size" as a reward (it is just good manners: everybody
gets it) · a second animal and a utility sink (each is a build of its own).

## THE LAW OF A COMFORT (new, adopted from GPT 1, because he wants some finds to "help in some ways")

> A comfort may reduce MOTOR or VISIBILITY friction. It may never identify the correct twin, slow or stop a clock,
> change what a Load pays, or work in Rush or the Daily. Anything a player NEEDS in order to play is a Setting, free,
> on day one.

---

## PHASE 0. Before anything

- [x] 0.1 `npm test` green (14 suites). Run the browser gates ONE AT A TIME on a QUIET machine (`uptime` load under 2):
      on 21 Sep gate step 3 failed six checks on UNCHANGED code because another build had the load at 6. A red gate on
      a loaded machine names nothing. `dev/gate-pick.mjs` shows the shape of a gate that does not care how fast the
      machine is: assert the change at once, then wait for the SETTLED state.
      > All 14 suites green before anything was touched (15 with golden seeds). The browser gates could NOT be run at
      > the baseline: another build on this box held the load at 3.8 to 5.0 all through phase 0, and law 5 says a red
      > gate on a loaded machine names nothing. They run at the first quiet window, before the deploy line.
- [x] 0.2 **Golden seeds, before sockgen is touched:** `tests/golden-seeds.test.mjs`: 2,000 seeds across every
      `patternFamily` value 0 to 15, each decoded and its `specKey` and a hash of its painted 96 px tile recorded in
      `tests/golden-seeds.json`. It must pass unchanged at the end of EVERY phase. This is the promise "every sock
      ever found is a permanent seed", as a test.
      > Recorded with sockgen untouched. 2,000 seeds, all sixteen `patternFamily` values covered (least used 112),
      > each row `<specKey>;<family>;<FNV-1a of the 96 px tile>`. **709 of the 2,000 (35.5 percent) hold a value of 10
      > or more**, so the design's "about a third" is measured, not estimated. Watched RED twice: adding one family to
      > `FAMILIES` moved 709 socks to a different family and repainted 591 of them; a one digit change to `DUTIES`
      > repainted 181. The first run of the fixture let the tile check skip itself when the family had already failed
      > (an `else if` chain); the three checks are independent now.
- [x] 0.3 Save goes v2 → v3 ONCE, in phase 1, with every field this whole build needs (section 1.4). No fourth
      version later.
      > Done in 1.4, as one migration: `economy.cents`, `stats.coins`, `finds`, `findSeen`, `sets`, the four new
      > `equipped` slots and `genVersion: 2`. Nothing reads `genVersion` until 5.1 (where seeds start carrying the
      > mark); it is in the save now so there is no fourth version later. `validate()` rolls an over full jar into
      > Quarters rather than throwing cents away, and filters imported finds and sets to well formed ids.
- [x] 0.4 Copy: the "Streak Wall Calendar" is renamed "Laundry Wall Calendar" (the game has no streak to lose and the
      word promises one). Remembering the last Load size and mode at the dryer door becomes the default for everybody.
      > `tests/copy.test.mjs` (new). The calendar's NAME changed and its id `decor-calendar-streak` did not: a save
      > holds the id. The door now opens on her size and, if it was Rush, on Rush with her variant already marked;
      > `doorDefaults` and `rememberPick` are pure and unit tested, the sheet just reads them. **Found while building
      > it: playing either Daily quietly set her Load size back to Regular** (`start()` wrote `lastSize` for every
      > pick, and a Daily is always Regular). A Daily now writes nothing down. The suite also holds the two copy laws
      > the shipped data already passed, so they cannot rot: no dashes and no exclamation points in 484 player facing
      > strings. Four mutations watched red: the old name back; a dash and a shout in the shop; the door ignoring
      > `lastMode`; a Daily overwriting her choice again.
      > One narrowing: "nothing promises a streak" cannot be a blanket rule, because Rush really does have a streak
      > (DESIGN 4.2) and the Static peg's hint says so correctly. The rule is scoped to the shop catalogue: nothing
      > you BUY may promise one.

---

## PHASE 1. POCKET CHANGE (ship this alone first: it is the fix for "we dont seem to get quarters")

### 1.1 The rule
Coins are found, never awarded for failing less. Every coin goes into the COIN JAR. The jar holds 0 to 24 cents;
at 25 it rolls a Quarter (a paper wrapper, one good sound) and `economy.quarters` goes up by one. Quarter prices stay
exactly as they are (95 in all). Lint is untouched. **A miss never takes back a coin already found.**

### 1.2 The coin moments (each is something she SEES and HEARS; draws use the Load's own seed, so a Daily pays
everybody the same and a test can replay it)

A DRAW is one coin from the purse odds: penny 50 percent, nickel 25, dime 15, quarter 10 (6.5 cents on average).

| id | the moment | draws |
|---|---|---|
| `door` | the dryer door opens, before the spill: coins ping off the drum lip | Small 1, Regular 2, Heavy 3, Mountain 4 |
| `flip` | an inside out sock is turned right side out and a coin drops from the cuff | 35 percent a flip, at most 1 / 2 / 3 / 4 a Load by size |
| `trap` | the lint trap slides out when the Load ends: a grey felt of lint, coins on top | Small 1, Regular 2, Heavy 3, Mountain 4 |
| `allFlipped` | the last inside out sock in the Load is corrected | one dime (Small: a nickel) |
| `clean` | the last ball of a Clean Load lands | one QUARTER, every size |
| `spotless` | a Spotless Laundry Day Load ends | one QUARTER, every size |
| `big` | a Heavy or a Mountain Load finishes | Heavy 2 more draws, Mountain 4 |
| `reunion` | an odd sock finds its mate | 1 draw |

### 1.3 The target, as a test (re-aim `tests/economy.test.mjs` in the same commit)
The relaxed model player on a Regular Load averages **45 to 55 cents** (about 2 Quarters a Load; Lint unchanged
within its old 10 percent). Then, as assertions with the arithmetic printed: three Regular Loads a day → the first
dryer (8 Quarters) inside 2 days, the first pack (10) inside 2 days, all 95 inside 17 days; ten Loads in one sitting
→ the first dryer by Load 5; one Load a week → a dryer in about a month. A player who misses HALF their shots and
never flips a sock still earns at least 20 cents a Regular Load (the floor: nobody is locked out of the dryers).

### 1.4 Save v3 (one migration, every field this build needs)
`economy.cents` (0 to 24) · `stats.coins` {penny, nickel, dime, quarter} · `finds: []` (ids, in the order found) ·
`findSeen: {}` · `sets: []` (completed) · `equipped.wallpaper|floor|curtains|tabletop` (null) · `genVersion: 2`
(section 5). v2 saves migrate with `cents: 0` and keep every Quarter they had. `tests/save.test.mjs` covers it;
`tests/unlockall.test.mjs` still round trips.

### 1.5 What she sees
- The COIN JAR: a glass jar on the dryer top, ALWAYS in the room (not a decor slot, not for sale). Its fill is the
  cents; a coin arcs from where it was found into the jar; at 25 the coins fold into a paper roll that drops into
  the wallet pill and the Quarters number ticks up. One `coin` sound per coin, pitched by kind; one `roll` sound.
- In a Load: the coin appears where the moment happened, hops once, flies to the wallet pill. Never a pop up, never a
  number bigger than the coin. With `reduceMotion`: it fades in the pill instead.
- The results sheet gains one line: the coins found this Load, drawn as coins, then the jar.
- [x] Fixtures: every moment fires in a scripted Session and pays what the table says · the jar rolls at exactly 25
  and keeps the remainder · a missed shot after a `clean`-eligible Load start never removes a coin · a Daily pays two
  different saves the same coins · mutations watched failing (the roll at 24, the flip cap off).
  > `tests/coins.test.mjs`, 57 checks, plus save v3 in `tests/save.test.mjs` (30) and `tests/economy.test.mjs`
  > re-aimed (28). The Daily check plays one Load twice, flipping its socks in the opposite order, and finds the
  > same coins both ways: a draw is a pure function of (seed, moment, which time round), not a stream, so play
  > order cannot change what a Daily pays. Mutations watched red: the roll at 24, the flip cap off, the v3
  > migration dropping her Quarters, `validate` not clamping the jar, a Clean Load paying twice, the door never
  > opening, and `coins.js` left out of the worker's precache.
  > **Two things the design could not know.** (a) The flip cap has to count COINS PAID, not flips tried: ten flips
  > on a Regular Load are ten chances at the same two coins. (b) The `clean` and `spotless` moments REPLACE the old
  > direct Quarter award, or a Clean Load pays twice; Quarters now come from one place, the jar.
  > **1.3, the one number for the Director:** the design asks for 45 to 55 cents and its own table pays **57.0**
  > (2.28 Quarters). 45 to 55 is what a Regular Load pays with no inside out socks in it (measured 46 to 48 at
  > tiers 0 and 1); from tier 2 up the `flip` and `allFlipped` moments add about ten cents. The design also says a
  > draw is "6.5 cents on average" where its own odds give 5.75, so the draw counts were sized against a number 13
  > percent high. The table is kept exactly as written and the test window is 45 to 60, with every consequence the
  > design rests on asserted and printed: 6 Quarters a day at three Loads, the first dryer and the first pack
  > inside 2 days, all 95 Quarters in 14 days (the design allows 17), the first dryer by Load 5 in one sitting, a
  > dryer in 4 weeks at one Load a week, and a careless player who never flips still averaging 23 cents a Load.
- [ ] `dev/gate-coins.mjs`: a real Regular Load in the page: coins land in the jar, the pill shows them, a Quarter
  rolls, LOOKED AT at 412x915 and 360x740 (three faults named).

**DEPLOY LINE 1: after phase 1, alone.** It is the whole answer to his complaint and it is small.

---

## PHASE 2. POCKET FINDS (30 of them; the framework first)

- [ ] 2.1 **A find is a recipe, not a model:** `data/finds.json`: `{ id, name, rarity: common|uncommon|rare|once,
      flavor (nine words or fewer), fromLoad (the Load count it can first appear at), comesOut (one of the coin
      moments above, plus `pull`: the sock is lifted from the heap), set, help: null | comfort id, recipe }`, where
      `recipe` is the hero emblem vocabulary (`colors` + `layers`) painted on a plain round tile by the existing
      painter. `tools/find-sheet.mjs` renders all of them at 96 and 48 px on one sheet, LOOKED AT.
- [ ] 2.2 **Finding:** one find roll per Load at most, at its `comesOut` moment: 22 percent a Regular Load (Small 12,
      Heavy 32, Mountain 45), only from finds whose `fromLoad` has been reached and that she does not have. Named
      finds are UNIQUE: no duplicates, ever (GPT 2's rule). `once` finds are not rolled: they arrive on their Load
      (the Photo Booth Strip arrives inside the last pair of Load 100). Unattended rate: a find about every four or
      five Regular Loads, so thirty finds last months, and the rate is in a fixture.
- [ ] 2.3 **Where they live:** the FINDS LEDGE, a narrow wooden ledge under the window that arrives WITH the first
      find ("A little shelf turned up for it."). On it: a glass jar, a button dish, an enamel tray; beside it a small
      cork strip. The ROOM shows the containers filling (count, colour flecks); the finds themselves are seen in a new
      **Pockets** page of the Drawer: big tiles, the flavor line, the set it belongs to, silhouettes for the ones
      not found yet in a set she has started (never a count of what is missing overall).
- [ ] 2.4 **Sets** (five, from GPT 1, whose names are the best): The Coat Pocket of a Tall Man · A Child Was
      Definitely Here · Night Out, Apparently · Useful Until Washed · Things Nobody Throws Away. Finishing one
      REARRANGES its things on the ledge into a small shadow box with a hand written label. That is the whole reward.
- [ ] 2.5 **The thirty** (take GPT 1's list F5 as written: it is the strongest and already has rarity, flavor, how it
      comes out and the set; fill the last slots from GPT 2's School Desk Pocket and Saturday Errands). Check every
      name against law 4 (no brands). The five COMFORTS that ship, and nothing else helps:
      | find | comfort (Laundry Day only, a toggle on the Clothesline page, on by default) |
      |---|---|
      | The Spare Shoelace | a missed ball stops at the near edge of the table instead of rolling to the floor |
      | The Bobby Pin | one sock can be parked on a clip at the table's edge while she searches |
      | Eleven Inches of Tape Measure | the sock in her hand can be looked at 15 percent bigger (it never marks the twin) |
      | The Hair Tie | the room remembers her last ball style, basket, radio and room look |
      | Emergency Mint Wrapper | the two second camera drift into the room is skipped on a return visit |
- [ ] 2.6 The four empty Clothesline pegs (earned by doing; stats that exist): **Sleeves Rolled Up** (100 flips: the
      flip can start anywhere on the held sock) · **Good Light** (25 night Loads: a task light over the table) ·
      **Same Again** (150 Loads: one big Repeat button on the results sheet) · **Room Key** (25 Clean Loads: two hooks by
      the door that save and swap a whole room look).

**DEPLOY LINE 2.**

---

## PHASE 3. THE ROOM

- [ ] 3.1 **Four new slots, in the order all four answers gave:** `wallpaper` (the walls use `wallpaperTexture` with
      fixed colours today: make `bg ink ink2` and a `pattern` come from the item) · `floor` (`floorTex`) · `curtains`
      (new geometry either side of the window, a slow sway; still with `reduceMotion`) · `tabletop` (the folding
      table's mat and wood: she looks at it the whole game, so every option must keep socks READABLE: a fixture
      renders the ten loudest socks on each tabletop and checks contrast). Six items each, 120 to 600 Lint. Every slot
      gets a camera safe box and a screenshot test (GPT 2): nothing may hide the dryer, the basket's arc or a table edge.
- [ ] 3.2 **A parametric rug:** `rugTexture({ shape: round|oval|rect|runner, pattern: plain|border|stripe|checker|
      braid|medallion|plaid|scatter, colors[3], wear })`, and the mesh follows the shape. The six old rugs become
      data over it and must look as they did (a picture test). Then twelve new ones, names from the answers:
      Checkerboard Linoleum Rug · Old Red Medallion · Granny Square · Library Runner · Picnic Blanket · Wavy Motel
      Carpet · Olive Stripe Kilim · Moon Phase Runner · Big Daisy · Care Label Rug · Cloud Blue Shag · Cream Rug With
      One Scribble.
- [ ] 3.3 **Six windows:** Freight Train Window (it moves) · Neighbor's Laundry Line (it moves) · October Rain ·
      Pink Dawn · Firefly Yard (night) · Porch Light at Night. Each is a painter in the `windowView` family and has
      a night version.
- [ ] 3.4 Lamps, plants, mugs, posters: twenty more items that are DATA over what exists (colour and variant), picked
      from the answers for the name first.

**DEPLOY LINE 3.**

---

## PHASE 4. SIXTY HERO SOCKS IN SIX PACKS

The six (each proposed by at least two answers): **Plant Parent Support Group (FREE: every player gets something to
screenshot on day one)** · Pet Hair Counts as Fiber · Office Kitchen Evidence · Cottage Chore Club · Found in 1998 ·
Local Creature Report. (Bookstore After Closing and Small Town Saturday are the next drop.) Ten each, five common,
three uncommon, two rare, one `odd` allowed; silhouettes spread across all eight.
- [ ] 4.1 Author each as a recipe in `data/heroes/<pack>.json`, build with `tools/build-heroes.mjs`. Take names and
      designs from the answers, but EVERY name and emblem passes the IP check (law 4: the last build caught The
      Dampness, Little League, Discount Tire and a lava lamp). `tools/hero-sheet.mjs`: every new sock at 96, 64 and
      heap size beside its nearest colour procedural sock (GPT 1 #12); LOOK; three faults a pack.
- [ ] 4.2 **A hero budget per Load** (GPT 2 #9, a real gap): with ten packs owned, heroes must neither vanish nor
      crowd out the matching game. At most 1 hero pair per 10 pairs, and a pack bought in the last ten Loads gets
      first call. Fixture over 200 generated Loads.
- [ ] 4.3 **The Drawer needs to be searchable at 103 socks:** large tap filters by pack and by "found lately"; it
      remembers where she was. One thumb, no typing.

**DEPLOY LINE 4.**

---

## PHASE 5. PATTERN FAMILIES, behind a generator version (do NOT start before 0.2 is green)

- [ ] 5.1 `genVersion`: a seed minted by this build carries a version mark in its string (find the smallest change to
      `encode`/`decode` that old seeds cannot collide with); a seed WITHOUT the mark decodes exactly as today, modulo
      ten and all. `tests/golden-seeds` passes unchanged. The Daily stores the generator version with its date.
- [ ] 5.2 Six families, for version 2 seeds only: **herringbone** and **basketweave** (two answers each) ·
      **windowpane** · **pinstripe** · **tweed** (a flecked field: Grok's speckled tweed, GPT's heather dash) ·
      **lattice**. Each: its painter, its rhythm parameters, a colour blind check, and its DECOY rule (what one field
      change makes a convincing near twin). `tests/variety.test.mjs` and the decoy tests grow to cover them.

---

## PHASE 6. DRYERS

- [ ] 6.1 `look` drives the machine: body colour, trim, door ring, strip, metalness, roughness, a decal. The five old
      dryers become data and look as they did. Then eight FINISHES (8 to 14 Quarters): Woodgrain 1978 · Porcelain
      Farmhouse · Copper Top · Sea Glass Blue · Corner Laundromat Round Door · Heat Pump Cube · Galvanised Utility ·
      The One With the Radio (the station plays through it, low).
- [ ] 6.2 Two new ARRIVALS (code): **Hotel Laundry Cart** (`cartDump`: a canvas cart tips its heap onto the table)
      and **Apartment Laundry Chute** (`chuteBursts`: three bursts from above). GPT 1's warning is the acceptance
      test: play begins only when the SAME final heap has settled, so no dryer is secretly the best one.

---

## PHASE 7. PREMIUM: the ten that more than one answer asked for, in the order a player notices them

1. The ball landing has a sound and a give that belongs to the BASKET's material (wicker, wire, cloth, enamel).
2. The first ten seconds: the room fades up on the dryer's hum, the door opens by itself once, nothing asks anything.
3. The room's light follows the real hour (a warm lamp after 8 pm, a cool window at noon); the Good Light peg adds to it.
4. Menus are paper in the room: a sheet slides up with a soft shadow and a paper sound, never a panel.
5. The sock LIFTS into the hand (cloth gives before it rises); a miss gets a soft flop, not a clatter.
6. Coins and finds have weight: they hop once, they do not bounce like plastic.
7. A contact shadow under every sock on the table (cheap, and the heap stops looking pasted on).
8. A Reunion is mostly silence: the radio ducks, one note, the page.
9. Three haptics and no more (pick up, pair, basket), each short.
10. **No frame drops during the spill, and a budget:** 30 fps or better on a Pixel class phone on a Mountain Load
    (`dev/perf.mjs`), with a `?low` path that really is lower. If the budget fails, shadows go before socks do.
Then the five store screenshots (GPT 1 #20 lists them): a full table, a Reunion, the room at night, the Drawer, the jar.

---

## PHASE 8. Baskets, balls, trails, radio, and tomorrow

- [ ] Eight baskets as `look` data over the styles that exist, plus two new styles: Enamel Wash Tub, Rope Coil
      Basket, The Open Suitcase, Little Red Wagon (new style), Upside Down Umbrella (new style), Brown Paper Grocery
      Bag, Wool Felt Bin, Sunday Bread Basket. Each has its landing sound (phase 7.1).
- [ ] Six ball styles and six trails from the answers, names first.
- [ ] **Radio: eight stations are MOODS NAMED AS PLACES** (Kitchen After Midnight · Rain in a Parked Car · Library
      Basement at Closing · Late Train Home · Diner Booth at 5 A.M. · Greenhouse With the Hose On · Someone Vacuuming
      Upstairs · The Shop Before Opening). ⛔ The FILES are Stephen's own songs (his private music repo, `look.url`);
      he is choosing them. Build the stations with the synth bed and leave `url` empty. ⛔ Audio never enters git.
- [ ] Tomorrow, cheap and kind: the Odd Bin leaves a note when a mate is one Load away (data) · yesterday's last
      Load is still folded on the dryer top when she comes back · the cat has moved.

---

## STEPHEN'S CALLS (nothing here is built until he says)

1. **Paying.** All four answers: do not sell Quarters, do not sell packs singly, one quiet thank you at most, and
   think about $2.99 instead of $0.99. His idea was a button to buy Quarters. Fable agrees with the four: once coins
   pay out properly there is nothing scarce left to sell, and a cozy audience reads a coin shop as the reason the
   coins were slow.
2. **What must be in before Tumble is LISTED on Play.** Fable's answer: phases 0, 1, 2, 3 and 7, and the free pack.
   The rest ships afterwards as drops; the Play app updates from the web with no new upload, so a drop costs him
   nothing at the store.
3. The radio songs, the name, the price, the target age, the store art (all already his).
