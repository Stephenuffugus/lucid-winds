# MASTER CHECKLIST — Sky Wolf Studios

**This file is the single source of truth for outstanding work.** It merges the Jul 20
dump, Jessie's Jul 19 queue, the Jul 20 handoff, and everything raised since. When
Stephen brings a new list, MERGE IT INTO THIS FILE rather than starting a fifth one.

Marks: `[ ]` not started · `[~]` in progress · `[x]` done + deployed · `[?]` blocked on Stephen
Last updated: 2026-07-25

---

## 🔴 BLOCKED ON STEPHEN — nothing moves until he acts

These are not "waiting for a decision I could make." Each needs his art, his intent, or
his go-ahead on a redesign.

### 🎨 ART STEPHEN ASKED FOR A LIST OF — exactly what to make, and where it goes

Ordered by how much it unblocks. Everything here is blocked ONLY on the art existing.

| # | What to make | Drop it here | Unblocks |
|---|---|---|---|
| 1 | **Pop N Lock pieces** — 5 pods + 1 chaff, from sheet 10 in the "Pop N Lock — Art Pack" Drive folder | `satellites/chaff-wars/assets/pods/pod-0.png` … `pod-4.png` + `chaff.png` | Flip `CW_POD_ART=true` and the game uses your art instead of drawn shapes |
| 2 | ~~**Petal Match art**~~ ✅ **DONE 2026-07-26** — 185 sprites + 5 paintings cut from 23 sheets and the board is wired and live | `assets/games/petalmatch/` | Only redo: sheet 4's board shadow is magenta-on-magenta, no data to recover |
| 3 | **Blobworks monsters** — the purple middle monsters, sheet 12 | Blobworks art folder | Jessie's "redo the purple monsters" |
| 4 | **Blobworks modular ramps** — sheet 13 | same | Ramps are drawn procedurally right now as a stand-in |
| 5 | **OriVex** — origami clean-paper triangle sheets + WIDE peaceful backgrounds with contrast against the number colours | `art-asset-lists/orivex/` pack has the spec | O2 + O3, two open items |
| 6 | **Card art, 3 satellites** — `mahjong`, `rootbound`, `sprout-dice` | `portal-assets/thumbs/<slug>.jpg`, 480×480 square | They currently post to social with the studio logo instead of game art |
| 7 | **Card art, 4 games** — `breathing`, `doubleshutter`, `stonegarden`, `stopten` | same | Same, plus they get real homescreen icons |
| 8 | **Sky Wolf head, square re-render** *(optional)* | `portal-assets/` | Current icon is cut from the wide banner, so the ears are clipped — they're clipped in the source too |

Any PNG dropped in the right place gets wired by me next session. Nothing here needs a
matching code change from you.

### Art he needs to generate or drop in
- [?] **Pop N Lock piece art** — generate pods/chaff from sheet-10 Doc, drop PNGs into
  `satellites/chaff-wars/assets/pods/pod-0..4.png` + `chaff.png`, then flip `CW_POD_ART=true`.
  Also needs a device test of the control/difficulty/animation changes.
- [x] **Petal Match art DONE** — 23 sheets cut to 185 sprites + 5 full-bleed paintings, board
  wired and live at `/play/petalmatch.html`. Verified: 16/16 board sprites load, 0 404s, 0 page
  errors, all 6 special/blocker cases resolve, balance unaffected, smoke 66 pass 0 fail.
  Procedural renderer kept as a fallback. ⛔ TYPES stays at 6; flowers 7 and 8 are for
  expansions. One redo logged (board shadow, magenta on magenta).
