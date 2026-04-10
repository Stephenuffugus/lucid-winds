# LUCID WINDS — HAIKU COHESION RULES
## Formal Constraints for Claude Code Implementation
**Date: March 26, 2026**
**For: Dev Team (Claude Code)**

---

## HOW HAIKU WORKS IN THIS GAME

Structure: **5-7-5** syllables. Always.
Assembly: **HAIKU_A[i]** (line 1) + **HAIKU_B[j]** (line 2) + **HAIKU_C[k]** (line 3)
Indices from SHA-256 hash. Player never chooses. Every line 1 MUST flow into 
every line 2, and every line 2 MUST flow into every line 3.

At target scale: 800 × 700 × 800 = **448 million unique poems.**

Every single one must feel intentional.

---

## PART 1: LESSONS FROM THE MASTERS

### What makes a great haiku (distilled from Bashō, Buson, Issa, Shiki, and modern haiku theory)

**1. Kiru (切れ) — The Cut**
The most important principle. A haiku contains a CUT — a juxtaposition 
between two images or ideas. The reader's mind bridges the gap. The poem 
lives in that gap, not in the words.

In our system, the cut happens BETWEEN lines. Line 1 presents an image. 
Line 2 shifts. Line 3 resolves or opens. The cut is built into the structure — 
but only if the lines serve DIFFERENT FUNCTIONS.

**If all three lines describe the same thing the same way, there is no cut. 
The haiku is dead.**

**2. Kigo (季語) — Seasonal Reference**
Traditional haiku contains a seasonal word. We don't enforce strict seasons, 
but our lines should carry a sense of TIME — frost implies winter, bloom 
implies spring, dusk implies transition. This temporal grounding helps 
random combinations feel placed in a moment rather than floating abstractly.

**3. Wabi-sabi (侘寂) — Beauty in Impermanence**
The aesthetic of haiku is NOT perfection. It's the crack in the glaze, 
the moss on the ruin, the frost that will melt. Our word palette already 
serves this — rot, decay, weathering, erosion. But the RESOLUTION line (C) 
should honor this: things end, things continue, both are true.

**4. Shasei (写生) — Sketch from Life**
Shiki's principle: describe what you see, directly, without editorial. 
No metaphor for its own sake. No cleverness. "Frost grips the root crown" — 
you can see it. "The algorithm blooms" — you can't. This is why the tech 
lines failed. They were ABOUT something rather than SHOWING something.

**5. Ma (間) — Negative Space**
What you don't say matters more than what you do. Short declarative lines 
leave room for the reader. "Stone yields in the end" has MA — the reader 
fills in the centuries. "Stone eventually yields to the persistent force 
of the roots over many years" has none.

**In our system: prefer fewer words per line. Let silence do the work.**

---

## PART 2: THE THREE-ROLE SYSTEM

Every haiku in this game has three lines with three DISTINCT ROLES.
This is the primary defense against redundancy and flatness.

### HAIKU_A (Line 1) — THE WITNESS
**5 syllables. Sets the scene. Observes.**

Function: Present a concrete, sensory image. The reader sees, hears, 
or feels something specific. This is the GROUNDING line.

**Dominant mode:** Present tense. Active voice. Direct observation.
**Dominant subjects:** Weather acting on plants. Surfaces. Small-scale 
phenomena. The immediate, the tactile, the visible.

**Verb palette:** grips, coats, fills, hides, drapes, seals, cracks, splits, 
bends, wets, loads, maps, stirs, tests, finds, feeds, dims, thins, holds.
These are OBSERVATION verbs — the witness watches nature do something.

**Emotional register:** Neutral to cool. Factual. Not sad, not happy. 
Just present. The witness reports without judgment.

**Subject word caps (per 100 lines):**

| Subject | Max lines per 100 | Rationale |
|---------|-------------------|-----------|
| Roots | 10 | Core botanical word but overrepresented in current bank |
| Frost/Ice/Rime | 10 | Weather is A's domain |
| Rain | 8 | Weather is A's domain |
| Bark | 8 | Surface/texture is A's domain |
| Moss | 6 | Shared with C — cap here |
| Dew | 6 | Weather is A's domain |
| Fog/Mist | 6 | Weather is A's domain |
| Spore(s) | 5 | Shared with C — cap here |
| Seeds | 5 | Shared with C — cap here |
| Wind | 5 | Weather is A's domain |
| Stone/Rock | 4 | Primarily C's domain |
| Loam/Soil | 4 | Primarily C's domain |
| Shade | 4 | Shared |

