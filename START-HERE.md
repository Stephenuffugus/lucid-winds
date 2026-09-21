# START HERE

**When Stephen says "lets get started", read this file first, top to bottom, before anything else.**
It is the board. It is short on purpose. Update it in the turn something changes, not at the end of a session.

_Last updated: 2026-09-21 (Fable): Tiny World Design 18 is written from his six outside reports and waits for Opus; the Tumble see-everything switch is LIVE as 20260921a for his review; he answered the plan (backup YES, originals first, bundles parked, Dewball is a release candidate)._

---

## ⏭ SEP 21 PLAN: PLAY CADENCE, NEXT LISTINGS (TUMBLE, THEN DEWBALL), THE MUSIC LOCKER, HIS HOME ADDRESS

**Read `plans/PLAY-CADENCE-AND-MUSIC-PLAN-SEP21.md`** (his answers are its top section; both messages verbatim in
§9 and §9b). Build work = **`OPUS-PACKETS-SEP21.md`**: A ✅ DONE · B save-key inventory · C candidate audit
(ORIGINALS ONLY) · D Play package factory · H Dewball Meshy asset pass (manifest → loader + gate → 30 credit
pilot → his yes → batch) · E Functions Node 20 → 22 before Oct 30. B to E and H: NOT STARTED.

- **✅ TUMBLE `20260921b` LIVE: SETTINGS > TESTER > "OPEN EVERYTHING"** (a button IN the game, shown only with the
  tester key; "Put my save back" beside it once a backup exists). Built because the LINK did nothing for him (he asked
  four times): `lucidwinds.com` and `www.lucidwinds.com` both serve the site with no redirect = TWO ORIGINS, two saves,
  two tester flags; and the first visit after a deploy runs the OLD cached modules. Proved on the LIVE site, both
  hosts, worker on, real tap, save read back (`dev/probe-live-tester.mjs`). The link still works too:
  `https://lucidwinds.com/satellites/tumble/?unlockall=1` (backs up his real save once, then every item, page,
  peg and hero sock, 99,999 Lint, 999 Quarters; Reunions never faked; his difficulty untouched unless
  `&tier=0..8`) · back again: `?unlockall=restore`. ⛔ ON A PHONE THAT HAS PLAYED TUMBLE BEFORE, OPEN THE LINK, CLOSE THE TAB
  FULLY, OPEN IT AGAIN: the first visit after a deploy runs the OLD cached code (told to him Sep 21 after he asked
  three times; the self-reload fix waits for a moment when Opus is not using both cores). A player who types it gets nothing. Node 13/13, unlockall
  gate 20/20 (reads IndexedDB), step1, live probe green, shots looked at. **NEXT ON TUMBLE = HIS: review notes,
  six radio songs, name + price + target age, store art; then the workbench gate comes off and it lists.**
- **HE SAID (Sep 21):** backup YES and it must also survive SWITCHING DEVICES · card and board games NOT now
  ("we will bundle them way later") · unique games first · "a ton of great assets for dewball and release it"
  with Meshy premium · ChatGPT and Grok idea reports for Tiny World are coming · a studio pass maybe later.
- **Still only my recommendation (he has not answered):** one listing a week, ramping on a clean record, never
  daily. He wants the next submission SOON ("over a week since FTW was submitted").
- **HIS, forced:** home address (and check the PHONE) off the Play listing: new business address → state →
  Dun and Bradstreet → Payments Center; do not submit apps while unverified · LLC bank swap before ~Oct 15.
- **✅ TINY WORLD DESIGN 18, "THE LIVING DAY", IS WRITTEN AND WAITING FOR OPUS (tiny-world `ac54cba`, nothing
  built).** His six outside reports (three Grok, three GPT) are kept whole in
  `/workspaces/tiny-world/design-runs/sep21-exp3/reports/`; `MERGE.md` says what was taken and why; the spec is
  `DESIGN-18.md` (truth pass, 16 engine tickets, about 95 rows, the named animal, the village, the ship gate) and
  `DESIGN-18-CONTENT.md` (five packs, 39 new things with personalities and abilities; ONE tag spent, `bug`).
  **He starts Opus with the prompt at the bottom of `/workspaces/tiny-world/HANDOFF-OPUS-DESIGN-18.md`**, in a
  session opened in that repo. The one idea: everybody in the world has a day (a bedtime, a place they go, a night
  that belongs to somebody else). **HE RULED (Sep 21, tiny-world `ac54cba`):** NOTHING leaves a first shelf ("why cant we have octopus"): the new
  things are ADDED beside their like (pillow + bubble wand, otter + goose, star cape, rubber chicken, bubbles) and
  the shelf law goes from 12 to 16; twelve fireflies is right; the goose chasing people is funny.
  STILL HIS: the Safe toggle on the child's first Powers shelf (he asked what the issue is; answered; no ruling).
