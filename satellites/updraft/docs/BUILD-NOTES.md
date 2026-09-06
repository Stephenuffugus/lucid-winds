# Updraft, build notes

Built 2026-09-06 from `plans/updraft/HANDOFF-UPDRAFT.md`: P0 and P1 in a first session of about 110 minutes, the P2 screens (mood, journal, kites with unlocks) in a second of 40. Not built: the landing flourish and all of P3 (Real Wind, the Daily Wind, a haptics toggle, a settings screen).

- `node sim.js --test` runs 71 assertions over the SIM layers read out of index.html; `--fly=<mood>,<script>` prints a flight (scripts: launch, hold, loop, eight, dive, park, glide); `--over=KEY=val` runs against an overridden CONFIG number.
- `flock -w 1800 /tmp/sws-gate.lock node tools/check.js` is the gate table: lint, test, fly, layout.
- `tools/shots.mjs` shoots docs/shots; `tools/thumb.mjs` the tile; `tools/icons.mjs` the icons.
- The audio is synthesised (a filtered noise bed and a strain whine) and starts on the first hold. Nothing is fetched from the network; Real Wind is not built.
- Screens: title, how, pause, mood (`#scrMood`, three cards), kites (`#scrKites`, five cards, `kiteUnlocked` against CONFIG.UNLOCK and the journal), journal (`#scrJournal`), end. `showScreen(name)` is the only door; `G.moodFrom` and `G.journalFrom` remember where a screen was opened from.
- Kites unlock by the journal only: Delta at 0.5 h in the air, Box at 2 h, Sled at ten Loops, Dragon at one High Park. There is no currency and no score anywhere.
