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
(30 Oct, the third review) The knob is read nowhere: the sim's run step and core-reach's arcs implement 1 only, so H-sim-18 now refuses any other value; a ruling of partial air control comes with its rule (how vx moves toward the rocker's speed in the air) and retunes the tables by the same stepping.

## Q24. The variable jump mechanism is unspecified

DESIGN 4.2: "hold for height (variable, 3 to 4 cells)", "short hop: release early, 2 cells."
Options: (a) a release cap: on release while rising, `vy` is capped to `JUMP_CUT_V` (5.08 px per frame), so the apex ranges from 2 cells (a one frame tap gives 31.4 px) to 4.35 cells by release time; (b) reduced gravity while held.
Recommendation: (a): one constant, one branch, measured by `H-sim-1`. FEEL.
Plan assumes: (a).

## Q25. The wall jump's horizontal lock

DESIGN 4.2 gives "4 across away from the wall" but not how long the rocker is ignored (a player holding toward the wall at the jump would re stick at once).
Recommendation: `WALL_JUMP_LOCK: 10` frames of locked push away, then normal air control; proven by H-sim-15 (the push lasts exactly the lock, the third review: the WALL labs hold the rocker away through the lock and cannot see its length). FEEL.
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

## Q64. Two of section 3.2's printed numbers are not the sim's (the builder, 30 Oct, T0.10a)

Every table of section 3.2 reproduced exactly (FULL, MID, TAP, WALL, STICKY, Deep FULL and Deep WALL: apex, air, the raw and the clipped tables; the jump down table 6, 7, 8 at 1, 4, 8 rows), but two printed numbers follow a model the sim does not. (1) The whole FULL arc's column 2 spans rows 2..5, not 3..5: at step 7 the box (x 20.4 px) overlaps column 2 by 0.4 px, which the sim's collision counts (it reads x + 12 px less one subpixel) and the plan's per pixel formula floor((cx + 5) / 16) drops. A corridor that drops it would call a jump clear that the sim bonks, the one thing the model may never do. (2) The walk off table: the plan's numbers (2 at 1 to 2 rows, 3 at 3 to 4, 4 at 6 to 8, 5 at 12, 6 at 16, 7 at 24) are exactly a fall that starts at once from the takeoff spot; the sim walks along the ledge until the box has left it and then falls, which reaches one column further at 2, 4, 7, 8, 12 and 24 rows (3, 4, 5, 5, 6, 8), and the T0.7b labs land those walk offs in the sim.
(3, T0.12a) The WALL table: the plan's arcs start a wall jump centred in the contact cell, but section 3.1's stance is touching the wall, 2 px nearer it, and a jump away then reaches 2 px less: WALL's raw table is [5, 5, 4, 3] (the plan prints [5, 5, 4, 4]) and Deep WALL's [5, 5, 4, 4] (the plan prints [6, 5, 5, 4]), so DESIGN's "3 up, 4 across" is the cone's bounding box for the wall jump too (3 up reaches 3 across), and the sample room's wardrobe wall jump (4 away, 3 up, a branch, never the ascent) is no longer an edge (H-reach-10 warns).
Options: (a) the sim's numbers (the build: fixtures/tables.json, the core and the oracle all carry them; H-reach-1b types the plan's numbers everywhere else and these three by the sim, with this entry named); (b) the plan's printed numbers: the corridor stays as built (it must), and the fall table is cut back to the plan's stingier one (true, but it drops real edges, so repair adds tabs a walk off already reaches).
Recommendation: (a).
Plan assumes: (b)'s numbers in its text; the build is (a). T0.10a.


## Q65. The bot's first findings: an exact wall touch, and one way footing (the builder, 30 Oct, T0.13a)