- **Waits:** Packet F (backup + music locker: waits only for B's inventory, then a design he sees first).

---

## ⛔⛔ URGENT, NEXT SESSION: PLAYERS LOSE WHAT THEY UNLOCKED WHEN BROWSER DATA IS CLEARED (Stephen, Sep 19 2026)

**His words:** "I cleared the last 15 minutes of my browser data and I lost my unlocked songs in my whole game studio and
everything so that's going to need to be addressed immediately so players don't lose stuff. We're going to need a better
way to back up their account information to their phone or to our servers or something, but it needs to be saved for
people so when they unlock stuff it stays unlocked. Even if they clear browser data and stuff that they shouldn't be
losing stuff."

**What is known (checked Sep 19, not yet designed):**
- Music unlocks live ONLY in the browser: `music-unlocks.js` keeps `localStorage.sws_music_progress` (the source of
  truth, per game slug) and `sws_game_unlocks` (the ledger, rebuilt from it). Clearing site data for lucidwinds.com
  erases both; nothing restores them. (The file mentions a "cloud restore" only for `sws_music_revealed`; find what
  that is before assuming any cloud copy exists.)
- "The whole game studio" = the other games' progress, also per-browser storage (localStorage / IndexedDB per game).
  Tiny World's worlds (IndexedDB `tw`) have the same exposure: its only backup today is ☰ Save to file.
- Firebase exists (project focus-grove-fffa8, Auth + Firestore `vaults/{uid}`) for Lucid Winds itself; whether the
  arcade games can use it, and how a player signs in without friction (kids' games: no required account), is the design.

**What the next session must do first:** list every key the arcade games write that a player would miss (unlocks,
progress, worlds, settings), then propose ONE fleet-wide backup (server copy tied to an account and/or a device
backup file / passkey) to Stephen before building. Laws that apply: no approval gates in play, nothing paywalled,
STRIPE ONLY on the web, kids' privacy (no personal data without need).

---

## TINY WORLD: THE LAST DESIGN AND BUILD OF TEST 2 IS DONE AND LIVE, stamp `20260921e` (Fable 5.1, the night of Sep 20 to 21)

⏭ **START AT `/workspaces/tiny-world/HANDOFF-FABLE-SEP21-NIGHT.md`**, then the top of `STATUS.md` (the review
table), then `design-runs/sep21/DESIGN-17.md` with its three judges and `REVIEW-NIGHT.json`.

**Live now: `20260921e`, tiny-world `e6e75a3`.** He should close the tab fully and reopen once. Door `wolfden`.

**What his daughter finds:** her finger is heard (the eighth trigger, `poke`: a hen lays, the egg hatches into
whoever laid it, a tree drops a squirrel, the wolf howls, a house answers a knock, anybody she has NAMED gives a
heart, and every thing at all wiggles and clicks) · giants (a mushroom bite, 45 seconds, a giant's blow flings and
never hurts, Bless is her undo) · fetch with a ball · **HIS NOTE, DONE: a painted zone founds its own village,
feeds itself and grows to a town with nobody touching it**, and the opening world has a small yard so her own two
people do it in front of her · the opening is composed as a place, LOOKED AT at both phone sizes · the day has a
shape (dawn drink, dusk fireside, the moon cat) · **GUST** on the first shelf of Powers (hats fly off downwind,
everybody hops back, fish rain over a pond; it took Lightning's place on the shelf, HIS CALL, one line in tray.json)
· gear that does something (sheep suit, flower crown, pirate hat
and parrot, wizard hat, water bucket). 100 live rows (51 new), 8 triggers, 29 verbs, 232 fixtures and 311 mutations, save v11.

**What was wrong that nobody had reported** (the full table is in the handoff §2): three of the rows shipped the
night before printed their sentence and NOBODY MOVED (their fixtures asked only whether the row fired; every verb
now reports what it changed and the suite ends with the law `rows-all-happen`) · the fault that parked
`landIsArriving` was a stale tile mark, never that flag (it is ON) · a building job belonged to a dead worker for
ever · a village with no berries could never build the field that would have fed it · the opening world became a
carpet of 60 ducks and 39 people · a meet row had no real distance test (the goat ate her crown from five tiles
off) · `sim-coverage` red for days, green now. Then an independent four lens review of the night's diff found 24
more, every one confirmed by a second reader, all 24 answered (STATUS.md top).

**HIS CALLS (none blocks her playing):** how many wolves · whether a giant wolf or zombie is welcome (never hurts,
Bless undoes it) · whether the painted yard in the opening is wanted · the people hunt the hens (72 deaths in 30
untouched minutes, it was 318 before tonight: the ecosystem is his, I did not touch it).

**Left:** `gc-check` meadow 1.9 KB a step (not in `npm test`, red before tonight), B4 + C6
(show only with Safe off). Not built on the judges' advice: trough, dock, watering can, net, nest, snowfall.

### The Sep 20 pass, for the record

Nine notes from his own play plus three from his tester, all fixed, deployed and looked at. Truth is
`/workspaces/tiny-world/STATUS.md` (a table of every note, what it really was, and the flag it sits behind).

The five that mattered most, because each was a whole class and not one bug:
1. **The tray could never put gear down at all**, so no combo that needs A next to B was reachable from the
   tray. That is why every hat failed on the snowman. And the opening scene ate its own snowman before the
   first frame, because the hat was inside the reaction's radius.
2. **Meat eaters starve where they stand**: a hunter has no food thing in the world and could see ten tiles.
3. **The whole game could hold only ONE dawn row**, so the troll turning to stone could not be built as data
   even if someone had tried. Fixed, and trolls now do it.
4. **The catapult was unreachable by every player action**, and its fixture passed on a phantom event only a
   brand new world gives. The dog's toy, the bird's crown and the bounce pad all announced themselves and did
   nothing at all.
5. **A newborn's breeding cooldown was zero**, so two people became sixty in ten minutes.

Second pass added: the fence goes both ways from one tray tile (his tester's note 3); a reaction that reaches
nothing steps aside instead of claiming the trigger, which is what let one row swallow every storm row and
announce itself 469 times in a world with no lava; the lute and lantern keep working instead of firing once; the
chef cooks; cooking means something; the scarecrow guards a field; the menu has an X; the place hints stopped
lying about dragging; the News setting was a dead box until you tapped Sounds first.

⛔ STILL OPEN: `sim-coverage` red at 9 blocks (25 before this session, 67 with the old scenes against the new
code); seven of the nine are C2's storm internals. The opening screen is still props scattered on a lawn with
hard rectangular terrain edges. Eight more items ranked in the handoff.
⛔ `dev/live-look.mjs` opens `?seed=42` and the starter scene is gated on there being no seed, so every look
shot ever taken of this game was an empty green lawn. Use `dev/look-sizes.mjs` or no query.

## TINY WORLD: THE WHOLE BUILD (T1 to T14) IS LIVE ON THE ARCADE, Sep 20, stamp 20260920e

Jessie is playing it and "loving it so far" (his words, Sep 19 evening). He ran the bench world on the Pixel for a
couple of minutes: "a lot going on but it all seemed to run smooth".

T1 to T8 of the design/14 expansion are done, merged and live. T8: everything notable that happens now leaves a
record, a sparkle lingers where it happened, a tap on it shows a picture card (this + that -> that), the status line
says it in words, and a creature that changes its mind wears the reason over its head for a second. Next: T9
reactions, then T10 gear, T11 names and graves, T12 Scrapbook, T13 village flag, T14 test build.

## TUMBLE (new game, overnight Sep 16→17): LIVE ON THE PORTAL AS 20260917n (review fixes, his and Jessie's notes, real music path, Play ready, Load variety, 32 motifs)

**FABLE 16:20 UTC Sep 17, review of Opus's build (`HANDOFF-FABLE-TUMBLE-SEP17.md`): 20260917h IS LIVE.** Node 11/11.
All nine gates rerun one at a time on the untouched 20260917g build: eight passed, **review failed one check twice**
("no play HUD in the room"). `dev/probe-hud.mjs` proved it a gate flake, not a game bug: the hide class lands at the tap,
Chrome starts the CSS fade two or three frames later, and one frame took 5.9 s on the software renderer. Gate hardened
(assert the class at once, wait for the settled opacity). Faults fixed, gated (input suite watched fail 6/8 then 8/8;
step3 and review gates green on the fix) and **deployed 16:19 UTC as 20260917h** (main = branch 6d0ae920; live page,
worker, input.js and the portal card `?v=` all verified by curl):
1. **A still press of 320 ms or longer on a sock did nothing** (319 ms = tap, 321 ms = nothing). Now a still press that
   lifted nothing is a tap at any length; a slow press never opens a double tap.
2. "Reunion!" x3 lost its exclamation points (copy law).
3. The worker precaches the maskable icon the manifest lists.
**16:30 UTC HIS FIRST PHONE NOTES** (verbatim + sorted in `HANDOFF-FABLE-TUMBLE-SEP17.md` §10): "so far this looks fantastic";
faults = the held sock hides its match and the match cannot be tapped; the dragged ball floats above the thumb; a firm
second finger press over 320 ms did nothing. His direction = binning "more fluid". Already by design = holding a sock
and dropping it in the Bin or basket counts the same as tapping (Bin: zero points either way; basket drop = a tap shot,
never a long shot). Answers = the music is a Web Audio synth placeholder (no files exist; his beats go to the private
music repo and replace the radio); Play Store listing = his decision, FTW's TWA pipeline applies (`com.skywolfstudio.tumble`).
**20260917i IS LIVE (17:29 UTC, main = branch 818a9877)**: pocket at 85% + a peeking table sock wins the tap; ball drawn
under the thumb; one motion binning; still second finger = tap. Node 11/11; step3 gate grew two checks, both watched RED on
the old code (the held sock flipped instead of fetching the twin; the ball drew 155 px above the finger) and green on the
fix; review gate green. Tour 3 (61 shots) looked at: polish holds, every silhouette held reads right, the old 80% pocket
covered the mat's bottom band in every held shot (his note, seen). Live page, worker, play.js, input.js and the portal
card `?v=i` verified by curl; `dev/probe-live.mjs` all passed on i (worker sw.js?v=20260917i, 48 cached entries, a Load starts, no console errors); `dev/probe-portal.mjs` finds the card with `?v=20260917i` and a real tap reaches it.
**17:58 UTC 20260917j LIVE, the "keep going" layer** (all gated, each gate watched red first): the radio plays a real file
when a station carries `look.url` (his beats = a data change + files in the private music repo); the Meshy GLB loader is
proven with real GLB fixtures (`dev/gate-glb.mjs`); `satellites/tumble/privacy.html` is live with the email showing on
the served page; `store/tumble-play/` holds the Play Console sheet (his calls marked STEPHEN: name, price, target age;
⛔ blocker: the workbench gate must come off before a reviewer can open the game), listing copy and the TWA manifest. **18:05 UTC 20260917k LIVE:** the manifest is `manifest.webmanifest` (fleet
convention) and `scripts/twa_ready.mjs tumble` reads ready to list (9 ok, 1 warning), so the Play road is open the moment
he makes his three calls and the gate comes off. 18:12 UTC: `dev/probe-offline.mjs` proves the reviewer's offline
cold launch (worker installed, server killed for real, the room boots at k, no errors).
**18:40 UTC HIS SECOND NOTES + 20260917l LIVE:** "a load with 20 that had 4 pairs of white and green socks" = a real
generator fault (random base draws + 34 degree colour decoys at his tier): fixed and live as l (base designs spread
across families and the hue wheel; low tier colour decoys 67 degrees apart; `tests/variety.test.mjs` 1/18 → 18/18).
**MESHY:** `MESHY_API_KEY` works here (2,640 credits, 20 spent). Text prompts give standing socks or rags; **image to 3D
from a reference picture gives the L sock** (922 tris). Road = his Midjourney flat lays per silhouette → image to 3D →
`tools/fit-glb.mjs` (orient, size, cylindrical UVs; being written) → drop in. His "wide assortment of patterns and characters": **the motif bank is 32 shapes, LIVE as 20260917m** (19:20 UTC; looked at on three
sheets; devpages gate green; live probe green). `tools/fit-glb.mjs` fits a Meshy GLB to a
silhouette (orientation, size, cylindrical UVs); the pilot crew sock (Meshy image to 3D from a rendered reference) is fitted and LOOKED AT held in the game: a
real rounded sock with the pattern wrapped on it. All eight silhouettes went through (40 credits, 2,585 left) and were LOOKED AT held:
crew, knee, novelty good, toe passable, ankle, baby, slipper, dress WORSE than the placeholders (my capsule renders are
weak references; Meshy inflates them). **Production keeps the placeholders. His Midjourney flat lays are the fix**: the
picture spec is in the handoff §10.7; 40 credits and one gate run turn them into game meshes. He is picking beats.
⛔ DISK: the agent worktree tried to copy the 9 GB repo onto a 2.9 GB volume (his <1% warning); npm + gradle caches
cleared → 3.7 GB free; scratch work lives on /tmp (34 GB). Old Claude session transcripts (2.6 GB in ~/.claude) are his call.
His phone: close the TUMBLE tab fully and reopen once after each deploy; the worker installs the new stamp under the old
one and says "a new version is ready".
Tour: Opus's 53 shots looked at; the game reads well, the art is placeholder (his Meshy job). The old tour had bugs
(shots 27 to 29 were the pause menu; Spin Cycle fired with 1 dot): fixed, tour3 rerunning now with 8 per silhouette
held shots and a 360 wide Rush. Taste calls for him: Rush powers column crowds the basket rim; tap-a-twin latency ~0.6 s;
flick from 3 coalesced samples is fine at 120 Hz (p90 aim error 5 degrees, measured), noisy only at 240 Hz; atlas partial
upload is 256 GPU calls per tile. Memory: `project_tumble_fable_review_sep17`.

Stephen's ask (06:00 UTC Sep 17): build TUMBLE, the cozy 3D sock game, from his DESIGN.md + OPUS_PROMPT.md, "impeccably",
while he sleeps; Fable checks it in the morning. It lives in `satellites/tumble/` (the brief's layout inside that folder),
committed and pushed; **deployed to main at his request on Sep 17 14:05 UTC** (TUMBLE files only; Jimothy untouched). Truth: `satellites/tumble/HANDOFF.md` (status, what to check, next tasks) and `DECISIONS.md`.
Run it: `cd satellites/tumble && python3 -m http.server 8080`. Tests: `npm install && npm test`; gates: `sh dev/run-gates.sh`.
**Fable start prompt: `FABLE-START-PROMPT-TUMBLE.md`.**
**14:46 UTC: TUMBLE IS ON THE PORTAL** (Test Lab, Step inside, In Development) for him and other testers.
**14:40 UTC: TUMBLE IS LIVE** at https://lucidwinds.com/satellites/tumble/ (behind the workbench gate, his tester key),
version `20260917g`, for his phone test. **Fable: read `HANDOFF-FABLE-TUMBLE-SEP17.md` (repo root) first.**
**14:00 UTC: POLISH PASS DONE** (his ask: "polish the game and everything"): about 90 fixes from a 51 shot tour and six
critics (room, table, sheets, copy, sound and feel, accessibility); HANDOFF section 4c. 
**10:40 UTC: RUN COMPLETE.** Steps 1 to 8 built; a 42 agent review found 38 issues, all fixed (incl. a Rapier panic,
ball flicks that were never launching, and a sub frame flick that froze the game). Node 11/11, all nine browser gates
pass, perf numbers in HANDOFF section 4. **Biggest open item = HIS THUMB:** flick strength is tuned from headless math;
on the Pixel open `?load=laundry&debug=1` (the overlay prints the last flick) and try `&shotgain=2.6` if balls fall short (default 2.3).

---

## 0g. JESSIE'S TUMBLE NOTE 21:50 UTC Sep 17 (via Stephen, verbatim): "the instructions move too fast and she didnt get to
read them as they popped up, she wants a click to continue on those" → **FIXED, LIVE 20260917n (21:50 UTC, main level):** teaching hints stay
until a 48 px Got it tap; every timed hint lasts 1.8 s + 55 ms a character and dismisses on tap; sheets and the room clear
hints. Gate `dev/gate-hints.mjs` red on the old code; step4 + review green; probe-live green. Her next launch picks it up
(close the tab fully, reopen once).

## 0f. HIS NOTE 21:00 UTC Sep 17, VERBATIM: "i just got a complaint form someone random that says they cant type games in
from leop in the portal" → **REAL FAULT, FIXED, LIVE 21:20 UTC (main 104d82a8). THE FIRST ORGANIC REPORT FROM THE BIG BUTTON.**
The stored report (Firestore `feedback`, 20:56:05 UTC, Discord ping ok): msg "[bug] I can not type games in — from Leo
[portal]" ("leop" = Leo + the portal tag), game "Not a game", **no contact address**, ua = **desktop Safari 15.6 on macOS
10.15 (a Mac, not a phone)**. Cause: both portal search boxes carried a readonly-until-focus autofill trick (Aug 21,
against saved email autofill). WebKit fixes a field's editability when it takes focus, so lifting readonly inside the
focus handler leaves the box dead until it is focused again; the same trick also blocks the keyboard on iPhone. Headless
Chromium typed fine, so no gate saw it. Trick removed, autofill attributes stay. Gates: `portal/dev/probe-search-typing.mjs`
(readonly false at rest + real tap + real typing, red on the old page, green live) and `portal/dev/probe-feedback-typing.mjs`
(the big button itself opens and takes every letter, 8/8 live). ⛔ Earlier note here said "iPhone"; corrected 21:40 UTC.
Also in the collection, unanswered: Sep 7, a stranger on Android in Sudoku: "Feedback button is in the way of the screen".

## 0e. 20:50 UTC Sep 17: TUMBLE ASSET LIST DELIVERED as a Google Doc in Drive Github / tumble (folder
`1ilLNYWV5P-xiNoFFtTM3SK_d2BOxkrs9`, doc `16FP7CNa4S5uWk-lceteNetc-82R8ZIoVe72jE8ldoGc`; repo copy
`art-asset-lists/tumble/01-tumble-asset-list.md`): A = eight sock flat lays for Meshy (first), B = five prop references,
C = key art, card thumb, icon, splash, D = his six beats. He zips the folder into `assets/` when done. Next game timing:
Play has no wait between apps for an org account (review 1 to 7 days; FTW took 3); Steam needs a new $100 app fee, a store
page review and at least two weeks of Coming Soon before release.

## 0d. HIS CALL 20:05 UTC Sep 17, VERBATIM: "its the floating button thats kind of in the way, you can move it but its still a
little bit of a pain but it also comes with all the classical music and stuff which may be off putting so we should just
have the music from this game in there with the little icon up top that fit nicely" → FTW: its own music only (no Logic
Den family shelf), no floating card, the small top icon stays. **DONE, LIVE 20:20 UTC (main 94578f96, shell v20260917a):**
the fleet music include is out of FTW's page; FTW keeps its own soundtrack (his Suno tracks under sfx/), its ♪ HUD mute
button and its playlist settings. check.js has the law (378/378), `dev/probe-fleet-music.mjs` proves it headless (both
red first), Play readiness still ready, live index byte identical to the tree. The installed Play app picks it up on its
next launch (no store upload; the TWA is the live URL).

## 0c. HIS NOTE 19:55 UTC Sep 17, VERBATIM: "omg i just bught ftw and it still has the music from the arcade in there. not
sure how i feel about this. maybe its not so bad" (bought FTW on Play, saw the fleet music unlock system inside the app;
his call; facts below in the reply, recorded in HANDOFF-FABLE-TUMBLE-SEP17.md §10.9)

## 0b. HIS BRAINSTORM 19:45 UTC Sep 17 (verbatim + sorted in HANDOFF-FABLE-TUMBLE-SEP17.md §10.8): TUMBLE heroes should
UNLOCK BY PLAYING, not cost Quarters (his lean; data change, waits for his yes); recognizable culture on socks = holidays,
foods, decades, sports, never real IP (DESIGN 6); FTW menus want a simplify + info box pass in a FRESH SESSION (a TWA
updates from the web, no store upload); Jimothy assets also a fresh session.

## 0a. FLOCK THE WORLD IS LIVE ON GOOGLE PLAY (found Sep 17 ~16:00 UTC by Fable)

The "rating email" he got at 14:06 UTC is IARC's **Live Rating Notice** (Global Rating ID 70dc4f46-12c0-8a7a-84b0-3f94ceef646a,
storefront Google Play). IARC sends it when the rating goes live WITH the listing. Checked: 
https://play.google.com/store/apps/details?id=com.skywolfstudio.flocktheworld answers 200, shows Flock the World by Sky Wolf
Studio, $0.99, Everyone 10+, No ads. **Publishing is done; promotion can start.** No Play Console "published" email had
arrived by 16:00 UTC (only the IARC one). His next: open the listing on his phone, buy one copy himself to see the
purchase flow, then the FTW promo line from `docs/JIMOTHY-LAUNCH-KIT.md` style, one paste a day.

## 0. JIMOTHY STEAM, FIRST REAL INSTALL (Sep 16 afternoon EDT): FIXED, WEB LIVE, BUILD r5 IN THE VAULT FOR HIS UPLOAD

**✅ 21:20 UTC: FABLE AUDIT DONE, HOLD LIFTED: UPLOAD r5 AS IS.** Every item in `AUDIT-OPUS-SEP16.md` was re-run
by Fable alone: gamepad-check 65/65 (old code fails 37 then aborts, pre-review code fails the 11 review laws),
jimothy-check 60/60, sw-lockout 25/25, 16 shots looked at (web and store views), the revive confirm driven by pad
with caps in the bank (A twice never spends), r5's asar byte-equal to a fresh vendor of the tree, r5's shell
byte-equal to r4 except the asar hash. Blockspace, Whistlestop, Lane D, the art page: all green, plants red.
ONE thing no machine can check: the Afterglow's id must match `nintendo()` in the pad code; if it does not, r5
behaves like r4 on that pad (Y selects) and the Settings swap cannot rescue it. Stephen confirmed he played with
Steam Input OFF (pad reaches the game raw), which is exactly the path r5 fixes.
**22:45 UTC: r5 UPLOADED by Stephen (standard, not merge), depot built, ManifestID 2990549969644802754.** 22:55 UTC: he uploaded r5 but only the DEPOT was built; the BUILD needs a second click on the upload page (the Builds list showed only r4, which is what "current and next BuildID are identical" meant). He redid it; r5 went live.
**23:05 UTC: r5 PASSED HIS TEST on Jessie's laptop** (pad better, achievements pop, the game crisp). Two left, both FIXED by Fable (`224ac364`), web LIVE as v9.1:
- menus fuzzy until the cursor moved: every screen/button swooshes in with a transform animation, Chromium draws that layer at native size and never redraws when it ends; now animationend gives the element a one-frame no-op change → feedback_scaled_stage_menus_fuzzy_after_swoosh
- the pad could not walk the song list or take a song out of the rotation: the gold note is a target (Right from the row) and a cursor whose element was rebuilt stays put.
**00:15 UTC Sep 17: r6 IN THE VAULT** `jimothy-steam-build-20260916-r6-menus-soundtrack.zip` (sha256 4d15fe74fc9f0421…, 355 MB, 93 files, exe at root, same file list as r5). electron_boot OK, runtime_preflight 5/5, gamepad-check 72/72 (5 new laws red on the old page), jimothy-check 60/60. NOT seen on Windows; the menu sharpness is for his eyes.
**00:40 UTC Sep 17: r6 live, tested: v9.1 shown, MENUS STILL FUZZY.** The swoosh nudge was the wrong layer. Real cause: `translateZ(0)` on `#stage` made the menu a GPU layer the compositor resamples. **v9.2 (`stageOnGpu()`, plain scale on desktop/store) web LIVE; r7 packaged** → feedback_scaled_stage_menus_fuzzy_after_swoosh.
**01:05 UTC: r7 (v9.2) tested: title and Prize Bin STILL soft; moving the mouse on Settings/Music blurs everything for a moment.** That is the tell: any transform ANIMATION becomes a layer drawn at the window's native size and stretched to the stage's scale; a transform on the stage never reaches those layers. **v9.3: the stage is sized with CSS ZOOM on desktop/store builds** (`stageByZoom()` in fit()), applied at layout, so nothing is ever a stretched picture. Web LIVE v9.3; **r8 in the vault** `jimothy-steam-build-20260917-r8-zoom-stage.zip` (sha256 7626cfbb…). gamepad-check 73/73 (desktop law asserts zoom), jimothy-check 60/60, shots at 640x1136 and 1920x1080 looked at, layout unchanged.
**01:35 UTC Sep 17: r8 (v9.3) LIVE ON DEFAULT AND PASSED HIS TEST: "omg it finally doesnt look like complete shit."** Left, his call, after Friday: Prize Bin card text is small at the default window size (F11 / Alt+Enter or a taller window fixes it today; a desktop-only CSS bump is the small safe change).
**02:30 UTC Sep 17: TRAILER REPLACED by Stephen.** Both 16:9 renders had a hidden pixel-shape flag (SAR 963:2200) from the phone capture, so every player squashed them while single frames looked fine (that was the Sep 4 "stretched" rejection, and he was right). Fixed by re-encoding with square pixels: `jimothy_trailer_1080p_square.mp4` in vault-20260904 (1920x1080, SAR 1:1, DAR 16:9). He watched it on the laptop ("that looks good"), uploaded it with the poster and PUBLISHED (03:40 UTC: "video is live"). At 02:30 UTC the store page showed NO trailer yet (Steam still encoding; an hour or two). Check: the DASH manifest for app 5043360 must show sar 1:1 → feedback_trailer_sar_flag_squashed_playback.
**OVERNIGHT SEP 16→17, FABLE'S VERDICT: NO UNATTENDED BUILD RUN.** Lanes A to D are done and live; what is left on every board is HIS: the twelve's art and audio, DIRECTOR-CALLS §B to §I, §5 below, the math card art, Strata's row, Whistlestop C12, CAIRN (cut by the catalog plan). Jimothy is FROZEN until he presses Release App on Friday: no change to satellites/stream-hop or store/jimothy-steam, no upload. A builder running all night on a 2-core box at 90% disk two days before launch would only make things he must then review. The two objective, fleet-wide nits in §5 (the CORE settings gear 8 px from the edge, NOTCH's blue focus ring) are the only unattended-safe build work, and only with his yes. If he says yes, the prompt for Opus is:
```
You are Claude Opus in /workspaces/lucid-winds on branch add-sproing-jumper. Read START-HERE.md top to bottom, then HANDOFF-OPUS-SEP15.md sections 6 and 9. Build ONLY START-HERE section 5 items 5 and 6: the CORE settings gear off the right edge, and NOTCH's blue focus ring. Fence: satellites/math/** and satellites/notch/** only. Do not touch satellites/stream-hop, store/, portal/index.html beyond those games' rows, or anything else. Jimothy is frozen until Friday. One browser at a time, gates green, plants red, shots opened and described, commit and push the branch after each item, deploy with git push origin add-sproing-jumper:main only after git log HEAD..origin/main is empty, then write a report in HANDOFF-OPUS-SEP15.md section 10 and stop.
```
**HIS NOTES 03:15 UTC Sep 17, VERBATIM:** "jessie went to google the game and meta critic popped up with a horribly dumb message it looks like a published and im on game faqs too so we really need to clean up the seo and stuff. i just had someone else email me saying they wont featutre me or anything"
Sorted: (a) Metacritic and GameFAQs auto-create pages for any Steam app with a release date; the "dumb message" is most likely their placeholder text (no score / tbd) or a scrape of the store's short description → check what each page shows and where the text comes from. (b) SEO cleanup = the Steam short description (add raccoon), the store's About text, and the web page's meta, all of which the aggregators scrape. (c) A curator/press reply declined to feature. Not a Friday blocker; a Thursday list item.
**CHECKED 03:20 UTC:** metacritic.com/game/jumping-jimothy/ exists (developer Sky Wolf Studio, 2D Platformer, scores tbd) and its description is WRONG and not ours: "Want to try a fun math games, try this game is very simple game all you need is fill empty the contents, whether it's value, addition or subtraction operator." A mismatched scrape from some other product. Fix = a correction request to Metacritic (Fandom) as the developer, with the Steam URL and the real one-line description; Stephen sends it (needs his account). GameFAQs blocks bots here (403); he should read that page himself. Google results not readable from here.
**HIS THURSDAY (Sep 17):** 1. the art assets he knows are imperfect (the frame remake page is the tool; not a build blocker). 2. Steam short description: add the word raccoon, Publish (two minutes, the one search win). 3. Watch the new trailer on the PUBLIC store page once Steam has encoded it. 4. Sleep before Friday.
**✅ RELEASED. Stephen, Sep 18 about 14:08 UTC (10:08 EDT): "its released." Jumping Jimothy is OUT on Steam, build r8 (v9.3).**
**What is open on Jimothy now = the ART PATCH, plan in `plans/jimothy/ART-PATCH-PLAN.md`** (say "we're going to fix Jimothy"):
- Web is ahead of Steam: ARTV 56 = 55 frames recut or cleaned from his release-morning frame review + the original Jimothy's
  BACKWARDS HOP fixed (his two sideways paintings were in each other's slots). Steam r8 still has the old art and the backwards hop.
- ✅ 15:15 UTC: his EIGHT remade frames are IN and live (all limb counted), and **MIKOTHY JACKSON is live on the web**: the 46th
  character, a secret found by hopping BACKWARDS 50 times, who moonwalks on every sideways hop (`test/moonwalk-check.mjs`, 14 checks).
  Web = ARTV 58. His calls on Mikothy: the number 50, the lane, the display name (surname risk told twice; his call).
- ✅ **STEAM ZIP r9 IS BUILT AND IN THE VAULT (Sep 18 15:35 UTC): `jimothy-steam-build-20260918-r9-v94-art-mikothy.zip`**, release
  `vault-20260904`, 341 MB, 93 files, sha256 b8f3a7fb…94cf6. Game v9.4: all the art fixes, the backwards hop fix, Mikothy Jackson, and
  "The Whole Crew" made earnable (it needed The Barnacle, a one-man code). Preflight 5/5, boot probe clean, Electron boot OK, asar opened
  and matched. ⛔ HIS STEPS, not done until he says so: download, upload at partner.steamgames.com/apps/depotuploads/5043360
  (depot 5043361), Builds, set live on `default`. His phone needs a SIGNED link (expires in minutes): ask me for a fresh one.
  **~16:00 UTC: first upload FAILED, the retry worked: "Build commit successful (BuildID 25394827)".** He keeps the name v9.4.
  ⛔ NOT LIVE YET: the upload page's branch dropdown only offers BETA branches (so "none" is the only choice there, that is normal;
  Valve: the default branch cannot be set live automatically). He sets it live on the BUILDS page: row 25394827, `default`,
  Preview Change, Set Build Live Now, then a Steam Mobile App or phone confirmation (NEW since release: Valve requires it for a
  released app, and a 3 day hold follows any account security change). Record it live only when he says so.
  **✅✅ LIVE ON STEAM. Stephen, Sep 18 about 16:15 UTC: "okay its live now". BuildID 25394827 = r9 = game v9.4 is on the `default`
  branch.** Steam and web now carry the same game: 63 fixed frames incl. his eight limb remakes, the original Jimothy's backwards hop
  fix, Mikothy Jackson, The Whole Crew earnable. Builds page: https://partner.steamgames.com/apps/builds/5043360 . The "unpublished
  changes" banner he saw was empty (Diffs: "No uncommitted app data"): Publish is for settings, builds go live from Builds.
  NOT yet checked by him in the installed game: the title screen should read `Jimothy v9.4`.
  **Open on Jimothy now:** the 278 frame restored-effects sweep (review page for him first; ART-PATCH-PLAN.md Part B); Steam keys
  pending Valve's review; streamer emails when the keys land. 🔑 KEYS REQUESTED by Stephen Sep 18 about 14:25 UTC ("request complete"; Default Release keys, I advised 30, he did not say the count). PENDING Valve's case-by-case review: ask him whether they were approved before planning any send.
