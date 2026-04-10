# LUCID WINDS — NAME GENERATION RULES
## Formal Constraints for Claude Code Implementation
**Date: March 26, 2026**
**For: Dev Team (Claude Code)**

---

## HOW NAMES WORK

Every plant name generates as: **"The " + NAME_ADJ[i] + " " + NAME_NOUN[j]**

Indices are derived from the plant's SHA-256 hash. The player never chooses — 
the hash determines the name deterministically. This means EVERY adjective 
MUST work with EVERY noun. There are no curated pairs.

At target scale: 1,500 × 1,500 = **2.25 million unique names.**

---

## THE CORE PROBLEM

With random pairing, certain combinations will be:
- **Redundant**: "The Rooted Root" — adjective and noun say the same thing
- **Contradictory**: "The Submerged Summit" — logically impossible (sometimes poetic, sometimes just wrong)
- **Tautological**: "The Glacial Glacier" — impossible if no word appears in both banks, but near-tautologies like "The Mossy Moss" can happen with related stems
- **Cacophonous**: "The Tessellate Terracette" — tongue-twister, hard to read
- **Overlong**: "The Antediluvian Stratigraphy" — 33 characters, overflows mobile display

---

## RULE 1: NO SHARED STEMS ACROSS BANKS

No word in NAME_ADJ should share a root stem with any word in NAME_NOUN.

**Prohibited cross-bank stem pairs:**
- Root/Rooted × Root/Rootwell (stem: "root")
- Moss/Mossed × Moss (stem: "moss") 
- Spore/Spored × Spore (stem: "spore")
- Fern × Fern (identical)
- Coral × Coral (identical)
- Crystal/Crystalline × Crystal (stem: "crystal")
- Frost/Frosted × Frost (stem: "frost")

**Implementation:** Before adding any word to either bank, extract its stem 
(strip common suffixes: -ed, -ing, -ous, -ic, -al, -ine, -ate, -ent, -ant, -oid, -ose).
Check that no word in the OTHER bank shares that stem.

**Existing violations to audit and resolve:**
The current banks likely have several stem overlaps. Run this check against 
the full post-cleanup arrays and flag all matches. Director will decide 
which bank keeps each contested stem.

---

## RULE 2: CHARACTER LENGTH LIMITS

Names display on a phone screen at 1.3rem inside a seasonal card border.

**Hard limits:**
- Adjective: max 14 characters
- Noun: max 14 characters  
- Combined name (including "The " and space): max 32 characters

**Soft preference:**
- 70% of each bank should be 4-9 characters
- 20% can be 10-12 characters
- 10% can be 13-14 characters (reserved for exceptional words)

**Implementation:** When adding new words, calculate total display length.
Flag any combination where "The " + adj + " " + noun exceeds 32 characters.
Since we can't control which pairs form, this means: if an adjective is 14 chars,
it can ONLY safely pair with nouns of 13 chars or less (14 + 13 + 5 = 32).

**Current violations to check:** Run max-length analysis on all existing words.

---

## RULE 3: PHONETIC COLLISION AVOIDANCE

Certain sound combinations are hard to read or say aloud.

**Avoid adjacent identical syllable sounds:**
- Adj ending in "-ate" + Noun starting with "A": "The Tessellate Agate" — clunky
- Adj ending in "-al" + Noun starting with "Al-": "The Glacial Alcazar" — stumbles
- Adj ending in "-ous" + Noun starting with a vowel: usually fine, but check
- Adj ending in "-ed" + Noun starting with "Ed-": "The Cragged Edgewater" — fine actually

**This is NOT implementable as a hard block** (it would eliminate too many valid pairs).
Instead: when building new entries, avoid words that create high-frequency 
phonetic collisions with common words in the other bank.

**Guideline for word selection:**
- If an adjective ends with a strong consonant cluster (st, ft, ck, nk, pt), 
  it pairs cleanly with almost any noun
- If an adjective ends with a vowel sound (ee, ay, oh), check it against 
  vowel-starting nouns for elision issues
- Short punchy words (4-6 chars) are the safest — they pair cleanly with everything

---

## RULE 4: SEMANTIC CATEGORY DISTRIBUTION

Both banks should draw evenly from multiple semantic domains so that 
cross-domain combinations create surprise and beauty.

**Adjective categories (target distribution):**

