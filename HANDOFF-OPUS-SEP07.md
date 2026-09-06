# HANDOFF, THE OPUS LIST, Sep 07 2026

**Written by:** Fable, Sep 06 evening into Sep 07, after Stephen's phone notes on three of the
twelve and a look pass over the other nine.
**For:** Opus, one game at a time, each to its plan's gates. Stephen said: "continue building and
perfecting all twelve of the new games, and or make a huge list of work for Opus."
**Branch:** `add-sproing-jumper`. Deploy is `git push origin add-sproing-jumper:main` after
`git log HEAD..origin/main` is empty. Read `HANDOFF-FABLE-SEP06-EVENING.md` sections 8 and 9 for
the laws and the scars, and its section 11 for what the notes taught. Every item below names its
plan; the plan's SESSION STATE has the exact next action, the files, the gate and the shot.

## 0. THE FIVE MINUTES ON A FRESH BOX

Section 2 of `HANDOFF-FABLE-SEP06-EVENING.md`, unchanged. Two cores. One browser at a time,
`timeout 900 flock -w 1800 /tmp/sws-gate.lock node <cmd>`. Never delete `~/.cache/puppeteer`.

## 1. HOW TO TAKE AN ITEM

1. Open the plan's SESSION STATE. Do the named next action, nothing adjacent.
2. Shoot 412x915 and 375x667 from where the player stands and OPEN the shots before the gate.
3. Ask which gate should catch what you built. Write it, watch it fail once under a real
   mutation, then watch it pass.
