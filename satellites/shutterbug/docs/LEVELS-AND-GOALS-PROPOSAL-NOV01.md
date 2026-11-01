# Shutterbug: making the level out of the photo, and a reason to shoot the next one

Design sprint, 1 Nov 2026, written 18:40 UTC. Six angles were prototyped and measured on the real sb-levels core (42fc8b19a) against 95 real photographs and 60 painted rooms, then scored by three judges (the player, the engineer, the designer). This is the plan you decide from. Four questions for you are at the end.

## 1. What is wrong today

In your words, 1 Nov: "It's literally every picture I really have to move the cropper around and then it mostly just makes the most basic level over light space where it adds a bunch of floating platforms, usually straight up, that's pretty boring." And: "we want an objective and reason to keep making and playing levels." On 31 Oct: "it keeps telling me try a tighter crop over and over", "everything feels the same", "no like real goal at the end".

The numbers, on 95 freely licensed real photos (60 rooms, 35 other scenes):

| | today |
|---|---|
| Photos that develop on your phone's build (sb-m1-3) | 5 of 95 |
| Develop at the default box on sb-levels | 15 of 95 |
| Develop after the automatic box search | 76 of 95 (median 11 test builds a photo, p90 49) |
| Where the bug stands on the climb | film tabs 61.1%, the photo 29.9%, the floor row 8.9% |
| Climb rows with nothing in the photo within reach ("desert") | 44.7% |
| Biome of the rooms that build | Attic 44 of 47 |
| Painted model rooms: film share of the climb | 73.3% |

Why it happens, found today and seen on the boards: the game decides solid by light against dark, so a wall's own shading reads as a solid mass and the furniture vanishes into it. The box search then drifts to the blank top of the room (busy boxes build only 16% of the time against 47% for bare ones), and the repair lays film tabs straight up the edge. The screenshot `/home/codespace/sb-drafts/photo/autocrop/shots3/scene-3-412x915-3-chosen.png` shows exactly that: five ledges up the left edge while the window sill sits unused.

And there is nothing yet that makes a new photo worth more than a replay. The house run being built tonight (five rooms, the ramp, the clay boss, a cosmetic per clear) is the goal you chose in Q96 and Q97. It gives a run a shape, but not a reason to go and shoot another room.

Already in flight tonight and not part of this plan: the capture normalisation (building now on sb-levels), and a fix to the box search so it reaches every box that builds (target 94 of 95; 18 of the 19 refusals have a box that builds which the search never tries). Those two fix "I have to move the cropper around". This plan fixes what the level is once it builds, and why you would make the next one.

## 2. How the judges scored the six angles

| angle | what it does | player | engineer | designer | total |
|---|---|---|---|---|---|
| climb | the repair aims at the photo's own tops; edges of things become ledges | 7 | 8 | 9 | **24** |
| goals | three stars a room, finds on the photo's surfaces, an album, photo quests | 8 | 6 | 7 | **21** |
| frame | the game scores boxes and picks the most climbable part of the photo | 6 | 7.5 | 5 | 18.5 |
| read | find the wall by its colour; solid only where the photo differs from it | 4 | 5 | 8 | 17 |
| blank | film set pieces (gallery, switchback, chimney) on bare wall | 5 | 3.5 | 5 | 13.5 |
| look | a 2x2 detail layer so the room looks like the room; a smaller share code | 3 | 4 | 6 | 13 |

All three judges put climb first to build. They agree on the order of the rest except one point: the player judge would squeeze the finds in tonight, the other two say tomorrow (section 5).

## 3. The plan

### Tonight, for sb-m1-5 (the box stops at about 04:05 UTC)

Everything tonight goes through the one lane that owns the level pipeline (sb-levels), one step after another. The weapons and house lanes carry on untouched.

**Step 0, already planned.** Photo 1a finishes (the normalisation, the search reaching every box, a review, the fixes) and goes to your phone early as sb-m1-4. Expected about 22:30 UTC.