| Category | Examples | Target % |
|----------|---------|----------|
| Geological | Basaltic, Calcic, Ferric, Granitic | 15% |
| Botanical | Cormous, Deciduous, Rhizoid | 15% |
| Atmospheric | Brumous, Nimbus, Pellucid | 12% |
| Texture/Surface | Abraded, Corrugated, Friable | 12% |
| Color/Light | Incarnadine, Opaline, Saffron | 10% |
| Temperature | Algid, Gelid, Fevered, Glacial | 8% |
| Age/State | Ancestral, Senescent, Vestigial | 8% |
| Movement/Force | Seismic, Tectonic, Undulant | 5% |
| Abstract/Mystical | Arcane, Eldritch, Spectral | 8% |
| Archaic/Rare | Brumal, Brumous, Wyrd | 7% |

**Noun categories (target distribution):**

| Category | Examples | Target % |
|----------|---------|----------|
| Geology/Landform | Cairn, Ridge, Tor, Mesa | 18% |
| Botany/Plant Parts | Bract, Sepal, Radicle, Culm | 15% |
| Water/Wetland | Rill, Tarn, Bayou, Freshet | 12% |
| Architecture (ancient) | Arch, Lintel, Broch, Campanile | 10% |
| Subterranean | Cavern, Grotto, Adit, Crypt | 8% |
| Rock/Mineral | Basalt, Obsidian, Pyrite, Agate | 10% |
| Abstract/Natural Concept | Silence, Vigil, Threshold, Zenith | 10% |
| Atmospheric | Mist, Fog, Squall, Gale | 5% |
| Mycological | Hypha, Mycelium, Cap, Sorus | 5% |
| Animal-adjacent (natural) | Cocoon, Husk, Carapace | 4% |
| Time/Cycle | Aurora, Requiem, Equinox | 3% |

**Implementation:** Tag each word with its category when adding to the bank.
Periodically audit distribution and fill underrepresented categories in 
subsequent expansion batches.

---

## RULE 5: NO MODERN, TECH, OR CULTURALLY SENSITIVE WORDS

**Permanently banned domains:**
- Computing/programming (code, data, server, runtime, async)
- Electronics/electrical (circuit, socket, switch, relay, wired)
- Industrial manufacturing (engine, gantry, scaffold, derrick)
- Modern domestic objects (refrigerator, keyboard, screen)
- Slang or informal English (nice, big, cool as adjective meaning good)
- Brand names or proper nouns (Solaris, Teflon)

**Exercise caution with:**
- Religious terms — architectural religious words are fine (nave, apse, chancel) 
  but doctrinal terms (sacred, blessed, damned) need careful vetting
- Medical terms — clinical words (septic, cystic) are in the bank and work, 
  but avoid terms primarily associated with human disease
- Military terms — fortification words are fine (bastion, rampart, barbican) 
  but weapons (missile, bomb) are banned

**The test:** Would a Victorian field naturalist use this word in a journal 
entry while exploring an alien planet? If yes, it belongs. If no, it doesn't.

---

## RULE 6: DUPLICATE AND NEAR-DUPLICATE PREVENTION

**Hard rule:** No exact duplicates within a bank or across banks.

**Soft rule:** Avoid near-duplicates that add no combinatorial value:
- "Lustred" AND "Lustrous" — keep one (Director chose to keep both, but 
  going forward, don't add more pairs like this)
- "Hollowed" AND "Hollow" — one is verb-form, one is adjective. Both exist. 
  Acceptable but don't add more.

**Implementation:** Before adding any word:
1. Check exact match in both banks
2. Check stem match (see Rule 1)
3. Check Levenshtein distance < 3 against all existing words — flag for review

---

## RULE 7: THE GRANDMOTHER-BOTANIST-TEENAGER TEST

Every word must pass the universal audience test from the directive:

> A player in Tokyo, a grandmother in Kansas, a teenager in Lagos, 
> and a botanist in London all read the same plant name. All four smile.

This means:
- The grandmother doesn't need to know what "Breccia" means — 
  the SOUND of "The Gilded Breccia" should feel right
- The teenager shouldn't find anything cringe or unintentionally funny
- The botanist should never feel the word is misused
- The Tokyo player should encounter no English idiom that doesn't translate

**Words that are obscure are fine.** Words that are WRONG are not.
"Crepuscular" is obscure but precise. "Moistened" is common but off-putting.

---

## APPENDIX: WORD SUBMISSION TEMPLATE

When submitting new words for either bank, use this format:

```
Word: Crepuscular
Bank: NAME_ADJ
Category: Atmospheric
Characters: 11
Definition: Of or relating to twilight
Sample combos: The Crepuscular Cairn, The Crepuscular Bloom, The Crepuscular Fen
Stem: crepuscul-
Cross-bank stem check: No conflicts
Cultural/sensitivity check: Clean
```

This allows batch validation before insertion.
