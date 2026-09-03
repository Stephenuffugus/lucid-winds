# SEP 03, FABLE'S REVIEW OF THE 3D AND VR AUDIT (V1)

Written by Fable on 2026-09-03 against branch `add-sproing-jumper`, commits `32d35661`,
`eba9b2ac`, `4c91fd32`, `975c338f` and `2fcf867f`. The brief under review is
`HANDOFF-3D-VR.md` (mine), the answer is Opus's four documents plus `QUEST-COMPAT.md`. This
file is the only thing I wrote, plus one sentence corrected in `HANDOFF-3D-VR.md` section 3,
which the fence allowed once check 2 confirmed it. Nothing in Opus's four documents was
edited: every correction below is his to apply, in the JSON, then rerun the gates.

Part 1 is the review. Part 2 is the separate music player spec, which is not part of the
review and is written for the Director to approve before a line of code.

---

## 0. The verdict, in one paragraph

The audit is sound where it matters and wrong in the places a reader would not think to
look. The shortlist order is right and the ranking departure was the correct reading of my
brief. The headline finding, that only about four satellites run their sim with no screen,
is true and it corrects my own section 3, which I have now edited. The cite discipline is
real but not perfect: 23 of 25 sampled cites say what the row claims, and the two that do
not are both rows where the lane was decided without the code being read (The Attic,
Dragon Philosophy). The shots are the games, not the portal, but there are 35 of them, not
38, two are the same file under two names, and the two cheapest rows on the shortlist
(Create A Critter, Budburst) have no shot of the thing their VR build is about. The single
change I would make before the Director reads it is at the end of section 11.

---

## 1. The four gates, run one at a time

| gate | last line | exit |
|---|---|---|
| `node scripts/vr_audit_check.mjs` | `UNREAD   3` (first line `VR AUDIT CHECK PASSED   187 rows, catalog().total 187`) | 0 |
| `node scripts/vr_audit_md.mjs` twice, then `cmp` | `wrote docs/3D-VR-AUDIT.md  187 rows, 111260 bytes` both runs; `cmp` silent, byte identical, and identical to the committed file | 0 |
| `node scripts/quest_triage.mjs --selftest` | `SELFTEST PASSED: every detector can fire and can stay quiet` (29 `ok` lines) | 0 |
| `node scripts/catalog.mjs` | `A VISITOR CAN OPEN   161   <- the number for player-facing copy` (above it `TOTAL CARDED         187`) | 0 |

**Watched to fail.** I broke a scratch copy of the JSON eleven ways and called `check()` on
each. Every prescribed break went red on its own line, plus five more of my own:

| break | result |
|---|---|
| blank a comfort | RED, `Ripcord: comfort is empty` |
| blank a cite | RED, `Conduit: no cite and no UNREAD` |
| drop a row | RED, `row count 186 does not equal catalog().total 187` (and names the missing row) |
| lane "SEATED" | RED, `Abduct a Chameleon 3D: lane is "SEATED", not one of ...` |
| `BUILD 4 days` beside effort S | RED, `Glyph Forge: notes say BUILD 4 days, which is M by section 4, but effort is S` |
| `BUILD 11 days` beside effort M | RED, `Abduct a Chameleon: ... which is L by section 4, but effort is M` |
| cite as prose with no line | RED, `cite "see the camera code" is neither a file:line nor UNREAD` |
| bare `UNREAD` with no reason | RED |
| blank hands | RED |
| rename a row | RED, twice (missing from the audit, not in the catalog) |
| untouched control | GREEN, 0 fails |

So the gate is not decoration. Two limits of it, so nobody over reads the green:

- **The days assertion covers 15 of 187 rows**, the ones whose notes state `BUILD n days`.
  Of the 12 `M` rows, three carry no days at all (The Attic, Moon Claw, Skyshot), and Moon
  Claw and Skyshot are shortlist rows whose day counts (9 and 8) exist only in the hand
  written shortlist. The gate cannot see them. Put the days in the JSON notes for every
  shortlist row and the gate covers the list the Director reads.
- **`scripts/vr_audit_md.mjs:33` hardcodes "ALL 187 CARDED GAMES" in the title.** The
  check script's own header comment explains why a hardcoded total is the thing to avoid.
  Derive it from `rows.length`.

---

## 2. Check 1, the cite audit. **23 of 25 hold.** Verdict: HOLDS, with two misses named

Sampled 12 TABLETOP, 6 STANDING, 5 WINDOW, 2 NEVER-IMMERSIVE. Each cite opened at its line.