**Step 1. Record v2 that can grow.** The share code gains a version 2 with the biome byte you ruled for in Q97 (the biome from the photo's real colour). Two more bytes go in the same header now, at no build cost:

* a **rules** byte that says which level rules built this room (0 means today's rules exactly, 1 means tonight's climb rules);
* a **flags** byte for optional extras later (a coded grid, the new reading's mask, the detail layer), all off tonight.

Why this matters: once a version 2 code is shared, its level must never change. With the rules byte, every later improvement to how levels are built (clearing unused film, the new reading, set pieces) becomes rules 2 or 3 inside the same version 2, instead of a version 3 and 4 that every client has to decode forever. It also means the biome can ship alone tonight if the climb is not ready, and the climb can follow tomorrow without breaking any code you have shared. Old version 1 codes keep their levels exactly.

**Step 2. Climb the photo (the climb angle, its lane A).** Three rules, all only on version 2 codes with rules 1:

1. **Edge ledges.** Where two stacked cells differ clearly in colour and neither is the wall, a run of such edges becomes a one way ledge from the photo: a desk edge, a shelf board, a frame top, a whiteboard tray.
2. **Stepping stones.** Each repair pass aims its film stair at the nearest thing in the photo you could stand on above the highest point reached, instead of straight at the top. Up to 8 passes instead of 4; still at most 12 tabs a pass and at most 15% of the room changed.
3. **Never lose a room.** If the new rules refuse a box, the game builds it with today's rules, so nothing that builds today stops building.

Measured (today against climb):

| | painted rooms (61) | real photos (22) |
|---|---|---|
| film share of where the bug stands | 73.3% to 54.8% | 64.8% to 49.3% |
| climb rows on film | 87.8% to 69.6% | 79.6% to 61.3% |
| photo surfaces stood on per climb | 2.3 to 4.7 | 3.6 to 5.8 |
| film tabs per room | 11.1 to 9.9 | 11.5 to 9.4 |
| rooms that build | 32 to 32 | 17 to 17 |
| rooms better by 5 points of film or more / worse | 23 / 2 | 11 / 2 |
| the test bot clears every level | 32 of 32 | 17 of 17 |

What you see: on the classroom (board r47) the climb walks the desks, the whiteboard tray and the projector bar, 81% film down to 20%. On the bookcase room (board model 10) it goes into the bookcase and climbs its shelf boards; only the last third is film, 93% down to 46%. The honest limit: on a bare wall above a sofa (board model 41) it is still a film stair, because the photo has nothing to stand on there. That is 47% of climb rows on both corpora, and only a better reading of the photo can move it.

**The gate.** If the climb is not green by about 02:45 UTC, sb-m1-5 ships with the biome alone (rules 0) and the climb follows tomorrow as rules 1. Before the deploy the lane times it in a throttled browser: it costs about 2.2 times today's build at the median (1.6 to 2.8 times at the slowest). If the slowest builds run far over the 50 ms budget, passes are capped at 6 and the search skips the second, fallback build.

Rough timeline: biome step about 00:00 UTC, climb about 01:30, its review and fixes about 03:00, merge with the house and weapons lanes and stamp by about 03:45.

### Tomorrow

**3. Pick the best box, not the nearest (the frame angle, only its option c).** When Develop refuses your box, the game today moves to the nearest box that builds. Instead it scores a few hundred boxes by how much of the climb the photo itself would carry, builds the best four at most, and takes the best. On 28 real photos the desert fell from 45.7% to 16.2% and film from 59.8% to 50.5% against tonight's search. On the rattan living room (board r11) the search lifts to the window and climbs 6 film ledges up the edge; the pick climbs the rattan chair. Your framing still comes first: it only acts when your box refuses, and your drag always wins. Two cautions from the boards: the pick tends to be a small slice of the photo (median 0.56 of the default width), and with today's reading it can pick worse on shaded walls (painted rooms m03 and m04), so it is measured again with the climb rules in. Its build count lead (27 of 28 against 21) will mostly vanish once tonight's search fix lands; its value is the better level. Question 2 asks whether it should also frame your photo before you touch it.

**4. Clear away unused film (climb lane B).** Tabs that the climb never stands on are lifted one by one when the route still holds. They show on boards r03 and model 44. Rules 2, after a phone timing check (each lifted pair costs one reach test).

**5. Finds (goals, part 1), on a new branch.** Up to 3 small collectibles per room, placed by the level rules on the photo's own surfaces and away from the film ladder. On the real photos: 2.39 a room on average, 173 of 182 at least 2 cells off the climb (median 6), so you leave the film stair to explore your own furniture. Board canisters shows them on the bookcase top and the cabinet top while the ladder runs up the side wall. Two fixes from the design judge go in first: they must not be called "film" or wear the film tab cream, because that colour means help (Q13). The working name here is **snapshots**, drawn with a coloured border. They gate on rules 2, so codes shared tonight keep their levels.

**6. Stars, album and photo quests (goals, part 2), on the house branch.** Three stars a room: light the beacon, find every snapshot, take no hit. A star pays only the first time, so a new photo is worth about twice a replay. An album keeps every room you climbed with its stars (capped at about 60 rooms at first, because 300 rooms is about 300 KB of save). Quests deck 1: climb a new room, find all snapshots, three stars in a new room, three new rooms in a day, a clean room 4 or 5 of a house, a house with 10 stars. A daily photo: "a room you have never climbed". It waits for the house lane to merge because that lane owns the doorway card and the title. Question 3 asks what stars pay.

### Later this week

7. **A smaller share code (look, its coder only).** Coded the way photos compress, the grid drops from 582 bytes to a median of 183, so the QR goes from version 20 to about 11. Lossless, levels untouched, a flag on version 2. It makes room for step 8.
8. **Read the photo by figure and ground (read).** At capture, find the wall by its colour and how its shading changes across the room; a cell is solid only where the photo differs from the wall. On board scene 3 the darker lower wall stops swallowing the cabinet: only the cabinet and the sofa read solid. Default box builds go from 15 to 29 of 95, and the search needs a median of 3 builds instead of 11. But on its own the levels get worse (desert 44.7% to 54.3%, film 61.1% to 63.3%; scene 3 still climbs 12 tabs up the right edge), so it only ships on top of the climb rules, as a flag plus a rules value on version 2, after two fixes the boards demand: pick the wall only from rows 8 to 40 and never a region that mostly touches the top (r13 picked a beamed ceiling), and keep ledges inside big solids so a bookcase keeps its shelves. The 1 bit mask is stored in the share code; it is not the photo. Question 4.
9. **Colour quests and colour daily prompts,** only after version 2's biome and a "Reads as" badge on the crop screen, so green is never a lottery again ("I try to do something green and it just won't do it"). Green is read in 1 of 47 developed real rooms today.
10. **Set pieces on bare wall (blank), chimney and switchback only,** where measured desert remains after the climb and the new reading. The chimney on the arched door (o13) is the best fit of any piece; but film share does not fall with pieces (61.1% against 60.8%), they only rearrange it.
11. **The 2x2 detail layer (look),** only after your ruling on privacy (four times more of your room in every share) and a fix for shelf lines that look standable but are not.

## 4. What it costs

* **Build time.** The climb costs about 2.2 times today's build; the search, which builds many boxes, gets slower even though no frame freezes. Measured in Node on a loaded box; the phone is timed before tonight's deploy.
* **Lanes.** Tonight: two steps in the sb-levels lane (biome and the climb) plus its review, inside the box's remaining hours. No fourth lane: the box has 2 cores and one browser at a time. Tomorrow: four lane steps (pick the best box, clear unused film, snapshots, stars). This week: two (the coder, the reading).
* **Share codes.** Version 2 codes grow by three header bytes tonight. The new reading would add a 144 byte mask, which the coder pays for so the QR stays at version 20 or smaller.
* **Goldens.** The snapshots move the level hash once on new codes; old codes keep theirs.
* **Design redlines** you should know about: DESIGN 6.7 (repair: 8 passes, aimed stairs, edge ledges as photo ledges, a fallback in place of "ask for a tighter crop"); DESIGN 6.3 and 6.13 when the reading lands (a stored mask instead of light against dark).
* **Unmeasured:** nothing here was played on your phone; the real photo numbers for the climb come from 22 photos (the full 95 run is in the lane's brief); none of the combinations (climb with frame, climb with read) has been measured together yet, and each lane measures that first.

## 5. Where the judges disagreed

* **Snapshots tonight?** The player judge would build them tonight if a lane frees up, so your phone has something to hunt off the ladder. The engineer and designer say tomorrow: they touch the loot list that the weapons lane is editing tonight, the name and colour need fixing first, and they need the new surfaces the climb creates. This plan says tomorrow.
* **Auto framing on open.** The engineer would ask you; the designer says it overrides your framing against the spirit of your Q96 ruling 3. This plan recommends only on a refusal (question 2).
* **Biome alone if the climb is late.** The engineer would rather ship no version 2 at all than biome first and climb later. With the rules byte that risk is gone, so this plan ships the biome either way.

## 6. Not building

* Blank's gallery as built (board r40: as dense as the stair it replaces, a frame drawn over the spawn), the spring, crumbling and moving tabs, and frames holding crops of your photo (the photo never persists, and a shared code has no photo).
* Climb's chain planner, route score and zigzag: measured, none beat the simple stepping stone.
* The new reading shipped on its own, and any uncoded mask that pushes the QR to version 23.
* Look's 4x4, dithered and smoothed variants (no QR for 1 room in 4, or 94 of 95; smoothing makes 38 false ledges a level).
* A time star (the game has no honest par), colour quests before the "Reads as" badge, a 300 room album before the save size is checked.
* Any record version 3.

## 7. What you decide

1. **Tonight's version 2:** the climb rules in it (recommended), the biome alone, or wait.
2. **Framing:** pick the best box only when yours refuses (recommended), frame every photo on open, a "find the best part" button, or leave the nearest box search.
3. **What stars pay:** 5 Dead pixels the first time, cosmetics staying on house clears (recommended), a star road of frame styles as well, or nothing but the album and quests.
4. **The new reading:** this week, coded and only with the climb (recommended), or not yet.

## The boards

* `/home/codespace/sb-drafts/design-nov01/climb/boards/board-r47.png` the classroom: today's tab zigzag against the climb over the desks and the whiteboard tray.
* `/home/codespace/sb-drafts/design-nov01/climb/boards/board-model-10.png` the bookcase room: a straight ladder up the wall against a climb up the shelf boards.
* `/home/codespace/sb-drafts/design-nov01/climb/boards/board-model-41.png` the limit: a bare wall stays a film stair in every version.
* `/home/codespace/sb-drafts/design-nov01/read/boards/board-img-scene-3.png` the root cause and the new reading: the shaded wall stops swallowing the cabinet, but the level still needs the climb.
* `/home/codespace/sb-drafts/design-nov01/frame/boards/board-r11.png` the search climbs film up the window; the best box climbs the rattan chair.
* `/home/codespace/sb-drafts/design-nov01/goals/board-canisters-1.png` snapshots placed on the photo's own tops, away from the ladder.

Every proposal with its full numbers: `/home/codespace/sb-drafts/design-nov01/ALL-PROPOSALS.json` and each angle's `proposal.md`.