**HIS STEPS:** 1. ~~upload r5 at the depot uploader~~ DONE; set live on default.
2. Play it on Jessie's laptop with the Afterglow: A selects, D-pad moves, B goes back, Minus stops music, one
achievement pops. 3. If Y still selects: Steam → game Properties → Controller → enable Steam Input (pad becomes a
standard Xbox pad, the proven path, no rebuild). 4. Cloudflare Purge Everything once.

**Status, 20:10 UTC:**
- **Web:** controller v2 plus the Fable review fixes are LIVE on main (`2aa13b02`). Served index.html, sw.js and the
  arcade were byte-compared against the tree.
- **Steam r5:** `jimothy-steam-build-20260916-r5-controller.zip` is in vault release `vault-20260904` (sha256
  `db63e021…`, 354 MB, exe at root). Checks: electron_boot OK, runtime_preflight 5/5, and a raw-pad smoke on the
  vendored copy passed.
- **HIS STEPS:** upload it at the depot uploader (depot 5043361), then Builds → set live on default, then retest on
  Jessie's laptop.
- **Fable review:** 22 confirmed findings, all fixed. gamepad-check now has 65 laws.
- ⛔ **Signed links last about an hour.** Mint a fresh one when he asks (feedback_phone_delivery_signed_links).


Stephen installed from Steam on Jessie's Windows laptop with a PDP Afterglow wired Switch pad. **Achievements popped
right away** (first real-hardware proof of the Steamworks bridge). Everything else he hit was real and is fixed in
`04b6ef43` (branch, NOT yet on main or Steam):
- **Buttons:** Y selected and B did nothing. The pad is read by label now, including raw Switch HID and Pro pads, with
  a Settings switch to swap A and B.
