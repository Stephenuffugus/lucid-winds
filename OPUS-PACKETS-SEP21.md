# OPUS PACKETS, SEP 21 2026 (heavy lifting while Stephen and Fable keep planning)

**Read first:** `START-HERE.md` (the board), then `plans/PLAY-CADENCE-AND-MUSIC-PLAN-SEP21.md` (why these
packets exist). Then do the packets IN ORDER, one at a time. Each packet ends with evidence, a commit, a
push, and a line on the board. Do not start a packet that is marked WAITS.

## Laws for every packet (each one has cost a day before)

- ⛔ TWO CORES. One browser at a time, one builder at a time. No agent fan-out; Stephen did not ask for one.
- ⛔ `git add` by path, never `-A` (his uploads sit untracked in `assets/`). Commit AND push after every
  packet. Before any push to main: `git fetch && git log HEAD..origin/main` must be empty.
- ⛔ Deploy = `git push origin add-sproing-jumper:main`. Then grep the LIVE html for a NEW marker.
- ⛔ Version EVERYTHING the host caches. Tumble: VERSION in `sw.js`, `src/config.js` AND `index.html`
  (a test enforces the match) plus the portal card `?v=`.
- ⛔ A gate you have not watched FAIL is decoration. Red first, then green.
- ⛔ Never `pkill -f` or `pgrep -f` a pattern your own shell line contains (`[n]ode ...` trick).
- ⛔ Never edit `scripts/` or `music-unlocks.js` (fleet files) unless the packet says so.
- ⛔ No dashes and no exclamation points in player copy. Audio never enters git.
- ⛔ A visual change is not done until you opened the image and named three things wrong with it.
- Stephen is US Eastern; the system clock is UTC.

---

## PACKET A: TUMBLE, "SEE EVERYTHING" SWITCH (small, first, it unblocks his review)

**His words:** "i want to have everything in tumble unlocked on my account to see how i ike it all and
what needs improved".

**Build, in `satellites/tumble/`:**
- `?unlockall=1` is honoured ONLY when `localStorage.sws_dev_ok === '1'` (the device already passed the
  tester door in `/dev-gate.js`). No passcode in source. A normal player who types the param gets nothing.
  Inside the Play TWA the start URL is fixed, so the switch is unreachable there by construction.
- BEFORE touching the save: copy the raw save JSON to `localStorage['tumble-save-backup-unlockall']`,
  once. Never overwrite an existing backup. `?unlockall=restore` puts it back and removes the backup.
- Grant, additively, through the save module's own shapes (read `src/save.js` `freshSave` and
  `src/economy.js` first; do not hand-build entries the game builds another way):
  - all 120 ids in `data/unlocks.json` → `save.unlocks` (includes the 20 `reunion` items and the 4 with
    `requires`),
  - all 12 lore pages → `save.lore`, all 20 pegs in `data/clothesline.json` → `save.clothesline`,
  - all 43 heroes in `data/hero-socks.json` into the drawer, in the shape a real find writes,
  - enough lint, quarters and power dots that every power and every shop flow can still be exercised,
  - whatever gates Load sizes and modes (`tierFor(loads, eyes)` in `src/loadgen.js`): he must be able
    to reach the biggest Load in both modes. Say in the report exactly what you set.
- A small toast on success: "Everything is open on this device. Your own save is backed up."
- `tests/unlockall.test.mjs` (Node, in `run-all.mjs`): without the dev flag nothing changes; with it
  every catalog id is owned; the backup is written once; restore round-trips byte for byte; a second
  `?unlockall=1` does not clobber the backup. Watch it fail first.

**Ship:** bump the three stamps + the portal card `?v=`, `npm test`, the browser gates one at a time
(`sh dev/run-gates.sh`), deploy, `node dev/probe-live.mjs`, then LOOK: a tour shot of the shop and the
room with everything owned.

**Report to Stephen:** the exact URL to open on his Pixel, what was granted, how to go back.

---

## PACKET B: SAVE-KEY INVENTORY (read-only; step one of the data-loss fix)

**Why:** START-HERE top item (Sep 19). Players lose unlocks when browser data is cleared. Before any
design is built we need the full list of what is worth saving.

**Do:** for every carded game (natives through `play/shell.js`, every folder in `satellites/`, the
portal, `music-unlocks.js`, Lucid Winds itself) list every `localStorage` key and every IndexedDB
database it writes. Static grep first; then boot each game headless for about 20 s with one real tap and
dump the keys and byte sizes actually written (one browser at a time; this is a long run, detach it with
`setsid` and log to a file). For each key: owner game, what it holds, class (UNLOCK / PROGRESS / WORLD /
SETTINGS / CACHE / JUNK), size, whether losing it would hurt a player, whether two games share it.

