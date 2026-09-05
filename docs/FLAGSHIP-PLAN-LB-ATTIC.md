# Litter Bug and The Attic, the road to flagship (started Sep 05 2026)

Stephen, Sep 05: "i want those to be new flagships on the same tier as lucid winds. it will probably take a
couple months of drawing, refining, tuning and everything else to get them there so keep working away
meticulously detailing and perfecting."

The bar is Lucid Winds: one of one procedural art with deep trait banks, a verified rarity ladder, a
name and lore engine, a card system you can hold, a collection with a reason to open it, a loop with a
day two, and every screen a place. Each pass below is played, looked at, gated, deployed and ticked
here. Litter Bug edits live in `/workspaces/Litter_Bug` and are re-vendored; The Attic edits live in
`satellites/attic/`.

## Litter Bug

| # | pass | status |
|---|---|---|
| 1 | Coherence: offset shadows, catch lights, sockets, legs dim under wings (the flower renderer's tricks) | done Sep 05, cd759af |
| 2 | Vocabulary 1: body patterns x5, wing styles x3, horn kinds x2, spine kinds x2, antenna styles x2, eye styles x2, leg styles x2, head kinds x3, all appended rolls, grades identical 3000/3000 | done Sep 05 |
| 3 | Vocabulary 2: tail kinds beyond the scored three (cosmetic), segment shapes (oval, teardrop, flat), leg count variants, a second accent material on wings, iridescence for glass palettes | next |
| 4 | The style hero lands: trace parts to SVG symbols in that style, drop in through `PART_SOURCES` one part at a time, compare against procedural on a sheet | waits on the hero |
| 5 | Specimen card: a flip card like the plant cards (front art and grade, back the parts ledger, fighter sheet, scrap palette, date, full hash), SHARE through the system sheet and SAVE THE CARD as a 640x960 PNG rendered on a canvas the way the plant cards are; a gate assertion measures the paint in the art band and was watched red on a mutant with no bug drawn | done Sep 05 |
| 6 | Identity depth: the parts named in the lore (a bug with an eyespot wing gets a line about it), more name banks, a species family tree in the Bugdex (families by wing kind and head) | queued |
| 7 | Loop: trial scoring on a tempo curve so the clock matters, a featured block each day, a weekly crown ladder with its own purse, a Bugdex completion meter | queued |
| 8 | The world map (upstream `world.html`: territory, breeding, raids) brought into the game as the fifth screen | queued, big |
| 9 | Sound: WebAudio synth for taps, mint, hit, win, lose, the pry seam, the belt (no files) | queued |
| 10 | Onboarding: the how to wall becomes a three beat open over the alley | queued |
| 11 | Painted places land (alley, four trials, lid, jar, dumpster) and replace the drawn ones | waits on paint |

## The Attic

| # | pass | status |
|---|---|---|
| 1 | Audit rows: dust that lets the object through, the room lifted, inked titles, paperwork contrast, WIPE one line, motes | done Sep 05, 24420f3c |
| 2 | Layout banks: records 4 to 8 sleeve layouts, VHS 3 to 6 motifs, cereal 4 to 8 mascots, comics 1 to 3 covers, toys 1 to 3 card backs, handhelds 1 to 3 shells, board games dice or spinner or pawns, paperbacks 1 to 3 vignettes, lunchboxes 1 to 3 scenes, zines 1 to 3 pages; every switch on a byte the renderers never spent (7 to 15, 30, 31), so an existing find only changes picture when its new byte says so; sixty renders old and new looked at, gate 128 ok | done Sep 05 |
| 3 | Era depth: each era gets its own type treatment per class (50s script, 60s bubble, 70s slab, 80s chrome, 90s grunge) and one era only oddity (a price sticker style, a rental stamp, a mail order coupon) | queued |
| 4 | Condition as story: each grade adds one line to the provenance (where the wear came from) | queued |
| 5 | The shelf as a room: the plank art, finds sit on it in rows, a sealed find gets a glass case | queued |
| 6 | Loop: DUST OFF becomes a real minigame or a capped daily, sets (three of a class and era pay a bonus), the pawn counter (sell for tickets, a price by grade) | queued |
| 7 | Sound: rummage rustle, the wipe, the reveal sting, a sealed fanfare | queued |
| 8 | Painted plate, dust veil, plank and ticket land | waits on paint |
| 9 | The name and launch classes | waits on Stephen |

## The rule for every pass
Play it with real taps at 412x915. Shoot it. Name three things wrong before Stephen does. Gate it.
Deploy it. Write the row. A sheet is not a look and a green gate is not a played game.