- **Movement:** the D-pad was dead; its hat axis is now decoded. The stick hopped sideways; it now latches one axis.
- **Menus:** the cursor could not leave the screen and How to Play could not scroll; the screen now follows the cursor
  and text scrolls. B now goes back everywhere. The Music switch is reachable, and Minus toggles the music.
- **Lag:** 623 hit tests every 90 idle frames, plus steamworks.js's 60 Hz repaint loop. Both are gone.
- **Soft picture:** the canvas now draws at real device pixels.
- **Steam polish:** badges open a card, and Steam never offers "home screen".
- **Proof:** `test/gamepad-check.mjs` has 48 laws and the old code fails 27. jimothy-check is 58/58. electron_boot
  passes, and runtime_preflight is 5/5. ⛔ Preflight flakes to "UNVERIFIED" when another headless browser shares the
  2 cores; rerun it alone.
- **In flight:** a Fable adversarial review, then deploy web, then package r5 (scratch tree
  `scratchpad/steambuild`, caches on /tmp), vault, signed link, and his upload plus set live.
- **Plan and his notes verbatim:** `plans/jimothy/HANDOFF-STEAM-PAD-SEP16.md`.

His three questions:
- **Streak costumes on Steam:** they already unlock by Adventure levels 10 to 100.
- **Code redeem:** it is still in, under Settings and the Prize Bin. The words are in `CONTENT-MAP.md`.
- **Badge taps:** done.