| row | lane | cite | at the line | verdict |
|---|---|---|---|---|
| Abduct a Chameleon | TABLETOP | `abduct-a-chameleon/index.html:2021` | `cam.x = worldW<=vpW/zoom ? worldW/2 : clamp(...)` | HIT, exact |
| Conduit | TABLETOP | `conduit/index.html:1883` (camera field cites `:1926`) | `:1883` is the world to screen transform; `:1926` to `:1930` is the clamp that centres when the site fits | HIT |
| Tangent | TABLETOP | `tangent/index.html:1289` (notes cite `:1246`) | `:1289` applies the transform; `:1244` to `:1246` frames deck or system | HIT |
| **The Attic** | TABLETOP | `attic/index.html:1252` | `var x = cv.getContext('2d')` inside `drawCard`, the 640x960 share card renderer. The row's `camera` and `area` are both UNREAD. | **MISS.** The cite is a card exporter, not the game; the lane was set on a hands sentence with nothing read. Both Attic shots are the how to play screen, so the board was never seen either. |
| LOAF | TABLETOP | `loaf.html:7390` | `cam.position.lerp(...)` toward the box | HIT |
| Create A Critter | TABLETOP | `create-a-critter/index.html:2155` | `camera.lookAt(0,0.72,0)` | HIT, exact |
| Jumping Jimothy | TABLETOP | `stream-hop/index.html:1895` | `G.camY = ...; G.camYt=G.camY;` under `// camera init` | HIT on the variable, weak on the line: the brief asked for "the line that moves it", which is `:3053` `G.camY += (G.camYt-G.camY)*...` |
| Dewball | TABLETOP | `dewball/index.html:4498` | `camera.position.x+=(cx-camera.position.x)*k;` | HIT, exact |
| Hexa Hive | TABLETOP | `hexa-hive/index.html:777` | `ctx.setTransform(DPR,0,0,DPR,0,0)` | HIT (a DPR only transform is a fixed camera) |
| Chess | TABLETOP | `games/chess.js:1430` | `function render(){` | HIT, weak (proves a DOM render exists; fixed follows from no transform) |
| Mancala | TABLETOP | `games/seedsow.js:358` | `function render(){ var h='<div class="ss-board">'` | HIT, weak, same shape |
| Shut the Box | TABLETOP | `games/_inline/doubleshutter.js:62` | `function rn(){` | HIT, weak, same shape |
| Ripcord | STANDING | `ripcord/src/battle3d.js:378` | `S.cam.position.set(...)` then `lookAt(C3.lx,0,C3.lz)` | HIT (note `el` varies with zoom at `:376`, so "fixed elevation" is nearly true, not exactly) |
| Aura Off | STANDING | `aura-off/src/engine/rig.js:683` | `return '<svg class=...` | HIT (the rig returns a string, no DOM) |
| Skyshot | STANDING | `skyshot/index.html:1144` | `function render(){ ... setTransform(DPR...)` | HIT |
| Moon Claw | STANDING | `moon-claw/index.html:1279` | `ctx.setTransform(DPR,0,0,DPR,0,0)` in `draw(t)` | HIT |
| Burrow Bowl | STANDING | `burrow-bowl/index.html:1052` | same shape, shake translate at `:1054` | HIT |
| Sweet Spot | STANDING | `sweet-spot/sweet-spot.html:31` | `#wrap{... overflow:hidden ...}` | HIT, weak (CSS, fixed by construction) |
| Lucid Winds | WINDOW | `index.html:53839` | `if(!window.DeviceOrientationEvent)return;` after `_updateCompass(0)` at `:53838` | HIT, exact |
| Puppy Dash | WINDOW | `puppy-dash/index.html:931` | `function render(){ ctx.save();` | HIT, weak |
| Sunforge | WINDOW | `ring-stacker/index.html:599` | `cv.width=540*DPR; ... setTransform(DPR...)` | HIT |
| Pit Bike Rally | WINDOW | `pitbike-rally/src-dly17/render.js:221` | `ctx.setTransform(view.s,...)`; `view` is assigned only inside `resize()` at `:17` to `:25` | HIT, exact |
| **Dragon Philosophy** | WINDOW | `dragon-philosophy/assets/index-4THyIxFZ.css:1` | `@font-face{font-family:Cinzel;...}` | **MISS.** A font face declaration in a Vite bundle says nothing about camera, area or input. The honest cite is UNREAD with the reason (built bundle), which is what Wild Wardens got. |
| Super Slice | NEVER-IMMERSIVE | `slice-3d/index.html:2243` | `camera.position.x+=(camT.x-camera.position.x)*...` | HIT, exact. See below for the notes' line numbers. |
| Sproing | NEVER-IMMERSIVE | `sproing/index.html:1417` | `if(p.y-game.camY<lockOff) game.camY=Math.min(...)` | HIT, exact |

**The two you asked me to check myself.**

- **Super Slice forest.** The substance holds: the forest branch targets the knife's own
  `G.x` and `G.y`, lerps on three axes at `:2243` to `:2245`, and adds shake at `:2247`
  (`kx` computed at `:2246`). The mode gates are where the notes say (`:1492` climbWall,
  `:1523` run, `:1553` ff). **One line number is wrong by three:** the notes and the
  shortlist both say "the final `else` at `:2237`", but `:2237` is the climbWall branch
  (`camT={x:G.x-1.5, y:Math.max(9,G.y+6.5), z:34}`); the final else with the quoted content
  (`Math.max(8.5,G.y*0.4+8), z:26`) is at **`:2240`**. Both branches chase, so the verdict
  stands. Fix the number in the JSON notes and the shortlist.
- **Dewball.** Exact. `globe:1` is at `:2753` on world w7, `camPitch=W.globe?0.76:0.62` is at
  `:3911` with the comment "look DOWN onto the field", and the chase lerp is `:4498` to
  `:4500` inside `updateCamera` at `:4490`.

