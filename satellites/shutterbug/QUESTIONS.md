# SHUTTERBUG QUESTIONS.md

For Stephen. Written 2026-10-29 by the lead (Fable) with BUILD-PLAN.md; merged from the three draft plans' candidate files. One entry per contradiction, impossibility, underspecification or lead decision HANDOFF left to Stephen. Each: the question, the options, the lead's recommendation, and the line the plan assumes. The plan is built on the recommendation; a ruling changes the named task, never DESIGN by the lead's hand. The builder appends new entries below Q57 as the night finds them (an xfail always gets one). Q48 to Q57 were added 2026-10-30 after four reviews of the plan.

Ranked loosely: the lead's decisions first, then the readings that change what the builder makes tonight, then the smaller readings.

---

## Q1. Where the game lives, which branch, what ships

HANDOFF section 6 says create a `shutterbug` repo and deploy to GitHub Pages; HANDOFF section 1 says the deliverables are `index.html`, `manifest.json`, `sw.js`, `harness.js`, `fixtures/`, `music/` and the docs, "nothing else ships".
Options: (a) a separate repo on Pages as HANDOFF says; (b) `satellites/shutterbug/` inside `lucid-winds`, served from `main` by the host at `https://lucidwinds.com/satellites/shutterbug/`, the builder working on the repo's branch `add-sproing-jumper` (where DESIGN.md, HANDOFF.md and `tools/shutterbug-tests/` already live and which `deploy.sh` names), deploys as files only commits of the served set (`index.html`, `manifest.json`, `sw.js`, `icons/`) through the committed `tools/shutterbug-tests/deploy.sh`, with `harness.js`, `fixtures/`, `tools/`, `test/`, `docs/` and the markdown staying on the branch and never served; (c) the whole folder on `main` as gerplunk does (the harness and fixtures fetchable by URL, harmless).
Recommendation: (b), decided by the lead on 2026-10-29 because the fleet's deploy, CI, embed protocol, music include and exit audit already live here. (c) is a one line change to the deploy script's served list.
Plan assumes: (b). T0.0 proves a non interactive push to `add-sproing-jumper` before any code.
Also: `icons/` is in the served set and in the worker's precache, beyond DESIGN 1's "plus manifest.json, sw.js and a /music/ folder, nothing else" and HANDOFF rule 6, because an installable manifest needs PNG icons; the alternative is data URI icons inside `manifest.json`, which Chrome accepts for install on Android and Safari ignores.

## Q2. The share URL host and length

DESIGN 10 writes `https://<host>/shutterbug/#v1.<base64url>` at about 800 characters. The game lives at `/satellites/shutterbug/`; the packed record (6 byte header, two indices per byte) is 776 base64url characters, so the URL is 825 characters; Double Exposure is 1593.
Options: (a) accept 825 and 1593; (b) a host side redirect at `/shutterbug/` to save 11 characters; (c) compress the grid (run length over nibbles: 30 to 60% shorter on typical rooms, but variable, which moves the QR version).
Recommendation: (a) now; (c) as a v2 record if length ever matters (the codec is versioned for it).
Plan assumes: (a); `H-rec-2` asserts 825 and 1593 in Node against the production prefix typed into the test. The page itself never holds a host: the link is `location.origin + location.pathname + '#' + code` (the game runs from any origin, NEW_SATELLITE_BRIEF rule 2), so on the test server the browser gate asserts the 779 character code and the expression, not 825.

## Q3. Starting M1 work before Stephen plays M0

HANDOFF: Stephen approves BUILD-PLAN.md before M0 and plays M0 before M1. Tonight he has ruled that the lead designs everything and Opus codes overnight.
Options: (a) wait at the end of M0; (b) after M0 is harness green the builder continues with the M1 tasks marked SAFE (biome detection, features, the route score with enemies, enemy behaviours, loot, SFX, sharing, the QR, the save, the PWA, the loop, the Wallet moments: pipeline, data and shell work the harness proves) and stops before the first WAITS task (the Frost slide and Deep gravity in the sim, the onboarding pacing, the strip geometry, the gamepad, any movement constant; the mirror layout is a CSS flip the layout gate measures and is SAFE), writing the WAITS list at the top of the morning report as his calls.
Recommendation: (b). His redlines on this plan land here and change the task list, not DESIGN.
Plan assumes: (b); section 4 marks every M1 task SAFE or WAITS.

## Q4. Frost can never be detected as written

DESIGN 6.10 picks the biome by the dominant hue band among cells with saturation over 0.35 and sends anything with under 10% such cells to Attic. DESIGN 7 defines Frost as white and light grey, which have saturation near zero, so a white room (the most common room there is) is always Attic and Frost is unreachable by any photo.
Options: (a) leave Frost reachable only by the harness override; (b) under 10% saturated cells: Frost when the mean palette luminance of all cells exceeds 170, else Attic; (c) Frost when the Paper, Glare and Ash share exceeds 50% regardless of saturation.
Recommendation: (b), with 170 in `TUNING.FROST_MEAN_L`. It keeps "brightness is openness" and makes a bright room the room with the ice.
Plan assumes: (b); T1.1; `all-light` is Frost and `all-dark` is Attic.

## Q5. Phones narrower than 384 CSS px break "never fractional scale"