Art remakes run from his phone through the private page https://claude.ai/artifact/Ue7WnxqxAWqCMyQoZWpPzZ
(`flags` in its db).

---

## 1. THE ONE THING THAT IS ACTUALLY BROKEN, AND IT IS NOT IN THIS REPO

**⛔ SEP 16 EVENING (Opus), TWO MORE CAUSES OF "IT DOES NOT LOAD", BOTH FIXED IN THE REPO AND LIVE:**
- **Cloudflare kept last night's 429s for a year** at some locations (IAD measured): the arcade banner, the Lucid
  Winds art, the music card, three card thumbs, Jimothy's icon. Every arcade image and Jimothy's icons now have new
  URLs (`d74bf2ff`); a rescan of all 206 arcade images is 200. **A Cloudflare Purge Everything is still worth doing**
  for anything else requested during the lockout.
- **The arcade's traffic counter is LIVE since Sep 16 ~22:15 UTC** (Stephen ran the deploy). It had never been
  deployed, so no visits were counted before that day. Checked after: CORS header present, the stats page answers,
  a live arcade load has 0 console errors (that load counted one visit under `builder-check`). Stats:
  https://us-central1-focus-grove-fffa8.cloudfunctions.net/portalStats . Twelve of the thirteen exports are live now
  (CLAUDE.md still says thirteen); Whack Box's `partyComplete` grants sunbeams and is his call.