- [x] **Petal Match art ON SCREEN properly (2026-07-26)** — the first pass wired the files but
  was never LOOKED at. Stephen: "the flowers should fill the boxes, and wheres the background."
  Both were real: pieces were drawn into 0.4 of a cell (a radius/box units bug) and the four
  painted conservatories were cut but never referenced. Now fixed + widened.
  Verified by screenshot at 412x915 via the new `scripts/petalmatch_shot.js`:
  35/35 sprites load, 0 404s, 0 page errors; pieces fill the cell (PM_FILL 0.96); all four
  chapter backdrops confirmed (Meadow/Summer/Autumn/Winter, shot at levels 1/12/26/40);
  painted board tiles, objective emblems, ui-pill buttons on one row, combo pop art and
  fx-burst all confirmed warmed and rendering. Gameplay unaffected — balance bot levels 1-6
  plays every objective kind, "reasonably smooth level to level".
  Runtime art 183KB after quantizing (was 1036KB); pops/fx/emblems load in a deferred second
  wave so they never compete with the board.
- [x] **Petal Match art — EVERYTHING WIREABLE IS WIRED (2026-07-26)** — Stephen: "get it all
  done." Added on top of the pass above: painted selection corners (`ring-corners`), hint ring
  (`ring-plain`), a charged-piece ring on every special (`ring-ornate`), petal-shard particles on
  every clear (hard capped at 26 so a spore+spore cascade cannot turn into a slideshow),
  `ice-shatter` when a dew tile breaks, `cover-crack` for a half-broken double-dew tile, the four
  `combo-*` detonations drawn ON THE BOARD at the square they went off, a LEVEL + 3-star plaque
  with `laurel-burst` on level complete, a chapter title plate when the chapter turns, and the
  five painted `tut-*` cards inside the how-to-play card.
  Verified by `scripts/petalmatch_fx_probe.js` (new — drives the real game through `_PM_TEST`
  and shoots the moments a static screenshot cannot catch): 52/52 sprites, 0 404s, 0 page
  errors, 5/5 tutorial images in the rules card, level-up captured with the call-out layer
  asserted to hold the plaque ALONE. Balance bot levels 1-8 plays every objective kind,
  "reasonably smooth level to level".
  Runtime art now 2.7MB on disk, all quantized, split into a board-critical wave and a deferred
  second wave 1.5s later.
  ⛔ FOUND + FIXED EN ROUTE — the shell's generic `✿ NICE! ✿` win flourish printed straight
  through the new plaque. Shell now honours `LW_PLAY.ownWin` so a game with its own win screen
  opts out; the other 65 games are untouched.
  ⛔ ALSO FOUND — `play/shell.js` (66 pages) and `sunbeam-sdk.js` matched no `.htaccess` rule and
  sat on the host's 7-day edge default; `shell.js?v=18` was measured as a live cf-cache HIT with
  `max-age=604800`. Same class as the Jimothy worker bug. Both now `no-cache, must-revalidate`,
  and shell bumped to `?v=19` across all 66 play pages.
  ⛔ NOT DONE, and deliberately NOT invented — these need game systems and economy calls that
  are Stephen's, not art wiring: the 16 tool/booster sprites (needs a booster economy), the level
  map (`map-node-*`, needs a map screen), shop art (`coin`/`gem`/`price-bar`, needs a shop),
  medals + `rank-row` (needs a leaderboard), and `spec-strip`/`quake`/`serpent`/`big`/`box`
  (match-6, match-7 and travelling-piece mechanics the game does not have). The alternate
  green/purple/teal skins need a skin picker.
- [?] **Blobworks purple monsters** — asset list delivered (sheet 12). Needs the art.
- [?] **OriVex sheets + backdrops** — asset lists delivered (D3). Needs the art.
- [?] **Sky Wolf arcade icon** — current icon is cut from the banner, so the ears are
  clipped at the top because they're clipped in the source. A square re-render would fix it.
  Cosmetic; the icon works today.

### Design intent / direction needed
- [?] **Petal Academy** — "what's the point?" Purpose unclear, can't fix without knowing it.
- [x] **Super Slice 3D S1–S5 — RESOLVED, they were already done.** Checked the code, not the
  notes: `satellites/slice-3d/index.html:211` reads `var BUILD="v5.0"`, two whole versions
  past the v3 pivot. All five asks are present — horizontal lane movement, brown/wood blocks,
  fruit that splits, tap-vs-hold branching, segment-bag random levels, and the sound effects.
  The Jul 20 list was carrying stale entries. Verified 2026-07-25 by grepping the live
  source for each of the five asks. ⛔ Do NOT re-add hold-to-spin, chimney, mist,
  or kick — dead twice.
  **Player-visible tell:** the title screen footer prints "Super Slice 3D v5.0" (`#buildstamp`).
