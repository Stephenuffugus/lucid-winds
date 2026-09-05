# HANDOFF, the games pass, second seat (Sep 05 2026)

**You are the second terminal.** Another Claude (Fable) is in this same tree on the same branch,
working on Flock the World and its Google Play listing. Stephen is at the bank and the Play
Console. Nobody is watching you in real time. Finish work, do not ask permission, report faithfully.

Paste for Stephen: `Read HANDOFF-GAMES-SEP05.md and do what it says, top to bottom.`

## 0. Read first, in this order
1. `CLAUDE.md` (root). The rules there override this file.
2. `HANDOFF-ART-FLEET.md`, the SESSION STATE block at the top and section 3 (what shipped, each
   row measured). That is where the overhaul stopped last night: long tail 1 to 12 done, rows 1 to
   140 of the ranked table. **Next is long tail 13 from row 141.**
3. `scripts/fleet/README.md`, the probes. `shot.mjs` is the camera, `overflow.mjs` the width probe,
   `bump.sh` the pin bumper, `satshoot.mjs` for satellites.
4. For each game you touch: its row in `FLEET-ART-DETAIL-SATELLITES.md` or
   `FLEET-ART-DETAIL-NATIVES.md`, and the game folder's `AUDIT-NOTES.md` if it has one.

## 1. Tandem rules (two builders, one tree)
- `git pull --rebase --autostash origin add-sproing-jumper` before EVERY commit.
- `git add <fenced paths>` only. Never `git add -A`, never `git add .`.
- Your fence: `satellites/litter-bug/**`, `satellites/attic/**`, `games/**`, `play/**`,
  `shared.css`, the long tail games' own folders, `HANDOFF-ART-FLEET.md`, `docs/GAMES-PASS-SEP05.md`,
  `assets/games/**`.
- NOT yours: `satellites/flock-the-world/**`, `store/**`, `portal/index.html`, `music-unlocks.js`,
  `.claude/**`, anything under the memory directory. If a fix needs one of those, write it in your
  report and move on.
- One commit per batch, pushed at once: `git push origin add-sproing-jumper`.
- Deploy is `git push origin add-sproing-jumper:main` AFTER `git log HEAD..origin/main` prints
  nothing. Then prove it: curl the live page with `?probe=RANDOM` and grep for a marker only the
  new build has (a new `?v=` pin, a new string). A 200 is not evidence. Hostinger deploys main.
- Commit message ends with the two attribution lines your system reminder gives you.

## 2. The standard every change is held to
- **Look at it.** A visual change is not done until you have opened the screenshot and named three
  things wrong in it before Stephen does. Shoot from where the player stands. Shoot the worst angle
  on purpose. Then report what you SAW, not what you wired.
- Shoot at **412x915** (his phone), 375x667 and 320x568. Any game with a fleet skin (dice style,
  card deck, wardrobe) is shot in EVERY skin, seeded into localStorage before the load. A fresh
  profile is one player, the one who never changed a setting.
- `node scripts/fleet/overflow.mjs <path> 412 915` on every touched page. A pan's ceiling is its
  PARENT, never 100vw; `innerWidth` follows the layout viewport and lies.
- A file behind a `?v=` pin (shared.css, play/shell.css, play/shell.js, a satellite sw.js) changes in
  the SAME commit as its pin. `scripts/fleet/bump.sh [letter] [shell]` does the natives.
- Prove a control with real pointer events (`page.touchscreen.tap` at the element's centre after
  `elementFromPoint` says it is on top), never `el.click()`. Gates that feed the engine directly skip
  the thumb's path.
- No dashes in player copy (commas, semicolons, "34 to 30", a middle dot). No exclamation marks
  unless a genuine celebration. Text 0.7rem or larger. 48px touch targets measured as RENDERED px.
- A gate you have not watched fail is decoration. Break it once on purpose.
- The brand is SKY WOLF STUDIO, singular. No "Petal Walk", no "Focus Grove", no mascot.
- Emoji as art is still a Director call (JOB 8). Do not swap emoji for art fleet wide on your own.

## 3. JOB A, Litter Bug: "needs built a lot more, not playable" (Stephen, Sep 05)
Folder: `satellites/litter-bug/` (index, `world.html`, `bugdex.html`, `mint-lab.html`,
`battle-lab.html`, `labs.html`, `bug-engine.js`, `battle-engine.js`, `world-engine.js`).
⛔ `satellites/litter-bug/VENDORED.json` says this folder is a vendored copy of the repo
`Stephenuffugus/Litter_Bug` at commit 3c949a5, checked out at `/workspaces/Litter_Bug` (same commit).
Read `VENDORED.json` and `scripts/vendor_satellites.mjs` before the first edit and decide where the
edit lives: the upstream repo then re-vendor (the documented path), or the satellite copy if the
vendor script has been abandoned (check `git log -- satellites/litter-bug` for hand edits after the
vendor commit). Write the decision in `docs/GAMES-PASS-SEP05.md`. Do not edit both.

What is on disk: `check.js` passes 83/83. `NEXT_SESSION.md` (Jul 18) says the single player game is
"built, polished and verified end to end". The audit (row 39, impact 4/5, `FLEET-ART-DETAIL-SATELLITES.md`
line 961) found the dumpster screen a void, the alley backdrop scrimmed into nothing, and none of the
24 painted part PNGs ever on screen. Shot this morning at 412x915: a how-to wall, a title of flat
rectangles, SCAVENGE opens "Which block?" with four sixty second trials (Sort the Recycling, Grub Hunt,
Wire Untangle, Pry the Lids), Grub Hunt is grey placeholder glyphs on tiles in a bare dark box, Bugdex is
"Nothing pinned yet", The Dumpster is locked until you own a bug. **His verdict beats the gate.**

