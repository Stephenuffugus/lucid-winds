# THE FLIGHT RECORDER — Stephen's coach tape (Aug 27)

His ask: "tell you move by move what I did, and when you assess my gameplay
you could say what I should have done to win, or realize it was not winnable,
or that something was not articulated or displayed properly."

## How he uses it (the whole workflow)

1. Play normally. Every run records itself: every node bought, every region
   action (with concede quality: repeat / fatigued), every event choice,
   doctrine, desk buys, acquisitions, lobbying, market entries, synergies,
   every street escalation, and a full state snapshot every 30 days
   (subjugation, patriotism, suspicion, organized, cash, influence, markets,
   war heat, the patriotism floor, bubbles caught).
2. When the run ends, the end screen shows **COPY RUN LOG FOR THE COACH** —
   on his devices only (it appears when the fleet dev flag `sws_dev_ok` is
   set, the same flag the probes use; regular players never see it).
3. He pastes the log to the coach (me). Mid-run export from the console:
   `FTW_FLIGHT.copy()` — or `FTW_FLIGHT.dump()` to see it.

## What the coach does with a tape

1. `node scripts/ftw_coach.mjs <runlog.json>` lays out the evidence:
   trajectory table, build order, action cadence, event choices, street
   history, and red flags (idle treasury under a climbing loss meter,
   unanswered suspicion spikes, the runway between patriotism 70 and 100,
   influence hoarding).
2. Counterfactual sims from the SAME mode/diff/start (sim.js bots + hand
   scenarios) answer "was this winnable."
3. The verdict comes back in three parts: what to do differently / it was
   not winnable and here is the tuning issue / the game failed to TELL you
   X — and that third category becomes UI fixes.

## Engineering laws

- The recorder consumes ZERO randomness and never throws — it runs inside
  tick(), where the seeded suites live (seeded-stream law). check.js pins
  the whole module span against Math.random.
- Local only: the tape lives in localStorage (`ftw_flight`), survives
  reloads with its run, resets on a new run, capped at 4000 entries with an
  explicit truncation marker.
- All hooks are one-line `flightLog(...)` calls at the existing choke
  points; check.js enforces the full hook roster so a refactor cannot
  silently drop a surface from the tape.