DESIGN 3: 1 game px = 1 CSS px, 2x at 768 or wider, otherwise centre with gutters, never fractional. The most common Android viewport is 360 CSS px wide and the world is 384.
Options: (a) below 384 CSS px shrink the canvas by CSS to the viewport width (0.9375 at 360; at DPR 3 that is 2.8125 device px per game px, every sixteenth device column dropped, invisible at arm's length); the one documented exception, integer everywhere else; (b) a 24 px horizontal camera window: the world cropped to the screen and the camera following the hero sideways by up to 24 px, which breaks "camera scrolls vertically only" by a cell and a half but keeps every pixel whole; (c) 2 device px per game px (a 256 CSS px world, a third of the screen in gutters); (d) a 22 wide grid on narrow phones (changes every record).
Recommendation: (a) as the default, (b) built behind `?fit=crop` so the first morning report shows the same sample room frame both ways at 360x800 side by side and he rules on pixels.
Plan assumes: (a) default; T0.8b builds both; the 360 shots are judged by eye every task.

## Q6. Phones shorter than 844 CSS px

36 + 640 + 168 = 844 fits an iPhone 14 class phone exactly. A 360x780 Android has 576 px for the play area; a 320x568 SE has 364.
Options: (a) shrink the control strip (rejected: the frame yields to the controls, never the reverse); (b) fewer rows: `VIEW_ROWS = clamp(floor((h - 36 - 168) / 16), 20, 40)`, the camera keeping the hero at 60% of what is visible, spare height on tall phones going to the strip (the floor is 20, not 28: a 320x568 SE has 364 px of play area, 22 rows; a floor of 28 would need 652 px on a 568 px screen and the layout gate could never go green there); (c) scale everything fractionally.
Recommendation: (b).
Plan assumes: (b); the layout gate at five sizes; the camera is render state, so the row count never enters the sim hash.

## Q7. The jump cone is a bounding box, not a reachable corner; the clearance check

At any physics with a 4 cell apex and a 34 frame hang, a target 4 up is reachable at most 4 across and a target 5 across at most 3 up. DESIGN 6.8's "1 cell per column clearance check" is underspecified for a 16 px hero whose feet sit at fractional heights.
Options: (a) treat "4 up, 5 across" as the box and use per height landing tables derived from `TUNING` by stepping the same equations the sim runs, clipped to the box, with a per column row span (the corridor) plus the head row as the clearance check; (b) raise the jump so the corner is reachable (apex 5 cells, hang 40 frames: floatier than 4.4's feel); (c) lower the box to 3 up 4 across; (d) a bounding box clearance check (simpler, much stricter, more tabs).
Recommendation: (a). The tables are hard coded in the harness as a known answer and recomputed from `TUNING`, so the code is checked against the plan, not itself, and LAB-CLEAR tests the corridor cell by cell against the sim.
Plan assumes: (a); section 3.2.

## Q8. "No jump at maximum range (at least 1 cell slack on height or distance)" has two readings

Literal: a main ascent jump is fine with slack on height OR distance (only the table's corner cells are banned). Strict: slack on both (main ascent jumps at most 3 up and 4 across; wall jumps 2 up and 3 across), which matches the repair stair (3 across, 3 up) and 5.3's "forgiving jump" but tightens which rooms pass 13.1.
Recommendation: the literal reading as the default (`ROUTE_SLACK_BOTH_AXES: false`), with the harness printing how many corpus rooms change under the strict reading so the ruling is made on numbers.
Plan assumes: the letter; `H-route-5` prints the count.

## Q9. "40% of open cells reachable" counts cells the hero can never occupy

DESIGN 6.7 repairs when under 40% of open cells are reachable. Open cells include all the air; a tall room with one floor is nearly all open and almost none of it is standable, so the threshold is either trivially failed or needs an air cell notion.
Options: (a) 40% of standable cells; (b) count every open cell any arc passes through; (c) lower the fraction.
Recommendation: (a). It measures what the player feels (how much of the room can I stand on) and it is the scale repair works in.
Plan assumes: (a); `H-rep-4`.

## Q10. "Row 46, two above the floor" is one row off

With rows 0..47 and row 47 the floor, row 46 is the standing row directly above the floor; row 45 is two above and in the air.
Recommendation: the standing row, written as `h - 2` (`SPAWN_ROW_FROM_BOTTOM: 2`). No build effect beyond the comment.
Plan assumes: `h - 2`.

## Q11. The exit tie break and the ceiling light

DESIGN 6.6: the exit is the farthest cell by reach distance; a ceiling light wins ties. Distances rarely tie, so the light almost never wins and the exit is usually a far corner, against "climbs back up to the light".
Options: (a) the light wins when its distance is within 2 edges of the maximum (`EXIT_LIGHT_SLACK: 2`); (b) the light always wins when reachable; (c) the letter, exact ties only (`EXIT_LIGHT_SLACK: 0`).
Recommendation: (a). The exit stays far by construction and is the light in most real rooms; the sample room's exit is asserted to be its lamp.
Plan assumes: (a); one `TUNING` number to rule otherwise.

## Q12. Luminance, saturation and hue must come from the palette entry, not the photo

DESIGN 6.1 keeps per cell L, S, H from the photo and 6.3, 6.4, 6.10, 6.11 use them; 6.13 says everything is recomputed from the grid and 10 says a shared grid rebuilds the identical level. Both cannot hold unless L, S, H are properties of the 16 palette entries.
Options: (a) palette derived L, S, H everywhere after quantization, including the live crop overlay, so the player shares exactly what they saw; (b) store per cell L in the record (doubles the link); (c) accept a different level from a link (breaks 10 and 13.6).
Recommendation: (a). The palette's luminance ladder is designed with six steps inside the Otsu clamp.
Plan assumes: (a).

## Q13. Reserve the film tab colour from the quantizer

DESIGN 6.2 quantizes to all 16 colours; 6.7 renders tabs in the tab colour, so a cream wall wears the colour of help and only the perforation differs.
Options: (a) reserve index 15; the quantizer maps to 0..14; a record holding a 15 is refused; (b) keep 16 and rely on the perforation.
Recommendation: (a). The grid is still 4 bits per cell and nothing else changes; "the player can always tell furniture from help" becomes true by construction. This is also why the palette needs his approval with a swatch sheet in hand (section 7.4).
Plan assumes: (a); `H-pal-5`, `H-rec-3`.

## Q14. The fleet music include versus "no network request after install"

NEW_SATELLITE_BRIEF (2026-09-02) makes `<script src="/music-unlocks.js" defer></script>` mandatory and `scripts/music_include.mjs --check` matches that exact literal (no `?v=`). DESIGN 13.7 allows no request after install except `/music/`.
Options: (a) include it, bare, `defer`, never intercepted or cached by the game's worker (its fetch handler returns early for anything outside its scope), whitelisted in the `pwa` gate together with the three files the include itself loads (`/music-catalog.js` at boot, `/music-tracks.js` and `/music-player.js?v=<stamp>` on a chip tap; read in `music-unlocks.js` 2026-10-30), named in the handoff as the four off scope root requests (offline they fail silently, the include being `defer` and non essential); (b) omit it and carry a permanent fleet check failure; (c) vendor it (forbidden: the fleet owns and updates that file).
Recommendation: (a).
Plan assumes: (a).

## Q15. DESIGN's ruled share sentence contains a dash

DESIGN 10 rules the sentence "This shares an abstracted 16-color version of your photo, not the photo." The fleet copy law forbids dashes in player copy and the lint enforces it over every player string.
Options: (a) `16 color`; (b) `sixteen color`; (c) keep the dash and exempt that one string from the lint.
Recommendation: (a): the ruled meaning, the fleet's law.
Plan assumes: (a), DESIGN's American spelling kept in player copy.

## Q16. A QR code without a dependency

DESIGN 10 offers a QR; DESIGN 1 allows no runtime dependency. An 825 character URL is a version 20 symbol at level L (858 byte capacity, 97 modules, 3 CSS px per module on a 384 wide screen); Double Exposure's 1593 characters need version 29 (133 modules), which phone cameras read unreliably from another phone's screen. A hand written encoder (byte mode, Reed Solomon, masking) is about 300 lines that only a phone scan fully proves.
Options: (a) build it in M1 as the last two SAFE tasks (T1.9a the encoder, T1.9b the drawer) with external known answers typed into the test (the published 1-M "HELLO WORLD" data and error correction codewords and the level L mask 0 format string; GF tables regenerated from the encoder's own polynomial would prove nothing and the ISO 18004 annex is not on the box), `Copy link` the primary control, QR for modes 0 and 1 and the sentence `Long code, the link is easier.` for mode 2; if it slips, ship M1 without it and say so; (b) M3; (c) drop it.
Recommendation: (a).
Plan assumes: (a); T1.9a, T1.9b.

## Q17. The Daily Room seed contradicts "the seed is derived, never stored"

DESIGN 8: Daily Room's "seed = FNV(date string) over a built in sample grid set". DESIGN 6.12: the placement seed is FNV of the grid and nothing else.
Options: (a) the date picks WHICH built in grid and the placement seed stays the grid's own (a day's room is one of n fixed rooms); (b) the date picks today's grid from the built in set (`grid = SB.DAILY_SET[fnv1a32Str(date) % SB.DAILY_SET.length]`) and the placement seed for the daily mode is FNV over that grid's bytes continued over the UTC `YYYY-MM-DD` string the shell passes in, and sharing a daily room shares the plain grid (which builds the non daily version); (c) a new mode with a stored seed.
Recommendation: (b). Everyone gets the same room on the same date with no server, the set can be small, and the share rule is unchanged. The core never touches `Date`; the shell passes the string.
Plan assumes: (b); T3.1b.

## Q18. The Daily Room's built in grid set does not exist

Options: (a) `SB.DAILY_SET` = the sample room plus six synthetic or hand drawn rooms embedded as rows in `core-ns` (about 8 KB), replaced by six of Stephen's rooms from `make.html` before M3 ships; (b) wait for his rooms (blocks T3.1b).
Recommendation: (a).
Plan assumes: (a); Q17 says which of the seven a date picks.

## Q19. Double Exposure (24 x 96) versus "grid size is a single constant"

Options: (a) `GRID.H` is the capture height; a level carries its own `h` (48 or 96) and the sim, reach and camera read `level.h`; (b) a second constant set for mode 2.
Recommendation: (a); every core function takes `w, h` from the level except capture and the record validator.
Plan assumes: (a) from T0.6 on.

## Q20. Negative: do the floor and ceiling rules apply after the inversion?

DESIGN 8 says solid and open are inverted before 6.4 and does not say whether 6.3's floor and ceiling rules come after.
Options: (a) invert after the smoothing passes and before the floor and ceiling rules, so the floor is always solid and the top always open in Negative too; (b) invert everything (the hero spawns inside a solid floor).
Recommendation: (a).
Plan assumes: (a); `H-pipe-7`.

## Q21. Sticky wall jump semantics

DESIGN 4.2: "A from a sticky wall: straight up 4 cells, no push off." Does the player have air control after the takeoff?
Options: (a) the model counts only the straight up edges (the letter) and the sim allows normal air control from the second frame (more generous, the allowed direction); (b) the model counts a sideways jump off a vine with the FULL table (more rooms pass without tabs, a reading beyond the letter).
Recommendation: (a) tonight; (b) is one edge rule if his play wants vines to be real launch points.
Plan assumes: (a).

## Q22. Deep: how much farther across?

DESIGN 7: "jumps +1 cell, falls 20% slower." The slower fall lengthens the hang, so the across reach grows (the stepped sim gives 6 to 7 cells at ground level); DESIGN gives no across number for Deep.
Recommendation: the Deep cone cap stays 5 across (DESIGN's number) and 5 up; the sim is more generous than that, which is allowed, and Deep rooms are no harder to repair.
Plan assumes: the across cap unchanged; `DEEP_EXTRA_UP: 1` only.

## Q23. Air control is an unstated feel decision

Every reach table assumes instant full run speed steering in the air (a digital rocker in flight). It is the single largest determinant of the jump tables and a feel decision.
Recommendation: `TUNING.AIR_CONTROL: 1` (full, instant) as DESIGN 4.1's "full run speed immediately" implies, marked FEEL, `H-sim-18` asserting it; a ruling of partial air control retunes the tables by the same stepping and reruns the labs.
Plan assumes: full instant air control outside the wall jump lock.

## Q24. The variable jump mechanism is unspecified

DESIGN 4.2: "hold for height (variable, 3 to 4 cells)", "short hop: release early, 2 cells."
Options: (a) a release cap: on release while rising, `vy` is capped to `JUMP_CUT_V` (5.08 px per frame), so the apex ranges from 2 cells (a one frame tap gives 31.4 px) to 4.35 cells by release time; (b) reduced gravity while held.
Recommendation: (a): one constant, one branch, measured by `H-sim-1`. FEEL.
Plan assumes: (a).

## Q25. The wall jump's horizontal lock

DESIGN 4.2 gives "4 across away from the wall" but not how long the rocker is ignored (a player holding toward the wall at the jump would re stick at once).
Recommendation: `WALL_JUMP_LOCK: 10` frames of locked push away, then normal air control; proven by the WALL labs. FEEL.
Plan assumes: 10 frames.

## Q26. Corner forgiveness (the ledge nudge)

DESIGN 4.2's corner rule says a 2 px overlap never arms a wall slide; it does not say what a head corner does.
Recommendation: rising into a solid corner by at most 2 px shifts the hero sideways and continues the rise (`LEDGE_NUDGE_PX: 2`); more bonks. Only makes the sim more generous than the model. FEEL.
Plan assumes: 2 px.

## Q27. Nothing can hurt an enemy before the first pickup

DESIGN 9.1: no attack button, nothing equipped until the first pickup. In M0 and M1 every enemy is a hazard the player can only avoid, and the first death (5.3) must teach a readable mistake.
Options: (a) keep the letter: avoidance until the first chest; (b) an unarmed dive stomp (a dive landing on an enemy's cell deals 1 damage; Pogo Spear and Pile Driver scale from it), a one line `TUNING` knob; (c) start with J1 Boomerang (contradicts 9.1).
Recommendation: (a) tonight; rule after playing M0 with moths. (b) is cheap if the avoidance game feels toothless.
Plan assumes: (a); no stomp in the sim.

## Q28. Boss HP equals cell count, unbounded

A saturated sofa is a hundred cells and a hundred hits.
Options: (a) the letter, with the cluster size distribution over the corpus printed in the M2 economy log so a cap is ruled on numbers; (b) clamp HP to [12, 40] and erode proportionally; (c) HP = cells / 2 with a floor of 12.
Recommendation: (a) until the numbers exist.
Plan assumes: (a); T2.10a and T2.12.

## Q29. Moths: through furniture or around it?

Recommendation: moths ignore solids (they live inside the photograph; a moth behind a wall is a moth coming through it); crawlers, icicles, jellies and sparks respect geometry.
Plan assumes: through.

## Q30. The bot's survival versus geometry

The route score forbids enemy spawns on safe cells, but a moth drifts; nothing says the bot must survive.
Recommendation: the bot is immortal for route walks and the score is about geometry; one mortal walk on the sample room with the first room cap asserts hearts at least 1 at the exit (`H-en-3`); a survival rate per fixture is a report line.
Plan assumes: that.

## Q31. The onboarding beats on an arbitrary first photo

DESIGN 5.3 promises a forgiving jump onto a landmark, a clear wall jump and a dive target in the first room, which an arbitrary photo cannot guarantee.
Options: (a) the sample room is proven to teach the beats (`H-onb-1`, T0.11b), and for the player's own first photo a first room pass adds up to three film tabs so the ascent carries a jump with `dy <= 2, dx <= 3` onto a landmark, one wall contact and one dive target, deterministic and asserted; (b) the first room of all time is the sample room and the player's own photo comes second; (c) the letter, and some first rooms teach nothing.
Recommendation: (a), because "your room is the level" is the first pillar; (b) is the fallback if his play finds the added tabs ugly. One consequence to see plainly: the onboarding tabs are a one time overlay on `opts.firstRoom` and the record cannot carry them (Q13 refuses index 15 in a record), so the share link and the recent rooms replay of a player's first room rebuild the plain level, not the one they climbed, and the share sheet says nothing about it; the alternative is one byte of the packed header (`mode` has 253 spare values) carrying `firstRoomPass: 1` so a link rebuilds with the pass, which is a v2 record question.
Plan assumes: (a), the overlay reading; T1.12 (WAITS).

## Q32. A shared link as a player's first ever room

DESIGN 5.3: the first free play room always runs plain Attic rules. DESIGN 10: a link rebuilds the identical level. A new player opening a friend's Ember room would get an Attic version with no twist.
Recommendation: the link wins; a level opened from a link or a code is never treated as the first room; the first room rules apply only to the player's own first photo.
Plan assumes: that; T1.8.

## Q33. The Darkroom door's cell

DESIGN 6.11: the largest bright rectangle of at least 3x3 becomes a door sprite. A bright rectangle is open cells; which cell is the door and how is it entered?
Recommendation: the rectangle's bottom row centre cell, requiring a standable cell directly in front (the hero walks into it); skipped for that level if no bottom row cell qualifies (the cap is "at most 1"); never on a main ascent safe cell, as ruled.
Plan assumes: that; T1.2a.

## Q34. Two chests: the focal tap and the ladder top

5.1 step 3 gives the focal shape the level's chest; 6.11 gives a ladder zone a chest at the top; 6.11 guarantees at least 1 chest.
Recommendation: one chest per level: the focal cell if set, else the ladder top, else the farthest standable cell off the main ascent. The pocket's loot is specks, not a chest.
Plan assumes: that.

## Q35. Squash and stretch and the hitbox

If the hitbox changed with the pose, the reach model's 12x16 would be wrong at landings.
Recommendation: the hitbox is always 12x16; squash and stretch are sprite offsets only.
Plan assumes: that; `H-sim-18` family.

## Q36. What the pipeline does when the route score fails at runtime

DESIGN 6.9 defines the score for the harness and 6.7 defines `needsCrop` for reach failures, but a phone photo can produce a reachable room whose placed enemies or trap break the cadence.
Options: (a) a deterministic degrade ladder: remove the enemy nearest the ascent, then the trap field, then one more repair pass, then `needsCrop`, each rung logged in `level.degraded`; (b) `needsCrop` at once; (c) silently reseed placement (DESIGN forbids silent rebuilding).
Recommendation: (a).
Plan assumes: (a); section 3.7, T1.3.

## Q37. How Stephen's tracks reach the host

DESIGN 11 and HANDOFF 1 put tracks in `/music/`. Audio never enters git (fleet law), `.gitignore` line 148 ignores every directory named `music/` (the fleet soundtrack is its own private repo deployed to `public_html/music/`), and the committed deploy script's served set has no `music/`.
Options: (a) the game reads `./music/<slot>.mp3` (title, darkroom, attic, frost, deep, overgrowth, ember) from `/satellites/shutterbug/music/` on the host, which Stephen uploads there outside git; one HEAD probe per slot per session, silence when absent, the game's own nested worker caching a track on first play (its own seven files under its own scope, not the fleet's `/music/` library, which the root worker is forbidden to cache); (b) a shelf in the soundtrack repo at `/music/v1/shutterbug/` and the game reading the fleet catalog (couples the game to the catalog's ids and the studio player's rules); (c) a Stephen only exception to commit seven files (against the law).
Recommendation: (a); `docs/MUSIC-DROP.md` names the files and the host path.
Plan assumes: (a); `music/` is not in the served set; T3.3.

## Q38. A nested service worker on the shared origin

NEW_SATELLITE_BRIEF rule 6 says a vendored copy has its worker removed because the root worker owns caching; DESIGN 13.7 promises offline play once installed. Shutterbug is born here, not vendored, and gerplunk ships its own `sw.js` under `/satellites/gerplunk/` beside the root worker at `/`.
Recommendation: ship the nested worker under its own scope (the more specific scope wins), skip registration when embedded, delete only `shutterbug-*` caches, and prove it on a real phone: install from the live URL, airplane mode, relaunch (phone matrix row).
Plan assumes: that; T1.11.

## Q39. The fleet earn protocol (Sunbeams) is absent from DESIGN

NEW_SATELLITE_BRIEF asks for one Wallet object and `parent.postMessage({sws:'earn', moment})` on first time moments; DESIGN 1 says Sunbeams, if used, buy cosmetics only and the business model is his call.
Recommendation: wire the hook (five moment names: `first_clear`, `first_share`, `house_clear`, `daily_done`, `boss_kill`, deduplicated in the save; the list is Q54), announce only when framed, let the host price them; cosmetics stay unbuilt (T3.2 hooks only).
Plan assumes: that; T1.13, T3.2.

## Q40. Desktop windows are landscape

DESIGN 1: landscape shows a rotate card; a desktop window is landscape and the keyboard is the convenience target.
Recommendation: the rotate card only under `(pointer: coarse)` in landscape; a fine pointer gets the game centred with gutters.
Plan assumes: that.

## Q41. `prefers-reduced-motion` is not in DESIGN; the fleet brief requires it

Recommendation: the reveal becomes a short crossfade, no shake, no idle wobble, no pulses; squash and stretch stay (they are the hero's readability); a settings override.
Plan assumes: that; T0.14, T3.7.

## Q42. Save corruption under "one versioned key"

Options: (a) on a parse failure the unreadable string is kept inside a fresh document under the same key (`quarantine`) and the settings screen says so with the export box; (b) a second key for the corrupt blob (breaks "one key"); (c) overwrite silently.
Recommendation: (a).
Plan assumes: (a); T1.10.

## Q43. The 36x64 fallback: when to decide and what it costs

DESIGN 3 (open): if 24x48 proves too coarse, 36x64 at 10 px cells with an 8x12 hero. Everything derives from `SB.GRID`, but the movement numbers are in cells, so a 10 px cell shrinks every jump in pixels and the control feel changes. Cost if chosen: five numbers in `GRID_PRESETS.B`, the synthetic corpus regenerated by script, the sample room redrawn by hand (about an hour), every sprite redrawn for an 8x12 hero (half a day), the record `v: 2`, his rooms remade with `make.html`, the goldens regenerated once on purpose.
Recommendation: decide on the sample room plus three of his own rooms through `make.html`'s 36x64 preview toggle in the morning after T0.5b lands (night two), before M1 sprites are drawn. No build work waits on it.
Plan assumes: 24x48; the preset switch exists from T0.3.

## Q44. Fixtures that legitimately return `needsCrop` in the acceptance matrix

DESIGN 13.1 says every level is completable; some records must return `needsCrop` (all noise), which is the pipeline doing its job.
Recommendation: keep them, with `expect.needsCrop` authored by hand per fixture (never derived by running the pipeline), require every other combination completable, and assert that every room builds unless its authored `expect` says `needsCrop`, with at most 2 such rooms in the corpus (a count that holds at 7 fixtures on night one and at 21 after T0.5c).
Plan assumes: that; `H-rep-1`.

## Q45. DESIGN 13.1 needs real rooms

The corpus tonight is 20 synthetic records plus the hand drawn sample room; HANDOFF 1 and 6 have Stephen supplying the first batch through `fixtures/make.html`.
Recommendation: the harness runs on the synthetic corpus from hour one and M0 is judged on it; 13.1 is not claimed until 20 of his rooms (through `make.html`, into `fixtures/rooms/`) are green; the ask of the morning after `make.html` lands (T0.5b, night two) is three real rooms before any threshold is tuned.
Plan assumes: that.

## Q46. "60 fps with 4 enemies and 8 projectiles" has no headless proof

The box has no phone; under swiftshader the page draws a few frames a second.
Recommendation: two proxies in the gates (no allocation per step; p95 of step plus draw under 4 ms on this box) and the settings screen's `Performance` line on the phone as the real gate, recorded per milestone in PROGRESS.md.
Plan assumes: that; T0.17, T3.6.

## Q47. The dash's invisible i frames

DESIGN 4.3 gives the dash i frames for 4 of 8 frames; 5.3 says the first death must teach a readable mistake. A player hit on frame 5 of a dash learns a timing they cannot see.
Recommendation: draw the i frame window (the hero flashes Glare for the 4 frames). Render only; no DESIGN number changes.
Plan assumes: that; T0.17.

## Q48. The fleet's exit control and music chip on DESIGN's title and strip

NEW_SATELLITE_BRIEF rule 5 and `satellites/_EXIT-AUDIT.md` require one exit control `All Sky Wolf games` on the game's own menu; DESIGN 5.3 rules the first screen as two buttons and a small link. The fleet's `music-unlocks.js` (read 2026-10-30) places a 97x48 chip by a corner search that tries the bottom row first and scores a top bar under 80 px tall as occupied, it does so on every game the catalog can identify from the URL, shelf or no shelf, and the fleet reserves the bottom left 120x120 CSS px for it; DESIGN 4.1 puts the rocker bottom left.
Options: (a) the exit control is a fourth title control, in flow above the title art, never hidden on any profile; the control strip keeps the bottom left 120x120 empty and the rocker starts at x = 120 (A and B at 56 px on a 360 wide phone; the reservation released at 320 wide, where the chip's rect is reported and not asserted); (b) the exit control only, and let the chip land where the search puts it (on a canvas game that is the middle of a side edge: the play area, under the hero); (c) ask the fleet to exempt Shutterbug from the chip (not the lead's call).
Recommendation: (a). The exit is the Jessie rule; the reservation is what every new fleet plan does.
Plan assumes: (a); section 1.6; T0.2, T0.8b, T0.9.
Addendum (the builder, 30 Oct, from the review before sb-m0-2): the reservation assumed a fixed 97x48 chip, but the fleet chip's place is a drag saved under one key for every game on lucidwinds.com (`sws_music_chip_pos`, never reseated once saved), so a chip dragged in another game opens wherever it was left, over A or the rocker; a thumb that lands on it and slides drags it onto the strip and saves it there; and a folded song card's pill (left 12 px, about 115 px wide) reaches past x 120. Since sb-m0-2 the page hides the chip, the pill, the card and the toast while a room runs (`body.playing`, the rule Chaff Wars v1.11 uses; `SWSMusic.hold(true)` would close a waiting card as seen and lose the song) and gives them back on the title and the clear card. The 120x120 box stays reserved, so ruling (a) still stands for the title; if Stephen rules the chrome hidden in play for good, the box can go back to the rocker (T1.14).

## Q49. A loot speck under the palette is a Sun cell

DESIGN 6.11 makes a loot speck an isolated cell with S over 0.5 and L over 150. With L, S, H from the palette entry (Q12) only Sun (L 202, S 0.74) qualifies: Amber is L 143 and Teal L 147.
Options: (a) the letter: a speck source is an isolated Sun cell, the sample room's specks drawn in Sun (the speck sprite stays Amber with a Glare glint, section 7.3); (b) `SPECK_L: 140` so Amber and Teal qualify too (more natural specks on real rooms, one DESIGN number changed).
Recommendation: (a) tonight; (b) if the first real rooms through `make.html` place too few specks (the harness prints the detected count per room).
Plan assumes: (a); T0.5, T1.2b, section 7.2.

## Q50. Enemy clusters versus the beacon, the door, specks and solid landmarks

DESIGN 6.11 forms enemy clusters from any saturated component and is silent on precedence. `SAT` holds Walnut and Sun, so a brown bookshelf is a solid landmark and an enemy cluster at once, and the sample room's Sun and Glare lamp (2 to 5 cells) is a moth spawn on the beacon.
Options: (a) a claim order: the beacon's cells, the door's cells, the speck cells and the cells of every solid landmark leave the saturated set before clustering; a cluster found on other solid cells spawns its enemy on the nearest standable open cell outside the ascent's safe set; (b) clusters from open cells only (brown furniture never spawns anything, which empties most Attic rooms); (c) the letter (a moth nest on every lamp).
Recommendation: (a).
Plan assumes: (a); T0.16 (v0), T1.2a, T1.2b, section 7.2.

## Q51. Elite HP

DESIGN sizes elites (24x24, 6 to 11 cells) and gives them no HP.
Options: (a) 2x the fodder HP of the kind; (b) a flat 4; (c) 3 for 1 HP kinds and 4 for 2 HP kinds.
Recommendation: (a), `TUNING.ELITE_HP_MULT: 2`.
Plan assumes: (a); T1.4.

## Q52. Weapon tiers and the reroll price

DESIGN 9.4 prices developing a blueprint at 30 / 100 / 300 by weapon tier and never says which weapon is which tier; 9.3 sells "a weapon or a reroll for DP" with no reroll price.
Options: tier 1 {J1 J5 D1 D6 C1 C2}, tier 2 {J2 J3 J6 D2 D4 D5 C3 C4 C6}, tier 3 {J4 J7 J8 D3 D7 D8 C5 C7 C8} (by how much of a room each changes) and a reroll at 20 DP (two fodder kills); or any table Stephen writes.
Recommendation: the table above and 20, in `TUNING.WEAPON_TIER` and `TUNING.PRICE_REROLL`, retuned from the M2 economy log (HANDOFF section 10).
Plan assumes: that; section 1.4, T2.9.

## Q53. Stepped halving instead of DESIGN 6.1's single draw

DESIGN 6.1 area averages by one draw to a 24x48 canvas with `imageSmoothingEnabled`. A single bilinear draw reads four texels per cell and aliases on busy photos, so the crop overlay would flicker as the crop moves (risk 11).
Options: (a) halve stepwise to under twice the target, then one draw; (b) the letter.
Recommendation: (a); `H-cap-1` compares it to the pure area average within 2 per channel as a drift bound, not a determinism claim (risk 12: capture is not cross device deterministic by design; only the record is shared).
Plan assumes: (a); T0.5b.

## Q54. The Wallet moments list

NEW_SATELLITE_BRIEF asks for first time moments the host prices. Q39 named four; sharing a room is the third pillar and is worth a moment.
Options: (a) `first_clear`, `first_share`, `house_clear`, `daily_done`, `boss_kill`; (b) the four of Q39.
Recommendation: (a), each once per save.
Plan assumes: (a); section 1.6, T1.13.

## Q55. The Daily Room replay lock

DESIGN 8 gives the Daily Room x1 DP and no replay rule.
Options: (a) one play for DP per date, replays for nothing; (b) unlimited DP replays (a farm); (c) three plays.
Recommendation: (a).
Plan assumes: (a); T3.1b.

## Q56. The pickup grace

DESIGN says nothing about a scroll grabbed mid jump; an offer opening in the air would hold the hero mid arc.
Recommendation: a 6 frame grace after touching a scroll and the offer opening on landing; a DP speck is taken at once. The pick itself enters the sim as a `CHOICE` word (section 2.6), never as a shell write.
Plan assumes: that; T1.6.

## Q57. Enemy envelopes make "safe cell" stricter than DESIGN 6.9

DESIGN 6.9 excludes a cell with an enemy spawn within 3 cells; a crawler patrols a whole ledge and an icicle strikes a column, so the letter can pass a room whose every safe cell sits on a patrol.
Recommendation: a safe cell is also outside every enemy's envelope (section 3.7); the harness prints how many corpus rooms change under the letter so the ruling is made on numbers.
Plan assumes: the envelopes; T1.2b, T1.3.

---

*Entries the builder adds during the night go here, numbered on from Q58, one per xfail or blocked task, in the same shape.*

## Q58. Is the floor a landmark? (the builder, 30 Oct, from the review before sb-m0-1)

DESIGN 6.5 makes landmarks of the three largest 4 connected solid components, and 6.3 forces the bottom row solid. Read literally the forced floor row is a component, and every piece of furniture standing on it joins it: in the sample room the "bed" landmark was the bed plus the whole floor row (38 cells), and three separate pieces of furniture on a floor made ONE 132 cell landmark (the review's probe). Landmarks are "everything the player will point at and say I climbed that"; the floor is not that, and the blob would be pulsed in the reveal (5.2), protected from repair and offered to the pocket (6.11).
Options: (a) leave the forced floor row out of the landmark components (the photo's things only); (b) the letter, the floor blob included.
Recommendation: (a).
Plan assumes: (a), built 30 Oct before sb-m0-1: the sample room's landmarks are the wardrobe (128), the bookshelf (26) and the bed (14); four fixture expects re-authored by hand from the rule (blank-wall 0, all-light 0, one-giant-landmark 1, shelves-a 1); H-pipe-5 lab "three separate blocks standing on the floor are three landmarks", mutant FLOOR_IS_LANDMARK.

## Q59. Which cluster is "the brightest" ceiling light?

DESIGN 6.6 and 6.11 name the ceiling light "the brightest cluster in the top 4 rows". The first build summed L over each cluster, so a big white area beat a smaller, brighter lamp: a 3x2 Glare lamp lost to a 6x3 Paper patch, and a Glare pendant lost to a white Paper ceiling row (the review's probes), against "climbs back up to the light".
Options: (a) the cluster with the highest peak L, ties to the larger cluster, then the lowest first cell; (b) the highest mean L (a lamp with a Sun shade then loses to a plain Paper ceiling); (c) the sum (the first build).
Recommendation: (a): a light source is its brightest point.
Plan assumes: (a), built 30 Oct; H-pipe-12 lab (the lamp beats the patch), mutant LIGHT_BY_SUM. The beacon relights the light's cells only when the exit stands in it (section 3.7's sentence; the first build relit it everywhere), mutant BEACON_RELIT_ANYWHERE.

## Q60. "No air friction" and releasing the rocker in flight (FEEL)

DESIGN 4.1: "Full run speed immediately; 4 frame decel on release." DESIGN 4.2's fall row: "fast fall, terminal 12 px/frame, no air friction". The build applies the 4 frame decel whenever the rocker is released, in the air too, so letting go mid jump stops the sideways drift in 4 frames, about 4 px (504 + 336 + 168 subpixels, 3.94 px; the first draft of this entry said 10.5 px, which is 4 frames at full speed, not the decel).
Options: (a) "no air friction" is about the fall (nothing slows it short of terminal); the release decel applies everywhere (the build); (b) sideways momentum is kept in flight: the decel applies only on the ground, and a mid air stop needs the opposite direction.
Recommendation: (a): the reach tables rest on "the player releases the rocker earlier and every shorter distance is available" (BUILD-PLAN 3.2), and on a digital rocker a kept momentum makes short hops hard to aim. His thumbs decide.
Plan assumes: (a); H-sim-18 pins it ("releasing the rocker in flight decelerates in 4 frames, still airborne"), mutant AIR_KEEPS_MOMENTUM. A ruling of (b) is one condition in core-sim plus the labs and a retable.

## Q61. The Pixel 9's 1x canvas is fractional in device pixels (beside Q5)

DESIGN 3: "1 game px = 1 CSS px (3 device px on most phones) ... Never fractional scale." The plan's "integer scaling holds exactly on every phone 384 px or wider" is exact in CSS px only. The Pixel 9 spreads 1080 device px over about 411 CSS px (a device pixel ratio of 2.625), so the 384 CSS px canvas is 1008 device px: 144 of the 384 game columns are 2 device px wide and 240 are 3 (rows the same), one device column in eight dropped, twice Q5's one in sixteen at 360. One pixel edges then render 2 or 3 device px thick by position, and as the camera scrolls a whole game pixel at a time a platform edge can change thickness: a possible shimmer during a climb. Every shot and gate before 30 Oct ran at a ratio of 3, where 384 CSS px is exactly 1152 device px and nothing of this shows. (The review's phone lens.)
Options: (a) keep 1x in CSS px (the build), and judge it on the phone; (b) integer device pixels: draw each game pixel as exactly k device px (canvas CSS width 384 * k / devicePixelRatio): at 1080 device px only k = 2 fits the whole width (768 device px, about 293 CSS px, the room smaller with wide gutters); (c) k = 3 with the 360 game px window of Q5's ?fit=crop (the camera following the hero sideways by up to 24 game px), triggered by a fractional ratio rather than by CSS width.
Recommendation: (a) tonight, and the morning report carries a 412x915 shot at ratio 2.625 beside the ratio 3 shot so he sees what his phone does; (c) is one condition in fit() once ?fit=crop exists (T0.8b) if the shimmer shows in his hand.
Plan assumes: (a).

## Q62. A sits in Android's back swipe strip (the builder, 30 Oct, from the review before sb-m0-2)

DESIGN 4.1 puts A outermost at the right; on the strip A's hit area runs to the screen edge and its drawn circle ends 3 px from it. Android's gesture navigation (the Pixel default) keeps roughly the outer 24 to 30 dp of each side for the back swipe, and in Chrome 1 dp is 1 CSS px: a touch that starts there and moves sideways more than about 6 dp within 250 ms is taken by the system. The page then gets a pointercancel, A is released, and the jump is cut to a short hop; a slide that completes runs Back, and the page keeps no history entry of its own, so Back leaves the game. No headless gate has system gestures; this is a reading of AOSP's EdgeBackGestureHandler, not a measurement on a phone. (The review's phone lens.)
Options: (a) as designed: A on the edge (the default tonight); (b) on phones 412 wide and over, the verbs (and the mirrored rocker) 32 px off the right edge, the rocker zones 58 px instead of 74 (the alternative is built: open the room with `?edge=1`); at 390 only 14 px fit before the zones drop under 56, and at 360 none; (c) (b) plus a history entry while a room runs, so a completed Back swipe returns to the title instead of leaving (it touches the fleet exit's `history.back` journey and needs its own check).
Recommendation: (b) if a cut jump or a back chevron shows in his hand on the Pixel 9; compare the two on the phone: the room as served and the room with `?edge=1`. A short hop on his phone may be this rather than the jump's tuning.
Plan assumes: (a); T0.8b, T1.14. Seen in the sb-m0-2 shots: under 360 wide, where the reservation is released, the rocker's left zone runs to the left edge, the same strip on the other side (and in the mirrored strip A and B take that edge).

## Q63. At 120 Hz the world moves at 60 Hz (the builder, 30 Oct, from the review before sb-m0-2)

DESIGN 2 says the world scrolls at the display rate; the sim steps at 60 Hz and the render draws the last stepped state with no interpolation, so on a 120 Hz screen (the Pixel 9 at its default) every other frame repeats the one before: the hero and the camera move 60 times a second at best. Since sb-m0-2 the accumulator starts each run a quarter step off the frame boundary, so the steps at least land on every other frame evenly (before, inexact frame times flipped frames between 0, 1 and 2 steps: in the review's simulation 35 to 45 percent of steps were unevenly spaced at 60 and 120 Hz, none with the offset).
Options: (a) as built: 60 Hz motion, evenly paced; (b) render interpolation: draw the hero and the camera between the last two stepped states by the accumulator's fraction (render only; the sim, the replays and the hashes do not change; the clear card and every test stay on stepped states); (c) a 120 Hz sim (TUNING and every table doubled: not proposed).
Recommendation: (a) tonight; (b) with T0.17's sprites if the 60 Hz scroll reads as stutter in his hand.
Plan assumes: (a); section 1.5, T0.8a.