Method:
1. Play the whole loop yourself with real pointer events at 412x915: each of the four trials to the
   end, the mint, the Bugdex, the Dumpster battle, a second day. Screenshot every screen. Keep a
   list of every WALL: a place a player stops, does not know what to do, taps and nothing answers,
   a screen that is a void, a trial that cannot be won or cannot be lost.
2. Fix the walls first. A trial that reads as a placeholder gets its real board: the game owns
   painted parts in `assets/heads`, `assets/bodies`, `assets/patterns`, use them. The four trials
   should each look like a place (an alley, a bin, a wire nest, a row of lids), not a grid of
   system glyphs.
3. Then the audit rows: the alley backdrop seen instead of erased (`#bg-scrim` .86/.94/.985 to
   about .55/.68/.80, `#bg-far` blur 34px to 14px), the dumpster screen's copy on screen, `.champstrip`
   ghost cards, `#k-note` promoted. Art the code cannot make goes in `docs/GAMES-PASS-SEP05.md` as a
   named file with a size and what it replaces, in the DETAIL file's table format.
4. Then depth: what makes a second session worth it. Write what you built and what you did not.

## 4. JOB B, The Attic: "needs built a lot more, not playable" (Stephen, Sep 05)
Folder: `satellites/attic/` (`index.html`, `attic-engine.js`, `attic-econ.js`, `object-render.js`,
`sleeve-render.js`, `check.js`, `shots.mjs`, `AUDIT-NOTES.md`). Brief: `design-briefs/flagship-attic.md`
(ERA, CONDITION, the text engine; Stephen still owes the name and the launch classes, do not pick them).
`AUDIT-NOTES.md` (Aug 16, updated Aug 24) called it "a demo wearing a flagship badge" and then built
it into "a real game now": ten object families, seven condition pictures, a ticket economy that is
lossy. Audit row 144 (`FLEET-ART-DETAIL-SATELLITES.md` line 3405): the pre-wipe dust reads as a
failed image load, the object's printed title is illegible grey on grey, the attic scene is three
brown smudges, the hash line is 2.2:1, the WIPE button wraps, the dust motes read as confetti.

Shot this morning at 412x915: a how-to wall with START DIGGING, then the hub (tickets, THE SHELF,
WANT LIST, TODAY'S FIND, RUMMAGE, DUST OFF), RUMMAGE turned up a 1970s record under dust with
"WIPE OFF THE DUST · CHECK CONDITION" and SCRAP THIS. It runs. **His verdict beats the gate.**

Method: the same four steps. Play it through (rummage, wipe, condition reveal, shelf, want list,
dust off with a real drag, tickets to zero, next day), list the walls, fix them, then the audit rows
(dust at ~0.72 over a fully drawn object, `inkOn(bg)` for the title, hash line to #9a8a6e, letterspacing
on the WIPE button, motes 4 to 5px at 0.45), then depth: measure title uniqueness over 1000 pulls per
class and write the number down (the Aug audit found 19% exact duplicates over 40,000 pulls).

## 5. JOB C, the long tail, from row 141
Exactly the method in `HANDOFF-ART-FLEET.md` "Still open" item 0: long tail 13 is Master Pollinator,
15 Puzzle, Root Rush, Pyramid, Farkle, Flood, Five in a Row, Garden Spades (rows 141 to 160), then the
natives past row 160. Per game: read its CSS to do list in the DETAIL file, shoot before, patch,
shoot after, look, `overflow.mjs` at 412/375/320, one commit per batch, a section 3 row in
`HANDOFF-ART-FLEET.md` with the measurements. Do JOB A and JOB B before JOB C.

## 6. The ledger Stephen will read on his phone
Keep `docs/GAMES-PASS-SEP05.md` current as you go, one row per game:
`| game | what changed | what is still wrong | shot | live url |`. He said he will "go one by one
and fix a lot and search for my own improvements", so this is his checklist. Live URLs are
`https://lucidwinds.com/satellites/<slug>/` and `https://lucidwinds.com/play/<file>.html`.

## 7. Traps that cost real time this week
- `?dev=1` does NOT open the 27 workbench gated games. `localStorage.sws_dev_ok='1'` does.
- `innerText` reads the game UNDER an overlay. The screenshot decides.
- `pkill -f <pattern>` kills your own shell when the pattern matches your command line.
- The host serves `.mjs` as text/plain: runtime modules are `.js`, always.
- A `&&` chain that dies mid way leaves the later commands unrun. Check each step.
- A `str.replace` patch must assert the match count before writing.
- The music chip and the folded "New song" pill are the shared player's. Do not edit
  `music-unlocks.js`; if a game's own control is under one of them, move the game's control or
  ask the chip to reseat (`window.SWSMusic.reseat()` after a screen change).
- Heredocs with `'\\n'` corrupted a JSON file once. Write JSON with a script, not a heredoc.

## 8. Report at the end (and every two hours in `docs/GAMES-PASS-SEP05.md`)
What was played, what was seen (the three things wrong per frame), what was fixed with the commit
hash, what is not done and why, what needs Stephen (art to paint, a design call, a name).
Never "verified" without the shot you looked at. Never "done" for a thing that is on the branch
and not on main.
