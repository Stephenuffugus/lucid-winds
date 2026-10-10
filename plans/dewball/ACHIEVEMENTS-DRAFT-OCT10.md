# Dewball level achievements: a draft for his yes (10 Oct 2026, night)

**His words:** "it might also be cool to write in some achievements for the levels too with some cool unlocks like find
and collect 5 screcrows and stuff liek that". Design only: nothing is built until he says yes.

## The shape

- **Six achievements per level**, four kinds of goal:
  - **Collect**: a number of one kind, counted across all your runs ("Scarecrow Keeper: collect 5 scarecrows").
    Across runs, so a younger player gets there; the bar is the number, not one perfect run.
  - **Find**: every keepsake in the level (they already bank the moment you touch them, so this is a checklist).
  - **Grow**: three stars on the level.
  - **Feat**: one harder thing in a single run (a clean sweep, or a lot of one kind in one go).
- **Rewards, using what the game already has:**
  - every achievement: a small medal on that world's card and a one line note in the game's own notification slot
    ("Scarecrow Keeper. Five scarecrows found.");
  - three achievements in a level: one of **his songs** unlocked for the player (music-unlocks.js already does this
    across the fleet);
  - all six: **a ball skin made for that level** (the skins list already unlocks by rules; this adds a rule).
- **A Trophies page** off the world select: each level's six with progress ("3 of 5 scarecrows"), locked ones shown
  greyed so players know what to hunt. Copy law: no dashes, no exclamation points.
- **Saved on the device** like keepsakes (save audit extended to cover them; the backup Stephen asked for on 21 Sep
  carries them too when it exists).

## The first three levels (the pattern for the rest)

Every kind and keepsake below exists in that level, checked against the manifest (the fewest: 39 fireflies, 42 ants).

**Crumb Country**: skin *Picnic* (red and cream check)
1. Ant Hill: collect 25 picnic ants
2. Sweet Tooth: collect 10 cupcakes
3. Chess Club: collect 8 chess pawns
4. Treasure Hunter: find all five keepsakes (the Lost Thimble, the Lucky Clover, the Queen's Sugar Rose, the Pocket Watch, the Silver Spoon)
5. Three Stars
6. Clean Plate: eat everything in one run

**Toybox Peaks**: skin *Toy Block* (painted block colours)
1. Marble Collector: collect 50 glass marbles
2. Parade Ground: collect 12 tin soldiers
3. Teddy Rescue: collect 5 old teddies
4. Treasure Hunter: find all five keepsakes (the Marble King, the Painted Top, the Music Box, the One Eyed Bear,
   the Tin Rocket)
5. Three Stars
6. Domino Run: collect 20 dominoes in one run

**Night Garden**: skin *Lantern* (a soft glow)
1. Scarecrow Keeper: collect 5 scarecrows (his example)
2. Gnome Home: collect 10 garden gnomes
3. Firefly Catcher: collect 15 fireflies
4. Treasure Hunter: find all the keepsakes (the Firefly Jar, the Keeper's Trowel, the Moon Orchid, the Grove Key, the Clay Whistle)
5. Three Stars
6. Lantern Walk: collect 20 paper lanterns in one run

Bazaar Lane, Starfall Bay, The Whole World and Dream Meadow follow the same pattern from their own kinds when built.

## His calls

1. **Rewards:** skins and his songs as above, or skins only?
2. **Counting:** across runs (recommended, friendlier) or all in one run?
3. Anything from the first three lists he would swap (his kinds, his names).

## Build, once he says yes (no credits)

One table of achievements per world, counters fed by the one absorb path, the save fields and a save audit section,
the medal and note, the Trophies page, the three skins, the song unlock hook. Gates: a counter test (the same scripted
run counts the same), a save round trip, a copy check; looked at on his 412 wide phone.