- **⏰ DATED: Cloud Functions run on Node.js 20, decommissioned 2026-10-30.** After that, no function can be DEPLOYED
  until the runtime and `firebase-functions` are upgraded (the CLI warns of breaking changes). The payment functions
  live in the same codebase, so the upgrade needs its own careful pass before Oct 30, not a rushed one after.
- **Leaving Blockspace hung the browser tab** (the only one of 141 arcade pages; a WebGL page entering the
  back/forward cache stalled). Fixed `8164a7f1`, gate `satellites/blockspace/test/leave.mjs`. Leaving it now takes
  about half a second. Keepsies takes about 2.7 s to leave with or without that cache: slower, not stuck, left alone.
- **Recently Played, driven for real on the live arcade (Sep 16, 22:00 UTC):** a satellite card navigates, a /play/
  card opens in the arcade's own player, and an IN DEVELOPMENT card shows the tester key box (by design; a phone
  without `sws_dev_ok` sees that box, not the game). A sweep of 29 arcade and game loads in a row had a median of
  319 ms; the one failure was the Blockspace leave hang, now fixed.

**✅ FIXED 2026-09-16 13:30 UTC.** Hostinger's CDN was taken out of the path by editing Stephen's Cloudflare DNS over the API
(Global API Key, since rolled): apex and www now A 82.25.83.190 proxied, the second A and both AAAA deleted, SSL Full (strict).
Proof after the change, one probe each: `/portal/` 200 in 147 ms, `www` Jimothy 200 in 113 ms, a Jimothy sprite 200 image/png in
141 ms, and NO `x-hcdn-*` header on any of them. Before: 19.5 s. The history below is kept so nobody re-adds that CDN.
⛔ hPanel will keep saying "Domain isn't connected" (nameservers are Cloudflare's). Ignore it; the origin serves the domain with a
valid Let's Encrypt cert. ⛔ Never turn Hostinger's CDN back on in hPanel and never point DNS back at `cdn.hstgr.net`.
Lane D (Jimothy atlas) is DONE AND LIVE (14:30 UTC): 24 requests on a first visit.

**⛔ STILL OPEN, STEPHEN'S, 14:30 UTC: CLOUDFLARE KEEPS 429s IT CACHED DURING THE LOCKOUT.** A live Jimothy load got
`assets/icons/jimothy-192.png` as 429, `cf-cache-status: HIT`, `age` 56636 s, empty body, one year immutable header (the
`.htaccess` image rule stamps it on every status). Only some Cloudflare locations hold one (IAD yes, EWR no), so no probe
from here finds them all. **Fix: Cloudflare dashboard, lucidwinds.com, Caching, Configuration, Purge Everything.** Then,
optionally, a cache rule that keeps no 4xx or 5xx at the edge. Any image that "does not load" for one person and loads for
another is this until that purge is done.

**Hostinger's CDN punishes a visitor's IP address, and that is what "a bunch of shit is broken" has meant since Sep 15.**
It has two moods and they look like different bugs, which is why it keeps getting misdiagnosed:

| mood | what he sees | the tell |
|---|---|---|
| **429 lockout** | Jimothy's art missing, then the arcade and apps page fail for minutes | empty 429 bodies with no MIME type |
| **Tarpit** | A game "flashes and nothing happens". Pages answer **200** but the first byte takes **19.7 s** | the *same* 19.7 s on every path, while `x-hcdn-upstream-rt` reads `0.004` |

**Why a tarpit looks like "nothing happens":** the root `sw.js` navigation handler waits 5 s for the network, tries the cache,
and only gives up at **12 s** with an offline page. On a tarpitted phone a game tap is therefore a flash and then a blank
screen for twelve seconds. Nobody waits twelve seconds. **That is the flash.**

**⛔ CORRECTED 13:10 UTC SEP 16, THE FIX IS NOT IN hPANEL.** lucidwinds.com is on Stephen's OWN Cloudflare zone (NS
ollie/terin.ns.cloudflare.com); hPanel says "Domain isn't connected" because of that. The chain is: his Cloudflare → Hostinger's
CDN (the `x-hcdn-*` layer, THE PUNISHER) → the LiteSpeed origin at **82.25.83.190** (found via the unproxied `ftp.` record).
Probed direct to the origin with `--resolve`: **200 in 58 ms**, full page, valid Let's Encrypt cert for lucidwinds.com (Sep 11 to
Dec 10). His Cloudflare's own edge and cache answer this box in 36 to 47 ms. So everything slow is Hostinger's CDN and nothing else.
**THE FIX: in his Cloudflare dashboard, DNS, point the `lucidwinds.com` and `www` records at A 82.25.83.190, proxy left ON (instant,
no propagation), SSL/TLS mode Full (strict).** That removes Hostinger's CDN from the path. Verify with one probe: no `x-hcdn` headers,
first byte under one second. The old advice below is kept for the record only.

