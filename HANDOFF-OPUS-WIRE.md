# OPUS HANDOFF — FTW wire corpus writing (BLOCKED on Stephen's greenlight of WIRE-ENGINE-SPEC.md)

You are writing NEWS DATA for Flock the World, a satire sim where the player
is a surveillance vendor subjugating Earth and the civilians are the moral
center. Read these first, in order:

1. `satellites/flock-the-world/WIRE-ENGINE-SPEC.md` — the schema and batch plan. THE CONTRACT.
2. `satellites/flock-the-world/HANDOFF.md` — top section + "Tone" paragraph.
3. `satellites/flock-the-world/NOTES-AUG27.md` §F — what Stephen asked for.

## Ground rules (violating any of these wastes the whole batch)

- **Data only.** You write corpus entries against the declared schema. No
  functions, no code, no new condition keys — if a story needs a condition
  the spec does not list, note it at the bottom of your batch file and pick
  the closest legal condition instead.
- **Composites of patterns, citations of nothing.** Real-world RESONANCE
  (school surveillance, shock-glove contract cruelty, predictive policing,
  data brokers, false arrests) with the names of NOTHING real: no companies,
  no people, no countries' current governments, no dated events. If a line
  would work as a caption on a real news photo, rewrite it until it would not.
- **Zero dashes in player-facing text.** House law, machine-checked. Use
  periods, colons, the interpunct never.
- **Meter names are piped**: write `Patriotism` and the game's ovrTxt handles
  Crisis mode. Never write `Coalition` or `oversight` yourself.
- **Civilians are innocent and specific.** A parent, a night nurse, a bus
  driver. Never a mob. The satire's blade points at the vendor and the buyers.
- **Voice**: breaking-news register OR consequence-register (the world
  answering the player's build). Concrete nouns, no aphorisms, no morals
  spelled out. The existing corpus in index.html (search `H={` and the
  ambient lines) is STRONG — match it.

## Deliverable shape

One JS file per batch: `satellites/flock-the-world/wire-batches/batch-<name>.js`
containing `window.WIRE_BATCH = [ ...entries ];` — the integrator (Fable
session) merges and lints. Batches in the spec's order: per-node lanes first
(dep tree, then watch, story, crisis), then combination arcs, then bloc
reaction sets, then meter-band ambience, doctrine voices, choice aftershocks.
Target 60-120 entries per batch, every entry carrying id, lane, t, when, wt,
cd, cls at minimum. Ids namespaced by batch (`dep_pilot_1`).

## Do not

- Do not touch index.html or any game file.
- Do not invent node ids: the canonical list is the NODES/NBI definitions in
  index.html (grep `NODE_ART` for the id roster) and the spec's condition keys.
- Do not write win/lose copy, event choices, or tutorial text — wire lines only.
