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
- [x] `dev/gate-coins.mjs`: a real Regular Load in the page: coins land in the jar, the pill shows them, a Quarter
  rolls, LOOKED AT at 412x915 and 360x740 (three faults named).
  > 46 checks at both widths, played to the results, back to the room, then a SECOND Load. It went red eight times
  > on its first run and every one was real: the pill put itself back to 0 when the roll's closure fired with a
  > stale value; the jar showed no coins at all for 1 cent; the door coins flew to a pill that was not on screen
  > yet; and the second Load of a sitting showed nothing because the drain's watermark sat on the Game instead of
  > the Load. Two of its own faults too: the Load was tier 0, where nothing is inside out, so the flip checks
  > passed by being EMPTY; and it called `TUMBLE_DEV.save()` which lives at `TUMBLE_DEV.app.save()`.
  > **The one worth keeping:** its room check PASSED while the picture showed the results sheet. `showRoom()` does
  > not close a modal sheet, so the wallet really was visible and really did agree with the save, behind a sheet
  > covering the screen. Only opening the image caught it. It taps the Room button the way a player does now and
  > asserts the sheet is `inert`, and it projects the jar's own world matrix to check the jar is in frame at all.
  > **Measured in the page:** a Regular Load at tier 5 played perfectly pays **114 cents**, 4 Quarters and 14 in
  > the jar, twice the relaxed average of 57. At 360 px the HUD row is 106 + 90 + 63 + 0 + 44 with nothing
  > overlapping, so the pill costs no layout shift (an open question in the handoff's section 4).
  > **Faults named from the pictures, and what happened to them:** the pill icon read as a battery at 24 px
  > (redrawn) · the results line said the same thing twice as the box above it (rewritten, and given a card called
  > "In the pockets") · the jar had nothing to stand on, because the dryer's front is a plate flush with the wall
  > (the machine has a top now, flush with its face, and the dryer finally reads as a box).
  > **A fault in my own looking, corrected:** I first reported the jar as sitting inside the room title's band at
  > 127,44, because the gate measured its projected position WHILE THE CAMERA WAS STILL FLYING to the room pose
  > (0.9 s). At the settled pose the camera is far back and the dryer is low in frame, nowhere near the title. The
  > gate waits for `!render.camAnim` now and asserts the jar is below the title and clear of the wallet column.
  > What IS true at the settled pose: the whole machine is about 100 px wide, so the jar's fill cannot be read from
  > the room; the wallet chip's "14 cents" does that job. Worth knowing before phase 3 hangs more in that band.
  > Not fixed, and not phase 1: the first Load's "Got it" hint card covers the dryer door, which is where the door
  > coins come from, and the ODD SOCKS label is clipped by the table's left rail.

**DEPLOY LINE 1: after phase 1, alone.** It is the whole answer to his complaint and it is small.
> ✅ **DEPLOYED as `20260921h`** (2026-09-21 evening). Phase 0 and phase 1 complete, 17 Node suites green, the
> golden seeds unchanged, `dev/gate-coins.mjs` green at 412x915 and 360x740, every picture opened. The live stamp
> and `dev/probe-live.mjs` were checked after the push. Nothing became `[-]`. `satellites/tumble/HANDOFF.md` §6
> carries the economy numbers, the nine things nobody had reported, and the framing call for Fable.

---

## PHASE 2. POCKET FINDS (30 of them; the framework first)

- [x] 2.1 **A find is a recipe, not a model:** `data/finds.json`: `{ id, name, rarity: common|uncommon|rare|once,
      flavor (nine words or fewer), fromLoad (the Load count it can first appear at), comesOut (one of the coin
      moments above, plus `pull`: the sock is lifted from the heap), set, help: null | comfort id, recipe }`, where
      `recipe` is the hero emblem vocabulary (`colors` + `layers`) painted on a plain round tile by the existing
      painter. `tools/find-sheet.mjs` renders all of them at 96 and 48 px on one sheet, LOOKED AT.
      > Built with ALL THIRTY authored in the same line, because the schema cannot be proved by an empty file and
      > the painter cannot be looked at without them: 2.5's remaining work is the comforts being WIRED and the law
      > checks, which stay open. `engine/sockgen.js` gains `paintFind` (a disc, transparent outside it, the hero
      > `shapeSDF`/`shapeNear`/`recipeColors` reused, nothing existing touched: golden seeds pass unchanged) and
      > `findFleck` (the average colour a room container shows). The catalogue's SOURCE is `tools/build-finds.mjs`,
      > written the way `tools/build-heroes.mjs` is: the recipes are in readable coordinates there and `rot2` bakes
      > rotation into the JSON, so `data/finds.json` is never hand edited. Two extra fields the design did not name:
      > `chance` (2.2's per size odds, kept with the data) and `needs` (only the Brass Key uses it: GPT's entry asks
      > for three Clean Loads as well as Load 75). `data/finds.json` is in the worker PRECACHE and `_loadData`.
      > **A real bug the fixture caught:** the tile's rim was painted with `1 - smoothstep`, which filled the WHOLE
      > disc with the rim colour, so every tile colour in the file was dead and all thirty tiles were one flat tan.
      > It is a ring now. **And a check that could not fail:** the first "every find paints a readable emblem" test
      > measured the whole disc, counting the rim as ink, so a find with one 0.02 dot on it passed at 30 percent.
      > It measures the INNER disc now, and watching it red found two real finds (Receipt Gone Soft 12 percent,
      > Sticker Backing Star 10 percent) that were near white objects on a near white tile.
      > Seven mutations watched RED: a brand name back in a title · an exclamation point in a flavor line · a
      > comfort that makes the true twin glow · a blank emblem · a set of seven · a sixth comfort no find carries ·
      > a find dropped from the catalogue the tester switch reads.
- [x] 2.2 **Finding:** one find roll per Load at most, at its `comesOut` moment: 22 percent a Regular Load (Small 12,
      Heavy 32, Mountain 45), only from finds whose `fromLoad` has been reached and that she does not have. Named
      finds are UNIQUE: no duplicates, ever (GPT 2's rule). `once` finds are not rolled: they arrive on their Load
      (the Photo Booth Strip arrives inside the last pair of Load 100). Unattended rate: a find about every four or
      five Regular Loads, so thirty finds last months, and the rate is in a fixture.
      > `src/finds.js`, pure, the shape of `coins.js`. Measured over 6,000 Loads a size: small 12.0, regular 22.3,
      > heavy 32.6, mountain 45.2 percent, so **a find every 4.5 Regular Loads**. Which find a Load holds is decided
      > from the Load's SEED before play, so a fixture replays it and 300 replayed Loads turn up exactly the same
      > finds; it then arrives at that find's own moment (`Session.fireFind`, and `Session.pull` for the new `pull`
      > moment, which pays no coin and is fired by `play.js` when a sock is lifted). Over 160 Mountain Loads they
      > came out at six different moments: pull 32, door 12, flip 6, trap 10, clean 1, spotless 2.
      > **One thing the design does not say, and had to be decided:** a find whose moment never comes round in that
      > Load (a `clean` find in a Load that was not clean, a `flip` find in a Load with no inside out socks) is in
      > the LINT TRAP at the end. Without it four of the thirty would quietly pay under their stated rate. A player
      > who never flips and misses every shot gets all 63 of the same finds, 9 of them (14 percent) out of the trap.
      > A moment that pays nothing at this size (`big` on a Regular Load) did not happen, so nothing arrives with it.
      > A Load with no pair matched hands her nothing at all.
      > **Dead code the fixture caught:** the fallback was first written `fireFind(this.find.comesOut) || (...)`,
      > which fires the find's OWN moment and so always succeeds. It looked like it worked, reported the right
      > moment, and could never run. Watched red, then written plainly.
      > Six mutations watched RED: the unique rule off (9 duplicates in 28) · the odds read from the wrong size ·
      > the `fromLoad` gate off · the lint trap fallback removed · a find written into the save twice · the Brass
      > Key's three Clean Loads ignored. `src/finds.js` is in the worker PRECACHE, which `tests/sw.test.mjs` caught
      > before this line was ticked.
- [x] 2.3 **Where they live:** the FINDS LEDGE, a narrow wooden ledge under the window that arrives WITH the first
      find ("A little shelf turned up for it."). On it: a glass jar, a button dish, an enamel tray; beside it a small
      cork strip. The ROOM shows the containers filling (count, colour flecks); the finds themselves are seen in a new
      **Pockets** page of the Drawer: big tiles, the flavor line, the set it belongs to, silhouettes for the ones
      not found yet in a set she has started (never a count of what is missing overall).
      > The ledge is built and it is hidden until `save.finds` has something in it. Containers fill with a colour
      > fleck per find (`findFleck`), eight to a container. The Pockets page is a second TAB of the Drawer beside
      > Socks, grouped by set, and a set she has not started is not shown at all. One find opens big with where it
      > came from, its set, its comfort if it has one, and a way back to the page.
      > **⚠️ THE ROOM CANNOT SHOW THE CONTAINERS FILLING, and this is the second time the room pose has eaten a
      > feature.** At the settled room pose the whole ledge is about 95 px wide and a thing in a container is a 3 px
      > dot. Phase 1 found exactly this for the coin jar and answered it with a wallet chip; there is a "found" chip
      > now, for the same reason, and the ledge is set dressing until she taps it. The chip's label is ONE short
      > word because phase 1 also found that a wider chip gives the wallet stack a ragged left edge, and "pocket
      > find" put it straight back; the gate measures the spread now. **Phase 3.1 hangs four more slots in this same
      > band and its own "camera safe box and a screenshot test" is the right answer to it: read this before 3.1.**
      > **A silhouette is the OBJECT'S shape in shadow**, not a blank disc: five identical blank discs say only
      > "five missing", which is the one count this line says never to show her. `paintFind(recipe, {silhouette})`.
      > Four of the thirty silhouette as a plain circle (the button, the marble, the wheel, the googly eye), which
      > is honest, since they are circles.
      > `dev/gate-finds.mjs`, **66 checks** at 412x915 and 360x740, and eleven pictures opened. What they found is
      > in `satellites/tumble/HANDOFF.md` section 7: a find arriving at 76 px let the sock pile show straight
      > through it, the results row had no heading and read as part of the coins' card, every pale tile read as a
      > hole in the page, the Pockets page was a full height sheet holding six cells, and closing one find dropped
      > her out to the room. **And two faults in the LOOKING itself:** a gate that timed out and carried on shot
      > three identical pictures of the table and its pass lines could not say so, and a find's 2.4 s flight had
      > always faded before a screenshot landed, so every "look at the find" shot would have been of an empty table.
- [x] 2.4 **Sets** (five, from GPT 1, whose names are the best): The Coat Pocket of a Tall Man · A Child Was
      Definitely Here · Night Out, Apparently · Useful Until Washed · Things Nobody Throws Away. Finishing one
      REARRANGES its things on the ledge into a small shadow box with a hand written label. That is the whole reward.
      > Six finds in each of the five sets. A set's things sit LOOSE in the jar, the dish, the tray and on the cork
      > until it is finished; completing it takes them out of those containers and sets them out together in a small
      > framed box standing on the ledge, two rows of three, with its own label on the ledge front in a serif italic
      > ("from one coat, one winter", "found at knee height"). The reward is the rearrangement and nothing else: no
      > Lint, no Quarter, no item. `completedSets` is pure and a set with nothing in the catalogue is never complete.
      > **Two of the five can only be finished very late**, because each holds a `once` find: Night Out, Apparently
      > waits for the Photo Booth Strip at Load 100 and Things Nobody Throws Away for the Brass Key at Load 75 with
      > three Clean Loads. That is the design's own ladder, said out loud here because it means three sets are
      > reachable in a normal week and two are a season.
- [x] 2.5 **The thirty** (take GPT 1's list F5 as written: it is the strongest and already has rarity, flavor, how it
      comes out and the set; fill the last slots from GPT 2's School Desk Pocket and Saturday Errands). Check every
      name against law 4 (no brands). The five COMFORTS that ship, and nothing else helps:
      > **F5 is exactly thirty**, so no slot needed filling and GPT 2's two were not used. Law 4 caught ONE: F5's
      > first entry is "Half a Chapstick", and that is a registered trademark, in Stephen's own brief and in the
      > design's quotation of it. It ships as **Half a Lip Balm**. Law 11 caught one dash, in "Entry granted.
      > Re-entry seems unlikely", now "Entry granted. Getting back in seems unlikely"; the fixture refuses a hyphen
      > of any kind in any of the 80 strings. **GPT's own five "would not ship" objects all ship**, as keepsakes with
      > no power at all (One Tiny Screw, Single Googly Eye, Closed Safety Pin, Cap to Something, The Brass Key): the
      > thing is kept, the power is not, and a fixture names them so nobody quietly gives them one later.
      > **The law of a comfort is enforced in ONE place**, `game.comfort()`, which every comfort in the game already
      > reads through. A comfort a find brings returns false in Rush and in the Daily, whatever she has found; a PEG
      > comfort is untouched, because the law is about finds. `FIND_COMFORTS` lives in `src/finds.js` (pure, so Node
      > can test the rule itself) and the fixture asserts it is exactly the `comforts` in `data/finds.json`.
      | find | comfort (Laundry Day only, a toggle on the Clothesline page, on by default) |
      |---|---|
      | The Spare Shoelace | a missed ball stops at the near edge of the table instead of rolling to the floor |
      | The Bobby Pin | one sock can be parked on a clip at the table's edge while she searches |
      | Eleven Inches of Tape Measure | the sock in her hand can be looked at 15 percent bigger (it never marks the twin) |
      | The Hair Tie | the room remembers her last ball style, basket, radio and room look |
      | Emergency Mint Wrapper | the two second camera drift into the room is skipped on a return visit |
      > Four of the five are as written. **The Hair Tie's line describes something the game already does**: the ball
      > style, the basket, the station and the room look are all `save.equipped`, and they have persisted across
      > sessions since the save existed. Shipping it as written would have sold her a thing she has had all along,
      > which is the same fault as paying twice for a Clean Load. Section 4 says keep the SENTENCE and say it with
      > what the code has, so the Hair Tie now remembers the thing that really does reset: **the Drawer and the door
      > open on the tab and the filters she left them on**, across sessions. It is still pure motor friction and it
      > still cannot reach Rush. ⚖️ If the Director wants the fifth comfort to be something else, this is the line.
- [x] 2.6 The four empty Clothesline pegs (earned by doing; stats that exist): **Sleeves Rolled Up** (100 flips: the
      flip can start anywhere on the held sock) · **Good Light** (25 night Loads: a task light over the table) ·
      **Same Again** (150 Loads: one big Repeat button on the results sheet) · **Room Key** (25 Clean Loads: two hooks by
      the door that save and swap a whole room look).
      > All four, on `flips`, `nightLoads`, `loads` and `cleanLoads`, which the save already keeps. Sleeves rolled up
      > opens the held sock's tap radius from 44 px to the pocket's full 96. Good light is a spot over the table at
      > zero intensity until it is earned. Room key is two hooks in the door sheet; each holds the whole room
      > (`decor` plus the nine look slots), only what she still OWNS goes back up, and the hooks are new fields in
      > save v3 with their own import filter, so **no fourth save version** (law 8).
      > **Two things the design did not foresee.** (a) **Good light must NOT be an Eyes peg.** Eyes pegs raise the
      > difficulty ceiling (tier = Eyes + 2), and making it one took the ceiling from 8 to 9 and broke
      > `tests/unlockall`. It is `eyes: false`: a visibility comfort, not a difficulty unlock. ⚖️ If the Director
      > wants the ceiling to move, that is a balance call and its own line. (b) **"one big Repeat button on the
      > results sheet" already exists**: the sheet's "Another Load" restarts `lastPick` exactly, so a second button
      > beside it would say the same thing twice. Same again went where the friction actually is, the DRYER DOOR,
      > where she picks a mood and a size every time: it is one tap from the room to the Load she just played, and
      > it names it ("Heavy Rush, Timed").

**DEPLOY LINE 2.**

---

## PHASE 3. THE ROOM

- [x] 3.1 **Four new slots, in the order all four answers gave:** `wallpaper` (the walls use `wallpaperTexture` with
      fixed colours today: make `bg ink ink2` and a `pattern` come from the item) · `floor` (`floorTex`) · `curtains`
      (new geometry either side of the window, a slow sway; still with `reduceMotion`) · `tabletop` (the folding
      table's mat and wood: she looks at it the whole game, so every option must keep socks READABLE: a fixture
      renders the ten loudest socks on each tabletop and checks contrast). Six items each, 120 to 600 Lint. Every slot
      gets a camera safe box and a screenshot test (GPT 2): nothing may hide the dryer, the basket's arc or a table edge.
      > Built 22 Sep, pictured and finished 23 Sep. Four single slots in `save.equipped`, six looks each, 120 to 600
      > Lint; with nothing bought the room is the room it always was (the gate shoots it). The camera safe box is
      > `dev/gate-room.mjs`: it reads REAL pixels at the dryer, the table's near rail and the basket rim for all 24
      > looks (floor dE 9; closest Striped Towel against the basket rim, 11.8), and records the painted tabletop
      > averages the Node contrast fixture reads, because the formula it used to read flattered by up to 27/255.
      > **What the first pictures showed (23 Sep), all fixed:** the curtains passed THROUGH the window sill, the
      > radio shelf and its plant, a ledge jar and a little wall shelf, and hid the cork strip and two frame
      > spots; the first poster, both floor plants, the postcard and the Bin frame hung off a portrait phone; the
      > dresser's lamps, plant and cat stood inside each other. The curtains now hang from a rod in front of the
      > sill and stop above it, the radio shelf ends before them, and every spot was placed on a map of the real
      > camera at 412 and 360. **The gate now carries a layout law** (every item in every spot it can take, the
      > ledge in both states, the Reunion gifts included): nothing passes through anything, nothing hides behind
      > a curtain, nothing bought hangs off the phone. Watched red on the old code (14 fails), green on the new.
- [x] 3.2 **A parametric rug:** `rugTexture({ shape: round|oval|rect|runner, pattern: plain|border|stripe|checker|
      braid|medallion|plaid|scatter, colors[3], wear })`, and the mesh follows the shape. The six old rugs become
      data over it and must look as they did (a picture test). Then twelve new ones, names from the answers:
      Checkerboard Linoleum Rug · Old Red Medallion · Granny Square · Library Runner · Picnic Blanket · Wavy Motel
      Carpet · Olive Stripe Kilim · Moon Phase Runner · Big Daisy · Care Label Rug · Cloud Blue Shag · Cream Rug With
      One Scribble.
      > Built 22 Sep; the six old rugs are `oval` + `braid` and paint what they painted. 23 Sep, from the pictures:
      > every `rect` and `runner` rug ran off both sides of a 412 and a 360 phone (scaled to keep the old oval's
      > floor either side), and a bought rug was laid ON the braided one, which showed round it (it replaces it
      > now). The gate projects all 18 rugs' real meshes at both widths: tightest 28 to 380 of 412.
- [x] 3.3 **Six windows:** Freight Train Window (it moves) · Neighbor's Laundry Line (it moves) · October Rain ·
      Pink Dawn · Firefly Yard (night) · Porch Light at Night. Each is a painter in the `windowView` family and has
      a night version.
      > Built 22 Sep; the train and the neighbour's line move by sliding one mesh over a view painted once.
      > 23 Sep: **the window and the lamp now read ONE clock** (`isNightHour` in `config.js`, 8 pm to 6 am, the
      > design's "after 8 pm"). They used two: the lamp came on at 7:30, the window went dark at 8, and the window
      > never heard the hour the room was given (the room's update was memoised on a key without it), so a room
      > told "half past nine" kept a daytime window. Node and the gate both hold it.
- [x] 3.4 Lamps, plants, mugs, posters: twenty more items that are DATA over what exists (colour and variant), picked
      from the answers for the name first.
      > Built 22 Sep, 182 items. The spots they stand in were rebuilt 23 Sep for a portrait phone (see 3.1).

**DEPLOY LINE 3.** (Shipped together with phase 7 and the free pack, the listing bar; see the note under phase 7.)

---

## PHASE 4. SIXTY HERO SOCKS IN SIX PACKS

> ⚠️ **THE BUILD ORDER DEPARTS FROM THE NUMBERS HERE, FOR THE PLAY LISTING** (agreed 22 Sep, per
> `HANDOFF-OPUS-SEP22-MORNING.md` §2). The listing bar is phases 0, 1, 2, 3 and 7 plus the FREE pack, so the order
> is **2 → 3 → 7 → 4 → 5 → 6 → 8**, not 2 → 3 → 4. Phase 4's free pack (Plant Parent Support Group) is pulled
> forward with 3 and 7; the other five packs, and phases 5, 6 and 8, ship afterwards as web drops, which cost
> nothing at the store because the Play app updates from the web.

The six (each proposed by at least two answers): **Plant Parent Support Group (FREE: every player gets something to
screenshot on day one)** · Pet Hair Counts as Fiber · Office Kitchen Evidence · Cottage Chore Club · Found in 1998 ·
Local Creature Report. (Bookstore After Closing and Small Town Saturday are the next drop.) Ten each, five common,
three uncommon, two rare, one `odd` allowed; silhouettes spread across all eight.
- [x] 4.1 Author each as a recipe in `data/heroes/<pack>.json`, build with `tools/build-heroes.mjs`.
      > All six, 23 Sep. The free pack shipped with the listing bar; **the other five are Pet Hair Counts as Fiber,
      > Office Kitchen Evidence, Cottage Chore Club, Found in 1998 and Local Creature Report**, 10 Quarters each
      > like every pack before them, in `tools/build-hero-packs.mjs` (names, flavors and designs from the answers
      > that proposed each pack). 103 heroes in the catalogue. Changed from the answers: every pack now spans all
      > eight silhouettes (each left one or two out); law 10 moved a tall pale figure between trees to a STUMP and
      > a red stapler to grey; law 11 took the dash out of "Three Toed Mud Print".
      > **LOOKED AT, four ways:** the hero sheet per pack, `tools/hero-compare.mjs` (each sock at 150, 64 and 32 px
      > beside the ordinary sock nearest its colour: the design's own ask, never built before), the table and the
      > Drawer in the game at 412 and 360 (`dev/shots-heroes.mjs`). What the looking found and fixed:
      > · **the free pack's emblems sat on the HEEL** (v 0.42 to 0.45 on a crew sock whose heel is 0.47), and
      >   **its boxes painted at twice their size** (its helper passed full sizes to a painter that takes half
      >   extents): Definitely Not Overwatering has been a blue square since it shipped. Both fixed; it is live
      >   and every player owns it, so this is the cheapest day to fix it.
      > · **false twins at heap size**: three cream crew socks in the free pack, two black dress socks in Pet Hair
      >   beside Uncle Energy's black Church Sock, and four more same silhouette pairs one colour apart. Separated.
      > · pale on pale emblems nobody would see in a heap (sheets on pale blue, a blue chair on a gradient).
      > `tests/packs.test.mjs` (new, 46): the six packs' shape and price, unique names, no dash, no shout, no brand
      > (word bounded: "excel" is in "excellent"), every emblem on the leg or the top of the foot, every emblem
      > strongly different from its own sock on 1 percent of the tile at heap size, and no two same silhouette
      > heroes within dE 10 of each other at heap size. Watched red: an emblem put back on the heel, a pack at
      > 7 Quarters, a lost silhouette, the rabbit painted cream again.
      > ⚖️ **For him:** the whole shop is now 145 Quarters, 22 days at three Loads a day (the economy test reads
      > the real shop now; the design's "all 95 in 17 days" still holds for the shop it was written about). And
      > an older pair the new law reports but this build did not repaint: Two Stripe Tube and Tube Sock With a
      > Zipper are two white knee tubes at dE 6.3. Take names and
      designs from the answers, but EVERY name and emblem passes the IP check (law 4: the last build caught The
      Dampness, Little League, Discount Tire and a lava lamp). `tools/hero-sheet.mjs`: every new sock at 96, 64 and
      heap size beside its nearest colour procedural sock (GPT 1 #12); LOOK; three faults a pack.
- [x] 4.2 **A hero budget per Load** (GPT 2 #9, a real gap): with ten packs owned, heroes must neither vanish nor
      crowd out the matching game. At most 1 hero pair per 10 pairs, and a pack bought in the last ten Loads gets
      first call. Fixture over 200 generated Loads.
      > 23 Sep. `tests/herobudget.test.mjs` (22), 200 Loads a size at every tier. **Both halves of the sentence were
      > broken by the old rule**, measured before changing it: `round(pairs * 0.1)` gave a Heavy Load FOUR heroes,
      > and heroes could only stand where `i % 7 === 3` among the base pairs, so at the top tier, where decoys take
      > most of a Small Load, **44 of 200 Small Loads had no hero at all and a player with only the free pack saw it
      > in 0 of 200**. Now `max(1, floor(pairs / 10))` (Small 1, Regular 2, Heavy 3, Mountain 5) at places spread
      > evenly over the base pairs: exactly that many in every Load. First call: a pack remembers the Load it was
      > bought at (`save.packBought`, inside save v3 with its own import filter, the way the room key hooks are) and
      > gets the first hero place for her next ten Loads (200 of 200; one pack in ten gets it 19 of 200 without).
      > The Daily holds no heroes and is byte for byte the Load it was (8 of 8 dates and modes against the old
      > generator). Also fixed: `economy.ownedHeroes` still read packs off `save.unlocks`, the bug app.js fixed on
      > 22 Sep, alive in a second reader: a new player owned none of the free pack by it.
      > **The wiring, in the page** (`dev/shots-heroes.mjs`): Game.start passes a named list of options to the
      > generator and silently drops any it does not name. Watched red with the line removed (other packs took the
      > first place), green with it: a pack bought this Load gets the first place, three heroes in a Heavy Load.
- [x] 4.3 **The Drawer needs to be searchable at 103 socks:** large tap filters by pack and by "found lately"; it
      remembers where she was. One thumb, no typing.
      > 23 Sep. `src/drawerlist.js` (pure, `tests/drawer.test.mjs` 12) and `src/screens.js`: **Found lately** beside
      > All, Heroes and Missing a mate (the last 24 she folded away, whenever that was: a player back after two
      > weeks still has something there); under **Heroes** the pattern row, which heroes do not have, becomes a row
      > of the packs she has socks from, with counts, so there is no fourth row of chips on a 360 phone. A pack
      > left chosen never hides anything outside Heroes. Every chip is 48 px tall. **It remembers where she was:**
      > closed and opened in the same sitting it is as far down and as many pages deep as she left it; across
      > sessions that stays the Hair Tie's comfort (2.5), so the find still means something.
      > `dev/gate-drawer.mjs` taps every chip with a real pointer at 412 and 360. It went red on its own FIRST: it
      > measured the chips while the sheet was still sliding in (the slide starts the frame after openSheet and
      > takes 3.4 s here), and the finger opened a sock card. A probe proved the tap once the sheet had settled,
      > and the gate now taps only when a hit test finds the chip under the finger twice running. Then red for the
      > right reason (the position restore removed: 30 shown at the top instead of 60 at 1730) and green.
      > LOOKED AT, 412 and 360: Heroes with its pack row, one pack, Found lately, and the Drawer reopened where she
      > left it. Faults named, for him as taste: the choice row is wider than the phone and centring the chosen chip
      > hides "All" off the left edge (the chip rows already scroll that way); the long pack names mean two pack
      > chips on screen at 360; the "103 designs folded away" line does not change with the filter.

**DEPLOY LINE 4.** ✅ Phase 4 complete, 23 Sep: 4.1 live as `20260922c`, 4.2 as `20260922d`, 4.3 as `20260923a`.

---

## PHASE 5. PATTERN FAMILIES, behind a generator version (do NOT start before 0.2 is green)

- [x] 5.1 `genVersion`: a seed minted by this build carries a version mark in its string (find the smallest change to
      `encode`/`decode` that old seeds cannot collide with); a seed WITHOUT the mark decodes exactly as today, modulo
      ten and all. `tests/golden-seeds` passes unchanged. The Daily stores the generator version with its date.
      > 23 Sep. **The mark is one more mutation, `~g.2`**, on the end of the 64 hex characters: no seed has ever carried
      > a `g` key, so none can collide, decoys keep it (`mutate` carries every mutation), and an older cached client
      > that meets one ignores a key it does not know instead of throwing. `GEN_FAMILIES` lists what each version
      > paints (version 2 = version 1's ten, then the new ones at the END); a marked key ends `|g2`, an unmarked key
      > is the key it always was. **Nothing is minted marked yet** (`MINT_GEN = 1`): a seed marked 2 before 5.2 gives
      > version 2 its families would change pattern the day they arrived, which is the promise this line keeps.
      > The Daily takes its version from its DATE (`dailyGen`, `DAILY_GEN2_FROM` null until 5.2), never from the build
      > a phone runs, and stores it with the date in `save.daily` and `dailyHistory`. Measured against the committed
      > generator: 60 of 60 Dailies and 60 of 60 ordinary Loads identical. `tests/golden-dailies.json` now pins every
      > Daily from 1 to 23 September. `tests/genversion.test.mjs` (15): watched red with the Daily switched to
      > version 2 (all 46 past Dailies moved) and with the mark ignored. The save's `genVersion: 2` field stays unread:
      > the version comes from the build and the Daily's date, which is the part a save could not know.
- [x] 5.2 Six families, for version 2 seeds only: **herringbone** and **basketweave** (two answers each) ·
      **windowpane** · **pinstripe** · **tweed** (a flecked field: Grok's speckled tweed, GPT's heather dash) ·
      **lattice**. Each: its painter, its rhythm parameters, a colour blind check, and its DECOY rule (what one field
      change makes a convincing near twin). `tests/variety.test.mjs` and the decoy tests grow to cover them.
      > 23 Sep. **Version 2 is minting** (`MINT_GEN = 2`): every new sock carries `~g.2`, and the Daily is version 2
      > from **24 September** (`DAILY_GEN2_FROM`), so no Daily anybody played changed (the 46 pinned in
      > `golden-dailies.json` hold). patternFamily values 10 to 15 get the six in a marked seed and still wrap in an
      > unmarked one: `golden-seeds.json` unchanged, and `golden-seeds-v2.json` now pins the same 2,000 seeds marked.
      > Rhythms: herringbone (period, duty, alt; the columns always an even count so the zigzag closes round the leg),
      > basketweave (period only, as FIXED block counts 10/8/6/4, because a rounded count gave two periods the same
      > picture on a baby sock), windowpane (period, duty, double line), pinstripe (period, alt; the pin width is one
      > duty bit), tweed (period = how thick the flecks fall), lattice (period, duty, knots). The DECOY rule is
      > `RHYTHM_VISIBLE` in loadgen, and `tests/families.test.mjs` proves it EXACT bit by bit on every silhouette (a
      > bit it names changes the picture, a bit it does not name never does); watched red with basketweave's old
      > rounding and with tweed claiming a bit it does not paint. Lines and flecks use whichever accent stands
      > further from the body in the way of seeing being painted. Colour blind check: each new family shows at least
      > as well as the weakest shipped one (polka, 5.2 percent of the sock at the 5th percentile over every palette
      > and all four ways of seeing). Match: decoys of all six are in the 10,000 per tier and none paints like its
      > base; variety: the measured Loads are version 2 with all six in them (both watched red with minting off).
      > **Found by the pictures** (`dev/shots-gen2.mjs`, 412x915 and 360x740): the six had NO sock names (a card
      > would have said "Bold Lemon undefined Dress Sock") and no share card rarity; both are tables now, held by a
      > test. Tweed's first cut read as TV static on the card and gold glitter in the heap: repainted as a heather,
      > softly mottled, with fat dashes lying along the knit rows, mostly a thread of the body's own colour. The
      > card drew every sock from the Drawer's 96 px thumbnail stretched over 200 px: it paints at 192 px now. The
      > Drawer's pattern row lists the patterns she HAS in version 2's order; a real tap on Tweed leaves the tweed.
      > ⚠️ An old cached client that opens a SHARED version 2 link reads the ten families only, so a value 10 to 15
      > shows it the wrapped family until it updates. Taste, his: whether lattice at heap size reads too near polka.

---

## PHASE 6. DRYERS

- [x] 6.1 `look` drives the machine: body colour, trim, door ring, strip, metalness, roughness, a decal. The five old
      dryers become data and look as they did. Then eight FINISHES (8 to 14 Quarters): Woodgrain 1978 · Porcelain
      Farmhouse · Copper Top · Sea Glass Blue · Corner Laundromat Round Door · Heat Pump Cube · Galvanised Utility ·
      The One With the Radio (the station plays through it, low).
      > 23 Sep. `src/dryerlook.js` resolves a look into every part the renderer paints (body, trim = the top slab,
      > door ring and handle, its thickness and glow, strip, metalness and roughness each, a body texture, a decal)
      > and `dryerLoads()` says what the machine DOES. Both were keyed by model NAME before (a colour table in
      > render.js, name checks in app.js). The five old dryers carry their numbers as data and resolve to exactly what
      > the old code drew (`tests/dryers.test.mjs` writes the old numbers out by hand; watched red on one strip colour
      > one step off). The eight finishes are 12, 10, 11, 8, 13, 14, 9 and 12 Quarters, each tumbles a REGULAR Load
      > (a finish changes how the machine looks, never what it does: watched red with one set to bigger Loads), and
      > no two of the thirteen are twins. Plates: a 1978 badge, a coin slot marked 25¢, a little screen reading 0:42,
      > a speaker grille. The radio one routes the station through a radio bus into a lowpass at 1.5 kHz at 0.55 gain.
      > `dev/shots-dryers.mjs` equips all thirteen in the real room, reads every material back from the page against
      > the resolver, checks the radio routing and that the Industrial still takes bigger Loads, and crops each dryer
      > from the room and from the table camera at 412x915 and 360x740.
      > **Found by the pictures:** Copper Top's cream body was a near twin of the Backyard Clothesline (the twin law
      > caught it first: deep green now), the Heat Pump Cube was the porcelain's twin from the room (graphite now),
      > Galvanised read as crazy paving (smaller, calmer spangle, three to a machine), and **the ledge's room tag
      > (phase 2) sat on the dryer's control strip**, over where two finishes put their plate: it hangs above the
      > ledge now, and the gate holds a TAG LAW (no room tag on the door or the strip; watched red on the old tag).
      > ⚖️ **For him:** the whole shop is now **234 Quarters, 35 days** at three Loads a day. The economy test used to
      > hold it to a month; that month was the test's own number, not the design's, and the design's own prices
      > outgrow it. It now says the total out loud and holds that no ONE thing costs more than three days of play
      > (the dearest is the Portal Dryer at 20, 2.9 days). Prices are his.
- [x] 6.2 Two new ARRIVALS (code): **Hotel Laundry Cart** (`cartDump`: a canvas cart tips its heap onto the table)
      and **Apartment Laundry Chute** (`chuteBursts`: three bursts from above). GPT 1's warning is the acceptance
      test: play begins only when the SAME final heap has settled, so no dryer is secretly the best one.
      > 23 Sep. `src/arrivals.js` (pure) plans how a heap arrives over the ONE physics recording: an arrival
      > chooses only start poses and times, never the recording, and play begins after every sock has played its
      > whole path. The door and the clothesline are moved there exactly (their plans and Build 1's arc are held
      > by hand in `tests/arrivals.test.mjs`). The cart and the chute are shop dryers at 15 Quarters, Regular
      > Loads, and they pay the SAME door coins moment, when their laundry comes out (the pour, the first burst).
      > **The acceptance test, in the running game:** `dev/shots-arrivals.mjs` plays one Load seed through the
      > door twice (the control), then the clothesline, the cart and the chute: 0 of 42 socks differ to the
      > micrometre, the same coins, no prop left standing, at 412x915 and 360x740.
      > **What the pictures found, first look (nothing had seen them):** the cart tipped so far (66°) that the
      > table camera looked straight into its mouth and saw a white card in a wire cage; its heap sprayed out of
      > the MIDDLE of the bin, one sock straight up; it rolled in over the Odd Bin and out THROUGH the basket (it
      > parked 4 mm inside it, 2.6 cm inside the Bigger one); its load was nine pastel capsules on end (crayons).
      > The chute was a flat grey slab hanging in front of the dryer's porthole, so it read as the dryer door;
      > socks stuck out through its walls at the start of every burst (a knee high reaches 20 cm, the duct was
      > 20 wide); its hard shadow lay across the mat like a stain. `dev/strip-arrivals.mjs` (new) films a whole
      > arrival by scrubbing the paused clock, and the second and third looks found what the fixes broke: a
      > hinged flap that hung open across the porthole, a flared hopper that read as a range hood, a falling
      > column framed by the porthole glass (socks "in the drum"), and **the Odd Bin's folded front flap and its
      > label standing INSIDE the parked cart** (the law had boxed the Odd Bin at its walls; its flaps reach 5 cm
      > further, and the widest basket, the floatie's ring, 5 cm past its rim: the law now uses the real outlines).
      > **Now:** the cart is slim (30 by 13 cm, the strip between the Odd Bin's flap and the play area), parks in
      > front of the Odd Bin clear of both baskets in every style, rides over the table's rail, tips 46°, and each
      > sock starts just under the mouth and is POURED over the lip on a curve (the back of the heap lands under
      > the tipped bin, which a straight arc could only reach through the canvas); it has a lining drawn from
      > inside the same box, a push handle and a load of rolled, banded socks, and leaves the way it came. The chute is
      > a galvanised duct out of the ceiling, its mouth ABOVE the porthole and to its right (checked on the real
      > camera at both sizes), no flap, no shadow, a 1.5 cm thump per burst; its socks FALL from rest, spread
      > late, and come out at 40 percent size growing as they drop, the largest start its walls allow.
      > New laws, each watched red: the pour leaves every bin through the mouth (walked along every flight), the
      > cart's whole trip clear of the Odd Bin and both baskets and over the rail, no chute sock through the duct
      > (each silhouette's real reach), no cart or chute sock through the basket or the Odd Bin, the coins with
      > the laundry. 27 suites green, golden seeds unchanged.

---

## PHASE 7. PREMIUM: the ten that more than one answer asked for, in the order a player notices them

- [x] 1. The ball landing has a sound and a give that belongs to the BASKET's material (wicker, wire, cloth, enamel).
      > Five materials (wicker unchanged note for note, wire and enamel ring, cloth swallows, plastic knocks); the
      > material is set per Load from the basket's style. Heard in Node, not by an ear: HIS PHONE is the ear.
- [x] 2. The first ten seconds: the room fades up on the dryer's hum, the door opens by itself once, nothing asks anything.
      > Once per install, skipped under reduceMotion and on every gate, a tap ends it. **Pictured for the first
      > time 23 Sep** (`dev/shots-first-ten.mjs`, a fresh profile with no flags): the fade is proved to start black
      > over the WHOLE screen (room, title, wallet, buttons), nothing asks anything, a second launch is quiet.
      > Found in the pictures: **the door SNAPPED open in one frame**, and the room's own loop shut it again before
      > it could be seen. It swings on a curve now (`doorSwing`, 0.9 s, Node holds its shape), holds a beat, then
      > eases shut.
- [x] 3. The room's light follows the real hour (a warm lamp after 8 pm, a cool window at noon); the Good Light peg adds to it.
      > Reapplied on the minute. 23 Sep: ONE clock for the lamp and the window (3.3). Looked at, 1 pm against
      > 9:30 pm and 2 am: mean brightness 198, 158, 144, the window dark and a warm pool under the pendant at
      > night. Taste, for him: the noon SKY is painted peach, so "a cool window at noon" is only the light.
- [x] 4. Menus are paper in the room: a sheet slides up with a soft shadow and a paper sound, never a panel.
      > Close paper shadow, a fibre line along the top edge, a slide with no spring; one paper sound per sheet,
      > not one per sheet opened from a sheet. Seen in the Drawer and Pockets store shots.
- [x] 5. The sock LIFTS into the hand (cloth gives before it rises); a miss gets a soft flop, not a clatter.
      > `clothLift`: the first quarter gives, then it rises (0.2 s). A missed ball lands with `flop`.
- [x] 6. Coins and finds have weight: they hop once, they do not bounce like plastic.
- [x] 7. A contact shadow under every sock on the table (cheap, and the heap stops looking pasted on).
      > Sized from each silhouette's own footprint; `?low` drops them first. 23 Sep: **the fade with height was
      > computed and thrown away**, so a falling sock's shadow was full dark and growing, then vanished at 16 cm.
      > It rides the instance colour into alpha now; the room gate reads back 1.0 at rest, 0.4 at 10 cm, none at
      > 20 cm (1.0 at 10 cm on the old code).
- [x] 8. A Reunion is mostly silence: the radio ducks, one note, the page.
      > One note and its octave over a radio ducked to 0.08, which lifts itself.
- [x] 9. Three haptics and no more (pick up, pair, basket), each short.
      > `game.haptic` takes a NAME and anything not in `HAPTICS` is silent: the rule lives at the one read point.
- [x] 10. **No frame drops during the spill, and a budget:** 30 fps or better on a Pixel class phone on a Mountain Load
    (`dev/perf.mjs`), with a `?low` path that really is lower. If the budget fails, shadows go before socks do.
      > `dev/perf.mjs` holds what CAN be proved on a software GPU, and it FAILED on 23 Sep: a Mountain Load drew
      > 147 calls against its 120, and `?low` saved exactly one call. Measured why: the shadow MAP pass was 66
      > of the 147 calls and half the triangles, and 65 of its 74 casters were room props whose shadows fall
      > outside the table view. Fixed the way the line says: in the table view the room's props stop casting
      > (the socks, balls, dryer, table, basket and Odd Bin still do), and `?low` turns the shadow map off
      > while keeping the one call contact shadows. **Now: Mountain 108 calls and 261k triangles; `?low` 76
      > calls and 65k triangles against 103 and 122k.** The table view looked at before and after: the same
      > picture. ⛔ **30 fps on a Pixel is NOT measured** and is not claimed: the fps here is SwiftShader on
      > two shared cores. That half of the line needs his phone: open `?load=laundry&size=mountain&debug=1`.
- [x] Then the five store screenshots (GPT 1 #20 lists them): a full table, a Reunion, the room at night, the Drawer, the jar.
      > `dev/shots-store.mjs` (412x915 and 360x740 looked at; 1080x1920 is the listing size). 23 Sep: the first
      > run was a silent no-op, because `?unlockall` only answers on a device past the workbench door and the
      > headless profile was not: 0 Lint, an empty Drawer, "Nothing yet" in the pockets, a teaching card over
      > the table, a Reunion shot a second after the word had gone, a dawn window in "the room at night". Every
      > shot now asserts what it shows before it is taken, from a lived in save (1,240 Lint, 7 Quarters, 17
      > finds, two sets finished). ⚖️ For him, as store art: the held sock covers a third of the table shot, and
      > the Reunion shot shows the word but not the pair.

**DEPLOY LINE (the listing bar: phases 3 and 7 and the free pack), 23 Sep, as `20260922b`.** Every gate green on a
quiet box and every picture opened (room gate 40 with the new layout law, store shots at 412 and 360, the first
ten seconds, finds gate 68, perf budget); 20 Node suites green; the golden seeds unchanged.

---

## PHASE 8. Baskets, balls, trails, radio, and tomorrow

- [x] Eight baskets as `look` data over the styles that exist, plus two new styles: Enamel Wash Tub, Rope Coil
      Basket, The Open Suitcase, Little Red Wagon (new style), Upside Down Umbrella (new style), Brown Paper Grocery
      Bag, Wool Felt Bin, Sunday Bread Basket. Each has its landing sound (phase 7.1).
      > 23 Sep. A basket is ROUND in the physics (wall slats and rim capsules, scored by distance from its middle),
      > so every new basket keeps a round opening of the old size and rim: a look, never an advantage
      > (`tests/baskets.test.mjs`: radius 1, standard rim, Lint only, 200 to 1,000 each, 3,900 in all, about 20 days
      > at three Loads a day; prices are his). Six are drawn over an existing lathe with their own surface (tub
      > enamel, rope, leather, kraft, felt, wicker with a gingham napkin); the wagon is a tin tub riding in a red
      > wagon bed, the umbrella's canopy is the bowl with its handle hooked over the back rim (a shaft up the
      > middle would stand in the ball's path with nothing in the physics to bounce off). Each lands in the
      > material 7.1 already named for it (tub and wagon enamel, bread wicker, the rest cloth).
      > `dev/shots-baskets.mjs` (new) equips all twenty in the real room and reads back what the page DREW: the
      > room shows the equipped basket, every basket is drawn, its front half stays inside the widest basket's reach
      > (the hotel cart's clearance law rests on it), nothing stands in the ball's path, nothing leaves the table,
      > and a Load with the tub lands in enamel.
      > **Found on the way (live faults, fixed):** the room never showed the basket she equipped (only `start()`
      > drew one, so a basket bought in the shop appeared at her NEXT Load); the Wire Basket and the Frosted Wire
      > Basket were twins (the wire style ignored its second colour: Frosted is ice blue with a white rim now); the
      > Hollow Log's moss sat 5 cm inside its rim, over the opening (on the rim now).
      > **What the pictures found in the new ones (412 and 360, three looks):** the tub's band hid under its rim;
      > the suitcase lid was a flat pink plate and its straps faced the wall (tufted lining with piping, straps to
      > the front); the umbrella read as a striped bucket, then, given a fuller canopy, as a BEACH BALL (a basket is
      > taller than it is wide), so the bulge went back and the umbrella is said by its parts instead: scallops,
      > rib points past the rim, the crook over the back left rim; the paper bag was a kraft bucket (four soft
      > corners, outward only, and creases on them); the felt was grey plastic (fibres now); the napkin's corners
      > were flat flags (they drape over the rim now). ⚖️ Taste, his: the umbrella is still the weakest read of
      > the eight, its scallops dip 1.8 cm under the physics rim, and the paper bag is round where a bag is square
      > (a square one would put visible corners outside the round physics rim). In the shop (shot at 412 and 360)
      > all eight have their cards, names whole; every basket card there shares one basket icon (his: per style
      > icons would let the wagon look like a wagon on its card), and the new descriptions run a line long.
- [x] Six ball styles and six trails from the answers, names first.
      > 23 Sep. **Names first, from the answers (lane E of `all-ideas.json`):** balls Sock Rose, The Burrito, Figure
      > Eight, The Soft Knot, Crossed Ankles, Cuffed Donut; trails Running Stitch, Three Bubbles, Dryer Static, One
      > Firefly, Two Falling Petals, Soft Steam. Lint only, 150 to 400 each. The boxy folds the answers also offered
      > (Square Parcel, Drawer Brick, Hotel Fold) are left out: in the physics every ball is one SPHERE, so a style is
      > only the look of the bundle and a brick would roll like a ball.
      > `src/balls.js` and `src/trails.js` (pure) now hold both; Build 1's four balls and three trails are written
      > out by hand in `tests/balltrail.test.mjs` and draw exactly as before. Laws, each watched red: no new ball
      > floats on its flat side or sinks on its lumps more than Build 1's already do (measured on each outline in 300
      > directions); no new style within 3 percent of another point by point (an OUTLINE cannot see a hollow: by
      > outline the Figure Eight, whose whole point is its waist, was 2.4 percent from the Burrito; Build 1's own
      > Tight Roll and The Way Your Mom Did It are 2.2 apart); each new style shades its folds; every trail fades
      > inside 1.2 s and never floods. **Three of the answers' names are COUNTS** (Three Bubbles, Two Falling Petals,
      > One Firefly), and Build 1 leaves trail sprites per FRAME, which is a different count on every phone (a 120 Hz
      > one leaves twice what a 60 Hz one does): those three are counted per SHOT now, on the shot's own clock, and
      > One Firefly is one sprite that follows the ball a beat behind and fades where it lands.
      > `dev/shots-balls.mjs` (new) holds the page: every trail has a sprite of its own (an unknown kind draws the
      > sparkle), every trail leaves its sprites behind a ball in the air (flown at a phone's frame rate, not the
      > gate's turbo), every ball mesh is the shape `balls.js` says, every ball style and trail has its own shop icon.
      > **What the pictures found:** held in her hand the camera looks straight down on the ball's underside, and the
      > first six were the same green lump (a knit bundle reads by its shadows): each new style now darkens its folds
      > through the shader's `aShade` (Build 1's four darken nothing), the rose's coil is on both faces and the
      > knot's band passes near both poles. The first trails were nearly invisible at the size Build 1's are seen
      > (a 30 px stitch drew 6 px dashes): sizes and colours brought up to the hearts and the dust. Looked at in
      > flight and in the shop at 412 and 360. ⚖️ Left, his: the stitch's dashes are flat to the screen (a point
      > sprite cannot turn with a steep path), the styles are still subtle on the table at a quarter of their held
      > size (Build 1's were too), Build 1's Tight Roll and The Way Your Mom Did It are near twins, the shop icons are
      > small and the steam's and bubbles' faint.
- [x] **Radio: eight stations are MOODS NAMED AS PLACES** (Kitchen After Midnight · Rain in a Parked Car · Library
      Basement at Closing · Late Train Home · Diner Booth at 5 A.M. · Greenhouse With the Hose On · Someone Vacuuming
      Upstairs · The Shop Before Opening). ⛔ The FILES are Stephen's own songs (his private music repo, `look.url`);
      he is choosing them. Build the stations with the synth bed and leave `url` empty. ⛔ Audio never enters git.
      > 23 Sep. **His eight Tumble songs came (live at `/music/v1/tumble/`, 23 Sep) and his start prompt said to wire a
      > station to one once it answers, so each station plays one of his songs** and falls back to a generated bed of
      > its own (a station kind the synth was never taught is SILENT: the six Build 1 beds would not have covered
      > these). The pairing is MINE, from the files measured (brightness, low end, tempo, dynamics) and two titles:
      > Kitchen After Midnight = Fold It Up (the darkest) · Rain in a Parked Car = Who's Sock Is This (the steadiest)
      > · Library Basement at Closing = Nightmarish Lo-Fi · Late Train Home = Modular Jazz Hub (a hub) · Diner Booth
      > at 5 A.M. = The Suspicious Menu (a menu) · Greenhouse With the Hose On = Gayageum Janggu (plucked, warmest) ·
      > Someone Vacuuming Upstairs = Hard Gayageum Janggu (the fastest) · The Shop Before Opening = Quite The
      > Throwdown (the brightest). ⚖️ **His to change: one `look.url` each in `data/unlocks.json`.** 200 Lint each;
      > each card says which song it plays. `tests/radio.test.mjs` (5, red first): the eight, Lint only, each on one
      > of his songs once, a bed each, Build 1's six untouched. `dev/shots-radio.mjs`: each station starts HIS song
      > at the served path first, then (the file is not in this repo) falls back and its bed SOUNDS on the radio bus
      > (a bed-less control station measures silence, so the check can tell them apart), own icons, the shop at 412
      > and 360. `dev/probe-live-radio.mjs`: on the live site each station plays the real file, proved by its length
      > (watched red on `20260923g`, which had none). **The pictures:** "5 A.M." broke across two lines at 360 and "Lo-Fi"
      > at its hyphen (no break space and no break hyphen now); left, his: "Greenhouse With the Hose / On" leaves "On"
      > alone at 412, and the cards run long. **The check's own fault:** the bed's loudness was first sampled over 1.5 s,
      > and the same kitchen bed read 2.8e-3 at 360 and 5.9e-4 at 412 (a window that short lands in a bar's quiet
      > stretch); it listens for 4 s now, against Build 1's quietest station, not a number (all eight 4.1e-3 to 6.7e-3,
      > Build 1's 1.7e-3 to 7.2e-3; the Steady Rain is left out of that yardstick because its rain has its own bus).
- [x] Tomorrow, cheap and kind: the Odd Bin leaves a note when a mate is one Load away (data) · yesterday's last
      Load is still folded on the dryer top when she comes back · the cat has moved.
      > 23 Sep. **The note had to be TRUE, and nothing could know the next Load:** a Laundry Day Load rolled its seed
      > the moment it started. Now the next seed waits in the save (`nextSeed`), the door plays exactly that seed, and
      > the reunion is drawn from the seed's OWN stream in loadgen, so the size or tier she picks at the door cannot
      > change it (from the main stream 197 of 200 seeds changed their answer with the size; now 0). Every pair is
      > drawn before it, so no Load's pairs moved (`tests/golden-bin-pairs.json`, 60 Loads with socks in the Bin,
      > recorded BEFORE the change); the rate is still 30 percent. What DID move, said out loud: in a Load with socks
      > in the Bin, the draws after the reunion (the other odd socks, the shuffle) come out differently. No Load is
      > stored or replayed but the Daily, and the Daily is built with an empty Bin (its golden record is unchanged). When the next Load brings a mate home, a torn slip
      > of paper stands in the Odd Bin and its line heads the Bin's sheet (eight lines in `src/tomorrow.js`, none names
      > a time: the answers warned against "come back tomorrow"). **Yesterday's Load:** the pairs she put in the
      > basket (up to five) lie rolled on the dryer top right of the coin jar, each painted as itself, until the next
      > Load starts (`lastLoad`). **The cat has moved:** the dresser top, the clean towels by the door, or the rug
      > beside the table, one a day. All of it only between Loads; nothing is a reward.
      > `tests/tomorrow.test.mjs` (4, red first) and `dev/shots-tomorrow.mjs`: a note with a mate one Load away and
      > none without; the door then starts THAT seed and the mate DOES come home; the fold after a real Load, left
      > through the results' own Room button; each cat spot inside nothing, on the phone, under no button; at 412
      > and 360. **Found by looking:** a second row of folded pairs stood in the chair rail on the wall (one row now);
      > the towel cat was inside the top towel; the first fold and cat pictures were of the RESULTS sheet, because
      > the gate went back to the room under it and every geometric check still passed. ⚖️ Taste, his: the towel cat
      > is half behind the table's corner from where she stands, and at 360 the Door tag touches its head; the slip in
      > the Bin is too small to read in the room (its words are in the sheet); the rolled pairs read a little like
      > marbles at room size.

**PHASE 8 COMPLETE, 23 Sep.**

---

## STEPHEN'S CALLS (nothing here is built until he says)

1. **✅✅ PAYING, FINAL: STEPHEN, 2026-09-23.** In his words: *"yes, $0.99, drop the support pack. we will have it
   ont he website for free i think but for sale on the marketplace"*. So: **Tumble is a $0.99 paid app on Google
   Play with NOTHING sold inside**; everything is earned by playing and bought with Lint and Quarters. **The SUPPORT
   THE STUDIO pack below is DROPPED** (and with it Play Billing and its Fable spec). The web copy on lucidwinds.com
   is FREE ("i think": his, and still open to change). This is his own exception to the fleet's one price law
   (that law was written about two STORES pricing one game differently; the web is not a store). What the dropped
   pack would have held (unique socks, a basket, a rug, a dryer, his songs) can come back as EARNED things.
   The entry of 22 Sep, kept for the record:
   **PAYING: ANSWERED BY STEPHEN, 2026-09-22.** In his words: *"we arent going to sell anything in the game. the
   only thing we will sell is like a pack if you donate to support the studio you can get some cool stuff, unique
   socks, baskets, rugs, dryer, and probably a couple really cool songs."*
   So: **NOTHING in the game is sold.** The whole shop stays Lint and Quarters, earned. There is exactly ONE real
   money thing, a **SUPPORT THE STUDIO pack**, and what it contains is its own: unique socks, a basket, a rug, a
   dryer and a couple of his songs, none of which are in the earned shop. This matches what all four outside
   answers asked for (one quiet thank you at most) and it closes the question of selling Quarters: dead.
   ⛔ **NOT BUILT, and not to be built without a spec.** It is outside this design (law: never add anything sold
   that the design does not contain) and it needs a Fable spec first, because of two hard constraints:
   · **Inside a Play app a "donate and get items" pack is a DIGITAL GOOD, so it must go through Play Billing**
     (15 percent), not Stripe and not a tip jar. Play forbids donations outside registered nonprofits, and calling
     it a donation while it grants items is the thing that gets a listing pulled. On the WEB it is Stripe (the
     fleet's payment law).
   · The songs are from his private music repo. ⛔ Audio never enters git (law 11); they are `look.url` like the
     radio stations in phase 8.
   > The original note, for the record: all four answers said do not sell Quarters, do not sell packs singly, one
   > quiet thank you at most, and GPT argued the game should cost $2.99 rather than $0.99.
2. **What must be in before Tumble is LISTED on Play.** Fable's answer: phases 0, 1, 2, 3 and 7, and the free pack.
   The rest ships afterwards as drops; the Play app updates from the web with no new upload, so a drop costs him
   nothing at the store.
3. The radio songs, the name, the price, the target age, the store art (all already his).