**Banned from A (these belong to other lines):**
- Philosophical declarations ("all things return")
- Temporal shifts ("seasons turn")
- Resolution statements ("the forest persists")
- Transformation language ("becomes," "returns to")

### HAIKU_B (Line 2) — THE TURN
**7 syllables. Shifts perspective. Introduces time, scale, or process.**

Function: The PIVOT. Change something — zoom in or out, move forward 
or backward in time, shift from surface to underground, from one organism 
to another, from the specific to the general. This is where the CUT lives.

**Dominant mode:** Transitional. Can be present or past tense. Can 
introduce causation, sequence, or contrast. Has MORE ROOM (7 syllables) 
to develop a complete thought.

**Dominant subjects:** Processes. Transformations. Relationships between 
things. Time made visible. Cause and effect. The hidden mechanics of 
the natural world.

**Verb palette:** becomes, returns, dissolves, erases, teaches, remembers, 
reclaims, reshapes, surrenders, colonizes, deposits, retreats, absorbs, 
divides, collects, compresses, expands, filters, polishes, shatters.
These are TRANSFORMATION verbs — the turn reveals process.

**Emotional register:** Dynamic. Something is happening or has happened. 
There's movement in time even if the image is still. The reader feels 
change occurring.

**Subject word caps (per 100 lines):**

| Subject | Max lines per 100 | Rationale |
|---------|-------------------|-----------|
| Roots | 6 | Process focus — what roots DO over time |
| Stone/Rock/Bedrock | 8 | Geological process is B's domain |
| Rain/Water | 8 | Hydrological process is B's domain |
| Time/Seasons | 8 | Temporal shift is B's core function |
| Frost/Ice/Glacier | 6 | Shared with A — cap here |
| Bark/Wood | 5 | Shared with A — cap here |
| Lichen/Moss | 5 | Growth-over-time narratives |
| Erosion/Decay | 6 | Transformation is B's domain |
| Canopy/Forest | 5 | Ecosystem scale is B's domain |
| Soil/Loam/Silt | 6 | Deposition process |