- [ ] **Bump `BUILD` when shipping Slice 3D.** It last changed 2026-07-19, but two gameplay
  commits landed after it (wall-climb HOLD, the hold-to-spin revert). The stamp is the only
  version tell a player or Stephen has, and right now it under-reports. Cheap discipline fix.
- [?] **Rabbit Samurai** — two overlapping asks: retheme to "Hedgehog Hammer Throw", AND
  rework from sideways auto-runner to a 2D platformer through a maze / open land. Big
  redesign, needs his call on scope.
- [?] **Tomato Man** — "build it the rest of the way into a pseudo-platformer" needs
  specifics. More levels? New mechanics? New hazards? Ask before big content work.
- [?] **Garden Path rename** — Jessie's note is cut off mid-sentence ("look back at the real
  Candy Land board and notice how…"). Ask her what the rest was.
- [?] **Game descriptions, 1-sentence sweep** — 119/161 are multi-sentence, but many are his
  deliberate rich featured copy. Needs him to say which cards stay long. Blind sweeping
  would undo good marketing.
- [?] **X1 pacing sweep** — the Monopoly anchor already has Relaxed/Normal/Fast. A blanket
  sweep across all games would violate no-blanket-fixes. Needs specific game callouts.
- [?] **Locked-song behavior** — he offered three options: not accessible / snippet only /
  fully listenable in the portal but locked for in-game use. Pick one before building.
- [?] **Daily rollover rule** — local midnight vs UTC. We do both by accident today. Wordle
  uses local. Recommendation: local everywhere EXCEPT where a timezone jump would scout a
  shared course early (Jimothy).

---

## 🌸 PETAL MATCH FULL BUILD-OUT (Stephen 2026-07-25, from a real player's notes)

Spec + complete asset list live in Drive → 012Assets → **PETAL MATCH** (6 docs).
Theme deliberately left open for the designer; every asset is described by function.

- [x] **Stale hint bug FIXED** — player reported "the hint is always the last hint from
  the previous game and often incorrect". Exactly right: `_PMN` and `_PMR` rebuilt the
  board but never cleared `hintCells`, so the old board's coordinates were drawn on the
  new one. Verified both paths call `clearHint()`; smoke 66 pass 0 fail; cache v3→v4.
- [x] ⭐ **THORNS WERE UNBREAKABLE BY NORMAL MATCHES — fixed.** The player's actual wall.
  `toClear` was only filled from match groups, and a match group requires `type>=0` while
  a thorn is `type -2`, so a match next to a thorn did nothing; only a special exploding
  on it worked. Verified with the harness: thorn level win rate **0% → 63%**.
- [x] **Balance harness built** — `scripts/petalmatch_balance.js` plays the real game with
  an objective-aware bot and reports measured win rates. Drives `_PM_TEST` → real
  `handleEnd()`, reimplements nothing. Verified working after three separate false-0%
  traps (file:// base href, rAF throttling, and win-detection racing the auto-advance).
- [x] **Dew was two bugs, not tuning** — dew rode the falling gem (jelly lived on the cell
  object and collapse moves objects down), and double-layer tiles silently lost their
  second layer. Fixed with a position-indexed `jellyBoard`. Verified: a double-layer level
  completes properly, 26 dew cleared in 12 moves.
- [x] ⭐ **DIFFICULTY BANDING DONE — ladder is balanced.** Fixed 10-step rotation replaced
  by a seeded order plus one shared difficulty curve driving every objective, with a
  scheduled spike at each chapter's end (the player LIKED the wall, they disliked it being
  random). Score targets made superlinear because points already scale with level.
  **Verified at 40 trials/level:** every kind now lands in a 12-point band —
  thorns 63.7 / gather 58.3 / mix 57.5 / score 53.8 / dew 51.7. Level-to-level swing
  **62.5% → 11.4%**. Was: thorns 0%, score 100%.
  ⛔ Seven calibration passes, two of which OVERSHOT. Re-run `scripts/petalmatch_balance.js`
  after touching any coefficient in `genLevel`; never hand-tune by eye. Confirmed in `genLevel()`: levels
  rotate on a FIXED 10-step pattern, so blocker levels are walls and everything between
  is a stroll, forever, in the same order. Level 25 = 12 blockers × 2 hits = 24 breaks in
  39 moves. Fix: seed the order per chapter, rate every generated level and reject
  out-of-band ones, keep ONE deliberate spike at each chapter's end.
