# Sky Wolf Studio: every game, what it is, and where it stands

**As of 5 October 2026.** Built from the live arcade's own catalog (the card list on `lucidwinds.com/portal/`, lucid-winds `main` at `c86ef7f2`), every game folder, and the automated audits run that day. Each game's description is its arcade card's own sentence, word for word. Nothing here is a judgment of how fun a game is: that is Stephen's call, made by playing it.

## 1. What this document is for

Over the next couple of months every game gets worked into a better version of itself. This is the map: what each game is, where its code lives, whether players can see it, and what the automated checks say about it. Use it to pick the next game, to point Claude Code at the right folder, and to know before an edit whether a game is a copy of something that lives elsewhere.

## 2. The studio in one page

- **Sky Wolf Studio** (always singular). Stephen directs and decides every design and economy call. Jessie tests games as a new player. Claude builds.
- **The arcade** is `lucidwinds.com/portal/`: 215 cards. One is the flagship, **Lucid Winds**. 145 are **satellite games** (each a folder `satellites/<name>/` in the lucid-winds repo). Two are **page cards** (LOAF, the cat app, and Whack Box, the party game). 67 are **Lucid Winds' own mini games**, each with a standalone page. **163 are open to players**; the rest are dev-gated (hidden behind the tester gate) or marked "soon".
- **Lucid Winds** is the garden app at the centre: play mini games, earn **Sunbeams**, and every 30 Sunbeams grows a one of one plant (procedural art, its own haiku). It has four tabs: Game, Greenhouse, Nursery, Wild (a real world map).
- **Sunbeams are shared.** Satellite games earn them through the studio's `sunbeam-sdk.js` (hosted at lucidwinds.com), which credits the player's Lucid Winds account, so the arcade is one economy.
- **Hosting:** the lucid-winds repo's `main` branch is the live site (lucidwinds.com and www.lucidwinds.com, two origins). A push to `main` is a deploy.
- **Store apps are the live site.** A Google Play app here is a Trusted Web Activity: it opens the game's live page, so every deploy of that game reaches paying players at once. Steam's Jumping Jimothy is a vendored build.
- **Where code lives:** most games are folders in lucid-winds. Three are build outputs of their own repos (Pixel Petri from the private `tiny-world`, LUMEN from the private `lumen`, PixelMeba from its own): edit the repo, never the folder. Twelve games are **vendored** from their own GitHub repos (13 cards): fix them upstream and re-vendor, never hand-edit the copy.

## 3. The games that make money or are listed

| Game | Where | State |
|---|---|---|
| **Flock the World** | Google Play, $0.99 | Live since 17 Sep 2026 (a Trusted Web Activity of the live page). A Steam package is prepared in `store/ftw-steam`; no Steam release is recorded. |
| **Pixel Petri** (folder `tiny-world`) | Google Play | Published 4 Oct 2026. Its design 19 build is finishing now (5 Oct): live `20261005a` carries his first notes since the sale. |
| **Jumping Jimothy** (folder `stream-hop`) | Steam | v9.4 live since 18 Sep 2026. itch and Play packages are drafted (`store/jimothy-itch`, `store/jimothy-play`); no release recorded. |
| **TUMBLE** | Google Play | Submission prepared; waiting on Stephen's Play Console steps. |
| **Tally**, **Hues** | Listdle (daily puzzles) | Listed (checked 18 Aug 2026). |

## 4. The bar every game is held to

When directing an improvement, these are the studio's standing rules, not suggestions:

1. **Readable fonts** that fit the game's style; correct grammar and punctuation.
2. **No dashes of any kind** in anything a player reads.
3. **One concise sentence** for the card description.
4. **Directions, rules and the objective shown before play starts.**
5. **Touch targets at least 48 px**, measured as rendered at phone size.
6. **A way back to the arcade** from inside the game (the arcade's exit contract, `window.SWS_EXIT`).
7. **Installable games work offline**, and a game's service worker never touches another game's cache.
8. **Saves survive**: a damaged or old save never breaks the game.
9. **Looked at on a phone before it is called done.** A passing test is not a look.
10. Feedback is taken **word for word first**, then sorted: a fault, a taste call (Stephen's), or already known.

## 5. Where the games stand: the worklists

These come from automated checks, so read them as leads, not verdicts. "Built well enough to play" cannot be read from files; it takes a person playing.

**Dev-gated: built, not yet graduated to players (50).** Abduct a Chameleon 3D, Airworthy, Asterism, Aura Off, Blackout, Blockspace, Brim, Burrow Bowl, Conduit, Crease, Deepwell, Doohickey, Dragon Philosophy, Fathom, Gauge, Gerplunk, Glimpse, Glyph Forge, Hush, Impossible Garden, Inkswing, Keepsies, Litter Bug, LOAF, LUMEN, Marrowdeep, Moon Claw, Notch, Parallel, PixelMeba, Puppy Dash, Ripcord, Siege of One, Skyshot, Span, Strata, Swell, Tangent, Tarot Run, The Attic, Tint, Twin Lanterns, Updraft, Wardian, Whack Box, Whistlestop, Wild Wardens, Windup, Wireworm, Yonder.

**Marked "soon" (2):** Rhythm and Vine, Stone Garden.

**No way back to the arcade except the browser's back button (27).** Airworthy, Asterism, Aura Off, Bramblewick, Brim, Crease, Doohickey, Fathom, Gauge, Glimpse, Hush, Inkswing, LUMEN, Marrowdeep, Notch, Pixel Petri, PixelMeba, Span, Strata, Swell, Tint, TUMBLE, Updraft, Wardian, Whistlestop, Windup, Yonder. (Pixel Petri and TUMBLE are store apps, where an arcade exit may not belong: Stephen's call.)

**Relying on the arcade's injected exit button, nothing of their own (28).** Abduct a Chameleon, Abduct a Chameleon 3D, Berry Vine, Cipher Bloom, Doodle Pad, Dragon Philosophy, First Sprout, Flatulence Fighter, Garden Estates, Garden Path, HUNCH, Impossible Garden, Meadow Weave, Mouse Trap, Petal Alchemy, Plot Bloom, Rabbit Ronin, Root Groups, Season Sway, Seed Reel, Snakes & Ladders, Star Field, Stop Motion, Super Slice, Tetroku, Think Fast, Times Table Quest, Wild Wardens.

**A way back that works but is off contract (7).** Aura Farm, Conduit, Dewball, Fox & Basket, Keepsies, Ripcord, Tangent.

**Automated audit flags (41 games).** "parse-without-validation" means saved data is read without checking it, so a damaged save could break the game; "exit-gated-on-frame" means the exit only appears inside a frame; "fetch-without-ok-check" means a network answer is used without checking it succeeded.

- **Asterism:** fetch-without-ok-check
- **Berry Vine:** parse-without-validation
- **Bramblewick:** parse-without-validation
- **Cipher Bloom:** parse-without-validation
- **Conduit:** exit-gated-on-frame
- **Dew Snip:** parse-without-validation
- **Doodle Pad:** parse-without-validation
- **Fox & Basket:** parse-without-validation
- **Garden Estates:** parse-without-validation
- **Garden Path:** parse-without-validation
- **Hedgerow:** parse-without-validation
- **Hexa Hive:** parse-without-validation
- **Hues:** parse-without-validation
- **Impossible Garden:** parse-without-validation
- **Inkbound:** parse-without-validation
- **Keepsies:** exit-gated-on-frame  ·  parse-without-validation  ·  EARN-PROMISE-BROKEN: no sunbeam-sdk.js, never calls Sunbeam.init
- **Marrowdeep:** exit-gated-on-frame
- **Merge & Blast:** parse-without-validation
- **Mouse Trap:** parse-without-validation
- **No Pain, No Gain:** parse-without-validation
- **Petal Alchemy:** parse-without-validation
- **Petal Slice:** parse-without-validation
- **Plot Bloom:** parse-without-validation
- **Rabbit Ronin:** parse-without-validation
- **Ripcord:** exit-gated-on-frame
- **Root Groups:** parse-without-validation
- **Rootbound:** parse-without-validation
- **Seed Pot:** parse-without-validation
- **Seed Reel:** parse-without-validation
- **Snakes & Ladders:** parse-without-validation
- **Star Field:** parse-without-validation
- **Stop Motion:** parse-without-validation
- **Strata:** parse-without-validation
- **Sunforge:** parse-without-validation
- **Swell:** fetch-without-ok-check
- **Tangent:** exit-gated-on-frame
- **Tetroku:** parse-without-validation
- **Think Fast:** parse-without-validation
- **Times Table Quest:** parse-without-validation
- **Whistlestop:** parse-without-validation
- **Windup:** parse-without-validation

**Vendored copies have drifted.** All twelve vendored games carry edits made in the copy (three fleet-wide passes, 27 Aug to 6 Sep 2026: SEO tags, the no-dashes sweep, the brand sweep). The next re-vendor would overwrite them unless they go upstream first.

**Folders with no card:** `satellites/math/` (a source folder) and `satellites/slice-master/` (a built game with its own audit notes, not on the arcade).

**Every game's own notes come first.** Many folders hold an `AUDIT-NOTES.md`, `HANDOFF.md` or design notes (listed under each game below). Read them before calling any work outstanding: several audits are already done.

## 6. Every arcade game, by category

Each card on the arcade (`lucidwinds.com/portal/`) that opens its own game. The description is the card's own player facing sentence, word for word.

### Action (49)

#### Aura Off
- **What it is:** A gesture duel in a public square. No words, no contact. Reference everything, repeat nothing, and never look like you are trying.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/aura-off/` in lucid-winds
- **Build signals:** 3D (three.js), installable (PWA), offline worker; 1,345 KB in 45 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Notes in its folder:** `AUDIT-NOTES.md`, `HANDOFF.md`, `README.md`

#### Berry Vine
- **What it is:** Fire from the seedpod and match three berries to burst the vine before it curls home.
- **Status:** open to players
- **Lives at:** `satellites/berry-vine/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 6,084 KB in 89 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Blobworks
- **What it is:** A whole pinball table sculpted in clay, flipping an eyeball around a monster lab.
- **Status:** open to players
- **Lives at:** `satellites/greenhouse-pinball/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 83,372 KB in 139 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `ART_STATUS.md`, `AUDIT-NOTES.md`, `COMPETITIVE_ROADMAP.md`

#### Bloom Breaker
- **What it is:** A botanical brick breaker with 60 hand built levels, 24 powerups, and a boss.
- **Status:** open to players
- **Lives at:** `satellites/bloom-breaker/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 238 KB in 5 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Bramblewick
- **What it is:** A botanical survivors run where one small sprout holds the night against the swarm.
- **Status:** open to players
- **Lives at:** `satellites/bramblewick/` in lucid-winds
- **Build signals:** canvas 2D; 4,986 KB in 79 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Automated audit flags (candidates, not verdicts):** parse-without-validation
- **Notes in its folder:** `DESIGN_SPEC.md`

#### Bubblenaut
- **What it is:** Trap the runaway alien critters in bubbles and pop them across five treasure worlds.
- **Status:** open to players, marked new
- **Lives at:** `satellites/bubblenaut/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA); 270 KB in 9 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Budburst
- **What it is:** A botanical bubble shooter with 144 levels of bursting buds into bloom.
- **Status:** open to players
- **Lives at:** `satellites/budburst/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA); 313 KB in 10 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Burr Blast
- **What it is:** A physics slingshot where you arc trick seeds into rickety pest forts and chain the collapse.
- **Status:** open to players
- **Lives at:** `satellites/burr-blast/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 10,201 KB in 81 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Burrow Bowl
- **What it is:** Flick the dewball up the lane and sink the burrows. The corner hundreds are earned, never lucky.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/burrow-bowl/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 1,122 KB in 18 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `HANDOFF.md`

#### Cosmic Cadets
- **What it is:** Lift a little Comet Cadet on the night wind and thread the star spires for Perfects.
- **Status:** open to players
- **Lives at:** `satellites/seed-flutter/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 24,845 KB in 233 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Deepwell
- **What it is:** Dig deeper for richer ore, then decide when to turn back before the air runs out.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/deepwell/` in lucid-winds
- **Build signals:** installable (PWA), offline worker; 341 KB in 9 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `BUILD-NOTES.md`

#### Dewball
- **What it is:** Roll a sticky bead of dew through six little worlds where everything smaller than you sticks.
- **Status:** open to players
- **Lives at:** `satellites/dewball/` in lucid-winds
- **Build signals:** 3D (three.js), canvas 2D, earns Sunbeams, installable (PWA), offline worker; 1,326 KB in 24 files
- **Way home:** a way back that works but is off the studio contract
- **Notes in its folder:** `AUDIT-NOTES.md`, `DESIGN.md`

#### Fathom
- **What it is:** The only light is the sound you throw. Toss an echo stone, watch the cave sketch itself in, and move while the dark is busy with the noise.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/fathom/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 1,627 KB in 43 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Flatulence Fighter
- **What it is:** A silent film game of pure composure where you hold it in until a passing bus gives you cover.
- **Status:** open to players
- **Lives at:** `satellites/flatulence-fighter/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 159 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back

#### Frost Watch
- **What it is:** Bloom bursts of warmth from three braziers to melt the falling frost before it reaches the rooftops.
- **Status:** open to players
- **Lives at:** `satellites/frost-watch/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 3,481 KB in 50 files
- **Way home:** has its own way back to the arcade

#### Gerplunk
- **What it is:** A lake at golden hour, a stone in your hand, and one flick. Angle, speed and spin decide the skips. Count them by ear and chase the record with no clock anywhere.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/gerplunk/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 7,608 KB in 71 files
- **Way home:** has its own way back to the arcade

#### Jumping Jimothy
- **What it is:** Hop Seattle's roundest raccoon across the rainy city to the greatest dumpster feast in town.
- **Status:** open to players, marked new
- **Store:** ON SALE: Steam as Jumping Jimothy (v9.4 live 18 Sep 2026; the Steam app is a vendored copy, store/jimothy-steam). itch and Play packages are drafted; no release recorded.
- **Lives at:** `satellites/stream-hop/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 452,303 KB in 1370 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `COURSE-PLAN.md`, `HANDOFF.md`, `SKIN_ART_AUDIT.md`, `SKIN_ART_PLAN.md`

#### Keepsies
- **What it is:** Real Ringer in a ten foot ring. Hold your shooter still, flick through it, and play Dusty Coyle for marbles you keep or lose.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/keepsies/` in lucid-winds
- **Build signals:** 3D (three.js), canvas 2D, installable (PWA); 41,490 KB in 184 files
- **Way home:** a way back that works but is off the studio contract
- **Automated audit flags (candidates, not verdicts):** exit-gated-on-frame  ·  parse-without-validation  ·  EARN-PROMISE-BROKEN: no sunbeam-sdk.js, never calls Sunbeam.init
- **Notes in its folder:** `HANDOFF.md`, `PLAYTESTS.md`, `README.md`

#### Litter Bug
- **What it is:** Play a trial and mint a one of one bug made of trash, then battle for the dumpster.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/litter-bug/` in lucid-winds; VENDORED from `Stephenuffugus/Litter_Bug` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** canvas 2D, installable (PWA), offline worker; 1,922 KB in 114 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `HANDOFF.md`, `README.md`, `ROADMAP.md`, `STATUS.md`

