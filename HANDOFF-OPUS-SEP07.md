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

(see section 3)

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
3. Storm and Lullaby have never been rendered to a wav (call A2). **Queued as C3, twenty
   minutes: render both to `docs/shots/` with the existing tool and run them through the three
   numbers (peak, rms, share above 3 kHz).**

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
2. In the field the first hint ("Hold to pull the string. Let go to give it line.") is drawn
   across the kite and its line at mid screen, on top of the subject it is describing. Move it
   to the band under the horizon, above the reel. **Queued as C4, twenty minutes.**
3. The altitude readout at the top centre is small grey on the dark sky band and barely reads in
   the shot; the reel is a gold coin and the tree is three circles (thin list, A6). **The readout
   is checked in the sweep below; if it is under 12 px or under contrast, it goes into A6.**

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
  kite, stamp `h`.
- Sweeps over all twelve: the tremolo wired into a gain (only Gerplunk had it), canvas fonts
  under 11.2 px (Airworthy, Windup, Whistlestop, fixed), dashes and exclamation points in canvas
  text (none), the plural brand (none in the twelve, 96 files in the old fleet, A12).
- The nine games not in his notes reshot with their own tools and OPENED; section 3.

## 5. WHAT STEPHEN IS ASKED (one list, ranked; the detail is in the calls doc)

1. Gerplunk's turn (G22). 2. His ear on three wavs: Gerplunk's bed, Windup's tine at the new
level (G36), Swell. 3. Inkswing sand, keep or replace (G33). 4. Inkswing's Twin (G31). 5. The
Airworthy ladder order (G34). 6. Gerplunk's list of skippables and waters (G23, G24). 7. What he
saw in Airworthy landscape (G35). 8. Wardian's BUY (G37). 9. The rest of section G.
