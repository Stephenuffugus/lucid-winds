# SEP 02 — THE MASTER LIST

Written by Fable on 2026-09-02 from Stephen's brief that morning. One file, three
kinds of item: what is already done, what only Stephen can do, and what Opus
builds. Every Opus task has a prompt block you paste as-is into a fresh Opus
session. Read this file top to bottom once, then work the ORDER section.

## How to use this file

**One Opus, one task at a time** (safest): open a terminal, paste the prompt for
the task at the top of the ORDER list, wait for it to finish, read its evidence,
refresh the codespace if you want, paste the next one.

**Several terminals at once** (faster): every task below carries a FILE FENCE.
Two tasks whose fences do not overlap can run in two terminals at the same time.
The lanes are marked in ORDER. Tasks that share a fence never run together.

Rules every prompt already carries, and that you enforce when reading their
reports:

1. `git pull --rebase origin add-sproing-jumper` before the first edit and before
   the commit. `git add` only the paths in the fence, never `-A`. Commit on
   `add-sproing-jumper`. **Never push to main.** Fable reviews and deploys.
2. A phase is not done until its gate has been watched to FAIL first and then
   pass. A screenshot from where the player stands, read and described, before
   any visual phase is called done.
3. Every patch asserts its anchor landed. A red gate names a suspect, not a
   culprit (the code, a stale test, or the two core machine).
4. No dashes in player-facing copy, ever. Commas.
5. "Sky Wolf Studio", singular.

## What Fable did today (already on the branch)

- **Music P12.** The unlock moment now lands at a break in play, not two minutes
  in: `SWSMusic.milestone(n)` is a new call a game makes when a level clears or
  a round ends; it is a rung on the ladder (level 3 opens the second song) and
  the moment a pending card shows ("Play it now / Later"). The time rung went
  from 2 minutes to 8 so the first song loops a couple of times first. Conduit
  makes the call (distinct sites cleared). The card fires `swsmusic:card` on
  `document` so a game that wants to hold its clock can. Files:
  `music-unlocks.js`, `music-ladder.json`, `scripts/music_manifest.mjs`,
  `satellites/conduit/index.html` (one hook in `win()`), tests and mutants.
- **72 alternate takes retitled** ("Neon Rally, take 2" is now "Neon Volley",
  the whole list is `music-titles.json`, edit any line and regenerate). Ids and
  files did not move, nothing re-uploads. The Originals take is "Greenhouse
  Before Dawn".
- **A regeneration trap closed.** Rebuilding the catalog without the master
  audio on disk silently produced 143 tracks for 144. The generator now refuses
  unless the master is at `/tmp/music-intake` (vault release
  `vault-music-20260902`, `Tracks-*.zip`) or it is told `--no-disk` for a
  fixture.
- **Conduit's headless suite was dead** since the carding commit (a second
  inline script block after the game; the harness took the first `<script>` to
  the last `</script>`). Fixed in `test/harness.js`; 576 assertions green.
- **Disk:** 3.0 GB free → 4.6 GB free (npm caches, loose git objects). Nothing
  of yours was touched. More options in DISK below.
- **Dragon Philosophy source** cloned to `/workspaces/dragon-philosophy` (the
  private repo). Played to the board headless: clean, complete, placeholder art.

## STEPHEN ONLY (physical, in this order)

1. **Suno, before midnight Sep 3 your time.** The download cap is retroactive
   to the whole back catalogue. Stems come free with the song.
2. **Jimothy on Steam. ACCEPTED (you told Fable Sep 02).** The rejection (Aug 26) was the Library Logo carrying
   the tagline; you resubmitted and it passed. The line below is history. Valve's page review is 3 to 5 **business** days
   and Labor Day (Sep 7) sits in the window, so silence until about Sep 8 is
   normal, not a problem. Check the store page's review status in Steamworks
   under the app's Store Presence; if it says anything other than "in review",
   read the note there. The 14 day Coming Soon clock starts at approval.
3. **Ripcord 3D battle.** In the game: ⚙ Settings → "3D battle (beta)" toggle
   (the switch draws the round with the real parts on a tilted camera; the game
   underneath is the same). Play three rounds. Write down what you saw in
   `satellites/ripcord/PLAYTESTS.md` (or tell Fable). Task R1 waits on this.
4. **Conduit's M1 answer** waits until task C1 lands (the game does not teach
   itself yet; your "none of my abilities work" is C1's brief, see below).
5. **Music titles.** Skim `music-titles.json`. Change any line you dislike.
   Tell Fable "regenerate" or run `node scripts/music_manifest.mjs --live` with
   the master on disk (the generator tells you how if it is not).
6. **The ferro law.** `satellites/conduit/docs/DESIGN.md` says the creature and
   the conduit are never a generated asset (procedural only, Appendix A). Your
   brief today asks for "really good looking ferrofluid assets that look like
   it's bubbling and moving". Task C2 offers two routes; pick one, and if it is
   the generated route say so in one line so the law can be amended.
7. **Google Play, the account.** Before any packaging: Play Console → Setup →
   Payments profile → create the merchant profile (business name, address, tax
   info, bank account). Paid apps are impossible without it and verification
   can take days. Confirm the account is the organization account (D-U-N-S
   done). Pay the one time $25 if not paid. Then task P1 can run.
8. **Steam, the FTW app.** Steamworks → Create new app ($100) → note the appid;
   depot = appid+1. Then task S1 can run (it needs both numbers). Set the price
   in the same sitting: the plan says $1; a price can never be raised once set.