**THE OLD ADVICE (superseded):** hPanel → lucidwinds.com → Performance → CDN → turn down or off the security
layer (rate limiting, DDoS / "under attack", bot protection). Nothing in this repo can serve a page the edge will not hand
over. He has been told this three times; if it is still not done, **ask him for a screenshot of that hPanel page and walk
him through it rather than writing more code.**

⛔ **BEFORE EVER SAYING "THE SITE IS DOWN":** check `time_starttransfer`, check `x-hcdn-upstream-rt`, and fetch the same URL
once from a second egress (WebFetch). A fixed, identical delay across unrelated paths is a rule, not an outage. Three
separate passes on Sep 16 wrote "the whole site is returning 522" about a site that was serving fine.

⛔ **NEVER BURST-PROBE THE LIVE SITE.** It locks this box out too, and then every probe lies. One file at a time, with gaps.

**Re-verified 12:31 UTC Sep 16:** `/portal/` from this box = 200, first byte 19.48 s, `x-hcdn-upstream-rt` 0.013; the same
URL from a second egress loaded promptly. The punishment on an address lasts HOURS (this box was quiet for seven). His
tester's Wi-Fi shares one address, so one Jimothy open punished every game that followed, all afternoon.

---

## 2. THE DEADLINE

**Jumping Jimothy releases Friday Sep 18, 10:01 EDT. Stephen presses the button.** Approved, build r4 live, 26 achievements
published, store page live.

