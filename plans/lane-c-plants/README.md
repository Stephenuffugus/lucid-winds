# Lane C plant runners (saved from a session scratchpad, 2026-09-16)

Each runner copies a frozen tree (`PLANT_SAT`, a folder made with `git archive <commit>`), makes one planted edit asserted to match
exactly once, runs the gate in the copy, and prints its FAIL lines. Paths inside them point at the old session scratchpad
(`/tmp/claude-1000/.../scratchpad`): set `SP`, `PLANT_SAT` or the snapshot argument to a new scratchpad before running. Browser
gates must run under `flock -w 43200 /tmp/sws-gate.lock timeout <N>`, one at a time.