9. **Keystore, once.** When P1 asks: generate the Android signing keystore on
   your own machine and back it up off the codespace. Losing it means never
   updating the app again.

## OPUS TASKS

### C1 — Conduit teaches itself (the "none of my abilities work" pass)

Fable's diagnosis, from the live build shot at 375x667 and 844x390 and the
code:

- The title screen is a paragraph of design prose (mass is health, reach, size
  and ammunition; drag to move; tap FLOW; every tile of wire is a tile of you;
  75% comes home). It reads as lore, not instruction. A first player learns
  nothing they can act on.
- The site list shows all six sites open at once, each with a "Still on it:"
  line that is a designer's note about the Metroid re-pricing ("Splice would
  route the corridor for nothing, and the speaker is out of the socket's
  budget"). To a new player it is nonsense. `LOCKED_HINT` at index.html:2952,
  rendered at :2978.
- The four canvas buttons are all conditional and refuse silently or with one
  line of small text: FLOW needs the player still AND unseen (:2372 "FLOW needs
  you still and unseen"); PULSE needs a live wire and its cooldown; RECLAIM
  needs wire on the floor; ACT is a context verb that only exists when a target
  is adjacent (`contextVerb()` :1472). A new player taps all four, nothing
  happens, and concludes the abilities are broken. That is exactly what
  Stephen reported.
- The eight traits (Splice, Insulation, Capacity, Reclaim speed, Pulse reach,
  Fine tendril, Strong grip, Wall grip; `buyTrait` :418) cost 15 to 40 residue
  and a fresh save has 0, so the "shop" is a list of things you cannot buy with
  no explanation of what residue is or how it is earned (banked improvement on
  your best run, `win()` :1690).
- The HUD strings that exist ("tap for the site list", "smothering, hold
  still", "Power is cut. Find the breaker.", "MASS LEAK") are status, not
  teaching.

Nothing in the sim is wrong; the presentation never tells the player the
conditions. C1 is a teaching layer, not a rebalance.

```
You are building phase C1b of CONDUIT, a ferrofluid stealth game at
satellites/conduit/ in the lucid-winds repo, branch add-sproing-jumper.
Read, in this order, before touching anything: satellites/conduit/HANDOFF.md,
HANDOFF-CONDUIT.md (repo root, the rules), satellites/conduit/docs/DESIGN.md,
docs/DESIGN-ADDENDUM-2-progression.md, and the C1 section of HANDOFF-SEP02.md
(Fable's diagnosis of why the Director reported "none of my abilities seem to
work" and "a lot of text on screen that didn't make sense").

THE JOB: make the game teach itself in the first site, without changing a
single number in CFG, LEVELS, or the traits. The sim is finished. The
presentation never tells the player when a button will work.

Build, in this order, one commit each, gate before commit:

1. TITLE SCREEN. Replace the paragraph with at most three short lines in the
   Director's voice (no dashes, commas only) and one button. The mass rule can
   be ONE line. Everything else moves into play.
2. SITE LIST. Only Intake Bay is open on a fresh save; each next site opens
   when the previous one is done (sv.sites[id].done). Locked sites show their
   name and their "teaches" line, greyed, no button. Remove the "Still on it:"
   lines from the list entirely; keep LOCKED_HINT but show it ONLY on a site
   the player has already cleared, under a heading "Another way in", because
   that is what it is (the Metroid re-read). Keep "Run it again" and the medal
   line on cleared sites.
3. BUTTON AFFORDANCE. Every canvas button draws in one of three states, every
   frame: READY (full), NOT NOW (dimmed, and a 2 to 4 word reason drawn under
   or beside it: "be still, unseen" / "no live wire" / "no wire down" /
   "nothing in reach"), and HELD. The reason text must be the SAME string the
   code checks, derived from the same condition (contextVerb, canFlow, the
   pulse cooldown, the reclaim path), never a second copy. Tapping a NOT NOW
   button pulses the reason for 600ms. This is the fix for "my abilities do
   not work".
4. FIRST SITE COACH MARKS. In Intake Bay only, a sequence of at most six
   one-line prompts, each waiting for the thing it names to happen before the
   next appears: move · be still to earn FLOW · in FLOW drag a wire from the
   socket to the machine · exit FLOW and watch it fire · RECLAIM your wire ·
   force the exit door. Each prompt is dismissed by the action, not a tap. A
   "skip tips" link on the first prompt, persisted in the save (sv.tips=done).
   Never show them again after Intake Bay is done.
5. RESIDUE, EXPLAINED ONCE. The first time the site list shows with residue >
   0, a one line note above the traits: "Residue is what you banked over your
   best run. Spend it here." Traits the player cannot afford show their price
   in muted text, never hidden.
6. THE END-OF-RUN CARD. On Extracted/Lost, keep the medals, and add one line
   that names the next thing: "Coolant Floor is open" or, on a loss, the
   reason the run died in plain words (the existing lose(msg) strings are the
   source; do not invent new ones).

RULES:
- FILE FENCE: satellites/conduit/** only. Nothing else in the repo.
- CFG, LEVELS, traits, prices, thresholds: do not change a number. If a
  teaching step is impossible without a change, STOP and write the question
  in satellites/conduit/HANDOFF.md under "Questions for Stephen".
- ES5 is not required here (the file uses const/let), but no new libraries.
- Gates, run one at a time, never concurrently (two core box):
  node test/smoke.js (576 must stay green, add assertions BY NAME for: site
  gating, the reason strings deriving from the real conditions, tips
  persistence); node test/mutants.js after adding assertions (a surviving
  mutant names a decorative test; add a mutant for each new mechanic);
  node test/controls.js 375 667 and 844 390 (every button still 48px and
  reachable); node test/shots.js c1b for the four viewports, then OPEN the
  images and write three things wrong with them in HANDOFF.md before you fix
  them; node test/fullrun.js must still exfil Intake Bay with the coach marks
  on AND with them skipped.
- The Director's words are law: "there's a lot of text on screen that didn't
  make sense, it didn't explain anything". Every string you add must be
  something the player can act on in the next ten seconds.
- Evidence: paste each gate's last line and the screenshot paths into
  satellites/conduit/HANDOFF.md under a "C1b" heading. Update PLAYTESTS.md
  with one scripted run entry.
- git pull --rebase origin add-sproing-jumper before your first edit and
  before each commit. git add satellites/conduit only. Never push to main.
Report: what changed, what you looked at, what you could not do and why.
```

### C2 — Conduit's ferrofluid look (after C1, after Stephen's route call)

Two honest routes. Stephen picks one in STEPHEN ONLY #6.

**Route A, procedural in WebGL (recommended).** The creature is drawn today on
canvas 2D from Appendix A math (metaball ring, spike field, rim hue). A
fragment shader does what canvas cannot: real metaball merging, a moving spike
field driven by noise, specular highlights that slide over the surface, and
"bubbling" from a second noise layer at half speed. It stays deterministic per
seed, costs one draw call, and honours the DESIGN.md law as written. Reference
look: the classic ferrofluid sculpture videos (Sachiko Kodama), matte black
with hard spikes and liquid valleys.

**Route B, generated flipbooks.** Generate 2 to 4 second seamless loops of
ferrofluid (any of the video generators that take a text prompt; Meshy is for
meshes and is the wrong tool for a fluid), cut them to sprite sheets with the
tools already in `satellites/ripcord/tools/` (`artcut.py`, `artsheet.py`), and
play them as textures under the procedural rim. Looks richest at rest, falls
apart the moment the blob changes shape (a flipbook cannot squeeze through a
vent). Needs the DESIGN.md law amended.

```
You are building phase C2 of CONDUIT (satellites/conduit/, lucid-winds repo,
branch add-sproing-jumper): the ferrofluid look. Read satellites/conduit/
HANDOFF.md, HANDOFF-CONDUIT.md, docs/DESIGN.md Appendix A, and the C2 section
of HANDOFF-SEP02.md. The Director's brief: "really good looking ferrofluid
assets that look like it's bubbling and moving". The route is
[ROUTE A: WebGL shader | ROUTE B: generated flipbooks], chosen by the Director.

ROUTE A build, one commit per step:
1. A WebGL2 layer (with a WebGL1 fallback path that is the current canvas
   draw, untouched) that renders ONLY the creature and its wire, composited
   over the canvas 2D scene at the creature's position. Keep the canvas 2D
   renderer as the fallback and as the headless path: test/smoke.js must not
   know the shader exists.
2. The fragment shader: metaball field from the creature's body samples
   (mass -> radius, the same numbers Appendix A uses), a spike field from
   3D simplex noise scrolled by time, sharpened by a smoothstep, a second
   half-speed noise layer for the bubbling, matte black base, a rim of the
   Appendix A hue pair (WRAP THE HUE THE SHORT WAY: 268 -> 404, midpoint
   336, not the green average), a single moving specular highlight. Squeeze
   state stretches the field along the movement axis; force state fattens
   it. All parameters are uniforms exposed on one object so the Director
   can tune them in the dev overlay (sws_dev_ok=1).
3. Perf: node test/perf.js at 4x CPU throttle must stay within the existing
   draw budget ratio; add a GPU frame time probe (EXT_disjoint_timer_query
   where available, else skip out loud). A phone that fails WebGL2 gets the
   fallback with no error in the console.
4. LOOK: node test/closeup.js c2 (the creature at 4x) and node test/shots.js
   c2, then open the images. Write three things wrong before fixing.

ROUTE B build: 1. a tools/ferro/ folder with the cutting script adapted from
satellites/ripcord/tools/artsheet.py, a manifest of loops (state -> sheet),
and a README naming the exact prompt used per loop; 2. the flipbook drawn
UNDER the procedural rim so shape changes still read; 3. the same perf and
LOOK gates as Route A; 4. a note in docs/DESIGN.md amending the "never a
generated asset" law, quoting the Director's Sep 02 brief.

RULES: FILE FENCE satellites/conduit/** only. No CFG or level numbers change.
Gates one at a time. Evidence in HANDOFF.md under "C2". git pull --rebase
first, git add satellites/conduit only, never push to main.
```

### M1 — Music milestones in the games Stephen plays

The moment now lands at a break the game reports. Conduit reports. These do
not yet, and each is one line at the right place.

```
You are wiring the soundtrack milestone call into a handful of games in the
lucid-winds repo, branch add-sproing-jumper. Read HANDOFF-MUSIC.md sections
6.3 and 6.7 (P12 notes) and the top comment of music-unlocks.js first.

The call: window.SWSMusic && window.SWSMusic.milestone(n). n is how far the
player has got: a level number or a count of rounds finished; the module
keeps the max; no argument counts up by one. Call it ONLY at a break in play
(a level cleared, a round over, a run ended), never mid action, and always
guarded: try { if (window.SWSMusic && window.SWSMusic.milestone)
window.SWSMusic.milestone(n); } catch (e) {}. Optionally, a game that can
hold its clock listens for the document event "swsmusic:card" (detail.open
true then false) and pauses its sim while the card is up.

Games, and where the break is (find the exact handler; grep the on screen
string first, then the function that draws it):
- satellites/tangent/  the level clear handler (levels are numbered; pass
  the level number just cleared).
- satellites/ripcord/  the end of a round, win or lose (pass rounds
  completed this save; read it from the save object).
- satellites/flock-the-world/  a run ending on any of the four doors, and a
  loss (pass the count of runs finished, from the ftw_recs record).
- satellites/dewball/  a landmark reached or a run ended (count).
- satellites/aura-off/  a bout finished (count).
- play/shell.js  for the 67 native games: find the shared win / round-over
  overlay in shell.js; if ONE shared place exists, call milestone() there
  with no argument. If there is no shared place, do NOT edit 67 files; write
  that finding in HANDOFF-MUSIC.md section 11 and stop.
- satellites/stream-hop (Jimothy) keeps its own music bridge: SKIP.
- The 12 VENDORED satellites (listed in HANDOFF-MUSIC.md): SKIP, they are
  fixed upstream.

RULES: one commit per game, message "music M1: <game> reports its
milestones". FILE FENCE: exactly the files named above plus HANDOFF-MUSIC.md
section 11. Each game's own test suite (see its HANDOFF.md or test/ folder)
must stay green; run it before the commit and paste the last line in the
commit body. node test/music/run.mjs must stay all green (needs
python3 -m http.server 8777 running at the repo root). git pull --rebase
before each commit. git add only the named files. Never push to main.
Report per game: the handler you hooked, the value passed, the gate line.
```

### T1 — Tangent review items

Already written: `HANDOFF-TANGENT.md` at the repo root, sections R1 to R7,
with Fable's review of the Opus build (the "needs the deck" result is false,
the one way drift law is throttle dependent). Paste that file's prompt block
as-is. Fence: `satellites/tangent/**`.

### R1 — Ripcord 3D battle, after Stephen plays it

No prompt yet on purpose. Stephen's three rounds (STEPHEN ONLY #3) are the
brief. When his notes exist, Fable writes R1 from them, the way the Aug 30
phone verdicts became the ceremony pass. The 3D code and its docs:
`satellites/ripcord/docs/FORGE3D.md`, `VR-PILOT.md`, `TEACHING.md`,
`docs/shots-3d/`. Fence: `satellites/ripcord/**`.

### S1 — Flock the World on Steam (after Stephen creates the app)

What exists: `store/ftw-steam/` has the Electron rig adapted from Jimothy
(`main.js`, `package.json`, `vendor.sh`, `app/` with the game vendored,
`shots/` six 1920x1080 screenshots, `FTW-STEAM.md`). What is missing:
`steampipe/` is empty (no vdfs), no `capsules/` at all (Jimothy has 8 Valve
sizes plus icon in `store/jimothy-steam/capsules/out/`), no store copy file,
no content rating file, no beatability evidence.

```
You are packaging FLOCK THE WORLD for Steam in the lucid-winds repo, branch
add-sproing-jumper. The Jimothy rig is the template and it passed Valve's
technical checks; copy its shape exactly. Read first: STEAM-CHECKLIST.md
(the process, Jimothy's), store/ftw-steam/FTW-STEAM.md, store/jimothy-steam/
(the whole folder: capsules/*.js, steampipe/*.vdf, STEAM_SUBMIT.md,
STORE_PAGE_FILL.md, CONTENT_RATING.md, BEATABILITY.md), and
satellites/flock-the-world/HANDOFF.md.

Inputs from the Director (STOP and ask in FTW-STEAM.md if missing):
APPID = ____  DEPOTID = ____  PRICE = $1  LAUNCH DISCOUNT = ____%.

Build, one commit each:
1. store/ftw-steam/steampipe/: copy Jimothy's app_build.vdf and depot_build.vdf,
   swap both ids and the contentroot, keep upload.sh. Do not run upload.sh
   (it needs the Director's Steam login and the codespace is datacenter
   blocked for Steam logins).
2. store/ftw-steam/capsules/: adapt store/jimothy-steam/capsules/*.js to FTW's
   art (satellites/flock-the-world/art/, the portal thumb, and
   store/ftw-play/feature-graphic-1024x500.png as the composition
   reference). Output all eight Valve sizes: header 460x215, small 231x87,
   main 616x353, vertical 374x448, library 600x900, library hero 3840x1240,
   library logo 1280x720, page background 1438x810, plus app_icon 184 and
   the .ico via icon.py. LAWS: the hero and the library logo carry NO
   wordmark and NO tagline (the Jimothy rejection, Aug 26, was exactly a
   tagline on the library logo; grep every generator for the tagline
   string before you finish). Render a contact sheet of all of them and
   OPEN it; write three things wrong before fixing.
3. store/ftw-steam/STORE_PAGE_FILL.md: every Steamworks store field filled
   in text, in the Director's voice, from store/ftw-play/PLAY-LISTING.md's
   copy (his voice check is pending; mark the fields he must read). Include
   the AI disclosure: the art is generated, say so plainly. Tags, genre,
   features (single player, offline). No dashes.
4. store/ftw-steam/CONTENT_RATING.md: the honest survey answers (political
   satire, state violence described in text, never depicted; see
   PLAY-LISTING.md). Expect a maturity note.
5. store/ftw-steam/BEATABILITY.md + BEATABILITY_EVIDENCE.json: prove each of
   the four doors can be reached from a fresh save by a scripted run
   (satellites/flock-the-world has a seeded stream; do NOT add code that
   eats dice headless, the canaries flip). Jimothy's file shows the shape.
6. cd store/ftw-steam && npm i && npm run dist:win must produce the depot
   dir; run the Electron build once headless (steam_bootprobe.mjs at repo
   root is the probe) and paste the boot line.

RULES: FILE FENCE store/ftw-steam/** only (plus nothing in
satellites/flock-the-world). Never raise the price once set. git pull
--rebase first; git add store/ftw-steam only; never push to main. Report:
what the Director must click, in order, with the exact file to paste from.
```

### P1 — Flock the World on Google Play (after the merchant profile exists)

What exists: `store/ftw-play/` has the listing draft (`PLAY-LISTING.md`), the
feature graphic and four 1080x1920 shots; `satellites/flock-the-world/` has
the manifest, service worker, icons, privacy page; `twa_ready.mjs` at the repo
root ran ten green gates on Aug 25; `CROSSCHECK-PLAY-AUG22.md` is the runbook.
What is missing: the AAB itself (Bubblewrap), `/.well-known/assetlinks.json`
with the real signing fingerprint, the Play Console field sheet.

```
You are packaging FLOCK THE WORLD as a Trusted Web Activity for Google Play,
in the lucid-winds repo, branch add-sproing-jumper. Read first:
CROSSCHECK-PLAY-AUG22.md (sections 2, 4, 5), store/ftw-play/PLAY-LISTING.md,
satellites/flock-the-world/PLAN-AUG23.md section 6 and F7, twa_ready.mjs,
_twa_manifest_check.mjs, _twa_boundary_check.mjs. The TWA wraps the LIVE URL
https://lucidwinds.com/satellites/flock-the-world/ ; whatever is live IS the
app.

Inputs from the Director (STOP and write the question in PLAY-LISTING.md if
missing): the merchant profile exists (yes/no), the package name
(recommend com.skywolfstudio.flocktheworld), and the SHA-256 fingerprint of
HIS keystore (he generates it on his machine; the keystore never enters the
repo or this codespace).

Build, one commit each:
1. node twa_ready.mjs flock-the-world: all gates must be green before
   anything else; if one is red, fix the cause in
   satellites/flock-the-world/ (fence extended for that fix only) and say
   what it was.
2. Bubblewrap: install the JDK and Android SDK the tool asks for under /tmp
   (the workspace disk is nearly full; /tmp has room), `bubblewrap init
   --manifest https://lucidwinds.com/satellites/flock-the-world/manifest.webmanifest`
   with scope ./, landscape, the package name above, the Director's
   fingerprint. Strip every permission except VIBRATE from the generated
   AndroidManifest.xml. `bubblewrap build` with an UNSIGNED output (or a
   throwaway debug key clearly named so): the Director signs the release on
   his machine. Commit the twa project files under store/ftw-play/twa/ WITHOUT
   any keystore, and the build recipe as store/ftw-play/BUILD.md.
3. Write .well-known/assetlinks.json at the repo root (the site root serves
   it; it must be application/json, HTTPS, no redirect) with the Director's
   fingerprint and the package name. Add a gate to twa_ready.mjs that fetches
   the LIVE url and checks the content type and the fingerprint once it is
   deployed (Fable deploys).
4. store/ftw-play/PLAY-CONSOLE-FIELDS.md: every Play Console field in text:
   app name, short and full description (from PLAY-LISTING.md), category
   (Games / Strategy), contact email, privacy policy URL, the Data Safety
   answers, the content rating questionnaire answers, price $1 (USD, then
   let Play convert), countries (all), no ads declaration, target audience
   (13+ or 16+ per the rating). Mark the three fields only the Director can
   answer.
5. Screenshots: verify the four in store/ftw-play/ are 1080x1920 and honest
   (no staged state the player cannot reach); regenerate any that is not.

RULES: FILE FENCE store/ftw-play/**, .well-known/assetlinks.json, twa_ready.mjs,
and satellites/flock-the-world/ only for a red gate's cause. No tip jar, no
external payment link, no Stripe surface reachable from inside the TWA
(the inTWA guard; _twa_boundary_check.mjs proves it). Nothing installs on a
phone from here: the cold launch in airplane mode is the Director's. git
pull --rebase first; git add only the fence; never push to main. Report: the
exact order of clicks in Play Console with the file to paste from.
```

### D1 — Dragon Philosophy: the art drop, then the polish

**Played, headless, at 375x667:** menu → How to Play primer (shows first, once)
→ Swear to a Patron (8 cards, two step picker) → Begin → the board: rival and
your Resolve bars, the Memory resonance dial, the Gauntlet threat "Gnawing
Doubt, Might 3", a hand of Starter cards with an empty gradient art window
each, Play All / Buy / Attack / patron ability / End Turn, and a coach mark
"Tap a card in your hand to play it". Zero console errors from the game
(the 404s are the portal includes missing on a local server). It is a
finished game with placeholder art.

**The asset list already exists and is exact:** `/workspaces/dragon-philosophy/
ART_ASSETS.md`: 8 patrons, 10 threats, 100 market cards (11 Legendary, 6 Epic,
22 Rare, then Uncommon, Common, Starters), 640x512 (5:4), PNG or WebP under
120 KB each, dark painterly manuscript plate, dark edges so the card frame
stays the loudest colour, 123 images, with a prompt per image. Priority order
in the file: patrons, threats, dragons and legendaries, then down the rarities.
Card art drops in with zero code (`public/art/manifest.json` → `window.
__DRAGON_ART__`); patron and threat slots are "a ~15 line add".

**How the art gets made (Stephen, with Fable):** it is 123 stills, no motion,
so FLUX or Midjourney through the 012Assets Drive flow, batch by rarity, the
prompts already written. Fable cuts, quantizes to WebP under 120 KB, and writes
the manifest. Only the patrons and threats (18) need to exist before the game
looks finished; the commons can stay procedural indefinitely (the file says so).

```
You are working on DRAGON PHILOSOPHY, a finished React/Vite deckbuilder whose
source is /workspaces/dragon-philosophy (a separate private repo; clone it
there if missing: gh repo clone Stephenuffugus/dragon-philosophy
/workspaces/dragon-philosophy) and whose BUILT bundle is vendored at
lucid-winds/satellites/dragon-philosophy/. Read first, in order:
/workspaces/dragon-philosophy/HANDOFF.md, CLAUDE.md, ART_ASSETS.md,
DESIGN.md, and the D1 section of lucid-winds/HANDOFF-SEP02.md.

Do NOT install node_modules on the /workspaces disk (it is nearly full):
npm ci with a cache under /tmp, or symlink node_modules to /tmp/dp-node_modules.

Build, one commit each, in the source repo (push it), then re-vendor into
lucid-winds ONLY as the last step and ONLY the built dist:
1. Patron and threat art slots: the "~15 line add" HANDOFF.md names. Patron
   cards (PatronSelect.tsx) and the Gauntlet threat panel (GameBoard.tsx /
   visuals.tsx) read window.__DRAGON_ART__[id] the same way cards do, 5:4
   window, object-fit cover, the procedural placeholder as the fallback.
   Add `public/art/manifest.json` loading for patrons and threats to
   main.tsx if it only covers cards today.
2. A drop script: scripts/art_drop.mjs that takes a folder of PNGs named
   <id>.png, verifies each id exists in src/data/{cards,threats,patrons}.json,
   resizes to 640x512 cover, writes WebP under 120 KB (quality stepping down
   until it fits), writes public/art/<kind>/<id>.webp and regenerates
   public/art/manifest.json. Unknown ids are an error, never a guess.
3. A test: `npm test` must stay green (simulate ~150/150 split; treat a big
   split change as a regression), plus a smoke assertion that a manifest
   entry renders an <img> for a card, a patron and a threat.
4. LOOK: scripts/shot.mjs at phone and desktop for menu, patron, board with
   three placeholder ids pointed at a test image; open the images; write
   three things wrong in HANDOFF.md before fixing.
5. Re-vendor per HANDOFF.md "To ship a change" (rm -rf the satellite folder,
   cp -r dist, in lucid-winds: git add satellites/dragon-philosophy only,
   commit, never push to main). Keep the dev gate include, the og tags, the
   music-unlocks include, the arcade exit and feedback fab snippets that the
   vendored index.html carries today (diff the old and new index.html and
   re-add them; they are lucid-winds additions, not Vite output).

RULES: FILE FENCE in lucid-winds: satellites/dragon-philosophy/** only. In
the source repo: anything, it is yours. No balance changes (THRESHOLD_*,
Threat Mights, copies) without a note in HANDOFF.md "Open for the Director".
No dashes in new player copy. Report: the ids that have art slots now, the
drop command the Director runs when the images exist, and the vendored
commit hash.
```

### W1 — 3D world skins with Meshy: Dewball, Abduct a Chameleon, Chameleon 3D

Stephen's worry is the right one: "I'm nervous that it would crash the game if
I put a whole bunch of detailed 3D images in the world." The logistics, from
the three renderers as they are:

| game | renderer | today | the risk |
|---|---|---|---|
| Dewball (`satellites/dewball/index.html`, 5001 lines) | three.js r144, vendored | procedural Box/Cylinder/Sphere geometry, `InstancedMesh` for the repeated props, Lambert and Basic materials, `setPixelRatio(1)` | it is fast because everything is instanced and untextured; a hundred unique painted meshes with their own materials undoes that |
| Abduct a Chameleon (`/workspaces/abduct_a_chameleon/abduct-3d.html`) | three.js r144, `.glb` props already (Kenney nature kit, CC0, 153 glbs, 8 MB) with per instance palette re-projection | already on the right road; the palette rule ("colour comes from our per instance palette, that is the whole game") means Meshy textures must be replaceable by vertex colour or a palette map, not baked albedo |
| Chameleon 3D prop hunt (same repo, `docs/HANDOFF-3d.md`, `PROPS-MANIFEST.md`) | same stack | the hiding game's readability law: no ambient particles, nothing that is not information; props must read as one silhouette family |

What Ripcord already proved (`satellites/ripcord/docs/FORGE3D.md`): Meshy →
Blender clean-up → glTF with named materials → `gltfpack -kv -noq` → 112
meshes at ~2.3 MB total, a triangle budget per part (1200) measured in a
report, painted renders that feed the same art pipeline. That is the pipeline;
the new work is the budget and the loading strategy per game.

```
You are planning and then building the first skinned batch for a three.js
world in the Sky Wolf fleet: [DEWBALL at satellites/dewball/ | ABDUCT A
CHAMELEON at /workspaces/abduct_a_chameleon/ (clone it there if missing) |
CHAMELEON 3D prop hunt, same repo]. The Director's brief: "we can now make
really good assets for it and actually skin the whole world, but I'm nervous
that it would crash the game if I put a whole bunch of detailed 3D images in
the world, so we'd have to figure out the logistics of that code." Your job
is the logistics FIRST, one asset SECOND, and a batch only when the gate
holds. Read first: the game's own HANDOFF / AUDIT-NOTES / docs, the W1
section of lucid-winds/HANDOFF-SEP02.md, satellites/ripcord/docs/FORGE3D.md
(the Meshy pipeline that already works), and the memory rules in
lucid-winds/docs/brain/INDEX.md about headless WebGL and looking at the world.

PHASE 0, BUDGET, no art yet (one commit):
- Instrument the game: a dev overlay line (behind the game's existing dev
  flag) showing draw calls, triangles, textures, and geometries from
  renderer.info, plus frame time as a median over 120 frames.
- Measure the world as it is on a 4x CPU throttled headless run at 375x667
  and 844x390, and write the numbers into docs/SKIN-BUDGET.md. Then set
  the budget as multiples of today: draw calls at most 2x, triangles at
  most 3x, texture memory at most 24 MB total, and the frame time median
  must stay under 12 ms at 4x throttle (a Pixel 9 is the reference device).
  A gate script, test/skin_budget.mjs, asserts every number and FAILS today
  if you set the numbers too tight (watch it fail once on purpose by
  lowering a limit, then restore).
- Decide and write down the loading strategy: all skins load lazily after
  the first frame, by zone or distance, with the primitive as the fallback
  until the glb arrives; every glb goes through gltfpack -kv -noq; textures
  are a shared 2048 atlas per category (no per prop textures) in KTX2 or
  a 1024 JPG fallback; repeated props stay InstancedMesh (one material per
  category, per instance colour by vertex colour or a palette uniform, the
  way Abduct already does it); LOD at two levels only (full within 25 m,
  a 300 triangle proxy beyond); frustum culling on, shadows off unless
  they are on today.

PHASE 1, ONE ASSET (one commit): take the single most visible prop family
(the Director names it; default: the landmark/structure the player sees
most), produce ONE Meshy mesh through the FORGE3D pipeline (the meshy
driver has no task id persistence: never kill and rerun a generation, it
double spends), fit it to the budget, load it lazily with the fallback,
run test/skin_budget.mjs, and SHOOT IT from where the player stands at both
viewports, then the worst angle you can find (under the floor, the edge of
the map, into the light). Open the images. Write three things wrong in
docs/SKIN-BUDGET.md before you fix them.

PHASE 2, THE BATCH: only if Phase 1's gate is green and the Director has
seen the screenshots. Batch by category, atlas per category, one commit per
category, the gate after each. Stop the moment a number crosses the budget
and report which category did it.

RULES: FILE FENCE: the one game named, nothing else. Never hand edit a
vendored copy in lucid-winds/satellites/ of a game whose source lives in
another repo (Abduct/Chameleon): fix upstream and re-vendor. Keep the
primitive path working forever (it is the fallback and the headless path).
No ambient particles, no decoration that is not information (the hiding
game especially). Gates one at a time on this two core box. git pull
--rebase first, git add the fence only, never push to main. Report:
today's numbers, the budget, Phase 1's numbers, the screenshot paths, and
the meshes' triangle counts.
```

## DISK

Today: 3.0 GB → 4.6 GB free on the 32 GB workspace disk. `/tmp` is a different
disk with 36 GB free and is where big work belongs (it survives stop/start,
not a rebuild).

Left on the table, your call, all reversible:

| item | size | what it is | how |
|---|---|---|---|
| `/workspaces/tools/blender-4.5.3-linux-x64` | 1.2 GB | the Blender the Ripcord forge uses | move to `/tmp/tools/` and symlink; re-download after a rebuild (5 min) |
| `~/.claude/projects/-workspaces-lucid-winds/*.jsonl` older than 14 days | 0.3 GB | old session transcripts (what `--resume` reads) | delete only the old ones |
| `~/.claude/projects/-workspaces-lucid-winds/<session dirs>` | ~1.0 GB | tool result caches of past sessions | safe to delete for sessions you will not resume |
| `functions/node_modules` | 346 MB | the Cloud Functions deps | `rm -rf` and `npm ci` again on the next `firebase deploy` |
| untracked `assets/assets/*-2026083*`, `assets/zoetropes-20260831` | 150 MB | the Aug 30/31 art drops | already in the vault (`vault-ripcordart-20260831`); can leave the working tree |
| `.git` | 3.6 GB | the public repo's history, binaries do not delta | a full repack needs 3.6 GB of scratch, do not run it on this disk |

## ORDER (and the lanes)

Lane A (Conduit): **C1** → Stephen plays → M1 answer → **C2**.
Lane B (music): **M1** (fences do not touch Conduit's index.html: C1 owns it;
if M1 and C1 run at once, M1 skips Conduit, which already reports).
Lane C (stores): Stephen #7 and #8 first → **S1** and **P1** (separate fences,
can run together).
Lane D (art): **D1** any time; the Meshy **W1** for ONE game at a time, Dewball
first (the only one whose source is in this repo).
Lane E: **T1** any time. **R1** after Stephen's three rounds.
Lane F (3D and VR, added Sep 03): **V1** any time, it is read only on the games and
writes docs/ and QUEST-COMPAT.md; **V2** after Stephen picks a game from
docs/3D-VR-SHORTLIST.md, fenced to that one game. Both prompts in `HANDOFF-3D-VR.md`.
Lane G (Keepsies, added Sep 04): the marble game, `HANDOFF-KEEPSIES.md`. New folder
`satellites/keepsies/`, so its fence overlaps nothing. Built as ONE unattended overnight run,
K0 to K3 back to back (the prompt is at the top of that file); Stephen's phone notes fold in as
K1.5 whenever they arrive. One Opus at a time on it; a later session resumes from its SESSION STATE.

Two terminals that are always safe together: any two of {C1, M1 minus
Conduit, S1, P1, D1, T1, W1 Dewball}. Never two tasks on the same game.

After each Opus task lands on the branch: tell Fable. Fable diffs it, runs the
gates once more alone, looks at the screenshots, and pushes
`add-sproing-jumper:main`.

## PUB1 — the catalog, ready for the ad networks (overnight, needs nothing from Stephen)

Added the evening of Sep 02. GameDistribution and GameMonetize replied in early
August with intake steps; two ZIPs exist (Blooming Words, Hues); the next actor
has been Stephen for a month (accounts, payment details, game IDs). This task
makes everything else ready first, so his part stays fifteen minutes per network.

```
You are preparing the Sky Wolf Studio catalog for the HTML5 ad networks, in the
lucid-winds repo, branch add-sproing-jumper. Nothing here needs the Director;
he creates the network accounts later, and everything you make tonight must be
ready the moment he hands over a game ID.

Read first: PUBLISHING.md (the status board, the pilot, the verified SDK
contracts), scripts/pub_build.py (all of it), DONE-LEDGER.md, HANDOFF.md, and
the PUB1 section of HANDOFF-SEP02.md. Two ZIPs exist already (Blooming Words,
Hues) with placeholder IDs; they are your reference for what "done" looks like.

THE JOB, in order, one commit per numbered step:

1. PICK TEN. From scripts/catalog.mjs (the one counter; never regex the
   catalog) choose the ten strongest candidates for GameDistribution and
   GameMonetize by these criteria, written down per game in publish/QUEUE.md:
   openable (not dev-gated); self contained (no Firebase, no Leaflet, no CDN
   fonts the ZIP cannot carry, zero external calls after the build pass); ZIP
   under 20 MB; a win or round-over screen where the midroll can hook (a named
   completeLevel, or the _sbCapEarn site the builder auto-hooks); plays at
   375x667 with 48px targets; fun without the Sky Wolf economy. Exclude
   Blooming Words and Hues (done), Jimothy (step 4), the 12 vendored games
   (HANDOFF-MUSIC.md lists them), and the In Development tab. Rank them, say
   why, and list what you rejected and why.

2. BUILD TWENTY ZIPS. For each of the ten: python3 scripts/pub_build.py
   satellites/<game> --target gd, then --target gm (placeholder ID; the
   Director rebuilds with the real one). For EVERY ZIP: unzip to /tmp, serve
   it, boot it headless in Chrome at 375x667, play one round to the win screen
   with real pointer events, and assert: zero requests to any of our domains,
   zero 404s of its own files, the SDK script tag present verbatim, the ad
   adapter hooked (window.__pubAd defined and called once at the round end;
   log the call), no console errors. Record each result in QUEUE.md with the
   ZIP size. A game that fails is fixed in the BUILDER (scripts/pub_build.py),
   never by hand editing a ZIP, and the fix is re-run on every ZIP built so
   far.

3. MARKETING SIZES. For each of the ten, the mandatory images at 512x384,
   512x512, 200x120 and the optional 1280x720, 1280x550, in
   publish/marketing/<game>/, rendered from the game's real art (the portal
   thumb and the game's own assets; never a debug state, never a price or a
   date baked into the image). Render a contact sheet of all fifty, OPEN it,
   and write three things wrong in QUEUE.md before you fix them.

4. JIMOTHY DIET. The source is satellites/stream-hop (404 MB as-is). Produce
   publish/dist/stream-hop-diet-{gd,gm}.zip under 60 MB by dropping unused
   decade art, alternate skins beyond the default set, and every music file
   (the game must boot and play silent with no errors). Document exactly what
   was dropped and prove it boots and plays a round headless, same assertions
   as step 2.

5. THE PITCHES. Write publish/PITCH-CRAZYGAMES.md and publish/PITCH-POKI.md:
   their submission requirements as of today (read their developer docs; cite
   the URL and the date read), which three of the ten fit each platform's
   taste and why, and the submission text in the Director's voice (no dashes,
   commas only; "Sky Wolf Studio", singular). Then write the two replies for
   GameDistribution and GameMonetize as publish/REPLY-GD.md and
   publish/REPLY-GM.md, fresh, saying the ZIPs and images are ready and asking
   for nothing but the game entry.

RULES: FILE FENCE: publish/**, scripts/pub_build.py, and the status board in
PUBLISHING.md. Never edit a game under satellites/. Never push to main. git
pull --rebase origin add-sproing-jumper before the first edit and before each
commit; git add only the fence. Gates one at a time on this two core box.
Every claim in QUEUE.md carries the command and its last line. Report: the
ten, the twenty ZIP sizes, what failed and what you changed in the builder,
the diet build size, and the exact three things the Director must do per
network, naming the file to paste from.
```

**When Stephen is ready (fifteen minutes per network, any day):** create the
developer account at gamedistribution.com, then gamemonetize.com, fill in
payment details, create one game entry, copy the game ID, paste it to Fable.
Fable rebuilds the ZIP with the real ID the same hour; Stephen uploads it and
sends the reply from `publish/REPLY-GD.md` or `REPLY-GM.md`.