#### Moon Claw
- **What it is:** An honest claw machine. Read the pile, pick your moment, win the plush for keeps.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/moon-claw/` in lucid-winds
- **Build signals:** canvas 2D; 185 KB in 7 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `HANDOFF.md`

#### Nectar Drop
- **What it is:** A botanical peg bouncer where you ricochet a pollen ball through 120 flower meadows.
- **Status:** open to players
- **Lives at:** `satellites/nectar-drop/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 91,415 KB in 406 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Nova Bloom
- **What it is:** A twin stick starfield where every enemy you clear plants a flower that charges your Bloom Bomb.
- **Status:** open to players
- **Lives at:** `satellites/nova-bloom/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 2,552 KB in 47 files
- **Way home:** has its own way back to the arcade

#### Orb Orchard
- **What it is:** Run a tiny world that curls beneath your feet, ringing patches of dew to burst them into sunbeads.
- **Status:** open to players
- **Lives at:** `satellites/orb-orchard/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 103 KB in 3 files
- **Way home:** has its own way back to the arcade

#### Petal Plunge
- **What it is:** Ride a leaf sled down an endless slope with a feral garden Gnome forever on your tail.
- **Status:** open to players
- **Lives at:** `satellites/petal-plunge/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA); 6,266 KB in 60 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `DESIGN_SPEC.md`

#### Petal Slice
- **What it is:** Swipe to slice tossed seed pods and blossoms in one stroke for big combos.
- **Status:** open to players
- **Lives at:** `satellites/petal-slice/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 5,495 KB in 109 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Picnic Panic
- **What it is:** Garden Galaga where your snapdragon defends the picnic from diving swarms.
- **Status:** open to players
- **Lives at:** `satellites/picnic-panic/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 182 KB in 3 files
- **Way home:** has its own way back to the arcade

#### Pit Bike Rally
- **What it is:** Race four pit bikes around a dirt arena and spend your winnings building the ultimate ride.
- **Status:** open to players
- **Lives at:** `satellites/pitbike-rally/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 2,793 KB in 88 files
- **Way home:** has its own way back to the arcade

#### Pollen Panic
- **What it is:** A botanical maze chase where you munch every seed, bloom the pests, and chase sunberries.
- **Status:** open to players
- **Lives at:** `satellites/pollen-panic/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 166 KB in 5 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Pong Arena
- **What it is:** Every pong that ever was on one physics core, from classic to radial to survival.
- **Status:** open to players
- **Lives at:** `satellites/pong/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 267 KB in 6 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Puppy Dash
- **What it is:** Pick your runner, dodge the dog park, and grab the rainbow jetpack for an invincible bone run.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/puppy-dash/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA); 25,667 KB in 184 files
- **Way home:** has its own way back to the arcade

#### Rabbit Ronin
- **What it is:** A rabbit ronin and a dagger on a vine. Swing the bramble canyons, slice foes at full speed, spend carrots at the dojo shop.
- **Status:** open to players, marked new
- **Lives at:** `satellites/rabbit-samurai/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 188 KB in 6 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation
- **Notes in its folder:** `PLAYTESTS.md`

#### Ripcord
- **What it is:** Build a spinning top, wind it by drawing circles, then keep your hands off it while it fights.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/ripcord/` in lucid-winds
- **Build signals:** 3D (three.js), canvas 2D, installable (PWA), offline worker; 180,307 KB in 748 files
- **Way home:** a way back that works but is off the studio contract
- **Automated audit flags (candidates, not verdicts):** exit-gated-on-frame
- **Notes in its folder:** `HANDOFF-3D.md`, `HANDOFF.md`, `PLAYTESTS.md`, `README.md`

#### Siege of One
- **What it is:** Set your traps between waves, then get in the lane and fight beside them.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/siege/` in lucid-winds
- **Build signals:** installable (PWA), offline worker; 367 KB in 10 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `BUILD-NOTES.md`

#### Skitterlings
- **What it is:** Hop your one button critter through 100 worlds collecting skitterlings.
- **Status:** open to players
- **Lives at:** `satellites/skitterlings/` in lucid-winds; VENDORED from `Stephenuffugus/skitterlings` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** canvas 2D, installable (PWA), offline worker; 316 KB in 16 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `HANDOFF.md`, `README.md`, `SUNBEAM-HANDOFF.md`

#### Skyshot
- **What it is:** Pull the sling back and arc seeds up into moving moonbuds high above the meadow.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/skyshot/` in lucid-winds
- **Build signals:** canvas 2D; 306 KB in 8 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `HANDOFF.md`

#### Sled Vine
- **What it is:** Draw a hillside with glowing ink and ride your seed sled down it through rings to the goal flower.
- **Status:** open to players
- **Lives at:** `satellites/sled-vine/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 4,463 KB in 63 files
- **Way home:** has its own way back to the arcade

#### Spore Drift
- **What it is:** Tap to breathe out a little of yourself and drift the still water, drinking every mote smaller than you.
- **Status:** open to players
- **Lives at:** `satellites/spore-drift/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 2,722 KB in 47 files
- **Way home:** has its own way back to the arcade

#### Sproing
- **What it is:** Draw your own critter, then bounce it up an endless beanstalk chasing your best altitude.
- **Status:** open to players
- **Lives at:** `satellites/sproing/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 3,796 KB in 41 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Stop the Light
- **What it is:** Stop the firefly in the gold band, then bank your sparks or risk them all again.
- **Status:** open to players, marked new
- **Lives at:** `satellites/stop-the-light/` in lucid-winds
- **Build signals:** canvas 2D; 298 KB in 6 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `HANDOFF.md`

#### Super Slice
- **What it is:** One knife, every counter: journey the 3D forest, climb the wall, dive the pits, or fall forever.
- **Status:** open to players, marked new
- **Lives at:** `satellites/slice-3d/` in lucid-winds
- **Build signals:** 3D (three.js), canvas 2D, earns Sunbeams, installable (PWA), offline worker; 1,041 KB in 10 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Sweet Spot
- **What it is:** Time your swing and nail the tiny gold sweet spot for an ACE.
- **Status:** open to players, own music
- **Lives at:** `satellites/sweet-spot/` in lucid-winds; VENDORED from `Stephenuffugus/Sweet-Spot` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** canvas 2D, offline worker; 8,950 KB in 82 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `GAME_CARD.md`, `README.md`, `sweet-spot-handoff.md`

#### Tangent
- **What it is:** Spin a dish, let go on the tangent, and land in a small gravity system that a black hole can turn inside out.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/tangent/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA); 45,744 KB in 84 files
- **Way home:** a way back that works but is off the studio contract
- **Automated audit flags (candidates, not verdicts):** exit-gated-on-frame

#### Tempo Grove
- **What it is:** Stack falling blocks to the beat while a golden sweepline clears what you grow on the bar.
- **Status:** open to players
- **Lives at:** `satellites/tempo-grove/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 122 KB in 3 files
- **Way home:** has its own way back to the arcade

#### Think Fast
- **What it is:** A blink fast garden of tiny games where one word flashes and you have a heartbeat to do it.
- **Status:** open to players, marked new
- **Lives at:** `satellites/micro-meadow/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 76 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Tomato Man
- **What it is:** Dash from shadow to shadow gathering aloe before the deadly sun burns you up.
- **Status:** open to players
- **Lives at:** `satellites/tomato-man/` in lucid-winds; VENDORED from `Stephenuffugus/Tomato_Man` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** canvas 2D, installable (PWA), offline worker; 1,114 KB in 13 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `README.md`, `UMBRA-HANDOFF.md`

#### Updraft
- **What it is:** Go fly a kite. Hold to reel in, let go to give it line, slide to lean. Loops, dives and saves come from your thumb, the tail cracks like a ribbon, and an oak named Mabel is waiting to snag you.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/updraft/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 2,152 KB in 61 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Vine Runner
- **What it is:** A pseudo 3D halfpipe dash up a 100 level tower of loops and seeds.
- **Status:** open to players
- **Lives at:** `satellites/vine-runner/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 3,551 KB in 26 files
- **Way home:** has its own way back to the arcade