The bot (section 3.9's generosity assertion) found two places where the model promised what the sim did not keep. Both are fixed tonight, one on each side, and each fix is the stingier or the kinder reading.
(1) The model's wall touch was generous. It counted a contact for every cell the hero's box passed through beside a wall, but the sim arms a slide only with the box flush against the wall (DESIGN 4.2's corner rule), and a jump usually meets the wall rows lower than where its box first entered the column beside it. On shelves-a the model listed touches at (19, 34) to (19, 36) from S2's middle; the sim arms only from (15, 39) on, and the highest contact any jump from S2 makes is (19, 35), the apex being 4.35 cells. The touch is now stepped as the sim steps it (core-reach's scan): the rocker held toward the wall from the takeoff, FULL from step 0 and 3, MID, the walk off, and the wall jump's flight to a far wall; clamped flush at the first solid; armed only with HERO_H - CORNER_PX of wall beside the box (never in the wall jump's lock; a vine only going down); the contact named by the row holding the box's centre; scanned to 6 rows below the takeoff. shelves-a's S3 now reaches x 17, so its designed wall jump is 2 away (from (19, 35) the 3 up 3 across jump sits on the WALL table's edge, which the route's slack rule refuses).
(2) The sim dropped a hero off a one way ledge as soon as its overlap fell under LAND_OVERLAP_PX (2 px), a step before it would leave a solid ledge, so a walk off from a one way reached one column less than the model's table and the same move from a solid. A hero standing on a one way now keeps its footing while any overlap remains, as on a solid; landing on a one way from the air still takes 2 px (section 3.8 item 2; H-sim-4 holds it).
Options: (a) as built; (b) keep the old touch and teach the sim to arm on any cell beside a wall (a slide from mid air with the wall 6 px away: no); (c) leave the footing and cut the walk off table for one way ledges (a table per support type, stingier than the solid case for no reason a player would feel).
Recommendation: (a).
Plan assumes: section 3.3's WALLTOUCH as "a contact the farthest FULL jump of each height, or the farthest walk off of each depth, reaches"; the build is (a), with the bot proving every listed touch.
(The third review, 30 Oct.) The contact's row is now the first whose stance (the box exactly in the row, where the WALL arc starts) is at or below the hero: named by the box's centre, a hero could hang up to half a cell under the stance its wall jump assumes, which no wait on the wall can raise; at or above, a wait slides it down to the stance. The sample room's wardrobe touch is then (18, 25), the wall jump to shelf E 3 away and 2 up. And the bot found two more promises on vines (the hand rooms of H-bot-1c, since no M0 room has a vine): a STICKYUP of 1 row (the shortest sticky jump, a tap of 31.4 px, re sticks at its apex, a row up only from within 0.6 px of the stance) and a STICKYUP to a contact with a solid right over it (the hero bonks there and sinks before it sticks, a row lower). The model lists neither now.

## Q66. Repair's 15% cap cannot bind, and its 40% branch has no room yet (the builder, 30 Oct, from the third review)

At TAB_MAX 12 a pass and REPAIR_PASSES 4, repair lays at most 48 tabs, 96 of 1152 cells, 8.3%, so DESIGN 6.7's "if repair would alter more than 15% of cells, needsCrop" never fires: the passes run out first (H-rep-7 prints the bound). And no room of the corpus has its exit reached with under REPAIR_REACH_FRAC (40%) of its standable cells, so repair's "toward the largest unreached mass" branch runs in no test tonight.
Options: (a) as built: the cap stays as the guard for a larger grid or a retune (grid B's 24x96 halves the bound to 4.2%), the 40% branch gets its lab with the first real photos (T1.x) or a hand room; (b) read TAB_MAX as the whole repair's limit, which makes 15% bind never either; (c) count the 15% over the stair's whole footprint (each tab's corridor), which can bind.
Recommendation: (a), with the lab owed and named here.
Plan assumes: DESIGN 6.7 verbatim; the build is (a).

## Q67. One needsCrop message for every cause (the builder, 30 Oct, T0.15)

DESIGN 5.1 and T0.15 give one sentence, Try a tighter crop, but the pipeline says why it cannot build (no open cell above the floor, unreachable, the route's filters, repair too large). On a black or an all window photo a tighter crop does not help.
Options: (a) one sentence, as built; (b) a sentence per cause: Too dark to find a floor. / Nothing to stand on here. / Try a tighter crop. (the route's causes); (c) (b) plus the overlay marking where the climb stops (the route score's frontier row).
Recommendation: (b) in M1 with the copy law (no dashes, no exclamation marks); (c) later if photos stall players.
Plan assumes: (a).

## Q68. The wall chain counts the touch (the builder, 30 Oct, from the third review)

DESIGN 6.9: "no wall-jump chain longer than 2 without a standable cell". The plan's section 3.7 counts wall touches and wall jumps since the last standable cell (ROUTE_MAX_WALL_CHAIN 2), and every wall jump needs a touch first, so under the plan's reading a main ascent holds at most one wall jump between standable cells; under DESIGN's letter it may hold two (a touch, a jump to the far wall, a jump off it).
Measured tonight: no room of the corpus, in either mode, changes its ascent, tabs or needsCrop under either reading; only H-route-3's chain lab (walls 2 apart, 7 rows) tells them apart.
Options: (a) the plan's reading, as built: the main ascent stays forgiving, two wall jumps in a row are a branch; (b) DESIGN's letter: count the wall jumps only (the lab's CHAIN_3 then needs a third wall jump to fail).
Recommendation: (a) for the first rooms; Stephen's thumbs on a real shaft decide.
Plan assumes: (a); section 3.7, T0.11b.

## Q69. The bot's wait for a clear corridor cannot pass with homing moths (the builder, 30 Oct, T0.16)

Section 5.2 step 5: before each edge the bot waits up to 600 frames for no enemy within 2 cells of the source and the corridor, and a timeout FAILS. Moths home on the hero (DESIGN 7, Q29), so a moth near the source only gets nearer while the bot waits: the rule as written turns every moth that reaches the hero into a FAIL, the opposite of what H-en-3 asks (the walker reaches the exit with moths live).
As built: the route walks are immortal (Q30) and never wait. The mortal walk (H-en-3 only) runs each edge at once; when every candidate fails it waits for the moth's hit and runs the edge inside the hit's i frames, then waits 20 to 600 frames and retries, and only then fails. Tonight the mortal walk on the sample room takes no hit at all (the bot outruns 1 cell per second), so the fallback is exercised only by moths eight times faster (MOTH_SPEED_X8, RED).
Found on the way: the bot's attempts used to stand on the target until the trailing held A ended, a hero parked in a moth's path; an attempt now ends at rest after its last word that moves the hero.
Options: (a) as built; (b) the plan's letter, with the moths frozen while the bot waits; (c) the bot avoids moths (a planner, M2's patrol enemies want one anyway).
Recommendation: (a) for M0 and M1's fodder; (c) when T1.1's patrol and hop enemies make contact routes matter.
Plan assumes: (a); section 5.2 step 5 reads "the bot waits for the hit" until (c).

## Q70. The moth's contact core and its drift (the builder, 30 Oct, T0.16)

DESIGN 7 gives the moth's speed (1 cell per second, through furniture) and the contact rule (1 heart, 1 s of i frames, 2 cell knockback away), not its hitbox nor how a diagonal drift is measured.
As built: the moth's contact box is its cell less 2 px each side (12 by 12 of the 16 by 16 sprite, the same forgiveness as the corner rule); the drift moves the larger axis at MOTH_V and the other in proportion (a diagonal moth closes about 1.4 cells per second); a dash's i frames protect as a hit's do; the knockback is 8 steps at a fixed speed, the rocker ignored (HIT_KNOCKBACK_FRAMES 8, in TUNING); a knockback into a wall stops there.
Options: (a) as built; (b) the full 16 px box; (c) a Euclidean drift (1 cell per second on every heading).
Recommendation: (a): a forgiving core is the genre's habit, and the drift is a feel number Stephen tunes on the phone.
Plan assumes: (a).

## Q71. A moth's last hit on the step the hero touches the exit (the builder, 30 Oct, from the fourth review)

The sim ran the moths before the exit check, and the exit check did not look at the death: one step could end the room both ways (the fourth review: a moth homed at (11, 45), the hero on one heart walking right into the exit, both on step 62), and the shell showed the clear card over a fallen bug and an empty heart strip. DESIGN is silent on the order.
As built: the exit is tested before the moths, whose contact already waited on a cleared room, so the touch on the lamp wins and that step takes no heart. Moths still move on that step, so the immortal goldens did not move. H-sim-21 asserts the shared step (DEATH_AND_CLEAR, RED).
Options: (a) the clear wins, as built (a player who reached the lamp keeps the room); (b) the death wins (the exit check skips a dead room: the hit came first in the step order).
Recommendation: (a): the genre's habit is that touching the goal wins, and it never shows a card over a fallen hero.
Plan assumes: (a).

## Q72. The B hint's dive target in M0 (the builder, 30 Oct, from the fourth review)

T0.16 shows the B hint "the first time the hero is airborne above a dive target"; the plan's dive target is the onboarding beat of H-onb-1 (a fall of at least 3 rows onto a standable cell, the sample room's speck landing). T0.16 built a v0: any one way within 8 rows under a falling hero, so on the sample room B pulses on the way down onto the first shelf, about 3 s in, with the rocker and A, and the real dive (walking off shelf D onto the speck) gets no hint.
As built: the v0, unchanged; the hint's class now leaves after its pulse under reduced motion too (the fourth review: the still outline stayed for the session; HINT_STAYS, RED).
Options: (a) leave the v0 until T1.12 times every hint by DESIGN 5.3's table (rocker and A at 20 to 35 s, B at 35 to 50 s with the dive target); (b) a dive target now: B only above a standable cell 3 or more rows below.
Recommendation: (a). Hint timing is onboarding pacing, a WAITS item; Stephen's first play of M0 is the input T1.12 needs.
Plan assumes: (a); T1.12.

## Q73. The relit lamp swallows the Sun hero and the beacon's bulb (the builder, 30 Oct, from the fourth review)

When the exit is the ceiling light, T0.8a relights the light's cells at full palette colour (its fix for a dull lamp) and T0.17 draws the beacon sprite (a Sun bulb, a Glare shade and rays) on the exit cell. On the sample room the lamp's shade is Sun: the beacon's bulb is Sun on Sun and its Glare parts about 1.4 to 1 against it (the fourth review's phone lens), and the hero, Sun with an Ink outline, walks the last cells of the climb over that Sun shade and reads only by its outline (the builder's clear shots at 412 and 360, 30 Oct). On Paper lamps (all-light, shelves-b) the Glare parts sit near 1.07 to 1.
Options: (a) relight the light's cells but leave the exit cell at its dimmed backdrop under the sprite; (b) give the beacon's bulb and rays an Ink edge or an Amber fill (section 7.1 gives Glare to the core and Sun or Amber to the halo, the reverse of today's sprite); (c) relight the lamp one step dimmer (the blend at half strength), so full Sun stays the hero's and the beacon's alone (section 7.3: "Sun is reserved for the hero, the chest trim and the beacon").
Recommendation: (c) with (b): the lamp still glows and the hero and the beacon keep the only full Sun on screen. An art call for Stephen's eye on the phone: one line in the relight and one sprite string.
Plan assumes: today's draw until he rules.

## Q74. A slick run's end cells: section 3.1 against section 3.5 (the builder, 30 Oct, T1.1)

The plan says two things about Frost. Section 3.1: "the two end cells of a slick run are not standable for the model (the one cell slide carries the hero off them)", and a slick end is never a safe cell. Section 3.5: "a slick platform cell as a landing target is valid only if the sim's one cell slide cannot carry the hero off it: the cell t + dir is standable, or is solid, or the edge's dx is 0". T0.10b built 3.1; it never mattered while nothing was slick. T1.1 marks slick, and 3.1 then refused landings that cannot slide off (onto an end moving inward, onto an end against a wall, straight down): shelves-a and biome-frost turned needsCrop (the route's max-range, every plank end gone), and an end cell on the frame became a wall contact standing on a one way, so the graph listed slides down through planks the sim lands on (stripes-h under Frost, H-bot-1b).
As built: 3.5 in the graph, one rule inside the edge builder (a landing that would slide off is no edge), and 3.1's clause dropped from both the standable set and the safe set: an end reached by a landing that cannot slide off is standable and safe, since the hero stops there and the slide happens only on a stop with speed toward the drop. H-bio-5 holds the rule on a lab run (six slick cells, a drop at each end, then a wall beside one end), watched red by SLICK_SLIDE_IGNORED and by SLICK_ENDS_UNSTANDABLE (3.1's clause put back). The sim's slide itself is T1.5 (WAITS); until then the model is stingier than the sim, never more generous.
Options: (a) 3.5, as built; (b) 3.1, and accept that Frost (the white room, Q4: the most common room there is) refuses most rooms with shelves.
Recommendation: (a). T1.5 proves the one cell margin against the sim (H-sim-16).
Plan assumes: (a); section 3.1's slick line reads "see section 3.5".
Addendum (the fifth review, 30 Oct): the plan text now says so in 3.1, 3.5 and 3.7 (it had not been changed). The rule holds for every landing kind, WALK included (the model lens: of the 981 edges it removes over the Frost overrides, 973 would still rest with 2 px or more on the end; testing the landing position instead is open for T1.5's H-sim-16). Section 3.7's "every standable non slick cell is safe" is read like 3.1's clause: a slick cell counts as safe (under 3.7's letter the Frost builds of sample-room, shelves-a, shelves-b, the five tints, ladder-stack and stripes-h become needsCrop(route)). Section 3.5's "the exit is never slick" is read as harmless: the exit may stand on a slick run (shelves-b as detected does), since touching it clears the room first; spawn stands on the floor row, which is never slick.

## Q75. The pocket's elite stays in its pocket (the builder, 30 Oct, T1.2b)

DESIGN 6.11 puts "an elite inside" the pocket and section 3.7 gives the elite the pocket interior as its envelope; DESIGN 7 keeps every enemy off the main ascent's safe cells and 2 cells from spawn. The pocket's entrance faces the ascent cell nearest the hollow (T1.2a), so the elite's cell is often within ROUTE_SAFE_ENEMY_DIST of a cell the ascent stands on, and an Attic elite is a moth, which drifts through furniture (Q29).
As built (T1.2b): the pocket's elite is placed whatever the ascent distance (its envelope is the closed pocket, which holds no ascent cell by construction), keeps the 2 cell clearance from spawn, takes the one elite slot first, hangs from the pocket's roof when it is an icicle and stands on its floor otherwise.
Options: (a) T1.4 confines the pocket's elite to its pocket (it wakes when the hero enters and never leaves; a moth elite does not drift out); (b) the elite obeys the ascent distance like every enemy, and a pocket near the climb stays empty.
Recommendation: (a): the pocket is the reward branch DESIGN describes, and the elite is its guard. T1.4 asserts the confinement.
Plan assumes: (a); T1.4.

## Q76. The default spread's fodder on a blank white wall (the builder, 30 Oct, T1.2b)

DESIGN 6.11 gives a blank wall "one speck, one fodder"; a blank white wall is Frost (Q4), whose enemy is the icicle, which hangs under a platform; on a blank wall the only platforms are the film tabs of the default spread, which are the climb itself, and the ascent distance keeps every enemy off them.
As built (T1.2b): the spread's fodder is its biome's kind where a cell keeps that kind's rules, else a moth (which needs no ceiling) on the nearest standable cell that keeps the rest.
Options: (a) as built; (b) no fodder when the biome's kind has nowhere to go; (c) an icicle hanging from a tab off the ascent (none exists on the spread's two stairs).
Recommendation: (a): DESIGN promises the blank wall one fodder.
Plan assumes: (a).

## Q77. The trap field is the largest repeat that keeps off the ascent (the builder, 30 Oct, T1.2b)

DESIGN 6.11: a repeating 2 cell pattern at least 4x4 becomes the trap field, cap 1, never intersecting the main ascent. A photo's pattern often lies across the climb (trap-pattern's checks are stood on by its ascent).
As built (T1.2b): the candidates are, for every top left cell, the largest rectangle whose palette repeats with period 2 both ways and is not one colour, at least TRAP_MIN a side; they are tried largest first (ties to the lower top left), and a field is kept only when none of its open cells is a cell the ascent stands on and every ascent edge stays an edge with the field walled; at most TRAP_TRIES are checked. So a field can be the part of a pattern the climb does not use (trap-pattern's field is x 14..17, rows 32..35 of its 6x6 checks).
Options: (a) as built; (b) only the whole largest pattern, and no field when it touches the ascent.
Recommendation: (a): more rooms with patterns get their trap, always off the climb.
Plan assumes: (a).

## Q78. Placement reach: the exit is a sink, and every placed cell returns (the builder, 30 Oct, the fifth review)

Q34 puts the chest "deepest into a branch off the main ascent". The fifth review found three ways that reading strands the hero. On saturated-blobs the chest sat at (4, 19), which the model reaches only through the exit, and touching the exit ends the room. In a pit room the deepest cell was the pit's floor, from which no move leads back. And the pocket's tunnel could carve the floor from under the Darkroom door.
As built (review 5): placement measures reach from spawn with the exit a sink (the search never leaves it), and the branch search never leaves the exit either. The chest, the door, the cells the specks and the scroll are touched from, and the pocket's loot must be cells from which the exit can still be reached (a search over the reversed edges). Every tunnel cell has a roof of its landmark, so a carve takes no open cell's floor, and the pocket is placed before the door (the task text's order), the door on the carved grid. Still open: an edge whose jump sweeps the exit cell mid air is counted as a route past it (T1.3 can drop such edges from placement).
Options: (a) as built; (b) Q34's letter: deepest regardless, and the hero may have to restart after the chest.
Recommendation: (a): the reward of a branch must never cost the room.
Plan assumes: (a); H-feat-1 (the chest by Q34's order on every level, the pit, the tap on saturated-blobs), H-feat-2, H-feat-4, H-feat-5.

## Q79. Equal hue bands break to the band holding the lowest palette index (the builder, 30 Oct, the fifth review)

Section 3.7's tie law breaks every tie to the lowest cell index, palette index or threshold. biomeOf broke a tie of band votes to the lower band index (Attic 0, Deep 2, Overgrowth 3, Ember 4), which is none of the three.
As built (review 5): the bands are ordered by the lowest palette index each holds, read from the palette: Attic (Walnut 7), Ember (Brick 9), Deep (Lapis 11), Overgrowth (Moss 13). Equal Brick and Lapis votes now give Ember, where they gave Deep.
Options: (a) as built; (b) the band index, as before.
Recommendation: (a): the law's letter, and a second implementation derives it from the palette alone. Exact ties are rare in a photo.
Plan assumes: (a); H-pipe-11 plants the tie.

## Q80. The pocket's elite is held to its envelope in the safe cells (the builder, 30 Oct, T1.3)

Section 3.7: a safe cell is outside every envelope and more than ROUTE_SAFE_ENEMY_DIST from every spawn. Q75 places the pocket's elite whatever the ascent distance, since its envelope is the closed pocket and T1.4 keeps it there.
As built (T1.3): the safe cells after placement hold the pocket's elite to its envelope (the pocket's cells) and every other enemy, Ember's extra one included, to its envelope and the spawn distance. Over the corpus the letter changes nothing yet: under it 0 of 138 ascents break the cadence (H-route-7 prints the count).
Options: (a) as built; (b) the letter: a pocket beside the climb can cost the ascent its safe cells, and the degrade ladder then removes the elite first.
Recommendation: (a): the elite never leaves its pocket (Q75), so its spawn distance guards nothing.
Plan assumes: (a); H-route-7.

## Q81. A frozen or stunned enemy is held: it neither moves nor harms (the builder, 30 Oct, T1.4)

T1.4 adds the frozen and stunned timers the M2 weapons set (DESIGN 9.1: Shutter Snap and Icicle freeze, Flashbulb stuns). DESIGN does not say whether a held enemy still hurts on contact.
As built (T1.4): while either timer runs, the enemy neither moves nor costs a heart on contact; the pocket's elite sleeps the same way (stunned -1) until the hero enters its pocket (Q75). H-en-9: a frozen moth on the hero neither moves nor hits for its 30 steps, then hits.
Options: (a) as built; (b) held enemies stop moving but still hurt on contact.
Recommendation: (a): a freeze reads as safety, and the weapons that set it are defensive.
Plan assumes: (a); M2's weapons.

## Q82. T1.4's readings where DESIGN 7 gives no number (the builder, 30 Oct, T1.4)

DESIGN 7 gives the jelly's throw (2 cells) but not its speed, the spark's period (1.5 s) but not its flight, the icicle's respawn but not what a killed icicle does, and the elite's size (24 px) but not its art.
As built (T1.4): the jelly bobs at JELLY_SPEED 1 cell per second (a full bob is 8 s); a spark's 1.5 s cycle is a rest and a SPARK_AIR_S (0.2 s) flight through a one cell arc onto a standable cell of its envelope, drawn from the state's generator; an icicle that falls and shatters hangs again ICICLE_RESPAWN_F steps later, one killed by a weapon (M2) stays dead and banks its DP once; an elite is its kind's 16 px art drawn 1.5 times (24 px), its box centred on its cell. No enemy is placed on a one way's own cell, and the jelly's throw stops at one: the render draws that cell as the plank's body (T1.4's shots found a jelly inside a plank).
Options: (a) as built; (b) each number his.
Recommendation: (a) until his play; every one is a TUNING line or a sprite (Astra's art replaces the drawn sprites).
Plan assumes: (a).

## Q83. A crusher's stroke is its field; a trap field keeps off the climb's room (the builder, 30 Oct, T1.4b)

T1.4b: spikes hurt on contact in the on phase and crushers "in their stroke cells during the stroke". The plan does not say which cells a stroke covers. DESIGN 6.11 keeps the field off the main ascent; trap-pattern's field touched no ascent cell and no corridor of the reach model, yet the bot's own jump off (13, 34) clipped the field's corner cell (14, 32) by 2.6 px for two steps of the on phase (H-trap-2).
As built (T1.4b): a crusher's stroke is the on phase over all the field's cells (each cell's crusher drops through it), the same cells and phase as the spikes; and no trap cell lies beside a cell the ascent stands on (Chebyshev 1), the climb's room, as the field already spares film tabs and the cells a hero stands in on them. Six corpus builds lose those cells; trap-pattern keeps its field.
Options: (a) as built; (b) a crusher's head sweeps one row of its field at a time (a moving danger, its own sprite); (c) the climb's room is 2 cells.
Recommendation: (a): one rule for both kinds, and a hazard the climb can graze by a jump's spread is a hit no player expects.
Plan assumes: (a); H-trap-1, H-trap-2, H-feat-3.

## Q84. Which stat a biome's scroll favours, and the world under a sheet (the builder, 30 Oct, T1.6)

DESIGN 9.2: each scroll pickup offers one of two, one colour biased by the room's biome and one off colour; it names three stats (Vigor, Focus, Grit) but gives no biome a stat. DESIGN 9.1 pauses the sim under the pickup screen; section 2.6 has the sim ignore the movement bits under an offer while the loop keeps stepping.
As built (T1.6): the biome's stat by hue, Attic (warm browns) and Ember (reds) Vigor (a Brick down chevron, the dive's weapons), Frost (white) and Deep (blue) Focus (a Lapis up chevron, the jump's), Overgrowth (green) Grit (a Moss ring, the charms'); the offer is that stat first and one of the other two drawn from the state's generator (so the biased one always comes first: H-loot-3 counts 200 of 200). Under a scroll offer or the chest's compare the whole world waits (no enemy, trap or gravity step), every step still counts and is recorded, and only a CHOICE word moves on. The chest's compare (M1) says A weapon waits for the Darkroom. with one button, Keep the slip (TAKE).
Options: (a) as built; (b) another table of biome to stat; (c) the biased stat first only most of the time (the plan's 90 percent floor).
Recommendation: (a) until his play; the table is one line (STAT_OF_BIOME).
Plan assumes: (a); T2.5 gives the stats their effects.

## Q85. A Wallet moment outside the portal, the free play bank's rounding, and what the clear card says (the builder, 30 Oct, T1.13)

Section 1.6 says the Wallet announces first time moments to the parent only when framed, deduplicated in the save; it does not say whether a moment that happens outside a frame (the bare URL, the installed app) still counts as spent. DESIGN 8 gives free play and Level code x0.5 Dead pixels with no rounding rule.
As built (T1.13): a moment is marked in the save only when it is announced, so a player who clears a room in the installed app and later opens Shutterbug from the portal still sends first_clear on that first framed clear (once a save after that); the bank is the room's Dead pixels times 0.5, floored (a speck of 5 banks 2); the clear card says `Banked 2 dead pixels` while the strip's counter still reads the room's 5 under it.
Options for the moment: (a) as built; (b) marked on the first occurrence, framed or not (the host never hears of a first clear made outside the portal). For the bank: (a) floored; (b) rounded half up; (c) the half kept in the save as a remainder. For the card: (a) as built; (b) `Banked 2 of 5 dead pixels`; (c) a line saying free play pays half.
Recommendation: (a), (a) and (b): the half is invisible today, and the strip's 5 beside a banked 2 reads as a loss nobody explained.
Plan assumes: the three (a)s; the loop gate pins the moment rule (unframed clears mark nothing) and the floor.

## Q86. T1.9a's known answer crossed two published examples (the builder, 30 Oct, T1.9a)

BUILD-PLAN T1.9a's H-qr-1 types the 16 data codewords of the 1-M "HELLO WORLD" example (`20 5b 0b 78 d1 72 dc 4d 43 40 ec 11 ec 11 ec 11`, thonky.com's QR tutorial, alphanumeric mode) and expects `bc 2a 90 13 6b af ef fd 4b e0`. Those are the EC codewords of a different published example: the 1-M byte mode "hello world" of Wikiversity's Reed Solomon codes for coders (data `40 d2 75 47 76 17 32 06 27 26 96 c6 c6 96 70 ec`). The HELLO WORLD data's own published EC is `c4 23 27 77 eb d7 e7 e2 5d 17` (196 35 39 119 235 215 231 226 93 23). Computed: GF(256) over 0x11d with the standard generator gives each example's own EC, so no encoder could meet the plan's line as typed.
As built (T1.9a): H-qr-1 checks both published pairs, each as published; the plan's accept line carries the correction.
Options: (a) as built; (b) only one of the two examples.
Recommendation: (a).
Plan assumes: (a).

## Q87. The first ever room's twists, and when they unlock (the builder, 30 Oct, T1.5)

DESIGN 5.3 says the first free play room "always runs plain Attic rules: no biome twist, at most 2 fodder enemies, no trap field, no pocket. Biome twists unlock after the first clear." T1.5's scope is "twists disabled in the first ever free play room". T1.12 (WAITS) owns the full first room rules.
As built (T1.5): the level carries twistOff, set for a Frost, Deep or Overgrowth first room. Its slick and sticky cells are not marked, and the reach model and the sim both drop Deep's tables and gravity, so the model is never more generous than the sim. The photo keeps its biome's look (the tints) and its enemy kind: a Frost first room still has icicles, not moths. Ember's two extra specks stay too. Attic and Ember first rooms are unchanged. The first room is the first room started: ui.firstRoomDone flips when it starts, not at its first clear. A restart replays the same level, still without its twist. A second room built after an unfinished first one gets its twist.
Options: (a) as built, the movement twists off and the look kept; (b) the whole first room forced to Attic (its tints, moths, no Ember extras): "plain Attic rules" read literally; (c) (a) or (b), with the twists unlocking only at the first clear (firstRoomDone set by the clear).
Recommendation: (a) now, (c)'s unlock at T1.12, and his call on (a) against (b) after he plays the first room.
Plan assumes: (a); T1.12 takes the unlock and the enemy kind.

## Q88. The ice edge, the vines and the pipes are placeholders (the builder, 30 Oct, T1.5)

Astra's brief holds the rows world/ice_edge, world/vine and world/pipe with no size ruled. T1.5 draws code placeholders from section 7.3:
- The ice edge is two Teal rows under the plank's Ink line, in place of Frost's Pewter line.
- The vine is a 16x16 tile, Moss with Ink stems, tiled up a 1 cell sticky column in Overgrowth.
- The pipe is a 16x16 tile, Teal with Ink rings and a Glare highlight, tiled the same way in Deep.

The shots name three faults: the ice edge is a hairline at phone size; the vine's zigzag repeats every cell, Moss on Overgrowth's dark green; the pipe's rings read like a ladder.
Options: (a) Astra draws the three rows, at the sizes now fixed in SPRITES (vine and pipe 16x16, the ice edge 16 wide by up to 4 tall); (b) keep the placeholders.
Recommendation: (a). Rule the three rows READY at those sizes in Astra's next session; the cutter takes vine and pipe as existing keys.
Plan assumes: (a).

## Q89. The M1 review's calls (the builder, 30 Oct, before the M1 deploy)

An independent review (three lenses, fidelity to DESIGN, the harness and the phone, each finding then put to a skeptic) confirmed 34 findings and refuted 3 before sb-m1-1. Every confirmed one is fixed and watched red. Six of the fixes made a call DESIGN does not:
- The pocket's loot. DESIGN 6.11's "loot at the back" (Q34: specks) had never been placed. It is one speck on the hollow's back cell, counted inside CAP_SPECK (the table's 6 is per level), never the scroll or the blueprint.
- The death card on a short screen (700 px tall or less). Again and Title sit side by side and the heading is 1rem, so the card stays under half the stage. The dock is measured: the card goes low when the top dock would reach the bug's box (the stage's halfway line let the top card cover a bug just below it).
- The fleet's chrome (the music chip, pill, card and toast) is hidden under the death card too, as in play: at 320x568 the chip, seated on the title, sat on the low docked card's Again. Q48's addendum gives it back on the title and the clear card, and the clear card keeps it.
- A link that arrives by hashchange during play holds the room under the Tap to develop card (a screen named code). A code that does not open still drops the room to the title, where the refusal now sits above the buttons.
- The placeholder sprites take section 7.3's colours: the speck Amber with a Glare glint (it was Film), the open chest's slip Paper (Film), the spark outlined in Ink. H-spr-1 now holds Film to the film tab, the speck to Amber and Glare, and every danger to an Ink outline. Astra's brief already says not to copy the placeholders.
- The share sheet keeps its stage bounds, so the strip's Title under an open sheet stays the rule the loop gate holds. The card it opened over hides under it, and on a small phone Copy link stays a scroll away, as T1.13 accepted.

Refused by the skeptics, kept as notes: the Deep WALL and STICKY profiles in no lab (harness-all walks every one of their edges before a deploy); H-bot-7 reading a walk with no miss as performed (H-bot-2 asserts the same walks arrive, in the same run); the strip's Share inside the rocker's top band (the drawn zones sit 46 px or more below it; T1.14 should add #share to the layout gate when it moves the strip).
Options: (a) as built; (b) the pocket's speck outside the cap; (c) the fleet's chrome left on the death card.
Recommendation: (a).
Plan assumes: (a).

## Q90. The bottom bar: the installed app's window floors the bottom inset at 48 px (the builder, 31 Oct, NOTE1)

Stephen's note 1, from his Pixel playtest of sb-m1-1 (2026-10-31): "the buttons are behind my bottom buttons. thats fucking dumb as always." No mockup was put to him for this note. The lead's brief ships the investigation's fix A (`/home/codespace/sb-drafts/playtest-notes-investigation.json`, lens 0) as one change, on that lens's recommended defaults, which stay his calls below.

Why: every bottom control already lifted by `env(safe-area-inset-bottom)` (`--sab`), and with a 48 px inset reported everything clears the bar. Opened from the installed arcade app, the game runs in the app's standalone window, which Android draws under its 3 button bar while reporting an inset of 0: the hole Tiny World and LUMEN met on his Pixel on 19 Sep. There the rocker zones, A and B sat 10 px above the screen bottom (a 48 px bar covered 59 percent of each zone and 66 percent of each circle at 412x915, 68 and 76 at 360x780), Retake and Develop lost their bottom 14 px, and the title's build line was hidden. Which window he played in is not known yet (his first call below).

As built (NOTE1):
- `shell-navpad`, a head block right after `shell-fleet`, is the fleet's test copied from satellites/tiny-world/index.html: `?navpad`, or an Android user agent with `display-mode` standalone, fullscreen or minimal-ui, marks `<html>` `.navpad`.
- `:root.navpad { --sab: max(env(safe-area-inset-bottom, 0px), 48px); }`. `viewport-fit=cover` stays and `env()` stays the first term: a phone that reports its bar loses nothing (max never adds the two), and a browser tab is never marked, so it loses no rows.
- Everything bottom anchored already read `--sab` and follows with no script change: the title's and Settings' padding, the crop bar, the strip's drawn rocker, A and B (now 58 px up), and the fit's probe, so the stage gives rows to the floor on top of the 168 px strip: none at 412x915, 3 at 390x844 (40 to 37) and at 360x780 (36 to 33), 2 at 320x568 (22 to 20, the floor of 20).
- The layout gate holds it at four sizes under a reported 48 px inset and under the mark with env 0 (every screen's controls, the cards and the sheets end 48 px or more up), the mark with env 48 to the same values (never 96), an Android app window to the mark, and a plain tab, an Android tab and a desktop app window to the old layout. Nine redwatch rows watch it (eight on the layout gate, one on the lint).

Plan redline (BUILD-PLAN section 1.1, not edited here): the page has eighteen inline blocks; `shell-navpad` sits second, in `<head>`, between block 0 (`shell-fleet`) and `core-ns`. The lint's ORDER holds it there.

Not covered here: the fleet's music chip, its pill and its song card (`/music-unlocks.js`) anchor themselves to their own `env(safe-area-inset-bottom)`, which reads 0 in the app window. On the title and the clear card the chip can still sit 10 px above the bottom, under the bar (seen on the title at 412x915 and 360x780 and on the clear card at 320x568; the layout gate prints it as info). The fix belongs in the shared include, for every game that sets `.navpad` (Tiny World, LUMEN and this one): its bottom spots at `max(env, 48px)` under the mark, and scored 48 px higher.

His calls (the build runs on each default):
- Which window he played in: the arcade app's icon or a Chrome tab. Default: the app, which this covers. If Chrome, a shape check for a tab drawn under the bar follows, after a one time readout on his phone (the investigation's option B).
- The floor: 48 px (the fleet's) or 56 (`glyph-forge`'s). Default 48; the glyphs then clear the bar by 10 px.
- Where the 48 px goes: on top of the 168 px strip (today's rule: the stage gives the rows) or inside it. Default on top.
- A Settings row to force the lift on or off for a browser the test cannot see. Default none, until a case outside the app turns up.
- The fleet: most games opened from the arcade app have the same hole, and the chip above. Default: a fleet sweep as its own task.
Options: (a) as built; (b) the floor everywhere (a Chrome tab pays 3 rows for nothing at 390x844); (c) drop `viewport-fit=cover` (it does not fix the app window: Tiny World still needed the floor after dropping it).
Recommendation: (a).
Plan assumes: (a).

## Q91. The bottom bar after its review: the fleet's chip, pill and song card over the bar, the fold above it, and the gate's blind spots (the builder, 31 Oct, NOTE1R)

Stephen's note 1 (2026-10-31): "the buttons are behind my bottom buttons. thats fucking dumb as always." No mockup was put to him for this note (Q90), so there is no choice of his to quote for it; the fixes below run on the defaults and his calls are listed. Of his rulings tonight one touches this corner of the screen: THUMBSTICK "whole left side", a floating stick the thumb lands anywhere on the left of the strip, the bottom left corner included (sb-m1-3, not this build).

Two reviews of NOTE1 (`5edf630b1`) sent six findings. Each was put to the code and a run first (2026-10-31, the scratch in /tmp/claude-1000/sb-m1-2/review-fixes/):
1. Real. No check held the floor's env() term or the display modes after standalone: a page with `--sab: 48px` under the mark, and one whose head test names standalone alone, each passed the whole layout gate. Fixed in the gate: ?navpad with a reported 60 px inset holds every rule at 60 (the floor yields), and an Android app window in fullscreen and in minimal-ui is marked.
2. Real. The gate's mark line also failed with the page marked (under NAVPAD_FLOOR_DROPPED, STRIP_IGNORES_SAB and FIT_IGNORES_SAB), so NAVPAD_MARK_REMOVED proved nothing about the mark. The mark and the padding are two lines now, and the mark line prints the root's class.
3 and 4, one defect reported twice. Real. In the app window the fleet's music chip sat 10 px up, under the bar, on the title, Settings and the clear card (on the title it sat right on Back), and a song card waiting from another game opened at boot with Play it now and Later 30 px up, cut by the bar. `music-unlocks.js` anchors its chip, pill and card to its own `env(safe-area-inset-bottom)`, 0 there. Fixed: under the mark the three rise by what the floor adds, `calc(var(--sab) - env(safe-area-inset-bottom, 0px))`, so never twice.
   The reviews' lift alone was not enough. The include still scores its bottom seats in the bar's band, 48 px under where the lift draws the chip, and lifted, the chip landed on Settings on the title after a room at 412x871 (a Pixel 9 app window), 412x845 and 390x844, and on the first recent room at 360x780 (measured). So on the title and Settings, under the mark, the band reads as taken (`#chipsill`: transparent, a pointer cursor, which the include counts as a control) and the include seats the chip by its own scoring elsewhere: the top row beside the exit, or the right edge three quarters down after a room. On the clear card the lifted seat is the strip's reserved box, free by design, 58 px up. And under the mark the page asks the include to reseat the chip at once when the title or Settings shows (`SWSMusic.reseat`, its public reseat on demand): without it the clear card's seat stayed on the title for the include's 1.5 s and sat on Settings in a Pixel 9 app window after every room.
5. Real. At scroll 0 the title's and Settings' fold sat behind the bar: Settings at 731 to 779 at 360x780 after a room, the Level code row at 320x568 after a room, Settings and part of Try the sample room on a fresh title at 320x568, the import box on Settings at 320x568. Fixed: under the mark both screens end above the bar and pad 16 px. Scoped to the mark, unlike the review's proposal, so a phone that reports its inset (an iPhone) keeps today's layout.
6. True, and the floor's known cost, not changed here: at 360 and 320 wide the floor comes out of the room view (36 to 33 rows at 360x780, 22 to 20 at 320x568) while 87 to 103 px of strip stay empty, because the fit counts 16 px rows where those widths draw 15 and 13.3. The investigation's option D (exact rows under 384 wide) is the fix, and it moves the framing in a tab too (38 rows at 360x780), so it is its own change on his word. Until then, on 360 and 320 wide phones in the app window the room view is 3 and 2 rows shorter, and the share sheet shorter with it (about 256 px at 320x568: its head, the preview and a line before the first button).

Seen in the shots and left (the include's, or a call):
- On a short title scrolled to its middle (320x568 after a room) every seat the include scores is taken; the band ties with them at its highest score and comes first, so the chip, a 48 px glyph there, lands lifted on the Recent rooms label and the first recent room. In a tab the include lands it on content in that state too.
- The song's pill is never scored: it takes the bottom left, and lifted it sits on Try the sample room at 320x568 (in a tab, on the sample link's foot and Settings).
- At 320x568 nothing at the fold shows that the title scrolls (it falls between Try the sample room and the code row), so Settings, the code row and the recent rooms are out of sight until a swipe.
- In a tab the include's 1.5 s still applies: at 360x780 after a room the chip sits on Settings until it reseats (the at once reseat runs under the mark only).
- The include's own scoring is 34 px off for any reported inset (an iPhone's home bar): it anchors at 10 px over the inset and scores as if the inset were 0. A fleet note.

His calls (the build runs on each default):
- The chip's seat on the title and Settings in the app window. Default (a): off the bar's band, where the include scores free (at the top on a fresh title, where a tab puts it bottom left). (b) Back in its bottom left seat whenever that seat is free, by a check in the page of what the lifted chip would cover, rerun on every screen change, resize and scroll (about 15 lines). (c) The shared include learns the mark and scores its bottom seats 48 px higher, which fixes Tiny World and LUMEN too; this page then drops its lift, its band and its reseat in the same change (the gate's 58 px seat reads 106 if both lift).
- The thumbstick takes the bottom left corner, the clear card's chip seat (the strip's reserved box). Default: the thumbstick's change (sb-m1-3) decides the chip's seat on the clear card.
- Option D. Default: its own change, after his word.
- Trimming the title on short windows so Settings and the code row show at first sight (the review's optional fix). Default: not in this build.
Plan redline (BUILD-PLAN section 1.6's chip notes, not edited): under the mark the chip's seat on the title and Settings is the include's choice off the bar's band; the reserved box holds it on the clear card, 58 px up.
Options: (a) as built; (b) the reviews' lift alone (the chip lands on Settings after a room in a Pixel 9 app window); (c) leave the fleet's chrome to the include's own fix (the chip and a waiting song card stay under the bar until then).
Recommendation: (a).
Plan assumes: (a).

## Q92. The chest pays Dead pixels only, and M1 shows no sheet (the builder, 31 Oct, NOTE5)

Stephen's note 5, from his Pixel playtest of sb-m1-1 (2026-10-31): "it says a weapon awaits in the dark room. wtfd does that nmean? and i dont think i can use the fuckign thing". His ruling the same night (2026-10-31), picked from a mockup: CHEST "Dead pixels only": the chest just pays its 15 Dead pixels with a small +15 that does not stop the climb; no weapon or Darkroom words anywhere until weapons exist; the scroll offer, which also does nothing yet, stays out until M2 as well. The brief adds: the blueprint sprite, which does nothing in M1, hidden in render only.

Why (lens 4 of `/home/codespace/sb-drafts/playtest-notes-investigation.json`, checked again here): he was right twice. M1 has no weapon and no attack (`hurt()` has no caller in the page), Keep the slip and a LEAVE ran the same branch, and the Darkroom door is placed but never drawn or entered. The slip stopped the climb behind a modal to say a sentence nobody could act on, and the plan's T1.6 had prescribed that sentence. The scroll offer was the same: a second modal for a stat nothing reads (a heart needs 3 scrolls, a room has 1 and every room starts fresh), its lines promising weapons and charms.

As built (NOTE5):
- The sim is untouched. The shell answers the sim's two sheets itself, at once, on the next word (`ui.sheets`): an open offer with CHOICE A (the biome's stat), an open compare with TAKE, in the order the sim reads them (a TAKE under an open offer is never read and the world would wait for good). This is the bot's model since T1.6. The core blocks are byte for byte the same (sha256 `88a2706f98a5cd05` before and after), so every level, level code, replay and golden is too: no regold.
- The cost of leaving the sim alone: it still holds the world for the one step each answer rides (16.7 ms at the chest, and at the scroll once its offer opens). The answer's word carries no press edge, so a tap in that step rides the next word, one step late, never lost (it was lost before, under the sheet).
- The chest sounds its chest voice and a handwritten +15 (`COPY.dpGain`, `+{n}` with DP_CHEST) shows under the corner count for 1.2 s, rising as it fades and standing still under reduced motion (the setting, else the phone's). It takes no tap (it lies over A's hit area), is no modal, and a new room clears it. The count now shows the new room's 0 from its start: it showed the last room's through the next reveal (seen in the shots).
- The slip and the offer left the page: markup, CSS, COPY (`scrollOffer`, `vigor`, `vigorSays`, `focus`, `focusSays`, `grit`, `gritSays`, `slip`, `slipTake`), listeners, OVERLAYS and MODALS. T1.6's offer (an icon and a name per stat) and the M1 review's sheet rules (one sheet at a time, none over a dead room, cleared by every back and X) last lived at `4ae50f6ce`, for T2.5 and T2.7 to lift with their rows (SLIP_OVER_OFFER, SHEET_OVER_DEATH, SLIP_NOT_MODAL, OFFER_NOT_CLEARED and SLIPOK_LEAVES, retired here).
- No pick voice for the shell's own pick (the synth stays for M2).
- The blueprint is drawn nowhere and taken in silence (`R.LOOT_SHOWN`: the pickup voice answers only loot a player sees); its cell is painted the open floor as before. Placement, the level hash and the room's state are unchanged.
- The lint's rule NOT_YET: no COPY value and no text the markup shows names a weapon, a charm, a blueprint or the Darkroom ("dark room" as two words too). Each M2 task takes its word off the list when its thing lands: T2.1 weapon, T2.4 charm, T2.6 blueprint, T2.9 Darkroom.

Plan redline (BUILD-PLAN T1.6, line 877, not edited here): "the chest (15 DP plus a weapon slip; until M2 the compare screen says `A weapon waits for the Darkroom.`)" reads: the chest pays 15 DP with a +15 by the count; M1 shows no compare and no scroll offer, the shell answering both at once. T2.5 brings the offer back with the stats' effects, T2.7 the compare with the weapons, T2.6 the blueprint's sprite, each with honest words and the lint word it lifts. DESIGN 9.3's "chest 15 + a weapon" stands for M2 (DESIGN is not edited). The core's own comment on the compare ("its weapon slip waits for the Darkroom until M2") is left as it is, so the core stays byte for byte; T2.7 rewrites it.

Seen in the shots and left (his calls below):
- The +15 sits by the count, across the screen from the chest: about 380 px from it at 412x915 with the chest at the left wall. The chest's voice and the moment tie them; nothing on screen does.
- The open chest's sprite still draws its Paper slip (a white band between lid and body), and at 16 px the open chest reads as a striped box more than an open one.
- The scroll is still a pickup that gives nothing a player can see in M1: a pickup blip, then nothing.
- Every loot cell is painted the room's open Ash (T1.6's fix for the yellow ghost), so a taken scroll leaves a darker square in the light band over its plank, and a hidden blueprint in a light patch reads the same from the start. A render polish for all loot cells (their open neighbour's colour), not made here.
- This box has none of the count's handwriting fonts, so the shots show it and the +15 in a serif; a phone draws them in its cursive.

His calls (the build runs on each default):
- Where the +15 shows. Default: under the corner count (as built). Option: beside the chest in the room, following the camera.
- The scroll in M1. Default: a visible pickup with its blip and nothing after it (the brief). Options: hidden like the blueprint until T2.5; an M1 effect such as a heart for the room (lens 4's A2 (ii), a DESIGN 9.2 change).
- The open chest's slip. Default: a note for Astra's next session (chest.b without the slip, or with specks). Option: keep it.
- The name Darkroom when it arrives. Default (lens 4): keep it, shown only once the door is drawn and enterable.
- "Banked N dead pixels" with nothing to spend them on in M1. Default (lens 4): keep the line; a balance on the title is its own change.
Options: (a) as built; (b) lens 4's fix A in the sim: the chest sets no compare and an M1 sim offers no scroll (no held step, but a core change and an M1 flag in it, the harness's sheet groups and their mutants parked until M2); (c) copy only, a true sentence on the same modal (still stops the climb).
Recommendation: (a).
Plan assumes: (a).

## Q93. The chest after its review: the +15 small and in its seat, the bank names the count, a hidden blueprint drawn as its neighbour, and the loot gate's blind spots (the builder, 31 Oct, NOTE5R)

Stephen's note 5, from his Pixel playtest of sb-m1-1 (2026-10-31): "it says a weapon awaits in the dark room. wtfd does that nmean? and i dont think i can use the fuckign thing". His ruling the same night (2026-10-31), picked from a mockup: CHEST "Dead pixels only": the chest just pays +15 dead pixels with a small '+15' that does not stop the climb; no weapon or Darkroom words anywhere until weapons exist; the scroll offer, which also does nothing yet, stays out until M2 as well.

Two reviews of NOTE5 (`ccef9ebd1`, the code in autosaves `b818829d5`, `b621ac554`, `a1728351f` and `1bc108603`) sent eleven findings. Each was put to the code and a run first (2026-10-31, the scratch in /tmp/claude-1000/sb-m1-2/note5r/; the loot gate's new lines were also run against the page before, `ccef9ebd1`, and each failed there for its defect):
1. Real. The loot gate's +15 placement line passed on an empty element: under PLUS_MISSING it printed ok for a box of 0 by 0, and no row watched the placement or the reduced motion stillness for their own claims. Fixed in the gate: the placement line (and the no tap line with it) needs a real box, and the stillness line reads whether an animation moves the +15, not its class. New rows PLUS_OFF_THE_COUNT (the +15 moved off its seat) and PLUS_NOT_STILL (the stillness dropped), each RED on its own line.
2 and 10, one defect reported twice. Real, and measured: a room's own blueprint (the sample room with its top left cell Slate, whose one draw then lands on the brightest speck, (4, 33), a Sun cell in a plank's light top with Paper either side) was drawn as a square of the open Ash, 181,180,177 between Paper's 200,199,195, a darker notch cut into the plank's light top from the first frame. The gate's room is all Ash and its blueprint was set on an Ash cell by hand, so its check held by construction. Fixed in render: a hidden loot's cell is drawn as its neighbour's (`R.coverOf`: the first of left, right, above and below that is open, holds no loot and is marked as the cell is, a one way's top, a tab or an ice edge; its static pixels copied; none, and the open Ash as before). Leaving the static cell would show the Sun cell, the yellow ghost T1.6 painted out. Q92's "its cell is painted the open floor as before" is superseded. Taken speck and scroll cells keep the open Ash (T1.6's, not this change's). Placement, the level hash and the room's state are untouched; the core blocks are byte for byte the same. The gate adds that room, built as Node builds it, and holds the cell's pixels equal to a row neighbour's. New rows BLUEPRINT_NOTCH (the open Ash back) and BLUEPRINT_GHOST (the static Sun cell left), each RED; BLUEPRINT_DRAWN re anchored (the sprite on the open Ash, as before the hide), RED again.
3. Real. The line said the offer "opens on the ground" and never read the step's ground bit. The walk never leaves the floor, so a ground check there could never be watched red (OFFER_IN_THE_AIR changes nothing on a flat walk). The words went, and the gate names H-loot-3 (watched by OFFER_IN_THE_AIR) as the rule's.
4. Real. BUILD-PLAN 5.6's loot row still names the sheet by a real tap and SIM_RUNS_UNDER_SHEET, which watches the harness alone now; T1.6's Accept and Shots lines likewise. The redline is below.
5. True, and not this change's: H-pipe-10's wall clock p95 bound on a loaded two core box. It did not miss in this change's runs. Left for the stamp: rerun it alone before believing a red harness, as 5.6 says of the browser gates.
6. Real, the major. After the chest's +15 the clear card said `Banked 7 dead pixels` while the strip's count under it read `Dead pixels 15`: every M1 room banks half (DESIGN 8, x0.5 floored, Q85) and the card never said so. Q85 recommended its (b) for the card; the plan kept (a), the bare line, until his word. The +15 his ruling asked for made the bare line contradict the screen before it, so the build moves to Q85's (b): `Banked 7 of 15 dead pixels` (COPY.bankedOf, whenever the bank is under the room's count; the bare lines stay for a bank that is not). The loop gate's bank line expects it, and a new line holds the card naming the strip's count. New row BANK_LINE_BARE (the bare line back) RED; BANK_FULL_RATE re anchored, RED again. Still his call, below.
7. Real, and measured on the page before: the +15's keyframes ended 10 px up, so it rose into the count it adds to (its top 4.8, 7.7 and 8.8 px into the count's line at 0.6, 0.9 and 1.1 s, in the corner's own frame), and at 1.3rem bold beside the count's 1.05rem it was the largest text in the strip, against his "small '+15'". Fixed: it rises 8 px into its seat as it shows and fades there, in the count's own size (16.8 px), bold. The gate sets its animation to 0.18, 0.6, 0.9 and 1.1 s and holds its top at or under the count's bottom (1 px under at each), and its size at or under the count's. New rows PLUS_RISES_INTO_COUNT and PLUS_OUTSIZED, each RED.
8. True: the +15 is across the screen from the chest (about 350 px across and 290 px down at 412x915, the chest at the left wall), and the open chest still draws the retired slip's Paper band, a striped box at 16 px. Both are Q92's calls (where the +15 shows; the open chest's slip, a note for Astra) and are not changed here. Shots for him: /tmp/claude-1000/sb-m1-2/review-chest-seat/shots/412x915-plain-11-chest-250ms.png and its -zchest clip (the reviewer's), /tmp/claude-1000/sb-m1-2/note5r/shots/412x915-chest-250ms.png and its -zchest clip (this build's).
9. True: the scroll is a pickup that gives nothing a player can see (a blip, then Vigor +1 that nothing reads and the next room drops), the thing he said of the slip. Q92's second call (default: visible with its blip, the brief's); not changed. Shot for him: /tmp/claude-1000/sb-m1-2/review-chest-seat/shots/412x915-plain-22-scroll-250ms.png.
11. True, and not this change's (the reviewer ran the page before and saw the same): at 320 wide the fleet's chip has no reserved box and sits on the left rocker zone under the clear card, and a thumb lifted from Left as the room clears can open the music panel over the card. Routed to the bottom bar's owner (NOTE1R, Q91); not changed here. Seen again in /tmp/claude-1000/sb-m1-2/note5r/shots/320x568-clear.png and 320x568-app-clear.png.

His calls (the build runs on each default):
- The clear card's bank line. Default (b), as built here: `Banked 7 of 15 dead pixels`. Options: (a) the bare `Banked 7 dead pixels` (Q85's plan default); (c) a line that says free play banks half; (d) a chest in free play banks its full 15 (a DESIGN 8 change, his alone).
- Q92's calls stay open, with the shots above: where the +15 shows (default under the corner count); the scroll in M1 (default visible with its blip; option hidden like the blueprint until T2.5); the open chest's slip band (default a note for Astra).
- The same neighbour cover for a taken speck's or scroll's cell, so a pickup leaves no darker square. Default: not in this build.
- Seen in the shots here: a room whose one draw places a blueprint has one speck fewer to see and take in M1 (the blueprint is the brightest speck left, drawn nowhere until T2.6); the sample room with that one corner changed has none. Default: as built (the brief: hidden in render only, so placement and level hashes do not move).
Plan redline (BUILD-PLAN, not edited):
- 5.6's loot row reads: | loot | 412x915, 360x780, 320x568 | a real touch walks the scroll, a blueprint and the chest with no sheet, card or dialog and never modal; the shell answers the offer and the compare on the next word in the sim's order, the world held only on those steps and a tap there carried to the next; the chest's +15 under the count, a real box no larger than it, never rising into it, still under reduced motion, gone in about a second and cleared by a new room; the blueprint neither drawn nor heard, a room's own blueprint cell drawn as its row neighbours; the recording carries both answers and replays to the live hash | the twenty one loot rows, CHOICE_VIA_SHELL to BLUEPRINT_GHOST (SIM_RUNS_UNDER_SHEET is H-sim-19's) |
- 5.6's loop row adds: the clear card's bank names the strip's count it came from (`BANK_LINE_BARE`).
- T1.6 (line 878): its Accept's browser sentence reads: the browser gate `loot` walks a real touch over the scroll and the chest with no sheet, the world held only on the two answers' steps, and the recorded script carries both answers. Its Shots (`t106-scroll-pick`, a DOM popup) read: the chest's moment, shot live at both sizes.
- DESIGN: none (DESIGN 8's x0.5 stands; the card's words are not DESIGN's).
Options: (a) as built; (b) as built with the bare bank line back; (c) as built with the hidden blueprint's cell the open Ash again (the notch in a light patch).
Recommendation: (a).
Plan assumes: (a).

## Q94. The pause card: Title and Share leave the strip for Pause in the top bar, and the back gesture pauses (the builder, 31 Oct, NOTE3)

Stephen's note 3, from his Pixel playtest of sb-m1-1 (2026-10-31): "the title buttont hat leaves the game is in the wrong fucking place that ruind my run." His ruling the same night (2026-10-31), picked from a mockup: TITLE "Pause in the top bar": a pause button at the top left opens a card: Resume, Share this room, Title; a stray tap only pauses; the phone's back gesture opens the same card instead of leaving; the bottom strip holds only the controls. The brief: lens 2's fix A and fix B, every recommended default of its calls except call 6 (a room into Recent rooms when it starts: not in this build), and call 7 taken (pause when the page hides or loses focus).

Why (lens 2 of `/home/codespace/sb-drafts/playtest-notes-investigation.json`, checked again here): the strip's Title was one bare tap (`ui.toTitle`, no question) at the strip's top left, in the column a left thumb crosses to reach the rocker and over the handlerless reserved box, and Share beside it covered the rocker's top band. A Title tap throws away the climb, its unbanked Dead pixels and, for a photographed room never cleared, the level itself (no Recent entry, and the photo is released at the reveal's end). Android's back gesture left the game from a room the same way: the page had no popstate, pushState or CloseWatcher.

As built (NOTE3):
- Pause, the first thing in the top strip, before the room name: a 48x48 hit area at the strip's left end whose lower 12 px hang over the room's top left corner with nothing drawn there (call 2's default); `#top` sits over the stage, so a thumb there lands on Pause. The two bar glyph is a 28 px box inside the 36 px strip at the rocker's alpha. It shows only while the room runs (`ui.screen` 'play'): hidden in the reveal, on every card and under the sheet, keeping its place so the room name never moves. Its tap drops the focus (found in this change's own probe: a kept focus let Space, the jump key, or Enter press it again after Resume).
- The pause card (`#paused`, in the stage, centred in the room, built like the clear card): Paused; Resume (Sun, first); Share this room; Title (plain, last, one tap: call 3, the card is the confirmation). The room holds under it (the loop steps only on 'play'); the input lets go as it opens and again at Resume, so a tap on the strip under the card never jumps; Resume is instant (call 9). Share this room opens the sheet with the card hidden under it, and Close comes back to the card. The card is in OVERLAYS (every back and X hides it) and MODALS (an injected feedback fab hides under it).
- The strip holds the rocker, B, A and the Dead pixel count (and the reserved box); Title and Share are gone from it. The death card keeps Again and Title and has no Share (call 8); the clear card keeps its Share this room.
- The back gesture (calls 4 and 5): one CloseWatcher at a time, made for the screen each switch names (an accessor on `ui.screen`), the old one destroyed first so each takes a group of its own. In a room back opens the pause card (in the reveal it ends the reveal first); on the card it resumes; on the share sheet it closes it (back to the pause card or the clear card); on the clear and death cards it is Title; on the title, Settings, the crop screen and the Tap to develop card there is no watcher, so back leaves the game as before. No history entry: SWS_EXIT's `history.back` (byte locked by the lint) and an installed app's back on the title are untouched (Q62's (c) is not built). Without CloseWatcher (iOS Safari) back stays the browser's.
- A link that arrives by hashchange over the pause card, the sheet or a room's card now holds the room under the Tap to develop card the way it did over play (the screen 'code', no watcher armed there); otherwise a back there resumed the room under the card. In the reveal the link ends the reveal first.
- Call 7: a running room pauses itself when the page is hidden or the window loses focus; inside a frame (SWS_EMBED) on hidden only, as Sproing does. A resize refits the canvas under the pause card and the sheet too.
- `SB_DEV.backWatch()`, read only: the screen the armed watcher serves, '' for none.

Measured on this box (headless Chrome, not his Pixel): CloseWatcher exists; a real Escape key reaches it; a watcher made inside its own close catches the next Escape with no tap between (its cancel is not cancelable, its close fires). Another page brought in front fires a real blur and then hidden at top level; a framed game sees hidden alone, and a blur when its host page takes the focus.

Not proven here (the phone's): Android's back gesture on his Pixel, in a tab and in the installed app: mid climb a back swipe should open the pause card and a second resume, and on the title back should leave. No headless gate has the system gesture (Q62), and how Chrome on Android groups a watcher remade with no tap between two backs is the open question lens 2 named. iOS Safari has no CloseWatcher, so there back from a room still leaves.

Seen in the shots (/tmp/claude-1000/sb-m1-2/pause/shots/) and left:
- The card's Share this room is the browser's own light grey button on the card's Paper, as the clear card's is (neither card styles it).
- At 320x568 the card fills the room (260 of 267 px in the app window, 260 of 293 in a tab): a paused player sees nothing of the room, and in a tab the card's bottom edge cuts across the bug.
- On a fresh profile's first room the hint rings around the rocker and A keep pulsing under the card to the end of their 2.1 s.
- The rocker, B and A stay drawn and live under the card and the sheet (a tap there is let go at Resume, gated).
- With six hearts the longest room name, A recent room, ellipsizes at 320 wide; M1 rooms have four hearts, and it fits.
- Pause's glyph, at the rocker's alpha, is the lightest thing in the top strip; in the reveal its empty place reads as an indent before the room name.

His calls (the build runs on each default):
- Call 6, a room into Recent rooms when it starts, so no Title throws away a level made from his photo. Not in this build (the brief); lens 2's recommendation, as its own change.
- Back on Settings, the crop screen and the Tap to develop card. Default: it leaves the game as before (the ruling names the title only). Option: Title from each.
- The hint pulse under the card, the card's grey Share and the card at 320x568. Default: as built (notes above).
Plan redline (BUILD-PLAN, not edited):
- 5.6 gains a row: | pause | 412x915, 360x780, 320x568 | a real tap on Pause opens the card and keeps the room; the room holds under it unheld; Resume, Share this room (its Close back to the card) and Title; a tap under the card never jumps; the back gesture by a real Escape in a room, on the card, on the sheet, on the clear and death cards, in the reveal, on the title and under the code card; a hidden page and a lost focus pause the room, a blur inside a frame does not | PAUSE_LEAVES, PAUSE_RUNS_SIM, PAUSE_KEEPS_FOCUS, RESUME_KEEPS_EDGE, PAUSED_NOT_OVERLAY, PAUSED_NOT_MODAL, PAUSE_ALWAYS_SHOWN, SHARE_CLOSE_TO_PLAY, the seven BACK_ and CODE_ rows, HIDDEN_NO_PAUSE, BLUR_NO_PAUSE, BLUR_IN_FRAME_PAUSES |
- 5.6's layout row adds: Pause 48x48 at the top strip's left end, on top at its centre and over the room's corner, its glyph inside the strip; the strip holds no control but the rocker, B and A (TITLE_BACK_IN_STRIP, PAUSE_OVERHANG_UNDER). Its loop row: the room is left by Pause and the card's Title, and X_LEAVES_OVERLAY's path is a refused link that arrives with the sheet open.
- 5.8 gains a row: Stephen's Pixel 9, Chrome and the installed app: a back swipe mid climb opens the pause card and a second resumes; back on the sheet closes it; back on the title leaves; an app switch mid climb comes back paused.
- T0.8a's "two Title buttons (fixed)" and T0.8b's Title above the reserved box are superseded. T1.14's strip geometry: where Title and Share live is settled here; its gamepad and the thumbstick (sb-m1-3) stand. Section 1.6's rule holds: the card's Title is an internal screen switch that hides every overlay.
DESIGN redline (DESIGN.md is a verbatim copy and is not edited): the frame layout row's "top strip 36 px (room name, hearts)" reads "top strip 36 px (Pause, room name, hearts)"; 4.1's "never over the play area": Pause's hit area hangs 12 px over the room's top left corner with nothing drawn there (call 2's default; lens 2 named this reading an interpretation); 2's "the thick bottom strip is where the controls live" holds, and now holds only them.
Options: (a) as built; (b) TOP_STRIP 48 instead of the overhang (a view row lost at 390x844, 360x780 and about 412x800); (c) a history entry instead of CloseWatcher (Q62's (c): the first exit tap after a room is swallowed unless the title forwards it).
Recommendation: (a).
Plan assumes: (a).
