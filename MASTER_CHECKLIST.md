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

### Art he needs to generate or drop in
- [?] **Pop N Lock piece art** — generate pods/chaff from sheet-10 Doc, drop PNGs into
  `satellites/chaff-wars/assets/pods/pod-0..4.png` + `chaff.png`, then flip `CW_POD_ART=true`.
  Also needs a device test of the control/difficulty/animation changes.
- [?] **Petal Match gems** — drop 8–28 flower PNGs into `assets/games/petalmatch/` (dir does
  not exist yet) per `project_petalmatch_art_spec.md`. Then it's a mechanical draw→drawImage
  swap. Not doing a speculative procedural rework that his art would discard.
- [?] **Blobworks purple monsters** — asset list delivered (sheet 12). Needs the art.
- [?] **OriVex sheets + backdrops** — asset lists delivered (D3). Needs the art.
- [?] **Sky Wolf arcade icon** — current icon is cut from the banner, so the ears are
  clipped at the top because they're clipped in the source. A square re-render would fix it.
  Cosmetic; the icon works today.

### Design intent / direction needed
- [?] **Petal Academy** — "what's the point?" Purpose unclear, can't fix without knowing it.
- [?] **Super Slice 3D S1–S5** — ⚠️ possibly already superseded. The Jul 19 batch says the v3
  pivot SHIPPED (horizontal runner, original ruleset, fruit/wood/mushrooms). The Jul 20 list
  still tracks S1–S5 as open. **VERIFY WHICH IS TRUE before building anything here**, then
  re-test. ⛔ Do NOT re-add hold-to-spin, chimney, mist, or kick — dead twice.
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

## 🟢 READY TO BUILD — no blockers, just needs a session

Ordered by value per hour of work.

- [ ] **Per-game install buttons** — ~50 `/play/<id>.html` shells already build the button in
  `play/shell.js:829`, but there's no per-game manifest, so they install as generic
  bookmarks. One generated manifest per shell using the existing thumbnail as icon covers
  all of them at once. Directly what Stephen asked for ("each game have an install to
  homescreen button in case people just want one game").
- [ ] **Portal black screen going in/out of games** — pressing back again fixes it. Needs a
  repro session on the iframe jukebox lifecycle; a watchdog already exists.
- [ ] **Blobworks code debt** — slime tube top-left too big (shrink), and Blip's intro
  animation is still skippy. Code, not art. Movement sheet already provided.
- [ ] **Gnome Blitz** — new game, Dutch Blitz with garden gnomes.
- [ ] **Scrabble Overturn / Scrabble UpWords** — new game ideas, unspecced.
- [ ] **Nature Sound ID app** — needs an audio-fingerprint approach decision first; model on
  Merlin Bird.
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

- [x] Jimothy's soundtrack reaches the arcade (boot-time backfill, 2026-07-25).
- [x] Per-game shelves, sorted above Originals.
- [ ] **Locked songs listed below unlocked ones** as the reason to try that game. Blocked on
  the behavior decision above.
- [ ] **One song unlocks just for OPENING a game.**
- [ ] **Unlock ledger synced to the vault.** Today it's localStorage only. It survives because
  the game re-exports on boot, which is exactly why that fix mattered, but it isn't durable.
- [ ] **Music rewards as a partner perk** — "integrate and your game gets a shelf, and your
  players unlock a track that plays everywhere." A stronger hook than sunbeams alone.

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

## 📌 STANDING RULES

- Deploy = push `add-sproing-jumper:main`. Not fixed until committed AND pushed.
- Bump each game's `sw.js` CACHE on any index.html change.
- **New satellites must start from the FIXED sw.js template** (`satellites/stream-hop/sw.js`),
  never a copy of an older sibling.
- Art ledger is the source of truth for art status. Never ask Stephen what art exists.
- Every art sheet goes to 012Assets as a Google Doc, not just a repo file.
- No em-dashes in player-facing copy. Rules before play. One-sentence descriptions on new games.
- Never claim art was hand-drawn or painted.