#### Vinewinder
- **What it is:** Botanical Snake, fully grown, with combos, skins, and daily challenges.
- **Status:** open to players
- **Lives at:** `satellites/vinewinder/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 173 KB in 5 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Wireworm
- **What it is:** Snake where your trail is live wire and every circuit you finish becomes the maze that kills you.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/wireworm/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 282 KB in 9 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `BUILD-NOTES.md`

### Puzzle (35)

#### Acorn Drop
- **What it is:** Spin tumbling acorn pairs to line up four of a kind and crack the pests out of the hollow.
- **Status:** open to players
- **Lives at:** `satellites/tonic-drop/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 34,989 KB in 51 files
- **Way home:** has its own way back to the arcade

#### Blackout
- **What it is:** Every case is generated with exactly one answer and the evidence to prove it.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/blackout/` in lucid-winds
- **Build signals:** installable (PWA), offline worker; 322 KB in 10 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `BUILD-NOTES.md`

#### Bridgevine
- **What it is:** Grow a living vine bridge that sags and swings under honest weight, and crystallize struts with dew.
- **Status:** open to players
- **Lives at:** `satellites/bridgevine/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 6,206 KB in 75 files
- **Way home:** has its own way back to the arcade

#### Conduit
- **What it is:** You are an alien ferrofluid. Route power through an industrial site with your own body as the wire; one number, mass, is your health, ammo, reach, size and stealth at once.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/conduit/` in lucid-winds
- **Build signals:** canvas 2D, offline worker; 9,145 KB in 66 files
- **Way home:** a way back that works but is off the studio contract
- **Automated audit flags (candidates, not verdicts):** exit-gated-on-frame
- **Notes in its folder:** `HANDOFF.md`, `PLAYTESTS.md`

#### Dew Snip
- **What it is:** Snip the moonlit vines so the dewdrop swings through the nectar and lands in the sprout.
- **Status:** open to players
- **Lives at:** `satellites/dew-snip/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 4,811 KB in 74 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Doohickey
- **What it is:** Drag ramps, dominoes, fans and balloons onto the page, press GO, and watch a marble set off beautiful chaos until the bell rings. Build something needlessly complicated. Watch it almost work.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/doohickey/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 1,739 KB in 64 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Flock the World
- **What it is:** A satire sim where you play the surveillance vendor and the whole world learns to fight back.
- **Status:** open to players, marked new
- **Store:** ON SALE: Google Play ($0.99, live since 17 Sep 2026). A Steam package is prepared in store/ftw-steam; no Steam release is recorded.
- **Lives at:** `satellites/flock-the-world/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 14,101 KB in 228 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `HANDOFF.md`, `NOTES-AUG25.md`, `NOTES-AUG27.md`, `PLAN-AUG23.md`

#### Garden Guard
- **What it is:** Plant a garden that fights back with nine botanical towers against the pest parade.
- **Status:** open to players
- **Lives at:** `satellites/garden-td/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA); 1,768 KB in 98 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `DESIGN_SPEC.md`, `DESIGN_SPEC_V2.md`

#### Glyph Forge
- **What it is:** Forge glyphs, hunt combos, break everything.
- **Status:** DEV-GATED (hidden from players)
- **Lives at:** `satellites/glyph-forge/` in lucid-winds; VENDORED from `Stephenuffugus/glyph_forge` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** installable (PWA), offline worker; 457 KB in 37 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `BUILD_PLAN.md`, `DESIGN.md`, `GAME_DESIGN_DEEP.md`, `README.md`

#### Hedgerow
- **What it is:** Grow hedge walls to fence the garden pests into a corner and win back the bed.
- **Status:** open to players
- **Lives at:** `satellites/hedgerow/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 5,338 KB in 111 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Hexa Hive
- **What it is:** Drop honeycomb chips into the comb, stack matching colors to ten, and pop cells in showers of gold.
- **Status:** open to players, marked new
- **Lives at:** `satellites/hexa-hive/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 116 KB in 3 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Hues
- **What it is:** Match a target color by feel before the clock runs out.
- **Status:** open to players
- **Store:** Listed on Listdle (daily puzzle site).
- **Lives at:** `satellites/hues/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 8,007 KB in 120 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Impossible Garden
- **What it is:** Turn the vine arms until impossible angles line up and the wanderer can stroll across the seam.
- **Status:** DEV-GATED (hidden from players)
- **Lives at:** `satellites/impossible-garden/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 81 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Inkbound
- **What it is:** You are a field mouse who shoves rows of stone planters to trap every garden grub in a corner.
- **Status:** open to players
- **Lives at:** `satellites/grubtrap/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 4,750 KB in 147 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Lamplighter
- **What it is:** Place lamps at dusk until every square is lit, never letting one lamp shine into another.
- **Status:** open to players
- **Lives at:** `satellites/lamplighter/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 114 KB in 4 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Line Loom
- **What it is:** A calm transit puzzle where you weave colored threads between stations and little shuttles do the carrying.
- **Status:** open to players
- **Lives at:** `satellites/line-loom/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 119 KB in 4 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### LUMEN
- **What it is:** Drag gems onto a velvet board and turn them until one beam of light bends, splits and gathers into dawn. Every cast counts the light that lands.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/lumen/` in lucid-winds; private repo /workspaces/lumen; this folder is its deploy output, never edit it
- **Build signals:** 3D (three.js), canvas 2D; 5,240 KB in 148 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Meadow Weave
- **What it is:** Turn and lay hex tiles so meadow meets meadow and pond meets pond until the map comes alive.
- **Status:** open to players
- **Lives at:** `satellites/meadow-weave/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 108 KB in 4 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Mouse Trap
- **What it is:** Plant one hedge a turn to box the little garden mouse in before it scurries off the edge.
- **Status:** open to players
- **Lives at:** `satellites/mouse-trap/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 107 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### No Pain, No Gain
- **What it is:** Build a course of clay traps, drop poor little Clayton in, and get paid for every bonk.
- **Status:** open to players, marked new
- **Lives at:** `satellites/no-pain-no-gain/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 89 KB in 3 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### OriVex
- **What it is:** Slot folded paper tiles so every touching edge shares a number in this quiet origami puzzle.
- **Status:** open to players
- **Lives at:** `satellites/petalvex/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 23,305 KB in 54 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Parallel
- **What it is:** Two of you share one set of controls and both have to reach the door at once.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/parallel/` in lucid-winds
- **Build signals:** installable (PWA), offline worker; 267 KB in 11 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `BUILD-NOTES.md`

#### Plot Bloom
- **What it is:** A relaxed placement puzzle where you lay garden pieces beside good neighbors, with no timers and no way to lose.
- **Status:** open to players
- **Lives at:** `satellites/plot-bloom/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 71 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Pollinator Paths
- **What it is:** Draw glowing flight paths that guide every bee, butterfly, and hummingbird home without a collision.
- **Status:** open to players
- **Lives at:** `satellites/pollinator-paths/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 100 KB in 3 files
- **Way home:** has its own way back to the arcade

#### Pop N Lock
- **What it is:** A neon 80s puzzle battle where you bury rival b-boy pests in worthless grey Chaff.
- **Status:** open to players
- **Lives at:** `satellites/chaff-wars/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 39,609 KB in 104 files
- **Way home:** has its own way back to the arcade

