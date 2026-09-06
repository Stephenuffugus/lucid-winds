# STUDIO COHESION — the plan

Written 2026-08-16 after someone told Stephen the studio "looks like a gumbo":
different thumbnails, a giant list, overwhelming, not cohesive. They were
right, and the reasons are measurable rather than a matter of taste.

## What is actually wrong

Measured against the live site, not guessed.

**1. The navigation reaches 37% of the studio.** `renderGarden()` sets
`sats = []` for every real category tab, so the 113 satellites appear only
under All, New, In Development and Favorites. Filtering by Puzzle or Card
searches 67 in-repo games and silently drops the other 113. Every flagship —
Jumping Jimothy, Dewball, Aura Farm, Litter Bug, The Attic, Abduct a
Chameleon, Flock the World, Bandit's Box — is reachable only by scrolling a
180 card wall or already knowing its name. **The best work is in the 63% the
navigation cannot see.**

**2. Six incompatible art styles in one grid.** From a contact sheet of all
107 thumbs:
- painted illustration (bramblewick, burr-blast, nectar-drop, picnic-panic,
  petal-plunge, seed-pot, tomato-man, tonic-drop, garden-td)
- flat vector characters (bandits-box, chaff-wars, loaf, bubblenaut, sproing)
- raw UI menus, which are photographs of buttons (cipher-bloom, lamplighter,
  mini-crossword, moon-claw, stop-motion, doodle-pad)
- walls of small text (flock-the-world, season-sway, rabbit-samurai)
- near black tiles that read as broken or empty (micro-meadow, plot-bloom,
  spore-drift, no-pain-no-gain, tinker-loft, silt, nova-bloom, seed-reel)
- title cards, which are text as image and unreadable at grid size
  (fox-basket, burrow-bowl, word-lightning, the-attic, stop-the-light)

**3. Two aspect ratios in one grid.** 75 square thumbs, 30 portrait, plus
strays. A third of the grid is centre cropped inconsistently.

**4. One flat A to Z list of 180 games** under the heading "every game in the
studio". Nothing says where to start.

The hero is not the problem. Sky Wolf Studio, The Arcade and the Lucid Winds
card all read as professional. Everything goes wrong on the first scroll.

## Director's calls (2026-08-16)

1. **House frame, plus fix the worst tiles.** One studio treatment on every
   tile so the grid reads as one shelf, and replace the ones no frame can
   save.
2. **Curated shelves, plus fix the categories.** A storefront rather than a
   wall, and the category tabs must actually include satellites.
3. **Auto captured gameplay for now.** Stephen may remake a lot or all of the
   art later for studio wide cohesion, so tonight's captures are a floor, not
   a ceiling.

**The consequence of (3), and it shapes everything:** the house treatment is
**render time CSS and never baked into an image file**. New art dropped in
later inherits the frame for free, and tonight's captures are drop in
replacements rather than something to undo.

## The build

### A. The house frame (CSS only)

Every card gets the same treatment regardless of what art is behind it:
- one aspect ratio, square, `object-fit: cover`, so nothing is letterboxed
- one corner radius, one hairline border, one hover state
- a bottom scrim so the title is legible over any art, bright or dark
- title and category chip sit ON the art, not in a separate block underneath
- a floor on contrast: a very dark tile gets a slightly lifted scrim so it
  never reads as an empty hole

Nothing here touches an image file. Re-arting later changes nothing else.

### B. Shelves

Order, top to bottom:
1. hero (unchanged)
2. **Start here** — six picks, the best first impression the studio has
3. **Made by the studio** — the flagships, the ones with the most work in them
4. **New** — recently shipped
5. **category rows** — horizontally scrolling, one row per category
6. **Everything, A to Z** — the full grid, last, for people who want the wall

Rows scroll sideways on a phone, which is how every storefront handles this,
and it means the page height stops being a function of the catalogue size.

### C. Categories that cover the whole studio

Tag all 113 satellites. Proposed set, chosen to fit what actually exists
rather than what a taxonomy textbook would say:

| Category | Roughly |
|---|---|
| Action & Arcade | reflex, dodge, run, shoot, land |
| Puzzle | think, solve, fit, route |
| Card & Board | cards, tiles, dice, classic boards |
| Word | letters, spelling, crosswords |
| Numbers | arithmetic, counting, math practice |
| Creative & Toys | make, draw, build, fidget, no fail state |
| Party & Multiplayer | two players or a room full |
| Kids | built for young children specifically |

`In Development` and `Favorites` stay as they are. The fix in `renderGarden`
is small: satellites must flow into a category tab the same way in-repo games
already do.

### D. The ~25 tiles that need art tonight

Drive each game into a real playing state and capture a frame. Not the menu,
not the splash: the game, mid play, with something happening. Saved as clean
square source images with no frame baked in.

Candidates from the contact sheet: cipher-bloom, lamplighter, mini-crossword,
moon-claw, stop-motion, doodle-pad, flock-the-world, season-sway,
rabbit-samurai, micro-meadow, plot-bloom, spore-drift, no-pain-no-gain,
tinker-loft, silt, nova-bloom, seed-reel, root-groups, garden-guard, flipbook,
fence-off, hunch, letter-launch, pollinator-paths, sled-vine.

## How this gets checked

The same way everything else tonight did. A contact sheet before and after, so
the set can be judged as a set. A page health pass so nothing breaks. And the
grid opened at 375 and at desktop, because a phone sized test passed all night
while the marble plate hung out of its box on a wide screen.

## Not tonight

Re-arting the catalogue, which is Stephen's call and his lane. Anything inside
the games themselves. The wider studio cohesion he is thinking about beyond
the storefront: same fonts, same loading screens, same back button in every
game. Worth doing, worth planning properly, not worth starting at midnight.