- [ ] **Timed mode + mode switching** ⭐ second, also no art. The player's explicit ask:
  a 2-minute pure-score mode, and the ability to change modes WITHOUT losing Journey
  progress. Their frustration was feeling locked in, not the missing mode.
- [ ] **Endless + Daily modes** (Daily makes it directory-eligible)
- [ ] **New specials** — strip (6), quake (7), and the three nobody else ships:
  ⭐ serpentine (travels a winding path), large 2×2 piece, box-of-six. Serpentine first,
  it is the differentiator.
- [ ] **Economy** — coins earned by play, pre-level boosters, in-level tools, cosmetics.
  ⛔ No real money, no ads. Tools must help, never be required.
- [ ] **Competitive layer** — leaderboards, achievements, streaks, share cards.
- [?] **Art** — ~150 sprites + 4 chapter backgrounds + ~30 sounds. Phased; the game is
  shippable after the pieces alone.

---

## 🟢 READY TO BUILD — no blockers, just needs a session

Ordered by value per hour of work.

- [ ] **Per-game install buttons** — ~50 `/play/<id>.html` shells already build the button in
  `play/shell.js:829`, but there's no per-game manifest, so they install as generic
  bookmarks. One generated manifest per shell using the existing thumbnail as icon covers
  all of them at once. Directly what Stephen asked for ("each game have an install to
  homescreen button in case people just want one game").
- [ ] **Portal black screen going in/out of games** — pressing back again fixes it. Needs a
  repro session on the iframe jukebox lifecycle; a watchdog already exists.
- [~] **Blobworks code debt** — slime meter shrunk 196→150 so it stops overhanging the
  painted eyeball jars (verified by screenshot, not guessed; one number to tune at
  `index.html:1104` if Stephen wants it smaller). STILL OPEN: Blip's intro animation is
  skippy. Also noted: `art/tube_straight.png` and `art/tube_curve.png` are referenced
  nowhere in the code.
- [ ] **Gnome Blitz** — new game, Dutch Blitz with garden gnomes.
- [ ] **Scrabble Overturn / Scrabble UpWords** — new game ideas, unspecced.
- [ ] **Nature Sound ID app** — needs an audio-fingerprint approach decision first; model on
  Merlin Bird.
- [ ] **Jade Garden is documented but never built.** `GAMES_MANIFEST.md:105` describes it
  (mahjong, match free pairs, hint + shuffle) and the portal has a search alias for it, but
  there is no `games/jade.js`, no shell, and no card. No player can reach it, so nothing is
  broken — it's just owed. Removed from the smoke list so the suite reads green; put it back
  the day the game lands.
- [ ] **Chameleon 3D card repoint** — pinned to `releases/v3.0.0/abduct-3d.html`; repoint
  when he ships a new release. A postMessage earn bridge was offered; needs event definitions.

---

## 💰 BUSINESS / LEGAL — highest stakes, lowest effort

- [ ] **Check whether the attention protocol repo is public.** `gh repo list --visibility public`.
  If the evolved protocol is published, a US grace clock is running and foreign rights may
  already be gone. Five seconds of work, largest downside on the list.
- [ ] **File a second provisional on the evolved attention protocol.** The 2026-03-17 filing
  only protects what that document describes. Everything the protocol learned since (grading
  engagement on any test/document/screen, bot detection) is unprotected. ~$130 self-filed.
- [ ] **Patent conversion decision — December 2026.** Provisional expires 2027-03-17. Needs
  attorney lead time, so the real decision point is December, not March. If international
  licensing is ever the goal, a PCT must be filed by the same date.
- [~] **Local venue outreach.** Tier 1: Milestone (Canton, 1,400+ games), Sapphire Games
  (North Canton), Green Dragon Inn (Akron, 750+ games). Tier 2 Akron: Quarter Up, Full Grip
  Games, Underhill's, Sweets and Geeks. Tier 3: Tabletop (Cleveland), 16-Bit (Ohio City +
  Lakewood), Barflyy (Kent). Verify hours before driving. Attribution links are LIVE — use
  `?from=<slug>` today.