**The one repo-side thing that would most protect that launch:** a first visit to `/satellites/stream-hop/` makes
**143 requests**, which trips the CDN limit on its own. The visitor is then locked out, which is why Jimothy's art is missing
*and* why the arcade breaks right after someone opens Jimothy. **Packing those sprites into sheets was LANE D and it is DONE AND LIVE (Sep 16, 14:30 UTC):** a first visit is 24
requests, not 141, and renders byte identical (`plans/jimothy/HANDOFF-JIMOTHY-ATLAS.md`). ⛔ Web only; nothing on Steam
moves before Friday. The Steam patch after launch must strip the atlas in `vendor.sh` (that file's SESSION STATE says how).

---

## 3. HOW TO CHECK A "GAME IS BROKEN" REPORT IN THE RIGHT ORDER

Do these in order and stop at the first one that explains it. Most reports die at step 1 or 2.

1. **Is it an IN DEVELOPMENT game and does his browser have the flag?** `beta:true` games are gated: without
   `localStorage.sws_dev_ok === '1'` a tap opens a "Tester key" modal instead of the game (`swsDevGate`,
   `portal/index.html`). On a browser he has not unlocked, **every** in-development game refuses to open.
2. **Is the edge tarpitting or locking out?** Section 1. Check TTFB, not just the status code.
3. **Does the page serve, and are the served bytes the built bytes?** `curl` it once with a random query and `diff` the
   result against the file in the tree. A 200 is not proof; a byte diff is.
4. **Does it boot clean from the local copy?** Serve the repo and load the game headless: count requests, 404s and console
   errors. If it boots clean locally and serves byte-identical live, **the game is not broken and the fault is between his
   phone and the file.**
5. **Only then** suspect the game.

**Worked example, Burrow Bowl, Sep 16:** he reported "wouldn't even load, it just flashes and nothing happens". Steps 3 and 4
cleared it: it serves 200 at the exact URL the card uses, byte-identical to the tree, and the local copy boots with **0
console errors, 0 404s and 7 requests**. So Burrow Bowl is not broken. It is step 1 or step 2 on his device, and the
twelve-second blank in section 1 is almost certainly the flash.

---

## 4. WHAT IS BUILT AND WHAT IS NOT

**Built and live:** the math catalog, **nine of ten** games, all serving with byte diffs to prove it (Span, Yonder, Crease,
Brim, Glimpse, Notch, Hush, Tint, Gauge) plus the teacher's link builder at `/satellites/math/config/`.
⛔ **CAIRN was never built** (`assets/math-catalog/06-CAIRN-handoff.md`).

**Built and live Sep 16:** lane D, the Jimothy atlas. **Lane B,** the improvement pass, is nearly done (corrected 14:40 UTC Sep 16; this line said "a fifth", which was
stale): B1 to B6 were built or measured and deployed Sep 14 to 15 (Gerplunk and Inkswing's calls, Airworthy 61 and 69,
Updraft 70, Fathom 71 and 62's instrument, Burrow Bowl 65), and B7 did Doohickey, Swell and Wardian (Strata's row is his
call). Asterism's row (river, showers, planets) is done. Whistlestop's row (`HANDOFF-OPUS-SEP07-NIGHT.md` T2.3) is DONE AND LIVE Sep 16: twelve puzzles, two new rules (one lever for two switches, cars left in a yard), par searched by a gate. Its C12 is his. **Every lane in the Opus handoff is now done.** Windup waits on his ear.

⛔ **None of the twelve has painted art, and nobody has heard the audio in any of them.**

**DEPLOYED 2026-09-16 13:50 UTC (Stephen: "push the math shelf to main"):** the nine math games are on the arcade's
In Development shelf on main (`3714f7fa`, parent verified as `origin/main`); the served `/portal/` was diffed byte for byte
against main and matches, 146 ms first byte, no CDN headers.

---

## 5. HIS OPEN DECISIONS (taste, not bugs — do not "fix" these unasked)

From the shot sweep, about 110 screenshots across the seven new games at four widths, all written into
`plans/<game>/HANDOFF-<GAME>.md`:

1. **Wordless screens.** Four of seven games have doors with no words, and BRIM's ask lives on the door and never where the
   choosing happens.
2. **One mark doing two jobs.** Reveals mark the child's choice and the true answer identically almost everywhere. NOTCH's
   find and GAUGE's compare already do it right: fill for truth, outline for choice.
3. **TINT's mixer averages dye against white in linear light**, washing every recipe toward grey, in a colour game.
4. **The corner disease.** The first earned thing sits top-left of an empty board in five games.
5. **CORE's settings gear sits 8 px from the right edge**, fleet-wide.
6. **NOTCH shows the browser's blue focus ring** on five screens.
7. **The nine math cards have no art.** On the shelf they are a small emoji in an empty black rectangle beside full-bleed
   painted neighbours, and they read as holes. Nine pieces of card art is the fix and it is his to commission.

---

## 6. WHERE THE REAL RECORD IS

- `HANDOFF-FABLE-SEP16.md` — what is broken, with a measurement under every claim.
- `HANDOFF-OPUS-SEP15.md` section 10 — the running report, newest first.
- `plans/<game>/HANDOFF-<GAME>.md` section 13 — per game: every red, its cause, its fix, every plant, every shot fault.
- Memory: `project_cdn_429_lockout_sep15`, `project_lane_c_math_progress_sep16`.

## 7. THE LAWS THAT DO NOT BEND

- Commit and push when green. `git add` fenced paths, never `-A`.
- Deploy = a worktree on `origin/main`, `git checkout <branch> -- <paths>`, verify `HEAD~1 == origin/main`, push, then probe
  one served file at a time with a random query. **Never push the whole branch to main**; it carries unfinished games.
- Every gate is watched red on a plant before it counts. Never weaken a gate.
- **A visual change is not done until it has been LOOKED at.** Open the image and name three things wrong in it.
- Player copy: no dashes, no exclamation points. "Sky Wolf Studio", singular. Touch targets 48 px. Text 0.7rem or more.
- Never edit `scripts/`, `music-unlocks.js`, `CLAUDE.md`, `proto/`. Never `pkill -f` a pattern; kill by PID.
