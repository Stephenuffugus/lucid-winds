# WORKLOG — Sky Wolf Studios

**The done-ledger.** MASTER_CHECKLIST.md tracks what is OPEN; this file records what
SHIPPED, when, and where the proof lives. One dated section per work session, newest
first. Every entry carries its commit hash. Append here at the end of every session —
this is how Stephen sees everything that was done without re-reading git.

Rules for maintaining this file:
- Newest session at the top, one `##` per date (split by session if a date has several).
- Every line names its commit hash (or Drive doc id, or external repo + hash).
- Record decisions Stephen made inline where they landed, so the "why" survives.
- Deployment = pushed to main (Hostinger auto-deploys). External repos noted explicitly.

---

## 2026-07-26 — the big day: Petal Match finished, Jessie's list, the fleet sweep

69 commits pushed to main. Checklist ran 121 open at breakfast, ~90 by night, every
close with evidence (scripts/checklist_audit.js green throughout).

### 🌸 Petal Match — became "our version of Candy Crush"
- Green-sheet art cut with true chroma-key unmixing, board shadow remade + wired,
  art URLs version-stamped against the 7-day edge pin — `6181e431`
- Cover art (portal card, OG, icons) rebuilt from the painted share-card — `fd65891b`
- The honest hooks: daily streak (climbing Petal bonus), near-miss framing (same
  number as the progress bar), comeback grant (3 losses = free Bloom Burst) — `e6c11ca7`