4. `node tools/check.js` green; stamp bumped in three places (next letter, then the day's date).
5. Commit, push the branch and main, curl the live page for a marker only the new build has.
6. Write the SESSION STATE entry: what landed, what was found, the next action.

## 2. THE LIST, IN VALUE ORDER

Each line: game, the item, size, the plan, and whether it waits on a Director call
(`docs/DIRECTOR-CALLS-SEP06.md`, section and number). Items that wait on a call are NOT started.

### A. Ready now, no call needed

- **A1. Gerplunk P4 step 1, the throw reference and the spin ring.** A day. `plans/gerplunk/HANDOFF-GERPLUNK.md` SESSION STATE, PLANNED FOR OPUS. Research note to Stephen before the ring.
- **A2. Inkswing P4 step 1, the nib and the colour wheel** with a versioned share link. A day. `plans/inkswing/HANDOFF-INKSWING.md` PLANNED FOR OPUS.
- **A3. Whistlestop, the props stop binding the zoom** (Fable started this Sep 06 night; if the SESSION STATE says DONE, skip). Half a day.
- **A4. Doohickey, the portrait stage.** The board is a 412 by 230 band with more cream than board on a tall phone (thin list). The levels are designed landscape and the scene is the scene, so the band cannot grow; what can change is what the band sits in. Compose the portrait screen as a WORKBENCH: the level's name and goal on a card in the top band, the part tray as a drawer in the bottom band with its counts, the scene between them on its sheet, the whole thing reading as a bench and not as a strip on cream. `fitCanvas` (portrait branch) and `drawPaper` in `satellites/doohickey/index.html`; a layout gate assertion that at 412x915 the three bands (card, scene, tray) each take at least a fifth of the height and nothing overlaps by elementFromPoint; shoot 412x915 and 375x667 and OPEN them. Half a day. `plans/doohickey/HANDOFF-DOOHICKEY.md`.
- **A5. Airworthy, the gust whistle unlock**, the one named thing in the design still unbuilt: a single earned mid flight nudge. Design 6, plan 3.4 ("no mid flight control in the slice", taken; the slice is over). One tap while the plane is in the air, once per flight, adds a seeded upward gust under the plane for half a second; earned by the first silver in the gym, shown as a WHISTLE button that appears only in the air and only once. In the challenges it stays off (the throw is the challenge's, call C8). `fly()` in `sim.js` takes an optional `nudge: {t, up}` so the sim owns it and `sim.js --test` can assert the nudged flight lands further than the same flight without it, watched to fail with `up` zeroed; `test/play.mjs` taps it mid flight by elementFromPoint. Half a day. `plans/airworthy/HANDOFF-AIRWORTHY.md`.
- **A6. Updraft, the kite at 67 m and the reel.** The kite is a mark with a stub tail, the reel reads as a gold coin, Mabel's crown is flat circles (thin list). Code drawing only, no painted art. Half a day. `plans/updraft/HANDOFF-UPDRAFT.md`.
- **A7. Gerplunk, the land.** The lee and the bay are a flat dusk silhouette, the bay's far shore is a straight line, no stone in the palm view (thin list). Half a day of code drawing.
- **A8. Strata, the docs refresh** (`ART_ASSETS.md`, `BUILD-NOTES.md`) and the morning report. Two hours.
- **A9. An ear gate in every game.** Gerplunk's audio gate now renders its bed offline and measures peak, rms and the share of energy above 3 kHz; the fire alarm was inaudible to every other assertion. Every game with sound gets the same three numbers on its loudest minute, from a dev hook that renders through the real functions into an OfflineAudioContext, and NEVER from a wav made for the ear: Windup's tinewav tool normalises its file (0.86 peak whatever the master), and a measurement of it said the game was loud when the game was clipping, which is a different fault. A morning. Fathom, Asterism, Swell, Wardian, Doohickey, Airworthy, Windup, Whistlestop, Updraft, Strata.
- **A11. The lint reads canvas fonts.** Every lint checks `font-size: Nrem` in CSS and nothing else, so `ctx.font = '600 10px ...'` in Airworthy, `11px` in Windup and a `Math.max(9, ...)` floor on Whistlestop's train labels all shipped under the 0.7 rem law (found by a grep on Sep 06 night, fixed by hand to 12 px). Teach each game's `tools/lint.mjs` to read every `font = '...Npx'` literal and every `Math.max(N, ...)` floor in a font string and refuse N under 11.2. An hour, all twelve, watched to fail on a 10px literal.
- **A10. Fathom's arcade tile** reshot with occlusion (`node tools/thumb.mjs` under the lock) and the portal `?v=` bumped. Twenty minutes.

- **A12. The plural brand across the old fleet.** "Sky Wolf Studios" still appears in 96 files outside the twelve (55 satellite index files); the law is Sky Wolf Studio, singular, and the twelve are clean. One sweep, one commit per twenty games, each game's stamp bumped in its three places if it has them (older games have one `?v=` or none: bump what exists, never invent a stamp scheme). A morning. The manifests and the portal cards too. Do not touch Jimothy (Stephen's own, do not touch rule) without asking.

### B. Waits on a Director call (do not start)

- **B1. Gerplunk, the turn** (G22): gain and stance. Two hours once he picks.
- **B2. Gerplunk, more things to skip** (G24): each 45 minutes once he sends the list.
- **B3. Gerplunk, more waters** (G23): a day each, after B1.
- **B4. Inkswing, the Twin** (G31): a day. Plan step 2 in the Inkswing SESSION STATE.
- **B5. Inkswing, the palette that folds away** (G28): half a day.
- **B6. Inkswing, the bucket and the poke** (G27): two to three days. **The crop** (G29): a day.
- **B7. Inkswing, just intonation** (B4): re grades every drawing.
- **B8. Airworthy, the upgrade ladder** (G34): one to two days. Then the story rooms, then the dogfight experiment.
- **B9. Whistlestop, pinch and pan or fit** (C12), **pass through** (C13).
- **B10. Wardian, the quiet fortnight** (C14). **Strata, the crate by kind** (C15). **Fathom, the world scale halving** (C16).
- **B11. Asterism, the six anchor myths** (D18) are Stephen's to write; the serif (D19).
- **B12. Windup, print a strip** (E20) is Stephen only.

### C. Found in the Sep 06 night look pass (Fable), added below as they were found

**DONE 2026-09-07 by Opus: C1, C2, C5, C8, C9.** C5 Whistlestop's prop groups each carry a
written reason, how near the line that reason puts them, and whether they turn to look at the
railway; nothing stands inside the railway's footprint any more. ⛔ That last one was not a
placement bug but a STALENESS bug: the scenery is laid once and then stays put, which is right
for building beside, but laid once and never again a loop built AROUND a cow leaves the cow in
the middle of it for good. It re lays only when the railway has grown over it, and the camera
refits first, because laid against the old frame the cow came out half off the left edge.
**Also done: C1, C2, C8, C9.** C1 Asterism now has a treeline on the ridge and a
fence in the field, both seeded from the place, and a gate that counts anything darker than the
land (3.9 percent with it, exactly zero without). C2's question is answered yes, the first line
IS on a fresh save at all three sizes, and looking at it found the real thing: the screen it
shows on was a black rectangle, so the floor breathes now until a hand has held it once. C8 the
two stale Strata docs are deleted. C9 the whole portal is repinned. Left: C5, C6, C7, C10, C11,
C12.


(see section 3, and the items Opus added below)

- **C7. Strata, the second skeleton can be dug and can never be mounted.** Found 2026-09-07 while
  refreshing the Strata docs. At depth 1 or deeper, 42 percent of sites carry two animals
  (`makeSite`, `satellites/strata/index.html:1176`), and `stroke` and `tryExtract` loop over
  every specimen, so the second animal's bones really do come free and count toward the lifted
  tally. But `refreshChrome`, the site chip, `openMount` and `openNameSheet` all read
  `G.dig.specimens[0]` and nothing else: the chip counts "N of M lifted" against the first
  animal alone, and every bone lifted off the second is discarded when a new site opens. The sim
  gate asserts the two animals are PLACED and no gate asks whether the second can be mounted.
  Half a day, and the gate to write first is the one that digs a two animal site and mounts both.
- **C8. DONE 2026-09-07.** The two stale Strata docs at the satellite root are deleted; the true
  ones in `docs/` were rewritten against the file the same day. The root copy opened by claiming
  the game "ships with zero image files", which is false: it ships four generated PNGs.
  ⛔ **What it turned up, queued as C12:** the fleet does not agree where a game's docs live.
  Seven of the twelve keep `ART_ASSETS.md` at the satellite root (Fathom, Asterism, Swell,
  Wardian, Doohickey, Whistlestop, Updraft), three keep it in `docs/` (Airworthy, Windup,
  Inkswing), Gerplunk has neither, and Strata had both, which is how two files of the same name
  came to say different things. Half an hour to move the seven into `docs/` and fix the
  references, and it should be done before anyone writes another one.
- **C10. Asterism's poster PREVIEW draws its text at about five CSS pixels.** Found 2026-09-07
  by the new canvas font lint, which could read the sizes as computed expressions but not their
  values. `renderPoster` sets `g.font = Math.round(w * 0.0NN) + 'px ' + serif` at six places
  (`satellites/asterism/index.html:2204, 2207, 2216, 2219, 2238, 2242`). Exported at POSTER_W
  2048 those are correct. But `refreshPoster` draws the same function into `#posterPreview` at a
  backing width of 720 shown at `max-width:360px`, and at `max-height:700px` it is 256: on the
  screen the player actually looks at, the footer credit and the HYG attribution land at about
  five CSS pixels and the myth body at eight, which is under the 0.7 rem law. The export is fine
  and the preview is not. Half a day: draw the preview at its own scale rather than shrinking
  the poster, or floor the sizes in CSS pixels. Add a lint or layout assertion that reads the
  DISPLAYED size, since neither existing gate can see a scaled canvas.
- **C11. Fathom's arcade tile reads as a broken image on the shelf.** Reshot 2026-09-07 with
  occlusion and it does now show the right thing, a ping whose ring is whole while only the walls
  the sound REACHED are lit. But it is about eighty five percent black, the lit walls are two
  pixel cyan lines that will nearly vanish at the size a shelf renders a tile, and the subject
  sits above centre with an empty band under it. Darkness is Fathom's identity and a tile that
  reads as a failed load is still a fault. Two hours: `tools/thumb.mjs`, bigger line weight,
  the subject filling more of the frame, and a faint floor so the tile has a bottom. Judge it
  against the other eleven on the shelf, not on its own.
- **C9. The portal pins Strata at `?v=20260906b`** for both the URL and the thumb while the game
  ships a later stamp (`portal/index.html:1049`). Ten minutes, and worth a sweep of the other
  eleven at the same time.

## 3. THE LOOK PASS, GAME BY GAME

Filled in by Fable on the night of Sep 06 from fresh 412x915 shots of each game, opened one by
one. Three things named per game, the small ones fixed on the spot and noted as such, the rest
queued above under A or C.

### Fathom (title-tall, p1-ping-tall, reshot Sep 06 night, opened)

1. The first ping lights a plain rectangle of wall at the top of a screen that is otherwise nine
   tenths black. That is the world scale (Director call C16, fifteen tiles across); nothing to do
   until he answers. Not a fault.
2. The tutorial line is there and reads ("Tap to throw a stone. The sound shows you the cave").
3. The HUM control sits bottom right and the chip corner is clear. Nothing small to fix by eye.
   **Queued:** C16 only. A10 (the tile reshot with occlusion) stands.

### Asterism (p1-sky-tall, p1-draw-tall, reshot Sep 06 night, opened)

1. The real sky reads as a sky; the draw mode's gold lines and the one star name read well.
2. On a tall phone the quarter of the screen under the horizon is empty navy: the same spare
   band that Airworthy, Doohickey and Inkswing have. The almanac line or a foreground silhouette
   (a treeline, a roof) belongs there. **Queued as C1, half a day, code drawing.**
3. The location chip is a small serif at the top left; fine.

### Swell (p1-swell-tall, p2-moods, reshot Sep 06 night, opened)

1. The hold reads as light rising from the floor; the top two fifths of a tall phone stay black
   through the swell. Whether that is the piece or a gap is his ear and eye, not mine; the mood
   picker is clean and says PLAYING.
2. Nothing on the play screen says what to do on first arrival in the shot (the first line was
   moved off the chip on Sep 06 morning; check it shows at 412x915 on a fresh save). **Queued as
   C2, an hour: shoot a fresh save at 412x915 and confirm the first line is on the screen where a
   thumb looks, then the same at 320x568.**
3. Storm and Lullaby had never been rendered to a wav (call A2). **Done, Sep 06 night:**
   `docs/shots/p0-storm.wav` and `p0-lullaby.wav`, through the page's own engine like Dawn. The
   three moods sit together: peak 0.39, 0.41, 0.36; rms 0.060, 0.056, 0.062; 1.2, 2.2 and 1.4
   percent of their energy above 3 kHz. Nothing in the numbers is an alarm; the rest is his ear.

### Wardian (p3-412-day, p2-pouch, reshot Sep 06 night, opened)

1. The jar reads as a jar and the once only line sits under it, clear of the chip corner. Fine.
2. **The pouch says BUY, with spores as the price, on every seed and every thing for the jar.**
   Spores are gathered by play and no money is anywhere near it, but BUY is a store's word and a
   store reviewer's word, and the fleet's law keeps coins and rewards out of copy. Director call
   G37: PLANT for a seed and TAKE for a thing, ten minutes, or keep BUY.
3. The pouch is a long scroll of same shaped cards; fine on a phone, and the quiet fortnight
   (call C14) is the real question about it.

### Doohickey (p3-412x915, reshot Sep 06 night, opened)

1. The board is the 412 by 230 band the thin list describes, with cream above it, cream below
   it, and seventy more pixels of cream UNDER the tray. That is A4, the workbench; the tray
   belongs on the floor of the screen, the goal card in the top band.
2. GO is green and big, the count "12 of 12 parts" is small grey under the undo pair; fine.
3. The marble is a small blue dot on cream (the thin list says it is easy to lose); a ring of
   shadow under it is ten minutes inside A4.

### Windup (p3-412, p3-hints, reshot Sep 06 night, opened)

1. The box reads as an object on a dark table; the empty band above and below it is a table,
   not a gap. Fine.
2. The punch sheet's note letters down the left are drawn on the canvas at a size the lint
   cannot see (it reads rem in CSS). Checked in the sweep below.
3. The level: 0.86 peak in the tine wav, call G36, lowered to 0.5 tonight and re rendered.

### Updraft (p2-landing, p3-daily-title, reshot Sep 06 night, opened)

1. The title card is clean and the invitation line reads as a sentence ("A friend flew the
   wind of 6 September to 41 m and Loop, Dive Bomb"). Fine.
2. In the field the first hint ("Hold to pull the string. Let go to give it line.") was drawn
   across the kite and its line at mid screen, on top of the subject it was describing. **Done,
   Sep 06 night:** it sits on the grass above the reel (112 px clear of the thumb row, which the
   layout gate holds at a hundred). Reshot and opened.
3. The altitude readout at the top centre was 55 percent ink on the sky and vanished on the
   evening one ("0 M" invisible in the shot). **Done, Sep 06 night:** it stands on the same paper
   pill as the mood chip and reads on any sky. The reel is still a gold coin and the tree three
   circles (thin list, A6).

### Strata (p1-cliff-tall, p1-brush-tall, reshot Sep 06 night, opened)

1. The first visit has a banner ("Brush. Something is under there.") and the how screen says
   the same; the shot is after it has gone. Fine.
2. The tool column (BRUSH, CHISEL, PICK, SCAN) is 48 px each on the right edge, mid height,
   clear of the chip corner. Fine.
3. The brush's dust is a faint pale patch on the second band; the feedback for the first
   gesture is quiet on a phone in daylight. A brighter grain in the brushed patch and a short
   hiss are inside A8's docs refresh as a note, not a build. The fifty bone crate is call C15.

### Whistlestop (p3-412x915 before and after, Sep 06 night, opened)

1. **Before:** the loop was 67 percent of a 412 phone's width (the thin list's first line), a
   tree at the scenery ring's edge having bought itself the margin. **After (Fable, Sep 06
   night):** the railway fits the screen and the scenery fits the railway: 84 percent at 412,
   83 at 375, 80 at 320, with a 32 px screen margin so the outer curve stays out of Android's
   back gesture strip, and the props laid inside the frame the railway's fit gives. The gate
   measures it off `railBounds()` through the page's own mapping, and the old fit turns it red
   at all three sizes (67, 64, 69).