#### Root Weave
- **What it is:** Drag the glowing bulbs until no two roots cross and feel the knot loosen into living green vine.
- **Status:** open to players
- **Lives at:** `satellites/root-weave/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 4,861 KB in 59 files
- **Way home:** has its own way back to the arcade

#### Rootbound
- **What it is:** A botanical sliding puzzle where you shuffle planters aside to slide the golden bloom free.
- **Status:** open to players
- **Lives at:** `satellites/rootbound/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 94 KB in 4 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Rule Root
- **What it is:** Push the word tiles to rewrite the rules of the garden, spelling new truths like STONE IS YOU.
- **Status:** open to players
- **Lives at:** `satellites/rule-root/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 140 KB in 5 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Seed Pot
- **What it is:** Drop seeds into the pot and merge matching pairs up the ladder from seed to bloom.
- **Status:** open to players
- **Lives at:** `satellites/seed-pot/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 10,904 KB in 85 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Star Field
- **What it is:** Plant one star flower in every row, column, and constellation without letting two touch.
- **Status:** open to players
- **Lives at:** `satellites/star-field/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 85 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Sunforge
- **What it is:** Stick falling pieces to the golden sun and finish rings to crush them inward.
- **Status:** open to players
- **Lives at:** `satellites/ring-stacker/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 136 KB in 8 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Tetroku
- **What it is:** Drag leaf sprigs onto the midnight trellis and fill rows to clear them in showers of pollen.
- **Status:** open to players, marked new
- **Lives at:** `satellites/leaf-fit/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 104 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Tinker Loft
- **What it is:** Build a happy little chain reaction from planks, balloons, and dominoes to carry a marble home.
- **Status:** open to players
- **Lives at:** `satellites/tinker-loft/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 118 KB in 4 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### TUMBLE
- **What it is:** The dryer opens and a heap of socks tumbles onto the table. Find every twin, roll the pair into a ball, and toss it in the basket.
- **Status:** open to players, marked new
- **Store:** Google Play submission PREPARED, waiting on Stephen's Play Console steps (store/tumble-play).
- **Lives at:** `satellites/tumble/` in lucid-winds
- **Build signals:** 3D (three.js), canvas 2D, installable (PWA), offline worker; 4,535 KB in 232 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Notes in its folder:** `DESIGN.md`, `HANDOFF-OPUS-SEP22-MORNING.md`, `HANDOFF-OPUS-T2.md`, `HANDOFF.md`, `README.md`

#### Whistlestop
- **What it is:** Snap a wooden train set together on the rug, pull the whistle, and then work the switches so three little trains all get home without meeting nose to nose.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/whistlestop/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 3,268 KB in 65 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

### Creative and toys (24)

#### Airworthy
- **What it is:** Fold a paper airplane crease by crease, see the air move over its wings in a wind tunnel, throw it across the gym, then bend the elevators a hair and throw it again. Every crease counts.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/airworthy/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 2,371 KB in 79 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Asterism
- **What it is:** The real night sky over your head, right now. Join the stars into a shape of your own, name it, and read the myth the sky writes for it.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/asterism/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 3,193 KB in 47 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Automated audit flags (candidates, not verdicts):** fetch-without-ok-check
- **Notes in its folder:** `BUILD-NOTES.md`

#### Aura Farm
- **What it is:** Farm feelings from a living crowd. Lift them into joy or drain them dry, and choose what you become.
- **Status:** open to players, marked new
- **Lives at:** `satellites/aura-farm/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 227 KB in 6 files
- **Way home:** a way back that works but is off the studio contract
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Bandit's Box
- **What it is:** A quiet box of fidget toys that feel real under your finger. No ads, nothing to unlock.
- **Status:** open to players, marked new
- **Lives at:** `satellites/bandits-box/` in lucid-winds
- **Build signals:** installable (PWA), offline worker; 392 KB in 12 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Blockspace
- **What it is:** Fill an empty space with colored blocks, spin it, and hear it, because every color is a note.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/blockspace/` in lucid-winds
- **Build signals:** 3D (three.js), canvas 2D, installable (PWA), offline worker; 831 KB in 13 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `HANDOFF.md`

#### Create A Critter
- **What it is:** Draw any creature and watch it puff up into a living 3D buddy you can feed, cuddle, and keep.
- **Status:** open to players, marked new
- **Lives at:** `satellites/create-a-critter/` in lucid-winds
- **Build signals:** 3D (three.js), canvas 2D, earns Sunbeams, offline worker; 858 KB in 8 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `GAMES-PLAN.md`, `HANDOFF.md`

#### Doodle Pad
- **What it is:** A free drawing pad stuffed with pens, brushes, stamps, and every color you can mix.
- **Status:** open to players
- **Lives at:** `satellites/doodle-pad/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 99 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### First Sprout
- **What it is:** An idle garden that keeps growing from one dark handful of soil even while you sleep.
- **Status:** open to players
- **Lives at:** `satellites/first-sprout/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 84 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back

#### Flipbook
- **What it is:** A pocket spiral notebook for drawing little animations page by page.
- **Status:** open to players
- **Lives at:** `satellites/flipbook/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 160 KB in 9 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### HUNCH
- **What it is:** A drawing duel against Claude, the studio's premium flagship.
- **Status:** open to players, premium
- **Lives at:** `satellites/hunch/` in lucid-winds; VENDORED from `Stephenuffugus/Hunch` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 178 KB in 16 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Notes in its folder:** `GAME_CARD.md`, `HUNCH_BUILD_PLAN.md`, `README.md`

#### Inkswing
- **What it is:** Grab a brass pendulum and throw it. A pen underneath draws the swing as it slowly dies, and the lengths you set hum the chord your drawing is made of. Keep the ones you love.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/inkswing/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 2,568 KB in 48 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### LOAF
- **What it is:** Scan your real cat into a one of one card, then meet her in 3D and play.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `/loaf.html` in lucid-winds

#### Petal Alchemy
- **What it is:** Mix Seed, Water, Sun, Soil, and Air to discover a whole garden of plants, weather, and creatures.
- **Status:** open to players
- **Lives at:** `satellites/petal-alchemy/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 73 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Pixel Petri
- **What it is:** A pixel petri dish of a world: paint land and water, drop in people, animals and monsters, and watch it live on its own. They graze, hunt, raise families and head home when night falls.
- **Status:** open to players, marked new
- **Store:** ON SALE: Google Play as Pixel Petri (published 4 Oct 2026; the Play app is the live page, so every deploy reaches buyers).
- **Lives at:** `satellites/tiny-world/` in lucid-winds; private repo Stephenuffugus/tiny-world (design docs, tests, STATUS.md there); this folder is its deploy output, never edit it
- **Build signals:** canvas 2D, installable (PWA), offline worker; 9,063 KB in 670 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### PixelMeba
- **What it is:** Grow a tiny living world in a dish. Change one thing, press play, and see who finds something to eat.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/pixelmeba/` in lucid-winds; built from its own repo (this folder is a deploy output, stamped by version.json); never edit it
- **Build signals:** plain HTML; 1,586 KB in 15 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Power Scalers
- **What it is:** Forge original characters, grow them on a vast skill web, then send them to battle in the arena.
- **Status:** open to players
- **Lives at:** `satellites/power-scalers/` in lucid-winds
- **Build signals:** earns Sunbeams; 308 KB in 8 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Silt
- **What it is:** Paint silt, water, fire, and seed onto a pocket of living earth and let real physics take over.
- **Status:** open to players
- **Lives at:** `satellites/silt/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 3,426 KB in 61 files
- **Way home:** has its own way back to the arcade

#### Stop Motion
- **What it is:** Snap photos of your toys frame by frame and turn them into stop motion movies.
- **Status:** open to players
- **Lives at:** `satellites/stop-motion/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 92 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Strata
- **What it is:** Brush and chisel a cliff face until a creature nobody has ever seen comes out of the stone. Every skeleton is generated once. Mount it, name it, and hang it in a museum that is only yours.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/strata/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 4,347 KB in 50 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Swell
- **What it is:** Hold the screen and an orchestra swells out of silence. Let go and it resolves, always. You cannot play a wrong note. You can only conduct.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/swell/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 7,852 KB in 41 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Automated audit flags (candidates, not verdicts):** fetch-without-ok-check

#### The Attic
- **What it is:** Rummage one of one fake vintage records, comics, tapes, toys and handhelds, and pray for factory sealed.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/attic/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA); 370 KB in 11 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Wardian
- **What it is:** A sealed jar that lives on your time. Moss, ferns and small bugs grow while you are away, night falls when it falls outside, and nothing in the jar can ever die.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/wardian/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 4,243 KB in 49 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Wild Wardens
- **What it is:** Tame the wild, tend your grove, and walk the real world for territory.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/wild-wardens/` in lucid-winds; VENDORED from `Stephenuffugus/BarBrawl` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** Expo web build; 3,998 KB in 26 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back