**The pattern behind the weak hits.** For most `L` board and card rows the cite is the head
of a `render()` function. That proves a renderer exists and that no transform is applied,
which is a fair basis for "fixed", but it is a "there is a renderer" cite, not a "this line
decided the lane" cite. The gate cannot tell the difference and never will. It is acceptable
for the long tail; it is not acceptable for a shortlist row, and none of the shortlist rows
in my sample were of that shape.

---

## 3. Check 2, the split ladder. Verdict: **HOLDS**, and my section 3 was wrong

I opened the three named harnesses and then classified all twelve `test/` folders my
section 3 listed as "which means their sim runs with no screen".

| harness | what it actually does |
|---|---|
| `conduit/test/harness.js` | extracts the first script block, `vm.createContext({console, Math, performance})`, no DOM at all, reads `ctx.CONDUIT`. **A genuine split.** |
| `burrow-bowl/check.mjs` | `new vm.Script(b.code)` per block (compile only, `:43`), then `puppeteer.launch` at `:65`. **Not a split.** |
| `create-a-critter/check.js` | header, verbatim: "No browser is used here, so this proves ONLY what the source can prove." `new vm.Script` per block at `:36`. **Compile only.** |

The twelve from my section 3:

| genuinely no screen (4) | game body behind a stubbed DOM (4) | compile the blocks, then puppeteer (4) |
|---|---|---|
| ripcord (`src/sim2.js` imported by 4 harnesses) | aura-farm (`harness.mjs`) | budburst (`check.mjs` + `play.mjs`) |
| conduit (`harness.js`) | power-scalers (`harness.mjs`) | moon-claw (`check.mjs` + `play.mjs`) |
| aura-off (`balance-sim.js`, `validate.js`, `integration.js` import the engine) | tangent (`harness.js`, `smoke.js`, `ui.js`) | skyshot (`check.mjs` + `play.mjs`) |
| attic, **with a caveat** | twin-lanterns (`probe_puzzle.mjs`) | stream-hop (`jimothy-check.js`, vm and puppeteer both) |

**The Attic caveat.** `attic-engine.js` is a UMD module (`module.exports = API` at `:634`,
header says "node + browser") that turns a hash into an object. That is the generator, not
the round: the dig, the wipe and the shelf live in `index.html`, and `test/attic-check.js`
now just spawns `check.js`, which its own header describes as "vm + DOM stub, the house
pattern". So The Attic is a DOM free generator behind a stubbed DOM round. Three and a half
splits, not four. Opus's ladder is right in kind and generous by half a row.

**Budburst is misfiled.** Its row says "already runs headless behind stubs" and the
shortlist says "`test/check.mjs` and `test/play.mjs` drive it headless behind stubs". Neither
is true: `check.mjs` compiles the blocks and pulls two pure helpers (`isPlain`, `numMap`) into
a bare `vm.createContext({})` at `:52` to `:54`, and `play.mjs` is puppeteer. That is
exactly Moon Claw's shape (`check.mjs:73` to `:75`, `play.mjs`), which the audit files as
"partial", and exactly Burrow Bowl's, which it files as "no". Budburst has no sim split. It
is still `M` and still the cheapest honest body verb, but "already headless" is one of the
two legs its 4 day estimate stands on and it is not there. Reword the split to match Moon
Claw's, and re-estimate the days with a determinism gate that has to be built from nothing.

**Not recounted.** The 13 and 17 in the 4 / 13 / 17 ladder cover 34 harnesses; I verified the
12 above and the 3 named, not the other 19. The headline (only a handful run with no
screen) is proven; the exact split of the rest is UNPROVEN and does not change anything.

**Applied to `HANDOFF-3D-VR.md` section 3:** the sentence "which means their sim runs with
no screen" is now replaced with the ladder above. That was the one edit the fence allowed and
the finding earned it.

---

## 4. Check 3, the lane inflation question. **My ruling: TABLETOP is the right word. Do not relane. Change what leads.**