- TIMED mode: 2 minutes pure score, Journey never touched by the switch — `c22be0a7`
- Timed pays Petals, 1 per 5000, capped 20/day like the daily (Stephen's call) — `44ac6865`
- Petals + powerups economy (DIG/CUT/WASH/BOOST/+5 Moves; local currency because the
  Sunbeam lane is locked to plants) — `ee46d4f9`
- Dew yield re-measured after the dewTotal() mechanic fix — `d0fb55a6`
- Ladder rhythm rework + the dew-was-decorative bug — `a4112aed`
- Visible build stamp v22 (staleness answerable by looking) — `89e5ab9e`
- Earlier same day: art wired/fill fixed/HUD to spec — `cfd26bdf` `10c5a38f` `1a516a85` `a3f19e6b`

### 🦝 Jimothy
- Login lockout instrumented: boot breadcrumbs auto-report the dying stage to Discord
  on the next good boot; live repro did NOT reproduce; SWV/CACHE drift fixed — `51eb37ff`
- Every bottle cap reachable (14.2% had bushed approaches, 0.89% fully walled;
  measured before and after, 0.00% now; zero new rng draws) — `888dbc63`
- Edge-stall cheat verified already fixed in code (wall-hops refuse outright)
- Long description now leads the How screen (Jessie's placement split) — `32ebbd89`

### 🗡 Super Slice 3D / Wall Climb
- Climb brake discoverability (how-row + toast) + BUILD stamp truth — `1a873a02`
- Stephen's playtest answered: portal split ("Super Slice Wall Climb" card beside
  Super Slice 3D, climb button out of the main menu), climb stick needs a committed
  angle (~27° not 3°), freefall handle clamps outside the wall, x10 jackpot varies
  within the top three bands per run, hold-brake KILLED on his verdict, and
  **Be the Blade** (his design): circle your finger to spin, handle strikes convert
  spin to height. Feel constants tuned blind — needs his phone — `659a4f13`
- ⛔ Lesson recorded: this codespace has no GPU; three.js games get a cheap boot
  check here and real verification on device. Four probe timeouts taught it.

### ⚡ Word Lightning (bloomzap)
- Full in-game storm retheme: Choose your storm (Drizzle/Downpour/Tempest), Vs Rival,
  navy/gray/lightning-yellow, all plant glyphs replaced, Next round button — `900d6432`
- Lexicon brag renders the real DICT.size (13,511) live, can never drift — `0c94ebf6`

### 🐭 Inkbound (grubtrap)
- Starter skin: measured every skin's in-play luminance; old default was the darkest
  (32.1). Astral Bindery freed first — `8cc7393b`; then Stephen ruled "premium is
  fine": Tide Pool (48.8, the lightest) starts everyone; earn ladder 5/10/20 — `3593c86d`
- Glide steering: one drag walks the mouse tile by tile (was one step per full
  swipe-and-lift); flick still steps one; dpad snappier — `3593c86d`

### 🎨 Jessie's 7/21 list (verified against code before working)
- Word Lightning + OriVex renames: already live (verified, not redone)
- Kakuro rules gate: already fixed by the 7/18 sweep (fresh-profile proof)
- Mini Crossword typing flows through the line (cursor parked at word tails) — `0f535a33`
- Hedgerow: rules gate, Next ground, Share (+ fixed "0 grounds" share bug) — `6a410965`
- Stop Motion camera permission flow (honest about the settings-app limit) — `d6fc6d84`
- Pop N Lock share-your-victory button — `dc270259`
- No Pain No Gain: Clear actually clears + Undo added — `546925d5`; de-cozied — `ceed659c`
- Flipbook: closed eyes redrawn, accordion menu, blank notebook — `cbd4cb3f`
- Portal copy: Inkbound + Plot Bloom one sentence, Mosaic twins untangled — `fc56aa7e`
- Feedback FAB dismissable for the day (portal) + feedback.js cache rules — `d36adfaa`
- Bridgevine "scroll": investigated, NOT reproducible, nothing changed (21 screenshots)
- Hunch (external repo Stephenuffugus/Hunch): early-submit hardened for touch —
  `hunch c43e256` prompt bank: 342 kid-playable prompts, jellyfish grammar off tier 1

### 📱 Fleet-wide
- **48px touch law, 83/83 satellites** — the fleet's problem was ONE illusion:
  48-52 CSS px inside 0.72-scaled stages rendering 34.7-37.6 real px. New permanent
  auditor `scripts/touch_audit.js` measures RENDERED px; 8-agent sweep fixed 63
  games; worst seven done earlier by hand; 4 stragglers finished; independent
  re-audit gated it — `da8b517d` `d84b3788` `cbd4cb3f`
- Per-game PWA install identity complete: last 4 shells (breathing, doubleshutter,
  stonegarden, stopten) got manifests + real-art icons; their OG cards upgraded from
  wolf-fallback; set.webmanifest id fixed — `f844b1f8`
- Jimothy boot-breadcrumb pattern available for any satellite

### 📄 Docs delivered to Drive 012Assets (generation-ready)
- PETAL MATCH — Pink + Purple Remakes on GREEN (the doc the 5 green sheets came from)
- HUES — Shop Build-Out (15 sheets, ~86 borders, Trophy Grove, economy sketch)
- ORIVEX — Origami Paper + Backgrounds (supersedes the stale repo pack)
- WORD LIGHTNING — Storm Retheme (10 sheets, mid-century spec)
- YACHT-SEA — Nautical Remake (own dice; the shared dice sets stay locked)
- BLOBWORKS — Monsters + Modular Ramps (green-key monster sheets, snap-together kit)
- STOP MOTION — Animatable Eyes + Mouths (6 sheets, 45 sticker states)

### ⚖️ Decisions Stephen made today (recorded, no re-litigating)
- Second provisional: deferred, revenue first; file cheaply near the first's expiry
  if needed (micro-entity). The repo-is-public finding and dates are on the checklist.
- Music: the easter-egg model — songs appear in the player when found in games; no
  teaser rows; most games will get their own songs eventually.
- Inkbound: premium skin as free starter is fine. Petal Match TYPES stays 6.
- Timed mode pays Petals, capped like the daily.

### 🚨 Evening: the haunted-phone staleness, solved (a6e5ecd3 + memory)
- Stephen saw days-old Petal Match through incognito, cleared data, and a FACTORY
  RESET. Root cause, corrected same night: (1) the LW app loads games/<id>.js?v=
  LW_VERSION, which only moves when index.html ships, so his regional Cloudflare
  colo pinned morning-old game code for his whole region; (2) Hostinger's
  CDN/Cache Manager OVERRIDES Cache-Control for static assets regardless of
  .htaccess (which deploys fine — proven by our security headers serving live).
  Their layer exempts sw.js, which is why that one rule "worked" and masked the
  override. Every caching-header edit since July was silently rewritten.
- Fixed in code, live and verified: LW_VERSION bumped (fresh URL at every colo —
  Stephen's phone un-stuck by this alone). STANDING LAW: versioned URLs are the
  ONLY cache-bust on this host; bump LW_VERSION on EVERY ship touching
  games/*.js. Optional 3-tap cleanup for Stephen: hPanel → Performance → Cache
  Manager → Purge All.
- Jimothy on his phone IS current (v70 worker + breadcrumbs verified live) — his
  stuck-after-signin reports itself: check the Discord feedback channel for a
  BOOTLOG line naming the dying stage.

### 🔴 Open and elevated (see MASTER_CHECKLIST.md for the full 90)
- Jimothy login lockout: armed with breadcrumbs, waiting for one occurrence
- Super Slice climb feel: four one-line constants awaiting Stephen's thumb
- Hedgerow 100-level ladder; Slice 3D main redesign; portal black-screen repro
- Art generation from the seven 012Assets docs

---

## Before 2026-07-26 (context, from git)

- 2026-07-25: Petal Match balance harness + 3 player-reported bugs fixed; art cut
  from 23 sheets; Jimothy splash-freeze SW fix swept to 7 more games; arcade
  installable; Jimothy music backfill; venue attribution.
- Older history lives in git log and the memory directory; this ledger starts fresh
  from the day it was created.