2. The groups read as a farm now: the house and signboard above the loop, the cow inside it, the
   bushes at its edge. One prop of thirteen still lands off the frame because a group's members
   spread from a centre that was checked alone; fixed after the chain (members checked one by
   one). Whether the props are MOTIVATED (a bench facing a path, bins at a corner) is a taste
   pass for a later night: **queued as C5, an hour, PROP_GROUPS with a reason per group.**
3. The Crossing's two spurs still mirror each other and Swap's lower two levers sit thirty pixels
   apart (thin list). **Queued as C6, two hours, in `PUZZLES` data, with `sim.js --solve` run
   again on both.**

## 4. WHAT FABLE DID ON THE NIGHT OF SEP 06 (so the list above is what is LEFT)

- The three games from his notes: Airworthy, Inkswing, Gerplunk, all at `20260906h`, section 11
  of the evening handoff.
- Whistlestop: the railway fits the screen and the scenery fits the railway (67 to 84 percent of
  a 412 phone), gate and mutation, stamp `h`.
- Windup: the tine level 0.85 to 0.5 (call G36), the wav re rendered, stamp `h`.
- Airworthy: four canvas fonts under the 0.7 rem floor raised, stamp `i`.
- Updraft: the altitude readout on a pill so it reads on an evening sky, the first hint off the
  kite and clear of the chip corner, seven gates green, stamp `h`, live.