I read the ten you named plus five WINDOW puzzles for the contrast. Chess (pick a piece up,
set it down), Mancala (scoop and sow), Klondike (deal and move a run), Yacht-Sea (shake a
cup and throw), Hexa Hive (set a hex), Tetroku (turn a shape until it drops in), Tower of
Hanoi (lift a ring off a peg), Sokoban (push a crate), Snakes & Ladders (throw a die, walk a
token), Sea Battle (stand ships up, push pegs in). Every one of those hands sentences is a
true sentence about a physical object on a table, and every one is a verb from section 4's
own list: reach, place, flick, throw, stack. Line Loom ("draw a thread and hook it round a
peg") is the only one I would argue with, and it is arguable, not wrong.

The contrast rows are consistent too: Sudoku, Minesweeper, 2048 and Mini Crossword are all
`board` and all `tap`, and all stayed WINDOW. The line Opus drew, without ever stating it,
is **"is the thing under the finger an object you would pick up, or a mark you would make".**
A tile you set is an object; a digit you write is a mark. That line is right and it should be
written into section 4 as the tie break, because today it is implicit and a second auditor
would not find it.

So the vocabulary did what I wrote it to do: it is a **shape** test, and 165 of 187 games in
this catalog have a fixed camera on a stage that fits one screen. Renaming seventy board
games WINDOW would make the lane a priority list wearing a shape word, and the WINDOW
sentence ("tap a floating panel") would then be false for chess. I will not do that.

What was wrong is not the lane, it is **what leads.** Every one of the four documents opens
with `TABLETOP 79`, and the Director reads that as seventy nine things to build. The number
he needs is lane by effort, which the check script already prints and nobody put first:

```
                 S    M    L
WINDOW          85    0    3
TABLETOP         0    7   72
STANDING         0    5    5
NEVER-IMMERSIVE  0    0   10
```

**Twelve rows are buyable, none at `S`, the cheapest is four days.** That is the headline.
The seventy two `L` TABLETOPs are the classics shelf, which `3D-ASSET-CANDIDATES.md` Tier 4
already treats as one bulk art job, and that is the right home for them.

---

## 5. Check 4, the ranking departure. Verdict: **HOLDS.** It was the right reading, and it is what I meant

My brief says "Rank by lane (TABLETOP and STANDING first), then effort ascending, then
comfort." The parenthetical names two lanes as one group. Nothing in it orders TABLETOP
above STANDING, and a reading that did would put seventy `L` board games above Ripcord,
which the same brief calls "the most complete STANDING candidate on paper". Opus read it as
both body lanes first, together, then effort, then comfort, and said so at the top of the
shortlist. That is the reading I intended and the shortlist order is correct. The full
table generated by `vr_audit_md.mjs` still sorts TABLETOP before STANDING, which is fine for
a table sorted by lane and does not affect the list the Director picks from.

---

## 6. Check 5, the quest triage changes. Verdict: **HOLDS.** I agree in writing, with the hole named

**Sproing kept its exact Aug 16 wording.** Before `32d35661`:
`- **Sproing** — offers tilt steering, so confirm the drag option is the default in a headset`.
Now: the same string, byte for byte, at `QUEST-COMPAT.md:40`.

**The fourth fix, "blocked needs no other way in".** The detector at
`scripts/quest_triage.mjs:227` to `:233` now reads: cosmetic only, no flag; else no
`pointerPath`, blocked; else caution. `pointerPath` at `:227` is
`/(pointerdown|pointermove|touchstart|mousedown|onclick|addEventListener\(\s*['"]click)/`
over the whole file. **The hole is real:** a game whose only in round control is tilt but
whose Start button has an `onclick` reads caution, not blocked, because a menu click is a
pointer path by that regex. The selftest at `:305` covers "moves the player, no pointer path
at all" and `:307` covers "tilt beside a live pointer path", and neither covers "tilt only
in play, click only in the menu".

**Why I agree anyway, in writing:**

1. **There is no such game in the catalog.** Only three files in the whole catalog register
   a tilt listener: `satellites/sproing/index.html` (tilt beside drag, 13 `steer` matches),
   `loaf.html` (card shine, cosmetic) and `index.html` (compass, cosmetic). I grepped every
   `satellites/*/index.html`, `games/*.js`, `games/_inline/*.js` and `play/*.html`. The
   hypothetical has no instance to be wrong about.
2. **A wrong caution costs one look on the device; a wrong blocked cost nineteen games in
   August.** The rule is the same asymmetry the pinch and keyboard detectors already run on,
   and blocked staying at 0 across 187 is the fact the 2D store path rests on.
3. **The keyboard detector has the same hole and a worse failure.** `keys && !pointer` at
   `:146` uses an almost identical regex, and a keyboard only game with a Start `onclick`
   emits **nothing at all**, not even a caution. Tilt is now strictly the more honest of the
   two. If either is tightened later, tighten both, and the tightening is "a pointer
   listener whose body reaches game state", which is the static analysis rabbit hole the
   pinch detector's history warns about.

Verdict on the four fixes: HOLDS. I did not re-watch the first three go red; the selftest
cases at `:265` to `:308` exist for each, the `--selftest` gate runs 29 cases green, and the
counts (170 / 16 / 0 / 1) reconcile with `catalog.mjs`.

---

## 7. Check 6, the shots. Verdict: **HOLDS on content, WRONG on the numbers**

**The committed images are the games.** I opened 19 of the 35 and none is the portal,
including the gated ones (Conduit, Aura Off, Ripcord, Tangent, Moon Claw, Skyshot, Dewball,
LOAF's neighbour The Attic). The `sws_dev_ok` variant of the shoot script is not in the repo
(`scripts/shoot_games.mjs` has no dev gate handling), so the re-shoot is not reproducible
from what is committed; the images are.

**Three number errors in the shortlist text.** `docs/shots-vr/` holds **35** images, not 38.
There are **15** play shots, not 14. The "six of fourteen" sentence lists **seven** games
(Moon Claw, Skyshot, Ripcord, The Attic, Dewball, Jumping Jimothy, Checkers).

**Two files are one image.** `create-a-critter-4scribble.png` and `create-a-critter-5alive.png`
are byte identical (same md5), and both show the "How it works" modal, not a scribble and not
a living creature. **No shot in the set shows a critter alive**, on a game whose thirty second
demo is "it walks across the table toward you". "Every one opened" cannot be true of these
two, because opening them shows the same modal twice.

**The five you named, three things each, mine against his:**

| shot | Opus's three | mine |
|---|---|---|
| `moon-claw-1boot` | flat cabinet, no side walls; card covers Play a cabinet; chip clips the M | **the same three.** |
| `burrow-bowl-2play` | 2D trapezoid, no depth; FLICK UP THE LANE follows the perspective; ring values 11 to 13 px | the same three, and a fourth he missed: the **"♫ New song" pill sits bottom left on the ball's launch point** and the DEWBALLS pip row, which in a headset is a panel on the thing you flick. |
| `create-a-critter-3draw` | canvas about 8 percent of the frame; buttons about 44 px in tight rows; near white ground | the same three (the ground is pale lavender, and the point stands). Add: the chip clips "Draw" in "Draw your creature!". |
| `ripcord-4round` | grade card covers the bottom half of the dish; overhead dish reads flat; 10 px stat bars and a 9 px explainer | the same three. The dish has more rim shading than "flat ring" credits, but at table scale the call is right. |
| `tangent-2play` | deck 200 px in the top 45 percent; "let it ring" and "hold" are the smallest text; chip drawn over the deck's lower left rim on a mount point | **the same three, and the chip one is exactly as described:** the ♫ Music button sits on the rim over the left mount dot. |

**Where his reading of a shot is wrong.** `skyshot-1boot.png`: the shortlist says "the
music unlock card covers the Play button on boot and the ♫ Music chip clips the heading,
again." In the image the Play button is fully visible above the card, and the chip sits top
left with clear air between it and the centred title. Both halves of that sentence are true
of `skyshot-2play.png` (the how to play screen), not of the boot. Same for Create A Critter:
the chip clips the draw screen's title, not the boot's.

---

## 8. Check 7, the two fleet wide claims

### (a) The how to play prose. Verdict: **HOLDS, with the count corrected to seven of fifteen**

I opened all seven named play shots. Six are walls: Moon Claw (7 paragraphs, about 12 px),
Skyshot (6 paragraphs including a keyboard line), Ripcord (about 15 px, scrolls past the
frame), The Attic (serif, scrolls), Dewball (three boxed sections, 13 px), Jumping Jimothy
(twelve icon rows, about 12 px). **Checkers is not a wall:** five lines at 16 px, one screen,
a LET'S PLAY button, which is what a how to play screen should look like. **Conduit is a
wall and was not listed:** `conduit-2play.png` is the intro card, five paragraphs, "Enter the
site". So the honest count is **seven of fifteen** (Moon Claw, Skyshot, Ripcord, The Attic,
Dewball, Jimothy, Conduit), Checkers is the counter example to point at, and the claim that
this is the commonest way a good game feels bad at 1.5 m is right on the evidence.

**A known thing, not a new one:** every one of these rows carries "Reading none (firm)" from
`portal/catalog-tags.json` in its notes, next to a shot that is all reading. The tag measures
text in the round and the wall is before the round, so both are true, but a row that says
"Reading none" beside a picture of seven paragraphs needs one clause saying which reading it
means. Fleet task, not VR task, agreed.

### (b) The "♫ Music" chip. Verdict: **HOLDS, and the mechanism is in the module's own comments**

The chip is placed by `music-unlocks.js` `freeCorner()` (`:183` to `:200`), which scores a
3x3 footprint at each candidate with `occupancy()` (`:170` to `:182`). **A `canvas` under the
point scores 3, the maximum, at `:176`.** On a full screen canvas game every candidate ties
at 3, no spot returns 0, and the loop keeps the first spot: `left:10px; top:10px`, which is
where every game's title lives. That is the whole bug, and the comment at `:194` already
records half of it ("a centre line alone let it clip a title's top"). So this was a known
thing with a half fix, written down inside the file on Sep 02.

Against the five games named: Moon Claw **yes** (boot), Dewball **yes** (boot and how to),
Skyshot **how to screen only**, Create A Critter **draw screen only**, **The Attic no**: in
both Attic shots the chip sits top centre right with clear space beside the title. Two he
did not name: **Jumping Jimothy** (clips "How to play") and **Conduit** (overlaps the C of
CONDUIT). Tangent over the deck rim: confirmed. Fleet task, not VR task, and the fix is one
line: make `canvas` score 1 (a background) rather than 3 (a control) unless it has a
`pointerdown` listener at that point, or simply exclude the title band. Not for this review
to build.

**Also known, and already mitigated:** the card covering Play a cabinet on Moon Claw is the
same defect `music-unlocks.js:273` records from Ripcord's playthrough gate ("the card sat
over the Launch button"), and the module already minimises the card on any tap outside it.
A player taps Play, the card gets out of the way, the game starts. It is worth a line in the
shortlist so nobody files it as new.

---

## 9. PadLab and Music Studio. **V1 owes the read, for both, and it is an hour**

`studio.html` is **in this repo, 4548 lines**, five `canvas`/`getContext` sites, four
`pointerdown` listeners (`:1376` a canvas edit buffer, `:2331` a cell grid, `:3088` a pad
grid, `:3486` the autosave dirty flag), an `AudioContext` synth from `:551`, and eight
`overflow: auto` regions. That is a proportional read of twenty minutes, exactly the kind
section 5 prescribes for files over 3000 lines. "Outside the stated source shape" is a
reason to note the iframe; it is not a reason to leave the nearest thing to PadLab as UNREAD
while the shortlist spends a paragraph agreeing with Aug 16 about it.

`padlab/index.html` is also in this repo, 2380 lines, with its own `AUDIT-NOTES.md` and
`HANDOFF.md`. It is not a carded row, so the gate cannot count it, but section 5's own rule
is that an older document unanswered wins silently, and Aug 16 named PadLab as the biggest
differentiator. **Add an appendix to `3D-VR-SHORTLIST.md`, "Judged, not carded", with one row
each for PadLab and Music Studio in the section 4 vocabulary**, cited, outside the JSON so
the row count gate stays honest. My expectation from the grep, to be refuted by the read:
Music Studio is WINDOW (a sequencer grid is a screen of panels, tap and drag), PadLab is
the only candidate in the building for STANDING as an instrument, and both are `L`.

---

## 10. Things called findings that were already written down

- **Ripcord's 112 meshes loaded by one file.** `HANDOFF-3D-VR.md` section 2 row 5 and
  section 3 ("Ripcord grew a 3D battle view, 112 forge meshes ... The pattern is proven in
  this repo"). Tier 1 of the asset doc is that paragraph with a ranking on it. Fine, but not
  new.
- **Dewball's globe world w7.** Memory `project_dewball_landmarks_aug09` and the asset doc's
  own Tier 2 both name w7 as the globe. "I can tell you it is half built" was written on
  Aug 9.
- **The music chip clipping titles.** `music-unlocks.js:194`, Sep 02, quoted above.
- **The card covering a Play button.** `music-unlocks.js:273` to `:275`, Sep 02, from
  Ripcord's own gate, with the mitigation shipped.
- **Tangent "needs the deck" being false.** My Sep 01 review, `HANDOFF-TANGENT.md` R1 to R7.
  Opus cites it correctly as "Tangent's own review (Sep 1)". Not a finding, a pointer.
- **The Attic's art is the hash.** The engine's own header. Correctly cited as the law, not
  discovered.
- **Sweet Spot's `L`.** Section 9 said "highest reinvention cost" and the row agrees.

None of these is claimed as new in a way that misleads; they are listed so the Director
does not read the audit as having found seven things it inherited.

---

## 11. The one thing I would change before the Director reads it

**Shoot the board on the two cheapest rows before he picks.** He will pick from the cheap
end: Budburst (4 days, Opus's own "do this first") and Create A Critter (5 days). Budburst's
play shot is a powers shop. Create A Critter's "alive" shot is the "How it works" modal, twice
under two names. Neither row has a single image of the thing its VR build is about, and one
of them has its headless claim wrong (section 3 above). The repo's rule since Aug 02 is that
a visual call is not done until it has been looked at from where the player stands, and the
two rows most likely to be chosen are the two that were not. Two shots, one hour, before the
pick. Everything else in this review can be applied after.

A close second, if there is time for two: put the lane by effort table from section 4 at the
top of all three documents, above `TABLETOP 79`.

---

## 12. The corrections list for Opus, in the order to apply them

JSON first, then rerun all four gates, then the hand written documents.

1. **The Attic:** read `satellites/attic/index.html`'s round (the dig and the wipe), fill
   `camera` and `area`, and cite the line. If the sheet scrolls (`.sheetcard` at `:114` has
   `max-height:88vh; overflow-y:auto`), name the reframe or move it to WINDOW. Split: "DOM
   free generator, round behind a DOM stub (`check.js`)".
2. **Dragon Philosophy:** cite `UNREAD: Vite bundle (assets/index-*.js), no gameplay line
   attributable`, the same honesty Wild Wardens got. UNREAD count becomes 4.
3. **Budburst:** split reworded to Moon Claw's shape (compile plus helpers plus puppeteer,
   no DOM stub, no sim split); re-estimate the days with the determinism gate built from
   nothing; keep `M`.
4. **Super Slice:** `:2237` becomes `:2240` in the notes and in the shortlist's two mentions.
5. **Jumping Jimothy:** cite `:3053` (the follow) beside `:1895` (the init).
6. **Ripcord:** "fixed elevation" becomes "elevation that climbs slightly with zoom
   (`:376`)".
7. **Moon Claw, Skyshot, The Attic:** put `BUILD n days` in the JSON notes so the days gate
   covers every shortlist row.
8. **Shortlist numbers:** 35 images, 15 play shots, seven prose walls (add Conduit, drop
   Checkers as the counter example). Skyshot boot: the card does not cover Play and the chip
   does not clip the title on the boot shot; say "how to play screen". Chip list: drop The
   Attic, add Jimothy and Conduit.
9. **Delete `create-a-critter-5alive.png` or replace it with a shot of a living critter.**
   Never two names for one file.
10. **Section 4 tie break, one sentence, for the next auditor:** "a tile you set is an
    object, a digit you write is a mark; objects are TABLETOP, marks are WINDOW."
11. **Appendix "Judged, not carded"** for PadLab and Music Studio (section 9 above).
12. **`vr_audit_md.mjs:33`:** derive the title's count from `rows.length`.
13. **Lead with lane by effort** in all three documents.

---
---

# PART 2, SEPARATE TASK: THE FLEET MUSIC PLAYER, A SPEC FOR THE DIRECTOR TO APPROVE

Not part of the review. Nothing here is built. The Director approves before code.

## 2.0 The ask, in his words

"I want the whole studio's music player to function the way it does in Jumping Jimothy,
where one can just open and click the notes next to a song to put it on or remove it from
the current playlist."

## 2.1 What is true today, verified at the line

**Jimothy** (`satellites/stream-hop/index.html`): every owned track row gets a 34 px round
`.rot` button with the ♫ glyph (`:5379` to `:5380`), gold filled when in rotation (CSS
`:313`), outlined when not (`:310`). One tap toggles `PROG.playlist[t.id]` (`:5383`),
`ev.stopPropagation()` keeps it off the row (`:5381`), and `:5384` refuses an empty rotation.
New unlocks join it at `:5267`. The rotation is what plays: `:5293` builds the play order from
`PROG.playlist`, and `:1183` seeds it with one song on a fresh profile. Four lines of state.

**The fleet** is two files, and the premise in the prompt needs one correction:

- `music-unlocks.js` (429 lines, **213 includes**: the 105 satellites plus every native
  `play/*.html` through `play/shell.js`) is the ladder, the card and the chip. It **never
  draws a track list.** When the chip is tapped it loads `/music-player.js` on demand (`:129`)
  and calls `SWSPlayer.init({button: chip})` (`:128`).
- `music-player.js` (333 lines, 11 direct includes, but reached by all 213 through the line
  above) is the drawer, and it is where the playlist UI lives. Everything the prompt says
  about it is at the line it names: `window.prompt` at `:198`, `plEdit` at `:200`, Done at
  `:240`, the check or plus marker only while editing at `:265` to `:267`,
  `plToggleMember` at `:129`, and `st.edit` as a held mode at `:111`.

So **the one file is `music-player.js`**, exactly as the prompt says, and the reason it
reaches the whole fleet is that `music-unlocks.js:129` loads it by bare URL, which `sw.js:278`
serves stale while revalidate. Two things follow from that and both are constraints:

- **`HANDOFF-MUSIC.md` fenced `music-player.js` OFF for Opus** (section 0 rule 7 and section 9,
  "Edit ... `music-player.js` ..." under WHAT YOU MUST NOT DO). This spec lifts that fence for
  this one file and nothing else, and the kickoff prompt must say so or Opus will stop.
- **Stale while revalidate means the new drawer lands on the second load** of any page, not
  the first. That is the existing contract for this file (`sw.js:255` to `:258`) and it is
  acceptable; it is not a bug to chase on the device.

**On Jimothy being vendored:** `satellites/stream-hop/VENDORED.json` **does not exist**, and
`node scripts/vendor_satellites.mjs --list` does not list `stream-hop`; the twelve vendored
satellites are tomato-man, abduct-a-chameleon, glyph-forge, litter-bug, sweet-spot,
tarot-run, sixfold, letter-launch, skitterlings, wild-wardens, tally and hunch. The
instruction stands for a better reason: Jimothy is the Steam and Play title in flight and
its rotation already works. **The fleet moves to Jimothy; Jimothy is not touched.**

**`HANDOFF-MUSIC.md` section 13 already lists this**, as "Jimothy-style in-game rotation as
an opt-in". This spec is that follow up, fleet wide and not opt in.

## 2.2 The spec

**S1. One rotation, unnamed, always what plays.** New state `st.rot`, an object of track ids,
stored under a new key `sws_rotation` (read modify write, never replaced wholesale; two tabs
law). If `st.rot` is empty at boot it is seeded with every track currently in `LW_TRACKS`
after the fold, so a fresh player's rotation is the whole library and the drawer looks like
today. `next()`, `prev()`, the `ended` handler and `play()` with no index all walk the
rotation in `LW_TRACKS` order. The rotation is never named in the UI; the header says
"Soundtrack" as it does now.

**S2. The note, on every row, always.** Every `.swsp-trk` row gets a 40 px round button on
the right (48 px hit area, the touch rule), glyph ♫, class `.swsp-rot`, filled in `leaf`
green when the track is in the rotation and outlined in `line` grey when it is not. One tap
toggles membership and re-renders. `event.stopPropagation()` on the button so the row keeps
its own verb: **tap the row, it plays; tap the note, it joins or leaves the rotation.** No
mode. No Done.

**S3. Cannot be emptied.** Jimothy's `:5384` rule, verbatim in spirit: if a toggle would empty
the rotation, the tapped track stays in. A rotation of one is the floor.

**S4. New unlocks join automatically.** When `LW_FOLD_GAME_UNLOCKS` pushes a track the drawer
has not seen (compare against a stored `sws_rotation_seen` set of ids), it joins the rotation.
A song you just earned is in the mix before you open the drawer. A song you removed stays
removed: `seen` is what makes "new" mean new, not "absent".

**S5. Named playlists stay, and become "save as".** The Playlists section keeps its rows,
play button, delete button. Two changes: `+ New` becomes **"Save rotation as..."**, which
copies the current rotation into a new named playlist; and the edit pencil goes, because the
way you edit a mix is now to play it (which loads it into the rotation, S6) and tap notes.
`plEdit`, `st.edit`, the `.edit` and `.member` row classes and the `.mk` marker are deleted.

**S6. Playing a playlist loads it into the rotation.** `plPlay(id)` copies that playlist's
ids into `st.rot` (floor of one applies) and plays the first. The "Playing: name, Full
library" strip is replaced by "**Rotation loaded from <name>**" with a "Save changes" button
that writes `st.rot` back into that playlist, and a "×" that just dismisses the strip (the
rotation stays as it is; nothing is lost). So a playlist is a snapshot you can load and
overwrite, and the rotation is the only thing that ever plays.

**S7. ⛔ `window.prompt` and `window.confirm` go.** Naming, for "Save rotation as...", is an
inline row: a text input (48 px tall, `maxlength` 32, placeholder "My mix") with a Save
button, rendered in place of the button that was tapped, focus set on render, Enter saves,
blur with empty text cancels. Delete becomes a two tap: the trash button turns into a red
"Delete?" for four seconds, tap again to confirm. No modal, no system dialog, nothing a
headset has to summon a keyboard for except the one text field the player asked for.

**S8. A player who has never made a playlist never sees the word.** The Playlists section
renders only when `sws_playlists` has at least one entry. Below the rotation there is one
quiet line, "Save rotation as..." (S5), and that is the only door. The `.swsp-plempty`
explainer ("No playlists yet. Tap + New, name it...") is deleted.

**S9. What the footer says.** Today: "Build a playlist and hit Repeat to loop it." New:
"Tap ♫ on a song to add it to, or drop it from, what plays. Repeat loops it." No dash, no
"playlist".

**S10. Continuity keeps working.** `sws_music_state` keeps `idx`, `volume`, `playing`,
`repeat`, `time`. The `pl` field is dropped from what is written and ignored when read (S6
replaces it). A track handed off from another page resumes exactly as `tryResume()` does now.

## 2.3 What happens to a player who already has named playlists

- Their `sws_playlists` array is untouched, byte for byte. Every playlist they made is still
  in the Playlists section with its name and its songs.
- If `sws_music_state.pl` names a playlist at the moment of upgrade, that playlist's ids
  become the initial rotation (S6 applied once at boot), so the mix that was playing keeps
  playing. If it names nothing, the rotation seeds to the whole library (S1), which is what
  "full library" meant before.
- The pencil is gone. To change a saved playlist they play it (which loads it), tap notes,
  and tap Save changes. That is one fewer step than before and there is no mode to leave.
- Nothing they had is lost, and the first time they open the drawer nothing looks alarming:
  the same header, the same shelves, their playlists still listed, plus a note on every row.

## 2.4 The one file, and the gates

**File:** `music-player.js`, one edit, and its `?v=` is not stamped anywhere (bare URL, s-w-r),
so no include line in any of the 213 pages changes, no vendored file changes, and
`test/music/vendored_baseline.txt` stays byte identical. `music-unlocks.js` is not touched:
its call at `:128` is `SWSPlayer.init({button})` and that signature is unchanged.

**Which of the 10 music gates would have to change: none of the ten, and that is the
problem.** I read `test/music/run.mjs` and the gates it runs. `unlocks.mjs:36` **stubs**
`SWSPlayer` with a fake `init`, `play` and `open` whenever the module tries to load
`music-player.js`, so the real drawer is never exercised by any of the ten. `inject.mjs:91`
asserts the body gains only ids beginning `sws`, which the new note button satisfies as long
as its id or class starts with `sws` (it does, `.swsp-rot`). `sw.mjs` mentions
`music-player.js` only as the model for the s-w-r rule. `ui.mjs` measures the toast, the card
and the chip, never the drawer's rows. So a rewrite of the drawer's playlist UI would leave
all ten green, which means the ten do not describe the behaviour being proposed and cannot
protect it.

**Therefore one gate is added, `test/music/player.mjs`, and `run.mjs` gains an eleventh
step.** Puppeteer at 375x667 against one satellite and one native page with a seeded
`sws_playlists` and a seeded `sws_game_unlocks`, asserting, each watched red first against
the current file before the edit:

1. every track row carries a `.swsp-rot` whose rendered hit area is at least 48 px, measured
   by `elementFromPoint` at its centre (never `el.click()`);
2. tapping the note toggles `sws_rotation` and does not change `sws_music_state.idx` (the
   row did not play);
3. tapping the row plays it and does not change `sws_rotation`;
4. toggling off the last member leaves one member;
5. with an empty `sws_playlists` the drawer's text does not contain the word "playlist"
   (case insensitive);
6. with two seeded playlists both names render, and the seeded array is byte identical after
   open, toggle, close;
7. `window.prompt` and `window.confirm` are never called (stubbed to throw);
8. the source contains no `prompt(` and no `confirm(`;
9. a fresh profile's rotation after boot equals every id in `LW_TRACKS`;
10. no dash of any kind in any text the drawer renders (LAW 13).

`mutants.mjs` gains three mutants against `music-player.js`: delete the floor of one (4 goes
red), delete `stopPropagation` (2 goes red), restore `window.prompt` (7 goes red).

## 2.5 Things the Director decides before code

1. **Seed the rotation with the whole library, or with the last thing that was playing?**
   The spec says whole library (a fresh player hears everything). Jimothy seeds with one song
   (`:1183`, `moonwalk`) because Jimothy has a small owned set. Either is one line.
2. **Does a new unlock join the rotation even if the player has trimmed it to a few
   favourites?** The spec says yes (S4), as Jimothy does. If he wants "only when the rotation
   is still the full library", that is one condition.
3. **Keep the Playlists section at all**, or ship rotation only and add "save as" later? The
   spec keeps it because five hundred bytes of someone's `sws_playlists` may exist in the
   wild and deleting a feature people used is a scar this repo already has.