#### Windup
- **What it is:** Punch holes in a paper strip, turn the crank yourself, and hear your song plink out of a little brass music box. Wrap it up and send it to someone.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/windup/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 2,079 KB in 37 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

### Math (12)

#### Brim
- **What it is:** Two glasses on a shelf and two fractions under them. Tap the fuller one, then watch the water rise and show you whether you were right.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/brim/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 732 KB in 62 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Crease
- **What it is:** A paper strip pinned between zero and one. Fold it, pinch it, and the fractions show up in the creases you made yourself.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/crease/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 799 KB in 71 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Gauge
- **What it is:** A precision bench and a loupe. Look between two numbers that were touching and ten new ones open up in the gap.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/gauge/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 778 KB in 60 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Glimpse
- **What it is:** Fireflies blink on in a dark meadow and blink off again before you can count them. How many were there.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/glimpse/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 634 KB in 60 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Hush
- **What it is:** A deer in a dawn clearing. Step closer while it grazes and freeze the moment its head comes up. Every creature you do not startle stays.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/hush/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 650 KB in 64 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Merge & Blast
- **What it is:** Tap matching numbers to blast them into the next number up and climb into the thousands.
- **Status:** open to players
- **Lives at:** `satellites/merge-blast/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams, installable (PWA), offline worker; 127 KB in 8 files
- **Way home:** has its own way back to the arcade
- **Automated audit flags (candidates, not verdicts):** parse-without-validation
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Notch
- **What it is:** A dim workshop. Turn a carved piece in your head until it seats into its notch, then find it again inside the carving.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/notch/` in lucid-winds
- **Build signals:** 3D (three.js), canvas 2D, installable (PWA), offline worker; 1,083 KB in 56 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Span
- **What it is:** Two stone piers across a canyon. The span only lies flat when both sides match, so the equals sign turns into something you can see.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/span/` in lucid-winds
- **Build signals:** installable (PWA), offline worker; 1,039 KB in 52 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Tally
- **What it is:** Combine the numbers and hit the target, with a pocketful of pals cheering you on.
- **Status:** open to players
- **Store:** Listed on Listdle (daily puzzle site).
- **Lives at:** `satellites/tally/` in lucid-winds; VENDORED from `Stephenuffugus/Tally` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** Vite build, installable (PWA), offline worker; 2,132 KB in 8 files
- **Way home:** has its own way back to the arcade

#### Times Table Quest
- **What it is:** A big colorful multiplication chart you play on, from counting by 10s to filling in missing products.
- **Status:** open to players
- **Lives at:** `satellites/multiplication-chart/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 159 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Tint
- **What it is:** A dyer's workshop with recipes in jugs. Mix until your colour comes out the same as the one on the bench, at any size of batch.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/tint/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 1,245 KB in 54 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

#### Yonder
- **What it is:** A road running out to a signpost in the distance. Say how far along the number falls, then walk out and see where it really was.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/yonder/` in lucid-winds
- **Build signals:** canvas 2D, installable (PWA), offline worker; 601 KB in 53 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button

### Word (7)

#### Blooming Words
- **What it is:** Trace letters, grow a crossword garden, press wildflowers for pollen.
- **Status:** open to players
- **Lives at:** `satellites/blooming-words/` in lucid-winds
- **Build signals:** earns Sunbeams, installable (PWA); 669 KB in 10 files
- **Way home:** has its own way back to the arcade

#### Cipher Bloom
- **What it is:** Crack the swapped letter cipher hiding a short garden verse, with no clock and no way to lose.
- **Status:** open to players
- **Lives at:** `satellites/cipher-bloom/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 90 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Fox & Basket
- **What it is:** Guess the word one letter at a time before the fox reaches the picnic basket.
- **Status:** open to players, marked new
- **Lives at:** `satellites/fox-basket/` in lucid-winds
- **Build signals:** earns Sunbeams; 63 KB in 3 files
- **Way home:** a way back that works but is off the studio contract
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Letter Launch
- **What it is:** Plink letter tiles through bumpers, then trace words to score.
- **Status:** open to players
- **Lives at:** `satellites/letter-launch/` in lucid-winds; VENDORED from `Stephenuffugus/letter_launch` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** canvas 2D; 3,492 KB in 22 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `HANDOFF_letter_launch.md`, `LUCID_WINDS_HANDOFF.md`, `MASTER_PLAN.md`, `README.md`

#### Mini Crossword
- **What it is:** A five by five crossword you can finish with your morning tea.
- **Status:** open to players
- **Lives at:** `satellites/mini-crossword/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 124 KB in 3 files
- **Way home:** has its own way back to the arcade

#### Root Groups
- **What it is:** Find the four secret groups of four hiding in sixteen tiles, with endless fair boards.
- **Status:** open to players
- **Lives at:** `satellites/root-groups/` in lucid-winds
- **Build signals:** earns Sunbeams; 78 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Word Lightning
- **What it is:** Spell as many words as you can from eight crackling letters before the storm clock runs out.
- **Status:** open to players
- **Lives at:** `satellites/bloomzap/` in lucid-winds
- **Build signals:** earns Sunbeams; 191 KB in 4 files
- **Way home:** has its own way back to the arcade

### Card (7)

#### Bramble Court
- **What it is:** A three by three card duel in the old Triple Triad tradition where the soil itself takes sides.
- **Status:** open to players
- **Lives at:** `satellites/bramble-court/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 128 KB in 3 files
- **Way home:** has its own way back to the arcade

#### Dragon Philosophy
- **What it is:** Swear to a dragon patron and shape an ideology instead of building a deck.
- **Status:** DEV-GATED (hidden from players)
- **Lives at:** `satellites/dragon-philosophy/` in lucid-winds
- **Build signals:** Vite build; 805 KB in 16 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back

#### Loop Warden
- **What it is:** Your hero walks the loop on their own, so your real game is the world you deal onto the road.
- **Status:** open to players
- **Lives at:** `satellites/loop-warden/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 133 KB in 4 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Marrowdeep
- **What it is:** Roll a party of dice, decide who faces what, and bury the ones who fall; their callings come back as cards.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/marrowdeep/` in lucid-winds
- **Build signals:** installable (PWA), offline worker; 14,469 KB in 118 files
- **Way home:** STRANDED: no way back to the arcade except the browser back button
- **Automated audit flags (candidates, not verdicts):** exit-gated-on-frame

#### Season Sway
- **What it is:** Swipe visitor cards left or right to keep Sun, Rain, Soil, and Wildlife in balance.
- **Status:** open to players
- **Lives at:** `satellites/season-sway/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 98 KB in 4 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Notes in its folder:** `AUDIT-NOTES.md`

#### Sixfold
- **What it is:** Read your foe in a six stance duel and break the bind in under a minute.
- **Status:** open to players, own music
- **Lives at:** `satellites/sixfold/` in lucid-winds; VENDORED from `Stephenuffugus/sixfold` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** earns Sunbeams, installable (PWA), offline worker; 33,962 KB in 123 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `HANDOFF_SIXFOLD.md`, `README.md`

#### Tarot Run
- **What it is:** A fast combo card run through a reading of blades.
- **Status:** DEV-GATED (hidden from players)
- **Lives at:** `satellites/tarot-run/` in lucid-winds; VENDORED from `Stephenuffugus/Tarot_Run` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** installable (PWA), offline worker; 442 KB in 24 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `DESIGN.md`, `PLAN_OF_ATTACK.md`, `README.md`

### Board (6)

#### Fence Off
- **What it is:** Race your pawn to the far side while fencing your rival into the long way around.
- **Status:** open to players
- **Lives at:** `satellites/fence-off/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 122 KB in 3 files
- **Way home:** has its own way back to the arcade