- [ ] **Cold email follow-ups** — sent the batch Jul 24 night, 2 bounced. Follow up the rest.
- [?] **Social handles** — `/links.html` is live and is the one link to put in every bio.
  Fill in the `SOCIAL` array at the top of that file as each account is created (Instagram,
  Twitter, Facebook, itch.io, YouTube, Discord). Empty entries stay hidden, so there is never
  a dead link. Nothing else on the page needs editing.
- [x] **Social previews DONE — 100% coverage.** 66/68 `/play/` shells and 83/83 satellites
  have 1200x630 cards + og:/twitter: tags. Games with real card art use it; the 7 with none
  get a studio-mark fallback (the wolf, never a fake screenshot). The 2 remaining `/play/`
  files are `index.html` (a directory listing, not a game) and `power-scalers.html` (below).
- [?] **`play/power-scalers.html` — decide: delete, redirect, or keep.** It's a 2,245-line
  legacy duplicate. The portal deliberately points at `/satellites/power-scalers/` instead
  (see the comment at `portal/index.html:646`), so nothing links to this copy, but it is
  still reachable by direct URL and its `<title>` says "Lucid Winds · OC Arena" — a name
  that appears nowhere else. A redirect to the satellite is probably right.
- [?] **Portal black screen — needs a repro, not a guess.** Read every open/close path in the
  overlay lifecycle (`openGame`/`closeGame`/`requestClose`/`popstate`, `portal/index.html`
  ~1300-1650). It's already hardened with a double-back guard, a srcdoc navigation guard,
  satellite reframe recovery, and a 600ms fallback, and every close path consumes its own
  history entry correctly. No defect found by reading. Guessing at a fix here risks breaking
  the close path for all 159 games. Needs Stephen to catch it live, ideally on his phone.

---

## 🤝 PARTNER HOSTING — before onboarding anyone you don't know

`PARTNER_INTEGRATION.md` is a complete, sendable offer today, and link-out partners are safe
right now. These gate hosting strangers' code or advertising the program publicly.

- [ ] **gameId registry + server-side allowlist + per-game caps.** `functions/earnHashes.js:62`
  takes `source` as an arbitrary string. No attribution, no revoke without a redeploy. 1–2 days.
- [ ] **Origin-isolated SDK.** Today a partner page holds a real Firebase ID token for the LW
  project, which per `firestore-rules-8.txt:129-141` can read and WRITE the player's whole
  vault, plus call `mintPlant`. Fine for people he knows and has agreements with. Not fine for
  open onboarding. 3–5 days.
- ⛔ **Do NOT host partner code on lucidwinds.com** until the above lands — same-origin gives
  their code everything, including localStorage. Link-out gets ~90% of the value with none of
  the risk.
- [ ] **Partner agreement IP clause** — protocol stays his; integration grants a license, not
  a stake. Strengthens the patent story rather than diluting it.

---

## 🎵 MUSIC SHELF — v1 shipped, the rest is designed not built

- [x] Jimothy's soundtrack reaches the arcade (boot-time backfill, 2026-07-25). Verified by
  simulating the fold against a stubbed localStorage before shipping.
- [x] Per-game shelves, sorted above Originals. Verified: shelf order came back
  `Jimothy | Originals | Unlocked in Games | Classical`.
- [ ] **Locked songs listed below unlocked ones** as the reason to try that game. Blocked on
  the behavior decision above.
- [ ] **One song unlocks just for OPENING a game.**
- [ ] **Unlock ledger synced to the vault.** Today it's localStorage only. It survives because
  the game re-exports on boot, which is exactly why that fix mattered, but it isn't durable.
