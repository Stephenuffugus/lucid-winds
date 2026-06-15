# LUCID WINDS — HAIKU PRINCIPLES (the constitution)

The procedural haiku engine must obey this document. It exists to keep the
poetry **coherent, concrete, surprising, and alive** — and to stop it from
ever sliding into formula or greeting-card sentiment. Read it before changing
`getHaiku`, the banks (`word-banks.js`: HAIKU_A/B/C + KIGO_*), or selection.

Last locked: 2026-06-15 (after the de-cliché + meter + corruption pass).

---

## WHAT THE MASTERS TEACH (and how it binds the engine)

**Bashō — the cut (*kireji*) and *ma* (negative space).**
A haiku is two images with a gap between them; meaning happens in the gap. Say
less. → *Engine:* compose toward juxtaposition, not a list of three statements.
→ *Guardrail:* vary where the "cut" falls; never one fixed template.

**Buson — the painter's eye.**
Precise, visual, nameable. Color, edge, framing. → *Engine:* favour concrete
sensory images. → *Guardrail:* the vocabulary-diversity metric (below) is a
live budget, not a suggestion.

**Issa — compassion and the small particular.**
The snail, the fox, the sparrow; tender, sometimes wry. → *Engine:* the
concrete-creature personification lines are the **soul** — *"The badger knows
every root," "A fox knows ten ways to leave," "The owl knows the dark."* These
are KEPT on purpose. Personality lives here. **Do not "clean" these away.**

**Shiki — *shasei* (sketch from life), anti-cliché.**
He reformed haiku *away* from stale "telling." → *Engine:* show an image, never
state a moral. The 2026-06-15 pass rewrote ~95 abstractions into concrete
images for exactly this reason (*"Patience made the canyon deep" → "Slow water
cut the canyon"*).

**No closure — used sparingly.** Classical haiku open; they do not wrap up. But
the Director's taste keeps a place for the gnomic, aphoristic line when it is
*true and poetic* (*"Patience made the canyon deep"*). These are allowed as a
minority voice — earn them, keep them resonant, never let them become the
default register.

**Kigo, lightly.** A seasonal word situates a poem but is not mandatory.

---

## HARD RULES

1. **5–7–5.** HAIKU_A = 5, HAIKU_B = 7, HAIKU_C / KIGO_* = 5. (It was mislabeled
   "7-5-7" in old docs — it is 5-7-5.)
2. **Mostly show, don't tell — but aphorism is allowed in moderation.** Default
   to the concrete sensory image (Shiki). Abstract/gnomic lines (*"Patience made
   the canyon deep"*) are PERMITTED as a minority voice when genuinely true and
   poetic — DIRECTOR'S RULING 2026-06-15 (the earlier blanket purge of ~95 such
   lines was reverted; he likes them). The failure mode to avoid is *bulk*
   abstraction or flat moralizing, not the occasional resonant aphorism.
3. **Concrete personification is allowed and encouraged** when a *real creature
   or thing* does something *observable* ("the fox knows the path"). Abstract
   personification is not ("the land knows its name" → retired).
4. **No absolutes** as a crutch: *always / never / forever.* They flatten into
   proverb.
5. **The particular over the general.** "a fox," not "animals"; "the north
   wall," not "places." Concreteness IS uniqueness.
6. **Restraint (*karumi*).** Plain words, few adjectives. If a line over-
   explains, cut toward the image.
7. **No contractions inside single-quoted bank strings** (don't / can't) — the
   apostrophe risks breaking the array; an unescaped paste once corrupted 4
   entries into literal garbage on plant cards. Phrase around it or escape.

## ANTI-FORMULA (the meta-rule you must not break)

Formula dies the moment the engine becomes predictable, so **unpredictability
is a design requirement.** Every "smart" feature applies **partially and
hash-varied**, never universally:

- Seasonal kigo opener: ~50% of plants (gate `h[24] < 8`), the rest draw a
  general opener with **no** seasonal tie. Never force every poem onto its
  season.
- Any future trait-tie (companion / mutation / rarity motif): occasional, not
  every plant. A Cosmic Beholder *sometimes* gets an uncanny poem — that rarity
  is what makes it feel authored.
- Use multiple compositional shapes, hash-rotated. Never one sentence skeleton
  (watch the "The X verbs the Y" pattern; ~21% of lines opened with "The" as of
  the 2026-06-15 audit — keep diversifying openings).
- When in doubt, cut toward image and simplicity, never toward explanation.

## VOCABULARY BUDGET

Variety is the antidote to "samey." As of 2026-06-15: 2,241 unique content
words, 856 used once (healthy). Watch the overused cluster — *rain, roots,
holds, stone, wind, bark, frost, moss, dark.* New lines should lean on the long
tail, not the top 20. Diversify sentence openings (not always "The…").

## OPERATIONAL NOTES (hard-won)

- **Do NOT trust an automatic syllable counter for meter.** Heuristic counters
  both over-count plurals (*leaves, stones, comes*) and under-count *-le* words
  (*cradles, needles, beetles*). The banks are ear-verified; any meter pass must
  be **by ear or by CMU pronunciation dictionary**, never the rough counter.
  `scripts/haiku_audit.js` is useful for (a) catching gross corruption and (b)
  the *exact* vocabulary + abstraction reports — its syllable flags are
  candidates to hand-check, not truths.
- The audit caught 4 corrupted entries that printed verbatim garbage on cards
  yet passed `node --check`/smoke (valid syntax, junk content). **Run the
  content audit after any bank edit**, not just a syntax check.
- Engine stays a fast deterministic ES5 lookup. Any "intelligence" (tagging,
  curation, expansion) is baked into the **data offline** — never an LLM at
  render time.

## THE NEXT LEAP (planned, not yet built)

Relational selection: tag every line with subject / mood / time / register, then
select for *relationship* (a shared motif, or a deliberate cut) instead of three
independent draws — and tie one slot, occasionally, to the plant's traits. This
is what turns "three good lines" into a *composed* poem. It must honor every
rule above, especially ANTI-FORMULA.
