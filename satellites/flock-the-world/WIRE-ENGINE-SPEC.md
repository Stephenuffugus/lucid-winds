# THE WIRE AS A SYSTEM — GREENLIT + v1 SHIPPED (Aug 27)

STATUS: Stephen greenlit same day; engine + lint + 60-entry seed corpus are
LIVE (see NOTES-AUG27.md F1 for the build record, including the seeded-stream
law: the engine consumes zero randomness when no corpus is loaded, so the
seeded sim tables and canaries stay byte-identical). F2 (war heat as a
strategy) still awaits his shape call. Corpus batches: HANDOFF-OPUS-WIRE.md.

His ask, from the notes: "thousands of different stories would be ideal…
relevant to what's going on in the world right now and based on how you're
playing… the skill tree you're playing, the news feeds need to reflect it…
where you start should dictate how the story spirals out… combined choices
create combined possibilities… big events would happen and this is why people
would want to play on a slower difficulty."

## What ships in v1 (no new sim mechanics — a data engine over state we have)

A **reactive wire corpus**: hundreds to thousands of headline entries in a
separate data file (`wire-corpus.js`, pure data, loaded defer, game falls back
to today's wire if it fails — FTW already ships art/ and sfx/ beside
index.html, so a data file breaks no law). A small selector inside the game
picks from it on the existing pushNews cadence.

### Entry schema (data only — writers never write code)

```js
{ id:'watch_school_2', lane:'watch',
  t:'District pilots {node_name} at three more schools. A parent asks who
     reviews the footage. Nobody answers in the meeting.',
  when:{ owned:['school'], subj:[0.05,0.5] },        // declarative conditions
  arc:{ chain:'schoolwatch', step:2 },                // escalating storylines
  wt:8, cd:120, cls:'bad',
  slots:{ country:'hot' } }                           // {country} = current flashpoint
```

Condition keys the engine compiles (no functions in data, so a lint script can
verify every entry): `owned` (node ids — single or COMBINATIONS: `['school',
'drone']` fires only when both are built — this is his "combined choices create
combined possibilities"), `tree` depth per tree, `doctrine`, `mode`, `diffMin`,
`subj`/`ovr`/`sus`/`warHeat` bands, `bloc` (HQ region or a named region's
state), `pstate` (murmur/peaceful/violent/uprising), `econRun`, `fdPages`,
`lostCount`, `daysSince` last crackdown/concede/bribe. Cooldowns, weights,
once-per-run, and chains work exactly like the shipped event engine.

### Where the stories come from (the batch plan — this is how it reaches thousands)

- **Per-node lanes**: every one of the 45 nodes gets 4-8 escalation lines
  (what the world looks like two weeks, six months, two years after you built
  that thing). ~250-350 entries.
- **Combination arcs**: node PAIRS with story weight (school+drone,
  face+door, blackout+archive, charter+agit…) get 3-5 step arcs — the
  "control tower means shock gloves in schools" beat lives here, as a
  composite, citing nothing real (house legal law). 40 pairs ≈ 150-200.
- **Bloc reaction sets**: each of the 15 regions reacts in its own voice to
  entry, first crackdown, first riot, blackout, concession, expulsion —
  seeded by where the player STARTED (HQ bloc gets its own domestic-press
  lane; the run starting in Brazil reads different from the run starting in
  Lithuania). 15 × ~12 = ~180.
- **Meter-band ambience**: patriotism bands, suspicion bands, warHeat ladder,
  refusal countdown. ~100.
- **Doctrine + mode voices**: glove-world puff pieces vs fist-world dispatches;
  Crisis/Partnership house styles via the existing ovrTxt pipe. ~100.
- **Choice aftershocks**: every named event choice gets 1-2 delayed follow-ups
  ("the certificate from the arms fair surfaces in a lawsuit"). ~150.

First corpus target: **~900-1200 entries** (written by an Opus terminal against
the schema + lint, in themed batches — HANDOFF-OPUS-WIRE.md). The engine does
not care how many; the corpus grows forever like the KIGO banks do.

### Tone law (from his notes + the shipped voice)

Breaking-news register plus consequence-of-your-choices register, concrete and
human, composites of real-world PATTERNS (school surveillance, predictive
policing, data brokers, shock-glove-style contract cruelty) with real names of
NOTHING — the evergreen legal rule already governing the Foreign Desk. Zero
dashes. Meter names through ovrTxt. Civilians innocent, named as people.

### Pacing

The wire now scrolls at 55px/s. The selector keeps today's cadence but
prioritizes reactive entries over generic ambience, dedupes by chain, and at
1x speed lets arcs breathe (his "why people would play slower" — arcs advance
on day gaps, so 1x play reads a serial, 3x reads a blur, which is itself true
to the theme).

## v2 with teeth (DIRECTOR CALL, priced separately)

- **Wire arcs that escalate into the event system**: an arc's final step can
  register a real choice event (the existing engine), so ignoring the news has
  consequences. This is "big events impact gameplay."
- **War heat as a strategy (F2)**: a Foreign Theater lane — at warHeat bands,
  proxy-war arcs open; deliberate warmongering (Crisis tree) buys fear and a
  patriotism-gain slowdown (the distraction) at the price of unrest, refusal
  risk, and a blowback arc that comes due. Mechanically small: one new fx
  channel + 2-3 event chains. Needs his shape-of-it call first.

## Build order once greenlit

1. Engine + lint + 60-entry seed corpus (Fable, one session, check.js-gated:
   schema lint green, no-real-names denylist, dash law, every condition key
   exercised, fallback-without-corpus proven).
2. Opus corpus batches land against the lint (his other terminal, any time).
3. v2 teeth if he wants them.