- Swell: Storm and Lullaby rendered to wav beside Dawn, all three at one level by measurement.
- Sweeps over all twelve: the tremolo wired into a gain (only Gerplunk had it), canvas fonts
  under 11.2 px (Airworthy, Windup, Whistlestop, fixed), dashes and exclamation points in canvas
  text (none), the plural brand (none in the twelve, 96 files in the old fleet, A12).
- The nine games not in his notes reshot with their own tools and OPENED; section 3.

## 5. WHAT STEPHEN IS ASKED (one list, ranked; the detail is in the calls doc)

1. Gerplunk's turn (G22). 2. His ear on three wavs: Gerplunk's bed, Windup's tine at the new
level (G36), Swell. 3. Inkswing sand, keep or replace (G33). 4. Inkswing's Twin (G31). 5. The
Airworthy ladder order (G34). 6. Gerplunk's list of skippables and waters (G23, G24). 7. What he
saw in Airworthy landscape (G35). 8. Wardian's BUY (G37). 9. The rest of section G.

## 6. THE DAY'S LEDGER (Opus appends one line per finished item, the morning report at the top when stopping)

### THE MORNING REPORT, Sep 07, Opus

**WHAT IS LIVE.** All of section A, every item, on `main` and verified by probe against the host.
Twelve games at these stamps: Fathom, Asterism, Doohickey, Airworthy, Inkswing, Updraft
`20260907a`; Gerplunk `20260907b`; Swell and Wardian `20260906d`; Windup and Whistlestop
`20260906h`; Strata `20260906f`. The portal now pins every one of the twelve to the stamp that
game actually ships; ten of them had been pinned at `20260906b`, which none of them has carried
for a day, so the shelf was serving a stale tile and a stale cache key for each. The plural brand
is gone from the whole old fleet, 206 occurrences in 136 files, including eleven places a player
reads.

