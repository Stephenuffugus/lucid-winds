# Updraft, build notes

Built 2026-09-06 in one session of about 110 minutes from `plans/updraft/HANDOFF-UPDRAFT.md`. P0 and P1 step 1, 2, 3 and 5 are done; P1 step 4 (the offline audio gate), P2 and P3 are not started.

- `node sim.js --test` runs 71 assertions over the SIM layers read out of index.html; `--fly=<mood>,<script>` prints a flight (scripts: launch, hold, loop, eight, dive, park, glide); `--over=KEY=val` runs against an overridden CONFIG number.
- `flock -w 1800 /tmp/sws-gate.lock node tools/check.js` is the gate table: lint, test, fly, layout.
- `tools/shots.mjs` shoots docs/shots; `tools/thumb.mjs` the tile; `tools/icons.mjs` the icons.
- The audio is synthesised (a filtered noise bed and a strain whine) and starts on the first hold. Nothing is fetched from the network; Real Wind is not built.