**Out:** `docs/SAVE-KEY-INVENTORY.md` (table, worst losses first) + `docs/save-key-inventory.json`.
Note every game whose save is over 100 KB (Tiny World's IndexedDB `tw` will be) because a cloud copy of
those needs a different shape than a key-value sync.

**Change no game code.** This packet only reads.

---

## PACKET C: PLAY CANDIDATE AUDIT (evidence, not memory)

**Why:** Stephen wants finished games polished and listed at a dollar. We need a ranked list with proof.

**Read first:** `FLEET-ART-AUDIT-SEP04.md` (186 games already shot), `DONE-LEDGER.md`,
`PUB-REVIEW-FABLE.md`, `store/ftw-play/` (the pipeline that worked). Reuse shots that are still true;
reshoot only what changed since Sep 04.

**For every openable, non-beta carded game record:** `node scripts/twa_ready.mjs <slug>` result ·
has its own sw + manifest + privacy page · offline cold launch (server really killed, not emulated) ·
phone shots at 412x915 and 360x740 (title, and 30 s into play), LOOKED AT · class:
ORIGINAL (own listing) / CLASSIC (bundle; name the family: Card Table, Board Classics, Dice Porch, Word
Garden, Logic Den, Maker Bench) / VENDORED (skip) · depth (how long before a player has seen it all) ·
open faults already on record · whether the fleet music chip or a portal exit shows inside it.

**Out:** `store/PLAY-CANDIDATES.md`: the top 30, ranked, each with its blockers counted and its evidence
linked; then one table per bundle family showing which members are clean at phone width. Contact sheets
under 150 KB each may be committed; raw shots stay in `/tmp`.

**Do not fix games in this packet.** List the fixes; Stephen picks.

---

## PACKET D: THE PLAY PACKAGE FACTORY

**Why:** a listing a week is only cheap if packaging is one command and his Console time is under an hour.

**Build:** `store/make-play-package.mjs <slug>` that produces `store/<slug>-play/` in the shape of
`store/tumble-play/` and `store/ftw-play/`: `PLAY-CONSOLE-FIELDS.md` with every field filled and his
calls marked **STEPHEN** (name, price with the one-price-across-stores check, target age) ·
`PLAY-LISTING.md` draft (PLAIN TEXT, no hard wraps because Play keeps newlines, short description with
margin under 80, no other company's trademark) · `twa/twa-manifest.json` · a `privacy.html` for the game
with the contact email fenced by `<!--email_off-->` · an assetlinks merge helper that never drops
existing entries · eight phone screenshots at Play size and a 1024x500 feature graphic TEMPLATE (art is
his) · a final `twa_ready` run printed into the sheet.

**Prove it:** regenerate Tumble's package into a scratch folder and diff it against the hand-built
`store/tumble-play/`; explain every difference. `store/ftw-play/twa/setup-toolchain.sh` rebuilds the
Android toolchain in `/tmp/bw`; Bubblewrap needs the no-TTY workarounds in
`project_ftw_play_package_sep05` (memory).

---

## PACKET E: FUNCTIONS RUNTIME, NODE 20 → 22 (clock: decommissioned 2026-10-30)

Payments live in `functions/`. Upgrade the runtime and `firebase-functions` on the branch, run whatever
tests exist, deploy ONE low-stakes function first (`portalPing`), verify it live, and STOP. ⛔ The deploy
of the payment functions (`piApprove`, `piComplete`, `stripeCreateCheckout`, `stripeWebhook`, `nowIpn`)
WAITS for Stephen's word, with him present to make a one dollar test purchase afterwards.

---

## WAITS

- **PACKET F, "Keep my stuff" backup + the music locker:** waits for Stephen's answer to the one question
  in the plan (section 7), then a Fable design using Packet B's inventory.
- **PACKET G, Tiny World expansion build:** waits for DESIGN-18 from the brainstorm (⛔ 12 tag slots left
  for ever; the design must budget them). Repo `/workspaces/tiny-world`, start at its `STATUS.md`.
- **Bundles:** wait for Packet C.

---

## START PROMPT FOR OPUS (Stephen pastes this after `/model`)

Read START-HERE.md, then plans/PLAY-CADENCE-AND-MUSIC-PLAN-SEP21.md, then OPUS-PACKETS-SEP21.md. Do
Packet A completely (build, test red then green, gates one at a time, deploy, look, report the phone
URL), then B, then C, then D, then E up to its stop line. One packet at a time, commit and push after
each, write one line on the board after each. No agents. Do not touch anything marked WAITS.