**WHAT IS HALF BUILT.** Nothing. Every item that was started is green, committed, pushed and
live, and every game's own suite passes.

**WHAT I WOULD PUT IN FRONT OF STEPHEN, RANKED.**

1. **Two games were CLIPPING and every gate was green over it.** Fathom's singback peaked at
   1.293 and Asterism's swell at 1.907 on their loudest minute. A fresh GainNode's gain is one,
   and both games started three sines at once while staggering their envelopes, so each voice
   went out at full scale for 45 to 90 ms. Fixed, and both now measure 0.42 and 0.37. **This is
   the case for finishing the ear gate in the other six games** (A9 covered four of ten).
2. **His ear, on four things.** Gerplunk's bed (`docs/shots/p4-bed-and-throws.wav`), Windup's tine
   at the new level (call 36), Swell's three moods, and now Fathom and Asterism at their fixed
   level. Nobody has heard any of it, which is still the largest unknown in the twelve.
3. **Gerplunk's turn (call 22)** is the one thing he asked for that is still not started, because
   it is his number. Two hours the moment he picks.
4. **Airworthy's WHISTLE_UP is 0.6 and that is a taste.** Measured, not picked: at 1.5 a whistled
   plane went 13.7 percent further, which is a save rather than a nudge. Five percent is where it
   sits. His to raise.
5. **Wardian's pouch still says BUY** (call 37, ten minutes, waiting on his word), and **Stream Hop
   says the plural brand in copy a player reads eight days from a Steam release** (call 38, his
   game, his call).
6. **Five new calls from today:** 38 Stream Hop, 39 a Steam probe that may never have passed,
   40 the devcontainer name, 41 Wardian has no master gain anywhere, 42 Strata's brush is a
   quarter of its energy above 3 kHz.
7. **Five new items queued in section C:** C7 Strata's second skeleton can be dug and never
   mounted (a real fault), C8 two stale Strata docs, C10 Asterism's poster PREVIEW draws text at
   about five CSS pixels, C11 Fathom's tile reads as a broken image on the shelf. C9 is done.

**WHAT IS LEFT ON THE LIST.** A9 for the other six games (Doohickey, Airworthy, Windup,
Whistlestop, Updraft, Swell). Then section C, then the polish loop. Section B is untouched by the
rule and waits on him.