#### Garden Estates
- **What it is:** A garden spin on the property board game where the last gardener standing wins.
- **Status:** open to players
- **Lives at:** `satellites/garden-estates/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 120 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Garden Path
- **What it is:** A sweet color card race down the rainbow path to the Garden Throne.
- **Status:** open to players
- **Lives at:** `satellites/garden-path/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 122 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Jade Garden
- **What it is:** A calm botanical Mahjong solitaire where every deal is guaranteed solvable.
- **Status:** open to players
- **Lives at:** `satellites/mahjong/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 7,259 KB in 71 files
- **Way home:** has its own way back to the arcade

#### Mosaic Draft
- **What it is:** Draft glazed tiles from the kilns and lay them into a bright scoring wall against a thinking rival.
- **Status:** open to players
- **Lives at:** `satellites/mosaic-draft/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 125 KB in 3 files
- **Way home:** has its own way back to the arcade

#### Snakes & Ladders
- **What it is:** Roll the die, climb the ladders, dodge the snakes, and land exactly on 100 to win.
- **Status:** open to players
- **Lives at:** `satellites/snakes-ladders/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 139 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

### Dice (2)

#### Seed Reel
- **What it is:** A garden slot roguelike where you slide one tile before each harvest so a spin is never just luck.
- **Status:** open to players
- **Lives at:** `satellites/seed-reel/` in lucid-winds
- **Build signals:** canvas 2D, earns Sunbeams; 95 KB in 3 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Automated audit flags (candidates, not verdicts):** parse-without-validation

#### Sprout Dice
- **What it is:** A botanical dice roguelike where every roll plants thorns, heals, and bark across 12 floors.
- **Status:** open to players
- **Lives at:** `satellites/sprout-dice/` in lucid-winds
- **Build signals:** earns Sunbeams; 3,197 KB in 59 files
- **Way home:** has its own way back to the arcade

### Party (4)

#### Abduct a Chameleon
- **What it is:** Paint yourself to match the ground and hold still until the alien hunters give up.
- **Status:** open to players
- **Lives at:** `satellites/abduct-a-chameleon/` in lucid-winds; VENDORED from `Stephenuffugus/abduct_a_chameleon` (fix upstream and re-vendor; never hand-edit the copy)
- **Build signals:** canvas 2D; 10,115 KB in 195 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Notes in its folder:** `README.md`

#### Abduct a Chameleon 3D
- **What it is:** The 3D multiplayer chameleon hunt, live with friends and still in development.
- **Status:** DEV-GATED (hidden from players)
- **Lives at:** `satellites/abduct-a-chameleon/` in lucid-winds; VENDORED from `Stephenuffugus/abduct_a_chameleon` (fix upstream and re-vendor; never hand-edit the copy); card opens `/satellites/abduct-a-chameleon/abduct-3d.html`
- **Build signals:** canvas 2D; 10,115 KB in 195 files
- **Way home:** no exit of its own; the arcade's injected exit button is the way back
- **Notes in its folder:** `README.md`

#### Twin Lanterns
- **What it is:** You each see half the garden. Gift one stone, light the path together, keep the pair streak alive.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `satellites/twin-lanterns/` in lucid-winds
- **Build signals:** plain HTML; 47 KB in 5 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`, `HANDOFF.md`

#### Whack Box
- **What it is:** Party night. One big screen, everyone joins on their phone, and six games to pick from on the couch.
- **Status:** DEV-GATED (hidden from players), marked new
- **Lives at:** `/party/host.html?v=20260808b` in lucid-winds

### Pattern and memory (1)

#### Shell Shuffle
- **What it is:** Watch the cups, find the ball, build a daily streak.
- **Status:** open to players
- **Lives at:** `satellites/shell-shuffle/` in lucid-winds
- **Build signals:** earns Sunbeams, installable (PWA), offline worker; 821 KB in 10 files
- **Way home:** has its own way back to the arcade
- **Notes in its folder:** `AUDIT-NOTES.md`

## 7. The mini games inside Lucid Winds

Lucid Winds (the flagship garden app) carries its own games: each one earns Sunbeams toward a one of one plant, and each also has a standalone card on the arcade. Code lives in `games/<id>.js` (loaded on demand) or inline in `index.html`; the standalone pages are `play/<id>.html`. The full engineering inventory is `GAMES_MANIFEST.md` (May 2026).

### Puzzle (17)

#### 15 Puzzle
- **What it is:** Slide tiles into the empty space on boards from three by three up to five by five.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/slider.js`, standalone page `play/slider.html` (17 KB)

#### Bee's Pollen Sort
- **What it is:** Sort pollen into matching vials across sixty levels.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/colorsort.js`, standalone page `play/colorsort.html` (32 KB)

#### Block Drop
- **What it is:** Arrange falling blocks to clear rows.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/petalfall.js`, standalone page `play/petalfall.html` (49 KB)

#### Dew Trail
- **What it is:** Drag one unbroken trail from 1 through every cell in order without ever crossing it.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/dewtrail.js`, standalone page `play/dewtrail.html` (19 KB)

#### Flood Fill
- **What it is:** Tap a color to flood from the top-left.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/flood.js`, standalone page `play/flood.html` (23 KB)

#### Garden Lines
- **What it is:** Place tiles to build matching lines.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/gardenlines.js`, standalone page `play/gardenlines.html` (40 KB)

#### Lights Out
- **What it is:** Tap a light to toggle it and its four neighbors.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/lights.js`, standalone page `play/lights.html` (6 KB)

#### Minesweeper
- **What it is:** Dig safely, using the numbers to work out where the mines are hiding.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/mines.js`, standalone page `play/mines.html` (13 KB)

#### Mosaic Garden
- **What it is:** Simple solo filler, no drafting: pull colored tiles to complete rows.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/mosaic.js`, standalone page `play/mosaic.html` (45 KB)

#### Nonogram Bloom
- **What it is:** Nonogram logic: fill and cross squares from clues to reveal a picture.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/picross.html`

#### Petal Match
- **What it is:** Match three flowers to clear dew, break thorns, and chain cascades.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/petalmatch.js`, standalone page `play/petalmatch.html` (180 KB)

#### Root Flow
- **What it is:** Draw paths to connect matching roots.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/rootflow.js`, standalone page `play/rootflow.html` (34 KB)

#### Root Maze
- **What it is:** Navigate the shifting maze before the computer.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/rootmaze.js`, standalone page `play/rootmaze.html` (39 KB)

#### Root Rush
- **What it is:** Slide the roots aside to free a sprouting seed across sixty five levels.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/rootrush.js`, standalone page `play/rootrush.html` (39 KB)

#### Sokoban
- **What it is:** Push crates onto their targets, remembering a crate can only ever be pushed.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/sokoban.html`

#### Tower of Hanoi
- **What it is:** Stack every disc on the far peg.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/hanoi.js`, standalone page `play/hanoi.html` (20 KB)

#### Vine Puzzle
- **What it is:** Rotate vine tiles to connect the flow.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/pipe.js`, standalone page `play/pipe.html` (10 KB)

### Creative and toys (10)

#### Bloom Wheel
- **What it is:** Draw botanical mandalas on a spinning canvas synced to a beat.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/bloomwheel.html`

#### Breathing Garden
- **What it is:** Follow four guided breathing patterns and watch a bloom open with every breath.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/breathing.js`, standalone page `play/breathing.html` (30 KB)

#### Color Garden
- **What it is:** Tap to fill botanical coloring pages from a palette of twenty three colors.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/colorgarden.js`, standalone page `play/colorgarden.html` (28 KB)

