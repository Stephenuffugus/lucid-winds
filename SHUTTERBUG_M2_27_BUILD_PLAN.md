# Shutterbug sb-m2-27: the clean pass and the biome roll (Fable, 13 Nov 2026)

Stephen, 13 Nov, after playing: "the UI can be greatly improved. I don't think it explains what a house is ...
It's almost there." Then: "I just want to make sure it's clean and easy flowing. Also, we should have a way to
select what theme the biome will be and it could be rolled so they would see the selection go across the
different biomes as it randomly selects one."

Built on top of main (sb-m2-26, `shutterbug-v48`). One build, stamped `sb-m2-27`, `shutterbug-v49`, `sw.js?v=49`.

## Laws
- Work alone, Bash only for file writes, one headless browser at a time, never push `main`, no deploy.
- THE TESTING LAW: after each step `node satellites/shutterbug/tools/check.js --fast --gate <the one gate that
  step touches>`; nothing else until the end. At the end, once, with nothing else running:
  `SWS_NO_BROWSER=1 node satellites/shutterbug/tools/check.js` (what CI runs) and then the browser gates this
  build touched (house, capture, layout, and any other whose expectations you changed), each once. A gate that
  asserted the old truth is updated to the new truth, never deleted and never loosened.
- A step that changes a screen gets ONE screenshot of that screen at 412x915, opened from `/tmp` and read.
- Before the final checks: `pgrep -fl 'redwatch[.]js|chrom[e]'` and stop leftovers; H-rep-6's 50 ms budget
  trips under any other load.
- No new art. No change to room codes already shared: v1 and v2 records keep their meaning.
- Player text: plain, short, no en or em dashes.

## S1. The house explains itself
- Title: under `#housestart`, one line in the ash colour (a sibling element, so the button's own text does not
  change): "Five of your rooms in a row. A guardian waits in the last one."
- The house card ("A new house"): one more line under "Five rooms, each one tougher than the last.": what is
  at stake, in the game's own true terms (read the code for what a cleared house pays and what a lost house
  costs; today the title says "Clear a house to win the {name}" and a lost house says "Lost {n} dead pixels").
- The word stays "house" (Fable's recommendation, his "or something" allowed it; "world" was the other option).

## S2. The returning title fits and reads in two groups
After a first room the title holds twelve controls and is 1055 px tall on a 915 px phone. Group it under two
quiet labels, "Play" (the house, the Daily Room when shown, Photograph a room, Choose a photo, the sample
link) and "Your collection" (Darkroom, Album, Trophies and bugs), with the level code row and Recent rooms
after them and Settings last. Target: at 412x915 every "Play" control and the "Your collection" label are on
screen without scrolling. A brand new player's title (two buttons, the sample link, Settings) does not change.

## S3. Three words get one line each, once
The first time each shows: "Dead pixels" (what they are and what they buy), "Darkroom" (where prints become
weapons), "Snapshot" (the next rank). One short line near the word, shown until the player has seen it once
(a flag in the save, the way the game already remembers things); never a popup that must be dismissed.

## S4. It should feel like it answers the finger
Today the whole page has one `:active` rule, one `transition` and no vibration.
- Every button: a pressed state (a 3% shrink and a shade, about 80 ms).
- Screen changes between title, cards and the album: a 150 ms fade, off under `prefers-reduced-motion`.
- A short vibration (10 to 15 ms, `navigator.vibrate` where it exists) on a button press, on a key, on the
  exit, on a clear; a "Vibration" switch in Settings, on by default.
- The Room clear card: the XP bar fills and the numbers count up over about 600 ms instead of appearing.
Nothing here may change the sim, the frame budget in play, or any timing a gate measures.

## S5. The biome roll
Five biomes exist: Attic, Frost, Deep, Overgrowth, Ember. A v2 room record already carries a biome byte
(1 to 5; 0 means "decide from the grid"), written today by the capture from the photo's own colour. So a
chosen biome needs no format change and a shared code already carries it.
- After the crop is confirmed and before the reveal, a "roll": the five biomes shown as a row of tiles in
  their own colours with their names, a highlight sweeping across them, slowing, and landing on one in about
  1.5 s. Tap anywhere to stop early on the tile it would have landed on. Under reduced motion: no sweep, the
  result shown at once.
- The roll is random with the photo's own biome (the colour vote the capture already makes) twice as likely
  as each of the others, so a blue room still leans Deep.
- "Choose" beside it: tap a tile to pick the biome yourself, or "From my photo" for the colour vote. The
  choice is free.
- The result is written to the record's biome byte, so replays, the album page, and a friend with the code
  all get the same biome.
- Where it applies: Photograph a room, Choose a photo, and each new room of a house. Where it does not: the
  Daily Room (everyone gets the same room), a pasted code, a recent room, the sample room.
- The random source must be injectable so gates stay deterministic (the way the game already holds or seeds
  things for its harness). Update the capture gate's oracle for the new truth.

## The end
Stamp `sb-m2-27` (BUILD, `shutterbug-v49`, `sw.js?v=49`), run the final checks in the Laws once, commit, push
the branch. Do not write a deploy wrapper; the lead does, from `/home/codespace/sb-drafts/sb-m2-26/` as the
model. Report per step: commit, what changed, the gate lines, what you saw in the look.