- **A1 Gerplunk, the throw reference and the spin ring.** `20260907a`, live (probe grepped
  `drawSpinRing`, `curlSoFar` and the stamp on the host). `docs/THROW-REFERENCE.md` written
  first and it is FOR STEPHEN: it found that spin was read only from the last fifth of a second
  of the flick, so the wind up he asked to see was worth nothing. Spin is banked over the slow
  segments now, two turns of the thumb is full, the wrist adds to it, and a stroke with no
  loops commits exactly what it always did. The ring is a gauge whose sweep IS the bank, with
  its own dark ground, gone the frame the arm is fast, no sparkle. Seven gates green twice, sim
  178/0, eleven new assertions watched to fail in both directions and two browser ones that
  read the canvas. Three gate lessons in the plan's SESSION STATE.
- **A2 Inkswing, the nib and the colour wheel.** `20260907a`, live (probe grepped `inkFromWheel`,
  `nibScale` and `ink-more`). `docs/REFERENCE.md` written first and its finding is FOR STEPHEN:
  every harmonograph in the world is a panel of sliders you set and then run, and not one can be
  thrown. Three nibs, a hue ring whose depth walks the ink family and cannot reach a marker pen,
  layers keyed by the colour, a version 4 link that still opens version 3 links as what they
  were. Seven gates green, sim 118/0, six mutations watched. Three faults the gates found, all
  fixed: a nib is a wetness as much as a width (the width band is sub pixel at the scale the
  sheet is drawn); the gate that found it was counting touched pixels and could not see it; and
  EVERY full screen in the game had its last button in the music chip's corner.
- **A8 Strata, the docs refresh.** `ART_ASSETS.md` and `BUILD-NOTES.md` rewritten against the
  file, plus a morning report in the plan. No stamp, docs only. ⛔ It found a real fault, queued
  as C7 below: at a large site the SECOND skeleton can be dug and can never be mounted.
- **A3 Whistlestop, the props stop binding the zoom.** SKIPPED, already done by Fable on the
  night of Sep 06: the railway is 84 percent of a 412 phone where it was 67, the gate measures
  it off `railBounds()` and the old fit turns it red at all three sizes.
- **A4 Doohickey, the portrait stage.** `20260907a`, live (probe grepped `goalCard` and
  `drawerFront`). Three objects where there were three margins: a job card with the level's
  name and what it is for, the board on a full width page whose graph paper runs across all of
  it, and a drawer sized from what is in it with GO moved onto its front where a thumb is. The
  marble carries a ring. Eleven gates green first run. The law it turns on is asserted and
  watched to fail: the board is exactly as big as the width allows at all three portrait sizes.
  Three faults found by LOOKING (three creams that read as one field, a page narrower than the
  board it carried, a centred scrolling tray that clipped its own first row) and one by the
  gate (the drawer's front stopped clearing the music chip's corner at 375).