#### Music Studio
- **What it is:** Make real songs fast: song starters, 80+ real instruments, hum a melody into the grid, live keys and music video export.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/song.js`, standalone page `play/song.html` (6 KB)

#### Pixel Garden
- **What it is:** Paint pixel art from twenty four botanical colors and save it as a PNG.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/pixelgarden.js`, standalone page `play/pixelgarden.html` (33 KB)

#### Pom Pond
- **What it is:** A chore tracker where kids earn Poms, hatch collectible critters into their pond, and fill buckets to unlock rewards a parent picks, and it opens in its own tab.
- **Status:** open to players
- **Lives at:** its own site, `https://pom-pond.web.app` (opens in its own tab)

#### Rhythm and Vine
- **What it is:** Tap in time with the music for Perfect, Great, or Good.
- **Status:** SOON (not open yet)
- **Lives at:** inside Lucid Winds: code `games/rhythmvine.js`, standalone page `play/rhythmvine.html` (21 KB)

#### Seed Toss
- **What it is:** Flick seeds into the pot, with real physics and wind at the higher levels.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/seedtoss2.js`, standalone page `play/seedtoss2.html` (36 KB)

#### Stone Garden
- **What it is:** Stack stones in zen balance to a target height.
- **Status:** SOON (not open yet)
- **Lives at:** inside Lucid Winds: code `games/stonegarden.js`, standalone page `play/stonegarden.html` (35 KB)

#### Story Seeds
- **What it is:** A daily writing prompt with room to save everything you write.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/storyseeds.js`, standalone page `play/storyseeds.html` (12 KB)

### Math (4)

#### 2048
- **What it is:** Swipe to merge matching numbers and climb your way to 2048.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/merge.js`, standalone page `play/merge.html` (21 KB)

#### Fast Math
- **What it is:** A sixty second drill of adding, subtracting, and multiplying.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/numbergarden.js`, standalone page `play/numbergarden.html` (30 KB)

#### Kakuro
- **What it is:** Fill cells so each run adds to its clue.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/kakuro.js`, standalone page `play/kakuro.html` (44 KB)

#### Sudoku
- **What it is:** Fill every row, column and box with 1-9.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/sudoku.js`, standalone page `play/sudoku.html` (16 KB)

### Word (4)

#### Vine Words
- **What it is:** Connect neighboring letters to find as many words as you can in two minutes.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/vinewords.js`, standalone page `play/vinewords.html` (28 KB)

#### Word Search
- **What it is:** Swipe across letters to spell the words in themed puzzle packs.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/wordsearch.js`, standalone page `play/wordsearch.html` (19 KB)

#### Word Sprout
- **What it is:** Find the hidden 5-letter word in 6 guesses.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/sprout.js`, standalone page `play/sprout.html` (44 KB)

#### Word Trellis
- **What it is:** Build words on a 15×15 board against the computer, our botanical take on Scrabble.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/trellis.js`, standalone page `play/trellis.html` (63 KB)

### Card (11)

#### Bleeding Hearts
- **What it is:** Classic Hearts, where you dodge every heart and the Queen of Spades.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/bleedinghearts.js`, standalone page `play/bleedinghearts.html` (40 KB)

#### Cribbage
- **What it is:** Count to fifteen and peg your way around the board to a hundred and twenty one.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/cribbage.js`, standalone page `play/cribbage.html` (42 KB)

#### Euchre
- **What it is:** Four player trick taking with bowers and a computer partner.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/bowergarden.js`, standalone page `play/bowergarden.html` (61 KB)

#### FreeCell
- **What it is:** Every card is face up, with four free cells to maneuver through.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/freecell.js`, standalone page `play/freecell.html` (18 KB)

#### Garden Rummy
- **What it is:** Draw, discard, build sets and runs, and go out before anyone else.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/juniper.js`, standalone page `play/juniper.html` (37 KB)

#### Garden Spades
- **What it is:** Classic Spades, where you bid your tricks and spades is always trump.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/gardenspades.js`, standalone page `play/gardenspades.html` (43 KB)

#### Golf Solitaire
- **What it is:** Move cards one rank up or down to the waste.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/golf.js`, standalone page `play/golf.html` (14 KB)

#### Klondike
- **What it is:** The classic solitaire, building four foundations from Ace up to King.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/klondike.js`, standalone page `play/klondike.html` (28 KB)

#### Pyramid
- **What it is:** Remove pairs of cards that add to thirteen, and Kings on their own.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/pyramid.js`, standalone page `play/pyramid.html` (15 KB)

#### Spider
- **What it is:** Build King to Ace runs by suit in one, two, or four suit games.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/spider.js`, standalone page `play/spider.html` (15 KB)

#### TriPeaks
- **What it is:** Build up or down to clear three peaks.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/tripeaks.js`, standalone page `play/tripeaks.html` (15 KB)

### Board (11)

#### Backgammon
- **What it is:** Roll, move, bear off all 15 first.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/backgammon.html`

#### Checkers
- **What it is:** Jump pieces, reach the far side to crown a King.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/checkers.html`

#### Chess
- **What it is:** Classic chess vs. computer.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/chess.js`, standalone page `play/chess.html` (69 KB)

#### Code Breaker
- **What it is:** Crack the hidden 4-color code.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/mastermind.html`

#### Five in a Row
- **What it is:** Get five in a row before the computer.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/vinecross.js`, standalone page `play/vinecross.html` (24 KB)

#### Four in a Row
- **What it is:** Drop pieces to connect four in a row.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/c4.js`, standalone page `play/c4.html` (23 KB)

#### Go (Living Stones)
- **What it is:** Go: 24 puzzles + full MCTS play.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/livingstones.js`, standalone page `play/livingstones.html` (41 KB)

#### Mancala
- **What it is:** Mancala: sow seeds, capture into your store.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/seedsow.js`, standalone page `play/seedsow.html` (22 KB)

#### Master Pollinator
- **What it is:** Engine builder: collect pollen, race to 15 Growth.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/pollen.js`, standalone page `play/pollen.html` (87 KB)

#### Reversi
- **What it is:** Place pieces to surround and flip your opponent.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/reversi.html`

#### Sea Battle
- **What it is:** Hunt hidden vessels on a 10×10 grid.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/battleship.js`, standalone page `play/battleship.html` (54 KB)

### Dice (3)

#### Farkle
- **What it is:** Roll six dice, keep the ones that score, then bank or bust.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/farkle.html`

#### Shut the Box
- **What it is:** Roll two dice and shut tiles until the whole box is closed twice.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/doubleshutter.html`

#### Yacht-Sea
- **What it is:** Sail the five-dice classic, filling thirteen nautical categories for the best score.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/yahtzee.html`

### Pattern and memory (7)

#### Daily Bloom
- **What it is:** A daily cognitive workout of eight exercises in about four minutes.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/dailybloom.js`, standalone page `play/dailybloom.html` (46 KB)

#### Echo
- **What it is:** Watch the pattern flash, then repeat it.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/simon.js`, standalone page `play/simon.html` (9 KB)

#### Memory
- **What it is:** Flip two cards a turn until you have matched every pair.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/memory.js`, standalone page `play/memory.html` (8 KB)

#### Memory Meadow
- **What it is:** Watch symbols, count back, tap the ones you saw.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/recall.js`, standalone page `play/recall.html` (11 KB)

#### Speed Sort
- **What it is:** Sort cards fast by matching any attribute to a pile.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/pottingbench.js`, standalone page `play/pottingbench.html` (12 KB)

#### Stop at Ten
- **What it is:** Start the clock and stop it at exactly ten seconds.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `games/stopten.js`, standalone page `play/stopten.html` (37 KB)

#### Three Sisters
- **What it is:** Tap 3 cards where each trait is all-same or all-different.
- **Status:** open to players
- **Lives at:** inside Lucid Winds: code `inline in index.html`, standalone page `play/set.html`