**Banned from B:**
- Pure sensory observation with no temporal or process element 
  ("frost coats the bare twig" — that's an A-line)
- Static resolution statements ("the grove holds its ground" — that's C)
- Single-instant snapshots with no implied change

**B-line quality test:** Does this line contain MOVEMENT THROUGH TIME? 
If you can't feel something changing, becoming, or being revealed, 
it's not a B-line.

### HAIKU_C (Line 3) — THE RESOLVE
**5 syllables. Resolves or opens. Delivers a quiet truth.**

Function: The LANDING. After the witness observes and the turn shifts, 
the resolve either closes the circle or opens it to infinity. This is 
the line players remember. It should feel like putting a stone down 
on the ground — final, weighted, still.

**Dominant mode:** Present tense. Declarative. Often has the feel of 
a proverb or natural law. Not preachy — just true.

**Dominant subjects:** The endurance of things. Cyclical truths. What 
remains after change. What the ground knows. The patience of moss. 
The stubbornness of roots. The democracy of rain.

**Verb palette:** holds, keeps, knows, outlasts, waits, yields, returns, 
claims, feeds, mends, takes, gives, earns, learns, finds, writes, 
maps, proves, bides, persists.
These are RESOLUTION verbs — the resolve states what endures.

**Emotional register:** Still. Weighted. Sometimes warm, sometimes cool, 
but always GROUNDED. The feeling of a hand resting flat on soil.

**Subject word caps (per 100 lines):**

| Subject | Max lines per 100 | Rationale |
|---------|-------------------|-----------|
| Roots | 8 | Endurance is C's domain |
| Stone/Rock | 8 | Permanence is C's domain |
| Loam/Soil/Peat | 8 | Earth-as-final-repository is C's domain |
| Moss | 6 | Persistence/patience imagery |
| Bark | 5 | Shared with A — cap here |
| Frost/Ice | 4 | Primarily A's domain — cap here |
| Rain | 4 | Primarily A/B's domain — cap here |
| Seeds | 6 | Future/potential is C's domain |
| Shade | 5 | Shelter/protection imagery |
| The grove/forest | 5 | Collective endurance |
| Spore(s) | 4 | Shared with A — cap here |
| Dew | 3 | Primarily A's domain |

**Banned from C:**
- Scene-setting observations ("frost coats the bare twig" — that's A)
- Process descriptions ("the glacier carves the stone" — that's B)
- Questions or exclamations
- First-person pronouns
- Modern objects or technology

**C-line quality test:** Could a wise, quiet person say this while 
looking at the ground? If it sounds like narration or description, 
it belongs in A or B. If it sounds like a truth, it's C.

---

## PART 3: COLLISION PREVENTION

### The Redundancy Matrix

The worst haiku failure is when all three lines say the same thing.
Here are the collision types ranked by severity:

**CRITICAL — Same subject + same verb across 2+ lines:**
```
Roots grip the wet ledge          (A: roots + grip)
the roots trade sugars through the dark   (B: roots + trade)  
Roots earn the dark soil          (C: roots + earn)
```
Three root lines. Even with different verbs, this is monotonous.

**SEVERE — Same subject across all 3 lines:**
```
Frost finds the thin bark         (A: frost)
frost surrenders to the rain      (B: frost)
Frost breaks and roots mend       (C: frost)
```
Three frosts. The haiku has no range.

**MODERATE — Same emotional register across all 3:**
```
Rain sounds the deep soil         (A: observation, neutral)
rain sculpts the sandstone slowly (B: observation, neutral)  
Rain writes in the stone          (C: observation, neutral)
```
All three are calm observations. No turn, no resolve. Flat.

**MILD — Same verb in 2 of 3 lines:**
```
Dew maps the leaf veins           (A: maps)
frost draws its maps on the stone (B: maps — implied)
The root maps the rock            (C: maps)
```
Repetitive verb. Not catastrophic but noticeable.

### Statistical Collision Reduction

We can't eliminate collisions in a random system. But we can 
make them RARE by controlling word frequency across banks.

**The formula:** If "roots" appears in X% of A-lines and Y% of C-lines, 
the probability of a roots-roots A-C collision is X% × Y%.

If roots is in 10% of A (cap) and 8% of C (cap):
Collision rate = 0.10 × 0.08 = 0.8% of all haiku.
At 448 million combinations, that's ~3.6 million "double roots" poems.
Still too many.

**Better target:** Keep any single subject word under 6% in any bank.
At 6% × 6%: collision rate = 0.36% for any two-bank overlap.
Three-bank collision (same word in A, B, AND C): 0.06 × 0.06 × 0.06 = 0.02%.
At 448M combos, that's ~90,000 triple-collision poems. Acceptable — 
a player would need to mint thousands of plants to encounter one.

**IMPLEMENTATION — Subject frequency caps:**

No single subject word (roots, frost, rain, bark, moss, stone, etc.) 
should appear as the PRIMARY subject in more than **6% of any single bank.**

At target size of 800 lines: max 48 lines per subject per bank.
At target size of 700 lines (B): max 42 lines per subject.

**Current bank audit needed:** Count occurrences of each subject word 
in A, B, and C. Flag any word exceeding 8% in any bank. Rebalance 
by converting excess lines to use synonyms or different subjects.

---

## PART 4: VERB PARTITIONING RULES

### Verb Ownership by Bank

Some verbs should be EXCLUSIVE or NEAR-EXCLUSIVE to one bank 
to prevent the same action appearing across lines.

**A-line exclusive verbs (observation/sensation):**
grips, coats, drapes, wets, loads, fogs, drowns, pries, 
chars, scours, sketches, drums, pocks, pearls, rimes

**B-line exclusive verbs (transformation/process):**
becomes, dissolves, erases, reclaims, colonizes, compresses, 
deposits, retreats, shatters, polishes, sculpts, navigates

**C-line exclusive verbs (resolution/declaration):**
outlasts, bides, persists, earns, trusts, teaches (as wisdom), 
asks, bows, serves, proves, owns (as quiet possession)

**Shared verbs (allowed in multiple banks but with different usage):**
- "holds" — A: physically holds (Frost holds the bud). B: holds over time 
  (The peat holds compressed time). C: holds as endurance (The grove holds its ground)
- "feeds" — A: actively feeds (Rain feeds the blind roots). B: feeds as process 
  (Decay feeds the new growth). C: feeds as truth (Old wood feeds the new)
- "keeps" — A: keeps as containment (Bark keeps the year cold). C: keeps as law 
  (The soil keeps the proof). Avoid in B.
- "finds" — A: finds as discovery (Roots find the fault line). B: less common. 
  C: finds as destiny (The seed finds its dark)

**IMPLEMENTATION:** When adding new lines, check the verb against the 
ownership table. If using a shared verb, ensure the USAGE matches the 
bank's function (observation vs. process vs. resolution).

---

## PART 5: THE BRIDGE TEST

Every line must pass the BRIDGE TEST before entering a bank.

### For HAIKU_A candidates:
Take the candidate line. Read it with 5 RANDOM existing B-lines 
AND 5 random existing C-lines (independently). 

Ask for each pair:
1. Does the A→B transition feel like a shift? (Not just more of the same?)
2. Does the A have enough concrete imagery that B has something to pivot FROM?
3. Could a reader feel a "cut" between A and B?

If ANY of the 5 pairings produces a flat read (A and B feel like the same 
line continued), the A-line needs revision.

### For HAIKU_B candidates:
Read with 5 random A-lines AND 5 random C-lines.

Ask:
1. Does B introduce something A didn't contain? (New scale, new timeframe, 
   new subject, new process?)
2. Does B leave room for C to land? (If B already resolves everything, C is redundant)
3. Does the 7-syllable length feel USED? (Not just a 5-syllable thought padded 
   with filler words?)

### For HAIKU_C candidates:
Read with 5 random A-lines AND 5 random B-lines.

Ask:
1. Does C feel like an ENDING, not a continuation?
2. Does C add something neither A nor B said?
3. If you read ONLY the C-line, does it stand alone as a complete thought?
4. Does it have WEIGHT? (A feeling of finality, acceptance, or opening?)

---

## PART 6: STRUCTURAL ANTI-PATTERNS

### Lines to NEVER write for any bank:

**The Echo:** A line that just rephrases what another bank commonly says.
- Bad A: "The old roots endure" — this is a C-line wearing A's clothes
- Bad B: "frost coats the branches white" — this is an A-line with extra syllables
- Bad C: "glaciers carve the stone" — this is a B-line in the wrong bank

**The Orphan Fragment:** A line that needs specific context to make sense.
- Bad: "and then it blooms" — "and then" requires a preceding thought
- Bad: "which is why they grow" — relative clause, needs antecedent
- Good: "The grove holds its ground" — complete thought, standalone

**The Lecture:** A line that explains rather than shows.
- Bad: "plants need water and light" — textbook
- Bad: "erosion is a process" — definition
- Good: "rain carves the old path" — you SEE it

**The Cliché:** A line that's been said a million times.
- Bad: "beauty is within" — greeting card
- Bad: "nature always wins" — bumper sticker  
- Good: "stone yields in the end" — specific, physical, earned

**The Emotional Override:** A line that tells you how to feel.
- Bad: "how beautiful the frost" — dictating reaction
- Bad: "the sad dead leaves fall" — injecting sadness
- Good: "frost writes on the glass" — lets the reader feel what they feel

---

## PART 7: SYLLABLE RULES (NON-NEGOTIABLE)

### Counting rules:
- Fire = 2 syllables (fi-re)
- Mire = 2 syllables (mi-re)
- Pyre = 2 syllables (py-re)
- Hire, wire, tire = 2 syllables each
- "Quiet" = 2 syllables (qui-et)
- "Every" = in natural speech, count as 2 (ev-ry) or 3 (ev-er-y) — 
  prefer constructions that don't depend on this ambiguity
- "Toward" = count as 1 in natural speech (tord)
- "Buried" = 2 syllables (bur-ied)
- "Flower," "power," "tower" = 2 syllables each
- "Hyphae," "larvae" = 2 syllables each
- "Mycelia" = 4 syllables (my-ce-li-a)
- "Mycelium" = 4 syllables (my-ce-li-um)
- "Petiole" = 3 syllables (pet-i-ole)
- "Corolla" = 3 syllables (co-rol-la)
- "Cambium" = 3 syllables (cam-bi-um)

### Verification:
Every line must be hand-counted before submission. The automated syllable 
counters in most NLP libraries get 10-15% of English words wrong, 
especially botanical and geological terms. DO NOT trust automated counts 
for final verification.

**Procedure:** Count each word's syllables by tapping them out. Write the 
count next to each line. Have a second pass verify independently.

---

## PART 8: EMOTIONAL ARC FRAMEWORK

A great random haiku should feel like it has an ARC — even by accident.
We engineer this by giving each bank a distinct emotional function.

### The Arc Template:

**A (5 syl) — GROUND:** Here is something real. You can touch it.
↓ (the cut)
**B (7 syl) — MOVE:** Something is happening to it. Time passes. Scale shifts.
↓ (the resolution)
**C (5 syl) — REST:** Here is what remains. Here is what is true.

### Emotional temperature by bank:

| Bank | Temperature | Energy | Time orientation |
|------|------------|--------|-----------------|
| A | Cool-neutral | Still to medium | Present instant |
| B | Warm-dynamic | Medium to high | Past→present or present→future |
| C | Cool-warm | Still | Eternal present / cyclical |

When all three temperatures are different, the haiku MOVES.
When all three are the same, the haiku is FLAT.

### Testing emotional arc:
Read any A-B-C combination and ask: "Does something CHANGE between 
the first line and the last?" If yes, the arc works. If the last line 
could be the first line with no loss, the haiku has no arc.

---

## PART 9: PRACTICAL IMPLEMENTATION CHECKLIST

### When adding a new HAIKU_A line:
- [ ] Exactly 5 syllables (hand-counted, fire/mire/pyre = 2)
- [ ] Concrete sensory image (you can see/feel/hear it)
- [ ] Present tense, active voice preferred
- [ ] Uses an A-appropriate verb (observation, not transformation or resolution)
- [ ] Primary subject word is under 6% cap for bank A
- [ ] No shared stem with dominant subject words in B or C
- [ ] Capitalized first letter
- [ ] No tech/code/modern words
- [ ] No question marks, exclamation marks, colons, semicolons
- [ ] No first-person pronouns
- [ ] Bridge tested against 5 random B-lines
- [ ] Not an echo of a common C-line pattern

### When adding a new HAIKU_B line:
- [ ] Exactly 7 syllables (hand-counted, fire/mire/pyre = 2)
- [ ] Contains movement through time, scale shift, or process
- [ ] Uses a B-appropriate verb (transformation, process)
- [ ] Primary subject word is under 6% cap for bank B
- [ ] Capitalized first letter (OR lowercase if stylistic choice is consistent)
- [ ] Actually USES the 7 syllables — not a padded 5-syllable thought
- [ ] No tech/code/modern words
- [ ] Bridge tested against 5 random A-lines and 5 random C-lines
- [ ] Not an echo of a common A-line or C-line pattern
- [ ] Leaves ROOM for C to land (doesn't resolve everything)

### When adding a new HAIKU_C line:
- [ ] Exactly 5 syllables (hand-counted, fire/mire/pyre = 2)
- [ ] Resolution, truth, or opening — not description or process
- [ ] Uses a C-appropriate verb (resolution, declaration, endurance)
- [ ] Primary subject word is under 6% cap for bank C
- [ ] Capitalized first letter
- [ ] Stands alone as a complete, weighted thought
- [ ] Could be the last thing someone says before a long silence
- [ ] No tech/code/modern words
- [ ] No question marks, exclamation marks, colons, semicolons
- [ ] Bridge tested against 5 random B-lines
- [ ] Not an echo of a common A-line pattern

---

## PART 10: ONGOING MAINTENANCE

### Quarterly audit cycle:
1. **Subject frequency audit** — Count all subject words across all three banks. 
   Flag anything over 6% in any bank.
2. **Verb overlap audit** — Check for verbs appearing in identical usage 
   across banks. Reassign or rewrite.
3. **Collision sampling** — Generate 1,000 random haiku. Read all 1,000. 
   Flag any that feel flat, redundant, or broken. Trace the failure to 
   specific lines and revise.
4. **New word integration check** — After any expansion batch, verify that 
   new lines don't shift any subject word over the 6% cap.

### The standard:
Every random combination should feel like it was written on purpose.
Not every combination will be a masterpiece. But NONE should be embarrassing.
The floor is "interesting." The ceiling is "I want to save this."

A player flips their plant card. They read:

> Moss feels the stone breathe
> *the glacier writes in its slow hand*
> Stone yields in the end

They didn't choose this. The hash chose it. But it feels CHOSEN.
That's the bar.