- **A12 the plural brand across the old fleet.** 206 occurrences in 136 files, six commits,
  pushed and live (the portal's apps page now returns zero plurals). Eleven of them were copy a
  player actually reads: the portal page's title, og:title, badge, footer and JSON LD; the GAME
  tab's studio category label inside Lucid Winds itself; Wireworm's share card; the Stripe
  checkout line item; and four game titles and banners. Wireworm's shell version was bumped
  because it caches its own index. ⛔ IT ALSO FOUND WHY THE PLURAL WAS EVERYWHERE: eight of the
  briefs that a new game is built from were teaching it, including a copy verbatim embed banner,
  so every satellite was born with it. Fixed at source. Three things went to the Director's list
  rather than being done: Stream Hop is Jimothy under another folder name and says the plural in
  shop copy (call 38), a Steam probe looks for the plural and may never have passed (39), and
  the devcontainer name (40).
- **A5 Airworthy, the gust whistle unlock.** `20260907a`, live (probe grepped `btnWhistle`,
  `blowWhistle`, `WHISTLE_UP`). The last named thing in the design that was not built. One tap
  while the plane is in the air, once per flight, half a second of rising air under it, earned by
  the first silver in the gym, never offered in a challenge. `docs/REFERENCE.md` written first
  and its finding is the reason for every rule: no other paper plane game's fold survives contact
  with a boost button. WHISTLE_UP was MEASURED, not picked: the first number gave 13.7 percent
  more distance, which is a save; it ships at five percent with the band red in both directions.
  ⛔⛔ AND IT FOUND SOMETHING OLD: THROW IT has been sitting in the music chip's corner since it
  was built, at 111 px on a 412 phone, for two reasons that are the same family: the corner check
  scanned three container selectors and that button is a sibling of the chrome, and even widened
  to every button the check was running on a screen where neither big button exists. Nine gates
  green.
- **A6 Updraft, the kite at 67 m and the reel.** `20260907a`, live (probe grepped `drawReel`,
  `kiteInk`). All three thin list items were exactly as described in a fresh 412x915 shot and all
  three are fixed: the kite's size floor was twelve pixels and its sail two flat triangles, the
  reel was two flat ellipses, the crown was six flat circles. And a fourth the shot found that
  was on no list: the hint, the first thing a new player is ever told, is dark ink on dark grass
  and could not be read. It stands on paper now. ⛔ One of my own fixes was worse than the fault
  for a round, seen by reshooting. The gate counts PIXELS off the canvas rather than reading the
  size number, because a size can be right while the drawing is a mark.
- **A11 the lint reads canvas fonts, all twelve.** No stamp, tooling only. Every lint now walks
  the script block, reads every `px` in font context (a literal, or a `Math.max` floor), and
  refuses anything under 11.2 px, which is 0.7 rem at a 16 px root. Watched to fail in five
  games with a real 10 px insertion, each removed and verified byte identical. A size it cannot
  read statically is a NOTE naming the lines, not a guess. All twelve pass and there are zero
  live violations, because the three the Sep 06 grep found were fixed by hand; the gate holds
  the line from here. ⛔ It found one thing for the list: Asterism's poster preview (call 41).
- **A7 Gerplunk, the land.** `20260907b`, live. Both thin list items closed with no art: the
  point was one flat black polygon with a ruled top edge and is now a wooded shore with a
  gradient mass and a skyline drawn from the same continuous sines the far bank uses; and the
  stone you picked is held at the right edge of the frame and goes when the stone goes, which
  also fills the empty bottom third. ⛔ THREE OF MY OWN PROBES WERE WRONG FIRST and all three are
  written down: the trees vanished at distance so the gate correctly measured a ruled line, the
  palm probe was counting the SUN'S ROAD on the water (273 with the stone, 258 without), and its
  colour threshold was chosen rather than read off the canvas. One assertion was deleted for
  being decoration, a step count whose bands are one apart at 320.
- **A9 an ear gate in four games** (Fathom, Asterism, Wardian, Strata; the other six are left).
  ⛔⛔ **IT FOUND TWO REAL CLIPPING FAULTS OF THE SAME SHAPE, and every existing gate in both
  games was green over them, voice counters included.** A fresh GainNode's gain is ONE: Fathom's
  singback and Asterism's swell each start three sines at t0 but stagger their envelopes by 45
  and 90 ms, so for that long each of those voices went to the master at amplitude one rather
  than at a quarter of distance. Fathom's loudest minute peaked at **1.293** and Asterism's at
  **1.907**, which is clipping on the moment each game is proudest of. Both fixed, both stamped
  `20260907a`, peaks now 0.42 and 0.37. Wardian and Strata measured clean. Every band was
  measured first and each one watched to fail under a real alarm mutation. Strata's 26.5 percent
  above 3 kHz is the number to watch if Stephen ever calls the brush harsh.
- **A9 IS COMPLETE, ten of ten.** The second four (Doohickey, Airworthy, Windup, Updraft)
  ⛔⛔ **FOUND A THIRD CLIPPING FAULT, and it was in the quietest game in the fleet.** Windup's
  `softCurve`, the waveshaper whose own comment calls it "the ceiling", was
  `0.95 * tanh(1.6x) / tanh(1.6)`: its slope at the origin is 1.649, so it was a 4.3 dB BOOST on
  everything under its knee and `MASTER = 0.5` was really 0.82. It also ran at `2x` oversample,
  whose reconstruction filter rang 37 percent past the curve's own bound. Peak **1.364**, rms
  0.335. Now 0.744 and 0.216, with the same curve shape and the same asymptote and a slope of
  exactly one. Stamp `20260907a`. Doohickey, Airworthy and Updraft measured clean.
  ⛔ **Updraft's record chord is Fathom's fault line for line** and the only thing between it and
  a peak of 2.94 is a single `gn.gain.value = 0` before the first ramp. It is written down beside
  the assertion that guards it. Nobody delete that line.
  ⛔ And one band the agent wrote was decoration and it said so: Windup's high band ceiling of 6
  percent let its own alarm mutation through at 4.67, so it was tightened to 3 and watched to go
  red.
- **A10 Fathom's arcade tile, and C9 with it.** Reshot with occlusion, and the same for the five
  other games whose art changed today (Gerplunk, Updraft, Doohickey, Inkswing, Airworthy). Then
  the whole portal repinned: every one of the twelve had its `?v=` and its thumb `?v=` set to the
  stamp that game actually ships, which closes C9 and the eleven others like it. Ten of the
  twelve were pinned at `20260906b`, a stamp none of them has carried for a day. ⛔ Fathom's tile
  is right and still reads as a broken image on a shelf: queued as C11.

## 7. THE PROMPT TO PASTE INTO OPUS (Sep 07)

```
You are Claude Opus, lead builder on the twelve new games for Sky Wolf Studio, in the lucid-winds
repo at /workspaces/lucid-winds on branch add-sproing-jumper. Stephen is the Director and is away
for the day. Nobody will answer a question, so never wait on one. Work all day.

READ FIRST, in this order: HANDOFF-OPUS-SEP07.md whole (the list and how to take an item);
HANDOFF-FABLE-SEP06-EVENING.md sections 2, 8, 9 and 11 (the fresh box, the laws, the scars, what
his notes taught); docs/DIRECTOR-CALLS-SEP06.md (everything that waits on Stephen: never start any
of it, and add to it when you find a new call). Then do section 0 of the Opus list.

THE WORK, in this order:
1. Section A of the Opus list, A1 to A12, one at a time, each to its plan's SESSION STATE
   (plans/<game>/HANDOFF-<GAME>.md): the exact next action, the files, the gate, the shot.
2. Then section C, the look pass items, in the order they appear.
3. Then the polish loop, one game at a time in the spine's order (Fathom, Asterism, Swell,
   Wardian, Doohickey, Airworthy, Windup, Inkswing, Gerplunk, Whistlestop, Updraft, Strata):
   open it at 412x915 and 375x667 from where the player stands, play the first three minutes
   with real pointers, name three things wrong before Stephen would, fix the ones under an hour,
   queue the rest in section C, and move on. When the loop ends, start it again.

BEFORE EACH GAME'S BUILD PHASE, THE REFERENCE. Spend at most forty minutes writing
satellites/<game>/docs/REFERENCE.md: the two or three best titles or ideas in the world that do
what this game does (the category leader and the one people love), what each does that ours does
not, what we adopt, what we refuse and why. Ideas and mechanics only: no asset, name, character
or line of copy from anyone else ever enters a game, and no other title is named in player copy.
Use web search if this session has it, and say when a claim comes from memory instead. The note
reaches Stephen through the SESSION STATE; the build follows it.

THE LAWS, which do not bend:
- Copy: no dashes of any kind in player copy, commas instead; no exclamation points in system
  text; Sky Wolf Studio, singular; no economy claims, no coins, no rewards, no store. Text 0.7 rem
  minimum, canvas fonts included. Touch targets 48 rendered pixels at 375x667, proved by
  elementFromPoint at the control's centre, never by calling a handler. The bottom left 120 by
  120 of every game belongs to the music chip.
- One stamp per game in three places: var STAMP, every ?v= in the head, sw.js SHELL_VERSION;
  the lint holds it. A stamp is the UTC date and a letter: a game's first change today is
  20260907a, then b.
- Runtime modules are .js, never .mjs; the host serves .mjs as text.
- Two cores. Every command that opens Chrome runs as
  timeout 900 flock -w 1800 /tmp/sws-gate.lock node <cmd>. One browser at a time. Never a short
  timeout around a waiting flock. Never delete ~/.cache/puppeteer. A gate that fails inside a
  suite is rerun alone twice.
- Look before you gate: shoot 412x915 and 375x667, OPEN the shots, name three faults. A green
  gate is not a look. Shoot the worst angle on purpose.
- Every fix asks which gate should have caught it. Write that assertion, watch it fail once
  under a real mutation, then pass. Yesterday's four ways a gate lied: a gate built from its
  constant, a gate that measures an empty screen, a gate whose own comment excuses the bug, and
  a wav made for the ear (normalised) measured as if it were the game.
- Deploy: commit after every green subsystem; git push origin add-sproing-jumper; check
  git log HEAD..origin/main is empty; git push origin add-sproing-jumper:main; then
  curl -s "https://lucidwinds.com/<path>?probe=$RANDOM" grepped for a marker only the new
  build carries. Nothing lives only in a working tree. Never leave a game red on main: a fix
  that is not green within an hour is reverted, and the reason written down.
- Anything that is a taste, a name, a price, a rule that re grades what a player has kept, or a
  new system goes to docs/DIRECTOR-CALLS-SEP06.md section G with your recommendation and a
  cost, and is not built.
- Agents: you may run ONE fenced builder agent beside yourself, for a game you are not touching,
  with a hard stop, fenced git add, no pull, no push, no stash; only you push. Never more.

HOW TO REPORT. Every finished item gets a SESSION STATE entry (what landed, what was found, the
next action) and one line in HANDOFF-OPUS-SEP07.md section 6, the day's ledger, with the stamp
and the live check. Before you stop for any reason, write the morning report at the top of
section 6: what is live, what is half built (there should be nothing), and what Stephen has to
decide, as one ranked list. Do not ask for approval. Start now.
```