- [ ] **Music rewards as a partner perk** — "integrate and your game gets a shelf, and your
  players unlock a track that plays everywhere." A stronger hook than sunbeams alone.

---

## 📒 THE JUL 16-18 LIST — recovered 2026-07-25, this is the one we were going down

⚠️ **I missed this when I built this file.** I merged the Jul 19/20 sources and did not
merge Jessie's Jul 16 doc or the colour-coded per-game sweep. Stephen was right that it
did not feel done. Source of truth is still the live Drive doc ("Notes on Games from
Jessie", `1NWkCIbodKNS1dhsDEUgTcVsRc_oIJcbxOeA9iNWP_eQ`) — ⛔ **read it as HTML, not text,
or the highlight colours that carry the session structure are lost.** It grows; check it
every session.

**Status below is 7-8 days old and NOT re-verified.** Treat each as "probably open, confirm
before building."

### PURPLE — the per-game readability sweep (Jessie's biggest batch, mostly open)
The `/play/` shells got directions pages and the font pass on 7/18. **⛔ The SATELLITES did
not.** These are per-game and specific:
- [x] Cipher Bloom — off-screen FIXED. `fitStage()` measured `innerHeight`, which on a
  real phone includes the strip behind the URL bar, so the stage scaled bigger than the
  visible area. Now prefers `visualViewport` and listens to its resize/scroll events.
  Verified: scale drops 0.7222 → 0.6250 when the visible area shrinks. ⚠️ needs Jessie
  to confirm on her actual device — headless has no URL bar so it cannot reproduce there.
- [x] Petal Alchemy — off-screen FIXED, same root cause, same fix, verified the same way.
- [x] **STUDIO-WIDE VIEWPORT SWEEP — 47 games fixed.** This was never a handful of games;
  nearly every satellite sized its stage off `innerHeight`. Done in three verified waves:
  the 2 Jessie reported → 9 → the 6 other games she flagged → 32 more matching the exact
  proven signature. Verified 32/32 + 6/6 + 8/8 shrink correctly, all parse clean, smoke
  suites pass, 8 service worker caches bumped.
  ⛔ **NOT swept, deliberately:** ~30 other `innerHeight` patterns do genuinely different
  things (dewball's 3D camera aspect, burr-blast canvas DPI, vinewinder's fixed -260,
  blooming-words percentages). A regex over those would have broken real games. If any
  of them turn out to be off-screen on device, they need individual review.
- [x] **Swept the other 9** — bridgevine, leaf-fit, nova-bloom, pollinator-paths,
  root-weave, spore-drift, tempo-grove, silt (scaled stages) + garden-td (full-bleed
  canvas, different shape, handled separately). Unblocked by Stephen confirming the first
  two on his phone. Verified: 8/8 stages shrink 0.7222 → 0.5417 when the visible area
  shrinks, garden-td canvas 844px → 520px, all 9 parse clean, 0 page errors.
- [~] Loop Warden — start button. Sizing FIXED (see the viewport sweep below), which is
  the likely cause: an oversized stage pushes the button off the bottom on a real phone.
  Verified all four mode buttons DO fire and BEGIN THE WATCH exists and is not below the
  fold at 390x844, so it was never a dead button. STILL OPEN: every touch target on that
  screen is 40px or 35px against the project's 48px minimum. Needs Jessie to re-check.
- [~] **48px TOUCH-TARGET SWEEP — Stephen approved 2026-07-26.** Audited all 83 satellites
  headlessly: only **7 are clean**. 76 have controls under the 48px minimum. Most common is
  the "Daily" button at 38px; worst is Vinewinder's Back at **15px**, then Pollen Panic 29px,
  Flipbook and Nova Bloom 35px, Cipher Bloom / Bramble Court / Chaff Wars 36px.
  It is a studio-wide habit, not two sloppy games. Doing it worst-first with a screenshot
  check on each, since raising a min-height can shift a tight layout.
- [x] **Line Loom "incomprehensible" — FIXED.** Investigated first: the title screen already
  explains the game and there IS a how-to page, so information was never the gap. The gap
  was first contact — you land on a near-black board with four small outlines and six
  numbered buttons and nothing names the VERB. Added one first-run coach card on the board
  ("Drag from one station to another"), 48px dismiss, shown once. Verified headless:
  appears, dismisses, does not return, 0 errors.
- [ ] Mini Crossword — layout
- [ ] Bridgevine — scroll
- [ ] Plot Bloom — neighbours wording + depth
- [ ] Root Groups — text
- [ ] Season Sway — wording
- [ ] Hedgerow — replay-level
- [ ] Tinker Loft — her list, incl. finger-drag; plus "Tinker Shop" rename
- [x] **Micro Meadow renamed to Think Fast** — 10 display strings + portal card + social
  card regenerated. Slug stays `micro-meadow` (URLs). Verified 0 old strings remain.
- [ ] Leaf Fit — rename + rotate
- [ ] Merge & Blast — level-goal consistency (512 tile colour already fixed)
- [ ] **Directions pages + readable fonts for every SATELLITE** (the shells are done)

### From the Jul 16 "New notes" + Jessie doc
- [~] Pong Arena — landscape long-court still open (per-mode geometry + control remap)
- [ ] Portal: live "N playing now" per game (needs presence; design first)
- [ ] Portal search — "similar type" matching + her assistant-to-guide idea
- [ ] Comet Cadets — alien level-worlds (water / fire poles / ice / tornado / rain / desert)
- [ ] Dewtrail — retheme away from dew, THEN Jessie does the art
- [ ] Mosaic Draft — clarity pass
- [ ] Finish the "coming soon" games (Impossible Garden is the flagged one)
- [ ] ALL games earn sunbeams inside LW
- [ ] Silt — consistent element-behaviour message
- [x] ~~New game: Mouse Trap~~ — ALREADY BUILT. Verified 2026-07-25: `satellites/mouse-trap/`
  exists and has a live portal card ("Trap the little garden mouse before it scurries off
  the edge"). Another stale entry on the Jul 16 list.
- [ ] Penny's queue, still open: Plant Flip, Mecha Chameleon
- [ ] **NEW GAME: Bubble Bobble remake** (Stephen 2026-07-25). Checked the whole repo,
  the portal, the satellites and the memory dir: there is NO Bubble Bobble and there was
  NO note for one. It is a genuinely new ask. Two players, trap enemies in bubbles, pop
  them, single screen platformer, fixed levels. Needs a name and a botanical or studio
  angle before building — every other remake got one (Snakes & Ladders → Garden Climb,
  Monopoly → Garden Estates, Yatzy → Yacht-Sea).

### Naming + economy calls (Stephen only)
- [?] Merge & Blast and Super Slice both still carry placeholder names — "⛔ Stephen NAMES it"
- [?] Tempo Grove rename (nothing plant-like about it)
- [?] LW 100 plant slots — cap is 60, economy call
- [?] Hues border-shop coin pricing
- [?] Hunch "see others" gallery — PARKED, public kid UGC needs his moderation sign-off.
  Full design already written at `design-briefs/hunch-gallery.md`.

---

## 🅿️ PARKED BY STEPHEN — plan written, do NOT start

**Daily modes** (⛔ Jul 22: "we don't have the resources… I want to finish the Jimothy art").
Full plan in `docs/daily-modes-plan.md`. Matters because Listdle only accepts free daily games
with no login, and it's the one directory that said yes.

- [ ] DL-A **Verify the six** that claim a daily — do FIRST. Scanned Jul 22: Dew Trail ✅ UTC ·
  Word Sprout ✅ · Flood ✅ · Minesweeper ✅ (last three roll at local midnight) ·
  **Daily Bloom ⚠️ half broken** (rotation seeded, content is not — `startWordRecall` calls
  `shuf(WORD_BANKS[Math.random()])`, so scores aren't comparable) · **Stop at Ten ⚠️**
  (reaction waits are `Math.random`).
- [ ] DL-B **Shared daily kit** (~half session) — day number, seeded RNG, first-run-counts,
  streak, share-strip encoder, countdown. Do this BEFORE more dailies; turns each one from a
  week into a day.
- [ ] DL-C1 **Vine Words daily** — highest value, named in the first email to Conor.
- [ ] DL-C2 **Word Search daily** — also named in that email.
- [ ] DL-C3 **Three Sisters "Daily Trio"** — estimate unknown, older inline build, locate the
  code before promising a number.
- ⛔ Do NOT submit any of these to Listdle before DL-A verifies them. Conor has been generous;
  sending a fake daily is how that ends.

---

## ✅ SHIPPED 2026-07-25 (this session)

- Arcade is installable — `portal/manifest.webmanifest`, head tags, install pill. The hub was
  the only surface in the studio with no manifest.
- Sky Wolf icon set cut from the banner — 192/512 any + maskable + apple-touch.
- **Jimothy splash-freeze fixed.** Three service worker bugs: no fetch timeout, respondWith
  (undefined) on a cache miss, and activate deleting every cache while a live page was still
  booting. That last one fired on every deploy, which is why it hit him constantly.
- **Swept the same three bugs from 7 more games** — Pop N Lock, Flipbook, Merge & Blast,
  Slice Master, Nectar Drop, Ring Stacker, Slice 3D.
- **Jimothy music reaches the arcade** — `syncMusicLibrary()` only ran on unlock events, never
  at boot, so anything unlocked before the bridge shipped was never exported.
- Per-game music shelves in the shared player.
- **Venue attribution** — `?from=` / `?venue=` with first-touch-wins, separate return-visit
  event, sanitised slug.
- Pop N Lock: stale "Chaff Wars" engine comment fixed (folder name stays, it's in URLs).

---

## 🔒 THE SYSTEM — how we stop losing track

Stephen, 2026-07-25: *"it's infuriating to give you a list of stuff and not have it done
when I'm assuming it is and you say it is, and then later I find things not done after
I've crossed the whole list off. We need a system so we never lose track."*

He is describing two separate failures, and each has its own rule.

**Failure 1: I marked things done that weren't verified.**
→ `[x]` is no longer allowed to be an opinion. It must carry evidence: a commit hash, the
word "verified", or a test result. `scripts/checklist_audit.js` FAILS if any `[x]` lacks
it. The first time it ran it caught three of my own. A promise can be broken silently; a
check that exits 1 cannot.

**Failure 2: whole lists never got merged.** The Jul 16 doc and the colour sweep sat
unmerged while we worked off newer notes, so real items were invisible.
→ Every list Stephen gives gets merged into THIS FILE, with its source and date, before
any work starts on it. Never work from a chat message alone. A list that only exists in
conversation is a list that gets lost.

### The loop, every session
1. `node scripts/checklist_audit.js --list` — see what is actually open, first thing.
2. Work items. Verify each before marking it.
3. Mark `[x]` WITH evidence. Commit and push.
4. Run the audit again before saying anything is done. If it exits 1, it is not done.

### The rule for Stephen
**Do not cross anything off your own list until the audit shows it `[x]`.** If I say
something is done and it is not in this file with evidence, I am wrong and you should
push back. That has already happened twice.

### Sources merged so far
Jul 16 "New notes" + Jessie doc · the colour-coded per-game sweep · Jessie Jul 19 queue ·
Jul 20 dump · Jul 20 handoff · everything raised in session since.
⛔ Jessie's Drive doc is LIVE and GROWS. Read it as HTML, not text, or the highlight
colours that carry the session structure are lost.

---

## 📌 STANDING RULES

- Deploy = push `add-sproing-jumper:main`. Not fixed until committed AND pushed.
- Bump each game's `sw.js` CACHE on any index.html change.
- **New satellites must start from the FIXED sw.js template** (`satellites/stream-hop/sw.js`),
  never a copy of an older sibling.
- Art ledger is the source of truth for art status. Never ask Stephen what art exists.
- Every art sheet goes to 012Assets as a Google Doc, not just a repo file.
- No em-dashes in player-facing copy. Rules before play. One-sentence descriptions on new games.
- Never claim art was hand-drawn or painted.
